import { useState, useMemo, useRef, type ReactNode } from "react";
import { Download, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Pencil, Check, X } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { LeadRecord, SortField, SortDirection } from "@/lib/types";

interface LeadTableProps {
  leads: LeadRecord[];
  onDeleteLeads?: (ids: string[]) => Promise<void>;
  onUpdateLastName?: (id: string, newName: string) => Promise<void>;
  onImportCSV?: (file: File) => Promise<void>;
  fileUploader?: ReactNode;
}

const ROW_HEIGHT = 40;

const columns: { field: SortField; label: string; flex: string; minW: string }[] = [
  { field: "status", label: "Status", flex: "flex-[0.8]", minW: "min-w-[80px]" },
  { field: "address", label: "Property Address", flex: "flex-[2.2]", minW: "min-w-[180px]" },
  { field: "ownerLastName", label: "Last Name", flex: "flex-[1.2]", minW: "min-w-[110px]" },
  { field: "mailingAddress1", label: "Mail Address", flex: "flex-[1.8]", minW: "min-w-[150px]" },
  { field: "mailingAddress2", label: "Mail City State Zip", flex: "flex-[1.6]", minW: "min-w-[150px]" },
  { field: "offMarketDate", label: "Off Market Date", flex: "flex-[1]", minW: "min-w-[100px]" },
  { field: "saleDate", label: "Last Sale Date", flex: "flex-[1]", minW: "min-w-[100px]" },
  { field: "lastRecordingDate", label: "Last Recording Date", flex: "flex-[1.1]", minW: "min-w-[110px]" },
  { field: "analysisReason", label: "Analysis", flex: "flex-[2.2]", minW: "min-w-[160px]" },
];

const statusBadgeClass = (status: string) => {
  if (status === "GOOD") return "bg-lead-good text-lead-good-foreground border-lead-good-border text-xs font-semibold";
  if (status === "BAD") return "bg-lead-bad text-lead-bad-foreground border-lead-bad-border text-xs font-semibold";
  return "bg-lead-pending text-lead-pending-foreground border-lead-pending-border text-xs font-semibold";
};

const LeadTable = ({ leads, onDeleteLeads, onUpdateLastName, fileUploader }: LeadTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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

  const toggleSelect = (id: string, index: number, shiftKey: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (shiftKey && lastCheckedIndexRef.current !== null) {
        const start = Math.min(lastCheckedIndexRef.current, index);
        const end = Math.max(lastCheckedIndexRef.current, index);
        for (let i = start; i <= end; i++) {
          next.add(sorted[i].id);
        }
      } else {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      return next;
    });
    lastCheckedIndexRef.current = index;
  };

  const handleDelete = async () => {
    if (!onDeleteLeads || selectedIds.size === 0) return;
    setIsDeleting(true);
    await onDeleteLeads(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsDeleting(false);
  };

  const startEdit = (lead: LeadRecord) => {
    setEditingId(lead.id);
    setEditValue(lead.ownerLastName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (editingId && onUpdateLastName) {
      await onUpdateLastName(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  };

  const buildCSV = (rows: LeadRecord[]) => {
    const header = "Property Address,Last Name,Mail Address,Mail City State Zip\n";
    const body = rows.map(l => `"${l.address}","${l.ownerLastName}","${l.mailingAddress1}","${l.mailingAddress2}"`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mailing_list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => buildCSV(leads.filter(l => l.status === "GOOD"));

  const downloadSelected = () => {
    const selected = sorted.filter(l => selectedIds.has(l.id));
    if (selected.length > 0) buildCSV(selected);
  };

  const getCellValue = (lead: LeadRecord, field: SortField) => {
    switch (field) {
      case "status":
        return <Badge variant="outline" className={statusBadgeClass(lead.status)}>{lead.status}</Badge>;
      case "address":
        return <span className="font-medium text-sm">{lead.address}</span>;
      case "ownerLastName":
        if (editingId === lead.id) {
          return (
            <div className="flex items-center gap-1">
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="h-6 text-sm px-1 w-24"
                autoFocus
              />
              <button onClick={saveEdit} className="text-accent hover:text-accent/80"><Check className="h-3.5 w-3.5" /></button>
              <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
            </div>
          );
        }
        return (
          <span className="text-sm group/name flex items-center gap-1 cursor-pointer" onDoubleClick={() => startEdit(lead)}>
            {lead.ownerLastName || "—"}
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity cursor-pointer" onClick={(e) => { e.stopPropagation(); startEdit(lead); }} />
          </span>
        );
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

  const emptyState = leads.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sticky top bar: title + controls */}
      <div className="sticky top-0 z-20 bg-card border-b border-border flex-shrink-0">
        <div className="px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Lead Pro
            </h1>
            {!emptyState && (
              <p className="text-xs text-muted-foreground">
                {leads.length} total · <span className="text-accent font-medium">{goodCount} good</span> · {leads.length - goodCount - pendingCount} bad · <span className="text-muted-foreground">{pendingCount} pending</span>
              </p>
            )}
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
            {!emptyState && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search address or name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 w-56 text-sm"
                />
              </div>
            )}
            {fileUploader}
            {goodCount > 0 && (
              <Button onClick={downloadCSV} variant="default" size="sm" className="h-8">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download Mailing List ({goodCount})
              </Button>
            )}
          </div>
        </div>

        {/* Sticky column headers */}
        {!emptyState && (
          <div className="bg-muted border-t border-border">
            <div className="flex">
              <div className="w-10 flex-shrink-0 px-2 py-2 text-[10px] font-semibold text-muted-foreground text-center">#</div>
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
                  className={`${col.flex} ${col.minW} px-3 py-2 font-semibold text-xs cursor-pointer select-none hover:bg-muted-foreground/10 transition-colors`}
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
        )}
      </div>

      {/* Scrollable body */}
      {emptyState ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          No leads yet — drop PDFs or CSVs above to get started.
        </div>
      ) : (
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
                    <div className="w-10 flex-shrink-0 px-2 text-[10px] text-muted-foreground text-center tabular-nums">
                      {virtualRow.index + 1}
                    </div>
                    <div
                      className="w-10 flex-shrink-0 px-3 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(lead.id, virtualRow.index, e.shiftKey);
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        tabIndex={-1}
                        aria-label={`Select ${lead.address}`}
                      />
                    </div>
                    {columns.map(col => (
                      <div key={col.field} className={`${col.flex} ${col.minW} px-3 truncate`}>
                        {getCellValue(lead, col.field)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadTable;
