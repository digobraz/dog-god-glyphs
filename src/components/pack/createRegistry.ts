// REGISTER VYTVORITEĽNÉHO — jediný zdroj pravdy pre to, čo sa dá v `/pack` vytvoriť.
//
// Zadanie: `plany/zadanie-pack-plus-lista-DALSIA-SESSION.md` §3 KROK 1.
// Podklad:  `plany/nakres-pack-plus-kontext-2026-09-21.html` §2 (register) a §3 (test na mieste).
// Lock:     `plany/locky/architektura-pack.md` — tri vrstvy, štyri pravidlá pod lištou.
//
// PREČO EXISTUJE. Stred spodnej lišty je od 21. 9. 2026 `+` a jeho obsah je KONTEXTOVÝ
// (model B). Kým nie je zoznam na jednom mieste, `+` je rozcestník s náhodným obsahom —
// každá obrazovka by si ho napísala po svojom a o mesiac by v appke boli tri taxonómie
// toho istého. Vzor je `PAPER_ROUTES_*` v `packTheme.ts`: register + odvodenie, nie
// opísaný zoznam na každom povrchu.
//
// ⚠️ TENTO SÚBOR NIČ NEVYKRESĽUJE a nič nenaviguje. Je to dáta + pravidlá. Panel (`AddTripEntry`
//    rozšírený o `place`) a lišta (`PackLayout`) sa ho pýtajú; opačne nikdy.
//
// ⚠️ NOVÝ OBJEKT SA SEM NEPRIDÁVA TICHO. Register nesie množiny, ktorých NULOVÝ prekryv je
//    jediný dôvod, prečo `+` smie byť kontextový (§3 nákresu, „VÝSLEDOK MERANIA"). Objekt,
//    ktorý by patril dvom miestam naraz, ten dôkaz ruší — vtedy sa vracia rozhodnutie, nie
//    sa dopisuje riadok.

// ── MIESTA ──────────────────────────────────────────────────────────────────────────────────
// Štyri miesta chrbtice, ktoré majú lištu, + GLOBÁL. GLOBÁL nie je tab a nikdy ním nebude
// (lock §1.1) — je tu preto, že tie dva objekty VZNIKAJÚ a register by bez nich klamal
// o tom, čo sa v appke dá vytvoriť. Do panela `+` sa nedostanú (`panel: false`).
export type CreatePlace = 'DOMOV' | 'VON' | 'AINUBIS' | 'JA' | 'GLOBAL';

/** Poradie skupín v paneli na DOMOVE. DOMOV je prvý, lebo jeho vlastný objekt nemá hlavičku. */
export const PLACE_ORDER: readonly CreatePlace[] = ['DOMOV', 'VON', 'JA', 'AINUBIS', 'GLOBAL'];

// ── ČO OBJEKT POTREBUJE ─────────────────────────────────────────────────────────────────────
// Stĺpec, ktorý rozhoduje o všetkom: objekt, čo potrebuje bod na mape, sa inde dokončiť nedá.
//
// ⚠️ DÁTUM TU NIE JE a je to zámer. `plán vs. zápis` nie sú dve položky panela — rozhoduje
//    dátum VNÚTRI toku (minulý = zápis, budúci = plán). Platí to pre výlet aj pre denník;
//    rovnaké pravidlo dvakrát je zámer, nie duplicita. Keby bol dátum „potrebou", panel by
//    sa musel pýtať na dátum pred otvorením formulára — teda presne ten krok navyše, ktorý
//    „najprv čo, potom kde" (AddTripEntry.tsx:34) zámerne nerobí.
export type CreateNeed =
  | 'nic'      // otvorí sa odkiaľkoľvek
  | 'bod'      // ukázať miesto na mape
  | 'trasa'    // nakreslená alebo vybraná trasa
  | 'pes'      // aspoň jeden pes v účte
  | 'clovek'   // konkrétny človek
  | 'ludia';   // viac ľudí + dôvod

// ── STAV ────────────────────────────────────────────────────────────────────────────────────
// `live`       — dá sa to dnes vytvoriť na LIVE.
// `pripravene` — úložisko/pisateľ/typ existuje, chýba obrazovka. Toto je práca, nie nápad.
// `zamknute`   — čaká na inú vrstvu (feed, mozog), obrazovka sa nezačína.
export type CreateState = 'live' | 'pripravene' | 'zamknute';

