#!/usr/bin/env node
/**
 * PRECHOD APPKY (9. 11. 2026) — `npm run prechod`
 *
 * Matej 9. 11. 2026: *„vieš si postaviť nejaký skript na základe ktorého prejdeš všetky stránky,
 * panely, popupy + duplicity, dizajn, font… aby som sa vedel spoľahnúť že to naozaj spravíš,
 * už pri druhej kontrole som našiel chyby"*.
 *
 * AKO TO FUNGUJE (nič sa tu nepíše ručne pre konkrétnu obrazovku)
 *   1. ZOZNAM — routy /pack číta z App.tsx, okná zo zdrojákov (createPortal, pk-veil, Sheet).
 *      Čo pribudne v kóde, je v zozname samo.
 *   2. PRECHOD — prihlásený DEV účet, telefónne okno. Na každej stránke klikne na všetko
 *      klikateľné, vo vnútri okna aj na jeho tlačidlá (do hĺbky 2). Odkazy pridáva do frontu.
 *   3. MERANIE každého stavu — viď `druhy` nižšie. Každý stav má snímku, nález má súbor:riadok.
 *   4. POKRYTIE — report začína tým, čo sa NEPREŠLO. Zelená bez 100 % pokrytia neexistuje.
 *
 * ČO NEVIE (na to je telefón): výrez a safe-area, klávesnica, gestá, natívne zdieľanie, push,
 * reálne odpovede edge funkcií (AINUBIS). Vkus nemeria — snímky treba pozrieť očami.
 *
 * Bezpečnosť: iba DEV Supabase. Zápisy do DB, Storage a edge funkcie sa nepustia von
 * (odpovie im atrapa), odhlásenie a mazanie sa nestláča.
 *
 * Beh:  npm run prechod                  telefón 390×844
 *       npm run prechod -- --plny        navyše 360×640 a PC 1477×724
 *       --len /pack/dogs                 len routy s touto predponou
 *       --minut 30                       časový strop (čo nestihne, je v pokrytí)
 *       --out /cesta                     priečinok reportu
 * Výstup: 0 = čisté a všetko prejdené · 1 = nález alebo diera v pokrytí · 2 = nebežal
 */
import { setriCloudinary } from './setri-cloudinary.mjs';
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ARGS = process.argv.slice(2);
const arg = (k) => { const i = ARGS.indexOf(k); return i >= 0 ? ARGS[i + 1] : undefined; };
const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(WEB, '../..');
const OUT = arg('--out') || path.join(os.tmpdir(), 'dogypt-prechod');
const LEN = arg('--len');
const STROP_MS = +(arg('--minut') || 40) * 60_000;
const OKNA = ARGS.includes('--plny') ? [[390, 844], [360, 640], [1477, 724]] : [[390, 844]];
const PORT = 8080; // DEV magic link pustí redirect len na localhost:8080
const BASE = `http://localhost:${PORT}`;
const PARALEL = 3;

const NEKLIKAJ = /sign ?out|log ?out|odhl[aá]s|delete|zmaž|vymaž|smaž|remove account|zruš účet|install|nainštal/i;
// Routy, ktoré sa nedajú navštíviť bez jednorazového tokenu alebo sú laboratórium.
const BEZ_ROUTY = /^\/pack\/(_herolab|join\/:token|\*)$/;
// Dynamická routa stačí 2× — tretí pes vyzerá ako druhý.
const MAX_NA_VZOR = 2;
const MAX_KLIKOV = 70, MAX_KLIKOV_OKNO = 14, HLBKA = 2, MAX_INLINE = 12;
const CITANIE_RPC = /^(get|list|my|fetch|search|count|has|is|can|nearby|find|load|read|check)_/;

/** Čo je nález a čo je len dizajnový dlh (ten nezhodí beh, ale v reporte je). */
const druhy = {
  PAD: 'Obrazovka spadla (Something went wrong)', CHYBA_JS: 'Chyba v JavaScripte', SIET: 'Požiadavka zlyhala', OBRAZOK: 'Rozbitý obrázok',
  KLUC: 'Surový kľúč prekladu', PRAZDNE: 'undefined / NaN v texte', VODOROVNE: 'Stránka sa hýbe do strany',
  PRESAH: 'Text vyšiel z bloku', OREZANY: 'Text je odrezaný', ZAKRYTE: 'Tlačidlo je zakryté', MRTVE: 'Tlačidlo nič nerobí',
  DUPLICITA: 'To isté dvakrát', DVE_ZATVORENIA: 'Dve zatvorenia', TROJBODKA: 'Trojbodka', NEZNAMA: 'Odkaz vedie na neexistujúcu routu',
  NESURODE: 'Ten istý prvok vyzerá na obrazovkách inak', FONT: 'Font mimo brandu', BOLD: 'Falošný bold (Grotesk 700+)', MALE: 'Príliš malý cieľ prsta',
};
const DLH = { STUPNICA: 'Písmo mimo stupnice', POLOMER: 'Polomer mimo stupnice', POMLCKA: 'Dlhá pomlčka v texte', REACT: 'Varovanie Reactu' };

