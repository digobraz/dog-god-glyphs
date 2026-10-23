// HLAVA PROFILU JA — titulka, fotka majiteľa a satelit psov. JEDEN zdroj pre profil
// (`pages/PackMe.tsx`) aj UPRAVIŤ PROFIL (`pages/PackProfile.tsx`) — Matej 23. 10. 2026:
// *„daj náhľad ako bude v realite = meno gradient atď... nech to má človek 1:1"*.
// Úprava hlavy sa preto robí TU a prejaví sa na oboch obrazovkách naraz.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, BRAND_GOLD_BTN } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { sizedUrl } from '@/services/cloudinaryService';
import type { PackDogFull } from '@/hooks/usePackUser';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
export const DOG_FONT = "'Cinzel Decorative', 'Cinzel', serif";

/* Geometria titulky a fotky majiteľa — JEDNO miesto (rovnica, nie meranie po vykreslení).
 * Fotka sedí v titulke a jej spodok vytŕča `OWN_DROP` pod titulku; satelit visí na jej spodku. */
export const COVER_H = { m: 250, pc: 300 };
const OWN = { m: 126, pc: 158 };
const OWN_X = { m: 10, pc: 16 };
const OWN_DROP = 13;
const SAT = { m: 56, pc: 70 };
/* Satelit je zo 3/4 VONKU z fotky majiteľa a len 1/4 v nej (Matej 23. 10.) — jeho spodok
 * visí 3/4 priemeru pod spodkom fotky. Medzera pod fotkou z toho istého čísla, aby satelit
 * nenarazil do čísel (rezerva S.sm nad nimi, čísla majú vlastný margin S.md). */
const SAT_DROP = { m: SAT.m * 3 / 4, pc: Math.round(SAT.pc * 3 / 4) };
const GAP = { m: OWN_DROP + SAT_DROP.m + PACK_SPACE.sm - PACK_SPACE.md, pc: PACK_SPACE.lg + SAT_DROP.pc + PACK_SPACE.sm - PACK_SPACE.md };
/* Fotka psa v šuplíku stojí v OSI fotky majiteľa (Matej 22. 10.) — odsadenie z rovnice. */
const DOG_D = { m: 60, pc: 96 };
const DOG_X = { m: OWN_X.m + OWN.m / 2 - DOG_D.m / 2, pc: OWN_X.pc + OWN.pc / 2 - DOG_D.pc / 2 };
export const RING = `conic-gradient(from 200deg,${LAPIS.edge},${LAPIS.deep},${T.cardEdge},#A3782B,${LAPIS.edge})`;

