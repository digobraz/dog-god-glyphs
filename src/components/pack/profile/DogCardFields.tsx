// Psia karta — atómy polí (zadanie-psia-karta-2026-07-25). Zdieľané editorom
// (PackProfile.tsx, editable) aj read-profilom (PublicProfile.tsx, read-only).
//
// Dizajnové pravidlá, ktoré tieto atómy vynucujú:
//  • SEMAFOR len na kompatibilitu/riziko. Neutrálne vlastnosti (energia, veľkosť)
//    idú cez SelectRow — vysoká energia nie je „červená".
//  • OTVORENÁ OTÁZKA namiesto steny chipov (Matej 2026-07-25): vybrané položky
//    sú chips, návrhy sú tlmené pills pod inputom a po kliknutí sa presunú
//    hore. Vlastný text sa píše priamo. Vizuálne to zaberie zlomok miesta.
//  • Sub-sekcie sú zbalené a nesú counter — 45 polí naraz nikto nevyplní.
import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME } from '@/components/pack/packTheme';
import { TRAFFIC_OPTIONS, TRAFFIC_COLORS, type TaxonomyOption, type TrafficLight } from './packProfile';

const T = PACK_THEME;

const TRAFFIC_COLOR: Record<TrafficLight, string> = TRAFFIC_COLORS;

const labelStyle: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: 12,
  color: T.inkDim,
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontSize: 9,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: T.inkFaint,
};

/**
 * Zbaliteľná sub-sekcia s counterom vyplnenosti. Default zbalená (`defaultOpen`).
 * V read móde (`editable=false`) sa prázdna sekcia nerenderuje vôbec a counter
 * zmizne — je to pomôcka pre majiteľa pri vypĺňaní, cudzí viewer nemá vidieť
 * ani prázdne bloky, ani „0/6".
 */
