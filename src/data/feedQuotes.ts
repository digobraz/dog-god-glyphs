// CITÁT DŇA VO FEEDE (DOMOV, TEST_BUILD) — 30 citátov na prvých 30 dní (Matej 24. 10. 2026:
// *„len nejaké 3 pozadia… motivačné citáty… kľudne na 30 dní najprv, text bude editovať jazykmi"*).
//
// 🔴 TEXT SA EDITUJE TU, PO JAZYKOCH. Kľúč `text.<jazyk>`; jazyk bez kľúča padá na `en`
//    (appka ukazuje EN pre všetkých, čo nemajú vlastný preklad — rovnako ako zvyšok /pack).
//    Pribudne jazyk = pribudne riadok `cs: '…'` do toho citátu, nič iné sa nemení.
// ⚠️ Zdroj je `dailyQuotes.ts` + `dailyQuotes.sk.ts` (kánon = EN originál, SK = preklad, ktorý
//    členovia vedia nahlásiť). Vybraných je 30 krátkych, motivačných, bez viet, ktorých vtip stojí
//    na anglickom slovnom spojení. Dva nemajú známeho autora (`author: ''`) — riadok autora sa vtedy
//    nekreslí, „Unknown" na obrázku nikdy. Ďalších 30 dní sa
//    dopĺňa za koniec poľa (`id` rastie), poradie sa NEPREHADZUJE — rotácia ide podľa dňa.
// ⚠️ FOTKA JE BEZ TEXTU, text kreslí appka (Cinzel) — jedna fotka nesie všetky jazyky.
//    Pozadia sú `public/feed/k2-f*.webp`; len tri, striedajú sa po dni.

export interface FeedQuote {
  id: number;
  author: string;
  /** `en` povinný, ostatné jazyky voliteľné (kľúč = kód jazyka appky). */
  text: { en: string } & Record<string, string>;
}

/** Tri pozadia citátu dňa (fotky psov bez textu). */
export const FEED_QUOTE_BG: readonly string[] = [
  '/feed/k2-f1.webp',
  '/feed/k2-f2.webp',
  '/feed/k2-f5.webp',
];

