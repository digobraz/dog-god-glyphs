import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBlockAutocorrect } from '@/hooks/useBlockAutocorrect';

// ════════════════════════════════════════════════════════════════════════════
// ZADANIE MENA NA TELEFÓNE — JEDEN MODAL PRE CELÝ VSTUP (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// 🔑 PREČO SA SEM PRESŤAHOVAL. Ten istý modal stál doslovne DVAKRÁT: v
//    `NameScreen.tsx` (meno psa) a v `OwnerInfoScreen.tsx` (meno majiteľa) —
//    160 riadkov vrátane celého hárku `.name-modal-*`. Obrazovka MAJITEĽ by
//    bola tretia kópia, a tri kópie jedného prvku znamenajú, že oprava
//    klávesnice na iOS sa urobí na jednom mieste a na dvoch ostane chyba.
//    Text komponentu sa PRESUNUL, nie prepísal — správanie je zhodné.
//
// ⚠️ TRIEDY OSTÁVAJÚ `.name-modal-*`. Nepremenoval som ich: hárok je vnútri
//    tohto súboru a je jedno, ako sa volá, ale `NameScreen` ich má v svojich
//    testoch aj v nákresoch a premenovanie by bol diff bez úžitku.
//
// ⚠️ `OwnerInfoScreen.tsx` (LIVE vstup) si svoju kópiu NECHÁVA — lock
//    „do FLIPu sa LIVE nedotýkame". Zmizne s ňou, keď sa flipne nový vstup.
//
// Dve veci, na ktorých to na iOS stojí (pôvodná poznámka, nezmenená):
//  1) Klávesnica nasadne len vtedy, keď `input.focus()` beží SYNCHRÓNNE vnútri
//     ťuknutia na prvok, ktorý UŽ JE v DOM — preto je input stále pripojený a
//     spúšťač ho zaostruje cez `ref`.
//  2) Karta sa centruje vo `visualViewport`, teda v tom, čo ostalo nad
//     klávesnicou — inak visí hore alebo sa schová za ňu.
// ════════════════════════════════════════════════════════════════════════════

// Android klávesnice (Gboard/Samsung) ignorujú `autoCorrect="off"` a vedia ticho
// vymeniť napísané slovo za predikciu (BELGA → BELGICKO). Zastaviť sa to z webu
// nedá, takže na Androide vypisujeme presnú zachytenú hodnotu pod pole — človek
// vidí, čo sa naozaj zapečie do heroglyfu. iOS a desktop atribúty rešpektujú.
const IS_ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

export interface FlowTextModalProps {
  open: boolean;
  value: string;
  placeholder: string;
  title: string;
  doneLabel: string;
  closeLabel: string;
  rootRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (v: string) => void;
  onDone: () => void;
  onClose: () => void;
  /**
   * Meno poľa pre prehliadač. Rozhoduje, čo ponúkne autofill: pri `dogName` nemá
   * čo ponúknuť (a to chceme), pri mene človeka by kontakty vyskočili tiež — obe
   * polia preto ostávajú `autoComplete="off"` a názov je len rozlíšenie.
   */
  fieldName?: string;
}

