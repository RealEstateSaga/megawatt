import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACTION_PROMPT = `You are a precise real estate document parser. You will receive ONE PAGE from a PDF — either an MLS Listing History sheet or a County Tax Information sheet.

YOUR #1 PRIORITY: Extract every data field ACCURATELY. Read the document carefully, character by character. Do not guess, hallucinate, or infer data that is not explicitly printed on the page.

STEP 1 — IDENTIFY DOCUMENT TYPE:
- TAX SHEET indicators: Contains "Owner Name", "Tax Billing", "Mailing Address", "Assessed Value", "Tax Amount", county/parcel info.
- HISTORY SHEET indicators: Contains "Listing History", "MLS#", "Status" columns with dates, "Sale History from Public Records", "Cancelled", "Expired".
- If the page has NO real estate data (blank, cover page, disclaimer), return: {"leads": []}

STEP 2 — LOCATE THE PROPERTY ADDRESS:
- The Property Address is typically at the TOP of the document, often in a header or title area.
- It is the PHYSICAL SITE address of the property (not the mailing/billing address).
- Copy it EXACTLY as printed, including unit numbers, directional prefixes (N, S, E, W), etc.

STEP 3A — TAX SHEET EXTRACTION (if this is a Tax sheet):
Set has_tax_data = true, has_history_data = false.

- owner_last_name: Find the "Owner Name:" field. Extract ONLY the very first word before any space.
  Examples: "Baron William T Trust" → "Baron", "Hajas Robert J & Mary" → "Hajas"

- mail_address: Find "Tax Billing Street" or "Mailing Address" — the STREET address where tax bills are sent.
  Copy EXACTLY as printed. This is often DIFFERENT from the property address.

- mail_city_state_zip: Combine the billing City, State, and Zip into a single string.
  Format: "City ST ZIPCODE" (e.g., "Wayzata MN 55391")

STEP 3B — HISTORY SHEET EXTRACTION (if this is a History sheet):
Set has_tax_data = false, has_history_data = true.
Leave owner_last_name, mail_address, mail_city_state_zip as empty strings.

- off_market_date: Look for rows with status "Cancelled", "Canceled", or "Expired".
  Take the MOST RECENT such date. Format as YYYY-MM-DD.
- last_sale_date: Look in "Sale History from Public Records" for "Sale Date". Most recent, YYYY-MM-DD.
- last_recording_date: Look for "Rec. Date" or "Recording Date". Most recent, YYYY-MM-DD.

STEP 4 — STATUS: Always set to "PENDING" for single-page extraction.

STEP 5 — ANALYSIS: "Awaiting additional documentation for 360-degree view."

CRITICAL RULES:
- NEVER fabricate an address. If you cannot find a clear property address, return {"leads": []}.
- NEVER confuse the mailing/billing address with the property address.
- Dates MUST be in YYYY-MM-DD format.
- Return ONLY valid JSON with NO markdown, NO backticks.

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
}`;

async function extractFromPage(
  base64Page: string,
  fileName: string,
  pageNum: number,
  apiKey: string
): Promise<any[]> {
  const contentParts = [
    { type: "text", text: `${EXTRACTION_PROMPT}\n\nSource: "${fileName}" page ${pageNum}` },
    { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64Page}` } },
  ];

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: contentParts }],
    }),
  });

  if (!response.ok) {
    const status = response.status;
    console.error(`AI error for ${fileName} page ${pageNum}: ${status}`);
    if (status === 429 || status === 402) throw new Error(String(status));
    throw new Error(`AI gateway returned ${status}`);
  }

  const aiResult = await response.json();
  let content = aiResult.choices?.[0]?.message?.content || "";
  content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error(`Failed to parse AI response for ${fileName} page ${pageNum}:`, content);
    return [];
  }

  return (parsed.leads || []).map((l: any) => ({
    id: crypto.randomUUID(),
    address: l.address || "Unknown",
    ownerLastName: l.owner_last_name || "",
    mailingAddress1: l.mail_address || "",
    mailingAddress2: l.mail_city_state_zip || "",
    status: "PENDING",
    analysisReason: "Awaiting additional documentation for 360-degree view.",
    offMarketDate: l.off_market_date || null,
    saleDate: l.last_sale_date || null,
    lastRecordingDate: l.last_recording_date || null,
    hasTaxData: l.has_tax_data === true,
    hasHistoryData: l.has_history_data === true,
    sourceFile: fileName,
    sourcePage: pageNum,
  }));
}

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

    const allLeads: any[] = [];

    for (const f of files) {
      const { name, base64, pageCount } = f as { name: string; base64: string; pageCount?: number };

      if (pageCount && pageCount > 1) {
        // Multi-page: client sent individual pages as separate entries
        // Process this single page
        const leads = await extractFromPage(base64, name, f.pageNum || 1, LOVABLE_API_KEY);
        allLeads.push(...leads);
      } else {
        // Single page or client didn't split — process as whole document
        const leads = await extractFromPage(base64, name, 1, LOVABLE_API_KEY);
        allLeads.push(...leads);
      }
    }

    // Server-side merge: combine leads with same address from different pages
    const mergedByAddress = new Map<string, any>();
    for (const lead of allLeads) {
      const key = lead.address.toLowerCase().replace(/[.,#]/g, "").replace(/\s+/g, " ").trim();
      if (key === "unknown" || !key) continue;

      const existing = mergedByAddress.get(key);
      if (existing) {
        // Merge data from multiple pages of the same property
        existing.ownerLastName = existing.ownerLastName || lead.ownerLastName;
        existing.mailingAddress1 = existing.mailingAddress1 || lead.mailingAddress1;
        existing.mailingAddress2 = existing.mailingAddress2 || lead.mailingAddress2;
        existing.offMarketDate = existing.offMarketDate || lead.offMarketDate;
        existing.saleDate = existing.saleDate || lead.saleDate;
        existing.lastRecordingDate = existing.lastRecordingDate || lead.lastRecordingDate;
        existing.hasTaxData = existing.hasTaxData || lead.hasTaxData;
        existing.hasHistoryData = existing.hasHistoryData || lead.hasHistoryData;

        // Re-evaluate status if we now have both data types
        if (existing.hasTaxData && existing.hasHistoryData) {
          const offDate = existing.offMarketDate ? new Date(existing.offMarketDate) : null;
          const sDate = existing.saleDate ? new Date(existing.saleDate) : null;
          const rDate = existing.lastRecordingDate ? new Date(existing.lastRecordingDate) : null;
          if (offDate && ((rDate && rDate > offDate) || (sDate && sDate > offDate))) {
            existing.status = "BAD";
            existing.analysisReason = `Sale/recording date is after off-market date of ${existing.offMarketDate}`;
          } else {
            existing.status = "GOOD";
            existing.analysisReason = "No sale record found after off-market date";
          }
        }
      } else {
        mergedByAddress.set(key, { ...lead });
      }
    }

    const leads = Array.from(mergedByAddress.values());

    return new Response(JSON.stringify({ leads }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-leads error:", e);
    const status = e instanceof Error && (e.message === "429" || e.message === "402")
      ? parseInt(e.message) : 500;
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
