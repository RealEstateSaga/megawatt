import { useState, useMemo, useRef } from "react";
import { Download, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { LeadRecord, SortField, SortDirection } from "@/lib/types";

interface LeadTableProps {
  leads: LeadRecord[];
  onDeleteLeads?: (ids: string[]) => Promise<void>;
}

const ROW_HEIGHT = 40;

const LeadTable = ({ leads, onDeleteLeads }: LeadTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const lastCheckedIndexRef = useRef<number | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3" />
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(
      l =>
        l.address.toLowerCase().includes(q) ||
        l.ownerLastName.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const rowVirtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  const goodCount = leads.filter(l => l.status === "GOOD").length;
  const pendingCount = leads.filter(l => l.status === "PENDING").length;

  const allFilteredSelected = sorted.length > 0 && sorted.every(l => selectedIds.has(l.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map(l => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!onDeleteLeads || selectedIds.size === 0) return;
    setIsDeleting(true);
    await onDeleteLeads(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsDeleting(false);
  };

  const downloadCSV = () => {
    const good = leads.filter(l => l.status === "GOOD");
    const header = "Property Address,Last Name,Mail Address,Mail City State Zip\n";
    const rows = good.map(l => `"${l.address}","${l.ownerLastName}","${l.mailingAddress1}","${l.mailingAddress2}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mailing_list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (leads.length === 0) return null;

  const columns: { field: SortField; label: string; width: string }[] = [
    { field: "status", label: "Status", width: "w-24" },
    { field: "address", label: "Property Address", width: "w-48" },
    { field: "ownerLastName", label: "Last Name", width: "w-32" },
    { field: "mailingAddress1", label: "Mail Address", width: "w-40" },
    { field: "mailingAddress2", label: "Mail City State Zip", width: "w-40" },
    { field: "offMarketDate", label: "Off Market Date", width: "w-32" },
    { field: "saleDate", label: "Last Sale Date", width: "w-32" },
    { field: "lastRecordingDate", label: "Last Recording Date", width: "w-36" },
    { field: "analysisReason", label: "Analysis", width: "w-56" },
  ];

  const statusBadgeClass = (status: string) => {
    if (status === "GOOD") return "bg-lead-good text-lead-good-foreground border-lead-good-border text-xs font-semibold";
    if (status === "BAD") return "bg-lead-bad text-lead-bad-foreground border-lead-bad-border text-xs font-semibold";
    return "bg-lead-pending text-lead-pending-foreground border-lead-pending-border text-xs font-semibold";
  };

  const getCellValue = (lead: LeadRecord, field: SortField) => {
    switch (field) {
      case "status":
        return <Badge variant="outline" className={statusBadgeClass(lead.status)}>{lead.status}</Badge>;
      case "address":
        return <span className="font-medium text-sm">{lead.address}</span>;
      case "ownerLastName":
        return <span className="text-sm">{lead.ownerLastName || "—"}</span>;
      case "mailingAddress1":
        return <span className="text-sm">{lead.mailingAddress1 || "—"}</span>;
      case "mailingAddress2":
        return <span className="text-sm">{lead.mailingAddress2 || "—"}</span>;
      case "offMarketDate":
        return <span className="text-xs text-muted-foreground">{lead.offMarketDate ?? "—"}</span>;
      case "saleDate":
        return <span className="text-xs text-muted-foreground">{lead.saleDate ?? "—"}</span>;
      case "lastRecordingDate":
        return <span className="text-xs text-muted-foreground">{lead.lastRecordingDate ?? "—"}</span>;
      case "analysisReason":
        return <span className="text-xs text-muted-foreground truncate block max-w-xs">{lead.analysisReason}</span>;
    }
  };

  return (
    <div className="space-y-3 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-foreground">Lead Results</h2>
          <p className="text-xs text-muted-foreground">
            {leads.length} total · <span className="text-accent font-medium">{goodCount} good</span> · {leads.length - goodCount - pendingCount} bad · <span className="text-muted-foreground">{pendingCount} pending</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className="h-8"
              disabled={isDeleting}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete {selectedIds.size} row{selectedIds.size > 1 ? "s" : ""}
            </Button>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search address or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-56 text-sm"
            />
          </div>
          {goodCount > 0 && (
            <Button onClick={downloadCSV} variant="default" size="sm" className="h-8">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download Mailing List ({goodCount})
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Sticky header */}
        <div className="bg-muted border-b border-border flex-shrink-0">
          <div className="flex">
            <div className="w-10 flex-shrink-0 px-3 py-2 flex items-center">
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
            </div>
            {columns.map(col => (
              <div
                key={col.field}
                className={`${col.width} flex-shrink-0 px-3 py-2 font-semibold text-xs cursor-pointer select-none hover:bg-muted-foreground/10 transition-colors`}
                onClick={() => toggleSort(col.field)}
              >
                <span className="inline-flex items-center whitespace-nowrap">
                  {col.label}
                  <SortIcon field={col.field} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Virtualized body */}
        <div ref={parentRef} className="flex-1 overflow-auto min-h-0">
          {sorted.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No results match your search.
            </div>
          ) : (
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const lead = sorted[virtualRow.index];
                const isEven = virtualRow.index % 2 === 0;
                const isSelected = selectedIds.has(lead.id);
                return (
                  <div
                    key={lead.id}
                    className={`absolute top-0 left-0 w-full flex items-center ${isSelected ? "bg-primary/10" : isEven ? "bg-card" : "bg-muted/30"} hover:bg-muted/50 transition-colors`}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="w-10 flex-shrink-0 px-3 flex items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(lead.id)}
                        aria-label={`Select ${lead.address}`}
                      />
                    </div>
                    {columns.map(col => (
                      <div key={col.field} className={`${col.width} flex-shrink-0 px-3 truncate`}>
                        {getCellValue(lead, col.field)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadTable;
