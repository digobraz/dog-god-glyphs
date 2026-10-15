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
import { PACK_THEME as T, FONT_UI, PACK_SHADOW } from '@/components/pack/packTheme';
import { MAP_SKIN, PALE, tintRGBA } from '@/components/pack/navGoldSkin';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { HandArrowLeft } from '@/components/pack/HandIcons';
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
   * NÍZKE PILULKY V ZALAMOVANOM RADE namiesto mriežky 3×3 (Matej 24. 8. 2026: „tie možnosti
   * sú zbytočne na výšku vysoké a zaberajú cenný priestor v dolnom paneli").
   *
   * ⚠️ Od 28. 8. sa rad ZALAMUJE — vodorovný scroll zanikol (dôvod pri `.mnk-grid--row`
   * v CSS nižšie). Prop teda mení TVAR dlaždice (nízka pilulka vs. vysoká dlaždica), nie
   * spôsob posunu. Ostáva zúžený na sprievodcu výletu, kde je miesta najmenej; paleta
   * značiek na mape drží mriežku ďalej.
   */
  row?: boolean;
  /**
   * ── JEDEN RIADOK NA SCROLL SO ŠÍPKAMI (Matej 15. 10. 2026, mobil, krok 2) ─────────────
   * „je veľa obsahu na scroll = dajme ich do jedného riadku na scroll aj so šípkami, aby
   *  človek vedel, že si môže vybrať".
   * ⚠️ PREBÍJA zalomenie z 28. 8. („daj to do dvoch — 4 a 4"). Vodorovný scroll padol 23. 8.
   *    preto, že „možnosti musia byť ihneď viditeľné, nie schované" — šípky na okrajoch sú
   *    presne tá viditeľnosť: hovoria, že rad pokračuje. Šípka zmizne, keď na jej strane nič nie je.
   */
  scroll?: boolean;
}) {
  const t = useT();
  const railRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ l: false, r: false });
  useEffect(() => {
    const el = railRef.current;
    if (!scroll || !el) return;
    const upd = () => setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    upd();
    el.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    return () => { el.removeEventListener('scroll', upd); window.removeEventListener('resize', upd); };
  }, [scroll, kinds.length]);
  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
  };
  const grid = (
    <div ref={scroll ? railRef : undefined} className={scroll ? 'mnk-grid mnk-grid--row mnk-grid--rail' : row ? 'mnk-grid mnk-grid--row' : 'mnk-grid'}>
      <style>{KIND_GRID_CSS}</style>
      {kinds.map((k) => (
        <button
          key={k}
          type="button"
          className={`mnk-tile${selected === k ? ' on' : ''}`}
          onClick={() => onPick(k)}
          aria-pressed={selected === k}
          /* ⚠️ VYBRANÁ DLAŽDICA JE TINT, NIE PLNÁ FARBA (Matej 2026-08-26, tretie kolo:
             „výber PWT som chcel modré/zelené/červené ale priesvitné"). Plná výplň dávala
             tej istej váhy ako hlavné CTA pod ňou. Rám nesie farbu naplno — z neho sa
             číta, ktorá skupina to je; výplň len podfarbuje. Biely rám (do teraz) hovoril
             „vybraté", ale nie „vybraté ČO". */
          style={selected === k ? { background: tintRGBA(tint, 0.24), borderColor: tint } : undefined}
        >
          <i>{threatEmoji(k)}</i>
          <em>{t(`pack.mapNotes.kind.${k}`)}</em>
        </button>
      ))}
    </div>
  );
  if (!scroll) return grid;
  return (
    <div className="mnk-railwrap">
      {grid}
      {edge.l && <button type="button" className="mnk-arw mnk-arw--l" onClick={() => nudge(-1)} aria-label={t('pack.addTrip.step.scrollLeft')}><HandArrowLeft size={14} /></button>}
      {edge.r && <button type="button" className="mnk-arw mnk-arw--r" onClick={() => nudge(1)} aria-label={t('pack.addTrip.step.scrollRight')}><HandArrowLeft size={14} /></button>}
    </div>
  );
}

