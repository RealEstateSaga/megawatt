import * as pdfjsLib from "pdfjs-dist";

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`;

export interface SplitPdfPage {
  base64: string;
  mimeType: "image/png";
}

/**
 * Split a PDF file into individual page images so each AI call receives exactly one page.
 */
export async function splitPdfToPages(file: File): Promise<SplitPdfPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pageCount = pdf.numPages;

  const pages: SplitPdfPage[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(2, 1800 / Math.max(baseViewport.width, baseViewport.height));
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      throw new Error("Unable to render PDF page");
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    pages.push({
      base64: dataUrl.split(",")[1],
      mimeType: "image/png",
    });

    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
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
