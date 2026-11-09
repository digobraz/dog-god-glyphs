// SOS — STRÁNKA STRATENÉHO PSA `/pack/sos/:slug` (kôš 2 · POZERÁM SA: lišta ostáva, hore šípka späť).
// Jedna stránka, dva pohľady: MOJA strata (`mine` z `sosMine`) a cudzia (len `lostPublic`).
//  · červený blok STRATIL SA + lokalita a čas · majiteľ: NAŠIEL SA hneď pod ním · cudzí: ZAVOLAŤ a VIDEL SOM HO
//  · fotka, meno, plemeno a farba, červený riadok · majiteľ: leták, zdieľanie, plán, „takto to vidí nálezca“, videnia
//  · `ended` = „Pátranie je vypnuté“ + HĽADÁM ĎALEJ (cudzí: ZAVOLAŤ, VIDEL SOM HO a leták žijú ďalej) · `asked_at` = „Stále hľadáš X?“
//  · koniec pátrania (5. 11. 2026): NAŠIEL SA najprv pýta, ako sa skončilo. `found` (živý) = zelená, čísla, denník, bez telefónu ·
//    `deceased` (nežije, verejne `closed`) = úprimné slová, žiadna zelená, žiadne zdieľanie, telefón/leták/VIDEL SOM HO preč.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { sizedUrl } from '@/services/cloudinaryService';
import { lostUrl, sosClose, sosDiaryEvent, sosDiaryMark, sosResume, sosStillSearching, type LostOutcome, type LostPublic, type SosMine } from '@/lib/sos';
import { PACK_BOX } from '@/components/pack/packTheme';
import { APP_NEW } from '@/lib/packFlags';
import { shareLostDog, sosInvalidate } from '@/components/pack/sosKit';
import { MemorialControl } from '@/components/pack/MemorialControl';
import { DiaryEntry, type DiaryEditTarget } from '@/components/pack/diary/DiaryEntry';
import { appendDogEvents } from '@/lib/dogEvents';
import { dayToRecordedAt, todayKey } from '@/components/pack/diary/diaryModel';
import type { SosKey } from './sosTexts';
import { AskPopup, CallPopup, SeenPopup, copyLostLink } from './sosActions';
import { ClosePopup, GonePopup, SosNumbers, type GoneStep } from './sosClose';
import { readSosMilestone, writeSosMilestone } from './sosDiary';
import { SosCard, SosStyles, colorWord, useBreedLabel, sosErrCode, sosPath, useBack, useSosCount, useSosLost, useSosT, useWhen, type SosT } from './sosShared';

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
  const { lang } = useLang();
  const when = useWhen();
  const navigate = useNavigate();
  const back = useBack('/pack/map');
  const load = useSosLost(slug);
  const s = useSosT(load.state === 'ready' ? load.pub.dog_gender : null);
  const count = useSosCount();
  const [pop, setPop] = useState<'call' | 'seen' | 'close' | 'ask' | null>(null);
  const [askClosed, setAskClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [runErr, setRunErr] = useState('');   // chyba akcie sa ukáže V popupe, ktorý ostane otvorený
  // „Nežije“: slová → ponuka anjela (len majiteľ) → denník na jeho ťuk. `angelOpen` = výber dňa v `MemorialControl`.
  const [goneStep, setGoneStep] = useState<GoneStep | null>(null);
  const [angelOpen, setAngelOpen] = useState(false);
  const [goneDiary, setGoneDiary] = useState<{ busy: boolean; done: boolean; err: string }>({ busy: false, done: false, err: '' });
  // Zápis „živý“ do denníka (míľnik), ktorý sa dá upraviť.
  const [diary, setDiary] = useState<DiaryEditTarget | null>(null);
  const [diaryEdit, setDiaryEdit] = useState(false);
  const diaryTried = useRef<string | null>(null);
  const loaded = load.state === 'ready' ? load : null;
  const mineRow = loaded?.mine ?? null;
  const pubRow = loaded?.pub ?? null;

  // Pri „živý“ vznikne zápis do denníka SÁM, raz na stratu (poistka v DB), a len u majiteľa (pawmate denník nepíše).
  useEffect(() => {
    const m = mineRow, p = pubRow;
    if (!m || !p || m.status !== 'found' || m.outcome !== 'alive' || !m.is_owner) { setDiary(null); return; }
    let alive = true;
    (async () => {
      let id = m.diary_event;
      if (!id && !m.diary_at && diaryTried.current !== m.id) {
        diaryTried.current = m.id;
        const claimed = await sosDiaryMark(m.id).catch(() => false);
        if (claimed) {
          try {
            const text = diaryFoundText(s, count, p.dog_name, m);
            id = await writeSosMilestone(m.dog_id, text, m.found_at);
            await sosDiaryEvent(m.id, id);
            if (alive) load.reload();
          } catch { await sosDiaryMark(m.id, false).catch(() => {}); }
        }
      }
      if (id) { const t = await readSosMilestone(id); if (alive) setDiary(t); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mineRow?.id, mineRow?.status, mineRow?.diary_event, mineRow?.diary_at]);

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
  const gone = status === 'deceased' || status === 'closed';   // nežije: navonok len „ukončené“
  const finished = status === 'found' || gone;                 // koniec pátrania: bez telefónu, letáka a zdieľania
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
  const openPop = (p: 'call' | 'seen' | 'close' | 'ask' | null) => { setRunErr(''); setPop(p); };

  const FoundCta = own && mine ? (
    <button type="button" className="sos-cta sos-cta--green" onClick={() => openPop('close')}>{s('pack.sos.det.foundBtn')}</button>
  ) : null;

  const pick = (o: LostOutcome) => {
    if (!mine) return;
    void run(async () => {
      await sosClose(mine.id, o);
      sosInvalidate();
      if (o === 'deceased') { setGoneDiary({ busy: false, done: false, err: '' }); setGoneStep('words'); }
    });
  };
  const goneDiaryText = mine ? s('pack.sos.gone.diaryText', { name: pub.dog_name, days: count.days(mine.search_days) }) : '';
  const writeGoneDiary = async (text: string) => {
    if (!mine) return;
    setGoneDiary({ busy: true, done: false, err: '' });
    try {
      await appendDogEvents([{ dogId: mine.dog_id, field: 'diary.milestone', value: { text }, source: 'profile', recordedAt: dayToRecordedAt(todayKey()) }]);
      setGoneDiary({ busy: false, done: true, err: '' });
    } catch { setGoneDiary({ busy: false, done: false, err: s('pack.sos.error') }); }
  };
  const diaryTx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };

  // Papyrus 3D (J4): fotka a pás STRATIL SA tvoria jeden blok hore, meno hneď pod ním (hárok), pod APP_NEW.
  const photoEl = pub.photo
    ? <img className="sos-photo" src={sizedUrl(pub.photo, 900)} alt={pub.dog_name} />
    : <div className="sos-photo sos-photo--none" />;
  const nameEl = (
    <>
      <h1 className="sos-dogname">{pub.dog_name}</h1>
      {sub && <p className="sos-dogsub">{sub}</p>}
      {status === 'found' && !own && pub.search_days != null && (
        <p className="sos-dogsub">{pub.shares ? s('pack.sos.pub.searched', { days: count.days(pub.search_days), shares: count.shares(pub.shares) }) : s('pack.sos.pub.searched0', { days: count.days(pub.search_days) })}</p>
      )}
    </>
  );
  const band = (
    <>
        {status === 'found' ? (
          <div className="sos-band sos-band--found"><b>{s('pack.sos.found')}</b><small>{own ? s('pack.sos.alive.thanks') : s('pack.sos.pub.foundText')}</small></div>
        ) : gone ? (
          <div className="sos-band sos-band--ended"><b>{s('pack.sos.det.endedPublic')}</b><small>{s('pack.sos.pub.closedText')}</small></div>
        ) : status === 'ended' && !own ? (
          <div className="sos-band sos-band--ended"><b>{s('pack.sos.det.endedPublic')}</b><small>{s('pack.sos.pub.endedText')}</small></div>
        ) : (
          <div className="sos-band"><b>{s('pack.sos.lost')}</b><small>{placeWhen}</small></div>
        )}
    </>
  );

  return (
    <PackLayout onBack={back} backLabel={s('pack.sos.back')}>
      <SosStyles />
      <div className="sos-stack">
        {APP_NEW ? <><div className="sos-hero">{photoEl}{band}</div>{nameEl}</> : band}

        {status === 'active' && own && FoundCta}
        {!finished && !own && (APP_NEW ? (
          // Papyrus 3D (J4): ZAVOLAŤ červené (význam), VIDEL SOM HO lapis, vedľa seba
          <div className="sos-two">
            <button type="button" className="sos-cta sos-cta--red" onClick={() => setPop('call')}>{s('pack.sos.det.call')}</button>
            <button type="button" className="sos-cta" onClick={() => setPop('seen')}>{s('pack.sos.det.seen')}</button>
          </div>
        ) : (
          <>
            <button type="button" className="sos-cta" onClick={() => setPop('call')}>{s('pack.sos.det.call')}</button>
            <button type="button" className="sos-cta sos-cta--ghost" onClick={() => setPop('seen')}>{s('pack.sos.det.seen')}</button>
          </>
        ))}
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
            {mine && mine.marked_by_other && (
              <p className="sos-small">{mine.found_by_name ? s('pack.sos.alive.markedBy', { who: mine.found_by_name }) : s('pack.sos.alive.markedByMate')}</p>
            )}
            {mine && <SosNumbers mine={mine} s={s} />}
            {mine && diary && (
              <div className="sos-diaryrow" style={{ ...PACK_BOX.row }}>
                <span aria-hidden>⭐</span>
                <span className="grow">
                  <b>{s('pack.sos.alive.diaryRow')}</b>
                  <small>{new Date(diary.recordedAt).toLocaleDateString(intlLocale(lang), { day: 'numeric', month: 'numeric', year: 'numeric' })} · {s('pack.sos.alive.milestone')}</small>
                </span>
                <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm" style={{ width: 'auto' }} onClick={() => setDiaryEdit(true)}>{s('pack.sos.alive.diaryEdit')}</button>
              </div>
            )}
            <button type="button" className="sos-cta sos-cta--gold" onClick={() => void shareLostDog({ slug: pub.slug, name: pub.dog_name, flyerUrl: null, text: s('pack.sos.alive.shareText', { name: pub.dog_name }), copiedText: s('pack.sos.det.copied') })}>{s('pack.sos.alive.share')}</button>
            {mine && (
              <>
                <p className="sos-small">{s('pack.sos.det.foundMistake')}</p>
                {runErr && pop === null && <p className="sos-err">{runErr}</p>}
                <button type="button" className="sos-cta sos-cta--ghost" disabled={busy} onClick={() => run(async () => { await sosResume(mine.id); sosInvalidate(); })}>{s('pack.sos.det.resume')}</button>
              </>
            )}
          </SosCard>
        )}
        {status === 'deceased' && own && mine && (
          <SosCard>
            <p className="sos-p">{s('pack.sos.gone.words', { name: pub.dog_name })}</p>
            {mine.marked_by_other && (
              <p className="sos-small">{mine.found_by_name ? s('pack.sos.alive.markedBy', { who: mine.found_by_name }) : s('pack.sos.alive.markedByMate')}</p>
            )}
            {mine.phone !== '' && (
              <>
                <p className="sos-small">{s('pack.sos.det.foundMistake')}</p>
                {runErr && pop === null && <p className="sos-err">{runErr}</p>}
                <button type="button" className="sos-cta sos-cta--ghost" disabled={busy} onClick={() => run(async () => { await sosResume(mine.id); sosInvalidate(); })}>{s('pack.sos.det.resume')}</button>
              </>
            )}
          </SosCard>
        )}

        {!APP_NEW && photoEl}
        {!APP_NEW && nameEl}
        {status === 'active' && <p className="sos-motto">{s('pack.sos.det.motto')}</p>}

        {status === 'active' && own && mine && (
          <button type="button" className="sos-cta" onClick={() => navigate(sosPath.flyer(mine.slug))}>
            {flyerUrl ? s('pack.sos.det.flyerEdit') : s('pack.sos.det.flyerMake')}
          </button>
        )}
        {status === 'active' && own && mine && (
          <button type="button" className="sos-cta sos-cta--tint" onClick={() => navigate(sosPath.plan(mine.slug))}>{s('pack.sos.det.plan')}</button>
        )}
        {!finished && (
          <div className="sos-two">
            <button type="button" className="sos-cta sos-cta--gold" onClick={() => void shareLostDog({ slug: pub.slug, name: pub.dog_name, flyerUrl: flyerUrl, text: s('pack.sos.det.shareText', { name: pub.dog_name }), copiedText: s('pack.sos.det.copied') })}>{s('pack.sos.det.share')}</button>
            <button type="button" className="sos-cta sos-cta--ghost" onClick={() => void copyLostLink(pub.slug, s)}>{s('pack.sos.det.copy')}</button>
          </div>
        )}

        {!finished && <Facts pub={pub} s={s} when={when} t={t} />}

        {own && mine && !finished && <OwnerBlock mine={mine} s={s} when={when} navigate={navigate} />}
      </div>

      {pop === 'call' && <CallPopup slug={pub.slug} name={pub.dog_name} s={s} onClose={() => setPop(null)} />}
      {pop === 'seen' && <SeenPopup slug={pub.slug} s={s} onClose={() => setPop(null)} />}
      {pop === 'close' && mine && (
        <ClosePopup name={pub.dog_name} s={s} mate={!mine.is_owner} busy={busy} err={runErr} onPick={pick} onClose={() => setPop(null)} />
      )}
      {goneStep && mine && !angelOpen && (
        <GonePopup name={pub.dog_name} s={s} owner={mine.is_owner} step={goneStep} diaryText={goneDiaryText}
          diaryDone={goneDiary.done} diaryBusy={goneDiary.busy} diaryErr={goneDiary.err}
          onStep={setGoneStep} onAngel={() => setAngelOpen(true)} onDiary={(x) => void writeGoneDiary(x)}
          onClose={() => { setGoneStep(null); load.reload(); }} />
      )}
      {mine && mine.is_owner && (
        <MemorialControl dogId={mine.dog_id} dogName={pub.dog_name} isDeceased={false} deathDate={null} birthYear={null} poss="" gender={pub.dog_gender}
          open={angelOpen} initialStep="date"
          onClose={() => { setAngelOpen(false); setGoneStep((x) => (x ? 'done' : x)); }}
          onSaved={() => { sosInvalidate(); }} />
      )}
      {diaryEdit && diary && (
        <DiaryEntry dogs={[{ id: diary.dogId, name: pub.dog_name }]} edit={diary} onClose={() => setDiaryEdit(false)}
          onSaved={() => { setDiaryEdit(false); load.reload(); }} tx={diaryTx} />
      )}
      {askOpen && pop !== 'close' && mine && (
        <AskPopup name={pub.dog_name} s={s} busy={busy} err={runErr} onClose={() => setAskClosed(true)}
          onStill={() => run(() => sosStillSearching(mine.id))} onFound={() => openPop('close')} />
      )}
    </PackLayout>
  );
}

/** Text míľnika „živý“: deň a počet zdieľaní. Bez zdieľaní krátka verzia. */
function diaryFoundText(s: SosT, count: ReturnType<typeof useSosCount>, name: string, m: SosMine): string {
  const days = count.daysAfter(m.search_days);
  return m.shares > 0
    ? s('pack.sos.diary.found', { name, days, shares: m.shares })
    : s('pack.sos.diary.found0', { name, days });
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
