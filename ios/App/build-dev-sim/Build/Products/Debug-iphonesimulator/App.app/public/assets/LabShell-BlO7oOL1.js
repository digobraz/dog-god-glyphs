const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HektorBook-CvFDVaRG.js","assets/index-DriUOdZL.js","assets/index-Dt5kbd8A.css","assets/CHINESE_SIGN-DOG-C89JWf8g.js","assets/CHARACTER-WATERLOVER-Be2FY-gi.js"])))=>i.map(i=>d[i]);
import{j as e,r as g,f as Re,u as K,d as rt,a as Be,e as se,aZ as mt,F as ue,_ as gt,L as Y,c as Ne,g as st,l as ut,bq as xt,br as bt,as as X,b4 as Q,bs as ft,bt as vt,bu as wt,bv as yt,bw as kt,b5 as Pe}from"./index-DriUOdZL.js";import{L as lt}from"./LanguagePicker-L0DjjzFI.js";import{a as jt,q as zt}from"./HandIcons-BI9sYdb3.js";import{L as W}from"./labTheme-DLctEqJ2.js";import{GodsGridLab as St}from"./GodsGridLab-BiiMpnHf.js";import{d as Et}from"./dogypt-logo-round-QJ8V2TsC.js";import{u as ct}from"./useBodyScrollLock-kBfMUM5M.js";import{m as At}from"./constitutionRead-C-bnV4U2.js";import{d as Ct}from"./dogypt-seal-BvRW73MR.js";import{S as Fe}from"./Seo-BBjSGQ3b.js";import{m as dt}from"./proxy-5uIz4xGy.js";import{supabase as Nt}from"./client-_yx8AKEw.js";import{g as Pt,f as Tt,e as _t,d as It,c as Lt,b as Ot,a as Dt,i as Mt}from"./council-business-BPTub_bd.js";import"./flagUrl-B21iQI9I.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./godsData-kTA2EY6K.js";import"./countryGeo-BNEVCU3g.js";import"./cloudinaryService-CiRx-3N_.js";import"./photoConfirm-Bdi68HVK.js";import"./photoIntake-EOawjgPq.js";import"./dogSlug-CB23gDR2.js";import"./useShareCard-CHDF5kRG.js";import"./DogMessage-4eQP7hWc.js";import"./createLucideIcon-Dcdrkmhx.js";import"./use-toast-CKCh4Cay.js";import"./BrandIcon-lowQpHlA.js";import"./tslib.es6-CmEaCU22.js";import"./appSession-Dt5ga50m.js";const Rt="/assets/dogypt-logo-gold-BbkQXDdp.webp",Bt="/assets/dogypt-logo-mobile-DGloGiaa.webp",pt=[{key:"nav.wall",to:"/wall-lab"},{key:"nav.vision",to:"/vision-lab"},{key:"nav.religion",to:"/religion-lab"},{key:"nav.about",to:"/about-lab"}],xe=[{code:"en",flag:"🇺🇸",label:"ENG",native:"English",enabled:!0},{code:"esp",flag:"🇪🇸",label:"ESP",native:"Español",enabled:!0},{code:"prt",flag:"🇵🇹",label:"PRT",native:"Português",enabled:!0},{code:"chn",flag:"🇨🇳",label:"CHN",native:"中文",enabled:!0},{code:"jpn",flag:"🇯🇵",label:"JPN",native:"日本語",enabled:!0},{code:"ind",flag:"🇮🇳",label:"IND",native:"हिन्दी",enabled:!0},{code:"ara",flag:"🇸🇦",label:"ARA",native:"العربية",enabled:!0},{code:"rus",flag:"🇷🇺",label:"RUS",native:"Русский",enabled:!0},{code:"kor",flag:"🇰🇷",label:"KOR",native:"한국어",enabled:!0},{code:"sk",flag:"🇸🇰",label:"SVK",native:"Slovenčina",enabled:!0},{code:"cs",flag:"🇨🇿",label:"CZE",native:"Čeština",enabled:!0},{code:"deu",flag:"🇩🇪",label:"DEU",native:"Deutsch",enabled:!0},{code:"nld",flag:"🇳🇱",label:"NLD",native:"Nederlands",enabled:!0},{code:"fra",flag:"🇫🇷",label:"FRA",native:"Français",enabled:!0},{code:"ita",flag:"🇮🇹",label:"ITA",native:"Italiano",enabled:!0},{code:"pol",flag:"🇵🇱",label:"POL",native:"Polski",enabled:!0},{code:"ukr",flag:"🇺🇦",label:"UKR",native:"Українська",enabled:!0},{code:"tur",flag:"🇹🇷",label:"TUR",native:"Türkçe",enabled:!0}];function Ft(){const[r,s]=g.useState(()=>typeof window<"u"&&window.matchMedia("(max-width: 767px)").matches);return g.useEffect(()=>{const c=window.matchMedia("(max-width: 767px)"),p=h=>s(h.matches);return c.addEventListener("change",p),()=>c.removeEventListener("change",p)},[]),r}function Ht(){return Ft()?e.jsx(Gt,{}):e.jsx($t,{})}function $t(){const{pathname:r}=Be(),{lang:s,setLang:c}=Re(),p=K(),[h,d]=g.useState(!1);g.useEffect(()=>{if(!h)return;const w=f=>{f.key==="Escape"&&d(!1)};return document.addEventListener("keydown",w),()=>document.removeEventListener("keydown",w)},[h]),ct(h);const b=xe.find(w=>w.code===s)??xe[0];return e.jsxs("nav",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:14,padding:"10px 0 6px",position:"relative",zIndex:50},children:[pt.map(({key:w,to:f})=>{const j=f==="/wall-lab"?r==="/wall-lab":r===f;return e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:14},children:[e.jsx(se,{to:f,style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:"clamp(10px, 1.5vw, 0.78rem)",letterSpacing:"0.15em",textTransform:"uppercase",color:j?"#C99A3F":"rgba(110,71,16,0.62)",textDecoration:"none",borderBottom:j?"1px solid #C99A3F":"1px solid transparent",paddingBottom:2,transition:"color 0.2s, opacity 0.2s",whiteSpace:"nowrap"},children:p(w)}),e.jsx("span",{"aria-hidden":!0,style:{display:"inline-block",width:1,height:12,background:"rgba(201,154,63,0.38)"}})]},f)}),e.jsx("button",{type:"button",onClick:()=>d(!0),"aria-haspopup":"dialog","aria-label":`Change language (current: ${b.label})`,style:{display:"inline-flex",alignItems:"center",padding:"2px 4px",background:"transparent",border:"none",cursor:"pointer",fontSize:"clamp(15px, 1.6vw, 18px)",lineHeight:1},children:e.jsx("span",{children:b.flag})}),h&&rt.createPortal(e.jsx(Vt,{currentCode:s,onSelect:w=>{c(w),d(!1)},onClose:()=>d(!1)}),document.body)]})}function Gt(){const[r,s]=g.useState(!1),{lang:c,setLang:p}=Re(),h=K();return g.useEffect(()=>{if(!r)return;const d=b=>{b.key==="Escape"&&s(!1)};return document.addEventListener("keydown",d),()=>document.removeEventListener("keydown",d)},[r]),ct(r),e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",onClick:()=>s(!0),"aria-label":h("nav.aria.openMenu"),"aria-haspopup":"dialog","aria-expanded":r,style:{background:"transparent",border:"none",padding:"6px 18px 4px",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"},children:[e.jsx("style",{children:`
          @keyframes chevronPulse {
            0%, 100% {
              filter: drop-shadow(0 0 0 rgba(201, 154, 63, 0));
              opacity: 0.88;
              transform: translateY(0);
            }
            50% {
              filter: drop-shadow(0 0 6px rgba(201, 154, 63, 0.60));
              opacity: 1;
              transform: translateY(2px);
            }
          }
          .chevron-svg {
            display: block;
            animation: chevronPulse 2.4s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .chevron-svg { animation: none; opacity: 1; transform: none; }
          }
        `}),e.jsx("svg",{width:"28",height:"16",viewBox:"0 0 28 16",fill:"none","aria-hidden":!0,className:"chevron-svg",children:e.jsx("path",{d:"M4 4 L14 12.5 L24 4",stroke:"#8a5a14",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})})]}),r&&rt.createPortal(e.jsx(Wt,{currentLang:c,onSelectLang:d=>p(d),onClose:()=>s(!1)}),document.body)]})}function Wt({currentLang:r,onSelectLang:s,onClose:c}){const{pathname:p}=Be(),[h,d]=g.useState(!1),b=K(),w=xe.find(f=>f.code===r)??xe[0];return e.jsxs("div",{role:"dialog","aria-modal":"true","aria-label":b("nav.aria.menu"),onClick:c,style:{position:"fixed",inset:0,background:"linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)",zIndex:300,display:"flex",flexDirection:"column",animation:"mobileMenuSlide 0.32s cubic-bezier(0.22, 1, 0.36, 1)",overflowY:"auto"},children:[e.jsx("style",{children:`
        @keyframes mobileMenuSlide {
          from { transform: translateY(-100%); }
          to   { transform: translateY(0); }
        }
        @keyframes mobileMenuFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}),e.jsx("div",{"aria-hidden":!0,style:{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, rgba(255,255,255,0.42) 0%, rgba(201,154,63,0.10) 62%, rgba(138,90,20,0.20) 100%)",pointerEvents:"none"}}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:h?"flex-start":"center",gap:h?10:24,padding:h?"12px 24px 16px":"60px 24px 40px",position:"relative",zIndex:1,animation:"mobileMenuFade 0.38s ease-out 0.08s both",transition:"gap 0.32s ease, padding 0.32s ease, justify-content 0.32s ease"},children:[e.jsx(se,{to:"/",onClick:c,"aria-label":b("nav.aria.wallHome"),style:{display:"inline-flex",transition:"transform 0.32s ease, margin 0.32s ease",transform:h?"scale(0.36)":"scale(1)",transformOrigin:"top center",marginBottom:h?-68:4},children:e.jsx("div",{style:{width:138,height:138,borderRadius:999,border:"2px solid rgba(201,154,63,0.70)",background:"#000",boxShadow:"0 0 44px rgba(201,154,63,0.42), inset 0 0 0 3px rgba(0,0,0,0.6)",display:"inline-flex",alignItems:"center",justifyContent:"center",overflow:"hidden"},children:e.jsx("img",{src:Et,alt:"DOGYPT",style:{width:"100%",height:"100%",objectFit:"contain"}})})}),pt.map(({key:f,to:j})=>{const N=j==="/"?p==="/"||p==="/grid"||p==="/gods"||p==="/wall"||p==="/hall":p===j;return e.jsx(se,{to:j,onClick:c,style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:h?14:22,letterSpacing:"0.18em",textTransform:"uppercase",color:N?"#C99A3F":"rgba(58,34,4,0.80)",textDecoration:"none",borderBottom:N?"1.5px solid #C99A3F":"1.5px solid transparent",paddingBottom:3,WebkitTapHighlightColor:"transparent",transition:"font-size 0.32s ease"},children:b(f)},j)}),e.jsxs("div",{onClick:f=>f.stopPropagation(),style:{marginTop:h?6:18,display:"flex",flexDirection:"column",alignItems:"center",gap:10,width:"100%",maxWidth:280,flex:h?"1 1 auto":"0 0 auto",minHeight:0,transition:"margin 0.32s ease"},children:[e.jsxs("button",{type:"button",onClick:()=>d(f=>!f),"aria-haspopup":"listbox","aria-expanded":h,style:{display:"inline-flex",alignItems:"center",gap:10,padding:"10px 18px",background:"rgba(201,154,63,0.12)",border:"1px solid rgba(201,154,63,0.55)",borderRadius:999,cursor:"pointer",color:"#2a1608",fontFamily:"'Cinzel', serif",fontWeight:600,fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase"},children:[e.jsx("span",{style:{fontSize:18,lineHeight:1},children:w.flag}),e.jsx("span",{children:w.label}),e.jsx("svg",{width:"10",height:"6",viewBox:"0 0 10 6",fill:"none","aria-hidden":!0,style:{transform:h?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"},children:e.jsx("path",{d:"M1 1 L5 5 L9 1",stroke:"#C99A3F",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]}),h&&e.jsx("div",{role:"listbox",style:{width:"100%",flex:"1 1 auto",minHeight:0,overflow:"hidden",display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gridTemplateRows:"repeat(9, 1fr)",gridAutoFlow:"column",gap:6,padding:8,background:"rgba(201,154,63,0.08)",border:"1px solid rgba(201,154,63,0.30)",borderRadius:10,animation:"mobileMenuFade 0.2s ease-out"},children:xe.map(f=>{const j=f.code===r;return e.jsxs("button",{type:"button",role:"option","aria-selected":j,"aria-disabled":!f.enabled,onClick:()=>{f.enabled&&(s(f.code),d(!1))},style:{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 9px",background:j?"rgba(201,154,63,0.30)":"transparent",border:j?"1px solid #C99A3F":"1px solid rgba(201,154,63,0.25)",borderRadius:6,cursor:f.enabled?"pointer":"not-allowed",color:"#2a1608",opacity:f.enabled?1:.38},children:[e.jsx("span",{style:{fontSize:15,lineHeight:1},children:f.flag}),e.jsx("span",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:10,letterSpacing:"0.08em"},children:f.label})]},f.code)})})]})]})]})}function Vt({currentCode:r,onSelect:s,onClose:c}){const p=K();return e.jsxs("div",{role:"dialog","aria-modal":"true","aria-label":p("nav.aria.chooseLanguage"),onClick:c,style:{position:"fixed",inset:0,background:"rgba(58,34,4,0.48)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"langModalBackdrop 0.18s ease-out"},children:[e.jsx("style",{children:`
        @keyframes langModalBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes langModalCard {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lang-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 8px;
          max-height: min(60vh, 440px);
          overflow-y: auto;
        }
        @media (max-width: 767px) {
          .lang-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}),e.jsxs("div",{onClick:h=>h.stopPropagation(),style:{width:"100%",maxWidth:520,padding:"20px 22px 24px",background:"linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)",border:"1.5px solid #C99A3F",borderRadius:14,boxShadow:"0 16px 56px rgba(0,0,0,0.7), 0 0 0 4px rgba(201,154,63,0.22)",animation:"langModalCard 0.22s ease-out"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12},children:[e.jsx("div",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:13,letterSpacing:"0.18em",textTransform:"uppercase",color:"#1a0a05"},children:p("nav.langModal.title")}),e.jsx("button",{type:"button",onClick:c,"aria-label":p("nav.aria.close"),style:{background:"transparent",border:"none",cursor:"pointer",fontSize:22,lineHeight:1,color:"#1a0a05",padding:0,width:28,height:28,display:"inline-flex",alignItems:"center",justifyContent:"center"},children:"×"})]}),e.jsx("div",{role:"listbox",className:"lang-grid",children:xe.map(h=>{const d=h.code===r;return e.jsxs("button",{type:"button",role:"option","aria-selected":d,"aria-disabled":!h.enabled,onClick:()=>{h.enabled&&s(h.code)},style:{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 10px",background:d?"rgba(201,154,63,0.30)":"transparent",border:d?"1.5px solid #C99A3F":"1px solid rgba(201,154,63,0.30)",borderRadius:8,cursor:h.enabled?"pointer":"not-allowed",opacity:h.enabled?1:.42,transition:"background 0.15s, border-color 0.15s"},onMouseEnter:b=>{!d&&h.enabled&&(b.currentTarget.style.background="rgba(201,154,63,0.18)")},onMouseLeave:b=>{d||(b.currentTarget.style.background="transparent")},children:[e.jsx("span",{style:{fontSize:18,lineHeight:1},children:h.flag}),e.jsxs("span",{style:{display:"flex",flexDirection:"column",alignItems:"flex-start"},children:[e.jsx("span",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:11,letterSpacing:"0.10em",textTransform:"uppercase",color:"#1a0a05",lineHeight:1.2},children:h.label}),e.jsx("span",{style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:10,color:"#5c3e10",lineHeight:1.2},children:h.native})]})]},h.code)})})]})]})}function je({withNav:r=!1,onBack:s,backAriaLabel:c}){const p=K(),h=c??p("nav.aria.back"),d=e.jsxs(e.Fragment,{children:[e.jsx("img",{src:Bt,alt:"DOGYPT",className:"h-10 object-contain md:hidden"}),e.jsx("img",{src:Rt,alt:"DOGYPT",className:"hidden md:block md:h-12 object-contain"})]});return r?e.jsxs("div",{className:"flex-shrink-0 relative flex flex-col items-center justify-center gap-1 md:gap-0 px-5 md:px-0 pb-1 md:pb-2 pt-[15px] md:pt-[25px]",style:{zIndex:2},children:[e.jsx(se,{to:"/wall-lab","aria-label":"WALL",className:"flex-shrink-0 md:mb-1",children:d}),e.jsx(Ht,{})]}):e.jsxs("div",{className:"flex-shrink-0 flex items-center justify-center relative pt-[15px] pb-2 px-4 md:pt-[25px]",children:[s&&e.jsx("button",{type:"button",onClick:s,"aria-label":h,className:"absolute left-4 top-[15px] p-2 text-foreground/60 hover:text-foreground transition-colors",children:e.jsx(jt,{size:20})}),d,e.jsx("div",{className:"absolute right-5 top-[12px] md:top-[20px]",children:e.jsx(lt,{variant:"flow"})})]})}var De={exports:{}};(function(r,s){(function(c,p){p(s)})(mt,function(c){class p{constructor(t,o){this.state={angle:0,area:[],position:{x:0,y:0},hardAngle:0,hardDrawingAngle:0},this.createdDensity=o,this.nowDrawingDensity=this.createdDensity,this.render=t}setDensity(t){this.createdDensity=t,this.nowDrawingDensity=t}setDrawingDensity(t){this.nowDrawingDensity=t}setPosition(t){this.state.position=t}setAngle(t){this.state.angle=t}setArea(t){this.state.area=t}setHardDrawingAngle(t){this.state.hardDrawingAngle=t}setHardAngle(t){this.state.hardAngle=t,this.state.hardDrawingAngle=t}setOrientation(t){this.orientation=t}getDrawingDensity(){return this.nowDrawingDensity}getDensity(){return this.createdDensity}getHardAngle(){return this.state.hardAngle}}class h extends p{constructor(t,o,a){super(t,a),this.image=null,this.isLoad=!1,this.loadingAngle=0,this.image=new Image,this.image.src=o}draw(t){const o=this.render.getContext(),a=this.render.convertToGlobal(this.state.position),n=this.render.getRect().pageWidth,i=this.render.getRect().height;o.save(),o.translate(a.x,a.y),o.beginPath();for(let l of this.state.area)l!==null&&(l=this.render.convertToGlobal(l),o.lineTo(l.x-a.x,l.y-a.y));o.rotate(this.state.angle),o.clip(),this.isLoad?o.drawImage(this.image,0,0,n,i):this.drawLoader(o,{x:0,y:0},n,i),o.restore()}simpleDraw(t){const o=this.render.getRect(),a=this.render.getContext(),n=o.pageWidth,i=o.height,l=t===1?o.left+o.pageWidth:o.left,m=o.top;this.isLoad?a.drawImage(this.image,l,m,n,i):this.drawLoader(a,{x:l,y:m},n,i)}drawLoader(t,o,a,n){t.beginPath(),t.strokeStyle="rgb(200, 200, 200)",t.fillStyle="rgb(255, 255, 255)",t.lineWidth=1,t.rect(o.x+1,o.y+1,a-1,n-1),t.stroke(),t.fill();const i={x:o.x+a/2,y:o.y+n/2};t.beginPath(),t.lineWidth=10,t.arc(i.x,i.y,20,this.loadingAngle,3*Math.PI/2+this.loadingAngle),t.stroke(),t.closePath(),this.loadingAngle+=.07,this.loadingAngle>=2*Math.PI&&(this.loadingAngle=0)}load(){this.isLoad||(this.image.onload=()=>{this.isLoad=!0})}newTemporaryCopy(){return this}getTemporaryCopy(){return this}hideTemporaryCopy(){}}class d{constructor(t,o){this.pages=[],this.currentPageIndex=0,this.currentSpreadIndex=0,this.landscapeSpread=[],this.portraitSpread=[],this.render=o,this.app=t,this.currentPageIndex=0,this.isShowCover=this.app.getSettings().showCover}destroy(){this.pages=[]}createSpread(){this.landscapeSpread=[],this.portraitSpread=[];for(let o=0;o<this.pages.length;o++)this.portraitSpread.push([o]);let t=0;this.isShowCover&&(this.pages[0].setDensity("hard"),this.landscapeSpread.push([t]),t++);for(let o=t;o<this.pages.length;o+=2)o<this.pages.length-1?this.landscapeSpread.push([o,o+1]):(this.landscapeSpread.push([o]),this.pages[o].setDensity("hard"))}getSpread(){return this.render.getOrientation()==="landscape"?this.landscapeSpread:this.portraitSpread}getSpreadIndexByPage(t){const o=this.getSpread();for(let a=0;a<o.length;a++)if(t===o[a][0]||t===o[a][1])return a;return null}getPageCount(){return this.pages.length}getPages(){return this.pages}getPage(t){if(t>=0&&t<this.pages.length)return this.pages[t];throw new Error("Invalid page number")}nextBy(t){const o=this.pages.indexOf(t);return o<this.pages.length-1?this.pages[o+1]:null}prevBy(t){const o=this.pages.indexOf(t);return o>0?this.pages[o-1]:null}getFlippingPage(t){const o=this.currentSpreadIndex;if(this.render.getOrientation()==="portrait")return t===0?this.pages[o].newTemporaryCopy():this.pages[o-1];{const a=t===0?this.getSpread()[o+1]:this.getSpread()[o-1];return a.length===1||t===0?this.pages[a[0]]:this.pages[a[1]]}}getBottomPage(t){const o=this.currentSpreadIndex;if(this.render.getOrientation()==="portrait")return t===0?this.pages[o+1]:this.pages[o-1];{const a=t===0?this.getSpread()[o+1]:this.getSpread()[o-1];return a.length===1?this.pages[a[0]]:t===0?this.pages[a[1]]:this.pages[a[0]]}}showNext(){this.currentSpreadIndex<this.getSpread().length&&(this.currentSpreadIndex++,this.showSpread())}showPrev(){this.currentSpreadIndex>0&&(this.currentSpreadIndex--,this.showSpread())}getCurrentPageIndex(){return this.currentPageIndex}show(t=null){if(t===null&&(t=this.currentPageIndex),t<0||t>=this.pages.length)return;const o=this.getSpreadIndexByPage(t);o!==null&&(this.currentSpreadIndex=o,this.showSpread())}getCurrentSpreadIndex(){return this.currentSpreadIndex}setCurrentSpreadIndex(t){if(!(t>=0&&t<this.getSpread().length))throw new Error("Invalid page");this.currentSpreadIndex=t}showSpread(){const t=this.getSpread()[this.currentSpreadIndex];t.length===2?(this.render.setLeftPage(this.pages[t[0]]),this.render.setRightPage(this.pages[t[1]])):this.render.getOrientation()==="landscape"&&t[0]===this.pages.length-1?(this.render.setLeftPage(this.pages[t[0]]),this.render.setRightPage(null)):(this.render.setLeftPage(null),this.render.setRightPage(this.pages[t[0]])),this.currentPageIndex=t[0],this.app.updatePageIndex(this.currentPageIndex)}}class b extends d{constructor(t,o,a){super(t,o),this.imagesHref=a}load(){for(const t of this.imagesHref){const o=new h(this.render,t,"soft");o.load(),this.pages.push(o)}this.createSpread()}}class w{static GetDistanceBetweenTwoPoint(t,o){return t===null||o===null?1/0:Math.sqrt(Math.pow(o.x-t.x,2)+Math.pow(o.y-t.y,2))}static GetSegmentLength(t){return w.GetDistanceBetweenTwoPoint(t[0],t[1])}static GetAngleBetweenTwoLine(t,o){const a=t[0].y-t[1].y,n=o[0].y-o[1].y,i=t[1].x-t[0].x,l=o[1].x-o[0].x;return Math.acos((a*n+i*l)/(Math.sqrt(a*a+i*i)*Math.sqrt(n*n+l*l)))}static PointInRect(t,o){return o===null?null:o.x>=t.left&&o.x<=t.width+t.left&&o.y>=t.top&&o.y<=t.top+t.height?o:null}static GetRotatedPoint(t,o,a){return{x:t.x*Math.cos(a)+t.y*Math.sin(a)+o.x,y:t.y*Math.cos(a)-t.x*Math.sin(a)+o.y}}static LimitPointToCircle(t,o,a){if(w.GetDistanceBetweenTwoPoint(t,a)<=o)return a;const n=t.x,i=t.y,l=a.x,m=a.y;let x=Math.sqrt(Math.pow(o,2)*Math.pow(n-l,2)/(Math.pow(n-l,2)+Math.pow(i-m,2)))+n;a.x<0&&(x*=-1);let A=(x-n)*(i-m)/(n-l)+i;return n-l+i===0&&(A=o),{x,y:A}}static GetIntersectBetweenTwoSegment(t,o,a){return w.PointInRect(t,w.GetIntersectBeetwenTwoLine(o,a))}static GetIntersectBeetwenTwoLine(t,o){const a=t[0].y-t[1].y,n=o[0].y-o[1].y,i=t[1].x-t[0].x,l=o[1].x-o[0].x,m=t[0].x*t[1].y-t[1].x*t[0].y,x=o[0].x*o[1].y-o[1].x*o[0].y,A=a*x-n*m,P=i*x-l*m,z=-(m*l-x*i)/(a*l-n*i),I=-(a*x-n*m)/(a*l-n*i);if(isFinite(z)&&isFinite(I))return{x:z,y:I};if(Math.abs(A-P)<.1)throw new Error("Segment included");return null}static GetCordsFromTwoPoint(t,o){const a=Math.abs(t.x-o.x),n=Math.abs(t.y-o.y),i=Math.max(a,n),l=[t];function m(x,A,P,z,I){return A>x?x+I*(P/z):A<x?x-I*(P/z):x}for(let x=1;x<=i;x+=1)l.push({x:m(t.x,o.x,a,i,x),y:m(t.y,o.y,n,i,x)});return l}}class f extends p{constructor(t,o,a){super(t,a),this.copiedElement=null,this.temporaryCopy=null,this.isLoad=!1,this.element=o,this.element.classList.add("stf__item"),this.element.classList.add("--"+a)}newTemporaryCopy(){return this.nowDrawingDensity==="hard"?this:(this.temporaryCopy===null&&(this.copiedElement=this.element.cloneNode(!0),this.element.parentElement.appendChild(this.copiedElement),this.temporaryCopy=new f(this.render,this.copiedElement,this.nowDrawingDensity)),this.getTemporaryCopy())}getTemporaryCopy(){return this.temporaryCopy}hideTemporaryCopy(){this.temporaryCopy!==null&&(this.copiedElement.remove(),this.copiedElement=null,this.temporaryCopy=null)}draw(t){const o=t||this.nowDrawingDensity,a=this.render.convertToGlobal(this.state.position),n=this.render.getRect().pageWidth,i=this.render.getRect().height;this.element.classList.remove("--simple");const l=`
            display: block;
            z-index: ${this.element.style.zIndex};
            left: 0;
            top: 0;
            width: ${n}px;
            height: ${i}px;
        `;o==="hard"?this.drawHard(l):this.drawSoft(a,l)}drawHard(t=""){const o=this.render.getRect().left+this.render.getRect().width/2,a=this.state.hardDrawingAngle,n=t+`
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                clip-path: none;
                -webkit-clip-path: none;
            `+(this.orientation===0?`transform-origin: ${this.render.getRect().pageWidth}px 0; 
                   transform: translate3d(0, 0, 0) rotateY(${a}deg);`:`transform-origin: 0 0; 
                   transform: translate3d(${o}px, 0, 0) rotateY(${a}deg);`);this.element.style.cssText=n}drawSoft(t,o=""){let a="polygon( ";for(const i of this.state.area)if(i!==null){let l=this.render.getDirection()===1?{x:-i.x+this.state.position.x,y:i.y-this.state.position.y}:{x:i.x-this.state.position.x,y:i.y-this.state.position.y};l=w.GetRotatedPoint(l,{x:0,y:0},this.state.angle),a+=l.x+"px "+l.y+"px, "}a=a.slice(0,-2),a+=")";const n=o+`transform-origin: 0 0; clip-path: ${a}; -webkit-clip-path: ${a};`+(this.render.isSafari()&&this.state.angle===0?`transform: translate(${t.x}px, ${t.y}px);`:`transform: translate3d(${t.x}px, ${t.y}px, 0) rotate(${this.state.angle}rad);`);this.element.style.cssText=n}simpleDraw(t){const o=this.render.getRect(),a=o.pageWidth,n=o.height,i=t===1?o.left+o.pageWidth:o.left,l=o.top;this.element.classList.add("--simple"),this.element.style.cssText=`
            position: absolute; 
            display: block; 
            height: ${n}px; 
            left: ${i}px; 
            top: ${l}px; 
            width: ${a}px; 
            z-index: ${this.render.getSettings().startZIndex+1};`}getElement(){return this.element}load(){this.isLoad=!0}setOrientation(t){super.setOrientation(t),this.element.classList.remove("--left","--right"),this.element.classList.add(t===1?"--right":"--left")}setDrawingDensity(t){this.element.classList.remove("--soft","--hard"),this.element.classList.add("--"+t),super.setDrawingDensity(t)}}class j extends d{constructor(t,o,a,n){super(t,o),this.element=a,this.pagesElement=n}load(){for(const t of this.pagesElement){const o=new f(this.render,t,t.dataset.density==="hard"?"hard":"soft");o.load(),this.pages.push(o)}this.createSpread()}}class N{constructor(t,o,a,n){this.direction=t,this.corner=o,this.topIntersectPoint=null,this.sideIntersectPoint=null,this.bottomIntersectPoint=null,this.pageWidth=parseInt(a,10),this.pageHeight=parseInt(n,10)}calc(t){try{return this.position=this.calcAngleAndPosition(t),this.calculateIntersectPoint(this.position),!0}catch{return!1}}getFlippingClipArea(){const t=[];let o=!1;return t.push(this.rect.topLeft),t.push(this.topIntersectPoint),this.sideIntersectPoint===null?o=!0:(t.push(this.sideIntersectPoint),this.bottomIntersectPoint===null&&(o=!1)),t.push(this.bottomIntersectPoint),(o||this.corner==="bottom")&&t.push(this.rect.bottomLeft),t}getBottomClipArea(){const t=[];return t.push(this.topIntersectPoint),this.corner==="top"?t.push({x:this.pageWidth,y:0}):(this.topIntersectPoint!==null&&t.push({x:this.pageWidth,y:0}),t.push({x:this.pageWidth,y:this.pageHeight})),this.sideIntersectPoint!==null?w.GetDistanceBetweenTwoPoint(this.sideIntersectPoint,this.topIntersectPoint)>=10&&t.push(this.sideIntersectPoint):this.corner==="top"&&t.push({x:this.pageWidth,y:this.pageHeight}),t.push(this.bottomIntersectPoint),t.push(this.topIntersectPoint),t}getAngle(){return this.direction===0?-this.angle:this.angle}getRect(){return this.rect}getPosition(){return this.position}getActiveCorner(){return this.direction===0?this.rect.topLeft:this.rect.topRight}getDirection(){return this.direction}getFlippingProgress(){return Math.abs((this.position.x-this.pageWidth)/(2*this.pageWidth)*100)}getCorner(){return this.corner}getBottomPagePosition(){return this.direction===1?{x:this.pageWidth,y:0}:{x:0,y:0}}getShadowStartPoint(){return this.corner==="top"?this.topIntersectPoint:this.sideIntersectPoint!==null?this.sideIntersectPoint:this.topIntersectPoint}getShadowAngle(){const t=w.GetAngleBetweenTwoLine(this.getSegmentToShadowLine(),[{x:0,y:0},{x:this.pageWidth,y:0}]);return this.direction===0?t:Math.PI-t}calcAngleAndPosition(t){let o=t;if(this.updateAngleAndGeometry(o),o=this.corner==="top"?this.checkPositionAtCenterLine(o,{x:0,y:0},{x:0,y:this.pageHeight}):this.checkPositionAtCenterLine(o,{x:0,y:this.pageHeight},{x:0,y:0}),Math.abs(o.x-this.pageWidth)<1&&Math.abs(o.y)<1)throw new Error("Point is too small");return o}updateAngleAndGeometry(t){this.angle=this.calculateAngle(t),this.rect=this.getPageRect(t)}calculateAngle(t){const o=this.pageWidth-t.x+1,a=this.corner==="bottom"?this.pageHeight-t.y:t.y;let n=2*Math.acos(o/Math.sqrt(a*a+o*o));a<0&&(n=-n);const i=Math.PI-n;if(!isFinite(n)||i>=0&&i<.003)throw new Error("The G point is too small");return this.corner==="bottom"&&(n=-n),n}getPageRect(t){return this.corner==="top"?this.getRectFromBasePoint([{x:0,y:0},{x:this.pageWidth,y:0},{x:0,y:this.pageHeight},{x:this.pageWidth,y:this.pageHeight}],t):this.getRectFromBasePoint([{x:0,y:-this.pageHeight},{x:this.pageWidth,y:-this.pageHeight},{x:0,y:0},{x:this.pageWidth,y:0}],t)}getRectFromBasePoint(t,o){return{topLeft:this.getRotatedPoint(t[0],o),topRight:this.getRotatedPoint(t[1],o),bottomLeft:this.getRotatedPoint(t[2],o),bottomRight:this.getRotatedPoint(t[3],o)}}getRotatedPoint(t,o){return{x:t.x*Math.cos(this.angle)+t.y*Math.sin(this.angle)+o.x,y:t.y*Math.cos(this.angle)-t.x*Math.sin(this.angle)+o.y}}calculateIntersectPoint(t){const o={left:-1,top:-1,width:this.pageWidth+2,height:this.pageHeight+2};this.corner==="top"?(this.topIntersectPoint=w.GetIntersectBetweenTwoSegment(o,[t,this.rect.topRight],[{x:0,y:0},{x:this.pageWidth,y:0}]),this.sideIntersectPoint=w.GetIntersectBetweenTwoSegment(o,[t,this.rect.bottomLeft],[{x:this.pageWidth,y:0},{x:this.pageWidth,y:this.pageHeight}]),this.bottomIntersectPoint=w.GetIntersectBetweenTwoSegment(o,[this.rect.bottomLeft,this.rect.bottomRight],[{x:0,y:this.pageHeight},{x:this.pageWidth,y:this.pageHeight}])):(this.topIntersectPoint=w.GetIntersectBetweenTwoSegment(o,[this.rect.topLeft,this.rect.topRight],[{x:0,y:0},{x:this.pageWidth,y:0}]),this.sideIntersectPoint=w.GetIntersectBetweenTwoSegment(o,[t,this.rect.topLeft],[{x:this.pageWidth,y:0},{x:this.pageWidth,y:this.pageHeight}]),this.bottomIntersectPoint=w.GetIntersectBetweenTwoSegment(o,[this.rect.bottomLeft,this.rect.bottomRight],[{x:0,y:this.pageHeight},{x:this.pageWidth,y:this.pageHeight}]))}checkPositionAtCenterLine(t,o,a){let n=t;const i=w.LimitPointToCircle(o,this.pageWidth,n);n!==i&&(n=i,this.updateAngleAndGeometry(n));const l=Math.sqrt(Math.pow(this.pageWidth,2)+Math.pow(this.pageHeight,2));let m=this.rect.bottomRight,x=this.rect.topLeft;if(this.corner==="bottom"&&(m=this.rect.topRight,x=this.rect.bottomLeft),m.x<=0){const A=w.LimitPointToCircle(a,l,x);A!==n&&(n=A,this.updateAngleAndGeometry(n))}return n}getSegmentToShadowLine(){const t=this.getShadowStartPoint();return[t,t!==this.sideIntersectPoint&&this.sideIntersectPoint!==null?this.sideIntersectPoint:this.bottomIntersectPoint]}}class C{constructor(t,o){this.flippingPage=null,this.bottomPage=null,this.calc=null,this.state="read",this.render=t,this.app=o}fold(t){this.setState("user_fold"),this.calc===null&&this.start(t),this.do(this.render.convertToPage(t))}flip(t){if(this.app.getSettings().disableFlipByClick&&!this.isPointOnCorners(t)||(this.calc!==null&&this.render.finishAnimation(),!this.start(t)))return;const o=this.getBoundsRect();this.setState("flipping");const a=o.height/10,n=this.calc.getCorner()==="bottom"?o.height-a:a,i=this.calc.getCorner()==="bottom"?o.height:0;this.calc.calc({x:o.pageWidth-a,y:n}),this.animateFlippingTo({x:o.pageWidth-a,y:n},{x:-o.pageWidth,y:i},!0)}start(t){this.reset();const o=this.render.convertToBook(t),a=this.getBoundsRect(),n=this.getDirectionByPoint(o),i=o.y>=a.height/2?"bottom":"top";if(!this.checkDirection(n))return!1;try{if(this.flippingPage=this.app.getPageCollection().getFlippingPage(n),this.bottomPage=this.app.getPageCollection().getBottomPage(n),this.render.getOrientation()==="landscape")if(n===1){const l=this.app.getPageCollection().nextBy(this.flippingPage);l!==null&&this.flippingPage.getDensity()!==l.getDensity()&&(this.flippingPage.setDrawingDensity("hard"),l.setDrawingDensity("hard"))}else{const l=this.app.getPageCollection().prevBy(this.flippingPage);l!==null&&this.flippingPage.getDensity()!==l.getDensity()&&(this.flippingPage.setDrawingDensity("hard"),l.setDrawingDensity("hard"))}return this.render.setDirection(n),this.calc=new N(n,i,a.pageWidth.toString(10),a.height.toString(10)),!0}catch{return!1}}do(t){if(this.calc!==null&&this.calc.calc(t)){const o=this.calc.getFlippingProgress();this.bottomPage.setArea(this.calc.getBottomClipArea()),this.bottomPage.setPosition(this.calc.getBottomPagePosition()),this.bottomPage.setAngle(0),this.bottomPage.setHardAngle(0),this.flippingPage.setArea(this.calc.getFlippingClipArea()),this.flippingPage.setPosition(this.calc.getActiveCorner()),this.flippingPage.setAngle(this.calc.getAngle()),this.calc.getDirection()===0?this.flippingPage.setHardAngle(90*(200-2*o)/100):this.flippingPage.setHardAngle(-90*(200-2*o)/100),this.render.setPageRect(this.calc.getRect()),this.render.setBottomPage(this.bottomPage),this.render.setFlippingPage(this.flippingPage),this.render.setShadowData(this.calc.getShadowStartPoint(),this.calc.getShadowAngle(),o,this.calc.getDirection())}}flipToPage(t,o){const a=this.app.getPageCollection().getCurrentSpreadIndex(),n=this.app.getPageCollection().getSpreadIndexByPage(t);try{n>a&&(this.app.getPageCollection().setCurrentSpreadIndex(n-1),this.flipNext(o)),n<a&&(this.app.getPageCollection().setCurrentSpreadIndex(n+1),this.flipPrev(o))}catch{}}flipNext(t){this.flip({x:this.render.getRect().left+2*this.render.getRect().pageWidth-10,y:t==="top"?1:this.render.getRect().height-2})}flipPrev(t){this.flip({x:10,y:t==="top"?1:this.render.getRect().height-2})}stopMove(){if(this.calc===null)return;const t=this.calc.getPosition(),o=this.getBoundsRect(),a=this.calc.getCorner()==="bottom"?o.height:0;t.x<=0?this.animateFlippingTo(t,{x:-o.pageWidth,y:a},!0):this.animateFlippingTo(t,{x:o.pageWidth,y:a},!1)}showCorner(t){if(!this.checkState("read","fold_corner"))return;const o=this.getBoundsRect(),a=o.pageWidth;if(this.isPointOnCorners(t))if(this.calc===null){if(!this.start(t))return;this.setState("fold_corner"),this.calc.calc({x:a-1,y:1});const n=50,i=this.calc.getCorner()==="bottom"?o.height-1:1,l=this.calc.getCorner()==="bottom"?o.height-n:n;this.animateFlippingTo({x:a-1,y:i},{x:a-n,y:l},!1,!1)}else this.do(this.render.convertToPage(t));else this.setState("read"),this.render.finishAnimation(),this.stopMove()}animateFlippingTo(t,o,a,n=!0){const i=w.GetCordsFromTwoPoint(t,o),l=[];for(const x of i)l.push(()=>this.do(x));const m=this.getAnimationDuration(i.length);this.render.startAnimation(l,m,()=>{this.calc&&(a&&(this.calc.getDirection()===1?this.app.turnToPrevPage():this.app.turnToNextPage()),n&&(this.render.setBottomPage(null),this.render.setFlippingPage(null),this.render.clearShadow(),this.setState("read"),this.reset()))})}getCalculation(){return this.calc}getState(){return this.state}setState(t){this.state!==t&&(this.app.updateState(t),this.state=t)}getDirectionByPoint(t){const o=this.getBoundsRect();if(this.render.getOrientation()==="portrait"){if(t.x-o.pageWidth<=o.width/5)return 1}else if(t.x<o.width/2)return 1;return 0}getAnimationDuration(t){const o=this.app.getSettings().flippingTime;return t>=1e3?o:t/1e3*o}checkDirection(t){return t===0?this.app.getCurrentPageIndex()<this.app.getPageCount()-1:this.app.getCurrentPageIndex()>=1}reset(){this.calc=null,this.flippingPage=null,this.bottomPage=null}getBoundsRect(){return this.render.getRect()}checkState(...t){for(const o of t)if(this.state===o)return!0;return!1}isPointOnCorners(t){const o=this.getBoundsRect(),a=o.pageWidth,n=Math.sqrt(Math.pow(a,2)+Math.pow(o.height,2))/5,i=this.render.convertToBook(t);return i.x>0&&i.y>0&&i.x<o.width&&i.y<o.height&&(i.x<n||i.x>o.width-n)&&(i.y<n||i.y>o.height-n)}}class _{constructor(t,o){this.leftPage=null,this.rightPage=null,this.flippingPage=null,this.bottomPage=null,this.direction=null,this.orientation=null,this.shadow=null,this.animation=null,this.pageRect=null,this.boundsRect=null,this.timer=0,this.safari=!1,this.setting=o,this.app=t;const a=new RegExp("Version\\/[\\d\\.]+.*Safari/");this.safari=a.exec(window.navigator.userAgent)!==null}render(t){if(this.animation!==null){const o=Math.round((t-this.animation.startedAt)/this.animation.durationFrame);o<this.animation.frames.length?this.animation.frames[o]():(this.animation.onAnimateEnd(),this.animation=null)}this.timer=t,this.drawFrame()}start(){this.update();const t=o=>{this.render(o),requestAnimationFrame(t)};requestAnimationFrame(t)}startAnimation(t,o,a){this.finishAnimation(),this.animation={frames:t,duration:o,durationFrame:o/t.length,onAnimateEnd:a,startedAt:this.timer}}finishAnimation(){this.animation!==null&&(this.animation.frames[this.animation.frames.length-1](),this.animation.onAnimateEnd!==null&&this.animation.onAnimateEnd()),this.animation=null}update(){this.boundsRect=null;const t=this.calculateBoundsRect();this.orientation!==t&&(this.orientation=t,this.app.updateOrientation(t))}calculateBoundsRect(){let t="landscape";const o=this.getBlockWidth(),a=o/2,n=this.getBlockHeight()/2,i=this.setting.width/this.setting.height;let l=this.setting.width,m=this.setting.height,x=a-l;return this.setting.size==="stretch"?(o<2*this.setting.minWidth&&this.app.getSettings().usePortrait&&(t="portrait"),l=t==="portrait"?this.getBlockWidth():this.getBlockWidth()/2,l>this.setting.maxWidth&&(l=this.setting.maxWidth),m=l/i,m>this.getBlockHeight()&&(m=this.getBlockHeight(),l=m*i),x=t==="portrait"?a-l/2-l:a-l):o<2*l&&this.app.getSettings().usePortrait&&(t="portrait",x=a-l/2-l),this.boundsRect={left:x,top:n-m/2,width:2*l,height:m,pageWidth:l},t}setShadowData(t,o,a,n){if(!this.app.getSettings().drawShadow)return;const i=100*this.getSettings().maxShadowOpacity;this.shadow={pos:t,angle:o,width:3*this.getRect().pageWidth/4*a/100,opacity:(100-a)*i/100/100,direction:n,progress:2*a}}clearShadow(){this.shadow=null}getBlockWidth(){return this.app.getUI().getDistElement().offsetWidth}getBlockHeight(){return this.app.getUI().getDistElement().offsetHeight}getDirection(){return this.direction}getRect(){return this.boundsRect===null&&this.calculateBoundsRect(),this.boundsRect}getSettings(){return this.app.getSettings()}getOrientation(){return this.orientation}setPageRect(t){this.pageRect=t}setDirection(t){this.direction=t}setRightPage(t){t!==null&&t.setOrientation(1),this.rightPage=t}setLeftPage(t){t!==null&&t.setOrientation(0),this.leftPage=t}setBottomPage(t){t!==null&&t.setOrientation(this.direction===1?0:1),this.bottomPage=t}setFlippingPage(t){t!==null&&t.setOrientation(this.direction===0&&this.orientation!=="portrait"?0:1),this.flippingPage=t}convertToBook(t){const o=this.getRect();return{x:t.x-o.left,y:t.y-o.top}}isSafari(){return this.safari}convertToPage(t,o){o||(o=this.direction);const a=this.getRect();return{x:o===0?t.x-a.left-a.width/2:a.width/2-t.x+a.left,y:t.y-a.top}}convertToGlobal(t,o){if(o||(o=this.direction),t==null)return null;const a=this.getRect();return{x:o===0?t.x+a.left+a.width/2:a.width/2-t.x+a.left,y:t.y+a.top}}convertRectToGlobal(t,o){return o||(o=this.direction),{topLeft:this.convertToGlobal(t.topLeft,o),topRight:this.convertToGlobal(t.topRight,o),bottomLeft:this.convertToGlobal(t.bottomLeft,o),bottomRight:this.convertToGlobal(t.bottomRight,o)}}}class T extends _{constructor(t,o,a){super(t,o),this.canvas=a,this.ctx=a.getContext("2d")}getContext(){return this.ctx}reload(){}drawFrame(){this.clear(),this.orientation!=="portrait"&&this.leftPage!=null&&this.leftPage.simpleDraw(0),this.rightPage!=null&&this.rightPage.simpleDraw(1),this.bottomPage!=null&&this.bottomPage.draw(),this.drawBookShadow(),this.flippingPage!=null&&this.flippingPage.draw(),this.shadow!=null&&(this.drawOuterShadow(),this.drawInnerShadow());const t=this.getRect();this.orientation==="portrait"&&(this.ctx.beginPath(),this.ctx.rect(t.left+t.pageWidth,t.top,t.width,t.height),this.ctx.clip())}drawBookShadow(){const t=this.getRect();this.ctx.save(),this.ctx.beginPath();const o=t.width/20;this.ctx.rect(t.left,t.top,t.width,t.height);const a={x:t.left+t.width/2-o/2,y:0};this.ctx.translate(a.x,a.y);const n=this.ctx.createLinearGradient(0,0,o,0);n.addColorStop(0,"rgba(0, 0, 0, 0)"),n.addColorStop(.4,"rgba(0, 0, 0, 0.2)"),n.addColorStop(.49,"rgba(0, 0, 0, 0.1)"),n.addColorStop(.5,"rgba(0, 0, 0, 0.5)"),n.addColorStop(.51,"rgba(0, 0, 0, 0.4)"),n.addColorStop(1,"rgba(0, 0, 0, 0)"),this.ctx.clip(),this.ctx.fillStyle=n,this.ctx.fillRect(0,0,o,2*t.height),this.ctx.restore()}drawOuterShadow(){const t=this.getRect();this.ctx.save(),this.ctx.beginPath(),this.ctx.rect(t.left,t.top,t.width,t.height);const o=this.convertToGlobal({x:this.shadow.pos.x,y:this.shadow.pos.y});this.ctx.translate(o.x,o.y),this.ctx.rotate(Math.PI+this.shadow.angle+Math.PI/2);const a=this.ctx.createLinearGradient(0,0,this.shadow.width,0);this.shadow.direction===0?(this.ctx.translate(0,-100),a.addColorStop(0,"rgba(0, 0, 0, "+this.shadow.opacity+")"),a.addColorStop(1,"rgba(0, 0, 0, 0)")):(this.ctx.translate(-this.shadow.width,-100),a.addColorStop(0,"rgba(0, 0, 0, 0)"),a.addColorStop(1,"rgba(0, 0, 0, "+this.shadow.opacity+")")),this.ctx.clip(),this.ctx.fillStyle=a,this.ctx.fillRect(0,0,this.shadow.width,2*t.height),this.ctx.restore()}drawInnerShadow(){const t=this.getRect();this.ctx.save(),this.ctx.beginPath();const o=this.convertToGlobal({x:this.shadow.pos.x,y:this.shadow.pos.y}),a=this.convertRectToGlobal(this.pageRect);this.ctx.moveTo(a.topLeft.x,a.topLeft.y),this.ctx.lineTo(a.topRight.x,a.topRight.y),this.ctx.lineTo(a.bottomRight.x,a.bottomRight.y),this.ctx.lineTo(a.bottomLeft.x,a.bottomLeft.y),this.ctx.translate(o.x,o.y),this.ctx.rotate(Math.PI+this.shadow.angle+Math.PI/2);const n=3*this.shadow.width/4,i=this.ctx.createLinearGradient(0,0,n,0);this.shadow.direction===0?(this.ctx.translate(-n,-100),i.addColorStop(1,"rgba(0, 0, 0, "+this.shadow.opacity+")"),i.addColorStop(.9,"rgba(0, 0, 0, 0.05)"),i.addColorStop(.7,"rgba(0, 0, 0, "+this.shadow.opacity+")"),i.addColorStop(0,"rgba(0, 0, 0, 0)")):(this.ctx.translate(0,-100),i.addColorStop(0,"rgba(0, 0, 0, "+this.shadow.opacity+")"),i.addColorStop(.1,"rgba(0, 0, 0, 0.05)"),i.addColorStop(.3,"rgba(0, 0, 0, "+this.shadow.opacity+")"),i.addColorStop(1,"rgba(0, 0, 0, 0)")),this.ctx.clip(),this.ctx.fillStyle=i,this.ctx.fillRect(0,0,n,2*t.height),this.ctx.restore()}clear(){this.ctx.fillStyle="white",this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)}}class v{constructor(t,o,a){this.touchPoint=null,this.swipeTimeout=250,this.onResize=()=>{this.update()},this.onMouseDown=i=>{if(this.checkTarget(i.target)){const l=this.getMousePos(i.clientX,i.clientY);this.app.startUserTouch(l),i.preventDefault()}},this.onTouchStart=i=>{if(this.checkTarget(i.target)&&i.changedTouches.length>0){const l=i.changedTouches[0],m=this.getMousePos(l.clientX,l.clientY);this.touchPoint={point:m,time:Date.now()},setTimeout(()=>{this.touchPoint!==null&&this.app.startUserTouch(m)},this.swipeTimeout),this.app.getSettings().mobileScrollSupport||i.preventDefault()}},this.onMouseUp=i=>{const l=this.getMousePos(i.clientX,i.clientY);this.app.userStop(l)},this.onMouseMove=i=>{const l=this.getMousePos(i.clientX,i.clientY);this.app.userMove(l,!1)},this.onTouchMove=i=>{if(i.changedTouches.length>0){const l=i.changedTouches[0],m=this.getMousePos(l.clientX,l.clientY);this.app.getSettings().mobileScrollSupport?(this.touchPoint!==null&&(Math.abs(this.touchPoint.point.x-m.x)>10||this.app.getState()!=="read")&&i.cancelable&&this.app.userMove(m,!0),this.app.getState()!=="read"&&i.preventDefault()):this.app.userMove(m,!0)}},this.onTouchEnd=i=>{if(i.changedTouches.length>0){const l=i.changedTouches[0],m=this.getMousePos(l.clientX,l.clientY);let x=!1;if(this.touchPoint!==null){const A=m.x-this.touchPoint.point.x,P=Math.abs(m.y-this.touchPoint.point.y);Math.abs(A)>this.swipeDistance&&P<2*this.swipeDistance&&Date.now()-this.touchPoint.time<this.swipeTimeout&&(A>0?this.app.flipPrev(this.touchPoint.point.y<this.app.getRender().getRect().height/2?"top":"bottom"):this.app.flipNext(this.touchPoint.point.y<this.app.getRender().getRect().height/2?"top":"bottom"),x=!0),this.touchPoint=null}this.app.userStop(m,x)}},this.parentElement=t,t.classList.add("stf__parent"),t.insertAdjacentHTML("afterbegin",'<div class="stf__wrapper"></div>'),this.wrapper=t.querySelector(".stf__wrapper"),this.app=o;const n=this.app.getSettings().usePortrait?1:2;t.style.minWidth=a.minWidth*n+"px",t.style.minHeight=a.minHeight+"px",a.size==="fixed"&&(t.style.minWidth=a.width*n+"px",t.style.minHeight=a.height+"px"),a.autoSize&&(t.style.width="100%",t.style.maxWidth=2*a.maxWidth+"px"),t.style.display="block",window.addEventListener("resize",this.onResize,!1),this.swipeDistance=a.swipeDistance}destroy(){this.app.getSettings().useMouseEvents&&this.removeHandlers(),this.distElement.remove(),this.wrapper.remove()}getDistElement(){return this.distElement}getWrapper(){return this.wrapper}setOrientationStyle(t){this.wrapper.classList.remove("--portrait","--landscape"),t==="portrait"?(this.app.getSettings().autoSize&&(this.wrapper.style.paddingBottom=this.app.getSettings().height/this.app.getSettings().width*100+"%"),this.wrapper.classList.add("--portrait")):(this.app.getSettings().autoSize&&(this.wrapper.style.paddingBottom=this.app.getSettings().height/(2*this.app.getSettings().width)*100+"%"),this.wrapper.classList.add("--landscape")),this.update()}removeHandlers(){window.removeEventListener("resize",this.onResize),this.distElement.removeEventListener("mousedown",this.onMouseDown),this.distElement.removeEventListener("touchstart",this.onTouchStart),window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("touchmove",this.onTouchMove),window.removeEventListener("mouseup",this.onMouseUp),window.removeEventListener("touchend",this.onTouchEnd)}setHandlers(){window.addEventListener("resize",this.onResize,!1),this.app.getSettings().useMouseEvents&&(this.distElement.addEventListener("mousedown",this.onMouseDown),this.distElement.addEventListener("touchstart",this.onTouchStart),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("touchmove",this.onTouchMove,{passive:!this.app.getSettings().mobileScrollSupport}),window.addEventListener("mouseup",this.onMouseUp),window.addEventListener("touchend",this.onTouchEnd))}getMousePos(t,o){const a=this.distElement.getBoundingClientRect();return{x:t-a.left,y:o-a.top}}checkTarget(t){return!this.app.getSettings().clickEventForward||!["a","button"].includes(t.tagName.toLowerCase())}}class E extends v{constructor(t,o,a,n){super(t,o,a),this.wrapper.insertAdjacentHTML("afterbegin",'<div class="stf__block"></div>'),this.distElement=t.querySelector(".stf__block"),this.items=n;for(const i of n)this.distElement.appendChild(i);this.setHandlers()}clear(){for(const t of this.items)this.parentElement.appendChild(t)}updateItems(t){this.removeHandlers(),this.distElement.innerHTML="";for(const o of t)this.distElement.appendChild(o);this.items=t,this.setHandlers()}update(){this.app.getRender().update()}}class k extends v{constructor(t,o,a){super(t,o,a),this.wrapper.innerHTML='<canvas class="stf__canvas"></canvas>',this.canvas=t.querySelectorAll("canvas")[0],this.distElement=this.canvas,this.resizeCanvas(),this.setHandlers()}resizeCanvas(){const t=getComputedStyle(this.canvas),o=parseInt(t.getPropertyValue("width"),10),a=parseInt(t.getPropertyValue("height"),10);this.canvas.width=o,this.canvas.height=a}getCanvas(){return this.canvas}update(){this.resizeCanvas(),this.app.getRender().update()}}class y extends _{constructor(t,o,a){super(t,o),this.outerShadow=null,this.innerShadow=null,this.hardShadow=null,this.hardInnerShadow=null,this.element=a,this.createShadows()}createShadows(){this.element.insertAdjacentHTML("beforeend",`<div class="stf__outerShadow"></div>
             <div class="stf__innerShadow"></div>
             <div class="stf__hardShadow"></div>
             <div class="stf__hardInnerShadow"></div>`),this.outerShadow=this.element.querySelector(".stf__outerShadow"),this.innerShadow=this.element.querySelector(".stf__innerShadow"),this.hardShadow=this.element.querySelector(".stf__hardShadow"),this.hardInnerShadow=this.element.querySelector(".stf__hardInnerShadow")}clearShadow(){super.clearShadow(),this.outerShadow.style.cssText="display: none",this.innerShadow.style.cssText="display: none",this.hardShadow.style.cssText="display: none",this.hardInnerShadow.style.cssText="display: none"}reload(){this.element.querySelector(".stf__outerShadow")||this.createShadows()}drawHardInnerShadow(){const t=this.getRect(),o=this.shadow.progress>100?200-this.shadow.progress:this.shadow.progress;let a=(100-o)*(2.5*t.pageWidth)/100+20;a>t.pageWidth&&(a=t.pageWidth);let n=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+5).toString(10)};
            width: ${a}px;
            height: ${t.height}px;
            background: linear-gradient(to right,
                rgba(0, 0, 0, ${this.shadow.opacity*o/100}) 5%,
                rgba(0, 0, 0, 0) 100%);
            left: ${t.left+t.width/2}px;
            transform-origin: 0 0;
        `;n+=this.getDirection()===0&&this.shadow.progress>100||this.getDirection()===1&&this.shadow.progress<=100?"transform: translate3d(0, 0, 0);":"transform: translate3d(0, 0, 0) rotateY(180deg);",this.hardInnerShadow.style.cssText=n}drawHardOuterShadow(){const t=this.getRect();let o=(100-(this.shadow.progress>100?200-this.shadow.progress:this.shadow.progress))*(2.5*t.pageWidth)/100+20;o>t.pageWidth&&(o=t.pageWidth);let a=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+4).toString(10)};
            width: ${o}px;
            height: ${t.height}px;
            background: linear-gradient(to left, rgba(0, 0, 0, ${this.shadow.opacity}) 5%, rgba(0, 0, 0, 0) 100%);
            left: ${t.left+t.width/2}px;
            transform-origin: 0 0;
        `;a+=this.getDirection()===0&&this.shadow.progress>100||this.getDirection()===1&&this.shadow.progress<=100?"transform: translate3d(0, 0, 0) rotateY(180deg);":"transform: translate3d(0, 0, 0);",this.hardShadow.style.cssText=a}drawInnerShadow(){const t=this.getRect(),o=3*this.shadow.width/4,a=this.getDirection()===0?o:0,n=this.getDirection()===0?"to left":"to right",i=this.convertToGlobal(this.shadow.pos),l=this.shadow.angle+3*Math.PI/2,m=[this.pageRect.topLeft,this.pageRect.topRight,this.pageRect.bottomRight,this.pageRect.bottomLeft];let x="polygon( ";for(const P of m){let z=this.getDirection()===1?{x:-P.x+this.shadow.pos.x,y:P.y-this.shadow.pos.y}:{x:P.x-this.shadow.pos.x,y:P.y-this.shadow.pos.y};z=w.GetRotatedPoint(z,{x:a,y:100},l),x+=z.x+"px "+z.y+"px, "}x=x.slice(0,-2),x+=")";const A=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+10).toString(10)};
            width: ${o}px;
            height: ${2*t.height}px;
            background: linear-gradient(${n},
                rgba(0, 0, 0, ${this.shadow.opacity}) 5%,
                rgba(0, 0, 0, 0.05) 15%,
                rgba(0, 0, 0, ${this.shadow.opacity}) 35%,
                rgba(0, 0, 0, 0) 100%);
            transform-origin: ${a}px 100px;
            transform: translate3d(${i.x-a}px, ${i.y-100}px, 0) rotate(${l}rad);
            clip-path: ${x};
            -webkit-clip-path: ${x};
        `;this.innerShadow.style.cssText=A}drawOuterShadow(){const t=this.getRect(),o=this.convertToGlobal({x:this.shadow.pos.x,y:this.shadow.pos.y}),a=this.shadow.angle+3*Math.PI/2,n=this.getDirection()===1?this.shadow.width:0,i=this.getDirection()===0?"to right":"to left",l=[{x:0,y:0},{x:t.pageWidth,y:0},{x:t.pageWidth,y:t.height},{x:0,y:t.height}];let m="polygon( ";for(const A of l)if(A!==null){let P=this.getDirection()===1?{x:-A.x+this.shadow.pos.x,y:A.y-this.shadow.pos.y}:{x:A.x-this.shadow.pos.x,y:A.y-this.shadow.pos.y};P=w.GetRotatedPoint(P,{x:n,y:100},a),m+=P.x+"px "+P.y+"px, "}m=m.slice(0,-2),m+=")";const x=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+10).toString(10)};
            width: ${this.shadow.width}px;
            height: ${2*t.height}px;
            background: linear-gradient(${i}, rgba(0, 0, 0, ${this.shadow.opacity}), rgba(0, 0, 0, 0));
            transform-origin: ${n}px 100px;
            transform: translate3d(${o.x-n}px, ${o.y-100}px, 0) rotate(${a}rad);
            clip-path: ${m};
            -webkit-clip-path: ${m};
        `;this.outerShadow.style.cssText=x}drawLeftPage(){this.orientation!=="portrait"&&this.leftPage!==null&&(this.direction===1&&this.flippingPage!==null&&this.flippingPage.getDrawingDensity()==="hard"?(this.leftPage.getElement().style.zIndex=(this.getSettings().startZIndex+5).toString(10),this.leftPage.setHardDrawingAngle(180+this.flippingPage.getHardAngle()),this.leftPage.draw(this.flippingPage.getDrawingDensity())):this.leftPage.simpleDraw(0))}drawRightPage(){this.rightPage!==null&&(this.direction===0&&this.flippingPage!==null&&this.flippingPage.getDrawingDensity()==="hard"?(this.rightPage.getElement().style.zIndex=(this.getSettings().startZIndex+5).toString(10),this.rightPage.setHardDrawingAngle(180+this.flippingPage.getHardAngle()),this.rightPage.draw(this.flippingPage.getDrawingDensity())):this.rightPage.simpleDraw(1))}drawBottomPage(){if(this.bottomPage===null)return;const t=this.flippingPage!=null?this.flippingPage.getDrawingDensity():null;this.orientation==="portrait"&&this.direction===1||(this.bottomPage.getElement().style.zIndex=(this.getSettings().startZIndex+3).toString(10),this.bottomPage.draw(t))}drawFrame(){this.clear(),this.drawLeftPage(),this.drawRightPage(),this.drawBottomPage(),this.flippingPage!=null&&(this.flippingPage.getElement().style.zIndex=(this.getSettings().startZIndex+5).toString(10),this.flippingPage.draw()),this.shadow!=null&&this.flippingPage!==null&&(this.flippingPage.getDrawingDensity()==="soft"?(this.drawOuterShadow(),this.drawInnerShadow()):(this.drawHardOuterShadow(),this.drawHardInnerShadow()))}clear(){for(const t of this.app.getPageCollection().getPages())t!==this.leftPage&&t!==this.rightPage&&t!==this.flippingPage&&t!==this.bottomPage&&(t.getElement().style.cssText="display: none"),t.getTemporaryCopy()!==this.flippingPage&&t.hideTemporaryCopy()}update(){super.update(),this.rightPage!==null&&this.rightPage.setOrientation(1),this.leftPage!==null&&this.leftPage.setOrientation(0)}}class S{constructor(){this._default={startPage:0,size:"fixed",width:0,height:0,minWidth:0,maxWidth:0,minHeight:0,maxHeight:0,drawShadow:!0,flippingTime:1e3,usePortrait:!0,startZIndex:0,autoSize:!0,maxShadowOpacity:1,showCover:!1,mobileScrollSupport:!0,swipeDistance:30,clickEventForward:!0,useMouseEvents:!0,showPageCorners:!0,disableFlipByClick:!1}}getSettings(t){const o=this._default;if(Object.assign(o,t),o.size!=="stretch"&&o.size!=="fixed")throw new Error('Invalid size type. Available only "fixed" and "stretch" value');if(o.width<=0||o.height<=0)throw new Error("Invalid width or height");if(o.flippingTime<=0)throw new Error("Invalid flipping time");return o.size==="stretch"?(o.minWidth<=0&&(o.minWidth=100),o.maxWidth<o.minWidth&&(o.maxWidth=2e3),o.minHeight<=0&&(o.minHeight=100),o.maxHeight<o.minHeight&&(o.maxHeight=2e3)):(o.minWidth=o.width,o.maxWidth=o.width,o.minHeight=o.height,o.maxHeight=o.height),o}}(function(u,t){t===void 0&&(t={});var o=t.insertAt;if(typeof document<"u"){var a=document.head||document.getElementsByTagName("head")[0],n=document.createElement("style");n.type="text/css",o==="top"&&a.firstChild?a.insertBefore(n,a.firstChild):a.appendChild(n),n.styleSheet?n.styleSheet.cssText=u:n.appendChild(document.createTextNode(u))}})(`.stf__parent {
  position: relative;
  display: block;
  box-sizing: border-box;
  transform: translateZ(0);

  -ms-touch-action: pan-y;
  touch-action: pan-y;
}

.sft__wrapper {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.stf__parent canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.stf__block {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  perspective: 2000px;
}

.stf__item {
  display: none;
  position: absolute;
  transform-style: preserve-3d;
}

.stf__outerShadow {
  position: absolute;
  left: 0;
  top: 0;
}

.stf__innerShadow {
  position: absolute;
  left: 0;
  top: 0;
}

.stf__hardShadow {
  position: absolute;
  left: 0;
  top: 0;
}

.stf__hardInnerShadow {
  position: absolute;
  left: 0;
  top: 0;
}`),c.PageFlip=class extends class{constructor(){this.events=new Map}on(u,t){return this.events.has(u)?this.events.get(u).push(t):this.events.set(u,[t]),this}off(u){this.events.delete(u)}trigger(u,t,o=null){if(this.events.has(u))for(const a of this.events.get(u))a({data:o,object:t})}}{constructor(u,t){super(),this.isUserTouch=!1,this.isUserMove=!1,this.setting=null,this.pages=null,this.setting=new S().getSettings(t),this.block=u}destroy(){this.ui.destroy(),this.block.remove()}update(){this.render.update(),this.pages.show()}loadFromImages(u){this.ui=new k(this.block,this,this.setting);const t=this.ui.getCanvas();this.render=new T(this,this.setting,t),this.flipController=new C(this.render,this),this.pages=new b(this,this.render,u),this.pages.load(),this.render.start(),this.pages.show(this.setting.startPage),setTimeout(()=>{this.ui.update(),this.trigger("init",this,{page:this.setting.startPage,mode:this.render.getOrientation()})},1)}loadFromHTML(u){this.ui=new E(this.block,this,this.setting,u),this.render=new y(this,this.setting,this.ui.getDistElement()),this.flipController=new C(this.render,this),this.pages=new j(this,this.render,this.ui.getDistElement(),u),this.pages.load(),this.render.start(),this.pages.show(this.setting.startPage),setTimeout(()=>{this.ui.update(),this.trigger("init",this,{page:this.setting.startPage,mode:this.render.getOrientation()})},1)}updateFromImages(u){const t=this.pages.getCurrentPageIndex();this.pages.destroy(),this.pages=new b(this,this.render,u),this.pages.load(),this.pages.show(t),this.trigger("update",this,{page:t,mode:this.render.getOrientation()})}updateFromHtml(u){const t=this.pages.getCurrentPageIndex();this.pages.destroy(),this.pages=new j(this,this.render,this.ui.getDistElement(),u),this.pages.load(),this.ui.updateItems(u),this.render.reload(),this.pages.show(t),this.trigger("update",this,{page:t,mode:this.render.getOrientation()})}clear(){this.pages.destroy(),this.ui.clear()}turnToPrevPage(){this.pages.showPrev()}turnToNextPage(){this.pages.showNext()}turnToPage(u){this.pages.show(u)}flipNext(u="top"){this.flipController.flipNext(u)}flipPrev(u="top"){this.flipController.flipPrev(u)}flip(u,t="top"){this.flipController.flipToPage(u,t)}updateState(u){this.trigger("changeState",this,u)}updatePageIndex(u){this.trigger("flip",this,u)}updateOrientation(u){this.ui.setOrientationStyle(u),this.update(),this.trigger("changeOrientation",this,u)}getPageCount(){return this.pages.getPageCount()}getCurrentPageIndex(){return this.pages.getCurrentPageIndex()}getPage(u){return this.pages.getPage(u)}getRender(){return this.render}getFlipController(){return this.flipController}getOrientation(){return this.render.getOrientation()}getBoundsRect(){return this.render.getRect()}getSettings(){return this.setting}getUI(){return this.ui}getState(){return this.flipController.getState()}getPageCollection(){return this.pages}startUserTouch(u){this.mousePosition=u,this.isUserTouch=!0,this.isUserMove=!1}userMove(u,t){this.isUserTouch||t||!this.setting.showPageCorners?this.isUserTouch&&w.GetDistanceBetweenTwoPoint(this.mousePosition,u)>5&&(this.isUserMove=!0,this.flipController.fold(u)):this.flipController.showCorner(u)}userStop(u,t=!1){this.isUserTouch&&(this.isUserTouch=!1,t||(this.isUserMove?this.flipController.stopMove():this.flipController.flip(u)))}},Object.defineProperty(c,"__esModule",{value:!0})})})(De,De.exports);var Yt=De.exports;const Kt=ue.forwardRef((r,s)=>{const c=g.useRef(null),p=g.useRef([]),h=g.useRef(),[d,b]=g.useState([]);g.useImperativeHandle(s,()=>({pageFlip:()=>h.current}));const w=g.useCallback(()=>{h.current&&h.current.clear()},[]),f=g.useCallback(()=>{const j=h.current;j&&(j.off("flip"),j.off("changeOrientation"),j.off("changeState"),j.off("init"),j.off("update"))},[]);return g.useEffect(()=>{if(p.current=[],r.children){const j=ue.Children.map(r.children,N=>ue.cloneElement(N,{ref:C=>{C&&p.current.push(C)}}));(!r.renderOnlyPageLengthChange||d.length!==j.length)&&(j.length<d.length&&w(),b(j))}},[r.children]),g.useEffect(()=>{const j=()=>{const N=h.current;N&&(r.onFlip&&N.on("flip",C=>r.onFlip(C)),r.onChangeOrientation&&N.on("changeOrientation",C=>r.onChangeOrientation(C)),r.onChangeState&&N.on("changeState",C=>r.onChangeState(C)),r.onInit&&N.on("init",C=>r.onInit(C)),r.onUpdate&&N.on("update",C=>r.onUpdate(C)))};d.length>0&&p.current.length>0&&(f(),c.current&&!h.current&&(h.current=new Yt.PageFlip(c.current,r)),h.current.getFlipController()?h.current.updateFromHtml(p.current):h.current.loadFromHTML(p.current),j())},[d]),ue.createElement("div",{ref:c,className:r.className,style:r.style},d)}),Ut=ue.memo(Kt),Me=[{num:"I.",name:"CANON",desc:"who we are",subs:["The Founding Myth","GOD is DOG","The Age of the Dog","The Syncretic Clause"]},{num:"II.",name:"CREDO",desc:"what we believe",subs:["Seven Truths About Dogs","The DOG-GOD Philosophy","The Present Moment"]},{num:"III.",name:"COMMANDMENTS",desc:"how we act",subs:["The Ten Duties of a Dogyptian","The Seven Sins","The Seven Virtues","Duties to the Dog Race","Mantra of the Community","The Proud Dogyptian"]},{num:"IV.",name:"SACRAMENTS",desc:"how we pray",subs:["The Sacraments","The Prayers","Feasts & Calendar","Life Rituals"]},{num:"V.",name:"HIERARCHY",desc:"who is who",subs:["HEKTHOR I.","The Pharaoh","The Dogyptian Council","The Conscious Dog Person"]},{num:"VI.",name:"SACRED PLACES",desc:"where we gather",subs:["dogypt.com — The Virtual Temple","DOGYPT Centres","DOGYPTLAND","Local Circles"]},{num:"VII.",name:"TEXTS",desc:"what we read",subs:["The DOGYPT Constitution","The Heroglyph Manual","Cesta s Hrdinom (The Hero’s Journey)"]},{num:"VIII.",name:"LANGUAGE",desc:"how we speak",subs:["Dogyptish","The Heroglyph","Liturgical Colours","Identification","The DOGYPT Logo"]},{num:"IX.",name:"ECONOMY",desc:"how we sustain",subs:["Principles Binding From Day One","Deferred for Later Revision"]},{num:"X.",name:"INSTITUTIONS",desc:"how we govern",subs:["Layer 1 — The Movement","Layer 2 — Slovak Civic Association","Layer 3 — USA 501(c)(3) Nonprofit","Layer 4 — Church of Slovakia","Layer 5 — International Umbrella"]},{num:"XI.",name:"EXPANSION",desc:"how we grow",subs:["Phase Slovakia (2026)","Phase USA (2027)","Phase Europe (2027–2028)","Phase World (2028+)","The “Same Story” Principle"]},{num:"XII.",name:"ANTI-DOCTRINES",desc:"what we are not",subs:["Not a Cult","Not a Personality Cult","Not a Competitor to Other Faiths","Not Anti-Veterinary","Not Empty MLM","Not Vegan / Anti-Meat Ideology","Not a Political Project"]}],Te=r=>Math.max(1,...r.split(/\s+/).map(s=>s.length)),Zt=Ut,fe=.665;function Ge(){const r=typeof window<"u"?window.innerWidth:1280,s=typeof window<"u"?window.innerHeight:800,c=r<768;if(c){let w=(r-20)/2,f=w/fe;const j=s*.72;return f>j&&(f=j,w=f*fe),{w:Math.round(w),h:Math.round(f),mobile:c}}let p=Math.min(s*.7,800),h=p*fe;const d=Math.min(r*.82,1180);return 2*h>d&&(h=d/2,p=h/fe),{w:Math.round(h),h:Math.round(p),mobile:c}}const We=[Me.slice(0,6),Me.slice(6,12)];function Ve({rows:r}){const s=K(),c=p=>{const h=`religion.book.ch.${Me.indexOf(p)+1}.desc`,d=s(h);return d===h?p.desc:d};return e.jsx("ul",{className:"cb-chapters",children:r.map(p=>e.jsxs("li",{className:"cb-chapter",children:[e.jsx("span",{className:"cb-ch-num",children:p.num}),e.jsxs("span",{className:"cb-ch-text",children:[e.jsx("span",{className:"cb-ch-name",children:p.name}),e.jsx("span",{className:"cb-ch-desc",children:c(p)})]})]},p.num))})}function Jt({belowBook:r,openOnMount:s=!1}={}){const c=K(),p=g.useRef(null),[h,d]=g.useState(s),[b,w]=g.useState(0),[f,j]=g.useState(Ge);g.useEffect(()=>{h&&At()},[h]),g.useEffect(()=>{let y;const S=()=>{clearTimeout(y),y=setTimeout(()=>j(Ge()),120)},u=new ResizeObserver(S);return u.observe(document.documentElement),window.addEventListener("resize",S),S(),()=>{u.disconnect(),window.removeEventListener("resize",S),clearTimeout(y)}},[]);const N=g.useCallback(y=>w(y.data),[]),C=y=>{var u;const S=(u=p.current)==null?void 0:u.pageFlip();S&&(y==="next"?S.flipNext():S.flipPrev())},_=g.useRef(null),T=y=>{y.pointerType==="mouse"&&(y.target.closest("a,button")||(_.current={x:y.clientX,y:y.clientY,t:y.timeStamp}))},v=y=>{if(y.pointerType!=="mouse"||!_.current)return;const S=y.clientX-_.current.x,u=y.clientY-_.current.y,t=y.timeStamp-_.current.t;_.current=null,Math.abs(S)>45&&Math.abs(u)<90&&t<600&&C(S<0?"next":"prev")},E=g.useRef(null);g.useEffect(()=>{const y=E.current;if(!y)return;let S=!1;const u=t=>{Math.abs(t.deltaX)<=Math.abs(t.deltaY)||(t.preventDefault(),!(S||Math.abs(t.deltaX)<24)&&(S=!0,C(t.deltaX>0?"next":"prev"),setTimeout(()=>{S=!1},780)))};return y.addEventListener("wheel",u,{passive:!1}),()=>y.removeEventListener("wheel",u)},[]);const k=f.w*2;return e.jsxs("div",{className:`cb-wrap ${h?"cb-open":"cb-closed"}`,style:{"--cb-h":`${f.h}px`},children:[e.jsx("style",{children:qt}),e.jsxs("div",{className:"cb-stage",style:{width:k,height:f.h},children:[e.jsx("div",{className:"cb-bookwrap",ref:E,onPointerDown:T,onPointerUp:v,children:e.jsxs(Zt,{ref:p,className:"cb-book",width:f.w,height:f.h,size:"fixed",minWidth:f.w,maxWidth:f.w,minHeight:f.h,maxHeight:f.h,maxShadowOpacity:.4,drawShadow:!0,flippingTime:750,showCover:!1,usePortrait:!f.mobile,mobileScrollSupport:!1,useMouseEvents:!0,swipeDistance:18,showPageCorners:!0,clickEventForward:["a","button"],startZIndex:5,onFlip:N,children:[e.jsx("div",{className:"cb-page cb-left",children:e.jsx("div",{className:"cb-content cb-seal-page",children:e.jsx("img",{src:Ct,alt:c("religion.book.sealAlt"),className:"cb-seal-big"})})}),e.jsx("div",{className:"cb-page cb-right",children:e.jsxs("div",{className:"cb-content cb-title-page",children:[e.jsxs("h2",{className:"cb-title",style:{"--n":Math.max(Te(c("religion.book.titleThe")),Te(c("religion.book.titleConstitution")),Te(c("religion.book.titleBrand"))*1.5)},children:[e.jsx("span",{children:c("religion.book.titleThe")}),e.jsx("span",{className:"cb-title-brand",children:c("religion.book.titleBrand")}),e.jsx("span",{children:c("religion.book.titleConstitution")})]}),e.jsx("p",{className:"cb-trust",children:c("religion.book.trust")}),e.jsx("p",{className:"cb-sub",children:c("religion.book.sub")})]})}),e.jsx("div",{className:"cb-page cb-left",children:e.jsx("div",{className:"cb-content cb-index-page",children:e.jsx(Ve,{rows:We[0]})})}),e.jsx("div",{className:"cb-page cb-right",children:e.jsx("div",{className:"cb-content cb-index-page",children:e.jsx(Ve,{rows:We[1]})})}),e.jsx("div",{className:"cb-page cb-left",children:e.jsxs("div",{className:"cb-content cb-cta-page",children:[e.jsx("p",{className:"cb-cta-kicker",children:c("religion.book.cta1.kicker")}),e.jsx("h3",{className:"cb-cta-head",dangerouslySetInnerHTML:{__html:c("religion.book.cta1.head")}}),e.jsx("p",{className:"cb-cta-text",children:c("religion.book.cta1.text")}),e.jsx(se,{to:"/heroglyph/name",className:"cb-cta-btn",children:c("religion.book.cta1.btn")})]})}),e.jsx("div",{className:"cb-page cb-right",children:e.jsxs("div",{className:"cb-content cb-cta-page",children:[e.jsx("p",{className:"cb-cta-kicker",children:c("religion.book.cta2.kicker")}),e.jsx("h3",{className:"cb-cta-head",dangerouslySetInnerHTML:{__html:c("religion.book.cta2.head")}}),e.jsx("p",{className:"cb-cta-text",children:c("religion.book.cta2.text")}),e.jsx("a",{href:"https://dogma.dogypt.com",target:"_blank",rel:"noreferrer",className:"cb-cta-btn cb-cta-ghost",children:c("religion.book.cta2.btn")})]})})]},`${f.w}x${f.h}`)}),e.jsxs("button",{type:"button",className:"cb-cover-layer",onClick:()=>!h&&d(!0),"aria-label":c("religion.book.coverOpenAria"),tabIndex:h?-1:0,children:[e.jsx("span",{className:"cb-halo","aria-hidden":!0}),e.jsx("img",{src:"/images/dogma-cover.webp",alt:c("religion.book.coverAlt"),className:"cb-cover-img",style:{height:f.h,minHeight:f.h}}),e.jsx("span",{className:"cb-shimmer","aria-hidden":!0})]})]}),r,h?e.jsxs("div",{className:"cb-nav",children:[e.jsx("button",{type:"button",className:`cb-arrow ${b===0?"cb-arrow-close":""}`,onClick:()=>b===0?d(!1):C("prev"),"aria-label":c(b===0?"religion.book.close":"religion.book.prevPage"),title:c(b===0?"religion.book.close":"religion.book.prevPage"),children:"‹"}),e.jsx("button",{type:"button",className:"cb-arrow",onClick:()=>C("next"),disabled:b>=4,"aria-label":c("religion.book.nextPage"),children:"›"})]}):e.jsxs("button",{type:"button",className:"cb-hint",onClick:()=>d(!0),children:[e.jsx("span",{className:"cb-hint-dot"})," ",c("religion.book.hint")]}),f.mobile&&h&&b>=4&&e.jsxs("div",{className:"cb-mobile-cta",children:[e.jsx(se,{to:"/heroglyph/name",className:"cb-cta-btn",children:c("religion.book.cta1.btn")}),e.jsx("a",{href:"https://dogma.dogypt.com",target:"_blank",rel:"noreferrer",className:"cb-cta-btn cb-cta-ghost",children:c("religion.book.cta2.btn")})]})]})}const qt=`
.cb-wrap{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(12px,2.2vh,24px);width:100%;height:100%;}
.cb-stage{position:relative;flex:0 0 auto;max-width:100%;}

/* crossfade vrstvy */
.cb-bookwrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  opacity:0;transition:opacity .85s ease;pointer-events:none;
  /* orež prečnievanie listu pri prevracaní presne po pokojovú hranu knihy
     (page PNG má hore 7.5% / dole 8% priehľadný okraj → tam list pri curl-e vykúkal) */
  clip-path:inset(7.5% 0 8% 0);}
.cb-open .cb-bookwrap{opacity:1;pointer-events:auto;}
.cb-book{margin:0 auto;}

/* PC (2026-06-03, Matej OK): kniha −15% (scale od stredu) aby bolo nad ňou vidno nadpis
   "The Bible for dog lovers". Scale = strany aj text sa zmenšia proporčne. Mobile má vlastný
   layout. (2026-07-08: scale sa NEZVYŠUJE — „malá kniha" bol Chrome flex-img height bug,
   rieši min-height na cover img, nie zväčšenie knihy — to len naráža nadpis do knihy.) */
@media (min-width:768px){
  .cb-stage{transform:scale(0.85);}
  /* "Tap the book to open" 15px pod VIZUÁLNYM spodkom knihy (box je väčší kvôli scale →
     absolútne cez --cb-h × 0.85, inak by hint visel priďaleko). Hint = len closed stav. */
  .cb-hint{position:absolute;left:50%;top:calc(50% + (var(--cb-h) * 0.85 / 2) + 15px);transform:translateX(-50%);}
}

.cb-cover-layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:none;border:none;padding:0;cursor:pointer;z-index:6;
  opacity:1;transition:opacity .85s ease,transform .85s ease;}
.cb-closed .cb-cover-layer:hover{transform:scale(1.015);}
.cb-closed .cb-cover-layer:hover .cb-halo{animation-play-state:paused;opacity:.8;filter:blur(48px);width:88%;height:102%;
  background:radial-gradient(ellipse at center,rgba(201,154,63,.72),rgba(168,85,247,.24) 56%,rgba(168,85,247,0) 76%);}
.cb-open .cb-cover-layer{opacity:0;transform:scale(.985);pointer-events:none;}
.cb-cover-img{width:auto;max-width:100%;object-fit:contain;display:block;position:relative;z-index:1;
  filter:drop-shadow(0 10px 30px rgba(0,0,0,.55));}

/* mäkké halo (len opacity+scale pulz → bez sekania) */
.cb-halo{position:absolute;left:50%;top:50%;width:74%;height:90%;transform:translate(-50%,-50%);
  border-radius:16px;z-index:0;pointer-events:none;filter:blur(38px);opacity:.45;
  background:radial-gradient(ellipse at center,rgba(201,154,63,.55),rgba(168,85,247,.16) 56%,rgba(168,85,247,0) 74%);
  animation:cbHalo 6.5s ease-in-out infinite;
  transition:opacity .4s ease,filter .4s ease,width .4s ease,height .4s ease,background .4s ease;}
.cb-open .cb-halo{animation:none;opacity:0;transition:opacity .6s ease;}
@keyframes cbHalo{0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(1);}50%{opacity:.66;transform:translate(-50%,-50%) scale(1.04);}}

/* záblesk — svetelný pruh prejde po obálke (len transform → plynulé, maska statická) */
.cb-shimmer{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;overflow:hidden;
  -webkit-mask:url(/images/dogma-cover.webp) center/contain no-repeat;mask:url(/images/dogma-cover.webp) center/contain no-repeat;
  transition:opacity .5s ease;}
.cb-closed .cb-shimmer{opacity:1;}
.cb-shimmer::before{content:"";position:absolute;top:-25%;left:0;width:42%;height:150%;
  background:linear-gradient(105deg,rgba(255,249,224,0) 0%,rgba(255,249,224,.28) 50%,rgba(255,249,224,0) 100%);
  transform:translateX(-170%) rotate(6deg);animation:cbSweep 8s ease-in-out 1.6s infinite;}
@keyframes cbSweep{0%{transform:translateX(-170%) rotate(6deg);}40%,100%{transform:translateX(330%) rotate(6deg);}}
@media (prefers-reduced-motion:reduce){.cb-shimmer{display:none;}}

/* pages */
.cb-page{position:relative;background:transparent;overflow:hidden;}
.cb-left{background-image:url(/images/dogma-page-left.webp);background-size:100% 100%;background-repeat:no-repeat;}
.cb-right{background-image:url(/images/dogma-page-right.webp);background-size:100% 100%;background-repeat:no-repeat;}

/* ── Obsahový box = parchment safe-area (kožená väzba na vonkajšej strane).
   Tu sa ladí KDE môže text ísť. Každá strana má vlastnú page-triedu nižšie. ── */
/* Textová zóna = parchment plocha (odmeraná z PNG): väzba ~29% / chrbát ~14% /
   hore-dole ~12%. Symetrická cez chrbát. Obsah sa v nej centruje. */
.cb-content{position:absolute;inset:0;display:flex;flex-direction:column;color:#3a2204;font-family:'Cinzel',serif;}
.cb-left .cb-content{padding:12% 14% 12% 29%;}
.cb-right .cb-content{padding:12% 29% 12% 14%;}

/* ── strana 0: veľká pečať, centrovaná v zóne + nudge k chrbtu (vpravo) ── */
.cb-left .cb-seal-page{padding:11% 8% 11% 28%;transform:translateX(16px);}
.cb-seal-page{align-items:center;justify-content:center;}
.cb-seal-big{width:min(82%,210px);height:auto;opacity:.95;filter:drop-shadow(0 4px 12px rgba(90,58,12,.4));}

/* ── strana 1: nadpis + motto + body, centrované v zóne + nudge k chrbtu (vľavo) ── */
.cb-right .cb-title-page{padding:11% 28% 11% 8%;transform:translateX(-16px);}
.cb-title-page{align-items:center;justify-content:center;text-align:center;gap:5%;}
.cb-title{display:flex;flex-direction:column;gap:1px;margin:0;font-weight:700;line-height:1.1;font-size:min(clamp(15px,2.05vw,29px),calc(100cqi / (var(--n,1) * .7)));}
/* TEXT OSTÁVA V ZÓNE STRANY (16. 10. 2026, stráž check:popupy): flex s align-items:center dal
   motto a podnadpis na max-content — v ES/FR/EN siahali do ozdobného okraja strany. Riadky sa
   teraz zalomia v zóne a nadpis sa zmenší ROVNICOU zo šírky zóny (cqi) a najdlhšieho slova (--n). */
.cb-title-page{container-type:inline-size;}
.cb-title-page > *{max-width:100%;}
.cb-title em{font-style:italic;color:#9a6a16;}
.cb-title-brand{font-size:1.5em;line-height:1;color:#9a6a16;letter-spacing:.01em;}
.cb-trust{margin:0;font-size:clamp(10px,1.15vw,14px);letter-spacing:.22em;text-transform:uppercase;color:#7a531a;}
.cb-sub{margin:0;font-family:'Space Grotesk',sans-serif;font-size:clamp(8px,0.9vw,11px);color:#6b4a18;max-width:26ch;line-height:1.45;}

/* ── strany 2-4: kapitoly — širšia zóna než titulná (dlhé názvy) ── */
.cb-left .cb-index-page{padding:12% 11% 12% 22%;transform:translateX(15px);}
.cb-right .cb-index-page{padding:12% 22% 12% 11%;transform:translateX(-30px);}
.cb-index-page{align-items:center;justify-content:center;gap:6%;}
.cb-page-head{font-size:clamp(11px,1.35vw,16px);letter-spacing:.16em;text-transform:uppercase;color:#7a531a;margin:0;text-align:center;}
.cb-chapters{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:clamp(5px,1.5vh,15px);align-self:center;width:max-content;max-width:100%;}
.cb-chapter{display:flex;align-items:baseline;gap:12px;}
.cb-ch-num{flex:0 0 auto;min-width:2.4em;font-weight:700;color:#9a6a16;font-size:clamp(9px,1.05vw,13px);text-align:right;}
.cb-ch-text{display:flex;flex-direction:column;line-height:1.14;align-items:flex-start;}
.cb-ch-name{font-weight:700;letter-spacing:.05em;font-size:clamp(11px,1.2vw,15px);color:#3a2204;white-space:nowrap;}
.cb-ch-desc{font-family:'Space Grotesk',sans-serif;font-style:italic;font-size:clamp(7px,0.8vw,10px);color:#6b4a18;text-align:left;}

/* ── strana 4-5: CTA, centrované — per-page nudge k stredu väzby ── */
.cb-cta-page{align-items:center;justify-content:center;text-align:center;gap:4%;}
.cb-left .cb-cta-page{transform:translateX(25px);}
.cb-right .cb-cta-page{transform:translateX(-25px);}
.cb-cta-kicker{margin:0;font-size:clamp(7px,0.85vw,10px);letter-spacing:.22em;text-transform:uppercase;color:#9a6a16;}
.cb-cta-head{margin:0;font-weight:700;line-height:1.05;font-size:clamp(14px,2vw,25px);color:#3a2204;}
.cb-cta-text{margin:0;font-family:'Space Grotesk',sans-serif;font-size:clamp(8px,0.9vw,11px);color:#6b4a18;max-width:22ch;line-height:1.45;}
.cb-cta-btn{margin-top:3%;display:inline-block;padding:.62em 1.5em;border-radius:8px;font-family:'Cinzel',serif;font-weight:700;font-size:clamp(9px,1.05vw,13px);letter-spacing:.04em;text-decoration:none;color:#2a1a06;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,.30);box-shadow:0 4px 14px rgba(90,58,12,.35);transition:transform .18s ease,box-shadow .18s ease;}
.cb-cta-btn:hover{transform:translateY(-2px);box-shadow:0 7px 20px rgba(90,58,12,.45);}
.cb-cta-link{font-family:'Cinzel',serif;font-size:clamp(10px,1.1vw,13px);letter-spacing:.06em;text-transform:uppercase;color:#7a531a;text-decoration:none;border-bottom:1px solid rgba(122,83,26,.4);padding-bottom:1px;transition:color .18s ease,border-color .18s ease;}
.cb-cta-link:hover{color:#9a6a16;border-color:rgba(154,106,22,.7);}

/* hint — zväčšený + jemný kontrastný podklad (2026-07-08, Matej OK), nech nezanikne vedľa cow/hektor scény */
.cb-hint{display:inline-flex;align-items:center;gap:9px;background:rgba(0,0,0,.32);border:1px solid rgba(201,154,63,.28);
  border-radius:20px;cursor:pointer;
  font-family:'Cinzel',serif;font-size:clamp(13px,1.6vw,17px);letter-spacing:.13em;text-transform:uppercase;
  color:#C99A3F;padding:8px 18px;animation:cbHint 2.6s ease-in-out infinite;}
.cb-hint-dot{width:7px;height:7px;border-radius:50%;background:#C99A3F;box-shadow:0 0 10px rgba(201,154,63,.7);}
@keyframes cbHint{0%,100%{opacity:.55;}50%{opacity:1;}}

/* nav */
.cb-nav{display:flex;gap:18px;}
.cb-arrow{width:42px;height:42px;border-radius:50%;border:1px solid rgba(201,154,63,.45);background:rgba(201,154,63,.06);
  color:#C99A3F;font-size:22px;line-height:1;cursor:pointer;transition:background .18s ease,transform .18s ease;}
.cb-arrow:hover:not(:disabled){background:rgba(201,154,63,.16);transform:translateY(-1px);}
.cb-arrow:disabled{opacity:.3;cursor:default;}
.cb-arrow-close{font-size:15px;}

@media (prefers-reduced-motion:reduce){
  .cb-halo,.cb-hint{animation:none;}
}
@media (max-width:767px){
  .cb-left .cb-content{padding:12% 10% 12% 17%;}
  .cb-right .cb-content{padding:12% 17% 12% 10%;}
  /* Mobile (2026-06-03): KNIHA fixne na rovnakej úrovni v OBOCH stavoch (closed == open) a nemenná.
     Trik: .cb-stage = jediný prvok vo flow (centrovaný) + fixný translateY; šípky/hint/CTA sú
     position:absolute (mimo flow) → nikdy neposunú knihu. --cb-h = výška knihy (inline z JS). */
  .cb-wrap{position:relative;}
  .cb-stage{transform:translateY(-60px);}
  .cb-hint{position:absolute;left:50%;top:calc(50% - 60px + var(--cb-h)/2 + 12px);transform:translateX(-50%);}
  /* Mobile (2026-06-03): TITLE strana — nadpis −15% −10% (20px → 15.3px) */
  .cb-title{font-size:min(15.3px,calc(100cqi / (var(--n,1) * .7)));}
  /* Mobile (2026-06-03): 2. dvojstrana (kapitoly) — obsah −15% −10% (scale 0.765) */
  .cb-chapters{transform:scale(0.765);}
  /* Mobile (2026-06-03): 3. dvojstrana (CTA) — obsah −15% (translateX nudge zachovaný) */
  .cb-left .cb-cta-page{transform:translateX(25px) scale(0.85);}
  .cb-right .cb-cta-page{transform:translateX(-25px) scale(0.85);}
  /* Mobile (2026-06-03): ľavý CTA body do 2 riadkov (menší font, plná šírka strany) */
  .cb-left .cb-cta-text{font-size:9px;max-width:none;}
  /* Mobile (2026-06-03): CTA tlačidlá — menšie (font+padding) ale zvýraznené (zlatý glow),
     posun do vonkajšej strany (ľavé doľava, pravé doprava ~5px po scale 0.85) */
  .cb-cta-btn{padding:.5em 10px;font-size:10px;
    border-color:rgba(250,244,236,.55);
    box-shadow:0 3px 10px rgba(90,58,12,.4),0 0 14px rgba(245,199,61,.5);}
  .cb-left .cb-cta-btn{transform:translateX(-6px);}
  .cb-right .cb-cta-btn{transform:translateX(6px);}
  /* Mobile (2026-06-03): posledná dvojstrana (CTA) — nadpis −10% (18.7px → 16.83px) */
  .cb-cta-head{font-size:16.83px;}
  /* Mobile (2026-06-03): šípky NAD knihou, 20px medzera, absolútne (nehýbu knihou) */
  .cb-nav{position:absolute;left:50%;top:calc(50% - 60px - var(--cb-h)/2 - 20px);transform:translate(-50%,-100%);margin:0;}
  /* Mobile (2026-06-03): in-page CTA tlačidlá skryté — vytiahnuté pod knihu (JSX .cb-mobile-cta) */
  .cb-cta-page .cb-cta-btn{display:none;}
  .cb-mobile-cta{position:absolute;left:50%;top:calc(50% - 60px + var(--cb-h)/2 + 16px);transform:translateX(-50%);
    display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;padding:0 16px;box-sizing:border-box;}
  .cb-mobile-cta .cb-cta-btn{display:inline-block;transform:none;width:100%;max-width:260px;text-align:center;
    font-size:14px;padding:.8em 2em;
    box-shadow:0 4px 14px rgba(90,58,12,.4),0 0 16px rgba(245,199,61,.5);}
}
`,Xt={cow:{cx:450,cy:168,rx:166,ry:34,tilt:7},hektor:{cx:590,cy:330,rx:150,ry:31,tilt:-6}},ve={glow:"#C99A3F",mid:"#E8B24A",core:"#F7DFA0",hot:"#FFF0C8"};function Ye({who:r}){const s=Xt[r],c={x:"-40%",y:"-160%",width:"180%",height:"420%"},p=h=>`codex-halo-${r}-${h}`;return e.jsxs("svg",{className:`codex-${r} codex-halo codex-halo-${r}`,viewBox:"0 0 960 1080",preserveAspectRatio:r==="cow"?"xMinYMax meet":"xMaxYMax meet","aria-hidden":!0,focusable:"false",children:[e.jsxs("defs",{children:[e.jsx("filter",{id:p("soft"),...c,children:e.jsx("feGaussianBlur",{stdDeviation:"20"})}),e.jsx("filter",{id:p("mid"),...c,children:e.jsx("feGaussianBlur",{stdDeviation:"7"})}),e.jsx("filter",{id:p("core"),...c,children:e.jsx("feGaussianBlur",{stdDeviation:"1.6"})})]}),e.jsx("g",{transform:`translate(${s.cx} ${s.cy}) rotate(${s.tilt})`,children:e.jsxs("g",{className:"codex-halo-scale",children:[e.jsx("ellipse",{rx:s.rx,ry:s.ry,fill:"none",stroke:ve.glow,strokeWidth:"42",opacity:"0.58",filter:`url(#${p("soft")})`}),e.jsx("ellipse",{rx:s.rx,ry:s.ry,fill:"none",stroke:ve.mid,strokeWidth:"17",opacity:"0.9",filter:`url(#${p("mid")})`}),e.jsx("ellipse",{rx:s.rx,ry:s.ry,fill:"none",stroke:ve.core,strokeWidth:"5.5",filter:`url(#${p("core")})`}),e.jsx("ellipse",{rx:s.rx,ry:s.ry,fill:"none",stroke:ve.hot,strokeWidth:"2"})]})})]})}const Qt=g.lazy(()=>gt(()=>import("./HektorBook-CvFDVaRG.js"),__vite__mapDeps([0,1,2,3,4]))),Ke="/images/codex3-hektor-v1.webp",Ue={x:652,y:792},he=3,eo="codex-spot-glow",_e="codex-spot-grad",Ze=100,to=`
/* Obal má rovnaký rám ako .codex-bleed (v ňom bývajú obe zvieratá), ale leží
   NAD obsahom filmu — inak sa na bodku nedá kliknúť. Priepustný pre myš je
   celý; citlivý je len terč okolo bodky. */
.codex-flow .codex-spotlayer {
  /* Geometria je ZHODNÁ s .codex-flow .codex-bleed a musí ňou ostať — je to
     druhý rám tých istých zvierat. Sticky (nie absolute) preto, že vo filme sa
     scrolluje a absolútnemu rámu by spodná hrana odscrollovala do obrazu;
     záporný spodný okraj mu ruší miesto v toku.
     ⚠️ position sa opakuje aj kvôli tomu, že .lab-papyrus > * z vízie a príbehu
     prebíja slabšie selektory — rovnaký dôvod, aký má pri sebe zapísaný bleed.
     z-index 6 je jediný rozdiel: vrstva leží NAD obsahom filmu, inak sa na
     bodku nedá kliknúť. */
  position: sticky;
  top: 0;
  left: 0;
  height: 100dvh;
  margin-bottom: -100dvh;
  pointer-events: none;
  z-index: 6;
}
/* Lesk prejde po psovi raz za ~9.5 s. Pomalšie a slabšie než na obálke knihy:
   Hektor je na obrazovke oveľa väčší, takže rovnaký čas pôsobí rýchlejšie. */
.codex-shine {
  opacity: var(--op-spot, 0);
  pointer-events: none;
  z-index: 2;
  -webkit-mask: url(${Ke}) bottom right / contain no-repeat;
  mask: url(${Ke}) bottom right / contain no-repeat;
  transition: opacity 700ms ease 320ms;
}
/* Maska = fotka 78 kB; vo filme sa ťahá až po guli (filmDefer.ts). */
html:not(.film-next):not(.film-eager) .op-root .codex-shine { -webkit-mask: none; mask: none; opacity: 0; }
.codex-shine::before {
  content: '';
  position: absolute;
  top: -25%;
  left: 0;
  width: 58%;
  height: 150%;
  /* 🔴 SMER GRADIENTU MUSÍ BYŤ CEZ ŠÍRKU PRUHU, NIE 105deg. Kniha má obálku
     takmer štvorcovú, takže jej 105deg vyzerá ako lesk. Tu je pruh 58 % šírky
     a 150 % výšky psa, čiže vysoký a úzky — pri 105deg vedie os gradientu
     takmer zvisle, prechod sa minie na výšku a po šírke ostane plocha bez
     zmeny. Odmerané: cez psa prešiel priehľadný obdĺžnik s ostrými zvislými
     hranami, nie svetlo. Sklon drží rotate() na transforme, nie uhol gradientu. */
  background: linear-gradient(to right, rgba(255,249,224,0) 0%, rgba(255,249,224,0.22) 50%, rgba(255,249,224,0) 100%);
  transform: translateX(-170%) rotate(6deg);
  animation: codexShineSweep 9.5s ease-in-out 1.2s infinite;
  will-change: transform;
}
@keyframes codexShineSweep {
  0% { transform: translateX(-170%) rotate(6deg); }
  40%, 100% { transform: translateX(330%) rotate(6deg); }
}

/* Bodka. Vrstva je priepustná pre myš, citlivý je len terč okolo bodky —
   inak by neviditeľný obdĺžnik cez pol obrazovky zožral kliky na CTA. */
.codex-spot {
  opacity: var(--op-spot, 0);
  pointer-events: none;
  z-index: 3;
  transition: opacity 700ms ease 480ms;
}
.codex-spot-hit { pointer-events: auto; cursor: pointer; }
.codex-spot-pulse {
  animation: codexSpotPulse 3.1s ease-in-out infinite;
  /* fill-box, inak by percentuálny stred rátal z celého viewBoxu fotky. */
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes codexSpotPulse {
  0%, 100% { opacity: 0.55; transform: scale(0.92); }
  50%      { opacity: 1;    transform: scale(1.12); }
}
/* PING — prstenec, ktorý sa rozbieha a zaniká. Samotné dýchanie bodky Matej
   prehliadol (*„urob mu aj pulz lebo som si to ani nevšimol"*): zmena krytia
   na jednom kruhu je pohyb, ktorý oko periférne nezachytí, rozbiehajúci sa
   kruh áno. */
.codex-spot-ping {
  transform-box: fill-box;
  transform-origin: center;
  animation: codexSpotPing 2.6s cubic-bezier(0.16, 0.7, 0.3, 1) infinite;
}
@keyframes codexSpotPing {
  0%   { transform: scale(0.6); opacity: 0; }
  18%  { opacity: 0.75; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* ── ZÁBLESK: LESK NEODÍDE, KÝM NEROZSVIETI BODKU ─────────────────────────
   Matej 28. 8.: *„posledný pulz ktorý by mal ísť už preč — tak osvieti ten
   hotspot a až potom pôjde ďalej, lebo mám pocit že sa to dá prehliadnuť
   a preletieť."* Bodka teda nesvieti vlastným tempom vedľa lesku — rozžiari
   sa presne vtedy, keď cez ňu pruh prechádza.

   🔑 FÁZA SA POČÍTA, NEHÁDA. Obe animácie majú rovnakú dĺžku aj odklad, takže
   držia krok navždy. Pruh je 58 % šírky rámu a jeho stred prejde od -501 do
   1587 px (rám 720 px) počas prvých 40 % cyklu; bodka leží na 652/960 fotky,
   teda na 489 px rámu ⇒ pruh je nad ňou po (489 + 501) / 2088 = 47 % svojej
   dráhy, čiže v 19 % cyklu. Preto je vrchol zábleskul práve tam.
   ⚠️ Kto zmení SPOT.x, šírku pruhu alebo dĺžku sweepu, prepočíta aj toto. */
.codex-spot-flare {
  transform-box: fill-box;
  transform-origin: center;
  animation: codexSpotFlare 9.5s ease-in-out 1.2s infinite;
}
@keyframes codexSpotFlare {
  0%, 12%   { opacity: 0;   transform: scale(0.8); }
  19%       { opacity: 0.9; transform: scale(1.35); }
  30%, 100% { opacity: 0;   transform: scale(1.6); }
}
/* Prehliadač kreslí okolo <circle> s tabindex pravouhlý modrý rám — na
   fotke psa vyzerá ako chyba. Vypína sa pre KAŽDÝ fokus (aj myšou), ale
   klávesnica dostane vlastný prstenec v našej farbe. */
.codex-spot-hit:focus { outline: none; }
.codex-spot-hit:focus-visible + .codex-spot-ring { opacity: 0.85; }


@media (prefers-reduced-motion: reduce) {
  .codex-shine::before { display: none; }
  .codex-spot-pulse { animation: none; opacity: 0.9; }
  .codex-spot-ping, .codex-spot-flare { display: none; }
}
`;function oo(){const r=K(),[s,c]=g.useState(!1),p=g.useCallback(()=>c(!0),[]),h=g.useCallback(()=>c(!1),[]),d=r("religion.spot.hint");return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"codex-hektor codex-shine","aria-hidden":!0}),e.jsxs("svg",{className:"codex-hektor codex-spot",viewBox:"0 0 960 1080",preserveAspectRatio:"xMaxYMax meet",focusable:"false",children:[e.jsxs("defs",{children:[e.jsx("filter",{id:eo,x:"-120%",y:"-120%",width:"340%",height:"340%",children:e.jsx("feGaussianBlur",{stdDeviation:10*he})}),e.jsxs("radialGradient",{id:_e,children:[e.jsx("stop",{offset:"0%",stopColor:"#FFF6E2",stopOpacity:"0.50"}),e.jsx("stop",{offset:"42%",stopColor:"#FFE9BE",stopOpacity:"0.20"}),e.jsx("stop",{offset:"100%",stopColor:"#FFE9BE",stopOpacity:"0"})]})]}),e.jsxs("g",{transform:`translate(${Ue.x} ${Ue.y})`,children:[e.jsxs("g",{className:"codex-spot-pulse",children:[e.jsx("circle",{r:46*he,fill:`url(#${_e})`}),e.jsx("circle",{r:8.5*he,fill:"#FFF6E2"})]}),e.jsx("circle",{className:"codex-spot-ping",r:19*he,fill:"none",stroke:"rgba(255,240,205,0.7)",strokeWidth:2.5*he}),e.jsx("circle",{className:"codex-spot-flare",r:34*he,fill:`url(#${_e})`}),e.jsx("circle",{className:"codex-spot-hit",r:Ze,fill:"transparent",role:"button",tabIndex:0,"aria-label":d,onClick:p,onKeyDown:b=>{b.key!=="Enter"&&b.key!==" "||(b.preventDefault(),p())},children:e.jsx("title",{children:d})}),e.jsx("circle",{className:"codex-spot-ring",r:Ze-8,fill:"none",stroke:"#FFF3D6",strokeWidth:"3",opacity:"0"})]})]}),s&&e.jsx(g.Suspense,{fallback:null,children:e.jsx(Qt,{onClose:h})})]})}let ht=!1;const ze=new Set;function ao(){return{loading:"lazy","data-film-defer":""}}function io(){const[r,s]=g.useState(ht);return g.useEffect(()=>{const c=()=>s(!0);return ze.add(c),()=>{ze.delete(c)}},[]),r}const Je=new Set;function no(){const[r,s]=g.useState(ht);return g.useEffect(()=>{const c=()=>s(!0);return Je.add(c),ze.add(c),()=>{Je.delete(c),ze.delete(c)}},[]),r}const ro=!1;function so(r,s){const c=[];let p=s;for(const[h,d]of r.split("**").entries()){const b=h%2===1;for(const w of d)c.push(e.jsx("span",{className:b?"v2-ch v2-gold":"v2-ch",style:{"--i":p},children:w},p)),p+=1}return{nodes:c,next:p}}function lo({embedded:r=!1,flow:s=!1,onOpenBook:c,onChipNext:p,onChipBook:h}={}){const d=K(),b=no(),w=!r||b,[f,j]=g.useState(0),[N,C]=g.useState(()=>new Set),_=g.useRef(null),T=g.useRef([]);g.useEffect(()=>{const t=s?null:_.current;if(!s&&!t)return;const o=T.current.filter(Boolean),a=new IntersectionObserver(i=>{for(const l of i){if(!l.isIntersecting)continue;const m=Number(l.target.dataset.idx);C(x=>x.has(m)?x:new Set(x).add(m)),!s&&l.intersectionRatio>=.55&&j(m)}},s?{root:null,threshold:0,rootMargin:"-15% 0px -15% 0px"}:{root:t,threshold:[.55]});o.forEach(i=>a.observe(i));let n=null;return s&&(n=new IntersectionObserver(i=>{for(const l of i)l.isIntersecting&&j(Number(l.target.dataset.idx))},{root:null,threshold:0,rootMargin:"-45% 0px -45% 0px"}),o.forEach(i=>n.observe(i))),()=>{a.disconnect(),n==null||n.disconnect()}},[s]),g.useEffect(()=>{if(!s)return;const t=T.current.filter(Boolean);if(!t.length)return;const o=x=>Array.from(x.querySelectorAll(":scope > .codex-slider > .codex-slide > *")).some(A=>(parseFloat(getComputedStyle(A).opacity)||0)>.01);let a=0;const n=()=>{a=0;for(const x of t)x.style.pointerEvents=o(x)?"":"none"};let i=0,l=0;const m=()=>{if(a||i)return;const x=Math.max(0,150-(performance.now()-l));i=window.setTimeout(()=>{i=0,l=performance.now(),a=requestAnimationFrame(n)},x)};return n(),window.addEventListener("scroll",m,{passive:!0}),window.addEventListener("resize",m),()=>{a&&cancelAnimationFrame(a),i&&clearTimeout(i),window.removeEventListener("scroll",m),window.removeEventListener("resize",m);for(const x of t)x.style.pointerEvents=""}},[s]);const v=t=>{var o;(o=T.current[t])==null||o.scrollIntoView({behavior:"smooth"})},[E,k]=g.useState(1);g.useEffect(()=>{},[]);const y=(()=>{const t=["religion.v2.l1","religion.v2.l2","religion.v2.l3","religion.v2.l4"];let o=0;return{lines:t.map(n=>{const i=so(d(n),o);return o=i.next,o+=4,i.nodes}),total:o}})(),S=y.total,u=e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"codex-v2",children:y.lines.slice(0,3).map((t,o)=>e.jsx("span",{className:"v2-line",children:t},o))}),e.jsxs("div",{className:"codex-cta-cluster codex-v2-cta",children:[e.jsx("p",{className:"codex-v2-close",children:e.jsx("span",{className:"v2-line",children:y.lines[3]})}),e.jsx(se,{to:"/heroglyph/name",className:"codex-cta",children:d("religion.cta")})]})]});return e.jsxs("div",{className:`lab-papyrus codex-page flex flex-col relative ${s?"codex-flow h-auto":`overflow-hidden ${r?"h-full":"h-[100dvh]"}`}`,children:[!r&&e.jsx(Fe,{path:"/religion-lab",title:"Dogyptism — The Dog Religion | DOGYPT",description:"Dogyptism: a syncretic faith where every dog is sacred. Read the constitution — five layers, twelve chapters. In Dog We Trust."}),e.jsx("div",{"aria-hidden":!0,style:{position:"absolute",inset:0,background:W.pageVeil,zIndex:0,pointerEvents:"none"}}),e.jsxs("div",{className:`codex-bleed ${f===0?"active":""}`,style:{"--halo-delay":`${E===1?2700:S*18+500}ms`},"aria-hidden":!0,children:[e.jsx(Ye,{who:"cow"}),e.jsx("img",{src:w?"/images/codex3-cow-nohalo.webp":void 0,alt:"",className:"codex-cow"}),e.jsx(Ye,{who:"hektor"}),e.jsx("img",{src:w?"/images/codex3-hektor-v1.webp":void 0,alt:"",className:"codex-hektor"})]}),s&&e.jsx("div",{className:"codex-spotlayer",children:e.jsx(oo,{})}),e.jsx("style",{children:`
        /* ── LAB: papyrusový podklad (tokeny = @/lib/labTheme, zhodné s WALL LABom).
           position:fixed na podklade je zámer prevzatý z .dark-bg::before —
           tabuľa sa drží OKNA, nie výšky obsahu.
           (Bez spätných apostrofov: celý blok je JS template literal.) */
        .lab-papyrus { position: relative; background-color: ${W.pageBg}; }
        .lab-papyrus::before {
          content: '';
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100lvh;
          background: ${W.pageBackdrop};
          z-index: 0;
          pointer-events: none;
        }
        .lab-papyrus > * { position: relative; z-index: 1; }

        /* Vertikálny scroll-snap kontajner — klasický scroll, fix obrazovka per sekcia.
           Stránka ostáva 100dvh + overflow-hidden → pozadie sa NEzväčšuje; scrolluje len toto. */
        .codex-scroll {
          flex: 1 1 auto;
          min-height: 0;
          width: 100%;
          overflow-y: scroll;
          overflow-x: hidden;
          /* Bez scroll-anchoringu — keď sa na 3. dvojstrane zjavia CTA tlačidlá pod knihou,
             zmena výšky obsahu nesmie skokom presunúť scroll (predtým „vrátilo na hero"). */
          overflow-anchor: none;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          position: relative;
          z-index: 2;
        }
        .codex-scroll::-webkit-scrollbar { display: none; }
        .codex-section {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          position: relative;
        }
        .codex-slider {
          position: relative;
          width: 100%;
          max-width: 880px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          padding: 0 clamp(12px, 2vw, 24px);
        }
        .codex-slide {
          flex: 0 0 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(20px, 3vh, 40px) clamp(8px, 2vw, 24px);
          text-align: center;
        }
        .codex-slider .codex-slide > * + * {
          margin-top: clamp(28px, 4.5vh, 48px);
        }
        /* Sacred Index slide = Constitution kniha (flipbook) → širší priestor, menší padding */
        .codex-slider-book { max-width: 1120px; }
        .codex-slider-book .codex-slide { padding: clamp(8px, 1.6vh, 18px) clamp(6px, 1.5vw, 16px); }
        /* Nadpis nad knihou (2026-06-03, PC + mobile) — absolútne hore v sekcii, mimo
           layout knihy → knihu neposúva. */
        .codex-book-title {
          position: absolute;
          top: clamp(12px, 3vh, 34px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 7;
          margin: 0;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1rem, 2.28vw, 1.8rem);
          /* headroom pre diakritiku (Biblia/Bible/psíčkarov) — background-clip:text inak oseká accent */
          line-height: 1.18; padding-top: 0.14em;
          letter-spacing: 0.05em;
          text-align: center;
          white-space: nowrap;
          pointer-events: none;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        @media (max-width: 767px) {
          .codex-book-title { top: 14px; font-size: 1.05rem; letter-spacing: 0.04em; }
        }

        /* ── Scroll-reveal animácie (rešpektuje prefers-reduced-motion) ──
           Pokojový stav = identity transform → locked layout zostáva nedotknutý. */
        @media (prefers-reduced-motion: no-preference) {
          .codex-section .codex-slide:not(.codex-slide-3) {
            opacity: 0;
            transform: translateY(34px);
            transition: opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
                        transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: opacity, transform;
          }
          .codex-section.in-view .codex-slide:not(.codex-slide-3) {
            opacity: 1;
            transform: none;
          }
          /* Hero (cow vs dog): staggered reveal jednotlivých riadkov overlayu */
          .codex-3-overlay > * {
            opacity: 0;
            transform: translateY(26px);
            transition: opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
                        transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: opacity, transform;
          }
          .codex-section.in-view .codex-3-overlay > * { opacity: 1; transform: none; }
          /* Rytmus je dramaturgia, nie ozdoba (Matej 27. 8. 2026: „nech je to
             zaujímavejšie = postupné odhaľovanie/čítanie textu"). Odstupy kopírujú
             stavbu argumentu, nie rovnomerný stagger:
               1–2 krava · 3–4 pes (pauza pred druhou stranou)
               5 obvinenie (najväčšia pauza — má doraziť do ticha) · 6 CTA
             ⚠️ Vo filme (/onepage) TOTO NEPLATÍ: tam odhaľovanie riadi scroll cez
             --op-txt, viď .codex-flow nižšie. Dva časovače na tom istom texte by
             sa bili. */
          /* VARIANT 1 — štyri bloky: krava · pes · YET. · CTA.
             Pauza pred „YET." je najväčšia zámerne — obrat má doraziť do ticha,
             nie v rade s faktami. CTA ide až za ním. */
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(1) { transition-delay: 80ms; }
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(2) { transition-delay: 520ms; }
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(3) { transition-delay: 1180ms; }
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(4) { transition-delay: 1760ms; }
          /* Variant 2 (odsek, ktorý sa píše) má dva bloky a vlastné tempo — jeho
             odstupy sa zmenou variantu 1 nesmú pohnúť. */
          .codex-section.in-view .codex-3-overlay.is-v2 > *:nth-child(1) { transition-delay: 80ms; }
          .codex-section.in-view .codex-3-overlay.is-v2 > *:nth-child(2) { transition-delay: 300ms; }
        }

        /* Landscape-short fallback: dark-bg ide na height:auto (index.css) → necháme
           prirodzený scroll bez snapu, aby sa obsah dal prečítať. */
        @media (orientation: landscape) and (max-height: 600px) {
          .codex-scroll { overflow: visible; height: auto; scroll-snap-type: none; }
          .codex-section { height: auto; min-height: 100dvh; }
        }

        /* ── Slide 1 ── */
        /* 🔒🔒 LOCK PC HARD (2026-05-24): Slide 1 PC HOTOVÝ. NEDOTÝKAŤ SA.
           Default = MOBILE only (@media max-width:767px).
           PC úpravy LEN na explicit "na PC" / "zruš lock". */
        .codex-headline {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.71rem, 6.5vw, 5.05rem);
          letter-spacing: 0.04em;
          line-height: 1.02;
          margin: 0;
          text-transform: uppercase;
          color: rgba(35,22,8,0.90);
        }
        .codex-headline .grad {
          display: block;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: none;
        }
        .codex-headline .line {
          display: block;
        }
        .codex-preamble-wrap {
          position: relative;
          width: 100%;
          max-width: 820px;
          padding: clamp(26px, 3.6vh, 44px) clamp(34px, 5vw, 60px);
        }
        /* Sacred frame — 4 double-line L corners + diamond accent */
        .codex-frame {
          position: absolute;
          width: clamp(32px, 4.6vw, 48px);
          height: clamp(32px, 4.6vw, 48px);
          pointer-events: none;
          filter: drop-shadow(0 1px 2px rgba(110,71,16,0.22));
        }
        .codex-frame.tl { top: 0; left: 0;
          border-top: 1.5px solid #C99A3F; border-left: 1.5px solid #C99A3F;
        }
        .codex-frame.tr { top: 0; right: 0;
          border-top: 1.5px solid #C99A3F; border-right: 1.5px solid #C99A3F;
        }
        .codex-frame.bl { bottom: 0; left: 0;
          border-bottom: 1.5px solid #C99A3F; border-left: 1.5px solid #C99A3F;
        }
        .codex-frame.br { bottom: 0; right: 0;
          border-bottom: 1.5px solid #C99A3F; border-right: 1.5px solid #C99A3F;
        }
        /* inner offset L — second parallel line */
        .codex-frame::before {
          content: '';
          position: absolute;
          width: calc(100% - 12px);
          height: calc(100% - 12px);
          border-style: solid;
          border-color: rgba(201,154,63,0.72);
          border-width: 0;
        }
        .codex-frame.tl::before { top: 5px; left: 5px;
          border-top-width: 1px; border-left-width: 1px;
        }
        .codex-frame.tr::before { top: 5px; right: 5px;
          border-top-width: 1px; border-right-width: 1px;
        }
        .codex-frame.bl::before { bottom: 5px; left: 5px;
          border-bottom-width: 1px; border-left-width: 1px;
        }
        .codex-frame.br::before { bottom: 5px; right: 5px;
          border-bottom-width: 1px; border-right-width: 1px;
        }
        /* outer diamond accent at the corner vertex */
        .codex-frame::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: #A3782B;
          transform: rotate(45deg);
          box-shadow: 0 1px 3px rgba(110,71,16,0.35);
        }
        .codex-frame.tl::after { top: -3.5px; left: -3.5px; }
        .codex-frame.tr::after { top: -3.5px; right: -3.5px; }
        .codex-frame.bl::after { bottom: -3.5px; left: -3.5px; }
        .codex-frame.br::after { bottom: -3.5px; right: -3.5px; }
        @media (max-width: 767px) {
          /* Mobile (2026-06-03): zúžiť rámik znenia ústavy */
          .codex-preamble-wrap { padding: 18px 20px; max-width: 320px; margin: 0 auto; }
          .codex-frame { width: 24px; height: 24px; }
          .codex-frame::before { width: calc(100% - 10px); height: calc(100% - 10px); }
          .codex-frame.tl::before { top: 4px; left: 4px; }
          .codex-frame.tr::before { top: 4px; right: 4px; }
          .codex-frame.bl::before { bottom: 4px; left: 4px; }
          .codex-frame.br::before { bottom: 4px; right: 4px; }
        }
        .codex-preamble-text {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(1.09rem, 1.66vw, 1.47rem);
          line-height: 1.55;
          letter-spacing: 0.02em;
          color: rgba(35,22,8,0.82);
          margin: 0;
          text-wrap: balance;
        }
        .codex-preamble-text strong {
          font-weight: 700;
          font-style: italic;
          color: #8a5a14;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: none;
        }
        .codex-oath-label {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.59rem, 0.9vw, 0.72rem);
          letter-spacing: 0.36em;
          color: rgba(201,154,63,0.7);
          text-transform: uppercase;
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: clamp(10px, 1.6vw, 16px);
        }
        .codex-oath-label::before,
        .codex-oath-label::after {
          content: '';
          height: 1px;
          width: clamp(22px, 3.4vw, 40px);
          background: rgba(201,154,63,0.5);
        }
        .codex-slider .codex-slide > .codex-oath-label {
          margin-top: clamp(14px, 2vh, 22px);
        }
        /* ── RIADOK NAD MOTTOM (len režim filmu) ─────────────────────────
           Vzor je .religion-eyebrow z pages/Entry.tsx: Space Grotesk 500,
           veľké písmená, široké preloženie. Zámerne NIE Cinzel — Cinzel je
           v tejto sekcii identita (motto, prísaha) a keby ho mala aj táto veta,
           čítala by sa ako ďalší nadpis, nie ako poznámka o čitateľovi.
           ⚠️ Space Grotesk je načítaný len vo váhach 300–600; 700 by bol
           falošný tučný (pravidlo v CLAUDE.md). */
        .codex-eyebrow {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-weight: 500;
          font-size: clamp(0.62rem, 0.86vw, 0.78rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(122,90,42,0.78);
          margin: 0;
          /* JEDEN RIADOK (Matej 28. 8. 2026: „v jednom riadku a čo najkratší").
             nowrap je tu poistka, nie náhrada za krátky text — keby veta
             narástla, radšej nech pretečie viditeľne, než aby sa ticho zalomila
             a rozbila rytmus troch prvkov nad sebou. */
          white-space: nowrap;
          line-height: 1.4;
          /* ODDELENÝ HORIZONTÁLKOU (to isté zadanie). Čiara je ::after, nie
             samostatný prvok: patrí k riadku, takže s ním má aj nabiehať —
             ako vlastný súrodenec by potrebovala vlastnú premennú a rozišla by
             sa s ním pri prvom ladení. Vybledá do strán rovnako ako .codex-rule
             na papyruse, aby nekončila ostrým rezom. */
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(9px, 1.5vh, 14px);
        }
        .codex-eyebrow::after {
          content: '';
          display: block;
          width: clamp(58px, 8vw, 104px);
          height: 1px;
          background: linear-gradient(90deg,
            rgba(201,154,63,0) 0%, rgba(201,154,63,0.72) 50%, rgba(201,154,63,0) 100%);
        }
        @media (max-width: 767px) {
          .codex-eyebrow { font-size: 0.58rem; letter-spacing: 0.16em; }
        }
        /* ── CTA JE LAPIS, NIE ZLATÉ ──────────────────────────────────────
           Matej 28. 8. 2026: *„CTA má byť v lapise (náš nový brand — poznač si
           to už)."* Tým sa zrušil dovtedajší hold z 26. 8. („zatiaľ to
           nezapisuj") a lapis prešiel z pracovného návrhu do kánonu.
           Farby sa NEOPISUJÚ — sú v LAPIS v navGoldSkin.ts.
           Zlaté písmo na modrom nie je ozdoba: lapis + zlato je pôvodná
           egyptská dvojica a bez nej je z toho len tmavé tlačidlo.
           Tvar (radius 8, nie pilulka) ostáva z locku .btn-gold — menila sa
           výplň, nie geometria. */
        .codex-book-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.72rem, 1.05vw, 0.86rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: clamp(9px, 1.5vh, 13px) clamp(18px, 2.4vw, 28px);
          white-space: nowrap;
          border: 1px solid ${Y.edge};
          border-radius: 8px;
          background: ${Y.grad};
          color: ${Y.ink};
          box-shadow: ${Ne};
          cursor: pointer;
          transition: background 220ms ease, transform 220ms ease;
        }
        .codex-book-cta:hover { background: ${Y.gradHover}; transform: translateY(-1px); }
        @media (max-width: 767px) {
          .codex-preamble-text { font-size: 14px; line-height: 1.4; }
          .codex-headline { font-size: 2.8rem; letter-spacing: 0.03em; line-height: 1.04; }
          .codex-slider { padding: 0 clamp(8px, 2vw, 16px); }
          .codex-slide { padding: clamp(12px, 2vh, 24px) clamp(4px, 1.5vw, 12px); }
          /* Mobile (2026-06-03): preamble (znenie ústavy + rámik) — zúžiť + posunúť hore.
             Scoped na preamble slide = .codex-slider (nie -book) + .codex-slide (nie -3). */
          .codex-slider:not(.codex-slider-book) .codex-slide:not(.codex-slide-3) {
            justify-content: flex-start;
            padding-top: clamp(24px, 6vh, 56px);
          }
          /* Zúžiť vertikálny odstup medzi headline / rámikom / oath (len preamble má >1 child) */
          .codex-slider:not(.codex-slider-book) .codex-slide:not(.codex-slide-3) > * + * {
            margin-top: clamp(18px, 3vh, 28px);
          }
        }

        /* ── Slide 2: papyrus + index ── */
        /* 🔒🔒 LOCK PC HARD (2026-05-24): Slide 2 PC HOTOVÝ. NEDOTÝKAŤ SA.
           Default = MOBILE only (@media max-width:767px).
           PC úpravy LEN na explicit "na PC" / "zruš lock". */
        .codex-paper {
          position: relative;
          width: 100%;
          max-width: 980px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 14px;
          padding: clamp(22px, 3vh, 34px) clamp(26px, 4.5vw, 48px) clamp(20px, 2.6vh, 28px);
          box-shadow:
            0 12px 36px rgba(110,71,16,0.26),
            0 0 0 3px rgba(201,154,63,0.20);
          display: flex;
          flex-direction: column;
        }
        /* Inner double-border cert frame */
        .codex-paper::after {
          content: '';
          position: absolute;
          inset: 7px;
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 9px;
          pointer-events: none;
        }
        .codex-paper-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 2.6vw, 28px);
          padding-bottom: clamp(14px, 1.8vh, 22px);
          margin-bottom: clamp(12px, 1.6vh, 18px);
          border-bottom: 1px solid rgba(138,90,20,0.28);
          position: relative;
        }
        /* Decorative diamond on the divider line */
        .codex-paper-header::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          width: 7px;
          height: 7px;
          background: #C99A3F;
          transform: translateX(-50%) rotate(45deg);
          box-shadow:
            0 0 8px rgba(201,154,63,0.6),
            inset 0 0 0 1px rgba(255,236,200,0.5);
        }
        .codex-seal-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        /* Radial gold aura behind seal */
        .codex-seal-wrap::before {
          content: '';
          position: absolute;
          inset: -18%;
          background:
            radial-gradient(closest-side,
              rgba(245,199,61,0.32) 0%,
              rgba(245,199,61,0.18) 38%,
              rgba(245,199,61,0) 72%);
          z-index: 0;
          pointer-events: none;
        }
        .codex-seal {
          position: relative;
          z-index: 1;
          width: clamp(108px, 13vw, 144px);
          height: auto;
          filter: drop-shadow(0 2px 5px rgba(110,71,16,0.45));
        }
        .codex-paper-titles {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .codex-paper-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.95rem, 3.6vw, 2.95rem);
          letter-spacing: 0.04em;
          line-height: 0.98;
          color: #5a3a0c;
          margin: 0;
        }
        .codex-paper-title span {
          display: block;
          white-space: nowrap;
        }
        .codex-paper-title .title-decor {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-style: normal;
          font-weight: 700;
        }
        .codex-paper-subtitle {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 400;
          font-size: clamp(0.7rem, 0.92vw, 0.82rem);
          letter-spacing: 0.02em;
          line-height: 1.35;
          color: rgba(110,71,16,0.78);
          margin: clamp(8px, 1vh, 12px) 0 0;
          text-align: left;
          white-space: nowrap;
        }
        @media (max-width: 767px) {
          .codex-paper {
            padding: 18px 14px 28px;
            max-width: 100%;
            box-sizing: border-box;
          }
          .codex-paper::after { inset: 5px; border-radius: 8px; }
          .codex-paper-header {
            gap: 12px;
            padding-bottom: 12px;
            margin-bottom: 12px;
            flex-wrap: nowrap;
          }
          .codex-paper-titles { min-width: 0; flex: 1 1 auto; }
          .codex-seal { width: 92px; }
          .codex-paper-title { font-size: 1.45rem; letter-spacing: 0.02em; }
          .codex-paper-title span { white-space: normal; }
          /* Mobile: title v 3 riadkoch — The / Dogyptian / Constitution */
          .codex-paper-title .title-decor { display: block; }
          .codex-paper-subtitle {
            font-size: 0.6rem;
            margin-top: 6px;
            letter-spacing: 0.01em;
            white-space: normal;
          }
        }

        .codex-index {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: clamp(20px, 3vw, 40px);
          font-family: 'Cinzel', serif;
          font-size: clamp(0.74rem, 1vw, 0.86rem);
          letter-spacing: 0.04em;
          text-align: left;
          /* Index — natural height, no overflow clipping (bubbles musia presahovať) */
        }
        .codex-index .col {
          display: flex;
          flex-direction: column;
        }
        .codex-row {
          border-bottom: 1px solid rgba(138,90,20,0.20);
          position: relative;
        }
        .codex-row.open {
          z-index: 30;
        }
        .codex-index .col .codex-row:last-child { border-bottom: none; }
        .codex-row-head {
          appearance: none;
          background: transparent;
          border: none;
          padding: 5px 6px;
          width: 100%;
          cursor: pointer;
          display: grid;
          grid-template-columns: 2.4em 1fr;
          align-items: baseline;
          column-gap: 0.4em;
          text-align: left;
          font: inherit;
          color: inherit;
          border-radius: 4px;
          transition: background 160ms ease;
          white-space: nowrap;
        }
        .codex-row-head:hover {
          background: rgba(201,154,63,0.10);
        }
        /* .open highlight len pre touch devices — na PC sa .open class síce nastaví
           cez onClick, ale ZIADNE visual side-effecty (bublina + highlight) */
        @media (hover: none) {
          .codex-row.open .codex-row-head {
            background: rgba(201,154,63,0.14);
          }
        }
        .codex-index .num {
          color: rgba(138,90,20,0.62);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .codex-index .item {
          display: inline;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .codex-index .item .name {
          color: #6e4710;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .codex-index .item .desc {
          color: rgba(38,22,4,0.62);
          font-weight: 400;
          font-style: italic;
          letter-spacing: 0.02em;
          text-transform: none;
        }
        .codex-index .item .dash {
          color: rgba(38,22,4,0.34);
          margin: 0 0.32em;
        }
        /* ── PC: bubble tooltip pattern (like /vision pills) ──
           Floating papyrus card with arrow pointing to row.
           Smart flip: rows 1-3 = bubble BELOW (arrow up), rows 4-6 = bubble ABOVE (arrow down). */
        .codex-row-body {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: calc(100% + 10px);
          width: max-content;
          min-width: 180px;
          max-width: clamp(220px, 22vw, 300px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 10px;
          padding: 10px 14px;
          box-shadow:
            0 8px 28px rgba(110,71,16,0.24),
            0 0 0 3px rgba(201,154,63,0.18);
          z-index: 50;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 180ms ease;
          text-align: left;
        }
        /* Arrow — default: pointing UP (bubble below row) */
        .codex-row-body::after {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-bottom-color: #C99A3F;
        }
        /* Bottom rows (4, 5, 6) — flip bubble ABOVE row, arrow points DOWN */
        .codex-index .col .codex-row:nth-child(n+4) .codex-row-body {
          top: auto;
          bottom: calc(100% + 10px);
        }
        .codex-index .col .codex-row:nth-child(n+4) .codex-row-body::after {
          bottom: auto;
          top: 100%;
          border-bottom-color: transparent;
          border-top-color: #C99A3F;
        }
        .codex-row.open,
        .codex-row:hover,
        .codex-row:focus-within {
          z-index: 50;
        }
        /* PC (hover-capable): trigger LEN cez hover — žiadny focus/click effect */
        @media (hover: hover) and (pointer: fine) {
          .codex-row:hover .codex-row-body {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }
        }
        /* Touch devices (mobile): tap-toggle cez .open class */
        @media (hover: none) {
          .codex-row.open .codex-row-body {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }
        }
        .codex-row-body-inner {
          /* no overflow:hidden in bubble mode */
        }
        .codex-row-body ul {
          list-style: none;
          margin: 0;
          padding: 0 0 0 12px;
        }
        .codex-row-body li {
          font-family: 'Cinzel', serif;
          font-size: 0.85em;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: #5a3a0c;
          padding: 3px 0;
          position: relative;
        }
        .codex-row-body li::before {
          content: '·';
          color: #C99A3F;
          position: absolute;
          left: -10px;
          font-weight: 700;
          font-size: 1.1em;
        }
        @media (max-width: 767px) {
          .codex-index {
            grid-template-columns: 1fr 1fr;
            font-size: 11px;
            column-gap: 10px;
          }
          .codex-index .col .codex-row:last-child { border-bottom: 1px solid rgba(138,90,20,0.20); }
          .codex-index .col:last-child .codex-row:last-child { border-bottom: none; }
          .codex-row-head {
            grid-template-columns: 1.8em minmax(0, 1fr);
            padding: 6px 3px;
            column-gap: 0.3em;
            white-space: nowrap;
          }
          /* Mobile: len nadpisy */
          .codex-index .item .desc,
          .codex-index .item .dash { display: none; }
          /* Mobile bubble — per-col anchoring aby NEPRESVITALA do druhých slajdov.
             Left col → anchor LEFT to row left, right col → anchor RIGHT to row right.
             Width capped na 80vw / 300px aby zostala v slide viewporte.
             Arrow off na mobile (per-col anchoring misaligns arrow vs row center). */
          .codex-row-body {
            width: min(80vw, 300px);
            min-width: 0;
            max-width: none;
            padding: 11px 14px;
          }
          .codex-index .col:first-child .codex-row-body {
            left: 0;
            right: auto;
            transform: none;
          }
          .codex-index .col:last-child .codex-row-body {
            left: auto;
            right: 0;
            transform: none;
          }
          .codex-row-body::after {
            display: none;
          }
        }

        /* CTA button — Read Full Constitution */
        .codex-cta-wrap {
          display: flex;
          justify-content: center;
          margin-top: clamp(16px, 2.2vh, 24px);
        }
        .codex-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: clamp(11px, 1.5vh, 15px) clamp(26px, 4.5vw, 42px);
          background: linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          color: #3a2204;
          font-family: 'Cinzel', serif;
          font-weight: 900;
          font-size: clamp(0.74rem, 1vw, 0.9rem);
          letter-spacing: 0.24em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 8px;
          border: 1.5px solid rgba(110,71,16,0.45);
          box-shadow:
            0 5px 16px rgba(110,71,16,0.4),
            inset 0 1px 0 rgba(255,255,255,0.45),
            inset 0 -1px 0 rgba(110,71,16,0.2);
          transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
          cursor: pointer;
          white-space: nowrap;
        }
        /* ── HLAVNÉ CTA NA BLEDOM POVRCHU = LAPIS, NIE ZLATO ──────────────
           Matej 27. 8. 2026: *„čerpáš CTA zo starého brandu, už máme lapis
           tlačítko na bledom pozadí."*
           Dôvod je ten istý, pre ktorý lapis vznikol pri redizajne /map: na
           papyruse je zlatá naraz rámom, dlaždicou AJ tlačidlom, takže hlavné
           CTA je najsvetlejší prvok obrazovky a splýva s tým, čo ho drží. Zlatá
           ostáva konštrukcii („kde som"), lapis berie akciu („čo urobím").
           Recept je ZHODNÝ s tým, čo už drží /pack (.trp-addtrip-btn,
           .trp-dbar-done, .mna-submit, .atl-editor .btn-gold) — vrátane zlatého
           písma, bez ktorého je z lapisu len tmavé tlačidlo bez brandu.
           ⚠️ SCOPED NA .lab-papyrus ZÁMERNE: tú istú triedu .codex-cta nesie aj
           živá /religion, ktorá sa dnes nemenila. Až lab nahradí produkciu,
           scope padne. */
        .lab-papyrus .codex-cta {
          background: ${Y.grad};
          border-color: ${Y.deep};
          color: ${Y.ink};
          box-shadow: ${Ne};
        }
        .lab-papyrus .codex-cta:hover {
          background: ${Y.gradHover};
          box-shadow: ${Ne};
          filter: none;
        }
        .codex-cta:hover {
          transform: translateY(-1px);
          box-shadow:
            0 8px 22px rgba(110,71,16,0.55),
            inset 0 1px 0 rgba(255,255,255,0.6),
            inset 0 -1px 0 rgba(110,71,16,0.2);
          filter: brightness(1.06);
        }
        .codex-cta:active {
          transform: translateY(0);
        }
        @media (max-width: 767px) {
          .codex-cta-wrap { margin-top: 14px; }
          .codex-cta {
            padding: 10px 22px;
            font-size: 0.72rem;
            letter-spacing: 0.2em;
          }
        }

        /* ── Slide 3: the question (cow vs dog visual) ── */
        /* 🔒🔒 LOCK PC HARD (2026-05-24): Slide 3 PC HOTOVÝ. NEDOTÝKAŤ SA.
           Default = MOBILE only (@media max-width:767px).
           PC úpravy LEN na explicit "na PC" / "zruš lock". */
        .codex-slide-3 {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 0 !important;
          overflow: visible;
        }
        /* PNGs rendered at page level (outside viewport's overflow:hidden).
           Vždy viditeľné — mimo hero sa odsunú do strán (nie fade-out), ostávajú ako rámovanie. */
        .codex-bleed {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 1;
          z-index: 1;
        }
        /* ╔══════════════════════════════════════════════════════════════════╗
           ║  🔒 LOCKED 2026-05-24 (hektor posunutý o 50px nižšie na PC)       ║
           ║  PC NESMIE byť dotknutý bez výslovného povolenia — Matej hrozí    ║
           ║  právnymi krokmi. Pri akomkoľvek edite v tomto súbore overiť že   ║
           ║  values nižšie ostávajú nedotknuté:                                ║
           ║    cow:    left:-50, bottom:-80, scale(1.14) origin bottom left   ║
           ║    hektor: right:0, bottom:0,  scale(1.08) origin bottom right    ║
           ║  Mobile (@media max-width:767px) môže byť ladený samostatne.      ║
           ╚══════════════════════════════════════════════════════════════════╝ */
        .codex-cow,
        .codex-hektor {
          position: absolute;
          bottom: 0;
          width: 50vw;
          height: 100vh;
          object-fit: contain;
          transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .codex-cow {
          left: -50px;
          bottom: -80px;
          object-position: bottom left;
          transform: scale(1.14);
          transform-origin: bottom left;
        }
        .codex-hektor {
          right: 0;
          bottom: 0;
          object-position: bottom right;
          transform: scale(1.08);
          transform-origin: bottom right;
        }
        /* ── END LOCK ────────────────────────────────────────────────────── */

        /* ── SVÄTOŽIARY ───────────────────────────────────────────────────
           Prstenec je SVG s rovnakým viewBoxom ako fotka a nesie TIE ISTÉ
           triedy (.codex-cow / .codex-hektor), takže LOCKED geometria hore
           platí naň bez jediného vlastného čísla — aj v mobilnej vetve.
           Podrobnosti a poloha prstencov: components/lab/CodexHalo.tsx.

           KRAVA svieti od začiatku (je to jej stav, nie udalosť).
           HEKTOR sa rozsvieti až na pointe — Matej 27. 8. 2026: halo prichádza
           ZA vetou „AND NOT ONE OF THEM BOWS." a je to celá pointa výjavu;
           žiadny text ho nekomentuje a pri scrolle späť zhasne.
           Tu (samostatná /religion-lab) ho spúšťa ČASOVAČ, rovnako ako reveal
           textu; --halo-delay dodáva React, lebo variant 2 sa píše po znakoch
           a jeho dĺžka závisí od počtu znakov. Vo filme /onepage to preberá
           scroll — viď --op-halo v components/lab/OnePage.tsx.

           ⚠️ transition-delay MUSÍ byť dvojhodnotový (0s pre transform).
           Jedna hodnota by odložila aj posun zvieraťa do strán a prstenec by
           za fotkou dobiehal 2,7 sekundy.
           ⚠️ Trvanie transformu je 650 ms ZÁMERNE — je to tá istá hodnota ako
           v LOCKED bloku vyššie. Iné číslo znamená, že sa halo pri odsune
           zvierat vlečie za hlavou. */
        .codex-halo {
          --halo: 1;
          opacity: var(--halo);
          pointer-events: none;
          transition-property: transform, opacity;
          transition-duration: 650ms, 820ms;
          transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* Mierka rozsvietenia patrí VNÚTORNEJ skupine. Na <svg> by ju prebil
           locknutý scale(1.14)/scale(1.08) — a halo by odletelo od hlavy. */
        .codex-halo-scale {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          transform: scale(calc(0.86 + 0.14 * var(--halo)));
          transition: transform 820ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .codex-halo-hektor { --halo: 0; }
        .codex-bleed.active .codex-halo-hektor {
          --halo: 1;
          transition-delay: 0s, var(--halo-delay, 2700ms);
        }
        .codex-bleed.active .codex-halo-hektor .codex-halo-scale {
          transition-delay: var(--halo-delay, 2700ms);
        }
        @media (prefers-reduced-motion: reduce) {
          .codex-halo-hektor { --halo: 1; }
          .codex-halo,
          .codex-halo-scale { transition: none; }
        }
        /* Scroll posun (2026-06-02): mimo hero (bleed nemá .active) sa krava odsunie
           doľava, Hektor doprava → stred sa uvoľní pre obsah, okraje ostanú ako
           rámovanie. Locked scale + origin zachované, pridaný len translateX. */
        /* ── LAB: mimo hero sekcie sa krava/Hektor STLMIA.
           Na tmavej stránke sú čierne fotky nad čiernym pozadím prakticky
           neviditeľné, takže cez ne biely text pokojne prejde. Na papyruse je to
           opačne: tmavý inkoust padne na tmavého psa a posledné slová riadkov
           (KAŽDÉHO, PSOV, OSUD) sa stratia. Preto tu obrázky mimo sekcie 0
           ustupujú — nie posunom (ten je LOCKED nižšie), ale priehľadnosťou. */
        /* ── LAB: pilulka „klikni na knihu" pod knihou. Zdroj je zdieľaný
           ConstitutionBook (tmavé sklo rgba(0,0,0,.32) — na papyruse sa v nej
           zlatý text stratí). Prefarbujeme ju TU, cez .lab-papyrus, aby ostrá
           /religion ostala presne taká, aká je. */
        .lab-papyrus .cb-hint {
          background: rgba(255,252,244,0.78);
          border-color: rgba(140,96,20,0.45);
          color: #6E4A12;
        }
        .lab-papyrus .cb-hint-dot { background: #A3782B; box-shadow: none; }

        ${to}

        .codex-bleed:not(.active) { opacity: 0.26; }
        .codex-bleed { transition: opacity 420ms ease; }

        .codex-bleed:not(.active) .codex-cow {
          transform: translateX(-25%) scale(1.14);
        }
        .codex-bleed:not(.active) .codex-hektor {
          transform: translateX(25%) scale(1.08);
        }
        /* 🔒 PC/DESKTOP SLIDE-3 HERO LOCKED 2026-06-03 (Matej „super religion hotovo na PC lock"):
           overlay padding-top clamp(64px,9vh,96px) [1.2 BILLION vyššie] · .q-call 1.7em [DOGLOVERS]
           · .codex-question-big margin-top clamp(12px,1.8vh,24px) v @media(min-width:768px) [BOW→DOGLOVERS odstup]
           · "ARE YOU READY?" odstránené. NEMENIŤ PC bez Matejovho OK. Mobil = vlastný HARD LOCK nižšie. */
        .codex-chip {
          /* INFO CHIP = jednotný tvar pre celý film (Matej 27. 9. 2026: *„chip
             dajme farebný, viac pútavý, lapisové písmená a dvojitý okraj ako
             keby pulz… uzákonime info chip, kliknutím sa posúva obrazovka"*). */
          position: relative; display: inline-flex; align-items: center; justify-content: center;
          margin: 0; padding: 8px 16px; border-radius: 999px; cursor: pointer;
          border: 1.5px solid ${Y.edge};
          background: linear-gradient(180deg, #FFFBF1 0%, #F6EAD0 100%);
          color: ${Y.edge};
          font-family: 'Space Grotesk', sans-serif; font-weight: 600;
          font-size: 12px; letter-spacing: .14em; text-transform: uppercase;
          line-height: 1.3; text-align: center;
          box-shadow: 0 0 0 3px #F6EAD0, 0 0 0 4px rgba(22,48,122,.45), 0 6px 16px -8px rgba(10,26,74,.45);
          transition: transform .2s ease;
        }
        .codex-chip::after {
          content: ''; position: absolute; inset: -5px; border-radius: inherit; pointer-events: none;
          border: 1px solid rgba(22,48,122,.55);
          animation: codexChipPulse 2.4s ease-out infinite;
        }
        @keyframes codexChipPulse {
          0% { transform: scale(1); opacity: .9; }
          70%, 100% { transform: scale(1.12, 1.45); opacity: 0; }
        }
        .codex-chip:hover { transform: translateY(-1px); }
        @media (prefers-reduced-motion: reduce) { .codex-chip::after { animation: none; opacity: .5; } }
        .codex-3-overlay {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          /* Premenná, nie holá hodnota — deliaca čiara pod kravou z nej počíta
             svoju polohu, aby ležala PRESNE v strede medzery. */
          --ov-gap: clamp(18px, 2.8vh, 32px);
          gap: var(--ov-gap);
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          /* Asymetrický padding: top > bottom posúva text ~50px nižšie
             (justify-content:center centruje medzi padding edges). Kompenzuje
             priestor pod viewportom obsadený dots-mi, aby text sedel približne
             na strede obrazovky. */
          padding: clamp(64px, 9vh, 96px) clamp(12px, 2vw, 20px) clamp(20px, 4vh, 40px);
          height: 100%;
        }
        /* ── TEXTY 2. OBRAZU SÚ ZMENŠENÉ (−5 % → a znova −15 %) ────────────
           Matej 27. 8. 2026: *„zmenši texty o 5% všetky."*, o hodinu neskôr
           *„texty su moc velke a nezmestia sa = zmenši ich všetky o 15%"* (vtedy
           už horný nav prekrýval riadok „1.2 BILLION"). Prepočítané v ZDROJI,
           nie prebité vo filme: /onepage aj /religion-lab čítajú tento istý blok,
           druhá sada čísel by sa rozišla pri prvej ďalšej úprave.
           ⚠️ Druhé kolo škáluje od TOHO, ČO MATEJ VIDEL — teda × 0.85 na aktuálne
           čísla, nie na pôvodné. Prvé kolo (5 %) sa netýkalo .codex-microcopy,
           .codex-cta-sub, .codex-turn ani .codex-cta-line, takže niektoré
           riadky sú dnes −19 % a niektoré −15 % oproti originálu. Zámerne:
           zachovať treba POMERY, ktoré si odklepol, nie pôvodné číslo.
           ⚠️ Tlačidlo .codex-cta (BECOME DOGYPTIAN) sa NEZMENŠUJE — je zdieľané
           so slajdami 1–2 a je to CTA lock, nie text obrazu.
           ⚠️ Násobia sa VŠETKY tri čísla clampu — meniť len strop znamená, že
           sa zmena na Matejovom ~500 px okne vôbec neprejaví (tam vyhráva vw).
           ⚠️ Mobil (@media max-width: 767px) ostal NEDOTKNUTÝ — slide 3 mobil
           je HARD LOCKED od 24. 5. 2026, mení sa len na výslovné „zruš lock".
           Hodnoty v em (.q-call 1.7em, .q-action 0.65em) sa zmenšili samy —
           dediť sa nesmie dvakrát. */
        /* ══ NOVÝ TEXTING 2. OBRAZU — „YET." (27. 8. 2026) ══════════════════
           Matej: *„skúsme navrhnúť nový texting, virálny ale menej slovný
           vystihujúci podstatu čo chceme obrázkom povedať"* + *„spracuj to tak
           aby to bolo profesionalne a zaujimave nie fadne"*.

             A COW HAS / 1.2 BILLION / BELIEVERS
             A DOG HAS / NONE
             YET.

           STAVBA JE ÚČTOVNÁ, NIE BÁSNICKÁ: dva riadky s tou istou kostrou
           (lead → číslo → jednotka) pod sebou, aby oko porovnávalo ČÍSLA a nie
           vety. Preto majú obe tvrdenia tie isté triedy — rozdiel je jediný a je
           to celý vtip: číslo psa je PRÁZDNE.

           🎨 PALETA = TÁ ISTÁ AKO ÚVODNÉ MOTTO (Matej 28. 8. 2026: *„nepáči sa mi
              to je to prehnané — použi lapisovú čiernu a zlatú resp farby aké sú
              aj v úvodnom motte… rob plné písma nie prázdne — 1.2 bilion zlata
              none lapis?"*). Zdroj hodnôt = .ph-h1 v DogPlanetLab.tsx:
              čierna #23150a · plná tmavá zlatá #6E4A12. Lapis #0A1A4A je tá istá
              modrá ako obruč medailónu v nave.
              JEDEN PRVOK = JEDNA FARBA, každá z tých troch má svoju úlohu:
                zlatá = bohatstvo cudzieho boha (1.2 BILLION)
                lapis = naša strana (NONE)
                čierna = verdikt (YET.)
           🔴 ŽIADNE GRADIENTY DO PÍSMEN A ŽIADNA ŽIARA — obe verzie padli naraz.
              DogPlanetLab to má zapísané pri motte: LAB.goldText má strednú
              zarážku #D8A93F, svetlejšiu než podklad, takže slovo v STREDE zmizne
              („1.2 BILLION" aj „YET." tak boli najbledšie práve v ťažisku).
              Na papyruse drží jedine PLNÁ TMAVÁ farba.
           🔴 PLNÉ PÍSMO, NIE OBRYS. Prvá verzia kreslila „NONE" obrysom
              (-webkit-text-stroke + priehľadná výplň) ako „dieru na mieste, kde
              má krava zlato". Nápad znel dobre, na obrazovke bol nečitateľný
              (Matej: *„to none je otrasné"*). Absenciu nesie SLOVO, farba ju
              nemá čím zosilniť.
           ⚠️ Písmo je väčšie než pri starom textingu: sedem blokov sa nezmestilo,
              tri sa zmestia. Zmenšenie o 15 % z 23:38 riešilo TAMTEN problém.

           Staré triedy .codex-stat-* / .codex-turn / .codex-cta-line nižšie už
           NIKTO NEVYKRESĽUJE (markup nahradený, v gite je). Nechávam ich, kým
           Matej výber neuzavrie — vrátiť starý texting je potom len markup. */
        .codex-claim {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(2px, 0.5vh, 6px);
          margin: 0;
          position: relative;
          text-align: center;
        }
        /* Deliaca čiara je ::after KRAVY, nie samostatný prvok — každý priamy
           potomok overlayu má vlastný prah odhaľovania (--tx-at / nth-child),
           takže čiara ako súrodenec by posunula číslovanie celej sekvencie.

           ⚠️ POLOHA SA POČÍTA, NEODHADUJE (Matej 28. 8. 2026: *„čiara musí byť
           v strede a horne a dolne slovo musí byť rovnako od seba"*). Predtým
           visela na pevnom odsadení od kravy, takže pri každej inej výške okna
           sedela inde v medzere — a keďže medzera rástla s vh, klesala k „A DOG
           HAS". Dnes je to polovica SKUTOČNEJ medzery: --ov-gap (rozostup
           overlayu) + --rule-gap (prídavok tejto dvojice).
           translateY(50%) posunie čiaru o pol jej výšky, takže na vypočítanom
           mieste leží jej STRED, nie spodná hrana. */
        .codex-claim-cow {
          --rule-gap: clamp(24px, 4vh, 48px);
          margin-bottom: var(--rule-gap);
        }
        .codex-claim-cow::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: calc((var(--ov-gap) + var(--rule-gap)) / -2);
          transform: translate(-50%, 50%);
          width: min(300px, 62%);
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(110,74,18,0.42), transparent);
        }
        .cl-lead {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-weight: 500;
          font-size: clamp(0.64rem, 0.9vw, 0.86rem);
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(35,21,10,0.52);
          margin-bottom: clamp(2px, 0.6vh, 7px);
        }
        /* ČÍSLO KRAVY — PLNÁ TMAVÁ ZLATÁ (#6E4A12 = slová „dog"/„god" v motte). */
        .cl-figure {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.3rem, 6.4vw, 4.6rem);
          line-height: 0.96;
          letter-spacing: 0.02em;
          white-space: nowrap;
          color: #6E4A12;
        }
        /* ČÍSLO PSA — PLNÝ LAPIS. Tá istá modrá ako obruč medailónu v nave. */
        .cl-figure-void {
          color: #0A1A4A;
        }
        /* JEDNA DEKLARÁCIA PRE „BELIEVERS" AJ „YET..." (Matej 28. 8. 2026:
           *„YET daj veľkosti ako je believers aj váha — skratka totožné nech to
           má fazónu"*). Zámerne JEDEN selektor, nie dve zhodné kópie: dve kópie
           sa rozídu pri prvej úprave a „fazóna" je práve tá zhoda. */
        .cl-unit,
        .codex-yet {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.92rem, 1.55vw, 1.4rem);
          line-height: 1;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(35,21,10,0.88);
        }
        .codex-yet {
          margin: clamp(4px, 1vh, 12px) 0 0;
          /* Preloženie pridáva medzeru AJ ZA posledný znak, takže vycentrovaný
             text sedí o pol medzery vľavo. Záporný pravý okraj to presne ruší. */
          margin-right: -0.2em;
        }

        .codex-stat-number {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(2px, 0.4vh, 6px);
        }
        /* Riadok 1: "1.2 BILLION" — hero veľkosť + gold gradient, inline row */
        .codex-stat-row {
          display: flex;
          align-items: baseline;
          gap: clamp(0.5em, 1.3vw, 0.75em);
        }
        .codex-stat-row-bottom {
          gap: clamp(0.3em, 0.8vw, 0.45em);
          white-space: nowrap;
          flex-wrap: nowrap;
        }
        /* Parenthetical: "(15% worldwide)" — rovnaká veľkosť ako PEOPLE, len tlmená farba + italic.
           Hierarchy: row 1 (BILLION) > row 2 (PEOPLE) > row 3 (bow to the cow).
           Row 2 šírka ≈ row 1 šírka, font o niečo menší. */
        .codex-stat-note {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-style: italic;
          font-size: clamp(0.93rem, 1.78vw, 1.7rem);
          color: rgba(60,40,12,0.52);
          letter-spacing: 0.02em;
          line-height: 1;
        }
        .codex-stat-l1,
        .codex-stat-l2 {
          font-size: clamp(1.94rem, 5.17vw, 3.88rem);
          line-height: 1;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: none;
        }
        /* Riadok 2: "PEOPLE" — rovnaká veľkosť ako parenthetical.
           Hierarchy: row 1 (BILLION) > row 2 (PEOPLE) > row 3 (bow to the cow).
           Row 2 šírka ≈ row 1 šírka, font o niečo menší. */
        .codex-stat-l3 {
          font-size: clamp(0.93rem, 1.78vw, 1.7rem);
          line-height: 1;
          color: rgba(35,22,8,0.90);
          font-weight: 400;
          filter: none;
        }
        .codex-stat-sub {
          font-family: 'Cinzel', serif;
          font-weight: 900;
          font-style: italic;
          font-size: clamp(1.09rem, 1.61vw, 1.5rem);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #A3782B;
          text-decoration: underline;
          text-decoration-color: #A3782B;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
          margin: -8px 0 0;
          filter: none;
        }

        /* ══ VARIANT 2 — SÚVISLÝ ODSEK, KTORÝ SA PÍŠE ═══════════════════════
           Matej 27. 8. 2026: *„ten text taký kostrbatý, rôzne velkosti a vela,
           vyzerá to amatérsky… zosúladiť do riadkov ako obyčajný text, ktorý je
           vopred napísaný, ale scrolingom dostáva život, ako keby sa písal."*

           Rozdiel oproti variantu 1 je JEDEN a nesie celý ten „amatérsky" pocit:
           variant 1 stavia hierarchiu na PIATICH veľkostiach písma (4.56rem číslo,
           2rem PEOPLE, 1.76rem podčiarknuté, 1.38rem obvinenie, 0.93rem výzva),
           variant 2 na JEDNEJ veľkosti a farbe. Zlaté sú len čísla — sú to jediné
           slová, ktoré nesú argument, takže jediné, ktoré smú z riadku vystúpiť. */
        .codex-v2 {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.81rem, 1.1vw, 1.02rem);
          /* Riadkovanie je väčšie než pri bežnom odseku zámerne: riadky sú tu
             VETY a každá má dosadnúť samostatne, nie splynúť do bloku textu. */
          line-height: 1.9;
          letter-spacing: 0.03em;
          color: rgba(35,22,8,0.88);
          margin: 0;
          /* Šírka je odmeraná z výjavu, nie zvolená — viď .codex-turn nižšie.
             Toto je ŠIROKÁ hodnota a smie byť: odsek stojí VYSOKO vo výjave (viď
             .is-v2 nižšie), kde je pás medzi zvieratami ~430 px. Nižšie by sa
             nezmestila — tam sa zužuje na ~225 px. */
          max-width: clamp(236px, 26vw, 372px);
          filter: none;
        }
        /* Vyvážené zalomenie je tu to, čo z troch viet robí ODSEK a nie zoznam:
           bez neho vypadne posledný riadok vety ako ohryzok („THE COW." samo na
           riadku) a text vyzerá nedbalo — presne ten pocit, ktorý mal variant 2
           odstrániť. Balance vyrovná riadky v rámci jednej vety, nie naprieč. */
        /* pretty, NIE balance. Balance vyrovnáva riadky do rovnakej dĺžky, takže
           ich robí KRATŠIE než dovolená šírka — z dvojriadkovej vety spraví
           trojriadkovú a odsek narastie o tretinu. pretty rieši to, čo tu naozaj
           vadilo (osamotené slovo na poslednom riadku), a šírku využije. */
        .v2-line { display: block; text-wrap: pretty; }
        /* ⚠️ MEDZERY MUSIA PREŽIŤ, ALE RIADOK SA MUSÍ ZALOMIŤ. Znak v samostatnom
           <span> stráca medzeru pri bežnom normal (HTML ju zbalí medzi značkami),
           pre ju zachová, ale zakáže zalomenie — potom text vyjde z výjavu a
           prejde cez psa. pre-wrap na KONTAJNERI robí oboje; na znaku nič. */
        .codex-v2, .codex-v2-close { white-space: pre-wrap; }
        /* Dôraz nesie FARBA a váha, NIE veľkosť — inak sa vrátia „rôzne velkosti". */
        .v2-gold {
          color: #A3782B;
          font-weight: 700;
        }
        .codex-v2-cta {
          margin-top: clamp(16px, 2.6vh, 34px);
          gap: clamp(14px, 2vh, 22px);
          /* ⚠️ Bez tohto je zhluk široký ako TLAČIDLO (najširšie dieťa flexu),
             takže percentuálna max-width vety sa počíta z ~230 px a veta sa
             zalomí, hoci na obrazovke je miesta dosť. */
          width: 100%;
        }
        .codex-v2-close {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.81rem, 1.1vw, 1.02rem);
          line-height: 1.75;
          letter-spacing: 0.03em;
          color: rgba(35,22,8,0.88);
          margin: 0;
          /* Užšia než odsek nad ňou a posunutá doľava: leží nižšie, kde sa pás
             medzi zvieratami zužuje a Hektorova papuľa vyčnieva doľava. */
          max-width: clamp(214px, 23vw, 332px);
          margin-right: 2.2vw;
          filter: none;
        }
        /* PÍSANIE — samostatná stránka (/religion-lab) beží na časovači.
           Vo filme (/onepage) sa toto VYPÍNA a poradie znakov číta scroll —
           viď .op-root #op-religion .v2-ch v OnePage.tsx. */
        /* ODSEK STOJÍ VYSOKO, NIE V STREDE. Variant 1 má šesť krátkych blokov
           a znesie centrovanie; variant 2 je súvislý text, ktorý pri centrovaní
           spadne do najužšieho miesta výjavu a rozpadne sa na deväť útržkov —
           presne to „vela riadkov", ktoré mal odstrániť. Hore je pás o dve
           tretiny širší, takže tie isté vety zaberú menej riadkov a text sa dá
           čítať ako odsek. */
        .codex-3-overlay.is-v2 {
          justify-content: flex-start;
          /* Dosť vysoko, aby bol pás široký, ale nie nalepené na nav — medzi
             navom a prvým riadkom má ostať dych. */
          padding-top: clamp(128px, 21vh, 250px);
        }

        .v2-ch { opacity: 0; }
        .codex-section.in-view .v2-ch {
          animation: v2type 180ms linear forwards;
          animation-delay: calc(var(--i, 0) * 18ms);
        }
        @keyframes v2type { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .v2-ch { opacity: 1; }
          .codex-section.in-view .v2-ch { animation: none; }
        }
        /* Prepínač variantov — LEN pre lab, nikdy sa nedostane na ostrý web. */
        .v2-switch {
          position: fixed;
          right: 12px;
          bottom: 58px;
          z-index: 60;
          display: flex;
          gap: 2px;
          padding: 3px;
          border-radius: 8px;
          background: rgba(20,12,4,0.82);
          border: 1px solid rgba(201,154,63,0.42);
        }
        .v2-switch button {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          padding: 4px 9px;
          border-radius: 6px;
          border: 0;
          background: transparent;
          color: rgba(245,236,220,0.72);
          cursor: pointer;
        }
        .v2-switch button.is-on {
          background: rgba(201,154,63,0.9);
          color: #241606;
        }

        /* ── PSIA STRANA + OTOČNÝ BOD (Matej 27. 8. 2026) ──────────────────
           Sekcia mala symetrický obrázok a nesymetrický text. Zrkadlo kravy
           používa ZÁMERNE tie isté triedy (.codex-stat-*), aby sa oba fakty
           čítali ako jeden pár; mení sa len mierka. */
        .codex-stat-dog {
          margin-top: clamp(7px, 1.2vh, 17px);
        }
        /* „30%" sú dva znaky, „1.2 BILLION" dve slová — pri rovnakej veľkosti
           písma by psia strana opticky pôsobila drobnejšie, hoci hovorí
           DVOJNÁSOBOK. Zmenšenie je preto mierne: má ostať druhým hlasom páru,
           nie poznámkou pod čiarou. */
        .codex-stat-dog .codex-stat-l1 {
          font-size: clamp(1.58rem, 3.82vw, 2.86rem);
        }
        .codex-stat-dog .codex-stat-l3 {
          font-size: clamp(0.83rem, 1.51vw, 1.43rem);
        }
        .codex-stat-sub-dog {
          margin-top: -4px;
        }
        /* OTOČNÝ BOD — jediná veta sekcie, ktorá netvrdí fakt, ale obviňuje.
           Preto tmavý inkoust namiesto zlatej: obe štatistiky nad ňou sú zlaté,
           takže tretia zlatá by splynula do zoznamu a pointa by zanikla. */
        .codex-turn {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.83rem, 1.23vw, 1.17rem);
          line-height: 1.24;
          letter-spacing: 0.045em;
          text-transform: uppercase;
          color: rgba(35,22,8,0.92);
          /* ZÁMERNE NIE balance. Vyvážené zalomenie dá dva rovnako dlhé riadky
             („AND NOT ONE / OF THEM BOWS.") a ten druhý si posledné slovo položí
             na Hektorovu papuľu — pás je dole užší, nie symetrický. Prirodzené
             zalomenie pri tejto šírke drží obidva riadky pod hranicou psa.
             ⚠️ ŠÍRKA JE ODMERANÁ, NIE ODHADNUTÁ: voľný pás medzi kravou
             a Hektorom má pri y≈570 na 1440px zhruba 225 px (krava končí ~600,
             Hektorova papuľa začína ~825). Preto ~220 px, nie viac. */
          text-wrap: normal;
          /* ⚠️ ŠÍRKA JE TU OBMEDZENIE VÝJAVU, NIE VKUS. Voľný pás medzi kravou
             a Hektorom sa smerom nadol ZUŽUJE (pri y≈600 na 1440px má ~230 px),
             takže jednoriadková veta cez 470 px si posledné dve slová položí na
             tmavého psa a tam zmiznú. Dvojriadkové zalomenie je zároveň lepšia
             dramaturgia — pauza padne presne pred slovo BOWS. */
          max-width: clamp(178px, 15.4vw, 220px);
          /* Pauza pred obvinením je väčšia než rozostupy medzi faktami — je to
             zlom v argumente, nie ďalšia položka zoznamu. */
          margin: clamp(14px, 2.5vh, 32px) 0 0;
          /* Posun DOĽAVA o polovicu tejto hodnoty (centrovaný flex item).
             Voľný pás medzi zvieratami nie je symetrický voči stredu overlayu:
             Hektorova papuľa vyčnieva doľava viac, než krava doprava, takže
             stred pásu leží asi 15 px vľavo od stredu textu. Bez posunu sedí
             „F" v slove OF presne na psom nose. Jednotka je vw zámerne — pes je
             škálovaný k šírke okna, takže posun sa musí hýbať s ním. */
          margin-right: 2.2vw;
          filter: none;
        }
        /* Veta nad tlačidlom. „only" robí z milióna malé číslo vedľa 1,2
           miliardy — pointa je v tom slove, nie vo veľkosti písma, takže
           ostáva tlmená a tlačidlu neuberá. */
        .codex-cta-line {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.68rem, 0.83vw, 0.79rem);
          line-height: 1.38;
          letter-spacing: 0.015em;
          color: rgba(35,22,8,0.72);
          /* JEDEN RIADOK (Matej 28. 8. 2026: *„toto daj do jedneho riadku pod CTA"*).
             ⚠️ Strop šírky sa MUSEL zrušiť, nie zväčšiť: pôvodných ~212 px lámalo
             vetu na tri riadky a akýkoľvek strop len posúva, na ktorom slove sa
             zlomí. Jediné, čo počet riadkov naozaj zaručí, je nowrap.
             ⚠️ Riadok stojí POD tlačidlom, takže je najužším prvkom výjavu —
             na mobile má vlastný strop nižšie. */
          white-space: nowrap;
          margin: 0;
          filter: none;
        }
        .codex-question-big {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-style: normal;
          /* PC: variant A copy zväčšená pre punch (mobile má vlastný override 15px) */
          font-size: clamp(1.01rem, 1.45vw, 1.41rem);
          line-height: 1.35;
          letter-spacing: 0.015em;
          margin: 0;
          max-width: clamp(280px, 32vw, 480px);
          text-wrap: balance;
          color: rgba(35,22,8,0.82);
        }
        .codex-question-big .accent {
          display: block;
          margin-top: 0.4em;
          color: rgba(35,22,8,0.90);
          filter: none;
        }
        /* PC: DOGLOVERS? = bold, zväčšené (hero call) */
        .codex-question-big .q-call {
          display: inline-block;
          font-weight: 700;
          font-size: 1.7em;
          letter-spacing: 0.025em;
        }
        /* PC-only: väčší odstup medzi "bow to the cow" a DOGLOVERS
           (scoped na min-width:768px — mobil je HARD LOCKED, nededí) */
        @media (min-width: 768px) {
          .codex-question-big {
            margin-top: clamp(12px, 1.8vh, 24px);
          }
        }
        /* PC: LET'S WORSHIP OUR DOGS = šírka < tlačítka pod (menšie ako button) */
        .codex-question-big .q-action {
          display: inline-block;
          font-size: 0.65em;
          letter-spacing: 0.1em;
          margin-top: 0.5em;
        }
        /* Micro-copy pod CTA — body font (Space Grotesk), zúžená na šírku tlačítka */
        .codex-microcopy {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 400;
          font-style: normal;
          font-size: clamp(0.58rem, 0.7vw, 0.66rem);
          line-height: 1.4;
          letter-spacing: 0.01em;
          color: rgba(60,40,12,0.62);
          margin: 0;
          max-width: clamp(240px, 22vw, 320px);
          text-wrap: balance;
          text-align: center;
        }
        /* Sub-link pod CTA — sekundárny destination signal */
        .codex-cta-sub {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: clamp(0.59rem, 0.78vw, 0.7rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(201,154,63,0.8);
          text-decoration: none;
          border-bottom: 1px solid rgba(201,154,63,0.35);
          padding-bottom: 2px;
          transition: color 180ms ease, border-color 180ms ease;
        }
        .codex-cta-sub:hover {
          color: #8a5a14;
          border-color: rgba(140,96,20,0.6);
        }
        /* CTA cluster: micro-copy + button + sub-link as a single tight block */
        .codex-cta-cluster {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(10px, 1.4vh, 16px);
        }
        /* ── MOBIL: obmedzenie šírky z PC tu NEPLATÍ ──────────────────────
           Na mobile stoja krava a Hektor POD textom, nie vedľa neho, takže úzky
           pás medzi nimi neexistuje a stiahnutá pointa by tu bola menšia než
           fakty nad ňou — presne to, čo mala oprava odstrániť.
           Nové triedy z 27. 8. 2026; mobilného HARD LOCKu nižšie sa netýkajú. */
        @media (max-width: 767px) {
          .codex-turn {
            font-size: clamp(1.14rem, 5.2vw, 1.42rem);
            max-width: 92%;
            margin-right: 0;
          }
          /* Strop šírky je preč aj tu: pri nowrap nevie zalomiť, len by vetu
             pretlačil von z rámu. Počet riadkov drží nowrap, veľkosť drží clamp
             — pri 320 px vychádza veta na ~223 px, teda sa zmestí. */
          .codex-cta-line {
            font-size: clamp(0.82rem, 3.4vw, 0.95rem);
          }
          /* Na mobile stoja zvieratá POD textom, takže úzky pás neexistuje a
             odsek smie využiť šírku. Centrovanie sa sem tiež vracia — hore
             netreba uhýbať ničomu. */
          .codex-3-overlay.is-v2 {
            justify-content: center;
            padding-top: clamp(48px, 8vh, 92px);
          }
          /* ⚠️ Písmo je na mobile MENŠIE než na PC zámerne. Celý zmysel variantu 2
             je, že jedna veta = jeden riadok; pri väčšom písme sa na 390 px
             odlomí posledné slovo („THE COW.", „A DOG.") a vráti sa presne ten
             rozdrobený vzhľad, kvôli ktorému variant 2 vznikol. */
          .codex-v2 { max-width: 97%; font-size: clamp(0.84rem, 3.66vw, 1.08rem); }
          .codex-v2-close { max-width: 97%; margin-right: 0; font-size: clamp(0.84rem, 3.66vw, 1.08rem); }
          .codex-stat-dog { margin-top: clamp(8px, 1.4vh, 16px); }
        }

        @media (max-width: 767px) {
          /* 🔒🔒 LOCK MOBILE HARD (2026-05-24): Slide 3 mobile HOTOVÝ. NEDOTÝKAŤ SA.
             Cow + Hektor scale/position, padding-top, BOW size, copy variant A,
             microcopy hide — všetko finálne. Úpravy LEN na explicit "zruš lock". */
          .codex-cow {
            height: clamp(72vh, 90vh, 106vh);
            /* Mobile: posun o 20px doprava (left: -14vw + 20px) */
            left: calc(-14vw + 20px);
            /* Mobile: posun o 50px nadol (top: 0 → top: 50px) */
            top: 50px;
            /* Mobile: +5% +15% nad PC scale (1.14 × 1.05 × 1.15 ≈ 1.377) */
            transform: scale(1.377);
            transform-origin: bottom left;
          }
          .codex-hektor {
            height: clamp(72vh, 90vh, 106vh);
            /* Mobile: posun o 30px doľava, potom o 15px doprava (2026-05-31) → -14vw + 15px */
            right: calc(-14vw + 15px);
            /* Mobile: posun o 50px nadol (2026-05-31) */
            top: 50px;
            /* Mobile: +10% +15% −10% nad PC scale, +10% (2026-05-31) → 1.08 × 1.10 × 1.15 × 0.90 × 1.10 ≈ 1.352 */
            transform: scale(1.352);
            transform-origin: bottom right;
          }
          /* Scroll posun (mobile): jemný odsun 25% — okraje ostanú ako rámovanie */
          .codex-bleed:not(.active) .codex-cow {
            transform: translateX(-25%) scale(1.377);
          }
          .codex-bleed:not(.active) .codex-hektor {
            transform: translateX(25%) scale(1.352);
          }
          .codex-3-overlay {
            max-width: 320px;
            gap: 14px;
            /* Mobile: anchor top — match slide 1 headline Y position.
               flex-start + minimal padding-top → content ide čo najvyššie. */
            justify-content: flex-start;
            /* Mobile (2026-06-03, Matej OK): overlay obsah posunutý o +75px nadol */
            padding-top: calc(clamp(10px, 2vh, 24px) + 75px);
            padding-bottom: clamp(20px, 4vh, 40px);
          }
          .codex-stat-number { font-size: clamp(2rem, 12vw, 3rem); }
          .codex-stat-sub {
            /* Mobile: BOW TO THE COW šírkovo ≈ horný riadok „1.2 BILLION" */
            font-size: 1.35rem;
            letter-spacing: 0.08em;
          }
          .codex-question-big { font-size: 15px; line-height: 1.35; }
          /* Mobile: DOGLOVERS + ARE YOU READY = veľký biely bold call.
             LET'S WORSHIP OUR DOGS = jeden riadok normal weight. */
          .codex-question-big .q-call {
            display: inline-block;
            font-size: 1.7rem;
            font-weight: 700;
            /* LAB: na papyruse #fff = neviditeľné. Komentár nad blokom hovorí
               „veľký biely bold call" — v svetlom režime je to veľký ČIERNY. */
            color: rgba(35,22,8,0.90);
            letter-spacing: 0.04em;
            line-height: 1.15;
          }
          .codex-question-big .q-action {
            display: inline-block;
            white-space: nowrap;
            margin-top: 6px;
          }
        }

        /* ── Scroll hint ── */
        .codex-scrollhint {
          position: fixed;
          left: 50%;
          bottom: clamp(14px, 3vh, 28px);
          transform: translateX(-50%);
          appearance: none;
          background: transparent;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 26px;
          line-height: 1;
          color: rgba(201,154,63,0.85);
          filter: drop-shadow(0 1px 2px rgba(110,71,16,0.25));
          opacity: 0;
          pointer-events: none;
          transition: opacity 400ms ease;
          z-index: 6;
        }
        .codex-scrollhint.show {
          opacity: 1;
          pointer-events: auto;
        }
        @media (prefers-reduced-motion: no-preference) {
          .codex-scrollhint.show span {
            display: inline-block;
            animation: codexBounce 1.8s ease-in-out infinite;
          }
        }
        @keyframes codexBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        /* ══ REŽIM FILMU (onepage) ═══════════════════════════════════════════
           Prepnutie z „obrazovka s vlastným scrollom" na „kus dlhého plátna".
           Mení sa VÝHRADNE scroll a výška — rozostupy, typografia a LOCKED
           geometria kravy/Hektora ostávajú netknuté. Všetko je pod .codex-flow,
           takže samostatná /religion-lab aj LabShell ostávajú presne ako boli. */
        /* clip, nie hidden: hidden by z prvku spravil scroll kontajner na OBOCH
           osiach a zvislý scroll filmu by sa oň zasekol. clip oreže a nescrolluje.
           Orezanie tu byť MUSÍ — nesie ho pôvodná stránka cez overflow-hidden
           a drží ním kravu (50vw, left -50px, scale 1.14) a Hektora vnútri.
           Bez neho preteká stránka vodorovne (pri 500 px o 55 px) a telo webu
           dostane bočný scroll, ktorý tam nemá čo robiť. */
        .codex-flow.codex-page { height: auto; overflow-x: clip; overflow-y: visible; }
        .codex-flow .codex-scroll {
          flex: none;
          overflow-x: clip;
          overflow-y: visible;
          height: auto;
          scroll-snap-type: none;
        }
        .codex-flow .codex-section {
          height: auto;
          min-height: 100lvh;
          scroll-snap-align: none;
          scroll-snap-stop: normal;
        }
        /* 🔴 lvh, NIE dvh — vo filme (4. 9. 2026). Mobilný prehliadač pri scrolle
           skrýva adresný riadok, takže dvh počas pohybu rastie a výjav sa pod
           prstom posúva; réžia filmu pritom počíta dráhu z vlastnej, nemennej
           výšky (filmVh v OnePage.tsx). Dve rôzne výšky = text kmitá hore-dole.
           Samostatná stránka /religion si dvh nechala: tá sa nescrolluje. */
        .codex-flow .codex-slider { height: auto; min-height: 100lvh; }
        .codex-flow .codex-slide-3 { height: auto; min-height: 100lvh; }
        /* Bleed (krava + Hektor) je absolute voči STRÁNKE. Tá je v filme vysoká
           tri obrazovky, takže bez výšky by obe zvieratá sadli na spodok
           posledného výjavu — o dve obrazovky nižšie, než majú stáť.
           ⚠️ position sa tu opakuje ZÁMERNE, hoci ho .codex-bleed už má.
           V onepage sú náboženstvo, vízia aj príbeh namontované NARAZ a každý
           z tých súborov nesie vlastný globálny blok s .lab-papyrus > *
           { position: relative }. Tie sa vkladajú neskôr, majú rovnakú
           špecificitu (0,1,0) a pravidlo teda prebijú — z bleedu sa stane prvok
           V TOKU, zaberie celú obrazovku a odsunie výjav o 702 px nadol.
           Dvojtriedny zápis (0,2,0) to prebije späť bez ohľadu na poradie. */
        .codex-flow .codex-bleed {
          /* STICKY, nie absolute — a záporný spodný okraj mu zruší miesto v toku.
             Na pôvodnej stránke je obrazovka pevná, takže krava a Hektor stoja
             samy od seba. Vo filme sa scrolluje: ako absolute im odscrolluje
             spodná hrana do obrazu a pes sa zreže vodorovným rezom v polovici
             tela. Prilepené držia rám výjavu presne ako predtým a vlastnú
             choreografiu (odsun do strán + stlmenie na 0.26, keď sekcia stratí
             .active) si robia ďalej samy.
             ⚠️ position sa tu opakuje zámerne aj kvôli tomu, že .lab-papyrus > *
             z vízie a príbehu prebíja .codex-bleed pri zhodnej špecificite —
             viď komentár v hlavičke tohto bloku. */
          position: sticky;
          top: 0;
          left: 0;
          height: 100lvh;
          margin-bottom: -100lvh;
        }

        /* ── REVEAL PLATÍ AJ VO FILME — okrem PRVÉHO výjavu ────────────────
           🔴 Tu predtým stálo plošné opacity:1 pre celé náboženstvo, teda reveal
           vypnutý natvrdo. Bola to náhrada za chybu, ktorá je odvtedy opravená
           v koreni (triedu .in-view drží React, nie classList — viď observer
           hore). Matej 26. 8. 2026 to vrátil: *„to písmo v 2. sekcii príde mi to
           také suché a nezaujímavé… tá citácia z ústavy sa zasekne… nech je to
           plynulé ako na ostrom webe."*
           PRVÝ výjav (krava a pes) výnimku má a musí ju mať: jeho text nastupuje
           podľa polohy vo filme (--op-txt z OnePage), nie podľa toho, kedy sa
           sekcia objaví. Dve animácie na tom istom texte by sa bili. */
        .codex-flow .codex-section[data-idx="0"] .codex-slide,
        .codex-flow .codex-section[data-idx="0"] .codex-3-overlay > * {
          opacity: 1;
          transform: none;
        }

        /* 🔴 VO FILME BLEDNE UŽ LEN KRAVA (Matej 28. 8. 2026: *„krava začne
           blednúť hneď pri 3. sekcii… zostane viditeľná, ale bude vyblednutá"*
           + *„pes zostane vo farbe"*). Predtým tu viselo spoločné stlmenie
           OBOCH zvierat (--op-bleed) a bývalo na štvrtom obraze — ten zanikol,
           takže by nemalo kde nastať. Hodnota je tá istá 0.26 ako v pôvodnom
           .codex-bleed:not(.active), len ju neurčuje trieda od Reactu, ale
           poloha scrollu, a nesie ju už len jedno z dvoch zvierat.
           ⚠️ Selektor chytá DVA prvky a je to tak správne: CodexHalo who=cow
           si triedu .codex-cow nesie tiez (sklada si ju z propu who),
           takže svätožiara bledne spolu s kravou. Bez toho by nad vyblednutou
           kravou ostal svietiť ostrý prstenec. Hektorova dvojica má
           .codex-hektor a tejto premennej sa teda nedotkne. */
        /* 🔴 A NAJPRV SA MUSÍ ZRUŠIŤ STLMENIE OD TRIEDY. Pôvodná stránka
           stlmuje CELÝ bleed na 0.26, len čo sekcia stratí .active
           (.codex-bleed:not(.active) nižšie) — a vo filme ju stratí hneď na
           druhej obrazovke. Doteraz to prebíjalo spoločné --op-bleed; keď to
           odtiaľ zmizlo, vybledli OBE zvieratá naraz a psovi to zobralo farbu,
           ktorú má podľa zadania mať. Vo filme teda rozhoduje výlučne scroll. */
        /* ── ÚRYVOK ÚSTAVY JE ZAROVNANÝ DO BLOKU, AKO V KNIHE ─────────────
           Matej 28. 8. 2026: *„vieme ten text zarovnať tak aby bol rovnaky po
           okrajoch ako v knihe? a najsť sweet spot kde nebudu velke medzery?"*

           🔑 SWEET SPOT NEROBÍ ŠÍRKA STĹPCA, ALE DELENIE SLOV. Zarovnanie do
           bloku rozťahuje MEDZERY, aby riadok dosadol na pravý okraj — a čím
           dlhšie slová, tým väčšie diery. Slovenčina má SPOLOČNOSTI, NEKONEČNÚ,
           POSTAVENIE; bez delenia ostane v riadku pár slov a medzi nimi
           priepasť. Automatické delenie dovolí slovo zlomiť, takže sa medzery
           rozdelia na viac miest a žiadna nevytrčí.
           ⚠️ Delenie funguje LEN keď prehliadač pozná jazyk — drží ho atribút
           lang na koreni dokumentu, ktorý nastavuje LanguageContext pri každej
           zmene jazyka.
           ⚠️ Vyvažovanie dĺžky riadkov sa musí vypnúť: pri ragged okraji je
           správne, ale proti zarovnaniu do bloku pracuje (riadky sú aj tak
           rovnako dlhé, len sa zúži posledný).
           ⚠️ Posledný riadok ostáva V STREDE — inak by z odseku, ktorý sa končí
           dvoma slovami, ostal osamelý ľavý okraj.
           Platí LEN vo filme; samostatná /religion-lab ostáva, aká bola. */
        .codex-flow .codex-preamble-text {
          text-align: justify;
          text-align-last: center;
          hyphens: auto;
          -webkit-hyphens: auto;
          text-wrap: wrap;
        }

        .codex-flow .codex-bleed { opacity: 1; transition: none; }
        .codex-flow .codex-bleed .codex-cow {
          opacity: var(--op-cow, 1);
          /* ⚠️ TRANSITION MUSÍ BYŤ PREČ. Pôvodná stránka prepína stlmenie
             triedou, takže jej 420 ms zmäkčenie je na mieste. Vo filme hodnotu
             mení SCROLL v každom snímku — a s prechodom sa zvieratá vlečú
             takmer pol sekundy za prstom. Matej to videl presne takto:
             *„pri návrate zostávajú zvieratá na mieste — zasekne sa to."*
             Je to tá istá pasca, akú už má vypnutú posun kravy a Hektora. */
          transition: none;
        }
      `}),!r&&e.jsx(je,{withNav:!0}),ro,e.jsxs("div",{className:"codex-scroll",ref:_,children:[e.jsx("section",{className:`codex-section ${N.has(0)?"in-view":""}`,"data-idx":0,"aria-label":d("religion.aria.question"),ref:t=>{T.current[0]=t},children:e.jsx("div",{className:"codex-slider",children:e.jsx("div",{className:"codex-slide codex-slide-3",children:e.jsxs("div",{className:`codex-3-overlay ${E===2?"is-v2":""}`,style:E===2?{"--n":S}:void 0,children:[E===2?u:null,E===1&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"codex-claim codex-claim-cow",children:[e.jsx("span",{className:"cl-lead",children:d("religion.hook.claim.cowLead")}),e.jsx("span",{className:"cl-figure",children:d("religion.hook.claim.cowFigure")}),e.jsx("span",{className:"cl-unit",children:d("religion.hook.claim.cowUnit")})]}),e.jsxs("div",{className:"codex-claim codex-claim-dog",children:[e.jsx("span",{className:"cl-lead",children:d("religion.hook.claim.dogLead")}),e.jsx("span",{className:"cl-figure cl-figure-void",children:d("religion.hook.claim.dogFigure")})]}),e.jsx("p",{className:"codex-yet",children:d("religion.hook.claim.yet")}),e.jsx("div",{className:"codex-cta-cluster",children:s?e.jsx("button",{type:"button",className:"codex-chip",onClick:p,children:d("religion.hook.claim.goalChip")}):e.jsxs(e.Fragment,{children:[e.jsx(se,{to:"/heroglyph/name",className:"codex-cta",children:d("religion.cta")}),e.jsx("p",{className:"codex-cta-line",children:d("religion.hook.claim.close")})]})})]})]})})})}),e.jsx("section",{className:`codex-section ${N.has(1)?"in-view":""}`,"data-idx":1,"aria-label":d("religion.aria.preamble"),ref:t=>{T.current[1]=t},children:e.jsx("div",{className:"codex-slider",children:e.jsxs("div",{className:"codex-slide",children:[s&&e.jsx("p",{className:"codex-eyebrow",children:d("religion.preamble.eyebrow")}),e.jsx("h1",{className:"codex-headline",children:d("religion.preamble.headlineVerbFirst")==="1"?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"line",children:d("religion.preamble.headlineLine")}),e.jsx("span",{className:"grad",children:d("religion.preamble.headlineGrad")})]}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"grad",children:d("religion.preamble.headlineGrad")}),e.jsx("span",{className:"line",children:d("religion.preamble.headlineLine")})]})}),e.jsxs("div",{className:"codex-preamble-wrap",children:[e.jsx("span",{className:"codex-frame tl","aria-hidden":!0}),e.jsx("span",{className:"codex-frame tr","aria-hidden":!0}),e.jsx("span",{className:"codex-frame bl","aria-hidden":!0}),e.jsx("span",{className:"codex-frame br","aria-hidden":!0}),e.jsx("p",{className:"codex-preamble-text",dangerouslySetInnerHTML:{__html:d("religion.preamble.text")}})]}),!s&&e.jsx("p",{className:"codex-oath-label",children:d("religion.preamble.oath")}),s&&e.jsx("button",{type:"button",className:"codex-chip codex-chip--book",onClick:h,children:d("religion.preamble.bookChip")})]})})}),!s&&e.jsxs("section",{className:`codex-section ${N.has(2)?"in-view":""}`,"data-idx":2,"aria-label":d("religion.aria.sacredIndex"),ref:t=>{T.current[2]=t},children:[!s&&e.jsx("h2",{className:"codex-book-title",children:d("religion.bookTitle")}),e.jsx("div",{className:"codex-slider codex-slider-book",children:e.jsx("div",{className:"codex-slide",children:e.jsx(Jt,{})})})]})]}),!s&&e.jsx("button",{type:"button",className:`codex-scrollhint ${f===0?"show":""}`,onClick:()=>v(1),"aria-label":d("religion.aria.scrollDown"),children:e.jsx("span",{"aria-hidden":!0,children:"▾"})})]})}const co={ara:"ar",chn:"zh-Hans",cs:"cs",deu:"de",en:"en",esp:"es",fra:"fr",ind:"hi",ita:"it",jpn:"ja",kor:"ko",nld:"nl",pol:"pl",prt:"pt",rus:"ru",sk:"sk",tur:"tr",ukr:"uk"};let Ie=null;function po(){return Ie||(Ie=fetch("/data/intro-captions.json").then(r=>r.json())),Ie}let Le=null;function ho(){var s;const r=window;return(s=r.YT)!=null&&s.Player?Promise.resolve():(Le||(Le=new Promise(c=>{const p=r.onYouTubeIframeAPIReady;r.onYouTubeIframeAPIReady=()=>{p==null||p(),c()};const h=document.createElement("script");h.src="https://www.youtube.com/iframe_api",document.head.appendChild(h)})),Le)}function mo({papyrus:r,sheet:s,videos:c,active:p}){const h=g.useRef(null),d=g.useRef([]),b=g.useRef(null),w=g.useRef({from:p,to:p,t:1}),{x:f,y:j,w:N,h:C}=s,_=g.useRef(!0),T=g.useRef(()=>{});return g.useEffect(()=>{const v=w.current;p!==v.to&&(v.from=v.to,v.to=p,v.t=0)},[p]),g.useEffect(()=>{const v=()=>{_.current&&d.current.forEach(y=>y&&y.paused&&y.play().catch(()=>{}))};v();const E={passive:!0,capture:!0};document.addEventListener("touchstart",v,E),document.addEventListener("pointerdown",v,E),document.addEventListener("scroll",v,E);const k=setInterval(v,1e3);return()=>{document.removeEventListener("touchstart",v,E),document.removeEventListener("pointerdown",v,E),document.removeEventListener("scroll",v,E),clearInterval(k)}},[c]),g.useEffect(()=>{const v=h.current;if(!v)return;let E=!0,k=!document.hidden;const y=()=>{const t=E&&k;t!==_.current&&(_.current=t,t?(T.current(),d.current.forEach(o=>o&&o.paused&&o.play().catch(()=>{}))):d.current.forEach(o=>o&&!o.paused&&o.pause()))},S=new IntersectionObserver(t=>{var o;E=((o=t[0])==null?void 0:o.isIntersecting)??!0,y()},{threshold:0});S.observe(v);const u=()=>{k=!document.hidden,y()};return document.addEventListener("visibilitychange",u),()=>{S.disconnect(),document.removeEventListener("visibilitychange",u)}},[]),g.useEffect(()=>{const v=h.current,E=v==null?void 0:v.getContext("2d");if(!v||!E)return;let k=0,y=!1,S=0;const u=.4,t=new Image;t.onload=()=>{v.width=t.naturalWidth,v.height=t.naturalHeight,y=!0},t.src=r,d.current.forEach(n=>n&&n.play().catch(()=>{}));const o=(n,i)=>{const l=d.current[n];if(!l||l.readyState<2||!l.videoWidth||i<=0)return;const m=v.width,x=v.height,A=f*m,P=j*x,z=N*m,I=C*x,O=Math.min(z/l.videoWidth,I/l.videoHeight),D=l.videoWidth*O,V=l.videoHeight*O;let L=b.current;L||(L=document.createElement("canvas"),b.current=L),(L.width!==l.videoWidth||L.height!==l.videoHeight)&&(L.width=l.videoWidth,L.height=l.videoHeight);const $=L.getContext("2d");$&&($.globalCompositeOperation="source-over",$.clearRect(0,0,L.width,L.height),$.drawImage(l,0,0),E.globalAlpha=i,E.globalCompositeOperation="multiply",E.drawImage(L,A+(z-D)/2,P+(I-V)/2,D,V),E.globalAlpha=1,E.globalCompositeOperation="source-over")},a=n=>{if(y){const i=w.current;i.t<1&&(i.t=Math.min(1,i.t+(S?(n-S)/1e3:0)/u)),S=n;const l=v.width,m=v.height;E.globalAlpha=1,E.globalCompositeOperation="source-over",E.clearRect(0,0,l,m),E.drawImage(t,0,0,l,m),i.from!==i.to&&i.t<1&&o(i.from,1-i.t),o(i.to,i.from!==i.to?i.t:1)}k=_.current?requestAnimationFrame(a):0};return k=requestAnimationFrame(a),T.current=()=>{k||(S=0,k=requestAnimationFrame(a))},()=>{cancelAnimationFrame(k),T.current=()=>{}}},[r,f,j,N,C,c]),e.jsxs(e.Fragment,{children:[e.jsx("canvas",{ref:h,className:"wf-scene-canvas","aria-hidden":!0,style:{zIndex:1}}),c.map((v,E)=>v?e.jsx("video",{ref:k=>{d.current[E]=k},src:v,muted:!0,loop:!0,playsInline:!0,autoPlay:!0,preload:"auto","aria-hidden":!0,style:{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",opacity:0,zIndex:0,pointerEvents:"none"}},E):null)]})}const He="#5a3a0c",re=`stroke="${He}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`,qe=`<rect x="0" y="0" width="34" height="46" rx="4" ${re}/><path d="M17 9 l0 28 M9 22 l16 0" ${re}/>`,go=(r="")=>`<svg viewBox="0 0 200 250" ${re}>
  <circle cx="66" cy="70" r="15"/>
  <path d="M66 85 L66 148 M66 100 L48 126 M66 100 L86 122"/>
  <path d="M66 148 L54 198 M66 148 L80 198"/>
  <path d="M118 160 q4 -32 28 -32 q22 0 24 26 l12 2"/>
  <path d="M118 160 l0 38 M130 160 l0 38 M158 152 l2 46 M170 154 l2 44"/>
  <path d="M144 130 l-6 -16 M164 132 l8 -14"/>
  ${r}
</svg>`,uo=`<svg viewBox="0 0 200 250" ${re}>
  <circle cx="74" cy="64" r="17"/>
  <path d="M74 81 L74 150"/>
  <path d="M74 100 L52 126"/>
  <path d="M74 100 L96 118 L86 86 L78 78"/>
  <path d="M74 150 L60 205 M74 150 L88 205"/>
  <path d="M120 205 q2 -40 30 -42 q24 -2 26 26"/>
  <path d="M150 163 q-10 -6 -8 -18 M168 168 q8 -8 4 -18"/>
  <path d="M120 205 l0 -2 M138 205 l0 -10 M176 196 l4 9"/>
  <path d="M150 163 q-14 8 -16 22"/>
  <path d="M146 150 L92 96" stroke-dasharray="3 6" stroke="${He}" opacity="0.5"/>
</svg>`,xo={ankh:'<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M12 11 L12 22 M7 16 L17 16"/></svg>',pyramid:'<svg viewBox="0 0 24 24"><path d="M12 3 L22 21 L2 21 Z M7 12 L17 12"/></svg>',heartpaw:'<svg viewBox="0 0 24 24"><path d="M12 21 C4 15 4 8 8 7 C10 6.5 12 8 12 10 C12 8 14 6.5 16 7 C20 8 20 15 12 21 Z"/></svg>',balance:'<svg viewBox="0 0 24 24"><path d="M12 3 L12 21 M5 21 L19 21 M5 7 L19 7 M5 7 L2 14 L8 14 Z M19 7 L16 14 L22 14 Z"/></svg>'},ge=[{id:"dream",intro:!0,video:"/videos/vision-dream.mp4",figure:"/images/vision/figure-dream.png",svg:uo},{id:"symbol",n:"01",icon:"ankh",video:"/videos/vision-symbol.mp4",svg:go(`<g transform="translate(116,-6)">${qe}</g><path d="M124 22 q-8 -10 -16 -4" ${re}/>`)},{id:"nation",n:"02",video:"/videos/vision-nation.mp4",icon:"pyramid",svg:`<svg viewBox="0 0 200 250" ${re}>${Array.from({length:9}).map((r,s)=>{const c=34+s%3*52,p=50+Math.floor(s/3)*62;return`<rect x="${c}" y="${p}" width="28" height="38" rx="3"/><path d="M${c+14} ${p+7} l0 24 M${c+5} ${p+17} l18 0"/>`}).join("")}</svg>`},{id:"temple",n:"03",video:"/videos/vision-temple.mp4",icon:"heartpaw",svg:`<svg viewBox="0 0 200 250" ${re}><path d="M40 200 l0 -70 l60 -42 l60 42 l0 70 Z"/><path d="M40 130 l60 -42 l60 42"/><rect x="86" y="150" width="28" height="50"/><circle cx="100" cy="58" r="18"/><path d="M100 49 l0 18 M91 58 l18 0"/></svg>`},{id:"centers",n:"04",video:"/videos/vision-centers.mp4",icon:"balance",svg:`<svg viewBox="0 0 200 250" ${re}><ellipse cx="100" cy="158" rx="78" ry="28"/>${Array.from({length:6}).map((r,s)=>{const c=s/6*Math.PI*2,p=100+Math.cos(c)*78,h=158+Math.sin(c)*28;return`<circle cx="${p.toFixed(0)}" cy="${h.toFixed(0)}" r="8"/>`}).join("")}<path d="M100 46 l0 66 M72 64 l56 0 M72 64 l-10 24 l20 0 Z M128 64 l-10 24 l20 0 Z"/></svg>`},{id:"era",n:"05",video:"/videos/vision-era.mp4",icon:"ankh",svg:`<svg viewBox="0 0 200 250" ${re}><g transform="translate(66,86) scale(2)">${qe}</g><path d="M40 60 q60 -40 120 0" stroke-dasharray="2 7" opacity="0.5" stroke="${He}"/></svg>`}],bo=ge.map(r=>r.video??null),Xe={background:"linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:"drop-shadow(0 1px 1px rgba(110,71,16,0.20))"},fo=["b1","b2","b3"];function vo({src:r,poster:s,className:c}){const p=g.useRef(null),[h,d]=g.useState(!1),b=io();return g.useEffect(()=>{const w=p.current;if(!w)return;if(!("IntersectionObserver"in window)){d(!0);return}const f=new IntersectionObserver(j=>{j.some(N=>N.isIntersecting)&&(d(!0),f.disconnect())},{rootMargin:"150% 0px"});return f.observe(w),()=>f.disconnect()},[]),e.jsx("video",{ref:p,className:c,src:h?r:void 0,poster:h||b?s:void 0,autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:h?"auto":"none"})}function wo({embedded:r=!1,flow:s=!1,onWatch:c,heroOnly:p=!1}={}){const h=st(),d=K(),{lang:b}=Re(),w=co[b]??"en",[f,j]=g.useState(null),[N,C]=g.useState(!1),[_,T]=g.useState(""),v=g.useRef(null),E=g.useRef([]),[k,y]=g.useState(typeof window<"u"?window.innerWidth<768:!1);g.useEffect(()=>{const m=()=>y(window.innerWidth<768);return m(),window.addEventListener("resize",m),()=>window.removeEventListener("resize",m)},[]),g.useEffect(()=>{if(!N)return;let m=!1;return po().then(x=>{m||(E.current=x[w]??x.en??[])}).catch(()=>{E.current=[]}),()=>{m=!0}},[N,w]),g.useEffect(()=>{if(!N){T("");return}let m,x=!1;return ho().then(()=>{if(x)return;const A=window.YT,P=()=>{var I,O;const z=v.current;try{(I=z==null?void 0:z.unloadModule)==null||I.call(z,"captions"),(O=z==null?void 0:z.unloadModule)==null||O.call(z,"cc")}catch{}};v.current=new A.Player("yt-intro-frame",{events:{onReady:()=>{P(),m=window.setInterval(()=>{const z=v.current;if(!(z!=null&&z.getCurrentTime))return;const I=z.getCurrentTime(),O=E.current.find(D=>I>=D.s&&I<D.e);T(O?O.t:"")},200)},onStateChange:z=>{z.data===1&&P()}}})}),()=>{var A,P;x=!0,m&&window.clearInterval(m);try{(P=(A=v.current)==null?void 0:A.destroy)==null||P.call(A)}catch{}v.current=null,T("")}},[N]);const S=g.useRef(null),u=g.useRef(null),[t,o]=g.useState(0),[a,n]=g.useState(0),[i,l]=g.useState(!1);return g.useEffect(()=>{const m=S.current;if(!m)return;const x=m.closest(".lsh-scroll")??window,A=x===window,P=()=>x,z=()=>A?window.scrollY:P().scrollTop,I=()=>A?window.innerHeight:P().clientHeight,O=Z=>Z.getBoundingClientRect().top-(A?0:P().getBoundingClientRect().top),D=(Z,H)=>x.scrollTo({top:Z,behavior:H?"smooth":"auto"});let V=!1,L=O(m),$=!1;const M=!s;let q=0,R=z(),B=1;const F=.25;let G=!1;const le=()=>{if(s||G||$||!window.matchMedia("(min-width: 768px)").matches)return;const Z=u.current,H=I(),J=z(),ee=J+O(m),ie=Z?J+O(Z):1/0,te=ie-H,Se=B>0;let ce=null;if(J<ee-4){const de=ee>0?J/ee:0;ce=Se?de>=F?ee:0:de<=1-F?0:ee}else if(J>te+4){const de=Math.max(0,Math.min(1,(J-te)/H));ce=Se?de>=F?ie:te:de<=1-F?te:ie}else return;ce==null||Math.abs(ce-J)<6||(G=!0,D(ce,!0),window.setTimeout(()=>{G=!1},680))};let ne=0;const U=()=>{window.clearTimeout(ne),ne=window.setTimeout(le,120)},ae=()=>{V||(V=!0,requestAnimationFrame(()=>{const Z=I(),H=O(m);z()!==R&&(B=z()>R?1:-1,R=z());const J=m.offsetHeight-Z,ee=z()+H;if(M&&!$&&L>0&&H<=0&&($=!0,q=performance.now()+500),$)if(H>2)$=!1;else{H<-.5&&D(ee,!1),n(0),o(0),l(!0),performance.now()>=q&&($=!1),L=H,V=!1;return}const ie=J>0?Math.max(0,Math.min(1,-H/J)):0;n(ie),o(Math.max(0,Math.min(ge.length-1,Math.floor(ie*ge.length)))),l(te=>!te&&H<Z*.3?!0:te&&H>Z*.55?!1:te),L=H,V=!1}))};return x.addEventListener("scroll",ae,{passive:!0}),x.addEventListener("scroll",U,{passive:!0}),ae(),()=>{x.removeEventListener("scroll",ae),x.removeEventListener("scroll",U),window.clearTimeout(ne)}},[s]),e.jsxs("div",{className:"lab-papyrus vision-root flex flex-col min-h-[100dvh] relative",children:[!r&&e.jsx(Fe,{path:"/vision-lab",title:"The Vision — A World Where No Dog Is Forgotten | DOGYPT",description:"Uniting dog lovers under one philosophy to help dogs in need. This is the vision of DOGYPT, the movement where Dog is God."}),e.jsx("div",{"aria-hidden":!0,className:"lab-pageveil",style:{position:"fixed",inset:0,background:W.pageVeil,zIndex:0,pointerEvents:"none"}}),e.jsx("style",{children:`
        /* ── LAB: papyrusový podklad (tokeny = @/lib/labTheme, zhodné s /religion-lab
           aj WALL LABom). Kotvenie na 100lvh je prevzaté z pôvodnej .dark-bg::before:
           inset:0 by pripol spodok pozadia na spodok viewportu, takže keď sa na mobile
           pri scrolle schová adresný riadok, podklad by sa prepočítal a viditeľne
           poskočil. Veľký viewport drží výšku boxu konštantnú. */
        .lab-papyrus { position: relative; background-color: ${W.pageBg}; }
        .lab-papyrus::before {
          content: '';
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100lvh;
          background: ${W.pageBackdrop};
          z-index: 0;
          pointer-events: none;
        }
        .lab-papyrus > * { position: relative; z-index: 1; }

        /* ── 2-col layout (mobile: flex column with reordered items via display:contents) ── */
        .mission-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(14px, 2.4vh, 22px);
          width: 100%;
          max-width: 1120px;
          text-align: center;
        }
        @media (max-width: 767px) {
          .mission-grid { gap: clamp(18px, 3vh, 30px); }
        }

        /* Mobile-only headline — match /religion .codex-headline mobile size (IN DOG WE TRUST) for cross-page consistency */
        @media (max-width: 767px) {
          .headline-main {
            font-size: 2.8rem !important;
            letter-spacing: 0.03em !important;
            line-height: 1.04 !important;
          }
          .headline-sub {
            font-size: 1.5rem !important;
            letter-spacing: 0.06em !important;
            margin-top: 10px !important;
            white-space: nowrap !important;
          }
        }
        @media (min-width: 768px) {
          .mission-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
            gap: clamp(28px, 4.5vw, 64px);
            align-items: stretch;
            text-align: left;
          }
        }

        /* Body paragraph */
        .mission-para {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.85rem, 1.15vw, 0.98rem);
          font-weight: 400;
          color: rgba(35,22,8,0.82);
          line-height: 1.65;
          letter-spacing: 0.005em;
          margin: 0;
          max-width: 480px;
        }
        @media (max-width: 767px) {
          .mission-para {
            font-size: clamp(15px, 4.4vw, 19px);
            line-height: 1.5;
            max-width: 92%;
            color: rgba(35,22,8,0.86);
            text-align: center;
            text-wrap: balance;
          }
        }

        /* Left column: middle group centered, CTA pinned to bottom (aligns with image bottom edge) */
        .mission-left {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 2.8vh, 28px);
        }
        @media (min-width: 768px) {
          .mission-left {
            gap: clamp(18px, 2.8vh, 26px);
            padding-top: 2px;
            justify-content: flex-start;
          }
        }
        .mission-left-middle {
          display: flex;
          flex-direction: column;
          gap: clamp(18px, 3.2vh, 34px);
        }
        .mission-bottom {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        @media (max-width: 767px) {
          .mission-bottom { align-items: center; }
        }

        /* ── MOBILE: 2 "podlažia" – snap scroll, každá sekcia = jeden viewport ── */
        .m-screen {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (max-width: 767px) {
          .topbar-wrap {
            position: sticky;
            top: 0;
            z-index: 50;
            background: #F8EDD6;
            flex-shrink: 0;
          }
          .mission-grid { gap: 0; max-width: none; }
          .m-screen {
            padding: 0 5vw;
          }
          .m-screen-a {
            justify-content: flex-start;
            padding-top: clamp(24px, 5vh, 48px);
            padding-bottom: clamp(40px, 8vh, 70px);
            gap: clamp(16px, 2.8vh, 24px);
          }
          .m-screen-b {
            justify-content: flex-start;
            padding-top: clamp(10px, 3vh, 28px);
            padding-bottom: clamp(48px, 10vh, 90px);
            gap: clamp(22px, 3.6vh, 32px);
          }
        }
        @media (min-width: 768px) {
          .m-screen { display: contents; }
          /* Sticky top bar across the whole page (incl. the WHAT IF pin section,
           * which is itself sticky). z-index above wf-sticky/progress; soft fade so
           * the dark heroglyph page isn't hard-masked behind the logo + nav. */
          .topbar-wrap {
            position: sticky; top: 0; z-index: 60;
            background: linear-gradient(180deg, rgba(248,237,214,0.96) 58%, rgba(248,237,214,0));
            padding-bottom: 14px;
          }
        }

        /* Desktop: 3 groups in left column with space-between — top group / CTA centered / pills bottom */
        @media (min-width: 768px) {
          .mission-left { justify-content: space-between; }
          .mission-bottom { align-self: flex-start; }
        }
        .mission-subline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.6rem, 0.85vw, 0.72rem);
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(60,40,12,0.52);
          margin: 0;
        }

        /* ── PILLARS (ROADMAP) ── */
        .mission-pillars {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: clamp(4px, 0.55vw, 7px);
          justify-content: flex-start;
        }
        @media (max-width: 767px) {
          .mission-pillars {
            justify-content: center;
            gap: 9px;
            max-width: 92%;
          }
        }
        .mission-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.55rem, 0.85vw, 0.68rem);
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(35,22,8,0.86);
          background: rgba(255,252,244,0.62);
          border: 1px solid rgba(140,96,20,0.60);
          border-radius: 999px;
          padding: 4px 10px;
          white-space: nowrap;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }
        .mission-pill:hover {
          background: rgba(250, 243, 225, 0.20);
          border-color: rgba(250, 243, 225, 0.95);
          transform: translateY(-1px);
        }
        @media (max-width: 767px) {
          .mission-pill {
            font-size: 11px;
            letter-spacing: 0.14em;
            padding: 5px 11px;
            gap: 6px;
            border-radius: 999px;
          }
        }
        .mission-pill-icon {
          width: 13px;
          height: 13px;
          object-fit: contain;
          filter: brightness(0) saturate(100%) invert(96%) sepia(7%)
                  saturate(382%) hue-rotate(355deg) brightness(101%) contrast(96%);
          opacity: 0.85;
        }
        @media (max-width: 767px) {
          .mission-pill-icon { width: 12px; height: 12px; }
          .pill-status-dot { width: 6px; height: 6px; }
        }

        /* Status dot — done (green) / progress (orange pulsing) / future (red) */
        .pill-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .pill-status-dot.done {
          background: #4ADE80;
          box-shadow: 0 0 6px rgba(74, 222, 128, 0.65);
        }
        .pill-status-dot.progress {
          background: #F59E0B;
          box-shadow: 0 0 7px rgba(245, 158, 11, 0.75);
          animation: dotPulse 1.4s ease-in-out infinite;
        }
        .pill-status-dot.future {
          background: #EF4444;
          box-shadow: 0 0 5px rgba(239, 68, 68, 0.45);
          opacity: 0.75;
        }
        .pill-status-dot.goal {
          background: #2E5FD0;
          box-shadow: 0 0 7px rgba(46, 95, 208, 0.75);
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 7px rgba(245, 158, 11, 0.85); }
          50%      { opacity: 0.55; transform: scale(0.78); box-shadow: 0 0 4px rgba(245, 158, 11, 0.45); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pill-status-dot.progress { animation: none; }
        }

        /* Force row break after The App (pill #3) so The Mission starts row 2 */
        .pill-row-break {
          flex-basis: 100%;
          height: 0;
        }
        .pill-row-break-mobile { display: none; }
        .pill-row-break-desktop { display: block; }
        @media (max-width: 767px) {
          .pill-row-break-mobile { display: none; }
          .pill-row-break-desktop { display: none; }
        }

        /* Roadmap connector — papyrus "···" inline */
        .pill-connector {
          display: inline-flex;
          align-items: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.55rem, 0.85vw, 0.7rem);
          color: rgba(60,40,12,0.46);
          letter-spacing: 0.22em;
          padding: 0 2px;
          user-select: none;
          pointer-events: none;
        }

        /* Desktop: per-pill floating tooltip (papyrus + downward arrow) */
        .pill-tooltip-float {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          width: clamp(220px, 22vw, 280px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(140,96,20,0.72);
          border-radius: 10px;
          padding: 9px 13px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          line-height: 1.45;
          letter-spacing: 0.005em;
          text-transform: none;
          color: #1a0a05;
          white-space: normal;
          text-align: left;
          z-index: 20;
          pointer-events: none;
          box-shadow:
            0 12px 36px rgba(110,71,16,0.26),
            0 0 0 3px rgba(201, 154, 63, 0.22);
          animation: tooltipFloatFade 0.18s ease-out;
        }
        .pill-tooltip-float::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-top-color: rgba(140,96,20,0.72);
        }

        /* Mobile: shared block below pills, papyrus styling (matches /heroglyph) */
        .pill-tooltip {
          width: 100%;
          max-width: 360px;
          margin: 4px auto 0;
          padding: 10px 14px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(140,96,20,0.72);
          border-radius: 10px;
          box-shadow:
            0 12px 36px rgba(110,71,16,0.26),
            0 0 0 3px rgba(201, 154, 63, 0.22);
          text-align: left;
          animation: tooltipFade 0.18s ease-out;
        }
        .pill-tooltip-label {
          font-family: 'Cinzel', serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #1a0a05;
          line-height: 1.25;
        }
        .pill-tooltip-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.005em;
          line-height: 1.45;
          color: #4a3010;
          margin-top: 4px;
        }
        @media (max-width: 767px) {
          .pill-tooltip {
            position: absolute;
            top: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            width: max-content;
            max-width: min(360px, 86vw);
            padding: 11px 14px;
            margin: 0;
            z-index: 30;
            cursor: pointer;
          }
          .pill-tooltip-label { font-size: 12px; letter-spacing: 0.10em; }
          .pill-tooltip-text  { font-size: 12px; line-height: 1.45; }
        }
        /* Desktop floating: preserve translateX(-50%) centering during fade */
        @keyframes tooltipFloatFade {
          from { opacity: 0; transform: translate(-50%, -4px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        /* Mobile shared block: opacity-only (no transform on block) */
        @keyframes tooltipFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Active pill state */
        .mission-pill.is-active {
          background: rgba(201, 154, 63, 0.22);
          border-color: rgba(201, 154, 63, 0.95);
        }

        /* ── SQUARE COMPARISON ── */
        .square-frame {
          position: relative;
          width: 100%;
          max-width: min(62vh, 560px);
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 12px 36px rgba(110,71,16,0.26),
            0 0 0 1px rgba(140,96,20,0.28) inset;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .square-frame {
            max-width: 76vw;
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* ── MOBILE: pulsing scroll arrow under headline (section A only) ── */
        .scroll-arrow {
          display: none;
        }
        @media (max-width: 767px) {
          .scroll-arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-top: clamp(6px, 1.4vh, 14px);
            animation: scrollArrowPulse 1.8s ease-in-out infinite;
          }
          .scroll-arrow svg {
            filter: drop-shadow(0 0 6px rgba(255,255,255,0.35));
          }
        }
        @keyframes scrollArrowPulse {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50%      { transform: translateY(7px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-arrow { animation: none; opacity: 0.9; }
        }
        .square-label {
          position: absolute;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.78rem);
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          z-index: 4;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85);
        }
        .square-label.today {
          top: 14px;
          left: 14px;
          color: rgba(60,40,12,0.62);
        }
        .square-label.dogypt {
          bottom: 14px;
          right: 14px;
          color: #F5C73D;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85), 0 0 14px rgba(245,199,61,0.45);
        }

        /* ── CTA — same DNA as /heroglyph ── */
        .mission-cta {
          padding: clamp(11px, 1.7vh, 15px) clamp(28px, 4.4vw, 44px);
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.84rem, 1.2vw, 0.98rem);
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow:
            0 0 24px rgba(255, 200, 90, 0.65),
            0 0 60px rgba(230, 158, 26, 0.50),
            0 0 110px rgba(230, 158, 26, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
          transition: transform 0.2s, box-shadow 0.25s;
          animation: missionCtaPulse 3.2s ease-in-out infinite;
          align-self: flex-start;
        }
        @media (max-width: 767px) {
          .mission-cta {
            align-self: center;
            padding: 13px 34px;
            font-size: 0.95rem;
            letter-spacing: 0.14em;
            margin: clamp(18px, 3.5vh, 30px) 0;
          }
          .mission-pillars { margin-bottom: 0; }
        }
        .mission-cta:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            0 0 150px rgba(230, 158, 26, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .mission-cta:active { transform: scale(0.98); }
        @keyframes missionCtaPulse {
          0%, 100% {
            box-shadow:
              0 0 24px rgba(255, 200, 90, 0.55),
              0 0 60px rgba(230, 158, 26, 0.42),
              0 0 110px rgba(230, 158, 26, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
          }
          50% {
            box-shadow:
              0 0 34px rgba(255, 215, 110, 0.85),
              0 0 84px rgba(230, 158, 26, 0.62),
              0 0 140px rgba(230, 158, 26, 0.38),
              inset 0 1px 0 rgba(255, 255, 255, 0.55);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mission-cta { animation: none; }
        }

        /* ── Eyebrow / overline ── */
        .eyebrow {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.74rem);
          letter-spacing: 0.36em;
          color: rgba(60,40,12,0.52);
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .eyebrow::before {
          content: '';
          height: 1px;
          width: clamp(20px, 3vw, 32px);
          background: rgba(140,96,20,0.45);
        }

        /* ── INTRO VIDEO HERO (top section) ── */
        .vision-video-hero {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(18px, 3vh, 30px);
          padding: clamp(28px, 6vh, 60px) 5vw clamp(36px, 7vh, 72px);
          min-height: calc(100dvh - 72px);
          text-align: center;
        }
        @media (max-width: 767px) {
          /* Fill the band between the sticky top-bar (~89px) and the viewport bottom,
           * then centre the whole hero block within it. */
          .vision-video-hero {
            min-height: calc(100svh - 89px);
            justify-content: center;
            padding-top: clamp(12px, 2vh, 20px);
            padding-bottom: clamp(12px, 2vh, 20px);
            gap: clamp(18px, 3vh, 30px);
          }

        .video-hero-title { font-size: clamp(2.9rem, 12vw, 3.5rem) !important; }
        }

          /* ── ROZDELENÁ OBRAZOVKA JE VEC FILMU, NIE TEJTO STRÁNKY ─────────
           Wrappery sú v základe display: contents, teda pre rozloženie
           NEEXISTUJÚ — samostatná /vision vyzerá presne ako predtým. Dva
           stĺpce, prilepenie a choreografiu im dáva OnePage.tsx (scoped na
           .op-root), lebo to je jeho réžia, nie vlastnosť vízie. */
        .vhero-inner, .vhero-stage { display: contents; }

        /* ── TRI BLOKY (len vo filme) ────────────────────────────────────
           Matej 28. 8. 2026: *„dajme ich teda zlaté a dajme čísla namiesto
           ikoniek čísla v krúžku 1-3… maju byť aktívne pri dotyku myšou"*.
           Predtým to boli takmer neviditeľné bloky s hand-drawn ikonkou
           v lapise — *„otrasne neladia k prostrediu"*. Zlatý rám ich vracia
           k tomu, čím je celý film: papyrus v zlate. */
        .vhero-blocks { display: flex; flex-direction: column; gap: clamp(14px, 2.2vh, 22px); }
        /* Nadpis nesie podčiarknutie, nie inú farbu (Matej: *„ten nadpis by
           trebalo podporiť nejak vizuálne… alebo nejakou čiarou pod… je to
           také prázdne"*). Čiara je brandový prvok — tá istá zlatá vyblednutá
           do strán, aká delí obsah v ústave; iná farba by na obrazovke
           založila druhé zlato. ::after, nie súrodenec: patrí k nadpisu,
           takže musí aj nabiehať s ním. */
        .vhero-h2 {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.9rem, 3.4vw, 3rem);
          letter-spacing: 0.03em;
          line-height: 1;
          margin: 0;
          text-transform: uppercase;
          position: relative;
          padding-bottom: clamp(12px, 1.6vh, 18px);
        }
        .vhero-h2::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: min(220px, 60%);
          height: 2px;
          background: linear-gradient(90deg,
            rgba(201,154,63,0) 0%,
            rgba(201,154,63,0.85) 22%,
            rgba(201,154,63,0.85) 78%,
            rgba(201,154,63,0) 100%);
        }
        .vhero-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: clamp(10px, 1.6vh, 16px); }
        /* ╔═ ZLATÝ BLOK, BLEDÝ HOVER ═ (Matej 28. 8. 2026, 3. kolo) ══════
           *„3 bloky urob zlaté a pri prejdení myšou zblednú a kruh kde je číslo
           bude plný lapis a bledé číslo."* Predchádzajúce kolo dalo blokom len
           zlatý RÁM na papyruse — to už bol nábytok, nie tri kroky.
           Pokoj = ZLATO (konštrukcia), dotyk = LAPIS (moja voľba) — presňe tá
           deliaca čiara z brand manuálu. Krúžok je jediná plná farebná plocha
           a je len JEDEN naraz (hover), takže hlavné CTA obrazovky nemá
           konkurenciu. */
        .vhero-item {
          display: flex;
          /* ⚠️ UŽ NIE center: odkedy má blok chip v rohu a popis na dva riadky, je
             vyšší než krúžok, a stredovanie by mu číslo posunulo doprostred textu.
             Číslo patrí k PRVÉMU riadku — je to poradie, nie ozdoba vedľa odseku. */
          align-items: flex-start;
          position: relative;
          gap: clamp(12px, 1.4vw, 18px);
          padding: clamp(12px, 1.7vh, 18px) clamp(14px, 1.4vw, 20px);
          border-radius: 14px;
          /* ⚠️ BRANDOVÁ ZLATÁ, NIE ORANŽOVÁ (Matej 28. 8. 2026: *„myslel som zlatu
             tmavu brand — nie zlatu oranžovu, tato zlata oranžová je ainubisova"*).
             Prvé kolo siahlo po gradiente z .btn-gold (#F5C73D→#E69E1A) — ten je
             LOCKED pre CTA tlačidlo, ale ako VÝPLŇ celého bloku je z neho žltá
             plocha, ktorú si Matej spája s AINUBISOM. Rampa dole stojí na tokene
             #C99A3F a na tých istých zastávkach ako TITLE_GRAD nadpisov. */
          background: linear-gradient(140deg, #D6AC55 0%, #C99A3F 46%, #A3782B 100%);
          border: 1.5px solid #8C6014;
          /* ⚠️ ŠTYRI VRSTVY, KAŽDÁ NIEČO INÉ — bez nich je to plochý obdĺžnik.
             1) vrhnutý tieň = blok leží NAD papyrusom
             2) tvrdá spodná hrana = jeho HRÚBKA (bez nej nemá bok)
             3) horný inset highlight = svetlo zhora
             4) spodné inset zatienenie = zaguľatenie plochy dole.
             Zrno pridáva .vhero-item::before nižšie: bez neho je to farba, nie materiál. */
          box-shadow:
            0 12px 26px -14px rgba(70,44,6,0.60),
            0 2px 0 rgba(110,71,16,0.55),
            inset 0 1px 0 rgba(255,246,222,0.55),
            inset 0 -12px 20px -14px rgba(70,44,6,0.55);
          /* ⚠️ Prechod smie byť KRÁTKY a smie viesť len na hover. Vo filme
             mení krytie blokov scroll v každom snímku — dlhší prechod by sa
             za prstom vliekol, tá istá pasca ako pri zvieratách. */
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
        }
        /* Hover = blok ZBLEDNE na papyrus. Nie stmavne a nezosvetlí sa — vymení
           si úlohu s krúžkom, takže z troch rovnakých zlatých pruhov vystúpi práve
           ten jeden, na ktorom stojí myš. */
        .vhero-item:hover {
          transform: translateY(-3px);
          background: linear-gradient(140deg, #FDF8EC 0%, #F3E7CE 100%);
          border-color: #C99A3F;
          box-shadow:
            0 18px 34px -14px rgba(110,71,16,0.55),
            0 2px 0 rgba(201,154,63,0.45),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -10px 18px -14px rgba(140,96,20,0.40);
        }
        /* ⚠️ SLOVESO MUSÍ MAŤ HOVER VARIANT, INAK NA PAPYRUSE ZANIKNE
           (Matej 28. 8. 2026: *„chipy pri dotyku myšou zanikaju ako aj prve slovo"*).
           Je BLEDÉ na zlatom — a hover blok zbledne, teda bledé na bledom. Ide preto
           do LAPISU a drží pár s krúžkom, ktorý sa v tej istej chvíli tiež stáva
           lapisovým. Chip tento problém už nemá: je lapisový natrvalo. */
        .vhero-item:hover .vhero-v {
          color: ${Y.edge};
          text-shadow: none;
        }
        /* Číslo v krúžku — poradie, nie ozdoba. Cinzel, lebo je to identita
           kroku; Space Grotesk by z neho spravil údaj. */
        .vhero-num {
          flex: 0 0 auto;
          width: clamp(30px, 2.4vw, 36px);
          height: clamp(30px, 2.4vw, 36px);
          border-radius: 999px;
          border: 1.5px solid #C99A3F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.95rem, 1.1vw, 1.1rem);
          line-height: 1;
          /* ⚠️ PAPYRUS, NIE BIELA (Matej 28. 8. 2026: *„tie čísla daj do papyrusovej farby
             nie bielej"*). Pôvodné #FDF8EC→#F6EAD0 je takmer biele a na zlate to bol
             svetelný bod, nie súčasť dosky. Radiálny gradient so svetlom vľavo hore
             + inset tieň dole = guľôčka, nie kruh. */
          color: #5A3B0E;
          background: radial-gradient(120% 120% at 32% 26%, #F7ECD2 0%, #EBD9AF 55%, #D9C08C 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,252,244,0.85),
            inset 0 -3px 6px -3px rgba(110,71,16,0.55),
            0 2px 4px -1px rgba(70,44,6,0.45);
          transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }
        /* ⚠️ Farby lapisu sa NEOPÍSUJÚ — LAPIS v navGoldSkin.ts je jediný
           zdroj (brand kánon 28. 8. 2026). Číslo je BLEDÉ, nie zlaté
           (LAPIS.ink): tak si to Matej vypýtal a na 30 px krúžku je papyrus
           čitateľnejší než zlato na modrej. */
        .vhero-item:hover .vhero-num {
          background: radial-gradient(120% 120% at 32% 26%, #2A4CA8 0%, ${Y.edge} 55%, ${Y.deep} 100%);
          border-color: ${Y.deep};
          color: #F3E4C4;
          box-shadow:
            inset 0 1px 0 rgba(201,154,63,0.38),
            inset 0 -3px 7px -3px rgba(0,0,0,0.55),
            0 3px 8px -2px rgba(5,15,48,0.60);
        }
        /* Zrno — 3 % šumu upečené do SVG, nie samostatná priehľadnosť. Robí z plochy
           materiál; bez neho vyzerá zlato ako výplň vo Figme. */
        .vhero-item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
          opacity: 0.35;
          transition: opacity 160ms ease;
        }
        .vhero-item:hover::before { opacity: 0.16; }
        .vhero-item > * { position: relative; z-index: 1; }
        .vhero-txt { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .vhero-t {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1rem, 1.25vw, 1.22rem);
          letter-spacing: 0.015em;
          color: #2a1608;
          /* Rezerva pre chip — ten je absolútny, takže si miesto sám nevypýta. */
          padding-right: clamp(120px, 11vw, 170px);
        }
        /* SLOVESO — bledé na zlatom (Matej 28. 8. 2026: *„vždy na začiatku bude slovo —
           spojiť, vytvoriť, pomáhať, ktoré by mohlo byť výraznejšie? bledé na tom
           zlatom?"*). Nie väčšie a nie iná rodina: v jednej vete by druhá veľkosť
           spravila dva nadpisy. Rozdiel nesie SVETLOSŤ a preto sa dá čítať aj to,
           že sloveso a zvyšok vety patria k sebe. */
        .vhero-v {
          font-style: normal;
          color: #FBF5E6;
          /* ⚠️ VÝRAZNOSŤ NESIE OBRYS, NIE FARBA — a je to fyzika, nie vkus. Zlato
             #C99A3F má relatívnu luminanciu 0.34, takže NAJVYŠŠÍ možný kontrast bledej
             na ňom je 2,7:1 (odmerané: 2,36). Nad to sa svetlejšou farbou dostať nedá.
             Preto dve BLÍZKE vrstvy tieňa — tvrdá hrana o 1 px + mäkké lôžko; blízke
             vrstvy sa sčítavajú, širšie rozostrenie by len zriedlo. */
          text-shadow: 0 1px 0 rgba(70,44,6,0.55), 0 2px 5px rgba(70,44,6,0.45);
          letter-spacing: 0.05em;
        }
        /* CHIP — výsledok bloku, papyrusový štítok na zlatej doske. Absolútny, aby
           nevstupoval do lámania nadpisu; nadpis mu drží miesto vlastným padding-right. */
        .vhero-chip {
          position: absolute;
          top: clamp(8px, 1vh, 12px);
          right: clamp(10px, 1vw, 14px);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: clamp(0.56rem, 0.62vw, 0.68rem);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          /* ⚠️ LAPISOVÁ PILULKA, A HOVEROM SA NEMENÍ (Matej 28. 8. 2026: *„chipy urobiť
             tmavo modré lapisové — tie sa nebudú hoverom meniť = modrý pils, bledé
             písmo"*). Tým odpadol celý predošlý problém: chip bol papyrusový, teda
             menil sa spolu s doskou a na vybledenom bloku zanikal. Vlastná farba,
             ktorú doska nemá ani v jednom stave, ho drží čitateľný v oboch — a je to
             menej pohyblivých častí, nie viac.
             Písmo je BLEDÉ (papyrus), nie zlaté LAPIS.ink: pri 9 px je zlato na modrej
             mäkké a Matej pýtal bledé. To isté #F3E4C4 nesie číslo v lapisovom krúžku,
             takže obe modré veci hovoria jedným inkoustom. */
          color: #F3E4C4;
          background: ${Y.grad};
          border: 1px solid ${Y.deep};
          box-shadow: inset 0 1px 0 rgba(201,154,63,0.30), 0 2px 5px -2px rgba(5,15,48,0.55);
          border-radius: 999px;
          padding: 3px 9px;
          white-space: nowrap;
          line-height: 1.2;
        }
        .vhero-d {
          font-size: clamp(0.86rem, 0.95vw, 1rem);
          line-height: 1.5;
          /* Na zlatom podklade je 0.72 už šedý závoj — rovnaký text potrebuje
             na žltej plyši tmavší inkoust než na papyruse. */
          color: rgba(38,23,4,0.88);
        }
        @media (max-width: 767px) {
          .vhero-item { padding: 12px 13px; gap: 11px; border-radius: 12px; }
          /* 🚩 CHIP JE NA MOBILE SKRYTÝ A JE TO VEDOMÉ ROZHODNUTIE, NIE OPOMENUTIE.
             Odmerané pri 390 x 844: hero vízie (video + nadpis + tri bloky v jednej
             prilepenej obrazovke) meria BEZ chipu presne 840 px, teda 100 % okna —
             nula rezervy. Vedľa nadpisu sa chip na 386 px nezmestí, takže by musel mať
             vlastný riadok: +28 px na blok, +84 px spolu, a hero by pretieklo o 100 px.
             Zmenšovaním výplní a písma sa dá získať ~40 px, teda ani polovica.
             Obsah chipu je pritom ZHRNUTIE bloku, ktorý na mobile stojí hneď pod ním —
             na malej obrazovke nepridáva informáciu, len výšku.
             ⇒ Mobilná vízia potrebuje vlastný prechod (rovnako ako celý zvyšok filmu:
             „MOBIL NIE JE ZMENŠENÉ PC"); dovtedy chip patrí PC. */
          .vhero-chip { display: none; }
          .vhero-t { padding-right: 0; }
          .vhero-h2 { font-size: clamp(1.7rem, 8vw, 2.3rem); }
          .vhero-num { width: 28px; height: 28px; font-size: 0.92rem; }
        }
        /* Desktop: sticky topbar (~72px) sits in-flow above the hero, so centering
         * within (100dvh − 72px) pushes the optical centre ~36px below the true
         * viewport centre → looks low under the fading topbar. Bias content up via
         * a heavier bottom padding so it sits at the real viewport centre. */
        @media (min-width: 768px) {
          .vision-video-hero {
            padding-top: clamp(14px, 2vh, 26px);
            padding-bottom: clamp(84px, 11vh, 130px);
          }
        }
        .video-hero-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          letter-spacing: 0.03em;
          line-height: 1;
          margin: 0;
          text-transform: uppercase;
        }
        .video-embed-frame {
          position: relative;
          /* Cap by viewport height too, so the whole frame stays visible on short
           * laptops (reserve ~330px for topbar + nav + title + caption + padding).
           * Dolná poistka na 320px: na telefóne naležato je 100dvh len ~390px,
           * takže samotný calc() by zrazil šírku na pár px (poštová známka). */
          width: min(680px, 100%, max(320px, calc((100dvh - 330px) * 16 / 9)));
          aspect-ratio: 16 / 9;
          border-radius: 14px;
          overflow: hidden;
          background: #000;
          box-shadow:
            0 0 0 1.5px rgba(140,96,20,0.60),
            0 14px 40px rgba(110,71,16,0.28),
            0 0 60px 6px rgba(201,154,63,0.16);
          transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.45s ease;
        }
        /* Po kliku na "Watch ..." → náhľad sa zväčší + spustí prehrávanie */
        .video-embed-frame.is-playing {
          /* Rovnaká dolná poistka ako pri náhľade vyššie. */
          width: min(980px, 100%, max(320px, calc((100dvh - 330px) * 16 / 9)));
          box-shadow:
            0 0 0 1.5px rgba(140,96,20,0.72),
            0 18px 52px rgba(110,71,16,0.32),
            0 0 80px 10px rgba(201,154,63,0.20);
        }
        .video-embed-frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        /* Vlastný titulkový overlay — posadený NAD vpálený news-chyron videa
           (YT vlastné titulky sú vypnuté cez cc_load_policy=0). */
        .intro-caption {
          position: absolute;
          left: 50%;
          bottom: 19%;
          transform: translateX(-50%);
          width: min(92%, 600px);
          text-align: center;
          pointer-events: none;
          z-index: 3;
        }
        .intro-caption span {
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
          background: rgba(0, 0, 0, 0.62);
          color: #fff;
          font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
          font-weight: 600;
          font-size: clamp(0.78rem, 1.9vw, 1.02rem);
          line-height: 1.5;
          letter-spacing: 0.004em;
          padding: 0.1em 0.4em;
          border-radius: 5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
        }
        /* Clean facade poster — no YouTube chrome until played */
        .video-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: #000;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }
        .video-poster img,
        .video-bg-loop {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* ⚠️ SLUČKA JE MIERNE PRIBLÍŽENÁ — ORIEZKA CHYBY V SÚBORE, NIE ŠTÝL.
           Matej 28. 8. 2026: *„vo videu je chyba a niekde je vidno spodná hranica
           milimetrová napr čierna čo vyzerá zle"* — vision-intro-montage.mp4 má
           na niektorých záberoch po spodnej hrane tenký čierny prúžok, ktorý pri
           object-fit: cover dosadne presne na okraj rámu a číta sa ako chyba
           vykreslenia.
           2 % ROVNOMERNE, nie scaleY: vertikálne to ubere ~1 % zhora aj zdola,
           čo prúžok pokryje aj na najväčšom pláťne, a pomer strán ostane. ScaleY
           by obraz roztiahol a na tvárach je to vidieť.
           🔑 Sedí TU, nie vo filme: je to vlastnosť ASSETU, takže platí všade,
           kde sa slučka prehráva (aj samostatná /vision). Keď sa súbor
           preexportuje bez prúžku, zmizne aj toto pravidlo.
           ⚠️ Netýka sa YouTube iframe — ten má vlastný obraz a zväčšenie by
           orezalo jeho ovládanie. */
        .video-bg-loop { transform: scale(1.02); }
        /* Dark overlay so the looping bg video doesn't glare */
        .video-poster::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1;
          pointer-events: none;
        }
        .video-play-btn {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(64px, 9vw, 84px);
          height: clamp(64px, 9vw, 84px);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(2px);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .video-play-btn svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 10px rgba(201, 154, 63, 0.55));
        }
        .video-poster:hover .video-play-btn {
          transform: scale(1.08);
          background: rgba(0, 0, 0, 0.45);
        }
        .video-poster:active .video-play-btn { transform: scale(0.97); }
        .video-hero-caption {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.64rem, 0.98vw, 0.82rem);
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(60,40,12,0.62);
          margin: 0;
          padding: 4px 2px;
          background: none;
          border: 0;
          cursor: pointer;
          display: inline-block;
          text-decoration: underline;
          text-decoration-color: rgba(140,96,20,0.60);
          text-decoration-thickness: 1px;
          text-underline-offset: 0.34em;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.2s ease, text-decoration-color 0.2s ease;
        }
        .video-hero-caption::before {
          content: '\\25B6';
          font-size: 0.7em;
          color: #8a5a14;
          margin-right: 9px;
          display: inline-block;
        }
        .video-hero-caption:hover {
          color: #8a5a14;
          text-decoration-color: #8a5a14;
        }
        .video-hero-caption:hover::before { color: #8a5a14; }

        /* Content area below the video — own viewport band on desktop */
        .vision-content-area { width: 100%; }
        @media (min-width: 768px) {
          .vision-content-area {
            min-height: 100dvh;
            padding-top: 40px;
            padding-bottom: 60px;
          }
        }

        /* ===== WHAT IF… pinned scrollytelling roadmap ===== */
        .wf-pin { position: relative; } /* tall: height = beats*100vh (inline) */

        /* Scroll-snap (desktop): the hand-off from the video hero (slide 1) to the
         * WHAT IF section (slide 2) snaps — you can't rest between them, the second
         * screen is pulled in and fixes. snap-stop:always forces a stop at wf-pin's
         * start (= pin engages). Inside the 600vh pin there are no further snap points,
         * so the beats scroll freely. Style only lives while /vision is mounted. */
        @media (min-width: 768px) {
          html { scroll-snap-type: y proximity; }
          /* NB: NO snap-align on the hero — it would snap the page down by the topbar
           * height on load and hide the menu. Only the WHAT IF section is a snap point. */
          .wf-pin { scroll-snap-align: start; scroll-snap-stop: always; }
        }
        .wf-sticky {
          position: sticky; top: 0; height: 100vh; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .wf-hint {
          position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
          font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 0.24em;
          text-transform: uppercase; color: rgba(60,40,12,0.46); z-index: 4;
        }
        .wf-grid {
          flex: 1; display: grid; grid-template-columns: 2.1fr 1fr;
          align-items: center; align-content: center; gap: clamp(18px, 3vw, 44px);
          max-width: 1480px; width: 100%; margin: 0 auto;
          /* top clears the sticky header, bottom clears the progress bar → the auto-height
           * row centres in the band between them instead of pinning to the top */
          padding: 84px clamp(20px, 5vw, 56px) 64px;
        }

        /* LEFT — papyrus scroll (rolled ends; colours from /religion .codex-paper) */
        .wf-scroll-col { display: flex; align-items: center; justify-content: center; }
        /* Big papyrus area — each beat is a self-contained baked papyrus+scene image
         * (square, on black) OR a fallback realistic-papyrus PNG + doodle. */
        .wf-papyrus {
          /* ╔═══ LOCKED 2026-06-03 (Matej OK: "toto je tá správna poloha") ═══╗
           * Poloha + rozmer papyrusu na PC pre VŠETKY beaty (zdieľaný kontajner).
           * NEMENIŤ bez výslovného OK:
           *   height: 68vh · width: calc(68vh * 815/892) · top: 25px · flex-shrink: 0
           *   (+ .wf-grid: align-content:center, padding 84px/64px)
           * Height-driven + EXPLICIT calc width (NIE aspect-ratio+auto — flexbox by
           * zrútil šírku). Papyrus PNG je orezaný natesno (815×892).
           * ╚════════════════════════════════════════════════════════════════╝ */
          position: relative; flex-shrink: 0; top: 25px;
          height: 68vh; width: calc(68vh * 815 / 892); max-width: 100%;
          margin: 0 auto;
        }
        .wf-illus {
          position: absolute; inset: 0; opacity: 0;
          transform: scale(0.97) translateY(8px);
          transition: opacity .5s ease, transform .5s ease;
        }
        /* Baked papyrus+scene image (or video) fills the whole area */
        .wf-scene-full { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
        /* Canvas beat: papyrus PNG + figure-on-white multiplied (see PapyrusStage).
         * Container aspect == papyrus aspect → canvas fills edge-to-edge, transparent
         * surround lets the dark page show around the rolled scroll (no box). */
        .wf-scene-canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
        /* Fallback: realistic papyrus frame + doodle inset to the writable sheet body */
        .wf-scroll-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1; }
        .wf-sheet-inner {
          position: absolute; z-index: 2;
          /* inset to the writable sheet of papyrus-scroll.webp (measured) + extra margin
           * so the figure sits in the middle, clear of the rolls and curled side edges */
          top: 22%; bottom: 24%; left: 29%; right: 29%;
          display: flex; align-items: center; justify-content: center;
        }
        .wf-fig { width: 100%; height: 100%; object-fit: contain; }
        .wf-illus.on { opacity: 1; transform: scale(1) translateY(0); }
        .wf-illus .wf-art { width: 100%; height: 100%; }
        .wf-illus .wf-art svg { width: 100%; height: 100%; }

        /* Ink self-draw: line-art strokes draw themselves when the beat activates.
         * Fixed dasharray (doodles are small) → each stroke reveals from 0; sub-strokes
         * stagger via nth-child so the drawing builds piece by piece. Re-runs each beat
         * because the .on class toggles on/off as wfState changes. */
        .wf-illus .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) {
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
        }
        .wf-illus.on .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) {
          animation: wfInkDraw 0.8s cubic-bezier(0.55, 0, 0.45, 1) forwards;
        }
        .wf-illus.on .wf-art svg > *:nth-child(1)  { animation-delay: 0.10s; }
        .wf-illus.on .wf-art svg > *:nth-child(2)  { animation-delay: 0.18s; }
        .wf-illus.on .wf-art svg > *:nth-child(3)  { animation-delay: 0.26s; }
        .wf-illus.on .wf-art svg > *:nth-child(4)  { animation-delay: 0.33s; }
        .wf-illus.on .wf-art svg > *:nth-child(5)  { animation-delay: 0.40s; }
        .wf-illus.on .wf-art svg > *:nth-child(6)  { animation-delay: 0.46s; }
        .wf-illus.on .wf-art svg > *:nth-child(7)  { animation-delay: 0.52s; }
        .wf-illus.on .wf-art svg > *:nth-child(8)  { animation-delay: 0.58s; }
        .wf-illus.on .wf-art svg > *:nth-child(9)  { animation-delay: 0.63s; }
        .wf-illus.on .wf-art svg > *:nth-child(n+10) { animation-delay: 0.68s; }
        @keyframes wfInkDraw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .wf-illus .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) {
            stroke-dashoffset: 0;
            animation: none;
          }
        }
        .wf-note {
          position: absolute; bottom: 8px; left: 0; right: 0; text-align: center; z-index: 3;
          font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(90,58,12,0.4);
        }

        /* RIGHT — dark text column */
        .wf-text { position: relative; min-height: 360px; }
        /* Desktop: pull the text column left toward the (locked) papyrus — kills the
         * dead space between the centred scroll and the copy. Papyrus is NOT moved. */
        @media (min-width: 768px) {
          .wf-text { margin-left: clamp(-220px, -9vw, -90px); }
        }
        .wf-block {
          position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center;
          opacity: 0; transition: opacity .4s ease;
          pointer-events: none;
        }
        .wf-block.on { opacity: 1; pointer-events: auto; }
        /* Gradual text reveal — each line rises in sequence when the beat activates.
         * Motion lives on the children (block fades only) so lines cascade one by one;
         * re-runs each beat via the .on toggle. */
        .wf-block.on > * { animation: wfRise .55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .wf-block.on > *:nth-child(1) { animation-delay: 0.08s; }
        .wf-block.on > *:nth-child(2) { animation-delay: 0.20s; }
        .wf-block.on > *:nth-child(3) { animation-delay: 0.32s; }
        .wf-block.on > *:nth-child(4) { animation-delay: 0.44s; }
        .wf-block.on > *:nth-child(5) { animation-delay: 0.56s; }
        @keyframes wfRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .wf-block.on > * { animation: none; }
        }

        /* ── SLIDE 1 → SLIDE 2 entrance (armed by JS .wf-armed when section enters pin range) ──
         * Papyrus unrolls top→bottom, the first beat's ink + text reveal as the entry
         * (held until armed so they don't play off-screen at mount), WHAT IF title blurs in. */
        .wf-sticky:not(.wf-armed) .wf-papyrus { clip-path: inset(0 0 100% 0); opacity: 0; }
        .wf-sticky.wf-armed .wf-papyrus { animation: wfUnroll 1s cubic-bezier(0.72, 0, 0.24, 1) both; }
        @keyframes wfUnroll {
          0%   { clip-path: inset(0 0 100% 0); opacity: 0; transform: translateY(-16px); }
          30%  { opacity: 1; }
          100% { clip-path: inset(0 0 0 0);    opacity: 1; transform: translateY(0); }
        }
        .wf-sticky:not(.wf-armed) .wf-illus.on .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) { animation: none; }
        .wf-sticky:not(.wf-armed) .wf-block.on > * { animation: none; opacity: 0; }
        .wf-sticky.wf-armed .wf-intro.on .wf-big {
          animation: wfTitleReveal 1.1s cubic-bezier(0.2, 1, 0.3, 1) 0.12s both;
        }
        @keyframes wfTitleReveal {
          from { opacity: 0; transform: translateY(26px) scale(0.93);
                 filter: drop-shadow(0 1px 1px rgba(110,71,16,0.18)) blur(9px); letter-spacing: 0.24em; }
          to   { opacity: 1; transform: none;
                 filter: drop-shadow(0 1px 1px rgba(110,71,16,0.18)) blur(0); letter-spacing: 0.04em; }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-sticky.wf-armed .wf-papyrus,
          .wf-sticky.wf-armed .wf-intro.on .wf-big { animation: none; }
          .wf-sticky:not(.wf-armed) .wf-papyrus { clip-path: none; opacity: 1; }
          .wf-sticky:not(.wf-armed) .wf-block.on > * { opacity: 1; }
        }
        /* Unified headline + lead typography for ALL beats (taken from slide 1) */
        .wf-block .wf-big {
          font-family: 'Cinzel', serif; font-weight: 700;
          /* smaller than before so long SK words (STREDISKÁ, DIGITÁLNY…) don't overflow;
             line-height 1.08 leaves headroom so uppercase carons (Č/Š/É) aren't clipped
             by the background-clip:text line box */
          font-size: clamp(2.6rem, 6.2vw, 4.8rem); line-height: 1.08; letter-spacing: 0.04em;
          white-space: nowrap; /* 2-line white/gold headline, no wrap → max 2 lines */
        }
        .wf-big-w { color: rgba(35,22,8,0.90); }
        .wf-big-g {
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        .wf-block .wf-lead {
          margin-top: 24px; font-style: normal; color: rgba(60,40,12,0.62);
          font-size: clamp(1.05rem, 2.4vw, 1.35rem); line-height: 1.55; max-width: 34ch;
        }
        /* ── LAB: ZLATÁ NATVRDO V SLOVNÍKU ────────────────────────────────
           Reťazec vision.finale.lead nesie zvýraznené slovo ako inline style
           s farbou #F5C73D. Slovník je SPOLOČNÝ s ostrou tmavou /vision, takže
           opraviť to v i18n nejde — prefarbilo by to aj ju. Na papyruse je tá
           žltá takmer neviditeľná, preto sa prebíja tu a len tu.
           (Ten istý vzor má aj sprievodca v /pack. Keď sa raz slovník bude
           čistiť od inline farieb, toto pravidlo padne s ním.) */
        .vf-lead span { color: #8a5a14 !important; }

        /* highlighted key words in the story */
        .wf-lead .wf-hl {
          font-style: italic; font-weight: 600; color: #8a5a14;
        }
        .wf-block .wf-num { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.3em; color: rgba(60,40,12,0.52); margin-bottom: 10px; }
        .wf-block .wf-anchor { font-family: 'Cinzel', serif; font-weight: 700; color: #6E4A12; font-size: clamp(1.8rem, 4.6vw, 3rem); line-height: 1; margin-bottom: 14px; letter-spacing: 0.05em; }
        .wf-block h3 { font-family: 'Cinzel', serif; font-weight: 600; font-size: clamp(1.15rem, 2.6vw, 1.7rem); line-height: 1.25; color: rgba(35,22,8,0.90); margin-bottom: 14px; max-width: 24ch; text-wrap: balance; }
        .wf-block p { font-size: clamp(0.95rem, 2vw, 1.1rem); line-height: 1.6; color: rgba(35,22,8,0.82); max-width: 40ch; margin-bottom: 20px; text-wrap: balance; }
        .wf-mech { display: flex; align-items: center; gap: 11px; padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(140,96,20,0.60); background: rgba(255,252,244,0.62); max-width: 40ch; }
        .wf-mech-ic { flex: 0 0 26px; width: 26px; height: 26px; }
        .wf-mech-ic svg { width: 100%; height: 100%; stroke: #6E4A12; fill: none; stroke-width: 1.6; }
        .wf-mech-txt { font-family: 'Cinzel', serif; font-size: clamp(.8rem, 1.7vw, .95rem); letter-spacing: 0.04em; color: rgba(35,22,8,0.86); font-weight: 600; }

        /* BOTTOM — progress indicator */
        .wf-progress { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 clamp(20px, 5vw, 60px) 26px; max-width: 1240px; margin: 0 auto; z-index: 4; }
        .wf-track { position: relative; height: 3px; background: rgba(140,96,20,0.20); border-radius: 3px; }
        .wf-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: 3px; background: linear-gradient(90deg, rgba(140,96,20,0) 0%, #A3782B 55%, #6E4A12 100%); }
        /* Comet head — glowing tip at the leading edge of the progress fill. The bar
         * gradient (transparent → gold) reads as the trailing tail. */
        .wf-fill::after {
          content: '';
          position: absolute;
          right: -3px;
          top: 50%;
          transform: translateY(-50%);
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: radial-gradient(circle, #D8A93F 0%, #8a5a14 60%, rgba(110,71,16,0) 100%);
          box-shadow:
            0 0 4px 1px rgba(110,71,16,0.45),
            0 0 10px 3px rgba(110,71,16,0.22),
            0 0 18px 6px rgba(140,96,20,0.14);
          animation: wfCometPulse 1.6s ease-in-out infinite;
        }
        @keyframes wfCometPulse {
          0%, 100% { transform: translateY(-50%) scale(1); box-shadow: 0 0 4px 1px rgba(110,71,16,0.45), 0 0 10px 3px rgba(110,71,16,0.22), 0 0 18px 6px rgba(140,96,20,0.14); }
          50% { transform: translateY(-50%) scale(1.18); box-shadow: 0 0 6px 2px rgba(110,71,16,0.55), 0 0 14px 4px rgba(110,71,16,0.26), 0 0 24px 8px rgba(140,96,20,0.16); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-fill::after { animation: none; }
        }
        .wf-steps { display: flex; justify-content: space-between; margin-top: 14px; }
        .wf-step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(60,40,12,0.46); transition: color .3s; }
        .wf-step .wf-knob { display: none; } /* dots removed — comet head carries the progress now */
        .wf-step.done { color: rgba(60,40,12,0.62); }
        .wf-step.active { color: #8a5a14; }

        @media (max-width: 767px) {
          /* DETERMINISTIC top offset (NOT centered): centering pushed the block above
           * the sticky top-bar on short phones (gap went negative). Fixed padding-top =
           * top-bar (~89px) + comfortable gap → papyrus always sits clear of the logo,
           * identical on every viewport height. */
          .wf-grid { grid-template-columns: 1fr; gap: 16px; padding: 120px 20px 40px; align-content: start; }
          .wf-scroll-col { order: -1; }
          .wf-papyrus { height: 54.14vh; width: calc(54.14vh * 815 / 892); max-width: 86%; } /* +10% +15% +7% */
          .wf-text { min-height: 250px; margin-top: 155px; } /* push headline+body below papyrus */
          /* Mobile typography: JOIN white+gold on ONE line (hide <br>, nbsp between) but allow
           * NATURAL wrap (white-space: normal) → short headings stay 1 line, long ones (FUNKČNÉ
           * STREDISKÁ) wrap to 2 at the space. Bigger font than desktop-scaled so it reads well.
           * line-height 1.08 = headroom for uppercase carons (Č/Š/É). */
          .wf-block .wf-big { font-size: clamp(2.1rem, 10vw, 2.9rem); line-height: 1.08; white-space: normal; }
          .wf-block .wf-big br { display: none; }
          .wf-block .wf-big-w::after { content: ' '; } /* breakable space → long heading wraps here */
          .wf-block .wf-lead { font-size: 0.95rem; margin-top: 18px; }
          .wf-steps { display: none; } /* mobile: labels were hidden + dots removed → empty row, drop it (comet bar carries progress) */
          .wf-progress { bottom: 30px; } /* lift the comet status bar up */
        }
        /* Short phones (SE-class): shrink papyrus + lift the top offset so the longest
         * beat's body never spills past the progress bar. */
        @media (max-width: 767px) and (max-height: 740px) {
          .wf-grid { padding-top: 96px; }
          .wf-papyrus { height: 37.45vh; width: calc(37.45vh * 815 / 892); } /* +10% +7% */
          .wf-text { margin-top: 20px; } /* short phones: keep the longest beat clear of the progress bar */
        }
      `}),!r&&e.jsx("div",{className:"topbar-wrap",children:e.jsx(je,{withNav:!0})}),e.jsx("section",{className:"vision-video-hero",style:{zIndex:2},children:e.jsxs("div",{className:"vhero-inner",children:[e.jsxs("div",{className:"vhero-stage",children:[!s&&e.jsx("h1",{className:"video-hero-title",children:e.jsx("span",{style:Xe,children:d("vision.hero.title")})}),e.jsx("div",{className:`video-embed-frame${N?" is-playing":""}`,children:N?e.jsxs(e.Fragment,{children:[e.jsx("iframe",{id:"yt-intro-frame",src:`https://www.youtube-nocookie.com/embed/TwSl_aOwbaY?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white&cc_load_policy=0&enablejsapi=1&origin=${encodeURIComponent(typeof window<"u"?window.location.origin:"")}`,title:d("vision.hero.videoTitle"),allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",allowFullScreen:!0}),_&&e.jsx("div",{className:"intro-caption","aria-hidden":!0,children:e.jsx("span",{children:_})})]}):e.jsxs("button",{type:"button",className:"video-poster",onClick:()=>{C(!0),c==null||c()},"aria-label":d("vision.hero.playLabel"),children:[e.jsx(vo,{className:"video-bg-loop",src:"/videos/vision-intro-montage.mp4",poster:"/images/mission/intro-poster.webp"}),e.jsx("span",{className:"video-play-btn","aria-hidden":!0,children:e.jsxs("svg",{viewBox:"0 0 72 72",width:"72",height:"72",children:[e.jsx("circle",{cx:"36",cy:"36",r:"34",fill:"none",stroke:"#C99A3F",strokeWidth:"2.5"}),e.jsx("path",{d:"M29 25 L51 36 L29 47 Z",fill:"none",stroke:"#C99A3F",strokeWidth:"2.5",strokeLinejoin:"round"})]})})]})}),!N&&e.jsx("button",{type:"button",className:"video-hero-caption",onClick:()=>{C(!0),c==null||c()},children:d("vision.hero.watch")})]}),s&&e.jsxs("div",{className:"vhero-blocks",children:[e.jsx("h2",{className:"vhero-h2",children:e.jsx("span",{style:Xe,children:d("vision.hero.title")})}),e.jsx("ol",{className:"vhero-list",children:fo.map((m,x)=>e.jsxs("li",{className:"vhero-item",style:{"--vb-at":x+1},children:[e.jsx("span",{className:"vhero-num","aria-hidden":!0,children:x+1}),e.jsxs("span",{className:"vhero-txt",children:[e.jsxs("b",{className:"vhero-t",children:[e.jsx("em",{className:"vhero-v",children:d(`vision.hero.${m}.v`)})," ",d(`vision.hero.${m}.t`)]}),e.jsx("span",{className:"vhero-d",children:d(`vision.hero.${m}.d`)})]}),e.jsx("span",{className:"vhero-chip",children:d(`vision.hero.${m}.c`)})]},m))})]})]})}),!p&&e.jsxs(e.Fragment,{children:[e.jsx("section",{className:"wf-pin",ref:S,style:{height:`${ge.length*100}vh`,zIndex:2},children:e.jsxs("div",{className:`wf-sticky${i?" wf-armed":""}`,children:[e.jsxs("div",{className:"wf-grid",children:[e.jsx("div",{className:"wf-scroll-col",children:e.jsx("div",{className:"wf-papyrus",children:e.jsx(mo,{papyrus:"/images/vision/papyrus-vision.webp",sheet:{x:.1,y:.15,w:.8,h:.71},videos:bo,active:t})})}),e.jsx("div",{className:"wf-text",children:ge.map((m,x)=>e.jsxs("div",{className:`wf-block${m.intro?" wf-intro":""}${t===x?" on":""}`,"aria-hidden":t!==x,children:[e.jsxs("div",{className:"wf-big",children:[e.jsx("span",{className:"wf-big-w",children:d(`vision.beat.${m.id}.bigW`)}),e.jsx("br",{}),e.jsx("span",{className:"wf-big-g",children:d(`vision.beat.${m.id}.bigG`)})]}),m.intro?e.jsx("div",{className:"wf-lead",dangerouslySetInnerHTML:{__html:d("vision.intro.lead")}}):e.jsx("div",{className:"wf-lead",dangerouslySetInnerHTML:{__html:d(`vision.beat.${m.id}.h`)}}),m.mech&&e.jsxs("div",{className:"wf-mech",children:[e.jsx("span",{className:"wf-mech-ic",dangerouslySetInnerHTML:{__html:xo[m.icon??"ankh"]}}),e.jsxs("span",{className:"wf-mech-txt",children:["→ ",m.mech]})]})]},m.id))})]}),e.jsxs("div",{className:"wf-progress",children:[e.jsx("div",{className:"wf-track",children:e.jsx("div",{className:"wf-fill",style:{width:`${(a*100).toFixed(1)}%`}})}),e.jsx("div",{className:"wf-steps",children:ge.map((m,x)=>e.jsxs("div",{className:`wf-step${t===x?" active":""}${x<t?" done":""}`,children:[e.jsx("span",{className:"wf-knob"}),e.jsx("span",{className:"wf-step-label",children:d(`vision.beat.${m.id}.tag`)})]},m.id))})]})]})}),e.jsxs("section",{ref:u,className:"vision-finale flex flex-col items-center justify-center text-center px-6",style:{zIndex:2,minHeight:"calc(100dvh - 72px)",gap:"clamp(20px, 4vh, 38px)"},children:[e.jsx("h2",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:"clamp(2.6rem, 8vw, 6rem)",letterSpacing:"0.04em",lineHeight:1.12,paddingTop:"0.06em",margin:0,textTransform:"uppercase",background:"linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:"drop-shadow(0 1px 1px rgba(110,71,16,0.20))"},children:d("vision.finale.title")}),e.jsx("p",{style:{fontFamily:"'Cinzel', serif",fontWeight:500,fontSize:"clamp(1.2rem, 3vw, 2.1rem)",lineHeight:1.4,color:"rgba(35,22,8,0.86)",maxWidth:"22ch",margin:0},className:"vf-lead",dangerouslySetInnerHTML:{__html:d("vision.finale.lead")}}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"7px"},children:[e.jsx("button",{onClick:()=>h("/heroglyph/name"),className:"mission-cta",style:{alignSelf:"center",margin:0},children:d("vision.finale.cta")}),e.jsx("p",{style:{fontSize:"clamp(0.95rem, 1.9vw, 1.2rem)",fontStyle:"italic",color:"rgba(60,40,12,0.62)",letterSpacing:"0.04em",margin:0},children:d("vision.finale.tagline")})]})]})]})]})}const yo={dark:{card:"#0a0a0a",cardBorder:"1px solid rgba(196,155,66,0.3)",cardShadow:"0 10px 30px -12px rgba(196,155,66,0.2)",quote:"rgba(250,244,236,0.85)",name:"#A3782B",role:"#FAF4EC",avatar:"1.5px solid #C49B42"},papyrus:{card:"linear-gradient(160deg, #FDF8EC 0%, #F6E9CE 52%, #EEDDB4 100%)",cardBorder:"1.5px solid rgba(140,96,20,0.60)",cardShadow:"0 12px 36px rgba(110,71,16,0.26)",quote:"rgba(35,22,8,0.86)",name:"#6E4A12",role:"rgba(35,22,8,0.90)",avatar:"1.5px solid rgba(140,96,20,0.72)"}},Oe=r=>{const s=yo[r.variant??"dark"];return e.jsx("div",{className:r.className,children:e.jsx(dt.div,{animate:{translateY:"-50%"},transition:{duration:r.duration||10,repeat:1/0,ease:"linear",repeatType:"loop"},className:"flex flex-col gap-6 pb-6",children:[...new Array(2)].map((c,p)=>e.jsx(ue.Fragment,{children:r.testimonials.map(({text:h,image:d,name:b,role:w},f)=>e.jsxs("div",{className:"p-8 rounded-3xl max-w-xs w-full",style:{background:s.card,border:s.cardBorder,boxShadow:s.cardShadow},children:[e.jsxs("div",{className:"text-sm leading-relaxed",style:{color:s.quote,fontFamily:"'Space Grotesk', sans-serif"},children:['"',h,'"']}),e.jsxs("div",{className:"flex items-center gap-3 mt-5",children:[e.jsx("img",{width:40,height:40,src:d,alt:b,loading:"lazy",decoding:"async",className:"h-10 w-10 rounded-full object-cover",style:{border:s.avatar}}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("div",{className:"font-semibold tracking-tight leading-5 text-sm",style:{color:s.name,fontFamily:"'Cinzel', serif"},children:b}),e.jsx("div",{className:"leading-5 opacity-70 tracking-tight text-xs",style:{color:s.role},children:w})]})]})]},f))},p))})})},Qe=[{text:"The truest, purest love… is the love that comes from your dog.",name:"Oprah Winfrey",role:"Cultural icon",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Oprah_Winfrey_2016.jpg/330px-Oprah_Winfrey_2016.jpg",credit:"US Embassy SA (public domain)",source:"https://www.huffpost.com/entry/oprah-dog-sophie_n_4654541"},{text:"I had no intention of rescuing a dog that day, but the minute I saw him I knew he was coming home with me.",name:"Chris Evans",role:"Actor · on his dog Dodger",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Chris_Evans_at_the_2025_Toronto_International_Film_Festival_%28cropped%29.jpg/330px-Chris_Evans_at_the_2025_Toronto_International_Film_Festival_%28cropped%29.jpg",credit:"Sara Komatsu (CC BY-SA 4.0)",source:"https://www.eonline.com/news/1342743"},{text:"He was an Angel. And he was my best friend. All he knew was love.",name:"Tom Hardy",role:"Actor · on his dog Woody",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tom_Hardy_%2841869508740%29.jpg/330px-Tom_Hardy_%2841869508740%29.jpg",credit:"Gage Skidmore (CC BY-SA 2.0)",source:"https://www.nme.com/news/tom-hardy-dog-tribute-2086531"},{text:"We'll always love you. You'll always be my lil' main man.",name:"Dwayne Johnson",role:"Actor · on his dog Brutus",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg/330px-Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg",credit:"Harald Krichel (CC BY-SA 4.0)",source:"https://abc7.com/the-rock-dwayne-johnson-dog-brutus/1009438/"},{text:"You taught me how to love without fear of loss.",name:"Miley Cyrus",role:"Singer · on her dog Floyd",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Miley_Cyrus_Primavera19_-226_%2848986293772%29_%28cropped%29.jpg/330px-Miley_Cyrus_Primavera19_-226_%2848986293772%29_%28cropped%29.jpg",credit:"Raphael Pour-Hashemi (CC BY 2.0)",source:"https://www.billboard.com/music/music-news/miley-cyrus-floyd-remembrance-8454678/"},{text:"Dogs are the most harmless, sweetest babes in the world. They show nothing but unconditional love.",name:"Ariana Grande",role:"Singer",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Ariana_Grande_promoting_Wicked_%282024%29.jpg/330px-Ariana_Grande_promoting_Wicked_%282024%29.jpg",credit:"Barbie Simons (CC BY 3.0)",source:"https://www.billboard.com/lists/billboard-power-pets-list-music-stars-a-list-animals/"},{text:"I always, always called him the rockstar. Because he was!",name:"Hugh Jackman",role:"Actor · on his dog Dali",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Hugh_Jackman_by_Gage_Skidmore_3.jpg/330px-Hugh_Jackman_by_Gage_Skidmore_3.jpg",credit:"Gage Skidmore (CC BY-SA 3.0)",source:"https://abcnews.com/GMA/Culture/hugh-jackman-mourns-loss-beloved-dog-called-rockstar/story?id=88095066"},{text:"I don't think even the cliché of unconditional love is enough.",name:"Drew Barrymore",role:"Actor · on her dog Flossie",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Drew_Barrymore_in_2019_%28cropped%29.jpg/330px-Drew_Barrymore_in_2019_%28cropped%29.jpg",credit:"Eva Rinaldi (CC BY-SA 2.0)",source:"https://www.thelist.com/1320243/little-known-drew-barrymore-facts/"},{text:"He has saved my emotional and psychological bacon plenty of times.",name:"Henry Cavill",role:"Actor · on his dog Kal",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Henry_Cavill_%2848417913146%29_%28cropped%29.jpg/330px-Henry_Cavill_%2848417913146%29_%28cropped%29.jpg",credit:"Gage Skidmore (CC BY-SA 2.0)",source:"https://iheartdogs.com/superman-cavill-kal/"},{text:"I just fell in love with him. I didn't mean to, I just picked him up along the way.",name:"Ryan Reynolds",role:"Actor · on his dog Baxter",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg/330px-Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg",credit:"Dick Thomas Johnson (CC BY 2.0)",source:"https://dogtime.com/dogs-in-film-tv/171606-ryan-reynolds-dog-baxter-breed-age"},{text:"He loves me. I can do no wrong. He follows me everywhere.",name:"George Clooney",role:"Actor · on his dog Einstein",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/George_Clooney_Jay_Kelly-19_%28cropped%29.jpg/330px-George_Clooney_Jay_Kelly-19_%28cropped%29.jpg",credit:"Bryan Berlin (CC BY-SA 4.0)",source:"https://www.hellomagazine.com/celebrities/2015110228022/george-clooney-talks-about-his-dog-einstein/"},{text:"Charlotte loves me undyingly. They're my kids.",name:"Bradley Cooper",role:"Actor · on his dog Charlotte",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Bradley_Cooper_Is_This_Thing_On-41_%28cropped%29.jpg/330px-Bradley_Cooper_Is_This_Thing_On-41_%28cropped%29.jpg",credit:"Bryan Berlin (CC BY-SA 4.0)",source:"https://www.peta.org/news/bradley-coopers-hung-rescue-dogs/"},{text:"They just give you unconditional love. And you're never alone, they're just there.",name:"Channing Tatum",role:"Actor · on his dog Lulu",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Channing_Tatum_at_the_2026_Berlin_International_Film_Festival-69843.jpg/330px-Channing_Tatum_at_the_2026_Berlin_International_Film_Festival-69843.jpg",credit:"Harald Krichel (CC BY-SA 4.0)",source:"https://sharpmagazine.com/2022/02/16/channing-tatum-interview/"},{text:"He was more than a companion. It was a soul connection for sure.",name:"Orlando Bloom",role:"Actor · on his dog Mighty",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Orlando_Bloom_at_the_2024_Toronto_International_Film_Festival_%28cropped2%29.jpg/330px-Orlando_Bloom_at_the_2024_Toronto_International_Film_Festival_%28cropped2%29.jpg",credit:"Kevin Payravi (CC BY-SA 4.0)",source:"https://www.etonline.com/orlando-blooms-dog-mighty-dies-after-going-missing-actor-gets-inked-in-his-honor-150050"},{text:"There's one that's a dog of a lifetime… and you're going to cry like a little baby when he's gone.",name:"Kevin Costner",role:"Actor · on his dog Wyatt",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Kevin_Costner_at_81st_Venice_Film_Festival_%28cropped%29.jpg/330px-Kevin_Costner_at_81st_Venice_Film_Festival_%28cropped%29.jpg",credit:"Ariela Ortiz-Barrantes (CC BY-SA 4.0)",source:"https://www.aarp.org/entertainment/movies-for-grownups/info-2019/kevin-costner-racing-interview.html"},{text:"She's brilliant, my best friend.",name:"Tom Holland",role:"Actor · on his dog Tessa",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg/330px-Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg",credit:"ChristopherJClarke (CC BY-SA 4.0)",source:"https://dogsmonthly.co.uk/2020/02/06/our-interview-with-tom-holland/"},{text:"We're already falling head over heels in love.",name:"Patrick Stewart",role:"Actor · on his foster pup",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Patrick_Stewart_by_Gage_Skidmore_2.jpg/330px-Patrick_Stewart_by_Gage_Skidmore_2.jpg",credit:"Gage Skidmore (CC BY-SA 3.0)",source:"https://www.newsweek.com/watch-sir-patrick-stewart-soothe-this-anxious-foster-pup-his-continuing-support-pitbulls-1530718"},{text:"The dogs are everything. They're living, breathing, pure, good love.",name:"Jennifer Aniston",role:"Actor",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/JenniferAnistonHWoFFeb2012.jpg/330px-JenniferAnistonHWoFFeb2012.jpg",credit:"Angela George (CC BY-SA 3.0)",source:"https://paradepets.com/pet-news/jennifer-aniston-playing-working-out-with-her-dogs-exclusive-video"},{text:"I have no words or tears to describe how much she meant to me.",name:"Salma Hayek",role:"Actor · on her dog Lupe",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/MKr383631_Salma_Hayek_%28Women_In_Motion%2C_Cannes_2025%29_crop.jpg/330px-MKr383631_Salma_Hayek_%28Women_In_Motion%2C_Cannes_2025%29_crop.jpg",credit:"Martin Kraft (CC BY-SA 4.0)",source:"https://www.huffpost.com/entry/salma-hayek-dog-lupe-dies_n_5a60753ce4b01b82649cc317"},{text:"That feeling has never left me. It is one of the most special presences in my life.",name:"Eva Mendes",role:"Actor · on her dog Hugo",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Eva_Mendes_2009.jpg/330px-Eva_Mendes_2009.jpg",credit:"Nicolas Genin (CC BY-SA 4.0)",source:"https://www.hellomagazine.com/celebrities/20220722146132/eva-mendes-sparks-emotional-response-remembers-first-love-hugo/"},{text:"For them you are their entire book, their entire lives.",name:"Chrissy Teigen",role:"Model / TV host · on her dog Penny",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Chrissy_Teigen_2019.png/330px-Chrissy_Teigen_2019.png",credit:"Adweek (CC BY 3.0)",source:"https://www.aol.com/chrissy-teigen-mourns-death-her-013704458.html"},{text:"You sure gave me a lot of comfort and love when I needed it the most!",name:"Hilary Duff",role:"Actor / singer · on her dog Jak",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Hilary_Duff_%2835661671285%29_%28cropped%29_%283%29.jpg/330px-Hilary_Duff_%2835661671285%29_%28cropped%29_%283%29.jpg",credit:"Greg2600 (CC BY-SA 2.0)",source:"https://www.hellomagazine.com/celebrities/20220329136723/how-i-met-your-father-hilary-duff-heartbreaking-personal-loss-dog/"},{text:"Finn's brought all the love, warmth and total presence a girl could only dream of.",name:"Amanda Seyfried",role:"Actor · on her dog Finn",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Amanda_Seyfried_at_Berlinale_2026-1_%28cropped%29.jpg/330px-Amanda_Seyfried_at_Berlinale_2026-1_%28cropped%29.jpg",credit:"Elena Ternovaja (CC BY-SA 3.0)",source:"https://parade.com/news/fans-gush-over-amanda-seyfrieds-beautiful-dog-finn-as-star-celebrates-his-milestone-birthday"},{text:"My beloved, hilarious dog Norman's unconditional love inspired me to create this company.",name:"Kaley Cuoco",role:"Actor · on her dog Norman",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Kaley_Cuoco_by_Gage_Skidmore.jpg/330px-Kaley_Cuoco_by_Gage_Skidmore.jpg",credit:"Gage Skidmore (CC BY-SA 3.0)",source:"https://www.hellomagazine.com/celebrities/505835/kaley-cuoco-thanks-beloved-pet-dog-norman-as-she-launches-new-project/"},{text:"There is no better dog than Jack. How could you make a dog better than Jack!",name:"Mariah Carey",role:"Singer · on her dog Jack",image:"https://upload.wikimedia.org/wikipedia/commons/2/22/Mariah_Carey_Library_of_Congress_2023_1_Cropped_3.png",credit:"Shawn Miller / LOC (public domain)",source:"https://www.k9magazine.com/mariah-carey/"},{text:"He's such a good boy. I wish I could take him on my whole tour across the world.",name:"Billie Eilish",role:"Singer · on her dog Shark",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg/330px-BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg",credit:"Raph_PH (CC BY 2.0)",source:"https://www.movin925.com/read-an-interview-with-billie-eilishs-dog-shark-yes-really"},{text:"I genuinely talk to my dogs. I totally believe that animals are healing.",name:"Selena Gomez",role:"Singer / actress",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg/330px-Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg",credit:"Frank Sun (CC BY-SA 4.0)",source:"https://www.wondermind.com/article/selena-gomez-speaks-out-about-her-mental-health/"},{text:"She was a dear pet of mine. I remember John being amazed to see me being so loving to an animal.",name:"Paul McCartney",role:"The Beatles · on his dog Martha",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/MaccaLyricsRFH051121_%2815_of_18%29_%28updated%29_%28cropped%29.jpg/330px-MaccaLyricsRFH051121_%2815_of_18%29_%28updated%29_%28cropped%29.jpg",credit:"Raph_PH (CC BY 2.0)",source:"https://www.the-paulmccartney-project.com/1966/10/paul-mccartney-buys-an-old-english-sheepdog/"},{text:"She gave us so much joy for 10 years. We love you Pippa!",name:"John Legend",role:"Singer · on his dog Pippa",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/JohnLegend-byPhilipRomano.jpg/330px-JohnLegend-byPhilipRomano.jpg",credit:"PhilipRomanoPhoto (CC BY-SA 4.0)",source:"https://www.billboard.com/music/music-news/john-legend-chrissy-teigen-dog-dies-pippa-photos-9602212/"},{text:"'Puppy Love' was my very first record, and six decades later, my love for pets is stronger than ever.",name:"Dolly Parton",role:"Singer / songwriter",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Dolly_Parton_at_%27Blue_Smoke_World_Tour%27_in_Knoxville.jpg/330px-Dolly_Parton_at_%27Blue_Smoke_World_Tour%27_in_Knoxville.jpg",credit:"Kristopher Harris (CC BY 2.0)",source:"https://www.foxbusiness.com/lifestyle/dolly-parton-launches-dog-apparel-line-doggy-parton"},{text:"Her name is Asia. She is a BATPIG. I love her, I'm her mom.",name:"Lady Gaga",role:"Singer · on her dog Asia",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg/330px-Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg",credit:"Carlos M. Vazquez II (CC BY 2.0)",source:"https://ladygaga.fandom.com/wiki/Asia_(dog)"},{text:"He was with me all the way, my closest companion. All the love and cuddles we will miss forever.",name:"Conor McGregor",role:"UFC fighter · on his dog Hugo",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Conor_McGregor_2025.jpeg/330px-Conor_McGregor_2025.jpeg",credit:"US Dept of Defense (public domain)",source:"https://www.tmz.com/2021/10/20/conor-mcgregor-mourns-dog-hugo-death-so-heart-broken/"},{text:"Bringing Roscoe into my life was the best decision I ever made.",name:"Lewis Hamilton",role:"F1 driver · on his dog Roscoe",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg/330px-Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg",credit:"No. 10 Downing Street (OGL 3)",source:"https://www.espn.com/racing/f1/story/_/id/46420057/lewis-hamilton-ferrari-mourns-beloved-dog-roscoe"},{text:"She was there every day to lick my leg and remind me how much she loved me.",name:"Serena Williams",role:"Tennis champion · on her dog Jackie",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Guests_at_the_2026_Met_Gala_209_%28cropped%29.jpg/330px-Guests_at_the_2026_Met_Gala_209_%28cropped%29.jpg",credit:"SWinxy (CC BY 4.0)",source:"https://www.today.com/pets/serena-williams-posts-sweet-tribute-her-late-dog-jackie-t58101"},{text:"A man's best friend. Always happy to see you. Loves you unconditionally.",name:"Tyson Fury",role:"Heavyweight boxer · on his dog Cash",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Tyson_Fury_at_Place_Bell%2C_Laval_Quebec%2C_Canada_-_Dec_16_2017_%28cropped%29.jpg/330px-Tyson_Fury_at_Place_Bell%2C_Laval_Quebec%2C_Canada_-_Dec_16_2017_%28cropped%29.jpg",credit:"Mike DiDomizio (CC BY-SA 4.0)",source:"https://thetab.com/realityshrine/2026/04/14/insane-five-figure-sum-tyson-paid-for-his-dog-cash"},{text:"Their love is unconditional and they give me and my family plenty of joy in our lives.",name:"Michael Phelps",role:"Olympic swimmer",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Michael_Phelps_Rio_Olympics_2016.jpg/330px-Michael_Phelps_Rio_Olympics_2016.jpg",credit:"Agência Brasil (CC BY 2.0)",source:"https://www.petbusiness.com/archives/walking-the-walk-an-interview-with-michael-phelps/"},{text:"Harry is my best friend! Definitely the best decision I've ever made.",name:"Venus Williams",role:"Tennis champion · on her dog Harry",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Venus_Williams_%282025_DC_Open%29_crop.jpg/330px-Venus_Williams_%282025_DC_Open%29_crop.jpg",credit:"Hameltion (CC BY-SA 4.0)",source:"https://tennisuptodate.com/wta/definitely-the-best-decision-ive-ever-made-venus-williams-professes-love-for-her-pet-dog-harry"},{text:"We couldn't be happier. Welcome to the family, Willow.",name:"Roger Federer",role:"Tennis champion · on his dog Willow",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Roger_Federer_2015_%28cropped%29.jpg/330px-Roger_Federer_2015_%28cropped%29.jpg",credit:"Tatiana (CC BY-SA 2.0)",source:"https://www.tennisworldusa.org/tennis/news/Roger_Federer/114742/"},{text:"He is a good friend and traveling companion, and would rather travel about than anything he can imagine.",name:"John Steinbeck",role:"Nobel author · on his dog Charley",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/John_Steinbeck_1939_%28cropped%29.jpg/330px-John_Steinbeck_1939_%28cropped%29.jpg",credit:"public domain",source:"https://gutenberg.ca/ebooks/steinbeckj-travelswithcharley/"},{text:"I've never loved a dog like this in my life. Sometimes I think there's a person in there.",name:"Elizabeth Taylor",role:"Actress · on her dog Sugar",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Taylor%2C_Elizabeth_posed.jpg/330px-Taylor%2C_Elizabeth_posed.jpg",credit:"public domain",source:"https://www.wmagazine.com/story/elizabeth-taylor-dec-2004"},{text:"If the kindest souls were rewarded with the longest lives, dogs would outlive us all.",name:"Ricky Gervais",role:"Comedian / actor",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/GervaisPall230921_%285_of_17%29_%2851528328440%29_%28cropped%29.jpg/330px-GervaisPall230921_%285_of_17%29_%2851528328440%29_%28cropped%29.jpg",credit:"Raph_PH (CC BY 2.0)",source:"https://www.facebook.com/rickygervais/posts/1132160746908277/"},{text:"Our guardian angel is gone to heaven. She will forever live in our hearts.",name:"Gisele Bündchen",role:"Supermodel · on her dog Lua",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Ver%C3%A3o_Arezzo_Brasil_2019_por_Gisele_B%C3%BCndchen_17.jpg/330px-Ver%C3%A3o_Arezzo_Brasil_2019_por_Gisele_B%C3%BCndchen_17.jpg",credit:"Arezzo Brasil (CC BY 3.0)",source:"https://www.eonline.com/news/1391973/gisele-buendchen-and-tom-brady-mourn-death-of-family-dog"},{text:"Lump, he's not a dog, he's not a little man, he's somebody else.",name:"Pablo Picasso",role:"Painter · on his dog Lump",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pablo_picasso_1.jpg/330px-Pablo_picasso_1.jpg",credit:"public domain",source:"https://en.wikipedia.org/wiki/Lump_(dog)"},{text:"Sometimes when a man's alone, that's all you got is your dog. And they've meant the world to me.",name:"Mickey Rourke",role:"Actor",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Mickey_Rourke_Tribeca_2009_portrait.jpg/330px-Mickey_Rourke_Tribeca_2009_portrait.jpg",credit:"David Shankbone (CC BY-SA 3.0)",source:"https://abcnews.go.com/Entertainment/Oscars/story?id=6897261"}],ko=21,et=r=>r.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z]+/g,"-");function jo(r){const s=[...r];for(let c=s.length-1;c>0;c--){const p=Math.floor(Math.random()*(c+1));[s[c],s[p]]=[s[p],s[c]]}return s}function zo({variant:r="dark",pinned:s=!1,onFans:c,fansLive:p=!0}={}){const h=K(),{columns:d}=g.useMemo(()=>{const w=jo(Qe).slice(0,ko),f=Math.ceil(w.length/3);return{columns:[w.slice(0,f),w.slice(f,f*2),w.slice(f*2)]}},[]),b=w=>({...w,text:h(`about.legends.q.${et(w.name)}.text`),role:h(`about.legends.q.${et(w.name)}.role`)});return e.jsx("section",{id:"testimonials",className:`relative overflow-hidden ${s?"tst-pinned":"py-24 md:py-32"}`,style:{background:r==="papyrus"?"linear-gradient(180deg, transparent 0%, rgba(233,215,177,0.55) 26%, #EFDEBB 100%)":"linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 18%, #000000 42%)"},children:e.jsxs("div",{className:"max-w-6xl mx-auto px-6 md:px-8",children:[e.jsxs(dt.div,{initial:s?!1:{opacity:0,y:20},whileInView:s?void 0:{opacity:1,y:0},viewport:{once:!0},transition:{duration:.6},className:`flex flex-col items-center text-center mb-12 md:mb-16${s?" tst-head":""}`,children:[e.jsx("h2",{className:"text-4xl md:text-5xl font-black tracking-wider",style:{fontFamily:"'Cinzel', serif",textTransform:"uppercase",letterSpacing:"0.02em",background:r==="papyrus"?"linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%)":"linear-gradient(135deg, #F5C73D 0%, #FFB840 40%, #E69E1A 70%, #F5C73D 100%)",WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent",filter:r==="papyrus"?"drop-shadow(0 1px 1px rgba(110,71,16,0.20))":"drop-shadow(0 0 16px rgba(245,199,61,0.32))",paddingTop:"0.12em"},children:h(s?"about.legends.titleFilm":"about.legends.title")}),e.jsx("p",{className:"mt-4 max-w-xl text-base md:text-lg",style:{color:r==="papyrus"?"rgba(35,22,8,0.82)":"rgba(250,244,236,0.76)",fontFamily:"'Space Grotesk', sans-serif",lineHeight:1.65},children:h(s?"about.legends.subFilm":"about.legends.sub")}),s&&e.jsxs("p",{className:"tst-btw",style:{margin:"16px 0 0",maxWidth:520,fontFamily:"'Space Grotesk', sans-serif",fontSize:14,lineHeight:1.5,color:r==="papyrus"?"rgba(35,22,8,0.62)":"rgba(250,244,236,0.6)"},children:[e.jsx("b",{style:{fontWeight:600,color:r==="papyrus"?"rgba(35,22,8,0.82)":"rgba(250,244,236,0.85)"},children:h("onepage.apps.lang.a")})," ",h("onepage.apps.lang.b")]}),s&&c&&e.jsx("button",{type:"button",className:"dgx-example tst-fans",onClick:c,tabIndex:p?0:-1,style:{pointerEvents:p?"auto":"none",marginLeft:0,marginTop:24},children:h("about.legends.fansChip")})]}),e.jsxs("div",{className:`flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]${s?" tst-cols":""}`,style:{maxHeight:"640px",overflow:"hidden"},children:[e.jsx(Oe,{testimonials:d[0].map(b),duration:48,variant:r}),e.jsx(Oe,{testimonials:d[1].map(b),className:"hidden md:block",duration:56,variant:r}),e.jsx(Oe,{testimonials:d[2].map(b),className:"hidden lg:block",duration:52,variant:r})]}),e.jsxs("details",{className:`mt-10 mx-auto max-w-2xl text-center${s?" tst-credits":""}`,children:[e.jsx("summary",{className:"cursor-pointer text-[11px] tracking-wide select-none",style:{color:r==="papyrus"?"rgba(60,40,12,0.58)":"rgba(250,244,236,0.4)",fontFamily:"'Space Grotesk', sans-serif"},children:h("about.legends.creditsSummary")}),e.jsxs("p",{className:"mt-3 text-[10px] leading-relaxed",style:{color:r==="papyrus"?"rgba(60,40,12,0.52)":"rgba(250,244,236,0.32)",fontFamily:"'Space Grotesk', sans-serif"},children:[h("about.legends.creditsIntro")," ",Qe.map(w=>`${w.name} — ${w.credit}`).join(" · ")]})]})]})})}const So=[{id:"dog-lover",icon:Pt},{id:"developer",icon:Tt},{id:"dog-pro",icon:_t},{id:"creator",icon:It},{id:"media",icon:Lt},{id:"investor",icon:Ot},{id:"community",icon:Dt},{id:"business",icon:Mt}];function Eo(){const r=K(),[s,c]=g.useState(""),[p,h]=g.useState(""),[d,b]=g.useState(""),[w,f]=g.useState(""),[j,N]=g.useState(!1),[C,_]=g.useState("idle"),T=async v=>{if(v.preventDefault(),!s||!p.trim()||!d.trim()||!j)return;_("loading");const{error:E}=await Nt.from("contacts").insert({name:p.trim(),email:d.trim().toLowerCase(),role:s,message:w.trim()||null});E||ut("email_signup",{role:s}),_(E?"error":"done")};return e.jsxs("section",{id:"council",className:"council-section",style:{scrollMarginTop:80},children:[e.jsx("style",{children:`
        .council-section {
          background: #000;
          padding: clamp(72px, 14vh, 120px) 20px clamp(80px, 16vh, 140px);
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 2;
        }
        .council-inner {
          width: 100%; max-width: 1100px;
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(30px, 5vh, 52px); text-align: center;
        }
        /* ── Beige papyrus block (like /pack cards) — full width, image | form ── */
        .council-card {
          width: 100%;
          /* PAPYRUS LOCK (2026-07-26) — bledý blok podľa /entry .religion-card */
          background: var(--papyrus-card);
          border: var(--papyrus-border);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-papyrus-card);
          padding: clamp(22px, 3vw, 46px);
          display: grid; grid-template-columns: 1fr; gap: clamp(22px, 4vh, 38px);
          align-items: center; text-align: center;
        }
        @media (min-width: 880px) {
          .council-card {
            grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
            gap: clamp(30px, 3.5vw, 56px); align-items: stretch; text-align: left;
          }
        }
        /* ── Left: pharaoh figure + headline under it ── */
        .council-figure {
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          gap: clamp(12px, 2.4vh, 22px);
        }
        .council-figure img {
          width: 100%; max-width: 420px; height: auto; display: block;
          filter: drop-shadow(0 14px 34px rgba(31,26,14,0.30));
        }
        @media (max-width: 879px) { .council-figure img { max-width: 300px; } }
        /* ── Right: form column ── */
        .council-content {
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          gap: clamp(20px, 3vh, 30px); min-width: 0;
        }
        .council-headline-wrap {
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(6px, 1.2vh, 12px);
        }
        .council-headline-wrap .council-logo {
          width: clamp(178px, 22vw, 267px); max-width: 267px; height: auto; display: block;
          filter: drop-shadow(0 2px 3px rgba(31,26,14,0.18));
        }
        .council-headline {
          font-family: 'Cinzel', serif; font-weight: 700; white-space: nowrap;
          /* padding-top = headroom pre diakritiku nad verzálkami (background-clip:text ju inak osekne) */
          padding-top: 0.15em;
          font-size: clamp(2.1rem, 4.6vw, 3.4rem); line-height: 1.05;
          letter-spacing: 0.02em; margin: 0;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(31,26,14,0.22));
        }
        .council-form-title {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0 0 -6px;
          font-size: clamp(1.4rem, 2.4vw, 1.85rem); letter-spacing: 0.02em; line-height: 1.1;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(31,26,14,0.18));
        }
        .council-sub {
          font-family: 'Space Grotesk', sans-serif; font-size: clamp(0.95rem, 1.3vw, 1.1rem);
          line-height: 1.65; color: rgba(31,26,14,0.66); margin: 0;
          max-width: 540px;
        }
        /* ── Role grid ── */
        .council-roles {
          width: 100%; display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 600px) { .council-roles { grid-template-columns: repeat(4, 1fr); } }
        .role-card {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; padding: clamp(11px, 1.6vw, 15px) 8px; min-height: 92px;
          background: linear-gradient(135deg, hsl(224 40% 18%), hsl(45 70% 28%));
          border: 1.5px solid rgba(201,154,63,0.25);
          border-radius: 12px; cursor: pointer;
          transition: filter .2s ease, box-shadow .2s ease, border-color .2s ease;
          user-select: none;
        }
        .role-card:hover {
          filter: brightness(1.18);
          border-color: rgba(201,154,63,0.55);
        }
        .role-card.selected {
          filter: brightness(1.14);
          border-color: #B98BE8;
          box-shadow: 0 0 0 2px rgba(46,95,208,0.95), 0 0 24px 5px rgba(46,95,208,0.70);
        }
        .role-icon {
          width: 30px; height: 30px; object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.80;
          transition: opacity .2s ease;
        }
        .role-card.selected .role-icon,
        .role-card:hover .role-icon { opacity: 1; }
        .role-label {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.62rem, 0.85vw, 0.74rem); letter-spacing: 0.05em;
          color: #FAF4EC; text-align: center; line-height: 1.25; margin: 0;
        }
        /* desc = hover overlay (no layout shift) */
        .role-desc {
          position: absolute; inset: 0; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          padding: 10px 12px; margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.64rem, 0.85vw, 0.74rem); line-height: 1.4;
          color: #FAF4EC; text-align: center;
          background: linear-gradient(135deg, rgba(36,24,54,0.97) 0%, rgba(58,42,18,0.97) 100%);
          opacity: 0; pointer-events: none;
          transition: opacity .2s ease;
        }
        .role-card:hover .role-desc { opacity: 1; }
        @media (hover: none) {
          /* touch: no hover → keep desc visible, smaller card text */
          .role-desc { position: static; inset: auto; background: none; opacity: 1;
            color: rgba(250,244,236,0.45); padding: 0; }
          .role-card { min-height: 0; }
        }
        /* ── Form ── */
        .council-form {
          width: 100%; display: flex; flex-direction: column; gap: 14px;
        }
        .council-input-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        @media (max-width: 599px) { .council-input-row { grid-template-columns: 1fr; } }
        .council-input {
          width: 100%; padding: 14px 18px;
          background: rgba(255,255,255,0.62); border: 1.5px solid rgba(31,26,14,0.18);
          border-radius: 8px; outline: none;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem;
          color: #1F1A0E; transition: border-color .2s ease, background .2s ease;
          box-sizing: border-box;
        }
        .council-input::placeholder { color: rgba(31,26,14,0.42); }
        .council-input:focus { border-color: rgba(201,154,63,0.75); background: rgba(255,255,255,0.85); }
        textarea.council-input { resize: vertical; min-height: 78px; }
        /* ── Consent checkbox (above submit) ── */
        .council-consent {
          display: flex; align-items: flex-start; gap: 10px;
          text-align: left; cursor: pointer; user-select: none;
        }
        .council-consent input {
          flex: 0 0 auto; appearance: none; -webkit-appearance: none;
          width: 18px; height: 18px; margin-top: 1px;
          border: 1.5px solid rgba(31,26,14,0.35); border-radius: 5px;
          background: rgba(255,255,255,0.62); cursor: pointer;
          transition: background .2s ease, border-color .2s ease;
          position: relative;
        }
        .council-consent input:checked {
          background: linear-gradient(135deg, #C99A3F 0%, #9A6E1F 100%);
          border-color: rgba(154,110,31,0.75);
        }
        .council-consent input:checked::after {
          content: ''; position: absolute; left: 5px; top: 1px;
          width: 5px; height: 10px; border: solid #FFF8EC;
          border-width: 0 2px 2px 0; transform: rotate(45deg);
        }
        .council-consent span {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.72rem, 0.95vw, 0.82rem); line-height: 1.45;
          color: rgba(31,26,14,0.62);
        }
        /* ── Submit (papyrus deep gold — matches card headline/title gradient) ── */
        .council-submit {
          align-self: center;
          padding: 14px 44px;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          border: 1px solid rgba(154,110,31,0.55);
          border-radius: 8px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.82rem, 1.1vw, 0.95rem); letter-spacing: 0.12em; text-transform: uppercase;
          color: #FFF8EC; white-space: nowrap;
          box-shadow: 0 8px 22px rgba(31,26,14,0.30), inset 0 1px 0 rgba(255,248,236,0.30);
          transition: transform 0.2s, box-shadow 0.22s, filter 0.22s;
        }
        .council-submit:hover:not(:disabled) { transform: scale(1.03); filter: brightness(1.08); box-shadow: 0 10px 28px rgba(31,26,14,0.38), inset 0 1px 0 rgba(255,248,236,0.30); }
        .council-submit:active:not(:disabled) { transform: scale(0.98); }
        .council-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; box-shadow: inset 0 1px 0 rgba(255,248,236,0.30); }
        /* ── Desktop: form fills the column so the textarea grows and the button
           drops to the bottom (its lower edge level with "NEEDS YOU." on the left).
           Button = full width of the textarea/form. ── */
        @media (min-width: 880px) {
          /* push the whole right block to the bottom — button stays level with
             "NEEDS YOU.", textarea shrinks, empty space lands at the TOP (top
             edge no longer aligned with the left column). */
          .council-content { justify-content: flex-end; }
          .council-form { flex: 0 0 auto; }
          textarea.council-input { flex: 0 0 auto; height: 92px; }
          .council-submit { align-self: stretch; width: 100%; }
        }
        /* ── Success ── */
        .council-success {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          padding: clamp(32px, 6vh, 56px) 20px;
        }
        .council-success-title {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(1.6rem, 3.5vw, 2.4rem); margin: 0;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .council-success-sub {
          font-family: 'Space Grotesk', sans-serif; font-size: 1rem;
          color: rgba(31,26,14,0.62); margin: 0;
        }
        .council-error {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem;
          color: rgba(255,120,100,0.85); text-align: center; margin: 0;
        }
      `}),e.jsx("div",{className:"council-inner",children:e.jsxs("div",{className:"council-card",children:[e.jsxs("div",{className:"council-figure",children:[e.jsx("img",{src:"/images/council-pharaoh.png",alt:r("about.council.imgAlt")}),e.jsxs("div",{className:"council-headline-wrap",children:[e.jsx("img",{className:"council-logo",src:"/images/dogypt-logo-black-w.png",alt:"DOGYPT"}),e.jsx("h2",{className:"council-headline",children:r("about.council.headline")})]})]}),e.jsxs("div",{className:"council-content",children:[e.jsx("h3",{className:"council-form-title",children:r("about.council.formTitle")}),e.jsx("p",{className:"council-sub",children:r("about.council.sub")}),C==="done"?e.jsxs("div",{className:"council-success",children:[e.jsx("h3",{className:"council-success-title",children:r("about.council.successTitle")}),e.jsx("p",{className:"council-success-sub",children:r("about.council.successSub")})]}):e.jsxs("form",{className:"council-form",onSubmit:T,noValidate:!0,children:[e.jsx("div",{className:"council-roles",role:"group","aria-label":r("about.council.rolesAria"),children:So.map(v=>e.jsxs("button",{type:"button",className:`role-card${s===v.id?" selected":""}`,onClick:()=>c(v.id),"aria-pressed":s===v.id,children:[e.jsx("img",{src:v.icon,alt:"",className:"role-icon","aria-hidden":!0}),e.jsx("p",{className:"role-label",children:r(`about.council.role.${v.id}.label`)}),e.jsx("p",{className:"role-desc",children:r(`about.council.role.${v.id}.desc`)})]},v.id))}),e.jsxs("div",{className:"council-input-row",children:[e.jsx("input",{className:"council-input",type:"text",placeholder:r("about.council.fullName"),value:p,onChange:v=>h(v.target.value),required:!0,autoComplete:"name"}),e.jsx("input",{className:"council-input",type:"email",placeholder:r("about.council.email"),value:d,onChange:v=>b(v.target.value),required:!0,autoComplete:"email"})]}),e.jsx("textarea",{className:"council-input",placeholder:r("about.council.message"),value:w,onChange:v=>f(v.target.value)}),C==="error"&&e.jsx("p",{className:"council-error",children:r("about.council.error")}),e.jsxs("label",{className:"council-consent",children:[e.jsx("input",{type:"checkbox",checked:j,onChange:v=>N(v.target.checked)}),e.jsx("span",{children:r("about.council.consent")})]}),e.jsx("button",{type:"submit",className:"council-submit",disabled:!s||!p.trim()||!d.trim()||!j||C==="loading",children:r(C==="loading"?"about.council.sending":"about.council.submit")})]})]})]})})]})}const Ao=[{id:"youtube",label:"YouTube",href:"https://youtube.com/@dogypt",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M23 7.2a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.6A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.2zM9.8 15.3V8.7l5.7 3.3z"})})},{id:"instagram",label:"Instagram",href:"https://instagram.com/dogypt",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.9","aria-hidden":!0,children:[e.jsx("rect",{x:"2.5",y:"2.5",width:"19",height:"19",rx:"5.2"}),e.jsx("circle",{cx:"12",cy:"12",r:"4.1"}),e.jsx("circle",{cx:"17.4",cy:"6.6",r:"1.15",fill:"currentColor",stroke:"none"})]})},{id:"facebook",label:"Facebook",href:"https://www.facebook.com/dogypt.official/",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"})})}];function Co(){const r=K();return e.jsxs("footer",{className:"dogypt-footer",children:[e.jsx("style",{children:`
        .dogypt-footer {
          background: #000; position: relative; z-index: 2;
          padding: clamp(48px, 9vh, 84px) clamp(22px, 5vw, 64px) clamp(28px, 4vh, 40px);
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(32px, 5vh, 52px);
        }
        .footer-inner {
          width: 100%; max-width: 1100px; margin-top: -100px;
          display: grid; grid-template-columns: 1fr; gap: clamp(34px, 6vh, 46px);
          align-items: start; text-align: left;
        }
        @media (min-width: 760px) {
          .footer-inner {
            grid-template-columns: 1fr 1fr 1fr;
            gap: clamp(34px, 5vw, 64px); align-items: center;
          }
        }
        /* ── Brand: seal (centre column) ── */
        .footer-brand { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: clamp(14px, 2vh, 18px); }
        .footer-seal { height: clamp(118px, 15vw, 158px); width: auto; display: block; }
        .footer-tagline {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0;
          font-size: clamp(0.82rem, 1.1vw, 0.96rem); letter-spacing: 0.20em; text-transform: uppercase;
          color: rgba(201,154,63,0.88);
        }
        .footer-mission {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem; line-height: 1.6; margin: 0;
          color: rgba(250,244,236,0.42); max-width: 260px;
        }
        /* ── Columns ── */
        .footer-col { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
        .footer-col-title {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0;
          font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(250,244,236,0.45);
        }
        /* ── Socials — rounded squares (single row 1×3) ── */
        .footer-socials { display: flex; gap: 10px; align-items: center; flex-wrap: nowrap; }
        .footer-social {
          width: clamp(46px, 5.2vw, 56px); height: clamp(46px, 5.2vw, 56px);
          display: flex; align-items: center; justify-content: center;
          border-radius: 13px; color: rgba(250,244,236,0.80);
          border: 1px solid rgba(201,154,63,0.30); background: rgba(250,244,236,0.02);
          transition: color .2s ease, border-color .2s ease, background .2s ease, transform .15s ease;
        }
        .footer-social svg { width: clamp(22px, 2.6vw, 27px); height: clamp(22px, 2.6vw, 27px); }
        .footer-social:hover {
          color: #F5C73D; border-color: rgba(201,154,63,0.7);
          background: rgba(201,154,63,0.10); transform: translateY(-2px);
        }
        /* ── Email (emphasized) + legal ── */
        .footer-col-email { justify-content: center; align-items: center; }
        @media (min-width: 760px) {
          /* social left · seal centre · email right */
          .footer-col-social { align-items: flex-start; padding-left: 50px; }
          .footer-col-email { padding-top: 0; align-items: flex-end; padding-right: 50px; }
        }
        /* mobile stack: seal on top, then social, then email */
        @media (max-width: 759px) { .footer-brand { order: -1; } }
        .footer-email {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.98rem, 1.5vw, 1.22rem); letter-spacing: 0.03em;
          color: #F5C73D; text-decoration: none;
          border-bottom: 1px solid rgba(201,154,63,0.55); padding-bottom: 3px;
          text-shadow: 0 0 18px rgba(245,199,61,0.28);
          transition: color .2s ease, border-color .2s ease, text-shadow .2s ease;
        }
        .footer-email:hover { color: #FFD879; border-color: #F5C73D; text-shadow: 0 0 24px rgba(245,199,61,0.45); }
        .footer-links { display: flex; align-items: center; gap: 12px; }
        .footer-links a {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem;
          color: rgba(250,244,236,0.55); text-decoration: none; transition: color .2s ease;
        }
        .footer-links a:hover { color: rgba(250,244,236,0.9); }
        .footer-links span { color: rgba(250,244,236,0.28); }
        .footer-copy {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.74rem; margin: 0;
          color: rgba(250,244,236,0.34); letter-spacing: 0.04em;
        }
        /* ── Bottom bar — mission + copyright ── */
        .footer-bar {
          width: 100%; max-width: 1100px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          text-align: center; padding-top: clamp(18px, 3vh, 26px);
          border-top: 1px solid rgba(201,154,63,0.12);
        }
        @media (min-width: 760px) {
          .footer-bar { flex-direction: row; justify-content: space-between; text-align: left; }
        }
        .footer-bar .footer-mission { max-width: none; }
        .footer-bar-text { margin: 0; line-height: 1.7; }
        .footer-bar-text .footer-tagline { margin-right: 4px; }
        @media (min-width: 760px) { .footer-bar-text .footer-tagline { display: inline; } }
        .footer-bar-right { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        @media (min-width: 760px) { .footer-bar-right { flex-direction: row; align-items: center; gap: 16px; } }

        /* ── Mobile (<760px): everything centered, motto on its own row ── */
        @media (max-width: 759px) {
          .footer-col { align-items: center; }
          .footer-bar-text .footer-tagline { display: block; margin-right: 0; margin-bottom: 6px; }
        }
      `}),e.jsxs("div",{className:"footer-inner",children:[e.jsx("div",{className:"footer-col footer-col-social",children:e.jsx("div",{className:"footer-socials",children:Ao.map(s=>e.jsx("a",{className:"footer-social",href:s.href,target:"_blank",rel:"noreferrer","aria-label":s.label,children:s.icon},s.id))})}),e.jsx("div",{className:"footer-brand",children:e.jsx("img",{className:"footer-seal",src:"/images/peciat-dogypt.webp",alt:r("about.footer.sealAlt")})}),e.jsx("div",{className:"footer-col footer-col-email",children:e.jsx("a",{className:"footer-email",href:"mailto:woof@dogypt.com",children:"woof@dogypt.com"})})]}),e.jsxs("div",{className:"footer-bar",children:[e.jsxs("p",{className:"footer-bar-text",children:[e.jsx("span",{className:"footer-tagline",children:r("about.footer.motto")})," ",e.jsx("span",{className:"footer-mission",children:r("about.footer.mission")})]}),e.jsxs("div",{className:"footer-bar-right",children:[e.jsxs("div",{className:"footer-links",children:[e.jsx("a",{href:"/privacy",children:r("about.footer.privacy")}),e.jsx("span",{children:"·"}),e.jsx("a",{href:"/terms",children:r("about.footer.terms")}),e.jsx("span",{children:"·"}),e.jsx("a",{href:"#",onClick:s=>{s.preventDefault(),window.dispatchEvent(new Event("dogypt:open-consent"))},children:r("consent.footerLink")})]}),e.jsx("p",{className:"footer-copy",children:"© 2026 DOGYPT"})]})]})]})}let me=null,we=0,tt=-1;const No=()=>{if(we>0&&tt===window.innerWidth)return we;me||(me=document.createElement("div"),me.setAttribute("aria-hidden","true"),me.style.cssText="position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none;",document.body.appendChild(me));const r=me.getBoundingClientRect().height;return we=r>1?r:window.innerHeight,tt=window.innerWidth,we},Po=()=>"https://placehold.co/800x500/15100a/15100a?text=%20";function ot({images:r,alt:s}){const c=K(),[p,h]=g.useState(0),d=r.length,b=g.useRef(null),w=g.useRef(0),f=T=>h(v=>(v+T+d)%d),j=T=>v=>{v.stopPropagation(),f(T)},N=T=>{b.current=T.clientX},C=T=>{if(b.current===null)return;const v=T.clientX-b.current;b.current=null,!(d<2)&&(v>30?f(-1):v<-30&&f(1))},_=T=>{if(d<2||Math.abs(T.deltaX)<=Math.abs(T.deltaY)||Math.abs(T.deltaX)<16)return;const v=Date.now();v<w.current||(w.current=v+420,f(T.deltaX>0?1:-1))};return e.jsxs("div",{className:"reel",onPointerDown:N,onPointerUp:C,onPointerLeave:C,onWheel:_,style:{touchAction:"pan-y"},children:[e.jsx("img",{src:r[p],alt:s,onError:T=>{const v=T.currentTarget;v.onerror=null,v.src=Po()}}),d>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"reel-arrow reel-prev",onClick:j(-1),"aria-label":c("about.reel.prev"),children:e.jsx("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"15 18 9 12 15 6"})})}),e.jsx("button",{type:"button",className:"reel-arrow reel-next",onClick:j(1),"aria-label":c("about.reel.next"),children:e.jsx("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"9 18 15 12 9 6"})})}),e.jsx("div",{className:"reel-dots","aria-hidden":!0,children:r.map((T,v)=>e.jsx("span",{className:`reel-dot${v===p?" on":""}`},v))})]})]})}const ye=[{id:1,images:["/images/about-slides/m1-1.webp","/images/about-slides/m1-2.webp","/images/about-slides/m1-3.webp","/images/about-slides/m1-4.webp"]},{id:2,images:["/images/about-slides/m2-1.webp","/images/about-slides/m2-2.webp","/images/about-slides/m2-3.webp","/images/about-slides/m2-4.webp","/images/about-slides/m2-5.webp"]},{id:3,images:["/images/about-slides/m3-1.webp","/images/about-slides/m3-2.webp","/images/about-slides/m3-3.webp"]},{id:4,images:["/images/about-slides/m4-1.webp","/images/about-slides/m4-2.webp","/images/about-slides/m4-3.webp","/images/about-slides/m4-4.webp","/images/about-slides/m4-5.webp"]},{id:5,images:["/images/about-slides/m5-1.webp"]}],To=["about.crawl.p1","about.crawl.p2","about.crawl.p3","about.crawl.p4","about.crawl.p5","about.crawl.p6"];function ke(r){const s=r.closest(".lsh-scroll")??window,c=s===window,p=()=>s;return{host:s,sy:()=>c?window.scrollY:p().scrollTop,vh:()=>c?No():p().clientHeight,vw:()=>c?window.innerWidth:p().clientWidth,top:h=>h.getBoundingClientRect().top-(c?0:p().getBoundingClientRect().top),scrollTo:h=>s.scrollTo({top:h,behavior:"smooth"})}}function _o({embedded:r=!1,part:s="all"}={}){const c=s!=="story",p=s!=="crawl"&&s!=="film",h=s==="all",d=s!=="film",b=K(),w=g.useRef(null),f=g.useRef(null),j=g.useRef(null),N=g.useRef(null),C=g.useRef(null),_=g.useRef(null),T=g.useRef(null),v=g.useRef(null),E=g.useRef(null),k=g.useRef(null),y=g.useRef(null),S=g.useRef(null);g.useEffect(()=>{if(window.location.hash!=="#council")return;const o=setTimeout(()=>{var a;(a=document.getElementById("council"))==null||a.scrollIntoView({behavior:"smooth",block:"start"})},220);return()=>clearTimeout(o)},[]);const u=()=>{const o=_.current;o&&ke(o).scrollTo(o.offsetTop+o.offsetHeight)};g.useEffect(()=>{var n;const o=(n=w.current)==null?void 0:n.querySelectorAll(".tl-row");if(!o||o.length===0)return;const a=new IntersectionObserver(i=>i.forEach(l=>{l.isIntersecting&&l.target.classList.add("in-view")}),{threshold:.18,rootMargin:"0px 0px -8% 0px"});return o.forEach(i=>a.observe(i)),()=>a.disconnect()},[]);const t=.1;return g.useEffect(()=>{const o=_.current,a=C.current,n=T.current,i=v.current,l=k.current,m=y.current;if(!o||!m)return;const x=ke(o);let A=0;const P=(B,F=0,G=1)=>Math.min(Math.max(B,F),G),z=(B,F,G)=>B+(F-B)*G,I=(B,F,G)=>P((B-F)/(G-F));let O=0,D=0,V=-1;const L=()=>{O=o.offsetHeight,D=m.offsetHeight},$=()=>{const B=x.vh();O||L();const F=x.top(o),G=F>B?0:F+O<-B?1:-1;if(G>=0&&V===G)return;const le=O-B,ne=G>=0?G:le>0?P(-F/le):0;V=ne;const U=d?ne:t+ne*(1-t),ae=I(U,0,.08);if(a&&(a.style.opacity=String(1-ae),a.style.transform=`scale(${z(1,.96,ae)})`,a.style.pointerEvents=ae>.98?"none":"auto"),n&&(n.style.opacity=String(z(0,.25,ae))),i&&(i.style.opacity=String(P(I(U,.1,.18)-I(U,.34,.4)))),E.current&&(E.current.style.opacity=String(P(I(U,.12,.2)-I(U,.34,.4)))),l){const ee=I(U,.42,.5),ie=I(U,.5,.6);l.style.transform=`translate(-50%, -50%) scale(${z(1,.04,ie)})`,l.style.opacity=String(P(ee-ie*1.1))}const Z=D||B,H=I(U,.56,1),J=z(Z+.12*B,-.85*B,H);m.style.opacity=String(P(I(U,.55,.6))),m.style.transform=`translateX(-50%) rotateX(28deg) translateY(${J}px)`},M=()=>{cancelAnimationFrame(A),A=requestAnimationFrame($)},q=()=>{L(),M()};$();const R=setTimeout(()=>{L(),$()},200);return document.fonts&&document.fonts.ready.then(()=>{L(),$()}).catch(()=>{}),x.host.addEventListener("scroll",M,{passive:!0}),window.addEventListener("resize",q),()=>{clearTimeout(R),x.host.removeEventListener("scroll",M),window.removeEventListener("resize",q),cancelAnimationFrame(A)}},[]),g.useEffect(()=>{const o=S.current,a=_.current;if(!o||!a)return;const n=ke(a);let i=0,l=0,m=n.vh();const x=(D,V=0,L=1)=>Math.min(Math.max(D,V),L),A=()=>{m=n.vh(),l=a.offsetTop+a.offsetHeight},P=()=>{const D=x((n.sy()-(l-m))/(.6*m));o.style.opacity=String(D),o.style.pointerEvents=D>.5?"auto":"none",o.style.transform=`translateY(${(D-1)*8}px)`},z=()=>{cancelAnimationFrame(i),i=requestAnimationFrame(P)},I=()=>{A(),z()};A(),P();const O=setTimeout(()=>{A(),P()},200);return n.host.addEventListener("scroll",z,{passive:!0}),window.addEventListener("resize",I),()=>{clearTimeout(O),n.host.removeEventListener("scroll",z),window.removeEventListener("resize",I),cancelAnimationFrame(i)}},[]),g.useEffect(()=>{const o=f.current,a=j.current;if(!o||!a)return;const n=o.querySelector(".hpin-head"),i=ke(o);let l=0;const m=(M,q=0,R=1)=>Math.min(Math.max(M,q),R),x=(M,q,R)=>M+(q-M)*R,A=M=>M<.5?2*M*M:1-Math.pow(-2*M+2,2)/2;let P=0,z=0,I=0;const O=()=>{P=i.sy()+i.top(o),z=o.offsetHeight;const M=a.querySelector(".hcard");I=M?M.getBoundingClientRect().width:a.offsetWidth},D=()=>{var $e;if(i.vw()<768){a.style.opacity="",n&&(n.style.transform="",n.style.opacity="");return}const M=a.querySelectorAll(".hcard"),q=M.length;if(q===0)return;const R=i.vh(),B=z-R,F=m(i.sy()-P,0,B),G=P-i.sy(),le=.92,ne=.13,U=50,ae=.04*R,Z=m((R-G)/(1*R)),H=G>0?Z:1+F/R;if(n){const oe=A(m((H-.6)/.8)),Ae=A(m((H-.55)/.55)),be=x(.9*R,ne*R+U,oe)-le*ae-Math.max(G,0);n.style.transform=`translateY(${be}px) scale(${le})`,n.style.opacity=String(Ae)}const J=Math.max(0,F-.45*R);a.style.opacity=String(m(J/(.25*R)));const ee=Math.max(0,F-.9*R),te=m(ee/Math.max(1,B-.9*R))*(q-1),ce=(I||a.offsetWidth)+200;M.forEach((oe,Ae)=>{const Ce=te-Ae,be=Math.abs(Ce);oe.style.opacity=be<1.5?"1":"0",oe.style.transform=`translate(-50%, calc(-50% + ${U}px)) translateX(${-Ce*ce}px)`,oe.style.zIndex=String(Math.round(100-be*10)),oe.style.pointerEvents=be<.5?"auto":"none"});const de=m(Math.round(te),0,q-1),Ee=($e=N.current)==null?void 0:$e.children;if(Ee)for(let oe=0;oe<Ee.length;oe++)Ee[oe].classList.toggle("on",oe===de)},V=()=>{cancelAnimationFrame(l),l=requestAnimationFrame(D)},L=()=>{O(),V()};O(),D();const $=setTimeout(()=>{O(),D()},200);return i.host.addEventListener("scroll",V,{passive:!0}),window.addEventListener("resize",L),()=>{clearTimeout($),i.host.removeEventListener("scroll",V),window.removeEventListener("resize",L),cancelAnimationFrame(l)}},[]),e.jsxs("div",{className:"lab-papyrus about-root flex flex-col relative",style:{overflowX:"clip"},children:[!r&&e.jsx(Fe,{path:"/about-lab",title:"About DOGYPT — The Movement Where Dog Is God",description:"From adopting Hekthor to a global dog religion. The story, the mission and the people behind DOGYPT."}),e.jsx("style",{children:`
        /* ── LAB: papyrusový podklad (tokeny = @/lib/labTheme, zhodné s ostatnými
           svetlými stránkami). Kotvenie na okno je prevzaté z pôvodnej
           .about-root.dark-bg::before: About je viac-obrazovková, takže podklad
           viazaný na výšku OBSAHU by sa roztiahol cez 340vh crawlu. */
        .lab-papyrus { position: relative; background-color: ${W.pageBg}; }
        .lab-papyrus::before {
          content: '';
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100lvh;
          background: ${W.pageBackdrop};
          z-index: 0;
          pointer-events: none;
        }
        .lab-papyrus > * { position: relative; z-index: 1; }

        /* ── LAB: BLOK „JOIN THE MISSION" (CouncilSection) ─────────────────
           Zdieľaný komponent, ale na rozdiel od citátov hviezd má vzhľad
           v triedach, nie v inline štýloch ⇒ stačí ho prebiť scopnuto.
           Samotná karta je papyrusová UŽ DNES (PAPYRUS LOCK z 26. 7.) — tmavé
           sú len dve veci: pás pod ňou a dlaždice rolí.
           Keď svetlý režim vyhrá, presunúť DO komponentu ako variant. */
        .lab-papyrus .council-section {
          /* Pás sa zlieva do pätičky rovnako ako sekcia s citátmi nad ním —
             koniec stránky je jeden povrch, nie tri rôzne plochy. */
          background: #EFDEBB;
        }
        .lab-papyrus .role-card {
          background: linear-gradient(135deg, #FBF5E6 0%, #F0DFB8 100%);
          border: 1.5px solid rgba(140,96,20,0.55);
        }
        .lab-papyrus .role-card:hover { filter: none; border-color: rgba(140,96,20,0.85); }
        .lab-papyrus .role-card.selected {
          filter: none;
          border-color: rgba(110,71,16,0.95);
          box-shadow: 0 0 0 2px rgba(201,154,63,0.55), 0 6px 18px rgba(110,71,16,0.28);
        }
        /* Ikonka bola biela cez brightness(0) invert(1) — na papyruse musí byť
           ATRAMENT, teda invert(1) padá. brightness(0) drží alfa kanál. */
        .lab-papyrus .role-icon { filter: brightness(0); opacity: 0.72; }
        .lab-papyrus .role-label { color: rgba(35,22,8,0.90); }
        .lab-papyrus .role-desc {
          color: rgba(35,22,8,0.88);
          background: linear-gradient(135deg, rgba(253,248,236,0.97) 0%, rgba(240,223,184,0.97) 100%);
        }
        @media (hover: none) {
          .lab-papyrus .role-desc { background: none; color: rgba(60,40,12,0.62); }
        }

        /* ── LAB: PÄTIČKA JE ZDIEĽANÝ KOMPONENT ────────────────────────────
           components/landing/Footer.tsx si nesie vlastný <style> s
           .dogypt-footer { background: #000 } a používajú ho aj ostré tmavé
           stránky. Prefarbiť ho v komponente teda nejde — zhaslo by to pätičku
           celého živého webu. Prebíja sa tu, cez .lab-papyrus, presne ako
           .cb-hint v /religion-lab.
           Keď sa svetlý režim odklepne a tmavé stránky zaniknú, toto pravidlo
           sa presunie DO komponentu a odtiaľto zmizne — nie je to trvalý stav.
           Pečať aj logá sú zlaté na priehľadnom, tie na papyruse držia samy. */
        .lab-papyrus .dogypt-footer {
          background: linear-gradient(180deg, #EFDEBB 0%, #E6D2A6 100%);
          border-top: 1px solid rgba(140,96,20,0.34);
        }
        .lab-papyrus .footer-tagline { color: #6E4A12; }
        .lab-papyrus .footer-mission { color: rgba(60,40,12,0.66); }
        .lab-papyrus .footer-col-title { color: rgba(60,40,12,0.58); }
        .lab-papyrus .footer-social {
          color: rgba(35,22,8,0.80);
          border-color: rgba(140,96,20,0.45);
          background: rgba(255,252,244,0.55);
        }
        .lab-papyrus .footer-social:hover {
          color: #6E4A12;
          border-color: rgba(140,96,20,0.80);
          background: rgba(255,252,244,0.90);
        }
        .lab-papyrus .footer-email {
          color: #6E4A12;
          border-bottom-color: rgba(140,96,20,0.55);
          text-shadow: none;
        }
        .lab-papyrus .footer-email:hover { color: #8a5a14; border-bottom-color: #8a5a14; }
        .lab-papyrus .footer-links a { color: rgba(60,40,12,0.62); }
        .lab-papyrus .footer-links a:hover { color: rgba(35,22,8,0.90); }
        .lab-papyrus .footer-links span { color: rgba(60,40,12,0.34); }
        .lab-papyrus .footer-copy { color: rgba(60,40,12,0.52); }
        .lab-papyrus .footer-bar { border-top-color: rgba(140,96,20,0.28); }

        /* ── Headline ── */
        .about-quote {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(2.6rem, 5.6vw, 4.4rem); line-height: 1.08; letter-spacing: 0.01em; margin: 0;
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        .about-quote .aq-white {
          -webkit-text-fill-color: rgba(35,22,8,0.90); color: rgba(35,22,8,0.90);
        }
        .about-sub {
          font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(1rem, 1.7vw, 1.45rem);
          color: rgba(35,22,8,0.88); letter-spacing: 0.04em; margin: 0;
        }
        .hero-intro {
          font-family: 'Space Grotesk', sans-serif; font-size: clamp(1rem, 1.25vw, 1.15rem); font-weight: 400;
          color: rgba(60,40,12,0.66); line-height: 1.7; margin: 0; max-width: 540px;
          display: flex; flex-direction: column; gap: 0.7em;
        }
        .hero-intro p { margin: 0; text-wrap: balance; }
        .hero-intro strong { font-weight: 700; color: rgba(35,22,8,0.90); }

        /* ── Signature ── */
        .about-signoff {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0;
          font-size: clamp(1.05rem, 1.5vw, 1.3rem); letter-spacing: 0.09em; text-transform: uppercase;
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        .about-signoff .amp {
          -webkit-text-fill-color: rgba(60,40,12,0.58); color: rgba(60,40,12,0.58);
          font-weight: 400; text-transform: lowercase; font-size: 0.78em; letter-spacing: 0.04em; padding: 0 0.18em;
          filter: none;
        }
        @media (max-width: 767px) {
          .about-quote { font-size: clamp(2.3rem, 10.5vw, 3.1rem); }
          .about-sub { font-size: 1.05rem; }
          .hero-intro { font-size: 0.9rem; max-width: 100%; }
        }

        /* ── Hero ── */
        .hero-grid {
          display: flex; flex-direction: column; gap: clamp(22px, 4vh, 36px);
          width: 100%; max-width: 1120px; align-items: center; text-align: center;
        }
        @media (min-width: 768px) {
          .hero-grid {
            display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
            gap: clamp(40px, 5vw, 80px); align-items: center; text-align: left;
          }
        }
        .hero-photo {
          position: relative; width: 100%; max-width: min(58vh, 480px); aspect-ratio: 1 / 1;
          border-radius: 16px; overflow: hidden; margin: 0 auto; background: #E6D2A6;
          box-shadow: 0 12px 36px rgba(110,71,16,0.26), 0 0 0 1px rgba(140,96,20,0.28) inset;
        }
        @media (max-width: 767px) { .hero-photo { max-width: min(50vh, 320px); } }
        .hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .scroll-hint {
          display: flex; flex-direction: column; align-items: center;
          color: #8a5a14; animation: hintBob 1.9s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(230,184,74,0.55)) drop-shadow(0 0 3px rgba(230,184,74,0.7));
        }
        @keyframes hintBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }

        /* ── Timeline ── */
        .tl-section { width: 100%; display: flex; flex-direction: column; align-items: center; padding: clamp(20px,6vh,64px) 20px clamp(40px,9vh,90px); position: relative; z-index: 2; }
        .tl-head { text-align: center; margin-bottom: clamp(26px, 5vh, 52px); }
        .tl-eyebrow {
          font-family: 'Cinzel', serif; font-size: clamp(0.6rem,0.9vw,0.72rem); letter-spacing: 0.34em;
          text-transform: uppercase; color: rgba(60,40,12,0.52); margin: 0 0 10px;
        }
        .tl-h2 {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: clamp(2.5rem, 6vw, 5rem);
          /* line-height + padding-top = headroom pre verzálkovú diakritiku (PRÍBEH/PŘÍBĚH),
             inak background-clip:text oseká í/ř/ě nad veľkým písmenom. */
          margin: 0; text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.12; padding-top: 0.18em;
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 2px rgba(110,71,16,0.24));
        }

        /* ── Cards (shared) ── */
        .tl-card {
          /* LAB: karta kroniky na MOBILE (na PC to isté rieši .hcard vyššie). */
          background: linear-gradient(180deg, #FDF8EC 0%, #F1E1BE 100%);
          border: 1px solid ${W.edge}; border-radius: 14px; overflow: hidden;
          box-shadow: 0 14px 40px rgba(110,71,16,0.28);
        }
        .tl-img { position: relative; width: 100%; aspect-ratio: 1 / 1; background: #E6D2A6; }
        .tl-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        /* mobile story photos: square frame, whole photo visible (no crop) */
        .tl-img .reel > img { object-fit: contain; }
        .tl-img::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(60,40,12,0.28) 100%); }

        /* ── Image reel (carousel) — fills its parent photo frame ── */
        .reel { position: absolute; inset: 0; }
        .reel > img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .reel-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 4;
          width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
          border-radius: 999px; cursor: pointer; color: rgba(35,22,8,0.90);
          /* LAB: šípky ležia NAD fotkou, takže potrebujú vlastnú plochu, nie
             priesvitný závoj — tmavé sklo s tmavým inkoustom je nečitateľné. */
          background: rgba(253,248,236,0.88); border: 1px solid rgba(140,96,20,0.55);
          backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
          opacity: 0.78; transition: opacity .2s ease, background .2s ease, color .2s ease;
        }
        .reel-arrow:hover { opacity: 1; color: #6E4A12; background: rgba(255,252,244,0.86); }
        .reel-prev { left: 10px; }
        .reel-next { right: 10px; }
        .reel-dots { position: absolute; left: 0; right: 0; bottom: 12px; z-index: 4; display: flex; justify-content: center; gap: 7px; pointer-events: none; }
        .reel-dot { width: 7px; height: 7px; border-radius: 999px; background: rgba(140,96,20,0.40); box-shadow: 0 1px 3px rgba(110,71,16,0.32); transition: width .3s ease, background .3s ease; }
        .reel-dot.on { width: 20px; background: #8a5a14; }
        @media (max-width: 767px) { .reel-arrow { width: 34px; height: 34px; } }
        .tl-body-wrap { padding: clamp(16px, 2vw, 22px) clamp(18px, 2.2vw, 26px) clamp(18px, 2.4vw, 24px); }
        .tl-year {
          display: inline-block; font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.72rem;
          letter-spacing: 0.2em; color: #6E4A12; border: 1px solid rgba(140,96,20,0.55);
          padding: 3px 12px; border-radius: 999px; margin-bottom: 12px;
        }
        .tl-title { font-family: 'Cinzel', serif; font-weight: 700; font-size: clamp(1.1rem, 1.7vw, 1.35rem); color: rgba(35,22,8,0.90); margin: 0 0 9px; letter-spacing: 0.01em; }
        .tl-text { font-family: 'Space Grotesk', sans-serif; font-size: clamp(0.85rem, 1vw, 0.95rem); line-height: 1.65; color: rgba(35,22,8,0.82); margin: 0; }

        .tl-node {
          position: absolute; width: 15px; height: 15px; border-radius: 50%; z-index: 3;
          background: radial-gradient(circle at 35% 30%, #D8A93F, #6E4A12 70%);
          box-shadow: 0 0 0 4px rgba(201,154,63,0.18), 0 0 14px rgba(201,154,63,0.6);
        }
        .tl-conn { position: absolute; background: rgba(201,154,63,0.5); z-index: 1; }
        .tl-row { opacity: 0; transform: translateY(26px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .tl-row.in-view { opacity: 1; transform: none; }
        .tl-hint { display: none; }

        /* ── MOBILE (base): vertical single column, line on the left ── */
        /* 🔴 SELEKTOR MUSÍ OSTAŤ ZÚŽENÝ NA .tl-section.
           Holé .tl je dvojznakový globálny názov a v LabShell aj vo filme
           (/onepage) sú všetky stránky namontované NARAZ. Trafilo to ľavý horný
           roh zlatého rámu okolo ústavy v náboženstve — ten má triedy
           "codex-frame tl", rovnakú špecificitu (0,1,0), a keďže sa tento blok
           vkladá neskôr, vyhral: z rohu sa stal prvok V TOKU (position: relative,
           2x22 px uprostred odseku) namiesto rohu rámu. Zvyšné tri rohy (.tr,
           .bl, .br) obdobu nemajú, takže vyzeralo, že je pokazený jeden roh.
           Matej 26. 8. 2026: *„vidím že ti 4 rohy pri citácii ústavy nie sú
           dobre, lavy horny roh je zle… na ostrom webe /religion táto pasáž
           funguje skvele."* — a naozaj: tam About namontovaný nie je.
           ⚠️ Ostrý About.tsx má tú istú vetu bez zúženia. Nechaná zámerne
           (ostrý web sa v tejto vetve nedotýka) — ale ak sa doňho niekedy
           siahne, patrí sem tá istá oprava. */
        .tl-section .tl { position: relative; width: 100%; max-width: 520px; }
        .tl-section .tl::before {
          content: ''; position: absolute; top: 8px; bottom: 8px; left: 13px; width: 2px;
          background: linear-gradient(180deg, rgba(201,154,63,0) 0%, rgba(201,154,63,0.55) 8%, rgba(201,154,63,0.55) 92%, rgba(201,154,63,0) 100%);
        }
        .tl-row { position: relative; width: 100%; box-sizing: border-box; padding: 0 0 0 42px; margin-bottom: 26px; }
        .tl-node { top: 24px; left: 6px; }
        .tl-conn { top: 30px; left: 14px; height: 1.5px; width: 22px; }

        /* mobile timeline hidden on desktop (PC uses pinned carousel below) */
        @media (min-width: 768px) { .tl-section { display: none; } }

        /* ── Sticky nav (appears from Story section onward) ── */
        .about-sticky-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          opacity: 0; pointer-events: none; will-change: opacity, transform;
          padding-bottom: 52px;            /* fade runway below the nav content */
          /* LAB: podklad je papyrus, nie čierna. Maska ostáva NEDOTKNUTÁ —
             mask-image je ALFA maska, tie #000 v nej neznamenajú farbu, ale
             „nepriehľadné". Preto prežije akékoľvek pozadie a fade nemá šev. */
          background: ${W.pageBg};
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          -webkit-mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
        }

        /* ===== PC PINNED CINEMATIC REVEAL ===== */
        /* ── Star Wars opening crawl (all viewports) ── */
        .swcrawl { position: relative; z-index: 2; }
        .swcrawl-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }
        .op-hero { position: absolute; inset: 0; display: flex; flex-direction: column; will-change: opacity, transform; }

        /* ── Opening SCROLL cue (clean dark screen before the crawl) ── */
        .scroll-intro {
          flex: 1; min-height: 0; position: relative;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: clamp(8px, 1.4vh, 16px); text-align: center; padding: 0 24px;
        }
        .origin-title {
          /* size matched to Religion .codex-headline (the larger hero heading) so
             the main title is identical across pages. Mobile overridden below. */
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0; line-height: 1.08;
          /* padding-top dáva headroom pre diakritiku (Ů/ô) — background-clip:text inak
             oseká krúžok/striešku nad veľkým písmenom (gradient nepokryje, fill=transparent). */
          text-transform: uppercase; letter-spacing: 0.1em; padding: 0.2em 0 0 0.1em;
          font-size: clamp(2.85rem, 6.84vw, 5.32rem);
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        .origin-sub {
          /* Veta / scroll-cue, NIE nadpis → Space Grotesk (sekundárny font), nie Cinzel.
             Symetrické tmavé halo drží tenkú diakritiku (ČÍTAJ/POSUŇ) čitateľnú proti
             busy hieroglyf pozadiu — nie je to background-clip clip, len kontrast. */
          font-family: 'Space Grotesk', sans-serif; font-weight: 500; margin: 0; text-transform: uppercase;
          font-size: clamp(0.82rem, 1.5vw, 1.05rem); letter-spacing: 0.22em; padding-left: 0.22em;
          color: rgba(35,22,8,0.88);
          text-shadow: 0 0 3px rgba(253,248,236,0.95), 0 0 10px rgba(253,248,236,0.85);
        }
        .scroll-cue { display: flex; flex-direction: column; align-items: center; color: #8a5a14; margin-top: clamp(10px, 2.2vh, 22px); }
        .scroll-cue svg { display: block; margin-top: -18px; opacity: 0.32; filter: drop-shadow(0 1px 2px rgba(110,71,16,0.30)); animation: scrollCue 1.6s ease-in-out infinite; }

        /* ── Flanking figures (Matej left, Hekthor right) with warm halo ── */
        .about-fig {
          position: absolute; bottom: 0; z-index: 1; pointer-events: none;
          height: 64vh; display: flex; align-items: flex-end; justify-content: center;
        }
        .about-fig img { height: 100%; width: auto; object-fit: contain; display: block;
          filter: drop-shadow(0 12px 34px rgba(110,71,16,0.34)); }
        .about-fig::before {
          content: ''; position: absolute; left: 50%; bottom: 6%; transform: translateX(-50%);
          width: 118%; aspect-ratio: 1 / 1; border-radius: 50%; z-index: -1;
          background: radial-gradient(circle, rgba(201,154,63,0.30) 0%, rgba(201,154,63,0.10) 42%, transparent 70%);
          filter: blur(6px);
        }
        /* Inner edge pinned to a fixed viewport fraction (NOT fixed px) so the
           centre column (32vw–68vw) stays clear for the title at ANY width.
           Anchor each figure to the OUTER edge (natural width, NO clamp → no
           squish, image keeps aspect + sits on the bottom edge) then translate
           so the inner edge lands on 32vw / 68vw; the outer arm bleeds off.
           (NB: anchoring via right:68vw+width:auto clamped the box to 32vw and
           squished the photo + lifted it off the floor → use transform.) */
        /* Matej = exact MIRROR of Hekthor (same height + mirrored anchor) so he
           behaves identically at every width. A bigger figure shows a smaller
           fraction of itself inside the fixed 32vw on-screen slice → his face
           got cut at narrow widths while Hekthor (smaller) stayed whole. Equal
           size → equal visible fraction → both read cleanly, symmetrically. */
        /* Size blends vh+vw (max) so wide-short windows don't shrink the figures;
           inner anchor capped (min 32vw, 460px) so very wide windows don't fling
           them into the far corners. 16"/mobile land in the same band as before. */
        .fig-matej { left: 0; right: auto; transform: translateX(calc(min(32vw, 460px) - 100% + 200px)); height: clamp(440px, max(70vh, 38vw), 820px); }
        .fig-hekthor { right: 0; left: auto; transform: translateX(calc(100% - min(32vw, 460px) - 80px)); height: clamp(300px, max(48vh, 26vw), 560px); }

        /* PC: lift the title block toward the upper third */
        @media (min-width: 768px) { .scroll-intro { padding-bottom: 18vh; } }

        /* ── Clickable skip — 150px from the bottom edge ── */
        .about-skip {
          position: absolute; left: 50%; bottom: 64px; transform: translateX(-50%);
          z-index: 5; pointer-events: auto; cursor: pointer; background: none; border: none;
          font-family: 'Space Grotesk', sans-serif; font-weight: 500; text-transform: uppercase;
          letter-spacing: 0.18em; padding-left: 0.18em;
          font-size: clamp(0.66rem, 1.1vw, 0.78rem); color: rgba(60,40,12,0.62);
          transition: color 0.25s ease;
        }
        .about-skip:hover { color: #8a5a14; }
        .about-skip { text-shadow: 0 0 3px rgba(253,248,236,0.95), 0 1px 8px rgba(253,248,236,0.85); }

        @media (max-width: 767px) {
          /* lift the whole text block (title+sub+arrows) to the same start
             height as the Religion hero (~181px from top) instead of centering */
          .scroll-intro { justify-content: flex-start; padding-top: 92px; }
          /* skip flows under the arrows (visible) instead of behind the figures */
          .about-skip { position: static; transform: none; left: auto; bottom: auto; margin-top: 14px; }
          .origin-title { font-size: clamp(2.2rem, 11vw, 3.4rem); }
          .fig-matej { height: 46vh; left: -58px; right: auto; transform: none; opacity: 0.92; }
          .fig-hekthor { height: 30vh; right: 4px; left: auto; transform: none; opacity: 0.92; }
        }
        .scroll-cue svg:nth-child(1) { animation-delay: 0s; }
        .scroll-cue svg:nth-child(2) { animation-delay: 0.18s; }
        .scroll-cue svg:nth-child(3) { animation-delay: 0.36s; }
        @keyframes scrollCue { 0%, 100% { opacity: 0.38; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .scroll-cue svg { animation: none; opacity: 0.55; } }

        /* ── Outro CTA button (btn-gold canonical, scoped locally) ── */
        .about-outro .btn-gold {
          padding: 14px 36px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250,244,236,0.30);
          border-radius: 8px; color: #000;
          font-family: 'Cinzel', serif; font-size: 0.88rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: transform 0.2s, box-shadow 0.22s;
          box-shadow: 0 0 40px rgba(230,158,26,0.38), inset 0 1px 0 rgba(255,255,255,0.28);
        }
        .about-outro .btn-gold:hover {
          transform: scale(1.04);
          box-shadow: 0 0 56px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.28);
        }

        /* ── Outro hero (moved to the very bottom of the page) ── */
        .about-outro {
          position: relative; z-index: 2; background: ${W.pageBg};
          display: flex; align-items: center; justify-content: center;
          padding: clamp(56px, 12vh, 130px) 20px;
        }

        .sw-intro {
          position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); pointer-events: none;
          margin: 0; width: min(86vw, 760px); text-align: center; opacity: 0;
          /* LAB: modrá ostáva modrá (je to poklona Star Wars, nie ozdoba), ale
             svetlomodrá so svetelnou žiarou je na papyruse neviditeľná — na
             tmavej sále svietila, tu musí byť ATRAMENT. Žiara preto padá a
             odtieň sa prehlbuje. */
          color: #1D3C86; font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(1.05rem, 2.2vw, 1.6rem); line-height: 1.5;
          text-shadow: 0 0 10px rgba(253,248,236,0.90), 0 1px 2px rgba(29,60,134,0.22);
          will-change: opacity;
        }
        .sw-slow {
          position: absolute; left: 50%; bottom: clamp(96px, 14vh, 140px); transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0; pointer-events: none;
          color: #1D3C86; font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .22em;
          text-transform: uppercase; white-space: nowrap; will-change: opacity;
        }
        .sw-slow-arr { display: flex; flex-direction: column; align-items: center; line-height: 0; }
        .sw-slow-arr svg { display: block; margin-top: -2px; animation: swSlow 2.4s ease-in-out infinite; }
        .sw-slow-arr svg:nth-child(2) { animation-delay: .5s; }
        .sw-slow-arr svg:nth-child(3) { animation-delay: 1s; }
        @keyframes swSlow { 0%, 100% { opacity: .25; } 40% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .sw-slow-arr svg { animation: none; opacity: .7; } }
        .sw-logo {
          position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(1);
          width: min(72vw, 720px); height: auto; opacity: 0; pointer-events: none;
          filter: drop-shadow(0 10px 30px rgba(110,71,16,0.35)); will-change: transform, opacity;
        }
        .sw-stage {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none;
          perspective: 320px; perspective-origin: 50% 0%;
          -webkit-mask-image: linear-gradient(to top, #000 14%, rgba(0,0,0,0.92) 34%, transparent 76%);
          mask-image: linear-gradient(to top, #000 14%, rgba(0,0,0,0.92) 34%, transparent 76%);
        }
        .sw-crawl-text {
          position: absolute; left: 50%; bottom: 0; width: min(92vw, 720px);
          transform-origin: 50% 100%;
          transform: translateX(-50%) rotateX(28deg) translateY(92vh); opacity: 0;
          /* LAB: crawl ostáva zlatý, ale na papyruse musí byť tmavý — svetlá
             žltá by na bledom plátne nebola text, ale hmla. Vynáranie do stratena
             robí mask-image na .sw-stage (alfa maska), takže sa NEMENÍ: text sa
             tam nestráca do čiernej, ale do priehľadna — teda do papyrusu. */
          color: #6E4A12; font-family: 'Cinzel', serif; text-align: justify;
          text-shadow: 0 1px 1px rgba(253,248,236,0.75); will-change: transform;
        }
        .sw-crawl-text .sw-episode {
          text-align: center; text-transform: uppercase; letter-spacing: 0.4em;
          font-size: clamp(0.9rem, 1.6vw, 1.15rem); margin: 0 0 0.4em; opacity: 0.85;
        }
        .sw-crawl-text .sw-ctitle {
          text-align: center; text-transform: uppercase; font-weight: 700;
          font-size: clamp(2.2rem, 6vw, 4rem); margin: 0 0 8vh; letter-spacing: 0.04em;
        }
        .sw-crawl-text p:not(.sw-episode) {
          font-size: clamp(1.15rem, 2.3vw, 1.7rem); line-height: 1.55; font-weight: 700; margin: 0 0 4vh;
        }

        .hpin { display: none; }
        @media (min-width: 768px) {
          .hpin { display: block; position: relative; z-index: 2; }  /* height inline = (N+1)×100vh */
          .hpin-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }

          .hpin-head {
            position: absolute; left: 0; right: 0; top: 0; padding-top: 4vh;
            text-align: center; z-index: 50; pointer-events: none;
            transform-origin: center top; will-change: transform;
          }
          .hpin-head .tl-h2 { margin: 0; }

          /* stage fills the viewport; cards are stacked + centred, driven by JS */
          .hpin-stage { position: absolute; inset: 0; opacity: 0; }

          .hcard {
            position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%);
            /* shrink the block: always ≥160px breathing room each side on PC, capped 900px */
            width: min(900px, calc(100vw - 320px)); will-change: transform, opacity;
            display: flex; align-items: center; gap: clamp(26px, 3vw, 50px);
            /* LAB: papyrusová karta. Rám je PLNÝ zlatý (nie vyblednutý hairline) —
               karta stojí na papyrusovom podklade, takže ju od plochy odlíši len
               rám a tieň, nie výplň. Rovnaký dôvod, pre ktorý má matrica v /packu
               na úrovni KARTA rám 1.5px. */
            background: linear-gradient(160deg, #FDF8EC 0%, #F6E9CE 52%, #EEDDB4 100%);
            border: 1.5px solid ${W.edge}; border-radius: 22px;
            padding: clamp(26px, 2.8vw, 44px);
            box-shadow: ${W.shadow}, inset 0 1px 0 rgba(255,252,244,0.85);
          }
          .hcard-photo {
            position: relative;
            flex: 0 0 auto; width: min(42vh, 400px); aspect-ratio: 1 / 1; border-radius: 14px; overflow: hidden;
            background: #E6D2A6; box-shadow: 0 0 0 1px rgba(140,96,20,0.28) inset;
          }
          .hcard-photo img {
            width: 100%; height: 100%; object-fit: cover; display: block;
            animation: kenburns 16s ease-in-out infinite alternate;
          }
          @keyframes kenburns { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
          .hcard-text { flex: 1 1 auto; min-width: 0; }
          .hcard-text .tl-year { font-size: 0.8rem; margin-bottom: 16px; }
          .hcard-text .tl-title { font-size: clamp(1.6rem, 2.7vw, 2.3rem); margin-bottom: 16px; }
          .hcard-text .tl-text { font-size: clamp(0.98rem, 1.2vw, 1.12rem); line-height: 1.7; max-width: 560px; }

          .hpin-dots { position: absolute; left: 0; right: 0; bottom: clamp(26px, 5vh, 52px); justify-content: center; display: flex; gap: 9px; z-index: 50; }
          .hpin-dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(140,96,20,0.32); transition: width .35s ease, background .35s ease; }
          .hpin-dot.on { width: 26px; background: #8a5a14; }

          @media (prefers-reduced-motion: reduce) { .hcard-photo img { animation: none; } }
        }
      `}),e.jsx("div",{"aria-hidden":!0,className:"lab-pageveil",style:{position:"fixed",inset:0,background:W.pageVeil,zIndex:1,pointerEvents:"none"}}),e.jsx("div",{ref:T,"aria-hidden":!0,style:{position:"fixed",inset:0,background:W.pageBg,opacity:0,zIndex:1,pointerEvents:"none"}}),e.jsx("div",{className:"about-sticky-nav",ref:S,children:!r&&e.jsx(je,{withNav:!0})}),c&&e.jsx("section",{className:"swcrawl",ref:_,style:{height:"340vh"},children:e.jsxs("div",{className:"swcrawl-sticky",children:[d&&e.jsxs("div",{ref:C,className:"op-hero",children:[!r&&e.jsx(je,{withNav:!0}),e.jsx("div",{className:"about-fig fig-matej","aria-hidden":!0,children:e.jsx("img",{src:"/images/about-matej.webp",alt:""})}),e.jsx("div",{className:"about-fig fig-hekthor","aria-hidden":!0,children:e.jsx("img",{src:"/images/about-hekthor.webp",alt:""})}),e.jsxs("div",{className:"scroll-intro",style:{zIndex:3},children:[e.jsx("h1",{className:"origin-title",dangerouslySetInnerHTML:{__html:b("about.origin.title")}}),e.jsx("p",{className:"origin-sub",children:b("about.origin.sub")}),e.jsxs("div",{className:"scroll-cue","aria-hidden":!0,children:[e.jsx("svg",{width:"40",height:"40",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"6 9 12 15 18 9"})}),e.jsx("svg",{width:"40",height:"40",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"6 9 12 15 18 9"})}),e.jsx("svg",{width:"40",height:"40",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"6 9 12 15 18 9"})})]}),e.jsx("button",{type:"button",className:"about-skip",onClick:u,children:b("about.origin.skip")})]})]}),e.jsx("p",{className:"sw-intro",ref:v,children:b("about.crawl.intro")}),e.jsxs("div",{className:"sw-slow",ref:E,"aria-hidden":!0,children:[e.jsx("span",{className:"sw-slow-arr",children:[0,1,2].map(o=>e.jsx("svg",{width:"14",height:"10",viewBox:"0 0 24 16",fill:"none",stroke:"currentColor",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"5 4 12 11 19 4"})},o))}),b("about.crawl.slow")]}),e.jsx("img",{...ao(),className:"sw-logo",ref:k,src:"/images/dogypt-gold-logo.webp",alt:"DOGYPT"}),e.jsx("div",{className:"sw-stage",children:e.jsxs("div",{className:"sw-crawl-text",ref:y,children:[e.jsx("p",{className:"sw-episode",children:b("about.crawl.episode")}),e.jsx("h2",{className:"sw-ctitle",children:b("about.crawl.faith")}),To.map(o=>e.jsx("p",{children:b(o)},o))]})})]})}),p&&e.jsxs(e.Fragment,{children:[e.jsx("section",{className:"hpin",style:{height:`${(ye.length+1)*100}vh`,marginTop:c?"-100vh":0},ref:f,children:e.jsxs("div",{className:"hpin-sticky",children:[e.jsx("div",{className:"hpin-head",children:e.jsx("h2",{className:"tl-h2",children:b("about.timeline.heading")})}),e.jsx("div",{className:"hpin-stage",ref:j,children:ye.map(o=>e.jsxs("article",{className:"hcard",children:[e.jsx("div",{className:"hcard-photo",children:e.jsx(ot,{images:o.images,alt:b(`about.milestone.${o.id}.tag`)})}),e.jsxs("div",{className:"hcard-text",children:[e.jsx("span",{className:"tl-year",children:b(`about.milestone.${o.id}.year`)}),e.jsx("h3",{className:"tl-title",children:b(`about.milestone.${o.id}.title`)}),e.jsx("p",{className:"tl-text",children:b(`about.milestone.${o.id}.body`)})]})]},o.id))}),e.jsx("div",{className:"hpin-dots",ref:N,children:ye.map((o,a)=>e.jsx("span",{className:`hpin-dot${a===0?" on":""}`},o.id))})]})}),e.jsxs("section",{className:"tl-section",children:[e.jsx("div",{className:"tl-head",children:e.jsx("h2",{className:"tl-h2",children:b("about.timeline.heading")})}),e.jsx("div",{className:"tl",ref:w,children:ye.map(o=>e.jsxs("div",{className:"tl-row",children:[e.jsx("span",{className:"tl-node"}),e.jsx("span",{className:"tl-conn"}),e.jsxs("article",{className:"tl-card",children:[e.jsx("div",{className:"tl-img",children:e.jsx(ot,{images:o.images,alt:b(`about.milestone.${o.id}.tag`)})}),e.jsxs("div",{className:"tl-body-wrap",children:[e.jsx("span",{className:"tl-year",children:b(`about.milestone.${o.id}.year`)}),e.jsx("h3",{className:"tl-title",children:b(`about.milestone.${o.id}.title`)}),e.jsx("p",{className:"tl-text",children:b(`about.milestone.${o.id}.body`)})]})]})]},o.id))})]}),e.jsx(zo,{variant:"papyrus"}),e.jsx(Eo,{}),e.jsx("section",{className:"about-outro",style:{textAlign:"center"},children:e.jsxs("div",{className:"flex flex-col",style:{alignItems:"center",gap:"clamp(16px, 2.6vh, 24px)",maxWidth:820},children:[e.jsxs("h1",{className:"about-quote",children:[e.jsx("span",{className:"aq-white",children:b("about.outro.quoteLead")})," ",b("about.outro.quoteTail")]}),e.jsx("div",{className:"hero-intro",style:{textAlign:"center",alignItems:"center",maxWidth:"100%"},children:e.jsx("p",{dangerouslySetInnerHTML:{__html:b("about.outro.body")}})}),e.jsxs("p",{className:"about-signoff",children:[b("about.outro.name1")," ",e.jsx("span",{className:"amp",children:b("about.outro.and")})," ",b("about.outro.name2")]}),e.jsx("a",{href:"/heroglyph/name",className:"btn-gold",style:{marginTop:8,marginBottom:100},children:b("about.outro.cta")})]})})]}),h&&e.jsx(Co,{})]})}const pe=[{id:"home",path:"/wall-lab",navKey:"nav.home"},{id:"vision",path:"/vision-lab",navKey:"nav.vision"},{id:"religion",path:"/religion-lab",navKey:"nav.religion"},{id:"about",path:"/about-lab",navKey:"nav.about"}],at="lab-swipe-mode",it=34,nt=10,Io=.22,Lo=110;function da(){const r=K(),s=st(),c=Be(),p=Math.max(0,pe.findIndex(k=>k.path===c.pathname)),[h,d]=g.useState(()=>{try{const k=localStorage.getItem(at);if(k==="edge"||k==="free"||k==="click")return k}catch{}return"edge"}),b=k=>{d(k);try{localStorage.setItem(at,k)}catch{}},[w,f]=g.useState(0),[j,N]=g.useState(!1),C=g.useRef(null),_=g.useCallback(k=>{const y=Math.min(pe.length-1,Math.max(0,k));y!==p&&s(pe[y].path)},[p,s]);g.useEffect(()=>{const k=y=>{const S=document.activeElement;S&&S.closest('input, textarea, [contenteditable="true"]')||(y.key==="ArrowRight"&&_(p+1),y.key==="ArrowLeft"&&_(p-1))};return window.addEventListener("keydown",k),()=>window.removeEventListener("keydown",k)},[_,p]);const T=k=>{if(h==="click"||k.pointerType==="mouse"&&h!=="edge")return;const y=k.target;if(y.closest(".main-nav, .nav-login, .gods-bottom-bar, .numpad-overlay, .lang-modal-root, .lsh-modeswitch"))return;const S=p===0||!!y.closest(".gods-root, .planet-ball");(h==="edge"||S)&&k.clientX>it&&k.clientX<window.innerWidth-it||(C.current={id:k.pointerId,x:k.clientX,y:k.clientY,live:!1,armed:!0})},v=k=>{const y=C.current;if(!y||y.id!==k.pointerId||!y.armed)return;const S=k.clientX-y.x,u=k.clientY-y.y;if(!y.live){if(Math.abs(S)<nt&&Math.abs(u)<nt)return;if(Math.abs(u)>Math.abs(S)){C.current=null;return}y.live=!0,N(!0)}const t=S>0&&p===0||S<0&&p===pe.length-1;f(t?S*.28:S)},E=k=>{const y=C.current;if(C.current=null,!y||!y.live){f(0),N(!1);return}const S=k.clientX-y.x,u=Math.min(Lo,window.innerWidth*Io);f(0),N(!1),S<=-u?_(p+1):S>=u&&_(p-1)};return e.jsxs("div",{className:`lsh-root${j?" is-dragging":""}`,onPointerDown:T,onPointerMove:v,onPointerUp:E,onPointerCancel:E,children:[e.jsx("style",{children:`
        /* ── PLOCHA ────────────────────────────────────────────────────────
           Papyrus kreslí rám, nie stránka — medzi panelmi tak pri swipe nikdy
           neprebliskne čierna. */
        .lsh-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background-color: ${W.pageBg};
          --lsh-nav-h: 68px;
        }
        .lsh-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: ${W.pageBackdrop};
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
          padding: ${X.rim+5}px ${X.rim+15}px;
          background: ${xt};
          background-blend-mode: ${bt};
          border: ${X.line}px solid ${Q.edge};
          border-radius: ${X.frame}px;
          box-shadow: ${ft};
        }
        /* DOSKA a ZRNO idú na z-index -1 (nie 0) — obsah pilulky býva holý
           textový uzol, ten sa nedá zdvihnúť, tak sa musí podliezť. */
        .main-nav::before {
          content: '';
          position: absolute;
          inset: ${X.rim}px;
          border-radius: ${X.plate}px;
          background: ${vt};
          background-blend-mode: ${wt};
          border: ${X.line}px solid ${Q.edge};
          box-shadow: ${yt};
          pointer-events: none;
          z-index: -1;
        }
        .main-nav::after {
          content: '';
          position: absolute;
          inset: ${X.rim}px;
          border-radius: ${X.plate}px;
          ${kt}
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
          color: ${Q.ink};
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
          border: ${X.line}px solid transparent;
          border-radius: 999px;
        }
        .main-nav button.is-on {
          opacity: 1;
          background: ${Q.activeFill};
          border-color: ${Q.edge};
          box-shadow: ${Pe};
        }
        .main-nav button.is-on:hover { opacity: 1; }
        .main-nav .lang-trigger { color: ${Q.ink}; }
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
          background: ${Q.activeFill};
          border: ${X.line}px solid ${Q.edge};
          box-shadow: ${Pe};
          color: ${Q.ink};
        }
        .main-nav .nav-login:hover { opacity: 0.75; }

        @media (max-width: 768px) {
          .lsh-root { --lsh-nav-h: 58px; }
          .nav-top { top: 10px; }
          /* Vlajka je na mobile v SPODNEJ lište (kreslí ju wall), tu by bola druhá. */
          .nav-lang-desktop { display: none; }
          .main-nav { gap: 7px; padding: ${X.rim+3}px ${X.rim+7}px; }
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
          background: ${Q.surface};
          border: 1px solid ${Q.edge};
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
          color: ${Q.ink};
          background: ${Q.activeFill};
          box-shadow: ${Pe};
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
      `}),e.jsx("div",{className:"nav-top",children:e.jsxs("nav",{className:"main-nav","data-lab-nav":"1",children:[pe.map((k,y)=>e.jsxs(g.Fragment,{children:[e.jsx("button",{type:"button",className:pe[p].id===k.id?"is-on":"",onClick:()=>_(y),children:r(k.navKey)}),e.jsx("span",{className:"main-nav-sep","aria-hidden":"true"})]},k.id)),e.jsx("a",{href:"/login",className:"nav-login","aria-label":r("nav.login"),children:e.jsx(zt,{size:20})}),e.jsx("span",{className:"nav-lang-desktop",children:e.jsx(lt,{})})]})}),pe.map((k,y)=>e.jsxs("div",{className:`lsh-pane${y===p?" is-active":""}`,"aria-hidden":y!==p,style:{transform:`translate3d(calc(${(y-p)*100}% + ${w}px), 0, 0)`},children:[k.id==="home"&&e.jsx(St,{embedded:!0}),k.id==="religion"&&e.jsx("div",{className:`lsh-page${h==="free"?" lsh-nosnap":""}`,children:e.jsx(lo,{embedded:!0})}),k.id==="vision"&&e.jsx("div",{className:"lsh-page lsh-scroll",children:e.jsx(wo,{embedded:!0})}),k.id==="about"&&e.jsx("div",{className:"lsh-page lsh-scroll",children:e.jsx(_o,{embedded:!0})})]},k.id)),e.jsxs("div",{className:"lsh-modeswitch",role:"group","aria-label":"Ovládanie na mobile",children:[e.jsx("button",{type:"button",className:h==="edge"?"is-on":"",onClick:()=>b("edge"),children:"Okraj"}),e.jsx("button",{type:"button",className:h==="free"?"is-on":"",onClick:()=>b("free"),children:"Voľný"}),e.jsx("button",{type:"button",className:h==="click"?"is-on":"",onClick:()=>b("click"),children:"Len klik"})]})]})}export{da as default};
