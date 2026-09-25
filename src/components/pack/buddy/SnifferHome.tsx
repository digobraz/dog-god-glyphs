// SNIFFER — domov zapnutého človeka: záložky SNIFFUJ · HĽADAŤ · ZHODY.
// Zadanie: plany/zadanie-sniffer-stavba-2026-09-26.md §2.1 (SNIFFUJ), §2.6 (ZHODY) · nákres obrazovka C.
//
// · Záložky sú KLIKATEĽNÉ (Matej 25. 9.: „neviem prepnúť chipy hore") a žijú v ADRESE
//   (`?tab=`), aby späť v prehliadači vrátilo záložku a nie celú stránku.
// · Tlačidlá: ✕ nie · 💬 napísať · NOS áno (Matej 25. 9.: nos, nie fajka; šípka hore ZRUŠENÁ).
// · 💬 = áno + pripnutá správa, ktorá odíde AŽ PRI ZHODE (Matej 25. 9.). Bez zhody nič.
// · Swipe gestom aj tlačidlami. Prázdny balíček hovorí AINUBIS.
// · Zhoda = animované odhalenie `SnifferMatchReveal` (§2.6 D), nie to isté logo ako úvod.
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AinubisBubble } from '@/components/pack/ainubisSheet';
import { emitOpenThread } from '@/components/pack/messaging/openBridge';
import { withTransform } from '@/services/cloudinaryService';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, PACK_AVATAR,
  VEIL_CSS, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { SnifferCard, SNIFFER_CARD_CSS } from './SnifferCard';
import { SnifferSearch } from './SnifferSearch';
import { SnifferMatchReveal } from './SnifferMatchReveal';
import { SnifferFullProfile } from './SnifferFullProfile';
import { loadDeck, loadMatches, swipe, unmatch, type SnifferCardData, type SnifferMatch } from './snifferDeck';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;
type Tab = 'deck' | 'search' | 'matches';
const TABS: Array<[Tab, string]> = [['deck', 'Sniff'], ['search', 'Search'], ['matches', 'Matches']];

/** O koľko px treba kartu odtiahnuť, aby to bolo rozhodnutie a nie zaváhanie. */
const SWIPE_PX = 96;
const OUT_MS = 320;
/** Keď v balíčku ostanú dve karty, dotiahne sa ďalšia dávka. */
const REFILL_AT = 2;

const pic = (u?: string | null) => withTransform(u, 'c_fill,g_auto,w_240,h_240,f_auto,q_auto');

const CSS = `
.sh-tabs{display:flex;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.xs}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.border};background:${T.cardSoft};}
.sh-tabs button{flex:1 1 0;padding:${PACK_SPACE.sm}px;border:0;border-radius:${PACK_R.pill}px;background:transparent;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkFaint};}
.sh-tabs button.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.sh-pane{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.sh-pane--scroll{overflow-y:auto;margin:0 -${PACK_SPACE.xs}px;padding:0 ${PACK_SPACE.xs}px;}
.sh-deck{position:relative;flex:1 1 auto;min-height:360px;width:100%;max-width:440px;margin:0 auto;}
.sh-acts{display:flex;justify-content:center;align-items:flex-start;gap:${PACK_SPACE.xl}px;}
/* Plávajúci AINUBIS sedí vpravo dole — na úzkom mobile by rad pri medzere 24 px zasiahol
   pod neho popisok ÁNO. Rad sa preto zúži, AINUBIS sa neposúva. */
@media (max-width:419px){.sh-acts{gap:${PACK_SPACE.lg}px;}}
.sh-act{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.xs}px;font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;
  letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.sh-btn{width:${PACK_AVATAR.lg}px;height:${PACK_AVATAR.lg}px;border-radius:${PACK_R.pill}px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;border:1px solid ${T.border};background:${T.cardSoft};box-shadow:${PACK_SHADOW.panel};transition:transform .12s ease;}
.sh-btn:active{transform:scale(.94);}
.sh-btn:disabled{opacity:.45;cursor:default;}
.sh-btn--msg{width:${PACK_AVATAR.md}px;height:${PACK_AVATAR.md}px;margin-top:${PACK_SPACE.sm}px;}
.sh-btn--yes{border-color:${LAPIS.deep};background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};}
.sh-ico{display:block;background:currentColor;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;}
.sh-empty{margin:auto 0;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.sh-ghost{align-self:center;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;border:1px solid ${T.border};background:${T.cardSoft};
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};cursor:pointer;}
.sh-cta{width:100%;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;border:1px solid ${LAPIS.deep};
  background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};font-family:${FONT_TITLE};font-weight:700;
  font-size:${PACK_TEXT.body}px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;}
.sh-cta:disabled{opacity:.45;cursor:default;}
.sh-sheet{width:100%;max-width:420px;padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.sh-sheet h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.sh-note{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.sh-area{width:100%;min-height:96px;resize:vertical;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.sh-ghost--dark{background:transparent;color:${LAPIS.ink};}
/* ZHODY — riadky */
.sh-list{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sh-row{display:flex;align-items:center;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;}
.sh-row img{width:${PACK_AVATAR.md}px;height:${PACK_AVATAR.md}px;border-radius:${PACK_R.pill}px;object-fit:cover;flex:0 0 auto;}
.sh-row__txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;font-family:${FONT_UI};}
.sh-row__txt b{font-weight:600;font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.sh-row__txt small{font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.sh-new{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;color:${T.card};background:${T.growGreen};
  border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;}
.sh-mini{border:0;background:none;cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkWarm};text-decoration:underline;}
`;

