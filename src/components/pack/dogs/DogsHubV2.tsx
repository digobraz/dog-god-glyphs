// ════════════════════════════════════════════════════════════════════════════
// /pack/dogs v2 — MOJA SVORKA · DOG ID · ŽIVOT (30. 10. 2026, len TEST_BUILD)
//
// Nákres: plany/nakresy/dogs-2026-10-28-v2/dogid-v2.html (Matej 30. 10. kolo po kole „super",
// potom *„dajme to do appky nech si to viem klikať aj tam"*). Pamäť
// `project_dogypt_dogs_od_nuly_2026-10-28`.
//
//  • rad psov (ťuk = karta pod radom prepne na psa; jeden pes = hneď otvorený)
//  • záložky DOG ID · ŽIVOT (môžu pribudnúť ďalšie — rad je rolovateľný)
//  • DOG ID svorky = VITRÁŽ s % modulov za všetkých · DOG ID psa = PREUKAZ (HERO VĽAVO)
//  • ŽIVOT psa = 30 rokov × 12 mesiacov, prežité ✓, dĺžka života plemena = zlatý blok
//    v stĺpci rokov OD 0 po horný vek, cieľ pod mriežkou (zápis `calendar.bands.target`)
//
// Nič nové v DB nezakladá: psy + `latest` dá PackDogs, cieľ veku ide do toho istého
// `calendar.bands`, ktorý číta kalendár (CalBandsSettings).
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { PACK_THEME } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { VerticalHeroglyphFrame } from '@/components/VerticalHeroglyphFrame';
import { PROGRESS_STEPS } from '@/components/pack/dogQuiz';
import { LIVE_MODULES, moduleProgress } from '@/components/pack/dogIdModules';
import { NATURE_ELEMENTS, NATURE_ROLES, type ElementKey, type RoleKey } from '@/components/pack/natureQuiz';
import { asCalBands, CAL_BANDS_FIELD } from '@/components/pack/calendar/CalBandsSettings';
import { appendDogEvents, hasValue, type LatestValue } from '@/lib/dogEvents';
import { computeAge } from '@/lib/dogAge';
import { estimateLife } from '@/data/breedLifespan';
import { localizeBreed } from '@/lib/breedDisplay';
import { sizedUrl } from '@/services/cloudinaryService';
import { IS_APP } from '@/lib/isApp';
import { useLang } from '@/i18n/LanguageContext';

const T = PACK_THEME;
type Tx = (key: string, fallback: string) => string;
type Latest = Record<string, Record<string, LatestValue>>;

export interface DogsV2Dog {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  pack_number: number | null;
  country: string | null;
  life_status: string | null;
  death_date: string | null;
  birth_year: number | null;
  selections: Record<string, string> | null;
  breed?: string | null;
  owner_name?: string | null;
  patron_svg?: string | null;
  weight_kg?: number | string | null;
}

/** Najstarší pes v histórii (Bluey, 29 r. 5 mes.) — mierka ŽIVOTA končí na 30. */
const MAX_Y = 30;
/** Odhad času na otázku DOG ID (blok pri jednom psovi „asi N min"). */
const SEC_PER_Q = 10;
const NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const NATURE_ART = '/images/nature-quiz-art.webp';
const LOGO_INK = '/images/dogypt-logo-black-w.png';

