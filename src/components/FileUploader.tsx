import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUploader = ({ onFilesSelected }: FileUploaderProps) => {
  const dragActive = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatchFiles = useCallback((files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf");
    if (pdfs.length > 0) onFilesSelected(pdfs);
  }, [onFilesSelected]);

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
      className="border border-dashed rounded-lg px-5 py-3 flex items-center gap-3 transition-colors cursor-pointer border-border hover:border-muted-foreground/40"
      onDragOver={(e) => { e.preventDefault(); }}
      onDrop={handleDrop}
    >
      <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground">Drop PDFs here or</span>
      <label>
        <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleFileInput} />
        <span className="text-sm font-medium text-primary cursor-pointer hover:underline">browse</span>
      </label>
    </div>
  );
};

export default FileUploader;