// ─── v prehliadači ─────────────────────────────────────────────────────────
const IN_PAGE = () => {
  const SIZES = [10, 12, 14, 16, 20, 24], RAD = [0, 8, 12, 14, 16, 999];
  const FONTY = ['Cinzel', 'Cinzel Decorative', 'Space Grotesk', 'LT Museum']; // LT Museum = Papyrus 3D v testovacej appke (Matej 5. 11.)
  const MAPA = '.leaflet-container,.maplibregl-map,.mapboxgl-map'; // značka na mape je údaj, má vlastný lock
  const DEV_VEC = /DevNav|lib\/nakres|ConsentBanner/;
  let mut = 0;
  document.addEventListener('DOMContentLoaded', () => new MutationObserver(l => { mut += l.length; }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true }));

  const vis = (e) => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 1 && r.height > 1 && c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.02; };
  const fiber = (e) => { for (const k in e) if (k.startsWith('__reactFiber$')) return e[k]; return null; };
  const zdroje = (e) => {
    const out = [];
    for (let n = e; n && !out.length; n = n.parentElement) {
      // Len najbližšie súbory: vyššie v strome sú rodičia, ktorých okno sa tým neotvorilo.
      for (let f = fiber(n); f && out.length < 4; f = f.return) {
        const s = f._debugSource;
        if (s?.fileName) { const m = s.fileName.replace(/^.*\/src\//, 'src/'); if (!out.includes(m)) out.push(m); }
      }
    }
    return out;
  };
  const src = (e) => {
    for (let n = e; n; n = n.parentElement) for (let f = fiber(n); f; f = f.return) {
      const s = f._debugSource;
      if (s?.fileName) return `${s.fileName.replace(/^.*\/src\//, 'src/')}:${s.lineNumber}`;
    }
    return '';
  };
  const cesta = (e) => {
    const p = [];
    for (let n = e; n && n !== document.documentElement; n = n.parentElement) {
      const i = n.parentElement ? [...n.parentElement.children].indexOf(n) + 1 : 1;
      p.unshift(`${n.tagName.toLowerCase()}:nth-child(${i})`);
    }
    return 'html > ' + p.join(' > ');
  };
  const kostra = (k) => k.replace(/:nth-child\(\d+\)/g, '');
  const meno = (e) => (e.getAttribute('aria-label') || e.innerText || e.getAttribute('title') || e.querySelector?.('img')?.alt || '').trim().replace(/\s+/g, ' ').slice(0, 50);

  const vrstvy = () => {
    const vw = innerWidth, vh = innerHeight, out = [];
    for (const e of document.querySelectorAll('body *')) {
      const dlg = e.matches('[role="dialog"],[aria-modal="true"],[role="alertdialog"],.pk-veil,[data-vaul-drawer]');
      const c = getComputedStyle(e);
      if (!dlg && c.position !== 'fixed') continue;
      if (!vis(e)) continue;
      const r = e.getBoundingClientRect();
      if (!dlg && r.width * r.height < vw * vh * 0.25) continue;
      if (out.some(o => o.contains(e))) continue;
      out.push(e);
    }
    return out;
  };
  const nove = () => vrstvy().filter(e => !e.dataset.prechodBase);
  const koren = () => { const n = nove(); return n[n.length - 1] || document.body; };

  const hrac = (root) => [...root.querySelectorAll('button,a[href],[role="button"],[role="tab"],[role="switch"],[role="menuitem"],summary,label[for],[tabindex="0"],div[class*="card"],div[class*="tile"]')].filter(e => {
    if (!vis(e) || e.disabled || e.getAttribute('aria-disabled') === 'true') return false;
    if (e.matches('div') && getComputedStyle(e).cursor !== 'pointer') return false;
    return !(e.parentElement?.closest('button,a[href],[role="button"]') && !e.matches('button,a[href]'));
  });

  const scroller = (root) => {
    if (root !== document.body) { for (const e of [root, ...root.querySelectorAll('*')]) { const c = getComputedStyle(e); if (/auto|scroll/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 4) return e; } return null; }
    const d = document.scrollingElement;
    if (d.scrollHeight > d.clientHeight + 4) return d;
    let best = null, area = 0;
    for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e); if (!/auto|scroll/.test(c.overflowY) || e.scrollHeight <= e.clientHeight + 4) continue; const r = e.getBoundingClientRect(); const a = r.width * r.height; if (a > area) { area = a; best = e; } }
    return best;
  };

  window.__prechod = {
    mut: () => mut,
    // Vývojárske lišty a cookie pruh v appke nie sú, nemajú sa merať ani stláčať.
    skryDev: () => { for (const e of document.querySelectorAll('body *')) if (DEV_VEC.test(src(e)) && !DEV_VEC.test(e.parentElement ? src(e.parentElement) : '')) e.style.setProperty('display', 'none', 'important'); },
    oznac: () => { document.querySelectorAll('[data-prechod-base]').forEach(e => delete e.dataset.prechodBase); vrstvy().forEach(e => { e.dataset.prechodBase = '1'; }); },
    pocetNovych: () => nove().length,
    popisVrstvy: () => {
      const r = koren();
      if (r === document.body) return null;
      const h = r.querySelector('h1,h2,h3,[role="heading"]');
      return { titul: (h?.innerText || r.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40), subory: zdroje(r.firstElementChild || r), src: src(r.firstElementChild || r) };
    },
    spustace: (max) => {
      const root = koren(), videne = new Map(), kandidati = [];
      for (const e of hrac(root)) {
        const c = cesta(e), k = kostra(c);
        videne.set(k, (videne.get(k) || 0) + 1);
        kandidati.push({ cesta: c, kostra: k, label: meno(e), href: e.getAttribute('href') || '', nav: !!e.closest('nav,[class*="dock"],[class*="bottom-nav"]') });
      }
      kandidati.sort((a, b) => videne.get(a.kostra) - videne.get(b.kostra));
      return kandidati.slice(0, max);
    },
    odkazy: () => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => h && h.startsWith('/')),
    klik: (c) => { const e = document.querySelector(c); if (!e) return false; e.scrollIntoView({ block: 'center' }); e.click(); return true; },
    hore: () => { const s = scroller(koren()); if (s) s.scrollTop = 0; },
    dole: () => { const s = scroller(koren()); if (s) s.scrollTop = s.scrollHeight; return !!s; },

    /** Nové tlačidlo po kliku (ponuka Vrstvy a podobné) nesmie byť pod iným prvkom. */
    zakryteNove: (cesty) => {
      const out = [];
      for (const c of cesty) {
        const e = document.querySelector(c);
        if (!e) continue;
        const r = e.getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth || e.closest(MAPA)) continue;
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        // Obsah pod spodnou lištou sa dá odrolovať, to nie je zakrytie ponuky.
        if (hit && !e.contains(hit) && !hit.contains(e) && !/PackLayout|packDockMedal/.test(src(hit))) out.push({ druh: 'ZAKRYTE', txt: meno(e) || e.tagName, src: src(e), o: 'nová ponuka pod: ' + src(hit) });
      }
      return out;
    },

    /** Zakryté tlačidlá — volá sa na vrchu aj na spodku scrollu, inde je zakrytie len dočasné. */
    zakryte: (kde) => {
      const root = koren(), out = [], vh = innerHeight;
      for (const e of hrac(root)) {
        const r = e.getBoundingClientRect();
        if (r.top < 0 || r.bottom > vh || r.left < 0 || r.right > innerWidth) continue;
        if (kde === 'hore' && r.bottom > vh * 0.7) continue;
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!hit || e.contains(hit) || hit.contains(e) || e.closest(MAPA)) continue;
        // Tmavá vrstva cez celé okno je zámer (šuplík nad mapou), nie zakrytie.
        const hr = hit.getBoundingClientRect();
        if (getComputedStyle(hit).position === 'fixed' && hr.width * hr.height > innerWidth * vh * 0.6) continue;
        out.push({ druh: 'ZAKRYTE', txt: meno(e) || e.tagName, src: src(e), o: 'pod: ' + src(hit) });
      }
      return out;
    },

    meraj: () => {
      const root = koren(), out = [], vw = innerWidth, mobil = vw < 700;
      const add = (druh, txt, e, o) => out.push({ druh, txt: String(txt).slice(0, 60), src: e ? src(e) : '', o });

      if (/something went wrong|niečo sa pokazilo/i.test(root.innerText || '')) add('PAD', (root.innerText || '').trim().slice(0, 60), root.firstElementChild, window.__prechodChyba || '');
      if (root === document.body && document.documentElement.scrollWidth > vw + 1) {
        let naj = null, r0 = vw;
        for (const e of document.querySelectorAll('body *')) { if (!vis(e) || e.closest('.leaflet-container')) continue; const r = e.getBoundingClientRect(); if (r.right > r0 + 1) { r0 = r.right; naj = e; } }
        add('VODOROVNE', naj ? meno(naj) || naj.tagName : '', naj, Math.round(document.documentElement.scrollWidth - vw) + ' px');
      }
      for (const img of root.querySelectorAll('img')) if (vis(img) && img.complete && img.naturalWidth === 0 && img.getAttribute('src')) add('OBRAZOK', img.getAttribute('src').slice(-50), img);

      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), seen = new Set(), texty = new Map();
      while (tw.nextNode()) {
        const t = tw.currentNode, e = t.parentElement, s = t.textContent.trim().replace(/\s+/g, ' ');
        if (!e || !s || seen.has(e) || e.closest('[aria-hidden="true"],script,style,noscript,[data-presah-ok],.leaflet-marker-pane,.leaflet-control-attribution') || !vis(e) || /<{3,}/.test(s)) continue; // <<< = strojový riadok dokladu, orezaný zámerne
        seen.add(e);
        const c = getComputedStyle(e), fs = parseFloat(c.fontSize), fw = +c.fontWeight;
        const rodina = c.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        const emoji = !/\p{L}|\d/u.test(s.replace(/\p{Extended_Pictographic}/gu, ''));

        if (/^[a-zA-Z_]+(\.[a-zA-Z0-9_]+){2,}$/.test(s) && !/\.(sk|cz|com|org|net|eu|de|at|hu|pl)$/i.test(s)) add('KLUC', s, e);
        if (/\bundefined\b|\bNaN\b|\[object |\{\{/.test(s)) add('PRAZDNE', s, e);
        if (/…|\.\.\./.test(s)) add('TROJBODKA', s, e);
        if (s.includes('—')) add('POMLCKA', s, e);
        if (!emoji && !e.closest('.leaflet-container')) {
          if (!FONTY.includes(rodina)) add('FONT', s, e, rodina);
          if (rodina === 'Space Grotesk' && fw > 600) add('BOLD', s, e, fw);
          if (!SIZES.includes(fs) && fs < 24) add('STUPNICA', s, e, fs + ' px');
        }
        if (c.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1) add('OREZANY', s, e, 'trojbodka z CSS');

        const rg = document.createRange(); rg.selectNodeContents(t);
        const rs = [...rg.getClientRects()].filter(x => x.width > 1 && x.height > 1);
        if (rs.length) {
          const L = Math.min(...rs.map(x => x.left)), R = Math.max(...rs.map(x => x.right));
          let scroll = false, cl = 0, cr = vw, box = null;
          for (let n = e; n && n !== document.documentElement; n = n.parentElement) {
            const k = getComputedStyle(n), rc = n.getBoundingClientRect();
            if (k.overflowX !== 'visible') { if (/auto|scroll/.test(k.overflowX)) scroll = true; cl = Math.max(cl, rc.left); cr = Math.min(cr, rc.right); }
            if (!box && rc.width < vw - 1 && rc.width > 4 && (k.backgroundColor !== 'rgba(0, 0, 0, 0)' || k.backgroundImage !== 'none' || parseFloat(k.borderLeftWidth) > 0)) box = rc;
          }
          if (!(R <= cl + 1 || L >= cr - 1) && !scroll) {
            if (L < cl - 2 || R > cr + 2) add('OREZANY', s, e, Math.round(Math.max(cl - L, R - cr)) + ' px');
            else if (box && (L < box.left - 2 || R > box.right + 2)) add('PRESAH', s, e, Math.round(Math.max(box.left - L, R - box.right)) + ' px');
          }
        }
        // Duplicita = rovnaký výrazný text v RÔZNEJ štruktúre (riadky zoznamu majú tú istú kostru a sú v poriadku).
        if (s.length >= 3 && !emoji && (fs >= 16 || e.closest('button,[role="button"],h1,h2,h3'))) {
          const k = s.toLowerCase();
          if (!texty.has(k)) texty.set(k, []);
          texty.get(k).push(e);
        }
      }
      for (const [k, el] of texty) {
        if (el.length < 2) continue;
        if (new Set(el.map(x => kostra(cesta(x)))).size < 2) continue;
        add('DUPLICITA', k, el[1], el.length + '×');
      }
      if (root !== document.body) {
        const zav = hrac(root).filter(e => /^(×|✕|x|close|zatvoriť|zavrieť)$/i.test(meno(e)));
        if (zav.length > 1) add('DVE_ZATVORENIA', zav.map(meno).join(' + '), zav[1]);
      }

      const rodiny = [];
      // Matej 9. 11.: horná pilulka, úchyt panela a šípka musia byť všade rovnaké.
      if (root === document.body) {
        const h = hrac(document.body), trio = ['SOS', 'Správy', 'Upozornenia'].map(m => h.find(e => meno(e) === m)).filter(Boolean);
        if (trio.length === 3) {
          const [a, b, c] = trio.map(e => e.getBoundingClientRect());
          const m1 = Math.round(b.left - a.right), m2 = Math.round(c.left - b.right);
          rodiny.push({ rola: 'PILULKA', sig: `tlačidlá ${Math.round(a.height)} · medzery ${m1}/${m2}`, txt: 'SOS + Správy + Upozornenia', src: src(trio[0]) });
          if (Math.abs(m1 - m2) > 1) add('NESURODE', 'obálka nie je v strede pilulky', trio[1], `${m1}/${m2} px`);
        }
      }
      for (const e of root.querySelectorAll('.pk-grab,[class*="grab"]')) {
        if (!vis(e) || e.getBoundingClientRect().width > 120) continue;
        const r = e.getBoundingClientRect(), c = getComputedStyle(e);
        rodiny.push({ rola: 'ÚCHYT', sig: `${Math.round(r.width)}×${Math.round(r.height)} · ${c.backgroundColor}`, txt: e.className.toString().slice(0, 30), src: src(e) });
      }
      for (const e of hrac(root)) {
        const r = e.getBoundingClientRect(), c = getComputedStyle(e);
        if (mobil && (r.height < 32 || r.width < 32) && !e.closest('p,li') && !e.matches('label') && !e.closest(MAPA)) add('MALE', meno(e) || e.tagName, e, `${Math.round(r.width)}×${Math.round(r.height)}`);
        const plne = c.backgroundImage !== 'none' || (c.backgroundColor !== 'rgba(0, 0, 0, 0)' && !/, 0\.?\d*\)$/.test(c.backgroundColor));
        const rola = /^(×|✕|x|close|zatvoriť|zavrieť)$/i.test(meno(e)) ? 'ZATVORIŤ' : /^(←|‹|back|späť|naspäť)$/i.test(meno(e)) ? 'SPÄŤ' : (r.width >= 120 && r.height >= 36 && plne ? 'CTA' : null);
        if (rola) rodiny.push({ rola, sig: `${c.fontFamily.split(',')[0].replace(/['"]/g, '')} ${c.fontSize}/${c.fontWeight} · r${c.borderTopLeftRadius} · v${Math.round(r.height)} · ${c.backgroundImage !== 'none' ? 'gradient' : c.backgroundColor}`, txt: meno(e), src: src(e) });
      }
      for (const e of root.querySelectorAll('input:not([type=hidden]):not([type=file]):not([type=checkbox]):not([type=radio]),textarea,select')) {
        if (!vis(e)) continue;
        const c = getComputedStyle(e), r = e.getBoundingClientRect();
        rodiny.push({ rola: 'POLE', sig: `${c.fontFamily.split(',')[0].replace(/['"]/g, '')} ${c.fontSize} · r${c.borderTopLeftRadius} · v${Math.round(r.height)} · ${c.backgroundColor}`, txt: e.placeholder || e.name || '', src: src(e) });
      }
      for (const e of root.querySelectorAll('*')) {
        if (!vis(e)) continue;
        const c = getComputedStyle(e);
        if (!c.borderTopLeftRadius.endsWith('px')) continue;
        const v = parseFloat(c.borderTopLeftRadius);
        if (RAD.includes(v) || v > 40 || e.closest('.leaflet-container')) continue;
        if (c.backgroundColor === 'rgba(0, 0, 0, 0)' && c.backgroundImage === 'none' && parseFloat(c.borderTopWidth) === 0) continue;
        add('POLOMER', meno(e) || e.className?.toString?.().slice(0, 30) || e.tagName, e, v + ' px');
      }
      return { nalezy: out, rodiny, subory: zdroje(root.firstElementChild || root) };
    },
  };
};

