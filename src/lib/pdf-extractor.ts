export interface PageExtractionResult {
  pageNum: number;
  code: string | null;
}

export interface ExtractionResult {
  success: boolean;
  pages: PageExtractionResult[];
  codes: string[];
  totalPages: number;
  error?: string;
}

const PATTERNS = [
  /Kode\s*Pengambilan\s*[:\-]\s*([A-Z0-9]{3,10})/i,
  /Pickup\s*Code\s*[:\-]\s*([A-Z0-9]{3,10})/i,
  /KODE\s*[:\-]\s*([A-Z0-9]{3,10})/i,
];

/**
 * Extract "Kode Pengambilan" from every page of a PDF.
 * Returns per-page results so each receipt page can be stamped individually.
 */
export async function extractKodePengambilan(
  fileBuffer: ArrayBuffer
): Promise<ExtractionResult> {
  try {
    const pdfjsLib = await import("pdfjs-dist");

    // Configure the worker — use local copy from public/ to avoid CDN/CORS issues
    if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }

    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    const pages: PageExtractionResult[] = [];
    const codes: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .filter((item) => "str" in item)
        .map((item) => (item as { str: string }).str)
        .join(" ");

      let code: string | null = null;
      for (const pattern of PATTERNS) {
        const match = pageText.match(pattern);
        if (match && match[1]) {
          code = match[1].toUpperCase();
          break;
        }
      }

      pages.push({ pageNum, code });
      if (code) codes.push(code);
    }

    if (codes.length === 0) {
      return {
        success: false,
        pages,
        codes: [],
        totalPages: pdf.numPages,
        error: "Kode Pengambilan tidak ditemukan dalam dokumen.",
      };
    }

    return {
      success: true,
      pages,
      codes,
      totalPages: pdf.numPages,
    };
  } catch (error) {
    return {
      success: false,
      pages: [],
      codes: [],
      totalPages: 0,
      error: `Gagal membaca PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