// ── KAM VEDIE ───────────────────────────────────────────────────────────────────────────────
// Buď routa, alebo pomenovaný handler. Handler je tam, kde tok NEMENÍ adresu (panel, overlay) —
// register nesmie tvrdiť, že `/pack/x` existuje, keď je to overlay cez bus.
export type CreateTarget =
  | { kind: 'route'; path: string }
  | { kind: 'handler'; id: CreateHandler };

export type CreateHandler =
  | 'addEntry.trip'     // AddTripEntry → AddChoice { kind: 'trip' }
  | 'addEntry.note'     // AddTripEntry → AddChoice { kind: 'note' }
  | 'addEntry.event'    // AddTripEntry → AddChoice { kind: 'event' }
  | 'addEntry.service'  // AddChoice tvar ešte NEEXISTUJE — viď `service` nižšie (#63)
  | 'diary.write'       // pisateľ `lib/dogEvents.ts` → appendDogEvents()
  | 'diary.photo'       // ten istý pisateľ, zápis s prílohou fotky
  | 'feed.post'
  | 'ainubis.chat'      // openAinubis() z `lib/ainubisBus.ts`
  | 'ainubis.brain'
  | 'ainubis.board'
  | 'messaging.dm'      // emitOpenThread / emitOpenInbox z `messaging/openBridge.ts`
  | 'messaging.group'
  | 'trip.article';

// ── KAM VEDIE SPÄŤ ──────────────────────────────────────────────────────────────────────────
// 🔴 JEDINÁ HODNOTA JE `origin` A DRUHÁ SA NEZAKLADÁ.
//
// Diera, ktorú debata 21. 9. nechala otvorenú, znie: „stojím na DOMOVE → `+` → VÝLET → appka
// ma odnesie na mapu obkresliť trasu → uložím → kde som?" Odpoveď: TAM, KDE SOM STÁL.
//
// ⚠️ Týka sa to JEDINE tokov spustených z DOMOVA a je to premerané, nie odhadnuté: vo VON,
//    v JA aj v AINUBISOVI ponúka panel len objekty TOHO miesta, takže tok skončí tam, kde
//    začal. DOMOV je jediné miesto s celým repertoárom, teda jediné, ktoré vie poslať človeka
//    inam, než kde stál.
//
// ⚠️ NAPRIEK TOMU JE PRAVIDLO JEDNOTNÉ pre všetky štyri miesta. Vetvenie „na DOMOVE sa vracaj,
//    inde nie" by bolo pravidlo, ktoré platí len na jednej obrazovke — a presne také sa pri
//    ďalšej obrazovke zabudne. Keď sa `origin` rovná cieľu, návrat je no-op a nič nestojí.
//
// Uložený objekt sa NEOTVÁRA sám. Ohlási sa prúžkom „výlet zapísaný — ZOBRAZIŤ"; ak tam chce
// človek ísť, ide vedome. Lock §4.2: akcia nikdy neodnesie človeka preč z miesta, kde je.
export type CreateBack = 'origin';

// ── IKONKA ─────────────────────────────────────────────────────────────────────────────────
// 🔴 V REGISTRI NIE SÚ EMOJI A NESMÚ SEM PRIBUDNÚŤ. Brandová výnimka pre emoji platí MAPE
//    (`markEmoji.ts`), nie tomuto povrchu — `npm run check:ikony` to meria a emoji literál
//    v tomto súbore zhodí build. Nie je to formalita: emoji prepísané z nákresu by boli
//    DRUHÁ kópia ikonografie, ktorú už vlastní `AddTripEntry` (a tá si ju ťahá zo zdrojov
//    pravdy — `tripCategories.ts`, `markEmoji.ts`, `mapNotesData.ts`).
export type CreateIcon =
  // Kresba z hand-drawn setu, `public/icons/pack/*.svg`. Vykresľuj ju MASKOU, nie filtrom
  // (filter farbu aproximuje) — vzor je dlaždica chatu v `PackAinubis.tsx:214`.
  | { kind: 'kit'; src: string }
  // Ikonku už kreslí panel a register ju NEOPISUJE. Platí pre štyri objekty, ktoré
  // `AddTripEntry` vykresľuje dnes; opísať ich sem by znamenalo dve miesta, kde sa mení
  // jedna ikonka, a jedno z nich by sa raz zabudlo.
  | { kind: 'panel' }
  // Kresba neexistuje a nedá sa nahradiť ničím z kitu. Podľa brand locku je to dôvod
  // vypýtať si ju od Mateja — nie dôvod siahnuť po lucide alebo emoji.
  | { kind: 'chyba' };

