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
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
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

export const TRIP_COMMENTS_CSS = `
.tcm-wrap{margin-top:16px;border:1px solid ${T.onDarkBorder};border-radius:14px;background:${T.glass};overflow:hidden;}
.tcm-tabs{display:flex;border-bottom:1px solid ${T.onDarkHair};}
.tcm-tab{flex:1;text-align:center;padding:12px 8px;font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${T.onDarkDim};background:transparent;border:none;cursor:pointer;transition:color .15s,background .15s;}
.tcm-tab:hover{color:${T.onDark};}
.tcm-tab.on{color:${GOLD};background:rgba(201,154,63,0.10);box-shadow:inset 0 -2px 0 ${GOLD};}
.tcm-body{padding:12px 16px 6px;}
.tcm-empty{text-align:center;padding:20px 8px;color:${T.onDarkDim};font-size:12px;font-style:italic;}
.tcm-review{display:flex;gap:10px;padding:11px 0;border-bottom:1px solid ${T.onDarkHair};}
.tcm-review:last-child{border-bottom:none;}
.tcm-review.mine{cursor:pointer;border:1px solid rgba(201,154,63,0.45);background:rgba(201,154,63,0.07);border-radius:10px;padding:11px 12px;margin-bottom:4px;}
.tcm-review.mine:hover{border-color:${GOLD};}
.tcm-avatar{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:12px;color:${INK};}
.tcm-review-main{flex:1;min-width:0;}
.tcm-review-top{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;}
.tcm-review-name{font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;color:${T.onDark};}
.tcm-review-pack{font-size:10px;color:${T.onDarkDim};}
.tcm-review-badge{font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:${GOLD};background:rgba(201,154,63,0.16);padding:2px 7px;border-radius:999px;}
.tcm-paws{display:inline-flex;gap:2px;margin-top:4px;}
.tcm-review-text{font-size:12px;line-height:1.5;color:${T.onDarkDim};margin-top:5px;}
.tcm-advice{padding:11px 0;border-bottom:1px solid ${T.onDarkHair};}
.tcm-advice:last-child{border-bottom:none;}
.tcm-advice.mine{border:1px solid rgba(201,154,63,0.45);background:rgba(201,154,63,0.07);border-radius:10px;padding:11px 12px;margin-bottom:4px;}
.tcm-advice-text{font-size:12.5px;line-height:1.5;color:${T.onDark};}
.tcm-advice-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10.5px;color:${T.onDarkDim};margin-top:5px;}
.tcm-advice-del{flex-shrink:0;background:none;border:none;color:${T.onDarkDim};font-size:14px;line-height:1;cursor:pointer;padding:0 2px;}
.tcm-advice-del:hover{color:#E0796D;}

/* pager */
.tcm-pager{display:flex;align-items:center;justify-content:center;gap:16px;padding:13px 0 8px;}
.tcm-pager button{width:26px;height:26px;border-radius:50%;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;}
.tcm-pager button:hover:not(:disabled){border-color:${GOLD};color:${GOLD};}
.tcm-pager button:disabled{opacity:.28;cursor:default;}
.tcm-pager span{font-family:${FONT_UI};font-weight:500;font-size:11px;letter-spacing:.04em;color:${T.onDarkDim};min-width:30px;text-align:center;}

/* reviews dropdown toggle — list is collapsed by default, CTA above stays visible */
.tcm-collapse-toggle{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;padding:10px;margin-bottom:10px;border-radius:10px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);color:${T.onDarkDim};font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;}
.tcm-collapse-toggle:hover{border-color:${GOLD};color:${GOLD};}
.tcm-collapse-chevron{display:inline-block;font-size:11px;transition:transform .15s;}
.tcm-collapse-chevron.open{transform:rotate(180deg);}

/* per-review like/heart */
.tcm-review-footer{display:flex;justify-content:flex-end;margin-top:6px;}

/* add review CTA */
.tcm-addrow{margin-bottom:14px;}
.tcm-btn-gold{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:12px;border-radius:8px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);color:#000;border:1px solid rgba(250,244,236,0.30);cursor:pointer;box-shadow:0 0 22px rgba(230,158,26,0.32),inset 0 1px 0 rgba(255,255,255,0.3);}
.tcm-btn-gold:hover:not(:disabled){filter:brightness(1.04);}
.tcm-btn-gold:disabled{opacity:.35;cursor:default;box-shadow:none;filter:none;}
.tcm-gatehint{text-align:center;font-size:11px;color:${T.onDarkDim};font-style:italic;margin-top:7px;}

/* ask a question box */
.tcm-askbox{margin-bottom:16px;}
.tcm-ask-actions{display:flex;justify-content:flex-end;margin-top:8px;}
.tcm-postbtn{font-family:${FONT_TITLE};font-weight:700;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;padding:8px 18px;border-radius:8px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);color:#000;border:1px solid rgba(250,244,236,0.30);cursor:pointer;}
.tcm-postbtn:disabled{opacity:.35;cursor:default;}

/* popup (self-contained, same look as WalkedPopup in packCommunityUI.tsx) */
.tcm-overlay{position:fixed;inset:0;z-index:1200;background:rgba(3,2,1,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.tcm-modal{width:100%;max-width:400px;max-height:calc(100dvh - 40px);overflow-y:auto;background:${T.glass};backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid ${T.onDarkBorder};border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(245,240,228,0.06);padding:24px;}
.tcm-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}
.tcm-modal-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${GOLD};line-height:1.25;}
.tcm-modal-sub{font-size:12px;color:${T.onDarkDim};margin-top:4px;}
.tcm-x{flex-shrink:0;width:30px;height:30px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.tcm-x:hover{border-color:${GOLD};color:${GOLD};}
.tcm-field{margin-bottom:16px;}
.tcm-label{display:block;font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:9px;}
.tcm-pawpick{display:flex;justify-content:center;gap:10px;}
.tcm-pawpick button{background:none;border:none;cursor:pointer;padding:2px;line-height:0;}
.tcm-pawpick button:hover img{transform:scale(1.12);}
.tcm-pawpick img{transition:transform .1s;}
.tcm-textarea{width:100%;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:10px;padding:10px 12px;color:${T.onDark};font-family:inherit;font-size:13px;outline:0;resize:vertical;min-height:72px;}
.tcm-textarea:focus{border-color:${GOLD};}
.tcm-submit{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:10px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);color:#000;border:1px solid rgba(250,244,236,0.30);cursor:pointer;}
.tcm-submit:disabled{opacity:.4;cursor:default;}
.tcm-deletebtn{width:100%;margin-top:9px;font-family:${FONT_UI};font-weight:600;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;padding:10px;border-radius:10px;background:rgba(178,38,30,0.14);color:#E0796D;border:1px solid rgba(206,75,60,0.4);cursor:pointer;}
.tcm-deletebtn:hover{background:rgba(178,38,30,0.22);}

/* nenápadné "Report" na cudzom (reálnom, nie mock) komentári — issue #54 */
.tcm-reportlink{background:none;border:none;padding:0;font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.05em;color:${T.onDarkDim};cursor:pointer;text-decoration:underline;text-underline-offset:2px;}
.tcm-reportlink:hover{color:${GOLD};}
.tcm-reportreason{width:100%;text-align:left;font-size:13px;padding:12px 14px;border-radius:10px;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};color:${T.onDark};cursor:pointer;margin-bottom:8px;}
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

// clickable 1..5 paw picker — visual match to PawInput in packCommunityUI.tsx (WalkedPopup),
// re-implemented locally so TripComments stays a self-contained, independently-mountable unit.
function PawPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="tcm-pawpick">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} paws`}>
          <BrandIcon name="paw" size={30} tint={n <= value ? 'gold' : 'white'} style={{ opacity: n <= value ? 1 : 0.28 }} />
        </button>
      ))}
    </div>
  );
}

