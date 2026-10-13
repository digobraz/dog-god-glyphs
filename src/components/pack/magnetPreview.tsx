/**
 * NÁHĽAD `/pack` PRE `/magnet` (12. 10. 2026, v8).
 *
 * Matej: *„darčeky zdarma musia byť 1:1 s /pack (bez navu) a s info pozrieť ďalších xy
 * tripov/zvitkov — a to bude smerovať na heroflow resp. na popup (pre prístup musíš byť
 * DOGYPŤAN)"* + *„dáme všetky výlety, ale tie ostatné sa nebudú dať rozkliknúť — bude
 * vidno a dať sa scrolovať, ale detail uvidia len 10, pri podcastoch to isté"*.
 *
 * 🔴 ŽIADNE KÓPIE. `/magnet/vylety`, `/magnet/ainubis`, `/magnet/kviz` montujú TIE ISTÉ
 *    obrazovky ako `/pack` (PackMap, PackTripArticle, PackAinubis, PackNatureQuiz). Kópia
 *    by sa do mesiaca rozišla s appkou. Obrazovka sa na režim pýta `useMagnetPreview()`
 *    a robí len tri veci: (1) `PackBottomNav` sa v náhľade nevykreslí — miesto neho stojí
 *    lišta s CTA odtiaľto, (2) čo nie je zdarma, ukáže so zámkom a ťuk otvorí popup,
 *    (3) cesty `/pack/*` prekladá `usePackNavigate()` — mimo darčeka vedú do popupu,
 *    nie na `/login`.
 *
 * Zdarma: 10 výletov (`MAGNET_FREE_TRIPS`) a okruh 1 Cesty psa (`O1-*`, 10 zvitkov
 * s podcastom). Body sa sľubujú LEN pri výletoch (PÚTNIK) — zvitky body nemajú.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useLocation, type NavigateOptions } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { openPhotoInvite } from '@/lib/photoInvite';
import { PACK_THEME as T, FONT_TITLE, FONT_UI, VEIL_CSS } from './packTheme';
import { AINUBIS } from './ainubisSkin';
import ainubisFace from '@/assets/ainubis-head.webp';
import type { PackIdentity } from './usePackIdentity';

/** Desať výletov zdarma — výber z nákresu 12. 10. (5 regiónov SR + 3 krajiny). */
export const MAGNET_FREE_TRIPS = [
  'sulovske-skaly-strazovske-vrchy', 'bielovodska-dolina-vysoke-tatry', 'sutovsky-vodopad-buchta-mala-fatra',
  'gaderska-dolina-velka-fatra', 'chtelnica-rajska-zahrada-male-karpaty', 'seealpsee', 'sivy-vrch-zapadne-tatry',
  'majdan-klasicky-okruh-male-karpaty', 'velky-choc-chocske-vrchy', 'vintgar-radovna-tiesnava',
];
const FREE_TRIPS = new Set(MAGNET_FREE_TRIPS);

/**
 * VÝKLAD = MATEJOVE SKUTOČNÉ VÝLETY (Matej 13. 10. 2026: *„daj tam moje meno/iniciály aj údaje
 * s výletov"*). Snímka z LIVE `trip_walked` zakladateľa (#1) k 13. 10. 2026: 75 riadkov, z toho
 * 72 kurátorských trás. Tri vlastné členské výlety (`local-*`) sem nejdú — náhľad nečíta
 * `pack_trips` (anonym ich nevidí), takže by sa nemali na čo napárovať.
 * Hlavička, ŠTATISTIKY aj TRIPLIST v náhľade z toho rátajú tou istou funkciou ako appka;
 * do úložiska návštevníka sa NIČ z toho nezapisuje.
 */
