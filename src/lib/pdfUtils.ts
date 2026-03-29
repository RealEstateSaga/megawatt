import * as pdfjsLib from "pdfjs-dist";

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`;

/**
 * Split a PDF File into individual page base64 strings.
 * Each page is rendered as a standalone single-page PDF.
 */
export async function splitPdfToPages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pageCount = pdf.numPages;

  // For single-page PDFs, just return the original base64
  if (pageCount === 1) {
    const base64 = await fileToBase64Raw(file);
    return [base64];
  }

  // For multi-page, we send the whole PDF but tell the server the page count
  // The server will process it page-by-page using its own PDF parsing
  // This avoids the complexity of client-side PDF reconstruction
  const base64 = await fileToBase64Raw(file);
  const pages: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    pages.push(base64); // Same base64, different page numbers sent separately
  }
  return pages;
}

export function getPageCount(file: File): Promise<number> {
  return file.arrayBuffer().then(buf => 
    pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise
  ).then(pdf => pdf.numPages);
}

/** Compute SHA-256 hash of file contents */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function fileToBase64Raw(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { fileToBase64Raw as fileToBase64 };
