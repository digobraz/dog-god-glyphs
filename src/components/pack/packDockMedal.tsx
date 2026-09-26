// ════════════════════════════════════════════════════════════════════════════
// KOTÚČ V STREDE SPODNÉHO NAVU `/pack` — od 21. 9. 2026 `+`, nie AINUBIS
// ────────────────────────────────────────────────────────────────────────────
// 🔴 ČO SA 21. 9. 2026 ZMENILO A ČO NIE.
//    ZMENILA SA VÝPLŇ: zlatá obruč ostáva, vnútro je LAPISOVÝ DISPLEJ s kresleným `+`.
//    Hlava AINUBISA odišla do vlastnej položky lišty (štvrté miesto chrbtice, routa
//    `/pack/ainubis`) aj s odznakom neprečítaných — bublina „máš odo mňa správu" patrí
//    k tomu, kto ju posiela.
//    NEZMENILA SA GEOMETRIA: `DOCK` (d 74 · lift 1 · slot 90 · ow 5 · medalX 0) je
//    Matejov výber z nákresu zo 4. 9. a ostáva CELÝ. Zadanie: „Čísla DOCK needituj."
//
// 🔵 PREČO LAPIS. Hlavné CTA je lapis (brandový kánon 28. 8. 2026) a `+` je najväčšia
//    akcia v appke. Deliaca čiara brandu: ZLATO = konštrukcia a poloha (obruč, lišta,
//    aktívna pilulka) · LAPIS = moja voľba a akcia. Kotúč nesie oboje naraz — obruč je
//    nábytok, displej je akcia. Medailón na `/onepage` má lapisové vnútro tiež.
//
// ⚠️ V APPKE SÚ DVE `+` A NIKDY NESMÚ VYZERAŤ ROVNAKO (lock `architektura-pack.md` §1.1.1):
//    kotúč v lište = „pridávam do svojho ŽIVOTA" · `+` pri písacom poli AINUBISA =
//    „pridávam do MOZGU". Je to ten istý omyl, ktorý je zapísaný v `PackMap.tsx` (22. 8.):
//    „dve tlačidlá vedľa seba robili DVE RÔZNE veci a vyzerali IDENTICKY."
//
// ⚠️ `+` JE KRESBA Z KITU — `/icons/pack/plus-sign.svg` (Matej 21. 9. 2026 poslal kartu
//    z kitu: „tento plus sign!"). NIE `plus.svg`: ten je „plus v krúžku" a v kotúči z neho
//    boli tri sústredné kruhy. A nie ani geometrický ťah v CSS, ktorý tu bol medzitým —
//    kit má vlastnú ručnú kresbu a tá je brand.
//
// ⚠️ NÁZVY OSTÁVAJÚ `pk-medal*`, `DOCK_MEDAL_CSS`, `--pack-medal-x`, `--pack-medal-rise`.
//    Odoberajú ich CUDZIE súbory (`AinubisWidget.css`, rad nad mapou v `PackMap.tsx`,
//    rozbaľovačka avatara v `PackLayout.tsx`). Premenovanie kvôli kráse by bolo
//    premenovanie identifikátora, ktorý už je nasadený — CLAUDE.md to rieši rovnako
//    ako `/pack` v URL: text pre človeka sa mení, identifikátor nie.
//
// ────────────────────────────────────────────────────────────────────────────
// PÔVODNÁ HLAVIČKA (2026-09-04) — platí všetko okrem toho, kto v kotúči sedí:
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
// ⛔ NEPLATÍ OD 21. 9. 2026 (bod vyššie): „TVÁR JE V AINUBISOVOM BRANDE, OBRUČ
//    V DOGYPTOVOM. Vnútro je jeho tmavomodrý displej + cyan dosvit (`ainubisSkin.ts`)…"
//    Pravidlo bolo správne, kým v kotúči sedel ON. Odkedy v ňom sedí `+`, je vnútro
//    DOGYPTOVE (lapis) — a AINUBISOV brand si nesie jeho vlastná položka lišty.
//
// ⚠️ DVE PASCE GEOMETRIE, obe zdedené z `NavMedallion.tsx` (/onepage) — nezopakuj ich:
//    1. `<svg>` je NAHRADENÝ prvok — z `position:absolute; inset:…` si rozmer NEVEZME,
//       drží default 300×150. Šírka aj výška musia byť napísané.
//    2. Plátno absolútneho potomka = PADDING-box rodiča. Obruč je `padding` (nie
//       `border`), takže `100%` JE priemer aj s ňou a polomer 50 vo viewBoxe je jej hrana.
// ════════════════════════════════════════════════════════════════════════════
import { NAV_GRAIN, LAPIS } from './navGoldSkin';
// Jediné, čo z AINUBISOVHO brandu v tomto súbore ostalo: cyan jeho odznaku.
import { AINUBIS } from './ainubisSkin';
// ⚠️ `ainubis-head.webp` sa odtiaľto 21. 9. 2026 ODSŤAHOVALA do položky lišty AINUBIS
//    (`PackLayout.tsx`) spolu s odznakom neprečítaných. Poznámka o nej ostáva v histórii
//    tohto súboru: bol to ten istý zdroj, aký používajú `Gateways.tsx` a `MapCoach.tsx`,
//    a NIE `ainubis-badge.webp` (hranatý štít sa na kruhovom displeji čítal ako tmavý
//    štvorec — Matej 11. 9. 2026).

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
  // 0 = ŽIADNA ručná náprava. Do 11. 9. 2026 tu stálo +10 px, lebo vľavo bola jedna
  // položka a vpravo dve, takže medailón v toku sedel vľavo od stredu lišty — a keďže
  // rozdiel bol na mobile +10 a na PC +4, jedno číslo obe šírky netrafilo.
  // Odvtedy majú obe krídla lišty rovnaký diel (`1fr auto 1fr` v `PackLayout.tsx`),
  // takže slot medailóna JE stred a posun by ho z neho vyhodil.
  // ⚠️ Kto sa vráti k nesymetrickému radu, vráti aj toto číslo — nie naopak.
  medalX: 0,
  ow: 5,
  // 0 = medailón NEMÁ vnútorný modrý lem, aký má logo na /onepage. Zlato ide priamo
  // na jeho displej — s lemom bol kotúč pri 74 px opticky menší a lem čítal ako tretí kruh.
  iw: 0,
  // 88 = VÝŠKA hlavy v % z displeja (74 px medailón − 2× lem 5 = 64 px).
  // Kým tu sedel odznak so štítom, to isté číslo 72 meralo ŠÍRKU a kresba mala
  // 46,1 × 40,9 px. Hlava bez štítu pri 72 % spadla na 46,1 × 39,2 a Matej si to
  // hneď všimol („obrázok AInubisa v spodnom nave = nebola vačšia?") — nie preto,
  // že by bola menšia o 1,7 px, ale preto, že s čiernou doskou zmizla tmavá masa,
  // ktorá kruh vypĺňala. Pri 88 % má 56,3 × 47,9 px, teda je väčšia než pôvodný
  // odznak v oboch osiach.
  // ⚠️ STROP JE 99 % — nad ním kruh (overflow:hidden) odreže korunu nemesu a bradu.
  //    Odmerané nad alfa kanálom assetu, nie odhadom.
  faceW: 88,
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
          fill={gold}
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
 * KOTÚČ `+` v strede spodného navu — stred chrbtice (lock §1.1: `DOMOV · VON · ⊕ ·
 * AINUBIS · JA`).
 *
 * Nie je to routa a nikdy ňou nebude: `+` neodpovedá na „kde som", odpovedá na „pridávam".
 * Preto `<button>`, nie `NavLink` — a preto nemá aktívny stav.
 *
 * ⚠️ Panel si otvára VOLAJÚCI (`PackBottomNav`), nie tento komponent. Kotúč je kresba
 *    s klikacou plochou; čo sa v paneli ukáže, rozhoduje MIESTO, a to vie lišta.
 */
