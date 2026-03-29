import { useState } from "react";
import { toast } from "sonner";
import { Shield } from "lucide-react";
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
        setLeads((prev) => [...prev, ...data.leads]);
        const goodCount = data.leads.filter((l: LeadRecord) => l.status === "GOOD - PROSPECT").length;
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
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">The MLS Lead Master</h1>
            <p className="text-xs text-muted-foreground">Real-time lead validation for property marketing</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="max-w-xl">
          <FileUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
        </div>

        <LeadTable leads={leads} />
      </main>
    </div>
  );
};

export default Index;
