import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Upload, Download, ArrowRight, ArrowLeft, Loader2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordTable } from "@/components/RecordTable";
import { UploadView } from "@/components/UploadView";
import { downloadRecordsCSV, parseCsvRecords, makeDedupeKey } from "@/lib/csv-utils";
import { useRecords } from "@/hooks/use-records";
import type { MailRecord } from "@/lib/types";

type View = "new" | "completed" | "upload";

const Index = () => {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("dlp_auth") === "1");
  const [view, setView] = useState<View>("upload");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { records, loading, addRecords, moveRecords } = useRecords();

  const newRecords = records.filter((r) => r.list === "new");
  const completedRecords = records.filter((r) => r.list === "completed");
  const currentRecords = view === "new" ? newRecords : completedRecords;

  const passCount = currentRecords.filter((r) => r.status === "Pass").length;
  const failCount = currentRecords.filter((r) => r.status === "Fail").length;

  const handleRecordsAdded = useCallback(async (newRecs: MailRecord[], targetList: "new" | "completed") => {
    await addRecords(newRecs.map((r) => ({ ...r, list: targetList })));
    setView(targetList);
  }, [addRecords]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(currentRecords.map((r) => r.id)));
  }, [currentRecords]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleMove = useCallback(async () => {
    const targetList = view === "new" ? "completed" : "new";
    await moveRecords(selectedIds, targetList);
    toast.success(`Moved ${selectedIds.size} records to ${targetList === "new" ? "New" : "Complete"}`);
    setSelectedIds(new Set());
  }, [view, selectedIds, moveRecords]);

  const handleDownload = useCallback(() => {
    const passRecords = currentRecords.filter((r) => r.status === "Pass");
    if (passRecords.length === 0) {
      toast.error("No passing records to download");
      return;
    }
    const count = downloadRecordsCSV(passRecords);
    toast.success(`Downloaded ${count} records`);
  }, [currentRecords]);

  const handleViewChange = (v: View) => {
    setView(v);
    setSelectedIds(new Set());
  };

  const handleCsvUpload = useCallback((targetList: "new" | "completed") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = parseCsvRecords(text);
        if (parsed.length === 0) {
          toast.error("No records found in CSV");
          return;
        }
        const existingKeys = new Set(records.map((r) => makeDedupeKey(r)));
        const newRecs = parsed.filter((r) => {
          const key = makeDedupeKey(r);
          if (existingKeys.has(key)) return false;
          existingKeys.add(key);
          return true;
        });
        await addRecords(newRecs.map((r) => ({ ...r, list: targetList })));
        setView(targetList);
        toast.success(`Added ${newRecs.length} records to ${targetList === "new" ? "New" : "Complete"}`);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to parse CSV file");
      }
    };
    input.click();
  }, [records, addRecords]);

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative">
        <button
          onClick={() => { localStorage.setItem("dlp_auth", "1"); setLoggedIn(true); }}
          className="absolute bottom-6 right-6 text-sm text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
        >
          Pro
        </button>
      </div>
    );
  }

  const showListActions = view === "new" || view === "completed";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="sticky top-0 z-20 border-b border-border bg-card px-4 py-2 flex items-center gap-2 flex-wrap">
          <Button
            variant={view === "new" ? "default" : "outline"}
            size="sm"
            className="min-w-[7rem] justify-center whitespace-nowrap"
            onClick={() => handleViewChange("new")}
          >
            New
            {newRecords.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({newRecords.length})</span>
            )}
          </Button>
          <Button
            variant={view === "completed" ? "default" : "outline"}
            size="sm"
            className="min-w-[7rem] justify-center whitespace-nowrap"
            onClick={() => handleViewChange("completed")}
          >
            Complete
            {completedRecords.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({completedRecords.length})</span>
            )}
          </Button>
          <Button
            variant={view === "upload" ? "default" : "outline"}
            size="sm"
            className="min-w-[7rem] justify-center whitespace-nowrap"
            onClick={() => handleViewChange("upload")}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Upload
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="min-w-[7rem] justify-center whitespace-nowrap"
            onClick={() => handleCsvUpload("new")}
          >
            <FileUp className="h-4 w-4 mr-1.5" />
            CSV to New
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-w-[7rem] justify-center whitespace-nowrap"
            onClick={() => handleCsvUpload("completed")}
          >
            <FileUp className="h-4 w-4 mr-1.5" />
            CSV to Complete
          </Button>

          {showListActions && currentRecords.length > 0 && (
            <div className="flex items-center gap-3 text-sm ml-2">
              <span className="text-accent font-medium">{passCount} Pass</span>
              <span className="text-destructive font-medium">{failCount} Fail</span>
              <span className="text-muted-foreground">({currentRecords.length} total)</span>
            </div>
          )}

          {showListActions && selectedIds.size > 0 && (
            <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={handleMove}>
              {view === "new" ? (
                <>
                  <ArrowRight className="h-4 w-4 mr-1.5" />
                  Move to Complete ({selectedIds.size})
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Move to New ({selectedIds.size})
                </>
              )}
            </Button>
          )}

          {showListActions && currentRecords.some((r) => r.status === "Pass") && (
            <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1.5" />
              Download CSV
            </Button>
          )}
      </div>

      {loading && showListActions && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading records...
        </div>
      )}

      {view === "upload" && (
        <UploadView allRecords={records} onRecordsAdded={handleRecordsAdded} />
      )}

      {showListActions && !loading && (
        <RecordTable
          records={currentRecords}
          listType={view}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
        />
      )}
    </div>
  );
};

export default Index;
