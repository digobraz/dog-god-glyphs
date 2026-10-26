// VRCH FEEDU — pás pod sticky hlavičkou (Matej 26. 10. 2026: *„potrebujem aby nejaká hlavička zostala, nešla
// celkom preč — chcem aby tam bol Ainubis, sniffer a možno nejaké najnovšie výlety a až potom začne feed"*).
// Poradie AINUBIS → Sniffer → Výlety odklepnuté nad nákresom v2. Pás odíde so scrollom, hlavička ostáva.
//
// SNIFFER = VCHOD, nie druhý Sniffer (lock architektura-pack §8.1 DOPLNOK 26. 10.): `assnif_nearby` cez
// `loadNearby(null)` — tí istí ľudia, ktorých vidí Sniffer, s tým istým zámkom vzájomnosti. Ťuk vedie do
// Sniffera. Chyba alebo nikto ⇒ ostane len dlaždica SNIFFUJ (prázdne je prázdne).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_BOX, PACK_HEAD, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { SNIFFER_HEART } from '@/components/pack/buddy/SnifferLogo';
import { loadNearby, type SnifferCardData } from '@/components/pack/buddy/snifferDeck';
import { tripPath } from '@/components/pack/tripShared';
import { trailCountry, flagUrl } from '@/lib/countryGeo';
import { sizedUrl } from '@/services/cloudinaryService';
import { tripTitle, type FeedTrip } from './feedData';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
/** Papyrus z loga SNIFFERu (`sniffer-napis-light.svg`) — nápis na červenej dlaždici. */
const SNIFFER_PAPER = '#F6E9D0';

export const FEED_TOP_CSS = `
.pfs-row{display:flex;align-items:baseline;justify-content:space-between;gap:${S.md}px;margin:0 0 ${S.sm}px;}
.pfs-row h2{margin:0;font:500 ${TX.micro}px/1.2 ${FONT_UI};letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${T.inkWarm};}
.pfs-row button{background:none;border:0;padding:0;cursor:pointer;font:600 ${TX.micro}px/1 ${FONT_UI};letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};}
.pfs-strip{display:flex;gap:${S.sm}px;overflow-x:auto;scrollbar-width:none;margin:0 -${S.lg}px;padding:0 ${S.lg}px ${S.xs}px;scroll-snap-type:x proximity;}
.pfs-strip::-webkit-scrollbar{display:none;}
.pfs-dog{position:relative;flex:none;width:104px;height:140px;border-radius:${PACK_R.tile}px;overflow:hidden;cursor:pointer;padding:0;border:1px solid ${T.cardEdge};
  background:${T.tileBg} center/cover no-repeat;scroll-snap-align:start;text-align:left;}
.pfs-dog::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.72) 100%);}
.pfs-dog span{position:absolute;left:${S.sm}px;right:${S.sm}px;bottom:${S.sm}px;z-index:1;color:${T.onDark};}
.pfs-dog b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;} /* písmo: meno */
.pfs-dog small{display:block;font:500 ${TX.micro}px/1.3 ${FONT_UI};opacity:.9;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pfs-go{flex:none;width:104px;height:140px;border-radius:${PACK_R.tile}px;cursor:pointer;border:1px solid ${SNIFFER_HEART};background:${SNIFFER_HEART};color:${SNIFFER_PAPER};
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.sm}px;padding:${S.sm}px;scroll-snap-align:start;}
.pfs-go i{display:block;width:32px;height:32px;background:${SNIFFER_PAPER};-webkit-mask:url(/icons/sniffer/nose.svg) center/contain no-repeat;mask:url(/icons/sniffer/nose.svg) center/contain no-repeat;}
.pfs-go img{display:block;height:20px;width:auto;}
.pfs-row .pfs-logo{display:block;height:24px;width:auto;}
.pfs-row.is-sniffer button{display:flex;align-items:center;}
.pfs-row.is-sniffer h2{color:${SNIFFER_HEART};}
.pfs-trip{flex:none;width:168px;overflow:hidden;cursor:pointer;padding:0;text-align:left;scroll-snap-align:start;color:${T.inkStrong};font-family:${FONT_UI};}
.pfs-trip .ph{position:relative;display:block;width:100%;aspect-ratio:4/3;background:${T.tileBg} center/cover no-repeat;}
.pfs-trip .ph img{position:absolute;left:${S.sm}px;top:${S.sm}px;width:24px;height:24px;border-radius:${PACK_R.pill}px;border:2px solid ${T.onDark};object-fit:cover;}
.pfs-trip .tt{display:block;padding:${S.sm}px;}
.pfs-trip b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;} /* písmo: meno */
.pfs-trip small{display:block;margin-top:${S.xs}px;font-size:${TX.micro}px;color:${T.inkWarm};}
`;

