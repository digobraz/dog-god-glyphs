// REGISTER PREHLIADKY — jediný zdroj pravdy, ČO AINUBIS kde ukazuje (pipeline wizarda).
//
// Matej 6. 10. 2026: *„potrebujeme si urobiť pipeline wizarda tak aby sme vždy vedeli doplniť
// nového pri novej funkcii či sa vrátiť editovať opraviť … taku mapu kde sa hodí a kde nie"*.
// Zadanie: `plany/zadanie-wizard-ainubis-2026-10-06.md` · hárok `plany/nakres-wizard-2026-10-06.html`.
//
// DVE VECI V JEDNOM ZOZNAME:
//   1. PRVÉ PRIHLÁSENIE — obrazovka `home` (/pack): čo je kde (chrbtica DOMOV · VON · + · AINUBIS · JA).
//   2. PRVÁ NÁVŠTEVA — každá ďalšia obrazovka má vlastné kroky, ktoré AINUBIS ukáže, keď na ňu
//      človek príde PRVÝKRÁT (Matej 6. 10.: „ak pojde niekam kde ešte nebol napr. klikne na sniffer").
//
// ⚠️ KAŽDÁ routa `/pack` tu MUSÍ mať riadok — aj keď je to „nehodí sa". Stráž `npm run check:wizard`
//    (z `vystupy/web/`) zhodí build, keď v `App.tsx` pribudne routa bez rozhodnutia. Tak sa nová
//    funkcia ohlási sama a nikto nemusí pamätať, že „treba doplniť wizard".
// ⚠️ Videné sa pamätá PO KROKOCH (`id`), nie po poradí. Doplnený krok preto uvidí aj starý člen —
//    len ten jeden, nie celú prehliadku znova. Id kroku sa NEPREMENÚVA (premenovanie = krok
//    ukázaný všetkým ešte raz). Text sa meniť smie, žije v i18n.
// ⚠️ Nový krok je ZAPNUTÝ (`on` chýba = true). Vypnúť = `on: false`, krok ostáva v mape.
//
// Kôš (lock `architektura-pack.md` §3): 1 SOM DOMA · 2 POZERÁM SA · 3 ROBÍM ÚLOHU.
// V koši 3 wizard NIE JE NIKDY — úlohu neprerušuje; pokyn tam nesie pilulka toku (vlna 3).
// Spúšťač žije v spodnej lište (`PackBottomNav`), ktorá v koši 3 nie je — pravidlo drží sama stavba.

import { WIZ, type WizAnchor } from './wizAnchors';

export type WizStep = {
  /** Trvalé meno kroku (`obrazovka.vec`). NEPREMENÚVAŤ — je to kľúč „videl som". */
  id: string;
  /** Čo svieti. `welcome` = celoplošné privítanie bez výrezu. `.trieda` = prvý VIDITEĽNÝ prvok
   *  s tou triedou (viac tried čiarkou = mobil a PC majú iný blok) — pre bloky obrazoviek, ktoré už triedu majú (stráž over, že trieda v kóde
   *  žije: `check:wizard`). Nové kotvy na lište/homepage idú cez `WIZ` register. */
  anchor: WizAnchor | 'welcome' | `.${string}`;
  /** i18n kľúč textu; `textNoDog` keď člen ešte nemá psa. */
  text: string;
  textNoDog?: string;
  /** Posledný krok odovzdá chat AINUBISOVI (tlačidlá „Spýtaj sa ma" / „Neskôr"). */
  handoff?: boolean;
  /** Default `true`. */
  on?: boolean;
  /** Kedy krok pribudol — pre mapu a pre „čo je nové". */
  since: string;
};

export type WizScreen = {
  key: string;
  /** Vzor cesty presne tak, ako je napísaný v `<Route path>` v `App.tsx`. */
  routes: string[];
  basket: 1 | 2 | 3;
  /** `kroky` = má kroky · `caka` = hodí sa, text čaká na Matejovo OK · `nie` = nehodí sa (`why`). */
  status: 'kroky' | 'caka' | 'nie';
  why?: string;
  steps: WizStep[];
};

