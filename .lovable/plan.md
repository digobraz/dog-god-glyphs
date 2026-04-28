## Cieľ
1. YouTube video sa nesmie spustiť automaticky.
2. Štítok „Watch INTRO MOVIE" je biely, klikateľný a má pred sebou ikonku PLAY v krúžku.
3. Po kliknutí na štítok sa stránka sama auto-scrolluje do bodu, kde je video v strede obrazovky (bez toho, aby používateľ musel rolovať), a video sa spustí.

## Čo upraviť
**Súbor:** `src/components/landing/HeroVideoSequence.tsx`

### 1. YouTube embed bez autoplay
- V `embedUrl` zmeniť `autoplay=1` → `autoplay=0` a odstrániť `mute=1` / `loop` / `playlist` parametre, ktoré dávali zmysel len pri autoplay slučke.
- Pridať `enablejsapi=1` do URL, aby sme cez `postMessage` API mohli iframe spustiť programovo.
- Držať `iframe` v `useRef`, aby sme naň mohli poslať `{event:'command', func:'playVideo', args:[]}` cez `contentWindow.postMessage`.

### 2. Klikateľný „Watch INTRO MOVIE" s PLAY ikonkou
- Štítok prerobiť z `<motion.span>` na `<motion.button>` (alebo `<a>` s `onClick`).
- Farba textu: biela (`#FAF4EC` — projektová papyrus-biela, podľa memory pravidla „no pure white").
- Pred text vložiť `Play` ikonu z `lucide-react` zabalenú v kruhu (`rounded-full`, border + jemný gold/biely glow), velkosť ~28 px, ikona ~14 px, vyplnená bielou.
- Layout: `flex items-center gap-3`, hover scale 1.05.
- `pointer-events-auto` na štítku (rodič má `pointer-events-none`).

### 3. Auto-scroll do stredu po kliknutí
- Pridať `onPlayClick` handler:
  1. Vypočítať cieľový scroll Y tak, aby `videoY` bolo `0vh` (video v strede). To zodpovedá `scrollYProgress ≈ 0.58` v rámci wrapper sekcie.
  2. Cieľ = `wrapperRef.current.offsetTop + wrapperRef.current.offsetHeight * 0.58`.
  3. `window.scrollTo({ top: target, behavior: 'smooth' })`.
  4. Po cca 900 ms (čas na smooth scroll) zavolať postMessage play na iframe.
- Použiť `useRef` na `iframeRef` a `wrapperRef` (wrapperRef už existuje).

### 4. Drobnosti
- `labelOpacity` ostáva — štítok aj naďalej mizne pri scrollovaní (aby sa neprekrýval s videom v strede), ale klik funguje pred zmiznutím.
- Tlačidlo treba mať dostatočne nad blackout vrstvou — `z-30` rodič stačí, ale `pointer-events-auto` výslovne na ňom.
- Skontrolovať, že video po manuálnom scrollnutí späť hore neostane prehrávané v pozadí — necháme tak (užívateľ ho môže pauznúť cez YT controls; voliteľne pridáme pause keď scrollYProgress klesne pod 0.3).

## Pseudokód kľúčových zmien
```text
embedUrl = `.../embed/${id}?autoplay=0&controls=1&rel=0&playsinline=1&enablejsapi=1`

iframeRef = useRef<HTMLIFrameElement>(null)

handlePlayClick():
  target = wrapperTop + wrapperHeight * 0.58
  window.scrollTo({ top: target, behavior: 'smooth' })
  setTimeout(() => {
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
      '*'
    )
  }, 900)

<motion.button onClick={handlePlayClick} className="pointer-events-auto flex items-center gap-3">
  <span className="rounded-full border border-white/60 w-7 h-7 grid place-items-center">
    <Play size={14} fill="white" className="text-white ml-0.5" />
  </span>
  <span style={{ color: '#FAF4EC', fontFamily: "'Cinzel', serif" }}>
    Watch INTRO MOVIE
  </span>
</motion.button>
```

## Súbory
- `src/components/landing/HeroVideoSequence.tsx` — všetky zmeny vyššie.
