/**
 * /story — príbeh Hekthora a DOGYPTU, podstránka nového webu (`/app`). Prevod nákresu kolo 4
 * (`plany/nakresy/web-story-2026-11-11/index.html`, Matej 11. 11. 2026: „daj to už na nový web“).
 * Poradie: hero → kapitoly 2016–2026 → od krabice k miliónu (+ karta DNES) → vízia → DOGMA → pätička.
 * Texty `appWeb/storyCopy.ts`, štýl `appWeb/story.css` (triedy `sx-`), tokeny a hlavička z `appWeb.css`.
 */
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Seo } from '@/components/Seo';
import { useLang } from '@/i18n/LanguageContext';
import { getPackStats } from '@/lib/sharedFetch';
import { flagUrl } from '@/lib/flagUrl';
import { intlLocale } from '@/i18n/bcp47';
import { COPY, COPY3, type Lang2 } from './appWeb/copy';
import { WEB_LANGS } from './appWeb/langs';
import { STORY } from './appWeb/storyCopy';
import PULSE from '@/data/onepagePulse.json';
import AI_HEAD from '@/assets/ainubis-head.webp';
import { Stores } from './appWeb/Stores';
import FOTO from './appWeb/storyFoto.json';
import './appWeb/appWeb.css';
import './appWeb/story.css';

const S = '/web-app/story';
const ph = (n: string) => `${S}/${n}.webp`;

/** `*slovo*` → zvýraznené slovo; `Tag` = trieda alebo prvok, ktorým sa obalí */
function Mark({ s, as = 'deco' }: { s: string; as?: 'deco' | 'b' | 'span' }) {
  return <>{s.split(/\*(.+?)\*/).map((p, i) => {
    if (!(i % 2)) return <Fragment key={i}>{p}</Fragment>;
    return as === 'deco' ? <span key={i} className="deco">{p}</span> : as === 'b' ? <b key={i}>{p}</b> : <span key={i}>{p}</span>;
  })}</>;
}

