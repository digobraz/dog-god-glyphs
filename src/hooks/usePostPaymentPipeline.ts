import { useEffect, useRef, RefObject } from 'react';
import { renderPdfsSequential } from '@/services/pdfService';
import { uploadCertPdf, uploadVerticalPdf, uploadHorizontalPdf } from '@/services/cloudinaryService';

const EDGE_BASE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1';
const RENDER_DELAY_MS = 1500;

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
}

export function usePostPaymentPipeline(args: PipelineArgs) {
  const { email, dogName, ownerName, dogPhotoUrl, sessionId, packNumber, certRef, verticalRef, horizontalRef } = args;
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (!email || !dogName) return;
    if (!certRef.current || !verticalRef.current || !horizontalRef.current) return;

    fired.current = true;
    const sid = sessionId || `local-${Date.now()}`;

    setTimeout(async () => {
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

        await fetch(`${EDGE_BASE}/send-certificate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            dogName,
            ownerName,
            dogPhotoUrl,
            sessionId,
            packNumber,
            pdfUrls: { cert: c.secureUrl, vertical: v.secureUrl, horizontal: h.secureUrl },
          }),
        });
      } catch (err) {
        const e = err as Error;
        console.error('[postPayment] pipeline failed:', e?.message || e, e?.stack || err);
      }
    }, RENDER_DELAY_MS);
  }, [email, dogName, ownerName, dogPhotoUrl, sessionId, packNumber, certRef, verticalRef, horizontalRef]);
}
