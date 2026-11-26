import{v as r,aB as S,O as a,s as t,m as o,bg as ce,a1 as Y,a0 as f,bj as Te,a6 as Pe,a8 as P,bb as Ee,bd as Be,r as p,j as e,bp as pe,d as De}from"./index-DriUOdZL.js";import{b as Re,c as Oe,d as he,e as be,f as de,g as Me,h as Le,j as Ke}from"./PackLayout-B9RT_jMa.js";import{S as ze,d as qe}from"./SysIcon-CI9hudiL.js";import{c as ke,C as xe,a as je,T as Ue,d as _e,S as Ze,B as Ge,N as Fe}from"./sysSwap-DJ_4p3cJ.js";import{B as ve}from"./BackButton-8pSTwsJq.js";import{useMagnetPreview as Ve}from"./magnetPreview-DJ5RPtvA.js";import{u as He}from"./use-mobile-DA0IoUQv.js";import{h as we,p as me,j as We,m as ne,s as Ne,f as re,a as Je,t as Ye,l as Se,v as Xe,w as Qe,x as ea,y as aa,z as ta,A as ia,e as na,B as sa,d as ra,C as oa,D as la,E as da,b as ca,i as pa,P as xa,F as va,q as ma,c as ua}from"./vaultScrolls-DnI3miNU.js";import{V as ga}from"./circles-AGJD0c_9.js";const $e={play:"prehraj",chat:"komentar","chat-right-full":"komentar"},ue=({ic:i,off:h})=>$e[i]?e.jsx("i",{className:"zv-ic zv-ic--sys","aria-hidden":!0,style:{backgroundImage:`url(/icons/sys/${$e[i]}.webp)`,...h?{filter:"grayscale(1)",opacity:.55}:null}}):e.jsx("i",{className:"zv-ic","aria-hidden":!0,style:{WebkitMaskImage:`url(/icons/pack/${i}.svg)`,maskImage:`url(/icons/pack/${i}.svg)`}}),ha=(i,h)=>{var m;const v=(m=ga[i.world])==null?void 0:m[i.okruh-1];return v?h==="sk"||h==="cs"?v.sk:v.en:i.circle},ba={sk:{scroll:"Zvitok",min:"min",read:"Prečítať znalosť",listen:"Vypočuť podcast",pod:"Podcast",src:"Zdroje",sd:"Dôkaz",sdName:["","C · tradícia, skúsenosť, legenda","B · veda + výklad, alebo zatiaľ málo štúdií","A · zmerané, vedci sa zhodujú"],like:"Páči sa",del:"Zmazať",delAsk:"Zmazať komentár?",delNo:"Nechať",save:"Uložiť",share:"Zdieľať",talk:"Diskusia",readDone:"Prečítané",talkNone:"Zatiaľ tu nikto nenapísal. Začni ty — otázka, skúsenosť, nesúhlas.",talkPh:"Napíš do diskusie…",talkSend:"Pridať",you:"Ty",back:"Späť",added:"Doplnené",loading:"Načítavam zvitok",loadFail:"Zvitok sa nenačítal. Ťukni a skúsime to znova.",addedNone:"Zatiaľ nič nové. Keď pribudne poznatok, ktorý nie je v podcaste, zapíše sa sem s dátumom.",rel:"Súvisí",contrib:"Prispej",cEdit:"Navrhnúť zmenu",kinds:["Pridať novú znalosť k téme","Nahlásiť chybné tvrdenie","Vlastný text"],propPh:"Napíš, čo chýba alebo čo nesedí. Ak máš zdroj, pridaj odkaz.",propSend:"Odoslať AINUBISOVI",propOk:"Odoslané — AINUBIS to posúdi a overí zdroj.",photo:"Fotka",done:"Označiť ako prečítané",doneOk:"Zapísané do mozgu",copied:"Odkaz skopírovaný",tr:"Prepis",trHide:"Skryť prepis",other:"Iný jazyk",reqTitle:"Podcast v tvojom jazyku",reqText:"Základ je SK · EN · CZ. Iný jazyk vznikne, keď oň požiada prvý člen — potom ostane pre všetkých.",reqBtn:"Požiadať",reqOk:"Žiadosť zapísaná. Keď podcast vznikne, dáme ti vedieť."},cs:{scroll:"Svitek",min:"min",read:"Přečíst znalost",listen:"Poslechnout podcast",pod:"Podcast",src:"Zdroje",sd:"Důkaz",sdName:["","C · tradice, zkušenost, legenda","B · věda + výklad, nebo zatím málo studií","A · změřeno, vědci se shodují"],like:"Líbí se",del:"Smazat",delAsk:"Smazat komentář?",delNo:"Nechat",save:"Uložit",share:"Sdílet",talk:"Diskuse",readDone:"Přečteno",talkNone:"Zatím tu nikdo nenapsal. Začni ty — otázka, zkušenost, nesouhlas.",talkPh:"Napiš do diskuse…",talkSend:"Přidat",you:"Ty",back:"Zpět",added:"Doplněno",loading:"Načítám svitek",loadFail:"Svitek se nenačetl. Ťukni a zkusíme to znovu.",addedNone:"Zatím nic nového. Když přibude poznatek, který není v podcastu, zapíše se sem s datem.",rel:"Souvisí",contrib:"Přispěj",cEdit:"Navrhnout změnu",kinds:["Přidat novou znalost k tématu","Nahlásit chybné tvrzení","Vlastní text"],propPh:"Napiš, co chybí nebo co nesedí. Pokud máš zdroj, přidej odkaz.",propSend:"Odeslat AINUBISOVI",propOk:"Odesláno — AINUBIS to posoudí a ověří zdroj.",photo:"Fotka",done:"Označit jako přečtené",doneOk:"Zapsáno do mozku",copied:"Odkaz zkopírován",tr:"Přepis",trHide:"Skrýt přepis",other:"Jiný jazyk",reqTitle:"Podcast ve tvém jazyce",reqText:"Základ je SK · EN · CZ. Jiný jazyk vznikne, když o něj požádá první člen — pak zůstane pro všechny.",reqBtn:"Požádat",reqOk:"Žádost zapsána. Až podcast vznikne, dáme ti vědět."},en:{scroll:"Scroll",min:"min",read:"Read the knowledge",listen:"Listen to the podcast",pod:"Podcast",src:"Sources",sd:"Evidence",sdName:["","C · tradition, experience, legend","B · science + interpretation, or few studies yet","A · measured, scientists agree"],like:"Like",del:"Delete",delAsk:"Delete comment?",delNo:"Keep",save:"Save",share:"Share",talk:"Discussion",readDone:"Read",talkNone:"Nobody has written here yet. Start — a question, an experience, a disagreement.",talkPh:"Write to the discussion…",talkSend:"Post",you:"You",back:"Back",added:"Added",loading:"Loading the scroll",loadFail:"The scroll did not load. Tap to try again.",addedNone:"Nothing new yet. When a finding that is not in the podcast arrives, it is written here with a date.",rel:"Related",contrib:"Contribute",cEdit:"Suggest a change",kinds:["Add new knowledge to the topic","Report a wrong claim","Own text"],propPh:"Write what is missing or wrong. If you have a source, add the link.",propSend:"Send to AINUBIS",propOk:"Sent — AINUBIS will review it and check the source.",photo:"Photo",done:"Mark as read",doneOk:"Written into the brain",copied:"Link copied",tr:"Transcript",trHide:"Hide transcript",other:"Other language",reqTitle:"Podcast in your language",reqText:"The base is SK · EN · CZ. Another language is made when the first member asks for it — then it stays for everyone.",reqBtn:"Request",reqOk:"Request saved. We will let you know when the podcast is ready."}},se=i=>ba[ma(i)],oe=["","C","B","A"],Ba=`
${Pe}
:root{--zv-read:rgb(${P.read});}
/* KRÚŽOK STAVU — biely obrys · plný oranžový (videné) · zelený s ✓ (hotovo). Farby BRAIN_STATE. */
.zv-tip{position:absolute;z-index:5;width:240px;padding:${t.sm}px ${t.md}px;border-radius:${o.tile}px;
  background:${a.surfaceBase};border:1px solid ${a.edge};color:${a.ink};text-align:left;
  font:400 ${r.label}px/1.5 ${f};letter-spacing:0;text-transform:none;pointer-events:none;
  opacity:0;transition:opacity 150ms ease;}
/* AKCIE — pod obrazom na PC aj mobile (Matej 3. 10.) */
.zv-acts{display:flex;align-items:center;justify-content:space-around;margin-top:${t.sm}px;
  padding:${t.xs}px ${t.sm}px;border-radius:${o.pill}px;background:${a.surface};border:1px solid ${a.edge};}
/* AKCIE = JEDNA PILULKA cez celú šírku obrazu, ikonky ako na IG (Matej 3. 10.: „do jedného pilu… roztiahnuť po celej
   šírke obrázka… nefarbiť krúžky, iba ikonky"). Bez krúžkov a výplní — farbu nesie len ikonka; zapnutá = farebná. */
.zv-act{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:${t.xs}px;
  min-width:44px;height:36px;padding:0 ${t.sm}px;border-radius:${o.pill}px;cursor:pointer;
  background:none;border:0;color:${a.ink};font:500 ${r.label}px ${f};transition:color 150ms ease;}
/* FARBY IKONIEK — Matej 3. 10.: „labka cyan neónová žiariaca, hviezdička žltá“. Komentár je od 26. 10. svetlý
   (ružová nebola v palete AINUBISA) a zdieľanie zmizlo — DOGSCROLL = ten istý blok ako zvitok vo FEEDe
   (Matej 26. 10.: „zjednoťme, je to vlastne to isté, len v inom priečinku“). Zapnutá akcia = ikonka žiari. */
.zv-act{opacity:.9;}
.zv-act:hover{opacity:1;}
.zv-act[data-k="like"]{color:${a.cyan};filter:drop-shadow(0 0 2px rgba(${a.cyanRGB},0.4));}
.zv-act[data-k="save"]{color:${a.ctaA};}
.zv-act[data-k="talk"]{color:${a.ink};}
/* Žiara len jemná (Matej 4. 10.: „nerob takú žiaru na ikonkách, packa je celá rozmazaná“). */
.zv-act.is-on{opacity:1;filter:drop-shadow(0 0 3px rgba(${a.cyanRGB},0.35));}
.zv-act .zv-ic{margin-right:0;width:20px;height:20px;}
.zv-n{font:500 ${r.label}px ${f};color:${a.ink};min-width:1ch;}
/* SILA DÔKAZU */
.zv-sd{position:relative;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex:0 0 auto;
  border-radius:${o.field}px;font:600 ${r.lead}px ${f};cursor:help;
  color:var(--zv-g);border:1px solid var(--zv-g);background:var(--zv-gt);}
.zv-sd[data-g="A"]{--zv-g:rgb(${P.read});--zv-gt:rgba(${P.read},0.14);}
.zv-sd[data-g="B"]{--zv-g:rgb(${P.seen});--zv-gt:rgba(${P.seen},0.14);}
.zv-sd[data-g="C"]{--zv-g:${a.inkDim};--zv-gt:${a.surface};}
.zv-sd .zv-tip{top:36px;left:0;}
.zv-tip b{font-weight:600;}
.zv-sd--corner{position:absolute;top:0;right:0;z-index:3;width:44px;height:44px;font-size:${r.h2}px;
  border-width:0 0 1px 1px;border-radius:0 ${o.card-1}px 0 ${o.tile}px;}
/* Známka je NEPRIEHĽADNÁ (Matej 5. 10.: „nesmie byť priesvitná") — tint leží na plnom podklade. */
.zv-sd{background:linear-gradient(var(--zv-gt),var(--zv-gt)),${a.surfaceBase};}
/* Na karte v zozname sedí v textovom bloku: mobil = roh pri nadpise, PC = roh karty. */
.akv-zvt{position:relative;align-self:stretch;}
.akv-zvt > .zv-sd--corner{border-width:1px;border-radius:${o.field}px;}
.zv-sd--corner .zv-tip{top:52px;left:auto;right:0;}
.zv-sd:hover .zv-tip,.zv-sd:focus-visible .zv-tip{opacity:1;}
/* Známka v riadku nadnadpisu (Matej 23. 11. 2026: „z rohu preč lebo zavadzia obrázku… do riadku kde je hlavička — svet, zvitok, minúty“): pilulka v tom istom rade. */
.zv-sd--pill{display:inline-flex;vertical-align:middle;width:auto;min-width:${t.lg+t.sm}px;height:${t.lg+t.xs}px;padding:0 ${t.sm}px;margin-left:${t.sm}px;
  border-radius:${o.pill}px;font-size:${r.label}px;line-height:1;letter-spacing:0;}
.zv-sd--pill .zv-tip{top:${t.xl}px;left:0;}
.zv-read{align-self:stretch;display:flex;align-items:center;justify-content:center;gap:${t.sm}px;cursor:pointer;
  padding:${t.sm}px ${t.lg}px;border-radius:${o.field}px;background:${a.surface};
  border:1px solid ${a.edgeStrong};color:${a.ink};font-family:${Y};font-weight:700;
  font-size:${r.label}px;letter-spacing:${S.card.letterSpacing};text-transform:uppercase;}
.zv-read:hover{border-color:${a.cyan};}
/* HOTOVO = PLNÁ zelená s tmavým inkoustom (Matej: „treba viac zvýrazniť, teraz je to prehliadnuteľné“). */
.zv-read.is-done{background:var(--zv-read);border-color:var(--zv-read);color:#03140A;outline:3px solid rgba(${P.read},0.28);outline-offset:2px;}
.zv-badge{display:inline-flex;align-items:center;gap:${t.xs}px;padding:${t.xs}px ${t.md}px;border-radius:${o.pill}px;
  background:var(--zv-read);color:#03140A;font:600 ${r.label}px ${f};letter-spacing:${S.card.letterSpacing};text-transform:uppercase;
  outline:3px solid rgba(${P.read},0.28);outline-offset:2px;}
/* NÁHĽAD /magnet — zvitok mimo darčeka: viditeľný, stlmený, so zámkom z kitu. */
.akv-zv--locked .akv-zvimg img{filter:saturate(.55) brightness(.7);}
.akv-zv--locked .zv-read{border-style:dashed;color:${a.inkDim};}
.zv-lockbadge{position:absolute;top:${t.sm}px;left:${t.sm}px;z-index:2;display:inline-flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:${o.pill}px;background:${a.surfaceBase};border:1px solid ${a.ctaEdge};color:${a.ctaA};}
/* ČIARA POD NADPISOM — zlatá niť AINUBISA, ktorá doznie do tmy (Matej: „chýba vizuál… pod nadpisom línia"). */
.zv-rule{display:block;height:2px;width:100%;max-width:160px;border-radius:${o.pill}px;
  background:linear-gradient(90deg, ${a.ctaA} 0%, ${a.ctaB} 40%, transparent 100%);}
.zv-mid{align-self:stretch;display:flex;flex-direction:column;align-items:flex-start;gap:${t.sm}px;}
.zv-mid > *{align-self:stretch;}
.zv-ctas{align-self:stretch;display:flex;flex-direction:column;gap:${t.sm}px;}
.zv-ctas .akv-zvsec{flex:none;}
.zv-hl{display:flex;align-items:flex-start;gap:${t.sm}px;}
.zv-hl > :first-child{flex:1 1 auto;min-width:0;}
/* „Vezmi si z toho" — blok bez nadpisu (Matej: „nechaj to v bloku"), menšie písmo. */
.zv-take{align-self:stretch;padding:${t.sm}px ${t.md}px;border-radius:${o.tile}px;
  background:${a.ctaTint};border-left:2px solid ${a.ctaA};
  font-size:${r.label}px;line-height:1.5;color:${a.ink};font-style:italic;}
/* Kurzíva — Matej 3. 10.: „nech je to trošku zaujímavejšie“. ⚠️ Space Grotesk kurzívu nemá, prehliadač ju šikmí sám. */

/* ── ČLÁNOK ZVITKU (kôš 2) ── */
.zv-veil{position:fixed;inset:0;z-index:39;overflow-y:auto;-webkit-overflow-scrolling:touch;
  background:${a.surfaceBase};color:${a.ink};font-family:${f};}
/* SCI-FI DOSKA (Matej 4. 10.: „pozadie nie len tmavé, ale blok z liquid skla a za tým jemné mriežky ako má AINUBIS,
   nech to vytvorí 3D efekt sci-fi informácií"). Mriežka = tá istá ako .akv-bg v PackAinubis; stojí FIXNE, sklo nad ňou
   scrolluje ⇒ hĺbka. Sklo = SKLENENÁ DOSKA .pk-stage (STAGE_CSS, katalóg) vo farbe AINUBISA cez --pk-stage;
   AI_GLASS nie — má plnú výplň a mriežku by zakryl. */
.zv-bg{position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(${a.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${a.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(rgba(${a.cyanRGB},0.10) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${a.cyanRGB},0.10) 1px,transparent 1px);
  background-size:24px 24px,24px 24px,192px 192px,192px 192px;}
.zv-bg::after{content:'';position:absolute;inset:0;
  background:radial-gradient(60vw 60vw at 85% 10%,rgba(${a.cyanRGB},0.14),transparent 62%),
             radial-gradient(55vw 55vw at 10% 95%,rgba(${a.glowRGB},0.12),transparent 62%);}
/* ŠÍRKA = článok výletu (Matej 4. 10.: „detail zvitku by mal byť takej istej šírky ako je trip blog") —
   ten istý stĺpec PACK_COL_FIT + packColCSS ako .pta-shell, nie vlastných 880. */
/* APPKA 24. 10. 2026: vrch dosky pod hodinami (Matej: „pri zvitku nevidím šípku naspäť, je až za hranou obrazovky“). Web: safe-area 0. */
.zv-wrap{position:relative;z-index:1;${Ee}margin:calc(env(safe-area-inset-top,0px) + ${t.lg}px) auto calc(var(--pack-nav-h, 112px) + var(--pod-dock, 0px) + ${t.xl}px);
  padding:${t.lg}px ${t.lg}px ${t.xl}px;box-shadow:${a.panelShadow};
  --pk-stage:linear-gradient(180deg,rgba(${a.cyanRGB},0.07) 0%,rgba(4,8,14,0.55) 22%,rgba(4,8,14,0.62) 100%);
  --pk-stage-edge:${a.edge};}
${Be(".zv-wrap")}
@media (max-width:767px){.zv-wrap{margin-top:calc(env(safe-area-inset-top,0px) + ${t.md}px);margin-bottom:calc(var(--pack-nav-h, 112px) + var(--pod-dock, 0px) + ${t.lg}px);padding:${t.md}px;}}
@media (min-width:768px){.zv-wrap{padding:${t.xl}px;}}
.zv-back{margin-bottom:${t.md}px;}
/* MOBIL = ZVITOK NA CELÚ ŠÍRKU + LEPIACA HLAVIČKA so šípkou a upozorneniami (Matej 1. 11. 2026: „dať obsah po celej šírke",
   „vždy možnosť vrátiť sa = sticky header"; PC ostáva blok). Ikonky biele ako na obrazovke AINUBISa. */
.zv-bar{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;
  padding:calc(env(safe-area-inset-top,0px) + ${t.sm}px) ${t.md}px ${t.sm}px;background:${a.surfaceBase};}

@media (max-width:767px){
  .zv-wrap.pk-stage{width:100%;max-width:none;margin-top:0;border:0;border-radius:0;box-shadow:none;}
  .zv-wrap .zv-back{display:none !important;}
}
.zv-top{display:grid;grid-template-columns:1fr;gap:${t.lg}px;}
@media (min-width:768px){.zv-top{grid-template-columns:280px 1fr;}}
.zv-hero img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${o.tile}px;}
.zv-head{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:${t.lg}px;min-width:0;
  padding:${t.lg}px;border-radius:${o.card}px;${ce}}
/* Pravá časť je JEDEN blok (Matej 4. 10.: „pravú časť vedľa obrázka dať do bloku a lepšie poukladať, teraz je to rozhádzané").
   Skupiny oddeľuje tenká čiara, podcast sedí na dne bloku. */
.zv-head > .zv-grp + .zv-grp{padding-top:${t.lg}px;border-top:1px solid ${a.edge};}
.zv-head > .zv-pod{margin-top:auto;}
/* miesto pre známku v rohu: meta aj nadpis nesmú vbehnúť pod ňu */
.zv-head .zv-meta,.zv-head .zv-h{padding-right:0;}
.zv-grp{display:flex;flex-direction:column;align-items:flex-start;gap:${t.md}px;}
/* PC: úvod sa rozloží po výške obrazu — nadpis hore, veta s blokom v strede, podcast dole
   (Matej 3. 10.: „úvod sa mi na PC nepáči, vyzerá to natlačené na sebe"). */
@media (min-width:768px){.zv-head{padding:${t.xl}px;}}
.zv-meta{font-size:${r.micro}px;letter-spacing:${S.section.letterSpacing};text-transform:uppercase;color:${a.cyan};padding-right:${t.xl}px;}
.zv-h{margin:0;font-family:${Y};font-weight:700;font-size:${r.h2}px;line-height:1.2;
  letter-spacing:${S.card.letterSpacing};text-transform:uppercase;overflow-wrap:anywhere;}
.zv-v{margin:0;font-size:${r.body}px;line-height:1.6;color:${a.inkDim};}
/* PODCAST — cyan NEÓN (Matej 3. 10.: „podcast by som dal cyanom neónom tam, kde sa prehráva"). Žiara cez
   filter (box-shadow by zhodil check:pack); keď hrá, rozsvieti sa naplno. */
.zv-pod{align-self:stretch;padding:${t.md}px;border-radius:${o.card}px;background:${a.raised};
  border:1px solid ${a.cyan};filter:drop-shadow(0 0 6px rgba(${a.cyanRGB},0.45));transition:filter 200ms ease;}
.zv-pod.is-play{filter:drop-shadow(0 0 14px rgba(${a.cyanRGB},0.85));}
.zv-pod small{display:flex;align-items:center;gap:${t.xs}px;margin-bottom:${t.sm}px;
  font:600 ${r.label}px ${f};letter-spacing:${S.card.letterSpacing};text-transform:uppercase;color:${a.cyan};}
/* hlavička podcastu: názov vľavo, jazyky vpravo (Matej 4. 10.: „pri tlačidle prehrať výber jazykov") */
.zv-pod small{justify-content:space-between;flex-wrap:wrap;}
.zv-pod small > span{display:inline-flex;align-items:center;gap:${t.xs}px;}
/* Jazyk = rozbaľovač (Matej 4. 10.: „jazyk daj do dropdownu, podľa jazyka člena, posledná možnosť pridať iný jazyk, vedľa prepis"). */
.zv-ptools{flex:none;display:inline-flex;align-items:center;gap:${t.sm}px;}
.zv-plang{flex:none;cursor:pointer;padding:${t.xs}px ${t.xl}px ${t.xs}px ${t.md}px;
  border-radius:${o.pill}px;background:${a.raised} no-repeat right ${t.sm}px center / 10px 10px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M1 3l4 4 4-4' fill='none' stroke='%235BE0F0' stroke-width='1.6'/%3E%3C/svg%3E");
  border:1px solid ${a.cyan};color:${a.cyan};font:700 ${r.label}px ${f};letter-spacing:.02em;}
.zv-pdd{position:relative;display:inline-flex;}
.zv-pmenu{position:absolute;top:calc(100% + ${t.xs}px);right:0;z-index:6;display:flex;flex-direction:column;min-width:160px;
  padding:${t.xs}px;border-radius:${o.tile}px;background:${a.surfaceBase};border:1px solid ${a.edgeStrong};}
.zv-pmenu button{padding:${t.sm}px ${t.md}px;border-radius:${o.field}px;cursor:pointer;text-align:left;background:transparent;
  border:0;color:${a.ink};font:500 ${r.body}px ${f};letter-spacing:0;text-transform:none;}
.zv-pmenu button:hover,.zv-pmenu button.is-on{background:${a.raised};color:${a.cyan};}
.zv-pmenu .zv-padd{margin-top:${t.xs}px;border-top:1px solid ${a.edge};border-radius:0 0 ${o.field}px ${o.field}px;color:${a.inkDim};}
.zv-ptr{padding:${t.xs}px ${t.md}px;border-radius:${o.pill}px;cursor:pointer;background:transparent;
  border:1px solid ${a.edge};color:${a.inkDim};font:500 ${r.label}px ${f};text-transform:none;letter-spacing:0;}
.zv-ptr.is-on{border-color:${a.cyan};color:${a.cyan};}
/* PREHRÁVAČ — vlastný, cyan neón s tmavým ovládaním (Matej 4. 10.: „sivý blok prehrávača… výplň cyanová/neónová,
   text a čísla tmavé ako pozadie“). Natívne ovládanie prehliadača sa farbiť nedá. */
.zv-player{display:flex;align-items:center;gap:${t.md}px;padding:${t.sm}px ${t.md}px;border-radius:${o.pill}px;
  background:${a.cyan};color:${a.bgDeep};filter:drop-shadow(0 0 8px rgba(${a.cyanRGB},0.55));}
.zv-pbtn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:${o.pill}px;
  cursor:pointer;background:${a.bgDeep};color:${a.cyan};border:0;padding:0;}
.zv-pbtn .zv-ic{margin:0 0 0 2px;width:16px;height:16px;}
.zv-pause{display:inline-flex;gap:4px;}
.zv-pause i{display:block;width:4px;height:14px;border-radius:${o.pill}px;background:currentColor;}
.zv-ptime{flex:none;font:600 ${r.label}px ${f};font-variant-numeric:tabular-nums;}
.zv-pbar{flex:1 1 auto;min-width:0;height:6px;margin:0;cursor:pointer;-webkit-appearance:none;appearance:none;border-radius:${o.pill}px;
  background:linear-gradient(90deg, ${a.bgDeep} var(--p,0%), rgba(0,0,0,0.22) var(--p,0%));}
.zv-pbar::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:${o.pill}px;background:${a.bgDeep};border:0;}
.zv-pbar::-moz-range-thumb{width:14px;height:14px;border-radius:${o.pill}px;background:${a.bgDeep};border:0;}
/* GALÉRIA — klik na obraz otvorí väčší a so šípkami aj obrazy z článku (Matej 4. 10.). */
.zv-hero img{cursor:zoom-in;}
.zv-gal{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;gap:${t.md}px;
  padding:${t.xxxl}px ${t.lg}px;background:rgba(1,5,10,0.94);}
.zv-gal img{display:block;max-width:min(100%, 640px);max-height:calc(100dvh - 140px);object-fit:contain;border-radius:${o.tile}px;}
.zv-gal figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:${t.sm}px;max-height:100%;min-width:0;}
.zv-gal figcaption{font-size:${r.label}px;color:${a.inkFaint};}
.zv-gnav{flex:none;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:${o.pill}px;cursor:pointer;
  background:${a.raised};border:1px solid ${a.edgeStrong};color:${a.cyan};}
.zv-gnav:disabled{opacity:.3;cursor:default;}
.zv-gback{position:absolute;top:calc(env(safe-area-inset-top,0px) + ${t.lg}px);left:${t.lg}px;}
@media (max-width:767px){.zv-gal{padding:${t.xxxl}px ${t.sm}px;}.zv-gnav{position:absolute;bottom:${t.lg}px;}
  .zv-gnav--prev{left:calc(50% - 56px);}.zv-gnav--next{right:calc(50% - 56px);}}
.zv-tr{margin-top:${t.md}px;max-height:360px;overflow-y:auto;padding-right:${t.sm}px;
  font-size:${r.body}px;line-height:1.6;color:${a.inkDim};}
.zv-tr p{margin:0 0 ${t.sm}px;}
.zv-tr b{display:inline-block;min-width:72px;font:700 ${r.micro}px ${f};letter-spacing:.02em;text-transform:uppercase;color:${a.inkFaint};}
.zv-tr b.is-ai{color:${a.ink};}
.zv-tr b.is-ai span{color:${a.aiInk};}
.zv-req{margin-top:${t.md}px;font-size:${r.label}px;line-height:1.5;color:${a.inkDim};}
.zv-req > div{display:flex;gap:${t.sm}px;margin-top:${t.sm}px;}
.zv-req select{flex:1 1 auto;min-width:0;padding:${t.sm}px;border-radius:${o.field}px;background:${a.bgDeep};
  border:1px solid ${a.edge};color:${a.ink};font:500 ${r.body}px ${f};}
.zv-req button{flex:none;padding:${t.sm}px ${t.lg}px;border-radius:${o.field}px;cursor:pointer;
  background:${a.raised};border:1px solid ${a.cyan};color:${a.cyan};font:600 ${r.label}px ${f};
  letter-spacing:${S.card.letterSpacing};text-transform:uppercase;}
.zv-req .zv-ok{margin-top:${t.sm}px;}
/* ČLENITOSŤ PRÍBEHU (Matej 4. 10.: „chýba rozmanitosť odsekov, roky, odrážky… obrázky, ktoré sme nepoužili")
   — značky v príbehu d: ◷ ROK | text = časová os · » = zvýraznený fakt · ▣ B | popis = nepoužitý obraz. */
.zv-yr{color:${a.ctaA};font-weight:600;}
.zv-tl{list-style:none;margin:${t.xl}px 0;padding:0 0 0 ${t.lg}px;border-left:2px solid ${a.ctaEdge};}
.zv-tl li{position:relative;margin:0 0 ${t.lg}px;}
.zv-tl li:last-child{margin-bottom:0;}
.zv-tl li::before{content:'';position:absolute;left:-${t.lg+6}px;top:4px;width:10px;height:10px;border-radius:${o.pill}px;background:${a.ctaA};}
.zv-tl b{display:block;font:600 ${r.label}px ${f};letter-spacing:${S.card.letterSpacing};text-transform:uppercase;color:${a.ctaA};}
.zv-tl span{display:block;font-size:${r.body}px;line-height:1.6;}
.zv-fact{margin:${t.xl}px 0;padding:${t.sm}px 0 ${t.sm}px ${t.lg}px;border-left:2px solid ${a.ctaA};
  font:600 ${r.h2}px/1.45 ${f};color:${a.ink};}
.zv-fig{margin:${t.xl}px auto;max-width:420px;}
.zv-fig img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${o.tile}px;border:1px solid ${a.edge};}
.zv-fig figcaption{margin-top:${t.sm}px;font-size:${r.label}px;line-height:1.5;color:${a.inkFaint};text-align:center;}
.zv-body{margin-top:${t.xl}px;max-width:760px;font-size:${r.lead}px;line-height:1.75;font-weight:300;color:${a.inkDim};}
/* Tenší rez 300 (Matej 4. 10.: „písmo celého textu sa mi zdá dosť hrubé… nebolo by čitateľnejšie tenšie?"). Space Grotesk je načítaný 300–600. */
.zv-body b,.zv-body strong{font-weight:600;color:${a.ink};}
.zv-body p{margin:0 0 ${t.md}px;}
.zv-body ul{margin:0 0 ${t.lg}px;padding-left:${t.xl}px;list-style:disc;}
.zv-body ul li{margin-bottom:${t.sm}px;}
.zv-body ul li::marker{color:${a.ctaA};}
.zv-box{margin-top:${t.lg}px;padding:${t.md}px ${t.lg}px ${t.lg}px;border-radius:${o.card}px;${ce}
  border-top:2px solid var(--zv-bx, ${a.cyan});}
.zv-box .zv-sec{margin-top:${t.xs}px;font-size:${r.lead}px;color:var(--zv-bx, ${a.cyan});
  background:linear-gradient(90deg, var(--zv-bx, ${a.cyan}) 0%, transparent 60%) left bottom / 100% 1px no-repeat;}
.zv-box--src{--zv-bx:${a.ctaA};}
/* TRIEDA DÔKAZU — tri riadky A·B·C, svieti trieda tohto zvitku (Matej 23. 11. 2026: „musíme to lepšie vysvetliť,
   dáme do bloku 3 riadky A: B: C: a vysvietený ten tier, ktorý je zvitok“). Farby = tie isté ako známka. */
.zv-box--sd{--zv-bx:${a.cyan};}
.zv-box--sd .zv-sdl{display:flex;flex-direction:column;gap:${t.xs}px;margin:0;padding:0;list-style:none;}
.zv-box--sd .zv-sdl li{margin:0;}
.zv-sdl li{display:flex;align-items:center;gap:${t.sm}px;padding:${t.xs}px ${t.sm}px;border-radius:${o.tile}px;
  border:1px solid transparent;font-size:${r.label}px;line-height:1.35;color:${a.inkDim};}
.zv-sdl li b{flex:0 0 auto;width:24px;text-align:center;font-weight:600;color:${a.inkDim};}
.zv-sdl li[data-g="A"]{--zv-g:rgb(${P.read});--zv-gt:rgba(${P.read},0.14);}
.zv-sdl li[data-g="B"]{--zv-g:rgb(${P.seen});--zv-gt:rgba(${P.seen},0.14);}
.zv-sdl li[data-g="C"]{--zv-g:${a.ink};--zv-gt:${a.surface};}
.zv-sdl li.is-on{border-color:var(--zv-g);background:var(--zv-gt);color:${a.ink};}
.zv-sdl li.is-on b{color:var(--zv-g);}
.zv-box--add{--zv-bx:${a.aiInk};}
.zv-box--you{--zv-bx:${a.danger};filter:drop-shadow(0 0 10px ${a.dangerEdge});}
/* NAVRHNÚŤ ZMENU — červené podsvietenie (Matej 3. 10.), po kliku tri druhy návrhu + text. */
.zv-prop{display:inline-flex;align-items:center;gap:${t.sm}px;cursor:pointer;padding:${t.sm}px ${t.lg}px;
  border-radius:${o.field}px;background:${a.dangerTint};border:1px solid ${a.danger};color:${a.danger};
  font:600 ${r.label}px ${f};letter-spacing:${S.card.letterSpacing};text-transform:uppercase;}
.zv-prop.is-open{background:${a.danger};color:${a.ctaInk};}
.zv-kinds{display:flex;flex-wrap:wrap;gap:${t.sm}px;margin:${t.md}px 0;}
.zv-kind{padding:${t.xs}px ${t.md}px;border-radius:${o.pill}px;cursor:pointer;background:transparent;
  border:1px solid ${a.dangerEdge};color:${a.ink};font:500 ${r.label}px ${f};}
.zv-kind.is-on{background:${a.dangerTint};border-color:${a.danger};color:${a.danger};}
.zv-ok{margin-top:${t.md}px;font-size:${r.label}px;color:${a.ok};}
/* komentár: labka s počtom + fotka */
.zv-cmt > div{flex:1 1 auto;min-width:0;}
.zv-cimg{display:block;max-width:100%;max-height:320px;margin-top:${t.sm}px;border-radius:${o.tile}px;}
.zv-clike{display:inline-flex;align-items:center;gap:${t.xs}px;margin-top:${t.xs}px;padding:0;cursor:pointer;
  background:none;border:0;color:${a.inkDim};font:500 ${r.label}px ${f};}
.zv-clike.is-on{color:${a.cyan};}
.zv-cdel{display:inline-flex;align-items:center;gap:${t.xs}px;padding:0;cursor:pointer;background:none;border:0;color:inherit;opacity:.7;font:500 ${r.label}px ${f};}
.zv-cdel.is-go{color:${a.cyan};opacity:1;}
.zv-cdel-ask{display:inline-flex;align-items:center;gap:${t.sm}px;font:500 ${r.label}px ${f};}
.zv-clike .zv-ic{margin-right:0;width:16px;height:16px;}
.zv-crow{display:flex;align-items:center;justify-content:space-between;align-self:stretch;gap:${t.sm}px;}
.zv-cpic{display:inline-flex;align-items:center;gap:${t.xs}px;cursor:pointer;color:${a.cyan};font:500 ${r.label}px ${f};}
.zv-cpic input{display:none;}
.zv-cprev{max-height:80px;border-radius:${o.field}px;}
.zv-box--talk{--zv-bx:${a.cyan};}
.zv-cmt{display:flex;gap:${t.sm}px;padding:${t.sm}px 0;border-bottom:1px solid ${a.edge};font-size:${r.body}px;}
.zv-cmt p{margin:${t.xs}px 0 0;color:${a.inkDim};}
.zv-cmt small{color:${a.inkFaint};font-size:${r.micro}px;}
.zv-cav{width:28px;height:28px;flex:0 0 auto;border-radius:${o.pill}px;display:flex;align-items:center;justify-content:center;
  background:${a.raised};border:1px solid ${a.edge};font-size:${r.label}px;}
.zv-cav img{width:100%;height:100%;object-fit:cover;border-radius:inherit;}
.zv-cform{display:flex;flex-direction:column;align-items:flex-end;gap:${t.sm}px;margin-top:${t.md}px;}
.zv-cform textarea{align-self:stretch;resize:vertical;min-height:64px;padding:${t.sm}px ${t.md}px;border-radius:${o.field}px;
  background:${a.surface};border:1px solid ${a.edge};color:${a.ink};font:400 ${r.body}px ${f};}
.zv-cform textarea:focus{outline:none;border-color:${a.edgeStrong};}
.zv-chip:disabled{opacity:.5;cursor:default;}
/* NADPISY ČLÁNKU — Matej 3. 10.: „tie nadpisy modré sú malinké, nevýrazné… ľahko sa prehliadnu“.
   Tvar KARTY z PACK_HEAD (Cinzel 700/.14em), stupeň h2 20 px, svetlý inkoust + zlatá niť pod ním. */
.zv-sec{margin:${t.xxl}px 0 ${t.md}px;padding-bottom:${t.sm}px;font-family:${Y};font-weight:700;
  font-size:${r.h2}px;line-height:1.25;letter-spacing:${S.card.letterSpacing};text-transform:uppercase;color:${a.ink};
  background:linear-gradient(90deg, ${a.ctaA} 0%, ${a.ctaB} 25%, transparent 60%) left bottom / 100% 2px no-repeat;}
.zv-add{padding:${t.sm}px ${t.md}px;border-left:2px solid ${a.cyan};border-radius:0 ${o.tile}px ${o.tile}px 0;
  background:${a.raised};font-size:${r.label}px;color:${a.inkDim};}
.zv-src{margin:0;padding-left:${t.lg}px;font-size:${r.label}px;line-height:1.55;color:${a.inkDim};}
.zv-src li{margin-bottom:${t.xs}px;}
.zv-src a{color:${a.cyan};}
.zv-rel{display:flex;flex-wrap:wrap;gap:${t.sm}px;}
.zv-chip{padding:${t.sm}px ${t.md}px;border-radius:${o.field}px;cursor:pointer;
  background:transparent;border:1px solid ${a.edge};color:${a.cyan};font:500 ${r.label}px ${f};}
.zv-chip:hover{border-color:${a.edgeStrong};}
.zv-chip--dash{border-style:dashed;}
/* ZAPÍŠ DO MOZGU — hlavné CTA článku (Matej 3. 10.: „výraznejšie a krajšie, nech je ho vidno“).
   Plná plocha AINUBISOVHO CTA; po zápise sa prefarbí na zelenú BRAIN_STATE.read = to, čo sa stane v mozgu. */
.zv-done{display:flex;flex-direction:column;align-items:center;gap:${t.xs}px;width:100%;margin-top:${t.xl}px;
  padding:${t.lg}px ${t.xl}px;cursor:pointer;text-align:center;border-radius:${o.card}px;
  background:${a.ctaGrad};border:1px solid ${a.ctaEdge};color:${a.ctaInk};box-shadow:${a.ctaShadow};
  transition:transform 150ms ease;}
.zv-done:hover{transform:translateY(-1px);background:${a.ctaGradHover};}
.zv-done b{display:flex;align-items:center;gap:${t.sm}px;font:700 ${r.lead}px ${Y};
  letter-spacing:${S.card.letterSpacing};text-transform:uppercase;}
.zv-done small{font-size:${r.label}px;opacity:.8;}
.zv-done.is-done{background:var(--zv-read);border-color:var(--zv-read);color:#03140A;cursor:default;transform:none;}
.zv-ic{display:inline-block;width:14px;height:14px;vertical-align:-2px;margin-right:${t.xs}px;background:currentColor;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain;}
.zv-ic--sys{-webkit-mask:none;mask:none;background-color:transparent;background-size:contain;background-position:center;background-repeat:no-repeat;transform:scale(1.3);}
.zv-chip svg{vertical-align:-2px;margin-right:${t.xs}px;}
.zv-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--pack-nav-h, 112px) + var(--pod-dock, 0px) + ${t.md}px);z-index:41;
  padding:${t.sm}px ${t.md}px;border-radius:${o.pill}px;background:${a.surfaceBase};
  border:1px solid ${a.edge};font-size:${r.label}px;color:${a.ink};}
`,Da=`
.akv-zvh{text-align:center;font-size:${r.micro}px;letter-spacing:${S.label.letterSpacing};
  text-transform:uppercase;color:${a.cyan};}
/* SVET vo farbe, ktorou ho kreslí mozog (WORLD_TINT cez --ai-w) — Matej 6. 10.: „z toho nie je jasné, aký je to svet“ */
.akv-zvw{color:rgb(var(--ai-w,${a.cyanRGB}));font-weight:600;}
.akv-zv{position:relative;display:flex;flex-direction:column;gap:${t.md}px;
  padding:${t.md}px;border-radius:${o.card}px;${ce}}
.akv-zvimg{position:relative;flex:0 0 auto;}
.akv-zvimg img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${o.tile}px;cursor:pointer;}
.akv-zvacts{align-self:stretch;margin-top:auto;display:flex;gap:${t.sm}px;padding-top:${t.sm}px;
  border-top:1px solid ${a.edge};}
.akv-zvacts button{width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;
  border-radius:${o.pill}px;background:${a.surface};border:1px solid ${a.edge};color:${a.ink};}
.akv-zvacts button:hover{color:${a.cyan};border-color:${a.edgeStrong};}
.akv-zvt{display:flex;flex-direction:column;align-items:flex-start;gap:${t.lg}px;min-width:0;}
.akv-zvlbl{font-size:${r.micro}px;letter-spacing:${S.section.letterSpacing};text-transform:uppercase;color:${a.cyan};}
/* písmo: nadpis */ .akv-zvn{margin:0;font-family:${Y};font-weight:700;font-size:${r.h2}px;line-height:1.2;
  letter-spacing:${S.card.letterSpacing};text-transform:uppercase;color:${a.ink};overflow-wrap:anywhere;}
.akv-zvv{margin:0;font-size:${r.body}px;line-height:1.55;color:${a.inkDim};}
/* VEZMI SI Z TOHO — jedna veta (fasáda v2). Ľavá niť v zlato-oranžovej AINUBISA, nie plná plocha. */
.akv-zvtake{align-self:stretch;display:flex;flex-direction:column;gap:${t.xs}px;
  padding:${t.sm}px ${t.md}px;border-radius:${o.tile}px;background:${a.ctaTint};
  border-left:2px solid ${a.ctaA};font-size:${r.body}px;line-height:1.45;color:${a.ink};}
.akv-zvtake b{font-size:${r.micro}px;font-weight:500;letter-spacing:${S.section.letterSpacing};text-transform:uppercase;color:${a.ctaA};}
/* Jediné plné CTA na karte = AINUBISOVO zlato-oranžové; ostatné sú obrysové. */
.akv-zvcta{align-self:stretch;padding:${t.sm}px ${t.lg}px;cursor:pointer;border-radius:${o.field}px;
  background:${a.ctaGrad};border:1px solid ${a.ctaEdge};color:${a.ctaInk};
  font-family:${Y};font-weight:700;font-size:${r.label}px;letter-spacing:${S.card.letterSpacing};text-transform:uppercase;} /* písmo: cta */
.akv-zvrow{align-self:stretch;display:flex;gap:${t.sm}px;}
.akv-zvsec{flex:1 1 0;display:flex;align-items:center;justify-content:center;gap:${t.xs}px;cursor:pointer;white-space:nowrap;
  padding:${t.sm}px;border-radius:${o.field}px;background:transparent;border:1px solid ${a.edge};
  color:${a.cyan};font-family:${f};font-weight:500;font-size:${r.label}px;}
.akv-zvsec:hover{border-color:${a.edgeStrong};}
.akv-zvsec i{width:14px;height:14px;flex:0 0 auto;background:currentColor;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain;}
.akv-zvrel{display:flex;flex-wrap:wrap;gap:${t.xs}px ${t.sm}px;font-size:${r.label}px;}
.akv-zvrel span{color:${a.inkDim};}
.akv-zvrel a{color:${a.cyan};cursor:pointer;}
/* Karta zvitku ŽIARI FARBOU SVOJHO SVETA (Matej 8. 10.) — prstenec cez pseudoprvok,
   aby neprepísal vrstvy AI-SKLA na karte. */
.akv-zv::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  box-shadow:${Te.ring};}
`;function Ae({sd:i,lang:h,corner:v=!1,pill:m=!1}){const u=se(h);return i?e.jsxs("span",{className:`zv-sd${v?" zv-sd--corner":""}${m?" zv-sd--pill":""}`,"data-g":oe[i],tabIndex:0,"aria-label":`${u.sd} ${u.sdName[i]}`,children:[oe[i],e.jsxs("span",{className:"zv-tip",role:"tooltip",children:[e.jsxs("b",{children:[u.sd," ",u.sdName[i]]}),e.jsx("br",{}),"A · B · C — ",u.sdName[3].slice(4)," → ",u.sdName[1].slice(4)]})]}):null}function Ie({id:i,lang:h,onTalk:v,lock:m,onShare:u}){const b=se(h),z=na().includes(i),g=sa(i),y=ra().includes(i),x=oa(i),l=x?x.likes:y?1:0,s=x?x.saves:z?1:0;return e.jsxs("div",{className:"zv-acts",children:[e.jsxs("button",{type:"button","data-k":"like",className:`zv-act${y?" is-on":""}`,onClick:m??(()=>la(i)),"aria-label":b.like,children:[e.jsx(je,{size:20,on:y,n:l,color:a.cyan}),e.jsx("span",{className:"zv-n",children:l})]}),e.jsxs("button",{type:"button","data-k":"talk",className:`zv-act${g>0?" is-on":""}`,onClick:m??v,"aria-label":b.talk,children:[e.jsx(ue,{ic:g>0?"chat-right-full":"chat",off:g===0}),e.jsx("span",{className:"zv-n",children:g})]}),u&&e.jsx("button",{type:"button","data-k":"share",className:"zv-act",onClick:m??u,"aria-label":b.share,children:e.jsx(qe,{})}),e.jsxs("button",{type:"button","data-k":"save",className:`zv-act${z?" is-on":""}`,onClick:m??(()=>da(i)),"aria-label":b.save,children:[e.jsx(Ze,{size:20,filled:z,n:s}),e.jsx("span",{className:"zv-n",children:s})]})]})}function Ra({z:i,lang:h,worldName:v,onOpen:m,onShare:u,showShare:b,lock:z,locked:g,head:y,eager:x}){const l=p.useRef(null),s=we()[i.id]||0,d=me(i,h),j=We(i,h),A=se(h);return p.useEffect(()=>{const D=l.current;if(!D||s>=1||z||g)return;let N=0;const C=new IntersectionObserver(([R])=>{window.clearTimeout(N),R.isIntersecting&&(N=window.setTimeout(()=>ne(i.id,1),2e3))},{threshold:.5});return C.observe(D),()=>{C.disconnect(),window.clearTimeout(N)}},[i.id,s,z,g]),e.jsxs("article",{ref:l,className:`akv-zv${g?" akv-zv--locked":""}`,"data-zid":i.id,style:pe(i.world),children:[y,e.jsxs("div",{className:"akv-zvimg",children:[i.img&&e.jsx("img",{...Ne(i.img),alt:"",loading:x?"eager":"lazy",onClick:()=>m(i.id)}),g?e.jsx("span",{className:"zv-lockbadge","aria-hidden":!0,children:e.jsx(ke,{size:20})}):e.jsx(Ie,{id:i.id,lang:h,onTalk:()=>m(i.id,"talk"),lock:z,onShare:b?()=>u(i.id):void 0})]}),e.jsxs("div",{className:"akv-zvt",children:[e.jsxs("div",{className:"zv-mid",children:[e.jsxs("span",{className:"akv-zvlbl",children:[v&&e.jsxs(e.Fragment,{children:[e.jsx("b",{className:"akv-zvw",style:pe(i.world),children:v})," · "]}),A.scroll," ",i.n," / ",i.total," · ",d.min," ",A.min,e.jsx(Ae,{sd:i.sd,lang:h,pill:!0})]}),e.jsx("h3",{className:"akv-zvn",children:d.t}),e.jsx("span",{className:"zv-rule","aria-hidden":!0})]}),e.jsxs("div",{className:"zv-mid",children:[e.jsx("p",{className:"akv-zvv",children:d.v}),d.vz&&!g&&e.jsx("div",{className:"zv-take",children:d.vz})]}),e.jsxs("div",{className:"zv-ctas",children:[e.jsxs("button",{type:"button",className:`zv-read${s===2?" is-done":""}`,onClick:()=>m(i.id),children:[g&&e.jsx(ke,{size:14}),s===2&&e.jsx(xe,{size:14}),s===2?A.readDone:A.read]}),j&&!g&&e.jsxs("button",{type:"button",className:"akv-zvsec",onClick:()=>m(i.id,"pod"),children:[e.jsx(ue,{ic:"play"}),A.listen," · ",re(j.sec)]})]})]})]})}function ie({t:i}){const h=i.split(/(\b(?:1\d{3}|20\d{2})\b)/);return e.jsx(e.Fragment,{children:h.map((v,m)=>m%2?e.jsx("span",{className:"zv-yr",children:v},m):v)})}function za({d:i,imgs:h,onImg:v}){const m=i.split(/\n\n+/);return e.jsx(e.Fragment,{children:m.map((u,b)=>{if(u.startsWith("▸"))return e.jsx("h3",{className:"zv-sec",children:u.replace(/^▸\s*/,"")},b);if(u.startsWith("»"))return e.jsx("blockquote",{className:"zv-fact",children:e.jsx(ie,{t:u.replace(/^\u00BB\s*/,"")})},b);if(u.startsWith("▣")){const x=u.match(/^▣\s*([ABC])\s*\|?\s*(.*)$/s),l=x&&(h==null?void 0:h[x[1]]);return l?e.jsxs("figure",{className:"zv-fig",children:[e.jsx("img",{src:l,alt:x[2],loading:"lazy",onClick:()=>v==null?void 0:v(l),style:{cursor:"zoom-in"}}),e.jsx("figcaption",{children:x[2]})]},b):null}const z=u.split(`
`),g=z.filter(x=>x.startsWith("◷"));if(g.length){const x=z.filter(l=>!l.startsWith("◷"));return e.jsxs("div",{children:[x.length>0&&e.jsx("p",{children:e.jsx(ie,{t:x.join(" ")})}),e.jsx("ol",{className:"zv-tl",children:g.map((l,s)=>{const[d,...j]=l.replace(/^◷\s*/,"").split("|");return e.jsxs("li",{children:[e.jsx("b",{children:d.trim()}),e.jsx("span",{children:j.join("|").trim()})]},s)})})]},b)}const y=z.filter(x=>/^[–-]\s/.test(x));if(y.length){const x=z.filter(l=>!/^[–-]\s/.test(l));return e.jsxs("div",{children:[x.length>0&&e.jsx("p",{children:e.jsx(ie,{t:x.join(" ")})}),e.jsx("ul",{children:y.map((l,s)=>e.jsx("li",{children:e.jsx(ie,{t:l.replace(/^[–-]\s/,"")})},s))})]},b)}return e.jsx("p",{children:e.jsx(ie,{t:u})},b)})})}const ka=1500,$a=6e3,fe=[["es","Español"],["fr","Français"],["it","Italiano"],["pl","Polski"],["pt","Português"],["nl","Nederlands"],["uk","Українська"],["ru","Русский"],["tr","Türkçe"],["id","Bahasa Indonesia"],["ja","日本語"],["ko","한국어"],["zh","中文"],["ar","العربية"]],ye={sk:"SK",en:"EN",cs:"CZ",de:"DE"};function fa({z:i,lang:h,onDone:v,boxRef:m,autoPlay:u,onEnd:b,lock:z}){var J,ae;const g=se(h),[y,x]=p.useState(),l=ca(i,h,y),s=l?i.pod[l]:null,[d,j]=p.useState(!1),[A,D]=p.useState(""),[N,C]=p.useState(fe[0][0]),[R,_]=p.useState(!1),[Z,E]=p.useState(!1),[G,M]=p.useState(0),L=p.useRef(null),F=p.useRef(0);p.useEffect(()=>{M(0),F.current=0},[l]);const K=pa()[i.id],I=K&&!K.listened_at?K.listen_sec:0,V=p.useRef(null),X=p.useRef(l);X.current=l;const H=()=>{var k;if(V.current==null||z)return;const c=Math.round((Date.now()-V.current)/1e3);V.current=null,c>=3&&Se(i.id,"listen",{sec:c,lang:X.current,at:Math.round(((k=L.current)==null?void 0:k.currentTime)||0)})},O=p.useRef(H);O.current=H,p.useEffect(()=>()=>O.current(),[]),p.useEffect(()=>{O.current()},[l]);const w=!z,q=Oe(),B=w&&((J=q.z)==null?void 0:J.id)===i.id;if(p.useEffect(()=>{if(w)return he(i.id),be(i.id,b||null),u&&l&&de(i,l,h,I),()=>{he(null),be(i.id,null)}},[w,i.id]),!s||!l)return null;const U=B&&q.playing,Q=B?q.t:I>5?I:0,le=B?q.lang:l,W=(c,k=!1)=>{z||!k&&c-F.current<15||(F.current=c,ua(i.id,c,l))},ee=c=>{const k=c.currentTarget;W(k.currentTime),k.duration&&k.currentTime/k.duration>=.9&&v()};return e.jsxs("div",{className:`zv-pod${(w?U:d)?" is-play":""}`,ref:m,children:[e.jsxs("small",{children:[e.jsxs("span",{children:[g.pod," · ",re(s.sec)]}),e.jsxs("span",{className:"zv-ptools",children:[e.jsxs("span",{className:"zv-pdd",children:[e.jsx("button",{type:"button",className:"zv-plang","aria-haspopup":"listbox","aria-expanded":Z,onClick:()=>E(!Z),children:ye[w?le:l]}),Z&&e.jsxs("span",{className:"zv-pmenu",role:"listbox","aria-label":g.other,children:[xa.filter(c=>i.pod[c]).map(c=>e.jsx("button",{type:"button",role:"option","aria-selected":c===l,className:c===l?"is-on":"",onClick:()=>{x(c),B?Me(c):j(!1),E(!1),A==="req"&&D("")},children:ye[c]},c)),e.jsxs("button",{type:"button",className:"zv-padd",onClick:()=>{D("req"),E(!1)},children:["+ ",g.other]})]})]}),!!((ae=s.tr)!=null&&ae.length)&&e.jsx("button",{type:"button",className:`zv-ptr${A==="tr"?" is-on":""}`,"aria-pressed":A==="tr",onClick:()=>D(A==="tr"?"":"tr"),children:g.tr})]})]}),!w&&e.jsx("audio",{ref:L,preload:"metadata",src:s.src,onLoadedMetadata:c=>{const k=c.currentTarget;I>5&&I<k.duration*.9&&(k.currentTime=I,M(I),F.current=I),u&&k.play().catch(()=>{})},onTimeUpdate:c=>{ee(c),M(c.currentTarget.currentTime)},onPlay:()=>{j(!0),V.current=Date.now()},onPause:c=>{j(!1),H(),W(c.currentTarget.currentTime,!0)},onEnded:c=>{j(!1),H(),W(c.currentTarget.currentTime,!0),v(),b==null||b()}},s.src),e.jsxs("div",{className:"zv-player",children:[e.jsx("button",{type:"button",className:"zv-pbtn","aria-label":(w?U:d)?"Pause":"Play",onClick:()=>{if(w){B?Le():de(i,l,h,I);return}const c=L.current;c&&(c.paused?c.play():c.pause())},children:(w?U:d)?e.jsxs("span",{className:"zv-pause","aria-hidden":!0,children:[e.jsx("i",{}),e.jsx("i",{})]}):e.jsx(ue,{ic:"play"})}),e.jsxs("span",{className:"zv-ptime",children:[re(Math.floor(w?Q:G))," / ",re(s.sec)]}),e.jsx("input",{type:"range",className:"zv-pbar",min:0,max:s.sec,step:1,value:Math.floor(w?Q:G),"aria-label":g.pod,style:{"--p":`${s.sec?(w?Q:G)/s.sec*100:0}%`},onChange:c=>{const k=Number(c.target.value);if(w){B?Ke(k):de(i,l,h,k);return}const te=L.current;te&&(te.currentTime=k),M(k)}})]}),A==="tr"&&e.jsx("div",{className:"zv-tr",children:s.tr.map((c,k)=>e.jsxs("p",{children:[c.s==="A"?e.jsxs("b",{className:"is-ai",children:[e.jsx("span",{children:"AI"}),"NUBIS"]}):e.jsx("b",{children:"STACHOMAN"})," ",c.t]},k))}),A==="req"&&e.jsxs("div",{className:"zv-req",children:[e.jsx("b",{children:g.reqTitle})," — ",g.reqText,R?e.jsx("div",{className:"zv-ok",children:g.reqOk}):e.jsxs("div",{children:[e.jsx("select",{value:N,onChange:c=>C(c.target.value),"aria-label":g.other,children:fe.map(([c,k])=>e.jsx("option",{value:c,children:k},c))}),e.jsx("button",{type:"button",onClick:()=>{if(z){z();return}va(i.id,N),_(!0)},children:g.reqBtn})]})]})]})}function ya(i,h){var m;const v=i.img?[{src:i.img,cap:""}]:[];for(const u of h.matchAll(/^▣\s*([ABC])\s*\|?\s*(.*)$/gm)){const b=(m=i.imgs)==null?void 0:m[u[1]];b&&!v.some(z=>z.src===b)&&v.push({src:b,cap:u[2]})}return v}function ja({list:i,start:h,label:v,onClose:m}){const[u,b]=p.useState(h),z=p.useRef(null),g=x=>b(l=>Math.min(i.length-1,Math.max(0,l+x)));p.useEffect(()=>{const x=l=>{l.key==="Escape"&&m(),l.key==="ArrowLeft"&&g(-1),l.key==="ArrowRight"&&g(1)};return window.addEventListener("keydown",x),()=>window.removeEventListener("keydown",x)});const y=i[u];return De.createPortal(e.jsxs("div",{className:"zv-gal",role:"dialog","aria-modal":"true","aria-label":v,onClick:x=>{x.target===x.currentTarget&&m()},onTouchStart:x=>{z.current=x.touches[0].clientX},onTouchEnd:x=>{if(z.current===null)return;const l=x.changedTouches[0].clientX-z.current;Math.abs(l)>40&&g(l<0?1:-1),z.current=null},children:[e.jsx(ve,{tone:"ainubis",onClick:m,label:v,className:"zv-gback"}),i.length>1&&e.jsx("button",{type:"button",className:"zv-gnav zv-gnav--prev",disabled:u===0,onClick:()=>g(-1),"aria-label":"Prev",children:e.jsx(Ge,{size:20})}),e.jsxs("figure",{children:[e.jsx("img",{src:y.src,alt:y.cap}),e.jsxs("figcaption",{children:[u+1," / ",i.length,y.cap?` · ${y.cap}`:""]})]}),i.length>1&&e.jsx("button",{type:"button",className:"zv-gnav zv-gnav--next",disabled:u===i.length-1,onClick:()=>g(1),"aria-label":"Next",children:e.jsx(Fe,{size:20})})]}),document.body)}function Oa({z:i,all:h,lang:v,focus:m,onClose:u,onOpen:b,onUse:z,onShare:g,queue:y,onNext:x,lock:l}){const s=se(v),{z:d,ready:j,failed:A,retry:D}=Je(i),N=me(d,v),C=we()[d.id]||0,R=Ye(d.id),[_,Z]=p.useState(""),[E,G]=p.useState(""),[M,L]=p.useState(!1),[F,K]=p.useState(null),[I,V]=p.useState(!1),[X,H]=p.useState("add"),[O,w]=p.useState(""),[q,B]=p.useState(!1),U=p.useRef(null),Q=He(),le=Ve(),W=p.useRef(null),ee=p.useRef(null),J=p.useRef(null),[ae,c]=p.useState(null),k=ya(d,N.d);p.useEffect(()=>{l||(ne(d.id,1),Se(d.id,"open"))},[d.id]),p.useEffect(()=>{const n=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=n}},[]);const te=p.useRef(null);return p.useEffect(()=>{const n=te.current;if(!n||C===2||l)return;const $=Date.now();let T=0;const ge=new IntersectionObserver(([Ce])=>{window.clearTimeout(T),Ce.isIntersecting&&(T=window.setTimeout(()=>ne(d.id,2,"read","auto"),Math.max(ka,$a-(Date.now()-$))))},{root:U.current,threshold:.6});return ge.observe(n),()=>{ge.disconnect(),window.clearTimeout(T)}},[d.id,C,j]),p.useEffect(()=>{var $;($=U.current)==null||$.scrollTo({top:0});const n=m==="pod"?W.current:m==="src"?ee.current:m==="talk"?J.current:null;n&&window.setTimeout(()=>n.scrollIntoView({behavior:"smooth",block:"center"}),50)},[d.id,m]),p.useEffect(()=>{j&&m==="src"&&window.setTimeout(()=>{var n;return(n=ee.current)==null?void 0:n.scrollIntoView({behavior:"smooth",block:"center"})},50)},[j]),e.jsxs("div",{className:"zv-veil",ref:U,role:"dialog","aria-modal":"true","aria-label":N.t,style:pe(d.world),children:[e.jsx("div",{className:"zv-bg","aria-hidden":!0}),ae!==null&&k.length>0&&e.jsx(ja,{list:k,start:ae,label:s.back,onClose:()=>c(null)}),Q&&e.jsxs("div",{className:"zv-bar",children:[e.jsx(ve,{tone:"ainubis",onClick:u,label:s.back}),!le&&e.jsx(Re,{last24h:null,total:null,layout:"inline"})]}),e.jsxs("div",{className:"zv-wrap pk-stage",children:[e.jsx(ve,{tone:"ainubis",onClick:u,label:s.back,className:"zv-back"}),e.jsxs("div",{className:"zv-top",children:[e.jsxs("div",{className:"zv-hero",children:[d.img&&e.jsx("img",{...Ne(d.img),alt:"",onClick:()=>c(0)}),e.jsx(Ie,{id:d.id,lang:v,onTalk:()=>{var n;return(n=J.current)==null?void 0:n.scrollIntoView({behavior:"smooth",block:"start"})},lock:l})]}),e.jsxs("div",{className:"zv-head",children:[e.jsxs("div",{className:"zv-grp",children:[e.jsxs("span",{className:"zv-meta",children:[ha(d,v)," · ",s.scroll," ",d.n,"/",d.total," · ",N.min," ",s.min,e.jsx(Ae,{sd:d.sd,lang:v,pill:!0})]}),e.jsx("h1",{className:"zv-h",children:N.t}),e.jsx("span",{className:"zv-rule","aria-hidden":!0}),C===2&&e.jsxs("span",{className:"zv-badge",children:[e.jsx(xe,{size:14}),s.readDone]})]}),e.jsxs("div",{className:"zv-grp",children:[e.jsx("p",{className:"zv-v",children:N.v}),N.vz&&e.jsx("div",{className:"zv-take",style:{alignSelf:"stretch"},children:N.vz})]}),e.jsx(fa,{z:d,lang:v,boxRef:W,onDone:()=>ne(d.id,2,"listen"),autoPlay:y,onEnd:y?x:void 0,lock:l})]})]}),e.jsxs("div",{className:"zv-body",children:[j?e.jsx(za,{d:N.d,imgs:d.imgs,onImg:n=>c(Math.max(0,k.findIndex($=>$.src===n)))}):A?e.jsx("button",{type:"button",className:"zv-add",onClick:D,children:s.loadFail}):e.jsx("div",{className:"zv-add",role:"status",children:s.loading}),j&&e.jsx("div",{ref:te,"aria-hidden":!0,style:{height:1}}),j&&e.jsxs("section",{className:"zv-box zv-box--add",children:[e.jsx("h3",{className:"zv-sec",children:s.added}),d.doplnene.length?d.doplnene.map((n,$)=>e.jsxs("div",{className:"zv-add",children:[e.jsx("b",{children:n.date})," · ",n.text]},$)):e.jsx("div",{className:"zv-add",children:s.addedNone})]}),d.sd>0&&e.jsxs("section",{className:"zv-box zv-box--sd",children:[e.jsx("h3",{className:"zv-sec",children:s.sd}),e.jsx("ul",{className:"zv-sdl",children:[3,2,1].map(n=>e.jsxs("li",{"data-g":oe[n],className:d.sd===n?"is-on":void 0,children:[e.jsx("b",{children:oe[n]}),e.jsx("span",{children:s.sdName[n].slice(4)})]},n))})]}),d.zdroje.length>0&&e.jsxs("section",{className:"zv-box zv-box--src",children:[e.jsxs("h3",{className:"zv-sec",ref:ee,children:[s.src," · ",d.zdroje.length]}),e.jsx("ol",{className:"zv-src",children:d.zdroje.map((n,$)=>{const T=Xe(n);return e.jsxs("li",{children:[e.jsx("b",{children:n.a})," (",n.r,") · ",n.t," · ",e.jsx("i",{children:n.j}),T&&e.jsxs(e.Fragment,{children:[" · ",e.jsx("a",{href:T,target:"_blank",rel:"noopener noreferrer",children:n.doi?"doi":"link"})]})]},$)})})]}),d.rel.length>0&&e.jsxs("section",{className:"zv-box",children:[e.jsx("h3",{className:"zv-sec",children:s.rel}),e.jsx("div",{className:"zv-rel",children:d.rel.map(n=>{const $=h.find(T=>T.id===n);return $?e.jsxs("button",{type:"button",className:"zv-chip",onClick:()=>b(n),children:[me($,v).t," ›"]},n):null})})]}),!l&&e.jsxs("section",{className:"zv-box zv-box--you",children:[e.jsx("h3",{className:"zv-sec",children:s.contrib}),e.jsxs("button",{type:"button",className:`zv-prop${I?" is-open":""}`,onClick:()=>{V(n=>!n),B(!1)},children:[e.jsx(ze,{name:"ceruzka",size:20}),s.cEdit]}),I&&!q&&e.jsxs("form",{className:"zv-cform",onSubmit:n=>{n.preventDefault(),O.trim()&&(Qe(d.id,X,O.trim()),w(""),B(!0))},children:[e.jsx("div",{className:"zv-kinds",style:{alignSelf:"stretch"},children:["add","wrong","own"].map((n,$)=>e.jsxs("button",{type:"button",className:`zv-kind${X===n?" is-on":""}`,onClick:()=>H(n),children:[e.jsx(ze,{name:n==="add"?"plus":n==="wrong"?"pozor":"ceruzka",size:20})," ",s.kinds[$]]},n))}),e.jsx("textarea",{value:O,onChange:n=>w(n.target.value),placeholder:s.propPh,rows:3}),e.jsx("button",{type:"submit",className:"zv-chip",disabled:!O.trim(),children:s.propSend})]}),q&&e.jsx("div",{className:"zv-ok",children:s.propOk})]}),!l&&e.jsx("button",{type:"button",className:`zv-done${C===2?" is-done":""}`,onClick:()=>ne(d.id,2),children:e.jsxs("b",{children:[C===2&&e.jsx(xe,{size:12})," ",C===2?s.doneOk:s.done]})}),!l&&e.jsxs("section",{className:"zv-box zv-box--talk",ref:J,children:[e.jsxs("h3",{className:"zv-sec",children:[s.talk,R.length>0&&` · ${R.length}`]}),R.length===0&&e.jsx("div",{className:"zv-add",children:s.talkNone}),R.map((n,$)=>e.jsxs("div",{className:"zv-cmt",children:[e.jsx("span",{className:"zv-cav",children:n.avatar?e.jsx("img",{src:n.avatar,alt:""}):(n.mine===!1?n.author||"?":s.you).slice(0,1)}),e.jsxs("div",{children:[e.jsx("b",{children:n.mine===!1?n.author||"—":s.you})," ",e.jsx("small",{children:new Date(n.at).toLocaleDateString(v)}),n.text&&e.jsx("p",{children:n.text}),n.img&&e.jsx("img",{className:"zv-cimg",src:n.img,alt:""}),e.jsxs("div",{className:"zv-crow",children:[e.jsxs("button",{type:"button",className:`zv-clike${n.liked?" is-on":""}`,onClick:()=>ea(d.id,$),"aria-label":s.like,children:[e.jsx(je,{size:16,on:!!n.liked,n:n.likes??(n.liked?1:0),color:a.cyan}),n.likes??(n.liked?1:0)]}),n.mine!==!1&&(F===$?e.jsxs("span",{className:"zv-cdel-ask",children:[s.delAsk,e.jsx("button",{type:"button",className:"zv-cdel is-go",onClick:()=>{K(null),aa(d.id,$)},children:s.del}),e.jsx("button",{type:"button",className:"zv-cdel",onClick:()=>K(null),children:s.delNo})]}):e.jsx("button",{type:"button",className:"zv-cdel",onClick:()=>K($),"aria-label":s.del,children:e.jsx(Ue,{size:16})}))]})]})]},n.id??$)),e.jsxs("form",{className:"zv-cform",onSubmit:n=>{n.preventDefault(),!(M||!_.trim()&&!E)&&(L(!0),ia(d.id,_.trim(),E||void 0).then($=>{$&&(Z(""),G("")),L(!1)}))},children:[e.jsx("textarea",{value:_,onChange:n=>Z(n.target.value),placeholder:s.talkPh,rows:2}),E&&e.jsx("img",{className:"zv-cprev",src:E,alt:""}),e.jsxs("div",{className:"zv-crow",children:[e.jsxs("label",{className:"zv-cpic",children:[e.jsx(_e,{size:16}),s.photo,e.jsx("input",{type:"file",accept:"image/*",onChange:n=>{var T;const $=(T=n.target.files)==null?void 0:T[0];$&&ta($).then(G).catch(()=>{}),n.target.value=""}})]}),e.jsx("button",{type:"submit",className:"zv-chip",disabled:M||!_.trim()&&!E,children:s.talkSend})]})]})]})]})]})]})}export{Da as S,Ba as a,Ra as b,ha as c,Oa as d,se as s};
