import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, X, Loader2 } from 'lucide-react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Checkbox } from '@/components/ui/checkbox';
import { PageTopBar } from '@/components/PageTopBar';
import imageCompression from 'browser-image-compression';
import hekthorImg from '@/assets/hekthor.png';
import { uploadMainPhoto, uploadCroppedPhoto, uploadExtraPhoto } from '@/services/cloudinaryService';
import { useT } from '@/i18n/LanguageContext';
import { track } from '@/lib/analytics';
import { useFlowGuard } from '@/hooks/useFlowGuard';

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
// CSS reference size must match the CropArea container (260px).
// OUT is the actual saved image size — larger = better quality for cert PDF.
async function canvasCropAndUpload(
  photoUrl: string,
  crop: { x: number; y: number; zoom: number },
  sessionId: string,
): Promise<{ publicId: string; secureUrl: string }> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = photoUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('img-load'));
  });

  const REF = 260; // matches CropArea container CSS size
  const OUT = 800; // saved image resolution
  const canvas = document.createElement('canvas');
  canvas.width = OUT;
  canvas.height = OUT;
  const ctx = canvas.getContext('2d')!;

  const { naturalWidth: nW, naturalHeight: nH } = img;
  const sCover = Math.max(REF / nW, REF / nH);
  const offX = (nW * sCover - REF) / 2;
  const offY = (nH * sCover - REF) / 2;
  const half = REF / 2;
  const tx = REF * crop.x / 100;
  const ty = REF * crop.y / 100;

  // Inverse CSS: translate(tx%, ty%) scale(zoom) with transform-origin at center
  const ix0 = (0 - half - tx) / crop.zoom + half;
  const ix1 = (REF - half - tx) / crop.zoom + half;
  const iy0 = (0 - half - ty) / crop.zoom + half;

  const srcX = (ix0 + offX) / sCover;
  const srcY = (iy0 + offY) / sCover;
  const srcW = (ix1 - ix0) / sCover;

  ctx.drawImage(img, srcX, srcY, srcW, srcW, 0, 0, OUT, OUT);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/webp', 0.92),
  );

  // Use main_crop public_id to avoid conflict with the original main upload
  return uploadCroppedPhoto(blob, sessionId);
}

/* ───── slide variants ───── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

/* ───── Crop component ───── */
function CropArea({
  src,
  shape,
  overlayCircle,
  value,
  onChange,
}: {
  src: string;
  shape: 'circle' | 'square';
  overlayCircle?: boolean;
  value: { x: number; y: number; zoom: number };
  onChange: (v: { x: number; y: number; zoom: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: value.x, oy: value.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    const dx = ((e.clientX - dragStart.current.x) / size) * 100;
    const dy = ((e.clientY - dragStart.current.y) / size) * 100;
    const maxOffset = (value.zoom - 1) * 50;
    onChange({
      ...value,
      x: clamp(dragStart.current.ox + dx, -maxOffset, maxOffset),
      y: clamp(dragStart.current.oy + dy, -maxOffset, maxOffset),
    });
  };

  const handlePointerUp = () => {
    dragStart.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const newZoom = clamp(value.zoom - e.deltaY * 0.002, 1, 4);
    const maxOffset = (newZoom - 1) * 50;
    onChange({
      x: clamp(value.x, -maxOffset, maxOffset),
      y: clamp(value.y, -maxOffset, maxOffset),
      zoom: newZoom,
    });
  };

  const maskStyle =
    shape === 'circle'
      ? { clipPath: 'circle(50% at 50% 50%)' }
      : {};

  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-h-0">
      <div
        ref={containerRef}
        className="relative overflow-hidden touch-none cursor-grab active:cursor-grabbing w-[260px] h-[260px] flex-shrink-0"
        style={{
          border: '2px dashed hsl(var(--gold) / 0.5)',
          borderRadius: shape === 'square' ? '0.75rem' : '50%',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <img
          src={src}
          alt="crop"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{
            transform: `translate(${value.x}%, ${value.y}%) scale(${value.zoom})`,
          }}
        />
        {overlayCircle && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '50%',
              border: '2px dashed hsl(var(--gold) / 0.8)',
              boxShadow: 'inset 0 0 0 9999px hsl(0 0% 0% / 0.35)',
            }}
          />
        )}
      </div>
      {/* zoom slider */}
      <input
        type="range"
        min={100}
        max={400}
        value={value.zoom * 100}
        onChange={(e) => {
          const z = Number(e.target.value) / 100;
          const maxOffset = (z - 1) * 50;
          const cl = (v: number) => clamp(v, -maxOffset, maxOffset);
          onChange({ x: cl(value.x), y: cl(value.y), zoom: z });
        }}
        className="w-full max-w-[200px] accent-[hsl(var(--gold))]"
      />
    </div>
  );
}

