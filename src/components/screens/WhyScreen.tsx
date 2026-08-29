import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageTopBar } from '@/components/PageTopBar';
import { useT } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { track } from '@/lib/analytics';
import { FLOW_PALE_CSS } from './flowPaleSkin';
import glyphImg from '@/assets/hekthor-heroglyph.png';
import cleopatraImg from '@/assets/cleopatra-cartouche.png';

// ── /heroglyph/why — jediná obrazovka vstupu, ktorá NIČ NEPÝTA.
//
// Vzniklo 28. 8. 2026 podľa LABu (`plany/lab-heroflow-2026-08-28.html`, obrazovka `why`).
// Stojí medzi e-mailom a papierovačkami zámerne: dovtedy človek dal tri veci
// (fotku, meno, adresu) a ešte nevie, na čo. Ďalej ho čaká trinásť otázok o psovi —
// tie sa vypĺňajú inak, keď vieš, do čoho idú.
//
// ⚠️ Vysvetlenie kartuše NEVZNIKLO TU. Je to ten istý text, ktorý vo flow už beží —
// `heroglyph.flow.ownerFinal.infoBody` + Kleopatrina kartuša na `OwnerFinalScreen`,
// kde ho ale dostaneš len po kliknutí na bodku s „i", teda takmer nikto.
// Kľúče sa preto NEDUPLIKUJÚ, obrazovka si ich požičiava.
// 🚩 Otvorené pre Mateja: má tá bodka na `OwnerFinalScreen` zostať, alebo tam
//    vysvetlenie zaniká, keď ho každý dostane už tu? (LAB hovorí „sťahuje sa sem“,
//    ale odobrať niečo z bežiacej obrazovky nie je moje rozhodnutie.)
//
// Back: /heroglyph/email  ·  Continue: /heroglyph/about
export function WhyScreen() {
  const flowOk = useFlowGuard();
  const navigate = useNavigate();
  const t = useT();

  const go = () => {
    track('flow_why_continue');
    navigate('/heroglyph/about');
  };

  if (!flowOk) return null;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/email')} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center">

          <motion.div
            className="hf-bubble"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h2>{t('heroglyph.flow.why.title')}</h2>
            <p>{t('heroglyph.flow.why.sub')}</p>
          </motion.div>

          <motion.div
            className="hf-block"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="hf-plate">
              {/* Hektorov hotový heroglyf — ukážka, nie sľub konkrétneho tvaru. */}
              <div className="hf-glyphdemo">
                <img src={glyphImg} alt="" />
              </div>

              <p className="hf-note">{t('heroglyph.flow.why.note')}</p>

              {/* Dôkaz, že to nie je vymyslené: kartuša skutočnej Kleopatry.
                  Ten istý obrázok aj popisok, aké nesie OwnerFinalScreen. */}
              <figure className="m-0 flex flex-col items-center gap-1.5">
                <img
                  src={cleopatraImg}
                  alt={t('heroglyph.flow.ownerFinal.cleopatraAlt')}
                  className="w-full max-w-[150px] object-contain"
                />
                <figcaption className="hf-note">
                  {t('heroglyph.flow.ownerFinal.cleopatraCaption')}
                </figcaption>
              </figure>

              <button type="button" className="hf-cta" onClick={go}>
                {t('heroglyph.flow.name.continue')}
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
