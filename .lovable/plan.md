

## Add 9 Cloudinary Videos to STORY Cards

### What
Add looping background videos to the left panel of all 9 STORY cards using Cloudinary URLs with `q_auto,f_auto,w_1280` transformations. Videos play behind the existing dark gradient overlay.

### Changes — `src/components/landing/StorySection.tsx`

1. **Add `video` field to each slide** with optimized Cloudinary URLs:
   - `https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590313/STORY-1_quhcaj.mp4`
   - `https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590315/STORY-2_hwu17c.mp4`
   - `https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590314/STORY-3_jtaog8.mp4`
   - `https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590313/STORY-4_rlxoko.mp4`
   - `https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590313/STORY-5_cwmuoh.mp4`
   - `https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590313/STORY-6_q53uew.mp4`
   - `https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590315/STORY-7_k4tdjs.mp4`
   - `https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590314/STORY-8_b2vhcn.mp4`
   - `https://res.cloudinary.com/dz8lolmod/video/upload/q_auto,f_auto,w_1280/v1775590313/STORY-9_ajc1mz.mp4`

2. **In `StoryCard` left panel** (line 90), add a `<video>` element before the gradient overlay:
   ```tsx
   <video
     src={slide.video}
     autoPlay muted loop playsInline
     className="absolute inset-0 w-full h-full object-cover"
   />
   ```

3. **Existing radial gradient overlay stays on top** of the video — preserves the dark cinematic look and text readability. Number watermark also stays.

### Files
- `src/components/landing/StorySection.tsx`