export const ME_CSS = `
.me-card{ position:relative; border-radius:${PACK_R.card}px; border:1.5px solid ${T.cardEdge}; background:${T.cardGrad}; box-shadow:${T.cardShadow}; overflow:hidden; }
/* Fotka titulky sa ROZPLYNIE do karty maskou (nie prekrytím farbou) — karta má gradient,
 * takže akákoľvek pevná farba na konci by nechala viditeľnú hranu. */
.me-cover{ position:relative; height:${COVER_H.m}px; }
.me-cover::before{ content:''; position:absolute; inset:0; pointer-events:none; background:var(--me-cover, ${T.pageBg}) center var(--me-cover-y, 35%)/cover no-repeat;
  -webkit-mask-image:linear-gradient(180deg, #000 0%, #000 42%, transparent 100%); mask-image:linear-gradient(180deg, #000 0%, #000 42%, transparent 100%); }
.me-cover::after{ content:''; position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(180deg, color-mix(in srgb, ${T.pageBg} 35%, transparent) 0%, transparent 25%); }
.me-cover > *{ position:relative; z-index:1; }
/* UPRAVIŤ PROFIL: titulka sa ťahá prstom hore/dole (poloha = human.coverY). */
.me-cover.drag{ cursor:grab; touch-action:none; user-select:none; }
.me-cover.drag.on{ cursor:grabbing; }
.me-tbar{ display:flex; justify-content:space-between; align-items:flex-start; padding:${S.md}px; }
.me-bones{ display:inline-flex; align-items:center; gap:${S.xs}px; padding:${S.xs}px ${S.md}px; border-radius:${PACK_R.pill}px; cursor:pointer;
  background:${BRAND_GOLD_BTN.grad}; border:1px solid ${BRAND_GOLD_BTN.edge}; color:${BRAND_GOLD_BTN.ink}; box-shadow:${BRAND_GOLD_BTN.glow};
  font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.label}px; letter-spacing:.02em; }
.me-foot{ position:absolute; left:${OWN_X.m + OWN.m + S.sm}px; right:${S.md}px; bottom:-${OWN_DROP}px; }
.me-nm{ margin:0; font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.h2}px; letter-spacing:.14em; color:${T.inkStrong};
  text-transform:uppercase; white-space:nowrap; overflow:hidden; }
.me-lv{ display:flex; flex-direction:column; align-items:flex-start; gap:${S.xs}px; margin-top:${S.sm}px; }
.me-lv > *{ display:inline-flex; align-items:center; gap:${S.xs}px; padding:${S.xs}px ${S.sm}px; border-radius:${PACK_R.pill}px; white-space:nowrap;
  font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; }
.me-dv{ background:${BRAND_GOLD_BTN.grad}; border:1px solid ${BRAND_GOLD_BTN.edge}; color:${BRAND_GOLD_BTN.ink}; }
.me-pt{ background:${T.growGreen}; border:1px solid ${T.growGreen}; color:${T.card}; cursor:pointer; }

.me-under{ position:relative; padding:0 ${S.lg}px ${S.lg}px; }
.me-own{ position:absolute; z-index:3; left:${OWN_X.m}px; top:-${OWN.m - OWN_DROP}px; width:${OWN.m}px; height:${OWN.m}px;
  border-radius:${PACK_R.pill}px; padding:${S.xs}px; background:${RING}; box-shadow:${T.panelShadow}; }
.me-own > button:first-child{ display:block; width:100%; height:100%; padding:0; border:0; border-radius:${PACK_R.pill}px; overflow:hidden; cursor:pointer; background:${T.card}; }
.me-own > button:first-child img{ width:100%; height:100%; object-fit:cover; object-position:50% 14%; display:block; border-radius:${PACK_R.pill}px; border:4px solid ${T.card}; }
.me-own .ini{ display:grid; place-items:center; width:100%; height:100%; font-family:${FONT_TITLE}; font-size:${TX.h1}px; color:${T.inkWarm}; }
.me-sat{ position:absolute; left:50%; transform:translateX(-50%); bottom:-${SAT_DROP.m}px; display:flex; align-items:center;
  padding:0; border:0; background:none; cursor:pointer; }
.me-sat .s{ width:${SAT.m}px; height:${SAT.m}px; border-radius:${PACK_R.pill}px; padding:${S.xs}px; background:${RING}; margin-left:-18px;
  box-shadow:0 0 0 2px ${T.card}, ${T.panelShadow}; }
.me-sat .s:first-child{ margin-left:0; }
.me-sat .s img{ width:100%; height:100%; border-radius:${PACK_R.pill}px; object-fit:cover; display:block; border:2px solid ${T.card}; }
.me-sat .cnt{ position:absolute; right:-${S.sm}px; top:-${S.xs}px; min-width:22px; height:22px; padding:0 ${S.xs}px; border-radius:${PACK_R.pill}px;
  background:${LAPIS.grad}; color:${LAPIS.ink}; border:1.5px solid ${T.card}; display:grid; place-items:center;
  font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.micro}px; }
.me-sat .up{ width:30px; height:30px; border-radius:${PACK_R.pill}px; display:grid; place-items:center; background:${LAPIS.grad};
  box-shadow:${LAPIS_BTN_SHADOW}; border:2px solid ${T.card}; }
.me-sat .up img{ transform:rotate(90deg); }
.me-card.open .me-sat{ bottom:-15px; }

.me-drawer{ margin:0 -${S.lg}px; max-height:0; opacity:0; overflow:hidden; transition:max-height .45s ease, opacity .3s ease;
  background:linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${T.cardEdge} 14%, transparent) 45%, transparent 100%); }
.me-card.open .me-drawer{ max-height:1200px; opacity:1; }
.me-drow{ display:flex; flex-wrap:wrap; align-items:center; gap:${S.sm}px; padding:${S.md}px ${S.sm}px ${S.md}px ${DOG_X.m}px; }
.me-drow:first-child{ padding-top:${S.xxl}px; }
.me-drow + .me-drow{ border-top:1px solid ${T.hairline}; }
.me-drow:last-child{ padding-bottom:${S.xl}px; }
.me-dp{ position:relative; flex:none; width:${DOG_D.m}px; height:${DOG_D.m}px; border-radius:${PACK_R.pill}px; padding:${S.xs}px; background:${RING};
  box-shadow:${T.panelShadow}; border:0; cursor:pointer; }
.me-dp img{ width:100%; height:100%; border-radius:${PACK_R.pill}px; object-fit:cover; display:block; border:2px solid ${T.card}; }
.me-no{ display:inline-flex; align-items:center; background:${LAPIS.grad}; color:${LAPIS.ink}; box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.micro}px; letter-spacing:.02em; padding:0 ${S.sm}px; border-radius:${PACK_R.pill}px;
  border:1.5px solid ${T.card}; white-space:nowrap; }
.me-dp .me-no{ position:absolute; left:50%; bottom:-${S.sm}px; transform:translateX(-50%); }
.me-hg{ flex:1; min-width:0; position:relative; height:56px; padding:0; border:0; background:none; cursor:pointer; }
.me-hg .fa, .me-hg .ba{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:${S.sm}px;
  transition:opacity .45s ease, transform .45s ease; }
.me-hg .fa img{ max-width:100%; max-height:100%; display:block; object-fit:contain; }
.me-hg .ba{ opacity:0; transform:translateY(4px); }
.me-hg .ba b{ font-family:${DOG_FONT}; font-weight:700; font-size:${TX.h2}px; color:${T.inkStrong}; white-space:nowrap; overflow:hidden; }
.me-hg .empty{ font-family:${FONT_UI}; font-size:${TX.label}px; color:${T.inkWarm}; }
.me-drow.flip .me-hg .fa{ opacity:0; transform:scale(.96); }
.me-drow.flip .me-hg .ba{ opacity:1; transform:none; }
.me-dinfo{ flex-basis:100%; max-height:0; opacity:0; overflow:hidden; transition:max-height .45s ease, opacity .3s ease; }
.me-drow.flip .me-dinfo{ max-height:240px; opacity:1; }
.me-dedit{ display:inline-flex; align-items:center; gap:${S.xs}px; margin-top:${S.sm}px; padding:${S.xs}px ${S.md}px; border-radius:${PACK_R.pill}px;
  background:transparent; border:1.5px solid ${LAPIS.edge}; color:${LAPIS.edge}; cursor:pointer;
  font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; }
.me-dedit:hover{ background:${LAPIS.fill}; }
.me-dinfo .none{ color:${T.inkFaint}; font-style:italic; cursor:pointer; }
.me-dinfo p{ margin:${S.xs}px 0 0; font-family:${FONT_UI}; font-size:${TX.label}px; line-height:1.45; color:${T.ink};
  display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden; }
.me-gap{ height:${GAP.m}px; }
.me-card.open .me-gap{ height:0; }

.me-stats{ display:grid; grid-template-columns:repeat(5,1fr); margin:${S.md}px 0 0; padding:${S.sm}px 0; }
.me-stats button{ background:none; border:0; padding:0; cursor:pointer; color:inherit; text-align:center; min-width:0; }
.me-stats b{ display:block; font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.lead}px; color:${T.inkStrong}; line-height:1.2; white-space:nowrap; }
.me-stats b.na{ color:${T.alertRed}; }
.me-stats span{ display:block; font-family:${FONT_UI}; font-size:${TX.micro}px; color:${T.inkWarm}; white-space:nowrap; }
.me-btns{ display:grid; grid-template-columns:1fr 1fr; gap:${S.sm}px; margin-top:${S.md}px; }
.me-btns button{ font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; white-space:nowrap;
  padding:${S.md}px ${S.sm}px; border-radius:${PACK_R.field}px; cursor:pointer; }
.me-cta{ background:${LAPIS.grad}; color:${LAPIS.ink}; border:1px solid ${LAPIS.deep}; box-shadow:${LAPIS_BTN_SHADOW}; }
.me-cta:hover{ background:${LAPIS.gradHover}; }
.me-out{ background:transparent; color:${LAPIS.edge}; border:1.5px solid ${LAPIS.edge}; }
.me-out:hover{ background:${LAPIS.fill}; }
.me-role{ display:flex; margin-top:${S.md}px; }
.me-role .pk-pill{ font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; padding:${S.xs}px ${S.md}px; }
.me-bio{ margin:${S.sm}px 0 0; }
.me-bio p{ margin:0; font-family:${FONT_UI}; font-size:${TX.body}px; line-height:1.45; color:${T.ink};
  display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden; }
.me-bio.full p{ display:block; }
.me-bio .sig{ color:${T.inkWarm}; font-size:${TX.label}px; white-space:nowrap; }
.me-bio .sig b{ font-family:${DOG_FONT}; font-weight:700; }
.me-bio.empty p{ color:${T.inkFaint}; font-style:italic; }
.me-more{ background:none; border:0; padding:0; margin-top:2px; cursor:pointer; font-family:${FONT_UI}; font-weight:500; font-size:${TX.label}px; color:${LAPIS.edge}; }
/* Pás pilulek — pretŕča cez pravý okraj karty, aby bolo vidno, že sa dá ťahať (Matej 22. 10.). */
.me-strip{ display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; margin:${S.sm}px -${S.lg}px 0 0; padding:0 ${S.lg}px 2px 0; }
.me-strip::-webkit-scrollbar{ display:none; }
.me-strip .pk-pill{ flex:none; font-family:${FONT_UI}; font-weight:500; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; padding:${S.xs}px ${S.sm}px; }
.me-strip .pk-pill i{ font-style:normal; letter-spacing:0; }
.me-dinfo .me-strip{ margin-right:-${S.sm}px; padding-right:${S.sm}px; }

.me-tabs{ display:grid; grid-auto-flow:column; grid-auto-columns:1fr; border-bottom:1px solid ${T.hairline}; margin-top:${S.lg}px; }
.me-tabs button{ display:flex; flex-direction:column; align-items:center; gap:${S.xs}px; background:none; border:0; cursor:pointer;
  padding:${S.sm}px 0; font-family:${FONT_UI}; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase;
  color:${T.inkWarm}; white-space:nowrap; }
.me-tabs button img{ opacity:.5; }
.me-tabs button.on{ color:${T.inkStrong}; box-shadow:inset 0 -2px 0 ${T.cardEdge}; }
.me-tabs button.on img{ opacity:1; }
.me-sub{ display:flex; gap:6px; margin-top:${S.sm}px; }
.me-sub .pk-pill{ font-family:${FONT_UI}; font-size:${TX.micro}px; letter-spacing:.14em; text-transform:uppercase; padding:${S.xs}px ${S.md}px; }
.me-sub .pk-pill.on{ background:${LAPIS.fill}; border-color:${LAPIS.edge}; color:${LAPIS.edge}; }
/* Každá karta má TÚ ISTÚ dlaždicu (Matej 22. 10.: „každá položka by mala mať tú istú veľkosť"). */
.me-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-top:4px; }
.me-grid button{ position:relative; aspect-ratio:4/5; padding:0; border:0; overflow:hidden; border-radius:${PACK_R.field}px; background:${T.tileBg}; cursor:pointer; }
.me-grid img{ width:100%; height:100%; object-fit:cover; display:block; }
.me-grid .cap{ position:absolute; left:0; right:0; bottom:0; padding:${S.lg}px ${S.sm}px ${S.sm}px; text-align:left;
  background:linear-gradient(180deg, transparent, color-mix(in srgb, ${T.pageBg} 80%, transparent));
  font-family:${FONT_TITLE}; font-weight:700; font-size:${TX.micro}px; line-height:1.2; color:${LAPIS.ink}; }
.me-tag{ position:absolute; left:4px; top:4px; font-family:${FONT_UI}; font-size:${TX.micro}px; letter-spacing:.14em; background:${LAPIS.grad}; color:${LAPIS.ink}; padding:0 ${S.sm}px; border-radius:${PACK_R.pill}px; }
.me-empty{ padding:${S.xl}px ${S.lg}px; text-align:center; font-family:${FONT_UI}; font-size:${TX.body}px; color:${T.inkWarm}; }

@media (min-width:768px){
  .me-cover{ height:${COVER_H.pc}px; }
  .me-foot{ left:${OWN_X.pc + OWN.pc + S.lg}px; bottom:-${S.lg}px; }
  .me-nm{ font-size:${TX.h1}px; }
  .me-lv{ flex-direction:row; align-items:center; gap:6px; }
  .me-under{ padding:0 ${S.xl}px ${S.xl}px; }
  .me-own{ left:${OWN_X.pc}px; top:-${OWN.pc - S.lg}px; width:${OWN.pc}px; height:${OWN.pc}px; }
  .me-sat{ bottom:-${SAT_DROP.pc}px; }
  .me-sat .s{ width:${SAT.pc}px; height:${SAT.pc}px; }
  .me-gap{ height:${GAP.pc}px; }
  .me-drawer{ margin:0 -${S.xl}px; }
  .me-drow{ padding-left:${DOG_X.pc}px; gap:${S.lg}px; }
  .me-drow:first-child{ padding-top:${S.xxxl}px; }
  .me-dp{ width:${DOG_D.pc}px; height:${DOG_D.pc}px; }
  .me-dp .me-no{ font-size:${TX.label}px; }
  /* PC: heroglyf menší a meno HNEĎ VEDĽA (Matej 22. 10.) — ťuk ukáže bio a pilulky psa. */
  .me-hg{ flex:0 1 auto; height:72px; display:flex; align-items:center; gap:${S.lg}px; }
  .me-hg .fa, .me-hg .ba{ position:static; opacity:1; transform:none; height:100%; }
  .me-hg .ba b{ font-size:${TX.h1}px; }
  .me-drow.flip .me-hg .fa{ opacity:1; transform:none; }
  /* PC: rozbalený šuplík = ako mobil po ťuku — bio a pilulky psa hneď (Matej 23. 10.). */
  .me-dinfo{ padding-left:${DOG_D.pc + S.lg}px; max-height:240px; opacity:1; }
  .me-strip{ margin-right:0; padding-right:0; }
  .me-bio{ max-width:560px; }
  .me-grid{ grid-template-columns:repeat(5,1fr); }
}
`;


