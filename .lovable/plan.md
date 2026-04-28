## Diagnóza
Otestoval som live preview na mobile (390×844). Aktuálne vidno: DOGYPT logo, špirálu fotiek, „29 PEOPLE SAY: IN DOG WE TRUST" a „BE NEXT" tlačidlo. **Chýba úplne náhľad videa aj „▶ Watch INTRO MOVIE" tlačidlo** — sú zatlačené pod fold, lebo `videoY = 66vh` posunie video príliš dolu (na 100dvh viewporte mobilu prečnieva celé pod hranu).

Po scrolli (v strednom stave) je video v strede OK, ale na vstupe na stránku užívateľ vôbec netuší, že tam nejaké je.

## Riešenie
Súbor: `src/components/landing/HeroVideoSequence.tsx`

### 1. Detekcia mobilu
Pridať `useState`/`useEffect` s `matchMedia('(max-width: 767px)')` → `isMobile` flag.

### 2. Posunúť video vyššie na mobile (úvodný stav)
- Nahradiť pevné `'66vh'` v `videoY` za breakpoint hodnotu:
  - desktop ostáva `66vh` (PC sme zafixovali, nemeniť),
  - mobil: `42vh` — video tak vykukne pekne pod nadpis a tlačidlo „Watch INTRO MOVIE" bude nad foldom.

### 3. Kompaktnejší hero text na mobile
Aby sa zmestil hero blok + video peek do 100dvh:
- `pt-[120px] md:pt-[140px]` → `pt-[80px] md:pt-[140px]`
- H1 `text-4xl` → `text-[2.25rem]` (mierne menej) na mobile
- Tlačidlo BE NEXT `mt-8 px-10 py-4` → `mt-5 md:mt-8 px-7 py-3 md:px-10 md:py-4`

### 4. Cieľ pre auto-scroll po kliku
`handlePlayClick` ostáva — formula už správne počíta cieľ z `scrollable * 0.58`, funguje rovnako na mobile aj desktop.

### 5. Padding videa
`px-6 md:px-10` → `px-4 md:px-10` na mobile (viac priestoru pre 16:9 rámček).

### 6. Spirála
Bez zmeny — už používa mobile clamp (`clamp(820px, 180vw, 1200px)`).

## Neopravujem
- Desktop layout (užívateľ explicitne povedal „zafixujme PC").
- Centered stav videa po scrolli (na mobile už funguje).
- Auto-scroll cieľ (matematicky správny pre obe veľkosti).

## Súbory
- `src/components/landing/HeroVideoSequence.tsx`
