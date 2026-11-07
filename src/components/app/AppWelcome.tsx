import { useT } from '@/i18n/LanguageContext';
import { LAB } from '@/lib/labTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { PACK_R, PACK_SPACE, PACK_TEXT, PAGE_AIR } from '@/components/pack/packTheme';
import { FLOW_FONT } from '@/components/screens/flowFullSkin';
import { sizedUrl } from '@/services/cloudinaryService';
import { hekthorFace } from '@/lib/hekthorFaces';
import { PageTopBar } from '@/components/PageTopBar';
import type { PubDog } from '@/lib/appRegister';

// ════════════════════════════════════════════════════════════════════════════
// VITAJ · APPKA (7. 11. 2026) — posledný krok heroflowu v appke
// ────────────────────────────────────────────────────────────────────────────
// Nákres `plany/nakresy/heroflow-cela-obrazovka-2026-11-07/` (obrazovka Vitaj, variant APPKA),
// pipeline: Odhalenie → kód „Ulož heroglyf“ → VITAJ → pravidlá → povolenia → DOMOV.
//
// Rad z dvoch položiek: medailón psa s menom · čiarkovaný kruh majiteľa s „?“ a prázdnou
// linkou mena. Odznak hodnosti je badge na OBVODE kruhu majiteľa (odznak patrí človeku,
// Matej 7. 11. 5. kolo), vpravo dole. Dnes vždy Veriaci (`dogyptan-0`) — vstupné ešte nie je.
// Ťuk na kruh = úprava profilu (`/pack/profile/edit`).
// ⚠️ Vstupné (IAP) sa tu NESTAVIA; číslo psa príde až po schválení fotky (pilulka).
// ════════════════════════════════════════════════════════════════════════════

export function AppWelcome({ dog, onEnter }: { dog?: PubDog; onEnter: () => void }) {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const name = (dog?.name || '').trim();
  const face = dog?.photo ? sizedUrl(dog.photo, 216) : hekthorFace('welcome');

  return (
    <div className="aw2-screen">
      <style>{APP_WELCOME_CSS}</style>
      <div className="aw2-top"><PageTopBar /></div>
      <div className="aw2-body">
        <h1 className="aw2-title">
          {tx('appEntry.welcome.title1', 'Welcome to the ')}<b>{tx('appEntry.welcome.titleWord', 'pack')}</b>
        </h1>
        <div className="aw2-duo">
          <div className="aw2-item">
            <img className="aw2-medal" src={face} alt="" />
            {name && <b className="aw2-dog">{name}</b>}
          </div>
          <button
            type="button"
            className="aw2-item aw2-owner"
            aria-label={tx('appEntry.welcome.more', 'One more thing: you. Add your photo.')}
            onClick={() => window.location.replace('/pack/profile/edit')}
          >
            <span className="aw2-circle">?<img className="aw2-badge" src="/web-app/odznaky/dogyptan-0.webp" alt="" /></span>
            <i className="aw2-line" />
          </button>
        </div>
        <p className="aw2-more">{tx('appEntry.welcome.more', 'One more thing: you. Add your photo.')}</p>
        <span className="aw2-pill">{tx('appEntry.welcome.number', 'Your number comes after the photo is approved.')}</span>
      </div>
      <button type="button" className="aw2-cta" onClick={onEnter}>{tx('appEntry.welcome.enter', 'Enter')}</button>
    </div>
  );
}

const APP_WELCOME_CSS = `
.aw2-screen { position: absolute; inset: 0; overflow-y: auto; display: flex; flex-direction: column; align-items: center;
  padding: calc(env(safe-area-inset-top, 0px) + ${PAGE_AIR.min}px) ${PAGE_AIR.side}px calc(env(safe-area-inset-bottom, 0px) + ${PAGE_AIR.min}px);
  font-family: ${FLOW_FONT}; font-weight: 500; color: #000; }
.aw2-top { width: 100%; flex: none; margin: -${PAGE_AIR.min}px -${PAGE_AIR.side}px 0; width: calc(100% + ${PAGE_AIR.side * 2}px); }
.aw2-top img[alt="DOGYPT"] { filter: brightness(.34) sepia(1) saturate(2.2) hue-rotate(-12deg); }
.aw2-screen :is(h1, p, b, button, span, i) { font-family: ${FLOW_FONT} !important; }
/* Obsah uprostred (margin:auto na dieťati, nie justify-center — pasca PAGE_AIR). */
.aw2-body { margin: auto 0; width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; gap: ${PACK_SPACE.lg}px; text-align: center; }
.aw2-title { margin: 0; font-size: ${PACK_TEXT.h1}px; line-height: 1.2; letter-spacing: .04em; text-transform: uppercase; font-weight: 500; }
.aw2-title b { font-weight: 900; background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.aw2-duo { display: grid; grid-template-columns: repeat(2, minmax(0, 120px)); justify-content: center; gap: ${PACK_SPACE.xl}px; width: 100%; align-items: start; }
.aw2-item { display: flex; flex-direction: column; align-items: center; gap: ${PACK_SPACE.sm}px; min-height: 120px; }
.aw2-medal { width: 96px; height: 96px; border-radius: ${PACK_R.pill}px; object-fit: cover; border: 1.5px solid rgba(179, 130, 45, 0.55); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28); }
.aw2-dog { font-size: ${PACK_TEXT.body}px; font-weight: 900; text-transform: uppercase; letter-spacing: .04em; }
.aw2-owner { background: none; border: 0; padding: 0; cursor: pointer; font-family: inherit; }
.aw2-circle { position: relative; width: 96px; height: 96px; border-radius: ${PACK_R.pill}px; border: 2px dashed ${LAPIS.edge};
  background: rgba(22, 48, 122, 0.10); display: grid; place-items: center; font-size: 48px; line-height: 1; font-weight: 900; color: ${LAPIS.edge}; }
.aw2-badge { position: absolute; left: 85%; top: 85%; width: 40%; transform: translate(-50%, -50%); object-fit: contain; }
.aw2-line { display: block; width: 70%; height: 14px; border-bottom: 2px dashed rgba(0, 0, 0, 0.45); }
.aw2-more { margin: 0; font-size: ${PACK_TEXT.body}px; line-height: 1.4; font-weight: 900; }
.aw2-pill { padding: ${PACK_SPACE.sm}px ${PACK_SPACE.md}px; border-radius: ${PACK_R.pill}px; border: 1px solid #C99A3F; font-size: ${PACK_TEXT.label}px; line-height: 1.3;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%); color: ${LAB.ink}; }
.aw2-cta { width: 100%; max-width: 640px; height: 48px; flex: none; border: 0; border-radius: ${PACK_R.field}px; cursor: pointer;
  background: ${LAPIS.grad}; color: ${LAPIS.ink}; box-shadow: ${LAPIS_BTN_SHADOW};
  font-family: ${FLOW_FONT}; font-weight: 900; font-size: ${PACK_TEXT.body}px; letter-spacing: .08em; text-transform: uppercase; }
.aw2-cta:hover { background: ${LAPIS.gradHover}; }
`;
