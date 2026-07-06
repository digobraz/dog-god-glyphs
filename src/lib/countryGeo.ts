/**
 * Country geo helpers — single source of truth for /pack GlobePulse + TopCountries.
 *
 * dogs.country is stored as a FREE-TEXT full name (CheckoutScreen autocomplete from
 * the COUNTRIES list, e.g. "Slovakia"/"Slovensko"). For the globe we need a centroid
 * [lat, lng]; for the leaderboard we need an ISO2 code (→ flag emoji). Both flow
 * through countryISO2() so a name only ever maps in one place.
 */

// Full name / ISO3 / ISO2 → ISO2. Lowercased keys. Extend as the pack grows global.
const NAME_TO_ISO2: Record<string, string> = {
  'slovakia': 'sk', 'slovensko': 'sk', 'svk': 'sk', 'sk': 'sk',
  'czechia': 'cz', 'czech republic': 'cz', 'česko': 'cz', 'cze': 'cz', 'cz': 'cz',
  'hungary': 'hu', 'maďarsko': 'hu', 'hun': 'hu', 'hu': 'hu',
  'austria': 'at', 'rakúsko': 'at', 'aut': 'at', 'at': 'at',
  'poland': 'pl', 'poľsko': 'pl', 'pol': 'pl', 'pl': 'pl',
  'germany': 'de', 'nemecko': 'de', 'deu': 'de', 'de': 'de',
  'france': 'fr', 'francúzsko': 'fr', 'fra': 'fr', 'fr': 'fr',
  'italy': 'it', 'taliansko': 'it', 'ita': 'it', 'it': 'it',
  'spain': 'es', 'španielsko': 'es', 'esp': 'es', 'es': 'es',
  'portugal': 'pt', 'portugalsko': 'pt', 'prt': 'pt', 'pt': 'pt',
  'belgium': 'be', 'belgicko': 'be', 'bel': 'be', 'be': 'be',
  'netherlands': 'nl', 'holandsko': 'nl', 'nld': 'nl', 'nl': 'nl',
  'switzerland': 'ch', 'švajčiarsko': 'ch', 'che': 'ch', 'ch': 'ch',
  'united states': 'us', 'united states of america': 'us', 'usa': 'us', 'us': 'us',
  'united kingdom': 'gb', 'uk': 'gb', 'gbr': 'gb', 'gb': 'gb', 'england': 'gb',
  'ireland': 'ie', 'írsko': 'ie', 'irl': 'ie', 'ie': 'ie',
  'sweden': 'se', 'švédsko': 'se', 'swe': 'se', 'se': 'se',
  'norway': 'no', 'nórsko': 'no', 'nor': 'no', 'no': 'no',
  'denmark': 'dk', 'dánsko': 'dk', 'dnk': 'dk', 'dk': 'dk',
  'finland': 'fi', 'fínsko': 'fi', 'fin': 'fi', 'fi': 'fi',
  'iceland': 'is', 'island': 'is', 'isl': 'is', 'is': 'is',
  'australia': 'au', 'austrália': 'au', 'aus': 'au', 'au': 'au',
  'new zealand': 'nz', 'nzl': 'nz', 'nz': 'nz',
  'canada': 'ca', 'kanada': 'ca', 'can': 'ca', 'ca': 'ca',
  'mexico': 'mx', 'mexiko': 'mx', 'mex': 'mx', 'mx': 'mx',
  'brazil': 'br', 'brazília': 'br', 'bra': 'br', 'br': 'br',
  'argentina': 'ar', 'arg': 'ar', 'ar': 'ar',
  'chile': 'cl', 'chl': 'cl', 'cl': 'cl',
  'ukraine': 'ua', 'ukrajina': 'ua', 'ukr': 'ua', 'ua': 'ua',
  'romania': 'ro', 'rumunsko': 'ro', 'rou': 'ro', 'ro': 'ro',
  'croatia': 'hr', 'chorvátsko': 'hr', 'hrv': 'hr', 'hr': 'hr',
  'slovenia': 'si', 'slovinsko': 'si', 'svn': 'si', 'si': 'si',
  'serbia': 'rs', 'srbsko': 'rs', 'srb': 'rs', 'rs': 'rs',
  'bulgaria': 'bg', 'bulharsko': 'bg', 'bgr': 'bg', 'bg': 'bg',
  'greece': 'gr', 'grécko': 'gr', 'grc': 'gr', 'gr': 'gr',
  'lithuania': 'lt', 'litva': 'lt', 'ltu': 'lt', 'lt': 'lt',
  'latvia': 'lv', 'lotyšsko': 'lv', 'lva': 'lv', 'lv': 'lv',
  'estonia': 'ee', 'estónsko': 'ee', 'est': 'ee', 'ee': 'ee',
  'turkey': 'tr', 'turecko': 'tr', 'tur': 'tr', 'tr': 'tr',
  'russia': 'ru', 'rusko': 'ru', 'rus': 'ru', 'ru': 'ru',
  'japan': 'jp', 'japonsko': 'jp', 'jpn': 'jp', 'jp': 'jp',
  'south korea': 'kr', 'kórea': 'kr', 'kor': 'kr', 'kr': 'kr',
  'china': 'cn', 'čína': 'cn', 'chn': 'cn', 'cn': 'cn',
  'india': 'in', 'ind': 'in', 'in': 'in',
  'singapore': 'sg', 'singapur': 'sg', 'sgp': 'sg', 'sg': 'sg',
  'united arab emirates': 'ae', 'uae': 'ae', 'are': 'ae', 'ae': 'ae',
  'south africa': 'za', 'zaf': 'za', 'za': 'za',

  // Additional countries — all 152 from CheckoutScreen COUNTRIES (2026-07-06)
  // ICU aliases resolved: Czech Republic→cz, Bosnia and Herzegovina→ba,
  // Myanmar→mm, Turkey→tr, Congo→cg, Benin→bj (ICU DY obsolete),
  // Burkina Faso→bf (ICU HV obsolete).
  'afghanistan': 'af', 'albania': 'al', 'algeria': 'dz', 'andorra': 'ad',
  'angola': 'ao', 'armenia': 'am', 'azerbaijan': 'az',
  'bahamas': 'bs', 'bahrain': 'bh', 'bangladesh': 'bd', 'barbados': 'bb',
  'belarus': 'by', 'belize': 'bz', 'benin': 'bj', 'bhutan': 'bt',
  'bolivia': 'bo', 'bosnia and herzegovina': 'ba', 'botswana': 'bw',
  'brunei': 'bn', 'burkina faso': 'bf', 'burundi': 'bi',
  'cambodia': 'kh', 'cameroon': 'cm', 'central african republic': 'cf',
  'chad': 'td', 'colombia': 'co', 'comoros': 'km', 'congo': 'cg',
  'costa rica': 'cr', 'cuba': 'cu', 'cyprus': 'cy',
  'djibouti': 'dj', 'dominican republic': 'do',
  'ecuador': 'ec', 'egypt': 'eg', 'el salvador': 'sv',
  'ethiopia': 'et', 'fiji': 'fj', 'gabon': 'ga', 'gambia': 'gm',
  'georgia': 'ge', 'ghana': 'gh', 'guatemala': 'gt', 'guinea': 'gn',
  'haiti': 'ht', 'honduras': 'hn',
  'indonesia': 'id', 'iran': 'ir', 'iraq': 'iq', 'israel': 'il',
  'jamaica': 'jm', 'jordan': 'jo',
  'kazakhstan': 'kz', 'kenya': 'ke', 'kuwait': 'kw', 'kyrgyzstan': 'kg',
  'laos': 'la', 'lebanon': 'lb', 'libya': 'ly', 'liechtenstein': 'li',
  'luxembourg': 'lu',
  'madagascar': 'mg', 'malaysia': 'my', 'maldives': 'mv', 'mali': 'ml',
  'malta': 'mt', 'moldova': 'md', 'monaco': 'mc', 'mongolia': 'mn',
  'montenegro': 'me', 'morocco': 'ma', 'mozambique': 'mz', 'myanmar': 'mm',
  'namibia': 'na', 'nepal': 'np', 'nicaragua': 'ni', 'niger': 'ne',
  'nigeria': 'ng', 'north macedonia': 'mk',
  'oman': 'om',
  'pakistan': 'pk', 'panama': 'pa', 'paraguay': 'py', 'peru': 'pe',
  'philippines': 'ph', 'qatar': 'qa',
  'rwanda': 'rw', 'saudi arabia': 'sa', 'senegal': 'sn', 'somalia': 'so',
  'sri lanka': 'lk', 'sudan': 'sd', 'syria': 'sy',
  'taiwan': 'tw', 'tanzania': 'tz', 'thailand': 'th', 'tunisia': 'tn',
  'uganda': 'ug', 'uruguay': 'uy', 'uzbekistan': 'uz',
  'venezuela': 've', 'vietnam': 'vn',
  'yemen': 'ye', 'zambia': 'zm', 'zimbabwe': 'zw',
};

