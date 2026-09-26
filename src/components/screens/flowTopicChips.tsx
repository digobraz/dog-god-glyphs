import { BRAND_GOLD_BTN } from '@/components/pack/packTheme';

// ════════════════════════════════════════════════════════════════════════════
// PÁS TÉM — chipy nad otázkou na krokoch PODSTATA a MAJITEĽ (26. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 26. 9. ~15:00: *„chipy s kategóriami urobme plnou farbou zlatá so zeleným
// krúžkom a bielym checkmarkom po vyplnení"* a pri majiteľovi *„urob ako essence
// na viac krokov"*. Dva kroky s tým istým pásom = jeden komponent; dve kópie by
// sa rozišli pri prvej úprave.
//
// Stav nesie ZNAČKA vľavo, nie farba chipu: zlato ostáva vždy (konštrukcia —
// „kde som v rámci otázok"), zelený krúžok = hotové, červený = obídené.
// Kde práve stojím, ukazuje PRSTENEC.
// ⚠️ Značky sú kreslené SVG, nie znaky — stráž ikoniek znak ✓ počíta ako ikonku
//    mimo brandu a v rôznych fontoch má rôznu hrúbku.
// ════════════════════════════════════════════════════════════════════════════

export type TopicState = 'done' | 'miss' | 'todo';

export function TopicChips({
  items,
  current,
  onGo,
}: {
  items: { key: string; label: string; state: TopicState }[];
  current: number | null;
  onGo: (i: number) => void;
}) {
  return (
    <div className="ftc-row">
      {items.map((it, i) => (
        <button
          key={it.key}
          type="button"
          className={`ftc-chip ${it.state}${i === current ? ' on' : ''}`}
          onClick={() => onGo(i)}
        >
          <span className="ftc-st" aria-hidden>
            {it.state === 'done' && (
              <svg viewBox="0 0 16 16" width="14" height="14">
                <circle cx="8" cy="8" r="8" fill="#3D7A4E" />
                <path d="M4.4 8.3 6.9 10.7 11.6 5.6" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {it.state === 'miss' && (
              <svg viewBox="0 0 16 16" width="14" height="14">
                <circle cx="8" cy="8" r="8" fill="#B25640" />
                <path d="M8 4.2v4.6" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
                <circle cx="8" cy="11.4" r="1.1" fill="#fff" />
              </svg>
            )}
          </span>
          <span className="ftc-lb">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

export const FLOW_TOPIC_CSS = `
/* Na mobile 2×2, od 560 px jeden rad štyroch (Matej 24. 9.: rad štyroch sa na
   390 px zalamoval podľa dĺžky prekladu). */
.ftc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
@media (min-width: 560px) { .ftc-row { grid-template-columns: repeat(4, 1fr); } }
.ftc-chip {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 30px; padding: 4px 8px; border-radius: 999px; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-weight: 600;
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  background: ${BRAND_GOLD_BTN.grad};
  border: 1px solid ${BRAND_GOLD_BTN.edge};
  color: ${BRAND_GOLD_BTN.ink};
  box-shadow: ${BRAND_GOLD_BTN.glow};
  transition: transform 0.12s ease, box-shadow 0.16s ease;
}
.ftc-chip:hover { background: ${BRAND_GOLD_BTN.gradHover}; }
.ftc-chip:active { transform: scale(0.97); }
/* Miesto pre značku je VŽDY — keby pribudla až po vyplnení, názov by poskočil. */
.ftc-st { flex: 0 0 14px; width: 14px; height: 14px; display: grid; place-items: center; }
.ftc-st svg { display: block; filter: drop-shadow(0 1px 1px rgba(40, 24, 4, 0.35)); }
.ftc-chip.todo .ftc-st { visibility: hidden; }
.ftc-lb { white-space: nowrap; margin-right: -0.08em; }
/* Kde stojím = prstenec okolo zlata (papyrusová medzera + lapisová obruč). */
.ftc-chip.on { box-shadow: 0 0 0 2px #FBF5E6, 0 0 0 4px #16307A, ${BRAND_GOLD_BTN.glow}; }
`;
