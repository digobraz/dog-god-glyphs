// PLAGÁT „NEBEZPEČENSTVO“ — story 9:16 (1080×1920) a príspevok 4:5 (1080×1350). Všetko v `cqw`, takže vyzerá rovnako v náhľade
// aj v exporte (`nodeToPng` v `sosFlyerExport.ts`). Vzor: `sos/SosFlyer.tsx` (statická mapa Mapy.com ako blob, RoundQR).
// Zdieľa sa s verejnou stránkou `/danger/:slug` (`DangerMap`).
//
// 🔴 TÝRANIE NESIE LEN OBEC + OKRUH: žiadna fotka, žiadna adresa; stred mapy zaokrúhlený na 2 desatinné (~1 km) a okruh ≥ 500 m
//    (Matej, rozhodnutie 7 zo 20. 11. 2026). To vynucuje `posterView`, nie volajúci.
// 🔴 MAPA = OBRÁZOK stiahnutý `fetch` → blob (CORS), inak by export do PNG padol; pri zlyhaní nakreslená záložná mapka.
// 🔴 Export čaká na `data-ready="1"` (mapa aj fotka dohrané).
import { useCallback, useEffect, useState } from 'react';
import { MAPY_API_KEY, MAPY_BASE } from '@/lib/env';
import { withTransform } from '@/services/cloudinaryService';
import { dangerUrl, type DangerKind } from '@/lib/danger';
import { RoundQR } from '@/components/pack/dogs/RoundQR';
import { PACK_THEME as T } from '@/components/pack/packTheme';
import { useSosT } from '../sosShared';
import type { SosKey } from '../sosTexts';

export type PosterFormat = 'story' | 'post';
export const POSTER_SIZE: Record<PosterFormat, { w: number; h: number }> = { story: { w: 1080, h: 1920 }, post: { w: 1080, h: 1350 } };

export interface PosterData {
  slug: string;
  kind: DangerKind;
  /** obec (verejná); prázdne = „tejto oblasti“ */
  place: string;
  lat: number;
  lng: number;
  radius_m: number | null;
  what: string[];
  photo: string | null;
}

/** Čo smie plagát ukázať: týranie bez fotky, bod zaokrúhlený, okruh ≥ 500 m. */
export function posterView(d: PosterData) {
  if (d.kind === 'abuse') {
    return { lat: Math.round(d.lat * 100) / 100, lng: Math.round(d.lng * 100) / 100, radius: Math.max(500, d.radius_m ?? 0), photo: null as string | null, what: [] as string[] };
  }
  return { lat: d.lat, lng: d.lng, radius: Math.min(500, Math.max(100, d.radius_m ?? 150)), photo: d.photo, what: d.what };
}

const metersPerPx = (lat: number, zoom: number) => 156543.03392 * Math.cos((lat * Math.PI) / 180) / 2 ** zoom;
const MAP_PX = 600;

