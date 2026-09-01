// ─────────────────────────────────────────────────────────────────────────────
// PANEL LEVELU — otvorí sa kliknutím na pilulku levelu v hlavičke mapy.
//
// Nahradil bublinu (`title=`), ktorá tam visela s rozpisom bodov zlepeným do jedného riadku
// oddeleného bodkami. Matej 24. 8.: *„pridaj to tam nejak rozumne, prípadne zvačši popup atĎ
// tak aby sa nemuselo scrolovať a info boli vidno"*. Preto:
//   · panel, nie tooltip — bublina sa na dotykovom telefóne nedá vyvolať vôbec
//   · ŠKÁLA PÁSIEM hore (kde som, čo ma čaká) + ROZPAD BODOV pod ňou (za čo to mám)
//   · šírka do 460 px a vlastný scroll až od malých výšok — na bežnom telefóne sa zmestí celý
//
// ⚠️ Rozpad si panel NEPOČÍTA — dostáva hotové `rows` z `profilePointsFor()`. To isté číslo
//    teda ukazuje pilulka aj panel; keby si počítal sám, rozišli by sa (presne tak sa už raz
//    rozišla mapa s vysvedčením).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { FONT_TITLE, FONT_UI, PACK_THEME as T } from '@/components/pack/packTheme';
import type { LevelProgress, PointsRow } from '@/lib/tripPoints';
import { tierOfLevel, tierGradient } from '@/lib/packTiers';
import { useT } from '@/i18n/LanguageContext';
import { TierScale } from './TierScale';
import { PointsBreakdown } from './PointsBreakdown';

export interface LevelPanelProps {
  level: LevelProgress;
  rows: PointsRow[];
  onClose: () => void;
}

export function LevelPanel({ level, rows, onClose }: LevelPanelProps) {
  const t = useT();
  const tier = tierOfLevel(level.level);

  // Escape zatvára — panel je modálny a bez klávesnice by sa z neho na PC dalo vyjsť len myšou.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('pack.tier.panelTitle')}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2600,
        background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '18px 16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto',
          background: 'linear-gradient(160deg, rgba(28,20,10,0.98), rgba(14,10,5,0.98))',
          border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
          boxShadow: '0 16px 50px rgba(0,0,0,0.7)',
          padding: '16px 15px 15px',
        }}
      >
        {/* HLAVIČKA — rang, level v pilulke svojho pásma, meno pásma */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <div style={{
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 15,
              letterSpacing: '.16em', textTransform: 'uppercase',
              color: 'rgba(245,240,228,0.92)', display: 'flex', alignItems: 'center', gap: 9,
            }}>
              {t('pack.map.rankPilgrim')}
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '3px 11px 4px',
                borderRadius: 999, border: '1px solid rgba(250,244,236,0.30)',
                background: tierGradient(tier), color: tier.ink,
                fontFamily: FONT_UI, fontWeight: 600, fontSize: 14, lineHeight: 1,
              }}>
                {level.level}
              </span>
            </div>
            <div style={{
              marginTop: 4, fontFamily: FONT_UI, fontSize: 11.5,
              color: 'rgba(245,240,228,0.55)', fontVariantNumeric: 'tabular-nums',
            }}>
              {t('pack.tier.pointsOfNext', { points: level.points, next: level.nextPoints })}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('pack.tier.close')}
            style={{
              flex: '0 0 auto', width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(245,240,228,0.07)', border: '1px solid rgba(245,240,228,0.14)',
              color: 'rgba(245,240,228,0.55)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* LIŠTA POSTUPU — to isté číslo ako v hlavičke, len väčšie */}
        <div style={{
          position: 'relative', height: 8, borderRadius: 999,
          background: 'rgba(245,240,228,0.10)', overflow: 'hidden', marginBottom: 6,
        }}>
          <i style={{
            display: 'block', height: '100%', width: `${level.pct}%`, borderRadius: 999,
            background: `linear-gradient(90deg, ${tier.b}, ${tier.a})`,
          }} />
        </div>
        <p style={{
          margin: '0 0 14px', fontFamily: FONT_UI, fontSize: 11.5,
          color: 'rgba(245,240,228,0.55)',
        }}>
          {t('pack.tier.toNext', { n: level.toNext, level: level.level + 1 })}
        </p>

        <Section title={t('pack.tier.scaleTitle')}>
          <TierScale level={level.level} />
        </Section>

        {rows.length > 0 && (
          <Section title={t('pack.tier.breakdownTitle')}>
            <PointsBreakdown rows={rows} />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(201,154,63,0.4)',
            }}>
              <span style={{
                fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12,
                letterSpacing: '.14em', textTransform: 'uppercase',
                color: 'rgba(245,240,228,0.86)',
              }}>
                {t('pack.tier.totalLabel')}
              </span>
              <b style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 24, color: '#F5C73D' }}>
                {level.points}
              </b>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

/** Nadpis sekcie — eyebrow podľa vzoru `.religion-eyebrow` (Space Grotesk 500, široký rozpal). */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        marginBottom: 7, fontFamily: FONT_UI, fontWeight: 500, fontSize: 9.5,
        letterSpacing: '.26em', textTransform: 'uppercase', color: T.cardEdge,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}
