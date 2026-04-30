
## Changes to `src/components/screens/ThankYouScreen.tsx`

### 1. Import the real Hektor photo

Add `import hekthorImg from '@/assets/hekthor.png';` and replace the `HEKTOR_PHOTO_URL` placeholder with it.

### 2. Merge Card #1 and Card #2 into a single combined welcome card

Replace the separate dog photo card and counter card with one cream card using a flex row layout:

- **Left column**: Square dog photo (~140px, reduced to ~120px on mobile via clamp), rounded-xl corners, soft drop shadow (`0 8px 24px rgba(0,0,0,0.18)`), no border/gold frame.
- **Right column** (vertically centered, left-aligned):
  - "Welcome, [DOG NAME] & [Owner first name]." — serif gold, ~20-22px
  - 8-12px spacer
  - "You are" — muted gold, ~15-17px
  - `#23` counter number — gold gradient text, serif, ~52-64px (using existing `useAnimatedCounter` with 600ms duration)
  - "IN DOGYPT · of 1,000,000" — small letterspaced caps, ~12-13px, muted gold

Card padding ~20-24px, gap ~20px between columns. Side-by-side layout preserved on all screen sizes.

### 3. Update Card #3 (now Card #2) — purple-orange gradient

- Replace `HEKTOR_PHOTO_URL` (placedog.net) with `hekthorImg` (the real Hektor asset at `src/assets/hekthor.png`).
- Everything else stays: avatar size, thank you text, CTA button, layoutId animation.

### 4. Adjust spacing

- Two cards instead of three, centered vertically in the viewport.
- Counter animation duration reduced from 1000ms to 600ms.
- All existing constraints preserved: 100dvh, no scroll, reduced-motion support, real-time DB count, FLIP animation on CTA.
