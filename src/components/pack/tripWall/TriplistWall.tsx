// ─────────────────────────────────────────────────────────────────────────────
// STENA TRIPLISTU (Matej 8. 11. 2026, nákres plany/nakres-tripstats-2026-11-08/#triplist).
// Chcem ísť = fotky, Tripwish = sen bez fotky (nočná karta), Prejdené = archív s filtrom krajín.
// Kartu výletu kreslí stále `renderCard` z PackTriplist: známka, moderácia aj štítok pawmata
// ostávajú na jednom mieste. Dátumy a partia sú v sklade (`PLANNING_LIVE`), preto tu nie sú.
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo, useState, type ReactNode } from 'react';
import { PackPopup } from '@/components/pack/PackPopup';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { useLang, useT } from '@/i18n/LanguageContext';
import { fmtNum } from '@/i18n/bcp47';
import { flagUrl, trailCountry } from '@/lib/countryGeo';
import { sizedUrl } from '@/services/cloudinaryService';
import type { MyWish } from '@/components/pack/mapnotes/wishData';
import { SUBBLOCK, TW_CSS, WallCount } from './TripStatsWall';

const T = PACK_THEME;
const S = PACK_SPACE;
const ICO = (n: string) => `/icons/tripstats/${n}.webp`;

const TLW_CSS = `
.tlw-wall{position:relative;height:264px;margin-top:${S.md}px;border-radius:${PACK_R.card}px;overflow:hidden;background:${LAPIS.deep};border:1.5px solid ${T.cardEdge};box-shadow:${LAPIS_BTN_SHADOW};}
.tlw-car{display:flex;height:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;}
.tlw-car::-webkit-scrollbar{display:none;}
.tlw-sl{position:relative;flex:none;width:100%;height:100%;padding:0;border:0;background:none;scroll-snap-align:start;overflow:hidden;cursor:pointer;text-align:left;font-family:${FONT_UI};}
.tlw-sl>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.tlw-vl{position:absolute;inset:0;background:linear-gradient(180deg,rgba(24,14,4,0) 0%,rgba(24,14,4,.72) 100%);}
.tlw-top{position:absolute;left:${S.md}px;top:${S.md}px;display:flex;align-items:center;gap:${S.sm}px;}
.tlw-top img{width:24px;height:24px;border-radius:${PACK_R.pill}px;object-fit:cover;border:1.5px solid ${T.card};}
.tlw-top u{text-decoration:none;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:${LAPIS.grad};color:${LAPIS.ink};font-size:${PACK_TEXT.micro}px;font-weight:600;line-height:1.2;}
.tlw-tx{position:absolute;left:${S.md}px;right:${S.md}px;bottom:${S.xxxl}px;color:${T.card};}
.tlw-tx b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.1;letter-spacing:.14em;} /* písmo: nadpis */
.tlw-tx small{display:block;margin-top:${S.xs}px;font-size:${PACK_TEXT.label}px;font-weight:500;}
.tlw-cnt{position:absolute;right:${S.md}px;top:${S.md}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:rgba(24,14,4,.72);color:${T.card};font-size:${PACK_TEXT.micro}px;font-weight:600;line-height:1.2;font-variant-numeric:tabular-nums;}
.tlw-empty{margin-top:${S.md}px;padding-bottom:${S.xxl}px;}
.tlw-drs{display:flex;gap:${S.sm}px;overflow-x:auto;scrollbar-width:none;margin:0 -${S.lg}px;padding:0 ${S.lg}px ${S.xs}px;}
.tlw-drs::-webkit-scrollbar{display:none;}
.tlw-drs.wrap{display:grid;grid-template-columns:1fr 1fr;overflow:visible;margin:${S.md}px 0 0;padding:0;}
.tlw-drs.wrap .tlw-dr{width:auto;}
.tlw-dr{position:relative;flex:none;width:148px;height:184px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:${S.md}px ${S.sm}px;overflow:hidden;text-align:center;cursor:pointer;border-radius:${PACK_R.tile}px;border:1.5px solid ${T.cardEdge};background:${LAPIS.grad};color:${LAPIS.ink};font-family:${FONT_UI};}
.tlw-dr svg{position:absolute;inset:0;width:100%;height:100%;}
.tlw-df{position:absolute;left:50%;top:${S.lg}px;transform:translateX(-50%);width:64px;height:64px;border-radius:${PACK_R.pill}px;object-fit:cover;border:2px solid ${T.cardEdge};}
.tlw-dr b{position:relative;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;line-height:1.15;letter-spacing:.14em;} /* písmo: nadpis */
.tlw-dr small{position:relative;margin-top:${S.xs}px;font-size:${PACK_TEXT.micro}px;font-weight:500;opacity:.82;}
.tlw-dr i{position:relative;margin-top:${S.sm}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};font-size:${PACK_TEXT.micro}px;font-weight:600;line-height:1;font-style:normal;}
.tlw-grid{display:grid;grid-template-columns:1fr 1fr;gap:${S.sm}px;}
.tlw-grid .tl-mycard{width:auto;min-width:0;flex:none;}
.tlw-grid .tl-block{width:100%;}
.tlw-grid .tl-block-badge.done{display:none;}
.tlw-km{position:absolute;right:${S.sm}px;bottom:${S.sm}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:rgba(24,14,4,.72);color:${T.card};font-size:${PACK_TEXT.micro}px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;}
.tlw-all{display:flex;align-items:center;justify-content:center;width:100%;margin-top:${S.md}px;padding:${S.lg}px ${S.xl}px;border:0;border-radius:${PACK_R.field}px;background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;} /* písmo: cta */
.tlw-pop .tw-fl button.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.tlw-pop .tlw-grid{margin-top:${S.md}px;}
`;

