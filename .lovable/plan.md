

## Plan: Posunúť nadpis v 1. bloku nižšie o veľkosť písma

**Problém:** Nadpis "{dogName}'S HEROGLYPH" je príliš blízko horného okraja bloku. Treba ho posunúť nižšie, pričom celková veľkosť bloku zostane rovnaká.

**Riešenie:** Zvýšiť `pt` (padding-top) a proporcionálne znížiť `pb` (padding-bottom), aby sa blok nezväčšil. Konkrétne zmeniť `pt-3 pb-1.5` na `pt-5 pb-0.5` na všetkých 4 obrazovkách.

**Súbory:**
- `src/components/screens/DogGenderScreen.tsx`
- `src/components/screens/DogFateScreen.tsx`
- `src/components/screens/DogColourScreen.tsx`
- `src/components/screens/DogBloodlineScreen.tsx`

Zmena v každom súbore: na div s `papyrus-bg` zmeniť `pt-3 pb-1.5` → `pt-5 pb-0.5`.

