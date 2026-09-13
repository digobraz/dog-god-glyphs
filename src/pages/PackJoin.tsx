// /pack/join/:token — PRIJATIE POZVÁNKY PAWMATA.
//
// Zadanie: `plany/zadanie-clenovia-svorky-2026-09-12.md` §5b. Serverová polovica
// je edge funkcia `accept-pawmate` (tri akcie: preview · sendLink · accept).
//
// 🔴 TÁTO STRÁNKA NIE JE ZA `DEV_FULL` ANI ZA ČLENSTVOM — a nesmie byť.
// Prichádza na ňu človek, ktorý ešte nemá účet ani psa; brána `/pack` ho odmietne
// z definície. Práve preto je to samostatná routa mimo `PackLayout`.
//
// ⚠️ Nič sa tu nerozhoduje o právach — o tom, čo pawmate smie, sa rozhodlo pri
// pozývaní (poradie PRÁVA → E-MAIL → POZVÁNKA → REGISTRÁCIA). Táto stránka len
// ukáže, čo dostávaš, a spýta sa, či to prijímaš.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';
import { PageTopBar } from '@/components/PageTopBar';
import { PACK_BOX, PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';

type Preview = {
  dogName: string;
  dogPhoto: string | null;
  packNumber: number | null;
  ownerFirst: string;
  role: string;
  rights: Record<string, boolean>;
  emailMasked: string;
};

type Phase =
  | { k: 'loading' }
  | { k: 'dead'; why: 'invalid' | 'expired' | 'already_accepted' }
  | { k: 'ready'; p: Preview }
  | { k: 'sent'; masked: string }
  | { k: 'wrong'; masked: string }
  | { k: 'full' }
  | { k: 'done'; dogName: string };

/** Poradie je zámerné: najprv to, čo pawmate uvidí, potom to, čo smie zmeniť. */
const RIGHT_ORDER = [
  'dogid.edit', 'dog.photo', 'trips.draw', 'trips.log',
  'map.notes', 'social', 'grid.message', 'will',
] as const;

export default function PackJoin() {
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };
  const { token = '' } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>({ k: 'loading' });
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const call = useCallback(async (action: string) => {
    const { data, error } = await supabase.functions.invoke('accept-pawmate', {
      body: { token, action },
    });
    // `invoke` hlási neúspešný HTTP kód ako `error` a telo zahodí, takže dôvod
    // („expired", „wrong_account") sa z neho nedá prečítať. Preto ho vyťahujeme
    // z `error.context` — inak by každé odmietnutie vyzeralo ako výpadok siete.
    if (error) {
      let body: Record<string, unknown> = {};
      try { body = await (error as { context?: Response }).context?.json?.() ?? {}; } catch { /* prázdne */ }
      return { err: (body.error as string) ?? 'network', body };
    }
    return { data: data as Record<string, unknown> };
  }, [token]);

  // Preview + kto je prihlásený. Obe naraz — od toho závisí, ktoré tlačidlo sa kreslí.
  useEffect(() => {
    let dead = false;
    (async () => {
      const [{ data: sess }, res] = await Promise.all([
        supabase.auth.getUser(),
        call('preview'),
      ]);
      if (dead) return;
      setEmail(sess?.user?.email ?? null);
      if ('err' in res) {
        const why = res.err === 'expired' || res.err === 'already_accepted' ? res.err : 'invalid';
        setPhase({ k: 'dead', why });
        return;
      }
      setPhase({ k: 'ready', p: res.data as unknown as Preview });
    })();
    return () => { dead = true; };
  }, [call]);

  async function onSendLink() {
    setBusy(true);
    const res = await call('sendLink');
    setBusy(false);
    if ('err' in res) { setPhase({ k: 'dead', why: 'invalid' }); return; }
    setPhase({ k: 'sent', masked: String(res.data.emailMasked ?? '') });
  }

  async function onAccept() {
    setBusy(true);
    const res = await call('accept');
    setBusy(false);
    if ('err' in res) {
      if (res.err === 'wrong_account') {
        setPhase({ k: 'wrong', masked: String((res.body.emailMasked as string) ?? '') });
      } else if (res.err === 'no_slots') {
        setPhase({ k: 'full' });
      } else if (res.err === 'unauthorized') {
        void onSendLink();
      } else {
        setPhase({ k: 'dead', why: 'invalid' });
      }
      return;
    }
    setPhase({ k: 'done', dogName: String(res.data.dogName ?? '') });
  }

  // Po prijatí ide človek do svorky. Tvrdý prechod, nie SPA navigácia: členstvo sa
  // číta pri načítaní modulov (rovnaký dôvod, prečo to tak robí `Login.tsx`).
  useEffect(() => {
    if (phase.k !== 'done') return;
    const id = setTimeout(() => { window.location.replace('/pack'); }, 2200);
    return () => clearTimeout(id);
  }, [phase.k]);

  return (
    <div style={{ minHeight: '100dvh', background: T.pageBg, color: T.onDark, fontFamily: FONT_UI }}>
      <PageTopBar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '8px 16px 56px' }}>
        <section style={{ ...PACK_BOX.card, padding: '26px 22px', color: T.ink }}>
          {phase.k === 'loading' && <Line>{tx('pack.join.loading', 'Otváram pozvánku…')}</Line>}

          {phase.k === 'dead' && (
            <>
              <Eyebrow>{tx('pack.join.eyebrow', 'Pozvánka do svorky')}</Eyebrow>
              <Title>{
                phase.why === 'already_accepted' ? tx('pack.join.usedTitle', 'Táto pozvánka už bola prijatá')
                : phase.why === 'expired' ? tx('pack.join.expiredTitle', 'Pozvánka vypršala')
                : tx('pack.join.invalidTitle', 'Táto pozvánka neplatí')
              }</Title>
              <Line>{
                phase.why === 'already_accepted'
                  ? tx('pack.join.usedBody', 'Prihlás sa a psa nájdeš vo svojej svorke.')
                  : tx('pack.join.expiredBody', 'Pozvánka platí sedem dní. Popros o novú toho, kto ťa pozval — trvá to jeden klik.')
              }</Line>
            </>
          )}

          {phase.k === 'ready' && (
            <>
              <Eyebrow>{tx('pack.join.eyebrow', 'Pozvánka do svorky')}</Eyebrow>
              {phase.p.dogPhoto && (
                <img
                  src={phase.p.dogPhoto}
                  alt={phase.p.dogName}
                  style={{
                    width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
                    display: 'block', margin: '4px 0 14px',
                    border: `2px solid ${T.cardEdge}`,
                  }}
                />
              )}
              <Title>
                {tx('pack.join.title', '{owner} ťa postavil vedľa psa {dog}')
                  .replace('{owner}', phase.p.ownerFirst)
                  .replace('{dog}', phase.p.dogName)}
              </Title>
              <Line>
                {tx('pack.join.body', 'V DOGYPTe pes nepatrí jednému človeku. Uvidíš, čo {dog} potrebuje — jedlo, zdravie, čoho sa bojí, kade chodil.')
                  .replace('{dog}', phase.p.dogName)}
              </Line>

              <RightsList rights={phase.p.rights} tx={tx} />

              {email && email.toLowerCase() !== '' && (
                <p style={{ ...sub, marginTop: 14 }}>
                  {tx('pack.join.signedAs', 'Si prihlásený ako {email}.').replace('{email}', email)}
                </p>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={email ? onAccept : onSendLink}
                style={cta(busy)}
              >
                {email
                  ? tx('pack.join.accept', 'PRIJAŤ POZVÁNKU')
                  : tx('pack.join.sendLink', 'POSLAŤ MI PRIHLASOVACÍ ODKAZ')}
              </button>

              <p style={{ ...sub, marginTop: 12 }}>
                {email
                  ? tx('pack.join.footNoteIn', 'Pozvánka je osobná a platí len pre adresu {masked}.').replace('{masked}', phase.p.emailMasked)
                  : tx('pack.join.footNoteOut', 'Odkaz pošleme na {masked} — na tú istú adresu, kam prišla pozvánka. Nič to nestojí: heroglyf patrí psovi a ten už ho má.').replace('{masked}', phase.p.emailMasked)}
              </p>
            </>
          )}

          {phase.k === 'sent' && (
            <>
              <Eyebrow>{tx('pack.join.eyebrow', 'Pozvánka do svorky')}</Eyebrow>
              <Title>{tx('pack.join.sentTitle', 'Pozri sa do schránky')}</Title>
              <Line>
                {tx('pack.join.sentBody', 'Poslali sme odkaz na {masked}. Jeden klik a si vo svorke. Odkaz funguje raz.')
                  .replace('{masked}', phase.masked)}
              </Line>
            </>
          )}

          {phase.k === 'wrong' && (
            <>
              <Eyebrow>{tx('pack.join.eyebrow', 'Pozvánka do svorky')}</Eyebrow>
              <Title>{tx('pack.join.wrongTitle', 'Táto pozvánka patrí inej adrese')}</Title>
              <Line>
                {tx('pack.join.wrongBody', 'Si prihlásený ako {email}, ale pozvánka prišla na {masked}. Odhlás sa a otvor odkaz znova.')
                  .replace('{email}', email ?? '—').replace('{masked}', phase.masked)}
              </Line>
              <button
                type="button"
                onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
                style={cta(false)}
              >
                {tx('pack.join.signOut', 'ODHLÁSIŤ SA')}
              </button>
            </>
          )}

          {phase.k === 'full' && (
            <>
              <Eyebrow>{tx('pack.join.eyebrow', 'Pozvánka do svorky')}</Eyebrow>
              <Title>{tx('pack.join.fullTitle', 'Miesto je už obsadené')}</Title>
              <Line>{tx('pack.join.fullBody', 'K tomuto psovi už niekto pribudol. Ozvi sa tomu, kto ťa pozval.')}</Line>
            </>
          )}

          {phase.k === 'done' && (
            <>
              <Eyebrow>{tx('pack.join.eyebrow', 'Pozvánka do svorky')}</Eyebrow>
              <Title>{tx('pack.join.doneTitle', 'Si vo svorke')}</Title>
              <Line>
                {tx('pack.join.doneBody', 'Vitaj pri psovi {dog}. Otváram svorku…').replace('{dog}', phase.dogName)}
              </Line>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

// ── kúsky ───────────────────────────────────────────────────────────────────
const sub: React.CSSProperties = {
  fontFamily: FONT_UI, fontSize: 12, lineHeight: 1.6, color: T.inkWarm, margin: 0,
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_UI, fontSize: 11, fontWeight: 500, letterSpacing: '.26em',
      textTransform: 'uppercase', color: T.cardEdge, marginBottom: 8,
    }}>{children}</div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{
      fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 22, lineHeight: 1.25,
      color: T.inkStrong, margin: '0 0 10px', textWrap: 'balance',
    }}>{children}</h1>
  );
}

