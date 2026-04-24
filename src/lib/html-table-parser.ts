import type { MailRecord } from "./types";

const STATE_MAP: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI",
  Wyoming: "WY",
};

const HEADER_KEYWORDS = [
  "owner", "last name", "mail address", "city", "state", "zip", "recording",
  "corporation", "results", "criteria", "checked", "display",
];

function isHeaderRow(cells: string[]): boolean {
  const joined = cells.join(" ").toLowerCase();
  return HEADER_KEYWORDS.filter((kw) => joined.includes(kw)).length >= 2;
}

function normalizeState(state: string): string {
  const trimmed = state.trim();
  if (STATE_MAP[trimmed]) return STATE_MAP[trimmed];
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;
  return trimmed;
}

export function parseHtmlTable(html: string): MailRecord[] | null {
  if (!/<table[\s>]/i.test(html)) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table");
  if (tables.length === 0) return null;

  let bestTable = tables[0];
  for (const t of tables) {
    if (t.rows.length > bestTable.rows.length) bestTable = t;
  }

  const rows = Array.from(bestTable.rows);
  if (rows.length < 2) return null;

  const allCellSets = rows.map((row) =>
    Array.from(row.cells).map((cell) => cell.textContent?.trim() || "")
  );

  let headerIdx = -1;
  for (let i = 0; i < Math.min(3, allCellSets.length); i++) {
    if (isHeaderRow(allCellSets[i])) {
      headerIdx = i;
      break;
    }
  }

  let colMap: { name: number; address: number; city: number; state: number; zip: number } | null = null;

  if (headerIdx >= 0) {
    const headers = allCellSets[headerIdx].map((h) => h.toLowerCase());
    const findCol = (keywordSets: string[][]) => {
      for (const keywords of keywordSets) {
        const idx = headers.findIndex((h) => keywords.every((kw) => h.includes(kw)));
        if (idx >= 0) return idx;
      }
      return -1;
    };

    const nameCol = findCol([["last name"], ["owner name"], ["owner"]]);
    const addrCol = findCol([["mail address"], ["mailing address"], ["address"]]);
    const cityCol = findCol([["city"]]);
    const stateCol = findCol([["state"]]);
    const zipCol = findCol([["zip"], ["postal"]]);

    if (nameCol >= 0 && addrCol >= 0) {
      colMap = { name: nameCol, address: addrCol, city: cityCol, state: stateCol, zip: zipCol };
    }
  }

  if (!colMap && allCellSets.length > 0) {
    const sampleRow = allCellSets[headerIdx >= 0 ? headerIdx + 1 : 0] || allCellSets[0];
    for (let i = 0; i < sampleRow.length; i++) {
      if (STATE_MAP[sampleRow[i]] || /^[A-Z]{2}$/.test(sampleRow[i])) {
        const stateCol = i;
        const cityCol = i - 1;
        const addrCol = i - 2;
        const nameCol = i - 3 >= 0 ? i - 3 : i - 2;
        const zipCol = i + 1 < sampleRow.length ? i + 1 : -1;
        if (addrCol >= 0 && nameCol >= 0) {
          colMap = { name: nameCol, address: addrCol, city: cityCol, state: stateCol, zip: zipCol };
          break;
        }
      }
    }
  }

  if (!colMap) return null;

  const records: MailRecord[] = [];
  const startIdx = headerIdx >= 0 ? headerIdx + 1 : 0;

  for (let i = startIdx; i < allCellSets.length; i++) {
    const cells = allCellSets[i];
    if (cells.length < 3) continue;
    if (isHeaderRow(cells)) continue;

    const ownerLastName = (cells[colMap.name] || "").trim();
    const mailAddress = (cells[colMap.address] || "").trim();
    const mailCity = colMap.city >= 0 ? (cells[colMap.city] || "").trim() : "";
    const mailState = colMap.state >= 0 ? normalizeState(cells[colMap.state] || "") : "";
    const mailZip = colMap.zip >= 0 ? (cells[colMap.zip] || "").replace(/-\d{4}$/, "").trim() : "";

    if (!ownerLastName && !mailAddress) continue;

    records.push({
      id: crypto.randomUUID(),
      ownerLastName,
      mailAddress,
      mailCity,
      mailState,
      mailZip,
    });
  }

  return records.length > 0 ? records : null;
}
