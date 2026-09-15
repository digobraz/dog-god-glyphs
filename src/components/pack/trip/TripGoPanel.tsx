// VYRAZIŤ — panel s možnosťami, ako sa na výlet dostať.
//
// Matej 2026-09-13: „človek pozrie výlet chce ísť na miesto tak tam bude možnosť vyraziť na
// miesto (parkovisko) a po kliku sa zobrazia možnosti cez akú apku na miesto."
//
// Čo panel NEROBÍ a prečo:
//  · nevyberá za človeka appku — výber navigácie je zvyk, nie rozhodnutie, ktoré vieme uhádnuť;
//  · nepamätá si voľbu — jeden klik navyše je lacnejší než tichý presmerovaný odkaz;
//  · nemá KRÍŽIK (lock CLAUDE.md: PACK_BOX.panel) — von sa ide klikom mimo alebo Esc.
import { useEffect } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME as T, PACK_BOX, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, TRAIL, TRAIL_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { navTarget, navUrl, isAppleDevice, mapyTrailUrl, downloadGpx, type NavApp } from '@/components/pack/tripNav';

const GO_CSS = `
.tgo-veil{position:fixed;inset:0;z-index:1300;background:rgba(3,2,1,0.62);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:flex-end;justify-content:center;padding:0;}
@media(min-width:600px){.tgo-veil{align-items:center;padding:20px;}}
/* ⚠️ SPODNÝ NAV PLÁVA NAD PANELOM. Na telefóne panel sadá na spodnú hranu okna a lišta
   /pack (fixed, z-index nad obsahom) mu prekryla POSLEDNÝ riadok — „Otvoriť v Mapy.com"
   bolo vidieť len spolovice. Rezerva sa NEPÍŠE číslom: nav publikuje svoju nameranú výšku
   do premennej --pack-nav-h (ResizeObserver v PackLayout.tsx) a šírka pillu je premenlivá
   podľa jazyka. Na LIVE nav neexistuje (DEV_FULL), premenná chýba a fallback 0 nechá
   panel dole. */
.tgo-panel{width:100%;max-width:420px;max-height:calc(100dvh - 40px);overflow-y:auto;
  padding:22px 20px calc(24px + var(--pack-nav-h, 0px) + env(safe-area-inset-bottom, 0px));
  background:${PACK_BOX.panel.background};border:${PACK_BOX.panel.border};box-shadow:${PACK_BOX.panel.boxShadow};
  border-radius:16px 16px 0 0;}
/* Nad 600 px panel stojí v strede okna, nie na hrane — nav mu už do cesty nevstupuje. */
@media(min-width:600px){.tgo-panel{border-radius:${PACK_BOX.panel.borderRadius}px;padding-bottom:24px;}}
.tgo-title{font-family:${FONT_TITLE};font-weight:700;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:${T.inkStrong};}
.tgo-where{font-family:${FONT_UI};font-size:12px;line-height:1.5;color:${T.inkWarm};margin-top:5px;}
.tgo-eyebrow{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${T.cardEdge};margin:20px 0 9px;}
.tgo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
/* Riadok, nie dlaždica: každá položka je ODKAZ a ten sa číta zľava doprava.
   Mriežka 2×2 drží panel nízky aj na telefóne, kde stojí nad spodnou hranou. */
.tgo-item{display:flex;align-items:center;gap:9px;padding:12px 11px;border-radius:10px;text-align:left;
  background:${T.tileBg};border:1px solid ${T.border};color:${T.inkStrong};
  font-family:${FONT_UI};font-size:12.5px;font-weight:500;cursor:pointer;text-decoration:none;transition:border-color .15s,background .15s;}
.tgo-item:hover{border-color:${LAPIS.edge};background:${LAPIS.fill};}
.tgo-item--wide{grid-column:1 / -1;}
.tgo-grid--top{margin-top:16px;}
.tgo-ic{font-family:${FONT_EMOJI};font-size:17px;line-height:1;flex-shrink:0;}
.tgo-sub{display:block;font-size:11px;font-weight:400;color:${T.inkWarm};margin-top:2px;}

/* ── DVA CTA, DVE RÔZNE VECI (Matej 2026-09-15) ──────────────────────────────────────────
   „v článku by som ale urobil edit na tlačítko - lebo miešame veci… treba urobiť 2 CTA pod
   výletom parkovisko a mapa… mli by mať každé inú farbu."

   Jedno tlačidlo otváralo panel, v ktorom boli naraz DVE nesúvisiace veci: navigácia autom
   na parkovisko a stopa do mobilu. Po teste v teréne (appka Mapy.com náš GPX otvorí a
   nakreslí) prestala byť tá druhá poznámka pod čiarou a stala sa samostatnou akciou.

   Farby sú OBE z brandu, nová nevzniká:
     · 🅿️ parkovisko = LAPIS — naša akčná farba a zároveň modrá, akou je parkovisko na mape;
     · 🥾 trasa = tripPurple #7A2FBF — fialová znamená VÝLETY v celej appke, a stopa je výlet.
   Mapy.com zelená sa zámerne nepoužila: cudzia značka na našom povrchu by navyše klamala,
   že súbor patrí len im — vezme ho Locus, Garmin aj Organic Maps. Návod to povie slovami.

   ⚠️ ODCHÝLKA OD LOCKU, VEDOMÁ: brand manuál rezervuje plnú farebnú plochu pre JEDINÉ hlavné
   CTA na obrazovke. Tu stoja dve — Matej to tak chcel a dôvod je vecný (dva ciele, nie dva
   dôrazy). Tretia akcia v článku (PRIDAŤ HODNOTENIE) preto plnú farbu STRATILA a nesie len
   zlatý rám: prispievanie nie je odchod na výlet. → .tcm-btn-gold v TripComments.tsx
   ⚠️ V CSS komentári nesmie byť spätný apostrof — ukončí template literál (check:css). */
.tgo-ctas{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;}
@media(max-width:439px){.tgo-ctas{grid-template-columns:1fr;}}
/* Geometria z locknutého .btn-gold — radius 8, nie pilulka. Farbu nesie modifikátor. */
.tgo-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;
  border-radius:8px;font-family:${FONT_TITLE};font-weight:700;font-size:11.5px;letter-spacing:.08em;
  text-transform:uppercase;cursor:pointer;text-align:center;}
.tgo-cta .tgo-ic{font-size:15px;}
.tgo-cta--park{background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.edge};box-shadow:${LAPIS_BTN_SHADOW};}
.tgo-cta--park:hover{background:${LAPIS.gradHover};}
/* Fialová nesie ten istý odliatok ako lapis, aby tlačidlá čítali ako dvojica. */
.tgo-cta--trail{background:${TRAIL.grad};color:${TRAIL.ink};border:1px solid ${TRAIL.edge};box-shadow:${TRAIL_BTN_SHADOW};}
.tgo-cta--trail:hover{background:linear-gradient(180deg,#8C3ED6,#5B2291);}
`;

