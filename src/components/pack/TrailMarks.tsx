/**
 * TrailMarks — turistické značky (KČT/KST pásová značka) v poradí od štartu po cieľ.
 *
 * Zdroj: HeroTrail.marks (auto z OSM route=hiking, skript plany/compute-trail-marks.py).
 * Vizuál = autentická slovenská pásová značka: biely štvorec + farebný vodorovný pruh
 * v strede (top/bottom biele). Rad štvorcov so šípkami = poradie trás, po ktorých ísť.
 * Matej: „človek by vedel po akej značke ísť".
 */
import React from 'react';

export type TrailMarkColor = 'red' | 'blue' | 'green' | 'yellow';

// Oficiálne KST farby (mierne stlmené pre čitateľnosť na bielom štvorci)
const KCT: Record<TrailMarkColor, string> = {
  red: '#E1121C',
  blue: '#0070C0',
  green: '#159A3C',
  yellow: '#F5C518',
};

export function TrailMarkChip({ color, size = 18 }: { color: TrailMarkColor; size?: number }) {
  return (
    <span
      aria-label={`${color} trail marker`}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.28)',
        borderRadius: 2,
        position: 'relative',
        flex: '0 0 auto',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '34%',
          height: '32%',
          background: KCT[color],
        }}
      />
    </span>
  );
}

/**
 * marks = rad ÚSEKOV od štartu po cieľ; každý úsek = množina farieb, ktoré tam bežia
 * SÚBEŽNE (na jednom chodníku visí viac pásikov). Súbežné = zlepené štvorce v skupine,
 * medzi úsekmi šípka. Spätne znáša aj starý plochý formát (TrailMarkColor[]).
 */
function normSegments(marks: TrailMarkColor[] | TrailMarkColor[][]): TrailMarkColor[][] {
  if (marks.length === 0) return [];
  return Array.isArray(marks[0]) ? (marks as TrailMarkColor[][]) : (marks as TrailMarkColor[]).map((c) => [c]);
}

export function TrailMarks({
  marks,
  label = 'Follow the markers',
  size = 18,
  labelColor = 'inherit',
}: {
  marks?: TrailMarkColor[] | TrailMarkColor[][] | null;
  label?: string | null;
  size?: number;
  labelColor?: string;
}) {
  const segments = marks ? normSegments(marks) : [];
  if (segments.length === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {label && (
        <span style={{ fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: labelColor, opacity: 0.75 }}>
          {label}
        </span>
      )}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {segments.map((seg, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ opacity: 0.5, fontSize: size * 0.7, lineHeight: 1 }}>→</span>}
            {/* súbežné farby = zlepené štvorce (1px medzera) v jednej skupine */}
            <span style={{ display: 'inline-flex', gap: 1 }}>
              {seg.map((c, j) => <TrailMarkChip key={j} color={c} size={size} />)}
            </span>
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}
