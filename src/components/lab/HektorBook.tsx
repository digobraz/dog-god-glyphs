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
 *  malinkého smutného z čias, kedy bol vyhodený"*). Heroglyf leží na hladine
 *  zrkadla — pás v strede kresby je na to nechaný prázdny. */
const CHAPTERS = [
  { n: 0, media: ['k0-zrkadlo-b'] },
  { n: 1, media: ['k1-kresba', 'k1-f1', 'k1-f2'] },
  { n: 2, media: ['k2-kresba', 'k2-f1', 'k2-f2', 'k2-f3'] },
  { n: 3, media: ['k3-kresba', 'k3-f1', 'k3-f2'] },
  { n: 4, media: ['k4-kresba', 'k4-f1', 'k4-f2', 'k4-f3'] },
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
.hb-page { position: relative; display: flex; flex-direction: column; min-height: 0; overflow: hidden; padding: 28px 36px 76px; }
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
  font: 700 25px/1.15 'Dogyptian', 'Cinzel', serif; text-transform: uppercase; letter-spacing: .02em;
  color: #16307A; margin: 0 0 4px;
}
.hb-lead::after {
  content: ''; display: block; width: 160px; height: 14px; margin: 10px 0 12px;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='14'><path d='M4 7l5-5 5 5-5 5z' fill='%23C99A3F'/><circle cx='22' cy='7' r='3' fill='%23A8432A'/><path d='M30 7l5-5 5 5-5 5z' fill='%2316307A'/></svg>") left / 40px 14px repeat-x;
}
.hb-txt { font: 400 19px/1.45 'Dogyptian', 'Space Grotesk', sans-serif; color: rgba(42, 26, 12, 0.88); margin: 0; }
.hb-band {
  position: absolute; left: 24px; right: 24px; bottom: 18px; height: 40px; border-radius: 3px;
  display: flex; align-items: center; justify-content: space-around;
  background: linear-gradient(#16307A, #0A1A4A);
  box-shadow: inset 0 0 0 2px #C99A3F, inset 0 0 0 5px #A8432A, inset 0 0 0 7px #C99A3F;
}
.hb-band img { height: 20px; width: auto; filter: invert(.92) sepia(.6) saturate(2) hue-rotate(5deg); }
.hb-pic {
  position: relative; height: 100%; aspect-ratio: 3 / 4; max-width: 100%;
  border-radius: 6px; overflow: hidden; cursor: pointer; border: 0; padding: 0; background: #E6D2A6;
  box-shadow: 0 0 0 3px #C99A3F, 0 0 0 6px #16307A, 0 0 0 8px #C99A3F, 0 14px 30px rgba(60, 35, 8, 0.35);
}
.hb-pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity .45s; }
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
  position: absolute; left: 50%; top: 50.8%; z-index: 2; transform: translate(-50%, -50%);
  width: 62%; padding: 5px 7px; border-radius: 4px; background: #F1E2BF;
  box-shadow: 0 0 0 2px #C99A3F, 0 0 0 4px #16307A, 0 0 0 6px #C99A3F, 0 8px 18px rgba(0, 0, 0, 0.35);
}
.hb-glyph img { position: static; display: block; width: 100%; height: auto; opacity: 1; }
.hb-title { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-bottom: 40px; }
.hb-title p {
  font: 700 52px/1.05 'Dogyptian', 'Cinzel', serif; text-transform: uppercase; letter-spacing: .02em;
  color: #16307A; margin: 0;
}
.hb-title::before, .hb-title::after {
  content: ''; width: 200px; height: 14px; margin: 24px 0;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='14'><path d='M4 7l5-5 5 5-5 5z' fill='%23C99A3F'/><circle cx='22' cy='7' r='3' fill='%23A8432A'/><path d='M30 7l5-5 5 5-5 5z' fill='%2316307A'/></svg>") center / 40px 14px repeat-x;
}
.hb-track { display: none; }
.hb-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; }
.hb-nav button {
  width: 48px; height: 48px; border-radius: 999px; display: grid; place-items: center; cursor: pointer;
  border: 1px solid rgba(201, 154, 63, 0.7); background: #F3E4C4;
}
.hb-nav button:disabled { opacity: .35; cursor: default; }
.hb-dots { display: flex; gap: 8px; }
.hb-dots i { width: 8px; height: 8px; border-radius: 999px; background: rgba(243, 228, 196, 0.45); }
.hb-dots i.on { background: #F3E4C4; width: 24px; }
@container (max-width: 720px) {
  .hb-book { display: block; height: min(740px, calc(100dvh - 160px)); }
  .hb-book::after, .hb-page { display: none; }
  .hb-track {
    display: flex; gap: 12px; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory;
    padding: 20px 16px 20px 20px; scrollbar-width: none; position: relative; z-index: 4;
  }
  .hb-track::-webkit-scrollbar { display: none; }
  .hb-track > * { flex: 0 0 80%; scroll-snap-align: start; height: 100%; }
  .hb-track > :last-child { scroll-snap-align: end; }
  .hb-mtext {
    position: relative; border-radius: 12px; padding: 16px 16px 64px; overflow-y: auto;
    background: rgba(255, 248, 232, 0.55); box-shadow: inset 0 0 0 1px rgba(201, 154, 63, 0.45);
  }
  .hb-mtext .hb-band { left: 12px; right: 12px; bottom: 12px; height: 34px; }
  .hb-mpic {
    position: relative; flex-basis: auto !important; aspect-ratio: 3 / 4; max-width: 80%; border-radius: 12px; overflow: hidden;
    box-shadow: 0 0 0 2px #C99A3F, 0 0 0 4px #16307A, 0 10px 20px rgba(60, 35, 8, 0.3);
  }
  .hb-mpic img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hb-mpic .hb-plate { font-size: 14px; padding: 5px 12px; }
  .hb-ini { width: 64px; height: 70px; font-size: 48px; margin-right: 12px; }
  .hb-lead { font-size: 18px; }
  .hb-lead::after { margin: 8px 0 10px; }
  .hb-txt { font-size: 16px; }
  .hb-title p { font-size: 34px; }
  .hb-title::before, .hb-title::after { width: 140px; margin: 16px 0; }
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
  const backRef = useRef<HTMLButtonElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const go = useCallback((n: number) => {
    setCh(Math.max(0, Math.min(CHAPTERS.length - 1, n)));
    setPic(0);
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

  // Na mobile sa pri novej kapitole pás vráti na text.
  useEffect(() => { trackRef.current?.scrollTo({ left: 0 }); }, [ch]);

  const c = CHAPTERS[ch];
  const k = `onepage.hbook.${c.n}`;
  const cap = t(`${k}.cap`);
  const isTitle = c.n === 0;
  const glyph = isTitle && (
    <span className="hb-glyph" aria-hidden><img src="/images/hekthor-heroglyph.webp" alt="" /></span>
  );
  const text = isTitle ? (
    <>
      <div className="hb-title"><p>{t(`${k}.title`)}</p></div>
      <div className="hb-band" aria-hidden>
        {BAND.map((s, i) => <img key={i} src={s} alt="" />)}
      </div>
    </>
  ) : (
    <>
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
              {glyph}
              {c.media.length > 1 && (
                <span className="hb-pdots" aria-hidden>
                  {c.media.map((m, j) => <i key={m} className={j === pic ? 'on' : ''} />)}
                </span>
              )}
              <span className="hb-plate">{cap}</span>
            </button>
          </div>
          <div className="hb-track" ref={trackRef}>
            <div className="hb-mtext">{text}</div>
            {c.media.map((m, j) => (
              <div key={m} className="hb-mpic">
                <img src={`${IMG}/${m}.webp`} alt={j === 0 ? cap : ''} loading="lazy" />
                {j === 0 && glyph}
                {j === 0 && <span className="hb-plate">{cap}</span>}
              </div>
            ))}
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
    </div>,
    document.body,
  );
}
