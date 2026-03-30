import { useState, useEffect, useCallback, useRef } from "react";

import { toast } from "sonner";

import FileUploader from "@/components/FileUploader";
import JobProgressPanel from "@/components/JobProgressPanel";
import FailedUploadsSidebar from "@/components/FailedUploadsSidebar";
import LeadTable, { type LeadTab } from "@/components/LeadTable";
// RejectedRecordsTable removed — rejected records now render through LeadTable
import type { LeadRecord, FailedUpload, RejectedRecord } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { abbreviateState } from "@/lib/stateAbbreviations";
import { hashFile, splitPdfToPages } from "@/lib/pdfUtils";

const normalizeAddressKey = (addr: string) =>
  addr.toLowerCase()
    .replace(/\(no\s*mail\)/gi, "") // strip "(no mail)" markers
    .replace(/\bunit\b/gi, "") // normalize "unit" (equivalent to # which gets stripped)
    .replace(/\b(street|road|avenue|drive|lane|court|boulevard|place|circle|way|parkway|terrace|trail)\b/g, (m) => {
      const abbr: Record<string, string> = { street: "st", road: "rd", avenue: "ave", drive: "dr", lane: "ln", court: "ct", boulevard: "blvd", place: "pl", circle: "cir", way: "way", parkway: "pkwy", terrace: "ter", trail: "trl" };
      return abbr[m] || m;
    }).replace(/[.,#]/g, "").replace(/\s+/g, " ").trim();

const fixStateCasing = (cityStateZip: string): string => {
  if (!cityStateZip) return cityStateZip;
  return cityStateZip.replace(/\b([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)/, (_match, state, zip) => {
    return `${state.toUpperCase()} ${zip}`;
  });
};

const DEFAULT_PENDING_REASON = "Awaiting additional documentation for 360-degree view.";

const pickBestText = (...values: Array<string | null | undefined>) =>
  values
    .map(value => value?.trim() || "")
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] || "";

const pickFirstValue = <T,>(...values: Array<T | null | undefined | "">): T | null => {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return value as T;
    }
  }
  return null;
};

const rowPriority = (row: any) =>
  (row.address !== "CSV" ? 10 : 0)
  + (row.status !== "PENDING" ? 4 : 0)
  + (row.has_tax_data ? 2 : 0)
  + (row.has_history_data ? 2 : 0)
  + (row.mailing_address_1 ? 1 : 0);

const mapRowToLead = (row: any): LeadRecord => ({
  id: row.id,
  address: row.address,
  addressKey: row.address_key,
  ownerLastName: row.owner_last_name || "",
  mailingAddress1: row.mailing_address_1 || "",
  mailingAddress2: fixStateCasing(row.mailing_address_2 || ""),
  status: row.status as "GOOD" | "BAD" | "PENDING",
  analysisReason: row.analysis_reason || "",
  offMarketDate: row.off_market_date || null,
  saleDate: row.sale_date || null,
  lastRecordingDate: row.last_recording_date || null,
  hasTaxData: row.has_tax_data,
  hasHistoryData: row.has_history_data,
});

export interface JobFile {
  id: string;
  job_id: string;
  file_name: string;
  file_hash: string;
  status: "queued" | "hashing" | "splitting" | "processing" | "committing" | "completed" | "failed" | "skipped";
  error_message: string | null;
  total_pages: number | null;
  processed_pages: number;
  leads_found: number;
}

export interface Job {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  total_files: number;
  completed_files: number;
  failed_files: number;
  created_at: string;
}

const persistFailures = (failures: FailedUpload[]) => {
  localStorage.setItem("lp_failed_uploads", JSON.stringify(failures));
};

const loadPersistedFailures = (): FailedUpload[] => {
  try {
    const stored = localStorage.getItem("lp_failed_uploads");
    if (!stored) return [];
    return JSON.parse(stored).map((f: any) => ({ ...f, timestamp: new Date(f.timestamp) }));
  } catch { return []; }
};

const persistRejected = (records: RejectedRecord[]) => {
  localStorage.setItem("lp_rejected_records", JSON.stringify(records));
};

const loadPersistedRejected = (): RejectedRecord[] => {
  try {
    const stored = localStorage.getItem("lp_rejected_records");
    if (!stored) return [];
    return JSON.parse(stored).map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }));
  } catch { return []; }
};

