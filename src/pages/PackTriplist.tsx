// /pack/map/triplist — DVOJPOVRCH: TRIPLIST + TRIPSTATS na jednej route (Matej 2026-07-23,
// konsolidácia headera 4→2). ?tab=stats fokusuje TRIPSTATS, inak TRIPLIST; dve karty vedľa seba
// prepínajú view. Vstup z PackMap headera: ✓/km pilulka → ?tab=stats, 🐾 pilulka → list.
//   TRIPLIST = MY TRIPS (seeded z plans; placeholdery keď prázdne) + OPEN TRIPS (mock). Wishlist
//     splynul sem (★ = „mám to v zozname"), samostatná wishlist sekcia zrušená.
//   TRIPSTATS = <TripStatsPanel> z packCommunityUI (svet + home 🇸🇰 + prejdené) — bývalý „Trippin'"
//     dashboard modal, ktorý je TÝMTO zrušený (MySlovakiaDashboard už nemá vstup).
// Slice B (accept/decline, open/close toggle, leave/handoff, request→DM), D (post-trip loop) NIE sú
// tu — joiners/requests stay [] (see triplist.ts).
//
// DESIGN (2026-07-23, LOCKED): obsah v LIQUID GLASS paneli (.pk-glass z packTheme GLASS_CSS) nad
// heroglyf pozadím — NEmixovať s plnou čiernou. Rovnaký primitív ide neskôr aj na článok + walked.
// Bloky = štvorcové karty v 3-stĺpcovom gride (MY TRIPS + OPEN TRIPS zdieľajú .tl-grid/.tl-block).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { PackBottomNav } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackStoreEpoch } from '@/hooks/usePackStoreEpoch';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, GLASS_CSS, PAPER_PAGE_CSS, FONT_TITLE, FONT_UI, PACK_COL, PACK_COL_PAD } from '@/components/pack/packTheme';
// Bledý chrome: inkousty a plochy (PALE), lapisové CTA a priesvitný tint výberu.
// Jeden zdroj pre celý /pack — tie isté hodnoty drží bledý skin mapy.
import { PALE, LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK, goldFrameCSS } from '@/components/pack/navGoldSkin';
import { readLocalTrails, readWalkedIds, ensureWalkedSeeded, FOUNDER_WALKED_JOURNEY_IDS, ICON, GOLD_ICON_FILTER, tripPath, tripPathById, visibleLocalTrails, tripDraftMissing, memberTrailIds } from '@/components/pack/tripShared';
import { closeMyTripEvents, readLocalTrailMeta, readJson, writeJson, PACK_KEYS } from '@/lib/packStore';
import { placeholderFor } from '@/lib/tripPlaceholder';
import { readPlans } from '@/components/pack/packCommunity';
import { COMMUNITY_CSS, TripStatsPanel } from '@/components/pack/packCommunityUI';
import { flagUrl, trailCountry } from '@/lib/countryGeo';
import { useMyTripParties, useTripParties, partyKey, type TripParty, type PartyMember } from '@/components/pack/triplist/useTripParty';
import { useOpenTrips } from '@/components/pack/triplist/useOpenTrips';
import {
  requestToJoin, decideRequest, useMyRequests, useIncomingRequests, pairPending, requestKey,
  type TripRequestStatus,
} from '@/components/pack/triplist/tripRequests';
import { PartyMemberCard, PARTY_CARD_CSS } from '@/components/pack/triplist/PartyMemberCard';
import {
  readTriplist, upsertMyTrip, seedTriplistFromPlans, seedTriplistFromWalked,
  trailWCE, WCE_LABEL, type WCE,
  type TriplistTrip, type TripStatus,
} from '@/components/pack/triplist/triplist';

const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const T = PACK_THEME;
// skratka do CSS literálu — rgba čísla bledého chrome sa nemajú opisovať po súboroch
const P = PALE;
const DAY_MS = 86400000;

