# Plan: prerobiť hero na skutočnú rotujúcu špirálu ako na Cosmos

## Čo sa zmení
- Nahradím aktuálny jednoduchý kruh za skutočný viac-závitový špirálový layout za textom „IN DOG WE TRUST“.
- Prestanem používať externé Unsplash URL a namiesto toho použijem tvoju nahranú fotku psa ako lokálny asset v projekte.
- Tú istú fotku zduplikujem do viacerých pozícií v špirále ako placeholder, aby boli obrázky vždy viditeľné a nespadli na externom načítaní.
- Hero overlay upravím tak, aby text ostal čitateľný, ale už neprekrýval samotné fotky.

## Prečo to teraz nie je vidno
- Súčasná implementácia je iba jeden rotujúci prstenec, nie špirála.
- Obrázky sa načítavajú z externých Unsplash URL, ktoré sa v preview vôbec neukazujú v network snímke, takže sa na ne nedá spoľahnúť.
- Nad carouselom je ešte pomerne silná centrálna tmavá vrstva, ktorá vie znížiť viditeľnosť pozadia.

## Implementácia
1. Skopírujem nahraný obrázok psa do `src/assets/` a budem ho importovať priamo v Reacte.
2. Prepíšem `DogCircleCarousel.tsx` na špirálovú kompozíciu:
   - viac položiek rozložených podľa uhla aj rastúceho radiusu
   - 2 až 3 vizuálne vrstvy, aby efekt pôsobil hlbšie a bližšie k Cosmos referencii
   - pomalá hypnotická rotácia okolo stredu
   - protirotácia samotných fotiek, aby zostali čitateľne orientované
   - jemné škálovanie/opacita podľa vzdialenosti od stredu, aby to nepôsobilo ako obyčajný kruh
3. Upravil by som hero vrstvy v `HeroSection.tsx`:
   - slabší stredový gradient
   - lepšie z-index rozdelenie medzi pozadie, špirálu, overlay a text
   - zachovanie čistoty titulku a CTA
4. Zachovám hover pause a `prefers-reduced-motion` správanie.
5. Po implementácii vizuálne overím, že špirála je skutočne viditeľná na desktop šírke, ktorú práve používaš.

## Technické detaily
- Súbory:
  - `src/components/landing/DogCircleCarousel.tsx`
  - `src/components/landing/HeroSection.tsx`
  - nový asset v `src/assets/`
- Namiesto `360 / count` kruhového rozloženia použijem špirálový výpočet typu:
  - `angle = index * step`
  - `radius = baseRadius + index * radiusStep`
- Výsledné pozície budú cez kombináciu `rotate(...) translateY(...)` alebo explicitný `x/y` výpočet zo sínus/kosínus, podľa toho čo dá čistejší výsledok.
- Počet duplikátov nastavím tak, aby špirála pôsobila bohato, ale nebola vizuálne preplnená za headline.

## Výsledok
Hero bude pôsobiť oveľa bližšie k tomu, čo chceš z Cosmos: nie jeden orbit, ale rotujúca špirála z opakovaných psích portrétov, pričom všetky obrázky budú lokálne a spoľahlivo viditeľné.

Ak tento plán schváliš, rovno to prerobím.