// ─── prostredie ────────────────────────────────────────────────────────────
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const kod = fs.readFileSync(path.join(WEB, 'src/App.tsx'), 'utf8');
const ROUTY = [...new Set([...kod.matchAll(/path="(\/pack[^"]*)"/g)].map(m => m[1]))].filter(r => !BEZ_ROUTY.test(r));
const vzor = (r) => new RegExp('^' + r.replace(/\/\*$/, '(/.*)?').replace(/:[a-z]+/gi, '[^/]+') + '/?$');
const ZHODY = ROUTY.map(r => ({ r, re: vzor(r), dyn: r.includes(':') || r.includes('*'), staticka: !r.includes(':') && !r.includes('*') }))
  .sort((a, b) => a.dyn - b.dyn);
const najdiRoutu = (cesta) => ZHODY.find(z => z.re.test(cesta))?.r || null;

function oknaVKode() {
  const out = [], chod = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) chod(p); else if (/\.tsx$/.test(f.name) && /createPortal|<Sheet\b|<Dialog\b|<Drawer\b|<AlertDialog\b|pk-veil/.test(fs.readFileSync(p, 'utf8'))) out.push(path.relative(WEB, p)); } };
  chod(path.join(WEB, 'src/components/pack')); chod(path.join(WEB, 'src/pages'));
  return out.filter(f => !/\/ui\/|Admin|Heroglyph|OnePage|Magnet|Lab/i.test(f));
}

