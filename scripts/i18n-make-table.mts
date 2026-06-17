// Build the translator deliverable: master CSV + dashboard HTML table.
// Reads en master + all locale .ts modules. Run AFTER assembly.
// Run: npx tsx scripts/i18n-make-table.mts
import { en } from '../src/i18n/locales/en';
import { writeFileSync, mkdirSync } from 'node:fs';

// 18-lang display order (label = locale file/DICTS code)
const LANGS: { code: string; name: string }[] = [
  { code: 'en', name: 'English' }, { code: 'sk', name: 'Slovak' },
  { code: 'cs', name: 'Czech' }, { code: 'pol', name: 'Polish' },
  { code: 'deu', name: 'German' }, { code: 'esp', name: 'Spanish' },
  { code: 'fra', name: 'French' }, { code: 'ita', name: 'Italian' },
  { code: 'prt', name: 'Portuguese' }, { code: 'rus', name: 'Russian' },
  { code: 'ukr', name: 'Ukrainian' }, { code: 'chn', name: 'Chinese' },
  { code: 'jpn', name: 'Japanese' }, { code: 'kor', name: 'Korean' },
  { code: 'nld', name: 'Dutch' }, { code: 'tur', name: 'Turkish' },
  { code: 'ind', name: 'Hindi' }, { code: 'ara', name: 'Arabic' },
];

const enMap = en as Record<string, string>;
const masterKeys = Object.keys(enMap);

// Section/context from key prefix → human label for translators.
function section(key: string): string {
  if (key.startsWith('vision.')) return 'Vision';
  if (key.startsWith('heroglyph.intro')) return 'Heroglyph — sales';
  if (key.startsWith('heroglyph.flow')) return 'Heroglyph — flow';
  if (key.startsWith('heroglyph.checkout') || key.startsWith('payment.')) return 'Checkout / Payment';
  if (key.startsWith('religion.')) return 'Religion / DOGMA';
  if (key.startsWith('about.')) return 'About';
  if (key.startsWith('welcome.')) return 'Welcome (post-pay)';
  if (key.startsWith('login.')) return 'Login / Auth';
  if (key.startsWith('transparency.')) return 'Transparency';
  if (key.startsWith('terms.') || key.startsWith('privacy.') || key.startsWith('legal.')) return 'Legal';
  if (key.startsWith('nav.') || key.startsWith('pack.')) return 'Nav / Pack';
  return 'Other';
}

const dicts: Record<string, Record<string, string>> = {};
for (const { code } of LANGS) {
  try {
    const mod = await import(`../src/i18n/locales/${code}`);
    dicts[code] = (mod[code] ?? mod.default) as Record<string, string>;
  } catch { dicts[code] = {}; }
}

