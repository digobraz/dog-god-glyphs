// KOMENTÁRE POD CITÁTOM DŇA — šuplík so zoznamom (Matej 26. 10. 2026: *„pod ainubisovymi citátmi ponechaj
// možnosť komentu"*). Nie je to nový zoznam: je to `TripComments` v režime `quoteThread` (ten istý
// zoznam, pole, stránkovanie a nahlásenie ako pri výlete), len nad tabuľkou `quote_comments`.
// Kľúč vlákna = `<id citátu>-<deň>` — vlákno patrí DŇU (citáty rotujú, po 16 dňoch by sa vrátil cudzí rozhovor).
// Bez migrácie na DB zoznam padne na prázdny (`fetchQuoteComments` vracia []), zápis ukáže chybu v poli.
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, VEIL_CSS } from '@/components/pack/packTheme';
import { MODAL_MAX_H } from '@/components/pack/packTheme';
import { BackButton } from '@/components/pack/BackButton';
import { TripComments } from '@/components/pack/trip/TripComments';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

const CSS = `${VEIL_CSS}
.pk-veil.pkq-veil{align-items:flex-end;padding:0;}
.pkq-sheet{width:100%;max-width:560px;max-height:${MODAL_MAX_H};overflow-y:auto;border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;background:${T.card};padding:${S.lg}px;box-sizing:border-box;}
.pkq-head{display:flex;align-items:center;gap:${S.md}px;margin:0 0 ${S.sm}px;}
.pkq-head h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};} /* písmo: nadpis */
.pkq-sheet .tcm-wrap{margin-top:0;}
/* ŠAT PAPYRUS 3D (hárok H10): papierový šuplík so zlatým lemom, nadpis v Museu. */
html.papyrus3d .pkq-sheet{background:var(--p3d-card);border-top:3px solid var(--p3d-gold);box-shadow:0 0 0 2px var(--p3d-ink);}
html.papyrus3d .pkq-head h3{font-family:'LT Museum',serif;font-weight:400;font-size:${TX.h2}px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);} /* písmo: nadpis */
@media (min-width:768px){.pk-veil.pkq-veil{align-items:center;padding:${S.xl}px;}.pkq-sheet{border-radius:${PACK_R.card}px;}}
`;

/** `quoteKey` = vlákno citátu dňa · `tripId` = komentáre výletu (26. 10.: ten istý šuplík ako v článku výletu,
 *  hodnotenia + rady), aby 💬 pod kartou výletu vo feede človeka neodnieslo preč (lock §4.2). */
export function QuoteComments({ quoteKey, tripId, focusId, onClose, onCount }: { quoteKey?: string; tripId?: string; focusId?: string | null; onClose: () => void; onCount: (n: number) => void }) {
  const t = useT();
  // Šuplík výletu (tripId) nesie „Komentáre“, nie „Komentáre k citátu“ (9. 11. 2026, bod 11).
  const title = t(tripId ? 'pack.feed.act.comment' : 'pack.feed.quote.cm.title');
  return createPortal((
    <div className="pk-veil pk-veil--modal pkq-veil" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{CSS}</style>
      <div className="pkq-sheet">
        <div className="pkq-head">
          <BackButton tone="pale" onClick={onClose} label={t('pack.trip.cm.close')} />
          <h3>{title === 'pack.feed.quote.cm.title' || title === 'pack.feed.act.comment' ? 'Comments' : title}</h3>
        </div>
        {tripId
          ? <TripComments tripId={tripId} startOnAdvice focusId={focusId} onCountChange={onCount} />
          : <TripComments tripId={quoteKey ?? ''} quoteThread focusId={focusId} onCountChange={onCount} />}
      </div>
    </div>
  ), document.body);
}
