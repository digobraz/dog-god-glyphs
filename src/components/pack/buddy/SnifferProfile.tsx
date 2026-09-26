// SNIFFER — „VÁŠ PROFIL" (ty a pes). Nahrádza zoznam „Tvoja karta" v bráne.
// Zadanie: plany/zadanie-sniffer-stavba-2026-09-26.md §2.2 · nákres obrazovka A (a E ho znovupoužije).
//
// JEDNA KARTA NA OBRAZOVKU s počítadlom „1 / N" (kolo 2, Matej 25. 9.: „jeden blok na obraze
// a vidno 1/5… vždy jedna sekcia na view"). Poradie = poradie CELÉHO PROFILU, ktorý vidia
// ostatní (`SnifferFullProfile`), a za ním to, čo vidíš len ty:
//   Základ · Bio a info · Môj rajón · Koho hľadám · Psy · Viditeľnosť a upozornenia
// Kolo 3 (Matej 25. 9. poobede, §7 zadania): VEĽKÉ NADPISY kariet · riadok vyzerá klikateľne
// (šípka, „Doplniť" ako lapisová pilulka) · ťah prstom ide s kartou · bodky a pruh LAPIS ·
// DOLE V KARTE lapisové CTA „Ďalej" · 2/4 = tie isté údaje ako `/pack/profile` (BIO psím
// hlasom, základ, životný štýl, Aký si) + ZNAMENIE z heroglyfu · rajón s nadpisom vľavo a
// JEDNÝM chipom krajiny vpravo · „Koho hľadám" ako samostatná karta · „ukazujem sa v okolí"
// a upozornenia na konci · pri psovi už NIE „+ pes".
// 🔴 ŽIADNE NOVÉ MIESTO NA ÚDAJE (CLAUDE.md „Identita"): človek píše do `pack_profiles.human`
//    (`saveHuman`), pes do `dog_profiles.attrs` (`saveDogAttrs`) — tie isté polia ako profil
//    a DOG ID. Čo doplníš tu, uvidíš tam.
// 📸 FOTKY: `human.buddyPhotos` = všetky v poradí karty; `human.buddyPhoto` = tá, na ktorej
//    ste SPOLU (zelený rám). Brána na serveri chce `buddyPhoto`, takže sa nemení.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { uploadExtraPhoto, withTransform } from '@/services/cloudinaryService';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import { SnifferPinEditor, SnifferCountryChip, defaultCountry } from './SnifferPin';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_AVATAR, PACK_SHADOW, FONT_UI, FONT_TITLE, BRAND_GOLD_BTN,
} from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import {
  saveHuman, saveDogAttrs, emptyDogAttrs,
  ORIENTATION_OPTIONS, RELATIONSHIP_OPTIONS, SMOKE_OPTIONS, DIET_OPTIONS, WORK_OPTIONS, NATIONALITY_OPTIONS,
  PERSONALITY_OPTIONS, MAX_PERSONALITY, SEEK_KIND_OPTIONS,
  DOG_TEMPERAMENT_TAGS, DOG_FITNESS_OPTIONS, DOG_COMPAT_OPTIONS,
  DOG_ALONE_OPTIONS, DOG_SKILL_OPTIONS, DOG_JOY_SUGGESTIONS, DOG_DISLIKED_TYPE_SUGGESTIONS,
  type DogProfileAttrs, type HumanProfile, type Orientation, type PersonalityTag, type TaxonomyOption, type SeekKind,
} from '@/components/pack/profile/packProfile';
import { MAX_DOG_TEMPERAMENT } from '@/components/pack/profile/DogGallery';
import { useLang } from '@/i18n/LanguageContext';
import { zodiacMap, chineseMap } from '@/components/HeroglyphFrame';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { PAWMATE_LIVE } from '@/lib/packFlags';
import { useNavigate } from 'react-router-dom';
import type { BuddySettings, BuddyStepKey } from './buddyGate';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

export interface SnifferProfileDog {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  heroglyph_png_url?: string | null;
}

const MAX_PHOTOS = 6;
const thumb = (u?: string | null) => withTransform(u, 'c_fill,g_auto,w_300,h_400,f_auto,q_auto');

/** Znamenie kreslí TÁ ISTÁ kresba ako malý rámik heroglyfu (`zodiacMap`/`chineseMap`) —
 *  emoji mimo mapy brand nepúšťa (`check:ikony`) a vlastná kresba znamenia už existuje. */
