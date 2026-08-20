// PALETA ODKAZOV — TRI SKUPINY.
// Zadanie: `plany/zadanie-zapisy-do-mapy-v2-DALSIA-SESSION.md` §8.6
//
// Matej 2026-08-20: „dajme len 3, dalšie doplníme neskor (parkovisko,
// upozornenie -zver, kliešte, ine, komentar)".
//
// ── PREČO PALETA UKAZUJE ZNAČKU, A NIE IKONKU V RÁMČEKU ─────────────────────
// Dlaždica kreslí PRESNE TÚ ZNAČKU, ktorá o chvíľu pristane na mape — modrý
// štvorec s P, červený kruh s výstrahou, zlatý kruh s bublinou. Človek si tak
// nespája abstraktný piktogram s neznámym výsledkom, ale vidí dopredu, čo po
// ňom na mape ostane. Preto sa tu nepoužíva `<BrandIcon>`: značky sú vlastný
// tvar (štvorec vs. kruh, farba podľa významu), nie ikonky v UI.
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { GROUP_KINDS, NOTE_GROUPS, type NoteGroup } from './mapNotesData';
import { noteGlyphSvg } from './noteIcons';

const GOLD = '#C99A3F';
const PARK_BLUE = T.brandBlueLite;
const HAZARD_RED = '#CE4B3C';

export const GROUP_TINT: Record<NoteGroup, string> = {
  parking: PARK_BLUE,
  warning: HAZARD_RED,
  comment: GOLD,
};

/** Značka skupiny — ten istý tvar, aký kreslí `MapNotesLayer`. */
export function GroupMark({ group, size = 26 }: { group: NoteGroup; size?: number }) {
  const tint = GROUP_TINT[group];
  if (group === 'parking') {
    return (
      <span
        className="np-mark np-mark--park"
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.22), fontSize: Math.round(size * 0.6) }}
      >
        P
      </span>
    );
  }
  return (
    <span
      className="np-mark np-mark--round"
      style={{ width: size, height: size, borderColor: tint, color: tint }}
      dangerouslySetInnerHTML={{ __html: noteGlyphSvg(GROUP_KINDS[group][0], Math.round(size * 0.58)) }}
    />
  );
}

export type NotePaletteProps = {
  onPick: (group: NoteGroup) => void;
  /** `blocks` = veľké dlaždice do vstupného popupu, `strip` = úzky rad pri bode na mape */
  variant?: 'blocks' | 'strip';
};

export function NotePalette({ onPick, variant = 'blocks' }: NotePaletteProps) {
  const t = useT();
  return (
    <div className={`np-wrap np-wrap--${variant}`}>
      {NOTE_GROUPS.map((g) => (
        <button key={g} type="button" className="np-item" onClick={() => onPick(g)}>
          <GroupMark group={g} size={variant === 'blocks' ? 30 : 24} />
          <span className="np-name">{t(`pack.mapNotes.group.${g}`)}</span>
          {variant === 'blocks' && <span className="np-text">{t(`pack.mapNotes.group.${g}.text`)}</span>}
        </button>
      ))}
    </div>
  );
}

export const NOTE_PALETTE_CSS = `
.np-wrap{display:flex;}
.np-wrap--blocks{gap:12px;align-items:stretch;}
.np-wrap--strip{gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;}
/* V zalomenom rade nesmie pilulka rásť do celej šírky — inak posledná v riadku
   vyzerá ako iný prvok než jej dve dvojičky nad ňou. */
.np-wrap--strip .np-item{flex:0 1 auto;}
@media (max-width:560px){.np-wrap--blocks{flex-direction:column;}}

.np-item{flex:1 1 0;display:flex;align-items:center;gap:10px;background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};border-radius:12px;cursor:pointer;transition:border-color .16s,background .16s,transform .16s;}
.np-wrap--blocks .np-item{flex-direction:column;align-items:flex-start;gap:8px;padding:16px 14px;text-align:left;}
.np-wrap--strip .np-item{padding:8px 12px 8px 8px;border-radius:999px;}
.np-item:hover{border-color:${GOLD};background:rgba(201,154,63,0.10);transform:translateY(-1px);}

.np-name{font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:${T.onDark};white-space:nowrap;}
.np-text{font-family:${FONT_UI};font-size:11.5px;line-height:1.45;color:${T.onDarkDim};}

.np-mark{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;box-shadow:0 2px 6px rgba(0,0,0,0.45);}
.np-mark--park{background:${PARK_BLUE};border:1.5px solid rgba(255,255,255,0.85);font-family:${FONT_UI};font-weight:600;line-height:1;color:#fff;}
.np-mark--round{border-radius:50%;background:${T.pageBg};border:1.5px solid currentColor;}
`;
