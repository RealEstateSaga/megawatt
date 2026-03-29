import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface ProcessingLog {
  id: string;
  page_number: number;
  status: string;
  extracted_data: any;
  error_message: string | null;
  source_address: string | null;
  created_at: string;
}

interface PageLogsDialogProps {
  jobFileId: string;
  fileName: string;
  onClose: () => void;
}

const PageLogsDialog = ({ jobFileId, fileName, onClose }: PageLogsDialogProps) => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("processing_logs")
        .select("*")
        .eq("job_file_id", jobFileId)
        .order("page_number", { ascending: true });

      if (data) setLogs(data as ProcessingLog[]);
      setLoading(false);
    };
    fetchLogs();
  }, [jobFileId]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="outline" className="bg-lead-good text-lead-good-foreground border-lead-good-border text-[10px]">Success</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-lead-bad text-lead-bad-foreground border-lead-bad-border text-[10px]">Failed</Badge>;
      case "empty":
        return <Badge variant="outline" className="bg-lead-pending text-lead-pending-foreground border-lead-pending-border text-[10px]">Empty</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[70vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Page Logs — {fileName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-xs text-muted-foreground py-4">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4">No page logs recorded for this file.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="rounded-md border border-border p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Page {log.page_number}</span>
                  {statusBadge(log.status)}
                </div>
                {log.source_address && (
                  <p className="text-xs text-foreground">
                    📍 {log.source_address}
                  </p>
                )}
                {log.error_message && (
                  <p className="text-xs text-destructive">
                    ⚠ {log.error_message}
                  </p>
                )}
                {log.extracted_data && (
                  <details className="text-[10px]">
                    <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                      View extracted data
                    </summary>
                    <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-auto max-h-32">
                      {JSON.stringify(log.extracted_data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PageLogsDialog;
