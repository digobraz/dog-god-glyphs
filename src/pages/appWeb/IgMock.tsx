/* Paródia Instagram profilu — tri „psie" kontá, kde je pes skoro všade len rekvizita.
 *  Všetko je vlastné CSS/SVG (žiadne logo ani ikonky Instagramu, žiadne fotky, žiadne emoji).
 *  Texty z COPY3 (kľúče `igN_*`), handle mená ostávajú anglické. Štýl `.igp` v appWeb.css. */
import type { ReactNode } from 'react';

type Shape = 'sun' | 'cup' | 'dumb' | 'tail' | 'plate' | 'selfie' | 'chart' | 'leash' | 'mirror' | 'ad';
/* c = paleta dlaždice (a–l v CSS), s = jednoduchý SVG tvar; bez s je to textový príspevok */
type Tile = { c: string; s?: Shape };
type Account = { n: 1 | 2 | 3; handle: string; link: string; sponsored?: boolean; hl: string[]; tiles: Tile[] };

const ACCOUNTS: Account[] = [
  { n: 1, handle: 'bella.the.beagle.official', link: 'bella-official.example', hl: ['c', 'd', 'e', 'f'],
    tiles: [{ c: 'a', s: 'selfie' }, { c: 'b', s: 'cup' }, { c: 'c' }, { c: 'd', s: 'sun' }, { c: 'e' }, { c: 'f', s: 'dumb' }, { c: 'g', s: 'plate' }, { c: 'h' }, { c: 'i', s: 'tail' }] },
  { n: 2, handle: 'sir.maximilian.sausage', link: 'dm-for-collabs.example', sponsored: true, hl: ['b', 'g', 'a', 'h'],
    tiles: [{ c: 'g', s: 'mirror' }, { c: 'h' }, { c: 'b', s: 'ad' }, { c: 'a', s: 'dumb' }, { c: 'c', s: 'chart' }, { c: 'e' }, { c: 'i', s: 'selfie' }, { c: 'f', s: 'plate' }, { c: 'd', s: 'tail' }] },
  { n: 3, handle: 'luna.wanders.the.world', link: 'wanderlust-luna.example', hl: ['d', 'a', 'e', 'i'],
    tiles: [{ c: 'd', s: 'sun' }, { c: 'e' }, { c: 'i', s: 'selfie' }, { c: 'c', s: 'plate' }, { c: 'h' }, { c: 'a', s: 'leash' }, { c: 'b', s: 'cup' }, { c: 'g' }, { c: 'f', s: 'mirror' }] },
];

/* jednoduché tvary v dlaždici — currentColor, viewBox 100×100 */
const SHAPES: Record<Shape, ReactNode> = {
  sun: <><circle cx="50" cy="52" r="20" fill="currentColor" /><rect x="0" y="66" width="100" height="34" fill="currentColor" opacity=".45" /></>,
  cup: <><path d="M28 38h38v26a16 16 0 0 1-16 16h-6a16 16 0 0 1-16-16z" fill="currentColor" /><path d="M66 46h6a8 8 0 0 1 0 18h-6" fill="none" stroke="currentColor" strokeWidth="5" /></>,
  dumb: <><rect x="14" y="38" width="12" height="24" rx="3" fill="currentColor" /><rect x="74" y="38" width="12" height="24" rx="3" fill="currentColor" /><rect x="26" y="47" width="48" height="6" fill="currentColor" /></>,
  tail: <path d="M70 100c-4-26-22-34-30-52-4-9 4-17 12-10 12 12 20 36 18 62z" fill="currentColor" />,
  plate: <><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="5" /><circle cx="50" cy="50" r="16" fill="currentColor" opacity=".5" /></>,
  selfie: <><circle cx="50" cy="38" r="17" fill="currentColor" /><path d="M16 96c0-24 14-34 34-34s34 10 34 34z" fill="currentColor" /></>,
  chart: <><path d="M14 80l22-26 16 12 30-40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><rect x="14" y="84" width="72" height="4" fill="currentColor" /></>,
  leash: <path d="M0 30c30 6 40 40 60 44s30-20 40-14" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />,
  mirror: <><rect x="32" y="12" width="36" height="76" rx="18" fill="none" stroke="currentColor" strokeWidth="5" /><circle cx="50" cy="40" r="8" fill="currentColor" /></>,
  ad: <><rect x="20" y="30" width="60" height="42" rx="6" fill="none" stroke="currentColor" strokeWidth="5" /><rect x="30" y="42" width="40" height="6" fill="currentColor" /><rect x="30" y="54" width="26" height="6" fill="currentColor" /></>,
};

function Tab({ k }: { k: 'grid' | 'reel' | 'tag' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {k === 'grid' && <><rect x="3" y="3" width="18" height="18" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></>}
      {k === 'reel' && <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M10 8.5l5.5 3.5-5.5 3.5z" /></>}
      {k === 'tag' && <><circle cx="12" cy="9" r="3.5" /><path d="M5 20c0-4 3-6 7-6s7 2 7 6" /></>}
    </svg>
  );
}

export function IgMock({ c }: { c: (k: string) => string }) {
  return (
    <div className="igrow">
      {ACCOUNTS.map(a => (
        <div key={a.n} className={`igp igp${a.n}`}>
          <div className="igp-top"><span className="igp-back" /><b>{a.handle}</b><span className="igp-dots"><i /><i /><i /></span></div>
          <div className="igp-head">
            <span className="igp-av"><span className="igp-avin"><svg viewBox="0 0 100 100" aria-hidden="true">{SHAPES.selfie}</svg></span></span>
            <div className="igp-st">
              <div><b>{c(`ig${a.n}_posts`)}</b>{c('ig_posts')}</div>
              <div><b>{c(`ig${a.n}_fol`)}</b>{c('ig_fol')}</div>
              <div><b>{c(`ig${a.n}_ing`)}</b>{c('ig_ing')}</div>
            </div>
          </div>
          <div className="igp-bio">
            <p className="igp-nm">{c(`ig${a.n}_name`)}</p>
            <p className="igp-cat">{c(`ig${a.n}_cat`)}</p>
            <p className="igp-tx">{c(`ig${a.n}_bio`)}</p>
            <p className="igp-lk">{a.link}</p>
          </div>
          <div className="igp-btns"><span className="igp-b blue">{c('ig_follow')}</span><span className="igp-b">{c('ig_msg')}</span></div>
          <div className="igp-hl">
            {a.hl.map((p, i) => (<div key={i}><span className="igp-ring"><span className={`igp-t t-${p}`} /></span>{c(`ig${a.n}_h${i + 1}`)}</div>))}
          </div>
          <div className="igp-tabs"><span className="on"><Tab k="grid" /></span><span><Tab k="reel" /></span><span><Tab k="tag" /></span></div>
          <div className="igp-gr">
            {a.tiles.map((t, i) => (
              <div key={i} className={`igp-t t-${t.c}${t.s ? ' sh' : ''}`}>
                {t.s && <svg viewBox="0 0 100 100" aria-hidden="true">{SHAPES[t.s]}</svg>}
                <span>{c(`ig${a.n}_t${i + 1}`)}</span>
              </div>
            ))}
          </div>
          {a.sponsored && <span className="igp-spon">{c('ig_spon')}</span>}
        </div>
      ))}
    </div>
  );
}
