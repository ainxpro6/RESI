import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PageExtractionResult } from "./pdf-extractor";

export interface ModificationResult {
  success: boolean;
  modifiedPdf: Uint8Array | null;
  stampedCount: number;
  error?: string;
}

/**
 * Stamp extracted codes onto their respective pages in the PDF.
 * Each page gets its own code drawn in large bold text at the bottom.
 */
export async function stampCodeOnPdf(
  fileBuffer: ArrayBuffer,
  pageResults: PageExtractionResult[]
): Promise<ModificationResult> {
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    if (pages.length === 0) {
      return {
        success: false,
        modifiedPdf: null,
        stampedCount: 0,
        error: "PDF tidak memiliki halaman.",
      };
    }

    let stampedCount = 0;

    for (const pageResult of pageResults) {
      if (!pageResult.code) continue;

      const pageIndex = pageResult.pageNum - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) continue;

      const page = pages[pageIndex];
      const { width } = page.getSize();
      const code = pageResult.code;

      // Calculate font size to make the code prominent but fitting
      const maxFontSize = 96;
      const minFontSize = 72;
      let fontSize = maxFontSize;

      // Measure text width and adjust font size if needed
      let textWidth = font.widthOfTextAtSize(code, fontSize);
      const maxTextWidth = width * 0.85; // 85% of page width

      while (textWidth > maxTextWidth && fontSize > minFontSize) {
        fontSize -= 2;
        textWidth = font.widthOfTextAtSize(code, fontSize);
      }

      // Center the text horizontally
      const x = (width - textWidth) / 2;

      // Position at the bottom of the page with some margin
      const bottomMargin = 20;
      const y = bottomMargin;

      // Draw a white background rectangle for the code
      const padding = 10;
      const rectHeight = fontSize + padding * 2;
      const rectWidth = textWidth + padding * 2;
      const rectX = (width - rectWidth) / 2;

      page.drawRectangle({
        x: rectX,
        y: y - padding,
        width: rectWidth,
        height: rectHeight,
        color: rgb(1, 1, 1), // White background
        opacity: 0.9,
      });

      // Draw border around the rectangle
      page.drawRectangle({
        x: rectX,
        y: y - padding,
        width: rectWidth,
        height: rectHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1.5,
        color: rgb(1, 1, 1),
        opacity: 0,
      });

      // Draw the code text
      page.drawText(code, {
        x,
        y: y + 2,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      stampedCount++;
    }

    const modifiedPdf = await pdfDoc.save();

    return {
      success: true,
      modifiedPdf: new Uint8Array(modifiedPdf),
      stampedCount,
    };
  } catch (error) {
    return {
      success: false,
      modifiedPdf: null,
      stampedCount: 0,
      error: `Gagal memodifikasi PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Stamp ALL pages with a single manually-entered code.
 * Used when automatic extraction fails and user provides a code.
 */
export async function stampAllPagesWithCode(
  fileBuffer: ArrayBuffer,
  code: string
): Promise<ModificationResult> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const totalPages = pdfDoc.getPages().length;

  // Create page results for all pages with the same code
  const pageResults: PageExtractionResult[] = Array.from(
    { length: totalPages },
    (_, i) => ({ pageNum: i + 1, code: code.toUpperCase() })
  );

  return stampCodeOnPdf(fileBuffer, pageResults);
}
