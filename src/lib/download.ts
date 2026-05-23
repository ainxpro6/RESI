/**
 * Trigger a browser download from a Uint8Array or Blob.
 */
export function downloadBlob(data: Uint8Array | Blob, fileName: string) {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download a single modified PDF.
 */
export function downloadSinglePdf(data: Uint8Array, originalName: string) {
  const baseName = originalName.replace(/\.pdf$/i, "");
  downloadBlob(data, `${baseName}_modified.pdf`);
}

/**
 * Download a ZIP blob.
 */
export function downloadZip(zipBlob: Blob) {
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadBlob(zipBlob, `resi_modified_${timestamp}.zip`);
}
