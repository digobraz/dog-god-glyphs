// PROFIL JA — v7 SATELIT (nákres `plany/nakres-profil-satelit-2026-10-22.html`, Matej 22. 10.
// 2026: *„s fotkou a štýlom rozkliku som spokojný"* → text doladený v tej istej noci → *„sprav to na dev"*).
//
// `/pack/profile` = MÔJ PROFIL (kôš 1 — lišta vždy). Texty sa píšu na samostatnej
// obrazovke UPRAVIŤ (`/pack/profile/edit` = editor `PackProfile.tsx`) — aj pilulky a bio psa.
// 🔴 V profile NIE JE žiadne `+` (Matej: *„všetko sa bude upravovať v edit profile okne"*).
//
// Poradie (nákres): TITULKA (meno, DEVOTION, PÚTNIK) · fotka majiteľa so SATELITOM psov
// (ťuk = šuplík psov; ťuk na fotku psa alebo šípku zavrie; ťuk na heroglyf = meno + bio +
// pilulky psa z DOG ID) · 5 ČÍSEL · TLAČIDLÁ · PAWTNER · BIO (3 riadky + more) · PILULKY
// (pás pretŕča vpravo, ťahá sa prstom — žiadne šípky ani automatický pohyb) · KARTY · MRIEŽKA.
//
// 🔴 ČO ZATIAĽ NEMÁ ZDROJ, NESIE ČERVENÚ POMLČKU (Matej 21. 10.). Sledovanie, stories,
//    albumy a uložené prídu so session FEED — karta ostáva, obsah je prázdny stav.
//    Pomlčka nie je nula: nula by tvrdila, že ťa nikto nesleduje.
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackUser, type PackDogFull } from '@/hooks/usePackUser';
import { usePilgrimStats } from '@/components/pack/usePilgrimStats';
import { useProfile, PERSONALITY_OPTIONS, type DogProfileAttrs } from '@/components/pack/profile/packProfile';
import { useScrollState } from '@/components/pack/vault/vaultScrolls';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { devotionLevel } from '@/lib/devotion';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readLocalTrails, readWalkedIds, visibleLocalTrails, tripPath } from '@/components/pack/tripShared';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PILL_CSS, FONT_TITLE, FONT_UI, BRAND_GOLD_BTN } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { sizedUrl } from '@/services/cloudinaryService';
import { shareDog } from '@/lib/useShareCard';
import { useToast } from '@/hooks/use-toast';
import { useT, useLang } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
const DOG_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const TOTAL_SCROLLS = VAULT_WORLDS.reduce((s, w) => s + w.scrolls, 0);
// `posts` nie je v generovaných typoch (tak isto `storyData.ts`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// Staré odkazy mierili do editora (kotvy a parametre) — pošleme ich tam, kam patria,
// inak by `#network` z homepage alebo `?welcome=1` po platbe pristáli na nesprávnej obrazovke.
const EDITOR_HASHES = ['#network', '#pawmates'];
const EDITOR_PARAMS = ['welcome', 'edit'];

// KARTY nad mriežkou (Matej 22. 10.: prvá = všetko, potom príbehy, albumy, výlety; súkromné
// SAVED + DENNÍK sú pod jednou kartou so zámkom, aby sa na mobile zmestilo päť ikon).
// SAVED = polica „uložené" v JA (lock architektura-pack §1.3 a §4.2 🔖).
type Tab = 'all' | 'stories' | 'albums' | 'trips' | 'private';
type Private = 'saved' | 'diary';
type PostTile = { id: string; photo: string; trip: string | null };

/* Geometria titulky a fotky majiteľa — JEDNO miesto (rovnica, nie meranie po vykreslení).
 * Fotka sedí v titulke a jej spodok vytŕča `OWN_DROP` pod titulku; satelit visí na jej spodku. */
const COVER_H = { m: 250, pc: 300 };
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
const RING = `conic-gradient(from 200deg,${LAPIS.edge},${LAPIS.deep},${T.cardEdge},#A3782B,${LAPIS.edge})`;

