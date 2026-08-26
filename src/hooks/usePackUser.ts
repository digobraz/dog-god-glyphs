import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PackDogFull {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  /** Meno majiteľa Z OBJEDNÁVKY. Je to VÝCHODISKO mena člena, keď si v profile
   *  nevypísal vlastné (Matej 2026-08-26) — `/pack/profile` ho ukazuje v poli MENO. */
  owner_name?: string | null;
  // ownerGender = pôvodné pole; dogGender/dogColour/dogBloodline pridané pre read-only heroglyph
  // zhrnutie v profil-accordion editore (zadanie-profil-read-dog-2026-07-25 §2). Column list v
  // .select() nižšie už 'selections' celé ťahá — toto len rozširuje typ o polia, ktoré sú v JSON.
  selections: {
    ownerGender?: string | null;
    dogGender?: string | null;
    dogColour?: string | null;
    dogBloodline?: string | null;
  } | null;
  created_at: string;
  pack_number: number | null;
  // Pre-rendered heroglyf (rovnaký zdroj, aký zobrazuje PackTree). Kruhová fotka
  // v OH, MY DOG! ho stavia vedľa seba (Matej 2026-07-26: „foto do kruhu +
  // heroglyph"). Fake/unicode aproximácia sa NEKRESLÍ — bez URL sa zobrazí
  // prázdny rám z `assets/heroglyph-frame.svg`.
  heroglyph_png_url?: string | null;
}

export interface PackUserData {
  devotion: number;
  bones: number;
  avatarUrl: string | null;
  ownerGender: string | null;
  dogs: PackDogFull[];
  loading: boolean;
}

// Shared hook: user metadata (devotion/bones/avatar) + full dog rows.
// Pass userId from PackLayout's session; returns loading=false immediately if null.
export function usePackUser(userId: string | null): PackUserData {
  const [state, setState] = useState<PackUserData>({
    devotion: 100,
    bones: 0,
    avatarUrl: null,
    ownerGender: null,
    dogs: [],
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    // DEV-ONLY seed: NOAUTH guest has no Supabase dogs, so the editor gallery
    // would be empty. Seed demo dogs so BIO/tags editing is testable locally.
    // Never ships (import.meta.env.DEV). NECOMMITOVAŤ — revert before push.
    //
    // Hekthor NESIE REÁLNU FOTKU (Matej 2026-07-26: „použi moje fotky z profilu
    // hekthor nech vidíme preview") — bez nej je celá galéria prázdne krúžky s
    // iniciálou, čo je presne to, čo na profile vyzeralo pochmúrne. Rex (mock
    // druhý pes bez fotky) ODSTRÁNENÝ 2026-07-29 (Matej: „vymaž rexa a nechaj
    // len hektora") — zostáva len jeden dev seed.
    const DEV_NOAUTH = import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === '1';
    if (DEV_NOAUTH) {
      setState({
        devotion: 100, bones: 0, avatarUrl: '/images/about-matej.png', ownerGender: 'male',
        dogs: [{
          id: 'dev-mock-dog-hekthor',
          dog_name: 'Hekthor',
          cloudinary_main_url: '/images/hektor-grid.webp',
          selections: { ownerGender: 'male', dogGender: 'male', dogColour: 'black', dogBloodline: 'aristocrat' },
          created_at: '2017-06-01T00:00:00.000Z',
          pack_number: 1,
          heroglyph_png_url: '/images/hekthor-heroglyph.webp',
        }],
        loading: false,
      });
      return () => { mounted = false; };
    }

    // Pozor na poradie: seed musí byť PRED touto podmienkou. Bez prihlásenia je
    // `userId` null, takže early return zhasol seed a galéria bola prázdna
    // („No god yet.") aj s VITE_PACK_NOAUTH=1.
    if (!userId) {
      setState(s => ({ ...s, loading: false }));
      return () => { mounted = false; };
    }

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted || !user) {
        if (mounted) setState(s => ({ ...s, loading: false }));
        return;
      }

      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const devotion = Number(meta.devotion) || 100;
      const bones = Number(meta.bones) || 0;
      const avatarUrl = (meta.avatar_url || meta.avatar || null) as string | null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: dogRows } = await (supabase as any)
        .from('dogs')
        .select('id, dog_name, cloudinary_main_url, selections, created_at, pack_number, heroglyph_png_url, owner_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }) as { data: PackDogFull[] | null };

      if (!mounted) return;

      const dogs = dogRows ?? [];
      const ownerGender = dogs[0]?.selections?.ownerGender ?? null;
      setState({ devotion, bones, avatarUrl, ownerGender, dogs, loading: false });
    })();

    return () => { mounted = false; };
  }, [userId]);

  return state;
}
