// SOS → NÚDZOVÁ KARTIČKA `/pack/sos/karticka` (kôš 3). Matej 5. 11. 2026: rýchly prístup, keď človek nemá fyzickú kartu.
// Jedna kresba a jeden koncept s DOG ID → Dokumenty (`PackDogCard quick`), tu sa len vyberie pes a zdieľa.
// 21. 11. 2026: zoznam psov ide ľahkým `sosMyDogs()` (nie ťažkým `usePackUser`), z lokálnej kópie hneď, so stropom 12 s a SKÚSIŤ ZNOVA;
// po návrate siete sa zotaví sama. Žiadny stav sa nedá vyjsť z „Načítavam“.
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LanguageContext';
import { SosTaskShell } from '@/components/pack/sos/SosTaskShell';
import { loginPath, useSosAuth, useSosT } from '@/components/pack/sos/sosShared';
import { dogsKey, lastDogKey, localGet, localSet, storedUserId, withTimeout } from '@/components/pack/sos/sosLocal';
import { sosMyDogs, type SosDog } from '@/lib/sos';
import { supabase } from '@/integrations/supabase/client';
import { PACK_SPACE } from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import PackDogCard from './PackDogCard';
import { cardUi } from './cardTexts';

const CSS = `.sosc-pick.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}`;

export default function PackSosCard() {
  const nav = useNavigate();
  const s = useSosT();
  const { lang } = useLang();
  const auth = useSosAuth();
  const [uid, setUid] = useState<string | null>(() => storedUserId());
  const [dogs, setDogs] = useState<SosDog[] | null>(() => { const u = storedUserId(); return u ? localGet<SosDog[]>(dogsKey(u)) : null; });
  const [failed, setFailed] = useState(false);
  const [tick, setTick] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const back = () => setTick((n) => n + 1);   // návrat siete: skúsi sa znova sám
    window.addEventListener('online', back);
    return () => window.removeEventListener('online', back);
  }, []);

  useEffect(() => {
    if (auth === 'out') return;
    let alive = true;
    setFailed(false);
    (async () => {
      try {
        let u = uid;
        if (!u) {
          u = (await withTimeout(supabase.auth.getSession(), 8000)).data.session?.user.id ?? null;
          if (!alive) return;
          if (u) setUid(u);
        }
        const list = await withTimeout(sosMyDogs(), 12000);
        if (!alive) return;
        setDogs(list);
        if (u) localSet(dogsKey(u), list);
      } catch {
        if (alive) setFailed(true);   // lokálna kópia (ak je) ostáva zobrazená
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, auth]);

  // Bez prihlásenia nie je čo načítať: späť na prihlásenie s návratom, ako ostatné SOS cesty.
  if (auth === 'out') return <Navigate to={loginPath('/pack/sos/karticka')} replace />;

  const back = () => nav(-1);
  const alive = (dogs ?? []).filter((d) => d.id);
  const lastId = uid ? localGet<string>(lastDogKey(uid)) : null;
  const id = picked ?? (lastId && alive.some((d) => d.id === lastId) ? lastId : null) ?? alive[0]?.id ?? lastId ?? null;
  if (id && uid && id !== lastId) localSet(lastDogKey(uid), id);

  if (!id) {
    return (
      <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
        {dogs && dogs.length === 0 && !failed ? <p className="sos-p">{cardUi('noDogs', lang)}</p>
          : failed ? (
            <>
              <p className="sos-p">{s('pack.sos.card.loadFail')}</p>
              <button type="button" className="sos-cta" onClick={() => setTick((n) => n + 1)}>{s('pack.sos.card.retry')}</button>
            </>
          ) : <p className="sos-p">{s('pack.sos.loading')}</p>}
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