export const FEED_QUOTES: readonly FeedQuote[] = [
  { id: 1, author: "Charles de Gaulle",
    text: {
      en: "The better I get to know men, the more I find myself loving dogs.",
      sk: "Čím lepšie spoznávam ľudí, tým viac milujem psov.",
    } },
  { id: 2, author: "Dean Koontz",
    text: {
      en: "Once you have had a wonderful dog, a life without one is a life diminished.",
      sk: "Keď raz budete mať skvelého psa, život bez neho bude životom ochudobneným.",
    } },
  { id: 3, author: "Anatole France",
    text: {
      en: "Until one has loved an animal, a part of one's soul remains unawakened.",
      sk: "Kým človek nemiloval zviera, časť jeho duše zostáva neprebudená.",
    } },
  { id: 4, author: "Konrad Lorenz",
    text: {
      en: "The bond with a true dog is as lasting as the ties of this earth will ever be.",
      sk: "Puto s pravým psom je trvalé tak, ako sú trvalé pominuteľné putá tohto sveta.",
    } },
  { id: 5, author: "Roger Caras",
    text: {
      en: "Dogs are not our whole life, but they make our lives whole.",
      sk: "Psy nie sú celý náš život, ale robia náš život celým.",
    } },
  { id: 6, author: "Andy Rooney",
    text: {
      en: "The average dog is a nicer person than the average person.",
      sk: "Priemerný pes je milší človek ako priemerný človek.",
    } },
  { id: 7, author: "Charles Yu",
    text: {
      en: "If I could be half the person my dog is, I'd be twice the human I am.",
      sk: "Keby som bol čo len napoly taký človek ako môj pes, bol by som dvakrát väčší človek, ako som.",
    } },
  { id: 8, author: "J.R. Ackerley",
    text: {
      en: "A dog has one aim in life — to bestow his heart.",
      sk: "Pes má v živote jeden cieľ — darovať svoje srdce.",
    } },
  { id: 9, author: "Arthur Schopenhauer",
    text: {
      en: "Anyone who has never owned a dog cannot know what loving and being loved mean.",
      sk: "Kto nikdy nemal psa, nemôže vedieť, čo znamená milovať a byť milovaný.",
    } },
  { id: 10, author: "Cesar Millan",
    text: {
      en: "I believe in integrity. Dogs have it. Humans are sometimes lacking it.",
      sk: "Verím v integritu. Psy ju majú. Ľuďom niekedy chýba.",
    } },
  { id: 11, author: "John Steinbeck",
    text: {
      en: "A dog is a bond between strangers.",
      sk: "Pes je most medzi cudzincami.",
    } },
  { id: 12, author: "Judy Desmond",
    text: {
      en: "A dog is the only thing that can mend a crack in your broken heart.",
      sk: "Pes je jediná vec, ktorá dokáže záplatovať prasklinu v zlomenom srdci.",
    } },
  { id: 13, author: "Gene Hill",
    text: {
      en: "Whoever said you can't buy happiness forgot little puppies.",
      sk: "Kto tvrdí, že šťastie sa nedá kúpiť, zabudol na šteňatá.",
    } },
  { id: 14, author: "Dwight D. Eisenhower",
    text: {
      en: "What counts is not necessarily the size of the dog in the fight; it's the size of the fight in the dog.",
      sk: "Nie je rozhodujúce, aký veľký je pes v boji — rozhodujúce je, aký veľký boj je v psovi.",
    } },
  { id: 15, author: "Orhan Pamuk",
    text: {
      en: "Dogs do speak, but only to those who know how to listen.",
      sk: "Psy hovoria — ale iba s tými, ktorí vedia počúvať.",
    } },
  { id: 16, author: "Gene Hill",
    text: {
      en: "We never really own a dog as much as he owns us.",
      sk: "Nikdy naozaj nevlastníme psa tak, ako on vlastní nás.",
    } },
  { id: 17, author: "Jonathan Safran Foer",
    text: {
      en: "Why does watching a dog be a dog fill one with happiness?",
      sk: "Prečo človeka napĺňa šťastím pozerať sa, ako je pes jednoducho psom?",
    } },
  { id: 18, author: "Saudi Arabian proverb",
    text: {
      en: "If you stop every time a dog barks, your road will never end.",
      sk: "Ak sa zastavíš vždy, keď pes zašteká, tvoja cesta nikdy neskončí.",
    } },
  { id: 19, author: "",
    text: {
      en: "In a perfect world, every dog would have a home and every home would have a dog.",
      sk: "V dokonalom svete by mal každý pes domov a každý domov by mal psa.",
    } },
  { id: 20, author: "",
    text: {
      en: "My goal in life is to be as good a person as my dog already thinks I am.",
      sk: "Môj životný cieľ je byť taký dobrý človek, akým ma môj pes už teraz považuje.",
    } },
  { id: 21, author: "Karen Davison",
    text: {
      en: "Saving one dog will not change the world, but surely for that one dog, the world will change forever.",
      sk: "Zachrániť jedného psa nezmení svet, ale určite pre toho jedného psa sa svet zmení navždy.",
    } },
  { id: 22, author: "Nora Roberts",
    text: {
      en: "Everything I know I learned from dogs.",
      sk: "Všetko, čo viem, som sa naučila od psov.",
    } },
  { id: 23, author: "Louis Sabin",
    text: {
      en: "No matter how little money and how few possessions you own, having a dog makes you rich.",
      sk: "Bez ohľadu na to, koľko máš peňazí a vecí, pes ťa robí bohatým.",
    } },
  { id: 24, author: "Paul Shaffer",
    text: {
      en: "Everybody should have a shelter dog. It's good for the soul.",
      sk: "Každý by mal mať psa z útulku. Je to dobré pre dušu.",
    } },
  { id: 25, author: "Josh Billings",
    text: {
      en: "A dog is the only thing on earth that loves you more than he loves himself.",
      sk: "Pes je jediná bytosť na svete, ktorá ťa miluje viac ako seba samého.",
    } },
  { id: 26, author: "Thom Jones",
    text: {
      en: "Dogs have a way of finding the people who need them, filling an emptiness we didn't ever know we had.",
      sk: "Psy majú dar nájsť ľudí, ktorí ich potrebujú — vyplniť prázdnotu, o ktorej sme ani nevedeli, že ju máme.",
    } },
  { id: 27, author: "M.K. Clinton",
    text: {
      en: "The world would be a nicer place if everyone had the ability to love as unconditionally as a dog.",
      sk: "Svet by bol krajším miestom, keby každý dokázal milovať tak bezpodmienečne ako pes.",
    } },
  { id: 28, author: "Susan Ariel Rainbow Kennedy",
    text: {
      en: "Dogs are miracles with paws.",
      sk: "Psy sú zázraky na labkách.",
    } },
  { id: 29, author: "Gerald Durrell",
    text: {
      en: "A house is not a home until it has a dog.",
      sk: "Dom nie je domovom, kým v ňom nie je pes.",
    } },
  { id: 30, author: "Charles M. Schulz",
    text: {
      en: "Happiness is a warm puppy.",
      sk: "Šťastie je teplé šteniatko.",
    } },
];

/** Číslo dňa v MIESTNOM čase (polnoc človeka, nie UTC) — rovnaká definícia ako titulka v `mePosts.ts`. */
const localDay = (d: Date) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / 86_400_000);

/** Citát a pozadie dňa. Rotuje o polnoci, 30 dní sa neopakuje, tri pozadia dookola. */
export function feedQuoteForDay(d: Date = new Date()): { quote: FeedQuote; bg: string; day: number } {
  const day = localDay(d);
  return {
    quote: FEED_QUOTES[day % FEED_QUOTES.length],
    bg: FEED_QUOTE_BG[day % FEED_QUOTE_BG.length],
    day,
  };
}

/** Text citátu v jazyku appky; chýbajúci jazyk padá na EN. */
export const feedQuoteText = (q: FeedQuote, lang: string): string => q.text[lang] || q.text.en;
