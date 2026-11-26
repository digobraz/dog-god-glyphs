import{u as P,r as j,j as e,d as V,a3 as B,aN as L,av as C,m as l,b as H,a0 as c,s as K,a1 as g,v as G,ay as h}from"./index-DriUOdZL.js";import{u as R}from"./useSheetSwipe-Ch0ng1WW.js";import{N as F,g as E,h as p,i as k,j as M,k as Y}from"./profileMates-D-7uVnac.js";import{m as U,g as X,k as T,n as W,q as y,s as q,w as O,x as b,y as S}from"./MomentHost-D9oSu3w3.js";import{DevotionToday as J}from"./DevotionToday-B4nlNLyT.js";import{B as Q}from"./BrandIcon-lowQpHlA.js";const n=H,a=K,i=G,Z=`
${L}
.dvs-root.pk-veil{z-index:65;align-items:flex-end;padding:0;animation:dvs-fade .3s ease both;}
.dvs-sheet{position:relative;width:100%;max-height:${C};display:flex;flex-direction:column;background:${F};color:${E};
  border-top:1.5px solid ${p};border-radius:${l.card}px ${l.card}px 0 0;box-shadow:${n.panelShadow};font-family:${c};
  animation:dvs-up .38s cubic-bezier(.2,.8,.2,1) both;}
.dvs-grab{--pk-grab:${n.onDarkBorder};margin:${a.sm}px auto 0;}
.dvs-head{flex:none;display:flex;align-items:center;gap:${a.md}px;padding:${a.sm}px ${a.lg}px ${a.md}px;}
.dvs-head h2{margin:0;font-family:${g};font-weight:700;font-size:${i.lead}px;letter-spacing:.14em;text-transform:uppercase;color:${p};}
.dvs-body{overflow-y:auto;overscroll-behavior:contain;padding:0 ${a.lg}px calc(env(safe-area-inset-bottom,0px) + ${a.xl}px);}
/* HRDINA — kde som: gulička stupňa, stav ☥, koľko chýba, a 22 guličiek cesty (Novic → Polboh). */
.dvs-hero{position:relative;overflow:hidden;margin:0 0 ${a.md}px;padding:${a.lg}px;border-radius:${l.tile}px;border:1px solid ${p};
  background:radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--dv-glow) 22%, transparent), transparent 60%), rgba(0,0,0,.28);}
.dvs-me{display:flex;align-items:center;gap:${a.md}px;}
.dvs-orb{flex:none;display:grid;place-items:center;width:48px;height:48px;border-radius:${l.pill}px;background:var(--dv-dot);filter:drop-shadow(0 0 12px var(--dv-glow));}
.dvs-orb b{font-family:${c};font-weight:600;font-size:${i.h2}px;line-height:1;color:var(--dv-icon-ink);}
.dvs-me .tx{flex:1;min-width:0;}
.dvs-me h3{margin:0;font-family:${g};font-weight:700;font-size:${i.lead}px;letter-spacing:.14em;text-transform:uppercase;color:${E};}
.dvs-me p{margin:${a.xs}px 0 0;white-space:nowrap;font-size:${i.label}px;color:${n.onDarkDim};}
.dvs-me p b{font-family:${c};font-weight:600;color:${p};}
.dvs-bal{flex:none;display:inline-flex;align-items:center;gap:${a.xs}px;font-family:${c};font-weight:600;font-size:${i.h2}px;color:${p};}
.dvs-path{display:flex;justify-content:space-between;align-items:center;margin-top:${a.lg}px;}
.dvs-path i{display:block;width:8px;height:8px;border-radius:${l.pill}px;border:1px solid ${n.onDarkBorder};}
.dvs-path i.done{border:0;background:var(--d);}
.dvs-path i.cur{width:12px;height:12px;border:0;background:var(--d);filter:drop-shadow(0 0 6px var(--d));}
.dvs-ends{display:flex;justify-content:space-between;margin-top:${a.sm}px;font-size:${i.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${n.onDarkDim};}
.dvs-intro{margin:0 0 ${a.lg}px;font-size:${i.label}px;line-height:1.5;color:${n.onDarkDim};}
/* SKUPINY = tmavé podbloky, každá s kresbou z kitu. Hodnota = žiariaca pilulka, „čoskoro“ = čiarkovaný obrys. */
.dvs-grp{margin:0 0 ${a.md}px;padding:${a.md}px;border-radius:${l.tile}px;border:1px solid ${n.onDarkBorder};background:rgba(0,0,0,.22);}
.dvs-grp h4{display:flex;align-items:center;gap:${a.sm}px;margin:0 0 ${a.sm}px;font-family:${c};font-weight:500;font-size:${i.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${p};}
.dvs-grp h4 span{display:grid;place-items:center;width:24px;height:24px;border-radius:${l.pill}px;border:1px solid ${p};}
.dvs-row{display:flex;justify-content:space-between;align-items:center;gap:${a.md}px;padding:${a.sm}px 0;font-size:${i.body}px;border-top:1px solid ${n.onDarkBorder};}
.dvs-row:first-of-type{border-top:0;}
.dvs-row.off > span{color:${n.onDarkDim};}
.dvs-v{flex:none;display:inline-flex;align-items:center;gap:${a.xs}px;padding:${a.xs}px ${a.sm}px;border-radius:${l.pill}px;white-space:nowrap;
  font-family:${c};font-weight:600;font-size:${i.label}px;color:#140D07;background:linear-gradient(180deg,#F1D58C,${p});filter:drop-shadow(0 0 6px rgba(201,154,63,.35));}
.dvs-v.soon{font-family:${c};font-weight:500;color:${n.onDarkDim};background:none;filter:none;border:1px dashed ${n.onDarkBorder};}
.dvs-cta{display:block;width:100%;margin:0 0 ${a.lg}px;padding:${a.md}px;border:1px solid ${h.edge};border-radius:${l.field}px;cursor:pointer;
  font-family:${g};font-weight:700;font-size:${i.label}px;letter-spacing:.14em;text-transform:uppercase;
  background:${h.grad};color:#140D07;box-shadow:${h.glow};}
.dvs-note{margin:${a.sm}px 0 0;font-size:${i.micro}px;line-height:1.5;color:${n.onDarkDim};text-align:center;}
@media (min-width:768px){
  .dvs-root.pk-veil{align-items:center;padding:${a.xl}px;}
  .dvs-sheet{width:560px;max-height:86dvh;border:1.5px solid ${p};border-radius:${l.card}px;}
  .dvs-grab{display:none;}
  .dvs-head{padding-top:${a.lg}px;}
  .dvs-body{padding:0 ${a.xl}px ${a.xl}px;}
}
@keyframes dvs-up{from{transform:translateY(100%);}to{transform:none;}}
@keyframes dvs-fade{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.dvs-sheet,.dvs-root.pk-veil{animation:none;}}
`;function de({devotion:v,onClose:x}){const f=R(x),_=P(),o=(s,t)=>{const m=_(s);return m===s?t:m},[I,$]=j.useState(!1);j.useEffect(()=>{const s=document.body.style.overflow;document.body.style.overflow="hidden";const t=m=>{m.key==="Escape"&&x()};return window.addEventListener("keydown",t),()=>{document.body.style.overflow=s,window.removeEventListener("keydown",t)}},[x]);const z=e.jsx("b",{className:"dvs-v soon",children:o("pack.dvinfo.soon","soon")}),u=s=>e.jsxs("b",{className:"dvs-v",children:[s,e.jsx(k,{size:12,tint:"dark"})]}),d=s=>u(`+${s}`),A=[["walk",o("pack.dvinfo.daily","Every day with your dog"),[[o("pack.dvinfo.walkShort2","Short walk under 20 min (up to 5× a day)"),d(y.walk_short.points)],[o("pack.dvinfo.walk2","Walk 20 min – 2 hours"),d(y.walk.points)],[o("pack.dvinfo.trip2","Day trip — when you log it (for each dog who came)"),d(q)]]],["sun",o("pack.dvinfo.prayers","Prayers"),[[o("pack.dvinfo.presence2","Prayer of presence — 10 min only with your dog"),d(y.presence.points)]]],["food",o("pack.dvinfo.feeding","Feeding — adds itself every day"),[[o("pack.dvinfo.kibble","Kibble"),d(O.kibble)],[o("pack.dvinfo.barf","BARF"),d(O.barf)]]],["ankh",o("pack.dvinfo.sacraments","Sacraments"),[[o("pack.dvinfo.baptism","Baptism with a heroglyph"),d(b.baptism)],[o("pack.dvinfo.puppy","Welcoming a puppy"),null],[o("pack.dvinfo.memorial","Memorial for a dog who left"),null]]],["trophy",o("pack.dvinfo.honours","Recognitions"),[[o("pack.dvinfo.dogid","DOG ID at 100 % (once per dog)"),d(b.dogid_full)],[o("pack.dvinfo.scroll","A scroll read in Dog Sense (up to 3 a day)"),d(b.scroll_read)],[o("pack.dvinfo.chronicle","Note in the chronicle (up to 3× a day)"),d(S.chronicle)],[o("pack.dvinfo.goodDeed","Good deed (approved by AINUBIS, once a day)"),d(S.good_deed)],[o("pack.dvinfo.streak","Streak of 7 · 30 · 100 · 365 days"),u(Object.values(U).map(s=>`+${s}`).join(" · "))],[o("pack.dvinfo.charity","Helping dogs in need"),null],[o("pack.dvinfo.helping","Helping another Dogyptian"),null]]]],r=X(v??0),w=s=>Math.round(s).toLocaleString("sk-SK");return V.createPortal(e.jsxs("div",{className:"dvs-root pk-veil pk-veil--modal",role:"dialog","aria-modal":"true","aria-label":o("pack.dvinfo.title","How you earn devotion"),onClick:s=>{s.target===s.currentTarget&&x()},children:[e.jsx("style",{children:B}),e.jsx("style",{children:Z}),e.jsxs("div",{className:"dvs-sheet",style:f.sheetStyle,children:[e.jsx("span",{className:"dvs-grab pk-grab","aria-hidden":!0,...f.handle}),e.jsx("div",{className:"dvs-head",...f.handle,children:e.jsx("h2",{children:o("pack.dvinfo.title","How you earn devotion")})}),e.jsxs("div",{className:"dvs-body",children:[v!=null&&e.jsxs("div",{className:"dvs-hero",style:Y(r.index),children:[e.jsxs("div",{className:"dvs-me",children:[e.jsx("span",{className:"dvs-orb",children:e.jsx("b",{children:r.index})}),e.jsxs("div",{className:"tx",children:[e.jsx("h3",{children:o(`pack.ladder.${r.key}`,r.name)}),r.next&&e.jsxs("p",{children:[o("pack.dvinfo.toNext","To {name}:").replace("{name}",o(`pack.ladder.${r.next.key}`,r.next.name))," ",e.jsx("b",{children:w(r.toNext)})," ",e.jsx(k,{size:12})]})]}),e.jsxs("span",{className:"dvs-bal",children:[w(v),e.jsx(k,{size:18})]})]}),e.jsx("div",{className:"dvs-path","aria-label":o("pack.rank.devAbout","Devotion is your path in DOGYPT — {n} steps from Novice to Demigod.").replace("{n}",String(T.length)),children:M.map((s,t)=>e.jsx("i",{className:t+1<r.index?"done":t+1===r.index?"cur":"",style:{"--d":s.dot}},s.key))}),e.jsxs("div",{className:"dvs-ends",children:[e.jsx("span",{children:o("pack.ladder.novice","Novice")}),e.jsx("span",{children:T.length}),e.jsx("span",{children:o("pack.ladder.demigod","Demigod")})]})]}),e.jsx("p",{className:"dvs-intro",children:o("pack.dvinfo.intro","Devotion grows with what you do for your dog and the pack — prayers, sacraments and recognitions. It cannot be bought.")}),e.jsx("button",{type:"button",className:"dvs-cta",onClick:()=>$(!0),children:o("pack.dvinfo.logToday","Log today")}),A.map(([s,t,m])=>e.jsxs("div",{className:"dvs-grp",children:[e.jsxs("h4",{children:[e.jsx("span",{children:e.jsx(Q,{name:s,size:14})}),t]}),m.map(([D,N])=>e.jsxs("div",{className:`dvs-row${N?"":" off"}`,children:[e.jsx("span",{children:D}),N??z]},D))]},t)),e.jsx("p",{className:"dvs-note",children:o("pack.dvinfo.note2","Devotion is counted for every living dog. Values marked “soon” are being set.")}),e.jsx("p",{className:"dvs-note",children:o("pack.dvinfo.cap","Daily limit for walks, prayers, feeding and notes: {n}").replace("{n}",String(W))})]})]}),I&&e.jsx(J,{onClose:()=>$(!1)})]}),document.body)}export{de as D};