/* Farby rámov a tieňov idú cez premenné — stráž check:pack meria doslovnú farbu v ráme a tieni. */
const CSS = `
.dv2{--g:${T.cardEdge};--g55:rgba(201,154,63,.55);--g30:rgba(201,154,63,.3);--pap:#FAF2E0;--red:#B25640;--grn:#3D7A4E;
 --lap:#1E3C90;--lapd:#0A1A4A;--ink:${T.inkStrong};--mut:${T.inkWarm};--sh:rgba(80,55,15,.18);--lsh:rgba(10,26,74,.3);--hi:rgba(255,255,255,.6)}
.dv2-head{display:flex;justify-content:space-between;align-items:center;padding:4px 0 12px;border-bottom:1.5px solid var(--g55)}
.dv2-title{font:700 16px Cinzel,Georgia,serif;letter-spacing:.14em;color:var(--ink);margin:0;text-transform:uppercase} /* písmo: nadpis */
.dv2-add{display:flex;align-items:center;gap:8px;height:32px;padding:0 16px;border-radius:999px;background:transparent;border:0;cursor:pointer;
 box-shadow:inset 0 0 0 1.5px var(--lap);color:var(--lap);font:600 12px "Space Grotesk",system-ui;letter-spacing:.14em;text-transform:uppercase;text-decoration:none}
.dv2-dogs{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px 8px;padding:16px 0 4px}
.dv2-dogs.solo{flex-wrap:nowrap;align-items:center;gap:16px}
.dv2-st{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;width:60px;cursor:pointer;
 transition:width .3s,opacity .25s;background:none;border:0;padding:0;color:inherit}
.dv2-st.sel{width:90px}.dv2-st.off{opacity:.45}
.dv2-pct{font:600 10px "Space Grotesk",system-ui;color:#fff;padding:0 8px;border-radius:999px;background:var(--red);line-height:16px}
.dv2-pct.ok{background:var(--grn)}
.dv2-ring{position:relative;display:block;width:60px;height:60px;border-radius:50%;padding:4px;background:linear-gradient(135deg,var(--lap),var(--g));transition:width .3s,height .3s}
.dv2-st.sel .dv2-ring{width:90px;height:90px;box-shadow:0 0 0 3px var(--pap),0 0 0 4.5px var(--g),0 0 24px 8px var(--g30);}
.dv2-ring img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;box-shadow:0 0 0 3px var(--pap);}
.dv2-live{position:absolute;right:1px;bottom:1px;width:12px;height:12px;border-radius:50%;background:#2fbf5a;box-shadow:0 0 0 2px var(--pap);}
.dv2-st.angel .dv2-ring{background:#fff}.dv2-st.angel img{filter:grayscale(1)}
.dv2-nm{font:700 10px ${NAME_FONT};color:var(--ink);white-space:nowrap;max-width:90px;overflow:hidden;text-overflow:ellipsis}
/* jeden pes: stav DOG ID vedľa fotky — nad fotkou ani nad preukazom nič */
.dv2-solo{flex:1;min-width:0;padding:12px;border-radius:12px;background:rgba(178,86,64,.1);box-shadow:inset 0 0 0 1.5px var(--red);display:flex;flex-direction:column;gap:8px}
.dv2-solo.ok{background:rgba(61,122,78,.1);box-shadow:inset 0 0 0 1.5px var(--grn);}
.dv2-eb{font:500 10px "Space Grotesk",system-ui;letter-spacing:.22em;text-transform:uppercase;color:var(--mut)}
.dv2-solo .dv2-eb{color:var(--red)}.dv2-solo.ok .dv2-eb{color:var(--grn)}
.dv2-sp{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.dv2-sp>b{font:600 24px/1 "Space Grotesk",system-ui;color:var(--red)}.dv2-solo.ok .dv2-sp>b{color:var(--grn)}
.dv2-sp span{font:500 12px "Space Grotesk",system-ui;color:var(--ink)}
.dv2-solo p{margin:0;font:500 12px "Space Grotesk",system-ui;color:var(--mut)}
.dv2-out{display:flex;align-items:center;justify-content:center;height:32px;border-radius:8px;box-shadow:inset 0 0 0 1.5px var(--red);color:var(--red);text-decoration:none;text-transform:uppercase;
 font:700 12px Cinzel,Georgia,serif;letter-spacing:.14em} /* písmo: cta */
.dv2-solo.ok .dv2-out{box-shadow:inset 0 0 0 1.5px var(--grn);color:var(--grn)}
/* záložky — pribudnú ďalšie, preto rad rolovateľný */
.dv2-band{margin:24px -16px 0}
@media (min-width:640px){.dv2-band{margin:24px -24px 0}.dv2-band .dv2-tabwrap,.dv2-band .dv2-sheet{padding-left:24px;padding-right:24px}}
.dv2-tabwrap{padding:0 16px}
/* ZLATÝ PÁS (Matej 30. 10., nákres zalozky3.html): vyrytá lišta, otvorená záložka = vyvýšená doska
   s ikonkou + nadpisom, ostatné len ikonky. Ikonka = maska → farbí sa atramentom. */
.dv2-tabs{display:flex;padding:4px;border-radius:16px;background:linear-gradient(180deg,#E3CC97,#EAD8AC);
 box-shadow:inset 0 1.5px 3px var(--sh),inset 0 0 0 1px var(--g55),0 1px 0 var(--hi);}
.dv2-tab{flex:1 1 0;min-width:0;height:44px;display:flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:12px;background:transparent;cursor:pointer;padding:0;
 transition:flex .35s cubic-bezier(.3,.7,.3,1),background .25s,box-shadow .25s}
.dv2-tab.on{flex:2.6 1 0;background:linear-gradient(180deg,#FFFBEF,#F6E7C2);box-shadow:0 0 0 1.5px var(--g),0 4px 10px var(--sh),inset 0 1px 0 var(--hi);}
.dv2-ti{display:block;flex:none;width:24px;height:24px;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;
 background:linear-gradient(180deg,#6b4c1f,#2e200c);opacity:.55}
.dv2-tab.on .dv2-ti{opacity:1}
.dv2-tl{display:none;white-space:nowrap;color:var(--ink);text-transform:uppercase;
 font:700 12px Cinzel,Georgia,serif;letter-spacing:.14em} /* písmo: nadpis */
.dv2-tab.on .dv2-tl{display:inline}
.dv2-sheet{padding:24px 16px 8px}
/* KRONIKA v záložke — karta si nesie inline marginTop zo samostatnej polohy */
.dv2-sheet .ctz{margin-top:0!important}
.dv2-ex{margin:0 0 16px;font:400 14px/1.45 "Space Grotesk",system-ui;color:var(--ink)}
.dv2-ex b{font-weight:600}
/* VITRÁŽ — DOG ID svorky */
.dv2-vit{position:relative;min-height:236px;margin:0 0 16px;border-radius:16px;overflow:hidden;background:#F8EBCD;
 box-shadow:0 0 0 1.5px var(--g),0 0 0 4px var(--pap),0 0 0 5px var(--g55),0 8px 24px var(--sh);}
.dv2-vimg{position:absolute;left:0;top:0;bottom:0;width:58%;background:url(${NATURE_ART}) 0 18%/cover no-repeat;
 -webkit-mask:linear-gradient(90deg,#000 55%,transparent 98%);mask:linear-gradient(90deg,#000 55%,transparent 98%)}
.dv2-vtx{position:relative;margin-left:44%;padding:16px 16px 16px 0;display:flex;flex-direction:column;gap:12px}
.dv2-vt{font:700 24px/1 Cinzel,Georgia,serif;letter-spacing:.14em;color:var(--ink);margin:0} /* písmo: nadpis */
.dv2-vq{margin:0;font:500 12px/1.45 "Space Grotesk",system-ui;color:var(--ink)}
.dv2-vit ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.dv2-vit li{display:flex;align-items:center;gap:8px;font:600 10px "Space Grotesk",system-ui;letter-spacing:.22em;color:var(--ink);text-transform:uppercase}
.dv2-vit li .ic{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:rgba(255,250,235,.85);box-shadow:inset 0 0 0 1px var(--g55);}
.dv2-vit li span{flex:1;min-width:0}
.dv2-vit li b{font:600 12px "Space Grotesk",system-ui;letter-spacing:0;color:var(--red)}.dv2-vit li b.ok{color:var(--grn)}
.dv2-cta{display:flex;align-items:center;justify-content:center;width:100%;height:48px;border-radius:8px;background:linear-gradient(180deg,var(--lap),var(--lapd));
 color:#EFD79A;text-decoration:none;text-transform:uppercase;box-shadow:0 4px 12px var(--lsh);
 font:700 14px Cinzel,Georgia,serif;letter-spacing:.14em} /* písmo: cta */
.dv2-cta2{display:flex;align-items:center;justify-content:center;width:100%;height:40px;margin-top:8px;border-radius:8px;box-shadow:inset 0 0 0 1.5px var(--g);
 color:var(--ink);text-decoration:none;text-transform:uppercase;background:transparent;border:0;cursor:pointer;
 font:700 12px Cinzel,Georgia,serif;letter-spacing:.14em} /* písmo: cta */
/* VYPLNENIE (svorka, ťuk na psa) */
.dv2-fill{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;margin:0 0 4px}
.dv2-fill b{font:600 14px "Space Grotesk",system-ui;color:var(--ink)}
.dv2-fsub{margin:0 0 16px;font:500 12px "Space Grotesk",system-ui;color:var(--mut)}
.dv2-fsub b{font-weight:600;color:var(--ink)}
/* PREUKAZ — HERO VĽAVO */
.dv2-idc{position:relative;border-radius:14px;padding:12px 16px 8px;overflow:hidden;margin:0 0 16px;
 background:radial-gradient(120% 70% at 100% 0%,rgba(242,210,122,.45),rgba(242,210,122,0) 55%),linear-gradient(160deg,#FCF6E8 0%,#F3E4C4 55%,#E9D3A2 100%);
 box-shadow:0 0 0 1.5px var(--g),0 0 0 4px var(--pap),0 0 0 5px var(--g55),0 12px 28px var(--sh);}
.dv2-idc.ang{filter:saturate(.35)}
.dv2-bar{display:flex;align-items:center;justify-content:space-between;padding:0 0 8px;margin:0 0 12px;border-bottom:1px solid var(--g55)}
.dv2-bar img{height:16px;width:auto;display:block}
.dv2-no{font:600 12px "Space Grotesk",system-ui;color:#fff;background:linear-gradient(180deg,var(--lap),var(--lapd));border-radius:999px;padding:0 8px;line-height:20px}
.dv2-grid{display:grid;grid-template-columns:64px 84px minmax(0,1fr);gap:12px;height:198px}
.dv2-vh{position:relative;height:198px;overflow:hidden;filter:brightness(.25) sepia(.6) saturate(1.3)}
/* !important: komponent si dáva inline width:100%. VerticalHeroglyphFrame kreslí celú A4 (2480×3504); rám je výrez 792,368 · 896×2748 — zväčšiť a posunúť */
.dv2-vh svg{position:absolute;display:block;width:calc(198px * 2480 / 2748)!important;height:calc(198px * 3504 / 2748)!important;
 left:calc(-198px * 792 / 2748);top:calc(-198px * 368 / 2748);max-width:none}
.dv2-lc{display:flex;flex-direction:column;justify-content:space-between;height:198px}
.dv2-ph{width:84px;height:104px;border-radius:12px;object-fit:cover;display:block;box-shadow:0 0 0 1.5px var(--g),0 0 0 3px var(--pap);}
.dv2-idc.ang .dv2-ph{filter:grayscale(1)}
.dv2-qr{width:84px;height:84px;padding:8px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--g55);display:block}
.dv2-qr svg{display:block;width:100%;height:100%}
.dv2-mc{display:flex;flex-direction:column;min-width:0;height:198px}
.dv2-name{font:700 20px/1 ${NAME_FONT};color:var(--ink);overflow-wrap:anywhere}
.dv2-f{display:flex;flex-direction:column;margin-top:8px}
.dv2-f small{font:600 10px "Space Grotesk",system-ui;letter-spacing:.22em;color:var(--mut);text-transform:uppercase}
.dv2-f span{font:600 12px "Space Grotesk",system-ui;color:var(--ink)}
.dv2-f i{display:block;width:64px;height:6px;margin-top:4px;border-radius:999px;background:rgba(122,90,42,.16)}
.dv2-bdg{display:flex;gap:12px;margin-top:auto}
.dv2-bdg div{display:flex;flex-direction:column;align-items:center;gap:2px;font:600 10px "Space Grotesk",system-ui;color:var(--mut);text-transform:uppercase}
.dv2-bdg img,.dv2-bdg em{width:36px;height:36px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1.5px var(--g),0 0 0 3px var(--pap);}
.dv2-bdg em{display:flex;align-items:center;justify-content:center;font:600 14px "Space Grotesk",system-ui;font-style:normal;color:var(--g);background:rgba(255,250,235,.6)}
.dv2-bdg b{font:600 10px "Space Grotesk",system-ui;color:var(--ink)}
.dv2-mrz{display:flex;margin-top:12px;padding:8px 0 0;border-top:1px dashed var(--g55);font:600 10px/1.3 ui-monospace,Menlo,monospace;color:var(--mut);white-space:nowrap}
.dv2-mrz span:first-child{flex:1;min-width:0;overflow:hidden}
.dv2-memo{text-align:center;font:500 12px "Space Grotesk",system-ui;color:var(--mut);margin:12px 0 0}
/* ŽIVOT */
.dv2-big{display:flex;align-items:baseline;gap:12px;margin:0 0 4px}
.dv2-big b{font:600 24px "Space Grotesk",system-ui;color:var(--ink)}
.dv2-mg{display:grid;grid-template-columns:24px 1fr;row-gap:3px;column-gap:8px}
.dv2-y{display:flex;align-items:center;justify-content:center;font:500 10px "Space Grotesk",system-ui;color:var(--mut)}
.dv2-y.in{margin:-1.5px 0;background:rgba(201,154,63,.28);box-shadow:inset 1.5px 0 0 var(--g),inset -1.5px 0 0 var(--g);color:var(--ink)}
.dv2-y.in.a{margin-top:0;border-radius:8px 8px 0 0;box-shadow:inset 1.5px 0 0 var(--g),inset -1.5px 0 0 var(--g),inset 0 1.5px 0 var(--g);}
.dv2-y.in.z{margin-bottom:0;border-radius:0 0 8px 8px;box-shadow:inset 1.5px 0 0 var(--g),inset -1.5px 0 0 var(--g),inset 0 -1.5px 0 var(--g);}
.dv2-y.in.lo{font-weight:600}
.dv2-mr{display:grid;grid-template-columns:repeat(12,1fr);gap:3px}
.dv2-mr i,.dv2-yb i,.dv2-leg i{height:14px;border-radius:2px;display:block}
.dv2 .c-ok{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M2.8 5.3L4.4 6.9L7.3 3.4' fill='none' stroke='%233D7A4E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat,rgba(61,122,78,.14)}
.dv2 .c-goal{background:#8FA6E0}
.dv2 .c-may{background:rgba(30,60,144,.09)}
.dv2 .c-none{background:rgba(122,90,42,.05)}
.dv2 .c-br{background:rgba(201,154,63,.28);box-shadow:inset 0 0 0 1.5px var(--g);}
.dv2-goal{display:flex;align-items:center;justify-content:space-between;padding:8px 8px 8px 12px;margin:16px 0;border-radius:12px;
 background:rgba(255,255,255,.5);box-shadow:inset 0 0 0 1px var(--lap);}
.dv2-goal .t{font:600 10px "Space Grotesk",system-ui;letter-spacing:.22em;color:var(--lap);text-transform:uppercase}
.dv2-goal .s{display:flex;align-items:center;gap:8px}
.dv2-goal button{width:32px;height:32px;border-radius:999px;border:0;box-shadow:inset 0 0 0 1.5px var(--lap);background:transparent;color:var(--lap);font:600 16px "Space Grotesk",system-ui;cursor:pointer}
.dv2-goal b{font:600 16px "Space Grotesk",system-ui;min-width:72px;text-align:center;color:var(--ink)}
.dv2-leg{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;font:500 12px "Space Grotesk",system-ui;color:var(--ink);margin:16px 0 12px}
.dv2-leg span{display:flex;align-items:center;gap:8px}.dv2-leg i{width:14px;flex:none}
.dv2-note{margin:0 0 16px;font:400 12px/1.45 "Space Grotesk",system-ui;color:var(--mut)}
.dv2-lf{display:grid;grid-template-columns:28px 1fr;gap:12px;align-items:center;margin:0 0 12px;cursor:pointer;background:none;border:0;padding:0;width:100%;text-align:left;color:inherit}
.dv2-lf img{width:28px;height:28px;border-radius:50%;object-fit:cover;display:block;box-shadow:0 0 0 1.5px var(--g);}
.dv2-lf .a img{filter:grayscale(1)}
.dv2-tt{display:flex;justify-content:space-between;margin:0 0 4px;font:500 12px "Space Grotesk",system-ui;color:var(--mut)}
.dv2-tt b{font:700 12px ${NAME_FONT};color:var(--ink)}
.dv2-ybw{position:relative;display:block;padding-bottom:8px}
.dv2-yb{display:grid;grid-template-columns:repeat(30,1fr);gap:2px}
.dv2-yb i{height:auto;aspect-ratio:1}
.dv2-ybr{position:absolute;left:0;bottom:0;height:2.5px;background:var(--g);border-radius:2px}
.dv2-ybr::after{content:"";position:absolute;right:0;top:-3px;width:2.5px;height:8px;background:var(--g);border-radius:2px}
`;

