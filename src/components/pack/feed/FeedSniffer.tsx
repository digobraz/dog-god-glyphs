// SNIFFER VO FEEDe (Matej 23. 11. 2026: „sniffer ok“, všetky odporúčané voľby; nákres `plany/nakresy/sniffer-feed-2026-11-23`).
//
// Príspevok nemá typ, má ŠTÍTKY (lock architektura-pack §4.3): téma Sniffer = príspevky so `t:sniffer`.
// Tu je to, čo k nim patrí navyše: pás informácie nad témou, polička „Hľadajú parťáka“ vo Všetko, tlačidlo Napísať
// (existujúce DM `start_member_dm`) a obnova na ďalších 30 dní. Swipe karty psov (`/pack/sniffer`) to NIE JE a ostávajú samostatne.
import { useState } from 'react';
import { RightGate } from '@/components/pack/RightGate';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { sizedUrl } from '@/services/cloudinaryService';
import { openCompose } from '@/components/pack/profile/mePosts';
import { APP_NEW } from '@/lib/packFlags';
import { SNIFFER_DAYS } from './postTags';
import type { SnifferRow } from './feedData';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

export const SNIFFER_ICON = '/icons/kruhy/sniffer.webp'; // srdce dolu hlavou s nosom (Matej 23. 11.: „sniffer A“)

/** Údaje, ktoré karta príspevku potrebuje navyše, keď je to Sniffer. */
export interface SnifferInfo { km: number | null; mine: boolean; expired: boolean; at: string; onRenew: () => void }

export const FEED_SNIFFER_CSS = `
.pks-h{display:flex;align-items:baseline;justify-content:space-between;gap:${S.md}px;margin:0 0 ${S.sm}px;}
.pks-h b{font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${T.inkStrong};} /* písmo: nadpis */
.pks-h button{flex:none;background:none;border:0;padding:${S.xs}px 0;cursor:pointer;font:600 ${TX.label}px/1 ${FONT_UI};color:${LAPIS.edge};}
.pks-rail{display:flex;gap:${S.md}px;overflow-x:auto;scrollbar-width:none;padding:${S.xs}px 0 ${S.md}px;}
.pks-rail::-webkit-scrollbar{display:none;}
.pks-mini{flex:none;width:148px;padding:0;text-align:left;cursor:pointer;overflow:hidden;border-radius:${PACK_R.tile}px;border:1.5px solid ${T.cardEdge};background:${T.card};color:${T.inkStrong};}
.pks-mini .ph{display:block;width:100%;height:96px;object-fit:cover;background:${T.tileBg};}
.pks-mini .ph.none{display:grid;place-items:center;}
.pks-mini .ph.none img{width:48px;height:48px;object-fit:contain;}
.pks-mini .t{display:block;padding:${S.sm}px;font:600 ${TX.label}px/1.3 ${FONT_UI};}
.pks-mini .t b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;font-size:${TX.body}px;}
.pks-mini .t small{color:${T.inkWarm};font-size:${TX.label}px;}
.pks-ban{display:flex;flex-direction:column;gap:${S.md}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1.5px solid ${LAPIS.edge};background:color-mix(in srgb,${LAPIS.edge} 10%,${T.card});color:${LAPIS.edge};}
.pks-ban p{display:flex;align-items:center;gap:${S.sm}px;margin:0;font:600 ${TX.label}px/1.3 ${FONT_UI};}
.pks-ban p img{width:32px;height:32px;object-fit:contain;flex:none;}
.pks-ban .loc{align-self:flex-start;cursor:pointer;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;border:1.5px solid ${LAPIS.edge};background:none;color:${LAPIS.edge};font:600 ${TX.label}px/1.3 ${FONT_UI};}
.pks-ban .go{width:100%;min-height:48px;}
.pks-ban .go:not(.pk-b3){border:1px solid ${LAPIS.deep};background:${LAPIS.grad};color:${LAPIS.ink};border-radius:${PACK_R.field}px;cursor:pointer;font:600 ${TX.body}px/1 ${FONT_UI};}
.pks-none{display:flex;flex-direction:column;align-items:center;gap:${S.sm}px;padding:${S.xl}px ${S.lg}px;text-align:center;font-size:${TX.label}px;color:${T.inkWarm};}
.pks-none img{width:96px;height:96px;object-fit:contain;}
html.papyrus3d .pks-h b{font-family:'LT Museum',serif;font-weight:400;font-size:${TX.h2}px;letter-spacing:0;text-transform:none;} /* písmo: nadpis */
html.papyrus3d .pks-mini{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:var(--p3d-lift);}
html.papyrus3d .pks-ban{border:2.5px solid ${LAPIS.edge};border-radius:${PACK_R.card}px;background:var(--p3d-card);box-shadow:var(--p3d-lift);}
@media (max-width:639px){.pks-pad{padding:0 16px;}}
`;