/* ───── Preview thumbnail ───── */
function CropPreview({
  src,
  crop,
  shape,
  label,
}: {
  src: string;
  crop: { x: number; y: number; zoom: number };
  shape: 'circle' | 'square';
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div
        className="w-14 h-14 overflow-hidden"
        style={{
          borderRadius: shape === 'circle' ? '50%' : '0.375rem',
          border: '1px solid hsl(var(--gold) / 0.3)',
        }}
      >
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover"
          style={{
            transform: `translate(${crop.x}%, ${crop.y}%) scale(${crop.zoom})`,
          }}
        />
      </div>
      <span
        className="text-[10px] text-muted-foreground"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ───── Dots (tappable) ───── */
function Dots({ total, current, onDot }: { total: number; current: number; onDot?: (i: number) => void }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-colors cursor-pointer"
          onClick={() => onDot?.(i)}
          style={{
            backgroundColor: i === current ? 'hsl(var(--gold))' : 'transparent',
            border: '1.5px solid hsl(var(--gold))',
          }}
        />
      ))}
    </div>
  );
}

/* ───── Back / Next button pair ───── */
function BackNextButtons({
  onBack,
  onNext,
  backDisabled,
  nextDisabled,
  backLabel = 'BACK',
  nextLabel = 'NEXT',
}: {
  onBack: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  backLabel?: string;
  nextLabel?: string;
}) {
  const common = "flex-1 rounded-xl h-10 font-bold tracking-wider transition-transform disabled:opacity-40 disabled:hover:scale-100 text-xs";
  return (
    <div className="flex gap-2 w-full">
      <Button
        onClick={onBack}
        disabled={backDisabled}
        className={`${common} hover:scale-105 border-2`}
        style={{
          fontFamily: "'Cinzel', serif",
          background: 'transparent',
          borderColor: 'hsl(var(--gold) / 0.5)',
          color: 'hsl(var(--gold))',
        }}
      >
        {backLabel}
      </Button>
      <Button
        onClick={onNext}
        disabled={nextDisabled}
        className={`${common} hover:scale-105`}
        style={{
          fontFamily: "'Cinzel', serif",
          background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
          color: '#000',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
        }}
      >
        {nextLabel}
      </Button>
    </div>
  );
}