export const MAGNET_FOUNDER = {
  name: 'Matej',
  initial: 'M',
  walked: [
    'amonova-luka-male-karpaty', 'bielovodska-dolina-vysoke-tatry', 'bled',
    'budmerice-kastiel-park-male-karpaty', 'bukova-priehrada-male-karpaty',
    'cachticky-hrad-plesivce-male-karpaty', 'casta-pila-male-karpaty', 'celo-veterlin-male-karpaty',
    'chopok-dumbier-nizke-tatry', 'chtelnica-nadrz-male-karpaty', 'chtelnica-plesiva-male-karpaty',
    'chtelnica-priehrada-male-karpaty', 'chtelnica-rajska-zahrada-male-karpaty',
    'chtelnica-vyhlad-klenova-male-karpaty', 'cierna-skala-male-karpaty', 'dechtice-male-karpaty',
    'devinska-kobyla-male-karpaty', 'dobra-voda-vyhlad-male-karpaty',
    'dracia-studna-biely-vrch-biele-karpaty', 'egres-male-karpaty', 'gacovska-skala-slovensky-raj',
    'gaderska-dolina-velka-fatra', 'haluzicka-tiesnava-biele-karpaty', 'havrania-skala-slovensky-raj',
    'hradok-bezovec-povazsky-inovec', 'jelenec-a-keltek-male-karpaty', 'klak-mala-fatra', 'kralova',
    'kukla-male-karpaty', 'kvacianska-dolina-chocske-vrchy', 'lancarska-luka-male-karpaty',
    'liptovska-mara', 'majdan-klasicky-okruh-male-karpaty', 'maly-rozsutec-mala-fatra',
    'medvedie-udolie-limbach-male-karpaty', 'mincol-mala-fatra', 'ohniste-nizke-tatry',
    'oresianska-priehrada', 'orlie-skaly-male-karpaty', 'ostredok-velka-fatra', 'palcmanska-masa',
    'plavecky-hrad-male-karpaty', 'poloniny', 'seealpsee', 'sip', 'sivy-vrch-zapadne-tatry',
    'slepy-vrch-male-karpaty', 'slnava', 'snp-cesta-hrdinov', 'sokolie-mala-fatra',
    'sokolie-skaly-marhat-povazsky-inovec', 'stary-plast-male-karpaty', 'strazov-strazovske-vrchy',
    'sulovske-skaly-strazovske-vrchy', 'sutovsky-vodopad-buchta-mala-fatra', 'tesare-povazsky-inovec',
    'tlsta-ostra-velka-fatra', 'tomasovsky-vyhlad-slovensky-raj', 'vapec-strazovske-vrchy',
    'vapenna-rostun-male-karpaty', 'velky-krivan-mala-fatra', 'velky-lopenik-rozhladna-biele-karpaty',
    'vintgar-radovna-tiesnava', 'vrsatecke-podhradie-chelova-okruh-biele-karpaty',
    'vysoka-na-steroidoch-tajne-skaly-male-karpaty', 'zaruby-1-kostol-certov-zlab-zaruby-male-karpaty',
    'zaruby-2-smolenice-stanica-havranica-zaruby-male-karpaty',
    'zaruby-3-bukova-ostry-kamen-zaruby-male-karpaty', 'zaruby-4-jahodnik-certov-zlab-zaruby-male-karpaty',
    'zaruby-5-kostol-kaluza-zaruby-male-karpaty', 'zbynovsky-budzogan-strazovske-vrchy',
    'zelene-pleso-vysoke-tatry',
  ] as readonly string[],
  /** CHCEM ÍSŤ — jeho neprejdené riadky v `user_trips` (LIVE 13. 10.). Dátum Choča (10. 10.)
   *  vynechaný: už prešiel a výklad by ukázal zmeškaný termín. */
  want: [
    { tripId: 'velky-choc-chocske-vrchy', status: 'looking' as const },
    { tripId: 'zlatnicka-dolina-biele-karpaty', status: 'solo' as const },
  ],
  /** TRIPWISH — Matej žiadne prianie nemá (Matej 13. 10.: *„tu treba doplniť chcem ísť a
   *  tripwish"*), preto výklad ukazuje 4 SKUTOČNÉ priania svorky z `wish_pins` (LIVE 13. 10.),
   *  bez mien — tak, ako ich vidí každý na mape. */
  wishes: [
    { id: 'mg-w1', placeName: 'Nový Zéland', countryCode: 'nz', tripKind: 'multi', when: 'lifetime', lat: -41.30839, lon: 174.02632, placeKind: 'country' },
    { id: 'mg-w2', placeName: 'Dolomity', countryCode: 'it', tripKind: 'roadtrip', when: 'lifetime', lat: 46.29716, lon: 12.05199, placeKind: 'point' },
    { id: 'mg-w3', placeName: 'Švédsko', countryCode: 'se', tripKind: 'roadtrip', when: 'lifetime', lat: 62.91021, lon: 15.60448, placeKind: 'country' },
    { id: 'mg-w4', placeName: 'Nórsko', countryCode: 'no', tripKind: 'roadtrip', when: 'lifetime', lat: 68.86129, lon: 18.34854, placeKind: 'country' },
  ] as const,
};

