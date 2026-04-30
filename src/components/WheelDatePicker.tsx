import { useEffect, useRef, useCallback } from 'react';

let _audioCtx: AudioContext | null = null;
function playTick() {
  try {
    if (typeof window === 'undefined') return;
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    if (!_audioCtx) _audioCtx = new Ctx();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    const ctx = _audioCtx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  } catch { /* ignore */ }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { (navigator as any).vibrate?.(8); } catch { /* ignore */ }
  }
}

const ITEM_H = 28;
const VISIBLE = 3;
const PAD = (VISIBLE - 1) / 2;
const WHEEL_H = ITEM_H * VISIBLE;
const LOOP_REPEATS = 50; // total copies of the values array when looping

interface WheelProps {
  values: (string | number)[];
  selectedIndex: number;
  onChange: (i: number) => void;
  font?: string;
  loop?: boolean;
}

function Wheel({ values, selectedIndex, onChange, font, loop = false }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);
  const isProgrammatic = useRef(false);
  const lastTickIdx = useRef<number>(selectedIndex);

  const N = values.length;
  // For loop mode we render N * LOOP_REPEATS items, anchor to middle copy.
  const middleCopy = Math.floor(LOOP_REPEATS / 2);
  const loopList = loop
    ? Array.from({ length: N * LOOP_REPEATS }, (_, i) => values[i % N])
    : values;

  // helper to scroll to a logical index (0..N-1)
  const scrollToLogical = useCallback((logical: number, behavior: ScrollBehavior = 'auto') => {
    const el = ref.current;
    if (!el) return;
    const physical = loop ? middleCopy * N + logical : logical;
    isProgrammatic.current = true;
    el.scrollTo({ top: physical * ITEM_H, behavior });
    window.setTimeout(() => { isProgrammatic.current = false; }, behavior === 'smooth' ? 350 : 60);
  }, [loop, N, middleCopy]);

  // Initial mount: jump to centered copy
  useEffect(() => {
    scrollToLogical(selectedIndex, 'auto');
    lastTickIdx.current = selectedIndex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when external selectedIndex changes (only if currently aligned to a different logical idx)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const physicalIdx = Math.round(el.scrollTop / ITEM_H);
    const currentLogical = ((physicalIdx % N) + N) % N;
    if (currentLogical !== selectedIndex) {
      scrollToLogical(selectedIndex, 'smooth');
    }
  }, [selectedIndex, N, scrollToLogical]);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // live tick + recenter check
    if (!isProgrammatic.current) {
      const physicalIdx = Math.round(el.scrollTop / ITEM_H);
      const logical = ((physicalIdx % N) + N) % N;
      if (logical !== lastTickIdx.current) {
        lastTickIdx.current = logical;
        playTick();
      }

      // Recenter when near edges of repeated list
      if (loop) {
        const totalH = N * LOOP_REPEATS * ITEM_H;
        const buffer = N * ITEM_H * 2; // 2 cycles buffer
        if (el.scrollTop < buffer || el.scrollTop > totalH - buffer - WHEEL_H) {
          const recenter = middleCopy * N * ITEM_H + logical * ITEM_H;
          isProgrammatic.current = true;
          el.scrollTop = recenter;
          window.setTimeout(() => { isProgrammatic.current = false; }, 30);
        }
      }
    }

    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => {
      if (isProgrammatic.current) return;
      const physicalIdx = Math.round(el.scrollTop / ITEM_H);
      const snap = physicalIdx * ITEM_H;
      if (Math.abs(el.scrollTop - snap) > 0.5) {
        el.scrollTo({ top: snap, behavior: 'smooth' });
      }
      const logical = loop
        ? ((physicalIdx % N) + N) % N
        : Math.max(0, Math.min(N - 1, physicalIdx));
      if (logical !== selectedIndex) onChange(logical);
    }, 90);
  }, [N, loop, middleCopy, selectedIndex, onChange]);

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="relative overflow-y-scroll no-scrollbar snap-y snap-mandatory"
      style={{
        height: WHEEL_H,
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div style={{ paddingTop: PAD * ITEM_H, paddingBottom: PAD * ITEM_H }}>
        {loopList.map((v, i) => {
          const logical = loop ? ((i % N) + N) % N : i;
          const isSelected = logical === selectedIndex;
          return (
            <div
              key={i}
              className="flex items-center justify-center snap-center select-none"
              style={{
                height: ITEM_H,
                scrollSnapAlign: 'center',
                fontFamily: font,
                color: isSelected ? 'hsl(var(--gold-dark))' : 'hsl(var(--foreground) / 0.55)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: isSelected ? '1.25rem' : '1.05rem',
                letterSpacing: '0.05em',
                transition: 'color 0.15s, font-weight 0.15s',
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
  month: number;
  year: number;
  minYear: number;
  maxYear: number;
  maxDate: Date;
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
    const maxDay = daysInMonth(newMonth, newYear);
    let d = Math.min(newDay, maxDay);
    const candidate = new Date(newYear, newMonth - 1, d);
    if (candidate > maxDate) {
      newYear = maxDate.getFullYear();
      newMonth = maxDate.getMonth() + 1;
      d = Math.min(d, maxDate.getDate());
    }
    onChange(d, newMonth, newYear);
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        aria-hidden
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: `calc(50% - ${ITEM_H / 2}px)`,
          height: ITEM_H,
          borderTop: '1px solid hsl(var(--gold) / 0.6)',
          borderBottom: '1px solid hsl(var(--gold) / 0.6)',
          background: 'linear-gradient(180deg, hsl(var(--gold) / 0.08), hsl(var(--gold) / 0.18), hsl(var(--gold) / 0.08))',
        }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: ITEM_H, background: 'linear-gradient(180deg, hsl(var(--papyrus)) 0%, hsl(var(--papyrus)) 50%, transparent 100%)' }} />
      <div aria-hidden className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: ITEM_H, background: 'linear-gradient(0deg, hsl(var(--papyrus)) 0%, hsl(var(--papyrus)) 50%, transparent 100%)' }} />

      <div className="grid grid-cols-3 gap-0 relative">
        <Wheel
          values={days}
          selectedIndex={dayIdx}
          onChange={(i) => apply(i + 1, month, year)}
          font="'Cinzel', serif"
          loop
        />
        <Wheel
          values={MONTHS_SHORT}
          selectedIndex={monthIdx}
          onChange={(i) => apply(day, i + 1, year)}
          font="'Cinzel', serif"
          loop
        />
        <Wheel
          values={years}
          selectedIndex={yearIdx >= 0 ? yearIdx : years.length - 1}
          onChange={(i) => apply(day, month, years[i])}
          font="'Cinzel', serif"
        />
      </div>
    </div>
  );
}
