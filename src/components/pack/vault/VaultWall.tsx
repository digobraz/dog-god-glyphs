// ════════════════════════════════════════════════════════════════════════════
// AINUBIS · ROVINA NÁSTENKA — MAKETA (24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Nákres `plany/nakres-nastenka-zdroje-2026-09-24.html`. Matej nad ním vybral
// **A1 · B2 · C2 · D2 · E2 · F1**:
//
//   A1  spodná lišta OSTÁVA a pilulka NÁSTENKA ostáva viditeľná. Nástenka je
//       ČÍTANIE (kôš 2), nie úloha — inak by záložka viedla tam, kde sama zmizne.
//       🔴 Preto sa tento povrch NECHOVÁ ako chat: `.akv-top` a `PackBottomNav`
//          ostávajú vykreslené; skrýva sa len nábytok VAULTU (mozog, jeho
//          hľadanie a filtre, prepínač DOGSCROLL/BRAIN).
//   B2  príspevok NEMÁ pilulku typu — druh je PRVÝ ŠTÍTOK v rade (lock §4.3).
//   C2  na karte je packa + štvorica z locku (🐾 uložiť · poslať) a ODPOVEDAŤ.
//       ➕ „použiť" je LEN na odpovedi AINUBISA (zápis do DOG ID), nie na cudzom
//       texte — nemá zmysel zapisovať si do DOG ID vetu suseda.
//   D2  rada od človeka nesie PEČAŤ. Bez percent: „na 64 % overené" predstiera
//       presnosť, ktorú nemáme. Tri polohy — sedí · vault to nepozná · vault
//       hovorí inak (a prečo, po kliknutí).
//   E2  zoznam zdrojov má vlastnú adresu `/pack/ainubis/sources`; odtiaľto naň
//       vedú DVA z troch vchodov (riadok „from" pod odpoveďou a riadok pod
//       mojimi príspevkami). Tretí je päta VAULTu.
//
// 🔴 LEN V DEVE (`import.meta.env.DEV`), rovnako ako maketa chatu. Naostro
//    ostáva pilulka NÁSTENKA zamknutá so „soon".
//    [[feedback_rozostavanu_vec_stavaj_za_zamknute_dvere]]
//
// ⚠️ ŠTVORICA HOVORÍ KITOM, NIE EMOJI. Presne ako `StoryCard.tsx` (Matej
//    22. 9.): `HandPaw` · `HandStar` · `HandForward` · `HandPlus`. Emoji kreslí
//    operačný systém a na každom zariadení inak; výnimku má len mapa.
// ⚠️ MOJE PRÍSPEVKY = TEN ISTÝ ZOZNAM, AKÝ MÁ CHAT (`DEMO_PENDING`). Lock §4.1:
//    objekt má jednu kartu, nech je kdekoľvek. Druhá kópia by sa rozišla.
// ════════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import {
  PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { HandPaw, HandStar, HandForward, HandPlus, HandArrowLeft } from '@/components/pack/HandIcons';
import ainubisFace from '@/assets/ainubis-badge.png';
import { DEMO_WALL, WALL_FILTERS, type WallPost, type SealKind } from './vaultWallDemo';
import { DEMO_PENDING } from './vaultChatDemo';
import { VAULT_SOURCE_TOTALS } from './vaultSources';

/** Meraná šírka stĺpca príspevkov. Tá istá ako vlákno chatu (telo článku
 *  z locku `pack-dizajn-system.md`), nie 832 px obrazovky: nástenka je text,
 *  a príspevok roztiahnutý na 27" sa číta ako tabuľka. */
const WALL_W = 760;

