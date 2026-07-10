import { useEffect, useRef, RefObject } from 'react';
import { toPng } from 'html-to-image';
import { renderPdfsSequential } from '@/services/pdfService';
import { uploadCertPdf, uploadVerticalPdf, uploadHorizontalPdf, uploadHeroglyphPng, uploadShareCardPng } from '@/services/cloudinaryService';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';

const EDGE_HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'apikey': SUPABASE_ANON_KEY };
const RENDER_DELAY_MS = 1500;
const HEROGLYPH_RETRY_DELAY_MS = 4000;

// ShareCard mounts inside shareRef only once heroglyphPngUrl (below) exists —
// it then kicks off its OWN async canvas recolor (black heroglyph -> gold) and
// renders an <img src="data:..."> once that resolves (see ShareCard.tsx). That
// component lives in the parent (WelcomeScreen), not in this hook, so we can't
// just await a callback here — we poll the DOM for the gold <img> instead,
// bounded by a timeout so a recolor failure (or ShareCard never mounting
// because the heroglyph capture itself failed) can never hang this branch.
const SHARE_CARD_POLL_TIMEOUT_MS = 8000;
const SHARE_CARD_POLL_INTERVAL_MS = 150;

async function waitForShareCardRoot(shareRef: RefObject<HTMLDivElement>): Promise<HTMLElement | null> {
  const start = Date.now();
  while (Date.now() - start < SHARE_CARD_POLL_TIMEOUT_MS) {
    const root = shareRef.current?.querySelector('#share-card-root') as HTMLElement | null;
    if (root && root.querySelector('img[src^="data:"]')) return root;
    await new Promise((r) => setTimeout(r, SHARE_CARD_POLL_INTERVAL_MS));
  }
  // Timed out — the gold heroglyph <img> never appeared. Do NOT capture a
  // half-empty card: an uploaded black card is worse than no card (OG/dog
  // page fall back to cloudinary_main_url, and the wall-custodian re-bakes
  // the missing share_card_url server-side within its next cycle). This
  // exact failure shipped black cards for INGO #31 / JOY #32 (iOS Safari
  // buyers, 2026-07-10).
  return null;
}

// Fire-and-forget: captures the ShareCard at its native 1080x1080 (pixelRatio 1
// — it's already full-size, no upscale needed) and PATCHes dogs.share_card_url.
// Not awaited by the caller so a share-card failure can never delay/break the
// PDF + heroglyph pipeline above.
async function captureShareCard(sid: string, shareRef: RefObject<HTMLDivElement>) {
  try {
    const root = await waitForShareCardRoot(shareRef);
    if (!root) {
      console.warn('[postPayment] share card not ready in time — skipping upload (custodian will re-bake)');
      return;
    }

    // Pre-inline the dog photo (CSS background-image → data: URI) so
    // html-to-image never has to fetch it mid-serialization — that fetch is
    // what silently dropped the photo on iOS Safari. If the photo can't be
    // inlined, skip the upload entirely rather than ship a photo-less card.
    const photoDiv = Array.from(root.querySelectorAll('div')).find((el) =>
      (el as HTMLElement).style.backgroundImage?.includes('url('),
    ) as HTMLElement | undefined;
    if (photoDiv) {
      const m = photoDiv.style.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
      const src = m?.[1];
      if (src && !src.startsWith('data:')) {
        const r = await fetch(src, { mode: 'cors' });
        if (!r.ok) throw new Error(`photo inline failed: ${r.status}`);
        const blob = await r.blob();
        const dataUrl: string = await new Promise((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result as string);
          fr.onerror = () => rej(fr.error);
          fr.readAsDataURL(blob);
        });
        photoDiv.style.backgroundImage = `url("${dataUrl}")`;
      }
    }

    // Double render: Safari's async image decode inside the SVG/foreignObject
    // capture can paint blank on the first pass (known html-to-image quirk) —
    // the second call reuses warm caches and paints reliably.
    await toPng(root, { cacheBust: false, pixelRatio: 1, backgroundColor: '#000' });
    const dataUrl = await toPng(root, { cacheBust: false, pixelRatio: 1, backgroundColor: '#000' });
    const pngRes = await fetch(dataUrl);
    const pngBlob = await pngRes.blob();
    // Belt & braces: a card without the photo/glyph compresses to well under
    // 300 KB (broken INGO/JOY cards were ~100 KB; every real card ≥ 570 KB).
    // Refuse to upload obviously-empty output — no card beats a black card.
    if (pngBlob.size < 300_000) {
      console.warn(`[postPayment] share card suspiciously small (${pngBlob.size}B) — skipping upload`);
      return;
    }
    const pngResult = await uploadShareCardPng(pngBlob, sid);
    fetch(`${EDGE_BASE}/send-certificate`, {
      method: 'POST',
      headers: EDGE_HEADERS,
      body: JSON.stringify({ sessionId: sid, shareCardUrl: pngResult.secureUrl }),
    }).catch(() => {});
  } catch (e) {
    console.warn('[postPayment] share card capture failed:', e);
  }
}