const CSS = `
.sp-pager{width:100%;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;touch-action:pan-y;}
.sp-nav{display:flex;align-items:center;justify-content:center;gap:${PACK_SPACE.md}px;}
.sp-count{min-width:${PACK_SPACE.xxxl}px;text-align:center;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;color:${T.inkWarm};}
.sp-arrow{width:${PACK_SPACE.xl + PACK_SPACE.xs}px;height:${PACK_SPACE.xl + PACK_SPACE.xs}px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;cursor:pointer;
  color:${T.cardSoft};border:1px solid ${BRAND_GOLD_BTN.edge};background:${BRAND_GOLD_BTN.grad};}
.sp-arrow:disabled{opacity:.3;cursor:default;}
/* KARTA = hlavička · telo (jediné, čo sa smie posúvať) · CTA dole v karte */
.sp-card{width:100%;padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;
  transition:transform .25s ease, opacity .25s ease;user-select:none;}
.sp-card.is-drag{transition:none;}
.sp-card textarea,.sp-card input{user-select:text;}
.sp-body{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sp-foot{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;padding-top:${PACK_SPACE.xs}px;}
/* ── BEZ SCROLLU (brána) — heroflow pravidlo: obsah sa zmestí do okna, zmenší sa OBSAH, nie
   vzduch od okraja (PAGE_AIR). Karta berie zvyšok výšky; posúva sa len jej TELO, CTA ostáva. */
.sp-pager--fit{flex:1 1 auto;min-height:0;}
.sp-pager--fit > .sp-card{flex:1 1 auto;min-height:0;}
.sp-pager--fit .sp-body{flex:1 1 auto;min-height:0;overflow-y:auto;}
.sp-pager--fit .sp-slots > .sp-slot{height:clamp(${PACK_SPACE.xxxl + PACK_SPACE.lg}px, 20dvh, ${PACK_SPACE.xxxl * 4}px);}
.sp-photorow{display:flex;flex-wrap:wrap;align-items:flex-end;gap:${PACK_SPACE.md}px;border-top:1px solid ${T.hairline};}
.sp-photorow > .sp-kv{flex:1 1 auto;border-top:0;}
.sp-slots{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.sp-slots > .sp-slot{height:${PACK_SPACE.xxxl * 3}px;width:auto;}
@media (min-width:768px){ .sp-rows2{display:grid;grid-template-columns:1fr 1fr;column-gap:${PACK_SPACE.xl}px;} }
@media (max-height:800px){ .sp-kv > button,.sp-static{padding:${PACK_SPACE.xs}px 0;} }
.sp-dots{display:flex;justify-content:center;gap:${PACK_SPACE.sm}px;}
.sp-dots button{width:${PACK_SPACE.sm}px;height:${PACK_SPACE.sm}px;padding:0;border-radius:${PACK_R.pill}px;border:1px solid ${LAPIS.edge};background:transparent;cursor:pointer;
  transition:width .2s ease, background .2s ease;}
.sp-dots button.is-on{width:${PACK_SPACE.lg}px;background:${LAPIS.edge};}
/* VEĽKÝ NADPIS karty = PACK_HEAD karta (Cinzel 700 / 24 / .14em) */
.sp-head{display:flex;align-items:flex-start;justify-content:space-between;gap:${PACK_SPACE.md}px;}
.sp-head > div{min-width:0;display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.sp-title{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};line-height:1.15;}
.sp-sub{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkDim};}
.sp-sec{margin-top:${PACK_SPACE.sm}px;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};
  display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
.sp-sec b{font-weight:600;letter-spacing:.14em;color:${LAPIS.edge};}
.sp-miss{flex:0 0 auto;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;
  border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;border:1px solid ${LAPIS.edge};${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.12)}}
.sp-ok{flex:0 0 auto;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;color:${T.card};background:${T.growGreen};
  border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;}
/* RIADOK, ktorý VYZERÁ klikateľne (Matej: „ani ma nenapadlo, že klikom sa dá niečo zmeniť") —
   šípka vpravo, podklad pri hover a prázdna hodnota ako lapisová pilulka „Doplniť". */
.sp-kv{border-top:1px solid ${T.hairline};}
.sp-kv > button{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;width:100%;padding:${PACK_SPACE.sm}px ${PACK_SPACE.sm}px;background:none;border:0;cursor:pointer;text-align:left;
  border-radius:${PACK_R.tile}px;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkDim};transition:background .15s ease;}
.sp-kv > button:hover{background:${T.tileBg};}
.sp-kv > button > span{flex:1 1 auto;}
.sp-kv > button > b{font-weight:600;color:${T.inkStrong};text-align:right;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sp-kv > button > b.is-todo{font-size:${PACK_TEXT.label}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${LAPIS.edge};
  ${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.12)}}
.sp-kv > button > i{flex:0 0 auto;width:${PACK_SPACE.sm}px;height:${PACK_SPACE.sm}px;border-right:2px solid ${LAPIS.edge};border-bottom:2px solid ${LAPIS.edge};
  transform:rotate(-45deg);transition:transform .15s ease;}
.sp-kv > button[aria-expanded="true"] > i{transform:rotate(45deg);}
.sp-kv .bd-edit{margin:0 0 ${PACK_SPACE.sm}px;}
.sp-static{display:flex;justify-content:space-between;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px;border-top:1px solid ${T.hairline};
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkDim};}
.sp-static b{font-weight:600;color:${T.inkStrong};}
.sp-slot{position:relative;aspect-ratio:3/4;border-radius:${PACK_R.tile}px;overflow:hidden;border:1px dashed ${T.border};background:${T.tileBg};
  display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.h2}px;color:${LAPIS.edge};padding:0;}
.sp-slot img{width:100%;height:100%;object-fit:cover;display:block;}
.sp-slot.is-together{border:2px solid ${T.growGreen};}
.sp-slot__tag{position:absolute;left:${PACK_SPACE.xs}px;bottom:${PACK_SPACE.xs}px;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;
  color:${T.card};background:${T.growGreen};border-radius:${PACK_R.pill}px;padding:0 ${PACK_SPACE.xs}px;}
.sp-photo-menu{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
/* 2/4 BIO A INFO — citát psa, potom chipy (Matej: „je to nevýrazné (bez chipov…)") */
.sp-quote{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sp-quote > span{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.lead}px;line-height:1.25;color:${T.inkStrong};}
.sp-area{width:100%;min-height:${PACK_SPACE.xxxl + PACK_SPACE.lg}px;resize:vertical;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.sp-chips{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.sp-chip{position:relative;display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkStrong};border:1px solid ${T.border};background:${T.cardSoft};white-space:nowrap;}
.sp-chip.is-empty{font-weight:500;color:${T.inkFaint};border-style:dashed;cursor:pointer;}
.sp-chip.is-set{border-color:${LAPIS.edge};${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.12)}}
.sp-chip select{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;}
.sp-chip.is-tap{cursor:pointer;}
.sp-chip.is-ro{background:${T.tileBg};}
.sp-chip > img{width:${PACK_SPACE.lg}px;height:${PACK_SPACE.lg}px;object-fit:contain;}
.sp-pills .pk-pill.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
/* PES — živší: veľká fotka, heroglyf na jej rohu, meno Cinzel Decorative (oficiálny povrch) */
.sp-dogh{display:flex;align-items:center;gap:${PACK_SPACE.lg}px;}
.sp-dogh__ph{position:relative;flex:0 0 auto;width:${PACK_AVATAR.lg + PACK_SPACE.xxl}px;height:${PACK_AVATAR.lg + PACK_SPACE.xxl}px;}
.sp-dogh__ph > img:first-child{width:100%;height:100%;border-radius:${PACK_R.card}px;object-fit:cover;border:2px solid ${T.accentGold};box-shadow:${PACK_SHADOW.card};}
.sp-dogh__hg{position:absolute;right:-${PACK_SPACE.sm}px;bottom:-${PACK_SPACE.sm}px;width:${PACK_AVATAR.sm}px;height:${PACK_AVATAR.sm}px;border-radius:${PACK_R.tile}px;
  object-fit:contain;background:${T.card};border:1px solid ${T.border};box-shadow:${PACK_SHADOW.card};}
.sp-dogh__txt{min-width:0;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sp-dogh__txt b{font-family:'Cinzel Decorative','Cinzel',serif;font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.1;color:${T.inkStrong};}
@media (max-height:700px){
  /* Veta „zatiaľ 1:1" ustúpi — pilulky samy nesú „od 12/2026" (SE by pretiekol o 29 px). */
  .sp-onetoone{display:none;} .sp-dogh__ph{width:${PACK_AVATAR.lg}px;height:${PACK_AVATAR.lg}px;} .sp-dogh__txt b{font-size:${PACK_TEXT.h2}px;} }
/* 1/6 ZÁKLAD — štyri polia v mriežke 2×2 (Matej 25. 9.: „obsah sa v bloku scroluje, čo je
   hlúposť! daj tie info kľudne do 2×2 mriežky"). Dlaždica = popis nad hodnotou, editor pod mriežkou. */
.sp-grid{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;}
.sp-tile{display:flex;flex-direction:column;align-items:flex-start;gap:${PACK_SPACE.xs}px;min-width:0;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${T.hairline};background:${T.tileBg};cursor:pointer;text-align:left;font-family:${FONT_UI};position:relative;}
.sp-tile:hover,.sp-tile[aria-expanded="true"]{border-color:${LAPIS.edge};}
.sp-tile > span{font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.sp-tile > b{max-width:100%;font-size:${PACK_TEXT.body}px;font-weight:600;color:${T.inkStrong};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sp-tile > b.is-todo{color:${LAPIS.edge};}
.sp-tile > i{position:absolute;right:${PACK_SPACE.md}px;top:50%;width:${PACK_SPACE.sm}px;height:${PACK_SPACE.sm}px;margin-top:-${PACK_SPACE.xs}px;
  border-right:2px solid ${LAPIS.edge};border-bottom:2px solid ${LAPIS.edge};transform:rotate(-45deg);}
.sp-tile.is-static{cursor:default;}
.sp-editor{padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:${T.tileBg};border:1px solid ${LAPIS.edge};
  display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
/* 4/6 HĽADÁME — na PC dva stĺpce, aby sa karta zmestila bez posúvania */
@media (min-width:768px){ .sp-cols{display:grid;grid-template-columns:1fr 1fr;column-gap:${PACK_SPACE.xl}px;align-items:start;} }
.sp-cols > div{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
/* Nízke okno: šípky nad kartou sú navyše (listuje sa ťahom, bodkami aj CTA s „2 / 6") — ustúpia prvé. */
@media (max-width:767px){ .sp-card{gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.md}px;} }
@media (max-height:700px){ .sp-nav{display:none;} }
@media (max-width:767px){ .sp-cols .bd-pills{gap:${PACK_SPACE.xs}px;} .sp-cols .sp-sec{margin-top:${PACK_SPACE.xs}px;} }
.sp-pawtner{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px dashed ${LAPIS.edge};line-height:1.3;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
/* 5/6 PSI — jedna karta, prepínač psov svorky nad ňou (multipes) */
.sp-dogtabs{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.sp-dogtabs button{display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px ${PACK_SPACE.xs}px ${PACK_SPACE.xs}px;
  border-radius:${PACK_R.pill}px;border:1px solid ${T.border};background:${T.cardSoft};cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkStrong};}
.sp-dogtabs button img{width:${PACK_AVATAR.xs}px;height:${PACK_AVATAR.xs}px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.sp-dogtabs button.is-on{border-color:${LAPIS.edge};${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.12)}}
.sp-dogtabs button i{width:${PACK_SPACE.sm}px;height:${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;background:${T.growGreen};}
.sp-dogtabs button i.is-todo{background:${LAPIS.edge};}
/* posledná karta — prepínače */
.sp-sw{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px 0;border-top:1px solid ${T.hairline};
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};cursor:pointer;}
.sp-sw > span{display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.sp-sw small{font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
/* iPhone SE a nižšie (kolo 6) — NA KONCI, aby prebil základné pravidlá vyššie: Základ pretiekol o 61 px, Hľadáme o 104 px. Zmenšuje sa OBSAH
   (PAGE_AIR lock) — nadpis o stupeň, fotky, pilulky volieb a pás pawtnera; vzduch ostáva. */
@media (max-height:700px){
  .sp-title{font-size:${PACK_TEXT.h2}px;}
  .sp-pager--fit .sp-slots > .sp-slot{height:13dvh;}
  .sp-cols .bd-pills .pk-pill{padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;font-size:${PACK_TEXT.label}px;line-height:1.2;}
  .sp-pawtner{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;}
  .sp-body{gap:${PACK_SPACE.xs}px;}
  .sp-tile{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;}
  .sp-cols .sp-sec{margin-top:0;}
  .sp-pawtner{font-size:${PACK_TEXT.label}px;}
}
`;

