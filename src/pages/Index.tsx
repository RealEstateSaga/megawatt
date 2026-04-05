import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RecordTable } from "@/components/RecordTable";
import { UploadView } from "@/components/UploadView";
import { downloadRecordsCSV } from "@/lib/csv-utils";
import type { MailRecord } from "@/lib/types";

type View = "lists" | "upload";

const Index = () => {
  const [view, setView] = useState<View>("upload");
  const [records, setRecords] = useState<MailRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"new" | "completed">("new");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const newRecords = records.filter((r) => r.list === "new");
  const completedRecords = records.filter((r) => r.list === "completed");
  const currentRecords = activeTab === "new" ? newRecords : completedRecords;

  const handleRecordsAdded = useCallback((newRecs: MailRecord[], targetList: "new" | "completed") => {
    setRecords((prev) => [...prev, ...newRecs]);
    setActiveTab(targetList);
    setView("lists");
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
    const targetList = activeTab === "new" ? "completed" : "new";
    setRecords((prev) =>
      prev.map((r) => (selectedIds.has(r.id) ? { ...r, list: targetList } : r))
    );
    toast.success(`Moved ${selectedIds.size} records to ${targetList === "new" ? "New" : "Completed"}`);
    setSelectedIds(new Set());
  }, [activeTab, selectedIds]);

  const handleDownload = useCallback(() => {
    const passRecords = currentRecords.filter((r) => r.status === "Pass");
    if (passRecords.length === 0) {
      toast.error("No passing records to download");
      return;
    }
    const count = downloadRecordsCSV(passRecords);
    toast.success(`Downloaded ${count} records`);
  }, [currentRecords]);

  // Clear selection when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "new" | "completed");
    setSelectedIds(new Set());
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">DataLead Pro</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "lists" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("lists")}
          >
            Lists
            {records.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({records.length})</span>
            )}
          </Button>
          <Button
            variant={view === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("upload")}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Upload
          </Button>
        </div>
      </div>

      {/* Upload View */}
      {view === "upload" && (
        <UploadView allRecords={records} onRecordsAdded={handleRecordsAdded} />
      )}

      {/* List View */}
      {view === "lists" && (
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="new">
                New {newRecords.length > 0 && `(${newRecords.length})`}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed {completedRecords.length > 0 && `(${completedRecords.length})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="new">
              <RecordTable
                records={newRecords}
                listType="new"
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onMove={handleMove}
                onDownload={handleDownload}
              />
            </TabsContent>
            <TabsContent value="completed">
              <RecordTable
                records={completedRecords}
                listType="completed"
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onMove={handleMove}
                onDownload={handleDownload}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Index;
