# Plan: restore the broken preview and stop the blank screen loop

## What I found
The preview is not blank because of the new Testimonials JSX itself. The app is mounting, but the main stylesheet is failing to load in preview.

Confirmed symptoms:
- The browser loads `src/main.tsx` and `src/App.tsx` successfully.
- The request for `src/index.css?t=...` fails in preview.
- With CSS missing, the page ends up rendering as an effectively blank white screen.
- There are no runtime React errors from `TestimonialsSection` or `TestimonialsColumn` in the snapshots I checked.

I also confirmed the CSS file exists in the repo, so this looks like a preview/dev-server asset serving issue triggered by the current state, not a missing file on disk.

## Implementation plan
1. Isolate the stylesheet issue by simplifying the CSS entry path.
   - Replace the direct `import "./index.css"` dependency with a clean stylesheet path the preview serves reliably.
   - Check whether the problem is caused by the current `src/index.css` pipeline rather than the Testimonials components.

2. Reduce the blast radius of recent changes.
   - Temporarily remove the new `TestimonialsSection` from `LandingPage` if needed to confirm the preview restores.
   - Once the preview is visible again, reintroduce the section incrementally.

3. Rebuild the testimonials block in the safest form.
   - Keep the section under About Us.
   - Preserve the 3-column vertically scrolling concept.
   - Avoid any styling patterns that might destabilize preview rendering if one of the current CSS features is contributing.

4. Verify preview rendering first, then content.
   - Confirm the homepage renders again.
   - Confirm the new section is visible below About Us.
   - Confirm your earlier mobile hero adjustments still remain unchanged.

## Technical details
Likely failure point to test first:
- `src/index.css` request is returning a failed response in preview even though the file exists.

Files likely involved:
- `src/main.tsx`
- `src/index.css`
- `src/components/landing/LandingPage.tsx`
- `src/components/landing/TestimonialsSection.tsx`
- `src/components/landing/TestimonialsColumn.tsx`

## Expected result
- The preview stops showing a blank white canvas.
- You can review the landing page again without wasting more credits on repeated blind fixes.
- The testimonials section is either restored safely or temporarily removed until the preview is stable.
