// Brand hand-drawn icon. Tints black source SVG to brand palette via CSS filter.
// tint: 'gold' (default, content) | 'dark' (#5A3F12, on gold backgrounds) | 'white' | 'dim'
import React from 'react';

type Tint = 'gold' | 'dark' | 'white' | 'dim' | 'danger' | 'good' | 'violet';

const FILTERS: Record<Tint, string> = {
  gold: 'brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%)',
  dark: 'brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%) hue-rotate(2deg) brightness(75%) contrast(90%)', // ≈ #5A3F12 — VIZUÁLNE DOLAĎ na dev serveri
  white: 'brightness(0) invert(1)',
  dim: 'brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(300%) brightness(90%)', // papyrus dim
  danger: 'brightness(0) saturate(100%) invert(28%) sepia(72%) saturate(2400%) hue-rotate(345deg) brightness(85%) contrast(92%)', // ≈ #C0392B
  good: 'brightness(0) saturate(100%) invert(52%) sepia(36%) saturate(900%) hue-rotate(95deg) brightness(92%) contrast(85%)', // ≈ healthy green
  violet: 'brightness(0) saturate(100%) invert(42%) sepia(55%) saturate(900%) hue-rotate(235deg) brightness(90%) contrast(88%)', // ≈ #8B5FC0 (T.partHek)
};

export function BrandIcon({ name, size = 16, tint = 'gold', className, style }: {
  name: string; size?: number; tint?: Tint; className?: string; style?: React.CSSProperties;
}) {
  return <img src={`/icons/pack/${name}.svg`} alt="" aria-hidden
    className={className}
    style={{ width: size, height: size, objectFit: 'contain', filter: FILTERS[tint], ...style }} />;
}