export const VAULT_WALL_CSS = `
/* ── ČO Z VAULTU V TEJTO ROVINE NIE JE ─────────────────────────────────────
   🔴 A1: lišta a roviny OSTÁVAJÚ (na rozdiel od chatu). Mizne len nábytok
   VAULTU — hľadanie v svetoch, jeho filtre a prepínač MOZOG/DOGSCROLL nemajú
   nad nástenkou čo robiť. Mozog sa NEVYKRESĽUJE: plocha ho aj tak celý kryje
   a plátno pod ňou by len prekresľovalo. */
.akv-root[data-plane="wall"] .akv-brain,
.akv-root[data-plane="wall"] .akv-ctl,
.akv-root[data-plane="wall"] .akv-ptools,
.akv-root[data-plane="wall"] .akv-mtools,
.akv-root[data-plane="wall"] .akv-mactions{display:none;}
/* Guľa chatu nad lištou by na nástenke prekryla akcie karty. */
body:has(.akv-root[data-plane="wall"]) .ainubis-launcher{visibility:hidden;pointer-events:none;}

.akw-root{position:absolute;z-index:3;inset:0;display:flex;flex-direction:column;overflow:hidden;
  background:${AINUBIS.surfaceBase};padding-top:var(--akv-top-h,112px);}

/* ── HLAVA — ZÁLOŽKY A FILTRE ──────────────────────────────────────────────
   Záložka mení OBSAH (svorka / moje príspevky), filter je vrstva nad tým istým
   obsahom (lock §1.3). Preto sú to dva rady, nie jeden. */
.akw-head{flex:0 0 auto;width:100%;max-width:${WALL_W + 2 * PACK_SPACE.lg}px;margin:0 auto;
  display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;
  padding:0 ${PACK_SPACE.lg}px ${PACK_SPACE.md}px;border-bottom:1px solid ${AINUBIS.edge};}
.akw-tabs{display:flex;gap:${PACK_SPACE.sm}px;}
.akw-tab{padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkDim};white-space:nowrap;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.micro}px;line-height:15px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
/* Výber je priesvitný TINT — plná plocha patrí jedinému CTA (brand). */
.akw-tab[aria-current="page"]{color:${AINUBIS.ink};background:rgba(${AINUBIS.cyanRGB},0.16);
  border-color:${AINUBIS.edgeStrong};}
.akw-filters{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.akw-fchip{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;line-height:1.35;letter-spacing:0.02em;}
.akw-fchip[aria-pressed="true"]{color:${AINUBIS.cyan};border-color:${AINUBIS.edgeStrong};
  background:rgba(${AINUBIS.cyanRGB},0.16);}

.akw-list{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;
  padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px calc(var(--pack-nav-h,68px) + ${PACK_SPACE.xxl}px);}
.akw-in{max-width:${WALL_W}px;margin:0 auto;display:flex;flex-direction:column;gap:${PACK_SPACE.lg}px;}

/* PÍSANIE JE JEDINÉ CTA NA OBRAZOVKE — preto jediná plná plocha. */
.akw-new{align-self:flex-start;display:flex;align-items:center;gap:${PACK_SPACE.sm}px;cursor:pointer;border:0;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.field}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;line-height:1;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};box-shadow:${AINUBIS.ctaShadow};}
.akw-new:hover{background:${AINUBIS.ctaGradHover};}

/* ── KARTA PRÍSPEVKU ───────────────────────────────────────────────────────
   Jedna kresba pre nástenku, feed aj profil (lock §4.1). Je to KARTA (r16)
   z katalógu blokov, nie nový tvar. */
.akw-post{border-radius:${PACK_R.card}px;border:1px solid ${AINUBIS.edge};
  background:rgba(3,7,12,0.35);overflow:hidden;}
.akw-phead{display:flex;align-items:center;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px 0;}
.akw-av{width:34px;height:34px;flex:0 0 34px;border-radius:${PACK_R.pill}px;
  display:flex;align-items:center;justify-content:center;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.faceBg};
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;line-height:1;color:${AINUBIS.cyan};}
/* 🔴 HLAVIČKA JE MENO A PES, NIC INE (B2). Pilulka typu, ktorú mal nákres v5
   vpravo hore, zanikla — druh nesie prvý štítok dole. */
.akw-who b{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;
  line-height:1.3;color:${AINUBIS.ink};}
.akw-who em{font-style:normal;font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akw-ptxt{margin:${PACK_SPACE.md}px ${PACK_SPACE.lg}px 0;font-size:${PACK_TEXT.body}px;line-height:1.55;
  color:${AINUBIS.inkDim};}
.akw-tags{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin:${PACK_SPACE.md}px ${PACK_SPACE.lg}px 0;}
.akw-tag{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  border:1px solid ${AINUBIS.edge};color:${AINUBIS.inkFaint};}
/* PRVÝ ŠTÍTOK NESIE DRUH. Odlišuje ho FARBA, nie iný tvar ani iné miesto —
   keby mal vlastný tvar, bol by z neho zase typ (B1) pod iným menom. */
.akw-tag.is-kind{border-color:${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};color:${AINUBIS.ctaA};}

/* ODPOVEĎ AINUBISA — jeho vlastný šat vnútri karty človeka. */
.akw-ai{margin:${PACK_SPACE.md}px ${PACK_SPACE.lg}px 0;padding:${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};}
/* Keď mozog o téme nič nemá, blok stratí zlato — nie je to odpoveď, je to
   priznanie. Zlatý lem by mu dal váhu, ktorú nemá. */
.akw-ai.is-blank{border-color:${AINUBIS.edge};background:${AINUBIS.raised};}
.akw-aihd{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.section.letterSpacing};color:${AINUBIS.inkFaint};}
/* MENO JE VŽDY <AI>NUBIS — záporný margin vracia medzeru zjedenú rozstrelením. */
.akw-aihd i{font-style:normal;color:${AINUBIS.aiInk};text-shadow:${AINUBIS.aiShadow};margin-right:-0.22em;}
.akw-aiface{width:20px;height:20px;flex:0 0 20px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.akw-aibody{margin:${PACK_SPACE.sm}px 0 0;font-size:${PACK_TEXT.body}px;line-height:1.55;color:${AINUBIS.inkDim};}
/* RADA — jedna vec, ktorú má človek urobiť. Zhodná s .akc-advice v chate. */
.akw-advice{margin-top:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};
  font-size:${PACK_TEXT.body}px;line-height:1.5;color:${AINUBIS.ink};}
.akw-advice b{display:block;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.ctaA};
  margin-bottom:${PACK_SPACE.sm}px;}
/* RIADOK „FROM" — jediné, čím sa toto líši od diskusného fóra, a zároveň
   PRVÝ Z TROCH VCHODOV do zoznamu zdrojov (voľba E2). */
.akw-from{display:flex;align-items:center;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;
  margin-top:${PACK_SPACE.md}px;padding-top:${PACK_SPACE.md}px;border-top:1px solid ${AINUBIS.ctaEdge};
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akw-ai.is-blank .akw-from{border-top-color:${AINUBIS.edge};}
.akw-from b{font-weight:500;letter-spacing:0.02em;text-transform:none;font-size:${PACK_TEXT.label}px;
  color:${AINUBIS.cyan};}
.akw-from button{margin-left:auto;display:flex;align-items:center;gap:${PACK_SPACE.xs}px;cursor:pointer;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.cyan};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;line-height:1.2;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.akw-from button:hover{border-color:${AINUBIS.edgeStrong};}
.akw-from button .akw-chev{display:inline-flex;transform:rotate(180deg);}
/* ➕ POUŽIŤ — jediná akcia, ktorá na nástenke patrí LEN AINUBISOVI (C2). */
.akw-use{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.md}px;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;line-height:1.35;}
.akw-use:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}

/* ── RADY OD ĽUDÍ + PEČAŤ (D2) ─────────────────────────────────────────────
   🔴 BEZ PERCENT. Tri polohy, každá z tokenov ainubisSkin:
     sedí        → ok (zelená rozjasnená na tmavý podklad)
     nepozná     → tichý cyanový lem, žiadna farba stavu
     hovorí inak → jeho ZLATÁ, nie červená: červená v tomto šate znamená
                   BLOKOVANIE, a rozpor s vaultom nie je zákaz. */
.akw-reps{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;margin:${PACK_SPACE.md}px ${PACK_SPACE.lg}px 0;}
.akw-rep{font-size:${PACK_TEXT.body}px;line-height:1.5;color:${AINUBIS.inkDim};}
.akw-rep b{color:${AINUBIS.ink};font-weight:500;}
.akw-seal{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;margin-left:${PACK_SPACE.sm}px;
  padding:2px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;cursor:default;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1.5;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkFaint};}
.akw-seal.is-fits{border-color:${AINUBIS.okEdge};background:${AINUBIS.okTint};color:${AINUBIS.ok};}
.akw-seal.is-differs{border-color:${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};color:${AINUBIS.ctaA};
  cursor:pointer;}
.akw-why{margin-top:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};
  font-size:${PACK_TEXT.label}px;line-height:1.5;color:${AINUBIS.inkDim};}
.akw-more{display:flex;align-items:center;gap:${PACK_SPACE.xs}px;align-self:flex-start;
  margin-top:${PACK_SPACE.md}px;padding:0;border:0;background:none;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;color:${AINUBIS.cyan};}
.akw-more .akw-chev{display:inline-flex;transform:rotate(180deg);}

/* ── ŠTVORICA + ODPOVEDAŤ (C2) ─────────────────────────────────────────────
   🔴 Žiadna z nich neodnesie človeka preč z nástenky (lock §4.2). */
.akw-foot{display:flex;align-items:center;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;}
.akw-act{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;line-height:1.35;}
.akw-act:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}
.akw-act.is-on{color:${AINUBIS.ctaA};border-color:${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};}
.akw-reply{margin-left:auto;}

/* ── MOJE PRÍSPEVKY ────────────────────────────────────────────────────────
   Ten istý zoznam, aký nesie chat (DEMO_PENDING) — a pod ním DRUHÝ VCHOD
   do zdrojov. Stav je TINT + LEM, nikdy plná plocha. */
.akw-my{display:flex;gap:${PACK_SPACE.md}px;align-items:flex-start;padding:${PACK_SPACE.md}px;
  border-radius:${PACK_R.frame}px;border:1px solid ${AINUBIS.edge};background:rgba(3,7,12,0.35);}
.akw-kind{flex:0 0 auto;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};color:${AINUBIS.inkFaint};
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;line-height:1.4;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.akw-my .akw-mytx{min-width:0;flex:1 1 auto;}
.akw-my b{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.body}px;line-height:1.35;
  color:${AINUBIS.ink};}
.akw-my em{font-style:normal;display:block;margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.label}px;
  line-height:1.45;color:${AINUBIS.inkFaint};}
.akw-myst{flex:0 0 auto;text-align:right;}
.akw-myst u{display:block;text-decoration:none;font-family:${FONT_UI};font-weight:600;
  font-size:${PACK_TEXT.micro}px;line-height:1.6;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.ctaA};}
.akw-myst u.is-ok{color:${AINUBIS.ok};}
.akw-myst u.is-no{color:${AINUBIS.danger};}
.akw-myst i{font-style:normal;display:block;margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
/* VCHOD DO ZDROJOV — tu si o zdroje pýta ten, kto práve niečo posiela. */
.akw-entry{display:flex;align-items:center;gap:${PACK_SPACE.md}px;width:100%;text-align:left;cursor:pointer;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.tile}px;
  border:1px dashed ${AINUBIS.edge};background:rgba(3,7,12,0.30);color:${AINUBIS.inkDim};
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.4;}
.akw-entry:hover{border-color:${AINUBIS.edgeStrong};}
.akw-entry b{margin-left:auto;display:flex;align-items:center;gap:${PACK_SPACE.xs}px;
  font-weight:500;color:${AINUBIS.cyan};white-space:nowrap;}
.akw-entry b .akw-chev{display:inline-flex;transform:rotate(180deg);}

/* Priznanie, že je to maketa. Stojí hneď hore — nie v päte, kam sa nescrolluje. */
.akw-mock{border-radius:${PACK_R.tile}px;border:1px dashed ${AINUBIS.edge};background:${AINUBIS.raised};
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;font-size:${PACK_TEXT.label}px;line-height:1.5;
  color:${AINUBIS.inkFaint};}
.akw-mock b{color:${AINUBIS.cyan};font-weight:600;}

@media (min-width:1024px){
  /* NÁSTENKA JE CELÁ PLOCHA, nie pravý stĺpec vedľa mozgu — mozog v nej nie je.
     Horný pás sa preto musí vrátiť nad celé okno (vo VAULTE začína za panelom)
     a pilulky rovín, ktoré na PC žijú v ľavom bloku VAULTU, sa vracajú hore:
     bez nich by sa z nástenky nedalo prepnúť späť (A1). */
  .akv-root[data-plane="wall"] .akv-top{left:${PACK_SPACE.xl}px;right:${PACK_SPACE.xl}px;}
  .akv-root[data-plane="wall"] .akv-toprow{display:flex;}
  .akv-root[data-plane="wall"] .akv-planes{flex:0 1 420px;}
  .akw-head{max-width:${WALL_W + 2 * PACK_SPACE.xxl}px;padding:0 ${PACK_SPACE.xxl}px ${PACK_SPACE.lg}px;}
  .akw-list{padding:${PACK_SPACE.xl}px ${PACK_SPACE.xxl}px calc(var(--pack-nav-h,68px) + ${PACK_SPACE.xxl}px);}
}
`;

