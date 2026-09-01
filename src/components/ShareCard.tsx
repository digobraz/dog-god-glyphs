import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Share card — 1080×1080 social share image. Recreates the Matej-approved
// locked mock (scratchpad/share-card-thor.html) 1:1 in React. LOCKED format —
// do not redesign; brand v3.2 exact (Cinzel / Cinzel Decorative gold+cream on
// black, .btn-gold-adjacent gold #C99A3F).
//
// Rendered headlessly by ShareRender.tsx (Playwright batch) and can also be
// captured client-side via html-to-image (same toPng approach as
// uploadHeroglyphPng in usePostPaymentPipeline.ts) — this component itself
// has no capture logic, it's a pure presentational render target.

export interface ShareCardProps {
  packNumber: number;
  dogName: string;
  photoUrl: string;
  heroglyphUrl: string;
  // Fires once the gold-recolored heroglyph data URI is ready and painted.
  // ShareRender.tsx waits on this before signaling data-render-ready.
  onHeroglyphReady?: () => void;
}

const GOLD = '#C99A3F';
const CREAM = '#F7EFDD';

// Approved variant C gold gradient (Matej-approved) for the heroglyph recolor.
const HEROGLYPH_GRADIENT_STOPS: [number, string][] = [
  [0, '#F5C73D'],
  [0.6, '#C99A3F'],
  [1, '#A87A2A'],
];

// Auto-fit: name width must land ~880px (== heroglyph display width) so the
// two elements visually align. We measure at BASE_FONT_SIZE (the max) via a
// hidden off-screen span using the EXACT font/letter-spacing/transform of the
// real .name element, then scale so the rendered width hits TARGET_WIDTH,
// clamped so short names (THOR) never blow past MAX and long/CJK names never
// shrink past MIN.
const BASE_FONT_SIZE = 116;
const MIN_FONT_SIZE = 40;
const MAX_FONT_SIZE = 116;
const TARGET_WIDTH = 880;

const NAME_FONT_FAMILY = "'Cinzel Decorative', serif";

