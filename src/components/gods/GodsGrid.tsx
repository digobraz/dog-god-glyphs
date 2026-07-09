import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useT } from '@/i18n/LanguageContext';
import LanguagePicker from '../LanguagePicker';
import { photoPositions, photos } from './godsData';
import { EDGE_BASE } from '@/lib/env';
import { flagUrl, countryISO2, iso2ToISO3, countryFlag } from '@/lib/countryGeo';
import { track } from '@/lib/analytics';
import { gridTileUrl } from '@/services/cloudinaryService';
import { Seo } from '@/components/Seo';
import { useToast } from '@/hooks/use-toast';
import { shareDog, downloadCard, facebookShare, whatsappShare, copyDogLink } from '@/lib/useShareCard';
import { dogPagePath } from '@/lib/dogSlug';
import { BrandIcon } from '../pack/BrandIcon';
import './WhatNextPopup.css';

const GRID_DOGS_URL = `${EDGE_BASE}/get-grid-dogs`;

interface RealDog {
  id: string;
  dog_name: string | null;
  pack_number: number | null;
  cloudinary_main_url: string | null;
  patron_svg: string | null;
  heroglyph_png_url: string | null;
  share_card_url?: string | null;
  country: string | null;
  owner_message: string | null;
}

// Hekthor (0,-1) + hero/CTA karta (0,0) tvoria spolu 1×2 "core" blok. Špirála
// obieha tento core ako rastúci obdĺžnikový prstenec (pravá hrana dole → spodná
// hrana doľava → ľavá hrana hore → horná hrana doprava), takže KAŽDÉ ďalšie
// číslo je vždy presne o 1 bunku vedľa predošlého — nikdy neskočí cez core na
// druhú stranu. #2 pristane hneď vpravo od Hekthora, #3 hneď pod #2, atď.
// (Predošlá verzia mala jednoduchú point-špirálu s Hero ako preskočenou dierou
// uprostred — to spôsobovalo skok #3→#4 cez CTA kartu.)
function generatePackPositions(count: number): Array<{col: number, row: number}> {
  const result: Array<{col: number, row: number}> = [];
  let left = 0, right = 0, top = -1, bottom = 0; // core: Hekthor + hero
  while (result.length < count) {
    const newLeft = left - 1, newRight = right + 1, newTop = top - 1, newBottom = bottom + 1;
    for (let r = newTop + 1; r <= newBottom; r++) result.push({ col: newRight, row: r });   // pravá hrana, dole
    for (let c = newRight - 1; c >= newLeft; c--) result.push({ col: c, row: newBottom });   // spodná hrana, doľava
    for (let r = newBottom - 1; r >= newTop; r--) result.push({ col: newLeft, row: r });     // ľavá hrana, hore
    for (let c = newLeft + 1; c <= newRight; c++) result.push({ col: c, row: newTop });      // horná hrana, doprava
    left = newLeft; right = newRight; top = newTop; bottom = newBottom;
  }
  return result.slice(0, count);
}

// Mobil (<768px) = karty psov -33% (menšie karty, vyššia hustota grid steny). Desktop nedotknutý.
const MScale = (typeof window !== 'undefined' && window.innerWidth < 768) ? 0.67 : 1;
const W  = Math.round(360 * MScale);
const H  = Math.round(360 * MScale);
const GX = W + Math.round(64 * MScale);
const GY = H + Math.round(64 * MScale);

// Cloudinary tile veľkosť podľa reálne zobrazenej karty × DPR (cap 2x — 3x displeje
// nepotrebujú plnú hustotu na fotke v pozadí karty). Predtým pevných 800px pre všetkých,
// aj mobil s kartou 241px CSS — zbytočne ťažké dlaždice (PageSpeed audit 2026-07-08).
const TILE_SIZE = Math.min(800, Math.max(320, Math.round(
  W * Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
)));

const REVEAL_COL = 3;
const REVEAL_ROW = 1;

const REVEAL_SYMBOL = '/images/dogypt-logo-black-i.png';

const FLAG_NAMES: Record<string, string> = {
  sk: 'Slovakia',
  cz: 'Czechia',
  pl: 'Poland',
  hu: 'Hungary',
  at: 'Austria',
  de: 'Germany',
  us: 'USA',
  gb: 'United Kingdom',
  fr: 'France',
  it: 'Italy',
};

