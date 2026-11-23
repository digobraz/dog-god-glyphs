// OBNOVA FEEDU ŤAHOM NADOL (23. 11. 2026). Matej: *„potiahnutie smerom hore — ako je na ig, že sa znovu načíta
// feed a urobí aj haptika“*. Navrchu stránky potiahneš prstom nadol, za hranicou telefón raz ťukne, po pustení
// sa feed načíta znova (`refreshFeed()` spustí všetky zdroje naraz).
//
// ⚠️ Gesto je vlastné: `html { overscroll-behavior: none }` vypína pruženie iOS, takže prehliadač sám nič neurobí.
// 👃 ZNAČKA = ČUCHAJÚCI NOS (Matej 23. 11.: *„ikonku by som si predstavoval skôr čuchanie nosom“*). Z piatich verzií vybral
//    ČIERNY NOS (samolepka `plany/ikonky/varianty/app-pridaj-sniffer/k31-a.webp`) s pokynom *„trochu ho zlepši nech je lepšie
//    čitateľný a tie výpary daj ako pri prvom — nie nad nosom, ale pod nosom žlté vlnky“*. Úprava v `/icons/sniffer/nos-cierny.webp`:
//    vlnky nad nosom odrezané, nozdry takmer čierne (pôvodne svetlejšie než telo), telo o stupeň svetlejšie, orez natesno.
//    Ťah: nos rastie a dvíha sa · hranica: jedno čuchnutie s haptikou · načítanie: dve rýchle čuchnutia a pauza,
//    zospodu do nozdier stúpajú tri žlté vlnky (farba a obrys z tej istej samolepky).
import { useEffect, useRef, useState, type RefObject } from 'react';
import { PACK_SPACE } from '@/components/pack/packTheme';
import { haptika } from '@/lib/momenty/haptika';

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
.pkf-pull{position:absolute;left:50%;top:0;width:${S.xxxl}px;height:${S.xxl}px;margin-left:-${S.xl}px;pointer-events:none;opacity:0;}
.pkf-pull.pull-anim{transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .2s ease;}
.pkf-nose{position:absolute;inset:0;background:url(/icons/sniffer/nos-cierny.webp) center/contain no-repeat;transform-origin:50% 70%;transition:transform .12s ease-out;}
.pkf-pull.hit .pkf-nose{animation:pkf-sniff1 .32s ease-in-out;}
.pkf-pull.busy .pkf-nose{animation:pkf-sniff 1.1s ease-in-out infinite;}
.pkf-wisp{position:absolute;top:100%;left:50%;width:8px;height:14px;margin-left:-4px;opacity:0;}
.pkf-wisp svg{display:block;width:100%;height:100%;}
.pkf-pull.busy .pkf-wisp{animation:pkf-wisp 1.1s ease-in infinite;animation-delay:var(--d);}
/* Čuchnutie = nos sa krátko stlačí a nadýchne (nozdry ťahajú vzduch), dvakrát rýchlo za sebou, potom pauza. */
@keyframes pkf-sniff{0%,44%,100%{transform:none;}11%,33%{transform:scale(1.1,.9);}22%{transform:scale(.97,1.04);}}
@keyframes pkf-sniff1{0%,100%{transform:none;}45%{transform:scale(1.12,.88);}}
/* Vonný prúžok vystúpi spod nosa do nozdier a zmizne. */
@keyframes pkf-wisp{0%{opacity:0;transform:translate(var(--x),10px) scale(1);}35%{opacity:1;}
  100%{opacity:0;transform:translate(calc(var(--x) * .6),-12px) scale(.6);}}
@media (prefers-reduced-motion:reduce){
  .pkf-pull.busy .pkf-nose{animation-duration:2.4s;}
  .pkf-pull.busy .pkf-wisp{display:none;}
}
`;

const WISPS = [{ x: -12, d: '0s' }, { x: 0, d: '.18s' }, { x: 12, d: '.36s' }];
/** Žltá a obrys vlniek = farby zo samolepky čierneho nosa (vymerané z `k31-a.webp`). */
const WISP_FILL = '#F8B810';
const WISP_EDGE = '#0A0912';

/** Čuchajúci nos. `progress` (0–1) = ako ďaleko je ťah k hranici: nos rastie a dvíha sa. */
function PullMark({ progress, busy }: { progress: number; busy: boolean }) {
  const p = busy ? 1 : Math.max(0, Math.min(1, progress));
  return (
    <>
      <span className="pkf-nose" style={busy ? undefined : { transform: `translateY(${(1 - p) * 6}px) rotate(${(1 - p) * -12}deg) scale(${0.55 + 0.45 * p})` }} />
      {WISPS.map((w) => (
        <span key={w.x} className="pkf-wisp" style={{ ['--x' as string]: `${w.x}px`, ['--d' as string]: w.d }}>
          <svg viewBox="0 0 8 14" aria-hidden>
            <path d="M4 12.5c-2.4-2.3 2.4-4 0-6.2s2.4-4 0-5.3" fill="none" stroke={WISP_EDGE} strokeWidth="3.4" strokeLinecap="round" />
            <path d="M4 12.5c-2.4-2.3 2.4-4 0-6.2s2.4-4 0-5.3" fill="none" stroke={WISP_FILL} strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
      ))}
    </>
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
  const [hit, setHit] = useState(false);
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
      if (!armed && dist >= TRIGGER) { armed = true; haptika('tuk'); setHit(true); }
      else if (armed && dist < TRIGGER) { armed = false; setHit(false); }
      setProgress(dist / TRIGGER);
      paint(dist, false);
    };
    const onEnd = () => {
      if (state !== 'pull') { state = 'idle'; return; }
      state = 'idle';
      setHit(false);
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
    <div ref={markRef} className={`pkf-pull${busy ? ' busy' : hit ? ' hit' : ''}`} aria-hidden={!busy} role={busy ? 'status' : undefined}>
      <PullMark progress={progress} busy={busy} />
    </div>
  );
}