const SEAL_TEXT: Record<SealKind, string> = {
  fits: 'fits the vault',
  unknown: 'the vault doesn’t know this',
  differs: 'the vault says otherwise',
};

const chev = <span className="akw-chev" aria-hidden><HandArrowLeft size={12} /></span>;

function Post({ post, onSources }: { post: WallPost; onSources: () => void }) {
  const [paw, setPaw] = useState(false);
  const [saved, setSaved] = useState(false);
  const [why, setWhy] = useState<number | null>(null);
  return (
    <article className="akw-post">
      <div className="akw-phead">
        <span className="akw-av" aria-hidden>{post.initial}</span>
        <span className="akw-who"><b>{post.who}</b><em>{post.dog}</em></span>
      </div>
      <p className="akw-ptxt">{post.text}</p>
      <div className="akw-tags">
        {post.tags.map((tag, i) => (
          <span key={tag} className={`akw-tag${i === 0 ? ' is-kind' : ''}`}>{tag}</span>
        ))}
      </div>

      <div className={`akw-ai${post.ai.blank ? ' is-blank' : ''}`}>
        <div className="akw-aihd">
          <img className="akw-aiface" src={ainubisFace} alt="" aria-hidden />
          <span><i>AI</i>NUBIS answered first</span>
        </div>
        <p className="akw-aibody">{post.ai.body}</p>
        {post.ai.advice && <div className="akw-advice"><b>Do this</b>{post.ai.advice}</div>}
        <div className="akw-from">
          {post.ai.blank ? (
            <span>from nothing — {post.ai.world.toLowerCase()} is not written yet</span>
          ) : (
            <>
              <span>from</span>
              <b>{post.ai.scrolls} scrolls · {post.ai.world} › {post.ai.circle}</b>
            </>
          )}
          <button type="button" onClick={onSources}>where this comes from{chev}</button>
        </div>
        {!post.ai.blank && (
          <button type="button" className="akw-use">
            <HandPlus size={14} />Write into DOG ID
          </button>
        )}
      </div>

      <div className="akw-reps">
        {post.replies.map((r, i) => (
          <div className="akw-rep" key={r.who}>
            <b>{r.who}:</b> {r.text}
            <span
              className={`akw-seal is-${r.seal}`}
              role={r.why ? 'button' : undefined}
              tabIndex={r.why ? 0 : undefined}
              onClick={r.why ? () => setWhy((w) => (w === i ? null : i)) : undefined}
              onKeyDown={r.why ? (e) => { if (e.key === 'Enter' || e.key === ' ') setWhy((w) => (w === i ? null : i)); } : undefined}
            >
              {SEAL_TEXT[r.seal]}
            </span>
            {r.why && why === i && <div className="akw-why">{r.why}</div>}
          </div>
        ))}
        <button type="button" className="akw-more">{post.moreReplies} more replies from the pack{chev}</button>
      </div>

      {/* ŠTVORICA — packa nahrádza srdce (v DOGYPTe sa hodnotí packami),
          hviezdička ukladá radu do AINUBISA, šípka ju pošle do správy. */}
      <div className="akw-foot">
        <button type="button" className={`akw-act${paw ? ' is-on' : ''}`} onClick={() => setPaw((v) => !v)}
          aria-label="Paws">
          <HandPaw size={14} /><b>{post.paws + (paw ? 1 : 0)}</b>
        </button>
        <button type="button" className={`akw-act${saved ? ' is-on' : ''}`} onClick={() => setSaved((v) => !v)}
          aria-label="Save"><HandStar size={14} /></button>
        <button type="button" className="akw-act" aria-label="Send"><HandForward size={14} /></button>
        <button type="button" className="akw-act akw-reply">Reply</button>
      </div>
    </article>
  );
}

