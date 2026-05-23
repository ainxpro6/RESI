"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2, Archive, CheckCircle2, XCircle } from "lucide-react";

interface DownloadBarProps {
  successCount: number;
  failedCount: number;
  totalCount: number;
  isZipping: boolean;
  onDownloadAll: () => void;
}

export function DownloadBar({
  successCount,
  failedCount,
  totalCount,
  isZipping,
  onDownloadAll,
}: DownloadBarProps) {
  return (
    <div className="sticky bottom-0 z-50 animate-slide-up">
      <div className="glass-strong border-t border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-[oklch(0.7_0.19_160)]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">{successCount}</span>
                <span className="text-muted-foreground hidden sm:inline">berhasil</span>
              </div>
              {failedCount > 0 && (
                <div className="flex items-center gap-1.5 text-destructive">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">{failedCount}</span>
                  <span className="text-muted-foreground hidden sm:inline">gagal</span>
                </div>
              )}
              <span className="text-muted-foreground/50 text-xs">
                dari {totalCount} file
              </span>
            </div>

            {/* Download button */}
            <Button
              id="download-all-btn"
              onClick={onDownloadAll}
              disabled={isZipping || successCount === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-10 gap-2 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengemas ZIP...</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  <span className="hidden sm:inline">Download Semua</span>
                  <span className="sm:hidden">Download</span>
                  <Download className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