export const WIZ_SCREENS: WizScreen[] = [
  {
    key: 'home', routes: ['/pack'], basket: 1, status: 'kroky',
    steps: [
      { id: 'home.welcome', anchor: 'welcome', text: 'pack.wizard.welcome.body', since: '2026-08-24' },
      { id: 'home.navOut', anchor: WIZ.navMap, text: 'pack.wizard.toMap.body', since: '2026-08-24' },
      { id: 'home.navAdd', anchor: WIZ.navAdd, text: 'pack.wizard.navAdd.body', since: '2026-10-06' },
      { id: 'home.navMe', anchor: WIZ.navMe, text: 'pack.wizard.navMe.body', since: '2026-10-06' },
      { id: 'home.navAinubis', anchor: WIZ.navAinubis, text: 'pack.wizard.navAinubis.body', handoff: true, since: '2026-10-06' },
    ],
  },
  // ── PRVÁ NÁVŠTEVA — texty odklepnuté v tabuli 7. 10. 2026 (Matej: „ok daj to na live“) ──
  { key: 'map', routes: ['/pack/map'], basket: 1, status: 'kroky', steps: [
    { id: 'map.pilgrim', anchor: '.trp-midentity', text: 'pack.wizard.map.pilgrim', since: '2026-10-06' },
    { id: 'map.search', anchor: '.trp-mheader-row2, .trp-topsearchrow', text: 'pack.wizard.map.search', since: '2026-10-06' },
    { id: 'map.cats', anchor: '.trp-mheader-cats, .trp-sidebar-top', text: 'pack.wizard.map.cats', since: '2026-10-06' },
    { id: 'map.layers', anchor: '.trp-layersdd', text: 'pack.wizard.map.layers', since: '2026-10-06' },
    { id: 'map.note', anchor: '.trp-cluster', text: 'pack.wizard.map.note', since: '2026-10-06' },
    { id: 'map.list', anchor: '.trp-mactions', text: 'pack.wizard.map.list', since: '2026-10-06' },
    { id: 'map.plus', anchor: '.pk-medal', text: 'pack.wizard.map.plus', since: '2026-10-06' },
  ] },
  { key: 'triplist', routes: ['/pack/map/triplist'], basket: 2, status: 'kroky', steps: [
    { id: 'triplist.tabs', anchor: '.tl-tabs', text: 'pack.wizard.triplist.tabs', since: '2026-10-06' },
    { id: 'triplist.want', anchor: WIZ.tlWant, text: 'pack.wizard.triplist.want', since: '2026-10-06' },
    { id: 'triplist.wish', anchor: WIZ.tlWish, text: 'pack.wizard.triplist.wish', since: '2026-10-06' },
  ] },
  { key: 'tripArticle', routes: ['/pack/map/:country/:slug', '/pack/map/:slug'], basket: 2, status: 'kroky', steps: [
    { id: 'tripArticle.walked', anchor: '.pta-acts', text: 'pack.wizard.tripArticle.walked', since: '2026-10-06' },
    { id: 'tripArticle.go', anchor: '.tgo-ctas', text: 'pack.wizard.tripArticle.go', since: '2026-10-06' },
    { id: 'tripArticle.review', anchor: '.tcm-wrap', text: 'pack.wizard.tripArticle.review', since: '2026-10-06' },
    { id: 'tripArticle.problem', anchor: '.pta-problem', text: 'pack.wizard.tripArticle.problem', since: '2026-10-06' },
  ] },
  { key: 'tripStory', routes: ['/pack/map/:country/:slug/pribeh/:n'], basket: 2, status: 'nie', why: 'čítanie príbehu — nič nové na ovládanie', steps: [] },
  { key: 'dogs', routes: ['/pack/dogs'], basket: 2, status: 'kroky', steps: [
    { id: 'dogs.block', anchor: '.hub-hover', text: 'pack.wizard.dogs.block', since: '2026-10-06' },
    { id: 'dogs.tiles', anchor: '.hub-tiles', text: 'pack.wizard.dogs.tiles', since: '2026-10-06' },
    { id: 'dogs.quiz', anchor: '.hub-hero', text: 'pack.wizard.dogs.quiz', since: '2026-10-06' },
    { id: 'dogs.calendar', anchor: '.cal-head', text: 'pack.wizard.dogs.calendar', since: '2026-10-06' },
  ] },
  { key: 'dogId', routes: ['/pack/dogs/:id'], basket: 2, status: 'caka', steps: [] },
  { key: 'chronicle', routes: ['/pack/dogs/chronicle'], basket: 2, status: 'caka', steps: [] },
  { key: 'dogIdModules', routes: ['/pack/dogs/dogid'], basket: 2, status: 'caka', steps: [] },
  { key: 'ainubis', routes: ['/pack/ainubis/*'], basket: 1, status: 'kroky', steps: [
    // Matej 7. 10.: prvý krok = AINUBIS vo všeobecnosti, výrez na jeho ikonke v lište.
    { id: 'ainubis.intro', anchor: WIZ.navAinubis, text: 'pack.wizard.ainubis.intro', since: '2026-10-07' },
    { id: 'ainubis.me', anchor: '.pkid-me', text: 'pack.wizard.ainubis.me', since: '2026-10-06' },
    { id: 'ainubis.planes', anchor: '.akv-planes', text: 'pack.wizard.ainubis.planes', since: '2026-10-06' },
    { id: 'ainubis.scroll', anchor: '.akv-mactions, .akv-zv', text: 'pack.wizard.ainubis.scroll', since: '2026-10-06' },
  ] },
  { key: 'sniffer', routes: ['/pack/sniffer'], basket: 2, status: 'caka', steps: [
    { id: 'sniffer.card', anchor: '.bd-card', text: 'pack.wizard.sniffer.card', on: false, since: '2026-10-06' },
  ] },
  { key: 'profile', routes: ['/pack/profile'], basket: 1, status: 'kroky', steps: [
    { id: 'profile.head', anchor: '.pf-head', text: 'pack.wizard.profile.head', on: false, since: '2026-10-06' },
    { id: 'profile.pilgrim', anchor: '.pf-tap', text: 'pack.wizard.profile.pilgrim', on: false, since: '2026-10-06' },
    { id: 'profile.bones', anchor: '.pknet-side', text: 'pack.wizard.profile.bones', since: '2026-10-06' },
  ] },
  { key: 'member', routes: ['/pack/u/:id'], basket: 2, status: 'nie', why: 'cudzí profil — rovnaké prvky ako môj', steps: [] },
  { key: 'nature', routes: ['/pack/nature'], basket: 2, status: 'caka', steps: [] },
  // ── KÔŠ 3 a technické routy — wizard nikdy ──
  { key: 'sosNew', routes: ['/pack/sos/new'], basket: 3, status: 'nie', why: 'úloha — vyhlásenie straty, pokyn nesie formulár', steps: [] },
  { key: 'sosFlyer', routes: ['/pack/sos/:slug/letak'], basket: 3, status: 'nie', why: 'úloha — editor letáku', steps: [] },
  { key: 'sosVet', routes: ['/pack/sos/pohotovost'], basket: 2, status: 'nie', why: 'veterinárna pohotovosť — v núdzi sa nič nevysvetľuje, zoznam a volanie', steps: [] },
  { key: 'klinika', routes: ['/pack/klinika/:cid'], basket: 2, status: 'nie', why: 'profil kliniky — čítanie, volanie a postrehy; nič na vysvetlenie', steps: [] },
  { key: 'sosPage', routes: ['/pack/sos/:slug'], basket: 2, status: 'nie', why: 'stratený pes — v núdzi sa nič nevysvetľuje, nepoužíva sa prvýkrát len na čítanie', steps: [] },
  { key: 'sosPlan', routes: ['/pack/sos/:slug/plan'], basket: 2, status: 'nie', why: 'SOS plán — zoznam kontaktov, nič na vysvetlenie', steps: [] },
  { key: 'addTrip', routes: ['/pack/add/trip', '/pack/add'], basket: 3, status: 'nie', why: 'úloha — pokyn nesie pilulka toku', steps: [] },
  { key: 'quiz', routes: ['/pack/dogs/quiz/:key'], basket: 3, status: 'nie', why: 'úloha — kvíz sa vysvetľuje sám', steps: [] },
  { key: 'join', routes: ['/pack/join/:token'], basket: 3, status: 'nie', why: 'pozvánka — ešte nie je člen', steps: [] },
  { key: 'tech', routes: ['/pack/_herolab', '/pack/ainubis/sources', '/pack/buddy', '/pack/*'], basket: 3, status: 'nie', why: 'presmerovanie / laboratórium', steps: [] },
];

