

## Plan: Posunúť nadpis výraznejšie nižšie v 1. bloku

**Problém:** Nadpis "DAISY'S HEROGLYPH" je stále prilepený k hornému okraju bloku — medzi horným okrajom a nadpisom je príliš málo priestoru.

**Riešenie:** Zmeniť `pt-5 pb-0.5` na `pt-8 pb-0` na všetkých 4 obrazovkách. Tým sa nadpis posunie výrazne nižšie a vizuálne sa vycentruje medzi horný okraj bloku a HeroglyphFrame pod ním.

**Súbory (rovnaká zmena v každom):**
- `src/components/screens/DogGenderScreen.tsx`
- `src/components/screens/DogFateScreen.tsx`
- `src/components/screens/DogColourScreen.tsx`
- `src/components/screens/DogBloodlineScreen.tsx`

**Zmena:** Na div s `papyrus-bg` zmeniť `pt-5 pb-0.5` → `pt-8 pb-0`.

