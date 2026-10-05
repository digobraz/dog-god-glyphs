// ════════════════════════════════════════════════════════════════════════════
// HEKTOROVA KNIHA — celostránkový mini príbeh po kliku na Hektora pri motte
// ────────────────────────────────────────────────────────────────────────────
// Matej 3. 10. 2026: *„keď sa klikne na psa, tiež bude popup na celú stránku…
// mini príbeh z rozprávky, veľké dekoratív cinzel písmeno… dvojstránka
// rozprávkovej knižky s fotkami (karusel)"*. Variant B z nákresu
// `plany/nakres-hektor-pribeh-2026-10-03/` (kniha.html = zdroj pravdy dizajnu,
// scenes.json = texty a poradie obrázkov, ktoré Matej odsúhlasil).
//
// 🔑 PÍSMO DOGYPTIAN je VÝNIMKA z brandu, len pre túto knihu (Matej 3. 10.:
//    *„nadpisy veľkým a text malým písmom Dogyptian, aby to malo efekt knihy"*).
//    Iniciála ostáva Cinzel Decorative. Zapísané v `plany/locky/brand.md`.
//
// 🔑 PC = dvojstrana: vľavo iniciála + text, vpravo JEDEN obrázok 3:4 na celú
//    stranu (klik = ďalší). MOBIL = vodorovný pás: karta s textom a z pravého
//    okraja vykukuje obrázok (Matejov nákres). Rozhoduje šírka KNIHY (cqw),
//    nie okno — rovnaké pravidlo ako pri plynulom písme v /pack.
//
// ⚠️ ZAVRETIE BEZ KRÍŽIKA (Matej 28. 9.: *„na webe nechceme krížiky"*):
//    klik mimo knihy · pilulka SPÄŤ · Esc.
// ⚠️ FILM STOJÍ, kým je kniha otvorená: motor (`filmStops`) sa pozastaví pri
//    `body.style.overflow === 'hidden'` — preto ho tu nastavujeme a vraciame.
// ════════════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { NAV_R, NAV_GOLD, NAV_PILL_SHADOW } from '@/components/pack/navGoldSkin';
import symDog from '@/assets/chinese/CHINESE_SIGN-DOG.svg';
import symLover from '@/assets/character/CHARACTER-LOVER.svg';
import symPlayer from '@/assets/character/CHARACTER-PLAYER.svg';
import symGuardian from '@/assets/character/CHARACTER-GUARDIAN.svg';
import symGourmet from '@/assets/character/CHARACTER-GOURMET.svg';
import symWater from '@/assets/character/CHARACTER-WATERLOVER.svg';
import symChiller from '@/assets/character/CHARACTER-CHILLER.svg';

const IMG = '/images/hektor-kniha';

/** Kapitoly. Prvý obrázok je vždy KRESBA, za ňou fotky (Matej: *„úvodná bude kresba"*).
 *  n: 0 = TITULNÁ dvojstrana (Matej 4. 10.: *„lavá strana Once upon a time, na
 *  druhej hektorov heroglyf v strede a ako keby zrkadlo — vidí tam seba v odraze
 *  malinkého smutného z čias, kedy bol vyhodený"*). Kolo 2 (4. 10.): stojace
 *  zrkadlo vpravo, HEROGLYF pod nadpisom na ľavej strane, nadpisy Cinzel
 *  Decorative, Hektor kreslený podľa fotiek (krátka srsť, čierno-hnedý). */
const CHAPTERS = [
  { n: 0, media: ['k0-zrkadlo'] },
  // 5. 10. 2026 — fotky a ich poradie prenesené zo `scenes.json` (Matej: *„obsah — done“*).
  { n: 1, media: ['k1-kresba', 'k1-f1', 'k1-f2'] },
  { n: 2, media: ['k2-kresba', 'k2-f1', 'k2-f2', 'k2-f3', 'k2-f4', 'k2-f5', 'k2-f6', 'k2-f7', 'k2-f8'] },
  { n: 3, media: ['k3-kresba', 'k3-f1', 'k3-f2', 'k3-f3', 'k3-f4'] },
  { n: 4, media: ['k4-kresba', 'k4-f1', 'k4-f2', 'k4-f3', 'k4-f4', 'k4-f5', 'k4-f6', 'k4-f7', 'k4-f8', 'k4-f9', 'k4-f10', 'k4-f11', 'k4-f12'] },
  // 5. 10. 2026 — Matej: „pridal by som ešte jeden list o Hektorovi, niečo osobné… obrázok s kocúrmi po boku“
  { n: 5, media: ['k5-kresba', 'k5-f1', 'k5-f2', 'k5-f3', 'k5-f4', 'k5-f5'] },
] as const;

