// ============================================================================
// DEV-ONLY svorka pre beh bez prihlásenia (`VITE_PACK_NOAUTH=1`).
//
// `usePackUser.ts` taký seed má už od 26. 7. 2026, ale `/pack/dogs` a
// `/pack/nature` cezeň NEIDÚ — obe si robia vlastný dotaz cez
// `supabase.auth.getUser()` (hub potrebuje poradové číslo, krajinu a `selections`,
// ktoré identita nevracia). Bez session tak vracali prázdne pole a stránka
// spadla na „Zatiaľ nemáš na vôdzke žiadneho psa" — vyzerá to ako chyba dát,
// ale je to chýbajúce prihlásenie. Presne tak to 22. 8. 2026 vyzeralo na
// Matejovom telefóne pri teste kvízu.
//
// Prečo mock a nie login: test na TELEFÓNE nemá dôvod pýtať heslo — kvíz sa
// bez session aj tak zapisuje lokálne (`dogEvents.ts` má vetvu pre DEV_NOAUTH).
//
// ⚠️ Do produkčného buildu sa to nedostane: `import.meta.env.DEV` je vo `vite build`
//    `false`, takže `DEV_NOAUTH` je natvrdo `false` a mock sa nikdy nepoužije.
// ============================================================================

export const DEV_NOAUTH =
  import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === '1';

/** Tvar, ktorý potrebuje hub `/pack/dogs` — nadmnožina toho, čo chce kvíz. */
export interface DevMockDog {
  id: string;
  dog_name: string;
  cloudinary_main_url: string;
  heroglyph_png_url: string;
  pack_number: number;
  country: string;
  life_status: string;
  death_date: string | null;
  birth_year: number;
  selections: Record<string, string>;
}

// Jeden pes, nie dvaja — `usePackUser.ts` mal pôvodne aj mocka „Rex", ktorého
// Matej 29. 7. zmazal („vymaž rexa a nechaj len hektora"). Držíme sa toho.
// `country` je ISO3, tak ako to má stĺpec `dogs.country` v Supabase.
export const DEV_MOCK_DOGS: DevMockDog[] = [
  {
    id: 'dev-mock-dog-hekthor',
    dog_name: 'Hekthor',
    cloudinary_main_url: '/images/hektor-grid.webp',
    heroglyph_png_url: '/images/hekthor-heroglyph.webp',
    pack_number: 1,
    country: 'SVK',
    life_status: 'alive',
    death_date: null,
    birth_year: 2016,
    selections: { birthdayYear: '2016', birthdayMonth: '3', birthdayDay: '15' },
  },
];