const BAND_KM: Record<string, string> = { '0-5': '0–5 km', '5-10': '5–10 km', '10-25': '10–25 km', '25-50': '25–50 km', '50+': '50+ km' };

export function SnifferStrip() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const navigate = useNavigate();
  const [cards, setCards] = useState<SnifferCardData[]>([]);
  useEffect(() => {
    let on = true;
    loadNearby(null).then((c) => { if (on) setCards(c.slice(0, 12)); }).catch(() => { if (on) setCards([]); });
    return () => { on = false; };
  }, []);
  const go = () => navigate('/pack/sniffer');
  return (
    <section>
      <div className="pfs-row is-sniffer">
        <h2>{tx('pack.feed.top.buddy', 'Looking for a buddy')}</h2>
        <button type="button" onClick={go} aria-label="SNIFFER"><img className="pfs-logo" src="/icons/sniffer/sniffer-logo.svg" alt="" /></button>
      </div>
      <div className="pfs-strip">
        {cards.map((c) => {
          const dog = c.dogs[0];
          const photo = dog?.photo || c.photos[0] || null;
          const when = c.heading?.when ? tx(`pack.sniffer.search.when.${c.heading.when}`, '') : '';
          const sub = [when, c.distanceBand ? BAND_KM[c.distanceBand] : c.region].filter(Boolean).join(' · ');
          return (
            <button key={c.member} type="button" className="pfs-dog" onClick={go}
              style={photo ? { backgroundImage: `url(${sizedUrl(photo, 240)})` } : undefined}>
              <span><b>{dog?.name || c.name}</b>{sub && <small>{sub}</small>}</span>
            </button>
          );
        })}
        <button type="button" className="pfs-go" onClick={go}>
          <i aria-hidden /><img src="/icons/sniffer/sniffer-napis-light.svg" alt="" /><span className="sr-only">{tx('pack.feed.top.sniff', 'Sniff')}</span>
        </button>
      </div>
    </section>
  );
}

export function TripStrip({ trips }: { trips: FeedTrip[] }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { lang } = useLang();
  const navigate = useNavigate();
  if (!trips.length) return null;
  const km = (s: string) => { const n = Number(s); return n > 0 ? `${n.toLocaleString(intlLocale(lang), { maximumFractionDigits: 1 })} km` : ''; };
  return (
    <section>
      <div className="pfs-row">
        <h2>{tx('pack.feed.top.trips', 'Newest trips')}</h2>
        <button type="button" onClick={() => navigate('/pack/map')}>{tx('pack.feed.top.map', 'Map')}</button>
      </div>
      <div className="pfs-strip">
        {trips.map(({ trail: tr }) => (
          <button key={tr.id} type="button" className="pfs-trip" style={{ ...PACK_BOX.subblock }} onClick={() => navigate(tripPath(tr))}>
            <span className="ph" style={{ backgroundImage: `url(${sizedUrl(tr.photos[0], 400)})`, backgroundPosition: `50% ${tr.coverY ?? 50}%` }}>
              <img src={flagUrl(trailCountry(tr))} alt="" loading="lazy" />
            </span>
            <span className="tt">
              <b>{tripTitle(tr, lang)}</b>
              <small>{[km(tr.km), tr.diff ? t(`pack.map.diff.${tr.diff}`) : ''].filter(Boolean).join(' · ')}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
