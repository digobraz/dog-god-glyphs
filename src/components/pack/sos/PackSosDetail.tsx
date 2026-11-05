// SOS — STRÁNKA STRATENÉHO PSA `/pack/sos/:slug` (kôš 2 · POZERÁM SA: lišta ostáva, hore šípka späť).
// Jedna stránka, dva pohľady: MOJA strata (`mine` z `sosMine`) a cudzia (len `lostPublic`).
//  · červený blok STRATIL SA + lokalita a čas · majiteľ: NAŠIEL SA hneď pod ním · cudzí: ZAVOLAŤ a VIDEL SOM HO
//  · fotka, meno, plemeno a farba, červený riadok · majiteľ: leták, zdieľanie, plán, „takto to vidí nálezca“, videnia
//  · `ended` = „Pátranie je vypnuté“ + HĽADÁM ĎALEJ (cudzí: ZAVOLAŤ, VIDEL SOM HO a leták žijú ďalej) · `found` = ďakovná časť bez telefónu · `asked_at` = „Stále hľadáš X?“
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { useT } from '@/i18n/LanguageContext';
import { sizedUrl } from '@/services/cloudinaryService';
import { lostUrl, sosFound, sosResume, sosStillSearching, type LostPublic, type SosMine } from '@/lib/sos';
import { PACK_BOX } from '@/components/pack/packTheme';
import { shareLostDog, sosInvalidate } from '@/components/pack/sosKit';
import type { SosKey } from './sosTexts';
import { AskPopup, CallPopup, FoundPopup, SeenPopup, copyLostLink } from './sosActions';
import { SosCard, SosStyles, colorWord, useBreedLabel, sosErrCode, sosPath, useBack, useSosLost, useSosT, useWhen, type SosT } from './sosShared';

const TL: Record<string, string> = { green: 'Mastered', amber: 'Depends', red: 'Still learning' };

function Facts({ pub, s, when, t }: { pub: LostPublic; s: SosT; when: (i: string) => string; t: (k: string) => string }) {
  const rows: Array<[string, string]> = [
    [s('pack.sos.det.lastSeen'), when(pub.last_seen_at)],
  ];
  if (pub.place_label) rows.push([s('pack.sos.det.place'), pub.place_label]);
  if (pub.recall && TL[pub.recall]) { const k = `pack.dogCard.traffic.${pub.recall}`; const v = t(k); rows.push([s('pack.sos.det.recall'), v !== k ? v : TL[pub.recall]]); }
  if (pub.temperament?.length) rows.push([s('pack.sos.det.temperament'), pub.temperament.map((x) => { const k = `pack.dogTag.${x}`; const v = t(k); return v !== k ? v : x; }).join(', ')]);
  if (pub.strangers_ok) rows.push([s('pack.sos.det.strangers'), s('pack.sos.yes')]);
  return (
    <SosCard>
      <h2 className="sos-eyebrow">{s('pack.sos.det.facts')}</h2>
      <div>{rows.map(([k, v], i) => (
        <div className="sos-fact" key={i}><small>{k}</small><span>{v}</span></div>
      ))}</div>
    </SosCard>
  );
}

