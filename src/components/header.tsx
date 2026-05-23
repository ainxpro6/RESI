"use client";

import { FileText, Shield } from "lucide-react";

export function Header() {
  return (
    <header className="relative z-10 w-full border-b border-border/40 glass-strong">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-primary/10 blur-md -z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight gradient-text">
                RESI
              </h1>
              <p className="text-[11px] text-muted-foreground leading-none -mt-0.5">
                PDF Receipt Modifier
              </p>
            </div>
          </div>

          {/* Privacy badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-[oklch(0.7_0.19_160)]" />
            <span className="hidden sm:inline">Client-side processing</span>
            <span className="sm:hidden">Private</span>
          </div>
        </div>
      </div>
    </header>
  );
}