const CSS = `
/* ── DRAK → BRIGHT (2026-09-01) ────────────────────────────────────────────
   TRIPLIST aj TRIPSTATS idú do bledého šatu. Podklad stránky NIE JE napísaný
   tu — je to .pk-paper z packTheme.ts (variant B, Matej 1. 9.: papyrus aj na
   pozadí, tapeta preladená do zlata na piesku). Kto sem píše novú farbu plochy,
   píše ju na zlé miesto.
   ⚠️ .tl-root už NEMÁ vlastné pozadie ani min-height — oboje nesie .pk-paper.
      Dve nepriehľadné plochy nad sebou by tapetu prekryli. */
.tl-root{color:${P.ink};font-family:${FONT_UI};position:relative;padding-bottom:110px;}
/* Šírka aj vodorovný padding sú TIE ISTÉ ako v PackLayout (PACK_COL) — táto stránka
   PackLayout nemountuje, tak si ich musí vziať z konštanty. Do 13. 8. tu bolo 860px
   a preklik z profilu (1024px) stránku viditeľne zúžil. */
.tl-body{max-width:${PACK_COL.wide}px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 26px) ${PACK_COL_PAD.desktop}px 0;position:relative;z-index:2;}
@media (max-width:640px){ .tl-body{padding-left:${PACK_COL_PAD.mobile}px;padding-right:${PACK_COL_PAD.mobile}px;} }
/* back = holá šípka v STREDE, NAD blokmi (flow, nie absolute — neprekrýva karty) */
.tl-backrow{display:flex;justify-content:center;margin-bottom:16px;}
.tl-back{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:${P.soft};border:1px solid ${P.border};color:${P.ink};font-size:19px;line-height:1;cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.tl-back:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
.tl-title{font-family:${FONT_TITLE};font-weight:700;font-size:26px;letter-spacing:.03em;color:${P.deep};text-align:center;}
.tl-sub{font-size:12.5px;color:${P.dim};text-align:center;margin-top:6px;}

/* dvojkartový prepínač TRIPLIST | TRIPSTATS — aktívna karta = LAPIS, druhá „vedľa" = klik na prepnutie */
/* V3 (#46): len IKONA a NÁZOV, žiadny podnadpis, vycentrované a väčšie. Podnadpisy („12 walked ·
   148 km" / „Next trip · o 3 dni") hovorili to isté, čo obsah hneď pod nimi, a rozbíjali karte os
   — teraz je karta jeden symbol a jedno slovo.
   ⚠️ AKTÍVNA JE LAPISOVÁ, NIE ZLATÁ (2026-09-01). Nie je to nový nápad: presne tento prepínač
   pohľadov už na bledom povrchu existuje — „TRIPS | EVENTS | SERVICES" v ľavom paneli mapy
   (.trp-catpill.on v PackMap.tsx). Zlatá na papyruse nesie KONŠTRUKCIU (rám, doska, aktívna
   pilulka navu); toto je moja voľba, čo chcem vidieť, teda lapis. Neaktívna karta je papyrusový
   podblok — dve súperiace farby by z prepínača spravili dve rovnocenné tlačidlá. */
.tl-tabs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;}
/* ⚠️ IKONKA JE V TEJ ISTEJ FARBE AKO NADPIS A STOJÍ VEDĽA NEHO (Matej 1. 9. 2026:
   „prečo je ikonka inej farby a v oramovani ako samotný nadpis? skús to dať do jednej farby
   bez oramovania a možno aj vedľa seba").
   Predtým mala vlastnú dlaždicu (zlatý rám + tlmená výplň) a vlastný filter — teda v jednej
   karte stáli dva prvky v dvoch farbách a dvoch tvaroch, hoci hovoria to isté slovo.
   Riešenie je MASKA, nie filter: background:currentColor cez -webkit-mask znamená, že
   ikonka DEDÍ farbu textu — na papyruse inkoust, na lapise zlato, a pri ďalšej zmene farby
   nadpisu ju netreba dolaďovať. Filter by sa musel prepočítavať ku každému odtieňu zvlášť. */
.tl-tab{display:flex;align-items:center;justify-content:center;padding:20px 14px;border-radius:16px;border:1.5px solid ${T.cardEdge};background:${T.panelGrad};box-shadow:0 2px 8px rgba(122,90,42,0.16),inset 0 1px 0 rgba(255,255,255,0.45);cursor:pointer;text-align:center;transition:border-color .15s,transform .15s,background .15s,box-shadow .15s;}
.tl-tab:hover{transform:translateY(-1px);box-shadow:0 0 0 3px rgba(201,154,63,0.28),0 2px 8px rgba(122,90,42,0.16);}
.tl-tab-label{font-family:${FONT_TITLE};font-weight:700;font-size:15px;letter-spacing:.09em;text-transform:uppercase;color:${P.ink};display:flex;flex-direction:row;align-items:center;gap:11px;min-width:0;}
.tl-tab-ic{width:26px;height:26px;flex-shrink:0;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
.tl-tab.on{background:${LAPIS.grad};border-color:${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};}
.tl-tab.on:hover{background:${LAPIS.gradHover};}
.tl-tab.on .tl-tab-label{color:${LAPIS.ink};}
@media (max-width:400px){ .tl-tab{padding:16px 10px;} .tl-tab-label{font-size:12.5px;letter-spacing:.05em;gap:8px;} .tl-tab-ic{width:22px;height:22px;} }

/* OBSAHOVÝ PANEL = ZLATO-RÁMOVANÝ BLOK (Matej 1. 9. 2026: „celý tento blok by mal byť nejakou
   zlatou… možno cely blok kde je tento a konci to odznakmi by mal byť blok").
   Recept NEVYMÝŠĽAM — je locknutý: goldFrameCSS() z navGoldSkin.ts, volaný BEZ parametrov,
   takže tvar berie z BLOCK (radius 14 / lem 6 = presne NAV_R spodného navu). Ten istý blok
   nesie ľavý panel mapy, dok nad mapou aj stavový riadok; štvrtá sada vlastných čísel by sa
   pri prvej úprave predlohy rozišla.
   Do 1. 9. 2026 to bolo tmavé sklo .pk-glass, potom (ráno) papyrusová karta. Karta bola o krok
   bližšie, ale mala rovnaký materiál ako bloky VNÚTRI nej — teraz je vonkajší obal zlatý rám
   s pieskovcovou doskou a papyrus ostáva tomu, čo na doske leží.
   ⚠️ Rám je border:6px solid transparent, teda si berie 6 px z každej strany — vodorovný
   padding preto klesol o toľko isto, nech obsah stojí tam, kde stál. */
.tl-panel{margin-top:14px;padding:16px 14px 18px;${goldFrameCSS()}}
.tl-section + .tl-section{margin-top:22px;}
/* deliaca čiara vnútri karty = zlatá, vyblednutá do strán (lock bledého bloku z Entry.tsx),
   NIE šedý 1px hairline. */
.tl-divider{height:2px;background:${T.rule};margin:22px 0;border:0;}
.tl-sechead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;}
/* Nadpis sekcie na papyruse: zlatá je TMAVŠIA (#8a5a14), nie brandová #C99A3F — tá je na
   svetlom podklade len o niečo tmavšia než sám papyrus a stráca sa. */
.tl-sechead h3{font-family:${FONT_UI};font-weight:500;font-size:12.5px;letter-spacing:.2em;text-transform:uppercase;color:${P.deep};margin:0;}
.tl-seeall{font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:${P.dim};background:${P.soft};border:1px solid ${P.border};border-radius:999px;padding:5px 12px;cursor:pointer;white-space:nowrap;}
.tl-seeall:hover{color:${P.deep};border-color:${T.cardEdge};background:#FFFDF6;}
/* prepínač viditeľnosti sekcie OPEN TRIPS (Matej 1. 9. 2026: „možnosť vybrať si či sa mi to
   má zobrazovať alebo nie") — stav pilulky je VÝBER, teda priesvitný lapisový tint (lock
   2026-08-26), nie plná farba; tá je vyhradená jedinému hlavnému CTA na obrazovke. */
.tl-seeall.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.14)}}
.tl-empty{font-size:12.5px;color:${P.dim};font-style:italic;padding:6px 0 2px;}
/* #55 — prázdny stav = veta faktu + JEDNA akcia. Po zmazaní výplne (2026-08-03) je toto
   prvá obrazovka nového člena v triplíste, samotná kurzíva ho nikam nepustí. */
.tl-emptybox{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:6px 0 4px;}
/* HLAVNÉ CTA = LAPIS (brandový kánon 2026-08-28). Geometriu berie od .btn-gold (radius 8,
   nie pilulka) a mení len výplň — zmena farby nie je povolenie na iný tvar. */
.tl-emptybtn{font-family:${FONT_TITLE};font-weight:700;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;padding:11px 20px;border-radius:8px;border:1px solid ${LAPIS.deep};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.tl-emptybtn:hover{background:${LAPIS.gradHover};}

/* zdieľaný štvorcový GRID — OPEN TRIPS (MY TRIPS = horizontálny scroll .tl-hscroll) */
.tl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media(max-width:560px){.tl-grid{grid-template-columns:repeat(2,1fr);}}
/* MY TRIPS — horizontálny slajd */
.tl-hscroll{display:flex;gap:12px;overflow-x:auto;padding:15px 2px 10px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:thin;}
.tl-hscroll::-webkit-scrollbar{height:6px;}
.tl-hscroll::-webkit-scrollbar-thumb{background:rgba(201,154,63,0.55);border-radius:999px;}
/* wrapper nesie flex + necháva countdown vytŕčať nad kartu (.tl-block má overflow:hidden) */
.tl-mycard{position:relative;flex:0 0 170px;scroll-snap-align:start;}
.tl-mycard .tl-block{width:100%;}
@media(max-width:560px){.tl-mycard{flex:0 0 150px;}}
/* KARTA VÝLETU — papyrus v zlatom ráme. Do 1. 9. 2026 mala tmavý .pk-glass-block (trieda je
   preč aj z JSX, overflow:hidden si nesie tento predpis sám).
   ⚠️ TIEŇ NIE JE T.cardShadow: ten má 0 14px 44px rgba(0,0,0,0.55) plus zlatý halo ring a je
   postavený pre kartu na ČIERNEJ stránke. Karta v zozname stojí NA papyrusovom paneli, kde
   z toho ostane čierny mrak — dostáva preto teplý tieň bez ringu, presne ako .trp-bigcard
   v bledom zozname mapy. */
.tl-block{cursor:pointer;overflow:hidden;background:${T.cardGrad};border:1.5px solid ${T.cardEdge};border-radius:16px;box-shadow:0 2px 8px rgba(122,90,42,0.16),inset 0 1px 0 rgba(255,255,255,0.45);transition:border-color .15s,transform .15s,box-shadow .15s;}
.tl-block:hover{border-color:${P.deep};transform:translateY(-2px);box-shadow:0 0 0 3px rgba(201,154,63,0.28),0 2px 8px rgba(122,90,42,0.16);}
/* PREJDENÉ v MY TRIPS = ZELENÝ RÁM (Matej 1. 9. 2026: „prejdené v mojich výletoch zelenou").
   T.growGreen je naprieč appkou (mimo mapy) SÉMANTIKA „SPLNENÉ" — comm-unit--done,
   comm-joinbtn.joined, DogCardFields, 100 % na DOG ID a nižšie .tl-closebar v TOMTO súbore.
   Lock „zelená = tip od svorky" je o MAPOVÝCH ZNAČKÁCH (GROUP_TINT.comment), nie o kartách,
   takže sa tu sémantika nebije. */
.tl-block.is-done{border-color:${T.growGreen};}
.tl-block.is-done:hover{box-shadow:0 0 0 3px rgba(61,122,78,0.18),0 2px 8px rgba(122,90,42,0.16);}
.tl-block-cover{position:relative;aspect-ratio:4/3;background-size:cover;background-position:center;background-color:rgba(201,154,63,0.14);}
/* Výlet bez fotky (2026-08-14). Členom nahodený trip fotku nemá takmer nikdy, takže z holého
   background-color bola v prvom rade MY TRIPS diera. Fallback je brandový: tlmený zlatý nádych
   a hand-drawn hora (ikonka ide cez ::after, nie cez background-image — ten už drží fotka a
   background-size:cover by ju roztiahol).
   2026-09-01: pôvodná výplň bola takmer čierna (#0C0903) — na papyrusovej karte z nej bola
   diera. Ten istý recept, len na piesku. */
.tl-block-cover.nophoto{background:radial-gradient(120% 90% at 50% 15%,rgba(201,154,63,0.30),rgba(234,214,166,0.95) 72%),${T.panelGrad};}
.tl-block-cover.nophoto::after{content:'';position:absolute;left:50%;top:50%;width:36%;height:36%;transform:translate(-50%,-50%);background:url('/icons/pack/mountain.svg') no-repeat center/contain;filter:${GOLD_ICON_FILTER};opacity:.55;pointer-events:none;}
/* vlajka do kruhu — ľavý horný roh, vzor z /wall .card-flag */
.tl-flag{position:absolute;top:8px;left:8px;width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.45);background:#1a1a1a;z-index:2;}
/* OPEN TRIPS uhne vlajku doprava — ľavý roh preberá menovka organizátora (nižšie) */
.tl-flag--r{left:auto;right:7px;}
/* ČÍ JE TENTO VÝLET — menovka organizátora NA FOTKE, OPEN TRIPS (Matej 1. 9. 2026 chcel modrý
   rám, ale modrá je mapová farba „ideš s niekým" (T.brandBlue) a triplist je zoznam k tej istej
   mape — druhý význam pre tú istú farbu na susediacich povrchoch. Namiesto novej farby preto
   karta ukáže priamo ČÍ výlet to je: existujúci avatar .tl-block-avatar + meno v tmavom
   štítku, presne ako na mape/kartách inde. Rám karty ostáva zlatý. */
.tl-block-ownertag{position:absolute;top:8px;left:8px;z-index:2;display:flex;align-items:center;gap:5px;max-width:calc(100% - 40px);padding:3px 9px 3px 3px;border-radius:999px;background:rgba(20,14,4,0.82);border:1px solid rgba(201,154,63,0.5);}
.tl-block-ownertag span{font-family:${FONT_UI};font-weight:600;font-size:9px;color:#EFE6D6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* výrazný odpočet dní — VYTŔČA nad horný okraj karty (dôležitý údaj), na wrapperi .tl-mycard.
   ⚠️ Krúžok okolo pilulky je farba PODKLADU, teda papyrus karty (#FBF5E6) — nie T.pageBg.
   Čierny prstenec na bledej karte by vyzeral ako dier(k)a po pilulke. */
.tl-countdown{position:absolute;top:-11px;right:8px;z-index:6;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:5px 11px;border-radius:999px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:#1a1305;box-shadow:0 4px 14px rgba(230,158,26,0.5),0 0 0 3px #FBF5E6;white-space:nowrap;pointer-events:none;}
.tl-countdown.soon{background:linear-gradient(135deg,#FF7A45,#E5502A);color:#fff;box-shadow:0 4px 16px rgba(229,80,42,0.55),0 0 0 3px #FBF5E6;}
/* ⚠️ BADGE SEDÍ NA FOTKE, teda ostáva tmavý (2026-09-01). Prezliekať ho do papyrusu by
   znamenalo bledú pilulku na svetlej fotke — presne to, čo sa na obrázkoch nečíta. Sada
   nižšie sa preto pri prechode na bledý šat NEMENÍ. */
.tl-block-badge{position:absolute;right:8px;bottom:8px;font-family:${FONT_UI};font-weight:600;font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:rgba(201,154,63,0.92);color:#1a1305;box-shadow:0 2px 8px rgba(0,0,0,0.45);max-width:calc(100% - 16px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* Status badge v BRANDE (2026-08-14). Pôvodná sada (done=#37B26A zelená · with=#3B82F6 modrá ·
   looking=#2ED3C3 tyrkys, Matej 2026-07-23) dávala tri cudzie farby na jednu obrazovku. Stavy sa
   teraz rozlišujú v zlato-papyrusovej palete tým, čo badge znamená: výzva svieti plnou zlatou,
   uzavreté stavy sú tmavé a tiché, potvrdená účasť je papyrusová.
     looking   — otvorená výzva packu → gradient .btn-gold
     with      — partia je potvrdená → plný papyrus
     done      — uzavreté, tiché → tmavá výplň, papyrusový text
     done-open — PREJDENÉ, ALE INZERÁT STÁLE BEŽÍ → zlatý rám + zlatý text = upozornenie
     solo      — najtichší stav, bez rámu */
.tl-block-badge.done{background:rgba(20,14,4,0.9);color:#EFE6D6;border:1px solid rgba(201,154,63,0.45);}
/* done-open nesie DVE informácie naraz, takže sa do jedného riadku pilulky nezmestí a orezal by
   sa na „Hotovo · Hľadám par…". Zalomenie je tu správnejšie než skratka: nový jednoslovný kľúč by
   bolo treba preložiť do 18 jazykov a v každom by hrozilo, že sa oreže znova. */
.tl-block-badge.done-open{background:rgba(20,14,4,0.92);color:#E8B84B;border:1.5px solid ${GOLD};white-space:normal;line-height:1.25;border-radius:9px;text-align:center;padding:4px 8px;}
.tl-block-badge.solo{background:rgba(20,14,4,0.82);color:rgba(239,230,214,0.72);}
/* moderácia členom nahodeného výletu — pending je čakanie (tiché), rejected uzavretá vec */
.tl-block-badge.pending{background:rgba(20,14,4,0.92);color:#E8B84B;border:1px dashed rgba(201,154,63,0.75);}
.tl-block-badge.rejected{background:rgba(20,14,4,0.92);color:rgba(239,230,214,0.6);border:1px solid rgba(239,230,214,0.28);}
/* ⚠️ Hint UŽ NIE JE na fotke — stojí v .tl-block-info, teda na papyruse. */
.tl-block-pendhint{margin-top:3px;font-family:${FONT_UI};font-size:9.5px;line-height:1.35;color:${P.dim};}
.tl-block-badge.with{background:#F0E6D2;color:#1a1305;border:1px solid rgba(201,154,63,0.55);}
.tl-block-badge.looking{background:linear-gradient(135deg,#F5C73D,#E69E1A);color:#3d1f00;}
.tl-block-info{padding:9px 11px 11px;}
.tl-block-name{font-family:${FONT_TITLE};font-weight:700;font-size:12px;line-height:1.25;color:${P.ink};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:30px;}
.tl-block-sub{font-size:9.5px;color:${P.dim};margin-top:3px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.tl-block-avatar{flex-shrink:0;width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:8.5px;color:${INK};}
/* krátka správa usporiadateľa — 2 riadky, celá v natívnom tooltipe (overflow:hidden na karte by orezal custom bublinu) */
.tl-block-foot{margin-top:8px;}
.tl-datebtn{font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:4px 9px;border-radius:999px;border:1px solid ${P.border};background:${P.soft};color:${P.dim};cursor:pointer;}
.tl-datebtn:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
/* dátum v rámiku (open trips) */
.tl-datepill{display:inline-flex;align-items:center;gap:5px;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.04em;padding:4px 9px;border-radius:8px;border:1px solid ${P.border};background:${P.soft};color:${P.ink};}
.tl-date{font-size:10px;color:${P.dim};}
/* OPEN TRIPS filter bar */
.tl-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px;}
.tl-filter{font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:6px 12px;border-radius:999px;border:1px solid ${P.border};background:${P.soft};color:${P.dim};cursor:pointer;transition:all .15s;}
.tl-filter:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
/* VYBRANÝ FILTER = PRIESVITNÝ LAPISOVÝ TINT, nie plná farba (lock 2026-08-26). Plná plocha je
   vyhradená jedinému hlavnému CTA na obrazovke; keď ju dostane aj chip, ktorý človek práve
   klikol, obrazovka má dve „hlavné" veci a ani jedna nevedie. Čitateľnosť nesie TMAVÝ inkoust
   a plný farebný rám, nie krytie výplne. */
.tl-filter.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.14)}font-weight:600;}
/* ⚠️ color-scheme:light, nie dark — natívna rozbaľovačka by inak vyskočila čierna nad
   papyrusovou stránkou. */
.tl-filter-sel{font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;padding:6px 10px;border-radius:999px;border:1px solid ${P.border};background:${P.field};color:${P.ink};cursor:pointer;color-scheme:light;outline:0;}
.tl-filter-sep{width:1px;height:20px;background:${P.hair};margin:0 2px;}
/* OPEN TRIPS pager */
.tl-pager{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px;}
.tl-pagebtn{font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:8px 15px;border-radius:999px;border:1px solid ${P.border};background:${P.soft};color:${P.ink};cursor:pointer;transition:all .15s;}
.tl-pagebtn:hover:not(:disabled){border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
.tl-pagebtn:disabled{opacity:.35;cursor:default;}
.tl-pageinfo{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.06em;color:${P.dim};}

/* VIDITEĽNOSŤ VÝLETU (#42) — badge na MY TRIPS karte je prepínač, nie nálepka */
.tl-block-badge.tap{cursor:pointer;border:0;font-family:inherit;}
.tl-block-badge.tap:hover{filter:brightness(1.08);}
.tl-vis{display:flex;flex-direction:column;gap:10px;}
/* voľba = PODBLOK (úroveň 2 matrice), vybraná = lapisový tint */
.tl-vischoice{display:flex;align-items:flex-start;gap:11px;text-align:left;padding:13px 14px;border-radius:12px;border:1px solid ${T.cardEdge};background:${T.panelGrad};box-shadow:0 1px 3px rgba(122,90,42,0.10),inset 0 1px 0 rgba(255,255,255,0.40);cursor:pointer;transition:all .15s;}
.tl-vischoice:hover{border-color:${P.deep};background:#FFFDF6;}
.tl-vischoice.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.12)}}
.tl-vischoice-ic{flex-shrink:0;width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:rgba(201,154,63,0.14);border:1px solid ${P.border};font-size:14px;}
.tl-vischoice-t{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:12.5px;letter-spacing:.04em;color:${P.ink};}
.tl-vischoice-d{display:block;font-size:10.5px;line-height:1.45;color:${P.dim};margin-top:4px;}

/* Po prijatí žiadosti — ponuka stiahnuť inzerát (#42, „na rande nechceš tretiu osobu").
   Zelená = hotové; na papyruse ide ako tint s tmavým inkoustom, nie ako svetlý text. */
.tl-closebar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;padding:12px 14px;border-radius:12px;${pickTintCSS(T.growGreen, PICK_INK.green, 0.14)}}
.tl-closebar-t{flex:1;min-width:180px;font-size:11.5px;line-height:1.45;color:${PICK_INK.green};}
.tl-closebar-t b{font-family:${FONT_TITLE};font-weight:700;}

/* REQUESTS TO JOIN — schránka organizátora (#41). Riadok = karta člena (.pmc) + dve akcie. */
.tl-req{display:flex;align-items:center;gap:10px;}
.tl-req + .tl-req{margin-top:8px;}
.tl-req-member{flex:1;min-width:0;}
.tl-req-member .pmc{margin-top:0;}
.tl-req-acts{display:flex;gap:6px;flex-shrink:0;}
.tl-reqbtn{font-family:${FONT_UI};font-weight:600;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;padding:9px 13px;border-radius:10px;border:1px solid ${P.border};background:${P.soft};color:${P.dim};cursor:pointer;transition:all .15s;}
.tl-reqbtn:disabled{opacity:.4;cursor:default;}
/* Zelená áno / červená nie ostávajú — nesú význam. Na papyruse len tmavnú do inkoustu:
   svetlé #5FD98C a #FF8A66 boli robené na čiernu dosku a na piesku zaniknú. */
.tl-reqbtn.yes:not(:disabled):hover{${pickTintCSS(T.growGreen, PICK_INK.green, 0.16)}}
.tl-reqbtn.no:not(:disabled):hover{${pickTintCSS('#B25640', PICK_INK.red, 0.16)}}
@media(max-width:560px){.tl-req{flex-wrap:wrap;}.tl-req-acts{width:100%;}.tl-reqbtn{flex:1;}}

/* JOIN na karte cudzieho otvoreného výletu (#41) — hlavná akcia karty, teda LAPIS.
   Geometria (radius 8) ostáva z locku .btn-gold, mení sa iba výplň. */
.tl-join{width:100%;margin-top:8px;font-family:${FONT_TITLE};font-weight:700;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;padding:8px 6px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;transition:background .15s;}
.tl-join:hover:not(:disabled){background:${LAPIS.gradHover};}
.tl-join:disabled{cursor:default;}
/* prijatý = STAV, nie výzva ⇒ zelený tint bez tieňa CTA */
.tl-join.done{${pickTintCSS(T.growGreen, PICK_INK.green, 0.18)}box-shadow:none;}
.tl-join.pending{background:${P.soft};border-color:${P.border};color:${P.dim};box-shadow:none;}
.tl-joinerr{font-size:9px;color:${PICK_INK.red};margin-top:5px;line-height:1.35;}

/* Add date popup — plávajúci PANEL (úroveň 4 matrice PACK_BOX.panel) nad tmavým závojom.
   ⚠️ BEZ KRÍŽIKA (lock 2026-08-28, Matej: „nedávajme tie krížiky na bloky") — von sa ide
   klikom mimo (overlay) alebo klávesom Esc. Trieda .tl-x preto zanikla aj z JSX. */
.tl-overlay{position:fixed;inset:0;z-index:1200;background:rgba(3,2,1,0.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;}
.tl-modal{width:100%;max-width:360px;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-radius:14px;box-shadow:${T.panelShadow};padding:24px;}
.tl-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}
.tl-modal-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${P.ink};}
/* pole = .pf-field--flat recept: plochá papyrusová výplň, jeden zlatý rám, tmavý inkoust.
   color-scheme:light kvôli natívnemu kalendáru — v dark by vyskočil čierny. */
.tl-dateinput{width:100%;background:${P.field};border:1px solid ${P.border};border-radius:8px;padding:11px 12px;color:${P.ink};font-family:inherit;font-size:16px;outline:0;color-scheme:light;}
.tl-dateinput:focus{border-color:${LAPIS.edge};box-shadow:0 0 0 3px ${LAPIS.halo};}
.tl-modal-submit{width:100%;margin-top:16px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.tl-modal-submit:hover:not(:disabled){background:${LAPIS.gradHover};}
.tl-modal-submit:disabled{opacity:.4;cursor:default;}
`;

