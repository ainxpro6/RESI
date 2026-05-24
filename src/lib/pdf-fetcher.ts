const DESTY_HOST = "desty-upload-indonesia.oss-ap-southeast-5.aliyuncs.com";

/**
 * Validate that a URL is a valid Desty PDF link.
 */
export function isValidDestyPdfUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.host === DESTY_HOST &&
      parsed.pathname.toLowerCase().endsWith(".pdf")
    );
  } catch {
    return false;
  }
}

/**
 * Extract a human-readable filename from a Desty PDF URL.
 * e.g. "https://...aliyuncs.com/desty-omni/20260524/a8568e830256409bb34711be59d1280a.pdf"
 *   → "a8568e830256409bb34711be59d1280a.pdf"
 */
export function extractFileNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || "download.pdf";
  } catch {
    return "download.pdf";
  }
}

/**
 * Fetch a PDF from a Desty URL via our proxy API route.
 * Returns the raw ArrayBuffer and a derived filename.
 */
export async function fetchPdfFromUrl(url: string): Promise<{
  buffer: ArrayBuffer;
  fileName: string;
}> {
  if (!isValidDestyPdfUrl(url)) {
    throw new Error("URL bukan link PDF Desty yang valid.");
  }

  const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    let errorMsg = `Gagal mengunduh PDF (HTTP ${response.status})`;
    try {
      const body = await response.json();
      if (body.error) errorMsg = body.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(errorMsg);
  }

  const buffer = await response.arrayBuffer();
  const fileName = extractFileNameFromUrl(url);

  return { buffer, fileName };
}
