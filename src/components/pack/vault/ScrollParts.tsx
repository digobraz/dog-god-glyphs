// ════════════════════════════════════════════════════════════════════════════
// ZVITOK — karta v zozname + článok zvitku (3. 10. 2026, LEN DEV)
// ────────────────────────────────────────────────────────────────────────────
// Nákres: plany/nakres-zvitok-detail-2026-10-03-v2.html. Matej: „pozične aj obsahovo
// ok, dizajn doladíme na mieste".
//
// KARTA: krúžok stavu v rohu (biely obrys → plný oranžový → zelený ✓, vysvetlenie
// pri prejdení myšou) · obraz 3:4 a POD NÍM štvorica akcií so slovami · meta, nadpis,
// sila dôkazu, „Vezmi si z toho" v bloku bez nadpisu, CTA PREČÍTAŤ ZNALOSŤ, podcast a zdroje.
// Veta pod nadpisom (`v`) a „Súvisí" sú len v článku — karta mala priveľa textu.
//
// ČLÁNOK = kôš 2 „POZERÁM SA" (lock architektura-pack §3), modal-as-route ako
// článok výletu (`StoryView`): vlastná adresa `/pack/ainubis/zvitok/:id`, šípka späť
// vľavo hore (krížik v /pack neexistuje, 27. 9.), lišta ostáva — vrstva stojí POD
// spodným navom (z 39 < 40).
//
// ŠTVORICA (lock §4.2): ❤️ páči · ☆ uložiť (do Mojich znalostí, police Uložené) ·
// ➕ použiť = SPÝTAJ SA AINUBISA k zvitku (pri vedomosti nie je plán, kam ju dať —
// návrh z nákresu, Matej ho schválil celý) · ↗ poslať. Akcia nikdy neodnesie preč.
//
// HOTOVO = prečítal (tlačidlo na konci) ALEBO dopočúval podcast (≥ 90 %).
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { AINUBIS, AI_GLASS, BRAIN_STATE } from '@/components/pack/ainubisSkin';
import { HandPaw, HandStar, HandPlus, HandForward, HandCheck, HandPencil, HandAlert } from '@/components/pack/HandIcons';

/** Kresba z kitu `/icons/pack/` cez masku (ten istý zápis ako v PackAinubis). */
const Ic = ({ ic }: { ic: string }) => (
  <i className="zv-ic" aria-hidden style={{ WebkitMaskImage: `url(/icons/pack/${ic}.svg)`, maskImage: `url(/icons/pack/${ic}.svg)` }} />
);
import { BackButton } from '@/components/pack/BackButton';
import {
  type DemoScroll, pickText, pickPod, sourceHref, fmtSec, scrollLang,
  markScroll, useScrollState, toggleSaved, useSaved,
} from './vaultScrollDemo';

