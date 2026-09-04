// ════════════════════════════════════════════════════════════════════════════
// AINUBIS V SPODNOM NAVE `/pack` — medailón (2026-09-04)
// ────────────────────────────────────────────────────────────────────────────
// Matej 4. 9. 2026: „skusme opraviť spodný panel v /pack … ainubisa dali do stredu
// spodného navu = domov ainubis mapa profily … bude dolu tak ako máme logo dogyptu
// na /onepage hore = v ráme a pretrčajúce mierne."
//
// 🔑 LADÍ SA V `plany/nakres-pack-dock-ainubis-2026-09-04.html`, NIE TU.
//    Nákres má rovnaké kľúče ako `DOCK` nižšie a tlačidlo „Skopíruj nastavenia"
//    vypľuje presne tento objekt — prenos je prepis, nie prekresľovanie.
//    Meria pritom aj to, čo sa v kóde nevidí: koľko chýba do optického stredu lišty
//    a akú vôľu má kotúč k susednej položke, zvlášť pre 390 px a pre PC.
//
// ⚠️ TVÁR JE V AINUBISOVOM BRANDE, OBRUČ V DOGYPTOVOM. Vnútro je jeho tmavomodrý
//    displej + cyan dosvit (`ainubisSkin.ts`), obruč zlatá ako celý nav. Na `/onepage`
//    je vnútro medailónu lapisové — tam je v ňom LOGO. Tu je v ňom ON, a keď hovorí
//    on, nesie svoju paletu (CLAUDE.md: „AINUBIS je výnimka! Je to jeho brand").
//
// ⚠️ DVE PASCE GEOMETRIE, obe zdedené z `NavMedallion.tsx` (/onepage) — nezopakuj ich:
//    1. `<svg>` je NAHRADENÝ prvok — z `position:absolute; inset:…` si rozmer NEVEZME,
//       drží default 300×150. Šírka aj výška musia byť napísané.
//    2. Plátno absolútneho potomka = PADDING-box rodiča. Obruč je `padding` (nie
//       `border`), takže `100%` JE priemer aj s ňou a polomer 50 vo viewBoxe je jej hrana.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { NAV_GRAIN } from './navGoldSkin';
import { AINUBIS } from './ainubisSkin';
import { openAinubis, getAinubisUnread, onAinubisUnread } from '@/lib/ainubisBus';
import ainubisFace from '@/assets/ainubis-badge.png';

type Ring = 'smooth' | 'alt' | 'engraved' | 'beads';

/** Jediné miesto na ladenie. Kľúče sú zhodné s exportom z nákresu.
 *  ⚠️ Zámerne BEZ `as const` — inak by z čísel boli literálové typy a porovnanie
 *  ako `ring === 'alt'` by TypeScript hlásil ako nemožné. */
export const DOCK: {
  d: number; lift: number; slot: number; medalX: number; ow: number; iw: number; faceW: number;
  ring: Ring; segs: number; deco: number; rot: number;
  gloss: number; grain: number; shadow: number; halo: number;
  avRing: number; avPhoto: number;
} = {
  // ⚠️ HODNOTY SÚ MATEJOV VÝBER Z NÁKRESU (4. 9. 2026, tri kolá: „super toto sa mi
  //    celkom páči"). Needituj ich odhadom — nalaď v nákrese a prenes celý objekt.
  d: 74,
  // „pretrčajúce mierne" znamená naozaj mierne: pri lift 1 vystupuje kotúč nad bar
  // o 5 px a pod jeho spodnú hranu o 3 px.
  lift: 1,
  slot: 90,
  // Vľavo je JEDNA položka a vpravo DVE, takže medailón v toku sedí vľavo od stredu
  // lišty. Toto je ručná náprava, odmeraná v nákrese: do stredu chýba +10 px na mobile
  // ale len +4 px na PC (tam nesie pravá strana text MAPA, ktorý rastie s jazykom),
  // takže jedno číslo obe šírky netrafí a 10 je Matejom vybraný kompromis.
  // ⚠️ Nezvyšuj ho bez nákresu: pri +17 sa kotúč na 390 px dotkne zemegule.
  medalX: 10,
  ow: 5,
  // 0 = medailón NEMÁ vnútorný modrý lem, aký má logo na /onepage. Zlato ide priamo
  // na jeho displej — s lemom bol kotúč pri 74 px opticky menší a lem čítal ako tretí kruh.
  iw: 0,
  faceW: 72,
  ring: 'smooth',
  segs: 22,
  deco: 0.95,
  rot: 0,
  gloss: 0.5,
  grain: 0.18,
  shadow: 0.6,
  halo: 0.45,
  avRing: 3,
  avPhoto: 25,
};

