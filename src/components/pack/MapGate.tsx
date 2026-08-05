import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DEV_FULL } from '@/lib/packFlags';
import { FOUNDER_ACCOUNT_EMAIL } from '@/components/pack/packCommunity';

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
 * prihláseného foundera). Až po vyriešení buď pustí deti, alebo redirect na `/pack`.
 */
type GateState = 'loading' | 'allowed' | 'denied';

export function MapGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>(DEV_FULL ? 'allowed' : 'loading');

  useEffect(() => {
    if (DEV_FULL) return; // launch / dev-full: prístup pre všetkých, netreba auth
    let cancelled = false;
    const resolve = (email?: string | null) => {
      if (cancelled) return;
      setState(email === FOUNDER_ACCOUNT_EMAIL ? 'allowed' : 'denied');
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
  if (state === 'denied') return <Navigate to="/pack" replace />;
  return <>{children}</>;
}
