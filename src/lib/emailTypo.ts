// ─────────────────────────────────────────────────────────────────────────────
// emailTypo — návrh opravy preklepnutej domény v e-maile
//
// PREČO (incident 2026-08-06): člen #60 zadal pri checkoute `jakub.cabane@…`
// namiesto `jakub.cabanek@…`. Zaplatil, ale certifikát, faktúra AJ prístup
// odišli na cudziu adresu a v `/pack` nič nevidel — `/pack` číta psa cez
// `user_id`, ktoré sa páruje podľa mailu. Napísal Ainubisovi o 00:27.
//
// ⚠️ Toto NIE JE úplná ochrana a ani ňou byť nemôže: preklep v LOKÁLNEJ časti
// (`cabane` vs `cabanek`) je platná adresa a žiadny algoritmus ho neodlíši od
// správnej. Jediné, čo ho chytí, je človek, ktorý si adresu prečíta — preto
// je na `/payment` mail vypísaný nad platobným tlačidlom. Tento súbor rieši
// druhú polovicu problému: preklepy v DOMÉNE, ktoré sa naopak strojovo
// chytiť dajú a používateľ ich prehliadne rovnako ľahko.
// ─────────────────────────────────────────────────────────────────────────────

/** Domény, ktoré reálne vidíme v `dogs.email` + bežné SK/CZ/PL/DE schránky. */
const KNOWN_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com',
  'proton.me', 'protonmail.com',
  'aol.com', 'mail.com', 'gmx.net', 'gmx.de', 'web.de', 't-online.de',
  // SK
  'azet.sk', 'zoznam.sk', 'centrum.sk', 'post.sk', 'pobox.sk', 'atlas.sk',
  'inmail.sk', 'stonline.sk', 'orange.sk', 'szm.sk',
  // CZ
  'seznam.cz', 'email.cz', 'centrum.cz', 'volny.cz', 'atlas.cz', 'post.cz',
  // PL / HU / RU
  'wp.pl', 'o2.pl', 'onet.pl', 'interia.pl', 'freemail.hu', 'mail.ru', 'yandex.ru',
];

/**
 * Damerau-Levenshtein (s prehodením susedných znakov), NIE obyčajný Levenshtein.
 * Prehodenie dvoch písmen je najčastejší preklep pri písaní naslepo — a čistý
 * Levenshtein ho počíta ako DVE operácie, takže `azet.ks` (7 znakov, limit 1)
 * by nikdy nedostalo návrh `azet.sk`. Tu je to jedna operácia.
 * Reťazce sú krátke, plná matica stačí.
 */
function distance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 99; // ďalej nás to nezaujíma

  const d: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

/**
 * Vráti navrhovanú opravenú adresu, alebo `null` keď niet čo navrhovať.
 *
 * Zámerne konzervatívne — falošný poplach na firemnej doméne je horší než
 * nechytený preklep: nedôveryhodné varovanie tesne pred platbou brzdí kúpu.
 *  · doména je v zozname → nič (aj keby bola „blízko" inej)
 *  · vzdialenosť 1 → návrh vždy
 *  · vzdialenosť 2 → návrh len pri doméne od 9 znakov (`gmail.com`, nie `wp.pl`)
 */
export function suggestEmailFix(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at < 1 || at === trimmed.length - 1) return null;

  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!domain.includes('.')) return null;
  if (KNOWN_DOMAINS.includes(domain)) return null;

  let best: string | null = null;
  let bestDist = 99;
  for (const known of KNOWN_DOMAINS) {
    const d = distance(domain, known);
    const limit = known.length >= 9 ? 2 : 1;
    if (d <= limit && d < bestDist) {
      best = known;
      bestDist = d;
    }
  }
  return best ? `${local}@${best}` : null;
}
