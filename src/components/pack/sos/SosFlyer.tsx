// LETÁK „STRATIL SA“ — A4 (210:297), všetko v `cqw` kontajnera, takže vyzerá rovnako v náhľade, v exporte
// 2480×3508 aj na verejnej stránke. Nákres: `plany/nakres-launch-2026-11-01/sos/` (varianta D, hotový obraz `letak-d.png`).
//
//  · červený pás hore (STRATIL SA + Hľadáme MENO) · 2×2 štvorce: fotka | O ňom / Naposledy videný | mapa
//  · QR presne v strede mriežky, prekrýva roh fotky aj mapy · tmavý pás dole: telefón, ďakovný riadok, URL
//  · Vzhľady: PAPYRUS (predvolený) a NA TLAČ (biele pozadie, čierne pásy, fotka v odtieňoch sivej). Starý plagát sa nestavia.
//
// 🔴 MAPA = OBRÁZOK. Najprv statická mapa Mapy.com (cez `MAPY_BASE`), stiahnutá `fetch` → blob, aby ju export
//    do PNG nezašpinil (CORS). Keď padne, nikdy prázdne miesto: nakreslená záložná mapka s bodom a kruhom.
// 🔴 Export čaká na `data-ready="1"` (fotka aj mapa sú dohrané) — `sosFlyerExport.ts`.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MAPY_API_KEY, MAPY_BASE } from '@/lib/env';
import { withTransform } from '@/services/cloudinaryService';
import { lostUrl, type SosFlyer as FlyerFields } from '@/lib/sos';
import breedsData from '@/data/breeds.json';
import { RoundQR } from '@/components/pack/dogs/RoundQR';
import { PACK_THEME as T } from '@/components/pack/packTheme';
import { colorWord, useBreedLabel, useSosT, useWhen, type SosT } from './sosShared';
import type { SosKey } from './sosTexts';

export type FlyerLook = 'papyrus' | 'print';

export interface FlyerData {
  slug: string;
  name: string;
  dogGender?: string | null;
  photo: string | null;
  breed: string | null;
  color: string | null;
  place: string;
  lastSeen: string;
  lat: number;
  lng: number;
  phone: string;
  flyer: FlyerFields;
}

/** Silueta patróna z plemena (`breeds.json` → `public/patrons/<kat>-<nn>.svg`); kríženec / neznáme plemeno = null. */
const patronFor = (breed: string | null): string | null => {
  const first = (breed ?? '').split(',')[0].trim().toLowerCase();
  if (!first) return null;
  const hit = (breedsData as { breeds: Array<{ en: string; patron?: string }> }).breeds.find((b) => b.en.trim().toLowerCase() === first);
  return hit?.patron ? `/patrons/${hit.patron}.svg` : null;
};

export const MAP_ZOOM = 15;
const MAP_PX = 600;

/** Metrov na pixel pri danom zoome a šírke (Web Mercator, 256 px dlaždica). */
const metersPerPx = (lat: number, zoom: number) => 156543.03392 * Math.cos((lat * Math.PI) / 180) / 2 ** zoom;

/** Najbližší z ôsmich smerov (0 = sever, v smere hodín) — slovo do vety „Bežal na …“. */
export const nearestDir = (deg: number) => ((Math.round((((deg % 360) + 360) % 360) / 45) * 45) % 360) as 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;

/** Stiahne obrázok ako blob (CORS), vráti `blob:` URL; pri zlyhaní `null` a `settled = true`. */
function useBlobUrl(src: string | null): { url: string | null; settled: boolean } {
  const [st, setSt] = useState<{ url: string | null; settled: boolean }>({ url: null, settled: !src });
  useEffect(() => {
    if (!src) { setSt({ url: null, settled: true }); return; }
    let alive = true;
    let made: string | null = null;
    setSt({ url: null, settled: false });
    fetch(src, { mode: 'cors' })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
      .then((b) => { made = URL.createObjectURL(b); if (alive) setSt({ url: made, settled: true }); })
      .catch(() => { if (alive) setSt({ url: null, settled: true }); });
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [src]);
  return st;
}

/** Záložná mapka — nakreslená, nikdy nie prázdne miesto. */
function FallbackMap() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="100" height="100" fill="#E7DCC3" />
      <path d="M0 72 C22 52 48 86 100 42" stroke="#8FB8D8" strokeWidth="6" fill="none" />
      <path d="M0 18 L100 80" stroke="#fff" strokeWidth="3.4" opacity=".85" />
      <path d="M34 0 L46 100" stroke="#fff" strokeWidth="2.4" opacity=".85" />
    </svg>
  );
}

