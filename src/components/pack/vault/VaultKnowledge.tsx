// ════════════════════════════════════════════════════════════════════════════
// MOJE ZNALOSTI — štatistiky VAULTU po kliku na fotku v hlavičke AINUBISA (4. 10. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 4. 10.: *„ainubis stats po kliknutí na fotku — proste logika ako pri tripoch,
// kde budú štatistiky, obľúbené zvitky, prečítané, vypočuté, % atď. a vymyslíme aj odznaky"*.
// Meno: *„stats ok, alebo by sme to dali inak? knowledge? neviem"* ⇒ MOJE ZNALOSTI — to isté
// meno už nesie nákres zvitku v2 §3 (3. 10.), ktorý Matej odklepol, a polica „Uložené" doň patrí.
//
// Vzor = TRIPSTATS (`/pack/map/triplist?tab=stats`): hlavička identity → veľké čísla →
// postup po svetoch → odznaky → zoznamy. Šat AINUBISA (AI-PALUBA), vrstva ako článok
// zvitku (kôš 2, vlastná adresa `/pack/ainubis/knowledge`, lišta ostáva).
//
// Všetko sa RÁTA z `vault_reads` + `vault_requests` — žiadne číslo sa tu nepíše rukou.
// Menovatele (zvitky sveta) sú z registra rozpadu (`VAULT_WORLDS`), rovnako ako v hlavičke.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef } from 'react';
import { PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI, PROGRESS_CSS, MEDALLION_CSS, PACK_AVATAR } from '@/components/pack/packTheme';
import { AINUBIS, AI_GLASS, BRAIN_STATE, WORLD_TINT } from '@/components/pack/ainubisSkin';
import { BackButton } from '@/components/pack/BackButton';
import { HandCheck, HandHeart, HandStar } from '@/components/pack/HandIcons';
import { VAULT_WORLDS } from './worlds';
import { VAULT_CIRCLES } from './circles';
import { VAULT_BADGES } from './vaultBadges';
import { type DemoScroll, type ReadRow, pickText, scrollLang, fmtSec, useReads, useMyRequests } from './vaultScrolls';

type Lang = 'sk' | 'cs' | 'en';
const UI = {
  sk: {
    title: 'Moje znalosti', back: 'Späť', eyebrow: 'AINUBIS · VAULT',
    read: 'prečítaných zvitkov', listened: 'vypočutých podcastov', minutes: 'min počúvania',
    vault: 'celého VAULTU', worldsLit: 'svetov rozsvietených',
    worlds: 'Svety', circles: 'Otvorené okruhy', badges: 'Odznaky', more: 'ešte', got: 'Získaný',
    going: 'Rozpočúvané', liked: 'Obľúbené', saved: 'Uložené', mine: 'Moje príspevky',
    noneLiked: 'Srdiečko na zvitku ho pridá sem.', noneSaved: 'Hviezdička na zvitku ho odloží sem.',
    noneMine: 'Návrh zmeny alebo žiadosť o jazyk sa zapíše sem — aj s tým, ako ho AINUBIS posúdil.',
    noneGoing: '', soon: 'otvárame postupne', draft: 'Návrh odznakov — mená a míľniky ešte nie sú schválené.',
    kinds: { lang: 'Žiadosť o jazyk', add: 'Nová znalosť', wrong: 'Chybné tvrdenie', own: 'Vlastný text' },
    status: { new: 'čaká na AINUBISA', accepted: 'prijaté', rejected: 'zamietnuté', done: 'hotové' },
    states: ['nevidené', 'videné', 'hotové'],
  },
  cs: {
    title: 'Moje znalosti', back: 'Zpět', eyebrow: 'AINUBIS · VAULT',
    read: 'přečtených svitků', listened: 'poslechnutých podcastů', minutes: 'min poslechu',
    vault: 'celého VAULTU', worldsLit: 'rozsvícených světů',
    worlds: 'Světy', circles: 'Otevřené okruhy', badges: 'Odznaky', more: 'ještě', got: 'Získaný',
    going: 'Rozposlouchané', liked: 'Oblíbené', saved: 'Uložené', mine: 'Moje příspěvky',
    noneLiked: 'Srdíčko na svitku ho přidá sem.', noneSaved: 'Hvězdička na svitku ho odloží sem.',
    noneMine: 'Návrh změny nebo žádost o jazyk se zapíše sem — i s tím, jak ho AINUBIS posoudil.',
    noneGoing: '', soon: 'otevíráme postupně', draft: 'Návrh odznaků — jména a milníky ještě nejsou schválené.',
    kinds: { lang: 'Žádost o jazyk', add: 'Nová znalost', wrong: 'Chybné tvrzení', own: 'Vlastní text' },
    status: { new: 'čeká na AINUBISE', accepted: 'přijato', rejected: 'zamítnuto', done: 'hotovo' },
    states: ['neviděné', 'viděné', 'hotové'],
  },
  en: {
    title: 'My knowledge', back: 'Back', eyebrow: 'AINUBIS · VAULT',
    read: 'scrolls read', listened: 'podcasts heard', minutes: 'min listened',
    vault: 'of the whole VAULT', worldsLit: 'worlds lit',
    worlds: 'Worlds', circles: 'Open circles', badges: 'Badges', more: 'to go', got: 'Earned',
    going: 'Still listening', liked: 'Favourites', saved: 'Saved', mine: 'My contributions',
    noneLiked: 'A heart on a scroll adds it here.', noneSaved: 'A star on a scroll keeps it here.',
    noneMine: 'A suggested change or a language request lands here — with AINUBIS’s verdict.',
    noneGoing: '', soon: 'opening step by step', draft: 'Badge draft — names and milestones are not approved yet.',
    kinds: { lang: 'Language request', add: 'New knowledge', wrong: 'Wrong claim', own: 'Own text' },
    status: { new: 'waiting for AINUBIS', accepted: 'accepted', rejected: 'declined', done: 'done' },
    states: ['unseen', 'seen', 'done'],
  },
};

