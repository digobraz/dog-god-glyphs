import { useMemo, useState } from 'react';
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
import {
  readSvorka, svorkaDogPayload, waitForStablePhotos, PRICE_SUPPORT,
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

type Tier = 'support' | 'guest';
const OPTS: { id: Tier; icon: string; each: number }[] = [
  { id: 'guest', icon: '/icons/pack/cross.svg', each: 0 },
  { id: 'support', icon: '/icons/pack/money.svg', each: PRICE_SUPPORT },
];

/** Obsah popupu ZADRŽANIE — v pokladni v `FlowModal`. */
export function FlowStayChoice({ onMember, onMore }: { onMember: () => void; onMore: () => void }) {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const dogs = useMemo(() => readSvorka(), []);
  const email = useDogyptStore((s) => s.email);
  const ownerName = useDogyptStore((s) => s.ownerName);
  const extraPhotos = useDogyptStore((s) => s.extraPhotos);
  const [tier, setTier] = useState<Tier | null>(null);
  const [news, setNews] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const n = Math.max(1, dogs.length);

  const confirm = async () => {
    if (!tier || busy) return;
    track('stay_tier_chosen', { tier, dogs: dogs.length, news });
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
          tier,
          newsConsent: news,
          email,
          ownerName,
          dogs: stable.map((d) => svorkaDogPayload(d, ownerName, tier === 'support' ? PRICE_SUPPORT : 0)),
          cloudinaryExtras: extraPhotos.filter((u) => u && !u.startsWith('blob:')),
          refCode: getStoredRef(),
          language: lang,
          ...getAttribution(),
        }),
      });
      const data = res.ok ? await res.json() : null;
      if (tier === 'support' && data?.url) {
        window.open(data.url, '_top');
        setTimeout(() => setBusy(false), 2000);
        return;
      }
      if (tier === 'guest' && data?.tier === 'guest') {
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
    <div className="st-wrap">
      <style>{FLOW_MEDAL_CSS}{STAY_CSS}</style>
      <div className="hf-speak st-speak">
        <FlowMedallion src={hekthorFace('stay')} size={typeof window === 'undefined' ? 88 : window.innerHeight < 700 ? 64 : window.innerWidth > 600 ? 120 : 88} />
        <span className="say">
          <h2>
            {t('heroglyph.flow.stay.titlePrefix')}
            <b>{t('heroglyph.flow.stay.titleWord')}</b>
            {t('heroglyph.flow.stay.titleSuffix')}
          </h2>
          <p>{t('heroglyph.flow.stay.sub')}</p>
        </span>
      </div>

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

      <div className="st-opts" role="radiogroup">
        {OPTS.map((x) => {
          const on = tier === x.id;
          return (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={`hf-pick st-opt${on ? ' on' : ''}`}
              onClick={() => { setTier(x.id); setError(null); }}
            >
              <span className="well"><img src={x.icon} alt="" /></span>
              <span className="st-opt-name">
                <span className="st-price">€{x.each * n}</span>
                <span className="st-opt-sub">
                  {t(`heroglyph.flow.stay.${x.id}.t`)}
                  {n > 1 && x.each > 0 && ` · ${n} × €${x.each}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Novinky sú marketing ⇒ výslovný súhlas (krok 4 sľúbil e-mail len
          na „nech sa ti dizajn nestratí"). */}
      {tier && (
        <button type="button" className={`hf-chk${news ? ' on' : ''}`} onClick={() => setNews((v) => !v)}>
          <span className="box">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16307A" strokeWidth="3.4"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 12.5 L9.5 18 L20 6" />
            </svg>
          </span>
          <span className="lbl">{t('heroglyph.flow.stay.news')}</span>
        </button>
      )}

      {error && <p role="alert" className="hf-alert">{error}</p>}
      <div className="st-actions">
        {/* Výplň prehodená (Matej 26. 9. 2026): PLNÝ PRÍSTUP = plné lapis,
            POTVRDIŤ = priesvitné. Pod sebou: člen hore, potvrdenie dole. */}
        <button type="button" className="hf-cta" onClick={() => { track('stay_tier_chosen', { tier: 'member', dogs: dogs.length }); onMember(); }} disabled={busy}>
          {t('heroglyph.flow.stay.member')}
        </button>
        <button type="button" className="st-confirm" onClick={confirm} disabled={!tier || busy}>
          {busy ? t('payment.preparing') : t('heroglyph.flow.stay.confirm')}
        </button>
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

const STAY_CSS = `
.st-wrap { display: flex; flex-direction: column; gap: 12px; }
.st-speak h2 { font-size: 20px; }
.st-speak p { font-size: 14px; line-height: 1.45; }
@media (min-width: 601px) {
  .st-speak.hf-speak { padding: 16px 24px; gap: 24px; }
  .st-speak h2 { font-size: 24px; }
  .st-speak p { font-size: 16px; }
}
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
.st-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
/* Voľby väčšie (Matej 26. 9. 2026: *„tie možnosti zväčši"*). */
.st-opt.hf-pick { justify-content: center; padding: 16px 12px; gap: 12px; }
.st-opt .well { width: 48px; height: 48px; }
.st-opt .well img { width: 28px; height: 28px; object-fit: contain; }
.st-opt-name { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
.st-price { font-family: 'Cinzel', serif; font-weight: 700; font-size: 32px; line-height: 1.05; color: ${LAB.ink}; }
.st-opt-sub { font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${LAB.inkBody}; }
.st-opt.on .st-price, .st-opt.on .st-opt-sub { color: ${LAPIS.edge}; }
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
  .st-wrap { gap: 10px; }
  .st-speak.hf-speak { padding: 12px 20px; gap: 16px; }
  .st-speak h2 { font-size: 20px; }
  .st-speak p { font-size: 14px; }
}
@media (max-width: 600px) {
  .st-wrap { gap: 10px; }
  .st-speak.hf-speak { padding: 8px 12px; gap: 12px; }
  .st-speak h2 { font-size: 16px; }
  .st-speak p { font-size: 12px; line-height: 1.4; }
  .st-row, .st-profile { font-size: 14px; }
  .st-row small { font-size: 12px; }
  .st-mark { width: 18px; height: 18px; }
}
@media (max-width: 600px) and (max-height: 700px) {
  .st-wrap { gap: 6px; }
  .st-speak h2 { font-size: 14px; }
  .st-wrap .hf-chk { padding-top: 6px; padding-bottom: 6px; }
}
`;
