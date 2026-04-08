import type { MailRecord } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload } from "lucide-react";

interface RecordTableProps {
  records: MailRecord[];
  listType: "new" | "completed";
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const RecordTable = ({
  records,
  listType,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
}: RecordTableProps) => {
  const allSelected = records.length > 0 && selectedIds.size === records.length;

  if (records.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Upload className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">
          {listType === "new"
            ? "No records yet. Go to Upload to paste or import your data."
            : "No completed records yet. Move records here after downloading."}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-t-none overflow-auto" style={{ height: "calc(100vh - 57px)" }}>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-muted border-b border-border">
            <th className="px-4 py-2.5 w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => (allSelected ? onDeselectAll() : onSelectAll())}
              />
            </th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Owner Last Name</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Mail Address</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">City</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">State</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Zip</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="px-4 py-2">
                <Checkbox
                  checked={selectedIds.has(r.id)}
                  onCheckedChange={() => onToggleSelect(r.id)}
                />
              </td>
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
  );
};
