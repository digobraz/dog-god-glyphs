/* Tri ALBY (skutočné psy #43 #59 #61, údaje presne z OnePage.tsx `ALBAS`, zámerne natvrdo) + interaktívny
 *  heroglyf: ťuk/hover na časť rámika ukáže, čo znamená. Heroglyf je zložený ako na /onepage (dekodér DGX):
 *  rám + kartuša + 12 dielov `/heroglyph/dogtrix/hek/*.svg` (Hektor, pack #1), na PC vodorovný, na mobile
 *  ZVISLÝ (Matej 6. 11.: „na mobile by mohol byť vertikálny… tak ako máme aktuálne na webe“). Geometria
 *  odpísaná z OnePage.tsx `DGX_SLOTS` / `DGX_SLOTS_V` / `DGX_D_*` (sústavy HeroglyphFrame a VerticalHeroglyphFrame).
 *  Obsah bubliny = ten istý ako dekodér na /onepage: Hektorove SKUTOČNÉ hodnoty zo slovníka
 *  `onepage.dgx.bub.<slot>.label|value|glyph` (čo je to za údaj · hodnota · ako sa kresba volá) (farebná legenda oblastí
 *  pod rámom bola a Matej ju 6. 11. zrušil) — Matej 6. 11.: „daj logiku toho, čo už máme hotové aj obsahovo“. */
import { useState, type CSSProperties, type PointerEvent } from 'react';
import { useT } from '@/i18n/LanguageContext';