export function ShareCard({ packNumber, dogName, photoUrl, heroglyphUrl, onHeroglyphReady }: ShareCardProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const [goldHeroglyphUri, setGoldHeroglyphUri] = useState<string | null>(null);

  const upperName = dogName.toUpperCase();

  // Heroglyph asset is BLACK strokes on transparent bg — invisible on the
  // black card. Recolor to gold via canvas (source-in + vertical gradient)
  // and bake it into a self-contained data: URI PNG, so html-to-image's
  // toPng capture (post-payment pipeline) doesn't need to inline an external
  // mask/filter URL (it wouldn't — external CSS mask-image/color-filter URLs
  // vanish in the toPng output). A plain <img src="data:..."> always survives.
  useEffect(() => {
    let cancelled = false;

    async function recolor() {
      try {
        const res = await fetch(heroglyphUrl, { mode: 'cors' });
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('no 2d context');
        ctx.drawImage(bitmap, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        HEROGLYPH_GRADIENT_STOPS.forEach(([offset, color]) => gradient.addColorStop(offset, color));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        if (cancelled) return;
        setGoldHeroglyphUri(dataUri);
        onHeroglyphReady?.();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('ShareCard: heroglyph gold recolor failed', e);
        // Still signal "ready" so a headless capture doesn't hang forever —
        // the card renders without the heroglyph in this fallback case.
        if (!cancelled) onHeroglyphReady?.();
      }
    }

    recolor();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroglyphUrl]);

  useLayoutEffect(() => {
    let cancelled = false;

    const fit = () => {
      if (cancelled) return;
      const el = measureRef.current;
      if (!el) return;
      const measuredWidth = el.getBoundingClientRect().width;
      if (measuredWidth <= 0) return;
      const scaled = (BASE_FONT_SIZE * TARGET_WIDTH) / measuredWidth;
      const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, scaled));
      setFontSize(clamped);
    };

    // Run once immediately (fonts may already be cached/loaded), then again
    // once document.fonts.ready resolves — real font metrics can shift the
    // measurement (critical for Cinzel Decorative, esp. CJK/Cyrillic names).
    fit();
    const fontsReady = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;
    if (fontsReady) {
      fontsReady.then(fit);
    }

    return () => {
      cancelled = true;
    };
  }, [upperName]);

  const nameFontSize = fontSize ?? BASE_FONT_SIZE;

  return (
    <div
      id="share-card-root"
      data-testid="share-card-root"
      translate="no"
      className="notranslate"
      style={{
        position: 'relative',
        width: 1080,
        height: 1080,
        background: '#000',
        overflow: 'hidden',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Hidden measuring span — same font settings as the visible .name below,
          rendered at BASE_FONT_SIZE so we can compute the auto-fit scale. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontFamily: NAME_FONT_FAMILY,
          fontWeight: 700,
          fontSize: BASE_FONT_SIZE,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        {upperName}
      </span>

      {/* .photo — hero photo, top 72%, with the mock's ::after gradient
          reproduced as a nested overlay div (inline styles can't do pseudo-els). */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 'auto',
          height: '72%',
          // Pes bez fotky — od 28. 8. 2026 sa dá fotka pri vstupe preskočiť.
          // Prázdna plocha by kartu rozbila, tak drží miesto zlatý prechod
          // s iniciálou; rovnaký fallback ako na certifikáte a na stene.
          backgroundImage: photoUrl
            ? `url(${photoUrl})`
            : 'linear-gradient(135deg, #d4a94a, #8a5c10)',
          backgroundSize: 'cover',
          backgroundPosition: '50% 30%',
          display: photoUrl ? undefined : 'flex',
          alignItems: photoUrl ? undefined : 'center',
          justifyContent: photoUrl ? undefined : 'center',
        }}
      >
        {!photoUrl && (
          <span
            style={{
              font: `700 220px/1 'Cinzel', serif`,
              color: 'rgba(250,244,236,0.92)',
              letterSpacing: '.04em',
            }}
          >
            {upperName.charAt(0)}
          </span>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.75) 80%, #000 100%)',
          }}
        />
      </div>

      {/* .topfade */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '28%',
          zIndex: 2,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 42%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* .frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 0 2px rgba(201,154,63,0.35), inset 0 0 120px 30px rgba(0,0,0,0.55)',
          zIndex: 4,
        }}
      />

      {/* .counter */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 900,
            fontSize: 74,
            color: CREAM,
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          {packNumber}
        </span>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: GOLD,
            marginTop: 8,
          }}
        >
          of 1,000,000 dogs
        </span>
      </div>

      {/* .content */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '0 60px 60px',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* .name — auto-fit font size */}
        <div
          style={{
            fontFamily: NAME_FONT_FAMILY,
            fontWeight: 700,
            fontSize: nameFontSize,
            lineHeight: 1,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: CREAM,
            textShadow: '0 6px 30px rgba(0,0,0,0.75)',
            whiteSpace: 'nowrap',
          }}
        >
          {upperName}
        </div>

        {/* .divider */}
        <div
          style={{
            width: 120,
            height: 2,
            margin: '20px 0 22px',
            background: 'linear-gradient(90deg, transparent, rgba(201,154,63,0.8), transparent)',
          }}
        />

        {/* .heroglyph — gold data: URI (recolored via canvas above), not the
            raw black-on-transparent source. Nothing rendered until the recolor
            resolves, so the card doesn't briefly show the invisible black glyph. */}
        {goldHeroglyphUri && (
          <img
            src={goldHeroglyphUri}
            alt={upperName}
            style={{
              width: 880,
              height: 'auto',
              filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.6))',
            }}
          />
        )}

        {/* .footer — brand constants, EN hardcoded, do not translate */}
        <div
          style={{
            marginTop: 34,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            fontFamily: "'Cinzel', serif",
            fontSize: 24,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(247,239,221,0.62)',
          }}
        >
          <span style={{ color: GOLD, fontWeight: 700 }}>dogypt.com</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />
          <span>In Dogs We Trust</span>
        </div>
      </div>
    </div>
  );
}
