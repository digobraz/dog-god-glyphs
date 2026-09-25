// ════════════════════════════════════════════════════════════════════════════
// PRÍCHOD OBRAZOVKY — otočenie medailónu a vypisovanie vety po písmenách
// ────────────────────────────────────────────────────────────────────────────
// Text sa PRESUNUL z `NameScreen.tsx` (25. 9. 2026), neprepísal sa. Zdieľa ho
// krok 2 (meno psa) a ODHALENIE (`FlowRevealScreen`) — Matej 25. 9.: *„dal by
// som animáciu ako v úvode"*. Dve kópie by sa rozišli pri prvej oprave.
// ════════════════════════════════════════════════════════════════════════════

// ── PRÍCHOD: OTOČENIE FOTKY A POSTUPNÁ OTÁZKA (23. 9. 2026) ────────────────
// Matej: *„pridal by som animáciu aj tej fotky a písmen — fotka sa pootočí
// a príde reveal a otázka sa animuje postupne"*.
/** Koľko trvá odhalenie medailónu, kým sa pustí text. */
export const REVEAL_S = 0.72;
/** Rozostup písmen. 22 ms je hranica, pod ktorou to splýva do obyčajného fadu. */
export const LETTER_S = 0.022;

/**
 * Text, ktorý sa vypisuje po PÍSMENÁCH.
 *
 * 🔴 ANIMUJE CSS, NIE FRAMER — a je to nález, nie vkus. Prvá verzia dala
 *    písmenám `initial`/`animate`, jenže celá bublina visí v
 *    `<AnimatePresence initial={false}>` a ten potláča vstupnú animáciu
 *    VŠETKÝCH potomkov pri prvom renderi. Písmená aj otáčanie medailónu sa
 *    preto nehrali vôbec: v 420 ms bolo všetko dokreslené. CSS animácia na
 *    tom nezávisí — a je aj lacnejšia než sto motion komponentov na vetu.
 *
 * ⚠️ Každé písmeno je `inline-block` — bez toho by sa `transform` neuplatnil.
 *    Medzery sú samostatné spany s pevnou šírkou: `inline-block` medzeru inak
 *    zrazí na nulu a slová by sa zlepili.
 * ⚠️ Zalomenie drží `whitespace-nowrap` na obale, nie na písmenách.
 */
export function LetterReveal({ text, from, bold }: { text: string; from: number; bold?: boolean }) {
  // 🔴 PÍSMENÁ SÚ ZOSKUPENÉ PO SLOVÁCH (25. 9. 2026). Každé písmeno je
  //    \`inline-block\`, takže prehliadač smel zalomiť riadok MEDZI ktorýmikoľvek
  //    dvoma — na 390 px vyšlo „IS RE / ADY." (ODHALENIE). Slovo je teraz
  //    \`nowrap\` obal a zalamuje sa len na medzere. Oneskorenie ide ďalej po
  //    písmenách celej vety, nie po slovách.
  let n = 0;
  return (
    <>
      {text.split(/( )/).map((word, wi) => {
        if (word === ' ') {
          n += 1;
          return <span key={wi} style={{ display: 'inline-block', width: '0.3em' }} />;
        }
        return (
          <span key={wi} style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
            {Array.from(word).map((ch, ci) => {
              const i = n++;
              return (
                <span
                  key={ci}
                  className={`hf-letter${bold ? ' font-bold text-amber-300' : ''}`}
                  style={{ animationDelay: `${(from + i * LETTER_S).toFixed(3)}s` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
}

/** Hárok príchodu. ⚠️ Bez spätných apostrofov: CSS je v template literáli. */
export const FLOW_INTRO_CSS = `
        @keyframes hf-medin {
          from { opacity: 0; transform: rotate(-190deg) scale(.55); }
          to   { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        .hf-medin { animation: hf-medin ${REVEAL_S}s cubic-bezier(.2,.8,.3,1.05) both; }
        @keyframes hf-letter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hf-letter {
          display: inline-block;
          animation: hf-letter .24s ease-out both;
        }
        /* Kto si vypol pohyb, dostane text a medailón rovno — nie prázdnu
           obrazovku, kým dobehne animácia, ktorá sa nehrá. */
        @media (prefers-reduced-motion: reduce) {
          .hf-medin, .hf-letter { animation: none; opacity: 1; transform: none; }
        }
`;
