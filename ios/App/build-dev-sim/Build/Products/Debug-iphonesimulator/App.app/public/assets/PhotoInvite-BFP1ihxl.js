import{u as C,g as $,r,bB as h,j as o,s as c,v as d,m as N,L as f,c as P,l as a,bC as S,by as j,bD as E}from"./index-DriUOdZL.js";import{F as A,a as R}from"./flowPanel-BxF4HS-3.js";import{d as z}from"./HandIcons-BI9sYdb3.js";import{L as p}from"./labTheme-DLctEqJ2.js";import{o as I}from"./photoConfirm-Bdi68HVK.js";import{i as L,f as T}from"./photoIntake-EOawjgPq.js";import"./index-BPi12Ps7.js";import"./proxy-5uIz4xGy.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./cloudinaryService-CiRx-3N_.js";function q(){const i=C(),m=$(),[y,l]=r.useState(!1),u=r.useRef(null),g=r.useRef(null),x=r.useRef(void 0),k=r.useRef(i);k.current=i,r.useEffect(()=>{const t=n=>{var s;u.current=((s=n.detail)==null?void 0:s.packNumber)??null,a("photo_invite_shown"),l(!0)};window.addEventListener(h,t);const e=S();return e&&t(new CustomEvent(h,{detail:e})),()=>{window.removeEventListener(h,t),E()}},[]);const b=()=>{const t=g.current;t&&j(t,()=>{})},v=t=>{const e=k.current;I({photoUrl:t,packNumber:u.current,onContinue:n=>{a("cta_become_dogyptian_click",{location:"photo_invite"}),T(n,x.current),m("/heroglyph/name")},onPickAnother:b,onClose:()=>a("photo_invite_confirm_dismissed"),copy:{eyebrow:e("wall.photo.yoursWillBe"),lead:e("wall.photo.lead"),cta:e("wall.photo.cta"),another:e("wall.photo.another"),zoom:e("wall.photo.zoom"),later:e("wall.photo.laterNote")}})},w=t=>{var s;const e=(s=t.target.files)==null?void 0:s[0];if(!e)return;const n=L(e);x.current=n.uploaded,l(!1),v(n.previewUrl)},_=()=>{a("photo_invite_skip"),l(!1),m("/heroglyph/name")};return o.jsxs(o.Fragment,{children:[o.jsx("input",{ref:g,type:"file",accept:"image/*",style:{display:"none"},onChange:w}),o.jsxs("style",{children:[A,O]}),o.jsxs(R,{open:y,className:"pi-card",label:i("heroglyph.invite.title"),onClose:()=>l(!1),children:[o.jsx("span",{className:"pi-drop",children:o.jsx(z,{size:36})}),o.jsx("h2",{className:"pi-h",children:i("heroglyph.invite.title")}),o.jsx("p",{className:"pi-p",children:i("heroglyph.invite.body")}),o.jsx("button",{type:"button",className:"pi-cta",onClick:()=>{a("photo_invite_add"),b()},children:i("heroglyph.invite.add")}),o.jsx("button",{type:"button",className:"pi-skip",onClick:_,children:i("heroglyph.invite.skip")})]})]})}const O=`
.fm-card.pi-card { max-width: 360px; align-items: center; text-align: center; gap: ${c.md}px; padding: ${c.xl}px ${c.lg}px; }
.pi-drop {
  width: 96px; height: 96px; border-radius: 50%; display: grid; place-items: center;
  border: 2px dashed rgba(201, 154, 63, 0.9); color: ${p.ink}; flex: 0 0 auto;
}
.pi-h {
  margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: ${d.h2}px;
  letter-spacing: 0.14em; text-transform: uppercase; color: ${p.ink};
}
.pi-p { margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 400; font-size: ${d.body}px; line-height: 1.5; color: ${p.inkSoft}; }
.pi-cta {
  width: 100%; height: 48px; border: none; border-radius: ${N.field}px; cursor: pointer;
  background: ${f.grad}; color: ${f.ink}; box-shadow: ${P};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${d.body}px; letter-spacing: .08em; text-transform: uppercase;
  transition: background .18s, transform .18s;
}
.pi-cta:hover { background: ${f.gradHover}; transform: scale(1.02); }
.pi-skip {
  background: none; border: 0; padding: ${c.sm}px; cursor: pointer; text-decoration: underline;
  font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: ${d.label}px; color: ${p.inkSoft};
}
.pi-skip:hover { color: ${p.ink}; }
`;export{q as default};
