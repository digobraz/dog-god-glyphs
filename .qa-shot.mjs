// DOČASNÝ — kolo 2 prevodu /pack, po kontrole zmazať.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const CESTY = [['pack','/pack'],['profile','/pack/profile'],['dogs','/pack/dogs'],
  ['quiz','/pack/nature'],['map','/pack/map'],['triplist','/pack/map/triplist'],
  ['add','/pack/add'],['addtrip','/pack/add/trip']];
const b = await chromium.launch();
for (const [meno, cesta] of CESTY) {
  const p = await b.newPage({ viewport: { width: 500, height: 1100 } });
  await p.goto('http://localhost:5178' + cesta, { waitUntil: 'networkidle', timeout: 30000 }).catch(()=>{});
  await p.getByText('ONLY NECESSARY').click({ timeout: 3000 }).catch(()=>{});
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `${OUT}/${meno}.png`, fullPage: true });
  await p.close();
  console.log('  ✓', meno);
}
await b.close();
