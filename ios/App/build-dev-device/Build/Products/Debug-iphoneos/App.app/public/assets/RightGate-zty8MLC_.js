import{u as z,j as r,r as c,P as l}from"./index-B-BQrD2y.js";import{toast as h}from"./use-toast-NWTrH8M9.js";import{o as y}from"./HandIcons-nK6bMixK.js";import{u as j}from"./dogRights-BhKk5QOi.js";const E=`
.rg-locked,.rg-wrap{
  opacity:.55;
  cursor:pointer;
  position:relative;
}
/* Prerušovaný rám nesie LEN klonovaný prvok. Na obale by stál okolo prvku, ktorý
   svoj rám už má (zlatá pilulka UPRAVIŤ), a dva rámy nad sebou sa nečítajú ako
   "zamknuté", ale ako chyba vykreslenia — odmerané na doklade psa. */
.rg-locked{border:1px dashed ${l.border} !important}
.rg-locked *,.rg-wrap *{pointer-events:none}
/* 🔴 ZÁMOK NEDEDÍ FARBU TEXTU — má vlastný odznak, a je to nález z testu.
   S dedenou farbou zmizol na dlaždici pridávania (svetlý inkoust na papyruse)
   a rovnako by zanikol kdekoľvek, kde je farba textu blízka pozadiu. Papyrusový
   krúžok so zlatým lemom drží tmavý zámok čitateľný na svetlom aj tmavom
   povrchu — a znak zamknutia tým vyzerá naprieč appkou rovnako. */
.rg-lock{
  flex:none;box-sizing:content-box;
  color:${l.inkStrong};background:${l.card};
  border:1px solid ${l.cardEdge};border-radius:999px;padding:2px;
  margin-right:.35em;vertical-align:-0.25em;
}
/* Veľká plocha (fotka psa) — zámok NA nej, nie v riadku textu.
   ⚠️ NIE do rohu: fotka psa je KRUH s orezaním, takže roh štvorca leží mimo
   viditeľnej plochy a zámok tam zmizne (odmerané na doklade psa). Stojí preto
   dolu v strede — vnútri kruhu pri každom pomere strán a mimo očí psa. */
.rg-lock--corner{
  position:absolute;left:50%;bottom:7px;transform:translateX(-50%);
  margin:0;padding:3px;
}
`;let v=!1;function w(){if(v||typeof document>"u")return;v=!0;const e=document.createElement("style");e.setAttribute("data-rg","1"),e.textContent=E,document.head.appendChild(e)}function V({right:e,dogId:a,lock:m="inline",children:n}){const x=z(),d=(o,b)=>{const f=x(o);return f===o?b:f},s=j();if((Array.isArray(e)?e:[e]).some(o=>o==="owner"?s.isOwner(a):a===void 0?s.canAny(o):s.can(a,o)))return r.jsx(r.Fragment,{children:n});w();const u=a?s.dogName(a):null,p=u?d("pack.gate.ownerOf","Only {dog}’s owner can change this.").replace("{dog}",u):d("pack.gate.owner","Only the owner can change this."),k=m==="corner"?"rg-lock rg-lock--corner":"rg-lock",g=o=>{o.preventDefault(),o.stopPropagation(),h({title:p})};if(!c.isValidElement(n)||typeof n.type!="string")return r.jsxs("span",{className:"rg-wrap",onClickCapture:g,style:{display:"inline-flex",alignItems:"center",gap:2},children:[r.jsx(y,{size:13,className:k,title:p}),n]});const t=n,i={className:[t.props.className,"rg-locked"].filter(Boolean).join(" "),onClickCapture:g};return N(t)&&(i.readOnly=!0),typeof t.type=="string"&&t.type==="button"&&(i.disabled=!1),C(t)?c.cloneElement(t,i):c.cloneElement(t,i,r.jsx(y,{size:m==="corner"?15:13,className:k,title:p},"rg-lock"),t.props.children)}function N(e){return typeof e.type=="string"&&["input","textarea","select"].includes(e.type)}const A=["input","img","br","hr","area","embed","source","track","wbr"];function C(e){return typeof e.type=="string"&&A.includes(e.type)}export{V as R};
