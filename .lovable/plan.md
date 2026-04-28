## Cieľ

Vymazať celú Story sekciu (texty, timeline, cross-fade, Ken Burns, scroll mechaniku pre 9 slidov) a nahradiť ju jednoduchou čiernou sekciou s YouTube videom v strede, inšpirovanou cosmos.so. Zároveň úplne odstrániť MatrixRain.

## Zmeny

### 1. Nový komponent `StorySection.tsx` (prepísaný)
- Plná výška sekcie `100dvh`, čisto čierne pozadie (`bg-black`).
- V strede malý zlatý nadpis `Cinzel`: **"29 PEOPLE SAY: IN DOG WE TRUST"**, pod ním tenký podnadpis: **"BE NEXT!"**.
- Pod textom YouTube embed (`https://www.youtube.com/embed/WDZQP7LuOBc?autoplay=1&mute=1&loop=1&playlist=WDZQP7LuOBc&controls=0&modestbranding=1&rel=0&playsinline=1`).
- Video kontajner: max šírka ~1100px, `aspect-video`, `rounded-2xl`, jemný zlatý glow `box-shadow` (cosmos.so feel — soft halo okolo videa).
- Žiadne ďalšie elementy, žiadny MatrixRain, žiadny timeline, žiadne slidy.
- Iba 1 `data-snap-page` wrapper.

### 2. `LandingPage.tsx` — recalibrácia scrollu
- StorySection teraz tvorí **1 stránku** namiesto 9 → celkový počet stránok klesne zo **16 na 8**.
- Nové indexy: `0` Hero, `1` Story, `2`–`6` Vision (5 stránok), `7` About.
- Upraviť `navigate()` fast-track up logiku:
  - `prev === 7` (About) → `2` (Vision 1)
  - `prev > 2 && prev <= 6` (Vision 2–5) → `2`
  - `prev === 2` → `1` (Story)
  - `prev === 1` → `0` (Hero)
- Down navigation: max index `7`.
- Wrap StorySection do `<div data-snap-page>` priamo v LandingPage (nie interne ako 9 stránok).
- Odstrániť `__storyModalClose` volania (modal už neexistuje).

### 3. `Header.tsx` — aktualizovať `indexMap`
- `{ story: 1, vision: 2, about: 7 }` (pôvodne `1, 10, 15`).
- Ratio tracking sekcií ostáva rovnaký (`hero`, `story`, `vision`, `about`).

### 4. Mazanie súborov
- `src/components/landing/MatrixRain.tsx` — zmazať.
- Skontrolovať a odstrániť importy `MatrixRain` (pravdepodobne v `HeroSection.tsx` alebo starom `StorySection.tsx`).

### 5. Memory cleanup
- Zmazať `mem://features/landing-page-story` (už neaktuálne — žiadny timeline/Ken Burns).
- Aktualizovať `mem://index.md`: odstrániť odkaz na story memory, aktualizovať scroll architektúru (8 stránok namiesto 16).
- Aktualizovať `mem://ux/landing-page-scroll-architecture` s novými indexmi.

## Technické detaily

YouTube embed parametre pre tichý autoplay loop:
```
autoplay=1&mute=1&loop=1&playlist=VIDEO_ID&controls=0&modestbranding=1&rel=0&playsinline=1
```
(parameter `playlist=VIDEO_ID` je nutný, aby `loop=1` fungoval pri jednom videu).

Vizuál videa (cosmos.so inšpirácia):
```
border-radius: 16px;
box-shadow: 0 0 80px rgba(196,155,66,0.15), 0 0 200px rgba(196,155,66,0.08);
```

Po schválení implementujem v default móde.