// Vlajka karty — deleguje na zdieľaný countryGeo helper (pozná Čínu, Áziu, ISO3/ISO2
// aj SK/EN názvy). Neznámu/prázdnu krajinu vráti '' → vlajka sa NEVYKRESLÍ (radšej žiadna
// než falošná SK). NIKDY nesmie mať vlastnú duplikovanú mapu — tá bola príčinou #18/#19
// (Čína) aj #14 (Česko) padajúcich na slovenskú vlajku.
function countryToISO2(country?: string | null): string {
  return countryISO2(country) || '';
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Only http(s) URLs and same-origin relative paths. Blocks javascript:/data: and
// any value that could break out of a CSS url()/HTML attribute. Returns '' if unsafe.
function safeUrl(u: string): string {
  if (!u) return '';
  try {
    const url = new URL(u, window.location.origin);
    return (url.protocol === 'http:' || url.protocol === 'https:') ? url.href : '';
  } catch {
    return '';
  }
}

// Vytiahne Cloudinary public_id z uloženej secure_url (`.../image/upload/v123/tmp/<session>/main.jpg`
// → `tmp/<session>/main`) — potrebné aby sme mohli znova zavolať gridTileUrl() a dostať
// dlaždicovú transformáciu namiesto ťahania celého originálu (aj 1MB+ na WALL bunku).
// Vráti null pre neCloudinary assety (napr. lokálne /images/... filler fotky) — vtedy sa
// použije pôvodná URL bez zmeny.
function cloudinaryPublicId(url: string): string | null {
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  let rest = url.slice(idx + marker.length);
  rest = rest.replace(/^v\d+\//, ''); // verzia (voliteľná)
  rest = rest.replace(/\.[a-zA-Z0-9]+$/, ''); // prípona
  return rest || null;
}

// Dlaždicová URL pre WALL kartu — sanitizovaná (safeUrl) + Cloudinary transform (w/h/q auto)
// namiesto surového originálu. Detail/reveal overlay zostáva na plnom obrázku zámerne.
function tileImageUrl(rawUrl: string | null): string {
  const url = safeUrl(rawUrl || '');
  if (!url) return '';
  const publicId = cloudinaryPublicId(url);
  return publicId ? gridTileUrl(publicId, TILE_SIZE) : url;
}

function getPos(filename: string): string {
  const key = decodeURIComponent(filename).normalize('NFC');
  return photoPositions[key] || '50% 50%';
}

function cellHash(col: number, row: number): number {
  const c = col + 500;
  const r = row + 500;
  let h = (c * 374761393 + r * 1013904223 + (c ^ r) * 2246822519) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

// Deterministická bijekcia (col,row) → index v `photos`. Primes coprime
// k photos.length zaručujú, že žiadne dve bunky v rovnakom rade ani stĺpci
// (v rozsahu jedného full cyklu) nemajú rovnakú fotku. Diagonály tiež OK.
function photoIndex(col: number, row: number): number {
  const len = photos.length;
  const n = ((col % len) + len) % len;
  const m = ((row % len) + len) % len;
  return (n * 7 + m * 11 + 31) % len;
}

function photoFor(col: number, row: number) {
  return photos[photoIndex(col, row)];
}

// Hektor (#1) ako filler pes — rozmnožený v nekonečnej stene popri zákazníkoch.
// Founder karta na (0,-1) ostáva špeciálna (makeHektorCard); toto je len pre výplň.
const HEKTHOR_FILL: RealDog = {
  id: 'hektor-fill',
  dog_name: 'HEKTHOR',
  pack_number: 1,
  cloudinary_main_url: '/images/hektor-grid.webp',
  patron_svg: null,
  heroglyph_png_url: '/images/hekthor-heroglyph.webp',
  country: 'SVK',
  owner_message: null,
};

const NEIGHBORS8: ReadonlyArray<[number, number]> = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
];

// Bázový index psa do `fillers` pre danú bunku. Lineárne koeficienty (1·c + 3·r)
// zaručujú, že KAŽDÝ z 8 susedov (vrátane diagonál) má iný index — žiadne dva
// rovnaké fillery vedľa seba. (Δ susedov = 1,3,4,7 mod 9 — všetky ≠ 0.)
function gIndex(col: number, row: number, len: number): number {
  if (len <= 0) return 0;
  return (((col + 3 * row) % len) + len) % len;
}

// pack_number psa zobrazeného v bunke (bázovo, bez konfliktovej korekcie) — na
// kontrolu susedov pri výbere fillera. Zrkadlí poradie vetiev v makeCard.
function basePackAt(col: number, row: number, map: Map<string, RealDog>, fillers: RealDog[]): number | null {
  if (col === 0 && row === 0) return null;       // hero
  if (col === 0 && row === -1) return 1;          // Hektor founder
  const canon = map.get(`${col},${row}`);
  if (canon) return canon.pack_number ?? null;
  if (fillers.length === 0) return null;
  return fillers[gIndex(col, row, fillers.length)].pack_number ?? null;
}


export function GodsGrid() {
  const navigate = useNavigate();
  const t = useT();
  const appRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [showWhatNext, setShowWhatNext] = useState(false);
  const whatNextShownRef = useRef(false);
  const { toast } = useToast();
  // Share Card (WhatNext 5. slide) — null kým sa pipeline (post-payment, ~pár sekúnd)
  // nedopracuje k share_card_url; slide dovtedy zobrazí "preparing" fallback.
  const [revealShareCardUrl, setRevealShareCardUrl] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState<'share' | 'download' | null>(null);
  const [revealStep, setRevealStep] = useState<0|1|2|3|4>(0);
  const [revealSymbol, setRevealSymbol] = useState(() => new URLSearchParams(window.location.search).get('heroglyphUrl') || REVEAL_SYMBOL);
  const [dogsReady, setDogsReady] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  // Štatistika krajín pre filter popup: [{ iso2, iso3, count }], zoradené od najviac.
  const [countryStats, setCountryStats] = useState<{ iso2: string; iso3: string; count: number }[]>([]);
  const realDogMapRef = useRef<Map<string, RealDog>>(new Map());
  // Reálni psi (zákazníci, bez Hektora) opakovaní cez prázdne bunky → nekonečný WALL.
  const fillerDogsRef = useRef<RealDog[]>([]);
  const navigateToRef = useRef<((n: number) => void) | null>(null);
  // t() drží aktuálnu funkciu bez toho, aby bola v deps hlavného build efektu (ten je
  // najťažší v komponente — teardown pri každom prepnutí jazyka by zbúral celý grid,
  // resetol scroll pozíciu a zavrel otvorenú kartu). Preklady vnútri efektu čítaj cez
  // tRef.current(...), nie priamo cez `t`.
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  const revealData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('reveal');
    const isDemo = mode === 'demo';
    const active = mode === 'true' || isDemo;
    return {
      active,
      dogName: isDemo ? 'Toby' : (params.get('dogName') || 'Your Dog'),
      photoUrl: isDemo ? '/dogs/toby.jpg' : (params.get('photoUrl') || ''),
      packNumber: isDemo ? String(photos.length) : (params.get('packNumber') || String(photos.length + 1)),
      heroglyphUrl: params.get('heroglyphUrl') || '',
    };
  }, []);

  // Load real dogs for the grid
  useEffect(() => {
    let alive = true; // unmount guard — nesetuj state po odmountovaní (StrictMode dvojfetch, rýchla navigácia preč)
    fetch(GRID_DOGS_URL)
      .then(r => r.ok ? r.json() : [])
      .then((dogs: RealDog[]) => {
        if (!alive) return;
        if (dogs.length > 0) {
          const maxN = dogs.reduce((m, d) => Math.max(m, d.pack_number ?? 0), 0);
          const positions = generatePackPositions(maxN + 5);
          const map = new Map<string, RealDog>();
          for (const dog of dogs) {
            const n = dog.pack_number;
            if (!n || n < 2) continue; // #1 = Hektor founder, mimo špirály na (0,-1)
            // #2 = prvá špirálová pozícia positions[0], #3 → [1], … #n → [n-2].
            const idx = n - 2;
            if (idx < positions.length) {
              map.set(`${positions[idx].col},${positions[idx].row}`, dog);
            }
          }
          realDogMapRef.current = map;
          // Filler set = Hektor + všetci zákazníci (#2+); každý sa rozmnožuje v stene.
          fillerDogsRef.current = [HEKTHOR_FILL, ...dogs.filter(d => (d.pack_number ?? 0) >= 2)];
          // Štatistika krajín (vrátane Hektora #1) pre filter popup.
          const cc = new Map<string, number>();
          for (const d of fillerDogsRef.current) {
            const iso2 = countryISO2(d.country);
            if (!iso2) continue;
            cc.set(iso2, (cc.get(iso2) ?? 0) + 1);
          }
          setCountryStats(
            [...cc.entries()]
              .map(([iso2, count]) => ({ iso2, iso3: iso2ToISO3(iso2), count }))
              .sort((a, b) => b.count - a.count)
          );
          if (revealData.active) {
            const packNum = parseInt(revealData.packNumber, 10);
            const revealDog = dogs.find(d => d.pack_number === packNum);
            if (!revealData.heroglyphUrl && revealDog?.heroglyph_png_url) {
              setRevealSymbol(revealDog.heroglyph_png_url);
            }
            if (revealDog?.share_card_url) {
              setRevealShareCardUrl(revealDog.share_card_url);
            }
          }
        }
        setDogsReady(true);
      })
      .catch(() => { if (alive) setDogsReady(true); });
    return () => { alive = false; };
  }, [revealData.active, revealData.packNumber]);

  // Reveal sequence timing
  // step 1: black screen + symbol burns in
  // step 2: only dog photo visible on black (symbol fades, grid still hidden)
  // step 3: grid appears around dog (+2s after photo)
  // step 4: done, overlay removed
  // If heroglyphUrl is in URL params we start immediately; otherwise wait for DB load.
  useEffect(() => {
    if (!revealData.active) return;
    if (!revealData.heroglyphUrl && !dogsReady) return;
    setRevealStep(1);
    const t1 = setTimeout(() => setRevealStep(2), 2000);
    const t2 = setTimeout(() => setRevealStep(3), 4200);
    const t3 = setTimeout(() => {
      setRevealStep(4);
      window.history.replaceState(null, '', '/');
    }, 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [revealData.active, revealData.heroglyphUrl, dogsReady]);

  const submitFilter = () => {
    const n = parseInt(filterValue, 10);
    if (!isNaN(n) && n >= 1) navigateToRef.current?.(n);
    setFilterOpen(false);
    setFilterValue('');
  };

  // Desktop hardware-keyboard support for the numpad overlay
  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        setFilterValue(v => (v + e.key).slice(0, 6));
      } else if (e.key === 'Backspace') {
        setFilterValue(v => v.slice(0, -1));
      } else if (e.key === 'Enter') {
        submitFilter();
      } else if (e.key === 'Escape') {
        setFilterOpen(false);
        setFilterValue('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filterOpen, filterValue]);

  useEffect(() => {
    if (revealStep === 2) {
      const card = document.querySelector('.reveal-card');
      card?.classList.add('reveal-active');
    }
  }, [revealStep]);

  // WHAT NEXT? popup — len pre nového člena (revealData.active), raz, po dobehnutí
  // reveal animácie (step 4). Spustí sa 2s po dokončení, ALEBO hneď pri prvom
  // pohybe myšou / dotyku po reveale — podľa toho čo nastane skôr.
  useEffect(() => {
    if (revealStep !== 4 || !revealData.active) return;
    if (whatNextShownRef.current) return;

    const open = () => {
      if (whatNextShownRef.current) return;
      whatNextShownRef.current = true;
      setShowWhatNext(true);
    };
    const t = setTimeout(open, 2000);
    window.addEventListener('mousemove', open, { once: true, passive: true });
    window.addEventListener('touchstart', open, { once: true, passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('mousemove', open);
      window.removeEventListener('touchstart', open);
    };
  }, [revealStep, revealData.active]);

  // Share Card race: pipeline generuje share_card_url ~pár sekúnd po platbe, takže
  // v momente prvého get-grid-dogs fetchu (spustí sa hneď pri reveale) často ešte
  // nie je hotová. Kým je WhatNext popup otvorený a URL stále chýba, dopytuj znova
  // (max 20×, každé 4s ≈ 80s) — nový pes: share karta sa generuje v pipeline
  // ~30-60s po platbe (heroglyph → toPng → upload → PATCH), 32s okno to tesne
  // minulo. Prvý poll skoro (1.5s) nech hotová karta naskočí hneď.
  useEffect(() => {
    if (!revealData.active || revealShareCardUrl || !showWhatNext) return;
    let alive = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const MAX = 20;
    const packNum = parseInt(revealData.packNumber, 10);
    const poll = () => {
      attempts += 1;
      fetch(GRID_DOGS_URL)
        .then(r => r.ok ? r.json() : [])
        .then((dogs: RealDog[]) => {
          if (!alive) return;
          const found = dogs.find(d => d.pack_number === packNum);
          if (found?.share_card_url) {
            setRevealShareCardUrl(found.share_card_url);
          } else if (attempts < MAX) {
            timer = setTimeout(poll, 4000);
          }
        })
        .catch(() => { if (alive && attempts < MAX) timer = setTimeout(poll, 4000); });
    };
    timer = setTimeout(poll, 1500);
    return () => { alive = false; clearTimeout(timer); };
  }, [revealData.active, revealData.packNumber, revealShareCardUrl, showWhatNext]);

  // Share / Download handlers pre WhatNext 5. slide (self-contained — nezávislé
  // od /pack, hoci volajú rovnaké fetch→File utility ako PackShareCard.tsx).
  const handleWnShare = async () => {
    if (!revealShareCardUrl || shareBusy) return;
    setShareBusy('share');
    try {
      const pack = parseInt(revealData.packNumber, 10);
      const shareText = t('share.dogVoice', { dog: revealData.dogName.toUpperCase() });
      const result = await shareDog({
        pack,
        dogName: revealData.dogName,
        imageUrl: revealShareCardUrl,
        channel: 'native',
        shareText,
      });
      track('share_clicked', { channel: result, type: 'sharecard', location: 'whatnext' });
      if (result === 'copied') toast({ title: t('sharecard.linkCopied') });
    } catch (err) {
      toast({
        title: t('sharecard.saved'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setShareBusy(null);
    }
  };

  const handleWnFacebook = () => {
    const shareText = t('share.dogVoice', { dog: revealData.dogName.toUpperCase() });
    facebookShare(parseInt(revealData.packNumber, 10), revealData.dogName, shareText);
    track('share_clicked', { channel: 'facebook', type: 'sharecard', location: 'whatnext' });
  };

  const handleWnWhatsapp = () => {
    const shareText = t('share.dogVoice', { dog: revealData.dogName.toUpperCase() });
    whatsappShare(parseInt(revealData.packNumber, 10), revealData.dogName, shareText);
    track('share_clicked', { channel: 'whatsapp', type: 'sharecard', location: 'whatnext' });
  };

  const handleWnCopyLink = async () => {
    await copyDogLink(parseInt(revealData.packNumber, 10), revealData.dogName);
    track('share_clicked', { channel: 'copy', type: 'sharecard', location: 'whatnext' });
    toast({ title: t('sharecard.linkCopied') });
  };

  const handleWnDownload = async () => {
    if (!revealShareCardUrl || shareBusy) return;
    setShareBusy('download');
    try {
      await downloadCard({ imageUrl: revealShareCardUrl, dogName: revealData.dogName });
      track('share_clicked', { channel: 'download', type: 'sharecard', location: 'whatnext' });
      toast({ title: t('sharecard.saved') });
    } catch (err) {
      toast({
        title: t('sharecard.saved'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setShareBusy(null);
    }
  };

  // Carousel pre WHAT NEXT? popup (vanilla DOM, port z prototypu 1:1).
  useEffect(() => {
    if (!showWhatNext) return;
    const root = document.querySelector('.wn-card');
    if (!root) return;
    const track = root.querySelector('.wn-track') as HTMLElement | null;
    const slides = root.querySelectorAll('.wn-slide');
    const cur = root.querySelector('.wn-counter .wn-cur') as HTMLElement | null;
    if (!track || !cur || slides.length === 0) return;
    const N = slides.length;
    let i = 0;
    // Postupný nábeh obsahu aktívnej karty (stagger). Re-trigger cez reflow.
    const animateIn = (idx: number) => {
      slides.forEach(s => s.classList.remove('wn-in'));
      const el = slides[idx] as HTMLElement;
      void el.offsetWidth;
      el.classList.add('wn-in');
    };
    const go = (n: number) => {
      i = (n + N) % N;
      track.style.transform = `translateX(-${i * 100}%)`;
      cur.textContent = String(i + 1);
      animateIn(i);
      // Share slide (posledný) = image-first: skryť pečiatku/nadpis/counter, obrázok dominantný
      (root as HTMLElement).classList.toggle('wn-card--share', i === N - 1);
    };
    // prvá karta má .wn-in už z prvého renderu (žiadny flash)
    const prev = root.querySelector('.wn-arrow.wn-prev');
    const next = root.querySelector('.wn-arrow.wn-next');
    const onPrev = () => go(i - 1);
    const onNext = () => go(i + 1);
    prev?.addEventListener('click', onPrev);
    next?.addEventListener('click', onNext);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(i - 1);
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'Escape') setShowWhatNext(false);
    };
    window.addEventListener('keydown', onKey);
    let x0: number | null = null;
    const sl = root.querySelector('.wn-slider') as HTMLElement | null;
    const onTouchStart = (e: TouchEvent) => { x0 = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    };
    sl?.addEventListener('touchstart', onTouchStart, { passive: true });
    sl?.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      prev?.removeEventListener('click', onPrev);
      next?.removeEventListener('click', onNext);
      window.removeEventListener('keydown', onKey);
      sl?.removeEventListener('touchstart', onTouchStart);
      sl?.removeEventListener('touchend', onTouchEnd);
    };
  }, [showWhatNext]);

  useEffect(() => {
    if (!dogsReady) return;
    const app = appRef.current;
    const canvas = canvasRef.current;
    if (!app || !canvas) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let ox = revealData.active
      ? vw / 2 - REVEAL_COL * GX - W / 2
      : vw / 2 - W / 2;
    let oy = revealData.active
      ? vh / 2 - REVEAL_ROW * GY - H / 2
      : vh / 2 - H / 2;
    let dragging = false;
    let startX = 0, startY = 0;
    let prevX = 0, prevY = 0, prevT = 0;
    let vx = 0, vy = 0;
    let raf: number | null = null;
    const cells = new Map<string, HTMLElement>();

    // Click/tap tracking
    let downX = 0, downY = 0;
    let touchDownX = 0, touchDownY = 0;
    let openCardEl: HTMLElement | null = null;

    function toggleCard(card: HTMLElement) {
      const opening = !card.classList.contains('is-open');
      if (openCardEl && openCardEl !== card) openCardEl.classList.remove('is-open');
      if (opening) {
        card.classList.add('is-open');
        openCardEl = card;
        const rankText = card.querySelector('.card-open-rank')?.textContent?.replace('#', '').trim();
        track('wall_dog_click', rankText ? { pack_number: rankText } : {});
      } else {
        card.classList.remove('is-open');
        openCardEl = null;
      }
    }

    function makeHeroCard() {
      const el = document.createElement('div');
      el.className = 'center-hero';
      el.style.left = (W / 2) + 'px';
      el.style.top  = (H / 2) + 'px';
      el.style.transform = 'translate(-50%, -50%)';
      el.innerHTML = `
        <img src="/images/dogypt-gold-logo.webp" alt="DOGYPT" class="hero-logo-icon" fetchpriority="high">
        <p class="hero-tagline">${tRef.current('wall.hero.taglineLead')}<br><span class="gold">${tRef.current('wall.hero.taglineGod')}</span></p>
        <a href="/heroglyph" class="join-btn" data-join>${tRef.current('wall.hero.cta')}</a>
        <span class="hero-count"><svg class="hero-count-globe" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9.2" stroke="currentColor" stroke-width="1.5"/><path d="M3 12h18M4.2 7.5h15.6M4.2 16.5h15.6" stroke="currentColor" stroke-width="1.5"/></svg><span class="hero-count-num">${realDogMapRef.current.size + 1}</span><span class="hero-count-sep"> / </span><span class="hero-count-total">${tRef.current('wall.hero.total')}</span><span class="hero-count-dogs">${tRef.current('wall.hero.dogs')}</span></span>
      `;
      const btn = el.querySelector('[data-join]');
      btn?.addEventListener('click', (e) => {
        e.preventDefault();  // keep SPA nav; href="/heroglyph" exists purely so Googlebot can crawl to it
        track('cta_become_dogyptian_click', { location: 'wall' });
        navigate('/heroglyph');
      });
      return el;
    }

    function makeHektorCard() {
      const el = document.createElement('article');
      el.className = 'dog-card hektor-card';
      el.style.left = '0px';
      el.style.top  = (-1 * GY) + 'px';
      el.innerHTML = `
        <div class="card-img" style="background-image:url('/images/hektor-grid.webp');background-position:50% 35%"></div>
        <div class="card-open-overlay">
          <div class="card-open-titlerow">
            <span class="card-open-rank">#1</span>
            <span class="card-open-name">HEKTHOR</span>
          </div>
          <img class="card-open-heroglyph" src="/images/hekthor-heroglyph.webp" alt="HEKTHOR heroglyph" draggable="false">
          <div class="card-open-msg">${tRef.current('wall.hektor.msg')}</div>
        </div>
        <div class="card-rank-top">#1</div>
        <img class="card-flag" src="${flagUrl('sk')}" alt="Slovakia" title="Slovakia" loading="lazy" draggable="false">
        <div class="hektor-heroglyph-wrap">
          <img class="hektor-heroglyph" src="/images/hekthor-heroglyph.webp" alt="Hekthor heroglyph" draggable="false">
        </div>
        <div class="card-name-block">
          <div class="card-label hektor-label">HEKTHOR</div>
        </div>
      `;
      return el;
    }

    function makeRevealCard() {
      const el = document.createElement('article');
      el.className = 'dog-card reveal-card';
      el.style.left = (REVEAL_COL * GX) + 'px';
      el.style.top  = (REVEAL_ROW * GY) + 'px';
      const safeName = (revealData.dogName || 'DOGYPTIAN')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const packNumInt = parseInt(revealData.packNumber, 10);
      let cc = '';
      let revealOwnerMessage = '';
      for (const dog of realDogMapRef.current.values()) {
        if (dog.pack_number === packNumInt) {
          cc = countryToISO2(dog.country);
          revealOwnerMessage = dog.owner_message ? esc(dog.owner_message) : '';
          break;
        }
      }
      const flagName = FLAG_NAMES[cc] || cc;
      const overlayHeroSrc = esc(revealSymbol);
      // photoUrl + packNumber come from the URL query string — never interpolate raw.
      const photo = safeUrl(revealData.photoUrl);
      const safePack = esc(revealData.packNumber);
      const inner = photo
        ? `<div class="reveal-card-inner"></div>`
        : `<div class="reveal-card-inner reveal-card-fallback"><span class="cartouche">${safeName}</span></div>`;
      el.innerHTML = `
        ${inner}
        <div class="card-open-overlay">
          <div class="card-open-rank">#${safePack}</div>
          <div class="card-open-name">${safeName}</div>
          <img class="card-open-heroglyph" src="${overlayHeroSrc}" alt="${safeName} heroglyph" draggable="false">
          ${revealOwnerMessage ? `<div class="card-open-msg">${revealOwnerMessage}</div>` : ''}
        </div>
        <div class="dog-heroglyph-wrap">
          <img class="dog-heroglyph" src="${overlayHeroSrc}" alt="${safeName} heroglyph" draggable="false">
        </div>
        <div class="card-rank-top">#${safePack}</div>
        ${cc ? `<img class="card-flag" src="${flagUrl(cc)}" alt="${flagName}" title="${flagName}" loading="lazy" draggable="false">` : ''}
        <div class="card-name-block">
          <div class="card-label">${safeName}</div>
        </div>
      `;
      if (photo) {
        // Set background via DOM API (no HTML parsing) — safe from CSS/HTML injection.
        const innerNode = el.querySelector('.reveal-card-inner') as HTMLElement | null;
        if (innerNode) innerNode.style.backgroundImage = `url("${photo}")`;
        const probe = new Image();
        probe.src = photo;
        probe.onerror = () => {
          const node = el.querySelector('.reveal-card-inner') as HTMLElement | null;
          if (!node) return;
          node.style.backgroundImage = '';
          node.classList.add('reveal-card-fallback');
          node.innerHTML = `<span class="cartouche">${safeName}</span>`;
        };
      }
      return el;
    }

    // fill=true → duplikát reálneho psa vo výplni nekonečného WALL. Vyzerá identicky
    // ako originál (vrátane #čísla + správy) — slúži len nato aby WALL nebola prázdna.
    // Nových psov pribúda od stredu (špirála) a postupne tieto duplikáty prepisujú.
    function makeRealDogCard(dog: RealDog, col: number, row: number, fill = false) {
      const cc = countryToISO2(dog.country);
      const flagName = FLAG_NAMES[cc] || cc;
      const safeName = esc((dog.dog_name || 'DOGYPTIAN').toUpperCase());
      const packNum = dog.pack_number ?? '?';

      const el = document.createElement('article');
      el.className = fill ? 'dog-card dog-card--fill' : 'dog-card';
      el.style.left = (col * GX) + 'px';
      el.style.top  = (row * GY) + 'px';
      const overlayHeroSrc = dog.heroglyph_png_url ? esc(dog.heroglyph_png_url) : '';
      const tileSrc = esc(tileImageUrl(dog.cloudinary_main_url));
      // Verejná stránka psa — len keď máme reálne dáta (pack_number + meno) z DB.
      // Fillery bez čísla (edge/transitional stav) tlačidlo nedostanú.
      const dogPageHref = (dog.pack_number != null && dog.dog_name)
        ? esc(dogPagePath(dog.dog_name, dog.pack_number))
        : '';
      el.innerHTML = `
        <div class="card-img" style="background-image:url('${tileSrc}');background-position:50% 30%"></div>
        <div class="card-open-overlay">
          <div class="card-open-rank">#${packNum}</div>
          <div class="card-open-name">${safeName}</div>
          ${overlayHeroSrc ? `<img class="card-open-heroglyph" src="${overlayHeroSrc}" alt="${safeName} heroglyph" draggable="false">` : ''}
          ${dog.owner_message ? `<div class="card-open-msg">${esc(dog.owner_message)}</div>` : ''}
          ${dogPageHref ? `<a class="card-open-dogpage-link" href="${dogPageHref}">${tRef.current('wall.dogPage')}</a>` : ''}
        </div>
        <div class="card-rank-top">#${packNum}</div>
        ${cc ? `<img class="card-flag" src="${flagUrl(cc)}" alt="${flagName}" title="${flagName}" loading="lazy" draggable="false">` : ''}
        ${overlayHeroSrc ? `
        <div class="dog-heroglyph-wrap">
          <img class="dog-heroglyph" src="${overlayHeroSrc}" alt="${safeName} heroglyph" draggable="false">
        </div>` : ''}
        <div class="card-name-block">
          <div class="card-label">${safeName}</div>
        </div>
      `;
      return el;
    }

    function makeCard(col: number, row: number) {
      if (col === 0 && row === 0) return makeHeroCard();
      if (col === 0 && row === -1) return makeHektorCard();
      if (revealData.active && col === REVEAL_COL && row === REVEAL_ROW) return makeRevealCard();

      const realDog = realDogMapRef.current.get(`${col},${row}`);
      if (realDog) return makeRealDogCard(realDog, col, row);

      // Nekonečná stena: prázdne bunky vypĺňame reálnymi psami (Hektor + zákazníci),
      // plný duplikát s #číslom. Vyberáme tak, aby sa pes NIKDY neopakoval v žiadnom
      // z 8 susedov (ani diagonálne) — inak to vyzerá divne.
      const fillers = fillerDogsRef.current;
      if (fillers.length === 0) return null;
      const map = realDogMapRef.current;
      const forbidden = new Set<number>();
      for (const [dc, dr] of NEIGHBORS8) {
        const p = basePackAt(col + dc, row + dr, map, fillers);
        if (p != null) forbidden.add(p);
      }
      const start = gIndex(col, row, fillers.length);
      for (let k = 0; k < fillers.length; k++) {
        const cand = fillers[(start + k) % fillers.length];
        if (!forbidden.has(cand.pack_number ?? -1)) {
          return makeRealDogCard(cand, col, row, true);
        }
      }
      return makeRealDogCard(fillers[start], col, row, true); // fallback (nemalo nastať)
    }

    function updateTransform() {
      canvas!.style.transform = `translate(${ox}px,${oy}px)`;
    }

    function updateCells() {
      const c0 = Math.floor(-ox / GX) - 2;
      const c1 = c0 + Math.ceil(vw / GX) + 4;
      const r0 = Math.floor(-oy / GY) - 2;
      const r1 = r0 + Math.ceil(vh / GY) + 4;

      for (const [key, el] of cells) {
        const [c, r] = key.split(',').map(Number);
        if (c < c0 || c > c1 || r < r0 || r > r1) {
          el.remove();
          cells.delete(key);
        }
      }

      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const key = `${c},${r}`;
          if (cells.has(key)) continue;
          const el = makeCard(c, r);
          if (!el) continue;
          canvas!.appendChild(el);
          cells.set(key, el as HTMLElement);
        }
      }
    }

    function render() {
      updateTransform();
      updateCells();
    }

    // mousemove/touchmove/wheel môžu fírovať oveľa častejšie než 1×/frame (vysokofrekvenčné
    // trackpady/myši) — bez throttlu by render() (transform + cells diff) bežal viackrát
    // za frame zbytočne. scheduleRender() zbatchuje viacero volaní do jedného rAF; ox/oy
    // sú do frame update-nuté synchrónne v handleroch, takže sa nič nestratí.
    let renderRafId: number | null = null;
    function scheduleRender() {
      if (renderRafId !== null) return;
      renderRafId = requestAnimationFrame(() => {
        renderRafId = null;
        render();
      });
    }

    function inertia() {
      vx *= 0.95;
      vy *= 0.95;
      if (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3) return;
      ox += vx;
      oy += vy;
      render();
      raf = requestAnimationFrame(inertia);
    }

    const onMouseDown = (e: MouseEvent) => {
      if (raf) cancelAnimationFrame(raf);
      const target = e.target as HTMLElement;
      // Close open card if clicking outside it
      if (openCardEl && !openCardEl.contains(target)) {
        openCardEl.classList.remove('is-open');
        openCardEl = null;
      }
      if (target.closest('.center-hero') || target.closest('.center-btn') || target.closest('.main-nav') || target.closest('.nav-login') || target.closest('.lang-panel') || target.closest('.center-btn-mobile') || target.closest('.filter-btn') || target.closest('.gods-bottom-bar') || target.closest('.lang-btn-mobile') || target.closest('.lang-modal-root') || target.closest('.numpad-overlay') || target.closest('.card-open-dogpage-link')) return;
      dragging = true;
      downX = e.clientX;
      downY = e.clientY;
      startX = e.clientX - ox;
      startY = e.clientY - oy;
      prevX = e.clientX; prevY = e.clientY; prevT = performance.now();
      vx = vy = 0;
      app!.classList.add('is-dragging');
      document.body.style.cursor = 'pointer';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = now - prevT || 1;
      vx = (e.clientX - prevX) / dt * 16;
      vy = (e.clientY - prevY) / dt * 16;
      prevX = e.clientX; prevY = e.clientY; prevT = now;
      ox = e.clientX - startX;
      oy = e.clientY - startY;
      scheduleRender();
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragging) return;
      dragging = false;
      app!.classList.remove('is-dragging');
      document.body.style.cursor = 'default';

      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist < 6) {
        // Click: find dog card (not hero widget, not card-info which has its own handler)
        const target = e.target as HTMLElement;
        if (!target.closest('.card-info')) {
          const card = target.closest('.dog-card:not(.center-hero)') as HTMLElement | null;
          if (card) { toggleCard(card); return; }
        }
        return; // don't start inertia on click
      }
      raf = requestAnimationFrame(inertia);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (raf) cancelAnimationFrame(raf);
      const t = e.touches[0];
      dragging = true;
      touchDownX = t.clientX;
      touchDownY = t.clientY;
      startX = t.clientX - ox;
      startY = t.clientY - oy;
      prevX = t.clientX; prevY = t.clientY; prevT = performance.now();
      vx = vy = 0;
      app!.classList.add('is-dragging');
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const t = e.touches[0];
      const now = performance.now();
      const dt = now - prevT || 1;
      vx = (t.clientX - prevX) / dt * 16;
      vy = (t.clientY - prevY) / dt * 16;
      prevX = t.clientX; prevY = t.clientY; prevT = now;
      ox = t.clientX - startX;
      oy = t.clientY - startY;
      scheduleRender();
    };
    const onTouchEnd = (e: TouchEvent) => {
      dragging = false;
      app!.classList.remove('is-dragging');

      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const dist = Math.hypot(t.clientX - touchDownX, t.clientY - touchDownY);
        if (dist < 12) {
          // Interactive UI controls (join CTA, nav, lang, filter, numpad…) need their
          // native click — don't preventDefault, or the synthetic click never fires.
          const tapped = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
          if (tapped?.closest('.center-hero, .center-btn, .main-nav, .nav-login, .lang-panel, .center-btn-mobile, .filter-btn, .gods-bottom-bar, .lang-btn-mobile, .lang-modal-root, .numpad-overlay, .card-open-dogpage-link')) {
            return;
          }
          // Prevent the browser from firing synthetic mouse events (mousedown/mouseup/click)
          // after this touch tap — those would re-open a card we just closed.
          e.preventDefault();
          // Tap: close open card if tapping outside, or toggle tapped card
          if (openCardEl) {
            const el = document.elementFromPoint(t.clientX, t.clientY);
            if (el && openCardEl.contains(el)) {
              // tap inside open card → close it
              openCardEl.classList.remove('is-open');
              openCardEl = null;
              return;
            }
            openCardEl.classList.remove('is-open');
            openCardEl = null;
          }
          const el = document.elementFromPoint(t.clientX, t.clientY);
          const card = (el as HTMLElement | null)?.closest?.('.dog-card:not(.center-hero)') as HTMLElement | null;
          if (card) { toggleCard(card); return; }
          return;
        }
      }
      raf = requestAnimationFrame(inertia);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      let dx = e.deltaX, dy = e.deltaY;
      if (e.deltaMode === 1) { dx *= 24; dy *= 24; }
      if (e.deltaMode === 2) { dx *= vh; dy *= vh; }
      ox -= dx;
      oy -= dy;
      scheduleRender();
    };

    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      render();
    };

    // Klik na terč vždy dá viditeľnú odozvu: pulz na center hero + haptika.
    const heroAnchorPulse = () => {
      const hero = canvas?.querySelector('.center-hero') as HTMLElement | null;
      if (hero) {
        hero.classList.remove('hero-anchor-pulse');
        void hero.offsetWidth; // reštart CSS animácie
        hero.classList.add('hero-anchor-pulse');
      }
      navigator.vibrate?.(15);
    };

    const onCenter = () => {
      if (raf) cancelAnimationFrame(raf);
      const tx = vw / 2 - W / 2;
      const ty = vh / 2 - H / 2;
      if (Math.hypot(tx - ox, ty - oy) < 4) {
        // Už ukotvené — rubber-band bounce namiesto „nič sa nedeje"
        heroAnchorPulse();
        const t0 = performance.now();
        const dur = 480;
        const A = 13;
        function bounce(now: number) {
          const p = Math.min((now - t0) / dur, 1);
          oy = ty + A * Math.sin(p * Math.PI * 2.5) * (1 - p) * (1 - p);
          render();
          if (p < 1) raf = requestAnimationFrame(bounce);
          else { oy = ty; render(); }
        }
        raf = requestAnimationFrame(bounce);
        return;
      }
      const sx = ox, sy = oy;
      const t0 = performance.now();
      const dur = 600;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      function step(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        const e = ease(p);
        ox = sx + (tx - sx) * e;
        oy = sy + (ty - sy) * e;
        render();
        if (p < 1) raf = requestAnimationFrame(step);
        else heroAnchorPulse();
      }
      raf = requestAnimationFrame(step);
    };

    app.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    app.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    app.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    function navigateTo(n: number) {
      if (n < 1) return;
      if (raf) cancelAnimationFrame(raf);
      let col: number, row: number;
      if (n === 1) {
        // #1 = Hekthor, the founder card. Hardcoded at (0,-1), NOT in the spiral.
        col = 0; row = -1;
      } else {
        // #2 = positions[0] (prvá špirálová pozícia) … #n → positions[n-2].
        const positions = generatePackPositions(n + 5);
        const idx = n - 2;
        if (idx < 0 || idx >= positions.length) return;
        ({ col, row } = positions[idx]);
      }
      const tx = vw / 2 - col * GX - W / 2;
      const ty = vh / 2 - row * GY - H / 2;
      const sx = ox, sy = oy;
      const t0 = performance.now();
      const dur = 800;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      function step(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        const e = ease(p);
        ox = sx + (tx - sx) * e;
        oy = sy + (ty - sy) * e;
        render();
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }
    navigateToRef.current = navigateTo;

    const centerBtnMobile = document.getElementById('gods-center-btn-mobile');
    centerBtnMobile?.addEventListener('click', onCenter);

    render();

    return () => {
      app.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      app.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      app.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      centerBtnMobile?.removeEventListener('click', onCenter);
      if (raf) cancelAnimationFrame(raf);
      if (renderRafId !== null) cancelAnimationFrame(renderRafId);
      cells.forEach(el => el.remove());
      cells.clear();
    };
  }, [navigate, dogsReady]);

  // Zmena jazyka → NEBÚRAME grid (rebuild by zrušil scroll pozíciu, otvorenú kartu aj
  // virtualizované bunky — je to najťažší efekt v komponente). Jediné miesta kde grid
  // pri builde kreslí i18n text sú hero karta (0,0) a Hektor karta (0,-1) — ak práve
  // existujú v DOM (mohli byť odstránené virtualizáciou pri scrolle ďaleko od stredu),
  // len im prepíšeme text priamo. Ak neexistujú, nič sa nedeje — pri návrate do zorného
  // poľa ich makeHeroCard/makeHektorCard postaví znova s aktuálnym tRef.current().
  useEffect(() => {
    if (!dogsReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const heroTagline = canvas.querySelector('.hero-tagline');
    if (heroTagline) {
      heroTagline.innerHTML = `${t('wall.hero.taglineLead')}<br><span class="gold">${t('wall.hero.taglineGod')}</span>`;
    }
    const joinBtn = canvas.querySelector('.join-btn');
    if (joinBtn) joinBtn.textContent = t('wall.hero.cta');
    const heroTotal = canvas.querySelector('.hero-count-total');
    if (heroTotal) heroTotal.textContent = t('wall.hero.total');
    const heroDogs = canvas.querySelector('.hero-count-dogs');
    if (heroDogs) heroDogs.textContent = t('wall.hero.dogs');
    const hektorMsg = canvas.querySelector('.hektor-card .card-open-msg');
    if (hektorMsg) hektorMsg.textContent = t('wall.hektor.msg');
  }, [t, dogsReady]);

  return (
    <>
      <Seo
        path="/"
        title="DOGYPT — The Place Where DOG is GOD"
        description="Transform your dog's essence into a timeless HEROGLYPH. 12 Symbols, 1 Eternal Legacy."
      />
      <style>{`
        body { overflow: hidden; }

        .gods-root {
          position: fixed;
          inset: 0;
          background-color: #050505;
          font-family: system-ui, -apple-system, sans-serif;
          letter-spacing: -0.02em;
          user-select: none;
          overflow: hidden;
        }
        .gods-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/images/bg-dark.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(3px);
          z-index: 0;
          pointer-events: none;
        }
        #gods-canvas { z-index: 1; }

        .nav-left {
          position: fixed;
          top: 12px;
          left: 20px;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .main-nav {
          display: flex;
          align-items: center;
          gap: 14px;
          white-space: nowrap;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          padding: 7px 20px;
          border-radius: 999px;
        }
        /* Vertical divider between menu words (matches public web PageNav) */
        .main-nav-sep {
          display: inline-block;
          width: 1px;
          height: 12px;
          background: rgba(0,0,0,0.22);
          flex-shrink: 0;
        }
        .main-nav a, .main-nav button {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: #000;
          text-decoration: none;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .main-nav a:hover, .main-nav button:hover { opacity: 0.55; }

        /* ── LOGIN — round papyrus icon button, top-right (matches bottom-bar btns) ── */
        .nav-login {
          position: fixed;
          top: 12px;
          right: 16px;
          z-index: 50;
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          cursor: pointer;
          text-decoration: none;
          transition: opacity 150ms;
        }
        .nav-login:hover { opacity: 0.75; }
        .nav-login-icon {
          width: 18px; height: 18px;
          object-fit: contain;
          filter: brightness(0);
          opacity: 0.72;
        }

        .info-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(8,8,8,0.96);
          backdrop-filter: blur(24px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease;
        }
        .info-overlay.open { opacity: 1; pointer-events: all; }
        .info-close {
          position: absolute;
          top: 20px; right: 20px;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          cursor: pointer;
          color: white;
          font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          transition: background 150ms;
        }
        .info-close:hover { background: rgba(255,255,255,0.2); }
        .info-content {
          max-width: 680px;
          width: 90%;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .info-content h2 {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 700;
          color: white;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .info-content p {
          font-size: 1rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.55);
          max-width: 520px;
        }

        .center-btn {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          background: rgba(163,163,163,0.8);
          backdrop-filter: blur(12px);
          color: white;
          display: flex; align-items: center; gap: 8px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          font-size: 0.875rem;
          font-weight: 500;
          font-family: inherit;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .center-btn:hover { opacity: 0.85; }

        #gods-canvas {
          position: absolute;
          top: 0; left: 0;
          will-change: transform;
        }

        /* ── Dog card base ── */
        .dog-card {
          position: absolute;
          width: ${W}px;
          height: ${H}px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .is-dragging .dog-card { cursor: pointer; transition: none; }

        /* 🔒 LOCKED — kánon aktualizovaný 2026-06-25 (Matej: „nechaj plnú farbu aj na live"):
           Placeholder dogs = PLNÁ FARBA (opacity 1, bez filtra). Predtým priesvitné (opacity 0.6 +
           brightness(0.92) contrast(0.97)) — vzhľad „ZEUS" z 2026-06-02, nahradený.
           NEMENIŤ brightness/opacity/grayscale bez výslovného OK. */
        .dog-card--placeholder { cursor: default; }
        .dog-card--placeholder .card-img {
          filter: none;
          opacity: 1;
        }
        .dog-card--placeholder .card-label {
          font-size: 0.7rem !important;
          letter-spacing: 0.22em !important;
        }
        .dog-card--placeholder:hover {
          transform: none !important;
          box-shadow: none !important;
        }
        .dog-card--placeholder .card-open-overlay { display: none; }

        /* Hover: scale + gradient darkening (suppressed on open card & during drag) */
        .dog-card:not(.is-open):hover {
          transform: scale(1.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          z-index: 5;
        }
        .is-dragging .dog-card:hover { transform: none; box-shadow: none; }

        /* Overlay — appears on hover, uniform dark */
        .dog-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.62);
          opacity: 0;
          will-change: opacity;
          transition: opacity 220ms ease;
          pointer-events: none;
          z-index: 1;
        }
        .dog-card:not(.is-open):hover::after { opacity: 1; }
        .is-dragging .dog-card::after { opacity: 0 !important; }

        /* Elements that hide on hover (and on open) */
        .card-rank-top, .card-flag, .card-name-block {
          will-change: opacity;
          transition: opacity 160ms ease;
        }
        .dog-card:not(.is-open):hover .card-rank-top,
        .dog-card:not(.is-open):hover .card-flag,
        .dog-card:not(.is-open):hover .card-name-block { opacity: 0; }
        .is-dragging .dog-card .card-rank-top,
        .is-dragging .dog-card .card-flag,
        .is-dragging .dog-card .card-name-block { opacity: 1 !important; }

        .card-img {
          width: 100%; height: 100%;
          background-size: cover;
          background-color: #1a1a1a;
        }

        /* Name block (default state, bottom-left) */
        .card-name-block {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          z-index: 2;
        }
        .card-rank {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          font-weight: 700;
          color: #C99A3F;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 6px rgba(0,0,0,0.9);
          line-height: 1;
        }
        .card-rank-gold { color: #C99A3F; }
        .card-label {
          height: 28px;
          padding: 0 10px;
          background: rgba(30,30,30,0.35);
          color: white;
          border-radius: 999px;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          display: flex; align-items: center;
          backdrop-filter: blur(6px);
          white-space: nowrap;
        }



        /* Click (open) overlay */
        .card-open-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.88);
          border-radius: inherit;
          z-index: 6;
          opacity: 0;
          pointer-events: none;
          will-change: opacity;
          transition: opacity 220ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          overflow-y: auto;
        }
        .dog-card.is-open .card-open-overlay { opacity: 1; pointer-events: auto; }
        .dog-card.is-open { z-index: 8; }
        .dog-card.is-open .card-rank-top,
        .dog-card.is-open .card-flag,
        .dog-card.is-open .card-name-block { opacity: 0; }

        .card-open-titlerow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .card-open-name {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: rgba(255,255,255,0.92);
          letter-spacing: 0.08em;
          text-align: center;
        }
        .card-open-rank {
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #3a2c10;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.55);
          border-radius: 999px;
          padding: 2px 11px;
        }
        .card-open-msg {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.6);
          text-align: center;
          line-height: 1.55;
          max-width: 280px;
          font-style: italic;
          margin-top: 2px;
        }
        .card-open-heroglyph {
          width: 48%;
          height: auto;
          display: block;
          flex-shrink: 0;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
          margin-bottom: 4px;
        }
        .card-open-dogpage-link {
          display: inline-block;
          flex-shrink: 0;
          margin-top: 4px;
          padding: 6px 16px;
          font-family: 'Cinzel', serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #C99A3F;
          background: transparent;
          border: 1px solid rgba(201,154,63,0.65);
          border-radius: 8px;
          text-decoration: none;
          /* pointer-events až v otvorenom stave — explicitné auto tu by prerazilo
             pointer-events:none zatvoreného overlay a neviditeľný link by žral kliky */
          pointer-events: none;
          cursor: pointer;
          transition: box-shadow 200ms ease, background 200ms ease;
        }
        .dog-card.is-open .card-open-dogpage-link { pointer-events: auto; }
        .card-open-dogpage-link:hover {
          background: rgba(201,154,63,0.08);
          box-shadow: 0 0 12px rgba(201,154,63,0.45);
        }

        .card-flag {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 8px rgba(0,0,0,0.45);
          pointer-events: auto;
          cursor: help;
          background: #1a1a1a;
          z-index: 2;
        }
        .card-rank-top {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          height: 24px;
          padding: 0 10px;
          background: rgba(30,30,30,0.35);
          color: white;
          border-radius: 999px;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          display: inline-flex;
          align-items: center;
          backdrop-filter: blur(6px);
          white-space: nowrap;
          line-height: 1;
          pointer-events: none;
        }

        /* ── Center hero ── */
        .center-hero {
          position: absolute;
          z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 16px;
          text-align: center;
          pointer-events: auto;
          width: max-content;
        }
        .center-hero::before {
          content: '';
          position: absolute;
          inset: -200px -320px;
          background: radial-gradient(ellipse at center, rgba(8,8,8,0.92) 20%, transparent 68%);
          z-index: -1;
          pointer-events: none;
        }
        /* Zlatý pulz ring — feedback kliku na terč (ukotvenie na stred) */
        .center-hero::after {
          content: '';
          position: absolute;
          left: 50%; top: 50%;
          width: 200px; height: 200px;
          margin: -100px 0 0 -100px;
          border-radius: 50%;
          border: 2px solid rgba(201,154,63,0.9);
          box-shadow: 0 0 24px rgba(201,154,63,0.35);
          opacity: 0;
          pointer-events: none;
        }
        .center-hero.hero-anchor-pulse::after {
          animation: heroAnchorPulse 0.9s ease-out;
        }
        @keyframes heroAnchorPulse {
          0%   { opacity: 0;    transform: scale(0.35); }
          15%  { opacity: 0.95; }
          100% { opacity: 0;    transform: scale(1.7); }
        }
        .hero-logo-icon {
          width: 120px; height: 120px;
          object-fit: contain;
          filter: drop-shadow(0 0 32px rgba(196,155,66,0.5));
        }
        .hero-tagline {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.78rem, 1.4vw, 0.9rem);
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.2em;
          line-height: 1.8;
          text-transform: uppercase;
          text-align: center;
          white-space: nowrap;
        }
        .hero-tagline .gold {
          display: inline;
          white-space: nowrap;
          font-weight: 700;
          background: linear-gradient(100deg, #A3782B 0%, #C49B42 30%, #FFF4C2 50%, #C49B42 70%, #A3782B 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gold-shimmer 6s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(196,155,66,0.5));
        }
        @keyframes gold-shimmer {
          0%   { background-position: -100% 0; }
          60%  { background-position: 200% 0; }
          100% { background-position: 200% 0; }
        }
        .join-btn {
          display: inline-block;
          text-decoration: none;
          margin-top: 6px;
          padding: 16px 40px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.98rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow:
            0 0 24px rgba(255, 200, 90, 0.65),
            0 0 60px rgba(230, 158, 26, 0.50),
            0 0 110px rgba(230, 158, 26, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
          transition: transform 0.2s, box-shadow 0.25s, opacity 0.22s;
          animation: joinBtnPulse 3.2s ease-in-out infinite;
        }
        .join-btn:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            0 0 150px rgba(230, 158, 26, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .join-btn:active { transform: scale(0.98); }
        @keyframes joinBtnPulse {
          0%, 100% {
            box-shadow:
              0 0 24px rgba(255, 200, 90, 0.55),
              0 0 60px rgba(230, 158, 26, 0.42),
              0 0 110px rgba(230, 158, 26, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
          }
          50% {
            box-shadow:
              0 0 34px rgba(255, 215, 110, 0.85),
              0 0 84px rgba(230, 158, 26, 0.62),
              0 0 140px rgba(230, 158, 26, 0.38),
              inset 0 1px 0 rgba(255, 255, 255, 0.55);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .join-btn { animation: none; }
        }
        .hero-count {
          display: inline-flex;
          align-items: center;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.16em;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          text-transform: uppercase;
          text-shadow: 0 0 14px rgba(0,0,0,0.85);
          padding: 6px 16px;
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 999px;
          background: rgba(8,8,8,0.55);
          box-shadow: 0 0 16px rgba(201,154,63,0.2), 0 0 12px rgba(0,0,0,0.85);
          backdrop-filter: blur(6px);
        }
        .hero-count-num {
          background: linear-gradient(180deg, #F4C75A 0%, #D8821F 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }
        .hero-count-sep { color: rgba(255,255,255,0.55); margin: 0 4px; }
        .hero-count-total { color: rgba(255,255,255,0.7); }
        /* inline-flex oseká holú medzeru pred „DOGS" → vlastná medzera cez margin */
        .hero-count-dogs { margin-left: 0.45em; }

        /* ── Hektor — fixed founder card, gold frame + glow ── */
        .hektor-card {
          box-shadow:
            0 0 0 3px rgba(196,155,66,0.95),
            0 0 60px rgba(216,130,31,0.55),
            0 0 130px rgba(216,130,31,0.28);
          animation: hektor-glow-loop 4.5s ease-in-out infinite;
          z-index: 4;
        }
        .hektor-card:not(.is-open):hover {
          transform: scale(1.06);
          box-shadow:
            0 0 0 3px rgba(244,199,90,1),
            0 0 90px rgba(216,130,31,0.85),
            0 0 200px rgba(216,130,31,0.45);
        }
        @keyframes hektor-glow-loop {
          0%, 100% { box-shadow:
            0 0 0 3px rgba(196,155,66,0.95),
            0 0 60px rgba(216,130,31,0.55),
            0 0 130px rgba(216,130,31,0.28); }
          50%      { box-shadow:
            0 0 0 3px rgba(244,199,90,1),
            0 0 80px rgba(216,130,31,0.75),
            0 0 170px rgba(216,130,31,0.38); }
        }
        .hektor-label {
          background: linear-gradient(180deg, rgba(196,155,66,0.92) 0%, rgba(154,114,40,0.92) 100%);
          color: #15080a;
          font-weight: 900;
          letter-spacing: 0.12em;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        /* ── Hektor heroglyph — hover only, centered ── */
        .hektor-heroglyph-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .hektor-card:not(.is-open):hover .hektor-heroglyph-wrap { opacity: 1; }
        .is-dragging .hektor-heroglyph-wrap { opacity: 0 !important; }
        .hektor-heroglyph {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
        }

        /* ── Real dog heroglyph — hover only, centered ── */
        .dog-heroglyph-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .dog-card:not(.is-open):hover .dog-heroglyph-wrap { opacity: 1; }
        .is-dragging .dog-heroglyph-wrap { opacity: 0 !important; }
        .dog-heroglyph {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
        }

        /* ── Reveal card (in grid) ── */
        .reveal-card-inner {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: 50% 30%;
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0ms;
        }
        .reveal-card.reveal-active .reveal-card-inner {
          opacity: 1;
          transition: opacity 800ms ease;
        }
        .reveal-card-fallback {
          background: linear-gradient(135deg, hsl(224 40% 18%), hsl(45 60% 30%));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .reveal-card-fallback .cartouche {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 6vw, 2rem);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: hsl(45 90% 60%);
        }

        /* Card gold glow on reveal */
        @keyframes card-entrance {
          0%   { box-shadow: none; transform: scale(0.9); }
          40%  { transform: scale(1.07);
                 box-shadow: 0 0 0 3px rgba(196,155,66,0.9),
                             0 0 100px rgba(196,155,66,0.95),
                             0 0 200px rgba(196,155,66,0.5); }
          70%  { transform: scale(0.98); }
          100% { transform: scale(1);
                 box-shadow: 0 0 0 2px rgba(196,155,66,0.55),
                             0 0 50px rgba(196,155,66,0.45),
                             0 0 100px rgba(196,155,66,0.2); }
        }
        @keyframes card-glow-loop {
          0%,100% { box-shadow: 0 0 0 2px rgba(196,155,66,0.55),
                                0 0 50px rgba(196,155,66,0.45),
                                0 0 100px rgba(196,155,66,0.2); }
          50%     { box-shadow: 0 0 0 3px rgba(196,155,66,0.75),
                                0 0 70px rgba(196,155,66,0.65),
                                0 0 140px rgba(196,155,66,0.3); }
        }
        .reveal-card.reveal-active {
          animation: card-entrance 1.4s cubic-bezier(0.34,1.3,0.64,1) forwards,
                     card-glow-loop 4s ease-in-out 1.4s infinite;
          z-index: 10;
        }

        /* ── Reveal sequence overlay ── */
        .rev-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080808;
          pointer-events: none;
          transition: none;
        }
        .rev-overlay.step-2 { background: transparent; }
        .rev-overlay.step-3 { background: transparent; }

        .rev-spotlight {
          position: absolute;
          top: 50%; left: 50%;
          width: 360px; height: 360px;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 9999px #080808;
          pointer-events: none;
          opacity: 0;
          border-radius: 12px;
        }
        .rev-overlay.step-2 .rev-spotlight {
          opacity: 1;
          transition: none;
        }
        .rev-overlay.step-3 .rev-spotlight {
          opacity: 0;
          transition: opacity 1400ms ease;
        }

        .rev-big-symbol {
          width: 420px;
          height: auto;
          object-fit: contain;
          pointer-events: none;
          animation: symbol-burn 2s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
          will-change: transform, opacity, filter;
        }
        .rev-overlay.step-2 .rev-big-symbol,
        .rev-overlay.step-3 .rev-big-symbol {
          opacity: 0 !important;
          transition: opacity 400ms ease;
          animation: none;
        }

        /* ── Filter / find dog by number ── */
        .filter-btn {
          z-index: 50;
          width: 40px; height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          color: rgba(0,0,0,0.7);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          transition: border-color 150ms, opacity 150ms;
        }
        .filter-btn:hover { opacity: 0.75; }
        .filter-btn.active { border-color: rgba(0,0,0,0.35); }

        /* Numpad overlay — dims the screen, centered beige keypad (no native keyboard) */
        .numpad-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease;
        }
        .numpad-overlay.open { opacity: 1; pointer-events: auto; }
        .numpad {
          width: min(80vw, 290px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 16px 56px rgba(0,0,0,0.55);
          transform: scale(0.92);
          transition: transform 200ms ease;
        }
        .numpad-overlay.open .numpad { transform: scale(1); }
        .numpad-display {
          height: 54px;
          margin-bottom: 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(201,154,63,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.7rem;
          letter-spacing: 0.12em;
          color: rgba(0,0,0,0.82);
        }
        .numpad-display .ph {
          color: rgba(0,0,0,0.3);
          font-size: 1rem;
          letter-spacing: 0.08em;
        }
        .numpad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .numpad-key {
          height: 52px;
          border-radius: 10px;
          border: 1px solid rgba(201,154,63,0.4);
          background: rgba(255,255,255,0.38);
          color: rgba(0,0,0,0.8);
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.3rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition: background 120ms, transform 80ms;
        }
        .numpad-key:active {
          transform: scale(0.95);
          background: rgba(201,154,63,0.28);
        }
        .numpad-key--cancel {
          color: #CF3A2E;
          border-color: rgba(207,58,46,0.45);
          background: rgba(207,58,46,0.08);
        }
        .numpad-key--enter {
          color: #2E9E4F;
          border-color: rgba(46,158,79,0.5);
          background: rgba(46,158,79,0.10);
        }

        /* ── Wide numpad: search (numpad) + country stats side by side ── */
        .numpad--wide { width: min(92vw, 560px); }
        .numpad-body {
          display: grid;
          grid-template-columns: 258px 1fr;
          gap: 18px;
          align-items: stretch;
        }
        .numpad-search { min-width: 0; }
        .numpad-countries {
          display: flex;
          flex-direction: column;
          min-width: 0;
          border-left: 1px solid rgba(201,154,63,0.3);
          padding-left: 18px;
        }
        .numpad-countries-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.55);
          margin-bottom: 12px;
        }
        .numpad-countries-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          max-height: 300px;
        }
        .ncountry-row {
          display: grid;
          grid-template-columns: 26px 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 9px;
          background: rgba(255,255,255,0.34);
          border: 1px solid rgba(201,154,63,0.28);
        }
        .ncountry-flag { font-size: 1.15rem; line-height: 1; }
        .ncountry-code {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          color: rgba(0,0,0,0.8);
        }
        .ncountry-count {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: rgba(201,154,63,1);
          min-width: 1.4em;
          text-align: right;
        }
        /* Mobile: countries on TOP, numpad below (palec dosiahne numpad → ľahšie písanie) */
        @media (max-width: 520px) {
          .numpad--wide { width: min(88vw, 320px); }
          .numpad-body { grid-template-columns: 1fr; gap: 14px; }
          .numpad-countries {
            order: -1;
            border-left: none;
            padding-left: 0;
          }
          .numpad-countries-list { max-height: 264px; } /* ~5 krajín viditeľných */
          .numpad-search {
            border-top: 1px solid rgba(201,154,63,0.3);
            padding-top: 14px;
          }
        }

        /* ── Bottom bar: filter + center (+ flag on mobile), centered as a row ── */
        .gods-bottom-bar {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .center-btn-mobile {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          color: rgba(0,0,0,0.7);
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          padding: 0;
        }
        .center-btn-mobile:hover { opacity: 0.85; }

        /* Flag pill — bottom bar, mobile only (desktop keeps it in the top nav) */
        .lang-btn-mobile {
          display: none;
          align-items: center;
          justify-content: center;
          height: 40px;
          padding: 0 10px;
          border-radius: 999px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        }
        .lang-btn-mobile .lang-picker--flow .lang-trigger { color: rgba(0,0,0,0.72); padding: 0; }
        .lang-btn-mobile .lang-picker--flow .lang-trigger__chev { color: rgba(0,0,0,0.5); }

        @media (max-width: 768px) {
          .nav-left {
            left: 50%;
            transform: translateX(-50%);
          }

          /* LOGIN icon stays in the free top-right corner (menu is centered) */
          .nav-login { width: 36px; height: 36px; top: 10px; right: 12px; }
          .nav-login-icon { width: 16px; height: 16px; }

          /* Top nav: 3 names only (flag moves to the bottom bar), tighter so the
             longest labels (SK/CZ NÁBOŽENSTVO) never wrap. */
          .nav-lang-desktop { display: none; }
          .lang-btn-mobile { display: flex; }
          .main-nav { gap: 9px; padding: 6px 13px; }
          .main-nav a { font-size: 0.7rem; letter-spacing: 0.07em; }

          /* Mobil center hero: zmenšené logo + CTA, zvýraznený počet psov */
          .center-hero { gap: 13px; }
          .hero-logo-icon { width: 108px; height: 108px; } /* -10% */
          .join-btn {
            padding: 11px 28px;       /* -30% */
            font-size: 0.69rem;       /* -30% */
            letter-spacing: 0.12em;
          }
          /* počet psov: badge je globálny, mobil len zmenší (menší než CTA) */
          .hero-count {
            font-size: 0.92rem;
            padding: 5px 14px;
          }
          .hero-count-num { font-size: 1.05rem; }

          /* Hekthor open overlay: menšia karta → menší heroglyf + tesnejší text,
             aby sa dlhá osobná správa zmestila bez orezania. */
          .card-open-overlay { padding: 12px; gap: 6px; }
          .card-open-heroglyph { width: 34%; }
          .card-open-name { font-size: 0.82rem; }
          .card-open-msg { font-size: 0.62rem; line-height: 1.45; }
        }
        .hero-count-globe {
          width: 15px; height: 15px;
          color: #E2B45C;
          margin-right: 7px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 5px rgba(201,154,63,0.45));
        }

        /* ── Touch devices: skip hover preview → tap goes straight to info ── */
        @media (hover: none) {
          .dog-card:not(.is-open):hover {
            transform: none !important;
            box-shadow: none !important;
          }
          .dog-card:not(.is-open):hover::after { opacity: 0 !important; }
          .dog-card:not(.is-open):hover .card-rank-top,
          .dog-card:not(.is-open):hover .card-flag,
          .dog-card:not(.is-open):hover .card-name-block { opacity: 1 !important; }
          .dog-card:not(.is-open):hover .dog-heroglyph-wrap,
          .hektor-card:not(.is-open):hover .hektor-heroglyph-wrap { opacity: 0 !important; }
          .hektor-card:not(.is-open):hover { transform: none !important; }
        }

        @keyframes symbol-burn {
          0%   { opacity: 0;
                 filter: invert(1) brightness(0.2) blur(20px);
                 transform: scale(0.15); }
          12%  { opacity: 0.4;
                 filter: invert(1) brightness(0.6) blur(6px);
                 transform: scale(0.55); }
          28%  { opacity: 1;
                 filter: invert(1) brightness(4)
                   drop-shadow(0 0 50px #FFF)
                   drop-shadow(0 0 100px #FFD700)
                   drop-shadow(0 0 200px rgba(196,155,66,0.9));
                 transform: scale(1.25); }
          48%  { filter: invert(1) brightness(2.5)
                   drop-shadow(0 0 35px rgba(255,210,60,0.9))
                   drop-shadow(0 0 90px rgba(196,155,66,0.6));
                 transform: scale(0.9); }
          70%  { transform: scale(1.05); }
          85%  { transform: scale(0.98); }
          100% { opacity: 1;
                 filter: invert(1) brightness(1.4)
                   drop-shadow(0 0 25px rgba(196,155,66,0.8))
                   drop-shadow(0 0 70px rgba(196,155,66,0.4));
                 transform: scale(1); }
        }
      `}</style>

      <div className="gods-root">
        <div className="nav-left">
          <nav className="main-nav">
            <a href="/vision">{t('nav.vision')}</a>
            <span className="main-nav-sep" aria-hidden="true" />
            <a href="/religion">{t('nav.religion')}</a>
            <span className="main-nav-sep" aria-hidden="true" />
            <a href="/about">{t('nav.about')}</a>
            {/* Flag stays in the top pill on desktop; on mobile it moves to the
                bottom bar next to the center button (see .lang-btn-mobile). */}
            <span className="nav-lang-desktop"><LanguagePicker /></span>
          </nav>
        </div>
        {/* LOGIN — round house-with-heart (home = entry/belonging) icon button, top-right corner */}
        <a href="/login" className="nav-login" aria-label={t('nav.login')}>
          <img src="/icons/pack/house-heart.svg" alt="" className="nav-login-icon" draggable="false" />
        </a>

        <div className={`info-overlay ${infoOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setInfoOpen(false); }}>
          <button className="info-close" onClick={() => setInfoOpen(false)}>✕</button>
          <div className="info-content">
            <h2 dangerouslySetInnerHTML={{ __html: t('wall.info.title') }} />
            <p>{t('wall.info.body')}</p>
          </div>
        </div>

        <div className="gods-bottom-bar">
          <button
            className={`filter-btn${filterOpen ? ' active' : ''}`}
            onClick={() => setFilterOpen(f => !f)}
            aria-label={t('wall.filter.find')}
          >
            {/* Brand hand-drawn compass (vstupy/vizualna-identita/Icons hand drawn) */}
            <svg width="20" height="20" viewBox="0 0 473.514 473.514" fill="currentColor" aria-hidden>
              <path d="M115.494,425.082c37.303,19.865,77.041,29.935,118.109,29.935c0.005,0,0.005,0,0.01,0c68.776,0,133.881-28.406,183.32-79.983c76.129-79.414,75.342-203.429-1.793-282.333c-53.512-54.738-117.321-79.366-190.022-73.303c-1.341-0.31-2.689-0.462-4.253-0.462c-0.015,0-0.033,0-0.043,0C116.721,21.146,32.744,85.898,6.874,183.905C-18.105,278.561,26.556,377.729,115.494,425.082z M35.369,221.891c6.236-90.779,80.1-161.264,175.807-167.934c2.471,0.731,4.957,0.944,7.64,0.581c8.886-1.226,18.032-1.846,27.178-1.846c62.87,0,123.15,28.625,157.315,74.712c21.602,29.137,42.822,78.813,21.216,149.953c-26.146,86.046-102.307,141.65-194.024,141.65c-11.035,0-22.209-0.854-33.218-2.539C96.779,401.087,28.689,319.256,35.369,221.891z"/>
              <path d="M159.096,289.154c0.66,8.801,7.211,13.573,13.716,14.574c54.936,25.842,115.917,31.899,168.81,35.546c0.391,0.03,0.776,0.046,1.147,0.046c1.549,0,3.052-0.219,4.484-0.655c7.891-1.158,12.862-7.435,12.141-15.438c-4.29-47.591-18.732-96.474-46.839-158.488c-1.401-3.088-3.55-5.469-6.235-6.927c-1.529-1.186-3.291-2.079-5.241-2.666c-16.544-4.986-33.896-9.127-50.668-13.126c-35.192-8.386-71.586-17.064-103.037-34.167c-2.412-1.31-4.933-1.975-7.482-1.975c-6.484,0-12.509,4.55-14.771,11.105c-1.478,3.272-1.597,6.937-0.348,10.623C143.958,184.362,155.184,237.207,159.096,289.154z M257.835,222.661c4.92,9.214,2.224,20.151-6.566,26.611c-7.932,5.829-18.753,5.017-24.902-2.036c-6.289-7.217-4.682-16.875,0.224-23.11c0.701-0.587,1.335-1.257,1.901-2.006c3.821-5.045,10.115-8.305,16.034-8.305C250.228,213.815,254.707,216.791,257.835,222.661z M219.168,272.508c6.033,3.352,12.944,5.189,20.249,5.189c4.25,0,8.485-0.63,12.588-1.879c20.495-6.256,33.957-25.029,33.5-46.722c-0.122-5.606-1.382-10.892-3.54-15.688c4.672-3.618,9.009-7.254,13.102-10.946c15.559,37.505,25.766,71.915,30.94,104.428c-40.197-3.204-81.918-8.606-120.519-23.12C210.059,279.648,214.593,275.916,219.168,272.508z M258.526,192.106c-3.981-1.363-8.237-2.158-12.69-2.206h-0.645c-13.855,0-25.319,5.055-34.096,15.028c-0.267,0.233-0.526,0.479-0.777,0.739c-11.23,11.715-14.871,27.835-10.445,42.488c-4.395,3.32-8.638,6.759-12.718,10.298c-4.426-35.563-11.972-71.823-22.584-108.202c24.387,9.564,50.648,15.678,76.152,21.612c10.831,2.521,21.896,5.111,32.753,7.95C268.636,184.187,263.674,188.356,258.526,192.106z"/>
            </svg>
          </button>

          <button className="center-btn-mobile" id="gods-center-btn-mobile" aria-label={t('wall.filter.center')}>
            {/* Brand hand-drawn target circle (vstupy/vizualna-identita/Icons hand drawn) */}
            <svg width="22" height="22" viewBox="0 0 503.168 503.168" fill="currentColor" aria-hidden>
              <path d="M486.353,226.804l-1.005,0.028c-10.126,0.516-20.257,0.93-30.393,1.3c-17.452-96.405-92.647-167.758-189.113-178.526c-0.097-0.01-0.193-0.02-0.29-0.028c-0.467-0.19-0.949-0.358-1.432-0.513l0.01-8.94c0-9.945-7.637-17.445-17.77-17.445c-10.13,0-17.773,7.5-17.773,17.445l-0.005,7.655C141.307,55.341,63.091,134.46,46.196,203.592c-3.639,14.884-5.721,30.097-6.213,45.339c-7.993-0.287-15.1-0.714-21.935-1.305c-10.143-0.869-17.605,6.142-18.032,16.043c-0.374,8.694,5.345,18.464,16.686,19.449c7.8,0.681,15.907,1.138,25.111,1.417c7.825,54.512,37.968,100.208,85.421,129.198c30.722,18.769,70.569,29.407,112.67,30.153c0.787,6.754,1.617,13.508,2.46,20.271c1.343,10.72,10.544,16.33,18.946,16.33c5.088,0,9.754-1.99,12.816-5.463c2.976-3.362,4.275-7.912,3.661-12.808c-0.838-6.672-1.65-13.34-2.433-20.007c90.805-10.217,184.844-67.578,183.539-172.804c-0.021-1.889-0.071-3.823-0.152-5.859c9.13-0.351,18.265-0.731,27.396-1.188c9.963-0.508,17.28-8.572,17.021-18.758C502.912,233.873,495.849,226.804,486.353,226.804z M271.818,407.133c-1.899-23.304-2.356-43.041-1.457-61.586c0.233-4.829-1.336-9.283-4.434-12.533c-3.194-3.351-7.876-5.271-12.84-5.271c-8.658,0-17.704,5.854-18.25,17.047c-0.942,19.316-0.465,39.816,1.508,63.941c-89.21-3.153-143.064-57.314-157.121-111.009c-1.086-4.145-1.906-8.547-2.452-13.152c29.195-0.858,60.915-3.859,98.962-9.338c8.798-1.27,14.508-8.283,13.878-17.053c-0.68-9.49-8.952-19.39-21.406-17.625c-34.111,4.913-63.126,7.642-90.446,8.485c12.053-75.373,81.07-152.914,149.349-165.71c0.459-0.084,0.921-0.165,1.394-0.239c-0.14,32.763-0.502,58.564-1.165,82.746c-0.13,4.804,1.518,9.219,4.649,12.431c3.229,3.319,7.909,5.223,12.85,5.223c10.016,0,17.77-7.406,18.044-17.227c0.65-23.895,1.011-49.284,1.158-81.321c0.021,0,0.046,0.005,0.065,0.005c79.074,8.828,144.276,68.878,158.199,144.321c-25.252,0.868-51.165,1.861-76.799,3.806c-11.35,0.858-17.118,10.552-16.793,19.24c0.376,9.958,7.79,17.032,17.966,16.266c25.989-1.966,52.491-2.961,78.297-3.845c-0.381,12.563-2.127,25.126-5.209,37.445C404.206,364.376,335.572,399.166,271.818,407.133z"/>
            </svg>
          </button>

          {/* Mobile-only: language flag pill, next to the center button */}
          <div className="lang-btn-mobile"><LanguagePicker variant="flow" /></div>
        </div>

        <div
          className={`numpad-overlay${filterOpen ? ' open' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) { setFilterOpen(false); setFilterValue(''); } }}
        >
          <div className="numpad numpad--wide" role="dialog" aria-label={t('wall.filter.find')}>
            <div className="numpad-body">
              <div className="numpad-search">
                <div className="numpad-display">
                  {filterValue ? `#${filterValue}` : <span className="ph">{t('wall.filter.placeholder')}</span>}
                </div>
                <div className="numpad-grid">
                  {['1','2','3','4','5','6','7','8','9'].map(d => (
                    <button
                      key={d}
                      className="numpad-key"
                      onClick={() => setFilterValue(v => (v + d).slice(0, 6))}
                    >{d}</button>
                  ))}
                  <button
                    className="numpad-key numpad-key--cancel"
                    onClick={() => setFilterValue('')}
                    aria-label={t('wall.filter.clear')}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 5 H14.5 L20.5 12 L14.5 19 H7 A2 2 0 0 1 5 17 V7 A2 2 0 0 1 7 5 Z"/>
                      <path d="M8.4 9.4 L12.6 14.6 M12.6 9.4 L8.4 14.6"/>
                    </svg>
                  </button>
                  <button
                    className="numpad-key"
                    onClick={() => setFilterValue(v => (v + '0').slice(0, 6))}
                  >0</button>
                  <button
                    className="numpad-key numpad-key--enter"
                    onClick={submitFilter}
                    aria-label={t('wall.filter.confirm')}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M8 12.5 L11 15.5 L16.5 9"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="numpad-countries">
                <div className="numpad-countries-title">{t('wall.filter.countries')}</div>
                <div className="numpad-countries-list">
                  {countryStats.map(c => (
                    <div className="ncountry-row" key={c.iso2}>
                      <span className="ncountry-flag">{countryFlag(c.iso2)}</span>
                      <span className="ncountry-code">{c.iso3}</span>
                      <span className="ncountry-count">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={appRef} role="application" style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
          <div ref={canvasRef} id="gods-canvas" />
        </div>

        {revealData.active && revealStep > 0 && revealStep < 4 && (
          <div className={`rev-overlay step-${revealStep}`}>
            <div className="rev-spotlight" />
            <img className="rev-big-symbol" src={revealSymbol} alt={revealData.dogName} />
          </div>
        )}

        {showWhatNext && (
          <div className="wn-root">
            <div className="wn-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowWhatNext(false); }}>
              <div className="wn-card" role="dialog" aria-label={t('whatNext.title')}>
                <button className="wn-close" aria-label={t('whatNext.close')} onClick={() => setShowWhatNext(false)}>&times;</button>
                <div className="wn-stamp">{t('whatNext.stamp')}</div>

                <div className="wn-main">
                  <div className="wn-head-row">
                    <h1>{t('whatNext.title')}</h1>
                    <span className="wn-counter"><span className="wn-cur">1</span>/5</span>
                  </div>
                  <div className="wn-divider" />

                  <div className="wn-slider">
                    <button className="wn-arrow wn-prev" aria-label={t('whatNext.prev')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button className="wn-arrow wn-next" aria-label={t('whatNext.next')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>

                    <div className="wn-track">
                      <div className="wn-slide wn-in">
                        <span className="wn-ic wn-ic-paw" />
                        <h2>{t('whatNext.s1.title')}</h2>
                        <p className="wn-ital">{t('whatNext.s1.hook')}</p>
                        <p className="wn-lead" dangerouslySetInnerHTML={{ __html: t('whatNext.s1.body') }} />
                      </div>
                      <div className="wn-slide">
                        <span className="wn-ic wn-ic-sphinx" />
                        <h2>{t('whatNext.s2.title')}</h2>
                        <p className="wn-ital">{t('whatNext.s2.hook')}</p>
                        <p className="wn-lead" dangerouslySetInnerHTML={{ __html: t('whatNext.s2.body') }} />
                      </div>
                      <div className="wn-slide">
                        <span className="wn-ic wn-ic-people" />
                        <h2>{t('whatNext.s3.title')}</h2>
                        <p className="wn-ital">{t('whatNext.s3.hook')}</p>
                        <p className="wn-lead" dangerouslySetInnerHTML={{ __html: t('whatNext.s3.body') }} />
                      </div>
                      <div className="wn-slide">
                        <span className="wn-ic wn-ic-chat" />
                        <h2>{t('whatNext.s4.title')}</h2>
                        <p className="wn-ital">{t('whatNext.s4.hook')}</p>
                        <p className="wn-lead" dangerouslySetInnerHTML={{ __html: t('whatNext.s4.body') }} />
                      </div>
                      <div className="wn-slide wn-slide-share">
                        <h2>{t('sharecard.shareTitle', { name: revealData.dogName })}</h2>
                        {revealShareCardUrl ? (
                          <>
                            <img className="wn-share-preview" src={revealShareCardUrl} alt={t('sharecard.shareTitle', { name: revealData.dogName })} />
                            <div className="wn-share-actions">
                              <button
                                type="button"
                                className="wn-cta wn-cta-share"
                                onClick={handleWnShare}
                                disabled={shareBusy !== null}
                              >
                                <BrandIcon name="link" size={13} tint="dark" />
                                {t('sharecard.shareButton')}
                              </button>
                              <button
                                type="button"
                                className="wn-cta wn-cta-outline"
                                onClick={handleWnDownload}
                                disabled={shareBusy !== null}
                              >
                                <BrandIcon name="document" size={13} tint="gold" />
                                {t('sharecard.download')}
                              </button>
                            </div>
                            <div className="wn-share-links">
                              <button
                                type="button"
                                className="wn-share-link-btn"
                                onClick={handleWnFacebook}
                                aria-label={t('sharecard.facebook')}
                                title={t('sharecard.facebook')}
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                                  <path d="M13.5 21v-8.2h2.75l.41-3.2h-3.16V7.6c0-.93.26-1.56 1.59-1.56h1.7V3.18C15.98 3.12 15.06 3 13.98 3c-2.24 0-3.78 1.37-3.78 3.88v2.72H7.44v3.2h2.76V21h3.3z"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="wn-share-link-btn"
                                onClick={handleWnWhatsapp}
                                aria-label={t('sharecard.whatsapp')}
                                title={t('sharecard.whatsapp')}
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                                  <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/>
                                  <path d="M12.02 2C6.5 2 2.04 6.46 2.04 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.94 9.94 0 0 0 12.02 22C17.53 22 22 17.54 22 12S17.53 2 12.02 2zm0 18.1c-1.63 0-3.15-.45-4.45-1.23l-.32-.19-3.02.79.8-2.94-.21-.3A8.09 8.09 0 0 1 3.93 12c0-4.47 3.63-8.1 8.09-8.1 4.46 0 8.08 3.63 8.08 8.1 0 4.47-3.62 8.1-8.08 8.1z"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="wn-share-link-btn"
                                onClick={handleWnCopyLink}
                                aria-label={t('sharecard.copyLink')}
                                title={t('sharecard.copyLink')}
                              >
                                <BrandIcon name="link" size={14} tint="gold" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="wn-lead wn-share-preparing">{t('sharecard.preparing')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wn-footer">
                  <img className="wn-seal" src="/images/peciat-dogypt.png" alt="DOGYPT seal" />
                  <span className="wn-motto-side">{t('whatNext.motto')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
