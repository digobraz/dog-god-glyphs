// ════════════════════════════════════════════════════════════════════════════
// ODHAD KRAJINY BEZ SIEŤOVÉHO VOLANIA
// ────────────────────────────────────────────────────────────────────────────
// Matej 28. 8. 2026: *„už od začiatku tam musí byť podľa IP alebo stránky webu"*.
//
// ⚠️ NIE JE TO IP. Skutočná geolokácia z IP potrebuje cudziu službu (ďalší
//    request, súhlas, výpadok, CSP) alebo hlavičku od hostingu — Lovable krajinu
//    v hlavičke nedáva a Supabase edge funkcia vidí IP, ale nie krajinu.
//    Prehliadač pritom vie to isté zadarmo a okamžite:
//      1. ČASOVÉ PÁSMO (`Europe/Bratislava`) — najsilnejší signál polohy, mení sa
//         s cestovaním, nie s jazykom systému;
//      2. REGIÓN JAZYKA (`sk-SK` → SK) — funguje aj v pásmach, ktoré tu nemáme;
//      3. JAZYK STRÁNKY (`sk` → SK) — posledná záchrana, teda „podľa stránky webu".
//    Keď raz pribudne IP služba, stačí ju predradiť pred tieto tri kroky.
//
// Vracia sa ANGLICKÝ NÁZOV zo `COUNTRIES`, lebo tá hodnota ide do store a ďalej
// do 15. segmentu kódu heroglyfu (`COUNTRY_TO_ISO3` v `lib/heroglyphCode.ts`).
// Čo v `COUNTRIES` nie je, sa nevráti — inak by výber ukazoval krajinu, ktorá
// v zozname neexistuje, a pri prvom otvorení by zmizla.
// ════════════════════════════════════════════════════════════════════════════

import { COUNTRIES } from '@/lib/flowCountries';
import { countryISO2, countryName } from '@/lib/countryGeo';

/** IANA pásmo → ISO2. Európa naplno, zvyšok sveta hlavné pásma. */
const TZ_TO_ISO2: Record<string, string> = {
  'Europe/Bratislava': 'SK', 'Europe/Prague': 'CZ', 'Europe/Vienna': 'AT',
  'Europe/Budapest': 'HU', 'Europe/Warsaw': 'PL', 'Europe/Berlin': 'DE',
  'Europe/Zurich': 'CH', 'Europe/Paris': 'FR', 'Europe/Brussels': 'BE',
  'Europe/Amsterdam': 'NL', 'Europe/Luxembourg': 'LU', 'Europe/London': 'GB',
  'Europe/Dublin': 'IE', 'Europe/Lisbon': 'PT', 'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT', 'Europe/Malta': 'MT', 'Europe/Ljubljana': 'SI',
  'Europe/Zagreb': 'HR', 'Europe/Sarajevo': 'BA', 'Europe/Belgrade': 'RS',
  'Europe/Podgorica': 'ME', 'Europe/Skopje': 'MK', 'Europe/Tirane': 'AL',
  'Europe/Athens': 'GR', 'Europe/Sofia': 'BG', 'Europe/Bucharest': 'RO',
  'Europe/Chisinau': 'MD', 'Europe/Kiev': 'UA', 'Europe/Kyiv': 'UA',
  'Europe/Minsk': 'BY', 'Europe/Vilnius': 'LT', 'Europe/Riga': 'LV',
  'Europe/Tallinn': 'EE', 'Europe/Helsinki': 'FI', 'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Atlantic/Reykjavik': 'IS',
  'Europe/Moscow': 'RU', 'Europe/Istanbul': 'TR', 'Europe/Nicosia': 'CY',
  'Asia/Nicosia': 'CY', 'Europe/Andorra': 'AD', 'Europe/Monaco': 'MC',
  'Europe/Vaduz': 'LI', 'Europe/San_Marino': 'SM', 'Europe/Vatican': 'VA',
  // Svet — pásma, ktoré reálne uvidíme
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/Edmonton': 'CA', 'America/Winnipeg': 'CA', 'America/Halifax': 'CA',
  'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR',
  'America/Argentina/Buenos_Aires': 'AR', 'America/Santiago': 'CL',
  'America/Bogota': 'CO', 'America/Lima': 'PE',
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW', 'Asia/Singapore': 'SG',
  'Asia/Bangkok': 'TH', 'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Karachi': 'PK',
  'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Jerusalem': 'IL',
  'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA', 'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE', 'Africa/Casablanca': 'MA', 'Africa/Tunis': 'TN',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU', 'Pacific/Auckland': 'NZ',
};

