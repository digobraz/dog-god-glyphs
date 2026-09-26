import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS, HF } from '@/components/screens/flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS } from '@/components/screens/flowMedallion';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_R } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { hekthorFace } from '@/lib/hekthorFaces';
import { BRAND_GOLD_BTN } from '@/components/pack/packTheme';
import {
  readSvorka, svorkaDogPayload, waitForStablePhotos,
} from '@/lib/flowSvorka';
import { EDGE_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';
import { getStoredRef } from '@/lib/refCapture';
import { getAttribution } from '@/lib/attribution';

// ════════════════════════════════════════════════════════════════════════════
// C · ZADRŽANIE — kam vedie „Nechcem platiť" z pokladne (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026: *„každý kto vstúpi do flow musí byť premenený minimálne
// na foto na stene zadarmo"* → rebrík €11 · €3 · €0 (pamäť
// `project_dogypt_chvost_flowu_planb_2026-09-25`, nákres
// `plany/nakres-chvost-flowu-2026-09-25.html`, obrazovka C).
//
// 🔑 BEZ VÝČITKY. Matejova prvá verzia textu („bez tvojho to nemá zmysel, o toto
//    ho pripravíš") je guilt tripping, ktorý jeho vlastné pravidlo zakazuje.
//    Obrazovka ukáže, čo ktorá voľba dá, a nechá vybrať.
// 🔑 ŠAT ako panel pokladne (Matej: *„možno bude podobné ako ten popup"*):
//    klikacie bloky `.hf-pick` s kresbou v jamke; vybraný svieti LAPISOM
//    (je to MOJA VOĽBA), popis sa rozbalí pod ním.
//
// 🔑 CENA JE ZA PSA (Matej 25. 9. 2026: *„€3 za jedného psa"*). Pri svorke
//    blok ukáže súčet a pod ním „2 × €3", nech je jasné, z čoho vznikol.
// 🔑 ČO SA STANE (backend 25. 9., DEV):
//    · €11 → späť do pokladne (tam je prepínač anjela a promo).
//    · €3  → `create-checkout` s `tier:'support'` → Stripe → webhook zapíše
//            psov ako 'supporter' (bez čísla a profilu) → návrat sem s
//            `?paid=support` = poďakovanie. Store po Stripe nežije, preto
//            návrat vypína stráž flowu.
//    · €0  → `create-checkout` s `tier:'guest'` bez Stripe → psi 'guest'.
//    Fotky oboch pred stenou posúdi AINUBIS (`review-wall-photo`).
// 🔑 26. 9. 2026 — POPUP, nie stránka (Matej: *„urob túto stránku do popupu
//    ako je aj viac info"*). Voľba `FlowStayChoice` žije v `FlowModal` nad
//    pokladňou; routa `/heroglyph/stay` ostáva len na poďakovanie (€0 zapísané,
//    návrat zo Stripe po €3). Bez parametra presmeruje späť do pokladne.
//    Leží V DOSKE pokladne ako ostatné panely (`FlowPanelShell`, Matej 26. 9.:
//    *„na to isté miesto ako je celý blok"*). Na mobile sú voľby POD SEBOU.
//    Kresba je len pri voľbe (bankovka €3, krížik €0), položky sú len text.
// ════════════════════════════════════════════════════════════════════════════

// 🔑 €3 ZANIKLO (Matej 26. 9. 2026 večer: *„nakoniec dáme len možnosť neplatiť
//    a 0€, nie 3€, to daj preč"*). Ostáva jediná cesta mimo členstva = hosť €0,
//    takže voľba medzi dvoma dlaždicami stratila zmysel: POKRAČOVAŤ ZADARMO je
//    samo tlačidlo. Backend `tier:'support'` (create-checkout, webhook,
//    `send-support-thanks`) ostáva nedotknutý — len ho už nič nevolá.
const TIER = 'guest' as const;

/**
 * ── MEDAILÓN VYPĹŇA BUBLINU ───────────────────────────────────────────────
 * Bublina je natiahnutá (`flex: 1`) na celú výšku stĺpca; jej výška je daná
 * rozložením, nie medailónom. Zmeriame ju a medailónu dáme, čo zostane po
 * texte. Strop 220 (ksicht je rastrový), dno 72; ± 2 px proti kmitaniu.
 * Spoločné pre ZADRŽANIE aj ĎAKOVAČKU HOSŤA (Matej 26. 9. večer: *„pri
 * nezaplatenom daj tiež foto Hektora do stredu podobne ako pri zadržaní"*).
 */
function useFillMedal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const speakRef = useRef<HTMLDivElement>(null);
  const sayRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [medal, setMedal] = useState(120);
  const [titleSize, setTitleSize] = useState(24);
  useLayoutEffect(() => {
    const el = speakRef.current;
    const say = sayRef.current;
    if (!el || !say) return;
    const fit = () => {
      // 1) Nadpis: najväčší stupeň, pri ktorom sa oba riadky zmestia — ale NAJVIAC
      //    24, strop nadpisov vstupu (stupnica 18 · 21 · 24). Matej 26. 9.:
      //    *„zmenši písmo na maximálne, aké máme vo flow z nadpisov, nie takéto obrie"*.
      const h2 = titleRef.current;
      if (h2) {
        // Šírka BUBLINY bez odsadení — stĺpec textu (`say`) sa nerozťahuje
        // nowrap riadkom a na mobile by nadpis pretiekol cez okraj.
        const ecs = getComputedStyle(el);
        const avail = el.clientWidth - parseFloat(ecs.paddingLeft) - parseFloat(ecs.paddingRight) - 4;
        let f = 24;
        h2.style.fontSize = `${f}px`;
        const widest = () => Math.max(...Array.from(h2.children).map((c) => (c as HTMLElement).getBoundingClientRect().width));
        while (f > 16 && widest() > avail) { f -= 1; h2.style.fontSize = `${f}px`; }
        setTitleSize((p) => (p === f ? p : f));
      }
      // 2) Medailón: zvyšok výšky, o pätinu skromnejší (Matej: *„trochu zmenši foto"*).
      const cs = getComputedStyle(el);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const gap = parseFloat(cs.rowGap || cs.gap || '0') || 0;
      const room = Math.min(el.clientHeight - padY - say.offsetHeight - gap, el.clientWidth - 32);
      // Nízke okno: keď spodok stĺpca (tlačidlá) vyjde z okna, medailón ustúpi
      // presne o presah — obsah sa zmenšuje, rezerva od okraja (16) nie.
      const wrap = wrapRef.current;
      const bottom = wrap ? wrap.getBoundingClientRect().bottom : 0;
      const over = bottom - (window.innerHeight - 16);
      setMedal((m) => {
        const want = over > 1 ? m - over : room * 0.9;
        const next = Math.max(72, Math.min(220, Math.floor(want)));
        return Math.abs(next - m) > 2 ? next : m;
      });
    };
    fit();
    // Cinzel sa načíta neskôr než prvé meranie; náhradné písmo je užšie, takže
    // stupeň nameraný nad ním by po načítaní pretiekol bublinu.
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, []);
  return { wrapRef, speakRef, sayRef, titleRef, medal, titleSize };
}

/** Obsah popupu ZADRŽANIE — v pokladni v `FlowModal`. */
export function FlowStayChoice({ onMember, onMore }: { onMember: () => void; onMore: () => void }) {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const dogs = useMemo(() => readSvorka(), []);
  const email = useDogyptStore((s) => s.email);
  const ownerName = useDogyptStore((s) => s.ownerName);
  const extraPhotos = useDogyptStore((s) => s.extraPhotos);
  const [news, setNews] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { wrapRef, speakRef, sayRef, titleRef, medal, titleSize } = useFillMedal();

  const confirm = async () => {
    if (busy) return;
    track('stay_tier_chosen', { tier: TIER, dogs: dogs.length, news });
    setBusy(true);
    setError(null);
    try {
      const stable = await waitForStablePhotos();
      if (stable.some((d) => d.photo?.startsWith('blob:'))) {
        setError(t('payment.photoNotReady'));
        setBusy(false);
        return;
      }
      const res = await fetch(`${EDGE_BASE}/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: TIER,
          newsConsent: news,
          email,
          ownerName,
          dogs: stable.map((d) => svorkaDogPayload(d, ownerName, 0)),
          cloudinaryExtras: extraPhotos.filter((u) => u && !u.startsWith('blob:')),
          refCode: getStoredRef(),
          language: lang,
          ...getAttribution(),
        }),
      });
      const data = res.ok ? await res.json() : null;
      if (data?.tier === 'guest') {
        track('stay_guest_joined', { dogs: stable.length, news });
        navigate('/heroglyph/stay?done=guest');
        return;
      }
      console.error('create-checkout (stay) failed:', res.status, data?.error);
      setError(t('payment.error'));
      setBusy(false);
    } catch (err) {
      console.error('stay confirm error:', err);
      setError(t('payment.error'));
      setBusy(false);
    }
  };

  return (
    <div className="st-wrap" ref={wrapRef}>
      <style>{FLOW_MEDAL_CSS}{STAY_CSS}</style>
      <div className="hf-speak st-speak" ref={speakRef}>
        {/* Hektor V STREDE a text pod ním, čo najväčší (Matej 26. 9.: *„tento popup
            musí byť čo najväčší — Hektor bude v strede a pod ním text"* a o kolo
            neskôr *„zväčši Hektorovu fotku, blok je zbytočne veľký, veľké medzery
            hore aj dole"*). Veľkosť sa preto MERIA: medailón dostane celé voľné
            miesto bubliny (výška − text − odsadenia), nie číslo podľa okna. */}
        <FlowMedallion src={hekthorFace('stay')} size={medal} />
        <span className="say" ref={sayRef}>
          {/* NADPIS NA DVA RIADKY, ČO NAJVÄČŠÍ (Matej 26. 9.: *„zväčši nadpis na
              telefóne — dva riadky, čo najväčšie písmo, a čo najviac aj na PC,
              a podľa toho uprav foto"*). Stupeň sa dopočíta tak, aby dlhší
              riadok presne vyplnil šírku bubliny; medailón dostane zvyšok výšky. */}
          <h2 ref={titleRef} className="st-title" style={{ fontSize: titleSize }}>
            <span>{t('heroglyph.flow.stay.titlePrefix').trim()}</span>
            <span><b>{t('heroglyph.flow.stay.titleWord')}</b>{t('heroglyph.flow.stay.titleSuffix')}</span>
          </h2>
          <p>{t('heroglyph.flow.stay.sub')}</p>
        </span>
      </div>

      {/* DVA BLOKY NAD SEBOU ako každý krok vstupu — bublina, pod ňou doska
          (Matej 26. 9. večer: *„zadržanie je iná štruktúra, blok v bloku… daj to
          tak ako sú všetky obrazovky = 2 bloky nad sebou nie vnorené!"*). */}
      <div className="hf-block hf-carved st-board">
        <span className="hf-carved-rim" aria-hidden />
        <div className="hf-plate">
          {/* 26. 9. 2026 — Matej: *„zadržanie daj bez ukážky… bez toho na stene,
              iba (v psej optike); poradové číslo a profil je jedno x a druhé
              veľkým a podčiarknutým PROFIL V ČLENSKEJ SEKCII"*. Profil je odkaz —
              otvorí ten istý popup ako VIAC INFO v pokladni. */}
          <ul className="st-rows">
            <li className="st-row yes">
              <Mark yes />
              <span><b>{t('heroglyph.flow.stay.have')}</b> <small>{t('heroglyph.flow.stay.haveNote')}</small></span>
            </li>
            <li className="st-row no">
              <Mark yes={false} />
              <b>{t('heroglyph.flow.stay.f.num')}</b>
            </li>
            <li className="st-row no">
              <Mark yes={false} />
              <button type="button" className="st-profile" onClick={onMore}>{t('heroglyph.flow.stay.miss2')}</button>
            </li>
          </ul>

          {/* Novinky sú marketing ⇒ výslovný súhlas (krok 4 sľúbil e-mail len
              na „nech sa ti dizajn nestratí"). */}
          <button type="button" className={`hf-chk${news ? ' on' : ''}`} onClick={() => setNews((v) => !v)}>
            <span className="box">
              <svg viewBox="0 0 24 24" fill="none" stroke="#16307A" strokeWidth="3.4"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12.5 L9.5 18 L20 6" />
              </svg>
            </span>
            <span className="lbl">{t('heroglyph.flow.stay.news')}</span>
          </button>

          {error && <p role="alert" className="hf-alert">{error}</p>}
          <div className="st-actions">
            {/* Výplň prehodená (Matej 26. 9. 2026): PLNÝ PRÍSTUP = plné lapis,
                POTVRDIŤ = priesvitné. Pod sebou: člen hore, potvrdenie dole. */}
            <button type="button" className="hf-cta" onClick={() => { track('stay_tier_chosen', { tier: 'member', dogs: dogs.length }); onMember(); }} disabled={busy}>
              {t('heroglyph.flow.stay.member')}
            </button>
            <button type="button" className="st-confirm" onClick={confirm} disabled={busy}>
              {busy ? t('payment.preparing') : t('heroglyph.flow.stay.free')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ✓ zelená (SPLNENÉ) · ✗ červená — kreslené, nie holý znak (stráž `check:ikony`). */
function Mark({ yes }: { yes: boolean }) {
  return (
    <svg className="st-mark" viewBox="0 0 24 24" fill="none" strokeWidth="3.2"
      strokeLinecap="round" strokeLinejoin="round" aria-label={yes ? '+' : '-'}>
      {yes ? <path d="M4 12.5 L9.5 18 L20 6" /> : <path d="M6 6 L18 18 M18 6 L6 18" />}
    </svg>
  );
}

/** `/heroglyph/stay` — už len poďakovanie; voľba je popup v pokladni. */
export function FlowStayScreen() {
  const navigate = useNavigate();
  const t = useT();
  const [params] = useSearchParams();
  const done: 'support' | 'guest' | null =
    params.get('paid') === 'support' ? 'support' : params.get('done') === 'guest' ? 'guest' : null;

  if (!done) return <Navigate to="/checkout?stay=1" replace />;
  if (done === 'guest') return <GuestThanks />;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}{STAY_CSS}</style>
      <div className="hf-topbar flex-shrink-0">
        <PageTopBar />
      </div>
      <div className="hf-stage">
        <div className="w-full max-w-xl flex flex-col items-center">
          <motion.div
            className="hf-speak st-speak"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <FlowMedallion src={hekthorFace('stay')} size={72} />
            <span className="say">
              <h2><b>{t('heroglyph.flow.stay.done.t')}</b></h2>
              <p>{t(`heroglyph.flow.stay.done.${done}`)}</p>
            </span>
          </motion.div>
          <button type="button" className="hf-cta st-done-cta" onClick={() => navigate('/')}>
            {t('heroglyph.flow.stay.done.cta')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ĎAKOVAČKA HOSŤA €0 (26. 9. 2026) — návrh z nákresu
 * `plany/nakres-heroflow-konce-2026-09-26/`, Matej: *„kľudne tam daj ten tvoj
 * návrh a doladíme ho priamo na mieste"*.
 * Hore Hektor: pes je na stene. Doska: karta zo steny v psej optike + čo sa
 * stalo, pod rytinou „keď sa rozhodneš" čo pridá členstvo, dole NA STENU
 * (obrys) a PRIDAŤ SA ZA €11 (lapis — jediné hlavné CTA).
 * 🔑 PRIDAŤ SA je poctivé: `create-checkout` hosťovho psa (ten istý e-mail a
 *    meno) PREKLOPÍ, nezaloží druhého — na stene ostane jeden.
 * 🚩 Riadok „odkaz ti príde mailom" tu NIE JE — mail hosťovi zatiaľ neexistuje
 *    (otázka 2 nákresu čaká na Mateja).
 */
function GuestThanks() {
  const navigate = useNavigate();
  const t = useT();
  const dogs = useMemo(() => readSvorka(), []);
  // Matej 26. 9.: *„HOTOVO. TVOJ PES/PSY sú v DOGYPTE!"* — bez mena, bez
  // podnadpisu o AINUBISovi a bez fotky. Zvýraznené slovo je medzi hviezdičkami.
  const title = t(dogs.length > 1 ? 'heroglyph.flow.stay.thanks.tMany' : 'heroglyph.flow.stay.thanks.tOne');
  const [pre, hi, post] = title.split('*');
  // Hektor V STREDE a väčší, ako pri zadržaní (Matej 26. 9. večer: *„pri
  // nezaplatenom daj tiež foto Hektora do stredu… zväčši foto aj text, je tam
  // dosť miesta"*). Medailón aj nadpis sa merajú rovnako ako tam.
  const { wrapRef, speakRef, sayRef, titleRef, medal, titleSize } = useFillMedal();
  const tags = [t('heroglyph.flow.stay.thanks.tagNum'), 'DOG ID', 'AINUBIS', 'DOGTRIP', 'SNIFFER'];
  const Ok = () => (
    <svg className="gt-ok" viewBox="0 0 24 24" fill="none" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12.5 L9.5 18 L20 6" />
    </svg>
  );
  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}{STAY_CSS}</style>
      <div className="hf-topbar flex-shrink-0"><PageTopBar /></div>
      <div className="hf-stage">
        <div className="w-full max-w-xl st-wrap gt-wrap" ref={wrapRef}>
          <motion.div ref={speakRef} className="hf-speak st-speak" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
            <FlowMedallion src={hekthorFace('stay-done')} size={medal} />
            <span className="say" ref={sayRef}>
              {/* Dva riadky: „Hotovo. Tvoj pes" / „je v DOGYPTE!" */}
              <h2 ref={titleRef} className="st-title" style={{ fontSize: titleSize }}>
                <span>{pre}<b>{hi}</b></span>
                <span>{post.trim()}</span>
              </h2>
            </span>
          </motion.div>

          <motion.div className="hf-block hf-carved gt-stack" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <span className="hf-carved-rim" aria-hidden />
            <div className="hf-plate">
              <ul className="gt-lines">
                <li><Ok />{t('heroglyph.flow.stay.thanks.l1')}</li>
                <li><Ok />{t('heroglyph.flow.stay.thanks.l2')}</li>
                <li><Ok />{t('heroglyph.flow.stay.thanks.l3')}</li>
              </ul>
              <p className="hf-legend">{t('heroglyph.flow.stay.thanks.rule')}</p>
              <div className="gt-tags">{tags.map((x) => <span key={x}>{x}</span>)}</div>
              <div className="gt-ctas">
                <button type="button" className="st-confirm" onClick={() => navigate('/')}>
                  {t('heroglyph.flow.stay.thanks.wall')}
                </button>
                <button type="button" className="hf-cta" onClick={() => navigate('/checkout')}>
                  {t('heroglyph.flow.stay.thanks.join')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const STAY_CSS = `
/* ── ĎAKOVAČKA HOSŤA ── ten istý stĺpec ako zadržanie (bublina berie výšku). */
.gt-wrap { min-height: min(calc(100dvh - 160px), 820px); }
.gt-stack { width: 100%; }
.gt-stack .hf-plate { gap: 12px; }
.gt-lines { list-style: none; margin: 0 auto; padding: 0; display: flex; flex-direction: column; gap: 8px;
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; line-height: 1.3; color: ${LAB.ink}; }
.gt-lines li { display: flex; align-items: center; gap: 8px; }
.gt-ok { flex: none; width: 20px; height: 20px; stroke: #3D7A4E; }
.gt-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.gt-tags span { padding: 4px 12px; border-radius: ${PACK_R.pill}px; border: 1px solid ${BRAND_GOLD_BTN.edge};
  font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: ${LAB.inkBody}; }
.gt-ctas { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) {
  .gt-lines { font-size: 14px; gap: 6px; } .gt-ok { width: 18px; height: 18px; }
  .gt-ctas { grid-template-columns: 1fr; } .gt-ctas .hf-cta { order: -1; }
}
/* ZADRŽANIE aj ĎAKOVAČKA: bublina (natiahnutá na zvyšok výšky, Hektor
   v strede) + pod ňou samostatná doska — medzeru nesie \`.hf-block\`, ako
   na každom kroku vstupu. */
.st-wrap { display: flex; flex-direction: column; }
.st-wrap .st-speak.hf-speak { flex: 1; justify-content: center; }
.st-board .hf-plate { gap: 12px; }
/* Hektor v strede, text pod ním — bublina je stĺpec (26. 9. večer). */
.st-wrap .st-speak.hf-speak { flex-direction: column; text-align: center; padding: 20px 16px; gap: 12px; }
.st-wrap .st-speak .say { align-items: center; text-align: center; align-self: stretch; }
.st-title { display: flex; flex-direction: column; align-items: center; line-height: 1.12; }
.st-title > span { white-space: nowrap; }
.st-speak h2 { font-size: 20px; }
.st-speak p { font-size: 14px; line-height: 1.45; }
@media (min-width: 601px) {
  .st-wrap .st-speak.hf-speak { padding: 24px 32px; gap: 16px; }
  .st-speak h2 { font-size: 24px; }
  .st-speak p { font-size: 16px; max-width: 520px; }
}
.st-rows { align-self: center; }
/* KARTA ZO STENY + DVA RIADKY (26. 9. 2026). Písmo 16/14, nie 12 — Matej:
   *„su miniatúrne"*. Karta = mini .dog-card psa bez člena: fotka v psej
   optike, dolu stmavnutie so zlatým heroglyfom, meno v pilulke. */
.st-rows { list-style: none; margin: 0; padding: 0; align-self: center; display: flex; flex-direction: column; gap: 8px; }
.st-row { display: flex; align-items: center; gap: 8px; font-family: 'Space Grotesk', sans-serif; font-size: 16px; line-height: 1.3; color: ${LAB.ink}; }
.st-row b { font-weight: 500; }
.st-row small { font-size: 14px; color: ${LAB.inkBody}; white-space: nowrap; }
.st-row.no { color: ${LAB.inkBody}; }
.st-profile { background: none; border: 0; padding: 0; cursor: pointer; text-align: left; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; letter-spacing: .04em; text-transform: uppercase; color: ${LAB.ink}; text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; }
.st-profile:hover { color: ${LAPIS.edge}; }
.st-mark { flex: none; width: 20px; height: 20px; stroke: #B25640; }
.st-row.yes .st-mark { stroke: #3D7A4E; }
/* POD SEBOU (Matej 26. 9. 2026: *„plný prístup a potvrdiť by som dal pod seba"*): plný hore, priesvitný pod ním. */
.st-actions { display: flex; flex-direction: column; gap: 8px; }
.st-actions > button { width: 100%; }
.st-actions .hf-cta { width: 100%; }
/* PC (≥601): VEDĽA SEBA (Matej 26. 9. ~15:00: *„na PC to nie je ok, obsah preteká
   a dá sa scrollovať, takže tlačidlá daj vedľa seba"*). Pretekalo to po výbere
   €0/€3, keď pribudne checkbox s e-mailom. POTVRDIŤ vľavo, PLNÝ PRÍSTUP (plné
   lapis) vpravo — plná akcia bližšie k palcu, ako v pokladni. Mobil ostáva pod sebou. */
@media (min-width: 601px) {
  .st-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .st-actions > .st-confirm { order: 1; }
  .st-actions > .hf-cta { order: 2; }
}
.st-confirm {
  height: ${HF.cta.h}px; border-radius: ${HF.cta.radius}px; cursor: pointer;
  border: 1.5px solid ${LAPIS.edge}; background: transparent; color: ${LAPIS.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${HF.cta.size}px;
  letter-spacing: .08em; text-transform: uppercase; line-height: 1.15; padding: 0 8px;
  transition: background .18s;
}
.st-confirm:hover:not(:disabled) { background: ${LAPIS.fill}; }
.st-confirm:disabled { opacity: .4; cursor: default; }
.st-done-cta { margin-top: 16px; max-width: 320px; }
.st-wrap .hf-chk { border-radius: ${PACK_R.tile}px; }
/* Nízke PC okno (1477×724): hlavička popupu ustúpi prvá, obsah (voľby, CTA) nie. */
@media (min-width: 601px) and (max-height: 800px) {
  .st-board .hf-plate { gap: 10px; }
  .st-wrap .st-speak.hf-speak { padding: 12px 20px; gap: 8px; }
  .st-speak h2 { font-size: 20px; }
  .st-speak p { font-size: 14px; }
}
@media (max-width: 600px) {
  .st-board .hf-plate { gap: 10px; }
  .st-wrap .st-speak.hf-speak { padding: 12px; gap: 8px; }
  .st-speak h2 { font-size: 16px; }
  .st-speak p { font-size: 12px; line-height: 1.4; }
  .st-row, .st-profile { font-size: 14px; }
  .st-row small { font-size: 12px; }
  .st-mark { width: 18px; height: 18px; }
}
@media (max-width: 600px) and (max-height: 700px) {
  .st-board .hf-plate { gap: 6px; }
  .st-speak h2 { font-size: 14px; }
  .st-wrap .hf-chk { padding-top: 6px; padding-bottom: 6px; }
}
`;
