## Zmeny (iba mobil, iba HeroVideoSequence.tsx)

Cieľ: posunúť celý stredný blok ("29 PEOPLE SAY:", "IN DOG WE TRUST", "BE NEXT!") vyššie a zväčšiť hlavné motto o 20%. Nič iné sa nemení (desktop, video, špirála, fotky všetko ostáva).

### 1. Posun obsahu vyššie (mobil)
V `motion.div` containeri hero textu (riadok 158) zmeniť `justify-center` flex layout na vertikálne posunutý vyššie pomocou paddingu:
- aktuálne: `pt-[50px] md:pt-[140px]` + `justify-center`
- nové: `justify-start pt-[80px] md:justify-center md:pt-[140px]`

Týmto sa na mobile obsah ukotví od vrchu s menším paddingom (~80px namiesto centrovania v 100dvh viewporte), čo ho efektívne posunie výrazne vyššie. Desktop (`md:`) zostáva nezmenený — `justify-center` + `pt-[140px]`.

### 2. Zväčšenie motta "IN DOG WE TRUST" o 20% (mobil)
V `motion.h1` (riadok 182):
- aktuálne mobil: `text-[2.4rem]`
- nové mobil: `text-[2.88rem]` (2.4 × 1.2)
- desktop nezmenený: `md:text-7xl lg:text-8xl`

### Súbory
- `src/components/landing/HeroVideoSequence.tsx` — 2 drobné zmeny tried (riadky 158 a 182)

Žiadne iné zmeny — counter, "PEOPLE SAY:", BE NEXT! tlačidlo, video, špirála, vignette, blackout — všetko ostáva.