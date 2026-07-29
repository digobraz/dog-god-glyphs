// Trip detail comment section — Reviews (paw rating + optional text) + Advice (Q&A). Replaces the
// old "Message owner" / "Open trip group" placeholder buttons (§14 zadanie 2026-07-23 — "komentová
// sekcia namiesto trip-group chatu"). Isolated component, mounted in PackMap trip detail panel.
// Same visual language as messaging (Inbox.tsx/Thread.tsx) — gold accents,
// papyrus-on-dark. Mock data = deterministic per tripId (mulberry32 + FNV-1a hash, same pattern as
// packCommunity.ts) — no Math.random, so counts/content stay stable across renders.
//
// §15 zadanie 2026-07-23: pagination (5/page, "‹ 1/N ›") + "my review"/"my question" write flow.
// Both persist to localStorage (dogypt.tripReviews.v1 / dogypt.tripQuestions.v1) — no Supabase yet,
// same pattern as packCommunity.ts sessionStorage mirrors. Reviewing is gated on `walked` (passed
// down from PackMap's existing walkedIds state) — see PawReviewPopup below.
import { useEffect, useMemo, useState } from 'react';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { MOCK_MEMBER_POOL, type MockMember } from '@/components/pack/packCommunity';

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
.tcm-like{display:inline-flex;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:2px 4px;color:${T.onDarkDim};font-size:11px;font-family:inherit;}
.tcm-like:hover{color:${T.onDark};}
.tcm-like.on{color:#E0796D;}

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
`;

// ── deterministický PRNG z tripId (mulberry32 + FNV-1a hash) — rovnaký vzor ako
// packCommunity.ts/PackMap.tsx tripOwnerMember(). Mock reviews/advice musia byť stabilné
// medzi rendermi, žiadny Math.random. ──
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// realistický rozptyl labkového skóre — väčšina 4-5, zopár nižšie.
const RATING_POOL = [5, 5, 5, 5, 4, 4, 4, 4, 4, 3, 3, 2, 1];

const REVIEW_TEXT_POOL = [
  'Loved every minute of this one — dog was exhausted in the best way.',
  'Steep in parts but so worth the view at the top.',
  'Perfect pace for an older dog, plenty of shade breaks.',
  'We got soaked halfway through — bring a rain jacket.',
  'My dog found three streams to jump in. 10/10 trail.',
  'Quiet, barely any people. Great for a reactive dog.',
  'A bit too crowded on weekends for my taste.',
  'The last stretch nearly killed my legs, dog did not care one bit.',
  'Would do this again just for the smells my dog discovered.',
  'Well marked, easy to follow even with a young puppy.',
  'Bring extra water, no stream near the top this time of year.',
  'Beautiful views, tough climb — not for beginners or short legs.',
  'My old boy needed a few extra breaks but made it all the way.',
  'Ticks were bad this season, check your dog thoroughly after.',
  'Short and sweet, good first trail for a new pack.',
  'Ended up carrying my dog the last kilometer, still worth it.',
];

const ADVICE_TEXT_POOL = [
  'Is this trail okay for a dog with hip dysplasia?',
  'Bring a harness — some narrow ledges near the top.',
  'Anyone know if there is shade for the first hour?',
  'Parking fills up fast on weekends, go early.',
  'Found a great swimming spot halfway, worth the detour.',
  'Is it safe to let dogs off leash on this one?',
  'Watch for loose gravel on the way down.',
  'Best time to go is early morning before the heat hits.',
  'Are there any water sources along the way for the dogs?',
  'First time doing this with a puppy — any tips on pacing?',
];

interface MockReview { member: MockMember; rating: number; text: string | null; likes: number; }
interface MockAdvice { member: MockMember; text: string; }

function pickMember(rnd: () => number): MockMember {
  return MOCK_MEMBER_POOL[Math.floor(rnd() * MOCK_MEMBER_POOL.length)];
}

function buildReviews(tripId: string): MockReview[] {
  const countRnd = mulberry32(hashStr(`${tripId}:reviews-count`));
  const count = 15 + Math.floor(countRnd() * 8); // 15..22
  const rnd = mulberry32(hashStr(`${tripId}:reviews`));
  const out: MockReview[] = [];
  for (let i = 0; i < count; i++) {
    const member = pickMember(rnd);
    const rating = RATING_POOL[Math.floor(rnd() * RATING_POOL.length)];
    const hasText = rnd() < 0.55;
    const text = hasText ? REVIEW_TEXT_POOL[Math.floor(rnd() * REVIEW_TEXT_POOL.length)] : null;
    const likes = Math.floor(rnd() * 13); // 0..12, same deterministic PRNG as rating/text
    out.push({ member, rating, text, likes });
  }
  return out;
}

function buildAdvice(tripId: string): MockAdvice[] {
  const countRnd = mulberry32(hashStr(`${tripId}:advice-count`));
  const count = 3 + Math.floor(countRnd() * 4); // 3..6
  const rnd = mulberry32(hashStr(`${tripId}:advice`));
  const out: MockAdvice[] = [];
  for (let i = 0; i < count; i++) {
    const member = pickMember(rnd);
    const text = ADVICE_TEXT_POOL[Math.floor(rnd() * ADVICE_TEXT_POOL.length)];
    out.push({ member, text });
  }
  return out;
}

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

// clickable heart on a review — liked state persisted in localStorage (see LIKES_KEY below).
// tint flips gold-dim → danger(red) on like, same convention as a "favourited" heart elsewhere.
function LikeButton({ liked, count, onClick }: { liked: boolean; count: number; onClick: () => void }) {
  return (
    <button type="button" className={`tcm-like${liked ? ' on' : ''}`} onClick={onClick} aria-label={liked ? 'Unlike review' : 'Like review'}>
      <BrandIcon name="heart" size={13} tint={liked ? 'danger' : 'dim'} />
      <span>{count}</span>
    </button>
  );
}

// ── review likes persistence (localStorage) — flat set of `${tripId}#${reviewKey}` strings,
// same pattern as myReviews/myQuestions below (no Supabase yet). ──
const LIKES_KEY = 'dogypt.tripReviewLikes.v1';
function readLikedKeys(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || '[]') as string[]); } catch { return new Set(); }
}
function writeLikedKeys(s: Set<string>) {
  try { localStorage.setItem(LIKES_KEY, JSON.stringify([...s])); } catch { /* best-effort */ }
}

