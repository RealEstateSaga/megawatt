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
const DIRECTION_PATTERN = String.raw`(?:N|S|E|W|NE|NW|SE|SW)`;
const UNIT_PREFIX_PATTERN = String.raw`(?:#|Apt\.?|Apartment|Unit|Ste\.?|Suite|Lot|Fl\.?|Floor|Bldg\.?|Building|Trlr|Trailer|Rm\.?|Room)`;
const UNIT_VALUE_PATTERN = String.raw`(?:#?[A-Za-z0-9-]{1,6})`;

const DIRECTIONAL_TOKENS = new Set(["N", "S", "E", "W", "NE", "NW", "SE", "SW"]);
const UNIT_PREFIX_TOKENS = new Set(
  ["#", "Apt", "Apartment", "Unit", "Ste", "Suite", "Lot", "Fl", "Floor", "Bldg", "Building", "Trlr", "Trailer", "Rm", "Room"].map((token) => token.toUpperCase()),
);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeToken = (token: string) => token.replace(/[^A-Za-z0-9#]/g, "").toUpperCase();

const ADDRESS_SUFFIX_TERMINALS = new Set(
  ADDRESS_SUFFIXES.map((suffix) => normalizeToken(suffix.split(" ").at(-1) ?? suffix)),
);

const statePattern = Object.keys(STATE_MAP)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join("|");

const suffixPattern = ADDRESS_SUFFIXES
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join("|");

const RECORD_END_REGEX = new RegExp(
  `(${statePattern})\\s*(\\d{5})(?:\\s*\\d{4}-\\d{2}-\\d{2})?(?:\\s*Yes)?(?=(?:[A-Z0-9]|$))`,
  "g",
);
const RECORD_STATE_REGEX = new RegExp(`^(.*?)(?:\\s*)(${statePattern})\\s*(\\d{5})$`, "i");
const LEADING_ARTIFACT_REGEX = /^(?:(?:\d{4}-\d{2}-\d{2})\s*|Yes\s*)+/i;
const TRAILING_ARTIFACT_REGEX = /(?:\d{4}-\d{2}-\d{2}|Yes)+$/i;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeState = (value: string) => STATE_MAP[value] ?? value.toUpperCase();

const stripArtifacts = (value: string) =>
  normalizeWhitespace(
    value
      .replace(LEADING_ARTIFACT_REGEX, " ")
      .replace(TRAILING_ARTIFACT_REGEX, " ")
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ")
      .replace(/\bYes\b/gi, " "),
  );

const addAddressBoundarySpacing = (value: string) => {
  const suffixBoundaryRegex = new RegExp(
    `((?:${suffixPattern})(?:\\s+(?:NE|NW|SE|SW|N|S|E|W)\\b)?(?:\\s+(?:(?:${UNIT_PREFIX_PATTERN}\\s*[A-Za-z0-9-]{1,6})|(?:#[A-Za-z0-9-]{1,6})))?)(?=[A-Z])`,
    "g",
  );

  return normalizeWhitespace(
    value
      .replace(/([A-Za-z])(?=\d)/g, "$1 ")
      .replace(/\b(NE|NW|SE|SW)(?=[A-Z])/g, "$1 ")
      .replace(suffixBoundaryRegex, "$1 ")
      .replace(/(County Road\s+\d+[A-Za-z]?)(?=[A-Z])/g, "$1 ")
      .replace(/(PO\s*Box)(?=[A-Z])/gi, "$1 ")
      .replace(/(#[A-Za-z0-9-]{1,6})(?=[A-Z][a-z])/g, "$1 ")
      .replace(/\b([NSEW])(?=[A-Z][a-z])/g, "$1 "),
  );
};

const cleanInput = (text: string) => {
  let cleaned = text.replace(/[\r\n\t]+/g, " ");

  for (const pattern of HEADER_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ");
  }

  cleaned = cleaned
    .replace(/·/g, " ")
    .replace(RECORD_END_REGEX, "$1 $2|||")
    .replace(/(\d{5})(?=\d{4}-\d{2}-\d{2})/g, "$1 ")
    .replace(/(\d{4}-\d{2}-\d{2})(?=[A-Z])/g, "$1 ")
    .replace(/Yes(?=[A-Z])/g, "Yes ");

  return normalizeWhitespace(cleaned);
};

const collectAddressCandidates = (value: string) => {
  const tokens = normalizeWhitespace(value).split(" ").filter(Boolean);
  const candidates: Array<{ owner: string; address: string; city: string; score: number }> = [];

  const isAddressStartToken = (token: string) => /^\d+[A-Za-z]?$/.test(token);
  const isDirectionToken = (token: string) => DIRECTIONAL_TOKENS.has(normalizeToken(token));
  const isUnitPrefixToken = (token: string) => UNIT_PREFIX_TOKENS.has(normalizeToken(token));
  const isStandaloneUnitToken = (token: string) => /^#[A-Za-z0-9-]{1,6}$/.test(token);
  const isUnitValueToken = (token: string) => /^#?[A-Za-z0-9-]{1,6}$/.test(token);
  const isPoToken = (token: string) => normalizeToken(token) === "PO";

  for (let start = 1; start < tokens.length - 1; start += 1) {
    if (!isAddressStartToken(tokens[start])) continue;

    for (let index = start + 1; index < tokens.length; index += 1) {
      const normalized = normalizeToken(tokens[index]);
      let end = -1;

      if (normalized === "BOX" && index > start && isPoToken(tokens[index - 1])) {
        end = index;
      } else if (ADDRESS_SUFFIX_TERMINALS.has(normalized)) {
        end = index;

        if (
          normalized === "ROAD" &&
          index > start &&
          normalizeToken(tokens[index - 1]) === "COUNTY" &&
          isAddressStartToken(tokens[index + 1] ?? "")
        ) {
          end = index + 1;
        }

        if (isDirectionToken(tokens[end + 1] ?? "")) {
          end += 1;
        }

        if (isUnitPrefixToken(tokens[end + 1] ?? "") && isUnitValueToken(tokens[end + 2] ?? "")) {
          end += 2;
        } else if (isStandaloneUnitToken(tokens[end + 1] ?? "")) {
          end += 1;
        }
      }

      if (end < start || end >= tokens.length - 1) continue;

      const owner = stripArtifacts(tokens.slice(0, start).join(" "));
      const address = stripArtifacts(tokens.slice(start, end + 1).join(" "));
      const city = stripArtifacts(tokens.slice(end + 1).join(" "));

      if (!owner || !address || !city || !isValidCity(city)) continue;

      const cityWords = city.split(" ").length;
      const score = start * 10 + end - cityWords * 3 - (owner.length > 80 ? 10 : 0);
      candidates.push({ owner, address, city, score });
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
};

const isValidCity = (value: string) => CITY_PATTERN.test(value) && !/\d/.test(value) && !(value in STATE_MAP);

const makeFallbackRecord = (fragment: string, state: string, zip: string): ParsedRecord => ({
  owner_last_name: stripArtifacts(fragment).slice(0, 120),
  mail_address: "",
  mail_city: "",
  mail_state: state,
  mail_zip: zip,
});

const parseSegment = (prefix: string, state: string, zip: string): ParsedRecord => {
  const segment = addAddressBoundarySpacing(stripArtifacts(prefix));
  const candidates = collectAddressCandidates(segment);
  const best = candidates[0] ?? null;

  if (!best) return makeFallbackRecord(segment, state, zip);

  return {
    owner_last_name: best.owner,
    mail_address: best.address,
    mail_city: best.city,
    mail_state: state,
    mail_zip: zip,
  };
};

const dedupeRecords = (records: ParsedRecord[]) => {
  const byKey = new Map<string, ParsedRecord>();

  for (const record of records) {
    const key = [
      record.owner_last_name.toLowerCase(),
      record.mail_address.toLowerCase(),
      record.mail_city.toLowerCase(),
      record.mail_state,
      record.mail_zip,
    ].join("|");

    if (!byKey.has(key)) byKey.set(key, record);
  }

  return [...byKey.values()];
};

const parseRawText = (text: string) => {
  const cleaned = cleanInput(text);
  if (!cleaned) return [] as ParsedRecord[];

  const records: ParsedRecord[] = [];
  const rows = cleaned
    .split("|||")
    .map((row) => stripArtifacts(row))
    .filter(Boolean);

  for (const row of rows) {
    const match = row.match(RECORD_STATE_REGEX);
    if (!match) {
      if (row.length > 8) records.push(makeFallbackRecord(row, "", ""));
      continue;
    }

    const [, prefix, stateName, zip] = match;
    records.push(parseSegment(prefix, normalizeState(stateName), zip));
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
