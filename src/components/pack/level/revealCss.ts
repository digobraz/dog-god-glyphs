// ─────────────────────────────────────────────────────────────────────────────
// CSS REVEALU — oddelené od komponentu, aby Vite Fast Refresh neprepadal na full reload
// (rovnaký dôvod ako `packTheme.ts`: konštanta vedľa komponentu láme HMR).
//
// Zdroj pravdy STAVBY = nákres `plany/reveal-nakres.html` (Matej, 23.–24. 8. 2026, sedem kôl).
// Zdroj pravdy ŠATU = nákres `plany/nakres-reveal-lapis-2026-08-28.html` (objekt REV).
//
// ── ŠAT SA VYMENIL 28. 8. 2026 (Matej) ───────────────────────────────────────────────────
// „Reveal je prispôsobený na dark tému a horný nav má gradient zrezaný ako na mobil…
//  viac-menej tam bude všetko to isté, len v inom šate. Pozadie môže zostať tmavé, ale nie
//  čierne — lapisové. A na stred obrazovky pôjde obsah ako teraz, ale v bloku/rámiku
//  v dizajne, ako má rámik v /map na ľavej strane alebo dolný nav (blok s okrajom —
//  nazvime to dblok). Ostatné len zmeň farby. Takisto po kliknutí na detail bodov to sprav
//  v tom istom dbloku, nie roztiahnuté, a v bledých farbách to chceme."
//
// STAVBA SA NEMENÍ: hlavička je ďalej JEDEN prvok v dvoch stavoch (pri zatvorení sa scvrkne
// na hlavičku mapy), telo je ďalej miniatúra → názov → meta → body → ⓘ → CTA a rozpad žije
// ďalej iba v ⓘ. Mení sa povrch, na ktorom to stojí:
//   · závoj = tmavý LAPIS s presvetlením hore a vinetáciou, nie čierna
//   · hlavička aj telo = DBLOK — `goldFrameCSS()` z navGoldSkin.ts, teda ten istý odliatok
//     (zlatý rám v pixeloch → pieskovcová doska → zrno → mramorovanie), aký nesie spodný nav
//     a ľavý panel v /map. Žiadne vlastné čísla: rám aj polomer berie z BLOCK.
//   · inkoust na doske je papyrusový (PALE), hlavné CTA je LAPIS (brandový kánon 28. 8.)
//   · rozpad bodov = ten istý dblok, nie pás cez celú obrazovku
// ⚠️ Scéna level-upu (konfety, prstence, prehodenie čísla) ostáva TMAVÁ a nedotknutá — je to
//    iná vrstva než obrazovka s bodmi a nákres ju zámerne nerieši.
// Keď sa mení jedno, musí sa zmeniť druhé.
//
// ⚠️ Toto je JS template literal — SPÄTNÝ APOSTROF v CSS komentári zhodí build a `tsc` to
//    nechytí. Po každom zásahu spusti `npm run build`, nielen typecheck.
// ─────────────────────────────────────────────────────────────────────────────

import { FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { goldFrameCSS, LAPIS, LAPIS_BTN_SHADOW, PALE } from '@/components/pack/navGoldSkin';

export const REVEAL_CSS = `
.rv{position:fixed;inset:0;z-index:2500;overflow:hidden;
    font-family:${FONT_UI};color:#F5F0E4;-webkit-font-smoothing:antialiased;}

/* Zatemnenie mapy je SÚČASŤ POPUPU — mizne spolu s ním, nie skôr. */
/* ⚠️ LAPIS, NIE ČIERNA (Matej 28. 8. 2026). Tri vrstvy, zhora nadol: presvetlenie hornej
   tretiny (bez neho je z plochy mŕtvy obdĺžnik), vinetácia k okrajom, lapisová výplň.
   ⚠️ KRYTIE KLESLO 0,90 → 0,68 (Matej 28. 8.: „tá modrá v pozadí je moc výrazná — zníž
   priesvit nech nie je taká agresívna"). Dôvod, pre ktorý stúplo 24. 8., ostáva v platnosti
   — pod tým leží skutočná OSM mapa so svetlými dlaždicami a menami obcí, ktoré inak
   presvitajú do textu — preto sa čitateľnosť NEPRENECHALA farbe, ale ROZOSTRENIU: blur
   7 → 13 px. Rozmazaná mapa nemá hrany, ktoré by kreslili do písma, takže sa krytie dá
   pustiť nižšie bez toho, aby sa spodok vrátil do textu. Kto sa vráti k číslu, mení oboje. */
.rv-scrim{position:absolute;inset:0;
          background:
            radial-gradient(120% 90% at 50% 12%, rgba(40,74,168,0.16), transparent 70%),
            radial-gradient(120% 100% at 50% 50%, transparent 46%, rgba(3,8,26,0.34) 100%),
            rgba(10,26,74,0.68);
          backdrop-filter:blur(13px) saturate(.9);-webkit-backdrop-filter:blur(13px) saturate(.9);
          transition:opacity .62s cubic-bezier(.3,.85,.25,1);}
.rv.closing .rv-scrim{opacity:0;}

.rv-shell{position:absolute;inset:0;max-width:430px;margin:0 auto;}

/* ══ HEADER ════════════════════════════════════════════════════════════════
   Matej 23. 8.: „na obrazovke bude klasický header ako je normálne ale ako keby zoom out
   + progres ukazovatel po zrušení okna sa ako keby vráti do headra".

   ⚠️ ZATVÁRANIE SA 28. 8. VYMENILO (Matej: „ako idem späť na mapu a predtým ako sa obrazovka
   zabledne je vidno celý blok PÚTNIK z revealu — oprav to tak, že po kliku vedľa celý horný
   blok zmizne okrem FOTKY a tá sa vráti namiesto do hornej fotky v /map").
   Do vtedy sa CELÝ blok scvrkával na rozmery hlavičky mapy a cieľ bol trafený len približne
   — na poslednej štvrtine cesty stál nad mapou papyrusový pás, ktorý sa s ničím nekryl.
   Odteraz blok zhasne (rýchlejšie než závoj, aby zmizol PRED zbelením obrazovky) a letí
   jediná vec, ktorá má v hlavičke mapy svoje miesto: fotka majiteľa. Letí ako samostatná
   vrstva .rv-fly, nie ako potomok hlavičky — opacity na rodičovi zhasína celý podstrom,
   takže vnútri blednúceho bloku by zbledla spolu s ním. */
/* ⚠️ TVAR BERIE goldFrameCSS() BEZ PARAMETROV — rám aj polomer sú BLOCK, teda tie isté
   čísla, aké má spodný nav a ľavý panel v /map. Vlastné číslo tu by znamenalo tretiu
   variantu toho istého bloku (CLAUDE.md, lock z 26. 8.). */
.rv-hdr{position:absolute;left:14px;right:14px;top:14px;z-index:12;padding:16px 16px 14px;
        ${goldFrameCSS()}
        transition:padding .62s cubic-bezier(.3,.85,.25,1),
                   left .62s cubic-bezier(.3,.85,.25,1),right .62s cubic-bezier(.3,.85,.25,1),
                   top .62s cubic-bezier(.3,.85,.25,1),
                   border-width .62s,border-radius .62s;}
/* ZATVÁRANIE — blok zhasne. Kratšie než závoj (.3 s proti .62 s): keby hasol s ním, bol by
   pri zbelení obrazovky ešte vidieť, a presne to Matej nahlásil. */
.rv.closing .rv-hdr{opacity:0;transform:scale(.985);
                    transition:opacity .3s ease,transform .36s cubic-bezier(.3,.85,.25,1);}
.rv-hdrow{display:flex;align-items:center;gap:12px;}

.rv-avatars{display:flex;flex:0 0 auto;}
.rv-av{border-radius:50%;border:2px solid #C99A3F;overflow:hidden;flex:0 0 auto;
       background:linear-gradient(135deg,#6b5836,#2a2015);
       display:flex;align-items:center;justify-content:center;object-fit:cover;
       font-family:${FONT_TITLE};font-weight:700;color:#F5C73D;
       width:52px;height:52px;font-size:19px;margin-left:-12px;
       transition:width .62s cubic-bezier(.3,.85,.25,1),height .62s cubic-bezier(.3,.85,.25,1),
                  font-size .62s,margin .62s,border-width .62s;}
.rv-av:first-child{margin-left:0;}
.rv-av--dog{background:linear-gradient(135deg,#3a4a2a,#1a2113);}

/* ══ LETIACA FOTKA ═════════════════════════════════════════════════════════
   Klon avatara majiteľa, ktorý pri zatváraní preletí z revealu na svoje miesto v hlavičke
   mapy. Stojí MIMO hlavičky (súrodenec, nie potomok) — vnútri by zbledol spolu s ňou.
   Východisko a cieľ sa merajú za behu (getBoundingClientRect), nie odhadujú: hlavička
   mapy má na PC a na mobile inú polohu aj inú veľkosť fotky. */
/* ⚠️ ANIMÁCIA, NIE TRANSITION. Prechod potrebuje dva stavy v dvoch snímkoch, teda triedu
   dopísanú až po vykreslení klonu — a tá cesta tu nefungovala: klon sa vykreslil, trieda
   sa dopísala a fotka aj tak ostala stáť (overené v prehliadači). Keyframes sa spustia SAMY
   v okamihu, keď element vznikne, takže druhý snímok netreba. forwards nechá fotku na
   cieli, kým sa celý overlay neodmountuje.
   Bez cieľa (hlavička mapy nie je v DOM-e) sa klon nekreslí vôbec — prílet nikam by vyzeral
   ako chyba, tiché nič nie. */
.rv-fly{position:fixed;z-index:40;border-radius:50%;overflow:hidden;object-fit:cover;
        border:2px solid #C99A3F;background:linear-gradient(135deg,#6b5836,#2a2015);
        display:flex;align-items:center;justify-content:center;pointer-events:none;
        font-family:${FONT_TITLE};font-weight:700;font-size:19px;color:#F5C73D;
        transform-origin:top left;
        animation:rv-fly-home .62s cubic-bezier(.3,.85,.25,1) forwards;}
@keyframes rv-fly-home{
  from{transform:none;border-width:2px;}
  to{transform:translate(var(--fly-x,0px),var(--fly-y,0px)) scale(var(--fly-s,1));
     border-width:1.5px;}}

.rv-who{flex:1 1 auto;min-width:0;}
.rv-rank{font-family:${FONT_TITLE};font-weight:700;font-size:17px;letter-spacing:.1em;
         text-transform:uppercase;display:flex;align-items:center;gap:8px;flex-wrap:wrap;
         color:${PALE.ink};transition:font-size .62s;}
.rv-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;
         font-family:${FONT_TITLE};font-weight:700;font-size:10.5px;letter-spacing:.12em;
         text-transform:uppercase;border:1px solid rgba(250,244,236,0.30);
         background:linear-gradient(135deg,var(--tier-a,#F5C73D),var(--tier-b,#E69E1A));
         color:var(--tier-ink,#241a06);transition:background .5s,color .5s,font-size .62s;}
.rv-pts{font-family:${FONT_UI};font-size:12px;color:${PALE.dim};
        font-variant-numeric:tabular-nums;margin-top:3px;transition:font-size .62s,margin .62s;}

.rv-bar{position:relative;margin-top:12px;height:10px;border-radius:999px;
        background:rgba(110,74,20,0.16);overflow:hidden;transition:height .62s,margin .62s;}
.rv-bar i{display:block;height:100%;width:0;border-radius:999px;
          background:linear-gradient(90deg,var(--tier-b,#E69E1A),var(--tier-a,#F5C73D));
          transition:width 1.1s cubic-bezier(.22,.9,.3,1),background .7s;}
.rv-bar .rv-glow{position:absolute;inset:0;border-radius:999px;pointer-events:none;
                 box-shadow:0 0 12px rgba(245,199,61,0);transition:box-shadow .4s;}
.rv-bar.lit .rv-glow{box-shadow:0 0 14px rgba(245,199,61,0.5);}
/* Veta „ešte X bodov" v malom headeri nie je — tam ju nesie samotná lišta. */
.rv-tonext{margin:8px 0 0;font-family:${FONT_UI};font-size:12px;color:${PALE.dim};
           max-height:24px;opacity:1;overflow:hidden;
           transition:max-height .62s,opacity .3s,margin .62s;}
.rv-tonext b{color:${PALE.deep};font-weight:600;}

/* ══ TELO ══════════════════════════════════════════════════════════════════ */
/* ⚠️ TELO JE KONTAJNER, OBSAH JE BLOK (Matej 28. 8.: „na stred obrazovky pôjde obsah ako
   teraz, ale v bloku"). Kontajner drží polohu a centruje; všetko, čo sa vidí, stojí
   v .rv-blok. Bez tohto delenia by bol „blok" natiahnutý od hlavičky po spodnú hranu,
   teda plocha, nie blok. Odsadenie zhora je výška hlavičky (dblok je o lem vyšší než
   pôvodný pás) — ostáva jedno číslo, lebo hlavička má pevný obsah. */
/* ⚠️ safe center, NIE holé center (2026-08-31). Blok plánu je o tri riadky vyšší než blok
   zápisu a na okne pod ~820 px prerástol kontajner — pri holom centrovaní vo flexe s
   overflow sa pretečená časť odreže ZHORA a skrolom sa k nej nedá dostať (blok začínal
   26 px nad hranou tela, teda bez vlastného zlatého rámu). Kľúčové slovo safe v tom prípade
   prepne na flex-start a zvyšok sa dá doskrolovať. Tá istá pasca a tá istá oprava ako v toku
   pridávania (vstupný popup ADD, 28. 8.). */
.rv-body{position:absolute;left:14px;right:14px;top:212px;bottom:0;display:flex;
         flex-direction:column;justify-content:safe center;overflow-y:auto;
         padding:0 0 calc(14px + env(safe-area-inset-bottom,0px));
         transition:opacity .3s,transform .62s cubic-bezier(.3,.85,.25,1);}
.rv.closing .rv-body{opacity:0;transform:translateY(18px);pointer-events:none;}

/* DBLOK — ten istý odliatok ako hlavička a ako spodný nav v /map. */
.rv-blok{flex:0 0 auto;padding:20px 20px 18px;${goldFrameCSS()}}

.rv-core{display:flex;flex-direction:column;align-items:center;
         justify-content:center;gap:9px;text-align:center;}
.rv-thumb{width:112px;height:112px;border-radius:14px;flex:0 0 auto;object-fit:cover;
          background:linear-gradient(135deg,#2f3a22,#171b10);border:1.5px solid #C99A3F;
          box-shadow:0 6px 22px rgba(70,46,12,0.35);
          display:flex;align-items:center;justify-content:center;font-size:32px;
          opacity:0;transform:scale(.86);}
.rv-name{font-family:${FONT_TITLE};font-weight:700;font-size:21px;line-height:1.2;
         color:${PALE.ink};opacity:0;transform:translateY(6px);}
.rv-meta{font-family:${FONT_UI};font-size:11.5px;color:${PALE.dim};margin-top:-3px;
         opacity:0;transform:translateY(6px);}

/* ══ ŠTATISTIKY VÝLETU — CHIPY, NIE VETA ═══════════════════════════════════
   Matej 28. 8. 2026: „tie počty KM… daj to do pekného chipu a zvýrazni tie štatistiky."
   Predtým to bol jeden sivý riadok „4,4 km · 114 m ↑ · C", v ktorom mala jednotka rovnakú
   váhu ako číslo a pohorie sa čítalo ako preklep. Odteraz nesie každý údaj vlastnú pilulku
   a v nej je ČÍSLO zlaté a veľké, jednotka tichá vedľa neho.
   ⚠️ Trieda .rv-meta sa NEMAŽE — tú istú nesie riadok v scéne level-upu, ktorá je tmavá
   a chipy do nej nepatria. */
.rv-stats{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;
          margin-top:1px;opacity:0;transform:translateY(6px);}
.rv-stat{display:inline-flex;align-items:baseline;gap:4px;padding:5px 11px;border-radius:999px;
         background:linear-gradient(180deg,rgba(255,251,240,0.72),rgba(246,233,205,0.52));
         border:1px solid ${PALE.border};
         box-shadow:0 1px 0 rgba(255,252,244,0.8) inset,0 2px 6px rgba(70,46,12,0.10);}
.rv-stat b{font-family:${FONT_TITLE};font-weight:700;font-size:15px;line-height:1;
           color:${PALE.deep};font-variant-numeric:tabular-nums;}
.rv-stat i{font-family:${FONT_UI};font-style:normal;font-weight:500;font-size:10.5px;
           letter-spacing:.08em;text-transform:uppercase;color:${PALE.dim};}
/* Pohorie/oblasť nemá číslo — je to menovka miesta, tak stojí celá v tichej podobe. */
.rv-stat--place b{font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:${PALE.ink};}

/* ══ PLÁN — TRI RIADKY NAVYŠE (Matej 2026-08-31) ════════════════════════════
   Obrazovka je tá istá ako po zápise; plán do nej pridáva len to, čím sa od zápisu líši:
   ČO sa stalo (eyebrow), KEDY sa vyráža a že body sú odhad. Nič sa nepresúva ani nemení
   veľkosť — inak by to boli dve obrazovky, nie jedna v dvoch stavoch. */
.rv-eyebrow{font-family:${FONT_UI};font-weight:500;font-size:10.5px;letter-spacing:.26em;
            text-transform:uppercase;color:${PALE.dim};margin-bottom:-7px;
            opacity:0;transform:translateY(6px);}
/* KEDY SA VYRÁŽA — jediný riadok, ktorý hovorí o budúcnosti, tak nesie váhu.
   ⚠️ Space Grotesk, nie Cinzel: je to prevádzková informácia, nie meno ani nadpis
   (typografický poriadok v CLAUDE.md). Strop váhy 600 — 700 je vo fonte fake bold. */
.rv-when{font-family:${FONT_UI};font-weight:600;font-size:13.5px;line-height:1.3;
         letter-spacing:.02em;color:${PALE.deep};margin-top:-1px;
         opacity:0;transform:translateY(6px);}
/* Veta pod číslom. Číslo hovorí KOĽKO, veta ZA ČO a že to ešte nie je pripísané —
   preto stojí pod ním a je tichá; keby mala váhu, súperila by s tým, kvôli čomu sa
   obrazovka otvára. */
.rv-plannote{max-width:32ch;margin:3px auto 0;font-family:${FONT_UI};font-weight:400;
             font-size:11.5px;line-height:1.4;color:${PALE.dim};
             opacity:0;transform:translateY(6px);}

/* ── PLÁNOVÝ BLOK JE ZOŠTÍHLENÝ (2026-08-31) ───────────────────────────────
   Tri riadky navyše ho predĺžili o ~90 px a na okne pod ~820 px si vypýtal skrolovanie —
   teda obrazovku, na ktorej nevidno tlačidlá. Miesto sa berie tam, kde pri pláne nesie
   najmenej: MINIATÚRA. Plán ešte nemá fotku z výletu (zakladá sa s prázdnym poľom), takže
   tých 112 px je skoro vždy placeholder s emoji. Zvyšok dorovná tesnejší rozostup a výplň.
   Meranie po zmene: 390x740, 745x722 aj 1280x700 sa zmestia bez skrolu. */
.rv--plan .rv-thumb{width:76px;height:76px;font-size:26px;}
.rv--plan .rv-core{gap:7px;}
.rv--plan .rv-blok{padding:16px 20px 14px;}

.rv-scorewrap{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:2px;}
/* ⚠️ TMAVÉ ZLATO, NIE SVETLÉ. Gradient #F5C73D→#E69E1A je odmeraný na čiernu obrazovku;
   na pieskovcovej doske je to svetlé na svetlom a číslo — teda to jediné, prečo sa reveal
   otvára — zaniká. Je to tá istá farebná rodina, len o dva tóny nižšie. */
.rv-score{font-family:${FONT_TITLE};font-weight:700;font-size:54px;line-height:1;
          background:linear-gradient(135deg,#B3822D,#7A4F14);
          -webkit-background-clip:text;background-clip:text;color:transparent;
          filter:drop-shadow(0 1px 0 rgba(255,250,228,0.55));
          opacity:0;transform:scale(.9);}
/* JEDNOTKA STOJÍ VEDĽA ČÍSLA — „+52 BODOV" je jedna veta, nie dva riadky.
   Veľkosť vybral Matej 24. 8. („bodov veľkým") — Cinzel vo váhe čísla, nie tichý popisok.
   Preto smie zlomiť riadok pri dlhšom preklade (EN POINTS), namiesto pretečenia. */
.rv-unit{align-self:flex-end;margin-bottom:3px;font-family:${FONT_TITLE};font-weight:700;
         font-size:34px;letter-spacing:.02em;text-transform:uppercase;color:${PALE.deep};
         opacity:0;}
@media (max-width:359px){.rv-score{font-size:44px;}.rv-unit{font-size:26px;}}

/* Odkaz na rozpad — tichý, bodkovaným podčiarknutím (Matej 23. 8.).
   ⚠️ CELKOVÉ BODY ANI LEVEL TU NIE SÚ — „to je predsa hore". */
.rv-sumlink{display:inline-flex;align-items:center;gap:6px;margin-top:9px;padding:2px 0;
            background:none;border:0;cursor:pointer;color:${PALE.dim};opacity:0;
            font-family:${FONT_UI};font-weight:400;font-size:11.5px;transition:color .18s;}
.rv-sumlink span{border-bottom:1px dotted currentColor;padding-bottom:2px;}
.rv-sumlink:hover{color:${PALE.deep};}

/* KONCEPT — správa o tom, že výlet ešte nejde von. Prerušovaný rám a papierová šeď
   zámerne nie sú zlaté: zlatá je v tomto rozhraní stav HOTOVO. */
.rv-draft{flex:0 0 auto;margin-top:12px;padding:12px 13px;border-radius:12px;
          background:rgba(0,0,0,0.34);border:1px dashed rgba(232,220,195,0.34);text-align:left;}
.rv-drafth{font-family:${FONT_TITLE};font-weight:700;font-size:11.5px;letter-spacing:.14em;
           text-transform:uppercase;color:#E8DCC3;margin-bottom:6px;}
.rv-draftp{font-family:${FONT_UI};font-size:12px;line-height:1.5;color:rgba(232,220,195,0.78);margin:0;}
.rv-draftmiss{display:block;margin-top:6px;font-family:${FONT_UI};font-weight:600;font-size:12px;color:#E8DCC3;}

.rv-cta{flex:0 0 auto;padding-top:10px;display:flex;flex-direction:column;gap:8px;
        opacity:0;transform:translateY(8px);}
/* ⚠️ HLAVNÉ CTA JE LAPIS (brandový kánon 28. 8. 2026, CLAUDE.md). Geometria ostáva z
   .btn-gold locku — radius 8, nie pilulka; mení sa výplň, nie tvar. Zlaté písmo na
   modrom nie je ozdoba: bez neho je to tmavé tlačidlo bez príslušnosti k brandu.
   Trieda sa volá ďalej rv-btn-gold — je to JEDINÉ hlavné tlačidlo revealu a premenovanie
   by len rozbilo coach bublinu, ktorá ju tiež nesie. */
.rv-btn-gold{width:100%;padding:14px 16px;border-radius:8px;
             background:${LAPIS.grad};border:1px solid ${LAPIS.deep};
             box-shadow:${LAPIS_BTN_SHADOW};
             font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;letter-spacing:.12em;
             text-transform:uppercase;color:${LAPIS.ink};cursor:pointer;}
.rv-btn-gold:hover{background:${LAPIS.gradHover};}
.rv-btn-ghost{width:100%;padding:11px 16px;border-radius:8px;background:none;
              border:1px solid ${PALE.border};font-family:${FONT_UI};font-weight:500;
              font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;
              color:${PALE.dim};cursor:pointer;}
.rv-btn-ghost:hover{color:${PALE.ink};border-color:${PALE.deep};}

/* ══ SCÉNA LEVELU ══════════════════════════════════════════════════════════
   Matej 23. 8.: „stmavne celá obrazovka a zobrazí sa veľká fotka v strede majiteľ a vedľa
   neho pes/psy … pod tým PUTNIK a pod tým pils - kde sa zmení číslo … po 2 sekundách sa
   scéna rozplynie a zostane obrazovka s bodmi". Celé je to ~5,6 s — ZÁMERNE pomalé,
   prvá verzia mala 1,2 s a nedalo sa to prečítať. */
.rv-scene{position:absolute;inset:0;z-index:24;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:22px;
          background:radial-gradient(70% 50% at 50% 42%,#140e04,#040404);opacity:0;
          animation:rvSceneIn .75s ease forwards;}
.rv-scene.out{animation:rvSceneOut .8s ease forwards;}
@keyframes rvSceneIn{from{opacity:0;}to{opacity:1;}}
@keyframes rvSceneOut{from{opacity:1;}to{opacity:0;}}

/* ROZLOŽENIE SVORKY — nákres Mateja 23. 8.
   MAJITEĽ JE PRESNE V STREDE a nehýbe sa; psy sa vešajú okolo neho. Preto ABSOLÚTNE
   pozicovanie, nie flex rad — v rade by každý ďalší pes posunul majiteľa doľava a „stred"
   by cestoval podľa počtu psov.
     1 pes  → vpravo dole, prekrýva okraj majiteľa
     2+ psy → jeden rad na spoločnej základni, vycentrovaný pod majiteľom */
.rv-photos{position:relative;width:100%;max-width:400px;height:230px;
           transform:scale(.84);opacity:0;
           animation:rvPhotoZoom 1.5s cubic-bezier(.2,.8,.3,1) .2s forwards;}
@keyframes rvPhotoZoom{from{transform:scale(.84);opacity:0;}to{transform:scale(1);opacity:1;}}
.rv-slot{position:absolute;left:50%;top:50%;
         transform:translate(calc(-50% + var(--x,0px)),calc(-50% + var(--y,0px)));}
.rv-ph{position:relative;z-index:4;border-radius:50%;overflow:hidden;object-fit:cover;
       border:3px solid var(--tier-a,#C99A3F);
       display:flex;align-items:center;justify-content:center;
       background:linear-gradient(135deg,#3a4a2a,#1a2113);
       box-shadow:0 10px 34px rgba(0,0,0,0.7);}
.rv-ph--owner{width:132px;height:132px;font-size:46px;
              background:linear-gradient(135deg,#6b5836,#2a2015);
              font-family:${FONT_TITLE};font-weight:700;color:var(--tier-a,#F5C73D);}
.rv-slot--dog{z-index:5;}
.rv-slot--dog .rv-ph{border-width:2.5px;opacity:0;transform:scale(.5);
                     animation:rvDogPop .62s cubic-bezier(.25,1.4,.4,1) forwards;}
@keyframes rvDogPop{to{opacity:1;transform:scale(1);}}

/* ISKRENIE PO OBVODE — Matej 23. 8.: „po obvode prejde iskrenie".
   Rotujúci kužeľový lesk pod maskou; vidno z neho len prstenec. */
.rv-rim{position:absolute;inset:-6px;border-radius:50%;overflow:hidden;opacity:0;z-index:3;
        pointer-events:none;}
.rv-rim::before{content:'';position:absolute;inset:-60%;
  background:conic-gradient(from 0deg,transparent 0 62%,rgba(255,244,214,0.25) 72%,
             rgba(255,255,255,0.98) 80%,rgba(255,244,214,0.25) 88%,transparent 96%);}
.rv-rim::after{content:'';position:absolute;inset:6px;border-radius:50%;background:#060504;}
@keyframes rvRimSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
.rv-rim.spark{opacity:1;}
.rv-rim.spark::before{animation:rvRimSpin 1.15s linear 2;}

.rv-scene-rank{font-family:${FONT_TITLE};font-weight:700;font-size:30px;letter-spacing:.28em;
               text-transform:uppercase;color:#F5F0E4;opacity:0;
               text-shadow:0 0 26px rgba(245,199,61,0.35);
               animation:rvRise .8s cubic-bezier(.2,.9,.3,1) 1.15s forwards;}
@keyframes rvRise{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}

.rv-pillwrap{position:relative;opacity:0;animation:rvRise .8s cubic-bezier(.2,.9,.3,1) 1.5s forwards;}
.rv-pill{position:relative;display:inline-flex;align-items:center;gap:8px;
         padding:12px 28px;border-radius:999px;overflow:hidden;
         background:linear-gradient(135deg,var(--tier-a,#F5C73D),var(--tier-b,#E69E1A));
         border:1.5px solid rgba(250,244,236,0.30);color:var(--tier-ink,#241a06);
         font-family:${FONT_TITLE};font-weight:700;font-size:19px;letter-spacing:.16em;
         text-transform:uppercase;transition:background .7s,color .7s;}
.rv-pill-txt{position:relative;z-index:3;line-height:1;}
.rv-pillrim{position:absolute;inset:0;border-radius:999px;overflow:hidden;opacity:0;z-index:1;}
.rv-pillrim::before{content:'';position:absolute;left:50%;top:50%;width:340px;height:340px;
  margin:-170px 0 0 -170px;
  background:conic-gradient(from 0deg,transparent 0 60%,rgba(255,244,214,0.3) 70%,
             rgba(255,255,255,1) 79%,rgba(255,244,214,0.3) 88%,transparent 96%);}
.rv-pillrim::after{content:'';position:absolute;inset:2px;border-radius:999px;
  background:linear-gradient(135deg,var(--tier-a,#F5C73D),var(--tier-b,#E69E1A));}
.rv-pillrim.spark{opacity:1;}
.rv-pillrim.spark::before{animation:rvRimSpin 1.15s linear 2;}
@keyframes rvPillHit{0%{transform:scale(1);}
  26%{transform:scale(1.2);box-shadow:0 0 52px rgba(245,199,61,0.8);}
  100%{transform:scale(1);box-shadow:0 0 0 rgba(245,199,61,0);}}
.rv-pill.hit{animation:rvPillHit 1s cubic-bezier(.25,1.2,.4,1) forwards;}

/* PREMENA ČÍSLA — staré odletí hore, nové priletí zdola. Je to ten istý ukazovateľ,
   ktorý sa posunul, nie iný nápis. */
.rv-num{position:relative;display:inline-block;min-width:1ch;line-height:1;}
.rv-num span{display:inline-block;}
.rv-num .out{position:absolute;left:0;top:0;}
@keyframes rvNumOut{to{opacity:0;transform:translateY(-16px) scale(.7);}}
@keyframes rvNumIn{from{opacity:0;transform:translateY(18px) scale(.6);}
  60%{opacity:1;transform:translateY(-3px) scale(1.22);}
  to{opacity:1;transform:none;}}
.rv-num.turn .out{animation:rvNumOut .42s cubic-bezier(.4,0,.9,.4) forwards;}
.rv-num.turn .now{animation:rvNumIn .62s cubic-bezier(.25,1.3,.4,1) forwards;}

/* ══ PRIESTOROVÝ EFEKT ═════════════════════════════════════════════════════
   Matej 23. 8.: „musí tam byť aj komfety alebo iný priestorový efekt" + 24. 8. výber OBOJE.
   Priestor robí PERSPEKTÍVA — častice majú hĺbku, vzdialené sú menšie a rozostrené,
   blízke preletia pred tvárou. Nie plochý dážď. */
.rv-flash{position:absolute;inset:0;z-index:26;pointer-events:none;opacity:0;
  background:radial-gradient(60% 42% at 50% var(--fx-y,44%),rgba(255,240,200,0.9),rgba(245,199,61,0) 70%);}
@keyframes rvFlash{0%{opacity:0;}14%{opacity:1;}100%{opacity:0;}}
.rv-flash.go{animation:rvFlash .9s ease-out forwards;}

.rv-ring{position:absolute;left:50%;top:var(--fx-y,44%);width:120px;height:120px;
  margin:-60px 0 0 -60px;border-radius:50%;border:3px solid var(--tier-a,#F5C73D);
  opacity:0;z-index:26;pointer-events:none;filter:blur(2.5px);
  box-shadow:0 0 24px var(--tier-a,#F5C73D);}
@keyframes rvRing{0%{opacity:0;transform:scale(.25);}16%{opacity:.75;}
  100%{opacity:0;transform:scale(4.6);border-width:1px;}}
.rv-ring.go{animation:rvRing 1.1s cubic-bezier(.2,.7,.3,1) forwards;}
.rv-ring.two{animation-delay:.16s;}

.rv-fx{position:absolute;inset:0;z-index:27;pointer-events:none;overflow:hidden;
       perspective:620px;perspective-origin:50% var(--fx-y,44%);}
.rv-cf{position:absolute;top:-6%;left:50%;width:9px;height:14px;border-radius:2px;opacity:0;
       transform-style:preserve-3d;will-change:transform,opacity;}
@keyframes rvFall{
  0%{opacity:0;transform:translate3d(-50%,0,var(--z)) rotate3d(1,1,.4,0deg) scale(var(--s));}
  9%{opacity:1;}
  88%{opacity:1;}
  100%{opacity:0;transform:translate3d(calc(-50% + var(--dx)),118vh,calc(var(--z) + var(--dz)))
                          rotate3d(1,1,.4,var(--rot)) scale(var(--s));}}
.rv-sp{position:absolute;left:50%;top:var(--fx-y,44%);width:6px;height:6px;border-radius:50%;
       opacity:0;will-change:transform,opacity;}
@keyframes rvSpark{
  0%{opacity:0;transform:translate3d(-50%,-50%,0) scale(.2);}
  12%{opacity:1;}
  100%{opacity:0;transform:translate3d(calc(-50% + var(--dx)),calc(-50% + var(--dy)),var(--dz)) scale(var(--s));}}

/* ══ ROZPAD (ⓘ) A COACH ════════════════════════════════════════════════════ */
/* ⚠️ ROZPAD JE TEN ISTÝ DBLOK (Matej 28. 8.: „po kliknutí na detail bodov to sprav v tom
   istom dbloku, nie roztiahnuté ako vidíš, a v bledých farbách to chceme"). Do teraz to
   bola tmavá karta cez celú šírku okna — na PC pás od hrany po hranu, ktorý nemal nič
   spoločné s blokom, z ktorého sa otvoril. Šírka je preto zhodná s .rv-shell (430) a
   povrch berie ten istý goldFrameCSS().
   ⚠️ ZÁVOJ JE LEN ĽAHKÝ PRÍTMOK (Matej 2026-08-28: „tú modrú v pozadí daj miernejšiu —
   myslím ten overlay za blokom, kde je výpis bodov"). Pod ním UŽ LEŽÍ hlavný závoj revealu
   (0.90), takže sa krytia sčítavajú: 0.72 z toho spravilo takmer nepriehľadnú plochu, na
   ktorej sa hlavička nad rozpadom stratila. Jeho úloha nie je zatemniť mapu — to je už
   urobené — ale povedať, že blok pod ním nie je aktívny. */
.rv-sheet{position:absolute;inset:0;z-index:30;background:rgba(6,16,48,0.38);
          backdrop-filter:blur(4px);padding:0 14px;overflow-y:auto;
          display:flex;flex-direction:column;justify-content:center;}
.rv-card{width:100%;max-width:430px;margin:0 auto;padding:18px 18px 16px;
         max-height:86vh;overflow-y:auto;${goldFrameCSS()}}
/* ⚠️ HLAVIČKA ROZPADU JE BEZ KRÍŽIKA (CLAUDE.md, lock 28. 8. 2026: „nedávajme tie krížiky
   na bloky"). Von sa ide klikom mimo alebo Esc. Tým sa uvoľnil pravý roh, takže nadpis
   stojí na stred — a pod ním je zlatá vyblednutá čiara, nie sivý vlas.
   OŽIVENIE (Matej 28. 8.: „je to najnudnejší screen… zvýrazni to, oživ to trochu"): nadpis
   dostal eyebrow nad seba a riadky nabiehajú po jednom zdola, v tom istom poradí, v akom
   sa body pripisovali na predchádzajúcej obrazovke. */
.rv-cardhead{display:flex;flex-direction:column;align-items:center;gap:3px;margin-bottom:13px;
             padding-bottom:11px;position:relative;}
.rv-cardhead::after{content:'';position:absolute;left:8%;right:8%;bottom:0;height:2px;
                    border-radius:2px;
                    background:linear-gradient(90deg,transparent,${PALE.edge},transparent);}
.rv-cardeyebrow{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.26em;
                text-transform:uppercase;color:${PALE.edge};}
.rv-cardhead h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:15px;
                letter-spacing:.14em;text-transform:uppercase;color:${PALE.ink};text-align:center;}

/* Deliaca čiara vnútri bledého bloku je zlatá a 2px (T.rule), nie šedý vlas — CLAUDE.md. */
.rv-total{display:flex;align-items:center;justify-content:space-between;gap:10px;
          margin-top:13px;padding:11px 12px 9px;border-radius:12px;
          border-top:2px solid rgba(201,154,63,0.55);
          background:linear-gradient(180deg,rgba(201,154,63,0.16),rgba(201,154,63,0.04));}
.rv-total span{font-family:${FONT_TITLE};font-weight:700;font-size:12px;
               letter-spacing:.14em;text-transform:uppercase;color:${PALE.ink};}
/* Súčet nesie ten istý tmavozlatý gradient ako číslo na obrazovke pod ním — je to to isté
   číslo, len rozobraté; dve rôzne farby by z neho spravili dva rôzne údaje. */
.rv-total b{font-family:${FONT_TITLE};font-weight:700;font-size:32px;line-height:1;
            background:linear-gradient(135deg,#B3822D,#7A4F14);
            -webkit-background-clip:text;background-clip:text;color:transparent;
            filter:drop-shadow(0 1px 0 rgba(255,250,228,0.55));}


/* ⚠️ .rv-coach / .rv-bubble ZANIKLI 28. 8. 2026 — bublina revealu sa zdvojovala so
   sprievodcom na mape (dôvod v TripReveal.tsx pri handleClose). Ukazovanie po zápise
   žije na jednom mieste: MapCoach.tsx. */

.rv-in{opacity:1 !important;transform:none !important;
       transition:opacity .4s ease,transform .42s cubic-bezier(.22,.9,.3,1);}
.rv-pop{opacity:1 !important;transform:scale(1) !important;
        transition:opacity .3s ease,transform .5s cubic-bezier(.3,1.5,.5,1);}

/* Prístupnosť: kto má vypnutý pohyb, dostane obsah bez animácie — nie prázdnu obrazovku.
   Preto sa vypína aj animation, nielen transition (v nákrese sa vypínal len transition,
   takže scéna bežala ďalej naplno). */
@media (prefers-reduced-motion:reduce){
  .rv *,.rv *::before,.rv *::after{animation:none !important;transition:none !important;}
  .rv-thumb,.rv-name,.rv-meta,.rv-score,.rv-unit,.rv-sumlink,.rv-cta,
  .rv-eyebrow,.rv-when,.rv-plannote,
  .rv-photos,.rv-scene-rank,.rv-pillwrap,.rv-slot--dog .rv-ph{opacity:1 !important;transform:none !important;}
  .rv-fx,.rv-ring,.rv-flash{display:none !important;}
}
`;
