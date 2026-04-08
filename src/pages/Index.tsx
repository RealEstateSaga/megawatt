import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Upload, Download, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordTable } from "@/components/RecordTable";
import { UploadView } from "@/components/UploadView";
import { downloadRecordsCSV } from "@/lib/csv-utils";
import type { MailRecord } from "@/lib/types";

type View = "new" | "completed" | "upload";

const Index = () => {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("dlp_auth") === "1");
  const [view, setView] = useState<View>("upload");
  const [records, setRecords] = useState<MailRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const newRecords = records.filter((r) => r.list === "new");
  const completedRecords = records.filter((r) => r.list === "completed");
  const currentRecords = view === "new" ? newRecords : completedRecords;

  const passCount = currentRecords.filter((r) => r.status === "Pass").length;
  const failCount = currentRecords.filter((r) => r.status === "Fail").length;

  const handleRecordsAdded = useCallback((newRecs: MailRecord[], targetList: "new" | "completed") => {
    setRecords((prev) => [...prev, ...newRecs]);
    setView(targetList);
  }, []);

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

  const handleMove = useCallback(() => {
    const targetList = view === "new" ? "completed" : "new";
    setRecords((prev) =>
      prev.map((r) => (selectedIds.has(r.id) ? { ...r, list: targetList } : r))
    );
    toast.success(`Moved ${selectedIds.size} records to ${targetList === "new" ? "New" : "Complete"}`);
    setSelectedIds(new Set());
  }, [view, selectedIds]);

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

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative">
        <h1 className="text-5xl font-bold text-muted-foreground/50 tracking-tight">DataLeadPro</h1>
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
      <div className="sticky top-0 z-20 border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight mr-3">DataLead Pro</h1>
          <Button
            variant={view === "new" ? "default" : "outline"}
            size="sm"
            className="w-28 justify-center"
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
            className="w-28 justify-center"
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
            className="w-28 justify-center"
            onClick={() => handleViewChange("upload")}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Upload
          </Button>

          {showListActions && selectedIds.size > 0 && (
            <Button variant="outline" size="sm" onClick={handleMove}>
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
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1.5" />
              Download CSV
            </Button>
          )}
        </div>

        {showListActions && currentRecords.length > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-accent font-medium">{passCount} Pass</span>
            <span className="text-destructive font-medium">{failCount} Fail</span>
            <span className="text-muted-foreground">({currentRecords.length} total)</span>
          </div>
        )}
      </div>

      {view === "upload" && (
        <UploadView allRecords={records} onRecordsAdded={handleRecordsAdded} />
      )}

      {showListActions && (
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
