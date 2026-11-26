import{s as d,b as T,v as c,a0 as u,m as h,L as k,a1 as N,r as b,j as t,w as D}from"./index-DriUOdZL.js";import{S as E}from"./SysIcon-CI9hudiL.js";import{toast as F}from"./use-toast-CKCh4Cay.js";import{onDogEventsChange as P,readEvents as _,deleteDiaryEvent as w}from"./dogEvents-p0BnCK5N.js";import{sizedUrl as S}from"./cloudinaryService-CiRx-3N_.js";import{c as A,i as K,b as L}from"./diaryModel-CkNNaz-k.js";const r=T,C="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif",R=A.filter(e=>e.input==="text"),I=R.map(e=>e.field),z=A.find(e=>e.input==="number");function O(e){const i=new Date(e),l=m=>String(m).padStart(2,"0");return`${i.getFullYear()}-${l(i.getMonth()+1)}-${l(i.getDate())}`}function B(e,i={}){const[l,m]=b.useState(null),n=e.join(","),x=!!i.weights;return b.useEffect(()=>{let o=!0;const y=()=>{_(n?n.split(","):[],x?[...I,z.field]:I).then(j=>{if(!o)return;const s=[];j.forEach((a,f)=>{if(a.field===z.field){typeof a.value=="number"&&a.value>0&&s.push({key:a.id??`${a.dogId}-${a.recordedAt}-${f}`,id:a.id,dogId:a.dogId,field:a.field,recordedAt:a.recordedAt,text:"",kg:a.value});return}const p=L(a.value);!p||!p.text.trim()&&!p.photo||s.push({key:a.id??`${a.dogId}-${a.recordedAt}-${f}`,id:a.id,dogId:a.dogId,field:a.field,recordedAt:a.recordedAt,createdAt:a.createdAt,text:p.text,photo:p.photo,photos:p.photos,value:a.value})}),s.sort((a,f)=>f.recordedAt.localeCompare(a.recordedAt)),m(s)}).catch(()=>{o&&m([])})};y();const $=P(y);return()=>{o=!1,$()}},[n,x]),l}function Q({row:e,dogName:i,tx:l,onEdit:m,inDay:n}){var v;const x=typeof document<"u"&&document.documentElement.lang||void 0,o=A.find(g=>g.field===e.field),y=K(O(e.recordedAt)),$=e.kg===void 0,[j,s]=b.useState(!1),[a,f]=b.useState(!1),p=async()=>{if(!a){f(!0);try{await w(e.id)}catch{F({title:l("pack.diary.deleteFailed","Could not delete the entry."),variant:"destructive"}),f(!1),s(!1)}}};return t.jsxs("article",{className:n?"dl-item dl-item--day":"dl-item",style:n?void 0:{...D.subblock},children:[t.jsxs("div",{className:"dl-meta",children:[!n&&t.jsx("span",{children:new Date(e.recordedAt).toLocaleDateString(x,{day:"numeric",month:"long",year:"numeric"})}),n&&(e.field!=="diary.note"||i)&&t.jsxs("span",{className:"dl-kind dl-kind--day",children:[e.field!=="diary.note"&&t.jsxs(t.Fragment,{children:[t.jsx("span",{style:{fontFamily:C},children:o==null?void 0:o.emoji}),o?l(o.labelKey,o.labelFallback):""]}),i&&t.jsxs("span",{className:"dl-dog",children:[e.field!=="diary.note"?"· ":"",i]})]}),y&&t.jsx("span",{className:"dl-plan",children:l("pack.diary.planTag","Plan")}),$&&m&&t.jsxs("span",{className:"dl-acts",children:[t.jsx("button",{type:"button","aria-label":l("pack.diary.edit","Edit"),onClick:()=>m(e),children:t.jsx(E,{name:"ceruzka",size:20})}),t.jsx("button",{type:"button","aria-label":l("pack.diary.delete","Delete"),onClick:()=>s(!0),children:t.jsx(E,{name:"kos",size:20})})]})]}),!n&&t.jsxs("div",{className:"dl-kind",children:[t.jsx("span",{style:{fontFamily:C},children:o==null?void 0:o.emoji}),o?l(o.labelKey,o.labelFallback):"",i&&t.jsxs("span",{className:"dl-dog",children:["· ",i]})]}),e.kg!==void 0&&t.jsxs("p",{className:"dl-text",children:[e.kg.toLocaleString(x,{maximumFractionDigits:1})," kg"]}),e.text.trim()&&t.jsx("p",{className:"dl-text",children:e.text}),(((v=e.photos)==null?void 0:v.length)??0)>1?t.jsx("div",{className:"dl-photos",children:e.photos.map(g=>t.jsx("a",{className:"pk-photo",href:g,target:"_blank",rel:"noreferrer",children:t.jsx("img",{src:S(g,360),alt:"",loading:"lazy"})},g))}):e.photo&&t.jsx("a",{className:"pk-photo dl-photo",href:e.photo,target:"_blank",rel:"noreferrer",children:t.jsx("img",{src:S(e.photo,720),alt:"",loading:"lazy"})}),j&&t.jsxs("div",{className:"dl-ask",role:"alertdialog","aria-label":l("pack.diary.deleteQ","Delete this entry?"),children:[t.jsx("span",{children:l("pack.diary.deleteQ","Delete this entry?")}),t.jsx("button",{type:"button",onClick:()=>void p(),disabled:a,children:l("pack.diary.deleteYes","Delete")}),t.jsx("button",{type:"button",className:"no",onClick:()=>s(!1),children:l("pack.diary.deleteNo","Keep it")})]})]})}const V=`
.dl-list{display:flex;flex-direction:column;gap:${d.md}px}
.dl-item{padding:${d.md}px ${d.lg}px}
.dl-item--day{padding:${d.md}px 0 0;border-top:1px solid ${r.hairline}}
.dl-item--day .dl-text{margin-top:0}
.dl-item--day > .dl-meta{float:right;margin:-8px -8px 0 ${d.sm}px}
.dl-item--day::after{content:'';display:block;clear:both}
.dl-kind--day{margin-top:0;font-size:${c.label}px;text-transform:none;letter-spacing:0}
.dl-meta{display:flex;gap:${d.sm}px;align-items:center;font-family:${u};
  font-size:${c.micro}px;letter-spacing:0.14em;text-transform:uppercase;color:${r.inkWarm}}
.dl-acts{margin-left:auto;display:inline-flex;gap:${d.xs}px}
.dl-acts button{appearance:none;display:grid;place-items:center;width:40px;height:40px;padding:0;background:none;border:0;border-radius:${h.pill}px;cursor:pointer;color:${r.inkWarm}}
.dl-ask{display:flex;align-items:center;gap:${d.md}px;flex-wrap:wrap;margin-top:${d.md}px}
.dl-ask span{flex:1 1 100%;font-family:${u};font-weight:600;font-size:${c.body}px;color:${r.inkStrong}}
.dl-ask button{border-radius:${h.field}px;cursor:pointer;padding:${d.sm}px ${d.lg}px;font-family:${u};font-weight:600;font-size:${c.label}px;border:1.5px solid ${r.border};background:${r.card};color:${r.inkStrong}}
.dl-ask button.no{border-color:${k.edge};color:${k.edge}}
.dl-plan{border:1px solid ${k.edge};color:${k.edge};border-radius:${h.pill}px;padding:0 ${d.sm}px}
.dl-kind{display:flex;gap:${d.xs}px;align-items:center;margin-top:${d.xs}px;
  font-family:${N};font-weight:700;font-size:${c.body}px;color:${r.inkStrong}}
.dl-dog{font-family:${u};font-weight:500;color:${r.inkWarm}}
.dl-text{white-space:pre-wrap;overflow-wrap:anywhere;font-family:${u};font-size:${c.body}px;
  line-height:1.55;color:${r.inkStrong};margin:${d.sm}px 0 0}
/* Fotka na PC nesmie byť plagát cez 832 px stĺpec — strop 560, na mobile celá šírka.
   POMER FOTKY, NIE RÁMU (20. 10. 2026): rám 4:3 + cover nechal z fotky na výšku len pás
   v strede — Alenka: „ukazuje ich odrezané". Výška má strop, aby fotka na výšku
   nezabrala celé okno; obraz sa vtedy zúži, neoreže. */
.dl-photo{margin-top:${d.md}px;width:fit-content;max-width:min(100%, 560px)}
.dl-photos{margin-top:${d.md}px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${d.xs}px;max-width:560px}
.dl-photos .pk-photo{aspect-ratio:1}
.dl-photos .pk-photo > img{width:100%;height:100%;object-fit:cover}
.pk-photo.dl-photo > img{width:auto;max-width:100%;height:auto;max-height:min(70vh, 560px);object-fit:contain}
/* ── ŠAT PAPYRUS 3D (hárok N6, N8) — len pod html.papyrus3d ── */
html.papyrus3d .dl-item:not(.dl-item--day){border:2.5px solid var(--p3d-ink);border-radius:${h.card}px;background:var(--p3d-card);box-shadow:var(--p3d-b3);}
html.papyrus3d .dl-item--day{border-top:2px solid var(--p3d-ink);}
html.papyrus3d .dl-kind{font-family:'LT Museum',serif;font-weight:400;font-size:${c.lead}px;} /* písmo: nadpis */
html.papyrus3d .dl-text{color:var(--p3d-ink);}
html.papyrus3d .dl-acts button{border:2.5px solid var(--p3d-ink);border-radius:${h.tile}px;background:linear-gradient(180deg,#fff,var(--p3d-paper));box-shadow:var(--p3d-lift);}
html.papyrus3d .dl-ask button{min-height:44px;border:2.5px solid var(--p3d-ink);border-radius:${h.card}px;background:linear-gradient(180deg,color-mix(in srgb,#C8202F 62%,white),#C8202F);color:#fff;font-family:'LT Museum',serif;font-weight:400;font-size:${c.lead}px;} /* písmo: cta */
html.papyrus3d .dl-ask button.no{background:linear-gradient(180deg,#fff,var(--p3d-paper));color:var(--p3d-ink);}
html.papyrus3d .dl-plan{border:2px solid var(--p3d-ink);color:var(--p3d-ink);}
`;export{V as D,Q as a,B as u};
