import { chromium } from 'playwright';
import fs from 'node:fs';
const [S, SRC, OUT, LANG, NUM, LBL1, LBL2, LBL3, PROBE] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage();
await p.goto('file://' + S + '/edit.html');
const png = 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64');
const res = await p.evaluate(async ({ png, NUM, LANG, L, PROBE }) => {
  await document.fonts.load('600 70px F'); await document.fonts.load('400 40px F'); await document.fonts.load('700 70px F');
  const img = new Image(); img.src = png; await img.decode();
  const c = document.getElementById('c'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  if (PROBE === '1') {
    // find dark-text bounding rows/cols in counter box region
    const d = x.getImageData(0, 1950, img.width, 260).data; const rows = [];
    for (let yy = 0; yy < 260; yy++) { let n = 0, minx = 1e9, maxx = -1; for (let xx = 60; xx < img.width - 60; xx++) { const i = (yy * img.width + xx) * 4; if (d[i] < 90 && d[i+1] < 80 && d[i+2] < 70) { n++; if (xx < minx) minx = xx; if (xx > maxx) maxx = xx; } } if (n) rows.push([1950 + yy, n, minx, maxx]); }
    const bg = x.getImageData(800, 1990, 1, 1).data;
    return { rows, bg: [...bg] };
  }
  return null;
}, { png, NUM, LANG, L: [LBL1, LBL2, LBL3], PROBE });
console.log(JSON.stringify(res));
await b.close();
