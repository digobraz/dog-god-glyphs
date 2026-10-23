// DNEŠOK — AINUBIS sa pýta, člen naťuká deň so psami a VYZDVIHNE ☥ naraz (23. 10. 2026, v2).
//
// Matej 23. 10. nad svojím nákresom: *„urobme to, aby to fungovalo na princípe multidog
// a jednoduchšie… v ainubis šate… návykové, aby si to pýtalo stlačiť — každé stlačenie ukáže
// body/počet… claim points total"*. Kostra; hodnoty sa ešte doladia a prepočítajú.
//
//   hore    AINUBIS (tvár + otázka) a kruhy psov — ťuk vyberie, s kým si bol (multidog)
//   stred   6 dlaždíc 2×3 — každý ťuk = body letia hore, počet na dlaždici; ťuk na strope vráti nulu
//   dole    „Iné — dobrý skutok" (text, body posúdi AINUBIS) · VYZDVIHNI +N ☥ · séria dní
//
// 🔴 Body sa rátajú NA ŽIVÉHO PSA (DB `devotion_today` vráti len živých zaplatených).
//    Strop a hodnoty drží server (`grant-devotion`, kind 'claim'); `DEVOTION_DAILY` je zrkadlo.
// Šat = AINUBIS (`ainubisSkin.ts`): oznamy appky hovoria jeho hlasom (lock brand §AINUBIS).
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BackButton } from '@/components/pack/BackButton';
import { PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, GOLD_BTN, PROGRESS_CSS } from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { DEVOTION_DAILY, DEVOTION_FEED, DEVOTION_DEED, DEVOTION_TRIP, DEVOTION_DAY_CAP, devotionLevel, type DevotionDailyKind } from '@/lib/devotion';
import { DevotionMark } from '@/components/pack/profile/meHead';
import { useNavigate } from 'react-router-dom';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { supabase } from '@/integrations/supabase/client';
import { grantDevotion } from '@/lib/devotionGrant';
import { readHuman, patchHuman, notifOff, devotionTimes } from '@/lib/humanPrefs';
import { sizedUrl } from '@/services/cloudinaryService';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LanguageContext';
import { HandTrash } from '@/components/pack/HandIcons';
import ainubisFace from '@/assets/ainubis-head.webp';

const A = AINUBIS;
const S = PACK_SPACE;
const TX = PACK_TEXT;

interface TodayDog { id: string; name: string | null; photo: string | null; diet: 'kibble' | 'barf' | null; done: Record<string, number> }
interface Today { day: string; dogs: TodayDog[]; total: number; streak: number }

type TileKind = Exclude<DevotionDailyKind, 'deed'>;
// Finalizácia 23. 10. 2026: starostlivosť zrušená, celodenný výlet sa NEŤUKÁ — vedie na „Zapíš výlet"
// (+50 pripíše DB trigger zo záznamu). Krátke venčenie 2×3, modlitba 10.
const TILES: Array<{ kind: TileKind; icon: string; label: [string, string]; sub: [string, string] }> = [
  { kind: 'walk_short', icon: 'paw',      label: ['pack.dvtoday.walkShort', 'Short walk'],        sub: ['pack.dvtoday.walkShortSub2', 'under 20 min'] },
  { kind: 'walk',       icon: 'walk',     label: ['pack.dvtoday.walk', 'Walk'],                   sub: ['pack.dvtoday.walkSub', '20 min – 2 hours'] },
  { kind: 'presence',   icon: 'sun',      label: ['pack.dvtoday.presence', 'Prayer of presence'], sub: ['pack.dvtoday.presenceSub', '10 minutes only with your dog'] },
];

// „Iné" = DVE možnosti (Matej 23. 10.: *„zbytočne sú tam 4 možnosti — daj len zápis do kroniky
// (pekná chvíľka, zážitok) +5b alebo dobrý skutok (podpora…)"*). Body zrkadlí `DEED_POINTS` v grant-devotion.
type DeedType = 'chronicle' | 'good_deed';
const DEED_TYPES: Array<{ id: DeedType; icon: string; points: number | null; label: [string, string]; sub: [string, string]; ph: [string, string] }> = [
  { id: 'chronicle', icon: 'feather',     points: DEVOTION_DEED.chronicle,    label: ['pack.dvtoday.dtChron', 'Note in the chronicle'], sub: ['pack.dvtoday.dtChronSub', 'a lovely moment, an experience'],
    ph: ['pack.dvtoday.dtChronPh', 'What did you live through together today?'] },
  { id: 'good_deed', icon: 'house-heart', points: null, label: ['pack.dvtoday.dtGood', 'Good deed'],             sub: ['pack.dvtoday.dtGoodSub', 'support, help for a dog or a person'],
    ph: ['pack.dvtoday.dtGoodPh', 'What did you do for a dog or a person?'] },
];
/** Body za zápis „Iné" — NA ČLOVEKA, nie na psa (Matej: *„bez ohľadu — hodnotíme záujem podeliť sa s príhodou"*).
 *  Dobrý skutok = null: +30 (DEVOTION_DEED.good_deed) až keď ho AINUBIS uzná, do VYZDVIHNI sa nerátá. */