/** `/pack/map/:slug` → regulárny výraz nad reálnou cestou. */
function routeRe(pattern: string): RegExp {
  const body = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\/\*$/, '(?:/.*)?')
    .replace(/:[A-Za-z]+/g, '[^/]+');
  return new RegExp(`^${body}/?$`);
}

/** Obrazovka pre cestu. Presnejší vzor vyhráva (triplist pred `:slug`), `/pack/*` je posledný. */
export function screenFor(pathname: string): WizScreen | null {
  let best: { s: WizScreen; score: number } | null = null;
  for (const s of WIZ_SCREENS) {
    for (const r of s.routes) {
      if (!routeRe(r).test(pathname)) continue;
      const score = r.split('/').filter((x) => x && !x.startsWith(':') && x !== '*').length * 10 - (r.endsWith('*') ? 5 : 0);
      if (!best || score > best.score) best = { s, score };
    }
  }
  return best?.s ?? null;
}

/** Zapnuté kroky obrazovky. `preview` (DEV `?wizpreview=1`) pustí aj obrazovky, ktoré čakajú
 *  na Matejovo OK — tak vznikajú snímky do tabule textov, presne v tom tvare, v akom pôjdu von. */
export function stepsFor(s: WizScreen | null, preview = false): WizStep[] {
  if (!s || !(s.status === 'kroky' || (preview && s.status === 'caka'))) return [];
  return s.steps.filter((x) => x.on !== false);
}

