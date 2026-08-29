import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES } from '@/lib/flowCountries';
import { countryFlag, countryISO2 } from '@/lib/countryGeo';
import { countryLabel } from '@/lib/countryOptions';
import { useLang, useT } from '@/i18n/LanguageContext';

// ════════════════════════════════════════════════════════════════════════════
// VÝBER KRAJINY, DO KTORÉHO SA DÁ PÍSAŤ
// ────────────────────────────────────────────────────────────────────────────
// Matej 28. 8. 2026: *„výber krajiny musí byť intuitívny, neberie mi keď začnem
// písať slovensko"*.
//
// 🔴 PREČO TO NEBRALO — dva dôvody naraz, a ani jeden sa nedal opraviť v `<select>`:
//   1. Natívny `<select>` hľadá len OD ZAČIATKU popisku a naše položky začínali
//      VLAJKOU („🇸🇰 Slovensko"), takže písanie nemalo čo chytiť.
//   2. Hodnoty sú ANGLICKÉ názvy („Slovakia") — po slovensky by sa nenašli ani bez
//      vlajky.
// Preto je to pole s hľadaním: píše sa doň, zoznam sa filtruje a **hľadá sa naraz
// v lokalizovanom aj anglickom názve**, bez diakritiky. „slov", „slovensko" aj
// „slovakia" nájdu to isté.
//
// ⚠️ ULOŽENÁ HODNOTA OSTÁVA ANGLICKÝ NÁZOV zo `COUNTRIES` — ide do 15. segmentu
//    kódu heroglyfu (`COUNTRY_TO_ISO3`). Lokalizovaný názov je len to, čo vidno.
// ════════════════════════════════════════════════════════════════════════════

/** Bez diakritiky a malými písmenami — „Španielsko" sa má nájsť aj ako „spaniel". */
const fold = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Strop ponuky. Reálna výška je min(tento strop, voľné miesto v okne). */
const MENU_MAX = 244;

/** Krajiny, ktoré vidí SK trh ako prvé, kým sa nezačne písať. */
const FREQUENT = [
  'Slovakia', 'Czech Republic', 'Poland', 'Hungary', 'Austria', 'Germany',
  'United Kingdom', 'United States', 'Ireland', 'France', 'Italy', 'Spain',
];

export interface CountryPickProps {
  /** Anglický názov zo `COUNTRIES`, alebo '' keď nie je vybraté. */
  value: string;
  onChange: (country: string) => void;
  /** Vlastný text v prázdnom poli (inak „Vyber krajinu"). */
  placeholder?: string;
}

export function CountryPick({ value, onChange, placeholder }: CountryPickProps) {
  const { lang } = useLang();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  // Ponuka sa otvára NADOL, kým je pod poľom miesto; inak nahor. Bez toho jej spodok
  // vypadne z okna — blok stojí vo vertikálne vycentrovanej karte, takže „dole" je
  // často 100 px, nie pol obrazovky.
  const [up, setUp] = useState(false);
  const [room, setRoom] = useState(MENU_MAX);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** [anglický názov, čo vidno, vlajka, kľúč na hľadanie] — počíta sa raz na jazyk. */
  const rows = useMemo(() => {
    const rank = new Map(FREQUENT.map((c, i) => [c, i]));
    return COUNTRIES
      .map((name) => {
        const iso = countryISO2(name);
        const label = (iso && countryLabel(iso, lang)) || name;
        return {
          name,
          label,
          flag: countryFlag(name) || '🏳',
          hay: `${fold(label)} ${fold(name)}`,
          rank: rank.has(name) ? (rank.get(name) as number) : 999,
        };
      })
      .sort((a, b) => (a.rank - b.rank) || a.label.localeCompare(b.label, lang));
  }, [lang]);

  const shown = useMemo(() => {
    const needle = fold(q.trim());
    if (!needle) return rows.filter((r) => r.rank < 999);
    // Zhoda na začiatku slova ide pred zhodou uprostred — „Mali" nemá stáť nad „Slovensko",
    // keď človek napíše „sl".
    return rows
      .filter((r) => r.hay.includes(needle))
      .sort((a, b) => {
        const sa = a.hay.startsWith(needle) ? 0 : 1;
        const sb = b.hay.startsWith(needle) ? 0 : 1;
        return sa - sb || a.label.localeCompare(b.label, lang);
      })
      .slice(0, 40);
  }, [rows, q, lang]);

  const current = rows.find((r) => r.name === value);

  // Von klikom mimo alebo Esc — tá istá cesta ako pri paneli psa (lock 28. 8.).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /** Zmeria miesto pod poľom a nad ním — volá sa pri otvorení, nie priebežne. */
  const place = () => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - 14;
    const above = r.top - 14;
    const useUp = below < 150 && above > below;
    setUp(useUp);
    setRoom(Math.max(120, Math.min(MENU_MAX, useUp ? above : below)));
  };

  const pick = (name: string) => {
    onChange(name);
    setQ('');
    setOpen(false);
  };

  return (
    <div className="hf-cpick" ref={wrapRef}>
      <div className={`hf-field hf-cpick-field${value ? ' is-valid' : ''}`}>
        <span className="flag">{current?.flag || '🏳'}</span>
        <input
          ref={inputRef}
          value={open ? q : (current?.label || '')}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => { setQ(''); place(); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && shown.length) { e.preventDefault(); pick(shown[0].name); }
          }}
          /* Po zaostrení je pole prázdne, aby sa dalo rovno písať — ale vybratú
             krajinu treba stále vidieť, inak to vyzerá, že sa voľba stratila.
             Nesie ju teda placeholder (a vlajka vľavo). */
          placeholder={open && current ? current.label : (placeholder || t('heroglyph.flow.dogs.pickCountry'))}
          autoComplete="off"
          spellCheck={false}
          aria-label={t('heroglyph.flow.dogs.nationality')}
        />
      </div>

      {open && (
        <div className={`hf-cpick-menu${up ? ' up' : ''}`} style={{ maxHeight: room }} role="listbox">
          {shown.map((r) => (
            <button
              key={r.name}
              type="button"
              role="option"
              aria-selected={r.name === value}
              className={`hf-cpick-item${r.name === value ? ' on' : ''}`}
              onClick={() => pick(r.name)}
            >
              <span className="flag">{r.flag}</span>
              <span className="lbl">{r.label}</span>
            </button>
          ))}
          {!shown.length && (
            <p className="hf-cpick-empty">{t('heroglyph.flow.dogs.noCountry')}</p>
          )}
        </div>
      )}
    </div>
  );
}
