import { useEffect, useRef } from 'react';
import { mountBrain } from '@/components/pack/vault/brainEngine';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';

/** MOZOG UČŇA na /app (Matej 6. 11. večer: „tú neurónovú sieť, čo už máme postavenú … animácia, ako sa rozsvecujú
 *  jednotlivé uzly a synapsy“). Ten istý engine ako mozog VAULTU v appke, vrstva POSTUP: zrná sa po jednom
 *  rozsvietia až po podiel zvoleného Učňa. Labka (myš) rozsvecuje, čo prejde — svety, okruhy, zrná aj synapsy
 *  (engine `glow`); koliesko sa k plátnu nedostane, aby rolovalo stránku. Na dotyku (hover:none) CSS plátno
 *  vypína (pointer-events:none), a tak sa mozog nedal rozsvietiť vôbec — preto ho tu zapíname späť s
 *  `touch-action: pan-y`: zvislý ťah rolí stránku (aj cez mozog), vodorovný/šikmý ťah rozsvecuje. */
export function AiBrain({ share, head, onShare }: { share: number; head: string; onShare?: (n: number, total: number) => void }) {
  /* NAŽIVO (Matej 6. 11.: „dotyk synapsí to vyfarbí ale ponechá a tým rastú nižšie odznaky“): prvým dotykom labky
     sa ukážka vypne, mozog sa vyprázdni a svieti už len to, čo labka prešla — počet ide hore do odznakov Učňa. */
  const mine = useRef<Set<number> | null>(null);
  const report = useRef(onShare); report.current = onShare;
  const cv = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const st = useRef<Uint8Array>(new Uint8Array(0));
  const order = useRef<number[]>([]);
  const want = useRef(share);
  want.current = share;

  useEffect(() => {
    const c = cv.current, t = tip.current; if (!c || !t) return;
    let total = 0;
    c.style.pointerEvents = 'auto'; c.style.touchAction = 'none';
    /* dotyk: po bokoch ostane ~24 px (16 stránka + 8 plátno), kde prst roluje stránku */
    if (matchMedia('(hover:none)').matches) { c.style.margin = '0 8px'; c.style.width = 'calc(100% - 16px)'; }
    const h = mountBrain({
      canvas: c, tip: t, worlds: VAULT_WORLDS, head,
      isMobile: () => innerWidth < 700,
      worldName: () => '', circleName: () => '',
      insets: () => ({ top: 0, bottom: 0 }),
      describe: () => null,
      layer: () => 'progress', glow: true, fixed: true,
      onTouch: (zi) => {
        if (!mine.current) { mine.current = new Set(); st.current.fill(0); }
        if (mine.current.has(zi)) return;
        mine.current.add(zi); st.current[zi] = 1; h.refresh();
        report.current?.(mine.current.size, total);
      },
      progress: (zi) => { if (zi + 1 > total) total = zi + 1; return (st.current[zi] ?? 0) as 0 | 1 | 2; },
      onWorld: () => {}, onRoot: () => {},
    });
    /* poradie rozsvecovania: náhodné, ale po svetoch premiešané — sieť sa rozsvieti naprieč, nie po kúskoch */
    let lit = 0, raf = 0, last = 0, vis = false;
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0.2 });
    io.observe(c);
    /* celý mozog do rámu: engine štartuje priblížený na jadro (pre appku), tu ho oddialime */
    const fit = () => { h.resize(); h.reset(); h.zoomBy(0.62); };
    const ro = new ResizeObserver(fit); ro.observe(c);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!vis || now - last < 40) return; last = now;
      /* počet zŕn pozná až postavený mozog (stavia sa aj pri zmene veľkosti) */
      if (st.current.length !== total) { st.current = new Uint8Array(total); order.current = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5); lit = 0; }
      if (!total) return;
      if (mine.current) return; /* naživo kreslí labka, ukážka stojí */
      const goal = Math.max(1, Math.round(want.current * total));
      const S = st.current, O = order.current;
      let ch = false;
      /* nové zrná: najprv videné, o kus neskôr prečítané — vlna svetla ide pred ňou */
      const step = Math.max(1, Math.ceil(Math.abs(goal - lit) / 18));
      if (lit < goal) { for (let k = 0; k < step && lit < goal; k++) { S[O[lit++]] = 1; } ch = true; }
      else if (lit > goal) { for (let k = 0; k < step && lit > goal; k++) { S[O[--lit]] = 0; } ch = true; }
      /* mihotanie: pár rozsvietených zhasne a inde sa rozsvieti iné — svetlo putuje po sieti */
      if (lit > 4 && Math.random() < 0.5) { const i = Math.floor(Math.random() * lit), j = lit + Math.floor(Math.random() * (total - lit)); if (j < total) { [O[i], O[j]] = [O[j], O[i]]; S[O[j]] = 0; S[O[i]] = 1; ch = true; } }
      if (ch) h.refresh();
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); h.destroy(); };
  }, [head]);

  /* koliesko patrí stránke, nie zoomu mozgu: zastavíme ho skôr, než dôjde k plátnu (capture), bez preventDefault */
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const b = box.current; if (!b) return;
    const stop = (e: WheelEvent) => e.stopPropagation();
    b.addEventListener('wheel', stop, { capture: true, passive: true });
    return () => b.removeEventListener('wheel', stop, { capture: true });
  }, []);

  return (
    <div className="ai-brain" ref={box} aria-hidden>
      <canvas ref={cv} />
      <div ref={tip} className="ai-brain-tip" />
    </div>
  );
}