/* ───── MAIN COMPONENT ───── */
type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export function PhotoScreen() {
  const navigate = useNavigate();
  const t = useT();
  const flowOk = useFlowGuard();
  const dogName = useDogyptStore((s) => s.dogName);
  const sessionId = useDogyptStore((s) => s.sessionId);
  const setDogPhotoUrl = useDogyptStore((s) => s.setDogPhotoUrl);
  const setCloudinaryPublicId = useDogyptStore((s) => s.setCloudinaryPublicId);
  const setCloudinaryExtraPublicIds = useDogyptStore((s) => s.setCloudinaryExtraPublicIds);
  const setCertCropData = useDogyptStore((s) => s.setCertCropData);
  const setGridCropData = useDogyptStore((s) => s.setGridCropData);
  const setExtraPhotos = useDogyptStore((s) => s.setExtraPhotos);
  const setGdprConsent = useDogyptStore((s) => s.setGdprConsent);

  const [sub, setSub] = useState(0);
  const [dir, setDir] = useState(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [lowRes, setLowRes] = useState(false);
  const [certCrop, setCertCrop] = useState({ x: 0, y: 0, zoom: 1 });
  const [finishing, setFinishing] = useState(false);
  const [extras, setExtras] = useState<string[]>([]);
  const [gdpr, setGdpr] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const extraPublicIds = useRef<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const extraRef = useRef<HTMLInputElement>(null);
  const cropApplied = useRef(false);

  const goTo = (next: number) => {
    setDir(next > sub ? 1 : -1);
    setSub(next);
  };

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
        if (cropApplied.current) return; // canvas crop already set a newer URL
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

  const finish = async () => {
    setFinishing(true);
    try {
      const result = await canvasCropAndUpload(photoUrl!, certCrop, sessionId!);
      cropApplied.current = true;
      setCloudinaryPublicId(result.publicId);
      setDogPhotoUrl(result.secureUrl);
    } catch (err) {
      console.error('[photo] crop upload failed — using original:', err);
    }
    setCertCropData(certCrop);
    setGridCropData(certCrop);
    setExtraPhotos(extras);
    setCloudinaryExtraPublicIds(extraPublicIds.current);
    setGdprConsent(gdpr);
    track('photo_uploaded');
    navigate('/heroglyph/breed');
  };

  /* ───── Sub-screen renderers ───── */

  const renderUpload = () => (
    <>
      {/* hidden file input lives here so it persists */}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </>
  );

  const renderCrop = () => (
    <>
      {photoUrl && (
        <CropArea src={photoUrl} shape="circle" value={certCrop} onChange={setCertCrop} />
      )}
      <BackNextButtons
        onBack={() => goTo(0)}
        onNext={finish}
        nextDisabled={finishing}
        backLabel={t('heroglyph.flow.photo.back')}
        nextLabel={finishing ? t('heroglyph.flow.photo.saving') : t('heroglyph.flow.photo.next')}
      />
    </>
  );

  const renderExtras = () => (
    <>
      <div className="flex gap-3 justify-center w-full">
        {Array.from({ length: 3 }).map((_, i) => {
          const url = extras[i];
          return (
            <div
              key={i}
              className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              style={{
                border: '2px dashed hsl(var(--gold) / 0.35)',
                background: url ? 'transparent' : 'hsl(var(--gold) / 0.05)',
              }}
              onClick={() => {
                if (!url && extras.length <= i) extraRef.current?.click();
              }}
            >
              {url ? (
                <div className="relative w-full h-full">
                  <img src={url} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
                      setExtras((p) => p.filter((_, j) => j !== i));
                    }}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <Plus className="h-5 w-5" style={{ color: 'hsl(var(--gold) / 0.5)' }} />
              )}
            </div>
          );
        })}
      </div>

      <input ref={extraRef} type="file" accept="image/*" onChange={handleExtraUpload} className="hidden" />

      <BackNextButtons
        onBack={() => goTo(1)}
        onNext={finish}
        nextDisabled={finishing}
        backLabel={t('heroglyph.flow.photo.back')}
        nextLabel={finishing ? t('heroglyph.flow.photo.saving') : t('heroglyph.flow.photo.next')}
      />
    </>
  );

  const screens = [renderUpload, renderCrop];

  if (!flowOk) return null;

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <PageTopBar onBack={() => (sub > 0 ? goTo(sub - 1) : navigate('/heroglyph/name'))} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0 flex-1">
          <AnimatePresence mode="wait" custom={dir}>
            {sub === 0 ? (
              <motion.div
                key="upload"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
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

                {/* Dots nav */}
                <Dots total={2} current={0} onDot={(i) => { if (i === 0 || (i > 0 && photoUrl)) goTo(i); }} />

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
                      onClick={() => goTo(1)}
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
                  </div>
                </motion.div>

                {/* file input */}
                {renderUpload()}
              </motion.div>
            ) : sub === 1 ? (
              <motion.div
                key={sub}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col flex-1 min-h-0 w-full gap-3 md:gap-4 justify-center"
              >
                {/* BLOCK 1 — dark gradient card */}
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

                {/* Dots nav */}
                <Dots total={2} current={sub} onDot={(i) => { if (i === 0 || (i > 0 && photoUrl)) goTo(i); }} />

                {/* BLOCK 2 — cream/papyrus card */}
                <motion.div
                  className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  <div className="flex flex-col gap-2 md:gap-3 items-center">
                    {screens[sub]()}
                  </div>
                </motion.div>

                {renderUpload()}
              </motion.div>
            ) : (
              null
            )}
          </AnimatePresence>
          </div>
      </div>
    </div>
  );
}