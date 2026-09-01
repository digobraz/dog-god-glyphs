// MAZANIE V DVOCH KROKOCH — spoločné tlačidlo pre povrchy /pack.
//
// ── PREČO NIE window.confirm ────────────────────────────────────────────────
// Natívny dialóg zablokuje celú stránku (vrátane mapy pod ňou), na mobile vyzerá
// ako systémová chyba a nedá sa oštýlovať do brandu. Dvojkrok robí to isté bez
// modalu: prvý klik prezradí následok, druhý ho vykoná, klik inam ho odvolá.
//
// ── PREČO SPOLOČNÝ KOMPONENT ────────────────────────────────────────────────
// Mazanie pribúda naraz na TROCH miestach (podujatie · inzerát „hľadám partiu" ·
// plánovaný výlet) a všetky tri majú rovnaké riziko: nevratný úkon jedným klikom.
// Tri kópie by sa rozišli v tom, ktorá z nich sa pýta — a práve tá jedna, ktorá
// by sa prestala pýtať, by bola tá, kde to zabolí.
//
// ⚠️ Sám nič nemaže a nič sa nepýta servera — len zavolá `onConfirm()`. Čo presne
// zaniká, vie volajúci; tento súbor len zaručí, že sa to nestane omylom.
import { useEffect, useRef, useState } from 'react';
import { PACK_THEME as T, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';

const DANGER = '#CE4B3C'; // tá istá červená ako HAZARD_RED na mape — jeden význam, jedna farba

export type DeleteButtonProps = {
  /** Text pokojného stavu, napr. „Zmazať podujatie". Nesie ho volajúci, lebo len on vie,
   *  ČO zanikne — „Zmazať" samotné je na nevratnom úkone príliš málo. */
  label: string;
  /** Čo sa naozaj stane. Volá sa až po DRUHOM kliknutí. */
  onConfirm: () => void;
  /** `inline` = riadok v karte (default) · `ghost` = podčiarknutý text bez rámu (detail výletu) */
  variant?: 'inline' | 'ghost';
  /** Doplnková veta v stave otázky — čo všetko so sebou zmazanie vezme. */
  hint?: string;
};

export function DeleteButton({ label, onConfirm, variant = 'inline', hint }: DeleteButtonProps) {
  const t = useT();
  const [armed, setArmed] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Odvolanie: klik mimo alebo Escape. Bez toho by natiahnutá otázka ostala visieť
  // na karte donekonečna a pri ďalšom náhodnom kliku by zmazala.
  useEffect(() => {
    if (!armed) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setArmed(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setArmed(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [armed]);

  // stopPropagation všade: tieto tlačidlá sedia VNÚTRI klikateľných kariet (karta
  // podujatia rozbaľuje popis, karta výletu ho vyberá na mape). Bez toho by klik na
  // „Zmazať" zároveň otvoril detail toho, čo sa práve chystá zaniknúť.
  const stop = (e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); };

  if (!armed) {
    return (
      <div ref={boxRef} className={`pdel pdel--${variant}`}>
        <button
          type="button"
          className="pdel-btn"
          onClick={(e) => { stop(e); setArmed(true); }}
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className={`pdel pdel--${variant} pdel--armed`}>
      <span className="pdel-ask">{hint || t('pack.del.confirm')}</span>
      <div className="pdel-row">
        <button
          type="button"
          className="pdel-yes"
          onClick={(e) => { stop(e); setArmed(false); onConfirm(); }}
        >
          {t('pack.del.yes')}
        </button>
        <button
          type="button"
          className="pdel-no"
          onClick={(e) => { stop(e); setArmed(false); }}
        >
          {t('pack.del.cancel')}
        </button>
      </div>
    </div>
  );
}

/**
 * CSS — injectuje ho POVRCH, nie každé tlačidlo (rovnaká úvaha ako EVENT_CARD_CSS:
 * pri zozname N kariet by opakovaný <style> bol zbytočný).
 *
 * Farebne je to jediný červený prvok na tmavej karte, a to zámerne: nevratný úkon
 * nemá splynúť so zvyškom. V pokojnom stave je ale len tlmený text — kým sa ho
 * nikto nedotkne, nemá kartu ovládať.
 */
export const DELETE_BUTTON_CSS = `
.pdel{margin-top:10px;}
.pdel--ghost{margin-top:8px;}
.pdel-btn{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${T.onDarkDim};background:transparent;border:0;padding:4px 0;cursor:pointer;transition:color .15s;}
.pdel-btn:hover{color:${DANGER};}
.pdel--armed{padding:9px 11px;border-radius:10px;border:1px solid rgba(206,75,60,0.45);background:rgba(206,75,60,0.10);}
.pdel-ask{display:block;font-family:${FONT_UI};font-size:11.5px;line-height:1.45;color:${T.onDark};margin-bottom:8px;}
.pdel-row{display:flex;gap:7px;}
.pdel-yes,.pdel-no{font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:6px 12px;border-radius:999px;cursor:pointer;}
.pdel-yes{background:${DANGER};border:1px solid ${DANGER};color:#fff;}
.pdel-no{background:transparent;border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};}
.pdel-no:hover{color:${T.onDark};}
/* GHOST — v svetlom/detailovom kontexte, kde tmavé tokeny nesedia. Rám aj v pokoji,
   lebo tam tlačidlo nestojí v karte a bez rámu by sa stratilo. */
.pdel--ghost .pdel-btn{border:1px solid ${T.onDarkBorder};border-radius:999px;padding:6px 12px;}
.pdel--ghost .pdel-btn:hover{border-color:${DANGER};}
`;

export default DeleteButton;
