// ─────────────────────────────────────────────────────────────────────────────
// CSS REVEALU — oddelené od komponentu, aby Vite Fast Refresh neprepadal na full reload
// (rovnaký dôvod ako `packTheme.ts`: konštanta vedľa komponentu láme HMR).
//
// Zdroj pravdy vzhľadu = nákres `plany/reveal-nakres.html`, odsúhlasený Matejom 23.–24. 8. 2026
// v siedmich kolách. Keď sa mení jedno, musí sa zmeniť druhé.
//
// ⚠️ Toto je JS template literal — SPÄTNÝ APOSTROF v CSS komentári zhodí build a `tsc` to
//    nechytí. Po každom zásahu spusti `npm run build`, nielen typecheck.
// ─────────────────────────────────────────────────────────────────────────────

import { FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';

export const REVEAL_CSS = `
.rv{position:fixed;inset:0;z-index:2500;overflow:hidden;
    font-family:${FONT_UI};color:#F5F0E4;-webkit-font-smoothing:antialiased;}

/* Zatemnenie mapy je SÚČASŤ POPUPU — mizne spolu s ním, nie skôr. */
/* 0,74 stačilo v nákrese, kde bola pod tým tmavá atrapa mapy. Na skutočnej OSM mape
   (svetlé dlaždice, mená obcí, cesty) presvital podklad do textu — číslo bodov aj riadok
   s km sa čítali ťažko. Preto hustejšie a viac rozostrené. */
.rv-scrim{position:absolute;inset:0;background:rgba(5,5,5,0.88);backdrop-filter:blur(6px);
          transition:opacity .62s cubic-bezier(.3,.85,.25,1);}
.rv.closing .rv-scrim{opacity:0;}

.rv-shell{position:absolute;inset:0;max-width:430px;margin:0 auto;}

/* ══ HEADER — JEDEN PRVOK, DVA STAVY ═══════════════════════════════════════
   Matej 23. 8.: „na obrazovke bude klasický header ako je normálne ale ako keby zoom out
   + progres ukazovatel po zrušení okna sa ako keby vráti do headra". Pri zatváraní sa
   scvrkne na rozmery hlavičky mapy a až potom celý overlay zhasne — preto NIE dva
   komponenty, ale jeden s triedou .closing. */
.rv-hdr{position:absolute;left:0;right:0;top:0;z-index:12;padding:16px 18px 14px;
        background:linear-gradient(180deg,rgba(10,8,4,0.92),rgba(10,8,4,0));
        transition:padding .62s cubic-bezier(.3,.85,.25,1),background .62s;}
.rv.closing .rv-hdr{padding:9px 14px 8px;background:rgba(10,8,4,0.90);
                    border-bottom:1px solid rgba(245,240,228,0.14);}
.rv-hdrow{display:flex;align-items:center;gap:12px;transition:gap .62s cubic-bezier(.3,.85,.25,1);}
.rv.closing .rv-hdrow{gap:9px;}

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
.rv.closing .rv-av{width:28px;height:28px;font-size:11px;border-width:1.5px;margin-left:-8px;}

.rv-who{flex:1 1 auto;min-width:0;}
.rv-rank{font-family:${FONT_TITLE};font-weight:700;font-size:17px;letter-spacing:.1em;
         text-transform:uppercase;display:flex;align-items:center;gap:8px;flex-wrap:wrap;
         transition:font-size .62s;}
.rv.closing .rv-rank{font-size:11.5px;}
.rv-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;
         font-family:${FONT_TITLE};font-weight:700;font-size:10.5px;letter-spacing:.12em;
         text-transform:uppercase;border:1px solid rgba(250,244,236,0.30);
         background:linear-gradient(135deg,var(--tier-a,#F5C73D),var(--tier-b,#E69E1A));
         color:var(--tier-ink,#241a06);transition:background .5s,color .5s,font-size .62s;}
.rv.closing .rv-chip{font-size:8.5px;padding:2px 7px;}
.rv-pts{font-family:${FONT_UI};font-size:12px;color:rgba(245,240,228,0.55);
        font-variant-numeric:tabular-nums;margin-top:3px;transition:font-size .62s,margin .62s;}
.rv.closing .rv-pts{font-size:9.5px;margin-top:1px;}

.rv-bar{position:relative;margin-top:12px;height:10px;border-radius:999px;
        background:rgba(245,240,228,0.10);overflow:hidden;transition:height .62s,margin .62s;}
.rv.closing .rv-bar{height:4px;margin-top:7px;}
.rv-bar i{display:block;height:100%;width:0;border-radius:999px;
          background:linear-gradient(90deg,var(--tier-b,#E69E1A),var(--tier-a,#F5C73D));
          transition:width 1.1s cubic-bezier(.22,.9,.3,1),background .7s;}
.rv-bar .rv-glow{position:absolute;inset:0;border-radius:999px;pointer-events:none;
                 box-shadow:0 0 12px rgba(245,199,61,0);transition:box-shadow .4s;}
.rv-bar.lit .rv-glow{box-shadow:0 0 14px rgba(245,199,61,0.5);}
/* Veta „ešte X bodov" v malom headeri nie je — tam ju nesie samotná lišta. */
.rv-tonext{margin:8px 0 0;font-family:${FONT_UI};font-size:12px;color:rgba(245,240,228,0.55);
           max-height:24px;opacity:1;overflow:hidden;
           transition:max-height .62s,opacity .3s,margin .62s;}
.rv.closing .rv-tonext{max-height:0;opacity:0;margin-top:0;}
.rv-tonext b{color:#C99A3F;font-weight:600;}

/* ══ TELO ══════════════════════════════════════════════════════════════════ */
.rv-body{position:absolute;left:0;right:0;top:200px;bottom:0;display:flex;flex-direction:column;
         padding:0 18px calc(14px + env(safe-area-inset-bottom,0px));
         transition:opacity .3s,transform .62s cubic-bezier(.3,.85,.25,1);}
.rv.closing .rv-body{opacity:0;transform:translateY(18px);pointer-events:none;}

.rv-core{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;
         justify-content:center;gap:9px;text-align:center;}
.rv-thumb{width:112px;height:112px;border-radius:14px;flex:0 0 auto;object-fit:cover;
          background:linear-gradient(135deg,#2f3a22,#171b10);border:1.5px solid #C99A3F;
          box-shadow:0 6px 22px rgba(0,0,0,0.5);
          display:flex;align-items:center;justify-content:center;font-size:32px;
          opacity:0;transform:scale(.86);}
.rv-name{font-family:${FONT_TITLE};font-weight:700;font-size:21px;line-height:1.2;
         opacity:0;transform:translateY(6px);}
.rv-meta{font-family:${FONT_UI};font-size:11.5px;color:rgba(245,240,228,0.55);margin-top:-3px;
         opacity:0;transform:translateY(6px);}

.rv-scorewrap{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:2px;}
.rv-score{font-family:${FONT_TITLE};font-weight:700;font-size:54px;line-height:1;
          background:linear-gradient(135deg,#F5C73D,#E69E1A);
          -webkit-background-clip:text;background-clip:text;color:transparent;
          filter:drop-shadow(0 2px 14px rgba(245,199,61,0.26));
          opacity:0;transform:scale(.9);}
/* JEDNOTKA STOJÍ VEDĽA ČÍSLA — „+52 BODOV" je jedna veta, nie dva riadky.
   Veľkosť vybral Matej 24. 8. („bodov veľkým") — Cinzel vo váhe čísla, nie tichý popisok.
   Preto smie zlomiť riadok pri dlhšom preklade (EN POINTS), namiesto pretečenia. */
.rv-unit{align-self:flex-end;margin-bottom:3px;font-family:${FONT_TITLE};font-weight:700;
         font-size:34px;letter-spacing:.02em;text-transform:uppercase;color:#E69E1A;
         opacity:0;}
@media (max-width:359px){.rv-score{font-size:44px;}.rv-unit{font-size:26px;}}

/* Odkaz na rozpad — tichý, bodkovaným podčiarknutím (Matej 23. 8.).
   ⚠️ CELKOVÉ BODY ANI LEVEL TU NIE SÚ — „to je predsa hore". */
.rv-sumlink{display:inline-flex;align-items:center;gap:6px;margin-top:9px;padding:2px 0;
            background:none;border:0;cursor:pointer;color:rgba(245,240,228,0.55);opacity:0;
            font-family:${FONT_UI};font-weight:400;font-size:11.5px;transition:color .18s;}
.rv-sumlink span{border-bottom:1px dotted currentColor;padding-bottom:2px;}
.rv-sumlink:hover{color:#F5C73D;}

.rv-cta{flex:0 0 auto;padding-top:10px;display:flex;flex-direction:column;gap:8px;
        opacity:0;transform:translateY(8px);}
.rv-btn-gold{width:100%;padding:14px 16px;border-radius:8px;
             background:linear-gradient(135deg,#F5C73D,#E69E1A);
             border:1px solid rgba(250,244,236,0.30);
             box-shadow:0 0 40px rgba(230,158,26,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
             font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;letter-spacing:.12em;
             text-transform:uppercase;color:#2a1608;cursor:pointer;}
.rv-btn-ghost{width:100%;padding:11px 16px;border-radius:8px;background:none;
              border:1px solid rgba(245,240,228,0.14);font-family:${FONT_UI};font-weight:500;
              font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;
              color:rgba(245,240,228,0.55);cursor:pointer;}

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
.rv-sheet{position:absolute;inset:0;z-index:30;background:rgba(5,5,5,0.90);
          backdrop-filter:blur(4px);padding:0 18px;overflow-y:auto;
          display:flex;flex-direction:column;justify-content:center;}
.rv-card{background:linear-gradient(160deg,rgba(28,20,10,0.98),rgba(14,10,5,0.98));
         border:1.5px solid #C99A3F;border-radius:16px;padding:18px 16px 16px;
         box-shadow:0 16px 50px rgba(0,0,0,0.7);max-height:86vh;overflow-y:auto;}
.rv-cardhead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;}
.rv-cardhead h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:14px;
                letter-spacing:.14em;text-transform:uppercase;color:#C99A3F;}
.rv-x{width:28px;height:28px;border-radius:50%;flex:0 0 auto;background:rgba(245,240,228,0.07);
      border:1px solid rgba(245,240,228,0.14);color:rgba(245,240,228,0.55);cursor:pointer;
      display:flex;align-items:center;justify-content:center;}
.rv-total{display:flex;align-items:center;justify-content:space-between;gap:10px;
          margin-top:12px;padding-top:12px;border-top:1px solid rgba(201,154,63,0.4);}
.rv-total span{font-family:${FONT_TITLE};font-weight:700;font-size:12px;
               letter-spacing:.14em;text-transform:uppercase;}
.rv-total b{font-family:${FONT_TITLE};font-weight:700;font-size:26px;color:#F5C73D;}

.rv-coach{position:absolute;inset:0;z-index:25;background:rgba(5,5,5,0.84);}
.rv-bubble{position:absolute;left:16px;right:16px;bottom:94px;padding:15px 16px;border-radius:12px;
           background:rgba(18,13,7,0.98);border:1.5px solid #C99A3F;
           box-shadow:0 10px 34px rgba(0,0,0,0.6);}
.rv-bubble h4{margin:0 0 6px;font-family:${FONT_TITLE};font-weight:700;font-size:13px;
              letter-spacing:.1em;text-transform:uppercase;color:#C99A3F;}
.rv-bubble p{margin:0 0 12px;font-size:12.5px;line-height:1.5;}
.rv-bubble::after{content:'';position:absolute;left:30%;bottom:-8px;width:14px;height:14px;
  margin-left:-7px;background:rgba(18,13,7,0.98);transform:rotate(45deg);
  border-right:1.5px solid #C99A3F;border-bottom:1.5px solid #C99A3F;}

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
  .rv-photos,.rv-scene-rank,.rv-pillwrap,.rv-slot--dog .rv-ph{opacity:1 !important;transform:none !important;}
  .rv-fx,.rv-ring,.rv-flash{display:none !important;}
}
`;
