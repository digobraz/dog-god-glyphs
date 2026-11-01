// ŠVIH FOTIEK DO STRÁN (Matej 1. 11. 2026: *„v zozname tripov by sa malo dať slajdovať do strán (obrázky),
// aktuálne to ide len klikom na šípky"*). Natívny `scroll-snap`, takže fotka ide za prstom ako na IG, bez
// vlastnej fyziky gest. Index ostáva u volajúceho — šípky na PC aj bodky naďalej čítajú ten istý stav.
// `loading="lazy"` vo vodorovnom ráme stiahne ďalšiu fotku až tesne pred tým, než príde na rad.
import { useEffect, useRef } from 'react';

const CSS = `
.swp{position:absolute;inset:0;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;
  -webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:none;}
.swp::-webkit-scrollbar{display:none;}
.swp img{flex:0 0 100%;width:100%;height:100%;object-fit:cover;display:block;scroll-snap-align:start;scroll-snap-stop:always;}
/* Na dotyku šípky odchádzajú: rám cez celú fotku by zachytil švih. Bodky ostávajú a hovoria, že je čo švihať. */
@media (hover:none){.trp-bigcard-photonav{display:none;}}
`;

export function SwipePhotos({ photos, idx, onIdx, position }: {
  /** Už zmenšené adresy fotiek. */
  photos: string[];
  idx: number;
  onIdx: (i: number) => void;
  /** `object-position` konkrétnej fotky. */
  position?: (i: number) => string | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Šípky zmenili index ⇒ rám dobehne. Po švihu už index sedí a posun je nulový.
  useEffect(() => {
    const el = ref.current;
    if (el && el.clientWidth) el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
  }, [idx]);
  return (
    <div
      className="swp"
      ref={ref}
      onScroll={(e) => {
        const el = e.currentTarget;
        if (!el.clientWidth) return;
        const i = Math.round(el.scrollLeft / el.clientWidth);
        if (i !== idx) onIdx(i);
      }}
    >
      <style>{CSS}</style>
      {photos.map((src, i) => (
        <img key={src + i} src={src} alt="" loading="lazy" decoding="async" draggable={false} style={{ objectPosition: position?.(i) }} />
      ))}
    </div>
  );
}
