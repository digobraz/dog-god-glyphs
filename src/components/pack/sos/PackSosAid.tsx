// SOS → PRVÁ POMOC (Matej 16.–17. 11. 2026, klikací nákres plany/nakresy/prva-pomoc-2026-11-16, obsah plany/prva-pomoc/obsah.md).
//   `/pack/sos/prva-pomoc`      rozcestník: IDE O MINÚTY (červené) · PRÍRODA · ÚRAZY · POMOCNÉ KARTY
//   `/pack/sos/prva-pomoc/:id`  karta: kresba · voľné fotky · kedy k veterinárovi · kroky (variant A, ťuk odškrtne) · NIKDY · bez signálu
// Kôš 3 (SosTaskShell, bez spodnej lišty). Dole prilepené jediné CTA do zoznamu pohotovostí — nevolá priamo, číslo vyberá človek.
// CTA je červené len na kartách IDE O MINÚTY, inde lapis (tá istá deliaca čiara ako dlaždice).
// Obsah je v balíku appky (aid/aid*.ts + public/prva-pomoc/), preto v natívnej appke funguje bez signálu (lock architektura-pack §1.2).
// 🔴 Červená = ide o minúty (lock 17. 11.: červená SOS smie na prvú pomoc len tam, kde ide o minúty).
import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { IS_APP } from '@/lib/isApp';
import { PACK_R, PACK_SPACE as S, PACK_TEXT, PACK_THEME as T } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { SysIcon } from '@/components/pack/SysIcon';
import { SosTaskShell } from './SosTaskShell';
import { useBack, useSosHome, useSosT } from './sosShared';
import { AID_GROUPS, AID_ICON, AID_ICON_DEFAULT, aidContent, type AidCard, type AidLinks } from './aid/aidData';

export const AID_PATH = '/pack/sos/prva-pomoc';
const ER_PATH = '/pack/sos/pohotovost';

