import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CertificateCard } from '@/components/CertificateCard';
import { VerticalHeroglyphFrame } from '@/components/VerticalHeroglyphFrame';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { useDogyptStore } from '@/store/dogyptStore';
import { buildHeroglyphCode } from '@/lib/heroglyphCode';

/**
 * Headless render target for server-side PDF generation (Cloudflare Browser
 * Rendering). Renders ONE artifact (cert | vertical | horizontal) on an exact
 * A4 page with the same margins/background the client pipeline used in
 * pdfService.ts, so the server PDF is pixel-faithful to the on-screen cert.
 *
 * URL: /cert-render/:id?type=cert|vertical|horizontal&key=<RENDER_KEY>
 *
 * The page sets data-render-ready="1" on <html> once data is loaded, the store
 * is rehydrated, and all images have decoded — Cloudflare waits for that
 * selector before printing.
 */

const EDGE_BASE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuenVyd21kZ3Z6bHFoc2JocnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDAxMzIsImV4cCI6MjA5MjI3NjEzMn0.oMdBisx_0Mla4PI1JtUT4lM1vgZVvbpcORfA8kbdWQY';

const FRAME_BG = '#F5EDE0';

type ArtifactType = 'cert' | 'vertical' | 'horizontal';

interface RenderDog {
  id: string;
  dog_name: string | null;
  owner_name: string | null;
  cloudinary_main_url: string | null;
  heroglyph_code: string | null;
  patron_svg: string | null;
  patron_svg2: string | null;
  selections: Record<string, string> | null;
  created_at: string;
  pack_number?: number | null;
}

const MM = 3.779528; // px per mm at 96dpi

// A4 page geometry per artifact, mirroring pdfService.ts:
//   cert        → portrait,  no margin
//   vertical    → portrait,  25mm margin, FRAME_BG
//   horizontal  → landscape, 20mm margin, FRAME_BG
// natW/natH = the fixed natural pixel size of the artifact we render, so the
// fit scale is computed deterministically (no DOM measurement / timing race in
// the headless browser).
const PAGE: Record<
  ArtifactType,
  { wMm: number; hMm: number; padMm: number; bg: string; natW: number; natH: number }
> = {
  cert: { wMm: 210, hMm: 297, padMm: 0, bg: '#efe2c5', natW: 1080, natH: 1527 },
  vertical: { wMm: 210, hMm: 297, padMm: 25, bg: FRAME_BG, natW: 800, natH: 1131 },
  horizontal: { wMm: 297, hMm: 210, padMm: 20, bg: FRAME_BG, natW: 1200, natH: 321 },
};

function fitScale(g: (typeof PAGE)[ArtifactType]): number {
  const innerW = (g.wMm - g.padMm * 2) * MM;
  const innerH = (g.hMm - g.padMm * 2) * MM;
  return Math.min(innerW / g.natW, innerH / g.natH);
}