export function DockPlus({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <span className="pk-medal-slot">
      <button type="button" className="pk-medal" aria-label={label} onClick={onClick}>
        <span className="pk-medal-rim">
          <span className="pk-medal-face">
            {/* Kresba z kitu MASKOU, nie `<img>` s filtrom: filter farbu aproximuje, maska
                ju trafí presne. Zástupná, kým Matej nenakreslí vlastnú (zadanie §6). */}
            <span className="pk-medal-plus" aria-hidden />
            <span className="pk-medal-grain" />
            <span className="pk-medal-gloss" />
          </span>
        </span>
        <Deco />
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
    /* ⚠️ DOSVIT BOL CYAN — to bola AINUBISOVA farba (ainubisSkin.glow) a odišla s ním.
       Číslo DOCK.halo je Matejovo z nákresu a NEMENÍ SA; mení sa len to, čím svieti.
       Zlato je materiál samotnej obruče, takže dosvit prestal byť cudzou farbou a stal
       sa jej vlastným odleskom. Lapis do dosvitu NEPATRÍ: na čiernej stránke by tmavá
       modrá nesvietila vôbec (rovnaká matematika ako „tmavý tint nad pieskom zošedne"). */
    0 0 ${(12 + DOCK.halo * 34).toFixed(0)}px rgba(201,154,63,${(DOCK.halo * 0.9).toFixed(2)}),
    inset 0 1.5px 0 rgba(255,250,228,0.9),
    inset 0 -2px 3px rgba(84,56,14,0.55);
  border:0;cursor:pointer;display:block;
}
.pk-medal-rim{
  display:block;width:100%;height:100%;border-radius:50%;
  padding:${DOCK.iw}px;
  /* Do 21. 9. 2026 tu bol AINUBISOV tmavomodrý displej (#12405C → #02060B). Dnes je to
     LAPIS — plná farebná plocha jediného hlavného CTA v lište. */
  background:${LAPIS.grad};
  box-shadow:inset 0 0 0 1px rgba(0,0,0,0.35);
}
.pk-medal-face{
  position:relative;display:flex;align-items:center;justify-content:center;
  width:100%;height:100%;border-radius:50%;overflow:hidden;
  background:${LAPIS.grad};
  box-shadow:
    inset 0 2px 4px rgba(255,250,228,0.45),
    inset 0 -8px 14px -6px rgba(0,0,0,0.65),
    inset 0 0 0 1px rgba(0,0,0,0.4);
}
/* ── HEKTOROVA PACKA NA DISPLEJI (Matej 26. 9. 2026) ──────────────────────────────
   „vymeniť ikonku na strede namiesto + daj Hektorovu packu". Kresba z kitu
   Hekypaw.svg = /icons/pack/paw.svg — OBRYSOVÁ (Matej 26. 9.: „packu daj obrysovú nie plnú"). Trieda sa volá ďalej .pk-medal-plus,
   lebo je to identifikátor, nie text — kotúč stále znamená „pridávam".
   Nižšie je história plusu; platí pre ňu to isté: kresba z kitu, maskou, nie znak.
   ── (do 26. 9.) PLUS NA DISPLEJI — KRESBA Z KITU, NIE ZNAK ──────────────────────── */
/*
   Matej 21. 9. 2026 poslal kartu z kitu: „tento plus sign!" Je to
   plus-hand-drawn-sign-svgrepo-com.svg z vstupy/vizualna-identita/Icons hand drawn/,
   prekopírovaná sem ako /icons/pack/plus-sign.svg.
   ⚠️ NIE plus.svg, ktorý už v kite je — to je „plus-sign-BUTTON: circle and cross",
      teda plus v KRUHU. V kotúči (sám kruh + zlatá obruč) z neho boli tri sústredné kruhy
      a Matej to vrátil dvakrát: najprv „použi plus sign nie plus v krúžku", potom obrázkom.
   ⚠️ Medzikrok boli dva obdĺžniky v CSS. Vyzeralo to čisto, ale bol to GEOMETRICKÝ znak —
      kit má vlastný, ručne kreslený ťah s nerovnými hranami a ten je brand.
   ⚠️ KRESLÍ SA MASKOU, nie <img> s filtrom: filter farbu aproximuje, maska ju trafí presne.
      Vzor je dlaždica chatu v PackAinubis.tsx.
   ⚠️ Rozmer drží ten istý kľúč, aký držal hlavu AINUBISA — DOCK.faceW je Matejovo číslo
      z nákresu a nemení sa; koeficient len necháva okolo plusu toľko lapisu, koľko
      nechávala hlava. */
.pk-medal-plus{
  display:block;
  width:${(DOCK.faceW * 0.58).toFixed(0)}%;height:${(DOCK.faceW * 0.58).toFixed(0)}%;
  background:#F5F0E4;
  -webkit-mask:url(/icons/pack/paw.svg) center / contain no-repeat;
  mask:url(/icons/pack/paw.svg) center / contain no-repeat;
}
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
/* ── ODZNAK NEPREČÍTANÝCH — od 21. 9. 2026 nad položkou AINUBIS, nie nad kotúčom ──────
   Bublina „máš odo mňa správu" nad plusom by hovorila, že mám niečo PRIDAŤ; číslo patrí
   k tomu, kto ho posiela. Kresba je prevzatá 1:1 z pôvodného .pk-medal-badge.
   ⚠️ PREČO JE TO STÁLE V TOMTO SÚBORE: DOCK_MEDAL_CSS je stylesheet CELEJ LIŠTY (vkladá ho
   PackBottomNav jedným style blokom), nie kotúča. Druhý stylesheet v PackLayout.tsx by bol
   druhé miesto s tými istými farbami — a inline štýl na prvku by tie čísla presťahoval do
   súboru, kde ich stráž check:pack meria proti inej základni. */
.pk-ainu-badge{
  position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 4px;
  border-radius:999px;background:${AINUBIS.cyan};color:#03070C;
  font-family:${"'Space Grotesk',system-ui,sans-serif"};font-weight:600;font-size:11px;line-height:18px;
  text-align:center;box-shadow:0 0 0 2px rgba(7,16,25,0.9);pointer-events:none;
}
`;
