#!/usr/bin/env node
/* Kolo 2 prevodu `/pack`: ručne prepísaný RECEPT → jeho meno.
 *
 * Kolo 0 prekladalo jednu farbu na jeden token. Toto prekladá CELÉ VIACHODNOTOVÉ
 * pravidlo (gradient, tieň) na meno receptu — teda to, čo oko na stránke naozaj
 * vidí ako „každý blok vyzerá inak".
 *
 * Zhoda sa hľadá NA NORMALIZOVANOM TVARE (malé písmená, bez medzier), lebo
 * `0 0 40px rgba(230,158,26,0.4)` a `0 0 40px rgba(230, 158, 26, .4)` sú pre
 * prehliadač to isté pravidlo — a práve tie drobné rozdiely v zápise sú dôvod,
 * prečo sa jedno pravidlo nedalo nájsť grepom a rozmnožilo sa do 39 súborov.
 *
 *   node pack-prevod-recepty.mjs            → suchý beh
 *   node pack-prevod-recepty.mjs --write    → zapíše
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { KOD, RIADKOVY, BLOKOVY, TEMPLATE, stavy } from './pack-lexer.mjs';

const SRC = new URL('../src/', import.meta.url).pathname;
const WRITE = process.argv.includes('--write');
const norm = (s) => s.toLowerCase().replace(/\s+/g, '');

/* ── ČO SA PREKLADÁ ──────────────────────────────────────────────────────────
 * `hodnota` je OPÍSANÁ z receptu v `packTheme.ts` — musí sedieť znak po znaku,
 * inak by prevod pixel pohol. `varianty` sú ďalšie zápisy TEJ ISTEJ hodnoty,
 * ktoré sa v kóde našli; normalizácia ich zrovná, tu sú len kvôli čitateľnosti.
 *
 * 🔴 ČO TU ZÁMERNE NIE JE:
 *  · Smery `90deg` a `180deg` zlatého gradientu — to nie sú tlačidlá, ale pruhy
 *    a čiary (progres, koľajnica), kde smer nesie význam.
 *  · Žiary `0 0 28px/0.34`, `44px/0.5`, `22px/0.32`, `14px/0.5` — sedem výskytov
 *    v iných veľkostiach. Môžu byť zámer (menšie tlačidlo, slabšia žiara) aj dlh;
 *    rozhodnúť to od stola by znamenalo zmeniť vzhľad bez toho, aby sa niekto
 *    pozrel. Ostávajú na ďalšie kolo.
 *  · `PACK_SHADOW.card` — v celom `/pack` nemá ANI JEDNU doslovnú kópiu.
 */
const MAPA = [
  {
    vyraz: 'GOLD_BTN.grad', symbol: 'GOLD_BTN',
    hodnota: 'linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%)',
    varianty: ['linear-gradient(135deg,#F5C73D,#E69E1A)'],
  },
  {
    vyraz: 'GOLD_BTN.edge', symbol: 'GOLD_BTN',
    hodnota: 'rgba(250,244,236,0.30)',
    varianty: ['rgba(250,244,236,0.3)'],
  },
  {
    vyraz: 'GOLD_BTN.glow', symbol: 'GOLD_BTN',
    hodnota: '0 0 40px rgba(230,158,26,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
    varianty: [],
  },
  {
    vyraz: 'GOLD_BTN.glowHover', symbol: 'GOLD_BTN',
    hodnota: '0 0 56px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.3)',
    varianty: [],
  },
  {
    vyraz: 'PACK_SHADOW.lift', symbol: 'PACK_SHADOW',
    hodnota: '0 1px 3px rgba(122,90,42,0.10), inset 0 1px 0 rgba(255,255,255,0.40)',
    varianty: [],
  },
  {
    vyraz: 'PACK_SHADOW.panel', symbol: 'PACK_SHADOW',
    hodnota: '0 8px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,154,63,0.15)',
    varianty: [],
  },
];

/* Normalizovaný tvar → záznam. Najdlhší prvý: `GOLD_BTN.glow` je predponou
 * `glowHover` len v mene, ale HODNOTA kratšieho tieňa nie je predponou dlhšieho —
 * poradie však rozhoduje pri `edge`, ktorý je podreťazcom `glow` by NEBOL, a pri
 * gradiente s stopkami vs. bez. Dlhšie prvé je lacná poistka. */
const ZAZNAMY = MAPA.flatMap((z) => [z.hodnota, ...z.varianty].map((h) => ({ ...z, hladane: norm(h), dlzka: h.length })))
  .sort((a, b) => b.dlzka - a.dlzka);

const SKIP = [
  'components/pack/ainubisSkin.ts', 'components/pack/ainubis/',
  'components/pack/PackShareCard.tsx', 'components/pack/level/revealCss.ts',
  'components/pack/mapnotes/circleMark.ts', 'components/pack/mapDockShape.ts',
  'components/pack/navGoldSkin.ts',
];
const RECEPT = ['components/pack/packTheme.ts', 'components/pack/navGoldSkin.ts'];

