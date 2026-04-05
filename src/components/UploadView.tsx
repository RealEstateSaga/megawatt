import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { parseCsvRecords, makeDedupeKey } from "@/lib/csv-utils";
import type { MailRecord } from "@/lib/types";

interface UploadViewProps {
  allRecords: MailRecord[];
  onRecordsAdded: (records: MailRecord[], targetList: "new" | "completed") => void;
}

export const UploadView = ({ allRecords, onRecordsAdded }: UploadViewProps) => {
  const [pasteText, setPasteText] = useState("");
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingKeys = new Set(allRecords.map((r) => makeDedupeKey(r)));

  const dedupeAndAdd = (parsed: MailRecord[], targetList: "new" | "completed") => {
    const newRecords = parsed.filter((r) => {
      const key = makeDedupeKey(r);
      if (existingKeys.has(key)) return false;
      existingKeys.add(key);
      return true;
    });

    const dupeCount = parsed.length - newRecords.length;
    onRecordsAdded(
      newRecords.map((r) => ({ ...r, list: targetList })),
      targetList
    );

    const passCount = newRecords.filter((r) => r.status === "Pass").length;
    const failCount = newRecords.filter((r) => r.status === "Fail").length;
    toast.success(
      `Added ${newRecords.length} records to ${targetList === "new" ? "New" : "Completed"} (${passCount} Pass, ${failCount} Fail${dupeCount > 0 ? `, ${dupeCount} duplicates skipped` : ""})`
    );
  };

  const handlePasteSubmit = async (targetList: "new" | "completed") => {
    if (!pasteText.trim()) {
      toast.error("Paste some data first");
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-text", {
        body: { text: pasteText },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const parsed: MailRecord[] = (data.records || []).map((r: any) => ({
        id: crypto.randomUUID(),
        ownerLastName: r.owner_last_name || "",
        mailAddress: r.mail_address || "",
        mailCity: r.mail_city || "",
        mailState: r.mail_state || "",
        mailZip: r.mail_zip || "",
        status: r.status === "Pass" ? "Pass" : "Fail",
        list: targetList,
      }));

      dedupeAndAdd(parsed, targetList);
      setPasteText("");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to process data");
    } finally {
      setProcessing(false);
    }
  };

  const handleCsvUpload = (targetList: "new" | "completed") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setProcessing(true);
      try {
        const text = await file.text();
        const parsed = parseCsvRecords(text);
        if (parsed.length === 0) {
          toast.error("No records found in CSV");
          return;
        }
        dedupeAndAdd(parsed, targetList);
      } catch (e: any) {
        console.error(e);
        toast.error("Failed to parse CSV file");
      } finally {
        setProcessing(false);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div>
        <h2 className="text-lg font-medium mb-1">Real Estate Data</h2>
      </div>

      {/* CSV Upload */}
      <div className="flex items-center gap-3 p-4 border border-dashed border-border rounded-lg bg-muted/20">
        <FileUp className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Upload CSV File</p>
          <p className="text-xs text-muted-foreground">Import a previously downloaded mailing list CSV</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleCsvUpload("new")} disabled={processing}>
            To New
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleCsvUpload("completed")} disabled={processing}>
            To Completed
          </Button>
        </div>
      </div>

      {/* Paste area */}
      <Textarea
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        placeholder="Paste your data here..."
        className="min-h-[350px] font-mono text-xs leading-relaxed"
        disabled={processing}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {pasteText.length > 0 ? `${pasteText.length.toLocaleString()} characters` : ""}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handlePasteSubmit("completed")}
            disabled={processing || !pasteText.trim()}
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit to Completed"
            )}
          </Button>
          <Button
            onClick={() => handlePasteSubmit("new")}
            disabled={processing || !pasteText.trim()}
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit to New"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
