import { useEffect, useRef, useState, KeyboardEvent, ChangeEvent } from 'react';

function daysInMonth(m: number, y: number) {
  return new Date(y, m, 0).getDate();
}

interface Props {
  day: string; // '' or '01'..'31'
  month: string;
  year: string;
  minYear: number;
  maxYear: number;
  onChange: (day: string, month: string, year: string) => void;
  fontFamily?: string;
}

export function SegmentedDateInput({
  day, month, year, minYear, maxYear, onChange, fontFamily = "'Cinzel', serif",
}: Props) {
  const dRef = useRef<HTMLInputElement>(null);
  const mRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState<'d' | 'm' | 'y' | null>(null);

  const allEmpty = !day && !month && !year;

  // Reconcile day cap whenever month/year complete (e.g. Feb 30 → Feb 28)
  useEffect(() => {
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const m = parseInt(month);
      const y = parseInt(year);
      const d = parseInt(day);
      const max = daysInMonth(m, y);
      if (d > max) {
        onChange(String(max).padStart(2, '0'), month, year);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const sanitizeDay = (raw: string, finalize: boolean) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    if (digits.length === 0) return '';
    if (digits.length === 1) {
      // can't validate yet — allow
      return digits;
    }
    let n = parseInt(digits);
    if (n < 1) n = 1;
    if (n > 31) n = 31;
    // soft cap to month length if month known
    if (month.length === 2 && year.length === 4) {
      const cap = daysInMonth(parseInt(month), parseInt(year));
      if (n > cap) n = cap;
    } else if (month.length === 2) {
      const cap = daysInMonth(parseInt(month), 2000);
      if (n > cap) n = cap;
    }
    return String(n).padStart(2, '0');
  };

  const sanitizeMonth = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    if (digits.length === 0) return '';
    if (digits.length === 1) return digits;
    let n = parseInt(digits);
    if (n < 1) n = 1;
    if (n > 12) n = 12;
    return String(n).padStart(2, '0');
  };

  const sanitizeYear = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length < 4) return digits;
    let n = parseInt(digits);
    if (n < minYear) n = minYear;
    if (n > maxYear) n = maxYear;
    return String(n);
  };

  const handleDay = (e: ChangeEvent<HTMLInputElement>) => {
    const next = sanitizeDay(e.target.value, false);
    onChange(next, month, year);
    if (next.length === 2) mRef.current?.focus();
  };

  const handleMonth = (e: ChangeEvent<HTMLInputElement>) => {
    const next = sanitizeMonth(e.target.value);
    onChange(day, next, year);
    if (next.length === 2) yRef.current?.focus();
  };

  const handleYear = (e: ChangeEvent<HTMLInputElement>) => {
    const next = sanitizeYear(e.target.value);
    onChange(day, month, next);
    if (next.length === 4) yRef.current?.blur();
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    seg: 'd' | 'm' | 'y',
    val: string,
  ) => {
    if (e.key === 'Backspace' && val === '') {
      if (seg === 'm') { e.preventDefault(); dRef.current?.focus(); }
      else if (seg === 'y') { e.preventDefault(); mRef.current?.focus(); }
    }
    if (e.key === 'ArrowLeft' && (e.currentTarget.selectionStart ?? 0) === 0) {
      if (seg === 'm') { e.preventDefault(); dRef.current?.focus(); }
      else if (seg === 'y') { e.preventDefault(); mRef.current?.focus(); }
    }
    if (e.key === 'ArrowRight' && (e.currentTarget.selectionEnd ?? 0) === val.length) {
      if (seg === 'd') { e.preventDefault(); mRef.current?.focus(); }
      else if (seg === 'm') { e.preventDefault(); yRef.current?.focus(); }
    }
  };

  const seg = (
    ref: React.RefObject<HTMLInputElement>,
    value: string,
    placeholder: string,
    maxLength: number,
    onChangeHandler: (e: ChangeEvent<HTMLInputElement>) => void,
    key: 'd' | 'm' | 'y',
    width: string,
  ) => (
    <input
      ref={ref}
      value={value}
      onChange={onChangeHandler}
      onFocus={(e) => { setFocused(key); e.currentTarget.select(); }}
      onBlur={() => setFocused(null)}
      onKeyDown={(e) => handleKeyDown(e, key, value)}
      placeholder={allEmpty ? placeholder : ''}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={maxLength}
      className="bg-transparent outline-none text-center text-foreground placeholder:text-muted-foreground/60 text-base md:text-lg tracking-wider"
      style={{
        fontFamily,
        width,
        borderBottom: focused === key ? '2px solid hsl(var(--gold))' : '2px solid transparent',
        transition: 'border-color 0.15s',
        caretColor: 'hsl(var(--gold))',
      }}
    />
  );

  return (
    <div className="flex items-center justify-center gap-1 bg-card rounded-full px-4 py-2 border border-border/30">
      {seg(dRef, day, 'DD', 2, handleDay, 'd', '2.4ch')}
      <span className="text-muted-foreground/50 select-none" style={{ fontFamily }}>/</span>
      {seg(mRef, month, 'MM', 2, handleMonth, 'm', '2.4ch')}
      <span className="text-muted-foreground/50 select-none" style={{ fontFamily }}>/</span>
      {seg(yRef, year, 'YYYY', 4, handleYear, 'y', '4.4ch')}
    </div>
  );
}
