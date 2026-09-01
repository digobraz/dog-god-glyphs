import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEV_FULL } from '@/lib/packFlags';
import { FOUNDER_ACCOUNT_EMAIL } from '@/components/pack/packCommunity';
import { MapLocked } from '@/components/pack/MapLocked';

/**
 * MapGate — brána pre povrch výletov (mapa + tripy) na PRODUKCII.
 *
 * Mapa je pred launchom schovaná (`DEV_FULL=false`). Aby ju mohol Matej testovať
 * naživo na dogypt.com (nahodiť reálne seed výlety do LIVE `user_trips`) bez toho,
 * aby ju videl ktokoľvek iný, ju odomykáme AJ pre founder účet `hekthorsk@gmail.com`
 * — rovnaký email-gate vzor ako admin (`Admin.tsx` ADMIN_EMAILS).
 *
 * Po flipe `DEV_FULL=true` (launch) je `state` rovno `allowed` a auth sa vôbec nerieši.
 *
 * Race-safe: kým sa session nevyrieši, renderuje `null` (žiadny blesk-redirect pre
 * prihláseného foundera).
 *
 * ── 2026-08-22 (beh 1 zadania mapy, §1.5) ───────────────────────────────────
 * Odmietnutie UŽ NIE JE `<Navigate to="/pack" />`. Tiché odhodenie späť na homepage bolo
 * pre platiaceho člena slepá ulička bez vysvetlenia (priznané v `QuickTiles.tsx`) a pre
 * neprihláseného skončilo na `/login` — teda na formulári, nie na pozvánke.
 * Odmietnutie sa preto delí na DVA stavy podľa toho, KTO stojí predo dvermi:
 *   · `soon` — prihlásený člen: mapa sa otvára o chvíľu, cesta späť do `/pack`
 *   · `join` — bez session: pozvánka BECOME DOGYPTIAN + „už som člen"
 * Verejný NÁHĽAD mapy (kurátorované výlety, stena na akciách) je až beh 5 zadania.
 */
type GateState = 'loading' | 'allowed' | 'soon' | 'join';

export function MapGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>(DEV_FULL ? 'allowed' : 'loading');

  useEffect(() => {
    if (DEV_FULL) return; // launch / dev-full: prístup pre všetkých, netreba auth
    let cancelled = false;
    const resolve = (email?: string | null) => {
      if (cancelled) return;
      if (email === FOUNDER_ACCOUNT_EMAIL) { setState('allowed'); return; }
      // `email` je nenulový len keď session existuje — prihlásený člen dostane „čoskoro",
      // ktokoľvek iný pozvánku.
      setState(email ? 'soon' : 'join');
    };
    supabase.auth.getSession().then(({ data }) => resolve(data.session?.user?.email));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => resolve(session?.user?.email),
    );
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (state === 'loading') return null;
  if (state !== 'allowed') return <MapLocked variant={state} />;
  return <>{children}</>;
}
