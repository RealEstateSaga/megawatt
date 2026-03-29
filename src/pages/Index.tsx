import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import PasswordGate from "@/components/PasswordGate";
import FileUploader from "@/components/FileUploader";
import JobProgressPanel from "@/components/JobProgressPanel";
import FailedUploadsSidebar from "@/components/FailedUploadsSidebar";
import LeadTable from "@/components/LeadTable";
import type { LeadRecord, FailedUpload } from "@/lib/types";
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
  status: "queued" | "processing" | "completed" | "failed" | "skipped";
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

const Index = () => {
  const [authed, setAuthed] = useState(() => localStorage.getItem("lp_auth") === "1");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [jobFiles, setJobFiles] = useState<JobFile[]>([]);
  const [failedUploads, setFailedUploads] = useState<FailedUpload[]>(() => loadPersistedFailures());
  const processingRef = useRef(false);
  const fileQueueRef = useRef<{ file: File; jobFileId: string; hash: string }[]>([]);

  const isProcessing = activeJob?.status === "processing" || activeJob?.status === "pending";

  // --- Load leads ---
  useEffect(() => {
    const loadLeads = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10000);
      if (!error && data) setLeads(data.map(mapRowToLead));
      setIsLoading(false);
    };
    loadLeads();
  }, []);

  // --- Check for in-progress jobs on mount (persistent recovery) ---
  useEffect(() => {
    const checkPendingJobs = async () => {
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

  const reloadLeads = async () => {
    const { data: allRows } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(10000);
    if (allRows) setLeads(allRows.map(mapRowToLead));
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

  // --- CSV Import ---
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

      const newLeads: LeadRecord[] = [];
      const seenMailingAddresses = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVRow(lines[i]);
        if (cols.length < 3) continue;
        const mailAddress = cols[mailAddrIdx] || "";
        const address = propAddrIdx >= 0 ? (cols[propAddrIdx] || "CSV") : "CSV";
        if (!mailAddress && address === "CSV") continue;
        const mailKey = normalizeAddressKey(mailAddress);
        if (mailKey && seenMailingAddresses.has(mailKey)) continue;
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
      }

      if (newLeads.length === 0) { toast.error("No valid rows found in CSV"); return; }
      await mergeAndPersist(newLeads);
      toast.success(`Imported ${newLeads.length} leads from CSV`);
    } catch (err) {
      console.error("CSV import error:", err);
      toast.error("Failed to parse CSV file");
    }
  };

  // --- Merge & Persist ---
  const mergeAndPersist = async (newLeads: LeadRecord[]) => {
    const { data: existingRows } = await supabase.from("leads").select("*").limit(10000);
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

  // --- Server-side job queue: process next file ---
  const processNextFile = useCallback(async () => {
    if (processingRef.current) return;

    const nextItem = fileQueueRef.current[0];
    if (!nextItem) {
      // All files done — update job status
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

    // Update job_file status to processing
    await supabase.from("job_files").update({
      status: "processing",
      updated_at: new Date().toISOString(),
    }).eq("id", jobFileId);

    try {
      if (isCSV) {
        await handleImportCSV(file);
        await supabase.from("job_files").update({
          status: "completed",
          updated_at: new Date().toISOString(),
        }).eq("id", jobFileId);
      } else {
        // Get page count for the PDF
        let pageCount = 1;
        try {
          pageCount = await getPageCount(file);
        } catch {
          // If page count fails, process as single page
        }

        await supabase.from("job_files").update({
          total_pages: pageCount,
          updated_at: new Date().toISOString(),
        }).eq("id", jobFileId);

        const base64 = await fileToBase64(file);

        // Send each page individually to prevent context thinning
        const pageFiles = [];
        for (let p = 1; p <= pageCount; p++) {
          pageFiles.push({ name: file.name, base64, pageNum: p, totalPages: pageCount });
        }

        const { data, error } = await supabase.functions.invoke("process-leads", {
          body: { files: pageFiles, job_file_id: jobFileId },
        });

        if (error) {
          const msg = error.message?.includes("429") ? "Rate limit reached" :
            error.message?.includes("402") ? "AI credits exhausted" : "Processing failed";
          await supabase.from("job_files").update({
            status: "failed",
            error_message: msg,
            updated_at: new Date().toISOString(),
          }).eq("id", jobFileId);
          addFailedUpload({ id: jobFileId, fileName: file.name, reason: msg, timestamp: new Date() });
        } else if (data?.leads && Array.isArray(data.leads) && data.leads.length > 0) {
          await mergeAndPersist(data.leads);
          await supabase.from("job_files").update({
            status: "completed",
            leads_found: data.leads.length,
            updated_at: new Date().toISOString(),
          }).eq("id", jobFileId);
        } else {
          const reason = data?.error || "No readable address or data found in PDF";
          await supabase.from("job_files").update({
            status: "failed",
            error_message: reason,
            updated_at: new Date().toISOString(),
          }).eq("id", jobFileId);
          addFailedUpload({ id: jobFileId, fileName: file.name, reason, timestamp: new Date() });
        }
      }

      // Only register hash on successful processing (not on failure)
      if (fileQueueRef.current.length > 0 || true) {
        const { data: fileStatus } = await supabase
          .from("job_files")
          .select("status")
          .eq("id", jobFileId)
          .maybeSingle();

        if (fileStatus?.status === "completed") {
          await supabase.from("file_hashes").upsert({
            sha256: hash,
            file_name: file.name,
            file_size: file.size,
          }, { onConflict: "sha256" });
        }
      }

      // Update job progress
      if (activeJob) {
        const { data: updatedFiles } = await supabase
          .from("job_files")
          .select("status")
          .eq("job_id", activeJob.id);

        if (updatedFiles) {
          const completed = updatedFiles.filter(f => f.status === "completed" || f.status === "skipped").length;
          const failed = updatedFiles.filter(f => f.status === "failed").length;
          await supabase.from("processing_jobs").update({
            completed_files: completed,
            failed_files: failed,
            status: "processing",
            updated_at: new Date().toISOString(),
          }).eq("id", activeJob.id);
        }
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unexpected error";
      await supabase.from("job_files").update({
        status: "failed",
        error_message: reason,
        updated_at: new Date().toISOString(),
      }).eq("id", jobFileId);
      addFailedUpload({ id: jobFileId, fileName: file.name, reason, timestamp: new Date() });
    }

    // Remove processed item from queue
    fileQueueRef.current = fileQueueRef.current.slice(1);
    processingRef.current = false;
    processNextFile();
  }, [activeJob]);

  // --- Handle file drop ---
  const handleFilesSelected = useCallback(async (files: File[]) => {
    // 1. Hash all files and check against DB
    const validFiles: { file: File; hash: string }[] = [];
    for (const file of files) {
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

    setJobFiles(jobFilesData as JobFile[]);

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
  }, [processNextFile]);

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
    // Reset their hashes from file_hashes so re-drop won't be blocked
    const hashes = failedFiles.map(f => f.file_hash);
    supabase.from("file_hashes").delete().in("sha256", hashes).then(() => {
      // Mark them as skipped so they don't block the job
      for (const f of failedFiles) {
        supabase.from("job_files").update({ status: "skipped", error_message: "Awaiting re-upload" }).eq("id", f.id);
      }
    });
  }, [jobFiles]);

  if (!authed) return <PasswordGate onUnlock={() => setAuthed(true)} />;

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
