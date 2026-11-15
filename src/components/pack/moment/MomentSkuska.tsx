// SKÚŠKA MOMENTOV — malý panel na vyvolanie momentu v testovacej appke a v deve (`/pack?momenty=1`).
// Matej 15. 11. 2026: *„nevieš mi to otvoriť na lokáli nech si to pozriem ako to bude 1:1?“* — etapa 2 ešte
// momenty nenapojila na udalosti, takže bez panelu by sa spoločný komponent nedal pozrieť v skutočnej appke.
// Texty a čísla sú ukážkové. Montuje ho MomentHost len pod MOMENTY_ON (testovacia appka a dev).
// Matej 15. 11.: *„daj to do testovacej apky“* — appka nemá adresný riadok, preto je panel zbalený do pilulky
// „Momenty“ pri ľavom okraji; ťuk ho rozbalí. `?momenty=1` ho otvorí rovno rozbalený.
import { useState } from 'react';
import { ukazMoment, iskra, type MomentData } from './momentBus';

const UKAZKY: Array<[string, MomentData]> = [
  ['Pečať · zápis dňa', { id: 'zapis', cislo: 12, pecatText: 'DEŇ V RADE', ikona: '/icons/sys/pridaj-den.webp', nadpis: '<em>Zapísané</em>', podnadpis: 'Hekthor ďakuje. Zajtra deň 13.' }],
  ['Odhalenie · UČEŇ', { id: 'ucen', obrazok: '/icons/pack/rank/learner-4.webp', stuha: 'UČEŇ 4', nadpis: 'Nový <em>level</em>', podnadpis: 'Zrno po zrne. Ďalší level je za 25 zvitkov.' }],
  ['Odhalenie · séria', { id: 'seria', obrazok: '/icons/pack/badges/a0-6.webp', stuha: '30 DNÍ', nadpis: '30 dní v <em>rade</em>', podnadpis: 'Séria je tvrdá. Vynechaný deň ju vráti na nulu.' }],
  ['Obrad · číslo psa', { id: 'cislo', cislo: '122', zCelku: '1 000 000', eyebrow: 'Poradové číslo', nadpis: 'Hekthor je <em>číslo</em> v svorke', podnadpis: 'Pozri sa na stenu, tu sa zapisuje každý pes.' }],
  ['Obrad · výročie', { id: 'vyrocie', obrazok: '/icons/pack/rank/servant-2.webp', stuha: 'SLUŽOBNÍK · 3. ROK', nadpis: 'Tri roky <em>spolu</em>', podnadpis: 'Služobník rastie rokmi. Každý deň sa počíta.' }],
];

export function MomentSkuska({ rozbaleny = false }: { rozbaleny?: boolean }) {
  const [open, setOpen] = useState(rozbaleny);
  if (!open) return (
    <button type="button" onClick={() => setOpen(true)}
      style={{ position: 'fixed', left: 0, top: '42%', zIndex: 2147482000, padding: '8px 4px', borderRadius: '0 8px 8px 0', writingMode: 'vertical-rl',
        background: 'rgba(249,242,227,.96)', border: '1px solid var(--p3d-ink)', borderLeft: 0, fontSize: 12, fontWeight: 600 }}>Momenty</button>
  );
  return (
    <div style={{ position: 'fixed', left: 8, top: 72, zIndex: 2147482000, display: 'flex', flexDirection: 'column', gap: 4, padding: 8,
      borderRadius: 12, background: 'rgba(249,242,227,.96)', border: '2px solid var(--p3d-ink)', boxShadow: 'var(--p3d-lift)', fontSize: 12, maxWidth: 170 }}>
      <b style={{ fontSize: 12 }}>Momenty · skúška</b>
      {UKAZKY.map(([label, m]) => (
        <button key={label} type="button" onClick={() => ukazMoment(m)}
          style={{ textAlign: 'left', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--p3d-ink)', background: '#fff' }}>{label}</button>
      ))}
      <button type="button" onClick={(e) => iskra(e.currentTarget, 'lajk')}
        style={{ textAlign: 'left', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--p3d-ink)', background: '#fff', color: '#C8202F' }}>Iskra · lajk (ťukni)</button>
      <button type="button" onClick={() => setOpen(false)} style={{ fontSize: 12, opacity: .6, background: 'none', border: 0 }}>zbaliť</button>
    </div>
  );
}
