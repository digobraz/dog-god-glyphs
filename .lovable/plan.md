

## Úprava videí v STORY sekcii — viditeľnosť postáv a psov

### Problém
Aktuálne `object-cover` oreže videá tak, že postavy a psy nie sú celé viditeľné. Na mobile (40vh výška) je to ešte horšie — 16:9 videá sa zobrazia len ako úzky pás.

### Riešenie

**Súbor: `src/components/landing/StorySection.tsx`**

1. **Desktop (ľavý panel):** Zmeniť `object-cover` na `object-contain` — video sa zobrazí celé vrátane postáv, vycentrované v rámci panelu, s čiernym pozadím po stranách.

2. **Mobile:** Zmeniť výšku ľavého panelu z `h-[40vh]` na `h-[60vh]` (alebo viac), aby bolo viac priestoru pre celé postavy. Pravý textový panel sa zmenší na `h-[40vh]`.

3. **Video element:** Použiť responsívnu triedu:
   ```tsx
   className="absolute inset-0 w-full h-full object-contain md:object-contain"
   ```
   Tým sa video vycentruje a priblíži na maximálnu výšku bez orezania.

4. **Pozadie za videom:** Pridať `bg-black` na rodičovský div, aby medzery okolo videa boli čierne (nie priehľadné).

### Výsledok
- Celé postavy aj psy budú viditeľné na desktop aj mobile
- Video bude vycentrované a čo najväčšie v rámci dostupného priestoru
- Čierne pozadie zachová cinematický vzhľad

### Súbory
- `src/components/landing/StorySection.tsx`

