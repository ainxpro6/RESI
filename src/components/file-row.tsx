"use client";

import { useState } from "react";
import { Download, X, Loader2, Check, AlertTriangle, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatFileSize } from "@/lib/utils";
import type { ProcessedFile, FileStatus } from "@/lib/pdf-processor";

interface FileRowProps {
  file: ProcessedFile;
  index: number;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
  onRetryWithCode: (id: string, code: string) => void;
}

const statusConfig: Record<
  FileStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; className: string }
> = {
  QUEUED: {
    label: "Antrean",
    variant: "secondary",
    icon: <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />,
    className: "text-muted-foreground",
  },
  PROCESSING: {
    label: "Memproses...",
    variant: "outline",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />,
    className: "text-primary border-primary/30",
  },
  SUCCESS: {
    label: "Selesai",
    variant: "default",
    icon: <Check className="w-3.5 h-3.5" />,
    className: "bg-[oklch(0.7_0.19_160)] text-white border-0 hover:bg-[oklch(0.65_0.19_160)]",
  },
  FAILED: {
    label: "Gagal",
    variant: "destructive",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    className: "",
  },
};

export function FileRow({
  file,
  index,
  onDownload,
  onRemove,
  onRetryWithCode,
}: FileRowProps) {
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const config = statusConfig[file.status];

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onRetryWithCode(file.id, manualCode.trim());
      setManualCode("");
      setShowManualInput(false);
    }
  };

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300",
        "animate-scale-in",
        file.status === "SUCCESS"
          ? "bg-[oklch(0.7_0.19_160_/_3%)] border-[oklch(0.7_0.19_160_/_15%)]"
          : file.status === "FAILED"
          ? "bg-destructive/3 border-destructive/15"
          : file.status === "PROCESSING"
          ? "bg-primary/3 border-primary/15"
          : "bg-secondary/20 border-border/40"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
              {file.file.name}
            </p>
            <span className="text-[11px] text-muted-foreground/60">
              {formatFileSize(file.file.size)}
            </span>
          </div>

          {/* Processing time */}
          {file.processingTimeMs && (
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              {file.processingTimeMs}ms
            </p>
          )}
        </div>

        {/* Extracted code */}
        {file.extractedCode && (
          <div className="hidden sm:block">
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-lg tracking-wider cursor-default">
                  {file.extractedCode}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kode Pengambilan yang diekstrak</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Status badge */}
        <Badge
          variant={config.variant}
          className={cn(
            "flex items-center gap-1.5 text-xs px-2.5 py-1 shrink-0",
            config.className
          )}
        >
          {config.icon}
          <span className="hidden sm:inline">{config.label}</span>
        </Badge>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {file.status === "SUCCESS" && file.modifiedPdf && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  id={`download-${file.id}`}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[oklch(0.7_0.19_160)] hover:text-[oklch(0.8_0.19_160)] hover:bg-[oklch(0.7_0.19_160_/_10%)]"
                  onClick={() => onDownload(file.id)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>
          )}

          {file.status === "FAILED" && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => setShowManualInput(!showManualInput)}
                >
                  Input Manual
                </Button>
              </TooltipTrigger>
              <TooltipContent>Masukkan kode secara manual</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(file.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hapus file</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Mobile extracted code */}
      {file.extractedCode && (
        <div className="sm:hidden">
          <span className="inline-flex px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-lg tracking-wider">
            {file.extractedCode}
          </span>
        </div>
      )}

      {/* Error message */}
      {file.error && (
        <p className="text-xs text-destructive/80 pl-1">{file.error}</p>
      )}

      {/* Manual code input */}
      {showManualInput && file.status === "FAILED" && (
        <div className="flex items-center gap-2 animate-slide-down">
          <Input
            id={`manual-code-${file.id}`}
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="Masukkan Kode Pengambilan..."
            className="h-9 text-sm font-mono uppercase bg-secondary/50 border-border/50 focus-visible:ring-primary/50"
            maxLength={10}
            onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
          />
          <Button
            size="sm"
            className="h-9 px-3 bg-primary hover:bg-primary/90"
            onClick={handleManualSubmit}
            disabled={!manualCode.trim()}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Proses
          </Button>
        </div>
      )}

      {/* Processing shimmer */}
      {file.status === "PROCESSING" && (
        <div className="h-1 rounded-full overflow-hidden">
          <div className="h-full w-full animate-shimmer rounded-full" />
        </div>
      )}
    </div>
  );
}