const ALBAS = [
  { n: 43,
    photo: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1784216321/tmp/2985ba34-7a97-44e8-993f-5d1c21a703be/main_crop.webp',
    glyph: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1784216804/heroglyphs/cs_live_a1wTtND9fWvjRCEg4iKQCC2wxmkdTSOZYPgeGIHcvYRVpd0Ypvuxdleajc.png' },
  { n: 59,
    photo: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1785841680/tmp/0bf4933e-222e-4402-a46c-92604554534e/main_crop.webp',
    glyph: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1785841967/heroglyphs/cs_live_b15gG68r7JAFiffwBORhcdhSSIsX2N6fQ869yNNybAheiArp5qZ5j3m4Sk.png' },
  { n: 61,
    photo: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1786437529/tmp/6c423ceb-76fa-408d-9fd8-420fcff1d66b/main_crop.png',
    glyph: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1786438287/heroglyphs/cs_live_b19NQNaAzwyfMcnLvVjUl3Fw9Mo4GCl44VcwRp9tgzLpAB1WYzgRtmAQWV.png' },
] as const;
const cldPhoto = (u: string) => u.replace('/upload/', '/upload/c_fill,g_auto,w_420,h_420,q_auto,f_auto/');
const cldGlyph = (u: string) => u.replace('/upload/', '/upload/c_fit,w_600,q_auto,f_auto/');

/* sloty zvislého rámu (viewBox 781 329.5 917.9 2844.8); g = skupina. Vodorovný rám web od 6. 11. nepoužíva. */
const SLOTS_V = [
  { k: 'dogGender',  x: 898.453,  y: 475,     w: 323.19,  h: 224.091, g: 'basics' },
  { k: 'colour',     x: 1313.13,  y: 475,     w: 224.039, h: 224.091, g: 'basics' },
  { k: 'fate',       x: 898.767,  y: 751.933, w: 322.889, h: 313.596, g: 'basics' },
  { k: 'bloodline',  x: 1268.43,  y: 751.933, w: 313.561, h: 312.991, g: 'basics' },
  { k: 'shape',      x: 898.807,  y: 1116.58, w: 682.7,   h: 534.378, g: 'breed'  },
  { k: 'ownGender',  x: 948.932,  y: 1755.42, w: 188.442, h: 409.417, g: 'own'    },
  { k: 'ownChinese', x: 1157.84,  y: 1756.02, w: 202.167, h: 193.755, g: 'own'    },
  { k: 'ownZodiac',  x: 1380.51,  y: 1756.02, w: 150.407, h: 193.81,  g: 'own'    },
  { k: 'ownInitial', x: 1157.51,  y: 1970.04, w: 202.91,  h: 194.803, g: 'own'    },
  { k: 'ownRank',    x: 1380.51,  y: 1970.62, w: 150.407, h: 193.055, g: 'own'    },
  { k: 'char1',      x: 898.459,  y: 2268.7,  w: 683.547, h: 353.512, g: 'char'   },
  { k: 'char2',      x: 898.459,  y: 2675.15, w: 683.777, h: 353.396, g: 'char'   },
] as const;
const VB_V = '781 329.5 917.9 2844.8';
const D_CART_V = 'M1551.35,2145.5c0,21.678 -17.872,39.229 -39.94,39.229l-542.91,-0c-22.08,-0 -39.941,-17.551 -39.941,-39.229l0,-370.809c0,-21.638 17.861,-39.225 39.941,-39.225l542.91,-0c22.068,-0 39.94,17.587 39.94,39.225l0,370.809Zm-13.217,-440.64l-596.353,0c-24.214,0 -43.881,19.945 -43.881,44.545l0,421.381c0,24.6 19.667,44.552 43.881,44.552l596.353,-0c24.203,-0 43.837,-19.952 43.837,-44.552l0,-421.381c0,-24.6 -19.634,-44.545 -43.837,-44.545Z';
const D_FRAME_V = 'M1597.58,421.985l-715.32,-0c-20.346,-0 -36.85,16.492 -36.85,36.842l0.075,2586.18c-0,20.392 16.504,36.887 36.845,36.887l715.325,0c20.355,0 36.846,-16.495 36.846,-36.887l-0.075,-2586.18c0,-20.35 -16.491,-36.842 -36.846,-36.842m-759.983,-51.042l804.683,0c23.88,0 43.221,19.338 43.221,43.225l0.075,2675.54c0,23.879 -19.341,43.221 -43.221,43.221l-804.683,-0c-23.879,-0 -43.221,-19.342 -43.221,-43.221l-0.075,-2675.54c0,-23.887 19.346,-43.225 43.221,-43.225';

/* fotky jemne pootočené a za myšou sa nakláňajú (Matej 6. 11.: „fotky alb trošku pootoč a urob interaktívne na pohyb“) */
const ROT = [-4, 2.5, -2] as const;
const tilt = (e: PointerEvent<HTMLDivElement>) => {
  if (e.pointerType !== 'mouse') return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--tx', `${(((e.clientY - r.top) / r.height) - .5) * -14}deg`);
  e.currentTarget.style.setProperty('--ty', `${(((e.clientX - r.left) / r.width) - .5) * 14}deg`);
  e.currentTarget.classList.add('on');
};
const untilt = (e: PointerEvent<HTMLDivElement>) => { e.currentTarget.classList.remove('on'); e.currentTarget.style.removeProperty('--tx'); e.currentTarget.style.removeProperty('--ty'); };

/* Trojica ako na /onepage (`.op-alba-*`): fotka, meno + lapisová pilulka s číslom, heroglyf priamo na papyruse — bez blokov. */
export function AlbaTrio() {
  return (
    <div className="alba-trio">
      {ALBAS.map((a, i) => (
        <figure className="alba" key={a.n} style={{ ['--r' as string]: `${ROT[i]}deg` } as CSSProperties}>
          <div className="alba-ph" onPointerMove={tilt} onPointerLeave={untilt}><img src={cldPhoto(a.photo)} alt={`ALBA #${a.n}`} loading="lazy" /></div>
          <figcaption><span className="alba-nm">ALBA</span><b>#{a.n}</b></figcaption>
          <img className="alba-gl" src={cldGlyph(a.glyph)} alt={`heroglyph ALBA #${a.n}`} loading="lazy" />
        </figure>
      ))}
    </div>
  );
}

/** „Na svete je približne 144 572 psov s menom Alba…“ — číslo podčiarknuté bodkami, hover/ťuk = „Hrubý odhad AINUBISa :)“. */
export function AlbaCount({ c }: { c: (k: string) => string }) {
  const [tip, setTip] = useState(false);
  return (
    <p className="lead alba-cnt">
      {c('alba_cnt_a')}{' '}
      <button type="button" className={`alba-num${tip ? ' on' : ''}`} onClick={() => setTip(!tip)} onBlur={() => setTip(false)}>
        {c('alba_cnt_n')}<span className="alba-tip" role="tooltip">{c('alba_cnt_tip')}</span>
      </button>{' '}
      {c('alba_cnt_b')}
    </p>
  );
}

/* Heroglyf ZVISLO s bodkami ako na súčasnom webe (Matej 6. 11.: „heroglyph na vertikálu … ako už to máme na
 *  aktuálnom = bodky a otvorenie“): štyri farebné bodky = štyri skupiny (PÔVOD · PLEMENO · TY · POVAHA, poradie
 *  zhora nadol ako v ráme), ťuk na bodku alebo na diel rámu otvorí kartu skupiny so všetkými jej symbolmi. */
const GROUPS = [
  { g: 'basics', n: 1 },
  { g: 'breed', n: 2 },
  { g: 'own', n: 4 },
  { g: 'char', n: 3 },
] as const;

export function GlyphZones() {
  const t = useT();
  const [on, setOn] = useState<string>('basics');
  const grp = GROUPS.find(x => x.g === on)!;
  const items = SLOTS_V.filter(z => z.g === on);
  return (
    <div className={`gz v g-${on}`}>
      <div className="gz-card" aria-live="polite">
        <h4>{t(`onepage.dgx.k.${grp.n}.name`)}</h4>
        <ul>
          {items.map(z => (
            <li key={z.k}>
              <img src={`/heroglyph/dogtrix/hek/${z.k}.svg`} alt="" />
              <span><b>{t(`onepage.dgx.bub.${z.k}.glyph`)}</b><small>{t(`onepage.dgx.bub.${z.k}.label`)} · {t(`onepage.dgx.bub.${z.k}.value`)}</small></span>
            </li>
          ))}
        </ul>
      </div>
      <div className="gz-dots" role="tablist">
        {GROUPS.map(x => (
          <button key={x.g} type="button" role="tab" aria-selected={on === x.g} aria-label={t(`onepage.dgx.k.${x.n}.name`)}
            className={`g-${x.g}${on === x.g ? ' on' : ''}`} onClick={() => setOn(x.g)} onPointerEnter={e => { if (e.pointerType === 'mouse') setOn(x.g); }} />
        ))}
      </div>
      <svg className="gz-svg" viewBox={VB_V} role="img" aria-label="heroglyph">
        <path d={D_FRAME_V} fill="#2a1608" />
        <path d={D_CART_V} fill="#2a1608" />
        {SLOTS_V.map(z => (
          <g key={z.k} className={`gz-z g-${z.g}${on === z.g ? ' on' : ''}`} tabIndex={0} role="button" aria-label={t(`onepage.dgx.bub.${z.k}.label`)}
            onPointerEnter={e => { if (e.pointerType === 'mouse') setOn(z.g); }}
            onClick={() => setOn(z.g)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOn(z.g); } }}>
            <rect className="gz-hl" x={z.x} y={z.y} width={z.w} height={z.h} rx={14} />
            <image href={`/heroglyph/dogtrix/hek/${z.k}.svg`} x={z.x} y={z.y} width={z.w} height={z.h} preserveAspectRatio="xMidYMid meet" />
          </g>
        ))}
      </svg>
    </div>
  );
}
