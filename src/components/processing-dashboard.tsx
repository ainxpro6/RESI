"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileRow } from "@/components/file-row";
import { Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { ProcessedFile } from "@/lib/pdf-processor";

interface ProcessingDashboardProps {
  files: ProcessedFile[];
  isProcessing: boolean;
  progress: number;
  successCount: number;
  failedCount: number;
  totalCount: number;
  onDownloadSingle: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onRetryWithCode: (id: string, code: string) => void;
  onClearAll: () => void;
}

export function ProcessingDashboard({
  files,
  isProcessing,
  progress,
  successCount,
  failedCount,
  totalCount,
  onDownloadSingle,
  onRemoveFile,
  onRetryWithCode,
  onClearAll,
}: ProcessingDashboardProps) {
  return (
    <Card className="glass border-border/40 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold">
              Dashboard Pemrosesan
            </CardTitle>
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground border-border/50"
            >
              {totalCount} file
            </Badge>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Stats badges */}
            <div className="flex items-center gap-2">
              {successCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-[oklch(0.7_0.19_160)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{successCount} selesai</span>
                </div>
              )}
              {failedCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{failedCount} gagal</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </div>
              )}
            </div>

            {/* Clear all button */}
            {!isProcessing && (
              <Button
                id="clear-all-btn"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={onClearAll}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Hapus Semua
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div className="space-y-1.5 mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Memproses file...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-secondary/60"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        {files.map((file, index) => (
          <FileRow
            key={file.id}
            file={file}
            index={index}
            onDownload={onDownloadSingle}
            onRemove={onRemoveFile}
            onRetryWithCode={onRetryWithCode}
          />
        ))}
      </CardContent>
    </Card>
  );
}
