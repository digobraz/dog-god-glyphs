import{r as f,j as l}from"./index-7PctGTam.js";import{P as q}from"./PageTopBar-DlESgG9R.js";import"./handArrowLeft-BUyUUYuC.js";import"./dogypt-logo-gold-D67FOL39.js";import"./dogypt-logo-mobile-B7sCn4Sq.js";import"./useBodyScrollLock--CJIKtfn.js";import"./createLucideIcon-Di02PK5p.js";import"./LanguagePicker--v1cJQg6.js";import"./flagUrl-B21iQI9I.js";const _="data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'%20standalone='no'?%3e%3c!DOCTYPE%20svg%20PUBLIC%20'-//W3C//DTD%20SVG%201.1//EN'%20'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3e%3csvg%20width='100%25'%20height='100%25'%20viewBox='0%200%20308%20237'%20version='1.1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20xml:space='preserve'%20xmlns:serif='http://www.serif.com/'%20style='fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;'%3e%3cpath%20id='L11-HEKTHOR'%20d='M47.297,118.814c-23.363,1.458%20-15.293,48.551%20-43.935,75.099c-6.17,5.006%201.066,-26.799%201.066,-26.799c0,0%206.823,-13.306%2011.168,-28.114c9.447,-28.303%2036.264,-49.647%2043.292,-53.779c13.244,-7.775%20101.789,-16.709%20117.226,-19.055c7.428,-1.121%2017.864,-9.365%2026.093,-18.434c9.334,-10.26%2029.345,-40.729%2033.228,-41.846c8.444,-2.424%2021.89,-5.783%2025.338,-5.481c6.129,0.528%205.906,2.284%206.333,8.132c0.425,5.386%207.184,13.644%207.309,13.913c2.68,5.15%2026.581,10.37%2032.682,14.081c3.47,2.113%20-4.503,12.483%20-7.051,14.559c-3.514,2.864%20-29.24,4.606%20-32.559,4.891c-4.382,0.368%20-4.965,0.133%20-6.183,2.048c-14.972,23.613%20-14.738,46.518%20-22.44,65.293c-1.864,4.542%20-10.75,16.632%20-18.794,23.12l-0.487,0.74c0,0%20-3.779,5.61%20-5.48,12.27c-2.911,11.453%20-4.768,20.431%20-5.641,34.115c-0.696,10.915%20-0.604,19.554%206.3,27.671c0.705,0.852%202.004,1.511%203.117,1.661c6.909,0.926%206.845,3.461%208.655,10.276c0.574,2.117%20-0.199,2.739%20-2.069,2.838c-5.132,0.231%20-10.279,0.697%20-15.401,0.57c-1.908,-0.055%20-4.19,-1.108%20-5.542,-2.454c-2.063,-2.054%20-3.407,-4.824%20-5.237,-7.149c-0.601,-0.789%20-3.928,-21.594%20-4.343,-25.433c-1.648,-15.397%20-3.308,-21.375%20-4.831,-36.788c-0.185,-1.772%200.507,-8.375%20-0.309,-10.513c-31.777,6.392%20-81.369,-25.79%20-81.163,-24.55c2.521,14.477%20-57.958,56.996%20-65.865,65.47c-0.833,0.898%20-1.759,2.128%20-1.811,3.243c-0.358,7.27%20-0.667,14.56%20-0.592,21.841c0.029,2.511%201.57,4.177%204.662,4.657c4.986,0.779%207.262,3.478%207.444,7.433c0.105,2.239%20-0.65,3.741%20-3.156,3.838c-3.425,0.134%20-6.766,0.457%20-10.194,0.427c-5.606,-0.054%20-6.714,-0.94%20-8.653,-6.299c-0.502,-1.389%20-0.93,-2.815%20-1.231,-4.262c-1.358,-6.424%20-2.246,-12.985%20-4.081,-19.274c-2.101,-7.216%20-1.659,-13.247%204.32,-18.658c3.122,-2.818%205.428,-6.604%205.515,-11.161c0.191,-10.479%200.463,-50.936%2013.3,-58.112l0,-0.025Z'%20style='fill-rule:nonzero;'/%3e%3c/svg%3e",c=900,B=220,p=178,J=.74,Z=-13.6,O="#3a2a15",Q="#6b4e22",y=["PUPPY","GOOD BOY","VERY GOOD BOY","WHO'S A GOOD BOY","LEGEND","GOOD BOY OF THE MILLENNIUM"],D=g=>y[Math.min(Math.floor(g/6),y.length-1)],le=()=>{const g=f.useRef(null),A=f.useRef(null),[m,E]=f.useState("idle"),[j,k]=f.useState(0),[z,I]=f.useState(0),[C,P]=f.useState(y[0]),b=f.useRef({dogY:0,dogV:0,obs:[],balls:[],pops:[],speed:5.2,obSpawn:55,ballSpawn:130,score:0,frame:0,running:!1,raf:0}),w=f.useRef(m);w.current=m,f.useEffect(()=>{const e=new Image;e.src=_,e.onload=()=>{const o=Math.round(200*(e.width/e.height)),n=document.createElement("canvas");n.width=o,n.height=200;const s=n.getContext("2d");if(!s)return;s.drawImage(e,0,0,o,200),s.globalCompositeOperation="source-in",s.fillStyle=O,s.fillRect(0,0,o,200),A.current=n;const r=g.current,t=r==null?void 0:r.getContext("2d");t&&w.current==="idle"&&v(t,!1)}},[]);const Y=(e,a,o,n)=>{const s=A.current,r=82,t=s?r*(s.width/s.height):90,d=n?0:Math.abs(Math.sin(o*.22))*4,i=92,h=a-r+d;return s?e.drawImage(s,i,h,t,r):(e.fillStyle=O,e.fillRect(i,h+20,t,r-20)),{x:i,y:h,w:t,h:r}},S=(e,a,o,n,s)=>{e.beginPath(),e.moveTo(a-n/2,o),e.lineTo(a,o-s),e.lineTo(a+n/2,o),e.closePath(),e.fill()},x=(e,a,o,n,s)=>{e.beginPath(),e.moveTo(a-n/2,o),e.quadraticCurveTo(a-n*.22,o-s,a,o-s),e.quadraticCurveTo(a+n*.22,o-s,a+n/2,o),e.closePath(),e.fill()},u=(e,a,o,n)=>{e.beginPath(),e.moveTo(a-n*.4,o),e.lineTo(a,o-n),e.lineTo(a+n*.4,o),e.closePath(),e.fill()},M=(e,a,o,n)=>{e.fillRect(a-1.5,o-n,3,n),e.beginPath(),e.arc(a,o-n-n*.55,n*.95,0,Math.PI*2),e.fill()},N=(e,a,o,n,s)=>{e.fillRect(a-n/2,o-s,n,s),e.beginPath(),e.moveTo(a-n/2-3,o-s),e.lineTo(a,o-s-s*.55),e.lineTo(a+n/2+3,o-s),e.closePath(),e.fill()},V=(e,a,o)=>{const n=p+1;e.fillStyle="rgba(122,96,54,0.09)";const s=540,r=a*o*.12%s;for(let i=-r-s;i<c+s;i+=s)S(e,i+120,n,210,96),S(e,i+330,n,168,70),x(e,i+470,n,250,52);e.fillStyle="rgba(96,72,36,0.13)";const t=680,d=a*o*.26%t;for(let i=-d-t;i<c+t;i+=t)u(e,i+28,n,40),u(e,i+56,n,30),u(e,i+80,n,34),M(e,i+142,n,15),N(e,i+224,n,46,30),S(e,i+330,n,128,72),M(e,i+432,n,17),N(e,i+512,n,38,24),u(e,i+588,n,36),u(e,i+612,n,28)},W=(e,a)=>{const o=a.x+a.w/2,n=p-a.h/2;e.save(),e.strokeStyle="#6d4326",e.lineWidth=2.2,e.lineCap="round";for(const s of[-1,1])for(const r of[-5,-1,3])e.beginPath(),e.moveTo(o,n+r),e.quadraticCurveTo(o+s*(a.w/2+3),n+r-5,o+s*(a.w/2+7),n+r+2),e.stroke();e.fillStyle="#5b3620",e.beginPath(),e.ellipse(o,n,a.w/2,a.h/2,0,0,Math.PI*2),e.fill(),e.fillStyle="#402616",e.beginPath(),e.ellipse(o,n+1,a.w/3,a.h/3,0,0,Math.PI*2),e.fill(),e.fillStyle="#3a2414",e.beginPath(),e.arc(o-a.w/2-1,n-2,3,0,Math.PI*2),e.fill(),e.fillStyle="#c9452f",e.beginPath(),e.arc(o+2,n-1,1.6,0,Math.PI*2),e.fill(),e.restore()},H=(e,a)=>{const o=a.x+a.w/2,n=p,s=p-a.h;e.save(),e.strokeStyle="#8a6d2c",e.lineWidth=2.4,e.lineCap="round",e.beginPath(),e.moveTo(o,n),e.lineTo(o,s+4),e.stroke(),e.lineWidth=1.8;const r=6;for(let t=0;t<r;t++){const d=t/(r-1),i=n-6-d*(a.h-10),h=6+(1-d)*4;for(const K of[-1,1])e.beginPath(),e.moveTo(o,i),e.lineTo(o+K*h,i-h*.9),e.stroke()}e.fillStyle="#a9852f",e.beginPath(),e.ellipse(o,s+2,3,5,0,0,Math.PI*2),e.fill(),e.restore()},G=(e,a)=>{const o=p-a.h/2-4,n=a.x,s=a.w;e.save(),e.fillStyle="#c7cdd4",e.strokeStyle="#7d838b",e.lineWidth=1.4,e.beginPath(),e.roundRect(n+6,o-6,s-16,12,3),e.fill(),e.stroke(),e.fillStyle="#8fd0e6",e.globalAlpha=.7,e.fillRect(n+8,o-4,(s-18)*.55,8),e.globalAlpha=1,e.strokeStyle="#9aa0a8",e.lineWidth=2.4,e.beginPath(),e.moveTo(n+s-10,o),e.lineTo(n+s,o),e.stroke(),e.beginPath(),e.moveTo(n+s,o-5),e.lineTo(n+s,o+5),e.stroke(),e.strokeStyle="#b9bfc6",e.lineWidth=1.6,e.beginPath(),e.moveTo(n+6,o),e.lineTo(n-6,o),e.stroke(),e.restore()},U=(e,a,o)=>{const s=1+Math.sin(o*.15)*.06;e.save(),e.translate(a.x,a.y),e.scale(s,s);const r=e.createRadialGradient(-3,-3,1,0,0,9);r.addColorStop(0,"#F7DE8B"),r.addColorStop(1,"#D9A426"),e.fillStyle=r,e.shadowColor="rgba(230,165,40,0.6)",e.shadowBlur=10,e.beginPath(),e.arc(0,0,9,0,Math.PI*2),e.fill(),e.shadowBlur=0,e.strokeStyle="rgba(90,60,15,0.5)",e.lineWidth=1.2,e.beginPath(),e.arc(-9*.6,0,9,-.9,.9),e.stroke(),e.beginPath(),e.arc(9*.6,0,9,Math.PI-.9,Math.PI+.9),e.stroke(),e.restore()},T=f.useCallback(()=>{var s;const e=b.current,a=(s=g.current)==null?void 0:s.getContext("2d");if(!a)return;e.frame++,e.dogV+=J,e.dogY+=e.dogV,e.dogY>0&&(e.dogY=0,e.dogV=0);const n={x:96,y:p+e.dogY-74,w:74,h:74};if(--e.obSpawn<=0){const r=Math.random(),t=r<.5?"tick":r<.8?"awn":"syringe",d=t==="tick"?{w:30,h:24}:t==="awn"?{w:16,h:46}:{w:46,h:22};e.obs.push({x:c+20,kind:t,...d});const i=1050/e.speed;e.obSpawn=i+Math.random()*i*.8}--e.ballSpawn<=0&&(e.balls.push({x:c+20,y:p-78-Math.random()*34}),e.ballSpawn=150+Math.random()*160);for(const r of e.obs){r.x-=e.speed,!r.passed&&r.x+r.w<n.x&&(r.passed=!0,e.score+=1,k(e.score),P(D(e.score)),e.speed=5.2+Math.floor(e.score/6)*.7);const t=r.kind==="awn"?5:4,d={x:r.x+t,y:p-r.h,w:r.w-t*2,h:r.h};if(n.x<d.x+d.w&&n.x+n.w>d.x&&n.y<d.y+d.h&&n.y+n.h>d.y){e.running=!1,cancelAnimationFrame(e.raf),I(i=>Math.max(i,e.score)),E("over"),v(a,!0);return}}e.obs=e.obs.filter(r=>r.x+r.w>-30);for(const r of e.balls)if(r.x-=e.speed,!r.got){const t=r.x-(n.x+n.w/2),d=r.y-(n.y+n.h/2);Math.hypot(t,d)<46&&(r.got=!0,e.score+=3,k(e.score),P(D(e.score)),e.pops.push({x:r.x,y:r.y,life:42,text:"+3"}))}e.balls=e.balls.filter(r=>!r.got&&r.x>-30),e.pops=e.pops.filter(r=>--r.life>0),v(a,!1),e.running&&(e.raf=requestAnimationFrame(T))},[]),v=(e,a)=>{const o=b.current;e.clearRect(0,0,c,B),V(e,o.frame,o.speed),e.strokeStyle=Q,e.lineWidth=2,e.beginPath(),e.moveTo(0,p+1),e.lineTo(c,p+1),e.stroke(),e.strokeStyle="rgba(107,78,34,0.35)",e.lineWidth=2;const n=o.frame*o.speed%46;for(let r=-n;r<c;r+=46)e.beginPath(),e.moveTo(r,p+11),e.lineTo(r+20,p+11),e.stroke();for(const r of o.obs)r.kind==="tick"?W(e,r):r.kind==="awn"?H(e,r):G(e,r);for(const r of o.balls)U(e,r,o.frame);const s=o.dogY<-1;e.globalAlpha=a?.4:1,Y(e,p+o.dogY,s?6:o.frame,s),e.globalAlpha=1;for(const r of o.pops)e.globalAlpha=Math.min(1,r.life/24),e.fillStyle="#B07E2E",e.font="700 18px Cinzel, serif",e.textAlign="center",e.fillText(r.text,r.x,r.y-(42-r.life)*.7),e.globalAlpha=1},F=f.useCallback(()=>{const e=b.current;w.current==="running"&&e.dogY===0&&(e.dogV=Z)},[]),R=f.useCallback(()=>{const e=b.current;Object.assign(e,{dogY:0,dogV:0,obs:[],balls:[],pops:[],speed:5.2,obSpawn:45,ballSpawn:90,score:0,frame:0,running:!0}),k(0),P(y[0]),E("running"),cancelAnimationFrame(e.raf),e.raf=requestAnimationFrame(T)},[T]);f.useEffect(()=>{const e=g.current,a=e==null?void 0:e.getContext("2d");if(!e||!a)return;const o=Math.min(window.devicePixelRatio||1,2);e.width=c*o,e.height=B*o,a.scale(o,o),v(a,!1);const n=s=>{(s.code==="Space"||s.code==="ArrowUp")&&(s.preventDefault(),w.current==="running"?F():R())};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n),cancelAnimationFrame(b.current.raf)}},[]);const L=()=>{m==="running"?F():R()};return l.jsxs("div",{className:"nf-page dark-bg",children:[l.jsx(q,{}),l.jsx("main",{className:"nf-main",children:l.jsxs("section",{className:"nf-block",children:[l.jsx("h1",{className:"nf-404",children:"404"}),l.jsx("p",{className:"nf-lead",children:"This page ran off-leash."}),l.jsxs("div",{className:"nf-stage",onPointerDown:L,role:"button","aria-label":"Jump",children:[l.jsx("canvas",{ref:g,className:"nf-canvas"}),m==="idle"&&l.jsxs("div",{className:"nf-overlay",children:[l.jsx("p",{className:"nf-big",children:"HEKTHOR'S RUN"}),l.jsxs("p",{className:"nf-hint",children:[l.jsx("kbd",{children:"SPACE"})," / tap — leap the ticks, snatch the balls"]})]}),m==="over"&&l.jsxs("div",{className:"nf-overlay",children:[l.jsx("p",{className:"nf-big",children:"Caught you."}),l.jsxs("p",{className:"nf-hint",children:[C," · ",j," pts — ",l.jsx("kbd",{children:"SPACE"})," / tap to run again"]})]})]}),l.jsxs("div",{className:"nf-hud",children:[l.jsxs("span",{children:[l.jsx("b",{children:j})," pts"]}),l.jsx("span",{className:"nf-rank",children:C}),l.jsxs("span",{children:["best ",l.jsx("b",{children:z})]})]}),l.jsxs("div",{className:"nf-actions",children:[l.jsx("a",{href:"/",className:"btn-gold",children:"Fetch the homepage"}),l.jsx("a",{href:"/heroglyph/name",className:"nf-link",children:"or become a Dogyptian →"})]})]})}),l.jsx("style",{children:`
        .nf-page.dark-bg { min-height: 100dvh; display: flex; flex-direction: column; }
        .nf-page.dark-bg::before { position: fixed; }
        .nf-main {
          flex: 1; z-index: 1; display: flex; align-items: center; justify-content: center;
          padding: 24px 16px 40px;
        }
        /* ── the big pale papyrus block ─────────────────────────── */
        .nf-block {
          position: relative; width: 100%; max-width: 940px;
          background: linear-gradient(160deg, #FBF5E6 0%, #F3E4C4 55%, #EAD6A6 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 16px;
          padding: clamp(22px, 4vw, 40px) clamp(18px, 4vw, 44px) clamp(24px, 4vw, 38px);
          box-shadow:
            0 14px 44px rgba(0,0,0,0.55),
            0 0 0 4px rgba(201,154,63,0.12),
            inset 0 1px 0 rgba(255,255,255,0.5);
          text-align: center;
        }
        .nf-eyebrow {
          font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          font-size: clamp(0.6rem, 1.6vw, 0.72rem); color: #9A6E24; margin: 0 0 6px;
        }
        .nf-404 {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(3.4rem, 12vw, 6rem); line-height: 0.92;
          color: #4A340F; margin: 0;
          text-shadow: 0 2px 0 rgba(255,255,255,0.5);
        }
        .nf-lead {
          font-family: 'Cinzel', serif; font-weight: 600;
          font-size: clamp(0.95rem, 2.6vw, 1.25rem); color: #6B4E22;
          margin: 4px 0 20px; letter-spacing: 0.02em;
        }
        .nf-stage {
          position: relative; width: 100%; border-radius: 12px; overflow: hidden;
          background:
            repeating-linear-gradient(90deg, rgba(154,110,36,0.05) 0 2px, transparent 2px 46px),
            linear-gradient(180deg, #F6ECD4 0%, #EFE0BE 100%);
          border: 1px solid rgba(154,110,36,0.28);
          box-shadow: inset 0 2px 12px rgba(120,86,30,0.14);
          cursor: pointer; touch-action: manipulation; user-select: none;
          aspect-ratio: 900 / 220;
        }
        .nf-canvas { display: block; width: 100%; height: auto; }
        .nf-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 7px;
          background: linear-gradient(180deg, rgba(246,236,212,0.55), rgba(239,224,190,0.75));
        }
        .nf-big {
          font-family: 'Cinzel', serif; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          font-size: clamp(1rem, 3.2vw, 1.4rem); color: #4A340F; margin: 0;
        }
        .nf-hint { color: #7A5A28; font-size: clamp(0.72rem, 2vw, 0.88rem); margin: 0; }
        kbd {
          font-family: 'Cinzel', serif; font-size: 0.72rem;
          border: 1px solid rgba(154,110,36,0.6); border-radius: 5px;
          padding: 1px 7px; color: #6B4E22; background: rgba(154,110,36,0.1);
        }
        .nf-hud {
          display: flex; gap: 16px; align-items: center; justify-content: center; flex-wrap: wrap;
          margin: 16px 0 4px;
          font-family: 'Cinzel', serif; font-size: 0.72rem;
          letter-spacing: 0.1em; text-transform: uppercase; color: #8A6A2E;
        }
        .nf-hud b { color: #4A340F; }
        .nf-rank {
          color: #6B4E22; border: 1px solid rgba(154,110,36,0.5);
          border-radius: 999px; padding: 3px 12px; font-weight: 700;
        }
        .nf-actions { margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .btn-gold {
          padding: 14px 32px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(120,86,30,0.35); border-radius: 8px;
          color: #2a1d0e; font-family: 'Cinzel', serif; font-size: 0.85rem;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.22s;
          box-shadow: 0 8px 26px rgba(180,120,26,0.4), inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .btn-gold:hover { transform: scale(1.04); }
        .nf-link { color: #8A6A2E; font-size: 0.85rem; text-decoration: none; letter-spacing: 0.03em; transition: color 0.2s; }
        .nf-link:hover { color: #4A340F; }
      `})]})};export{le as default};
