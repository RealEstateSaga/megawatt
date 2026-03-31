import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ParsedRecord = {
  owner_last_name: string;
  mail_address: string;
  mail_city: string;
  mail_state: string;
  mail_zip: string;
  status: "Pass" | "Fail";
};

const STATE_MAP: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  AL: "AL",
  AK: "AK",
  AZ: "AZ",
  AR: "AR",
  CA: "CA",
  CO: "CO",
  CT: "CT",
  DE: "DE",
  FL: "FL",
  GA: "GA",
  HI: "HI",
  ID: "ID",
  IL: "IL",
  IN: "IN",
  IA: "IA",
  KS: "KS",
  KY: "KY",
  LA: "LA",
  ME: "ME",
  MD: "MD",
  MA: "MA",
  MI: "MI",
  MN: "MN",
  MS: "MS",
  MO: "MO",
  MT: "MT",
  NE: "NE",
  NV: "NV",
  NH: "NH",
  NJ: "NJ",
  NM: "NM",
  NY: "NY",
  NC: "NC",
  ND: "ND",
  OH: "OH",
  OK: "OK",
  OR: "OR",
  PA: "PA",
  RI: "RI",
  SC: "SC",
  SD: "SD",
  TN: "TN",
  TX: "TX",
  UT: "UT",
  VT: "VT",
  VA: "VA",
  WA: "WA",
  WV: "WV",
  WI: "WI",
  WY: "WY",
};

const ADDRESS_SUFFIXES = [
  "Boulevard",
  "Highway",
  "Parkway",
  "Terrace",
  "Avenue",
  "Street",
  "County Road",
  "Drive",
  "Lane",
  "Court",
  "Circle",
  "Trail",
  "Point",
  "Place",
  "Ridge",
  "Way",
  "Road",
  "Loop",
  "Path",
  "Cove",
  "Run",
  "Box",
  "Blvd",
  "Hwy",
  "Pkwy",
  "Ave",
  "St",
  "Dr",
  "Ln",
  "Ct",
  "Cir",
  "Trl",
  "Pl",
  "Rd",
];

const HEADER_PATTERNS = [
  /Results/gi,
  /Map/gi,
  /Criteria/gi,
  /PreviousNext/gi,
  /Checked\s*0All\s*·\s*None\s*·\s*Page/gi,
  /Display Tax Grid 360 Property View at 10 25 50 100 per page/gi,
  /Owner 1 Last Name/gi,
  /Owner Mail Address/gi,
  /Mail City Name/gi,
  /Mail State/gi,
  /Taxpayer Zip/gi,
  /Recording Date/gi,
  /Owner Is Corporation/gi,
];

const CITY_PATTERN = /^[A-Za-z][A-Za-z'.-]*(?:\s+[A-Za-z][A-Za-z'.-]*){0,4}$/;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const statePattern = Object.keys(STATE_MAP)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join("|");

const suffixPattern = ADDRESS_SUFFIXES
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join("|");

