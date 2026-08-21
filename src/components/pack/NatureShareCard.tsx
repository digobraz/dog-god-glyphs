// SHARE KARTA VÝSLEDKU OSOBNOSTNÉHO KVÍZU — 1080×1080, čistý render target.
// Zadanie: plany/zadanie-nature-kviz-dokoncenie-2026-08-06.md §4.2.
//
// ODVODENÁ, NIE VYMYSLENÁ. Formát share karty je LOCKED (Matejom schválený mock,
// `components/ShareCard.tsx`): čierna, fotka hore s prechodom, zlatý inset rám,
// meno psa v Cinzel Decorative s auto-fitom na 880 px, pätička „dogypt.com ·
// In Dogs We Trust". Tá istá DNA — mení sa len to, čo stojí pod menom: namiesto
// heroglyfu výsledok kvízu.
//
// ČO SA TU NESMIE ROZBIŤ:
//  1. Meno psa = **Cinzel Decorative** (brand lock 2026-07-26). Cinzel alebo
//     Space Grotesk na mene psa je bug, nie štýl.
//  2. Titul sa NEZLUČUJE — `THE DEFENDER` a `METAL` sú dve osi oddelené zlatou
//     lomkou. Nie „The Defender of Metal".
//  3. Zvláštna úloha vždy s prefixom „SPECIAL ROLE", nikdy ako holý chip —
//     inak sa `The Loner` zrazí s tagom povahy „Samotár".
//  4. Attribution (WDDC + TČM) je POVINNÁ všade, kde sa úlohy zobrazujú. Na
//     karte je v skrátenej podobe — plné znenie nesie obrazovka výsledku.
//  5. Share/cert povrchy sú VÝNIMKA z locku na bledý papyrusový blok — renderujú
//     sa do obrázka a majú vlastný (tmavý) dizajn.
//
// Text je zámerne EN a NEPREKLADÁ SA: karta ide do sveta, nie do appky — rovnako
// ako pätička v `ShareCard.tsx`. Mená úloh a elementov sú brand pojmy.
import { useLayoutEffect, useRef, useState } from 'react';

const GOLD = '#C99A3F';
const CREAM = '#F7EFDD';
const NAME_FONT_FAMILY = "'Cinzel Decorative', serif";

// Auto-fit mena — rovnaká mechanika ako v locknutej karte: zmeriame skrytý span
// pri maximálnej veľkosti a zoškálujeme tak, aby šírka sadla na TARGET_WIDTH.
// Bez toho krátke meno (THOR) vyzerá stratene a dlhé pretečie z karty.
const BASE_FONT_SIZE = 104;
const MIN_FONT_SIZE = 38;
const MAX_FONT_SIZE = 104;
const TARGET_WIDTH = 860;

export interface NatureShareCardProps {
  dogName: string;
  photoUrl: string;
  packNumber: number | null;
  /** Už preložené labely — komponenta nesmie poznať i18n ani dataset. */
  roleLabel: string;
  elementLabel: string;
  specialLabels: string[];
}

