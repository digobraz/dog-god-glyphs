// KARTA VÝLETU V MOBILNOM ZOZNAME SA KRESLÍ, LEN KEĎ JE PRI OBRAZOVKE (Matej 1. 11. 2026: „ZOZNAM v /map sa zasekne
// v loope otvárania"). Namerané vo WebKite: 148 fotiek stiahnutých ešte na mape a po otvorení 153 vykreslených naraz.
// Vypočítané, nie namerané (dev fotky majú 40 px): 1080 px ≈ 3,5 MB v pamäti × 153 ≈ 500 MB. Pád na telefóne je stále
// hypotéza. `loading="lazy"` to nezachráni, WebKit ho v tomto zozname nedrží. Karta ďaleko od obrazovky je len prázdne
// miesto s nameranou výškou, takže scroll nepreskakuje.
import { useEffect, useRef, useState, type ReactNode } from 'react';

// Rezerva nad a pod oknom: pri švihu sú karty hotové skôr, než na ne človek dôjde.
const ROOT_MARGIN = '800px 0px';
// Výška poslednej nameranej karty = odhad pre karty, ktoré sa ešte nekreslili.
let lastCardH = 330;

export function TripCardSlot({ children }: { children: () => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const height = useRef(lastCardH);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    // ⚠️ `root` musí byť scrollujúci zoznam: s oknom ako rootom by ho rám orezal a rezerva by neplatila.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && el.offsetHeight > 0) height.current = lastCardH = el.offsetHeight;
      setNear(e.isIntersecting);
    }, { root: el.closest('.trp-mlist'), rootMargin: ROOT_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={near ? undefined : { height: height.current, flexShrink: 0 }}>
      {near ? children() : null}
    </div>
  );
}
