// ════════════════════════════════════════════════════════════════════════════
// AVATAR S PRSTENCOM POSTUPU — jediný zdroj geometrie (2026-09-22)
// ────────────────────────────────────────────────────────────────────────────
// Predtým DVE KÓPIE tej istej rovnice (`AV_D`/`AV_RING`/`AV_GAP` + odvodené
// `RING_SW`/`RING_R`/`RING_C`/`PHOTO`) — jedna v `PackMap.tsx` (`renderIdentity()`,
// lock `plany/locky/map-identita.md`), druhá v `PackIdentityBar.tsx`. Presne takto
// sa geometria raz už rozišla (5. 8. 2026, viď komentár v PackMap.tsx). Odteraz JEDEN
// modul počíta rovnicu aj kreslí prstenec+fotku+odznak; oba povrchy si nesú LEN
// vlastné triedy (CSS ostáva pri nich — skin, lem, klik na PÚTNIK/level panel
// sú vlastnosti POVRCHU, nie geometrie) a vlastný obsah odznaku.
//
// ⚠️ Tento komponent NEROZHODUJE o skine ani o kliku — `wrapStyle`/`badgeStyle`
//    (typicky `tierVars(level)`) aj `onClick` (na obale, ak treba) si nesie volajúci.
//    `stroke-width` a polomer sú v JEDNOTKÁCH VIEWBOXU (px / AV_D * 100), nie v px —
//    inak sa prstenec pri zmene priemeru rozíde (viď PackMap.tsx pôvodný komentár).
// ════════════════════════════════════════════════════════════════════════════
import type { CSSProperties, ReactNode } from 'react';

export const AV_D = 44;         // priemer celého bloku avatara
export const AV_RING = 3;       // hrúbka prstenca
export const AV_GAP = 2;        // medzera prstenec ↔ fotka
export const RING_SW = (AV_RING / AV_D) * 100;
export const RING_R = 50 - RING_SW / 2;
export const RING_C = 2 * Math.PI * RING_R;
/** Fotka ostáva 34 px pri `AV_D=44` — obal je väčší o lem a medzeru, nie fotka menšia. */
export const PHOTO = AV_D - 2 * (AV_RING + AV_GAP);

export function AvatarRing({
  pct, avatarUrl, avatarInitial, avatarAlt = '',
  wrapClassName, wrapStyle,
  photoClassName,
  badgeClassName, badgeStyle, badgeAriaLabel, badgeContent,
}: {
  /** postup v leveli, 0–100 (`levelInfo.pct` / `lv.pct` z `profileLevelFor`) */
  pct: number;
  avatarUrl?: string | null;
  avatarInitial?: ReactNode;
  avatarAlt?: string;
  wrapClassName: string;
  wrapStyle?: CSSProperties;
  photoClassName: string;
  badgeClassName: string;
  badgeStyle?: CSSProperties;
  badgeAriaLabel: string;
  badgeContent: ReactNode;
}) {
  return (
    <span className={wrapClassName} style={wrapStyle}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth={RING_SW}
          stroke="var(--tier-b,#E69E1A)" strokeOpacity={0.2} />
        <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth={RING_SW}
          stroke="var(--tier-b,#E69E1A)" strokeLinecap="round"
          strokeDasharray={`${(RING_C * pct) / 100} ${RING_C}`}
          transform="rotate(-90 50 50)" />
      </svg>
      {avatarUrl
        ? <img className={photoClassName} src={avatarUrl} alt={avatarAlt} />
        : <span className={photoClassName}>{avatarInitial}</span>}
      <span className={badgeClassName} style={badgeStyle} aria-label={badgeAriaLabel}>{badgeContent}</span>
    </span>
  );
}