export function NatureShareCard({
  dogName, photoUrl, packNumber, roleLabel, elementLabel, specialLabels,
}: NatureShareCardProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const upperName = dogName.toUpperCase();

  useLayoutEffect(() => {
    let cancelled = false;
    const fit = () => {
      if (cancelled) return;
      const el = measureRef.current;
      if (!el) return;
      const w = el.getBoundingClientRect().width;
      if (w <= 0) return;
      setFontSize(Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, (BASE_FONT_SIZE * TARGET_WIDTH) / w)));
    };
    // Dvakrát: raz hneď a raz po `fonts.ready` — reálne metriky Cinzel Decorative
    // vedia meranie posunúť, najmä pri CJK/cyrilike.
    fit();
    (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready?.then(fit);
    return () => { cancelled = true; };
  }, [upperName]);

  return (
    <div
      id="nature-share-card-root"
      data-testid="nature-share-card-root"
      translate="no"
      className="notranslate"
      style={{
        position: 'relative', width: 1080, height: 1080, background: '#000',
        overflow: 'hidden', fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* skrytý merací span — presne tie isté nastavenia písma ako viditeľné meno */}
      <span
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute', top: -9999, left: -9999, visibility: 'hidden',
          whiteSpace: 'nowrap', fontFamily: NAME_FONT_FAMILY, fontWeight: 700,
          fontSize: BASE_FONT_SIZE, letterSpacing: '0.02em', textTransform: 'uppercase',
        }}
      >
        {upperName}
      </span>

      {/* fotka — nižšia než na locknutej karte (62 % vs. 72 %), lebo výsledok je
          text na dva riadky, nie jeden obrázok heroglyfu */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '62%',
          backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: '50% 30%',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 46%, rgba(0,0,0,0.78) 78%, #000 100%)',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '26%', zIndex: 2,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 42%, rgba(0,0,0,0) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 4,
          boxShadow: 'inset 0 0 0 2px rgba(201,154,63,0.35), inset 0 0 120px 30px rgba(0,0,0,0.55)',
        }}
      />

      {/* hore — poradové číslo drží viralnú mechaniku svorky, ale je decentné:
          hviezdou tejto karty je výsledok, nie počítadlo */}
      <div
        style={{
          position: 'absolute', top: 54, left: 0, right: 0, zIndex: 3,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 24,
            letterSpacing: '0.26em', textTransform: 'uppercase', color: GOLD,
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          {packNumber !== null ? `№ ${packNumber} of 1,000,000 dogs` : 'In Dogs We Trust'}
        </span>
      </div>

      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 60px 54px',
          zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
      >
        <div
          style={{
            fontFamily: NAME_FONT_FAMILY, fontWeight: 700, fontSize: fontSize ?? BASE_FONT_SIZE,
            lineHeight: 1, letterSpacing: '0.02em', textTransform: 'uppercase', color: CREAM,
            textShadow: '0 6px 30px rgba(0,0,0,0.75)', whiteSpace: 'nowrap',
          }}
        >
          {upperName}
        </div>

        <div
          style={{
            width: 120, height: 2, margin: '22px 0 24px',
            background: 'linear-gradient(90deg, transparent, rgba(201,154,63,0.8), transparent)',
          }}
        />

        {/* miesto pre glyf úlohy a elementu — 14 glyfov sa ešte nevyrobilo */}

        {/* DVE OSI, ZLATÁ LOMKA. Nezlučovať do jednej frázy. */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap',
            gap: 22, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 60,
            lineHeight: 1.1, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: CREAM, textAlign: 'center', textShadow: '0 6px 26px rgba(0,0,0,0.7)',
          }}
        >
          <span>{roleLabel}</span>
          <span aria-hidden style={{ color: GOLD, fontWeight: 400 }}>/</span>
          <span>{elementLabel}</span>
        </div>

        {/* zvláštna úloha — VŽDY s prefixom, nikdy ako holý názov */}
        {specialLabels.length > 0 && (
          <div
            style={{
              marginTop: 20, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 24,
              letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, textAlign: 'center',
            }}
          >
            {specialLabels.length === 1 ? 'Special role' : 'Special roles'} · {specialLabels.join(' · ')}
          </div>
        )}

        {/* attribution — povinná. Skrátená, plné znenie nesie obrazovka výsledku. */}
        <div
          style={{
            marginTop: 30, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400,
            fontSize: 17, lineHeight: 1.5, letterSpacing: '0.02em',
            color: 'rgba(247,239,221,0.5)', textAlign: 'center', maxWidth: 820,
          }}
        >
          Pack roles build on research by the Wolf and Dog Development Centre.
          Elements draw on Traditional Chinese Medicine.
        </div>

        <div
          style={{
            marginTop: 26, display: 'flex', alignItems: 'center', gap: 20,
            fontFamily: "'Cinzel', serif", fontSize: 22, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(247,239,221,0.62)',
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
