

## Problem

Two gradient issues on mobile:
1. The **radial-gradient overlay** (line 135-140) covers the entire video area with a circular gradient — this is the "kruhový" gradient the user sees. On mobile, this should be a simple bottom-to-top linear gradient instead.
2. The **bottom fade gradient** (line 146) at `h-[20%]` should be reduced by ~40px — changing to `h-[15%]`.

## Plan

**File: `src/components/landing/StorySection.tsx`**

1. **Replace the radial-gradient overlay with responsive logic**: On mobile, use a linear gradient that only fades from transparent at top to black at bottom. Keep the radial-gradient for desktop (md+). This can be done by adding a conditional style based on `isMobile` state (already available in the component).

2. **Reduce bottom fade height**: Change `h-[20%]` to `h-[15%]` on line 146 to show more of the image.

### Technical detail

Line 135-140 — the overlay div:
- Mobile: `background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.97) 100%)`
- Desktop: keep existing `radial-gradient(ellipse at 40% 50%, ...)`

Line 146 — bottom fade: `h-[20%]` → `h-[15%]`

