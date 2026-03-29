import { useCallback, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
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
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-foreground font-medium mb-1">Drop MLS & Tax PDFs here</p>
        <p className="text-sm text-muted-foreground mb-3">Listing History and Tax Information sheets</p>
        <label>
          <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileInput} />
          <span className="inline-flex items-center px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors">
            Browse Files
          </span>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{selectedFiles.length} file(s) selected</p>
            <button onClick={clearFiles} className="text-xs text-muted-foreground hover:text-destructive">Clear all</button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span className="truncate">{f.name}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleProcess} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing with AI...
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