const ADDRESS_WORD = String.raw`(?:[A-Za-z][A-Za-z'./-]*|\d+(?:st|nd|rd|th)?|#?[A-Za-z0-9-]+)`;
const STANDARD_ADDRESS_REGEX = new RegExp(
  String.raw`\d+[A-Za-z]?(?:\s+(?:${ADDRESS_WORD})){0,6}\s+(?:${suffixPattern})(?:\s+(?:${ADDRESS_WORD}|N|S|E|W|NE|NW|SE|SW)){0,3}`,
  "gi",
);
const PO_BOX_REGEX = /\d+\s+P\.?\s*O\.?\s+Box(?:\s+(?:#?[A-Za-z0-9-]+))?/gi;
const STATE_REGEX = new RegExp(`(${statePattern})(\\s*)(\\d{5})`, "gi");

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeState = (value: string) => STATE_MAP[value] ?? value.toUpperCase();

const cleanInput = (text: string) => {
  let cleaned = text.replace(/[\r\n\t]+/g, " ");

  for (const pattern of HEADER_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ");
  }

  cleaned = cleaned
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ")
    .replace(/\bYes\b/gi, " ")
    .replace(/(\d{5})(?=[A-Z])/g, "$1 ");

  return normalizeWhitespace(cleaned);
};

const collectAddressCandidates = (value: string) => {
  const candidates: Array<{ start: number; end: number; text: string }> = [];
  const seen = new Set<string>();

  for (const regex of [PO_BOX_REGEX, STANDARD_ADDRESS_REGEX]) {
    regex.lastIndex = 0;
    for (const match of value.matchAll(regex)) {
      const text = normalizeWhitespace(match[0]);
      const start = match.index ?? -1;
      const end = start + match[0].length;
      const key = `${start}-${end}-${text}`;
      if (start > 0 && !seen.has(key)) {
        seen.add(key);
        candidates.push({ start, end, text });
      }
    }
  }

  return candidates.sort((a, b) => a.start - b.start);
};

const isValidCity = (value: string) => CITY_PATTERN.test(value) && !/\d/.test(value) && !(value in STATE_MAP);

const makeFailRecord = (fragment: string, state: string, zip: string): ParsedRecord => ({
  owner_last_name: normalizeWhitespace(fragment).slice(0, 120),
  mail_address: "",
  mail_city: "",
  mail_state: state,
  mail_zip: zip,
  status: "Fail",
});

const parseSegment = (prefix: string, state: string, zip: string): ParsedRecord => {
  const segment = normalizeWhitespace(prefix);
  const candidates = collectAddressCandidates(segment);
  let best:
    | {
        owner: string;
        address: string;
        city: string;
        score: number;
      }
    | null = null;

  for (const candidate of candidates) {
    const owner = normalizeWhitespace(segment.slice(0, candidate.start));
    const city = normalizeWhitespace(segment.slice(candidate.end));
    if (!owner || !candidate.text || !city || !isValidCity(city)) continue;

    const cityWords = city.split(" ").length;
    const score = candidate.start * 2 - cityWords * 5 - (owner.length > 80 ? 10 : 0);

    if (!best || score >= best.score) {
      best = { owner, address: candidate.text, city, score };
    }
  }

  if (!best) return makeFailRecord(segment, state, zip);

  return {
    owner_last_name: best.owner,
    mail_address: best.address,
    mail_city: best.city,
    mail_state: state,
    mail_zip: zip,
    status: "Pass",
  };
};

const dedupeRecords = (records: ParsedRecord[]) => {
  const seen = new Set<string>();

  return records.filter((record) => {
    const key = [
      record.owner_last_name.toLowerCase(),
      record.mail_address.toLowerCase(),
      record.mail_city.toLowerCase(),
      record.mail_state,
      record.mail_zip,
      record.status,
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const parseRawText = (text: string) => {
  const cleaned = cleanInput(text);
  if (!cleaned) return [] as ParsedRecord[];

  const records: ParsedRecord[] = [];
  let cursor = 0;

  for (const match of cleaned.matchAll(STATE_REGEX)) {
    const stateName = match[1];
    const zip = match[3];
    const stateStart = match.index ?? 0;
    const recordEnd = stateStart + match[0].length;
    const prefix = cleaned.slice(cursor, stateStart).trim();

    if (prefix) {
      records.push(parseSegment(prefix, normalizeState(stateName), zip));
    }

    cursor = recordEnd;
  }

  const leftover = normalizeWhitespace(cleaned.slice(cursor));
  if (leftover.length > 8) {
    records.push({
      owner_last_name: leftover.slice(0, 120),
      mail_address: "",
      mail_city: "",
      mail_state: "",
      mail_zip: "",
      status: "Fail",
    });
  }

  return dedupeRecords(records);
};

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

    const unique = parseRawText(text);

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