const isDone = (r?: ReadRow) => !!(r && (r.read_at || r.listened_at));
/** Šírka výplne PROGRESU (recept `.pk-progress`) — podiel 0…1 na percentá. */
const fill = (part: number) => {
  const w = `${Math.round(Math.min(1, Math.max(0, part)) * 100)}%`;
  return { width: w };
};

export const KNOW_CSS = `
${PROGRESS_CSS}
${MEDALLION_CSS}
.vk .pk-progress{background:${AINUBIS.surface};}
.vk-head{display:flex;align-items:center;gap:${PACK_SPACE.lg}px;margin-top:${PACK_SPACE.md}px;}
.vk-head .pk-medallion{border-color:${AINUBIS.edgeStrong};background:${AINUBIS.faceBg};color:${AINUBIS.ctaA};
  font:700 ${PACK_TEXT.h2}px ${FONT_TITLE};}
.vk-head > div{display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;min-width:0;}
.vk-who{font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkDim};}
/* VEĽKÉ ČÍSLA — ako svetové štatistiky v TRIPSTATS */
.vk-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.xl}px;}
@media (min-width:768px){.vk-kpis{grid-template-columns:repeat(4,minmax(0,1fr));}}
.vk-kpi{padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;${AI_GLASS}display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.vk-kpi b{font:700 ${PACK_TEXT.h1}px/1 ${FONT_TITLE};color:${AINUBIS.ink};}
.vk-kpi b small{font-size:${PACK_TEXT.body}px;color:${AINUBIS.inkFaint};}
.vk-kpi span{font-size:${PACK_TEXT.label}px;line-height:1.35;color:${AINUBIS.inkDim};}
.vk-kpi i{font-style:normal;font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkFaint};}
.vk-kpi--read b{color:rgb(${BRAIN_STATE.read});}
/* SVETY */
.vk-world{display:grid;grid-template-columns:20px 1fr auto;align-items:center;gap:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;padding:${PACK_SPACE.sm}px 0;}
.vk-world + .vk-world{border-top:1px solid ${AINUBIS.edge};}
.vk-world .zv-ic{width:20px;height:20px;margin:0;color:rgb(var(--vk-w));}
.vk-world em{font-style:normal;font-size:${PACK_TEXT.body}px;color:${AINUBIS.ink};}
.vk-world small{font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkFaint};font-variant-numeric:tabular-nums;}
.vk-world .pk-progress{grid-column:2 / 4;}
.vk-world .pk-progress__fill{background:rgb(var(--vk-w));}
/* OKRUH — rad zŕn, jedno na zvitok (farby BRAIN_STATE ako v mozgu) */
.vk-circle{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px 0;}
.vk-circle header{display:flex;justify-content:space-between;gap:${PACK_SPACE.sm}px;font-size:${PACK_TEXT.body}px;color:${AINUBIS.ink};}
.vk-circle header small{font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkFaint};}
.vk-dots{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.vk-dot{width:28px;height:28px;border-radius:${PACK_R.pill}px;cursor:pointer;padding:0;display:inline-flex;align-items:center;justify-content:center;
  font:600 ${PACK_TEXT.micro}px ${FONT_UI};color:${AINUBIS.inkDim};background:transparent;border:1px solid ${AINUBIS.edge};}
.vk-dot[data-s="1"]{border-color:rgb(${BRAIN_STATE.seen});color:rgb(${BRAIN_STATE.seen});}
.vk-dot[data-s="2"]{background:rgb(${BRAIN_STATE.read});border-color:rgb(${BRAIN_STATE.read});color:${AINUBIS.bgDeep};}
/* ODZNAKY — mriežka ako HeroBadges: získaný svieti, zamknutý je tichý s „ešte N" */
.vk-badges{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${PACK_SPACE.sm}px;}
@media (min-width:640px){.vk-badges{grid-template-columns:repeat(4,minmax(0,1fr));}}
.vk-badge{display:flex;flex-direction:column;align-items:center;text-align:center;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.sm}px;
  border-radius:${PACK_R.tile}px;background:${AINUBIS.surface};border:1px solid ${AINUBIS.edge};}
.vk-badge .vk-bic{width:56px;height:56px;border-radius:${PACK_R.pill}px;display:inline-flex;align-items:center;justify-content:center;
  background:${AINUBIS.raised};border:1px solid ${AINUBIS.edge};color:${AINUBIS.inkFaint};}
.vk-badge .vk-bic i{display:block;width:28px;height:28px;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
.vk-badge b{font:700 ${PACK_TEXT.label}px ${FONT_TITLE};letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkDim};}
.vk-badge small{font-size:${PACK_TEXT.micro}px;line-height:1.4;color:${AINUBIS.inkFaint};}
.vk-badge .pk-progress{height:4px;margin-top:${PACK_SPACE.xs}px;}
.vk-badge.is-got{border-color:${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};}
.vk-badge.is-got .vk-bic{background:${AINUBIS.ctaGrad};border-color:${AINUBIS.ctaA};color:${AINUBIS.ctaInk};filter:drop-shadow(0 0 6px rgba(${AINUBIS.ctaRGB},0.45));}
.vk-badge.is-got b{color:${AINUBIS.ctaA};}
.vk-draft{margin:${PACK_SPACE.sm}px 0 0;font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkFaint};}
/* ZOZNAM ZVITKOV — riadok s náhľadom 3:4 */
.vk-list{display:flex;flex-direction:column;}
.vk-row{display:flex;align-items:center;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.sm}px 0;cursor:pointer;background:none;border:0;
  border-bottom:1px solid ${AINUBIS.edge};text-align:left;color:${AINUBIS.ink};font-family:${FONT_UI};}
.vk-row:last-child{border-bottom:0;}
.vk-row img{flex:none;width:42px;aspect-ratio:3/4;object-fit:cover;border-radius:${PACK_R.field}px;}
.vk-row > span{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px;}
.vk-row em{font-style:normal;font-size:${PACK_TEXT.body}px;line-height:1.35;}
.vk-row small{font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkFaint};}
.vk-row .vk-ok{flex:none;color:rgb(${BRAIN_STATE.read});}
.vk-row .pk-progress{height:4px;margin-top:${PACK_SPACE.xs}px;}
.vk-none{font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkFaint};}
.vk-req{padding:${PACK_SPACE.sm}px 0;border-bottom:1px solid ${AINUBIS.edge};font-size:${PACK_TEXT.body}px;}
.vk-req:last-child{border-bottom:0;}
.vk-req small{display:block;font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkFaint};}
.vk-req p{margin:${PACK_SPACE.xs}px 0 0;color:${AINUBIS.inkDim};}
.vk .zv-box h3{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
.vk .zv-box h3 svg{flex:none;}
`;

