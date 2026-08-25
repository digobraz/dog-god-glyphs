// Priehradka na nedokončené výlety — pravidlo úplnosti (2026-08-25).
//
// Kontroluje sa TU, nie klikaním: `missingOnTrail` rozhoduje o tom, či výlet uvidí svorka,
// a rozhoduje o tom na troch miestach naraz (sprievodca, mapa, /admin). Chyba v ňom sa
// v rozhraní prejaví ako „nič sa nedeje", nie ako pád.
import { describe, it, expect } from 'vitest';
import { missingOnTrail } from '@/components/pack/addtrip/addTripModel';
import { HERO_TRAILS } from '@/data/heroTrails.generated';

const full = {
  acts: ['hike'], diff: 'Moderate', surface: ['forest'], crowd: 'Calm',
  tags: ['Forest'], stars: 4,
};

describe('missingOnTrail', () => {
  it('hotový pešií výlet nechýba nič', () => {
    expect(missingOnTrail(full)).toEqual([]);
  });

  it('každé vynechané povinné pole sa ohlási', () => {
    expect(missingOnTrail({ ...full, diff: undefined })).toEqual(['pack.addTrip.field.diff']);
    expect(missingOnTrail({ ...full, surface: [] })).toEqual(['pack.addTrip.field.surface']);
    expect(missingOnTrail({ ...full, crowd: '' })).toEqual(['pack.addTrip.field.crowd']);
    expect(missingOnTrail({ ...full, tags: [] })).toEqual(['pack.addTrip.field.tags']);
    expect(missingOnTrail({ ...full, stars: 0 })).toEqual(['pack.addTrip.field.paws']);
  });

  it('fotka povinná NIE JE (Matej 2026-08-25) — jediné pole, ktoré sa nedá doplniť rozhodnutím', () => {
    expect(missingOnTrail({ ...full, photos: [] } as never)).toEqual([]);
  });

  it('náročnosť a povrch sa nepýtajú mimo pešej aktivity', () => {
    const water = { acts: ['paddleboard'], crowd: 'Calm', tags: ['Lake/Reservoir'], stars: 5 };
    expect(missingOnTrail(water)).toEqual([]);
  });

  it('kurátorovaný dataset je pod tým istým pravidlom úplný — inak by pravidlo skrylo katalóg', () => {
    const broken = HERO_TRAILS.filter((tr) => missingOnTrail(tr).length > 0);
    expect(broken.map((tr) => tr.id)).toEqual([]);
  });
});
