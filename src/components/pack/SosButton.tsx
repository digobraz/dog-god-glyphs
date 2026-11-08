// ── SOS — GLOBÁL v hornom páse, vedľa správ (Matej 30. 10. 2026), ikonka = trojuholník s výkričníkom ─────────────────────────────
// *„postavme to už teraz, resp. chcem to tam mať už zarámované, obsah môžeme dodať aj neskôr"*.
// Lock `architektura-pack.md` §1.2: SOS je GLOBÁL, max 1 ťuk odkiaľkoľvek, nikdy tab.
// Ťuk = POPUP (šuplík zdola, lock pack-dizajn-system §POPUP):
//   · STRATIL SA MI PES — červené tlačidlo, VŽDY prvé a nikdy nezmizne → `/pack/sos/new`
//   · NAHLÁSIŤ TÝRANIE — zatiaľ „čoskoro“ (pod Stratil sa mi pes, nad Prvou pomocou)
//   · PRVÁ POMOC · NAJBLIŽŠÍ VETERINÁR — zatiaľ „čoskoro"
//   · AKTUÁLNE PÁTRANIE — pod nimi zoznam z `sosActive()` (len krajina člena), moje prvé; ťuk → `/pack/sos/<slug>`.
//     Bez pátraní nadpis nie je. Keď beží MOJA strata, trojuholník nesie malú červenú bodku.
// 🔴 Mount len za `TEST_BUILD` (4. 11. 2026, revízia locku architektura-pack §1.2) a nie v koši 3 (`PackTopRow task`).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { SOS_ON } from '@/lib/env';
import { APP_NEW } from '@/lib/packFlags';
import { PackPopup } from './PackPopup';
import { BrandIcon } from './BrandIcon';
import { TopCircle } from './TopCircle';
import { useSosActive, sosAgo } from './sosKit';
import { sizedUrl } from '@/services/cloudinaryService';
import { PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_UI } from './packTheme';

const T = PACK_THEME;
const S = PACK_SPACE;

const CSS = `
.sos-btn{all:unset;cursor:pointer;position:relative;box-sizing:border-box;width:44px;height:44px;display:grid;place-items:center;border-radius:${PACK_R.pill}px;}
.sos-btn:active{background:${T.alertRedSoft};}
.sos-btn i{position:absolute;top:${S.sm}px;right:${S.sm}px;width:${S.sm}px;height:${S.sm}px;border-radius:${PACK_R.pill}px;background:${T.sosRed};box-shadow:0 0 0 2px ${T.cardEdge};}
.sos-list{display:flex;flex-direction:column;gap:${S.sm}px;}
.sos-row{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px;}
.sos-row b{flex:1;font:600 ${PACK_TEXT.body}px/1.3 ${FONT_UI};color:${T.inkStrong};}
.sos-row small{font:500 ${PACK_TEXT.label}px/1 ${FONT_UI};color:${T.inkWarm};}
.sos-row.lost b{color:#FFFFFF;}
.sos-row.lost:active{filter:brightness(.9);}
.sos-sec{margin:${S.lg}px 0 ${S.sm}px;font:${PACK_HEAD.section.fontWeight} ${PACK_HEAD.section.fontSize}px/1.2 ${FONT_UI};letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${T.sosRed};}
.sos-ph{flex:none;width:44px;height:44px;border-radius:${PACK_R.pill}px;border:2px solid ${T.sosRed};background:${T.tileBg} center/cover no-repeat;}
.sos-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:${S.xs}px;}
.sos-tx b{flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sos-tx span{font:500 ${PACK_TEXT.label}px/1.3 ${FONT_UI};color:${T.inkDim};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sos-mine{flex:none;font:600 ${PACK_TEXT.micro}px/1 ${FONT_UI};letter-spacing:.02em;text-transform:uppercase;color:${T.sosRed};}
`;

const ROWS = [
  { key: 'aid', icon: 'bolt', k: 'pack.sos.firstAid', fb: 'First aid' },
];

