import { useCallback, useState } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUploader = ({ onFilesSelected, isProcessing }: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (files.length) setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type === "application/pdf");
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleProcess = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  const clearFiles = () => setSelectedFiles([]);

  return (
    <div className="flex items-start gap-4 flex-wrap">
      <div
        className={`border border-dashed rounded-lg px-5 py-3 flex items-center gap-3 transition-colors cursor-pointer ${
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">Drop PDFs here or</span>
        <label>
          <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileInput} />
          <span className="text-sm font-medium text-primary cursor-pointer hover:underline">browse</span>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedFiles.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs">
                <FileText className="h-3 w-3" />
                <span className="truncate max-w-32">{f.name}</span>
              </span>
            ))}
          </div>
          <button onClick={clearFiles} className="text-xs text-muted-foreground hover:text-destructive">
            <X className="h-3.5 w-3.5" />
          </button>
          <Button onClick={handleProcess} disabled={isProcessing} size="sm">
            {isProcessing ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>Process {selectedFiles.length} File(s)</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
