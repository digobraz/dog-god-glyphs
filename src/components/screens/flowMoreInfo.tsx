import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@/i18n/LanguageContext';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { LAB } from '@/lib/labTheme';
import { readSvorka } from '@/lib/flowSvorka';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';

// ════════════════════════════════════════════════════════════════════════════
// VIAC INFO — karusel „Čo dostaneš" v doske pokladne (26. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026: *„otvorí popup tak, že pozadie stmavne a obsah bude
// slajdovateľný do strán, jedna obrazovka = jedna informácia: obrázok,
// nadpis a popis"*. Leží v doske ako ostatné panely (`FlowPanelShell`).
//
// 🔑 TEXTY a POLOHY OBRÁZKOV nastavil Matej v editore
//    `plany/nakres-viac-info-popup-2026-09-25/editor.html` (uložené 26. 9.
//    11:09). `SLIDES[].pos` = jeho zväčšenie a posun, zvlášť PC a mobil —
//    meň ich tam, nie odhadom tu.
// 🔑 Rám obrázka má pevný pomer 3:2 a obrázok ho vždy vyplní (Matej: *„aby
//    nebolo čierne miesto za nimi"*). Šírka rámu sa počíta z výšky dosky cez
//    container query, aby sa karusel zmestil bez rolovania aj na 1477×724.
// 🔑 Nadpis aj text sú zarovnané VĽAVO (Matej 26. 9.: *„aby sa lepšie čítali"*).
// 🔑 HEROGLYF = živý heroglyf prvého psa zo svorky, nie vzorka.
// 🔑 SNIFFER = logo + veta na smotanovom podklade (Matej 26. 9.), nie snímka.
// ════════════════════════════════════════════════════════════════════════════

type Pos = { z: number; x: number; y: number };
type Slide = {
  key: 'glyph' | 'pack' | 'dogid' | 'ainubis' | 'dogtrip' | 'sniffer' | 'cause' | 'money';
  src?: string;
  video?: boolean;
  bg: string;
  pos: { pc: Pos; ph: Pos };
};

const IMG = '/images/viac-info';
const SLIDES: Slide[] = [
  { key: 'glyph', bg: 'radial-gradient(circle at 50% 40%, #FFF8E6, #EAD7A8)', pos: { pc: { z: 0.96, x: 0, y: 0 }, ph: { z: 0.78, x: 0, y: 0 } } },
  { key: 'pack', src: `${IMG}/pack`, video: true, bg: '#0c0a08', pos: { pc: { z: 1.16, x: 0.9, y: 4.6 }, ph: { z: 1.17, x: 0, y: 0 } } },
  { key: 'dogid', src: `${IMG}/dogid.jpg`, bg: '#0c0a08', pos: { pc: { z: 1.55, x: 24.6, y: 1.1 }, ph: { z: 2.08, x: 49.7, y: -17.7 } } },
  { key: 'ainubis', src: `${IMG}/ainubis.jpg`, bg: '#000', pos: { pc: { z: 1.96, x: -26.5, y: -14.2 }, ph: { z: 1.89, x: -23.1, y: -10.7 } } },
  { key: 'dogtrip', src: `${IMG}/dogtrip.jpg`, bg: '#0c0a08', pos: { pc: { z: 1.49, x: 24.1, y: 23.9 }, ph: { z: 1.71, x: 35.1, y: 34 } } },
  { key: 'sniffer', bg: '#FBF5E6', pos: { pc: { z: 1, x: 0, y: 0 }, ph: { z: 1, x: 0, y: 0 } } },
  { key: 'cause', src: `${IMG}/cause-touch.jpg`, bg: '#EDEDED', pos: { pc: { z: 1.01, x: -0.4, y: -0.4 }, ph: { z: 1.05, x: 0, y: 0 } } },
  // KAM IDÚ PENIAZE = posledná snímka, hneď po VYŠŠOM CIELI (Matej 26. 9. 2026:
  // *„posledná stránka v popupe, po vyššom princípe, obrazovka kam idú peniaze
  // (zlúč to)"*). Samostatný panel v pokladni tým zanikol.
  { key: 'money', bg: '#FBF5E6', pos: { pc: { z: 1, x: 0, y: 0 }, ph: { z: 1, x: 0, y: 0 } } },
];

/** Kresby štyroch podielov — v poradí `TRANSPARENCY_SPLIT`. */
const MONEY_ICON = ['/icons/pack/layers.svg', '/icons/pack/link.svg', '/icons/mission/doghome.svg', '/icons/pack/food.svg'];

const posCss = (p: Pos) => `translate(calc(-50% + ${p.x}%), calc(-50% + ${p.y}%)) scale(${p.z})`;

