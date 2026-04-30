import { useEffect, useRef, useCallback } from 'react';

const ITEM_H = 36; // row height in px
const VISIBLE = 5; // visible rows (must be odd)
const PAD = (VISIBLE - 1) / 2;
const WHEEL_H = ITEM_H * VISIBLE;

interface WheelProps {
  values: (string | number)[];
  selectedIndex: number;
  onChange: (i: number) => void;
  font?: string;
  width?: string;
}

function Wheel({ values, selectedIndex, onChange, font, width = '1fr' }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);
  const isProgrammatic = useRef(false);

  // Sync scroll position when selectedIndex changes externally
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = selectedIndex * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) {
      isProgrammatic.current = true;
      el.scrollTo({ top: target, behavior: 'smooth' });
      window.setTimeout(() => { isProgrammatic.current = false; }, 350);
    }
  }, [selectedIndex]);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => {
      if (isProgrammatic.current) return;
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(values.length - 1, idx));
      const snap = clamped * ITEM_H;
      if (Math.abs(el.scrollTop - snap) > 0.5) {
        el.scrollTo({ top: snap, behavior: 'smooth' });
      }
      if (clamped !== selectedIndex) onChange(clamped);
    }, 90);
  }, [values.length, selectedIndex, onChange]);

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="relative overflow-y-scroll no-scrollbar snap-y snap-mandatory"
      style={{
        height: WHEEL_H,
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
        gridColumn: width === '1fr' ? undefined : undefined,
      }}
    >
      <div style={{ paddingTop: PAD * ITEM_H, paddingBottom: PAD * ITEM_H }}>
        {values.map((v, i) => {
          const dist = Math.abs(i - selectedIndex);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.45 : dist === 2 ? 0.18 : 0.08;
          const scale = dist === 0 ? 1 : 0.88;
          return (
            <div
              key={i}
              className="flex items-center justify-center snap-center select-none"
              style={{
                height: ITEM_H,
                scrollSnapAlign: 'center',
                opacity,
                transform: `scale(${scale})`,
                transition: 'opacity 0.15s, transform 0.15s',
                fontFamily: font,
                color: dist === 0 ? 'hsl(var(--gold))' : 'hsl(var(--foreground) / 0.85)',
                fontWeight: dist === 0 ? 700 : 500,
                fontSize: dist === 0 ? '1.25rem' : '1.05rem',
                letterSpacing: '0.05em',
              }}
            >
              {v}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WheelDatePickerProps {
  day: number;
  month: number; // 1-12
  year: number;
  minYear: number;
  maxYear: number;
  maxDate: Date; // upper bound (today)
  onChange: (d: number, m: number, y: number) => void;
}

const MONTHS_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function daysInMonth(m: number, y: number) {
  return new Date(y, m, 0).getDate();
}

export function WheelDatePicker({ day, month, year, minYear, maxYear, maxDate, onChange }: WheelDatePickerProps) {
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const dim = daysInMonth(month, year);
  const days = Array.from({ length: dim }, (_, i) => String(i + 1).padStart(2, '0'));

  const dayIdx = Math.min(day - 1, days.length - 1);
  const monthIdx = month - 1;
  const yearIdx = years.indexOf(year);

  const apply = (newDay: number, newMonth: number, newYear: number) => {
    // clamp day to month length
    const maxDay = daysInMonth(newMonth, newYear);
    let d = Math.min(newDay, maxDay);
    // clamp to maxDate
    const candidate = new Date(newYear, newMonth - 1, d);
    if (candidate > maxDate) {
      newYear = maxDate.getFullYear();
      newMonth = maxDate.getMonth() + 1;
      d = Math.min(d, maxDate.getDate());
    }
    onChange(d, newMonth, newYear);
  };

  return (
    <div className="relative w-full rounded-xl bg-black/30 backdrop-blur-sm border border-border/30 overflow-hidden">
      {/* gold lens band — center row */}
      <div
        aria-hidden
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: `calc(50% - ${ITEM_H / 2}px)`,
          height: ITEM_H,
          borderTop: '1px solid hsl(var(--gold) / 0.55)',
          borderBottom: '1px solid hsl(var(--gold) / 0.55)',
          background: 'linear-gradient(180deg, hsl(var(--gold) / 0.05), hsl(var(--gold) / 0.12), hsl(var(--gold) / 0.05))',
        }}
      />
      {/* fade overlays */}
      <div aria-hidden className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: ITEM_H * 2, background: 'linear-gradient(180deg, hsl(0 0% 0% / 0.85), transparent)' }} />
      <div aria-hidden className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: ITEM_H * 2, background: 'linear-gradient(0deg, hsl(0 0% 0% / 0.85), transparent)' }} />

      <div className="grid grid-cols-3 gap-0 relative">
        <Wheel
          values={days}
          selectedIndex={dayIdx}
          onChange={(i) => apply(i + 1, month, year)}
          font="'JetBrains Mono', monospace"
        />
        <Wheel
          values={MONTHS_SHORT}
          selectedIndex={monthIdx}
          onChange={(i) => apply(day, i + 1, year)}
          font="'Cinzel', serif"
        />
        <Wheel
          values={years}
          selectedIndex={yearIdx >= 0 ? yearIdx : years.length - 1}
          onChange={(i) => apply(day, month, years[i])}
          font="'JetBrains Mono', monospace"
        />
      </div>
    </div>
  );
}