async function server() {
  const zije = await fetch(BASE).then(() => true).catch(() => false);
  if (zije) throw new Error(`port ${PORT} je obsadený — iný dev server môže bežať s NOAUTH atrapou. Zastav ho.`);
  const s = spawn('npx', ['vite', '--host', 'localhost', '--port', String(PORT), '--strictPort'], {
    cwd: WEB, stdio: 'ignore', env: { ...process.env, VITE_PACK_FULL: 'true', VITE_PAWMATE: 'true', VITE_SOS: '1', VITE_PACK_NOAUTH: '' },
  });
  for (let i = 0; i < 60; i++) { await wait(1000); if (await fetch(BASE).then(() => true).catch(() => false)) return s; }
  s.kill(); throw new Error('vite nenabehol do 60 s');
}

async function prihlas(browser, subor) {
  const v = execFileSync('node', [path.join(ROOT, 'scripts/dogypt-login.mjs'), '--dev', '--print'], { encoding: 'utf8' });
  const link = v.match(/https?:\/\/\S+verify\S+/)?.[0];
  if (!link) throw new Error('login nevrátil magic link');
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => { try { localStorage.setItem('dogypt_consent', JSON.stringify({ analytics: false, marketing: false })); localStorage.setItem('dogypt_wz', 'done'); localStorage.setItem('dogypt_wz_seen', '1'); localStorage.setItem('dogypt_lang', 'sk'); } catch {} });
  const p = await ctx.newPage();
  await p.goto(link);
  await p.waitForURL(/\/pack/, { timeout: 30_000 });
  await wait(3000);
  await ctx.storageState({ path: subor });
  await ctx.close();
}

