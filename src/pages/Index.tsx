import { useState, useEffect, useCallback, useRef } from "react";

import { toast } from "sonner";

import FileUploader from "@/components/FileUploader";
import JobProgressPanel from "@/components/JobProgressPanel";
import FailedUploadsSidebar from "@/components/FailedUploadsSidebar";
import LeadTable from "@/components/LeadTable";
import RejectedRecordsTable from "@/components/RejectedRecordsTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { LeadRecord, FailedUpload, RejectedRecord } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { abbreviateState } from "@/lib/stateAbbreviations";
import { hashFile, fileToBase64, getPageCount } from "@/lib/pdfUtils";

const normalizeAddressKey = (addr: string) =>
  addr.toLowerCase().replace(/\b(street|road|avenue|drive|lane|court|boulevard|place|circle|way)\b/g, (m) => {
    const abbr: Record<string, string> = { street: "st", road: "rd", avenue: "ave", drive: "dr", lane: "ln", court: "ct", boulevard: "blvd", place: "pl", circle: "cir", way: "way" };
    return abbr[m] || m;
  }).replace(/[.,#]/g, "").replace(/\s+/g, " ").trim();

const fixStateCasing = (cityStateZip: string): string => {
  if (!cityStateZip) return cityStateZip;
  return cityStateZip.replace(/\b([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)/, (_match, state, zip) => {
    return `${state.toUpperCase()} ${zip}`;
  });
};

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
  const processingRef = useRef(false);
  const fileQueueRef = useRef<{ file: File; jobFileId: string; hash: string }[]>([]);

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

        const { data: files } = await supabase
          .from("job_files")
          .select("*")
          .eq("job_id", job.id)
          .order("created_at", { ascending: true });

        if (files) setJobFiles(files as JobFile[]);
      }
    };
    checkPendingJobs();
  }, []);

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
    const { error } = await supabase.from("leads").delete().in("id", ids);
    if (error) {
      toast.error("Failed to delete selected leads");
      return;
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

      if (mailAddrIdx === -1) { toast.error("CSV must have a 'Mail Address' column"); return; }

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
        const address = propAddrIdx >= 0 ? (cols[propAddrIdx] || "CSV") : "CSV";

        if (!mailAddress && address === "CSV") {
          rowClassifications.push({ rowIndex, classification: "failed", reason: "No mail address and no property address" });
          continue;
        }

        const mailKey = normalizeAddressKey(mailAddress);
        if (mailKey && seenMailingAddresses.has(mailKey)) {
          rowClassifications.push({ rowIndex, classification: "duplicate", reason: `Duplicate mailing address within file: ${mailAddress}` });
          continue;
        }
        if (mailKey) seenMailingAddresses.add(mailKey);

        const lastName = lastNameIdx >= 0 ? (cols[lastNameIdx] || "") : "";
        const statusRaw = statusIdx >= 0 ? (cols[statusIdx] || "").toUpperCase() : "GOOD";
        const status: "GOOD" | "BAD" | "PENDING" = statusRaw === "BAD" ? "BAD" : statusRaw === "PENDING" ? "PENDING" : "GOOD";

        let cityStateZip = "";
        if (combinedIdx >= 0) {
          cityStateZip = fixStateCasing(cols[combinedIdx] || "");
        } else if (cityIdx >= 0 && stateIdx >= 0 && zipIdx >= 0) {
          cityStateZip = `${cols[cityIdx] || ""} ${abbreviateState(cols[stateIdx] || "")} ${cols[zipIdx] || ""}`.trim();
        }

        newLeads.push({
          id: crypto.randomUUID(), address,
          addressKey: address === "CSV" ? normalizeAddressKey(`csv-${mailAddress}-${cityStateZip}`) : normalizeAddressKey(address),
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
      if (rowsInserted === 0) {
        toast.error(`No new rows to import. ${rowsDuplicate} duplicates, ${rowsFailed} failed.`);
        return;
      }

      await mergeAndPersist(newLeads);

      // Show detailed success toast
      const parts: string[] = [`${rowsInserted} inserted`];
      if (rowsDuplicate > 0) parts.push(`${rowsDuplicate} duplicates skipped`);
      if (rowsFailed > 0) parts.push(`${rowsFailed} failed`);
      toast.success(`CSV Import Complete: ${parts.join(", ")} (${totalRowsDetected} total rows)`);

      // Log failed rows for debugging
      if (rowsFailed > 0) {
        const failedRows = rowClassifications.filter(r => r.classification === "failed");
        console.warn("[CSV Validation] Failed rows:", failedRows);
      }
      if (rowsDuplicate > 0) {
        const dupRows = rowClassifications.filter(r => r.classification === "duplicate");
        console.log("[CSV Validation] Duplicate rows:", dupRows);
      }
    } catch (err) {
      console.error("CSV import error:", err);
      toast.error("Failed to parse CSV file");
    }
  };

  // --- Merge & Persist ---
  const mergeAndPersist = async (newLeads: LeadRecord[]) => {
    const existingRows = await fetchAllLeads();
    const existingByKey = new Map<string, any>();
    const existingByMail = new Map<string, any>();
    for (const row of existingRows || []) {
      existingByKey.set(row.address_key, row);
      if (row.mailing_address_1) existingByMail.set(normalizeAddressKey(row.mailing_address_1), row);
    }

    const upsertMap = new Map<string, any>();
    const seenMailKeys = new Set<string>();

    for (const lead of newLeads) {
      const key = lead.addressKey || normalizeAddressKey(lead.address);
      const mailKey = lead.mailingAddress1 ? normalizeAddressKey(lead.mailingAddress1) : "";
      if (mailKey) {
        if (seenMailKeys.has(mailKey)) continue;
        seenMailKeys.add(mailKey);
        const existingByMailRow = existingByMail.get(mailKey);
        if (existingByMailRow && existingByMailRow.address_key !== key) continue;
      }

      const existing = existingByKey.get(key);
      if (existing) {
        const hasTax = existing.has_tax_data || lead.hasTaxData;
        const hasHistory = existing.has_history_data || lead.hasHistoryData;
        const ownerLastName = lead.ownerLastName || existing.owner_last_name || "";
        const mailingAddress1 = lead.mailingAddress1 || existing.mailing_address_1 || "";
        const mailingAddress2 = lead.mailingAddress2 || existing.mailing_address_2 || "";
        const offMarketDate = lead.offMarketDate || existing.off_market_date || null;
        const saleDate = lead.saleDate || existing.sale_date || null;
        const lastRecordingDate = lead.lastRecordingDate || existing.last_recording_date || null;

        let status: "GOOD" | "BAD" | "PENDING" = lead.status !== "PENDING" ? lead.status : "PENDING";
        let analysisReason = lead.analysisReason;
        if (status === "PENDING" && hasTax && hasHistory) {
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
        }

        upsertMap.set(key, {
          id: existing.id, address: lead.address || existing.address, address_key: key,
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
    return newLeads.length;
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

  // --- Merge leads from multiple pages (client-side reconciliation) ---
  const mergePageLeads = (allLeads: any[]) => {
    const mergedByAddress = new Map<string, any>();
    for (const lead of allLeads) {
      const key = lead.address.toLowerCase().replace(/[.,#]/g, "").replace(/\s+/g, " ").trim();
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

  // --- Server-side job queue: process next file (one page at a time) ---
  const processNextFile = useCallback(async () => {
    if (processingRef.current) return;

    const nextItem = fileQueueRef.current[0];
    if (!nextItem) {
      if (activeJob) {
        await supabase.from("processing_jobs").update({
          status: "completed",
          updated_at: new Date().toISOString(),
        }).eq("id", activeJob.id);
      }
      return;
    }

    processingRef.current = true;
    const { file, jobFileId, hash } = nextItem;
    const isCSV = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";

    // Hashing phase
    await withRetry(() => updateJobFile(jobFileId, { status: "hashing", updated_at: new Date().toISOString() }));

    try {
      if (isCSV) {
        await handleImportCSV(file);
        await withRetry(() => updateJobFile(jobFileId, { status: "completed", updated_at: new Date().toISOString() }));
      } else {
        // Splitting phase
        await withRetry(() => updateJobFile(jobFileId, { status: "splitting", updated_at: new Date().toISOString() }));

        let pageCount = 1;
        try { pageCount = await getPageCount(file); } catch {}

        await withRetry(() => updateJobFile(jobFileId, { total_pages: pageCount, status: "processing", updated_at: new Date().toISOString() }));

        const base64 = await fileToBase64(file);

        // Process ONE PAGE AT A TIME to avoid edge function timeout
        const allPageLeads: any[] = [];
        for (let p = 1; p <= pageCount; p++) {
          const { data, error } = await supabase.functions.invoke("process-leads", {
            body: { name: file.name, base64, pageNum: p, totalPages: pageCount, job_file_id: jobFileId },
          });

          if (error) {
            const msg = error.message?.includes("429") ? "Rate limit reached" :
              error.message?.includes("402") ? "AI credits exhausted" : `Failed on page ${p}`;
            if (error.message?.includes("429") || error.message?.includes("402")) {
              throw new Error(msg);
            }
            console.error(`Page ${p} of ${file.name} failed:`, error.message);
            continue;
          }

          if (data?.leads && Array.isArray(data.leads)) {
            allPageLeads.push(...data.leads);
          }
        }

        const mergedLeads = mergePageLeads(allPageLeads);

        if (mergedLeads.length > 0) {
          await withRetry(() => updateJobFile(jobFileId, { status: "committing", updated_at: new Date().toISOString() }));
          await mergeAndPersist(mergedLeads);
          await withRetry(() => updateJobFile(jobFileId, { status: "completed", leads_found: mergedLeads.length, updated_at: new Date().toISOString() }));
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

      // Update job progress
      if (activeJob) {
        const { data: updatedFiles } = await supabase.from("job_files").select("status").eq("job_id", activeJob.id);
        if (updatedFiles) {
          const completed = updatedFiles.filter(f => f.status === "completed" || f.status === "skipped").length;
          const failed = updatedFiles.filter(f => f.status === "failed").length;
          await supabase.from("processing_jobs").update({
            completed_files: completed, failed_files: failed, status: "processing",
            updated_at: new Date().toISOString(),
          }).eq("id", activeJob.id);
        }
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unexpected error";
      await supabase.from("job_files").update({
        status: "failed", error_message: reason, updated_at: new Date().toISOString(),
      }).eq("id", jobFileId);
      addFailedUpload({ id: jobFileId, fileName: file.name, reason, timestamp: new Date() });
    }

    fileQueueRef.current = fileQueueRef.current.slice(1);
    processingRef.current = false;
    processNextFile();
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading leads...</p>
        </div>
      ) : (
        <LeadTable
          leads={leads}
          onDeleteLeads={handleDeleteLeads}
          onUpdateLastName={handleUpdateLastName}
          onImportCSV={handleImportCSV}
          fileUploader={
            <div className="flex items-center gap-3">
              <FileUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
              {activeJob && (
                <JobProgressPanel
                  job={activeJob}
                  files={jobFiles}
                  onDismiss={dismissJob}
                  onRetryFailed={handleRetryFailed}
                />
              )}
            </div>
          }
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
