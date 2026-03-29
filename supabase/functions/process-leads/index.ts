import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
- Copy it EXACTLY as printed.

STEP 3A — TAX SHEET EXTRACTION (if this is a Tax sheet):
Set has_tax_data = true, has_history_data = false.
- owner_last_name: Find the "Owner Name:" field. Extract ONLY the very first word before any space.
- mail_address: Find "Tax Billing Street" or "Mailing Address" — the STREET address where tax bills are sent.
- mail_city_state_zip: Combine billing City, State, and Zip. Format: "City ST ZIPCODE"

STEP 3B — HISTORY SHEET EXTRACTION (if this is a History sheet):
Set has_tax_data = false, has_history_data = true.
Leave owner_last_name, mail_address, mail_city_state_zip as empty strings.
- off_market_date: Most recent "Cancelled"/"Expired" date. Format YYYY-MM-DD.
- last_sale_date: Most recent sale date from "Sale History". YYYY-MM-DD.
- last_recording_date: Most recent recording date. YYYY-MM-DD.

STEP 4 — STATUS: Always "PENDING" for single-page extraction.
STEP 5 — ANALYSIS: "Awaiting additional documentation for 360-degree view."

CRITICAL RULES:
- NEVER fabricate an address. If no clear property address, return {"leads": []}.
- NEVER confuse mailing/billing address with property address.
- Dates MUST be YYYY-MM-DD. Return ONLY valid JSON, NO markdown, NO backticks.

{"leads": [{"address": "239 Byrondale Ave", "owner_last_name": "Baron", "mail_address": "456 Oak Ave", "mail_city_state_zip": "Wayzata MN 55391", "off_market_date": null, "last_sale_date": null, "last_recording_date": null, "status": "PENDING", "analysis_reason": "Awaiting additional documentation for 360-degree view.", "has_tax_data": true, "has_history_data": false}]}`;

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function extractFromPage(
  base64: string,
  fileName: string,
  pageNum: number,
  apiKey: string
): Promise<any[]> {
  const contentParts = [
    { type: "text", text: `${EXTRACTION_PROMPT}\n\nSource: "${fileName}" page ${pageNum}` },
    { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
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
    const text = await response.text();
    console.error(`AI error for ${fileName} p${pageNum}: ${status} ${text}`);
    if (status === 429 || status === 402) throw new Error(String(status));
    throw new Error(`AI gateway returned ${status}`);
  }

  const aiResult = await response.json();
  let content = aiResult.choices?.[0]?.message?.content || "";
  content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    const parsed = JSON.parse(content);
    return parsed.leads || [];
  } catch {
    console.error(`Failed to parse AI response for ${fileName} p${pageNum}:`, content);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { files, job_file_id } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return new Response(JSON.stringify({ error: "No files provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = getSupabaseClient();
    const allLeads: any[] = [];

    for (const f of files) {
      const { name, base64, pageNum, totalPages } = f;
      const currentPage = pageNum || 1;

      try {
        const rawLeads = await extractFromPage(base64, name, currentPage, LOVABLE_API_KEY);

        // Log each page result
        if (job_file_id) {
          await supabase.from("processing_logs").insert({
            job_file_id,
            page_number: currentPage,
            status: rawLeads.length > 0 ? "success" : "empty",
            extracted_data: rawLeads.length > 0 ? rawLeads : null,
            source_address: rawLeads[0]?.address || null,
          });

          // Update processed pages count
          await supabase.from("job_files").update({
            processed_pages: currentPage,
            updated_at: new Date().toISOString(),
          }).eq("id", job_file_id);
        }

        for (const l of rawLeads) {
          allLeads.push({
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
            sourceFile: name,
            sourcePage: currentPage,
          });
        }
      } catch (pageErr) {
        console.error(`Error processing ${name} page ${currentPage}:`, pageErr);
        
        // Log the failure
        if (job_file_id) {
          await supabase.from("processing_logs").insert({
            job_file_id,
            page_number: currentPage,
            status: "failed",
            error_message: pageErr instanceof Error ? pageErr.message : "Unknown error",
          });
        }

        // Re-throw rate limit / payment errors
        if (pageErr instanceof Error && (pageErr.message === "429" || pageErr.message === "402")) {
          throw pageErr;
        }
        // Otherwise continue processing remaining pages
      }
    }

    // Merge leads with the same address from different pages
    const mergedByAddress = new Map<string, any>();
    for (const lead of allLeads) {
      const key = lead.address.toLowerCase().replace(/[.,#]/g, "").replace(/\s+/g, " ").trim();
      if (key === "unknown" || !key) continue;

      const existing = mergedByAddress.get(key);
      if (existing) {
        // Pick the longest/most-complete value for each field to avoid data loss
        const pickBest = (a: string, b: string) => {
          if (!a) return b;
          if (!b) return a;
          return a.length >= b.length ? a : b;
        };
        existing.ownerLastName = pickBest(existing.ownerLastName, lead.ownerLastName);
        existing.mailingAddress1 = pickBest(existing.mailingAddress1, lead.mailingAddress1);
        existing.mailingAddress2 = pickBest(existing.mailingAddress2, lead.mailingAddress2);
        existing.offMarketDate = existing.offMarketDate || lead.offMarketDate;
        existing.saleDate = existing.saleDate || lead.saleDate;
        existing.lastRecordingDate = existing.lastRecordingDate || lead.lastRecordingDate;
        existing.hasTaxData = existing.hasTaxData || lead.hasTaxData;
        existing.hasHistoryData = existing.hasHistoryData || lead.hasHistoryData;

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

    // Update job_file status
    if (job_file_id) {
      const leads = Array.from(mergedByAddress.values());
      await supabase.from("job_files").update({
        status: "completed",
        leads_found: leads.length,
        updated_at: new Date().toISOString(),
      }).eq("id", job_file_id);
    }

    return new Response(JSON.stringify({ leads: Array.from(mergedByAddress.values()) }), {
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
