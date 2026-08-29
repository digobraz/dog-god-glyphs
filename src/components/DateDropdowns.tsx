import { useLang } from '@/i18n/LanguageContext';
// Mapa jazyk → BCP-47 žila tu; vytiahnutá do `@/i18n/bcp47` 2026-08-12,
// keď ju potreboval aj Inbox. Jedna kópia, nie dve.
import { intlLocale } from '@/i18n/bcp47';

function daysInMonth(m: number, y: number): number {
  return new Date(y, m, 0).getDate();
}

// Shared styled <select> wrapper
function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {children}
      {/* chevron */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: 10,
          pointerEvents: 'none',
          color: 'hsl(var(--gold))',
          fontSize: 14,
          lineHeight: 1,
        }}
      >
        ▾
      </span>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none',
  width: '100%',
  height: 44, // h-11
  background: 'hsl(var(--papyrus))',
  border: '1px solid hsl(var(--gold) / 0.5)',
  borderRadius: 12, // rounded-xl
  fontFamily: "'Cinzel', serif",
  fontSize: 13,
  fontWeight: 700,
  textAlign: 'center',
  color: 'hsl(var(--foreground))',
  paddingLeft: 8,
  paddingRight: 24, // space for chevron
  cursor: 'pointer',
  outline: 'none',
};

// ── BLEDÝ ŠAT (Matej 28. 8. 2026: „neupravil si popup pri zadávaní dátumov!") ──
// Vo vstupnom flow stoja tri dátumové rolety v tom istom paneli ako pole na meno,
// takže musia vyzerať ako ono: biele pole, dvojitý zlatý rám, polomer 12 — hodnoty
// sú prevzaté z `.hf-field` v `screens/flowPaleSkin.ts`, nie zvolené nanovo.
// Zapína sa výslovne (`skin="pale"`), aby sa nezmenili obrazovky mimo bledého šatu.
const PALE_SELECT: React.CSSProperties = {
  height: 42,
  background: '#FFFDF7',
  border: '2px solid rgba(179, 130, 45, 0.55)',
  color: 'rgba(35,22,8,0.90)',
};

// ── DateDropdowns (replaces WheelDatePicker) ─────────────────────────────────

export interface DateDropdownsProps {
  day: number;
  month: number;
  year: number;
  minYear: number;
  maxYear: number;
  maxDate: Date;
  onChange: (d: number, m: number, y: number) => void;
  /** 'pale' = bledý šat vstupného flow (`.hf-field`). Bez neho ostáva pôvodný vzhľad. */
  skin?: 'pale';
}

export function DateDropdowns({ day, month, year, minYear, maxYear, maxDate, onChange, skin }: DateDropdownsProps) {
  const { lang } = useLang();
  const boxStyle = skin === 'pale' ? { ...selectStyle, ...PALE_SELECT } : selectStyle;
  const locale = intlLocale(lang);

  const monthName = (m: number) =>
    new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, m - 1, 1));

  const clamp = (newDay: number, newMonth: number, newYear: number) => {
    const maxDay = daysInMonth(newMonth, newYear);
    let d = Math.min(newDay, maxDay);
    const candidate = new Date(newYear, newMonth - 1, d);
    if (candidate > maxDate) {
      newYear = maxDate.getFullYear();
      newMonth = maxDate.getMonth() + 1;
      d = Math.min(d, maxDate.getDate());
    }
    return { d, m: newMonth, y: newYear };
  };

  const handleDay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = Number(e.target.value);
    const { d, m, y } = clamp(newDay, month, year);
    onChange(d, m, y);
  };

  const handleMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = Number(e.target.value);
    const { d, m, y } = clamp(day, newMonth, year);
    onChange(d, m, y);
  };

  const handleYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(e.target.value);
    const { d, m, y } = clamp(day, month, newYear);
    onChange(d, m, y);
  };

  const dim = daysInMonth(month, year);
  const dayOptions = Array.from({ length: dim }, (_, i) => i + 1);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  // Years descending (newest first)
  const yearOptions: number[] = [];
  for (let y = maxYear; y >= minYear; y--) yearOptions.push(y);

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {/* Day */}
      <SelectWrap>
        <select value={day} onChange={handleDay} style={boxStyle} aria-label="Day">
          {dayOptions.map((d) => (
            <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
          ))}
        </select>
      </SelectWrap>

      {/* Month */}
      <SelectWrap>
        <select value={month} onChange={handleMonth} style={boxStyle} aria-label="Month">
          {monthOptions.map((m) => (
            <option key={m} value={m}>{monthName(m)}</option>
          ))}
        </select>
      </SelectWrap>

      {/* Year — newest first */}
      <SelectWrap>
        <select value={year} onChange={handleYear} style={boxStyle} aria-label="Year">
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </SelectWrap>
    </div>
  );
}

// ── YearDropdown (replaces WheelYearPicker) ───────────────────────────────────

export interface YearDropdownProps {
  year: number;
  minYear?: number;
  maxYear?: number;
  onChange: (y: number) => void;
}

export function YearDropdown({ year, minYear = 1930, maxYear = new Date().getFullYear(), onChange }: YearDropdownProps) {
  const yearOptions: number[] = [];
  for (let y = maxYear; y >= minYear; y--) yearOptions.push(y);

  return (
    <SelectWrap>
      <select
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...selectStyle, textAlign: 'center' }}
        aria-label="Year"
      >
        {yearOptions.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </SelectWrap>
  );
}