export function VaultKnowledge({ scrolls, lang, avatarUrl, avatarInitial, who, worldName, onClose, onOpen }: {
  scrolls: DemoScroll[]; lang: string; avatarUrl: string | null; avatarInitial: string; who: string;
  /** Meno sveta z i18n (`pack.ainubis.world.<key>`) — to isté, čo píše mozog. */
  worldName: (key: string) => string;
  onClose: () => void; onOpen: (id: string) => void;
}) {
  const L = scrollLang(lang) as Lang;
  const u = UI[L];
  const reads = useReads();
  const requests = useMyRequests();
  const veil = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const s = useMemo(() => {
    const rows = Object.values(reads);
    const byId = new Map(scrolls.map((z) => [z.id, z]));
    const done = rows.filter(isDone);
    const listened = rows.filter((r) => r.listened_at);
    const sec = rows.reduce((a, r) => a + (r.listen_sec || 0), 0);
    const total = VAULT_WORLDS.reduce((a, w) => a + w.scrolls, 0);
    const doneBy = (key: string) => done.filter((r) => byId.get(r.scroll_id)?.world === key).length;
    const worlds = VAULT_WORLDS.map((w) => ({ w, n: doneBy(w.key) }));
    // otvorené okruhy = tie, ktoré už majú zvitky v DB
    const circles = new Map<string, DemoScroll[]>();
    for (const z of scrolls) circles.set(`${z.world}-${z.okruh}`, [...(circles.get(`${z.world}-${z.okruh}`) || []), z]);
    const going = rows
      .filter((r) => r.listen_sec > 0 && !r.listened_at && byId.get(r.scroll_id))
      .map((r) => {
        const z = byId.get(r.scroll_id)!;
        const pod = z.pod[r.listen_langs[r.listen_langs.length - 1]] || Object.values(z.pod)[0];
        return { z, r, pct: pod?.sec ? Math.min(100, Math.round((r.listen_sec / pod.sec) * 100)) : 0, len: pod?.sec || 0 };
      });
    const pick = (f: (r: ReadRow) => boolean) => rows.filter(f).sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
      .map((r) => byId.get(r.scroll_id)).filter(Boolean) as DemoScroll[];
    return {
      done: done.length, listened: listened.length, min: Math.round(sec / 60), total,
      pct: done.length ? Math.max(1, Math.round((done.length / total) * 100)) : 0,
      worlds, lit: worlds.filter((x) => x.n > 0).length, circles: [...circles.values()], going,
      liked: pick((r) => r.liked), saved: pick((r) => r.saved),
      badges: VAULT_BADGES.map((b) => ({ b, have: b.have({ reads: rows, scrolls, requests }) })),
    };
  }, [reads, scrolls, requests]);

  const cName = (z: DemoScroll) => {
    const c = VAULT_CIRCLES[z.world]?.[z.okruh - 1];
    return c ? (L === 'en' ? c.en : c.sk) : z.circle;
  };
  const row = (z: DemoScroll, extra?: React.ReactNode) => {
    const r = reads[z.id];
    return (
      <button key={z.id} type="button" className="vk-row" onClick={() => onOpen(z.id)}>
        {z.img && <img src={z.img} alt="" loading="lazy" />}
        <span><em>{pickText(z, lang).t}</em><small>{cName(z)} · {z.n}/{z.total}</small>{extra}</span>
        {isDone(r) && <span className="vk-ok"><HandCheck size={16} /></span>}
      </button>
    );
  };
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(L === 'cs' ? 'cs-CZ' : L === 'sk' ? 'sk-SK' : 'en-GB');

  return (
    <div className="zv-veil" ref={veil} role="dialog" aria-modal="true" aria-label={u.title}>
      <div className="zv-bg" aria-hidden />
      <div className="zv-wrap pk-stage vk">
        <BackButton tone="ainubis" onClick={onClose} label={u.back} className="zv-back" />
        <header className="vk-head">
          <span className="pk-medallion pk-medallion--md" style={{ width: PACK_AVATAR.md, height: PACK_AVATAR.md }}>
            {avatarUrl ? <img src={avatarUrl} alt="" /> : avatarInitial}
          </span>
          <div>
            <span className="zv-meta">{u.eyebrow}</span>
            <h1 className="zv-h">{u.title}</h1>
            {who && <span className="vk-who">{who}</span>}
          </div>
        </header>

        <div className="vk-kpis">
          <div className="vk-kpi vk-kpi--read"><b>{s.done}<small> / {s.total}</small></b><span>{u.read}</span></div>
          <div className="vk-kpi"><b>{s.listened}</b><span>{u.listened}</span><i>{s.min} {u.minutes}</i></div>
          <div className="vk-kpi"><b>{s.pct} %</b><span>{u.vault}</span></div>
          <div className="vk-kpi"><b>{s.lit}<small> / {VAULT_WORLDS.length}</small></b><span>{u.worldsLit}</span></div>
        </div>

        {s.circles.length > 0 && (
          <section className="zv-box">
            <h3 className="zv-sec">{u.circles}</h3>
            {s.circles.map((list) => {
              const n = list.filter((z) => isDone(reads[z.id])).length;
              return (
                <div key={`${list[0].world}-${list[0].okruh}`} className="vk-circle">
                  <header><span>{worldName(list[0].world)} · {cName(list[0])}</span><small>{n} / {list[0].total}</small></header>
                  <div className="vk-dots">
                    {list.map((z) => {
                      const r = reads[z.id];
                      const st = isDone(r) ? 2 : r?.seen_at ? 1 : 0;
                      return <button key={z.id} type="button" className="vk-dot" data-s={st} title={`${pickText(z, lang).t} · ${u.states[st]}`}
                        aria-label={`${pickText(z, lang).t} · ${u.states[st]}`} onClick={() => onOpen(z.id)}>{z.n}</button>;
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <section className="zv-box">
          <h3 className="zv-sec">{u.worlds}</h3>
          {s.worlds.map(({ w, n }) => (
            <div key={w.key} className="vk-world" style={{ ['--vk-w' as string]: WORLD_TINT[w.key] || AINUBIS.cyanRGB }}>
              <i className="zv-ic" aria-hidden style={{ WebkitMaskImage: `url(/icons/pack/${w.ic}.svg)`, maskImage: `url(/icons/pack/${w.ic}.svg)` }} />
              <em>{worldName(w.key)}</em>
              <small>{n} / {w.scrolls}</small>
              <div className="pk-progress"><div className="pk-progress__fill" style={fill(n / Math.max(1, w.scrolls))} /></div>
            </div>
          ))}
        </section>

        <section className="zv-box">
          <h3 className="zv-sec">{u.badges} · {s.badges.filter((x) => x.have >= x.b.goal).length} / {s.badges.length}</h3>
          <div className="vk-badges">
            {s.badges.map(({ b, have }) => {
              const got = have >= b.goal;
              return (
                <div key={b.id} className={`vk-badge${got ? ' is-got' : ''}`} title={b.how[L]}>
                  <span className="vk-bic"><i style={{ ['--ic' as string]: `url(/icons/pack/${b.ic}.svg)` }} /></span>
                  <b>{b.name[L]}</b>
                  <small>{got ? u.got : `${u.more} ${b.goal - have}`} · {b.how[L]}</small>
                  {!got && b.goal > 1 && <div className="pk-progress"><div className="pk-progress__fill" style={fill(have / b.goal)} /></div>}
                </div>
              );
            })}
          </div>
          <p className="vk-draft">{u.draft}</p>
        </section>

        {s.going.length > 0 && (
          <section className="zv-box">
            <h3 className="zv-sec">{u.going}</h3>
            <div className="vk-list">
              {s.going.map(({ z, r, pct, len }) => row(z, (
                <>
                  <small>{fmtSec(Math.min(r.listen_sec, len))} / {fmtSec(len)} · {pct} %</small>
                  <div className="pk-progress"><div className="pk-progress__fill" style={fill(pct / 100)} /></div>
                </>
              )))}
            </div>
          </section>
        )}

        <section className="zv-box">
          <h3 className="zv-sec"><HandHeart size={16} on />{u.liked} · {s.liked.length}</h3>
          {s.liked.length ? <div className="vk-list">{s.liked.map((z) => row(z))}</div> : <p className="vk-none">{u.noneLiked}</p>}
        </section>

        <section className="zv-box">
          <h3 className="zv-sec"><HandStar size={16} filled />{u.saved} · {s.saved.length}</h3>
          {s.saved.length ? <div className="vk-list">{s.saved.map((z) => row(z))}</div> : <p className="vk-none">{u.noneSaved}</p>}
        </section>

        <section className="zv-box zv-box--you">
          <h3 className="zv-sec">{u.mine} · {requests.length}</h3>
          {requests.length ? requests.map((q) => {
            const z = scrolls.find((x) => x.id === q.scroll_id);
            return (
              <div key={q.id} className="vk-req">
                <small>{u.kinds[q.kind]}{q.lang ? ` · ${q.lang.toUpperCase()}` : ''} · {fmtDate(q.created_at)} · {u.status[q.status as keyof typeof u.status] || q.status}</small>
                {z && <b>{pickText(z, lang).t}</b>}
                {q.body && <p>{q.body}</p>}
              </div>
            );
          }) : <p className="vk-none">{u.noneMine}</p>}
        </section>
      </div>
    </div>
  );
}