// ─── SYSTÉM KOMNÁT (17. 11. 2026) ────────────────────────────────────────────
// Matej 17. 11.: *„úvodný ainubis wizard sa ukončí odznakom, ale bude vidno aj ďalšie odznaky a aj to navrhne:
// máš čas? ukážem ti každú komnatu teraz alebo až pri používaní?“* · „ano“ na systém komnát · *„skús to postaviť
// nech to vidím v test appke“*. Nákres + mapa: `plany/nakresy/wizard-appka-2026-11-17/` (simulacia.html, mapa.html).
// Komnata = skupina krokov s poradím, spúšťačom a odznakom. Kroky žijú TU, nie vo WIZ_SCREENS: staré prehliadky
// obrazoviek ostávajú pre web (dogypt.com), komnaty bežia pod `KOMNATY_ON` (testovací kanál).
// ⚠️ Id kroku sa NEPREMENÚVA — „videl som“ = id v `wiz_seen` (user_metadata + localStorage), rovnako ako vyššie.
//    Získaný odznak = `odz:<id>` v tom istom zozname. Žiadne nové miesto na údaje o človeku.

export type KomnataId = 'uvod' | 'pes' | 'ja' | 'sos' | 'mapa' | 'sniffer' | 'ainubis';

export type Krok = Omit<WizStep, 'since'> & {
  /** ŤUKACÍ KROK (18. 11. 2026): bublina bez „Ďalej“, výrez prepúšťa ťuk do appky a krok postúpi až skutočným
   *  ťuknutím na cieľ (pulzujúci výrez + šípka + prst). Ťuk mimo cieľa sa zahodí, Preskočiť funguje vždy. */
  tuk?: boolean;
  /** Kde krok žije (cesta presne ako `pathname`). Keď je človek inde, prehliadka ho tam zavedie. */
  na?: string;
  /** Pred krokom ťukni na tento prvok (otvor záložku, panel), aby svietilo to, o čom krok hovorí. */
  klik?: string;
  /** Po kroku ťukni sem (zavri menu, panel, chat, ktorý predošlý krok otvoril). */
  po?: string;
};

/** Riadok checklistu komnaty = jedna vec, ktorú komnata človeka naučí. Text žije v i18n
 *  `pack.wizard.k.uci.<komnata>.<id>`, `uk` je krok, na ktorý skočí „↺ znova“ (a od ktorého ide komnata). */
