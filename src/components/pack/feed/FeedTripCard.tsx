// VÝLET VO FEEDE — FEED 2 (nákres `plany/nakres-feed-2026-10-26.html` blok 4, Matej 26. 10. 2026:
// *„výlet ako karta na /map, fotka v pomere, v akom je pridaná, pilulky základné + o výlete,
// popis + mapa s preklikom, CTA otvára výlet"*).
//
// SKLADÁ SA Z DIELOV KARTY Z /map, NIE Z JEJ KÓPIE: `PhotoMetaPills` + `COMMUNITY_CSS`, `flagUrl`,
// `trailCountry`, `chipsOf` / `categoriesOf`, `crowdAggregate`. Samotná karta z /map je `renderTripCard`
// vnútri `PackMap.tsx` (nie komponent) — jej vytiahnutie do spoločného komponentu je samostatná úloha
// (lock architektura-pack §4.1 „objekt má JEDNU kartu").
//
// FOTKA V PÔVODNOM POMERE: široká ostane široká, vysoká sa oreže na 4:5 (Matej 26. 10.: „vysoká fotka
// sa oreže, ale autor vidí náhľad orezu pri pridávaní ako na IG"). Pomer sa číta z načítaného obrázka.
//
// 🔖 ULOŽENIE = TRIPLIST (lock §4.2 REVÍZIA 26. 10.): výlet už v DOGYPTe je ⇒ ikonka triplistu
// (clipboard s ✓), nie hviezda. Zapisuje `trip_fav` cez `persistFav` — ten istý zoznam ako ★ v článku.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { HandPaw, HandClipboard, HandArrowLeft } from '@/components/pack/HandIcons';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { COMMUNITY_CSS, PhotoMetaPills } from '@/components/pack/packCommunityUI';
import { crowdAggregate } from '@/components/pack/packCommunity';
import { categoriesOf, chipsOf, ACT_TAG_EMOJI, TAG_EMOJI, TAG_I18N } from '@/components/pack/tripCategories';
import { tripPath, tripText, hasRouteMetrics, isWaterTrail, coverPos, TRAIL_LINE } from '@/components/pack/tripShared';
import { mapyTiles } from '@/lib/env';
import { trailCountry, flagUrl } from '@/lib/countryGeo';
import { sizedUrl } from '@/services/cloudinaryService';
import { FollowChip, FOLLOW_CHIP_CSS } from '@/components/pack/profile/follow';
import { agoLabel, tripTitle, useSwipe, type FeedTrip } from './feedData';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

