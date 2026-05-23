"use client";

import { Header } from "@/components/header";
import { PdfUploader } from "@/components/pdf-uploader";
import { ProcessingDashboard } from "@/components/processing-dashboard";
import { DownloadBar } from "@/components/download-bar";
import { EmptyState } from "@/components/empty-state";
import { usePdfProcessor } from "@/hooks/use-pdf-processor";

export default function Home() {
  const processor = usePdfProcessor();

  return (
    <div className="relative min-h-screen flex flex-col">
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
            <span className="text-primary/70">Data Anda tidak dikirim ke server manapun.</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
