

## Problem
On mobile, the layout splits into 75vh video + 25vh text with a black gap between them. The user wants the video to fill the entire screen and the text to overlay the bottom of the video — like a caption on a photo.

## Plan

**File: `src/components/landing/StorySection.tsx` — StoryCard component**

Restructure the mobile layout from a stacked split (video 75vh + text 25vh) to a full-screen overlay:

1. **Video fills entire screen on mobile**: Change the video container from `h-[75vh]` to `h-full` on mobile, making it fill the full `h-screen` parent.

2. **Text overlays the bottom of the video on mobile**: Instead of rendering the text panel as a separate `div` below the video, position it absolutely at the bottom of the card, overlapping the video. Hide the separate black text panel on mobile entirely.

3. **Gradient only behind text area**: Replace the current full-overlay gradient with one that only covers the bottom ~25% where the text sits — starting transparent at the top of the text area and fading to dark behind it.

### Technical detail

In `StoryCard` (lines 121-195):

- Line 122: Keep `h-screen` on the parent container
- Line 123: Change mobile video container to fill parent: `h-full` instead of `h-[75vh]`
- Lines 135-142: Adjust mobile gradient to `linear-gradient(to bottom, transparent 75%, rgba(0,0,0,0.85) 90%, rgba(0,0,0,0.95) 100%)`
- Line 148: Remove the extra bottom fade div on mobile (redundant now)
- Line 151: On mobile, change the text panel from a separate block to `absolute bottom-0 left-0 right-0` with transparent background, removing `h-[25vh]` and `bg-black`
- Text padding/spacing stays compact as currently configured

This creates a full-bleed image with text floating at the bottom, gradient only behind the text for readability.