/** Jazyk stránky → krajina. Posledný krok, keď prehliadač nepovie nič bližšie. */
const LANG_TO_ISO2: Record<string, string> = {
  sk: 'SK', cs: 'CZ', pl: 'PL', hu: 'HU', de: 'DE', at: 'AT', fr: 'FR',
  es: 'ES', it: 'IT', pt: 'PT', nl: 'NL', ro: 'RO', uk: 'UA', ru: 'RU',
  hr: 'HR', sl: 'SI', sr: 'RS', bg: 'BG', el: 'GR', tr: 'TR', da: 'DK',
  sv: 'SE', no: 'NO', fi: 'FI', ja: 'JP', ko: 'KR', zh: 'CN', en: 'GB',
};

/** Bezpečné čítanie regiónu z BCP-47 značky — `Intl.Locale` nie je všade. */
function regionOf(tag: string): string | null {
  try {
    const r = new Intl.Locale(tag).region;
    if (r) return r.toUpperCase();
  } catch { /* stará značka alebo starý prehliadač */ }
  const m = /^[a-z]{2,3}[-_]([A-Za-z]{2})\b/.exec(tag);
  return m ? m[1].toUpperCase() : null;
}

/** ISO2 podľa prehliadača: pásmo → región jazyka → jazyk stránky. */
export function guessISO2(pageLang?: string): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TZ_TO_ISO2[tz]) return TZ_TO_ISO2[tz];
  } catch { /* prehliadač bez Intl.timeZone */ }

  const tags = typeof navigator !== 'undefined'
    ? [...(navigator.languages || []), navigator.language].filter(Boolean)
    : [];
  for (const tag of tags) {
    const r = regionOf(String(tag));
    if (r) return r;
  }

  if (pageLang && LANG_TO_ISO2[pageLang]) return LANG_TO_ISO2[pageLang];
  return null;
}

/** ISO2 → položka zo `COUNTRIES`. Postavené raz, nie pri každom volaní. */
let isoToOption: Map<string, string> | null = null;
function optionByISO2(iso: string): string | null {
  if (!isoToOption) {
    isoToOption = new Map();
    for (const name of COUNTRIES) {
      const k = countryISO2(name);
      if (k && !isoToOption.has(k)) isoToOption.set(k, name);
    }
  }
  return isoToOption.get(iso.toLowerCase()) ?? null;
}

/**
 * Odhadnutá krajina ako ANGLICKÝ NÁZOV zo `COUNTRIES` — teda presne tá hodnota,
 * ktorú výber aj store používajú. Neznáma alebo v zozname chýbajúca ⇒ `null`.
 *
 * ⚠️ `countryName()` sám nestačí: pre `cz` vracia „Czechia", kým `COUNTRIES` má
 * „Czech Republic" — hodnota mimo zoznamu by sa vo výbere ticho stratila. Preto
 * je druhý krok cez `countryISO2()`, ktorý pozná aliasy oboch názvov.
 */
export function guessCountryName(pageLang?: string): string | null {
  const iso = guessISO2(pageLang);
  if (!iso) return null;
  const direct = countryName(iso);
  if (direct && COUNTRIES.includes(direct)) return direct;
  return optionByISO2(iso);
}
