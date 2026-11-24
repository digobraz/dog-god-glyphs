import { chromium } from 'playwright'; import fs from 'node:fs';
const [img, out] = process.argv.slice(2); const b64 = fs.readFileSync(img).toString('base64');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 840, height: 420 } });
await p.setContent(`<body style="margin:0;display:flex"><div style="background:#000;padding:10px"><img width=400 src="data:image/png;base64,${b64}"></div><div style="background:#F4EBD6;padding:10px"><img width=400 src="data:image/png;base64,${b64}"></div></body>`);
await p.screenshot({ path: out }); await b.close();
