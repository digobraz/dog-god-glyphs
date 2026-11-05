// SOS → VETERINÁRNA POHOTOVOSŤ `/pack/sos/pohotovost` (kôš 3). Matej 4.–5. 11. 2026.
// Zoznam je v balíku appky (`lib/vetEmergency.ts`), takže funguje aj bez signálu a nečaká na databázu.
// Poradie: kto má práve otvorené, podľa vzdialenosti. Zatvorené idú pod čiaru, nikdy nezmiznú.
import { useEffect, useMemo, useState } from 'react';
import { PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_THEME as T } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { SosTaskShell } from './SosTaskShell';
import { useBack, useSosT, type SosT } from './sosShared';
import { CITIES, VET_EMERGENCY, closesAt, distanceKm, isOpenAt, opensAt, telAt, type VetPlace } from '@/lib/vetEmergency';

const FAR_KM = 40;
const HOME_KM = 70;
type Filter = 'near' | 'nonstop' | 'home';

const CSS = `
.vet-chips{display:flex;gap:${PACK_SPACE.sm}px;}
.vet-chip{all:unset;box-sizing:border-box;cursor:pointer;flex:1;min-height:44px;display:flex;align-items:center;justify-content:center;text-align:center;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkWarm};}
.vet-chip.on{background:${LAPIS.grad};border-color:${LAPIS.edge};color:${LAPIS.ink};}
.vet-where{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
.vet-where select{flex:1;min-height:44px;padding:0 ${PACK_SPACE.md}px;}
.vet-warn{margin:0;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:${T.sosRedSoft};border:1px solid ${T.sosRed};font-size:${PACK_TEXT.body}px;font-weight:500;color:${T.sosRedDark};}
.vet-sec{margin:${PACK_SPACE.sm}px 0 0;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.vet-row{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.md}px;}
.vet-row.off{opacity:.6;}
.vet-tap{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.vet-tap b{font-size:${PACK_TEXT.lead}px;font-weight:600;color:${T.inkStrong};}
.vet-tap small{font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.vet-pill{align-self:flex-start;display:inline-flex;align-items:center;min-height:24px;padding:0 ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;font-size:${PACK_TEXT.micro}px;font-weight:600;letter-spacing:.02em;background:${LAPIS.grad};color:${LAPIS.ink};}
.vet-pill--soft{background:${T.tileBg};border:1px solid ${T.cardEdge};color:${T.inkWarm};}
.vet-more{margin:0;font-size:${PACK_TEXT.label}px;line-height:1.5;color:${T.inkWarm};}
.vet-acts{display:grid;grid-template-columns:1fr;gap:${PACK_SPACE.sm}px;}
.vet-acts.two{grid-template-columns:1fr 1fr;}
.vet-acts a{text-decoration:none;}
.vet-src{margin:0;text-align:center;font-size:${PACK_TEXT.micro}px;line-height:1.5;color:${T.inkWarm};}
`;

