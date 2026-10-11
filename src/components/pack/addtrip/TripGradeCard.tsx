// ZNÁMKA VÝLETU A/B/C — karta v ZÁVERE ZÁPISU (Matej 11. 10. 2026)
// Nákres: plany/nakresy/nakres-znamka-vyletu-2026-10-11.html, sekcia „1 · Záver zápisu".
// Známku NEPOČÍTA — dostane hotový `GradeResult` z `gradeFromInputs` (lib/tripGrade.ts),
// ktorý je jediný zdroj. Nič neblokuje: zapísať sa dá aj s C.
// AINUBIS veta stojí nad kartou; chýbajúci bod vedie späť do kroku cez `onGo`.
import { useState } from 'react';
import { AinubisBubble } from '@/components/pack/ainubisSheet';
import { PACK_THEME as T, PACK_BOX, PACK_SHADOW, BRAND_GOLD_BTN, PROGRESS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { GRADE_MAX, GRADE_POINTS, type GradePoint, type GradeResult, type TripGrade } from '@/lib/tripGrade';

const MEDAL: Record<TripGrade, string> = {
  A: 'linear-gradient(180deg,#4F9463,#2E5E3B)',
  B: 'linear-gradient(135deg,#C99A3F 0%,#A3782B 100%)',
  C: 'linear-gradient(180deg,#C46A52,#8E3F2C)',
};
const BAR: Record<TripGrade, string> = { A: ' pk-progress__fill--done', B: '', C: ' pk-progress__fill--low' };

type Tx = (key: string, params?: Record<string, string | number>) => string;

export function TripGradeCard({ result, photoCount, onGo, t }: {
  result: GradeResult;
  photoCount: number;
  /** Skok na krok, kde sa bod dopĺňa (rieši rodič — číslo kroku pozná on). */
  onGo: (p: GradePoint) => void;
  t: Tx;
}) {
  const { grade, score, missing } = result;
  const fillW = `${score * 20}%`;
  const [open, setOpen] = useState(grade !== 'A');
  const first = missing[0];
  const lead = grade === 'A'
    ? t('pack.addTrip.grade.leadA')
    : t('pack.addTrip.grade.lead', { grade, hint: t(`pack.addTrip.grade.hint.${first}`) });
  return (
    <div className="tgc-wrap">
      <style>{PROGRESS_CSS}{TRIP_GRADE_CSS}</style>
      <AinubisBubble role="status"><p className="tgc-lead">{lead}</p></AinubisBubble>
      <div className="tgc-card" style={{ ...PACK_BOX.card }}>
        <button type="button" className="tgc-head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="tgc-medal" style={{ background: MEDAL[grade] }} aria-label={t('pack.addTrip.grade.aria', { grade })}>{grade}</span>
          <span className="tgc-meta">
            <span className="tgc-score">{score} / {GRADE_MAX}</span>
            <span className="tgc-sub">{grade === 'A' ? t('pack.addTrip.grade.subA') : t('pack.addTrip.grade.subMissing', { n: missing.length })}</span>
            <span className="pk-progress"><span className={`pk-progress__fill${BAR[grade]}`} style={{ display: 'block', width: fillW, ...(grade === 'B' ? { background: BRAND_GOLD_BTN.grad } : null) }} /></span>
          </span>
          <span className={`tgc-chev${open ? ' open' : ''}`} aria-hidden="true" />
        </button>
        {open && (
          <ul className="tgc-list">
            {GRADE_POINTS.map((p) => {
              const miss = missing.includes(p);
              return (
                <li key={p} className={miss ? 'n' : 'y'}>
                  <span className="tgc-dot" aria-hidden="true" />
                  <span>{t(`pack.addTrip.grade.point.${p}`)}</span>
                  {miss
                    ? <button type="button" className="tgc-go" onClick={() => onGo(p)}>{t('pack.addTrip.grade.fill')}</button>
                    : p === 'photos' && <span className="tgc-val">{photoCount}</span>}
                </li>
              );
            })}
          </ul>
        )}
        <div className="tgc-legend">
          <span>{t('pack.addTrip.grade.legendA')}</span>
          <span>{t('pack.addTrip.grade.legendB')}</span>
          <span>{t('pack.addTrip.grade.legendC')}</span>
        </div>
      </div>
    </div>
  );
}

const TRIP_GRADE_CSS = `
.tgc-wrap{display:flex;flex-direction:column;gap:8px;margin-top:16px;}
.tgc-lead{margin:0;font-size:14px;line-height:1.5;}
.tgc-card{padding:16px;color:${T.ink};font-family:${FONT_UI};}
.tgc-head{display:flex;align-items:center;gap:12px;width:100%;background:none;border:0;padding:0;cursor:pointer;text-align:left;color:inherit;font-family:inherit;}
.tgc-medal{width:48px;height:48px;border-radius:999px;display:grid;place-items:center;flex:none;font-family:${FONT_TITLE};font-weight:700;font-size:24px;color:#fff;box-shadow:${PACK_SHADOW.lift};}
.tgc-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.tgc-score{font-family:${FONT_TITLE};font-weight:700;font-size:16px;letter-spacing:.14em;color:${T.inkStrong};}
.tgc-sub{font-size:12px;color:${T.inkDim};}
.tgc-chev{width:8px;height:8px;flex:none;border-right:2px solid ${T.inkDim};border-bottom:2px solid ${T.inkDim};transform:rotate(45deg);margin:0 8px 4px 0;transition:transform .15s;}
.tgc-chev.open{transform:rotate(-135deg);margin:4px 8px 0 0;}
.tgc-list{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;}
.tgc-list li{display:flex;align-items:center;gap:8px;padding:8px;border-radius:12px;font-size:14px;}
.tgc-list li.n{background:${T.alertRedSoft};border:1px dashed ${T.alertRed};}
.tgc-dot{width:16px;height:16px;border-radius:999px;flex:none;background:${T.growGreen};}
.tgc-list li.n .tgc-dot{background:transparent;border:2px solid ${T.alertRed};}
.tgc-val{margin-left:auto;font-size:12px;color:${T.inkDim};}
.tgc-go{margin-left:auto;background:none;border:0;padding:4px 0;cursor:pointer;font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.02em;color:${LAPIS.edge};white-space:nowrap;}
.tgc-go:hover{text-decoration:underline;}
.tgc-legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}
.tgc-legend span{border-radius:999px;padding:4px 12px;font-size:12px;font-weight:500;border:1px solid ${T.border};color:${T.ink};background:${T.tileBg};}
`;
