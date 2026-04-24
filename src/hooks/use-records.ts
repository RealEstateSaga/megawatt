import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { MailRecord } from "@/lib/types";
import { makeDedupeKey } from "@/lib/csv-utils";

function toMailRecord(row: any): MailRecord {
  return {
    id: row.id,
    ownerLastName: row.owner_last_name || "",
    mailAddress: row.mailing_address_1 || "",
    mailCity: "",
    mailState: "",
    mailZip: "",
    status: row.status === "GOOD" || row.status === "Pass" ? "Pass" : "Fail",
    list: row.list === "completed" ? "completed" : "new",
  };
}

function parseAddress2(addr2: string | null): { city: string; state: string; zip: string } {
  if (!addr2) return { city: "", state: "", zip: "" };
  const match = addr2.trim().match(/^(.+?),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  if (match) return { city: match[1].replace(/,\s*$/, ""), state: match[2], zip: match[3] };
  return { city: addr2, state: "", zip: "" };
}

export interface AddResult {
  inserted: number;
  duplicates: number;
  duplicateKeys: string[];
}

export function useRecords() {
  const [records, setRecords] = useState<MailRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let allRows: any[] = [];
        let from = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("leads")
            .select("id, owner_last_name, mailing_address_1, mailing_address_2, status, list, address_key")
            .range(from, from + pageSize - 1);

          if (error) throw error;
          if (data) allRows = [...allRows, ...data];
          hasMore = (data?.length || 0) === pageSize;
          from += pageSize;
        }

        const mapped = allRows.map((row) => {
          const { city, state, zip } = parseAddress2(row.mailing_address_2);
          const rec = toMailRecord(row);
          rec.mailCity = city;
          rec.mailState = state;
          rec.mailZip = zip;
          return rec;
        });

        setRecords(mapped);
      } catch (e: any) {
        console.error("Failed to load records", e);
        toast.error("Failed to load records from database");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addRecords = useCallback(async (newRecs: MailRecord[]): Promise<AddResult> => {
    // Client-side dedupe within this batch
    const seen = new Set<string>();
    const unique: MailRecord[] = [];
    const batchDupes: string[] = [];
    for (const r of newRecs) {
      const k = makeDedupeKey(r);
      if (seen.has(k)) {
        batchDupes.push(k);
        continue;
      }
      seen.add(k);
      unique.push(r);
    }

    if (unique.length === 0) {
      return { inserted: 0, duplicates: batchDupes.length, duplicateKeys: batchDupes };
    }

    const rows = unique.map((r) => ({
      address: r.mailAddress || "N/A",
      address_key: makeDedupeKey(r),
      owner_last_name: r.ownerLastName,
      mailing_address_1: r.mailAddress,
      mailing_address_2: [r.mailCity, r.mailState, r.mailZip].filter(Boolean).join(", "),
      status: r.status === "Pass" ? "GOOD" : "BAD",
      list: r.list,
    }));

    // Upsert with ignoreDuplicates → DB enforces uniqueness on address_key.
    // Returned data only contains rows that were actually inserted.
    const { data, error } = await supabase
      .from("leads")
      .upsert(rows, { onConflict: "address_key", ignoreDuplicates: true })
      .select("id, address_key, owner_last_name, mailing_address_1, mailing_address_2, status, list");

    if (error) {
      console.error("Failed to save records", error);
      toast.error(`Database error: ${error.message}`);
      return { inserted: 0, duplicates: batchDupes.length, duplicateKeys: batchDupes };
    }

    const insertedRows = data || [];
    const insertedKeys = new Set(insertedRows.map((r: any) => r.address_key));
    const dbDupes = unique.filter((r) => !insertedKeys.has(makeDedupeKey(r))).map((r) => makeDedupeKey(r));

    // Map inserted DB rows back to MailRecord with parsed city/state/zip
    const savedRecs: MailRecord[] = insertedRows.map((row: any) => {
      const { city, state, zip } = parseAddress2(row.mailing_address_2);
      const rec = toMailRecord(row);
      rec.mailCity = city;
      rec.mailState = state;
      rec.mailZip = zip;
      return rec;
    });

    setRecords((prev) => [...prev, ...savedRecs]);

    return {
      inserted: savedRecs.length,
      duplicates: batchDupes.length + dbDupes.length,
      duplicateKeys: [...batchDupes, ...dbDupes],
    };
  }, []);

  const moveRecords = useCallback(async (ids: Set<string>, targetList: "new" | "completed") => {
    const idArray = Array.from(ids);
    for (let i = 0; i < idArray.length; i += 100) {
      const chunk = idArray.slice(i, i + 100);
      const { error } = await supabase
        .from("leads")
        .update({ list: targetList } as any)
        .in("id", chunk);
      if (error) console.error("Failed to update records", error);
    }

    setRecords((prev) =>
      prev.map((r) => (ids.has(r.id) ? { ...r, list: targetList } : r))
    );
  }, []);

  const deleteRecords = useCallback(async (ids: Set<string>) => {
    const idArray = Array.from(ids);
    if (idArray.length === 0) return 0;

    for (let i = 0; i < idArray.length; i += 100) {
      const chunk = idArray.slice(i, i + 100);
      const { error } = await supabase.from("leads").delete().in("id", chunk);
      if (error) {
        console.error("Failed to delete records", error);
        toast.error(`Delete failed: ${error.message}`);
        return 0;
      }
    }

    setRecords((prev) => prev.filter((r) => !ids.has(r.id)));
    return idArray.length;
  }, []);

  return { records, loading, addRecords, moveRecords, deleteRecords };
}
