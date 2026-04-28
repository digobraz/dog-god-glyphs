# Plán: scroll-driven sekvencia Hero → Video

## Cieľ
Pri scrollovaní sa stránka **vizuálne neposúva ako bežný scroll** — namiesto toho scroll riadi animáciu Hero+Video sekcie:
1. Špirála fotiek sa **roztočí rýchlejšie** a postupne **vybledne** do čiernej.
2. Headline („29 PEOPLE SAY: IN DOG WE TRUST" + tlačidlo BE NEXT! + popisok) sa **zmenší a vyfejduje**.
3. Video, ktoré teraz nakukuje len kúskom zdola, sa **plynule posunie nahor** až sa zaparkuje v strede obrazovky.
4. V konečnej fáze ostane na celej obrazovke len video na čiernom pozadí.
5. Až keď táto sekvencia dobehne, normálny scroll pokračuje (vidieť ďalšie sekcie Vision, About).

## Ako to spravím technicky

### 1) Pinned scroll mechanika
Vytvorím nový obal `<HeroVideoSequence>`, ktorý zlúči súčasnú `HeroSection` aj horný kus `StorySection` (s videom) do jedného „scroll stage":

```text
<section style="height: 220vh">          ← rezerva scrollu (toľko bude treba "odscrollovať" počas pinu)
  <div style="position: sticky; top: 0; height: 100vh; overflow: hidden">
    ├── Hero vrstva (špirála + text + tlačidlo)
    └── Video vrstva (z bottom -10vh → na stred)
  </div>
</section>
```

- `position: sticky` zabezpečí, že vnútorný 100dvh stage zostane pripnutý k okraju viewportu počas ~120 vh scrollu (= scroll progress 0 → 1).
- `useScroll({ target: stageRef, offset: ['start start', 'end end'] })` z framer-motion mi dá `scrollYProgress` (0 = úplne hore, 1 = koniec stage).

### 2) Mapovanie progressu (0 → 1) na 4 paralelné transformácie

| Vrstva | progress 0 → 0.5 | progress 0.5 → 1 |
|---|---|---|
| Špirála rotácia | rýchlosť ×1 → ×4 (pridaný extra rotate) | ×4, opacity 1 → 0 |
| Hero text + tlačidlo | scale 1 → 0.85, opacity 1 → 0 | invisible |
| Video translateY | 0 → −60vh (postupne ide hore) | −60vh → centrovaný (cca −38vh aby bol jeho stred = stred viewportu) |
| Pozadie | čierne celý čas | čierne |

- Špirála: aktuálne `transform: translate(-50%,-50%) rotate(...)` cez CSS `@keyframes`. Pridám druhú vrstvu rotácie cez framer-motion `motion.div` wrapper, ktorému dám `rotate: useTransform(progress, [0,1], [0, 540])` — výsledný uhol sa **pripočíta** k rotácii z keyframes, takže výsledne to vyzerá ako zrýchlenie.
- Opacity špirály: `useTransform(progress, [0.15, 0.7], [1, 0])`.
- Text: `useTransform` na `scale` `[1 → 0.85]` a `opacity` `[1 → 0]` cez `[0, 0.45]`.
- Video: `useTransform` na `y` v `vh`. Štartuje z aktuálnej pozície (visí dole, vidno len prúžok) a končí v centre obrazovky.

### 3) Refaktor súborov
- **`src/components/landing/LandingPage.tsx`** — `<HeroSection />` + `<StorySection />` nahradím jedinou `<HeroVideoSequence />`. `VisionSection` a `AboutSection` zostávajú.
- **Nový `src/components/landing/HeroVideoSequence.tsx`** — drží sticky stage, useScroll, posiela `progress` ako prop do `<DogCircleCarousel progress={...} />` aj do interného Hero textu a video bloku.
- **`src/components/landing/DogCircleCarousel.tsx`** — prijme nepovinný prop `boostRotation?: MotionValue<number>` a `fade?: MotionValue<number>`; aplikuje ich na `motion.div` wrapper okolo `.dog-scene`.
- **`src/components/landing/HeroSection.tsx`** — zostane buď ako wrapper čisto pre statickú verziu (ak chce niekto použiť samostatne), alebo jeho obsah presuniem do `HeroVideoSequence`. Kvôli prehľadnosti vyextrahujem text+tlačidlo do `<HeroOverlay />` malého komponentu, ktorý dostane `textProgress` motion value.
- **`src/components/landing/StorySection.tsx`** — zruším — video sa teraz renderuje vnútri `HeroVideoSequence`. Sekcia s gradient pozadím (papyrus prechod) prestane existovať v tejto podobe; pretože koncový stav je „video na čiernom", po skončení sekvencie prirodzene nasleduje `VisionSection`.
  - Alternatíva ak chceš zachovať papyrus prechod do Vision: nechám malý `StorySection` len ako gradient bridge bez videa.
  - **Default v tomto pláne: ponechám malú `StorySection` ako bridge gradient (čierna → papyrus) bez videa, kvôli plynulému prechodu do Vision.**

### 4) Reduced motion + mobile
- Pri `prefers-reduced-motion: reduce` vypnem useTransform efekty a video sa ukáže okamžite v strede po krátkom scrolle (žiadne pinovanie nad 100vh).
- Mobile: zmenším výšku stage z 220vh na 180vh (kratší scroll na pinovanie) a uberiem rotáciu boostu na +360° namiesto +540°.

### 5) Header počas sekvencie
Header zostáva fixne hore (už je `fixed`), takže navigácia funguje. „STORY" link teraz preskočí samotnú sekvenciu (kotva ostane fungovať na novú sekciu).

## Dotknuté súbory
- nový `src/components/landing/HeroVideoSequence.tsx`
- upraviť `src/components/landing/LandingPage.tsx`
- upraviť `src/components/landing/DogCircleCarousel.tsx` (prijať motion values)
- upraviť `src/components/landing/HeroSection.tsx` (vyňať Hero text do reusable overlay alebo presunúť do sequence)
- upraviť `src/components/landing/StorySection.tsx` (odstrániť video, ponechať len gradient bridge — alebo zmazať úplne)

## Otvorené otázky pre teba (napíš čísla)
1. **Konečný stav videa**: má byť video v strede `aspect-video 760px` (ako teraz, len v strede), alebo má vyplniť skoro celú obrazovku (cca 90vw, max 1200px)?
2. **Po skončení sekvencie**: keď je video v strede, ďalším scrollom má (a) **plynule pokračovať dole** kde sa objaví Vision sekcia s papyrus pozadím, alebo (b) ostať pripnuté a Vision sa „vsunie zospodu" na ďalší scroll?
3. **StorySection bridge**: zachovať čierna→papyrus gradient prechod pred Vision, alebo prejsť priamo z čierneho videa do Vision (Vision má `#F3EBDD` pozadie, takže prechod by bol ostrý)?

Po odpovediach spustím implementáciu.
