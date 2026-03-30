import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Loader2, Clock, FileText, Eye, RotateCcw, Hash, SplitSquareVertical, Brain, Database, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job, JobFile } from "@/pages/Index";
import PageLogsDialog from "@/components/PageLogsDialog";

interface JobProgressPanelProps {
  job: Job;
  files: JobFile[];
  onDismiss: () => void;
  onRetryFailed?: () => void;
  onCancelJob?: () => void;
}

const JobProgressPanel = ({ job, files, onDismiss, onRetryFailed, onCancelJob }: JobProgressPanelProps) => {
  const [expanded, setExpanded] = useState(false);
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);

  const completedOrSkipped = files.filter(f => f.status === "completed" || f.status === "skipped").length;
  const failed = files.filter(f => f.status === "failed").length;
  const total = files.length;
  const progress = total > 0 ? Math.round(((completedOrSkipped + failed) / total) * 100) : 0;
  const isDone = job.status === "completed" || job.status === "failed";

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-3.5 w-3.5 text-accent" />;
      case "failed": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      case "hashing": return <Hash className="h-3.5 w-3.5 animate-pulse text-amber-500" />;
      case "splitting": return <SplitSquareVertical className="h-3.5 w-3.5 animate-pulse text-blue-500" />;
      case "processing": return <Brain className="h-3.5 w-3.5 animate-spin text-primary" />;
      case "committing": return <Database className="h-3.5 w-3.5 animate-pulse text-emerald-500" />;
      case "skipped": return <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />;
      default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const statusLabel = (file: JobFile) => {
    switch (file.status) {
      case "hashing": return "Hashing...";
      case "splitting": return "Splitting PDF...";
      case "processing":
        if (file.total_pages && file.total_pages > 1) {
          return `AI Extracting p${file.processed_pages || 0}/${file.total_pages}`;
        }
        return "AI Extracting...";
      case "committing": return "Saving to DB...";
      case "completed": return "Done";
      case "failed": return file.error_message || "Failed";
      case "skipped": return "Skipped";
      default: return "Queued";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors"
      >
        {isDone ? (
          failed > 0 ? <XCircle className="h-3.5 w-3.5 text-destructive" /> : <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        )}
        <span className="font-medium">
          {isDone ? `${completedOrSkipped}/${total} processed` : `Processing ${completedOrSkipped + failed}/${total}`}
        </span>
        {failed > 0 && (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">{failed} failed</Badge>
        )}
        <div className="w-20">
          <Progress value={progress} className="h-1.5" />
        </div>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="absolute right-0 top-full mt-1 z-50 w-96 max-h-80 overflow-auto rounded-lg border border-border bg-card shadow-lg">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Job Progress
            </span>
            <div className="flex items-center gap-1">
              {failed > 0 && onRetryFailed && (
                <Button onClick={onRetryFailed} variant="outline" size="sm" className="h-6 text-xs gap-1">
                  <RotateCcw className="h-3 w-3" />
                  Retry {failed} Failed
                </Button>
              )}
              {isDone && (
                <Button onClick={onDismiss} variant="ghost" size="sm" className="h-6 text-xs">
                  Dismiss
                </Button>
              )}
            </div>
          </div>
          <div className="divide-y divide-border">
            {files.map((file) => (
              <div key={file.id} className="px-3 py-2 flex items-center gap-2">
                {statusIcon(file.status)}
                <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs truncate flex-1" title={file.file_name}>{file.file_name}</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {statusLabel(file)}
                </span>
                {file.leads_found > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-lead-good text-lead-good-foreground border-lead-good-border">
                    {file.leads_found} leads
                  </Badge>
                )}
                {(file.status === "completed" || file.status === "failed") && (
                  <button
                    onClick={() => setViewingFileId(file.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="View page logs"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewingFileId && (
        <PageLogsDialog
          jobFileId={viewingFileId}
          fileName={files.find(f => f.id === viewingFileId)?.file_name || ""}
          onClose={() => setViewingFileId(null)}
        />
      )}
    </div>
  );
};

export default JobProgressPanel;