const deedPts = (t: DeedType | null) => DEED_TYPES.find((d) => d.id === t)?.points ?? null;

const CSS = `
.dvt-root{position:fixed;inset:0;z-index:66;display:flex;align-items:flex-end;justify-content:center;background:rgba(2,6,11,0.74);animation:dvt-fade .25s ease both;}
.dvt-sheet{position:relative;width:100%;max-height:94dvh;display:flex;flex-direction:column;background:${A.surface};color:${A.ink};font-family:${FONT_UI};
  border:1px solid ${A.edgeStrong};border-bottom:0;border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${A.panelShadow};animation:dvt-up .38s cubic-bezier(.2,.8,.2,1) both;}
.dvt-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:${S.md}px ${S.lg}px ${S.lg}px;}
.dvt-top{display:flex;align-items:center;gap:${S.sm}px;margin:0 0 ${S.sm}px;}
.dvt-top .sp{flex:1;}
.dvt-streak{display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;border:1px solid ${A.ctaEdge};background:${A.ctaTint};
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;color:${A.ctaA};}
.dvt-who{display:flex;align-items:center;gap:${S.md}px;}
.dvt-face{flex:none;width:72px;height:72px;border-radius:${PACK_R.pill}px;object-fit:contain;background:${A.faceBg};box-shadow:${A.faceRing};}
.dvt-q{flex:1;min-width:0;}
.dvt-q b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${A.ink};margin:0 0 ${S.xs}px;}
.dvt-q b span{color:${A.aiInk};text-shadow:${A.aiShadow};}
.dvt-q p{margin:0 0 ${S.sm}px;font-size:${TX.body}px;line-height:1.4;color:${A.ink};}
.dvt-dogs{display:flex;gap:${S.sm}px;flex-wrap:wrap;}
.dvt-dog{appearance:none;display:grid;place-items:center;width:48px;height:48px;padding:0;border-radius:${PACK_R.pill}px;cursor:pointer;overflow:hidden;
  border:2px solid ${A.edge};background:${A.raised};opacity:.45;transition:opacity .15s,border-color .15s,transform .15s;}
.dvt-dog img{width:100%;height:100%;object-fit:cover;display:block;}
.dvt-dog i{font-style:normal;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;color:${A.ink};}
.dvt-dog.on{opacity:1;border-color:${A.cyan};box-shadow:${A.faceRing};}
.dvt-dog:active{transform:scale(.94);}
.dvt-line{height:2px;margin:${S.lg}px 0;border:0;border-radius:${PACK_R.pill}px;background:linear-gradient(90deg,transparent,${A.cyan},transparent);opacity:.8;}
.dvt-grid{display:grid;grid-template-columns:1fr 1fr;gap:${S.md}px;}
.dvt-tile--wide{grid-column:1/-1;}
.dvt-tile{appearance:none;position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:${S.xs}px;min-height:96px;padding:${S.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${A.edge};background:${A.raised};color:${A.ink};font:inherit;text-align:left;cursor:pointer;
  transition:border-color .15s,background .15s,transform .12s;-webkit-tap-highlight-color:transparent;}
.dvt-tile:active:not(:disabled){transform:scale(.97);}
.dvt-tile.on{border-color:${A.cyan};background:${A.glowTint};}
.dvt-tile.full{border-color:${A.ctaA};}
.dvt-tile.got{opacity:.5;cursor:default;}
.dvt-tile b{font-weight:500;font-size:${TX.body}px;line-height:1.2;padding-right:${S.xl}px;}
.dvt-tile small{font-size:${TX.micro}px;color:${A.inkFaint};}
.dvt-tile .ic{display:grid;place-items:center;width:32px;height:32px;border-radius:${PACK_R.pill}px;border:1px solid ${A.edgeStrong};}
.dvt-cnt{position:absolute;top:${S.sm}px;right:${S.sm}px;display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;color:${A.ctaInk};background:${A.ctaGrad};}
.dvt-cnt.dim{color:${A.inkDim};background:none;border:1px solid ${A.edge};}
.dvt-tile.bump .dvt-cnt{animation:dvt-bump .3s ease;}
.dvt-fly{position:absolute;left:50%;top:40%;pointer-events:none;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h2}px;color:${A.ctaA};
  text-shadow:${A.aiShadow};animation:dvt-fly .8s ease-out forwards;}
.dvt-deed{margin:${S.md}px 0 0;border-radius:${PACK_R.tile}px;border:1px solid ${A.ctaEdge};background:${A.ctaTint};}
.dvt-deed > button{appearance:none;width:100%;display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;background:none;border:0;color:${A.ink};font:inherit;font-size:${TX.body}px;text-align:left;cursor:pointer;}
.dvt-deed--set{display:flex;align-items:stretch;}
.dvt-deed--set > button:first-child{flex:1;min-width:0;width:auto;}
.dvt-deed--set .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.dvt-deed--set .tx b{font-weight:500;font-size:${TX.body}px;}
.dvt-deed--set .tx small{padding:0;font-size:${TX.label}px;color:${A.inkDim};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.dvt-deed--set .dvt-cnt{position:static;flex:none;}
.dvt-deed > .dvt-deed-del{appearance:none;flex:none;display:grid;place-items:center;width:48px;padding:0;background:none;border:0;border-left:1px solid ${A.ctaEdge};color:${A.inkDim};cursor:pointer;}
.dvt-deed textarea{display:block;width:calc(100% - ${S.lg}px);margin:0 ${S.sm}px ${S.sm}px;min-height:72px;padding:${S.sm}px ${S.md}px;border-radius:${PACK_R.field}px;
  border:1px solid ${A.edge};background:${A.bgDeep};color:${A.ink};font:inherit;font-size:${TX.body}px;outline:0;resize:vertical;box-sizing:border-box;}
.dvt-deed textarea:focus{border-color:${A.cyan};}
.dvt-deed small{display:block;padding:0 ${S.md}px ${S.md}px;font-size:${TX.micro}px;color:${A.inkFaint};}
.dvt-foot{flex:none;padding:${S.md}px ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.md}px);border-top:1px solid ${A.edge};background:${A.surface};}
.dvt-claim{display:flex;align-items:center;justify-content:center;gap:${S.sm}px;width:100%;margin:0;padding:${S.md}px;border-radius:${PACK_R.field}px;cursor:pointer;
  border:1px solid ${GOLD_BTN.edge};background:${A.ctaGrad};color:${A.ctaInk};box-shadow:${A.ctaShadow};
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;}
.dvt-claim:disabled{cursor:default;background:${A.raised};color:${A.inkFaint};border-color:${A.edge};box-shadow:none;}
.dvt-claim b{display:inline-block;font-size:${TX.h2}px;letter-spacing:.02em;}
.dvt-claim.bump b{animation:dvt-bump .3s ease;}
.dvt-claim.boom{animation:dvt-boom .6s ease;}
.dvt-rem{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:${S.sm}px;margin:${S.sm}px 0 0;font-size:${TX.label}px;color:${A.inkDim};}
.dvt-time{padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.field}px;border:1px solid ${A.edge};background:${A.bgDeep};color:${A.ink};font:inherit;font-size:${TX.label}px;color-scheme:dark;}
.dvt-time:disabled{opacity:.4;}
.dvt-sw{appearance:none;position:relative;width:40px;height:22px;padding:0;border-radius:${PACK_R.pill}px;border:1px solid ${A.edge};background:${A.raised};cursor:pointer;}
.dvt-sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:${PACK_R.pill}px;background:${A.inkFaint};transition:transform .2s;}
.dvt-sw.on{border-color:${A.cyan};}
.dvt-sw.on::after{transform:translateX(18px);background:${A.cyan};}
.dvt-empty{padding:${S.xl}px 0;text-align:center;font-size:${TX.label}px;color:${A.inkDim};}
@media (min-width:768px){
  .dvt-root{align-items:center;padding:${S.lg}px;}
  .dvt-sheet{width:520px;max-height:calc(100dvh - 48px);border-bottom:1px solid ${A.edgeStrong};border-radius:${PACK_R.card}px;}
  .dvt-tile{min-height:72px;}
}
@media (max-height:760px) and (min-width:768px){
  .dvt-face{width:56px;height:56px;}
  .dvt-line{margin:${S.md}px 0;}
  .dvt-tile{min-height:56px;padding:${S.sm}px ${S.md}px;flex-direction:row;align-items:center;gap:${S.sm}px;}
  .dvt-tile small{display:none;}
  .dvt-tile b{padding-right:${S.xxl}px;}
}
@keyframes dvt-up{from{transform:translateY(100%);}to{transform:none;}}
@keyframes dvt-fade{from{opacity:0;}to{opacity:1;}}
@keyframes dvt-fly{0%{opacity:0;transform:translate(-50%,0) scale(.7);}20%{opacity:1;transform:translate(-50%,-12px) scale(1.1);}100%{opacity:0;transform:translate(-50%,-56px) scale(1);}}
@keyframes dvt-bump{0%{transform:scale(1);}40%{transform:scale(1.25);}100%{transform:scale(1);}}
@keyframes dvt-boom{0%{transform:scale(1);}30%{transform:scale(1.04);}100%{transform:scale(1);}}
@media (prefers-reduced-motion:reduce){.dvt-sheet,.dvt-root,.dvt-fly,.dvt-cnt,.dvt-claim b{animation:none !important;}}
`;

