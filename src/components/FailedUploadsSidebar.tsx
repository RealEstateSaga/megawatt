import { AlertTriangle, X } from "lucide-react";
import type { FailedUpload } from "@/lib/types";

interface FailedUploadsSidebarProps {
  items: FailedUpload[];
  onDismiss: (id: string) => void;
  onClear: () => void;
}

const FailedUploadsSidebar = ({ items, onDismiss, onClear }: FailedUploadsSidebarProps) => {
  if (items.length === 0) return null;

  return (
    <div className="fixed right-4 top-16 w-72 z-50 rounded-lg border border-destructive/30 bg-card shadow-lg">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-xs font-semibold text-foreground">Failed Uploads ({items.length})</span>
        </div>
        <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive">
          Clear all
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 px-3 py-2 border-b border-border/50 last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{item.fileName}</p>
              <p className="text-[10px] text-muted-foreground">{item.reason}</p>
            </div>
            <button onClick={() => onDismiss(item.id)} className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FailedUploadsSidebar;
