// Trip detail comment section — Reviews (paw rating + optional text) + Advice (Q&A). Replaces the
// old "Message owner" / "Open trip group" placeholder buttons (§14 zadanie 2026-07-23 — "komentová
// sekcia namiesto trip-group chatu"). Isolated component, mounted in PackMap trip detail panel.
// Same visual language as messaging (Inbox.tsx/Thread.tsx) — gold accents, papyrus-on-dark.
//
// ── 2026-08-03: FABRIKOVANÉ RECENZIE/RADY ZMAZANÉ PRED LAUNCHOM ──────────────────────
// Až doteraz mala táto komponenta aj deterministicky generovaný "mock" filler (fiktívni ľudia
// z MOCK_MEMBER_POOL, náhodné hodnotenia/texty/lajky z mulberry32 PRNG). Matej 2026-08-03:
// "začíname so všetkým do nuly" — appka pred launchom ukazuje LEN reálne dáta z DB, žiadne
// vymyslené mená, hodnotenia ani lajky. Všetok mock kód bol odstránený; prázdny stav (0 reálnych
// recenzií/otázok) rieši explicitný empty state nižšie namiesto tichého dofukovania fillerom.
//
// §15 zadanie 2026-07-23: pagination (5/page, "‹ 1/N ›") + "my review"/"my question" write flow.
//
// ── 2026-08-03, issue #52: MY REVIEW / MY QUESTIONS ARE NOW REAL DB ROWS ──────────────
// Until today this was 100% localStorage (dogypt.tripReviews.v1 / dogypt.tripQuestions.v1):
// write a review, close the tab, it's gone — no other member could ever see it. That's the whole
// point of a comment under a trip ("let's meet up here"), so it had to survive the browser and be
// visible to a second real member. Data now lives in `trip_reviews` / `trip_questions`
// (migration `20260803_trip_comments.sql`) via `tripCommentsData.ts`, read through
// `list_trip_reviews()`/`list_trip_questions()` (RPC — vends only first name + pack number of the
// author, same whitelist convention as `get_trip_party()`/`list_my_conversations()`).
// Writes are NEVER optimistic: insert/upsert/delete await the DB response, and on RLS rejection
// (signed out, unpaid, DEV_NOAUTH) the popup shows an error instead of pretending it saved — same
// rule as `sendMessage()` in packMessaging.ts.
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { PawRating } from '@/components/pack/addtrip/PawRating';
import {
  getAuthedUserId,
  fetchTripReviews,
  fetchTripQuestions,
  upsertMyReview,
  deleteMyReview,
  postTripQuestion,
  deleteTripQuestion,
  type RealReview,
  type RealQuestion,
} from '@/components/pack/trip/tripCommentsData';
// Nahlásenie (issue #54) — infra (RPC `report_content` + `pack_reports`) žije v messaging module,
// odtiaľ sa len importuje (needituje sa, iní agenti na ňom pracujú súbežne).
import { reportContent, type ReportReason } from '@/components/pack/messaging/packMessaging';

const T = PACK_THEME;
const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const PAGE_SIZE = 5;

