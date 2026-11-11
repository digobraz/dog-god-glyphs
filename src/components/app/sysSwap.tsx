// Výmena kresby za samolepku z továrne (`public/icons/sys/`) — len pod APP_NEW, web ostáva na hand-drawn kite.
// Zadanie ikonky-appka-vibe 9. 11. 2026: samolepka má vzduch v obrázku, preto o 4 px väčšia (min 18 px).
import type { CSSProperties } from 'react';
import { APP_NEW } from '@/lib/packFlags';
import { SysIcon } from '@/components/pack/SysIcon';
import { HandAlert, HandArrowLeft, HandCamera, HandCheck, HandHeart, HandLock, HandPaw, HandPencil, HandSearch, HandStar, HandTrash } from '@/components/pack/HandIcons';

type P = { size?: number; style?: CSSProperties; solid?: boolean };
const big = (n: number) => Math.max(n + 4, 18);

/** Späť / dozadu. `spat.webp` smeruje doľava, rovnako ako HandArrowLeft. */
export const BackIc = ({ size = 16, style, solid }: P) =>
  APP_NEW ? <SysIcon name="spat" size={big(size)} style={style} /> : <HandArrowLeft size={size} solid={solid} style={style} />;
/** Ďalej (`sipka.webp` smeruje doprava). Stará kresba = HandArrowLeft otočená o 180°. */
export const NextIc = ({ size = 16, style, solid }: P) =>
  APP_NEW ? <SysIcon name="sipka" size={big(size)} style={style} /> : <HandArrowLeft size={size} solid={solid} style={{ transform: 'rotate(180deg)', ...style }} />;
export const LockIc = ({ size = 16, style }: P) =>
  APP_NEW ? <SysIcon name="zamok" size={big(size)} style={style} /> : <HandLock size={size} style={style} />;
export const SearchIc = ({ size = 16, style }: P) =>
  APP_NEW ? <SysIcon name="lupa" size={big(size)} style={style} /> : <HandSearch size={size} style={style} />;
export const CheckIc = ({ size = 16, style }: P) =>
  APP_NEW ? <SysIcon name="fajka" size={big(size)} style={style} /> : <HandCheck size={size} style={style} />;
/** Lajk (packa). Šedá samolepka = POČET 0 (`n`, Matej 11. 11. 2026); bez `n` rozhoduje môj klik. `color` je farba starej kresby. */
export const LikeIc = ({ size = 16, on, n, color, style }: P & { on?: boolean; n?: number; color?: string }) =>
  APP_NEW ? <SysIcon name="lajk" size={big(size)} off={n === undefined ? !on : n === 0 && !on} style={style} /> : <HandPaw size={size} on={on} color={color} style={style} />;
export const LikeHeartIc = ({ size = 16, on, style }: P & { on?: boolean }) =>
  APP_NEW ? <SysIcon name="lajk" size={big(size)} off={!on} style={style} /> : <HandHeart size={size} on={on} style={style} />;
export const SaveIc = ({ size = 16, filled, n, style }: P & { filled?: boolean; n?: number }) =>
  APP_NEW ? <SysIcon name="ulozit" size={big(size)} off={n === undefined ? !filled : n === 0 && !filled} style={style} /> : <HandStar size={size} filled={filled} style={style} />;
export const PencilIc = ({ size = 16, style }: P) =>
  APP_NEW ? <SysIcon name="ceruzka" size={big(size)} style={style} /> : <HandPencil size={size} style={style} />;
export const AlertIc = ({ size = 16, style }: P) =>
  APP_NEW ? <SysIcon name="pozor" size={big(size)} style={style} /> : <HandAlert size={size} style={style} />;
export const CameraIc = ({ size = 16, style }: P) =>
  APP_NEW ? <SysIcon name="foto" size={big(size)} style={style} /> : <HandCamera size={size} style={style} />;
export const TrashIc = ({ size = 16, style }: P) =>
  APP_NEW ? <SysIcon name="kos" size={big(size)} style={style} /> : <HandTrash size={size} style={style} />;
/** Miesto v riadku textu, len appka (na webe ostáva emoji na pôvodnom mieste, nech sedí základňa check:ikony). */
export const PinMark = ({ size = 16 }: { size?: number }) =>
  <SysIcon name="pin" size={big(size)} style={{ display: 'inline-block', verticalAlign: -5, margin: '-4px 0' }} />;
export const MoreIc = ({ size = 16 }: { size?: number }) =>
  APP_NEW ? <SysIcon name="menu" size={big(size)} /> : <>⋯</>;
