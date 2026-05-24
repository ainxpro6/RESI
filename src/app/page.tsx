"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { PdfUploader } from "@/components/pdf-uploader";
import { ProcessingDashboard } from "@/components/processing-dashboard";
import { DownloadBar } from "@/components/download-bar";
import { EmptyState } from "@/components/empty-state";
import { usePdfProcessor } from "@/hooks/use-pdf-processor";
import { isValidDestyPdfUrl } from "@/lib/pdf-fetcher";

/**
 * Inner component that uses useSearchParams (must be inside Suspense).
 * Reads the ?url= query parameter and auto-processes it.
 */
function UrlAutoProcessor({ processUrl }: { processUrl: (url: string) => void }) {
  const searchParams = useSearchParams();
  const hasAutoProcessed = useRef(false);

  useEffect(() => {
    if (hasAutoProcessed.current) return;

    const urlParam = searchParams.get("url");
    if (urlParam && isValidDestyPdfUrl(urlParam)) {
      hasAutoProcessed.current = true;
      processUrl(urlParam);
    }
  }, [searchParams, processUrl]);

  return null;
}

export default function Home() {
  const processor = usePdfProcessor();

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Auto-process URL from query parameter (e.g. from browser extension) */}
      <Suspense fallback={null}>
        <UrlAutoProcessor processUrl={processor.processUrl} />
      </Suspense>

      {/* Background effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Uploader Section */}
          <section id="uploader-section" className="animate-slide-up">
            <PdfUploader
              onFilesAdded={processor.processNewFiles}
              onLinkSubmit={processor.processUrl}
              isProcessing={processor.isProcessing}
              fileCount={processor.totalCount}
            />
          </section>

          {/* Dashboard or Empty State */}
          {processor.totalCount > 0 ? (
            <section
              id="dashboard-section"
              className="animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <ProcessingDashboard
                files={processor.files}
                isProcessing={processor.isProcessing}
                progress={processor.progress}
                successCount={processor.successCount}
                failedCount={processor.failedCount}
                totalCount={processor.totalCount}
                onDownloadSingle={processor.handleDownloadSingle}
                onRemoveFile={processor.removeFile}
                onRetryWithCode={processor.retryWithManualCode}
                onClearAll={processor.clearAll}
              />
            </section>
          ) : (
            <section
              className="animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              <EmptyState />
            </section>
          )}
        </main>

        {/* Sticky Download Bar */}
        {processor.successCount > 0 && !processor.isProcessing && (
          <DownloadBar
            successCount={processor.successCount}
            failedCount={processor.failedCount}
            totalCount={processor.totalCount}
            isZipping={processor.isZipping}
            onDownloadAll={processor.handleDownloadAll}
          />
        )}

        {/* Footer */}
        <footer className="relative z-10 text-center py-6 text-sm text-muted-foreground border-t border-border/40">
          <p>
            RESI — Seluruh pemrosesan dilakukan di browser Anda.{" "}
            <span className="text-primary/70">Link diunduh melalui server, tanpa menyimpan data.</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
