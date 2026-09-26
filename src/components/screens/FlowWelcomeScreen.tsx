import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { useDogyptStore } from '@/store/dogyptStore';
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
    // Dielňa vie 1–6 psov; psi navyše z dev seedu nemajú meno ani fotku.
    const DEV_NAMES = ['ALBA', 'BENO', 'CIRA', 'DUNO', 'EMA', 'FLÓRA'];
    return readSvorka().map((d, i): NewDog => ({
      id: d.flowId,
      name: d.dogName || (seed ? DEV_NAMES[(i - 1 + DEV_NAMES.length) % DEV_NAMES.length] : ''),
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
        // #1 = Hektor, zakladateľ — stena ho má natvrdo, z DB nepríde.
        if (list.length < count && !list.some((d) => d.n === 1)) list.unshift({ n: 1, name: 'HEKTHOR', photo: '/images/hektor-grid.webp' });
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
  // Matej 26. 9.: *„obsah je malý = musíme to roztiahnuť… ak je sám pes a jeden
  // riadok, logicky musíme pridať viac psov"*. Poradie berie VŠETKU voľnú výšku
  // dosky a stojí pri spodku (nový pes ≈ stred obrazovky); predošlých sa načíta
  // 12 a čo sa nezmestí, odreže horný okraj pod zošednutím.
  const prev = usePrevDogs(firstN, 12);
  // Koľko predošlých ukázať: poradie zaberie ~42 % výšky okna, nový pes (psi)
  // v ňom stojí dole ⇒ ≈ stred obrazovky. Zvyšok výšky dostane spodok, nie
  // prázdne miesto nad riadkami (Matej 26. 9.: *„hore je veľa miesta… nájdi v tom logiku"*).
  const prevVisible = useMemo(() => {
    if (typeof window === 'undefined') return 4;
    const mobile = window.innerWidth <= 600;
    const step = mobile ? 56 : 64;
    const fresh = (dogs.length >= 4 ? (mobile ? 56 : 60) : (mobile ? 64 : 72)) * dogs.length;
    return Math.max(1, Math.min(8, Math.floor((window.innerHeight * 0.42 - fresh) / step)));
  }, [dogs.length]);
  // ── ZMESTIŤ SA BEZ SCROLLU (Matej 26. 9.: *„nasimulovať 2-3-4-5-6 psov"*) ──
  // Merané: pri 4–6 psoch na nízkom okne (1477×724, 375×667) doska pretiekla
  // o 38–166 px. Obrazovka preto po každom vykreslení zmeria pretečenie javiska
  // a ustúpi v poradí: predošlí psi (až po jedného) → menšia pečať → nižšie
  // riadky → posledný predošlý → pečať bez obrázka (motto ostane). Vzduch od
  // okraja (PAGE_AIR) sa nezmenšuje nikdy — ustupuje obsah.
  const stageRef = useRef<HTMLDivElement>(null);
  const [drop, setDrop] = useState(0);
  const [tight, setTight] = useState(0);
  const shownPrev = Math.max(0, Math.min(prev?.length ?? 0, prevVisible) - drop);
  useLayoutEffect(() => {
    if (phase !== 'rank' || prev == null) return;
    const st = stageRef.current;
    if (!st || st.scrollHeight - st.clientHeight <= 1) return;
    if (shownPrev > 1) setDrop((d) => d + 1);
    else if (tight < 2) setTight((x) => x + 1);
    else if (shownPrev > 0) setDrop((d) => d + 1);
    else if (tight < 3) setTight(3);
  });
  useEffect(() => {
    const reset = () => { setDrop(0); setTight(0); };
    window.addEventListener('resize', reset);
    return () => window.removeEventListener('resize', reset);
  }, []);
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
    // V dielni (bez platby) heroglyf nevznikne a stena by spálila len logo —
    // na test poslúži Hektorov (Matej 26. 9.: *„nevidím zápis animáciu na wall"*).
    const g = first.glyph || glyphUrl || (import.meta.env.DEV && !sessionId ? '/images/hekthor-heroglyph.webp' : '');
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
      {/* BEZ LOGA HORE (Matej 26. 9.: *„posledná stránka nebude mať horné logo…
          tým je väčšia na obsah práve kvôli pečati"*). Punc nesie pečať nad mottom. */}
      <div className={`hf-stage wl-page wl-tight-${tight}`} ref={stageRef}>
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
                    {/* Predošlí majú VLASTNÝ orezový obal so zošednutím zhora; nový pes
                        stojí mimo neho, inak mu orez odstrihol zväčšenie aj žiaru
                        (Matej 26. 9.: *„blok so zaplateným psom je orezaný"*). */}
                    <div className="wl-prev">
                    {(prev ?? []).slice(prev && shownPrev ? -shownPrev : (prev?.length ?? 0)).map((d, i) => (
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
                    </div>
                    {rolled && dogs.map((d, i) => (
                      <motion.div
                        key={`n${d.id}`}
                        className={`wl-row is-new${joined ? ' is-joined' : ''}${dogs.length >= 4 ? ' is-many' : ''}`}
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

                  {/* SPODOK MÁ MIESTO VYHRADENÉ OD ZAČIATKU — vety, progres, pečať aj CTA
                      sú v toku stále a len sa zjavia, takže poradie nad nimi neposkočí. */}
                  <div className="wl-foot">
                    {/* VETY PO JEDNEJ, groteskom (Matej 26. 9.: *„tie oznamy dajme groteskom"*).
                        Na konci ostane len poďakovanie — *„hláška HOTOVO tam byť nemusí"*. */}
                    <div className="wl-foot-top">
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
                      {line === 3 && (
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

                    <motion.div className="wl-goal" initial={false} animate={{ opacity: line >= 4 ? 1 : 0 }} transition={{ delay: 0.4 }}>
                      <div className="wl-bar" role="progressbar" aria-valuemin={0} aria-valuemax={1000000} aria-valuenow={totalN}>
                        <motion.span initial={{ width: 0 }} animate={{ width: line >= 4 ? `${pct}%` : 0 }} transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }} />
                      </div>
                      <span className="wl-goal-t">{t('heroglyph.flow.welcomeNew.goal', { n: totalN.toLocaleString('sk-SK') })}</span>
                    </motion.div>

                    </div>

                    {/* RYTINA oddelí poďakovanie a progres od motta (Matej 26. 9.). */}
                    <motion.p className="hf-legend wl-rule" aria-hidden initial={false} animate={{ opacity: line >= 4 ? 1 : 0 }} transition={{ delay: 0.9, duration: 0.5 }} />

                    {/* PEČAŤ NAD MOTTOM — vrátila sa, keď stránka stratila logo (Matej 26. 9.:
                        *„na mobile je dostatok miesta na pečať nad motto aj na PC"*).
                        Veľkosť ide z výšky okna, pri tesnom okne ustúpi prvá. */}
                    <motion.div className="wl-seal" initial={false} animate={{ opacity: line >= 4 ? 1 : 0, scale: line >= 4 ? 1 : 0.9 }} transition={{ delay: 1.1, duration: 0.5 }}>
                      <img src="/images/peciat-dogypt.png" alt="" aria-hidden />
                      <span className="wl-motto">{t('religion.book.trust')}</span>
                    </motion.div>

                    <motion.button
                      type="button"
                      className="hf-cta wl-cta"
                      onClick={toWall}
                      disabled={line < 4}
                      initial={false}
                      animate={{ opacity: line >= 4 ? 1 : 0, y: line >= 4 ? 0 : 8 }}
                      transition={{ delay: line >= 4 ? 1.6 : 0, duration: 0.4 }}
                      style={{ visibility: line >= 4 ? 'visible' : 'hidden' }}
                    >
                      {t('heroglyph.flow.welcomeNew.cta')}
                    </motion.button>
                  </div>
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

/* ── PORADIE — doska na celú výšku, poradie berie zvyšok ── */
.wl-stack { width: 100%; margin-top: 0; display: flex; flex-direction: column; min-height: min(calc(100dvh - 32px), 900px); }
@media (min-width: 768px) { .wl-stack { min-height: min(calc(100dvh - 48px), 900px); } }
.wl-stack .hf-plate { gap: 16px; flex: 1; min-height: 0; }
.wl-rank {
  flex: none;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 8px; padding: 0 4px 12px;
}
.wl-prev {
  overflow: hidden;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 8px; padding-top: 8px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
          mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
}
.wl-row { flex: none; }
.wl-foot { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 16px; }
.wl-foot-top { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.wl-rule { gap: 0; }
.wl-seal { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.wl-seal img { width: clamp(64px, 13dvh, 128px); height: auto; aspect-ratio: 1; object-fit: contain; transform: rotate(-5deg); filter: drop-shadow(0 6px 12px rgba(60, 40, 10, 0.35)); }
.wl-motto { margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; letter-spacing: .14em; text-transform: uppercase; color: ${LAB.goldInk}; }
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
/* NOVÝ PES: zažiari, zapulzuje, zaradí sa — a ŽIARI ĎALEJ, kým sa neťukne na CTA
   (Matej 26. 9.: *„musí mať krajšiu a výraznejšiu animáciu… aj v kľudnom stave"*).
   Tri vrstvy: pulzujúca zlatá žiara (box-shadow) · lesk, ktorý prebehne blokom ·
   rám, ktorý dýcha medzi brandovou zlatou a svetlou. */
.wl-row.is-new {
  position: relative; overflow: hidden;
  height: 64px; grid-template-columns: 48px 1fr auto;
  background: #FFFBF1; border: 2px solid #C99A3F;
  animation: wl-pulse 1s ease-in-out infinite;
}
.wl-row.is-new::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 38%, rgba(255, 244, 205, 0.95) 50%, transparent 62%);
  background-size: 260% 100%; background-position: 130% 0;
  animation: wl-sheen 2.6s ease-in-out infinite;
}
.wl-row.is-new > * { position: relative; z-index: 1; }
.wl-row.is-new .wl-ph { width: 48px; height: 48px; box-shadow: 0 0 0 2px #C99A3F; }
.wl-row.is-new .wl-name { font-family: 'Cinzel Decorative', 'Cinzel', serif; font-weight: 700; font-size: 20px; }
.wl-row.is-new .wl-num { font-size: 20px; color: ${LAB.goldInk}; }
.wl-row.is-new.is-joined { animation: wl-glow 2.2s ease-in-out infinite; }
/* Ústup pri pretečení (wl-tight-N na javisku, N rastie). */
.wl-tight-1 .wl-seal img, .wl-tight-2 .wl-seal img { width: clamp(48px, 8dvh, 72px); }
.wl-tight-2 .wl-row, .wl-tight-3 .wl-row { height: 44px; }
.wl-tight-2 .wl-row.is-new, .wl-tight-3 .wl-row.is-new { height: 48px; }
.wl-tight-2 .hf-plate, .wl-tight-3 .hf-plate { gap: 12px; }
.wl-tight-2 .wl-foot, .wl-tight-3 .wl-foot { gap: 8px; }
.wl-tight-3 .wl-seal img { display: none; }
/* 4+ psov: riadky ustúpia, aby sa svorka zmestila bez scrollu. */
.wl-row.is-new.is-many { height: 56px; grid-template-columns: 40px 1fr auto; }
.wl-row.is-new.is-many .wl-ph { width: 40px; height: 40px; }
.wl-row.is-new.is-many .wl-name, .wl-row.is-new.is-many .wl-num { font-size: 16px; }
@keyframes wl-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201, 154, 63, 0.35), 0 0 24px 6px rgba(255, 206, 100, 0.6); }
  50% { box-shadow: 0 0 0 10px rgba(201, 154, 63, 0), 0 0 56px 18px rgba(255, 206, 100, 0.95); }
}
@keyframes wl-glow {
  0%, 100% { border-color: #C99A3F; box-shadow: 0 0 0 0 rgba(201, 154, 63, 0.45), 0 0 20px 4px rgba(255, 206, 100, 0.55); }
  50% { border-color: #F2CF7A; box-shadow: 0 0 0 6px rgba(201, 154, 63, 0), 0 0 44px 14px rgba(255, 206, 100, 0.9); }
}
@keyframes wl-sheen { 0% { background-position: 130% 0; } 55%, 100% { background-position: -30% 0; } }
@media (prefers-reduced-motion: reduce) {
  .wl-row.is-new, .wl-row.is-new.is-joined { animation: none; box-shadow: 0 0 28px 6px rgba(255, 206, 100, 0.7); }
  .wl-row.is-new::after { animation: none; opacity: 0; }
}

/* ── VETY — groteskom (Matej 26. 9.) ── */
.wl-lines { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 60px; }
.wl-line { margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 16px; line-height: 1.35; color: ${LAB.inkBody}; text-align: center; }
.wl-line.is-done { color: #3D7A4E; font-weight: 600; font-size: 20px; }
.wl-thanks { margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 20px; line-height: 1.3; letter-spacing: .04em; color: ${LAB.ink}; text-align: center; text-wrap: balance; }
.wl-goal { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.wl-bar { width: 100%; height: 12px; border-radius: ${PACK_R.pill}px; background: rgba(22, 48, 122, 0.16); overflow: hidden; }
.wl-bar > span { display: block; height: 100%; border-radius: inherit; background: ${LAPIS.grad}; }
.wl-goal-t { font-family: 'Space Grotesk', sans-serif; font-size: 12px; letter-spacing: .08em; color: ${LAB.inkBody}; }
.wl-cta { width: 100%; }
@media (max-width: 600px) {
  .wl-row { height: 48px; } .wl-row.is-new { height: 56px; } .wl-row.is-new.is-many { height: 48px; }
  .wl-name { font-size: 14px; } .wl-row.is-new .wl-name, .wl-row.is-new .wl-num { font-size: 16px; }
  .wl-line { font-size: 14px; } .wl-line.is-done, .wl-thanks { font-size: 16px; }
}
@media (max-height: 700px) {
  .wl-rank { gap: 6px; } .wl-row { height: 44px; } .wl-row.is-new { height: 52px; }
  .wl-stack .hf-plate { gap: 12px; }
  .wl-foot { gap: 8px; } .wl-lines { min-height: 48px; }
}
`;
