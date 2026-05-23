import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RESI — Modifikasi Resi PDF Otomatis",
  description:
    "Aplikasi web untuk memodifikasi resi pengiriman PDF secara otomatis. Ekstrak Kode Pengambilan dan cetak dalam ukuran besar untuk kemudahan operasional gudang.",
  keywords: ["resi", "PDF", "kode pengambilan", "modifikasi", "pengiriman", "gudang"],
  authors: [{ name: "RESI App" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delay={300}>
          {children}
        </TooltipProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.2 0.025 260)",
              border: "1px solid oklch(0.3 0.03 260)",
              color: "oklch(0.95 0.01 250)",
            },
          }}
        />
      </body>
    </html>
  );
}
