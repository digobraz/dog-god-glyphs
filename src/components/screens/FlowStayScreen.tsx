import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { PageTopBar } from '@/components/PageTopBar';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS } from '@/components/screens/flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS } from '@/components/screens/flowMedallion';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_R } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { hekthorFace } from '@/lib/hekthorFaces';
import { readSvorka, PRICE_MEMBER } from '@/lib/flowSvorka';
import { track } from '@/lib/analytics';

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
// 🚩 €3 A €0 ZATIAĽ NIČ NEZAPÍŠU. Chýba stav psa v DB („podporovateľ" /
//    „hosť"), stena (`get-grid-dogs` filtruje `paid`) a schvaľovanie fotiek
//    (otvorená otázka: AINUBIS alebo Matej). Kým to nie je, POTVRDIŤ pri nich
//    povie pravdu v hláške, nie ticho. €11 vráti do pokladne.
// ════════════════════════════════════════════════════════════════════════════

type Tier = 'member' | 'support' | 'guest';
const TIERS: { id: Tier; icon: string; price: string }[] = [
  { id: 'member', icon: '/icons/pack/badge.svg', price: `€${PRICE_MEMBER}` },
  { id: 'support', icon: '/icons/mission/heartpaw.svg', price: '€3' },
  { id: 'guest', icon: '/icons/heroglyph-page/wall-grid-gold.svg', price: '€0' },
];

export function FlowStayScreen() {
  const navigate = useNavigate();
  const t = useT();
  const flowOk = useFlowGuard();
  const dogs = useMemo(() => readSvorka(), []);
  const [tier, setTier] = useState<Tier | null>(null);
  const [news, setNews] = useState(false);
  const [notReady, setNotReady] = useState(false);
  /** Nízke okno (SE, Matejovo PC): bublina ustúpi skôr než doska s voľbami. */
  const low = typeof window !== 'undefined' && window.innerHeight < 740;

  const confirm = () => {
    if (!tier) return;
    track('stay_tier_chosen', { tier, dogs: dogs.length, news });
    if (tier === 'member') { navigate('/checkout'); return; }
    setNotReady(true);
  };

  if (!flowOk) return null;

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
                        onClick={() => { setTier(x.id); setNotReady(false); }}
                      >
                        <span className="well"><img src={x.icon} alt="" /></span>
                        <span className="tx">{t(`heroglyph.flow.stay.${x.id}.t`)}</span>
                        <span className="st-price">{x.price}</span>
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

              {notReady && <p role="alert" className="hf-alert">{t('heroglyph.flow.stay.notReady')}</p>}
              <button type="button" className="hf-cta" onClick={confirm} disabled={!tier}>
                {t('heroglyph.flow.stay.confirm')}
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
.st-price { flex: 0 0 auto; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; color: ${LAB.ink}; }
/* Vybraný blok = MOJA VOĽBA ⇒ lapisový tint, nie plná plocha (tá patrí CTA). */
.st-item.on .st-pick { border-color: ${LAPIS.edge}; background: linear-gradient(${LAPIS.fill}, ${LAPIS.fill}), linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%); }
.st-item.on .st-pick .tx, .st-item.on .st-price { color: ${LAPIS.edge}; }
.st-desc {
  margin: 0; overflow: hidden; padding: 8px 12px 0 56px;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45; color: ${LAB.inkBody};
}
.st-stack .hf-chk { border-radius: ${PACK_R.tile}px; }
`;
