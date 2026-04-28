Pridám rotujúci kruh fotiek psov ako hypnotické pozadie hero sekcie (cosmos.so štýl).

### Čo postavím

**Nový komponent:** `src/components/landing/DogCircleCarousel.tsx`
- 12 kruhových fotiek psov rozmiestnených po obvode kruhu
- Vonkajší wrapper rotuje 360° / 40s, infinite, linear
- Každá fotka counter-rotuje (-360° / 40s), aby zostala vždy správne natočená
- `animation-play-state: paused` na hover (pauza pri prejdení myšou)
- `prefers-reduced-motion` → animácia vypnutá
- Responzívny polomer cez `clamp(180px, 32vw, 340px)`
- Veľkosť fotiek: `clamp(64px, 9vw, 110px)`
- Štýl fotiek: `rounded-full`, `object-cover`, jemný gold border `#C49B42/40`, `shadow-2xl`, jemná opacity (~70%) aby nekonkurovali textu

**Fotky (Unsplash placeholder):**
12 priamych Unsplash URL fotiek psov s `?w=200&h=200&fit=crop&auto=format` parametrami pre optimalizáciu. Žiadne API key — len verejné CDN URL.

### Integrácia do HeroSection

V `src/components/landing/HeroSection.tsx`:
- Vložím `<DogCircleCarousel />` ako absolútne pozicionovaný layer **pod** existujúce gradient overlaye, ale **nad** čierne pozadie
- `pointer-events-none` aby neblokoval CTA klik
- Existujúce top/bottom gradient overlaye (`from-black to-transparent`) sa rozšíria → posilním ich, aby text "29 PEOPLE SAY" a "IN DOG WE TRUST" zostal výborne čitateľný (radiálny gradient v strede + silnejšie vertical fade)
- Pridám stredový radiálny overlay: `radial-gradient(ellipse at center, black 0%, transparent 70%)` aby kruh bol viditeľný len po stranách / okolo, nie cez text

### Z-index vrstvy v hero (zhora)
```text
z-30  text + CTA
z-20  radial + vertical gradient overlays
z-10  DogCircleCarousel (rotujúci kruh)
z-0   čierne pozadie
```

### Technické detaily

```tsx
// Štruktúra
<div className="circle-spin">                      // rotuje 360° v 40s
  {dogs.map((url, i) => (
    <div style={{ transform: `rotate(${i*30}deg) translateY(-${RADIUS}px)` }}>
      <img className="circle-spin-reverse" src={url} />  // -360° v 40s
    </div>
  ))}
</div>
```

Keyframes pridám priamo v komponente cez `<style>` tag (lokálne, nemusíme zasahovať do `tailwind.config.ts`).

### Súbory
- **Nový:** `src/components/landing/DogCircleCarousel.tsx`
- **Upravím:** `src/components/landing/HeroSection.tsx` (vloženie + posilnenie overlayov)
- **Update memory:** `mem://index.md` + nový `mem://features/hero-dog-circle.md`