// status pilulka. done = walked (prejdené) má prednosť pred statusom.
// Farebné triedy: done/with/looking/solo.
//
// #41: mená účastníkov idú z DB (`get_trip_party`) — jediný zdroj. Lokálny `entry.joiners`
// je rezervované pole pre budúce Slice B (viď triplist.ts), reálne prihlásenia ním nejdú,
// takže sa z neho meno nikdy neodvodzuje.
function statusLabel(t: ReturnType<typeof useT>, entry: TriplistTrip, done?: boolean, party?: TripParty, mod?: string): string {
  // Moderácia prebíja VŠETKO ostatné: kým výlet nie je schválený, pack ho nevidí, takže
  // „Hľadám partiu" by bola nepravda — nikto ho nemá ako nájsť.
  if (mod === 'pending') return t('pack.triplist.statusPendingReview');
  if (mod === 'rejected') return t('pack.triplist.statusRejected');
  if (done) {
    // ⚠️ `walked` NEPREPÍNA `openness` (viď komentár pri MY TRIPS nižšie): prejdený výlet ostáva
    // visieť celému packu ako inzerát — aj s dátumom. Samotné „Hotovo" tú pascu zakrylo, majiteľ
    // o bežiacom inzeráte nevedel. Label preto povie oboje. Skladá sa z DVOCH existujúcich kľúčov
    // zámerne: nový string by bolo treba preložiť do všetkých 18 jazykov, takto je pokrytý hneď.
    if (entry.status === 'looking') return `${t('pack.triplist.statusDone')} · ${t('pack.triplist.statusLookingForPack')}`;
    return t('pack.triplist.statusDone');
  }
  const real = party?.joiners ?? [];
  if (real.length === 1) return t('pack.triplist.statusWithName', { name: real[0].ownerFirst ?? t('pack.triplist.fallbackDogyptianLower') });
  if (real.length > 1) return t('pack.triplist.statusWithCount', { n: real.length });
  if (entry.status === 'going') return t('pack.triplist.statusGoing');
  if (entry.status === 'looking') {
    // organizátor vidí, koľko ľudí čaká na jeho odpoveď — inak by o žiadosti nevedel
    const waiting = party?.requests.length ?? 0;
    return waiting ? t('pack.triplist.statusLookingAsked', { n: waiting }) : t('pack.triplist.statusLookingForPack');
  }
  return t('pack.triplist.statusSolo');
}
function statusClass(entry: TriplistTrip, done?: boolean, party?: TripParty, mod?: string): string {
  if (mod === 'pending') return 'pending';
  if (mod === 'rejected') return 'rejected';
  // prejdený + stále zverejnený = vlastný stav, nie „done" (viď statusLabel) — badge musí
  // vyzerať ako upozornenie, nie ako uzavretá vec
  if (done) return entry.status === 'looking' ? 'done-open' : 'done';
  if ((party?.joiners.length ?? 0) > 0) return 'with';
  if (entry.status === 'going') return 'with';
  if (entry.status === 'looking') return 'looking';
  return 'solo';
}

