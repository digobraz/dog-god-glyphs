import{L as s,v as Re,m as d,b as Ze,s as Be,a0 as l,a1 as je,c as X,aC as Je,r as D,j as a,O as te}from"./index-DriUOdZL.js";import{S as ze}from"./SysIcon-CI9hudiL.js";import{B as _}from"./BrandIcon-lowQpHlA.js";import{sizedUrl as $e}from"./cloudinaryService-CiRx-3N_.js";import{c as Qe}from"./countryGeo-BNEVCU3g.js";import{g as ea,k as oe}from"./MomentHost-D9oSu3w3.js";import{B as fe,t as Le,a as me}from"./packTiers-D4RAcaEl.js";import{D as aa,c as ra}from"./dogSeal-6Sl_nvhS.js";import{a as ta,S as oa,A as Ae,B as na,b as ia,R as sa,c as ne,d as la,e as pa,P as da,L as ma,f as Ne,g as ca,h as xa,i as ga,j as ha}from"./rankBadge-DrDXhP70.js";import{f as ba}from"./flagUrl-B21iQI9I.js";import{supabase as fa}from"./client-_yx8AKEw.js";import{f as ua,m as ka,a as $a}from"./memberProfile-CThIDywb.js";import{l as va}from"./pawmateRights-By9TfO0S.js";const Ce=[{key:"novice",glow:"#ECCAAC",dot:"#D8955A",desc:"First pawprint. Your dog took you in — now follow."},{key:"wanderer",glow:"#ECDCAC",dot:"#D8B95A",desc:"You take your dog out, even in the rain."},{key:"follower",glow:"#E9ECAC",dot:"#D2D85A",desc:"Your hand holds the leash, your dog picks the way."},{key:"believer",glow:"#D6ECAC",dot:"#AED85A",desc:"You believe in dog. And your dog knows it."},{key:"servant",glow:"#C4ECAC",dot:"#89D85A",desc:"Their bowl is full before your plate is."},{key:"aspirant",glow:"#B2ECAC",dot:"#65D85A",desc:"Three laps around the block no longer do."},{key:"mentor",glow:"#ACECB9",dot:"#5AD873",desc:"You teach your dog, yourself and those around you."},{key:"steward",glow:"#ACECCC",dot:"#5AD898",desc:"Teeth, claws, coat, food — you hold the keys to their health."},{key:"shepherd",glow:"#ACECDE",dot:"#5AD8BD",desc:"You lead a pack, not just one dog."},{key:"sentinel",glow:"#ACE7EC",dot:"#5ACFD8",desc:"You protect dogs that are not yours."},{key:"elder",glow:"#ACD5EC",dot:"#5AABD8",desc:"Years of devotion. The young ones come to ask you."},{key:"sage",glow:"#ACC2EC",dot:"#5A86D8",desc:"The feather of Maat — a heart lighter than a feather."},{key:"cleric",glow:"#ACB0EC",dot:"#5A61D8",desc:"You light the flame at the sacraments of the pack."},{key:"mystic",glow:"#BBACEC",dot:"#775AD8",desc:"You understand your dog without words."},{key:"priest",glow:"#CDACEC",dot:"#9B5AD8",desc:"You weigh hearts — fair to dogs and people alike."},{key:"paladin",glow:"#E0ACEC",dot:"#C05AD8",desc:"You fight for dogs in need."},{key:"magus",glow:"#ECACE5",dot:"#D85ACC",desc:"You change the fates of dogs nobody wanted."},{key:"prophet",glow:"#ECACD3",dot:"#D85AA7",desc:"You see where the movement is going before anyone else."},{key:"nomarch",glow:"#ECACC1",dot:"#D85A83",desc:"You govern a province of DOGYPT."},{key:"vizier",glow:"#ECACAE",dot:"#D85A5E",desc:"The Pharaoh's right hand. You build pyramids."},{key:"pharaoh",glow:"#FFF6D6",dot:"#D8A93F",desc:"Highest among humans. The dog is still higher."},{key:"demigod",glow:"#FFFFFF",dot:"#F3D98A",desc:"Half human, half dog. Beyond this, only god."}],Ge="linear-gradient(135deg, #2E2216, #140D07)",Ue="#C99A3F",Z="#F3E6C8",ya="linear-gradient(180deg, #F8E7AE 0%, #D8A93F 46%, #A3782B 54%, #E6C46C 100%)",wa="radial-gradient(120% 160% at 50% 30%, #FFFFFF 0%, #FFF3CC 45%, #EFCF78 100%)";function ve(r){const i=Math.min(Ce.length,Math.max(1,Math.floor(r||1)))-1;return Ce[i]}const ja=r=>`/icons/pack/dv-${r}.svg`;function ke(r){const i=ve(r),n=r>=21;return{"--dv-bg":r===22?wa:n?ya:Ge,"--dv-edge":r===22?"#D8A93F":n?"#8C6014":Ue,"--dv-ink":r===22?"#6E4A12":n?"#2a1608":Z,"--dv-dot":`radial-gradient(circle at 35% 30%, ${i.glow}, ${i.dot} 65%)`,"--dv-glow":i.dot,"--dv-icon":`url(${ja(i.key)})`,"--dv-icon-ink":n?"#5A3A08":"#140D07"}}const za={paper:"--b3-a:#fff;--b3-b:var(--p3d-paper);--b3-p:var(--p3d-gold-solid);--b3-l:var(--p3d-ink);--b3-i:var(--p3d-ink);",lapis:`--b3-a:color-mix(in srgb,${s.edge} 72%,white);--b3-b:${s.deep};--b3-p:color-mix(in srgb,${s.deep} 60%,black);--b3-l:${s.ink};--b3-i:${s.ink};`,gold:"--b3-a:color-mix(in srgb,var(--p3d-gold) 60%,white);--b3-b:var(--p3d-gold);--b3-p:var(--p3d-gold-ink);--b3-l:var(--p3d-ink);--b3-i:var(--p3d-ink);",red:"--b3-a:color-mix(in srgb,#C8202F 62%,white);--b3-b:#C8202F;--b3-p:#9E1522;--b3-l:var(--p3d-ink);--b3-i:#fff;",green:"--b3-a:color-mix(in srgb,#3D7A4E 66%,white);--b3-b:#3D7A4E;--b3-p:color-mix(in srgb,#3D7A4E 62%,black);--b3-l:var(--p3d-ink);--b3-i:#fff;"};function Ee(r,i,n=""){const p=r.split(",").map(c=>`html.papyrus3d ${c.trim()}`);return`${p.join(",")}{${za[i]}height:56px;min-height:56px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;border:2.5px solid var(--b3-l);border-radius:16px;background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 var(--b3-p),0 11px 14px var(--p3d-sh);font:400 ${Re.h2}px/1 'LT Museum',serif;letter-spacing:0;text-transform:none;text-decoration:none;transition:transform .07s,box-shadow .07s;${n}} /* písmo: cta */
${p.map(c=>`${c}:active:not(:disabled)`).join(",")}{transform:translateY(5px);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 1px 0 var(--b3-p);}
${p.map(c=>`${c}:disabled`).join(",")}{opacity:.55;cursor:default;}
`}const qa="border:2.5px solid var(--p3d-ink);border-radius:16px;background:var(--p3d-card);box-shadow:var(--p3d-lift);",t=Ze,e=Be,o=Re,De="'Cinzel Decorative', 'Cinzel', serif",ce={m:250,pc:300},y={m:126,pc:158},R={m:10,pc:16},xe=13,K={m:56,pc:70},_e={m:K.m*3/4,pc:Math.round(K.pc*3/4)},q={d:.6,left:.76,top:.2},ie=q.left+q.d,ue={left:`${Math.round(q.left*100)}%`,top:`${Math.round(q.top*100)}%`,d:`${Math.round(q.d*100)}%`},Aa={d:.42,cx:.86,cy:.86},Na=16,Se={m:xe+Math.round(y.m*Ae),pc:Be.lg+Math.round(y.pc*Ae)},I={m:88,pc:120},Pe={m:R.m+y.m/2-I.m/2,pc:R.pc+y.pc/2-I.pc/2},se=ta,Za=`
.me-card{ position:relative; border-radius:${d.card}px; border:1.5px solid ${t.cardEdge}; background:${t.cardGrad}; box-shadow:${t.cardShadow}; overflow:hidden; }
/* Fotka titulky sa ROZPLYNIE do karty maskou (nie prekrytím farbou) — karta má gradient,
 * takže akákoľvek pevná farba na konci by nechala viditeľnú hranu. */
.me-cover{ position:relative; height:${ce.m}px; }
.me-cover::before{ content:''; position:absolute; inset:0; pointer-events:none; background:var(--me-cover, ${t.pageBg}) center var(--me-cover-y, 35%)/cover no-repeat;
  -webkit-mask-image:linear-gradient(180deg, #000 0%, #000 42%, transparent 100%); mask-image:linear-gradient(180deg, #000 0%, #000 42%, transparent 100%); }
.me-cover::after{ content:''; position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(180deg, color-mix(in srgb, ${t.pageBg} 35%, transparent) 0%, transparent 25%); }
.me-cover > *{ position:relative; z-index:1; }
/* UPRAVIŤ PROFIL: titulka sa ťahá prstom hore/dole (poloha = human.coverY). */
.me-cover.pick{ cursor:pointer; }
/* Fotoaparát titulky — sklenený krúžok vpravo hore, aby bolo vidno, že sa pozadie dá vymeniť. */
.me-cvbtn{ width:36px; height:36px; padding:0; border-radius:${d.pill}px; display:grid; place-items:center; cursor:pointer;
  background:rgba(0,0,0,.42); border:1px solid ${t.onDarkBorder}; }
.me-cover.drag{ cursor:grab; touch-action:none; user-select:none; }
.me-cover.drag.on{ cursor:grabbing; }
.me-tbar{ display:flex; justify-content:space-between; align-items:flex-start; padding:${e.md}px; }
/* VLAJKA NA TITULKE (Matej 25. 10.: *„tá vlajka je super, dal by som ju každému profilu na titulku do pravého rohu
   bez čísla"*). Národnosť je vždy viditeľná (lock 25. 7.), preto aj tu bez prepínača. */
.me-flag{ display:block; width:${e.xl}px; height:${e.xl}px; border-radius:${d.pill}px; object-fit:cover; border:2px solid ${t.card}; box-shadow:${t.panelShadow}; }
.me-bones{ display:inline-flex; align-items:center; gap:${e.xs}px; padding:${e.xs}px ${e.md}px; border-radius:${d.pill}px; cursor:pointer;
  background:${Le(fe)}; border:1px solid ${fe.b}; color:${fe.ink}; box-shadow:${t.panelShadow};
  font-family:${l}; font-weight:600; font-size:${o.label}px; letter-spacing:.02em; }
.me-foot{ position:absolute; left:${R.m+y.m+e.sm}px; right:${e.md}px; bottom:-${xe}px; container-type:inline-size; }
/* Meno sa ZMESTÍ, nie odreže (audit 26. 10.: „Alexandra Kováčová" na 360 px končila uprostred písmena).
   Rovnica, nie meranie: Cinzel verzálky + .14em ≈ .92em na znak ⇒ veľkosť = šírka pätičky / (znaky × .92),
   strop = stupeň nadpisu, dno = label 12; až pod dnom nastúpi „…". --nm = počet znakov (nastavuje render). */
.me-nm{ margin:0; font-family:${je}; font-weight:700; letter-spacing:.14em; color:${t.inkStrong}; /* písmo: meno */
  font-size:clamp(${o.label}px, calc(100cqw / (var(--nm, 10) * .92)), ${o.h2}px);
  text-transform:uppercase; line-height:1.15; overflow:hidden;
  /* DLHÉ MENO = DVA RIADKY + ZMENŠOVANIE (Matej 26. 10.: „zalomiť / zmenšovanie"). Viacslovné meno sa
     zalomí medzi slovami; veľkosť ráta rovnica z NAJDLHŠIEHO slova (--nm), nie z celého mena. Tretí riadok
     nie je — nad dvomi nastúpi orez. */
  white-space:normal; overflow-wrap:break-word; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
.me-with{ margin:${e.xs}px 0 0; font-family:${l}; font-size:${o.label}px; font-weight:500; color:${t.inkWarm}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
/* HODNOSTI VEDĽA SEBA (Matej 23. 10.: „až po pravý okraj“ → v ten istý deň neskôr: „pútnika mierne
   rozšír a faraóna zúž, aby to bolo akurát, nerozťahuj to“). Pilulka = svoj obsah + vzduch, nič sa
   nenaťahuje; dlhý stupeň sa skráti. Pod sebou len so „stack“. Ťuk = rozbaľovač MeRank pod hlavou. */
.me-lv{ display:flex; gap:6px; margin-top:${e.sm}px; }
.me-lv > *{ flex:0 1 auto; min-width:0; justify-content:center; display:inline-flex; align-items:center; gap:${e.xs}px; padding:${e.xs}px ${e.sm}px; border-radius:${d.pill}px; white-space:nowrap;
  font-family:${l}; font-weight:600; font-size:${o.micro}px; letter-spacing:.02em; text-transform:uppercase; cursor:pointer; }
.me-lv.stack{ flex-direction:column; align-items:flex-start; gap:${e.xs}px; }
.me-lv.stack > *{ flex:none; letter-spacing:.14em; }
.me-lv > .on{ box-shadow:0 0 0 2px ${t.card}, 0 0 0 3.5px ${s.edge}; }
/* FAREBNÉ BLOKY HODNOSTÍ (Matej 23. 10.: „tie bloky daj farebné, nie bledé, nech je to niečo special").
   Podklad nesie farbu hodnosti (devotion = zlato, pútnik = pásmo z packTiers, štúdium = displej AINUBISA),
   text a pás berú farby z premenných --rk-ink / --rk-dim, ktoré nastaví MeRank. */
.me-rk{ margin:0 0 ${e.md}px; padding:${e.md}px ${e.lg}px; border-radius:${d.tile}px; background:var(--rk-bg); border:1px solid var(--rk-edge);
  box-shadow:${t.panelShadow}; color:var(--rk-ink); }
.me-rk h3{ margin:0; display:flex; justify-content:space-between; align-items:baseline; gap:${e.sm}px; font-family:${je}; font-weight:700; font-size:${o.body}px; letter-spacing:.14em; text-transform:uppercase; color:var(--rk-ink); }
/* HLAVIČKA: ikona stupňa · názov + definícia pod ním · vpravo hore ☥ (ťuk = vysvetlenie). */
.me-rk-hd{ display:flex; align-items:flex-start; gap:${e.md}px; }
.me-rk-hd .tx{ flex:1; min-width:0; }
.me-rk-hd .tx p.me-rk-q{ margin:${e.xs}px 0 0; font-size:${o.label}px; }
.me-rk-hd .ic{ flex:none; display:grid; place-items:center; width:32px; height:32px; border-radius:${d.pill}px; background:var(--dv-dot); box-shadow:0 0 14px var(--dv-glow); }
.me-rk-hd .ic b{ font-family:${l}; font-weight:600; line-height:1; color:var(--dv-icon-ink); font-style:normal; font-size:${o.lead}px; }
.me-rk-hd .ic.pt{ background:var(--rk-fill); box-shadow:none; }
.me-rk-hd .ab{ flex:none; display:inline-flex; align-items:center; gap:${e.xs}px; border:0; background:none; padding:${e.xs}px 0; color:var(--rk-ink);
  font-family:${l}; font-weight:600; font-size:${o.label}px; letter-spacing:.02em; white-space:nowrap; }
.me-rk-hd button.ab{ cursor:pointer; }
.me-rk-hd button.ab:disabled{ cursor:default; }
/* Deliaca čiara DO STRATENA (Matej 23. 10.) — zo stredu sa rozplynie do oboch strán. */
.me-rk-line{ height:1px; border:0; margin:${e.md}px 0; background:linear-gradient(90deg, transparent, var(--rk-edge) 50%, transparent); opacity:.85; }
/* PROGRES: koľaj + žiariaca výplň s pomalým leskom, napravo ďalší stupeň. */
.me-rk-row{ display:flex; align-items:center; gap:${e.md}px; }
.me-rk-nx{ flex:none; display:inline-flex; align-items:center; gap:${e.xs}px; font-family:${l}; font-weight:600; font-size:${o.micro}px;
  letter-spacing:.14em; text-transform:uppercase; color:var(--rk-ink); white-space:nowrap; }
.me-rk-nx .g{ display:grid; place-items:center; width:18px; height:18px; border-radius:${d.pill}px; background:var(--dv-dot); box-shadow:0 0 8px var(--dv-glow); }
.me-rk-nx .g b{ font-family:${l}; font-weight:600; line-height:1; color:var(--dv-icon-ink); font-style:normal; font-size:${o.micro}px; }
.me-rk-nx b{ font-family:${l}; font-weight:600; font-size:${o.label}px; }
.me-rk-bar{ position:relative; flex:1; min-width:0; height:24px; border-radius:${d.pill}px; background:var(--rk-track); overflow:hidden; }
.me-rk-bar > b{ position:absolute; left:0; top:0; bottom:0; border-radius:${d.pill}px; overflow:hidden; transition:width .8s cubic-bezier(.2,.8,.2,1);
  background:linear-gradient(90deg, color-mix(in srgb, var(--rk-fill) 55%, transparent), var(--rk-fill));
  box-shadow:0 0 14px var(--rk-fill), 0 0 4px var(--rk-fill); }
.me-rk-bar > b::after{ content:''; position:absolute; inset:0; background:linear-gradient(100deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%);
  transform:translateX(-100%); animation:me-shine 3.2s ease-in-out infinite; }
@keyframes me-shine{ 0%{ transform:translateX(-100%); } 60%,100%{ transform:translateX(100%); } }
@media (prefers-reduced-motion:reduce){ .me-rk-bar > b::after{ animation:none; } }
.me-rk-bar > span{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding:0 ${e.sm}px; white-space:nowrap; overflow:hidden;
  font-family:${l}; font-weight:600; font-size:${o.micro}px; letter-spacing:.02em; color:var(--rk-ink); }
.me-rk-bar > span.in{ color:var(--rk-bg-ink); }
.me-rk h3 small{ font-family:${l}; font-weight:500; font-size:${o.micro}px; letter-spacing:.02em; text-transform:none; color:var(--rk-dim); }
.me-rk p{ margin:${e.sm}px 0 0; font-family:${l}; font-size:${o.label}px; line-height:1.45; color:var(--rk-ink); }
.me-rk .pk-progress{ margin-top:${e.sm}px; background:rgba(0,0,0,.22); }
.me-rk .pk-progress__fill{ background:var(--rk-fill); }
.me-rk-sc{ display:flex; gap:${e.xs}px; margin:${e.md}px -${e.lg}px 0; padding:0 ${e.lg}px ${e.xs}px; overflow-x:auto; scrollbar-width:none; }
.me-rk-sc::-webkit-scrollbar{ display:none; }
.me-rk-sc span{ flex:none; padding:${e.xs}px ${e.sm}px; border-radius:${d.pill}px; border:1px solid var(--rk-edge); font-family:${l}; font-size:${o.micro}px; color:var(--rk-dim); opacity:.7; white-space:nowrap; }
.me-rk-sc span.done{ opacity:1; }
.me-rk-sc span.cur{ opacity:1; background:var(--rk-fill); border-color:var(--rk-fill); color:var(--rk-bg-ink); font-weight:600; }
.me-rk-nums{ display:grid; grid-template-columns:repeat(3,1fr); margin-top:${e.md}px; text-align:center; }
.me-rk-nums b{ display:block; font-family:${l}; font-weight:600; font-size:${o.lead}px; color:var(--rk-ink); }
.me-rk-nums span{ font-family:${l}; font-size:${o.micro}px; color:var(--rk-dim); }
.me-rk-link{ display:inline-flex; align-items:center; gap:${e.xs}px; margin-top:${e.md}px; border:0; background:none; padding:0; cursor:pointer;
  font-family:${l}; font-weight:600; font-size:${o.label}px; color:var(--rk-ink); text-decoration:underline; text-underline-offset:3px; }
.me-dv{ background:var(--dv-bg); border:1px solid var(--dv-edge); color:var(--dv-ink); padding-left:${e.xs}px !important; }
/* NOC + ŽIARA (Matej 23. 10.): farbu stupňa nesie žiariaca gulička s kresbou (devotionTiers.ts). */
.me-dvg{ flex:none; display:grid; place-items:center; width:18px; height:18px; border-radius:${d.pill}px;
  background:var(--dv-dot); box-shadow:0 0 8px var(--dv-glow); }
.me-dvg b{ font-family:${l}; font-weight:600; line-height:1; color:var(--dv-icon-ink); font-style:normal; font-size:${o.micro}px; letter-spacing:0; }
.me-lv > .me-dv{ padding-right:${e.md}px; }
.me-lv > .me-pt{ flex:none; min-width:52px; padding:${e.xs}px ${e.md}px; }
.me-rk p.me-rk-q{ font-style:italic; color:var(--rk-dim); }
.me-rk-sc span{ display:inline-flex; align-items:center; gap:${e.xs}px; }
.me-rk-py{ display:flex; flex-direction:column; align-items:center; gap:2px; margin-top:${e.md}px; }
.me-rk-py span{ display:flex; align-items:center; justify-content:center; height:14px; border-radius:${d.pill}px; overflow:hidden; white-space:nowrap;
  border:1px solid var(--rk-edge); background:var(--rk-track); color:var(--rk-dim); opacity:.55;
  font-family:${l}; font-weight:600; font-size:${o.micro}px; line-height:1; letter-spacing:.02em; text-transform:uppercase; }
.me-rk-py span.done{ opacity:1; background:var(--dv-dot); border-color:var(--dv-glow); color:var(--dv-icon-ink); }
.me-rk-py span.on{ opacity:1; height:24px; background:var(--dv-dot); border-color:var(--dv-glow); color:var(--dv-icon-ink); box-shadow:0 0 14px var(--dv-glow); }
.me-rk-py span.gold,.me-rk-py span.sun{ opacity:.85; background:var(--dv-bg); border-color:var(--dv-edge); color:var(--dv-ink); }
.me-rk-sc span i{ display:grid; place-items:center; width:18px; height:18px; font-style:normal; border-radius:${d.pill}px; background:var(--dv-dot); }
.me-rk-sc span i b{ font-family:${l}; font-weight:600; line-height:1; color:var(--dv-icon-ink); font-style:normal; font-size:${o.micro}px; }
.me-pt{ background:var(--tier-bg); border:1px solid var(--tier-b); color:var(--tier-ink); cursor:pointer; }

.me-under{ position:relative; padding:0 ${e.lg}px ${e.lg}px; }
.me-own{ position:absolute; z-index:3; left:${R.m}px; top:-${y.m-xe}px; width:${y.m}px; height:${y.m}px;
  border-radius:${d.pill}px; padding:${e.xs}px; background:${se}; box-shadow:${t.panelShadow}; }
.me-own > button:first-child{ display:block; width:100%; height:100%; padding:0; border:0; border-radius:${d.pill}px; overflow:hidden; cursor:pointer; background:${t.card}; }
.me-own > button:first-child img{ width:100%; height:100%; object-fit:cover; object-position:50% 14%; display:block; border-radius:${d.pill}px; border:4px solid ${t.card}; }
/* STORIES (23. 10. 2026, Matej: *„obruč ktorá žiari"*). Živá story = prstenec RING sa otáča a dýcha
   zlatou žiarou; bez story = bezfarebný kruh (v6: *„bez story = bezfarebný kruh + lapis plus"*).
   Prstenec je ::before POD fotkou (z-index -1 vnútri .me-own), aby sa točila len obruč, nie tvár. */
.me-own.st-live, .me-own.st-none{ background:none; }
.me-own.st-live::before, .me-own.st-none::before{ content:''; position:absolute; inset:0; z-index:-1; border-radius:${d.pill}px; }
.me-own.st-live::before{ background:${se}; animation:me-spin 6s linear infinite; }
.me-own.st-live{ animation:me-glow 2.4s ease-in-out infinite; }
.me-own.st-none::before{ background:${t.border}; }
@keyframes me-spin{ to{ transform:rotate(360deg); } }
@keyframes me-glow{ 0%,100%{ box-shadow:${t.panelShadow}; } 50%{ box-shadow:0 0 0 2px color-mix(in srgb, ${t.cardEdge} 35%, transparent), 0 0 24px 6px color-mix(in srgb, ${t.cardEdge} 55%, transparent); } }
@media (prefers-reduced-motion:reduce){ .me-own.st-live, .me-own.st-live::before{ animation:none; } }
/* + pridať story — lapisový kotúč vpravo dole na fotke (len môj profil). */
.me-add{ position:absolute; z-index:2; right:0; bottom:${e.sm}px; width:32px; height:32px; padding:0; border-radius:${d.pill}px; display:grid; place-items:center; cursor:pointer;
  background:${s.grad}; border:2px solid ${t.card}; box-shadow:${X}; }
.me-sdog{ position:relative; border:0; cursor:pointer; }
.me-sdog:disabled{ cursor:default; opacity:.7; }
.me-sdog .cam{ color:${s.ink}; position:absolute; right:-${e.sm}px; bottom:-${e.xs}px; width:28px; height:28px; border-radius:${d.pill}px; display:grid; place-items:center;
  background:${s.grad}; border:2px solid ${t.card}; box-shadow:${X}; }
.me-own .ini{ display:grid; place-items:center; width:100%; height:100%; font-family:${l}; font-weight:600; font-size:${o.h1}px; color:${t.inkWarm}; }
${oa}
/* PAWMATE VEDĽA MAJITEĽA (26. 10. 2026, Matej: *„pridá sa vedľa ako fotka a pes, ak bude jeden, pôjde medzi nich"*).
   Polohy v % z fotky majiteľa (jedna rovnica pre mobil 126 aj PC 158): pawmate = MATE_D, vpravo, majiteľ ho
   zľahka prekrýva; jediný pes sedí dole na ich styku. Meno na titulke ustúpi o presah pawmata (MATE_OUT). */
.me-own > button:first-child{ position:relative; z-index:1; }
.me-mate{ position:absolute; z-index:0; left:${ue.left}; top:${ue.top}; width:${ue.d}; aspect-ratio:1; padding:0; border:0; cursor:pointer;
  border-radius:${d.pill}px; background:${t.card}; box-shadow:0 0 0 2px ${t.border}, ${t.panelShadow}; }
.me-mate img, .me-mate i{ width:100%; height:100%; display:grid; place-items:center; border-radius:${d.pill}px; object-fit:cover; border:3px solid ${t.card}; background:${t.card};
  font-style:normal; font-family:${l}; font-weight:600; font-size:${o.h2}px; color:${t.inkWarm}; }
.me-card.with-mate .me-foot{ left:${R.m+Math.round(y.m*ie)+e.sm}px; }
.me-flat.with-mate .me-foot{ left:${Na+Math.round(y.m*ie)+e.sm}px; }
.me-card.with-mate .me-foot .rk-row{ zoom:.86; }
@media (min-width:768px){
  .me-card.with-mate .me-foot{ left:${R.pc+Math.round(y.pc*ie)+e.lg}px; }
  .me-flat.with-mate .me-foot{ left:${e.xl+Math.round(y.pc*ie)+e.lg}px; }
  .me-card.with-mate .me-foot .rk-row{ zoom:1; }
}
.me-sat{ position:absolute; left:50%; transform:translateX(-50%); bottom:-${_e.m}px; display:flex; align-items:center;
  padding:0; border:0; background:none; cursor:pointer; }
.me-sat .s{ width:${K.m}px; height:${K.m}px; border-radius:${d.pill}px; padding:${e.xs}px; background:${se}; margin-left:-18px;
  box-shadow:0 0 0 2px ${t.card}, ${t.panelShadow}; }
.me-sat .s:first-child{ margin-left:0; }
.me-sat .s img{ width:100%; height:100%; border-radius:${d.pill}px; object-fit:cover; display:block; border:2px solid ${t.card}; }
.me-sat .cnt{ position:absolute; right:-${e.sm}px; top:-${e.xs}px; min-width:22px; height:22px; padding:0 ${e.xs}px; border-radius:${d.pill}px;
  background:${s.grad}; color:${s.ink}; border:1.5px solid ${t.card}; display:grid; place-items:center;
  font-family:${l}; font-weight:600; font-size:${o.micro}px; }
.me-sat .up{ width:30px; height:30px; border-radius:${d.pill}px; display:grid; place-items:center; background:${s.grad};
  box-shadow:${X}; border:2px solid ${t.card}; }
.me-sat .up img{ transform:rotate(90deg); }
.me-card.open .me-sat{ bottom:-15px; }

.me-drawer{ margin:0 -${e.lg}px; max-height:0; opacity:0; overflow:hidden; transition:max-height .45s ease, opacity .3s ease;
  background:linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${t.cardEdge} 14%, transparent) 45%, transparent 100%); }
.me-card.open .me-drawer{ max-height:1200px; opacity:1; }
.me-drow{ display:flex; flex-wrap:wrap; align-items:center; gap:${e.sm}px; padding:${e.md}px ${e.sm}px ${e.md}px ${Pe.m}px; }
.me-drow:first-child{ padding-top:${e.xxl}px; }
.me-drow + .me-drow{ border-top:1px solid ${t.hairline}; }
.me-drow:last-child{ padding-bottom:${e.xl}px; }
.me-dp{ position:relative; flex:none; width:${I.m}px; height:${I.m}px; border-radius:${d.pill}px; padding:${e.xs}px; background:${se};
  box-shadow:${t.panelShadow}; border:0; cursor:pointer; }
.me-dp img{ width:100%; height:100%; border-radius:${d.pill}px; object-fit:cover; display:block; border:2px solid ${t.card}; }
.me-dp-ini{ display:grid; place-items:center; width:100%; height:100%; border-radius:${d.pill}px; background:${t.card}; font-family:${l}; font-weight:600; font-size:${o.h1}px; color:${t.inkWarm}; }
.me-no{ display:inline-flex; align-items:center; background:${s.grad}; color:${s.ink}; box-shadow:${X};
  font-family:${l}; font-weight:600; font-size:${o.micro}px; letter-spacing:.02em; padding:0 ${e.sm}px; border-radius:${d.pill}px;
  border:1.5px solid ${t.card}; white-space:nowrap; }
.me-dp .me-no{ position:absolute; left:50%; bottom:-${e.sm}px; transform:translateX(-50%); }
.me-hg{ flex:1; min-width:0; position:relative; height:56px; padding:0; border:0; background:none; cursor:pointer; }
.me-hg .fa, .me-hg .ba{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:${e.sm}px;
  transition:opacity .45s ease, transform .45s ease; }
.me-hg .fa img{ max-width:100%; max-height:100%; display:block; object-fit:contain; }
.me-hg .ba{ opacity:0; transform:translateY(4px); }
.me-hg .ba b{ font-family:${De}; font-weight:700; font-size:${o.h2}px; color:${t.inkStrong}; white-space:nowrap; overflow:hidden; }
.me-hg .empty{ font-family:${l}; font-size:${o.label}px; color:${t.inkWarm}; }
.me-drow.flip .me-hg .fa{ opacity:0; transform:scale(.96); }
.me-drow.flip .me-hg .ba{ opacity:1; transform:none; }
.me-dinfo{ flex-basis:100%; max-height:0; opacity:0; overflow:hidden; transition:max-height .45s ease, opacity .3s ease; }
.me-drow.flip .me-dinfo{ max-height:240px; opacity:1; }
.me-dedit{ display:inline-flex; align-items:center; gap:${e.xs}px; margin-top:${e.sm}px; padding:${e.xs}px ${e.md}px; border-radius:${d.pill}px;
  background:transparent; border:1.5px solid ${s.edge}; color:${s.edge}; cursor:pointer;
  font-family:${l}; font-weight:600; font-size:${o.micro}px; letter-spacing:.14em; text-transform:uppercase; }
.me-dedit:hover{ background:${s.fill}; }
.me-dinfo .none{ color:${t.inkFaint}; font-style:italic; cursor:pointer; }
.me-dinfo p{ margin:${e.xs}px 0 0; font-family:${l}; font-size:${o.label}px; line-height:1.45; color:${t.ink};
  display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden; }
.me-gap{ height:${Se.m}px; }
.me-card.open .me-gap{ height:0; }

.me-stats{ display:grid; grid-template-columns:repeat(5,1fr); margin:${e.md}px 0 0; padding:${e.sm}px 0; }
.me-stats button{ background:none; border:0; padding:0; cursor:pointer; color:inherit; text-align:center; min-width:0; }
.me-stats b{ display:block; font-family:${l}; font-weight:600; font-size:${o.lead}px; color:${t.inkStrong}; line-height:1.2; white-space:nowrap; }
.me-stats b.na{ color:${t.alertRed}; }
.me-stats span{ display:block; font-family:${l}; font-size:${o.micro}px; color:${t.inkWarm}; white-space:nowrap; }
.me-btns{ display:grid; grid-template-columns:1fr 1fr; gap:${e.sm}px; margin-top:${e.md}px; }
/* Tlačidlá v Grotesku, meno ostáva Cinzel (Matej 25. 10.: *„meno cinzel a tlačidlá skús grotesk“*). */
.me-btns button{ font-family:${l}; font-weight:600; font-size:${o.micro}px; letter-spacing:.14em; text-transform:uppercase; white-space:nowrap;
  padding:${e.md}px ${e.sm}px; border-radius:${d.field}px; cursor:pointer; }
.me-cta{ background:${s.grad}; color:${s.ink}; border:1px solid ${s.deep}; box-shadow:${X}; }
.me-cta:hover{ background:${s.gradHover}; }
.me-out{ background:transparent; color:${s.edge}; border:1.5px solid ${s.edge}; }
.me-out:hover{ background:${s.fill}; }
.me-role{ display:flex; flex-wrap:wrap; gap:${e.xs}px; margin-top:${e.md}px; }
.me-role .pk-pill{ font-family:${l}; font-weight:600; font-size:${o.micro}px; letter-spacing:.14em; text-transform:uppercase; padding:${e.xs}px ${e.md}px; }
.me-bio{ margin:${e.sm}px 0 0; }
.me-bio p{ margin:0; font-family:${l}; font-size:${o.body}px; line-height:1.45; color:${t.ink};
  display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:3; overflow:hidden; }
.me-bio.full p{ display:block; }
.me-bio .sig{ color:${t.inkWarm}; font-size:${o.label}px; white-space:nowrap; }
.me-bio .sig b{ font-family:${De}; font-weight:700; }
.me-bio.empty p{ color:${t.inkFaint}; font-style:italic; }
.me-more{ background:none; border:0; padding:0; margin-top:2px; cursor:pointer; font-family:${l}; font-weight:500; font-size:${o.label}px; color:${s.edge}; }
/* Pás pilulek — pretŕča cez pravý okraj karty, aby bolo vidno, že sa dá ťahať (Matej 22. 10.). */
.me-strip{ display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; margin:${e.sm}px -${e.lg}px 0 0; padding:0 ${e.lg}px 2px 0; }
.me-strip::-webkit-scrollbar{ display:none; }
.me-strip .pk-pill{ flex:none; font-family:${l}; font-weight:500; font-size:${o.micro}px; letter-spacing:.14em; text-transform:uppercase; padding:${e.xs}px ${e.sm}px; }
.me-strip .pk-pill i{ font-style:normal; letter-spacing:0; }
.me-dinfo .me-strip{ margin-right:-${e.sm}px; padding-right:${e.sm}px; }

.me-tabs{ display:grid; grid-auto-flow:column; grid-auto-columns:1fr; border-bottom:1px solid ${t.hairline}; margin-top:${e.lg}px; }
.me-tabs button{ display:flex; flex-direction:column; align-items:center; gap:${e.xs}px; background:none; border:0; cursor:pointer;
  padding:${e.sm}px 0; font-family:${l}; font-size:${o.micro}px; letter-spacing:.14em; text-transform:uppercase;
  color:${t.inkWarm}; white-space:nowrap; }
.me-tabs button img{ opacity:.5; }
.me-tabs button.on{ color:${t.inkStrong}; box-shadow:inset 0 -2px 0 ${t.cardEdge}; }
.me-tabs button.on img{ opacity:1; }
.me-sub{ display:flex; gap:6px; margin-top:${e.sm}px; }
.me-sub .pk-pill{ font-family:${l}; font-size:${o.micro}px; letter-spacing:.14em; text-transform:uppercase; padding:${e.xs}px ${e.md}px; }
.me-sub .pk-pill.on{ background:${s.fill}; border-color:${s.edge}; color:${s.edge}; }
/* Každá karta má TÚ ISTÚ dlaždicu (Matej 22. 10.: „každá položka by mala mať tú istú veľkosť"). */
.me-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-top:4px; }
.me-grid button{ position:relative; aspect-ratio:4/5; padding:0; border:0; overflow:hidden; border-radius:${d.field}px; background:${t.tileBg}; cursor:pointer; }
.me-grid img{ width:100%; height:100%; object-fit:cover; display:block; }
.me-grid .cap{ position:absolute; left:0; right:0; bottom:0; padding:${e.lg}px ${e.sm}px ${e.sm}px; text-align:left;
  background:linear-gradient(180deg, transparent, color-mix(in srgb, ${t.pageBg} 80%, transparent));
  font-family:${l}; font-weight:600; font-size:${o.micro}px; line-height:1.2; color:${s.ink}; }
.me-grid--story button{ aspect-ratio:9/16; }
.me-tag{ position:absolute; left:4px; top:4px; font-family:${l}; font-size:${o.micro}px; letter-spacing:.14em; background:${s.grad}; color:${s.ink}; padding:0 ${e.sm}px; border-radius:${d.pill}px; }
.me-by{ position:absolute; left:0; right:0; bottom:0; display:flex; align-items:center; gap:${e.xs}px; padding:${e.lg}px ${e.xs}px ${e.xs}px; min-width:0;
  background:linear-gradient(180deg, transparent, color-mix(in srgb, ${t.pageBg} 80%, transparent)); }
.me-by .pk-medallion{ flex:none; font:600 ${o.micro}px/1 ${l}; color:${t.inkWarm}; }
.me-by .nm{ min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-family:${l}; font-weight:600; font-size:${o.micro}px; color:${s.ink}; }
.me-sv{ display:flex; flex-direction:column; gap:${e.sm}px; align-items:stretch; }
.me-sv video{ width:100%; border-radius:${d.field}px; background:${t.tileBg}; }
.me-sv .q{ margin:0; font-family:${l}; font-size:${o.body}px; line-height:1.5; color:${t.inkStrong}; white-space:pre-line; }
.me-sv small{ font-family:${l}; font-size:${o.label}px; color:${t.inkWarm}; }
.me-sv .rm{ align-self:center; margin-top:${e.sm}px; background:none; border:0; cursor:pointer; padding:${e.sm}px ${e.md}px; font-family:${l}; font-weight:600; font-size:${o.label}px; color:${t.inkWarm}; text-decoration:underline; }
.me-empty{ padding:${e.xl}px ${e.lg}px; text-align:center; font-family:${l}; font-size:${o.body}px; color:${t.inkWarm}; }

@media (min-width:768px){
  .me-cover{ height:${ce.pc}px; }
  .me-foot{ left:${R.pc+y.pc+e.lg}px; bottom:-${e.lg}px; }
  .me-nm{ font-size:clamp(${o.label}px, calc(100cqw / (var(--nm, 10) * .92)), ${o.h1}px); }
  .me-lv{ max-width:360px; }
  .me-lv > *{ letter-spacing:.14em; }
  .me-under{ padding:0 ${e.xl}px ${e.xl}px; }
  .me-own{ left:${R.pc}px; top:-${y.pc-e.lg}px; width:${y.pc}px; height:${y.pc}px; }
  .me-sat{ bottom:-${_e.pc}px; }
  .me-sat .s{ width:${K.pc}px; height:${K.pc}px; }
  .me-gap{ height:${Se.pc}px; }
  .me-drawer{ margin:0 -${e.xl}px; }
  .me-drow{ padding-left:${Pe.pc}px; gap:${e.lg}px; }
  .me-drow:first-child{ padding-top:${e.xxxl}px; }
  .me-dp{ width:${I.pc}px; height:${I.pc}px; }
  .me-dp .me-no{ font-size:${o.label}px; }
  /* PC: heroglyf menší a meno HNEĎ VEDĽA (Matej 22. 10.) — ťuk ukáže bio a pilulky psa. */
  .me-hg{ flex:0 1 auto; height:72px; display:flex; align-items:center; gap:${e.lg}px; }
  .me-hg .fa, .me-hg .ba{ position:static; opacity:1; transform:none; height:100%; }
  .me-hg .ba b{ font-size:${o.h1}px; }
  .me-drow.flip .me-hg .fa{ opacity:1; transform:none; }
  /* PC: rozbalený šuplík = ako mobil po ťuku — bio a pilulky psa hneď (Matej 23. 10.). */
  .me-dinfo{ padding-left:${I.pc+e.lg}px; max-height:240px; opacity:1; }
  .me-strip{ margin-right:0; padding-right:0; }
  .me-bio{ max-width:560px; }
  .me-grid{ grid-template-columns:repeat(5,1fr); }
}
`,H=`(env(safe-area-inset-top, 0px) + ${Je.content}px)`,le="linear-gradient(180deg, #000 0%, #000 42%, transparent 100%)",Te=20,Me={m:20,pc:19},B=e.lg,ge={m:68,pc:85},Fe=48,V={m:y.m-ge.m+14,pc:y.pc-ge.pc+14},pe={m:V.m+28+24+46+16,pc:V.pc+28+24+46+16},Oe={m:V.m+28,pc:V.pc+28},Ca=136,Ea=`
html.papyrus3d .me-flat .me-cover::before{-webkit-mask-image:none;mask-image:none;border-block:2.5px solid var(--p3d-ink);}
html.papyrus3d .me-cover.no-cov::before{background:linear-gradient(color-mix(in srgb,var(--p3d-paper,#F3E4C4) 62%,transparent),color-mix(in srgb,var(--p3d-paper,#F3E4C4) 62%,transparent)),url('/images/bg-dark.webp') center/cover no-repeat;} /* Matej 19. 11.: pozadie nemá byť také tmavé — papyrusový závoj */
html.papyrus3d .me-flat .me-own{left:50%;transform:translateX(-50%);top:-${ge.m}px;padding:0;background:none;box-shadow:none;}
html.papyrus3d .me-own::before,html.papyrus3d .me-own::after{display:none;}
html.papyrus3d .me-own > button:first-child{border:4px solid var(--p3d-gold);box-shadow:0 0 0 2px var(--p3d-ink),0 5px 0 2px var(--p3d-ink);background:linear-gradient(180deg,${s.edge},${s.deep});}
html.papyrus3d .me-own > button:first-child img{border:0;}
html.papyrus3d .me-own .ini{font-family:'LT Museum',serif;font-weight:400;font-size:${Fe}px;color:${s.ink};} /* písmo: nadpis */
html.papyrus3d .me-own .me-arc .ad{left:92% !important;top:30% !important;width:74% !important;padding:0;background:none;border:3px solid var(--p3d-gold);box-shadow:0 0 0 2px var(--p3d-ink),0 4px 0 2px var(--p3d-ink);}
html.papyrus3d .me-own .me-arc .ad .ad-ini{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:var(--p3d-card);font-family:'LT Museum',serif;font-weight:400;font-size:${Fe}px;color:var(--p3d-ink);} /* písmo: meno */
html.papyrus3d .me-own .me-arc .ad img{border:0;}
html.papyrus3d .me-card.open .me-own .me-sat{left:calc(92% + 22%);bottom:auto;top:45%;transform:none;}
html.papyrus3d .me-own .me-arc .ad:nth-child(n+2){display:none;}
html.papyrus3d .me-own .me-arc .ad.me-sdog{left:104% !important;} /* UPRAVIŤ PROFIL: psí medailón nesmie zasahovať do avatara (Matej 19. 11.) */
html.papyrus3d .me-flat .me-mate{left:-66%;top:30%;width:74%;border:3px solid var(--p3d-gold);box-shadow:0 0 0 2px var(--p3d-ink),0 4px 0 2px var(--p3d-ink);}
html.papyrus3d .me-flat .me-mate img,html.papyrus3d .me-flat .me-mate i{border:0;}
html.papyrus3d .me-flat .me-foot,html.papyrus3d .me-flat.with-mate .me-foot{left:${B}px;right:${B}px;top:calc(100% + ${V.m}px);bottom:auto;text-align:center;}
html.papyrus3d .me-nm{font-family:'LT Museum',serif;font-weight:400;letter-spacing:0;text-transform:none;color:var(--p3d-ink);display:block;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;
  font-size:clamp(${o.lead}px,calc(100cqw / (var(--nl, 12) * .58)),${o.h1}px);} /* písmo: meno */
html.papyrus3d .me-with{color:var(--p3d-ink);}
html.papyrus3d .me-flat .me-lv.rk-row,html.papyrus3d .me-flat.with-mate .me-foot .me-lv.rk-row{justify-content:space-around;margin-top:${e.xl}px;padding:0 ${e.xs}px;zoom:1;}
html.papyrus3d .me-flat .me-lv.rk-row > .rk{--s:46px;}
html.papyrus3d .me-flat .me-gap{height:${pe.m}px;}
html.papyrus3d .me-card.open.me-flat .me-gap{height:0;}
html.papyrus3d .me-card.open.me-flat .me-drawer{padding-top:${pe.m}px;}
html.papyrus3d .me-flat .me-drow:first-child{padding-top:${e.md}px;}
/* PROFIL JA: šuplík psov sa otvára POD MENOM a NAD odznakmi (Matej 9. 11. 2026) — odznaky sú v toku za šuplíkom (MeBadges),
   medzera pod titulkou nesie len meno. Rezerva P3D_GAP sa tak rozdelila na meno (P3D_NAME_GAP) + odznaky (margin xl + rad + 16). */
html.papyrus3d .me-card.me-bout.me-flat .me-gap,html.papyrus3d .me-card.open.me-bout.me-flat .me-gap{height:${Oe.m}px;}
html.papyrus3d .me-card.open.me-bout.me-flat .me-drawer{padding-top:0;}
html.papyrus3d .me-bout.me-flat .me-lv.rk-row{margin-bottom:${e.lg}px;}
html.papyrus3d .me-card.open.me-bout.me-flat .me-lv.rk-row{margin-top:0;}
html.papyrus3d .me-dp{background:none;border:3px solid var(--p3d-gold);box-shadow:0 0 0 2px var(--p3d-ink);}
html.papyrus3d .me-dp img{border:0;}
html.papyrus3d .me-hg .ba b{font-family:'Cinzel Decorative',serif;color:var(--p3d-ink);} /* písmo: meno */
html.papyrus3d .me-dinfo p{color:var(--p3d-ink);}
html.papyrus3d .me-dedit{border:2.5px solid var(--p3d-ink);color:var(--p3d-ink);border-radius:${d.tile}px;background:var(--p3d-card);box-shadow:var(--p3d-lift);}
html.papyrus3d .me-cvbtn{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:var(--p3d-lift);}
html.papyrus3d .me-stats{grid-template-columns:repeat(3,1fr);margin-top:${e.md}px;padding:${e.sm}px 0;border:2.5px solid var(--p3d-ink);border-radius:${d.card}px;background:var(--p3d-card);box-shadow:var(--p3d-lift);}
html.papyrus3d .me-stats button:nth-child(n+4){display:none;}
html.papyrus3d .me-stats button + button{border-left:2px solid color-mix(in srgb,var(--p3d-gold-solid) 70%,transparent);}
html.papyrus3d .me-stats b{font-size:${o.h1}px;color:var(--p3d-ink);}
html.papyrus3d .me-stats b.na{color:#C8202F;}
html.papyrus3d .me-stats span{font-size:${o.body}px;color:var(--p3d-ink);}
html.papyrus3d .me-btns{gap:${e.md}px;margin-top:${e.xl}px;}
${Ee(".me-btns .pk-b3","paper","font-size:"+o.h2+"px;padding:0 "+e.sm+"px;white-space:nowrap;")}
html.papyrus3d .me-btns .pk-b3--lapis{--b3-a:color-mix(in srgb,${s.edge} 72%,white);--b3-b:${s.deep};--b3-p:color-mix(in srgb,${s.deep} 60%,black);--b3-l:${s.ink};--b3-i:${s.ink};}
html.papyrus3d .me-role--label span{color:var(--p3d-gold-ink);}
html.papyrus3d .me-role--label i{background:linear-gradient(90deg,var(--p3d-gold),transparent);}
html.papyrus3d .me-bio p{color:var(--p3d-ink);font-size:${o.lead}px;}
html.papyrus3d .me-bio.empty p{color:var(--p3d-gold-ink);}
html.papyrus3d .me-more{color:${s.edge};}
html.papyrus3d .me-strip .pk-pill{border:2px solid var(--p3d-ink);color:var(--p3d-ink);background:var(--p3d-card);}
html.papyrus3d .me-tabs{gap:${e.xs}px;margin-top:${e.xl}px;padding:${e.xs}px;border:2.5px solid var(--p3d-ink);border-radius:${d.card}px;background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--p3d-inset);}
html.papyrus3d .me-tabs button{flex-direction:row;justify-content:center;gap:${e.sm}px;min-height:50px;padding:0;border:2.5px solid transparent;border-radius:${d.frame}px;font-family:'LT Museum',serif;font-weight:400;font-size:${o.lead}px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);} /* písmo: cta */
html.papyrus3d .me-tabs button img{opacity:1;}
html.papyrus3d .me-tabs button.on{color:${s.ink};background:linear-gradient(180deg,color-mix(in srgb,${s.edge} 72%,white),${s.deep});border-color:${s.ink};box-shadow:inset 0 2px 0 color-mix(in srgb,white 28%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 4px 0 color-mix(in srgb,${s.deep} 60%,black);}
html.papyrus3d .me-tabs button.on img{filter:none;}
html.papyrus3d .me-grid{gap:${e.sm}px;}
html.papyrus3d .me-grid button{border:2.5px solid var(--p3d-ink);border-radius:${d.tile}px;box-shadow:var(--p3d-lift);}
html.papyrus3d .me-tag{border:2px solid var(--p3d-ink);}
html.papyrus3d .me-empty{color:var(--p3d-gold-ink);}
/* ROZKLIK ODZNAKU (L7, L8): karta so zlatým rámom, hore lúče lapisu s odznakom, pod nimi papyrus. */
html.papyrus3d .me-rk{margin-top:${e.xl}px;padding:0 ${e.lg}px ${e.lg}px;border:3px solid var(--p3d-gold);border-radius:${d.card}px;background:var(--p3d-card) !important;box-shadow:0 0 0 2px var(--p3d-ink),0 7px 0 2px var(--p3d-gold-ink),0 13px 16px var(--p3d-sh);overflow:hidden;color:var(--p3d-ink);}
html.papyrus3d .me-rk .rkp-hd{position:relative;flex-direction:column;align-items:center;gap:0;margin:0 -${e.lg}px ${e.sm}px;padding:${e.lg}px ${e.lg}px 0;}
html.papyrus3d .me-rk .rkp-hd::before{content:'';position:absolute;left:0;right:0;top:0;height:${Ca}px;border-bottom:3px solid var(--p3d-gold);background:repeating-conic-gradient(from 0deg at 50% 60%,${s.deep} 0 7.5deg,color-mix(in srgb,${s.edge} 55%,#8a93b8) 7.5deg 15deg);}
html.papyrus3d .me-rk .rkp-hd .im{position:relative;z-index:1;width:96px;height:96px;margin-bottom:${e.xl}px;}
html.papyrus3d .me-rk .rkp-hd .im img{width:calc(96px * var(--k, 1.4));}
html.papyrus3d .me-rk .rkp-hd .tx{position:relative;z-index:1;text-align:center;}
html.papyrus3d .me-rk .rkp-hd h3{justify-content:center;text-align:center;font-family:'LT Museum',serif;font-weight:400;font-size:${o.h1}px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);} /* písmo: nadpis */
html.papyrus3d .me-rk .rkp-hd p{color:var(--p3d-ink);}
html.papyrus3d .me-rk .rkp-hd .ab{position:relative;z-index:1;margin-top:${e.xs}px;color:var(--p3d-gold-ink);}
/* Pás postupu PÚTNIKA a UČŇA = zvýraznený blok ako číselné dlaždice (Matej 9. 11. 2026). */
html.papyrus3d .me-rk .rkp-prog{margin-top:${e.md}px;padding:${e.md}px ${e.md}px ${e.sm}px;border:2.5px solid var(--p3d-ink);border-radius:${d.card}px;background:var(--p3d-card);box-shadow:var(--p3d-lift);}
html.papyrus3d .me-rk .rkp-prog .rkp-lbl{margin-top:0;}
html.papyrus3d .me-rk .rkp-lbl{justify-content:center;text-align:center;color:var(--p3d-gold-ink);font-size:${o.label}px;}
html.papyrus3d .me-rk .rkp-lbl b{color:var(--p3d-ink);}
html.papyrus3d .me-rk .rkp-bar{height:24px;border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);}
html.papyrus3d .me-rk .rkp-bar span{color:var(--p3d-ink);text-shadow:none;}
html.papyrus3d .me-rk .rkp-nx,html.papyrus3d .me-rk .rkp-cap,html.papyrus3d .me-rk .rkp-how,html.papyrus3d .me-rk .rkp-since p{color:var(--p3d-ink);}
html.papyrus3d .me-rk .rkp-nx{justify-content:center;}
html.papyrus3d .me-rk .rkp-since b{color:var(--p3d-ink);}
html.papyrus3d .me-rk .rkp-nums{gap:${e.sm}px;margin-top:${e.md}px;}
html.papyrus3d .me-rk .rkp-nums > div{padding:${e.sm}px ${e.xs}px;border:2.5px solid var(--p3d-ink);border-radius:${d.card}px;background:var(--p3d-card);box-shadow:var(--p3d-lift);}
html.papyrus3d .me-rk .rkp-nums b{font-size:${o.h1}px;color:var(--p3d-ink);}
html.papyrus3d .me-rk .rkp-nums span{font-size:${o.label}px;color:var(--p3d-ink);}
html.papyrus3d .me-rk .rkp-lad,html.papyrus3d .me-rk .bd-sec{border-top-color:var(--p3d-gold);}
html.papyrus3d .me-rk .rkp-lad small{color:var(--p3d-ink);}
html.papyrus3d .me-rk .rkp-lad .on small{color:var(--p3d-gold-ink);}
${Ee(".me-rk .rkp-act","paper","width:100%;margin-top:"+e.md+"px;")}
html.papyrus3d .me-rk .rkp-act svg,html.papyrus3d .me-rk .rkp-act img{filter:brightness(0);}
@media (min-width:768px){
  html.papyrus3d .me-flat .me-own{top:-${ge.pc}px;}
  html.papyrus3d .me-flat .me-foot,html.papyrus3d .me-flat.with-mate .me-foot{left:${e.xl}px;right:${e.xl}px;top:calc(100% + ${V.pc}px);bottom:auto;}
  html.papyrus3d .me-flat .me-gap{height:${pe.pc}px;}
  html.papyrus3d .me-card.open.me-flat .me-drawer{padding-top:${pe.pc}px;}
  html.papyrus3d .me-card.me-bout.me-flat .me-gap,html.papyrus3d .me-card.open.me-bout.me-flat .me-gap{height:${Oe.pc}px;}
  html.papyrus3d .me-card.open.me-bout.me-flat .me-drawer{padding-top:0;}
  html.papyrus3d .me-flat .me-cover::before{-webkit-mask-image:none;mask-image:none;}
  html.papyrus3d .me-flat .me-lv.rk-row{max-width:none;gap:${e.xl}px;}
}
`,Ja=`
.me-flat .me-nm{ font-weight:900; }
.me-card.me-flat{ border:0; border-radius:0; background:none; box-shadow:none; margin:calc(-1 * ${H}) -${e.lg}px 0; }
.me-flat .me-cover{ height:calc(${ce.m+Te}px + ${H}); }
/* Fotka (::before) začína POD horným radom — nie maskou nad ním. Tak sa výrez (coverY) aj ťahanie v UPRAVIŤ
   rátajú z výšky, ktorú človek naozaj vidí. */
.me-flat .me-cover::before{ top:calc(${H}); -webkit-mask-image:${le}; mask-image:${le}; }
.me-flat .me-cover::after{ display:none; }
.me-role--label{ flex-wrap:nowrap; align-items:center; gap:${e.sm}px; margin-top:${e.lg}px; }
.me-role--label span{ font-family:${l}; font-weight:600; font-size:${o.micro}px; letter-spacing:.26em; text-transform:uppercase; color:${t.inkWarm}; white-space:nowrap; }
.me-role--label i{ flex:1; height:1px; background:linear-gradient(90deg, ${t.cardEdge}, transparent); }
.me-flat .me-tbar{ padding-top:calc(${H} + ${e.sm}px); padding-left:${B}px; padding-right:${B}px; }
.me-flat .me-own{ left:${B}px; }
.me-flat .me-foot{ left:${B+y.m+e.sm}px; right:${B}px; bottom:-${xe+Me.m}px; }
.me-flat .me-drow{ padding-left:${B+y.m/2-I.m/2}px; }
@media (min-width:640px){ .me-card.me-flat{ margin:calc(-1 * ${H}) -${e.xl}px 0; } }
@media (min-width:768px){
  .me-flat .me-cover{ height:calc(${ce.pc+Te}px + ${H}); }
  .me-flat .me-tbar{ padding-left:${e.xl}px; padding-right:${e.xl}px; }
  .me-flat .me-own{ left:${e.xl}px; }
  .me-flat .me-foot{ left:${e.xl+y.pc+e.lg}px; right:${e.xl}px; bottom:-${e.lg+Me.pc}px; }
  .me-flat .me-drow{ padding-left:${e.xl+y.pc/2-I.pc/2}px; }
  /* PC: stĺpec 880 nekončí na okraji okna — titulka sa rozplynie aj do strán, inak by stáli dve tvrdé hrany. */
  .me-flat .me-cover::before{ -webkit-mask-image:${le}, linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
    mask-image:${le}, linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
    -webkit-mask-composite:source-in; mask-composite:intersect; }
}
${Ea}
`;function Da({pilgrimLevel:r,pilgrimPct:i=0,servantYears:n=null,servantLabel:p="Servant",pilgrimRankLabel:c="Pilgrim",onDev:b,onPilgrim:A,onStudy:N,study:k,rank:u,foreign:w=!1,className:j=""}){const $=la(!w);return a.jsxs("div",{className:`me-lv rk-row${k?" rk3":""}${j?` ${j}`:""}`,children:[a.jsx(pa,{years:n??null,activeDays:$,on:u==="dev",onClick:b,label:p}),a.jsx(da,{level:r,pct:i,on:u==="pt",onClick:A,label:`${c} ${r}`}),k&&a.jsx(ma,{level:k.level,pct:k.pct,on:u==="study",onClick:N,label:`${k.label} ${k.level}`})]})}const _a=35;function Qa({cover:r,coverY:i,name:n,devLabel:p,devLevel:c,pilgrimLabel:b,pilgrimLevel:A,pilgrimPct:N=0,servantYears:k=null,servantLabel:u="Servant",pilgrimRankLabel:w="Pilgrim",bones:j,onBones:$,onDev:S,onPilgrim:E,onStudy:f,study:x,rank:P,stack:m=!1,right:F,onMoveY:z,onMoveEnd:g,onCover:h,coverLabel:T,noRanks:C=!1,foreign:M=!1,badgesOut:J=!1,withName:Q,seal:U=null,sealText:Ye=""}){const ye=D.useRef(null),[ee,He]=D.useState(null),[W,he]=D.useState(null),ae=i??_a,L=r?$e(r,1200):null,[Ke,Ve]=D.useState(null),G=L&&Ke!==L?L:null;D.useEffect(()=>{if(!L)return;const v=new Image;v.onerror=()=>Ve(L),v.src=L},[L]),D.useEffect(()=>{if(!G||!z)return;const v=new Image;v.onload=()=>He({w:v.naturalWidth,h:v.naturalHeight}),v.src=G},[G,z]);const Xe=()=>{const v=ye.current;if(!v||!ee)return 0;const{width:re,height:be}=v.getBoundingClientRect(),we=be-(parseFloat(getComputedStyle(v,"::before").top)||0),qe=Math.max(re/ee.w,we/ee.h);return Math.max(0,ee.h*qe-we)},Y=!!z&&!!G;return me(A),a.jsxs("div",{ref:ye,className:`me-cover${Y?" drag":h?" pick":""}${W?" on":""}${G?"":" no-cov"}`,style:G?{"--me-cover":`url(${G})`,"--me-cover-y":`${ae}%`}:void 0,onPointerDown:Y?v=>{v.target.closest("button")||(v.currentTarget.setPointerCapture(v.pointerId),he({y0:v.clientY,p0:ae}))}:void 0,onPointerMove:Y&&W?v=>{const re=Xe();if(!re)return;const be=Math.min(100,Math.max(0,W.p0-(v.clientY-W.y0)/re*100));z==null||z(Math.round(be))}:void 0,onPointerUp:Y&&W?()=>{he(null),g==null||g(ae)}:void 0,onPointerCancel:Y&&W?()=>{he(null),g==null||g(ae)}:void 0,onClick:!Y&&h?v=>{v.target.closest("button")||h()}:void 0,children:[a.jsxs("div",{className:"me-tbar",children:[j==null?a.jsx("span",{}):a.jsx(na,{value:j,onClick:$,label:`${j} BONES`}),F??(h&&a.jsx("button",{type:"button",className:"me-cvbtn",onClick:h,"aria-label":T,children:a.jsx(_,{name:"camera",size:16,tint:"white"})}))]}),a.jsxs("div",{className:"me-foot",children:[a.jsxs("h1",{className:"me-nm",style:{"--nm":Math.max(8,...String(n??"").split(/\s+/).map(v=>v.length+(U?1:0))),"--nl":Math.max(8,String(n??"").length+(U?1:0))},children:[n,U&&a.jsx(aa,{tier:U,own:!M,label:Ye,size:"0.8em"})]}),Q&&a.jsxs("p",{className:"me-with",children:["& ",Q]}),a.jsx("style",{children:ia}),C||J?null:a.jsx(Da,{pilgrimLevel:A,pilgrimPct:N,servantYears:k,servantLabel:u,pilgrimRankLabel:w,onDev:S,onPilgrim:E,onStudy:f,study:x,rank:P,foreign:M})]})]})}function Ie(r,i){if(!i||r!==1)return ha(r);const{d:n,cx:p,cy:c}=Aa,b=A=>`${Math.round(A*1e3)/10}%`;return[{width:b(n),left:b(p-n/2),top:b(c-n/2)}]}function O({src:r,w:i,fb:n}){const[p,c]=D.useState(!1);return r&&!p?a.jsx("img",{src:$e(r,i),alt:"",onError:()=>c(!0)}):a.jsx(a.Fragment,{children:n})}function er({photo:r,initial:i,dogs:n,open:p=!1,onToggle:c,onPhoto:b,photoLabel:A,toggleLabel:N,badge:k,story:u,onAdd:w,addLabel:j,onDogPhoto:$,dogBusy:S,dogPhotoLabel:E,mate:f}){if($&&n.length>0&&sa){const m=n.slice(0,ne);return a.jsxs("div",{className:`me-own${u?` st-${u}`:""}`,children:[a.jsx("button",{type:"button",onClick:b,"aria-label":A,children:a.jsx(O,{src:r,w:320,fb:a.jsx("span",{className:"ini",children:i})})}),k,f&&a.jsx("button",{type:"button",className:"me-mate",onClick:f.onClick,disabled:!f.onClick,"aria-label":f.label,children:a.jsx(O,{src:f.photo,w:200,fb:a.jsx("i",{children:f.initial})})}),a.jsx("span",{className:"me-arc",children:Ie(m.length,!!f).map((F,z)=>{const g=m[z];return a.jsxs("button",{type:"button",className:"ad me-sdog",style:F,onClick:()=>$(g),disabled:S===g.id,"aria-label":`${E??""} ${g.dog_name??""}`.trim(),children:[a.jsx(O,{src:g.cloudinary_main_url,w:140,fb:a.jsx("b",{className:"ad-ini",children:(g.dog_name??"").charAt(0).toUpperCase()})}),a.jsx("span",{className:"cam",children:S===g.id?a.jsx(_,{name:"cycle",size:14,tint:"white"}):a.jsx(ze,{name:"foto",size:20})})]},g.id)})})]})}if($&&n.length>0)return a.jsxs("div",{className:`me-own${u?` st-${u}`:""}`,children:[a.jsx("button",{type:"button",onClick:b,"aria-label":A,children:a.jsx(O,{src:r,w:320,fb:a.jsx("span",{className:"ini",children:i})})}),k,f&&a.jsx("button",{type:"button",className:"me-mate",onClick:f.onClick,disabled:!f.onClick,"aria-label":f.label,children:a.jsx(O,{src:f.photo,w:200,fb:a.jsx("i",{children:f.initial})})}),a.jsx("span",{className:"me-sat",children:n.slice(0,3).map(m=>a.jsxs("button",{type:"button",className:"s me-sdog",onClick:()=>$(m),disabled:S===m.id,"aria-label":`${E??""} ${m.dog_name??""}`.trim(),children:[a.jsx(O,{src:m.cloudinary_main_url,w:140,fb:null}),a.jsx("span",{className:"cam",children:S===m.id?a.jsx(_,{name:"cycle",size:14,tint:"white"}):a.jsx(ze,{name:"foto",size:20})})]},m.id))})]});const x=p?a.jsx("span",{className:"up",children:a.jsx(_,{name:"back",size:13,tint:"white"})}):a.jsxs(a.Fragment,{children:[n.slice(0,2).map(m=>a.jsx("span",{className:"s",children:a.jsx(O,{src:m.cloudinary_main_url,w:140,fb:null})},m.id)),n.length>2&&a.jsx("span",{className:"cnt",children:n.length})]}),P=!p&&n.length>0;return a.jsxs("div",{className:`me-own${u?` st-${u}`:""}`,children:[a.jsx("button",{type:"button",onClick:b,"aria-label":A,children:a.jsx(O,{src:r,w:320,fb:a.jsx("span",{className:"ini",children:i})})}),k,f&&a.jsx("button",{type:"button",className:"me-mate",onClick:f.onClick,disabled:!f.onClick,"aria-label":f.label,children:a.jsx(O,{src:f.photo,w:200,fb:a.jsx("i",{children:f.initial})})}),P&&a.jsx("button",{type:"button",className:"me-arc",onClick:c,"aria-expanded":p,"aria-label":N,disabled:!c,children:Ie(n.length,!!f).map((m,F)=>{const z=n.length>ne&&F===ne-1,g=n[F];return z?a.jsxs("span",{className:"ad cnt",style:m,children:["+",n.length-(ne-1)]},"cnt"):a.jsx("span",{className:"ad",style:m,children:a.jsx(O,{src:g.cloudinary_main_url,w:140,fb:a.jsx("b",{className:"ad-ini",children:(g.dog_name??"").charAt(0).toUpperCase()})})},g.id)})}),w&&a.jsx("button",{type:"button",className:"me-add",onClick:w,"aria-label":j,children:a.jsx(_,{name:"plus-sign",size:14,tint:"white"})}),!P&&n.length>0&&(c?a.jsx("button",{type:"button",className:"me-sat",onClick:c,"aria-expanded":p,"aria-label":N,children:x}):a.jsx("span",{className:"me-sat","aria-hidden":!0,children:x}))]})}const Sa=r=>parseInt(r.slice(1,3),16)>128;function de({pct:r,center:i,next:n,label:p}){const c=Math.max(0,Math.min(100,r)),b=`max(${c}%, 26px)`;return a.jsxs("div",{className:"me-rk-row",children:[a.jsxs("div",{className:"me-rk-bar",role:"progressbar","aria-valuenow":Math.round(c),"aria-valuemin":0,"aria-valuemax":100,"aria-label":p,children:[a.jsx("b",{style:{width:b}}),a.jsx("span",{children:i}),a.jsx("span",{className:"in",style:{clipPath:`inset(0 calc(100% - ${b}) 0 0)`},children:i})]}),n&&a.jsx("span",{className:"me-rk-nx",children:n})]})}function Pa({size:r=14,tint:i="gold"}){return a.jsx(_,{name:"heartpaw",size:r,tint:i,style:{verticalAlign:"-2px"}})}function Ta(r,i,n=1){if(r==="dev"){const p=ve(n);return{"--rk-bg":Ge,"--rk-edge":Ue,"--rk-ink":Z,"--rk-dim":Z,"--rk-fill":p.dot,"--rk-bg-ink":"#140D07","--rk-track":"rgba(243,230,200,.14)",...ke(n)}}if(r==="pt"){const p=me(i);return{"--rk-bg":Le(p),"--rk-edge":p.b,"--rk-ink":p.ink,"--rk-dim":p.ink,"--rk-fill":t.card,"--rk-bg-ink":"#1F1A0E","--rk-track":"rgba(0,0,0,.28)"}}return{"--rk-bg":te.surface,"--rk-edge":te.edgeStrong,"--rk-ink":"#EAFBFF","--rk-dim":te.cyan,"--rk-fill":te.cyan,"--rk-bg-ink":"#06121A","--rk-track":"rgba(234,251,255,.12)"}}function ar({kind:r,devotion:i,pilgrim:n,study:p,servantYears:c,servantDays:b,servantNext:A,sinceDogs:N,abroad:k,home:u,blank:w,onDogId:j,onStats:$,onVault:S,onAbout:E,onClose:f,tx:x}){const P=D.useRef(null);D.useEffect(()=>{if(!f)return;const h=T=>{var M;const C=T.target;(M=P.current)!=null&&M.contains(C)||C.closest('[data-rank-toggle], [role="dialog"]')||f()};return document.addEventListener("pointerdown",h),()=>document.removeEventListener("pointerdown",h)},[f]);const m=ea(i),F=Ta(r,n.level.level,m.index),z=h=>Math.round(h).toLocaleString("sk-SK");if(r==="study"&&p){const h={"--rk-bg":"radial-gradient(120% 100% at 0% 0%, #22306a 0%, #121a44 45%, #0a0d26 100%)","--rk-edge":"rgba(95,230,255,.55)","--rk-ink":Z};return a.jsxs("div",{className:"me-rk",style:h,ref:P,children:[a.jsx("style",{children:Ne}),a.jsx(ca,{read:p.read,total:p.total,floor:p.floor,liked:p.liked,saved:p.saved,onVault:S,tx:x})]})}if(r!=="study"){const h={"--rk-bg":"radial-gradient(120% 100% at 0% 0%, #22306a 0%, #121a44 45%, #0a0d26 100%)","--rk-edge":"rgba(231,196,108,.7)","--rk-ink":Z},T=n.level;return a.jsxs("div",{className:"me-rk",style:h,ref:P,children:[a.jsx("style",{children:Ne}),r==="dev"?a.jsx(xa,{years:c??null,days:b,toNext:A,onDogId:j,dogs:N,trips:n.count,abroad:k??0,home:u,blank:w,tx:x}):a.jsx(ga,{level:T.level,pct:T.pct,points:T.points,floor:T.floorPoints,nextAt:T.nextPoints,trips:n.count,km:n.km,countries:n.countries,onStats:$,tx:x})]})}if(r==="study"){const h=p??{read:0,total:0,pct:0,liked:0,saved:0};return a.jsxs("div",{className:"me-rk",style:F,ref:P,children:[a.jsxs("div",{className:"me-rk-hd",children:[a.jsx("span",{className:"ic pt",children:a.jsx(_,{name:"graduate",size:16,tint:"dark"})}),a.jsx("div",{className:"tx",children:a.jsx("h3",{children:x("pack.me.studying","Study")})})]}),a.jsx("hr",{className:"me-rk-line"}),a.jsx(de,{pct:h.pct,center:`${h.read} / ${h.total}`,next:a.jsxs("b",{children:[h.pct," %"]}),label:x("pack.rank.studyRead","{n} of {total} scrolls read").replace("{n}",String(h.read)).replace("{total}",String(h.total))}),a.jsxs("div",{className:"me-rk-nums",children:[a.jsxs("div",{children:[a.jsx("b",{children:h.read}),a.jsx("span",{children:x("pack.rank.scrolls","scrolls")})]}),a.jsxs("div",{children:[a.jsx("b",{children:h.liked}),a.jsx("span",{children:x("pack.rank.liked","liked")})]}),a.jsxs("div",{children:[a.jsx("b",{children:h.saved}),a.jsx("span",{children:x("pack.rank.saved","saved")})]})]}),a.jsxs("button",{type:"button",className:"me-rk-link",onClick:S,children:[x("pack.rank.openVault","My knowledge in Dog Sense"),a.jsx(_,{name:"back",size:12,tint:"white",style:{transform:"rotate(180deg)"}})]})]})}if(r==="dev"){const h=oe[m.index-1],T=m.next?m.next.at-h.at:0;return a.jsxs("div",{className:"me-rk",style:F,ref:P,children:[a.jsxs("div",{className:"me-rk-hd",children:[a.jsx("span",{className:"ic",children:a.jsx("b",{children:m.index})}),a.jsxs("div",{className:"tx",children:[a.jsx("h3",{children:x(`pack.ladder.${m.key}`,m.name)}),a.jsx("p",{className:"me-rk-q",children:x(`pack.ladder.desc.${m.key}`,ve(m.index).desc)})]}),a.jsxs("button",{type:"button",className:"ab",onClick:E,disabled:!E,"aria-label":x("pack.dvinfo.title","How you earn devotion"),children:[a.jsx(Pa,{size:16}),z(i),E&&a.jsx(_,{name:"question",size:12,tint:"white"})]})]}),a.jsx("hr",{className:"me-rk-line"}),m.next?a.jsx(de,{pct:m.pct,center:`${z(i-h.at)} / ${z(T)}`,label:x("pack.rank.devToNext","{n} to the {name} step").replace("{n}",z(m.toNext)).replace("{name}",x(`pack.ladder.${m.next.key}`,m.next.name)),next:a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"g",style:ke(m.index+1),children:a.jsx("b",{children:m.index+1})}),x(`pack.ladder.${m.next.key}`,m.next.name)]})}):a.jsx(de,{pct:100,center:x("pack.rank.devTop","You stand at the top of the ladder."),label:x("pack.rank.devTop","You stand at the top of the ladder.")}),a.jsx("div",{className:"me-rk-py","aria-label":x("pack.rank.devPyramid","The pyramid of devotion"),children:oe.map((C,M)=>M).reverse().map(C=>{const M=oe[C],J=100-78*(C/(oe.length-1)),Q=`${J}%`,U=C+1===m.index?"on":C+1<m.index?"done":C===20?"gold":C===21?"sun":"";return a.jsxs("span",{className:U,style:{width:Q,...ke(C+1)},children:[C+1,(J>44||C+1===m.index||C>=20)&&a.jsxs(a.Fragment,{children:[" · ",x(`pack.ladder.${M.key}`,M.name)]})]},M.key)})})]})}const g=n.level;return a.jsxs("div",{className:"me-rk",style:F,ref:P,children:[a.jsxs("div",{className:"me-rk-hd",children:[a.jsx("span",{className:"ic pt",children:a.jsx(_,{name:"world-grid",size:16,tint:"dark"})}),a.jsx("div",{className:"tx",children:a.jsxs("h3",{children:[x("pack.map.rankPilgrim","Pilgrim")," ",g.level]})}),a.jsxs("span",{className:"ab",children:[z(g.points)," ",x("pack.rank.pts","pts")]})]}),a.jsx("hr",{className:"me-rk-line"}),a.jsx(de,{pct:g.pct,center:`${z(g.points-g.floorPoints)} / ${z(g.nextPoints-g.floorPoints)}`,label:x("pack.tier.toNext","{n} points to level {level}").replace("{n}",z(g.toNext)).replace("{level}",String(g.level+1)),next:a.jsxs(a.Fragment,{children:[a.jsx(_,{name:"world-grid",size:12,tint:Sa(me(g.level).ink)?"white":"dark"}),x("pack.map.rankPilgrim","Pilgrim")," ",g.level+1]})}),a.jsxs("div",{className:"me-rk-nums",children:[a.jsxs("div",{children:[a.jsx("b",{children:n.count}),a.jsx("span",{children:x("pack.rank.trips","trips")})]}),a.jsxs("div",{children:[a.jsx("b",{children:n.km}),a.jsx("span",{children:"km"})]}),a.jsxs("div",{children:[a.jsx("b",{children:n.countries}),a.jsx("span",{children:x("pack.rank.countries","countries")})]})]}),$&&a.jsxs("button",{type:"button",className:"me-rk-link",onClick:$,children:[x("pack.rank.openStats","Trip stats"),a.jsx(_,{name:"back",size:12,tint:/^#[0-3]/.test(me(g.level).ink)?"dark":"white",style:{transform:"rotate(180deg)"}})]})]})}function rr({code:r,label:i}){return a.jsx("img",{className:"me-flag",src:ba(Qe(r)||"sk",80),alt:i,title:i})}function tr({dog:r,attrs:i,onClose:n,onDogId:p,tx:c}){var $,S;const[b,A]=D.useState(!1),N=r.cloudinary_main_url,k=r.dog_name??"",u=r.pack_number!=null?a.jsxs("span",{className:"me-no",children:["#",r.pack_number]}):null,w=($=i==null?void 0:i.bio)==null?void 0:$.trim(),j=((S=i==null?void 0:i.tags)==null?void 0:S.temperament)??[];return a.jsxs("div",{className:`me-drow${b?" flip":""}`,children:[a.jsxs("button",{type:"button",className:"me-dp",onClick:n,"aria-label":c("pack.me.closeDogs","Hide dogs"),children:[N?a.jsx("img",{src:$e(N,240),alt:""}):a.jsx("span",{className:"me-dp-ini",children:k.charAt(0).toUpperCase()}),u]}),a.jsxs("button",{type:"button",className:"me-hg",onClick:()=>A(E=>!E),"aria-expanded":b,"aria-label":k,children:[a.jsx("span",{className:"fa",children:r.heroglyph_png_url?a.jsx("img",{src:r.heroglyph_png_url,alt:""}):a.jsx("span",{className:"empty",children:k})}),a.jsxs("span",{className:"ba",children:[a.jsxs("b",{children:[k,a.jsx(ra,{dogId:r.id,tx:c})]}),u]})]}),a.jsxs("div",{className:"me-dinfo",children:[w?a.jsx("p",{children:w}):p?a.jsx("p",{className:"none",onClick:p,children:c("pack.me.dogBioEmpty","No bio yet. Write it in DOG ID.")}):a.jsx("p",{className:"none",children:c("pack.publicProfile.noBio","No bio yet.")}),j.length>0&&a.jsx("div",{className:"me-strip",children:j.map(E=>a.jsx("span",{className:"pk-pill",children:c(`pack.dogTag.${E}`,E)},E))}),p&&a.jsxs("button",{type:"button",className:"me-dedit",onClick:p,children:[a.jsx(_,{name:"pencil",size:12,tint:"violet"}),c("pack.me.editDog","Edit DOG ID")]})]})]})}const Ma=fa,Fa=r=>({ownerNumber:r.owner_number,userId:r.user_id,name:r.display_name,avatarUrl:r.avatar_url,human:r.human??{}});async function We(r){if(r.packNumber==null&&!r.userId)return[];const{data:i,error:n}=await Ma.rpc("get_profile_mates",{p_pack_number:r.packNumber??null,p_user:r.userId??null});return n?[]:(i??[]).map(Fa)}function or(r){const[i,n]=D.useState([]);return D.useEffect(()=>{let p=!0;if(r==null){n([]);return}return We({packNumber:r}).then(c=>{p&&n(c)}),()=>{p=!1}},[r]),i}function nr({uid:r,isMate:i,showMates:n,myNumber:p}){const[c,b]=D.useState(null),A=(n??[]).join(",");return D.useEffect(()=>{if(!r){b(null);return}let N=!0;if(i)We({userId:r}).then(async k=>{var $;const u=($=k[0])==null?void 0:$.ownerNumber;if(u==null){N&&b(null);return}const w=(await ua([u])).get(u);if(!N)return;if(!w){b(null);return}const j=ka(w)||"";b({photo:$a(w),initial:(j[0]||"D").toUpperCase(),label:j,to:`/pack/u/${u}`})});else if(A&&p!=null){const k=A.split(",");va().then(u=>{var j;const w=u.people.find($=>$.kind==="human"&&$.user_id&&k.includes($.user_id));N&&b(w?{photo:w.avatar_url,initial:(((j=w.name)==null?void 0:j[0])||"P").toUpperCase(),label:w.name||"Pawmate",to:null}:null)}).catch(()=>{N&&b(null)})}else b(null);return()=>{N=!1}},[r,i,A,p]),c}export{ce as C,De as D,Za as M,Ge as N,qa as P,Ja as a,Ee as b,Qa as c,rr as d,er as e,ar as f,Z as g,Ue as h,Pa as i,Ce as j,ke as k,tr as l,Da as m,or as n,nr as u};