/** Poloha titulky v % (0 = horný okraj fotky, 100 = spodný). Prázdne = 35, ako doteraz. */
export const COVER_Y_DEFAULT = 35;

/** TITULKA — BONES · meno · DEVOTION · PÚTNIK. Fotka sa rozplynie do karty maskou.
 *  `onMoveY` = režim UPRAVIŤ: titulka sa ťahá prstom hore/dole a pri pustení sa poloha
 *  odovzdá von (`onMoveEnd`). Ťah je prepočítaný na skutočný presah fotky, aby fotka
 *  išla pod prstom 1:1, nie rýchlejšie ani pomalšie. */
export function MeCover({ cover, coverY, name, devLabel, pilgrimLabel, bones, onBones, onPilgrim, right, onMoveY, onMoveEnd }: {
  cover: string | null;
  coverY?: number;
  name: string;
  devLabel: string;
  pilgrimLabel: string;
  bones: string;
  onBones?: () => void;
  onPilgrim?: () => void;
  right?: ReactNode;
  onMoveY?: (y: number) => void;
  onMoveEnd?: (y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [drag, setDrag] = useState<{ y0: number; p0: number } | null>(null);
  const y = coverY ?? COVER_Y_DEFAULT;
  const url = cover ? sizedUrl(cover, 1200) : null;

  useEffect(() => {
    if (!url || !onMoveY) return;
    const img = new Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  }, [url, onMoveY]);

  // Koľko px fotky presahuje titulku zvisle (background-size: cover). 0 = niet čo posúvať.
  const overflow = () => {
    const el = ref.current;
    if (!el || !nat) return 0;
    const { width: W, height: H } = el.getBoundingClientRect();
    const scale = Math.max(W / nat.w, H / nat.h);
    return Math.max(0, nat.h * scale - H);
  };
  const editable = !!onMoveY && !!url;

  return (
    <div
      ref={ref}
      className={`me-cover${editable ? ' drag' : ''}${drag ? ' on' : ''}`}
      style={url ? ({ '--me-cover': `url(${url})`, '--me-cover-y': `${y}%` } as CSSProperties) : undefined}
      onPointerDown={editable ? (e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDrag({ y0: e.clientY, p0: y });
      } : undefined}
      onPointerMove={editable && drag ? (e) => {
        const ov = overflow();
        if (!ov) return;
        const next = Math.min(100, Math.max(0, drag.p0 - ((e.clientY - drag.y0) / ov) * 100));
        onMoveY?.(Math.round(next));
      } : undefined}
      onPointerUp={editable && drag ? () => { setDrag(null); onMoveEnd?.(y); } : undefined}
      onPointerCancel={editable && drag ? () => { setDrag(null); onMoveEnd?.(y); } : undefined}
    >
      <div className="me-tbar">
        {onBones ? (
          <button type="button" className="me-bones" onClick={onBones} aria-label={`${bones} BONES`}>
            <BrandIcon name="bone" size={16} tint="dark" />
            {bones}
          </button>
        ) : (
          <span className="me-bones" aria-label={`${bones} BONES`}>
            <BrandIcon name="bone" size={16} tint="dark" />
            {bones}
          </span>
        )}
        {right}
      </div>
      <div className="me-foot">
        <h1 className="me-nm">{name}</h1>
        <div className="me-lv">
          <span className="me-dv">
            <BrandIcon name="ankh" size={12} tint="dark" />
            {devLabel}
          </span>
          {onPilgrim ? (
            <button type="button" className="me-pt" onClick={onPilgrim}>
              <BrandIcon name="walk" size={12} tint="white" />
              {pilgrimLabel}
            </button>
          ) : (
            <span className="me-pt">
              <BrandIcon name="walk" size={12} tint="white" />
              {pilgrimLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** FOTKA MAJITEĽA + SATELIT PSOV. Bez `onToggle` je satelit len obraz (náhľad v UPRAVIŤ). */
export function MeOwn({ photo, initial, dogs, open = false, onToggle, onPhoto, photoLabel, toggleLabel, badge }: {
  photo: string | null;
  initial: string;
  dogs: PackDogFull[];
  open?: boolean;
  onToggle?: () => void;
  onPhoto: () => void;
  photoLabel: string;
  toggleLabel?: string;
  badge?: ReactNode;
}) {
  const sat = open ? (
    <span className="up"><BrandIcon name="back" size={13} tint="white" /></span>
  ) : (
    <>
      {dogs.slice(0, 2).map((d) => (
        <span key={d.id} className="s">{d.cloudinary_main_url && <img src={sizedUrl(d.cloudinary_main_url, 140)} alt="" />}</span>
      ))}
      {dogs.length > 2 && <span className="cnt">{dogs.length}</span>}
    </>
  );
  return (
    <div className="me-own">
      <button type="button" onClick={onPhoto} aria-label={photoLabel}>
        {photo ? <img src={sizedUrl(photo, 320)} alt="" /> : <span className="ini">{initial}</span>}
      </button>
      {badge}
      {dogs.length > 0 && (onToggle ? (
        <button type="button" className="me-sat" onClick={onToggle} aria-expanded={open} aria-label={toggleLabel}>{sat}</button>
      ) : (
        <span className="me-sat" aria-hidden>{sat}</span>
      ))}
    </div>
  );
}
