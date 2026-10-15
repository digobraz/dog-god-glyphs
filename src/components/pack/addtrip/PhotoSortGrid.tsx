/**
 * ── FOTKY VÝLETU: ŤAHAJ A PUSTI (Matej 15. 10. 2026) ─────────────────────────────────────
 *
 * „to presúvanie fotiek je divné na tie šípky, nedá sa to drag and drop???"
 *
 * Šípky ‹ › na každej miniatúre zanikli. Poradie sa mení ťahaním — myšou hneď, prstom po
 * krátkom podržaní (inak by ťah prstom nevedel rolovať stránku). Ťuknutie = TITULNÁ, a tá
 * SKOČÍ NA PRVÉ MIESTO: článok, karty aj stena berú `photos[0]`, takže „prvá = titulná" je
 * jediné poradie, ktoré obrazovka ukazuje pravdivo.
 *
 * ⚠️ HTML5 drag & drop (`draggable`) NA MOBILE NEFUNGUJE — preto pointer udalosti.
 * ⚠️ Rolovanie počas ťahu prstom zastaví LEN non-passive `touchmove` (iOS Safari ignoruje
 *    `touch-action` zmenené uprostred gesta). Bez neho by sa stránka hýbala pod fotkou.
 * ⚠️ Poradie sa počas ťahu prekresľuje ŽIVO: index pod prstom je teda priamo cieľová
 *    pozícia — žiadny prepočet „pred/za" pri pustení.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { sizedUrl } from '@/services/cloudinaryService';
import { HandTrash } from '@/components/pack/HandIcons';

const LONG_PRESS_MS = 220;
const SLOP_PX = 6;

const moved = <T,>(arr: T[], from: number, to: number): T[] => {
  const n = [...arr];
  const [x] = n.splice(from, 1);
  n.splice(to, 0, x);
  return n;
};

export function PhotoSortGrid({ photos, onMove, onCover, onRemove, t }: {
  photos: string[];
  onMove: (from: number, to: number) => void;
  onCover: (i: number) => void;
  onRemove: (i: number) => void;
  t: (k: string, v?: Record<string, string | number>) => string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ from: number; pid: number; x: number; y: number; active: boolean; timer?: number } | null>(null);
  const suppressClick = useRef(false);
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const stop = (e: TouchEvent) => { if (drag.current?.active) e.preventDefault(); };
    el.addEventListener('touchmove', stop, { passive: false });
    return () => el.removeEventListener('touchmove', stop);
  }, []);

  const reset = () => {
    if (drag.current?.timer) window.clearTimeout(drag.current.timer);
    drag.current = null;
    setFrom(null); setOver(null); setGhost(null);
  };
  const activate = (x: number, y: number) => {
    const d = drag.current;
    if (!d) return;
    d.active = true;
    setFrom(d.from); setOver(d.from); setGhost({ x, y });
    navigator.vibrate?.(10);
  };
  const idxAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest('[data-ph]');
    return el ? Number(el.getAttribute('data-ph')) : null;
  };

  const dragging = from != null && over != null;
  const shown = dragging ? moved(photos, from, over) : photos;
  // Pozícia v `shown` → index v `photos` (× maže pôvodnú fotku, nie tú, čo práve stojí na mieste).
  const order = dragging ? moved(photos.map((_, i) => i), from, over) : photos.map((_, i) => i);

  return (
    <>
      <div ref={gridRef} className={`atl-photo-grid${from != null ? ' sorting' : ''}`}>
        {shown.map((ph, pos) => {
          const src = order[pos];
          return (
            <div
              key={src}
              data-ph={pos}
              className={`atl-photo-thumb${pos === 0 ? ' cover' : ''}${from != null && src === from ? ' dragging' : ''}`}
              style={{ backgroundImage: `url('${sizedUrl(ph, 240)}')` }}
              role="button"
              tabIndex={0}
              aria-label={t('pack.addTrip.step.coverPhoto')}
              onPointerDown={(e) => {
                if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
                const { clientX, clientY, pointerId } = e;
                drag.current = { from: pos, pid: pointerId, x: clientX, y: clientY, active: false };
                if (e.pointerType !== 'mouse') {
                  drag.current.timer = window.setTimeout(() => activate(clientX, clientY), LONG_PRESS_MS);
                }
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d || d.pid !== e.pointerId) return;
                if (!d.active) {
                  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < SLOP_PX) return;
                  // Prst sa pohol skôr, než podržal = roluje stránku, neťahá fotku.
                  if (e.pointerType !== 'mouse') { reset(); return; }
                  activate(e.clientX, e.clientY);
                }
                try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* prvok sa prekreslil */ }
                setGhost({ x: e.clientX, y: e.clientY });
                const at = idxAt(e.clientX, e.clientY);
                if (at != null) setOver(at);
              }}
              onPointerUp={() => {
                const d = drag.current;
                if (d?.active) {
                  suppressClick.current = true;
                  if (over != null && over !== d.from) onMove(d.from, over);
                }
                reset();
              }}
              onPointerCancel={reset}
              onContextMenu={(e) => { if (drag.current) e.preventDefault(); }}
              onClick={() => {
                if (suppressClick.current) { suppressClick.current = false; return; }
                if (pos !== 0) onCover(pos);
              }}
              onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && pos !== 0) { e.preventDefault(); onCover(pos); } }}
            >
              {pos === 0 && <span className="atl-photo-cover-badge">{t('pack.addTrip.step.cover')}</span>}
              <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(src); }} aria-label={t('pack.addTrip.step.removePhoto')}><HandTrash size={12} /></button>
            </div>
          );
        })}
      </div>
      {/* Portál: panel sprievodcu má `transform`/`overflow`, fixný prvok vnútri by orezal. */}
      {ghost && from != null && createPortal(
        <div
          className="atl-photo-ghost"
          style={{ left: ghost.x, top: ghost.y, backgroundImage: `url('${sizedUrl(photos[from], 240)}')` }}
          aria-hidden
        />,
        document.body,
      )}
    </>
  );
}
