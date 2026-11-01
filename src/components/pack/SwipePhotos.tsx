// ŠVIH FOTIEK DO STRÁN (Matej 1. 11. 2026: *„v zozname tripov by sa malo dať slajdovať do strán (obrázky),
// aktuálne to ide len klikom na šípky"*). Natívny `scroll-snap`, takže fotka ide za prstom ako na IG, bez
// vlastnej fyziky gest. Index ostáva u volajúceho — šípky na PC aj bodky naďalej čítajú ten istý stav.
// `loading="lazy"` vo vodorovnom ráme stiahne ďalšiu fotku až tesne pred tým, než príde na rad.
import { useEffect, useRef } from 'react';

// NEPÍSAŤ <img> DO KAŽDÉHO SLIDU (1. 11. 2026: testovacia appka po otvorení zoznamu „obnoví obrazovku a je späť
// mapa" = podozrenie na pád WKWebView z pamäte; zoznam mal 142 rámov a 1182 <img>). Skutočný <img> s `src` dostane
// len aktuálna fotka a susedia; ostatné slidy sú prázdne s rovnakou šírkou, takže scroll-snap a švih sedia.
// Fotka, ktorá už raz bola, ostáva (nemizne).

const CSS = `
.swp{position:absolute;inset:0;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;
  -webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:none;}
.swp::-webkit-scrollbar{display:none;}
.swp-s{flex:0 0 100%;width:100%;height:100%;scroll-snap-align:start;scroll-snap-stop:always;}
.swp-s img{width:100%;height:100%;object-fit:cover;display:block;}
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
  const seen = useRef(new Set<number>());
  for (const j of [idx - 1, idx, idx + 1]) if (j >= 0 && j < photos.length) seen.current.add(j);
  // Šípky zmenili index ⇒ rám dobehne. Po švihu už index sedí a posun je nulový.
  // ⚠️ Počas dobehu rám NEHLÁSI index späť: prvý scroll event (scrollLeft 14 z 302) by sa zaokrúhlil na starú
  // fotku, vrátil index a šípka by sa ihneď zrušila (na PC šípky nehýbali fotkou).
  const dobeh = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || !el.clientWidth) return;
    if (Math.round(el.scrollLeft / el.clientWidth) === idx) return;
    dobeh.current = performance.now() + 700;
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
  }, [idx]);
  return (
    <div
      className="swp"
      ref={ref}
      onScroll={(e) => {
        const el = e.currentTarget;
        if (!el.clientWidth || performance.now() < dobeh.current) return;
        const i = Math.round(el.scrollLeft / el.clientWidth);
        if (i !== idx) onIdx(i);
      }}
    >
      <style>{CSS}</style>
      {photos.map((src, i) => (
        <div className="swp-s" key={src + i}>
          {seen.current.has(i) && <img src={src} alt="" loading="lazy" decoding="async" draggable={false} style={{ objectPosition: position?.(i) }} />}
        </div>
      ))}
    </div>
  );
}
