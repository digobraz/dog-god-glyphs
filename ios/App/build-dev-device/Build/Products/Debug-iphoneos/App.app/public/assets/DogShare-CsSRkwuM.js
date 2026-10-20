import{u as Y,ao as q,l as R,r as c,E as H,h as J,e as K,z as Q,j as s,L as g,b as z,Q as p,d as V,aW as X,a_ as Z}from"./index-B-BQrD2y.js";import{P as ee}from"./PageTopBar-CT5LPjhX.js";import{S as se}from"./Seo-I5eL5xxs.js";import{p as ae,d as T}from"./dogSlug-CB23gDR2.js";import{a as te,c as G}from"./countryGeo-BaPfaSrG.js";import{u as ne,D as oe}from"./DogMessage-DZ5CoDjn.js";import{w as b}from"./cloudinaryService-BTfH_t1m.js";import{S as ie}from"./ShareCard-jVQIXiXn.js";import{c as re}from"./flowPaleSkin-DiO04FM5.js";import"./handArrowLeft-DN9pj_cL.js";import"./dogypt-logo-gold-D67FOL39.js";import"./dogypt-logo-mobile-B7sCn4Sq.js";import"./useBodyScrollLock-Bv8v-6Ri.js";import"./createLucideIcon-B_Tc6GtW.js";import"./LanguagePicker-CQj7MbWL.js";import"./flagUrl-B21iQI9I.js";import"./labTheme-p7t_6k9Y.js";const L=H,C=()=>{const a=window.__dogPhotoW;if(a)return a;const l=Math.min(window.innerWidth||400,400);return Math.min(1080,Math.ceil(l*(window.devicePixelRatio||1)/120)*120)},le="https://dogypt.com/og-image.jpg";function ce(a,l,d){if(!a)return null;const n=new Date(a);if(Number.isNaN(n.getTime()))return null;let t;if(l==="deceased"){if(!d||(t=new Date(d),Number.isNaN(t.getTime())))return null}else t=new Date;if(n>t)return null;let r=t.getFullYear()-n.getFullYear(),o=t.getMonth()-n.getMonth(),e=t.getDate()-n.getDate();e<0&&(o-=1,e+=new Date(t.getFullYear(),t.getMonth(),0).getDate()),o<0&&(r-=1,o+=12);const f=Math.floor((t.getTime()-n.getTime())/864e5),i=Math.max(1,Math.round(f/365.25*7));return{years:r,months:o,days:e,totalDays:f,humanYears:i}}function de(a){const l=c.useRef(null),[d,n]=c.useState(0);return c.useLayoutEffect(()=>{const t=l.current;if(!t)return;const r=()=>n(t.clientWidth/1080);r();const o=new ResizeObserver(r);return o.observe(t),()=>o.disconnect()},[]),s.jsx("div",{ref:l,className:"ds-media",children:s.jsx("div",{style:{position:"absolute",top:0,left:0,transform:`scale(${d})`,transformOrigin:"0 0",visibility:d?"visible":"hidden"},children:s.jsx(ie,{...a})})})}function De(){var D,E;const a=Y(),{pack:l,slug:d}=q(),n=ae(d??l),[t]=R(),[r,o]=c.useState("loading"),[e,f]=c.useState(null);c.useEffect(()=>{let m=!0;if(n===null){o("notfound");return}const W=L===X?window.__dogFeed:void 0;return window.__dogFeed=void 0,(W??fetch(`${L}/get-grid-dogs?tiers=all`).then(u=>u.ok?u.json():[])).then(u=>{if(!m)return;const j=u.find(x=>x.pack_number===n);if(j){f(j),o("found");const x=T(j.dog_name,n);window.location.pathname!==x&&window.history.replaceState(null,"",x+window.location.search)}else o("notfound")}).catch(()=>{m&&o("notfound")}),()=>{m=!1}},[n]),c.useEffect(()=>{J("share_landing_view",{pack:n,ref:t.get("ref")||null,channel:t.get("utm_medium")||null})},[]);const i=(e==null?void 0:e.dog_name)||"This dog",k=(e==null?void 0:e.share_card_url)||(e==null?void 0:e.cloudinary_main_url)||le,F=b(k,"c_fit,w_780,f_auto,q_auto"),O=b(k,"c_fit,w_1200,f_auto,q_auto"),$=r==="found"?`${i} — DOGYPT`:"DOGYPT",M=r==="found"?`${i} is one of the first 1,000,000 dogs of DOGYPT. Find your dog's place in the global pack.`:"Join the first 1,000,000 dogs of DOGYPT. Find your dog's place in the global pack.",A=m=>{e!=null&&e.pack_number&&Z(e.pack_number)},h=e?te(e.country):null,{lang:B}=K(),I=(()=>{if(!h)return"";try{return new Intl.DisplayNames([Q(B)],{type:"region"}).of(h.toUpperCase())||G(h)}catch{return G(h)}})(),v=(e==null?void 0:e.wall_tier)==="guest",N=e?ce(e.birth_date,e.life_status,e.death_date):null,y=((D=e==null?void 0:e.owner_first_name)==null?void 0:D.trim())||null,w=((E=e==null?void 0:e.owner_message)==null?void 0:E.trim())||"",_=ne(e==null?void 0:e.pack_number,w),[S,U]=c.useState(!1),P=(e==null?void 0:e.life_status)==="deceased";return s.jsxs("div",{className:"hf-pale dogshare-page min-h-screen flex flex-col",children:[s.jsx(se,{title:$,description:M,path:r==="found"&&n!==null?T(i,n):window.location.pathname,type:"article",ogImage:O}),s.jsx("style",{children:re+oe+`
        .ds-main {
          flex: 1 1 auto; display: flex; flex-direction: column; align-items: center;
          padding: 8px 16px calc(24px + var(--consent-h, 0px));
        }
        .ds-main > * { margin-top: auto; }
        .ds-main > :last-child { margin-bottom: auto; }
        .ds-card {
          width: 100%; max-width: 400px;
          display: flex; flex-direction: column; gap: 16px;
          padding: 16px; color: #2a1608;
        }
        .ds-media {
          position: relative; width: 100%; aspect-ratio: 1 / 1; flex: none;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 12px 28px -14px rgba(58,38,8,0.5);
        }
        .ds-body { display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center; }
        .ds-body > * { width: 100%; }
        @media (min-width: 768px) {
          .ds-card { max-width: 832px; display: grid; grid-template-columns: 400px 1fr; gap: 24px; padding: 24px; align-items: center; }
          .ds-body { padding: 8px 8px 8px 0; }
        }
        .ds-head { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .ds-name { margin: 0; font-family: 'Cinzel Decorative', serif; font-weight: 900; font-size: 24px; line-height: 1.15; letter-spacing: 0.04em; color: #1a1a1a; overflow-wrap: anywhere; }
        .ds-num {
          display: inline-flex; align-items: center; padding: 4px 16px; border-radius: 999px;
          background: ${g.grad}; color: ${g.ink}; box-shadow: ${z};
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 20px; line-height: 1.1;
        }
        .ds-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .ds-fact { padding: 12px 16px; text-align: center; min-width: 0; }
        .ds-fact i {
          display: block; font-family: 'Space Grotesk', sans-serif; font-style: normal; font-weight: 500;
          font-size: 10px; line-height: 1.3; letter-spacing: 0.22em; text-transform: uppercase; color: #8C6014;
        }
        .ds-fact b {
          display: block; margin-top: 4px; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px;
          line-height: 1.2; color: #1a1a1a; text-transform: uppercase; overflow-wrap: anywhere;
        }
        .ds-quote { padding: 12px 16px; }
        .ds-msg {
          margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 400; font-style: italic;
          font-size: 14px; line-height: 1.5; color: rgba(26,26,26,0.72);
          display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 6; overflow: hidden;
        }
        .ds-msg-by { margin: 4px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: rgba(42,22,8,0.55); }
        .dogshare-invite {
          margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px; line-height: 1.3;
          letter-spacing: 0.14em; text-transform: uppercase; color: #6E4E18;
        }
        .ds-cta {
          align-self: stretch; min-height: 56px; display: flex; align-items: center; justify-content: center;
          border-radius: 8px; text-decoration: none;
          background: ${g.grad}; color: ${g.ink}; border: 1px solid ${g.edge};
          box-shadow: ${z};
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 200ms ease;
        }
        .ds-cta:hover { background: ${g.gradHover}; }
        .dogshare-bones { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .dogshare-bones-main { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 12px; line-height: 1.4; color: #2a1608; }
        .dogshare-bones-note { font-family: 'Space Grotesk', sans-serif; font-size: 10px; line-height: 1.4; color: rgba(42,22,8,0.55); }
        .dogshare-back-link {
          margin-top: 16px; font-family: 'Space Grotesk', sans-serif; font-size: 12px;
          color: rgba(42,22,8,0.6); text-decoration: none;
        }
        .dogshare-back-link:hover { color: ${g.edge}; }
        .ds-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
      `}),s.jsx("div",{className:"hf-topbar",children:s.jsx(ee,{})}),s.jsxs("main",{className:"ds-main",children:[r==="notfound"&&s.jsxs("div",{className:"ds-card",style:{alignItems:"center",textAlign:"center",padding:24},children:[s.jsx("h1",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:20,letterSpacing:"0.04em",textTransform:"uppercase",margin:0},children:a("dogPage.notFoundTitle")}),s.jsx("p",{style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:14,color:"rgba(42,22,8,0.65)",margin:0},children:a("dogPage.notFoundBody")}),s.jsx("a",{href:"/heroglyph/name",className:"ds-cta",children:a("wall.hero.cta")})]}),r==="found"&&e&&s.jsxs(s.Fragment,{children:[s.jsxs("article",{className:"ds-card",style:p.card,children:[s.jsx("h1",{className:"ds-sr",children:i}),e.pack_number!==null?s.jsx(de,{packNumber:e.pack_number,dogName:i,photoUrl:b(e.cloudinary_main_url||"",`c_fill,w_${C()},h_${C()},g_auto,f_auto,q_auto`),heroglyphUrl:b(e.heroglyph_png_url||"","c_fit,w_1200,f_auto,q_auto"),country:e.country}):s.jsx("img",{src:F,alt:`${i} — DOGYPT`,className:"ds-media",style:{objectFit:"cover"}}),s.jsxs("div",{className:"ds-body",children:[s.jsxs("div",{className:"ds-head",children:[s.jsx("h2",{className:"ds-name",children:i}),e.pack_number!==null&&s.jsxs("span",{className:"ds-num",children:["#",e.pack_number]})]}),s.jsxs("div",{className:"ds-grid",children:[s.jsxs("div",{className:"ds-fact",style:p.subblock,children:[s.jsx("i",{children:a(P?"dogPage.livedBestLife":"pack.dog.livingBestLife")}),s.jsx("b",{children:N?a("dogPage.daysCount",{days:N.totalDays.toLocaleString("en-US")}):"—"})]}),s.jsxs("div",{className:"ds-fact",style:p.subblock,children:[s.jsx("i",{children:a("dogPage.statusLbl")}),s.jsx("b",{children:a(P?"dogPage.dogAngel":"dogPage.livingLegend")})]}),s.jsxs("div",{className:"ds-fact",style:p.subblock,children:[s.jsx("i",{children:a("dogPage.stateLbl")}),s.jsx("b",{children:a(v?"dogPage.stateGuest":"dogPage.stateMember")})]}),s.jsxs("div",{className:"ds-fact",style:p.subblock,children:[s.jsx("i",{children:a("dogPage.countryLbl")}),s.jsx("b",{children:I||"—"})]})]}),w&&s.jsxs("div",{className:"ds-quote",style:p.row,children:[s.jsxs("p",{className:"ds-msg",children:["“",_.translated&&!S?_.text:w,"”"]}),_.translated&&s.jsx("button",{type:"button",className:"dm-toggle",onClick:()=>U(m=>!m),children:a(S?"wall.msg.showTr":"wall.msg.showOrig")}),s.jsxs("p",{className:"ds-msg-by",children:["— ",y||i]})]}),s.jsx("p",{className:"dogshare-invite",children:y?a("dogPage.invitedByDog",{name:y.toUpperCase(),dog:i.toUpperCase()}):a("dogPage.invitedByFallback")}),s.jsx("a",{href:"/heroglyph/name",className:"ds-cta",onClick:A,children:a("dogPage.joinUs")}),!v&&s.jsxs("div",{className:"dogshare-bones",children:[s.jsx("span",{className:"dogshare-bones-main",children:a("dogPage.bonesForDog",{dog:i.toUpperCase()})}),s.jsx("span",{className:"dogshare-bones-note",children:a("dogPage.bonesNote")})]})]})]}),s.jsx(V,{to:"/",className:"dogshare-back-link",children:a("dogPage.backToWall")})]})]})]})}export{De as default};
