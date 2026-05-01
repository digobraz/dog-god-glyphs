
## Problem

The overlay card appears at the top instead of centered. In the Lovable preview iframe, `position: fixed` with `inset: 0` can behave unexpectedly because the iframe context may not give the expected viewport dimensions to `fixed` positioning.

## Fix

In `src/components/screens/ThankYouScreen.tsx`, line 151, change the overlay `motion.div` to use explicit dimensions instead of relying solely on `fixed inset-0`:

**Current:**
```tsx
className="fixed inset-0 z-50 flex items-center justify-center dark-bg"
```

**New:**
```tsx
className="z-50 dark-bg"
style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
```

This forces the overlay to fill the full viewport with explicit `100vw` / `100dvh` dimensions, ensuring the flexbox centering works correctly regardless of iframe context. No other changes needed.
