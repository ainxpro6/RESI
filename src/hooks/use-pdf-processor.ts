"use client";

import { useState, useCallback } from "react";
import { type ProcessedFile, type FileStatus, processSingleFile, reprocessWithManualCode } from "@/lib/pdf-processor";
import { buildZip } from "@/lib/zip-builder";
import { downloadSinglePdf, downloadZip } from "@/lib/download";
import { generateId } from "@/lib/utils";

export function usePdfProcessor() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const updateFile = useCallback((id: string, updates: Partial<ProcessedFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const processedFiles: ProcessedFile[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      status: "QUEUED" as FileStatus,
      extractedCode: null,
      manualCode: null,
      modifiedPdf: null,
      error: null,
      processingTimeMs: null,
    }));
    setFiles((prev) => [...prev, ...processedFiles]);
    return processedFiles;
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const processAll = useCallback(async () => {
    setIsProcessing(true);
    const queuedFiles = files.filter((f) => f.status === "QUEUED");

    for (const pf of queuedFiles) {
      await processSingleFile(pf.file, pf.id, {
        onStatusChange: (id, status) => updateFile(id, { status }),
        onCodeExtracted: (id, code, error) =>
          updateFile(id, { extractedCode: code, error: error || null }),
        onComplete: (id, result) =>
          updateFile(id, {
            status: result.status,
            modifiedPdf: result.modifiedPdf,
            error: result.error,
            processingTimeMs: result.processingTimeMs,
          }),
      });
    }

    setIsProcessing(false);
  }, [files, updateFile]);

  const processNewFiles = useCallback(
    async (newFiles: File[]) => {
      const added = addFiles(newFiles);
      setIsProcessing(true);

      for (const pf of added) {
        await processSingleFile(pf.file, pf.id, {
          onStatusChange: (id, status) => updateFile(id, { status }),
          onCodeExtracted: (id, code, error) =>
            updateFile(id, { extractedCode: code, error: error || null }),
          onComplete: (id, result) =>
            updateFile(id, {
              status: result.status,
              modifiedPdf: result.modifiedPdf,
              error: result.error,
              processingTimeMs: result.processingTimeMs,
            }),
        });
      }

      setIsProcessing(false);
    },
    [addFiles, updateFile]
  );

  const retryWithManualCode = useCallback(
    async (id: string, code: string) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;

      updateFile(id, { status: "PROCESSING", manualCode: code });

      const result = await reprocessWithManualCode(file.file, code);

      if (result.success && result.modifiedPdf) {
        updateFile(id, {
          status: "SUCCESS",
          extractedCode: code.toUpperCase(),
          modifiedPdf: result.modifiedPdf,
          error: null,
        });
      } else {
        updateFile(id, {
          status: "FAILED",
          error: result.error || "Gagal memodifikasi PDF",
        });
      }
    },
    [files, updateFile]
  );

  const handleDownloadSingle = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file?.modifiedPdf) {
        downloadSinglePdf(file.modifiedPdf, file.file.name);
      }
    },
    [files]
  );

  const handleDownloadAll = useCallback(async () => {
    setIsZipping(true);
    try {
      const zipBlob = await buildZip(files);
      downloadZip(zipBlob);
    } catch (error) {
      console.error("Failed to create ZIP:", error);
    }
    setIsZipping(false);
  }, [files]);

  const successCount = files.filter((f) => f.status === "SUCCESS").length;
  const failedCount = files.filter((f) => f.status === "FAILED").length;
  const processingCount = files.filter((f) => f.status === "PROCESSING").length;
  const queuedCount = files.filter((f) => f.status === "QUEUED").length;
  const totalCount = files.length;
  const progress =
    totalCount > 0
      ? Math.round(((successCount + failedCount) / totalCount) * 100)
      : 0;

  return {
    files,
    isProcessing,
    isZipping,
    successCount,
    failedCount,
    processingCount,
    queuedCount,
    totalCount,
    progress,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    processNewFiles,
    retryWithManualCode,
    handleDownloadSingle,
    handleDownloadAll,
  };
}