export default function PackSosDetail() {
  const { slug } = useParams<{ slug: string }>();
  const breedLabel = useBreedLabel();
  const t = useT();
  const when = useWhen();
  const navigate = useNavigate();
  const back = useBack('/pack/map');
  const load = useSosLost(slug);
  const s = useSosT(load.state === 'ready' ? load.pub.dog_gender : null);
  const [pop, setPop] = useState<'call' | 'seen' | 'found' | 'ask' | null>(null);
  const [askClosed, setAskClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [runErr, setRunErr] = useState('');   // chyba akcie sa ukáže V popupe, ktorý ostane otvorený

  if (load.state !== 'ready') {
    return (
      <PackLayout onBack={back} backLabel={s('pack.sos.back')}>
        <SosStyles />
        <p className="sos-p" style={{ textAlign: 'center' }}>
          {load.state === 'loading' ? s('pack.sos.loading') : load.state === 'missing' ? s('pack.sos.notFound') : s('pack.sos.offline')}
        </p>
        {load.state === 'error' && <button type="button" className="sos-cta" onClick={load.reload}>{s('pack.sos.retry')}</button>}
      </PackLayout>
    );
  }

  const { pub, mine } = load;
  const own = !!mine;
  const status = (mine?.status ?? pub.status);
  const flyerUrl = mine?.flyer_url ?? pub.flyer_url;
  const sub = [breedLabel(pub.breed), colorWord(pub.color, s)].filter(Boolean).join(' · ');
  const placeWhen = [pub.place_label, when(pub.last_seen_at)].filter(Boolean).join(' · ');
  const askOpen = own && status === 'active' && !!mine?.asked_at && !askClosed;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setRunErr('');
    try { await fn(); setPop(null); load.reload(); }
    catch (e) {
      const code = sosErrCode(e);
      console.warn('sos', code);
      setRunErr(['rate_limited', 'no_access', 'bad_state'].includes(code) ? s(`pack.sos.err.${code}` as SosKey) : s('pack.sos.offline'));
    } finally { setBusy(false); }
  };
  const openPop = (p: 'call' | 'seen' | 'found' | 'ask' | null) => { setRunErr(''); setPop(p); };

  const FoundCta = own && mine ? (
    <button type="button" className="sos-cta sos-cta--green" onClick={() => openPop('found')}>{s('pack.sos.det.foundBtn')}</button>
  ) : null;

  return (
    <PackLayout onBack={back} backLabel={s('pack.sos.back')}>
      <SosStyles />
      <div className="sos-stack">
        {status === 'found' ? (
          <div className="sos-band sos-band--found"><b>{s('pack.sos.found')}</b><small>{s('pack.sos.pub.foundText')}</small></div>
        ) : status === 'ended' && !own ? (
          <div className="sos-band sos-band--ended"><b>{s('pack.sos.det.endedPublic')}</b><small>{s('pack.sos.pub.endedText')}</small></div>
        ) : (
          <div className="sos-band"><b>{s('pack.sos.lost')}</b><small>{placeWhen}</small></div>
        )}

        {status === 'active' && own && FoundCta}
        {status !== 'found' && !own && (
          <>
            <button type="button" className="sos-cta" onClick={() => setPop('call')}>{s('pack.sos.det.call')}</button>
            <button type="button" className="sos-cta sos-cta--ghost" onClick={() => setPop('seen')}>{s('pack.sos.det.seen')}</button>
          </>
        )}
        {status === 'ended' && own && mine && (
          <SosCard>
            <h2 className="sos-h2">{s('pack.sos.det.endedTitle')}</h2>
            <p className="sos-p">{s('pack.sos.det.endedText')}</p>
            <button type="button" className="sos-cta" disabled={busy} onClick={() => run(async () => { await sosResume(mine.id); sosInvalidate(); })}>{s('pack.sos.det.resume')}</button>
            {runErr && pop === null && <p className="sos-err">{runErr}</p>}
            {FoundCta}
          </SosCard>
        )}
        {status === 'found' && own && (
          <SosCard>
            <h2 className="sos-h2">{s('pack.sos.det.thanksTitle', { name: pub.dog_name })}</h2>
            <p className="sos-p">{s('pack.sos.det.thanksText')}</p>
            {mine && (
              <>
                <p className="sos-small">{s('pack.sos.det.foundMistake')}</p>
                <button type="button" className="sos-cta sos-cta--ghost" disabled={busy} onClick={() => run(async () => { await sosResume(mine.id); sosInvalidate(); })}>{s('pack.sos.det.resume')}</button>
              </>
            )}
          </SosCard>
        )}

        {pub.photo
          ? <img className="sos-photo" src={sizedUrl(pub.photo, 900)} alt={pub.dog_name} />
          : <div className="sos-photo sos-photo--none" />}
        <h1 className="sos-dogname">{pub.dog_name}</h1>
        {sub && <p className="sos-dogsub">{sub}</p>}
        {status === 'active' && <p className="sos-motto">{s('pack.sos.det.motto')}</p>}

        {status === 'active' && own && mine && (
          <button type="button" className="sos-cta" onClick={() => navigate(sosPath.flyer(mine.slug))}>
            {flyerUrl ? s('pack.sos.det.flyerEdit') : s('pack.sos.det.flyerMake')}
          </button>
        )}
        {status === 'active' && own && mine && (
          <button type="button" className="sos-cta sos-cta--tint" onClick={() => navigate(sosPath.plan(mine.slug))}>{s('pack.sos.det.plan')}</button>
        )}
        {status !== 'found' && (
          <div className="sos-two">
            <button type="button" className="sos-cta sos-cta--gold" onClick={() => void shareLostDog({ slug: pub.slug, name: pub.dog_name, flyerUrl: flyerUrl, text: s('pack.sos.det.shareText', { name: pub.dog_name }), copiedText: s('pack.sos.det.copied') })}>{s('pack.sos.det.share')}</button>
            <button type="button" className="sos-cta sos-cta--ghost" onClick={() => void copyLostLink(pub.slug, s)}>{s('pack.sos.det.copy')}</button>
          </div>
        )}

        {status !== 'found' && <Facts pub={pub} s={s} when={when} t={t} />}

        {own && mine && status !== 'found' && <OwnerBlock mine={mine} s={s} when={when} navigate={navigate} />}
      </div>

      {pop === 'call' && <CallPopup slug={pub.slug} name={pub.dog_name} s={s} onClose={() => setPop(null)} />}
      {pop === 'seen' && <SeenPopup slug={pub.slug} s={s} onClose={() => setPop(null)} />}
      {pop === 'found' && mine && <FoundPopup name={pub.dog_name} s={s} busy={busy} err={runErr} onYes={() => run(async () => { await sosFound(mine.id); sosInvalidate(); })} onClose={() => setPop(null)} />}
      {askOpen && pop !== 'found' && mine && (
        <AskPopup name={pub.dog_name} s={s} busy={busy} err={runErr} onClose={() => setAskClosed(true)}
          onStill={() => run(() => sosStillSearching(mine.id))} onFound={() => openPop('found')} />
      )}
    </PackLayout>
  );
}