export function VaultWall({ onSources }: { onSources: () => void }) {
  const [tab, setTab] = useState<'pack' | 'mine'>('pack');
  /** Filter je VRSTVA nad tým istým obsahom, nie ďalšia záložka (lock §1.3). */
  const [tag, setTag] = useState<string | null>(null);
  const posts = tag ? DEMO_WALL.filter((p) => p.tags.includes(tag)) : DEMO_WALL;

  return (
    <section className="akw-root" aria-label="Board">
      <header className="akw-head">
        <div className="akw-tabs">
          <button type="button" className="akw-tab" aria-current={tab === 'pack' ? 'page' : undefined}
            onClick={() => setTab('pack')}>The pack</button>
          <button type="button" className="akw-tab" aria-current={tab === 'mine' ? 'page' : undefined}
            onClick={() => setTab('mine')}>My posts</button>
        </div>
        {tab === 'pack' && (
          <div className="akw-filters">
            <button type="button" className="akw-fchip" aria-pressed={tag === null}
              onClick={() => setTag(null)}>everything</button>
            {WALL_FILTERS.map((f) => (
              <button key={f} type="button" className="akw-fchip" aria-pressed={tag === f}
                onClick={() => setTag((v) => (v === f ? null : f))}>{f}</button>
            ))}
          </div>
        )}
      </header>

      <div className="akw-list">
        <div className="akw-in">
          {tab === 'pack' ? (
            <>
              <p className="akw-mock">
                <b>Mock-up.</b> Four posts, written by hand. What is real here is the shape:
                AINUBIS answers first and names the scrolls he answers from — and when the
                vault has nothing on the subject, he says so instead of inventing a source.
              </p>
              <button type="button" className="akw-new"><HandPlus size={14} />Share an experience or a problem</button>
              {posts.map((p) => <Post key={p.id} post={p} onSources={onSources} />)}
              {posts.length === 0 && <p className="akw-mock">Nothing under this tag yet.</p>}
            </>
          ) : (
            <>
              <p className="akw-mock">
                <b>What I sent into the brain, and what happened to it.</b> The same list the
                chat shows — one post, one card, wherever you look at it.
              </p>
              {DEMO_PENDING.map((p) => (
                <div className="akw-my" key={p.text}>
                  <span className="akw-kind">{p.kind}</span>
                  <span className="akw-mytx"><b>{p.text}</b><em>{p.note}</em></span>
                  <span className="akw-myst">
                    <u className={p.status === 'ok' ? 'is-ok' : p.status === 'no' ? 'is-no' : ''}>
                      {p.status === 'ok' ? 'in the brain' : p.status === 'no' ? 'turned down' : 'waiting'}
                    </u>
                    <i>{p.when}</i>
                  </span>
                </div>
              ))}
              {/* DRUHÝ VCHOD DO ZDROJOV (E2). */}
              <button type="button" className="akw-entry" onClick={onSources}>
                The sources this brain stands on
                <b>{VAULT_SOURCE_TOTALS.documents} documents{chev}</b>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