// ── texty rozhrania: základ EN/SK/CZ ako obsah VAULTU ───────────────────────
const UI = {
  sk: {
    scroll: 'Zvitok', min: 'min', read: 'Prečítať znalosť', pod: 'Podcast', src: 'Zdroje',
    sd: 'Sila dôkazu', sdTip: '●●● zmerané a vedci sa zhodujú · ●●○ veda + výklad · ●○○ tradícia, legenda',
    sdName: ['', 'tradícia', 'veda + výklad', 'zmerané'],
    st: ['Nevidené. Videný zvitok zožltne, prečítaný alebo vypočutý zozelenie a rozsvieti sa v mozgu.',
      'Videné. Prečítaj alebo vypočuj a krúžok zozelenie.', 'Hotovo. Znalosť svieti v tvojom mozgu.'],
    like: 'Páči', save: 'Uložiť', use: 'Použiť', share: 'Poslať',
    likeTip: 'Verejné — ostatní uvidia, že sa ti to páči.',
    saveTip: 'Do tvojich znalostí, na policu Uložené. Nikto iný to nevidí.',
    useTip: 'Spýtaj sa AINUBISA na tento zvitok.',
    shareTip: 'Pošli odkaz do správy alebo von z appky.',
    back: 'Späť', podWho: 'Matej sa pýta, AINUBIS odpovedá', added: 'Doplnené',
    addedNone: 'Zatiaľ nič nové. Keď pribudne poznatok, ktorý nie je v podcaste, zapíše sa sem s dátumom.',
    rel: 'Súvisí', contrib: 'Prispej', cAdd: 'Pridať znalosť', cEdit: 'Navrhnúť zmenu', cFlag: 'Nahlásiť chybu',
    done: 'Prečítané — zapíš do mozgu', doneSub: 'krúžok zozelenie a zrno v mozgu sa rozsvieti',
    doneOk: 'Zapísané do mozgu', copied: 'Odkaz skopírovaný',
  },
  cs: {
    scroll: 'Svitek', min: 'min', read: 'Přečíst znalost', pod: 'Podcast', src: 'Zdroje',
    sd: 'Síla důkazu', sdTip: '●●● změřeno a vědci se shodují · ●●○ věda + výklad · ●○○ tradice, legenda',
    sdName: ['', 'tradice', 'věda + výklad', 'změřeno'],
    st: ['Neviděno. Viděný svitek zežloutne, přečtený nebo poslechnutý zezelená a rozsvítí se v mozku.',
      'Viděno. Přečti nebo poslechni a kroužek zezelená.', 'Hotovo. Znalost svítí ve tvém mozku.'],
    like: 'Líbí', save: 'Uložit', use: 'Použít', share: 'Poslat',
    likeTip: 'Veřejné — ostatní uvidí, že se ti to líbí.',
    saveTip: 'Do tvých znalostí, na polici Uložené. Nikdo jiný to nevidí.',
    useTip: 'Zeptej se AINUBISE na tento svitek.',
    shareTip: 'Pošli odkaz do zprávy nebo ven z appky.',
    back: 'Zpět', podWho: 'Matej se ptá, AINUBIS odpovídá', added: 'Doplněno',
    addedNone: 'Zatím nic nového. Když přibude poznatek, který není v podcastu, zapíše se sem s datem.',
    rel: 'Souvisí', contrib: 'Přispěj', cAdd: 'Přidat znalost', cEdit: 'Navrhnout změnu', cFlag: 'Nahlásit chybu',
    done: 'Přečteno — zapiš do mozku', doneSub: 'kroužek zezelená a zrno v mozku se rozsvítí',
    doneOk: 'Zapsáno do mozku', copied: 'Odkaz zkopírován',
  },
  en: {
    scroll: 'Scroll', min: 'min', read: 'Read the knowledge', pod: 'Podcast', src: 'Sources',
    sd: 'Evidence', sdTip: '●●● measured, scientists agree · ●●○ science + interpretation · ●○○ tradition, legend',
    sdName: ['', 'tradition', 'science + interpretation', 'measured'],
    st: ['Not seen. A seen scroll turns orange; read or listened, it turns green and lights up in the brain.',
      'Seen. Read or listen and the ring turns green.', 'Done. This knowledge shines in your brain.'],
    like: 'Like', save: 'Save', use: 'Use', share: 'Send',
    likeTip: 'Public — others will see you like it.',
    saveTip: 'To your knowledge, on the Saved shelf. Nobody else sees it.',
    useTip: 'Ask AINUBIS about this scroll.',
    shareTip: 'Send a link in a message or outside the app.',
    back: 'Back', podWho: 'Matej asks, AINUBIS answers', added: 'Added',
    addedNone: 'Nothing new yet. When a finding that is not in the podcast arrives, it is written here with a date.',
    rel: 'Related', contrib: 'Contribute', cAdd: 'Add knowledge', cEdit: 'Suggest a change', cFlag: 'Report a mistake',
    done: 'Read — write it into the brain', doneSub: 'the ring turns green and the grain lights up',
    doneOk: 'Written into the brain', copied: 'Link copied',
  },
};
export const scrollUI = (lang: string) => UI[scrollLang(lang) as keyof typeof UI];

const dots = (n: number) => '●●●'.slice(0, n) + '○○○'.slice(0, 3 - n);

