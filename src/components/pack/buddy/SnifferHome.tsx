// SNIFFER — domov zapnutého človeka: záložky SNIFFUJ · HĽADAŤ · ZHODY.
// Zadanie: plany/zadanie-sniffer-stavba-2026-09-26.md §2.1 (SNIFFUJ), §2.6 (ZHODY) · nákres obrazovka C.
//
// · Záložky sú KLIKATEĽNÉ (Matej 25. 9.: „neviem prepnúť chipy hore") a žijú v ADRESE
//   (`?tab=`), aby späť v prehliadači vrátilo záložku a nie celú stránku.
// · Tlačidlá: ✕ nie · 💬 napísať · SNIFF áno (Matej 25. 9.: nos, nie fajka; šípka hore ZRUŠENÁ;
//   neskôr: „nie NOS ale SNIFF" a kotúč ZELENÝ ako krok 3 úvodu, nie lapis).
// · 💬 = áno + pripnutá správa, ktorá odíde AŽ PRI ZHODE (Matej 25. 9.). Bez zhody nič.
// · Swipe gestom aj tlačidlami. Prázdny balíček hovorí AINUBIS.
// · Zhoda = animované odhalenie `SnifferMatchReveal` (§2.6 D), nie to isté logo ako úvod.
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { emitOpenThread } from '@/components/pack/messaging/openBridge';
import { bgImg } from '@/services/cloudinaryService';
import { useLang } from '@/i18n/LanguageContext';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, PACK_AVATAR,
  VEIL_CSS, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { SnifferCard, SNIFFER_CARD_CSS } from './SnifferCard';
import { SnifferSearch } from './SnifferSearch';
import { SnifferEmpty, SNIFFER_EMPTY_CSS } from './SnifferEmpty';
import { SnifferMatchReveal } from './SnifferMatchReveal';
import { SnifferFullProfile } from './SnifferFullProfile';
import { loadDeck, loadMatches, swipe, unmatch, type SnifferCardData, type SnifferMatch } from './snifferDeck';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;
type Tab = 'deck' | 'search' | 'matches';
const TABS: Array<[Tab, string]> = [['deck', 'Sniff'], ['search', 'Search'], ['matches', 'Matches']];

/** O koľko px treba kartu odtiahnuť, aby to bolo rozhodnutie a nie zaváhanie. */
const SWIPE_PX = 96;
const OUT_MS = 320;
/** Keď v balíčku ostanú dve karty, dotiahne sa ďalšia dávka. */
const REFILL_AT = 2;
/** B9 (audit-sniffer-2026-09-26): kým sa ťah nestane skutočným ťahom, karta si NECHÁVA pointer
 *  nezachytený — inak by natívny tap na fotke (`.sn-tap` v `SnifferCard.tsx`) nikdy nedostal
 *  svoj vlastný `pointerup` (capture by ho presmeroval na tento obal skôr, než sa vôbec pohol). */
const DRAG_CATCH_PX = 6;

// Zmenšenie ZA uložený výrez (withTransform výrez preskočí a pošle plné rozlíšenie) — audit 26. 9.
const pic = (u?: string | null) => bgImg(u, PACK_AVATAR.md, PACK_AVATAR.md);

