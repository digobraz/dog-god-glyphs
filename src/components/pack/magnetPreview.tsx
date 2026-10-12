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
import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { openPhotoInvite } from '@/lib/photoInvite';
import { PACK_BOX, PACK_THEME as T, PACK_SHADOW, FONT_TITLE, FONT_UI, VEIL_CSS } from './packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from './navGoldSkin';
import { BackIcon } from './BackButton';

/** Desať výletov zdarma — výber z nákresu 12. 10. (5 regiónov SR + 3 krajiny). */
export const MAGNET_FREE_TRIPS = [
  'sulovske-skaly-strazovske-vrchy', 'bielovodska-dolina-vysoke-tatry', 'sutovsky-vodopad-buchta-mala-fatra',
  'gaderska-dolina-velka-fatra', 'chtelnica-rajska-zahrada-male-karpaty', 'seealpsee', 'sivy-vrch-zapadne-tatry',
  'majdan-klasicky-okruh-male-karpaty', 'velky-choc-chocske-vrchy', 'vintgar-radovna-tiesnava',
];
const FREE_TRIPS = new Set(MAGNET_FREE_TRIPS);
export const isFreeTrip = (id?: string | null) => !!id && FREE_TRIPS.has(id);
/** Zvitky zdarma = okruh 1 Cesty psa „Odkiaľ pes prišiel" (O1-1 … O1-10). */
export const isFreeScrollCode = (code?: string | null) => !!code && /^O1-\d+$/.test(code);

export type MagnetKind = 'trips' | 'ainubis' | 'quiz';
export type LockWhat = 'trip' | 'scroll' | 'action';
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
  const trip = path.match(/^\/pack\/map\/(?:([a-z]{2})\/)?([^/]+)(\/.*)?$/);
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
  padding:12px 16px calc(12px + env(safe-area-inset-bottom));pointer-events:none;}
.mgp-bar-in{pointer-events:auto;display:flex;gap:8px;width:100%;max-width:480px;}
.mgp-back{flex:0 0 48px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;
  background:${T.cardGrad};border:1px solid ${T.cardEdge};color:${T.inkStrong};cursor:pointer;box-shadow:${PACK_SHADOW.panel};}
.mgp-back svg{width:20px;height:20px;}
.mgp-cta{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 16px;
  border-radius:8px;background:${LAPIS.grad};border:1px solid ${LAPIS.edge};color:${T.onDark};font-family:${FONT_TITLE};
  font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;box-shadow:${LAPIS_BTN_SHADOW};}
.mgp-cta:active,.mgp-back:active{transform:scale(.98);}
.mgp-card{width:100%;max-width:400px;padding:32px 24px 24px;text-align:center;}
.mgp-eye{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${T.cardEdge};}
.mgp-h{font-family:${FONT_TITLE};font-weight:700;font-size:24px;line-height:1.2;letter-spacing:.02em;text-transform:uppercase;color:${T.inkStrong};margin:12px 0 0;}
.mgp-p{font-family:${FONT_UI};font-weight:400;font-size:14px;line-height:1.55;color:${T.inkWarm};margin:12px 0 24px;}
.mgp-acts{display:flex;flex-direction:column;gap:8px;}
.mgp-ghost{padding:12px 16px;border-radius:8px;background:transparent;border:1px solid ${T.cardEdge};color:${T.inkStrong};
  font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;}
`;

/** Popup „Ďalej idú len Dogypťania" — jeden pre všetky tri darčeky. */
function LockPopup({ what, onClose }: { what: LockWhat; onClose: () => void }) {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  return (
    <div className="pk-veil pk-veil--modal" style={{ zIndex: 400 }} onClick={onClose} role="dialog" aria-modal="true">
      <div className="mgp-card" style={PACK_BOX.card} onClick={(e) => e.stopPropagation()}>
        <div className="mgp-eye">{tx(`magnet.lock.eye.${what}`, 'For Dogyptians')}</div>
        <h2 className="mgp-h">{tx('magnet.lock.h', 'Dogyptians only beyond this point')}</h2>
        <p className="mgp-p">{tx('magnet.lock.p', 'The key is your dog’s heroglyph — €11 once, for good: every trip, every scroll with a podcast and AINUBIS.')}</p>
        <div className="mgp-acts">
          <button type="button" className="mgp-cta" onClick={() => { onClose(); openPhotoInvite(); }}>
            {tx('magnet.cta', 'Become Dogyptian')}
          </button>
          <button type="button" className="mgp-ghost" onClick={onClose}>{tx('magnet.lock.stay', 'Keep looking around')}</button>
        </div>
      </div>
    </div>
  );
}

/** Obal podstránky `/magnet/*`: kontext + lišta s CTA namiesto spodného navu + popup. */
export function MagnetPreview({ kind, children }: { kind: MagnetKind; children: ReactNode }) {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const nav = useNavigate();
  const [lockOpen, setLockOpen] = useState<LockWhat | null>(null);
  const ctx = useMemo<Ctx>(() => ({ kind, lock: (w = 'action') => setLockOpen(w) }), [kind]);
  return (
    <MagnetCtx.Provider value={ctx}>
      <style>{CSS}</style>
      {children}
      <div className="mgp-bar">
        <div className="mgp-bar-in">
          <button type="button" className="mgp-back" onClick={() => nav('/magnet')} aria-label={tx('magnet.back', 'Back')}><BackIcon /></button>
          <button type="button" className="mgp-cta" onClick={() => openPhotoInvite()}>{tx('magnet.cta.price', 'Become Dogyptian · €11')}</button>
        </div>
      </div>
      {lockOpen && <LockPopup what={lockOpen} onClose={() => setLockOpen(null)} />}
    </MagnetCtx.Provider>
  );
}