function Pills({ options, selected, onToggle, disabled }: {
  options: Array<{ value: string; label: string }>; selected: readonly string[]; onToggle: (v: string) => void; disabled?: (v: string) => boolean;
}) {
  return (
    <div className="bd-pills sp-pills">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={selected.includes(o.value)} disabled={disabled?.(o.value)}
          className={`pk-pill pk-pill--tap${selected.includes(o.value) ? ' is-on' : ''}`}
          onClick={() => onToggle(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

/** Chip s výberom — hodnota je lapisová (moja voľba), prázdny je čiarkovaný. Natívny
 *  select leží pod chipom, takže na mobile otvorí systémový výber. */
function ChipSelect<V extends string>({ emoji, placeholder, options, value, onChange, label }: {
  emoji?: string; placeholder: string; options: TaxonomyOption<V>[]; value?: V; onChange: (v: V | undefined) => void; label: (o: TaxonomyOption<V>) => string;
}) {
  const cur = options.find((o) => o.value === value);
  return (
    <label className={`sp-chip is-tap ${cur ? 'is-set' : 'is-empty'}`}>
      {(cur?.emoji ?? emoji) && <span aria-hidden>{cur?.emoji ?? emoji}</span>}
      {cur ? label(cur) : placeholder}
      <select value={value ?? ''} aria-label={placeholder} onChange={(e) => onChange((e.target.value || undefined) as V | undefined)}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.emoji ? `${o.emoji} ` : ''}{label(o)}</option>)}
      </select>
    </label>
  );
}

const toggle = <V extends string>(arr: readonly V[], v: V) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

interface Slide { key: string; title: string; sub?: string; right?: ReactNode; body: ReactNode }

export function SnifferProfile({
  tx, uid, name, human, dogs, dogAttrsOf, heroGender, zodiac, homeCountry, audienceEditor, missing, gateEditor, gateSummary,
  settings, onPatch, finish, fit = false, basicsAside,
}: {
  tx: Tx;
  uid: string | null;
  name: string;
  human: HumanProfile | undefined;
  dogs: SnifferProfileDog[];
  dogAttrsOf: (id: string) => DogProfileAttrs | undefined;
  /** Pohlavie z heroglyfu — keď je, SNIFFER sa naň nepýta (Matej 25. 9.). */
  heroGender: string | null;
  /** Znamenie z malého rámika heroglyfu (Matej 25. 9.: „chýba nám tu znamenie"). */
  zodiac?: { western?: string | null; chinese?: string | null };
  /** Krajina z heroflow (2. krok) — predvolí krajinu rajónu. */
  homeCountry?: string | null;
  /** Komu sa ukážem po častiach — karta Hľadáme ich delí do dvoch stĺpcov. */
  audienceEditor?: (part: 'who' | 'dogs') => ReactNode;
  missing: BuddyStepKey[];
  /** Editory bodov brány, ktoré žijú v `PackBuddy` (meno, vek, pohlavie, bydlisko, zámery, komu). */
  gateEditor: (k: BuddyStepKey) => ReactNode;
  gateSummary: (k: BuddyStepKey) => string;
  settings: BuddySettings;
  onPatch: (p: Partial<BuddySettings>) => unknown;
  /** Posledná karta: zapnutie SNIFFERa (brána). Bez neho posledná karta CTA nemá (nastavenia). */
  finish?: { label: string; onClick: () => void; busy?: boolean; note?: ReactNode };
  /** Obrazovka bez scrollu (brána): karta berie zvyšok výšky okna a obsah sa zmenší, nie stránka. */
  fit?: boolean;
  /** Vpravo dole v karte Základ, vedľa fotiek — v nastaveniach tam sedí zapnutie SNIFFERa. */
  basicsAside?: ReactNode;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [allTraits, setAllTraits] = useState(false);
  const { lang } = useLang();
  const [iso, setIso] = useState(() => defaultCountry(human?.pin, human?.nationality, lang, homeCountry));
  useEffect(() => { if (!human?.pin?.country && homeCountry) setIso(homeCountry.toLowerCase()); }, [homeCountry, human?.pin?.country]);
  const [dogIdx, setDogIdx] = useState(0);
  const navigate = useNavigate();
  useEffect(() => { if (human?.pin?.country) setIso(human.pin.country.toLowerCase()); }, [human?.pin?.country]);

  /** Jeden riadok karty: popis · hodnota (alebo „Doplniť") · šípka · ťuk otvorí editor pod ním. */
  const row = (id: string, label: string, value: string, body: ReactNode, todo = false) => {
    const isOpen = open === id;
    return (
      <div key={id} className="sp-kv">
        <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : id)}>
          <span>{label}</span>
          <b className={todo ? 'is-todo' : ''}>{todo ? tx('pack.buddy.fill', 'Fill in') : value || '—'}</b>
          <i aria-hidden />
        </button>
        {isOpen && <div className="bd-edit">{body}</div>}
      </div>
    );
  };
  const gateRow = (k: BuddyStepKey, label: string) =>
    row(k, label, gateSummary(k), gateEditor(k), missing.includes(k));
  /** Dlaždica 2×2: popis nad hodnotou; editor sa otvorí POD mriežkou (nie v nej, aby ju nerozbil). */
  const tile = (k: BuddyStepKey, label: string, editable = true) => {
    const todo = missing.includes(k);
    return editable ? (
      <button key={k} type="button" className="sp-tile" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)}>
        <span>{label}</span>
        <b className={todo ? 'is-todo' : ''}>{todo ? tx('pack.buddy.fill', 'Fill in') : gateSummary(k)}</b>
        <i aria-hidden />
      </button>
    ) : (
      <div key={k} className="sp-tile is-static"><span>{label}</span><b>{gateSummary(k)}</b></div>
    );
  };
  const BASIC_KEYS: BuddyStepKey[] = ['name', 'age', 'gender', 'region'];

  const badge = (keys: BuddyStepKey[]) => {
    const n = keys.filter((k) => missing.includes(k)).length;
    return n > 0
      ? <span className="sp-miss">{tx('pack.sniffer.profile.missing', '{n} missing', { n })}</span>
      : <span className="sp-ok">{tx('pack.sniffer.profile.done', 'Done')}</span>;
  };

  const photos = (human?.buddyPhotos?.length ? human.buddyPhotos : human?.buddyPhoto ? [human.buddyPhoto] : []);
  const opt = (v?: string | null) => (v ? tx(`pack.dogCard.opt.${v}`, v) : '');
  const tag = <V extends string>(o: TaxonomyOption<V>) => tx(`pack.profileTag.${o.value}`, o.labelEN);
  const personality = human?.personality ?? [];
  const traitsTotal = personality.length + (human?.customPersonality ? 1 : 0);

  const slides: Slide[] = [
    {
      key: 'basics',
      title: tx('pack.sniffer.profile.basics', 'Basics'),
      sub: tx('pack.sniffer.profile.tapHint', 'Tap a row to change it'),
      right: badge(['name', 'age', 'gender', 'region', 'photo']),
      body: (
        <>
          <div className="sp-grid">
            {tile('name', tx('pack.buddy.step.name', 'Name'))}
            {tile('age', tx('pack.buddy.step.age', 'Age'))}
            {tile('gender', tx('pack.buddy.step.gender', 'Gender'), !heroGender)}
            {tile('region', tx('pack.buddy.step.region', 'Where you live'))}
          </div>
          {open && (BASIC_KEYS as string[]).includes(open) && <div className="sp-editor">{gateEditor(open as BuddyStepKey)}</div>}
          <div className="sp-photorow">
            <PhotoSlots uid={uid} photos={photos} together={human?.buddyPhoto ?? null} tx={tx} />
            {basicsAside}
          </div>
        </>
      ),
    },
    {
      // 2/4 = tie isté polia ako `/pack/profile` (Matej: „su prepojene s profilom").
      // Nadpis LEN „BIO", podnadpis pár slov, otázka psa ide do placeholdera (Matej 25. 9.).
      key: 'bio',
      title: tx('pack.sniffer.profile.bioTitle', 'Bio'),
      sub: tx('pack.sniffer.profile.bioSub', 'A few words about me'),
      body: (
        <>
          <label className="sp-quote">
            <textarea className="pf-field sp-area" defaultValue={human?.dogVoiceBio ?? ''} maxLength={900}
              aria-label={tx('pack.sniffer.profile.bioTitle', 'Bio')}
              placeholder={tx('pack.sniffer.profile.bioPh2', 'What would my dog probably say about me…')}
              onBlur={(e) => { const v = e.target.value.trim(); if (v !== (human?.dogVoiceBio ?? '')) void saveHuman({ dogVoiceBio: v || undefined }); }} />
          </label>

          <span className="sp-sec">{tx('pack.profile.basics', 'The basics')}</span>
          <div className="sp-chips">
            {zodiac?.western && (
              <span className="sp-chip is-ro" title={tx('heroglyph.flow.ownerZodiac.westernLabel', 'Zodiac sign')}>
                {zodiacMap[zodiac.western] && <img src={zodiacMap[zodiac.western]} alt="" />}
                {tx(`heroglyph.flow.ownerZodiac.sign.${zodiac.western}`, zodiac.western)}
              </span>
            )}
            {zodiac?.chinese && (
              <span className="sp-chip is-ro" title={tx('heroglyph.flow.ownerZodiac.chineseLabel', 'Chinese zodiac')}>
                {chineseMap[zodiac.chinese] && <img src={chineseMap[zodiac.chinese]} alt="" />}
                {tx(`heroglyph.flow.ownerZodiac.animal.${zodiac.chinese}`, zodiac.chinese)}
              </span>
            )}
            <span className="sp-chip is-ro"><BrandIcon name="paw" size={PACK_SPACE.lg} tint="dark" />
              {dogs.length} {dogs.length === 1 ? tx('pack.profile.dogOne', 'dog') : tx('pack.profile.dogMany', 'dogs')}</span>
            <ChipSelect placeholder={tx('pack.profile.nationality', 'Nationality')} options={NATIONALITY_OPTIONS}
              value={human?.nationality ?? 'SK'} label={(o) => o.abbr ?? o.labelEN}
              onChange={(v) => void saveHuman({ nationality: v })} />
            <ChipSelect placeholder={tx('pack.sniffer.info.orientation', 'Orientation')}
              options={ORIENTATION_OPTIONS} value={human?.orientation}
              label={(o) => tx(`pack.sniffer.info.orientation.${o.value}`, o.labelEN)}
              onChange={(v) => void saveHuman({ orientation: v as Orientation | undefined })} />
            {/* ORIENTÁCIA (kolo 2) — GDPR čl. 9: von ide LEN s vlastným súhlasom, predvolene skrytá. */}
            {human?.orientation && (
              <button type="button" className={`sp-chip is-tap${human.orientationPublic ? ' is-set' : ''}`}
                onClick={() => void saveHuman({ orientationPublic: !human.orientationPublic })}>
                {human.orientationPublic ? tx('pack.sniffer.profile.shown', 'visible') : tx('pack.sniffer.profile.hidden', 'hidden')}
              </button>
            )}
          </div>

          <span className="sp-sec">{tx('pack.profile.lifestyle', 'Lifestyle')}</span>
          <div className="sp-chips">
            <ChipSelect placeholder={tx('pack.profile.statusPlaceholder', 'Status')} options={RELATIONSHIP_OPTIONS}
              value={human?.relationship} label={tag} onChange={(v) => void saveHuman({ relationship: v })} />
            <ChipSelect placeholder={tx('pack.profile.smokePlaceholder', 'Smoke')} options={SMOKE_OPTIONS}
              value={human?.smoke} label={(o) => tx(`pack.sniffer.profile.smoke.${o.value}`, o.value === 'yes' ? 'I smoke' : 'I don’t smoke')}
              onChange={(v) => void saveHuman({ smoke: v })} />
            <ChipSelect placeholder={tx('pack.profile.dietPlaceholder', 'Diet')} options={DIET_OPTIONS}
              value={human?.diet} label={tag} onChange={(v) => void saveHuman({ diet: v })} />
            <ChipSelect placeholder={tx('pack.profile.workPlaceholder', 'Work')} options={WORK_OPTIONS}
              value={human?.work} label={tag} onChange={(v) => void saveHuman({ work: v })} />
          </div>

          <span className="sp-sec">{tx('pack.profile.whatYoureLike', 'What you’re like')} <b>{traitsTotal}/{MAX_PERSONALITY}</b></span>
          {/* Vybrané ako lapisové chipy; celá paleta až na ťuk — inak by 20 pilulek vytlačilo kartu z okna. */}
          {allTraits ? (
            <Pills
              options={PERSONALITY_OPTIONS.map((o) => ({ value: o.value, label: `${o.emoji ?? ''} ${tag(o)}`.trim() }))}
              selected={personality}
              disabled={(v) => !personality.includes(v as PersonalityTag) && traitsTotal >= MAX_PERSONALITY}
              onToggle={(v) => void saveHuman({ personality: toggle(personality, v as PersonalityTag) })}
            />
          ) : (
            <div className="sp-chips">
              {PERSONALITY_OPTIONS.filter((o) => personality.includes(o.value)).map((o) => (
                <span key={o.value} className="sp-chip is-set">{o.emoji && <span aria-hidden>{o.emoji}</span>}{tag(o)}</span>
              ))}
              {human?.customPersonality && <span className="sp-chip is-set">{human.customPersonality}</span>}
            </div>
          )}
          <button type="button" className="sp-chip is-tap is-empty" style={{ alignSelf: 'flex-start' }} onClick={() => setAllTraits(!allTraits)}>
            {allTraits ? tx('pack.sniffer.profile.traitsDone', 'Done') : `+ ${tx('pack.sniffer.profile.traitsEdit', 'Change')}`}
          </button>
        </>
      ),
    },
    {
      // RAJÓN (Matej: „nadpis naľavo a chip napravo a možnosť vybrať iný").
      key: 'patch',
      // Zjednotené s `full.patch` (audit: „Náš rajón" vs „Môj rajón" — pin je vždy MÔJ, nie SPOLOČNÝ).
      title: tx('pack.sniffer.profile.patchTitle', 'My patch'),
      sub: tx('pack.sniffer.profile.patchSub', 'Where we spend most of our time'),
      right: <SnifferCountryChip iso={iso} onPick={setIso} tx={tx} />,
      body: (
        <>
          <SnifferPinEditor tx={tx} pin={human?.pin} iso={iso} radiusKm={settings.radius_km}
            onRadius={(km) => void onPatch({ radius_km: km })} />
          <p className="bd-note">{tx('pack.sniffer.pin.note2', 'Tap inside the country to drop your pin · others only see how far you are')}</p>
        </>
      ),
    },
    {
      // HĽADÁME (Matej 25. 9.: „úvodná pasáž parťáka / pár, svorku / skupinu · možnosť pridať
      // pawtnera (na výlety chodíme spoločne s pawtnerom) · komu sa ukážem = mužom, ženám, svorkám").
      key: 'seek',
      title: tx('pack.sniffer.profile.seekTitle2', 'We’re looking for'),
      right: badge(['intents', 'audience']),
      body: (
        // ROZLOŽENIE (Matej 25. 9.): vľavo KOHO · KOMU · VEK, vpravo NA ČO a psí filter.
        <div className="sp-cols">
          <div>
            <span className="sp-sec">{tx('pack.sniffer.profile.seekWho', 'Who')}</span>
            {/* PÁRY · SVORKY · SKUPINY ZAPARKOVANÉ do 12/2026 (Matej 26. 9.: „nechajme to tam ale dajme tam
                info že k dispozícii od 12/2026 — zatiaľ to bude fungovať ako zoznamka 1:1"). Server ich
                aj tak neporovnáva, kým nie je pawtner. Parťák je jediná živá voľba. */}
            <Pills
              options={SEEK_KIND_OPTIONS.map((o) => ({
                value: o.value,
                label: `${o.emoji} ${tx(`pack.sniffer.seek.${o.value}`, o.labelEN)}${o.value === 'buddy' ? '' : ` · ${tx('pack.sniffer.fromDec', 'from 12/2026')}`}`,
              }))}
              selected={(human?.seekKinds ?? []).filter((k) => k === 'buddy')}
              disabled={(v) => v !== 'buddy'}
              onToggle={(v) => void saveHuman({ seekKinds: toggle(human?.seekKinds ?? [], v as SeekKind) })}
            />
            <p className="bd-note sp-onetoone">{tx('pack.sniffer.oneToOne', 'For now SNIFFER matches one to one. Couples, packs and groups arrive in 12/2026.')}</p>
            {/* PAWTNER — pawmate je dnes za zamknutými dverami (`PAWMATE_LIVE`), preto pilulka ČOSKORO. */}
            <div className="sp-pawtner">
              <span>{tx('pack.sniffer.profile.pawtnerNote', 'We go on trips together with a pawtner')}</span>
              {PAWMATE_LIVE ? (
                <button type="button" className="sp-chip is-tap is-set" onClick={() => navigate('/pack/profile#pawmates')}>
                  + {tx('pack.sniffer.profile.pawtnerAdd', 'Add a pawtner')}
                </button>
              ) : (
                <span className="sp-chip is-empty">{tx('pack.sniffer.soon', 'coming soon')}</span>
              )}
            </div>
            <span className="sp-sec">{tx('pack.sniffer.profile.seekShow', 'Who sees us')}</span>
            {audienceEditor ? audienceEditor('who') : gateEditor('audience')}
          </div>
          <div>
            <span className="sp-sec">{tx('pack.sniffer.profile.seekWhat', 'What for')}</span>
            {gateEditor('intents')}
            {audienceEditor?.('dogs')}
          </div>
        </div>
      ),
    },
    // PSI — JEDNA karta, v nej prepínač psov svorky (Matej 25. 9.: „treba mať pripravený multipsí
    // štýl a tu sa vyplní každý pes vo svorke"). Počet kariet tak nerastie s počtom psov.
    ...dogs.slice(0, 1).map((): Slide => {
      const d = dogs[Math.min(dogIdx, dogs.length - 1)];
      const a = dogAttrsOf(d.id) ?? emptyDogAttrs(d.id);
      const setCard = (patch: Partial<DogProfileAttrs['card']>) => void saveDogAttrs(d.id, { card: { ...a.card, ...patch } });
      const temper = a.tags.temperament ?? [];
      const dogDone = temper.length > 0 && !!a.card.fitness && !!a.card.compat?.dogs_overall;
      return {
        key: 'dogs',
        title: dogs.length > 1 ? tx('pack.sniffer.profile.dogsTitle', 'Our dogs') : tx('pack.buddy.dog', 'Dog'),
        right: dogDone
          ? <span className="sp-ok">{tx('pack.sniffer.profile.done', 'Done')}</span>
          : <span className="sp-miss">{tx('pack.sniffer.profile.dogTodo', 'Fill in 3')}</span>,
        body: (
          <>
            {dogs.length > 1 && (
              <div className="sp-dogtabs" role="tablist">
                {dogs.map((x, i) => {
                  const xa = dogAttrsOf(x.id);
                  const ok = !!xa && (xa.tags.temperament ?? []).length > 0 && !!xa.card.fitness && !!xa.card.compat?.dogs_overall;
                  return (
                    <button key={x.id} type="button" role="tab" aria-selected={i === dogIdx} className={i === dogIdx ? 'is-on' : ''}
                      onClick={() => { setDogIdx(i); setOpen(null); }}>
                      {x.cloudinary_main_url && <img src={thumb(x.cloudinary_main_url)} alt="" />}
                      {x.dog_name}<i className={ok ? '' : 'is-todo'} aria-hidden />
                    </button>
                  );
                })}
              </div>
            )}
            <div className="sp-dogh">
              <span className="sp-dogh__ph">
                {d.cloudinary_main_url && <img src={thumb(d.cloudinary_main_url)} alt="" />}
                {d.heroglyph_png_url && <img className="sp-dogh__hg" src={withTransform(d.heroglyph_png_url, 'c_limit,w_200,f_auto,q_auto')} alt="" />}
              </span>
              <span className="sp-dogh__txt">
                <b>{d.dog_name}</b>
                <span className="sp-chips">
                  {temper.length
                    ? temper.map((v) => <span key={v} className="sp-chip is-set">{tx(`pack.dogTag.${v}`, v)}</span>)
                    : <span className="sp-chip is-empty">{tx('pack.sniffer.profile.dogEmpty', 'Tell us what they’re like')}</span>}
                </span>
              </span>
            </div>
            <div className="sp-rows2">
              {row(`${d.id}-t`, tx('pack.buddy.step.temperament', 'Temperament'), temper.map((v) => tx(`pack.dogTag.${v}`, v)).join(', '), (
                <>
                  <Pills
                    options={DOG_TEMPERAMENT_TAGS.map((v) => ({ value: v, label: tx(`pack.dogTag.${v}`, v) }))}
                    selected={temper}
                    onToggle={(v) => {
                      const next = toggle(temper as string[], v);
                      if (next.length > MAX_DOG_TEMPERAMENT) return;
                      void saveDogAttrs(d.id, { tags: { ...a.tags, temperament: next as DogProfileAttrs['tags']['temperament'] } });
                    }}
                  />
                  <p className="bd-note">{tx('pack.buddy.maxTags', 'Up to {n}.', { n: MAX_DOG_TEMPERAMENT })}</p>
                </>
              ), temper.length === 0)}
              {row(`${d.id}-f`, tx('pack.dogCard.fitness', 'Physical condition'), opt(a.card.fitness), (
                <Pills
                  options={DOG_FITNESS_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.fitness ? [a.card.fitness] : []}
                  onToggle={(v) => setCard({ fitness: v as DogProfileAttrs['card']['fitness'] })}
                />
              ), !a.card.fitness)}
              {row(`${d.id}-c`, tx('pack.dogCard.compat.dogs_overall', 'With other dogs'), opt(a.card.compat?.dogs_overall), (
                <Pills
                  options={DOG_COMPAT_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.compat?.dogs_overall ? [a.card.compat.dogs_overall] : []}
                  onToggle={(v) => setCard({ compat: { ...a.card.compat, dogs_overall: v as never } })}
                />
              ), !a.card.compat?.dogs_overall)}
              {row(`${d.id}-j`, tx('pack.sniffer.profile.likes', 'Likes'), a.card.joys.map((v) => tx(`pack.dogCard.joy.${v}`, v)).join(', '), (
                <Pills
                  options={DOG_JOY_SUGGESTIONS.map((v) => ({ value: v, label: tx(`pack.dogCard.joy.${v}`, v) }))}
                  selected={a.card.joys}
                  onToggle={(v) => setCard({ joys: toggle(a.card.joys, v) })}
                />
              ))}
              {row(`${d.id}-d`, tx('pack.sniffer.profile.dislikes', 'Dislikes'), a.card.dislikedTypes.map((v) => tx(`pack.dogCard.type.${v}`, v)).join(', '), (
                <Pills
                  options={DOG_DISLIKED_TYPE_SUGGESTIONS.map((v) => ({ value: v, label: tx(`pack.dogCard.type.${v}`, v) }))}
                  selected={a.card.dislikedTypes}
                  onToggle={(v) => setCard({ dislikedTypes: toggle(a.card.dislikedTypes, v) })}
                />
              ))}
              {row(`${d.id}-a`, tx('pack.dogCard.alone', 'Alone at the lodging'), opt(a.card.alone), (
                <Pills
                  options={DOG_ALONE_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.alone ? [a.card.alone] : []}
                  onToggle={(v) => setCard({ alone: v as DogProfileAttrs['card']['alone'] })}
                />
              ))}
              {row(`${d.id}-o`, tx('pack.dogCard.obedience', 'Obedience'), opt(a.card.obedience), (
                <Pills
                  options={DOG_SKILL_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.obedience ? [a.card.obedience] : []}
                  onToggle={(v) => setCard({ obedience: v as DogProfileAttrs['card']['obedience'] })}
                />
              ))}
              {row(`${d.id}-r`, tx('pack.dogCard.recall', 'Recall'), opt(a.card.recall), (
                <Pills
                  options={DOG_SKILL_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.recall ? [a.card.recall] : []}
                  onToggle={(v) => setCard({ recall: v as DogProfileAttrs['card']['recall'] })}
                />
              ))}
            </div>
          </>
        ),
      };
    }),
    {
      // Na konci to, čo v úvode chýbalo (Matej: „nevidím že ukazad sa ludom v okoli a zapnute
      // upozornenia"). „V okolí" má východisko NIE (kolo 2).
      key: 'reach',
      title: tx('pack.sniffer.profile.reachTitle', 'Visibility & alerts'),
      body: (
        <>
          <label className="sp-sw">
            <span><b>{tx('pack.sniffer.nearby.toggle', 'Show me in People nearby')}</b>
              <small>{tx('pack.sniffer.nearby.hint', 'Everyone with SNIFFER around your pin can see you')}</small></span>
            <Switch on={settings.show_nearby} onChange={(v) => void onPatch({ show_nearby: v })} label={tx('pack.sniffer.nearby.toggle', 'Show me in People nearby')} />
          </label>
          {/* Nová zhoda sa ukáže v notifikácii vždy — prepínač preč (Matej 25. 9.), ostáva len mail. */}
          <label className="sp-sw">
            <span><b>{tx('pack.sniffer.ghost.toggle', 'Ghost mode')}</b>
              <small>{tx('pack.sniffer.ghost.hint', 'Nobody sees me, I see everyone · I only show up to those I SNIFF')}</small></span>
            <Switch on={settings.ghost} onChange={(v) => void onPatch({ ghost: v })} label={tx('pack.sniffer.ghost.toggle', 'Ghost mode')} />
          </label>
          <label className="sp-sw">
            <span><b>{tx('pack.buddy.notifyMail', 'Also by e-mail')}</b></span>
            <Switch on={settings.notify_mail} onChange={(v) => void onPatch({ notify_mail: v })} label={tx('pack.buddy.notifyMail', 'Also by e-mail')} />
          </label>
        </>
      ),
    },
  ];

  // Karta s prvým chýbajúcim bodom — kam skočí zapnutie, kým nie je všetko.
  const missingSlide = (() => {
    const at = (keys: BuddyStepKey[]) => keys.some((k) => missing.includes(k));
    if (at(['name', 'age', 'gender', 'region', 'photo'])) return 0;
    if (at(['intents', 'audience'])) return slides.findIndex((s) => s.key === 'seek');
    if (at(['temperament', 'fitness', 'compat'])) return Math.max(0, slides.findIndex((s) => s.key === 'dogs'));
    return -1;
  })();

  return (
    <>
      <style>{CSS}</style>
      <Pager tx={tx} fit={fit} slides={slides} finish={finish} missingSlide={missingSlide} />
    </>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`bd-sw${on ? ' is-on' : ''}`}
      onClick={(e) => { e.preventDefault(); onChange(!on); }}><i /></button>
  );
}

