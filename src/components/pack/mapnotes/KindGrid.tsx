// MRIEŽKA DRUHOV — emoji A NÁZOV, jeden zdroj pre dva povrchy.
//
// Matej 2026-08-23 (test kroku 2 na telefóne): „označiť parkovisko je ok ale další krok je
// nebezpečenstvo a človek nevie čo može označiť, nevidí možnosti… musia byť ihned viditelne
// nie schované že najprv vyber bod a potom tam daj niečo čo ani nevieš čo je".
//
// Deväť hrozieb bolo doteraz vidieť až v paneli PO umiestnení bodu, a aj tam len ako holé
// emoji v kruhoch (názov mal iba `title`, ktorý na dotykovom displeji neexistuje). 🕷️ môže
// byť pavúk aj kliešť, ⚠️ nepovie nič — hádanka pred zápisom, nie ponuka.
//
// Prečo vlastný komponent a nie kópia na oboch miestach: sprievodca výletu ponúka druhy PRED
// ťuknutím do mapy, panel zápisu ich ponúka PO ňom. Sú to dva okamihy tej istej voľby — keby
// mal každý vlastnú mriežku, rozišli by sa pri prvom pridanom druhu (a druhy pribúdajú, viď
// `GROUP_KINDS`).
import { PACK_THEME as T, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import type { NoteKind } from './mapNotesData';
import { FONT_EMOJI, threatEmoji } from './markEmoji';

export function KindGrid({
  kinds,
  selected,
  tint,
  onPick,
  row,
}: {
  kinds: NoteKind[];
  /** null = zatiaľ nič nevybrané (sprievodca pred ťuknutím do mapy) */
  selected?: NoteKind | null;
  /** farba skupiny — vybraná dlaždica ju nesie ako výplň */
  tint: string;
  onPick: (k: NoteKind) => void;
  /**
   * VODOROVNÝ RAD namiesto mriežky (Matej 24. 8. 2026: „upozornenia daj do horizontálneho
   * scrolu... je ich veľa, už som ti to písal viackrát").
   *
   * ⚠️ Mriežka 3×3 vznikla 23. 8. z jeho vlastnej výhrady, že možnosti *„musia byť ihneď
   * viditeľné, nie schované"* — a rad ich časť schová za okraj. Vyhralo to, že deväť dlaždíc
   * v kroku, kde je pod nimi ešte otázka aj dve tlačidlá, vytlačí návrat pod okraj obrazovky
   * a človek musí skrolovať. Rad je preto ZÚŽENÝ na miesto, kde miesto naozaj chýba
   * (sprievodca výletu); paleta značiek na mape mriežku drží ďalej.
   */
  row?: boolean;
}) {
  const t = useT();
  return (
    <div className={row ? 'mnk-grid mnk-grid--row' : 'mnk-grid'}>
      <style>{KIND_GRID_CSS}</style>
      {kinds.map((k) => (
        <button
          key={k}
          type="button"
          className={`mnk-tile${selected === k ? ' on' : ''}`}
          onClick={() => onPick(k)}
          aria-pressed={selected === k}
          style={selected === k ? { background: tint, borderColor: '#FFFFFF' } : undefined}
        >
          <i>{threatEmoji(k)}</i>
          <em>{t(`pack.mapNotes.kind.${k}`)}</em>
        </button>
      ))}
    </div>
  );
}

// TRI STĹPCE, NIE RAD. Pôvodné kruhy 34 px stáli v `flex-wrap:nowrap` rade a delili si šírku
// panela — s názvom pod emoji sa to nedá: pri 360 px telefóne (panel 338) vychádza na dlaždicu
// ~105 px, čo „Iné nebezpečenstvo" zalomí na dva riadky a v rade by z toho boli deviate rôzne
// vysoké stĺpce. Mriežka drží rovnakú výšku všetkým (`align-items:stretch` je default).
export const KIND_GRID_CSS = `
.mnk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px;}
/* Rad s posunom prstom. scroll-snap drží dlaždice zarovnané, aby sa rad nezastavil
   na polovici jednej z nich a nevyzeral ako oreznutý omylom. Posledná dlaždica je vidno
   len spolovice zámerne — to je jediné, čo človeku povie, že rad pokračuje. */
.mnk-grid--row{display:flex;grid-template-columns:none;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;padding-bottom:4px;scrollbar-width:none;}
.mnk-grid--row::-webkit-scrollbar{display:none;}
/* ⚠️ V RADE SÚ DLAŽDICE NÍZKE (Matej 24. 8. 2026: „tie možnosti sú zbytočne na výšku vysoké
   a zaberajú cenný priestor v dolnom paneli, kde sa to nezmestí"). V mriežke bolo emoji NAD
   názvom, lebo stĺpec je úzky; v rade sa smie ísť VEDĽA SEBA a dlaždica tým klesne z ~58 px
   na ~34 px. Ušetrené dva riadky sú presne to, čo v paneli chýbalo. */
.mnk-grid--row .mnk-tile{flex:0 0 auto;scroll-snap-align:start;flex-direction:row;gap:6px;padding:7px 11px;border-radius:999px;white-space:nowrap;}
.mnk-grid--row .mnk-tile i{font-size:15px;}
.mnk-grid--row .mnk-tile em{font-size:11px;}
.mnk-tile{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:5px;box-sizing:border-box;padding:9px 4px;border-radius:10px;background:rgba(245,240,228,0.06);border:1.5px solid ${T.onDarkBorder};cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease;}
.mnk-tile:hover{transform:translateY(-1px);border-color:${T.onDarkDim};}
.mnk-tile i{font-style:normal;font-family:${FONT_EMOJI};font-size:19px;line-height:1;}
/* Space Grotesk je načítaný len 300–600 ⇒ strop 600, inak fake bold (CLAUDE.md). */
.mnk-tile em{font-style:normal;font-family:${FONT_UI};font-size:10px;font-weight:500;line-height:1.2;text-align:center;color:${T.onDarkDim};}
.mnk-tile.on em{color:#FFFFFF;}
.mnk-tile.on{box-shadow:0 2px 8px rgba(0,0,0,0.5);transform:translateY(-1px);}
`;
