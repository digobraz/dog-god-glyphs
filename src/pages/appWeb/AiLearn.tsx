import { useEffect, useRef, useState } from 'react';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { WORLD_TINT } from '@/components/pack/ainubisSkin';
import { AI_SCROLLS, AI_PODS, AI_CHAT_REFS, type AiPick } from './aiPicks';

/** Tri spôsoby učenia v sekcii AINUBIS na /app (Matej 6. 11. večer): ZVITKY = karusel vybraných zvitkov po svetoch
 *  (začína Výživou; obrázok · nadpis · krátka veta) · PODCASTY = 3 naozaj hrajú · CHAT = ukážka so žlčou a odkazmi
 *  na zvitky (neklikateľné, len ukazujú pôvod odpovede). Výber = `aiPicks.ts`, snímka LIVE DB. */

type Lang2 = 'en' | 'sk';
type C = (k: string) => string;
const WKEY: Record<string, string> = { dogsPath: 'w7', understanding: 'w5', anatomy: 'w6', nutrition: 'w4', prevention: 'w3', training: 'w2', problems: 'w1' };
const wc = (key: string) => `rgb(${WORLD_TINT[key] ?? '91,224,240'})`;
const LIVE = Array.from(new Set(AI_SCROLLS.map((s) => s.w)));

export function AiScrolls({ L, c, world, setWorld }: { L: Lang2; c: C; world: string; setWorld: (k: string) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const hov = useRef(false);
  const list = AI_SCROLLS.filter((s) => s.w === world);

  useEffect(() => { track.current?.scrollTo({ left: 0, behavior: 'smooth' }); }, [world]);
  /* sám sa posúva po karte; na konci sveta prejde na ďalší publikovaný svet */
  useEffect(() => {
    const id = setInterval(() => {
      const t = track.current; if (!t || hov.current) return;
      const r = t.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      if (t.scrollLeft + t.clientWidth >= t.scrollWidth - 8) setWorld(LIVE[(LIVE.indexOf(world) + 1) % LIVE.length]);
      else t.scrollBy({ left: (t.firstElementChild as HTMLElement | null)?.offsetWidth ?? 240, behavior: 'smooth' });
    }, 3200);
    return () => clearInterval(id);
  }, [world, setWorld]);

  return (
    <div className="zs" onPointerEnter={() => { hov.current = true; }} onPointerLeave={() => { hov.current = false; }}>
      <div className="zs-tabs">
        {VAULT_WORLDS.map((w) => {
          const live = LIVE.includes(w.key);
          return (
            <button key={w.key} type="button" disabled={!live} className={world === w.key ? 'on' : ''} style={{ ['--wc' as string]: wc(w.key) }}
              onClick={() => setWorld(w.key)} title={live ? undefined : c('w_soon')}>{c(WKEY[w.key])}</button>
          );
        })}
      </div>
      <div className="zs-track" ref={track}>
        {list.map((s, i) => (
          <article key={s.id} className="zs-card" style={{ ['--wc' as string]: wc(s.w), ['--i' as string]: i }}>
            <div className="ph"><img src={s.img} alt="" loading="lazy" /></div>
            <span className="w">{c(WKEY[s.w])}</span>
            <h5>{s.t[L]}</h5>
            <p>{s.v[L]}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export function AiPods({ L, c }: { L: Lang2; c: C }) {
  const au = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState<string | null>(null);
  const [pos, setPos] = useState(0);
  useEffect(() => () => { au.current?.pause(); }, []);
  const toggle = (p: AiPick) => {
    let a = au.current;
    if (!a) { a = new Audio(); a.preload = 'none'; au.current = a; a.ontimeupdate = () => setPos(a!.duration ? a!.currentTime / a!.duration : 0); a.onended = () => { setOn(null); setPos(0); }; }
    if (on === p.id) { a.pause(); setOn(null); return; }
    a.src = p.pod![L] || p.pod!.en; a.currentTime = 0; setPos(0);
    a.play().then(() => setOn(p.id)).catch(() => setOn(null));
  };
  return (
    <div className="pd">
      {AI_PODS.map((p) => (
        <button key={p.id} type="button" className={`pd-row${on === p.id ? ' on' : ''}`} onClick={() => toggle(p)} style={{ ['--wc' as string]: wc(p.w) }}>
          <span className="pd-img"><img src={p.img} alt="" loading="lazy" /><i>{on === p.id ? <svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg> : <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>}</i></span>
          <span className="pd-tx"><b>{p.t[L]}</b><small>{c(WKEY[p.w])} · {mmss(p.sec ?? 0)}</small>
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