const goldRing = 'conic-gradient(from 59deg,#FCF0C2,#EDCE7C 8%,#D8B052 22%,#AA8129 34%,#C09636 46%,#F7E4A8 58%,#D8B052 72%,#A97F27 86%,#FCF0C2 100%)';

/** Ozdoby obruče — kreslia sa do SVG, nie conic gradientom: rytiny a segmenty
 *  potrebujú TVAR, conic vie len klin. Pri `ring: 'smooth'` sa nevykreslí nič
 *  a obruč ostane leštené zlato. */
function Deco() {
  const kOut = 50;
  const owPct = (DOCK.ow / DOCK.d) * 100;
  const rMid = kOut - owPct / 2;
  const gold = '#F3DFA4';
  const deep = 'rgba(58,34,4,.75)';
  const nodes: JSX.Element[] = [];
  const P = (a: number, r: number) => [
    50 + r * Math.cos(((a - 90) * Math.PI) / 180),
    50 + r * Math.sin(((a - 90) * Math.PI) / 180),
  ];

  if (DOCK.ring === 'alt') {
    const n = Math.max(4, DOCK.segs);
    const step = 360 / n;
    const rIn = kOut - owPct;
    for (let i = 0; i < n; i += 2) {
      const a0 = i * step + DOCK.rot;
      const a1 = a0 + step;
      const p1 = P(a0, kOut), p2 = P(a1, kOut), p3 = P(a1, rIn), p4 = P(a0, rIn);
      nodes.push(
        <path
          key={`alt${i}`}
          d={`M${p1} A${kOut} ${kOut} 0 0 1 ${p2} L${p3} A${rIn} ${rIn} 0 0 0 ${p4} Z`}
          fill={AINUBIS.glow}
          opacity={DOCK.deco}
        />,
      );
    }
  }

  if (DOCK.ring === 'engraved') {
    const n = Math.max(6, DOCK.segs);
    const h = owPct * 0.52;
    const w = owPct * 0.16;
    for (let i = 0; i < n; i++) {
      const a = i * (360 / n) + DOCK.rot;
      nodes.push(
        <rect key={`e${i}`} x={50 - w / 2} y={50 - rMid - h / 2} width={w} height={h}
          rx={w * 0.3} fill={deep} opacity={DOCK.deco} transform={`rotate(${a} 50 50)`} />,
      );
    }
  }

  if (DOCK.ring === 'beads') {
    const n = Math.max(6, DOCK.segs);
    const r = owPct * 0.34;
    for (let i = 0; i < n; i++) {
      const a = i * (360 / n) + DOCK.rot;
      const t = `rotate(${a} 50 50)`;
      nodes.push(<circle key={`b${i}`} cx={50} cy={50 - rMid} r={r} fill={gold} opacity={DOCK.deco} transform={t} />);
      nodes.push(<circle key={`bs${i}`} cx={50} cy={50 - rMid + r * 0.28} r={r * 0.62} fill={deep} opacity={DOCK.deco * 0.5} transform={t} />);
    }
  }

  if (nodes.length === 0) return null;
  return (
    <svg className="pk-medal-deco" viewBox="0 0 100 100" aria-hidden focusable="false">{nodes}</svg>
  );
}

/**
 * Medailón v strede spodného navu. Klik otvára ten istý panel ako plávajúca guľa —
 * cez `openAinubis()`, teda žiadny druhý chat a žiadny prop-drilling cez PackLayout.
 */
