// EVENT karta v ľavom paneli mapy (krok 5, plany/zadanie-eventy-2026-08-06.md §9 krok 5).
// Presentational only — filtrovanie/zoradenie/výber žije v EventsPanel.tsx a v PackMap.tsx
// (rovnaký rozdiel zodpovednosti ako renderTripCard vs. PackMap state).
//
// Vizuálne v jazyku existujúcich trip kariet (.trp-bigcard v PackMap.tsx CSS — radius 14px,
// jemný border, gold hover/highlight) — VLASTNÁ lokálna kópia tých istých hodnôt (nie import
// cudzích .trp-* tried), rovnaký vzor izolovaného štýlovaného komponentu ako AddEvent.tsx
// (AEV_CSS) namiesto tichej väzby na CSS blok v PackMap.tsx.
import { useT, useLang } from '@/i18n/LanguageContext';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { DeleteButton } from '@/components/pack/DeleteButton';
import { EVENT_KIND_LABEL_KEYS, type AddEventDraft } from './eventModel';

const GOLD = '#C99A3F';

// interný LangCode (LanguageContext, `dogypt_lang`) → BCP-47 pre Intl.DateTimeFormat. Appka
// nikde takú tabuľku nemá (jediný predchodca je natvrdo 'en-US' v messaging/Inbox.tsx) —
// zoznam kódov 1:1 z LanguagePicker.tsx `LANGS`.
const INTL_LOCALE: Record<string, string> = {
  en: 'en-US', sk: 'sk-SK', cs: 'cs-CZ', deu: 'de-DE', esp: 'es-ES', fra: 'fr-FR',
  prt: 'pt-PT', ita: 'it-IT', pol: 'pl-PL', ukr: 'uk-UA', rus: 'ru-RU', chn: 'zh-CN',
  jpn: 'ja-JP', ind: 'hi-IN', ara: 'ar-SA', kor: 'ko-KR', nld: 'nl-NL', tur: 'tr-TR',
};

// „12.–14. 9." pre viacdňový rozsah, jeden dátum inak — cez Intl.DateTimeFormat.formatRange()
// (širokú podporu má), nech je to naozaj podľa AKTÍVNEHO jazyka a nie natvrdo SK vzor zo zadania.
function formatEventDate(startsAt: string, endsAt: string, lang: string): string {
  const locale = INTL_LOCALE[lang] ?? 'en-US';
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return startsAt;
  const end = endsAt ? new Date(endsAt) : start;
  const sameYear = start.getFullYear() === new Date().getFullYear();
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) };
  try {
    const fmt = new Intl.DateTimeFormat(locale, opts);
    if (!Number.isNaN(end.getTime()) && end.getTime() !== start.getTime() && typeof fmt.formatRange === 'function') {
      return fmt.formatRange(start, end);
    }
    return fmt.format(start);
  } catch {
    return start.toLocaleDateString(locale, opts);
  }
}

function hostnameOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export type EventCardProps = {
  draft: AddEventDraft;
  /** pin na mape bol kliknutý PRE tento event (§ „Piny na mape" — zvýrazní + scrollne). */
  highlighted?: boolean;
  /** origin:'own' — karta rozbalená, ukazuje popis (§ „klik otvorí detail v paneli"). */
  expanded?: boolean;
  /** origin:'tip' — kartа je <a> na sourceUrl (nové okno); origin:'own' — toggluje expanded. */
  onClick: (draft: AddEventDraft) => void;
  cardRef?: (el: HTMLDivElement | HTMLAnchorElement | null) => void;
  /** Zmazanie podujatia. Chýba = tlačidlo sa nevykreslí (archív, cudzí povrch). */
  onDelete?: (id: string) => void;
};