export type UciPolozka = {
  id: string;
  uk: string;
  /** Kedy vec pribudla (RRRR-MM-DD). Položka s `since` u človeka, čo komnatu už má, svieti NOVÉ a kľúčik
   *  zasvieti len pre ňu. Dnes nie je nová žiadna — pole je pripravené. Položka bez `since` je pôvodná. */
  since?: string;
};

export type Komnata = {
  id: KomnataId;
  poradie: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Kedy sa zjaví: `prve-otvorenie` sama · `po-uvode` cez „Teraz“ alebo AINUBISa · `prva-navsteva` kľúčik svieti. */
  spustac: 'prve-otvorenie' | 'po-uvode' | 'prva-navsteva';
  /** Kde žije (vzor ako v `<Route path>`). Kľúčik svieti, keď je človek na niektorej z nich. */
  routes: string[];
  /** Kam ísť, keď sa komnata spustí odinakiaľ („Teraz“, pripomienka). */
  start: string;
  /** Obrazovka bez spodnej lišty (kľúčik tam nie je) → komnata sa spustí sama pri prvej návšteve. */
  bezListy?: boolean;
  /** Nová vec = nový riadok tu (a v `uci`), nie zásah do enginu. */
  kroky: Krok[];
  /** Checklist komnaty (šuplík po ťuku na dvere). */
  uci: UciPolozka[];
  odznak: { id: string; nazov: string; obrazok: string };
};

const ODZ = (n: string) => `/icons/sys/odznak-${n}.webp`;
/** Panel `+`: riadok objektu z registra (`data-create-id`). */
const RIADOK = (id: string): `.${string}` => `.att-entry-row[data-create-id="${id}"]`;
const MENU_PROFIL = '.pack-avatar-menu button:first-of-type';
const MENU_SVORKA = '.pack-avatar-menu button:last-of-type';
const AI_ZAVRI = '.ainubis-launcher[aria-expanded="true"]';
const tx = (id: string) => `pack.wizard.${id}`;

