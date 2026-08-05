// QuickTiles — pás rýchleho prístupu na `/pack` homepage (2026-08-05).
//
// TRI ŽIVÉ CIELE, žiadne „coming soon" (Matej 5.8.: *„mapa je mapa a portal je portal…
// aktuálne by sme mohli dať do toho bloku MAP DOGMA Prvá pomoc AI"*). Zamknuté dlaždice
// sem NEPATRIA — pás rastie tak, že pribudne ďalší objekt do `tiles`, nie tak, že sa
// dopredu vykreslia prázdne políčka.
//
// ⚠️ MAPA sa vykresľuje len pri `DEV_FULL`. Bez toho by dlaždica viedla na `/pack/map`,
// ktorú `MapGate` hodí späť na `/pack` — slepá ulička pre platiaceho člena. Rovnaký
// dôvod, prečo je za flagom aj `NextTripCard` (viď komentár v Pack.tsx). Po flipe
// (launch mapky) sú dlaždice tri, dovtedy dve.
//
// Dizajn = papyrus lock (Entry.tsx): `T.cardGrad` · 1.5px `T.cardEdge` · radius 16 ·
// `T.cardShadow`. Nadpis Cinzel 700 uppercase, podnadpis Space Grotesk — dva fonty,
// nie jeden (packTheme.ts typografický poriadok).
import { Link } from 'react-router-dom';
import { PACK_THEME, FONT_TITLE, FONT_UI } from './packTheme';
import { BrandIcon } from './BrandIcon';
import { DEV_FULL } from '@/lib/packFlags';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { markConstitutionOpened } from '@/lib/constitutionRead';
import { openAinubis } from '@/lib/ainubisBus';
import { useT } from '@/i18n/LanguageContext';
import ainubisBadge from '@/assets/ainubis-badge.png';

const T = PACK_THEME;

/** Spoločný obal dlaždice — Link (interná routa), <a> (externá) aj <button> (akcia). */
const TILE_CLASS = 'pack-card-hover qt-tile';

const TILE_CSS = `
.qt-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
.qt-grid[data-count="2"]{grid-template-columns:repeat(2,minmax(0,1fr));}
@media (min-width:768px){.qt-grid{gap:20px;}}
.qt-tile{
  display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
  gap:10px;text-align:center;text-decoration:none;cursor:pointer;
  background:${T.cardGrad};border:1.5px solid ${T.cardEdge};border-radius:16px;
  box-shadow:${T.cardShadow};padding:18px 10px 16px;width:100%;
  font:inherit;color:inherit;
}
@media (min-width:768px){.qt-tile{padding:26px 18px 22px;gap:12px;}}
.qt-art{
  width:52px;height:52px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  transition:transform .35s ease;
}
@media (min-width:768px){.qt-art{width:64px;height:64px;}}
.qt-tile:hover .qt-art{transform:scale(1.08);}
.qt-title{
  font-family:${FONT_TITLE};font-weight:700;font-size:12px;line-height:1.15;
  letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};
}
@media (min-width:768px){.qt-title{font-size:14px;}}
.qt-sub{
  font-family:${FONT_UI};font-weight:400;font-size:10.5px;line-height:1.35;
  color:${T.inkWarm};max-width:15ch;
}
@media (min-width:768px){.qt-sub{font-size:12px;max-width:20ch;}}
`;

export function QuickTiles() {
  const t = useT();
  const trailCount = HERO_TRAILS.length;

  const tiles = [
    DEV_FULL && (
      <Link key="map" to="/pack/map" className={TILE_CLASS}>
        <span className="qt-art">
          <BrandIcon name="map" size={52} tint="gold" />
        </span>
        <span className="qt-title">{t('pack.tiles.map.title')}</span>
        <span className="qt-sub">{t('pack.tiles.map.sub', { count: String(trailCount) })}</span>
      </Link>
    ),
    <a
      key="dogma"
      href="https://dogma.dogypt.com"
      target="_blank"
      rel="noopener noreferrer"
      onClick={markConstitutionOpened}
      className={TILE_CLASS}
    >
      <span className="qt-art">
        {/* Rovnaká obálka ako veľká ConstitutionCard — knihu si člen spojí s DOGMOU. */}
        <img
          src="/images/dogma-cover.png"
          alt=""
          aria-hidden
          style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 6px 14px rgba(10,10,10,0.30))' }}
        />
      </span>
      <span className="qt-title">{t('pack.tiles.dogma.title')}</span>
      <span className="qt-sub">{t('pack.tiles.dogma.sub')}</span>
    </a>,
    <button key="ainubis" type="button" onClick={openAinubis} className={TILE_CLASS}>
      <span className="qt-art">
        {/* AINUBIS má vlastnú cyborg identitu — badge nesie tvár, rám ostáva papyrusový,
            aby pás držal pohromade (paleta = reference_dogypt_ainubis_cyborg_palette). */}
        <img
          src={ainubisBadge}
          alt=""
          aria-hidden
          style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
        />
      </span>
      <span className="qt-title">{t('pack.tiles.ainubis.title')}</span>
      <span className="qt-sub">{t('pack.tiles.ainubis.sub')}</span>
    </button>,
  ].filter(Boolean);

  return (
    <section aria-label={t('pack.tiles.ariaLabel')}>
      <style>{TILE_CSS}</style>
      <div className="qt-grid" data-count={String(tiles.length)}>
        {tiles}
      </div>
    </section>
  );
}
