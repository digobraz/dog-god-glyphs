import{v as a,s as p,m as n,L as o,T as l,b,_ as c}from"./index-DriUOdZL.js";import{c as h}from"./MomentHost-D9oSu3w3.js";const g="inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid)",t=`linear-gradient(180deg,color-mix(in srgb,${o.edge} 72%,white),${o.deep})`,m=`inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 color-mix(in srgb,${o.deep} 60%,black)`,u=`
html.papyrus3d .msg-skin{--msg-title:var(--p3d-ink);--msg-dim:var(--p3d-ink);--msg-bar:transparent;--msg-bar-edge:transparent;--msg-bar-shadow:none;--msg-sep:transparent;--msg-row-hot:transparent;}
html.papyrus3d .msg-inbox-title,html.papyrus3d .msg-thread-title{font-family:'LT Museum',serif;font-weight:400;font-size:${a.h1}px;letter-spacing:.02em;text-transform:none;color:var(--p3d-ink);}
/* K1: riadok správy = karta s perom */
html.papyrus3d .msg-inbox-list{display:flex;flex-direction:column;gap:${p.lg}px;}
html.papyrus3d .msg-row{border:2.5px solid var(--p3d-ink);border-radius:${n.card}px;background:var(--p3d-card);box-shadow:${g};padding:${p.md}px;}
html.papyrus3d .msg-row:last-child{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .msg-row-name{font-family:'LT Museum',serif !important;font-weight:400;font-size:${a.h2}px;}
html.papyrus3d .msg-row-preview,html.papyrus3d .msg-row-time,html.papyrus3d .msg-row-pack{font-size:${a.body}px;color:var(--p3d-ink);}
html.papyrus3d .msg-avatar{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .msg-tagchip{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);color:var(--p3d-ink);}
/* K2: prázdny stav = obálka */
html.papyrus3d .msg-emptytitle{font-family:'LT Museum',serif;font-weight:400;font-size:${a.h2}px;color:var(--p3d-ink);}
html.papyrus3d .msg-emptyimg{width:96px;height:96px;object-fit:contain;display:block;}
/* K3: bubliny */
html.papyrus3d .msg-bubble{font-size:${a.lead}px;border:2.5px solid var(--p3d-ink);border-radius:${n.card}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:${g};}
html.papyrus3d .msg-bubble.me{background:${t};border-color:${o.ink};color:${o.ink};box-shadow:${m};}
html.papyrus3d .msg-bubble-sender{color:var(--p3d-gold-ink);}
html.papyrus3d .msg-bubbleav{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .msg-thread-dock{border-top:0;background:transparent;}
html.papyrus3d .msg-thread-input{min-height:54px;border:2.5px solid var(--p3d-ink);border-radius:${n.card}px;background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);color:var(--p3d-ink);font-weight:500;}
html.papyrus3d .msg-thread-input:focus{border-color:var(--p3d-ink);box-shadow:var(--p3d-inset);}
html.papyrus3d .msg-sendbtn{width:56px;height:56px;border:2.5px solid ${o.ink};background:${t};box-shadow:${m};}
html.papyrus3d .msg-sendbtn:hover:not(:disabled){background:${t};}
html.papyrus3d .msg-sendbtn:disabled{background:var(--p3d-card);border-color:var(--p3d-ink);}
html.papyrus3d .msg-joinbtn{min-height:56px;border:2.5px solid ${o.ink};border-radius:${n.card}px;background:${t};color:${o.ink};box-shadow:${m};font-family:'LT Museum',serif;font-weight:400;font-size:${a.h2}px;letter-spacing:0;text-transform:none;}
/* K4: zablokovaný */
html.papyrus3d .msg-blocked{border-top:0;background:transparent;}
html.papyrus3d .msg-blockedtxt{font-size:${a.lead}px;color:var(--p3d-ink);}
html.papyrus3d .msg-unblock{min-height:56px;padding:0 ${p.lg}px;border:2.5px solid var(--p3d-ink);border-radius:${n.card}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:var(--p3d-b3);font-family:'LT Museum',serif;font-weight:400;font-size:${a.h2}px;letter-spacing:0;text-transform:none;}
`,r=b,f=`
.msg-skin{
  --msg-page:${l};
  --msg-bar:${r.panelGrad};
  --msg-bar-edge:rgba(179,130,45,0.55);
  --msg-bar-shadow:0 2px 10px rgba(122,90,42,0.10);
  --msg-title:#8A5F1E;
  --msg-ink:${r.inkStrong};
  --msg-dim:${r.inkWarm};
  --msg-faint:rgba(42,22,8,0.42);
  --msg-block:${r.panelGrad};
  --msg-block-edge:${r.cardEdge};
  --msg-block-ink:${r.inkStrong};
  --msg-block-shadow:0 2px 6px rgba(122,90,42,0.16), inset 0 1px 0 rgba(255,255,255,0.45);
  /* MOJA bublina + odosielacie tlačidlo = jedna rodina „ja". */
  --msg-mine:linear-gradient(180deg,#16307A,#0A1A4A);
  --msg-mine-hover:linear-gradient(180deg,#1E3C90,#0F2560);
  --msg-mine-edge:#0A1A4A;
  --msg-mine-ink:#EFD79A;
  --msg-mine-shadow:0 4px 13px -3px rgba(5,15,48,0.6), inset 0 1px 0 ${r.hairline};
  --msg-focus:#16307A;
  --msg-focus-halo:rgba(22,48,122,0.22);
  --msg-btn:rgba(255,251,240,0.55);
  --msg-btn-edge:rgba(179,130,45,0.55);
  --msg-btn-ink:${r.inkStrong};
  --msg-btn-hot:${r.card};
  --msg-field:${r.card};
  --msg-field-ink:${r.inkStrong};
  --msg-chip:rgba(201,154,63,0.20);
  --msg-chip-hot:rgba(201,154,63,0.32);
  --msg-chip-ink:#8A5F1E;
  --msg-err:#8E2A20;
  --msg-off:rgba(201,154,63,0.20);
  /* Jemné oddelenie riadkov inboxu a podklad dotyku (IG Direct). */
  --msg-sep:rgba(179,130,45,0.28);
  --msg-row-hot:rgba(201,154,63,0.14);
  /* Ikonka v tlačidle odoslania na lapise = biela (doslovný reťazec z FILTERS v BrandIcon.tsx,
     ten ich sype inline, takže sa prebíja len cez !important). */
  --msg-icon:brightness(0) invert(1);
}
/* PODKLAD STRÁNKY = plochý papyrus, BEZ tapety heroglyfov (ani ::before/::after). */
.msg-skin{position:relative;background-color:var(--msg-page);color:var(--msg-ink);}
${u}
`;let s=null,d=null;function v(){return s?Promise.resolve(s):d||(d=c(()=>import("./data-trails-C5F812_6.js"),[]).then(i=>(s=new Map(i.HERO_TRAILS.map(e=>[e.id,e.name])),s)).catch(()=>(d=null,new Map)),d)}function y(i,e){return!i||!s?e:s.get(h(i))??e}export{f as M,y as a,v as t};
