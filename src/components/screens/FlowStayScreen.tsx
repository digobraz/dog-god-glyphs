import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useDogyptStore } from '@/store/dogyptStore';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { PageTopBar } from '@/components/PageTopBar';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS } from '@/components/screens/flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS } from '@/components/screens/flowMedallion';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_R } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { hekthorFace } from '@/lib/hekthorFaces';
import {
  readSvorka, svorkaDogPayload, waitForStablePhotos, PRICE_MEMBER, PRICE_SUPPORT,
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
// ════════════════════════════════════════════════════════════════════════════

type Tier = 'member' | 'support' | 'guest';
const TIERS: { id: Tier; icon: string; each: number }[] = [
  { id: 'member', icon: '/icons/pack/badge.svg', each: PRICE_MEMBER },
  { id: 'support', icon: '/icons/mission/heartpaw.svg', each: PRICE_SUPPORT },
  { id: 'guest', icon: '/icons/heroglyph-page/wall-grid-gold.svg', each: 0 },
];

export function FlowStayScreen() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const [params] = useSearchParams();
  /** Návrat zo Stripe po €3 — store je prázdny, obrazovka len poďakuje. */
  const paidReturn = params.get('paid') === 'support';
  const flowOk = useFlowGuard(!paidReturn);
  const dogs = useMemo(() => readSvorka(), []);
  const email = useDogyptStore((s) => s.email);
  const ownerName = useDogyptStore((s) => s.ownerName);
  const extraPhotos = useDogyptStore((s) => s.extraPhotos);
  const [tier, setTier] = useState<Tier | null>(null);
  const [news, setNews] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<'support' | 'guest' | null>(paidReturn ? 'support' : null);
  const n = Math.max(1, dogs.length);
  /** Nízke okno (SE, Matejovo PC): bublina ustúpi skôr než doska s voľbami. */
  const low = typeof window !== 'undefined' && window.innerHeight < 740;

  const confirm = async () => {
    if (!tier || busy) return;
    track('stay_tier_chosen', { tier, dogs: dogs.length, news });
    if (tier === 'member') { navigate('/checkout'); return; }
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
        setDone('guest');
        setBusy(false);
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

  if (!flowOk) return null;

  // ── HOTOVO: €0 zapísané alebo €3 zaplatené ────────────────────────────────
  if (done) {
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

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}{STAY_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/checkout')} />
      </div>

      <div className="hf-stage">
        <div className="w-full max-w-xl flex flex-col items-center">
          <motion.div
            className="hf-speak st-speak"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <FlowMedallion src={hekthorFace('stay')} size={low ? 48 : 72} />
            <span className="say">
              <h2>
                {t('heroglyph.flow.stay.titlePrefix')}
                <b>{t('heroglyph.flow.stay.titleWord')}</b>
                {t('heroglyph.flow.stay.titleSuffix')}
              </h2>
              <p>{t('heroglyph.flow.stay.sub')}</p>
            </span>
          </motion.div>

          <motion.div
            className="hf-block hf-carved st-stack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            <div className="hf-plate">
              <div className="st-list" role="radiogroup">
                {TIERS.map((x) => {
                  const on = tier === x.id;
                  return (
                    <div key={x.id} className={`st-item${on ? ' on' : ''}`}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className="hf-pick st-pick"
                        onClick={() => { setTier(x.id); setError(null); }}
                      >
                        <span className="well"><img src={x.icon} alt="" /></span>
                        <span className="tx">{t(`heroglyph.flow.stay.${x.id}.t`)}</span>
                        <span className="st-price">
                          €{x.each * n}
                          {/* Svorka: z čoho súčet vznikol — cena je ZA PSA. */}
                          {n > 1 && x.each > 0 && <small>{n} × €{x.each}</small>}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.p
                            className="st-desc"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            {t(`heroglyph.flow.stay.${x.id}.d`)}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Novinky sú marketing ⇒ výslovný súhlas (krok 4 sľúbil e-mail len
                  na „nech sa ti dizajn nestratí"). Len pri €3 a €0 — člen ich
                  dostáva ako súčasť členstva. */}
              {tier && tier !== 'member' && (
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
              <button type="button" className="hf-cta" onClick={confirm} disabled={!tier || busy}>
                {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : t('heroglyph.flow.stay.confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const STAY_CSS = `
.st-speak { margin-bottom: 4px; }
@media (max-height: 739px) {
  .st-speak h2 { font-size: 20px; }
  .st-stack .hf-plate { padding: 14px 16px; gap: 8px; }
  .st-desc { padding-top: 4px; font-size: 12px; }
}
.st-stack .hf-plate { gap: 12px; }
.st-list { display: flex; flex-direction: column; gap: 8px; }
.st-pick .well img { width: 22px; height: 22px; object-fit: contain; }
.st-pick .tx { flex: 1 1 auto; }
.st-price { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; color: ${LAB.ink}; }
.st-price small { font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 10px; letter-spacing: .02em; color: ${LAB.inkBody}; }
.st-done-cta { margin-top: 16px; max-width: 320px; }
/* Vybraný blok = MOJA VOĽBA ⇒ lapisový tint, nie plná plocha (tá patrí CTA). */
.st-item.on .st-pick { border-color: ${LAPIS.edge}; background: linear-gradient(${LAPIS.fill}, ${LAPIS.fill}), linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%); }
.st-item.on .st-pick .tx, .st-item.on .st-price { color: ${LAPIS.edge}; }
.st-desc {
  margin: 0; overflow: hidden; padding: 8px 12px 0 56px;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45; color: ${LAB.inkBody};
}
.st-stack .hf-chk { border-radius: ${PACK_R.tile}px; }
`;