export function FlowMoreInfo({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const n = SLIDES.length;
  const go = (to: number) => { setDir(to > i || (i === n - 1 && to === 0) ? 1 : -1); setI((to + n) % n); };
  const [pc, setPc] = useState(() => typeof window !== 'undefined' && window.innerWidth > 600);
  useEffect(() => {
    const on = () => setPc(window.innerWidth > 600);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  // Šípky na klávesnici (Esc zatvára shell).
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });
  // Ťah prstom AJ MYŠOU (Matej 26. 9.: *„nie na mobile, ale aj na PC by sa malo
  // dať posúvať swajpom"*): > 40 px do strany = ďalšia / predošlá snímka.
  // `setPointerCapture` drží ťah aj keď myš vyjde z rámu — bez neho sa
  // `pointerup` mimo priezoru stratil a na PC sa ťahom neposunulo nič.
  const sx = useRef<number | null>(null);
  /** Rozbalený podiel na snímke peňazí (jeden naraz). */
  const [openMoney, setOpenMoney] = useState<number | null>(null);
  const dog = useMemo(() => readSvorka()[0]?.selections as Record<string, string> | undefined, []);
  const s = SLIDES[i];
  const pos = pc ? s.pos.pc : s.pos.ph;

  return (
    <div className="mi">
      <style>{MORE_INFO_CSS}</style>
      <p className="mi-eye">
        {t('heroglyph.flow.more.eyebrow')} · <b>{i + 1} / {n}</b>
      </p>
      <div
        className="mi-stage"
        onPointerDown={(e) => {
          // Na snímke peňazí je zoznam s rozklikom — ťah tam nechytáme, klik má patriť riadku.
          if ((e.target as HTMLElement).closest('.mi-money, .mi-ar')) return;
          sx.current = e.clientX;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (sx.current === null) return;
          const dx = e.clientX - sx.current;
          sx.current = null;
          if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => { sx.current = null; }}
      >
        <div className="mi-frame">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={s.key}
              className="mi-media"
              style={{ background: s.bg }}
              custom={dir}
              initial={{ x: `${dir * 40}%`, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: `${-dir * 40}%`, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {s.key === 'glyph' && (
                <div className="mi-fit" style={{ transform: posCss(pos) }}>
                  {/* Pes bez vyplnených slotov (dielňa, výpadok store) ⇒ Hektorov
                      heroglyf ako vzor, nie prázdny rám. */}
                  {dog?.dogGender && dog?.dogColour
                    ? <HeroglyphFrame showOwner dogValues={dog} className="mi-glyph" />
                    : <img className="mi-glyph" src="/heroglyph/hektor-horizontal.svg" alt="" draggable={false} />}
                </div>
              )}
              {s.key === 'money' && (
                // Nie dlaždice ako ostatné snímky, ale ZOZNAM S ROZKLIKOM ako
                // predtým (Matej 26. 9.: *„daj to normálne, ako bolo predtým, na
                // rozklik a dropdown s vysvetlením"*).
                <ul className="mi-money">
                  {TRANSPARENCY_SPLIT.map((m, k) => (
                    <li key={m.labelKey} className={openMoney === k ? 'on' : ''} style={{ borderColor: m.color }}>
                      <button type="button" onClick={() => setOpenMoney(openMoney === k ? null : k)} aria-expanded={openMoney === k}>
                        <img src={MONEY_ICON[k]} alt="" />
                        <span>{t(m.labelKey)}</span>
                        <b>€{m.share}</b>
                        <svg className="mi-chev" viewBox="0 0 12 12" aria-hidden><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                      </button>
                      {openMoney === k && <p>{t(m.noteKey)}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {s.key === 'sniffer' && (
                <div className="mi-sniff">
                  <img src="/icons/sniffer/sniffer-logo.svg" alt="SNIFFER" />
                  <p>{t('pack.buddy.intro')}</p>
                </div>
              )}
              {s.video && (
                <video
                  className="mi-img"
                  style={{ transform: posCss(pos) }}
                  autoPlay muted loop playsInline
                  poster={`${s.src}-poster.jpg`}
                >
                  <source src={`${s.src}.webm`} type="video/webm" />
                  <source src={`${s.src}.mp4`} type="video/mp4" />
                </video>
              )}
              {s.src && !s.video && (
                <img className="mi-img" src={s.src} alt="" draggable={false} style={{ transform: posCss(pos) }} />
              )}
            </motion.div>
          </AnimatePresence>
          <button type="button" className="mi-ar l" aria-label={t('heroglyph.flow.more.prev')} onClick={() => go(i - 1)}>
            <HandArrowLeft size={18} />
          </button>
          <button type="button" className="mi-ar r" aria-label={t('heroglyph.flow.more.next')} onClick={() => go(i + 1)}>
            <HandArrowLeft size={18} />
          </button>
        </div>
      </div>
      <div className="mi-text">
        <h3>
          {s.key === 'ainubis'
            ? <><span className="mi-ai">AI</span>NUBIS</>
            : t(`heroglyph.flow.more.${s.key}.t`)}
        </h3>
        <p>{t(`heroglyph.flow.more.${s.key}.d`)}</p>
      </div>
      <div className="mi-dots" role="tablist">
        {SLIDES.map((x, k) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={k === i}
            aria-label={`${k + 1} / ${n}`}
            className={k === i ? 'on' : ''}
            onClick={() => go(k)}
          />
        ))}
      </div>
      <button type="button" className="mi-close" onClick={onClose}>{t('heroglyph.flow.more.close')}</button>
    </div>
  );
}

const MORE_INFO_CSS = `
.mi { display: flex; flex-direction: column; gap: 8px; height: 100%; min-height: 0; }
.mi-eye { margin: 0; text-align: center; font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: ${LAB.inkMuted}; }
.mi-eye b { font-weight: 500; color: #9A7325; }
/* Javisko berie zvyšnú výšku; rám 3:2 sa do nej vpíše (šírka z výšky). */
.mi-stage { flex: 1 1 auto; min-height: 120px; container-type: size; display: flex; align-items: center; justify-content: center; touch-action: pan-y; }
.mi-frame { position: relative; width: min(100cqw, 150cqh); aspect-ratio: 3 / 2; }
.mi-media { position: absolute; inset: 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(154, 115, 37, .35); }
.mi-img, .mi-fit { position: absolute; left: 50%; top: 50%; width: 100%; height: 100%; object-fit: cover; user-select: none; pointer-events: none; }
.mi-fit { display: flex; align-items: center; justify-content: center; }
.mi-fit .mi-glyph { width: 92% !important; height: auto; }
.mi-sniff { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 16px 24px; text-align: center; }
.mi-sniff img { width: min(70%, 320px); height: auto; }
.mi-sniff p { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.4; color: ${LAB.ink}; max-width: 320px; }
.mi-money { position: absolute; inset: 0; margin: 0; padding: 12px; list-style: none; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
.mi-money li { border-radius: 12px; border: 2px solid; background: rgba(255, 253, 247, .7); flex: none; }
.mi-money li button { width: 100%; display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: none; border: 0; cursor: pointer; text-align: left; }
.mi-money img { width: 28px; height: 28px; object-fit: contain; flex: none; }
.mi-money li button span { flex: 1; font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 14px; color: ${LAB.ink}; }
.mi-money b { font-family: 'Cinzel', serif; font-weight: 700; font-size: 20px; line-height: 1; color: ${LAB.ink}; }
.mi-chev { width: 14px; height: 14px; color: ${LAB.inkBody}; transition: transform .18s; flex: none; }
.mi-money li.on .mi-chev { transform: rotate(180deg); }
.mi-money li p { margin: 0; padding: 0 12px 12px 52px; font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.45; color: ${LAB.inkBody}; }
.mi-stage { cursor: grab; }
.mi-stage:active { cursor: grabbing; }
.mi-ar { position: absolute; top: calc(50% - 18px); width: 36px; height: 36px; border-radius: 999px; border: 1px solid #C99A3F; background: #FBF5E6; color: #9A7325; display: grid; place-items: center; cursor: pointer; z-index: 2; }
.mi-ar.l { left: -12px; }
.mi-ar.r { right: -12px; }
.mi-ar.r svg { transform: rotate(180deg); }
.mi-text { text-align: left; }
.mi-text h3 { margin: 4px 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 20px; letter-spacing: .14em; color: ${LAB.ink}; }
.mi-ai { color: #1A6FA8; }
.mi-text p { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45; color: ${LAB.inkBody}; min-height: calc(3 * 1.45em); }
.mi-dots { display: flex; gap: 8px; justify-content: center; }
.mi-dots button { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 999px; background: rgba(154, 115, 37, .3); cursor: pointer; position: relative; transition: width .2s, background .2s; }
.mi-dots button::after { content: ""; position: absolute; inset: -8px -4px; }
.mi-dots button.on { width: 24px; background: #C99A3F; }
.mi-close { align-self: center; border: 1.5px solid ${LAPIS.edge}; color: ${LAPIS.edge}; background: transparent; border-radius: 8px; padding: 8px 24px; font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; cursor: pointer; }
.mi-close:hover { background: ${LAPIS.fill}; }
@media (max-width: 600px) {
  /* Na mobile je rám obmedzený ŠÍRKOU — javisko nesmie brať zvyšnú výšku,
     inak medzi obrázkom a textom ostane diera. Obsah sa centruje v doske. */
  .mi { justify-content: center; }
  .mi-stage { flex: 0 0 auto; container-type: inline-size; min-height: 0; }
  .mi-frame { width: 100cqw; }
  .mi-text h3 { font-size: 16px; }
  .mi-text p { font-size: 12px; }
  .mi-ar { width: 32px; height: 32px; top: calc(50% - 16px); }
  .mi-money { padding: 8px; gap: 4px; }
  .mi-money img { width: 20px; height: 20px; }
  .mi-money b { font-size: 16px; }
  .mi-money li button { padding: 6px 8px; gap: 8px; }
  .mi-money li button span { font-size: 12px; }
  .mi-money li p { padding: 0 8px 8px 36px; font-size: 11px; }
}
`;