export default function CertRender() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const type = (params.get('type') || 'cert') as ArtifactType;
  const key = params.get('key') || '';

  const [dog, setDog] = useState<RenderDog | null>(null);
  const [error, setError] = useState<string>('');

  // Fetch the dog via the key-gated render-data edge fn (no auth session here).
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) {
        setError('missing id');
        return;
      }
      try {
        const r = await fetch(
          `${EDGE_BASE}/get-render-data?id=${encodeURIComponent(id)}&key=${encodeURIComponent(key)}`,
          { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY } },
        );
        if (!r.ok) {
          setError(`fetch ${r.status}`);
          return;
        }
        const data = (await r.json()) as RenderDog;
        if (alive) setDog(data);
      } catch (e) {
        if (alive) setError((e as Error).message);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, key]);

  // Rehydrate the store so HeroglyphFrame / VerticalHeroglyphFrame (which read
  // selections/ownerName/patronSvg from the store, not props) draw THIS dog.
  // Mirrors WelcomeScreen + PackDogDetail rehydration.
  useEffect(() => {
    if (!dog) return;
    const s = useDogyptStore.getState();
    if (dog.dog_name) s.setDogName(dog.dog_name);
    if (dog.owner_name) s.setOwnerName(dog.owner_name);
    if (dog.cloudinary_main_url) s.setDogPhotoUrl(dog.cloudinary_main_url);
    if (dog.patron_svg) s.setPatronSvg(dog.patron_svg);
    if (dog.patron_svg2) s.setPatronSvg2(dog.patron_svg2);
    if (dog.selections) {
      Object.entries(dog.selections).forEach(([k, v]) => {
        if (typeof v === 'string') s.setSelection(k, v);
      });
    }
  }, [dog]);

  // Signal "ready to print" once data is loaded, store rehydrated, and all
  // images decoded. Cloudflare waits for [data-render-ready="1"].
  useEffect(() => {
    if (!dog) return;
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
        // <img> elements
        const imgs = Array.from(document.querySelectorAll('img'));
        const imgWaits = imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((res) => {
                img.addEventListener('load', () => res(), { once: true });
                img.addEventListener('error', () => res(), { once: true });
              }),
        );
        // SVG <image href> elements (heroglyph symbols) — these are NOT <img>,
        // so preload each href to guarantee it's decoded before we signal ready.
        const svgImages = Array.from(document.querySelectorAll('image'));
        const svgWaits = svgImages.map((el) =>
          preload(el.getAttribute('href') || el.getAttribute('xlink:href') || ''),
        );
        // Web fonts (Cinzel) too.
        const fontWait = (document as Document & { fonts?: { ready?: Promise<unknown> } })
          .fonts?.ready ?? Promise.resolve();
        await Promise.all([...imgWaits, ...svgWaits, fontWait]);
      } catch {
        /* ignore */
      }
      // settle: paint the decoded SVG symbols + fonts before capture
      await new Promise((res) => setTimeout(res, 800));
      if (!cancelled) document.documentElement.setAttribute('data-render-ready', '1');
    };
    markReady();
    return () => {
      cancelled = true;
    };
  }, [dog]);

  if (error) {
    return <div data-render-error={error} style={{ padding: 20 }}>render error: {error}</div>;
  }
  if (!dog) {
    return <div style={{ padding: 20 }}>loading…</div>;
  }

  const dogName = dog.dog_name || 'Unnamed';
  const ownerName = dog.owner_name || '';
  const heroglyphCode =
    dog.heroglyph_code ||
    buildHeroglyphCode({
      dogName,
      ownerName,
      patronSvg: dog.patron_svg || undefined,
      breed: dog.selections?.breed,
      patronCategory: dog.selections?.patronCategory,
      country: dog.selections?.country || dog.selections?.ownerCountry,
      selections: dog.selections || undefined,
    });
  // Cert # = plain number, NO leading zeros (Matej lock 2026-06-07): "# 1" not "#00001".
  const certNumber = dog.pack_number
    ? `#${dog.pack_number}`
    : `#${dog.id.slice(0, 8).toUpperCase()}`;
  const issuedDate = (() => {
    try {
      return new Date(dog.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  })();

  const geom = PAGE[type] || PAGE.cert;
  const scale = fitScale(geom);

  let artifact: JSX.Element;
  if (type === 'vertical') {
    artifact = (
      <div style={{ width: 800, height: 1131, background: 'transparent', color: '#000' }}>
        <VerticalHeroglyphFrame />
      </div>
    );
  } else if (type === 'horizontal') {
    artifact = (
      <div style={{ width: 1200, height: 321, background: 'transparent', color: '#000' }}>
        <HeroglyphFrame showOwner />
      </div>
    );
  } else {
    artifact = (
      <CertificateCard
        dogName={dogName}
        ownerName={ownerName}
        photoUrl={dog.cloudinary_main_url || undefined}
        heroglyphCode={heroglyphCode}
        certNumber={certNumber}
        issuedDate={issuedDate}
      />
    );
  }

  return (
    <>
      <style>{`
        @page { size: ${type === 'horizontal' ? 'A4 landscape' : 'A4 portrait'}; margin: 0; }
        html, body, #root { margin: 0; padding: 0; height: 100%; background: ${geom.bg}; }
        #cert-render-page { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>
      <div
        id="cert-render-page"
        style={{
          width: '100vw',
          height: '100vh',
          padding: `${geom.padMm}mm`,
          background: geom.bg,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', flex: '0 0 auto' }}>
          {artifact}
        </div>
      </div>
    </>
  );
}
