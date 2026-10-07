/**
 * 🔴 PREKLADY V DVOCH KUSOCH: JADRO + APPKA (perf 7. 10. 2026, Matej: „všetky stránky musia byť do 2 sekúnd").
 *
 * Meranie: `en.ts` mal v hlavnom balíku 328 kB, z toho 220 kB boli kľúče `pack.*` — texty appky,
 * ktoré verejná stránka (/terms, /heroglyph, /dog/…) nikdy nezobrazí. SK návštevník ťahal to isté
 * druhý raz v `sk.ts`. Súbory `src/i18n/locales/*.ts` sa NEMENIA (píšu ich ľudia aj generátory);
 * delí ich až tento plugin pri načítaní:
 *
 *   virtual:i18n/<jazyk>/core  — všetko, čo nie je `pack.*`, + `pack.*` kľúče, ktoré čítajú
 *                                súbory MIMO appky (sken nižšie; inak by na verejnej stránke
 *                                prebleskol holý kľúč)
 *   virtual:i18n/<jazyk>/pack  — zvyšok `pack.*`; LanguageContext ho dotiahne pred obrazovkou appky
 *
 * Sken „mimo appky": každý reťazec `pack.xxx` v src/ mimo components/pack a pages/Pack* sa berie
 * ako PREDPONA (pokryje aj `t(\`pack.ladder.${k}\`)`). Radšej kľúč navyše v jadre než holý kľúč.
 */
import fs from 'fs';
import path from 'path';
import { transformWithEsbuild, type Plugin } from 'vite';

const PREFIX = 'virtual:i18n/';
const RESOLVED = '\0' + PREFIX;

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Súbor patrí appke /pack — jeho `pack.*` kľúče môžu ísť do lazy kusu. */
const isPackFile = (rel: string) =>
  rel.startsWith('components/pack/') || /^pages\/Pack[^/]*\.tsx?$/.test(rel) || rel.startsWith('i18n/');

function scanPublicPackPrefixes(srcDir: string): string[] {
  const set = new Set<string>();
  for (const f of walk(srcDir)) {
    const rel = path.relative(srcDir, f).split(path.sep).join('/');
    if (isPackFile(rel) || rel.startsWith('test/')) continue;
    const txt = fs.readFileSync(f, 'utf8');
    for (const m of txt.matchAll(/pack\.[A-Za-z0-9_.]+/g)) set.add(m[0]);
  }
  return [...set];
}

export function i18nSplit(): Plugin {
  let srcDir = '';
  let pubCache: { t: number; p: string[] } | null = null;
  return {
    name: 'i18n-split',
    enforce: 'pre',
    configResolved(c) { srcDir = path.resolve(c.root, 'src'); },
    resolveId(id) { return id.startsWith(PREFIX) ? RESOLVED + id.slice(PREFIX.length) : null; },
    async load(id) {
      if (!id.startsWith(RESOLVED)) return null;
      const [lang, part] = id.slice(RESOLVED.length).split('/');
      const file = path.join(srcDir, 'i18n', 'locales', `${lang}.ts`);
      this.addWatchFile(file);
      const js = (await transformWithEsbuild(fs.readFileSync(file, 'utf8'), file, { loader: 'ts', format: 'esm' })).code;
      const mod = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
      const dict = (mod[lang] ?? Object.values(mod)[0]) as Record<string, string>;
      // Sken raz za ~5 s (build volá load 36×; dev po zmene súboru sken zopakuje).
      if (!pubCache || Date.now() - pubCache.t > 5000) pubCache = { t: Date.now(), p: scanPublicPackPrefixes(srcDir) };
      const pub = pubCache.p;
      const inCore = (k: string) => !k.startsWith('pack.') || pub.some((p) => k.startsWith(p));
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(dict)) if ((part === 'core') === inCore(k)) out[k] = v;
      return `export default ${JSON.stringify(out)};`;
    },
  };
}
