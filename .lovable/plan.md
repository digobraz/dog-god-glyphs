

## STRICT BRAND COLORS & MANIFESTO TYPOGRAPHY

### Scope

The user wants three changes: (1) replace all pure white text with papyrus `#FAF4EC` across landing pages, (2) reverse the color hierarchy on STORY cards, and (3) update the 9 manifesto headings to remove ellipses.

### Changes

**1. `src/components/landing/StorySection.tsx`**

- **Slides data** — update all 9 `title` values to the exact new strings:
  1. `"It all started with a gentle touch..."`
  2. `"That forged a mythical loyalty"`
  3. `"Endured the gravest injustice"`
  4. `"Brought hope into the darkness"`
  5. `"Melted the ice through selfless sacrifice"`
  6. `"Became our very senses"`
  7. `"Pushed beyond physical limits"`
  8. `"And propelled humanity to the stars"`
  9. `"...so we could build a world where dog is god."`

- **StoryCard** — color reversal:
  - Gold tag: change `color: '#C49B42'` → `color: '#FAF4EC'`
  - Heading (h2): change `text-white` → `text-[#C49B42]`
  - "Read Story" button: change `color: '#C49B42', borderColor: '#C49B42'` → `color: '#FAF4EC', borderColor: '#FAF4EC'`
  - Page counter (`text-white/20`): → `text-[#FAF4EC]/20`
  - `hover:bg-white/10` on button → `hover:bg-[#FAF4EC]/10`

- **StoryModal** — replace white with papyrus:
  - Close button: `text-white/50 hover:text-white` → `text-[#FAF4EC]/50 hover:text-[#FAF4EC]`
  - Modal heading (h3): `text-white` → `text-[#C49B42]` (gold, matching cards)
  - Modal body text: `text-white/70` → `text-[#FAF4EC]/70`

**2. `src/components/landing/HeroSection.tsx`**

- Counter number (line 48): `color: '#FFFFFF'` → `color: '#FAF4EC'`
- Secondary text "or see story first" (line 98): `rgba(255, 255, 255, 0.6)` → `rgba(250, 244, 236, 0.6)`
- CTA border: `border-white/30` → `border-[#FAF4EC]/30`

**3. `src/components/landing/AboutSection.tsx`**

- `text-white/20`, `text-white/70`, `text-white/30` → replace `white` with `[#FAF4EC]` in all instances

### Files
- `src/components/landing/StorySection.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/AboutSection.tsx`

