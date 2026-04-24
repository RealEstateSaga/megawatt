import type { MailRecord } from "./types";

/**
 * Parse a CSV file that matches our download format:
 * Owner Last Name,Mail Address,Mail City,Mail State,Mail Zip
 */
export function parseCsvRecords(csvText: string): MailRecord[] {
  const records: MailRecord[] = [];
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());

  for (const line of lines) {
    const fields = parseCSVLine(line);
    if (fields.length < 3) continue;

    let ownerLastName = "";
    let mailAddress = "";
    let mailCity = "";
    let mailState = "";
    let mailZip = "";

    if (fields.length >= 5) {
      [ownerLastName, mailAddress, mailCity, mailState, mailZip] = fields;
    } else if (fields.length === 3) {
      ownerLastName = fields[0].trim();
      mailAddress = fields[1].trim();
      const cityStateZip = fields[2].trim();
      const match = cityStateZip.match(/^(.+?)\s+([A-Z]{2})\s+(\d{5})$/);
      if (match) {
        mailCity = match[1];
        mailState = match[2];
        mailZip = match[3];
      } else {
        mailCity = cityStateZip;
      }
    } else {
      continue;
    }

    if (/owner.*last.*name/i.test(ownerLastName)) continue;

    ownerLastName = ownerLastName.trim();
    mailAddress = mailAddress.trim();
    mailCity = mailCity.trim();
    mailState = mailState.trim();
    mailZip = mailZip.trim();

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

  return records;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

export function makeDedupeKey(r: { ownerLastName: string; mailAddress: string; mailZip: string }): string {
  return `${r.ownerLastName.toLowerCase().trim()}|${r.mailAddress.toLowerCase().trim()}|${r.mailZip.trim()}`;
}

export function downloadRecordsCSV(records: MailRecord[]) {
  const header = "Owner Last Name,Mail Address,Mail City,Mail State,Mail Zip";
  const rows = records.map((r) =>
    [r.ownerLastName, r.mailAddress, r.mailCity, r.mailState, r.mailZip]
      .map((v) => `"${(v || "").replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mailing-list-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  return records.length;
}
