import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import FileUploader from "@/components/FileUploader";
import FileQueue from "@/components/FileQueue";
import FailedUploadsSidebar from "@/components/FailedUploadsSidebar";
import LeadTable from "@/components/LeadTable";
import type { LeadRecord, FileQueueItem, FailedUpload } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

const normalizeAddressKey = (addr: string) =>
  addr.toLowerCase().replace(/\b(street|road|avenue|drive|lane|court|boulevard|place|circle|way)\b/g, (m) => {
    const abbr: Record<string, string> = { street: "st", road: "rd", avenue: "ave", drive: "dr", lane: "ln", court: "ct", boulevard: "blvd", place: "pl", circle: "cir", way: "way" };
    return abbr[m] || m;
  }).replace(/[.,#]/g, "").replace(/\s+/g, " ").trim();

/** Fix state abbreviations like "Mn" → "MN" in "City Mn 55391" */
const fixStateCasing = (cityStateZip: string): string => {
  if (!cityStateZip) return cityStateZip;
  // Match pattern: "City XX ZIPCODE" where XX is 2-letter state
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

const Index = () => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queue, setQueue] = useState<FileQueueItem[]>([]);
  const [failedUploads, setFailedUploads] = useState<FailedUpload[]>([]);
  const processingRef = useRef(false);
  const queueRef = useRef<FileQueueItem[]>([]);
  // Dedup guard: track file names + sizes already queued this session
  const processedFilesRef = useRef(new Set<string>());

  const isProcessing = queue.some(q => q.status === "processing" || q.status === "queued");

  useEffect(() => {
    const loadLeads = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setLeads(data.map(mapRowToLead));
      setIsLoading(false);
    };
    loadLeads();
  }, []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const reloadLeads = async () => {
    const { data: allRows } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (allRows) setLeads(allRows.map(mapRowToLead));
  };

  const handleDeleteLeads = async (ids: string[]) => {
    const { error } = await supabase.from("leads").delete().in("id", ids);
    if (error) {
      toast.error("Failed to delete selected leads");
      console.error("Delete error:", error);
      return;
    }
    toast.success(`Deleted ${ids.length} lead${ids.length > 1 ? "s" : ""}`);
    await reloadLeads();
  };

  const mergeAndPersist = async (newLeads: LeadRecord[]) => {
    const { data: existingRows } = await supabase.from("leads").select("*");
    const existingMap = new Map<string, any>();
    for (const row of existingRows || []) existingMap.set(row.address_key, row);

    const upsertRows: any[] = [];

    for (const lead of newLeads) {
      const key = normalizeAddressKey(lead.address);
      const existing = existingMap.get(key);

      if (existing) {
        const hasTax = existing.has_tax_data || lead.hasTaxData;
        const hasHistory = existing.has_history_data || lead.hasHistoryData;
        const ownerLastName = lead.ownerLastName || existing.owner_last_name || "";
        const mailingAddress1 = lead.mailingAddress1 || existing.mailing_address_1 || "";
        const mailingAddress2 = lead.mailingAddress2 || existing.mailing_address_2 || "";
        const offMarketDate = lead.offMarketDate || existing.off_market_date || null;
        const saleDate = lead.saleDate || existing.sale_date || null;
        const lastRecordingDate = lead.lastRecordingDate || existing.last_recording_date || null;

        let status: "GOOD" | "BAD" | "PENDING" = "PENDING";
        let analysisReason = "Awaiting additional documentation for 360-degree view.";
        if (hasTax && hasHistory) {
          const offDate = offMarketDate ? new Date(offMarketDate) : null;
          const sDate = saleDate ? new Date(saleDate) : null;
          const rDate = lastRecordingDate ? new Date(lastRecordingDate) : null;
          if (offDate && ((rDate && rDate > offDate) || (sDate && sDate > offDate))) {
            status = "BAD";
            analysisReason = `Sale/recording date is after off-market date of ${offMarketDate}`;
          } else {
            status = "GOOD";
            analysisReason = lead.analysisReason && lead.status !== "PENDING"
              ? lead.analysisReason
              : "No sale record found after off-market date";
          }
        }

        upsertRows.push({
          id: existing.id, address: lead.address || existing.address, address_key: key,
          owner_last_name: ownerLastName, mailing_address_1: mailingAddress1, mailing_address_2: mailingAddress2,
          status, analysis_reason: analysisReason, off_market_date: offMarketDate,
          sale_date: saleDate, last_recording_date: lastRecordingDate,
          has_tax_data: hasTax, has_history_data: hasHistory, updated_at: new Date().toISOString(),
        });
      } else {
        upsertRows.push({
          id: lead.id, address: lead.address, address_key: key,
          owner_last_name: lead.ownerLastName, mailing_address_1: lead.mailingAddress1,
          mailing_address_2: lead.mailingAddress2, status: lead.status,
          analysis_reason: lead.analysisReason, off_market_date: lead.offMarketDate,
          sale_date: lead.saleDate, last_recording_date: lead.lastRecordingDate,
          has_tax_data: lead.hasTaxData, has_history_data: lead.hasHistoryData,
          updated_at: new Date().toISOString(),
        });
      }
    }

    const { error } = await supabase.from("leads").upsert(upsertRows, { onConflict: "address_key" });
    if (error) console.error("Failed to persist leads:", error);

    await reloadLeads();
    return newLeads.length;
  };

  const processNext = useCallback(async () => {
    if (processingRef.current) return;

    const nextItem = queueRef.current.find(q => q.status === "queued");
    if (!nextItem) return;

    processingRef.current = true;
    const itemId = nextItem.id;

    // Update status to processing
    queueRef.current = queueRef.current.map(q => q.id === itemId ? { ...q, status: "processing" as const } : q);
    setQueue([...queueRef.current]);

    try {
      const base64 = await fileToBase64(nextItem.file);
      const { data, error } = await supabase.functions.invoke("process-leads", {
        body: { files: [{ name: nextItem.file.name, base64 }] },
      });

      if (error) {
        const msg = error.message?.includes("429") ? "Rate limit reached" :
          error.message?.includes("402") ? "AI credits exhausted" : "Processing failed";
        queueRef.current = queueRef.current.map(q => q.id === itemId ? { ...q, status: "failed" as const, error: msg } : q);
        setQueue([...queueRef.current]);
        setFailedUploads(prev => [...prev, { id: itemId, fileName: nextItem.file.name, reason: msg, timestamp: new Date() }]);
      } else if (data?.leads && Array.isArray(data.leads) && data.leads.length > 0) {
        await mergeAndPersist(data.leads);
        // Auto-clear completed file from queue immediately
        queueRef.current = queueRef.current.filter(q => q.id !== itemId);
        setQueue([...queueRef.current]);
      } else {
        const reason = data?.error || "No readable address or data found in PDF";
        queueRef.current = queueRef.current.map(q => q.id === itemId ? { ...q, status: "failed" as const, error: reason } : q);
        setQueue([...queueRef.current]);
        setFailedUploads(prev => [...prev, { id: itemId, fileName: nextItem.file.name, reason, timestamp: new Date() }]);
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unexpected error";
      queueRef.current = queueRef.current.map(q => q.id === itemId ? { ...q, status: "failed" as const, error: reason } : q);
      setQueue([...queueRef.current]);
      setFailedUploads(prev => [...prev, { id: itemId, fileName: nextItem.file.name, reason, timestamp: new Date() }]);
    }

    processingRef.current = false;

    // Process next in queue
    processNext();
  }, []);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newItems: FileQueueItem[] = [];
    for (const file of files) {
      const fileKey = `${file.name}__${file.size}`;
      if (processedFilesRef.current.has(fileKey)) {
        toast.warning(`"${file.name}" already uploaded this session — skipped.`);
        continue;
      }
      processedFilesRef.current.add(fileKey);
      newItems.push({ id: crypto.randomUUID(), file, status: "queued" });
    }

    if (newItems.length === 0) return;

    queueRef.current = [...queueRef.current, ...newItems];
    setQueue([...queueRef.current]);

    // Kick off processing immediately
    processNext();
  }, [processNext]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Lead Pro
            </h1>
            <span className="text-xs text-muted-foreground font-medium">Real-time lead validation</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 py-4 gap-4 min-h-0">
        <div className="flex items-start gap-4 flex-wrap flex-shrink-0">
          <FileUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
          <FileQueue items={queue} />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading leads...</p>
        ) : (
          <LeadTable leads={leads} onDeleteLeads={handleDeleteLeads} />
        )}
      </main>

      <FailedUploadsSidebar
        items={failedUploads}
        onDismiss={(id) => setFailedUploads(prev => prev.filter(f => f.id !== id))}
        onClear={() => setFailedUploads([])}
      />
    </div>
  );
};

export default Index;
