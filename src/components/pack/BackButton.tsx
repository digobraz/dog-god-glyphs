// ── NÁVRAT „SPÄŤ" — JEDEN TVAR PRE CELÝ /pack (LOCKED 2026-09-01) ───────────────────────
//
// Matej 1. 9. 2026: „btw tá šípka v strede (dozadu) nemáme brand? každopádne mali by sme ju
// ujednotiť aj velkostne všade kde sa nachádza (aj napr pri vybere aktivity atď".
//
// Brand ju MÁ — `HandArrowLeft` v `HandIcons.tsx` (hand-drawn set). Volali ju ale len dve
// miesta; zvyšok appky kreslil HOLÝ TEXTOVÝ ZNAK `←` a každý súbor si napísal vlastné čísla:
// kruh 38 / 38 / 34 / 32 / 30 / 30 / 30 px, písmo 19 / 17 / 17 / 14 / 15 / 15 / 15,
// plus dva textové odkazy „‹ Back". Deväť podôb jedného gesta.
//
// ⚠️ PREČO IKONKA A NIE `←`: textový znak vykreslí každý systém inou hrúbkou a inou výškou
// nad účiarou, takže v jednom kruhu sedí vycentrovaný a v druhom o pixel vyššie — presne to
// bolo vidno medzi `.tl-back` (19 px) a `.trp-panelnav-btn` (14 px). Kreslená šípka je vždy
// tá istá a cez `currentColor` dedí farbu povrchu, na ktorom stojí.
//
// ── AKO TO POUŽIŤ ──────────────────────────────────────────────────────────────────────
//   1. Nové alebo jednoduché miesto  → <BackButton tone="pale" onClick={…} label={…} />
//   2. Miesto s VLASTNOU triedou, ktorú nemôžem zrušiť (zdieľa ju iné tlačidlo, alebo na nej
//      visí viditeľnostná logika) → nechaj triedu, vlož do nej `backCircleCSS(tone)` a znak
//      `←` vymeň za <BackIcon />. Čísla tak ostanú v JEDNOM súbore.
//   3. Textový odkaz „‹ Späť na výber" → <BackLink tone …>text</BackLink>
//
// ⚠️ NEOPISUJ ČÍSLA. Kto potrebuje priemer alebo veľkosť ikonky, číta `BACK`.
import type { CSSProperties, ReactNode } from 'react';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import { PACK_THEME } from '@/components/pack/packTheme';
import { PALE } from '@/components/pack/navGoldSkin';

const T = PACK_THEME;

/** Jediný zdroj rozmerov návratu. Ladené v `plany/nakres-triplist-2026-09-01.html` (tab A). */
export const BACK = {
  /** priemer kruhu (px) */
  dia: 36,
  /** veľkosť `HandArrowLeft` v kruhu (px) */
  icon: 15,
  /** hrúbka lemu (px) */
  border: 1,
  /** veľkosť ikonky v textovom odkaze — menšia, lebo stojí vedľa písma */
  linkIcon: 13,
} as const;

/**
 * Povrch, na ktorom návrat stojí. NIE JE to vkusová voľba — určuje ho podklad:
 *  `pale`  papyrusová doska (triplist, článok, bledý panel mapy)
 *  `dark`  tmavý panel toku (správy, pridávanie, podujatie)
 *  `scrim` priamo na fotke (detail výletu) — potrebuje vlastné stmavenie, priesvitná
 *          plocha nad obrázkom je nečitateľná
 */
export type BackTone = 'pale' | 'dark' | 'scrim';

const TONE: Record<BackTone, { bg: string; border: string; ink: string; hoverBg: string; hoverBorder: string; hoverInk: string }> = {
  pale: {
    bg: PALE.soft, border: PALE.border, ink: PALE.ink,
    hoverBg: '#FFFDF6', hoverBorder: T.cardEdge, hoverInk: PALE.deep,
  },
  dark: {
    bg: 'rgba(245,240,228,0.07)', border: T.onDarkBorder, ink: T.onDark,
    hoverBg: 'rgba(245,240,228,0.12)', hoverBorder: T.cardEdge, hoverInk: T.cardEdge,
  },
  scrim: {
    bg: 'rgba(0,0,0,0.55)', border: 'rgba(255,255,255,0.28)', ink: '#fff',
    hoverBg: 'rgba(0,0,0,0.72)', hoverBorder: 'rgba(255,255,255,0.5)', hoverInk: '#fff',
  },
};

/**
 * CSS telo kruhu pre miesto, ktoré si svoju triedu musí nechať. Vracia deklarácie BEZ
 * selektora — vlož ich do existujúceho pravidla; hover si trieda dopíše z `backHoverCSS`.
 *
 * ⚠️ `position` sem NEPATRÍ. Časť miest je v toku, časť absolútne nad fotkou — polohu drží
 * volajúci, tvar tento súbor. (Tá istá deliaca čiara ako v `mapDockShape.ts`.)
 */
export function backCircleCSS(tone: BackTone): string {
  const c = TONE[tone];
  return [
    'display:inline-flex', 'align-items:center', 'justify-content:center',
    `width:${BACK.dia}px`, `height:${BACK.dia}px`, 'border-radius:50%',
    `background:${c.bg}`, `border:${BACK.border}px solid ${c.border}`, `color:${c.ink}`,
    'line-height:1', 'cursor:pointer', 'flex-shrink:0', 'padding:0',
    'transition:border-color .15s,color .15s,background .15s',
  ].join(';') + ';';
}

/** Hover k `backCircleCSS` — samostatne, lebo ide do vlastného `:hover` pravidla. */
export function backHoverCSS(tone: BackTone): string {
  const c = TONE[tone];
  return `background:${c.hoverBg};border-color:${c.hoverBorder};color:${c.hoverInk};`;
}

/** Šípka v kruhu. Veľkosť sa NEPREDÁVA parametrom — je to lock, nie voľba. */
export function BackIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return <HandArrowLeft size={BACK.icon} className={className} style={style} />;
}

/** Šípka v textovom odkaze — o dva pixely menšia, aby nepresahovala výšku písma. */
export function BackLinkIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return <HandArrowLeft size={BACK.linkIcon} className={className} style={style} />;
}

/**
 * Hotové kruhové tlačidlo pre miesta bez zvláštností. `label` ide do `aria-label` —
 * ikonka sama je `aria-hidden`, takže bez neho je tlačidlo pre čítačku nemé.
 */
export function BackButton({ tone, onClick, label, className, style }: {
  tone: BackTone;
  onClick: () => void;
  label: string;
  className?: string;
  style?: CSSProperties;
}) {
  const c = TONE[tone];
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: BACK.dia, height: BACK.dia, borderRadius: '50%',
        background: c.bg, border: `${BACK.border}px solid ${c.border}`, color: c.ink,
        lineHeight: 1, cursor: 'pointer', flexShrink: 0, padding: 0,
        transition: 'border-color .15s,color .15s,background .15s',
        ...style,
      }}
    >
      <BackIcon />
    </button>
  );
}

/**
 * Textový návrat „‹ Späť na výber". Ostáva textom zámerne: na týchto miestach nesie slovo
 * informáciu KAM sa človek vracia, a tú kruh nepovie. Mení sa len znak `‹` / `←` za kresbu.
 */
export function BackLink({ tone, onClick, className, style, children }: {
  tone: BackTone;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        border: 0, background: 'transparent', color: TONE[tone].ink,
        cursor: 'pointer', ...style,
      }}
    >
      <BackLinkIcon />
      <span>{children}</span>
    </button>
  );
}
