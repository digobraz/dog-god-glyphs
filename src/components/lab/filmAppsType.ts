/**
 * TYPOGRAFIA SEKCIE ČLENSTVO — veľký nadpis so zlatou čiarou, veta nad pilulkami,
 * pilulky appiek (nekonečný pás na PC), menovka a meno funkcie.
 *
 * Vytiahnuté z `FilmApps.tsx` 12. 10. 2026 BEZ ZMENY TEXTU, aby ich mohla nosiť aj
 * predajná stránka `/magnet` (Matej: *„musí to byť alfa omega, že tvoríš len na
 * základe nášho brandingu"*). Film ich vkladá na to isté miesto ako predtým —
 * zmena tu pohne OBOMA povrchmi naraz, a o to ide.
 */
import { LAB } from '@/lib/labTheme';

/** Appky, ktoré DOGYPT spája — názvy sa neprekladajú. Logá v `public/icons/brands/`. */
export const APP_CHIPS: { name: string; icon?: string }[] = [
  { name: 'Google', icon: 'google' },
  { name: 'Instagram', icon: 'instagram' },
  { name: 'Facebook', icon: 'facebook' },
  { name: 'Tinder', icon: 'tinder' },
  { name: 'Tripadvisor', icon: 'tripadvisor' },
  { name: 'AllTrails', icon: 'alltrails' },
  { name: 'Skool' },
];

export const APPS_TYPE_CSS = `
        .op-apps-lead {
          margin: 16px auto 0; max-width: 640px;
          font: 500 14px/1.4 'Space Grotesk', sans-serif; color: rgba(35,22,8,.7);
        }
        .op-apps-tail { margin-top: 8px; }
        /* PILULKA — štítok (PACK_BLOCKS): zlatý obrys = konštrukcia, nie akcia; text, nie logo. */
        .op-apps-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 12px auto 0; padding: 0; list-style: none; max-width: 640px; }
        .op-apps-chips li {
          padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(201,154,63,.6); background: rgba(255,255,255,.55);
          font: 600 12px/1 'Space Grotesk', sans-serif; letter-spacing: .02em; color: ${LAB.ink};
          display: inline-flex; align-items: center; gap: 6px;
        }
        .op-apps-chips li i {
          width: 14px; height: 14px; flex: 0 0 auto; background: currentColor;
          -webkit-mask: var(--m) center / contain no-repeat; mask: var(--m) center / contain no-repeat;
        }
        .op-apps-clone { display: none !important; }
        .op-apps-chips li.op-apps-chip-more { border-style: dashed; background: transparent; font-weight: 500; font-style: italic; }
        @media (min-width: 768px) {
          .op-apps-lead { font-size: 16px; }
          .op-apps-marq {
            width: min(1040px, 92vw); margin: 12px auto 0; overflow: hidden;
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
            mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          }
          .op-apps-chips {
            flex-wrap: nowrap; justify-content: flex-start; width: max-content; max-width: none; margin: 0;
            padding: 0 8px 0 0; animation: opAppsMarq 38s linear infinite;
          }
          .op-apps-chips li { flex: none; white-space: nowrap; }
          .op-apps-chips li.op-apps-clone { display: inline-flex !important; }
          .op-apps-marq:hover .op-apps-chips { animation-play-state: paused; }
          @keyframes opAppsMarq { to { transform: translateX(-50%); } }
          @media (prefers-reduced-motion: reduce) { .op-apps-chips { animation: none; } }
          .op-apps-chips li { padding: 6px 16px; font-size: 14px; }
          .op-apps-chips li i { width: 16px; height: 16px; }
        }
        /* Zlatá čiara pod nadpisom — tá istá ako pod VÍZIOU (.vhero-h2::after,
           Matej 27. 9.: *„pod nadpis dať čiaru ako je pod víziou"*). */
        .op-apps-h2::after, .op-apps-name::after {
          content: ''; position: absolute; bottom: 0; height: 2px;
          background: linear-gradient(90deg, rgba(201,154,63,0) 0%, rgba(201,154,63,.85) 22%, rgba(201,154,63,.85) 78%, rgba(201,154,63,0) 100%);
        }
        .op-apps-h2::after { left: 50%; transform: translateX(-50%); width: min(220px, 60%); }
        .op-apps-h2 {
          position: relative; padding-bottom: 16px;
          margin: 0; text-align: center;
          font: 700 clamp(24px, 4.2vw, 56px)/1.1 'Cinzel', serif; letter-spacing: .06em; text-transform: uppercase;
          background: linear-gradient(90deg, #8A6420, #C99A3F 30%, #E8C35A 50%, #C99A3F 70%, #8A6420);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .op-apps-eye {
          margin: 0 0 8px; font: 500 11px/1.4 'Space Grotesk', sans-serif; letter-spacing: .22em;
          text-transform: uppercase; color: rgba(35,22,8,.6);
        }
        /* Pri nadpise zarovnanom doľava čiara vychádza z plnej zlatej a doznieva. */
        .op-apps-name::after {
          left: 0; width: min(200px, 70%);
          background: linear-gradient(90deg, rgba(201,154,63,.9) 0%, rgba(201,154,63,.85) 55%, rgba(201,154,63,0) 100%);
        }
        .op-apps-name {
          position: relative; padding-bottom: 16px;
          margin: 0 0 8px; white-space: nowrap; font: 700 clamp(24px, 3vw, 40px)/1.1 'Cinzel', serif; letter-spacing: .06em; color: #8A6420;
        }
`;
