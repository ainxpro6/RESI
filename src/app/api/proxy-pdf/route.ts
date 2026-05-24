import { type NextRequest } from "next/server";

const ALLOWED_HOST = "desty-upload-indonesia.oss-ap-southeast-5.aliyuncs.com";

/**
 * Proxy endpoint to fetch Desty PDF files server-side.
 * This avoids CORS issues when the browser tries to fetch from Aliyun OSS directly.
 *
 * Usage: GET /api/proxy-pdf?url=<encoded-desty-pdf-url>
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return Response.json(
      { error: "Parameter 'url' diperlukan." },
      { status: 400 }
    );
  }

  // Validate URL structure
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return Response.json(
      { error: "URL tidak valid." },
      { status: 400 }
    );
  }

  // Only allow the Desty OSS domain
  if (parsed.host !== ALLOWED_HOST) {
    return Response.json(
      { error: `Domain tidak diizinkan. Hanya ${ALLOWED_HOST} yang didukung.` },
      { status: 400 }
    );
  }

  // Must end with .pdf
  if (!parsed.pathname.toLowerCase().endsWith(".pdf")) {
    return Response.json(
      { error: "URL harus mengarah ke file .pdf." },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "RESI-PDF-Proxy/1.0",
      },
    });

    if (!upstream.ok) {
      return Response.json(
        { error: `Gagal mengunduh PDF: HTTP ${upstream.status}` },
        { status: 502 }
      );
    }

    const pdfBytes = await upstream.arrayBuffer();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBytes.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: `Gagal mengunduh PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 502 }
    );
  }
}