function FlyerMap({ lat, lng, deg, onSettled }: { lat: number; lng: number; deg: number | null | undefined; onSettled: (ok: boolean) => void }) {
  const src = `${MAPY_BASE}/v1/static/map?lon=${lng}&lat=${lat}&zoom=${MAP_ZOOM}&width=${MAP_PX}&height=${MAP_PX}&mapset=outdoor&apikey=${MAPY_API_KEY}`;
  const { url, settled } = useBlobUrl(src);
  useEffect(() => { if (settled) onSettled(!!url); }, [settled, url, onSettled]);
  // 500 m ako skutočný polomer na mape, v jednotkách viewBoxu 100.
  const r = Math.min(40, (500 / metersPerPx(lat, MAP_ZOOM) / MAP_PX) * 100);
  const arrow = typeof deg === 'number' ? (
    <g transform={`rotate(${deg} 50 50)`}>
      <path d="M50 50 L50 11" stroke={T.sosRed} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M43 19 L50 6 L57 19 Z" fill={T.sosRed} />
    </g>
  ) : null;
  return (
    <>
      {url ? <img src={url} alt="" /> : settled ? <FallbackMap /> : null}
      <svg viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="rgba(200,32,47,.22)" stroke={T.sosRed} strokeWidth="1.2" />
        {arrow}
        <circle cx="50" cy="50" r="2.2" fill={T.sosRed} />
      </svg>
    </>
  );
}

/** Predvolené texty podľa jazyka majiteľa; `undefined` = nepísal sa (prázdny reťazec = vedome prázdne). */
export function flyerDefaults(s: SosT) {
  return {
    headline: s('pack.sos.fl.defHeadline'),
    about: s('pack.sos.fl.defAbout'),
    reward: s('pack.sos.fl.defReward'),
    thanks: s('pack.sos.fl.defThanks'),
  };
}

const CSS = `
.sfl-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:${T.tileBg};}
.sfl-fb img{width:62%;height:auto;max-height:80%;object-fit:contain;display:block;opacity:.85;}
.sfl{container-type:inline-size;position:relative;width:100%;aspect-ratio:210/297;overflow:hidden;color:#2A1608;text-align:left;box-sizing:border-box;}
.sfl--papyrus{background:radial-gradient(ellipse at 50% 40%,#F7E9C8 0%,#EBD29D 70%,#D6B373 100%);}
.sfl--print{background:#fff;color:#000;}
.sfl-in{position:absolute;inset:0;display:flex;flex-direction:column;}
.sfl-top{background:linear-gradient(180deg,#C8202F,#9E1522);color:#fff;padding:3.6cqw 4cqw 3cqw;text-align:center;flex:none;}
.sfl--print .sfl-top{background:#000;}
.sfl-h{font:800 12.6cqw/1 'Cinzel',serif;letter-spacing:.02em;margin:0;text-transform:uppercase;white-space:nowrap;} /* písmo: nadpis */
.sfl-sn{font:700 4cqw/1.1 'Cinzel',serif;letter-spacing:.14em;margin-top:1cqw;white-space:nowrap;} /* písmo: nadpis */
.sfl-sn b{font:900 5.6cqw 'Cinzel Decorative','Cinzel',serif;letter-spacing:.02em;}
.sfl-grid{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:2.6cqw;margin:2.6cqw 8cqw 0;flex:none;}
.sfl-cell{aspect-ratio:1/1;min-width:0;overflow:hidden;position:relative;}
.sfl-pic{border:.8cqw solid currentColor;border-radius:4.5cqw;background:#E8D7AE;}
.sfl-pic > img,.sfl-pic > svg{position:absolute;inset:0;width:100%;height:100%;display:block;}
.sfl-pic > img{object-fit:cover;}
.sfl--print .sfl-photo{filter:grayscale(1) contrast(1.1);}
.sfl-txt{display:flex;flex-direction:column;justify-content:flex-start;gap:1.4cqw;}
.sfl-txt--last{justify-content:flex-end;padding-top:9cqw;}
.sfl-lbl{font:600 2.2cqw/1 'Space Grotesk',sans-serif;letter-spacing:.22em;text-transform:uppercase;opacity:.75;}
.sfl-big{font:700 3.1cqw/1.18 'Space Grotesk',sans-serif;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.sfl-ab{font:400 2.7cqw/1.28 'Space Grotesk',sans-serif;margin:0;white-space:pre-wrap;overflow-wrap:anywhere;}
.sfl-rew{font:800 5.4cqw/1.3 'Cinzel',serif;letter-spacing:.02em;color:#C8202F;margin-top:.4cqw;} /* písmo: nadpis */
.sfl--print .sfl-rew{color:#000;}
.sfl-qr{position:absolute;left:50%;top:50%;width:17cqw;height:17cqw;transform:translate(-50%,-50%);background:#fff;padding:1.3cqw;border:.7cqw solid #1A1006;border-radius:2.6cqw;filter:drop-shadow(0 .6cqw 1cqw rgba(0,0,0,.3));z-index:2;box-sizing:border-box;}
.sfl-qr svg{width:100%;height:100%;display:block;}
.sfl-bot{margin-top:auto;background:#1A1006;color:#F4E7C8;padding:2.6cqw 5cqw 2.4cqw;text-align:center;flex:none;}
.sfl--print .sfl-bot{background:#000;color:#fff;}
.sfl-tel{font:800 8.2cqw/1.05 'Space Grotesk',sans-serif;margin:0;letter-spacing:0;white-space:nowrap;}
.sfl-thx{font:500 2.7cqw/1.2 'Space Grotesk',sans-serif;margin-top:.5cqw;}
.sfl-url{font:500 2.1cqw/1 'Space Grotesk',sans-serif;opacity:.75;margin-top:.8cqw;}
`;

