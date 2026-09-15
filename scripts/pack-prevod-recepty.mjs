#!/usr/bin/env node
/* Kolo 2 prevodu `/pack`: ručne prepísaný RECEPT → jeho meno.
 *
 * Kolo 0 prekladalo jednu farbu na jeden token. Toto prekladá CELÉ VIACHODNOTOVÉ
 * pravidlo (gradient, tieň, rám) na meno receptu — teda to, čo oko na stránke
 * naozaj vidí ako „každý blok vyzerá inak".
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
import { KOD, RIADKOVY, BLOKOVY, APOSTROF, UVODZOVKY, TEMPLATE, stavy, retazec } from './pack-lexer.mjs';

const SRC = new URL('../src/', import.meta.url).pathname;
const WRITE = process.argv.includes('--write');
const norm = (s) => s.toLowerCase().replace(/\s+/g, '');
const THEME = '@/components/pack/packTheme';
const NAV = '@/components/pack/navGoldSkin';

/* ── ČO SA PREKLADÁ BEZ ZMENY PIXELU ─────────────────────────────────────────
 * `hodnota` je OPÍSANÁ z receptu — musí sedieť znak po znaku. `varianty` sú
 * ďalšie zápisy TEJ ISTEJ hodnoty, ktoré sa v kóde našli; normalizácia ich
 * zrovná, tu sú len kvôli čitateľnosti.
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
  { symbol: 'GOLD_BTN', modul: THEME, pole: 'grad',
    hodnota: 'linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%)',
    varianty: ['linear-gradient(135deg,#F5C73D,#E69E1A)'] },
  { symbol: 'GOLD_BTN', modul: THEME, pole: 'edge',
    hodnota: 'rgba(250,244,236,0.30)', varianty: ['rgba(250,244,236,0.3)'] },
  { symbol: 'GOLD_BTN', modul: THEME, pole: 'glow',
    hodnota: '0 0 40px rgba(230,158,26,0.4), inset 0 1px 0 rgba(255,255,255,0.3)', varianty: [] },
  { symbol: 'GOLD_BTN', modul: THEME, pole: 'glowHover',
    hodnota: '0 0 56px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.3)', varianty: [] },
  { symbol: 'PACK_SHADOW', modul: THEME, pole: 'lift',
    hodnota: '0 1px 3px rgba(122,90,42,0.10), inset 0 1px 0 rgba(255,255,255,0.40)', varianty: [] },
  { symbol: 'PACK_SHADOW', modul: THEME, pole: 'panel',
    hodnota: '0 8px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,154,63,0.15)', varianty: [] },

  /* Bledý chrome `PALE` (navGoldSkin.ts) existuje od 24. 8. a jeho hodnoty ležia
   * v kóde doslovne. Presné zhody, nulová zmena. */
  { symbol: 'PALE', modul: NAV, pole: 'border',
    hodnota: 'rgba(179,130,45,0.55)', varianty: [] },
  { symbol: 'PALE', modul: NAV, pole: 'hair',
    hodnota: 'rgba(179,130,45,0.26)', varianty: [] },
];

/* ── ZLATÝ RÁM: DESAŤ KRYTÍ → DVE (zadanie, bod 3c) ──────────────────────────
 * Na rozdiel od MAPY vyššie tu hodnota REÁLNE MENÍ krytie, najviac o 0,10.
 * Preto sa počíta a vypisuje zvlášť, rovnako ako papyrusové biele v kole 2a.
 *
 * Prečo vôbec: `rgba(201,154,63,…)` leží naprieč `/pack` v krytiach 0.28 · 0.30
 * · 0.34 · 0.35 · 0.40 · 0.42 · 0.45 · 0.50 · 0.55 · 0.90. Desať čísel pre
 * „zlatý rám" nie je desať zámerov — je to desať okamihov, keď to niekto písal
 * od oka. Systém má DVE mená: `border` (rám prvku) a `hairline` (deliaca čiara;
 * brand lock: ako rám prvku pôsobí ako nedokončený návrh).
 *
 * 🔴 ZJEDNOCUJE SA LEN NAHOR — 0.50 a 0.55 OSTÁVAJÚ (Matej 15. 9. 2026).
 *    Prvý pokus hnal na 0.45 všetko vrátane silných krytí a 29 okrajov tým
 *    ZBLEDLO — vidno to na pilulkách aktivít v toku pridávania výletu. Matej
 *    slabé okraje vrátil už trikrát („majú slabé okraje" 13. 8., „je to také
 *    plané" 12. 8., „je to suche bez šťavy" 26. 7.), takže prevod, ktorý ich
 *    oslabí, je proti rozhodnutiu, ktoré už padlo — bez ohľadu na to, že
 *    výsledné číslo je „z matrice".
 *    Odteraz platí: hodnota sa smie posunúť len k SILNEJŠIEMU krytiu. Zjednotí
 *    to 33 rámov namiesto 62 a nič nezbledne. Dve silné krytia ostávajú ako
 *    otvorený bod locku — zjednotiť ich znamená zdvihnúť matricu, nie stlačiť ich.
 * ⚠️ 0.90 sa NEZOVŠEOBECŇUJE — pri tom krytí zlatá už nie je rám, ale plná
 *    čiara, a to je iný zámer. Ostáva.
 * ⚠️ Deliaca čiara sa od rámu automaticky odlíšiť nedá, preto rozhoduje
 *    BLÍZKOSŤ KRYTIA: 0.28 na `hairline` (0.30), zvyšok nahor na `border` (0.45).
 */
