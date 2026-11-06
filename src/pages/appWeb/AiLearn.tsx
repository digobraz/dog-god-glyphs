import { useEffect, useRef, useState } from 'react';
import { WORLD_TINT } from '@/components/pack/ainubisSkin';
import { AI_SCROLLS, AI_PODS, AI_CHAT_REFS, type AiPod, type AiPick } from './aiPicks';

/** Tri spôsoby učenia v sekcii AINUBIS na /app (Matej 6. 11. večer): ZVITKY = karusel vybraných zvitkov po svetoch
 *  (začína Výživou; obrázok · nadpis · krátka veta) · PODCASTY = 3 naozaj hrajú · CHAT = ukážka so žlčou a odkazmi
 *  na zvitky (neklikateľné, len ukazujú pôvod odpovede). Výber = `aiPicks.ts`, snímka LIVE DB. */

type Lang2 = 'en' | 'sk';
type C = (k: string) => string;
const WKEY: Record<string, string> = { dogsPath: 'w7', understanding: 'w5', anatomy: 'w6', nutrition: 'w4', prevention: 'w3', training: 'w2', problems: 'w1' };
const wc = (key: string) => `rgb(${WORLD_TINT[key] ?? '91,224,240'})`;

/** Nekonečný pás zvitkov (Matej 6. 11.: „daj preč tie pilsy s témami a urob z toho nekonečný loop“ + „aby sa to
 *  dalo aj svajpovať“). Zoznam je v páse dvakrát za sebou; posun drží JS (nie CSS animácia), aby ho prst alebo myš
 *  mohli ťahať — po pustení sa doznie zotrvačnosťou a pás pokračuje sám. Poloha sa zabalí do polovice pásu. */
export function AiScrolls({ L, c }: { L: Lang2; c: C }) {
  const box = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const st = useRef({ x: 0, v: 0, drag: false, hov: false, fling: false, lx: 0, lt: 0, moved: 0 });
  useEffect(() => {
    const r = row.current; if (!r) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = performance.now();
    const f = (now: number) => {
      raf = requestAnimationFrame(f);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const S = st.current;
      /* perióda = začiatok druhej kópie, nie polovica šírky (medzera na konci by robila skok) */
      const k = r.children[AI_SCROLLS.length] as HTMLElement | undefined, half = k ? k.offsetLeft - (r.children[0] as HTMLElement).offsetLeft : 0; if (!half) return;
      if (!S.drag) {
        /* myš na páse = STOJÍ hneď (Matej: „pri dotyku zvitky nezastanú“); dobieha len švih po pustení */
        const auto = S.hov || still ? 0 : -42;           /* px/s */
        if (S.hov && !S.fling) S.v = 0;
        else { S.v += (auto - S.v) * Math.min(1, dt * (S.hov ? 3.2 : 2.2)); if (Math.abs(S.v) < 4) S.fling = false; }
        S.x += S.v * dt;
      }
      S.x = ((S.x % half) - half) % half;
      r.style.transform = `translate3d(${S.x.toFixed(1)}px,0,0)`;
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, []);
  const down = (e: React.PointerEvent) => {
    const S = st.current; S.drag = true; S.lx = e.clientX; S.lt = performance.now(); S.v = 0; S.moved = 0;
    box.current?.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const S = st.current; if (!S.drag) return;
    const now = performance.now(), dx = e.clientX - S.lx;
    S.x += dx * 1.3; S.moved += Math.abs(dx); S.v = (dx * 1.6) / Math.max(0.008, (now - S.lt) / 1000); S.lx = e.clientX; S.lt = now;
  };
  const up = () => { st.current.drag = false; st.current.fling = true; };
  /* trackpad do strany posúva pás rovno (deltaX); zvislé koliesko patrí stránke */
  useEffect(() => {
    const b = box.current; if (!b) return;
    const w = (e: WheelEvent) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); st.current.x -= e.deltaX * 1.4; st.current.v = 0; } };
    b.addEventListener('wheel', w, { passive: false });
    return () => b.removeEventListener('wheel', w);
  }, []);
  const card = (s: AiPick, k: string) => (
    <article key={k} className="zs-card" style={{ ['--wc' as string]: wc(s.w) }} aria-hidden={k.startsWith('b') || undefined}>
      <div className="ph"><img src={s.img} alt="" loading="lazy" draggable={false} /></div>
      <span className="w">{c(WKEY[s.w])}</span>
      <h5>{s.t[L]}</h5>
      <p>{s.v[L]}</p>
    </article>
  );
  return (
    <div className="zs" ref={box} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onPointerEnter={() => { st.current.hov = true; }} onPointerLeave={() => { st.current.hov = false; st.current.drag = false; }}>
      <div className="zs-loop" ref={row}>
        {AI_SCROLLS.map((s) => card(s, `a${s.id}`))}
        {AI_SCROLLS.map((s) => card(s, `b${s.id}`))}
      </div>
    </div>
  );
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

