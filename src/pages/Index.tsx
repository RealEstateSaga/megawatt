import { useState } from "react";
import { toast } from "sonner";
import { Download, Upload, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { MailRecord } from "@/lib/types";

type View = "list" | "upload";

const Index = () => {
  const [view, setView] = useState<View>("upload");
  const [records, setRecords] = useState<MailRecord[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
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
      }));

      // Deduplicate against existing records
      const existing = new Set(
        records.map(r => `${r.ownerLastName.toLowerCase()}|${r.mailAddress.toLowerCase()}|${r.mailZip}`)
      );
      const newRecords = parsed.filter(r => {
        const key = `${r.ownerLastName.toLowerCase()}|${r.mailAddress.toLowerCase()}|${r.mailZip}`;
        if (existing.has(key)) return false;
        existing.add(key);
        return true;
      });

      const merged = [...records, ...newRecords];
      setRecords(merged);
      setPasteText("");
      setView("list");

      const passCount = newRecords.filter(r => r.status === "Pass").length;
      const failCount = newRecords.filter(r => r.status === "Fail").length;
      const dupeCount = parsed.length - newRecords.length;
      toast.success(`Processed ${newRecords.length} records (${passCount} Pass, ${failCount} Fail${dupeCount > 0 ? `, ${dupeCount} duplicates removed` : ""})`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to process data");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const passRecords = records.filter(r => r.status === "Pass");
    if (passRecords.length === 0) {
      toast.error("No passing records to download");
      return;
    }
    const header = "Owner Last Name,Mail Address,Mail City,Mail State,Mail Zip";
    const rows = passRecords.map(r =>
      [r.ownerLastName, r.mailAddress, r.mailCity, r.mailState, r.mailZip]
        .map(v => `"${(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mailing-list-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${passRecords.length} records`);
  };

  const passCount = records.filter(r => r.status === "Pass").length;
  const failCount = records.filter(r => r.status === "Fail").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">DataLead Pro</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4 mr-1.5" />
            List
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
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          <div>
            <h2 className="text-lg font-medium mb-1">Paste Raw Data</h2>
            <p className="text-sm text-muted-foreground">
              Paste your tax record data below. The AI will extract owner names and mailing addresses, remove duplicates, and flag any rows it can't confidently parse.
            </p>
          </div>
          <Textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Paste your data here..."
            className="min-h-[400px] font-mono text-xs leading-relaxed"
            disabled={processing}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {pasteText.length > 0 ? `${pasteText.length.toLocaleString()} characters` : ""}
            </span>
            <Button onClick={handleSubmit} disabled={processing || !pasteText.trim()} size="lg">
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium">Mailing List</h2>
              {records.length > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-accent font-medium">{passCount} Pass</span>
                  <span className="text-destructive font-medium">{failCount} Fail</span>
                </div>
              )}
            </div>
            {passCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1.5" />
                Download CSV
              </Button>
            )}
          </div>

          {records.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Upload className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No records yet. Go to Upload to paste your data.</p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Owner Last Name</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Mail Address</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">City</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">State</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Zip</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2">
                        <span className={`text-xs font-semibold ${r.status === "Pass" ? "text-accent" : "text-destructive"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{r.ownerLastName}</td>
                      <td className="px-4 py-2">{r.mailAddress}</td>
                      <td className="px-4 py-2">{r.mailCity}</td>
                      <td className="px-4 py-2">{r.mailState}</td>
                      <td className="px-4 py-2">{r.mailZip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
