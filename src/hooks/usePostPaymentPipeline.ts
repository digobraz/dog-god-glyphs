import { useEffect, useRef, RefObject } from 'react';
import { toPng } from 'html-to-image';
import { renderPdfsSequential } from '@/services/pdfService';
import { uploadCertPdf, uploadVerticalPdf, uploadHorizontalPdf, uploadHeroglyphPng, uploadShareCardPng } from '@/services/cloudinaryService';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';

const EDGE_HEADERS = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'apikey': SUPABASE_ANON_KEY };
const RENDER_DELAY_MS = 1500;

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
  // Timed out — capture whatever is there (root may exist without the gold
  // heroglyph <img> yet, or not exist at all) rather than silently skipping.
  return (shareRef.current?.querySelector('#share-card-root') as HTMLElement | null) ?? null;
}

// Fire-and-forget: captures the ShareCard at its native 1080x1080 (pixelRatio 1
// — it's already full-size, no upscale needed) and PATCHes dogs.share_card_url.
// Not awaited by the caller so a share-card failure can never delay/break the
// PDF + heroglyph pipeline above.
async function captureShareCard(sid: string, shareRef: RefObject<HTMLDivElement>) {
  try {
    const root = await waitForShareCardRoot(shareRef);
    if (!root) return; // ShareCard never mounted — skip silently.
    const dataUrl = await toPng(root, { cacheBust: true, pixelRatio: 1, backgroundColor: '#000' });
    const pngRes = await fetch(dataUrl);
    const pngBlob = await pngRes.blob();
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

        // Capture heroglyph PNG from the horizontal frame SVG before PDF rendering
        let heroglyphPngUrl = '';
        try {
          const svgEl = horizontalRef.current?.querySelector('svg') as unknown as HTMLElement | null;
          if (svgEl) {
            const dataUrl = await toPng(svgEl, { cacheBust: true, pixelRatio: 2, backgroundColor: undefined });
            const pngRes = await fetch(dataUrl);
            const pngBlob = await pngRes.blob();
            const pngResult = await uploadHeroglyphPng(pngBlob, sid);
            heroglyphPngUrl = pngResult.secureUrl;
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
        } catch (e) {
          console.warn('[postPayment] heroglyph PNG capture failed:', e);
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