/** Listovanie po jednej karte. Karta ide s prstom (Matej: „treba aj možnosť swajpu"); pustená
 *  za 56 px a viac vodorovne než zvislo = ďalšia/predošlá, inak sa vráti. Zvislý ťah ostáva
 *  rolovaniu. Ťah nikdy neklikne na riadok pod prstom. */
function Pager({ tx, slides, fit, finish, missingSlide }: {
  tx: Tx; slides: Slide[]; fit?: boolean;
  finish?: { label: string; onClick: () => void; busy?: boolean; note?: ReactNode }; missingSlide: number;
}) {
  const [page, setPage] = useState(0);
  const [dx, setDx] = useState(0);
  const n = slides.length;
  useEffect(() => { if (page > n - 1) setPage(Math.max(0, n - 1)); }, [n, page]);
  const start = useRef<{ x: number; y: number; id: number; drag: boolean } | null>(null);
  const moved = useRef(false);
  const go = (d: number) => setPage((p) => Math.min(n - 1, Math.max(0, p + d)));
  const s = slides[Math.min(page, n - 1)];
  const last = page >= n - 1;
  const typing = (el: EventTarget) => el instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);

  return (
    <div className={`sp-pager${fit ? ' sp-pager--fit' : ''}`}>
      <div className="sp-nav">
        <button type="button" className="sp-arrow" disabled={page === 0} aria-label={tx('pack.sniffer.prev', 'Previous')} onClick={() => go(-1)}>
          <HandArrowLeft size={14} solid />
        </button>
        <span className="sp-count" aria-live="polite">{page + 1} / {n}</span>
        <button type="button" className="sp-arrow" disabled={last} aria-label={tx('pack.sniffer.next', 'Next')} onClick={() => go(1)}>
          <HandArrowLeft size={14} solid style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>
      <section key={s.key} className={`sp-card${start.current?.drag ? ' is-drag' : ''}`}
        style={{ ...PACK_BOX.card, transform: dx ? `translateX(${dx}px) rotate(${dx / 60}deg)` : undefined, opacity: dx ? Math.max(0.5, 1 - Math.abs(dx) / 600) : undefined }}
        onPointerDown={(e) => { if (typing(e.target)) return; start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, drag: false }; moved.current = false; }}
        onPointerMove={(e) => {
          const s0 = start.current;
          if (!s0 || s0.id !== e.pointerId) return;
          const mx = e.clientX - s0.x; const my = e.clientY - s0.y;
          if (!s0.drag) {
            if (Math.abs(mx) < 10 || Math.abs(mx) < Math.abs(my) * 1.2) return;
            s0.drag = true; moved.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          // Na krajoch (prvá/posledná) ide karta len kúsok — ako odpor gumy.
          const edge = (mx > 0 && page === 0) || (mx < 0 && last);
          setDx(edge ? mx / 4 : mx);
        }}
        onPointerUp={() => {
          const s0 = start.current; start.current = null;
          if (s0?.drag && Math.abs(dx) >= 56) go(dx < 0 ? 1 : -1);
          setDx(0);
        }}
        onPointerCancel={() => { start.current = null; setDx(0); }}
        onClickCapture={(e) => { if (moved.current) { e.stopPropagation(); e.preventDefault(); moved.current = false; } }}>
        <div className="sp-head">
          <div>
            <h3 className="sp-title">{s.title}</h3>
            {s.sub && <p className="sp-sub">{s.sub}</p>}
          </div>
          {s.right}
        </div>
        <div className="sp-body">{s.body}</div>
        {/* CTA DOLE V KARTE, lapis (Matej: „dole v bloku musí byť modré CTA ďalej"). */}
        {(!last || finish) && (
          <div className="sp-foot">
            {finish?.note && last && finish.note}
            {!last ? (
              <button type="button" className="bd-cta" onClick={() => go(1)}>
                {tx('pack.buddy.next', 'Next')} · {page + 2} / {n}
              </button>
            ) : finish && (
              <button type="button" className="bd-cta" disabled={finish.busy}
                onClick={() => (missingSlide >= 0 ? setPage(missingSlide) : finish.onClick())}>
                {finish.label}
              </button>
            )}
          </div>
        )}
      </section>
      <div className="sp-dots">
        {slides.map((x, i) => (
          <button key={x.key} type="button" className={i === page ? 'is-on' : ''} onClick={() => setPage(i)}
            aria-label={`${i + 1} / ${n}`} aria-current={i === page} />
        ))}
      </div>
    </div>
  );
}

