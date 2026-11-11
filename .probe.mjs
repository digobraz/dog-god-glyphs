import { chromium } from 'playwright'; import fs from 'node:fs';
const [S, SRC] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + S + '/edit.html');
const png = 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64');
console.log(await p.evaluate(async (png) => { const img = new Image(); img.src = png; await img.decode(); const c = document.getElementById('c'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img,0,0);
 const out=[]; const r = x.getImageData(0, 2060, img.width, 1).data; for (let xx=300; xx<900; xx++){ const i=xx*4; if (Math.abs(r[i]-249)+Math.abs(r[i+1]-242)+Math.abs(r[i+2]-225) > 40) out.push(xx+':'+r[i]+','+r[i+1]+','+r[i+2]); } return out.join(' '); }, png));
await b.close();