// dni od dnes (kladné = budúcnosť). null = bez dátumu.
function daysFromNow(dateStr: string | undefined, nowMs: number): number | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr + 'T00:00:00').getTime();
  if (Number.isNaN(ms)) return null;
  return Math.round((ms - nowMs) / DAY_MS);
}
function countdownLabel(t: ReturnType<typeof useT>, days: number): string {
  if (days <= 0) return t('pack.triplist.countdownToday');
  if (days === 1) return t('pack.triplist.countdownTomorrow');
  return t('pack.triplist.countdownDaysLeft', { n: days });
}
// Poradie MY TRIPS (Matej 2026-07-23): blížiace sa PRVÉ (najbližší dátum), potom bez dátumu, DONE POSLEDNÉ.
function sortMyTrips(rows: MyTripRow[], nowMs: number): MyTripRow[] {
  const rank = (r: MyTripRow) => {
    if (r.done) return 2;
    const d = daysFromNow(r.entry.date, nowMs);
    return d !== null && d >= 0 ? 0 : 1;
  };
  return [...rows].sort((a, b) => {
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    const da = daysFromNow(a.entry.date, nowMs), db = daysFromNow(b.entry.date, nowMs);
    if (ra === 0) return (da ?? 9e9) - (db ?? 9e9);       // upcoming: najbližší prvý
    if (ra === 2) return (db ?? -9e9) - (da ?? -9e9);      // done: najnovší minulý prvý
    return b.entry.addedAt - a.entry.addedAt;
  });
}

type MyTripRow = { entry: TriplistTrip; trail: HeroTrail; placeholder?: boolean; done?: boolean };