export const SCROLL_CSS = `
/* KRÚŽOK STAVU — biely obrys · plný oranžový (videné) · zelený s ✓ (hotovo). Farby BRAIN_STATE. */
.zv-st{position:absolute;top:${PACK_SPACE.md}px;right:${PACK_SPACE.md}px;z-index:2;width:24px;height:24px;
  border-radius:${PACK_R.pill}px;display:flex;align-items:center;justify-content:center;cursor:help;
  border:2px solid ${AINUBIS.inkDim};background:rgba(3,7,12,0.55);color:#03140A;}
.zv-st[data-s="1"]{border-color:rgb(${BRAIN_STATE.seen});background:rgb(${BRAIN_STATE.seen});}
.zv-st[data-s="2"]{border-color:rgb(${BRAIN_STATE.read});background:rgb(${BRAIN_STATE.read});}
.zv-tip{position:absolute;z-index:5;width:240px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  background:${AINUBIS.surfaceBase};border:1px solid ${AINUBIS.edge};color:${AINUBIS.ink};text-align:left;
  font:400 ${PACK_TEXT.label}px/1.5 ${FONT_UI};letter-spacing:0;text-transform:none;pointer-events:none;
  opacity:0;transition:opacity 150ms ease;}
.zv-st .zv-tip{top:32px;right:0;}
.zv-st:hover .zv-tip,.zv-st:focus-visible .zv-tip,.zv-act:hover .zv-tip,.zv-act:focus-visible .zv-tip{opacity:1;}
/* ŠTVORICA so slovami — pod obrazom na PC aj mobile (Matej 3. 10.) */
.zv-acts{display:flex;justify-content:space-between;gap:${PACK_SPACE.xs}px;padding-top:${PACK_SPACE.sm}px;}
.zv-act{position:relative;flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.xs}px;
  background:none;border:0;padding:0;cursor:pointer;color:${AINUBIS.ink};font-family:${FONT_UI};}
.zv-act i{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:${PACK_R.pill}px;
  background:${AINUBIS.surface};border:1px solid ${AINUBIS.edge};}
.zv-act:hover i{color:${AINUBIS.cyan};border-color:${AINUBIS.edgeStrong};}
.zv-act.is-on i{color:${AINUBIS.ctaA};border-color:${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};}
.zv-act small{font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkDim};}
.zv-act .zv-tip{top:56px;left:50%;transform:translateX(-50%);width:200px;}
/* SILA DÔKAZU */
.zv-sd{position:relative;display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;
  border-radius:${PACK_R.pill}px;border:1px solid ${AINUBIS.edge};font-size:${PACK_TEXT.micro}px;color:${AINUBIS.ink};cursor:help;}
.zv-sd em{font-style:normal;letter-spacing:.14em;color:rgb(${BRAIN_STATE.read});}
.zv-sd .zv-tip{top:28px;left:0;}
.zv-sd:hover .zv-tip{opacity:1;}
/* „Vezmi si z toho" — blok bez nadpisu (Matej: „nechaj to v bloku"), menšie písmo. */
.zv-take{align-self:stretch;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  background:${AINUBIS.ctaTint};border-left:2px solid ${AINUBIS.ctaA};
  font-size:${PACK_TEXT.label}px;line-height:1.5;color:${AINUBIS.ink};font-style:italic;}
/* Kurzíva — Matej 3. 10.: „nech je to trošku zaujímavejšie“. ⚠️ Space Grotesk kurzívu nemá, prehliadač ju šikmí sám. */

/* ── ČLÁNOK ZVITKU (kôš 2) ── */
.zv-veil{--zv-read:rgb(${BRAIN_STATE.read});position:fixed;inset:0;z-index:39;overflow-y:auto;-webkit-overflow-scrolling:touch;
  background:${AINUBIS.surfaceBase};color:${AINUBIS.ink};font-family:${FONT_UI};}
.zv-wrap{max-width:832px;margin:0 auto;padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px calc(var(--pack-nav-h, 112px) + ${PACK_SPACE.xl}px);}
.zv-back{margin-bottom:${PACK_SPACE.md}px;}
.zv-top{display:grid;grid-template-columns:1fr;gap:${PACK_SPACE.lg}px;}
@media (min-width:768px){.zv-top{grid-template-columns:280px 1fr;}}
.zv-hero img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${PACK_R.tile}px;}
.zv-head{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:${PACK_SPACE.sm}px;min-width:0;}
.zv-head .zv-st{top:0;right:0;}
.zv-meta{font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.cyan};padding-right:${PACK_SPACE.xl}px;}
.zv-h{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;line-height:1.2;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;overflow-wrap:anywhere;}
.zv-v{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.6;color:${AINUBIS.inkDim};}
.zv-pod{align-self:stretch;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;${AI_GLASS}}
.zv-pod small{display:block;margin-bottom:${PACK_SPACE.sm}px;font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkDim};}
.zv-pod audio{display:block;width:100%;height:40px;}
.zv-body{margin-top:${PACK_SPACE.xl}px;max-width:760px;font-size:${PACK_TEXT.lead}px;line-height:1.75;}
.zv-body p{margin:0 0 ${PACK_SPACE.md}px;}
.zv-body ul{margin:0 0 ${PACK_SPACE.md}px;padding-left:${PACK_SPACE.lg}px;}
.zv-body li{margin-bottom:${PACK_SPACE.xs}px;}
.zv-sec{margin:${PACK_SPACE.xl}px 0 ${PACK_SPACE.sm}px;font-size:${PACK_TEXT.micro}px;font-weight:500;
  letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.cyan};}
.zv-body h3.zv-sec{font-family:${FONT_UI};}
.zv-add{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-left:2px solid ${AINUBIS.cyan};border-radius:0 ${PACK_R.tile}px ${PACK_R.tile}px 0;
  background:${AINUBIS.raised};font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkDim};}
.zv-src{margin:0;padding-left:${PACK_SPACE.lg}px;font-size:${PACK_TEXT.label}px;line-height:1.55;color:${AINUBIS.inkDim};}
.zv-src li{margin-bottom:${PACK_SPACE.xs}px;}
.zv-src a{color:${AINUBIS.cyan};}
.zv-rel{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.zv-chip{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;cursor:pointer;
  background:transparent;border:1px solid ${AINUBIS.edge};color:${AINUBIS.cyan};font:500 ${PACK_TEXT.label}px ${FONT_UI};}
.zv-chip:hover{border-color:${AINUBIS.edgeStrong};}
.zv-chip--dash{border-style:dashed;}
.zv-done{display:block;width:100%;margin-top:${PACK_SPACE.xl}px;padding:${PACK_SPACE.md}px;cursor:pointer;text-align:center;
  border-radius:${PACK_R.tile}px;background:transparent;border:1px solid var(--zv-read);color:var(--zv-read);}
.zv-done b{display:block;font:700 ${PACK_TEXT.label}px ${FONT_TITLE};letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.zv-done small{font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkDim};}
.zv-done.is-done{background:rgba(${BRAIN_STATE.read},0.14);cursor:default;}
.zv-ic{display:inline-block;width:14px;height:14px;vertical-align:-2px;margin-right:${PACK_SPACE.xs}px;background:currentColor;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain;}
.zv-chip svg{vertical-align:-2px;margin-right:${PACK_SPACE.xs}px;}
.zv-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--pack-nav-h, 112px) + ${PACK_SPACE.md}px);z-index:41;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;background:${AINUBIS.surfaceBase};
  border:1px solid ${AINUBIS.edge};font-size:${PACK_TEXT.label}px;color:${AINUBIS.ink};}
`;

