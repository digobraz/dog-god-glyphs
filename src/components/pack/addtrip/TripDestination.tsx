// KROK 1 PLÁNU — „WHERE ARE YOU HEADING?" (kánon: plany/zadanie-eventy-2026-08-06.md §2.2b).
//
// Prečo existuje: plán doteraz nemal ANI JEDNU ochranu proti duplicite a človek nemal ako zistiť,
// že kopec, kam sa chystá, už v katalógu je (Matej pri prvom ostrom teste: „ja chcem isť na choč —
// neviem že je už medzi hotovými"). Geometrická `findDuplicate()` to nespraví — vracia `null` pre
// všetko okrem `kind === 'route'`, kým plán má zámerne voľnejší default (area/point).
//
// Prečo NIE našeptávač pod poľom Name: Name je kreatívne pole (rotujúci placeholder pozýva na
// „Sobotná túra s Dunčom"), match katalógu proti voľnému textu je lotéria a šum sa ľudia naučia
// ignorovať. Preto samostatný krok, cez ktorý sa nedá neprejsť.
//
// Mapa: kreslíme IMPERATÍVNE do hlavnej mapy PackMap cez `mapRef` — rovnaký vzor a rovnaké tokeny
// ako GeometryPicker (žiadny react-leaflet). Zoznam nesie stav, ktorý sa na pine ukázať nedá
// (`✓ walked` / `🗓️ in your plans`); mapa nesie priestor a okolie.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { searchDestinations, nearestTrails, describeTrails, type DestinationHit } from './tripSearch';
import { BackButton } from '@/components/pack/BackButton';

const GOLD = '#C99A3F';
/** Meno psa/výletu = Cinzel Decorative je rezervované pre psov; trip nesie Cinzel (brand v3.2). */
const TRAIL_LINE = { light: '#B98CE8', core: '#F2E9FF' };

export type TripDestinationProps = {
  allTrails: HeroTrail[];
  mapRef: MutableRefObject<LeafletMap | null>;
  /** Priradenie ku existujúcemu tripu — kreslenie geometrie sa preskočí. */
  onPick: (trail: HeroTrail) => void;
  /** Nový trip. `query` predvyplní Name, nech sa netypuje dvakrát. */
  onCreateNew: (query: string) => void;
  onClose: () => void;
};