function hoursLabel(p: VetPlace, s: SosT, now: Date): string {
  if (p.clientsOnly) return s('pack.sos.er.clientsOnly');
  if (p.home) return s('pack.sos.er.home');
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
  const onBack = useBack('/pack');
  const [gps, setGps] = useState<[number, number] | null>(null);
  const [denied, setDenied] = useState(false);
  const [city, setCity] = useState<string>(CITIES[0].name);
  const [filter, setFilter] = useState<Filter>('near');
  const [open, setOpen] = useState<string | null>(null);

  const locate = () => navigator.geolocation?.getCurrentPosition(
    (p) => { setGps([p.coords.latitude, p.coords.longitude]); setDenied(false); },
    () => setDenied(true),
    { timeout: 10000, maximumAge: 300000 },
  );
  // Núdza: pýtame sa rovno, bez medzikroku. Odmietnutie nič neblokuje, nastúpi výber mesta.
  useEffect(() => { if (navigator.geolocation) locate(); else setDenied(true); }, []);

  const me = useMemo<[number, number]>(() => gps ?? CITIES.find((c) => c.name === city)!.at, [gps, city]);
  // Obrazovka môže ležať otvorená celú noc: hodiny sa prepočítajú aj bez ťuku.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(tick);
  }, []);

  const rows = useMemo(() => {
    const all = VET_EMERGENCY.map((p) => ({ p, km: Math.round(distanceKm(me, p.at)), on: isOpenAt(p, now) }));
    const picked = filter === 'home' ? all.filter((r) => r.p.home && r.km <= HOME_KM)
      : filter === 'nonstop' ? all.filter((r) => typeof r.p.hours === 'string' && r.p.hours !== 'ask')
        : all;
    return picked.sort((a, b) => Number(!!a.p.clientsOnly) - Number(!!b.p.clientsOnly) || a.km - b.km);
  }, [me, filter, now]);
  const on = rows.filter((r) => r.on);
  const off = rows.filter((r) => !r.on);

  const row = ({ p, km, on: isOn }: (typeof rows)[number], first: boolean) => (
    <div key={p.id} className={`vet-row${isOn ? '' : ' off'}`} style={{ ...PACK_BOX.row }}>
      <button type="button" className="vet-tap" onClick={() => setOpen(open === p.id ? null : p.id)} aria-expanded={open === p.id}>
        <b>{p.name}</b>
        <small>{p.place} · {km} km</small>
      </button>
      <span className={`vet-pill${p.clientsOnly || typeof p.hours !== 'string' || p.hours === 'ask' ? ' vet-pill--soft' : ''}`}>{hoursLabel(p, s, now)}</span>
      {open === p.id && (
        <p className="vet-more">
          {p.address}
          {p.fee && <><br />{s('pack.sos.er.fee', { fee: p.fee })}</>}
          {p.note && <><br />{s(p.note)}</>}
        </p>
      )}
      <div className={`vet-acts${open === p.id ? ' two' : ''}`}>
        <a className={`sos-cta sos-cta--sm${first ? '' : ' sos-cta--tint'}`} href={`tel:${telAt(p, now).replace(/\s/g, '')}`}>{s('pack.sos.er.callBtn')}</a>
        {open === p.id && (
          <a className="sos-cta sos-cta--sm sos-cta--ghost" href={`https://mapy.com/fnc/v1/route?start=${me[1]},${me[0]}&end=${p.at[1]},${p.at[0]}&routeType=car_fast`} target="_blank" rel="noopener noreferrer">{s('pack.sos.er.route')}</a>
        )}
      </div>
    </div>
  );

  return (
    <SosTaskShell onBack={onBack} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <h1 className="sos-h2">{s('pack.sos.er.title')}</h1>
      <div className="vet-chips">
        {([['near', 'pack.sos.er.near'], ['nonstop', 'pack.sos.er.nonstopChip'], ['home', 'pack.sos.er.homeChip']] as const).map(([k, l]) => (
          <button key={k} type="button" className={`vet-chip${filter === k ? ' on' : ''}`} onClick={() => setFilter(k)}>{s(l)}</button>
        ))}
      </div>
      {!gps && (
        <div className="vet-where">
          <BrandIcon name="locate" size={24} tint="gold" />
          <select className="pf-field" value={city} onChange={(e) => setCity(e.target.value)} aria-label={s('pack.sos.er.where')}>
            {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          {!denied && <button type="button" className="sos-cta sos-cta--sm sos-cta--ghost" style={{ width: 'auto' }} onClick={locate}>{s('pack.sos.er.gps')}</button>}
        </div>
      )}
      {filter !== 'home' && on[0] && on[0].km > FAR_KM && <p className="vet-warn">{s('pack.sos.er.far', { km: on[0].km })}</p>}
      {filter === 'home' && rows.length === 0 && <p className="vet-warn">{s('pack.sos.er.noHome')}</p>}
      {on.map((r, i) => row(r, i === 0))}
      {off.length > 0 && <h2 className="vet-sec">{s('pack.sos.er.closed')}</h2>}
      {off.map((r) => row(r, false))}
      <p className="vet-src">{s('pack.sos.er.source')}</p>
    </SosTaskShell>
  );
}