/** Fotky karty: až 6, jedna označená „spolu" (zelený rám) = `buddyPhoto` pre bránu.
 *  Nákres A: „aspoň na jednej ste spolu (zelený rám)". */
function PhotoSlots({ uid, photos, together, tx }: { uid: string | null; photos: string[]; together: string | null; tx: Tx }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pick, setPick] = useState<string | null>(null);

  const write = (next: string[], nextTogether: string | null) =>
    void saveHuman({ buddyPhotos: next, buddyPhoto: nextTogether ?? undefined });

  return (
    <div className="sp-kv" style={{ paddingTop: PACK_SPACE.sm, display: 'flex', flexDirection: 'column', gap: PACK_SPACE.sm }}>
      <span className="bd-note">{tx('pack.sniffer.profile.photosNote', 'Photos — on at least one of them you’re together (green frame).')}</span>
      <div className="sp-slots">
        {photos.map((u) => (
          <button key={u} type="button" className={`sp-slot${u === together ? ' is-together' : ''}`} onClick={() => setPick(pick === u ? null : u)}>
            <img src={thumb(u)} alt="" draggable={false} />
            {u === together && <span className="sp-slot__tag">{tx('pack.sniffer.profile.together', 'together')}</span>}
          </button>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button type="button" className="sp-slot" disabled={busy || !uid} onClick={() => input.current?.click()}
            aria-label={tx('pack.buddy.photoPick', 'Choose photo')}>{busy ? '…' : '+'}</button>
        )}
      </div>
      {pick && (
        <div className="sp-photo-menu">
          {pick !== together && (
            <button type="button" className="pk-pill pk-pill--tap" onClick={() => { write(photos, pick); setPick(null); }}>
              {tx('pack.sniffer.profile.markTogether', 'We’re together on this one')}
            </button>
          )}
          {photos.indexOf(pick) > 0 && (
            <button type="button" className="pk-pill pk-pill--tap" onClick={() => {
              write([pick, ...photos.filter((x) => x !== pick)], together); setPick(null);
            }}>{tx('pack.sniffer.profile.first', 'Make it first')}</button>
          )}
          <button type="button" className="pk-pill pk-pill--tap" onClick={() => {
            const next = photos.filter((x) => x !== pick);
            write(next, pick === together ? null : together);
            setPick(null);
          }}>{tx('pack.sniffer.profile.remove', 'Remove')}</button>
        </div>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f || !uid) return;
        setBusy(true);
        setErr(null);
        try {
          // Názov z času, nie z poradia: po odstránení fotky by poradie trafilo existujúci súbor.
          const r = await uploadExtraPhoto(f, `buddy/${uid}`, Date.now());
          // Prvá fotka je predvolene tá „spolu" — brána ju chce a kto nahrá jednu, myslí ňou tú.
          write([...photos, r.secureUrl], together ?? r.secureUrl);
        } catch (x) {
          setErr(x instanceof Error ? x.message : String(x));
        } finally {
          setBusy(false);
          e.target.value = '';
        }
      }} />
      {err && <p className="bd-warn">{err}</p>}
    </div>
  );
}
