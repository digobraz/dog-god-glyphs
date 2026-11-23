// Fáza 4: priame detaily + SOS hub + SOS vet. LEN čítanie.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const OUT='/private/tmp/claude-501/-Users-stachoman-AI-DOGYPT/2dd67db7-70bc-453a-a0c0-d1da7a735375/scratchpad/pack1';
const ORIGIN='https://dogypt.com',REF='lnzurwmdgvzlqhsbhrvi',SB=`https://${REF}.supabase.co`,EMAIL='hekthorsk+straz@gmail.com';
const kc=(s,a)=>execSync(`security find-generic-password -s ${s} -a ${a} -w`,{stdio:['ignore','pipe','ignore']}).toString().trim();
const PUB=readFileSync('/Users/stachoman/AI/DOGYPT/vystupy/web/src/lib/env.ts','utf8').match(/sb_publishable_[\w-]+/)[0];
const session=await (await fetch(`${SB}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:PUB,'content-type':'application/json'},body:JSON.stringify({email:EMAIL,password:kc('dogypt-straz-ucet',EMAIL)})})).json();
const VY=[{n:'pc',viewport:{width:1477,height:724}},{n:'mobil',viewport:{width:390,height:844},isMobile:true,hasTouch:true}];
const D=['/pack/map/svk/velka-fatra-a-magical-journey-on-bare-feet','/pack/map/svk/orava-reservoir','/pack/map/svk/vysehrad-an-inconspicuous-gem-of-slovakia','/pack/sos','/pack/sos/pohotovost'];
const browser=await chromium.launch();
for(const v of VY){const ctx=await browser.newContext({viewport:v.viewport,isMobile:!!v.isMobile,hasTouch:!!v.hasTouch});
 await ctx.addInitScript(([k,s])=>{localStorage.setItem(k,s);localStorage.setItem('cookie-consent','x');window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(Math.round(e.duration))}).observe({type:'longtask',buffered:true})}catch{}},[`sb-${REF}-auth-token`,JSON.stringify(session)]);
 for(const [i,d] of D.entries()){const page=await ctx.newPage();const rq=[],bad=[],cons=[];
  page.on('request',q=>{if(q.url().includes('supabase.co'))rq.push(q.method()+' '+q.url().replace(SB,'').split('?')[0]+(q.method()==='GET'?'?'+(q.url().split('?')[1]||'').slice(0,40):''))});
  page.on('response',z=>{if(z.status()>=400)bad.push(z.status()+' '+z.url().slice(0,90))});page.on('console',m=>{if(m.type()==='error')cons.push(m.text().slice(0,100))});
  const t=Date.now();await page.goto(ORIGIN+d,{waitUntil:'domcontentloaded'});
  const tu=await page.waitForFunction(()=>document.body.innerText.length>150,{timeout:20000}).then(()=>Date.now()-t).catch(()=>-1);
  await page.waitForLoadState('networkidle',{timeout:15000}).catch(()=>{});const ti=Date.now()-t;await page.waitForTimeout(1000);
  const c={};rq.forEach(k=>c[k]=(c[k]||0)+1);
  const inf=await page.evaluate(()=>({p:location.pathname,hs:document.documentElement.scrollWidth>innerWidth+1,br:[...document.images].filter(i=>i.complete&&!i.naturalWidth&&i.src).length,lt:window.__lt.filter(x=>x>200),h1:(document.querySelector('h1,h2')?.textContent||'').slice(0,50),txt:document.body.innerText.slice(0,70).replace(/\n/g,'|')}));
  console.log(v.n,d,'→',inf.p,'use',tu,'idle',ti,'sb',rq.length,'dup',JSON.stringify(Object.entries(c).filter(([,n])=>n>1)),'LT',inf.lt,'hs',inf.hs,'broken',inf.br,'bad',bad.slice(0,3),'cons',cons.slice(0,2),'|',inf.txt);
  await page.screenshot({path:`${OUT}/${v.n}-d4-${i}.png`});await page.close();}
 await ctx.close();}
await browser.close();