export function FlowTextModal({
  open, value, placeholder, title, doneLabel, closeLabel,
  rootRef, inputRef, onChange, onDone, onClose, fieldName = 'dogName',
}: FlowTextModalProps) {
  useBlockAutocorrect(inputRef);
  // Sledujeme visual viewport, aby karta ostala vycentrovaná nad klávesnicou.
  const [vp, setVp] = useState<{ top: number; height: number }>({ top: 0, height: 0 });
  useEffect(() => {
    const v = window.visualViewport;
    const update = () => {
      if (v) setVp({ top: v.offsetTop, height: v.height });
      else setVp({ top: 0, height: window.innerHeight });
    };
    update();
    v?.addEventListener('resize', update);
    v?.addEventListener('scroll', update);
    return () => {
      v?.removeEventListener('resize', update);
      v?.removeEventListener('scroll', update);
    };
  }, []);

  const canDone = value.trim().length >= 1;

  return createPortal(
    <div
      ref={rootRef}
      className={`name-modal-root ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      style={{ top: vp.top, height: vp.height || undefined }}
    >
      <div className="name-modal-backdrop" onClick={onClose} />
      <div className="name-modal-card">
        <button type="button" className="name-modal-close" aria-label={closeLabel} onClick={onClose}>✕</button>
        <p className="name-modal-title">{title}</p>
        <div className="name-modal-inputwrap">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 30))}
            onKeyDown={(e) => { if (e.key === 'Enter' && canDone) onDone(); }}
            placeholder={placeholder}
            maxLength={30}
            enterKeyHint="done"
            /* Žiadne návrhy z kontaktov — ani pre psa, ani pre človeka. */
            name={fieldName}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            className="name-modal-input"
          />
        </div>
        {IS_ANDROID && value.trim().length > 0 && (
          <p className="name-modal-confirm" aria-live="polite">→ <b>{value.trim()}</b></p>
        )}
        <button type="button" className="name-modal-done" onClick={onDone} disabled={!canDone}>{doneLabel}</button>
      </div>

      <style>{`
        .name-modal-root {
          position: fixed; left: 0; right: 0; z-index: 2100;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding-left: 16px; padding-right: 16px;
          opacity: 0; pointer-events: none;
          transition: opacity 160ms ease;
        }
        .name-modal-root.is-open { opacity: 1; pointer-events: auto; }
        .name-modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.78);
          -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
        }
        .name-modal-card {
          position: relative; z-index: 1; width: 100%; max-width: 520px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(201, 154, 63, 0.55); border-radius: 16px;
          padding: 22px 16px 16px; box-shadow: 0 20px 64px rgba(0, 0, 0, 0.65);
          display: flex; flex-direction: column; gap: 14px;
          transition: transform 220ms cubic-bezier(0.2, 0.8, 0.3, 1.1);
          transform: translateY(8px) scale(0.97);
        }
        .name-modal-root.is-open .name-modal-card { transform: translateY(0) scale(1); }
        .name-modal-close {
          position: absolute; top: 12px; right: 14px;
          background: none; border: none; cursor: pointer; font-size: 14px;
          color: rgba(0, 0, 0, 0.4); line-height: 1; padding: 4px;
          transition: color 150ms ease;
        }
        .name-modal-close:hover { color: rgba(0, 0, 0, 0.75); }
        .name-modal-title {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 1rem;
          text-align: center; color: hsl(var(--gold-dark)); margin: 0; padding: 0 20px;
        }
        /* Statický modrý podsvietený rám — popup (a neskôr polia vstupu). Bez pohybu. */
        .name-modal-inputwrap { position: relative; border-radius: 12px; }
        .name-modal-input {
          position: relative; z-index: 1;
          width: 100%; background: #FFFDF7; border-radius: 12px;
          padding: 14px 16px; color: #1a1208; outline: none;
          border: 2px solid rgba(47, 107, 255, 0.45);
          box-shadow: 0 0 12px rgba(47, 107, 255, 0.28);
          /* 16 px zabráni automatickému priblíženiu na iOS */
          font-size: 16px; font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase; text-align: center; letter-spacing: 0.05em;
        }
        .name-modal-input::placeholder { text-transform: none; letter-spacing: normal; color: rgba(0, 0, 0, 0.35); }
        /* Výpis presnej hodnoty len na Androide (poistka proti predikcii). */
        .name-modal-confirm {
          margin: -4px 0 0; text-align: center;
          font-family: 'Space Grotesk', sans-serif; font-size: 13px;
          color: rgba(26, 18, 8, 0.6); letter-spacing: 0.03em;
        }
        .name-modal-confirm b {
          color: hsl(var(--gold-dark)); font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .name-modal-done {
          width: 100%; height: 46px; border: none; border-radius: 12px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.85rem;
          letter-spacing: 0.12em; text-transform: uppercase; color: #000;
          /* Zhodné s hlavným CTA vstupu (POKRAČOVAŤ na kroku 2) — zlato, nie oranžová. */
          background: linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35);
          transition: opacity 150ms ease, transform 150ms ease;
        }
        .name-modal-done:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
        .name-modal-done:not(:disabled):active { transform: scale(0.97); }
      `}</style>
    </div>,
    document.body,
  );
}