type Pic = { src?: string; x: string; y: string; r: string; r0?: string; d?: string; z?: number; cap?: string; empty?: string };
function Fan({ pics, dark }: { pics: Pic[]; dark?: boolean }) {
  return (
    <div className={`sx-fan${dark ? ' sx-dark' : ''}`}>
      {pics.map((p, i) => (
        <figure key={i} className={`sx-ph${p.empty ? ' sx-empty' : ''}`}
          style={{ '--x': p.x, '--y': p.y, '--r': p.r, '--r0': p.r0 ?? '0deg', '--d': p.d ?? '0s', '--z': p.z ?? 1 } as CSSProperties}>
          {p.empty ?? <img src={ph(p.src!)} alt="" loading="lazy" decoding="async" />}
          {p.cap && <figcaption>{p.cap}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

const d = (s: number) => ({ '--d': `${s}s` } as CSSProperties);

/* Fotky kapitol = `public/web-app/story/r/<rok>-….webp`, popisy píše Matej v nákrese
   `plany/nakresy/web-story-2026-11-11/popisy.html` → `appWeb/storyFoto.json` (13. 11. 2026).
   Rok = prvé 4 znaky mena; ★ vpredu = predná fotka vejára; prvých 5 ide do vejára, zvyšok do pásu.
   ▢ veľký = fotka sama namiesto vejára (koláž 2019–21, Matej 13. 11.), všetky ostatné idú do pásu. */
type Foto = { sk?: string; en?: string; vpredu?: boolean; skryt?: boolean; velky?: boolean };
const FAN_POS: Pic[][] = [
  [{ x: '0%', y: '0%', r: '-2deg' }],
  [{ x: '-22%', y: '-16%', r: '-6deg' }, { x: '18%', y: '18%', r: '4deg', d: '.1s' }],
  [{ x: '-34%', y: '-24%', r: '-8deg', r0: '-3deg' }, { x: '34%', y: '-20%', r: '6deg', r0: '4deg', d: '.1s' }, { x: '0%', y: '28%', r: '-2deg', r0: '-1deg', d: '.2s' }],
  [{ x: '-28%', y: '-26%', r: '-9deg', r0: '-2deg' }, { x: '28%', y: '-24%', r: '7deg', r0: '3deg', d: '.08s' }, { x: '-26%', y: '26%', r: '5deg', r0: '-4deg', d: '.16s' }, { x: '24%', y: '22%', r: '-3deg', d: '.24s' }],
  [{ x: '-28%', y: '-26%', r: '-9deg', r0: '-2deg' }, { x: '28%', y: '-24%', r: '7deg', r0: '3deg', d: '.08s' }, { x: '-30%', y: '26%', r: '5deg', r0: '-4deg', d: '.16s' }, { x: '30%', y: '24%', r: '-6deg', r0: '2deg', d: '.24s' }, { x: '0%', y: '0%', r: '-1deg', d: '.32s' }],
];
function fotky(roky: string[], L: Lang2) {
  const all = Object.entries(FOTO as Record<string, Foto>).filter(([id, x]) => roky.includes(id.slice(0, 4)) && !x.skryt)
    .map(([id, x]) => ({ src: `r/${id}`, cap: (L === 'sk' ? x.sk : x.en || x.sk) || undefined, front: !!x.vpredu, big: !!x.velky }));
  const big = all.find((x) => x.big);
  if (big) return { big, fan: [] as Pic[], strip: all.filter((x) => x !== big) };
  const front = all.find((x) => x.front) ?? all[0];
  const rest = all.filter((x) => x !== front);
  const fanRest = rest.slice(0, 4), strip = rest.slice(4);
  const inFan = front ? [...fanRest, front] : fanRest;
  const fan: Pic[] = inFan.map((f, i) => ({ ...FAN_POS[inFan.length - 1][i], src: f.src, cap: f.cap, z: i === inFan.length - 1 ? 5 : 1 }));
  return { big: undefined, fan, strip };
}
function Side({ f }: { f: ReturnType<typeof fotky> }) {
  if (!f.big) return <Fan pics={f.fan} />;
  return <figure className="sx-ph sx-rv sx-big"><img src={ph(f.big.src)} alt="" loading="lazy" />{f.big.cap && <figcaption>{f.big.cap}</figcaption>}</figure>;
}
function Strip({ pics }: { pics: { src: string; cap?: string }[] }) {
  if (!pics.length) return null;
  const n = pics.length, loop = Array.from({ length: Math.max(2, Math.ceil(10 / n)) * n }, (_, i) => pics[i % n]);
  return (
    <div className="sx-strip sx-rv"><div className="sx-strip-in">
      {loop.map((p, i) => (
        <figure key={i} className="sx-ph" aria-hidden={i >= n || undefined}><img src={ph(p.src)} alt="" loading="lazy" />{p.cap && <figcaption>{p.cap}</figcaption>}</figure>
      ))}
    </div></div>
  );
}

function Chapter({ n, year, small, rev, low, h, children, side, top0, below }: {
  n: string; year: string; small?: boolean; rev?: boolean; low?: boolean; h: string; children: ReactNode; side: ReactNode; top0?: boolean; below?: ReactNode;
}) {
  return (
    <section className={`sx-ch${low ? ' sx-low' : ''}`} style={top0 ? { paddingTop: 0 } : undefined}>
      <div className={`wrap sx-split${rev ? ' sx-rev' : ''}`}>
        <div>
          <p className="sx-num sx-rv">{n}</p>
          <div className={`sx-year${small ? ' sx-sm' : ''} sx-rv`} style={d(0.1)}>{year}</div>
          <h2 className="sx-rv" style={d(0.2)}><Mark s={h} /></h2>
          {children}
        </div>
        {side}
      </div>
      {below}
    </section>
  );
}

export default function StoryWeb() {
  const { lang, setLang } = useLang();
  const L: Lang2 = lang === 'sk' ? 'sk' : 'en';
  const t = (k: string) => STORY[k]?.[L] ?? '';
  const [F16, F17, F18, F19, F22, F23, F24, F26] = [['2016'], ['2017'], ['2018'], ['2019', '2020', '2021'], ['2022'], ['2023'], ['2024', '2025'], ['2026']].map((r) => fotky(r, L));
  const w = (k: string) => COPY3[k]?.[L] ?? COPY[k]?.[L] ?? '';
  const loc = intlLocale(lang);
  const fmt = (n: number) => n.toLocaleString(loc);
  const curLang = WEB_LANGS.find((x) => x.code === lang) ?? WEB_LANGS[0];
  const [langOpen, setLangOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => { if (!langOpen) return; const off = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('.lang-wrap')) setLangOpen(false); }; document.addEventListener('pointerdown', off); return () => document.removeEventListener('pointerdown', off); }, [langOpen]);

  /* živý počet psov (verejný = všetky psy s číslom) */
  const [dogs, setDogs] = useState(121);
  useEffect(() => {
    getPackStats<{ dogs?: number; total?: number }>().then((s) => { const n = s.dogs ?? s.total; if (n) setDogs(n); }).catch(() => {});
  }, []);
  const pct = Math.min(100, (dogs / 1000) * 100);

  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLElement>(null);
  const hxRef = useRef<HTMLElement>(null);
  const qRef = useRef<HTMLElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLElement>(null);
  const progRef = useRef<HTMLDivElement>(null);

  /* odhalenie pri scrolle + počítadlá (`data-n`) — bez Reactu, aby scroll neprekresľoval strom */
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = (el: HTMLElement) => {
      const n = +(el.dataset.n ?? 0);
      if (reduce) { el.textContent = fmt(n); return; }
      const t1 = performance.now(), D = n > 1000 ? 2200 : 1400;
      const s = (tt: number) => { const p = Math.min(1, (tt - t1) / D); el.textContent = fmt(Math.round(n * (1 - Math.pow(1 - p, 4)))); if (p < 1) requestAnimationFrame(s); };
      requestAnimationFrame(s);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      el.classList.add('sx-in');
      el.querySelectorAll<HTMLElement>('[data-n]').forEach(count);
      if (el.dataset.n) count(el);
      io.unobserve(el);
    }), { threshold: 0.25 });
    root.querySelectorAll('.sx-rv,.sx-fan,.sx-rs,.sx-bign,.sx-nums').forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L, dogs]);

  /* hlavička na fotke, 2017 slovo po slove, cesta k miliónu, postupový pás */
  useEffect(() => {
    let raf = 0;
    const f = () => {
      raf = 0;
      const vh = innerHeight;
      const onPhoto = (hxRef.current?.getBoundingClientRect().bottom ?? 0) > 96;
      topRef.current?.classList.toggle('sx-onphoto', onPhoto);
      topRef.current?.classList.toggle('stuck', !onPhoto);
      const q = qRef.current;
      if (q) {
        const b = q.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh * 0.85 - b.top) / (vh * 0.6)));
        const words = q.querySelectorAll('.sx-qbig .sx-w');
        words.forEach((el, i) => el.classList.toggle('sx-on', p > ((i + 0.5) / words.length) * 0.9));
        q.classList.toggle('sx-strike', p >= 1);
      }
      const r = roadRef.current?.getBoundingClientRect();
      if (r) fillRef.current?.style.setProperty('--p', `${Math.min(100, Math.max(0, ((vh * 0.55 - r.top) / r.height) * 100))}%`);
      progRef.current?.style.setProperty('--sp', String(scrollY / Math.max(1, document.documentElement.scrollHeight - vh)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(f); };
    f(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);

  /* AINUBIS v pätičke — ukážka s pripravenými odpoveďami; vlastná otázka dostane odkaz na mail */
  const [chat, setChat] = useState<{ me?: boolean; k: string; raw?: string }[]>([]);
  const [draft, setDraft] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const ask = (q: string, a: string, raw?: string) => {
    setChat((c) => [...c, { me: true, k: q, raw }]);
    setTimeout(() => setChat((c) => [...c, { k: a }]), 700);
  };
  useEffect(() => { if (chat.length) chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [chat]);

  // ` | ` v hx_h = nový riadok; každá veta drží jeden riadok (`.sx-hl` nowrap)
  let hxN = 0;
  const hxLines = t('hx_h').split(' | ').map((ln) => ln.split(' ').map((x) => ({ x, i: hxN++ })));
  const qWords = t('c2_q').split(' ');
  const dogmaUrl = L === 'sk' ? 'https://dogma.dogypt.com/' : 'https://dogma.dogypt.com/en/';
  const navLinks = (
    <>
      <a href="/app#features">{w('nav2')}</a><a href="/app#trips">{w('nav_trips')}</a><a href="/app#ainubis">AINUBIS</a><a href="/app#badges">{w('nav3')}</a><a className="sx-on" href="/story">{w('nav5')}</a>
    </>
  );
  const upd = PULSE.updated.replace(/^(\d+)-(\d+)-(\d+)$/, (_m, _y, mo, dd) => `${+dd}. ${+mo}.`);
  const pmax = Math.max(1, ...PULSE.days.map((x) => x.h));
  const ch = (i: string) => `${t('ch')} ${i}`;
  /* priemer na deň od začiatku merania (dnešok vrátane) */
  const runDays = Math.max(1, Math.round((new Date(PULSE.updated).getTime() - new Date(PULSE.since).getTime()) / 864e5) + 1);
  const avgH = Math.round(PULSE.total / runDays);
  const sinceTxt = new Date(PULSE.since).toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' });

  return (
    <div className="aw" data-bg="1" data-pz="0" ref={rootRef}>
      <Seo path="/story" title={`DOGYPT · ${t('seo_t')}`} description={t('seo_d')} noindex />
      <div className="aw-bg" aria-hidden><i className="glyphs" /><i className="pearl" /><i className="pearl p1" /><i className="pearl p2" /></div>
      <div className="sx-prog" ref={progRef} />

      <header className="top sx-onphoto" ref={topRef}>
        <div className="wrap">
          <a className="logo" href="/app" aria-label="DOGYPT"><img src="/web-app/logo-napis.webp" alt="DOGYPT" /></a>
          <nav>{navLinks}</nav>
          <div className="lang-wrap">
            <button className="lang" aria-expanded={langOpen} onClick={() => setLangOpen(!langOpen)}><img src={flagUrl(curLang.flag, 40)} alt="" />{curLang.code.slice(0, 2).toUpperCase()}</button>
            {langOpen && (
              <div className="lang-pop" onClick={() => setLangOpen(false)}>
                {WEB_LANGS.map((x) => <button key={x.code} className={x.code === lang ? 'on' : ''} onClick={() => setLang(x.code)}><img src={flagUrl(x.flag, 40)} alt="" />{x.name}</button>)}
              </div>
            )}
          </div>
          <a className="pk-cta" href="/app#join">{w('getapp')}</a>
          <button className={`burger${menu ? ' on' : ''}`} aria-label={w('menu')} aria-expanded={menu} onClick={() => setMenu(!menu)}><i /><i /><i /></button>
        </div>
        {menu && (
          <div className="mmenu" onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false); }}>
            <nav>{navLinks}</nav>
            <p className="mm-h">{w('lang_h')}</p>
            <div className="mm-lang">{WEB_LANGS.map((x) => <button key={x.code} className={x.code === lang ? 'on' : ''} onClick={() => { setLang(x.code); setMenu(false); }}><img src={flagUrl(x.flag, 40)} alt="" />{x.name}</button>)}</div>
          </div>
        )}
      </header>

      <main>
        {/* 1 · HERO — ostrá fotka (Kie nano-banana-pro 4K); video = statický záber, dážď, blesk v pozadí */}
        <section className="sx-hx" ref={hxRef} data-no-paw>
          <img src={`${S}/hero.webp`} srcSet={`${S}/hero-1200.webp 1200w, ${S}/hero.webp 2400w`} sizes="100vw" alt="" {...({ fetchpriority: 'high' } as Record<string, string>)} />
          <video autoPlay muted loop playsInline preload="auto" poster={`${S}/hero.webp`} aria-hidden onError={(e) => e.currentTarget.remove()}>
            <source src={`${S}/hero-loop.webm`} type="video/webm" />
            <source src={`${S}/hero-loop.mp4`} type="video/mp4" />
          </video>
          <div className="sx-hx-t"><div className="wrap">
            <p className="eye">{t('hx_eye')}</p>
            <h1>{hxLines.map((line, li) => (
              <span key={li} className="sx-hl">{line.map(({ x, i }) => {
                const deco = /^\*.*\*$/.test(x);
                return <Fragment key={i}><span className={`sx-w${deco ? ' deco' : ''}`} style={{ '--i': i } as CSSProperties}>{x.replace(/\*/g, '')}</span>{' '}</Fragment>;
              })}</span>
            ))}</h1>
            <p>{t('hx_p')}</p>
          </div></div>
          <span className="sx-down" />
        </section>

        {/* I · 2016 */}
        <Chapter n={ch('I')} year="2016" h={t('c1_h')}
          side={<Side f={F16} />} below={<Strip pics={F16.strip} />}>
          <p className="lead sx-rv" style={d(0.3)}>{t('c1_p')}</p>
        </Chapter>

        {/* II · 2017 — „I don't want a dog!“, slová sa rozsvecujú scrollom, „don't“ sa prečiarkne */}
        <section className="sx-q" ref={qRef} data-no-paw>
          <div className="wrap">
            <div className="sx-c">
              <p className="eye sx-rv">{ch('II')} · 2017</p>
              <p className="sx-qbig">{qWords.map((x, i) => {
                const no = /^\*.*\*$/.test(x);
                return <Fragment key={i}><span className={`sx-w${no ? ' sx-no' : ''}`}>{x.replace(/\*/g, '')}</span>{' '}</Fragment>;
              })}</p>
            </div>
            <div className="sx-split">
              <div>
                <p className="lead sx-rv">{t('c2_p1')}</p>
                <p className="lead sx-rv" style={d(0.15)}><Mark s={t('c2_p2')} as="b" /></p>
              </div>
              <Fan dark pics={F17.fan} />
            </div>
          </div>
        </section>

        {/* III · 2018 */}
        <Chapter n={ch('III')} year="2018" rev h={t('c3_h')}
          side={<Side f={F18} />} below={<Strip pics={F18.strip} />}>
          <p className="lead sx-rv" style={d(0.3)}>{t('c3_p1')}</p>
          <p className="lead sx-rv" style={d(0.4)}>{t('c3_p2')}</p>
        </Chapter>

        {/* IV · 2019–21 — život v lese (Matej 11. 11.) */}
        <Chapter n={ch('IV')} year="2019–21" small top0 h={t('c4_h')}
          side={<Side f={F19} />} below={<Strip pics={F19.strip} />}>
          <p className="lead sx-rv" style={d(0.3)}>{t('c4_p')}</p>
        </Chapter>

        {/* V · 2022 — zlomový rok: Cesta s Hrdinom + Expo Dubai */}
        <section className="sx-ch" style={{ paddingTop: 0 }}>
          <div className="wrap sx-split sx-rev">
            <div>
              <p className="sx-num sx-rv">{ch('V')}</p>
              <div className="sx-year sx-rv" style={d(0.1)}>2022</div>
              <h2 className="sx-rv" style={d(0.2)}><Mark s={t('c5_h')} /></h2>
              <p className="lead sx-rv" style={d(0.3)}>{t('c5_p')}</p>
              <p className="lead sx-rv" style={d(0.35)}>{t('c5_p2')}</p>
              <div className="sx-nums sx-rv" style={d(0.4)}>
                <div><b data-n="42">0</b><span>{t('c5_days')}</span></div>
                <div><b data-n="800">0</b><span>{t('c5_km')}</span></div>
              </div>
            </div>
            <Side f={F22} />
          </div>
          <Strip pics={F22.strip} />
        </section>

        {/* VI · 2023 — kniha vydaná, peniaze do appky, ktorú nedodali; tichší tón */}
        <Chapter n={ch('VI')} year="2023" low h={t('c6_h')}
          side={<Side f={F23} />} below={<Strip pics={F23.strip} />}>
          <p className="lead sx-rv" style={d(0.3)}>{t('c6_p')}</p>
        </Chapter>

        {/* VII · 2024–25 — krátka pauza */}
        <Chapter n={ch('VII')} year="2024–25" small rev top0 h={t('c7_h')}
          side={<Side f={F24} />} below={<Strip pics={F24.strip} />}>
          <p className="lead sx-rv" style={d(0.3)}>{t('c7_p')}</p>
        </Chapter>

        {/* VIII · 2026 — AI a stavba; hodiny = súčet `stroj` z plany/praca-log.json (gen-praca-stats → onepagePulse.json) */}
        <Chapter n={ch('VIII')} year="2026" top0 h={t('c8_h')}
          side={<Side f={F26} />} below={<Strip pics={F26.strip} />}>
          <p className="lead sx-rv" style={d(0.3)}>{t('c8_p')}</p>
          <div className="sx-nums sx-rv" style={d(0.4)}>
            <div><b data-n={PULSE.total}>0</b><span>{t('c8_hrs')}</span></div>
            <div><b data-n={avgH}>0</b><span>{t('c8_avg')}</span></div>
            <div><b data-n={runDays}>0</b><span>{t('c8_since')} {sinceTxt}</span></div>
          </div>
          <p className="sx-who sx-rv" style={d(0.5)}>{t('c8_who')}</p>
        </Chapter>

        {/* od krabice k miliónu + DNES s aktuálnym priebehom */}
        <section className="sx-ch" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-h sx-rv"><p className="eye">{t('rd_eye')}</p><h2><Mark s={t('rd_h')} /></h2></div>
            <div className="sx-road" ref={roadRef}>
              <i className="sx-road-line" /><i className="sx-road-fill" ref={fillRef} />
              {([['1b', '2016', 'r1'], ['2a', '2017', 'r2'], ['2c', '2019–21', 'r3'], ['4a', '2022', 'r4'], ['3a', '2023', 'r5'], ['2d', t('r6_y'), 'r6']] as const).map(([img, y, k]) => (
                <div className="sx-rs" key={k}>
                  <span className="sx-dot"><img src={ph(img)} alt="" loading="lazy" /></span>
                  <div className="sx-txt"><em>{y}</em><b>{t(`${k}_b`)}</b><span>{t(`${k}_s`)}</span></div>
                </div>
              ))}
              <div className="sx-rs sx-now">
                <span className="sx-dot"><img src="/web-app/app-icon.png" alt="" /></span>
                <div className="sx-txt"><em style={{ color: 'var(--lapis-edge)' }}>{t('r7_y')}</em><b>{t('r7_b')}</b><span>{t('r7_s')}</span></div>
                <div className="pk-card sx-nowc">
                  <div>
                    <p className="eye">{t('now_eye')}</p>
                    <div className="sx-big"><span data-n={dogs}>0</span><small>{t('now_dogs')}</small></div>
                    <div className="sx-bar"><i style={{ '--w': `${pct}%` } as CSSProperties} /></div>
                    <div className="sx-barl"><span>{t('now_goal')}</span><span>{Math.round(pct)} %</span></div>
                    <p className="lead">{t('now_p')}</p>
                    <div className="sx-ctas">
                      <a className="pk-cta" href="/app#badges">{t('now_join')}</a>
                      <a className="pk-cta" href="/app#join" style={{ background: 'var(--paper)', color: 'var(--ink-strong)', borderColor: 'var(--card-edge)' }}>{t('now_app')}</a>
                    </div>
                  </div>
                  <img className="sx-face" src="/images/kontakt-matej-hektor-cut.webp" alt="Matej & Hekthor" loading="lazy" />
                </div>
              </div>
              {([['1K', 1000, 'f1'], ['10K', 10000, 'f2'], ['100K', 100000, 'f3']] as const).map(([dot, n, k]) => (
                <div className="sx-rs sx-fut" key={k}><span className="sx-dot">{dot}</span><div className="sx-txt"><em>{fmt(n)}</em><b>{t(`${k}_b`)}</b><span>{t(`${k}_s`)}</span></div></div>
              ))}
              <div className="sx-rs sx-fut"><span className="sx-dot"><img src="/images/vision/vision-unity.webp" alt="" loading="lazy" /></span><div className="sx-txt"><em>{fmt(1000000)}</em><b>{t('f4_b')}</b><span>{t('f4_s')}</span></div></div>
            </div>
          </div>
        </section>

        {/* VÍZIA — cieľ CTA „Vízia DOGYPTU“ z /app */}
        <section className="sx-ch" id="vision" style={{ paddingTop: 0 }}>
          <div className="wrap sx-vis">
            <div className="sx-vis-art sx-rv"><img src="/images/council-pharaoh.webp" alt="We need you" loading="lazy" /></div>
            <div>
              <p className="sx-num sx-rv">{t('vi_eye')}</p>
              <h2 className="sx-rv" style={{ ...d(0.1), fontSize: 'clamp(32px,4.6vw,60px)', lineHeight: 1.08 }}><Mark s={t('vi_h')} /></h2>
              <div className="sx-bign sx-rv" style={d(0.2)} data-n="1000000">0</div>
              <p className="eye sx-rv" style={{ ...d(0.25), marginTop: 'var(--s-xs)' }}>{t('vi_n')}</p>
              <p className="lead sx-rv" style={{ ...d(0.3), fontSize: 18 }}>{t('vi_p')}</p>
            </div>
          </div>
        </section>

        {/* DOGMA — pokojná (Matej: „ok ale nie taká pohyblivá“) */}
        <section className="sx-ch" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="pk-card sx-dg sx-rv">
              <img className="sx-book" src="/images/dogma-cover-lapis.webp" alt="DOGMA" loading="lazy" />
              <div>
                <p className="eye">{t('dg_eye')}</p>
                <h2 style={{ fontSize: 'clamp(32px,4.2vw,52px)', lineHeight: 1.08 }}><Mark s={t('dg_h')} /></h2>
                <p className="lead" style={{ fontSize: 18 }}>{t('dg_p')}</p>
                <a className="pk-cta" style={{ marginTop: 'var(--s-xl)', padding: '16px 28px', textDecoration: 'none', display: 'inline-flex' }} href={dogmaUrl}>{t('dg_cta')}</a>
                <p className="sx-motto"><Mark s={t('motto')} as="span" /></p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* PÄTIČKA — kontakty · AINUBIS · živý priebeh práce (onepagePulse.json, gen-praca-stats pri deployi) */}
      <footer className="sx-ft" data-no-paw>
        <div className="wrap">
          <div className="sx-ftg">
            <div>
              <img className="sx-logo" src="/web-app/logo-napis.webp" alt="DOGYPT" />
              <p>{t('ft_about')}</p>
              <div className="sx-links">
                <a href="mailto:woof@dogypt.com"><i>✉</i>woof@dogypt.com</a>
                <a href="https://instagram.com/dogypt" target="_blank" rel="noopener"><i>◎</i>Instagram</a>
                <a href="https://www.facebook.com/dogypt.official/" target="_blank" rel="noopener"><i>f</i>Facebook</a>
                <a href="https://youtube.com/@dogypt" target="_blank" rel="noopener"><i>▶</i>YouTube</a>
                <a href={dogmaUrl}><i>☥</i>DOGMA</a>
              </div>
              <Stores />
              <p className="sx-ftmotto"><Mark s={t('motto')} as="span" /></p>
            </div>

            <div>
              <h3>{t('ft_ask')}</h3>
              <div className="sx-ai">
                <div className="sx-ai-h"><img src={AI_HEAD} alt="" /><div><b><span>AI</span>NUBIS</b><small>{t('ai_on')}</small></div></div>
                <div className="sx-ai-b" ref={chatRef}>
                  <div className="sx-msg">{t('ai_hi')}</div>
                  {chat.map((m, i) => <div key={i} className={`sx-msg${m.me ? ' sx-me' : ''}`}>{m.raw ?? t(m.k)}</div>)}
                  <div className="sx-chips">{[1, 2, 3].map((i) => <button key={i} type="button" onClick={() => ask(`ai_q${i}`, `ai_a${i}`)}>{t(`ai_q${i}`)}</button>)}</div>
                </div>
                <form className="sx-ai-f" onSubmit={(e) => { e.preventDefault(); const v = draft.trim(); if (!v) return; setDraft(''); ask('', 'ai_mail', v); }}>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t('ai_ph')} />
                  <button type="submit">{t('ai_send')}</button>
                </form>
              </div>
            </div>

            <div>
              <h3>{t('ft_now')}</h3>
              <div className="sx-live">
                <div className="sx-stat"><span>{t('ft_dogs')}</span><b>{fmt(dogs)}</b></div>
                <div className="sx-stat"><span>{t('ft_week')}</span><b>{fmt(PULSE.hours)}<small>h</small></b></div>
                <div>
                  <div className="sx-spark">{PULSE.days.map((x) => <i key={x.d} title={`${x.d}: ${x.h} h`} style={{ height: `${(x.h / pmax) * 100}%` }} />)}</div>
                  <p className="sx-upd">{t('ft_upd')} {upd}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="sx-ftb"><span>© 2026 DOGYPT</span><span><a href="/terms">{t('ft_terms')}</a><a href="/privacy">{t('ft_privacy')}</a></span></div>
        </div>
      </footer>
    </div>
  );
}
