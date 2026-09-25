import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_R } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';

// ════════════════════════════════════════════════════════════════════════════
// PANEL V DOSKE — „popup" veľký presne ako blok (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026 nad pokladňou: *„kam idú peniaze a čo dostaneš musíme
// urobiť pekný popup nie takýto obyčajný… popup bude v tej istej veľkosti ako
// celý blok… položky budú pekne pod sebou v klikacích blokoch, iba obrázok/logo
// a nadpis, po kliku sa zobrazí popis"* + predloha z Canvy (skupiny s nadpisom,
// pod nimi pilulky s logom).
//
// 🔑 PREČO NIE PORTÁL NAD OKNOM. Panel leží NAD obsahom dosky (`position:
//    absolute; inset: 0` v `.hf-plate`), takže má jej rozmer aj jej zlatý rám —
//    človek neodchádza z miesta, kde je, len sa mu doska „otočí".
//    ⚠️ Rodič musí mať `position: relative` (`.hf-plate` v pokladni ho má).
//
// 🔑 BLOK = `.hf-pick` z rytiny (ikonka v pečatnej jamke VEDĽA textu), nie nový
//    tvar. Otvorený blok svieti zlatým okrajom — je to „kde som", nie voľba.
// ════════════════════════════════════════════════════════════════════════════

export interface PanelItem {
  key: string;
  /** Kresba z brand kitu (cesta alebo import). */
  icon: string;
  title: string;
  desc: string;
  /** Pravý okraj bloku — napr. suma pri rozpise peňazí. */
  aside?: ReactNode;
  /** Pripravujeme — tlmené. */
  soon?: boolean;
}
export interface PanelGroup { heading?: string; items: PanelItem[] }

export function FlowPanel({
  title, groups, footer, closeLabel, onClose,
}: {
  title: string;
  groups: PanelGroup[];
  footer?: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  // Zatvorí sa aj ťukom VEDĽA panela a klávesom Esc (Matej 25. 9. 2026: *„pri
  // otvorení popupov sa bude dať zrušiť aj kliknutím vedľa"*). Panel prekrýva
  // celú dosku, takže „vedľa" = mimo dosky. `pointerdown` a nie `click`: ťuk,
  // ktorý panel otvoril, už dobehol a nezavrie ho hneď späť.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('keydown', key);
    };
  }, [onClose]);
  return (
    <motion.div
      ref={ref}
      className="fp-panel"
      role="dialog"
      aria-label={title}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <p className="hf-legend">{title}</p>
      <div className="fp-scroll">
        {groups.map((g, gi) => (
          <div key={gi} className="fp-group">
            {g.heading && <p className="fp-head">{g.heading}</p>}
            {g.items.map((it) => {
              const on = open === it.key;
              return (
                <div key={it.key} className={`fp-item${on ? ' on' : ''}${it.soon ? ' soon' : ''}`}>
                  <button
                    type="button"
                    className="hf-pick fp-pick"
                    aria-expanded={on}
                    onClick={() => setOpen(on ? null : it.key)}
                  >
                    <span className="well"><img src={it.icon} alt="" /></span>
                    <span className="tx">{it.title}</span>
                    {it.aside && <span className="fp-aside">{it.aside}</span>}
                    <svg className="fp-chev" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 9 L12 15 L18 9" fill="none" stroke="currentColor" strokeWidth="2.4"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        className="fp-desc"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {it.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
        {footer && <p className="fp-foot">{footer}</p>}
      </div>
      <button type="button" className="hf-cta" onClick={onClose}>{closeLabel}</button>
    </motion.div>
  );
}

export const FLOW_PANEL_CSS = `
.fp-panel {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column; gap: 12px;
  padding: 18px 22px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 55%, #EAD7A8 100%);
}
.fp-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.fp-group { display: flex; flex-direction: column; gap: 8px; }
.fp-head {
  margin: 0; text-align: center;
  font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase; color: ${LAB.inkMuted};
}
.fp-pick .well img { width: 22px; height: 22px; object-fit: contain; }
.fp-pick .tx { flex: 1 1 auto; }
.fp-aside {
  flex: 0 0 auto; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; color: ${LAB.ink};
}
.fp-chev { flex: 0 0 auto; width: 16px; height: 16px; color: ${LAB.goldInk}; transition: transform 180ms ease; }
.fp-item.on .fp-pick { border-color: ${LAB.goldInk}; }
.fp-item.on .fp-chev { transform: rotate(180deg); }
.fp-item.soon .fp-pick { opacity: .6; }
.fp-desc {
  margin: 0; overflow: hidden; padding: 8px 12px 0 56px;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45; color: ${LAB.inkBody};
}
.fp-foot {
  margin: 4px 0 0; text-align: center;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px; line-height: 1.5;
  letter-spacing: 0.02em; text-transform: uppercase; color: ${LAB.inkSoft};
}
.fp-panel .hf-cta:focus-visible { outline: 2px solid ${LAPIS.edge}; outline-offset: 2px; }
.fp-pick { border-radius: ${PACK_R.tile}px; }
`;
