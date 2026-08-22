// ZÁPISY DO MAPY — SEKCIA V ČLÁNKU VÝLETU.
// Zadanie: `plany/zadanie-zapisy-do-mapy-2026-08-20.md` §3
//
// Druhá polovica Matejovho pravidla: **mapa nesie ZNAČKY, článok nesie TEXT.**
// V mape je zápis schovaný pod ikonkou; tu je rozbalený a číta sa ako zoznam.
// To je celý rozdiel medzi oboma povrchmi — dáta sú tie isté, komponent iný.
//
// Ktoré zápisy sem patria, rozhoduje GEOMETRIA, nie uložený kľúč
// (`notesForTrail()` v mapNotesGeo.ts): parkovisko do 500 m od štartu/cieľa,
// ostatné do 150 m od stopy. Parkovisko pri štarte teda vidia VŠETKY výlety,
// ktoré odtiaľ vychádzajú — presne to bol dôvod, prečo väzba nie je uložená.
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { groupOf, type MapNote, type NoteKind, type TickDisease } from './mapNotesData';
import { notesForTrail, isDatasetNote } from './mapNotesGeo';
import { FONT_EMOJI, MARK_EMOJI, threatEmoji } from './markEmoji';
import { GROUP_TINT, HAZARD_RED, noteTint } from './NotePalette';

const GOLD = '#C99A3F';

// Farbu značky nesie `noteTint()` z NotePalette — jediný zdroj pre mapu aj tento
// zoznam. Vlastná kópia tu bola do 22. 8. a raz sa už rozišla: v článku svietili
// kliešte zlato, kým na mape boli červené.