/** Len pre majiteľa: SOS plán, „takto to vidí nálezca“, videnia, počty. */
function OwnerBlock({ mine, s, when, navigate }: { mine: SosMine; s: SosT; when: (i: string) => string; navigate: (p: string) => void }) {
  return (
    <>
      <p className="sos-eyebrow">{s('pack.sos.det.next')}</p>
      <div className="sos-stack" style={{ gap: 8 }}>
        <Link className="sos-row" style={{ ...PACK_BOX.row }} to={`/lost/${mine.slug}`}>
          <span className="grow"><b>{s('pack.sos.det.finderView')}</b><small>{lostUrl(mine.slug).replace(/^https?:\/\//, '')}</small></span>
        </Link>
      </div>
      <p className="sos-small">{s('pack.sos.det.stats', { shares: mine.shares, calls: mine.phone_reveals })}</p>
      <p className="sos-eyebrow">{s('pack.sos.det.sightings')}</p>
      {mine.sightings.length === 0 ? <p className="sos-p">{s('pack.sos.det.noSightings')}</p> : (
        <div className="sos-stack" style={{ gap: 8 }}>
          {mine.sightings.map((x) => (
            <div key={x.id} className="sos-row" style={{ ...PACK_BOX.row, cursor: 'default' }}>
              <span className="grow">
                <b>{x.note || s('pack.sos.det.sightingOne')}</b>
                <small>{when(x.seen_at ?? x.created_at)}
                  {x.lat == null || x.lng == null ? <> · {s('pack.sos.det.sightingNoLoc')}</> : <> · <a href={`https://mapy.com/?x=${x.lng}&y=${x.lat}&z=16&source=coor&id=${x.lng}%2C${x.lat}`} target="_blank" rel="noopener noreferrer">Mapy.com</a></>}
                </small>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