const Index = () => {
  const [entered, setEntered] = useState(false);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [jobFiles, setJobFiles] = useState<JobFile[]>([]);
  const [failedUploads, setFailedUploads] = useState<FailedUpload[]>(() => loadPersistedFailures());
  const [rejectedRecords, setRejectedRecords] = useState<RejectedRecord[]>(() => loadPersistedRejected());
  const [activeTab, setActiveTab] = useState<LeadTab>("good");
  const processingRef = useRef(false);
  const cancelledRef = useRef(false);
  const fileQueueRef = useRef<{ file: File; jobFileId: string; hash: string }[]>([]);
  const activeJobRef = useRef<Job | null>(null);
  const activeRequestControllerRef = useRef<AbortController | null>(null);

  const isProcessing = activeJob?.status === "processing" || activeJob?.status === "pending";

  // --- Load leads ---
  useEffect(() => {
    const loadLeads = async () => {
      const allRows = await fetchAllLeads();
      setLeads(allRows.map(mapRowToLead));
      setIsLoading(false);
    };
    loadLeads();
  }, []);

  // --- Check for in-progress jobs on mount + stale job recovery ---
  useEffect(() => {
    const checkPendingJobs = async () => {
      // Reset stale jobs: files stuck in processing for >5 min
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      await supabase.from("job_files").update({
        status: "queued",
        error_message: "Auto-reset: stale processing detected",
        updated_at: new Date().toISOString(),
      }).in("status", ["processing", "hashing", "splitting", "committing"])
        .lt("updated_at", fiveMinAgo);

      const { data: jobs } = await supabase
        .from("processing_jobs")
        .select("*")
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (jobs && jobs.length > 0) {
        const job = jobs[0] as Job;
        setActiveJob(job);
          activeJobRef.current = job;

        const { data: files } = await supabase
          .from("job_files")
          .select("*")
          .eq("job_id", job.id)
          .order("created_at", { ascending: true });

        if (files) {
          setJobFiles(files as JobFile[]);
          // Check for queued files that can't resume (File objects lost on refresh)
          const stuckQueued = files.filter(f => f.status === "queued");
          if (stuckQueued.length > 0) {
            // Mark them as failed so the user knows to re-drop
            for (const f of stuckQueued) {
              await supabase.from("job_files").update({
                status: "failed",
                error_message: "Page was refreshed — please re-drop this file to process",
                updated_at: new Date().toISOString(),
              }).eq("id", f.id);
            }
            // Update job counts
            const completed = files.filter(f => f.status === "completed" || f.status === "skipped").length;
            const failed = files.filter(f => f.status === "failed").length + stuckQueued.length;
            await supabase.from("processing_jobs").update({
              completed_files: completed,
              failed_files: failed,
              status: "failed",
              updated_at: new Date().toISOString(),
            }).eq("id", job.id);
            toast.warning(`${stuckQueued.length} file(s) need to be re-uploaded (processing was interrupted). Please re-drop them.`);
          }
        }
      }
    };
    checkPendingJobs();
  }, []);

  useEffect(() => {
    activeJobRef.current = activeJob;
  }, [activeJob]);

  // --- Real-time subscription to job files ---
  useEffect(() => {
    if (!activeJob) return;

    const channel = supabase
      .channel(`job-${activeJob.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "job_files", filter: `job_id=eq.${activeJob.id}` },
        (payload) => {
          const updated = payload.new as JobFile;
          setJobFiles(prev =>
            prev.map(f => f.id === updated.id ? updated : f)
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "processing_jobs", filter: `id=eq.${activeJob.id}` },
        (payload) => {
          const updated = payload.new as Job;
          setActiveJob(updated);
          activeJobRef.current = updated;
          if (updated.status === "completed" || updated.status === "failed") {
            reloadLeads();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeJob?.id]);

  const fetchAllLeads = async () => {
    const all: any[] = [];
    const PAGE = 1000;
    let from = 0;
    while (true) {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).range(from, from + PAGE - 1);
      if (!data || data.length === 0) break;
      all.push(...data);
      if (data.length < PAGE) break;
      from += PAGE;
    }
    return all;
  };

  const reloadLeads = async () => {
    const allRows = await fetchAllLeads();
    setLeads(allRows.map(mapRowToLead));
  };

  const addFailedUpload = useCallback((failure: FailedUpload) => {
    setFailedUploads(prev => {
      const next = [...prev, failure];
      persistFailures(next);
      return next;
    });
  }, []);

  const handleDeleteLeads = async (ids: string[]) => {
    const BATCH = 200;
    for (let i = 0; i < ids.length; i += BATCH) {
      const batch = ids.slice(i, i + BATCH);
      const { error } = await supabase.from("leads").delete().in("id", batch);
      if (error) {
        toast.error(`Failed to delete leads (batch ${Math.floor(i / BATCH) + 1})`);
        return;
      }
    }
    toast.success(`Deleted ${ids.length} lead${ids.length > 1 ? "s" : ""}`);
    await reloadLeads();
  };

  const handleUpdateLastName = async (id: string, newName: string) => {
    const { error } = await supabase.from("leads").update({ owner_last_name: newName }).eq("id", id);
    if (error) { toast.error("Failed to update last name"); return; }
    toast.success("Last name updated");
    await reloadLeads();
  };

  // --- CSV Import with strict no-data-loss validation ---
  const handleImportCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { toast.error("CSV file is empty or has no data rows"); return; }

      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const statusIdx = headers.findIndex(h => h === "status");
      const lastNameIdx = headers.findIndex(h => h === "last name" || h.includes("last name") || h === "owner1lastname");
      const mailAddrIdx = headers.findIndex(h => h === "mail address" || h.includes("mail address") || h === "owner mail address");
      const cityIdx = headers.findIndex(h => h === "city" || h === "mailcityname");
      const stateIdx = headers.findIndex(h => h === "state" || h === "mailstate");
      const zipIdx = headers.findIndex(h => h === "zip" || h === "mailpostalcode");
      const combinedIdx = headers.findIndex(h => h.includes("city state zip"));
      const propAddrIdx = headers.findIndex(h => h.includes("property address") || h === "address");

      // --- HEADER INTEGRITY CHECK ---
      const schemaErrors: string[] = [];
      if (lastNameIdx === -1) schemaErrors.push("Owner1LastName / Last Name");
      if (mailAddrIdx === -1) schemaErrors.push("Owner Mail Address / Mail Address");
      if (schemaErrors.length > 0) {
        const reason = `Invalid Schema: Missing required headers — ${schemaErrors.join(", ")}`;
        addFailedUpload({ id: crypto.randomUUID(), fileName: file.name, reason, timestamp: new Date() });
        toast.error(reason);
        return;
      }

      const parseCSVRow = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (const char of line) {
          if (char === '"') { inQuotes = !inQuotes; continue; }
          if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; continue; }
          current += char;
        }
        result.push(current.trim());
        return result;
      };

      // --- STEP 1: ROW COUNT LOCK ---
      const totalRowsDetected = lines.length - 1; // exclude header
      console.log(`[CSV Validation] Total rows detected: ${totalRowsDetected}`);

      // --- STEP 2 & 3: ROW TRACKING + CLASSIFICATION ---
      const rowClassifications: { rowIndex: number; classification: "inserted" | "duplicate" | "failed"; reason: string }[] = [];
      const processedIndexes = new Set<number>();
      const newLeads: LeadRecord[] = [];
      const seenMailingAddresses = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const rowIndex = i - 1; // 0-based data row index
        processedIndexes.add(rowIndex);

        const cols = parseCSVRow(lines[i]);
        if (cols.length < 3) {
          rowClassifications.push({ rowIndex, classification: "failed", reason: `Too few columns (${cols.length})` });
          continue;
        }

        const mailAddress = cols[mailAddrIdx] || "";
        const address = propAddrIdx >= 0 ? (cols[propAddrIdx] || "") : "";
        const lastName = lastNameIdx >= 0 ? (cols[lastNameIdx] || "").trim() : "";

        // --- MANDATORY FIELD COMPLETION (Rule 4) ---
        if (!lastName && !address) {
          rowClassifications.push({ rowIndex, classification: "failed", reason: "Missing Mandatory Data: both Last Name and Address are empty" });
          continue;
        }

        // --- ADDRESS FIELD SANITATION (Rule 3) ---
        const invalidAddressPatterns = /\(no\s*mail\)|^nan$/i;
        const nullPattern = /^null$/i;
        if (mailAddress && (invalidAddressPatterns.test(mailAddress.trim()) || nullPattern.test(mailAddress.trim()))) {
          rowClassifications.push({ rowIndex, classification: "failed", reason: `Invalid Address String: "${mailAddress}"` });
          continue;
        }

        const effectiveAddress = address || "CSV";

        if (!mailAddress && effectiveAddress === "CSV") {
          rowClassifications.push({ rowIndex, classification: "failed", reason: "No mail address and no property address" });
          continue;
        }

        const mailKey = normalizeAddressKey(mailAddress);
        if (mailKey && seenMailingAddresses.has(mailKey)) {
          rowClassifications.push({ rowIndex, classification: "duplicate", reason: `Duplicate mailing address within file: ${mailAddress}` });
          continue;
        }
        if (mailKey) seenMailingAddresses.add(mailKey);

        const statusRaw = statusIdx >= 0 ? (cols[statusIdx] || "").toUpperCase() : "GOOD";
        const status: "GOOD" | "BAD" | "PENDING" = statusRaw === "BAD" ? "BAD" : statusRaw === "PENDING" ? "PENDING" : "GOOD";

        // --- ZIP CODE DATA TYPE VALIDATION (Rule 2) ---
        let cityStateZip = "";
        if (combinedIdx >= 0) {
          cityStateZip = fixStateCasing(cols[combinedIdx] || "");
        } else if (cityIdx >= 0 && stateIdx >= 0 && zipIdx >= 0) {
          let rawZip = (cols[zipIdx] || "").trim();
          // Auto-clean trailing .0 (e.g. 55343.0 → 55343)
          if (/^\d+\.0$/.test(rawZip)) {
            rawZip = rawZip.replace(/\.0$/, "");
          } else if (/\.\d+/.test(rawZip) && /^\d/.test(rawZip)) {
            // Zip still has a non-.0 decimal — malformed
            rowClassifications.push({ rowIndex, classification: "failed", reason: `Malformed Zip: "${cols[zipIdx]}" contains a decimal` });
            continue;
          }
          cityStateZip = `${cols[cityIdx] || ""} ${abbreviateState(cols[stateIdx] || "")} ${rawZip}`.trim();
        }

        newLeads.push({
          id: crypto.randomUUID(), address: effectiveAddress,
          addressKey: effectiveAddress === "CSV" ? normalizeAddressKey(`csv-${mailAddress}-${cityStateZip}`) : normalizeAddressKey(effectiveAddress),
          ownerLastName: lastName, mailingAddress1: mailAddress, mailingAddress2: cityStateZip,
          status, analysisReason: status === "GOOD" ? "Imported from CSV as GOOD" : status === "BAD" ? "Imported from CSV as BAD" : "Awaiting additional documentation for 360-degree view.",
          offMarketDate: null, saleDate: null, lastRecordingDate: null,
          hasTaxData: status !== "PENDING", hasHistoryData: status !== "PENDING",
        });
        rowClassifications.push({ rowIndex, classification: "inserted", reason: "Valid row" });
      }

      // --- STEP 5: MISSING ROW DETECTION ---
      const missingIndexes: number[] = [];
      for (let i = 0; i < totalRowsDetected; i++) {
        if (!processedIndexes.has(i)) missingIndexes.push(i);
      }

      // --- STEP 6: END-OF-JOB VALIDATION ---
      const rowsInserted = rowClassifications.filter(r => r.classification === "inserted").length;
      const rowsDuplicate = rowClassifications.filter(r => r.classification === "duplicate").length;
      const rowsFailed = rowClassifications.filter(r => r.classification === "failed").length;
      const rowsProcessed = rowsInserted + rowsDuplicate + rowsFailed;

      const validationReport = {
        total_rows_detected: totalRowsDetected,
        rows_processed: rowsProcessed,
        rows_inserted: rowsInserted,
        rows_duplicate: rowsDuplicate,
        rows_failed: rowsFailed,
        missing_indexes: missingIndexes,
        reconciliation_match: totalRowsDetected === rowsProcessed && missingIndexes.length === 0,
      };

      console.log("[CSV Validation] Report:", validationReport);

      // --- STEP 7: FAIL CONDITION ---
      if (!validationReport.reconciliation_match) {
        const errorMsg = missingIndexes.length > 0
          ? `Row reconciliation failed: ${missingIndexes.length} rows were not processed (indexes: ${missingIndexes.slice(0, 10).join(", ")}${missingIndexes.length > 10 ? "..." : ""})`
          : `Row count mismatch: detected ${totalRowsDetected} but processed ${rowsProcessed}`;
        console.error("[CSV Validation] FAIL:", errorMsg);
        toast.error(errorMsg);
        return;
      }

      // --- STEP 8: SUCCESS CONDITION ---
      // Store rejected records (duplicates + failed) for the Rejected tab
      const rejectedFromImport: RejectedRecord[] = rowClassifications
        .filter(r => r.classification === "duplicate" || r.classification === "failed")
        .map(r => {
          const cols = parseCSVRow(lines[r.rowIndex + 1]);
          return {
            id: crypto.randomUUID(),
            rowIndex: r.rowIndex,
            classification: r.classification as "duplicate" | "failed",
            reason: r.reason,
            fileName: file.name,
            timestamp: new Date(),
            rawData: {
              address: propAddrIdx >= 0 ? (cols[propAddrIdx] || "") : "",
              ownerLastName: lastNameIdx >= 0 ? (cols[lastNameIdx] || "") : "",
              mailingAddress1: cols[mailAddrIdx] || "",
              mailingAddress2: combinedIdx >= 0 ? (cols[combinedIdx] || "") : (cityIdx >= 0 && stateIdx >= 0 && zipIdx >= 0 ? `${cols[cityIdx] || ""} ${cols[stateIdx] || ""} ${cols[zipIdx] || ""}`.trim() : ""),
            },
          };
        });

      if (rejectedFromImport.length > 0) {
        setRejectedRecords(prev => {
          const next = [...prev, ...rejectedFromImport];
          persistRejected(next);
          return next;
        });
      }

      if (rowsInserted === 0) {
        toast.error(`No new rows to import. ${rowsDuplicate} duplicates, ${rowsFailed} failed.`);
        return;
      }

      const { dbDuplicates } = await mergeAndPersist(newLeads, file.name);

      // Capture cross-DB duplicates into Rejected tab
      if (dbDuplicates.length > 0) {
        setRejectedRecords(prev => {
          const next = [...prev, ...dbDuplicates];
          persistRejected(next);
          return next;
        });
      }

      // Show detailed success toast
      const totalDupes = rowsDuplicate + dbDuplicates.length;
      const parts: string[] = [`${rowsInserted - dbDuplicates.length} inserted`];
      if (totalDupes > 0) parts.push(`${totalDupes} duplicates skipped`);
      if (rowsFailed > 0) parts.push(`${rowsFailed} failed`);
      toast.success(`CSV Import Complete: ${parts.join(", ")} (${totalRowsDetected} total rows)`);
      // Auto-reconcile pending records after CSV import
      await reconcilePendingRecords();
    } catch (err) {
      console.error("CSV import error:", err);
      toast.error("Failed to parse CSV file");
    }
  };

  // --- Merge & Persist ---
  const mergeAndPersist = async (newLeads: LeadRecord[], fileName?: string): Promise<{ inserted: number; dbDuplicates: RejectedRecord[] }> => {
    const existingRows = await fetchAllLeads();
    const existingByKey = new Map<string, any>();
    const existingByMail = new Map<string, any>();
    for (const row of existingRows || []) {
      existingByKey.set(row.address_key, row);
      if (row.mailing_address_1) existingByMail.set(normalizeAddressKey(row.mailing_address_1), row);
    }

    const upsertMap = new Map<string, any>();
    const seenMailKeys = new Set<string>();
    const dbDuplicates: RejectedRecord[] = [];

    for (const lead of newLeads) {
      const key = lead.addressKey || normalizeAddressKey(lead.address);
      const mailKey = lead.mailingAddress1 ? normalizeAddressKey(lead.mailingAddress1) : "";

      // --- Tax/History PDF matching: find CSV record by mailing address ---
      // If this lead has a real property address (not "CSV") and the mailing address
      // matches an existing CSV-keyed record, update that record instead of creating a new one.
      let matchedExistingKey: string | null = null;
      if (mailKey && lead.address && lead.address !== "CSV") {
        const existingByMailRow = existingByMail.get(mailKey);
        if (existingByMailRow && existingByMailRow.address === "CSV") {
          // This tax/history PDF's mailing address matches a CSV record — merge into it
          matchedExistingKey = existingByMailRow.address_key;
        }
      }

      // Also check if a history PDF matches by property address (non-CSV existing record)
      if (!matchedExistingKey) {
        const existingByAddr = existingByKey.get(key);
        if (existingByAddr) {
          matchedExistingKey = key;
        }
      }

      if (mailKey) {
        if (seenMailKeys.has(mailKey)) {
          dbDuplicates.push({
            id: crypto.randomUUID(),
            rowIndex: -1,
            classification: "duplicate",
            reason: `Duplicate mailing address across files: ${lead.mailingAddress1}`,
            fileName: fileName || "unknown",
            timestamp: new Date(),
            rawData: { address: lead.address, ownerLastName: lead.ownerLastName, mailingAddress1: lead.mailingAddress1, mailingAddress2: lead.mailingAddress2 },
          });
          continue;
        }
        seenMailKeys.add(mailKey);

        // Only flag as duplicate if there's NO matched key (truly duplicate, not a merge)
        if (!matchedExistingKey) {
          const existingByMailRow = existingByMail.get(mailKey);
          if (existingByMailRow && existingByMailRow.address_key !== key) {
            dbDuplicates.push({
              id: crypto.randomUUID(),
              rowIndex: -1,
              classification: "duplicate",
              reason: `Mailing address already exists in database: ${lead.mailingAddress1}`,
              fileName: fileName || "unknown",
              timestamp: new Date(),
              rawData: { address: lead.address, ownerLastName: lead.ownerLastName, mailingAddress1: lead.mailingAddress1, mailingAddress2: lead.mailingAddress2 },
            });
            continue;
          }
        }
      }

      const existing = matchedExistingKey ? existingByKey.get(matchedExistingKey) : null;
      if (existing) {
        const hasTax = existing.has_tax_data || lead.hasTaxData;
        const hasHistory = existing.has_history_data || lead.hasHistoryData;
        const ownerLastName = lead.ownerLastName || existing.owner_last_name || "";
        const mailingAddress1 = lead.mailingAddress1 || existing.mailing_address_1 || "";
        const mailingAddress2 = lead.mailingAddress2 || existing.mailing_address_2 || "";
        const offMarketDate = lead.offMarketDate || existing.off_market_date || null;
        const saleDate = lead.saleDate || existing.sale_date || null;
        const lastRecordingDate = lead.lastRecordingDate || existing.last_recording_date || null;

        // Update address from "CSV" to the real property address when tax data provides it
        const newAddress = (existing.address === "CSV" && lead.address && lead.address !== "CSV")
          ? lead.address : (existing.address || lead.address);
        // Update address_key when address changes from CSV
        const newAddressKey = (existing.address === "CSV" && lead.address && lead.address !== "CSV")
          ? normalizeAddressKey(lead.address) : existing.address_key;

        let status: LeadRecord["status"] = lead.status !== "PENDING" ? lead.status : (existing.status !== "PENDING" ? existing.status : "PENDING");
        let analysisReason = lead.analysisReason;
        if (hasTax && hasHistory) {
          const offDate = offMarketDate ? new Date(offMarketDate) : null;
          const sDate = saleDate ? new Date(saleDate) : null;
          const rDate = lastRecordingDate ? new Date(lastRecordingDate) : null;
          if (offDate && ((rDate && rDate > offDate) || (sDate && sDate > offDate))) {
            status = "BAD";
            analysisReason = `Sale/recording date is after off-market date of ${offMarketDate}`;
          } else {
            status = "GOOD";
            analysisReason = "No sale record found after off-market date";
          }
        } else {
          status = "PENDING";
          analysisReason = DEFAULT_PENDING_REASON;
        }

        // Delete old CSV-keyed record if address_key changed
        if (newAddressKey !== existing.address_key) {
          // We'll delete old and insert new
          await supabase.from("leads").delete().eq("id", existing.id);
        }

        upsertMap.set(newAddressKey, {
          id: newAddressKey !== existing.address_key ? crypto.randomUUID() : existing.id,
          address: newAddress, address_key: newAddressKey,
          owner_last_name: ownerLastName, mailing_address_1: mailingAddress1, mailing_address_2: mailingAddress2,
          status, analysis_reason: analysisReason, off_market_date: offMarketDate,
          sale_date: saleDate, last_recording_date: lastRecordingDate,
          has_tax_data: hasTax, has_history_data: hasHistory, updated_at: new Date().toISOString(),
        });
      } else {
        upsertMap.set(key, {
          id: upsertMap.get(key)?.id || lead.id, address: lead.address, address_key: key,
          owner_last_name: lead.ownerLastName, mailing_address_1: lead.mailingAddress1,
          mailing_address_2: lead.mailingAddress2, status: lead.status,
          analysis_reason: lead.analysisReason, off_market_date: lead.offMarketDate,
          sale_date: lead.saleDate, last_recording_date: lead.lastRecordingDate,
          has_tax_data: lead.hasTaxData, has_history_data: lead.hasHistoryData,
          updated_at: new Date().toISOString(),
        });
      }
    }

    const upsertRows = Array.from(upsertMap.values());
    const BATCH_SIZE = 500;
    let totalFailed = 0;
    for (let i = 0; i < upsertRows.length; i += BATCH_SIZE) {
      const batch = upsertRows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("leads").upsert(batch, { onConflict: "address_key" });
      if (error) {
        console.error(`Failed to persist batch ${i / BATCH_SIZE + 1}:`, error);
        totalFailed += batch.length;
      }
    }
    if (totalFailed > 0) toast.error(`${totalFailed} rows failed to save — please retry`);
    await reloadLeads();
    return { inserted: newLeads.length - dbDuplicates.length, dbDuplicates };
  };

  const persistPendingPdfLeads = async (newLeads: LeadRecord[], fileName?: string): Promise<{ inserted: number; dbDuplicates: RejectedRecord[] }> => {
    const existingRows = await fetchAllLeads();
    const existingByKey = new Map<string, any>();
    const existingByMail = new Map<string, any>();

    for (const row of existingRows || []) {
      existingByKey.set(row.address_key, row);
      if (row.mailing_address_1) {
        existingByMail.set(normalizeAddressKey(row.mailing_address_1), row);
      }
    }

    const upsertMap = new Map<string, any>();
    const dbDuplicates: RejectedRecord[] = [];

    for (const lead of newLeads) {
      const key = lead.addressKey || normalizeAddressKey(lead.address);
      const mailKey = lead.mailingAddress1 ? normalizeAddressKey(lead.mailingAddress1) : "";
      const existingSameKey = existingByKey.get(key);
      const existingByMailRow = mailKey ? existingByMail.get(mailKey) : null;

      const complementaryCsvMatch = Boolean(
        existingByMailRow &&
        existingByMailRow.address === "CSV" &&
        lead.address &&
        lead.address !== "CSV"
      );

      if (mailKey && existingByMailRow && existingByMailRow.address_key !== key && !complementaryCsvMatch) {
        dbDuplicates.push({
          id: crypto.randomUUID(),
          rowIndex: -1,
          classification: "duplicate",
          reason: `Mailing address already exists in database: ${lead.mailingAddress1}`,
          fileName: fileName || "unknown",
          timestamp: new Date(),
          rawData: {
            address: lead.address,
            ownerLastName: lead.ownerLastName,
            mailingAddress1: lead.mailingAddress1,
            mailingAddress2: lead.mailingAddress2,
          },
        });
        continue;
      }

      const seedRow = upsertMap.get(key) || existingSameKey;
      upsertMap.set(key, {
        id: seedRow?.id || lead.id,
        address: lead.address,
        address_key: key,
        owner_last_name: lead.ownerLastName || seedRow?.owner_last_name || "",
        mailing_address_1: lead.mailingAddress1 || seedRow?.mailing_address_1 || "",
        mailing_address_2: lead.mailingAddress2 || seedRow?.mailing_address_2 || "",
        status: "PENDING",
        analysis_reason: DEFAULT_PENDING_REASON,
        off_market_date: lead.offMarketDate || seedRow?.off_market_date || null,
        sale_date: lead.saleDate || seedRow?.sale_date || null,
        last_recording_date: lead.lastRecordingDate || seedRow?.last_recording_date || null,
        has_tax_data: Boolean(seedRow?.has_tax_data || lead.hasTaxData),
        has_history_data: Boolean(seedRow?.has_history_data || lead.hasHistoryData),
        updated_at: new Date().toISOString(),
      });
    }

    const upsertRows = Array.from(upsertMap.values());
    const BATCH_SIZE = 500;
    let totalFailed = 0;

    for (let i = 0; i < upsertRows.length; i += BATCH_SIZE) {
      const batch = upsertRows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("leads").upsert(batch, { onConflict: "address_key" });
      if (error) {
        console.error(`Failed to persist pending PDF batch ${i / BATCH_SIZE + 1}:`, error);
        totalFailed += batch.length;
      }
    }

    if (totalFailed > 0) {
      toast.error(`${totalFailed} rows failed while saving PDF records to pending`);
    }

    await reloadLeads();
    return { inserted: upsertRows.length, dbDuplicates };
  };

  // --- Retry helper with exponential backoff ---
  const withRetry = async <T,>(fn: () => Promise<T>, retries = 3): Promise<T> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (attempt === retries - 1) throw err;
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error("Retry exhausted");
  };

  const updateJobFile = async (id: string, data: Record<string, any>) => {
    const { error } = await supabase.from("job_files").update(data).eq("id", id);
    if (error) throw error;
  };

  const updateJob = async (id: string, data: Record<string, any>) => {
    const { error } = await supabase.from("processing_jobs").update(data).eq("id", id);
    if (error) throw error;
  };

  const upsertHash = async (data: { sha256: string; file_name: string; file_size: number }) => {
    const { error } = await supabase.from("file_hashes").upsert(data, { onConflict: "sha256" });
    if (error) throw error;
  };

  const syncCurrentJobProgress = async (finalize = false) => {
    const currentJob = activeJobRef.current;
    if (!currentJob) return;

    const { data: updatedFiles, error } = await supabase
      .from("job_files")
      .select("status")
      .eq("job_id", currentJob.id);

    if (error || !updatedFiles) return;

    const completed = updatedFiles.filter(f => f.status === "completed" || f.status === "skipped").length;
    const failed = updatedFiles.filter(f => f.status === "failed").length;
    const done = completed + failed === updatedFiles.length;
    const status: Job["status"] = finalize || done ? (failed > 0 ? "failed" : "completed") : "processing";

    const nextJob = {
      ...currentJob,
      completed_files: completed,
      failed_files: failed,
      total_files: updatedFiles.length,
      status,
      created_at: currentJob.created_at,
    } as Job;

    await updateJob(currentJob.id, {
      completed_files: completed,
      failed_files: failed,
      status,
      updated_at: new Date().toISOString(),
    });

    activeJobRef.current = nextJob;
    setActiveJob(nextJob);
  };

  // --- Merge leads from multiple pages (client-side reconciliation) ---
  const mergePageLeads = (allLeads: any[]) => {
    const mergedByAddress = new Map<string, any>();
    for (const lead of allLeads) {
      const key = normalizeAddressKey(lead.address);
      if (key === "unknown" || !key) continue;
      const existing = mergedByAddress.get(key);
      if (existing) {
        const pickBest = (a: string, b: string) => (!a ? b : !b ? a : a.length >= b.length ? a : b);
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
    return Array.from(mergedByAddress.values());
  };

  // --- Auto-reconciliation: match PENDING records after every upload ---
  const reconcilePendingRecords = async () => {
    const allRows = await fetchAllLeads();
    if (allRows.length === 0) return;

    const rowsByAddress = new Map<string, any[]>();
    const csvByMail = new Map<string, any[]>();

    for (const row of allRows) {
      if (row.address === "CSV") {
        if (row.mailing_address_1) {
          const mailKey = normalizeAddressKey(row.mailing_address_1);
          if (!csvByMail.has(mailKey)) csvByMail.set(mailKey, []);
          csvByMail.get(mailKey)!.push(row);
        }
        continue;
      }

      const addressKey = row.address_key || normalizeAddressKey(row.address);
      if (!rowsByAddress.has(addressKey)) rowsByAddress.set(addressKey, []);
      rowsByAddress.get(addressKey)!.push(row);
    }

    const updates: any[] = [];
    const deletes = new Set<string>();

    for (const rows of rowsByAddress.values()) {
      const sortedRows = [...rows].sort((a, b) => rowPriority(b) - rowPriority(a));
      const base = sortedRows[0];
      const mailKey = base.mailing_address_1 ? normalizeAddressKey(base.mailing_address_1) : "";
      const csvSibling = mailKey
        ? (csvByMail.get(mailKey) || []).find(row => !deletes.has(row.id)) || null
        : null;

      const participants = csvSibling ? [csvSibling, ...sortedRows] : sortedRows;
      const hasTax = participants.some(row => row.has_tax_data);
      const hasHistory = participants.some(row => row.has_history_data);
      const shouldProcess = participants.length > 1 || base.status === "PENDING" || (hasTax && hasHistory);

      if (!shouldProcess) continue;

      const ownerLastName = pickBestText(...participants.map(row => row.owner_last_name));
      const mailingAddress1 = pickBestText(...participants.map(row => row.mailing_address_1));
      const mailingAddress2 = pickBestText(...participants.map(row => row.mailing_address_2));
      const offMarketDate = pickFirstValue(...participants.map(row => row.off_market_date));
      const saleDate = pickFirstValue(...participants.map(row => row.sale_date));
      const lastRecordingDate = pickFirstValue(...participants.map(row => row.last_recording_date));

      let status: LeadRecord["status"] = "PENDING";
      let analysisReason = DEFAULT_PENDING_REASON;

      if (hasTax && hasHistory) {
        const offDate = offMarketDate ? new Date(offMarketDate) : null;
        const sDate = saleDate ? new Date(saleDate) : null;
        const rDate = lastRecordingDate ? new Date(lastRecordingDate) : null;

        if (offDate && ((rDate && rDate > offDate) || (sDate && sDate > offDate))) {
          status = "BAD";
          analysisReason = `Sale/recording date is after off-market date of ${offMarketDate}`;
        } else {
          status = "GOOD";
          analysisReason = "No sale record found after off-market date";
        }
      } else {
        const stableSource = participants.find(row => row.id !== base.id && row.status && row.status !== "PENDING");
        if (stableSource) {
          status = stableSource.status;
          analysisReason = stableSource.analysis_reason || DEFAULT_PENDING_REASON;
        }
      }

      updates.push({
        id: base.id,
        address: base.address,
        address_key: base.address_key,
        owner_last_name: ownerLastName,
        mailing_address_1: mailingAddress1,
        mailing_address_2: mailingAddress2,
        status,
        analysis_reason: analysisReason,
        off_market_date: offMarketDate,
        sale_date: saleDate,
        last_recording_date: lastRecordingDate,
        has_tax_data: hasTax,
        has_history_data: hasHistory,
        updated_at: new Date().toISOString(),
      });

      for (const row of participants) {
        if (row.id !== base.id) {
          deletes.add(row.id);
        }
      }
    }

    if (deletes.size > 0) {
      const deleteIds = Array.from(deletes);
      for (let i = 0; i < deleteIds.length; i += 200) {
        await supabase.from("leads").delete().in("id", deleteIds.slice(i, i + 200));
      }
    }

    if (updates.length > 0) {
      for (let i = 0; i < updates.length; i += 500) {
        await supabase.from("leads").upsert(updates.slice(i, i + 500), { onConflict: "address_key" });
      }
    }

    if (updates.length > 0 || deletes.size > 0) {
      console.log(`[Reconciliation] Consolidated ${updates.length} record(s)`);
      toast.success(`Consolidated ${updates.length} record${updates.length > 1 ? "s" : ""} after pending import`);
      await reloadLeads();
    }
  };

  // --- Server-side job queue: process next file (one page at a time) ---
  const processNextFile = useCallback(async () => {
    if (processingRef.current) return;
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }

    const nextItem = fileQueueRef.current[0];
    if (!nextItem) {
      await reconcilePendingRecords();
      await syncCurrentJobProgress(true);
      return;
    }

    processingRef.current = true;
    const { file, jobFileId, hash } = nextItem;
    const isCSV = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";

    try {
      await withRetry(() => updateJobFile(jobFileId, { status: "hashing", updated_at: new Date().toISOString() }));

      if (isCSV) {
        await handleImportCSV(file);
        await withRetry(() => updateJobFile(jobFileId, { status: "completed", updated_at: new Date().toISOString() }));
      } else {
        await withRetry(() => updateJobFile(jobFileId, { status: "splitting", updated_at: new Date().toISOString() }));

        const pages = await splitPdfToPages(file);
        const pageCount = pages.length;

        await withRetry(() => updateJobFile(jobFileId, { total_pages: pageCount, status: "processing", updated_at: new Date().toISOString() }));

        const allPageLeads: any[] = [];
        for (let p = 1; p <= pageCount; p++) {
          if (cancelledRef.current) throw new Error("Cancelled by user");

          const controller = new AbortController();
          activeRequestControllerRef.current = controller;
          const timeoutId = window.setTimeout(() => controller.abort("timeout"), 90_000);
          const currentPage = pages[p - 1];

          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-leads`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                  "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                },
                body: JSON.stringify({
                  name: file.name,
                  base64: currentPage.base64,
                  mimeType: currentPage.mimeType,
                  pageNum: p,
                  totalPages: pageCount,
                  job_file_id: jobFileId,
                }),
                signal: controller.signal,
              }
            );

            if (!response.ok) {
              const status = response.status;
              if (status === 429 || status === 402) {
                throw new Error(status === 429 ? "Rate limit reached" : "AI credits exhausted");
              }
              console.error(`Page ${p} of ${file.name} failed with status ${status}`);
              continue;
            }

            const data = await response.json();
            if (data?.leads && Array.isArray(data.leads)) {
              allPageLeads.push(...data.leads);
            }
          } catch (err: any) {
            if (err.name === "AbortError") {
              if (controller.signal.reason === "cancelled" || cancelledRef.current) {
                throw new Error("Cancelled by user");
              }
              console.error(`Page ${p} of ${file.name} timed out after 90s`);
              continue;
            }
            throw err;
          } finally {
            window.clearTimeout(timeoutId);
            if (activeRequestControllerRef.current === controller) {
              activeRequestControllerRef.current = null;
            }
          }

          await supabase.from("job_files").update({
            processed_pages: p,
            updated_at: new Date().toISOString(),
          }).eq("id", jobFileId);
        }

        const mergedLeads = mergePageLeads(allPageLeads);

        if (mergedLeads.length > 0) {
          await withRetry(() => updateJobFile(jobFileId, { status: "committing", updated_at: new Date().toISOString() }));
          const { inserted, dbDuplicates: pdfDupes } = await persistPendingPdfLeads(mergedLeads, file.name);
          if (pdfDupes.length > 0) {
            setRejectedRecords(prev => { const next = [...prev, ...pdfDupes]; persistRejected(next); return next; });
          }
          await reconcilePendingRecords();
          await withRetry(() => updateJobFile(jobFileId, { status: "completed", leads_found: inserted, updated_at: new Date().toISOString() }));
        } else {
          const reason = "No readable address or data found in PDF";
          await withRetry(() => updateJobFile(jobFileId, { status: "failed", error_message: reason, updated_at: new Date().toISOString() }));
          addFailedUpload({ id: jobFileId, fileName: file.name, reason, timestamp: new Date() });
        }
      }

      // Register hash only on success
      const { data: fileStatus } = await supabase.from("job_files").select("status").eq("id", jobFileId).maybeSingle();
      if (fileStatus?.status === "completed") {
        await withRetry(() => upsertHash({ sha256: hash, file_name: file.name, file_size: file.size }));
      }

      await syncCurrentJobProgress();
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unexpected error";
      try {
        await supabase.from("job_files").update({
          status: "failed", error_message: reason, updated_at: new Date().toISOString(),
        }).eq("id", jobFileId);
      } catch { /* best effort */ }
      addFailedUpload({ id: jobFileId, fileName: file.name, reason, timestamp: new Date() });
      await syncCurrentJobProgress();
    } finally {
      activeRequestControllerRef.current = null;
      fileQueueRef.current = fileQueueRef.current.slice(1);
      processingRef.current = false;
      processNextFile();
    }
  }, [activeJob]);

  // --- Handle file drop ---
  const handleFilesSelected = useCallback(async (files: File[]) => {
    // Route CSVs to the CSV importer, PDFs to the processing pipeline
    const csvFiles = files.filter(f => f.name.toLowerCase().endsWith(".csv") || f.type === "text/csv");
    const pdfFiles = files.filter(f => f.type === "application/pdf");

    // Process CSVs immediately via the CSV import path
    for (const csv of csvFiles) {
      await handleImportCSV(csv);
    }

    // If no PDFs, we're done
    if (pdfFiles.length === 0) return;

    const filesToProcess = pdfFiles;
    const validFiles: { file: File; hash: string }[] = [];
    for (const file of filesToProcess) {
      const hash = await hashFile(file);

      // Check DB for existing hash (cross-device dedup)
      const { data: existing } = await supabase
        .from("file_hashes")
        .select("id")
        .eq("sha256", hash)
        .limit(1);

      if (existing && existing.length > 0) {
        toast.warning(`"${file.name}" already processed (identical content) — skipped.`);
        continue;
      }

      validFiles.push({ file, hash });
    }

    if (validFiles.length === 0) return;

    // 2. Create a processing job
    const { data: jobData, error: jobError } = await supabase
      .from("processing_jobs")
      .insert({
        status: "pending",
        total_files: validFiles.length,
      })
      .select()
      .single();

    if (jobError || !jobData) {
      toast.error("Failed to create processing job");
      return;
    }

    const job = jobData as Job;
    setActiveJob(job);
    activeJobRef.current = job;

    // 3. Create job_file records
    const jobFileInserts = validFiles.map(({ file, hash }) => ({
      job_id: job.id,
      file_name: file.name,
      file_hash: hash,
      status: "queued" as const,
    }));

    const { data: jobFilesData, error: jfError } = await supabase
      .from("job_files")
      .insert(jobFileInserts)
      .select();

    if (jfError || !jobFilesData) {
      toast.error("Failed to register files");
      return;
    }

    setJobFiles(prev => [...prev, ...(jobFilesData as JobFile[])]);

    // 4. Queue for processing
    const queueItems = validFiles.map(({ file, hash }, i) => ({
      file,
      jobFileId: (jobFilesData as any[])[i].id,
      hash,
    }));

    fileQueueRef.current = [...fileQueueRef.current, ...queueItems];

    // 5. Start processing
    await supabase.from("processing_jobs").update({
      status: "processing",
      updated_at: new Date().toISOString(),
    }).eq("id", job.id);

    processNextFile();
  }, [processNextFile, handleImportCSV]);

  const dismissJob = useCallback(() => {
    setActiveJob(null);
    setJobFiles([]);
  }, []);

  // Cancel an in-progress job
  const handleCancelJob = useCallback(async () => {
    if (!activeJob) return;
    cancelledRef.current = true;
    activeRequestControllerRef.current?.abort("cancelled");
    fileQueueRef.current = [];
    processingRef.current = false;

    // Mark all non-completed files as failed
    const pendingFiles = jobFiles.filter(f => !["completed", "failed", "skipped"].includes(f.status));
    for (const f of pendingFiles) {
      await supabase.from("job_files").update({
        status: "failed",
        error_message: "Cancelled by user",
        updated_at: new Date().toISOString(),
      }).eq("id", f.id);
    }

    await supabase.from("processing_jobs").update({
      status: "failed",
      failed_files: pendingFiles.length + (activeJob.failed_files || 0),
      updated_at: new Date().toISOString(),
    }).eq("id", activeJob.id);

    // Remove hashes for cancelled files so they can be re-uploaded
    const cancelledHashes = pendingFiles.map(f => f.file_hash);
    if (cancelledHashes.length > 0) {
      await supabase.from("file_hashes").delete().in("sha256", cancelledHashes);
    }

    toast.info("Job cancelled. You can re-drop the files to try again.");
  }, [activeJob, jobFiles]);

  // Retry failed files: user must re-drop them since File objects don't survive refresh
  const handleRetryFailed = useCallback(() => {
    const failedFiles = jobFiles.filter(f => f.status === "failed");
    if (failedFiles.length === 0) return;
    toast.info(
      `${failedFiles.length} file${failedFiles.length > 1 ? "s" : ""} failed. Please re-drop them to retry — the system will re-process only these files.`,
      { duration: 6000 }
    );
    // Clear error logs, hashes, and reset file statuses for a clean re-run
    const failedIds = failedFiles.map(f => f.id);
    const hashes = failedFiles.map(f => f.file_hash);
    // Delete processing_logs for failed files first (clean slate)
    supabase.from("processing_logs").delete().in("job_file_id", failedIds).then(() => {
      // Remove hashes so re-drop won't be blocked by dedup
      supabase.from("file_hashes").delete().in("sha256", hashes).then(() => {
        // Mark them as skipped so they don't block the job
        for (const f of failedFiles) {
          supabase.from("job_files").update({ status: "skipped", error_message: "Awaiting re-upload" }).eq("id", f.id);
        }
      });
    });
  }, [jobFiles]);

  if (!entered) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <button
        onClick={() => setEntered(true)}
        className="px-10 py-4 text-2xl font-bold tracking-widest bg-primary text-primary-foreground rounded-lg shadow-lg hover:opacity-90 transition-opacity"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        LeadPro
      </button>
    </div>
  );

  const fileUploaderElement = (
    <div className="flex items-center gap-3">
      <FileUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
      {activeJob && (
        <JobProgressPanel
          job={activeJob}
          files={jobFiles}
          onDismiss={dismissJob}
          onRetryFailed={handleRetryFailed}
          onCancelJob={handleCancelJob}
        />
      )}
    </div>
  );

  const goodLeads = leads.filter(l => l.status === "GOOD");
  const badLeads = leads.filter(l => l.status === "BAD");
  const pendingLeads = leads.filter(l => l.status === "PENDING");

  // Convert rejected records into LeadRecord shape so LeadTable can render them identically
  const rejectedAsLeads: LeadRecord[] = rejectedRecords.map(r => ({
    id: r.id,
    address: r.rawData.address || "—",
    addressKey: "",
    ownerLastName: r.rawData.ownerLastName || "",
    mailingAddress1: r.rawData.mailingAddress1 || "",
    mailingAddress2: r.rawData.mailingAddress2 || "",
    status: r.classification === "duplicate" ? "DUPE" as const : "FAIL" as const,
    analysisReason: `[${r.classification.toUpperCase()}] ${r.reason}`,
    offMarketDate: null,
    saleDate: null,
    lastRecordingDate: null,
    hasTaxData: false,
    hasHistoryData: false,
  }));

  const tabCounts = { good: goodLeads.length, bad: badLeads.length, pending: pendingLeads.length, rejected: rejectedRecords.length };
  const visibleLeads = activeTab === "good" ? goodLeads : activeTab === "bad" ? badLeads : activeTab === "pending" ? pendingLeads : rejectedAsLeads;

  const handleDeleteRejected = async (ids: string[]) => {
    setRejectedRecords(prev => {
      const next = prev.filter(r => !ids.includes(r.id));
      persistRejected(next);
      return next;
    });
    toast.success(`Removed ${ids.length} rejected record${ids.length > 1 ? "s" : ""}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading leads...</p>
        </div>
      ) : (
        <LeadTable
          leads={visibleLeads}
          onDeleteLeads={activeTab === "rejected" ? handleDeleteRejected : handleDeleteLeads}
          onUpdateLastName={activeTab === "rejected" ? undefined : handleUpdateLastName}
          onImportCSV={handleImportCSV}
          fileUploader={fileUploaderElement}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={tabCounts}
        />
      )}

      <FailedUploadsSidebar
        items={failedUploads}
        onDismiss={(id) => setFailedUploads(prev => { const next = prev.filter(f => f.id !== id); persistFailures(next); return next; })}
        onClear={() => { setFailedUploads([]); persistFailures([]); }}
      />
    </div>
  );
};

export default Index;
