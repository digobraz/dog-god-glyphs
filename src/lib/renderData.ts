// Render data injected into the headless render URL by the generate-pdfs edge
// function as a base64url-encoded JSON blob (?data=...).
//
// Why: Cloudflare Browser Rendering loads /cert-render and /invoice-render in a
// headless browser that CANNOT complete the cross-origin fetch to the
// get-render-data edge function — it fails with "Failed to fetch", so the page
// never reaches data-render-ready and CF times out (no email PDFs, no invoice).
// generate-pdfs now fetches the data server-side (which works) and passes it in
// the URL; the page decodes it here and skips the fetch entirely. The fetch path
// stays as a fallback for manual/dev use of the route without ?data.
export function decodeRenderData<T>(param: string | null): T | null {
  if (!param) return null;
  try {
    const b64 = param.replace(/-/g, '+').replace(/_/g, '/');
    // atob → binary string → UTF-8 JSON (handles diacritics in names)
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