export const FEED_TRIP_CSS = `
${COMMUNITY_CSS}
${FOLLOW_CHIP_CSS}
/* PLOCHÝ príspevok cez celú šírku (Matej 26. 10.: „príspevky na feede by som dal cez celú šírku, nie do blokov") —
   fotka ide od okraja po okraj, odsadené sú len hlavička, text a akcie. */
.pft{display:flex;flex-direction:column;}
.pft-head{display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;}
.pft-head .pk-medallion{font:600 ${TX.body}px/1 ${FONT_UI};color:${T.inkWarm};}
.pft-who{min-width:0;flex:1;}
.pft-who b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: meno */
.pft-who small{font-size:${TX.label}px;color:${T.inkWarm};}
.pft-in{overflow:hidden;}
.pft-ph{position:relative;width:100%;background:${T.tileBg};overflow:hidden;touch-action:pan-y;overscroll-behavior-x:contain;}
.pft-ph img.im{display:block;width:100%;height:100%;object-fit:cover;cursor:pointer;}
.pft-flag{position:absolute;left:${S.md}px;top:${S.md}px;width:32px;height:32px;border-radius:${PACK_R.pill}px;border:2px solid ${T.onDark};object-fit:cover;}
.pft-cnt{position:absolute;right:${S.md}px;top:${S.md}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:rgba(0,0,0,.45);
  color:${T.onDark};font:600 ${TX.micro}px/1 ${FONT_UI};}
.pft-nav{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:${PACK_R.pill}px;border:0;cursor:pointer;
  background:rgba(0,0,0,.45);color:${T.onDark};font:600 ${TX.lead}px/1 ${FONT_UI};display:grid;place-items:center;padding:0;}
.pft-nav.l{left:${S.sm}px;} .pft-nav.r{right:${S.sm}px;}
.pft-meta{position:absolute;left:${S.sm}px;right:${S.sm}px;bottom:${S.sm}px;}
.pft-body{padding:${S.md}px;display:flex;flex-direction:column;gap:${S.sm}px;}
.pft-loc{font:500 ${TX.micro}px/1.2 ${FONT_UI};letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.pft-body h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h2}px;line-height:1.25;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: nadpis */
.pft-chips{display:flex;flex-wrap:wrap;gap:${S.xs}px;}
.pft-chips .pk-pill{font:500 ${TX.label}px/1 ${FONT_UI};padding:${S.xs}px ${S.sm}px;}
.pft-desc{margin:0;font-size:${TX.body}px;line-height:1.5;color:${T.inkStrong};white-space:pre-line;}
.pft-desc.cut{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.pft-more{align-self:flex-start;background:none;border:0;padding:0;cursor:pointer;font:600 ${TX.label}px/1 ${FONT_UI};color:${LAPIS.edge};}
.pft-map{position:relative;display:block;width:100%;padding:0;cursor:pointer;overflow:hidden;border:1px solid ${T.hairline};border-radius:${PACK_R.tile}px;background:${T.tileBg};}
.pft-mini{position:relative;width:100%;aspect-ratio:320 / 140;overflow:hidden;}
.pft-mini img{position:absolute;max-width:none;user-select:none;}
.pft-mini svg{position:absolute;inset:0;width:100%;height:100%;}
.pft-map .attr{position:absolute;left:${S.xs}px;bottom:${S.xs}px;display:flex;align-items:center;gap:${S.xs}px;padding:2px ${S.xs}px;
  border-radius:${PACK_R.field}px;background:rgba(255,255,255,0.85);font:400 ${TX.micro}px/1 ${FONT_UI};color:#333;}
.pft-map .attr img{height:10px;display:block;}
.pft-map .go{position:absolute;right:${S.sm}px;bottom:${S.sm}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};
  background:${T.card};font:600 ${TX.micro}px/1 ${FONT_UI};color:${T.inkStrong};}
.pft-cta{width:100%;cursor:pointer;border:1px solid ${LAPIS.deep};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};
  border-radius:${PACK_R.field}px;padding:${S.md}px ${S.lg}px;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;} /* písmo: cta */
.pft-acts{display:flex;align-items:center;gap:${S.lg}px;padding:0 ${S.md}px ${S.md}px;}
.pft-acts button{background:none;border:0;padding:0;cursor:pointer;color:${T.inkStrong};display:inline-flex;align-items:center;gap:${S.xs}px;
  font:600 ${TX.label}px/1 ${FONT_UI};transition:transform .12s ease;}
.pft-acts button:active{transform:scale(.85);}
.pft-acts .sp{flex:1;}
.pft-acts button.on.list{color:${T.tripPurple};}
`;

/**
 * Mini mapa: turistická mapa Mapy.com (`outdoor`, ten istý štýl ako `/map`) a na nej čiara výletu.
 * Matej 27. 10.: *„mapy vo výletoch na feede neukazujú terén, len nakreslenú fialovú čiaru na štvorcovom
 * pozadí"* — dovtedy tu bola čiara na mriežke bez dlaždíc.
 *
 * STATICKÁ MOZAIKA, NIE LEAFLET: na feede je kariet veľa a každá by inak niesla vlastnú interaktívnu
 * mapu. Zoom sa vyberie tak, aby sa výlet zmestil do výrezu; dlaždice sú `<img loading="lazy">`,
 * takže karta mimo obrazovky nestiahne nič. `256@2x` = ostré aj na telefóne (výrez 320 jednotiek
 * sa na mobile kreslí cez ~360 px). Preklik otvára mapu naostro.
 * Atribúcia Mapy.com je podmienka licencie (`mapAttribution.tsx`) — platí aj pre náhľad.
 */
