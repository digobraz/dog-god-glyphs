// QA /pack kolo 1 (LEN ČÍTANIE). Spusti z vystupy/web: node test-a.mjs [--explore]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const OUT = '/private/tmp/claude-501/-Users-stachoman-AI-DOGYPT/2dd67db7-70bc-453a-a0c0-d1da7a735375/scratchpad/pack1';
const ORIGIN = 'https://dogypt.com', REF = 'lnzurwmdgvzlqhsbhrvi', SB = `https://${REF}.supabase.co`, EMAIL = 'hekthorsk+straz@gmail.com';
const kc = (s, a) => execSync(`security find-generic-password -s ${s} -a ${a} -w`, { stdio: ['ignore','pipe','ignore'] }).toString().trim();
const PUB = readFileSync('/Users/stachoman/AI/DOGYPT/vystupy/web/src/lib/env.ts','utf8').match(/sb_publishable_[\w-]+/)[0];
const r = await fetch(`${SB}/auth/v1/token?grant_type=password`, { method:'POST', headers:{apikey:PUB,'content-type':'application/json'}, body: JSON.stringify({email:EMAIL,password:kc('dogypt-straz-ucet',EMAIL)}) });
const session = await r.json(); if(!process.env.NOBYPASS){ session.user.user_metadata={...session.user.user_metadata,terms_ok:{v:1,at:new Date().toISOString()}}; } if (!session.access_token) throw new Error('login fail');
const UA_M='Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1';
const UA_P='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const VY=[{n:'mobil',viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:UA_M},{n:'pc',viewport:{width:1477,height:724},userAgent:UA_P}];
const ROUTES = JSON.parse(process.env.ROUTES || '["/pack","/pack/profile","/pack/dogs","/pack/dogs/dogid","/pack/ainubis","/pack/map"]');
const browser = await chromium.launch();
const all = [];
for (const v of VY) {
  const ctx = await browser.newContext({viewport:v.viewport,isMobile:!!v.isMobile,hasTouch:!!v.hasTouch,userAgent:v.userAgent});
  await ctx.addInitScript(([k,s])=>{ try{localStorage.setItem(k,s)}catch{} }, [`sb-${REF}-auth-token`, JSON.stringify(session)]);
  await ctx.addInitScript(()=>{ try{localStorage.setItem('dogypt_consent',JSON.stringify({analytics:false,marketing:false,v:1,ts:Date.now()}))}catch{} });
  await ctx.addInitScript(()=>{
    Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});
    window.__lt=[]; try{ new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__lt.push(Math.round(e.duration))}).observe({type:'longtask',buffered:true}); }catch{}
  });
  // zablokuj posthog zápisy (nenafúkni analytiku)
  if(!process.env.NOBYPASS) await ctx.route(/\/auth\/v1\/user(\?|$)/, async rt=>{ if(rt.request().method()!=='GET') return rt.continue(); const resp=await rt.fetch(); let j; try{j=await resp.json()}catch{return rt.fulfill({response:resp})} j.user_metadata={...j.user_metadata,terms_ok:{v:1,at:new Date().toISOString()}}; rt.fulfill({response:resp,json:j}); });
  await ctx.route(/posthog/, rt => rt.fulfill({status:200,body:'{}'}));
  for (const path of ROUTES) {
    const page = await ctx.newPage();
    const reqs=[], errs=[], cons=[], pady=[]; let bytes=0;
    const t0=Date.now();
    page.on('request', q=>{ q._t=Date.now(); });
    page.on('requestfinished', async q=>{ try{ const rs=await q.response(); const sz=(await q.sizes()).responseBodySize; bytes+=sz; reqs.push({u:q.url(),m:q.method(),s:rs.status(),ms:Date.now()-(q._t||t0),sz}); }catch{} });
    page.on('response', rs=>{ if(rs.status()>=400 && !/posthog/.test(rs.url())) errs.push(`${rs.status()} ${rs.url().slice(0,110)}`); });
    page.on('console', m=>{ if(m.type()==='error') cons.push(m.text().slice(0,140)); });
    page.on('pageerror', e=>pady.push(e.message.slice(0,140)));
    await page.goto(ORIGIN+path,{waitUntil:'domcontentloaded',timeout:60000}).catch(e=>pady.push('goto '+e.message.slice(0,80)));
    // použiteľnosť: čas, kedy body text > 200 znakov a stabilný
    let tUse=null;
    for (let i=0;i<120;i++){ const len=await page.evaluate(()=>document.body.innerText.length).catch(()=>0); if(len>200){tUse=Date.now()-t0;break;} await page.waitForTimeout(250); }
    await page.waitForTimeout(3500);
    const info = await page.evaluate(()=>{
      const imgs=[...document.images]; const broken=imgs.filter(i=>i.complete&&i.naturalWidth===0&&i.src).map(i=>i.src.slice(0,90));
      return {url:location.pathname, hs:document.documentElement.scrollWidth>innerWidth+1, sw:document.documentElement.scrollWidth, iw:innerWidth, lt:window.__lt||[], broken, nimg:imgs.length, txt:document.body.innerText.slice(0,160).replace(/\s+/g,' ')};
    });
    const sb = reqs.filter(q=>q.u.includes('supabase.co'));
    const key = q=>q.m+' '+q.u.replace(/\?.*$/,'').replace(/^https:\/\/[^/]+/,'')+ (q.u.includes('/rest/')?'?'+(q.u.split('?')[1]||'').slice(0,60):'');
    const cnt={}; for(const q of sb) cnt[key(q)]=(cnt[key(q)]||0)+1;
    const dup=Object.entries(cnt).filter(([,c])=>c>1);
    const slow=reqs.filter(q=>q.ms>800).map(q=>`${q.ms}ms ${q.u.slice(0,100)}`);
    const shot=`${OUT}/${v.n}${path.replace(/\//g,'_')}.png`;
    await page.screenshot({path:shot}).catch(()=>{});
    all.push({vy:v.n,path,final:info.url,tUse,reqs:reqs.length,kb:Math.round(bytes/1024),sb:sb.length,dup,slow,lt:info.lt.filter(x=>x>200).length+'/'+info.lt.length,ltmax:Math.max(0,...info.lt),errs,cons,pady,broken:info.broken,hs:info.hs?`${info.sw}>${info.iw}`:false,txt:info.txt,shot});
    await page.close();
  }
  await ctx.close();
}
await browser.close();
writeFileSync(OUT+'/result-a.json',JSON.stringify(all,null,1));
for(const a of all) console.log(JSON.stringify(a));
