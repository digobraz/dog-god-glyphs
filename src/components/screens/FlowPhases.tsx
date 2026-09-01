import { useT } from '@/i18n/LanguageContext';

// ════════════════════════════════════════════════════════════════════════════
// PÁS FÁZ VSTUPNÉHO FLOW — PES → TY → SYMBOL → HOTOVO (31. 8. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Spoločný prvok CELÉHO vstupu, nie ozdoba jednej obrazovky. Preto stojí tu a
// nie vo `WhyScreen.tsx` — šat má `.hf-phases` / `.hf-phase` vo `flowPaleSkin.ts`.
//
// Hovorí KDE SOM, nie koľko mi zostáva:
//  • bez percent (Matej 31. 8.: „ok nie percenta") — na `/why` by svietilo 5 %,
//    teda „nemáš za sebou nič" presne v momente, keď má človek povedať áno,
//    a kroky nie sú rovnako dlhé (výber farby 3 s, výrez fotky 30 s);
//  • bez čísla kroku — dvadsať krokov odrádza a číslo sa mení, ako flow režeme.
//
// ⚠️ NIE JE to dopĺňajúci sa heroglyf. Plátno (heroglyf, ktorý sa vypĺňa pred
//    očami) príde až za checkoutom a je to dramaturgia: bar hovorí *kde som*,
//    plátno *čo vzniká*. Keby bol bar tiež heroglyf, je to jedna vec dvakrát.
//
// Poradie fáz je pevné; obrazovka hovorí len, v ktorej stojí.
const PHASES = [
  'heroglyph.flow.phase.dog',
  'heroglyph.flow.phase.you',
  'heroglyph.flow.phase.symbol',
  'heroglyph.flow.phase.done',
] as const;

interface FlowPhasesProps {
  /** Index fázy, v ktorej obrazovka stojí (0–3). */
  active: number;
}

export function FlowPhases({ active }: FlowPhasesProps) {
  const t = useT();
  return (
    <div className="hf-phases">
      {PHASES.map((key, i) => (
        <span key={key} className={`hf-phase${i === active ? ' on' : ''}`}>
          <i />
          <span>{t(key)}</span>
        </span>
      ))}
    </div>
  );
}