export function StateDot({ s, lang }: { s: 0 | 1 | 2; lang: string }) {
  const u = scrollUI(lang);
  return (
    <span className="zv-st" data-s={s} tabIndex={0} aria-label={u.st[s]}>
      {s === 2 && <HandCheck size={12} />}
      <span className="zv-tip" role="tooltip">{u.st[s]}</span>
    </span>
  );
}

export function EvidenceBadge({ sd, lang }: { sd: number; lang: string }) {
  const u = scrollUI(lang);
  if (!sd) return null;
  return (
    <span className="zv-sd" tabIndex={0}>
      {u.sd} <em>{dots(sd)}</em> {u.sdName[sd]}
      <span className="zv-tip" role="tooltip">{u.sdTip}</span>
    </span>
  );
}

export function ScrollActions({ id, lang, onUse, onShare }: {
  id: string; lang: string; onUse: () => void; onShare: () => void;
}) {
  const u = scrollUI(lang);
  const saved = useSaved().includes(id);
  const [liked, setLiked] = useState(false);
  const act = (key: string, icon: ReactNode, label: string, tip: string, onClick: () => void, on = false) => (
    <button key={key} type="button" className={`zv-act${on ? ' is-on' : ''}`} onClick={onClick} aria-label={label}>
      <i>{icon}</i><small>{label}</small><span className="zv-tip" role="tooltip">{tip}</span>
    </button>
  );
  return (
    <div className="zv-acts">
      {act('like', <HandPaw size={14} />, u.like, u.likeTip, () => setLiked(v => !v), liked)}
      {act('save', <HandStar size={14} />, u.save, u.saveTip, () => toggleSaved(id), saved)}
      {act('use', <HandPlus size={14} />, u.use, u.useTip, onUse)}
      {act('share', <HandForward size={14} />, u.share, u.shareTip, onShare)}
    </div>
  );
}

