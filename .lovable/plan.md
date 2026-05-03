## Problém

Po premenovaní routingu na `/heroglyph/<step>` zostali v kóde tri zastarané odkazy, ktoré vedú na neexistujúce stránky (404):

| Súbor | Riadok | Aktuálne | Má byť |
|---|---|---|---|
| `src/components/gods/GodsGrid.tsx` | 123 | `navigate('/name')` (CTA tlačidlo "Forge heroglyph" v gridu) | `navigate('/heroglyph/name')` |
| `src/components/gods/GodsGrid.tsx` | 778 | `navigate('/name')` (subscribe / spodný CTA) | `navigate('/heroglyph/name')` |
| `src/components/screens/DogCharacterScreen.tsx` | 241 | `navigate('/dog-shape')` (Back button) | `navigate('/heroglyph/dog-bloodline')` — predchádzajúci krok v toku |

Ostatné navigácie v projekte už používajú `/heroglyph/*` prefix správne (overené `rg`-om naprieč `src/`).

## Zmena

1. V `GodsGrid.tsx` zmeniť obe inštancie `'/name'` → `'/heroglyph/name'`.
2. V `DogCharacterScreen.tsx` zmeniť back-button `'/dog-shape'` → `'/heroglyph/dog-bloodline'` (poradie wizardu: bloodline → character → reveal).

Žiadne ďalšie úpravy nie sú potrebné — routy v `App.tsx` sú v poriadku.