interface PipelineArgs {
  email: string;
  dogName: string;
  ownerName: string;
  dogPhotoUrl: string;
  sessionId: string | null;
  packNumber: number | null;
  certRef: RefObject<HTMLDivElement>;
  verticalRef: RefObject<HTMLDivElement>;
  horizontalRef: RefObject<HTMLDivElement>;
  shareRef: RefObject<HTMLDivElement>;
  onHeroglyphReady?: (url: string) => void;
}

export function usePostPaymentPipeline(args: PipelineArgs) {
  const { email, dogName, ownerName, dogPhotoUrl, sessionId, packNumber, certRef, verticalRef, horizontalRef, shareRef, onHeroglyphReady } = args;
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (!email || !dogName) return;
    if (!certRef.current || !verticalRef.current || !horizontalRef.current || !shareRef.current) return;

    fired.current = true;
    const sid = sessionId || `local-${Date.now()}`;

    // One retry after 8s — the pipeline used to be strictly fire-once: a single
    // transient failure (Cloudinary upload, font fetch) meant empty pdf_*_url
    // and nothing to download in /pack. PackDogDetail still auto-regenerates
    // server-side as the last resort.
    const MAX_ATTEMPTS = 2;
    const runPipeline = async (attempt: number): Promise<void> => {
      try {
        // Pre-inline external image URLs as data: URIs so html-to-image's PNG
        // serializer never needs to fetch (Cloudinary lacks CORS headers, and
        // SVG <image href="/assets/...svg"> can hit fetch errors during render).
        const revokes: string[] = [];
        const cache = new Map<string, string>();
        const toDataUrl = async (src: string): Promise<string | null> => {
          if (!src || src.startsWith('data:')) return src || null;
          if (cache.has(src)) return cache.get(src)!;
          try {
            const r = await fetch(src, { mode: 'cors' });
            if (!r.ok) return null;
            const blob = await r.blob();
            const dataUrl: string = await new Promise((res, rej) => {
              const fr = new FileReader();
              fr.onload = () => res(fr.result as string);
              fr.onerror = () => rej(fr.error);
              fr.readAsDataURL(blob);
            });
            cache.set(src, dataUrl);
            return dataUrl;
          } catch {
            return null;
          }
        };

        const targets = [certRef.current, verticalRef.current, horizontalRef.current].filter(Boolean) as HTMLElement[];
        for (const root of targets) {
          // <img> elements
          const imgs = Array.from(root.querySelectorAll('img'));
          await Promise.all(imgs.map(async (img) => {
            const src = img.src;
            if (!src || src.startsWith('blob:') || src.startsWith('data:')) return;
            const dataUrl = await toDataUrl(src);
            if (dataUrl) {
              await new Promise<void>((resolve) => {
                const tmp = new Image();
                tmp.onload = () => { img.src = dataUrl; resolve(); };
                tmp.onerror = () => resolve();
                tmp.src = dataUrl;
              });
            }
          }));
          // SVG <image href|xlink:href> elements
          const svgImages = Array.from(root.querySelectorAll('image'));
          await Promise.all(svgImages.map(async (im) => {
            const href = im.getAttribute('href') || im.getAttribute('xlink:href');
            if (!href || href.startsWith('data:')) return;
            const absUrl = href.startsWith('http') ? href : new URL(href, location.origin).toString();
            const dataUrl = await toDataUrl(absUrl);
            if (dataUrl) {
              im.setAttribute('href', dataUrl);
              im.removeAttribute('xlink:href');
            }
          }));
        }

        // Capture heroglyph PNG from the horizontal frame SVG before PDF rendering.
        // This is isolated from the outer PDF-pipeline retry (MAX_ATTEMPTS above) by
        // design, so a transient failure here (canvas/CORS hiccup, Cloudinary upload
        // blip) needs its own retry — otherwise heroglyph_png_url stays empty forever
        // with no second attempt (happened to DIVA #27, 2026-07-09).
        const captureHeroglyph = async (): Promise<string> => {
          const svgEl = horizontalRef.current?.querySelector('svg') as unknown as HTMLElement | null;
          if (!svgEl) return '';
          const dataUrl = await toPng(svgEl, { cacheBust: true, pixelRatio: 2, backgroundColor: undefined });
          const pngRes = await fetch(dataUrl);
          const pngBlob = await pngRes.blob();
          const pngResult = await uploadHeroglyphPng(pngBlob, sid);
          return pngResult.secureUrl;
        };
        let heroglyphPngUrl = '';
        try {
          heroglyphPngUrl = await captureHeroglyph();
        } catch (e) {
          console.warn('[postPayment] heroglyph PNG capture failed, retrying once:', e);
          await new Promise((r) => setTimeout(r, HEROGLYPH_RETRY_DELAY_MS));
          try {
            heroglyphPngUrl = await captureHeroglyph();
          } catch (e2) {
            console.warn('[postPayment] heroglyph PNG capture failed on retry:', e2);
          }
        }
        if (heroglyphPngUrl) {
          onHeroglyphReady?.(heroglyphPngUrl);
          // Fire-and-forget: save to DB immediately, independent of PDF success
          fetch(`${EDGE_BASE}/send-certificate`, {
            method: 'POST',
            headers: EDGE_HEADERS,
            body: JSON.stringify({ sessionId: sid, heroglyphPngUrl }),
          }).catch(() => {});

          // SHARE CARD — onHeroglyphReady above sets WelcomeScreen's
          // heroglyphPngUrl state, which mounts <ShareCard> inside shareRef
          // with that URL as its source. Kicked off in parallel with the PDF
          // pipeline below (not awaited) — see captureShareCard for the
          // ShareCard-readiness wait.
          void captureShareCard(sid, shareRef);
        }

        const [certBlob, vBlob, hBlob] = await renderPdfsSequential([
          { element: certRef.current!, orientation: 'portrait', fileName: 'certificate.pdf' },
          { element: verticalRef.current!, orientation: 'portrait', marginMm: 25, bgColor: '#F5EDE0', fileName: 'heroglyph-vertical.pdf' },
          { element: horizontalRef.current!, orientation: 'landscape', marginMm: 20, bgColor: '#F5EDE0', fileName: 'heroglyph-horizontal.pdf' },
        ]);

        revokes.forEach((u) => { try { URL.revokeObjectURL(u); } catch { /* ignore */ } });

        const [c, v, h] = await Promise.all([
          uploadCertPdf(certBlob, sid),
          uploadVerticalPdf(vBlob, sid),
          uploadHorizontalPdf(hBlob, sid),
        ]);

        // Silent PATCH: persist PDF URLs to dogs.pdf_*_url. No email — stripe-webhook
        // already sent the welcome email with magic link to /pack where the buyer
        // downloads these PDFs.
        await fetch(`${EDGE_BASE}/send-certificate`, {
          method: 'POST',
          headers: EDGE_HEADERS,
          body: JSON.stringify({
            sessionId: sid,
            pdfUrls: { cert: c.secureUrl, vertical: v.secureUrl, horizontal: h.secureUrl },
          }),
        });
      } catch (err) {
        const e = err as Error;
        console.error(`[postPayment] pipeline failed (attempt ${attempt}/${MAX_ATTEMPTS}):`, e?.message || e, e?.stack || err);
        if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => { void runPipeline(attempt + 1); }, 8000);
        }
      }
    };
    setTimeout(() => { void runPipeline(1); }, RENDER_DELAY_MS);
  }, [email, dogName, ownerName, dogPhotoUrl, sessionId, packNumber, certRef, verticalRef, horizontalRef, shareRef]);
}
