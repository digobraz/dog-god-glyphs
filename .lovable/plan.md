## Cieľ
Premeniť aktuálny "matrix rain" v `src/components/landing/MatrixRain.tsx` (Hero sekcia) tak, aby namiesto egyptských znakov / DOGYPT písmen padali obrázky patrónov z uploadnutého `PATRONI.zip`. Animácia má byť **výrazne pomalšia** než aktuálna.

## Kroky

### 1) Rozbaliť a uložiť obrázky do projektu
- Skopírujem `user-uploads://PATRONI.zip` do `/tmp/PATRONI.zip` a rozbalím ho.
- Vytvorím priečinok **`src/assets/patroni/`**.
- Všetky obrázky (PNG/SVG/WEBP — podľa toho, čo bude v ZIPe) presuniem sem so sanitizovanými názvami (lowercase, bez medzier a diakritiky).
- Ak by niektoré obrázky boli veľmi veľké rastre (>300 KB), spomeniem to a navrhnem zmenšenie, ale defaultne ich nechám tak, aby si nestratil kvalitu.

### 2) Vytvoriť centrálny index obrázkov
Nový súbor **`src/assets/patroni/index.ts`** s `import.meta.glob('./*.{png,svg,webp,jpg}', { eager: true })`, ktorý vyexportuje pole URL — žiadne hardkódovanie 63 importov.

### 3) Prepísať `MatrixRain.tsx` na image-rain
Namiesto `<canvas>` `fillText` použijem **canvas + `drawImage`**:
- Pri mounte si pre-loadnem všetky obrázky cez `new Image()` a `await Promise.all(...)`.
- Stĺpce: `columns = Math.floor(width / cellSize)`, `cellSize = 56px` (desktop) / `40px` mobil — väčšie kvôli tomu, že kreslíme obrázky, nie znaky.
- Každý "drop" má: `y` pozíciu, `speed`, náhodný `imageIndex`, mierne náhodný scale a opacity (0.25–0.55) aby pôsobil ako pozadie a nerušil text "IN DOG WE TRUST".
- Keď drop dopadne pod spodok → reset na vrch s novým náhodným obrázkom (Math.random() > 0.985 podmienka, podobne ako teraz).

### 4) Spomalenie animácie
Aktuálne `drops[i] += 0.5` pri 60fps → ~30 px/s.
Nové hodnoty:
- `speed = 0.08 + Math.random() * 0.12` (px na frame) → cca **5–12 px/s**, t. j. približne **3–6× pomalšie** než teraz a každý obrázok padá vlastným tempom (prirodzenejšie).
- Opačne, ak budeš chcieť ešte pomalšie/rýchlejšie, zmena je 1 konštanta.

### 5) Vizuálne ladenie
- Kreslím s `ctx.globalAlpha = drop.opacity`, potom reset na 1.
- Žiadny zlatý trail / fade overlay z aktuálnej verzie (`rgba(0,0,0,0.06)` fillRect) — pri obrázkoch by to vytváralo škaredé "duchy". Namiesto toho vyčistím canvas cez `ctx.clearRect` každý frame, pozadie ostáva čierne z parent `<section>`.
- Existujúce gradientové overlaye v `HeroSection` (top + bottom black gradient) ostávajú nezmenené — zaistia, že text v strede zostane čitateľný.

### 6) Performance poistky
- `requestAnimationFrame` + cleanup (už máme).
- Ak je `prefers-reduced-motion: reduce`, animácia sa nespustí (statické pozadie s pár obrázkami).
- Pre mobil: menej stĺpcov + menší `cellSize`, aby to nezaťažovalo slabšie zariadenia.

## Súbory, ktorých sa zmena dotkne
- **NEW** `src/assets/patroni/*` — rozbalené obrázky zo ZIPu
- **NEW** `src/assets/patroni/index.ts` — glob export všetkých obrázkov
- **EDIT** `src/components/landing/MatrixRain.tsx` — kompletný prepis na image rain s pomalšou rýchlosťou

## Nedotknuté
- `HeroSection.tsx`, gradient overlaye, text "IN DOG WE TRUST", CTA button, scroll indicator — všetko ostáva.
- Žiadne iné sekcie (Story, Vision, About) sa nemenia.

## Otvorené otázky (vyriešim pri implementácii)
1. Presný formát obrázkov v ZIPe uvidím až po rozbalení — kód s `import.meta.glob` to zvládne univerzálne.
2. Existujúce TypeScript build errors v `CertificateCard.tsx` a `ThankYouScreen.tsx` (z predchádzajúcich zmien) **nesúvisia** s touto úlohou — neopravujem ich tu, aby som ti nezamiešaval scope. Môžem ich opraviť v ďalšom kroku, ak chceš.