// ---- CSV ----
const csvEsc = (s: string) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const header = ['key', 'section', ...LANGS.map((l) => l.name)];
const rows = [header.map(csvEsc).join(',')];
for (const key of masterKeys) {
  const cells = [key, section(key), ...LANGS.map((l) => dicts[l.code]?.[key] ?? '')];
  rows.push(cells.map(csvEsc).join(','));
}
const OUT = '../dashboard/embeds/translations';
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/translations-master.csv`, '﻿' + rows.join('\r\n'));

// ---- coverage stats ----
const stats = LANGS.map((l) => {
  const d = dicts[l.code] ?? {};
  const have = masterKeys.filter((k) => k in d).length;
  const enLeak = masterKeys.filter((k) => d[k] !== undefined && d[k] === enMap[k]).length;
  return { ...l, have, total: masterKeys.length, enLeak };
});

// ---- HTML ----
const htmlEsc = (s: string) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
const statRows = stats.map((s) => {
  const pct = Math.round((s.have / s.total) * 100);
  return `<tr><td>${s.name} <code>${s.code}</code></td><td>${s.have}/${s.total} (${pct}%)</td><td>${s.code === 'en' ? '—' : s.enLeak}</td></tr>`;
}).join('\n');

const bodyRows = masterKeys.map((key) => {
  const tds = LANGS.map((l) => `<td>${htmlEsc(dicts[l.code]?.[key] ?? '')}</td>`).join('');
  return `<tr data-sec="${section(key)}"><td class="k">${htmlEsc(key)}</td><td class="sec">${section(key)}</td>${tds}</tr>`;
}).join('\n');

const sections = [...new Set(masterKeys.map(section))];
const html = `<!doctype html><html lang="sk"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DOGYPT — Preklady (18 jazykov)</title>
<style>
:root{--gold:#C99A3F;--bg:#0d0d0d;--pane:#161616;--ink:#eee;--dim:#999;--line:#2a2a2a}
*{box-sizing:border-box}body{margin:0;font:14px/1.5 'Space Grotesk',system-ui,sans-serif;background:var(--bg);color:var(--ink)}
header{padding:20px 24px;border-bottom:1px solid var(--line)}
h1{font:700 22px Cinzel,serif;color:var(--gold);margin:0 0 6px}
.sub{color:var(--dim);max-width:60ch}
.bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:14px 24px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg);z-index:5}
.bar input,.bar select{background:var(--pane);border:1px solid var(--line);color:var(--ink);padding:7px 10px;border-radius:6px}
.bar a.dl{margin-left:auto;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:#1a1a1a;font-weight:700;text-decoration:none;padding:8px 14px;border-radius:8px}
.legend{padding:14px 24px;display:grid;gap:16px;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--line)}
.legend h3{font:700 13px Cinzel,serif;color:var(--gold);margin:0 0 8px;text-transform:uppercase;letter-spacing:.08em}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border:1px solid var(--line);padding:6px 9px;text-align:left;vertical-align:top}
th{position:sticky;top:0;background:var(--pane);color:var(--gold);font-weight:700;white-space:nowrap}
td.k{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim);white-space:nowrap}
td.sec{color:var(--gold);white-space:nowrap;font-size:11px}
.statbox table{width:auto}.statbox td,.statbox th{font-size:12px}
.wrap{overflow:auto;max-height:62vh}
.note{padding:14px 24px;color:var(--dim);font-size:12px;border-top:1px solid var(--line)}
code{background:#222;padding:1px 5px;border-radius:4px;font-size:11px}
</style></head><body>
<header>
  <h1>DOGYPT — Preklady webu + flow</h1>
  <div class="sub">Master tabuľka pre prekladateľov. <b>EN = zdroj pravdy.</b> Strojové preklady (2026-06-17) čakajú na ľudskú revíziu. Prekladateľ: oprav svoj stĺpec, prázdne = padá na EN.</div>
</header>
<div class="bar">
  <input id="q" placeholder="Hľadať v kľúči / texte…" oninput="filt()">
  <select id="sec" onchange="filt()"><option value="">— všetky sekcie —</option>${sections.map((s) => `<option>${s}</option>`).join('')}</select>
  <span id="count" style="color:var(--dim)"></span>
  <a class="dl" href="translations-master.csv" download>⬇ Stiahnuť CSV (pre prekladateľov)</a>
</div>
<div class="legend">
  <div class="statbox"><h3>Pokrytie jazykov</h3>
    <table><thead><tr><th>Jazyk</th><th>Kľúče</th><th>= EN (leak/brand)</th></tr></thead><tbody>${statRows}</tbody></table>
  </div>
  <div><h3>Glosár — NEPREKLADAŤ (ostáva EN)</h3>
    <p style="color:var(--dim);font-size:12px;margin:0">DOGYPT · DOGYPTISM · Dogyptian · DOGMA · Heroglyph · Hekthor · DEVOTION · bones · Pack · domény · „GOD is DOG" · „pawtner".<br><br>
    <b style="color:var(--gold)">Motto „IN DOG WE TRUST"</b> = prekladá sa per jazyk ako paródia na „In God We Trust" (God→Dog). Sporné verzie sú vo <code>flags-&lt;lang&gt;.md</code> — vyžadujú ľudskú revíziu.</p>
  </div>
</div>
<div class="wrap"><table id="t"><thead><tr><th>kľúč</th><th>sekcia</th>${LANGS.map((l) => `<th>${l.name}<br><code>${l.code}</code></th>`).join('')}</tr></thead>
<tbody>${bodyRows}</tbody></table></div>
<div class="note">Generované z <code>vystupy/web/src/i18n/locales/*.ts</code> · ${masterKeys.length} kľúčov × ${LANGS.length} jazykov · ${new Date ? '' : ''}2026-06-17. Re-generovať: <code>npx tsx scripts/i18n-make-table.mts</code>.</div>
<script>
function filt(){var q=document.getElementById('q').value.toLowerCase(),s=document.getElementById('sec').value,r=document.querySelectorAll('#t tbody tr'),n=0;
r.forEach(function(tr){var okS=!s||tr.dataset.sec===s,okQ=!q||tr.textContent.toLowerCase().indexOf(q)>-1,show=okS&&okQ;tr.style.display=show?'':'none';if(show)n++;});
document.getElementById('count').textContent=n+' riadkov';}
filt();
</script>
</body></html>`;
writeFileSync(`${OUT}/index.html`, html);
console.log(`CSV + index.html → vystupy/dashboard/embeds/translations/  (${masterKeys.length} keys × ${LANGS.length} langs)`);
console.log('coverage:', stats.map((s) => `${s.code}:${s.have}`).join(' '));
