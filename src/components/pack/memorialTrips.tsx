// VÝLETY S PSOM, KTORÝ ODIŠIEL — zatiaľ LEN ZÁUJEM, nie funkcia (t-bezpsa, Matej 21. 9. 2026).
//
// Výlet sa zapisuje človeku AJ živému psovi. Na LIVE má 6 z 56 účtov len zosnulých psov
// (Eternal Dog sa kupuje aj na pamiatku). Spätný zápis „výlety, ktoré sme prešli, kým žil"
// je navrhnutý (pamäť project_dogypt_vylet_bez_psa_zosnuly_2026-09-21), ale Matej ho
// nechal na neskôr: *„a nemusime robiť niečo čo mmožno nikto nebude chcieť"*.
// Namiesto neho bublina s tlačidlom MÁM ZÁUJEM → hlas `memorial_trips` vo `feature_votes`.
// Nový blok to NIE JE — je to ten istý toast, aký mapa používa všade.
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';
import { useT } from '@/i18n/LanguageContext';

export const MEMORIAL_TRIPS_KEY = 'memorial_trips';

/** Má účet psov, ale ŽIADNEHO živého? (prázdny zoznam = iný prípad, nie tento) */
export const hasOnlyDeceasedDogs = (dogs: ReadonlyArray<{ life_status?: string | null }>): boolean =>
  dogs.length > 0 && dogs.every((d) => d.life_status === 'deceased');

/**
 * Zapíše záujem. `toggle-feature-vote` je PREPÍNAČ — keby už hlas existoval, prvé volanie
 * by ho zrušilo; vtedy sa zavolá druhýkrát. Tlačidlo teda vždy len ZAPÍNA.
 */
export async function voteMemorialTrips(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return false;
  const call = async (): Promise<{ voted?: boolean } | null> => {
    const res = await fetch(`${EDGE_BASE}/toggle-feature-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ feature_key: MEMORIAL_TRIPS_KEY }),
    });
    return res.ok ? res.json() : null;
  };
  const first = await call();
  if (!first) return false;
  if (first.voted) return true;
  const second = await call();
  return !!second?.voted;
}

/** Bublina s tlačidlom MÁM ZÁUJEM — tá istá na mape, v článku výletu aj v sprievodcovi. */
export function useMemorialTripsToast(): () => void {
  const { toast } = useToast();
  const t = useT();
  return () => {
    // Text cez CELÚ šírku, tlačidlo POD ním (Matej 21. 9.: „texting by som dal cez celú
    // šírku bloku a CTA pod to"). Preto tlačidlo nejde do `action` — shadcn ho kladie
    // vedľa textu a dlhá veta sa zúžila na polovicu.
    toast({
      description: (
        <div>
          <p>{t('pack.trip.memorial.body')}</p>
          <ToastAction
            className="mt-3"
            altText={t('pack.trip.memorial.cta')}
            onClick={() => {
              void voteMemorialTrips().then((ok) => {
                toast({ description: ok ? t('pack.trip.memorial.thanks') : t('pack.trip.memorial.failed') });
              });
            }}
          >
            {t('pack.trip.memorial.cta')}
          </ToastAction>
        </div>
      ),
    });
  };
}