const MINI_W = 320;
const MINI_H = 140;
const MINI_PAD = 18;
const TILE = 256;
const merc = (lat: number, lon: number, z: number): [number, number] => {
  const n = TILE * 2 ** z;
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return [((lon + 180) / 360) * n, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n];
};
function MiniRoute({ path }: { path: HeroTrail['path'] }) {
  const geo = useMemo(() => {
    if (!path || path.length < 2) return null;
    const step = Math.max(1, Math.floor(path.length / 400));
    const ll = path.filter((_, i) => i % step === 0 || i === path.length - 1);
    let z = 16;
    let px: [number, number][] = [];
    let box = [0, 0, 0, 0];
    for (; z >= 3; z--) {
      px = ll.map((p) => merc(p[0], p[1], z));
      const xs = px.map((p) => p[0]); const ys = px.map((p) => p[1]);
      box = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      if (box[1] - box[0] <= MINI_W - 2 * MINI_PAD && box[3] - box[2] <= MINI_H - 2 * MINI_PAD) break;
    }
    const ox = (box[0] + box[1]) / 2 - MINI_W / 2;
    const oy = (box[2] + box[3]) / 2 - MINI_H / 2;
    const max = 2 ** z;
    const tiles: { key: string; src: string; x: number; y: number }[] = [];
    const url = mapyTiles('outdoor').replace('/256/', '/256@2x/');
    for (let ty = Math.floor(oy / TILE); ty <= Math.floor((oy + MINI_H) / TILE); ty++) {
      if (ty < 0 || ty >= max) continue;
      for (let tx = Math.floor(ox / TILE); tx <= Math.floor((ox + MINI_W) / TILE); tx++) {
        const wx = ((tx % max) + max) % max;
        tiles.push({
          key: `${z}/${tx}/${ty}`,
          src: url.replace('{z}', String(z)).replace('{x}', String(wx)).replace('{y}', String(ty)),
          x: tx * TILE - ox, y: ty * TILE - oy,
        });
      }
    }
    const d = px.map(([x, y], i) => `${i ? 'L' : 'M'}${(x - ox).toFixed(1)},${(y - oy).toFixed(1)}`).join('');
    return { tiles, d };
  }, [path]);
  if (!geo) return null;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return (
    <div className="pft-mini" aria-hidden>
      {geo.tiles.map((tl) => (
        <img key={tl.key} src={tl.src} alt="" loading="lazy" decoding="async" draggable={false}
          style={{ left: pct(tl.x, MINI_W), top: pct(tl.y, MINI_H), width: pct(TILE, MINI_W), height: pct(TILE, MINI_H) }} />
      ))}
      <svg viewBox={`0 0 ${MINI_W} ${MINI_H}`}>
        <path d={geo.d} fill="none" stroke={TRAIL_LINE.edge} strokeOpacity={0.8} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <path d={geo.d} fill="none" stroke={TRAIL_LINE.mid} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        <path d={geo.d} fill="none" stroke={TRAIL_LINE.light} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function FeedTripCard({ ft, youImg, authorImg = null, authorN = null, authorName = null, liked, onLike, likes = 0, comments = 0, onComment, listed, onList, lists = 0 }: {
  ft: FeedTrip;
  youImg: string | null;
  /** Fotka cudzieho autora (`feed_trip_authors`, 26. 10.); bez nej začiatočné písmeno mena. */
  authorImg?: string | null;
  /** Číslo autora (`feed_trip_authors.owner_n`); katalógový výlet ho nemá ⇒ bez SLEDOVAŤ. */
  authorN?: number | null;
  /** Meno z profilu (`member_display_name`, cez `feed_trip_authors`) — má prednosť pred zamrznutým `ft.author`. */
  authorName?: string | null;
  liked: boolean; onLike: () => void; likes?: number;
  comments?: number; onComment?: () => void;
  /** `lists` = koľko ľudí má výlet v TRIPLISTe (vrátane mňa), počty od 27. 10. */
  listed: boolean; onList: () => void; lists?: number;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { lang } = useLang();
  const navigate = useNavigate();
  const tr = ft.trail;
  const [idx, setIdx] = useState(0);
  const [ratio, setRatio] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const n = tr.photos.length;
  const country = trailCountry(tr);
  const countryName = useMemo(() => {
    try { return new Intl.DisplayNames([intlLocale(lang)], { type: 'region' }).of(country.toUpperCase()) || ''; } catch { return ''; }
  }, [country, lang]);
  const agg = useMemo(() => crowdAggregate(tr), [tr]);
  const chips = useMemo(() => [
    ...categoriesOf(tr.acts).map((c) => ({ key: `a:${c}`, emoji: ACT_TAG_EMOJI[c] ?? '', label: t(`pack.map.activityLabel.${c}`) })),
    ...chipsOf(tr.acts).map((ch) => {
      const k = `pack.map.chipLabel.${ch.id}`;
      return { key: `c:${ch.id}`, emoji: ch.emoji, label: t(k) === k ? ch.label : t(k) };
    }),
    ...(tr.tags ?? []).filter((tg) => tg !== 'In the middle of nature' && tg !== 'In the middle of nowhere')
      .map((tg) => ({ key: `t:${tg}`, emoji: TAG_EMOJI[tg] ?? '', label: TAG_I18N[tg] ? t(TAG_I18N[tg]) : tg })),
  ], [tr, t]);
  const desc = tripText(tr, 'desc', lang);
  const go = () => navigate(tripPath(tr));
  const swipe = useSwipe(n, (d) => setIdx((i) => (i + d + n) % n));
  // Široká ostáva široká; vysoká sa oreže na 4:5 (strop výšky ako na IG). Kým sa nenačíta, 4:3.
  const aspect = ratio ? Math.min(Math.max(ratio, 4 / 5), 2) : 4 / 3;
  const shownAuthor = (!ft.mine && authorName) || ft.author;
  const ownImg = ft.mine ? youImg : authorImg;

  return (
    <article className="pft">
      <div className="pft-head">
        <span className="pk-medallion">
          {ownImg ? <img src={sizedUrl(ownImg, 80)} alt="" /> : (shownAuthor || '?').charAt(0).toUpperCase()}
        </span>
        <div className="pft-who">
          <b>{shownAuthor || tx('pack.feed.member', 'Member')}</b>
          <small>{[tx('pack.feed.trip.new', 'New trip'), agoLabel(ft.at, lang)].filter(Boolean).join(' · ')}</small>
        </div>
        {!ft.mine && authorN != null && <FollowChip n={authorN} />}
      </div>

      <div className="pft-in">
        <div className="pft-ph" style={{ aspectRatio: String(aspect) }} {...swipe.handlers}>
          <img className="im" src={sizedUrl(tr.photos[idx] ?? tr.photos[0], 1080)} alt="" loading="lazy" decoding="async"
            style={{ objectPosition: coverPos(tr, idx) }}
            onLoad={(e) => { if (idx === 0) { const im = e.currentTarget; if (im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight); } }}
            onClick={() => { if (!swipe.moved()) go(); }} />
          <img className="pft-flag" src={flagUrl(country)} alt="" loading="lazy" />
          {n > 1 && <span className="pft-cnt">{idx + 1}/{n}</span>}
          {n > 1 && <>
            <button type="button" className="pft-nav l" aria-label={t('pack.map.previousPhoto')} onClick={() => setIdx((i) => (i - 1 + n) % n)}><HandArrowLeft size={16} /></button>
            <button type="button" className="pft-nav r" aria-label={t('pack.map.nextPhoto')} onClick={() => setIdx((i) => (i + 1) % n)}><HandArrowLeft size={16} style={{ transform: 'scaleX(-1)' }} /></button>
          </>}
          {!isWaterTrail(tr) && (
            <div className="pft-meta">
              <PhotoMetaPills agg={agg} km={tr.km} ascentM={tr.ascentM} hasRoute={hasRouteMetrics(tr)} />
            </div>
          )}
        </div>
        <div className="pft-body">
          <div className="pft-loc">{[tr.region, countryName].filter(Boolean).join(' · ')}</div>
          <h3>{tripTitle(tr, lang)}</h3>
          {chips.length > 0 && (
            <div className="pft-chips">
              {chips.map((c) => <span key={c.key} className="pk-pill">{c.emoji} {c.label}</span>)}
            </div>
          )}
          {desc && <>
            <p className={`pft-desc${open ? '' : ' cut'}`}>{desc}</p>
            {!open && desc.length > 140 && (
              <button type="button" className="pft-more" onClick={() => setOpen(true)}>{tx('pack.feed.more', 'more')}</button>
            )}
          </>}
          {tr.path && tr.path.length > 1 && (
            <button type="button" className="pft-map" onClick={go} aria-label={tx('pack.feed.trip.onMap', 'Open on the map')}>
              <MiniRoute path={tr.path} />
              {/* Licencia Mapy.com: logo + „© Seznam.cz a.s.“ (znenie z `mapAttribution.tsx`); bez odkazu, lebo je v tlačidle. */}
              <span className="attr"><img src="https://api.mapy.com/img/api/logo.svg" alt="Mapy.com" />© Seznam.cz a.s.</span>
              <span className="go">{tx('pack.feed.trip.onMap', 'Open on the map')}</span>
            </button>
          )}
          <button type="button" className="pft-cta" onClick={go}>{tx('pack.feed.trip.open', 'Open trip')}</button>
        </div>
      </div>

      <div className="pft-acts">
        {/* Poradie VŠADE labka · komentár · uloženie (Matej 26. 10.). Labka = `feed_marks`, komentár = šuplík výletu. */}
        <button type="button" onClick={onLike} aria-pressed={liked} aria-label={tx('pack.feed.act.like', 'Like')}>
          <HandPaw size={24} on={liked} />{likes > 0 && likes}
        </button>
        {onComment && (
          <button type="button" onClick={onComment} aria-label={tx('pack.feed.act.comment', 'Comments')}>
            <BrandIcon name="chat" size={24} tint="dark" />{comments > 0 && comments}
          </button>
        )}
        <span className="sp" />
        <button type="button" className={`list${listed ? ' on' : ''}`} onClick={onList} aria-pressed={listed} aria-label="TRIPLIST" title="TRIPLIST">
          <HandClipboard size={24} />{lists > 0 && lists}
        </button>
      </div>
    </article>
  );
}
