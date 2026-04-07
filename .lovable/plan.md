

## Problem

CSS `snap-y snap-mandatory` is on the wrapper `<div>` in `LandingPage.tsx`, but that div is **not** the scroll container. The browser scrolls `<html>`, not this div. CSS scroll snap only works on the **actual scroll container**, so snapping does nothing currently.

Making the wrapper div a scroll container (`h-screen overflow-y-auto`) would break `window.scrollY`, `useScroll` from framer-motion, and all IntersectionObservers that rely on the window as root.

## Solution

Apply `scroll-snap-type: y mandatory` directly to the `<html>` element via CSS, and keep all snap-start children as they are.

### Changes

**1. `src/index.css`** — Add scroll-snap to html

```css
html {
  scroll-snap-type: y mandatory;
}
```

**2. `src/components/landing/LandingPage.tsx`** — Remove `snap-y snap-mandatory` from wrapper div

The wrapper div keeps its layout role but no longer pretends to be a snap container. The snap classes are removed since `<html>` handles it via CSS.

**3. `src/components/landing/StorySection.tsx`** — Keep snap anchors as-is

The invisible `h-screen snap-start` divs inside the story section are already correct — they just need the html-level snap container to actually work.

No other files need changes. This is the minimal fix that makes snapping work across all sections and story slides without breaking framer-motion scroll tracking or IntersectionObserver.

