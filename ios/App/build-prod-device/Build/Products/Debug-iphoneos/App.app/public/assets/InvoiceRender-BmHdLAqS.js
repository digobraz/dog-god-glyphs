import{at as B,o as F,r as j,E as R,Q as M,j as e}from"./index-7PctGTam.js";import{d as U}from"./renderData-Dw3Yr8lV.js";const $={sk:{u:["","jeden","dva","tri","štyri","päť","šesť","sedem","osem","deväť","desať","jedenásť","dvanásť","trinásť","štrnásť","pätnásť","šestnásť","sedemnásť","osemnásť","devätnásť"],t:["","","dvadsať","tridsať","štyridsať","päťdesiat","šesťdesiat","sedemdesiat","osemdesiat","deväťdesiat"],h:t=>t===1?"sto":t===2?"dvesto":`${["","","","tri","štyri","päť","šesť","sedem","osem","deväť"][t]}sto`,join:"",cur:t=>t===1?"jedno euro":t===2?"dve eurá":t===3||t===4?`${["","","","tri","štyri"][t]} eurá`:"",pre:"slovom: "},cs:{u:["","jedna","dva","tři","čtyři","pět","šest","sedm","osm","devět","deset","jedenáct","dvanáct","třináct","čtrnáct","patnáct","šestnáct","sedmnáct","osmnáct","devatenáct"],t:["","","dvacet","třicet","čtyřicet","padesát","šedesát","sedmdesát","osmdesát","devadesát"],h:t=>t===1?"sto":t===2?"dvě stě":t<5?`${["","","","tři","čtyři"][t]} sta`:`${["","","","","","pět","šest","sedm","osm","devět"][t]} set`,join:" ",cur:t=>t===1?"jedno euro":t===2?"dvě eura":t===3||t===4?`${["","","","tři","čtyři"][t]} eura`:"",pre:"slovy: "},en:{u:["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],t:["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"],h:t=>`${["","one","two","three","four","five","six","seven","eight","nine"][t]} hundred`,join:" ",cur:()=>"",pre:"in words: "}};function q(t,o){const r=$[o];if(!r||!Number.isInteger(t)||t<1||t>999)return`${t} EUR`;const p=r.cur(t);if(p)return r.pre+p;const h=d=>{if(d<20)return r.u[d];const m=r.t[Math.floor(d/10)],a=r.u[d%10];return a?o==="en"?`${m}-${a}`:`${m}${r.join}${a}`:m},s=Math.floor(t/100),g=t%100,x=[s?r.h(s):"",g?h(g):""].filter(Boolean);return`${r.pre}${x.join(r.join)} ${o==="en"?"euro":"eur"}`}const S={sk:{title:"Faktúra",invoiceNumber:"Číslo faktúry",seller:"Dodávateľ",buyer:"Odberateľ",description:"Popis položky",qty:"Množ.",unit:"MJ",unitVal:"ks",price:"Cena",subtotal:"Spolu",issued:"Dátum vystavenia",delivered:"Dátum dodania",payMethod:"Karta · Stripe",payMethodLabel:"Forma úhrady",status:"Stav",statusVal:"Uhradené",toPay:"K úhrade",paidByCard:"Uhradené kartou",paidStamp:"Uhradené",paidSmall:"Paid · ",inWords11:"slovom: jedenásť eur",vatNote:"Dodávateľ nie je platiteľom dane z pridanej hodnoty; ceny sú konečné.",orNote:"Spoločnosť zapísaná v OR Okresného súdu Trnava, oddiel Sro, vložka č. 51029/T.",paidNote:"Faktúra bola uhradená online kartou cez Stripe — neslúži ako výzva na úhradu.",footer:"In Dog We Trust",heroglyph:"Heroglyph — unikátny posvätný symbol",contribution:"Príspevok — pes na stene DOGYPT",icoLabel:"IČO",dphLabel:"DPH",dphVal:"Neplatiteľ DPH",webLabel:"Web",mailLabel:"Mail",subtotalLabel:"Medzisúčet"},cs:{title:"Faktura",invoiceNumber:"Číslo faktury",seller:"Dodavatel",buyer:"Odběratel",description:"Popis položky",qty:"Množ.",unit:"MJ",unitVal:"ks",price:"Cena",subtotal:"Celkem",issued:"Datum vystavení",delivered:"Datum dodání",payMethod:"Karta · Stripe",payMethodLabel:"Forma úhrady",status:"Stav",statusVal:"Uhrazeno",toPay:"K úhradě",paidByCard:"Uhrazeno kartou",paidStamp:"Uhrazeno",paidSmall:"Paid · ",inWords11:"slovy: jedenáct eur",vatNote:"Dodavatel není plátcem daně z přidané hodnoty; ceny jsou konečné.",orNote:"Společnost zapsaná v OR Okresního soudu Trnava, oddíl Sro, vložka č. 51029/T.",paidNote:"Faktura byla uhrazena online kartou přes Stripe — neslouží jako výzva k úhradě.",footer:"In Dog We Trust",heroglyph:"Heroglyph — unikátní posvátný symbol",contribution:"Příspěvek — pes na zdi DOGYPT",icoLabel:"IČO",dphLabel:"DPH",dphVal:"Neplátce DPH",webLabel:"Web",mailLabel:"Mail",subtotalLabel:"Mezisoučet"},en:{title:"Invoice",invoiceNumber:"Invoice No.",seller:"Supplier",buyer:"Bill To",description:"Description",qty:"Qty",unit:"Unit",unitVal:"pcs",price:"Price",subtotal:"Total",issued:"Issue Date",delivered:"Delivery Date",payMethod:"Card · Stripe",payMethodLabel:"Payment",status:"Status",statusVal:"Paid",toPay:"Amount Due",paidByCard:"Paid by card",paidStamp:"Paid",paidSmall:"Paid · ",inWords11:"in words: eleven euro",vatNote:"The supplier is not registered for VAT; prices are final.",orNote:"Company registered at District Court Trnava, section Sro, file no. 51029/T.",paidNote:"This invoice was paid online by card via Stripe — not a demand for payment.",footer:"In Dog We Trust",heroglyph:"Heroglyph — unique sacred symbol",contribution:"Contribution — dog on the DOGYPT WALL",icoLabel:"Reg. No.",dphLabel:"VAT",dphVal:"Not a VAT payer",webLabel:"Web",mailLabel:"Mail",subtotalLabel:"Subtotal"},uk:{title:"Рахунок-фактура",invoiceNumber:"Номер рахунку",seller:"Постачальник",buyer:"Покупець",description:"Опис",qty:"К-ть",unit:"Од.",unitVal:"шт.",price:"Ціна",subtotal:"Разом",issued:"Дата виставлення",delivered:"Дата постачання",payMethod:"Картка · Stripe",payMethodLabel:"Оплата",status:"Статус",statusVal:"Оплачено",toPay:"До сплати",paidByCard:"Оплачено карткою",paidStamp:"Оплачено",paidSmall:"Paid · ",inWords11:"словами: одинадцять євро",vatNote:"Постачальник не є платником ПДВ; ціни є кінцевими.",orNote:"Компанія зареєстрована в суді Трнава, розділ Sro, вклад № 51029/T.",paidNote:"Цей рахунок оплачено онлайн карткою через Stripe — не є вимогою до оплати.",footer:"In Dog We Trust",heroglyph:"Heroglyph — унікальний священний символ",contribution:"Внесок — пес на стіні DOGYPT",icoLabel:"Рег. номер",dphLabel:"ПДВ",dphVal:"Не платник ПДВ",webLabel:"Сайт",mailLabel:"E-mail",subtotalLabel:"Проміжний підсумок"}};function G(t,o){return o&&S[o]?o:t==="SVK"?"sk":t==="CZE"?"cs":"en"}function Y(t){if(!t)return"—";try{const o=new Date(t),r=String(o.getDate()).padStart(2,"0"),p=String(o.getMonth()+1).padStart(2,"0"),h=o.getFullYear();return`${r}. ${p}. ${h}`}catch{return"—"}}function N(t){return t.toFixed(2).replace(".",",")+" €"}function Q(){var P;const{id:t}=B(),[o]=F(),r=o.get("key")||"",p=o.get("lang"),h=o.get("data"),[s,g]=j.useState(null),[x,d]=j.useState("");if(j.useEffect(()=>{let i=!0;const l=U(h);if(l){g(l);return}return(async()=>{if(!t){d("missing id");return}try{const n=await fetch(`${R}/get-render-data?id=${encodeURIComponent(t)}&key=${encodeURIComponent(r)}&include=invoice`,{headers:{Authorization:`Bearer ${M}`,apikey:M}});if(!n.ok){d(`fetch ${n.status}`);return}const u=await n.json();i&&g(u)}catch(n){i&&d(n.message)}})(),()=>{i=!1}},[t,r,h]),j.useEffect(()=>{if(!s)return;let i=!1;return(async()=>{var L;try{await(((L=document.fonts)==null?void 0:L.ready)??Promise.resolve())}catch{}await new Promise(c=>setTimeout(c,400));const n=document.getElementById("invoice-page"),u=n==null?void 0:n.querySelector(".seal");if(n&&u){const c=u.getBoundingClientRect(),b=c.width*.1,y={left:c.left+b,right:c.right-b,top:c.top+b,bottom:c.bottom-b},C=[];n.querySelectorAll(".note, .paid-stamp, .words, .trow, .lx-c, .lx-row").forEach(f=>{const T=document.createRange();T.selectNodeContents(f),C.push(...Array.from(T.getClientRects()))}),C.some(f=>f.right>y.left&&f.left<y.right&&f.bottom>y.top&&f.top<y.bottom)&&n.classList.add("tight")}i||document.documentElement.setAttribute("data-render-ready","1")})(),()=>{i=!0}},[s]),x)return e.jsxs("div",{"data-render-error":x,style:{padding:20},children:["render error: ",x]});if(!s)return e.jsx("div",{style:{padding:20},children:"loading…"});const m=G(s.country,p),a=S[m]||S.en,_=s.owner_name||"",v=((P=s.items)!=null&&P.length?s.items:[{dog_name:s.dog_name,amount:s.amount,payment_status:null}]).map(i=>({name:i.dog_name||"Unnamed",amount:i.amount??11,title:i.payment_status==="supporter"?a.contribution:a.heroglyph})),k=[];for(const i of v){const l=k.find(n=>n.title===i.title&&n.unit===i.amount);l?(l.qty+=1,l.names.push(i.name)):k.push({title:i.title,unit:i.amount,qty:1,names:[i.name]})}const w=v.reduce((i,l)=>i+l.amount,0),D=N(w),V=s.invoice_number||"—",E=s.invoice_issued_at||s.created_at,z=Y(E),A=!$[m]&&w===11?a.inWords11:q(w,m),W=v.length<=2,I=`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cinzel+Decorative:wght@700&family=Space+Grotesk:wght@300;400;500;600&display=swap');
    :root {
      --ink: #1a1310;
      --ink-soft: #5a4b3a;
      --ink-faint: #9c8a72;
      --gold: #C99A3F;
      --gold-deep: #9a7325;
      --papyrus: #f6efdd;
      --papyrus-2: #f1e7cf;
      --line: rgba(154,115,37,0.28);
      --line-soft: rgba(90,75,58,0.16);
    }
    * { box-sizing: border-box; }
    html, body, #root { margin: 0; background: #2a2620; }
    body {
      font-family: 'Space Grotesk', Arial, sans-serif;
      color: var(--ink);
      padding: 32px 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    #invoice-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background:
        radial-gradient(ellipse 120% 80% at 50% -10%, rgba(201,154,63,0.06), transparent 60%),
        linear-gradient(168deg, #f8f2e1 0%, var(--papyrus) 30%, var(--papyrus-2) 70%, #f8f2e1 100%);
      position: relative;
      box-shadow: 0 24px 70px rgba(0,0,0,.45);
      overflow: hidden;
    }
    .frame {
      position: absolute; inset: 10mm;
      border: 1px solid var(--line-soft);
      pointer-events: none;
    }
    .frame::before {
      content: ""; position: absolute; inset: 2.5mm;
      border: 1px solid rgba(201,154,63,0.18);
    }
    .pad { position: relative; z-index: 2; padding: 22mm 20mm 18mm; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand .logo { display: block; width: 44mm; height: auto; }
    .brand .tag {
      font-family: 'Cinzel', serif; font-size: 8.5px; letter-spacing: .42em;
      text-transform: uppercase; color: var(--gold-deep); margin-top: 4mm; padding-left: 1mm;
    }
    .doc { text-align: right; }
    .doc .word {
      font-family: 'Cinzel', serif; font-weight: 600; font-size: 13px;
      letter-spacing: .4em; text-transform: uppercase; color: var(--ink-soft);
    }
    .doc .num {
      font-family: 'Cinzel', serif; font-weight: 600; font-size: 21px;
      letter-spacing: .10em; color: var(--ink); margin-top: 4px;
    }
    .rule { height: 1px; background: linear-gradient(90deg,transparent,var(--line),transparent); margin: 9mm 0; }
    .rule.tight { margin: 5mm 0; }
    .parties { display: flex; gap: 14mm; }
    .party { flex: 1; }
    .plabel {
      font-family: 'Cinzel', serif; font-size: 8.5px; letter-spacing: .30em;
      text-transform: uppercase; color: var(--gold-deep); margin-bottom: 6px;
    }
    .party .name { font-size: 13px; font-weight: 600; letter-spacing: .01em; }
    .party .lines { font-size: 10.5px; line-height: 1.65; color: var(--ink-soft); margin-top: 3px; }
    .party .lines b { color: var(--ink); font-weight: 500; }
    .kv { margin-top: 6px; font-size: 10px; line-height: 1.6; color: var(--ink-soft); }
    .kv span { display: inline-block; min-width: 42px; color: var(--ink-faint); }
    .meta { display: flex; gap: 0; margin-top: 2mm; }
    .meta .cell { flex: 1; padding: 4mm 4mm 4mm 0; }
    .meta .cell + .cell { padding-left: 6mm; border-left: 1px solid var(--line-soft); }
    .meta .mlabel { font-size: 8.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-faint); }
    .meta .mval { font-size: 12px; margin-top: 4px; color: var(--ink); font-weight: 500; }
    .lx { margin-top: 2mm; font-size: 11px; }
    .lx-head {
      display: flex; justify-content: space-between;
      font-family: 'Cinzel', serif; font-size: 8.5px; letter-spacing: .18em;
      text-transform: uppercase; color: var(--gold-deep); font-weight: 600;
      padding-bottom: 4mm; border-bottom: 1px solid var(--line);
    }
    .lx-c { display: flex; align-items: baseline; gap: 5mm; padding: 4mm 0; border-bottom: 1px solid var(--line-soft); }
    .lx-name { font-family: 'Cinzel Decorative', serif; font-weight: 700; font-size: 14px; letter-spacing: .04em; min-width: 34mm; }
    .lx-sub { flex: 1; font-size: 10px; color: var(--ink-faint); }
    .lx-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8mm; padding: 5mm 0; border-bottom: 1px solid var(--line-soft); }
    .lx-title { font-weight: 600; }
    .lx-dogs { margin-top: 2.5mm; display: flex; flex-wrap: wrap; gap: 2mm; }
    .lx-dog {
      font-family: 'Cinzel Decorative', serif; font-weight: 700; font-size: 10px; letter-spacing: .06em;
      color: var(--ink-soft); border: 1px solid var(--line); border-radius: 999px; padding: 1mm 3mm;
    }
    .lx-amt { text-align: right; white-space: nowrap; }
    .lx-amt small { display: block; color: var(--ink-faint); font-size: 9.5px; margin-bottom: 1mm; }
    .totals { display: flex; justify-content: space-between; align-items: flex-end; gap: 12mm; margin-top: 8mm; }
    .tbox { min-width: 78mm; }
    .trow { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-soft); padding: 2.5mm 0; }
    .trow.grand {
      margin-top: 3mm; padding-top: 4mm; border-top: 1.5px solid var(--gold);
      align-items: baseline;
    }
    .trow.grand .lbl { font-family: 'Cinzel', serif; letter-spacing: .16em; text-transform: uppercase; font-size: 11px; color: var(--ink); }
    .trow.grand .val { font-family: 'Cinzel', serif; font-weight: 700; font-size: 24px; letter-spacing: .04em; color: var(--ink); }
    .words { text-align: right; font-size: 9.5px; color: var(--ink-faint); font-style: italic; margin-top: 3mm; }
    .paid-stamp {
      display: inline-block; margin-top: 7mm;
      padding: 2.5mm 7mm;
      border: 2.5px solid #0f8a7e; border-radius: 3px;
      font-family: 'Cinzel', serif; font-weight: 700;
      font-size: 15px; letter-spacing: .30em; text-transform: uppercase;
      color: #0f8a7e;
      transform: rotate(-8deg); opacity: .82;
      box-shadow: inset 0 0 0 1.5px rgba(15,138,126,.30);
    }
    .paid-stamp small { display: block; font-size: 8px; letter-spacing: .34em; font-weight: 500; margin-top: 1.5mm; opacity: .85; }
    .seal {
      position: absolute; left: 50%; bottom: 24mm;
      transform: translateX(-50%) rotate(-5deg);
      width: 34mm; height: 34mm; z-index: 3;
    }
    .seal img {
      width: 100%; height: 100%; object-fit: contain;
      filter: sepia(.4) saturate(1.2) hue-rotate(-6deg) opacity(.92);
      mix-blend-mode: multiply;
    }
    /* Pečať sa zmenší LEN keď by do nej narazil obsah (Matej 25. 9. 2026:
       *„nevidím dôvod prečo pri 4 psoch je menšia pečať“*). Triedu dáva meranie
       pred data-render-ready, nie počet psov. */
    #invoice-page.tight .seal { width: 22mm; height: 22mm; bottom: 22mm; }
    .note { margin: 0; font-size: 9px; line-height: 1.7; color: var(--ink-faint); flex: 0 1 92mm; }
    .note b { color: var(--ink-soft); font-weight: 600; }
    .foot {
      position: absolute; left: 0; right: 0; bottom: 14mm; text-align: center;
      font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: .4em;
      text-transform: uppercase; color: var(--gold-deep);
    }
    @media print {
      body { padding: 0; background: #fff; }
      #invoice-page { box-shadow: none; margin: 0; }
    }
    @page { size: A4 portrait; margin: 0; }
  `,O=e.jsx("div",{className:"seal",children:e.jsx("img",{src:"https://dogypt.com/images/peciat-dogypt.png",alt:"DOGYPT seal"})});return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:I}),e.jsxs("div",{id:"invoice-page",children:[e.jsx("div",{className:"frame"}),e.jsxs("div",{className:"pad",children:[e.jsxs("div",{className:"top",children:[e.jsxs("div",{className:"brand",children:[e.jsx("img",{className:"logo",src:"https://dogypt.com/images/dogypt-logo-black-w.png",alt:"DOGYPT"}),e.jsx("div",{className:"tag",children:"In Dog We Trust"})]}),e.jsxs("div",{className:"doc",children:[e.jsx("div",{className:"word",children:a.title}),e.jsx("div",{className:"num",children:V})]})]}),e.jsx("div",{className:"rule"}),e.jsxs("div",{className:"parties",children:[e.jsxs("div",{className:"party",children:[e.jsx("div",{className:"plabel",children:a.seller}),e.jsx("div",{className:"name",children:"DOGYPT s. r. o."}),e.jsxs("div",{className:"lines",children:["Sídlisko 335/20",e.jsx("br",{}),"91930 Jaslovské Bohunice, Slovensko"]}),e.jsxs("div",{className:"kv",children:[e.jsxs("div",{children:[e.jsx("span",{children:a.icoLabel}),"54444594"]}),e.jsxs("div",{children:[e.jsx("span",{children:a.dphLabel}),a.dphVal]}),e.jsxs("div",{children:[e.jsx("span",{children:a.webLabel}),"dogypt.com"]}),e.jsxs("div",{children:[e.jsx("span",{children:a.mailLabel}),"heroglyph@dogypt.com"]})]})]}),e.jsxs("div",{className:"party",children:[e.jsx("div",{className:"plabel",children:a.buyer}),e.jsx("div",{className:"name",children:s.bill_name||_||"—"}),e.jsxs("div",{className:"lines",children:[s.email&&e.jsxs(e.Fragment,{children:[e.jsx("b",{children:s.email}),e.jsx("br",{})]}),s.bill_street&&e.jsxs(e.Fragment,{children:[s.bill_street,e.jsx("br",{})]}),(s.bill_zip||s.bill_city)&&e.jsxs(e.Fragment,{children:[[s.bill_zip,s.bill_city].filter(Boolean).join(" "),e.jsx("br",{})]}),s.bill_country?e.jsx(e.Fragment,{children:s.bill_country}):s.country?e.jsx(e.Fragment,{children:s.country}):null]})]})]}),e.jsx("div",{className:"rule tight"}),e.jsxs("div",{className:"meta",children:[e.jsxs("div",{className:"cell",children:[e.jsx("div",{className:"mlabel",children:a.issued}),e.jsx("div",{className:"mval",children:z})]}),e.jsxs("div",{className:"cell",children:[e.jsx("div",{className:"mlabel",children:a.delivered}),e.jsx("div",{className:"mval",children:z})]}),e.jsxs("div",{className:"cell",children:[e.jsx("div",{className:"mlabel",children:a.payMethodLabel}),e.jsx("div",{className:"mval",children:a.payMethod})]}),e.jsxs("div",{className:"cell",children:[e.jsx("div",{className:"mlabel",children:a.status}),e.jsx("div",{className:"mval",children:a.statusVal})]})]}),e.jsxs("div",{className:"lx",children:[e.jsxs("div",{className:"lx-head",children:[e.jsx("span",{children:a.description}),e.jsx("span",{children:a.subtotal})]}),W?v.map((i,l)=>e.jsxs("div",{className:"lx-c",children:[e.jsx("span",{className:"lx-name",children:i.name}),e.jsxs("span",{className:"lx-sub",children:[i.title," · 1 ",a.unitVal]}),e.jsx("span",{className:"lx-amt",children:N(i.amount)})]},l)):k.map((i,l)=>e.jsxs("div",{className:"lx-row",children:[e.jsxs("div",{children:[e.jsx("div",{className:"lx-title",children:i.title}),e.jsx("div",{className:"lx-dogs",children:i.names.map((n,u)=>e.jsx("span",{className:"lx-dog",children:n},u))})]}),e.jsxs("div",{className:"lx-amt",children:[e.jsxs("small",{children:[i.qty," ",a.unitVal," × ",N(i.unit)]}),N(i.unit*i.qty)]})]},l))]}),e.jsxs("div",{className:"totals",children:[e.jsxs("p",{className:"note",children:[e.jsxs("b",{children:[a.dphVal,"."]})," ",a.vatNote," ",a.orNote," ",a.paidNote]}),e.jsxs("div",{className:"tbox",children:[e.jsxs("div",{className:"trow",children:[e.jsx("span",{children:a.subtotalLabel}),e.jsx("span",{children:D})]}),e.jsxs("div",{className:"trow",children:[e.jsx("span",{children:a.paidByCard}),e.jsxs("span",{children:["− ",D]})]}),e.jsxs("div",{className:"trow grand",children:[e.jsx("span",{className:"lbl",children:a.toPay}),e.jsx("span",{className:"val",children:"0,00 €"})]}),e.jsx("div",{className:"words",children:A}),e.jsx("div",{style:{textAlign:"right"},children:e.jsxs("span",{className:"paid-stamp",children:[a.paidStamp,e.jsxs("small",{children:[a.paidSmall,z]})]})})]})]})]}),O,e.jsx("div",{className:"foot",children:a.footer})]})]})}export{Q as default};
