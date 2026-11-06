/**
 * /app — NOVÝ WEB = výkladná skriňa FREE appky ako HRY so psom (6. 11. 2026).
 *
 * Postavené podľa nákresu v2 `plany/nakres-web-appka-2026-11-06/index.html`
 * (Matej 6. 11.: *„postaviť nový web podľa nákresu v2 … ako predloha to môže byť"*).
 * `/` sa NEMENÍ — homepage ostáva film (OnePage), kým Matej výslovne nepovie inak.
 * Stránka je zatiaľ noindex a nikde neprelinkovaná.
 *
 *  · CSS = `appWeb/appWeb.css`, celé pod `.aw` (výrez brandu + CSS nákresu).
 *  · Texty = `appWeb/copy.ts` (EN/SK doslovne z nákresu, ostatné jazyky → EN).
 *  · `?nakres=1` zobrazí poznámky nákresu a prepínač hlavnej vety (VETA A–F).
 *  · Čísla v hero sú živé z `get-pack-stats` (psy s číslom, krajiny).
 *  · Finále = snímka planétky z `/` (živý komponent je otvorený bod).
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Seo } from '@/components/Seo';
import { HandArrowLeft, HandPaw } from '@/components/pack/HandIcons';
import { useLang } from '@/i18n/LanguageContext';
import { getPackStats } from '@/lib/sharedFetch';
import { COPY, HERO_ALTS, NOTES, type Lang2 } from './appWeb/copy';
import './appWeb/appWeb.css';

const A = '/web-app';

/** Sady snímok pre detail telefónu (ťuk na mobil). */
const SETS: Record<string, { img: string[]; t: [Record<Lang2, string>, Record<Lang2, string>] }> = {
  map: { img: ['11-vretenica-mapa', '1-zoznam-otvoreny', '1-clanok-vyletu', '2-popup-hodnotenia', '11-fotky-svih'], t: [{ en: 'Trails', sk: 'Výlety' }, { en: 'A map of dog-friendly trips. Filter, read reviews in paws, save the ones you want to walk next.', sk: 'Mapa výletov pre psov. Filtruj, čítaj hodnotenia v labkách, ulož si tie, ktoré chceš prejsť.' }] },
  profile: { img: ['B-profil-top', '6-sluzobnik-veta'], t: [{ en: 'Your profile', sk: 'Tvoj profil' }, { en: 'Your dogs, your kilometres, your badges. A profile that grows with every walk.', sk: 'Tvoji psi, tvoje kilometre, tvoje odznaky. Profil, ktorý rastie s každou prechádzkou.' }] },
  dogid: { img: ['9-moja-svorka', '3-dogid', '3-vysledok-osobnost', '3-quiz-base-1', '5-ockovanie-edit'], t: [{ en: 'DOG ID', sk: 'DOG ID' }, { en: "Answer questions, get your dog's ID card, personality and health record.", sk: 'Odpovedz na otázky a dostaneš preukaz psa, jeho povahu aj zdravotný záznam.' }] },
  ainubis: { img: ['8-ainubis', '8-zvitok-top', '8-dogscroll'], t: [{ en: 'AINUBIS', sk: 'AINUBIS' }, { en: 'Seven worlds of dog knowledge, a chat that knows your dog and scrolls to read on the go.', sk: 'Sedem svetov poznania o psoch, chat, ktorý pozná tvojho psa, a zvitky na čítanie cestou.' }] },
  feed: { img: ['feed', '8-feed-pred-lajkom', 'B-feed-komentare'], t: [{ en: 'The pack', sk: 'Svorka' }, { en: 'Stories, lost-dog alerts and buddies from the pack around you.', sk: 'Príbehy, hlásenia o stratených psoch a parťáci zo svorky okolo teba.' }] },
  plus: { img: ['plus-domov', '7-retap-von'], t: [{ en: 'One tap', sk: 'Jeden ťuk' }, { en: "Log the day, add a post or a trip. That's all it takes.", sk: 'Zapíš deň, pridaj príspevok alebo výlet. Nič viac netreba.' }] },
};

const CAROUSEL: [string, string][] = [['map', '11-vretenica-mapa'], ['profile', 'B-profil-top'], ['dogid', '9-moja-svorka'], ['ainubis', '8-ainubis'], ['feed', 'feed']];