/** Identita náhľadu = výklad Matejovho účtu BEZ session (nič sa nenačíta ani nezapíše).
 *  Jedna pre všetky obrazovky — `usePackIdentity()` by anonyma poslal na /login. */
export const MAGNET_IDENTITY: PackIdentity = {
  session: null, loading: false, sessionReady: true, dogs: [], devotion: 0, bones: 0,
  avatarUrl: null, avatarInitial: MAGNET_FOUNDER.initial, packTotal: null, packToday: null,
};
export const isFreeTrip = (id?: string | null) => !!id && FREE_TRIPS.has(id);
/** Zvitky zdarma = okruh 1 Cesty psa „Odkiaľ pes prišiel" (O1-1 … O1-10). */
export const isFreeScrollCode = (code?: string | null) => !!code && /^O1-\d+$/.test(code);

export type MagnetKind = 'trips' | 'ainubis' | 'quiz';
export type LockWhat = 'trip' | 'scroll' | 'action' | 'save';
type Ctx = { kind: MagnetKind; lock: (what?: LockWhat) => void };
const MagnetCtx = createContext<Ctx | null>(null);

/** `null` = bežná appka. Inak sme na `/magnet/*` a obrazovka je výklad, nie prevádzka. */
export function useMagnetPreview(): Ctx | null {
  return useContext(MagnetCtx);
}

/**
 * Preklad cesty `/pack/*` → `/magnet/*`. `null` = za tým sú len Dogypťania (popup).
 * Výlet zdarma ide na svoj článok, ostatné zámok; mapa, AINUBIS a kvíz sú darčeky celé.
 */