function Line({ children }: { children: React.ReactNode }) {
  return <p style={{ ...sub, fontSize: 13.5, margin: '0 0 4px' }}>{children}</p>;
}

/** CTA na papyruse = LAPIS (lock 28. 8. 2026), geometria z `.btn-gold` — radius 8, nie pilulka. */
function cta(busy: boolean): React.CSSProperties {
  return {
    display: 'block', width: '100%', marginTop: 18, padding: '12px 18px',
    background: LAPIS.grad, color: LAPIS.ink, border: 'none', borderRadius: 8,
    fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 14, letterSpacing: '.06em',
    textTransform: 'uppercase', cursor: busy ? 'default' : 'pointer',
    opacity: busy ? 0.6 : 1, boxShadow: LAPIS_BTN_SHADOW,
  };
}

function RightsList({ rights, tx }: { rights: Record<string, boolean>; tx: (k: string, f: string) => string }) {
  const granted = RIGHT_ORDER.filter((r) => rights[r]);
  const label: Record<string, [string, string]> = {
    'dogid.edit':   ['pack.join.r.dogid', 'upravovať DOG ID'],
    'dog.photo':    ['pack.join.r.photo', 'meniť fotku psa'],
    'trips.draw':   ['pack.join.r.draw', 'kresliť výlety'],
    'trips.log':    ['pack.join.r.log', 'zapisovať prejdené výlety'],
    'map.notes':    ['pack.join.r.notes', 'pridávať značky na mapu'],
    'social':       ['pack.join.r.social', 'písať v mene svorky'],
    'grid.message': ['pack.join.r.grid', 'odkaz na WALL'],
    'will':         ['pack.join.r.will', 'upravovať závet'],
  };
  return (
    <div style={{ ...PACK_BOX.subblock, padding: '13px 15px', marginTop: 16 }}>
      <div style={{ ...sub, color: T.inkStrong, fontWeight: 600, marginBottom: 6 }}>
        {tx('pack.join.rightsTitle', 'Čo budeš môcť')}
      </div>
      {/* Čítanie má KAŽDÝ člen a nedá sa odškrtnúť — preto stojí mimo zoznamu
          zaškrtávacích práv, nie ako prvá odrážka s fajkou. */}
      <p style={{ ...sub, margin: '0 0 6px' }}>
        {tx('pack.join.rightsBase', 'Vidieť o psovi všetko — zdravie, jedlo, výlety.')}
      </p>
      {granted.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {granted.map((r) => (
            <li key={r} style={{ ...sub, marginBottom: 2 }}>{tx(label[r][0], label[r][1])}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