// Jedna karta v OPEN TRIPS — vždy reálny inzerát z DB (`user_trips` cez useOpenTrips).
// Žiadny fiktívny fallback: keď DB nemá otvorené výlety, sekcia zobrazí prázdny stav.
type OpenCard = {
  key: string;
  trail: HeroTrail;
  date: string;            // '' = bez dátumu
  joiners: number;
  ownerName: string;
  ownerInitial: string;
  real: { slug: string; organizerId: string };
};

// stav tlačidla „požiadať" podľa mojej existujúcej žiadosti na ten výlet
function joinLabel(t: ReturnType<typeof useT>, status?: TripRequestStatus): { label: string; cls: string; disabled: boolean } {
  switch (status) {
    case 'requested': return { label: t('pack.triplist.joinRequested'), cls: ' pending', disabled: true };
    case 'accepted': return { label: t('pack.triplist.joinAccepted'), cls: ' done', disabled: true };
    // odmietnutý aj odídený smie požiadať znova — starý riadok sa pri tom zmaže
    // a založí nanovo (viď tripRequests.ts, unique constraint)
    case 'declined': return { label: t('pack.triplist.joinAskAgain'), cls: '', disabled: false };
    case 'left': return { label: t('pack.triplist.joinAskAgain'), cls: '', disabled: false };
    default: return { label: t('pack.triplist.joinRequestToJoin'), cls: '', disabled: false };
  }
}

// Keď `get_trip_party()` k žiadosti meno nevydá (človek medzitým prestal byť platiaci
// člen → vypadne z `member` v SQL), riadok sa aj tak MUSÍ dať vybaviť.
const UNKNOWN_MEMBER: PartyMember = {
  role: 'requested', ownerFirst: null, dogName: null, dogPhoto: null, packNumber: null, at: null,
};

