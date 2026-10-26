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
import { COMMUNITY_CSS, PhotoMetaPills } from '@/components/pack/packCommunityUI';
import { crowdAggregate } from '@/components/pack/packCommunity';
import { categoriesOf, chipsOf, ACT_TAG_EMOJI, TAG_EMOJI, TAG_I18N } from '@/components/pack/tripCategories';
import { tripPath, tripText, hasRouteMetrics, isWaterTrail, coverPos } from '@/components/pack/tripShared';
import { trailCountry, flagUrl } from '@/lib/countryGeo';
import { sizedUrl } from '@/services/cloudinaryService';
import { agoLabel, tripTitle, type FeedTrip } from './feedData';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

export const FEED_TRIP_CSS = `
${COMMUNITY_CSS}
/* PLOCHÝ príspevok cez celú šírku (Matej 26. 10.: „príspevky na feede by som dal cez celú šírku, nie do blokov") —
   fotka ide od okraja po okraj, odsadené sú len hlavička, text a akcie. */
.pft{display:flex;flex-direction:column;}
.pft-head{display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;}
.pft-head .pk-medallion{font:600 ${TX.body}px/1 ${FONT_UI};color:${T.inkWarm};}
.pft-who{min-width:0;flex:1;}
.pft-who b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: meno */
.pft-who small{font-size:${TX.label}px;color:${T.inkWarm};}
.pft-in{overflow:hidden;}
.pft-ph{position:relative;width:100%;background:${T.tileBg};overflow:hidden;}
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
.pft-map svg{display:block;width:100%;height:auto;}
.pft-map span{position:absolute;right:${S.sm}px;bottom:${S.sm}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};
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

/** Mini mapa: čiara výletu na mriežke, bez dlaždíc (náhľad, nie mapa — preklik ju otvorí naostro). */
function MiniRoute({ path }: { path: HeroTrail['path'] }) {
  const W = 320; const H = 140; const PAD = 16;
  const d = useMemo(() => {
    if (!path || path.length < 2) return '';
    const lat0 = path.reduce((a, p) => a + p[0], 0) / path.length;
    const k = Math.cos((lat0 * Math.PI) / 180);
    const step = Math.max(1, Math.floor(path.length / 400));
    const pts = path.filter((_, i) => i % step === 0 || i === path.length - 1).map((p) => [p[1] * k, -p[0]]);
    const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const sc = Math.min((W - 2 * PAD) / Math.max(x1 - x0, 1e-9), (H - 2 * PAD) / Math.max(y1 - y0, 1e-9));
    const ox = (W - (x1 - x0) * sc) / 2; const oy = (H - (y1 - y0) * sc) / 2;
    return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(ox + (x - x0) * sc).toFixed(1)},${(oy + (y - y0) * sc).toFixed(1)}`).join('');
  }, [path]);
  if (!d) return null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => <line key={`v${i}`} x1={(W / 6) * i} y1={0} x2={(W / 6) * i} y2={H} stroke={T.hairline} strokeWidth={1} />)}
      {[1, 2].map((i) => <line key={`h${i}`} x1={0} y1={(H / 3) * i} x2={W} y2={(H / 3) * i} stroke={T.hairline} strokeWidth={1} />)}
      <path d={d} fill="none" stroke={T.tripPurple} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeedTripCard({ ft, youImg, liked, onLike, listed, onList }: {
  ft: FeedTrip;
  youImg: string | null;
  liked: boolean; onLike: () => void;
  listed: boolean; onList: () => void;
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
  // Široká ostáva široká; vysoká sa oreže na 4:5 (strop výšky ako na IG). Kým sa nenačíta, 4:3.
  const aspect = ratio ? Math.min(Math.max(ratio, 4 / 5), 2) : 4 / 3;
  const ownImg = ft.mine ? youImg : null;

  return (
    <article className="pft">
      <div className="pft-head">
        <span className="pk-medallion">
          {ownImg ? <img src={sizedUrl(ownImg, 80)} alt="" /> : (ft.author || '?').charAt(0).toUpperCase()}
        </span>
        <div className="pft-who">
          <b>{ft.author || tx('pack.feed.member', 'Member')}</b>
          <small>{[tx('pack.feed.trip.new', 'New trip'), agoLabel(ft.at, lang)].filter(Boolean).join(' · ')}</small>
        </div>
      </div>

      <div className="pft-in">
        <div className="pft-ph" style={{ aspectRatio: String(aspect) }}>
          <img className="im" src={sizedUrl(tr.photos[idx] ?? tr.photos[0], 1080)} alt="" loading="lazy" decoding="async"
            style={{ objectPosition: coverPos(tr, idx) }}
            onLoad={(e) => { if (idx === 0) { const im = e.currentTarget; if (im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight); } }}
            onClick={go} />
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
              <span>{tx('pack.feed.trip.onMap', 'Open on the map')}</span>
            </button>
          )}
          <button type="button" className="pft-cta" onClick={go}>{tx('pack.feed.trip.open', 'Open trip')}</button>
        </div>
      </div>

      <div className="pft-acts">
        {/* TODO backend: labka výletu = len toto zariadenie (`post_marks` kľúčuje `posts.id`). */}
        <button type="button" onClick={onLike} aria-pressed={liked} aria-label={tx('pack.feed.act.like', 'Like')}>
          <HandPaw size={24} on={liked} />
        </button>
        <span className="sp" />
        <button type="button" className={`list${listed ? ' on' : ''}`} onClick={onList} aria-pressed={listed} aria-label="TRIPLIST" title="TRIPLIST">
          <HandClipboard size={24} />
        </button>
      </div>
    </article>
  );
}