// ── OBJEKT ──────────────────────────────────────────────────────────────────────────────────
export type CreateId =
  | 'trip' | 'note' | 'event' | 'service' | 'article'
  | 'diary' | 'photo'
  | 'post'
  | 'chat' | 'brain' | 'board'
  | 'dm' | 'group';

export type CreateObject = {
  id: CreateId;
  /** i18n kľúč názvu. Kde kľúč ešte nie je, drží text `labelFallback` — viď poznámku nižšie. */
  labelKey: string;
  /**
   * ⚠️ DOČASNÝ text, nie kánon. EN názvy položiek panela sú v zadaní §6 výslovne ponechané
   * MATEJOVI. Fallback je tu preto, aby chýbajúci preklad nevyhodil holý kľúč na obrazovku
   * (CLAUDE.md, názvoslovie: meň i18n AJ fallback v kóde) — nie preto, že je to schválené
   * znenie. Keď názvy prídu, `labelFallback` sa nemaže: ostáva ako posledná záchrana.
   */
  labelFallback: string;
  /** Podtitul dlaždice. Rovnaké pravidlo ako pri `labelKey`. */
  hintKey?: string;
  hintFallback?: string;
  icon: CreateIcon;
  place: CreatePlace;
  needs: CreateNeed;
  target: CreateTarget;
  back: CreateBack;
  /** Kam to padne — tabuľka alebo povrch. Prepísané z §2 nákresu, needituje sa od oka. */
  lands: string;
  state: CreateState;
  /**
   * Ponúka ho panel `+`? `false` neznamená „nedá sa to vytvoriť" — znamená, že sa to
   * nezačína z lišty. Dôvod je vždy v `note`.
   */
  panel: boolean;
  /** GitHub issue v `digobraz/dog-god-glyphs`, ak na ten objekt nejaký beží. */
  gh?: number;
  note?: string;
};

