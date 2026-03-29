import { useState, useMemo } from "react";
import { Download, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { LeadRecord, SortField, SortDirection } from "@/lib/types";

interface LeadTableProps {
  leads: LeadRecord[];
}

const LeadTable = ({ leads }: LeadTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

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

  const goodCount = leads.filter(l => l.status === "GOOD").length;
  const pendingCount = leads.filter(l => l.status === "PENDING").length;

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

  const columns: { field: SortField; label: string }[] = [
    { field: "status", label: "Status" },
    { field: "address", label: "Property Address" },
    { field: "ownerLastName", label: "Last Name" },
    { field: "mailingAddress1", label: "Mail Address" },
    { field: "mailingAddress2", label: "Mail City State Zip" },
    { field: "offMarketDate", label: "Off Market Date" },
    { field: "saleDate", label: "Last Sale Date" },
    { field: "lastRecordingDate", label: "Last Recording Date" },
    { field: "analysisReason", label: "Analysis" },
  ];

  const statusBadgeClass = (status: string) => {
    if (status === "GOOD") return "bg-lead-good text-lead-good-foreground border-lead-good-border text-xs font-semibold";
    if (status === "BAD") return "bg-lead-bad text-lead-bad-foreground border-lead-bad-border text-xs font-semibold";
    return "bg-lead-pending text-lead-pending-foreground border-lead-pending-border text-xs font-semibold";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-foreground">Lead Results</h2>
          <p className="text-xs text-muted-foreground">
            {leads.length} total · <span className="text-accent font-medium">{goodCount} good</span> · {leads.length - goodCount - pendingCount} bad · <span className="text-muted-foreground">{pendingCount} pending</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="rounded-lg border border-border overflow-auto max-h-[calc(100vh-200px)]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              {columns.map(col => (
                <TableHead
                  key={col.field}
                  className="font-semibold text-xs cursor-pointer select-none hover:bg-muted-foreground/10 transition-colors whitespace-nowrap"
                  onClick={() => toggleSort(col.field)}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortIcon field={col.field} />
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((lead, idx) => (
              <TableRow
                key={lead.id}
                className={`${idx % 2 === 0 ? "bg-card" : "bg-muted/30"} hover:bg-muted/50 transition-colors`}
              >
                <TableCell className="py-2">
                  <Badge variant="outline" className={statusBadgeClass(lead.status)}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-sm py-2">{lead.address}</TableCell>
                <TableCell className="text-sm py-2">{lead.ownerLastName || "—"}</TableCell>
                <TableCell className="text-sm py-2">{lead.mailingAddress1 || "—"}</TableCell>
                <TableCell className="text-sm py-2">{lead.mailingAddress2 || "—"}</TableCell>
                <TableCell className="text-xs py-2 text-muted-foreground">{lead.offMarketDate ?? "—"}</TableCell>
                <TableCell className="text-xs py-2 text-muted-foreground">{lead.saleDate ?? "—"}</TableCell>
                <TableCell className="text-xs py-2 text-muted-foreground">{lead.lastRecordingDate ?? "—"}</TableCell>
                <TableCell className="text-xs py-2 text-muted-foreground max-w-xs truncate">{lead.analysisReason}</TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No results match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadTable;
