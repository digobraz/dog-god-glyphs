## Goal

Make the 2nd block on `/breed` (search input, category tabs, silhouette tiles, dropdown, Mix pill) use exactly the same semantic colors as `/ranking` and `/owner-zodiac`. Today it uses hardcoded blacks/beiges that don't match.

## Single source of truth (already in `index.css`)

- Beige card background: `papyrus-bg` (= `hsl(var(--papyrus))`, `36 33% 91%`)
- Card border: `border-2 border-border/40` (gold, `--border = --gold = 39 55% 51%`)
- Inner control surface: `bg-card`
- Inner border: `border-border/30..60`
- Text: `text-foreground` / `text-muted-foreground`
- Active/selected: `border-primary` + `bg-primary/10`
- Dog name highlighting: bold + `text-primary`

No hex colors, no `rgba(0,0,0,…)`, no `#000`, no `#FAF4EC`.

## Changes in `src/components/screens/BreedPatronScreen.tsx`

1. **Search input pill** — replace `bg: rgba(0,0,0,0.06) / border rgba(0,0,0,0.4)` with `bg-card border border-border/40`. Icon → `text-muted-foreground`. Input text → `text-foreground placeholder:text-muted-foreground`. Clear button → `text-muted-foreground hover:text-foreground`.

2. **Selected breed chip** — `bg-primary/20 text-foreground` (matching original BreedScreen chip).

3. **Search dropdown** — `bg-card border border-border/40`, item rows `border-b border-border/20 hover:bg-primary/10 text-foreground`. Patron icon: drop the `invert(1)` (icon stays as-is).

4. **Category tabs** — inactive: `text-muted-foreground border-b-2 border-transparent`; active: `font-bold text-foreground border-b-2 border-primary`. Cinzel.

5. **Silhouette tiles** — `border-2`; selected: `border-primary bg-primary/10`; idle: `border-border/60 hover:border-primary/50 bg-card/50`. Drop `invert(1)` on the SVG.

6. **Mix pill (trailing)** — outline: `border border-border/40 bg-card text-foreground hover:bg-primary/10`; active: `bg-primary text-primary-foreground border-primary`. Same height `h-11`, Cinzel.

7. **Picker card wrapper** — keep `papyrus-bg border-2 border-border/40 rounded-2xl`, remove the heavy custom `boxShadow` (or reduce to match other cards: `shadow-sm`).

No functional / structural changes. No prop changes. Block 1 (Hektor gradient hero) stays as-is. Continue button stays as-is.

## Acceptance

- Side-by-side `/breed` and `/ranking`: same beige tone, same gold borders, same active gold highlight, same muted gold text — visually identical theme.
- No literal `#000`, `#FAF4EC`, or `rgba(0,…)` left in `BreedPatronScreen.tsx`.