/* ZÁVER PO VYZDVIHNI (Matej 23. 10. 2026: *„potrebujeme animáciu a ukončenie = popup, ako sa progres bar
   posunul a správa, a potom to zmizne a človek je na profile"*). Tretia vrstva, šat AINUBISA. */
const DONE_CSS = `
.dvx-root{position:fixed;inset:0;z-index:68;display:grid;place-items:center;padding:${S.lg}px;background:rgba(2,6,11,0.82);animation:dvt-fade .25s ease both;}
.dvx-root.out{animation:dvx-out .4s ease forwards;}
.dvx-card{width:100%;max-width:360px;display:flex;flex-direction:column;align-items:center;gap:${S.md}px;padding:${S.xl}px ${S.lg}px;text-align:center;
  background:${A.surface};color:${A.ink};font-family:${FONT_UI};border:1px solid ${A.edgeStrong};border-radius:${PACK_R.card}px;box-shadow:${A.panelShadow};
  animation:dvx-pop .45s cubic-bezier(.2,.9,.25,1.2) both;}
.dvx-face{width:72px;height:72px;border-radius:${PACK_R.pill}px;object-fit:contain;background:${A.faceBg};box-shadow:${A.faceRing};}
.dvx-pts{display:inline-flex;align-items:center;gap:${S.sm}px;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h1}px;letter-spacing:.02em;color:${A.ctaA};text-shadow:${A.aiShadow};}
.dvx-lvl{display:flex;justify-content:space-between;align-items:baseline;width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;}
.dvx-lvl small{font-family:${FONT_UI};font-weight:400;font-size:${TX.micro}px;letter-spacing:.02em;text-transform:none;color:${A.inkDim};}
.dvx-root .pk-progress__fill{transition:width 1.1s cubic-bezier(.3,.8,.3,1);}
.dvx-up{font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h2}px;letter-spacing:.14em;text-transform:uppercase;color:${A.aiInk};text-shadow:${A.aiShadow};animation:dvx-pop .5s ease both;}
.dvx-msg{margin:0;font-size:${TX.body}px;line-height:1.4;color:${A.ink};}
.dvx-total{font-size:${TX.micro}px;color:${A.inkDim};}
@keyframes dvx-pop{from{opacity:0;transform:scale(.86);}to{opacity:1;transform:none;}}
@keyframes dvx-out{to{opacity:0;}}
@media (prefers-reduced-motion:reduce){.dvx-card,.dvx-up,.dvx-root{animation:none !important;}.dvx-root .pk-progress__fill{transition:none;}}
`;

