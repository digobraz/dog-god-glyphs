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
      { id: 'home.hero', anchor: WIZ.hero, text: 'pack.wizard.home.body', since: '2026-08-24' },
      { id: 'home.dogs', anchor: WIZ.dogsRow, text: 'pack.wizard.toDogs.body', textNoDog: 'pack.wizard.toDogs.bodyNoDog', since: '2026-08-24' },
      { id: 'home.navOut', anchor: WIZ.navMap, text: 'pack.wizard.toMap.body', since: '2026-08-24' },
      { id: 'home.navAdd', anchor: WIZ.navAdd, text: 'pack.wizard.navAdd.body', since: '2026-10-06' },
      { id: 'home.navMe', anchor: WIZ.navMe, text: 'pack.wizard.navMe.body', since: '2026-10-06' },
      { id: 'home.navAinubis', anchor: WIZ.navAinubis, text: 'pack.wizard.navAinubis.body', handoff: true, since: '2026-10-06' },
    ],
  },
  // ── PRVÁ NÁVŠTEVA — texty čakajú na OK (hárok `plany/nakres-wizard-2026-10-06.html`) ──
  { key: 'map', routes: ['/pack/map'], basket: 1, status: 'caka', steps: [
    { id: 'map.pilgrim', anchor: '.trp-midentity', text: 'pack.wizard.map.pilgrim', since: '2026-10-06' },
    { id: 'map.search', anchor: '.trp-mheader-row2, .trp-topsearchrow', text: 'pack.wizard.map.search', since: '2026-10-06' },
    { id: 'map.cats', anchor: '.trp-mheader-cats, .trp-sidebar-top', text: 'pack.wizard.map.cats', since: '2026-10-06' },
    { id: 'map.layers', anchor: '.trp-layersdd', text: 'pack.wizard.map.layers', since: '2026-10-06' },
    { id: 'map.note', anchor: '.trp-cluster', text: 'pack.wizard.map.note', since: '2026-10-06' },
    { id: 'map.list', anchor: '.trp-mactions', text: 'pack.wizard.map.list', since: '2026-10-06' },
    { id: 'map.plus', anchor: '.pk-medal', text: 'pack.wizard.map.plus', since: '2026-10-06' },
  ] },
  { key: 'triplist', routes: ['/pack/map/triplist'], basket: 2, status: 'caka', steps: [
    { id: 'triplist.tabs', anchor: '.tl-tabs', text: 'pack.wizard.triplist.tabs', since: '2026-10-06' },
    { id: 'triplist.want', anchor: WIZ.tlWant, text: 'pack.wizard.triplist.want', since: '2026-10-06' },
    { id: 'triplist.wish', anchor: WIZ.tlWish, text: 'pack.wizard.triplist.wish', since: '2026-10-06' },
  ] },
  { key: 'tripArticle', routes: ['/pack/map/:country/:slug', '/pack/map/:slug'], basket: 2, status: 'caka', steps: [
    { id: 'tripArticle.walked', anchor: '.pta-acts', text: 'pack.wizard.tripArticle.walked', since: '2026-10-06' },
    { id: 'tripArticle.go', anchor: '.tgo-ctas', text: 'pack.wizard.tripArticle.go', since: '2026-10-06' },
    { id: 'tripArticle.review', anchor: '.tcm-wrap', text: 'pack.wizard.tripArticle.review', since: '2026-10-06' },
    { id: 'tripArticle.problem', anchor: '.pta-problem', text: 'pack.wizard.tripArticle.problem', since: '2026-10-06' },
  ] },
  { key: 'tripStory', routes: ['/pack/map/:country/:slug/pribeh/:n'], basket: 2, status: 'nie', why: 'čítanie príbehu — nič nové na ovládanie', steps: [] },
  { key: 'dogs', routes: ['/pack/dogs'], basket: 2, status: 'caka', steps: [
    { id: 'dogs.block', anchor: '.hub-hover', text: 'pack.wizard.dogs.block', since: '2026-10-06' },
    { id: 'dogs.tiles', anchor: '.hub-tiles', text: 'pack.wizard.dogs.tiles', since: '2026-10-06' },
    { id: 'dogs.quiz', anchor: '.hub-hero', text: 'pack.wizard.dogs.quiz', since: '2026-10-06' },
    { id: 'dogs.calendar', anchor: '.cal-head', text: 'pack.wizard.dogs.calendar', since: '2026-10-06' },
  ] },
  { key: 'dogId', routes: ['/pack/dogs/:id'], basket: 2, status: 'caka', steps: [] },
  { key: 'ainubis', routes: ['/pack/ainubis/*'], basket: 1, status: 'caka', steps: [
    { id: 'ainubis.me', anchor: '.pkid-me', text: 'pack.wizard.ainubis.me', since: '2026-10-06' },
    { id: 'ainubis.planes', anchor: '.akv-planes', text: 'pack.wizard.ainubis.planes', since: '2026-10-06' },
    { id: 'ainubis.scroll', anchor: '.akv-mactions, .akv-zv', text: 'pack.wizard.ainubis.scroll', since: '2026-10-06' },
  ] },
  { key: 'sniffer', routes: ['/pack/sniffer'], basket: 2, status: 'caka', steps: [
    { id: 'sniffer.card', anchor: '.bd-card', text: 'pack.wizard.sniffer.card', since: '2026-10-06' },
  ] },
  { key: 'profile', routes: ['/pack/profile'], basket: 1, status: 'caka', steps: [
    { id: 'profile.head', anchor: '.pf-head', text: 'pack.wizard.profile.head', on: false, since: '2026-10-06' },
    { id: 'profile.pilgrim', anchor: '.pf-tap', text: 'pack.wizard.profile.pilgrim', on: false, since: '2026-10-06' },
    { id: 'profile.bones', anchor: '.pknet-side', text: 'pack.wizard.profile.bones', since: '2026-10-06' },
  ] },
  { key: 'member', routes: ['/pack/u/:id'], basket: 2, status: 'nie', why: 'cudzí profil — rovnaké prvky ako môj', steps: [] },
  { key: 'nature', routes: ['/pack/nature'], basket: 2, status: 'caka', steps: [] },
  // ── KÔŠ 3 a technické routy — wizard nikdy ──
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