// ─── prechod ───────────────────────────────────────────────────────────────
const stav = { inline: new Map(), nalezy: [], rodiny: [], stavy: [], navstivene: new Map(), oknaVidene: new Set(), chyby: [], zablokovane: 0 };
const pridaj = (n, kontext) => stav.nalezy.push({ ...n, ...kontext });

async function novyKontext(browser, subor, w, h) {
  const ctx = await browser.newContext({ storageState: subor, viewport: { width: w, height: h }, deviceScaleFactor: w < 700 ? 2 : 1, hasTouch: w < 700, geolocation: { latitude: 48.15, longitude: 17.11 }, permissions: ['geolocation'] });
  await ctx.addInitScript(IN_PAGE);
  await ctx.addInitScript(() => {
    window.open = () => null; window.alert = () => {}; window.confirm = () => false; window.print = () => {};
    try { navigator.share = async () => {}; } catch {}
    document.addEventListener('DOMContentLoaded', () => document.documentElement.classList.add('is-app', 'is-ios'));
  });
  await ctx.route('**/*', (route) => {
    const q = route.request(), u = new URL(q.url()), m = q.method();
    const atrapa = () => { stav.zablokovane++; ctx.poslednaAtrapa = Date.now(); };
    if (/posthog|stripe\.com|resend\.com|doubleclick|facebook/.test(u.host)) { return route.fulfill({ status: 204 }); }
    if (u.host.includes('cloudinary') && m !== 'GET') { atrapa(); return route.fulfill({ status: 200, json: {} }); }
    if (!u.host.includes('supabase')) return route.continue();
    if (u.pathname.includes('/auth/v1/logout')) return route.fulfill({ status: 204 });
    // Pri načítaní stránky funkcie len čítajú; atrapa iba po kliku, inak by sama zhodila obrazovku (listMyWills 9. 11.).
    if (u.pathname.startsWith('/functions/v1/')) { if (!ctx.klikam || /\/(get|list)-/.test(u.pathname) || /"action":"(list|get|hint)"/.test(q.postData() || '')) return route.continue(); atrapa(); return route.fulfill({ status: 200, json: {} }); }
    // RPC pri načítaní stránky len číta; zápis môže prísť až po kliku.
    if (u.pathname.startsWith('/rest/v1/rpc/')) { if (!ctx.klikam || CITANIE_RPC.test(u.pathname.split('/').pop())) return route.continue(); atrapa(); return route.fulfill({ status: 200, json: [] }); }
    if ((u.pathname.startsWith('/rest/v1/') || u.pathname.startsWith('/storage/v1/')) && !['GET', 'HEAD'].includes(m)) { atrapa(); return route.fulfill({ status: 201, json: [] }); }
    return route.continue();
  });
  return ctx;
}

async function nacitaj(p, url) {
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await p.waitForFunction(() => document.querySelector('#root')?.children.length && !document.querySelector('.pk-skel'), null, { timeout: 12_000 }).catch(() => {});
  await wait(900);
  await p.evaluate(() => { window.__prechod.skryDev(); window.__prechod.oznac(); }).catch(() => {});
}

let cisloSnimky = 0;
async function zmeraj(p, kontext, okno) {
  const cast = await p.evaluate(() => window.__prechod.meraj());
  const dole = await p.evaluate(async () => { const ma = window.__prechod.dole(); await new Promise(r => setTimeout(r, 250)); return ma ? window.__prechod.zakryte('dole') : []; });
  const hore = await p.evaluate(async () => { window.__prechod.hore(); await new Promise(r => setTimeout(r, 250)); return window.__prechod.zakryte('hore'); });
  const snimka = `${++cisloSnimky}.jpg`;
  await p.screenshot({ path: path.join(OUT, snimka), type: 'jpeg', quality: 60 }).catch(() => {});
  const k = { ...kontext, okno, snimka };
  stav.stavy.push(k);
  const poAtrape = Date.now() - (p.context().poslednaAtrapa || 0) < 4000;
  for (const n of [...cast.nalezy, ...dole, ...hore]) if (!(n.druh === 'PAD' && poAtrape)) pridaj(n, k);
  for (const r of cast.rodiny) stav.rodiny.push({ ...r, stav: kontext.stav });
  for (const f of cast.subory) if (kontext.typ === 'okno') stav.oknaVidene.add(f);
}

