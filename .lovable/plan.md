I’ll align the `/breed` screen with the actual mobile proportions shown on `/name` and `/photo`.

What I’ll change
1. Normalize the `/breed` header to match the other steps exactly.
   - Use the same top/bottom padding as `/photo`
   - Use the same logo height as `/name` and `/photo`
   - Align the back button position to the same top offset

2. Reduce the dark top card on `/breed` so it matches the visual size of block 1 on `/name` and `/photo`.
   - Shrink Hekthor’s image on mobile
   - Tighten the inner vertical gap/padding on mobile
   - Adjust the heading so it does not create a taller card than the other screens
   - Keep the same overall visual style, only correct the proportions

3. Rebalance the full page layout so `/breed` uses the same vertical distribution as the neighboring steps.
   - Ensure the main content wrapper behaves like the other onboarding screens
   - Let the cream card take the remaining space
   - Preserve strict `100dvh` and no scroll

4. Verify the result against the real preview at mobile size.
   - Compare `/breed` side-by-side with `/name` and `/photo`
   - Confirm block 1 no longer appears taller or heavier than the other two

Technical details
- Primary file: `src/components/screens/BreedScreen.tsx`
- Main issues found from the current code and screenshots:
  - `/breed` header is larger than `/name` and `/photo` (`pt-4`, bigger logo, higher back button offset)
  - The breed heading wraps taller than the neighboring screens, increasing block 1 height
  - The answer card/layout proportions on `/breed` are not distributed like `/photo`
- I’ll correct those proportions with class-level layout changes only; no logic or flow changes.

If you approve, I’ll implement these exact sizing fixes now.