import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PackDogFull {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
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
    if (!userId) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    let mounted = true;

    // DEV-ONLY seed: NOAUTH guest has no Supabase dogs, so the editor gallery
    // would be empty. Seed demo dogs so BIO/tags editing is testable locally.
    // Never ships (import.meta.env.DEV). NECOMMITOVAŤ — revert before push.
    //
    // Hekthor NESIE REÁLNU FOTKU (Matej 2026-07-26: „použi moje fotky z profilu
    // hekthor nech vidíme preview") — bez nej je celá galéria prázdne krúžky s
    // iniciálou, čo je presne to, čo na profile vyzeralo pochmúrne. Rex ostáva
    // BEZ fotky zámerne: v jednom screenshote je tak vidieť oba stavy.
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
        }, {
          id: 'dev-mock-dog-1',
          dog_name: 'Rex',
          cloudinary_main_url: null,
          selections: { ownerGender: 'male', dogGender: 'male', dogColour: 'black', dogBloodline: 'aristocrat' },
          created_at: '2026-01-01T00:00:00.000Z',
          pack_number: 42,
        }],
        loading: false,
      });
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
        .select('id, dog_name, cloudinary_main_url, selections, created_at, pack_number')
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
