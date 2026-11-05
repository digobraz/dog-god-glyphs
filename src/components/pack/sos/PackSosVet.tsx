// SOS → VETERINÁRNA POHOTOVOSŤ `/pack/sos/pohotovost` (kôš 3). Matej 4.–5. 11. 2026.
// Zoznam je v balíku appky (`lib/vetEmergency.ts`), takže funguje aj bez signálu a nečaká na databázu.
// Poradie: kto má práve otvorené, podľa vzdialenosti. Zatvorené idú pod čiaru, nikdy nezmiznú.
import { useEffect, useMemo, useRef, useState } from 'react';
import { FONT_TITLE, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_THEME as T } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { driveTimes, type DriveTime } from '@/components/pack/addtrip/mapProxyClient';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { SosTaskShell } from './SosTaskShell';
import { useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { useBack, useSosT, type SosT } from './sosShared';
import { CITIES, VET_EMERGENCY, closesAt, distanceKm, isOpenAt, opensAt, telAt, vetNavUrl, type NavApp, type VetPlace } from '@/lib/vetEmergency';

// Klinika bez vlastnej fotky: zjavne vymyslená kresba (Matej 5. 11. 2026, nákres plany/nakresy/nakres-klinika-placeholder-2026-11-05).
const NO_PHOTO = '/vet/_bez-fotky.jpg';
// Výrez po klinikách: nápis na fotke nesmie vojsť pod pilulku s časom.
const PHOTO_ZOOM: Record<string, string> = { 'mypet-clinic-bratislava': 'vet-zoom' };
const FAR_KM = 40;
const OUT_KM = 150; // dál ako toto od najbližšej otvorenej (alebo mimo SK a Prahy) zoznam nemáme
const HOME_KM = 70;
const DRIVE_FIRST = 8; // koľko najbližších sa zráta hneď a zoradí podľa času; ostatné, až keď príde karta na obrazovku
// Logá v `public/nav-apps/` (ako TripGoPanel). Poradie = čo ľudia na Slovensku reálne otvárajú.
const NAV_APPS: { id: NavApp; name: string; logo: string }[] = [
  { id: 'google', name: 'Google Maps', logo: '/nav-apps/google.svg' },
  { id: 'waze', name: 'Waze', logo: '/nav-apps/waze.svg' },
  { id: 'mapy', name: 'Mapy.com', logo: '/nav-apps/mapy.svg' },
];
type Filter = 'near' | 'nonstop' | 'home';

const CSS = `
.vet-chips{display:flex;gap:${PACK_SPACE.sm}px;}
.vet-chip{all:unset;box-sizing:border-box;cursor:pointer;flex:1;min-height:44px;display:flex;align-items:center;justify-content:center;text-align:center;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkWarm};}
.vet-chip.on{background:${LAPIS.grad};border-color:${LAPIS.edge};color:${LAPIS.ink};}
.vet-where{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
.vet-where select{flex:1;min-height:44px;padding:0 ${PACK_SPACE.md}px;}
.vet-warn{margin:0;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:${T.sosRedSoft};border:1px solid ${T.sosRed};font-size:${PACK_TEXT.body}px;font-weight:500;color:${T.sosRedDark};}
.vet-sec{margin:${PACK_SPACE.sm}px 0 0;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
/* Karta (Matej 5. 11. 2026, nákres plany/nakresy/klinika-karta-2026-11-05, variant B): fotka vľavo sa rozplynie skôr, než začne text. */
.vet-list{display:grid;grid-template-columns:minmax(0,1fr);gap:${PACK_SPACE.md}px;}
.vet-row{overflow:hidden;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;padding:0 0 ${PACK_SPACE.md}px;}
.vet-band{position:relative;flex:1;min-height:172px;display:flex;}
.vet-row.off{opacity:.6;}
.vet-pic{all:unset;position:absolute;left:0;top:0;bottom:0;width:52%;overflow:hidden;cursor:pointer;
  -webkit-mask-image:linear-gradient(to right,black 40%,transparent 100%),linear-gradient(to bottom,black 78%,transparent 100%);mask-image:linear-gradient(to right,black 40%,transparent 100%),linear-gradient(to bottom,black 78%,transparent 100%);-webkit-mask-composite:source-in;mask-composite:intersect;}
.vet-pic img{display:block;width:100%;height:100%;object-fit:cover;}
.vet-pic .vet-zoom{transform:scale(1.35);transform-origin:center bottom;}
.vet-eta{position:absolute;left:${PACK_SPACE.sm}px;top:${PACK_SPACE.sm}px;display:inline-flex;align-items:center;min-height:24px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;background:${AINUBIS.ctaGrad};color:${T.inkStrong};font-size:${PACK_TEXT.label}px;line-height:1.2;font-weight:600;white-space:nowrap;}
.vet-top{position:relative;flex:1;margin-left:48%;padding:${PACK_SPACE.md}px ${PACK_SPACE.md}px ${PACK_SPACE.md}px 0;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:${PACK_SPACE.xs}px;min-width:0;}
.vet-tap{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.vet-tap b{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;line-height:1.25;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: nadpis */
.vet-tap small{font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.vet-pill{margin-top:${PACK_SPACE.xs}px;align-self:flex-start;display:inline-flex;align-items:center;min-height:24px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;line-height:1.2;border-radius:${PACK_R.pill}px;font-size:${PACK_TEXT.micro}px;font-weight:600;letter-spacing:.02em;background:${T.growGreen};color:#fff;}
.vet-pill--soft{background:${T.tileBg};border:1px solid ${T.cardEdge};color:${T.inkWarm};}
.vet-more a{color:inherit;text-decoration:underline;}
.vet-more{position:relative;margin:${PACK_SPACE.xs}px 0 0;font-size:${PACK_TEXT.label}px;line-height:1.5;color:${T.inkWarm};}
.vet-acts{position:relative;margin:0 ${PACK_SPACE.md}px;display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;}
.vet-acts a,.vet-nav a{text-decoration:none;}
.vet-acts.one{grid-template-columns:1fr;}
.vet-acts .sos-cta{font-size:${PACK_TEXT.body}px;}
.vet-nav{position:relative;margin:0 ${PACK_SPACE.md}px;display:grid;grid-template-columns:repeat(3,1fr);gap:${PACK_SPACE.sm}px;}
.vet-nav a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${PACK_SPACE.xs}px;min-height:56px;padding:${PACK_SPACE.sm}px;border-radius:${PACK_R.field}px;border:1.5px solid ${T.cardEdge};background:${T.tileBg};font-size:${PACK_TEXT.micro}px;font-weight:600;color:${T.inkStrong};text-align:center;}
.vet-nav img{width:24px;height:24px;display:block;}
.vet-g,.vet-web{align-self:flex-start;cursor:pointer;font-size:${PACK_TEXT.label}px;line-height:1.35;color:${T.inkWarm};text-decoration:underline;white-space:nowrap;}
.vet-g{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;font-weight:600;color:${T.inkStrong};}
.vet-g img{display:block;width:14px;height:14px;}
.vet-src{margin:0;text-align:center;font-size:${PACK_TEXT.micro}px;line-height:1.5;color:${T.inkWarm};}
/* PC: dve karty vedľa seba, väčšie písmo (Matej 5. 11. 2026). */
@media (min-width:768px){
  .vet-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:${PACK_SPACE.lg}px;}
  .vet-band{min-height:216px;}
  .vet-top{gap:${PACK_SPACE.sm}px;}
  .vet-tap b{font-size:${PACK_TEXT.h2}px;}
  .vet-tap small,.vet-g,.vet-web,.vet-more{font-size:${PACK_TEXT.body}px;}
  .vet-g img{width:16px;height:16px;}
  .vet-pill{font-size:${PACK_TEXT.label}px;min-height:32px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;}
  .vet-eta{font-size:${PACK_TEXT.body}px;min-height:32px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;}
  .vet-acts .sos-cta{min-height:56px;}
}
`;

/** „729 recenzií“ a dátum opisu podľa jazyka rozhrania; číslo stojí pri logu Google. */
function reviewsLabel(g: NonNullable<VetPlace['google']>, s: SosT, loc: string): string {
  const cat = new Intl.PluralRules(loc).select(g.count);
  const key = cat === 'one' ? 'pack.sos.er.gRevOne' : cat === 'few' ? 'pack.sos.er.gRevFew' : 'pack.sos.er.gRevMany';
  return s(key, { count: g.count.toLocaleString(loc) });
}
function googleDate(g: NonNullable<VetPlace['google']>, loc: string): string {
  const [y, m, d] = g.at.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString(loc, { day: 'numeric', month: /^(sk|cs)/.test(loc) ? 'numeric' : 'short', timeZone: 'UTC' });
}
/** „8 km · 12 min“, s ≈ ak nemáme presný bod kliniky, len adresu alebo mesto. */
function etaLabel(d: DriveTime, exact: boolean | undefined, loc: string): string {
  const km = d.lengthM / 1000;
  const dist = km < 1 ? km.toLocaleString(loc, { maximumFractionDigits: 1 }) : String(Math.round(km));
  const min = Math.max(1, Math.round(d.durationS / 60));
  const time = min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
  return `${exact ? '' : '≈ '}${dist} km · ${time}`;
}
const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');

function hoursLabel(p: VetPlace, s: SosT, now: Date): string {
  if (p.clientsOnly) return s('pack.sos.er.clientsOnly');
  if (p.home) return s(p.hours === 'nonstop' ? 'pack.sos.er.homeNonstop' : 'pack.sos.er.home');
  if (p.hours === 'onsite') return s('pack.sos.er.onsite');
  if (p.hours === 'call') return s('pack.sos.er.call');
  if (p.hours === 'nonstop') return s('pack.sos.er.nonstop');
  if (p.hours === 'ask') return s('pack.sos.er.ask');
  const [from, to] = p.hours;
  // Cez polnoc ukáž celý rozsah: cez deň by „Do 7:00" pri zatvorenej pohotovosti mýlilo.
  if (to > 24) return `${from}:00–${to - 24}:00`;
  // Zatvorená: človek potrebuje vedieť, kedy otvoria, nie kedy dnes zavreli.
  return isOpenAt(p, now)
    ? s('pack.sos.er.until', { time: `${closesAt(p, now)}:00` })
    : s('pack.sos.er.from', { time: `${opensAt(p, now)}:00` });
}

export default function PackSosVet() {
  const s = useSosT();
  const { lang } = useLang();
  const loc = intlLocale(lang);
  const onBack = useBack('/pack');
  const [gps, setGps] = useState<[number, number] | null>(null);
  // wait = čakáme na GPS · denied = zamietnuté (nepýtame sa znova) · fail = timeout / bez signálu (tlačidlo ostáva)
  const [gpsState, setGpsState] = useState<'wait' | 'ok' | 'denied' | 'fail'>('wait');
  const [city, setCity] = useState<string>(''); // '' = GPS, ak ju máme; inak nič (poloha neznáma)
  const [filter, setFilter] = useState<Filter>('near');
  const [open, setOpen] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState<string | null>(null); // riadok, ktorému je rozbalený výber navigácie

  const locate = () => {
    if (!navigator.geolocation) { setGpsState('fail'); return; }
    setGpsState('wait');
    navigator.geolocation.getCurrentPosition(
      (p) => { setGps([p.coords.latitude, p.coords.longitude]); setGpsState('ok'); setCity(''); },
      (e) => setGpsState(e.code === 1 ? 'denied' : 'fail'),
      { timeout: 10000, maximumAge: 300000 },
    );
  };
  // Núdza: pýtame sa rovno, bez medzikroku. Odmietnutie nič neblokuje, nastúpi výber mesta.
  useEffect(() => { if (navigator.geolocation) locate(); else setGpsState('fail'); }, []);

  // Bez GPS a bez mesta polohu NEMÁME: nerátame od Bratislavy.
  const me = useMemo<[number, number] | null>(
    () => (city ? CITIES.find((c) => c.name === city)?.at ?? null : gps),
    [gps, city],
  );
  // Obrazovka môže ležať otvorená celú noc: hodiny sa prepočítajú aj bez ťuku.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(tick);
  }, []);

  // Km a čas autom. `drive` sa dopĺňa, poradie určí len prvá dávka (`rank`), aby karty neskákali pri rolovaní.
  const [drive, setDrive] = useState<Record<string, DriveTime>>({});
  const [rank, setRank] = useState<Record<string, number>>({});
  const asked = useRef(new Set<string>());
  const fetchDrive = async (from: [number, number], places: VetPlace[], ranked: boolean) => {
    const res = await driveTimes(from, places.map((p) => p.at));
    if (meRef.current !== from) return;
    const got = Object.fromEntries(places.flatMap((p, i) => (res[i] ? [[p.id, res[i]!]] : [])));
    setDrive((d) => ({ ...d, ...got }));
    if (ranked) setRank(Object.fromEntries(Object.entries(got).map(([id, v]) => [id, v.durationS])));
  };
  const meRef = useRef(me);
  meRef.current = me;
  useEffect(() => {
    setDrive({}); setRank({}); asked.current = new Set();
    if (!me) return;
    const near = VET_EMERGENCY
      .filter((p) => vetNavUrl('google', p) !== null && !p.home)
      .sort((a, b) => Number(isOpenAt(b, new Date())) - Number(isOpenAt(a, new Date())) || distanceKm(me, a.at) - distanceKm(me, b.at))
      .slice(0, DRIVE_FIRST);
    near.forEach((p) => asked.current.add(p.id));
    void fetchDrive(me, near, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const rows = useMemo(() => {
    const all = VET_EMERGENCY.map((p) => ({ p, km: me ? Math.round(distanceKm(me, p.at)) : null, on: isOpenAt(p, now) }));
    const picked = filter === 'home' ? all.filter((r) => r.p.home && (r.km === null || r.km <= HOME_KM))
      : filter === 'nonstop' ? all.filter((r) => typeof r.p.hours === 'string' && r.p.hours !== 'ask')
        : all;
    return picked.sort((a, b) => Number(!!a.p.clientsOnly) - Number(!!b.p.clientsOnly) || (rank[a.p.id] ?? Infinity) - (rank[b.p.id] ?? Infinity) || (a.km ?? 0) - (b.km ?? 0));
  }, [me, filter, now, rank]);
  const on = rows.filter((r) => r.on);
  const off = rows.filter((r) => !r.on);
  // Mimo pokrytia: nič otvorené do 150 km (to zahŕňa aj polohu mimo SK a Prahy), nezávisle od filtra.
  const outside = useMemo(() => {
    if (!me) return false;
    return !VET_EMERGENCY.some((p) => isOpenAt(p, now) && distanceKm(me, p.at) <= OUT_KM);
  }, [me, now]);

  // Ostatné kliniky: čas sa zráta, až keď karta príde na obrazovku.
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!me || !listRef.current || typeof IntersectionObserver === 'undefined') return;
    let wait: number | undefined;
    const queue: VetPlace[] = [];
    const io = new IntersectionObserver((seen) => {
      for (const e of seen) {
        const id = (e.target as HTMLElement).dataset.vet;
        const p = VET_EMERGENCY.find((x) => x.id === id);
        if (!e.isIntersecting || !p || asked.current.has(p.id) || p.home || vetNavUrl('google', p) === null) continue;
        asked.current.add(p.id);
        queue.push(p);
      }
      window.clearTimeout(wait);
      wait = window.setTimeout(() => { if (queue.length) void fetchDrive(me, queue.splice(0), false); }, 300);
    }, { rootMargin: '200px' });
    listRef.current.querySelectorAll('[data-vet]').forEach((el) => io.observe(el));
    return () => { io.disconnect(); window.clearTimeout(wait); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, rows]);

  const row = ({ p, km, on: isOn }: (typeof rows)[number], first: boolean) => {
    const canNav = vetNavUrl('google', p) !== null;
    return (
    <div key={p.id} data-vet={p.id} className={`vet-row${isOn ? '' : ' off'}`} style={{ ...PACK_BOX.subblock }}>
      <div className="vet-band">
        <button type="button" className="vet-pic" tabIndex={-1} aria-hidden="true" onClick={() => setOpen(open === p.id ? null : p.id)}>
          <img className={PHOTO_ZOOM[p.id]} src={p.photo?.src ?? NO_PHOTO} alt="" loading="lazy" decoding="async" />
        </button>
        {!p.home && canNav && (drive[p.id] || km !== null) && (
          <span className="vet-eta">{drive[p.id] ? etaLabel(drive[p.id], p.exact, loc) : s('pack.sos.er.airKm', { km: km as number })}</span>
        )}
        <div className="vet-top">
          <button type="button" className="vet-tap" onClick={() => setOpen(open === p.id ? null : p.id)} aria-expanded={open === p.id}>
            <b>{p.name}</b>
            <small>{p.home && km !== null ? `${p.place} · ${km} km` : p.place}</small>
          </button>
          {p.google && (
            <a className="vet-g" href={p.google.url} target="_blank" rel="noopener noreferrer">
              {p.google.rating.toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <img src="/nav-apps/google-g.svg" alt="Google" />
              · {reviewsLabel(p.google, s, loc)}
            </a>
          )}
          <a className="vet-web" href={p.web} target="_blank" rel="noopener noreferrer">{hostOf(p.web)}</a>
          <span className={`vet-pill${p.clientsOnly || typeof p.hours !== 'string' || p.hours === 'ask' ? ' vet-pill--soft' : ''}`}>{hoursLabel(p, s, now)}</span>
          {open === p.id && (
            <p className="vet-more">
              {p.address}
              {p.fee && <><br />{s('pack.sos.er.fee', { fee: p.fee })}</>}
              {p.note && <><br />{s(p.note)}</>}
              {p.google && <><br />{s('pack.sos.er.gAt', { date: googleDate(p.google, loc) })}</>}
              {p.photo && <><br /><a href={p.photo.source} target="_blank" rel="noopener noreferrer">{s('pack.sos.er.photoFrom', { site: hostOf(p.photo.source) })}</a></>}
            </p>
          )}
        </div>
      </div>
      {/* Volanie = hlavná akcia (lapis), navigácia druhá (ghost). Bez použiteľnej polohy ani adresy (výjazdy) zostáva samo volanie. */}
      <div className={`vet-acts${canNav ? '' : ' one'}`}>
        <a className={`sos-cta sos-cta--sm${first ? '' : ' sos-cta--tint'}`} href={`tel:${telAt(p, now).replace(/\s/g, '')}`}>{s('pack.sos.er.callBtn')}</a>
        {canNav && (
          <button type="button" className="sos-cta sos-cta--sm sos-cta--ghost" aria-expanded={navOpen === p.id} onClick={() => setNavOpen(navOpen === p.id ? null : p.id)}>{s('pack.sos.er.navBtn')}</button>
        )}
      </div>
      {canNav && navOpen === p.id && (
        <div className="vet-nav" role="group" aria-label={s('pack.sos.er.navOpen')}>
          {NAV_APPS.map((a) => (
            <a key={a.id} href={vetNavUrl(a.id, p)!} target="_blank" rel="noopener noreferrer" onClick={() => setNavOpen(null)}>
              <img src={a.logo} alt="" aria-hidden="true" />{a.name}
            </a>
          ))}
        </div>
      )}
    </div>
    );
  };

  return (
    <SosTaskShell onBack={onBack} backLabel={s('pack.sos.back')} wide>
      <style>{CSS}</style>
      <h1 className="sos-h2">{s('pack.sos.er.title')}</h1>
      <div className="vet-chips">
        {([['near', 'pack.sos.er.near'], ['nonstop', 'pack.sos.er.nonstopChip'], ['home', 'pack.sos.er.homeChip']] as const).map(([k, l]) => (
          <button key={k} type="button" className={`vet-chip${filter === k ? ' on' : ''}`} onClick={() => setFilter(k)}>{s(l)}</button>
        ))}
      </div>
      <div className="vet-where">
        <BrandIcon name="locate" size={24} tint="gold" />
        <select className="pf-field" value={city} onChange={(e) => setCity(e.target.value)} aria-label={s('pack.sos.er.where')}>
          {gps ? <option value="">{s('pack.sos.er.myLoc')}</option> : <option value="" disabled>{s('pack.sos.er.where')}</option>}
          {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        {!gps && gpsState !== 'denied' && <button type="button" className="sos-cta sos-cta--sm sos-cta--ghost" style={{ width: 'auto' }} onClick={locate} disabled={gpsState === 'wait'}>{s('pack.sos.er.gps')}</button>}
      </div>
      {!me && gpsState === 'wait' && <p className="vet-more">{s('pack.sos.er.locating')}</p>}
      {!me && gpsState === 'fail' && <p className="vet-more">{s('pack.sos.er.gpsFail')}</p>}
      {!me && gpsState !== 'wait' && <p className="vet-more">{s('pack.sos.er.pick')}</p>}
      {outside && (
        <>
          <p className="vet-warn">{s('pack.sos.er.outside')}</p>
          <a className="sos-cta" href={`https://mapy.com/en/zakladni?q=${encodeURIComponent('vet emergency')}&x=${me![1]}&y=${me![0]}&z=13`} target="_blank" rel="noopener noreferrer">{s('pack.sos.er.searchMaps')}</a>
        </>
      )}
      {!outside && filter !== 'home' && on[0] && on[0].km !== null && on[0].km > FAR_KM && <p className="vet-warn">{s('pack.sos.er.far', { km: on[0].km })}</p>}
      {filter === 'home' && me && rows.length === 0 && <p className="vet-warn">{s('pack.sos.er.noHome')}</p>}
      <div ref={listRef} style={{ display: 'contents' }}>
        {on.length > 0 && <div className="vet-list">{on.map((r, i) => row(r, i === 0 && !!me && !outside))}</div>}
        {off.length > 0 && <h2 className="vet-sec">{s('pack.sos.er.closed')}</h2>}
        {off.length > 0 && <div className="vet-list">{off.map((r) => row(r, false))}</div>}
      </div>
      <p className="vet-src">{s('pack.sos.er.source')}</p>
    </SosTaskShell>
  );
}
