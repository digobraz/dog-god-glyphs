#!/usr/bin/env node
/**
 * HOTOVÉ HTML PRE PODSTRÁNKY (7. 10. 2026, rýchlosť fáza 3).
 * Matej: *„toto sú stále vysoké čísla, musíme znížiť ten čas"*.
 *
 * Prečo: /terms, /privacy a /login nemali v HTML nič — text sa objavil až po stiahnutí
 * a spustení JS (PageSpeed mobil: LCP 3,8 s a 6,0 s, z toho 3,2 s a 4,0 s čakanie na JS).
 *
 * Čo robí (beží PO `vite build`, súčasť `npm run build`):
 *   1. pustí `vite preview` nad dist/ a v Chromiu vykreslí každú stránku v EN/SK/CS,
 *   2. vezme hotový obsah `#root` + štýly, ktoré appka vložila do <head>,
 *   3. zapíše `dist/<stránka>.html` = index.html + tri <template> + malý výberový skript.
 *      Cloudflare (html_handling auto-trailing-slash) servíruje /terms z terms.html sám,
 *      bez kódu Workera.
 *
 * V prehliadači: skript vyberie jazyk tak ako appka (`dogypt_lang`, inak navigator.languages)
 * a obsah šablóny vloží do `#pre` PRED prvým vykreslením. `#root` sa medzitým kreslí
 * neviditeľne; keď sa v ňom objaví hotová stránka (selektor `ready`), `#pre` zmizne v tom
 * istom snímku. Iný jazyk než EN/SK/CS ⇒ šablóna sa nepoužije a stránka ide po starom.
 *
 * STRÁNKA PSA (8. 10. 2026): to isté pre každého psa zo snímky `dist/data/grid-dogs.json` →
 * `dist/pre/dog/<číslo>.html` + `dist/pre/dogs.json` (podpis údajov). Worker (`dogPage`) hotovú
 * stránku použije LEN keď podpis sedí s dnešnými údajmi psa — inak ide stránka po starom.
 * Vek v dňoch sa mení denne ⇒ v hotovom HTML je skrytý (miesto ostáva), doplní ho appka.
 *
 * ⚠️ Texty sa NEPÍŠU sem — berú sa z vykreslenej appky, takže zmena v i18n sa prejaví
 *    pri ďalšom builde sama.
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const PORT = 4791;
const LANGS = ['en', 'sk', 'cs'];
// Kľúče BROWSER_LANG_MAP z i18n/LanguageContext.tsx — prehliadač s iným podporovaným jazykom
// (de, pl…) šablónu nedostane; keby sme ho preskočili, ukázala by sa angličtina a potom nemčina.
// Pri en/sk/cs sa primárny subtag = interný kód, inde na hodnote nezáleží (šablóna neexistuje).
const LANG_CTX = readFileSync(resolve(ROOT, 'src/i18n/LanguageContext.tsx'), 'utf8');
const BROWSER_LANG_KEYS = [...(LANG_CTX.match(/BROWSER_LANG_MAP[^{]*\{([^}]*)\}/)?.[1] ?? '').matchAll(/(\w+):/g)].map((m) => m[1]);
if (!['en', 'sk', 'cs'].every((k) => BROWSER_LANG_KEYS.includes(k)) || BROWSER_LANG_KEYS.length < 10) throw new Error('BROWSER_LANG_MAP sa nedal prečítať');

// ready = selektor, ktorým appka povie „som hotová, vymeň". skip = kedy šablónu NEpoužiť.
// waitFonts: LCP je TEXT ⇒ ukázať ho až s písmami (viď fontsCss). Login má LCP kartu s obrázkom —
// tam čakanie len škodilo (merané 7. 10.: 99–100 bez neho, 78–91 s ním).
const PAGES = [
  { path: '/terms', file: 'terms.html', ready: '#root .lg-root .lg-card', page: '.lg-root', waitFonts: true },
  { path: '/privacy', file: 'privacy.html', ready: '#root .lg-root .lg-card', page: '.lg-root', waitFonts: true },
  // Login: hotová je až karta s formulárom (stav „missing"); dovtedy ukazuje „overujem".
  // Prihlásený človek alebo návrat z magic linku šablónu nedostane — appka ho hneď presmeruje.
  { path: '/login', file: 'login.html', ready: '#root .lg-login .lg-card form', page: '.lg-login', skipAuth: true },
];

// ── PSY ─────────────────────────────────────────────────────────────────────────────────────
// 🔴 PODPIS = údaje, ktoré stránka psa ukazuje. Kópia v scripts/cloudflare/worker.js (DOG_SIG) —
//    pri zmene meň OBE, inak Worker hotovú stránku nikdy nepoužije (nič sa nerozbije, len spomalí).
const DOG_SIG = ['dog_name', 'pack_number', 'cloudinary_main_url', 'heroglyph_png_url', 'share_card_url', 'birth_date', 'death_date', 'life_status', 'country', 'owner_first_name', 'owner_message', 'joined_at'];
const dogSig = (d) => JSON.stringify(DOG_SIG.map((k) => d[k] ?? null));
// Kópia src/lib/dogSlug.ts.
const dogSlug = (name, pack) => {
  const s = (name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/g, '');
  return s ? `${s}-${pack}` : String(pack);
};
const DOGS_JSON = readFileSync(resolve(DIST, 'data/grid-dogs.json'), 'utf8');
const DOGS = JSON.parse(DOGS_JSON).filter((d) => d && Number.isInteger(d.pack_number) && d.cloudinary_main_url);
// Šírka fotky v snímke: okno 412 px pri DPR 1 ⇒ index.html `__dogPhotoW` = 480. V prehliadači sa
// prepíše na jeho `__dogPhotoW` (tú istú adresu index.html predsťahuje — inak by sa fotka ťahala 2×).
const SNAP_PHOTO_W = 480;
for (const d of DOGS) PAGES.push({
  path: `/dog/${dogSlug(d.dog_name, d.pack_number)}`, file: `pre/dog/${d.pack_number}.html`, page: '.dogshare-page', dog: d,
  ready: '#root .ds-media > div[style*="visible"]',
});

// Snímka sa robí z čistého index.html — šablóna z minulého behu by preview servíroval namiesto neho.
for (const p of PAGES) if (!p.dog) rmSync(resolve(DIST, p.file), { force: true });
rmSync(resolve(DIST, 'pre'), { recursive: true, force: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
  cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'],
});
const kill = () => { try { server.kill('SIGTERM'); } catch { /* už nebeží */ } };
process.on('exit', kill);

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/`); if (r.ok) return; } catch { /* ešte nie */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('vite preview nenaštartoval');
}

async function snapshot(browser, page, lang, base) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, locale: lang === 'en' ? 'en-US' : lang });
  await ctx.addInitScript((l) => { try { localStorage.setItem('dogypt_lang', l); } catch { /* */ } }, lang);
  const p = await ctx.newPage();
  // Analytika a cudzie skripty do snímky nepatria.
  await p.route(/googletagmanager|posthog|i\.posthog/, (r) => r.abort());
  // Zoznam psov = snímka z buildu (tú istú podpisuje dogs.json), nie živá DB.
  await p.route(/\/api\/dogs|\/functions\/v1\/get-grid-dogs/, (r) => r.fulfill({ contentType: 'application/json', body: DOGS_JSON }));
  await p.goto(`http://127.0.0.1:${PORT}${page.path}`, { waitUntil: 'commit' });
  await p.waitForSelector(page.ready, { timeout: 30000 });
  // Heroglyf na karte psa sa prefarbuje canvasom až po stiahnutí — snímka naň počká.
  if (page.dog?.heroglyph_png_url) await p.waitForSelector('#root .ds-media img[src^="data:"]', { timeout: 30000 });
  // Cookie lišta (prvá návšteva) je na podstránke najväčší text ⇒ LCP. Ide do HTML tiež.
  await p.waitForSelector('#root .consent-banner', { timeout: 8000 }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  // Prefarbený heroglyf psa je PNG v data: URI (~150 kB textu) — v HTML by brzdil všetko za sebou.
  // Prekóduje sa na bezstratové WebP (rovnaké pixely) a v render() pôjde do samostatného súboru.
  if (page.dog) await p.evaluate(async () => {
    for (const img of document.querySelectorAll('#root img[src^="data:image/png"]')) {
      if (img.src.length < 2000) continue;
      await img.decode().catch(() => {});
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      const w = c.toDataURL('image/webp', 1);
      if (w.startsWith('data:image/webp') && w.length < img.src.length) img.setAttribute('src', w);
    }
  });
  const out = await p.evaluate(([base, pageSel]) => {
    // Len samotná stránka (a jej obaly), nie súrodenci — cookie lišta, toaster či DevNav by sa
    // inak zapiekli do HTML a ukázali aj tomu, kto už súhlas dal.
    const pageEl = document.querySelector(`#root ${pageSel}`);
    if (!pageEl) return { html: '', styles: '', title: '' };
    let node = pageEl.cloneNode(true);
    for (let a = pageEl.parentElement; a && a.id !== 'root'; a = a.parentElement) {
      const shell = a.cloneNode(false); shell.appendChild(node); node = shell;
    }
    const root = { innerHTML: node.outerHTML };
    // Štýly, ktoré appka vložila do <head> (CSS v JS literáloch); tie z index.html tam už sú.
    const styles = [...document.head.querySelectorAll('style')]
      .filter((s) => !base.includes(s.textContent || '\u0000'))
      .map((s) => s.outerHTML).join('');
    return { html: root.innerHTML, styles, title: document.title, consent: document.querySelector('#root .consent-banner')?.outerHTML ?? '' };
  }, [base, page.page]);
  await ctx.close();
  if (!out.html.trim()) throw new Error(`${page.path} [${lang}] je prázdna`);
  if (page.dog && !out.html.includes(`c_fill,w_${SNAP_PHOTO_W},h_${SNAP_PHOTO_W}`)) throw new Error(`${page.path}: fotka nemá šírku ${SNAP_PHOTO_W} — zmenil sa vzorec __dogPhotoW?`);
  return out;
}

