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
}: {
  kinds: NoteKind[];
  /** null = zatiaľ nič nevybrané (sprievodca pred ťuknutím do mapy) */
  selected?: NoteKind | null;
  /** farba skupiny — vybraná dlaždica ju nesie ako výplň */
  tint: string;
  onPick: (k: NoteKind) => void;
}) {
  const t = useT();
  return (
    <div className="mnk-grid">
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
.mnk-tile{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:5px;box-sizing:border-box;padding:9px 4px;border-radius:10px;background:rgba(245,240,228,0.06);border:1.5px solid ${T.onDarkBorder};cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease;}
.mnk-tile:hover{transform:translateY(-1px);border-color:${T.onDarkDim};}
.mnk-tile i{font-style:normal;font-family:${FONT_EMOJI};font-size:19px;line-height:1;}
/* Space Grotesk je načítaný len 300–600 ⇒ strop 600, inak fake bold (CLAUDE.md). */
.mnk-tile em{font-style:normal;font-family:${FONT_UI};font-size:10px;font-weight:500;line-height:1.2;text-align:center;color:${T.onDarkDim};}
.mnk-tile.on em{color:#FFFFFF;}
.mnk-tile.on{box-shadow:0 2px 8px rgba(0,0,0,0.5);transform:translateY(-1px);}
`;