export function EventCard({ draft, highlighted, expanded, onClick, cardRef, onDelete }: EventCardProps) {
  const t = useT();
  const { lang } = useLang();
  const dateLabel = formatEventDate(draft.startsAt, draft.endsAt, lang);
  const kindLabel = t(EVENT_KIND_LABEL_KEYS[draft.kind] ?? draft.kind);
  const className = `pev-card${highlighted ? ' hot' : ''}`;

  const body = (
    <>
      {/* Typový štítok (Matej 2026-08-06). Zoznam UDALOSTÍ vedome mieša DVE entity —
          podujatia (tento komponent) a naplánované výlety s pozvánkou = EVENTRIPY
          (`comm-plan` v packCommunityUI.tsx). Pre člena, ktorý sa pýta „kam môžem tento
          víkend", je to tá istá otázka, preto sú spolu; líšia sa ale tým, čo po nich
          zostane, a to musí byť na prvý pohľad zrejmé. */}
      <div className="pev-toprow">
        <span className="pev-date">{dateLabel}</span>
        <span className="pev-typechip">{t('pack.eventsList.typeEvent')}</span>
      </div>
      <div className="pev-kindrow">
        <span className="pev-kindchip">{kindLabel}</span>
      </div>
      <div className="pev-name">{draft.title}</div>
      {draft.venueName && <div className="pev-venue">{draft.venueName}</div>}
      {draft.origin === 'tip' && draft.sourceUrl && (
        <div className="pev-sourcebadge">
          {t('pack.eventsList.sourceBadge', { source: hostnameOf(draft.sourceUrl) })} ↗
        </div>
      )}
      {draft.origin === 'own' && expanded && draft.description && (
        <div className="pev-desc">{draft.description}</div>
      )}
      {/* Mazanie sa ukáže AŽ V ROZBALENEJ karte (a pri tipoch, ktoré sa rozbaliť nedajú,
          rovno) — v zloženom zozname by červený riadok pod každou položkou prekričal
          samotné podujatia. Uložené podujatia sú dnes výhradne moje (localStorage), takže
          sa vlastníctvo neskúma; keď príde DB, pribudne sem podmienka na autora. */}
      {onDelete && (draft.origin === 'tip' || expanded) && (
        <DeleteButton
          label={t('pack.eventsList.deleteEvent')}
          hint={t('pack.eventsList.deleteEventAsk')}
          onConfirm={() => onDelete(draft.id)}
        />
      )}
    </>
  );

  // origin:'tip' — celá karta je odkaz na originál, nové okno (§4.3: klik vedie na sourceUrl).
  if (draft.origin === 'tip' && draft.sourceUrl) {
    return (
      <a
        ref={cardRef}
        className={className}
        href={draft.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onClick(draft)}
      >
        {body}
      </a>
    );
  }

  // origin:'own' — klik rozbalí popis inline (žiadna samostatná routa, mimo rozsahu kroku 5).
  return (
    <div
      ref={cardRef}
      className={className}
      onClick={() => onClick(draft)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(draft); } }}
    >
      {body}
    </div>
  );
}

// Vlastný CSS blok komponentu — injectne ho volajúci PANEL raz (EventsPanel.tsx), nie každá
// karta (rovnaká úvaha ako AEV_CSS v AddEvent.tsx, len tu by opakovaný <style> na kartu bol
// zbytočný pri zozname N eventov).
export const EVENT_CARD_CSS = `
.pev-card{display:block;border-radius:14px;background:rgba(245,240,228,0.03);border:1px solid rgba(245,240,228,0.10);padding:12px 13px;cursor:pointer;text-decoration:none;transition:all .15s;}
.pev-card:hover,.pev-card.hot{border-color:${GOLD};background:rgba(201,154,63,0.07);}
.pev-card + .pev-card{margin-top:9px;}
.pev-toprow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px;}
.pev-date{font-family:${FONT_UI};font-weight:600;font-size:13px;color:${GOLD};white-space:nowrap;}
/* typový štítok = ZLATÝ (podujatie). Protipól je neutrálny .comm-plan-type (výlet)
   v packCommunityUI.tsx — dvojica musí ostať odlíšiteľná farbou, nielen textom. */
.pev-typechip{font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.12em;text-transform:uppercase;padding:3px 9px;border-radius:999px;border:1px solid ${GOLD};color:${GOLD};background:rgba(201,154,63,0.10);white-space:nowrap;}
.pev-kindrow{margin-bottom:6px;}
.pev-kindchip{font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.10em;text-transform:uppercase;padding:3px 8px;border-radius:999px;border:1px solid ${T.onDarkBorder};color:${T.onDarkDim};white-space:nowrap;}
.pev-name{font-family:${FONT_TITLE};font-weight:700;font-size:13.5px;color:rgba(245,240,228,0.92);}
.pev-venue{font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};margin-top:3px;}
.pev-sourcebadge{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.04em;color:${GOLD};margin-top:6px;}
.pev-desc{font-family:${FONT_UI};font-size:11.5px;color:${T.onDark};margin-top:8px;line-height:1.5;white-space:pre-wrap;}
`;

export default EventCard;
