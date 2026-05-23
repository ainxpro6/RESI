import { extractKodePengambilan, type ExtractionResult } from "./pdf-extractor";
import { stampCodeOnPdf, stampAllPagesWithCode, type ModificationResult } from "./pdf-modifier";

export type FileStatus = "QUEUED" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface ProcessedFile {
  id: string;
  file: File;
  status: FileStatus;
  extractedCode: string | null;
  manualCode: string | null;
  modifiedPdf: Uint8Array | null;
  error: string | null;
  processingTimeMs: number | null;
}

export interface ProcessingCallbacks {
  onStatusChange: (id: string, status: FileStatus) => void;
  onCodeExtracted: (id: string, code: string | null, error?: string) => void;
  onComplete: (id: string, result: ProcessedFile) => void;
}

/**
 * Process a single PDF file: extract codes from all pages and stamp them.
 */
export async function processSingleFile(
  file: File,
  id: string,
  callbacks: ProcessingCallbacks
): Promise<ProcessedFile> {
  const startTime = performance.now();
  
  callbacks.onStatusChange(id, "PROCESSING");

  try {
    const fileBuffer = await file.arrayBuffer();

    // Step 1: Extract codes from all pages (pass a copy — pdfjs transfers the buffer to its worker, detaching the original)
    const extraction: ExtractionResult = await extractKodePengambilan(fileBuffer.slice(0));

    if (!extraction.success || extraction.codes.length === 0) {
      callbacks.onCodeExtracted(id, null, extraction.error);

      const result: ProcessedFile = {
        id,
        file,
        status: "FAILED",
        extractedCode: null,
        manualCode: null,
        modifiedPdf: null,
        error: extraction.error || "Kode tidak ditemukan",
        processingTimeMs: Math.round(performance.now() - startTime),
      };
      callbacks.onComplete(id, result);
      return result;
    }

    // Display all found codes (comma-separated)
    const displayCode = extraction.codes.join(", ");
    callbacks.onCodeExtracted(id, displayCode);

    // Step 2: Stamp each page with its extracted code
    const modification: ModificationResult = await stampCodeOnPdf(
      fileBuffer,
      extraction.pages
    );

    if (!modification.success || !modification.modifiedPdf) {
      const result: ProcessedFile = {
        id,
        file,
        status: "FAILED",
        extractedCode: displayCode,
        manualCode: null,
        modifiedPdf: null,
        error: modification.error || "Gagal memodifikasi PDF",
        processingTimeMs: Math.round(performance.now() - startTime),
      };
      callbacks.onComplete(id, result);
      return result;
    }

    const result: ProcessedFile = {
      id,
      file,
      status: "SUCCESS",
      extractedCode: displayCode,
      manualCode: null,
      modifiedPdf: modification.modifiedPdf,
      error: null,
      processingTimeMs: Math.round(performance.now() - startTime),
    };

    callbacks.onComplete(id, result);
    return result;
  } catch (error) {
    const result: ProcessedFile = {
      id,
      file,
      status: "FAILED",
      extractedCode: null,
      manualCode: null,
      modifiedPdf: null,
      error: `Error: ${error instanceof Error ? error.message : "Unknown"}`,
      processingTimeMs: Math.round(performance.now() - startTime),
    };
    callbacks.onComplete(id, result);
    return result;
  }
}

/**
 * Re-process a file with a manually entered code.
 * Stamps ALL pages with the same manual code.
 */
export async function reprocessWithManualCode(
  file: File,
  code: string
): Promise<ModificationResult> {
  const fileBuffer = await file.arrayBuffer();
  return stampAllPagesWithCode(fileBuffer, code.toUpperCase());
}
