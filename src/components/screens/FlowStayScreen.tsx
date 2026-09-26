import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useDogyptStore } from '@/store/dogyptStore';
import { useFlowGuard } from '@/hooks/useFlowGuard';
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
// ════════════════════════════════════════════════════════════════════════════

type Tier = 'support' | 'guest';
type Feat = 'wall' | 'msg' | 'noMsg' | 'num' | 'pack' | 'design';
/** Čo voľba dá (✓) a čo nie (✗) — Matej 26. 9. 2026 doslova. */
const OPTS: { id: Tier; each: number; feats: [Feat, boolean][] }[] = [
  { id: 'support', each: PRICE_SUPPORT, feats: [['wall', true], ['msg', true], ['num', false], ['pack', false], ['design', false]] },
  { id: 'guest', each: 0, feats: [['wall', true], ['noMsg', false], ['num', false], ['pack', false], ['design', false]] },
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
              {/* Dve voľby VEDĽA SEBA so zoznamom ✓/✗ (Matej 26. 9. 2026). Členstvo
                  tu nie je blokom — človek od neho práve prišiel, vedie k nemu
                  obrysové tlačidlo vedľa HOTOVO. */}
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
                      <span className="st-opt-head">
                        <span className="st-opt-t">{t(`heroglyph.flow.stay.${x.id}.t`)}</span>
                        <span className="st-opt-sub">{t(`heroglyph.flow.stay.${x.id}.sub`)}</span>
                        <span className="st-price">
                          €{x.each * n}
                          <small>{n > 1 ? `${n} × €${x.each}` : x.each > 0 ? t('heroglyph.flow.stay.perDog') : '\u00a0'}</small>
                        </span>
                      </span>
                      <ul className="st-feats">
                        {x.feats.map(([k, yes]) => (
                          <li key={k} className={yes ? 'yes' : 'no'}>
                            <Mark yes={yes} />
                            <span>
                              {t(`heroglyph.flow.stay.f.${k}`)}
                              {k === 'pack' && <small>{t('heroglyph.flow.stay.f.packSub')}</small>}
                            </span>
                          </li>
                        ))}
                      </ul>
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
              <p className="hf-legend st-rule" aria-hidden />
              <div className="st-actions">
                <button type="button" className="st-member" onClick={() => { track('stay_tier_chosen', { tier: 'member', dogs: dogs.length }); navigate('/checkout'); }} disabled={busy}>
                  {t('heroglyph.flow.stay.member')}
                </button>
                <button type="button" className="hf-cta" onClick={confirm} disabled={!tier || busy}>
                  {busy ? t('payment.preparing') : t('heroglyph.flow.stay.confirm')}
                </button>
              </div>
            </div>
          </motion.div>
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

const STAY_CSS = `
.st-speak { margin-bottom: 4px; }
.st-speak p { font-size: 14px; line-height: 1.45; }
}
.st-stack .hf-plate { gap: 12px; }
.st-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.st-opt.hf-pick { flex-direction: column; align-items: stretch; gap: 8px; padding: 12px; height: 100%; }
.st-opt-head { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
.st-opt-t { font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; letter-spacing: .06em; text-transform: uppercase; color: ${LAB.ink}; }
.st-opt-sub { font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: ${LAB.inkBody}; }
.st-price { display: flex; flex-direction: column; align-items: center; font-family: 'Cinzel', serif; font-weight: 700; font-size: 24px; line-height: 1.1; color: ${LAB.ink}; }
.st-price small { font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 10px; letter-spacing: .02em; color: ${LAB.inkBody}; }
.st-opt.on .st-opt-t, .st-opt.on .st-price { color: ${LAPIS.edge}; }
.st-feats { list-style: none; margin: 0; padding: 8px 0 0; border-top: 1px solid rgba(179, 130, 45, .35); display: flex; flex-direction: column; gap: 4px; }
.st-feats li { display: flex; align-items: flex-start; gap: 4px; font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.3; color: ${LAB.ink}; text-align: left; }
.st-feats li.no { color: ${LAB.inkBody}; }
.st-feats li small { display: block; font-size: 10px; color: ${LAB.inkBody}; }
.st-mark { flex: none; width: 14px; height: 14px; margin-top: 1px; }
.st-feats li.yes .st-mark { stroke: #3D7A4E; }
.st-feats li.no .st-mark { stroke: #B25640; }
.st-rule { gap: 0; margin: 0; }
/* Rovnaký rad ako pokladňa: obrysové vľavo, plné CTA vpravo bližšie k palcu. */
.st-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.st-actions .hf-cta { width: 100%; }
.st-member {
  height: ${HF.cta.h}px; border-radius: ${HF.cta.radius}px; cursor: pointer;
  border: 1.5px solid ${LAPIS.edge}; background: transparent; color: ${LAPIS.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: .04em; text-transform: uppercase; line-height: 1.15; padding: 0 8px;
  transition: background .18s;
}
.st-member:hover:not(:disabled) { background: ${LAPIS.fill}; }
.st-member:disabled { opacity: .4; cursor: default; }
.st-done-cta { margin-top: 16px; max-width: 320px; }
.st-stack .hf-chk { border-radius: ${PACK_R.tile}px; }
/* Nízke okno (SE, Matejovo PC) — AŽ NA KONCI, inak ho základné pravidlá prebijú. */
@media (max-height: 739px) {
  .st-speak h2 { font-size: 20px; }
  .st-speak p { font-size: 12px; }
  .st-stack .hf-plate { padding: 12px 16px; gap: 8px; }
  .st-opt.hf-pick { padding: 8px; gap: 4px; }
  .st-opt-head { gap: 0; }
  .st-price { font-size: 20px; }
  .st-feats { gap: 2px; padding-top: 4px; }
  .st-feats li small { display: none; }
  .st-stack .hf-chk { padding-top: 8px; padding-bottom: 8px; }
}
`;