function formatDate(iso: string, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Upozornenie v zozname = TÁ ISTÁ značka, akú kreslí mapa: emoji hrozby v bielom
 * kruhu s červeným lemom. Emoji berie z `threatEmoji()`, teda z jedného zdroja —
 * inak by riadok v článku časom hovoril niečo iné než bod nad ním.
 */
function WarnMark({ kind, disease }: { kind: NoteKind; disease?: TickDisease | null }) {
  return (
    <span className="mns-threat" style={{ borderColor: noteTint(kind, disease) }}>
      <i className="mns-em">{threatEmoji(kind)}</i>
    </span>
  );
}

export type MapNotesSectionProps = {
  trail: HeroTrail;
  notes: MapNote[];
  locale?: string;
  /** „pridať na mapu" — otvorí sa zakladanie s pripnutím na tento výlet */
  onAdd?: () => void;
};

export function MapNotesSection({ trail, notes, locale = 'en-US', onAdd }: MapNotesSectionProps) {
  const t = useT();
  const mine = notesForTrail(notes, trail);

  // Prázdna sekcia sa nekreslí ako prázdna vitrína — ukáže sa len výzva zapísať.
  // Nula zápisov je normálny stav novej mapy, nie chyba a nie výčitka.
  if (!mine.length && !onAdd) return null;

  return (
    <section className="mns-wrap">
      <style>{MAP_NOTES_SECTION_CSS}</style>
      <div className="mns-head">
        <h3 className="mns-title">{t('pack.mapNotes.section.title')}</h3>
        {onAdd && (
          <button type="button" className="mns-add" onClick={onAdd}>
            {t('pack.mapNotes.section.add')}
          </button>
        )}
      </div>

      {!mine.length ? (
        <p className="mns-empty">{t('pack.mapNotes.section.empty')}</p>
      ) : (
        <ul className="mns-list">
          {mine.map((n) => (
            <li key={n.id} className={`mns-item${n.isStale ? ' mns-item--stale' : ''}`}>
              {/* Emoji sú tie isté ako na mape (`MapNotesLayer`) — zoznam v článku
                  a značka na mape musia byť rozpoznateľne tá istá vec. Preto sem
                  padol aj červený štvorček okolo hrozby (21. 8., 3. kolo): mapa
                  nemá žiadnu podložku, takže by ju nemal mať ani zoznam.
                  Kruh s lemom skladá `WarnMark` nad `threatEmoji()` — jeden zdroj pre oba povrchy. */}
              <span className="mns-icon" aria-hidden="true">
                {groupOf(n.kind) === 'warning'
                  ? <WarnMark kind={n.kind} disease={n.disease} />
                  : groupOf(n.kind) === 'comment'
                    ? <span className="mns-threat mns-threat--tip"><i className="mns-em">{MARK_EMOJI[n.kind]}</i></span>
                    : <i className="mns-em">{MARK_EMOJI[n.kind]}</i>}
              </span>
              <div className="mns-main">
                <div className="mns-top">
                  <span className="mns-kind" style={{ color: noteTint(n.kind, n.disease) }}>
                    {t(`pack.mapNotes.kind.${n.kind}`)}
                  </span>
                  {n.kind === 'parking' && n.paid != null && (
                    <span className="mns-tag">
                      {t(n.paid ? 'pack.mapNotes.parking.paid' : 'pack.mapNotes.parking.free')}
                    </span>
                  )}
                  {n.isStale && <span className="mns-stale">{t('pack.mapNotes.unconfirmed')}</span>}
                </div>
                {!!n.body && <p className="mns-body">{n.body}</p>}
                {!isDatasetNote(n) && (
                  <div className="mns-meta">
                    {n.authorFirst && <span className="mns-author">{n.authorFirst}</span>}
                    {n.packNumber != null && <span>#{n.packNumber}</span>}
                    <span>{formatDate(n.createdAt, locale)}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export const MAP_NOTES_SECTION_CSS = `
.mns-wrap{margin-top:18px;}
.mns-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;}
.mns-title{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:${T.onDark};}
.mns-add{font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${GOLD};background:transparent;border:1px solid rgba(201,154,63,0.5);border-radius:999px;padding:6px 12px;cursor:pointer;transition:background .15s,border-color .15s;}
.mns-add:hover{background:rgba(201,154,63,0.12);border-color:${GOLD};}
.mns-empty{margin:0;font-family:${FONT_UI};font-size:12px;font-style:italic;color:${T.onDarkDim};}
.mns-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
.mns-item{display:flex;gap:11px;align-items:flex-start;padding:11px 12px;background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:10px;}
/* Zošednutý zápis NEMIZNE (Matej: „poznámka neumiera") — len klesá na koniec
   a stráca kontrast. Čitateľný ostáva. */
.mns-item--stale{opacity:.55;}
/* Pole ikonky je širšie než jedno emoji — pri upozornení sú v ňom DVE (⚠️ + hrozba).
   Šírka je PEVNÁ a obsah v nej centrovaný, aby text riadkov ostal zarovnaný pod sebou
   bez ohľadu na druh zápisu; s obsahovou šírkou by sa riadky s upozornením odsadili. */
.mns-icon{flex-shrink:0;width:34px;height:26px;display:flex;align-items:center;justify-content:center;}
.mns-em{font-style:normal;font-family:${FONT_EMOJI};font-size:16px;line-height:1;}
/* Kruh je zmenšenina mapovej značky (28 px → 24 px) — riadok zoznamu je nižší
   než voľná mapa, ale tvar aj lem musia ostať rozpoznateľné ako tá istá vec. */
.mns-threat{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:999px;background:#FFFFFF;border:2px solid ${HAZARD_RED};box-sizing:border-box;}
.mns-threat .mns-em{font-size:14px;}
/* Tip = ten istý kruh, zelený lem — dvojička .mn-mark--tip z mapy. */
.mns-threat--tip{border-color:${GROUP_TINT.comment};}
.mns-main{flex:1;min-width:0;}
.mns-top{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.mns-kind{font-family:${FONT_TITLE};font-weight:700;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;}
.mns-tag{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.onDarkDim};border:1px solid ${T.onDarkBorder};border-radius:999px;padding:2px 7px;}
.mns-stale{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.onDarkDim};}
.mns-body{margin:5px 0 0;font-family:${FONT_UI};font-size:12.5px;line-height:1.5;color:${T.onDark};white-space:pre-wrap;word-break:break-word;}
.mns-meta{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-top:6px;font-family:${FONT_UI};font-size:10.5px;color:${T.onDarkDim};}
.mns-author{font-family:${FONT_TITLE};font-weight:700;font-size:11px;color:${T.onDark};}
`;
