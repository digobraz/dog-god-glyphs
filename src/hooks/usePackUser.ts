import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PackDogFull {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  selections: { ownerGender?: string | null } | null;
  created_at: string;
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
        .select('id, dog_name, cloudinary_main_url, selections, created_at')
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