function zbieraj(dir, base = '') {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e), rel = base ? `${base}/${e}` : e;
    if (statSync(p).isDirectory()) { out.push(...zbieraj(p, rel)); continue; }
    out.push(rel);
  }
  return out;
}
const FILES = zbieraj(SRC).filter(
  (rel) =>
    (rel.startsWith('pages/Pack') || rel.startsWith('components/pack/')) &&
    /\.(tsx?|css)$/.test(rel) &&
    !SKIP.some((s) => rel.startsWith(s)) &&
    !RECEPT.some((r) => rel.startsWith(r)),
);

/* Kandidáti na hodnotu: gradient alebo tieň. Berie sa od `:` po koniec
 * deklarácie; koniec riadku je hranica zámerne — viacriadkový tieň sa
 * neprepisuje, lebo by sa doň nezmestil dôkaz o tom, kde naozaj končí. */
const KANDIDAT = /(?:background(?:-image|-color)?|border(?:-color)?|box-?[Ss]hadow)\s*:\s*(['"`]?)([^;'"`}\n]*(?:#[0-9A-Fa-f]{3,8}|rgba?\()[^;'"`}\n]*)/g;

/** Kde v súbore je symbol k dispozícii (import z packTheme). Vracia aj koniec
 *  importu — nad ním sa nesmie použiť, rovnako ako pri farbách. */
function vazba(src, ST, symbol) {
  const re = new RegExp(`import\\s*\\{[^}]*\\b${symbol}\\b[^}]*\\}[^;\\n]*from\\s*['"][^'"]*packTheme['"]\\s*;`);
  const m = src.match(re);
  if (m && ST[m.index] === KOD) return { odKde: m.index + m[0].length, doplnit: false };
  /* ⚠️ MENO UŽ MÔŽE BYŤ OBSADENÉ. `PackWizard.tsx` má vlastnú miestnu konštantu
   * `const GOLD_BTN: React.CSSProperties` — import rovnakého mena by z toho
   * spravil dvojitú deklaráciu. Taký súbor sa preskočí a vypíše; premenovať
   * cudziu konštantu je zmena komponentu, a tá do tohto kola nepatrí. */
  const miestna = src.match(new RegExp(`^\\s*(?:export\\s+)?(?:const|let|var|function|class)\\s+${symbol}\\b`, 'm'));
  if (miestna && ST[miestna.index] === KOD) return null;
  /* Nie je importovaný — pridá sa do EXISTUJÚCEHO importu z packTheme. Vlastný
   * nový riadok sa nezakladá: dva importy z toho istého modulu sú presne ten
   * druh drobného neporiadku, ktorý tento prevod odstraňuje. */
  const any = src.match(/import\s*\{([^}]*)\}([^;\n]*from\s*['"][^'"]*packTheme['"]\s*;)/);
  if (any && ST[any.index] === KOD)
    return { odKde: any.index + any[0].length, doplnit: true, kde: any.index, cely: any[0], vnutro: any[1], zvysok: any[2] };
  /* Súbor neimportuje z `packTheme` vôbec (PackWizard.tsx) — vtedy pribudne
   * nový riadok za POSLEDNÝ import hore v súbore. */
  let posledny = null;
  for (const m of src.matchAll(/^import\s[^\n]*;$/gm)) if (ST[m.index] === KOD) posledny = m;
  if (!posledny) return null;
  const koniec = posledny.index + posledny[0].length;
  return { odKde: koniec, novyRiadok: true, kde: koniec };
}

let spolu = 0, suborov = 0;
const poZazname = {};
const preskocene = [];

for (const rel of FILES) {
  const abs = SRC + rel;
  const orig = readFileSync(abs, 'utf8');
  const ST = stavy(orig);

  /* Najprv ZISTI, čo sa v súbore dá nahradiť — až potom rieš importy. Opačné
   * poradie by pridalo import do súboru, kde sa nakoniec nič nezmenilo. */
  const najdene = [];
  for (const m of orig.matchAll(KANDIDAT)) {
    const cela = m[2];
    const zac = m.index + m[0].length - cela.length;
    for (const z of ZAZNAMY) {
      const idx = norm(cela).indexOf(z.hladane);
      if (idx === -1) continue;
      /* Normalizovaný index späť na skutočný: prejdi znaky a počítaj tie,
       * ktoré normalizácia zachováva. */
      let real = -1, poc = 0;
      for (let k = 0; k < cela.length; k++) {
        if (/\s/.test(cela[k])) continue;
        if (poc === idx) { real = k; break; }
        poc++;
      }
      if (real === -1) continue;
      let koniec = real, zostava = z.hladane.length;
      while (koniec < cela.length && zostava > 0) {
        if (!/\s/.test(cela[koniec])) zostava--;
        koniec++;
      }
      najdene.push({ od: zac + real, do: zac + koniec, z });
      break;
    }
  }
  if (!najdene.length) continue;

  /* Jeden import na symbol — a musí stáť NAD prvým použitím. */
  const symboly = [...new Set(najdene.map((n) => n.z.symbol))];
  const vazby = {};
  let chyba = null;
  for (const s of symboly) {
    const v = vazba(orig, ST, s);
    if (!v) { chyba = s; break; }
    vazby[s] = v;
  }
  if (chyba) { preskocene.push(`${rel} — nemá odkiaľ vziať ${chyba}`); continue; }

  let out = '', last = 0, hits = 0;
  const platne = najdene
    .filter((n) => {
      const kde = ST[n.od];
      if (kde === RIADKOVY || kde === BLOKOVY) return false;      // komentár nikdy
      if (n.od < vazby[n.z.symbol].odKde) return false;           // nad importom nie
      /* V template sa vkladá `${…}`. Mimo template to ide len vtedy, keď je
       * hodnota CELÝM reťazcom — inak by sa výraz vložil do apostrofov a ostal
       * by z neho doslovný text (porucha, ktorá kolo 2a stála jedno kolo navyše). */
      if (kde === TEMPLATE) return true;
      const pred = orig[n.od - 1], po = orig[n.do];
      return (pred === "'" || pred === '"') && (po === "'" || po === '"');
    })
    .sort((a, b) => a.od - b.od);

  for (const n of platne) {
    const kde = ST[n.od];
    let od = n.od, doo = n.do, repl;
    if (kde === TEMPLATE) repl = `\${${n.z.vyraz}}`;
    else { od -= 1; doo += 1; repl = n.z.vyraz; }               // zožer aj úvodzovky
    if (od < last) continue;                                    // prekryv — preskoč
    out += orig.slice(last, od) + repl;
    last = doo;
    hits++;
    poZazname[n.z.vyraz] = (poZazname[n.z.vyraz] || 0) + 1;
  }
  out += orig.slice(last);
  if (!hits) continue;

  /* Doplnenie importu až teraz, keď je isté, že sa v súbore niečo mení.
   * Reťazcom, nie regexom — meniť už zmenený `out` regexom by posunulo indexy. */
  /* ⚠️ VŠETKY CHÝBAJÚCE SYMBOLY NARAZ, NIE PO JEDNOM. Prvý prepis importu zmení
   * jeho text, takže `replace` toho druhého už nemá čo nájsť a TICHO neurobí nič —
   * a v súbore ostane `${PACK_SHADOW.lift}` bez importu. Chytené na
   * `PackTriplist.tsx` a `packCommunityUI.tsx`, kde treba obe mená. */
  const doplnit = symboly.filter((s) => vazby[s].doplnit);
  if (doplnit.length) {
    const v = vazby[doplnit[0]];
    /* ⚠️ ZOZNAM MÔŽE KONČIŤ ČIARKOU. Viacriadkový import má za posledným menom
     * čiarku aj zalomenie; holé `+ ', ' + symbol` z toho spraví `FONT_UI,, GOLD_BTN`.
     * Preto sa odstrihne všetka koncová medzera AJ čiarka — a ak bol import
     * viacriadkový, zalomenie sa vráti, aby prevod neprestavoval cudzie riadky. */
    const jadro = v.vnutro.replace(/[\s,]*$/, '');
    const pridane = doplnit.join(', ');
    const novy = /\n/.test(v.vnutro)
      ? `import {${jadro}, ${pridane},\n}${v.zvysok}`
      : `import {${jadro}, ${pridane} }${v.zvysok}`;
    out = out.replace(v.cely, novy);
  }
  /* Nový riadok sa vkladá NARAZ pre všetky symboly a až tu: `kde` je index do
   * PÔVODNÉHO textu a platí len preto, že nad importami sa nikdy nenahrádza.
   * Dve samostatné vloženia by si navzájom posunuli index. */
  const nove = symboly.filter((s) => vazby[s].novyRiadok);
  if (nove.length) {
    const kde = vazby[nove[0]].kde;
    out = out.slice(0, kde)
      + `\nimport { ${nove.join(', ')} } from '@/components/pack/packTheme';`
      + out.slice(kde);
  }

  spolu += hits; suborov++;
  console.log(`  ${String(hits).padStart(3)}  ${rel}`);
  if (WRITE) writeFileSync(abs, out);
}

console.log(`\n${WRITE ? 'ZAPÍSANÉ' : 'SUCHÝ BEH'} — ${spolu} receptov v ${suborov} súboroch`);
for (const [k, v] of Object.entries(poZazname).sort((a, b) => b[1] - a[1]))
  console.log(`   ${String(v).padStart(3)}  ${k}`);
if (preskocene.length) {
  console.log(`\n⚠️ PRESKOČENÉ:`);
  preskocene.forEach((p) => console.log('   ' + p));
}