// ── TRINÁSŤ OBJEKTOV ────────────────────────────────────────────────────────────────────────
// Prepísané z §2 nákresu `nakres-pack-plus-kontext-2026-09-21.html`. Poradie v rámci miesta je
// poradie v paneli (§3 nákresu, nakreslené telefóny).
export const CREATE_OBJECTS: readonly CreateObject[] = [
  // ── VON ───────────────────────────────────────────────────────────────────────────────────
  {
    id: 'trip',
    labelKey: 'pack.addTrip.entry.kind.trip.title',
    labelFallback: 'TRIP',
    hintKey: 'pack.addTrip.entry.kind.trip.text',
    hintFallback: 'Share your spot with the pack',
    icon: { kind: 'panel' },
    place: 'VON',
    needs: 'trasa',
    target: { kind: 'handler', id: 'addEntry.trip' },
    back: 'origin',
    lands: 'user_trips · mapa · km',
    state: 'live',
    panel: true,
    // 🥾 → 🐾 (matrica 24. 8. 2026): dlaždica zastrešuje aj korčule, paddleboard a hrad.
    note: 'Trasu si tok nakreslí sám (GeometryPicker) — „potrebuje trasu" neznamená, že ju človek musí mať vopred.',
  },
  {
    id: 'note',
    labelKey: 'pack.addTrip.entry.kind.note.title',
    labelFallback: 'Quick note',
    hintKey: 'pack.addTrip.entry.kind.note.text',
    hintFallback: 'What the pack should know here',
    icon: { kind: 'panel' },
    place: 'VON',
    needs: 'bod',
    target: { kind: 'handler', id: 'addEntry.note' },
    back: 'origin',
    lands: 'map_notes',
    state: 'live',
    panel: true,
    // ⚠️ V SK sa to volá „Rýchly odkaz", NIE „značka" (sk.ts, ten istý kľúč). V textoch
    //    používaj TO slovo — „značka" je geometria na mape, nie vec, ktorú človek pridáva.
    note: 'Poradie „najprv čo, potom kde": panel sa zavrie a človek ukáže bod na odkrytej mape.',
  },
  {
    id: 'event',
    labelKey: 'pack.addTrip.entry.kind.event.title',
    labelFallback: 'EVENT',
    hintKey: 'pack.addTrip.entry.kind.event.text',
    hintFallback: 'Something happening on a date',
    icon: { kind: 'panel' },
    place: 'VON',
    needs: 'bod',
    target: { kind: 'handler', id: 'addEntry.event' },
    back: 'origin',
    lands: 'events',
    state: 'live',
    panel: true,
  },
  {
    id: 'service',
    labelKey: 'pack.addTrip.entry.kind.service.title',
    labelFallback: 'SERVICE',
    hintKey: 'pack.addTrip.entry.kind.service.text',
    hintFallback: 'Someone who helps you and your dog',
    icon: { kind: 'panel' },
    place: 'VON',
    needs: 'bod',
    target: { kind: 'handler', id: 'addEntry.service' },
    back: 'origin',
    lands: 'vrstva mapy',
    state: 'pripravene',
    panel: true,
    gh: 63,
    // ⚠️ `service` JE v `type Kind` (AddTripEntry.tsx:44) a MÁ i18n, ale NIE JE v `AddChoice`
    //    — panel ho teda dnes vie pomenovať a nevie vrátiť. To je celá práca issue #63.
    // ⚠️ A NEVRACAJ HO AKO `disabled` DLAŽDICU. Presne tak tu stál do 6. 8. 2026 a Matej ho
    //    dal von: pri troch dlaždiciach mu flex-wrap dal celú šírku, takže vizuálne najväčší
    //    prvok panela bol mŕtvy. Buď má obrazovku, alebo sa nevykresľuje.
    note: 'Do panela sa vracia až s obrazovkou (#63), nie ako zošedená dlaždica.',
  },
  {
    id: 'article',
    labelKey: 'pack.create.article.title',
    labelFallback: 'Trail article',
    icon: { kind: 'kit', src: '/icons/pack/document.svg' },
    place: 'VON',
    needs: 'trasa',
    target: { kind: 'handler', id: 'trip.article' },
    back: 'origin',
    lands: 'článok výletu',
    state: 'pripravene',
    panel: false,
    gh: 61,
    // Nezačína sa z lišty: potrebuje UŽ EXISTUJÚCU trasu, takže vchod je článok tej trasy.
    // Od výletu sa líši práve tým — výlet si trasu nakreslí, článok si ju vybrať nevie.
    note: 'Vchod je povrch trasy, nie panel `+`. Preto `panel: false`, nie „ešte nie".',
  },

  // ── JA ────────────────────────────────────────────────────────────────────────────────────
  {
    id: 'diary',
    labelKey: 'pack.create.diary.title',
    labelFallback: 'Diary entry',
    hintKey: 'pack.create.diary.hint',
    hintFallback: 'note · weight · health · milestone',
    icon: { kind: 'kit', src: '/icons/pack/pencil.svg' },
    place: 'JA',
    needs: 'pes',
    target: { kind: 'handler', id: 'diary.write' },
    back: 'origin',
    lands: 'dog_events → kalendár',
    state: 'pripravene',
    // Úložisko `dog_events` je na LIVE (0 riadkov) a pisateľ `appendDogEvents()` v
    // `lib/dogEvents.ts:90` EXISTUJE. Chýba jedine obrazovka, ktorá ho zavolá — preto
    // `pripravene`, nie `zamknute`. Kalendár (`calendar/PackCalendar.tsx`) je zámerne
    // čítací: je to hotový čitateľ, ktorý čaká presne na tohto pisateľa.
    panel: true,
    note: 'Minulý dátum = zápis do denníka · budúci = plán a ukáže sa v kalendári. Rozhoduje dátum v toku, nie druhá dlaždica.',
  },
  {
    id: 'photo',
    labelKey: 'pack.create.photo.title',
    labelFallback: 'Photo',
    icon: { kind: 'kit', src: '/icons/pack/frame.svg' },
    place: 'JA',
    needs: 'pes',
    target: { kind: 'handler', id: 'diary.photo' },
    back: 'origin',
    lands: 'galéria (príloha zápisu)',
    state: 'live',
    panel: true,
    // ⚠️ FOTKA NIE JE SAMOSTATNÉ ÚLOŽISKO. Je to DRUHÝ VCHOD do toho istého zápisu do denníka
    //    — človek pridáva udalosť, nie priečinok. Register ju vedie ako vlastný riadok (tak
    //    stojí v §2 nákresu a tak je nakreslená v §3), ale `target` mieri na toho istého
    //    pisateľa. To je pravidlo „jeden pridávací panel, viac vchodov", nie výnimka z neho.
  },

  // ── DOMOV ─────────────────────────────────────────────────────────────────────────────────
  {
    id: 'post',
    labelKey: 'pack.create.post.title',
    labelFallback: 'Post',
    hintKey: 'pack.create.post.hint',
    hintFallback: 'photo + text + tags',
    icon: { kind: 'chyba' },
    place: 'DOMOV',
    needs: 'nic',
    target: { kind: 'handler', id: 'feed.post' },
    back: 'origin',
    lands: 'feed',
    state: 'zamknute',
    panel: true,
    // ⚠️ PRÍSPEVOK NEMÁ TYP, MÁ ŠTÍTKY (lock: zbierka, inzerát, rada…). Nový feed = nový
    //    štítok, nie nová tabuľka a nie nový riadok v tomto registri.
    // ⚠️ IKONKA CHÝBA: v kite nie je nič, čo by znamenalo „príspevok do feedu" (`people`
    //    je svorka, `chat` je rozhovor, `document` je článok). Podľa brand locku je to
    //    dôvod vypýtať si kresbu od Mateja — patrí do zoznamu §6 zadania k ikonke `+`.
    note: 'Čaká na feed — dovtedy je to jediný objekt DOMOVA, takže panel na DOMOVE stojí na skupinách ostatných miest.',
  },

  // ── AINUBIS ───────────────────────────────────────────────────────────────────────────────
  {
    id: 'chat',
    labelKey: 'pack.create.chat.title',
    labelFallback: 'New conversation',
    icon: { kind: 'kit', src: '/icons/pack/chat.svg' },
    place: 'AINUBIS',
    needs: 'nic',
    target: { kind: 'handler', id: 'ainubis.chat' },
    back: 'origin',
    lands: 'vlákno + história',
    state: 'live',
    panel: true,
    // `openAinubis()` z `lib/ainubisBus.ts` — bus sa NERUŠÍ ani po tom, čo má AINUBIS vlastnú
    // routu `/pack/ainubis`. Volajú ho `Gateways.tsx`, `MapCoach.tsx`, `packDockMedal.tsx`
    // aj dlaždica v kostre (`PackAinubis.tsx:214`).
  },
  {
    id: 'brain',
    labelKey: 'pack.create.brain.title',
    labelFallback: 'Add to the brain',
    hintKey: 'pack.create.brain.hint',
    hintFallback: 'finding · link · book · video',
    icon: { kind: 'kit', src: '/icons/pack/idea.svg' },
    place: 'AINUBIS',
    needs: 'nic',
    target: { kind: 'handler', id: 'ainubis.brain' },
    back: 'origin',
    lands: 'mozog + pečať',
    state: 'pripravene',
    panel: true,
    // ⚠️ V APPKE SÚ DVE `+` A NIKDY NESMÚ VYZERAŤ ROVNAKO: kotúč v lište = „pridávam do
    //    svojho života" · `+` pri písacom poli AINUBISA = „pridávam do mozgu". Tento riadok
    //    je ten druhý — do panela chrbtice patrí len preto, že režim VAULT lištu MÁ.
  },
  {
    id: 'board',
    labelKey: 'pack.create.board.title',
    labelFallback: 'Ask the pack',
    icon: { kind: 'kit', src: '/icons/pack/clipboard.svg' },
    place: 'AINUBIS',
    needs: 'nic',
    target: { kind: 'handler', id: 'ainubis.board' },
    back: 'origin',
    lands: 'nástenka svorky',
    state: 'pripravene',
    panel: true,
    note: 'Spýtaj sa svorky, nie AI — to je celý rozdiel voči `chat` a jediný dôvod, prečo sú to dva riadky.',
  },

  // ── GLOBÁL ────────────────────────────────────────────────────────────────────────────────
  // ⚠️ GLOBÁL NIE JE TAB A PANEL `+` HO NEPONÚKA. Správy sú v hornom páse a sú dostupné
  //    z každej obrazovky — keby viseli aj v `+`, bol by to druhý vchod do veci, ktorá
  //    žiadny druhý vchod nepotrebuje, a `+` by prestal znamenať „pridávam do svojho života".
  {
    id: 'dm',
    labelKey: 'pack.create.dm.title',
    labelFallback: 'Message',
    icon: { kind: 'kit', src: '/icons/pack/envelope.svg' },
    place: 'GLOBAL',
    needs: 'clovek',
    target: { kind: 'handler', id: 'messaging.dm' },
    back: 'origin',
    lands: 'overlay schránky',
    state: 'live',
    panel: false,
    // `emitOpenThread()` / `emitOpenInbox()` z `messaging/openBridge.ts`.
  },
  {
    id: 'group',
    labelKey: 'pack.create.group.title',
    labelFallback: 'Group chat',
    icon: { kind: 'kit', src: '/icons/pack/people.svg' },
    place: 'GLOBAL',
    needs: 'ludia',
    target: { kind: 'handler', id: 'messaging.group' },
    back: 'origin',
    lands: 'overlay schránky',
    state: 'pripravene',
    panel: false,
    gh: 62,
  },
];