const STARS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 67 + 11) % 148, y: (i * 41 + 7) % 110, r: i % 5 ? 0.7 : 1.2, o: i % 3 ? 0.4 : 0.8 }));

interface Row { trail: HeroTrail }
type Sort = 'new' | 'km' | 'az';
type Sheet = { kind: 'want' | 'walked'; iso: string; sort: Sort } | { kind: 'wish' };

export function TriplistWall<R extends Row>({ upcoming, walked, wishes, renderCard, coverOf, onOpenTrip, onOpenWish, emptyWant, emptyWish, wantId, wishId, wishHelp }: {
  upcoming: R[];
  walked: R[];
  wishes: MyWish[] | null;
  renderCard: (row: R) => ReactNode;
  coverOf: (trail: HeroTrail) => string;
  onOpenTrip: (trail: HeroTrail) => void;
  onOpenWish: (w: MyWish) => void;
  emptyWant: ReactNode;
  emptyWish: ReactNode;
  wantId?: string;
  wishId?: string;
  wishHelp?: ReactNode;
}) {
  const t = useT();
  const { lang } = useLang();
  const [slide, setSlide] = useState(0);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const totalKm = useMemo(() => walked.reduce((a, r) => a + (Number(r.trail.km) || 0), 0), [walked]);
  const n = (v: number) => fmtNum(Math.round(v), lang);
  const wishList = wishes ?? [];

  const dream = (w: MyWish) => (
    <button key={w.id} type="button" className="tlw-dr" onClick={() => onOpenWish(w)}>
      <svg viewBox="0 0 148 184" aria-hidden="true">{STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} fill={LAPIS.ink} />)}</svg>
      <img className="tlw-df" src={w.countryCode ? flagUrl(w.countryCode).replace('/w40/', '/w160/') : ICO('tripwish')} alt="" />
      <b>{w.placeName}</b>
      <small>{t(`pack.wish.kind.${w.tripKind}`)}</small>
      <i>{w.status === 'missed' ? t('pack.triplist.wishMissed') : t(`pack.wish.when.${w.when}`)}</i>
    </button>
  );

  const renderList = (st: Extract<Sheet, { kind: 'want' | 'walked' }>) => {
    const all = st.kind === 'want' ? upcoming : walked;
    const isos = [...new Set(all.map((r) => trailCountry(r.trail)))];
    const inC = all.filter((r) => st.iso === 'all' || trailCountry(r.trail) === st.iso);
    const sorted = st.sort === 'km' ? [...inC].sort((a, b) => (Number(b.trail.km) || 0) - (Number(a.trail.km) || 0))
      : st.sort === 'az' ? [...inC].sort((a, b) => a.trail.name.localeCompare(b.trail.name, lang)) : inC;
    return (
      <>
        <div className="tw-sh">
          <img src={ICO(st.kind === 'want' ? 'mapa' : 'vylety')} alt="" />
          <div>
            <h3>{t(st.kind === 'want' ? 'pack.triplist.myTripsWant' : 'pack.triplist.myTripsWalked')}</h3>
            <span className="tw-num">{n(inC.length)}</span>
            {st.kind === 'walked' && <span className="tw-hd2">{n(inC.reduce((a, r) => a + (Number(r.trail.km) || 0), 0))} km</span>}
          </div>
        </div>
        <div className="tw-fl">
          <button type="button" className={st.iso === 'all' ? 'on' : ''} onClick={() => setSheet({ ...st, iso: 'all' })}>{t('pack.wall.all')}<b>{all.length}</b></button>
          {isos.map((iso) => (
            <button key={iso} type="button" className={st.iso === iso ? 'on' : ''} onClick={() => setSheet({ ...st, iso })}>
              <img src={flagUrl(iso)} alt="" /><b>{all.filter((r) => trailCountry(r.trail) === iso).length}</b>
            </button>
          ))}
        </div>
        {st.kind === 'walked' && (
          <div className="tw-fl sub">
            {(['new', 'km', 'az'] as Sort[]).map((o) => (
              <button key={o} type="button" className={st.sort === o ? 'on' : ''} onClick={() => setSheet({ ...st, sort: o })}>{t(`pack.wall.sort.${o}`)}</button>
            ))}
          </div>
        )}
        <div className="tlw-grid">{sorted.map(renderCard)}</div>
      </>
    );
  };

  return (
    <div className="tw-root">
      <style>{TW_CSS}{TLW_CSS}</style>
      <div id={wantId}>
        {upcoming.length > 0 ? (
          <div className="tlw-wall">
            <div className="tlw-car" onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
              {upcoming.map(({ trail }) => (
                <button key={trail.id} type="button" className="tlw-sl" onClick={() => onOpenTrip(trail)}>
                  <img src={sizedUrl(coverOf(trail), 800)} alt="" />
                  <span className="tlw-vl" />
                  <span className="tlw-top"><img src={flagUrl(trailCountry(trail))} alt="" /><u>{t('pack.triplist.myTripsWant')}</u></span>
                  <span className="tlw-tx"><b>{trail.name}</b><small>{Number(trail.km) ? `${n(Number(trail.km))} km · ` : ''}{trail.region}</small></span>
                </button>
              ))}
            </div>
            {upcoming.length > 1 && <span className="tlw-cnt">{slide + 1} / {upcoming.length}</span>}
          </div>
        ) : <div className="tlw-empty">{emptyWant}</div>}
      </div>

      <div className="tw-strip">
        <button type="button" style={SUBBLOCK} onClick={() => setSheet({ kind: 'want', iso: 'all', sort: 'new' })}><img src={ICO('mapa')} alt="" /><span className="tw-num"><WallCount n={upcoming.length} /></span><span className="tw-lbl">{t('pack.triplist.myTripsWant')}</span></button>
        <button type="button" style={SUBBLOCK} onClick={() => setSheet({ kind: 'wish' })}><img src={ICO('tripwish')} alt="" /><span className="tw-num"><WallCount n={wishList.length} /></span><span className="tw-lbl">Tripwish</span></button>
        <button type="button" style={SUBBLOCK} onClick={() => setSheet({ kind: 'walked', iso: 'all', sort: 'new' })}><img src={ICO('vylety')} alt="" /><span className="tw-num"><WallCount n={walked.length} /></span><span className="tw-lbl">{t('pack.triplist.myTripsWalked')}</span></button>
      </div>

      {wishes && (
        <div id={wishId}>
          <div className="tw-sec">Tripwish{wishHelp}<em>{wishList.length}</em></div>
          {wishList.length > 0 ? <div className="tlw-drs">{wishList.map(dream)}</div> : emptyWish}
        </div>
      )}

      {walked.length > 0 && <>
        <div className="tw-sec">{t('pack.triplist.myTripsWalked')}<em>{n(walked.length)} · {n(totalKm)} km</em></div>
        <div className="tlw-grid">{walked.slice(0, 4).map(renderCard)}</div>
        {walked.length > 4 && <button type="button" className="tlw-all" onClick={() => setSheet({ kind: 'walked', iso: 'all', sort: 'new' })}>{t('pack.wall.seeAll', { n: walked.length })}</button>}
      </>}

      {sheet && (
        <PackPopup onClose={() => setSheet(null)} className="tlw-pop" label={sheet.kind === 'wish' ? 'Tripwish' : t(sheet.kind === 'want' ? 'pack.triplist.myTripsWant' : 'pack.triplist.myTripsWalked')}>
          {sheet.kind === 'wish'
            ? <><div className="tw-sh"><img src={ICO('tripwish')} alt="" /><div><h3>Tripwish</h3><span className="tw-num">{wishList.length}</span></div></div><div className="tlw-drs wrap">{wishList.map(dream)}</div></>
            : renderList(sheet)}
        </PackPopup>
      )}
    </div>
  );
}
