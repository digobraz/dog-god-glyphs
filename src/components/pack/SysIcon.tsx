// SYSTÉMOVÉ IKONKY — rodina z továrne `plany/ikonky/` (Matej 8. 11. 2026: *„teraz to dajme do apky nech to viem posúdiť"*).
// Farebná samolepka s obrysom, `public/icons/sys/`. Zatiaľ len appka (APP_NEW), web ostáva na hand-drawn kresbách.
// Stav „nezapnuté" nesie šedá, samolepka by inak vyzerala zapnutá stále.
import type { CSSProperties } from 'react';
import { APP_NEW } from '@/lib/packFlags';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { HandPaw, HandSearch, HandStar } from '@/components/pack/HandIcons';

export const sysSrc = (name: string) => `/icons/sys/${name}.webp`;

export function SysIcon({ name, size = 24, off, style }: { name: string; size?: number; off?: boolean; style?: CSSProperties }) {
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

export const SearchMark = ({ size }: { size: number }) => (APP_NEW ? <SysIcon name="lupa" size={size + 6} /> : <HandSearch size={size} />);
export const LikeMark =({ on }: { on: boolean }) => (APP_NEW ? <SysIcon name="lajk" size={28} off={!on} /> : <HandPaw size={24} on={on} />);
export const CommentMark = () => (APP_NEW ? <SysIcon name="komentar" size={28} /> : <BrandIcon name="chat" size={24} tint="dark" />);
export const SaveMark = ({ on }: { on: boolean }) => (APP_NEW ? <SysIcon name="ulozit" size={28} off={!on} /> : <HandStar size={24} filled={on} />);
