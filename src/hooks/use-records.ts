import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { MailRecord } from "@/lib/types";

function toMailRecord(row: any): MailRecord {
  return {
    id: row.id,
    ownerLastName: row.owner_last_name || "",
    mailAddress: row.mailing_address_1 || "",
    mailCity: "", // parsed from mailing_address_2
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

export function useRecords() {
  const [records, setRecords] = useState<MailRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from DB on mount
  useEffect(() => {
    (async () => {
      try {
        // Fetch all leads - handle pagination for >1000 rows
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

  const addRecords = useCallback(async (newRecs: MailRecord[]) => {
    // Insert into DB
    const rows = newRecs.map((r) => ({
      address: r.mailAddress || "N/A",
      address_key: `${r.ownerLastName.toLowerCase().trim()}|${r.mailAddress.toLowerCase().trim()}|${r.mailZip.trim()}`,
      owner_last_name: r.ownerLastName,
      mailing_address_1: r.mailAddress,
      mailing_address_2: [r.mailCity, r.mailState, r.mailZip].filter(Boolean).join(", "),
      status: r.status === "Pass" ? "GOOD" : "BAD",
      list: r.list,
    }));

    const { data, error } = await supabase.from("leads").insert(rows).select("id");
    if (error) {
      console.error("Failed to save records", error);
      toast.error("Failed to save records to database");
      return;
    }

    // Map returned IDs back to records
    const savedRecs = newRecs.map((r, i) => ({
      ...r,
      id: data?.[i]?.id || r.id,
    }));

    setRecords((prev) => [...prev, ...savedRecs]);
  }, []);

  const moveRecords = useCallback(async (ids: Set<string>, targetList: "new" | "completed") => {
    const idArray = Array.from(ids);

    // Update in DB - batch in chunks
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

  return { records, loading, addRecords, moveRecords };
}