const PERA = 'inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid)';
const RED_PERA = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 ${T.sosRedDark},0 11px 14px var(--p3d-sh)`;
const HEAD = `'LT Museum',serif`;

const CSS = `
.aid-top{display:flex;align-items:center;justify-content:space-between;gap:${S.md}px;}
.aid-top .aid-h1{min-width:0;}
.aid-offl{flex:none;letter-spacing:.02em;display:flex;align-items:center;gap:${S.sm}px;min-height:32px;padding:0 ${S.md}px;border-radius:${PACK_R.pill}px;border:1.5px solid var(--p3d-gold);background:var(--p3d-paper-hi);font-size:${PACK_TEXT.label}px;font-weight:600;color:var(--p3d-ink);}
.aid-offl::before{content:'';flex:none;width:8px;height:8px;border-radius:${PACK_R.pill}px;background:${T.growGreen};}
.aid-h1{margin:0;font-family:${HEAD};font-weight:400;font-size:${PACK_TEXT.h1}px;line-height:1.15;color:var(--p3d-ink);}
.aid-sub{margin:-${S.md}px 0 0;font-size:${PACK_TEXT.body}px;color:var(--p3d-ink);}
.aid-eb{margin:${S.sm}px 0 -${S.sm}px;font-size:${PACK_TEXT.label}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--p3d-gold-ink);}
.aid-link{all:unset;cursor:pointer;font-weight:600;color:${LAPIS.edge};text-decoration:underline;text-underline-offset:2px;}
/* rozcestník */
.aid-min{display:grid;grid-template-columns:1fr 1fr;gap:${S.lg}px;}
.aid-red{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:${S.sm}px;min-height:96px;padding:${S.md}px;border-radius:${PACK_R.card}px;border:2.5px solid var(--p3d-ink);
  background:linear-gradient(180deg,color-mix(in srgb,${T.sosRed} 62%,white),${T.sosRed});color:#fff;box-shadow:${RED_PERA};}
.aid-red b{font-family:${HEAD};font-weight:400;font-size:${PACK_TEXT.h2}px;line-height:1.1;}
.aid-red.first{grid-column:1/-1;flex-direction:row;align-items:center;justify-content:flex-start;gap:${S.md}px;min-height:80px;}
.aid-red.first b{font-size:${PACK_TEXT.h1}px;}
.aid-ico{flex:none;display:flex;align-items:center;justify-content:center;border-radius:${PACK_R.pill}px;background:var(--p3d-paper-hi);border:2px solid var(--p3d-ink);}
.aid-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${S.md}px;}
.aid-tl{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.sm}px;min-height:84px;padding:${S.sm}px ${S.xs}px;text-align:center;border-radius:${PACK_R.card}px;border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:${PERA};}
.aid-tl b{font-size:${PACK_TEXT.body}px;font-weight:600;line-height:1.15;color:var(--p3d-ink);}
.aid-g2{display:grid;grid-template-columns:1fr 1fr;gap:${S.md}px;}
.aid-hp{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:${S.sm}px;min-height:48px;padding:${S.sm}px;border-radius:${PACK_R.tile}px;border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:${PERA};font-size:${PACK_TEXT.body}px;font-weight:600;line-height:1.2;color:var(--p3d-ink);}
.aid-red:active,.aid-tl:active,.aid-hp:active,.aid-step:active{transform:translateY(4px);}
/* karta */
.aid-media{position:relative;aspect-ratio:4/3;border-radius:${PACK_R.card}px;border:2.5px solid var(--p3d-ink);overflow:hidden;background:var(--p3d-paper-hi);box-shadow:${PERA};}
.aid-media img{display:block;width:100%;height:100%;object-fit:contain;}
.aid-cap{position:absolute;left:${S.sm}px;bottom:${S.sm}px;max-width:calc(100% - ${S.lg}px);padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:rgba(24,14,4,.72);color:#fff;font-size:${PACK_TEXT.label}px;font-weight:500;line-height:1.25;}
.aid-fotky{display:flex;gap:${S.sm}px;margin-top:-${S.md}px;overflow-x:auto;}
.aid-fotky figure{margin:0;flex:0 0 46%;position:relative;}
.aid-fotky img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:${PACK_R.tile}px;border:1.5px solid var(--p3d-ink);}
.aid-fotky figcaption{margin-top:${S.xs}px;font-size:${PACK_TEXT.label}px;font-weight:500;line-height:1.25;color:var(--p3d-ink);}
.aid-znak{position:absolute;top:${S.xs}px;left:${S.xs}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;border:2px solid currentColor;font-size:${PACK_TEXT.body}px;font-weight:600;line-height:1;letter-spacing:.02em;color:#fff;}
.aid-znak.zle{background:${T.sosRed};}
.aid-znak.ok{background:${T.growGreen};}
.aid-znak.r{left:auto;right:${S.xs}px;}
.aid-vet{padding:${S.md}px ${S.lg}px;border-radius:${PACK_R.card}px;border:2.5px solid var(--p3d-ink);background:linear-gradient(180deg,${T.sosRed},${T.sosRedDark});color:#fff;}
.aid-vet b{display:block;font-family:${HEAD};font-weight:400;font-size:${PACK_TEXT.h2}px;line-height:1.15;}
.aid-vet p{margin:${S.xs}px 0 0;font-size:${PACK_TEXT.lead}px;font-weight:500;line-height:1.35;}
.aid-vet ul{margin:${S.sm}px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:${S.xs}px;}
.aid-vet li{position:relative;padding-left:${S.lg}px;font-size:${PACK_TEXT.lead}px;font-weight:500;line-height:1.35;}
.aid-vet li::before{content:'';position:absolute;left:0;top:${S.sm}px;width:8px;height:8px;border-radius:${PACK_R.pill}px;background:#fff;}
.aid-vet .aid-link{color:#fff;}
.aid-pills{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.aid-pill{display:inline-flex;align-items:center;min-height:32px;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);font-size:${PACK_TEXT.body}px;font-weight:500;line-height:1.3;color:var(--p3d-ink);}
.aid-rule{padding:${S.xs}px 0 ${S.xs}px ${S.md}px;border-left:4px solid var(--p3d-gold);font-size:${PACK_TEXT.lead}px;line-height:1.45;color:var(--p3d-ink);}
.aid-rule.warn{border-left-color:${T.sosRed};}
.aid-rule > b{font-weight:600;}
.aid-rule ul{margin:${S.xs}px 0 0;padding-left:${S.lg}px;list-style:disc;}
.aid-rule li{display:list-item;margin-bottom:${S.xs}px;}
.aid-rule .aid-pills,.aid-rule .aid-media{margin-top:${S.sm}px;}
.aid-steps{display:flex;flex-direction:column;gap:${S.md}px;}
.aid-step{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:40px minmax(0,1fr);gap:${S.md}px;align-items:start;padding:${S.md}px;border-radius:${PACK_R.card}px;border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:${PERA};}
.aid-step i{font-style:normal;width:40px;height:40px;box-sizing:border-box;border-radius:${PACK_R.pill}px;border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);display:flex;align-items:center;justify-content:center;font-family:${HEAD};font-size:${PACK_TEXT.h2}px;line-height:1;color:var(--p3d-ink);}
.aid-step span{padding-top:${S.xs}px;font-size:${PACK_TEXT.h2}px;font-weight:500;line-height:1.3;color:var(--p3d-ink);}
.aid-step.done{background:color-mix(in srgb,${T.growGreen} 12%,var(--p3d-paper-hi));}
.aid-step.done i{background:${T.growGreen};color:#fff;}
.aid-step.done span{opacity:.6;}
.aid-step.sm{grid-template-columns:32px minmax(0,1fr);align-items:center;padding:${S.sm}px ${S.md}px;}
.aid-step.sm i{width:32px;height:32px;font-size:${PACK_TEXT.lead}px;}
.aid-step.sm span{padding-top:0;font-size:${PACK_TEXT.lead}px;}
.aid-prog{margin:-${S.md}px 0 0;font-size:${PACK_TEXT.body}px;font-weight:500;color:var(--p3d-ink);}
.aid-fact{padding:${S.xs}px 0 ${S.xs}px ${S.md}px;border-left:4px solid var(--p3d-gold);font-size:${PACK_TEXT.lead}px;line-height:1.45;color:var(--p3d-ink);}
.aid-fact b{display:block;font-weight:600;}
.aid-disc{margin:0;padding:0 ${S.md}px;font-size:${PACK_TEXT.label}px;line-height:1.4;color:var(--p3d-ink);opacity:.7;text-align:center;}
.aid-never{padding:${S.md}px ${S.lg}px;border-radius:${PACK_R.card}px;border:2.5px solid ${T.sosRedDark};background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);}
.aid-never b{display:block;font-family:${HEAD};font-weight:400;font-size:${PACK_TEXT.h2}px;line-height:1.15;color:${T.sosRedDark};}
.aid-never ul{margin:${S.sm}px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:${S.sm}px;}
.aid-never li{position:relative;padding-left:${S.lg}px;font-size:${PACK_TEXT.lead}px;font-weight:500;line-height:1.4;color:var(--p3d-ink);}
.aid-never li::before{content:'';position:absolute;left:0;top:10px;width:10px;height:3px;border-radius:${PACK_R.pill}px;background:${T.sosRedDark};}
.aid-nosig{padding:${S.md}px ${S.lg}px;border-radius:${PACK_R.card}px;border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:${PERA};}
.aid-nosig b{display:block;font-family:${HEAD};font-weight:400;font-size:${PACK_TEXT.h2}px;line-height:1.15;color:var(--p3d-ink);}
.aid-nosig p{margin:${S.sm}px 0 0;font-size:${PACK_TEXT.lead}px;line-height:1.45;color:var(--p3d-ink);}
/* rezerva pod obsahom: prilepené CTA nesmie dosadnúť na spodný rad dlaždíc (360 × 640); medzera 16 + gap stĺpca 16 */
.aid-pad{flex:none;height:${S.lg}px;}
.aid-missing{margin:0;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:2px solid ${T.sosRedDark};background:var(--p3d-paper-hi);font-size:${PACK_TEXT.body}px;font-weight:500;line-height:1.4;color:${T.sosRedDark};}
/* dole prilepené CTA */
.aid-dock{position:sticky;bottom:0;z-index:2;margin:auto -${S.md}px 0;padding:${S.md}px ${S.md}px calc(${S.md}px + env(safe-area-inset-bottom));background:linear-gradient(180deg,transparent,var(--p3d-paper) 24%);}
`;

/** Text s odkazmi na iné karty („karta NEDÝCHA“ → ťuk otvorí kartu). */
function rich(text: string, links: AidLinks, open: (id: string) => void): ReactNode {
  const hits: { at: number; len: number; id: string }[] = [];
  for (const [re, id] of links) {
    for (const m of text.matchAll(new RegExp(re.source, 'g'))) hits.push({ at: m.index ?? 0, len: m[0].length, id });
  }
  if (!hits.length) return text;
  hits.sort((a, b) => a.at - b.at);
  const out: ReactNode[] = [];
  let pos = 0;
  hits.forEach((h, i) => {
    if (h.at < pos) return;
    out.push(text.slice(pos, h.at));
    out.push(<button key={i} type="button" className="aid-link" onClick={() => open(h.id)}>{text.slice(h.at, h.at + h.len)}</button>);
    pos = h.at + h.len;
  });
  out.push(text.slice(pos));
  return out;
}
const upper = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function PackSosAid() {
  const { id } = useParams();
  const { lang } = useLang();
  const t = useT();
  const s = useSosT();
  const nav = useNavigate();
  const { cards, links } = useMemo(() => aidContent(lang), [lang]);
  const card = id ? cards.find((c) => c.id === id) : undefined;
  const home = useSosHome();   // odhlásený ostáva v SOS (rozcestník), nie na prihlásení
  const onBack = useBack(card ? AID_PATH : home);
  const open = (to: string) => { nav(`${AID_PATH}/${to}`); window.scrollTo(0, 0); };
  const title = t('pack.sos.firstAid') === 'pack.sos.firstAid' ? 'First aid' : t('pack.sos.firstAid');

  return (
    <SosTaskShell onBack={onBack} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      {card ? <AidCardView key={card.id} c={card} links={links} open={open} /> : (
        <>
          {id && <p className="aid-missing" role="status">{s('pack.sos.aid.missing')}</p>}
          {/* Nadpis a OFFLINE v jednom riadku (Matej 20. 11.) — celé „funguje bez signálu“ ostáva v title pre čítačku. */}
          <div className="aid-top">
            <h1 className="aid-h1">{title}</h1>
            {IS_APP && <span className="aid-offl" title={s('pack.sos.aid.offline')}>OFFLINE</span>}
          </div>
          <AidHome cards={cards} open={open} />
          <div className="aid-disc">{s('pack.sos.aid.vetNote')}</div>
        </>
      )}
      <div className="aid-pad" aria-hidden />
      <div className="aid-dock">
        <button type="button" className={`sos-cta${card?.group === 'A' ? ' sos-cta--red' : ''}`} onClick={() => nav(ER_PATH)}>
          {s(card ? 'pack.sos.aid.call' : 'pack.sos.aid.nearest')}
        </button>
      </div>
    </SosTaskShell>
  );
}

function AidIcon({ id, size }: { id: string; size: number }) {
  return <span className="aid-ico" style={{ width: size + S.sm, height: size + S.sm }}><SysIcon name={AID_ICON[id] ?? AID_ICON_DEFAULT} size={size} /></span>;
}

function AidHome({ cards, open }: { cards: AidCard[]; open: (id: string) => void }) {
  const s = useSosT();
  const g = (k: string) => cards.filter((c) => c.group === k);
  const [first, ...rest] = g('A');
  return (
    <>
      {AID_GROUPS.map((k) => (
        <Fragment key={k}>
          {/* skupina A bez nadpisu „Ide o minúty“ — červené dlaždice to hovoria samy (Matej 20. 11.) */}
          {k !== 'A' && <p className="aid-eb">{s(`pack.sos.aid.g.${k}` as 'pack.sos.aid.g.A')}</p>}
          {k === 'A' && (
            <div className="aid-min">
              <button type="button" className="aid-red first" onClick={() => open(first.id)}><AidIcon id={first.id} size={32} /><b>{first.tile}</b></button>
              {rest.map((c) => <button key={c.id} type="button" className="aid-red" onClick={() => open(c.id)}><AidIcon id={c.id} size={24} /><b>{c.tile}</b></button>)}
            </div>
          )}
          {(k === 'B' || k === 'C') && (
            <div className="aid-g3">
              {g(k).map((c) => <button key={c.id} type="button" className="aid-tl" onClick={() => open(c.id)}><AidIcon id={c.id} size={24} /><b>{c.tile}</b></button>)}
            </div>
          )}
          {k === 'D' && (
            <div className="aid-g2">
              {g(k).map((c) => <button key={c.id} type="button" className="aid-hp" onClick={() => open(c.id)}><AidIcon id={c.id} size={16} /><span>{c.tile}</span></button>)}
            </div>
          )}
        </Fragment>
      ))}
    </>
  );
}

function AidCardView({ c, links, open }: { c: AidCard; links: AidLinks; open: (id: string) => void }) {
  const s = useSosT();
  const [done, setDone] = useState<Record<number, boolean>>({});
  const tick = (i: number) => setDone((d) => ({ ...d, [i]: !d[i] }));
  const r = (x: string) => rich(x, links, open);
  const n = (c.kroky ?? []).filter((_, i) => done[i]).length;
  return (
    <>
      <h1 className="aid-h1">{c.title}</h1>
      {c.sub && <p className="aid-sub">{c.sub}</p>}
      <div className="aid-media"><img src={c.img} alt={c.title} /><span className="aid-cap">{c.imgCap}</span></div>
      {c.fotky && (
        <div className="aid-fotky">
          {c.fotky.map((f) => (
            <figure key={f.src}>
              {f.znak && <span className={`aid-znak ${f.znak}`}>{s(f.znak === 'zle' ? 'pack.sos.aid.bad' : 'pack.sos.aid.good')}</span>}
              <img src={f.src} alt={f.cap} loading="lazy" />
              <figcaption>{f.cap}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {c.porovnanie && (
        <div className="aid-rule">
          <b>{c.porovnanie.h}</b>
          <div className="aid-media"><img src={c.porovnanie.img} alt={c.porovnanie.h} loading="lazy" /><span className="aid-znak zle">{c.porovnanie.l}</span><span className="aid-znak ok r">{c.porovnanie.r}</span></div>
          <div>{c.porovnanie.t}</div>
        </div>
      )}
      {c.dalsi?.map((d) => (
        <div key={d.img} className="aid-rule">
          <b>{d.h}</b>
          <div className="aid-media"><img src={d.img} alt={d.h} loading="lazy" /></div>
          {d.t && <div>{d.t}</div>}
        </div>
      ))}
      {c.vet && (
        <div className="aid-vet">
          <b>{c.vet.h}</b>
          {c.vet.pre && <p>{c.vet.pre}</p>}
          <ul>{c.vet.items.map((i) => <li key={i}>{r(i)}</li>)}</ul>
          {c.vet.post && <p>{c.vet.post}</p>}
        </div>
      )}
      {c.spoznas && (
        <>
          <p className="aid-eb">{s('pack.sos.aid.spoznas')}</p>
          <div className="aid-pills">{c.spoznas.map((x) => <span key={x} className="aid-pill">{x}</span>)}</div>
        </>
      )}
      {c.lead?.map((x) => <div key={x} className="aid-rule">{r(x)}</div>)}
      {c.kroky && (
        <>
          <p className="aid-eb">{s('pack.sos.aid.kroky')}</p>
          <div className="aid-steps">
            {c.kroky.map((k, i) => (
              <button key={i} type="button" className={`aid-step${done[i] ? ' done' : ''}`} onClick={() => tick(i)} aria-pressed={!!done[i]}>
                <i>{i + 1}</i><span>{r(k)}</span>
              </button>
            ))}
          </div>
          <p className="aid-prog">{s('pack.sos.aid.prog', { n, all: c.kroky.length })}</p>
        </>
      )}
      {c.zoznam && (
        <>
          <p className="aid-eb">{s('pack.sos.aid.zoznam')}</p>
          <div className="aid-steps">
            {c.zoznam.map((k, i) => (
              <button key={i} type="button" className={`aid-step sm${done[i] ? ' done' : ''}`} onClick={() => tick(i)} aria-pressed={!!done[i]}>
                <i>{i + 1}</i><span>{k}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {c.posledne && (
        <div className="aid-rule warn">
          <b>{c.posledne.h}</b>
          <div className="aid-media"><img src={c.posledne.img} alt={c.posledne.h} loading="lazy" /></div>
          <div>{c.posledne.t}</div>
        </div>
      )}
      {c.fakty?.map((f) => <div key={f.h} className="aid-fact"><b>{f.h}</b>{f.t}</div>)}
      {c.extra?.map((e) => (
        <div key={e.h} className={`aid-rule${e.warn ? ' warn' : ''}`}>
          <b>{e.h}{(e.t || e.items) && !/[.?!:]$/.test(e.h) ? ':' : ''}</b> {e.t && r(e.t)}
          {e.items && (e.pills
            ? <div className="aid-pills">{e.items.map((i) => <span key={i} className="aid-pill">{i}</span>)}</div>
            : <ul>{e.items.map((i) => <li key={i}>{r(i)}</li>)}</ul>)}
          {e.after && <div>{e.after}</div>}
        </div>
      ))}
      {c.nikdy && (
        <div className="aid-never">
          <b>{s('pack.sos.aid.nikdy')}</b>
          <ul>{c.nikdy.map((x) => <li key={x}>{r(x)}</li>)}</ul>
        </div>
      )}
      {c.bezSignalu && (
        <div className="aid-nosig">
          <b>{s('pack.sos.aid.nosig')}</b>
          <p>{r(upper(c.bezSignalu))}</p>
        </div>
      )}
      <div className="aid-disc">{s('pack.sos.aid.vetNote')}</div>
    </>
  );
}