export const KOMNATY: Komnata[] = [
  { id: 'uvod', poradie: 0, spustac: 'prve-otvorenie', routes: ['/pack'], start: '/pack',
    odznak: { id: 'uvod', nazov: 'pack.wizard.k.odz.uvod', obrazok: ODZ('uvodny-kluc') },
    uci: [
      { id: 'feed', uk: 'k0.feed' }, { id: 'mapa', uk: 'k0.mapa' }, { id: 'labka', uk: 'k0.labka' },
      { id: 'ainubis', uk: 'k0.ainubis' }, { id: 'fotka', uk: 'k0.fotkaTuk' }, { id: 'pomoc', uk: 'k0.aiTuk' },
    ],
    kroky: [
      { id: 'k0.vitaj', anchor: 'welcome', text: tx('k0.vitaj') },
      { id: 'k0.feed', anchor: WIZ.navHome, na: '/pack', text: tx('k0.feed') },
      { id: 'k0.mapa', anchor: WIZ.navMap, na: '/pack', text: tx('k0.mapa') },
      { id: 'k0.labka', anchor: WIZ.navAdd, na: '/pack', text: tx('k0.labka') },
      { id: 'k0.ainubis', anchor: WIZ.navAinubis, na: '/pack', text: tx('k0.ainubis') },
      { id: 'k0.fotkaTuk', anchor: WIZ.navMe, na: '/pack', tuk: true, text: tx('k0.fotkaTuk') },
      { id: 'k0.menu', anchor: '.pack-avatar-menu', na: '/pack', text: tx('k0.menu') },
      { id: 'k0.aiTuk', anchor: '.pk-hub-ainubis', na: '/pack', tuk: true, text: tx('k0.aiTuk') },
      { id: 'k0.preslov', anchor: WIZ.aiTerc, na: '/pack', po: AI_ZAVRI, text: tx('k0.preslov') },
    ] },
  { id: 'pes', poradie: 1, spustac: 'po-uvode', routes: ['/pack/dogs'], start: '/pack',
    odznak: { id: 'pes', nazov: 'pack.wizard.k.odz.pes', obrazok: ODZ('strazca-psa') },
    uci: [
      { id: 'fotka', uk: 'k1.fotka' }, { id: 'zivot', uk: 'k1.zivotTuk' }, { id: 'dennik', uk: 'k1.dennikTuk' }, { id: 'dogid', uk: 'k1.dogTuk' },
    ],
    kroky: [
      { id: 'k1.navFotka', anchor: WIZ.navMe, na: '/pack', tuk: true, text: tx('k1.navFotka') },
      { id: 'k1.navSvorka', anchor: MENU_SVORKA, na: '/pack', tuk: true, text: tx('k1.navSvorka') },
      { id: 'k1.fotka', anchor: '.dv2-ring', na: '/pack/dogs', text: tx('k1.fotka') },
      { id: 'k1.zivotTuk', anchor: '.dv2-tab:nth-child(2)', na: '/pack/dogs', tuk: true, text: tx('k1.zivotTuk') },
      { id: 'k1.zivot', anchor: '.dv2-sheet', na: '/pack/dogs', text: tx('k1.zivot') },
      { id: 'k1.dennikTuk', anchor: '.dv2-tab:nth-child(3)', na: '/pack/dogs', tuk: true, text: tx('k1.dennikTuk') },
      { id: 'k1.dennik', anchor: '.dv2-sheet', na: '/pack/dogs', text: tx('k1.dennik') },
      { id: 'k1.dogTuk', anchor: '.dv2-tab:nth-child(1)', na: '/pack/dogs', tuk: true, text: tx('k1.dogTuk') },
      { id: 'k1.vyplnit', anchor: '.dv2-out', na: '/pack/dogs', tuk: true, text: tx('k1.vyplnit') },
    ] },
  { id: 'ja', poradie: 2, spustac: 'prva-navsteva', routes: ['/pack/profile'], start: '/pack',
    odznak: { id: 'ja', nazov: 'pack.wizard.k.odz.ja', obrazok: ODZ('kronikar') },
    uci: [
      { id: 'levely', uk: 'k2.levely' }, { id: 'bones', uk: 'k2.bones' }, { id: 'upravit', uk: 'k2.upravit' }, { id: 'zapis', uk: 'k2.labkaTuk' },
    ],
    kroky: [
      { id: 'k2.navFotka', anchor: WIZ.navMe, na: '/pack', tuk: true, text: tx('k2.navFotka') },
      { id: 'k2.navProfil', anchor: MENU_PROFIL, na: '/pack', tuk: true, text: tx('k2.navProfil') },
      { id: 'k2.levely', anchor: '.me-lv', na: '/pack/profile', text: tx('k2.levely') },
      { id: 'k2.bones', anchor: '.rk--bones', na: '/pack/profile', text: tx('k2.bones') },
      { id: 'k2.pozvi', anchor: '.me-out', na: '/pack/profile', text: tx('k2.pozvi') },
      { id: 'k2.upravit', anchor: '.me-cta', na: '/pack/profile', text: tx('k2.upravit') },
      { id: 'k2.labkaTuk', anchor: WIZ.navAdd, na: '/pack/profile', tuk: true, text: tx('k2.labkaTuk') },
      { id: 'k2.zapis', anchor: RIADOK('devotion'), na: '/pack/profile', po: '.att-entry-backdrop', text: tx('k2.zapis') },
    ] },
  { id: 'sos', poradie: 3, spustac: 'prva-navsteva', routes: ['/pack'], start: '/pack',
    odznak: { id: 'sos', nazov: 'pack.wizard.k.odz.sos', obrazok: ODZ('bezpecie') },
    uci: [{ id: 'pas', uk: 'k3.pas' }, { id: 'koleso', uk: 'k3.kolesoTuk' }],
    kroky: [
      { id: 'k3.pas', anchor: '.pk-tops', na: '/pack', text: tx('k3.pas') },
      { id: 'k3.kolesoTuk', anchor: '.sos-btn', na: '/pack', tuk: true, text: tx('k3.kolesoTuk') },
      { id: 'k3.koleso', anchor: '.ppu-sheet', na: '/pack', po: '.ppu-root', text: tx('k3.koleso') },
    ] },
  { id: 'mapa', poradie: 4, spustac: 'prva-navsteva', routes: ['/pack/map'], start: '/pack',
    odznak: { id: 'mapa', nazov: 'pack.wizard.k.odz.mapa', obrazok: ODZ('kartograf') },
    uci: [{ id: 'vrstvy', uk: 'k4.vrstvy' }, { id: 'vylety', uk: 'k4.vylety' }, { id: 'vlastny', uk: 'k4.labka' }],
    kroky: [
      { id: 'k4.navTuk', anchor: WIZ.navMap, na: '/pack', tuk: true, text: tx('k4.navTuk') },
      { id: 'k4.vrstvy', anchor: '.trp-layersdd', na: '/pack/map', text: tx('k4.vrstvy') },
      { id: 'k4.vylety', anchor: '.trp-mheader-cats, .trp-sidebar-top', na: '/pack/map', text: tx('k4.vylety') },
      { id: 'k4.labka', anchor: WIZ.navAdd, na: '/pack/map', text: tx('k4.labka') },
    ] },
  { id: 'sniffer', poradie: 5, spustac: 'prva-navsteva', routes: ['/pack/sniffer'], start: '/pack', bezListy: true,
    odznak: { id: 'sniffer', nazov: 'pack.wizard.k.odz.sniffer', obrazok: ODZ('partak') },
    uci: [{ id: 'partak', uk: 'k5.labkaTuk' }],
    kroky: [
      { id: 'k5.labkaTuk', anchor: WIZ.navAdd, na: '/pack', tuk: true, text: tx('k5.labkaTuk') },
      { id: 'k5.panelTuk', anchor: RIADOK('sniffer'), na: '/pack', tuk: true, text: tx('k5.panelTuk') },
      { id: 'k5.cta', anchor: '.bd-cta', na: '/pack/sniffer', text: tx('k5.cta') },
    ] },
  { id: 'ainubis', poradie: 6, spustac: 'prva-navsteva', routes: ['/pack/ainubis/*'], start: '/pack',
    odznak: { id: 'ainubis', nazov: 'pack.wizard.k.odz.ainubis', obrazok: ODZ('ucenec') },
    uci: [{ id: 'planes', uk: 'k6.planes' }, { id: 'progres', uk: 'k6.zvitky' }],
    kroky: [
      { id: 'k6.navTuk', anchor: WIZ.navAinubis, na: '/pack', tuk: true, text: tx('k6.navTuk') },
      { id: 'k6.planes', anchor: '.akv-planes', na: '/pack/ainubis', text: tx('k6.planes') },
      { id: 'k6.zvitky', anchor: '.akv-world', na: '/pack/ainubis', text: tx('k6.zvitky') },
    ] },
];