// ── pager — "‹ 1/N ›", edges disabled (no wrap) ──
function Pager({ page, totalPages, onPrev, onNext }: { page: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="tcm-pager">
      <button type="button" onClick={onPrev} disabled={page <= 1} aria-label="Previous page">‹</button>
      <span>{page}/{totalPages}</span>
      <button type="button" onClick={onNext} disabled={page >= totalPages} aria-label="Next page">›</button>
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
  const [paws, setPaws] = useState(initial?.paws ?? 0);
  const [text, setText] = useState(initial?.body ?? '');
  const canSubmit = paws > 0 && canWrite && !saving;
  return (
    <div className="tcm-overlay" onClick={onClose}>
      <div className="tcm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tcm-modal-head">
          <div>
            <div className="tcm-modal-title">{initial ? 'Edit your review' : 'Add a review'}</div>
            <div className="tcm-modal-sub">{trailName}</div>
          </div>
          <button type="button" className="tcm-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="tcm-field" style={{ textAlign: 'center' }}>
          <label className="tcm-label">How was it? (paws)</label>
          <PawPicker value={paws} onChange={setPaws} />
        </div>
        <div className="tcm-field">
          <label className="tcm-label">Say more (optional)</label>
          <textarea className="tcm-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Muddy after rain, great off-leash stretch near the top…" />
        </div>
        <button type="button" className="tcm-submit" disabled={!canSubmit} onClick={() => canSubmit && onSubmit({ paws, text: text.trim() || undefined })}>
          {saving ? 'Saving…' : initial ? 'Update review' : 'Post review'}
        </button>
        {initial && onDelete && (
          <button type="button" className="tcm-deletebtn" disabled={saving} onClick={onDelete}>Delete review</button>
        )}
        {!canWrite && <div className="tcm-gatehint">Sign in to post a review.</div>}
        {error && <div className="tcm-gatehint" style={{ color: '#E0796D' }}>{error}</div>}
      </div>
    </div>
  );
}

// Dôvody nahlásenia — rovnaké znenie ako Thread.tsx (§54), duplikované zámerne: ten súbor sa
// needituje (pracujú na ňom iní agenti) a `REPORT_REASONS` v ňom nie je exportovaný.
const REPORT_REASONS: Array<{ id: ReportReason; label: string }> = [
  { id: 'harassment', label: 'Harassment or abuse' },
  { id: 'spam', label: 'Spam or advertising' },
  { id: 'unsafe', label: 'Unsafe for people or dogs' },
  { id: 'not_dog_related', label: 'Not dog related' },
  { id: 'other', label: 'Something else' },
];

// ── nahlásenie cudzieho (reálneho, nie mock) komentára — issue #54. Vzor prevzatý z
// Thread.tsx (msg-modsheet: dôvod → poznámka → odoslať → potvrdenie), znovupostavené lokálne
// nad tcm-* triedami, lebo Thread.tsx sa needituje/neexportuje odtiaľ nič použiteľné. ──
function ReportSheet({ onClose, onSend, busy, error, sent }: {
  onClose: () => void; onSend: (reason: ReportReason, note?: string) => void; busy: boolean; error: string | null; sent: boolean;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  return (
    <div className="tcm-overlay" onClick={onClose}>
      <div className="tcm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tcm-modal-head">
          <div className="tcm-modal-title">{sent ? 'Report sent' : 'Why are you reporting this?'}</div>
          <button type="button" className="tcm-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        {sent ? (
          <div className="tcm-modal-sub">Matej reads every report himself.</div>
        ) : (
          <>
            <div className="tcm-field">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`tcm-reportreason${reason === r.id ? ' on' : ''}`}
                  onClick={() => setReason(r.id)}
                >{r.label}</button>
              ))}
            </div>
            <div className="tcm-field">
              <textarea className="tcm-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything Matej should know (optional)" />
            </div>
            {error && <div className="tcm-gatehint" style={{ color: '#E0796D' }}>{error}</div>}
            <button type="button" className="tcm-submit" disabled={!reason || busy} onClick={() => reason && onSend(reason, note.trim() || undefined)}>
              {busy ? 'Sending…' : 'Send report'}
            </button>
            <button type="button" className="tcm-reportcancel" onClick={onClose}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}

