/**
 * MOTOR FILMU — JEDEN ŤAH = JEDNA OBRAZOVKA (Matej 27. 9. 2026).
 *
 * Matej: *„každá stránka bude jedna obrazovka jedno posolstvo a každý scrol
 * urobí plynulý snip na ďalšiu stránku, žiadne seknutie v medzipriestore"* +
 * *„úvodný scrol sa nesmie zaseknúť ani byť ovládaný vôľou — ako náhle je
 * zaznamenaný scrol z úvodu, stránka sama urobí plynulý scrol"*.
 *
 * 🔑 CHOREOGRAFIA SA NEPREPISUJE. Film je dráha scrollu a všetky jeho
 * prechody (guľa sa vzdiali, krava a pes vyjdú, príbeh…) sú viazané na
 * `scrollY`. Motor len prevezme volant: ťah kolieskom / prstom / klávesou
 * nezmení polohu o pár pixelov, ale spustí ANIMOVANÝ scroll na ďalšiu
 * zastávku. Choreografia medzitým beží sama, lebo `scrollY` sa hýbe.
 *
 * 🔴 CSS scroll-snap sa s tým BIJE — preto ho film pri zapnutom motore
 * nemá (viď `.op-root` v OnePage.tsx). Zapísané ako zmena locku 28. 8.
 * (proximity) v `plany/locky/onepage-nav.md`.
 *
 * ⚠️ ZOTRVAČNOSŤ TRACKPADU. Mac posiela po švihu ešte ~1,5 s udalostí
 * s klesajúcou deltou. Keby každá spúšťala skok, jeden švih by prebehol
 * tri obrazovky. Nový ťah sa preto uzná len keď: je po tichu (> QUIET ms
 * bez udalosti), alebo delta ZRÝCHĽUJE (zotrvačnosť vždy len spomaľuje).
 */
import { useEffect, useRef } from 'react';

const QUIET = 170;          // ms bez udalosti = predošlý ťah skončil
const GESTURE_PX = 24;      // súčet delty, od ktorého je to ťah (nie šum)
const TOUCH_MIN = 36;       // px swipu, ktorý sa počíta ako ťah
/** VOĽNÉ PÁSMO JE PRIBRZDENÉ (Matej 27. 9. 2026: *„keď človek potiahne viac,
 *  preletí celý príbeh = treba scroll spomaliť"*). Koliesko/trackpad sa v ňom
 *  neposúva natívne, ale o podiel delty so stropom na udalosť. Dotyk na mobile
 *  ostáva natívny — prst bez zotrvačnosti by pôsobil ako zaseknutý. */
const FREE_GAIN = 0.35;
const FREE_MAX = 36;        // px na jednu udalosť kolieska
/** ⚠️ 28. 9. 2026 OnePage `upStops` už nedáva — hore ide o jednu zastávku späť
 *  (Matej: *„scroll dozadu je moc agresívny"*). Pôvodný zápis:
 *  🔴 HORE PO SEKCIÁCH (Matej 27. 9. 2026). Prvý pokus bol „hore bez pravidiel"
 *  (natívny scroll + švih = skok na úvod) a Matej ho vrátil: *„odstráň ten
 *  agresívny scroll naspäť… nie scroll po scrole, ale plynulo po sekciách —
 *  teraz ma to vždy hodí veľmi rýchlo preč"*. Ťah hore teda znova vedie motor,
 *  ale cieľ berie z `upStops` (začiatky obrazov), nie zo všetkých zastávok. */

