// Panely chatu v2: Tvoja hodnosť (karta s modelom, „i“, hĺbka, kredity, cena správy, rebrík, CTA) a súhlas pred prvou správou.
import { useState } from 'react';
import { DogSeal, type SealTier } from '@/components/pack/profile/dogSeal';
import { V2_RANKS, V2_TIERS, type V2Credits, type V2RankId, type V2Tier } from './v2Api';
import { EFFORT_IDX, RANK_PRICE, TIER_IDX, type V2Copy } from './v2Meta';
import { IS_APP } from '@/lib/isApp';

export const Seal = ({ rank, size, className }: { rank: V2RankId; size: number; className?: string }) => (
  <span className={className ?? 'seal'} style={{ width: size, height: size }}>
    <DogSeal tier={rank as SealTier} size={size} own style={{ marginLeft: 0, verticalAlign: 'top' }} />
  </span>
);

const CLAUDE: Record<V2Tier, 'mdlQuickName' | 'mdlSharpName' | 'mdlDeepName'> = { rychly: 'mdlQuickName', bystry: 'mdlSharpName', hlboky: 'mdlDeepName' };
const DESC: Record<V2Tier, 'mdlQuickDesc' | 'mdlSharpDesc' | 'mdlDeepDesc'> = { rychly: 'mdlQuickDesc', bystry: 'mdlSharpDesc', hlboky: 'mdlDeepDesc' };
const chipCls = (t: V2Tier) => (t === 'hlboky' ? ' op' : t === 'bystry' ? ' so' : '');
const DEPTH = ['depth0', 'depth1', 'depth2', 'depth3', 'depth4'] as const;

const Dots = ({ e }: { e: number }) => (
  <span className="av2-dots" aria-hidden>{DEPTH.map((_, k) => <i key={k} className={k <= e ? 'on' : ''} />)}</span>
);

