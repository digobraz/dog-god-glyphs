// ============================================================================
// MAPA PRIANÍ — vrstva 🎯 (BUDDY krok 2, 24. 9. 2026)
//
// Zadanie: `plany/zadanie-assnif-2026-09-24.md` §2 · nákres `plany/nakres-assnif-2026-09-24.html`.
//
// ── JEDNO MIESTO = JEDEN PIN ────────────────────────────────────────────────
// CHCEM TIEŽ robí KÓPIU s rovnakou súradnicou (Matej: „chcem tiež = kópia, nie väzba").
// Keby sa každé prianie kreslilo samo, sedem ľudí na Rysoch by bolo sedem pinov na
// jednom pixeli, ktoré žiadne priblíženie nerozdelí. Preto sa priania najprv zlúčia
// podľa miesta (súradnica zaokrúhlená na ~100 m) a bublina povie „7 chce na Rysy"
// so zoznamom ľudí — presne signál, ktorý nákres chcel. Až SKUPINY sa potom zhlukujú
// podľa pixelov ako odkazy (`clusterPoints.ts`).
//
// ── VIDNO NA KAŽDOM PRIBLÍŽENÍ ─────────────────────────────────────────────
// Odkazy majú prah z12 (bod na konkrétnom mieste). Prianie býva celý štát — „Nórsko"
// na z12 nikto neuvidí. Prah tu preto NIE JE, drží to zhlukovanie.
//
// ⚠️ Kruh, lem a emoji idú z `circleMark.ts` / `markEmoji.ts` (lock brand.md r. 48).
// ⚠️ Bublina požičiava triedy `.mn-popup` / `.mn-bubble-*` z `MAP_NOTES_CSS` — tá istá
//    karta ako pri odkaze, nie druhý dizajn. Vlastné sú len riadky ľudí a akcie.
// ============================================================================
import { sizedUrl } from '@/services/cloudinaryService';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import { PACK_THEME as T, PACK_SHADOW, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { useT } from '@/i18n/LanguageContext';
import { APP_NEW } from '@/lib/packFlags';
import { SysIcon } from '@/components/pack/SysIcon';
import { circleMarkHtml } from './circleMark';
import { stickerSrc, stickerImg } from './mapStickers';
import { clusterByPixels, clusterPx, clusterRadiusForZoom } from './clusterPoints';
import { FONT_EMOJI, WISH_EMOJI, WISH_RIM } from './markEmoji';
import {
  WISH_WHENS, cancelWishPin, meTooWish,
  type WishPin, type WishWhen,
} from './wishData';
import { emitOpenThread } from '@/components/pack/messaging/openBridge';
import { startWishDM } from '@/components/pack/messaging/packMessaging';

const POPUP_PAD_TOP = 170;
const POPUP_PAD_BOTTOM = 110;

/** Panel v appke (Matej 10. 11. 2026): kresba druhu výletu. Web ostáva na štítkoch textom. */
const WISH_KIND_ICON: Record<WishPin['tripKind'], string> = { short: 'den-walk', day: 'typ-turistika', multi: 'den-sunset', roadtrip: 'mapa', abroad: 'den-abroad' };
const WISH_ICON = 'pridaj-tripwish';

type Group = { key: string; lat: number; lon: number; place: string; items: WishPin[] };

function groupByPlace(list: WishPin[]): Group[] {
  const m = new Map<string, Group>();
  for (const w of list) {
    const key = `${w.lat.toFixed(3)}:${w.lon.toFixed(3)}`;
    const g = m.get(key);
    if (g) g.items.push(w);
    else m.set(key, { key, lat: w.lat, lon: w.lon, place: w.placeName, items: [w] });
  }
  return [...m.values()];
}

function pinIcon(count: number): L.DivIcon {
  // Počet ľudí na mieste sedí ako malý odznak na kruhu — kruh sám ostáva ten istý.
  const badge = count > 1 ? `<b class="wl-count">${count}</b>` : '';
  const lampa = stickerSrc('wish_target');
  if (lampa) return L.divIcon({ className: 'mk-wrap', html: `<div class="wl-lampa">${stickerImg(lampa)}${badge}</div>` });
  return L.divIcon({ className: 'mk-wrap', html: circleMarkHtml(WISH_EMOJI, WISH_RIM).replace('</div>', `${badge}</div>`) });
}

function clusterIcon(n: number): L.DivIcon {
  const px = clusterPx(n);
  const fs = px < 36 ? 12 : 14;
  return L.divIcon({
    className: 'mn-wrap',
    html:
      `<div class="mn-mark mn-cluster" style="box-sizing:border-box;width:${px}px;height:${px}px;` +
      `border-radius:999px;background:#FFFFFF;border:2.5px solid ${WISH_RIM};` +
      `box-shadow:${PACK_SHADOW.lift};gap:2px;` +
      `font-family:${FONT_UI};font-weight:600;font-size:${fs}px;color:${WISH_RIM};">` +
      `<i style="font-style:normal;font-family:${FONT_EMOJI};font-size:12px">${WISH_EMOJI}</i>${n}</div>`,
  });
}

/** „leto 2027", „tento rok", „raz v živote" */
export function wishWhenLabel(t: ReturnType<typeof useT>, w: Pick<WishPin, 'when' | 'whenYear'>): string {
  const base = t(`pack.wish.when.${w.when}`);
  const withYear = w.when === 'spring' || w.when === 'summer' || w.when === 'autumn' || w.when === 'winter';
  return withYear && w.whenYear ? `${base} ${w.whenYear}` : base;
}

function PersonRow({ w, onChanged }: { w: WishPin; onChanged: () => void }) {
  const t = useT();
  const [meToo, setMeToo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const map = useMap();
  const whenRef = useRef<HTMLDivElement>(null);
  // Popup rastie len nahor, takže voľba termínu by vytlačila panel pod hlavičku a chipy by ostali pod zlomom zoznamu.
  useEffect(() => {
    const when = whenRef.current;
    if (!APP_NEW || !meToo || !when) return;
    const list = when.closest('.wl-people');
    const shell = when.closest('.leaflet-popup-content-wrapper');
    if (list) {
      const over = when.getBoundingClientRect().bottom - list.getBoundingClientRect().bottom + 8;
      if (over > 0) list.scrollTop += over;
    }
    const up = shell ? POPUP_PAD_TOP - shell.getBoundingClientRect().top : 0;
    if (up > 0) map.panBy([0, -up]);
  }, [meToo, map]);
  const who = [w.ownerFirst ?? t('pack.triplist.fallbackDogyptian'), w.dogName ? `${w.dogDeceased ? '🕊 ' : ''}${w.dogName}` : null]
    .filter(Boolean).join(' + ');

  const write = async () => {
    setBusy(true); setMsg(null);
    try {
      const conv = await startWishDM(w.id);
      if (!conv) { setMsg(t('pack.wish.cantWrite')); return; }
      emitOpenThread(conv);
    } catch { setMsg(t('pack.wish.cantWrite')); } finally { setBusy(false); }
  };
  const copy = async (when: WishWhen) => {
    setBusy(true); setMsg(null);
    try { await meTooWish(w.id, when); setMeToo(false); onChanged(); }
    catch { setMsg(t('pack.wish.failed')); } finally { setBusy(false); }
  };
  const cancel = async () => {
    setBusy(true);
    try { await cancelWishPin(w.id); onChanged(); } catch { setMsg(t('pack.wish.failed')); } finally { setBusy(false); }
  };

  if (APP_NEW) return (
    <div className="wl3-person">
      <div className="wl3-who">
        {w.dogPhoto
          ? <img className="wl3-face" src={sizedUrl(w.dogPhoto, 160)} alt="" loading="lazy" />
          : <span className="wl3-face wl3-face--empty">{(w.dogName ?? w.ownerFirst ?? '?').slice(0, 1)}</span>}
        <span className="wl3-name">{w.isMine ? t('pack.wish.you') : who}</span>
        {w.packNumber != null && !w.isMine && <span className="wl3-num">#{w.packNumber}</span>}
      </div>
      <div className="wl3-facts">
        <span className="wl3-fact"><SysIcon name={WISH_KIND_ICON[w.tripKind]} size={24} />{t(`pack.wish.kind.${w.tripKind}`)}</span>
        <span className="wl3-fact"><SysIcon name="kalendar" size={24} />{wishWhenLabel(t, w)}</span>
        {!w.seeking && <span className="wl3-fact"><SysIcon name="zamok" size={24} />{t('pack.wish.private')}</span>}
      </div>
      {w.note && <p className="wl3-note">{w.note}</p>}
      <div className="wl3-acts">
        {w.isMine ? (
          <button type="button" className="pk-b3 pk-b3--paper wl3-btn" disabled={busy} onClick={cancel}><SysIcon name="kos" size={20} />{t('pack.wish.cancel')}</button>
        ) : (
          <>
            <button type="button" className="pk-b3 pk-b3--lapis wl3-btn" disabled={busy} onClick={write}><SysIcon name="obalka" size={20} />{t('pack.wish.write')}</button>
            <button type="button" className={`pk-b3 pk-b3--paper wl3-btn${meToo ? ' is-down' : ''}`} disabled={busy} onClick={() => setMeToo((v) => !v)}><SysIcon name={WISH_ICON} size={20} />{t('pack.wish.meToo')}</button>
          </>
        )}
      </div>
      {meToo && (
        <div className="wl3-when" ref={whenRef}>
          <span className="wl3-when-q">{t('pack.wish.guide.meTooWhen', { place: w.placeName })}</span>
          <div className="wl3-chips">
            {WISH_WHENS.map((wh) => (
              <button key={wh} type="button" className="wl3-chip" disabled={busy} onClick={() => copy(wh)}>{t(`pack.wish.when.${wh}`)}</button>
            ))}
          </div>
        </div>
      )}
      {msg && <div className="wl-msg">{msg}</div>}
    </div>
  );

  return (
    <div className="wl-person">
      <div className="mn-bubble-meta">
        {w.dogPhoto
          ? <img className="mn-bubble-face" src={sizedUrl(w.dogPhoto, 120)} alt="" loading="lazy" />
          : <span className="mn-bubble-face mn-bubble-face--empty">{(w.dogName ?? w.ownerFirst ?? '?').slice(0, 1)}</span>}
        <span className="mn-bubble-who">
          <span className="mn-bubble-author">{w.isMine ? t('pack.wish.you') : who}</span>
          {w.packNumber != null && !w.isMine && <span>#{w.packNumber}</span>}
        </span>
      </div>
      <div className="wl-tags">
        <span className="mn-bubble-tag">{t(`pack.wish.kind.${w.tripKind}`)}</span>
        <span className="mn-bubble-tag">{wishWhenLabel(t, w)}</span>
        {!w.seeking && <span className="mn-bubble-tag">{t('pack.wish.private')}</span>}
      </div>
      {w.note && <p className="mn-bubble-body wl-note">{w.note}</p>}
      {w.isMine ? (
        <div className="wl-acts">
          <button type="button" className="wl-btn wl-btn--ghost" disabled={busy} onClick={cancel}>{t('pack.wish.cancel')}</button>
        </div>
      ) : (
        <>
          <div className="wl-acts">
            <button type="button" className="wl-btn wl-btn--cta" disabled={busy} onClick={write}>{t('pack.wish.write')}</button>
            <button type="button" className={`wl-btn wl-btn--ghost${meToo ? ' on' : ''}`} disabled={busy} onClick={() => setMeToo((v) => !v)}>
              {WISH_EMOJI} {t('pack.wish.meToo')}
            </button>
          </div>
          {meToo && (
            <div className="wl-when">
              <span className="wl-when-q">{t('pack.wish.guide.meTooWhen', { place: w.placeName })}</span>
              <div className="wl-chips">
                {WISH_WHENS.map((wh) => (
                  <button key={wh} type="button" className="wl-chip" disabled={busy} onClick={() => copy(wh)}>{t(`pack.wish.when.${wh}`)}</button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {msg && <div className="wl-msg">{msg}</div>}
    </div>
  );
}

export function WishLayer({ wishes, onChanged, interactive = true }: {
  wishes: WishPin[];
  onChanged: () => void;
  interactive?: boolean;
}) {
  const t = useT();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [moveTick, setMoveTick] = useState(0);
  useMapEvent('zoomend', () => setZoom(map.getZoom()));
  // Kým je popup otvorený, posun mapy vrstvu neprekreslí (autopan → moveend → render → update …
  // = „Maximum update depth exceeded"; audit 27. 9. 2026, rovnaký zámok ako `geo/PoiLayer.tsx`).
  const popupOpen = useRef(false);
  const onMoveEnd = useCallback(() => { if (!popupOpen.current) setMoveTick((n) => n + 1); }, []);
  // Panel v appke je cez celú šírku, ovládače mapy a AINUBIS by mu ležali na okraji (`WISH_LAYER_CSS`, `html.wl3-open`).
  const onPopupOpen = useCallback((e: L.PopupEvent) => {
    popupOpen.current = true;
    if (e.popup.options.className?.includes('wl3')) document.documentElement.classList.add('wl3-open');
  }, []);
  const onPopupClose = useCallback(() => {
    popupOpen.current = false;
    document.documentElement.classList.remove('wl3-open');
    setMoveTick((n) => n + 1);
  }, []);
  useEffect(() => () => document.documentElement.classList.remove('wl3-open'), []);
  useMapEvent('moveend', onMoveEnd);
  useMapEvent('popupopen', onPopupOpen);
  useMapEvent('popupclose', onPopupClose);

  const groups = useMemo(() => groupByPlace(wishes), [wishes]);

  const items = useCallback(() => {
    const bounds = map.getBounds().pad(0.35);
    const proj = groups
      .filter((g) => bounds.contains([g.lat, g.lon]))
      .map((g) => { const pt = map.latLngToContainerPoint([g.lat, g.lon]); return { g, x: pt.x, y: pt.y }; });
    return clusterByPixels(proj, clusterRadiusForZoom(zoom)).map((c) => {
      if (c.items.length === 1) return { kind: 'single' as const, g: c.items[0].g };
      const ll = map.containerPointToLatLng([c.x, c.y]);
      const people = c.items.reduce((n, it) => n + it.g.items.length, 0);
      return { kind: 'cluster' as const, lat: ll.lat, lon: ll.lng, people, key: c.items.map((it) => it.g.key).join('|') };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, zoom, moveTick, groups]);

  return (
    <>
      <style>{WISH_LAYER_CSS}</style>
      {items().map((it) => it.kind === 'cluster' ? (
        <Marker
          key={`wc:${it.key}`}
          position={[it.lat, it.lon]}
          icon={clusterIcon(it.people)}
          interactive={interactive}
          eventHandlers={{ click: () => map.setView([it.lat, it.lon], Math.min(map.getZoom() + 2, 16)) }}
        />
      ) : (
        <Marker key={`w:${it.g.key}`} position={[it.g.lat, it.g.lon]} icon={pinIcon(it.g.items.length)} interactive={interactive}>
          {interactive && (
            <Popup
              className={APP_NEW ? 'mn-popup wl3' : 'mn-popup'}
              closeButton={false}
              // Zub stojí pod spodnou perou panela a nad lampou, nie na nej. Podmienka je okolo celej vlastnosti: `offset: undefined` by Leaflet zhodil.
              {...(APP_NEW ? { offset: [0, -16] as [number, number] } : {})}
              autoPanPaddingTopLeft={[24, POPUP_PAD_TOP]}
              autoPanPaddingBottomRight={[24, POPUP_PAD_BOTTOM]}
              keepInView
            >
              <div className="mn-bubble">
                {APP_NEW ? (
                  <div className="wl3-head">
                    <SysIcon name={WISH_ICON} size={40} />
                    <span className="wl3-place">{it.g.place}</span>
                  </div>
                ) : (
                <div className="mn-bubble-head">
                  <span className="mn-bubble-mark" style={{ borderColor: WISH_RIM }}>
                    <i className="mn-bubble-em">{WISH_EMOJI}</i>
                  </span>
                  <span className="mn-bubble-kind" style={{ color: T.inkStrong }}>{it.g.place}</span>
                </div>
                )}
                {it.g.items.length > 1 && (
                  <div className="wl-crowd">{t('pack.wish.crowd', { n: it.g.items.length, place: it.g.place })}</div>
                )}
                <div className="wl-people">
                  {it.g.items.map((w) => <PersonRow key={w.id} w={w} onChanged={onChanged} />)}
                </div>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </>
  );
}

// ⚠️ JS template literal — spätný apostrof v komentári by ho ukončil (check:css).
export const WISH_LAYER_CSS = `
.wl-lampa{position:absolute;left:0;top:0;width:30px;height:30px;transform:translate(-50%,-50%);}
.wl-lampa .mk-sticker{transform:none;}
.wl-lampa .mk-sticker:hover{transform:scale(1.12);}
.mk-circle .wl-count,.wl-lampa .wl-count{position:absolute;right:-8px;top:-8px;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:${WISH_RIM};color:#FFFFFF;font-family:${FONT_UI};font-weight:600;font-size:10px;line-height:16px;text-align:center;box-sizing:border-box;}
.wl-crowd{font-family:${FONT_UI};font-weight:600;font-size:12px;color:${T.inkWarm};margin-bottom:4px;}
.wl-people{display:flex;flex-direction:column;max-height:320px;overflow-y:auto;}
.wl-person + .wl-person{margin-top:8px;}
.wl-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;}
.wl-note{margin-top:8px;}
.wl-acts{display:flex;gap:8px;margin-top:8px;}
.wl-btn{flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:4px;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.14em;text-transform:uppercase;border-radius:8px;padding:8px;cursor:pointer;transition:background .15s,border-color .15s;}
.wl-btn:disabled{opacity:.55;cursor:default;}
.wl-btn--cta{background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.edge};}
.wl-btn--cta:hover{background:${LAPIS.gradHover};}
.wl-btn--ghost{background:transparent;color:${T.inkStrong};border:1px solid ${T.border};}
.wl-btn--ghost:hover,.wl-btn--ghost.on{border-color:${LAPIS.edge};background:${LAPIS.fill};color:${LAPIS.edge};}
.wl-when{margin-top:8px;}
.wl-when-q{display:block;font-family:${FONT_UI};font-size:12px;color:${T.inkWarm};margin-bottom:4px;}
.wl-chips{display:flex;flex-wrap:wrap;gap:4px;}
.wl-chip{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.02em;text-transform:uppercase;color:${T.inkStrong};background:transparent;border:1px solid ${T.border};border-radius:999px;padding:4px 8px;cursor:pointer;}
.wl-chip:hover{border-color:${LAPIS.edge};background:${LAPIS.fill};color:${LAPIS.edge};}
.wl-msg{margin-top:8px;font-family:${FONT_UI};font-size:12px;color:${T.inkWarm};}
/* ── ŠAT PAPYRUS 3D, len appka (Matej 10. 11. 2026: „v starom dizajne, urob ho krajší a nový s našimi ikonkami, väčší, prehľadnejší"). */
.mn-popup.wl3 .leaflet-popup-content-wrapper{background:var(--p3d-card);border:2.5px solid var(--p3d-ink);border-radius:16px;box-shadow:inset 0 0 0 3px var(--p3d-gold),var(--p3d-pera);}
.mn-popup.wl3 .leaflet-popup-content{min-width:min(288px,calc(100vw - 48px));max-width:min(288px,calc(100vw - 48px));padding:12px;}
.mn-popup.wl3 .leaflet-popup-tip-container{margin-top:5px;}
.mn-popup.wl3 .leaflet-popup-tip{background:var(--p3d-gold-solid);border:2.5px solid var(--p3d-ink);}
.wl3-head{display:flex;align-items:center;gap:8px;}
.wl3-place{flex:1;min-width:0;font-family:${FONT_TITLE};font-weight:700;font-size:20px;line-height:1.1;color:var(--p3d-ink);overflow-wrap:anywhere;} /* písmo: nadpis */
.mn-popup.wl3 .wl-crowd{font-size:12px;margin:4px 0 0;}
html.wl3-open .trp-ctlstack,html.wl3-open .trp-mactions,html.wl3-open .ainubis-launcher{visibility:hidden;}
.mn-popup.wl3 .wl-people{max-height:min(480px,calc(100dvh - 420px));overscroll-behavior:contain;margin:0 -8px;padding:0 8px;}
.wl3-person{margin-top:8px;padding-top:8px;border-top:2px solid var(--p3d-gold);}
.wl3-who{display:flex;align-items:center;gap:8px;}
.wl3-face{flex:0 0 auto;width:40px;height:40px;border-radius:999px;object-fit:cover;box-sizing:border-box;border:2.5px solid var(--p3d-ink);box-shadow:0 0 0 2px var(--p3d-gold);background:var(--p3d-paper);}
.wl3-face--empty{display:inline-flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:16px;color:var(--p3d-ink);}
.wl3-name{flex:1;min-width:0;font-family:${FONT_TITLE};font-weight:700;font-size:16px;line-height:1.15;color:var(--p3d-ink);overflow-wrap:anywhere;} /* písmo: meno */
.wl3-num{flex:0 0 auto;font-family:${FONT_UI};font-weight:600;font-size:12px;color:#EFD79A;background:linear-gradient(180deg,#16307A,#0A1A4A);border-radius:999px;padding:4px 8px;}
.wl3-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px;}
.wl3-fact{display:flex;align-items:center;gap:4px;min-height:36px;box-sizing:border-box;padding:4px 8px;border-radius:12px;border:2px solid var(--p3d-gold);background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);font-family:${FONT_UI};font-weight:600;font-size:12px;line-height:1.15;color:var(--p3d-ink);overflow-wrap:anywhere;min-width:0;}
.wl3-note{margin:8px 0 0;font-family:${FONT_UI};font-size:14px;line-height:1.4;color:var(--p3d-ink);white-space:pre-wrap;overflow-wrap:anywhere;}
.wl3-acts{display:flex;flex-wrap:wrap;gap:12px 8px;margin:12px 0;}
.wl3-btn{flex:1 1 40%;min-height:44px;padding:4px;font-size:16px;white-space:nowrap;}
.wl3-when{margin-top:12px;padding-bottom:8px;}
.wl3-when-q{display:block;margin-bottom:4px;font-family:${FONT_UI};font-weight:500;font-size:12px;color:var(--p3d-ink);}
.wl3-chips{display:flex;flex-wrap:wrap;gap:8px 4px;}
.wl3-chip{min-height:32px;padding:4px 8px;border-radius:999px;border:2px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:var(--p3d-lift);font-family:${FONT_UI};font-weight:600;font-size:12px;color:var(--p3d-ink);cursor:pointer;}
.wl3-chip:disabled{opacity:.55;}
`;
