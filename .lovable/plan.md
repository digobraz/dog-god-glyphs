

## Úprava pozície STORY-1 videa — ľavá hrana + prilepenie k headeru

### Problém
Video STORY-1 používa `objectPosition: '30% 60%'` čo posúva obsah smerom doľava a dole, ale žena je stále orezaná. Používateľ chce:
- Ľavá strana videa zarovnaná presne na ľavý okraj webu (= `object-position: 0%` horizontálne)
- Video posunuté dole tak, aby vrchná hrana videa bola prilepená na dolný okraj headru (= `object-position: left top` s paddingom zhora)

### Riešenie — `src/components/landing/StorySection.tsx`

1. **Zmeniť `videoPosition` pre slide 0** z `'30% 60%'` na `'0% 0%'` (alebo `'left top'`):
   - `0%` horizontálne = ľavá hrana videa je na ľavom okraji kontajnera
   - `0%` vertikálne = vrchná hrana videa je nalepená na vrch kontajnera (čo je efektívne pod headerom, keďže sticky kontajner začína pod ním)

2. Ak header má fixnú výšku (napr. 80px), môžeme pridať `padding-top` na video kontajner alebo použiť `object-position: 0% 80px` aby sa video posunulo presne pod header.

### Konkrétna zmena

```ts
// slide 0
videoPosition: '0% 0%',  // ľavá hrana + vrch (pod headerom)
```

Ak bude treba jemnejšie doladenie pod header, upravíme na niečo ako `'0% 5%'`.

### Súbory
- `src/components/landing/StorySection.tsx`

