// ŠAT AINUBIS 3D — stena Moje znalosti, po ťuku na level (Matej 9. 11. 2026). Stavba podľa Tripstats (`TripStatsWall`), farby a hrany AINUBISA. Len pod APP_NEW.
import { AINUBIS as A } from '@/components/pack/ainubisSkin';
import { M3, b3 } from './zaklad';

const H = 'html.papyrus3d';
const UI = `'Space Grotesk',sans-serif`;
const MU = `'LT Museum',serif`;
const CY = A.cyanRGB;
// Výška steny a dlaždíc = Tripstats (`WALL_TOTAL`, `STRIP_H`), číslami, aby sa kód steny nedostal do štartovacieho balíka.
const WALL = 376;
const STRIP = 120;
// Svety v dvoch radoch (4 + 3), poloha v percentách šírky a v px od vrchu.
const SVETY = [[20, 158], [40, 150], [60, 150], [80, 158], [30, 222], [50, 216], [70, 222]];

export const AI3D_ZNALOSTI_CSS = `
/* Horný rad (PackTopRow) lepí na vrch; čiara a žiara hlavičky až pri rolovaní (Matej 11. 11. 2026). */
${H} .vkw-top{position:sticky;top:0;z-index:5;padding-top:calc(env(safe-area-inset-top,0px) + 8px);background:var(--ai-head);background-origin:border-box;border-bottom:3px solid transparent;transition:border-color .2s,box-shadow .2s;}
${H} .vkw-top[data-scrolled]{border-bottom-color:var(--ai-edge);box-shadow:0 2px 0 var(--ai-out),0 0 26px -6px rgba(${CY},.55);}
${H} .vkw-top + .zv-wrap{margin-top:0;}
${H} .vkw-wall{position:relative;height:${WALL}px;display:flex;flex-direction:column;overflow:hidden;${M3.card}}
${H} .vkw-sky{position:absolute;inset:0;background:radial-gradient(60% 46% at 50% 62%,rgba(${CY},.34),transparent 72%),radial-gradient(1.5px 1.5px at 18% 44%,#fff,transparent),radial-gradient(1.5px 1.5px at 82% 40%,#fff,transparent),radial-gradient(1px 1px at 64% 32%,#fff,transparent),radial-gradient(1px 1px at 38% 36%,#fff,transparent),linear-gradient(180deg,#0B1B33,#050B16);}
${H} .vkw-lib{background:#0D0B1C;}
${H} .vkw-lib svg{position:absolute;inset:0;width:100%;height:100%;display:block;}
${H} .vkw-dog{position:absolute;left:50%;top:128px;width:208px;height:208px;object-fit:contain;transform:translateX(-50%);opacity:.26;}
${H} .vkw-w{position:absolute;width:64px;height:64px;object-fit:contain;transform:translateX(-50%);filter:grayscale(1) brightness(.7) drop-shadow(0 3px 2px var(--ai-sh));}
${H} .vkw-w.on{filter:drop-shadow(0 0 10px rgba(${CY},.8)) drop-shadow(0 3px 2px var(--ai-sh));}
${SVETY.map(([x, y], i) => `${H} .vkw-w${i}{left:${x}%;top:${y}px;}`).join('\n')}
${H} .vkw-hud{position:relative;z-index:2;display:flex;align-items:center;gap:8px;padding:12px;}
${H} .vkw-hudb{display:flex;align-items:center;gap:12px;flex:1;min-width:0;padding:0;background:none;border:0;color:${A.ink};text-align:left;cursor:pointer;}
${H} .vkw-av{width:56px;height:56px;flex:none;display:flex;align-items:center;justify-content:center;border-radius:50%;object-fit:cover;background:var(--ai-fld);border:3px solid var(--ai-edge);box-shadow:0 0 0 2px var(--ai-out);font:400 24px ${MU};color:${A.ink};}
${H} .vkw-who{flex:1;min-width:0;}
${H} .vkw-who b{display:block;font:400 24px/1.1 ${MU};color:${A.ink};overflow-wrap:anywhere;}
${H} .vkw-who small{display:block;margin-top:4px;${M3.lab}}
${H} .vkw-lv{position:relative;flex:none;width:64px;height:64px;padding:0;background:none;border:0;cursor:pointer;}
${H} .vkw-lv img{width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${H} .vkw-lv i{position:absolute;right:-2px;bottom:-2px;min-width:24px;height:24px;padding:0 4px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:linear-gradient(180deg,#B4F4FB,${A.cyan});border:2px solid #04121A;color:#04121A;font:600 14px/1 ${UI};font-style:normal;}
${H} .vkw-xp{position:relative;z-index:2;display:block;margin:0 12px;padding:8px 12px;text-align:left;cursor:pointer;color:${A.ink};font-family:${UI};${M3.box}border:2.5px solid var(--ai-edge);}
${H} .vkw-xpr{display:flex;align-items:center;gap:8px;font:600 20px/1 ${UI};font-variant-numeric:tabular-nums;}
${H} .vkw-xpr .nx{opacity:.6;}
${H} .vkw-xp .pk-progress{flex:1;height:14px;background:rgba(${CY},.16);box-shadow:inset 0 1px 2px rgba(0,0,0,.6);}
${H} .vkw-xp .pk-progress__fill{display:block;height:100%;background:linear-gradient(90deg,#1FA9C9,#B4F4FB);}
${H} .vkw-xpt{display:flex;justify-content:space-between;gap:8px;margin-top:4px;font:500 12px/1.2 ${UI};color:${A.inkDim};}
${H} .vkw-strip{position:relative;z-index:3;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:-${STRIP / 2}px 8px 0;}
${b3(`${H} .vkw-strip button`, 'nt')}
${H} .vkw-strip button{height:${STRIP}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:4px;cursor:pointer;}
${H} .vkw-strip b{font:600 24px/1 ${UI};color:${A.ink};font-variant-numeric:tabular-nums;}
${H} .vkw-strip small{font:500 12px/1.1 ${UI};color:${A.inkDim};}
${H} .vkw-sec{display:flex;align-items:center;gap:8px;margin:32px 0 12px;${M3.lab}}
${H} .vkw-sec::after{content:'';flex:1;height:1px;background:rgba(${CY},.28);}
${H} .vkw-sec em{order:2;font-style:normal;letter-spacing:.02em;}
${H} .vkw-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 8px;}
${b3(`${H} .vkw-tile`, 'nt')}
${H} .vkw-tile{min-height:88px;display:flex;align-items:center;justify-content:flex-start;gap:8px;padding:8px;text-align:left;cursor:pointer;}
${H} .vkw-tile:disabled{opacity:.55;cursor:default;}
${H} .vkw-tile span{display:block;min-width:0;}
${H} .vkw-tile b{display:block;font:600 24px/1 ${UI};color:${A.ink};font-variant-numeric:tabular-nums;white-space:nowrap;}
${H} .vkw-tile small{display:block;margin-top:4px;font:500 14px/1.15 ${UI};color:${A.inkDim};}
${H} .ppu-sheet.vkw-sheet{${M3.sheet}color:${A.ink};}
${H} .ppu-sheet.vkw-sheet .ppu-head h2{font:400 24px/1.12 ${MU};letter-spacing:0;text-align:center;color:${A.ink};}
${H} .ppu-sheet.vkw-sheet .pk-grab{${M3.grab}}
`;