export function SosFlyer({ data, look = 'papyrus', onReady }: { data: FlyerData; look?: FlyerLook; onReady?: () => void }) {
  const s = useSosT(data.dogGender);
  const when = useWhen();
  const breedLabel = useBreedLabel();
  // PLNÉ rozlíšenie uloženej fotky (výrez 1200 px, bez zmenšenia) — leták sa tlačí na A4 pri 300 dpi.
  const photoSrc = useMemo(() => (data.photo ? withTransform(data.photo, 'q_auto:best') : null), [data.photo]);
  const photo = useBlobUrl(photoSrc);
  // Pes bez fotky (alebo fotka nedoletela): náhradná kresba — silueta patróna z plemena, inak pečať. Nikdy prázdny štvorec.
  const noPhoto = photo.settled && !photo.url;
  const fb = useBlobUrl(noPhoto ? (patronFor(data.breed) ?? '/images/peciat-dogypt.webp') : null);
  const [mapSettled, setMapSettled] = useState(false);
  const onMapSettled = useCallback(() => setMapSettled(true), []);
  const def = flyerDefaults(s);
  const f = data.flyer;
  const headline = f.headline ?? def.headline;
  const about = f.about ?? def.about;
  const reward = f.reward ?? def.reward;
  const thanks = f.thanks ?? def.thanks;
  const deg = typeof f.direction_deg === 'number' ? f.direction_deg : null;
  const ran = deg === null ? null : s('pack.sos.fl.ran', { dir: s(`pack.sos.fl.dir.${nearestDir(deg)}` as SosKey) });
  const breedLine = [breedLabel(data.breed), colorWord(data.color, s)].filter(Boolean).join(', ');
  const url = lostUrl(data.slug);
  const ready = photo.settled && fb.settled && mapSettled;
  // dlhý nadpis / meno / odmena sa zmenšia, aby sa zmestili (nadpis max 28, odmena max 40 znakov)
  const hSize = Math.min(12.6, 120 / Math.max(headline.length, 1));
  const nSize = Math.min(5.6, 56 / Math.max(data.name.length, 1));
  const rSize = Math.min(5.4, 76 / Math.max(reward.length, 1));
  useEffect(() => { if (ready) onReady?.(); }, [ready, onReady]);

  return (
    <div className={`sfl sfl--${look}`} data-ready={ready ? '1' : '0'}>
      <style>{CSS}</style>
      <div className="sfl-in">
        <div className="sfl-top">
          <div className="sfl-h" style={{ fontSize: `${hSize}cqw` }}>{headline}</div>
          <div className="sfl-sn">{s('pack.sos.fl.searching')} <b style={{ fontSize: `${nSize}cqw` }}>{data.name}</b></div>
        </div>
        <div className="sfl-grid">
          <div className="sfl-cell sfl-pic">
            {photo.url ? <img className="sfl-photo" src={photo.url} alt="" />
              : noPhoto && fb.url ? <div className="sfl-fb"><img src={fb.url} alt="" /></div> : null}
          </div>
          <div className="sfl-cell sfl-txt">
            <div className="sfl-lbl">{s('pack.sos.fl.about2')}</div>
            {breedLine && <div className="sfl-big">{breedLine}</div>}
            {about && <p className="sfl-ab">{about}</p>}
          </div>
          <div className="sfl-cell sfl-txt sfl-txt--last">
            <div className="sfl-lbl">{s('pack.sos.fl.lastSeen')}</div>
            <div className="sfl-big">{data.place}</div>
            <p className="sfl-ab">{when(data.lastSeen)}{ran && <><br />{ran}</>}</p>
            {reward && <div className="sfl-rew" style={{ fontSize: `${rSize}cqw` }}>{reward}</div>}
          </div>
          <div className="sfl-cell sfl-pic" role="img" aria-label={s('pack.sos.fl.mapAlt')}>
            <FlyerMap lat={data.lat} lng={data.lng} deg={deg} onSettled={onMapSettled} />
          </div>
          <div className="sfl-qr"><RoundQR value={url} ink={look === 'print' ? '#000' : '#1A1006'} eye={look === 'print' ? '#000' : '#1A1006'} /></div>
        </div>
        <div className="sfl-bot">
          <p className="sfl-tel">{data.phone}</p>
          {thanks && <div className="sfl-thx">{thanks}</div>}
          <div className="sfl-url">{url.replace(/^https?:\/\//, '')}</div>
        </div>
      </div>
    </div>
  );
}