const CSS = `
/* Horný prepínač výraznejší, aktívna záložka v PLNOM lapise (Matej 25. 9.). */
.sh-tabs{display:flex;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.xs}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.border};background:${T.cardSoft};box-shadow:${PACK_SHADOW.card};}
.sh-tabs button{flex:1 1 0;padding:${PACK_SPACE.md}px ${PACK_SPACE.sm}px;border:1px solid transparent;border-radius:${PACK_R.pill}px;background:transparent;cursor:pointer;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};transition:background .2s ease,color .2s ease;}
.sh-tabs button:hover{color:${LAPIS.edge};}
.sh-tabs button.is-on{background:${LAPIS.grad};border-color:${LAPIS.deep};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};}
.sh-pane{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.sh-pane--scroll{overflow-y:auto;margin:0 -${PACK_SPACE.xs}px;padding:0 ${PACK_SPACE.xs}px;}
.sh-deck{position:relative;flex:1 1 auto;min-height:360px;width:100%;max-width:440px;margin:0 auto;}
.sh-mover{position:absolute;inset:0;}
.sh-mover.is-anim{transition:transform .32s ease, opacity .32s ease;}
.sh-acts{display:flex;justify-content:center;align-items:flex-start;gap:${PACK_SPACE.xl}px;}
/* Plávajúci AINUBIS sedí vpravo dole — na úzkom mobile by rad pri medzere 24 px zasiahol
   pod neho popisok ÁNO. Rad sa preto zúži, AINUBIS sa neposúva. */
@media (max-width:419px){.sh-acts{gap:${PACK_SPACE.lg}px;}}
.sh-act{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.xs}px;font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;
  letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.sh-btn{width:${PACK_AVATAR.lg}px;height:${PACK_AVATAR.lg}px;border-radius:${PACK_R.pill}px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;border:1px solid ${T.border};background:${T.cardSoft};box-shadow:${PACK_SHADOW.panel};transition:transform .12s ease;}
.sh-btn:active{transform:scale(.94);}
.sh-btn:disabled{opacity:.45;cursor:default;}
.sh-btn--msg{width:${PACK_AVATAR.md}px;height:${PACK_AVATAR.md}px;margin-top:${PACK_SPACE.sm}px;}
.sh-btn--yes{border-color:${T.growGreen};background:linear-gradient(135deg, #4E9A63, ${T.growGreen});box-shadow:${PACK_SHADOW.panel};}
/* ODPOVEĎ NA ŤUK — tlačidlo pruží a karta nesie pečiatku SNIFF / NIE (Matej 25. 9.: „animácie pri
   ok a no… aj na mobile aj PC"). Pečiatka rastie s ťahom, pri ťuku je hneď celá. */
.sh-btn.is-hit{animation:sh-hit .36s ease;}
@keyframes sh-hit{0%{transform:scale(1);}35%{transform:scale(1.22);}100%{transform:scale(1);}}
.sh-stamp{position:absolute;top:${PACK_SPACE.xxxl}px;z-index:4;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border:3px solid currentColor;border-radius:${PACK_R.field}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;letter-spacing:.14em;text-transform:uppercase;pointer-events:none;background:rgba(0,0,0,.25);}
.sh-stamp--yes{left:${PACK_SPACE.lg}px;color:#7BD88F;transform:rotate(-14deg);}
.sh-stamp--no{right:${PACK_SPACE.lg}px;color:#FF7A6B;transform:rotate(14deg);}
/* Celý profil odletí tým istým smerom ako karta. */
.sh-peek{width:100%;height:100%;display:flex;justify-content:center;align-items:center;transition:transform .36s ease, opacity .36s ease;}
.sh-peek.is-like{transform:translateX(110vw) rotate(10deg);opacity:0;}
.sh-peek.is-pass{transform:translateX(-110vw) rotate(-10deg);opacity:0;}
/* PRÁZDNY BALÍČEK — spoločný blok SnifferEmpty.tsx (aj HĽADAŤ). */
.sh-ico{display:block;background:currentColor;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;}
.sh-empty{margin:auto 0;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.sh-ghost{align-self:center;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;border:1px solid ${T.border};background:${T.cardSoft};
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};cursor:pointer;}
/* E3 (audit-sniffer-2026-09-26, „Duplicity"): .sh-cta bolo doslovné dvojča .bd-cta
   z PackBuddy.tsx — tá istá karta Shell ho vždy vykreslí spolu s týmto panelom, takže
   trieda je vždy po ruke. Tlačidlá nižšie preto berú .bd-cta, druhá definícia zbytočná. */
.sh-sheet{width:100%;max-width:420px;padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.sh-sheet h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.sh-note{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.sh-area{width:100%;min-height:96px;resize:vertical;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.sh-ghost--dark{background:transparent;color:${LAPIS.ink};}
/* ZHODY — riadky */
.sh-list{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sh-row{display:flex;align-items:center;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;}
.sh-row img{width:${PACK_AVATAR.md}px;height:${PACK_AVATAR.md}px;border-radius:${PACK_R.pill}px;object-fit:cover;flex:0 0 auto;}
.sh-row__txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;font-family:${FONT_UI};}
.sh-row__txt b{font-weight:600;font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.sh-row__txt small{font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.sh-new{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;color:${T.card};background:${T.growGreen};
  border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;}
.sh-mini{border:0;background:none;cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkWarm};text-decoration:underline;}
/* B2/B3 (audit-sniffer-2026-09-26): jeden pás NAD záložkami — vidno ho z HĽADAŤ aj ZHÔD,
   nielen z balíčka, a zostáva, kým fetchDeck v pozadí nezmaže presne TÚTO chybu. */
.sh-errbar{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${PICK_INK.red};color:${PICK_INK.red};font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;}
.sh-errbar button{flex:0 0 auto;border:0;background:none;cursor:pointer;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;
  color:inherit;text-decoration:underline;}
/* Kostra namiesto prázdnej plochy, kým sa balíček/zhody prvýkrát načítavajú. */
.sh-skel-card{position:absolute;inset:0;border-radius:${PACK_R.card}px;background:${T.tileBg};overflow:hidden;}
.sh-skel-row{height:${PACK_AVATAR.md}px;border-radius:${PACK_R.tile}px;background:${T.tileBg};position:relative;overflow:hidden;}
.sh-skel-card::after,.sh-skel-row::after{content:'';position:absolute;inset:0;
  background:linear-gradient(100deg, transparent 20%, rgba(255,255,255,.16) 50%, transparent 80%);animation:sh-shimmer 1.4s ease-in-out infinite;}
@keyframes sh-shimmer{from{transform:translateX(-100%);}to{transform:translateX(100%);}}
@media (prefers-reduced-motion: reduce){.sh-skel-card::after,.sh-skel-row::after{animation:none;}}
`;

