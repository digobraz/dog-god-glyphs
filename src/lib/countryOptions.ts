// VŠETKY krajiny sveta pre výber národnosti (Matej 2026-08-13: „vlajky tu nie su
// všetky! potrebujeme všetky vlajky sveta").
//
// Predtým to bol ručný zoznam 19 krajín + „Other" v `packProfile.ts`. Ten sa nedal
// rozšíriť bez toho, aby niekto ručne dopísal 230 riadkov a k nim 18 jazykových mutácií.
//
// PREČO SA TU NIČ NEPREKLADÁ:
//  - vlajka sa POČÍTA z ISO2 (`flagEmojiFromISO2` — dve písmená → dva regional indicator
//    znaky), takže nový štát nepotrebuje asset ani import;
//  - názov dodá `Intl.DisplayNames(locale, {type:'region'})`, čo je v prehliadači zadarmo
//    a vo VŠETKÝCH našich 18 jazykoch naraz. Ručný zoznam by znamenal 249 × 18 = 4482
//    prekladových kľúčov, ktoré by nikto neudržal.
//
// ⚠️ HISTORICKÉ HODNOTY: profily uložené pred 13. 8. 2026 nesú `UK` (nie ISO2 — správne je
// `GB`) a `OTHER`. Oboje sa musí ďalej ZOBRAZIŤ, inak by človek otvoril profil a videl
// prázdny výber. Rieši to `normalizeCountryValue()`; nové zápisy idú vždy v ISO2.

import { flagEmojiFromISO2 } from '@/lib/countryGeo';
import { intlLocale } from '@/i18n/bcp47';

/** ISO 3166-1 alpha-2, oficiálne priradené kódy. */
const ISO2_ALL = [
  'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
  'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ',
  'CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ',
  'DE','DJ','DK','DM','DO','DZ',
  'EC','EE','EG','EH','ER','ES','ET',
  'FI','FJ','FK','FM','FO','FR',
  'GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY',
  'HK','HM','HN','HR','HT','HU',
  'ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT',
  'JE','JM','JO','JP',
  'KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ',
  'LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY',
  'MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ',
  'NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ',
  'OM',
  'PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY',
  'QA',
  'RE','RO','RS','RU','RW',
  'SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ',
  'TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ',
  'UA','UG','UM','US','UY','UZ',
  'VA','VC','VE','VG','VI','VN','VU',
  'WF','WS',
  'YE','YT',
  'ZA','ZM','ZW',
] as const;

/** Krajiny, ktoré vidí Slovák ako prvé — pôvodný ručný zoznam, doplnený o `SK` na čele. */
export const FREQUENT_ISO2 = [
  'SK','CZ','PL','HU','AT','DE','GB','IE','US','FR','IT','ES','NL','CH','UA','RO','HR','SI','PT',
] as const;

/** Hodnota, ktorou sa označí „radšej to nepoviem". Nie je to ISO2, preto stojí zvlášť. */
export const COUNTRY_OTHER = 'OTHER';

/**
 * Uložená hodnota → ISO2 na zobrazenie.
 * `UK` je legacy zápis Spojeného kráľovstva (ISO2 je `GB`); `OTHER` nie je krajina.
 */
export function normalizeCountryValue(v?: string | null): string | null {
  if (!v) return null;
  const up = v.trim().toUpperCase();
  if (up === COUNTRY_OTHER) return null;
  if (up === 'UK') return 'GB';
  return up.length === 2 ? up : null;
}

const nameCache = new Map<string, Intl.DisplayNames | null>();

function displayNames(lang: string): Intl.DisplayNames | null {
  const locale = intlLocale(lang);
  if (!nameCache.has(locale)) {
    try {
      nameCache.set(locale, new Intl.DisplayNames([locale], { type: 'region' }));
    } catch {
      // Starý engine bez DisplayNames — padáme na holý kód, nie na výnimku.
      nameCache.set(locale, null);
    }
  }
  return nameCache.get(locale) ?? null;
}

/** Lokalizovaný názov krajiny pre uloženú hodnotu (zvláda aj `UK` a `OTHER`). */
export function countryLabel(value: string | null | undefined, lang: string, otherLabel = 'Other'): string {
  if (!value) return '';
  if (value.trim().toUpperCase() === COUNTRY_OTHER) return otherLabel;
  const iso = normalizeCountryValue(value);
  if (!iso) return '';
  return displayNames(lang)?.of(iso) ?? iso;
}

/** Vlajka pre uloženú hodnotu. `OTHER` dostane neutrálnu bielu zástavu. */
export function countryFlagFor(value: string | null | undefined): string {
  if (!value) return '';
  if (value.trim().toUpperCase() === COUNTRY_OTHER) return '\u{1F3F3}️';
  const iso = normalizeCountryValue(value);
  return iso ? flagEmojiFromISO2(iso) : '';
}

export type CountryOption = { value: string; flag: string; label: string };

const listCache = new Map<string, { frequent: CountryOption[]; rest: CountryOption[] }>();

/**
 * Zoznam do `<select>`: najprv známe krajiny v poradí, aké dáva zmysel pre SK trh,
 * potom ZVYŠOK SVETA zoradený podľa lokalizovaného názvu (nie podľa kódu — v SK by
 * inak „Nemecko" stálo pod D).
 */
export function countryOptions(lang: string): { frequent: CountryOption[]; rest: CountryOption[] } {
  const locale = intlLocale(lang);
  const hit = listCache.get(locale);
  if (hit) return hit;

  const opt = (iso: string): CountryOption => ({
    value: iso,
    flag: flagEmojiFromISO2(iso),
    label: displayNames(lang)?.of(iso) ?? iso,
  });

  const freq = new Set<string>(FREQUENT_ISO2);
  const frequent = FREQUENT_ISO2.map(opt);
  const collator = new Intl.Collator(locale);
  const rest = ISO2_ALL.filter((c) => !freq.has(c))
    .map(opt)
    .sort((a, b) => collator.compare(a.label, b.label));

  const out = { frequent, rest };
  listCache.set(locale, out);
  return out;
}
