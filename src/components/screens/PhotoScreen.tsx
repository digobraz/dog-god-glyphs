import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import imageCompression from 'browser-image-compression';
import hekthorImg from '@/assets/hekthor.png';
import { uploadMainPhoto, uploadExtraPhoto } from '@/services/cloudinaryService';
import { useT } from '@/i18n/LanguageContext';
import { track } from '@/lib/analytics';

/* ───── helpers ───── */

async function compressFile(file: File): Promise<{ url: string; blob: Blob }> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1200,
    fileType: 'image/webp',
    initialQuality: 0.85,
    useWebWorker: true,
    exifOrientation: 1,
  });
  return { url: URL.createObjectURL(compressed), blob: compressed };
}

function getImageDimensions(url: string): Promise<{ w: number; h: number }> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => res({ w: 0, h: 0 });
    img.src = url;
  });
}

/* ───── Canvas crop helper ───── */




/* ───── MAIN COMPONENT ───── */
type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export function PhotoScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const sessionId = useDogyptStore((s) => s.sessionId);
  const setDogPhotoUrl = useDogyptStore((s) => s.setDogPhotoUrl);
  const setCloudinaryPublicId = useDogyptStore((s) => s.setCloudinaryPublicId);
  const setCloudinaryExtraPublicIds = useDogyptStore((s) => s.setCloudinaryExtraPublicIds);
  const setExtraPhotos = useDogyptStore((s) => s.setExtraPhotos);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [lowRes, setLowRes] = useState(false);
  const [extras, setExtras] = useState<string[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const extraPublicIds = useRef<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const extraRef = useRef<HTMLInputElement>(null);


  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const { url, blob } = await compressFile(file);
    // Replacing an already-picked photo ("Change photo") — revoke the old blob,
    // it's being swapped for a brand new one and the store is about to point
    // at the new url anyway.
    if (photoUrl?.startsWith('blob:')) URL.revokeObjectURL(photoUrl);
    const dims = await getImageDimensions(url);
    setLowRes(dims.w < 1500 && dims.h < 1500);
    setPhotoUrl(url);
    setDogPhotoUrl(url);
    e.target.value = '';

    // Upload to Cloudinary — stable HTTPS URL replaces blob in store so
    // post-Stripe-redirect rendering (cert PDF, /welcome card, grid reveal)
    // doesn't deadlock on dead blob URLs.
    setUploadState('uploading');
    uploadMainPhoto(blob, sessionId)
      .then(({ publicId, secureUrl }) => {
        setCloudinaryPublicId(publicId);
        setDogPhotoUrl(secureUrl);
        setUploadState('done');
      })
      .catch(() => setUploadState('error'));
  };

  const retryMainUpload = async () => {
    if (!photoUrl) return;
    try {
      const res = await fetch(photoUrl);
      const blob = await res.blob();
      setUploadState('uploading');
      const { publicId, secureUrl } = await uploadMainPhoto(blob, sessionId);
      setCloudinaryPublicId(publicId);
      setDogPhotoUrl(secureUrl);
      setUploadState('done');
    } catch {
      setUploadState('error');
    }
  };

  const handleExtraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { url, blob } = await compressFile(file);
    const nextIndex = extras.length;
    if (nextIndex >= 3) {
      // Already at the 3-extra-photo cap — this blob is never stored/rendered.
      URL.revokeObjectURL(url);
    }
    setExtras((p) => (p.length < 3 ? [...p, url] : p));
    e.target.value = '';

    uploadExtraPhoto(blob, sessionId, nextIndex + 1)
      .then(({ publicId }) => {
        extraPublicIds.current = [...extraPublicIds.current, publicId];
      })
      .catch(() => {/* extras upload failure is non-blocking */});
  };

  // Výrez sa 28. 8. 2026 presunul na /heroglyph/crop — tento krok fotku len prevezme.
  // Cloudinary upload beží na pozadí z handleUpload; tu sa naň zámerne NEČAKÁ,
  // aby človeka nedržala priebežná sieť.
  const goNext = (withPhoto: boolean) => {
    setExtraPhotos(extras);
    setCloudinaryExtraPublicIds(extraPublicIds.current);
    if (withPhoto) track('photo_uploaded');
    else track('photo_skipped');
    navigate('/heroglyph/name');
  };

  /* ───── Sub-screen renderers ───── */

  const renderUpload = () => (
    <>
      {/* hidden file input lives here so it persists */}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </>
  );



  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <PageTopBar onBack={() => navigate('/')} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0 flex-1">
          <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col flex-1 min-h-0 w-full gap-3 md:gap-4 justify-center"
              >
                {/* BLOCK 1 — dark gradient speech bubble */}
                <div
                  className="w-full rounded-2xl flex-shrink overflow-hidden"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  <div className="px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4">
                    <img src={hekthorImg} alt="HEKTHOR" className="w-36 h-36 md:w-56 md:h-56 object-contain" />
                    <p
                      className="text-white text-center text-lg md:text-2xl leading-snug drop-shadow-sm"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {t('heroglyph.flow.photo.faceOfGodPrefix') && <>{t('heroglyph.flow.photo.faceOfGodPrefix')} </>}<span className="font-bold text-amber-300">{t('heroglyph.flow.photo.faceOfGodWord')}</span> {t('heroglyph.flow.photo.faceOfGodSuffix')}
                    </p>
                    <p
                      className="text-white/70 text-sm text-center"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {t('heroglyph.flow.photo.uploadHint', { dogName: dogName || t('heroglyph.flow.photo.yourDog') })}
                    </p>
                  </div>
                </div>


                {/* BLOCK 2 — cream/papyrus card */}
                <motion.div
                  className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  <div className="flex flex-col gap-2 md:gap-3">
                    {!photoUrl ? (
                      <div
                        className="w-full rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/60 transition-colors py-6"
                        style={{ border: '2px dashed hsl(var(--gold) / 0.4)' }}
                        onClick={() => fileRef.current?.click()}
                      >
                        <Upload size={36} color="hsl(39 55% 51%)" strokeWidth={1.5} />
                        <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {t('heroglyph.flow.photo.tapToUpload')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid hsl(var(--gold))' }}>
                          <img src={photoUrl} alt="Dog" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-xs text-foreground truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{fileName}</span>
                          <button className="text-[10px] underline text-muted-foreground self-start" onClick={() => fileRef.current?.click()}>
                            {t('heroglyph.flow.photo.changePhoto')}
                          </button>
                          {uploadState === 'uploading' && (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'hsl(var(--gold) / 0.7)', fontFamily: "'Space Grotesk', sans-serif" }}>
                              <Loader2 className="h-3 w-3 animate-spin" /> {t('heroglyph.flow.photo.sealing')}
                            </span>
                          )}
                          {uploadState === 'done' && (
                            <span className="text-[10px] text-green-500/80" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t('heroglyph.flow.photo.sealed')}</span>
                          )}
                          {uploadState === 'error' && (
                            <button
                              onClick={retryMainUpload}
                              className="text-[10px] underline text-red-400/80 self-start"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                              {t('heroglyph.flow.photo.uploadFailed')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <p
                      className="text-[10px] md:text-[11px] text-center leading-snug px-2"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'hsl(39 40% 60%)' }}
                    >
                      <span className="inline text-green-600/70 mr-0.5">✓</span> {t('heroglyph.flow.photo.tipForward')}
                      {' · '}
                      <span className="inline text-red-400/70 mr-0.5">✗</span> {t('heroglyph.flow.photo.tipSide')}
                      <br />
                      {t('heroglyph.flow.photo.tipBest')}
                    </p>

                    <Button
                      onClick={() => goNext(true)}
                      disabled={!photoUrl}
                      className="w-full rounded-xl h-10 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100 text-xs"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                        color: '#000',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                      }}
                    >
                      {t('heroglyph.flow.photo.next')}
                    </Button>

                    {/* Preskočenie — fotka je najtvrdšia brána vo flow (zo 83 ľudí ju
                        nahralo 42). Doplniť sa dá kedykoľvek neskôr v /pack, vrátane
                        prepečenia certifikátu aj karty na stenu. */}
                    <button
                      type="button"
                      onClick={() => goNext(false)}
                      className="text-center text-[11px] tracking-wide underline decoration-dotted"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(14,14,14,0.55)' }}
                    >
                      {t('heroglyph.flow.photo.skip')}
                    </button>
                  </div>
                </motion.div>

                {/* file input */}
                {renderUpload()}
              </motion.div>
          </div>
      </div>
    </div>
  );
}