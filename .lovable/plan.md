# Merge Dog Name + Birthday into Single `/name` Screen

## Goal
Combine the dog name input and dog birthday input into one screen at `/name`. Delete the standalone `/birthday-dog` screen and rewire navigation to skip it.

## Changes

### 1. `src/components/screens/NameScreen.tsx` — add birthday field
Keep the existing visual design (Hekthor speech bubble + papyrus input card). Inside the input card, stack two fields vertically:

- **Field 1 — Dog's name** (existing): text input, required, trimmed length 1–30, uppercased on save.
- **Field 2 — Dog's birthday** (new): shadcn Date Picker (Popover + Calendar) styled to match the papyrus card. Required. Allowed range: `1990-01-01` → today (disable future dates and pre-1990 dates).

Continue button:
- Disabled until both name (1–30 chars after trim) AND a date are selected.
- On click: save name via `setDogName(name.trim().toUpperCase())`, save date via `setSelection('birthdayDay', dd)`, `setSelection('birthdayMonth', mm)`, `setSelection('birthdayYear', yyyy)` (same keys old `BirthdayDogScreen` used), then `navigate('/photo')`.
- Use the existing gold gradient button style. Replace the current "appear when input filled" pattern with a single always-visible button that toggles `disabled` state.

Persistence: on mount, prefill the name input from `dogName` (if not the default `'DAISY'`) and prefill the date from `selections.birthdayDay/Month/Year` so the values survive back-navigation.

Copy stays short and mission-toned — labels only, no marketing text:
- Speech bubble keeps current Hekthor greeting.
- Birthday field label: `When was your dog born?`

### 2. Remove `/birthday-dog` everywhere
- Delete `src/components/screens/BirthdayDogScreen.tsx`.
- `src/App.tsx`: remove the `BirthdayDogScreen` import and the `<Route path="/birthday-dog" ...>` line.
- `src/components/screens/BreedPatronScreen.tsx` line 263: change `navigate('/birthday-dog')` → `navigate('/ranking')`.
- `src/components/screens/BreedScreen.tsx` lines 60 and 187: change `navigate('/birthday-dog')` → `navigate('/ranking')`.
- `src/components/screens/RankingScreen.tsx` line 377 (back button): change `navigate('/birthday-dog')` → `navigate('/breed')`.

### 3. Untouched (per task constraints)
- `PhotoScreen`, owner screens, paywall, heroglyph generation logic — none of these read the dog birthday today, and we won't add such reads. Birthday remains soft-data in `selections`.
- Owner zodiac flow (which feeds the heroglyph) is not touched.

## Verification
- `/name` shows name + birthday inputs; Continue disabled until both valid.
- Submitting on `/name` lands on `/photo`.
- Going back from `/photo` to `/name` shows previously entered values.
- `/birthday-dog` route returns NotFound (route deleted).
- Wizard chain Breed → Ranking works without the removed step.
- `rg "/birthday-dog"` returns no matches after the change.

## Technical notes
- Use shadcn `Popover` + `Calendar` per the project's datepicker pattern (`pointer-events-auto` on Calendar, `disabled={(d) => d > new Date() || d < new Date('1990-01-01')}`).
- Store values as zero-padded strings (`'01'..'31'`, `'01'..'12'`, `'YYYY'`) to stay byte-compatible with the old `BirthdayDogScreen` write format.
- No store schema changes; `selections` already holds the three birthday keys.
