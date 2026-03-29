import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LeadRecord } from "@/lib/types";

interface LeadTableProps {
  leads: LeadRecord[];
}

const LeadTable = ({ leads }: LeadTableProps) => {
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

  const goodCount = leads.filter(l => l.status === "GOOD - PROSPECT").length;

  if (leads.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Lead Results</h2>
          <p className="text-sm text-muted-foreground">
            {leads.length} total · <span className="text-accent font-medium">{goodCount} prospects</span> · {leads.length - goodCount} sold
          </p>
        </div>
        {goodCount > 0 && (
          <Button onClick={downloadCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Mailing List ({goodCount})
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Address</TableHead>
              <TableHead className="font-semibold">Last Name</TableHead>
              <TableHead className="font-semibold">Mailing Address 1</TableHead>
              <TableHead className="font-semibold">Mailing Address 2</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Analysis Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className={
                  lead.status === "GOOD - PROSPECT"
                    ? "bg-lead-good border-l-4 border-l-lead-good-border"
                    : "bg-lead-bad border-l-4 border-l-lead-bad-border"
                }
              >
                <TableCell className="font-medium">{lead.address}</TableCell>
                <TableCell>{lead.ownerLastName}</TableCell>
                <TableCell>{lead.mailingAddress1}</TableCell>
                <TableCell>{lead.mailingAddress2}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    lead.status === "GOOD - PROSPECT"
                      ? "bg-accent text-accent-foreground"
                      : "bg-destructive text-destructive-foreground"
                  }`}>
                    {lead.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{lead.analysisReason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadTable;
