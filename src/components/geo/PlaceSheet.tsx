// ============================================================================
// MIESTO NA MAPE — pin, nízky šuplík, detail, panel na PC a formulár postrehu.
// Zadanie: `plany/zadanie-miesto-na-mape-2026-10-31.md` · platný nákres v3
// (`plany/nakres-miesto-na-mape-2026-10-31-v3.html`, PC panel z v2).
//
// Matej 31. 10. 2026: *„do útulní alebo chatiek sa nedá písať a pridávať fotky — je tam len že
// žiadny dogypťan tu nič nepridal… potrebujeme tam postaviť možnosť doplniť foto alebo nejaké
// postrehy"*. Nahrádza tmavú bublinu `PlaceCard` (vedela len čítať).
//
// ── TRI POLOHY, JEDNO MIESTO ────────────────────────────────────────────────
// · MOBIL: ťuk na bod → NÍZKY ŠUPLÍK zdola bez závoja (mapa a pin ostávajú vidno) → potiahnutie
//   hore = celý detail ako POPUP (`<PackPopup>`, bez šípky aj krížika, lock POPUP 26. 10.).
// · PC (od 768): PANEL SPRAVA nad mapou, rovno detail. ⚠️ Vedomá odchýlka od POPUP 640 v strede:
//   okno v strede by zakrylo práve ten bod, o ktorom je reč (zapísané v locku POPUP).
// · KRESLENIE TRASY: ťuk na bod nepridá kotvu (značka Leafletu klik do mapy nepustí) a otvorí
//   rovno FORMULÁR „Ako tu bolo?" s „Uložiť a kresliť ďalej". Kreslenie žije v `GeometryPicker`
//   a ostáva mountnuté, takže sa stav trasy nestratí — nič sa neodkladá a neobnovuje.
//
// ── AKCIE (Matej 31. 10.) ───────────────────────────────────────────────────
// DOPLŇ +10 (lapis, hlavné) · Uložiť (→ TRIPWISH s vopred vyplneným miestom, lock
// architektura-pack §4.2 🔖) · Poslať. Páči, Do výletu a Trasa sú ZRUŠENÉ. Tvar = obdĺžnik r8
// (*„prečo ich robíš v kruhu???"*).
// ============================================================================
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { supabase as db } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { PackPopup } from '@/components/pack/PackPopup';
import { PawRating } from '@/components/pack/addtrip/PawRating';
import { RatingPaws, ICON } from '@/components/pack/tripShared';
import { POINTS } from '@/lib/tripPoints';
import {
  PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT, PAGE_AIR, FONT_TITLE, FONT_UI,
  PACK_BOX, PF_FIELD_CSS, PILL_CSS,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { FONT_EMOJI, POI_EMOJI, sleepEmoji } from '@/components/pack/mapnotes/markEmoji';
import { SLEEP_CHIPS } from '@/components/pack/sleepChips';
import {
  addPlacePost, alreadyScoredHere, deletePlacePost, pawsAverage, uploadPlaceFile,
  type PlaceKind, type PlacePost,
} from './placePosts';

/** „Uložiť" → TRIPWISH (počúva `PackMap.tsx`). Udalosť, lebo miesto otvára vrstva vnútri mapy
 *  a tok prania žije o poschodie vyššie. */
export const WISH_PLACE_EVENT = 'dogypt:wish-place';

/** Bod zo sveta tak, ako ho miesto potrebuje — tvar `PoiTilePoint` z `usePoiTiles.ts`. */
export interface PlacePoint {
  t: string;
  lat: number;
  lon: number;
  name?: string;
  elev?: number;
  /** bivak/prístrešok: dá sa tu prespať (OSM `shelter_type=basic_hut`) */
  sleep?: boolean;
  phone?: string;
  web?: string;
  range?: string;
  district?: string;
  /** popis z OSM (miestny jazyk) a jeho anglická verzia, ak ju OSM má */
  desc?: string;
  descEn?: string;
}

type Tx = (key: string, vars?: Record<string, string | number>) => string;

const CHIP_BY_ID = new Map(SLEEP_CHIPS.map((c) => [c.id, c]));
/** Text chipu. `label` v `SLEEP_CHIPS` je slovenský kánon matrice — na obrazovke ide preklad. */
const chipLabel = (tx: Tx, id: string) => tx(`pack.place.chip.${id}`);
/** Chipy „Čo tu je" dávajú zmysel len pri spaní; prameň a výhľad ich nemajú. */
const HAS_CHIPS = (k: PlaceKind) => k === 'hut' || k === 'camp' || k === 'bivak';
const MAX_PHOTOS = 4;
const BODY_MAX = 1200;

export const placeEmoji = (t: string): string =>
  t.startsWith('sleep_') ? sleepEmoji(t) : (POI_EMOJI as Record<string, string>)[t] ?? '📍';

/** i18n kľúč druhu — zhodný s `poiLabelKey` v `PoiLayer.tsx`. */
export const placeLabelKey = (t: string): string =>
  t.startsWith('sleep_') ? `pack.sleep.${t.slice(6)}` : `pack.poi.${t}`;

// ── PIN ─────────────────────────────────────────────────────────────────────
// Po ťuku bod narastie na KVAPKU ako na Mapy.cz: farba od špičky po oblúk, v nej biely kruh
// s emoji, vedľa meno. FIALOVÝ `tripPurple` — Matej: *„nechaj fialový a keď tak vymeníme
// neskôr"*. ⚠️ Vedomá výnimka z brand locku (fialová = len výlety), zapísaná v `brand.md`.
// Farba je JEDNA premenná (`--plc-pin`), výmena = jedno slovo.
// ⚠️ MENO NESMIE VYJSŤ Z OKNA (31. 10., mobil): dlhé meno („Ďurková v prípade naplnenia kapacity
// útulne") sa zalomí do dvoch riadkov v strope `--plc-name-w` a pin pri pravom okraji ho dá NAĽAVO
// (`flip`). Kam, rozhoduje volajúci podľa polohy pinu vo výreze — pin sám okno nepozná.
export const PLACE_PIN_NAME_W = 148;
export function placePinHtml(emoji: string, name?: string, flip = false): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<div class="plc-pin${flip ? ' plc-pin--flip' : ''}"><span class="plc-pin-drop"></span><span class="plc-pin-dot"><i>${emoji}</i></span>${
    name ? `<b class="plc-pin-name">${esc(name)}</b>` : ''}</div>`;
}

/** Fialová fajka na kruhu, kde som už postreh pridal (nákres v3 ③). */
export const PLACE_DONE_CLASS = ' plc-done';

// ⚠️ JS template literal — spätný apostrof v komentári ho ukončí (`npm run check:css`).
export const PLACE_PIN_CSS = `
.plc-pin{--plc-pin:${T.tripPurple};position:relative;width:44px;height:56px;transform:translate(-50%,-100%);pointer-events:none;}
.plc-pin-drop{position:absolute;left:2px;top:2px;width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
  background:var(--plc-pin);box-shadow:0 4px 12px rgba(42,22,8,0.35);}
.plc-pin-dot{position:absolute;left:8px;top:8px;width:28px;height:28px;border-radius:${PACK_R.pill}px;background:#FFFDF7;
  display:grid;place-items:center;}
.plc-pin-dot i{font-style:normal;font-family:${FONT_EMOJI};font-size:${PACK_TEXT.lead}px;line-height:1;}
.plc-pin-name{position:absolute;left:48px;top:${S.sm}px;width:max-content;max-width:${PLACE_PIN_NAME_W}px;font-family:${FONT_TITLE};font-weight:700; /* písmo: meno */
  font-size:${PACK_TEXT.label}px;line-height:1.25;letter-spacing:.02em;color:${T.inkStrong};
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
  text-shadow:0 0 4px #FFFDF7,0 0 4px #FFFDF7,0 0 4px #FFFDF7;}
.plc-pin--flip .plc-pin-name{left:auto;right:48px;text-align:right;}
.mk-circle.plc-done{border-color:${T.tripPurple}!important;}
.mk-circle.plc-done::after{content:'\\2713';position:absolute;right:-6px;top:-6px;width:14px;height:14px;border-radius:${PACK_R.pill}px;
  background:${T.tripPurple};color:#FFFDF7;font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;line-height:14px;text-align:center;}
`;

// ── ROZLOŽENIE ──────────────────────────────────────────────────────────────
const WIDE_MQ = '(min-width:768px)';
function useWide(): boolean {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(WIDE_MQ).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_MQ);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

const fmtCoord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(5)}${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(5)}${lon >= 0 ? 'E' : 'W'}`;

/** Fotky miesta = fotky z postrehov, najnovšie prvé. Cudzie čakajúce server ani nepošle. */
const photosOf = (posts: PlacePost[]) => posts.flatMap((p) => p.photos);

// ============================================================================
// HLAVNÝ OVLÁDAČ
// ============================================================================
export interface PlaceSheetProps {
  point: PlacePoint;
  kind: PlaceKind;
  /** postrehy patriace k bodu (`postsAt`) */
  posts: PlacePost[];
  /** práve sa kreslí trasa → rovno formulár a „Uložiť a kresliť ďalej" */
  drawing?: boolean;
  onClose: () => void;
  tx: Tx;
}

export function PlaceSheet({ point, kind, posts, drawing = false, onClose, tx }: PlaceSheetProps) {
  const wide = useWide();
  const [full, setFull] = useState(false);
  const [form, setForm] = useState(drawing);
  const { toast } = useToast();

  // Iný bod = nový začiatok (ťuk na susednú útulňu, kým je šuplík otvorený).
  useEffect(() => { setFull(false); setForm(drawing); }, [point.lat, point.lon, point.t, drawing]);

  const name = point.name || tx(placeLabelKey(point.t));
  const scoredHere = alreadyScoredHere(posts);

  const share = useCallback(async () => {
    const url = `${window.location.origin}/pack/map?place=${point.t},${point.lat.toFixed(5)},${point.lon.toFixed(5)}`;
    const title = name;
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title, text: `${title} · ${tx(placeLabelKey(point.t))}`, url }); return; } catch { /* zrušené */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: tx('pack.place.linkCopied') });
    } catch {
      toast({ description: url });
    }
  }, [point, name, tx, toast]);

  const save = useCallback(() => {
    window.dispatchEvent(new CustomEvent(WISH_PLACE_EVENT, { detail: { name, lat: point.lat, lon: point.lon } }));
    onClose();
  }, [name, point.lat, point.lon, onClose]);

  const afterPost = useCallback((scored: boolean) => {
    toast({ description: scored
      ? tx('pack.place.savedPoints', { pts: POINTS.place, name })
      : tx('pack.place.saved', { name }) });
    if (drawing) onClose(); else setForm(false);
  }, [toast, tx, name, drawing, onClose]);

  if (form) {
    return (
      <PlacePostForm
        point={point} kind={kind} name={name} drawing={drawing} scoredHere={scoredHere}
        onDone={afterPost} onClose={drawing ? onClose : () => setForm(false)} tx={tx}
      />
    );
  }

  const detail = (
    <PlaceDetail
      point={point} kind={kind} name={name} posts={posts} tx={tx}
      onSave={save} onShare={share}
    />
  );
  const addBtn = <AddButton tx={tx} points={!scoredHere} onClick={() => setForm(true)} />;

  if (wide) {
    return createPortal(
      <aside className="plc-side" aria-label={name}>
        <style>{PLACE_SHEET_CSS}</style>
        <div className="plc-side-body">{detail}</div>
        <div className="plc-dock">{addBtn}</div>
      </aside>,
      document.body,
    );
  }

  if (full) {
    return (
      <PackPopup label={name} onClose={() => setFull(false)} className="plc-full">
        <style>{PLACE_SHEET_CSS}</style>
        {detail}
        <div className="plc-dock plc-dock--sticky">{addBtn}</div>
      </PackPopup>
    );
  }

  return (
    <PlacePeek
      point={point} name={name} posts={posts} tx={tx}
      onOpen={() => setFull(true)} onClose={onClose}
      actions={(
        <div className="plc-btns">
          {addBtn}
          <SideButton icon="star" label={tx('pack.place.save')} onClick={save} />
          <SideButton icon="send" label={tx('pack.place.send')} onClick={share} />
        </div>
      )}
    />
  );
}