export type FilmStopsApi = {
  /** Zoradené polohy zastávok v px. Volá sa pri každom ťahu (výšky sa menia). */
  stops: () => number[];
  /** Motor mlčí (otvorené prekrytie, stena, menu…). */
  paused: () => boolean;
  /** VOĽNÉ PÁSMO [od, do] v px — tam si človek scrolluje sám (príbeh na
   *  čiernej, Matej 27. 9.: *„tejto sekcie sa ten motor netýka"*). Motor sa
   *  ozve až na jeho okraji a v smere von. */
  free?: () => [number, number] | null;
  /** Dĺžka jazdy v ms podľa vzdialenosti v obrazovkách. */
  duration?: (screens: number, from: number, to: number) => number;
  /** Vlastný priebeh jazdy (0–1 → 0–1); bez neho mäkký rozjazd aj dojazd. */
  easing?: (from: number, to: number) => ((t: number) => number) | undefined;
  /** Zastávky pre ťah HORE (začiatky sekcií); bez nich platia `stops`. */
  upStops?: () => number[];
  /** Hlási, či práve ide jazda (šípky dole ju skrývajú). */
  onMove?: (moving: boolean) => void;
  /** Volá sa v KAŽDOM snímku jazdy hneď po scrollTo — v tom istom snímku.
   *  🔴 TRASENIE NA TELEFÓNE (Matej 5. 10. 2026: *„trasie sa obsah aj na 3 slajde"*,
   *  slajd 2 pri 1→2 a 3→2). Film sa prepočítaval z udalosti scroll cez vlastný
   *  requestAnimationFrame, teda o snímok neskôr než posun — prilepené vrstvy
   *  sedeli na novej polohe, ich obsah (transform/opacity z JS) ešte na starej.
   *  V Chrome sa to zhodou poradia zlepí, v Safari obsah kmitá. */
  onStep?: () => void;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const defaultDuration = (screens: number) =>
  Math.round(Math.min(2800, Math.max(850, 650 + 420 * screens)));

export function useFilmStops(api: FilmStopsApi, enabled: boolean) {
  const apiRef = useRef(api);
  apiRef.current = api;
  const goRef = useRef<(dir: 1 | -1) => void>(() => {});
  const stepRef = useRef<(dir: 1 | -1) => void>(() => {});

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let moving = false;
    let lastWheel = 0;
    let lastAbs = 0;
    let touchY: number | null = null;
    /** Súčet delty aktuálneho ťahu a či už ťah spustil jazdu. */
    let gAcc = 0;
    let gFired = false;
    /** Ťah, ktorý prišiel počas jazdy — vykoná sa hneď po nej. */
    let queued: 1 | -1 | 0 = 0;
    let rideK = 0;
    /** Prst práve (alebo ešte dobiehajúcim švihom) hýbe voľným pásmom natívne. */
    let nativeFree = false;

    const setMoving = (m: boolean) => {
      moving = m;
      apiRef.current.onMove?.(m);
    };

    const target = (dir: 1 | -1): number | null => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const src = dir < 0 && apiRef.current.upStops ? apiRef.current.upStops() : apiRef.current.stops();
      const list = src
        .map((s) => Math.max(0, Math.min(max, Math.round(s))))
        .sort((a, b) => a - b);
      if (dir > 0) return list.find((s) => s > y + 4) ?? null;
      for (let i = list.length - 1; i >= 0; i--) if (list[i] < y - 4) return list[i];
      return null;
    };

    const ride = (to: number) => {
      const from = window.scrollY;
      const screens = Math.abs(to - from) / Math.max(1, window.innerHeight);
      const dur = (apiRef.current.duration ?? defaultDuration)(screens, from, to);
      const ez = apiRef.current.easing?.(from, to) ?? ease;
      const t0 = performance.now();
      setMoving(true);
      queued = 0;
      nativeFree = false;
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        rideK = k;
        // 'instant' — html má v index.css scroll-behavior: smooth, ktorý by
        // každý snímok rozbehol na vlastnú animáciu.
        window.scrollTo({ top: from + (to - from) * ez(k), behavior: 'instant' as ScrollBehavior });
        apiRef.current.onStep?.();
        if (k < 1) raf = requestAnimationFrame(step);
        else {
          raf = 0; setMoving(false);
          if (queued) { const d = queued; queued = 0; go(d); }
        }
      };
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    };

    const go = (dir: 1 | -1) => {
      if (moving) return;
      const to = target(dir);
      if (to != null) ride(to);
    };
    goRef.current = go;
    /** Klik na šípky: vo voľnom pásme sa ide po KÚSKOCH (0,8 obrazovky),
     *  nie na jeho koniec — Matej 27. 9.: *„ak človek klikne na šípku, nech sa
     *  mu to nepreskroluje až dolu"*. */
    stepRef.current = (dir: 1 | -1) => {
      if (moving) return;
      const z = apiRef.current.free?.();
      if (z && inFree(dir)) {
        const y = window.scrollY + dir * window.innerHeight * 0.8;
        ride(Math.max(z[0], Math.min(z[1], y)));
        return;
      }
      go(dir);
    };

    /** Je poloha vo voľnom pásme a ťah smeruje DOVNÚTRA neho? */
    const inFree = (dir: 1 | -1): boolean => {
      const z = apiRef.current.free?.();
      if (!z) return false;
      const y = window.scrollY;
      if (y < z[0] - 2 || y > z[1] + 2) return false;
      if (dir > 0 && y >= z[1] - 2) return false;   // dno pásma, ťah von
      if (dir < 0 && y <= z[0] + 2) return false;   // strop pásma, ťah von
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (apiRef.current.paused() || e.ctrlKey) return;
      if ((e.target as Element | null)?.closest?.('[data-film-free]')) return;
      if (!moving && inFree(e.deltaY > 0 ? 1 : -1)) {
        lastWheel = performance.now(); lastAbs = Math.abs(e.deltaY);
        const z = apiRef.current.free?.();
        if (!z) return;
        e.preventDefault();
        const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
        const d = Math.max(-FREE_MAX, Math.min(FREE_MAX, px * FREE_GAIN));
        // Z pásma sa brzdeným scrollom nevypadne — na okraji prevezme motor.
        const y = Math.max(z[0], Math.min(z[1], window.scrollY + d));
        window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
        return;
      }
      e.preventDefault();
      // 🔴 27. 9. 2026 — Matej: *„niekde to nezachytáva a musím sa viac snažiť"*.
      // Pôvodne rozhodovala PRVÁ udalosť ťahu; trackpad však začína malými
      // krokmi (2 → 5 → 9 px) a keď bola prvá pod šumom, celý ťah prepadol.
      // Teraz sa ťah SČÍTAVA a spustí jazdu, keď prekročí GESTURE_PX.
      // Nový ťah = ticho > QUIET, alebo zrýchlenie uprostred dobehu zotrvačnosti
      // (zotrvačnosť len spomaľuje, prst zrýchľuje).
      const abs = Math.abs(e.deltaY);
      const now = performance.now();
      const quiet = now - lastWheel > QUIET;
      const accel = gFired && abs > lastAbs * 1.25 + 8;
      if (quiet || accel) { gAcc = 0; gFired = false; }
      lastWheel = now;
      lastAbs = abs;
      gAcc += abs;
      if (gFired || gAcc < GESTURE_PX) return;
      gFired = true;
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      // Ťah počas jazdy sa nezahodí: v druhej polovici jazdy sa zapamätá
      // a vykoná hneď po dojazde (skorší by bol dvojitý švih omylom).
      if (moving) { if (rideK > 0.45) queued = dir; return; }
      go(dir);
    };

    const onTouchStart = (e: TouchEvent) => {
      nativeFree = false;
      if (apiRef.current.paused()) { touchY = null; return; }
      if ((e.target as Element | null)?.closest?.('[data-film-free]')) { touchY = null; return; }
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY == null) return;
      const dy = touchY - (e.touches[0]?.clientY ?? touchY);
      if (!moving && Math.abs(dy) > 2 && inFree(dy > 0 ? 1 : -1)) { touchY = null; nativeFree = true; return; }
      e.preventDefault();
    };
    /** 🔴 DOTYKOVÝ ŠVIH Z VOĽNÉHO PÁSMA NESMIE ODLETIEŤ POD OKRAJ (N6, 2. 10.
     *  2026). Dotyk je vo voľnom pásme natívny, takže zotrvačnosť švihu nič
     *  nebrzdí — na 430 px raz švih späť z príbehu preletel pásmo aj všetky
     *  obrazy nad ním a pristál na úvode. Koliesko to rieši clampom v onWheel;
     *  tu to isté robí scroll: keď natívny pohyb z pásma vybehne von, vráti sa
     *  na jeho okraj (programový scrollTo zastaví aj dobeh zotrvačnosti) a ďalší
     *  ťah už vedie motor o jednu zastávku. */
    const onScroll = () => {
      if (!nativeFree || moving) return;
      const z = apiRef.current.free?.();
      if (!z) { nativeFree = false; return; }
      const y = window.scrollY;
      if (y < z[0] - 2) stopAt(z[0]);
      else if (y > z[1] + 2) stopAt(z[1]);
    };
    /** Sám scrollTo dobeh zotrvačnosti nezastaví (švih pokračuje z novej
     *  polohy), preto sa na dva snímky zamkne scroll koreňa. */
    let locked = false;
    const stopAt = (top: number) => {
      const el = document.documentElement;
      window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
      if (locked) return;
      locked = true;
      const prev = el.style.overflow;
      el.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.overflow = prev; locked = false; }));
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY == null) return;
      const endY = e.changedTouches[0]?.clientY ?? touchY;
      const dy = touchY - endY;
      touchY = null;
      if (Math.abs(dy) >= TOUCH_MIN) go(dy > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (apiRef.current.paused()) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const down = ['ArrowDown', 'PageDown', ' '].includes(e.key) && !(e.key === ' ' && e.shiftKey);
      const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
      if (!down && !up) return;
      if (!moving && inFree(down ? 1 : -1)) return;
      e.preventDefault();
      go(down ? 1 : -1);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      goRef.current = () => {};
      stepRef.current = () => {};
    };
  }, [enabled]);

  /** Pre šípky dole — klik = ďalšia obrazovka (vo voľnom pásme kúsok). */
  return (dir: 1 | -1) => stepRef.current(dir);
}
