import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a precise data parser for real estate mailing lists. You receive raw pasted text from a tax record website.

Your job: Extract each unique person/entity row into structured records with these fields:
- owner_last_name: The last name (first word of the owner name field). For corporations/LLCs, use the full entity name.
- mail_address: The full street mailing address.
- mail_city: City name.
- mail_state: Two-letter state abbreviation (e.g., MN, AZ, CA). Always convert full state names.
- mail_zip: 5-digit zip code.

RULES:
1. IGNORE any dates (Recording Date, etc.) — do not include them.
2. IGNORE any "Yes" values — those are corporation flags for reference only.
3. REMOVE EXACT DUPLICATES: If the same owner name + same mailing address appear multiple times, keep only ONE.
4. Mark each record as "Pass" if you are confident the data is complete and correct (has a clear last name, valid address, city, state, zip).
5. Mark as "Fail" if the data is incomplete, garbled, has suspicious characters, or you cannot confidently parse it. When in doubt, FAIL it — a wrong mailing label costs $1.
6. Return ONLY valid JSON, no markdown, no backticks.

Output format:
{"records": [{"owner_last_name": "Porter", "mail_address": "5036 N 189th Glen", "mail_city": "Litchfield Park", "mail_state": "AZ", "mail_zip": "85340", "status": "Pass"}, ...]}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Split into chunks of ~4000 chars to avoid token limits
    const chunks: string[] = [];
    const lines = text.split("\n").filter(l => l.trim());
    let current = "";
    for (const line of lines) {
      if ((current + "\n" + line).length > 4000 && current.length > 0) {
        chunks.push(current);
        current = line;
      } else {
        current = current ? current + "\n" + line : line;
      }
    }
    if (current) chunks.push(current);

    // If only one chunk (common case), just send as-is
    if (chunks.length === 0) chunks.push(text);

    const allRecords: any[] = [];

    for (const chunk of chunks) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Parse the following pasted data:\n\n${chunk}` },
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        const errText = await response.text();
        console.error(`AI error: ${status} ${errText}`);
        if (status === 429 || status === 402) {
          return new Response(JSON.stringify({ error: status === 429 ? "Rate limited, try again shortly" : "Credits exhausted" }), {
            status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway returned ${status}`);
      }

      const aiResult = await response.json();
      let content = aiResult.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      try {
        const parsed = JSON.parse(content);
        if (parsed.records) allRecords.push(...parsed.records);
      } catch {
        console.error("Failed to parse AI response:", content.substring(0, 200));
      }
    }

    // Deduplicate across chunks
    const seen = new Set<string>();
    const unique = allRecords.filter(r => {
      const key = `${(r.owner_last_name || "").toLowerCase()}|${(r.mail_address || "").toLowerCase()}|${(r.mail_zip || "")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return new Response(JSON.stringify({ records: unique }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-text error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
