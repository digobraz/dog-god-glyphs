// ZDIEĽAJ VÝLET — okno s kartou pre IG príbeh a FB príspevok (13. 10. 2026).
//
// Nahrádza TripStoryCard.tsx (11. 10.), ktorá sa Matejovi nepáčila: „musíme poriešiť inak".
// Vizuál = nákres `plany/nakres-zdielanie-2026-10-11/sablona.html`, vetva BLEDÁ
// (Matej 11. 10.: „super berieme nákres bledá verzia"). Zadanie: ZADANIE.md v tom istom priečinku.
//
// Čo okno robí:
//   · IG 1080×1920 / FB 1080×1350, fotka z výletu ALEBO vlastná (skladá sa na canvase,
//     na server nejde) + posun fotky.
//   · IG: prerušovaný rámik na nálepku ODKAZ je LEN v náhľade — v obrázku ostane prázdne miesto
//     (Matej: „pri stiahnutí … tam fyzicky nebude, bude tam len prázdne miesto").
//   · ZDIEĽAŤ skopíruje odkaz na výlet a na MOBILE otvorí systémový hárok so súborom (tam je IG/FB).
//     Na PC obrázok STIAHNE — hárok Macu Instagram neponúka, takže by bol slepá ulička.
//
// ⚠️ iOS Safari pustí `navigator.share` len PRIAMO v ťuknutí. Obrázok sa preto vyrába VOPRED
//    (po každej zmene náhľadu) a klik ho už len posiela — `await` na kreslenie pred share
//    by gesto minul a hárok by sa neotvoril (NotAllowedError).
// ⚠️ Cloudinary aj flagcdn posielajú `access-control-allow-origin: *`, takže `crossOrigin`
//    nepoškvrní canvas a `toBlob` prejde.
import { APP_NEW } from '@/lib/packFlags';
import { SysIcon } from '@/components/pack/SysIcon';
import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { createPortal } from 'react-dom';
import { useSheetSwipe } from '@/components/pack/useSheetSwipe';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LanguageContext';
import logoGold from '@/assets/dogypt-logo-gold.webp';
import { sizedUrl } from '@/services/cloudinaryService';
import { flagUrl } from '@/lib/flagUrl';
import { IS_APP } from '@/lib/isApp';
import { shareFile } from '@/lib/shareFile';
import { canvasToBlob } from '@/lib/canvasBlob';
import { ICON } from '@/components/pack/tripShared';
import { FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { FONT_TITLE, FONT_UI, PACK_BOX, PACK_SHADOW, PACK_THEME as T } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';

export type ShareFmt = 'ig' | 'fb';

export interface TripShareData {
  name: string;
  /** plná adresa výletu (https://…) — ide do schránky */
  url: string;
  /** fotky výletu; prázdne ⇒ `fallbackPhoto` (ilustračná) */
  photos: string[];
  fallbackPhoto?: string;
  /** ISO2 krajiny — vlajka v krúžku na fotke */
  country?: string;
  /** údaje pod názvom: [emoji, text] */
  chips: [string, string][];
  /** Heroglyf psa (`dogs.heroglyph_png_url`) — sedí POD menom; v okne sa dá vypnúť (predvolene zapnutý). */
  glyph?: string;
  /** Meno v Cinzel Decorative — mená psov na oficiálnych povrchoch (brand lock). */
  decorative?: boolean;
  /** Pilulka úplne hore („Som #1 z 1 000 000") — miesto psa v misii (Matej 23. 10.). */
  badge?: string;
  /** APPKA (APP_NEW, Papyrus 3D 9. 11. 2026): hodnotenie výletu — hviezdy a číslo idú pod názov. 0/chýba = nič. */
  rating?: number;
  /** číslo hodnotenia už v jazyku rozhrania („5,0") */
  ratingText?: string;
  /** APPKA: 3D pilulky pod fotkou, každá = rad (ikona + text); text smie chýbať (ikona bez slova). Web ostáva na `chips`. */
  pills?: SharePill[];
}
export type SharePill = { icon: string; text?: string }[];

/** Čo sa zdieľa — mení len texty okna. Pes = karta psa z profilu JA a šuplíka BONES (23. 10. 2026,
 *  Matej: „pozvi na profile po kliknutí mechanizmus ako pri výletoch a zdieľaní na ig"). */
export type ShareKind = 'trip' | 'dog';
const KIND_KEYS: Record<ShareKind, { title: string; copy: string; fbLine: string; step1: string; main: string; copied: string; fb3: string }> = {
  trip: { title: 'pack.trip.shareTitle', copy: 'pack.trip.shareCopy', fbLine: 'pack.trip.shareFbLine', step1: 'pack.trip.shareStep1', main: 'pack.trip.sharePhotoTrip', copied: 'pack.trip.toastLinkCopied', fb3: 'pack.trip.shareStepFb3' },
  dog: { title: 'pack.dogShare.title', copy: 'pack.dogShare.copy', fbLine: 'pack.dogShare.fbLine', step1: 'pack.dogShare.step1', main: 'pack.dogShare.photoCard', copied: 'sharecard.linkCopied', fb3: 'pack.dogShare.stepFb3' },
};

const FMT: Record<ShareFmt, { w: number; h: number }> = { ig: { w: 1080, h: 1920 }, fb: { w: 1080, h: 1350 } };
const GOLD = T.cardEdge;
const INK = T.inkStrong;
const WARM = T.inkWarm;
const SLOT_INK = '#9A7430';

interface Texts { slot: string; fbLine: string; motto: string }
interface RenderOpts { fmt: ShareFmt; photo: HTMLImageElement | null; off: number; exportMode: boolean; glyph?: HTMLImageElement | null }

const imgCache = new Map<string, Promise<HTMLImageElement | null>>();
function loadImg(src: string): Promise<HTMLImageElement | null> {
  const hit = imgCache.get(src);
  if (hit) return hit;
  const p = new Promise<HTMLImageElement | null>((res) => {
    const i = new Image(); i.crossOrigin = 'anonymous';
    i.onload = () => res(i); i.onerror = () => res(null); i.src = src;
  });
  imgCache.set(src, p);
  return p;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}
function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, w: number, h: number, off: number) {
  if (!img) { ctx.fillStyle = '#1a1408'; ctx.fillRect(x, y, w, h); return; }
  const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
  // bez clipu fotka pretečie pod svoj obdĺžnik (chyba starej karty: druhý pás fotky pod názvom)
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) * off, iw, ih); ctx.restore();
}
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean), lines: string[] = []; let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
/** Názov: najväčšie písmo, pri ktorom sa zmestí do dvoch riadkov. Vracia spodok. */
function title(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, big: number, dry: boolean, family = 'Cinzel'): number {
  let size = big, lines: string[] = [];
  for (; size >= 48; size -= 4) {
    ctx.font = `700 ${size}px ${family}`; lines = wrap(ctx, text.toUpperCase(), 960);
    if (lines.length <= 2) break;
  }
  if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] = `${lines[1].replace(/\s*\S*$/, '')}…`; }
  const lh = size * 1.12;
  if (!dry) {
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lh));
  }
  return y + lines.length * lh;
}
/** Rad údajov: kartuše s emoji, zalomené do riadkov a vycentrované. */
function chipRow(ctx: CanvasRenderingContext2D, items: [string, string][], cx: number, y: number, fs: number, dry: boolean): number {
  if (!items.length) return y;
  const font = `500 ${fs}px "Space Grotesk", ${FONT_EMOJI}`;
  ctx.font = font; ctx.textBaseline = 'middle';
  const padX = fs * 0.6, gap = fs * 0.4, h = fs * 1.9, maxW = 980;
  const lbl = ([e, t]: [string, string]) => (e ? `${e}  ${t}` : t);
  const ws = items.map((it) => ctx.measureText(lbl(it)).width + padX * 2);
  const rows: number[][] = [[]]; let rw = 0;
  ws.forEach((w, i) => {
    if (rw + w > maxW && rows[rows.length - 1].length) { rows.push([]); rw = 0; }
    rows[rows.length - 1].push(i); rw += w + gap;
  });
  const end = y + rows.length * (h + gap) - gap;
  if (dry) return end;
  rows.forEach((row, ri) => {
    const tot = row.reduce((s, i) => s + ws[i], 0) + gap * (row.length - 1);
    let x = cx - tot / 2; const yy = y + ri * (h + gap);
    row.forEach((i) => {
      rr(ctx, x, yy, ws[i], h, 22); ctx.fillStyle = T.card; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.stroke();
      ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.font = font;
      ctx.fillText(lbl(items[i]), x + padX, yy + h / 2 + 2);
      x += ws[i] + gap;
    });
  });
  return end;
}
/** Deliaca čiara = brand `T.rule`: zlatá, do strán vyblednutá. */
function rule(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number) {
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, 'rgba(201,154,63,0)'); g.addColorStop(0.5, 'rgba(201,154,63,1)'); g.addColorStop(1, 'rgba(201,154,63,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, y, w, 4);
}

