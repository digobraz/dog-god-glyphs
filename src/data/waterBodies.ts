// Top slovenské vodné plochy (jazerá / priehrady / vodné diela) — plocha v hektároch a poloha
// z OpenStreetMap (natural=water / water=reservoir, plocha počítaná z polygónu). © OSM ODbL.
// Zobrazené na mape ako modré kružky s bielou plochou (ha) + bielou vlnovkou (Matej 2026-07-23).
export type WaterBody = { name: string; lat: number; lng: number; ha: number };

export const WATER_BODIES: WaterBody[] = [
  { name: 'Zemplínska šírava', lat: 48.7958, lng: 22.0069, ha: 2887 },
  { name: 'Oravská priehrada', lat: 49.4124, lng: 19.5514, ha: 2868 },
  { name: 'Hrušovská zdrž', lat: 48.0230, lng: 17.2633, ha: 2043 },
  { name: 'Liptovská Mara', lat: 49.1074, lng: 19.5311, ha: 1998 },
  { name: 'Kráľová', lat: 48.2464, lng: 17.7838, ha: 1110 },
  { name: 'Veľká Domaša', lat: 49.0612, lng: 21.6736, ha: 1104 },
  { name: 'Ružín', lat: 48.8609, lng: 21.0520, ha: 611 },
  { name: 'Nosická priehrada', lat: 49.1392, lng: 18.4036, ha: 489 },
  { name: 'Sĺňava', lat: 48.5556, lng: 17.8232, ha: 309 },
  { name: 'Starina', lat: 49.0581, lng: 22.2561, ha: 281 },
  { name: 'Vodné dielo Žilina', lat: 49.2006, lng: 18.8133, ha: 214 },
  { name: 'Hričov', lat: 49.2473, lng: 18.6956, ha: 190 },
  { name: 'Nová Bystrica', lat: 49.3337, lng: 19.0534, ha: 181 },
  { name: 'Ružiná', lat: 48.4393, lng: 19.5561, ha: 138 },
];