// ── TLAČIDLÁ ────────────────────────────────────────────────────────────────
function AddButton({ tx, points, onClick }: { tx: Tx; points: boolean; onClick: () => void }) {
  return (
    <button type="button" className="plc-cta" onClick={onClick}>
      {tx('pack.place.add')}
      {points && <span className="plc-pts">+{POINTS.place}</span>}
    </button>
  );
}

function SideButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" className="plc-btn2" onClick={onClick}>
      <img src={ICON(icon)} alt="" aria-hidden />{label}
    </button>
  );
}

// ── NÍZKY ŠUPLÍK ────────────────────────────────────────────────────────────
// Bez závoja: nad ním ostáva mapa s pinom — to je celý zmysel, prečo nie je okamžite popup.
// Ťah DOLE zavrie, ťah HORE (alebo ťuk na hlavičku) otvorí celý detail.
function PlacePeek({ point, name, posts, tx, onOpen, onClose, actions }: {
  point: PlacePoint; name: string; posts: PlacePost[]; tx: Tx;
  onOpen: () => void; onClose: () => void; actions: ReactNode;
}) {
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const photo = photosOf(posts)[0];
  const rate = pawsAverage(posts);
  const { lang } = useLang();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handle = {
    onPointerDown: (e: RPointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) return;
      start.current = e.clientY;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: RPointerEvent) => {
      if (start.current == null) return;
      setDrag(Math.max(0, e.clientY - start.current));
    },
    onPointerUp: (e: RPointerEvent) => {
      const s = start.current;
      start.current = null;
      setDrag(0);
      if (s == null) return;
      const dy = e.clientY - s;
      if (dy > 60) onClose();
      else if (dy < -30 || Math.abs(dy) < 6) onOpen();
    },
  };

  return createPortal(
    <div className="plc-peek" role="dialog" aria-label={name}
      style={drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}>
      <style>{PLACE_SHEET_CSS}</style>
      <div className="plc-peek-top" {...handle} style={{ touchAction: 'none' }}>
        <span className="plc-grab" aria-hidden />
        <div className="plc-peek-h">
          {photo && <img className="plc-thumb" src={photo} alt="" loading="lazy" />}
          <div className="plc-peek-tx">
            <div className="plc-kind"><i>{placeEmoji(point.t)}</i>{tx(placeLabelKey(point.t))}</div>
            <div className="plc-name">{name}</div>
            <div className="plc-meta">
              {rate && <><RatingPaws stars={rate.avg} size={14} gap={2} /><b>{rate.avg.toLocaleString(intlLocale(lang), { maximumFractionDigits: 1 })}</b></>}
              {posts.length > 0 && <span>{postsLabel(tx, posts.length)}</span>}
              {point.elev != null && <span>{point.elev.toLocaleString(intlLocale(lang))} m</span>}
            </div>
          </div>
        </div>
      </div>
      {actions}
    </div>,
    document.body,
  );
}

