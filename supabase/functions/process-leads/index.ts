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
- If multiple entries resolve to the same property, keep only the most recent data (deduplicate).

TAX SHEET EXTRACTION:
- owner_last_name: Locate "Owner Name:" field. Extract ONLY the very first word (e.g. "Baron William T Trust" → "Baron").
- mail_address: Extract the "Tax Billing Street" / "Mailing Address" field.
- mail_city_state_zip: Combine "Tax Billing City & State" and "Tax Billing Zip" into one string (e.g. "Tavernier FL 33070" or "Wayzata MN 55391").

HISTORY SHEET EXTRACTION:
- off_market_date: The most recent Cancelled or Expired date from MLS listing history (format YYYY-MM-DD or null).
- last_sale_date: The most recent "Sale Date" from the "Sale History from Public Records" section (format YYYY-MM-DD or null).
- last_recording_date: The most recent "Rec. Date" from the "Sale History from Public Records" section (format YYYY-MM-DD or null).

THE GOLDEN RULE:
- Compare off_market_date against BOTH last_sale_date and last_recording_date.
- If last_recording_date > off_market_date → status = "BAD"
- If last_sale_date > off_market_date → status = "BAD"
- Otherwise (both dates are older than off_market_date, or no recent sale found) → status = "GOOD"

IMPORTANT EXAMPLES:
- 239 Byrondale: off_market 2026-02-24, recording 2026-03-17 → BAD (recording is after off-market)
- 17950 Breezy Point: off_market 2026-02-19, last sale 1998-08-14, recording 1998-09-29 → GOOD (decades older)

Provide a brief analysis_reason explaining the determination.

Respond with ONLY valid JSON (no markdown):
{
  "leads": [
    {
      "address": "123 Main St",
      "owner_last_name": "Smith",
      "mail_address": "456 Oak Ave",
      "mail_city_state_zip": "Minneapolis MN 55401",
      "off_market_date": "2024-03-15",
      "last_sale_date": null,
      "last_recording_date": null,
      "status": "GOOD",
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
        model: "google/gemini-3-flash-preview",
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
      mailingAddress1: l.mail_address || "",
      mailingAddress2: l.mail_city_state_zip || "",
      status: l.status === "BAD" ? "BAD" : "GOOD",
      analysisReason: l.analysis_reason || "",
      offMarketDate: l.off_market_date || null,
      saleDate: l.last_sale_date || null,
      lastRecordingDate: l.last_recording_date || null,
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
