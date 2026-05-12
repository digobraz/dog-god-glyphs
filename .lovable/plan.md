## Cieľ

Pridať plávajúci dev navigačný dropdown, ktorý je viditeľný iba v development/preview prostredí (nie na produkčnom `dogypt.com`) a obsahuje odkazy na všetky routes z `App.tsx`. Slúži len na rýchlu navigáciu počas vývoja.

## Čo pridám

1. **Nový komponent** `src/components/DevNav.tsx`
   - Plávajúce tlačidlo vpravo dole (fixed, z-index vysoký, aby neprekážalo)
   - Po kliknutí sa rozbalí dropdown so zoznamom všetkých routes zoskupených do sekcií:
     - **Landing / Public**: `/`, `/spiral`, `/grid`, `/gods`, `/devhome`, `/vision`, `/terms`, `/privacy`
     - **Heroglyph wizard**: všetkých 14 krokov `/heroglyph/*`
     - **Checkout**: `/checkout`, `/payment`, `/welcome`
     - **Pack (auth)**: `/login`, `/pack`, `/pack/eternal`, `/pack/profile`
   - Aktívna route zvýraznená
   - Použije shadcn `DropdownMenu` + `react-router-dom` `Link`

2. **Mount v `src/App.tsx`**
   - Vložiť `<DevNav />` vnútri `<BrowserRouter>` (mimo `<Routes>`), aby bol viditeľný na každej stránke
   - Render iba ak `import.meta.env.DEV === true` **alebo** hostname obsahuje `lovable.app` (preview). Na `dogypt.com` sa nezobrazí.

## Dizajn

Malé diskrétne tlačidlo (ikona zoznamu + label „Dev nav"), tmavé pozadie s opacity, aby ladilo s landing/wizard a nerušilo. Žiadne zmeny existujúcich stránok, štýlov ani logiky.

## Mimo scope

- Žiadne úpravy existujúcich komponentov, routes, ani štýlov.
- Žiadne backend zmeny.
- Žiadny zásah do produkčnej navigácie (Header landing page ostáva nezmenený).
