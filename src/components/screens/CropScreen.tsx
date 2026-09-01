import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import { CropArea, canvasCropAndUpload, BackNextButtons } from '@/components/screens/photoCrop';
import hekthorImg from '@/assets/hekthor.png';
import { useT } from '@/i18n/LanguageContext';
import { track } from '@/lib/analytics';
import { useFlowGuard } from '@/hooks/useFlowGuard';

// ── /heroglyph/crop — doladenie fotky do kruhu, až za skladaním heroglyfu.
//
// Vzniklo 28. 8. 2026. Predtým stál výrez v tom istom kroku ako nahrávanie: dva
// úkony naraz na najtvrdšej bráne flow. Nahrávanie ostalo prvým krokom, výrez
// prišiel sem — tesne pred odhalenie, kde fotku prvýkrát vidno v kartuši.
//
// Kto fotku preskočil, tento krok nedostane — preskočí sa rovno na odhalenie.
// Back: /heroglyph/dog-character  ·  Continue: /heroglyph/reveal
export function CropScreen() {
  const flowOk = useFlowGuard();
  const navigate = useNavigate();
  const t = useT();
  const sessionId = useDogyptStore((s) => s.sessionId);
  const dogPhotoUrl = useDogyptStore((s) => s.dogPhotoUrl);
  const setDogPhotoUrl = useDogyptStore((s) => s.setDogPhotoUrl);
  const setCloudinaryPublicId = useDogyptStore((s) => s.setCloudinaryPublicId);
  const setCertCropData = useDogyptStore((s) => s.setCertCropData);
  const setGridCropData = useDogyptStore((s) => s.setGridCropData);

  const [crop, setCrop] = useState({ x: 0, y: 0, zoom: 1 });
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      // Zdroj je tu už Cloudinary URL, nie blob — funkcia si sama nastaví
      // crossOrigin, inak by plátno bolo znečistené a uloženie by zlyhalo.
      const result = await canvasCropAndUpload(dogPhotoUrl, crop, sessionId);
      setCloudinaryPublicId(result.publicId);
      setDogPhotoUrl(result.secureUrl);
    } catch (err) {
      // Nepodarený výrez nesmie zastaviť flow — pôvodná fotka je použiteľná.
      console.error('[crop] výrez zlyhal, ostáva pôvodná fotka:', err);
    }
    setCertCropData(crop);
    setGridCropData(crop);
    track('photo_cropped');
    navigate('/heroglyph/reveal');
  };

  // Bez fotky nie je čo orezávať — krok sa preskočí, ako keby nebol.
  // Presmerovanie patrí do efektu: volanie navigate priamo v tele komponentu
  // mení stav routera počas vykresľovania a React na to nadáva.
  useEffect(() => {
    if (flowOk && !dogPhotoUrl) navigate('/heroglyph/reveal', { replace: true });
  }, [flowOk, dogPhotoUrl, navigate]);

  if (!flowOk || !dogPhotoUrl) return null;

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar onBack={() => navigate('/heroglyph/dog-character')} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0">

          <div
            className="w-full rounded-2xl flex-shrink overflow-hidden"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <div className="px-4 py-5 md:p-6 flex flex-col items-center gap-2">
              <img src={hekthorImg} alt="HEKTHOR" className="w-20 h-20 md:w-28 md:h-28 object-contain" />
              <h2
                className="text-lg md:text-2xl font-bold uppercase tracking-wider text-center text-white drop-shadow-sm"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('heroglyph.flow.photo.adjustTitle')}
              </h2>
              <p
                className="text-white/70 text-sm text-center"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t('heroglyph.flow.photo.adjustHint')}
              </p>
            </div>
          </div>

          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex flex-col gap-2 md:gap-3 items-center">
              <CropArea src={dogPhotoUrl} shape="circle" value={crop} onChange={setCrop} />
              <BackNextButtons
                onBack={() => navigate('/heroglyph/dog-character')}
                onNext={finish}
                nextDisabled={saving}
                backLabel={t('heroglyph.flow.photo.back')}
                nextLabel={saving ? t('heroglyph.flow.photo.saving') : t('heroglyph.flow.photo.next')}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
