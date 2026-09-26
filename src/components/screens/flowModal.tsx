import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ════════════════════════════════════════════════════════════════════════════
// POPUP CEZ CELÉ OKNO — jeden rám pre všetky okná pokladne (26. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 26. 9. 2026: *„urob túto stránku (zadržanie) do popupu ako je aj
// viac info"*. Pokladňa má dnes tri okná (ZADRŽANIE, VIAC INFO, KAM IDÚ
// PENIAZE) — nevadí, kým majú JEDEN rám a nikdy sa nevrstvia na seba.
//
// 🔑 Závoj stmaví celé okno (aj lištu a pečať), v strede leží rytá doska
//    (`hf-block hf-carved` + `hf-plate` z FLOW_CARVE_CSS — nie nový tvar).
//    Na mobile (≤ 600 px) je to šuplík zdola, bližšie k palcu.
// 🔑 Zatvára sa ťukom na závoj a klávesom Esc. `pointerdown` na závoji, nie
//    `click` kdekoľvek — ťuk, ktorý okno otvoril, ho hneď nezavrie.
// 🔑 Keď sa obsah nezmestí, roluje sa VNÚTRI dosky, stránka pod ním stojí.
// ════════════════════════════════════════════════════════════════════════════

export function FlowModal({
  open, onClose, label, children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="fm"
          className="fm-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="fm-veil" aria-hidden onPointerDown={onClose} />
          <motion.div
            className="fm-box hf-block hf-carved"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.24 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            <div className="hf-plate fm-plate">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export const FLOW_MODAL_CSS = `
.fm-root { position: fixed; inset: 0; z-index: 70; display: flex; align-items: center; justify-content: center; padding: 16px; }
.fm-veil { position: absolute; inset: 0; background: rgba(8, 6, 4, 0.72); }
.fm-box.hf-block { position: relative; width: min(600px, 100%); max-height: calc(100dvh - 32px); display: flex; flex-direction: column; margin: 0; }
.fm-box .fm-plate { overflow-y: auto; overscroll-behavior: contain; min-height: 0; }
@media (max-width: 600px) {
  .fm-root { align-items: flex-end; padding: 8px; }
  .fm-box.hf-block { max-height: calc(100dvh - 16px); }
}
`;
