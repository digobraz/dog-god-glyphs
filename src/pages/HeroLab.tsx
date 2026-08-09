import { useState } from 'react';
import { HeroCard, type HeroDog } from '@/components/pack/HeroCard';
import { Gateways } from '@/components/pack/Gateways';
import { PACK_THEME } from '@/components/pack/packTheme';

// ─────────────────────────────────────────────────────────────────────────────
// DEV-ONLY dielňa hero radu (`/pack/_herolab`). Route je v `App.tsx` za
// `import.meta.env.DEV` → do produkčného buildu sa nedostane.
//
// Dôvod existencie: homepage `/pack` sa bez reálnej session vôbec nevykreslí
// (`Pack.tsx` si ťahá usera vlastným `getUser()`, NOAUTH naň neplatí) a Matej má
// v DEV projekte jedného psa — pyramídu pri 3/5/8/12/20 psoch teda v appke inak
// NEDÁ vidieť. Tu beží ROVNAKÝ komponent `HeroCard`, len s vymyslenou svorkou.
// ⚠️ Nie je to nákres — čo vidíš tu, to vidí aj člen. Ladiť `planRow()` v HeroCard.
// ─────────────────────────────────────────────────────────────────────────────

const T = PACK_THEME;

const NAMES = [
  'HEKTHOR', 'ADA', 'BUBKO', 'TAIKO', 'SEMI', 'INGO', 'MAXIMILIÁN', 'LU',
  'BELLA', 'ARGO', 'DUNAJ', 'ŽOFIA', 'REX', 'KIRA', 'BARON', 'NELA',
  'ORION', 'SÁRA', 'TOBIÁŠ', 'MIA',
];

const COUNTS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20];
const WIDTHS: [string, number][] = [['desktop 980', 980], ['tablet 720', 720], ['mobil 390', 390]];

function makeDogs(n: number, photos: boolean): HeroDog[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `fake-${i}`,
    dog_name: NAMES[i % NAMES.length],
    cloudinary_main_url: photos ? '/images/hektor-grid.webp' : null,
    pack_number: i + 1,
  }));
}

export default function HeroLab() {
  const [n, setN] = useState(5);
  const [w, setW] = useState(980);
  const [photos, setPhotos] = useState(true);

  const btn = (active: boolean) => ({
    padding: '6px 11px',
    borderRadius: 999,
    border: `1px solid ${active ? T.cardEdge : T.border}`,
    background: active ? 'rgba(201,154,63,0.18)' : 'transparent',
    color: T.inkWarm,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 12,
    cursor: 'pointer',
  });

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '26px 18px 60px' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {COUNTS.map((c) => (
            <button key={c} type="button" style={btn(c === n)} onClick={() => setN(c)}>{c} psov</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {WIDTHS.map(([label, px]) => (
            <button key={px} type="button" style={btn(px === w)} onClick={() => setW(px)}>{label}</button>
          ))}
          <button type="button" style={btn(photos)} onClick={() => setPhotos((p) => !p)}>fotky</button>
        </div>

        <div style={{ maxWidth: w, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <HeroCard
            name="Matej"
            email="matej@dogypt.com"
            avatarUrl="/images/about-matej.png"
            devotion={4200}
            bones={1240}
            dogs={makeDogs(n, photos)}
          />
          {/* Tretí riadok homepage — zrkadlové bloky DOGMA / AINUBIS.
              ⚠️ Ich mobilné pravidlá sú `@media (max-width:720px)`, teda podľa VIEWPORTU.
              Prepínač šírky hore mení len šírku obalu — mobilnú kompozíciu overíš
              zúžením okna prehliadača, nie tlačidlom „mobil 390". */}
          <Gateways />
        </div>
      </div>
    </div>
  );
}
