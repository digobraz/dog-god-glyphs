// ============================================================================
// DEV-ONLY prevzaté spacie miesto (`VITE_PACK_NOAUTH=1`).
//
// Prečo vôbec: karta miesta má DVA stavy — bod zo sveta („o tomto mieste ešte nikto nič
// nenapísal") a prevzaté miesto (chipy, popis, autor). Druhý stav sa dnes nedá vyvolať
// naživo, lebo formulár, ktorým sa miesto preberá, ešte nestojí — bez rekvizity by sa
// polovica karty nedala ani raz vidieť, ani odklepnúť.
//
// Je to Ďurková zámerne: presne ten bod, na ktorom Matej 27. 8. 2026 našiel, že appka
// z útulne spravila „chatu s obsluhou" s vaňou. Na ňom sa aj kontroluje, že po zlúčení
// druhov už karta hovorí „Útulňa / chata".
//
// ⚠️ Do produkčného buildu sa to nedostane: `import.meta.env.DEV` je vo `vite build`
//    `false` ⇒ `DEV_NOAUTH` je natvrdo `false` a táto vetva sa odstráni.
// ============================================================================
import type { SleepSpot } from './sleepSpotsData';

export const DEV_MOCK_SPOTS: SleepSpot[] = [
  {
    id: 'dev-durkova',
    kind: 'hut',
    name: 'Útulňa Ďurková pod Chabencom',
    lat: 48.9310591,
    lon: 19.4667985,
    chips: ['fee', 'meals', 'fire', 'water'],
    body: 'Spí sa vo vlastnom spacáku, palanda je hore. Piecka kúri rýchlo, drevo si nanos zvonku. '
        + 'Hektor mal miesto pri dverách a nikto nenamietal.',
    // reálny asset z datasetu výletov — rekvizita má vyzerať ako fotka, nie ako rozbitý obrázok
    photoUrl: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1784632771/trails/male-karpaty-zaruby/1784632770000-f82879.jpg',
    authorFirst: 'Matej',
    packNumber: 1,
    isMine: true,
  },
];
