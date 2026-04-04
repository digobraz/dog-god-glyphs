

## Plan: Orezať viewBox v HeroglyphFrame

**Problém:** SVG rámik má viewBox `0 0 14692 5696`, ale viditeľný obsah (vonkajší čierny rámik) zaberá len oblasť cca od `(850, 1190)` do `(13840, 4500)`. To vytvára veľké prázdne medzery nad a pod rámikom, ktoré zbytočne zaberajú miesto v 1. bloku.

**Riešenie:** Zmeniť `viewBox` v `HeroglyphFrame.tsx` tak, aby tesne obklopoval viditeľný obsah. Stačí upraviť jeden riadok:

```
viewBox="0 0 14692 5696"  →  viewBox="800 1100 13100 3500"
```

Tým sa odrežú prázdne okraje a rámik vyplní dostupný priestor oveľa efektívnejšie. Všetky sloty a symboly zostanú na svojich pozíciách — mení sa len "kamera", nie obsah.

**Súbor:** `src/components/HeroglyphFrame.tsx` (riadok 241)

**Dopad:** Rámik bude vizuálne väčší a kompaktnejší v 1. bloku. Žiadne iné súbory nie je treba meniť.

