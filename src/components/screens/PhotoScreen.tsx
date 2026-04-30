import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { Checkbox } from '@/components/ui/checkbox';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import imageCompression from 'browser-image-compression';
import hekthorImg from '@/assets/hekthor.png';

/* ───── helpers ───── */

async function compressFile(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1600,
    fileType: 'image/webp',
    initialQuality: 0.85,
    useWebWorker: true,
    exifOrientation: 1, // strip EXIF by forcing orientation
  });
  return URL.createObjectURL(compressed);
}

function getImageDimensions(url: string): Promise<{ w: number; h: number }> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => res({ w: 0, h: 0 });
    img.src = url;
  });
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
  value,
  onChange,
}: {
  src: string;
  shape: 'circle' | 'square';
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
    const maxOffset = ((value.zoom - 1) / value.zoom) * 50;
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
    const maxOffset = ((newZoom - 1) / newZoom) * 50;
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
      </div>
      {/* zoom slider */}
      <input
        type="range"
        min={100}
        max={400}
        value={value.zoom * 100}
        onChange={(e) => {
          const z = Number(e.target.value) / 100;
          const maxOffset = ((z - 1) / z) * 50;
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
        style={{ fontFamily: "'Inter', sans-serif" }}
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
  backLabel = '← BACK',
  nextLabel = 'NEXT →',
}: {
  onBack: () => void;
  onNext: () => void;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  backLabel?: string;
  nextLabel?: string;
}) {
  const common = "flex-1 rounded-full h-10 font-bold tracking-wider transition-transform disabled:opacity-40 disabled:hover:scale-100 text-xs";
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
          boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {nextLabel}
      </Button>
    </div>
  );
}

/* ───── MAIN COMPONENT ───── */
export function PhotoScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const setDogPhotoUrl = useDogyptStore((s) => s.setDogPhotoUrl);
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
  const [gridCrop, setGridCrop] = useState({ x: 0, y: 0, zoom: 1 });
  const [extras, setExtras] = useState<string[]>([]);
  const [gdpr, setGdpr] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const extraRef = useRef<HTMLInputElement>(null);

  const goTo = (next: number) => {
    setDir(next > sub ? 1 : -1);
    setSub(next);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const url = await compressFile(file);
    const dims = await getImageDimensions(url);
    setLowRes(dims.w < 1500 && dims.h < 1500);
    setPhotoUrl(url);
    e.target.value = '';
  };

  const handleExtraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await compressFile(file);
    setExtras((p) => (p.length < 3 ? [...p, url] : p));
    e.target.value = '';
  };

  const finish = () => {
    if (photoUrl) setDogPhotoUrl(photoUrl);
    setCertCropData(certCrop);
    setGridCropData(gridCrop);
    setExtraPhotos(extras);
    setGdprConsent(gdpr);
    navigate('/breed');
  };

  /* ───── Sub-screen renderers ───── */

  const renderUpload = () => (
    <>
      {/* hidden file input lives here so it persists */}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </>
  );

  const renderCertCrop = () => (
    <>
      {photoUrl && (
        <CropArea src={photoUrl} shape="circle" value={certCrop} onChange={setCertCrop} />
      )}
      <BackNextButtons onBack={() => goTo(0)} onNext={() => goTo(2)} />
    </>
  );

  const renderGridCrop = () => (
    <>
      {photoUrl && (
        <CropArea src={photoUrl} shape="square" value={gridCrop} onChange={setGridCrop} />
      )}
      <BackNextButtons onBack={() => goTo(1)} onNext={() => goTo(3)} />
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

      <label className="flex items-start gap-2 text-[11px] text-muted-foreground cursor-pointer w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Checkbox
          checked={gdpr}
          onCheckedChange={(v) => setGdpr(!!v)}
          className="mt-0.5 border-muted-foreground/40"
        />
        <span>I consent to use these for personalized content.</span>
      </label>

      <BackNextButtons
        onBack={() => goTo(0)}
        onNext={finish}
        nextDisabled={extras.length > 0 && !gdpr}
      />
    </>
  );

  const screens = [renderUpload, renderCertCrop, renderGridCrop, renderExtras];

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-center relative pt-3 pb-2 px-4">
        <button
          onClick={() => (sub > 0 ? goTo(sub - 1) : navigate('/name'))}
          className="absolute left-4 top-3 p-2 text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

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
                  style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
                >
                  <div className="px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4">
                    <img src={hekthorImg} alt="HEKTHOR" className="w-48 h-48 md:w-64 md:h-64 object-contain" />
                    <p
                      className="text-white text-center text-lg md:text-2xl leading-snug drop-shadow-sm"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      A <span className="font-bold text-amber-300">FACE</span> OF A GOD
                    </p>
                    <p
                      className="text-white/70 text-sm text-center"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Upload a clear photo of {dogName || 'your dog'} — it will be sealed into their Heroglyph forever.
                    </p>
                  </div>
                </div>

                {/* Dots nav */}
                <Dots total={4} current={0} onDot={(i) => { if (i === 0 || (i > 0 && photoUrl)) goTo(i); }} />

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
                        <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Tap to upload
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid hsl(var(--gold))' }}>
                          <img src={photoUrl} alt="Dog" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-xs text-foreground truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{fileName}</span>
                          <button className="text-[10px] underline text-muted-foreground self-start" onClick={() => fileRef.current?.click()}>
                            Change photo
                          </button>
                        </div>
                      </div>
                    )}

                    <p
                      className="text-[10px] md:text-[11px] text-center leading-snug px-2"
                      style={{ fontFamily: "'Inter', sans-serif", color: 'hsl(39 40% 60%)' }}
                    >
                      <span className="inline text-green-600/70 mr-0.5">✓</span> dog facing forward
                      {' · '}
                      <span className="inline text-red-400/70 mr-0.5">✗</span> side profile / group
                      <br />
                      Best results: face clearly visible, works cropped into a circle.
                    </p>

                    <BackNextButtons
                      onBack={() => navigate('/name')}
                      onNext={() => goTo(1)}
                      nextDisabled={!photoUrl}
                    />
                  </div>
                </motion.div>

                {/* file input */}
                {renderUpload()}
              </motion.div>
            ) : sub === 1 || sub === 2 ? (
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
                  style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
                >
                  <div className="px-4 py-5 md:p-6 flex flex-col items-center gap-2">
                    <h2
                      className="text-lg md:text-2xl font-bold uppercase tracking-wider text-center text-white drop-shadow-sm"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {sub === 1 ? 'SEAL THE PORTRAIT' : 'THE HALL OF GODS'}
                    </h2>
                    <p
                      className="text-white/70 text-sm text-center"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {sub === 1
                        ? 'This will appear in your official Heroglyph certificate.'
                        : "Square crop for the gods' hall of fame."}
                    </p>
                  </div>
                </div>

                {/* Dots nav */}
                <Dots total={3} current={sub} onDot={(i) => { if (i === 0 || (i > 0 && photoUrl)) goTo(i); }} />

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
              <motion.div
                key={sub}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex flex-col flex-1 min-h-0 w-full"
              >
                <div className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
                  <Dots total={4} current={sub} onDot={(i) => { if (i === 0 || (i > 0 && photoUrl)) goTo(i); }} />
                  <div className="flex flex-col flex-1 min-h-0 mt-2">
                    {screens[sub]()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
      </div>
    </div>
  );
}