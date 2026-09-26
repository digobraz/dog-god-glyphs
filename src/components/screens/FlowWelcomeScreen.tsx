import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS } from '@/components/screens/flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS } from '@/components/screens/flowMedallion';
import { LetterReveal, REVEAL_S, LETTER_S, FLOW_INTRO_CSS } from '@/components/screens/flowIntro';
import { PACK_R } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { LAB } from '@/lib/labTheme';
import { hekthorFace } from '@/lib/hekthorFaces';
import { readSvorka } from '@/lib/flowSvorka';
import { readDevSeed } from '@/lib/devSeed';
import { EDGE_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';
import { fillUrl } from '@/services/cloudinaryService';
import { CertificateCard } from '@/components/CertificateCard';
import { buildHeroglyphCode } from '@/lib/heroglyphCode';
import { VerticalHeroglyphFrame } from '@/components/VerticalHeroglyphFrame';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { ShareCard } from '@/components/ShareCard';
import { usePostPaymentPipeline } from '@/hooks/usePostPaymentPipeline';

// ════════════════════════════════════════════════════════════════════════════
// FINÁLE PO PLATBE nového vstupu — `/heroglyph/welcome` (26. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Zadanie: `plany/zadanie-heroflow-po-platbe-2026-09-26/` (Matejov text
// doslova + nákres poradia). Jedna obrazovka, dve fázy ako ODHALENIE (krok 9):
//   1) HEKTOR — veľká bublina s fotkou: „Vitajte v DOGYPTE, <majiteľ> a <psi>!"
//   2) PORADIE — riadky predošlých psov vyrolujú hore a rozmažú sa, blok
//      nového psa (psov) zažiari, zapulzuje a zaradí sa; pod ním štyri vety
//      po jednej, progres k 1M a CTA NA STENU → reveal na stene (viac psov
//      postupne, `queue` v adrese — GodsGrid).
//
// 🔑 VETY SA VIAŽU NA SKUTOČNÝ POSTUP, nie na časovač: „profil" beží, kým
//    nepríde číslo psa, „certifikát", kým pipeline nevyrobí heroglyf (strop
//    8 s ako starý /welcome), až potom HOTOVO. Minimálne tempo drží čitateľnosť.
// 🔑 Starý tok ostáva na `/welcome` nedotknutý — sem vedie len platba svorky
//    (`create-checkout`, `isSvorka`).
// 🔑 V dielni (bez `session_id`) sa psi berú zo storu a čísla z dev seedu,
//    pipeline sa nespúšťa.
// ════════════════════════════════════════════════════════════════════════════

type NewDog = { id: string; name: string; photo: string; n: number | null; glyph: string };
type PrevDog = { n: number; name: string; photo: string };

/** Minimálny čas, kým sa ukáže ďalšia veta (ms). */
const LINE_MIN = 1400;

function useWelcomeData(sessionId: string | null) {
  const store = useDogyptStore();
  const fallback = useMemo(() => {
    const seed = import.meta.env.DEV ? readDevSeed() : null;
    const base = seed?.packNumber ?? 73;
    return readSvorka().map((d, i): NewDog => ({
      id: d.flowId,
      name: d.dogName || '',
      photo: d.photo || '',
      n: sessionId ? null : base + i,
      glyph: '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [dogs, setDogs] = useState<NewDog[]>(fallback);
  const [owner, setOwner] = useState(store.ownerName || '');
  const [email, setEmail] = useState(store.email || '');
  const [session, setSession] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    const delays = [1000, 2000, 4000, 8000, 15000];
    const attempt = async (k: number): Promise<void> => {
      try {
        const r = await fetch(`${EDGE_BASE}/get-session-data?session_id=${sessionId}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (!d.dogName) throw new Error('empty session data');
        if (!alive) return;
        setSession(d);
        setOwner(d.ownerName || '');
        setEmail(d.email || '');
        const list: NewDog[] = Array.isArray(d.dogs) && d.dogs.length
          ? d.dogs.map((x: Record<string, unknown>) => ({
            id: String(x.id), name: String(x.dogName || ''), photo: String(x.dogPhotoUrl || ''),
            n: typeof x.packNumber === 'number' ? x.packNumber : null, glyph: String(x.heroglyphPngUrl || ''),
          }))
          : [{ id: 'main', name: d.dogName, photo: d.dogPhotoUrl || '', n: typeof d.packNumber === 'number' ? d.packNumber : null, glyph: '' }];
        setDogs(list);
        // Číslo ešte nie je (webhook aj seal zaostali) ⇒ skús znova.
        if (list.some((x) => x.n == null) && k < delays.length) {
          setTimeout(() => { if (alive) void attempt(k + 1); }, delays[k]);
        }
      } catch (e) {
        if (!alive) return;
        if (k < delays.length) setTimeout(() => { if (alive) void attempt(k + 1); }, delays[k]);
        else console.error('[flow-welcome] get-session-data failed:', e);
      }
    };
    void attempt(0);
    return () => { alive = false; };
  }, [sessionId]);

  return { dogs, owner, email, session };
}

/** Predošlí psi v poradí (verejná stena). Koľko: aby nový pes stál v strede. */
function usePrevDogs(firstN: number | null, count: number) {
  const [prev, setPrev] = useState<PrevDog[] | null>(null);
  useEffect(() => {
    if (firstN == null) return;
    let alive = true;
    fetch(`${EDGE_BASE}/get-grid-dogs`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Array<{ pack_number: number | null; dog_name: string | null; cloudinary_main_url: string | null }>) => {
        if (!alive) return;
        const list = rows
          .filter((r) => r.pack_number != null && r.pack_number < firstN)
          .sort((a, b) => (a.pack_number as number) - (b.pack_number as number))
          .slice(-count)
          .map((r) => ({ n: r.pack_number as number, name: r.dog_name || '', photo: r.cloudinary_main_url || '' }));
        setPrev(list);
      })
      .catch(() => { if (alive) setPrev([]); });
    return () => { alive = false; };
  }, [firstN, count]);
  return prev;
}

const pic = (u: string) => (u ? fillUrl(u, 96, 96) || u : '');
/** Fotka v riadku; keď sa nenačíta, ostane prázdna jamka (nie ikonka rozbitého obrázka). */
const Ph = ({ src }: { src: string }) => (
  <span className="wl-ph">
    {src && <img src={pic(src)} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
  </span>
);

export function FlowWelcomeScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const { dogs, owner, email, session } = useWelcomeData(sessionId);

  // ── FÁZA 1: HEKTOR ─────────────────────────────────────────────────────
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = useState<'hero' | 'rank'>(reduced ? 'rank' : 'hero');
  const ownerFirst = (owner || '').trim().split(/\s+/)[0] || '';
  // Majiteľ a psi jedným zoznamom: „Matej, HEKTHOR a BELLA!" (nie „Matej a HEKTHOR a BELLA").
  const names = [ownerFirst, ...dogs.map((d) => d.name)].filter(Boolean);
  const and = t('heroglyph.flow.welcomeNew.and');
  const titleA = t('heroglyph.flow.welcomeNew.hi');
  const titleB = (names.length > 1 ? `${names.slice(0, -1).join(', ')}${and}${names[names.length - 1]}` : (names[0] || '')) + '!';
  const introMs = Math.min(4200, Math.round((REVEAL_S + (titleA + titleB).length * LETTER_S + 1.6) * 1000));
  useEffect(() => {
    if (phase !== 'hero') return;
    const id = window.setTimeout(() => setPhase('rank'), introMs);
    return () => window.clearTimeout(id);
  }, [phase, introMs]);
  const heroMedallion = useMemo(() => {
    if (typeof window === 'undefined') return 240;
    const byWidth = Math.min(window.innerWidth, 640) * 0.72;
    const byHeight = window.innerHeight * 0.4;
    return Math.round(Math.max(148, Math.min(320, Math.min(byWidth, byHeight))));
  }, []);

  // ── FÁZA 2: PORADIE ─────────────────────────────────────────────────────
  const firstN = dogs[0]?.n ?? null;
  // Matej 26. 9.: *„záleží, koľko psov človek pridáva… top je, ak budú psy čo
  // najviac na strede obrazovky… 3–5"*. Jeden pes ⇒ 5 nad ním, každý ďalší ubere.
  const prevCount = Math.max(3, 6 - dogs.length);
  const prev = usePrevDogs(firstN, prevCount);
  const [rolled, setRolled] = useState(false); // predošlí vyrolovali a rozmazali sa
  const [joined, setJoined] = useState(false); // nový pes sa zaradil
  useEffect(() => {
    if (phase !== 'rank' || prev == null) return;
    const a = window.setTimeout(() => setRolled(true), 400 + prev.length * 180);
    const b = window.setTimeout(() => setJoined(true), 400 + prev.length * 180 + 1500);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, [phase, prev]);

  // ── PIPELINE (len skutočná platba) ────────────────────────────────────
  const [glyphUrl, setGlyphUrl] = useState('');
  const [glyphTimedOut, setGlyphTimedOut] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const verticalRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const sel = (session?.selections as Record<string, string>) || {};
  // Skryté rámy čítajú store — po platbe na inom zariadení by bol prázdny.
  useEffect(() => {
    if (!session) return;
    const s = useDogyptStore.getState();
    const d = session as Record<string, string>;
    if (d.dogName && s.dogName !== d.dogName) s.setDogName(d.dogName);
    if (d.ownerName && s.ownerName !== d.ownerName) s.setOwnerName(d.ownerName);
    if (d.dogPhotoUrl && s.dogPhotoUrl !== d.dogPhotoUrl) s.setDogPhotoUrl(d.dogPhotoUrl);
    if (d.patronSvg && s.patronSvg !== d.patronSvg) s.setPatronSvg(d.patronSvg);
    Object.entries(sel).forEach(([k, v]) => { if (typeof v === 'string') s.setSelection(k, v); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  const main = dogs[0];
  const certNumber = firstN != null ? `#${firstN}` : '';
  usePostPaymentPipeline({
    email: sessionId ? email : '',
    dogName: main?.name || '',
    ownerName: owner,
    dogPhotoUrl: main?.photo || '',
    sessionId,
    packNumber: sessionId ? firstN : null,
    certRef, verticalRef, horizontalRef, shareRef,
    onHeroglyphReady: setGlyphUrl,
  });
  useEffect(() => {
    if (!sessionId || glyphUrl || firstN == null) return;
    const id = window.setTimeout(() => setGlyphTimedOut(true), 8000);
    return () => window.clearTimeout(id);
  }, [sessionId, glyphUrl, firstN]);

  // ── VETY PO JEDNEJ ────────────────────────────────────────────────────
  // 1 profil (kým nepríde číslo) · 2 certifikát (kým nie je heroglyf) · 3 HOTOVO · 4 1M + progres + CTA.
  const profileDone = firstN != null;
  const certDone = !sessionId || !!glyphUrl || glyphTimedOut;
  const [line, setLine] = useState(0);
  useEffect(() => {
    if (!joined) return;
    const ready = [true, profileDone, certDone, true][line] ?? true;
    if (line >= 4 || !ready) return;
    const id = window.setTimeout(() => setLine((l) => l + 1), line === 0 ? 200 : LINE_MIN);
    return () => window.clearTimeout(id);
  }, [joined, line, profileDone, certDone]);

  const purchaseTracked = useRef(false);
  useEffect(() => {
    if (purchaseTracked.current || !sessionId || firstN == null) return;
    purchaseTracked.current = true;
    track('purchase_completed', { pack_number: firstN, dogs: dogs.length });
  }, [sessionId, firstN, dogs.length]);

  const toWall = () => {
    const [first, ...rest] = dogs;
    if (!first) return navigate('/');
    const q = new URLSearchParams({ reveal: 'true', dogName: first.name, packNumber: String(first.n ?? 0) });
    if (first.photo) q.set('photoUrl', first.photo);
    const g = first.glyph || glyphUrl;
    if (g) q.set('heroglyphUrl', g);
    // Viac psov: stena ich zapečatí postupne (GodsGrid číta `queue`).
    if (rest.length) q.set('queue', JSON.stringify(rest.map((d) => ({ n: d.n ?? 0, name: d.name, photo: d.photo, glyph: d.glyph }))));
    navigate(`/?${q.toString()}`);
  };

  const totalN = dogs.reduce((m, d) => Math.max(m, d.n ?? 0), 0);
  const pct = Math.max(2, Math.min(100, (totalN / 1_000_000) * 100));

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_CARVE_CSS}{FLOW_MEDAL_CSS}{FLOW_INTRO_CSS}{WELCOME_CSS}</style>
      <div className="hf-topbar flex-shrink-0"><PageTopBar /></div>
      <div className="hf-stage">
        <div className="w-full max-w-xl flex flex-col items-center">
          <AnimatePresence mode="wait">
            {phase === 'hero' ? (
              <motion.button
                key="hero"
                type="button"
                className="wl-hero"
                onClick={() => setPhase('rank')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <span className="hf-medin">
                  <FlowMedallion src={hekthorFace('welcome')} size={heroMedallion} className="hf-medal" />
                </span>
                <span className="wl-hero-h">
                  <LetterReveal text={titleA} from={REVEAL_S} />
                  <span className="wl-br" aria-hidden />
                  <LetterReveal text={titleB} from={REVEAL_S + titleA.length * LETTER_S} bold />
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="rank"
                className="hf-block hf-carved wl-stack"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="hf-carved-rim" aria-hidden />
                <div className="hf-plate">
                  {/* PORADIE — predošlí hore rozmazaní, nový pes (psi) pod nimi. */}
                  <div className="wl-rank">
                    {(prev ?? []).map((d, i) => (
                      <motion.div
                        key={`p${d.n}`}
                        className={`wl-row is-prev${rolled ? ' is-blur' : ''}`}
                        initial={{ opacity: 0, y: 64 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.18, duration: 0.45, ease: 'easeOut' }}
                      >
                        <Ph src={d.photo} />
                        <span className="wl-name">{d.name}</span>
                        <span className="wl-num">#{d.n}</span>
                      </motion.div>
                    ))}
                    {rolled && dogs.map((d, i) => (
                      <motion.div
                        key={`n${d.id}`}
                        className={`wl-row is-new${joined ? ' is-joined' : ''}`}
                        initial={{ opacity: 0, scale: 1.18, y: 24 }}
                        animate={joined ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1.12, y: 0 }}
                        transition={{ delay: joined ? 0 : i * 0.35, duration: 0.6, ease: [0.2, 0.8, 0.3, 1] }}
                      >
                        <Ph src={d.photo} />
                        <span className="wl-name">{d.name}</span>
                        <span className="wl-num">{d.n != null ? `#${d.n}` : '#…'}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* VETY PO JEDNEJ (Matej: *„dolu pod tým sa zobrazuje text po jednom"*). */}
                  <div className="wl-lines" aria-live="polite">
                    {line >= 1 && line < 3 && (
                      <motion.p className="wl-line" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        {t('heroglyph.flow.welcomeNew.l1')}
                      </motion.p>
                    )}
                    {line === 2 && (
                      <motion.p className="wl-line" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        {t('heroglyph.flow.welcomeNew.l2')}
                      </motion.p>
                    )}
                    {line >= 3 && (
                      <motion.p className="wl-line is-done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        {t('heroglyph.flow.welcomeNew.l3')}
                      </motion.p>
                    )}
                    {line >= 4 && (
                      <motion.p className="wl-thanks" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        {t('heroglyph.flow.welcomeNew.l4')}
                      </motion.p>
                    )}
                  </div>

                  {line >= 4 && (
                    <motion.div className="wl-goal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                      <div className="wl-bar" role="progressbar" aria-valuemin={0} aria-valuemax={1000000} aria-valuenow={totalN}>
                        <motion.span initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }} />
                      </div>
                      <span className="wl-goal-t">{t('heroglyph.flow.welcomeNew.goal', { n: totalN.toLocaleString('sk-SK') })}</span>
                    </motion.div>
                  )}

                  {line >= 4 && (
                    <motion.button
                      type="button"
                      className="hf-cta wl-cta"
                      onClick={toWall}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6, duration: 0.4 }}
                    >
                      {t('heroglyph.flow.welcomeNew.cta')}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Skryté rámy pre PDF/heroglyf — len pri skutočnej platbe. translate="no"
          je NOSNÉ (auto-preklad by prepísal meno psa pred snímkou, #42 16. 7.). */}
      {sessionId && main && (
        <div aria-hidden="true" translate="no" className="notranslate" style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none', opacity: 1 }}>
          <div ref={certRef}>
            <CertificateCard
              dogName={main.name}
              ownerName={owner}
              photoUrl={main.photo}
              heroglyphCode={buildHeroglyphCode({
                dogName: main.name,
                ownerName: owner,
                patronSvg: String(session?.patronSvg || ''),
                breed: sel.breed,
                patronCategory: sel.patronCategory,
                country: sel.country || sel.ownerCountry,
                selections: sel,
              })}
              certNumber={certNumber}
              issuedDate={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            />
          </div>
          <div ref={verticalRef} style={{ width: 800, height: 1131, background: 'transparent', color: '#000' }}>
            <VerticalHeroglyphFrame />
          </div>
          <div ref={horizontalRef} style={{ width: 1200, height: 321, background: 'transparent', color: '#000' }}>
            <HeroglyphFrame showOwner />
          </div>
          <div ref={shareRef}>
            {glyphUrl && firstN != null && (
              <ShareCard packNumber={firstN} dogName={main.name} photoUrl={main.photo} heroglyphUrl={glyphUrl} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** ⚠️ Bez spätných apostrofov: CSS je v template literáli. */
const WELCOME_CSS = `
/* ── HEKTOR — veľká bublina ako príchod ODHALENIA ── */
.wl-hero {
  width: 100%; container-type: inline-size; cursor: pointer; border: none;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 32px 16px; border-radius: 16px; text-align: center;
  background: var(--brand-gradient); color: #FAF4EC;
}
.wl-hero-h { font-family: 'Cinzel', serif; font-weight: 700; line-height: 1.25; font-size: clamp(20px, min(7cqw, 4.4dvh), 32px); }
.wl-br { display: block; height: 0; }

/* ── PORADIE ── */
.wl-stack { width: 100%; }
.wl-stack .hf-plate { gap: 16px; }
.wl-rank { display: flex; flex-direction: column; gap: 8px; padding: 8px 4px 4px; }
.wl-row {
  display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 12px;
  height: 56px; padding: 0 16px 0 8px; border-radius: ${PACK_R.pill}px;
  border: 1.5px solid rgba(120, 86, 26, 0.45); background: rgba(255, 250, 238, 0.55);
  font-family: 'Space Grotesk', sans-serif; color: ${LAB.ink};
  transition: filter .6s ease, opacity .6s ease;
}
.wl-row.is-prev.is-blur { filter: blur(1.6px); opacity: .5; }
.wl-ph { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: rgba(120, 86, 26, 0.18); }
.wl-ph img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wl-name { font-size: 16px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wl-num { font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; letter-spacing: .04em; }
/* NOVÝ PES: zažiari, zapulzuje, zaradí sa — a svieti ďalej. */
.wl-row.is-new {
  height: 64px; grid-template-columns: 48px 1fr auto;
  background: #FFFBF1; border: 2px solid #C99A3F;
  animation: wl-pulse 1.1s ease-in-out infinite;
}
.wl-row.is-new .wl-ph { width: 48px; height: 48px; }
.wl-row.is-new .wl-name { font-family: 'Cinzel Decorative', 'Cinzel', serif; font-weight: 700; font-size: 20px; }
.wl-row.is-new .wl-num { font-size: 20px; color: ${LAB.goldInk}; }
.wl-row.is-new.is-joined { animation: wl-glow 2.4s ease-in-out infinite; }
@keyframes wl-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201, 154, 63, 0.0), 0 0 24px 4px rgba(255, 214, 120, 0.55); }
  50% { box-shadow: 0 0 0 8px rgba(201, 154, 63, 0.18), 0 0 48px 12px rgba(255, 214, 120, 0.85); }
}
@keyframes wl-glow {
  0%, 100% { box-shadow: 0 0 16px 2px rgba(255, 214, 120, 0.45); }
  50% { box-shadow: 0 0 32px 8px rgba(255, 214, 120, 0.7); }
}
@media (prefers-reduced-motion: reduce) { .wl-row.is-new, .wl-row.is-new.is-joined { animation: none; box-shadow: 0 0 24px 4px rgba(255, 214, 120, 0.55); } }

/* ── VETY ── */
.wl-lines { display: flex; flex-direction: column; align-items: center; gap: 4px; min-height: 56px; }
.wl-line { margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; letter-spacing: .08em; text-transform: uppercase; color: ${LAB.inkBody}; text-align: center; }
.wl-line.is-done { color: #3D7A4E; font-size: 20px; }
.wl-thanks { margin: 8px 0 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 20px; line-height: 1.3; letter-spacing: .04em; text-transform: uppercase; color: ${LAB.ink}; text-align: center; text-wrap: balance; }
.wl-goal { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.wl-bar { width: min(100%, 320px); height: 12px; border-radius: ${PACK_R.pill}px; background: rgba(22, 48, 122, 0.16); overflow: hidden; }
.wl-bar > span { display: block; height: 100%; border-radius: inherit; background: ${LAPIS.grad}; }
.wl-goal-t { font-family: 'Space Grotesk', sans-serif; font-size: 12px; letter-spacing: .08em; color: ${LAB.inkBody}; }
.wl-cta { width: 100%; }
@media (max-width: 600px) {
  .wl-row { height: 48px; } .wl-row.is-new { height: 56px; }
  .wl-name { font-size: 14px; } .wl-row.is-new .wl-name, .wl-row.is-new .wl-num { font-size: 16px; }
  .wl-line { font-size: 14px; } .wl-line.is-done, .wl-thanks { font-size: 16px; }
}
@media (max-height: 700px) {
  .wl-rank { gap: 6px; } .wl-row { height: 44px; } .wl-row.is-new { height: 52px; }
  .wl-stack .hf-plate { gap: 12px; }
}
`;
