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
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
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
.tgo-ic{font-family:${FONT_EMOJI};font-size:17px;line-height:1;flex-shrink:0;}
.tgo-sub{display:block;font-size:11px;font-weight:400;color:${T.inkWarm};margin-top:2px;}
/* Hlavná akcia panela = LAPIS (brandový kánon: papyrusový podklad ⇒ lapis).
   Geometria z locknutého .btn-gold — radius 8, nie pilulka. */
.tgo-go{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:18px;padding:13px;
  border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.edge};box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_TITLE};font-weight:700;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;}
.tgo-go:hover{background:${LAPIS.gradHover};}
`;

/** Poradie = čo ľudia na Slovensku reálne otvárajú. Apple pribúda len na Apple zariadení. */
const APPS: Array<{ id: NavApp; emoji: string }> = [
  { id: 'google', emoji: '🗺️' },
  { id: 'waze',   emoji: '🚗' },
  { id: 'mapy',   emoji: '🧭' },
];

export function TripGoPanel({ trail, onClose }: { trail: HeroTrail; onClose: () => void }) {
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

          {/* TRASA DO MOBILU — iná vec než navigácia autom, preto vlastná sekcia.
              Vykreslí sa len pri výlete, ktorý trasu naozaj MÁ: pri návšteve (jeden bod
              s okruhom) by GPX obsahoval jediný `trkpt` a Mapy.com by ukázali prázdno. */}
          {trail.path.length > 1 && (
            <>
              <div className="tgo-eyebrow">{t('pack.trip.go.onFoot')}</div>
              <div className="tgo-grid">
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
          )}
        </div>
      </div>
    </>
  );
}

/** Tlačidlo, ktoré panel otvára — stojí v článku výletu nad zápismi svorky. */
export function TripGoButton({ onClick }: { onClick: () => void }) {
  const t = useT();
  return (
    <>
      <style>{GO_CSS}</style>
      <button type="button" className="tgo-go" onClick={onClick}>
        <span className="tgo-ic" style={{ fontSize: 15 }}>🅿️</span>
        {t('pack.trip.go.cta')}
      </button>
    </>
  );
}
