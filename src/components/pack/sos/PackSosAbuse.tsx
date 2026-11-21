// `/pack/sos/nebezpecenstvo/tyranie` — NAHLÁSIŤ TÝRANIE (Matej 20. 11. 2026, upratané 21. 11. 2026: jedno lapisové CTA).
// Postup: lead → jeden rad čísel na zavolanie (158 · 159/156 · 112) → „Označ miesto“ (jediné lapisové CTA) → varovanie → „Pomôžu ti“ (SK).
// Čísla overené 20. 11. 2026: polícia 158 (SK aj CZ), tiesňová 112, mestská polícia SK 159 / CZ 156.
// Zdroj postupu: zvieraciombudsman.sk/mam-podnet-co-robit (Matej 21. 11. 2026). Podnet úradu ide VŽDY spolu s miestom (`/tyranie/miesto`).
// Krajina sa NEVYBERÁ: z polohy (ak je povolená, timeout 4 s, rgeocode ako `PackDangerReport`), kým nie je, podľa jazyka.
// Texty sú v `danger/txt/reportTexts.ts` (kľúče pack.sos.danger.abuse.*). Čísla sú dáta podľa krajiny: SK, CZ, inde len 112.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PACK_THEME as T, PACK_SPACE as S, PACK_TEXT } from '@/components/pack/packTheme';
import { useLang } from '@/i18n/LanguageContext';
import { MAPY_API_KEY, MAPY_BASE } from '@/lib/env';
import { countryISO3 } from '@/lib/countryGeo';
import { SysIcon } from '@/components/pack/SysIcon';
import { SosCard, useBack, useSosT } from './sosShared';
import { SosTaskShell } from './SosTaskShell';
import type { SosKey } from './sosTexts';

type Region = 'SK' | 'CZ' | 'OTHER';
type Call = { tel: string; label: SosKey; red?: boolean };
const CALLS: Record<Region, Call[]> = {
  SK: [
    { tel: '158', label: 'pack.sos.danger.abuse.police', red: true },
    { tel: '159', label: 'pack.sos.danger.abuse.municipal' },
    { tel: '112', label: 'pack.sos.danger.abuse.emergency' },
  ],
  CZ: [
    { tel: '158', label: 'pack.sos.danger.abuse.police', red: true },
    { tel: '156', label: 'pack.sos.danger.abuse.municipal' },
    { tel: '112', label: 'pack.sos.danger.abuse.emergency' },
  ],
  OTHER: [{ tel: '112', label: 'pack.sos.danger.abuse.emergency', red: true }],
};

// Krajina z polohy: len keď je povolenie už udelené (nič sa nevypýta); inak ostáva odhad podľa jazyka.
function useRegion(lang: string): Region {
  const byLang: Region = lang === 'cs' ? 'CZ' : lang === 'sk' ? 'SK' : 'OTHER';
  const [geoRegion, setGeoRegion] = useState<Region | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const perm = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
        if (perm?.state !== 'granted' || !navigator.geolocation) return;
        const pos = await new Promise<GeolocationPosition>((ok, no) => navigator.geolocation.getCurrentPosition(ok, no, { timeout: 4000 }));
        const r = await fetch(`${MAPY_BASE}/v1/rgeocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&lang=${lang}&apikey=${MAPY_API_KEY}`);
        if (!r.ok) return;
        const d = await r.json();
        const iso = d?.items?.[0]?.regionalStructure?.find((x: { type?: string }) => x.type === 'regional.country')?.isoCode;
        if (!iso || !alive) return;
        const c = countryISO3(iso);
        setGeoRegion(c === 'SVK' ? 'SK' : c === 'CZE' ? 'CZ' : 'OTHER');
      } catch { /* bez polohy ostáva jazyk */ }
    })();
    return () => { alive = false; };
  }, [lang]);
  return geoRegion ?? byLang;
}

const CSS = `
.abu-head{display:flex;align-items:center;gap:${S.md}px;}
.abu-lead{margin:0;font-size:${PACK_TEXT.lead}px;font-weight:500;line-height:1.4;color:${T.inkStrong};}
.abu-calls{display:grid;grid-template-columns:repeat(3,1fr);gap:${S.sm}px;}
.abu-calls.one{grid-template-columns:1fr;}   /* mimo SK a CZ len 112: cez celú šírku */
.abu-calls .sos-cta{flex-direction:column;gap:${S.xs}px;min-height:72px;padding:${S.sm}px;text-decoration:none;}
.abu-calls .sos-cta b{font-size:${PACK_TEXT.h2}px;line-height:1;}
.abu-calls .sos-cta span{font-size:${PACK_TEXT.label}px;line-height:1.2;text-align:center;}
.abu-never{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.45;font-weight:500;color:${T.sosRedDark};}
.abu-now{display:flex;flex-direction:column;gap:${S.sm}px;}
.abu-help{display:flex;flex-direction:column;gap:${S.sm}px;}
.abu-help .sos-chips a{text-decoration:none;}
`;

export default function PackSosAbuse() {
  const s = useSosT();
  const { lang } = useLang();
  const navigate = useNavigate();
  const back = useBack('/pack/sos/nebezpecenstvo');
  const region = useRegion(lang);
  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <div className="abu-head">
        <SysIcon name="sos-tyranie" size={40} />
        <h1 className="sos-h2">{s('pack.sos.danger.abuse.title')}</h1>
      </div>
      <p className="abu-lead">{s('pack.sos.danger.abuse.lead')}</p>
      <div className="abu-now">
        <p className="sos-eyebrow">{s('pack.sos.danger.abuse.nowEyebrow')}</p>
        <div className={`abu-calls${CALLS[region].length === 1 ? ' one' : ''}`}>
          {CALLS[region].map((c) => (
            <a key={c.tel} className={`sos-cta${c.red ? ' sos-cta--red' : ' sos-cta--ghost'}`} href={`tel:${c.tel}`}>
              <b>{c.tel}</b><span>{s(c.label)}</span>
            </a>
          ))}
        </div>
        {region !== 'OTHER' && <p className="sos-small">{s('pack.sos.danger.abuse.crime')}</p>}
      </div>
      <SosCard>
        <p className="sos-p"><b>{s('pack.sos.danger.abuse.markLead')}</b></p>
        <button type="button" className="sos-cta" onClick={() => navigate('/pack/sos/nebezpecenstvo/tyranie/miesto')}>
          <SysIcon name="sos-signal" size={28} />{s('pack.sos.danger.abuse.mark')}
        </button>
      </SosCard>
      <p className="abu-never">{s('pack.sos.danger.abuse.never')}</p>
      {lang === 'sk' && (
        <div className="abu-help">
          <p className="sos-eyebrow">{s('pack.sos.danger.abuse.help')}</p>
          <div className="sos-chips">
            <a className="sos-pill" href="tel:+421917662030">{s('pack.sos.danger.abuse.linka')}</a>
            <a className="sos-pill" href="tel:+421907332835">{s('pack.sos.danger.abuse.sosLinka')}</a>
            <a className="sos-pill" href="tel:+421948022121">{s('pack.sos.danger.abuse.ombudsman')}</a>
          </div>
        </div>
      )}
    </SosTaskShell>
  );
}
