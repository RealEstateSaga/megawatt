import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onCSVSelected?: (file: File) => void;
  isProcessing: boolean;
}

const FileUploader = ({ onFilesSelected, onCSVSelected }: FileUploaderProps) => {
  const dragActive = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatchFiles = useCallback((files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf");
    const csvs = files.filter(f => f.name.toLowerCase().endsWith(".csv") || f.type === "text/csv");
    if (pdfs.length > 0) onFilesSelected(pdfs);
    if (csvs.length > 0 && onCSVSelected) {
      csvs.forEach(csv => onCSVSelected(csv));
    }
  }, [onFilesSelected, onCSVSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragActive.current = false;
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
      className="border border-dashed rounded-md px-3 py-1.5 flex items-center gap-2 transition-all cursor-pointer border-border/60 hover:border-primary/40 hover:bg-primary/5"
      onDragOver={(e) => { e.preventDefault(); }}
      onDrop={handleDrop}
    >
      <Upload className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground">Drop files or</span>
      <label>
        <input ref={inputRef} type="file" accept=".pdf,.csv" multiple className="hidden" onChange={handleFileInput} />
        <span className="text-xs font-medium text-primary cursor-pointer hover:underline">browse</span>
      </label>
      <span className="text-[10px] text-muted-foreground/60">.pdf .csv</span>
    </div>
  );
};

export default FileUploader;