/** ZNALEC CHRÁMU = všetky komnaty prejdené. Nie je komnata, počíta sa zo siedmich. */
export const ZNALEC = { id: 'znalec', nazov: 'pack.wizard.k.odz.znalec', obrazok: ODZ('znalec') };

/** Komnata pre cestu, ktorej ešte niečo chýba (kľúčik svieti). Prvá podľa poradia. */
export function komnataFor(pathname: string, done: (k: Komnata) => boolean): Komnata | null {
  return KOMNATY.find((k) => !done(k) && k.routes.some((r) => routeRe(r).test(pathname))) ?? null;
}

/** Položky komnaty, ktoré sú pre človeka NOVÉ: má už odznak komnaty, položka má `since` a jej krok ešte nevidel. */
export function novePolozky(k: Komnata, seen: Set<string>): UciPolozka[] {
  if (!seen.has(`odz:${k.id}`)) return [];
  return k.uci.filter((p) => !!p.since && !seen.has(p.uk));
}

/** Komnata je hotová, keď je prejdená celá, alebo keď má odznak a nechýba jej žiadna NOVÁ položka
 *  (kroky pridané neskôr tak starú komnatu „neodomknú“ naspäť — kľúčik zasvieti len pre novinku). */
export const komnataHotova = (seen: Set<string>) => (k: Komnata): boolean =>
  seen.has(`odz:${k.id}`) ? novePolozky(k, seen).length === 0 : k.kroky.every((x) => seen.has(x.id));
