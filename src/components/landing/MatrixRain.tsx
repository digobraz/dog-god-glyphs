import { useEffect, useRef } from 'react';
import { patroniImages } from '@/assets/patroni';

// Matrix-style golden glow color
const GLOW_COLOR = '#E8B547'; // bright orange-gold

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
    let cancelled = false;
    let drops: Drop[] = [];
    let cssWidth = 0;
    let cssHeight = 0;

    const isMobile = window.innerWidth < 768;
    const cellSize = isMobile ? 44 : 64;
    const baseImageSize = isMobile ? 36 : 52;

    // Pre-load all patron SVGs and recolor them to gold so they glow on black bg.
    // Browsers won't let canvas read styled SVG inline, so we fetch each SVG,
    // inject a gold fill, and convert to a blob URL that <Image> can render.
    const images: HTMLImageElement[] = new Array(patroniImages.length);

    const loadGoldenSvg = async (src: string): Promise<HTMLImageElement> => {
      const res = await fetch(src);
      let svgText = await res.text();
      // Inject a global gold fill on the root <svg> and remove existing fills
      svgText = svgText.replace(/fill="[^"]*"/g, '');
      svgText = svgText.replace(
        /<svg([^>]*)>/,
        `<svg$1 fill="${GLOW_COLOR}" style="color:${GLOW_COLOR}">`,
      );
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    };

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
      // Slight trail (matrix-style) instead of full clear
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // Glow effect for matrix-like luminescence
      ctx.shadowColor = GLOW_COLOR;
      ctx.shadowBlur = 12;

      for (const drop of drops) {
        const img = images[drop.imageIndex];
        if (!img || !img.complete || img.naturalWidth === 0) continue;

        ctx.globalAlpha = drop.opacity;
        ctx.drawImage(img, drop.x, drop.y, drop.size, drop.size);

        drop.y += drop.speed;

        if (drop.y > cssHeight && Math.random() > 0.985) {
          drop.y = -drop.size;
          drop.imageIndex = Math.floor(Math.random() * patroniImages.length);
          drop.opacity = 0.45 + Math.random() * 0.4;
          drop.size = baseImageSize * (0.85 + Math.random() * 0.5);
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(draw);
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.shadowColor = GLOW_COLOR;
      ctx.shadowBlur = 12;
      for (const drop of drops) {
        const img = images[drop.imageIndex];
        if (!img || !img.complete || img.naturalWidth === 0) continue;
        ctx.globalAlpha = drop.opacity;
        ctx.drawImage(img, drop.x, Math.abs(drop.y) % cssHeight, drop.size, drop.size);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const start = () => {
      if (cancelled) return;
      resize();
      window.addEventListener('resize', resize);
      if (prefersReducedMotion) {
        drawStatic();
      } else {
        draw();
      }
    };

    // Kick off async loading; start as soon as a few images are ready.
    let readyCount = 0;
    let started = false;
    patroniImages.forEach((src, i) => {
      loadGoldenSvg(src)
        .then((img) => {
          if (cancelled) return;
          images[i] = img;
          readyCount++;
          if (!started && readyCount >= Math.min(6, patroniImages.length)) {
            started = true;
            start();
          }
        })
        .catch(() => {
          readyCount++;
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.95 }}
    />
  );
}
