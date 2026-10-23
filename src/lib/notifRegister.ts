// ============================================================================
// REGISTER NOTIFIKÁCIÍ — jediný zoznam všetkého, čo DOGYPT posiela človeku (23. 10. 2026).
//
// Matej 23. 10.: *„vytvoríme si sekciu notifikácií, kde budeme môcť mať prehľad, aké sú
// a kedy a či ich majú ľudia vypnuté"*. Z tohto súboru kreslí:
//   · JA → Nastavenia → Upozornenia (človek vypne jednotlivý druh),
//   · dashboard GROWTH → Notifikácie (`scripts/gen-notifikacie-data.mjs`, počty z LIVE DB).
//
// Vypnutie: hlavný vypínač `pack_profiles.human.notifications_enabled` (platí pre všetko)
// + `human.notif_off: string[]` = vypnuté druhy (id nižšie). Nové miesto na údaje o človeku
// nevzniká. ⚠️ `notif_off` dnes rešpektuje LEN `devotion_evening` (pending_devotion_reminders);
// ostatné druhy sa riadia hlavným vypínačom — pole `optOut` hovorí, čo platí naozaj.
//
// Nový druh notifikácie = nový riadok TU, inak ho prehľad nevidí.
// ============================================================================

export type NotifChannel = 'push' | 'mail' | 'telegram';
/** Čím sa dá vypnúť: 'own' = vlastný prepínač (notif_off) · 'master' = len hlavný vypínač · 'none' = nevypína sa (služobné). */
export type NotifOptOut = 'own' | 'master' | 'none';

export interface NotifKind {
  id: string;
  /** SK názov pre človeka (EN cez i18n `pack.notif.kind.<id>`). */
  sk: string;
  en: string;
  channels: NotifChannel[];
  /** Kedy chodí — ľudskou rečou, SK. */
  when: string;
  /** Kto ju posiela (edge funkcia / job). */
  source: string;
  optOut: NotifOptOut;
  /** Beží už naozaj? false = kostra (napr. push bez kľúčov). */
  live: boolean;
  /** Smie si ju človek vypnúť v JA? */
  userToggle: boolean;
}

export const NOTIF_KINDS: NotifKind[] = [
  { id: 'devotion_evening', sk: 'AINUBIS: „Ako bolo dnes s psom?“', en: 'AINUBIS: evening devotion question', channels: ['push'],
    when: 'denne v čase, ktorý si člen nastaví (predvolené 20:00); nie keď už dnes zapísal · hovorí AINUBIS', source: 'devotion-reminder (cron á 15 min)',
    optOut: 'own', live: false, userToggle: true },
  { id: 'messages', sk: 'Nová správa', en: 'New message', channels: ['mail'],
    when: 'do 5 min po neprečítanej správe', source: 'notify-messages (cron á 5 min)', optOut: 'master', live: true, userToggle: false },
  { id: 'sniffer', sk: 'Zhoda v SNIFFERi', en: 'SNIFFER match', channels: ['mail'],
    when: 'do 5 min po novej zhode', source: 'notify-sniffer (cron á 5 min)', optOut: 'master', live: true, userToggle: false },
  { id: 'events', sk: 'Podujatia', en: 'Events', channels: ['mail'],
    when: 'niekto sa pridal · zrušené/zmenené · deň vopred', source: 'notify-events (cron á 15 min)', optOut: 'master', live: true, userToggle: false },
  { id: 'ainubis_reply', sk: 'Matej ti odpísal', en: 'Matej replied', channels: ['mail'],
    when: 'do 5 min po odpovedi v AINUBISovi', source: 'notify-ainubis-reply (cron á 5 min)', optOut: 'master', live: true, userToggle: false },
  { id: 'emailing', sk: 'Uvítacia séria mailov', en: 'Welcome mail series', channels: ['mail'],
    when: 'r1/r2/m1–m4/h1 podľa dní od vstupu', source: 'mail-engine', optOut: 'master', live: true, userToggle: false },
  { id: 'guest', sk: 'Maily hosťovi (€0)', en: 'Guest mails', channels: ['mail'],
    when: 'po zápise psa na stenu, denne 10:00', source: 'send-guest-mail', optOut: 'none', live: true, userToggle: false },
  { id: 'auth', sk: 'Prihlásenie a účet', en: 'Sign-in and account', channels: ['mail'],
    when: 'pri prihlásení, zmene mailu, zmazaní účtu', source: 'auth-send-email', optOut: 'none', live: true, userToggle: false },
];