/** Záložky — nová sekcia (KRMENIE, KALENDÁR…) = nový riadok tu. Ikonky z kitu Icons hand drawn. */
const TABS: { key: 'id' | 'z' | 'k'; icon: string; i18n: string; labelEN: string }[] = [
  { key: 'id', icon: 'badge', i18n: 'pack.hub.profileTitle', labelEN: 'DOG ID' },
  { key: 'z', icon: 'sand-clock', i18n: 'pack.dogs2.life', labelEN: 'Life' },
  { key: 'k', icon: 'pencil', i18n: 'pack.dogs2.diary', labelEN: 'Diary' },
];

interface View {
  dog: DogsV2Dog;
  name: string;
  img: string;
  angel: boolean;
  pct: number;
  done: number;
  ageY: number;           // vek v rokoch (desatinne)
  days: number | null;
  lo: number; hi: number; // dĺžka života plemena
  basis: string;          // odkiaľ je pásmo (podmet vety)
  goal: number;
  bornLabel: string;
  breedLabel: string;
  el: ElementKey | null;
  ro: RoleKey | null;
}

/** Šírka výplne pruhu — rovnaký pomocník ako v PackDogs (`.pk-progress`). */
const fillW = (pct: number) => {
  const w = `${Math.min(100, Math.max(2, pct))}%`;
  return { width: w };
};

