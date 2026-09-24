import { chromium } from 'playwright';
const S=process.env.S; const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:430,height:900}});
const q = await ctx.newPage(); const errs=[]; q.on('pageerror',e=>errs.push(e.message));
await q.goto(process.env.UB); await q.waitForURL(u=>!u.toString().includes('/login'),{timeout:30000}).catch(()=>{});
await q.goto('http://localhost:8080/pack/map'); await q.waitForTimeout(5000);
for (let i=0;i<4;i++){ await q.click('.leaflet-control-zoom-out').catch(()=>{}); await q.waitForTimeout(900); }
await q.waitForTimeout(1500);
const findPeach = async()=>{ for (const el of await q.$$('.mk-circle, .mn-cluster')) { if ((await el.textContent()).includes('🍑')) return el; } return null; };
let peach = await findPeach(); console.log('peach found', !!peach);
await q.screenshot({path:`${S}/b1.png`});
if (peach) { await peach.click({force:true}); await q.waitForTimeout(1800); }
await q.screenshot({path:`${S}/b2.png`});
const meToo = await q.$('.wl-btn--ghost'); if (meToo) { await meToo.click(); await q.waitForTimeout(800); }
const wchips = await q.$$('.wl-chip'); console.log('when chips', wchips.length);
await q.screenshot({path:`${S}/b3.png`});
if (wchips[5]) { await wchips[5].click(); await q.waitForTimeout(3000); }
peach = await findPeach(); if (peach) { await peach.click({force:true}); await q.waitForTimeout(1800); }
console.log('crowd', await q.$eval('.wl-crowd', e=>e.textContent).catch(()=>null));
await q.screenshot({path:`${S}/b5.png`});
const writes = await q.$$('.wl-btn--cta'); console.log('write btns', writes.length);
if (writes[0]) { await writes[0].click(); await q.waitForTimeout(4000); }
await q.screenshot({path:`${S}/b6.png`});
console.log('msg', await q.$eval('.wl-msg', e=>e.textContent).catch(()=>null));
console.log('errors', errs.slice(0,5));
await b.close();