/** Šírka výplne PROGRESU (recept `.pk-progress`) — rovnaký pomocník ako v `StatsDetail` a `PackDogs`. */
const fillW = (pct: number) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { display: 'block', width: w };
};

/** Záver: body napočítajú, pás sa posunie od starého súčtu k novému (cez nový stupeň, ak padol),
 *  správa AINUBISA, po chvíli samo zmizne → panel sa zavrie a človek stojí na profile. Ťuk zavrie hneď. */
function DevotionDone({ from, to, msg, tx, onDone }: {
  from: number; to: number; msg: string; tx: (k: string, f: string) => string; onDone: () => void;
}) {
  const a = devotionLevel(from), b = devotionLevel(to);
  const up = b.index > a.index;
  const [phase, setPhase] = useState<'start' | 'fill' | 'next'>('start');
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);
  const gain = Math.max(0, to - from);
  const finish = useCallback(() => { setOut(true); setTimeout(onDone, 380); }, [onDone]);
  useEffect(() => {
    const t: number[] = [];
    t.push(window.setTimeout(() => setPhase('fill'), 120));
    if (up) t.push(window.setTimeout(() => setPhase('next'), 1300));
    // počítadlo bodov — 0 → zisk za ~0,9 s
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => { const k = Math.min(1, (now - t0) / 900); setN(Math.round(gain * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    t.push(window.setTimeout(finish, up ? 4200 : 3200));
    return () => { t.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }, [gain, up, finish]);
  const lv = phase === 'next' ? b : a;
  const pct = phase === 'start' ? a.pct : phase === 'fill' ? (up ? 100 : b.pct) : b.pct;
  const name = (l: { key: string; name: string }) => tx(`pack.ladder.${l.key}`, l.name);
  return createPortal(
    <div className={`dvx-root${out ? ' out' : ''}`} role="status" onClick={finish}>
      <style>{PROGRESS_CSS + DONE_CSS}</style>
      <div className="dvx-card">
        <img className="dvx-face" src={ainubisFace} alt="" />
        <div className="dvx-pts">+{n}<DevotionMark size={24} /></div>
        {phase === 'next' && <div className="dvx-up">{tx('pack.dvtoday.levelUp', 'New rank')} · {name(b)}</div>}
        <div className="dvx-lvl">
          <span>{lv.index}. {name(lv)}</span>
          {lv.next && <small>{name(lv.next)}</small>}
        </div>
        <div className="pk-progress pk-progress--dark"><div key={phase === 'next' ? 'n' : 'a'} className="pk-progress__fill" style={fillW(pct)} /></div>
        <p className="dvx-msg">{msg}</p>
        <span className="dvx-total">{Math.round(to).toLocaleString('sk-SK')} ☥</span>
      </div>
    </div>,
    document.body,
  );
}

/* OKNO „INÉ" — druhá vrstva nad panelom, ten istý šat AINUBISA. */
const DEED_CSS = `
.dvd-root{position:fixed;inset:0;z-index:67;display:flex;align-items:flex-end;justify-content:center;background:rgba(2,6,11,0.6);animation:dvt-fade .2s ease both;}
.dvd-sheet{width:100%;background:${A.surface};color:${A.ink};font-family:${FONT_UI};border:1px solid ${A.edgeStrong};border-bottom:0;
  border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${A.panelShadow};padding:${S.lg}px ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.lg}px);animation:dvt-up .3s cubic-bezier(.2,.8,.2,1) both;}
.dvd-who{display:flex;align-items:center;gap:${S.md}px;margin:0 0 ${S.lg}px;}
.dvd-who img{flex:none;width:48px;height:48px;border-radius:${PACK_R.pill}px;object-fit:contain;background:${A.faceBg};box-shadow:${A.faceRing};}
.dvd-who p{margin:0;font-size:${TX.lead}px;line-height:1.35;}
.dvd-types{display:grid;grid-template-columns:1fr;gap:${S.sm}px;margin:0 0 ${S.md}px;}
.dvd-type{appearance:none;display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${A.edge};background:${A.raised};
  color:${A.inkDim};font:inherit;font-size:${TX.body}px;text-align:left;cursor:pointer;}
.dvd-type .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}
.dvd-type .tx b{font-weight:500;font-size:${TX.body}px;color:${A.ink};}
.dvd-type .tx small{font-size:${TX.micro}px;color:${A.inkFaint};}
.dvd-type .dvt-cnt{position:static;flex:none;}
.dvd-type.on{border-color:${A.cyan};color:${A.ink};background:${A.glowTint};}
.dvd-text{display:block;width:100%;min-height:96px;padding:${S.md}px;border-radius:${PACK_R.field}px;border:1px solid ${A.edge};background:${A.bgDeep};
  color:${A.ink};font:inherit;font-size:${TX.body}px;outline:0;resize:vertical;box-sizing:border-box;}
.dvd-text:focus{border-color:${A.cyan};}
.dvd-note{margin:${S.sm}px 0 0;font-size:${TX.micro}px;color:${A.inkFaint};}
.dvd-row{display:flex;gap:${S.sm}px;margin:${S.lg}px 0 0;}
.dvd-row .dvt-claim{flex:1;font-size:${TX.label}px;}
@media (min-width:768px){
  .dvd-root{align-items:center;padding:${S.lg}px;}
  .dvd-sheet{width:480px;border-bottom:1px solid ${A.edgeStrong};border-radius:${PACK_R.card}px;}
}
`;

function DeedSheet({ initialType, initialText, tx, onClose, onSave }: {
  initialType: DeedType | null; initialText: string; tx: (k: string, f: string) => string;
  onClose: () => void; onSave: (type: DeedType, text: string) => void;
}) {
  const [type, setType] = useState<DeedType | null>(initialType ?? 'chronicle');
  const [text, setText] = useState(initialText);
  const ok = !!type && text.trim().length >= 3;
  const ph = DEED_TYPES.find((d) => d.id === type)?.ph ?? ['pack.dvtoday.deedPh', 'What did you do for a dog today?'];
  return (
    <div className="dvd-root" role="dialog" aria-modal="true" aria-label={tx('pack.dvtoday.deed', 'Other')}
      onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}>
      <style>{DEED_CSS}</style>
      <div className="dvd-sheet">
        <div className="dvd-who">
          <img src={ainubisFace} alt="" aria-hidden />
          <p>{tx('pack.dvtoday.deedAsk', 'What happened today? Tell me in a few words.')}</p>
        </div>
        <div className="dvd-types" role="radiogroup">
          {DEED_TYPES.map((d) => (
            <button key={d.id} type="button" role="radio" aria-checked={type === d.id} className={`dvd-type${type === d.id ? ' on' : ''}`} onClick={() => setType(d.id)}>
              <BrandIcon name={d.icon} size={16} tint="gold" />
              <span className="tx"><b>{tx(...d.label)}</b><small>{tx(...d.sub)}</small></span>
              <span className="dvt-cnt dim">{d.points != null ? `+${d.points}` : tx('pack.dvtoday.deedJudge', 'AINUBIS will judge')}</span>
            </button>
          ))}
        </div>
        <textarea className="dvd-text" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder={tx(...ph)} />
        {type === 'good_deed' && <p className="dvd-note">{tx('pack.dvtoday.deedNote', 'AINUBIS will read it and add devotion.')}</p>}
        <div className="dvd-row">
          <BackButton tone="ainubis" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          <button type="button" className="dvt-claim" disabled={!ok} onClick={() => ok && type && onSave(type, text.trim())}>
            {tx('pack.dvtoday.deedAdd', 'Add to today')}
          </button>
        </div>
      </div>
    </div>
  );
}

const buzz = () => { try { navigator.vibrate?.(12); } catch { /* iOS web nevie — appka dostane haptiku neskôr */ } };

export function DevotionToday({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [today, setToday] = useState<Today | null>(null);
  const [pick, setPick] = useState<string[]>([]);
  const [tap, setTap] = useState<Partial<Record<TileKind, number>>>({});
  const [deedOpen, setDeedOpen] = useState(false);
  const [deed, setDeed] = useState('');
  const [deedType, setDeedType] = useState<DeedType | null>(null);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const [done, setDone] = useState<{ from: number; to: number; msg: string } | null>(null);
  const [flies, setFlies] = useState<Array<{ id: number; kind: TileKind; txt: string }>>([]);
  const [bump, setBump] = useState<string | null>(null);
  const [boom, setBoom] = useState(false);
  const [remOn, setRemOn] = useState(true);
  const [remTime, setRemTime] = useState<[string, string]>(['15:00', '19:00']);
  const flyId = useRef(0);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('devotion_today' as never);
    if (error || !data) { setToday({ day: '', dogs: [], total: 0, streak: 0 }); return; }
    const d = data as unknown as Today;
    setToday(d);
    setPick((p) => (p.length ? p.filter((id) => d.dogs.some((g) => g.id === id)) : d.dogs.map((g) => g.id)));
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    void readHuman().then(({ human }) => {
      setRemOn(!notifOff(human).includes('devotion_evening'));
      setRemTime(devotionTimes(human));
    });
  }, []);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const sel = (today?.dogs ?? []).filter((g) => pick.includes(g.id));
  // Koľko ťukov ešte smie pribudnúť = miesto u psa, ktorý ho má NAJVIAC.
  const room = (k: TileKind) => (sel.length ? Math.max(...sel.map((g) => DEVOTION_DAILY[k].perDay - (g.done[k] ?? 0))) : 0);
  // Body za i-ty ťuk = koľko vybraných psov má na ňom ešte miesto × hodnota.
  const ptsAt = (k: TileKind, i: number) => sel.filter((g) => (g.done[k] ?? 0) + i < DEVOTION_DAILY[k].perDay).length * DEVOTION_DAILY[k].points;
  const ptsOf = (k: TileKind, n: number) => { let s = 0; for (let i = 0; i < n; i++) s += ptsAt(k, i); return s; };
  const pending = TILES.reduce((s, r) => s + ptsOf(r.kind, tap[r.kind] ?? 0), 0) + (deed.trim() ? (deedPts(deedType) ?? 0) : 0);
  const anyTap = TILES.some((r) => (tap[r.kind] ?? 0) > 0) || deed.trim().length > 0;

  const hit = (k: TileKind) => {
    const max = room(k);
    if (max <= 0) return;
    const n = tap[k] ?? 0;
    if (n >= max) { setTap((p) => ({ ...p, [k]: 0 })); return; }   // ťuk na strope vráti nulu
    const pts = ptsAt(k, n);
    setTap((p) => ({ ...p, [k]: n + 1 }));
    const id = ++flyId.current;
    setFlies((f) => [...f, { id, kind: k, txt: `+${pts}` }]);
    setTimeout(() => setFlies((f) => f.filter((x) => x.id !== id)), 850);
    setBump(k); setTimeout(() => setBump(null), 320);
    setSaid(null);
    buzz();
  };

  const claim = async () => {
    if (busy || !anyTap || !sel.length) return;
    setBusy(true);
    try {
      const items: Array<{ kind: string; n: number }> = TILES.filter((r) => (tap[r.kind] ?? 0) > 0).map((r) => ({ kind: r.kind, n: tap[r.kind] ?? 0 }));
      if (deed.trim()) items.push({ kind: 'deed', n: 1 });
      const before = today?.total ?? 0;
      const j = await grantDevotion({ kind: 'claim', dog_ids: sel.map((g) => g.id), items, note: deed.trim(), deed_type: deedType ?? 'chronicle' });
      setBoom(true); setTimeout(() => setBoom(false), 650); buzz();
      setTap({}); setDeed(''); setDeedType(null); setDeedOpen(false);
      await load();
      const parts = [tx('pack.dvtoday.claimed', '+{n} devotion added. See you tomorrow.').replace('{n}', String(j.points ?? 0))];
      if (j.good_deed) parts.push(j.good_deed.approved
        ? tx('pack.dvtoday.goodOk', 'AINUBIS approved your good deed: +{n}.').replace('{n}', String(DEVOTION_DEED.good_deed))
        : tx('pack.dvtoday.goodNo', 'AINUBIS did not count this as a good deed: {r}').replace('{r}', j.good_deed.reason ?? ''));
      if (j.capped) parts.push(tx('pack.dvtoday.capped', "Today's limit of {n} is full — trips and good deeds still count.").replace('{n}', String(DEVOTION_DAY_CAP)));
      setSaid(parts.join(' '));
      setDone({ from: before, to: typeof j.total === 'number' ? j.total : before + (j.points ?? 0), msg: parts.join(' ') });
    } catch {
      toast({ title: tx('pack.dog.toastCouldntLog', 'Could not save'), variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const saveRem = async (on: boolean, time: [string, string]) => {
    const prev = { on: remOn, time: remTime };
    setRemOn(on); setRemTime(time);
    try {
      const { human } = await readHuman();
      const off = notifOff(human).filter((x) => x !== 'devotion_evening');
      await patchHuman({ devotion_times: time, notif_off: on ? off : [...off, 'devotion_evening'] });
    } catch {
      setRemOn(prev.on); setRemTime(prev.time);
      toast({ title: tx('pack.settings.notifErr', 'Could not save') });
    }
  };

  // SK/CS: 1 deň · 2–4 dni · 5+ dní (EN: 1 day / N days) — tri kľúče, nie jeden so zlým tvarom.
  const streakText = (n: number) => {
    const k = n === 1 ? 'streak1' : n >= 2 && n <= 4 ? 'streak2' : 'streak5';
    return tx(`pack.dvtoday.${k}`, n === 1 ? '{n} day in a row' : '{n} days in a row').replace('{n}', String(n));
  };
  const names = sel.map((g) => (g.name || '').toUpperCase()).filter(Boolean);
  const withWhom = names.length
    ? (names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} ${tx('pack.dvtoday.and', 'and')} ${names[names.length - 1]}`)
    : tx('pack.dvtoday.yourDog', 'your dog');
  const question = said ?? tx('pack.dvtoday.ask', 'How was today with {dog}? Tap what you did together.').replace('{dog}', withWhom);
  const feedOn = (today?.dogs ?? []).some((g) => g.diet);

  return createPortal(
    <div className="dvt-root" role="dialog" aria-modal="true" aria-label={tx('pack.dvtoday.title', 'Today')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{CSS}</style>
      {done && <DevotionDone from={done.from} to={done.to} msg={done.msg} tx={tx} onDone={() => { setDone(null); onClose(); }} />}
      <div className="dvt-sheet">
        <div className="dvt-body">
          <div className="dvt-top">
            <BackButton tone="ainubis" onClick={onClose} label={tx('pack.network.close', 'Close')} />
            <span className="sp" />
            {today && today.streak > 0 && (
              <span className="dvt-streak"><BrandIcon name="bolt" size={12} tint="gold" />{streakText(today.streak)}</span>
            )}
          </div>

          <div className="dvt-who">
            <img className="dvt-face" src={ainubisFace} alt="" aria-hidden />
            <div className="dvt-q">
              <b><span>AI</span>NUBIS</b>
              <p aria-live="polite">{question}</p>
              {today && today.dogs.length > 0 && (
                <div className="dvt-dogs">
                  {today.dogs.map((g) => (
                    <button key={g.id} type="button" className={`dvt-dog${pick.includes(g.id) ? ' on' : ''}`} aria-pressed={pick.includes(g.id)}
                      aria-label={g.name ?? ''} onClick={() => { setPick((p) => (p.includes(g.id) ? p.filter((x) => x !== g.id) : [...p, g.id])); setTap({}); }}>
                      {g.photo ? <img src={sizedUrl(g.photo, 120)} alt="" /> : <i>{(g.name || '?').slice(0, 1)}</i>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <hr className="dvt-line" />

          {today === null ? <div className="dvt-empty">…</div> : today.dogs.length === 0 ? (
            <div className="dvt-empty">{tx('pack.dvtoday.noDogs', 'Devotion is counted for living dogs in the pack.')}</div>
          ) : (
            <>
              <div className="dvt-grid">
                {TILES.map((r) => {
                  const n = tap[r.kind] ?? 0;
                  const max = room(r.kind);
                  const got = max <= 0;
                  const cap = DEVOTION_DAILY[r.kind].perDay;
                  const cls = got ? ' got' : n > 0 ? (n >= max ? ' on full' : ' on') : '';
                  return (
                    <button key={r.kind} type="button" className={`dvt-tile${cls}${bump === r.kind ? ' bump' : ''}`} disabled={got || !sel.length} onClick={() => hit(r.kind)}>
                      <span className="ic"><BrandIcon name={r.icon} size={16} /></span>
                      <b>{tx(...r.label)}</b>
                      <small>{tx(...r.sub)}</small>
                      {got
                        ? <span className="dvt-cnt dim">{tx('pack.dvtoday.doneToday', 'done')}</span>
                        : n > 0
                          ? <span className="dvt-cnt">{cap > 1 ? `${n}× ` : ''}+{ptsOf(r.kind, n)}</span>
                          : <span className="dvt-cnt dim">+{ptsAt(r.kind, 0)}</span>}
                      {flies.filter((f) => f.kind === r.kind).map((f) => <span key={f.id} className="dvt-fly">{f.txt}</span>)}
                    </button>
                  );
                })}
                {/* Celodenný výlet sa neťuká — vedie na „Zapíš výlet"; body pripíše záznam (DB trigger). */}
                <button type="button" className="dvt-tile" onClick={() => { onClose(); navigate('/pack/add'); }}>
                  <span className="ic"><BrandIcon name="mountain" size={16} /></span>
                  <b>{tx('pack.dvtoday.trip', 'Day trip')}</b>
                  <small>{tx('pack.dvtoday.tripSub', 'log it on the map')}</small>
                  <span className="dvt-cnt dim">+{DEVOTION_TRIP}</span>
                </button>
                {/* Krmenie sa neklikne — pripisuje sa samo podľa stravy v DOG ID. */}
                <div className="dvt-tile got dvt-tile--wide">
                  <span className="ic"><BrandIcon name="food" size={16} /></span>
                  <b>{tx('pack.dvtoday.feed', 'Feeding')}</b>
                  <small>{feedOn ? tx('pack.dvtoday.feedAutoShort', 'adds itself every day') : tx('pack.dvtoday.feedSoonShort', 'soon in DOG ID')}</small>
                  <span className="dvt-cnt dim">+{DEVOTION_FEED.kibble}–{DEVOTION_FEED.barf}</span>
                </div>
              </div>

              {/* INÉ — ťuk otvorí okno AINUBISA (druh + pár slov). Po pridaní ostane v paneli pásik so zápisom. */}
              {deed.trim() ? (
                <div className="dvt-deed dvt-deed--set">
                  <button type="button" onClick={() => setDeedOpen(true)} aria-label={tx('pack.dvtoday.deedEdit', 'Edit')}>
                    <BrandIcon name={DEED_TYPES.find((d) => d.id === deedType)?.icon ?? 'feather'} size={16} tint="gold" />
                    <span className="tx"><b>{tx(...(DEED_TYPES.find((d) => d.id === deedType)?.label ?? ['pack.dvtoday.deedOther', 'Other']))}</b><small>{deed.trim()}</small></span>
                    {deedPts(deedType) != null
                      ? <span className="dvt-cnt">+{deedPts(deedType)}</span>
                      : <span className="dvt-cnt dim">{tx('pack.dvtoday.deedJudge', 'AINUBIS will judge')}</span>}
                  </button>
                  <button type="button" className="dvt-deed-del" onClick={() => { setDeed(''); setDeedType(null); }} aria-label={tx('pack.dvtoday.deedDel', 'Remove')}>
                    <HandTrash size={16} />
                  </button>
                </div>
              ) : (
                <div className="dvt-deed">
                  <button type="button" onClick={() => setDeedOpen(true)}>
                    <BrandIcon name="feather" size={16} tint="gold" />
                    <span>{tx('pack.dvtoday.deed', 'Other — an event, a good deed…')}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {/* PÄTA — VYZDVIHNI je stále na očiach (prilepené mimo rolovania), pod ním čas pripomienky. */}
        <div className="dvt-foot">
          {today && today.dogs.length > 0 && (
            <button type="button" className={`dvt-claim${boom ? ' boom' : ''}${bump ? ' bump' : ''}`} disabled={!anyTap || busy || !sel.length} onClick={() => void claim()}>
              {tx('pack.dvtoday.claim', 'Claim')} {pending > 0 && <b>+{pending}</b>}
              <BrandIcon name="heartpaw" size={18} tint={anyTap ? 'dark' : 'dim'} />
            </button>
          )}
          <div className="dvt-rem">
            <span>{tx('pack.dvtoday.remShort', "I'll remind you at")}</span>
            {[0, 1].map((i) => (
              <input key={i} className="dvt-time" type="time" step={900} value={remTime[i]} disabled={!remOn}
                onChange={(e) => {
                  if (!/^\d{2}:\d{2}$/.test(e.target.value)) return;
                  const next: [string, string] = [remTime[0], remTime[1]]; next[i] = e.target.value; void saveRem(remOn, next);
                }}
                aria-label={tx('pack.dvtoday.remWhen', 'Every day at')} />
            ))}
            <button type="button" className={`dvt-sw${remOn ? ' on' : ''}`} role="switch" aria-checked={remOn}
              aria-label={tx('pack.dvtoday.reminder', 'Evening reminder')} onClick={() => void saveRem(!remOn, remTime)} />
          </div>
        </div>
      </div>
      {deedOpen && (
        <DeedSheet initialType={deedType} initialText={deed} tx={tx}
          onClose={() => setDeedOpen(false)}
          onSave={(type, text) => { setDeedType(type); setDeed(text); setDeedOpen(false); setSaid(null); setBump('deed'); setTimeout(() => setBump(null), 320); buzz(); }} />
      )}
    </div>,
    document.body,
  );
}