/** Ornamentový pás dole = symboly heroglyfu, nie cudzí ornament. */
const BAND = [symDog, symLover, symPlayer, symGuardian, symGourmet, symWater, symChiller];

export const HEKTOR_BOOK_CSS = `
.hb-veil {
  position: fixed; inset: 0; z-index: 140;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 72px 16px 24px;
  background: rgba(14, 9, 3, 0.66);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  animation: hbIn 260ms ease;
}
@keyframes hbIn { from { opacity: 0; } to { opacity: 1; } }
.hb-back {
  position: fixed; top: 16px; right: 16px; z-index: 2;
  height: 42px; padding: 0 20px; border-radius: 999px;
  font: 500 12px/1 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase;
  background: ${NAV_GOLD.activeFill};
  border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
  box-shadow: ${NAV_PILL_SHADOW};
  color: ${NAV_GOLD.ink};
  cursor: pointer;
}
.hb-stage { width: min(1120px, 100%); container-type: inline-size; }
.hb-book {
  position: relative; display: grid; grid-template-columns: 1fr 1fr;
  height: min(640px, calc(100dvh - 160px));
  border-radius: 6px; overflow: hidden; background: #F1E2BF;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}
.hb-book::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 3;
  background: radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(120, 80, 30, 0.28) 100%);
}
.hb-book::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 70px; transform: translateX(-50%);
  pointer-events: none; z-index: 2;
  background: linear-gradient(90deg, transparent, rgba(90, 55, 15, 0.2) 46%, rgba(60, 35, 8, 0.36) 50%, rgba(90, 55, 15, 0.2) 54%, transparent);
}
.hb-book {
  background:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9 .06' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 .45 0 0 0 0 .3 0 0 0 0 .12 0 0 0 .09 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>"),
    radial-gradient(90% 70% at 50% 40%, #F6E9CA, #EAD5A8);
}
.hb-page { position: relative; display: flex; flex-direction: column; min-height: 0; overflow: hidden; padding: 40px 48px 84px; }
.hb-page::before {
  content: ''; position: absolute; inset: 14px 14px 70px; pointer-events: none; border-radius: 3px;
  box-shadow: inset 0 0 0 1.5px #C99A3F, inset 0 0 0 5px transparent, inset 0 0 0 6px rgba(22, 48, 122, 0.55);
}
.hb-page.m::before { display: none; }
.hb-corner { position: absolute; width: 26px; height: 26px; pointer-events: none; z-index: 1; }
.hb-corner::before {
  content: ''; position: absolute; inset: 0; transform: rotate(45deg) scale(.5);
  background: #A8432A; box-shadow: 0 0 0 3px #F1E2BF, 0 0 0 5px #C99A3F;
}
.hb-corner.tl { top: 2px; left: 2px; } .hb-corner.tr { top: 2px; right: 2px; }
.hb-corner.bl { bottom: 58px; left: 2px; } .hb-corner.br { bottom: 58px; right: 2px; }
.hb-page.t { overflow-y: auto; }
.hb-page.m { padding: 22px; align-items: center; justify-content: center; }
.hb-ini {
  float: left; width: 104px; height: 112px; margin: 2px 14px 4px 0; border-radius: 4px;
  display: grid; place-items: center; padding-top: 6px;
  background:
    radial-gradient(circle at 20% 20%, #C9892F 0 4px, transparent 5px) 0 0 / 18px 18px,
    linear-gradient(135deg, #A8432A, #7E2E1C);
  box-shadow: inset 0 0 0 4px #C99A3F, inset 0 0 0 7px #16307A, inset 0 0 0 9px #C99A3F;
  font: 900 78px/1 'Cinzel Decorative', serif; color: #F6DE9C; text-shadow: 0 2px 0 #0A1A4A;
}
.hb-lead {
  font: 700 28px/1.2 'Cinzel Decorative', 'Cinzel', serif; letter-spacing: .01em;
  color: #16307A; margin: 0 0 4px;
}
.hb-lead::after {
  content: ''; display: block; width: 160px; height: 14px; margin: 10px 0 12px;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='14'><path d='M4 7l5-5 5 5-5 5z' fill='%23C99A3F'/><circle cx='22' cy='7' r='3' fill='%23A8432A'/><path d='M30 7l5-5 5 5-5 5z' fill='%2316307A'/></svg>") left / 40px 14px repeat-x;
}
.hb-txt { font: 400 22px/1.45 'Dogyptian', 'Space Grotesk', sans-serif; color: rgba(42, 26, 12, 0.88); margin: 0; }
.hb-band {
  position: absolute; left: 24px; right: 24px; bottom: 18px; height: 40px; border-radius: 3px;
  display: flex; align-items: center; justify-content: space-around;
  background: linear-gradient(#16307A, #0A1A4A);
  box-shadow: inset 0 0 0 2px #C99A3F, inset 0 0 0 5px #A8432A, inset 0 0 0 7px #C99A3F;
}
.hb-band img { height: 20px; width: auto; filter: invert(.92) sepia(.6) saturate(2) hue-rotate(5deg); }
.hb-pic {
  position: relative; height: 100%; aspect-ratio: 3 / 4; max-width: 100%;
  cursor: pointer; border: 0; padding: 0; background: transparent;
  /* 5. 10. 2026: bez rámu a bez bieleho pozadia — Matej: „ľúbilo sa mi, že to bolo ako
     roztrhané… chcel som len odstrániť biele pozadie a dostať PNG“. Kresby majú priehľadný
     okraj (webp s alfou), tieň preto ide cez drop-shadow, aby kopíroval roztrhaný kraj. */
  filter: drop-shadow(0 10px 18px rgba(60, 35, 8, 0.35));
}
.hb-pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity .45s; }
.hb-pic img.on { opacity: 1; }
.hb-pdots { position: absolute; left: 0; right: 0; bottom: 48px; z-index: 2; display: flex; gap: 6px; justify-content: center; }
.hb-pdots i { width: 8px; height: 8px; border-radius: 999px; background: rgba(255, 248, 232, 0.55); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); }
.hb-pdots i.on { background: #FFF8E8; width: 22px; }
.hb-plate {
  position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); z-index: 2; white-space: nowrap;
  padding: 6px 14px; border-radius: 4px; background: #F1E2BF;
  box-shadow: 0 0 0 2px #C99A3F, 0 4px 10px rgba(0, 0, 0, 0.3);
  font: 700 16px/1 'Dogyptian', serif; color: #A8432A;
}
.hb-glyph {
  width: min(88%, 420px); margin-top: 28px; padding: 8px 10px; border-radius: 6px;
  background: linear-gradient(#16307A, #0A1A4A);
  box-shadow: inset 0 0 0 2px #C99A3F, inset 0 0 0 5px #A8432A, inset 0 0 0 7px #C99A3F, 0 10px 22px rgba(60, 35, 8, 0.3);
}
.hb-glyph img { display: block; width: 100%; height: auto; filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.5)); }
.hb-title { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-bottom: 24px; }
.hb-title p {
  font: 900 60px/1.08 'Cinzel Decorative', 'Cinzel', serif; letter-spacing: .01em;
  color: #16307A; margin: 0; text-shadow: 0 2px 0 rgba(201, 154, 63, 0.45);
}
.hb-title p::first-letter { color: #A8432A; font-size: 1.3em; }
.hb-title small {
  margin-top: 18px; font: 400 22px/1.3 'Dogyptian', serif; color: #A8432A; letter-spacing: .04em;
}
.hb-title::before, .hb-title::after {
  content: ''; flex-shrink: 0; width: 220px; height: 14px; margin: 22px 0;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='14'><path d='M4 7l5-5 5 5-5 5z' fill='%23C99A3F'/><circle cx='22' cy='7' r='3' fill='%23A8432A'/><path d='M30 7l5-5 5 5-5 5z' fill='%2316307A'/></svg>") center / 40px 14px repeat-x;
}
.hb-story { display: none; }
.hb-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; }
.hb-nav button {
  width: 48px; height: 48px; border-radius: 999px; display: grid; place-items: center; cursor: pointer;
  border: 1px solid rgba(201, 154, 63, 0.7); background: #F3E4C4;
}
.hb-nav button:disabled { opacity: .35; cursor: default; }
.hb-dots { display: flex; gap: 8px; }
.hb-dots i { width: 8px; height: 8px; border-radius: 999px; background: rgba(243, 228, 196, 0.45); }
.hb-dots i.on { background: #F3E4C4; width: 24px; }
/* ── MOBIL = PRÍBEH (Matej 5. 10. 2026: *„ten mobil sa mi nepáči… daj to ako príbeh"*,
   variant B z plany/nakres-hektor-pribeh-2026-10-03/mobil.html). Ako Instagram story:
   ťuk vpravo = ďalej, vľavo = späť, švih tiež. Kapitola = kresba s úvodnou vetou →
   celý text → fotky na celú obrazovku. Dvojstrana pod 753 px zaniká (= kniha 720 px). */
@media (max-width: 752px) {
  .hb-veil { padding: 0; }
  .hb-stage { display: none; }
  .hb-back { top: calc(12px + env(safe-area-inset-top)); height: 36px; padding: 0 16px; z-index: 3; }
  .hb-story {
    display: block; position: fixed; inset: 0; z-index: 1; overflow: hidden;
    background: #1D140B; user-select: none; -webkit-user-select: none; touch-action: pan-y;
  }
  .hb-seg {
    position: absolute; z-index: 2; left: 16px; right: 128px; top: calc(28px + env(safe-area-inset-top));
    display: flex; gap: 4px; pointer-events: none;
  }
  .hb-seg i { flex: 1; height: 3px; border-radius: 999px; background: rgba(243, 228, 196, 0.3); }
  .hb-seg i.on { background: #F3E4C4; }
  .hb-chl {
    position: absolute; z-index: 2; left: 16px; top: calc(40px + env(safe-area-inset-top)); pointer-events: none;
    font: 700 12px/1 'Cinzel', serif; letter-spacing: .2em; color: #F3E4C4;
  }
  .hb-story.is-light .hb-seg i { background: rgba(22, 48, 122, 0.2); }
  .hb-story.is-light .hb-seg i.on { background: #16307A; }
  .hb-story.is-light .hb-chl { color: #16307A; }
  .hb-fr { position: absolute; inset: 0; }
  .hb-fr.paper {
    padding: calc(72px + env(safe-area-inset-top)) 24px 32px; overflow-y: auto;
    background:
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9 .06' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 .45 0 0 0 0 .3 0 0 0 0 .12 0 0 0 .09 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>"),
      radial-gradient(90% 70% at 50% 40%, #F6E9CA, #EAD5A8);
  }
  .hb-fr.paper .hb-title { min-height: 100%; padding-bottom: 0; }
  .hb-fr.draw {
    display: flex; flex-direction: column; gap: 16px;
    padding: calc(64px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));
  }
  .hb-fr.draw > img {
    flex: 1; min-height: 0; width: 100%; object-fit: contain;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
  }
  .hb-strip {
    flex-shrink: 0; border-radius: 12px; padding: 16px; background: #F1E2BF;
    box-shadow: 0 0 0 2px #C99A3F, 0 10px 24px rgba(0, 0, 0, 0.4);
  }
  .hb-strip .hb-lead::after { display: none; }
  .hb-strip .hb-lead { margin: 0; }
  .hb-more {
    clear: both; display: block; margin-top: 12px;
    font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #A8432A;
  }
  .hb-strip .hb-plate, .hb-fr.paper .hb-plate { position: static; transform: none; display: inline-block; }
  .hb-fr.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hb-fr.photo .hb-plate { bottom: calc(24px + env(safe-area-inset-bottom)); }
  .hb-capr { text-align: center; margin: 24px 0 0; }
  .hb-fr.draw .hb-capr { margin: 0; }
  .hb-fr.draw .hb-plate { position: static; transform: none; display: inline-block; }
  .hb-ini { width: 64px; height: 70px; font-size: 48px; margin-right: 12px; }
  .hb-lead::after { margin: 8px 0 12px; }
  .hb-txt { font-size: 18px; }
  .hb-lead { font-size: 20px; }
  .hb-title p { font-size: 38px; }
  .hb-title small { font-size: 16px; }
  .hb-glyph { margin-top: 0; }
  .hb-title::before, .hb-title::after { width: 150px; margin: 16px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .hb-veil { animation: none; }
  .hb-pic img { transition: none; }
}
`;

