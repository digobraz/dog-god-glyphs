

## Prísne snappovanie na každý slide (100vh)

### Problém
Aktuálne má CSS `snap-start` len na úrovni celých sekcií (HERO, STORY, VISION, ABOUT). V sekcii STORY je jeden veľký kontajner (9 × 100vh) s horizontálnym scrolljackingom, ale bez vnútorných snap bodov — používateľ sa môže zastaviť medzi slideami. Podobne VISION sekcia má `snap-start` na jednotlivých krokoch, ale len pri scrolle nadol.

### Riešenie

**1. StorySection — pridať snap anchory pre každý slide**

Vnútri story kontajnera (výška `N × 100vh`) pridať N `div` elementov, každý s `h-screen snap-start`, umiestnené pod sticky vrstvou. Tieto slúžia ako neviditeľné snap body pre prehliadač:

```text
<section height="N×100vh" class="relative">
  <!-- Snap targets (behind sticky layer) -->
  <div class="h-screen snap-start" />  ← slide 1
  <div class="h-screen snap-start" />  ← slide 2
  ...
  <div class="h-screen snap-start" />  ← slide 9

  <!-- Sticky visual layer (unchanged) -->
  <div class="sticky top-0 h-screen overflow-hidden">
    <motion.div> horizontal slides </motion.div>
  </div>
</section>
```

Problém: sticky element musí byť súrodenec snap targetov. Riešenie — snap targety budú `absolute` s `top: i*100vh` a `pointer-events-none`, alebo lepšie: ponechať aktuálnu štruktúru a pridať snap targety ako prvé deti kontajnera s `absolute` pozíciou.

Vlastne jednoduchšie: zmeniť štruktúru tak, že snap targety sú normálne flow elementy a sticky vrstva je posledné dieťa s `absolute inset-0` + `sticky`:

```tsx
<section style={{ height: containerHeight }}>
  {/* Invisible snap anchors in normal flow */}
  {slides.map((_, i) => (
    <div key={i} className="h-screen snap-start" />
  ))}
  {/* Sticky overlay */}
  <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ marginTop: `-${slides.length * 100}vh` }}>
    <motion.div>...</motion.div>
  </div>
</section>
```

Negatívny margin-top posunie sticky vrstvu späť na vrch.

**2. LandingPage — snap-y snap-mandatory vždy aktívne pri scrolle nadol**

Už je nastavené, len overiť že `snap-mandatory` je prítomné.

**3. VisionSection — snap-start na krokoch aj pri scrolle nahor**

Zmeniť `className={scrollingUp ? '' : 'snap-start'}` na vždy `snap-start`, keďže používateľ chce prísne snappovanie všade.

**4. AboutSection — pridať snap-start**

Overiť že About sekcia má tiež `snap-start`.

### Súbory na úpravu
- `src/components/landing/StorySection.tsx` — pridať snap anchor divy + negatívny margin na sticky
- `src/components/landing/VisionSection.tsx` — snap-start vždy
- `src/components/landing/LandingPage.tsx` — snap-mandatory vždy (odstrániť podmienku `scrollingUp`)

