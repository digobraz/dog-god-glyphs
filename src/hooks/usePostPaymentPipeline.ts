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
        // Pre-inline cross-origin images (Cloudinary delivery has no CORS header,
        // so <img> elements would taint the canvas and break html-to-image).
        // Fetching via JS bypasses the canvas taint check.
        const revokes: string[] = [];
        const targets = [certRef.current, verticalRef.current, horizontalRef.current].filter(Boolean) as HTMLElement[];
        for (const root of targets) {
          const imgs = Array.from(root.querySelectorAll('img'));
          await Promise.all(imgs.map(async (img) => {
            const src = img.src;
            if (!src || src.startsWith('blob:') || src.startsWith('data:') || src.startsWith(location.origin)) return;
            try {
              const r = await fetch(src, { mode: 'cors' });
              if (!r.ok) return;
              const blob = await r.blob();
              const objUrl = URL.createObjectURL(blob);
              revokes.push(objUrl);
              await new Promise<void>((resolve) => {
                const tmp = new Image();
                tmp.onload = () => { img.src = objUrl; resolve(); };
                tmp.onerror = () => resolve();
                tmp.src = objUrl;
              });
            } catch { /* leave original src — toPng may still succeed */ }
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
        console.error('[postPayment] pipeline failed:', err);
      }
    }, RENDER_DELAY_MS);
  }, [email, dogName, ownerName, dogPhotoUrl, sessionId, packNumber, certRef, verticalRef, horizontalRef]);
}