// ISO2 → approximate geographic centroid [lat, lng] for cobe markers.
const ISO2_CENTROID: Record<string, [number, number]> = {
  sk: [48.7, 19.7], cz: [49.8, 15.5], hu: [47.2, 19.5], at: [47.6, 14.1],
  pl: [52.1, 19.4], de: [51.2, 10.4], fr: [46.6, 2.2], it: [41.9, 12.6],
  es: [40.2, -3.7], pt: [39.4, -8.2], be: [50.5, 4.5], nl: [52.1, 5.3],
  ch: [46.8, 8.2], us: [39.8, -98.6], gb: [54.0, -2.0], ie: [53.4, -8.2],
  se: [60.1, 18.6], no: [60.5, 8.5], dk: [56.0, 9.5], fi: [64.0, 26.0],
  is: [64.9, -19.0], au: [-25.3, 133.8], nz: [-40.9, 174.9], ca: [56.1, -106.3],
  mx: [23.6, -102.5], br: [-14.2, -51.9], ar: [-38.4, -63.6], cl: [-35.7, -71.5],
  ua: [48.4, 31.2], ro: [45.9, 24.9], hr: [45.1, 15.2], si: [46.1, 14.8],
  rs: [44.0, 21.0], bg: [42.7, 25.5], gr: [39.1, 21.8], lt: [55.2, 23.9],
  lv: [56.9, 24.6], ee: [58.6, 25.0], tr: [38.9, 35.2], ru: [61.5, 105.3],
  jp: [36.2, 138.2], kr: [35.9, 127.8], cn: [35.9, 104.2], in: [20.6, 79.0],
  sg: [1.35, 103.8], ae: [23.4, 53.8], za: [-30.6, 22.9],
};

/** Free-text country (name / ISO2 / ISO3) → ISO2 lowercase, or null if unknown. */
export function countryISO2(country?: string | null): string | null {
  if (!country) return null;
  const key = country.trim().toLowerCase();
  if (NAME_TO_ISO2[key]) return NAME_TO_ISO2[key];
  // Last resort: a bare 2-letter token we don't have mapped but is plausibly ISO2.
  if (/^[a-z]{2}$/.test(key)) return key;
  return null;
}

/** Free-text country → [lat, lng] centroid for a globe marker, or null if unknown. */
export function countryCentroid(country?: string | null): [number, number] | null {
  const iso = countryISO2(country);
  return iso ? ISO2_CENTROID[iso] ?? null : null;
}

/** Free-text country → flag emoji, or '' if it can't be resolved to ISO2. */
export function countryFlag(country?: string | null): string {
  const iso = countryISO2(country);
  if (!iso || iso.length !== 2) return '';
  return String.fromCodePoint(...[...iso.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}
