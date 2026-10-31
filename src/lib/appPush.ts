// ── PUSH V APPKE — KOSTRA (20. 10. 2026, plán appky Fáza 5) ─────────────────────
// Po prihlásení, ak člen pri prvom otvorení povolil upozornenia (`user_metadata.app_perm.push`),
// appka si vypýta token od OS a uloží ho cez RPC `register_push_token` do `push_tokens`.
// Posiela JEDINÁ edge funkcia `send-push`; kľúče (Firebase / APNs) zatiaľ nie sú, takže
// token sa zbiera, ale nič nechodí.
//
// 🔴 JEDEN VYPÍNAČ: „zapnúť/vypnúť upozornenia" v JA (`pack_profiles.human.notifications_enabled`)
//    platí pre maily aj push. Appka ho tu NEČÍTA — `send-push` ho kontroluje na serveri rovnako
//    ako `notify-messages`. Druhý príznak v appke nevzniká.
// Na webe nič (IS_APP); plugin sa sťahuje dynamicky.
import { supabase } from '@/integrations/supabase/client';
import { IS_APP, APP_PLATFORM } from '@/lib/isApp';
import { APP_DEV } from '@/lib/env';

// `push_tokens` a `register_push_token` ešte nie sú v generovaných typoch (types.ts sa nepíše ručne).
const db = supabase as unknown as {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>;
  from: (t: string) => { delete: () => { eq: (c: string, v: string) => Promise<unknown> } };
};

const TOKEN_KEY = 'dogypt_push_token';
let started = false;

// iPhone ostrá appka = com.dogypt.ios (com.dogypt.app zabral 20. 10. osobný Apple tím); APNs topic = bundle ID.
const appId = () => (APP_DEV ? 'com.dogypt.app.dev' : APP_PLATFORM === 'ios' ? 'com.dogypt.ios' : 'com.dogypt.app');

/** Android bez `google-services.json` (Firebase) pri `register()` natívne spadne. Firebase má
 *  appka od versionName 1.2 (31. 10. 2026, projekt `dogypt-c6da5`); staršia ho nemá, a keďže web
 *  sa do nej dostane aktualizáciou, rozhoduje natívna verzia, nie príznak v kóde.
 *  iOS ide cez APNs a Firebase nepotrebuje. */
const ANDROID_FIREBASE_FROM = '1.2';
async function pushReady(): Promise<boolean> {
  if (APP_PLATFORM !== 'android') return true;
  const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
  const have = (await CapacitorUpdater.current()).native.split('.').map(Number);
  const need = ANDROID_FIREBASE_FROM.split('.').map(Number);
  for (let i = 0; i < Math.max(have.length, need.length); i++) {
    const x = have[i] || 0, y = need[i] || 0;
    if (x !== y) return x > y;
  }
  return true;
}

async function register() {
  if (!(await pushReady())) return;
  const { PushNotifications } = await import('@capacitor/push-notifications');
  await PushNotifications.removeAllListeners();
  await PushNotifications.addListener('registration', async ({ value }) => {
    try {
      const { error } = await db.rpc('register_push_token', {
        p_token: value, p_platform: APP_PLATFORM, p_app_id: appId(),
      });
      if (!error) localStorage.setItem(TOKEN_KEY, value);
    } catch { /* ďalší štart skúsi znova */ }
  });
  await PushNotifications.addListener('registrationError', () => { /* bez kľúčov (FCM/APNs) je to očakávané */ });
  // ŤUK NA NOTIFIKÁCIU (30. 10. 2026) — server posiela `data.url` (napr. `/pack/profile?dnes=1`),
  // dovtedy ťuk len otvoril appku tam, kde bola. BrowserRouter počúva `popstate`, preto pushState + event.
  await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
    const url = (notification?.data as { url?: unknown } | undefined)?.url;
    if (typeof url !== 'string' || !url.startsWith('/')) return;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  const perm = await PushNotifications.checkPermissions();
  const granted = perm.receive === 'granted' || (await PushNotifications.requestPermissions()).receive === 'granted';
  if (granted) await PushNotifications.register();
}

/** Na štarte: po prihlásení zaregistruje zariadenie, ak člen povolil upozornenia. */
export function startAppPush() {
  if (!IS_APP || started) return;
  started = true;
  supabase.auth.onAuthStateChange((event, session) => {
    if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN') return;
    const perm = (session?.user?.user_metadata as { app_perm?: { push?: boolean } } | undefined)?.app_perm;
    if (perm?.push === true) { void register().catch(() => {}); return; }
    // Povolené v telefóne (aj mimo prvého otvorenia) = súhlas; bez neho sa nepýtame (30. 10. 2026:
    // token mal 1 človek, hoci iOS povolenie dalo viac ľudí).
    void (async () => {
      if (!(await pushReady())) return;
      const { PushNotifications } = await import('@capacitor/push-notifications');
      if ((await PushNotifications.checkPermissions()).receive === 'granted') await register();
    })().catch(() => {});
  });
}

/** Pred odhlásením: zariadenie prestane dostávať upozornenia tohto človeka. */
export async function forgetPushToken() {
  if (!IS_APP) return;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    await db.from('push_tokens').delete().eq('token', token);
    localStorage.removeItem(TOKEN_KEY);
  } catch { /* token zmaže send-push, keď ho APNs/FCM odmietne */ }
}
