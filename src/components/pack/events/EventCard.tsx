// KARTA PODUJATIA — JEDNA, nech je kdekoľvek (lock architektúry §4.1).
//
// Vlna 2 (25. 9. 2026, plany/zadanie-podujatia-funkcne-2026-09-24.md §5.2): karta už nie je
// len náhľad z `localStorage`. Nesie celý život podujatia — prihlásenie IDEM / MÁM ZÁUJEM,
// kto ide, diskusiu, úpravu a zrušenie pre autora a po začiatku otázku „uskutočnilo sa?",
// za ktorú organizátor dostane +10 bodov (Matej 24. 9.).
//
// Pin na mape otvára TÚTO kartu, nie novú obrazovku; upozornenie z NOS tiež
// (`/pack/map?event=<id>`). Akcia na karte nikdy neodnesie človeka preč (lock §4.2).
//
// ⚠️ Karta už NIE JE `<a>` pri tipe. Do 24. 9. klik na celý tip otvoril cudzí web, takže sa
//    pri ňom nedalo prihlásiť ani diskutovať. Odkaz na originál je teraz riadok v karte.
//
// Štýl: papyrusová karta v jazyku `.trp-bigcard` (bledý skin mapy), hodnoty na stupniciach
// `packTheme.ts` — stráž `check:pack` meria tento súbor.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useT, useLang } from '@/i18n/LanguageContext';
import { PACK_THEME as T, FONT_TITLE, FONT_UI, PACK_SHADOW, PHOTO_CSS } from '@/components/pack/packTheme';
import { PALE as P, LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { DeleteButton } from '@/components/pack/DeleteButton';
import { AinubisSheet } from '@/components/pack/ainubisSheet';
import { eventEmoji, FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { optimizePhoto } from '@/components/pack/addtrip/photoOptimize';
import { uploadEventPhoto } from '@/services/cloudinaryService';
import { pluralKey } from '@/lib/plural';
import { EVENT_KIND_LABEL_KEYS } from './eventModel';
import {
  setRsvp, cancelEvent, deleteEvent, confirmHeld, fetchAttendees, fetchComments, postComment,
  deleteComment, invalidateMyEventPoints,
  type EventItem, type RsvpState, type Attendee, type EventComment,
} from './eventStore';

// interný LangCode (LanguageContext, `dogypt_lang`) → BCP-47 pre Intl.DateTimeFormat.
const INTL_LOCALE: Record<string, string> = {
  en: 'en-US', sk: 'sk-SK', cs: 'cs-CZ', deu: 'de-DE', esp: 'es-ES', fra: 'fr-FR',
  prt: 'pt-PT', ita: 'it-IT', pol: 'pl-PL', ukr: 'uk-UA', rus: 'ru-RU', chn: 'zh-CN',
  jpn: 'ja-JP', ind: 'hi-IN', ara: 'ar-SA', kor: 'ko-KR', nld: 'nl-NL', tur: 'tr-TR',
};

// „12.–14. 9." pre viacdňový rozsah, jeden dátum inak — podľa AKTÍVNEHO jazyka.
function formatEventDate(startsAt: string, endsAt: string, lang: string): string {
  const locale = INTL_LOCALE[lang] ?? 'en-US';
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return startsAt;
  const end = endsAt ? new Date(endsAt) : start;
  const sameYear = start.getFullYear() === new Date().getFullYear();
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) };
  try {
    const fmt = new Intl.DateTimeFormat(locale, opts);
    if (!Number.isNaN(end.getTime()) && end.toDateString() !== start.toDateString() && typeof fmt.formatRange === 'function') {
      return fmt.formatRange(start, end);
    }
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(start);
    return `${fmt.format(start)} · ${time}`;
  } catch {
    return start.toLocaleDateString(locale, opts);
  }
}

function hostnameOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

