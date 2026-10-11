// Karta výletu pre IG stories — 1080×1920, kreslí sa na CANVASE v klientovi (11. 10. 2026,
// testerka Daniela). Dnes `handleShare` v PackTripArticle posiela len text+URL; story chce OBRÁZOK.
//
// Brand v3.2: BG #000 · gold #C99A3F · Cinzel 700 (názov) · cartouche radius 8 · logo DOGYPT.
// Share: Web Share API s `files` (mobil → IG stories sa ponúkne v share sheete sama),
// fallback = stiahnutie PNG. Pri zrušení sheetu (AbortError) sa NIČ nesťahuje.
//
// ⚠️ Bezpečná zóna IG stories: hore a dole ~250 px prekrýva UI appky — logo je preto pod
//    hornou hranou a URL nad dolnou, názov a km stoja v strede.
// ⚠️ Cloudinary posiela CORS hlavičky, takže `crossOrigin="anonymous"` nepoškvrní canvas
//    (inak by `toBlob` hodil SecurityError). Fotka, ktorá sa nenačíta, kartu nezhodí —
//    kreslí sa bez nej (čierne pozadie so zlatým rámom).
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LanguageContext';
import logoGold from '@/assets/dogypt-logo-gold.webp';
import { sizedUrl } from '@/services/cloudinaryService';
import { ICON } from '@/components/pack/tripShared';

export const STORY_W = 1080;
export const STORY_H = 1920;
const GOLD = '#C99A3F';
const PHOTO_H = 1180;

export interface TripStoryData {
  name: string;
  /** „12.3" (bez jednotky); prázdne = okruh/bez trasy, pilulka sa nekreslí */
  km?: string;
  diff?: string;
  photoUrl?: string | null;
  /** čo sa vytlačí dole (bez https://) */
  url: string;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width <= maxW || !cur) cur = test;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s*\S*$/, '') + '…';
    return kept;
  }
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderTripStoryCard(d: TripStoryData): Promise<Blob> {
  try { await Promise.all([document.fonts.load('700 80px Cinzel'), document.fonts.load('500 32px "Space Grotesk"')]); } catch { /* font sa dotiahne ako fallback */ }
  const [photo, logo] = await Promise.all([
    d.photoUrl ? loadImage(sizedUrl(d.photoUrl, 1600)) : Promise.resolve(null),
    loadImage(logoGold),
  ]);

  const c = document.createElement('canvas');
  c.width = STORY_W; c.height = STORY_H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // fotka: cover do horných PHOTO_H px
  if (photo) {
    const s = Math.max(STORY_W / photo.width, PHOTO_H / photo.height);
    const w = photo.width * s, h = photo.height * s;
    ctx.drawImage(photo, (STORY_W - w) / 2, (PHOTO_H - h) / 2, w, h);
  }
  // prechod do čiernej (aj nad logom, nech je čitateľné na svetlej fotke)
  const g = ctx.createLinearGradient(0, 0, 0, PHOTO_H);
  g.addColorStop(0, 'rgba(0,0,0,0.65)');
  g.addColorStop(0.22, 'rgba(0,0,0,0.0)');
  g.addColorStop(0.62, 'rgba(0,0,0,0.0)');
  g.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, STORY_W, PHOTO_H);

  // logo — pod hornou bezpečnou hranou
  if (logo) {
    const lh = 120, lw = (logo.width / logo.height) * lh;
    ctx.drawImage(logo, (STORY_W - lw) / 2, 200, lw, lh);
  }

  // názov — Cinzel 700, zlatý, na stred
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = GOLD;
  let size = 96;
  let lines: string[] = [];
  for (; size >= 64; size -= 8) {
    ctx.font = `700 ${size}px Cinzel, serif`;
    lines = wrapLines(ctx, d.name.toUpperCase(), STORY_W - 160, 3);
    if (lines.length <= 2 || size === 64) break;
  }
  const lineH = size * 1.2;
  let y = 1290;
  for (const ln of lines) { ctx.fillText(ln, STORY_W / 2, y); y += lineH; }

  // pilulka km · náročnosť (cartouche, radius 8)
  const meta = [d.km && d.km.trim() ? `${d.km.trim()} km` : '', d.diff ?? ''].filter(Boolean).join('  ·  ');
  if (meta) {
    ctx.font = '500 40px "Space Grotesk", sans-serif';
    const tw = ctx.measureText(meta).width;
    const pw = tw + 80, ph = 84, px = (STORY_W - pw) / 2, py = y + 10;
    roundRect(ctx, px, py, pw, ph, 8);
    ctx.fillStyle = 'rgba(201,154,63,0.14)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = GOLD;
    ctx.stroke();
    ctx.fillStyle = '#F5EFE0';
    ctx.fillText(meta, STORY_W / 2, py + 56);
  }

  // URL dole nad bezpečnou hranou
  ctx.fillStyle = GOLD;
  ctx.fillRect(STORY_W / 2 - 60, 1640, 120, 3);
  ctx.font = '500 38px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#F5EFE0';
  ctx.fillText(d.url, STORY_W / 2, 1710);
  ctx.font = '700 30px Cinzel, serif';
  ctx.fillStyle = GOLD;
  ctx.fillText('IN DOG WE TRUST', STORY_W / 2, 1650 + 118);

  return new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('story card toBlob failed'))), 'image/png');
  });
}

function fileName(name: string): string {
  const base = name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `dogypt-${base || 'trip'}-story.png`;
}

export type TripStoryResult = 'native' | 'download';

/** Vyrobí kartu a pošle ju cez share sheet; bez podpory súborov ju stiahne. */
export async function shareTripStory(d: TripStoryData, shareText: string): Promise<TripStoryResult> {
  const blob = await renderTripStoryCard(d);
  const file = new File([blob], fileName(d.name), { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
  if (typeof nav.canShare === 'function' && typeof navigator.share === 'function' && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: shareText });
      return 'native';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'native';
      // iná chyba share sheetu → stiahnutie nižšie
    }
  }
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = objectUrl; a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
  }
  return 'download';
}

/** Tlačidlo STORY vedľa SHARE v článku výletu (rovnaké triedy `pta-actbtn`). */
export function TripStoryButton({ data, shareText }: { data: TripStoryData; shareText: string }) {
  const t = useT();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await shareTripStory(data, shareText);
      if (r === 'download') toast({ description: t('pack.trip.storySaved') });
    } catch {
      toast({ description: t('pack.trip.storyFail') });
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className="pta-actbtn pta-actbtn--blue" onClick={go} disabled={busy} aria-label={t('pack.trip.story')}>
      <span className="pta-actbtn-icon pta-ic-mask" style={{ '--ic': `url(${ICON('camera')})` } as React.CSSProperties} />
      <span className="pta-actbtn-label">{busy ? '…' : t('pack.trip.story')}</span>
    </button>
  );
}
