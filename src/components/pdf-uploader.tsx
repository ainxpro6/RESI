"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PdfUploaderProps {
  onFilesAdded: (files: File[]) => void;
  isProcessing: boolean;
  fileCount: number;
}

export function PdfUploader({
  onFilesAdded,
  isProcessing,
  fileCount,
}: PdfUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: { file: File }[]) => {
      if (rejectedFiles.length > 0) {
        toast.error("Format file tidak valid", {
          description: "Hanya file PDF (.pdf) yang diterima.",
          icon: <AlertCircle className="w-4 h-4" />,
        });
      }
      if (acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles);
        toast.success(`${acceptedFiles.length} file ditambahkan`, {
          description: "Memulai pemrosesan...",
        });
      }
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      disabled: isProcessing,
      multiple: true,
    });

  return (
    <div
      {...getRootProps()}
      id="pdf-uploader"
      className={cn(
        "relative rounded-2xl p-8 sm:p-12 cursor-pointer transition-all duration-300 group",
        "dropzone-border",
        isDragActive && !isDragReject && "dropzone-active",
        isDragReject && "border-destructive/60 bg-destructive/5",
        isProcessing && "opacity-50 cursor-not-allowed",
        !isDragActive && "hover:bg-secondary/30"
      )}
    >
      <input {...getInputProps()} id="pdf-file-input" />

      <div className="flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            "relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragActive
              ? "bg-primary/20 scale-110"
              : "bg-secondary/60 group-hover:bg-primary/10 group-hover:scale-105"
          )}
        >
          {isDragActive ? (
            <FileUp className="w-8 h-8 text-primary animate-float" />
          ) : (
            <Upload className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          {isDragActive && (
            <div className="absolute -inset-2 rounded-2xl bg-primary/10 blur-lg animate-pulse-glow" />
          )}
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">
            {isDragActive
              ? "Lepaskan file PDF di sini..."
              : "Seret & lepas file PDF resi"}
          </p>
          <p className="text-sm text-muted-foreground max-w-md">
            {isDragReject
              ? "Hanya file PDF yang diterima. Silakan coba lagi."
              : "Atau klik untuk memilih file. Mendukung unggah banyak file sekaligus."}
          </p>
        </div>

        {/* File count indicator */}
        {fileCount > 0 && !isDragActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
            <FileUp className="w-3.5 h-3.5" />
            <span>{fileCount} file dalam antrean</span>
          </div>
        )}
      </div>
    </div>
  );
}
