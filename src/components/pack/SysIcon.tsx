// SYSTÉMOVÉ IKONKY — rodina z továrne `plany/ikonky/` (Matej 8. 11. 2026: *„teraz to dajme do apky nech to viem posúdiť"*).
// Farebná samolepka s obrysom, `public/icons/sys/`. Zatiaľ len appka (APP_NEW), web ostáva na hand-drawn kresbách.
// Stav „nezapnuté" nesie šedá, samolepka by inak vyzerala zapnutá stále.
import type { CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import { APP_NEW } from '@/lib/packFlags';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { HandPaw, HandSearch, HandStar } from '@/components/pack/HandIcons';
import { zapisSys } from '@/components/pack/profile/zapisDnaModel';
import { ThinArrow, THIN_ARROW_NAMES } from '@/components/pack/ThinArrow';

/** Značka zápisu dňa: v appke kresba, na webe emoji. Vstup je emoji dlaždice, aby kalendár a Kronika nemuseli meniť dáta. */
export const ZapisGlyph = ({ mark, size, sys }: { mark: string; size: number; sys?: string }) => {
  const name = APP_NEW ? (sys ?? zapisSys(mark)) : null;
  return name ? <SysIcon name={name} size={size} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> : <>{mark}</>;
};

export const sysSrc = (name: string) => `/icons/sys/${name}.webp`;

export function SysIcon({ name, size = 24, off, style }: { name: string; size?: number; off?: boolean; style?: CSSProperties }) {
  // Šípky (`spat`/`sipka`/`rozbalit`) už nie sú hrubé samolepky — tenká SVG čiara, jedna pre celú appku (ThinArrow.tsx).
  if (APP_NEW && THIN_ARROW_NAMES[name]) return <ThinArrow dir={THIN_ARROW_NAMES[name]} size={size} style={{ ...style, ...(off ? { opacity: 0.45 } : null) }} />;
  return (
    <img
      src={sysSrc(name)}
      alt=""
      aria-hidden
      draggable={false}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block', flexShrink: 0, ...(off ? { filter: 'grayscale(1)', opacity: 0.55 } : null), ...style }}
    />
  );
}

/** Šípka dole (rozbaliť): v appke samolepka `sipka` otočená dole, na webe lucide. Rodič ju otáča ďalej (otvorené = hore). */
export const ChevDown = ({ size = 16, style, up }: { size?: number; style?: CSSProperties; up?: boolean }) => (APP_NEW
  ? <ThinArrow dir={up ? 'up' : 'down'} size={size + 6} style={style} />
  : <ChevronDown aria-hidden className={size <= 12 ? 'h-3 w-3' : 'h-4 w-4'} style={{ ...style, ...(up ? { transform: 'rotate(180deg)' } : null) }} />);

export const SearchMark = ({ size }: { size: number }) => (APP_NEW ? <SysIcon name="lupa" size={size + 6} /> : <HandSearch size={size} />);
export const LikeMark =({ on }: { on: boolean }) => (APP_NEW ? <SysIcon name="lajk" size={28} off={!on} /> : <HandPaw size={24} on={on} />);
export const CommentMark = () => (APP_NEW ? <SysIcon name="komentar" size={28} /> : <BrandIcon name="chat" size={24} tint="dark" />);
// Zdieľanie nemá hand-drawn kresbu, takže aj web berie systémovú samolepku.
export const ShareMark = () => <SysIcon name="zdielat" size={APP_NEW ? 28 : 24} />;
export const SaveMark = ({ on }: { on: boolean }) => (APP_NEW ? <SysIcon name="ulozit" size={28} off={!on} /> : <HandStar size={24} filled={on} />);
