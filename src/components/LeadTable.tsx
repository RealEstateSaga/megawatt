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
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
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

  const goodCount = leads.filter(l => l.status === "GOOD - PROSPECT").length;

  const downloadCSV = () => {
    const good = leads.filter(l => l.status === "GOOD - PROSPECT");
    const header = "Last Name,Mailing Address 1,Mailing Address 2\n";
    const rows = good.map(l => `"${l.ownerLastName}","${l.mailingAddress1}","${l.mailingAddress2}"`).join("\n");
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
    { field: "mailingAddress1", label: "Mailing Address 1" },
    { field: "mailingAddress2", label: "Mailing Address 2" },
    { field: "offMarketDate", label: "MLS Cancel Date" },
    { field: "saleDate", label: "Last Sale Date" },
    { field: "analysisReason", label: "Analysis Reason" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Lead Results</h2>
          <p className="text-sm text-muted-foreground">
            {leads.length} total · <span className="text-accent font-medium">{goodCount} prospects</span> · {leads.length - goodCount} sold
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search address or last name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          {goodCount > 0 && (
            <Button onClick={downloadCSV} variant="default" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Mailing List ({goodCount})
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map(col => (
                <TableHead
                  key={col.field}
                  className="font-semibold cursor-pointer select-none hover:bg-muted/80 transition-colors"
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
                className={idx % 2 === 0 ? "bg-card" : "bg-muted/30"}
              >
                <TableCell>
                  <Badge
                    variant={lead.status === "GOOD - PROSPECT" ? "default" : "destructive"}
                    className={
                      lead.status === "GOOD - PROSPECT"
                        ? "bg-lead-good text-accent border-lead-good-border"
                        : "bg-lead-bad text-destructive border-lead-bad-border"
                    }
                  >
                    {lead.status === "GOOD - PROSPECT" ? "GOOD" : "BAD"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{lead.address}</TableCell>
                <TableCell>{lead.ownerLastName}</TableCell>
                <TableCell>{lead.mailingAddress1}</TableCell>
                <TableCell>{lead.mailingAddress2}</TableCell>
                <TableCell className="text-sm">{lead.offMarketDate ?? "—"}</TableCell>
                <TableCell className="text-sm">{lead.saleDate ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{lead.analysisReason}</TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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