export function SosButton() {
  const t = useT();
  const { lang } = useLang();
  const nav = useNavigate();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [open, setOpen] = useState(false);
  const active = useSosActive();
  const mineRunning = active.some((r) => r.is_mine);
  const go = (to: string) => { setOpen(false); nav(to); };
  return (
    <>
      <style>{CSS}</style>
      {/* Trojuholník s výkričníkom z kitu (`alert.svg`), červený — Matej 30. 10.: "nie SOS, ale ikonku trojuholník s výkričníkom". */}
      <button type="button" className="sos-btn" onClick={() => setOpen(true)} aria-label="SOS">
        {APP_NEW ? <TopCircle name="sos" /> : <BrandIcon name="alert" size={24} tint="danger" />}
        {mineRunning && <i aria-hidden />}
      </button>
      {open && (
        <PackPopup title="SOS" onClose={() => setOpen(false)}>
          <div className="sos-list">
            {/* Vždy prvé, nikdy nezmizne — riadky pátraní ho nesmú nahradiť. */}
            {SOS_ON && (
              <button type="button" className="sos-row lost" style={{ ...PACK_BOX.row, background: T.sosRed, borderColor: T.sosRedDark }} onClick={() => go('/pack/sos/new')}>
                <BrandIcon name="dogposter" size={24} tint="white" />
                <b>{tx('pack.sos.btn.lost', 'My dog is lost')}</b>
              </button>
            )}
            <button type="button" className="sos-row vet" style={{ ...PACK_BOX.row }} onClick={() => go('/pack/sos/pohotovost')}>
              <BrandIcon name="vet" size={24} tint="gold" />
              <b>{tx('pack.sos.er.btn', 'Emergency vet')}</b>
            </button>
            {/* Rýchly prístup ku kartičke, nastavenie ostáva v DOG ID (Matej 5. 11.). */}
            {APP_NEW && (
              <button type="button" className="sos-row card" style={{ ...PACK_BOX.row }} onClick={() => go('/pack/sos/karticka')}>
                <BrandIcon name="attention-head" size={24} tint="gold" />
                <b>{tx('pack.sos.card.title', 'Emergency card')}</b>
              </button>
            )}
            {/* Nahlásiť týranie: zatiaľ bez akcie, vyzerá ako ostatné „čoskoro“ (nie červeno). */}
            <button type="button" className="sos-row abuse" style={{ ...PACK_BOX.row }}>
              <BrandIcon name="stop-rhomb" size={24} tint="gold" />
              <b>{tx('pack.sos.btn.abuse', 'Report abuse')}</b>
              <small>{tx('pack.sos.soon', 'Soon')}</small>
            </button>
            {SOS_ON && ROWS.map((r) => (
              <button key={r.key} type="button" className={`sos-row ${r.key}`} style={{ ...PACK_BOX.row }}>
                <BrandIcon name={r.icon} size={24} tint="gold" />
                <b>{tx(r.k, r.fb)}</b>
                <small>{tx('pack.sos.soon', 'Soon')}</small>
              </button>
            ))}
          </div>
          {SOS_ON && active.length > 0 && (
            <>
              <h3 className="sos-sec">{tx('pack.sos.active', 'Search in progress')}</h3>
              <div className="sos-list">
                {active.map((r) => (
                  <button key={r.id} type="button" className="sos-row act" style={{ ...PACK_BOX.row, background: T.sosRedSoft, borderColor: T.sosRed }} onClick={() => go(`/pack/sos/${r.slug}`)}>
                    <span className="sos-ph" style={r.photo ? { backgroundImage: `url(${sizedUrl(r.photo, 96)})` } : undefined} />
                    <span className="sos-tx">
                      <b>{r.dog_name}</b>
                      <span>{[r.place_label, sosAgo(r.last_seen_at, lang)].filter(Boolean).join(' · ')}</span>
                    </span>
                    {r.is_mine && <span className="sos-mine">{tx('pack.sos.mine', 'Yours')}</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </PackPopup>
      )}
    </>
  );
}
