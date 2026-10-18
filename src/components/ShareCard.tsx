import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { countryISO2, flagUrl } from '@/lib/countryGeo';

// Share card — 1080×1080 social share image.
//
// 🆕 BLEDÁ OD 3. 10. 2026 (Matej nad hárkom `plany/nakres-stranka-psa-2026-10-03/
// kolo2.html`: *„super daj bledú"*). Fotka cez celý štvorec, dole prechod do
// slonoviny a v ňom meno · čierny heroglyf · lapisové #číslo + DOGYPT.COM.
// Číslo je DOLE (Matej: *„najlepšie v dolnej časti obrázka"*), nie hore ako
// v tmavej verzii; riadok „of 1,000,000 dogs" a motto zanikli.
// ⚠️ Starí psi majú v `dogs.share_card_url` ešte TMAVÉ PNG — nová karta sa
//    upečie len novým členom (platba) alebo prebehom `wall-healer` na LIVE.
//    Stránka psa preto kartu kreslí NAŽIVO z tohto komponentu.
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
  /** Krajina psa (ISO3/ISO2/názov) — kruh s vlajkou v pravom hornom rohu (A3, 18. 10. 2026). */
  country?: string | null;
  // Fires once the gold-recolored heroglyph data URI is ready and painted.
  // ShareRender.tsx waits on this before signaling data-render-ready.
  onHeroglyphReady?: () => void;
}

const IVORY = '#FBF0D8';
const INK = '#1a1a1a';
const BROWN = '#6E4E18';

// Auto-fit: name width must land ~880px (== heroglyph display width) so the
// two elements visually align. We measure at BASE_FONT_SIZE (the max) via a
// hidden off-screen span using the EXACT font/letter-spacing/transform of the
// real .name element, then scale so the rendered width hits TARGET_WIDTH,
// clamped so short names (THOR) never blow past MAX and long/CJK names never
// shrink past MIN.
const BASE_FONT_SIZE = 108;
const MIN_FONT_SIZE = 40;
const MAX_FONT_SIZE = 108;
const TARGET_WIDTH = 800;

const NAME_FONT_FAMILY = "'Cinzel Decorative', serif";

export function ShareCard({ packNumber, dogName, photoUrl, heroglyphUrl, country, onHeroglyphReady }: ShareCardProps) {
  const iso2 = countryISO2(country) || '';
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const [glyphUri, setGlyphUri] = useState<string | null>(null);

  const upperName = dogName.toUpperCase();

  // Heroglyph sa prefarbí na čistý atrament cez canvas (source-in) a upečie do
  // data: URI PNG — zdroj nemusí byť čierny a html-to-image's
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
        ctx.fillStyle = INK;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        if (cancelled) return;
        setGlyphUri(dataUri);
        onHeroglyphReady?.();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('ShareCard: heroglyph recolor failed', e);
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
        background: IVORY,
        overflow: 'hidden',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Hidden measuring span — same font settings as the visible name below,
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

      {/* Fotka cez celý štvorec. Pes bez fotky (od 28. 8. 2026 sa dá preskočiť)
          dostane bledý zlatý prechod s iniciálou — prázdna plocha by kartu rozbila. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: photoUrl
            ? `url(${photoUrl})`
            : 'linear-gradient(135deg, #F2DFAF, #C99A3F)',
          backgroundSize: 'cover',
          backgroundPosition: '50% 30%',
          display: photoUrl ? undefined : 'flex',
          alignItems: photoUrl ? undefined : 'flex-start',
          justifyContent: photoUrl ? undefined : 'center',
          paddingTop: photoUrl ? undefined : 140,
        }}
      >
        {!photoUrl && (
          <span style={{ font: `700 220px/1 'Cinzel', serif`, color: 'rgba(255,250,236,0.95)', letterSpacing: '.04em' }}>
            {upperName.charAt(0)}
          </span>
        )}
      </div>

      {/* Prechod do slonoviny — 18. 10. 2026 (A3) Matej: *„pod JENNY v obrázku nemôže byť vidno
          prechod gradientu"*. Dlhší a mäkší (viac zastávok), aby nebolo vidno, kde fotka končí. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '72%',
          background: `linear-gradient(180deg, rgba(251,240,216,0) 0%, rgba(251,240,216,0.18) 18%, rgba(251,240,216,0.5) 36%, rgba(251,240,216,0.82) 54%, rgba(251,240,216,0.96) 68%, ${IVORY} 80%)`,
        }}
      />

      {/* Vlajka krajiny — kruh vpravo hore, tvar ako .card-flag na stene (A3). Neznáma krajina = žiadna. */}
      {iso2 && (
        <img
          src={flagUrl(iso2, 160)}
          alt=""
          style={{ position: 'absolute', top: 48, right: 48, width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(0,0,0,0.45)', zIndex: 5 }}
        />
      )}

      {/* Zlatý lem — konštrukcia, nie ozdoba (zlato = rám). */}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 4px rgba(201,154,63,0.85)', zIndex: 4 }} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '0 64px 48px',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            fontFamily: NAME_FONT_FAMILY,
            fontWeight: 700,
            fontSize: nameFontSize,
            lineHeight: 1,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: INK,
            whiteSpace: 'nowrap',
          }}
        >
          {upperName}
        </div>

        {/* Heroglyf — atramentový data: URI (prefarbený vyššie). Kým nie je
            hotový, nekreslí sa nič. */}
        {glyphUri && (
          <img src={glyphUri} alt={upperName} style={{ width: 800, height: 'auto' }} />
        )}

        {/* Číslo + web — A3 (18. 10. 2026): len text, bez pilulky, „N / 1 000 000 │ DOGYPT.COM",
            najviac na šírku heroglyfu (800). Pilulka #N je už len na stránke pri mene. */}
        <div style={{ maxWidth: 800, display: 'flex', alignItems: 'center', gap: 28, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 30, letterSpacing: '0.14em', color: BROWN, whiteSpace: 'nowrap' }}>
          <span>{packNumber} / 1 000 000</span>
          <span aria-hidden="true" style={{ width: 2, height: 32, background: 'rgba(110,78,24,0.45)' }} />
          <span>DOGYPT.COM</span>
        </div>
      </div>
    </div>
  );
}