/** Karta zvitku v zozname. Videné = karta aspoň 2 s z polovice na obrazovke. */
export function ScrollCard({ z, lang, onOpen, onUse, onShare }: {
  z: DemoScroll; lang: string;
  onOpen: (id: string, focus?: 'pod' | 'src') => void; onUse: () => void; onShare: (id: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const s = useScrollState()[z.id] || 0;
  const x = pickText(z, lang);
  const pod = pickPod(z, lang);
  const u = scrollUI(lang);
  useEffect(() => {
    const el = ref.current;
    if (!el || s >= 1) return;
    let t = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(t);
      if (e.isIntersecting) t = window.setTimeout(() => markScroll(z.id, 1), 2000);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, [z.id, s]);
  return (
    <article ref={ref} className="akv-zv">
      <StateDot s={s} lang={lang} />
      <div className="akv-zvimg">
        {z.img && <img src={z.img} alt="" loading="lazy" onClick={() => onOpen(z.id)} />}
        <ScrollActions id={z.id} lang={lang} onUse={onUse} onShare={() => onShare(z.id)} />
      </div>
      <div className="akv-zvt">
        <span className="akv-zvlbl">
          {u.scroll} {z.n} / {z.total} · {x.min} {u.min}{pod ? ` · ${u.pod} ${fmtSec(pod.sec)}` : ''}
        </span>
        <h3 className="akv-zvn">{x.t}</h3>
        <EvidenceBadge sd={z.sd} lang={lang} />
        {x.vz && <div className="zv-take">{x.vz}</div>}
        <button type="button" className="akv-zvcta" onClick={() => onOpen(z.id)}>{u.read}</button>
        <div className="akv-zvrow">
          {pod && <button type="button" className="akv-zvsec" onClick={() => onOpen(z.id, 'pod')}><Ic ic="play" />{u.pod}</button>}
          {z.zdroje.length > 0 && (
            <button type="button" className="akv-zvsec" onClick={() => onOpen(z.id, 'src')}><Ic ic="document" />{u.src} · {z.zdroje.length}</button>
          )}
        </div>
      </div>
    </article>
  );
}

/** Telo príbehu: „▸ " = medzinadpis, riadky „– " = zoznam. */
function StoryBody({ d }: { d: string }) {
  const blocks = d.split(/\n\n+/);
  return (
    <>
      {blocks.map((b, i) => {
        if (b.startsWith('▸')) return <h3 key={i} className="zv-sec">{b.replace(/^▸\s*/, '')}</h3>;
        const lines = b.split('\n');
        const list = lines.filter(l => /^[–-]\s/.test(l));
        if (list.length) {
          const head = lines.filter(l => !/^[–-]\s/.test(l));
          return (
            <div key={i}>
              {head.length > 0 && <p>{head.join(' ')}</p>}
              <ul>{list.map((l, j) => <li key={j}>{l.replace(/^[–-]\s/, '')}</li>)}</ul>
            </div>
          );
        }
        return <p key={i}>{b}</p>;
      })}
    </>
  );
}

/** Článok zvitku — vrstva nad VAULTOM s vlastnou adresou. */
export function ScrollView({ z, all, lang, focus, onClose, onOpen, onUse, onShare }: {
  z: DemoScroll; all: DemoScroll[]; lang: string; focus?: string | null;
  onClose: () => void; onOpen: (id: string) => void; onUse: () => void; onShare: (id: string) => void;
}) {
  const u = scrollUI(lang);
  const x = pickText(z, lang);
  const pod = pickPod(z, lang);
  const s = useScrollState()[z.id] || 0;
  const veil = useRef<HTMLDivElement>(null);
  const podRef = useRef<HTMLDivElement>(null);
  const srcRef = useRef<HTMLHeadingElement>(null);

  // Otvorenie článku = videné. Telo pod vrstvou nescrolluje (kôš 2, ako StoryView).
  useEffect(() => { markScroll(z.id, 1); }, [z.id]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => {
    veil.current?.scrollTo({ top: 0 });
    const el = focus === 'pod' ? podRef.current : focus === 'src' ? srcRef.current : null;
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }, [z.id, focus]);

  const onTime = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const a = e.currentTarget;
    if (a.duration && a.currentTime / a.duration >= 0.9) markScroll(z.id, 2);
  };

  return (
    <div className="zv-veil" ref={veil} role="dialog" aria-modal="true" aria-label={x.t}>
      <div className="zv-wrap">
        <BackButton tone="pale" onClick={onClose} label={u.back} className="zv-back" />
        <div className="zv-top">
          <div className="zv-hero">
            {z.img && <img src={z.img} alt="" />}
            <ScrollActions id={z.id} lang={lang} onUse={onUse} onShare={() => onShare(z.id)} />
          </div>
          <div className="zv-head">
            <StateDot s={s} lang={lang} />
            <span className="zv-meta">{z.circle} · {u.scroll} {z.n}/{z.total} · {x.min} {u.min}</span>
            <h1 className="zv-h">{x.t}</h1>
            <EvidenceBadge sd={z.sd} lang={lang} />
            <p className="zv-v">{x.v}</p>
            {x.vz && <div className="zv-take">{x.vz}</div>}
            {pod && (
              <div className="zv-pod" ref={podRef}>
                <small><Ic ic="play" />{u.podWho} · {fmtSec(pod.sec)}</small>
                <audio controls preload="none" src={pod.src} onTimeUpdate={onTime} onEnded={() => markScroll(z.id, 2)} />
              </div>
            )}
          </div>
        </div>

        <div className="zv-body">
          <StoryBody d={x.d} />

          <h3 className="zv-sec">{u.added}</h3>
          {z.doplnene.length
            ? z.doplnene.map((a, i) => <div key={i} className="zv-add"><b>{a.date}</b> · {a.text}</div>)
            : <div className="zv-add">{u.addedNone}</div>}

          {z.zdroje.length > 0 && <>
            <h3 className="zv-sec" ref={srcRef}>{u.src} · {z.zdroje.length}</h3>
            <ol className="zv-src">
              {z.zdroje.map((r, i) => {
                const href = sourceHref(r);
                return (
                  <li key={i}>
                    <b>{r.a}</b> ({r.r}) · {r.t} · <i>{r.j}</i>
                    {href && <> · <a href={href} target="_blank" rel="noopener noreferrer">{r.doi ? 'doi' : 'link'}</a></>}
                  </li>
                );
              })}
            </ol>
          </>}

          {z.rel.length > 0 && <>
            <h3 className="zv-sec">{u.rel}</h3>
            <div className="zv-rel">
              {z.rel.map(id => {
                const r = all.find(a => a.id === id);
                return r ? <button key={id} type="button" className="zv-chip" onClick={() => onOpen(id)}>{pickText(r, lang).t} ›</button> : null;
              })}
            </div>
          </>}

          <h3 className="zv-sec">{u.contrib}</h3>
          <div className="zv-rel">
            <button type="button" className="zv-chip zv-chip--dash" onClick={onUse}><HandPlus size={12} />{u.cAdd}</button>
            <button type="button" className="zv-chip zv-chip--dash" onClick={onUse}><HandPencil size={12} />{u.cEdit}</button>
            <button type="button" className="zv-chip zv-chip--dash" onClick={onUse}><HandAlert size={12} />{u.cFlag}</button>
          </div>

          <button type="button" className={`zv-done${s === 2 ? ' is-done' : ''}`} onClick={() => markScroll(z.id, 2)}>
            <b>{s === 2 && <HandCheck size={12} />} {s === 2 ? u.doneOk : u.done}</b>
            {s !== 2 && <small>{u.doneSub}</small>}
          </button>
        </div>
      </div>
    </div>
  );
}