function MaskIcon({ src, size, color }: { src: string; size: number; color: string }) {
  return <span className="sh-ico" aria-hidden style={{ width: size, height: size, color, ['--m' as string]: `url(${src})` }} />;
}

/** Zhody videné naposledy — len pohodlie tohto prehliadača (štítok NOVÁ). */
const SEEN_KEY = 'dogypt_sniffer_matches_seen';
const readSeen = (): number => { try { return Number(localStorage.getItem(SEEN_KEY)) || 0; } catch { return 0; } };
const writeSeen = (t: number) => { try { localStorage.setItem(SEEN_KEY, String(t)); } catch { /* bez úložiska nič */ } };

export function SnifferHome({ tx, me }: {
  tx: Tx;
  me: { photo: string | null; name: string; dogName: string | null };
}) {
  const [params, setParams] = useSearchParams();
  const tab: Tab = (['deck', 'search', 'matches'] as const).find((t) => t === params.get('tab')) ?? 'deck';
  const setTab = (t: Tab) => setParams((p) => { const n = new URLSearchParams(p); if (t === 'deck') n.delete('tab'); else n.set('tab', t); return n; });

  // ── balíček ────────────────────────────────────────────────────────────────
  const [deck, setDeck] = useState<SnifferCardData[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number; anim: boolean } | null>(null);
  const [composer, setComposer] = useState<{ card: SnifferCardData; send: (msg: string) => void } | null>(null);
  /** CELÝ PROFIL (kolo 2 §6.2) — z karty v balíčku aj z HĽADAŤ, tie isté tri tlačidlá. */
  const [peek, setPeek] = useState<SnifferCardData | null>(null);
  const [draft, setDraft] = useState('');
  const [match, setMatch] = useState<{ card: SnifferCardData; conv: string | null } | null>(null);
  const busy = useRef(false);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);

  const fetchDeck = useCallback(async () => {
    setErr(null);
    try {
      const fresh = await loadDeck(20);
      setDeck((cur) => {
        const have = new Set((cur ?? []).map((c) => c.member));
        return [...(cur ?? []), ...fresh.filter((c) => !have.has(c.member))];
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setDeck((cur) => cur ?? []);
    }
  }, []);

  useEffect(() => { void fetchDeck(); }, [fetchDeck]);

  const top = deck?.[0] ?? null;

  const decide = async (verdict: 'like' | 'pass', message?: string) => {
    if (!top || busy.current) return;
    busy.current = true;
    const dir = verdict === 'like' ? 1 : -1;
    setDrag({ dx: dir * window.innerWidth, dy: 0, anim: true });
    const req = swipe(top.member, verdict, message).catch((e) => {
      setErr(e instanceof Error ? e.message : String(e));
      return { match: false, conv: null };
    });
    window.setTimeout(async () => {
      setDeck((cur) => (cur ?? []).slice(1));
      setDrag(null);
      busy.current = false;
      const r = await req;
      if (r.match) setMatch({ card: top, conv: r.conv });
      if ((deck?.length ?? 0) - 1 <= REFILL_AT) void fetchDeck();
    }, OUT_MS);
  };

  /** Rozhodnutie z CELÉHO PROFILU — bez odletu karty, ten istý server. */
  const act = async (card: SnifferCardData, verdict: 'like' | 'pass', message?: string) => {
    setPeek(null);
    try {
      const r = await swipe(card.member, verdict, message);
      setDeck((cur) => (cur ?? []).filter((c) => c.member !== card.member));
      if (r.match) setMatch({ card, conv: r.conv });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busy.current || (e.target as HTMLElement).closest('.sn-tap')) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!start.current || start.current.id !== e.pointerId) return;
    setDrag({ dx: e.clientX - start.current.x, dy: (e.clientY - start.current.y) * 0.3, anim: false });
  };
  const onUp = () => {
    if (!start.current) return;
    start.current = null;
    const dx = drag?.dx ?? 0;
    if (dx > SWIPE_PX) void decide('like');
    else if (dx < -SWIPE_PX) void decide('pass');
    else setDrag(drag ? { dx: 0, dy: 0, anim: true } : null);
  };

  // ── zhody ──────────────────────────────────────────────────────────────────
  const [matches, setMatches] = useState<SnifferMatch[] | null>(null);
  const [seenAt] = useState(readSeen);
  useEffect(() => {
    if (tab !== 'matches') return;
    loadMatches().then((m) => { setMatches(m); writeSeen(Date.now()); }).catch((e) => setErr(String(e?.message ?? e)));
  }, [tab, match]);

  const ago = (iso: string) => {
    const h = Math.round((Date.now() - new Date(iso).getTime()) / 36e5);
    if (h < 1) return tx('pack.sniffer.justNow', 'just now');
    if (h < 24) return tx('pack.sniffer.hoursAgo', '{n} h ago', { n: h });
    const d = Math.round(h / 24);
    return d === 1 ? tx('pack.sniffer.yesterday', 'yesterday') : new Date(iso).toLocaleDateString();
  };

  const dragStyle = drag
    ? {
        transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx / 20}deg)`,
        opacity: Math.abs(drag.dx) >= window.innerWidth ? 0 : 1,
      }
    : undefined;

  return (
    <>
      <style>{SNIFFER_CARD_CSS}</style>
      <style>{VEIL_CSS}</style>
      <style>{CSS}</style>
      <div className="sh-tabs" role="tablist">
        {TABS.map(([k, en]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''}
            onClick={() => setTab(k)}>{tx(`pack.buddy.tab.${k}`, en)}</button>
        ))}
      </div>

      {tab === 'deck' && (
        <div className="sh-pane">
          {deck === null ? null : top ? (
            <>
              <div className="sh-deck">
                {deck[1] && <SnifferCard key={deck[1].member} card={deck[1]} tx={tx} back />}
                <div key={top.member} className="sn-card-wrap" style={{ position: 'absolute', inset: 0 }}
                  onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
                  <SnifferCard card={top} tx={tx} className={drag?.anim ? 'is-anim' : ''} style={dragStyle} onOpenFull={() => setPeek(top)} />
                </div>
              </div>
              <div className="sh-acts">
                <div className="sh-act">
                  <button type="button" className="sh-btn" aria-label={tx('pack.sniffer.no', 'No')} onClick={() => void decide('pass')}>
                    <MaskIcon src="/icons/pack/cross.svg" size={26} color={T.alertRed} />
                  </button>
                  {tx('pack.sniffer.no', 'No')}
                </div>
                <div className="sh-act">
                  <button type="button" className="sh-btn sh-btn--msg" aria-label={tx('pack.sniffer.write', 'Write')}
                    onClick={() => { setDraft(''); setComposer({ card: top, send: (m) => void decide('like', m) }); }}>
                    <MaskIcon src="/icons/pack/chat.svg" size={22} color={LAPIS.edge} />
                  </button>
                  {tx('pack.sniffer.write', 'Write')}
                </div>
                <div className="sh-act">
                  <button type="button" className="sh-btn sh-btn--yes" aria-label={tx('pack.sniffer.yes', 'Yes')} onClick={() => void decide('like')}>
                    <MaskIcon src="/icons/pack/nose.svg" size={30} color={LAPIS.ink} />
                  </button>
                  {tx('pack.sniffer.yes', 'Yes')}
                </div>
              </div>
            </>
          ) : (
            <div className="sh-empty">
              <AinubisBubble>
                {tx('pack.sniffer.empty', 'Nobody new around right now. As soon as someone who fits switches SNIFFER on, you’ll find them here.')}
              </AinubisBubble>
              <button type="button" className="sh-ghost" onClick={() => void fetchDeck()}>{tx('pack.sniffer.refresh', 'Try again')}</button>
            </div>
          )}
          {err && <p className="sh-note" style={{ color: PICK_INK.red, textAlign: 'center' }}>{err}</p>}
        </div>
      )}

      {tab === 'search' && (
        <div className="sh-pane sh-pane--scroll">
          <SnifferSearch tx={tx} onOpen={setPeek} />
        </div>
      )}

      {tab === 'matches' && (
        <div className="sh-pane">
          {matches && matches.length > 0 ? (
            <div className="sh-list">
              {matches.map((m) => {
                const isNew = new Date(m.matchedAt).getTime() > seenAt;
                return (
                  <div key={m.card.member} className="sh-row" style={{ ...PACK_BOX.row }}>
                    <img src={pic(m.card.photos[0] ?? m.card.dogs[0]?.photo)} alt="" />
                    <span className="sh-row__txt">
                      <b>{[m.card.name, m.card.dogs[0]?.name].filter(Boolean).join(' + ')}</b>
                      <small>{tx('pack.sniffer.matchedWhen', 'You caught each other’s scent · {when}', { when: ago(m.matchedAt) })}</small>
                    </span>
                    {isNew && <span className="sh-new">{tx('pack.sniffer.new', 'NEW')}</span>}
                    {m.conv && (
                      <button type="button" className="sh-mini" onClick={() => emitOpenThread(m.conv!)}>{tx('pack.sniffer.write', 'Write')}</button>
                    )}
                    <button type="button" className="sh-mini" onClick={async () => {
                      await unmatch(m.card.member);
                      setMatches((cur) => (cur ?? []).filter((x) => x.card.member !== m.card.member));
                    }}>{tx('pack.sniffer.unmatch', 'Cancel')}</button>
                  </div>
                );
              })}
            </div>
          ) : matches ? (
            <AinubisBubble>{tx('pack.sniffer.noMatches', 'No matches yet. A match is just a notice — whether you write is up to you.')}</AinubisBubble>
          ) : null}
        </div>
      )}

      {/* CELÝ PROFIL — nad závojom, s tými istými tlačidlami ako balíček */}
      {peek && (
        <div className="pk-veil pk-veil--modal" onClick={() => setPeek(null)}>
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <SnifferFullProfile card={peek} tx={tx} actions={(
              <>
                <button type="button" className="sh-btn" aria-label={tx('pack.sniffer.no', 'No')} onClick={() => void act(peek, 'pass')}>
                  <MaskIcon src="/icons/pack/cross.svg" size={26} color={T.alertRed} />
                </button>
                <button type="button" className="sh-btn sh-btn--msg" aria-label={tx('pack.sniffer.write', 'Write')}
                  onClick={() => { const c = peek; setDraft(''); setPeek(null); setComposer({ card: c, send: (m) => void act(c, 'like', m) }); }}>
                  <MaskIcon src="/icons/pack/chat.svg" size={22} color={LAPIS.edge} />
                </button>
                <button type="button" className="sh-btn sh-btn--yes" aria-label={tx('pack.sniffer.yes', 'Yes')} onClick={() => void act(peek, 'like')}>
                  <MaskIcon src="/icons/pack/nose.svg" size={30} color={LAPIS.ink} />
                </button>
              </>
            )} />
          </div>
        </div>
      )}

      {/* 💬 — áno s pripnutou správou */}
      {composer && (
        <div className="pk-veil pk-veil--modal" onClick={() => setComposer(null)}>
          <div className="sh-sheet" style={{ ...PACK_BOX.panel }} onClick={(e) => e.stopPropagation()}>
            <h3>{tx('pack.sniffer.writeTo', 'Write to {name}', { name: composer.card.name })}</h3>
            <textarea className="pf-field sh-area" autoFocus maxLength={1000} value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder={tx('pack.sniffer.writePh', 'Hi! …')} />
            <p className="sh-note">{tx('pack.sniffer.writeNote', 'It counts as a yes. The message is delivered only when you catch each other’s scent.')}</p>
            <button type="button" className="sh-cta" disabled={!draft.trim()} onClick={() => {
              const msg = draft.trim();
              const send = composer.send;
              setComposer(null);
              send(msg);
            }}>{tx('pack.sniffer.sendYes', 'Yes + message')}</button>
          </div>
        </div>
      )}

      {/* ZHODA — oznam (animovaný reveal príde v §2.6 D) */}
      {/* ZHODA — animované odhalenie (§2.6 D) */}
      {match && (
        <div className="pk-veil pk-veil--modal" onClick={() => setMatch(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <SnifferMatchReveal
              me={me.photo}
              them={match.card.photos[0] ?? match.card.dogs[0]?.photo ?? null}
              title={tx('pack.sniffer.matchTitle', 'You caught each other’s scent!')}
              names={[
                tx('pack.sniffer.youAnd', 'You and {name}', { name: match.card.name }),
                [me.dogName, match.card.dogs[0]?.name].filter(Boolean).join(tx('pack.sniffer.and', ' and ')),
              ].filter(Boolean).join(' · ')}
            >
              {match.conv && (
                <button type="button" className="sh-cta" onClick={() => { const c = match.conv!; setMatch(null); emitOpenThread(c); }}>
                  {tx('pack.sniffer.writeTo', 'Write to {name}', { name: match.card.name })}
                </button>
              )}
              <button type="button" className="sh-ghost sh-ghost--dark" onClick={() => setMatch(null)}>{tx('pack.sniffer.keepSniffing', 'Keep sniffing')}</button>
            </SnifferMatchReveal>
          </div>
        </div>
      )}
    </>
  );
}