// DRAK → BRIGHT (2026-09-01): recenzie a rady stoja na DVOCH povrchoch — v článku
// výletu a v paneli mapy (grep `<TripComments`). Oba sú dnes papyrusové, takže sa
// blok prezlieka raz pre oboch; svetlý inkoust tu už nemá na čom stáť.
// Zlatá na text je `#6E4A12` (tmavý koniec brandovej rampy), nie `#C99A3F` — tá je
// na papyruse takmer neviditeľná. Textové pole ostáva PLOCHÝ papyrus (vzor
// `.pf-field--flat`): písať sa má do svetla, nie do skla.
export const TRIP_COMMENTS_CSS = `
.tcm-wrap{margin-top:16px;border:1px solid ${T.cardEdge};border-radius:12px;background:${T.panelGrad};overflow:hidden;box-shadow:0 1px 3px rgba(122,90,42,0.10), inset 0 1px 0 rgba(255,255,255,0.40);}
.tcm-tabs{display:flex;border-bottom:1px solid ${T.hairline};}
.tcm-tab{flex:1;text-align:center;padding:12px 8px;font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};background:transparent;border:none;cursor:pointer;transition:color .15s,background .15s;}
.tcm-tab:hover{color:${T.inkStrong};}
.tcm-tab.on{color:#6E4A12;background:rgba(201,154,63,0.16);box-shadow:inset 0 -2px 0 ${GOLD};}
.tcm-body{padding:12px 16px 6px;}
.tcm-empty{text-align:center;padding:20px 8px;color:${T.inkWarm};font-size:12px;font-style:italic;}
.tcm-review{display:flex;gap:10px;padding:11px 0;border-bottom:1px solid ${T.hairline};}
.tcm-review:last-child{border-bottom:none;}
.tcm-review.mine{cursor:pointer;border:1px solid rgba(201,154,63,0.45);background:rgba(201,154,63,0.07);border-radius:10px;padding:11px 12px;margin-bottom:4px;}
.tcm-review.mine:hover{border-color:${GOLD};}
.tcm-avatar{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:12px;color:${INK};}
.tcm-review-main{flex:1;min-width:0;}
.tcm-review-top{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;}
.tcm-review-name{font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;color:${T.inkStrong};}
.tcm-review-pack{font-size:10px;color:${T.inkWarm};}
.tcm-review-badge{font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#6E4A12;background:rgba(201,154,63,0.20);padding:2px 7px;border-radius:999px;}
.tcm-paws{display:inline-flex;gap:2px;margin-top:4px;}
.tcm-review-text{font-size:12px;line-height:1.5;color:rgba(42,22,8,0.86);margin-top:5px;}
.tcm-advice{padding:11px 0;border-bottom:1px solid ${T.hairline};}
.tcm-advice:last-child{border-bottom:none;}
.tcm-advice.mine{border:1px solid rgba(201,154,63,0.45);background:rgba(201,154,63,0.07);border-radius:10px;padding:11px 12px;margin-bottom:4px;}
.tcm-advice-text{font-size:12.5px;line-height:1.5;color:rgba(42,22,8,0.86);}
.tcm-advice-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10.5px;color:${T.inkWarm};margin-top:5px;}
.tcm-advice-del{flex-shrink:0;background:none;border:none;color:${T.inkWarm};font-size:14px;line-height:1;cursor:pointer;padding:0 2px;}
.tcm-advice-del:hover{color:#E0796D;}

/* pager */
.tcm-pager{display:flex;align-items:center;justify-content:center;gap:16px;padding:13px 0 8px;}
.tcm-pager button{width:26px;height:26px;border-radius:50%;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkStrong};font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;}
.tcm-pager button:hover:not(:disabled){border-color:${GOLD};color:${GOLD};}
.tcm-pager button:disabled{opacity:.28;cursor:default;}
.tcm-pager span{font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.04em;color:${T.inkWarm};min-width:30px;text-align:center;}

/* reviews dropdown toggle — list is collapsed by default, CTA above stays visible */
.tcm-collapse-toggle{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;padding:10px;margin-bottom:10px;border-radius:10px;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkWarm};font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;}
.tcm-collapse-toggle:hover{border-color:${GOLD};color:${GOLD};}
.tcm-collapse-chevron{display:inline-block;font-size:11px;transition:transform .15s;}
.tcm-collapse-chevron.open{transform:rotate(180deg);}

/* per-review like/heart */
.tcm-review-footer{display:flex;justify-content:flex-end;margin-top:6px;}

/* add review CTA */
.tcm-addrow{margin-bottom:14px;}
/* HLAVNÉ CTA SEKCIE = LAPIS (Matej 1. 9. 2026: „to CTA pridať hodnotenie by malo byť
   lapisom"). Zlatý gradient tu stál od začiatku a na papyruse bol druhou plnou farebnou
   plochou v článku — kánon má plnú farbu vyhradenú pre hlavné CTA a to je lapisové.
   Geometria (radius 8, Cinzel 700 uppercase) sa NEMENÍ: preberá sa z locknutého
   ".btn-gold", mení sa len výplň. Zlaté písmo na modrom je egyptská dvojica, nie ozdoba. */
.tcm-btn-gold{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:12px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.edge};cursor:pointer;box-shadow:${LAPIS_BTN_SHADOW};}
.tcm-btn-gold:hover:not(:disabled){background:${LAPIS.gradHover};}
.tcm-btn-gold:disabled{opacity:.35;cursor:default;box-shadow:none;filter:none;}
.tcm-gatehint{text-align:center;font-size:11px;color:${T.inkWarm};font-style:italic;margin-top:7px;}

/* ask a question box */
.tcm-askbox{margin-bottom:16px;}
.tcm-ask-actions{display:flex;justify-content:flex-end;margin-top:8px;}
.tcm-postbtn{font-family:${FONT_TITLE};font-weight:700;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;padding:8px 18px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.edge};cursor:pointer;box-shadow:${LAPIS_BTN_SHADOW};}
.tcm-postbtn:disabled{opacity:.35;cursor:default;}

/* popup (self-contained, same look as WalkedPopup in packCommunityUI.tsx) */
.tcm-overlay{position:fixed;inset:0;z-index:1200;background:rgba(3,2,1,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.tcm-modal{width:100%;max-width:400px;max-height:calc(100dvh - 40px);overflow-y:auto;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;box-shadow:${T.panelShadow};padding:24px;}
.tcm-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}
.tcm-modal-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${T.inkStrong};line-height:1.25;}
.tcm-modal-sub{font-size:12px;color:${T.inkWarm};margin-top:4px;}
.tcm-x{flex-shrink:0;width:30px;height:30px;border-radius:50%;background:${T.tileBg};border:1px solid ${T.border};color:${T.inkStrong};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.tcm-x:hover{border-color:${GOLD};color:${GOLD};}
.tcm-field{margin-bottom:16px;}
.tcm-label{display:block;font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${T.cardEdge};margin-bottom:9px;}
.tcm-pawpick{display:flex;justify-content:center;}
.tcm-textarea{width:100%;background:#FBF5E6;border:1px solid rgba(179,130,45,0.55);border-radius:8px;padding:10px 12px;color:${T.inkStrong};font-family:inherit;font-size:13px;outline:0;resize:vertical;min-height:72px;}
.tcm-textarea:focus{border-color:${GOLD};}
/* Odoslanie v modáli = hlavné CTA toho panela ⇒ tiež lapis, nech sa cesta „pridaj
   hodnotenie → odošli" nemení farbu uprostred. */
.tcm-submit{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.edge};cursor:pointer;box-shadow:${LAPIS_BTN_SHADOW};}
.tcm-submit:disabled{opacity:.4;cursor:default;}
.tcm-deletebtn{width:100%;margin-top:9px;font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;padding:10px;border-radius:10px;background:rgba(178,38,30,0.14);color:#E0796D;border:1px solid rgba(206,75,60,0.4);cursor:pointer;}
.tcm-deletebtn:hover{background:rgba(178,38,30,0.22);}

/* nenápadné "Report" na cudzom (reálnom, nie mock) komentári — issue #54 */
.tcm-reportlink{background:none;border:none;padding:0;font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.05em;color:${T.inkWarm};cursor:pointer;text-decoration:underline;text-underline-offset:2px;}
.tcm-reportlink:hover{color:${GOLD};}
.tcm-reportreason{width:100%;text-align:left;font-size:13px;padding:12px 14px;border-radius:10px;background:${T.tileBg};border:1px solid ${T.border};color:${T.inkStrong};cursor:pointer;margin-bottom:8px;}
.tcm-reportreason:hover{border-color:${GOLD};}
.tcm-reportreason.on{border-color:${GOLD};color:${GOLD};}
.tcm-reportcancel{width:100%;margin-top:8px;background:none;border:0;color:${T.onDarkDim};font-family:inherit;font-size:12.5px;padding:9px;cursor:pointer;}
.tcm-reportcancel:hover{color:${T.onDark};}
`;