/** Vráti stránku do stavu po sérii klikov. */
async function doStavu(p, url, retaz) {
  await nacitaj(p, url);
  for (const c of retaz) {
    await p.evaluate(x => window.__prechod.klik(x), c).catch(() => false);
    await wait(650);
  }
}

async function prejdiStav(p, ctx, url, cesta, retaz, nazov, okno, fronta, videneOkna, znamed = new Set()) {
  const max = retaz.length ? MAX_KLIKOV_OKNO : MAX_KLIKOV;
  const zoznam = (await p.evaluate(m => window.__prechod.spustace(m), max)).filter(c => !NEKLIKAJ.test(c.label) && !(retaz.length === 0 && c.nav && stav.navHotovo?.has(c.kostra)) && !znamed.has(c.cesta));
  const cesty = new Set([...znamed, ...zoznam.map(c => c.cesta)]);
  for (const t of zoznam) {
    if (Date.now() > stav.koniec) return;
    try {
      const pred = await p.evaluate(() => ({ m: window.__prechod.mut(), n: window.__prechod.pocetNovych() }));
      let poz = 0; const poc = () => { poz++; }; p.on('request', poc); p.on('filechooser', poc);
      ctx.klikam = true;
      const ok = await p.evaluate(c => window.__prechod.klik(c), t.cesta).catch(() => false);
      for (let i = 0, t0 = Date.now(); i < 30; i++) {
        await wait(100);
        const x = await p.evaluate(() => ({ m: window.__prechod.mut(), n: window.__prechod.pocetNovych() })).catch(() => null);
        if (!x || new URL(p.url()).pathname !== cesta) break;
        if (x.n > pred.n) { await wait(400); break; } // okno sa otvorilo, necháme dobehnúť animáciu
        if (Date.now() - t0 > (x.m !== pred.m ? 1500 : 2200)) break; // pod záťažou lazy chunk trvá; 700 ms prešlo len naprázdno
      }
      ctx.klikam = false;
      p.off('request', poc); p.off('filechooser', poc);
      if (!ok) continue;
      if (t.nav) (stav.navHotovo ??= new Set()).add(t.kostra);
      const u = new URL(p.url());
      if (u.pathname !== cesta) {
        if (u.host !== new URL(BASE).host) { await doStavu(p, url, retaz); continue; }
        fronta(u.pathname, nazov, t.label);
        await doStavu(p, url, retaz);
        continue;
      }
      const po = await p.evaluate(() => ({ m: window.__prechod.mut(), n: window.__prechod.pocetNovych(), v: window.__prechod.popisVrstvy() }));
      if (process.env.LADIT) console.log(`  ${nazov} ▸ ${t.label || t.cesta.slice(-40)} · nove ${pred.n}→${po.n} · mut ${po.m - pred.m} · req ${poz} · ${po.v?.titul || ''}`);
      if (po.n > pred.n && po.v) {
        const kluc = `${po.v.src}|${po.v.titul}`;
        if (!videneOkna.has(kluc) && retaz.length < HLBKA) {
          videneOkna.add(kluc);
          const meno = `${nazov} › ${t.label || po.v.titul || 'okno'}`;
          await zmeraj(p, { stav: meno, typ: 'okno', src: po.v.src }, okno);
          await prejdiStav(p, ctx, url, cesta, [...retaz, t.cesta], meno, okno, fronta, videneOkna);
        }
        await doStavu(p, url, retaz);
      } else if (po.m === pred.m && poz === 0 && t.label) {
        pridaj({ druh: 'MRTVE', txt: t.label, src: '' }, { stav: nazov, okno, typ: 'klik' });
      } else if (po.m !== pred.m) {
        // Záložka, chip, rozbalenie: nové tlačidlá na mieste sú samostatný stav, inak by sa okná za nimi nikdy neotvorili.
        const nove = (await p.evaluate(m => window.__prechod.spustace(m), MAX_KLIKOV)).filter(c => !cesty.has(c.cesta) && !NEKLIKAJ.test(c.label) && !c.nav);
        for (const n of await p.evaluate(l => window.__prechod.zakryteNove(l), nove.map(c => c.cesta))) pridaj(n, { stav: `${nazov} › ${t.label}`, okno, typ: 'klik' });
        const kluc = `${cesta}|${t.kostra}|${nove.slice(0, 3).map(c => c.label).join()}`;
        if (nove.length && retaz.length < HLBKA && !videneOkna.has(kluc) && (stav.inline.get(cesta) || 0) < MAX_INLINE) {
          videneOkna.add(kluc); stav.inline.set(cesta, (stav.inline.get(cesta) || 0) + 1);
          const meno = `${nazov} › ${t.label || 'rozbalené'}`;
          await zmeraj(p, { stav: meno, typ: 'stav' }, okno);
          await prejdiStav(p, ctx, url, cesta, [...retaz, t.cesta], meno, okno, fronta, videneOkna, new Set(zoznam.map(c => c.cesta)));
        }
        await doStavu(p, url, retaz);
      }
    } catch (e) {
      stav.chyby.push(`${nazov} / ${t.label}: ${e.message.split('\n')[0]}`);
      await doStavu(p, url, retaz).catch(() => {});
    }
  }
}

