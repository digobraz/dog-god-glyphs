/** CLAIM 2 · kolo textov 22. 11. 2026 (Matej, posledné pred mockupmi a flipom). Prebíja `CLAIM` aj COPY pri rovnakom kľúči,
 *  len za `?claim`. Chýbajúci jazyk → EN. `*slovo*` = tučne (podnadpis hero).
 *  Hero: nadnadpis „Život so psom v jednej appke“, z podnadpisu preč „jednej“, ZADARMO tučne · odznaky pri telefónoch
 *  skrátené na „Odznak: Pútnik“, zvyšok v rozklike · Funkcie: AI mentor, SOS riadky na jeden riadok · VID prístup ·
 *  levely nový texting · podpora bez konta zanikla → jedna veta vo FAQ „Kto to financuje?“. */
type Row = Record<string, string>;
export const CLAIM22: Record<string, Row> = {
  e_life2: { sk: 'Život so psom v jednej appke', en: 'Life with a dog, in one app' },
  sub: {
    sk: 'Výlety, veterinár, AI mentor, zoznamka, prvá pomoc, edukácia aj denník. Všetko, čo psíčkar potrebuje, v appke, ktorá ho baví. *ZADARMO.*',
    en: 'Trips, vets, an AI mentor, dog-friend dating, first aid, education and a diary. Everything a dog person needs, in an app they enjoy. *FREE.*',
  },
  /* odznaky pri telefónoch: na pilulke len názov, level a popis až v rozklike */
  fb1: { sk: 'Odznak: Pútnik', en: 'Badge: Pilgrim' },
  fb2: { sk: 'Odznak: Služobník', en: 'Badge: Servant' },
  fb3: { sk: 'Odznak: Učeň', en: 'Badge: Disciple' },
  /* FUNKCIE */
  h_feat_a: { sk: 'Mapa, denník, AI mentor aj SOS.', en: 'Map, diary, AI mentor and SOS.' },
  /* SOS: každý riadok na jeden riadok; týranie už nie je „čoskoro“, len zbierky a útulky */
  sos_vet: { sk: 'Pohotovosť v okolí', en: 'Emergency vets nearby' },
  sos_lost2: { sk: 'Stratený pes: pátranie', en: 'Lost dog: search' },
  sos_danger2: { sk: 'Nebezpečenstvo', en: 'Danger alerts' },
  sos_fund2: { sk: 'Zbierky, útulky', en: 'Fundraisers, shelters' },
  /* INSTAGRAM: VID = Very Important Dog, bodkovane podčiarknuté, vysvetlenie po ťuknutí */
  soul_a: { sk: 'Psociálna sieť, kde je každý pes naozajstný unikát s', en: 'A dog social network where every dog is a true original, with' },
  soul_b: { sk: 'prístupom.', en: 'access.' },
  vid_t: { sk: 'Very Important Dog', en: 'Very Important Dog' },
  /* LEVELY */
  l_play: { sk: 'Starostlivosť o tvojho psa bude konečne ocenená levelmi a odznakmi!', en: 'Caring for your dog finally gets rewarded with levels and badges!' },
  lt_ax1: { sk: 'Koľko rokov zbieraš kôpky po svojom psovi, taký level Služobníka máš!', en: 'However many years you’ve been picking up after your dog, that’s your Servant level!' },
  lt_ax2: { sk: 'Čím viac výletov, tým vyšší level a chuť objavovať celý svet spoločne.', en: 'The more trips, the higher your level, and the more you want to explore the whole world together.' },
  lt_ax3: { sk: 'Mať psa je zodpovednosť. Získaj znalosti, ktoré tvojmu psovi predĺžia život!', en: 'Having a dog is a responsibility. Gain the knowledge that will give your dog a longer life!' },
  h_cit1: { sk: 'Štvrtý level za vzťah ku', en: 'A fourth level for your bond with' },
  h_cit2: { sk: 'všetkým', en: 'all' },
  h_cit3: { sk: 'psom', en: 'dogs' },
  l_cit1: {
    sk: 'Ako jednotlivci doprajeme svojim psom naozaj krásny život. Ak sa spojíme, dokážeme pomôcť ďalším miliónom psov v núdzi. A to je zámer tohto dobročinného hnutia.',
    en: 'On our own, we give our dogs a truly beautiful life. Together, we can help millions more dogs in need. That is the purpose of this charitable movement.',
  },
  l_cit2: {
    sk: 'Miesto nadizajnované pre psíčkarov s vyšším cieľom, ktoré založil pes z útulku.',
    en: 'A place designed for dog people with a higher purpose, founded by a shelter dog.',
  },
  fee_p: {
    sk: 'DOGYPT je ZDARMA, no žije iba z dobrovoľného členského. Tvoja hodnosť nám pomáha existovať a rásť. Každé euro ide na prevádzku, do vývoja a psom v núdzi.',
    en: 'DOGYPT is FREE, but it lives only on voluntary membership. Your rank helps us exist and grow. Every euro goes to running costs, development and dogs in need.',
  },
  /* FAQ „Kto to financuje?“ — na koniec ide veta s odkazmi (napíš nám · podpor bez registrácie TU) */
  fa_fund: {
    sk: 'Zatiaľ najmä majiteľ Hekthora, psa zakladateľa, a prví ľudia, ktorí podporili myšlienku. Za projektom nestojí žiadna korporácia, žiadni investori ani drahé reklamy... Ak vidíš potenciál a chceš do nás investovať čas či peniaze, určite sa dohodneme.',
    en: 'So far mainly Hekthor’s owner, the founder dog, and the first people who backed the idea. There is no corporation behind the project, no investors, no expensive ads... If you see potential and want to invest time or money in us, we will certainly work something out.',
  },
  fund_mail: { sk: 'Napíš nám', en: 'Write to us' },
  fund_or: { sk: 'alebo nás podpor bez registrácie', en: 'or support us without signing up' },
  fund_here: { sk: 'TU', en: 'HERE' },
};
