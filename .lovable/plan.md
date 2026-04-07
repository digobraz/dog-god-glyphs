

## Problem

When user clicks VISION (index 10) in the menu and then scrolls up, they land on **Hero (0)** instead of **Story 1/9 (1)**. Same issue from ABOUT.

**Root cause**: The `scrollToIndex` function uses a **100ms cooldown** for instant/section jumps (line 36). When the user scrolls up from VISION, the fast-track logic correctly computes `next = 1` and performs an instant scroll. But the 100ms lock expires almost immediately, and the **next wheel/touch event** from trackpad inertia fires another `navigate(-1)`, which now reads `prev = 1` and jumps to `next = 0` (Hero). The user sees VISION → Hero in what appears to be a single action, skipping Story entirely.

## Fix

**File: `src/components/landing/LandingPage.tsx`**

Change the cooldown for instant/section jumps from 100ms to the full `TRANSITION_DURATION` (1000ms). This absorbs all remaining inertia events and prevents the double-jump.

```tsx
// Line 36 — BEFORE:
const delay = (instant || isSectionJump) ? 100 : TRANSITION_DURATION;

// AFTER:
const delay = TRANSITION_DURATION;
```

One line change. The full 1000ms lock applies to all transitions — both smooth scrolls and instant section jumps. This ensures one scroll action = one section change, even with trackpad inertia.

