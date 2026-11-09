// TLAČIDLO 3D pre prvky, ktoré nesú vlastnú triedu a JSX sa ich nedotýka (profil, nastavenia, rozkliky odznakov).
// Dáva rovnaký vzhľad ako `.pk-b3` z `lib/papyrus3d.ts` (recept sa tam NEMENÍ, tu sa len volajú jeho premenné).
// Len pod `html.papyrus3d`, teda iba v appke (`APP_NEW`); web tieto pravidlá nikdy nedostane.
import { PACK_TEXT } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';

export type B3Kind = 'lapis' | 'paper' | 'gold' | 'red' | 'green';

const VARS: Record<B3Kind, string> = {
  paper: '--b3-a:#fff;--b3-b:var(--p3d-paper);--b3-p:var(--p3d-gold-solid);--b3-l:var(--p3d-ink);--b3-i:var(--p3d-ink);',
  lapis: `--b3-a:color-mix(in srgb,${LAPIS.edge} 72%,white);--b3-b:${LAPIS.deep};--b3-p:color-mix(in srgb,${LAPIS.deep} 60%,black);--b3-l:${LAPIS.ink};--b3-i:${LAPIS.ink};`,
  gold: '--b3-a:color-mix(in srgb,var(--p3d-gold) 60%,white);--b3-b:var(--p3d-gold);--b3-p:var(--p3d-gold-ink);--b3-l:var(--p3d-ink);--b3-i:var(--p3d-ink);',
  red: '--b3-a:color-mix(in srgb,#C8202F 62%,white);--b3-b:#C8202F;--b3-p:#9E1522;--b3-l:var(--p3d-ink);--b3-i:#fff;',
  green: '--b3-a:color-mix(in srgb,#3D7A4E 66%,white);--b3-b:#3D7A4E;--b3-p:color-mix(in srgb,#3D7A4E 62%,black);--b3-l:var(--p3d-ink);--b3-i:#fff;',
};

/** Pravidlo „vyzeraj ako .pk-b3“ pre selektor `sel` (bez `html.papyrus3d`, ten sa pridá sám). Výška 56, Museum 20. */
export function b3Look(sel: string, kind: B3Kind, extra = ''): string {
  const s = sel.split(',').map((x) => `html.papyrus3d ${x.trim()}`);
  return `${s.join(',')}{${VARS[kind]}height:56px;min-height:56px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;border:2.5px solid var(--b3-l);border-radius:16px;background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 var(--b3-p),0 11px 14px var(--p3d-sh);font:400 ${PACK_TEXT.h2}px/1 'LT Museum',serif;letter-spacing:0;text-transform:none;text-decoration:none;transition:transform .07s,box-shadow .07s;${extra}} /* písmo: cta */
${s.map((x) => `${x}:active:not(:disabled)`).join(',')}{transform:translateY(5px);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 1px 0 var(--b3-p);}
${s.map((x) => `${x}:disabled`).join(',')}{opacity:.55;cursor:default;}
`;
}

/** Karta 3D (papyrus s tmavým obrysom a zlatou perou) — riadky nastavení, štatistiky, boxy. */
export const P3D_CARD = 'border:2.5px solid var(--p3d-ink);border-radius:16px;background:var(--p3d-card);box-shadow:var(--p3d-lift);';