function MaskIcon({ src, size, color }: { src: string; size: number; color: string }) {
  return <span className="sh-ico" aria-hidden style={{ width: size, height: size, color, ['--m' as string]: `url(${src})` }} />;
}

/** Zhody videné naposledy — len pohodlie tohto prehliadača (štítok NOVÁ). */
const SEEN_KEY = 'dogypt_sniffer_matches_seen';
const readSeen = (): number => { try { return Number(localStorage.getItem(SEEN_KEY)) || 0; } catch { return 0; } };
const writeSeen = (t: number) => { try { localStorage.setItem(SEEN_KEY, String(t)); } catch { /* bez úložiska nič */ } };

/** B2/B3 (audit-sniffer-2026-09-26): tri zdroje chyby, JEDEN pás nad záložkami. `swipe` sa
 *  vypisuje len raz — kým sa neprekryje ďalšou (nová chyba, ručné „Skúsiť znova"). */
type SnErrKind = 'deck' | 'swipe' | 'matches';
const ERR_FALLBACK: Record<SnErrKind, string> = {
  deck: 'Couldn’t load the pack. Try again.',
  swipe: 'Couldn’t save your answer — the card is back on top. Try again.',
  matches: 'Couldn’t load matches. Try again.',
};

export function SnifferHome({ tx, me }: {
  tx: Tx;
  me: { photo: string | null; name: string; dogName: string | null };
}) {
  const [params, setParams] = useSearchParams();
  const { lang } = useLang();
  const tab: Tab = (['deck', 'search', 'matches'] as const).find((t) => t === params.get('tab')) ?? 'deck';
  const setTab = (t: Tab) => setParams((p) => { const n = new URLSearchParams(p); if (t === 'deck') n.delete('tab'); else n.set('tab', t); return n; });

  // ── balíček ────────────────────────────────────────────────────────────────
  const [deck, setDeck] = useState<SnifferCardData[] | null>(null);
  const [errKind, setErrKind] = useState<SnErrKind | null>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number; anim: boolean } | null>(null);
  const [composer, setComposer] = useState<{ card: SnifferCardData; send: (msg: string) => void } | null>(null);
  /** CELÝ PROFIL (kolo 2 §6.2) — z karty v balíčku aj z HĽADAŤ, tie isté tri tlačidlá. */
  const [peek, setPeek] = useState<SnifferCardData | null>(null);
  const [draft, setDraft] = useState('');
  const [match, setMatch] = useState<{ card: SnifferCardData; conv: string | null } | null>(null);
  const [hit, setHit] = useState<'like' | 'pass' | null>(null);
  const [leaving, setLeaving] = useState<'like' | 'pass' | null>(null);
  /** B8 (Matej 26. 9.: „áno" — zrušenie zavrie aj vlákno) — potvrdenie v PANELI, nie `window.confirm`. */
  const [confirmUnmatch, setConfirmUnmatch] = useState<SnifferMatch | null>(null);
  const [unmatching, setUnmatching] = useState(false);
  const busy = useRef(false);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  /** B9: capture sa nasadí AŽ pri skutočnom ťahu (`onMove`), nie hneď pri stlačení — inak by
   *  natívny tap na `.sn-tap` (SnifferCard.tsx) nikdy nedostal svoj vlastný `pointerup`. */
  const dragCaptured = useRef(false);
  /** B6: čo raz odišlo na server, sa do balíčka nevráti — ani z pomalšej/súbežnej dávky. */
  const sentRef = useRef<Set<number>>(new Set());
  /** E3: fetchDeck len jeden beh naraz (rýchle swipy pri REFILL_AT vedeli spustiť viac naraz). */
  const fetchInFlight = useRef(false);
  /** E3: časovače v refe + upratanie v cleanupe; `liveRef` zastaví oneskorený `setState`
   *  po odchode z obrazovky (async pokračovanie `decide`/`act`/`fetchDeck`). */
  const hitTimer = useRef<number | null>(null);
  const outTimer = useRef<number | null>(null);
  const liveRef = useRef(true);
  useEffect(() => () => {
    liveRef.current = false;
    if (hitTimer.current) window.clearTimeout(hitTimer.current);
    if (outTimer.current) window.clearTimeout(outTimer.current);
  }, []);

  const pulse = (v: 'like' | 'pass') => {
    setHit(v);
    if (hitTimer.current) window.clearTimeout(hitTimer.current);
    hitTimer.current = window.setTimeout(() => { if (liveRef.current) setHit(null); }, 380);
  };

  const fetchDeck = useCallback(async () => {
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;
    try {
      const fresh = await loadDeck(20);
      if (!liveRef.current) return;
      // Úspech maže LEN vlastnú chybu balíčka — nesmie prekryť zrozumiteľnú hlášku
      // o zlyhanom SNIFFe/NIE, ktorú si človek ešte neprečítal (B2).
      setErrKind((k) => (k === 'deck' ? null : k));
      setDeck((cur) => {
        const have = new Set((cur ?? []).map((c) => c.member));
        return [...(cur ?? []), ...fresh.filter((c) => !have.has(c.member) && !sentRef.current.has(c.member))];
      });
    } catch {
      if (!liveRef.current) return;
      setErrKind('deck');
      setDeck((cur) => cur ?? []);
    } finally {
      fetchInFlight.current = false;
    }
  }, []);

  useEffect(() => { void fetchDeck(); }, [fetchDeck]);

  const top = deck?.[0] ?? null;

  const decide = async (verdict: 'like' | 'pass', message?: string) => {
    if (!top || busy.current) return;
    busy.current = true;
    pulse(verdict);
    const card = top;
    sentRef.current.add(card.member);
    const dir = verdict === 'like' ? 1 : -1;
    setDrag({ dx: dir * window.innerWidth, dy: 0, anim: true });
    const req = swipe(card.member, verdict, message);
    if (outTimer.current) window.clearTimeout(outTimer.current);
    outTimer.current = window.setTimeout(async () => {
      if (!liveRef.current) return;
      setDeck((cur) => (cur ?? []).slice(1));
      setDrag(null);
      busy.current = false;
      try {
        const r = await req;
        if (!liveRef.current) return;
        setErrKind((k) => (k === 'swipe' ? null : k));
        if (r.match) setMatch({ card, conv: r.conv });
      } catch {
        // B2 (audit-sniffer-2026-09-26): zlyhaný SNIFF/NIE sa už NETVÁRI ako uložený — karta
        // sa vráti na vrch balíčka a chyba ostane vidno, kým ju človek sám nezavrie/neskúsi znova.
        if (!liveRef.current) return;
        sentRef.current.delete(card.member);
        setErrKind('swipe');
        setDeck((cur) => [card, ...(cur ?? [])]);
      }
    }, OUT_MS);
  };

  /** Rozhodnutie z CELÉHO PROFILU — bez odletu karty, ten istý server + ten istý `busy`
   *  ref ako `decide` (dvojklik). */
  const act = async (card: SnifferCardData, verdict: 'like' | 'pass', message?: string) => {
    if (busy.current) return;
    busy.current = true;
    sentRef.current.add(card.member);
    // Celý profil najprv odletí (tým istým smerom ako karta), až potom sa zavrie.
    setLeaving(verdict);
    await new Promise((r) => window.setTimeout(r, 360));
    if (!liveRef.current) return;
    setLeaving(null);
    setPeek(null);
    try {
      const r = await swipe(card.member, verdict, message);
      if (!liveRef.current) return;
      setErrKind((k) => (k === 'swipe' ? null : k));
      setDeck((cur) => (cur ?? []).filter((c) => c.member !== card.member));
      if (r.match) setMatch({ card, conv: r.conv });
    } catch {
      if (!liveRef.current) return;
      sentRef.current.delete(card.member);
      setErrKind('swipe');
    } finally {
      busy.current = false;
    }
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busy.current) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    dragCaptured.current = false;
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!start.current || start.current.id !== e.pointerId) return;
    if (!dragCaptured.current && Math.abs(e.clientX - start.current.x) > DRAG_CATCH_PX) {
      dragCaptured.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setDrag({ dx: e.clientX - start.current.x, dy: (e.clientY - start.current.y) * 0.3, anim: false });
  };
  const onUp = () => {
    if (!start.current) return;
    start.current = null;
    dragCaptured.current = false;
    const dx = drag?.dx ?? 0;
    if (dx > SWIPE_PX) void decide('like');
    else if (dx < -SWIPE_PX) void decide('pass');
    else setDrag(drag ? { dx: 0, dy: 0, anim: true } : null);
  };

  // ── zhody ──────────────────────────────────────────────────────────────────
  const [matches, setMatches] = useState<SnifferMatch[] | null>(null);
  const [seenAt] = useState(readSeen);
  const fetchMatches = useCallback(async () => {
    try {
      const m = await loadMatches();
      if (!liveRef.current) return;
      setMatches(m);
      writeSeen(Date.now());
      setErrKind((k) => (k === 'matches' ? null : k));
    } catch {
      if (!liveRef.current) return;
      setErrKind('matches');
    }
  }, []);
  useEffect(() => {
    if (tab !== 'matches') return;
    void fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `match` je zámerný spúšťač (nová zhoda dobehne zoznam)
  }, [tab, match, fetchMatches]);

  const doUnmatch = async (m: SnifferMatch) => {
    if (unmatching) return;
    setUnmatching(true);
    try {
      await unmatch(m.card.member);
      if (!liveRef.current) return;
      setMatches((cur) => (cur ?? []).filter((x) => x.card.member !== m.card.member));
      setConfirmUnmatch(null);
      setErrKind((k) => (k === 'matches' ? null : k));
    } catch {
      if (!liveRef.current) return;
      setErrKind('matches');
    } finally {
      if (liveRef.current) setUnmatching(false);
    }
  };

  const retry = () => {
    if (errKind === 'deck') { setErrKind(null); void fetchDeck(); }
    else if (errKind === 'matches') { setErrKind(null); void fetchMatches(); }
    else setErrKind(null);
  };

  // B10 (lock brand.md §147): Esc zatvára panely od najvrchnejšieho; ←/→ swipuje balíček,
  // len keď nie je otvorený žiadny panel a fokus nie je vo formulárovom poli.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmUnmatch) { setConfirmUnmatch(null); return; }
        if (composer) { setComposer(null); return; }
        if (match) { setMatch(null); return; }
        if (peek) { setPeek(null); return; }
        return;
      }
      if (confirmUnmatch || composer || match || peek || tab !== 'deck') return;
      const el = document.activeElement as HTMLElement | null;
      if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      if (e.key === 'ArrowRight') void decide('like');
      else if (e.key === 'ArrowLeft') void decide('pass');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `decide` sa prerába každý render, netreba reštart efektu kvôli nej
  }, [confirmUnmatch, composer, match, peek, tab]);

  const ago = (iso: string) => {
    const h = Math.round((Date.now() - new Date(iso).getTime()) / 36e5);
    if (h < 1) return tx('pack.sniffer.justNow', 'just now');
    if (h < 24) return tx('pack.sniffer.hoursAgo', '{n} h ago', { n: h });
    const d = Math.round(h / 24);
    return d === 1 ? tx('pack.sniffer.yesterday', 'yesterday') : new Date(iso).toLocaleDateString(lang);
  };

  const dragStyle = drag
    ? {
        transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx / 20}deg)`,
        opacity: Math.abs(drag.dx) >= window.innerWidth ? 0 : 1,
      }
    : undefined;

  return (
    <>
      <style>{SNIFFER_CARD_CSS}</style>
      <style>{VEIL_CSS}</style>
      <style>{SNIFFER_EMPTY_CSS}</style>
      <style>{CSS}</style>
      {/* B2/B3: nad záložkami — viditeľné z HĽADAŤ aj ZHÔD, nielen z balíčka. */}
      {errKind && (
        <div className="sh-errbar" role="alert">
          <span>{tx(`pack.sniffer.err.${errKind}`, ERR_FALLBACK[errKind])}</span>
          <button type="button" onClick={retry}>{tx('pack.sniffer.err.retry', 'Try again')}</button>
        </div>
      )}
      <div className="sh-tabs" role="tablist">
        {TABS.map(([k, en]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''}
            onClick={() => setTab(k)}>{tx(`pack.buddy.tab.${k}`, en)}</button>
        ))}
      </div>

      {tab === 'deck' && (
        <div className="sh-pane">
          {deck === null ? (
            <div className="sh-deck" aria-hidden><div className="sh-skel-card" /></div>
          ) : top ? (
            <>
              <div className="sh-deck">
                {deck[1] && <SnifferCard key={deck[1].member} card={deck[1]} tx={tx} back />}
                <div key={top.member} className="sn-card-wrap" style={{ position: 'absolute', inset: 0 }}
                  onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
                  {/* Pečiatka jazdí S KARTOU (25. 9. kolo 6): dovtedy bola súrodencom pohyblivej karty
                      a ostávala na mieste, takže pri ťahu sedela na ZADNEJ karte. Posúva sa celá vrstva. */}
                  <div className={`sh-mover${drag?.anim ? ' is-anim' : ''}`} style={dragStyle}>
                    <SnifferCard card={top} tx={tx} onOpenFull={() => setPeek(top)} />
                    {drag && Math.abs(drag.dx) > 12 && (
                      <span className={`sh-stamp sh-stamp--${drag.dx > 0 ? 'yes' : 'no'}`}
                        style={{ opacity: Math.min(1, Math.abs(drag.dx) / SWIPE_PX) }}>
                        {drag.dx > 0 ? tx('pack.sniffer.yes', 'SNIFF') : tx('pack.sniffer.no', 'No')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="sh-acts">
                <div className="sh-act">
                  <button type="button" className={`sh-btn${hit === 'pass' ? ' is-hit' : ''}`} aria-label={tx('pack.sniffer.no', 'No')} onClick={() => void decide('pass')}>
                    <MaskIcon src="/icons/pack/cross.svg" size={26} color={T.alertRed} />
                  </button>
                  {tx('pack.sniffer.no', 'No')}
                </div>
                <div className="sh-act">
                  <button type="button" className="sh-btn sh-btn--msg" aria-label={tx('pack.sniffer.write', 'Write')}
                    onClick={() => { setDraft(''); setComposer({ card: top, send: (m) => void decide('like', m) }); }}>
                    <MaskIcon src="/icons/pack/chat.svg" size={22} color={LAPIS.edge} />
                  </button>
                  {tx('pack.sniffer.write', 'Write')}
                </div>
                <div className="sh-act">
                  <button type="button" className={`sh-btn sh-btn--yes${hit === 'like' ? ' is-hit' : ''}`} aria-label={tx('pack.sniffer.yes', 'SNIFF')} onClick={() => void decide('like')}>
                    <MaskIcon src="/icons/pack/nose.svg" size={30} color="#fff" />
                  </button>
                  {tx('pack.sniffer.yes', 'Yes')}
                </div>
              </div>
            </>
          ) : (
            <SnifferEmpty tx={tx} />
          )}
        </div>
      )}

      {tab === 'search' && (
        <div className="sh-pane sh-pane--scroll">
          <SnifferSearch tx={tx} onOpen={setPeek} />
        </div>
      )}

      {tab === 'matches' && (
        <div className="sh-pane">
          {matches === null ? (
            <div className="sh-list" aria-hidden>
              {[0, 1, 2].map((i) => <div key={i} className="sh-skel-row" />)}
            </div>
          ) : matches.length > 0 ? (
            <div className="sh-list">
              {matches.map((m) => {
                const isNew = new Date(m.matchedAt).getTime() > seenAt;
                return (
                  <div key={m.card.member} className="sh-row" style={{ ...PACK_BOX.row }}>
                    <img src={pic(m.card.photos[0] ?? m.card.dogs[0]?.photo)} alt="" />
                    <span className="sh-row__txt">
                      <b>{[m.card.name, m.card.dogs[0]?.name].filter(Boolean).join(' + ')}</b>
                      <small>{tx('pack.sniffer.matchedWhen', 'You caught each other’s scent · {when}', { when: ago(m.matchedAt) })}</small>
                    </span>
                    {isNew && <span className="sh-new">{tx('pack.sniffer.new', 'NEW')}</span>}
                    {m.conv && (
                      <button type="button" className="sh-mini" onClick={() => emitOpenThread(m.conv!, { backCloses: true })}>{tx('pack.sniffer.write', 'Write')}</button>
                    )}
                    <button type="button" className="sh-mini" onClick={() => setConfirmUnmatch(m)}>{tx('pack.sniffer.unmatch', 'Cancel')}</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <SnifferEmpty tx={tx} line={tx('pack.sniffer.noMatches', 'No matches yet. A match is just a notice — whether you write is up to you.')} />
          )}
        </div>
      )}

      {/* B8: potvrdenie zrušenia zhody v PANELI (nie `window.confirm`) — zavrie aj vlákno (server). */}
      {confirmUnmatch && (
        <div className="pk-veil pk-veil--modal" onClick={() => setConfirmUnmatch(null)}>
          <div className="sh-sheet" style={{ ...PACK_BOX.panel }} role="dialog" aria-modal="true"
            aria-label={tx('pack.sniffer.unmatchConfirmTitle', 'Cancel this match?')} onClick={(e) => e.stopPropagation()}>
            <h3>{tx('pack.sniffer.unmatchConfirmTitle', 'Cancel this match?')}</h3>
            <p className="sh-note">{tx('pack.sniffer.unmatchConfirmNote', 'The thread closes for both of you and can’t be undone.')}</p>
            {errKind === 'matches' && (
              <p className="sh-note" style={{ color: PICK_INK.red }}>{tx('pack.sniffer.err.matches', ERR_FALLBACK.matches)}</p>
            )}
            <button type="button" className="bd-cta" disabled={unmatching} onClick={() => void doUnmatch(confirmUnmatch)}>
              {unmatching ? '…' : tx('pack.sniffer.unmatchConfirm', 'Yes, cancel')}
            </button>
            <button type="button" className="sh-ghost" onClick={() => setConfirmUnmatch(null)}>
              {tx('pack.sniffer.unmatchKeep', 'Keep it')}
            </button>
          </div>
        </div>
      )}

      {/* CELÝ PROFIL — nad závojom, s tými istými tlačidlami ako balíček */}
      {peek && (
        // Klik VEDĽA zavrie náhľad (Matej 25. 9.: „kliknutie vedľa nezruší náhľad"). Obal zaberá celú
        // plochu, takže sa zatvára podľa cieľa kliku: čokoľvek mimo kariet a tlačidiel.
        <div className="pk-veil pk-veil--modal" onClick={() => setPeek(null)}>
          <div className={`sh-peek${leaving ? ` is-${leaving}` : ''}`} role="dialog" aria-modal="true" aria-label={peek.name}
            onClick={(e) => { if ((e.target as HTMLElement).closest('.sfp-photo, .sfp-card, button, a, input, textarea')) e.stopPropagation(); }}>
            <SnifferFullProfile card={peek} tx={tx} actions={(
              <>
                <button type="button" className="sh-btn" aria-label={tx('pack.sniffer.no', 'No')} onClick={() => void act(peek, 'pass')}>
                  <MaskIcon src="/icons/pack/cross.svg" size={26} color={T.alertRed} />
                </button>
                <button type="button" className="sh-btn sh-btn--msg" aria-label={tx('pack.sniffer.write', 'Write')}
                  onClick={() => { const c = peek; setDraft(''); setPeek(null); setComposer({ card: c, send: (m) => void act(c, 'like', m) }); }}>
                  <MaskIcon src="/icons/pack/chat.svg" size={22} color={LAPIS.edge} />
                </button>
                <button type="button" className="sh-btn sh-btn--yes" aria-label={tx('pack.sniffer.yes', 'SNIFF')} onClick={() => void act(peek, 'like')}>
                  <MaskIcon src="/icons/pack/nose.svg" size={30} color="#fff" />
                </button>
              </>
            )} />
          </div>
        </div>
      )}

      {/* 💬 — áno s pripnutou správou */}
      {composer && (
        <div className="pk-veil pk-veil--modal" onClick={() => setComposer(null)}>
          <div className="sh-sheet" style={{ ...PACK_BOX.panel }} role="dialog" aria-modal="true"
            aria-label={tx('pack.sniffer.writeTo', 'Write to {name}', { name: composer.card.name })} onClick={(e) => e.stopPropagation()}>
            <h3>{tx('pack.sniffer.writeTo', 'Write to {name}', { name: composer.card.name })}</h3>
            <textarea className="pf-field sh-area" autoFocus maxLength={1000} value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder={tx('pack.sniffer.writePh', 'Hi! …')} />
            <p className="sh-note">{tx('pack.sniffer.writeNote', 'It counts as a yes. The message is delivered only when you catch each other’s scent.')}</p>
            <button type="button" className="bd-cta" disabled={!draft.trim()} onClick={() => {
              const msg = draft.trim();
              const send = composer.send;
              setComposer(null);
              send(msg);
            }}>{tx('pack.sniffer.sendYes', 'Yes + message')}</button>
          </div>
        </div>
      )}

      {/* ZHODA — oznam (animovaný reveal príde v §2.6 D) */}
      {/* ZHODA — animované odhalenie (§2.6 D) */}
      {match && (
        <div className="pk-veil pk-veil--modal" onClick={() => setMatch(null)}>
          <div role="dialog" aria-modal="true" aria-label={tx('pack.sniffer.matchTitle', 'You caught each other’s scent!')}
            onClick={(e) => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <SnifferMatchReveal
              me={me.photo}
              them={match.card.photos[0] ?? match.card.dogs[0]?.photo ?? null}
              title={tx('pack.sniffer.matchTitle', 'You caught each other’s scent!')}
              names={[
                tx('pack.sniffer.youAnd', 'You and {name}', { name: match.card.name }),
                [me.dogName, match.card.dogs[0]?.name].filter(Boolean).join(tx('pack.sniffer.and', ' and ')),
              ].filter(Boolean).join(' · ')}
            >
              {match.conv && (
                <button type="button" className="bd-cta" onClick={() => { const c = match.conv!; setMatch(null); emitOpenThread(c, { backCloses: true }); }}>
                  {tx('pack.sniffer.writeTo', 'Write to {name}', { name: match.card.name })}
                </button>
              )}
              <button type="button" className="sh-ghost sh-ghost--dark" onClick={() => setMatch(null)}>{tx('pack.sniffer.keepSniffing', 'Keep sniffing')}</button>
            </SnifferMatchReveal>
          </div>
        </div>
      )}
    </>
  );
}