function Paws({ rating }: { rating: number }) {
  return (
    <span className="tcm-paws" aria-label={`${rating} out of 5 paws`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <BrandIcon key={n} name="paw" size={12} tint="gold" style={{ opacity: n <= rating ? 1 : 0.22 }} />
      ))}
    </span>
  );
}

// clickable 1..5 paw picker. Lokálna kópia ZMAZANÁ 2026-08-05 spolu s `PawInput`
// (packCommunityUI.tsx) — obe kreslili len OBRYS a vybrané odlišovali zlatým filtrom.
// Matej: „chcem aby pri hodnotení a kontakte myšou alebo dotykom sa packy vyplnili na ploche."
// Jediný interaktívny picker packiek je odteraz `PawRating` — samostatná mountovateľnosť
// TripComments tým netrpí (je to čistý komponent bez kontextu, ako `BrandIcon` vedľa).
function PawPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="tcm-pawpick">
      <PawRating value={value} onChange={onChange} onDark size={30} />
    </div>
  );
}

// ── pager — "‹ 1/N ›", edges disabled (no wrap) ──
function Pager({ page, totalPages, onPrev, onNext }: { page: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
  const t = useT();
  if (totalPages <= 1) return null;
  return (
    <div className="tcm-pager">
      <button type="button" onClick={onPrev} disabled={page <= 1} aria-label={t('pack.trip.cm.prevPage')}>‹</button>
      <span>{page}/{totalPages}</span>
      <button type="button" onClick={onNext} disabled={page >= totalPages} aria-label={t('pack.trip.cm.nextPage')}>›</button>
    </div>
  );
}

// ── review popup — paws (1-5, required) + optional text. Visually matches WalkedPopup
// (packCommunityUI.tsx): dark glass overlay + card, gold title, gold submit. Deliberately
// lighter than WalkedPopup's full form (no difficulty/vibe/hazards) — this is a rating+opinion,
// not a walk log. ──
function ReviewPopup({ trailName, initial, canWrite, saving, error, onSubmit, onDelete, onClose }: {
  trailName: string; initial?: RealReview | null; canWrite: boolean; saving: boolean; error: string | null;
  onSubmit: (v: { paws: number; text?: string }) => void; onDelete?: () => void; onClose: () => void;
}) {
  const t = useT();
  const [paws, setPaws] = useState(initial?.paws ?? 0);
  const [text, setText] = useState(initial?.body ?? '');
  const canSubmit = paws > 0 && canWrite && !saving;
  return (
    <div className="tcm-overlay" onClick={onClose}>
      <div className="tcm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tcm-modal-head">
          <div>
            <div className="tcm-modal-title">{initial ? t('pack.trip.cm.editYours') : t('pack.trip.cm.addYours')}</div>
            <div className="tcm-modal-sub">{trailName}</div>
          </div>
          <button type="button" className="tcm-x" onClick={onClose} aria-label={t('pack.trip.cm.close')}>×</button>
        </div>
        <div className="tcm-field" style={{ textAlign: 'center' }}>
          <label className="tcm-label">{t('pack.trip.cm.howWas')}</label>
          <PawPicker value={paws} onChange={setPaws} />
        </div>
        <div className="tcm-field">
          <label className="tcm-label">{t('pack.trip.cm.sayMore')}</label>
          <textarea className="tcm-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('pack.trip.cm.sayMorePlaceholder')} />
        </div>
        <button type="button" className="tcm-submit" disabled={!canSubmit} onClick={() => canSubmit && onSubmit({ paws, text: text.trim() || undefined })}>
          {saving ? 'Saving…' : initial ? t('pack.trip.cm.update') : t('pack.trip.cm.post')}
        </button>
        {initial && onDelete && (
          <button type="button" className="tcm-deletebtn" disabled={saving} onClick={onDelete}>{t('pack.trip.cm.delete')}</button>
        )}
        {!canWrite && <div className="tcm-gatehint">{t('pack.trip.cm.signInReview')}</div>}
        {error && <div className="tcm-gatehint" style={{ color: '#E0796D' }}>{error}</div>}
      </div>
    </div>
  );
}

// Dôvody nahlásenia — rovnaké znenie ako Thread.tsx (§54), duplikované zámerne: ten súbor sa
// needituje (pracujú na ňom iní agenti) a `REPORT_REASONS` v ňom nie je exportovaný.
// ⚠️ `label` je i18n KĽÚČ, nie text — konštanta je modulová a `useT()` je hook, takže
// prekladá až komponent (rovnaký vzor ako ACTIVITIES v AddTripPlan).
const REPORT_REASONS: Array<{ id: ReportReason; label: string }> = [
  { id: 'harassment', label: 'pack.trip.rp.reasonHarassment' },
  { id: 'spam', label: 'pack.trip.rp.reasonSpam' },
  { id: 'unsafe', label: 'pack.trip.rp.reasonUnsafe' },
  { id: 'not_dog_related', label: 'pack.trip.rp.reasonOffTopic' },
  { id: 'other', label: 'pack.trip.rp.reasonOther' },
];

// ── nahlásenie cudzieho (reálneho, nie mock) komentára — issue #54. Vzor prevzatý z
// Thread.tsx (msg-modsheet: dôvod → poznámka → odoslať → potvrdenie), znovupostavené lokálne
// nad tcm-* triedami, lebo Thread.tsx sa needituje/neexportuje odtiaľ nič použiteľné. ──
function ReportSheet({ onClose, onSend, busy, error, sent }: {
  onClose: () => void; onSend: (reason: ReportReason, note?: string) => void; busy: boolean; error: string | null; sent: boolean;
}) {
  const t = useT();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  return (
    <div className="tcm-overlay" onClick={onClose}>
      <div className="tcm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tcm-modal-head">
          <div className="tcm-modal-title">{sent ? t('pack.trip.rp.sent') : t('pack.trip.rp.why')}</div>
          <button type="button" className="tcm-x" onClick={onClose} aria-label={t('pack.trip.cm.close')}>×</button>
        </div>
        {sent ? (
          <div className="tcm-modal-sub">{t('pack.trip.rp.matejReads')}</div>
        ) : (
          <>
            <div className="tcm-field">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`tcm-reportreason${reason === r.id ? ' on' : ''}`}
                  onClick={() => setReason(r.id)}
                >{t(r.label)}</button>
              ))}
            </div>
            <div className="tcm-field">
              <textarea className="tcm-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('pack.trip.rp.notePlaceholder')} />
            </div>
            {error && <div className="tcm-gatehint" style={{ color: '#E0796D' }}>{error}</div>}
            <button type="button" className="tcm-submit" disabled={!reason || busy} onClick={() => reason && onSend(reason, note.trim() || undefined)}>
              {busy ? 'Sending…' : t('pack.trip.rp.send')}
            </button>
            <button type="button" className="tcm-reportcancel" onClick={onClose}>{t('pack.trip.rp.cancel')}</button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * ── AUTOROVO HODNOTENIE JE PRVÉ V ZOZNAME (Matej 2026-08-25) ─────────────────────────────
 *
 * „pri autorovom hodnotení bude fotka autora — Autor tripu a počet hviezdičiek… musí tam
 *  svietiť (1) a hodnotenie (1)."
 *
 * Do teraz sa počítali DVE rôzne čísla pod tým istým slovom: hore v článku „(2)" (chodci
 * z `crowdAggregate` — a tí sú pri seed výlete DVAJA, lebo Matej + Hekthor) a tu „REVIEWS (0)"
 * (riadky v `trip_reviews`). Obe boli po svojom pravdivé a spolu nedávali zmysel.
 *
 * Zjednotené na jednu vetu: **hodnotenie výletu má autor a majú ho členovia, ktorí ho napísali.**
 * Autorovo hodnotenie NIE JE v `trip_reviews` — je to `trail.stars`, teda labky, ktoré dal pri
 * zakladaní výletu (`stars: draft.paws` v `PackMap.tsx`; pri seed výletoch hodnota z nahadzovača).
 * Preto sa sem posiela zvonku a rátame ho ako JEDNO hodnotenie, nie ako dvoch chodcov.
 *
 * ⚠️ `authorRating = 0` znamená NEHODNOTENÉ, nie nula labiek — vtedy riadok nie je a počet
 * o neho nerastie. Rovnaké pravidlo ako `agg.rating > 0` v článku.
 */