export default function PackTriplist() {
  const t = useT();
  const navigate = useNavigate();
  const id = usePackIdentity();

  // Hydratácia z DB (issue #32) dobehne po mounte → epoch prečíta walked/triplist znova.
  const storeEpoch = usePackStoreEpoch();
  // ⚠️ `withMissedPlans` — TRIPLIST je JEDINÉ miesto, kde neuskutočnený plán ostáva (Matej
  // 25. 8. 2026: „nechať v historii iba v tripliste u autora nikde inde"). Všade inde ho
  // `visibleLocalTrails` odfiltruje; bez tohto príznaku by zmizol aj tu a „ostáva v histórii"
  // by neznamenalo nič.
  const allTrails = useMemo(() => [...visibleLocalTrails(readLocalTrails(), { withMissedPlans: true }), ...HERO_JOURNEYS, ...HERO_TRAILS], []);
  // Founder walked seed (Matej 2026-07-24): nahodené = prejdené + z červených len SNP/Poloniny.
  // Seedne raz za session aj keď sa na vysvedčenie príde priamo (mimo PackMap mapy).
  useMemo(() => ensureWalkedSeeded([
    ...HERO_TRAILS.map((t) => t.id),
    ...FOUNDER_WALKED_JOURNEY_IDS.filter((id) => [...HERO_JOURNEYS, ...HERO_TRAILS].some((t) => t.id === id)),
  ]), []);
  const nowMs = useMemo(() => Date.now(), []);

  // dva povrchy na jednej route — ?tab=stats otvorí TRIPSTATS, inak TRIPLIST (Matej 2026-07-23,
  // konsolidácia headera 4→2 pilulky). Header ✓/km pilulka linkuje sem s ?tab=stats.
  const [searchParams, setSearchParams] = useSearchParams();
  const view: 'list' | 'stats' = searchParams.get('tab') === 'stats' ? 'stats' : 'list';
  const setView = (v: 'list' | 'stats') => setSearchParams(v === 'stats' ? { tab: 'stats' } : {}, { replace: true });

  // TRIPSTATS dáta — prejdené (walked) tripy + km, rovnaký zdroj ako bývalý „Trippin'" dashboard.
  const walkedTrails = useMemo(() => {
    const walked = readWalkedIds();
    return allTrails.filter((tr) => walked.has(tr.id));
  }, [allTrails, storeEpoch]);
  // tr.km je STRING (HeroTrail.km: string) → coerce na number, inak reduce reťazí stringy a walkedKm.toFixed spadne
  const walkedKm = useMemo(() => walkedTrails.reduce((s, tr) => s + (Number(tr.km) || 0), 0), [walkedTrails]);

  // migrácia existujúcich wishlist plánov → triplist entries, idempotentné (viď triplist.ts).
  useEffect(() => {
    seedTriplistFromPlans(readPlans());
    // ⚠️ A ZAPÍSANÉ VÝLETY TIEŽ (2026-08-26). Do opravy v `submitAddTripDraft` sa vlastný
    // zápis do triplistu nedostal vôbec (Matej: „po zápise výlet nevidím v tripliste"), takže
    // výlety zapísané pred ňou by tu chýbali naďalej. Berú sa LEN moje (`meta.mine`, prázdna
    // mapa = ešte sa nehydratovalo ⇒ ber ako moje, rovnaká úvaha ako vo `visibleLocalTrails`).
    const meta = readLocalTrailMeta();
    seedTriplistFromWalked(
      readLocalTrails().filter((tr) => meta[tr.id]?.mine ?? true).map((tr) => tr.id),
    );
  }, []);

  const [triplist, setTriplist] = useState<Record<string, TriplistTrip>>(() => readTriplist());
  useEffect(() => { if (storeEpoch) setTriplist(readTriplist()); }, [storeEpoch]);
  const [dateTripId, setDateTripId] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState('');
  const [publicWCE, setPublicWCE] = useState<WCE | 'all'>('all'); // OPEN TRIPS filter (region)
  const [publicPage, setPublicPage] = useState(0);                // OPEN TRIPS stránkovanie (9/stránku)
  const PUBLIC_PER_PAGE = 9;

  const walkedSet = useMemo(() => readWalkedIds(), [allTrails, storeEpoch]);
  // Stav členom nahodeného výletu v moderácii. `readLocalTrailMeta` existovalo od #32, ale
  // nikde sa nerenderovalo — autor teda videl „Hľadám partiu" na výlete, ktorý pack NEVIDÍ
  // (RLS pustí cudzí trip až po `approved`), a nemal ako zistiť, že sa čaká na schválenie.
  // ⚠️ Prázdna mapa NEZNAMENÁ „nič nie je schválené" — znamená „ešte sa nehydratovalo"
  // (viď packStore.ts). Preto sa značka kreslí LEN pri explicitnom pending/rejected.
  const trailMeta = useMemo(() => readLocalTrailMeta(), [storeEpoch]);

  const realMyTrips = useMemo<MyTripRow[]>(() => {
    return Object.values(triplist)
      .map((entry) => ({ entry, trail: allTrails.find((tr) => tr.id === entry.tripId) }))
      .filter((x): x is MyTripRow => !!x.trail)
      .map((x) => ({ ...x, done: walkedSet.has(x.entry.tripId) }))
      .sort((a, b) => b.entry.addedAt - a.entry.addedAt);
  }, [triplist, allTrails, walkedSet]);

  const myTrips = useMemo(
    () => sortMyTrips(realMyTrips, nowMs),
    [realMyTrips, nowMs],
  );
  // #41 — ŽIADOSTI. `reqEpoch` je ručný refresh: prijatie/odmietnutie zmení riadok
  // v DB, ale RPC ani zoznamy o tom samy nevedia. `reqBusy` drží id práve
  // spracúvanej akcie (dvojklik na Accept by inak poslal dva updaty).
  const [reqEpoch, setReqEpoch] = useState(0);
  const [reqBusy, setReqBusy] = useState<string | null>(null);
  const [joinErr, setJoinErr] = useState<Record<string, string>>({});
  // #42 — prepínač viditeľnosti (badge na MY TRIPS karte) + ponuka zavrieť po prijatí
  const [visTripId, setVisTripId] = useState<string | null>(null);

  // Viditeľnosť CELEJ sekcie OPEN TRIPS (Matej 1. 9. 2026: „možnosť vybrať si či sa mi to má
  // zobrazovať alebo nie"). Musí prežiť reload → localStorage, kľúč v PACK_KEYS (nie holý
  // reťazec priamo v komponente, tak to má zvyšok /pack).
  const [openCollapsed, setOpenCollapsed] = useState<boolean>(() => readJson(PACK_KEYS.openTripsCollapsed, false));
  const toggleOpenCollapsed = () => {
    setOpenCollapsed((prev) => {
      const next = !prev;
      writeJson(PACK_KEYS.openTripsCollapsed, next);
      return next;
    });
  };

  // ── ESC ZATVÁRA PLÁVAJÚCE PANELY (2026-09-01) ─────────────────────────────
  // Panely stratili krížik (lock 2026-08-28: „nedávajme tie krížiky na bloky") —
  // von sa ide klikom mimo alebo klávesou. Na mobile stačí klik mimo, na PC musí
  // byť Esc, inak by odchod z panela závisel od toho, či človek trafí vedľa.
  // JEDEN listener na oba panely: dva by museli riešiť, ktorý z nich klávesu zje.
  useEffect(() => {
    if (!dateTripId && !visTripId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setDateTripId(null);
      setVisTripId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dateTripId, visTripId]);


  const [closeOffer, setCloseOffer] = useState<{ slug: string; who: string | null } | null>(null);
  const incoming = useIncomingRequests(reqEpoch);
  const myRequests = useMyRequests(reqEpoch);

  // #41: kto reálne ide. Len pre SKUTOČNÉ výlety — placeholder riadky (prázdny
  // triplist) nemajú v DB čo hľadať a zbytočne by strieľali RPC. Slugy zo schránky
  // sa pridávajú aj keď v lokálnom triplíste (ešte) nie sú — inak by žiadosť visela bez mena.
  const partySlugs = useMemo(() => {
    const s = new Set<string>(realMyTrips.map((r) => r.entry.tripId));
    Object.keys(incoming.bySlug).forEach((slug) => s.add(slug));
    return [...s];
  }, [realMyTrips, incoming.bySlug]);
  const parties = useMyTripParties(partySlugs, reqEpoch);

  // #41: REÁLNE otvorené výlety ostatných členov (DB) + ich organizátori.
  const { trips: dbOpenTrips } = useOpenTrips(reqEpoch);
  const openParties = useTripParties(
    dbOpenTrips.map((o) => ({ slug: o.slug, organizerId: o.organizerId })),
    reqEpoch,
  );
  // najbližší nadchádzajúci trip → sub v TRIPLIST tab-e (Matej: „v headri môže byť info next trip za xy dní")
  const nextUpDays = useMemo(() => {
    const up = myTrips.find((r) => !r.done && (daysFromNow(r.entry.date, nowMs) ?? -1) >= 0);
    return up ? daysFromNow(up.entry.date, nowMs) : null;
  }, [myTrips, nowMs]);

  // #41: reálne inzeráty z `user_trips` (RLS `user_trips_read_open`) cez useOpenTrips.
  const realOpenCards = useMemo<OpenCard[]>(() => dbOpenTrips.flatMap((o) => {
    const trail = allTrails.find((tr) => tr.id === o.slug);
    // cudzia LOKÁLNA trasa — jej geometriu ani fotky appka nemá, kartu nepostaví
    if (!trail) return [];
    const party = openParties[partyKey(o.slug, o.organizerId)];
    const org = party?.organizer;
    const who = [org?.ownerFirst, org?.dogName].filter(Boolean).join(' & ');
    return [{
      key: partyKey(o.slug, o.organizerId),
      trail,
      date: o.date ?? '',
      joiners: party?.joiners.length ?? 0,
      ownerName: who || 'A Dogyptian',
      ownerInitial: (org?.ownerFirst ?? org?.dogName ?? '?').charAt(0).toUpperCase(),
      real: { slug: o.slug, organizerId: o.organizerId },
    }];
  }), [dbOpenTrips, openParties, allTrails]);

  const openCardsAll = realOpenCards;
  const openCards = useMemo(
    () => (publicWCE === 'all' ? openCardsAll : openCardsAll.filter((c) => trailWCE(c.trail) === publicWCE)),
    [openCardsAll, publicWCE],
  );
  const publicPageCount = Math.max(1, Math.ceil(openCards.length / PUBLIC_PER_PAGE));
  const publicShown = openCards.slice(publicPage * PUBLIC_PER_PAGE, publicPage * PUBLIC_PER_PAGE + PUBLIC_PER_PAGE);
  const setRegion = (k: WCE | 'all') => { setPublicWCE(k); setPublicPage(0); };

  const openAddDate = (tripId: string, current?: string) => {
    setDateValue(current ?? '');
    setDateTripId(tripId);
  };
  const saveDate = () => {
    if (!dateTripId) return;
    const next = upsertMyTrip(dateTripId, { date: dateValue || undefined });
    setTriplist((prev) => ({ ...prev, [dateTripId]: next }));
    setDateTripId(null);
  };

  // #41 — požiadať o pridanie na cudzí otvorený výlet. `from_user_id` sa neposiela
  // odtiaľto: doplní ho tripRequests.ts zo session a RLS ho aj tak zamyká na auth.uid().
  const onRequestJoin = async (real: { slug: string; organizerId: string }) => {
    const k = requestKey(real.slug, real.organizerId);
    setReqBusy(k);
    const err = await requestToJoin(real.slug, real.organizerId);
    setReqBusy(null);
    setJoinErr((prev) => ({ ...prev, [k]: err ?? '' }));
    if (!err) setReqEpoch((e) => e + 1);
  };

  // #41 — organizátor rozhodne. Riadok sa adresuje `id`; meno k nemu má appka len
  // z RPC (get_trip_party cudzie uuid zámerne nevydáva).
  //
  // #42: po PRIJATÍ ponúkneme stiahnuť inzerát. Zámerne PONUKA, nie automat — organizátor
  // môže hľadať ďalších. Bez toho ostane `looking` navždy a žiadosti chodia aj do plnej
  // partie (Matej: „ak sa dohodnu dvaja na rande, nebudú chcieť tretiu osobu").
  const onDecide = async (id: string, status: 'accepted' | 'declined', slug?: string, who?: string | null) => {
    setReqBusy(id);
    const err = await decideRequest(id, status);
    setReqBusy(null);
    if (err) console.warn('[trip request]', err);
    // ponuku ukazujeme LEN keď je výlet naozaj ešte inzerovaný — pri zavretom by to bola
    // otázka na niečo, čo už platí
    if (!err && status === 'accepted' && slug && triplist[slug]?.openness === 'open') {
      setCloseOffer({ slug, who: who ?? null });
    }
    setReqEpoch((e) => e + 1);
  };

  // #42 — zmena viditeľnosti výletu. `private` pri výlete, na ktorý už niekto ide, NESMIE
  // zhodiť status na 'solo' — tým by sa stratilo, že partia existuje. Preto 'going'.
  const setVisibility = (tripId: string, open: boolean) => {
    const hasJoiners = (parties[tripId]?.joiners.length ?? 0) > 0;
    const next = open
      ? { status: 'looking' as TripStatus, openness: 'open' as const }
      : { status: (hasJoiners ? 'going' : 'solo') as TripStatus, openness: 'closed' as const };
    const saved = upsertMyTrip(tripId, next);
    setTriplist((prev) => ({ ...prev, [tripId]: saved }));
    // #42 — privatizácia musí zavrieť aj samostatný "Looking for pack" inzerát (trip_events);
    // ten sa netočí okolo `openness` a bez tohto by ostal verejný aj po prepnutí na "Private".
    if (!open) closeMyTripEvents(tripId);
    setVisTripId(null);
    setCloseOffer(null);
  };

  if (id.loading) {
    return (
      /* ⚠️ NAČÍTAVACIA OBRAZOVKA SA PREZLIEKA SPOLU SO STRÁNKOU (Matej 1. 9. 2026:
         „sekunda pred načítaním sa stále zobrazuje tmavé pozadie a slovo načítavam").
         Je to prvá vec, ktorú človek na route uvidí — keď ostane tmavá, každý vstup do
         triplistu začne bliknutím čiernej a až potom prejde do papyrusu. */
      <div className="pk-paper flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <style>{PAPER_PAGE_CSS}</style>
        <div className="relative" style={{ zIndex: 1 }}>
          <div style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.3em', fontSize: 12, color: T.inkWarm }}>
            {t('pack.layout.loading')}
          </div>
        </div>
      </div>
    );
  }
  if (!id.session) return null;

  return (
    <div className="pk-paper tl-root">
      <style>{PAPER_PAGE_CSS}</style>
      {/* GLASS_CSS ostáva: .pk-glass ani .pk-glass-block na tejto stránke UŽ NIE SÚ, ale
          vnorené povrchy (karta člena .pmc) si sklo ešte berú — prezliekajú sa vo vlastnom
          kroku, nie tu. */}
      <style>{GLASS_CSS}</style>
      <style>{COMMUNITY_CSS}</style>
      <style>{PARTY_CARD_CSS}</style>
      <style>{CSS}</style>
      {/* Heroglyfová tapeta je súčasťou .pk-paper — <HieroglyphBg /> (tmavá tapeta na
          čiernej) sa sem už nevkladá. Volať oboje naraz = dve tapety cez seba. */}

      <div className="tl-body">
        <div className="tl-backrow">
          <button type="button" className="tl-back" onClick={() => navigate('/pack/map')} aria-label={t('pack.triplist.backToMap')}>←</button>
        </div>

        {/* dve karty-prepínače (Matej 2026-07-23): naše ikony (paw/trophy), žiadne emoji, žiadne nadpisy nad.
            Matej 2026-07-26: poradie otočené — Tripstats vľavo, Triplist vpravo. */}
        <div className="tl-tabs">
          <button type="button" className={`tl-tab${view === 'stats' ? ' on' : ''}`} onClick={() => setView('stats')}>
            <span className="tl-tab-label"><span className="tl-tab-ic" style={{ '--ic': `url(${ICON('trophy')})` } as React.CSSProperties} />{t('pack.triplist.tabTripstats')}</span>
          </button>
          <button type="button" className={`tl-tab${view === 'list' ? ' on' : ''}`} onClick={() => setView('list')}>
            <span className="tl-tab-label"><span className="tl-tab-ic" style={{ '--ic': `url(${ICON('clipboard')})` } as React.CSSProperties} />{t('pack.triplist.tabTriplist')}</span>
          </button>
        </div>

        {view === 'stats' ? (
          // onAddTrip: issue #35 — kanonická ADD adresa `/pack/add/trip`; `?region=` (nie starý
          // `?add=`), PackMap rozumie obom tvarom.
          <TripStatsPanel
            walkedTrails={walkedTrails}
            walkedKm={walkedKm}
            onOpenTrip={(tid) => navigate(tripPathById(tid, allTrails))}
            onAddTrip={(region) => navigate('/pack/add/trip' + (region ? `?region=${encodeURIComponent(region)}` : ''))}
          />
        ) : (
        <div className="tl-panel">
          {/* REQUESTS TO JOIN (#41) — schránka organizátora. Ukáže sa LEN keď niekto čaká;
              prijatie/odmietnutie píše do `trip_requests` (status prepína výhradne organizátor,
              policy trip_requests_decide). Meno k riadku dáva get_trip_party, id dáva tabuľka. */}
          {incoming.count > 0 && (
            <>
              <div className="tl-section">
                <div className="tl-sechead">
                  <h3>{t('pack.triplist.requestsToJoin', { n: incoming.count })}</h3>
                </div>
                {Object.entries(incoming.bySlug).map(([slug, rows]) => {
                  const trail = allTrails.find((tr) => tr.id === slug);
                  return pairPending(rows, parties[slug]?.requests ?? []).map(({ row, member }) => (
                    <div key={row.id} className="tl-req">
                      <div className="tl-req-member">
                        {/* #53 — organizátor si vie so žiadateľom napísať EŠTE PRED
                            rozhodnutím; „idem/nejdem" sa dohaduje v správach, nie
                            slepým Accept. Organizátorom tejto schránky som ja. */}
                        {/* Klik na fotku otvorí profil žiadateľa (2026-08-26). Dovtedy tu
                            nebolo kam ísť — o cudzom členovi appka nemala čo ukázať. Adresa
                            je PORADOVÉ ČÍSLO, nie `user_id`: to sa o cudzom človeku nevydáva
                            (`get_trip_party`). Bez čísla (zakladajúci pes ho nemá) sa fotka
                            nechá nekliknuteľná — mŕtve tlačidlo je horšie než žiadne. */}
                        <PartyMemberCard
                          member={member ?? UNKNOWN_MEMBER}
                          roleLabel={trail?.name ?? slug}
                          dm={id.session?.user?.id ? { tripSlug: slug, organizerId: id.session.user.id } : undefined}
                          onOpenProfile={member?.packNumber != null
                            ? () => navigate(`/pack/u/${member.packNumber}`)
                            : undefined}
                        />
                      </div>
                      <div className="tl-req-acts">
                        <button
                          type="button"
                          className="tl-reqbtn yes"
                          disabled={reqBusy === row.id}
                          onClick={() => void onDecide(row.id, 'accepted', slug, member?.ownerFirst ?? member?.dogName ?? null)}
                        >{t('pack.triplist.accept')}</button>
                        <button
                          type="button"
                          className="tl-reqbtn no"
                          disabled={reqBusy === row.id}
                          onClick={() => void onDecide(row.id, 'declined')}
                        >{t('pack.triplist.decline')}</button>
                      </div>
                    </div>
                  ));
                })}
              </div>
              <div className="tl-divider" />
            </>
          )}

          {/* #42 — po prijatí: stiahnuť inzerát, alebo hľadať ďalej. Ponuka, nie automat. */}
          {closeOffer && (
            <>
              <div className="tl-closebar">
                <span className="tl-closebar-t">
                  <b>{closeOffer.who ?? t('pack.triplist.fallbackDogyptian')}</b> {t('pack.triplist.closeOfferBody')}
                </span>
                <div className="tl-req-acts">
                  <button type="button" className="tl-reqbtn yes" onClick={() => setVisibility(closeOffer.slug, false)}>
                    {t('pack.triplist.closeIt')}
                  </button>
                  <button type="button" className="tl-reqbtn" onClick={() => setCloseOffer(null)}>
                    {t('pack.triplist.keepLooking')}
                  </button>
                </div>
              </div>
              <div className="tl-divider" />
            </>
          )}

          {/* MY TRIPS — horizontálny slajd, status badge (farebný: done/with/looking/solo), vlajka */}
          <div className="tl-section">
            <div className="tl-sechead">
              <h3>{t('pack.triplist.myTrips')}</h3>
            </div>
            {myTrips.length === 0 ? (
              <div className="tl-emptybox">
                <span className="tl-empty">{t('pack.triplist.emptyMyTrips')}</span>
                <button type="button" className="tl-emptybtn" onClick={() => navigate('/pack/add/trip')}>{t('pack.triplist.addFirstTrip')}</button>
              </div>
            ) : (
              <div className="tl-hscroll">
                {myTrips.map(({ entry, trail, done, placeholder }) => {
                  const dleft = done ? null : daysFromNow(entry.date, nowMs);
                  // #42: badge je prepínač viditeľnosti. Nie na placeholder riadkoch — tie
                  // v DB neexistujú, nie je čo prepínať.
                  //
                  // ⚠️ PREJDENÉ výlety sem PATRIA. Prvá verzia ich vylúčila („čo už sa
                  // zverejňovať") a tým vyrobila slepú uličku: `walked` neprepína `openness`,
                  // takže prejdený výlet ostane visieť v OPEN TRIPS celému packu — aj s
                  // dátumom — a majiteľ ho nemá ako stiahnuť. Badge vtedy hlási „Done", nie
                  // „Looking", takže o tom ani nevie.
                  const canToggleVis = !placeholder;
                  /* ⚠️ ILUSTRAČNÁ FOTKA, NIE ŠEDÁ HORA (Matej 2026-08-25: „výlet sa pridal ale
                     nepridala sa fotka (ilustračná)"). Mapa ju kreslila, triplist nie — tá istá
                     trasa mala na dvoch obrazovkách dva rôzne obrázky, a na tej, kde plány
                     naozaj žijú, ten horší. `.nophoto` ostáva len pre PLACEHOLDER riadky
                     (výlet, ktorý ešte neexistuje) — tam naozaj niet čo ilustrovať. */
                  const cover = trail.photos[0] ?? (placeholder ? '' : placeholderFor(trail.acts, trail.id));
                  // stav v moderácii — len pre členom nahodené výlety, generovaný dataset ho nemá
                  const mod = trailMeta[entry.tripId]?.status;
                  return (
                  <div key={entry.tripId} className="tl-mycard">
                    {dleft !== null && dleft >= 0 && (
                      <span className={`tl-countdown${dleft <= 3 ? ' soon' : ''}`}>{countdownLabel(t, dleft)}</span>
                    )}
                  <div className={`tl-block${done ? ' is-done' : ''}`} onClick={() => navigate(tripPath(trail))}>
                    <div className={`tl-block-cover${cover ? '' : ' nophoto'}`} style={cover ? { backgroundImage: `url('${cover}')` } : undefined}>
                      <img className="tl-flag" src={flagUrl(trailCountry(trail))} alt="" loading="lazy" draggable={false} />
                      {/* Kým výlet čaká na schválenie, badge NIE JE prepínač viditeľnosti —
                          prepínať nie je čo, pack ho aj tak nevidí. */}
                      {canToggleVis && !mod ? (
                        <button
                          type="button"
                          className={`tl-block-badge tap ${statusClass(entry, done, parties[entry.tripId])}`}
                          title={t('pack.triplist.whoCanSee')}
                          onClick={(e) => { e.stopPropagation(); setVisTripId(entry.tripId); }}
                        >{statusLabel(t, entry, done, parties[entry.tripId])}</button>
                      ) : (
                        <span className={`tl-block-badge ${statusClass(entry, done, parties[entry.tripId], mod)}`}>{statusLabel(t, entry, done, parties[entry.tripId], mod)}</span>
                      )}
                    </div>
                    <div className="tl-block-info">
                      <div className="tl-block-name">{trail.name}</div>
                      {mod === 'pending' && <div className="tl-block-pendhint">{t('pack.triplist.pendingHint')}</div>}
                      <div className="tl-block-foot">
                        {entry.date ? (
                          <button type="button" className="tl-datebtn" onClick={(e) => { e.stopPropagation(); openAddDate(entry.tripId, entry.date); }}>
                            {entry.date}
                          </button>
                        ) : (
                          <button type="button" className="tl-datebtn" onClick={(e) => { e.stopPropagation(); openAddDate(entry.tripId); }}>
                            {t('pack.triplist.addDate')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="tl-divider" />

          {/* OPEN TRIPS — filter (region WCE + krajina), grid, pohorie+lokalita, meno+pes, dátum v rámiku, správa */}
          <div className="tl-section">
            <div className="tl-sechead">
              <h3>{t('pack.triplist.openTripsFromPack')}</h3>
              {/* #zbal/rozbal (Matej 1. 9. 2026: „možnosť vybrať si či sa mi to má zobrazovať
                  alebo nie") — vzor .tl-seeall, stav je VÝBER = priesvitný lapisový tint. */}
              <button type="button" className={`tl-seeall${openCollapsed ? ' on' : ''}`} onClick={toggleOpenCollapsed}>
                {openCollapsed ? t('pack.triplist.showOpenTrips') : t('pack.triplist.hideOpenTrips')}
              </button>
            </div>
            {openCollapsed ? (
              // Zbalené = jedna veta prečo je sekcia prázdna, nie tiché zmiznutie.
              <div className="tl-empty">{t('pack.triplist.openTripsHiddenHint')}</div>
            ) : (
            <>
            <div className="tl-filters">
              {(['all', 'W', 'C', 'E'] as const).map((k) => (
                <button key={k} type="button" className={`tl-filter${publicWCE === k ? ' on' : ''}`} onClick={() => setRegion(k)}>
                  {k === 'all' ? t('pack.triplist.allRegions') : WCE_LABEL[k]}
                </button>
              ))}
              <span className="tl-filter-sep" />
              <select className="tl-filter-sel" defaultValue="SK">
                <option value="SK">{t('pack.triplist.slovakiaOption')}</option>
                <option value="CZ" disabled>{t('pack.triplist.czechiaSoon')}</option>
                <option value="PL" disabled>{t('pack.triplist.polandSoon')}</option>
                <option value="AT" disabled>{t('pack.triplist.austriaSoon')}</option>
              </select>
            </div>
            {openCards.length === 0 ? (
              <div className="tl-emptybox">
                <span className="tl-empty">{t('pack.triplist.emptyOpenTrips')}</span>
                <button type="button" className="tl-emptybtn" onClick={() => navigate('/pack/add/trip')}>{t('pack.triplist.announceTrip')}</button>
              </div>
            ) : (
              <>
              <div className="tl-grid">
                {publicShown.map((c) => {
                  // `real` do lokálnej konštanty — TS si zúženie c.real do onClick closure neprenesie
                  const real = c.real;
                  const k = real ? requestKey(real.slug, real.organizerId) : '';
                  const st = real ? joinLabel(t, myRequests[k]) : null;
                  return (
                  <div
                    key={c.key}
                    className="tl-block"
                    onClick={() => navigate(tripPath(c.trail))}
                  >
                    <div className={`tl-block-cover${(c.trail.photos[0] ?? placeholderFor(c.trail.acts, c.trail.id)) ? '' : ' nophoto'}`} style={{ backgroundImage: `url('${c.trail.photos[0] ?? placeholderFor(c.trail.acts, c.trail.id)}')` }}>
                      {/* menovka organizátora NA FOTKE (nie modrý rám — mapová farba,
                          iný význam), vlajka preto uhýba doprava, viď .tl-flag--r. */}
                      <div className="tl-block-ownertag">
                        <span className="tl-block-avatar">{c.ownerInitial}</span>
                        <span>{c.ownerName}</span>
                      </div>
                      <img className="tl-flag tl-flag--r" src={flagUrl(trailCountry(c.trail))} alt="" loading="lazy" draggable={false} />
                      <span className="tl-block-badge looking">{c.joiners > 0 ? t('pack.triplist.lookingWithJoiners', { n: c.joiners }) : t('pack.triplist.statusLookingForPack')}</span>
                    </div>
                    <div className="tl-block-info">
                      <div className="tl-block-name">{c.trail.name}</div>
                      <div className="tl-block-sub">{c.trail.region} · {WCE_LABEL[trailWCE(c.trail)]}</div>
                      <div className="tl-block-foot">
                        {c.date ? <span className="tl-datepill">{c.date}</span> : <span className="tl-date">{t('pack.triplist.noDateYet')}</span>}
                      </div>
                      {real && st && (
                        <>
                          <button
                            type="button"
                            className={`tl-join${st.cls}`}
                            disabled={st.disabled || reqBusy === k}
                            onClick={(e) => { e.stopPropagation(); void onRequestJoin(real); }}
                          >{reqBusy === k ? '…' : st.label}</button>
                          {joinErr[k] && <div className="tl-joinerr">{joinErr[k]}</div>}
                        </>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
              {publicPageCount > 1 && (
                <div className="tl-pager">
                  <button type="button" className="tl-pagebtn" disabled={publicPage === 0} onClick={() => setPublicPage((p) => Math.max(0, p - 1))}>{t('pack.triplist.prevPage')}</button>
                  <span className="tl-pageinfo">{t('pack.triplist.pageInfo', { page: publicPage + 1, total: publicPageCount })}</span>
                  <button type="button" className="tl-pagebtn" disabled={publicPage >= publicPageCount - 1} onClick={() => setPublicPage((p) => Math.min(publicPageCount - 1, p + 1))}>{t('pack.triplist.nextPage')}</button>
                </div>
              )}
              </>
            )}
            </>
            )}
          </div>
        </div>
        )}
      </div>

      {dateTripId && (
        <div className="tl-overlay" onClick={() => setDateTripId(null)}>
          <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
            {/* BEZ KRÍŽIKA (lock 2026-08-28) — von sa ide klikom mimo alebo Esc. */}
            <div className="tl-modal-head">
              <div className="tl-modal-title">{t('pack.triplist.setDate')}</div>
            </div>
            <input type="date" className="tl-dateinput" value={dateValue} onChange={(e) => setDateValue(e.target.value)} />
            <button type="button" className="tl-modal-submit" onClick={saveDate}>{t('pack.triplist.saveDate')}</button>
          </div>
        </div>
      )}

      {/* #42 — KTO VIDÍ TENTO VÝLET. Text hovorí presne to, čo appka reálne vydá
          (`user_trips_read_open` + `get_trip_party`): trasa, dátum, pes. Matejovo rozhodnutie
          2026-07-30: presný dátum ostáva vonku, takže to musí byť aspoň POVEDANÉ. */}
      {visTripId && (() => {
        const entry = triplist[visTripId];
        const isOpen = entry?.openness === 'open';
        const trail = allTrails.find((tr) => tr.id === visTripId);
        const joiners = parties[visTripId]?.joiners.length ?? 0;
        const waiting = parties[visTripId]?.requests.length ?? 0;
        return (
          <div className="tl-overlay" onClick={() => setVisTripId(null)}>
            <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tl-modal-head">
                <div>
                  <div className="tl-modal-title">{t('pack.triplist.whoCanSee')}</div>
                  <div className="tl-sub" style={{ textAlign: 'left', marginTop: 4 }}>{trail?.name ?? visTripId}</div>
                </div>
              </div>
              <div className="tl-vis">
                <button type="button" className={`tl-vischoice${!isOpen ? ' on' : ''}`} onClick={() => setVisibility(visTripId, false)}>
                  <span className="tl-vischoice-ic">🔒</span>
                  <span>
                    <span className="tl-vischoice-t">{t('pack.triplist.private')}</span>
                    <span className="tl-vischoice-d">
                      {joiners > 0 ? t('pack.triplist.privateDescWithParty') : t('pack.triplist.privateDescSolo')}
                    </span>
                  </span>
                </button>
                <button type="button" className={`tl-vischoice${isOpen ? ' on' : ''}`} onClick={() => setVisibility(visTripId, true)}>
                  <span className="tl-vischoice-ic">🐾</span>
                  <span>
                    <span className="tl-vischoice-t">{t('pack.triplist.statusLookingForPack')}</span>
                    <span className="tl-vischoice-d">
                      {entry?.date ? t('pack.triplist.openDescWithDate', { date: entry.date }) : t('pack.triplist.openDescNoDate')}
                    </span>
                  </span>
                </button>
              </div>
              {waiting > 0 && !isOpen && (
                <div className="tl-sub" style={{ textAlign: 'left', marginTop: 12 }}>
                  {waiting === 1 ? t('pack.triplist.pendingRequestsOne', { n: waiting }) : t('pack.triplist.pendingRequestsMany', { n: waiting })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <PackBottomNav />
    </div>
  );
}
