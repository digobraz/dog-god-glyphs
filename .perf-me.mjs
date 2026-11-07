import { chromium } from 'playwright';
const b=await chromium.launch({headless:false});
async function run(label, css, url='http://127.0.0.1:8099/app'){
  const p=await b.newPage({viewport:{width:1477,height:724}});
  const c=await p.context().newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.goto(url,{waitUntil:'networkidle'}).catch(()=>{});
  await p.getByText(/only necessary/i).first().click().catch(()=>{});
  if(css) await p.addStyleTag({content:css});
  await p.waitForTimeout(1500);
  const r=await p.evaluate(async()=>{const H=document.documentElement.scrollHeight-innerHeight;const fr=[];let last=performance.now();
    let lt=0;new PerformanceObserver(l=>l.getEntries().forEach(e=>lt+=e.duration)).observe({type:'longtask'});
    for(let y=0;y<H;y+=40){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(r));const n=performance.now();fr.push(n-last);last=n;}
    fr.sort((a,b)=>a-b);return {H,frames:fr.length,over50:fr.filter(f=>f>50).length,over33:fr.filter(f=>f>33).length,p95:Math.round(fr[Math.floor(fr.length*.95)]),max:Math.round(fr.at(-1)),longtaskMs:Math.round(lt)};});
  console.log(label, JSON.stringify(r)); await p.close();
}
await run('prod 4x');
await run('prod 4x bez backdrop', '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}');
await run('prod 4x bez animácií', '*,*::before,*::after{animation:none!important}');
await run('prod 4x bez filtrov', '*,*::before,*::after{filter:none!important;mix-blend-mode:normal!important}');
await run('dev 4x', null, 'http://localhost:8082/app');
await b.close();