/** Poradie = čo ľudia na Slovensku reálne otvárajú. Apple pribúda len na Apple zariadení. */
const APPS: Array<{ id: NavApp; emoji: string }> = [
  { id: 'google', emoji: '🗺️' },
  { id: 'waze',   emoji: '🚗' },
  { id: 'mapy',   emoji: '🧭' },
];

/** Ktorú z dvoch vecí panel rieši — `drive` = autom na parkovisko, `route` = stopa do mobilu. */
export type TripGoMode = 'drive' | 'route';

export function TripGoPanel({ trail, onClose, mode = 'drive' }: { trail: HeroTrail; onClose: () => void; mode?: TripGoMode }) {
  const t = useT();
  const target = navTarget(trail);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  if (!target) return null;
  // 🍎 zámerne, nie  (U+F8FF): logo Apple je znak z privátnej oblasti Apple fontu a mimo
  // macOS/iOS sa kreslí ako prázdny obdĺžnik. Sada panela je Emoji 1.0 — tá istá podmienka,
  // kvôli ktorej padol 🪜 v mapových značkách.
  const apps = isAppleDevice() ? [APPS[0], { id: 'apple' as NavApp, emoji: '🍎' }, ...APPS.slice(1)] : APPS;
  const mapy = mapyTrailUrl(trail);

  return (
    <>
      <style>{GO_CSS}</style>
      <div className="tgo-veil" onClick={onClose} role="presentation">
        <div className="tgo-panel" onClick={(e) => e.stopPropagation()}>
          {/* ── TRASA DO MOBILU ────────────────────────────────────────────────────────
              Vlastný panel od 15. 9. 2026. Návod je jedna veta a musí tu byť: súbor sa
              najprv STIAHNE a až potom sa otvára v appke — kto to nevie, skončí na tom,
              že sa mu „nič nestalo" (presne tak to dopadlo pri prvom teste). */}
          {mode === 'route' ? (
            <>
              <div className="tgo-title">{t('pack.trip.go.onFoot')}</div>
              <div className="tgo-where">{t('pack.trip.go.routeHow')}</div>
              <div className="tgo-grid tgo-grid--top">
                <button type="button" className="tgo-item tgo-item--wide" onClick={() => { downloadGpx(trail); onClose(); }}>
                  <span className="tgo-ic">📥</span>
                  <span>
                    {t('pack.trip.go.gpx')}
                    <span className="tgo-sub">{t('pack.trip.go.gpxSub')}</span>
                  </span>
                </button>
                {mapy && (
                  <a className="tgo-item tgo-item--wide" href={mapy} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                    <span className="tgo-ic">🧭</span>
                    <span>
                      {t('pack.trip.go.mapyTrail')}
                      <span className="tgo-sub">{t('pack.trip.go.mapyTrailSub')}</span>
                    </span>
                  </a>
                )}
              </div>
            </>
          ) : (
          <>
          <div className="tgo-title">{t('pack.trip.go.title')}</div>
          {/* ⚠️ ROZDIEL SA POMENÚVA, NEZAMLČÍ. Parkovisko je overené miesto, štart stopy je len
              prvý bod trasy — a tam sa nemusí dať zaparkovať. Kto to nevie, obviní z toho appku. */}
          <div className="tgo-where">
            {target.parking ? `🅿️ ${t('pack.trip.go.parking')}` : t('pack.trip.go.fromStart')}
            {target.note ? ` · ${target.note}` : ''}
          </div>

          <div className="tgo-eyebrow">{t('pack.trip.go.byCar')}</div>
          <div className="tgo-grid">
            {apps.map((a) => (
              <a
                key={a.id}
                className="tgo-item"
                href={navUrl(a.id, target)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
              >
                <span className="tgo-ic">{a.emoji || ''}</span>
                {t(`pack.trip.go.app.${a.id}`)}
              </a>
            ))}
          </div>

          {/* ⚠️ TRASA DO MOBILU TU UŽ NIE JE — od 15. 9. 2026 má vlastné CTA aj vlastný panel
              (`mode='route'`). Miešať „dovez ma autom" a „vezmi si stopu" do jedného panela
              znamenalo, že druhá polovica sa našla len náhodou pri scrollovaní. */}
          </>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * DVA CTA POD VÝLETOM — „dovez ma" a „vezmi si stopu".
 *
 * Do 15. 9. 2026 tu stálo JEDNO tlačidlo a druhá akcia sa skrývala v jeho paneli. Matej:
 * „lebo miešame veci… treba urobiť 2 CTA pod výletom parkovisko a mapa."
 *
 * ⚠️ Trasa sa ponúka len výletu, ktorý ju MÁ. Pri návšteve (jeden bod s okruhom) by GPX
 * niesol jediný `trkpt` a v appke by sa neukázalo nič — vtedy ostáva samo parkovisko
 * a roztiahne sa cez celú šírku.
 */
export function TripGoButtons({ hasRoute, onDrive, onRoute }: {
  hasRoute: boolean;
  onDrive: () => void;
  onRoute: () => void;
}) {
  const t = useT();
  return (
    <>
      <style>{GO_CSS}</style>
      <div className="tgo-ctas" style={hasRoute ? undefined : { gridTemplateColumns: '1fr' }}>
        <button type="button" className="tgo-cta tgo-cta--park" onClick={onDrive}>
          <span className="tgo-ic">🅿️</span>
          {t('pack.trip.go.cta')}
        </button>
        {hasRoute && (
          <button type="button" className="tgo-cta tgo-cta--trail" onClick={onRoute}>
            <span className="tgo-ic">🥾</span>
            {t('pack.trip.go.ctaRoute')}
          </button>
        )}
      </div>
    </>
  );
}
