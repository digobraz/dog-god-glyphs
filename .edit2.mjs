import { chromium } from 'playwright';
import fs from 'node:fs';
const [S, SRC, OUT, EN] = process.argv.slice(2);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage();
await p.goto('file://' + S + '/edit.html');
const png = 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64');
const url = await p.evaluate(async ({ png, EN }) => {
  for (const f of ['700 72px F','600 72px F','400 40px F','500 40px F']) await document.fonts.load(f);
  const img = new Image(); img.src = png; await img.decode();
  const c = document.getElementById('c'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  // text color sample = darkest pixel in "68"
  const d = x.getImageData(947, 2023, 62, 50).data; let best = [255,255,255], s = 999;
  for (let i = 0; i < d.length; i += 4) { const v = d[i]+d[i+1]+d[i+2]; if (v < s) { s = v; best = [d[i],d[i+1],d[i+2]]; } }
  const ink = `rgb(${best.join(',')})`; const bg = 'rgb(249,242,225)';
  // column centers from the dividers: find dark vertical lines in row 2040
  const row = x.getImageData(0, 2000, img.width, 1).data; const div = [];
  for (let xx = 300; xx < 900; xx++) { const i = xx*4; if (row[i] < 200 && row[i+2] < 150) div.push(xx); }
  const groups = []; for (const v of div) { if (!groups.length || v - groups.at(-1).at(-1) > 3) groups.push([v]); else groups.at(-1).push(v); }
  const dv = [422.5, 788.5];
  const L = 60, R = 1145; const cx = [(L + dv[0]) / 2, (dv[0] + dv[1]) / 2, (dv[1] + R) / 2];
  const patch = (a, z, y0, h, sx) => { for (let yy = y0; yy < y0 + h; yy++) { const q = x.getImageData(sx, yy, 1, 1).data; x.fillStyle = `rgb(${q[0]},${q[1]},${q[2]})`; x.fillRect(a, yy, z - a, 1); } };
  patch(dv[1] + 8, R - 12, 2012, 70, dv[1] + 10);
  x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  x.font = '600 72px F'; x.fillText('135', cx[2], 2073);
  if (EN === '1') {
    const lab = ['followers', 'following', 'brought in'];
    const edges = [[L + 14, dv[0] - 8], [dv[0] + 8, dv[1] - 8], [dv[1] + 8, R - 14]];
    x.font = '400 40px F';
    edges.forEach(([a, z], i) => { patch(a, z, 2092, 60, a + 2); x.fillStyle = ink; x.fillText(lab[i], cx[i], 2137); });
  }
  return { url: c.toDataURL('image/png'), ink, dv, cx };
}, { png, EN });
console.log(JSON.stringify({ ink: url.ink, dv: url.dv, cx: url.cx }));
fs.writeFileSync(OUT, Buffer.from(url.url.split(',')[1], 'base64'));
await b.close();
