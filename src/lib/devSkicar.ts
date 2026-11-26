import { IS_APP } from './isApp';

// ═══════════════════════════════════════════════════════════════════════════
// SKICÁR V SIMULÁTORE (26. 11. 2026)
//
// Matej: *„vedel by si mi priamo v tom okne vytvoriť jednoduchý skicár štetec
// s ktorým by som ti tam kreslil čo by som chcel zmeniť posunúť atď?“*
//
// Ceruzka na pravom okraji → plátno cez obrazovku → červený štetec, veta textom
// → ULOŽIŤ: dev server odfotí simulátor aj s kresbou (`/__skica` vo vite.config.ts)
// do `~/AI/DOGYPT/.skice/`. Matej potom napíše „pozri skicu“.
// Čistý DOM, žiadny React — nesmie sa dotknúť stromu appky.
// Telo celé za `import.meta.env.DEV` ⇒ v žiadnom builde (web, appka) neexistuje.
// ═══════════════════════════════════════════════════════════════════════════
if (import.meta.env.DEV && IS_APP) {
  const RED = '#E0262B';
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, css: Partial<CSSStyleDeclaration>, text?: string) => {
    const n = document.createElement(tag);
    Object.assign(n.style, css);
    if (text) n.textContent = text;
    return n;
  };
  const btnCss: Partial<CSSStyleDeclaration> = {
    font: '600 14px system-ui', padding: '10px 12px', borderRadius: '8px', border: 'none',
    background: '#fff', color: '#111', boxShadow: '0 2px 8px rgba(0,0,0,.25)',
  };

  const start = () => {
    const pen = el('button', {
      // Pod spodným navom, v páse domovského indikátora — nezavadzia (Matej 26. 11.).
      position: 'fixed', left: '50%', bottom: '2px', transform: 'translateX(-50%)', zIndex: '2147483646',
      width: '64px', height: '18px', padding: '0', border: 'none', borderRadius: '999px', background: RED, color: '#fff',
      font: '700 10px system-ui', letterSpacing: '.08em', boxShadow: '0 1px 6px rgba(0,0,0,.3)', opacity: '.85',
    }, 'SKICA');
    document.body.appendChild(pen);

    let layer: HTMLDivElement | null = null;
    pen.onclick = () => { if (!layer) open(); };

    function open() {
      pen.style.display = 'none';
      const dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth, H = window.innerHeight;
      layer = el('div', { position: 'fixed', inset: '0', zIndex: '2147483647', touchAction: 'none' });
      const cv = el('canvas', { position: 'absolute', inset: '0', width: W + 'px', height: H + 'px' });
      cv.width = W * dpr; cv.height = H * dpr;
      const ctx = cv.getContext('2d')!;
      ctx.scale(dpr, dpr); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = RED; ctx.lineWidth = 5;
      const strokes: { x: number; y: number }[][] = [];
      const redraw = () => {
        ctx.clearRect(0, 0, W, H);
        for (const s of strokes) {
          ctx.beginPath();
          s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
          if (s.length === 1) ctx.lineTo(s[0].x + 0.1, s[0].y);
          ctx.stroke();
        }
      };
      let cur: { x: number; y: number }[] | null = null;
      cv.onpointerdown = (e) => { cur = [{ x: e.clientX, y: e.clientY }]; strokes.push(cur); cv.setPointerCapture(e.pointerId); redraw(); };
      cv.onpointermove = (e) => { if (cur) { cur.push({ x: e.clientX, y: e.clientY }); redraw(); } };
      cv.onpointerup = () => { cur = null; };

      const bar = el('div', {
        position: 'absolute', left: '8px', right: '8px', bottom: 'calc(env(safe-area-inset-bottom) + 8px)',
        display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', borderRadius: '12px',
        background: 'rgba(17,17,17,.85)',
      });
      const note = el('input', { ...btnCss, flex: '1 1 100%', fontWeight: '400' }) as HTMLInputElement;
      note.placeholder = 'Jedna veta (nepovinné)';
      const undo = el('button', btnCss, 'Späť');
      const clear = el('button', btnCss, 'Zmazať');
      const close = el('button', btnCss, 'Zavrieť');
      const save = el('button', { ...btnCss, background: RED, color: '#fff', marginLeft: 'auto' }, 'Uložiť');
      undo.onclick = () => { strokes.pop(); redraw(); };
      clear.onclick = () => { strokes.length = 0; redraw(); };
      close.onclick = done;
      save.onclick = async () => {
        bar.style.visibility = 'hidden';
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const r = await fetch('/__skica', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ route: location.pathname + location.search, note: note.value.trim() }),
        }).catch(() => null);
        bar.style.visibility = 'visible';
        if (r?.ok) { save.textContent = 'Uložené'; setTimeout(done, 700); }
        else save.textContent = 'Chyba, skús znova';
      };
      bar.append(note, undo, clear, close, save);
      layer.append(cv, bar);
      document.body.appendChild(layer);
    }

    function done() {
      layer?.remove(); layer = null;
      pen.style.display = '';
    }
  };

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
}
