import { useState, useMemo } from "react";
import { Search, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { RejectedRecord } from "@/lib/types";

interface RejectedRecordsTableProps {
  records: RejectedRecord[];
  onClear: () => void;
}

const RejectedRecordsTable = ({ records, onClear }: RejectedRecordsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return records;
    return records.filter(
      r =>
        r.reason.toLowerCase().includes(q) ||
        (r.rawData.address || "").toLowerCase().includes(q) ||
        (r.rawData.ownerLastName || "").toLowerCase().includes(q) ||
        (r.rawData.mailingAddress1 || "").toLowerCase().includes(q) ||
        r.fileName.toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

  const dupeCount = records.filter(r => r.classification === "duplicate").length;
  const failedCount = records.filter(r => r.classification === "failed").length;

  const downloadCSV = () => {
    const header = "Row #,Classification,Reason,File,Address,Last Name,Mail Address,Mail City State Zip\n";
    const body = filtered.map(r =>
      `${r.rowIndex + 1},"${r.classification}","${r.reason}","${r.fileName}","${r.rawData.address || ""}","${r.rawData.ownerLastName || ""}","${r.rawData.mailingAddress1 || ""}","${r.rawData.mailingAddress2 || ""}"`
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rejected_records.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        No rejected records — all rows from your imports were successfully added.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap border-b border-border">
        <p className="text-xs text-muted-foreground">
          {records.length} rejected · <span className="text-orange-500 font-medium">{dupeCount} duplicates</span> · <span className="text-destructive font-medium">{failedCount} failed</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search rejected records..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-56 text-sm"
            />
          </div>
          <Button onClick={downloadCSV} variant="outline" size="sm" className="h-8">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button onClick={onClear} variant="destructive" size="sm" className="h-8">
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {/* Header */}
        <div className="bg-muted border-b border-border sticky top-0 z-10">
          <div className="flex">
            <div className="w-16 flex-shrink-0 px-3 py-2 text-[10px] font-semibold text-muted-foreground">Row #</div>
            <div className="flex-[0.8] min-w-[90px] px-3 py-2 text-xs font-semibold">Type</div>
            <div className="flex-[2] min-w-[200px] px-3 py-2 text-xs font-semibold">Reason</div>
            <div className="flex-[1.2] min-w-[120px] px-3 py-2 text-xs font-semibold">File</div>
            <div className="flex-[1.5] min-w-[140px] px-3 py-2 text-xs font-semibold">Address</div>
            <div className="flex-[1] min-w-[100px] px-3 py-2 text-xs font-semibold">Last Name</div>
            <div className="flex-[1.5] min-w-[140px] px-3 py-2 text-xs font-semibold">Mail Address</div>
            <div className="flex-[1.5] min-w-[140px] px-3 py-2 text-xs font-semibold">Mail City State Zip</div>
          </div>
        </div>

        {/* Rows */}
        {filtered.map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center ${i % 2 === 0 ? "bg-card" : "bg-muted/30"} hover:bg-muted/50 transition-colors`}
            style={{ height: 40 }}
          >
            <div className="w-16 flex-shrink-0 px-3 text-[10px] text-muted-foreground text-center tabular-nums">
              {r.rowIndex + 1}
            </div>
            <div className="flex-[0.8] min-w-[90px] px-3">
              <Badge
                variant="outline"
                className={
                  r.classification === "duplicate"
                    ? "bg-orange-500/15 text-orange-600 border-orange-500/30 text-xs font-semibold"
                    : "bg-destructive/15 text-destructive border-destructive/30 text-xs font-semibold"
                }
              >
                {r.classification === "duplicate" ? "DUPE" : "FAIL"}
              </Badge>
            </div>
            <div className="flex-[2] min-w-[200px] px-3 text-xs text-muted-foreground truncate">{r.reason}</div>
            <div className="flex-[1.2] min-w-[120px] px-3 text-xs text-muted-foreground truncate">{r.fileName}</div>
            <div className="flex-[1.5] min-w-[140px] px-3 text-sm truncate">{r.rawData.address || "—"}</div>
            <div className="flex-[1] min-w-[100px] px-3 text-sm truncate">{r.rawData.ownerLastName || "—"}</div>
            <div className="flex-[1.5] min-w-[140px] px-3 text-sm truncate">{r.rawData.mailingAddress1 || "—"}</div>
            <div className="flex-[1.5] min-w-[140px] px-3 text-sm truncate">{r.rawData.mailingAddress2 || "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RejectedRecordsTable;
