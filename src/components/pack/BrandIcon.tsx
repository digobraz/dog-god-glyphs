// Brand hand-drawn icon. Tints black source SVG to brand palette via CSS filter.
// tint: 'gold' (default, content) | 'dark' (#5A3F12, on gold backgrounds) | 'white' | 'dim'
import React from 'react';
import { APP_NEW } from '@/lib/packFlags';
import { SYS_ZA_KRESBU } from '@/components/pack/sysMap';

type Tint = 'gold' | 'dark' | 'white' | 'dim' | 'danger' | 'good' | 'violet';

const FILTERS: Record<Tint, string> = {
  gold: 'brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%)',
  dark: 'brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%) hue-rotate(2deg) brightness(75%) contrast(90%)', // ≈ #5A3F12 — VIZUÁLNE DOLAĎ na dev serveri
  white: 'brightness(0) invert(1)',
  dim: 'brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(300%) brightness(90%)', // papyrus dim
  danger: 'brightness(0) saturate(100%) invert(28%) sepia(72%) saturate(2400%) hue-rotate(345deg) brightness(85%) contrast(92%)', // ≈ #C0392B
  good: 'brightness(0) saturate(100%) invert(52%) sepia(36%) saturate(900%) hue-rotate(95deg) brightness(92%) contrast(85%)', // ≈ healthy green
  violet: 'brightness(0) saturate(100%) invert(28%) sepia(85%) saturate(1900%) hue-rotate(205deg) brightness(85%) contrast(92%)', // ≈ Egyptian blue #2E5FD0 (T.partHek, bývalá fialová 2026-06-15)
};

export function BrandIcon({ name, size = 16, tint = 'gold', className, style }: {
  name: string; size?: number; tint?: Tint; className?: string; style?: React.CSSProperties;
}) {
  // Appka: farebná samolepka z továrne, tint sa ignoruje. Samolepka má vzduch v obrázku, preto o 4 px väčšia.
  const sys = APP_NEW ? SYS_ZA_KRESBU[name] : undefined;
  if (sys) {
    const s = Math.max(size + 4, 18);
    return <img src={`/icons/sys/${sys}.webp`} alt="" aria-hidden draggable={false}
      className={className}
      style={{ width: s, height: s, objectFit: 'contain', ...(tint === 'dim' ? { filter: 'grayscale(1)', opacity: 0.55 } : null), ...style }} />;
  }
  return <img src={`/icons/pack/${name}.svg`} alt="" aria-hidden
    className={className}
    style={{ width: size, height: size, objectFit: 'contain', filter: FILTERS[tint], ...style }} />;
}
