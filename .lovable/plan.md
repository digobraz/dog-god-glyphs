## Cieľ

Na úvodnej obrazovke (`/` → `GodsGrid`) pridať do každého psieho bloku dva malé prvky:
- **Vpravo hore**: okrúhla malá vlajka štátu
- **Vľavo hore**: malá ikona „i" (info)

## Kontext

Karty psov vykresľuje `src/components/gods/GodsGrid.tsx` cez `makeCard` → `<article class="dog-card">` s vnútorným `.card-img` a spodným `.card-label` (meno psa). Dáta o psoch sú v `src/components/gods/godsData.ts` ako pole `photos` s tvarom `{ f: filename, n: name }` — **momentálne tam nie je žiadna informácia o štáte psa**.

## Otvorená otázka — odkiaľ má byť vlajka?

V dátach psov nie je krajina. Mám dve cesty, navrhujem **B** ako predvolenú — viem to spustiť hneď a neskôr nahradiť reálnymi dátami:

- **A) Reálne krajiny per pes** — doplniť do `godsData.ts` ku každému psovi `country: 'sk' | 'cz' | ...`. Vyžaduje, aby si dodal zoznam (alebo odsúhlasil, že väčšina = `sk`).
- **B) Deterministická vlajka z hashu** *(predvolené)* — zatiaľ priradiť krajinu pseudo-náhodne z malej sady (`sk, cz, pl, hu, at, de, us, uk, fr, it`) pomocou rovnakého hashu, akým sa vyberá fotka. Vyzerá to ako reálne dáta a každý pes má stabilnú vlajku.

Ak chceš A, povedz a pošlem follow-up otázku na zoznam.

## Implementácia

1. **Vlajky** – použiť hotovú CDN `https://flagcdn.com/w40/{cc}.png` (ostré, malé, žiadne nové assety v repo). Pridať helper `flagFor(col, row)` v `GodsGrid.tsx` (rovnaký hash princíp ako `photoFor`).

2. **Úprava `makeCard` v `GodsGrid.tsx`** — do `innerHTML` `.dog-card` doplniť:
   ```html
   <button class="card-info" data-info aria-label="Info">i</button>
   <img class="card-flag" src="https://flagcdn.com/w40/{cc}.png" alt="">
   ```
   (info button a flag sa **nepridávajú** do hero karty `0,0` ani do reveal karty.)

3. **CSS** – pridať do `<style>` bloku v `GodsGrid.tsx`:
   - `.card-flag` — `position: absolute; top: 8px; right: 8px; width: 22px; height: 22px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,.4); border: 1.5px solid rgba(255,255,255,.85); pointer-events: none;`
   - `.card-info` — `position: absolute; top: 8px; left: 8px; width: 22px; height: 22px; border-radius: 50%; background: rgba(30,30,30,.55); backdrop-filter: blur(6px); color: #fff; font-size: 12px; font-style: italic; font-family: Georgia, serif; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer;` + hover stav (mierne zosvetlenie).
   - Aby drag mechanika ignorovala klik na `i`, v `onMouseDown` rozšíriť existujúci guard `target.closest(...)` o `.card-info`.

4. **Akcia info tlačidla** – zatiaľ no-op (`e.stopPropagation()`), pripravené na neskorší modal s detailom psa. Ak chceš, viem rovno otvoriť existujúci `infoOpen` overlay — daj vedieť.

## Súbory na úpravu

- `src/components/gods/GodsGrid.tsx` — `makeCard`, CSS, drag guard, helper `flagFor`.

(Neupravujem `godsData.ts`, ak schváliš variant B.)
