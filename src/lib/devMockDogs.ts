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

// ── Majiteľ pre homepage `/pack` (doplnené 24. 8. 2026) ─────────────────────
// `Pack.tsx` má TIEŽ vlastný `supabase.auth.getUser()` a bez session nevykreslí
// `HeroCard` vôbec (`{user && …}`) — stránka zamrzne na `<TreeSkeleton />`.
// Pri PREHLIADKE (`PackWizard`) to nie je len prázdna plocha: prvý krok svieti
// spotlightom presne na ten blok, takže by AInubis ukazoval na skeleton a
// hovoril o niečom, čo tam nie je.
export interface DevMockUser {
  name: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  devotion: number;
  bones: number;
}

export const DEV_MOCK_USER: DevMockUser = {
  name: 'Matej',
  fullName: 'Matej Stacho',
  email: 'dev@dogypt.local',
  avatarUrl: null,
  devotion: 100,
  bones: 0,
};

// ── DEV: ĽUDIA PRI PSOVI — panel „kto má prístup" (B5/F3, 13. 9. 2026) ──────
// `PawmatePanel` číta zoznam cez `security definer` RPC `dog_access_list()`,
// ktorá stojí na `auth.uid()`. Bez session by teda vrátila prázdno — a panel by
// vyzeral ako rozbitý, hoci by len nemal koho ukázať.
//
// 🔴 A HORŠIE: pod NOAUTH sa Supabase volať NEMÁ VÔBEC (lock v CLAUDE.md).
// `rpc()` si pýta token cez `navigator.locks`, a keď je ten zámok v profile
// prehliadača zaseknutý, volanie sa nevráti NIKDY — panel ostane na spinneri
// bez chyby a bez konca.
//
// Preto tu leží živý zoznam v pamäti: pozvanie doň pridá riadok, stiahnutie ho
// odoberie, takže sa celý flow (voľné miesto → čakajúca pozvánka → zase voľné)
// dá prejsť na telefóne bez prihlásenia. Po obnovení stránky je znova prázdny —
// je to atrapa, nie databáza.
export interface DevMockAccessRow {
  kind: 'human' | 'invite';
  user_id: string | null;
  role: string;
  rights: Record<string, boolean>;
  source: 'owner' | 'invite' | 'merge';
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  since: string;
  expires_at: string | null;
  invite_id: string | null;
}

export const DEV_MOCK_ACCESS: DevMockAccessRow[] = [
  {
    kind: 'human', user_id: 'dev-mock-owner', role: 'pawtner', rights: {},
    source: 'owner', name: DEV_MOCK_USER.name, email: null, avatar_url: null,
    since: '2026-01-01T00:00:00.000Z', expires_at: null, invite_id: null,
  },
];
