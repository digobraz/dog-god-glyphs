// /will/:token (aj /zavet/:token) — ZÁVET PRE DEDIČA, bez konta (23. 10. 2026).
//
// Matej: *„človek klikne na CTA v maili, odkáže ho na url závetu s heslom, napíše heslo a otvorí sa
// záveť s možnosťou — prevziať psa, prečítať záveť, zrušiť … do domyslíme, ale ten proces už postavme"*.
//
// Server = edge funkcia `will` (hint · open · claim · decline). Od 23. 10. (kolo 3) BEZ HESLA: odkaz otvorí
// závet po kontrolnej otázke a pawtner dostane upozornenie. Pole `answer` ostáva pre závety s heslom.
// 🔴 Rovnako ako `/pack/join` stojí MIMO `/pack` a mimo členstva: dedič účet nemá a mať nemusí.
// ⚠️ PREVZIAŤ PSA tu nie je — pri dôvode ÚMRTIE rozhoduje DOGYPT ručne (správa na AINUBIS + mail pawtnerovi).
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { PageTopBar } from '@/components/PageTopBar';
import { PACK_BOX, PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { HieroglyphBg } from '@/components/pack/PackLayout';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { sizedUrl } from '@/services/cloudinaryService';
import { willAct, willHint, type WillHint, type WillOpen, type WillReason } from '@/lib/willAccess';

type Phase =
  | { k: 'loading' }
  | { k: 'dead' }
  | { k: 'ask'; h: WillHint }
  | { k: 'why'; h: WillHint }
  | { k: 'open'; h: WillHint; w: WillOpen };

const DOG_FONT = "'Cinzel Decorative', 'Cinzel', serif";

export default function PackWill() {
  const { token = '' } = useParams();
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>({ k: 'loading' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    willHint(token).then((r) => setPhase(r.ok ? { k: 'ask', h: r.data } : { k: 'dead' }));
  }, [token]);

  const act = async (action: 'open', reason: WillReason) => {
    if (phase.k === 'loading' || phase.k === 'dead' || busy) return;
    setBusy(true);
    setErr(null);
    const r = await willAct(token, action, reason);
    setBusy(false);
    if (r.ok) { setPhase({ k: 'open', h: phase.h, w: r.data }); return; }
    if (r.code === 'not_found') { setPhase({ k: 'dead' }); return; }
    setErr(r.code === 'locked' ? tx('will.locked', 'Too many tries. Try again in an hour.') : tx('will.error', 'Something went wrong. Try again in a moment.'));
  };

  // DÔVOD OTVORENIA — len DVE možnosti (Matej 23. 10., kolo 6: „úmrtie alebo je na dovolenke/strážim").
  // Server pozná aj `info`, UI ho už neponúka.
  const REASONS: Array<[WillReason, string, string]> = [
    ['death', 'will.rDeath', 'The owner passed away'],
    ['sitting', 'will.rSitting', 'They are away, I am looking after the dog'],
  ];

  return (
    // TMAVÝ CHRÁM (Matej 23. 10., kolo 4: „pozadie bude tmavý chrám"). Brand v4.1: temple = len pozadie,
    // text sedí na papyrusovej karte (`PACK_BOX.card`).
    <div className="relative" style={{ fontFamily: FONT_UI, display: 'flex', flexDirection: 'column', minHeight: '100dvh', backgroundColor: T.pageBg }}>
      <HieroglyphBg />
      <div className="relative" style={{ zIndex: 1 }}><PageTopBar /></div>
      {/* Karta v strede — `margin:auto` na dieťati, nie justify-center (lock PAGE_AIR). */}
      <div className="relative" style={{ zIndex: 1, width: '100%', maxWidth: 560, margin: 'auto', padding: `${S.lg}px ${S.lg}px ${S.xxl}px`, boxSizing: 'border-box' }}>
        <section style={{ ...PACK_BOX.card, padding: S.xl, color: T.ink, textAlign: 'center' }}>
          {phase.k === 'loading' && <Line>{tx('will.loading', 'Opening the will')}</Line>}

          {phase.k === 'dead' && (
            <>
              <Title>{tx('will.deadTitle', 'This will is not available')}</Title>
              <Line>{tx('will.deadBody', 'The link is not valid, or the pawtner cancelled the will.')}</Line>
              <button type="button" style={cta(false)} onClick={() => navigate('/')}>{tx('pack.join.home', 'BACK TO DOGYPT')}</button>
            </>
          )}

          {phase.k === 'ask' && (
            <>
              {/* KONTROLNÁ OTÁZKA namiesto hesla (Matej 23. 10., kolo 3): otvoriť sa dá hneď, ale pawtner
                  dostane upozornenie — „nech to človek nezneužíva". */}
              <Eyebrow>{tx('will.eyebrow', 'Will')}</Eyebrow>
              <Title>{tx('will.askTitle', '{owner} left a will for you').replace('{owner}', phase.h.owner)}</Title>
              <Line>{tx('will.gateQ', 'Is it truly necessary to open it now?')}</Line>
              <p style={{ ...sub, marginTop: S.sm }}>{tx('will.gateNote', '{owner} gets a notice that you opened it.').replace('{owner}', phase.h.owner)}</p>
              {err && <p style={{ ...sub, color: T.alertRed, marginTop: S.sm }}>{err}</p>}
              <button type="button" style={cta(false)} onClick={() => setPhase({ k: 'why', h: phase.h })}>{tx('will.gateYes', 'Yes, open the will')}</button>
              <button type="button" style={ghost} onClick={() => navigate('/')}>{tx('will.gateNo', 'Not now')}</button>
            </>
          )}

          {phase.k === 'why' && (
            <>
              <Eyebrow>{tx('will.eyebrow', 'Will')}</Eyebrow>
              <Title>{tx('will.whyTitle', 'What happened to the owner?')}</Title>
              <p style={{ ...sub, marginBottom: S.sm }}>{tx('will.whyNote', '{owner} will see your answer.').replace('{owner}', phase.h.owner)}</p>
              {REASONS.map(([r, k, f]) => (
                <button key={r} type="button" style={{ ...ghost, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={() => act('open', r)}>{tx(k, f)}</button>
              ))}
              {err && <p style={{ ...sub, color: T.alertRed, marginTop: S.sm }}>{err}</p>}
            </>
          )}

          {phase.k === 'open' && (
            <>
              <Eyebrow>{tx('will.eyebrow', 'Will')}</Eyebrow>
              <Title>{tx('will.openTitle', 'The will of {owner}').replace('{owner}', phase.w.owner)}</Title>
              {phase.w.dogs.map((d, i) => (
                <div key={i} style={{ marginTop: S.lg, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: S.md }}>
                    {d.photo && (
                      <img src={sizedUrl(d.photo, 160)} alt="" style={{
                        width: 64, height: 64, borderRadius: PACK_R.pill, objectFit: 'cover', border: `2px solid ${T.cardEdge}`,
                        filter: d.angel ? 'grayscale(1)' : undefined,
                      }} />
                    )}
                    <span style={{ fontFamily: DOG_FONT, fontWeight: 700, fontSize: PACK_TEXT.h2, color: T.inkStrong }}>
                      {d.name}
                      {d.number != null && (
                        <span style={{ marginLeft: S.sm, background: LAPIS.grad, color: LAPIS.ink, fontFamily: FONT_TITLE, fontSize: PACK_TEXT.micro, padding: `0 ${S.sm}px`, borderRadius: PACK_R.pill, verticalAlign: 'middle' }}>#{d.number}</span>
                      )}
                    </span>
                  </div>
                  <div style={{
                    marginTop: S.md, padding: S.md, borderRadius: PACK_R.tile, background: T.tileBg, borderLeft: `3px solid ${T.accentGold}`,
                    fontSize: PACK_TEXT.body, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: d.letter ? T.ink : T.inkFaint,
                  }}>
                    {d.letter || tx('will.noLetter', 'No letter was written for this dog yet.')}
                  </div>
                </div>
              ))}

              {/* PREVZIAŤ PSA tu NIE JE (Matej 23. 10.: „prevziať psa tam nebude, o tom rozhodneme my ručne,
                  ak človek napíše úmrtie"). Pri úmrtí dostane len vetu, že sa mu ozveme. */}
              {phase.w.reason === 'death' && (
                <p style={{ ...sub, marginTop: S.lg, color: T.inkStrong }}>{tx('will.deathNote', 'Thank you for letting us know. We will contact you by e-mail about the dog.')}</p>
              )}
              {err && <p style={{ ...sub, color: T.alertRed, marginTop: S.sm }}>{err}</p>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

const sub: React.CSSProperties = { fontFamily: FONT_UI, fontSize: PACK_TEXT.label, lineHeight: 1.6, color: T.inkWarm, margin: 0 };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: PACK_TEXT.micro, letterSpacing: '.26em', textTransform: 'uppercase', color: T.inkDim, marginBottom: S.sm }}>
      {children}
    </div>
  );
}
function Title({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: PACK_TEXT.h2, lineHeight: 1.25, color: T.inkStrong, margin: `0 0 ${S.sm}px`, textWrap: 'balance' }}>{children}</h1>;
}
function Line({ children }: { children: React.ReactNode }) {
  return <p style={{ ...sub, fontSize: PACK_TEXT.body, margin: `0 0 ${S.xs}px` }}>{children}</p>;
}
/** CTA na papyruse = LAPIS, radius 8 (rovnako ako `/pack/join`). */
function cta(off: boolean): React.CSSProperties {
  return {
    display: 'block', width: '100%', marginTop: S.lg, padding: `${S.md}px ${S.lg}px`, minHeight: 44,
    background: LAPIS.grad, color: LAPIS.ink, border: 'none', borderRadius: PACK_R.field,
    fontFamily: FONT_TITLE, fontWeight: 700, fontSize: PACK_TEXT.body, letterSpacing: '.02em',
    textTransform: 'uppercase', cursor: off ? 'default' : 'pointer', opacity: off ? 0.6 : 1, boxShadow: LAPIS_BTN_SHADOW,
  };
}
const ghost: React.CSSProperties = {
  display: 'block', width: '100%', marginTop: S.sm, padding: `${S.md}px ${S.lg}px`, minHeight: 44, background: 'transparent',
  color: LAPIS.edge, border: `1.5px solid ${LAPIS.edge}`, borderRadius: PACK_R.field, fontFamily: FONT_TITLE, fontWeight: 700,
  fontSize: PACK_TEXT.label, letterSpacing: '.02em', textTransform: 'uppercase', cursor: 'pointer',
};
