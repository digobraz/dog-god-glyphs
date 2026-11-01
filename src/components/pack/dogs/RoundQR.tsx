// QR na preukaze DOG ID — oblé moduly a oči (Matej 1. 11. 2026: „oblejší a krajší“).
// Susedné moduly sa spájajú, rohy sa zaobľujú len tam, kde sused nie je: pri 37 moduloch
// na 72 px sa samostatné bodky rozsypú, spojené ostanú čitateľné aj pre skener.
import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

const EYE = 7;

function modulePath(x: number, y: number, dark: (x: number, y: number) => boolean) {
  const r = 0.5;
  const up = dark(x, y - 1), down = dark(x, y + 1), left = dark(x - 1, y), right = dark(x + 1, y);
  const tl = up || left ? 0 : r, tr = up || right ? 0 : r, br = down || right ? 0 : r, bl = down || left ? 0 : r;
  return `M${x + tl} ${y}H${x + 1 - tr}A${tr} ${tr} 0 0 1 ${x + 1} ${y + tr}V${y + 1 - br}A${br} ${br} 0 0 1 ${x + 1 - br} ${y + 1}H${x + bl}A${bl} ${bl} 0 0 1 ${x} ${y + 1 - bl}V${y + tl}A${tl} ${tl} 0 0 1 ${x + tl} ${y}Z`;
}

export function RoundQR({ value, ink, eye }: { value: string; ink: string; eye: string }) {
  const { n, d, eyes } = useMemo(() => {
    const q = qrcode(0, 'M');
    q.addData(value);
    q.make();
    const n = q.getModuleCount();
    const isEye = (x: number, y: number) => (x < EYE || x >= n - EYE) && y < EYE || x < EYE && y >= n - EYE;
    const dark = (x: number, y: number) => x >= 0 && y >= 0 && x < n && y < n && !isEye(x, y) && q.isDark(y, x);
    let d = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (dark(x, y)) d += modulePath(x, y, dark);
    return { n, d, eyes: [[0, 0], [n - EYE, 0], [0, n - EYE]] };
  }, [value]);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} role="img" aria-label="QR">
      <path d={d} fill={ink} />
      {eyes.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x + 0.5} y={y + 0.5} width={6} height={6} rx={2} fill="none" stroke={ink} strokeWidth={1} />
          <rect x={x + 2} y={y + 2} width={3} height={3} rx={1} fill={eye} />
        </g>
      ))}
    </svg>
  );
}