function Arrow({ dir }: { dir: 'l' | 'r' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16307A" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d={dir === 'l' ? 'M15 5c-3 2.5-5 4.6-7 7 2 2.3 4 4.5 7 7' : 'M9 5c3 2.5 5 4.6 7 7-2 2.3-4 4.5-7 7'} />
    </svg>
  );
}

export default function HektorBook({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [ch, setCh] = useState(0);
  const [pic, setPic] = useState(0);
  /** Mobil: poloha v príbehu kapitoly (0 = kresba / titul, 1 = text, 2+ = fotky). */
  const [fr, setFr] = useState(0);
  const backRef = useRef<HTMLButtonElement | null>(null);
  const swipeX = useRef<number | null>(null);

  const go = useCallback((n: number) => {
    setCh(Math.max(0, Math.min(CHAPTERS.length - 1, n)));
    setPic(0);
    setFr(0);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    backRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') { e.preventDefault(); setCh((c) => Math.min(CHAPTERS.length - 1, c + 1)); setPic(0); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setCh((c) => Math.max(0, c - 1)); setPic(0); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const c = CHAPTERS[ch];
  const k = `onepage.hbook.${c.n}`;
  const cap = t(`${k}.cap`);
  const isTitle = c.n === 0;
  // Príbeh (mobil): titul = [titul, zrkadlo]; kapitola = [kresba + veta, text, …fotky].
  const frames = (i: number) => (CHAPTERS[i].n === 0 ? 2 : CHAPTERS[i].media.length + 1);
  const nFr = frames(ch);
  const step = (d: 1 | -1) => {
    if (d === 1) {
      if (fr < nFr - 1) setFr(fr + 1);
      else if (ch < CHAPTERS.length - 1) { setCh(ch + 1); setFr(0); }
    } else if (fr > 0) setFr(fr - 1);
    else if (ch > 0) { setCh(ch - 1); setFr(frames(ch - 1) - 1); }
  };
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const story = (() => {
    const head = (
      <span className="hb-ini" aria-hidden>{t(`${k}.ini`)}</span>
    );
    if (isTitle && fr === 0) {
      return (
        <div className="hb-fr paper">
          <div className="hb-title">
            <p>{t(`${k}.title`)}</p>
            <span className="hb-glyph"><img src="/images/hekthor-heroglyph.webp" alt={t(`${k}.glyph`)} /></span>
            <small>{t(`${k}.sub`)}</small>
          </div>
        </div>
      );
    }
    if (fr === 0 || isTitle) {
      return (
        <div className="hb-fr draw">
          <img src={`${IMG}/${c.media[0]}.webp`} alt={cap} />
          {isTitle ? <p className="hb-capr"><span className="hb-plate">{cap}</span></p> : (
            <div className="hb-strip">
              {head}
              <p className="hb-lead"><span className="sr-only">{t(`${k}.ini`)}</span>{t(`${k}.lead`)}</p>
              <span className="hb-more">{t('onepage.hbook.tap')}</span>
            </div>
          )}
        </div>
      );
    }
    if (fr === 1) {
      return (
        <div className="hb-fr paper">
          {head}
          <p className="hb-lead"><span className="sr-only">{t(`${k}.ini`)}</span>{t(`${k}.lead`)}</p>
          <p className="hb-txt">{t(`${k}.txt`)}</p>
          <p className="hb-capr"><span className="hb-plate">{cap}</span></p>
        </div>
      );
    }
    const m = c.media[fr - 1];
    return (
      <div className="hb-fr photo">
        <img src={`${IMG}/${m}.webp`} alt="" />
        <span className="hb-plate">{cap}</span>
      </div>
    );
  })();
  // Ďalší obrázok príbehu sa načíta vopred, aby ťuk neukázal prázdno.
  const nextSrc = !isTitle && fr >= 0 && fr < nFr - 1 && fr + 1 >= 2 ? `${IMG}/${c.media[fr]}.webp` : null;

  const corners = ['tl', 'tr', 'bl', 'br'].map((x) => <span key={x} className={`hb-corner ${x}`} aria-hidden />);
  const text = isTitle ? (
    <>
      {corners}
      <div className="hb-title">
        <p>{t(`${k}.title`)}</p>
        <span className="hb-glyph"><img src="/images/hekthor-heroglyph.webp" alt={t(`${k}.glyph`)} /></span>
        <small>{t(`${k}.sub`)}</small>
      </div>
      <div className="hb-band" aria-hidden>
        {BAND.map((s, i) => <img key={i} src={s} alt="" />)}
      </div>
    </>
  ) : (
    <>
      {corners}
      <div>
        <span className="hb-ini" aria-hidden>{t(`${k}.ini`)}</span>
        <p className="hb-lead"><span className="sr-only">{t(`${k}.ini`)}</span>{t(`${k}.lead`)}</p>
        <p className="hb-txt">{t(`${k}.txt`)}</p>
      </div>
      <div className="hb-band" aria-hidden>
        {BAND.map((s, i) => <img key={i} src={s} alt="" />)}
      </div>
    </>
  );

  return createPortal(
    <div
      className="hb-veil"
      role="dialog"
      aria-modal="true"
      aria-label={t('onepage.hbook.aria')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{HEKTOR_BOOK_CSS}</style>
      <button ref={backRef} type="button" className="hb-back" onClick={onClose} aria-label={t('nav.aria.close')}>
        {t('onepage.dogma.back')}
      </button>
      <div className="hb-stage">
        <div className="hb-book">
          <div className="hb-page t">{text}</div>
          <div className="hb-page m">
            <button
              type="button"
              className="hb-pic"
              onClick={() => setPic((p) => (p + 1) % c.media.length)}
              aria-label={t('onepage.hbook.nextPic')}
            >
              {c.media.map((m, j) => (
                <img key={m} src={`${IMG}/${m}.webp`} alt={j === 0 ? cap : ''} className={j === pic ? 'on' : ''} loading={j === 0 ? 'eager' : 'lazy'} />
              ))}
              {c.media.length > 1 && (
                <span className="hb-pdots" aria-hidden>
                  {c.media.map((m, j) => <i key={m} className={j === pic ? 'on' : ''} />)}
                </span>
              )}
              <span className="hb-plate">{cap}</span>
            </button>
          </div>
        </div>
        <div className="hb-nav">
          <button type="button" onClick={() => go(ch - 1)} disabled={ch === 0} aria-label={t('onepage.hbook.prev')}><Arrow dir="l" /></button>
          <span className="hb-dots" aria-hidden>
            {CHAPTERS.map((x, i) => <i key={x.n} className={i === ch ? 'on' : ''} />)}
          </span>
          <button type="button" onClick={() => go(ch + 1)} disabled={ch === CHAPTERS.length - 1} aria-label={t('onepage.hbook.next')}><Arrow dir="r" /></button>
        </div>
      </div>
      <div
        className={`hb-story${fr === 1 || (isTitle && fr === 0) ? ' is-light' : ''}`}
        onPointerDown={(e) => { swipeX.current = e.clientX; }}
        onPointerUp={(e) => {
          const x0 = swipeX.current; swipeX.current = null;
          if (x0 == null) return;
          const dx = e.clientX - x0;
          if (Math.abs(dx) > 40) { step(dx < 0 ? 1 : -1); return; }
          step(e.clientX < window.innerWidth / 3 ? -1 : 1);
        }}
      >
        <div className="hb-seg" aria-hidden>
          {Array.from({ length: nFr }, (_, j) => <i key={j} className={j <= fr ? 'on' : ''} />)}
        </div>
        {!isTitle && <span className="hb-chl" aria-hidden>{ROMAN[c.n]} / {ROMAN[CHAPTERS.length - 1]}</span>}
        {story}
        {nextSrc && <link rel="preload" as="image" href={nextSrc} />}
      </div>
    </div>,
    document.body,
  );
}
