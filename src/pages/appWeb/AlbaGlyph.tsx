/* Tri ALBY (skutočné psy #43 #59 #61, údaje presne z OnePage.tsx `ALBAS`, zámerne natvrdo) + interaktívny
 *  heroglyf: ťuk/hover na časť rámika ukáže, čo znamená. Zóny = `DGX_SLOTS` z OnePage.tsx
 *  (sústava HeroglyphFrame.tsx, viewBox 800 1100 13100 3500), prepočítané na %. Texty COPY3 `gz_*`. */
import { useState, type CSSProperties } from 'react';

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
const cldGlyph = (u: string, w = 600) => u.replace('/upload/', `/upload/c_fit,w_${w},q_auto,f_auto/`);

/* sloty veľkého rámu — x, y, w, h vo viewBoxe 800 1100 13100 3500; g = skupina (dog | own) */
const SLOTS = [
  { k: 'dogGender',  x: 1282,  y: 1620, w: 1348, h: 935,  g: 'basics' },
  { k: 'colour',     x: 3034,  y: 1620, w: 933,  h: 935,  g: 'basics' },
  { k: 'fate',       x: 1282,  y: 2764, w: 1348, h: 1309, g: 'basics' },
  { k: 'bloodline',  x: 2849,  y: 2764, w: 1307, h: 1309, g: 'basics' },
  { k: 'shape',      x: 4375,  y: 1621, w: 3134, h: 2453, g: 'breed'  },
  { k: 'char1',      x: 11236, y: 1620, w: 2172, h: 1117, g: 'char'   },
  { k: 'char2',      x: 11236, y: 2957, w: 2172, h: 1116, g: 'char'   },
  { k: 'ownGender',  x: 7974,  y: 1863, w: 905,  h: 1968, g: 'own'    },
  { k: 'ownChinese', x: 8978,  y: 1866, w: 971,  h: 931,  g: 'own'    },
  { k: 'ownZodiac',  x: 10049, y: 1866, w: 723,  h: 931,  g: 'own'    },
  { k: 'ownInitial', x: 8977,  y: 2895, w: 975,  h: 936,  g: 'own'    },
  { k: 'ownRank',    x: 10049, y: 2898, w: 723,  h: 933,  g: 'own'    },
] as const;
const VB = { x: 800, y: 1100, w: 13100, h: 3500 };

export function AlbaTrio() {
  return (
    <div className="alba-trio">
      {ALBAS.map(a => (
        <figure className="alba pk-subblock" key={a.n}>
          <div className="alba-ph"><img src={cldPhoto(a.photo)} alt={`ALBA #${a.n}`} loading="lazy" /></div>
          <figcaption><span className="alba-nm">ALBA</span><b>#{a.n}</b></figcaption>
          <div className="alba-gl"><img src={cldGlyph(a.glyph)} alt={`heroglyph ALBA #${a.n}`} loading="lazy" /></div>
        </figure>
      ))}
    </div>
  );
}

export function GlyphZones({ c }: { c: (k: string) => string }) {
  const [on, setOn] = useState<string | null>(null);
  const s = SLOTS.find(x => x.k === on);
  const grp = s ? (s.g === 'own' ? 'gb_own' : 'gb_dog') : null;
  return (
    <div className="gz">
      <div className="gz-scroll">
        <div className="gz-img" onPointerLeave={e => { if (e.pointerType === 'mouse') setOn(null); }}>
          <img src={cldGlyph(ALBAS[0].glyph, 1400)} alt={`heroglyph ALBA #${ALBAS[0].n}`} loading="lazy" />
          {SLOTS.map(z => (
            <button key={z.k} type="button" className={`gz-z g-${z.g}${on === z.k ? ' on' : ''}`} aria-label={c(`gz_${z.k}`)}
              style={{ left: `${((z.x - VB.x) / VB.w) * 100}%`, top: `${((z.y - VB.y) / VB.h) * 100}%`, width: `${(z.w / VB.w) * 100}%`, height: `${(z.h / VB.h) * 100}%` } as CSSProperties}
              onPointerEnter={e => { if (e.pointerType === 'mouse') setOn(z.k); }}
              onClick={() => setOn(on === z.k ? null : z.k)} />
          ))}
        </div>
      </div>
      <div className={`gz-pill${s ? ` g-${s.g}` : ''}`} aria-live="polite">
        {s ? <><i>{c(grp!)}</i><b>{c(`gz_${s.k}`)}</b><span>{c(`gz_${s.k}d`)}</span></> : <span>{c('gz_hint')}</span>}
      </div>
    </div>
  );
}
