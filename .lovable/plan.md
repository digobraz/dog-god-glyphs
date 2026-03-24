

# DOGYPT: The Place Where DOG is GOD — Implementation Plan

## Overview
A premium, mystical, mobile-first web app where dog owners go through a 12-step ceremonial wizard to generate a personalized Egyptian-style "HEROGLYPH®" for their dog, culminating in a dramatic reveal, vision screen, and mock checkout.

## Design System
- **Papyrus background** (#F3EBDD) with CSS noise/grain overlay texture
- **Metallic gold** (#C49B42) accents, borders, glowing box-shadows
- **Cinzel** font for headings/logos (Google Font), **Inter** for body text
- Egyptian cartouche-shaped (pill) borders throughout
- Dark mode for the reveal screen (#000 background, gold text)
- Framer Motion for all transitions, reveals, and particle effects

## Screens & Flow

### 1. Welcome Hero
Full-viewport immersive landing with [DOG]YPT® logo (DOG in gold cartouche), motto, headline "EVERY DOG DESERVES TO BE A GOD", floating gold particles, and "BEGIN THE RITUAL →" CTA.

### 2. Dog Name Input
Centered large uppercase text input with gold bottom border. Saves name to global state.

### 3–14. The 12-Step Wizard
Shared layout: gold cartouche progress bar with Roman numerals, selectable card grid (gold glow on selection), and a **live HEROGLYPH preview** (right sidebar on desktop, bottom drawer on mobile) that fills in as selections are made.

Steps: Dog Sex → Fur Color → Destiny → Bloodline → Patron (30 breed options) → Character Trait 1 (8 options) → Character Trait 2 (8 options, previous disabled) → Owner's Sex → Owner's Initial (A-Z, rendered rotated 90° in preview) → Dog Order (Roman numerals) → Chinese Zodiac (birth year input with auto-calculation) → Western Zodiac (date picker with auto-calculation).

Auto-advance 800ms after selection with AnimatePresence slide transitions.

### 15. HEROGLYPH Reveal
Dark mode activation. 3-second staggered animation: cartouche borders draw in, 12 emojis pop in sequentially. Outer cartouche holds dog traits (sex, color, destiny, bloodline, patron, traits), inner cartouche holds owner traits (sex, rotated initial, zodiacs, dog order). "CONTINUE →" fades in after animation.

### 16. Vision / Video
Return to papyrus. YouTube placeholder, 3 vision points (Global Community, Help Dogs, Eternal Legacy), "CLAIM YOUR HEROGLYPH →" CTA.

### 17. Pricing & Payment
3-tier cards (Bronze €11, Silver €22 "MOST POPULAR", Gold €33) stacking on mobile. Email input below selected tier. "PAY & FORGE" button triggers 2-second mock loading spinner, then advances.

### 18. Confirmation
Gold confetti particle effect. Shows dog name, final HEROGLYPH render, "scroll sent to [email]" message, social share placeholders, and "RETURN TO DOGYPT" button that resets state.

## State Management
Zustand store holding: `dogName`, `currentStep`, `selections` (12 choices), `selectedTier`, `email`.

## Key Technical Details
- Framer Motion for all page transitions, card selections, reveal animations, and confetti
- Chinese Zodiac helper function (year % 12 mapping)
- Western Zodiac helper function (month/day range mapping)
- Shadcn/ui components customized to gold/papyrus theme
- Mobile-first responsive design throughout

