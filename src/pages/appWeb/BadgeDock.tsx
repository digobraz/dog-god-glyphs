import { useState } from 'react';

export type DockItem = { src: string; cap: string };

/** Podiel šírky podľa vzdialenosti od zväčšeného odznaku. */
const WEIGHT = [6, 3.5, 2.5, 1.6, 1.2];

/** Rad odznakov v rámiku: jeden veľký, ostatné k okrajom menšie, myš zväčší ten pod sebou (Matej 10. 11.).
 *  Myš sa mapuje na rovnaké sloty podľa X, nie na tlačidlá: tie menia šírku a pod kurzorom by sa preblikávali. */
export function BadgeDock({ items, start }: { items: DockItem[]; start: number }) {
  const [on, setOn] = useState(start);
  return (
    <div className="dock">
      <div className="dock-row" onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        setOn(Math.min(items.length - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * items.length))));
      }}>
        {items.map((it, i) => (
          <button key={it.src} type="button" aria-label={it.cap} aria-pressed={i === on}
            style={{ flexGrow: WEIGHT[Math.min(Math.abs(i - on), WEIGHT.length - 1)] }}
            onFocus={() => setOn(i)}
            onClick={(e) => { if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === 'mouse') return; setOn(i); }}>
            <img src={it.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <p className="dock-cap">{items[on].cap}</p>
    </div>
  );
}
