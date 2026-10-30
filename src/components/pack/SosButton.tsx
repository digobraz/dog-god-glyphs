// ── SOS — GLOBÁL v hornom páse, vedľa správ (Matej 30. 10. 2026), ikonka = trojuholník s výkričníkom ─────────────────────────────
// *„postavme to už teraz, resp. chcem to tam mať už zarámované, obsah môžeme dodať aj neskôr"*.
// Lock `architektura-pack.md` §1.2: SOS je GLOBÁL, max 1 ťuk odkiaľkoľvek, nikdy tab.
// Ťuk = POPUP (šuplík zdola, lock pack-dizajn-system §POPUP). Dnes je to RÁM — riadky sú „čoskoro":
//   · STRATIL SA PES — logika zvlášť: pripnutý červený príspevok vo feede + trvalá notifikácia
//     pri chvoste → červený blok s info z príspevku (`plany/appka-sos-prva-pomoc-poistenie-2026-10-30.md`)
//   · PRVÁ POMOC — karty offline (v balíku appky), obsah z VAULTU
//   · VETERINÁR — najbližšia pohotovosť z mapy
import { useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PackPopup } from './PackPopup';
import { BrandIcon } from './BrandIcon';
import { PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, FONT_UI } from './packTheme';

const T = PACK_THEME;
const S = PACK_SPACE;

const CSS = `
.sos-btn{all:unset;cursor:pointer;box-sizing:border-box;width:44px;height:44px;display:grid;place-items:center;border-radius:${PACK_R.pill}px;}
.sos-btn:active{background:${T.alertRedSoft};}
.sos-list{display:flex;flex-direction:column;gap:${S.sm}px;}
.sos-row{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px;}
.sos-row b{flex:1;font:600 ${PACK_TEXT.body}px/1.3 ${FONT_UI};color:${T.inkStrong};}
.sos-row small{font:500 ${PACK_TEXT.label}px/1 ${FONT_UI};color:${T.inkWarm};}
.sos-row.lost{background:${T.alertRedSoft};}
.sos-row.lost b{color:${T.alertRed};}
`;

const ROWS = [
  { key: 'lost', icon: 'dogposter', tint: 'danger' as const, k: 'pack.sos.lost', fb: 'My dog is lost' },
  { key: 'aid', icon: 'cross', tint: 'gold' as const, k: 'pack.sos.firstAid', fb: 'First aid' },
  { key: 'vet', icon: 'vet', tint: 'gold' as const, k: 'pack.sos.vet', fb: 'Nearest vet' },
];

export function SosButton() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [open, setOpen] = useState(false);
  return (
    <>
      <style>{CSS}</style>
      {/* Trojuholník s výkričníkom z kitu (`alert.svg`), červený — Matej 30. 10.: „nie SOS, ale ikonku trojuholník s výkričníkom“. */}
      <button type="button" className="sos-btn" onClick={() => setOpen(true)} aria-label="SOS"><BrandIcon name="alert" size={24} tint="danger" /></button>
      {open && (
        <PackPopup title="SOS" onClose={() => setOpen(false)}>
          <div className="sos-list">
            {ROWS.map((r) => (
              <button key={r.key} type="button" className={`sos-row ${r.key}`} style={{ ...PACK_BOX.row }}>
                <BrandIcon name={r.icon} size={24} tint={r.tint} />
                <b>{tx(r.k, r.fb)}</b>
                <small>{tx('pack.sos.soon', 'Soon')}</small>
              </button>
            ))}
          </div>
        </PackPopup>
      )}
    </>
  );
}
