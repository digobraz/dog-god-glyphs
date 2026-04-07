
## Problém

IntersectionObserver callback dostáva len **zmenené** entries, nie všetky pozorované elementy. Keď sa pri scrolle späť na Hero sekciu zmení len entry pre `hero`, callback porovná iba tento jeden entry a nájde `hero` s najvyšším ratio. Ale ak sa `story` zmenila v **predchádzajúcom** callbacku a teraz nie je v `entries`, observer si nepamätá, že story už nie je viditeľná — preto `activeSection` zostane na `story`.

Aktuálny kód na riadkoch 14–21 iteruje len cez `entries` z aktuálneho callbacku a hľadá max ratio, ale ignoruje stav ostatných sekcií.

## Riešenie

Uložiť si ratio pre každú sekciu do `ref` mapy a v každom callbacku aktualizovať len zmenené entries, potom nájsť sekciu s najvyšším ratio zo všetkých.

### Úprava: `src/components/landing/Header.tsx`

1. Pridať `useRef` pre mapu `Record<string, number>` na ukladanie intersection ratios všetkých sekcií.
2. V callback-u aktualizovať iba entries, ktoré prišli, potom iterovať cez celú mapu a nájsť sekciu s najväčším ratio.
3. Na základe výsledku nastaviť `isLight` a `activeSection` (ak je to `hero`, `activeSection` sa vymaže na `''`).

```tsx
const ratioMap = useRef<Record<string, number>>({});

// In callback:
entries.forEach((entry) => {
  ratioMap.current[entry.target.id] = entry.intersectionRatio;
});

let maxRatio = 0;
let topSection = '';
for (const [id, ratio] of Object.entries(ratioMap.current)) {
  if (ratio > maxRatio) {
    maxRatio = ratio;
    topSection = id;
  }
}
```
