// VZHĽAD MOMENTU (PACK_BLOCKS „MOMENT“). Primitíva z prehliadky momentov
// (`plany/nakresy/momenty-appky-2026-11-15/core.css`: m-seal, m-medal, m-rays, m-ribbon), prevedené na šat
// Papyrus 3D: premenné `--p3d-*` z lib/papyrus3d.ts, písmo LT Museum, tlačidlo `.pk-b3`.
// Súbor je v SKIP stráže check:pack ako revealCss.ts — veľké číslo (64) a pečať (42) sú obraz, nie text stránky.
import { FONT_UI, PACK_R, PACK_SPACE, PACK_TEXT } from '@/components/pack/packTheme';

const INK = 'var(--p3d-ink,#2a1608)';
const GOLD = 'var(--p3d-gold,#C99A3F)';
const GOLD_SOLID = 'var(--p3d-gold-solid,#A3782B)';
const GOLD_INK = 'var(--p3d-gold-ink,#8a5a14)';
const HI = '#EFD79A';
const TITLE = "'LT Museum',serif";

export const MOMENT_CSS = `
.pk-iskra{animation:pkmIskra .45s cubic-bezier(.3,1.6,.5,1);position:relative}
.pk-iskra::after{content:"";position:absolute;inset:-4px;border-radius:${PACK_R.pill}px;border:3px solid currentColor;opacity:0;animation:pkmKruh .5s ease-out;pointer-events:none}
@keyframes pkmIskra{0%{transform:scale(.7)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes pkmKruh{0%{opacity:.8;transform:scale(.8)}100%{opacity:0;transform:scale(1.9)}}

.pkm{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;
  padding:max(${PACK_SPACE.xl}px,env(safe-area-inset-top)) ${PACK_SPACE.lg}px max(${PACK_SPACE.xl}px,env(safe-area-inset-bottom));animation:pkmFade .3s both}
.pkm--pecat{background:rgba(42,22,8,.35);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.pkm-card{width:100%;display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.xl}px ${PACK_SPACE.lg}px;
  border-radius:${PACK_R.card}px;border:2.5px solid ${INK};background:var(--p3d-card,linear-gradient(180deg,#F9F2E3,#F3E4C4));box-shadow:var(--p3d-pera);animation:pkmRise .3s ease-out both}
.pkm-card .pkm-h{color:${INK}}
.pkm-card .pkm-h em{color:${GOLD_INK}}
.pkm-card .pkm-sub{color:var(--p3d-ink-soft,#5b4630)}
.pkm--odhalenie{background:radial-gradient(circle at 50% 35%,#2a1d0c,#000 78%)}
.pkm--obrad{background:radial-gradient(circle at 50% 30%,#24449c,#0A1A4A 80%)}
.pkm.out{animation:pkmOut .35s both}
.pkm-col{width:100%;max-width:360px;display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.md}px;text-align:center;position:relative}
.pkm-rays{position:absolute;left:50%;top:75px;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:${PACK_R.pill}px;pointer-events:none;opacity:0;
  background:repeating-conic-gradient(rgba(201,154,63,.55) 0 8deg,transparent 8deg 20deg);
  -webkit-mask:radial-gradient(circle,transparent 70px,#000 74px,transparent 150px);mask:radial-gradient(circle,transparent 70px,#000 74px,transparent 150px);
  animation:pkmRays 2.4s ease-out .35s both}
.pkm-seal{width:120px;height:120px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;position:relative;color:${INK};
  background:radial-gradient(circle at 35% 30%,#d9b25a,${GOLD_SOLID});border:3px solid ${INK};
  box-shadow:0 5px 0 ${INK},inset 0 0 0 7px rgba(249,242,227,.35);animation:pkmSlam .55s cubic-bezier(.2,1.5,.4,1) both}
.pkm-ico{position:absolute;right:-24px;top:-12px;width:52px;height:52px;object-fit:contain;filter:drop-shadow(0 3px 0 rgba(42,22,8,.35));
  animation:pkmSlam .5s cubic-bezier(.2,1.5,.4,1) .45s both}
.pkm-seal b{font:400 42px/1 ${TITLE}}
.pkm-seal small{position:absolute;bottom:20px;font-size:${PACK_TEXT.micro}px;font-weight:600;letter-spacing:.18em}
.pkm-medal{width:150px;height:150px;border-radius:${PACK_R.pill}px;border:3px solid ${INK};display:grid;place-items:center;position:relative;overflow:hidden;
  background:radial-gradient(circle at 35% 30%,#fff6dc,${GOLD} 70%,${GOLD_SOLID});
  box-shadow:0 6px 0 ${INK},0 14px 20px rgba(0,0,0,.3);animation:pkmFlip .9s cubic-bezier(.2,.9,.3,1.2) both}
.pkm-medal--lapis{background:radial-gradient(circle at 35% 30%,#3b5bb8,#0A1A4A)}
.pkm-medal img{width:82%;height:82%;object-fit:contain}
.pkm-medal::after{content:"";position:absolute;top:-20%;bottom:-20%;left:-60%;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);
  transform:skewX(-20deg);animation:pkmShine .9s ease-out .8s both}
.pkm-num{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.xs}px;font:400 64px/1 ${TITLE};color:${HI};animation:pkmSlam .55s cubic-bezier(.2,1.5,.4,1) .2s both}
.pkm-of{font:500 ${PACK_TEXT.lead}px/1 ${FONT_UI};letter-spacing:.08em;color:rgba(239,215,154,.75)}
.pkm-ribbon{margin-top:-18px;z-index:1;padding:6px 18px;border-radius:${PACK_R.field}px;border:2.5px solid ${INK};background:${GOLD};color:${INK};
  font:400 ${PACK_TEXT.lead}px ${TITLE};box-shadow:0 4px 0 ${GOLD_INK};animation:pkmRise .4s ease-out .9s both}
.pkm-eb{font-size:${PACK_TEXT.label}px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:${GOLD};animation:pkmRise .4s ease-out .5s both}
.pkm-h{margin:0;font:400 ${PACK_TEXT.h1}px/1.1 ${TITLE};color:#F9F2E3;animation:pkmRise .5s ease-out .6s both}
.pkm-h em{font-style:normal;color:${GOLD}}
.pkm-sub{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.45;color:rgba(239,215,154,.85);max-width:30ch;animation:pkmRise .5s ease-out .75s both}
.pkm-acts{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;width:100%;margin-top:${PACK_SPACE.md}px;animation:pkmRise .4s ease-out 1.2s both}
.pkm-acts .pk-b3{height:52px;width:100%}
@keyframes pkmFade{from{opacity:0}to{opacity:1}}
@keyframes pkmOut{to{opacity:0}}
@keyframes pkmRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes pkmSlam{0%{transform:scale(2.2) rotate(-16deg);opacity:0}70%{transform:scale(.94) rotate(3deg);opacity:1}100%{transform:none;opacity:1}}
@keyframes pkmFlip{0%{transform:perspective(600px) rotateY(180deg) scale(.4);opacity:0}100%{transform:perspective(600px) rotateY(0) scale(1);opacity:1}}
@keyframes pkmShine{to{left:130%}}
@keyframes pkmRays{0%{opacity:0;transform:rotate(0) scale(.7)}25%{opacity:1}100%{opacity:0;transform:rotate(60deg) scale(1.15)}}
@media (prefers-reduced-motion:reduce){.pkm,.pkm *,.pk-iskra,.pk-iskra::after{animation-duration:.01s!important;animation-delay:0s!important}}
`;
