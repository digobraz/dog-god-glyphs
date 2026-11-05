// DOG ID NA TLAČ (Matej 4. 11. 2026: „pri dokumentoch vygenerovať PDF DOG ID a vytlačiť").
// DOM → obrázok → PDF A4. Text cez jsPDF by nevedel slovenskú diakritiku bez vloženého písma, html-to-image áno.
// Stránkuje sa po BLOKOCH, nie rezom cez výšku, aby sa riadok nikdy nerozťal na dve strany.
// 🔒 ZÁVET DO TLAČE NEJDE: papier nesie opatrovateľ a veterinár, list dedičovi im nepatrí.
// ⚠️ Súbor sa nikam nenahráva. Sú v ňom zdravotné údaje a telefón, verejná adresa na CDN by ich vystavila.
import { PASS_GROUPS, STEP_BY_FIELD, FLOW_EXTRA_FIELDS } from './dogQuiz';
import { passPlainValue, capSpecials, type FixedRow } from './DogPassport';
import { readLatest, hasValue } from '@/lib/dogEvents';
import { drawNode, imagesToPdfAndShare, safeFileName, toDataUrl } from '@/lib/sheetPdf';
import { PACK_THEME as T } from './packTheme';

const A4_W = 794;
const A4_H = 1123;
const PAD = 48;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

type Input = {
  dogId: string; dogName: string; number: string; photoUrl: string | null;
  glyphNode: Element | null; fixedRows: Record<string, FixedRow[]>;
  tx: (k: string, f: string) => string; loc: string;
};

type Group = { title: string; rows: string[]; note: string };

/** Skupiny po riadkoch, aby sa dlhá skupina dala rozdeliť medzi strany bez orezania. */
function groups({ fixedRows, tx, loc }: Input, latest: Awaited<ReturnType<typeof readLatest>>): Group[] {
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
    return {
      title: tx(g.i18n, g.labelEN),
      rows: [...fixed, ...rows].map(([l, v]) =>
        `<div style="display:flex;gap:16px;padding:4px 0;border-bottom:1px solid ${T.hairline}"><span style="flex:0 0 200px;color:#7a5a2a">${esc(l)}</span><b style="font-weight:500;flex:1">${esc(v) || '&nbsp;'}</b></div>`),
      note: typeof note === 'string' && note ? `<p style="font-style:italic;color:#7a5a2a;margin:8px 0 0">„${esc(note)}“</p>` : '',
    };
  });
}

/** Vyrobí PDF. `handed: false` = zariadenie ho nevie odovzdať · `photoOk: false` = fotka sa ani na štvrtý pokus nenakreslila. */
export async function exportDogIdPdf(input: Input): Promise<{ handed: boolean; photoOk: boolean }> {
  const latest = await readLatest(input.dogId, { strict: true });
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
  // Strana pretiekla, keď jej obsah presiahne výšku A4.
  const fits = (p: HTMLElement) => p.scrollHeight <= p.clientHeight + 1;
  try {
    await document.fonts.ready;
    const pages = [page()];
    const last = () => pages[pages.length - 1];
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;align-items:center;gap:24px;margin-bottom:24px';
    head.innerHTML = `${photo ? `<img data-photo src="${photo}" alt="" style="width:112px;height:112px;border-radius:50%;object-fit:cover;border:2px solid ${T.accentGold}">` : ''}<div style="flex:1"><div style="font:500 10px 'Space Grotesk';letter-spacing:.26em">DOG ID</div><div style="font:700 32px 'Cinzel Decorative',Cinzel,serif;text-transform:uppercase">${esc(input.dogName)}</div><div style="font-weight:600">${esc(input.number)}</div></div>`; /* písmo: nadpis */
    pages[0].appendChild(head);
    if (input.glyphNode) {
      const g = input.glyphNode.cloneNode(true) as HTMLElement;
      g.style.cssText = 'width:100%;max-width:none;margin:0 0 24px';
      pages[0].appendChild(g);
      // Heroglyf, ktorý sa so záhlavím nezmestí, sa zúži, aby ho strana neorezala.
      if (!fits(pages[0])) g.style.width = '55%';
    }
    // Skupina ide po riadkoch: čo sa nezmestí, pokračuje na ďalšej strane pod rovnakým nadpisom, nič sa neorezáva.
    for (const grp of groups(input, latest)) {
      const section = (cont: boolean) => {
        const sec = document.createElement('section');
        sec.style.marginBottom = '24px';
        const h = document.createElement('h2');
        h.style.cssText = "font:700 16px Cinzel,serif;letter-spacing:.14em;text-transform:uppercase;margin:0 0 8px"; /* písmo: nadpis */
        h.textContent = cont ? `${grp.title} …` : grp.title;
        sec.appendChild(h);
        last().appendChild(sec);
        return sec;
      };
      const items = [...grp.rows, ...(grp.note ? [grp.note] : [])];
      let sec = section(false);
      let placed = 0;
      for (const html of items) {
        const wrap = document.createElement('div');
        wrap.innerHTML = html;
        const el = wrap.firstElementChild as HTMLElement;
        sec.appendChild(el);
        if (!fits(last())) {
          sec.removeChild(el);
          if (sec.children.length === 1) sec.remove(); // nadpis sám dole na strane
          pages.push(page());
          sec = section(placed > 0);
          sec.appendChild(el);
        }
        placed += 1;
      }
    }
    const images: { dataUrl: string; format: 'JPEG' }[] = [];
    let photoOk = true;
    for (let i = 0; i < pages.length; i += 1) {
      const r = await drawNode(pages[i], { photoSelector: i === 0 ? 'img[data-photo]' : undefined, jpeg: true, pixelRatio: 2, width: A4_W, height: A4_H });
      if (!r.photoOk) photoOk = false;
      images.push({ dataUrl: r.dataUrl, format: 'JPEG' });
    }
    const handed = await imagesToPdfAndShare(images, safeFileName('DOG-ID', input.dogName));
    return { handed, photoOk };
  } finally {
    host.remove();
  }
}
