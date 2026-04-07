

## Problém

`html { overflow: hidden; }` v `index.css` blokuje **všetok** scroll — vrátane programatického `scrollIntoView()`. Takže keď JS hijacker nastaví `currentIndex` a zavolá `scrollIntoView`, stránka sa nikam nepohne. Vizuálne sa nič nezmení, aj keď sa stav aktualizuje.

Zároveň `StorySection` používa `useScroll` z framer-motion na sledovanie scroll progress pre horizontálny posun slajdov — ale keďže scroll neexistuje, `scrollYProgress` je stále 0 a slajdy sa nehýbu.

## Riešenie

Zmeniť prístup: namiesto blokovania overflow a pokúšania sa o programatický scroll, ponechať natívny scroll povolený ale kontrolovať ho cez JS.

### Zmeny

**1. `src/index.css`** — Odstrániť `overflow: hidden` z `html`, pridať `overscroll-behavior: none`

```css
html {
  overscroll-behavior: none;
}
```

**2. `src/components/landing/LandingPage.tsx`** — Vylepšiť scroll hijacker

- Wheel handler: ponechať `e.preventDefault()` — toto blokuje natívny scroll kolieskom/trackpadom
- Pridať `touchmove` handler s `e.preventDefault()` — blokuje natívny touch scroll
- Zmeniť `scrollIntoView` na `window.scrollTo({ top: target.offsetTop, behavior: 'smooth' })` pre spoľahlivejšie programatické scrollovanie
- Použiť `ref` namiesto `state` pre `currentIndex`, aby sa predišlo stale closures v event handleroch (event listenery sa nebudú musieť re-registrovať pri každej zmene indexu)

```tsx
const currentIndexRef = useRef(0);

const scrollToIndex = (index: number) => {
  const targets = document.querySelectorAll('[data-snap-page]');
  const clamped = Math.max(0, Math.min(index, targets.length - 1));
  if (isAnimating.current) return;
  
  isAnimating.current = true;
  currentIndexRef.current = clamped;
  
  const target = targets[clamped] as HTMLElement;
  window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  
  setTimeout(() => { isAnimating.current = false; }, TRANSITION_DURATION);
};
```

- Zmeniť `useEffect` dependencies na `[]` (prázdne) keďže všetky hodnoty sú v refs

**3. Bez zmien v `StorySection.tsx`**

`useScroll` z framer-motion bude teraz fungovať, keďže natívny scroll je povolený. Programatický `window.scrollTo` posunie stránku, `scrollYProgress` sa aktualizuje, a horizontálny posun slajdov bude fungovať.

### Súbory
- `src/index.css` — zmena html overflow
- `src/components/landing/LandingPage.tsx` — oprava scroll hijackera (refs, scrollTo, touchmove)

