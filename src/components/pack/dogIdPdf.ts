// DOG ID NA TLAČ (Matej 4. 11. 2026: „pri dokumentoch vygenerovať PDF DOG ID a vytlačiť").
// DOM → obrázok → PDF A4. Text cez jsPDF by nevedel slovenskú diakritiku bez vloženého písma, html-to-image áno.
// Stránkuje sa po BLOKOCH, nie rezom cez výšku, aby sa riadok nikdy nerozťal na dve strany.
// 🔒 ZÁVET DO TLAČE NEJDE: papier nesie opatrovateľ a veterinár, list dedičovi im nepatrí.
// ⚠️ Súbor sa nikam nenahráva. Sú v ňom zdravotné údaje a telefón, verejná adresa na CDN by ich vystavila.
import { PASS_GROUPS, STEP_BY_FIELD, FLOW_EXTRA_FIELDS } from './dogQuiz';
import { passPlainValue, capSpecials, type FixedRow } from './DogPassport';
import { readLatest, hasValue } from '@/lib/dogEvents';
import { IS_APP } from '@/lib/isApp';

const A4_W = 794;
const A4_H = 1123;
const PAD = 48;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

type Input = {
  dogId: string; dogName: string; number: string; photoUrl: string | null;
  glyphNode: Element | null; fixedRows: Record<string, FixedRow[]>;
  tx: (k: string, f: string) => string; loc: string;
};

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result));
      fr.onerror = () => rej(fr.error);
      fr.readAsDataURL(blob);
    });
  } catch { return null; }
}

function groupBlocks({ fixedRows, tx, loc }: Input, latest: Awaited<ReturnType<typeof readLatest>>): string[] {
  return PASS_GROUPS.filter((g) => g.key !== 'will').map((g) => {
    const fixed = (fixedRows[g.key] ?? []).map((r) => [tx(r.i18n, r.labelEN), r.value ?? '']);
    const rows = g.fields.flatMap((f) => {
      const step = STEP_BY_FIELD[f];
      if (!step) return [];
      const value = capSpecials(f, latest[f], latest);
      if (FLOW_EXTRA_FIELDS.has(f) && !hasValue(value)) return [];
      return [[tx(step.rowI18n, step.rowEN), hasValue(value) ? passPlainValue(step, value!.value, tx, loc) : '']];
    });
    const note = latest[`${g.key}.note`]?.value;
    const cells = [...fixed, ...rows].map(([l, v]) =>
      `<div style="display:flex;gap:16px;padding:4px 0;border-bottom:1px solid #E5D6B2"><span style="flex:0 0 200px;color:#7a5a2a">${esc(l)}</span><b style="font-weight:500;flex:1">${esc(v) || '&nbsp;'}</b></div>`).join('');
    return `<section style="margin-bottom:24px"><h2 style="font:700 16px Cinzel,serif;letter-spacing:.14em;text-transform:uppercase;margin:0 0 8px">${esc(tx(g.i18n, g.labelEN))}</h2>${cells}${typeof note === 'string' && note ? `<p style="font-style:italic;color:#7a5a2a;margin:8px 0 0">„${esc(note)}“</p>` : ''}</section>`;
  });
}

/** Vyrobí PDF. Vráti `false`, keď ho toto zariadenie nevie odovzdať (appka bez systémového zdieľania). */
export async function exportDogIdPdf(input: Input): Promise<boolean> {
  const latest = await readLatest(input.dogId);
  const photo = input.photoUrl ? await toDataUrl(input.photoUrl) : null;
  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-9999px;top:0;width:${A4_W}px;`;
  document.body.appendChild(host);
  const page = () => {
    const p = document.createElement('div');
    p.style.cssText = `width:${A4_W}px;height:${A4_H}px;padding:${PAD}px;box-sizing:border-box;overflow:hidden;background:#fff;color:#1F1A0E;font:400 14px/1.4 'Space Grotesk',sans-serif;`;
    host.appendChild(p);
    return p;
  };
  try {
    await document.fonts.ready;
    const pages = [page()];
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;gap:24px;margin-bottom:24px';
    head.innerHTML = `${photo ? `<img src="${photo}" alt="" style="width:112px;height:112px;border-radius:50%;object-fit:cover;border:2px solid #C99A3F">` : ''}<div style="flex:1"><div style="font:500 10px 'Space Grotesk';letter-spacing:.26em">DOG ID</div><div style="font:700 32px 'Cinzel Decorative',Cinzel,serif;text-transform:uppercase">${esc(input.dogName)}</div><div style="font-weight:600">${esc(input.number)}</div></div>`;
    pages[0].appendChild(head);
    if (input.glyphNode) {
      const g = input.glyphNode.cloneNode(true) as HTMLElement;
      g.style.cssText = 'width:100%;max-width:none;margin:0 0 24px';
      pages[0].appendChild(g);
    }
    const room = A4_H - 2 * PAD;
    let used = pages[0].scrollHeight - 2 * PAD;
    for (const html of groupBlocks(input, latest)) {
      const wrap = document.createElement('div');
      wrap.innerHTML = html;
      const block = wrap.firstElementChild as HTMLElement;
      pages[pages.length - 1].appendChild(block);
      const h = block.offsetHeight + 24;
      if (used + h > room) {
        pages.push(page());
        pages[pages.length - 1].appendChild(block);
        used = 0;
      }
      used += h;
    }
    const { toJpeg } = await import('html-to-image');
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    for (let i = 0; i < pages.length; i += 1) {
      const img = await toJpeg(pages[i], { pixelRatio: 2, quality: 0.92, width: A4_W, height: A4_H, cacheBust: false });
      if (i) pdf.addPage();
      pdf.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }
    const name = `DOG-ID-${input.dogName.replace(/[^\p{L}\p{N}]+/gu, '-')}.pdf`;
    const blob = pdf.output('blob');
    if (IS_APP) {
      const file = new File([blob], name, { type: 'application/pdf' });
      if (!navigator.canShare?.({ files: [file] })) return false;
      // Systémový hárok: na iPhone má Tlačiť aj Uložiť do Súborov.
      await navigator.share({ files: [file], title: name }).catch((e) => { if (e?.name !== 'AbortError') throw e; });
      return true;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } finally {
    host.remove();
  }
}
