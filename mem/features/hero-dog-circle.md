---
name: Hero Dog Circle Carousel
description: Rotating circular carousel of dog photos in the hero section background (cosmos.so style)
type: feature
---
Hero section uses `DogCircleCarousel` component as a z-0 background layer.

- 12 round dog photos placed around a circle's perimeter
- Outer ring rotates 360° / 40s linear infinite; each photo counter-rotates -360° / 40s to stay upright
- Pauses on hover (animation-play-state: paused on .dog-circle-wrapper:hover)
- Respects prefers-reduced-motion
- Ring size: clamp(360px, 64vw, 680px); photo size: clamp(64px, 9vw, 110px)
- Photos: opacity 0.72, gold border rgba(196,155,66,0.45)
- Placeholder photos from Unsplash CDN (no API key); replace with real dogs later
- Z-index layers in HeroSection: z-0 carousel, z-10 radial+vertical overlays for text legibility, z-20 text+CTA
- Carousel wrapper has pointer-events-none so CTA stays clickable