// ⚠️ OTVORENÉ — NEDOPLNENÉ ZÁMERNE. §3 nákresu kreslí v paneli miesta JA tretiu dlaždicu
// „NOVÝ PES (ďalší heroglyf)", ale v §2 registri TAKÝ OBJEKT NIE JE. Zadanie hovorí
// „prepíš trinásť objektov odtiaľ, nevymýšľaj nové", takže sa sem nedopisuje. Rozdiel je
// vecný, nie formálny: nový pes je PLATENÝ vstup (€11 heroglyf), teda tok cez Stripe —
// nie zápis do svorky. Panel JA má preto dnes dve položky, nie tri.
// → rozhodnutie pre Mateja: patrí platený vchod do `+`, alebo ostáva na `/pack/dogs`?
export const MIMO_REGISTRA = ['novy-pes'] as const;

// ── ODVODENIE: ČO PONÚKA `+` NA MIESTE ──────────────────────────────────────────────────────
// 🔴 ODVODZUJ, NEOPISUJ. Ručný zoznam „čo je na ktorom mieste" by zostarol ticho — pri
//    pridanom objekte by sa nikde nezasvietilo načerveno, len by v paneli chýbal.

/**
 * Dá sa to dnes naozaj vytvoriť?
 *
 * 🔴 PANEL UKAZUJE LEN HOTOVÉ (Matej 21. 9. 2026: „je ich tam 10, ale viacero z nich nie je
 *    ready, takže tam daj len tie, ktoré sú relevantné"). Register nesie všetkých trinásť —
 *    to je jeho úloha, lebo je to zoznam toho, čo v appke VZNIKÁ, nie zoznam dlaždíc. Panel
 *    z neho berie prienik s tým, čo má obrazovku.
 *
 * ⚠️ POLOŽKA SA DO PANELA DOSTÁVA PREKLOPENÍM `state` NA `live`, NIE EDITÁCIOU PANELA.
 *    Keď dorobíš obrazovku (denník, #61, #63, feed, mozog, nástenka), zmeníš JEDEN riadok
 *    registra a položka sa objaví všade naraz — na svojom mieste aj na DOMOVE. Keby sa
 *    zoznamy písali ručne, pribudla by na jednom mieste a na druhom by chýbala.
 *
 * ⚠️ A NEVRACAJ ROZROBENÉ AKO ZOŠEDENÚ DLAŽDICU. Presne tak tu stál `service` do 6. 8. 2026
 *    a Matej ho dal von: vizuálne najväčší prvok panela bol mŕtvy. Buď to má obrazovku,
 *    alebo sa to nevykresľuje.
 */
