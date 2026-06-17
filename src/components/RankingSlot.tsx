import num1 from '@/assets/numbers/NUMBER-1.svg';
import num2 from '@/assets/numbers/NUMBER-2.svg';
import num3 from '@/assets/numbers/NUMBER-3.svg';
import num4 from '@/assets/numbers/NUMBER-4.svg';
import num5 from '@/assets/numbers/NUMBER-5.svg';
import num6 from '@/assets/numbers/NUMBER-6.svg';
import num7 from '@/assets/numbers/NUMBER-7.svg';
import num8 from '@/assets/numbers/NUMBER-8.svg';
import num9 from '@/assets/numbers/NUMBER-9.svg';
import num10 from '@/assets/numbers/NUMBER-10.svg';
import num11 from '@/assets/numbers/NUMBER-11.svg';

// Prebuilt carved glyphs for 1–11 (single SVG each).
const prebuilt: Record<number, string> = {
  1: num1, 2: num2, 3: num3, 4: num4, 5: num5, 6: num6,
  7: num7, 8: num8, 9: num9, 10: num10, 11: num11,
};

// Roman numeral characters that have a carved glyph (I=1, V=5, X=10).
const charSvg: Record<string, string> = { I: num1, V: num5, X: num10 };

// Convert 1–50 to a Roman numeral string.
function toRoman(n: number): string {
  const vals = [50, 40, 10, 9, 5, 4, 1];
  const syms = ['L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let out = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      out += syms[i];
      n -= vals[i];
    }
  }
  return out;
}

/**
 * Renders the owner-ranking numeral inside a heroglyph SVG slot.
 * 1–11 use the single prebuilt carved glyph; 12+ are composed from the
 * carved I/V/X glyphs (L falls back to Cinzel text — only ranks 40–50).
 * Returns null for empty/invalid values so callers can show a placeholder.
 */
export function RankingSlot({ x, y, w, h, value }: { x: number; y: number; w: number; h: number; value?: string }) {
  const n = parseInt(value ?? '', 10);
  if (!Number.isFinite(n) || n < 1) return null;

  if (prebuilt[n]) {
    return <image href={prebuilt[n]} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />;
  }

  const chars = toRoman(n).split('');
  const cellW = w / chars.length;
  return (
    <>
      {chars.map((ch, i) => {
        const cx = x + i * cellW;
        const svg = charSvg[ch];
        if (svg) {
          return <image key={i} href={svg} x={cx} y={y} width={cellW} height={h} preserveAspectRatio="xMidYMid meet" />;
        }
        // 'L' (50) — no carved glyph, render as Cinzel text to match the ink.
        return (
          <text
            key={i}
            x={cx + cellW / 2}
            y={y + h * 0.78}
            textAnchor="middle"
            fontFamily="'Cinzel', serif"
            fontWeight={700}
            fontSize={h * 0.82}
            fill="currentColor"
          >
            {ch}
          </text>
        );
      })}
    </>
  );
}
