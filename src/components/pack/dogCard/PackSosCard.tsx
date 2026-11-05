// SOS → NÚDZOVÁ KARTIČKA `/pack/sos/karticka` (kôš 3). Matej 5. 11. 2026: rýchly prístup, keď človek nemá fyzickú kartu.
// Jedna kresba a jeden koncept s DOG ID → Dokumenty (`PackDogCard quick`), tu sa len vyberie pes a zdieľa.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePackUser } from '@/hooks/usePackUser';
import { useLang } from '@/i18n/LanguageContext';
import { SosTaskShell } from '@/components/pack/sos/SosTaskShell';
import { useSosT } from '@/components/pack/sos/sosShared';
import { PACK_SPACE } from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import PackDogCard from './PackDogCard';
import { cardUi } from './cardTexts';

const CSS = `.sosc-pick.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}`;

export default function PackSosCard() {
  const nav = useNavigate();
  const s = useSosT();
  const { lang } = useLang();
  const [userId, setUserId] = useState<string | null>(null);
  const { dogs, loading } = usePackUser(userId);
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null)); }, []);

  const back = () => nav(-1);
  const alive = dogs.filter((d) => d.life_status !== 'deceased');
  const id = picked ?? alive[0]?.id ?? null;
  if (!id) {
    return (
      <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
        <p className="sos-p">{loading || !userId ? s('pack.sos.loading') : cardUi('noDogs', lang)}</p>
      </SosTaskShell>
    );
  }
  const picker = alive.length > 1 ? (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: PACK_SPACE.sm }}>
      <style>{CSS}</style>
      {alive.map((d) => (
        <button key={d.id} type="button" className={`pk-pill pk-pill--tap sosc-pick${d.id === id ? ' is-on' : ''}`} onClick={() => setPicked(d.id)}>{d.dog_name}</button>
      ))}
    </div>
  ) : undefined;
  return <PackDogCard key={id} dogId={id} quick picker={picker} onBack={back} />;
}
