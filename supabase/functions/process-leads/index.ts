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
      text: `You are a precise real estate document parser. You will receive ONE PDF at a time — either an MLS Listing History sheet or a County Tax Information sheet.

YOUR #1 PRIORITY: Extract every data field ACCURATELY. Read the document carefully, character by character. Do not guess, hallucinate, or infer data that is not explicitly printed on the page.

STEP 1 — IDENTIFY DOCUMENT TYPE:
- TAX SHEET indicators: Contains "Owner Name", "Tax Billing", "Mailing Address", "Assessed Value", "Tax Amount", county/parcel info.
- HISTORY SHEET indicators: Contains "Listing History", "MLS#", "Status" columns with dates, "Sale History from Public Records", "Cancelled", "Expired".

STEP 2 — LOCATE THE PROPERTY ADDRESS:
- The Property Address is typically at the TOP of the document, often in a header or title area.
- It is the PHYSICAL SITE address of the property (not the mailing/billing address).
- Copy it EXACTLY as printed, including unit numbers, directional prefixes (N, S, E, W), etc.
- Examples: "239 Byrondale Ave", "17950 Breezy Point Dr", "1420 W Lake St Unit 204"

STEP 3A — TAX SHEET EXTRACTION (if this is a Tax sheet):
Set has_tax_data = true, has_history_data = false.

- owner_last_name: Find the "Owner Name:" field. Extract ONLY the very first word before any space.
  Examples:
    "Baron William T Trust" → "Baron"
    "Hajas Robert J & Mary" → "Hajas"
    "Smith-Jones Patricia" → "Smith-Jones"
    "The Johnson Family LLC" → "The" (extract first word literally)
  
- mail_address: Find "Tax Billing Street" or "Mailing Address" — this is the STREET address where tax bills are sent.
  Copy EXACTLY as printed. This is often DIFFERENT from the property address.

- mail_city_state_zip: Combine the billing City, State, and Zip into a single string.
  Format: "City ST ZIPCODE" (e.g., "Wayzata MN 55391", "Tavernier FL 33070")
  If City/State/Zip are in separate fields, combine them. If already combined, copy as-is.

STEP 3B — HISTORY SHEET EXTRACTION (if this is a History sheet):
Set has_tax_data = false, has_history_data = true.
Leave owner_last_name, mail_address, mail_city_state_zip as empty strings.

- off_market_date: Look in the MLS Listing History table for rows with status "Cancelled", "Canceled", or "Expired".
  Take the MOST RECENT such date. Format as YYYY-MM-DD.
  Common date formats on sheets: "02/24/2026" → "2026-02-24", "Feb 24, 2026" → "2026-02-24"
  If no cancelled/expired listing exists, set to null.

- last_sale_date: Look in "Sale History from Public Records" section for the "Sale Date" column.
  Take the MOST RECENT sale date. Format as YYYY-MM-DD. If none found, set to null.

- last_recording_date: Look in "Sale History from Public Records" section for the "Rec. Date" or "Recording Date" column.
  Take the MOST RECENT recording date. Format as YYYY-MM-DD. If none found, set to null.

STEP 4 — STATUS DETERMINATION:
- If BOTH has_tax_data AND has_history_data are true (rare for single PDF, but possible):
  Apply the Golden Rule:
    BAD if last_recording_date > off_market_date
    BAD if last_sale_date > off_market_date
    GOOD otherwise
- If only ONE document type: status = "PENDING"

STEP 5 — ANALYSIS REASON:
- GOOD: "No sale/recording after off-market date [off_market_date]"
- BAD: "Recording [last_recording_date] or sale [last_sale_date] occurred after off-market [off_market_date]"
- PENDING: "Awaiting additional documentation for 360-degree view."

CRITICAL RULES:
- NEVER fabricate an address. If you cannot find a clear property address, return an empty leads array.
- NEVER confuse the mailing/billing address with the property address.
- Dates MUST be in YYYY-MM-DD format. Convert from any format you see on the document.
- Return ONLY valid JSON with NO markdown formatting, NO backticks, NO explanation text.

{
  "leads": [
    {
      "address": "239 Byrondale Ave",
      "owner_last_name": "Baron",
      "mail_address": "456 Oak Ave",
      "mail_city_state_zip": "Wayzata MN 55391",
      "off_market_date": null,
      "last_sale_date": null,
      "last_recording_date": null,
      "status": "PENDING",
      "analysis_reason": "Awaiting additional documentation for 360-degree view.",
      "has_tax_data": true,
      "has_history_data": false
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

    const leads = (parsed.leads || []).map((l: any) => {
      const hasTax = l.has_tax_data === true;
      const hasHistory = l.has_history_data === true;
      let status: string;
      if (hasTax && hasHistory) {
        status = l.status === "BAD" ? "BAD" : "GOOD";
      } else {
        status = "PENDING";
      }
      return {
        id: crypto.randomUUID(),
        address: l.address || "Unknown",
        ownerLastName: l.owner_last_name || "",
        mailingAddress1: l.mail_address || "",
        mailingAddress2: l.mail_city_state_zip || "",
        status,
        analysisReason: status === "PENDING" 
          ? "Awaiting additional documentation for 360-degree view." 
          : (l.analysis_reason || ""),
        offMarketDate: l.off_market_date || null,
        saleDate: l.last_sale_date || null,
        lastRecordingDate: l.last_recording_date || null,
        hasTaxData: hasTax,
        hasHistoryData: hasHistory,
      };
    });

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
