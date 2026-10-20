import{u as L,i as V,a as I,r as l,j as n,aT as M,aU as R,ae as t,af as s,ad as _,aV as D,aW as P,ag as C,aX as T,aj as b}from"./index-7PctGTam.js";import{L as K}from"./LanguagePicker--v1cJQg6.js";import{l as H}from"./HandIcons-Dh9PgzA0.js";import{L as f}from"./labTheme-p7t_6k9Y.js";import{G as B,R as G,V as X,A as F}from"./AboutLab-ugcmgbm0.js";import"./flagUrl-B21iQI9I.js";import"./handArrowLeft-BUyUUYuC.js";import"./godsData-kTA2EY6K.js";import"./countryGeo-BaPfaSrG.js";import"./cloudinaryService-DFfDUqVM.js";import"./Seo-B-e2lU-9.js";import"./photoConfirm-lfyly4ep.js";import"./photoIntake-cTohUk5s.js";import"./dogSlug-CB23gDR2.js";import"./constitutionRead-6hPB31zu.js";import"./DogMessage-DIBP3WES.js";import"./sparkles-C-OUu7N_.js";import"./createLucideIcon-Di02PK5p.js";import"./use-toast-CpgRElRJ.js";import"./BrandIcon-C4Fdumu_.js";import"./dogypt-logo-gold-D67FOL39.js";import"./dogypt-logo-mobile-B7sCn4Sq.js";import"./useBodyScrollLock--CJIKtfn.js";import"./proxy-B4ZTxIpr.js";import"./council-business-BPTub_bd.js";const d=[{id:"home",path:"/wall-lab",navKey:"nav.home"},{id:"vision",path:"/vision-lab",navKey:"nav.vision"},{id:"religion",path:"/religion-lab",navKey:"nav.religion"},{id:"about",path:"/about-lab",navKey:"nav.about"}],y="lab-swipe-mode",j=34,z=10,U=.22,Y=110;function fe(){const k=L(),g=V(),E=I(),o=Math.max(0,d.findIndex(e=>e.path===E.pathname)),[r,w]=l.useState(()=>{try{const e=localStorage.getItem(y);if(e==="edge"||e==="free"||e==="click")return e}catch{}return"edge"}),m=e=>{w(e);try{localStorage.setItem(y,e)}catch{}},[N,u]=l.useState(0),[A,h]=l.useState(!1),c=l.useRef(null),p=l.useCallback(e=>{const a=Math.min(d.length-1,Math.max(0,e));a!==o&&g(d[a].path)},[o,g]);l.useEffect(()=>{const e=a=>{const i=document.activeElement;i&&i.closest('input, textarea, [contenteditable="true"]')||(a.key==="ArrowRight"&&p(o+1),a.key==="ArrowLeft"&&p(o-1))};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[p,o]);const S=e=>{if(r==="click"||e.pointerType==="mouse"&&r!=="edge")return;const a=e.target;if(a.closest(".main-nav, .nav-login, .gods-bottom-bar, .numpad-overlay, .lang-modal-root, .lsh-modeswitch"))return;const i=o===0||!!a.closest(".gods-root, .planet-ball");(r==="edge"||i)&&e.clientX>j&&e.clientX<window.innerWidth-j||(c.current={id:e.pointerId,x:e.clientX,y:e.clientY,live:!1,armed:!0})},$=e=>{const a=c.current;if(!a||a.id!==e.pointerId||!a.armed)return;const i=e.clientX-a.x,v=e.clientY-a.y;if(!a.live){if(Math.abs(i)<z&&Math.abs(v)<z)return;if(Math.abs(v)>Math.abs(i)){c.current=null;return}a.live=!0,h(!0)}const O=i>0&&o===0||i<0&&o===d.length-1;u(O?i*.28:i)},x=e=>{const a=c.current;if(c.current=null,!a||!a.live){u(0),h(!1);return}const i=e.clientX-a.x,v=Math.min(Y,window.innerWidth*U);u(0),h(!1),i<=-v?p(o+1):i>=v&&p(o-1)};return n.jsxs("div",{className:`lsh-root${A?" is-dragging":""}`,onPointerDown:S,onPointerMove:$,onPointerUp:x,onPointerCancel:x,children:[n.jsx("style",{children:`
        /* ── PLOCHA ────────────────────────────────────────────────────────
           Papyrus kreslí rám, nie stránka — medzi panelmi tak pri swipe nikdy
           neprebliskne čierna. */
        .lsh-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background-color: ${f.pageBg};
          --lsh-nav-h: 68px;
        }
        .lsh-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: ${f.pageBackdrop};
          pointer-events: none;
        }

        /* ── PANEL SEKCIE ──────────────────────────────────────────────────
           fixed + vlastný transform = containing block pre fixed deti (wall,
           planéta, spodná lišta). Bez toho by .gods-root { inset: 0 } sadol
           na okno a bol by vidieť aj v náboženstve. */
        .lsh-pane {
          position: fixed;
          inset: 0;
          will-change: transform;
          transition: transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1);
          overflow: hidden;
          z-index: 1;
        }
        .lsh-root.is-dragging .lsh-pane { transition: none; }
        .lsh-pane.is-active { z-index: 2; }
        /* Neaktívny panel nesmie brať kliky ani fokus — leží mimo obrazovky,
           ale je stále v DOM. */
        .lsh-pane:not(.is-active) { pointer-events: none; }

        /* ── HORNÝ NAV — jediná kópia v projekte ───────────────────────────
           Skladba zlatého odliatku: RÁM (leštené zlato) → DOSKA (pieskovec,
           zapustená) → ZRNO → OBSAH. Tokeny z navGoldSkin.ts, neopisuj ich. */
        /* Lišta stojí v STREDE hornej hrany (Matej 25. 8.: „presuňme horný nav do
           stredu obrazovky"). Trieda sa volala .nav-left, kým sedela v ľavom rohu —
           premenovaná, aby názov neklamal. Ľavý roh je odteraz voľný.
           translateX(-50%) je jediný spôsob, ako vycentrovať prvok neznámej šírky:
           left:50% posadí jeho ĽAVÚ hranu do stredu, posun ju vráti o polovicu. */
        .nav-top {
          position: fixed;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 60;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .main-nav {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          gap: 14px;
          white-space: nowrap;
          padding: ${t.rim+5}px ${t.rim+15}px;
          background: ${M};
          background-blend-mode: ${R};
          border: ${t.line}px solid ${s.edge};
          border-radius: ${t.frame}px;
          box-shadow: ${_};
        }
        /* DOSKA a ZRNO idú na z-index -1 (nie 0) — obsah pilulky býva holý
           textový uzol, ten sa nedá zdvihnúť, tak sa musí podliezť. */
        .main-nav::before {
          content: '';
          position: absolute;
          inset: ${t.rim}px;
          border-radius: ${t.plate}px;
          background: ${D};
          background-blend-mode: ${P};
          border: ${t.line}px solid ${s.edge};
          box-shadow: ${C};
          pointer-events: none;
          z-index: -1;
        }
        .main-nav::after {
          content: '';
          position: absolute;
          inset: ${t.rim}px;
          border-radius: ${t.plate}px;
          ${T}
          opacity: 0.28;
          pointer-events: none;
          z-index: -1;
        }
        .main-nav > * { position: relative; z-index: 1; }
        .main-nav-sep {
          display: inline-block;
          width: 1px;
          height: 12px;
          background: rgba(110,74,20,0.45);
          flex-shrink: 0;
        }
        .main-nav a, .main-nav button {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: ${s.ink};
          text-decoration: none;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .main-nav a:hover, .main-nav button:hover { opacity: 0.55; }
        /* AKTÍVNA SEKCIA = CHIP, ten istý ako ikonky v spodnej lište
           (Matej 25. 8.: „dolu je to super v kružku s inou farbou tak to chcem aj
           hore, označená stránka bude v takom chipe ako je dolu ikonka").
           Predtým tu bola bodka/kosoštvorec — zanikla: stav sa značí VYSTÚPENOU
           PLÔŠKOU, nie prívesom pod textom, a hore aj dole tak platí jeden jazyk.
           ⚠️ Výplň má LEN aktívna položka, ale ROZMERY musia mať všetky — rám aj
           odsadenie sú preto na .main-nav button a neaktívnym sa len zprieh-
           ľadní rám. Inak by sa lišta pri každom prepnutí sekcie rozšírila. */
        .main-nav button {
          position: relative;
          padding: 5px 12px;
          border: ${t.line}px solid transparent;
          border-radius: 999px;
        }
        .main-nav button.is-on {
          opacity: 1;
          background: ${s.activeFill};
          border-color: ${s.edge};
          box-shadow: ${b};
        }
        .main-nav button.is-on:hover { opacity: 1; }
        .main-nav .lang-trigger { color: ${s.ink}; }
        .main-nav .lang-trigger__chev { color: rgba(42,22,8,0.55); }

        /* PRIHLÁSENIE — domček, posledná vec pred vlajkou. Vystúpená pilulka
           (activeFill), aby sa medzi slovami čítal ako TLAČIDLO, nie ako ďalšia
           položka menu. Menší priemer než pilulky v spodnej lište: musí sa zmestiť
           do výšky dosky navu, nie ju rozťahovať. */
        /* Kruh je ZHODNÝ s ikonkami v spodnej lište — tie isté tokeny, ten istý
           priemer 40 px. Ikonka je INLINE SVG s currentColor, nie <img>:
           <img> sa ofarbiť nedá a filter: brightness(0) z nej robí ČISTÚ
           ČIERNU, kým dolné ikonky nesú teplý inkoust NAV_GOLD.ink. Presne v tom
           bol rozdiel, ktorý bolo vidieť. */
        /* ⚠️ SELEKTOR MUSÍ BYŤ DVOJTRIEDNY. Domček je <a> vnútri .main-nav, takže
           ho trafí aj pravidlo .main-nav a (0,1,1) vyššie — a to nastavuje
           background: none a border: none. Holá .nav-login (0,1,0) ho NEPREBIJE:
           z kruhu prejde len tieň, teda ostane 3D odtlačok bez výplne a bez rámu.
           Presne tak to aj vyzeralo. */
        .main-nav .nav-login {
          width: 40px; height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          background: ${s.activeFill};
          border: ${t.line}px solid ${s.edge};
          box-shadow: ${b};
          color: ${s.ink};
        }
        .main-nav .nav-login:hover { opacity: 0.75; }

        @media (max-width: 768px) {
          .lsh-root { --lsh-nav-h: 58px; }
          .nav-top { top: 10px; }
          /* Vlajka je na mobile v SPODNEJ lište (kreslí ju wall), tu by bola druhá. */
          .nav-lang-desktop { display: none; }
          .main-nav { gap: 7px; padding: ${t.rim+3}px ${t.rim+7}px; }
          .main-nav a, .main-nav button { font-size: 0.64rem; letter-spacing: 0.04em; }
          .main-nav button { padding: 4px 8px; }
          .main-nav .nav-login { width: 32px; height: 32px; }
        }

        /* ── OBSAH SEKCIE ──────────────────────────────────────────────────
           Stránka dostane CELÚ výšku panela a nav sa nad ňou vznáša — rovnako
           ako nad guľou. Odsadenie o výšku navu tu BOLO a zlyhalo dvakrát:
           (a) nad obsahom vznikol pás inej farby (podklad stránky sa drží okna,
           odsadenie ho odstrihne) a (b) zvislý scroll-snap v náboženstve prišiel
           o ~60 px z každej obrazovky, čo je presne to, čoho sa bál zadanie §5.1.
           Kto sem odsadenie vráti, musí vyriešiť oboje. */
        .lsh-page {
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        /* Nav sa vznáša, takže si miesto musí spraviť OBSAH SEKCIE — nie panel.
           Odsadenie je vnútri stránky, takže podklad ostáva celistvý (pás inej
           farby nad obsahom) a scroll-snap si drží celú obrazovku (výška sekcie
           sa nemení, len sa v nej obsah posunie nižšie).
           Bez toho lezie nav do nadpisu: na 2. obrazovke prekryl V PSA
           z V PSA VERÍME — presne strata výšky, ktorej sa bálo zadanie §5.1. */
        .lsh-page .codex-section { padding-top: var(--lsh-nav-h); }
        /* Voľný swipe a zvislý snap v náboženstve si lezú do cesty — v režime
           FREE preto snap padá (jedna z možností zo zadania §5.1). */
        .lsh-nosnap .codex-scroll { scroll-snap-type: none; }

        /* ── SEKCIA, KTORÁ SA DLHO SCROLLUJE (vízia) ───────────────────────
           Náboženstvo si scroll rieši samo (vlastný snap kontajner vnútri
           stránky), vízia nie — je to jedna dlhá stránka. Panel jej preto musí
           dať vlastný scroll, inak sa spodok stránky nedá dosiahnuť vôbec.
           overscroll-behavior drží ťah prsta v paneli: bez neho sa na konci
           stránky rozhýbe okno pod rámom a nav sa odlepí.
           Miesto pre plávajúci nav si berie EXISTUJÚCA .topbar-wrap (v ráme
           je prázdna, lebo hlavičku dodáva rám) — je sticky a nesie papyrusový
           fade, takže nav má pod sebou plochu vlastnej farby. Odsadenie inde by
           odstrihlo podklad a nad obsahom by vznikol pás inej farby. */
        .lsh-scroll {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          position: relative;
          -webkit-overflow-scrolling: touch;
        }
        .lsh-scroll .topbar-wrap { height: var(--lsh-nav-h); padding-bottom: 0; }

        /* ── DEV prepínač ovládania ────────────────────────────────────────
           Ostáva v labe, na živý web sa nikdy nedostane. Voľba prežije reload,
           inak by sa pri každom uložení súboru vrátila na začiatok. */
        .lsh-modeswitch {
          position: fixed;
          left: 12px;
          bottom: 12px;
          z-index: 70;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border-radius: 999px;
          background: ${s.surface};
          border: 1px solid ${s.edge};
          box-shadow: 0 4px 14px rgba(70,45,10,0.35);
        }
        .lsh-modeswitch button {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: rgba(42,22,8,0.55);
          background: none;
          border: none;
          border-radius: 999px;
          padding: 4px 9px;
          cursor: pointer;
        }
        .lsh-modeswitch button.is-on {
          color: ${s.ink};
          background: ${s.activeFill};
          box-shadow: ${b};
        }
        @media (max-width: 768px) {
          /* Spodná lišta homepage stojí v strede — prepínač sa nad ňu zdvihne,
             aby si na úzkom mobile nestáli palcom v ceste. */
          .lsh-modeswitch { bottom: 72px; left: 8px; }
          .lsh-modeswitch button { font-size: 0.54rem; padding: 4px 7px; }
          /* Karta rozhodnutia musí skončiť NAD prepínačom — inak jej prekryje
             posledný riadok (odkaz na ostrú stránku). */
          .lsh-decision { padding-bottom: 118px; }
        }
      `}),n.jsx("div",{className:"nav-top",children:n.jsxs("nav",{className:"main-nav","data-lab-nav":"1",children:[d.map((e,a)=>n.jsxs(l.Fragment,{children:[n.jsx("button",{type:"button",className:d[o].id===e.id?"is-on":"",onClick:()=>p(a),children:k(e.navKey)}),n.jsx("span",{className:"main-nav-sep","aria-hidden":"true"})]},e.id)),n.jsx("a",{href:"/login",className:"nav-login","aria-label":k("nav.login"),children:n.jsx(H,{size:20})}),n.jsx("span",{className:"nav-lang-desktop",children:n.jsx(K,{})})]})}),d.map((e,a)=>n.jsxs("div",{className:`lsh-pane${a===o?" is-active":""}`,"aria-hidden":a!==o,style:{transform:`translate3d(calc(${(a-o)*100}% + ${N}px), 0, 0)`},children:[e.id==="home"&&n.jsx(B,{embedded:!0}),e.id==="religion"&&n.jsx("div",{className:`lsh-page${r==="free"?" lsh-nosnap":""}`,children:n.jsx(G,{embedded:!0})}),e.id==="vision"&&n.jsx("div",{className:"lsh-page lsh-scroll",children:n.jsx(X,{embedded:!0})}),e.id==="about"&&n.jsx("div",{className:"lsh-page lsh-scroll",children:n.jsx(F,{embedded:!0})})]},e.id)),n.jsxs("div",{className:"lsh-modeswitch",role:"group","aria-label":"Ovládanie na mobile",children:[n.jsx("button",{type:"button",className:r==="edge"?"is-on":"",onClick:()=>m("edge"),children:"Okraj"}),n.jsx("button",{type:"button",className:r==="free"?"is-on":"",onClick:()=>m("free"),children:"Voľný"}),n.jsx("button",{type:"button",className:r==="click"?"is-on":"",onClick:()=>m("click"),children:"Len klik"})]})]})}export{fe as default};
