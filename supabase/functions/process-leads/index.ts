import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { files } = await req.json();
    if (!files || !Array.isArray(files) || files.length === 0) {
      return new Response(JSON.stringify({ error: "No files provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contentParts: any[] = files.map((f: { name: string; base64: string }) => ({
      type: "image_url" as const,
      image_url: { url: `data:application/pdf;base64,${f.base64}` },
    }));

    contentParts.unshift({
      type: "text",
      text: `You are a real estate lead validation AI. You will receive MLS Listing History PDFs and County Tax Information PDFs.

ADDRESS MAPPING:
- Identify the Property Address at the top of every file.
- Use fuzzy matching to link Tax and History sheets for the same property (e.g. "Rd" = "Road", "St" = "Street", "Ave" = "Avenue").

TAX SHEET EXTRACTION:
- owner_last_name: Locate "Owner Name:" field. Extract ONLY the very first word (e.g. "Baron William T Trust" → "Baron").
- mailing_address_1: Extract the "Tax Billing Street" address.
- mailing_address_2: Combine "Tax Billing City & State" and "Tax Billing Zip" into one string (e.g. "Wayzata MN 55391").

HISTORY SHEET EXTRACTION:
- off_market_date: The most recent Cancelled or Expired date from MLS listing history (format YYYY-MM-DD or null).
- sale_date: The most recent "Public Record Sale/Rec" date from the Sale History section (format YYYY-MM-DD or null).

THE GOLDEN RULE:
- If sale_date exists AND sale_date > off_market_date → status = "BAD - SOLD"
- If sale_date <= off_market_date OR no sale found → status = "GOOD - PROSPECT"

Provide a brief analysis_reason explaining the determination.

Respond with ONLY valid JSON (no markdown):
{
  "leads": [
    {
      "address": "123 Main St",
      "owner_last_name": "Smith",
      "mailing_address_1": "456 Oak Ave",
      "mailing_address_2": "Minneapolis MN 55401",
      "off_market_date": "2024-03-15",
      "sale_date": null,
      "status": "GOOD - PROSPECT",
      "analysis_reason": "No sale record found after off-market date"
    }
  ]
}`,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: contentParts }],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiResult = await response.json();
    let content = aiResult.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "AI returned invalid data", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const leads = (parsed.leads || []).map((l: any) => ({
      id: crypto.randomUUID(),
      address: l.address || "Unknown",
      ownerLastName: l.owner_last_name || "Unknown",
      mailingAddress1: l.mailing_address_1 || "",
      mailingAddress2: l.mailing_address_2 || "",
      status: l.status === "BAD - SOLD" ? "BAD - SOLD" : "GOOD - PROSPECT",
      analysisReason: l.analysis_reason || "",
      offMarketDate: l.off_market_date || null,
      saleDate: l.sale_date || null,
    }));

    return new Response(JSON.stringify({ leads }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-leads error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