async function behOkna(browser, subor, w, h) {
  const okno = `${w}×${h}`;
  const vzorPocet = new Map(), fronta = [], videneCesty = new Set(), videneOkna = new Set();
  const doFronty = (cesta, odkial, label) => {
    if (!cesta.startsWith('/pack') || (LEN && !cesta.startsWith(LEN))) return;
    const c = cesta.replace(/\/$/, '') || cesta;
    if (videneCesty.has(c)) return;
    const r = najdiRoutu(c);
    if (!r && odkial) { pridaj({ druh: 'NEZNAMA', txt: c, src: '', o: label }, { stav: odkial, okno, typ: 'klik' }); return; }
    if (r && (vzorPocet.get(r) || 0) >= MAX_NA_VZOR) return;
    videneCesty.add(c); vzorPocet.set(r, (vzorPocet.get(r) || 0) + 1);
    fronta.push(c);
  };
  for (const z of ZHODY) if (z.staticka) doFronty(z.r);

  stav.navHotovo = new Set();
  await Promise.all(Array.from({ length: PARALEL }, async () => {
    const ctx = await novyKontext(browser, subor, w, h);
    const p = await ctx.newPage();
    let aktualna = '';
    // Chyba tesne po atrape je dôsledok atrapy, nie appky.
    p.on('pageerror', e => Date.now() - (ctx.poslednaAtrapa || 0) > 3000 && pridaj({ druh: 'CHYBA_JS', txt: e.message, src: '' }, { stav: aktualna, okno, typ: 'stranka' }));
    p.on('console', m => { if (m.type() === 'error') p.evaluate(t => { window.__prechodChyba = t; }, m.text().slice(0, 200)).catch(() => {}); if (m.type() === 'error' && /^Warning:/.test(m.text())) pridaj({ druh: 'REACT', txt: m.text().slice(0, 60), src: '' }, { stav: aktualna, okno, typ: 'stranka' }); });
    p.on('response', r => { if (r.status() >= 400 && /supabase|localhost/.test(r.url())) pridaj({ druh: 'SIET', txt: `${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '').split('?')[0].slice(0, 50)}`, src: '' }, { stav: aktualna, okno, typ: 'stranka' }); });
    let prazdno = 0;
    while (Date.now() < stav.koniec) {
      const cesta = fronta.shift();
      if (!cesta) { if (++prazdno > 12) break; await wait(1500); continue; }
      prazdno = 0; aktualna = cesta;
      const url = BASE + cesta;
      try {
        await nacitaj(p, url);
        const finalna = new URL(p.url()).pathname;
        if (!finalna.startsWith('/pack')) { if (cesta === '/pack') throw new Error('PRIHLASENIE ZLYHALO'); stav.navstivene.set(cesta, { presmerovane: finalna, okno }); continue; }
        stav.navstivene.set(cesta, { okno });
        await zmeraj(p, { stav: cesta, typ: 'stranka' }, okno);
        // Podstránky dynamickej routy (/pack/dogs/:id/karticka) dostanú ten istý parameter.
        const rodic = najdiRoutu(cesta);
        for (const z of ZHODY) if (rodic && z.dyn && z.r.startsWith(rodic + '/') && !z.r.slice(rodic.length + 1).includes(':') && !z.r.includes('*')) doFronty(cesta + z.r.slice(rodic.length));
        (await p.evaluate(() => window.__prechod.odkazy())).forEach(h => doFronty(h.split('?')[0].split('#')[0], cesta, 'odkaz'));
        await prejdiStav(p, ctx, url, finalna, [], cesta, okno, doFronty, videneOkna);
        console.log(`· ${okno} ${cesta} (stavov spolu ${stav.stavy.length}, vo fronte ${fronta.length})`);
      } catch (e) {
        if (e.message === 'PRIHLASENIE ZLYHALO') throw e;
        stav.chyby.push(`${cesta}: ${e.message.split('\n')[0]}`);
      }
    }
    await ctx.close().catch(() => {});
  }));
  return fronta;
}

