# Plán: video blok trčí do Hero + popis "Watch INTRO MOVIE"

## Cieľ
Hero ostáva vizuálne bez zásahu (rovnaké rozmery, gradienty, špirála, text, BE NEXT! tlačidlo). **Iba video blok** zo `StorySection` sa posunie nahor tak, že jeho horná tretina prečnieva cez spodok Hero — presne ako na červenom rámiku v screene. Pod tlačidlo BE NEXT! v Hero pribudne malý popisok **„Watch INTRO MOVIE"** v zlatej farbe.

## Zmeny

### 1) `src/components/landing/StorySection.tsx`
- Sekcia `<section id="story">` zostáva s `height: 100dvh` a rovnakým gradient pozadím — **neposúva sa**.
- Iba `motion.div` s videom (wrapper `max-w-[760px] aspect-video`) dostane:
  - `style.marginTop: 'clamp(-340px, -32vh, -220px)'` — vytiahne ho nahor tak, aby cca horná 1/3 videa prečnievala nad začiatok StorySection (čiže do spodnej časti Hero).
  - `position: 'relative'` + `zIndex: 30` — aby bol nad Hero gradientmi/maskou.
- Nadpisový blok („29 PEOPLE SAY…" + „BE NEXT!") nad videom v StorySection **odstránim** — duplikuje to, čo už je v Hero, a po zdvihnutí videa by visel divne. (Ak ho chceš zachovať, povedz a nechám ho.)
- Vertikálne centrovanie sekcie nahradím `justify-start pt-[8vh]` aby video po zdvihnutí sedelo vizuálne pekne v rámci StorySection.

### 2) `src/components/landing/HeroSection.tsx`
- Pod `<motion.a>` BE NEXT! pridám malý text:
  ```tsx
  <motion.span
    className="mt-4 text-xs md:text-sm tracking-[0.25em] uppercase relative z-20"
    style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    transition={{ delay: 1.1, duration: 0.6 }}
  >
    Watch INTRO MOVIE
  </motion.span>
  ```
- Nič iné v Hero sa nemení (gradienty, špirála, výška, ostatný text).

### 3) Stacking
- Hero `overflow-hidden` zostáva — to znamená, že video, ktoré vyčnieva z StorySection, bude viditeľné iba mimo Hero (Hero ho oreže). Aby video skutočne **prekrývalo** spodný okraj Hero (ako na screene), Hero potrebuje `overflow-visible` na `<section>`. Zmením teda `overflow-hidden` → `overflow-visible` v Hero `<section>` className. Vnútorné absolútne vrstvy (špirála, gradienty) sú v `inset-0 z-0/z-10` divoch, ktoré **dostanú vlastné `overflow-hidden`** na obalovom kontajneri, aby špirála neunikla mimo Hero.

```text
HeroSection (overflow-visible)
 ├── inner wrapper (absolute inset-0, overflow-hidden) ← drží špirálu+gradienty
 │    ├── DogCircleCarousel
 │    └── radial + bottom gradient masks
 └── headline + BE NEXT! + "Watch INTRO MOVIE"
StorySection (overflow-visible, 100dvh)
 └── video motion.div (marginTop negatívny, z-30) ← prečnieva nahor do Hero
```

## Dotknuté súbory
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/StorySection.tsx`

## Výsledok
Presne ako na screene: Hero vyzerá identicky ako teraz, pod tlačidlom BE NEXT! je zlatý popisok „Watch INTRO MOVIE", a video z druhej sekcie hornou tretinou nakukuje do spodku Hero.
