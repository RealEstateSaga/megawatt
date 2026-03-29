import { useState, useEffect } from "react";
import { toast } from "sonner";
import FileUploader from "@/components/FileUploader";
import LeadTable from "@/components/LeadTable";
import type { LeadRecord } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

const normalizeAddressKey = (addr: string) =>
  addr.toLowerCase().replace(/\s+/g, " ").trim();

const Index = () => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing leads from DB on mount
  useEffect(() => {
    const loadLeads = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load leads:", error);
      } else if (data) {
        setLeads(
          data.map((row: any) => ({
            id: row.id,
            address: row.address,
            addressKey: row.address_key,
            ownerLastName: row.owner_last_name || "",
            mailingAddress1: row.mailing_address_1 || "",
            mailingAddress2: row.mailing_address_2 || "",
            status: row.status as "GOOD" | "BAD" | "PENDING",
            analysisReason: row.analysis_reason || "",
            offMarketDate: row.off_market_date || null,
            saleDate: row.sale_date || null,
            lastRecordingDate: row.last_recording_date || null,
            hasTaxData: row.has_tax_data,
            hasHistoryData: row.has_history_data,
          }))
        );
      }
      setIsLoading(false);
    };
    loadLeads();
  }, []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const mergeAndPersist = async (newLeads: LeadRecord[]) => {
    // Build a map of existing leads by addressKey
    const { data: existingRows } = await supabase.from("leads").select("*");
    const existingMap = new Map<string, any>();
    for (const row of existingRows || []) {
      existingMap.set(row.address_key, row);
    }

    const upsertRows: any[] = [];
    const mergedLeads: LeadRecord[] = [];

    for (const lead of newLeads) {
      const key = normalizeAddressKey(lead.address);
      const existing = existingMap.get(key);

      let merged: any;
      if (existing) {
        // Merge: fill in blanks
        const hasTax = existing.has_tax_data || lead.hasTaxData;
        const hasHistory = existing.has_history_data || lead.hasHistoryData;
        const ownerLastName = lead.ownerLastName || existing.owner_last_name || "";
        const mailingAddress1 = lead.mailingAddress1 || existing.mailing_address_1 || "";
        const mailingAddress2 = lead.mailingAddress2 || existing.mailing_address_2 || "";
        const offMarketDate = lead.offMarketDate || existing.off_market_date || null;
        const saleDate = lead.saleDate || existing.sale_date || null;
        const lastRecordingDate = lead.lastRecordingDate || existing.last_recording_date || null;

        // Recalculate status
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

        merged = {
          id: existing.id,
          address: lead.address || existing.address,
          address_key: key,
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
        };
      } else {
        merged = {
          id: lead.id,
          address: lead.address,
          address_key: key,
          owner_last_name: lead.ownerLastName,
          mailing_address_1: lead.mailingAddress1,
          mailing_address_2: lead.mailingAddress2,
          status: lead.status,
          analysis_reason: lead.analysisReason,
          off_market_date: lead.offMarketDate,
          sale_date: lead.saleDate,
          last_recording_date: lead.lastRecordingDate,
          has_tax_data: lead.hasTaxData,
          has_history_data: lead.hasHistoryData,
          updated_at: new Date().toISOString(),
        };
      }

      upsertRows.push(merged);
      mergedLeads.push({
        id: merged.id,
        address: merged.address,
        addressKey: merged.address_key,
        ownerLastName: merged.owner_last_name,
        mailingAddress1: merged.mailing_address_1,
        mailingAddress2: merged.mailing_address_2,
        status: merged.status as "GOOD" | "BAD" | "PENDING",
        analysisReason: merged.analysis_reason,
        offMarketDate: merged.off_market_date,
        saleDate: merged.sale_date,
        lastRecordingDate: merged.last_recording_date,
        hasTaxData: merged.has_tax_data,
        hasHistoryData: merged.has_history_data,
      });
    }

    // Upsert to DB
    const { error } = await supabase
      .from("leads")
      .upsert(upsertRows, { onConflict: "address_key" });

    if (error) {
      console.error("Failed to persist leads:", error);
      toast.error("Failed to save leads to database.");
    }

    // Reload all leads from DB for consistency
    const { data: allRows } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (allRows) {
      setLeads(
        allRows.map((row: any) => ({
          id: row.id,
          address: row.address,
          addressKey: row.address_key,
          ownerLastName: row.owner_last_name || "",
          mailingAddress1: row.mailing_address_1 || "",
          mailingAddress2: row.mailing_address_2 || "",
          status: row.status as "GOOD" | "BAD" | "PENDING",
          analysisReason: row.analysis_reason || "",
          offMarketDate: row.off_market_date || null,
          saleDate: row.sale_date || null,
          lastRecordingDate: row.last_recording_date || null,
          hasTaxData: row.has_tax_data,
          hasHistoryData: row.has_history_data,
        }))
      );
    }

    return mergedLeads;
  };

  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true);
    toast.info(`Processing ${files.length} PDF(s) with AI...`);

    try {
      const pdfDataArray = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          base64: await fileToBase64(f),
        }))
      );

      const { data, error } = await supabase.functions.invoke("process-leads", {
        body: { files: pdfDataArray },
      });

      if (error) {
        console.error("Edge function error:", error);
        if (error.message?.includes("429")) {
          toast.error("Rate limit reached. Please wait a moment and try again.");
        } else if (error.message?.includes("402")) {
          toast.error("AI credits exhausted. Please add funds in Settings → Workspace → Usage.");
        } else {
          toast.error("Failed to process files. Please try again.");
        }
        return;
      }

      if (data?.leads && Array.isArray(data.leads)) {
        const merged = await mergeAndPersist(data.leads);
        const goodCount = merged.filter((l) => l.status === "GOOD").length;
        const pendingCount = merged.filter((l) => l.status === "PENDING").length;
        let msg = `Processed ${data.leads.length} properties — ${goodCount} prospects found!`;
        if (pendingCount > 0) msg += ` ${pendingCount} awaiting additional docs.`;
        toast.success(msg);
      } else {
        toast.warning("No lead data could be extracted from these files.");
      }
    } catch (err) {
      console.error("Processing error:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-full mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Lead Pro
            </h1>
            <span className="text-xs text-muted-foreground font-medium">Real-time lead validation</span>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-6 py-5 space-y-5">
        <FileUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading leads...</p>
        ) : (
          <LeadTable leads={leads} />
        )}
      </main>
    </div>
  );
};

export default Index;