// ─── report ────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function report(zostalo) {
  const zlucene = new Map();
  for (const n of stav.nalezy) {
    const k = `${n.druh}|${n.src || n.stav}|${n.txt}`;
    if (!zlucene.has(k)) zlucene.set(k, { ...n, krat: 0, kde: new Set() });
    const z = zlucene.get(k); z.krat++; z.kde.add(n.stav);
  }
  const vsetky = [...zlucene.values()];
  for (const rola of ['PILULKA', 'ÚCHYT', 'SPÄŤ']) {
    const sig = [...new Set(stav.rodiny.filter(r => r.rola === rola).map(r => r.sig))];
    if (sig.length > 1) vsetky.push({ druh: 'NESURODE', txt: `${rola}: ${sig.length} podôb`, o: sig.join(' | ').slice(0, 200), src: '', krat: sig.length, kde: new Set(stav.rodiny.filter(r => r.rola === rola).map(r => r.stav)) });
  }
  const tvrde = vsetky.filter(n => druhy[n.druh]), dlh = vsetky.filter(n => DLH[n.druh]);
  const nav = [...stav.navstivene.keys()].map(najdiRoutu);
  const neprejdene = ROUTY.filter(r => !nav.includes(r) && (!LEN || r.startsWith(LEN)));
  const celkom = LEN ? ROUTY.filter(r => r.startsWith(LEN)).length : ROUTY.length;
  const okna = oknaVKode(), neotvorene = LEN ? [] : okna.filter(f => !stav.oknaVidene.has(f));
  const bezZdroja = !stav.oknaVidene.size && stav.stavy.some(s => s.typ === 'okno');

  const rod = {};
  for (const r of stav.rodiny) { rod[r.rola] ??= {}; (rod[r.rola][r.sig] ??= { n: 0, txt: r.txt, stav: r.stav, src: r.src }).n++; }

  const sekcia = (mena, zoz) => Object.entries(mena).map(([d, t]) => {
    const l = zoz.filter(n => n.druh === d).sort((a, b) => b.krat - a.krat);
    if (!l.length) return '';
    return `<h3>${esc(t)} <small>${l.length}</small></h3><table>${l.map(n => `<tr><td>${n.snimka ? `<a href="${n.snimka}" target=_blank><img loading=lazy src="${n.snimka}"></a>` : ''}</td><td><b>${esc(n.txt)}</b> ${n.o ? `<i>${esc(n.o)}</i>` : ''}<br><code>${esc(n.src)}</code><br><span>${esc([...n.kde].slice(0, 4).join(' · '))}${n.kde.size > 4 ? ` +${n.kde.size - 4}` : ''}</span></td></tr>`).join('')}</table>`;
  }).join('');

  const html = `<!doctype html><meta charset=utf-8><title>Prechod appky</title><style>body{font:14px system-ui;margin:24px auto;max-width:1100px;padding:0 16px;background:#faf6ec;color:#222}h2{margin-top:40px;border-bottom:2px solid #C99A3F}table{border-collapse:collapse;width:100%}td{border-top:1px solid #ddd;padding:6px;vertical-align:top}td img{width:90px}code{color:#7A2FBF;font-size:12px}span,i{color:#777}small{color:#B25640}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.g img{width:100%;border:1px solid #ccc}.g p{font-size:11px;margin:2px 0;word-break:break-word}.bad{background:#fbe5de;padding:12px;border-radius:8px}</style>
<h1>Prechod appky</h1><p>${new Date().toLocaleString('sk-SK')} · okná ${OKNA.map(o => o.join('×')).join(', ')} · stavov ${stav.stavy.length} · nálezov ${tvrde.length} · dizajnový dlh ${dlh.length} · zásahov zablokovaných ${stav.zablokovane}</p>
<h2>Čo sa NEPREŠLO</h2><div class=bad><b>Routy ${celkom - neprejdene.length} / ${celkom}</b>${neprejdene.length ? '<br>' + neprejdene.map(esc).join('<br>') : ''}<br><br><b>Súbory s oknom otvorené ${LEN ? 'nemerané pri --len' : okna.length - neotvorene.length + ' / ' + okna.length}</b>${bezZdroja ? ' (pozor: zdroje sa nedali prečítať)' : ''}<br>${neotvorene.map(esc).join('<br>')}${zostalo.length ? `<br><br><b>Nestihnuté z frontu:</b> ${zostalo.map(esc).join(', ')}` : ''}${stav.chyby.length ? `<br><br><b>Chyby prechodu (${stav.chyby.length}):</b><br>${stav.chyby.slice(0, 40).map(esc).join('<br>')}` : ''}</div>
<h2>Nálezy</h2>${sekcia(druhy, tvrde)}
<h2>Dizajn: koľko podôb má jeden prvok</h2>${Object.entries(rod).map(([r, s]) => `<h3>${esc(r)} <small>${Object.keys(s).length} podôb</small></h3><table>${Object.entries(s).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => `<tr><td>${v.n}×</td><td><b>${esc(k)}</b><br><span>„${esc(v.txt)}“ · ${esc(v.stav)}</span> <code>${esc(v.src)}</code></td></tr>`).join('')}</table>`).join('')}
<h2>Dlh</h2>${sekcia(DLH, dlh)}
<h2>Všetky stavy (${stav.stavy.length})</h2><div class=g>${stav.stavy.map(s => `<div><a href="${s.snimka}" target=_blank><img loading=lazy src="${s.snimka}"></a><p>${esc(s.okno)} ${esc(s.stav)}</p></div>`).join('')}</div>`;
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  fs.writeFileSync(path.join(OUT, 'vysledok.json'), JSON.stringify({ tvrde: tvrde.map(n => ({ ...n, kde: [...n.kde] })), dlh: dlh.map(n => ({ ...n, kde: [...n.kde] })), neprejdene, neotvorene, zostalo, chyby: stav.chyby, stavy: stav.stavy, rodiny: rod }, null, 1));

  console.log(`\nPOKRYTIE  routy ${celkom - neprejdene.length}/${celkom} · súbory s oknom ${LEN ? '—' : okna.length - neotvorene.length + '/' + okna.length} · stavov ${stav.stavy.length}${stav.chyby.length ? ` · chyby prechodu ${stav.chyby.length}` : ''}`);
  if (neprejdene.length) console.log('  neprejdené: ' + neprejdene.join(' '));
  const pocty = {}; tvrde.forEach(n => { pocty[n.druh] = (pocty[n.druh] || 0) + 1; });
  console.log('NÁLEZY    ' + (Object.entries(pocty).map(([d, n]) => `${druhy[d]} ${n}`).join(' · ') || 'žiadne'));
  console.log('DIZAJN    ' + Object.entries(rod).map(([r, s]) => `${r} ${Object.keys(s).length} podôb`).join(' · '));
  console.log(`REPORT    ${path.join(OUT, 'index.html')}`);
  return tvrde.length || neprejdene.length || neotvorene.length || zostalo.length || stav.chyby.length ? 1 : 0;
}

// ─── beh ───────────────────────────────────────────────────────────────────
let srv;
try {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  srv = await server();
  const browser = setriCloudinary(await chromium.launch());
  const subor = path.join(OUT, '.session.json');
  await prihlas(browser, subor);
  stav.koniec = Date.now() + STROP_MS;
  let zostalo = [];
  for (const [w, h] of OKNA) zostalo = zostalo.concat(await behOkna(browser, subor, w, h));
  await browser.close();
  fs.rmSync(subor, { force: true });
  const vysledok = report(zostalo);
  srv.kill();
  process.exit(vysledok);
} catch (e) {
  console.log('✗ prechod nebežal: ' + e.message);
  srv?.kill();
  process.exit(2);
}