export function SubSection({
  title, filled, total, defaultOpen = false, editable = true, children,
}: {
  title: string;
  filled: number;
  total: number;
  defaultOpen?: boolean;
  editable?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!editable && filled === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-2.5 w-full pf-subsection${open ? ' is-open' : ''}`}
        style={{ borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ ...sectionLabelStyle, fontSize: 10.5, letterSpacing: '0.16em', color: T.inkStrong }}>{title}</span>
        {editable && (
          <span className={`pf-subsection-badge${filled > 0 ? ' is-filled' : ' is-empty'}`}>
            {filled}/{total}
          </span>
        )}
        <span className="flex-1" />
        <span className="pf-subsection-chevron">
          <ChevronDown
            className="h-3.5 w-3.5"
            style={{ color: T.inkWarm, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </span>
      </button>
      {open && <div style={{ marginTop: 10, padding: '0 2px' }}>{children}</div>}
    </div>
  );
}

/**
 * Grid-wrapper. Default sa dropdowny lámu samy (auto-fit), `cols` vynúti pevný
 * počet stĺpcov — ZÁKLAD chce tri polia v jednom riadku (Matej 3. kolo).
 */
export function FieldGrid({ cols, template, children }: {
  cols?: number;
  template?: string; // presné gridTemplateColumns — polia s rôznou prirodzenou šírkou
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          template ?? (cols ? `repeat(${cols}, minmax(0, 1fr))` : 'repeat(auto-fit, minmax(140px, 1fr))'),
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Label + natívny select. `value === undefined` → placeholder „—".
 * `toneOf` mapuje hodnotu na farbu — vybraná hodnota potom nesie farbu odpovede
 * (Matej 3. kolo). Emoji v labeli nesie tú istú informáciu aj v natívnom
 * <select> popupe, kam CSS nedosiahne.
 */
export function SelectRow<V extends string>({
  label, value, options, editable, toneOf, onChange,
}: {
  label: string;
  value: V | undefined;
  options: TaxonomyOption<V>[];
  editable: boolean;
  toneOf?: (v: V) => string | undefined;
  onChange: (v: V | undefined) => void;
}) {
  const tone = value && toneOf ? toneOf(value) : undefined;
  // Bez `toneOf` (SIZE, CAME FROM, FITNESS, …) select nenesie sémantickú farbu
  // odpovede — ale vyplnený vs prázdny musí byť vidno na prvý pohľad, inak sa
  // vyplnené polia strácajú v hromade prázdnych (Matej 2026-07-29: „tie ktoré
  // sa nevyfarbia ako pills musíme vyfarbiť zelenou = na prvý pohľad jasné čo
  // je vyplnené"). Zelená = DONE stav, rovnaká sémantika ako `growGreen` inde
  // v appke (walked trip). Sémantický `tone` (semafor) má prednosť, nemieša sa.
  const doneColor = !tone && value ? T.growGreen : undefined;
  const activeColor = tone ?? doneColor;
  const t = useT();
  const optLabel = (o: TaxonomyOption<V>) => {
    const key = `pack.dogCard.opt.${o.value}`;
    const translated = t(key);
    const text = translated === key ? o.labelEN : translated;
    return o.emoji ? `${o.emoji} ${text}` : text;
  };

  if (!editable) {
    if (!value) return null;
    const found = options.find((o) => o.value === value);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ ...sectionLabelStyle, fontSize: 8.5 }}>{label}</span>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5,
            color: tone ?? T.ink, fontWeight: tone ? 600 : 400,
          }}
        >
          {found ? optLabel(found) : value}
        </span>
      </div>
    );
  }

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ ...sectionLabelStyle, fontSize: 8.5 }}>{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || undefined) as V | undefined)}
        className={activeColor ? undefined : 'pf-field'}
        style={{
          // Tónovaná/DONE hodnota je sémantický signál — nesmie ju prebiť
          // papyrusová `.pf-field` výplň, preto ide mimo triedy.
          background: activeColor ? `${activeColor}1F` : undefined,
          border: activeColor ? `1px solid ${activeColor}` : undefined,
          borderRadius: 8,
          padding: '5px 8px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
          fontWeight: activeColor ? 600 : 400,
          color: value ? (activeColor ?? T.ink) : T.inkFaint, width: '100%',
        }}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{optLabel(o)}</option>
        ))}
      </select>
    </label>
  );
}

/** Label + číslo s jednotkou (váha, výška, dávky). */
export function NumberRow({
  label, value, unit, min, max, editable, onChange,
}: {
  label: string;
  value: number | undefined;
  unit?: string;
  min?: number;
  max?: number;
  editable: boolean;
  onChange: (v: number | undefined) => void;
}) {
  if (!editable) {
    if (value == null) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ ...sectionLabelStyle, fontSize: 8.5 }}>{label}</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: T.ink }}>
          {value}{unit ? ` ${unit}` : ''}
        </span>
      </div>
    );
  }
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ ...sectionLabelStyle, fontSize: 8.5 }}>{label}{unit ? ` (${unit})` : ''}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(e) => {
          const n = e.target.value === '' ? undefined : Number(e.target.value);
          onChange(n != null && Number.isFinite(n) ? n : undefined);
        }}
        className="pf-field"
        style={{
          borderRadius: 8,
          padding: '5px 8px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
          color: T.ink, width: '100%',
        }}
      />
    </label>
  );
}

/**
 * Kastrácia ako dvojica pills s farebnou logikou (Matej 3. kolo):
 *   pes  — nekastrovaný = PLNÁ modrá   · kastrovaný = OUTLINE modrá
 *   fena — nekastrovaná = PLNÁ ružová  · kastrovaná = OUTLINE ružová
 * Farbu nesie pohlavie, výplň nesie stav. Neznáme pohlavie → brand zlatá.
 * Nevybraná pill ostáva neutrálna, aby bola vidieť odpoveď na prvý pohľad.
 */
export const NEUTER_MALE = '#2E5FD0';   // Egyptian blue (PACK_THEME.partHek)
export const NEUTER_FEMALE = '#C4577E'; // tlmená ružová — ladí s papyrusom

export function NeuterPills({
  label, value, sex, editable, onChange,
}: {
  label: string;
  value: 'yes' | 'no' | undefined;
  sex: 'male' | 'female' | null;
  editable: boolean;
  onChange: (v: 'yes' | 'no' | undefined) => void;
}) {
  const t = useT();
  const tone = sex === 'male' ? NEUTER_MALE : sex === 'female' ? NEUTER_FEMALE : T.accentGold;
  if (!editable && !value) return null;
  const opts: Array<{ v: 'no' | 'yes'; key: string; filled: boolean }> = [
    { v: 'no', key: 'pack.dogCard.opt.no', filled: true },   // nekastrovaný = plná
    { v: 'yes', key: 'pack.dogCard.opt.yes', filled: false }, // kastrovaný = outline
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ ...sectionLabelStyle, fontSize: 8.5 }}>{label}</span>
      <div className="flex gap-1.5" style={{ whiteSpace: 'nowrap' }}>
        {opts.map((o) => {
          const active = value === o.v;
          if (!editable && !active) return null;
          const translated = t(o.key);
          // Aktívna pill nesie sémantickú farbu pohlavia (modrá/ružová) — mimo
          // `.pf-field` triedy, tá platí len na neutrálnu neaktívnu pill.
          return (
            <button
              key={o.v}
              type="button"
              aria-pressed={active}
              onClick={editable ? () => onChange(active ? undefined : o.v) : undefined}
              className={active ? undefined : 'pf-field'}
              style={{
                background: active ? (o.filled ? tone : 'transparent') : undefined,
                border: active ? `1.5px solid ${tone}` : undefined,
                borderRadius: 999, padding: '3px 10px',
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 11,
                fontWeight: active ? 600 : 500,
                color: active ? (o.filled ? '#FFFBF2' : tone) : T.inkDim,
                cursor: editable ? 'pointer' : 'default',
              }}
            >
              {translated === o.key ? o.v : translated}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Label + dátum (narodenie, kastrácia, posledné hárane). */
export function DateRow({
  label, value, editable, onChange,
}: {
  label: string;
  value: string | undefined;
  editable: boolean;
  onChange: (v: string | undefined) => void;
}) {
  if (!editable) {
    if (!value) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ ...sectionLabelStyle, fontSize: 8.5 }}>{label}</span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: T.ink }}>{value}</span>
      </div>
    );
  }
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ ...sectionLabelStyle, fontSize: 8.5 }}>{label}</span>
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="pf-field"
        style={{
          borderRadius: 8,
          padding: '5px 8px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
          color: value ? T.ink : T.inkFaint, width: '100%',
        }}
      />
    </label>
  );
}

/** Semafor legenda — bez nej si každý vyloží farby inak. */
export function TrafficLegend() {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ marginBottom: 8 }}>
      {TRAFFIC_OPTIONS.map((o) => {
        const key = `pack.dogCard.traffic.${o.value}`;
        const translated = t(key);
        return (
          <span key={o.value} className="inline-flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: TRAFFIC_COLOR[o.value] }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: T.inkFaint }}>
              {translated === key ? o.labelEN : translated}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** Jeden semafor riadok — label vľavo, tri bodky vpravo. */
export function TrafficRow({
  label, value, indent, editable, onChange,
}: {
  label: string;
  value: TrafficLight | undefined;
  indent?: boolean;
  editable: boolean;
  onChange: (v: TrafficLight | undefined) => void;
}) {
  const t = useT();
  if (!editable && !value) return null;
  return (
    <div
      className="flex items-center gap-2"
      style={{ padding: '3px 0', paddingLeft: indent ? 12 : 0 }}
    >
      <span style={{ ...labelStyle, flex: 1, fontSize: indent ? 11.5 : 12 }}>{label}</span>
      <span className="flex items-center gap-1.5">
        {TRAFFIC_OPTIONS.map((o) => {
          const active = value === o.value;
          if (!editable && !active) return null;
          const trafficKey = `pack.dogCard.traffic.${o.value}`;
          const trafficLabel = t(trafficKey);
          return (
            <button
              key={o.value}
              type="button"
              aria-label={trafficLabel === trafficKey ? o.labelEN : trafficLabel}
              aria-pressed={active}
              onClick={editable ? () => onChange(active ? undefined : o.value) : undefined}
              style={{
                width: 16, height: 16, borderRadius: '50%', padding: 0,
                background: active ? TRAFFIC_COLOR[o.value] : 'transparent',
                border: `1.5px solid ${active ? TRAFFIC_COLOR[o.value] : T.border}`,
                opacity: active || !editable ? 1 : 0.4,
                cursor: editable ? 'pointer' : 'default',
                transition: 'opacity 0.15s, background 0.15s',
              }}
            />
          );
        })}
      </span>
    </div>
  );
}

/** Multi-select pills — použité pre kŕmenie a povahu. */
export function ChipMulti({
  options, selected, editable, i18nPrefix, max, onToggle,
}: {
  options: readonly string[];
  selected: string[];
  editable: boolean;
  i18nPrefix: string;
  max?: number;
  onToggle: (v: string) => void;
}) {
  const t = useT();
  if (!editable && selected.length === 0) return null;
  const shown = editable ? options : options.filter((o) => selected.includes(o));
  const atMax = max != null && selected.length >= max;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((opt) => {
        const isSelected = selected.includes(opt);
        const blocked = editable && atMax && !isSelected;
        const key = `${i18nPrefix}.${opt}`;
        const translated = t(key);
        return (
          <button
            key={opt}
            type="button"
            onClick={editable && !blocked ? () => onToggle(opt) : undefined}
            disabled={blocked}
            className={`pf-pill${isSelected ? ' is-selected' : ''}`}
            style={{
              borderRadius: 999, padding: '3px 9px',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 11,
              fontWeight: isSelected ? 600 : 500,
              cursor: editable && !blocked ? 'pointer' : 'default',
            }}
          >
            {translated === key ? opt.replace(/_/g, ' ') : translated}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Otvorená otázka — vybrané chips + input pre vlastný text + tlmené návrhy.
 *
 * Hodnota je BUĎ kľúč zo `suggestions` (preloží sa cez `i18nPrefix`), ALEBO
 * vlastný text. Rozlišuje sa členstvom v `suggestions` — deterministické,
 * nepotrebuje prefixy ani druhý stĺpec.
 */
export function OpenQuestion({
  question, values, suggestions, i18nPrefix, editable, placeholder, tone, onChange,
}: {
  question: string;
  values: string[];
  suggestions: readonly string[];
  i18nPrefix: string;
  editable: boolean;
  placeholder?: string;
  tone?: 'gold' | 'danger'; // 'danger' = „čo nemá rád" — vybrané pills sú červené
  onChange: (next: string[]) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState('');
  const chipBg = tone === 'danger' ? T.alertRed : T.accentGold;
  const chipInk = tone === 'danger' ? '#FFFBF2' : '#1F1A0E';

  const label = (v: string) => {
    if (!suggestions.includes(v)) return v; // vlastný text — zobraz doslova
    const key = `${i18nPrefix}.${v}`;
    const translated = t(key);
    return translated === key ? v.replace(/_/g, ' ') : translated;
  };

  const add = (v: string) => {
    const clean = v.trim();
    if (!clean || values.includes(clean)) return;
    onChange([...values, clean]);
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  if (!editable && values.length === 0) return null;
  const unused = suggestions.filter((s) => !values.includes(s));

  return (
    <div style={{ marginTop: 12 }}>
      <span style={{ ...sectionLabelStyle, display: 'block', marginBottom: 7 }}>{question}</span>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5" style={{ marginBottom: editable ? 7 : 0 }}>
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1"
              style={{
                background: chipBg, border: `1px solid ${chipBg}`, borderRadius: 999,
                padding: '3px 6px 3px 9px', fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 11, fontWeight: 600, color: chipInk,
              }}
            >
              {label(v)}
              {editable && (
                <button
                  type="button"
                  onClick={() => remove(v)}
                  aria-label={t('pack.profileCard.removeTag', { tag: label(v) })}
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
                >
                  <X className="h-3 w-3" style={{ color: chipInk, opacity: 0.6 }} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {editable && (
        <>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); add(draft); setDraft(''); }
            }}
            onBlur={() => { if (draft.trim()) { add(draft); setDraft(''); } }}
            placeholder={placeholder}
            className="pf-field"
            style={{
              width: '100%', borderRadius: 8,
              padding: '6px 10px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
              color: T.ink,
            }}
          />
          {unused.length > 0 && (
            <div className="flex flex-wrap gap-1" style={{ marginTop: 6 }}>
              {unused.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  style={{
                    background: 'transparent', border: `1px dashed ${T.border}`, borderRadius: 999,
                    padding: '2px 8px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5,
                    color: T.inkFaint, cursor: 'pointer',
                  }}
                >
                  + {label(s)}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
