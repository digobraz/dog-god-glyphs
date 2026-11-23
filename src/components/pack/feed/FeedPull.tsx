// OBNOVA FEEDU ŤAHOM NADOL (23. 11. 2026). Matej: *„potiahnutie smerom hore — ako je na ig, že sa znovu načíta
// feed a urobí aj haptika“*. Navrchu stránky potiahneš prstom nadol, za hranicou telefón raz ťukne, po pustení
// sa feed načíta znova (`refreshFeed()` spustí všetky zdroje naraz).
//
// ⚠️ Gesto je vlastné: `html { overscroll-behavior: none }` vypína pruženie iOS, takže prehliadač sám nič neurobí.
// ⚠️ Značka je ZATIAĽ krúžok — Matej chce čuchajúci nos, animácia sa vyberie zvlášť (vymeň len `PullMark`).
import { useEffect, useRef, useState, type RefObject } from 'react';
import { PACK_THEME, PACK_SPACE } from '@/components/pack/packTheme';
import { haptika } from '@/lib/momenty/haptika';

const T = PACK_THEME;
const S = PACK_SPACE;
/** Ťah prstom sa tlmí na polovicu · hranica obnovy · strop · výška, v ktorej obsah počká na načítanie. */
const DAMP = 0.5;
const TRIGGER = 72;
const MAX = 120;
const HOLD = 56;
/** Načítanie trvá aspoň toľko, aby značka neblikla. */
const MIN_MS = 600;

export const FEED_PULL_CSS = `
.pkf{position:relative;}
.pkf-col.pull-anim{transition:transform .28s cubic-bezier(.2,.8,.2,1);}
.pkf-pull{position:absolute;left:50%;top:0;width:${S.xxl}px;height:${S.xxl}px;margin-left:-${S.lg}px;pointer-events:none;opacity:0;}
.pkf-pull.pull-anim{transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .2s ease;}
.pkf-pull svg{display:block;width:100%;height:100%;}
.pkf-pull.busy svg{animation:pkf-pull-spin .9s linear infinite;}
@keyframes pkf-pull-spin{to{transform:rotate(360deg);}}
@media (prefers-reduced-motion:reduce){.pkf-pull.busy svg{animation-duration:2.4s;}}
`;

/** Dočasná značka: krúžok sa pri ťahu dokresľuje, pri načítaní sa točí. */
function PullMark({ progress }: { progress: number }) {
  const C = 2 * Math.PI * 12;
  return (
    <svg viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="12" fill="none" stroke={T.hairline} strokeWidth="3" />
      <circle cx="16" cy="16" r="12" fill="none" stroke={T.inkWarm} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={`${C * Math.max(0.08, Math.min(1, progress)) * 0.85} ${C}`} transform="rotate(-90 16 16)" />
    </svg>
  );
}

/**
 * Pripojí gesto k `.pkf-col` (obsah, ktorý sa posúva) a vykreslí značku. `off` = gesto nežije (hľadanie, otvorené okno).
 * Ťah sa ráta len keď okno stojí úplne hore a prst ide prevažne zvisle — vodorovný pás výletov a fotky ho nespustia.
 */
export function FeedPull({ colRef, off, onRefresh }: { colRef: RefObject<HTMLDivElement>; off: boolean; onRefresh: () => Promise<void> }) {
  const markRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const offRef = useRef(off);
  offRef.current = off;
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  useEffect(() => {
    const col = colRef.current;
    if (!col) return;
    let startX = 0, startY = 0;
    let state: 'idle' | 'maybe' | 'pull' = 'idle';
    let armed = false;

    const paint = (d: number, anim: boolean) => {
      const mark = markRef.current;
      col.classList.toggle('pull-anim', anim);
      mark?.classList.toggle('pull-anim', anim);
      col.style.transform = d ? `translateY(${d}px)` : '';
      if (mark) {
        mark.style.transform = `translateY(${Math.max(0, d - 40)}px)`;
        mark.style.opacity = String(Math.min(1, d / (TRIGGER * 0.6)));
      }
    };

    const onStart = (e: TouchEvent) => {
      if (offRef.current || busyRef.current || e.touches.length !== 1 || window.scrollY > 0) { state = 'idle'; return; }
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; armed = false;
      state = 'maybe';
    };
    const onMove = (e: TouchEvent) => {
      if (state === 'idle') return;
      const dx = e.touches[0].clientX - startX, dy = e.touches[0].clientY - startY;
      if (state === 'maybe') {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (dy <= 0 || Math.abs(dx) > Math.abs(dy) || window.scrollY > 0) { state = 'idle'; return; }
        state = 'pull';
      }
      if (e.cancelable) e.preventDefault();
      const dist = Math.min(MAX, Math.max(0, dy * DAMP));
      // Ťuk raz pri prekročení hranice; keď prst cúvne pod ňu a znova ju prejde, ťukne znova (ako IG).
      if (!armed && dist >= TRIGGER) { armed = true; haptika('tuk'); }
      else if (armed && dist < TRIGGER) armed = false;
      setProgress(dist / TRIGGER);
      paint(dist, false);
    };
    const onEnd = () => {
      if (state !== 'pull') { state = 'idle'; return; }
      state = 'idle';
      if (!armed) { paint(0, true); setProgress(0); return; }
      busyRef.current = true; setBusy(true);
      paint(HOLD, true);
      const t0 = Date.now();
      void refreshRef.current().catch(() => {})
        .then(() => new Promise((r) => setTimeout(r, Math.max(0, MIN_MS - (Date.now() - t0)))))
        .then(() => { busyRef.current = false; setBusy(false); setProgress(0); paint(0, true); });
    };

    col.addEventListener('touchstart', onStart, { passive: true });
    col.addEventListener('touchmove', onMove, { passive: false });
    col.addEventListener('touchend', onEnd);
    col.addEventListener('touchcancel', onEnd);
    return () => {
      col.removeEventListener('touchstart', onStart);
      col.removeEventListener('touchmove', onMove);
      col.removeEventListener('touchend', onEnd);
      col.removeEventListener('touchcancel', onEnd);
      col.style.transform = '';
    };
  }, [colRef]);

  return (
    <div ref={markRef} className={`pkf-pull${busy ? ' busy' : ''}`} aria-hidden={!busy} role={busy ? 'status' : undefined}>
      <PullMark progress={busy ? 1 : progress} />
    </div>
  );
}
