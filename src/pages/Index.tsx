import { useState } from "react";
import { toast } from "sonner";
import FileUploader from "@/components/FileUploader";
import LeadTable from "@/components/LeadTable";
import type { LeadRecord } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
        setLeads((prev) => {
          const combined = [...prev, ...data.leads];
          // Deduplicate by address, keeping the latest entry
          const map = new Map<string, LeadRecord>();
          for (const lead of combined) {
            const key = lead.address.toLowerCase().replace(/\s+/g, " ").trim();
            map.set(key, lead);
          }
          return Array.from(map.values());
        });
        const goodCount = data.leads.filter((l: LeadRecord) => l.status === "GOOD").length;
        toast.success(`Processed ${data.leads.length} properties — ${goodCount} prospects found!`);
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
        <LeadTable leads={leads} />
      </main>
    </div>
  );
};

export default Index;