const ME_CSS = `
.me-card{ position:relative; border-radius:${PACK_R.card}px; border:1.5px solid ${T.cardEdge}; background:${T.cardGrad}; box-shadow:${T.cardShadow}; overflow:hidden; }
/* Fotka titulky sa ROZPLYNIE do karty maskou (nie prekrytím farbou) — karta má gradient,
 * takže akákoľvek pevná farba na konci by nechala viditeľnú hranu. */
.me-cover{ position:relative; height:${COVER_H.m}px; }
.me-cover::before{ content:''; position:absolute; inset:0; pointer-events:none; background:var(--me-cover, ${T.pageBg}) center 35%/cover no-repeat;
  -webkit-mask-image:linear-gradient(180deg, #000 0%, #000 42%, transparent 100%); mask-image:linear-gradient(180deg, #000 0%, #000 42%, transparent 100%); }
.me-cover::after{ content:''; position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(180deg, color-mix(in srgb, ${T.pageBg} 35%, transparent) 0%, transparent 25%); }
.me-cover > *{ position:relative; z-index:1; }
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

/** Pilulky človeka = jeho POVAHA z editora (emoji + meno) + jedna vlastná. */
function humanPills(personality: string[] | undefined, custom: string | undefined, t: (k: string) => string) {
  const out = (personality ?? []).flatMap((v) => {
    const o = PERSONALITY_OPTIONS.find((x) => x.value === v);
    if (!o) return [];
    const key = `pack.profile.personality.${v}`;
    const label = t(key) === key ? o.labelEN : t(key);
    return [{ k: v, emoji: o.emoji ?? '', label }];
  });
  if (custom?.trim()) out.push({ k: 'custom', emoji: '', label: custom.trim() });
  return out;
}

/** Riadok psa v šuplíku. Bio a povaha sú tie isté polia ako v DOG ID (`profile.dogs[id]`). */
function DogRow({ dog, attrs, onClose, onDogId, tx }: {
  dog: PackDogFull;
  attrs: DogProfileAttrs | undefined;
  onClose: () => void;
  onDogId: () => void;
  tx: (key: string, fallback: string) => string;
}) {
  const [flip, setFlip] = useState(false);
  const name = dog.dog_name ?? '';
  const num = dog.pack_number != null ? <span className="me-no">#{dog.pack_number}</span> : null;
  const bio = attrs?.bio?.trim();
  const tags = attrs?.tags?.temperament ?? [];
  return (
    <div className={`me-drow${flip ? ' flip' : ''}`}>
      <button type="button" className="me-dp" onClick={onClose} aria-label={tx('pack.me.closeDogs', 'Hide dogs')}>
        {dog.cloudinary_main_url && <img src={sizedUrl(dog.cloudinary_main_url, 200)} alt="" />}
        {num}
      </button>
      <button type="button" className="me-hg" onClick={() => setFlip((f) => !f)} aria-expanded={flip} aria-label={name}>
        <span className="fa">
          {dog.heroglyph_png_url ? <img src={dog.heroglyph_png_url} alt="" /> : <span className="empty">{name}</span>}
        </span>
        <span className="ba"><b>{name}</b>{num}</span>
      </button>
      <div className="me-dinfo">
          {bio ? <p>{bio}</p> : (
            <p className="none" onClick={onDogId}>{tx('pack.me.dogBioEmpty', 'No bio yet. Write it in DOG ID.')}</p>
          )}
          {tags.length > 0 && (
            <div className="me-strip">
              {tags.map((g) => <span key={g} className="pk-pill">{tx(`pack.dogTag.${g}`, g)}</span>)}
            </div>
          )}
          {/* Môj pes → úprava v DOG ID (Matej 23. 10.: „možnosť upraviť a klikom sa preniesť do /dogs"). */}
          <button type="button" className="me-dedit" onClick={onDogId}>
            <BrandIcon name="pencil" size={12} tint="violet" />
            {tx('pack.me.editDog', 'Edit DOG ID')}
          </button>
      </div>
    </div>
  );
}

export default function PackMe() {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session, devotion, bones, avatarUrl, avatarInitial } = usePackIdentity();
  const uid = session?.user?.id ?? null;
  const { dogs } = usePackUser(uid);
  const { profile } = useProfile();
  const human = profile?.human;
  const meta = (session?.user?.user_metadata ?? {}) as Record<string, string | undefined>;

  const [tab, setTab] = useState<Tab>('all');
  const [priv, setPriv] = useState<Private>('saved');
  const [posts, setPosts] = useState<PostTile[] | null>(null);
  const [brought, setBrought] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [bioFull, setBioFull] = useState(false);
  const [bioLong, setBioLong] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  // ── Meno navonok — tá istá voľba „Zobraziť ako", akú vidia ostatní (`memberDisplayName`).
  const orderName = dogs.map((d) => d.owner_name?.trim()).find(Boolean) ?? '';
  const fullName = (meta.full_name || meta.name || orderName || '').trim();
  const shownName = (() => {
    if (human?.displayAs === 'nickname' && human.nickname?.trim()) return human.nickname.trim();
    if (human?.displayAs === 'packName' && human.packName?.trim()) return human.packName.trim();
    return fullName || session?.user?.email?.split('@')[0] || '';
  })();

  // ── Čísla. Každé z miesta, kde už žije — žiadny druhý výpočet.
  const pilgrim = usePilgrimStats(session?.user?.email ?? '', fullName.split(' ')[0] ?? '');
  const zstate = useScrollState();
  const readScrolls = Object.values(zstate).filter((v) => v === 2).length;
  // prvý prečítaný zvitok nesmie ukázať 0 % — to isté pravidlo ako hlavička AINUBISA
  const studyPct = readScrolls ? Math.max(1, Math.round((readScrolls / Math.max(1, TOTAL_SCROLLS)) * 100)) : 0;
  const dev = devotionLevel(devotion);

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    db.from('posts').select('id, photos, attach').eq('author_id', uid)
      .order('created_at', { ascending: false }).limit(60)
      .then(({ data }: { data: unknown }) => {
        if (!alive) return;
        const rows = (data ?? []) as Array<{ id: string; photos: unknown; attach: Record<string, unknown> | null }>;
        setPosts(rows.flatMap((r) => {
          const photo = Array.isArray(r.photos) ? r.photos.find((p): p is string => typeof p === 'string') : undefined;
          if (!photo) return [];
          const slug = typeof r.attach?.trip_slug === 'string' ? r.attach.trip_slug : null;
          return [{ id: r.id, photo, trip: slug }];
        }));
      });
    supabase.rpc('get_my_network').then(({ data }) => {
      if (!alive) return;
      const n = (data as { level1_count?: number } | null)?.level1_count;
      setBrought(typeof n === 'number' ? n : 0);
    });
    return () => { alive = false; };
  }, [uid]);

  // ── Moje výlety — tá istá množina, z ktorej ráta km PÚTNIK (jedno číslo, jeden zoznam).
  const myTrips = useMemo(() => {
    const all: HeroTrail[] = [...visibleLocalTrails(readLocalTrails()), ...HERO_JOURNEYS, ...HERO_TRAILS];
    const walked = readWalkedIds();
    return all.filter((tr) => walked.has(tr.id));
  }, []);

  const bio = human?.dogVoiceBio?.trim() || human?.bio?.trim() || '';
  const sigDog = human?.dogVoiceBio?.trim() ? dogs[0]?.dog_name : null;
  // „more" len vtedy, keď text naozaj presiahne 3 riadky.
  useLayoutEffect(() => {
    const el = bioRef.current;
    if (el && !bioFull) setBioLong(el.scrollHeight > el.clientHeight + 1);
  }, [bio, bioFull]);

  const firstDog = dogs.find((d) => d.pack_number != null) ?? dogs[0] ?? null;
  const fmt = (n: number) => n.toLocaleString(lang === 'sk' ? 'sk-SK' : 'en-US');

  // Staré odkazy do editora — presmerovať skôr, než sa čokoľvek vykreslí.
  const params = new URLSearchParams(location.search);
  if (EDITOR_HASHES.includes(location.hash) || EDITOR_PARAMS.some((p) => params.has(p))) {
    return <Navigate to={`/pack/profile/edit${location.search}${location.hash}`} replace />;
  }

  const soon = (what: string) => toast({ title: what, description: tx('pack.me.soonFeed', 'Arrives with the FEED.') });

  const invite = async () => {
    if (!firstDog?.pack_number) return;
    const name = firstDog.dog_name ?? '';
    try {
      const r = await shareDog({
        pack: firstDog.pack_number,
        dogName: name,
        imageUrl: firstDog.cloudinary_main_url ?? '',
        shareText: t('share.dogVoice', { dog: name.toUpperCase() }),
      });
      if (r === 'copied') toast({ title: t('sharecard.linkCopied') });
    } catch {
      toast({ title: t('sharecard.failed') });
    }
  };

  const dash = <b className="na" aria-label={tx('pack.me.notYet', 'not yet')}>—</b>;
  const photo = avatarUrl ? sizedUrl(avatarUrl, 320) : null;
  // Titulka = fotka človeka so psom (SNIFFER), inak hlavná fotka prvého psa; bez fotky ostane čierna.
  const coverSrc = human?.buddyPhoto || firstDog?.cloudinary_main_url || null;
  const cover = coverSrc ? sizedUrl(coverSrc, 1200) : null;
  const pills = humanPills(human?.personality, human?.customPersonality, t);

  const TABS: Array<[Tab, string, string]> = [
    ['all', 'layers', tx('pack.me.tabAll', 'All')],
    ['stories', 'play', tx('pack.me.stories', 'Stories')],
    ['albums', 'frame', tx('pack.me.tabAlbums', 'Albums')],
    ['trips', 'map', tx('pack.me.tabTrips', 'Trips')],
    ['private', 'lock', tx('pack.me.tabPrivate', 'Only me')],
  ];

  return (
    <PackLayout>
      <style>{PILL_CSS}</style>
      <style>{ME_CSS}</style>
      <section className={`me-card${open ? ' open' : ''}`}>
        {/* TITULKA — BONES · pozvi · meno · DEVOTION · PÚTNIK */}
        <div className="me-cover" style={cover ? ({ '--me-cover': `url(${cover})` } as CSSProperties) : undefined}>
          <div className="me-tbar">
            <button type="button" className="me-bones" onClick={() => navigate('/pack/profile/edit#network')} aria-label={`${bones} BONES`}>
              <BrandIcon name="bone" size={16} tint="dark" />
              {fmt(bones)}
            </button>
          </div>
          <div className="me-foot">
            <h1 className="me-nm">{shownName}</h1>
            <div className="me-lv">
              <span className="me-dv">
                <BrandIcon name="ankh" size={12} tint="dark" />
                {tx(`pack.ladder.${dev.key}`, dev.name)} {dev.index}
              </span>
              <button type="button" className="me-pt" onClick={() => navigate('/pack/map')} aria-label={tx('pack.map.rankPilgrim', 'Pilgrim')}>
                <BrandIcon name="walk" size={12} tint="white" />
                {tx('pack.map.rankPilgrim', 'Pilgrim')} {pilgrim.level.level}
              </button>
            </div>
          </div>
        </div>

        <div className="me-under">
          {/* FOTKA MAJITEĽA + SATELIT PSOV — ťuk na satelit otvorí šuplík, šípka ho zavrie. */}
          <div className="me-own">
            <button type="button" onClick={() => navigate('/pack/profile/edit?edit=avatar')} aria-label={tx('pack.me.changePhoto', 'Change photo')}>
              {photo ? <img src={photo} alt="" /> : <span className="ini">{avatarInitial}</span>}
            </button>
            {dogs.length > 0 && (
              <button
                type="button"
                className="me-sat"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-label={open ? tx('pack.me.closeDogs', 'Hide dogs') : tx('pack.me.openDogs', 'Show dogs')}
              >
                {open ? (
                  <span className="up"><BrandIcon name="back" size={13} tint="white" /></span>
                ) : (
                  <>
                    {dogs.slice(0, 2).map((d) => (
                      <span key={d.id} className="s">{d.cloudinary_main_url && <img src={sizedUrl(d.cloudinary_main_url, 140)} alt="" />}</span>
                    ))}
                    {dogs.length > 2 && <span className="cnt">{dogs.length}</span>}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="me-drawer" aria-hidden={!open}>
            {dogs.map((d) => (
              <DogRow key={d.id} dog={d} attrs={profile?.dogs?.[d.id]} onClose={() => setOpen(false)} onDogId={() => navigate(`/pack/dogs/${d.id}`)} tx={tx} />
            ))}
          </div>
          <div className="me-gap" />

          {/* 5 ČÍSEL — hneď pod fotkou, bez čiar (Matej 22. 10.). */}
          <div className="me-stats">
            <button type="button" onClick={() => soon(tx('pack.me.followers', 'followers'))}>
              {dash}<span>{tx('pack.me.followers', 'followers')}</span>
            </button>
            <button type="button" onClick={() => soon(tx('pack.me.following', 'following'))}>
              {dash}<span>{tx('pack.me.following', 'following')}</span>
            </button>
            <button type="button" onClick={() => navigate('/pack/profile/edit#network')}>
              <b>{brought == null ? '·' : fmt(brought)}</b>
              <span>{tx('pack.me.brought', 'brought in')}</span>
            </button>
            <button type="button" onClick={() => setTab('trips')}>
              <b>{fmt(pilgrim.km)}</b>
              <span>km</span>
            </button>
            <button type="button" onClick={() => navigate('/pack/ainubis')}>
              <b>{studyPct} %</b>
              <span>{tx('pack.me.studying', 'studying')}</span>
            </button>
          </div>

          <div className="me-btns">
            <button type="button" className="me-cta" onClick={() => navigate('/pack/profile/edit')}>{tx('pack.me.editProfile', 'Edit profile')}</button>
            {/* „Ako ma vidia" zrušené (Matej 23. 10.: „ako ma vidia je teda hlúposť") — na jeho mieste
                POZVI: zdieľa kartu psa, z ktorej rastie číslo „brought in". */}
            <button type="button" className="me-out" onClick={invite}>{tx('pack.me.invite', 'Invite')}</button>
          </div>

          <div className="me-role"><span className="pk-pill">Pawtner</span></div>

          <div className={`me-bio${bioFull ? ' full' : ''}${bio ? '' : ' empty'}`}>
            <p ref={bioRef}>
              {bio || tx('pack.me.bioEmpty', 'What would your dog say about you? Write it in Edit.')}
              {bio && sigDog && <> <span className="sig">— <b>{sigDog}</b></span></>}
            </p>
            {(bioLong || bioFull) && (
              <button type="button" className="me-more" onClick={() => setBioFull((f) => !f)}>
                {bioFull ? tx('pack.me.less', 'less') : tx('pack.me.more', 'more')}
              </button>
            )}
          </div>

          {pills.length > 0 && (
            <div className="me-strip">
              {pills.map((p) => <span key={p.k} className="pk-pill">{p.emoji && <i>{p.emoji}</i>}{p.label}</span>)}
            </div>
          )}

          {/* KARTY — VŠETKO · PRÍBEHY · ALBUMY · VÝLETY · 🔒 (uložené + denník, len ja). */}
          <div className="me-tabs" role="tablist">
            {TABS.map(([k, icon, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
                <BrandIcon name={icon} size={20} tint="dark" />
                {label}
              </button>
            ))}
          </div>

          {tab === 'all' && (
            posts && posts.length > 0 ? (
              <div className="me-grid">
                {posts.map((p) => (
                  <button key={p.id} type="button" onClick={() => p.trip && navigate(`/pack/map/${p.trip}`)}>
                    <img src={sizedUrl(p.photo, 320)} alt="" loading="lazy" />
                    {p.trip && <span className="me-tag">{tx('pack.me.tagTrip', 'Trip')}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="me-empty">{posts == null ? '·' : tx('pack.me.postsEmpty', 'No posts yet. Your trip stories will show up here.')}</div>
            )
          )}
          {tab === 'stories' && <div className="me-empty">{tx('pack.me.storiesEmpty', 'Stories arrive with the FEED.')}</div>}
          {tab === 'albums' && <div className="me-empty">{tx('pack.me.albumsEmpty', 'Albums arrive with the FEED.')}</div>}
          {tab === 'trips' && (
            myTrips.length > 0 ? (
              <div className="me-grid">
                {myTrips.map((tr) => (
                  <button key={tr.id} type="button" onClick={() => navigate(tripPath(tr))}>
                    {tr.photos?.[0] && <img src={sizedUrl(tr.photos[0], 320)} alt="" loading="lazy" />}
                    <span className="cap">{lang !== 'sk' && tr.nameEN ? tr.nameEN : tr.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="me-empty">{tx('pack.me.tripsEmpty', 'No walked trips yet.')}</div>
            )
          )}
          {tab === 'private' && (
            <>
              <div className="me-sub">
                {(['saved', 'diary'] as Private[]).map((k) => (
                  <button key={k} type="button" className={`pk-pill pk-pill--tap${priv === k ? ' on' : ''}`} onClick={() => setPriv(k)}>
                    {k === 'saved' ? tx('pack.me.saved', 'Saved') : tx('pack.me.diary', 'Diary')}
                  </button>
                ))}
              </div>
              <div className="me-empty">
                {priv === 'saved' ? tx('pack.me.savedEmpty', 'What you save will wait here. Only you can see it.') : tx('pack.me.diaryEmpty', 'Your diary arrives with the FEED. Only you can see it.')}
              </div>
            </>
          )}
        </div>
      </section>
    </PackLayout>
  );
}
