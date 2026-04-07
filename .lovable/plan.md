

## Úprava pozície videa STORY-1 — žena v centre

### Problém
Na STORY-1 je postava ženy orezaná — na desktope a tablete treba video posunúť doprava a mierne dole. Na mobile treba video natiahnuť na celú výšku (100vh) a posunúť doprava tak, aby žena bola v strede obrazovky.

### Riešenie

**Súbor: `src/components/landing/StorySection.tsx`**

1. **Pridať per-slide `videoStyle` objekt** do slides array — len slide 0 (STORY-1) dostane vlastné pozičné nastavenia:
   ```ts
   videoStyle: {
     desktop: 'object-[70%_55%]',   // posun doprava a mierne dole
     mobile: 'object-[80%_center]',  // posun výrazne doprava, žena v strede
   }
   ```

2. **Mobile panel zvýšiť na h-[100vh]** pre STORY-1 — video sa natiahne na celú výšku obrazovky. Text panel sa presunie ako overlay dole.

3. **Implementácia v `StoryCard`:**
   - Video element dostane conditionálne triedy na základe `slide.videoStyle`:
     - Mobile: `h-screen w-auto min-w-full object-cover` + `object-position: 80% center` (žena v strede, video posunuté doprava)
     - Desktop/tablet: `object-position: 70% 55%` (mierne doprava a dole)
   - Ak `videoStyle` neexistuje, použije sa default `object-cover object-center`

4. **Konkrétne CSS pre STORY-1 video element:**
   - Desktop: `object-cover` + `style={{ objectPosition: '70% 55%' }}`
   - Tablet: `style={{ objectPosition: '70% 55%' }}`
   - Mobile: panel `h-screen`, video `object-cover` + `style={{ objectPosition: '80% 50%' }}`

### Výsledok
- Desktop/tablet: žena viditeľná celá, video posunuté doprava a mierne dole
- Mobile: video cez celú výšku, žena vycentrovaná na stred obrazovky
- Ostatné karty (2-9) bez zmeny

### Súbory
- `src/components/landing/StorySection.tsx`