const KRYTIA = [
  { symbol: 'PACK_THEME', modul: THEME, pole: 'hairline', hodnoty: ['rgba(201,154,63,0.28)'] },
  { symbol: 'PACK_THEME', modul: THEME, pole: 'border', hodnoty: [
    'rgba(201,154,63,0.34)', 'rgba(201,154,63,0.35)', 'rgba(201,154,63,0.40)',
    'rgba(201,154,63,0.4)', 'rgba(201,154,63,0.42)',
  ] },
];

/* Najdlhší tvar prvý — kratšia hodnota môže byť podreťazcom dlhšej (`edge`
 * je kus `glow`u), a vtedy musí vyhrať tá dlhšia. */
const ZAZNAMY = [
  ...MAPA.flatMap((z) => [z.hodnota, ...z.varianty].map((h) => ({ ...z, hladane: norm(h), presna: true }))),
  ...KRYTIA.flatMap((z) => z.hodnoty.map((h) => ({ ...z, hladane: norm(h), presna: false }))),
].sort((a, b) => b.hladane.length - a.hladane.length);

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

/* Vlastnosti, v ktorých má hodnota zmysel. Bez tohto zúženia by sa trafil aj
 * `color:` a `fill:`, kde rám ani tieň nie je. */
const KANDIDAT = /(?:background(?:-image|-color)?|border(?:-top|-right|-bottom|-left)?(?:-color)?|box-?[Ss]hadow)\s*:\s*(['"`]?)([^;'"`}\n]*(?:#[0-9A-Fa-f]{3,8}|rgba?\()[^;'"`}\n]*)/g;

/** Pod akým MENOM je symbol v tomto súbore k dispozícii a OD KTORÉHO MIESTA.
 *
 *  ⚠️ Meno nie je vždy rovnaké ako export: `import { PACK_THEME as T }` je
 *  najčastejší zápis v `/pack`, takže výraz musí znieť `T.border`, nie
 *  `PACK_THEME.border`. Preto sa vracia `meno`, nie len „áno/nie".
 *  ⚠️ Vracia sa aj `odKde` — `const T = PACK_THEME` niekedy stojí AŽ POD prvým
 *  CSS literálom a nad ním sa to meno použiť nesmie. */
function vazba(src, ST, z) {
  const { symbol, modul } = z;
  const cesta = modul === THEME ? 'packTheme' : 'navGoldSkin';
  const vKode = (m) => m && ST[m.index] === KOD;

  const preMenovany = src.match(
    new RegExp(`import\\s*\\{[^}]*\\b${symbol}\\s+as\\s+(\\w+)[^}]*\\}[^;\\n]*from\\s*['"][^'"]*${cesta}['"]\\s*;`));
  if (vKode(preMenovany))
    return { meno: preMenovany[1], odKde: preMenovany.index + preMenovany[0].length };

  const priamy = src.match(
    new RegExp(`import\\s*\\{[^}]*\\b${symbol}\\b(?!\\s+as)[^}]*\\}[^;\\n]*from\\s*['"][^'"]*${cesta}['"]\\s*;`));
  if (vKode(priamy)) return { meno: symbol, odKde: priamy.index + priamy[0].length };

  /* ⚠️ MENO UŽ MÔŽE BYŤ OBSADENÉ. `PackWizard.tsx` má vlastnú miestnu konštantu
   * `const GOLD_BTN: React.CSSProperties` — import rovnakého mena by bol dvojitá
   * deklarácia. Taký súbor sa preskočí a vypíše; premenovať cudziu konštantu je
   * zmena komponentu, a tá do tohto kola nepatrí. */
  const miestna = src.match(
    new RegExp(`^\\s*(?:export\\s+)?(?:const|let|var|function|class)\\s+${symbol}\\b`, 'm'));
  if (vKode(miestna)) return null;

  /* Nie je importovaný — doplní sa do EXISTUJÚCEHO importu z toho modulu.
   * Vlastný nový riadok je až posledná možnosť: dva importy z toho istého
   * modulu sú presne ten druh drobného neporiadku, ktorý prevod odstraňuje. */
  const any = src.match(
    new RegExp(`import\\s*\\{([^}]*)\\}([^;\\n]*from\\s*['"][^'"]*${cesta}['"]\\s*;)`));
  if (vKode(any))
    return { meno: symbol, odKde: any.index + any[0].length,
             doplnit: { cely: any[0], vnutro: any[1], zvysok: any[2] } };

  let posledny = null;
  for (const m of src.matchAll(/^import\s[^\n]*;$/gm)) if (ST[m.index] === KOD) posledny = m;
  if (!posledny) return null;
  const koniec = posledny.index + posledny[0].length;
  return { meno: symbol, odKde: koniec, novyRiadok: { kde: koniec, modul } };
}

let spolu = 0, priblizne = 0, suborov = 0;
const poZazname = {};
const preskocene = [];
const priblizneKde = [];

for (const rel of FILES) {
  const abs = SRC + rel;
  const orig = readFileSync(abs, 'utf8');
  const ST = stavy(orig);

  /* ── 1. ČO SA V SÚBORE DÁ NAHRADIŤ ──────────────────────────────────────── */
  const najdene = [];
  for (const m of orig.matchAll(KANDIDAT)) {
    const cela = m[2];
    const zac = m.index + m[0].length - cela.length;
    const ncela = norm(cela);
    for (const z of ZAZNAMY) {
      const idx = ncela.indexOf(z.hladane);
      if (idx === -1) continue;
      /* Index v normalizovanom tvare späť na skutočný: normalizácia vyhadzuje
       * len medzery, takže stačí prejsť znaky a nemedzery počítať. */
      let od = -1, poc = 0;
      for (let k = 0; k < cela.length; k++) {
        if (/\s/.test(cela[k])) continue;
        if (poc === idx) { od = k; break; }
        poc++;
      }
      if (od === -1) continue;
      let doo = od, zostava = z.hladane.length;
      while (doo < cela.length && zostava > 0) {
        if (!/\s/.test(cela[doo])) zostava--;
        doo++;
      }
      najdene.push({ od: zac + od, do: zac + doo, z });
      break;
    }
  }
  if (!najdene.length) continue;

  /* ── 2. ODKIAĽ SA MENÁ VEZMÚ ────────────────────────────────────────────── */
  /* ⚠️ ODDEĽOVAČ NESMIE BYŤ `@` — cesta modulu sa ním ZAČÍNA
   * (`@/components/pack/packTheme`), takže `split('@')[1]` vracalo prázdny
   * reťazec a do súboru sa zapísalo `from ''`. */
  const kluc = (z) => `${z.symbol} ${z.modul}`;
  const vazby = {};
  let chyba = null;
  for (const n of najdene) {
    const k = kluc(n.z);
    if (vazby[k]) continue;
    const v = vazba(orig, ST, n.z);
    if (!v) { chyba = n.z.symbol; break; }
    vazby[k] = v;
  }
  if (chyba) { preskocene.push(`${rel} — nemá odkiaľ vziať ${chyba}`); continue; }

  /* ── 3. ÚPRAVY ──────────────────────────────────────────────────────────── */
  const upravy = [];            // { od, do, text }
  const naTemplate = new Set(); // indexy úvodzoviek, ktoré sa menia na `
  let hits = 0, phits = 0;

  for (const n of najdene.sort((a, b) => a.od - b.od)) {
    const kde = ST[n.od];
    if (kde === RIADKOVY || kde === BLOKOVY) continue;          // komentár nikdy
    const v = vazby[kluc(n.z)];
    if (n.od < v.odKde) continue;                               // nad importom nie
    const vyraz = `${v.meno}.${n.z.pole}`;

    if (kde === TEMPLATE) {
      upravy.push({ od: n.od, do: n.do, text: `\${${vyraz}}` });
    } else if (kde === APOSTROF || kde === UVODZOVKY) {
      /* Hodnota je KUS DLHŠIEHO REŤAZCA (`border: '1px solid rgba(…)'`).
       * Token sa doň vložiť nedá, kým je to obyčajný reťazec — treba z neho
       * spraviť template. Tu sa prepíšu OBE úvodzovky a vloží sa `${…}`.
       * Práve v tomto tvare leží väčšina ručných rámov v `style={{…}}`. */
      const r = retazec(orig, ST, n.od);
      if (!r) continue;
      naTemplate.add(r.otvor); naTemplate.add(r.zavri);
      upravy.push({ od: n.od, do: n.do, text: `\${${vyraz}}` });
    } else if (kde === KOD) {
      /* Celý reťazec JE tá hodnota — zožer aj úvodzovky. */
      const pred = orig[n.od - 1], po = orig[n.do];
      if (!((pred === "'" || pred === '"') && (po === "'" || po === '"'))) continue;
      upravy.push({ od: n.od - 1, do: n.do + 1, text: vyraz });
    } else continue;

    if (n.z.presna) hits++; else phits++;
    poZazname[`${n.z.symbol}.${n.z.pole}`] = (poZazname[`${n.z.symbol}.${n.z.pole}`] || 0) + 1;
  }
  for (const i of naTemplate) upravy.push({ od: i, do: i + 1, text: '`' });
  if (!upravy.length) continue;

  upravy.sort((a, b) => a.od - b.od);
  let out = '', last = 0;
  for (const u of upravy) {
    if (u.od < last) continue;                                  // prekryv — preskoč
    out += orig.slice(last, u.od) + u.text;
    last = u.do;
  }
  out += orig.slice(last);

  /* ── 4. IMPORTY — všetky naraz na modul ─────────────────────────────────────
   * ⚠️ PO JEDNOM TO NEJDE. Prvý prepis importu zmení jeho text, takže `replace`
   * toho druhého už nemá čo nájsť a TICHO neurobí nič — a v súbore ostane
   * `${PACK_SHADOW.lift}` bez importu. Chytené na `PackTriplist.tsx`. */
  const podlaModulu = {};
  for (const [k, v] of Object.entries(vazby)) {
    if (!v.doplnit && !v.novyRiadok) continue;
    const [sym, modul] = k.split('\u0000');
    (podlaModulu[modul] ||= []).push([sym, v]);
  }
  for (const [modul, zoznam] of Object.entries(podlaModulu)) {
    const doplnit = zoznam.filter(([, v]) => v.doplnit);
    if (doplnit.length) {
      const v = doplnit[0][1].doplnit;
      /* ⚠️ ZOZNAM MÔŽE KONČIŤ ČIARKOU. Viacriadkový import má za posledným menom
       * čiarku aj zalomenie; holé `+ ', ' + symbol` z toho spraví `FONT_UI,, X`. */
      const jadro = v.vnutro.replace(/[\s,]*$/, '');
      const mena = doplnit.map(([s]) => s).join(', ');
      out = out.replace(v.cely, /\n/.test(v.vnutro)
        ? `import {${jadro}, ${mena},\n}${v.zvysok}`
        : `import {${jadro}, ${mena} }${v.zvysok}`);
    }
    const nove = zoznam.filter(([, v]) => v.novyRiadok);
    if (nove.length) {
      /* `kde` je index do PÔVODNÉHO textu a platí len preto, že nad importami
       * sa nikdy nenahrádza. Preto tiež naraz, nie po jednom. */
      const kde = nove[0][1].novyRiadok.kde;
      out = out.slice(0, kde)
        + `\nimport { ${nove.map(([s]) => s).join(', ')} } from '${modul}';`
        + out.slice(kde);
    }
  }

  spolu += hits; priblizne += phits; suborov++;
  if (phits) priblizneKde.push(`${String(phits).padStart(3)}  ${rel}`);
  console.log(`  ${String(hits).padStart(3)} + ${String(phits).padStart(3)}  ${rel}`);
  if (WRITE) writeFileSync(abs, out);
}

console.log(`\n${WRITE ? 'ZAPÍSANÉ' : 'SUCHÝ BEH'} — ${spolu} presných + ${priblizne} zjednotených krytí v ${suborov} súboroch`);
for (const [k, v] of Object.entries(poZazname).sort((a, b) => b[1] - a[1]))
  console.log(`   ${String(v).padStart(3)}  ${k}`);
if (priblizneKde.length) {
  console.log(`\nZJEDNOTENÉ KRYTIE ZLATEJ (mení sa o najviac 0,10 — pozri v prehliadači):`);
  priblizneKde.forEach((p) => console.log('   ' + p));
}
if (preskocene.length) {
  console.log(`\n⚠️ PRESKOČENÉ:`);
  preskocene.forEach((p) => console.log('   ' + p));
}
