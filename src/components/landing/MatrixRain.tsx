import { useEffect, useRef } from 'react';
import { patroniImages } from '@/assets/patroni';

type Drop = {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  imageIndex: number;
};

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId: number;
    let drops: Drop[] = [];
    let cssWidth = 0;
    let cssHeight = 0;

    const isMobile = window.innerWidth < 768;
    const cellSize = isMobile ? 44 : 64;
    const baseImageSize = isMobile ? 36 : 52;

    // Pre-load all patron images
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    let started = false;

    patroniImages.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (!started && loadedCount >= Math.min(8, patroniImages.length)) {
          // Start animating once at least a few images are ready (faster perceived start)
          started = true;
          start();
        }
      };
      img.onerror = () => {
        loadedCount++;
      };
      img.src = src;
      images[i] = img;
    });

    const buildDrops = () => {
      const columns = Math.max(1, Math.floor(cssWidth / cellSize));
      drops = Array.from({ length: columns }, (_, i) => ({
        x: i * cellSize + (cellSize - baseImageSize) / 2,
        y: Math.random() * -cssHeight,
        // Slower than original (was 0.5 px/frame ≈ 30 px/s).
        // Now 0.08 – 0.2 px/frame ≈ 5 – 12 px/s.
        speed: 0.08 + Math.random() * 0.12,
        size: baseImageSize * (0.85 + Math.random() * 0.5),
        opacity: 0.25 + Math.random() * 0.3,
        imageIndex: Math.floor(Math.random() * patroniImages.length),
      }));
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cssWidth = canvas.offsetWidth;
      cssHeight = canvas.offsetHeight;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      buildDrops();
    };

    const draw = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      for (const drop of drops) {
        const img = images[drop.imageIndex];
        if (!img || !img.complete || img.naturalWidth === 0) continue;

        ctx.globalAlpha = drop.opacity;
        // Tint via filter (golden hue) — keeps SVG glyphs in the warm DOGYPT palette.
        ctx.drawImage(img, drop.x, drop.y, drop.size, drop.size);
        ctx.globalAlpha = 1;

        drop.y += drop.speed;

        if (drop.y > cssHeight && Math.random() > 0.985) {
          drop.y = -drop.size;
          drop.imageIndex = Math.floor(Math.random() * patroniImages.length);
          drop.opacity = 0.25 + Math.random() * 0.3;
          drop.size = baseImageSize * (0.85 + Math.random() * 0.5);
        }
      }

      animId = requestAnimationFrame(draw);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      for (const drop of drops) {
        const img = images[drop.imageIndex];
        if (!img || !img.complete || img.naturalWidth === 0) continue;
        ctx.globalAlpha = drop.opacity;
        ctx.drawImage(img, drop.x, Math.abs(drop.y) % cssHeight, drop.size, drop.size);
        ctx.globalAlpha = 1;
      }
    };

    const start = () => {
      resize();
      window.addEventListener('resize', resize);
      if (prefersReducedMotion) {
        drawStatic();
      } else {
        draw();
      }
    };

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
}