// TRI STĹPCE, NIE RAD. Pôvodné kruhy 34 px stáli v `flex-wrap:nowrap` rade a delili si šírku
// panela — s názvom pod emoji sa to nedá: pri 360 px telefóne (panel 338) vychádza na dlaždicu
// ~105 px, čo „Iné nebezpečenstvo" zalomí na dva riadky a v rade by z toho boli deviate rôzne
// vysoké stĺpce. Mriežka drží rovnakú výšku všetkým (`align-items:stretch` je default).
export const KIND_GRID_CSS = `
.mnk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px;}
/* ── RAD SA ZALAMUJE, NESKROLUJE (Matej 2026-08-28) ────────────────────────────────────
   „Vadí mi, že tie chipy — kliešte… sú vedľa seba a je to moc dlhé v jednom riadku,
    daj to do dvoch — 4 a 4."

   ⚠️ RUŠÍ TO VODOROVNÝ SCROLL z 24. 8. Jeho dôvod (deväť vysokých dlaždíc vytláčalo návrat
   pod okraj) medzitým zanikol: dlaždice v rade sú nízke a z panela odišla otázka aj tlačidlo
   OZNAČ. Ostala z neho len tá polovica, ktorú Matej zamietol už 23. 8. — „možnosti musia byť
   ihneď viditeľné, nie schované".
   ⚠️ Chip je preto o vlások menší (10 px písmo, tesnejšia výplň): pri pôvodnej veľkosti
   deväť hrozieb v 408 px stĺpci sadá na TRI riadky, pri tejto na dva. Nie je to estetika —
   je to jediné číslo, ktorým sa dá „4 a 4" dodržať bez skracovania názvov.
   🚩 Deviata hrozba sa do dvoch riadkov po štyroch nezmestí presne; padne na tretí riadok
   na úzkom stĺpci (1024–1400 px, 360 px panel). */
.mnk-grid--row{display:flex;flex-wrap:wrap;grid-template-columns:none;gap:5px;}
/* ⚠️ V RADE SÚ DLAŽDICE NÍZKE (Matej 24. 8. 2026: „tie možnosti sú zbytočne na výšku vysoké
   a zaberajú cenný priestor v dolnom paneli, kde sa to nezmestí"). V mriežke bolo emoji NAD
   názvom, lebo stĺpec je úzky; v rade sa smie ísť VEDĽA SEBA a dlaždica tým klesne z ~58 px
   na ~34 px. Ušetrené dva riadky sú presne to, čo v paneli chýbalo. */
/* Jeden riadok na scroll (15. 10. 2026) — pás bez posuvníka, šípky ležia nad okrajmi. */
.mnk-railwrap{position:relative;}
.mnk-grid--rail{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;padding:0 4px;}
.mnk-grid--rail::-webkit-scrollbar{display:none;}
.mnk-grid--rail .mnk-tile{scroll-snap-align:start;}
.mnk-arw{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;background:${T.card};border:1px solid ${T.border};color:${T.inkStrong};box-shadow:${PACK_SHADOW.card};z-index:2;}
.mnk-arw--l{left:-4px;}
.mnk-arw--r{right:-4px;}
.mnk-arw--r svg{transform:scaleX(-1);}
.mnk-grid--row .mnk-tile{flex:0 0 auto;flex-direction:row;gap:5px;padding:8px 8px;border-radius:999px;white-space:nowrap;}
.mnk-grid--row .mnk-tile i{font-size:14px;}
.mnk-grid--row .mnk-tile em{font-size:10px;}
.mnk-tile{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:5px;box-sizing:border-box;padding:8px 4px;border-radius:8px;background:rgba(245,240,228,0.06);border:1.5px solid ${T.onDarkBorder};cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease;}
.mnk-tile:hover{transform:translateY(-1px);border-color:${T.onDarkDim};}
/* Ten istý dôvod ako pri chipoch skupiny v AddTripLog: outline mimo hranice by sa orezal
   o skrolovací stĺpec. Dovnútra ho vidno rovnako. */
.mnk-tile:focus-visible{outline:2px solid ${T.onDark};outline-offset:-2px;}
.mnk-tile i{font-style:normal;font-family:${FONT_EMOJI};font-size:20px;line-height:1;}
/* Space Grotesk je načítaný len 300–600 ⇒ strop 600, inak fake bold (CLAUDE.md). */
.mnk-tile em{font-style:normal;font-family:${FONT_UI};font-size:10px;font-weight:500;line-height:1.2;text-align:center;color:${T.onDarkDim};}
.mnk-tile.on em{color:#FFFFFF;}
.mnk-tile.on{box-shadow:0 2px 8px rgba(0,0,0,0.5);transform:translateY(-1px);}
${MAP_SKIN !== 'pale' ? '' : `
/* ── BLEDÝ SKIN PC (2026-08-26) ─────────────────────────────────────────────────────────
   Mriežka žije v paneli značky, ktorý je na PC papyrusový. V onDark tokenoch tam bola
   NEČITATEĽNÁ: výplň rgba(245,240,228,0.06) na piesku prakticky nič a názov svetlý inkoust —
   z dlaždice ostalo len emoji.
   ⚠️ Media query zanikla 28. 8. 2026 — panel značky je bledý na každej šírke, farby sú na
   oboch tie isté a druhá sada pre mobil by sa rozišla pri prvej úprave.
   ⚠️ Vybraná dlaždica (.on) si výplň nesie zvonku (farba skupiny, inline štýl), preto sa tu
   mení len jej inkoust — a nie na biely, ale na najtmavší: zvolené farby sú svetlé tinty. */
  .mnk-tile{background:${PALE.field};border-color:${PALE.border};}
  .mnk-tile:hover{border-color:${PALE.deep};}
  .mnk-tile em{color:${PALE.dim};}
  .mnk-tile.on em{color:${PALE.ink};}
  .mnk-tile.on{box-shadow:0 2px 8px rgba(110,74,20,0.35);}
`}
`;
