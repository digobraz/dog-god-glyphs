// Zoznam EVENTOV v ľavom paneli mapy (krok 5, plany/zadanie-eventy-2026-08-06.md §9 krok 5).
// Filtrovanie/zoradenie na nadchádzajúce/archív robí VOLAJÚCI (PackMap.tsx, cez
// upcomingEvents()/archivedEvents() z eventModel.ts) — tento komponent dostane už hotový
// zoznam pre AKTUÁLNY prepínač a len ho vykreslí + drží prepínač a prázdny stav.
// Volá sa DVAKRÁT (desktop .trp-cards-scroll + mobile .trp-mlist), rovnaký vzor ako
// `renderTripList(withRef)` / `<EventsView>` v PackMap.tsx — `withRef` zapína registráciu
// card-refov (len desktop potrebuje pin→scroll, mobile je touch/bez hoveru).
import type { MutableRefObject } from 'react';
import { PACK_THEME as T, FONT_UI, FONT_TITLE } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { DELETE_BUTTON_CSS } from '@/components/pack/DeleteButton';
import { EventCard, EVENT_CARD_CSS } from './EventCard';
import type { AddEventDraft } from './eventModel';

const GOLD = '#C99A3F';

export type EventsPanelProps = {
  /** už filtrovaný + zoradený zoznam PRE aktuálny `view` (PackMap.tsx robí upcomingEvents/archivedEvents). */
  events: AddEventDraft[];
  view: 'upcoming' | 'archive';
  onViewChange: (v: 'upcoming' | 'archive') => void;
  selectedId: string | null;
  expandedId: string | null;
  onCardClick: (draft: AddEventDraft) => void;
  /** prázdny stav (§ „Prázdny stav") — otvorí ADD popup (človek si sám vyberie dlaždicu EVENT). */
  onAddEvent: () => void;
  withRef?: boolean;
  cardRefs?: MutableRefObject<Record<string, HTMLElement | null>>;
  /** Zmazanie podujatia — prepošle sa karte. */
  onDelete?: (id: string) => void;
};

export function EventsPanel({ events, view, onViewChange, selectedId, expandedId, onCardClick, onAddEvent, withRef, cardRefs, onDelete }: EventsPanelProps) {
  const t = useT();

  return (
    <div className="pev-root">
      <style>{EVP_CSS}</style>
      <style>{EVENT_CARD_CSS}</style>
      <style>{DELETE_BUTTON_CSS}</style>
      {/* prepínač nadchádzajúce/archív — zámerne MALÝ segment, vizuálne podradený .trp-cat-pills
          (§ „malý pill/segment... nie ďalší trp-catpill"). Archív = FILTER, nič sa nemaže. */}
      <div className="pev-toggle" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'upcoming'} className={view === 'upcoming' ? 'on' : ''} onClick={() => onViewChange('upcoming')}>
          {t('pack.eventsList.upcoming')}
        </button>
        <button type="button" role="tab" aria-selected={view === 'archive'} className={view === 'archive' ? 'on' : ''} onClick={() => onViewChange('archive')}>
          {t('pack.eventsList.archive')}
        </button>
      </div>

      {events.length === 0 ? (
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
            draft={ev}
            highlighted={selectedId === ev.id}
            expanded={expandedId === ev.id}
            onClick={onCardClick}
            onDelete={onDelete}
            cardRef={withRef ? (el) => { if (cardRefs) cardRefs.current[ev.id] = el; } : undefined}
          />
        ))
      )}
    </div>
  );
}

const EVP_CSS = `
.pev-root{display:flex;flex-direction:column;}
.pev-toggle{display:inline-flex;align-self:flex-start;gap:2px;padding:3px;border-radius:999px;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkHair};margin-bottom:12px;}
.pev-toggle button{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:5px 12px;border-radius:999px;border:0;background:transparent;color:${T.onDarkDim};cursor:pointer;transition:all .15s;}
.pev-toggle button.on{background:rgba(201,154,63,0.16);color:${GOLD};}
.pev-toggle button:hover{color:${T.onDark};}
.pev-empty{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 16px;text-align:center;}
.pev-empty p{margin:0;color:${T.onDarkDim};font-size:12.5px;font-style:italic;line-height:1.5;}
.pev-emptybtn{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:11px 20px;border-radius:8px;border:1px solid rgba(250,244,236,0.30);background:linear-gradient(135deg,#F5C73D,#E69E1A);color:#1c160c;cursor:pointer;}
`;

export default EventsPanel;
