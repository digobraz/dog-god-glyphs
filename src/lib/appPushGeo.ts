// ── POLOHA PRE PUSH „STRATENÝ PES V OKOLÍ" (SOS, 4. 11. 2026) ───────────────────────────────
// Server (`notify-sos` → `sos_push_targets`) posiela push len zariadeniam s hrubou polohou do 30 km od straty.
// Appka ju hlási TAKTO a nijako inak:
//   · len IS_APP + SOS_ON, len keď už existuje push token (uložil ho `appPush.ts`),
//   · len keď je povolenie polohy UŽ UDELENÉ (Permissions API === 'granted'). Nikdy sa ho tu nepýtame — pýta sa
//     JEDINÝ mechanizmus `app_perm` v `AppEntry.tsx`. Odmietnuté / nevyriešené / API chýba ⇒ ticho nič.
//   · najviac raz za 24 h, len pri otvorení appky v popredí (nie na pozadí), `maximumAge` 1 h (žiadne nové zisťovanie),
//   · NIKDY pri vypnutom „stratený pes v okolí“ (`notif_sos` v `human.notif_off`); pri vypnutí sa poloha na serveri aj zmaže
//     (`clearPushGeo`, volá ho nastavenie), pri zmene používateľa na zariadení ju zmaže `register_push_token`,
//   · server zaokrúhľuje (RPC `push_token_geo`), my nič neukladáme okrem času posledného odoslania.
import { IS_APP } from '@/lib/isApp';
import { SOS_ON } from '@/lib/env';
import { sosPushGeo, sosPushGeoClear } from '@/lib/sos';
import { notifOff, readHuman } from '@/lib/humanPrefs';

const AT_KEY = 'dogypt_push_geo_at';
const TOKEN_KEY = 'dogypt_push_token';
const EVERY_MS = 24 * 3_600_000;

export async function sendPushGeoOnce(): Promise<void> {
  if (!IS_APP || !SOS_ON) return;
  if (document.visibilityState !== 'visible') return;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    if (Date.now() - Number(localStorage.getItem(AT_KEY) || 0) < EVERY_MS) return;
    if (!('geolocation' in navigator) || !navigator.permissions?.query) return;
    const { human } = await readHuman();
    if (notifOff(human).includes('notif_sos')) return;
    const st = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    if (st.state !== 'granted') return;
    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000, maximumAge: 3_600_000, enableHighAccuracy: false }));
    await sosPushGeo(token, pos.coords.latitude, pos.coords.longitude);
    localStorage.setItem(AT_KEY, String(Date.now()));
  } catch { /* poloha je prídavok; ďalší štart skúsi znova */ }
}

/** Vypnutie „stratený pes v okolí“: zmaže hrubú polohu tohto zariadenia na serveri a spomienku na posledné odoslanie. */
export async function clearPushGeo(): Promise<void> {
  try {
    localStorage.removeItem(AT_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) await sosPushGeoClear(token);
  } catch { /* push už aj tak nepríde (opt-out); ďalšie prihlásenie zariadenia polohu zmaže */ }
}
