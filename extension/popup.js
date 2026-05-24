const DESTY_HOST = "desty-upload-indonesia.oss-ap-southeast-5.aliyuncs.com";
const DEFAULT_APP_URL = "http://localhost:3000";
const STORAGE_KEY = "resi_app_url";

/**
 * Check if a URL is a valid Desty PDF link.
 */
function isDestyPdfUrl(url) {
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
 * Get the saved app URL from localStorage, or use the default.
 */
function getAppUrl() {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_APP_URL;
  } catch {
    return DEFAULT_APP_URL;
  }
}

/**
 * Save the app URL to localStorage.
 */
function saveAppUrl(url) {
  try {
    localStorage.setItem(STORAGE_KEY, url);
  } catch {
    // ignore
  }
}

/**
 * Render the popup content based on whether a Desty PDF is detected.
 */
function renderContent(tabUrl) {
  const content = document.getElementById("content");
  const isDetected = isDestyPdfUrl(tabUrl);

  if (isDetected) {
    content.innerHTML = `
      <div class="status-card">
        <div class="status-icon detected">📄</div>
        <div class="status-title detected">PDF Desty terdeteksi!</div>
        <div class="status-description">
          Klik tombol di bawah untuk memproses resi ini di RESI.
        </div>
        <div class="url-preview">${escapeHtml(tabUrl)}</div>
      </div>
      <button id="process-btn" class="btn btn-primary">
        🚀 Proses di RESI
      </button>
    `;

    document.getElementById("process-btn").addEventListener("click", () => {
      const appUrl = getAppUrl();
      const targetUrl = `${appUrl}?url=${encodeURIComponent(tabUrl)}`;
      chrome.tabs.create({ url: targetUrl });
      window.close();
    });
  } else {
    content.innerHTML = `
      <div class="status-card">
        <div class="status-icon not-detected">🔍</div>
        <div class="status-title not-detected">Bukan halaman PDF Desty</div>
        <div class="status-description">
          Buka halaman PDF Desty terlebih dahulu, lalu klik ikon ekstensi ini untuk memproses resi.
        </div>
      </div>
      <button class="btn btn-primary" disabled>
        Proses di RESI
      </button>
    `;
  }
}

/**
 * Escape HTML to prevent XSS in URL display.
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize the popup.
 */
async function init() {
  // Load saved app URL
  const appUrlInput = document.getElementById("app-url");
  appUrlInput.value = getAppUrl();

  appUrlInput.addEventListener("change", () => {
    const val = appUrlInput.value.trim();
    if (val) {
      // Remove trailing slash
      saveAppUrl(val.replace(/\/+$/, ""));
    }
  });

  // Get the active tab
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    renderContent(tab?.url || "");
  } catch (err) {
    console.error("Failed to get active tab:", err);
    renderContent("");
  }
}

document.addEventListener("DOMContentLoaded", init);
