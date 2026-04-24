import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Download, Loader2, FileUp, Trash2, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { downloadRecordsCSV, parseCsvRecords } from "@/lib/csv-utils";
import { parseHtmlTable } from "@/lib/html-table-parser";
import { useRecords, type AddResult } from "@/hooks/use-records";
import type { MailRecord } from "@/lib/types";

const Index = () => {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("dlp_auth") === "1");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pasteText, setPasteText] = useState("");
  const [pasteHtml, setPasteHtml] = useState<string | null>(null);
  const [hasTableData, setHasTableData] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { records, loading, addRecords, deleteRecords } = useRecords();

  const sortedRecords = useMemo(() => records, [records]);

  const reportAddResult = (result: AddResult) => {
    if (result.inserted > 0 && result.duplicates === 0) {
      toast.success(`Added ${result.inserted} record${result.inserted === 1 ? "" : "s"}`);
    } else if (result.inserted > 0 && result.duplicates > 0) {
      toast.success(
        `Added ${result.inserted} new · skipped ${result.duplicates} duplicate${result.duplicates === 1 ? "" : "s"}`,
        { duration: 6000 }
      );
    } else if (result.inserted === 0 && result.duplicates > 0) {
      toast.error(
        `All ${result.duplicates} record${result.duplicates === 1 ? " was a duplicate" : "s were duplicates"} — nothing saved`,
        { duration: 6000 }
      );
    } else {
      toast.error("No records were saved");
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData("text/html");
    if (html && /<table[\s>]/i.test(html)) {
      setPasteHtml(html);
      setHasTableData(true);
    } else {
      setPasteHtml(null);
      setHasTableData(false);
    }
  }, []);

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) {
      toast.error("Paste some data first");
      return;
    }
    setProcessing(true);
    try {
      let parsed: MailRecord[] = [];

      if (pasteHtml) {
        const tableRecords = parseHtmlTable(pasteHtml);
        if (tableRecords && tableRecords.length > 0) parsed = tableRecords;
      }

      if (parsed.length === 0) {
        const { data, error } = await supabase.functions.invoke("parse-text", {
          body: { text: pasteText },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        parsed = (data.records || []).map((r: any) => ({
          id: crypto.randomUUID(),
          ownerLastName: r.owner_last_name || "",
          mailAddress: r.mail_address || "",
          mailCity: r.mail_city || "",
          mailState: r.mail_state || "",
          mailZip: r.mail_zip || "",
        }));
      }

      if (parsed.length === 0) {
        toast.error("No records found in pasted data");
        return;
      }

      const result = await addRecords(parsed);
      reportAddResult(result);
      setPasteText("");
      setPasteHtml(null);
      setHasTableData(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to process data");
    } finally {
      setProcessing(false);
    }
  };

  const handleCsvUpload = useCallback(() => {
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
        const result = await addRecords(parsed);
        reportAddResult(result);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to parse CSV file");
      } finally {
        setProcessing(false);
      }
    };
    input.click();
  }, [addRecords]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = sortedRecords.length > 0 && selectedIds.size === sortedRecords.length;
  const handleSelectAllToggle = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(sortedRecords.map((r) => r.id)));
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.size} record${selectedIds.size === 1 ? "" : "s"}? This cannot be undone.`)) return;
    const n = await deleteRecords(selectedIds);
    if (n > 0) toast.success(`Deleted ${n} record${n === 1 ? "" : "s"}`);
    setSelectedIds(new Set());
  };

  const handleDeleteRow = async (id: string, name: string) => {
    if (!window.confirm(`Delete record for "${name || "(no name)"}"? This cannot be undone.`)) return;
    const n = await deleteRecords(new Set([id]));
    if (n > 0) toast.success("Record deleted");
  };

  const handleDownload = () => {
    if (sortedRecords.length === 0) {
      toast.error("No records to download");
      return;
    }
    const count = downloadRecordsCSV(sortedRecords);
    toast.success(`Downloaded ${count} records`);
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header / toolbar */}
      <div className="sticky top-0 z-20 border-b border-border bg-card px-4 py-2 flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={handleCsvUpload}>
          <FileUp className="h-4 w-4 mr-1.5" />
          Upload CSV
        </Button>
        <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1.5" />
          Download CSV
        </Button>

        {sortedRecords.length > 0 && (
          <span className="text-sm text-muted-foreground ml-2">
            {sortedRecords.length} record{sortedRecords.length === 1 ? "" : "s"}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" className="whitespace-nowrap" onClick={handleDeleteSelected}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Paste area */}
      <div className="border-b border-border bg-card/50 px-4 py-3 space-y-2">
        <div className="relative">
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste your spreadsheet or text data here — table structure detected automatically..."
            className="min-h-[180px] font-mono text-xs leading-relaxed resize-y"
            disabled={processing}
          />
          {hasTableData && pasteText.trim() && (
            <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
              <TableIcon className="h-3 w-3" /> Table detected
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {pasteText.length > 0 ? `${pasteText.length.toLocaleString()} characters` : ""}
          </span>
          <Button size="sm" onClick={handlePasteSubmit} disabled={processing || !pasteText.trim()}>
            {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Submit
          </Button>
        </div>
      </div>

      {/* Records table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading records...
        </div>
      ) : sortedRecords.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">No records yet. Paste data above or upload a CSV.</p>
        </div>
      ) : (
        <div className="border-x border-b border-border overflow-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted border-b border-border">
                <th className="px-4 py-2.5 w-10">
                  <Checkbox checked={allSelected} onCheckedChange={handleSelectAllToggle} />
                </th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Owner Last Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Mail Address</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">City</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">State</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Zip</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} />
                  </td>
                  <td className="px-4 py-2">{r.ownerLastName}</td>
                  <td className="px-4 py-2">{r.mailAddress}</td>
                  <td className="px-4 py-2">{r.mailCity}</td>
                  <td className="px-4 py-2">{r.mailState}</td>
                  <td className="px-4 py-2">{r.mailZip}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDeleteRow(r.id, r.ownerLastName)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Index;
