import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUploader = ({ onFilesSelected }: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  const dispatchFiles = useCallback((files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf");
    const csvs = files.filter(f => f.name.toLowerCase().endsWith(".csv") || f.type === "text/csv");
    const allFiles = [...pdfs, ...csvs];
    if (allFiles.length > 0) onFilesSelected(allFiles);
  }, [onFilesSelected]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current += 1;
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current -= 1;
    if (dragCountRef.current <= 0) {
      dragCountRef.current = 0;
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current = 0;
    setDragActive(false);
    dispatchFiles(Array.from(e.dataTransfer.files));
  }, [dispatchFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      dispatchFiles(Array.from(e.target.files));
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      className={`border border-dashed rounded-md px-3 py-1.5 flex items-center gap-2 cursor-pointer w-[200px] h-[34px] box-border transition-colors ${
        dragActive
          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
          : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Upload className={`h-3.5 w-3.5 shrink-0 transition-colors ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
      <span className={`text-xs whitespace-nowrap ${dragActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
        {dragActive ? "Drop here" : "Drop files or"}
      </span>
      {!dragActive && (
        <label>
          <input ref={inputRef} type="file" accept=".pdf,.csv" multiple className="hidden" onChange={handleFileInput} />
          <span className="text-xs font-medium text-primary cursor-pointer hover:underline">browse</span>
        </label>
      )}
      {!dragActive && <span className="text-[10px] text-muted-foreground/60">.pdf .csv</span>}
    </div>
  );
};

export default FileUploader;
