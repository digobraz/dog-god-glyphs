#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// STRÁŽ IKONIEK — `npm run check:ikony` (z `vystupy/web/`)
// ────────────────────────────────────────────────────────────────────────────
// Matej 16. 9. 2026: *„nesmú zostať nepovšimnuté, musíme ich mať na očiach."*
//
// Register v brand manuáli povie, ČO dnes je mimo brandu. Sám o sebe je to ale
// len fotka stavu — o mesiac v ňom bude 60 položiek namiesto 40 a nikto sa
// nedozvie, kedy pribudli. Preto tá istá mechanika ako pri `check:pack`:
//
//   ZÁKLADŇA SA SMIE LEN ZMENŠOVAŤ.
//
// Nová generická ikonka, alebo tá istá v ďalšom súbore, zhodí build. Keď sa
// niečo prevedie na brandovú kresbu, základňa sa zapíše nižšie (`--write`).
// Položka teda nemôže do appky vojsť ticho — musí prejsť buď výmenou za brand,
// alebo vedomým prepísaním základne, čo je v diffe vidno.
//
//   npm run check:ikony            kontrola (v CI a pred nasadením)
//   npm run check:ikony -- --list  výpis aktuálneho stavu
//   npm run check:ikony -- --write zapíše nameraný stav ako novú základňu
// ════════════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skenIkoniek, kluc } from './ikony-sken.mjs';

const KOREN = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZAKLADNA = join(KOREN, 'scripts/check-ikony.baseline.json');

const arg = process.argv.slice(2);
const zapis = arg.includes('--write');
const vypis = arg.includes('--list');

const r = skenIkoniek(KOREN);

if (r.chyby.length) {
  console.error('❌ sken zlyhal — zmenil sa tvar zdroja:');
  for (const c of r.chyby) console.error('   ' + c);
  process.exit(1);
}

// ── nameraný stav ako plochá mapa kľúč → počet ──────────────────────────────
const teraz = {};
for (const p of r.lucide) teraz[kluc.lucide(p)] = p.pocet;
for (const z of r.znaky) teraz[kluc.znak(z)] = z.pocet;
for (const e of r.emojiPovrchy) teraz[kluc.emoji(e)] = e.pocet;

if (vypis) {
  const sirka = Math.max(...Object.keys(teraz).map((k) => k.length));
  for (const [k, v] of Object.entries(teraz).sort((a, b) => b[1] - a[1])) {
    console.log(`${String(v).padStart(4)}×  ${k.padEnd(sirka)}`);
  }
  console.log(`\n${Object.keys(teraz).length} položiek mimo brandu · ${Object.values(teraz).reduce((a, b) => a + b, 0)} výskytov`);
  process.exit(0);
}

if (zapis) {
  writeFileSync(ZAKLADNA, JSON.stringify({
    _: 'ZÁKLADŇA STRÁŽE IKONIEK — smie sa len ZMENŠOVAŤ. Zapisuje `npm run check:ikony -- --write`.',
    __: 'Rast ktorejkoľvek položky alebo nová položka = build padá. Register v brand manuáli sa generuje z tých istých čísel.',
    merane: new Date().toISOString().slice(0, 10),
    polozky: Object.fromEntries(Object.entries(teraz).sort()),
  }, null, 1) + '\n');
  console.log(`✍️  základňa zapísaná: ${Object.keys(teraz).length} položiek · ${Object.values(teraz).reduce((a, b) => a + b, 0)} výskytov`);
  process.exit(0);
}

if (!existsSync(ZAKLADNA)) {
  console.error('❌ chýba scripts/check-ikony.baseline.json — spusti `npm run check:ikony -- --write`');
  process.exit(1);
}

const zakl = JSON.parse(readFileSync(ZAKLADNA, 'utf8')).polozky || {};

const nove = [];
const narastene = [];
const zmensene = [];

for (const [k, v] of Object.entries(teraz)) {
  if (!(k in zakl)) nove.push({ k, v });
  else if (v > zakl[k]) narastene.push({ k, bolo: zakl[k], je: v });
  else if (v < zakl[k]) zmensene.push({ k, bolo: zakl[k], je: v });
}
for (const k of Object.keys(zakl)) if (!(k in teraz)) zmensene.push({ k, bolo: zakl[k], je: 0 });

// ── kontext k nálezu: kde presne a či brand náprotivok MÁ ───────────────────
const kde = (k) => {
  const i = k.search(/[:@]/);
  const [typ, meno] = [k.slice(0, i), k.slice(i + 1)];
  if (typ === 'lucide') {
    const p = r.lucide.find((x) => x.meno === meno);
    if (!p) return '';
    const n = p.naprotivok ? `\n        ✅ BRAND TO MÁ: ${p.naprotivok}` : '\n        ⚠️ brandovú kresbu nemáme — vypýtaj ju od Mateja (lock: „v kite to nie je" NIE je dôvod nechať lucide)';
    return `${n}\n        ${p.subory.slice(0, 4).join(', ')}${p.subory.length > 4 ? ` +${p.subory.length - 4}` : ''}`;
  }
  if (typ === 'znak') {
    const z = r.znaky.find((x) => x.znak === meno);
    return z ? `\n        systémový font, nie kresba — ${z.vyskyty.slice(0, 3).map((v) => `${v.subor}:${v.riadok}`).join(', ')}` : '';
  }
  const e = r.emojiPovrchy.find((x) => x.subor === meno);
  return e ? `\n        emoji MIMO mapy (mapa má výnimku, tento povrch nie): ${e.emoji.slice(0, 12).join('')}` : '';
};

if (zmensene.length) {
  console.log('✅ ubudlo (zapíš nižšiu základňu: `npm run check:ikony -- --write`):');
  for (const z of zmensene.sort((a, b) => (b.bolo - b.je) - (a.bolo - a.je))) {
    console.log(`   ${z.k}: ${z.bolo} → ${z.je}`);
  }
  console.log('');
}

if (!nove.length && !narastene.length) {
  const spolu = Object.values(teraz).reduce((a, b) => a + b, 0);
  console.log(`✅ ikonky: ${Object.keys(teraz).length} položiek mimo brandu · ${spolu} výskytov — nič nepribudlo.`);
  console.log(`   z toho ${r.suhrn.maNaprotivok} lucide mien má hotovú brandovú kresbu (= na výmenu, nie výnimka).`);
  process.exit(0);
}

console.error('❌ IKONKA MIMO BRANDU PRIBUDLA — build zastavený.\n');
for (const n of nove) console.error(`   🆕 ${n.k} (${n.v}×)${kde(n.k)}`);
for (const n of narastene) console.error(`   📈 ${n.k}: ${n.bolo} → ${n.je}${kde(n.k)}`);
console.error(`
   Máš tri cesty:
     1. vymeň ju za brandovú kresbu (`+'`HandIcons.tsx`'+` / `+'`<BrandIcon>`'+`)
     2. vypýtaj si kresbu od Mateja — podľa brand locku je to ten správny krok
     3. keď to má ostať, prepíš základňu: npm run check:ikony -- --write
        (položka sa tým OBJAVÍ v červenom poli brand manuálu — o to ide)
`);
process.exit(1);
