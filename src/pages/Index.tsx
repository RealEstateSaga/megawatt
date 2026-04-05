import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordTable } from "@/components/RecordTable";
import { UploadView } from "@/components/UploadView";
import { downloadRecordsCSV } from "@/lib/csv-utils";
import type { MailRecord } from "@/lib/types";

type View = "new" | "completed" | "upload";

const Index = () => {
  const [view, setView] = useState<View>("upload");
  const [records, setRecords] = useState<MailRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const newRecords = records.filter((r) => r.list === "new");
  const completedRecords = records.filter((r) => r.list === "completed");
  const currentRecords = view === "new" ? newRecords : completedRecords;

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
    toast.success(`Moved ${selectedIds.size} records to ${targetList === "new" ? "New" : "Completed"}`);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">DataLead Pro</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "new" ? "default" : "outline"}
            size="sm"
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
            onClick={() => handleViewChange("completed")}
          >
            Completed
            {completedRecords.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({completedRecords.length})</span>
            )}
          </Button>
          <Button
            variant={view === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewChange("upload")}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Upload
          </Button>
        </div>
      </div>

      {view === "upload" && (
        <UploadView allRecords={records} onRecordsAdded={handleRecordsAdded} />
      )}

      {(view === "new" || view === "completed") && (
        <div className="p-6">
          <RecordTable
            records={currentRecords}
            listType={view}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onMove={handleMove}
            onDownload={handleDownload}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
