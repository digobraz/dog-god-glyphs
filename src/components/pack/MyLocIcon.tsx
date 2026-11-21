// MOJA POLOHA = AVATAR (Matej 21. 11. 2026: „všade v appke, kde sa centruje poloha na užívateľa, bude ikona avatara“).
// Tá istá fotka, ktorou mapa VON kreslí človeka na jeho polohe (`UserPosMarker` v PackMap.tsx). Bez fotky samolepka `poloha`.
// Blok = MEDAILÓN (`.pk-medallion`, katalóg PACK_BLOCKS); rozmer dáva volajúci cez `size`.
// Fotku berie zo session (lokálne, bez dotazu do DB), aby ju SOS obrazovky nemuseli ťahať cez `usePackIdentity`.
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sizedUrl } from '@/services/cloudinaryService';
import { MEDALLION_CSS } from '@/components/pack/packTheme';
import { SysIcon } from '@/components/pack/SysIcon';

let cached: string | null | undefined;

export function useMyAvatar(): string | null {
  const [url, setUrl] = useState<string | null>(cached ?? null);
  useEffect(() => {
    if (cached !== undefined) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      const meta = (data.session?.user?.user_metadata ?? {}) as Record<string, unknown>;
      cached = (meta.avatar_url || meta.avatar || null) as string | null;
      if (alive) setUrl(cached);
    }).catch(() => undefined);
    return () => { alive = false; };
  }, []);
  return url;
}

/** Ikonka tlačidla „Moja poloha“. `url` = fotka zvonku (mapa ju už má), inak zo session. */
export function MyLocIcon({ size = 24, url }: { size?: number; url?: string | null }) {
  const own = useMyAvatar();
  const src = url !== undefined ? url : own;
  if (!src) return <SysIcon name="poloha" size={size} />;
  return (
    <>
      <style>{MEDALLION_CSS}</style>
      <span className="pk-medallion" style={{ width: size, height: size }} aria-hidden>
        <img src={sizedUrl(src, 96)} alt="" draggable={false} />
      </span>
    </>
  );
}