export function RankSheet({ credits, c, lang, rankName, onClose, onCta }: {
  credits: V2Credits; c: V2Copy; lang: string; rankName: (r: V2RankId) => string; onClose: () => void; onCta: () => void;
}) {
  const [info, setInfo] = useState(false);
  const [ladder, setLadder] = useState(false);
  const top = credits.top;
  const eff = EFFORT_IDX[credits.effort] ?? 1;
  const free = credits.rank === 'veriaci';
  const pct = credits.allowance ? Math.min(100, (credits.used / credits.allowance) * 100) : 0;
  let renews = '';
  try { renews = new Date(credits.resets_at).toLocaleDateString(lang, { day: 'numeric', month: 'numeric' }); } catch { renews = ''; }
  const price = (t: V2Tier) => Math.max(1, Math.round(credits.price?.[t] ?? 1));
  return (
    <>
      <div className="av2-dim" onClick={onClose} aria-hidden />
      <div className="av2-sheet" role="dialog" aria-label={c('rankTitle')}>
        <div className="av2-grab" />
        <div className="av2-hold">
          <Seal rank={credits.rank} size={52} />
          <div className="mtx">
            <div className="av2-hxs">{rankName(credits.rank)}</div>
            <small>{(free ? c('rankModelFree') : c('rankModel')).split('{m}').flatMap((part, i, arr) => (i < arr.length - 1 ? [part, <b key={i}>{c(top)}</b>] : [part]))}</small>
          </div>
          <button type="button" className="pk-b3 pk-b3--ai-nt av2-info" aria-label={c('infoAria')} aria-expanded={info} onClick={() => setInfo((v) => !v)}>
            <i className="av2-ii" />
          </button>
        </div>
        {info ? (
          <div className="av2-infobox">
            <p>{c('infoLead')}</p>
            {V2_TIERS.map((t) => (
              <div key={t} className={`av2-mrow${t === top ? ' cur' : ''}`}>
                <span className={`av2-mchip${chipCls(t)}`}>{c(t)}</span>
                <small><b>{c(CLAUDE[t])}.</b> {c(DESC[t])}</small>
              </div>
            ))}
            <div className="av2-mrow"><span className="av2-mchip">{c('autoName')}</span><small>{c('autoDesc')}</small></div>
            <div className="av2-mrow"><span className="av2-mchip">{c('creditName')}</span><small>{c('creditDesc')}</small></div>
            <div className="av2-mrow"><Dots e={2} /><small>{c('depthDesc')}</small></div>
          </div>
        ) : (
          <div className="av2-mdesc">{c(DESC[top])}</div>
        )}
        <div className="av2-row2">
          <span className="av2-lab">{c('depth')}</span>
          <Dots e={eff} />
          <small className="av2-el">{c(DEPTH[Math.min(eff, 4)])}</small>
        </div>
        <div className="av2-row2 col">
          <div className="av2-lim">
            <span className="av2-lab">{c('thisMonth')}</span>
            <b>{c('creditsOf', { used: Math.round(credits.used).toLocaleString(lang), all: credits.allowance.toLocaleString(lang) })}</b>
          </div>
          <span className="av2-qbar big"><i style={{ width: `${pct}%` }} /></span>
          {renews && <small>{c('renews', { d: renews })}</small>}
        </div>
        <div className="av2-row2">
          <span className="av2-lab">{c('priceOne')}</span>
          <span className="av2-costs">
            {V2_TIERS.slice(0, TIER_IDX[top] + 1).map((t) => (
              <span key={t} className={`av2-mchip${chipCls(t)}`}>{c(t)} ~{price(t)}</span>
            ))}
          </span>
        </div>
        {free && <div className="av2-warn">{c('disclaimerFree')}</div>}
        <button type="button" className={`av2-drop${ladder ? ' on' : ''}`} aria-expanded={ladder} onClick={() => setLadder((v) => !v)}>
          <span className="av2-lab">{c('ladder')}</span>
          <i className="chev" />
        </button>
        {ladder && (
          <div className="av2-ladder">
            {V2_RANKS.map((r) => {
              const cfg = credits.ranks?.[r];
              if (!cfg) return null;
              const p = RANK_PRICE[r];
              return (
                <div key={r} className={`av2-rung${r === credits.rank ? ' cur' : ''}`}>
                  <Seal rank={r} size={30} />
                  <div className="av2-rn">
                    <b>{rankName(r)}</b>
                    {(!IS_APP || r === 'veriaci') && <small>{!p.eur ? c('free') : c(p.from ? 'fromPerMonth' : 'perMonth', { p: p.eur })}</small>}
                  </div>
                  <div className="av2-rm">
                    <span className={`av2-mchip${chipCls(cfg.top)}`}>{c(cfg.top)}</span>
                    <Dots e={EFFORT_IDX[cfg.effort] ?? 1} />
                  </div>
                  <div className="av2-rl"><b>{cfg.credits.toLocaleString(lang)}</b><small>{c('ladderCredits')}</small></div>
                </div>
              );
            })}
          </div>
        )}
        {credits.rank !== 'farao' && !IS_APP && (
          <button type="button" className="pk-b3 pk-b3--ai-or av2-up" onClick={onCta}>{c('rankCta')}</button>
        )}
      </div>
    </>
  );
}

export function ConsentSheet({ c, busy, failed, onYes, onNo }: { c: V2Copy; busy: boolean; failed: boolean; onYes: () => void; onNo: () => void }) {
  return (
    <>
      <div className="av2-dim" aria-hidden />
      <div className="av2-sheet" role="dialog" aria-label={c('consentTitle')}>
        <div className="av2-grab" />
        <div className="av2-consent">
          <div className="av2-hxs">{c('consentTitle')}</div>
          <p>{c('consentBody')}</p>
          {failed && <p style={{ color: '#FF8A7A' }}>{c('consentFail')}</p>}
          <div className="btns">
            <button type="button" className="pk-b3 pk-b3--ai-nt" onClick={onNo}>{c('consentNo')}</button>
            <button type="button" className="pk-b3 pk-b3--ai-or" disabled={busy} onClick={onYes}>{c('consentYes')}</button>
          </div>
        </div>
      </div>
    </>
  );
}