/** BLEDÁ šablóna — rozloženie ODSPODU: motto → logo → miesto na odkaz → údaje → názov; fotka dostane zvyšok. */
async function render(cv: HTMLCanvasElement, d: TripShareData, tx: Texts, o: RenderOpts) {
  const { w: W, h: H } = FMT[o.fmt], cx = W / 2, ig = o.fmt === 'ig';
  const [lg, fl] = await Promise.all([
    loadImg(logoGold),
    d.country ? loadImg(flagUrl(d.country.toLowerCase(), 160)) : Promise.resolve(null),
  ]);
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  // IG prekrýva hore aj dole ~250 px vlastným UI ⇒ obsah drží mimo
  const safeBot = ig ? H - 250 : H - 60;
  const big = ig ? 80 : 64, fs = ig ? 38 : 32;
  const lgW = ig ? 230 : 190, lgH = lg ? lgW * lg.height / lg.width : 0;
  // logo + motto nižšie (Matej 23. 10.) — IG: do horného okraja spodného pásu, kde IG kreslí len tenký riadok odpovede
  const mY = ig ? safeBot + 40 : H - 64;             // motto
  const lY = mY - 20 - lgH;                           // logo nad mottom
  const slotH = 150, sY = lY - 36 - slotH;            // miesto na nálepku ODKAZ
  const end = ig ? sY - 44 : lY - 92;                 // FB: nad logom riadok s dogypt.com
  const fam = d.decorative ? '"Cinzel Decorative"' : 'Cinzel';
  // heroglyf pod menom (pes) — výška podľa pomeru strán PNG, šírka strop 640
  const gW = o.glyph ? Math.min(640, (ig ? 300 : 230) * o.glyph.width / o.glyph.height) : 0;
  const gH = o.glyph ? gW * o.glyph.height / o.glyph.width : 0;
  const below = o.glyph ? 48 + gH : 60 + chipRow(ctx, d.chips, cx, 0, fs, true);
  const measure = title(ctx, d.name, cx, 0, big, true, fam) + below;
  const top = end - measure;

  // papyrus = `PACK_THEME.cardGrad` (~160°)
  const bg = ctx.createLinearGradient(0, 0, W * 0.36, H);
  bg.addColorStop(0, '#FBF5E6'); bg.addColorStop(0.55, '#F3E4C4'); bg.addColorStop(1, '#EAD6A6');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // fotka sa rozplynie MASKOU do papyrusu (prechod je šikmý — farbou by sa trafiť nedal)
  const phH = Math.max(200, top + 40), off = document.createElement('canvas');
  off.width = W; off.height = phH;
  const oc = off.getContext('2d');
  if (oc) {
    cover(oc, o.photo, 0, 0, W, phH, o.off);
    const m = oc.createLinearGradient(0, phH * 0.5, 0, phH);
    m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    oc.globalCompositeOperation = 'destination-in'; oc.fillStyle = m; oc.fillRect(0, 0, W, phH);
    ctx.drawImage(off, 0, 0);
  }

  // vlajka = papyrusový krúžok so zlatým okrajom vpravo dole na fotke, tesne nad názvom
  if (fl) {
    const r = ig ? 64 : 52, fx = W - 64 - r, fy = top - 36 - r;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fillStyle = T.card; ctx.fill(); ctx.restore();
    const ir = r - 10;
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, ir, 0, Math.PI * 2); ctx.clip();
    const s = Math.max((ir * 2) / fl.width, (ir * 2) / fl.height);
    ctx.drawImage(fl, fx - (fl.width * s) / 2, fy - (fl.height * s) / 2, fl.width * s, fl.height * s);
    ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = GOLD; ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.stroke();
  }

  // pilulka misie hore pri okraji — IG aj FB rovnako (Matej 23. 10.: „pri ig je to nízko = dajme to pri horný okraj")
  // ⚠️ IG cez horných ~150 px kreslí pásiky príbehu a meno účtu — pilulka môže pod nimi čiastočne zmiznúť
  if (d.badge) {
    const bfs = ig ? 36 : 30, by = ig ? 64 : 56;
    // Space Grotesk, nie Cinzel — Cinzel kreslí „1“ ako „I“ (#I Z I 000 000)
    ctx.font = `600 ${bfs}px "Space Grotesk"`; ctx.letterSpacing = `${Math.round(bfs * 0.08)}px`;
    const label = d.badge.toUpperCase(), bw = ctx.measureText(label).width + bfs * 1.6, bh = bfs * 2;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18;
    rr(ctx, cx - bw / 2, by, bw, bh, bh / 2); ctx.fillStyle = T.card; ctx.fill(); ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = GOLD; rr(ctx, cx - bw / 2, by, bw, bh, bh / 2); ctx.stroke();
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, by + bh / 2 + 2); ctx.letterSpacing = '0px';
  }

  const ty = title(ctx, d.name, cx, top, big, false, fam);
  rule(ctx, cx, ty + 22, 640);
  if (o.glyph) ctx.drawImage(o.glyph, cx - gW / 2, ty + 48, gW, gH);
  else chipRow(ctx, d.chips, cx, ty + 60, fs, false);

  if (ig) {
    if (!o.exportMode) {
      ctx.save(); ctx.setLineDash([22, 16]); ctx.lineWidth = 5; ctx.strokeStyle = SLOT_INK;
      rr(ctx, cx - 310, sY, 620, slotH, 28); ctx.stroke(); ctx.restore();
      ctx.fillStyle = SLOT_INK; ctx.globalAlpha = 0.75; ctx.font = `500 34px "Space Grotesk", ${FONT_EMOJI}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`🔗  ${tx.slot}`, cx, sY + slotH / 2 + 2); ctx.globalAlpha = 1;
    }
    rule(ctx, cx, sY + slotH + 16, 640);
  } else {
    ctx.fillStyle = WARM; ctx.font = `500 28px "Space Grotesk", ${FONT_EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(tx.fbLine, cx, lY - 56);
    rule(ctx, cx, lY - 18, 520);
  }

  // logo tmavým atramentom (zlaté prefarbené cez source-in) — LOGO 2026 = tmavé na papyruse
  if (lg) {
    const lc = document.createElement('canvas'); lc.width = lgW * 2; lc.height = lgH * 2;
    const lx = lc.getContext('2d');
    if (lx) {
      lx.drawImage(lg, 0, 0, lc.width, lc.height);
      lx.globalCompositeOperation = 'source-in'; lx.fillStyle = INK; lx.fillRect(0, 0, lc.width, lc.height);
      ctx.drawImage(lc, cx - lgW / 2, lY, lgW, lgH);
    }
  }
  // motto NIKDY širšie ako logo (Matej 23. 10.: „motto nesmie byt širšie ako logo") — zmenšuje sa písmo aj rozstup
  ctx.fillStyle = WARM; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const motto = tx.motto.toUpperCase();
  let mfs = 26;
  for (; mfs > 12; mfs -= 1) {
    ctx.font = `700 ${mfs}px Cinzel`; ctx.letterSpacing = `${Math.round(mfs * 0.23)}px`;
    if (ctx.measureText(motto).width <= lgW) break;
  }
  ctx.fillText(motto, cx, mY); ctx.letterSpacing = '0px';
}

// ── APPKA: PAPYRUS 3D (Matej 9. 11. 2026, hárok `map-herne-2026-11-09` C6) ─────────────────────────────
// Len pod `APP_NEW` a len pre výlet. Web a karta psa idú starou `render()` vyššie, tá sa nemení.
// Písmo LT Museum (Black) sa načíta cez `document.fonts.load` pred kreslením, inak by canvas sadol na serif.
const P3D = { ink: '#2a1608', gold: '#C99A3F', goldSolid: '#A3782B', paper: '#F3E4C4', paperHi: '#F9F2E3', star: '#F5C73D', starOff: '#E4D6B4' };
const MUSEUM = '"LT Museum", serif';
/** Názov v LT Museum, bez veľkých písmen; najväčšie písmo, pri ktorom sa zmestí do dvoch riadkov. Vracia spodok. */
function title3d(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, big: number, dry: boolean): number {
  let size = big, lines: string[] = [];
  for (; size >= 52; size -= 4) {
    ctx.font = `900 ${size}px ${MUSEUM}`; lines = wrap(ctx, text, 940);
    if (lines.length <= 2) break;
  }
  if (lines.length > 2) { lines = lines.slice(0, 2); lines[1] = `${lines[1].replace(/\s*\S*$/, '')}…`; }
  const lh = size * 1.12;
  if (!dry) {
    ctx.fillStyle = P3D.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lh));
  }
  return y + lines.length * lh;
}
function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r * 0.5 : r;
    ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
}
/** Číslo hodnotenia a päť hviezd vedľa seba, vycentrované; hviezda sa plní podľa zlomku. Vracia šírku riadku. */
function ratingRow(ctx: CanvasRenderingContext2D, value: number, label: string, cx: number, y: number, size: number, dry: boolean): number {
  const r = size * 0.46, gap = size * 0.12, sw = r * 2 + gap;
  ctx.font = `900 ${size}px ${MUSEUM}`;
  const lw = ctx.measureText(label).width, tot = lw + size * 0.3 + sw * 5 - gap;
  if (dry) return tot;
  let x = cx - tot / 2;
  ctx.fillStyle = P3D.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y + size / 2 + 2); x += lw + size * 0.3;
  for (let i = 0; i < 5; i++) {
    const sx = x + r + i * sw, sy = y + size / 2, fill = Math.max(0, Math.min(1, value - i));
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size * 0.07); ctx.strokeStyle = P3D.ink;
    starPath(ctx, sx, sy, r); ctx.fillStyle = P3D.starOff; ctx.fill(); ctx.stroke();
    if (fill > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(sx - r, sy - r, r * 2 * fill, r * 2); ctx.clip();
      starPath(ctx, sx, sy, r); ctx.fillStyle = P3D.star; ctx.fill(); ctx.restore();
      starPath(ctx, sx, sy, r); ctx.stroke();
    }
  }
  return tot;
}
/** 3D pilulky pod fotkou: papyrusová plocha, tmavý obrys, spodná pera. Vracia šírky pre vycentrovanie. */
function pills3d(ctx: CanvasRenderingContext2D, pills: SharePill[], icons: Map<string, HTMLImageElement | null>, cx: number, y: number, h: number, dry: boolean) {
  const fs = Math.round(h * 0.42), ic = Math.round(h * 0.62), padX = h * 0.34, gap = h * 0.14, between = 18;
  ctx.font = `600 ${fs}px "Space Grotesk", sans-serif`;
  const ws = pills.map((p) => padX * 2 + p.reduce((s, part, i) => s + ic + (part.text ? gap + ctx.measureText(part.text).width : 0) + (i ? gap * 1.5 : 0), 0));
  if (dry) return;
  const tot = ws.reduce((s, w) => s + w, 0) + between * (pills.length - 1);
  let x = cx - tot / 2;
  pills.forEach((p, pi) => {
    const w = ws[pi];
    rr(ctx, x, y + 9, w, h, 28); ctx.fillStyle = P3D.goldSolid; ctx.fill();
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.34)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 14;
    rr(ctx, x, y, w, h, 28); ctx.fillStyle = P3D.goldSolid; ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#fff'); g.addColorStop(1, P3D.paper);
    rr(ctx, x, y, w, h, 28); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = P3D.ink; ctx.stroke();
    let px = x + padX;
    p.forEach((part, i) => {
      if (i) px += gap * 1.5;
      const im = icons.get(part.icon);
      if (im) ctx.drawImage(im, px, y + (h - ic) / 2, ic, ic);
      px += ic;
      if (part.text) {
        px += gap; ctx.fillStyle = P3D.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `600 ${fs}px "Space Grotesk", sans-serif`;
        ctx.fillText(part.text, px, y + h / 2 + 2); px += ctx.measureText(part.text).width;
      }
    });
    x += w + between;
  });
}