const SERVANT_YEARS = [1, 4, 9, 14, 19, 24, 29, 34];

/** Hviezdičkou označené slovo = zlaté (`.deco`). */
const gold = (s: string) => s.split('*').map((p, i) => (i % 2 ? <span className="deco" key={i}>{p}</span> : p));

function Phone({ src }: { src: string }) {
  return (
    <div className="phone">
      <img className="fr" src={`${A}/phone.svg`} alt="" />
      <div className="scr"><img src={`${A}/snimky/${src}.jpg`} alt="" loading="lazy" /></div>
    </div>
  );
}

/** Telefón s náklonom za myšou; ťuk otvorí detail. */
function Tilt({ set, src, onOpen, className = '' }: { set: string; src: string; onOpen: (k: string) => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty('--ry', `${x * 16}deg`);
    ref.current.style.setProperty('--rx', `${-y * 12}deg`);
  };
  const leave = () => { ref.current?.style.setProperty('--ry', '0deg'); ref.current?.style.setProperty('--rx', '0deg'); };
  return (
    <div className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave} onClick={() => onOpen(set)}>
      <div ref={ref} className="tl"><Phone src={src} /></div>
    </div>
  );
}

function Counter({ to, run, suffix }: { to: number; run: boolean; suffix?: ReactNode }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const t0 = performance.now(), D = 1200;
    let raf = 0;
    const f = (t: number) => {
      const p = Math.min(1, (t - t0) / D);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return <>{v.toLocaleString('sk-SK')}{suffix}</>;
}

/** Blok, ktorý sa vynorí pri scrolle (`.rv` → `.in`). Deti môžu dostať `seen` cez render-prop. */
function Rv({ as = 'div', d = 0, className = '', children, onSeen }: { as?: 'div' | 'p' | 'details'; d?: number; className?: string; children: ReactNode | ((seen: boolean) => ReactNode); onSeen?: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); onSeen?.(); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const Tag = as as 'div';
  return (
    <Tag ref={ref as React.Ref<HTMLDivElement>} className={`rv ${seen ? 'in' : ''} ${className}`} style={{ ['--d' as string]: d } as CSSProperties}>
      {typeof children === 'function' ? children(seen) : children}
    </Tag>
  );
}

const AppleSvg = () => <svg viewBox="0 0 24 24"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9C5.7 6.8 4 7.8 3.1 9.4c-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.4 2.8 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.5.9c1.5 0 2.4-1.3 3.3-2.7 1-1.5 1.5-3 1.5-3.1-.1 0-2.9-1.1-3.3-4.7zM13.8 4.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" /></svg>;
const PlaySvg = () => <svg viewBox="0 0 24 24"><path d="M3.6 1.8 13.5 12l-9.9 10.2c-.4-.2-.6-.7-.6-1.2V3c0-.5.2-1 .6-1.2zm11 11.3 2.6 2.6-11.7 6.7 9.1-9.3zm3.9-3.9 3 1.7c.9.5.9 1.8 0 2.3l-3 1.7-2.9-2.9 2.9-2.8zM5.5 1.6l11.7 6.7-2.6 2.6-9.1-9.3z" /></svg>;

/** Odkazy do obchodov — doplníme, keď bude appka verejne v obchodoch. */
const STORE_IOS = '#';
const STORE_PLAY = '#';

function Stores() {
  return (
    <div className="stores">
      <a className="store" href={STORE_IOS}><AppleSvg /><span><small>Download on the</small><b>App Store</b></span></a>
      <a className="store" href={STORE_PLAY}><PlaySvg /><span><small>GET IT ON</small><b>Google Play</b></span></a>
    </div>
  );
}

export default function AppWeb() {
  const { lang, setLang } = useLang();
  const L: Lang2 = lang === 'sk' ? 'sk' : 'en';
  const c = (k: string) => COPY[k]?.[L] ?? '';
  const nakres = useMemo(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('nakres'), []);
  const Note = ({ k, flag }: { k: string; flag?: boolean }) => (nakres ? <span className={`note${flag ? ' flag' : ''}`}>{NOTES[k]}</span> : null);

  /* živé čísla */
  const [stats, setStats] = useState<{ dogs: number; countries: number } | null>(null);
  useEffect(() => {
    getPackStats<{ dogs?: number; total?: number; topCountries?: { country: string }[] }>()
      .then((s) => setStats({ dogs: s.dogs ?? s.total ?? 0, countries: s.topCountries?.length ?? 0 }))
      .catch(() => setStats(null));
  }, []);
  const dogs = stats?.dogs || 135;
  const countries = stats?.countries || 8;

  /* hlavná veta */
  const [hi, setHi] = useState(0);
  const hero = HERO_ALTS[hi][L];

  /* karusel */
  const [ci, setCi] = useState(0);
  const hov = useRef(false);
  const [popKey, setPopKey] = useState<string | null>(null);
  useEffect(() => {
    const id = setInterval(() => { if (!hov.current && !popKey) setCi((i) => (i + 1) % CAROUSEL.length); }, 4200);
    return () => clearInterval(id);
  }, [popKey]);
  const sx = useRef<number | null>(null);
  const pos = (i: number) => {
    const n = CAROUSEL.length;
    return i === ci ? 'cur' : i === (ci - 1 + n) % n ? 'prev' : i === (ci + 1) % n ? 'next' : 'off';
  };

  /* odznaky */
  const [ax, setAx] = useState(0);

  /* AINUBIS píše */
  const [aiSeen, setAiSeen] = useState(false);
  const [typed, setTyped] = useState('');
  const answer = c('a1x');
  useEffect(() => {
    if (!aiSeen) return;
    let i = 0;
    setTyped('');
    const id = setInterval(() => { setTyped(answer.slice(0, ++i)); if (i >= answer.length) clearInterval(id); }, 28);
    return () => clearInterval(id);
  }, [aiSeen, answer]);

  /* spodný pás na mobile */
  const [mbar, setMbar] = useState(false);
  useEffect(() => {
    const f = () => setMbar(window.scrollY > 600);
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);

  /* detail telefónu */
  const [si, setSi] = useState(0);
  const cur = popKey ? SETS[popKey] : null;
  const openPop = (k: string) => { if (SETS[k]) { setSi(0); setPopKey(k); } };
  const slide = (d: number) => { if (cur) setSi((i) => (i + d + cur.img.length) % cur.img.length); };
  useEffect(() => {
    if (!popKey) return;
    const n = SETS[popKey].img.length;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopKey(null);
      if (e.key === 'ArrowRight') setSi((i) => (i + 1) % n);
      if (e.key === 'ArrowLeft') setSi((i) => (i - 1 + n) % n);
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [popKey]);
  const px = useRef<number | null>(null);

  const [proofRun, setProofRun] = useState(false);
  useEffect(() => { setProofRun(true); }, []);

  return (
    <div className="aw">
      <Seo path="/app" title="DOGYPT — Play the game. With your dog." description={c('l_join')} noindex />

      <header className="top">
        <div className="wrap">
          <a className="logo" href="#"><img src={`${A}/logo.svg`} alt="" /><span>DOGYPT</span></a>
          <nav>
            <a href="#game">{c('nav1')}</a><a href="#features">{c('nav2')}</a><a href="#badges">{c('nav3')}</a><a href="#ainubis">AINUBIS</a><a href="#lore">{c('nav5')}</a>
          </nav>
          <button className="lang" onClick={() => setLang(L === 'sk' ? 'en' : 'sk')}>{L === 'sk' ? 'EN' : 'SK'}</button>
          <a className="pk-cta" href="#join">{c('getapp')}</a>
        </div>
      </header>

      {/* 1 · HERO */}
      <section className="hero">
        <div className="wrap">
          <div>
            {nakres && (
              <div className="alt">
                {HERO_ALTS.map((h, i) => <button key={h.k} className={i === hi ? 'on' : ''} onClick={() => setHi(i)}>VETA {h.k}</button>)}
              </div>
            )}
            <div className="hero-eye">
              <span className="pk-pill pk-pill--gold">{c('free')}</span>
              <span className="pk-pill">iOS · Android</span>
            </div>
            <h1>{gold(hero[0])}</h1>
            <p className="lead">{hero[1]}</p>
            <Stores />
            <div className="proof">
              <div><b><Counter to={dogs} run={proofRun} /></b><span>{c('p1')}</span></div>
              <div><b><Counter to={countries} run={proofRun} /></b><span>{c('p2')}</span></div>
              <div><b><Counter to={18} run={proofRun} /></b><span>{c('p3')}</span></div>
            </div>
            {nakres && <p style={{ margin: '16px 0 0' }}><Note k="n_proof" /></p>}
          </div>
          <div
            className="car"
            onMouseEnter={() => { hov.current = true; }}
            onMouseLeave={() => { hov.current = false; }}
            onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (sx.current == null) return;
              const dx = e.changedTouches[0].clientX - sx.current;
              if (Math.abs(dx) > 40) setCi((i) => (i + (dx < 0 ? 1 : -1) + CAROUSEL.length) % CAROUSEL.length);
              sx.current = null;
            }}
          >
            {CAROUSEL.map(([set, src], i) => (
              <Tilt key={set} set={set} src={src} className={`ph ${pos(i)}`} onOpen={() => (i === ci ? openPop(set) : setCi(i))} />
            ))}
            <span className="tap-hint"><span>{c('tap')}</span><svg viewBox="0 0 48 36"><path d="M4 6c18-6 36 2 34 26" /><path d="M30 24l8 9 6-10" /></svg></span>
            <span className="pk-pill pk-pill--gold float f1">{c('fl1')}</span>
            <span className="pk-pill float f2">{c('fl2')}</span>
            <span className="pk-pill float f3">{c('fl3')}</span>
            <div className="car-dots">
              {CAROUSEL.map((_, i) => <button key={i} className={i === ci ? 'on' : ''} onClick={() => setCi(i)} aria-label={`${i + 1}`} />)}
            </div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* 2 · AKO SA HRÁ */}
      <section id="game">
        <div className="wrap">
          <Rv className="sec-h"><p className="eye">{c('e_game')}</p><h2>{c('h_game')}</h2></Rv>
          <div className="loop">
            {([
              ['1', 'offline', 's1h', 's1p', 'map', '1-clanok-vyletu'],
              ['2', c('t2'), 's2h', 's2p', 'plus', 'plus-domov'],
              ['3', 'online', 's3h', 's3p', 'profile', '6-sluzobnik-veta'],
            ] as const).map(([n, tag, h, p, set, src], i) => (
              <Rv key={n} d={i} className="step pk-card">
                <div className="num">{n}</div><p className="tag">{tag}</p><h3>{c(h)}</h3><p>{c(p)}</p>
                <Tilt set={set} src={src} onOpen={openPop} />
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · SPOLOČNÝ ŽIVOT */}
      <section>
        <div className="wrap split">
          <Rv>
            {(seen) => (
              <>
                <p className="eye">{c('e_life')}</p>
                <h2>{c('h_life1')} <span className="deco">{c('h_life2')}</span></h2>
                <p className="lead">{c('l_life')}</p>
                <div className="counters">
                  <div className="pk-subblock"><b><Counter to={1982} run={seen} /></b>km</div>
                  <div className="pk-subblock"><b><Counter to={75} run={seen} /></b><span>{c('c2')}</span></div>
                  <div className="pk-subblock"><b><Counter to={9} run={seen} /></b><span>{c('c3')}</span></div>
                  <div className="pk-subblock"><b><Counter to={66} run={seen} suffix=" %" /></b>DOG ID</div>
                </div>
                <ul className="ticks">
                  <li className="pk-row"><b>DOG ID</b><span>{c('tk1')}</span></li>
                  <li className="pk-row"><b>{c('tk2h')}</b><span>{c('tk2')}</span></li>
                  <li className="pk-row"><b>{c('tk3h')}</b><span>{c('tk3')}</span></li>
                </ul>
              </>
            )}
          </Rv>
          <Rv d={1} className="duo">
            <Tilt set="dogid" src="9-moja-svorka" onOpen={openPop} />
            <Tilt set="dogid" src="3-dogid" onOpen={openPop} />
          </Rv>
        </div>
      </section>

      {/* 4 · ZABUDNI NA INSTAGRAM */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Rv className="sec-h">
            <Note k="n_ig" />
            <p className="eye">{c('e_ig')}</p>
            <h2>{c('h_ig1')} <span className="deco">{c('h_ig2')}</span></h2>
            <p className="lead">{c('l_ig')}</p>
          </Rv>
          <div className="vs">
            <Rv>
              <div className="igm">
                <div className="h"><div className="av"><HandPaw size={30} /></div><div className="st"><div><b>4</b>posts</div><div><b>11</b>followers</div><div><b>203</b>following</div></div></div>
                <p className="nm">bella.the.beagle.official</p>
                <p className="bio">just a girl who loves treats</p>
                <div className="btn">Follow</div>
                <div className="gr"><i /><i /><i /><i /></div>
                <p className="lk">{c('ig_lk')}</p>
              </div>
              <p className="vs-cap">{c('cap1')}</p>
            </Rv>
            <Rv d={1} className="mid">VS</Rv>
            <Rv d={2}>
              <Tilt set="profile" src="B-profil-top" onOpen={openPop} />
              <p className="vs-cap">{c('cap2')}</p>
            </Rv>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* 5 · FUNKCIE */}
      <section id="features">
        <div className="wrap">
          <Rv className="sec-h"><p className="eye">{c('e_feat')}</p><h2>{c('h_feat')}</h2></Rv>
          <div className="grid">
            {FEATS.map((f, i) => (
              <Rv key={f.h} d={i % 4} className={`feat pk-card ${f.cls ?? ''}`}>
                <div className="ic"><svg viewBox="0 0 24 24">{f.ic}</svg></div>
                <h3>{f.hk ? c(f.hk) : f.h}</h3><p>{c(f.p)}</p>
              </Rv>
            ))}
          </div>
          <Rv as="p" className="soon-h">{c('soon_h')}</Rv>
          <div className="grid">
            {SOON.map((f, i) => (
              <Rv key={f.h} d={i} className="feat soon">
                <div className="ic"><svg viewBox="0 0 24 24">{f.ic}</svg></div>
                <h3>{f.hk ? c(f.hk) : f.h}</h3><p>{c(f.p)}</p>
                <span className="pk-pill pk-pill--locked">{c('soon')}</span>
              </Rv>
            ))}
          </div>
          {nakres && <p style={{ textAlign: 'center', marginTop: 16 }}><Note k="n_ikony" flag /></p>}
        </div>
      </section>

      {/* 6 · ODZNAKY — tri osi */}
      <section id="badges">
        <div className="wrap">
          <Rv className="sec-h">
            <Note k="n_badge" flag />
            <p className="eye">{c('e_badge')}</p>
            <h2>{c('h_badge1')} <span className="deco">{c('h_badge2')}</span></h2>
          </Rv>
          <Rv className="tabs">
            {['ax1', 'ax2', 'ax3'].map((k, i) => <button key={k} className={ax === i ? 'on' : ''} onClick={() => setAx(i)}>{c(k)}</button>)}
          </Rv>
          {ax === 0 && (
            <div className="axis pk-card on"><h3>{c('ax1')}</h3><p className="what">{c('ax1p')}</p>
              <div className="medals">{SERVANT_YEARS.map((y, i) => <figure key={i} className={i > 2 ? 'lock' : ''}><img src={`${A}/odznaky/servant-${i}.webp`} alt="" /><span>{y}</span></figure>)}</div>
            </div>
          )}
          {ax === 1 && (
            <div className="axis pk-card on"><h3>{c('ax2')}</h3><p className="what">{c('ax2p')}</p>
              <div className="medals">{SERVANT_YEARS.map((_, i) => <figure key={i} className={i > 3 ? 'lock' : ''}><img src={`${A}/odznaky/pilgrim-${i}.webp`} alt="" /><span>{i + 1}</span></figure>)}</div>
            </div>
          )}
          {ax === 2 && (
            <div className="axis pk-card on"><h3>{c('ax3')}</h3><p className="what">{c('ax3p')}</p>
              <div className="medals">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <figure key={i}><div className="ghost"><svg viewBox="0 0 24 24"><path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2zM6 18a2 2 0 0 1 2-2h10M10 8h5M10 11h5" /></svg></div><span>{i * 25}</span></figure>)}</div>
              {nakres && <p style={{ marginTop: 16 }}><Note k="n_student" flag /></p>}
            </div>
          )}
        </div>
      </section>

      {/* 7 · AINUBIS */}
      <section id="ainubis" className="ai-band">
        <div className="wrap split rev">
          <Rv onSeen={() => setAiSeen(true)}>
            <p className="eye" style={{ color: 'var(--ai-cyan)' }}>{c('e_ai')}</p>
            <h2>{c('h_ai')}</h2>
            <p className="lead">{c('l_ai')}</p>
            <div className="ai-q ai-paluba"><div className="who">{c('you')}</div><span>{c('q1')}</span></div>
            <div className="ai-q ai-paluba"><div className="who"><span className="ai-name"><b>AI</b>NUBIS</span></div><span className={typed.length < answer.length ? 'typing' : ''}>{typed}</span></div>
            <div className="ai-chips">{['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'].map((k) => <span key={k}>{c(k)}</span>)}</div>
            <a className="ai-cta" href="#join">{c('ai_cta')}</a>
          </Rv>
          <Rv d={1}><Tilt set="ainubis" src="8-ainubis" onOpen={openPop} /></Rv>
        </div>
      </section>

      {/* 8 · ZADARMO — pes je tu boh */}
      <section id="good">
        <div className="wrap">
          <Rv className="good pk-card">
            <p className="eye">{c('e_good')}</p>
            <h2>{c('h_good1')} <span className="deco">{c('h_good2')}</span></h2>
            <p className="lead">{c('l_good')}</p>
            <div className="bowls">
              <div className="pk-subblock"><b>€0</b><span>{c('b1')}</span></div>
              <div className="pk-subblock"><b>{c('b2v')}</b><span>{c('b2')}</span></div>
              <div className="pk-subblock"><b>€ —</b><span>{c('b3')}</span></div>
            </div>
            <a className="pk-cta" href="#">{c('give')}</a>
            {nakres && <p style={{ margin: '16px 0 0' }}><Note k="n_good" flag /></p>}
          </Rv>
        </div>
      </section>

      {/* 9 · PRIDAJ SA */}
      <section id="join" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Rv className="join">
            <div>
              <p className="eye" style={{ color: 'var(--lapis-ink)' }}>{c('e_join')}</p>
              <h2>{c('h_join')}</h2>
              <p className="lead">{c('l_join')}</p>
              <Stores />
            </div>
            <div className="qr pk-subblock"><div /><span>{c('qr')}</span></div>
          </Rv>
        </div>
      </section>

      {/* 10 · FAQ */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Rv className="sec-h"><p className="eye">FAQ</p><Note k="n_faq" /></Rv>
          <div className="faq">
            {[1, 2, 3, 4].map((n) => (
              <Rv as="details" key={n} className="pk-subblock"><summary>{c(`q_${n}`)}</summary><p>{c(`a_${n}`)}</p></Rv>
            ))}
          </div>
        </div>
      </section>

      {/* 11 · PRÍBEH · VÍZIA · DOGMA */}
      <section id="lore" className="lore">
        <div className="wrap">
          <Rv className="sec-h">
            <Note k="n_lore" />
            <p className="eye">{c('e_lore')}</p>
            <h2>{c('h_lore')}</h2>
          </Rv>
          <div className="trip3">
            <Rv d={0} className="pk-dblock">
              <div className="med"><img src={`${A}/snimky/hektor.jpg`} alt="Matej a Hektor" loading="lazy" /></div>
              <p className="eye">{c('e_story')}</p>
              <h3>{c('h_story')}</h3>
              <p>{c('l_story')}</p>
              <a className="link-gold" href="/">{c('story_cta')}</a>
            </Rv>
            <Rv d={1} className="pk-dblock">
              <p className="eye">{c('e_vis')}</p>
              <h3>{c('h_vis')}</h3>
              <div className="big">{dogs.toLocaleString('sk-SK')} <small>/ 1 000 000</small></div>
              <div className="pk-progress"><div className="pk-progress__fill" style={{ width: `${Math.max(2, (dogs / 1_000_000) * 100)}%` }} /></div>
              <p>{c('l_vis')}</p>
              <a className="link-gold" href="/#vision">{c('vis_cta')}</a>
            </Rv>
            <Rv d={2} className="pk-dblock">
              <p className="eye">DOGMA</p>
              <h3>{c('h_dogma')}</h3>
              <div className="layers">{['ly1', 'ly2', 'ly3', 'ly4', 'ly5'].map((k) => <span key={k}>{c(k)}</span>)}</div>
              <p>{c('l_dogma')}</p>
              <a className="link-gold" href={L === 'sk' ? 'https://dogma.dogypt.com/' : 'https://dogma.dogypt.com/en/'}>{c('dogma_cta')}</a>
            </Rv>
          </div>
          <Rv as="p" className="motto">{c('motto')}</Rv>
        </div>
      </section>

      {/* 12 · PLANÉTKA — finále */}
      <section className="planet">
        <Note k="n_planet" />
        <div className="crop pc"><img src={`${A}/snimky/planeta-pc.jpg`} alt="Your dog is a god here." loading="lazy" /></div>
        <div className="crop mob"><img src={`${A}/snimky/planeta-mob.jpg`} alt="Your dog is a god here." loading="lazy" /></div>
      </section>

      <footer>
        <div className="wrap">
          <span>© DOGYPT · woof@dogypt.com</span>
          <span><a href="/">{c('ft1')}</a> · <a href="https://dogma.dogypt.com/">DOGMA</a> · <a href="#good">{c('ft3')}</a> · <a href="/privacy">Privacy</a></span>
        </div>
      </footer>

      <div className={`mbar${mbar ? ' on' : ''}`}><a className="pk-cta" href="#join">{c('mbar')}</a></div>

      {/* DETAIL TELEFÓNU */}
      <div className={`pop${cur ? ' on' : ''}`} onClick={() => setPopKey(null)}>
        {cur && (
          <div className="pk-panel" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="sl">
                <button className="sl-btn l" onClick={() => slide(-1)} aria-label="prev"><HandArrowLeft size={18} /></button>
                <div
                  className="sl-tr"
                  style={{ transform: `translateX(${-si * 100}%)` }}
                  onTouchStart={(e) => { px.current = e.touches[0].clientX; }}
                  onTouchEnd={(e) => {
                    if (px.current == null) return;
                    const dx = e.changedTouches[0].clientX - px.current;
                    if (Math.abs(dx) > 40) slide(dx < 0 ? 1 : -1);
                    px.current = null;
                  }}
                >
                  {cur.img.map((s) => <Phone key={s} src={s} />)}
                </div>
                <button className="sl-btn r" onClick={() => slide(1)} aria-label="next"><HandArrowLeft size={18} style={{ transform: 'scaleX(-1)' }} /></button>
              </div>
              <div className="sl-dots">{cur.img.map((s, i) => <i key={s} className={i === si ? 'on' : ''} />)}</div>
            </div>
            <div>
              <p className="eye">{L === 'sk' ? 'V appke' : 'In the app'}</p>
              <h2>{cur.t[0][L]}</h2>
              <p>{cur.t[1][L]}</p>
              <a className="pk-cta" href="#join" onClick={() => setPopKey(null)} style={{ marginTop: 16, textDecoration: 'none' }}>{c('getapp2')}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Ikonky funkcií = zástupné čiary z nákresu; pri doladení hand-drawn kit. */
const FEATS: { h: string; hk?: string; p: string; cls?: string; ic: ReactNode }[] = [
  { h: 'Trails', hk: 'f1h', p: 'f1', cls: 'trip', ic: <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /> },
  { h: 'DOG ID', p: 'f2', ic: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2.5" /><path d="M14 10h4M14 14h4M6 16h6" /></> },
  { h: 'Daily log', hk: 'f3h', p: 'f3', ic: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="m8 12 3 3 5-6" /></> },
  { h: 'AINUBIS', p: 'f4', ic: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></> },
  { h: 'Sniffer', p: 'f5', ic: <><circle cx="8" cy="9" r="3" /><circle cx="16" cy="9" r="3" /><path d="M3 19c1-3 3-4 5-4s4 1 4 4M12 19c0-3 2-4 4-4s4 1 5 4" /></> },
  { h: 'SOS', p: 'f6', cls: 'sos', ic: <path d="M12 3 2 20h20L12 3zM12 10v4M12 17v.5" /> },
  { h: 'Feed', hk: 'f7h', p: 'f7', ic: <path d="M4 5h16v11H8l-4 4V5z" /> },
  { h: 'Events', hk: 'f8h', p: 'f8', ic: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></> },
];
const SOON: { h: string; hk?: string; p: string; ic: ReactNode }[] = [
  { h: 'Eternal Dog', p: 'z1', ic: <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /> },
  { h: 'Longevity', p: 'z2', ic: <path d="M12 3v18M5 8h14M7 14h10" /> },
  { h: 'AI vet', hk: 'z3h', p: 'z3', ic: <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" /> },
  { h: 'Food plan', hk: 'z4h', p: 'z4', ic: <path d="M5 11h14l-1.5 8h-11zM8 11V8a4 4 0 0 1 8 0v3" /> },
];
