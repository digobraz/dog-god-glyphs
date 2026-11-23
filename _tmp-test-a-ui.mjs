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

const browser=await chromium.launch();
const res=[];
for (const v of VY){
 const ctx=await browser.newContext({viewport:v.viewport,isMobile:!!v.isMobile,hasTouch:!!v.hasTouch,userAgent:v.userAgent});
 await ctx.addInitScript(([k,s])=>{localStorage.setItem(k,s);localStorage.setItem('dogypt_consent',JSON.stringify({analytics:false,marketing:false,v:1,ts:Date.now()}))},[`sb-${REF}-auth-token`,JSON.stringify(session)]);
 await ctx.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false});window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(Math.round(e.duration))}).observe({type:'longtask',buffered:true})}catch{}});
 await ctx.route(/\/auth\/v1\/user(\?|$)/, async rt=>{ if(rt.request().method()!=='GET') return rt.continue(); const resp=await rt.fetch(); let j=await resp.json(); j.user_metadata={...j.user_metadata,terms_ok:{v:1,at:new Date().toISOString()}}; rt.fulfill({response:resp,json:j}); });
 await ctx.route(/posthog/, rt=>rt.fulfill({status:200,body:'{}'}));
 const page=await ctx.newPage();
 let reqs=[],errs=[],cons=[],writes=[];
 page.on('requestfinished',async q=>{try{const rs=await q.response();reqs.push({u:q.url(),m:q.method(),s:rs.status(),sz:(await q.sizes()).responseBodySize})}catch{}});
 page.on('request',q=>{ if(q.method()!=='GET' && q.url().includes('supabase.co') && !/\/rpc\/|\/auth\/v1\/token/.test(q.url())) writes.push(q.method()+' '+q.url().slice(0,100)); });
 page.on('response',rs=>{if(rs.status()>=400&&!/posthog/.test(rs.url()))errs.push(`${rs.status()} ${rs.url().slice(0,110)}`)});
 page.on('console',m=>{if(m.type()==='error')cons.push(m.text().slice(0,140))});
 page.on('pageerror',e=>cons.push('PAGEERR '+e.message.slice(0,140)));
 const slug=n=>`${OUT}/ui-${v.n}-${n}.png`;
 async function step(name,fn,{wait=2500,shot=true}={}){
   reqs=[];errs=[];cons=[]; await page.evaluate(()=>{window.__lt=[]}).catch(()=>{});
   const t0=Date.now(); let ok=true,note='';
   try{await fn()}catch(e){ok=false;note=e.message.slice(0,100)}
   await page.waitForTimeout(wait);
   const m=await page.evaluate(()=>({p:location.pathname,hs:document.documentElement.scrollWidth>innerWidth+1,lt:(window.__lt||[]).filter(x=>x>200),txt:document.body.innerText.replace(/\s+/g,' ').slice(0,140),broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.src).map(i=>i.src.slice(0,80)),h:document.documentElement.scrollHeight})).catch(()=>({}));
   if(shot) await page.screenshot({path:slug(name)}).catch(()=>{});
   const sb=reqs.filter(q=>q.u.includes('supabase.co'));const c={};for(const q of sb){const k=q.m+' '+q.u.replace(/^https:\/\/[^/]+/,'').slice(0,70);c[k]=(c[k]||0)+1}
   const dup=Object.entries(c).filter(([,n])=>n>1).map(([k,n])=>k+' x'+n);
   const r={vy:v.n,step:name,ok,note,path:m.p,reqs:reqs.length,kb:Math.round(reqs.reduce((a,q)=>a+q.sz,0)/1024),sb:sb.length,dup,errs:[...errs],cons:[...cons],lt:m.lt,hs:m.hs,broken:m.broken,h:m.h,txt:m.txt};
   res.push(r); console.log(JSON.stringify(r)); return r;
 }
 await step('home',()=>page.goto(ORIGIN+'/pack'),{wait:4000});
 // scroll feedu
 await step('feed-scroll',async()=>{ for(let i=0;i<12;i++){await page.mouse.wheel(0,1200);await page.waitForTimeout(350)} },{wait:2500});
 await page.evaluate(()=>window.scrollTo(0,0));
 const btn=(re)=>page.getByRole('button',{name:re}).first();
 for (const [n,label] of [['messages',/^Messages$/],['notifications',/^Notifications$/],['search',/^Search$/],['sos',/^SOS$/]]){
   await step(n,async()=>{await page.goto(ORIGIN+'/pack');await page.waitForTimeout(2500);await btn(label).click()},{wait:2000});
   await page.keyboard.press('Escape');
 }
 await step('add-open',async()=>{await page.goto(ORIGIN+'/pack');await page.waitForTimeout(2500);await btn(/^Add$/).click()},{wait:1500});
 await page.keyboard.press('Escape'); await page.waitForTimeout(500);
 await step('add-closed',async()=>{ if(await page.getByRole('button',{name:/^Add$/}).count()) await page.mouse.click(v.viewport.width/2,200)},{wait:800});
 await step('nav-out',async()=>{await page.goto(ORIGIN+'/pack');await page.waitForTimeout(2000);await page.locator('a[href="/pack/map"]').last().click()},{wait:3000});
 await step('nav-ainubis',async()=>{await page.locator('a[href="/pack/ainubis"]').last().click()},{wait:3000});
 await step('nav-home',async()=>{await page.locator('a[href="/pack"]').last().click()},{wait:2500});
 const clk=(role,re)=>()=>page.getByRole(role,{name:re}).first().click();
 const DOG='401cd2bc-ed29-4c98-beb9-5681fed00477';
 await step('menu-open',async()=>{await page.goto(ORIGIN+'/pack');await page.waitForTimeout(2500);await btn(/^Profile$/).click()},{wait:1000});
 await step('menu-profile',async()=>{await page.getByRole('button',{name:/^Profile$/}).nth(1).click()},{wait:3500});
 await step('menu-mypack',async()=>{await page.goto(ORIGIN+'/pack');await page.waitForTimeout(2500);await btn(/^Profile$/).click();await page.waitForTimeout(500);await page.getByRole('button',{name:/^My Pack$/}).first().click()},{wait:3500});
 await step('profile-direct',()=>page.goto(ORIGIN+'/pack/profile'),{wait:5000});
 for (const [n,re] of [['tab-trips',/^Trips$/],['tab-onlyme',/^Only me$/],['tab-all',/^All$/],['show-dogs',/^Show dogs$/],['followers',/followers$/]]) await step(n,clk('button',re),{wait:1500});
 await step('dogs',()=>page.goto(ORIGIN+'/pack/dogs'),{wait:4500});
 for (const [n,re] of [['dogs-life',/^Life$/],['dogs-diary',/^Diary$/],['dogs-dogidtab',/^DOG ID$/]]) await step(n,clk('button',re),{wait:1800});
 await step('dog-detail',()=>page.goto(ORIGIN+'/pack/dogs/'+DOG),{wait:4500});
 await step('dogid',()=>page.goto(ORIGIN+'/pack/dogs/dogid?dog='+DOG),{wait:4500});
 await step('dogid-noparam',()=>page.goto(ORIGIN+'/pack/dogs/dogid'),{wait:4000});
 await step('ainubis-open',()=>page.goto(ORIGIN+'/pack/ainubis'),{wait:3500});
 await step('ainubis-chat-tab',clk('button',/^Chat$/),{wait:2500});
 await step('ainubis-fab',async()=>{await page.goto(ORIGIN+'/pack');await page.waitForTimeout(2500);await btn(/Open chat with AINUBIS/).click()},{wait:2500});
 await ctx.close();
}
await browser.close();
writeFileSync(OUT+'/result-ui.json',JSON.stringify(res,null,1));
