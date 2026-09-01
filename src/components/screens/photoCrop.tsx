import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { uploadCroppedPhoto } from '@/services/cloudinaryService';

// Výrez fotky. Do vlastného súboru sa presťahoval 28. 8. 2026, keď sa nahrávanie
// stalo prvým krokom flow a výrez sa odložil až za skladanie heroglyfu
// (/heroglyph/crop) — dva úkony v jednom kroku boli pravdepodobnejší dôvod odchodu
// než samotný výber súboru.
//
// POZOR: pri odloženom výreze už `photoUrl` nie je blob:, ale Cloudinary URL.
// Preto `img.crossOrigin = 'anonymous'` nižšie NIE JE ozdoba — bez neho by bolo
// plátno označené za znečistené a `toBlob` by zlyhal. (Cloudinary vracia
// `access-control-allow-origin: *`, overené 28. 8. 2026.)

// CSS reference size must match the CropArea container (260px).
// OUT is the actual saved image size — larger = better quality for cert PDF.
export async function canvasCropAndUpload(
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

/* ───── Crop component ───── */
export function CropArea({
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

/* ───── Back / Next button pair ───── */
export function BackNextButtons({
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