export function isReady(o: CreateObject): boolean {
  return o.panel && o.state === 'live';
}

/** Objekty jedného miesta, ktoré panel dnes ponúka. V poradí registra. */
export function createFor(place: CreatePlace): CreateObject[] {
  return CREATE_OBJECTS.filter((o) => o.place === place && isReady(o));
}

/**
 * Všetko, čo tomu miestu PATRÍ — aj nehotové. Na diagnostiku, nástenku behu a na otázku
 * „čo tu raz pribudne". Panel sa pýta `createFor`, nie tohto.
 */
export function createAll(place: CreatePlace): CreateObject[] {
  return CREATE_OBJECTS.filter((o) => o.place === place);
}

/**
 * Obsah panela na danom mieste, zoskupený.
 *
 * DOMOV nemá kontext, tak dostáva CELÝ repertoár zoskupený podľa miesta (§1.3 rozhodnutia:
 * „DOMOV má celý repertoár, ostatné miesta svoj výrez"). Vlastný objekt DOMOVA ide prvý
 * a bez hlavičky — hlavička nad jedinou skupinou, v ktorej človek práve stojí, nehovorí nič.
 *
 * ⚠️ „Celý repertoár" znamená VŠETKO HOTOVÉ, nie všetkých trinásť. §3 nákresu kreslí na
 *    DOMOVE päť dlaždíc a vyšlo to nachystane: presne toľko ich dnes má obrazovku. Keď
 *    pribudne denník a feed, panel narastie sám — bez zásahu sem.
 */