/** PAPYRUS 3D šablóna výletu — fotka s tvrdou hranou a zlatou linkou, 3D pilulky, názov + hodnotenie, dole logo a motto. */
async function render3d(cv: HTMLCanvasElement, d: TripShareData, tx: Texts, o: RenderOpts) {
  const { w: W, h: H } = FMT[o.fmt], cx = W / 2, ig = o.fmt === 'ig';
  const iconSrcs = [...new Set((d.pills ?? []).flat().map((p) => p.icon))];
  const [lg, fl, ...ims] = await Promise.all([
    loadImg(logoGold),
    d.country ? loadImg(flagUrl(d.country.toLowerCase(), 160)) : Promise.resolve(null),
    ...iconSrcs.map((s) => loadImg(s)),
  ]);
  const icons = new Map<string, HTMLImageElement | null>(iconSrcs.map((s, i) => [s, ims[i]]));
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const safeBot = ig ? H - 250 : H - 60;
  const big = ig ? 88 : 72;
  const lgW = ig ? 230 : 190, lgH = lg ? lgW * lg.height / lg.width : 0;
  const mY = ig ? safeBot + 40 : H - 64;
  const lY = mY - 20 - lgH;
  const slotH = 150, sY = lY - 36 - slotH;
  const end = ig ? sY - 44 : lY - 92;
  const hasRating = !!d.rating && d.rating > 0;
  const rSize = ig ? 76 : 64, pillH = ig ? 104 : 88, hasPills = !!d.pills?.length;
  const tH = title3d(ctx, d.name, cx, 0, big, true);
  const below = tH + (hasRating ? 24 + rSize : 0);
  const contentTop = end - below;
  const pillTop = contentTop - 28 - pillH;
  const photoH = hasPills ? pillTop + pillH / 2 : contentTop - 28;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, P3D.paperHi); bg.addColorStop(1, '#EBD7A8');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // fotka bez rozplynutia: tvrdá hrana, tmavá linka a zlatý pás
  cover(ctx, o.photo, 0, 0, W, photoH, o.off);
  ctx.fillStyle = P3D.ink; ctx.fillRect(0, photoH, W, 6);
  ctx.fillStyle = P3D.gold; ctx.fillRect(0, photoH + 6, W, 10);

  if (fl) {
    const r = ig ? 64 : 52, fx = W - 64 - r, fy = ig ? 330 : 64 + r;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fillStyle = P3D.paperHi; ctx.fill(); ctx.restore();
    const ir = r - 10;
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, ir, 0, Math.PI * 2); ctx.clip();
    const s = Math.max((ir * 2) / fl.width, (ir * 2) / fl.height);
    ctx.drawImage(fl, fx - (fl.width * s) / 2, fy - (fl.height * s) / 2, fl.width * s, fl.height * s);
    ctx.restore();
    ctx.lineWidth = 6; ctx.strokeStyle = P3D.ink; ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.stroke();
  }
  if (hasPills) pills3d(ctx, d.pills ?? [], icons, cx, pillTop, pillH, false);

  const ty = title3d(ctx, d.name, cx, contentTop, big, false);
  if (hasRating) ratingRow(ctx, d.rating ?? 0, d.ratingText ?? (d.rating ?? 0).toFixed(1), cx, ty + 24, rSize, false);

  if (ig) {
    if (!o.exportMode) {
      ctx.save(); ctx.setLineDash([22, 16]); ctx.lineWidth = 5; ctx.strokeStyle = SLOT_INK;
      rr(ctx, cx - 310, sY, 620, slotH, 28); ctx.stroke(); ctx.restore();
      ctx.fillStyle = SLOT_INK; ctx.globalAlpha = 0.75; ctx.font = `500 34px "Space Grotesk", ${FONT_EMOJI}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`🔗  ${tx.slot}`, cx, sY + slotH / 2 + 2); ctx.globalAlpha = 1;
    }
  } else {
    ctx.fillStyle = WARM; ctx.font = `500 28px "Space Grotesk", ${FONT_EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(tx.fbLine, cx, lY - 56);
  }
  if (lg) {
    const lc = document.createElement('canvas'); lc.width = lgW * 2; lc.height = lgH * 2;
    const lx = lc.getContext('2d');
    if (lx) {
      lx.drawImage(lg, 0, 0, lc.width, lc.height);
      lx.globalCompositeOperation = 'source-in'; lx.fillStyle = P3D.ink; lx.fillRect(0, 0, lc.width, lc.height);
      ctx.drawImage(lc, cx - lgW / 2, lY, lgW, lgH);
    }
  }
  // motto nikdy širšie ako logo (Matej 23. 10.)
  ctx.fillStyle = P3D.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  let mfs = 34;
  for (; mfs > 12; mfs -= 1) { ctx.font = `900 ${mfs}px ${MUSEUM}`; if (ctx.measureText(tx.motto).width <= lgW) break; }
  ctx.fillText(tx.motto, cx, mY);
}

/** PAPYRUS 3D šablóna KARTY PSA (hárok O12) — fotka s tvrdou hranou, lapisová pilulka s číslom na hrane, meno v Museum, heroglyf v rámiku. Len pod `APP_NEW`. */
async function render3dDog(cv: HTMLCanvasElement, d: TripShareData, tx: Texts, o: RenderOpts) {
  const { w: W, h: H } = FMT[o.fmt], cx = W / 2, ig = o.fmt === 'ig';
  const lg = await loadImg(logoGold);
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const safeBot = ig ? H - 250 : H - 60;
  const lgW = ig ? 230 : 190, lgH = lg ? lgW * lg.height / lg.width : 0;
  const mY = ig ? safeBot + 40 : H - 64;
  const lY = mY - 20 - lgH;
  const slotH = 150, sY = lY - 36 - slotH;
  const end = ig ? sY - 44 : lY - 92;
  const big = ig ? 120 : 96;
  const gW = o.glyph ? Math.min(760, (ig ? 230 : 190) * o.glyph.width / o.glyph.height) : 0;
  const gH = o.glyph ? gW * o.glyph.height / o.glyph.width : 0;
  const frameH = o.glyph ? gH + 48 : 0;
  const tH = title3d(ctx, d.name, cx, 0, big, true);
  const contentTop = end - tH - (o.glyph ? 36 + frameH : 0);
  const pillH = ig ? 104 : 88;
  const photoH = Math.max(300, contentTop - 28 - pillH / 2);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, P3D.paperHi); bg.addColorStop(1, '#EBD7A8');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  cover(ctx, o.photo, 0, 0, W, photoH, o.off);
  ctx.fillStyle = P3D.ink; ctx.fillRect(0, photoH, W, 6);
  ctx.fillStyle = P3D.gold; ctx.fillRect(0, photoH + 6, W, 10);

  // lapisová pilulka s číslom psa na hrane fotky (Space Grotesk: Museum ani Cinzel nemajú čitateľné číslice)
  if (d.badge) {
    const bfs = ig ? 40 : 34;
    ctx.font = `600 ${bfs}px "Space Grotesk", sans-serif`;
    const bw = ctx.measureText(d.badge).width + bfs * 2, bh = bfs * 2.2, bx = cx - bw / 2, by = photoH + 8 - bh / 2;
    rr(ctx, bx, by + 10, bw, bh, bh / 2); ctx.fillStyle = '#060F2C'; ctx.fill();
    const g = ctx.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, '#5B6FAE'); g.addColorStop(1, '#0A1A4A');
    rr(ctx, bx, by, bw, bh, bh / 2); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#EFD79A'; ctx.stroke();
    ctx.fillStyle = '#EFD79A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.badge, cx, by + bh / 2 + 2);
  }

  const ty = title3d(ctx, d.name, cx, contentTop, big, false);
  if (o.glyph) {
    const fw = gW + 64, fx = cx - fw / 2, fy = ty + 36;
    rr(ctx, fx, fy + 9, fw, frameH, 28); ctx.fillStyle = P3D.goldSolid; ctx.fill();
    rr(ctx, fx, fy, fw, frameH, 28); ctx.fillStyle = P3D.paperHi; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = P3D.ink; ctx.stroke();
    ctx.drawImage(o.glyph, cx - gW / 2, fy + 24, gW, gH);
  }

  if (ig) {
    if (!o.exportMode) {
      ctx.save(); ctx.setLineDash([22, 16]); ctx.lineWidth = 5; ctx.strokeStyle = SLOT_INK;
      rr(ctx, cx - 310, sY, 620, slotH, 28); ctx.stroke(); ctx.restore();
      ctx.fillStyle = SLOT_INK; ctx.globalAlpha = 0.75; ctx.font = `500 34px "Space Grotesk", ${FONT_EMOJI}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`🔗  ${tx.slot}`, cx, sY + slotH / 2 + 2); ctx.globalAlpha = 1;
    }
  } else {
    ctx.fillStyle = WARM; ctx.font = `500 28px "Space Grotesk", ${FONT_EMOJI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(tx.fbLine, cx, lY - 56);
  }
  if (lg) {
    const lc = document.createElement('canvas'); lc.width = lgW * 2; lc.height = lgH * 2;
    const lx = lc.getContext('2d');
    if (lx) {
      lx.drawImage(lg, 0, 0, lc.width, lc.height);
      lx.globalCompositeOperation = 'source-in'; lx.fillStyle = P3D.ink; lx.fillRect(0, 0, lc.width, lc.height);
      ctx.drawImage(lc, cx - lgW / 2, lY, lgW, lgH);
    }
  }
  ctx.fillStyle = P3D.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  let mfs = 34;
  for (; mfs > 12; mfs -= 1) { ctx.font = `900 ${mfs}px ${MUSEUM}`; if (ctx.measureText(tx.motto).width <= lgW) break; }
  ctx.fillText(tx.motto, cx, mY);
}

function slug(name: string): string {
  return name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'trip';
}
const isTouch = () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
/** Logá sietí (monochróm Simple Icons, `icons/brands/`) — Matej 13. 10.: „dal by som tam dve ikonky IG a FB logo namiesto nášho“. */
const NET_ICON: Record<ShareFmt, string> = { ig: '/icons/brands/instagram.svg', fb: '/icons/brands/facebook.svg' };
/** Appka (APP_NEW): sociálne siete = okná z továrne, web ostáva na čiernobielych logách. */
const NET_SYS: Record<ShareFmt, string> = { ig: 'instagram', fb: 'facebook' };
const cld = (u: string, px: number) => (u.includes('/upload/') ? sizedUrl(u, px) : u);

const CSS = `
.tsh-veil{position:fixed;inset:0;z-index:1400;background:rgba(10,8,4,0.62);display:flex;align-items:flex-end;justify-content:center;}
.tsh-panel{width:100%;max-width:832px;max-height:calc(100dvh - 24px);overflow-y:auto;box-sizing:border-box;
  border-bottom-left-radius:0;border-bottom-right-radius:0;padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 16px);}
.tsh-grip{width:48px;height:4px;border-radius:999px;background:${T.border};margin:0 auto 12px;}
.tsh-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;}
.tsh-head h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.tsh-x{width:32px;height:32px;border-radius:999px;border:1px solid ${T.border};background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;color:${T.inkWarm};}
.tsh-ic{display:inline-block;width:16px;height:16px;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;flex-shrink:0;}
/* MOBIL = náhľad VEDĽA volieb, akcie pod nimi cez celú šírku (Matej 13. 10.: „náhľadový obrázok
   na jednej strane a obsah na druhej, lebo je to na scroll… vyzerá to nesúrodo“). */
.tsh-grid{display:grid;grid-template-columns:132px minmax(0,1fr);gap:16px;align-items:start;}
/* canvas má atribút width 1080 — bez min-width:0 roztiahne stĺpec za okraj okna */
.tsh-grid > *{min-width:0;}
.tsh-acts{grid-column:1 / -1;}
.tsh-prev canvas{display:block;width:100%;height:auto;border-radius:12px;box-shadow:${PACK_SHADOW.panel};background:${T.bg};}
.tsh-lbl{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};margin:0 0 8px;}
.tsh-sec + .tsh-sec{margin-top:16px;}
.tsh-pills{display:flex;flex-direction:column;gap:8px;}
.tsh-pill{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid ${T.border};background:transparent;color:${T.inkStrong};border-radius:999px;padding:8px 12px;font-family:${FONT_UI};font-weight:500;font-size:14px;cursor:pointer;}
.tsh-pill.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.tsh-photos{display:grid;grid-template-columns:repeat(2,minmax(0,72px));gap:8px;}
.tsh-ph{aspect-ratio:1;border-radius:12px;border:2px solid transparent;overflow:hidden;cursor:pointer;padding:0;background:${T.bg};}
.tsh-ph img{width:100%;height:100%;object-fit:cover;display:block;}
.tsh-ph.on{border-color:${LAPIS.edge};}
.tsh-own{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:1px dashed ${T.cardEdge};background:none;font-family:${FONT_UI};font-weight:500;font-size:10px;line-height:1.2;color:${T.inkWarm};text-align:center;}
.tsh-own .tsh-ic{width:24px;height:24px;}
.tsh-range{width:100%;accent-color:${LAPIS.edge};}
.tsh-cta{width:100%;border:0;border-radius:8px;padding:16px;font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:${LAPIS.ink};background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.tsh-cta:hover:not(:disabled){background:${LAPIS.gradHover};}
.tsh-cta:disabled{opacity:.6;cursor:default;}
.tsh-link{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:8px;border:1px solid ${T.border};border-radius:8px;padding:12px;background:transparent;font-family:${FONT_UI};font-weight:500;font-size:14px;color:${T.inkStrong};cursor:pointer;}
.tsh-steps{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;}
.tsh-steps li{display:flex;gap:12px;align-items:flex-start;font-family:${FONT_UI};font-size:12px;line-height:1.5;color:${T.inkStrong};}
.tsh-steps b{flex:0 0 24px;height:24px;border-radius:999px;background:${LAPIS.edge};color:${T.card};display:flex;align-items:center;justify-content:center;font-weight:600;font-size:12px;}
/* APPKA: PAPYRUS 3D okno (Matej 9. 11. 2026, hárok C3). Len pod html.papyrus3d, web nemá ani jednu z týchto tried. */
html.papyrus3d .tsh-panel{--on-l:#EFD79A;--on-bg:linear-gradient(180deg,color-mix(in srgb,#16307A 72%,white),#0A1A4A);--on-sh:inset 0 2px 0 rgba(255,255,255,.3),0 4px 0 color-mix(in srgb,#0A1A4A 60%,black),0 7px 9px var(--p3d-sh);background:var(--p3d-card);border:0;border-top:6px solid var(--p3d-gold);box-shadow:var(--p3d-lift);}
html.papyrus3d .tsh-grip{background:var(--p3d-gold);width:56px;height:6px;}
html.papyrus3d .tsh-head h2{font-family:'LT Museum',serif;font-weight:900;font-size:24px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);} /* písmo: nadpis */
html.papyrus3d .tsh-x.pk-b3{width:48px;height:48px;padding:0;border:2.5px solid var(--b3-l);border-radius:var(--b3-r);background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--p3d-ink);box-shadow:var(--p3d-b3);}
html.papyrus3d .tsh-x .tsh-ic{width:24px;height:24px;}
html.papyrus3d .tsh-lbl{color:var(--p3d-gold-ink);}
html.papyrus3d .tsh-prev canvas{border:2.5px solid var(--p3d-ink);box-shadow:var(--p3d-lift);}
html.papyrus3d .tsh-pills.pk-p3d-sw{display:grid;flex-direction:initial;}
html.papyrus3d .tsh-pill{border:0;background:transparent;border-radius:14px;min-width:0;min-height:50px;padding:4px;gap:4px;white-space:normal;overflow-wrap:anywhere;text-align:center;font:400 14px/1.1 'LT Museum',serif;color:var(--p3d-ink);}
html.papyrus3d .tsh-pill.on{border:2.5px solid var(--on-l);background:var(--on-bg);color:var(--on-l);box-shadow:var(--on-sh);}
html.papyrus3d .tsh-where{margin-bottom:12px;}
html.papyrus3d .tsh-where .tsh-pill{white-space:nowrap;overflow-wrap:normal;}
html.papyrus3d .tsh-ph{border:2.5px solid var(--p3d-ink);border-radius:16px;opacity:.6;}
html.papyrus3d .tsh-ph.on{border-color:#16307A;opacity:1;}
html.papyrus3d .tsh-own{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);opacity:1;color:var(--p3d-ink);font:500 12px/1.2 'Space Grotesk',sans-serif;}
html.papyrus3d .tsh-cta.pk-b3,html.papyrus3d .tsh-link.pk-b3{width:100%;height:56px;padding:0 16px;border:2.5px solid var(--b3-l);border-radius:var(--b3-r);background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);font:400 20px/1 'LT Museum',serif;letter-spacing:0;text-transform:none;box-shadow:var(--p3d-b3);} /* písmo: cta */
html.papyrus3d .tsh-link.pk-b3{margin-top:16px;}
html.papyrus3d .tsh-link img{width:28px;height:28px;}
html.papyrus3d .tsh-steps li{font-size:14px;}
html.papyrus3d .tsh-steps b{background:#16307A;color:var(--on-l);}
@media(min-width:721px){
  .tsh-veil{align-items:center;padding:24px;}
  .tsh-panel{border-radius:16px;padding:24px;max-height:calc(100dvh - 48px);}
  .tsh-grip{display:none;}
  .tsh-grid{grid-template-columns:auto minmax(0,1fr);gap:16px 24px;}
  .tsh-prev{grid-row:1 / span 2;}
  .tsh-acts{grid-column:2;}
  .tsh-prev canvas{width:auto;height:min(calc(100dvh - 160px),560px);}
  .tsh-pills{flex-direction:row;}
  .tsh-photos{grid-template-columns:repeat(2,96px);}
}
`;

export function TripShareSheet({ data, onClose, kind = 'trip' }: { data: TripShareData; onClose: () => void; kind?: ShareKind }) {
  const sw = useSheetSwipe(onClose);
  const K = KIND_KEYS[kind];
  const t = useT();
  const { toast } = useToast();
  const cvRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<Blob | null>(null);
  const [fmt, setFmt] = useState<ShareFmt>('ig');
  // Fotky výletu sa nevyberajú — hlavná + vlastná (Matej 13. 10.: „každý bude chcieť pridať vlastnú“).
  const [useOwn, setUseOwn] = useState(false);
  const [ownSrc, setOwnSrc] = useState<string | null>(null);
  const [own, setOwn] = useState<HTMLImageElement | null>(null);
  const [off, setOff] = useState(0.5);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [fontsOk, setFontsOk] = useState(false);

  const photos = data.photos.length ? data.photos : (data.fallbackPhoto ? [data.fallbackPhoto] : []);
  const [withGlyph, setWithGlyph] = useState(true);
  const [glyphImg, setGlyphImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!data.glyph) { setGlyphImg(null); return; }
    let live = true;
    loadImg(cld(data.glyph, 800)).then((i) => { if (live) setGlyphImg(i); });
    return () => { live = false; };
  }, [data.glyph]);
  const glyph = withGlyph ? glyphImg : null;
  const tx: Texts = {
    slot: t('pack.trip.shareSlot'),
    fbLine: kind === 'trip' ? `🐾  ${t(K.fbLine)}` : t(K.fbLine),
    motto: t('whatNext.motto').replace(/\.$/, ''),
  };
  const txKey = `${tx.slot}|${tx.fbLine}|${tx.motto}`;
  const photosKey = photos.join('|');
  // článok posiela nový objekt pri každom rendri — prekresľuje sa podľa OBSAHU, nie identity
  const dataKey = JSON.stringify(data);

  useEffect(() => {
    Promise.all([document.fonts.load('700 80px Cinzel'), document.fonts.load('700 80px "Cinzel Decorative"'), document.fonts.load('500 38px "Space Grotesk"'), document.fonts.load('600 36px "Space Grotesk"'), ...(APP_NEW ? [document.fonts.load('900 80px "LT Museum"')] : [])])
      .catch(() => undefined).finally(() => setFontsOk(true));
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // vybraná fotka výletu → obrázok (vlastná fotka má prednosť)
  useEffect(() => {
    if (useOwn && own) { setPhoto(own); return; }
    const src = photos[0];
    if (!src) { setPhoto(null); return; }
    let live = true;
    loadImg(cld(src, 1400)).then((i) => { if (live) setPhoto(i); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [own, useOwn, photosKey]);

  // náhľad (s rámikom) + hotový obrázok na odoslanie (bez rámika) — vopred, kvôli gestu na iOS
  useEffect(() => {
    const cv = cvRef.current;
    if (!fontsOk || !cv) return;
    let live = true;
    setReady(false);
    const o = { fmt, photo, off, glyph };
    // APP_NEW = Papyrus 3D šablóna (výlet `render3d`, karta psa `render3dDog`); web ostáva na pôvodnej `render`
    const draw = APP_NEW ? (kind === 'trip' ? render3d : render3dDog) : render;
    void (async () => {
      let b: Blob | null = null;
      try {
        await draw(cv, data, tx, { ...o, exportMode: false });
        if (!live) return;
        const c = document.createElement('canvas');
        await draw(c, data, tx, { ...o, exportMode: true });
        b = await canvasToBlob(c);
      } catch { /* bez obrázka ostane aspoň odkaz, tlačidlo nesmie ostať mŕtve (Danka 10. 11.) */ }
      if (live) { blobRef.current = b; setReady(true); }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsOk, fmt, photo, off, glyph, dataKey, txKey, kind]);

  const fileName = (b: Blob) => `dogypt-${slug(data.name)}-${fmt}.${b.type === 'image/jpeg' ? 'jpg' : 'png'}`;
  const copyLink = useCallback(async () => {
    try { await navigator.clipboard.writeText(data.url); return true; } catch { return false; }
  }, [data.url]);
  const download = (b: Blob) => {
    const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = fileName(b);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  };

  // ⚠️ Žiadny `await` pred `navigator.share` — gesto by vypršalo (iOS).
  const share = () => {
    const b = blobRef.current;
    if (!b) { void copyOnly(); return; }
    const copied = copyLink();
    // V appke natívny hárok: Android WebView nemá `navigator.share` a `a.download` tam ticho nespraví nič (Danka 8. 11.).
    if (IS_APP) {
      void shareFile(b, fileName(b)).then((ok) => { if (!ok) void copyOnly(); }).catch(() => void copyOnly());
      return;
    }
    const file = new File([b], fileName(b), { type: b.type });
    const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
    if (isTouch() && typeof navigator.share === 'function' && nav.canShare?.({ files: [file] })) {
      navigator.share({ files: [file] }).catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        download(b);
      });
      return;
    }
    download(b);
    void copied.then((ok) => toast({ description: t(ok ? 'pack.trip.shareSavedCopied' : 'pack.trip.storySaved') }));
  };
  const copyOnly = async () => {
    toast({ description: (await copyLink()) ? t(K.copied) : data.url });
  };
  const onOwn = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const i = new Image();
    i.onload = () => { setOwn(i); setUseOwn(true); setOff(0.5); };
    const u = URL.createObjectURL(f);
    setOwnSrc(u);
    i.src = u;
  };

  // PC: hárok Macu/Windowsu IG neponúka ⇒ tlačidlo sa volá podľa toho, čo naozaj urobí (Matej 13. 10.:
  // „CTA je zdieľať na IG FB, ale po kliku sa fotka stiahne… nemalo by tam byť stiahnuť fotku?“)
  const pc = !isTouch();
  const whereSec = (
    <div className="tsh-sec tsh-where">
      <div className="tsh-lbl">{t('pack.trip.shareWhere')}</div>
      <div className={`tsh-pills${APP_NEW ? ' pk-p3d-sw' : ''}`}>
        {(['ig', 'fb'] as ShareFmt[]).map((f) => (
          <button key={f} type="button" className={`tsh-pill${fmt === f ? ' on' : ''}`} onClick={() => setFmt(f)}>
            {APP_NEW ? <SysIcon name={NET_SYS[f]} size={28} /> : <span className="tsh-ic" style={{ '--ic': `url(${NET_ICON[f]})` } as React.CSSProperties} />}
            {t(f === 'ig' ? 'pack.trip.shareIg' : 'pack.trip.shareFb')}
          </button>
        ))}
      </div>
    </div>
  );
  const steps = pc
    ? [t(K.step1), t('pack.trip.shareStepPc2'), t(fmt === 'ig' ? 'pack.trip.shareStepIg3' : K.fb3)]
    : fmt === 'ig'
    ? [t(K.step1), t('pack.trip.shareStepIg2'), t('pack.trip.shareStepIg3')]
    : [t(K.step1), t('pack.trip.shareStepFb2'), t(K.fb3)];

  return createPortal((
    <>
      <style>{CSS}</style>
      <div className="tsh-veil" role="dialog" aria-modal="true" aria-label={t(K.title)}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="tsh-panel" style={{ ...PACK_BOX.panel, ...sw.sheetStyle }}>
          <div className="tsh-grip" {...sw.handle} />
          <div className="tsh-head" {...sw.handle}>
            <h2>{t(K.title)}</h2>
            <button type="button" className={`tsh-x${APP_NEW ? ' pk-b3 pk-b3--paper pk-b3--round' : ''}`} onClick={onClose} aria-label={t('pack.trip.shareClose')}>
              {APP_NEW ? <SysIcon name="krizik" size={28} /> : <span className="tsh-ic" style={{ '--ic': `url(${ICON('cross')})` } as React.CSSProperties} />}
            </button>
          </div>
          {/* Appka: KAM cez celú šírku, v stĺpci sa ikonka s textom lámali (Matej 10. 11.). */}
          {APP_NEW && whereSec}
          <div className="tsh-grid">
            <div className="tsh-prev"><canvas ref={cvRef} /></div>
            <div>
              {!APP_NEW && whereSec}
              <div className="tsh-sec">
                <div className="tsh-lbl">{t('pack.trip.sharePhoto')}</div>
                <div className="tsh-photos">
                  {photos[0] && (
                    <button type="button" className={`tsh-ph${!useOwn ? ' on' : ''}`} aria-label={t(K.main)}
                      onClick={() => { setUseOwn(false); setOff(0.5); }}>
                      <img src={cld(photos[0], 200)} alt="" />
                    </button>
                  )}
                  {own && ownSrc ? (
                    <button type="button" className={`tsh-ph${useOwn ? ' on' : ''}`} aria-label={t('pack.trip.shareOwnOn')}
                      onClick={() => { if (useOwn) fileRef.current?.click(); else { setUseOwn(true); setOff(0.5); } }}>
                      <img src={ownSrc} alt="" />
                    </button>
                  ) : (
                    <button type="button" className="tsh-ph tsh-own" onClick={() => fileRef.current?.click()}>
                      {APP_NEW ? <SysIcon name="foto" size={28} /> : <span className="tsh-ic" style={{ '--ic': `url(${ICON('camera')})` } as React.CSSProperties} />}
                      {t('pack.trip.shareOwnTile')}
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onOwn} />
              </div>
              {data.glyph && (
                <div className="tsh-sec">
                  <div className="tsh-lbl">{t('pack.dogShare.glyph')}</div>
                  <div className={`tsh-pills${APP_NEW ? ' pk-p3d-sw' : ''}`}>
                    {[true, false].map((on) => (
                      <button key={String(on)} type="button" className={`tsh-pill${withGlyph === on ? ' on' : ''}`} onClick={() => setWithGlyph(on)}>
                        {t(on ? 'pack.dogShare.glyphOn' : 'pack.dogShare.glyphOff')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="tsh-sec">
                <div className="tsh-lbl">{t('pack.trip.shareShift')}</div>
                <input className="tsh-range" type="range" min={0} max={100} value={Math.round(off * 100)}
                  onChange={(e) => setOff(Number(e.target.value) / 100)} />
              </div>
            </div>
            <div className="tsh-acts">
              <button type="button" className={`tsh-cta${APP_NEW ? ' pk-b3 pk-b3--lapis' : ''}`} onClick={share} disabled={!ready}>
                {t(pc ? 'pack.trip.shareCtaDownload' : fmt === 'ig' ? 'pack.trip.shareCtaIg' : 'pack.trip.shareCtaFb')}
              </button>
              <button type="button" className={`tsh-link${APP_NEW ? ' pk-b3 pk-b3--paper' : ''}`} onClick={copyOnly}>
                {APP_NEW ? <SysIcon name="odkaz" size={28} /> : <span className="tsh-ic" style={{ '--ic': `url(${ICON('link')})` } as React.CSSProperties} />}
                {t(K.copy)}
              </button>
              <ol className="tsh-steps">
                {steps.map((s, i) => <li key={i}><b>{i + 1}</b><span>{s}</span></li>)}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  ), document.body);
}

/** Tlačidlo STORY v článku výletu (rad `pta-actbtn`) — otvára okno ZDIEĽAJ VÝLET. */
export function TripShareButton({ data }: { data: TripShareData }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={`pta-actbtn pta-actbtn--blue${APP_NEW ? ' pk-b3 pk-b3--paper pta-share2' : ''}`} onClick={() => setOpen(true)} aria-label={APP_NEW ? t('pack.trip.share') : t('pack.trip.story')}>
        {/* Appka: JEDNO tlačidlo Zdieľať namiesto reťaze + IG + FB; okno má obrázok, odkaz aj hárok (Matej 10. 11. 2026). */}
        {APP_NEW ? <SysIcon name="zdielat" size={28} /> : (<>
          <span className="pta-actbtn-icon pta-ic-mask" style={{ '--ic': `url(${NET_ICON.ig})` } as React.CSSProperties} />
          <span className="pta-actbtn-icon pta-ic-mask" style={{ '--ic': `url(${NET_ICON.fb})` } as React.CSSProperties} />
        </>)}
        <span className="pta-actbtn-label">{APP_NEW ? t('pack.trip.share') : t('pack.trip.story')}</span>
      </button>
      {open && <TripShareSheet data={data} onClose={() => setOpen(false)} />}
    </>
  );
}