// ── my review persistence (localStorage — no Supabase yet, same pattern as packCommunity.ts
// sessionStorage mirrors, just a different storage since it must survive across the whole
// browser, not just a tab session). ──
export interface MyReview { paws: number; text?: string; updatedAt: string; }
type MyReviewsMap = Record<string, MyReview>;
const REVIEWS_KEY = 'dogypt.tripReviews.v1';
function readMyReviews(): MyReviewsMap {
  try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}') as MyReviewsMap; } catch { return {}; }
}
function writeMyReviews(m: MyReviewsMap) {
  try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(m)); } catch { /* best-effort */ }
}

// ── my questions persistence ──
export interface MyQuestion { id: string; text: string; createdAt: string; }
type MyQuestionsMap = Record<string, MyQuestion[]>;
const QUESTIONS_KEY = 'dogypt.tripQuestions.v1';
function readMyQuestions(): MyQuestionsMap {
  try { return JSON.parse(localStorage.getItem(QUESTIONS_KEY) || '{}') as MyQuestionsMap; } catch { return {}; }
}
function writeMyQuestions(m: MyQuestionsMap) {
  try { localStorage.setItem(QUESTIONS_KEY, JSON.stringify(m)); } catch { /* best-effort */ }
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
function ReviewPopup({ trailName, initial, onSubmit, onDelete, onClose }: {
  trailName: string; initial?: MyReview | null; onSubmit: (v: { paws: number; text?: string }) => void; onDelete?: () => void; onClose: () => void;
}) {
  const [paws, setPaws] = useState(initial?.paws ?? 0);
  const [text, setText] = useState(initial?.text ?? '');
  const canSubmit = paws > 0;
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
          {initial ? 'Update review' : 'Post review'}
        </button>
        {initial && onDelete && (
          <button type="button" className="tcm-deletebtn" onClick={onDelete}>Delete review</button>
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

  const [myReviews, setMyReviews] = useState<MyReviewsMap>(() => readMyReviews());
  const [myQuestions, setMyQuestions] = useState<MyQuestionsMap>(() => readMyQuestions());
  const [reviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [askText, setAskText] = useState('');
  const [likedKeys, setLikedKeys] = useState<Set<string>>(() => readLikedKeys());

  const toggleLike = (key: string) => {
    setLikedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      writeLikedKeys(next);
      return next;
    });
  };

  const myReview = myReviews[tripId] ?? null;
  const myQuestionsForTrip = myQuestions[tripId] ?? [];

  const mockReviews = useMemo(() => buildReviews(tripId), [tripId]);
  const mockAdvice = useMemo(() => buildAdvice(tripId), [tripId]);

  const reviewCount = mockReviews.length + (myReview ? 1 : 0);
  const adviceCount = mockAdvice.length + myQuestionsForTrip.length;

  const reviewPages = Math.max(1, Math.ceil(reviewCount / PAGE_SIZE));
  const advicePages = Math.max(1, Math.ceil(adviceCount / PAGE_SIZE));

  // clamp page if list shrinks (e.g. deleting my own review/question mid-page)
  useEffect(() => { if (page > reviewPages) setPage(reviewPages); }, [reviewPages, page]);
  useEffect(() => { if (page > advicePages) setPage(advicePages); }, [advicePages, page]);

  const saveReview = (v: { paws: number; text?: string }) => {
    const next: MyReviewsMap = { ...myReviews, [tripId]: { paws: v.paws, text: v.text, updatedAt: new Date().toISOString() } };
    setMyReviews(next);
    writeMyReviews(next);
    onMarkWalked?.(); // reviewing implies (and guarantees) the trip is marked walked
    setReviewPopupOpen(false);
  };
  const deleteReview = () => {
    const next = { ...myReviews };
    delete next[tripId];
    setMyReviews(next);
    writeMyReviews(next);
    setReviewPopupOpen(false);
  };

  const postQuestion = () => {
    const text = askText.trim();
    if (!text) return;
    const q: MyQuestion = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text, createdAt: new Date().toISOString() };
    const next: MyQuestionsMap = { ...myQuestions, [tripId]: [q, ...myQuestionsForTrip] };
    setMyQuestions(next);
    writeMyQuestions(next);
    setAskText('');
  };
  const deleteQuestion = (id: string) => {
    const next: MyQuestionsMap = { ...myQuestions, [tripId]: myQuestionsForTrip.filter((q) => q.id !== id) };
    setMyQuestions(next);
    writeMyQuestions(next);
  };

  // reviews page slice — my review (if any) always pinned first, so it's on page 1.
  const reviewStart = (page - 1) * PAGE_SIZE;
  const reviewSliceMine = myReview && reviewStart === 0; // only page 1 shows "mine"
  const reviewMockOffset = myReview ? Math.max(0, reviewStart - 1) : reviewStart;
  const reviewMockTake = PAGE_SIZE - (reviewSliceMine ? 1 : 0);
  const reviewMockSlice = mockReviews.slice(reviewMockOffset, reviewMockOffset + reviewMockTake);

  // advice page slice — my questions (newest first) pinned above mock advice.
  const adviceStart = (page - 1) * PAGE_SIZE;
  const mineTake = Math.max(0, Math.min(myQuestionsForTrip.length - adviceStart, PAGE_SIZE));
  const mineSlice = mineTake > 0 ? myQuestionsForTrip.slice(adviceStart, adviceStart + mineTake) : [];
  const mockOffset = Math.max(0, adviceStart - myQuestionsForTrip.length);
  const mockTake = PAGE_SIZE - mineSlice.length;
  const mockSlice = mockTake > 0 ? mockAdvice.slice(mockOffset, mockOffset + mockTake) : [];

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

            {reviewCount === 0 && <div className="tcm-empty">No reviews yet. Be the first to rate this trip.</div>}

            {reviewsOpen && (
              <>
                {reviewSliceMine && myReview && (
                  <div className="tcm-review mine" onClick={() => setReviewPopupOpen(true)}>
                    <span className="tcm-avatar"><BrandIcon name="paw" size={16} tint="dark" /></span>
                    <div className="tcm-review-main">
                      <div className="tcm-review-top">
                        <span className="tcm-review-name">You</span>
                        <span className="tcm-review-badge">Your review</span>
                      </div>
                      <Paws rating={myReview.paws} />
                      {myReview.text && <div className="tcm-review-text">{myReview.text}</div>}
                    </div>
                  </div>
                )}

                {reviewMockSlice.map((r, i) => {
                  const key = `${tripId}#${reviewMockOffset + i}`;
                  const liked = likedKeys.has(key);
                  return (
                    <div className="tcm-review" key={`${r.member.id}-${reviewMockOffset + i}`}>
                      <span className="tcm-avatar">{r.member.name.charAt(0).toUpperCase()}</span>
                      <div className="tcm-review-main">
                        <div className="tcm-review-top">
                          <span className="tcm-review-name">{r.member.name}</span>
                          <span className="tcm-review-pack">· Dogyptian #{r.member.packNumber}</span>
                        </div>
                        <Paws rating={r.rating} />
                        {r.text && <div className="tcm-review-text">{r.text}</div>}
                        <div className="tcm-review-footer">
                          <LikeButton liked={liked} count={r.likes + (liked ? 1 : 0)} onClick={() => toggleLike(key)} />
                        </div>
                      </div>
                    </div>
                  );
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
                <button type="button" className="tcm-postbtn" disabled={!askText.trim()} onClick={postQuestion}>Post</button>
              </div>
            </div>

            {mineSlice.map((q) => (
              <div className="tcm-advice mine" key={q.id}>
                <div className="tcm-advice-text">{q.text}</div>
                <div className="tcm-advice-meta">
                  <span>You</span>
                  <button type="button" className="tcm-advice-del" onClick={() => deleteQuestion(q.id)} aria-label="Delete question">✕</button>
                </div>
              </div>
            ))}

            {adviceCount === 0 ? (
              <div className="tcm-empty">No advice yet. Ask the pack something.</div>
            ) : (
              mockSlice.map((a, i) => (
                <div className="tcm-advice" key={`${a.member.id}-${mockOffset + i}`}>
                  <div className="tcm-advice-text">{a.text}</div>
                  <div className="tcm-advice-meta">
                    <span>{a.member.name} · Dogyptian #{a.member.packNumber}</span>
                  </div>
                </div>
              ))
            )}
            <Pager page={page} totalPages={advicePages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(advicePages, p + 1))} />
          </>
        )}
      </div>

      {reviewPopupOpen && (
        <ReviewPopup
          trailName={tripName ?? 'this trip'}
          initial={myReview}
          onSubmit={saveReview}
          onDelete={myReview ? deleteReview : undefined}
          onClose={() => setReviewPopupOpen(false)}
        />
      )}
    </div>
  );
}
