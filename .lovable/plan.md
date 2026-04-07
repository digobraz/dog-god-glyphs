

## Fix: Scroll Up Should Go to First Item of Current Section First

### Problem
Current "Fast-Track Up" logic always jumps to the first item of the **previous** section. User expects: first scroll up → first item of **current** section, then next scroll up → previous section.

### Updated Logic

**File: `src/components/landing/LandingPage.tsx`** — lines 47-52

```tsx
if (direction === -1) {
  if (prev === 15) next = 10;
  else if (prev > 10 && prev <= 14) next = 10;  // VISION 2-5 → VISION 1
  else if (prev === 10) next = 1;                // VISION 1 → STORY 1
  else if (prev > 1 && prev <= 9) next = 1;      // STORY 2-9 → STORY 1
  else if (prev === 1) next = 0;                  // STORY 1 → HERO
  else next = 0;
}
```

### Behavior
- VISION 3/5 (index 12) → scroll up → VISION 1/5 (index 10)
- VISION 1/5 (index 10) → scroll up → STORY 1/9 (index 1)
- STORY 3/9 (index 3) → scroll up → STORY 1/9 (index 1)
- STORY 1/9 (index 1) → scroll up → HERO (index 0)
- ABOUT (index 15) → scroll up → VISION 1/5 (index 10)

One file, one block change.