/** Stiahne obrázok ako blob (CORS), vráti `blob:` URL; pri zlyhaní `null` a `settled = true`. */
export function useBlobUrl(src: string | null): { url: string | null; settled: boolean } {
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

/** Statická mapa s červeným okruhom (stred = bod, polomer v metroch). Vypĺňa rodiča (čtvorec, `position:relative`). */
export function DangerMap({ lat, lng, radius, onSettled }: { lat: number; lng: number; radius: number; onSettled?: (ok: boolean) => void }) {
  const zoom = radius <= 250 ? 16 : 15;
  const src = `${MAPY_BASE}/v1/static/map?lon=${lng}&lat=${lat}&zoom=${zoom}&width=${MAP_PX}&height=${MAP_PX}&mapset=outdoor&apikey=${MAPY_API_KEY}`;
  const { url, settled } = useBlobUrl(src);
  useEffect(() => { if (settled) onSettled?.(!!url); }, [settled, url, onSettled]);
  const r = Math.min(40, (radius / metersPerPx(lat, zoom) / MAP_PX) * 100);
  return (
    <>
      {url ? <img src={url} alt="" /> : settled ? <FallbackMap /> : null}
      <svg viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="rgba(200,32,47,.22)" stroke={T.sosRed} strokeWidth="1.2" />
        <circle cx="50" cy="50" r="1.6" fill={T.sosRed} />
      </svg>
    </>
  );
}

const CSS = `
.dpo{container-type:inline-size;position:relative;width:100%;overflow:hidden;color:#2A1608;text-align:left;box-sizing:border-box;
  background:radial-gradient(ellipse at 50% 40%,#F7E9C8 0%,#EBD29D 70%,#D6B373 100%);}
.dpo--story{aspect-ratio:9/16;}
.dpo--post{aspect-ratio:4/5;}
.dpo-in{position:absolute;inset:0;display:flex;flex-direction:column;}
.dpo-top{background:linear-gradient(180deg,#C8202F,#9E1522);color:#fff;padding:5cqw 6cqw 4cqw;text-align:center;flex:none;}
.dpo-h{font:800 9.4cqw/1.05 'Cinzel',serif;letter-spacing:.02em;text-transform:uppercase;margin:0;overflow-wrap:anywhere;} /* písmo: nadpis */
.dpo-sub{font:500 3.6cqw/1.3 'Space Grotesk',sans-serif;margin:1.6cqw 0 0;overflow-wrap:anywhere;}
.dpo--post .dpo-top{padding:3.6cqw 6cqw 3cqw;}
.dpo--post .dpo-h{font-size:7.6cqw;}
.dpo--post .dpo-sub{font-size:3.1cqw;margin-top:1cqw;}
.dpo-body{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.6cqw;padding:2.6cqw 8cqw;}
.dpo-pic{position:relative;overflow:hidden;border:.8cqw solid #2A1608;border-radius:4.5cqw;background:#E8D7AE;flex:none;}
.dpo-pic > img,.dpo-pic > svg{position:absolute;inset:0;width:100%;height:100%;display:block;}
.dpo-pic > img{object-fit:cover;}
.dpo-map{width:76cqw;height:76cqw;}
.dpo-map--wide{width:84cqw;height:84cqw;}
.dpo-photo{width:76cqw;height:26cqw;}
.dpo-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:1.4cqw;}
.dpo-chip{font:600 2.7cqw/1 'Space Grotesk',sans-serif;border:.5cqw solid #2A1608;border-radius:999px;padding:1.2cqw 2.4cqw;}
.dpo-rad{font:600 2.8cqw/1.2 'Space Grotesk',sans-serif;letter-spacing:.02em;margin:0;opacity:.8;text-align:center;}
.dpo--post .dpo-body{flex-direction:row;justify-content:space-between;gap:4cqw;padding:2.6cqw 6cqw;}
.dpo--post .dpo-map,.dpo--post .dpo-map--wide{width:56cqw;height:56cqw;}
.dpo--post .dpo-photo{width:100%;height:24cqw;}
.dpo--post .dpo-side{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:2cqw;align-items:stretch;}
.dpo--post .dpo-chips{justify-content:flex-start;}
.dpo--post .dpo-rad{text-align:left;}
.dpo-bot{background:#1A1006;color:#F4E7C8;padding:2.6cqw 6cqw;display:flex;align-items:center;gap:4cqw;flex:none;}
.dpo-qr{width:17cqw;height:17cqw;background:#fff;padding:1.2cqw;border-radius:2.4cqw;box-sizing:border-box;flex:none;}
.dpo-qr svg{width:100%;height:100%;display:block;}
.dpo-bt{min-width:0;}
.dpo-scan{font:600 2.4cqw/1.2 'Space Grotesk',sans-serif;letter-spacing:.14em;text-transform:uppercase;opacity:.8;margin:0;}
.dpo-url{font:700 3.6cqw/1.15 'Space Grotesk',sans-serif;margin:.8cqw 0 0;overflow-wrap:anywhere;}
.dpo-join{font:500 2.7cqw/1.25 'Space Grotesk',sans-serif;margin:.8cqw 0 0;opacity:.9;}
`;

export function DangerPoster({ data, format, onReady }: { data: PosterData; format: PosterFormat; onReady?: () => void }) {
  const s = useSosT();
  const v = posterView(data);
  const place = data.place.trim() || s('pack.sos.danger.poster.place');
  const poison = data.kind === 'poison';
  const photoSrc = v.photo ? withTransform(v.photo, 'q_auto:best,w_900,c_limit') : null;
  const photo = useBlobUrl(photoSrc);
  const [mapSettled, setMapSettled] = useState(false);
  const onMapSettled = useCallback(() => setMapSettled(true), []);
  const ready = photo.settled && mapSettled;
  useEffect(() => { if (ready) onReady?.(); }, [ready, onReady]);
  const url = dangerUrl(data.slug);
  const showPhoto = !!v.photo && (photo.url || !photo.settled);

  const chips = v.what.length > 0 && (
    <div className="dpo-chips">{v.what.map((c) => <span key={c} className="dpo-chip">{s(`pack.sos.danger.poster.chip.${c}` as SosKey)}</span>)}</div>
  );
  const mapBox = (
    <div className={`dpo-pic dpo-map${showPhoto ? '' : ' dpo-map--wide'}`} role="img" aria-label={place}>
      <DangerMap lat={v.lat} lng={v.lng} radius={v.radius} onSettled={onMapSettled} />
    </div>
  );
  const photoBox = showPhoto && <div className="dpo-pic dpo-photo">{photo.url && <img src={photo.url} alt="" />}</div>;
  const rad = <p className="dpo-rad">{s('pack.sos.danger.poster.radius', { m: v.radius })}</p>;

  return (
    <div className={`dpo dpo--${format}`}>
      <style>{CSS}</style>
      <div className="dpo-in" data-ready={ready ? '1' : '0'}>
        <div className="dpo-top">
          <h2 className="dpo-h">{s(poison ? 'pack.sos.danger.poster.headPoison' : 'pack.sos.danger.poster.headAbuse')}</h2>
          <p className="dpo-sub">{s(poison ? 'pack.sos.danger.poster.subPoison' : 'pack.sos.danger.poster.subAbuse', { place })}</p>
        </div>
        {format === 'story' ? (
          <div className="dpo-body">{photoBox}{mapBox}{rad}{chips}</div>
        ) : (
          <div className="dpo-body">{mapBox}<div className="dpo-side">{photoBox}{rad}{chips}</div></div>
        )}
        <div className="dpo-bot">
          <div className="dpo-qr"><RoundQR value={url} ink="#1A1006" eye="#1A1006" /></div>
          <div className="dpo-bt">
            <p className="dpo-scan">{s('pack.sos.danger.poster.scan')}</p>
            <p className="dpo-url">{url.replace(/^https?:\/\//, '')}</p>
            <p className="dpo-join">{s('pack.sos.danger.poster.join')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DangerPoster;