export function TripComments({ tripId, tripName, walked, onMarkWalked, onRequestWalk, authorRating = 0, authorName, onCountChange }: {
  tripId: string; tripName?: string; walked?: boolean; onMarkWalked?: () => void; onRequestWalk?: () => void;
  /** Labky autora výletu (`trail.stars`). 0 = nehodnotil. */
  authorRating?: number;
  /** Meno autora — do riadku aj do iniciálky v krúžku. */
  authorName?: string;
  /** Hlási počet hodnotení hore do článku, aby zátvorka pri labkách a tento tab
   *  nikdy neukazovali dve rôzne čísla. */
  onCountChange?: (n: number) => void;
}) {
  const t = useT();
  const [tab, setTab] = useState<'reviews' | 'advice'>('reviews');
  const [page, setPage] = useState(1);
  const changeTab = (t: 'reviews' | 'advice') => { setTab(t); setPage(1); };

  // reviews collapse behind a dropdown by default — "Add review" CTA stays visible above it.
  const [reviewsOpen, setReviewsOpen] = useState(false);

  // ── real content (issue #52) — `undefined` = auth not checked yet, `null` = signed out /
  // DEV_NOAUTH. Reviews/questions from the DB are fetched regardless (RLS/RPC returns empty for a
  // signed-out caller, same "appka beží ďalej" pattern as packMessaging.ts). ──
  const [authedUserId, setAuthedUserId] = useState<string | null | undefined>(undefined);
  const [realReviews, setRealReviews] = useState<RealReview[]>([]);
  const [realQuestions, setRealQuestions] = useState<RealQuestion[]>([]);
  const canWrite = authedUserId != null;

  const [reviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [askText, setAskText] = useState('');
  const [questionPosting, setQuestionPosting] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // ── report (issue #54) — `reportRef` = id komentára (review.id / question.id) aktuálne
  // otváraného sheetu, null = zavreté. Len na REÁLNE cudzie komentáre (viď render nižšie) —
  // vlastný komentár sa nedá nahlásiť sám na seba. ──
  const [reportRef, setReportRef] = useState<string | null>(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    let alive = true;
    void getAuthedUserId().then((uid) => { if (alive) setAuthedUserId(uid); });
    return () => { alive = false; };
  }, []);

  const refreshReviews = useCallback(async () => {
    setRealReviews(await fetchTripReviews(tripId));
  }, [tripId]);
  const refreshQuestions = useCallback(async () => {
    setRealQuestions(await fetchTripQuestions(tripId));
  }, [tripId]);

  useEffect(() => { void refreshReviews(); void refreshQuestions(); }, [refreshReviews, refreshQuestions]);

  const myReview = realReviews.find((r) => r.isMine) ?? null;
  const otherReviews = realReviews.filter((r) => !r.isMine);
  const myQuestionsForTrip = realQuestions.filter((q) => q.isMine);
  const otherQuestions = realQuestions.filter((q) => !q.isMine);

  // Autor sa počíta ako jedno hodnotenie — viď blok pri signatúre.
  const hasAuthorRating = authorRating > 0;
  const reviewCount = realReviews.length + (hasAuthorRating ? 1 : 0);
  const adviceCount = realQuestions.length;

  // Hore do článku. Beží po každej zmene zoznamu (dotiahnutie z DB, pridanie, zmazanie), aby
  // zátvorka pri labkách nezamrzla na čísle z prvého renderu.
  useEffect(() => { onCountChange?.(reviewCount); }, [reviewCount, onCountChange]);

  const reviewPages = Math.max(1, Math.ceil(reviewCount / PAGE_SIZE));
  const advicePages = Math.max(1, Math.ceil(adviceCount / PAGE_SIZE));

  // clamp page if list shrinks (e.g. deleting my own review/question mid-page)
  useEffect(() => { if (page > reviewPages) setPage(reviewPages); }, [reviewPages, page]);
  useEffect(() => { if (page > advicePages) setPage(advicePages); }, [advicePages, page]);

  const saveReview = async (v: { paws: number; text?: string }) => {
    setReviewError(null);
    setReviewSaving(true);
    try {
      await upsertMyReview(tripId, v.paws, v.text);
      await refreshReviews();
      onMarkWalked?.(); // reviewing implies (and guarantees) the trip is marked walked
      setReviewPopupOpen(false);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : t('pack.trip.cm.saveFailed'));
    } finally {
      setReviewSaving(false);
    }
  };
  const deleteReview = async () => {
    setReviewError(null);
    setReviewSaving(true);
    try {
      await deleteMyReview(tripId);
      await refreshReviews();
      setReviewPopupOpen(false);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : t('pack.trip.cm.deleteFailed'));
    } finally {
      setReviewSaving(false);
    }
  };

  const postQuestion = async () => {
    const text = askText.trim();
    if (!text) return;
    setQuestionError(null);
    setQuestionPosting(true);
    try {
      await postTripQuestion(tripId, text);
      await refreshQuestions();
      setAskText('');
    } catch (err) {
      setQuestionError(err instanceof Error ? err.message : t('pack.trip.cm.postFailed'));
    } finally {
      setQuestionPosting(false);
    }
  };
  const deleteQuestion = async (id: string) => {
    try {
      await deleteTripQuestion(id);
      await refreshQuestions();
    } catch {
      setQuestionError('Could not delete — try again.');
    }
  };

  const openReport = (ref: string) => { setReportRef(ref); setReportSent(false); setReportError(null); };
  const closeReport = () => setReportRef(null);
  const sendReport = async (reason: ReportReason, note?: string) => {
    if (!reportRef) return;
    setReportBusy(true);
    setReportError(null);
    try {
      await reportContent('comment', reportRef, reason, note);
      setReportSent(true);
    } catch {
      setReportError('Could not send the report. Check your connection and try again.');
    } finally {
      setReportBusy(false);
    }
  };

  // ── combined render lists: mine (real, pinned first) → other real members. Single array +
  // one slice replaces the old "mine pinned to page 1" offset math, which only had to handle a
  // single localStorage row — the DB can hold reviews/questions from any number of real members,
  // so the list needs to generalize instead of special-casing one row. ──
  type ReviewItem =
    | { kind: 'author' }
    | { kind: 'mine'; review: RealReview }
    | { kind: 'real'; review: RealReview };
  // Autor je PRVÝ, pred mojím hodnotením: je to hodnotenie človeka, ktorý výlet zapísal,
  // teda jediné, ktoré tam bolo od začiatku.
  const reviewItems: ReviewItem[] = [
    ...(hasAuthorRating ? [{ kind: 'author' as const }] : []),
    ...(myReview ? [{ kind: 'mine' as const, review: myReview }] : []),
    ...otherReviews.map((review) => ({ kind: 'real' as const, review })),
  ];
  const reviewStart = (page - 1) * PAGE_SIZE;
  const reviewPageItems = reviewItems.slice(reviewStart, reviewStart + PAGE_SIZE);

  type QuestionItem =
    | { kind: 'mine'; q: RealQuestion }
    | { kind: 'real'; q: RealQuestion };
  const questionItems: QuestionItem[] = [
    ...myQuestionsForTrip.map((q) => ({ kind: 'mine' as const, q })),
    ...otherQuestions.map((q) => ({ kind: 'real' as const, q })),
  ];
  const adviceStart = (page - 1) * PAGE_SIZE;
  const advicePageItems = questionItems.slice(adviceStart, adviceStart + PAGE_SIZE);

  return (
    <div className="tcm-wrap" aria-label={t('pack.trip.cm.aria', { name: tripName ?? t('pack.trip.cm.thisTrip') })}>
      <style>{TRIP_COMMENTS_CSS}</style>
      <div className="tcm-tabs">
        <button type="button" className={`tcm-tab${tab === 'reviews' ? ' on' : ''}`} onClick={() => changeTab('reviews')}>
          {t('pack.trip.cm.reviews', { n: reviewCount })}
        </button>
        <button type="button" className={`tcm-tab${tab === 'advice' ? ' on' : ''}`} onClick={() => changeTab('advice')}>
          {t('pack.trip.cm.advice', { n: adviceCount })}
        </button>
      </div>
      <div className="tcm-body">
        {tab === 'reviews' ? (
          <>
            <div className="tcm-addrow">
              {/* §16 (2026-07-23): keď trip NIE je walked, tlačidlo neni disabled — je to CTA
                  „Walked this trail? ADD REVIEW!" ktoré otvorí ten istý walked-popup ako „Mark
                  walked" (onRequestWalk). Po walked submitte sa z neho stane bežné Add/Edit review. */}
              <button
                type="button"
                className="tcm-btn-gold"
                onClick={() => (walked ? setReviewPopupOpen(true) : onRequestWalk?.())}
              >
                {walked ? (myReview ? t('pack.trip.cm.editMine') : t('pack.trip.cm.addShort')) : t('pack.trip.cm.walkedThen')}
              </button>
            </div>

            {reviewCount > 0 && (
              <button type="button" className="tcm-collapse-toggle" onClick={() => setReviewsOpen((v) => !v)}>
                {reviewsOpen ? t('pack.trip.cm.hide') : `Show ${reviewCount} review${reviewCount === 1 ? '' : 's'}`}
                <span className={`tcm-collapse-chevron${reviewsOpen ? ' open' : ''}`}>⌄</span>
              </button>
            )}

            {reviewCount === 0 && <div className="tcm-empty">{t('pack.trip.cm.beFirstReview')}</div>}

            {reviewsOpen && (
              <>
                {reviewPageItems.map((item) => {
                  if (item.kind === 'author') {
                    /* ⚠️ Avatar je INICIÁLKA, nie fotka — a je to dočasné. Matej si pýtal
                       „fotka autora", ale dataset o autorovi nesie JEDINE meno
                       (`HeroTrail.author`, pri seed výletoch ani to — `AUTHOR_FALLBACK`),
                       a `list_trip_reviews()` vracia tiež len krstné meno a číslo v svorke.
                       Fotka sa teda nedá vziať odnikiaľ bez toho, aby sme ju vymysleli.
                       Zapojí sa, keď budú profily členov vracať avatar. */
                    const nm = authorName?.trim() || t('pack.trip.cm.dogyptian');
                    return (
                      <div className="tcm-review" key="author">
                        <span className="tcm-avatar">{nm.charAt(0).toUpperCase()}</span>
                        <div className="tcm-review-main">
                          <div className="tcm-review-top">
                            <span className="tcm-review-name">{nm}</span>
                            <span className="tcm-review-badge">{t('pack.trip.cm.tripAuthor')}</span>
                          </div>
                          <Paws rating={authorRating} />
                        </div>
                      </div>
                    );
                  }
                  if (item.kind === 'mine') {
                    const r = item.review;
                    return (
                      <div className="tcm-review mine" key="mine" onClick={() => setReviewPopupOpen(true)}>
                        <span className="tcm-avatar"><BrandIcon name="paw" size={16} tint="dark" /></span>
                        <div className="tcm-review-main">
                          <div className="tcm-review-top">
                            <span className="tcm-review-name">You</span>
                            <span className="tcm-review-badge">{t('pack.trip.cm.yourReview')}</span>
                          </div>
                          <Paws rating={r.paws} />
                          {r.body && <div className="tcm-review-text">{r.body}</div>}
                        </div>
                      </div>
                    );
                  }
                  if (item.kind === 'real') {
                    const r = item.review;
                    const name = r.ownerFirst ?? t('pack.trip.cm.dogyptian');
                    return (
                      <div className="tcm-review" key={r.id}>
                        <span className="tcm-avatar">{name.charAt(0).toUpperCase()}</span>
                        <div className="tcm-review-main">
                          <div className="tcm-review-top">
                            <span className="tcm-review-name">{name}</span>
                            {r.packNumber != null && <span className="tcm-review-pack">· Dogyptian #{r.packNumber}</span>}
                          </div>
                          <Paws rating={r.paws} />
                          {r.body && <div className="tcm-review-text">{r.body}</div>}
                          {canWrite && (
                            <div className="tcm-review-footer">
                              <button type="button" className="tcm-reportlink" onClick={() => openReport(r.id)}>{t('pack.trip.cm.report')}</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                <Pager page={page} totalPages={reviewPages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(reviewPages, p + 1))} />
              </>
            )}
          </>
        ) : (
          <>
            <div className="tcm-askbox">
              <textarea
                className="tcm-textarea"
                value={askText}
                onChange={(e) => setAskText(e.target.value)}
                placeholder={t('pack.trip.cm.askPlaceholder')}
              />
              <div className="tcm-ask-actions">
                <button type="button" className="tcm-postbtn" disabled={!askText.trim() || !canWrite || questionPosting} onClick={postQuestion}>
                  {questionPosting ? t('pack.trip.cm.postQuestion') + '…' : t('pack.trip.cm.postQuestion')}
                </button>
              </div>
              {!canWrite && <div className="tcm-gatehint">{t('pack.trip.cm.signInAsk')}</div>}
              {questionError && <div className="tcm-gatehint" style={{ color: '#E0796D' }}>{questionError}</div>}
            </div>

            {adviceCount === 0 ? (
              <div className="tcm-empty">{t('pack.trip.cm.noQuestions')}</div>
            ) : (
              advicePageItems.map((item) => {
                if (item.kind === 'mine') {
                  return (
                    <div className="tcm-advice mine" key={item.q.id}>
                      <div className="tcm-advice-text">{item.q.body}</div>
                      <div className="tcm-advice-meta">
                        <span>You</span>
                        <button type="button" className="tcm-advice-del" onClick={() => deleteQuestion(item.q.id)} aria-label={t('pack.trip.cm.deleteQuestion')}>✕</button>
                      </div>
                    </div>
                  );
                }
                if (item.kind === 'real') {
                  const name = item.q.ownerFirst ?? t('pack.trip.cm.dogyptian');
                  return (
                    <div className="tcm-advice" key={item.q.id}>
                      <div className="tcm-advice-text">{item.q.body}</div>
                      <div className="tcm-advice-meta">
                        <span>{name}{item.q.packNumber != null ? ` · Dogyptian #${item.q.packNumber}` : ''}</span>
                        {canWrite && (
                          <button type="button" className="tcm-reportlink" onClick={() => openReport(item.q.id)}>{t('pack.trip.cm.report')}</button>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })
            )}
            <Pager page={page} totalPages={advicePages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(advicePages, p + 1))} />
          </>
        )}
      </div>

      {reviewPopupOpen && (
        <ReviewPopup
          trailName={tripName ?? 'this trip'}
          initial={myReview}
          canWrite={canWrite}
          saving={reviewSaving}
          error={reviewError}
          onSubmit={saveReview}
          onDelete={myReview ? deleteReview : undefined}
          onClose={() => setReviewPopupOpen(false)}
        />
      )}

      {reportRef && (
        <ReportSheet
          onClose={closeReport}
          onSend={sendReport}
          busy={reportBusy}
          error={reportError}
          sent={reportSent}
        />
      )}
    </div>
  );
}