/** „Janka · Bella #12" — krstné meno, pes, číslo. Čo chýba, vypadne. */
function whoLine(first: string | null, dog: string | null, num: number | null): string {
  const dogPart = dog ? `${dog}${num ? ` #${num}` : ''}` : (num ? `#${num}` : '');
  return [first, dogPart].filter(Boolean).join(' · ');
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const r = await fetch(dataUrl);
  return r.blob();
}

export type EventCardProps = {
  item: EventItem;
  /** pin na mape bol kliknutý PRE toto podujatie (zvýrazní + scrollne). */
  highlighted?: boolean;
  expanded?: boolean;
  onToggle: (item: EventItem) => void;
  /** po každom zápise — zoznam sa načíta znova z DB (počty, stav, zrušenie). */
  onChanged: () => void;
  /** autor ťukol UPRAVIŤ — formulár otvára volajúci (PackMap). */
  onEdit?: (item: EventItem) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
};

export function EventCard({ item, highlighted, expanded, onToggle, onChanged, onEdit, cardRef }: EventCardProps) {
  const t = useT();
  const { lang } = useLang();
  const now = Date.now();
  const started = new Date(item.startsAt).getTime() <= now;
  const ended = new Date(item.endsAt || item.startsAt).getTime() < now;
  const cancelled = item.status === 'cancelled';
  const canRsvp = !cancelled && !ended;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [people, setPeople] = useState<Attendee[] | null>(null);
  const [showPeople, setShowPeople] = useState(false);
  const [comments, setComments] = useState<EventComment[] | null>(null);
  const [draftComment, setDraftComment] = useState('');
  const [askCancel, setAskCancel] = useState(false);
  const [heldOpen, setHeldOpen] = useState(false);
  const [recap, setRecap] = useState('');
  const [recapPhoto, setRecapPhoto] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const loadDetail = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([fetchAttendees(item.id), fetchComments(item.id)]);
      setPeople(p);
      setComments(c);
    } catch {
      setErr(t('pack.event.errorLoad'));
    }
  }, [item.id, t]);

  useEffect(() => { if (expanded) void loadDetail(); }, [expanded, loadDetail]);

  // Po zápise sa načíta znova zoznam (počty) AJ detail karty (kto ide).
  const after = async (ok: boolean, errKey = 'pack.event.errorSave') => {
    setBusy(false);
    if (!ok) { setErr(t(errKey)); return; }
    setErr('');
    onChanged();
    if (expanded) await loadDetail();
  };

  // Tretí stav = zrušiť voľbu ťuknutím na zvolené (§5.2 zadania).
  const pick = async (state: RsvpState) => {
    if (busy) return;
    setBusy(true);
    await after(await setRsvp(item.id, item.myState === state ? null : state));
  };

  const doCancel = async () => {
    setBusy(true);
    setAskCancel(false);
    await after(await cancelEvent(item.id));
  };

  const doDelete = async () => {
    setBusy(true);
    const r = await deleteEvent(item.id);
    setBusy(false);
    if (r === 'ok') { onChanged(); return; }
    setErr(t(r === 'has_people' ? 'pack.event.errorHasPeople' : 'pack.event.errorSave'));
  };

  const send = async () => {
    const body = draftComment.trim();
    if (!body || busy) return;
    setBusy(true);
    const ok = await postComment(item.id, body);
    setBusy(false);
    if (!ok) { setErr(t('pack.event.errorSave')); return; }
    setDraftComment('');
    setErr('');
    setComments(await fetchComments(item.id).catch(() => comments));
  };

  const removeComment = async (id: string) => {
    if (await deleteComment(id)) setComments((cs) => (cs ?? []).filter((c) => c.id !== id));
  };

  const pickRecapPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    try {
      const small = await optimizePhoto(f);
      if (!small) throw new Error('photo');
      const up = await uploadEventPhoto(await dataUrlToBlob(small), item.id, `recap-${Date.now()}`);
      setRecapPhoto(up.secureUrl);
      setErr('');
    } catch {
      setErr(t('pack.event.errorPhoto'));
    } finally {
      setBusy(false);
    }
  };

  const doConfirmHeld = async () => {
    if (busy) return;
    setBusy(true);
    const r = await confirmHeld(item.id, recap, recapPhoto);
    setBusy(false);
    if (r !== 'ok') { setErr(t(r === 'photo_missing' ? 'pack.event.errorRecapPhoto' : 'pack.event.errorSave')); return; }
    setHeldOpen(false);
    invalidateMyEventPoints();
    onChanged();
  };

  const kindLabel = t(EVENT_KIND_LABEL_KEYS[item.kind] ?? item.kind);
  const dateLabel = formatEventDate(item.startsAt, item.endsAt, lang);
  const countLine = [
    item.going > 0 ? t('pack.event.goingCount' + pluralKey(item.going), { count: item.going }) : '',
    item.interested > 0 ? t('pack.event.interestedCount' + pluralKey(item.interested), { count: item.interested }) : '',
  ].filter(Boolean).join(' · ');
  const author = whoLine(item.authorFirst, item.authorDog, item.authorNumber);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const going = (people ?? []).filter((p) => p.state === 'going');
  const interested = (people ?? []).filter((p) => p.state === 'interested');

  return (
    <div
      ref={cardRef}
      className={`pev-card${highlighted ? ' hot' : ''}${cancelled ? ' is-cancelled' : ''}${expanded ? ' is-open' : ''}`}
      data-event-id={item.id}
    >
      <div
        className="pev-head"
        role="button"
        tabIndex={0}
        aria-expanded={!!expanded}
        onClick={() => onToggle(item)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(item); } }}
      >
        <div className="pev-toprow">
          <span className="pev-date">{dateLabel}</span>
          {cancelled
            ? <span className="pev-typechip pev-typechip--off">{t('pack.event.cancelledTag')}</span>
            : item.heldConfirmedAt
              ? <span className="pev-typechip pev-typechip--held">{t('pack.event.heldTag')}</span>
              : <span className="pev-typechip">{t('pack.eventsList.typeEvent')}</span>}
        </div>
        <div className="pev-kindrow">
          <span className="pev-kindchip"><span style={{ fontFamily: FONT_EMOJI }}>{eventEmoji(item.kind)}</span> {kindLabel}</span>
        </div>
        <div className="pev-name">{item.title}</div>
        {item.venueName && <div className="pev-venue">{item.venueName}</div>}
        {(countLine || item.myState) && (
          <div className="pev-meta">
            {countLine && <span>{countLine}</span>}
            {item.myState && (
              <span className="pev-mine">{t(item.myState === 'going' ? 'pack.event.youGo' : 'pack.event.youInterested')}</span>
            )}
          </div>
        )}
      </div>

      {expanded && (
        <div className="pev-body" onClick={stop}>
          {item.origin === 'own' && item.photoUrl && (
            <div className="pk-photo pev-photo"><img src={item.photoUrl} alt="" loading="lazy" /></div>
          )}
          {item.description && <div className="pev-desc">{item.description}</div>}
          {item.origin === 'tip' && item.sourceUrl && (
            <a className="pev-sourcebadge" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
              {t('pack.eventsList.sourceBadge', { source: hostnameOf(item.sourceUrl) })} ↗
            </a>
          )}
          {item.organizerCredit && <div className="pev-small">{t('pack.event.organizer', { name: item.organizerCredit })}</div>}
          {author && <div className="pev-small">{t('pack.event.addedBy', { who: author })}</div>}

          {/* RECAP — uskutočnené podujatie ukazuje príbeh a fotku organizátora */}
          {item.heldConfirmedAt && item.recap && (
            <div className="pev-recap">
              <div className="pev-label">{t('pack.event.recapTitle')}</div>
              {item.recapPhotos[0] && <div className="pk-photo pev-photo"><img src={item.recapPhotos[0]} alt="" loading="lazy" /></div>}
              <div className="pev-desc">{item.recap}</div>
            </div>
          )}

          {canRsvp && (
            <div className="pev-rsvp">
              <button type="button" className={`pev-go${item.myState === 'going' ? ' on' : ''}`} disabled={busy} onClick={() => void pick('going')}>
                {t(item.myState === 'going' ? 'pack.event.goingOn' : 'pack.event.going')}
              </button>
              <button type="button" className={`pev-maybe${item.myState === 'interested' ? ' on' : ''}`} disabled={busy} onClick={() => void pick('interested')}>
                {t(item.myState === 'interested' ? 'pack.event.interestedOn' : 'pack.event.interested')}
              </button>
            </div>
          )}
          {canRsvp && item.myState && <div className="pev-hint">{t('pack.event.tapAgain')}</div>}

          {/* KTO IDE */}
          {(item.going + item.interested) > 0 && (
            <div className="pev-sec">
              <button type="button" className="pev-toggle" onClick={() => setShowPeople((v) => !v)} aria-expanded={showPeople}>
                {t(showPeople ? 'pack.event.whoGoesHide' : 'pack.event.whoGoes')} ({item.going + item.interested})
              </button>
              {showPeople && people && (
                <ul className="pev-people">
                  {going.map((p, i) => <li key={`g${i}`}><b>{whoLine(p.first, p.dog, p.number)}</b> <span>{t('pack.event.stateGoing')}</span></li>)}
                  {interested.map((p, i) => <li key={`i${i}`}>{whoLine(p.first, p.dog, p.number)} <span>{t('pack.event.stateInterested')}</span></li>)}
                </ul>
              )}
            </div>
          )}

          {/* DISKUSIA — prežíva zrušenie aj archív */}
          <div className="pev-sec">
            <div className="pev-label">{t('pack.event.discussion')}</div>
            {comments && comments.length === 0 && <div className="pev-hint">{t('pack.event.noComments')}</div>}
            {comments && comments.length > 0 && (
              <ul className="pev-comments">
                {comments.map((c) => (
                  <li key={c.id}>
                    <div className="pev-cwho">{whoLine(c.first, c.dog, c.number) || t('pack.event.someone')}</div>
                    <div className="pev-ctext">{c.body}</div>
                    {c.isMine && <button type="button" className="pev-link" onClick={() => void removeComment(c.id)}>{t('pack.event.deleteComment')}</button>}
                  </li>
                ))}
              </ul>
            )}
            <div className="pev-write">
              <textarea
                className="pev-field"
                rows={2}
                maxLength={2000}
                value={draftComment}
                placeholder={t('pack.event.commentPlaceholder')}
                onChange={(e) => setDraftComment(e.target.value)}
              />
              <button type="button" className="pev-send" disabled={busy || !draftComment.trim()} onClick={() => void send()}>
                {t('pack.event.send')}
              </button>
            </div>
          </div>

          {/* USKUTOČNILO SA? — len autor, po začiatku, raz */}
          {item.isMine && !cancelled && started && !item.heldConfirmedAt && (
            <div className="pev-sec pev-held">
              <div className="pev-label">{t('pack.event.heldAsk')}</div>
              <div className="pev-hint">{t('pack.event.heldWhy')}</div>
              {!heldOpen ? (
                <div className="pev-rsvp">
                  <button type="button" className="pev-go" onClick={() => setHeldOpen(true)}>{t('pack.event.heldYes')}</button>
                  <button type="button" className="pev-maybe" onClick={() => setAskCancel(true)}>{t('pack.event.heldNo')}</button>
                </div>
              ) : (
                <div className="pev-write pev-write--col">
                  <textarea
                    className="pev-field"
                    rows={3}
                    maxLength={500}
                    value={recap}
                    placeholder={t('pack.event.recapPlaceholder')}
                    onChange={(e) => setRecap(e.target.value)}
                  />
                  <div className="pev-hint">{recap.length} / 500</div>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void pickRecapPhoto(e)} />
                  {recapPhoto
                    ? <div className="pk-photo pev-photo"><img src={recapPhoto} alt="" /></div>
                    : <button type="button" className="pev-maybe" disabled={busy} onClick={() => fileRef.current?.click()}>{t('pack.event.recapAddPhoto')}</button>}
                  <button type="button" className="pev-go" disabled={busy || !recap.trim() || !recapPhoto} onClick={() => void doConfirmHeld()}>
                    {t('pack.event.recapConfirm')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AUTOR — upraviť (pred začiatkom), zrušiť, zmazať (len kým sa nikto nepridal) */}
          {item.isMine && !cancelled && (
            <div className="pev-own">
              {!started && onEdit && <button type="button" className="pev-link" onClick={() => onEdit(item)}>{t('pack.event.edit')}</button>}
              {!started && <button type="button" className="pev-link" onClick={() => setAskCancel(true)}>{t('pack.event.cancel')}</button>}
            </div>
          )}
          {item.isMine && item.othersCount === 0 && (
            <DeleteButton label={t('pack.eventsList.deleteEvent')} hint={t('pack.eventsList.deleteEventAsk')} onConfirm={() => void doDelete()} />
          )}
          {item.isMine && item.othersCount > 0 && !cancelled && !started && (
            <div className="pev-hint">{t('pack.event.cantDelete')}</div>
          )}

          {err && <div className="pev-err" role="alert">{err}</div>}
        </div>
      )}

      {askCancel && (
        <AinubisSheet onClose={() => setAskCancel(false)}>
          <div className="msg-modtitle">{t('pack.event.cancelAskTitle')}</div>
          <div className="msg-modsub">{t('pack.event.cancelAskText')}</div>
          <button type="button" className="msg-modsend" disabled={busy} onClick={() => void doCancel()}>{t('pack.event.cancelConfirm')}</button>
          <button type="button" className="msg-modcancel" onClick={() => setAskCancel(false)}>{t('pack.event.cancelKeep')}</button>
        </AinubisSheet>
      )}
    </div>
  );
}

// Vlastný CSS blok komponentu — injectne ho volajúci PANEL raz (EventsPanel.tsx).
// ⚠️ HODNOTY SÚ NA STUPNICIACH `packTheme.ts` (písmo 10/12/14/16 · polomer 8/12/16/999 ·
//    odsadenie 4/8/12/16 · rozstrel .02/.14/.22). Rámy a tiene cez tokeny, nie doslovne.
// ⚠️ Karta a karta výletu (`.trp-bigcard`) sú súrodenci v jednom zozname — papyrus + zlatý rám.
export const EVENT_CARD_CSS = `
${PHOTO_CSS}
.pev-card{display:block;border-radius:16px;background:${T.cardGrad};border:1.5px solid ${T.cardEdge};box-shadow:${PACK_SHADOW.lift};transition:border-color .15s;}
.pev-card:hover,.pev-card.hot{border-color:${P.deep};}
.pev-card.hot{box-shadow:0 0 0 3px ${T.hairline},${PACK_SHADOW.lift};}
.pev-card + .pev-card{margin-top:8px;}
.pev-card.is-cancelled{opacity:.62;}
.pev-card.is-cancelled .pev-name{text-decoration:line-through;}
.pev-head{padding:12px;cursor:pointer;outline:0;}
.pev-toprow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;}
.pev-date{font-family:${FONT_UI};font-weight:600;font-size:12px;color:${P.deep};white-space:nowrap;}
/* typový štítok = ZLATÝ (podujatie) — protipól je neutrálny .comm-plan-type (výlet). */
.pev-typechip{font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:4px 8px;border-radius:999px;border:1px solid ${P.deep};color:${P.deep};background:${P.hot};white-space:nowrap;}
.pev-typechip--off{border-color:${P.dim};color:${P.dim};background:transparent;}
.pev-typechip--held{${pickTintCSS(T.growGreen, PICK_INK.green, 0.16)}}
.pev-kindrow{margin-bottom:4px;}
.pev-kindchip{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:4px 8px;border-radius:999px;border:1px solid ${P.border};color:${P.dim};white-space:nowrap;}
.pev-name{font-family:${FONT_TITLE};font-weight:700;font-size:14px;color:${P.ink};}
.pev-venue{font-family:${FONT_UI};font-size:12px;color:${P.dim};margin-top:4px;}
.pev-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px;font-family:${FONT_UI};font-size:12px;color:${P.ink};}
.pev-mine{font-weight:600;font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:4px 8px;border-radius:999px;border:1px solid ${LAPIS.edge};${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.12)}}
.pev-body{padding:0 12px 12px;display:flex;flex-direction:column;gap:8px;cursor:default;}
.pev-photo{height:160px;}
.pev-desc{font-family:${FONT_UI};font-size:12px;color:${P.ink};line-height:1.5;white-space:pre-wrap;}
.pev-small{font-family:${FONT_UI};font-size:12px;color:${P.dim};}
.pev-sourcebadge{font-family:${FONT_UI};font-weight:500;font-size:12px;color:${P.deep};text-decoration:underline;}
.pev-label{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${P.dim};margin-bottom:4px;}
.pev-hint{font-family:${FONT_UI};font-size:12px;color:${P.dim};font-style:italic;}
.pev-err{font-family:${FONT_UI};font-size:12px;color:${PICK_INK.red};}
.pev-sec{border-top:1px solid ${P.hair};padding-top:8px;}
.pev-recap{border-top:1px solid ${P.hair};padding-top:8px;display:flex;flex-direction:column;gap:8px;}
/* IDEM = jediné plné CTA karty (LAPIS). MÁM ZÁUJEM = priesvitný tint. Zvolené IDEM
   prejde do tintu — plná plocha je výzva, a keď už idem, výzvou byť prestáva. */
.pev-rsvp{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.pev-go,.pev-maybe,.pev-send{font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:12px 8px;border-radius:8px;cursor:pointer;}
.pev-go{background:${LAPIS.grad};border:1px solid ${LAPIS.deep};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};}
.pev-go:hover:not(:disabled){background:${LAPIS.gradHover};}
.pev-go.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.24)}}
.pev-maybe{border:1px solid ${LAPIS.edge};${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.06)}}
.pev-maybe.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.24)}}
.pev-go:disabled,.pev-maybe:disabled,.pev-send:disabled{opacity:.45;cursor:default;}
.pev-toggle{font-family:${FONT_UI};font-weight:600;font-size:12px;color:${P.ink};background:none;border:0;padding:4px 0;cursor:pointer;}
.pev-people,.pev-comments{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;font-family:${FONT_UI};font-size:12px;color:${P.ink};}
.pev-people span{color:${P.dim};}
.pev-comments li{padding:8px 0;border-bottom:1px solid ${P.hair};}
.pev-cwho{font-weight:600;font-size:12px;color:${P.deep};}
.pev-ctext{white-space:pre-wrap;line-height:1.5;margin-top:4px;}
.pev-write{display:flex;gap:8px;align-items:flex-end;margin-top:8px;}
.pev-write--col{flex-direction:column;align-items:stretch;}
.pev-field{flex:1;width:100%;box-sizing:border-box;background:${P.field};border:1px solid ${P.border};border-radius:8px;padding:8px 12px;color:${P.ink};font-family:${FONT_UI};font-size:14px;outline:0;resize:vertical;}
.pev-field:focus{border-color:${LAPIS.edge};}
.pev-send{padding:8px 12px;border:1px solid ${LAPIS.edge};${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.12)}}
.pev-own{display:flex;gap:16px;flex-wrap:wrap;}
.pev-link{font-family:${FONT_UI};font-weight:500;font-size:12px;color:${P.deep};background:none;border:0;padding:4px 0;text-decoration:underline;cursor:pointer;}
`;

export default EventCard;
