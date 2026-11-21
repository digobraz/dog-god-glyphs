// Písma brandu pre export do obrázka (núdzová kartička, leták): `html-to-image` bez tohto prejde VŠETKY štýly stránky vrátane
// Google Fonts (Inter, JetBrains Mono) a sťahuje ich z cudzieho servera. Tu sa berie len to, čo je z VLASTNÉHO pôvodu (`/fonts/g/…`
// a inline `@font-face` z `firaUi.ts`) a len písma brandu, ktoré uzol naozaj používa. Výsledok ide do `fontEmbedCSS`.
import { blobToDataUrl } from '@/lib/sheetPdf';

const BRAND_FAMILIES = new Set(['cinzel', 'cinzel decorative', 'space grotesk', 'lt museum']);
const urlCache = new Map<string, Promise<string | null>>();

const dataUrlOf = (url: string): Promise<string | null> => {
  let p = urlCache.get(url);
  if (!p) {
    p = fetch(url).then((r) => (r.ok ? r.blob() : null)).then((b) => (b ? blobToDataUrl(b) : null)).catch(() => null);
    urlCache.set(url, p);
  }
  return p;
};

const unquote = (v: string) => v.trim().replace(/^['"]|['"]$/g, '').toLowerCase();

/** Rodina + váha, ktoré uzol a jeho potomkovia používajú (`cinzel|700`). */
function usedFaces(node: HTMLElement): Set<string> {
  const out = new Set<string>();
  const add = (el: Element) => {
    const cs = getComputedStyle(el);
    const fam = unquote(cs.fontFamily.split(',')[0] ?? '');
    if (BRAND_FAMILIES.has(fam)) out.add(`${fam}|${Math.round(Number(cs.fontWeight) / 100) * 100}`);
  };
  add(node);
  node.querySelectorAll('*').forEach(add);
  return out;
}

const weightIn = (rule: string, w: number): boolean => {
  const m = /font-weight:\s*(\d+)(?:\s+(\d+))?/.exec(rule);
  if (!m) return true;
  const lo = Number(m[1]); const hi = m[2] ? Number(m[2]) : lo;
  return w >= lo && w <= hi;
};

/** `@font-face` písma brandu z vlastného pôvodu s `url()` nahradenými `data:`; `''`, keď nič také nie je (volajúci nechá predvolené). */
export async function brandFontEmbedCSS(node: HTMLElement): Promise<string> {
  const used = usedFaces(node);
  if (!used.size) return '';
  const rules: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let list: CSSRuleList;
    try { list = sheet.cssRules; } catch { continue; }   // cudzí štýl (Google Fonts): nečitateľný, a práve ten nechceme
    for (const r of Array.from(list)) {
      if (r.type !== CSSRule.FONT_FACE_RULE) continue;
      const css = r.cssText;
      const fam = unquote(/font-family:\s*([^;]+);/.exec(css)?.[1] ?? '');
      if (!BRAND_FAMILIES.has(fam)) continue;
      if (![...used].some((u) => { const [f, w] = u.split('|'); return f === fam && weightIn(css, Number(w)); })) continue;
      const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
      if (urls.some((u) => /^https?:\/\//.test(u) && !u.startsWith(location.origin))) continue;
      let out = css;
      let ok = true;
      for (const u of urls) {
        if (u.startsWith('data:')) continue;
        const d = await dataUrlOf(new URL(u, location.href).href);
        if (!d) { ok = false; break; }
        out = out.split(u).join(d);
      }
      if (ok) rules.push(out);
    }
  }
  return rules.join('\n');
}