export function TripComments({ tripId, tripName, walked, onMarkWalked, onRequestWalk }: {
  tripId: string; tripName?: string; walked?: boolean; onMarkWalked?: () => void; onRequestWalk?: () => void;
}) {
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

  const reviewCount = realReviews.length;
  const adviceCount = realQuestions.length;

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
      setReviewError(err instanceof Error ? err.message : 'Could not save your review — try again.');
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
      setReviewError(err instanceof Error ? err.message : 'Could not delete your review — try again.');
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
      setQuestionError(err instanceof Error ? err.message : 'Could not post — try again.');
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
    | { kind: 'mine'; review: RealReview }
    | { kind: 'real'; review: RealReview };
  const reviewItems: ReviewItem[] = [
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
    <div className="tcm-wrap" aria-label={`Reviews and advice for ${tripName ?? 'this trip'}`}>
      <style>{TRIP_COMMENTS_CSS}</style>
      <div className="tcm-tabs">
        <button type="button" className={`tcm-tab${tab === 'reviews' ? ' on' : ''}`} onClick={() => changeTab('reviews')}>
          Reviews ({reviewCount})
        </button>
        <button type="button" className={`tcm-tab${tab === 'advice' ? ' on' : ''}`} onClick={() => changeTab('advice')}>
          Advice ({adviceCount})
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
                {walked ? (myReview ? 'Edit my review' : 'Add review') : 'Walked this trail? ADD REVIEW!'}
              </button>
            </div>

            {reviewCount > 0 && (
              <button type="button" className="tcm-collapse-toggle" onClick={() => setReviewsOpen((v) => !v)}>
                {reviewsOpen ? 'Hide reviews' : `Show ${reviewCount} review${reviewCount === 1 ? '' : 's'}`}
                <span className={`tcm-collapse-chevron${reviewsOpen ? ' open' : ''}`}>⌄</span>
              </button>
            )}

            {reviewCount === 0 && <div className="tcm-empty">Be the first Dogyptian to review this trail.</div>}

            {reviewsOpen && (
              <>
                {reviewPageItems.map((item) => {
                  if (item.kind === 'mine') {
                    const r = item.review;
                    return (
                      <div className="tcm-review mine" key="mine" onClick={() => setReviewPopupOpen(true)}>
                        <span className="tcm-avatar"><BrandIcon name="paw" size={16} tint="dark" /></span>
                        <div className="tcm-review-main">
                          <div className="tcm-review-top">
                            <span className="tcm-review-name">You</span>
                            <span className="tcm-review-badge">Your review</span>
                          </div>
                          <Paws rating={r.paws} />
                          {r.body && <div className="tcm-review-text">{r.body}</div>}
                        </div>
                      </div>
                    );
                  }
                  if (item.kind === 'real') {
                    const r = item.review;
                    const name = r.ownerFirst ?? 'Dogyptian';
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
                              <button type="button" className="tcm-reportlink" onClick={() => openReport(r.id)}>Report</button>
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
                placeholder="Ask a question…"
              />
              <div className="tcm-ask-actions">
                <button type="button" className="tcm-postbtn" disabled={!askText.trim() || !canWrite || questionPosting} onClick={postQuestion}>
                  {questionPosting ? 'Posting…' : 'Post'}
                </button>
              </div>
              {!canWrite && <div className="tcm-gatehint">Sign in to ask a question.</div>}
              {questionError && <div className="tcm-gatehint" style={{ color: '#E0796D' }}>{questionError}</div>}
            </div>

            {adviceCount === 0 ? (
              <div className="tcm-empty">No questions yet — ask the pack.</div>
            ) : (
              advicePageItems.map((item) => {
                if (item.kind === 'mine') {
                  return (
                    <div className="tcm-advice mine" key={item.q.id}>
                      <div className="tcm-advice-text">{item.q.body}</div>
                      <div className="tcm-advice-meta">
                        <span>You</span>
                        <button type="button" className="tcm-advice-del" onClick={() => deleteQuestion(item.q.id)} aria-label="Delete question">✕</button>
                      </div>
                    </div>
                  );
                }
                if (item.kind === 'real') {
                  const name = item.q.ownerFirst ?? 'Dogyptian';
                  return (
                    <div className="tcm-advice" key={item.q.id}>
                      <div className="tcm-advice-text">{item.q.body}</div>
                      <div className="tcm-advice-meta">
                        <span>{name}{item.q.packNumber != null ? ` · Dogyptian #${item.q.packNumber}` : ''}</span>
                        {canWrite && (
                          <button type="button" className="tcm-reportlink" onClick={() => openReport(item.q.id)}>Report</button>
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
