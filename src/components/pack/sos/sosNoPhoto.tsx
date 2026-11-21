// SOS — pes BEZ fotky: dôstojná náhrada namiesto prázdneho bloku (stránka psa, verejná `/lost/:slug`, oslava „je doma“,
// výber psa, zoznam pátraní). Rovnaká náhrada ako na letáku: silueta patróna z plemena (`breeds.json` → `public/patrons/`),
// kríženec / neznáme plemeno = pečať DOGYPT. Žiadne nové úložisko, žiadny nový obrázok.
// Bez importu zo `sosShared`, aby sa nevytvoril kruh (`SosFlyer` aj `sosShared` si berú `patronFor` odtiaľto).
import breedsData from '@/data/breeds.json';

export const SOS_SEAL = '/images/peciat-dogypt.webp';

/** Silueta patróna z plemena (`breeds.json` → `public/patrons/<kat>-<nn>.svg`); kríženec / neznáme plemeno = null. */
export const patronFor = (breed: string | null | undefined): string | null => {
  const first = (breed ?? '').split(',')[0].trim().toLowerCase();
  if (!first) return null;
  const hit = (breedsData as { breeds: Array<{ en: string; patron?: string }> }).breeds.find((b) => b.en.trim().toLowerCase() === first);
  return hit?.patron ? `/patrons/${hit.patron}.svg` : null;
};

/** Adresa náhradnej kresby pre psa bez fotky. */
export const noPhotoSrc = (breed: string | null | undefined): string => patronFor(breed) ?? SOS_SEAL;

/** Veľký obdĺžnik fotky (4:3) — `.sos-photo.sos-photo--none` z `SOS_CSS`, s kresbou uprostred. */
export function SosPhotoNone({ breed }: { breed?: string | null }) {
  return <div className="sos-photo sos-photo--none"><img src={noPhotoSrc(breed)} alt="" /></div>;
}

/** Malý kruh (44 px zoznam pátraní, 40 px výber psa). `cls` = trieda kruhu (`sos-ph` · `sosn-av`). */
export function SosAvatarNone({ breed, cls }: { breed?: string | null; cls: 'sos-ph' | 'sosn-av' }) {
  return <span className={`${cls} ${cls}--none`} aria-hidden><img src={noPhotoSrc(breed)} alt="" /></span>;
}