export function TripDestination({ allTrails, mapRef, onPick, onCreateNew, onClose }: TripDestinationProps) {
  const [query, setQuery] = useState('');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const hits = useMemo(() => searchDestinations(query, allTrails), [query, allTrails]);

  // ── stav PRED písaním (2026-08-06) ──────────────────────────────────────────────────────
  // Krok dovtedy do napísania 2 znakov nerenderoval NIČ a jediná akcia („create a new trip")
  // sedela pribitá na spodku panela — Matej po prvom teste: „vyzerá to tak prázdno resp to
  // tlačítko niekde ind je schované". Prázdne pole teraz ukáže, čo je pod aktuálnym výrezom
  // mapy: presne tá otázka, na ktorú tento krok existuje (je to tu už?).
  // `epoch` sa hýbe s mapou — bez neho by zoznam ostal na výreze z chvíle otvorenia.
  const [mapEpoch, setMapEpoch] = useState(0);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bump = () => setMapEpoch((n) => n + 1);
    map.on('moveend', bump);
    return () => { map.off('moveend', bump); };
  }, [mapRef]);

  const nearby = useMemo(() => {
    if (query.trim().length >= 2) return [];
    const c = mapRef.current?.getCenter();
    if (!c) return [];
    const near = nearestTrails([c.lat, c.lng], allTrails, 4);
    const described = describeTrails(near.map((n) => n.trail));
    return described.map((h, i) => ({ hit: h, km: near[i].km }));
    // mapEpoch je zámerná závislosť — getCenter() sa mimo renderu nemení
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, allTrails, mapRef, mapEpoch]);

  // Prázdny výsledok nesmie vyzerať ako rozbitá appka — inak človek skúša ďalšie preklepy
  // a založí ten istý trip trikrát. Ukotvíme ho v strede aktuálneho výrezu mapy.
  const nearest = useMemo(() => {
    if (query.trim().length < 2 || hits.length > 0) return [];
    const c = mapRef.current?.getCenter();
    return c ? nearestTrails([c.lat, c.lng], allTrails, 3) : [];
  }, [query, hits.length, allTrails, mapRef]);

  // ── vrstvy na mape (imperatívne, rovnaký cleanup vzor ako GeometryPicker) ─────────────
  const layersRef = useRef<L.Layer[]>([]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];
    const add = (l: L.Layer) => { l.addTo(map); layersRef.current.push(l); };

    const drawn = hits.length > 0 ? hits : nearby.map((n) => n.hit);
    drawn.forEach((h) => {
      if (!h.trail.path?.length) return;
      const on = focusedId === h.trail.id;
      const line = L.polyline(h.trail.path, {
        color: on ? TRAIL_LINE.core : TRAIL_LINE.light,
        weight: on ? 5 : 3,
        opacity: on ? 1 : 0.65,
        lineCap: 'round',
        interactive: true,
      });
      // Ťuk na trasu = ťuk na kartu. Sú to tie isté objekty, nie dva zoznamy.
      line.on('click', (e) => { L.DomEvent.stopPropagation(e); setFocusedId(h.trail.id); });
      line.bindTooltip(h.trail.name, { direction: 'top', opacity: 0.9 });
      add(line);
    });

    return () => {
      layersRef.current.forEach((l) => map.removeLayer(l));
      layersRef.current = [];
    };
  }, [hits, nearby, focusedId, mapRef]);

  // Mapa letí za výsledkami — bez toho by človek videl zvýraznené trasy mimo výrezu, teda nič.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || hits.length === 0) return;
    const pts = hits.flatMap((h) => h.trail.path ?? []);
    if (pts.length === 0) return;
    map.flyToBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 13, duration: 0.6 });
  }, [hits, mapRef]);

  const typed = query.trim().length >= 2;

  return (
    <div className="atd">
      <style>{DEST_CSS}</style>
      <div className="atd-head">
        <BackButton tone="dark" onClick={onClose} label="Back" />
        <div className="atd-title">Plan a trip</div>
      </div>

      <div className="atd-body">
        <div className="atd-field">
          <label htmlFor="atd-q">Where are you heading?</label>
          <input
            id="atd-q"
            ref={inputRef}
            className="atd-input"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setFocusedId(null); }}
            placeholder="Mountain, place or region…"
            autoComplete="off"
          />
          <p className="atd-hint">Check if it&apos;s already here — then you don&apos;t have to draw anything.</p>
        </div>

        {/* Prázdny dopyt: najprv AKCIA (jediná zmyslupná v tej chvíli), potom okolie. Keď človek
            začne písať, tlačidlo sa vráti dole pod výsledky — tam už súťaží s nájdenými trasami
            a nesmie byť prvé. */}
        {!typed && <CreateNewButton onClick={() => onCreateNew('')} />}

        {!typed && nearby.length > 0 && (
          <div>
            <span className="atd-eyebrow">In view on the map</span>
            <ul className="atd-list">
              {nearby.map(({ hit, km }) => (
                <DestinationCard
                  key={hit.trail.id}
                  hit={hit}
                  distanceKm={km}
                  focused={focusedId === hit.trail.id}
                  onFocus={() => setFocusedId(hit.trail.id)}
                  onPick={() => onPick(hit.trail)}
                />
              ))}
            </ul>
          </div>
        )}

        {typed && hits.length > 0 && (
          <ul className="atd-list">
            {hits.map((h) => (
              <DestinationCard
                key={h.trail.id}
                hit={h}
                focused={focusedId === h.trail.id}
                onFocus={() => setFocusedId(h.trail.id)}
                onPick={() => onPick(h.trail)}
              />
            ))}
          </ul>
        )}

        {typed && hits.length === 0 && (
          <div className="atd-empty">
            <p className="atd-empty-lead">Nothing here yet — you&apos;d be the first.</p>
            {nearest.length > 0 && (
              <p className="atd-empty-near">
                Closest trips: {nearest.map((n) => `${n.trail.name} (${Math.round(n.km)} km)`).join(' · ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pri hľadaní ostáva dole — kto chce nový trip, nesmie ho hľadať, ale ani nesmie
          prebiť výsledky, ktoré si vypýtal. Pri prázdnom poli je hore v tele panela. */}
      {typed && (
        <div className="atd-foot">
          <CreateNewButton onClick={() => onCreateNew(query.trim())} />
        </div>
      )}
    </div>
  );
}

function CreateNewButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="atd-new" onClick={onClick}>
      <span className="atd-new-plus">＋</span>
      <span>
        <b>Somewhere else — create a new trip</b>
        <em>You&apos;ll draw the route on the map</em>
      </span>
    </button>
  );
}

function DestinationCard({
  hit, focused, onFocus, onPick, distanceKm,
}: { hit: DestinationHit; focused: boolean; onFocus: () => void; onPick: () => void; distanceKm?: number }) {
  const { trail, walked, planned, source } = hit;
  const photo = trail.photos?.[0];
  return (
    <li>
      <button
        type="button"
        className={`atd-card${focused ? ' on' : ''}`}
        onMouseEnter={onFocus}
        onFocus={onFocus}
        onClick={onPick}
      >
        <span
          className="atd-card-photo"
          style={photo ? { backgroundImage: `url('${photo}')` } : undefined}
          aria-hidden="true"
        />
        <span className="atd-card-main">
          <span className="atd-card-name">{trail.name}</span>
          <span className="atd-card-meta">
            {trail.region}
            {trail.km ? ` · ${trail.km} km` : ''}
            {typeof trail.ascentM === 'number' ? ` · ↑${trail.ascentM} m` : ''}
            {typeof distanceKm === 'number' ? ` · ${Math.round(distanceKm)} km away` : ''}
          </span>
          {(walked || planned || source === 'member') && (
            <span className="atd-badges">
              {walked && <span className="atd-badge walked">✓ You&apos;ve walked this</span>}
              {planned && <span className="atd-badge planned">🗓️ Already in your plans</span>}
              {source === 'member' && <span className="atd-badge member">Added by a member</span>}
            </span>
          )}
        </span>
        <span className="atd-card-go" aria-hidden="true">›</span>
      </button>
    </li>
  );
}

const DEST_CSS = `
.atd{display:flex;flex-direction:column;height:100%;min-height:0;}
.atd-head{display:flex;align-items:center;gap:10px;padding:16px 20px 10px;flex-shrink:0;}
.atd-title{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${T.onDark};}
.atd-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:4px 20px 12px;display:flex;flex-direction:column;gap:14px;}
.atd-field label{display:block;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:6px;}
.atd-input{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:9px;padding:11px 12px;color:${T.onDark};font-family:${FONT_UI};font-size:13.5px;outline:0;}
.atd-input:focus{border-color:${GOLD};}
.atd-input::placeholder{color:${T.onDarkDim};}
.atd-hint{margin:7px 0 0;font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};line-height:1.45;}
.atd-eyebrow{display:block;margin-bottom:7px;font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};}
.atd-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
.atd-card{width:100%;display:flex;align-items:center;gap:11px;text-align:left;padding:9px 11px 9px 9px;border-radius:11px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};cursor:pointer;}
.atd-card:hover,.atd-card.on{background:rgba(201,154,63,0.13);border-color:${GOLD};}
.atd-card-photo{flex:0 0 auto;width:52px;height:52px;border-radius:8px;background:linear-gradient(135deg,#1c2b1a,#0e1a0d);background-size:cover;background-position:center;border:1px solid ${T.onDarkBorder};}
.atd-card-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px;}
.atd-card-name{font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;letter-spacing:.02em;color:${T.onDark};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.atd-card-meta{font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};}
.atd-badges{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px;}
.atd-badge{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;padding:3px 6px;border-radius:5px;border:1px solid transparent;}
.atd-badge.walked{color:#8FD694;background:rgba(143,214,148,0.12);border-color:rgba(143,214,148,0.35);}
.atd-badge.planned{color:#F5C73D;background:rgba(245,199,61,0.12);border-color:rgba(245,199,61,0.35);}
.atd-badge.member{color:${T.onDarkDim};background:rgba(245,240,228,0.05);border-color:${T.onDarkBorder};}
.atd-card-go{flex:0 0 auto;color:${T.onDarkDim};font-size:17px;line-height:1;}
.atd-empty{padding:14px 12px;border-radius:11px;background:rgba(245,240,228,0.03);border:1px dashed ${T.onDarkBorder};}
.atd-empty-lead{margin:0;font-family:${FONT_UI};font-size:12.5px;color:${T.onDark};}
.atd-empty-near{margin:6px 0 0;font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};line-height:1.45;}
.atd-foot{flex-shrink:0;margin:0 20px 20px;}
.atd-body > .atd-new{flex-shrink:0;}
.atd-new{width:100%;display:flex;align-items:center;gap:11px;text-align:left;padding:11px 12px;border-radius:11px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};color:${T.onDark};cursor:pointer;}
.atd-new:hover{border-color:${GOLD};background:rgba(201,154,63,0.10);}
.atd-new-plus{flex:0 0 auto;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(201,154,63,0.16);border:1px solid ${GOLD};color:${GOLD};font-size:15px;line-height:1;}
.atd-new b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;}
.atd-new em{display:block;margin-top:2px;font-family:${FONT_UI};font-style:normal;font-size:10.5px;color:${T.onDarkDim};}
`;