// Výberový skript — beží synchrónne hneď za #pre, pred prvým vykreslením.
const pickScript = (page) => `<script>(function(){
var start=function(){if(window.__startApp)window.__startApp();};
var pre=document.getElementById('pre');if(!pre)return start();
function drop(){pre.remove();document.documentElement.classList.remove('pre','pre-wait');}
function skip(){drop();start();}
try{
${page.skipAuth ? `if(/access_token|refresh_token|token_hash|[?&#]code=|error_description|dogId=/.test(location.hash+location.search))return skip();
for(var i=0;i<localStorage.length;i++){if(/^sb-.*-auth-token$/.test(localStorage.key(i)))return skip();}` : ''}
var lang=localStorage.getItem('dogypt_lang');
if(!lang){var c=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];lang='en';
for(var j=0;j<c.length;j++){var k=String(c[j]||'').toLowerCase().split('-')[0];if(${JSON.stringify(BROWSER_LANG_KEYS)}.indexOf(k)>=0){lang=k;break;}}}
var tp=document.querySelector('template[data-pre="'+lang+'"]');if(!tp)return skip();
pre.appendChild(document.getElementById('pre-css').content.cloneNode(true));
// Veľké data: URI (prefarbený heroglyf) sú v šablónach len ako značka — ležia raz v #pre-data.
var D=[];try{D=JSON.parse(document.getElementById('pre-data').textContent);}catch(e){}
var h=tp.innerHTML.replace(/__PRE_D([0-9]+)__/g,function(m,i){return D[+i]||'';});
${page.dog ? `var W=window.__dogPhotoW||${SNAP_PHOTO_W};h=h.split('c_fill,w_${SNAP_PHOTO_W},h_${SNAP_PHOTO_W},').join('c_fill,w_'+W+',h_'+W+',');` : ''}
pre.insertAdjacentHTML('beforeend',h);if(tp.dataset.title)document.title=tp.dataset.title;
${page.dog ? `// Karta psa (1080 px) sa škáluje na šírku obalu — snímka mala mierku pre 412 px.
pre.querySelectorAll('.ds-media').forEach(function(m){var c=m.firstElementChild;if(c)c.style.transform='scale('+(m.clientWidth/1080)+')';});` : ''}
document.documentElement.classList.add('pre'${page.waitFonts ? ",'pre-wait'" : ''});window.__preUsed=1;
document.querySelectorAll('link[data-late-fonts]').forEach(function(l){l.media='all';});
}catch(e){return skip();}
// JS až po prvom vykreslení textu (snímka → setTimeout). Skrytá karta rAF nespustí — strop 1,2 s drží __startApp sám.
// Cookie lišta pre toho, kto ešte nezvolil — vlastný obal, žije do chvíle, keď ju vykreslí appka
// (môže to byť skôr aj neskôr než stránka). Výšku publikuje rovnako ako ConsentBanner (--consent-h).
try{var ct=document.querySelector('template[data-pre-consent="'+lang+'"]');
if(ct&&!localStorage.getItem('dogypt_consent')){var pc=document.createElement('div');pc.id='pre-consent';
pc.appendChild(ct.content.cloneNode(true));document.body.appendChild(pc);
var cb=pc.querySelector('.consent-banner');if(cb)document.documentElement.style.setProperty('--consent-h',Math.ceil(cb.getBoundingClientRect().height)+'px');
var rt=document.getElementById('root');
var mc=new MutationObserver(function(){if(!rt.querySelector('.consent-banner')&&!localStorage.getItem('dogypt_consent'))return;mc.disconnect();pc.remove();});
mc.observe(rt,{childList:true,subtree:true});}}catch(e){}
// waitFonts (právne stránky, LCP = text): hotový text je skrytý, kým nedobehnú písma, ktoré si vypýtal (strop 800 ms) — viď fontsCss.
// Až potom JS: na pomalej linke by inak bojoval s písmami o tú istú linku.
var shown=0;function show(){if(shown)return;shown=1;document.documentElement.classList.remove('pre-wait');
// Dva snímky: v prvom sa text len odkryje, JS ide až keď je naozaj vykreslený (inak ho PageSpeed ráta do LCP).
${page.dog ? `// Stránka psa: LCP je fotka — JS až keď je stiahnutá (index.html ju predsťahuje), strop 1,5 s.
var go=0;function st(){if(go)return;go=1;start();}
try{var u=null;[].some.call(pre.querySelectorAll('.ds-media [style*="background-image"]'),function(e){u=e.style.backgroundImage.match(/url\\(["']?(https?:[^"')]+)/);return !!u;});
if(u){var im=new Image();im.onload=im.onerror=function(){requestAnimationFrame(function(){requestAnimationFrame(st);});};im.src=u[1];}else st();}catch(e){st();}
setTimeout(st,1500);}` : `requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(start,0);});});}`}
${page.waitFonts ? `try{pre.offsetHeight;document.fonts.ready.then(show);}catch(e){show();}
setTimeout(show,800);` : 'show();'}
var root=document.getElementById('root'),sel=${JSON.stringify(page.ready)};
var mo=new MutationObserver(function(){if(!document.querySelector(sel))return;mo.disconnect();
var a=pre.querySelectorAll('input'),b=root.querySelectorAll('input');
for(var n=0;n<a.length&&n<b.length;n++){if(a[n].value&&a[n].type===b[n].type&&!b[n].value){var s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(b[n],a[n].value);b[n].dispatchEvent(new Event('input',{bubbles:true}));}}
var f=document.activeElement&&pre.contains(document.activeElement)?[].indexOf.call(a,document.activeElement):-1;
drop();if(f>=0&&b[f])b[f].focus();});
mo.observe(root,{childList:true,subtree:true});
})();</script>`;

// #pre .ds-life = vek psa v dňoch: mení sa denne, hotové HTML by ukázalo deň buildu.
const PRE_CSS = '<style>html.pre-wait #pre,html.pre-wait #pre-consent,#pre .ds-life{visibility:hidden}html.pre #root{position:fixed;inset:0;visibility:hidden;overflow:hidden;pointer-events:none;z-index:-1}</style>';

function escAttr(s) { return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

async function render(browser, page, base, fontsCss) {
  const tpls = [];
  // Štýly sú vo všetkých jazykoch rovnaké — idú raz, do spoločnej šablóny (inak 3× 80 kB).
  // Aj <style> zvnútra #root (Login si ho nesie v JSX) — v #pre platí rovnako.
  // Toaster (sonner) pri prvom vykreslení nič neukazuje, jeho štýly nepotrebujeme.
  const css = new Set();
  const data = [];
  const STYLE_RX = /<style[^>]*>[\s\S]*?<\/style>/g;
  // Veľké data: URI raz pre všetky jazyky (prefarbený heroglyf má desiatky kB).
  const dedupe = (html) => html.replace(/data:[a-z]+\/[a-z+.-]+;base64,[A-Za-z0-9+/=]{2000,}/g, (u) => {
    let i = data.indexOf(u); if (i < 0) { data.push(u); i = data.length - 1; }
    return `__PRE_D${i}__`;
  });
  for (const lang of LANGS) {
    const s = await snapshot(browser, page, lang, base);
    for (const m of (s.styles + s.html).match(STYLE_RX) ?? []) if (!m.includes('data-sonner-toaster')) css.add(m);
    tpls.push(`<template data-pre="${lang}" data-title="${escAttr(s.title)}">${dedupe(s.html.replace(STYLE_RX, ''))}</template>`);
    for (const m of s.consent.match(STYLE_RX) ?? []) css.add(m);
    if (s.consent) tpls.push(`<template data-pre-consent="${lang}">${s.consent.replace(STYLE_RX, '')}</template>`);
    else console.warn(`  ⚠ ${page.path} [${lang}]: cookie lišta sa v snímke neukázala`);
  }
  // Stránka psa: veľké obrázky ako súbory vedľa HTML (Cloudflare ich cacheuje, nesú sa samostatne).
  if (page.dog) {
    const dir = dirname(resolve(DIST, page.file));
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < data.length; i++) {
      const m = data[i].match(/^data:image\/(webp|png);base64,(.*)$/);
      if (!m) continue;
      const name = `${page.dog.pack_number}-${i}.${m[1]}`;
      writeFileSync(resolve(dir, name), Buffer.from(m[2], 'base64'));
      // Heroglyf nie je LCP (to je fotka) — linku jej nesmie brať.
      for (let t = 0; t < tpls.length; t++) tpls[t] = tpls[t].split(`src="__PRE_D${i}__"`).join(`fetchpriority="low" src="/pre/dog/${name}"`).split(`__PRE_D${i}__`).join(`/pre/dog/${name}`);
      data[i] = '';
    }
  }
  const dataTag = `<script type="application/json" id="pre-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
  const inject = `${PRE_CSS}<div id="pre"></div><template id="pre-css">${[...css].join('')}</template>${dataTag}${tpls.join('')}<div id="root"></div>${pickScript(page)}`;
  // __preDefer musí byť v <head>: skript opony v <body> podľa neho NEspustí appku hneď.
  // Písma inline (≈1 kB gzip): hotový text sa ukáže až s nimi. S náhradným písmom bol text
  // o kúsok menší a appka ho pri výmene nahradila VÄČŠÍM ⇒ prehliadač to rátal ako nové
  // najväčšie vykreslenie a LCP padlo až na výmenu (/terms 3,8 s namiesto ~1,4 s).
  const html = base.replace('<head>', `<head><script>window.__preDefer=1</script><style>${fontsCss}</style>`).replace('<div id="root"></div>', inject);
  // Stráž: výberový skript je JS v šablóne — `\d` v nej ticho stratí lomítko (stalo sa 8. 10.:
  // heroglyf psa ostal rozbitý). Regex na značky musí prežiť do HTML doslova.
  if (data.some(Boolean) && !html.includes('replace(/__PRE_D([0-9]+)__/g')) throw new Error('výberový skript nevie dosadiť data: URI');
  mkdirSync(dirname(resolve(DIST, page.file)), { recursive: true });
  writeFileSync(resolve(DIST, page.file), html);
  return html;
}

async function main() {
  const base = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  if (!base.includes('<div id="root"></div>')) throw new Error('dist/index.html nemá <div id="root"></div>');
  const fontsCss = readFileSync(resolve(DIST, 'fonts/g/fonts-v1.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  await waitForServer();
  const browser = await chromium.launch();
  const t0 = Date.now();
  try {
    for (const page of PAGES.filter((p) => !p.dog)) {
      const html = await render(browser, page, base, fontsCss);
      console.log(`  ✓ prerender ${page.path} → dist/${page.file} (${(Buffer.byteLength(html) / 1024).toFixed(0)} kB, ${LANGS.join('/')})`);
    }
    // Psy po štyroch naraz. Pes, ktorý zlyhá, hotovú stránku nedostane (ide po starom) — build nepadá.
    const dogs = PAGES.filter((p) => p.dog);
    const sigs = {};
    let kb = 0, fail = 0;
    const queue = [...dogs];
    await Promise.all(Array.from({ length: 4 }, async () => {
      for (let pg = queue.shift(); pg; pg = queue.shift()) {
        try {
          kb += Buffer.byteLength(await render(browser, pg, base, fontsCss)) / 1024;
          sigs[pg.dog.pack_number] = dogSig(pg.dog);
        } catch (e) {
          fail++;
          rmSync(resolve(DIST, pg.file), { force: true });
          console.warn(`  ⚠ ${pg.path}: ${e.message.split('\n')[0]}`);
        }
      }
    }));
    writeFileSync(resolve(DIST, 'pre/dogs.json'), JSON.stringify(sigs));
    const ok = Object.keys(sigs).length;
    console.log(`  ✓ prerender psy: ${ok}/${dogs.length} → dist/pre/dog/ (spolu ${(kb / 1024).toFixed(1)} MB, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    if (dogs.length && fail > dogs.length / 4) throw new Error(`zlyhalo ${fail} z ${dogs.length} psov`);
  } finally {
    await browser.close();
    kill();
  }
}

main().catch((e) => { console.error('✗ prerender:', e.message); kill(); process.exit(1); });