export function DogsHubV2({ dogs, latest, tx, chronicle }: { dogs: DogsV2Dog[]; latest: Latest; tx: Tx; chronicle?: ReactNode }) {
  const { lang } = useLang();
  const solo = dogs.length === 1;
  const [sel, setSel] = useState<number>(solo ? 0 : -1);
  const [tab, setTab] = useState<'id' | 'z' | 'k'>('id');
  const [goals, setGoals] = useState<Record<string, number>>({});
  const total = PROGRESS_STEPS.length;

  const views: View[] = useMemo(() => dogs.map((dog) => {
    const L = latest[dog.id] ?? {};
    const s = dog.selections ?? {};
    const angel = dog.life_status === 'deceased';
    const done = PROGRESS_STEPS.filter((st) => hasValue(L[st.field])).length;
    const age = computeAge(s, dog.birth_year, angel && dog.death_date ? new Date(dog.death_date) : undefined);
    const ageY = age ? age.totalDays / 365.25 : 0;
    // Váha: posledné váženie z DOG ID, inak hodnota z heroflowu (`dogs.weight_kg`).
    const num = (x: unknown) => (typeof x === 'number' ? x : typeof x === 'string' ? parseFloat(x) || null : null);
    const w = num(L['health.weightKg']?.value) ?? num(dog.weight_kg);
    const breedEN = s.breed || dog.breed || '';
    const est = estimateLife(breedEN || null, s.mixBreed1, s.mixBreed2, w);
    const bands = asCalBands(L[CAL_BANDS_FIELD]?.value);
    const lo = bands.life?.low ?? Math.round(est.band.low);
    const hi = bands.life?.high ?? Math.round(est.band.high);
    const goal = goals[dog.id] ?? bands.target?.high ?? Math.min(MAX_Y, hi + 5);
    const elV = L['nature.element']?.value, roV = L['nature.role']?.value;
    const isMix = breedEN.toLowerCase() === 'mixed';
    const mixPair = [s.mixBreed1, s.mixBreed2].filter(Boolean).map((b) => localizeBreed(b, lang)).join(' × ');
    const breedLabel = isMix ? (mixPair || tx('pack.dogs2.mixed', 'Mixed breed')) : (breedEN ? localizeBreed(breedEN, lang) : '');
    const basis = isMix && !mixPair
      ? (w ? tx('pack.dogs2.basisWeight', 'A {kg} kg mixed breed').replace('{kg}', String(w)) : tx('pack.dogs2.basisMix', 'A mixed breed'))
      : (mixPair || breedLabel);
    const by = s.birthdayYear, bm = s.birthdayMonth, bd = s.birthdayDay;
    return {
      dog,
      name: dog.dog_name || '—',
      img: sizedUrl(dog.cloudinary_main_url, 320),
      angel,
      pct: Math.round((done / total) * 100),
      done,
      ageY,
      days: age ? age.totalDays : null,
      lo, hi, basis, goal,
      bornLabel: by ? (bd && bm ? `${parseInt(bd, 10)}. ${parseInt(bm, 10)}. ${by}` : String(by)) : '',
      breedLabel,
      el: typeof elV === 'string' && elV in NATURE_ELEMENTS ? (elV as ElementKey) : null,
      ro: typeof roV === 'string' && roV in NATURE_ROLES ? (roV as RoleKey) : null,
    };
  }), [dogs, latest, goals, total, lang, tx]);

  // Pes zmizol zo zoznamu (zmena poradia, smrť…) → späť na svorku.
  useEffect(() => { if (!solo && sel >= views.length) setSel(-1); }, [solo, sel, views.length]);
  const v = sel >= 0 ? views[sel] : null;

  return (
    <div className="dv2">
      <style>{CSS}</style>
      <div className="dv2-head">
        <h2 className="dv2-title">{tx('pack.dogs2.myPack', 'My pack')}</h2>
        <AddDog tx={tx} />
      </div>

      <div className={`dv2-dogs${solo ? ' solo' : ''}`}>
        {views.map((d, i) => (
          <button
            key={d.dog.id}
            type="button"
            className={`dv2-st${d.angel ? ' angel' : ''}${sel === i ? ' sel' : ''}${sel >= 0 && sel !== i ? ' off' : ''}`}
            onClick={() => { if (!solo) setSel(sel === i ? -1 : i); }}
          >
            {!solo && <span className={`dv2-pct${d.pct >= 100 ? ' ok' : ''}`}>{d.angel ? '†' : `${d.pct} %`}</span>}
            <span className="dv2-ring">
              <img src={d.img} alt="" />
              {!d.angel && <i className="dv2-live" />}
            </span>
            <span className="dv2-nm">{d.name.toUpperCase()}</span>
          </button>
        ))}
        {solo && v && !v.angel && <SoloInfo v={v} total={total} tx={tx} />}
      </div>

      <div className="dv2-band">
      <div className="dv2-tabwrap">
      <div className="dv2-tabs" role="tablist">
        {TABS.filter((t) => t.key !== 'k' || chronicle).map((t) => {
          const label = t.key === 'id' ? 'DOG ID' : tx(t.i18n, t.labelEN);
          return (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} aria-label={label}
              className={`dv2-tab${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
              <i className="dv2-ti" style={{ ['--m' as string]: `url(/icons/pack/${t.icon}.svg)` }} />
              <span className="dv2-tl">{label}</span>
            </button>
          );
        })}
      </div>
      </div>

      <div className="dv2-sheet">
        {tab === 'id' && !v && <PackDogId dogs={dogs} latest={latest} tx={tx} />}
        {tab === 'id' && v && <OneDogId v={v} solo={solo} total={total} tx={tx} />}
        {tab === 'z' && !v && <PackLife views={views} onPick={setSel} tx={tx} />}
        {tab === 'z' && v && (
          <OneLife v={v} tx={tx} latest={latest} onGoal={(g) => setGoals((p) => ({ ...p, [v.dog.id]: g }))} />
        )}
        {tab === 'k' && chronicle}
      </div>
      </div>
    </div>
  );
}

/** PRIDAŤ — v appke sa nekupuje (Apple), ďalší pes sa pridáva na webe. */
function AddDog({ tx }: { tx: Tx }) {
  const label = <>+ {tx('pack.dogs2.add', 'Add')}</>;
  if (IS_APP) {
    return (
      <button type="button" className="dv2-add"
        onClick={() => toast(tx('pack.dogs2.addInApp', 'You can add another dog at dogypt.com.'))}>
        {label}
      </button>
    );
  }
  return <Link to="/heroglyph" className="dv2-add">{label}</Link>;
}

function SoloInfo({ v, total, tx }: { v: View; total: number; tx: Tx }) {
  const ok = v.pct >= 100;
  const left = total - v.done;
  const min = Math.max(1, Math.ceil((left * SEC_PER_Q) / 60));
  return (
    <div className={`dv2-solo${ok ? ' ok' : ''}`}>
      <span className="dv2-eb">DOG ID</span>
      <div className="dv2-sp">
        <b>{v.pct} %</b>
        <span>{tx('pack.dogs2.filledOf', 'filled · {n} / {t} questions').replace('{n}', String(v.done)).replace('{t}', String(total))}</span>
      </div>
      <span className="pk-progress">
        <span className={`pk-progress__fill ${ok ? 'pk-progress__fill--done' : 'pk-progress__fill--low'}`} style={fillW(v.pct)} />
      </span>
      {ok ? (
        <p>{tx('pack.dogs2.allDone', 'Done. Everything about your dog in one place.')}</p>
      ) : (
        <>
          <p>{tx('pack.dogs2.left', '{n} questions left · about {m} min').replace('{n}', String(left)).replace('{m}', String(min))}</p>
          <Link to={`/pack/dogs/dogid?dog=${v.dog.id}`} className="dv2-out">{tx('pack.dogs2.fill', 'Fill in')}</Link>
        </>
      )}
    </div>
  );
}

const intro = (tx: Tx) => tx('pack.dogs2.intro', 'Your dog’s “ID card” — made from your answers. Everything about them in one place.');

/** DOG ID svorky = vitráž + % modulov za všetkých žijúcich psov. */
function PackDogId({ dogs, latest, tx }: { dogs: DogsV2Dog[]; latest: Latest; tx: Tx }) {
  const ids = dogs.filter((d) => d.life_status !== 'deceased').map((d) => d.id);
  const mods = LIVE_MODULES.map((m) => ({ m, p: moduleProgress(m, latest, ids) }));
  return (
    <>
      <div className="dv2-vit">
        <span className="dv2-vimg" aria-hidden />
        <div className="dv2-vtx">
          <h3 className="dv2-vt">DOG ID</h3>
          <p className="dv2-vq">{intro(tx)}</p>
          <ul>
            {mods.map(({ m, p }) => (
              <li key={m.key}>
                <span className="ic"><BrandIcon name={m.icon} size={16} tint="dark" /></span>
                <span>{tx(m.i18n, m.labelEN)}</span>
                <b className={p.done ? 'ok' : ''}>{p.pct} %</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link to="/pack/dogs/dogid" className="dv2-cta">
        {dogs.length > 1 ? tx('pack.dogs2.fillAll', 'Fill in for all') : tx('pack.dogs2.fill', 'Fill in')}
      </Link>
    </>
  );
}

function OneDogId({ v, solo, total, tx }: { v: View; solo: boolean; total: number; tx: Tx }) {
  return (
    <>
      {solo ? <p className="dv2-ex">{intro(tx)}</p> : !v.angel && (
        <>
          <div className="dv2-fill">
            <span className="dv2-eb">{tx('pack.dogs2.filled', 'Filled')}</span>
            <span className="pk-progress">
              <span className={`pk-progress__fill ${v.pct >= 100 ? 'pk-progress__fill--done' : 'pk-progress__fill--low'}`} style={fillW(v.pct)} />
            </span>
            <b>{v.pct} %</b>
          </div>
          <p className="dv2-fsub">
            {tx('pack.dogs2.answered', 'answered')} <b>{v.done} / {total}</b> {tx('pack.dogs2.questions', 'questions')}
          </p>
        </>
      )}
      <IdCard v={v} tx={tx} />
      <Link to={`/pack/dogs/${v.dog.id}`} className="dv2-cta">{tx('pack.dogs2.open', 'Open DOG ID')}</Link>
      {v.angel
        ? <p className="dv2-memo">{tx('pack.dogs2.forever', 'forever in the pack')}</p>
        : !solo && v.pct < 100 && <Link to={`/pack/dogs/dogid?dog=${v.dog.id}`} className="dv2-cta2">{tx('pack.dogs2.complete', 'Complete')}</Link>}
    </>
  );
}

/** PREUKAZ — HERO VĽAVO (lock 28. 10.): heroglyf · fotka nad QR · meno + polia + odznaky. */
function IdCard({ v, tx }: { v: View; tx: Tx }) {
  const s = v.dog.selections ?? {};
  const no = v.dog.pack_number ?? 0;
  const country = (v.dog.country || 'SVK').toUpperCase();
  const qrUrl = `https://dogypt.com/pack/dogs/${v.dog.id}`;
  const el = v.el ? NATURE_ELEMENTS[v.el] : null;
  const ro = v.ro ? NATURE_ROLES[v.ro] : null;
  const mrzName = v.name.toUpperCase().normalize('NFD').replace(/[^A-Z]/g, '');
  return (
    <div className={`dv2-idc${v.angel ? ' ang' : ''}`}>
      <div className="dv2-bar">
        <img src={LOGO_INK} alt="DOGYPT" />
        <span className="dv2-no">#{no}</span>
      </div>
      <div className="dv2-grid">
        <div className="dv2-vh">
          <VerticalHeroglyphFrame data={{ selections: s, ownerName: v.dog.owner_name ?? '', patronSvg: v.dog.patron_svg ?? '' }} />
        </div>
        <div className="dv2-lc">
          <img className="dv2-ph" src={v.img} alt="" />
          <span className="dv2-qr"><QRCodeSVG value={qrUrl} level="M" bgColor="transparent" fgColor="#24180a" /></span>
        </div>
        <div className="dv2-mc">
          <div className="dv2-name">{v.name}</div>
          <div className="dv2-f">
            <small>{tx('pack.dogs2.aka', 'Also known as')}</small>
            <i />
          </div>
          <div className="dv2-f">
            <small>{v.angel ? tx('pack.dogs2.lived', 'Lived') : tx('pack.dogs2.born', 'Born')}</small>
            {v.bornLabel ? <span>{v.bornLabel}</span> : <i />}
          </div>
          <div className="dv2-f">
            <small>{tx('pack.dogs2.breed', 'Breed')}</small>
            {v.breedLabel ? <span>{v.breedLabel}</span> : <i />}
          </div>
          <div className="dv2-bdg">
            <div>{el ? <img src={el.art} alt="" /> : <em>?</em>}{el && <b>{tx(el.i18n, el.labelEN)}</b>}{tx('pack.dogs2.element', 'Element')}</div>
            <div>{ro ? <img src={ro.art} alt="" /> : <em>?</em>}{ro && <b>{tx(ro.i18n, ro.labelEN)}</b>}{tx('pack.dogs2.role', 'Nature')}</div>
          </div>
        </div>
      </div>
      <div className="dv2-mrz">
        <span>{`DOGYPT<${country}<${mrzName}<${String(no).padStart(7, '0')}${'<'.repeat(30)}`}</span>
        <span>{'<<<<DOGID'}</span>
      </div>
    </div>
  );
}

const zone = (t: number, v: View) => (t < v.ageY ? 'c-ok' : v.angel ? 'c-none' : t < v.goal ? 'c-goal' : 'c-may');

function Legend({ v, tx }: { v?: View; tx: Tx }) {
  return (
    <>
      <div className="dv2-leg">
        <span><i className="c-ok" />{tx('pack.dogs2.lgLived', 'lived')}</span>
        <span><i className="c-br" />{tx('pack.dogs2.lgBreed', 'breed life span')}{v ? ` · ${v.lo}–${v.hi}` : ''}</span>
        <span><i className="c-goal" />{tx('pack.dogs2.lgGoal', 'your goal')}{v && !v.angel ? ` · ${v.goal}` : ''}</span>
        <span><i className="c-may" />{tx('pack.dogs2.lgMay', 'still possible · record 30')}</span>
      </div>
      <p className="dv2-note">{tx('pack.dogs2.note', 'The scale ends at 30 — the age of the oldest dog in history (Bluey, 29 y 5 m). Breed life span is reality; everything above it can be reached with good care.')}</p>
    </>
  );
}

function OneLife({ v, tx, onGoal, latest }: { v: View; tx: Tx; onGoal: (g: number) => void; latest: Latest }) {
  // Zápis cieľa s oneskorením — klikanie − + nesmie poslať udalosť za každý ťuk.
  const timer = useRef<number | null>(null);
  const setGoal = (g: number) => {
    const next = Math.max(v.hi, Math.min(MAX_Y, g));
    onGoal(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const saved = asCalBands(latest[v.dog.id]?.[CAL_BANDS_FIELD]?.value);
      appendDogEvents([{
        dogId: v.dog.id, field: CAL_BANDS_FIELD, source: 'profile', recordedAt: new Date().toISOString(),
        value: { ...saved, target: { low: Math.min(v.hi + 1, next), high: next } },
      }]).catch(() => toast(tx('pack.diary.saveFailed', 'The entry could not be saved. Try again.')));
    }, 800);
  };
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const yrs = Math.floor(v.ageY);
  const where = v.ageY < v.lo
    ? tx('pack.dogs2.whereBefore', 'how long you make it together is up to you.')
    : v.ageY < v.hi
      ? tx('pack.dogs2.whereIn', '{name} is right in that range.').replace('{name}', v.name)
      : tx('pack.dogs2.wherePast', '{name} has already beaten it.').replace('{name}', v.name);
  const rows = [];
  for (let y = 0; y < MAX_Y; y++) {
    const inb = y <= v.hi;
    const cls = `dv2-y${inb ? ' in' : ''}${y === 0 ? ' a' : ''}${y === v.hi ? ' z' : ''}${inb && y >= v.lo ? ' lo' : ''}`;
    rows.push(<span key={`y${y}`} className={cls}>{y}</span>);
    rows.push(
      <div key={`r${y}`} className="dv2-mr">
        {Array.from({ length: 12 }, (_, m) => <i key={m} className={zone(y + (m + 0.5) / 12, v)} />)}
      </div>,
    );
  }
  return (
    <>
      <div className="dv2-big">
        <b>{v.days != null ? v.days.toLocaleString('sk-SK') : '—'}</b>
        <span className="dv2-eb">{v.angel ? tx('pack.dogs2.daysWith', 'Days with us') : tx('pack.dogs2.daysLife', 'Days of life')}</span>
      </div>
      <p className="dv2-ex">
        {v.angel
          ? <>{tx('pack.dogs2.livedFor', 'Lived {y} years.').replace('{y}', String(yrs))} {v.basis} {tx('pack.dogs2.usually', 'usually lives')} <b>{v.lo}–{v.hi}</b>.</>
          : <>{tx('pack.dogs2.hasYears', 'Has {y} years behind them.').replace('{y}', String(yrs))} {v.basis} {tx('pack.dogs2.usually', 'usually lives')} <b>{v.lo}–{v.hi}</b> — {where}</>}
      </p>
      <div className="dv2-mg">{rows}</div>
      {!v.angel && (
        <div className="dv2-goal">
          <span className="t">{tx('pack.dogs2.goal', 'Our goal')}</span>
          <span className="s">
            <button type="button" onClick={() => setGoal(v.goal - 1)} aria-label="−">−</button>
            <b>{v.goal}</b>
            <button type="button" onClick={() => setGoal(v.goal + 1)} aria-label="+">+</button>
          </span>
        </div>
      )}
      <Legend v={v} tx={tx} />
    </>
  );
}

/** Šírka zlatej čiary pod riadkom psa: od 0 po horný vek plemena. */
const spanW = (hi: number) => {
  const w = `${(hi / MAX_Y) * 100}%`;
  return { width: w };
};

function PackLife({ views, onPick, tx }: { views: View[]; onPick: (i: number) => void; tx: Tx }) {
  return (
    <>
      <p className="dv2-ex">{tx('pack.dogs2.lifeIntro', 'How much life your dogs have behind them — and how much more they can have. One block = one year. Tap a dog.')}</p>
      {views.map((v, i) => (
        <button key={v.dog.id} type="button" className="dv2-lf" onClick={() => onPick(i)}>
          <span className={v.angel ? 'a' : ''}><img src={v.img} alt="" /></span>
          <span>
            <span className="dv2-tt">
              <b>{v.name.toUpperCase()}</b>
              <span>{Math.floor(v.ageY)}{v.angel ? '' : ` · ${tx('pack.dogs2.goalShort', 'goal')} ${v.goal}`}</span>
            </span>
            <span className="dv2-ybw">
              <span className="dv2-yb">
                {Array.from({ length: MAX_Y }, (_, y) => <i key={y} className={zone(y + 0.5, v)} />)}
              </span>
              <span className="dv2-ybr" style={spanW(v.hi)} />
            </span>
          </span>
        </button>
      ))}
      <Legend tx={tx} />
    </>
  );
}
