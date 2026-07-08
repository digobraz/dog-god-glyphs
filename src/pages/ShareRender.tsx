import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShareCard } from '@/components/ShareCard';
import { decodeRenderData } from '@/lib/renderData';

/**
 * Headless render target for the share card (social share image, 1080×1080).
 * Used by (a) a batch Playwright script over existing dogs, and (b) manual
 * visual preview during dev.
 *
 * URL: /share-render/:id?d=<base64url JSON>
 *
 * Data contract is self-contained (does NOT depend on get-render-data — a
 * headless browser can't do that cross-origin fetch, same reasoning as
 * CertRender): { packNumber, dogName, photoUrl, heroglyphUrl }.
 *
 * The page sets data-render-ready="1" on <html> once the photo has loaded,
 * document.fonts.ready has resolved, the ShareCard's name auto-fit has
 * applied, AND the ShareCard's gold heroglyph canvas-recolor has completed
 * (ShareCard fetches+recolors heroglyphUrl itself — see onHeroglyphReady) —
 * Playwright waits for that attribute before screenshotting the
 * #share-card-root element (exactly 1080×1080).
 */

interface ShareRenderData {
  packNumber: number;
  dogName: string;
  photoUrl: string;
  heroglyphUrl: string;
}

export default function ShareRender() {
  const [params] = useSearchParams();
  const dataParam = params.get('d');

  const [data] = useState<ShareRenderData | null>(() => decodeRenderData<ShareRenderData>(dataParam));
  const [heroglyphGoldReady, setHeroglyphGoldReady] = useState(false);

  useEffect(() => {
    // Gate on the gold heroglyph recolor first — it's the last-finishing,
    // most expensive step (fetch + createImageBitmap + canvas draw).
    if (!data || !heroglyphGoldReady) return;
    let cancelled = false;

    const preload = (src: string) =>
      new Promise<void>((res) => {
        if (!src) return res();
        const im = new Image();
        im.onload = () => res();
        im.onerror = () => res();
        im.src = src;
      });

    const markReady = async () => {
      try {
        await Promise.all([
          preload(data.photoUrl),
          (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready ?? Promise.resolve(),
        ]);
      } catch {
        /* ignore */
      }
      // settle: let the auto-fit useLayoutEffect (which itself waits on
      // fonts.ready) run and paint before we signal ready to capture.
      await new Promise((res) => setTimeout(res, 300));
      if (!cancelled) document.documentElement.setAttribute('data-render-ready', '1');
    };

    markReady();
    return () => {
      cancelled = true;
    };
  }, [data, heroglyphGoldReady]);

  if (!data) {
    return <div style={{ padding: 20, color: '#fff' }}>missing ?d= payload</div>;
  }

  return (
    <>
      <style>{`
        html, body, #root { margin: 0; padding: 0; height: 100%; background: #141414; }
      `}</style>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#141414',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShareCard
          packNumber={data.packNumber}
          dogName={data.dogName}
          photoUrl={data.photoUrl}
          heroglyphUrl={data.heroglyphUrl}
          onHeroglyphReady={() => setHeroglyphGoldReady(true)}
        />
      </div>
    </>
  );
}