function postsLabel(tx: Tx, n: number): string {
  const k = n === 1 ? 'One' : n >= 2 && n <= 4 ? 'Few' : 'Many';
  return tx(`pack.place.posts${k}`, { n });
}

// ── DETAIL ──────────────────────────────────────────────────────────────────
function PlaceDetail({ point, kind, name, posts, tx, onSave, onShare }: {
  point: PlacePoint; kind: PlaceKind; name: string; posts: PlacePost[]; tx: Tx;
  onSave: () => void; onShare: () => void;
}) {
  const { lang } = useLang();
  const { toast } = useToast();
  const photos = photosOf(posts);
  const rate = pawsAverage(posts);
  const visitors = new Set(posts.map((p) => `${p.authorFirst}#${p.packNumber}`)).size;
  const [idx, setIdx] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  const chips = useMemo(() => {
    const ids = new Set(posts.flatMap((p) => p.chips));
    if (kind === 'bivak' && point.sleep) ids.add('sleep_ok');
    return [...ids].map((id) => CHIP_BY_ID.get(id)).filter(Boolean) as typeof SLEEP_CHIPS;
  }, [posts, kind, point.sleep]);

  // Popis z OSM: v EN anglický, ak ho OSM má; inak miestny (lepší cudzí jazyk než nič).
  const about = (lang === 'en' && point.descEn) || point.desc || point.descEn || '';
  const where = [point.range, point.district && tx('pack.place.district', { name: point.district })].filter(Boolean).join(' · ');
  const coords = fmtCoord(point.lat, point.lon);

  const copy = async () => {
    try { await navigator.clipboard.writeText(`${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`); toast({ description: tx('pack.place.coordsCopied') }); }
    catch { toast({ description: coords }); }
  };

  return (
    <div className="plc-detail">
      {photos.length > 0 ? (
        <div className="plc-hero">
          <div className="plc-strip" ref={strip}
            onScroll={(e) => { const el = e.currentTarget; setIdx(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))); }}>
            {photos.map((u) => <img key={u} src={u} alt="" loading="lazy" />)}
          </div>
          <span className="pk-veil pk-veil--photo" aria-hidden />
          {photos.length > 1 && <span className="plc-count">{idx + 1} / {photos.length}</span>}
          <div className="plc-hero-tx">
            <div className="plc-kind plc-kind--dark"><i>{placeEmoji(point.t)}</i>{tx(placeLabelKey(point.t))}</div>
            <h2>{name}</h2> {/* písmo: meno */}
          </div>
        </div>
      ) : (
        <div className="plc-head">
          <div className="plc-kind"><i>{placeEmoji(point.t)}</i>{tx(placeLabelKey(point.t))}</div>
          <h2 className="plc-h">{name}</h2>
        </div>
      )}

      <div className="plc-sb">
        <div className="plc-rate">
          {rate ? (
            <>
              <b>{rate.avg.toLocaleString(intlLocale(lang), { maximumFractionDigits: 1 })}</b>
              <RatingPaws stars={rate.avg} size={16} gap={3} />
            </>
          ) : null}
          <span>
            {posts.length > 0 ? postsLabel(tx, posts.length) : tx('pack.place.noPosts')}
            {visitors > 0 && ` · ${tx('pack.place.visitors', { n: visitors })}`}
          </span>
        </div>

        <div className="plc-btns plc-btns--row">
          <SideButton icon="star" label={tx('pack.place.save')} onClick={onSave} />
          <SideButton icon="send" label={tx('pack.place.send')} onClick={onShare} />
        </div>

        <div className="plc-info" style={{ ...PACK_BOX.subblock }}>
          {where && (
            <div><img src={ICON('map')} alt="" aria-hidden /><span>{where}</span></div>
          )}
          <div>
            <img src={ICON('pin')} alt="" aria-hidden />
            <span>{coords}</span>
            <button type="button" className="plc-link" onClick={copy}>{tx('pack.place.copy')}</button>
          </div>
          {point.elev != null && (
            <div><img src={ICON('mountain')} alt="" aria-hidden /><span>{tx('pack.place.elev', { m: point.elev.toLocaleString(intlLocale(lang)) })}</span></div>
          )}
          {point.phone && (
            <div><img src={ICON('chat')} alt="" aria-hidden /><a className="plc-link plc-link--l" href={`tel:${point.phone.replace(/\s+/g, '')}`}>{point.phone}</a></div>
          )}
          {point.web && (
            <div><img src={ICON('link')} alt="" aria-hidden />
              <a className="plc-link plc-link--l" href={point.web.startsWith('http') ? point.web : `https://${point.web}`} target="_blank" rel="noopener noreferrer">
                {point.web.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </div>
          )}
        </div>

        {about && (
          <section>
            <div className="plc-eb">{tx('pack.place.about')}</div>
            <p className="plc-about">{about}</p>
          </section>
        )}

        {chips.length > 0 && (
          <section>
            <div className="plc-eb">{tx('pack.place.whatsHere')}</div>
            <div className="plc-chips">
              {chips.map((c) => <span key={c.id} className="plc-chip"><i>{c.emoji}</i>{chipLabel(tx, c.id)}</span>)}
            </div>
          </section>
        )}

        <section>
          <div className="plc-eb">{tx('pack.place.postsTitle')}</div>
          {posts.length === 0 ? (
            <p className="plc-empty">{tx('pack.sleep.untouched')}</p>
          ) : (
            <div className="plc-posts">
              {posts.map((p) => <PostRow key={p.id} p={p} tx={tx} lang={lang} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function PostRow({ p, tx, lang }: { p: PlacePost; tx: Tx; lang: string }) {
  const [busy, setBusy] = useState(false);
  const date = new Date(p.createdAt).toLocaleDateString(intlLocale(lang), { day: 'numeric', month: 'numeric', year: 'numeric' });
  return (
    <article className="plc-post" style={{ ...PACK_BOX.row }}>
      {p.avatarUrl ? <img className="plc-av" src={p.avatarUrl} alt="" loading="lazy" /> : <span className="plc-av plc-av--none" aria-hidden>🐾</span>}
      <div className="plc-post-b">
        <div className="plc-who">
          <b>{p.authorFirst || '—'}</b> {/* písmo: meno */}
          {p.packNumber != null && <span className="plc-num">#{p.packNumber}</span>}
          {p.paws != null && <RatingPaws stars={p.paws} size={12} gap={2} />}
          <span className="plc-date">{date}</span>
        </div>
        {p.body && <p>{p.body}</p>}
        {p.photos.length > 0 && (
          <div className="plc-ph">{p.photos.map((u) => <img key={u} src={u} alt="" loading="lazy" />)}</div>
        )}
        {p.isMine && p.review === 'pending' && <div className="plc-note">{tx('pack.place.reviewPending')}</div>}
        {p.isMine && p.review === 'rejected' && <div className="plc-note plc-note--bad">{tx('pack.place.reviewRejected')}</div>}
        {p.isMine && (
          <button type="button" className="plc-link plc-del" disabled={busy}
            onClick={async () => { setBusy(true); try { await deletePlacePost(p.id); } finally { setBusy(false); } }}>
            {tx('pack.place.delete')}
          </button>
        )}
      </div>
    </article>
  );
}

// ── FORMULÁR POSTREHU ───────────────────────────────────────────────────────
// Jedna obrazovka (zadanie bod 6): labky · až 4 fotky · text · chipy. Uložiť ide aj so samotnou
// fotkou alebo labkami — rovnaké pravidlo stráži DB (`place_posts_not_empty`).
function PlacePostForm({ point, kind, name, drawing, scoredHere, onDone, onClose, tx }: {
  point: PlacePoint; kind: PlaceKind; name: string; drawing: boolean; scoredHere: boolean;
  onDone: (scored: boolean) => void; onClose: () => void; tx: Tx;
}) {
  const [paws, setPaws] = useState(0);
  const [body, setBody] = useState('');
  const [chips, setChips] = useState<string[]>([]);
  const [photos, setPhotos] = useState<{ preview: string; url: string | null; busy: boolean }[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const uploading = photos.some((p) => p.busy);
  const ready = photos.filter((p) => p.url).map((p) => p.url as string);
  const canSave = !saving && !uploading && (paws > 0 || body.trim().length > 0 || ready.length > 0);

  const pick = async (list: FileList | null) => {
    if (!list?.length) return;
    // 🔴 KÓPIA HNEĎ (31. 10. 2026): FileList je ŽIVÝ — `e.target.value = ''` nižšie ho vyprázdni
    // počas `await getUser()` a fotka sa ticho stratila (bez chyby, bez slotu). Chytil to e2e test.
    const files = Array.from(list);
    setErr(null);
    const { data } = await db.auth.getUser();
    const uid = data.user?.id;
    if (!uid) { setErr(tx('pack.place.failed')); return; }
    const room = MAX_PHOTOS - photos.length;
    for (const f of files.slice(0, room)) {
      const preview = URL.createObjectURL(f);
      setPhotos((prev) => [...prev, { preview, url: null, busy: true }]);
      uploadPlaceFile(f, uid)
        .then((url) => setPhotos((prev) => prev.map((p) => (p.preview === preview ? { ...p, url, busy: false } : p))))
        // 🔴 blob adresa sa NEUKLADÁ (mŕtvy odkaz po reloade, `photoIntake.ts`) — zlyhaná fotka odpadne.
        .catch(() => { setPhotos((prev) => prev.filter((p) => p.preview !== preview)); setErr(tx('pack.place.photoFailed')); });
    }
  };

  const submit = async () => {
    if (!canSave) return;
    setSaving(true); setErr(null);
    try {
      const r = await addPlacePost({
        kind, lat: point.lat, lon: point.lon, placeName: point.name ?? '',
        paws: paws || null, body: body.trim().slice(0, BODY_MAX), photos: ready, chips,
      });
      onDone(r.scored);
    } catch {
      setErr(tx('pack.place.failed'));
      setSaving(false);
    }
  };

  const reward = !scoredHere && (
    <div className="plc-reward"><span className="plc-pts plc-pts--line">+{POINTS.place}</span>{tx('pack.place.reward')}</div>
  );

  return (
    <PackPopup label={name} onClose={onClose} className="plc-form" over={drawing}>
      <style>{PF_FIELD_CSS + PILL_CSS + PLACE_SHEET_CSS}</style>
      <div className="plc-form-h">
        <div className="plc-kind"><i>{placeEmoji(point.t)}</i>{name}</div>
        <h2 className="plc-h plc-h--sm">{tx('pack.place.howWas')}</h2>
      </div>
      <div className="plc-form-paws"><PawRating value={paws} onChange={setPaws} size={36} /></div>

      <div className="plc-field">
        <div className="plc-eb">{tx('pack.place.photosLabel', { n: MAX_PHOTOS })}</div>
        <div className="plc-slots">
          {photos.map((p) => (
            <div key={p.preview} className="plc-slot" style={{ backgroundImage: `url(${p.preview})` }}>
              {p.busy && <span className="plc-slot-busy" aria-label={tx('pack.place.uploading')} />}
              <button type="button" className="plc-slot-x" aria-label={tx('pack.place.removePhoto')}
                onClick={() => setPhotos((prev) => prev.filter((q) => q.preview !== p.preview))}><img src={ICON('cross')} alt="" aria-hidden /></button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && Array.from({ length: MAX_PHOTOS - photos.length }).map((_, i) => (
            <button key={i} type="button" className="plc-slot plc-slot--add" onClick={() => fileRef.current?.click()}
              aria-label={tx('pack.place.addPhoto')}>
              <img src={ICON('camera')} alt="" aria-hidden />
            </button>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => { void pick(e.target.files); e.target.value = ''; }} />
      </div>

      <div className="plc-field">
        <div className="plc-eb">{tx('pack.place.noteLabel')}</div>
        <textarea className="pf-field plc-text" value={body} maxLength={BODY_MAX} rows={3}
          placeholder={tx('pack.place.notePlaceholder')} onChange={(e) => setBody(e.target.value)} />
      </div>

      {HAS_CHIPS(kind) && (
        <div className="plc-field">
          <div className="plc-eb">{tx('pack.place.whatsHere')}</div>
          <div className="plc-chips">
            {SLEEP_CHIPS.filter((c) => c.id !== 'sleep_ok' || kind === 'bivak').map((c) => {
              const on = chips.includes(c.id);
              return (
                <button key={c.id} type="button" className={`plc-chip plc-chip--tap${on ? ' on' : ''}`} aria-pressed={on}
                  onClick={() => setChips((prev) => (on ? prev.filter((x) => x !== c.id) : [...prev, c.id]))}>
                  <i>{c.emoji}</i>{chipLabel(tx, c.id)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {reward}
      {err && <div className="plc-note plc-note--bad">{err}</div>}

      <div className="plc-dock plc-dock--sticky">
        <button type="button" className="plc-cta" disabled={!canSave} onClick={submit}>
          {saving ? tx('pack.place.saving') : drawing ? tx('pack.place.saveDraw') : tx('pack.place.savePost')}
        </button>
      </div>
    </PackPopup>
  );
}

// ── CSS ─────────────────────────────────────────────────────────────────────
// ⚠️ JS template literal — spätný apostrof v komentári ho ukončí (`npm run check:css`).
const CTA_CSS = `display:flex;align-items:center;justify-content:center;gap:${S.sm}px;border:1px solid ${LAPIS.deep};
  border-radius:${PACK_R.field}px;padding:${S.md}px;background:${LAPIS.grad};color:${LAPIS.ink};
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase; /* písmo: cta */
  box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;`;

export const PLACE_SHEET_CSS = `
.plc-peek{position:fixed;left:0;right:0;bottom:0;z-index:65;background:${T.cardGrad};color:${T.inkStrong};
  border-top:2px solid ${T.cardEdge};border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};
  padding:0 ${PAGE_AIR.side}px calc(env(safe-area-inset-bottom,0px) + ${S.lg}px);font-family:${FONT_UI};
  animation:plc-up .32s cubic-bezier(.2,.8,.2,1) both;transition:transform .2s ease;
  --rp-fill:#A3782B;--rp-empty:#A3782B;--rp-empty-op:0.28;}
.plc-peek-top{cursor:grab;}
.plc-grab{display:block;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.hairline};margin:${S.sm}px auto ${S.md}px;}
.plc-peek-h{display:flex;gap:${S.md}px;align-items:flex-start;}
.plc-thumb{width:84px;height:84px;border-radius:${PACK_R.tile}px;object-fit:cover;flex:none;border:1px solid ${T.cardEdge};}
.plc-peek-tx{min-width:0;flex:1;}
.plc-kind{display:flex;align-items:center;gap:${S.xs}px;font-size:${PACK_TEXT.micro}px;font-weight:600;letter-spacing:.22em;
  text-transform:uppercase;color:${T.inkWarm};}
.plc-kind i{font-style:normal;font-family:${FONT_EMOJI};font-size:${PACK_TEXT.label}px;letter-spacing:0;}
.plc-kind--dark{color:${LAPIS.ink};}
.plc-name{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;line-height:1.25;letter-spacing:.02em; /* písmo: meno */
  color:${T.inkStrong};margin:${S.xs}px 0;overflow-wrap:anywhere;}
.plc-meta{display:flex;align-items:center;flex-wrap:wrap;gap:${S.sm}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.plc-meta b{color:${T.inkStrong};font-weight:600;}
.plc-btns{display:flex;gap:${S.sm}px;margin-top:${S.md}px;}
.plc-btns .plc-cta{flex:1.4;}
.plc-btns--row{margin-top:0;}
.plc-cta{${CTA_CSS}width:100%;}
.plc-cta:hover:not(:disabled){background:${LAPIS.gradHover};}
.plc-cta:disabled{opacity:.5;cursor:default;}
.plc-btn2{flex:1;display:flex;align-items:center;justify-content:center;gap:${S.xs}px;border-radius:${PACK_R.field}px;padding:${S.md}px ${S.sm}px;
  border:1.5px solid ${LAPIS.edge};color:${LAPIS.edge};background:#FFFDF7;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;cursor:pointer;white-space:nowrap;}
.plc-btn2 img{width:16px;height:16px;}
.plc-btn2:hover{background:${LAPIS.fill};}
.plc-pts{display:inline-flex;align-items:center;border-radius:${PACK_R.pill}px;padding:2px ${S.sm}px;border:1px solid ${T.tripPurple};
  color:${T.tripPurple};background:#FFFDF7;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.02em;}

/* Pod horným pásom mapy aj radom hľadania — panel nesmie zakryť štatistiky ani filtre. */
.plc-side{position:fixed;right:${S.lg}px;top:${S.xxxl * 3 + S.xl + S.lg}px;bottom:calc(var(--pack-nav-h,64px) + var(--pack-nav-bottom,16px) + ${S.md}px);
  width:400px;z-index:65;display:flex;flex-direction:column;overflow:hidden;background:${T.cardGrad};color:${T.inkStrong};
  border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px;box-shadow:${T.panelShadow};font-family:${FONT_UI};
  --rp-fill:#A3782B;--rp-empty:#A3782B;--rp-empty-op:0.28;}
.plc-side-body{flex:1;overflow-y:auto;overscroll-behavior:contain;}
.plc-dock{flex:none;padding:${S.md}px ${S.lg}px;border-top:1px solid ${T.hairline};}
.plc-dock--sticky{position:sticky;bottom:calc(-1 * (env(safe-area-inset-bottom,0px) + ${S.xl}px));margin:${S.lg}px -${S.lg}px 0;
  background:${T.cardGrad};}
@media (min-width:768px){.plc-dock--sticky{margin:${S.lg}px -${S.xl}px 0;bottom:-${S.xl}px;}}

.plc-full,.plc-form{--rp-fill:#A3782B;--rp-empty:#A3782B;--rp-empty-op:0.28;}
.plc-full .ppu-top{position:absolute;left:0;right:0;top:0;z-index:3;}
.plc-full .ppu-body{padding-left:0;padding-right:0;}
.plc-full .plc-dock--sticky{margin:${S.lg}px 0 0;}
.plc-detail{display:flex;flex-direction:column;}
.plc-hero{position:relative;height:236px;flex:none;overflow:hidden;}
.plc-side .plc-hero{height:220px;}
.plc-strip{display:flex;height:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;}
.plc-strip::-webkit-scrollbar{display:none;}
.plc-strip img{flex:0 0 100%;width:100%;height:100%;object-fit:cover;scroll-snap-align:start;}
.plc-count{position:absolute;right:${S.md}px;top:${S.md}px;z-index:2;font-size:${PACK_TEXT.label}px;font-weight:600;
  padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;background:rgba(10,8,4,0.55);color:#FFF6E3;}
.plc-hero-tx{position:absolute;left:${S.lg}px;right:${S.lg}px;bottom:${S.lg}px;z-index:2;color:#FFF6E3;pointer-events:none;}
.plc-hero-tx h2{margin:${S.xs}px 0 0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.15;letter-spacing:.02em;} /* písmo: meno */
.plc-head{padding:${S.xl}px ${S.lg}px 0;}
.plc-h{margin:${S.xs}px 0 0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.15;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: meno */
.plc-h--sm{font-size:${PACK_TEXT.h2}px;letter-spacing:.14em;}
.plc-sb{display:flex;flex-direction:column;gap:${S.lg}px;padding:${S.md}px ${S.lg}px ${S.lg}px;}
.plc-rate{display:flex;align-items:center;flex-wrap:wrap;gap:${S.sm}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.plc-rate b{font-size:${PACK_TEXT.h2}px;color:${T.inkStrong};font-weight:600;}
.plc-info{display:flex;flex-direction:column;}
.plc-info > div{display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.md}px;min-height:44px;font-size:${PACK_TEXT.body}px;
  color:${T.inkStrong};border-bottom:1px solid ${T.hairline};}
.plc-info > div:last-child{border-bottom:0;}
.plc-info img{width:18px;height:18px;flex:none;opacity:.8;}
.plc-info span{min-width:0;overflow-wrap:anywhere;}
.plc-link{margin-left:auto;background:none;border:0;padding:${S.xs}px 0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;
  color:${LAPIS.edge};cursor:pointer;white-space:nowrap;text-decoration:none;}
.plc-link--l{margin-left:0;white-space:normal;overflow-wrap:anywhere;font-size:${PACK_TEXT.body}px;}
.plc-eb{font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};font-weight:500;margin-bottom:${S.sm}px;}
.plc-chips{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.plc-chip{display:inline-flex;align-items:center;gap:${S.xs}px;border-radius:${PACK_R.pill}px;padding:${S.xs}px ${S.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;border:1px solid ${T.hairline};background:#FFFDF7;color:${T.inkStrong};}
.plc-chip i{font-style:normal;font-family:${FONT_EMOJI};}
.plc-chip--tap{cursor:pointer;}
.plc-chip--tap.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.plc-about{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.5;color:${T.inkStrong};white-space:pre-line;overflow-wrap:anywhere;}
.plc-empty{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.5;color:${T.inkWarm};}
.plc-posts{display:flex;flex-direction:column;gap:${S.sm}px;}
.plc-post{display:flex;gap:${S.md}px;padding:${S.md}px;}
.plc-av{width:36px;height:36px;border-radius:${PACK_R.pill}px;object-fit:cover;flex:none;border:1.5px solid ${T.cardEdge};}
.plc-av--none{display:grid;place-items:center;font-family:${FONT_EMOJI};font-size:${PACK_TEXT.body}px;background:#FFFDF7;}
.plc-post-b{min-width:0;flex:1;}
.plc-who{display:flex;align-items:center;flex-wrap:wrap;gap:${S.sm}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.plc-who b{color:${T.inkStrong};font-family:${FONT_TITLE};font-weight:700;letter-spacing:.02em;} /* písmo: meno */
.plc-num{font-weight:600;color:${LAPIS.edge};}
.plc-date{margin-left:auto;}
.plc-post p{margin:${S.xs}px 0 0;font-size:${PACK_TEXT.body}px;line-height:1.5;color:${T.inkStrong};white-space:pre-line;overflow-wrap:anywhere;}
.plc-ph{display:flex;gap:${S.xs}px;margin-top:${S.sm}px;flex-wrap:wrap;}
.plc-ph img{width:64px;height:64px;border-radius:${PACK_R.field}px;object-fit:cover;}
.plc-note{margin-top:${S.sm}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.plc-note--bad{color:${PICK_INK.red};}
.plc-del{margin-left:0;margin-top:${S.xs}px;color:${T.inkWarm};font-weight:500;}

.plc-form-h{text-align:center;}
.plc-form-h .plc-kind{justify-content:center;}
.plc-form-paws{display:flex;justify-content:center;margin:${S.lg}px 0;}
.plc-field{margin-top:${S.lg}px;}
.plc-slots{display:grid;grid-template-columns:repeat(4,1fr);gap:${S.sm}px;}
.plc-slot{position:relative;aspect-ratio:1;border-radius:${PACK_R.tile}px;background:center/cover no-repeat;border:1px solid ${T.hairline};}
.plc-slot--add{border:1.5px dashed ${T.cardEdge};background:#FFFDF7;display:grid;place-items:center;cursor:pointer;padding:0;}
.plc-slot--add img{width:24px;height:24px;opacity:.75;}
.plc-slot-busy{position:absolute;inset:0;border-radius:inherit;background:rgba(255,253,247,0.55);}
.plc-slot-busy::after{content:'';position:absolute;left:50%;top:50%;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:${PACK_R.pill}px;
  border:2px solid ${LAPIS.edge};border-right-color:transparent;animation:plc-spin .8s linear infinite;}
.plc-slot-x{position:absolute;right:${S.xs}px;top:${S.xs}px;width:24px;height:24px;border-radius:${PACK_R.pill}px;border:0;
  background:rgba(10,8,4,0.6);display:grid;place-items:center;padding:0;cursor:pointer;}
.plc-slot-x img{width:12px;height:12px;filter:invert(1);}
.plc-text{width:100%;min-height:88px;padding:${S.md}px;font-family:${FONT_UI};font-size:${PACK_TEXT.lead}px;line-height:1.5;color:${T.inkStrong};resize:vertical;}
.plc-reward{display:flex;align-items:center;gap:${S.sm}px;margin-top:${S.lg}px;padding:${S.sm}px ${S.md}px;font-size:${PACK_TEXT.label}px;
  color:${T.inkStrong};border-radius:${PACK_R.tile}px;border:1px solid ${T.tripPurple};}
@keyframes plc-up{from{transform:translateY(100%);}to{transform:none;}}
@keyframes plc-spin{to{transform:rotate(360deg);}}
@media (prefers-reduced-motion:reduce){.plc-peek{animation:none;}}
`;