const POD_LANGS = [['sk', 'SK'], ['en', 'EN'], ['cs', 'CZ']] as const;
type PodLang = typeof POD_LANGS[number][0];

export function AiPods({ L, c }: { L: Lang2; c: C }) {
  const au = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState<string | null>(null);
  const [pos, setPos] = useState(0);
  const [pl, setPl] = useState<PodLang>(L);
  useEffect(() => { setPl(L); }, [L]);
  useEffect(() => () => { au.current?.pause(); }, []);
  const play = (p: AiPod, lang: PodLang) => {
    let a = au.current;
    if (!a) { a = new Audio(); a.preload = 'none'; au.current = a; a.ontimeupdate = () => setPos(a!.duration ? a!.currentTime / a!.duration : 0); a.onended = () => { setOn(null); setPos(0); }; }
    a.src = (p.pod[lang] ?? p.pod.en).src; a.currentTime = 0; setPos(0);
    a.play().then(() => setOn(p.id)).catch(() => setOn(null));
  };
  const toggle = (p: AiPod) => {
    if (on === p.id) { au.current?.pause(); setOn(null); return; }
    play(p, pl);
  };
  /* prepnutie jazyka počas hrania = ten istý podcast v novom jazyku */
  const pickLang = (lang: PodLang) => {
    setPl(lang);
    const cur = AI_PODS.find((p) => p.id === on); if (cur) play(cur, lang);
  };
  return (
    <div className="pd">
      <div className="pd-lang" role="group" aria-label={c('pod_lang')}>
        <span>{c('pod_lang')}</span>
        {POD_LANGS.map(([k, lbl]) => <button key={k} type="button" className={pl === k ? 'on' : ''} onClick={() => pickLang(k)}>{lbl}</button>)}
      </div>
      {AI_PODS.map((p) => (
        <button key={p.id} type="button" className={`pd-row${on === p.id ? ' on' : ''}`} onClick={() => toggle(p)} style={{ ['--wc' as string]: wc(p.w) }}>
          <span className="pd-img"><img src={p.img} alt="" loading="lazy" /><i>{on === p.id ? <svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg> : <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>}</i></span>
          <span className="pd-tx"><b>{p.t[pl]}</b><small>{c(WKEY[p.w])} · {mmss(p.pod[pl]?.sec ?? 0)}</small>
            <span className="pd-bar"><span style={{ transform: `scaleX(${on === p.id ? pos : 0})` }} /></span></span>
          <span className={`pd-eq${on === p.id ? ' go' : ''}`} aria-hidden><i /><i /><i /><i /></span>
        </button>
      ))}
    </div>
  );
}

export function AiChat({ L, c, head }: { L: Lang2; c: C; head: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState(0); // 0 nič · 1 otázka · 2 píše · 3 odpoveď · 4 zvitky
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      [[1, 200], [2, 900], [3, 2300], [4, 3000]].forEach(([s, t]) => setTimeout(() => setSt(s), t));
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div className="ch" ref={ref}>
      <div className="ch-top"><img src={head} alt="" /><span><b>AI</b>NUBIS</span><em>{c('ch_dog')}</em></div>
      <div className="ch-body">
        {st >= 1 && <div className="ch-q">{c('ch_q')}</div>}
        {st === 2 && <div className="ch-a typing"><i /><i /><i /></div>}
        {st >= 3 && <div className="ch-a">{c('ch_a1')}<br /><br />{c('ch_a2')}<br /><br /><b>{c('ch_a3')}</b></div>}
        {st >= 4 && (
          <div className="ch-refs">
            <span className="lbl">{c('ch_src')}</span>
            {AI_CHAT_REFS.slice(0, 3).map((r, i) => (
              <div key={r.id} className="ch-ref" style={{ ['--wc' as string]: wc(r.w), ['--i' as string]: i }}>
                <img src={r.img} alt="" loading="lazy" /><span><small>{c(WKEY[r.w])}</small>{r.t[L]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
