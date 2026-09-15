#!/usr/bin/env node
/* Spoločný skener pre codemody prevodu `/pack`.
 *
 * Je tu preto, aby neexistoval v dvoch kópiách — presne to je porucha, ktorú
 * celý prevod odstraňuje. Volajú ho `pack-prevod-farby.mjs` aj
 * `pack-prevod-recepty.mjs`.
 */
/* ── KDE V SÚBORE TÁ FARBA LEŽÍ ──────────────────────────────────────────────
 * Do 15. 9. 2026 to rozhodoval počet spätných apostrofov pred pozíciou. Ten
 * odhad na štyroch povrchoch kola 0 vydržal, na celom `/pack` spravil DVE
 * poruchy, ktoré spätná expanzia NECHYTÍ (obe expandujú naspäť na tú istú
 * hodnotu, takže dôkaz o nich nevie):
 *
 *   1. KOMENTÁR so spätným apostrofom. `// predtým bola zlatá \`#C99A3F\``
 *      sa prepísal na `\${T.cardEdge}` — kód beží rovnako, ale veta prestala
 *      dávať zmysel a doklad o histórii je preč.
 *   2. REŤAZEC VNÚTRI template literálu. V
 *      `` `1.5px solid ${xs ? 'rgba(…,0.28)' : 'rgba(…,0.45)'}` ``
 *      je tá druhá farba v obyčajných úvodzovkách, hoci naokolo beží template.
 *      Odhad povedal „si v template", vložil `\${T.border}` do apostrofov —
 *      a z rámu sa stal doslovný text `1.5px solid \${T.border}`, teda NEPLATNÉ
 *      CSS. Prvok prišiel o okraj a nikto by si toho v dôkaze nevšimol.
 *
 * Preto sa súbor jednoducho prejde znak po znaku a každá pozícia dostane stav.
 * Porucha tohto skenera sa prejaví ako „preskočené", nie ako „prepísané zle":
 * mimo template sa nahrádza iba vtedy, keď je farba CELÝM reťazcom. */
export const KOD = 0, RIADKOVY = 1, BLOKOVY = 2, APOSTROF = 3, UVODZOVKY = 4, TEMPLATE = 5;
export function stavy(src) {
  const st = new Uint8Array(src.length);
  let mode = KOD, hlbka = 0, i = 0;
  const ramy = [];                                   // zanorenie `${ … }` v template
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (mode === KOD) {
      if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') st[i++] = RIADKOVY; continue; }
      if (c === '/' && d === '*') {
        st[i++] = BLOKOVY; st[i++] = BLOKOVY;
        while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) st[i++] = BLOKOVY;
        if (i < src.length) { st[i++] = BLOKOVY; st[i++] = BLOKOVY; }
        continue;
      }
      st[i] = KOD;
      if (c === "'") { mode = APOSTROF; i++; continue; }
      if (c === '"') { mode = UVODZOVKY; i++; continue; }
      if (c === '`') { mode = TEMPLATE; i++; continue; }
      if (c === '{') hlbka++;
      else if (c === '}') {
        if (hlbka === 0 && ramy.length) { hlbka = ramy.pop(); mode = TEMPLATE; i++; continue; }
        hlbka--;
      }
      i++; continue;
    }
    if (mode === APOSTROF || mode === UVODZOVKY) {
      st[i] = mode;
      if (c === '\\') { if (i + 1 < src.length) st[i + 1] = mode; i += 2; continue; }
      if ((mode === APOSTROF && c === "'") || (mode === UVODZOVKY && c === '"')) { mode = KOD; i++; continue; }
      i++; continue;
    }
    /* TEMPLATE */
    st[i] = TEMPLATE;
    if (c === '\\') { if (i + 1 < src.length) st[i + 1] = TEMPLATE; i += 2; continue; }
    if (c === '`') { mode = KOD; i++; continue; }
    if (c === '$' && d === '{') { st[i + 1] = KOD; ramy.push(hlbka); hlbka = 0; mode = KOD; i += 2; continue; }
    i++;
  }
  return st;
}