/** Km → „4 km“; bez polohy nič. */
export const kmText = (km: number | null, tx: (k: string, f: string) => string): string =>
  km == null ? '' : tx('pack.feed.sniffer.km', '{n} km away').replace('{n}', String(km));

/** Tlačidlo „Napísať“ → `start_member_dm` podľa čísla psa autora, vlákno sa otvorí ako vrstva (akcia neodnesie preč). */
export function SnifferWrite({ ownerN }: { ownerN: number | null }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  if (ownerN == null) return null;
  const open = async () => {
    if (busy) return;
    setBusy(true); setFailed(false);
    try {
      // dynamický import: `packMessaging` ťahá katalóg trás (ten istý dôvod ako v `PartyMemberCard`)
      const m = await import('@/components/pack/messaging/packMessaging');
      const bridge = await import('@/components/pack/messaging/openBridge');
      const conv = await m.startMemberDM(ownerN);
      if (conv) bridge.emitOpenThread(conv, { backCloses: true }); else setFailed(true);
    } catch { setFailed(true); } finally { setBusy(false); }
  };
  return (
    <RightGate right="social">
      <button type="button" className={APP_NEW ? 'pk-b3 pk-b3--lapis' : undefined} onClick={open} disabled={busy}>
        {busy ? '…' : failed ? tx('pack.feed.sniffer.unavailable', 'Can’t write now') : tx('pack.feed.sniffer.write', 'Write')}
      </button>
    </RightGate>
  );
}

/** Polička „Hľadajú parťáka“ — jedna, hore vo Všetko. Ťuk na kartu otvorí tému Sniffer. */
export function SnifferShelf({ rows, onOpen }: { rows: SnifferRow[]; onOpen: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  if (!rows.length) return null;
  return (
    <section className="pks-pad">
      <div className="pks-h">
        <b>{tx('pack.feed.sniffer.shelf', 'Looking for a buddy')}</b>
        <button type="button" onClick={onOpen}>{tx('pack.feed.sniffer.topic', 'Sniffer')} ›</button>
      </div>
      <div className="pks-rail">
        {rows.map((r) => (
          <button key={r.fp.post.id} type="button" className="pks-mini" onClick={onOpen}>
            {r.fp.post.photos[0] || r.fp.avatar
              ? <img className="ph" src={sizedUrl((r.fp.post.photos[0] || r.fp.avatar) as string, 320)} alt="" loading="lazy" decoding="async" />
              : <span className="ph none"><img src={SNIFFER_ICON} alt="" /></span>}
            <span className="t"><b>{r.fp.name || tx('pack.feed.member', 'Member')}</b><small>{kmText(r.km, tx)}</small></span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** Pás nad témou Sniffer: komu je to určené, vzdialenosť na ťuk a „Aj ja hľadám parťáka“. */
export function SnifferBanner({ canAsk, onAsk }: { canAsk: boolean; onAsk: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  return (
    <div className="pks-ban">
      <p><img src={SNIFFER_ICON} alt="" />{tx('pack.feed.sniffer.banner', 'People open to meeting. Posts from the last {n} days.').replace('{n}', String(SNIFFER_DAYS))}</p>
      {canAsk && <button type="button" className="loc" onClick={onAsk}>{tx('pack.feed.sniffer.showDist', 'Show distance from me')}</button>}
      <button type="button" className={`go${APP_NEW ? ' pk-b3 pk-b3--lapis' : ''}`} onClick={() => openCompose('post', { sniffer: true })}>
        {tx('pack.feed.sniffer.mine', 'I am looking for a buddy too')}
      </button>
    </div>
  );
}

/** Prázdna téma. */
export function SnifferEmpty() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  return (
    <div className="pks-none"><img src={SNIFFER_ICON} alt="" />{tx('pack.feed.sniffer.empty', 'Nobody is looking for a buddy yet. Be the first.')}</div>
  );
}
