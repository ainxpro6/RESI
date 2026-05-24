"use client";

import { Package, FileText, ArrowUpFromLine } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Animated illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-secondary/50 border border-border/50 flex items-center justify-center animate-float">
          <Package className="w-12 h-12 text-muted-foreground/50" />
        </div>
        {/* Orbiting icons */}
        <div
          className="absolute -top-2 -right-4 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          <FileText className="w-5 h-5 text-primary/60" />
        </div>
        <div
          className="absolute -bottom-2 -left-4 w-9 h-9 rounded-xl bg-[oklch(0.7_0.19_160_/_10%)] border border-[oklch(0.7_0.19_160_/_20%)] flex items-center justify-center animate-float"
          style={{ animationDelay: "1s" }}
        >
          <ArrowUpFromLine className="w-4 h-4 text-[oklch(0.7_0.19_160_/_60%)]" />
        </div>
      </div>

      {/* Text */}
      <div className="space-y-3 max-w-sm">
        <h3 className="text-xl font-semibold text-foreground/80">
          Belum ada file yang diunggah
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Drag and Drop PDF resi pengiriman atau Paste Link Desty ke area di atas. Sistem akan otomatis
          mengekstrak Kode Pengambilan dan mencetak ulang dalam ukuran besar.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
        {[
          { step: "1", title: "Unggah / Paste", desc: "Drag and Drop PDF atau Paste Link" },
          { step: "2", title: "Proses", desc: "Ekstrak kode otomatis" },
          { step: "3", title: "Unduh", desc: "Download PDF baru" },
        ].map((item) => (
          <div
            key={item.step}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 border border-border/30"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center">
              {item.step}
            </div>
            <p className="text-sm font-medium text-foreground/80">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
