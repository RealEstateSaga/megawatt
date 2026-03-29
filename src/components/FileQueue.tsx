import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { FileQueueItem } from "@/lib/types";

interface FileQueueProps {
  items: FileQueueItem[];
}

const FileQueue = ({ items }: FileQueueProps) => {
  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map((item) => (
        <div
          key={item.id}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs"
        >
          {item.status === "queued" && <Clock className="h-3 w-3 text-muted-foreground" />}
          {item.status === "processing" && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
          {item.status === "done" && <CheckCircle2 className="h-3 w-3 text-accent" />}
          {item.status === "failed" && <XCircle className="h-3 w-3 text-destructive" />}
          <span className="truncate max-w-28">{item.file.name}</span>
          {item.status === "done" && item.leadsFound !== undefined && (
            <span className="text-muted-foreground">({item.leadsFound})</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileQueue;
