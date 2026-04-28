# Cosmos.so plynulý scroll — kompletná prestavba

## Čo je problém dnes
Aktuálna landing page mieša dva nekompatibilné modely scrollu:
- **Hero+Story stack** používa natívny scroll s Framer Motion `useScroll` scrubbingom
- **Vision a About** používajú JS scroll-hijacking s 1000ms snap animáciami

Prechod medzi nimi je trhaný, scrubbing efekt na videu nepôsobí plynulo a celkový pocit nezodpovedá cosmos.so. Cosmos.so v skutočnosti vôbec nepoužíva scrubbing ani hijacking — má iba čistý natívny scroll s lazy fade-in obsahu.

## Cieľ
Plynulý natívny scroll po celej stránke. Žiadny hijacking, žiadne snapping, žiadny dual-layer scrubbing. Hero a video sú dve normálne sekcie pod sebou. Vision steps sa scrollujú prirodzene. Obsah sa fade-in objavuje, keď príde do viewportu.

## Štruktúra stránky (zhora nadol)

```text
┌─────────────────────────┐
│  Header (sticky top)    │
├─────────────────────────┤
│  HeroSection 100dvh     │ ← statický, nadpis + CTA
├─────────────────────────┤
│  StorySection 100dvh    │ ← video, fade-in pri vstupe do viewportu
├─────────────────────────┤
│  VisionStep 1  100dvh   │
│  VisionStep 2  100dvh   │  ← prirodzený scroll, každý krok
│  VisionStep 3  100dvh   │     fade-in cez whileInView
│  VisionStep 4  100dvh   │
│  VisionStep 5  100dvh   │
├─────────────────────────┤
│  AboutSection 100dvh    │
└─────────────────────────┘
```

## Zmeny v kóde

### 1. `LandingPage.tsx` — odstrániť celý hijacking
- Vymazať všetky wheel/touch/keydown listenery
- Vymazať `currentIndexRef`, `isAnimating`, `scrollToIndex`, `navigate`, `isInsideStack`
- Ponechať iba: `<Header />`, `<HeroSection />`, `<StorySection />`, `<VisionSection />`, `<AboutSection />`
- Hash navigácia → jednoduché `element.scrollIntoView({ behavior: 'smooth' })`
- `nav-jump` event → tiež scrollIntoView na element s daným id

### 2. Rozdeliť `HeroStoryStack.tsx` späť na dva komponenty
- **`HeroSection.tsx`** (znovu vytvoriť): statický 100dvh, nadpis "29 PEOPLE SAY: IN DOG WE TRUST", CTA "BE NEXT!", pulzujúca šípka dole. Žiadny scrubbing, žiadny sticky.
- **`StorySection.tsx`** (znovu vytvoriť): 100dvh sekcia s YouTube videom. Caption + video s `whileInView` fade-in (Framer Motion `initial` + `whileInView`, `viewport={{ once: true, amount: 0.3 }}`).
- Vymazať `HeroStoryStack.tsx`.

### 3. `VisionSection.tsx` — odstrániť `data-snap-page`
- Žiadne ďalšie zmeny obsahu, iba odstrániť atribút (už netreba)
- Existujúce `whileInView` animácie zostávajú, fungujú perfektne pri natívnom scrolle

### 4. `AboutSection.tsx`
- Žiadne zmeny obsahu, iba zaobaliť ako bežnú sekciu (atribút `data-snap-page` už netreba)

### 5. `Header.tsx` — opraviť navigáciu
- Namiesto `nav-jump` event s indexom → použiť IDčka:
  - `#hero` → HeroSection
  - `#story` → StorySection  
  - `#vision` → VisionSection (prvý krok)
  - `#about` → AboutSection
- Klik v menu → `document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })`
- Active section tracking (existujúci ratioMap z IntersectionObserver) zostáva, len priradiť nové IDčka

### 6. Plynulý scroll
- Pridať `html { scroll-behavior: smooth }` do globálneho CSS
- (Voliteľné neskôr) Lenis pre extra-buttery scroll, ale najprv skúsime bez neho — natívny smooth býva dnes dosť dobrý

## Čo ZOSTÁVA zachované
- Vizuálny dizajn, fonty, farby, gradienty — bezo zmeny
- Obsah (nadpisy, CTA texty, video URL, vision steps, about section)
- Header s color inversion logikou
- Fade-in animácie cez `whileInView`
- AnimatedCounter v hero sekcii
- Pulzujúca šípka v hero

## Čo SA ODSTRÁNI
- Celý 1000ms hijacking model
- `data-snap-page` atribúty
- Scrubbing animácia "video rises from below" (cosmos to nerobí)
- `nav-jump` custom event systém
- Komplikovaný `HeroStoryStack` dual-layer sticky setup

## Memory update
- Update `mem://ux/landing-page-scroll-architecture` → odstrániť hijacking, popisuje natívny scroll
- Update `mem://index.md` Core: zmeniť "Landing page uses custom 1000ms JS scroll hijacking" → "Landing page uses native smooth scroll, cosmos.so style"

## Riziká
- Stratíme deterministické "snap-to-section" správanie pri Vision krokoch. Užívateľ môže skončiť uprostred medzi dvoma krokmi. To je presne ako cosmos.so — akceptovateľné.
- CSS `scroll-snap-type: y mandatory` by sme mohli pridať ako kompromis, ale to obvykle pôsobí trhanejšie než žiadny snap. Začneme bez snap.

## Po implementácii
Otestujem v prehliadači plynulosť scrollu od top po bottom a hlásim výsledok.
