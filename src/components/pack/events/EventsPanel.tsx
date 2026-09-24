// Zoznam EVENTOV v ľavom paneli mapy (krok 5, plany/zadanie-eventy-2026-08-06.md §9 krok 5).
// Filtrovanie/zoradenie na nadchádzajúce/archív robí VOLAJÚCI (PackMap.tsx, cez
// upcomingEvents()/archivedEvents() z eventModel.ts) — tento komponent dostane už hotový
// zoznam pre AKTUÁLNY prepínač a len ho vykreslí + drží prepínač a prázdny stav.
// Volá sa DVAKRÁT (desktop .trp-cards-scroll + mobile .trp-mlist), rovnaký vzor ako
// `renderTripList(withRef)` / `<EventsView>` v PackMap.tsx — `withRef` zapína registráciu
// card-refov (len desktop potrebuje pin→scroll, mobile je touch/bez hoveru).
import type { MutableRefObject } from 'react';
import { FONT_UI, FONT_TITLE } from '@/components/pack/packTheme';
// Bledý chrome: inkousty a plochy (PALE), lapisové CTA a priesvitný tint výberu —
// jeden zdroj pre celý /pack, tie isté hodnoty drží bledý skin mapy.
import { PALE as P, LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { useT } from '@/i18n/LanguageContext';
import { DELETE_BUTTON_CSS } from '@/components/pack/DeleteButton';
import { EventCard, EVENT_CARD_CSS } from './EventCard';
import type { EventItem } from './eventStore';

export type EventsPanelProps = {
  /** zoznam PRE aktuálny `view` — od vlny 2 ho filtruje DB (`list_event_editions`), nie klient. */
  events: EventItem[];
  view: 'upcoming' | 'archive';
  onViewChange: (v: 'upcoming' | 'archive') => void;
  selectedId: string | null;
  expandedId: string | null;
  onCardClick: (item: EventItem) => void;
  /** prázdny stav (§ „Prázdny stav") — otvorí ADD popup (človek si sám vyberie dlaždicu EVENT). */
  onAddEvent: () => void;
  withRef?: boolean;
  cardRefs?: MutableRefObject<Record<string, HTMLElement | null>>;
  /** po zápise na karte — volajúci načíta zoznam znova */
  onChanged: () => void;
  onEdit?: (item: EventItem) => void;
  /** DB nevrátila zoznam — veta namiesto falošného „nič sa nekoná" */
  error?: string | null;
};

export function EventsPanel({ events, view, onViewChange, selectedId, expandedId, onCardClick, onAddEvent, withRef, cardRefs, onChanged, onEdit, error }: EventsPanelProps) {
  const t = useT();

  return (
    <div className="pev-root">
      <style>{EVP_CSS}</style>
      <style>{EVENT_CARD_CSS}</style>
      <style>{DELETE_BUTTON_CSS}</style>
      {/* prepínač nadchádzajúce/archív — zámerne MALÝ segment, vizuálne podradený .trp-cat-pills
          (§ „malý pill/segment... nie ďalší trp-catpill"). Archív = FILTER, nič sa nemaže. */}
      <div className="pev-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'upcoming'} className={view === 'upcoming' ? 'on' : ''} onClick={() => onViewChange('upcoming')}>
          {t('pack.eventsList.upcoming')}
        </button>
        <button type="button" role="tab" aria-selected={view === 'archive'} className={view === 'archive' ? 'on' : ''} onClick={() => onViewChange('archive')}>
          {t('pack.eventsList.archive')}
        </button>
      </div>

      {error ? (
        <div className="pev-empty"><p>{t('pack.event.errorLoad')}</p></div>
      ) : events.length === 0 ? (
        <div className="pev-empty">
          <p>{view === 'upcoming' ? t('pack.eventsList.emptyUpcoming') : t('pack.eventsList.emptyArchive')}</p>
          {view === 'upcoming' && (
            <button type="button" className="pev-emptybtn" onClick={onAddEvent}>{t('pack.eventsList.emptyCta')}</button>
          )}
        </div>
      ) : (
        events.map((ev) => (
          <EventCard
            key={ev.id}
            item={ev}
            highlighted={selectedId === ev.id}
            expanded={expandedId === ev.id}
            onToggle={onCardClick}
            onChanged={onChanged}
            onEdit={onEdit}
            cardRef={withRef ? (el) => { if (cardRefs) cardRefs.current[ev.id] = el; } : undefined}
          />
        ))
      )}
    </div>
  );
}

const EVP_CSS = `
/* ── BLEDÝ PANEL PODUJATÍ (DRAK → BRIGHT, 2026-09-01, 2. beh) ─────────────────────────
   Panel žije len v ľavom paneli mapy a v mobilnom zozname — obidva papyrusové, takže
   svetlý inkoust na nich bol prakticky neviditeľný. */
.pev-root{display:flex;flex-direction:column;}
.pev-tabs{display:inline-flex;align-self:flex-start;gap:2px;padding:4px;border-radius:999px;background:${P.soft};border:1px solid ${P.border};margin-bottom:12px;}
.pev-tabs button{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:4px 12px;border-radius:999px;border:0;background:transparent;color:${P.dim};cursor:pointer;transition:all .15s;}
/* ⚠️ VÝBER JE PRIESVITNÝ TINT, NIE PLNÁ FARBA (lock 2026-08-26). Plný lapis nesie
   .trp-catpill.on — hlavný prepínač kategórií, ktorému je tento segment zámerne
   podriadený. Rovnaká váha by z dvoch prepínačov nad sebou spravila dva rovnocenné. */
.pev-tabs button.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}font-weight:600;}
.pev-tabs button:hover{color:${P.ink};}
.pev-empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:32px 16px;text-align:center;}
.pev-empty p{margin:0;color:${P.dim};font-size:12px;font-style:italic;line-height:1.5;}
/* Jediná akcia prázdneho stavu = hlavné CTA ⇒ LAPIS (kánon 28. 8.). Radius 8 ostáva
   z locku .btn-gold — mení sa výplň, nie tvar. Dvojička je .comm-emptybtn (packCommunityUI). */
.pev-emptybtn{font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:12px 24px;border-radius:8px;border:1px solid ${LAPIS.deep};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.pev-emptybtn:hover{background:${LAPIS.gradHover};}
`;

export default EventsPanel;
