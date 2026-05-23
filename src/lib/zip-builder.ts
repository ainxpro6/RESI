import JSZip from "jszip";
import type { ProcessedFile } from "./pdf-processor";

/**
 * Bundle all successfully modified PDFs into a ZIP file.
 */
export async function buildZip(
  files: ProcessedFile[]
): Promise<Blob> {
  const zip = new JSZip();

  const successFiles = files.filter(
    (f) => f.status === "SUCCESS" && f.modifiedPdf
  );

  for (const file of successFiles) {
    if (file.modifiedPdf) {
      const baseName = file.file.name.replace(/\.pdf$/i, "");
      const fileName = `${baseName}_modified.pdf`;
      zip.file(fileName, file.modifiedPdf);
    }
  }

  return zip.generateAsync({ type: "blob" });
}