export function magnetPath(p: string): string | null {
  const cut = p.search(/[?#]/);
  const path = cut < 0 ? p : p.slice(0, cut);
  const tail = cut < 0 ? '' : p.slice(cut);
  if (path.startsWith('/magnet')) return p;
  if (path === '/pack/map' || path === '/pack/map/') return '/magnet/vylety' + tail;
  const trip = path.match(/^\/pack\/map\/(?:([a-z]{2,3})\/)?([^/]+)(\/.*)?$/);
  if (path === '/pack/map/triplist') return '/magnet/vylety/triplist' + tail;
  if (trip && trip[2] !== 'triplist') {
    if (!isFreeTrip(trip[2])) return null;
    return `/magnet/vylety/${trip[1] ? trip[1] + '/' : ''}${trip[2]}${trip[3] ?? ''}${tail}`;
  }
  if (path.startsWith('/pack/ainubis')) return '/magnet/ainubis' + path.slice('/pack/ainubis'.length) + tail;
  if (path === '/pack/nature') return '/magnet/kviz' + tail;
  return null;
}

/** `useNavigate()` pre obrazovky, ktoré žijú aj v náhľade. Mimo náhľadu je to presne
 *  `useNavigate()`; v náhľade preloží cestu a čo nejde, otvorí popup. */
export function usePackNavigate() {
  const nav = useNavigate();
  const mg = useMagnetPreview();
  return useCallback((to: string | number, opts?: NavigateOptions) => {
    if (typeof to === 'number') { nav(to); return; }
    if (!mg) { nav(to, opts); return; }
    const m = magnetPath(to);
    if (m) nav(m, opts); else mg.lock(to.startsWith('/pack/map/') ? 'trip' : 'action');
  }, [nav, mg]);
}

const CSS = `
${VEIL_CSS}
.mgp-bar{position:fixed;left:0;right:0;bottom:0;z-index:150;display:flex;justify-content:center;
  padding:8px 12px calc(8px + env(safe-area-inset-bottom));pointer-events:none;}
.mgp-bar-in{pointer-events:auto;display:flex;align-items:center;gap:12px;width:100%;max-width:832px;box-sizing:border-box;
  padding:8px 12px;border-radius:16px;background:${AINUBIS.surface};border:1px solid ${AINUBIS.edgeStrong};box-shadow:${AINUBIS.panelShadow};}
.mgp-bar-txt{display:none;flex:1;min-width:0;flex-direction:column;gap:4px;color:${AINUBIS.inkDim};font-family:${FONT_UI};font-size:12px;line-height:1.4;}
.mgp-bar-txt b{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:${AINUBIS.ink};}
.mgp-bar-acts{flex:1;display:flex;flex-direction:column;align-items:stretch;gap:4px;}
.mgp-bar-acts .mgp-cta{flex:none;}
@media (min-width:768px){ .mgp-bar-txt{display:flex;} .mgp-bar-acts{flex:0 0 280px;} }
/* BLOK AINUBISA — AI-PALUBA šat (tmavá doska, cyan lem), tvár, meno, vtipný nadpis a veta. */
.mgp-ai{display:grid;grid-template-columns:auto 1fr;gap:12px 16px;align-items:center;box-sizing:border-box;padding:16px;
  border-radius:16px;background:${AINUBIS.surface};border:1px solid ${AINUBIS.edgeStrong};box-shadow:${AINUBIS.panelShadow};color:${AINUBIS.ink};text-align:left;}
.mgp-ai-face{flex:none;width:48px;height:48px;border-radius:999px;background:${AINUBIS.faceBg};box-shadow:${AINUBIS.faceRing};}
.mgp-ai--dock .mgp-ai-face{width:64px;height:64px;}
.mgp-ai-txt{display:flex;flex-direction:column;gap:4px;min-width:0;}
.mgp-ai-who{font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.14em;color:${AINUBIS.ink};}
.mgp-ai-who span{color:${AINUBIS.aiInk};text-shadow:${AINUBIS.aiShadow};}
.mgp-ai-h{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:16px;line-height:1.25;letter-spacing:.14em;text-transform:uppercase;color:${AINUBIS.ink};}
.mgp-ai-p{margin:0;font-family:${FONT_UI};font-weight:400;font-size:14px;line-height:1.5;color:${AINUBIS.inkDim};}
.mgp-ai-side{grid-column:1 / -1;display:flex;flex-direction:column;align-items:stretch;gap:8px;}
.mgp-ai--dock{grid-template-columns:auto 1fr 280px;}
.mgp-ai--dock .mgp-ai-side{grid-column:auto;}
.mgp-ai--dock .mgp-ai-p{font-size:12px;}
.mgp-ai-chip{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;border-radius:12px;cursor:pointer;
  background:${AINUBIS.raised};border:1px solid ${AINUBIS.edge};color:${AINUBIS.ink};font-family:${FONT_UI};font-weight:600;font-size:12px;text-align:left;}
.mgp-ai-chip:hover{border-color:${AINUBIS.edgeStrong};}
.mgp-ai-chip img{width:20px;height:20px;flex:none;}
.mgp-ai-chip img.mgp-ink{filter:brightness(0) invert(1);opacity:.9;}
.mgp-cta{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 16px;
  border-radius:8px;background:${AINUBIS.ctaGrad};border:1px solid ${AINUBIS.ctaEdge};color:${AINUBIS.ctaInk};font-family:${FONT_TITLE};
  font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;box-shadow:${AINUBIS.ctaShadow};}
.mgp-cta:hover{background:${AINUBIS.ctaGradHover};}
.mgp-cta:active{transform:scale(.98);}
/* 13. 10. 2026: CTA náhľadu je VŠADE v brande AINUBISa (Matej: *„daj ho všade ainubis a staň sa
   dogypťanom"*) — varianty lapis/zlato podľa podkladu zanikli; šípku späť nahradilo malé „Späť" pod CTA. */
/* CTA V BLOKU (Matej 13. 10.: *„to cta dolu daj do bloku… nie mimo — vyzerá to divne a pod cta
   malý späť"*). Na PC nesie CTA info blok obrazovky a samostatná lišta zmizne; mobil ju má ďalej. */
.mgp-dockacts{display:flex;flex-direction:column;align-items:stretch;gap:8px;}
.mgp-dockacts .mgp-cta{flex:none;width:100%;}
.mgp-backlink{align-self:center;background:none;border:0;padding:4px 8px;cursor:pointer;font-family:${FONT_UI};font-weight:500;
  font-size:10px;letter-spacing:.22em;text-transform:uppercase;text-decoration:underline;text-underline-offset:3px;color:${AINUBIS.inkDim};}
@media (min-width:1024px){ body:has(.mgp-dockacts) .mgp-bar{display:none;} }
/* POPUP AINUBISA (Matej 13. 10.: *„popup s ainubisom s jeho logom a brandom aj novým textingom"*). */
.mgp-card--ai{background:${AINUBIS.surface};border:1px solid ${AINUBIS.edgeStrong};border-radius:16px;box-shadow:${AINUBIS.panelShadow};color:${AINUBIS.ink};}
.mgp-card--ai .mgp-face{display:block;width:80px;height:80px;margin:0 auto 12px;border-radius:999px;background:${AINUBIS.faceBg};box-shadow:${AINUBIS.faceRing};}
.mgp-card--ai .mgp-who{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.14em;color:${AINUBIS.ink};}
.mgp-card--ai .mgp-who span{color:${AINUBIS.aiInk};text-shadow:${AINUBIS.aiShadow};}
.mgp-card--ai .mgp-eye{color:${AINUBIS.cyan};margin-top:4px;}
.mgp-card--ai .mgp-h{color:${AINUBIS.ink};}
.mgp-card--ai .mgp-p{color:${AINUBIS.inkDim};}
.mgp-card--ai .mgp-ghost{border-color:${AINUBIS.edge};color:${AINUBIS.ink};}
.mgp-card{width:100%;max-width:400px;padding:32px 24px 24px;text-align:center;}
.mgp-eye{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${T.cardEdge};}
.mgp-h{font-family:${FONT_TITLE};font-weight:700;font-size:24px;line-height:1.2;letter-spacing:.02em;text-transform:uppercase;color:${T.inkStrong};margin:12px 0 0;}
.mgp-p{font-family:${FONT_UI};font-weight:400;font-size:14px;line-height:1.55;color:${T.inkWarm};margin:12px 0 24px;}
.mgp-acts{display:flex;flex-direction:column;gap:8px;}
.mgp-ghost{display:block;text-decoration:none;padding:12px 16px;border-radius:8px;background:transparent;border:1px solid ${T.cardEdge};color:${T.inkStrong};
  font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;}
`;

/** Popup „Ďalej idú len Dogypťania" — jeden pre všetky tri darčeky. */
function LockPopup({ what, onClose }: { what: LockWhat; onClose: () => void }) {
  // 13. 10. 2026 Matej: *„ten oznam o exkluzívnom obsahu daj všade, nie len na ainubis stránke…
  // daj ho všade ainubis a staň sa dogypťanom"* — JEDEN popup v brande AINUBISa pre všetky
  // tri darčeky. Skúšobný zápis výletu (`save`) má vlastné znenie a prihlásenie.
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  return (
    <div className="pk-veil pk-veil--modal" style={{ zIndex: 400 }} onClick={onClose} role="dialog" aria-modal="true">
      <div className="mgp-card mgp-card--ai" onClick={(e) => e.stopPropagation()}>
        <img className="mgp-face" src={ainubisFace} alt="" aria-hidden="true" />
        <div className="mgp-who"><span>AI</span>NUBIS</div>
        {what === 'save' ? (<>
          <div className="mgp-eye">{tx('magnet.lock.eye.save', 'Logging a trip')}</div>
          <h2 className="mgp-h">{tx('magnet.lock.save.h', 'Save it as a Dogyptian')}</h2>
          <p className="mgp-p">{tx('magnet.lock.save.p', 'This was a test run — the trip was not saved. Dogyptians keep their trips in the triplist, collect kilometres and points and the pack sees where they went.')}</p>
        </>) : (<>
          <div className="mgp-eye">{tx('magnet.lock.ai.eye', 'Exclusive content')}</div>
          <h2 className="mgp-h">{tx('magnet.lock.ai.h', 'Only Paws')}</h2>
          <p className="mgp-p">{tx('magnet.lock.ai.p', 'Yes, we have exclusive content too. Ours is about dogs, so you don’t have to hide it from anyone. €11 once, for good — less than one café visit. This time, take your dog. He won’t touch the coffee, but he’ll love this app.')}</p>
        </>)}
        <div className="mgp-acts">
          <button type="button" className="mgp-cta" onClick={() => { onClose(); openPhotoInvite(); }}>
            {tx('magnet.cta', 'Become Dogyptian')}
          </button>
          {what === 'save' && (
            <a className="mgp-ghost" href="/login">{tx('magnet.lock.login', 'I am a Dogyptian — log in')}</a>
          )}
          <button type="button" className="mgp-ghost" onClick={onClose}>{tx('magnet.lock.ai.stay', 'I’ll keep sniffing for free')}</button>
        </div>
      </div>
    </div>
  );
}

/** CTA + malé „Späť" VNÚTRI bloku AINUBISa. */
export function MagnetDockActions() {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const nav = useNavigate();
  return (
    <div className="mgp-dockacts">
      <button type="button" className="mgp-cta" onClick={() => openPhotoInvite()}>{tx('magnet.cta.price', 'Become Dogyptian · €11')}</button>
      <button type="button" className="mgp-backlink" onClick={() => nav('/magnet')}>{tx('magnet.backShort', 'Back')}</button>
    </div>
  );
}

/**
 * BLOK AINUBISA — JEDEN pre každú stránku náhľadu (Matej 13. 10. 2026: *„nemyslel som len cta
 * brand ainubis, ale celý blok aj s jeho logom a satirickým nápisom, vtipným všade na každej
 * stránke"*). Tvár + meno + vtipný nadpis a veta k TEJ stránke + CTA a malé „Späť".
 * `dock` = PC, dole v pravej časti obrazovky · `list` = mobil, vo vrchu zoznamu (bez CTA —
 * to nesie spodná lišta) · `extra` = akcie stránky (napr. „Skús pridať výlet").
 */
export function MagnetAinubisBlock({ h, p, where, extra }: { h: string; p: string; where: 'dock' | 'list'; extra?: ReactNode }) {
  return (
    <section className={`mgp-ai mgp-ai--${where}`}>
      <img className="mgp-ai-face" src={ainubisFace} alt="" aria-hidden="true" />
      <div className="mgp-ai-txt">
        <div className="mgp-ai-who"><span>AI</span>NUBIS</div>
        <h3 className="mgp-ai-h">{h}</h3>
        <p className="mgp-ai-p">{p}</p>
      </div>
      {/* Pravý stĺpec (Matej 13. 10.: *„blok je príliš vysoký… cta presuň na pravú stranu: pridaj
          výlet, cta a späť = 3 pod sebou"*). Na mobile (`list`) len akcie stránky, CTA nesie lišta. */}
      {(extra || where === 'dock') && (
        <div className="mgp-ai-side">
          {extra}
          {where === 'dock' && <MagnetDockActions />}
        </div>
      )}
    </section>
  );
}

/** Ktorá veta AINUBISa patrí stránke — podľa cesty (obrazovky samy nič nehlásia). */
function barNoteKey(path: string): string {
  if (path.startsWith('/magnet/vylety/triplist')) return 'stats';
  if (path.startsWith('/magnet/vylety/')) return 'article';
  if (path.startsWith('/magnet/vylety')) return 'trips';
  if (path.startsWith('/magnet/ainubis')) return 'vault';
  if (path.startsWith('/magnet/kviz')) return 'quiz';
  return 'default';
}

/** Obal podstránky `/magnet/*`: kontext + lišta s CTA namiesto spodného navu + popup. */
export function MagnetPreview({ kind, children }: { kind: MagnetKind; children: ReactNode }) {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const nav = useNavigate();
  const note = barNoteKey(useLocation().pathname);
  const [lockOpen, setLockOpen] = useState<LockWhat | null>(null);
  const ctx = useMemo<Ctx>(() => ({ kind, lock: (w = 'action') => setLockOpen(w) }), [kind]);
  return (
    <MagnetCtx.Provider value={ctx}>
      <style>{CSS}</style>
      {children}
      {/* LIŠTA = tá istá doska AINUBISa v malom: tvár + veta k stránke (od 768 px) + CTA a „Späť".
          Na PC ju skryje blok stránky, ak ho stránka má (`:has(.mgp-dockacts)`). */}
      <div className={`mgp-bar mgp-bar--${kind}`}>
        <div className="mgp-bar-in">
          <img className="mgp-ai-face" src={ainubisFace} alt="" aria-hidden="true" />
          <div className="mgp-bar-txt">
            <b>{tx(`magnet.ai.${note}.h`, 'A taste')}</b>
            <span>{tx(`magnet.ai.${note}.bar`, 'The full menu is for Dogyptians.')}</span>
          </div>
          <div className="mgp-bar-acts">
            <button type="button" className="mgp-cta" onClick={() => openPhotoInvite()}>{tx('magnet.cta.price', 'Become Dogyptian · €11')}</button>
            <button type="button" className="mgp-backlink" onClick={() => nav('/magnet')}>{tx('magnet.backShort', 'Back')}</button>
          </div>
        </div>
      </div>
      {lockOpen && <LockPopup what={lockOpen} onClose={() => setLockOpen(null)} />}
    </MagnetCtx.Provider>
  );
}
