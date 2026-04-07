
Cieľ: dostať hero obsah presne do stredu viewportu, nie do stredu “zvyšného priestoru” medzi dvoma 200px spacer-mi.

Čo je teraz zle:
- V `HeroSection.tsx` je layout riešený ako:
  - horný spacer `h-[200px]`
  - stredný `flex-1`
  - spodný blok `h-[200px]` + `pb-4`
- To spôsobí, že obsah sa centruje len v priestore medzi spacer-mi, nie v rámci celého `100vh`.
- Navyše spodná šípka má extra `pb-4`, takže optická symetria nie je úplne rovnaká.

Navrhovaná úprava:
1. Zachovať `section` ako `h-screen w-full relative bg-black overflow-hidden`.
2. Nechať header úplne nezávislý a plávajúci hore.
3. V hero nahradiť aktuálny “3-blokový” layout za dva nezávislé overlaye:
   - hlavný content wrapper:
     - `absolute inset-0 flex flex-col items-center justify-center text-center px-4`
     - toto zabezpečí presný geometrický stred obrazovky
   - šípka ako samostatný prvok:
     - `absolute bottom-4 left-1/2 -translate-x-1/2`
     - nebude vplývať na centrovanie hlavného obsahu
4. Pre odstup od headera neposúvať celý wrapper spacerom, ale len jemne doladiť samotný content:
   - ak po návrate do presného stredu bude “29” príliš blízko headeru, pridať malý optický offset na content, napr. `translate-y` alebo `pt-*` iba na vnútorný blok, nie cez full-height spacer
   - cieľom je, aby obsah zostal reálne v strede viewportu a zároveň vizuálne nekolidoval s headerom
5. Odstrániť horný `h-[200px]` aj spodný `h-[200px]`, pretože sú hlavný dôvod posunutia nahor/nadol podľa zvyšného priestoru, nie podľa celej obrazovky.

Technické detaily:
- Súbor na úpravu: `src/components/landing/HeroSection.tsx`
- Header pravdepodobne netreba meniť, lebo už je floating:
  - `absolute top-0 left-0 w-full z-50 ...`
- Výsledná štruktúra bude približne:
```text
<section class="relative h-screen w-full overflow-hidden">
  <MatrixRain />

  main content: absolute inset-0 flex items-center justify-center
  bottom arrow: absolute bottom-4 left-1/2
</section>
```

Očakávaný výsledok:
- text “29 PEOPLE SAY:” + heading + CTA budú presne v strede obrazovky
- šípka zostane dole pri okraji sekcie
- header ostane hore ako floating overlay
- žiadne umelé spacery už nebudú deformovať vertikálne centrovanie