export function DockMedallion({ label }: { label: string }) {
  // Odznak neprečítaných. Guľa je v `/pack` skrytá, takže by inak zmizol s ňou.
  const [unread, setUnread] = useState(getAinubisUnread);
  useEffect(() => onAinubisUnread(setUnread), []);

  return (
    <span className="pk-medal-slot">
      <button type="button" className="pk-medal" aria-label={label} onClick={() => openAinubis()}>
        <span className="pk-medal-rim">
          <span className="pk-medal-face">
            <img src={ainubisFace} alt="" aria-hidden />
            <span className="pk-medal-grain" />
            <span className="pk-medal-gloss" />
          </span>
        </span>
        <Deco />
        {unread > 0 && <span className="pk-medal-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
    </span>
  );
}

/** CSS medailónu. Vkladá ho `PackBottomNav` do svojho `<style>`. */
export const DOCK_MEDAL_CSS = `
/* Posun medailónu ide von ako premenná, lebo ho potrebuje aj CHAT PANEL: ten sa
   otvára zarovnaný na spúšťač a spúšťačom je odteraz medailón, nie guľa v rohu
   (body.has-pack-nav .ainubis-panel v AinubisWidget.css). Bez premennej by tá
   istá desiatka žila v dvoch súboroch a pri prvom doladení v nákrese sa rozišla.
   Platí len kým je nav namountovaný — presne vtedy, keď medailón existuje. */
:root{--pack-medal-x:${DOCK.medalX}px;}
/* O KOĽKO KOTÚČ VYSTUPUJE NAD LIŠTU. Absolútne pozicovaný medailón výšku navu
   NEZVÄČŠUJE, takže čokoľvek, čo si nad lištou robí miesto (dvojica ZOZNAM/PRIDAŤ
   na /pack/map, rozbaľovačka avatara), by ho inak prekrylo — a to sa 4. 9. aj stalo.
   Odvodené, nie odhadnuté: polovica rozdielu priemeru a SKUTOČNEJ výšky baru
   (--pack-nav-h z ResizeObservera) plus zdvih. Kto zmení DOCK.d alebo DOCK.lift,
   posunie oboch odberateľov naraz a nemusí o nich vedieť. */
:root{--pack-medal-rise:calc(${DOCK.lift}px + (${DOCK.d}px - var(--pack-nav-h, 64px)) / 2);}
/* Miesto, ktoré si medailón drží v lište; kotúč sám je absolútny nad ním. */
.pk-medal-slot{position:relative;align-self:stretch;flex-shrink:0;width:${DOCK.slot}px;}
.pk-medal{
  position:absolute;left:50%;top:50%;z-index:9;
  width:${DOCK.d}px;height:${DOCK.d}px;
  /* ⚠️ Posun doprava je SÚČASŤOU centrovacieho transformu, nie samostatný left.
     S left:calc(50% + Xpx) by sa pri zmene priemeru rozišiel so stredom slotu. */
  transform:translate(calc(-50% + ${DOCK.medalX}px), calc(-50% - ${DOCK.lift}px));
  border-radius:50%;padding:${DOCK.ow}px;
  background:${goldRing};
  box-shadow:
    0 ${(6 + DOCK.shadow * 14).toFixed(0)}px ${(14 + DOCK.shadow * 30).toFixed(0)}px -6px rgba(0,0,0,${(DOCK.shadow * 0.95).toFixed(2)}),
    0 3px 0 -1px rgba(70,46,12,${(DOCK.shadow * 0.6).toFixed(2)}),
    0 0 ${(12 + DOCK.halo * 34).toFixed(0)}px rgba(91,224,240,${(DOCK.halo * 0.9).toFixed(2)}),
    inset 0 1.5px 0 rgba(255,250,228,0.9),
    inset 0 -2px 3px rgba(84,56,14,0.55);
  border:0;cursor:pointer;display:block;
}
.pk-medal-rim{
  display:block;width:100%;height:100%;border-radius:50%;
  padding:${DOCK.iw}px;
  background:linear-gradient(180deg,#12405C,#071019 45%,#02060B);
  box-shadow:inset 0 0 0 1px rgba(0,0,0,0.35);
}
.pk-medal-face{
  position:relative;display:flex;align-items:center;justify-content:center;
  width:100%;height:100%;border-radius:50%;overflow:hidden;
  background:${AINUBIS.surface};
  box-shadow:
    inset 0 2px 4px rgba(255,250,228,0.45),
    inset 0 -8px 14px -6px rgba(0,0,0,0.65),
    inset 0 0 0 1px rgba(0,0,0,0.4);
}
.pk-medal-face img{display:block;height:auto;width:${DOCK.faceW}%;}
.pk-medal-gloss{
  position:absolute;inset:0;border-radius:50%;pointer-events:none;mix-blend-mode:screen;
  background:
    radial-gradient(60% 45% at 34% 18%, rgba(255,255,255,${DOCK.gloss}), transparent 70%),
    linear-gradient(150deg, rgba(255,255,255,${(DOCK.gloss * 0.35).toFixed(2)}) 0%, transparent 42%);
}
.pk-medal-grain{
  position:absolute;inset:0;border-radius:50%;pointer-events:none;
  background:${NAV_GRAIN};background-size:120px 120px;
  mix-blend-mode:multiply;opacity:${DOCK.grain};
}
/* ⚠️ Rozmer napísaný výslovne — SVG si ho z insetov nevezme (viď hlavička súboru). */
.pk-medal-deco{
  position:absolute;top:0;left:0;width:100%;height:100%;
  border-radius:50%;overflow:visible;pointer-events:none;z-index:3;
}
/* Odznak neprečítaných — tie isté farby, aké mal nad plávajúcou guľou. */
.pk-medal-badge{
  position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 4px;
  border-radius:999px;background:${AINUBIS.cyan};color:#03070C;
  font-family:${"'Space Grotesk',system-ui,sans-serif"};font-weight:600;font-size:11px;line-height:18px;
  text-align:center;box-shadow:0 0 0 2px rgba(7,16,25,0.9);pointer-events:none;
}
`;
