// PALETA ODKAZOV — TRI SKUPINY.
// Zadanie: `plany/zadanie-zapisy-do-mapy-v2-DALSIA-SESSION.md` §8.6
//
// Matej 2026-08-20: „dajme len 3, dalšie doplníme neskor (parkovisko,
// upozornenie -zver, kliešte, ine, komentar)".
//
// ── PALETA JE HOLÉ EMOJI, BEZ PODLOŽKY (Matej 2026-08-21) ───────────────────
// „tu to oprav na emoji a psa nedávaj do kruhu… iba emoji (trojuholník vymeň)".
// Nakreslené podložky (modrý štvorec s P, clip-path trojuholník, zlatý kruh)
// tu zanikli — 🅿️ aj ⚠️ ten istý tvar nesú natívne, takže sa nič nestratilo,
// len ubudla vrstva CSS medzi človekom a významom.
//
// ⚠️ Emoji MUSÍ mať `FONT_EMOJI` — zdedený Cinzel by na Windows sadol na
// čiernobiely textový variant.
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { NOTE_GROUPS, type NoteGroup } from './mapNotesData';
import { FONT_EMOJI, GROUP_EMOJI } from './markEmoji';

const GOLD = '#C99A3F';
const PARK_BLUE = T.brandBlueLite;
/** Červená upozornenia. Jediný zdroj — `MapNotesLayer`/`MapNotesSection` si ju zatiaľ držia
 *  vlastnou kópiou, čo je dlh zapísaný v audite vysvetliviek. */
export const HAZARD_RED = '#CE4B3C';

/**
 * Farba skupiny — nesie ju lem značky, kruh polomeru, bodka v lište „ukáž miesto"
 * aj titulok panela. JEDEN zdroj, aby značka a jej popis nehovorili dve farby.
 *
 * ⚠️ NAJPRV MODRÁ, OD 22. 8. ZELENÁ. Zlatú Matej zamietol 21. 8. („pri komentári
 * daj modrú farbu nie zlatú tá nie je takmer vobec vidno" — mapa je SVETLÁ a
 * `#C99A3F` na nej zmizne). Modrá vydržala jeden deň: „tip je ešte lepšie ako rada
 * = bude to niečo v pozitívnom duchu". Modrou totiž appka inde značí „ideš s niekým",
 * takže na mape nehovorila ani varovanie, ani odmenu — nehovorila nič.
 *
 * Červená = daj si pozor · zelená = toto ťa poteší. Dve farby, dva opačné zmysly,
 * a človek ich rozozná skôr, než prečíta, čo je vnútri kruhu.
 */
export const GROUP_TINT: Record<NoteGroup, string> = {
  parking: PARK_BLUE,
  warning: HAZARD_RED,
  comment: T.growGreen,
};

/**
 * Značka skupiny — rozcestník, nie výsledná značka (viď `GROUP_EMOJI` v markEmoji.ts).
 */
export function GroupMark({ group, size = 26 }: { group: NoteGroup; size?: number }) {
  return (
    <span className="np-mark" style={{ width: size, height: size, fontSize: Math.round(size * 0.82) }}>
      {GROUP_EMOJI[group]}
    </span>
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

.np-mark{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;font-family:${FONT_EMOJI};line-height:1;-webkit-user-select:none;user-select:none;}
`;
