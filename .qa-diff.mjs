import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage();
for (const n of ['pack','profile','dogs','quiz','map','triplist','add','addtrip']) {
  const A = readFileSync(`/private/tmp/claude-501/-Users-stachoman-AI-DOGYPT/4c0f24f3-00e1-4d60-af1e-a6cfb67b13d7/scratchpad/pred/${n}.png`).toString('base64');
  const B = readFileSync(`/private/tmp/claude-501/-Users-stachoman-AI-DOGYPT/4c0f24f3-00e1-4d60-af1e-a6cfb67b13d7/scratchpad/po/${n}.png`).toString('base64');
  const r = await p.evaluate(async ([a, c]) => {
    const load = (d) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + d; });
    const [ia, ib] = await Promise.all([load(a), load(c)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { rozmer: true };
    const cv = (im) => { const c2 = document.createElement('canvas'); c2.width = im.width; c2.height = im.height;
      const x = c2.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height).data; };
    const da = cv(ia), db = cv(ib);
    let n2 = 0; const pasy = {};
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.abs(da[i]-db[i]) + Math.abs(da[i+1]-db[i+1]) + Math.abs(da[i+2]-db[i+2]);
      if (d > 8) { n2++; const y = Math.floor((i/4) / ia.width); const pas = Math.floor(y/100)*100; pasy[pas]=(pasy[pas]||0)+1; }
    }
    const top = Object.entries(pasy).sort((x,y)=>y[1]-x[1]).slice(0,5);
    return { n: n2, celkom: da.length/4, top };
  }, [A, B]);
  if (r.rozmer) { console.log(`${n}: iný rozmer`); continue; }
  console.log(`${n.padEnd(9)} zmenených ${String(r.n).padStart(7)} px (${(100*r.n/r.celkom).toFixed(2)} %)  najviac v pásmach y: ${r.top.map(([y,c])=>`${y}(${c})`).join(' ')}`);
}
await b.close();
