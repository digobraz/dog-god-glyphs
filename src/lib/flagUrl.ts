// Adresa vlajky — vlastný ľahký modul (perf 7. 10. 2026). LanguagePicker je v hlavnom balíku
// a kvôli tejto jednej funkcii doňho cez countryGeo.ts ťahal hranicu SR (svkBorder, 25 kB).
export function flagUrl(iso2: string, width: 40 | 80 | 160 = 40): string {
  return `https://flagcdn.com/w${width}/${iso2}.png`;
}
