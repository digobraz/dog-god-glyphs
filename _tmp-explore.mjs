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
for (const v of VY){
 const ctx=await browser.newContext({viewport:v.viewport,isMobile:!!v.isMobile,hasTouch:!!v.hasTouch,userAgent:v.userAgent});
 await ctx.addInitScript(([k,s])=>{localStorage.setItem(k,s);localStorage.setItem('dogypt_consent',JSON.stringify({analytics:false,marketing:false,v:1,ts:Date.now()}))},[`sb-${REF}-auth-token`,JSON.stringify(session)]);
 await ctx.route(/\/auth\/v1\/user(\?|$)/, async rt=>{ if(rt.request().method()!=='GET') return rt.continue(); const resp=await rt.fetch(); let j=await resp.json(); j.user_metadata={...j.user_metadata,terms_ok:{v:1,at:new Date().toISOString()}}; rt.fulfill({response:resp,json:j}); });
 await ctx.route(/posthog/, rt=>rt.fulfill({status:200,body:'{}'}));
 const page=await ctx.newPage(); await page.goto(ORIGIN+'/pack'); await page.waitForTimeout(5000);
 const els=await page.evaluate(()=>[...document.querySelectorAll('button,a,[role=button]')].map(e=>{const b=e.getBoundingClientRect();const cs=getComputedStyle(e);return {t:e.tagName,l:(e.getAttribute('aria-label')||e.innerText||'').trim().slice(0,30),h:e.getAttribute('href'),x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),hh:Math.round(b.height)}}).filter(o=>o.w>0));
 console.log(v.n); for(const e of els) console.log(JSON.stringify(e));
 await ctx.close();
}
await browser.close();