export function panelFor(place: CreatePlace): Array<{ group: CreatePlace | null; items: CreateObject[] }> {
  if (place !== 'DOMOV') {
    const items = createFor(place);
    return items.length ? [{ group: null, items }] : [];
  }
  const out: Array<{ group: CreatePlace | null; items: CreateObject[] }> = [];
  for (const p of PLACE_ORDER) {
    const items = createFor(p);
    if (!items.length) continue;
    out.push({ group: p === 'DOMOV' ? null : p, items });
  }
  return out;
}

// ── PRAVIDLO NÁVRATU ────────────────────────────────────────────────────────────────────────
// `origin` cestuje v query parametri, nie v pamäti komponentu ani v `history.state`: tok
// výletu ide cez celú mapu a človek ho vie prerušiť obnovením stránky. Parameter prežije
// F5, zdieľaný odkaz aj návrat z platby; pamäť komponentu nie.
export const ORIGIN_PARAM = 'from';

/** Kam sa vraciame, keď `origin` chýba alebo je nedôveryhodný. */
export const ORIGIN_FALLBACK = '/pack';

/**
 * Je to adresa, na ktorú sa smieme vrátiť?
 *
 * ⚠️ Parameter z URL je CUDZÍ VSTUP. Bez tejto kontroly by `?from=https://…` spravil
 *    z návratu otvorené presmerovanie — a to na povrchu, kde je človek prihlásený.
 *    Pustíme výhradne vlastné `/pack…` cesty: jedna lomka na začiatku, nie dve
 *    (`//zle.tld` je pre prehliadač absolútna adresa), a žiadna schéma.
 */
export function isSafeOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  if (!origin.startsWith('/pack')) return false;
  if (origin.startsWith('//')) return false;
  if (origin.includes('\\')) return false;
  return true;
}

/** Pripne `origin` k ceste toku. Volá sa pri OTVORENÍ toku, nie pri uložení. */
export function withOrigin(path: string, origin: string): string {
  const safe = isSafeOrigin(origin) ? origin : ORIGIN_FALLBACK;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}${ORIGIN_PARAM}=${encodeURIComponent(safe)}`;
}

/** Prečíta `origin` z `location.search`. */
export function readOrigin(search: string): string {
  const raw = new URLSearchParams(search).get(ORIGIN_PARAM);
  return isSafeOrigin(raw) ? (raw as string) : ORIGIN_FALLBACK;
}

/**
 * Kam ide človek po uložení. Jediná odpoveď je `origin` — viď `CreateBack`.
 *
 * ⚠️ NEOTVÁRAJ ULOŽENÝ OBJEKT. Prúžok „zapísané — ZOBRAZIŤ" je jediná cesta k nemu a klikne
 *    naň ten, kto tam ísť chce. Otvorenie objektu by bolo presne to, čo lock §4.2 zakazuje:
 *    akcia, ktorá odnesie človeka preč z miesta, kde je.
 */
export function returnTo(origin: string | null | undefined): string {
  return isSafeOrigin(origin) ? (origin as string) : ORIGIN_FALLBACK;
}

/** Objekt podľa id — na diagnostiku a na prúžok po uložení. */
export function createObject(id: CreateId): CreateObject | undefined {
  return CREATE_OBJECTS.find((o) => o.id === id);
}
