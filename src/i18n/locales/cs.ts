import type { Dict } from '../LanguageContext';

/**
 * DOGYPT i18n — CS (čeština) slovník. Partial<Dict>: chýbajúci kľúč ticho padne na EN.
 *
 * ROZSAH = conversion-path / FLOW (heroglyph intro + 14 krokov + checkout + welcome +
 *   login + 404). Lore (/vision) zatiaľ NIE je preložené → padá na EN fallback.
 *
 * Preložené zo SK draftu (drží Matejove tónové rozhodnutia), overené proti EN masteru.
 * Brand termíny ostávajú EN: HEROGLYPH, Heroglyph, Dogypt, DOGYPT, Pack.
 * MOTTO ostáva vždy EN: „DOG is GOD" / „IN DOG WE TRUST".
 * „doglover" = pejskař (české zrkadlo SK „psíčkar"). Tykání (DOGYPT = komunita).
 * Status: machine-quality draft — čaká Matejov CZE review (CZE je v reviewovateľnom sete).
 */
export const cs: Partial<Dict> = {
  // ── /heroglyph intro ──
  // hero title — case riadi CSS text-transform. CS = iba „Symbol," (zrkadlí SK);
  // mobile = 1 riadok (line2 prázdny), desktop = „Symbol,". Číta sa s sublinom.
  'heroglyph.intro.title.line1': 'Symbol,',
  'heroglyph.intro.title.line2': '',
  'heroglyph.intro.title.desktop': 'Symbol,',
  'heroglyph.intro.title.sub': 'Který Mění Historii',

  // dictionary blok („DOG is GOD" = MOTTO → ostáva EN)
  'heroglyph.intro.word': 'Heroglyph',
  'heroglyph.intro.ipa': '[ˈhɪr-oʊ-ɡlɪf]',
  'heroglyph.intro.noun': 'podstatné jméno',
  'heroglyph.intro.definition':
    'Unikátní symbol, který popisuje tebe a tvého psa — vaše věčné pouto. Zároveň vstupenka do DOGYPT — místa, kde DOG is GOD.',

  // Heroglyph slovo tooltip
  'heroglyph.intro.wordTooltip': 'HERO = PES · GLYPH = SYMBOL',
  'heroglyph.intro.wordTooltipSub': 'BOŽSKÉ jméno pro každého PSA.',

  // CTA + outro
  'heroglyph.intro.cta': 'Staň se Dogypťanem',
  'heroglyph.intro.outro': 'Pejskaři, do zbraně!',
  'heroglyph.intro.loading': 'Načítá se…',

  // pills rad 1
  'heroglyph.intro.pill.questions.label': '12 otázek',
  'heroglyph.intro.pill.questions.tooltip': 'Dvanáct rychlých odpovědí o tvém psovi.',
  'heroglyph.intro.pill.minutes.label': '3 minuty',
  'heroglyph.intro.pill.minutes.tooltip': 'Interaktivní kvíz plný zábavy.',
  'heroglyph.intro.pill.forever.label': 'Navždy na DOGYPT.com',
  'heroglyph.intro.pill.forever.tooltip':
    'Jméno tvého psa navždy v tvém srdci — i v digitálním světě.',

  // pills rad 2 (MOTTO IN DOG WE TRUST ostáva EN)
  'heroglyph.intro.pill.unique.label': 'Jediný svého druhu',
  'heroglyph.intro.pill.unique.tooltip': 'Žádné dva heroglyfy nejsou stejné — každý symbol je unikátní!',
  'heroglyph.intro.pill.vow.label': 'Slib Víry',
  'heroglyph.intro.pill.vow.tooltip': 'Tvůj znak věrnosti dogyptiánské cestě — IN DOG WE TRUST!',
  'heroglyph.intro.pill.bond.label': 'Věčné Pouto',
  'heroglyph.intro.pill.bond.tooltip': 'Symbol věčného pouta mezi tebou a tvým psem.',
  'heroglyph.intro.pill.payment.label': 'Jedna Symbolická Platba',
  'heroglyph.intro.pill.payment.tooltip':
    '€11 jednou — žádné předplatné. Všechny peníze zůstávají v DOGYPT — na vývoj a systematickou pomoc!',

  // showcase symbol meanings (Hekthorov heroglyf) — vlastné mená (Hekthor/Matej) NEPREKLADÁM
  'heroglyph.intro.meaning.dog.label': 'Pes',
  'heroglyph.intro.meaning.dog.value': 'Hekthor',
  'heroglyph.intro.meaning.owner.label': 'Majitel',
  'heroglyph.intro.meaning.owner.value': 'Matej',
  'heroglyph.intro.meaning.dogGender.label': 'Pohlaví Psa',
  'heroglyph.intro.meaning.dogGender.value': 'Král',
  'heroglyph.intro.meaning.dogColour.label': 'Barva Psa',
  'heroglyph.intro.meaning.dogColour.value': 'Tmavá srst',
  'heroglyph.intro.meaning.dogPatron.label': 'Patron Psa',
  'heroglyph.intro.meaning.dogPatron.value': 'Hekthor',
  'heroglyph.intro.meaning.dogOrigin.label': 'Původ Psa',
  'heroglyph.intro.meaning.dogOrigin.value': 'Zachráněný',
  'heroglyph.intro.meaning.dogBloodline.label': 'Původová Linie',
  'heroglyph.intro.meaning.dogBloodline.value': 'Kříženec',
  'heroglyph.intro.meaning.dogCharacter1.label': 'Charakter Psa I',
  'heroglyph.intro.meaning.dogCharacter1.value': 'Oblíbené frisbee',
  'heroglyph.intro.meaning.dogCharacter2.label': 'Charakter Psa II',
  'heroglyph.intro.meaning.dogCharacter2.value': 'Milovník vody',
  'heroglyph.intro.meaning.ownerGender.label': 'Pohlaví Majitele',
  'heroglyph.intro.meaning.ownerGender.value': 'Muž',
  'heroglyph.intro.meaning.westernZodiac.label': 'Západní Zvěrokruh',
  'heroglyph.intro.meaning.westernZodiac.value': 'Lev',
  'heroglyph.intro.meaning.chineseZodiac.label': 'Čínský Zvěrokruh',
  'heroglyph.intro.meaning.chineseZodiac.value': 'Kohout',
  'heroglyph.intro.meaning.ownerInitial.label': 'Iniciála Majitele',
  'heroglyph.intro.meaning.ownerInitial.value': 'Matej',
  'heroglyph.intro.meaning.ranking.label': 'Pořadí',
  'heroglyph.intro.meaning.ranking.value': '#1 — První pes',

  // ── /heroglyph flow — krok 1: meno ──
  'heroglyph.flow.name.greetingPrefix': 'Ahoj, já jsem',
  'heroglyph.flow.name.greetingQuestion': 'Jak se jmenuje tvůj pes?',
  'heroglyph.flow.name.placeholder': 'Napiš jméno svého psa…',
  'heroglyph.flow.name.birthday': 'Kdy se tvůj pes narodil?',
  'heroglyph.flow.name.continue': 'Pokračovat',
  'heroglyph.flow.name.infoAria': 'Info o Hekthorovi',
  'heroglyph.flow.name.whoTitle': 'KDO JE',
  'heroglyph.flow.name.whoTitleName': 'HEKTHOR?',
  'heroglyph.flow.name.whoBody':
    'Hekthor je první Dogypťan. Zachráněný z ulice a adoptovaný z útulku, jeho věrnost a láska inspirovala globální hnutí, které uctívá psy jako bohy. Jeho misí je vytvořit jedinečný HEROGLYPH pro každého psa na Zemi a sjednotit největší komunitu pejskařů, která pomůže milionům psů v nouzi.',
  'heroglyph.flow.name.born': 'Narozený',
  'heroglyph.flow.name.adopted': 'Adoptovaný',
  'heroglyph.flow.name.location': 'Místo',
  'heroglyph.flow.name.locationValue': 'Slovensko, EU',

  // ── /heroglyph flow — krok 2: foto ──
  'heroglyph.flow.photo.faceOfGodPrefix': '',
  'heroglyph.flow.photo.faceOfGodWord': 'TVÁŘ',
  'heroglyph.flow.photo.faceOfGodSuffix': 'BOHA',
  'heroglyph.flow.photo.uploadHint': 'Nahraj jasnou fotku {dogName} — navždy ji zapečetíme do jeho Heroglyphu.',
  'heroglyph.flow.photo.yourDog': 'svého psa',
  'heroglyph.flow.photo.tapToUpload': 'Klikni pro nahrání',
  'heroglyph.flow.photo.changePhoto': 'Změnit fotku',
  'heroglyph.flow.photo.sealing': 'Pečetím do věčnosti…',
  'heroglyph.flow.photo.sealed': '✓ Zapečetěno',
  'heroglyph.flow.photo.uploadFailed': 'Nahrání selhalo — zkus znovu',
  'heroglyph.flow.photo.tipForward': 'pes čelem',
  'heroglyph.flow.photo.tipSide': 'z profilu / skupina',
  'heroglyph.flow.photo.tipBest': 'Nejlepší výsledek: tvář jasně viditelná, funguje oříznutá do kruhu.',
  'heroglyph.flow.photo.next': 'DÁL →',
  'heroglyph.flow.photo.back': '← ZPĚT',
  'heroglyph.flow.photo.adjustTitle': 'UPRAV SVŮJ PORTRÉT',
  'heroglyph.flow.photo.adjustHint': 'Tažením umísti psa do rámu.',
  'heroglyph.flow.photo.moreTitle': 'VÍCE TVÁŘÍ BOHA',
  'heroglyph.flow.photo.moreHint': 'Přidej 1–3 další fotky pro překvapení později. (volitelné)',
  'heroglyph.flow.photo.saving': 'UKLÁDÁM…',

  // ── /heroglyph flow — krok 3: rasa ──
  'heroglyph.flow.breed.question': 'Pověz, jaké rasy je tvůj hrdina?',
  'heroglyph.flow.breed.searchPlaceholder': 'Hledej rasu…',
  'heroglyph.flow.breed.continue': 'Pokračovat',
  'heroglyph.flow.breed.cat.01': 'Chlupáči',
  'heroglyph.flow.breed.cat.02': 'Vlnáči',
  'heroglyph.flow.breed.cat.03': 'Antény',
  'heroglyph.flow.breed.cat.04': 'Sprintéři',
  'heroglyph.flow.breed.cat.05': 'Čmuchači',
  'heroglyph.flow.breed.cat.06': 'Aristokrati',
  'heroglyph.flow.breed.cat.07': 'Čumáčci',
  'heroglyph.flow.breed.cat.08': 'Šplouchači',
  'heroglyph.flow.breed.cat.09': 'Vlčíci',
  'heroglyph.flow.breed.cat.10': 'Obři',

  // ── /heroglyph flow — krok 4: poradie ──
  'heroglyph.flow.ranking.question': 'Je {dogName} tvůj první pes?',
  'heroglyph.flow.ranking.yourPup': 'tvůj pes',
  'heroglyph.flow.ranking.yesLabel': 'ANO, moje první láska',
  'heroglyph.flow.ranking.noLabel': 'NE, měl jsem jich víc',
  'heroglyph.flow.ranking.whichDog': 'Kolikátý pes je {dogName}?',
  'heroglyph.flow.ranking.range': '11–50',
  'heroglyph.flow.ranking.enterNumber': 'Zadej číslo psa (11–50)',
  'heroglyph.flow.ranking.continue': 'Pokračovat',
  'heroglyph.flow.ranking.back': 'Zpět',

  // ── /heroglyph flow — krok 5: majiteľ ──
  'heroglyph.flow.ownerInfo.greetingPrefix': 'Tak, pojďme si promluvit o tobě,',
  'heroglyph.flow.ownerInfo.greetingWord': 'člověče',
  'heroglyph.flow.ownerInfo.placeholder': 'Křestní jméno majitele…',
  'heroglyph.flow.ownerInfo.man': 'Muž',
  'heroglyph.flow.ownerInfo.woman': 'Žena',
  'heroglyph.flow.ownerInfo.continue': 'Pokračovat',
  'heroglyph.flow.ownerInfo.back': 'Zpět',

  // ── /heroglyph flow — spoločné ──
  'heroglyph.flow.yourDogFallback': 'TVÉHO PSA',
  'heroglyph.flow.dogHeroglyphTitle': 'HEROGLYPH PSA {dogName}',

  // ── /heroglyph flow — krok 6: zverokruh majiteľa ──
  'heroglyph.flow.ownerZodiac.question': 'Co o tobě říkají hvězdy?',
  'heroglyph.flow.ownerZodiac.westernLabel': 'Znamení Zvěrokruhu',
  'heroglyph.flow.ownerZodiac.chineseLabel': 'Čínský Zvěrokruh',
  'heroglyph.flow.ownerZodiac.continue': 'Pokračovat',
  'heroglyph.flow.ownerZodiac.back': 'Zpět',
  // znamenia zverokruhu (iba label — hodnota enumu ostáva anglická)
  'heroglyph.flow.ownerZodiac.sign.Aries': 'Beran',
  'heroglyph.flow.ownerZodiac.sign.Taurus': 'Býk',
  'heroglyph.flow.ownerZodiac.sign.Gemini': 'Blíženci',
  'heroglyph.flow.ownerZodiac.sign.Cancer': 'Rak',
  'heroglyph.flow.ownerZodiac.sign.Leo': 'Lev',
  'heroglyph.flow.ownerZodiac.sign.Virgo': 'Panna',
  'heroglyph.flow.ownerZodiac.sign.Libra': 'Váhy',
  'heroglyph.flow.ownerZodiac.sign.Scorpio': 'Štír',
  'heroglyph.flow.ownerZodiac.sign.Sagittarius': 'Střelec',
  'heroglyph.flow.ownerZodiac.sign.Capricorn': 'Kozoroh',
  'heroglyph.flow.ownerZodiac.sign.Aquarius': 'Vodnář',
  'heroglyph.flow.ownerZodiac.sign.Pisces': 'Ryby',
  // čínsky zverokruh (iba label — hodnota enumu ostáva anglická)
  'heroglyph.flow.ownerZodiac.animal.Monkey': 'Opice',
  'heroglyph.flow.ownerZodiac.animal.Rooster': 'Kohout',
  'heroglyph.flow.ownerZodiac.animal.Dog': 'Pes',
  'heroglyph.flow.ownerZodiac.animal.Pig': 'Prase',
  'heroglyph.flow.ownerZodiac.animal.Rat': 'Krysa',
  'heroglyph.flow.ownerZodiac.animal.Ox': 'Buvol',
  'heroglyph.flow.ownerZodiac.animal.Tiger': 'Tygr',
  'heroglyph.flow.ownerZodiac.animal.Rabbit': 'Králík',
  'heroglyph.flow.ownerZodiac.animal.Dragon': 'Drak',
  'heroglyph.flow.ownerZodiac.animal.Snake': 'Had',
  'heroglyph.flow.ownerZodiac.animal.Horse': 'Kůň',
  'heroglyph.flow.ownerZodiac.animal.Goat': 'Koza',

  // ── /heroglyph flow — krok 7: finále majiteľa ──
  'heroglyph.flow.ownerFinal.infoAria': 'Info o Heroglyphu',
  'heroglyph.flow.ownerFinal.messageLine1': 'ČLOVĚČE, tvoje část je hotová.',
  'heroglyph.flow.ownerFinal.messageLine2': 'Ten malý rámeček — to jsi ty!',
  'heroglyph.flow.ownerFinal.messageLine3Prefix': 'Teď dokončíme celý HEROGLYPH a část patřící',
  'heroglyph.flow.ownerFinal.messageLine3Suffix': '.',
  'heroglyph.flow.ownerFinal.cta': 'POJĎME NA TO',
  'heroglyph.flow.ownerFinal.infoTitle': 'INSPIROVÁNO STAROVĚKÝM EGYPTEM',
  'heroglyph.flow.ownerFinal.infoBody':
    'HEROGLYPH se skládá ze dvou rámečků, které spolu tvoří pravou identitu tvého psa. Ve starověkém Egyptě se jména bohů či faraonů vpisovala do podobných ochranných oválných rámečků — kartuší — aby jejich odkaz přetrval navěky.',
  'heroglyph.flow.ownerFinal.cleopatraAlt': 'Kleopatřina kartuše',
  'heroglyph.flow.ownerFinal.cleopatraCaption': 'Tento hieroglyf patří Kleopatře.',
  'heroglyph.flow.ownerFinal.back': 'Zpět',

  // ── /heroglyph flow — krok 8: pohlavie psa ──
  'heroglyph.flow.dogGender.infoAria': 'Info o pohlaví psa',
  'heroglyph.flow.dogGender.title': 'Pohlaví Psa',
  'heroglyph.flow.dogGender.questionPrefix': 'Máš doma',
  'heroglyph.flow.dogGender.questionKing': 'krále',
  'heroglyph.flow.dogGender.questionOr': 'nebo',
  'heroglyph.flow.dogGender.questionQueen': 'královnu',
  'heroglyph.flow.dogGender.questionSuffix': '?',
  'heroglyph.flow.dogGender.king': 'Král',
  'heroglyph.flow.dogGender.queen': 'Královna',
  'heroglyph.flow.dogGender.info3Title': 'Trojcípá koruna',
  'heroglyph.flow.dogGender.info3Body':
    'Pro kluky, co zvládli balanc na 3 packách. Jedna noha nahoře, maximální přesnost, absolutní legenda.',
  'heroglyph.flow.dogGender.info4Title': 'Čtyřcípá koruna',
  'heroglyph.flow.dogGender.info4Body':
    'Pro holky, co mají radši stabilitu na 4 packách. Maximální pohodlí, žádný chaos, totální elegance.',
  'heroglyph.flow.dogGender.back': 'Zpět',

  // ── /heroglyph flow — krok 9: osud psa ──
  'heroglyph.flow.dogFate.infoAria': 'Info o původu psa',
  'heroglyph.flow.dogFate.title': 'Původ',
  'heroglyph.flow.dogFate.questionPrefix': 'Narodil se tvůj pes do',
  'heroglyph.flow.dogFate.questionSafe': 'bezpečného domova',
  'heroglyph.flow.dogFate.questionOr': 'nebo dostal',
  'heroglyph.flow.dogFate.questionSecond': 'druhou šanci',
  'heroglyph.flow.dogFate.questionSuffix': ' v životě?',
  'heroglyph.flow.dogFate.raised': 'Vychovaný',
  'heroglyph.flow.dogFate.rescued': 'Zachráněný',
  'heroglyph.flow.dogFate.infoRaisedTitle': 'Dudlík',
  'heroglyph.flow.dogFate.infoRaisedBody': 'Pes, který se narodil do rodiny. Vychovávaný s láskou od prvního dne.',
  'heroglyph.flow.dogFate.infoRescuedTitle': 'Záchranný kruh',
  'heroglyph.flow.dogFate.infoRescuedBody': 'Zachráněný nebo nalezený pes. Dostal druhou šanci v životě.',
  'heroglyph.flow.dogFate.back': 'Zpět',

  // ── /heroglyph flow — krok 10: farba psa ──
  'heroglyph.flow.dogColour.title': 'Barva Psa',
  'heroglyph.flow.dogColour.questionPrefix': 'Jaký',
  'heroglyph.flow.dogColour.questionCoat': 'kožich',
  'heroglyph.flow.dogColour.questionSuffix': ' má tvůj pes?',
  'heroglyph.flow.dogColour.bright': 'Světlý',
  'heroglyph.flow.dogColour.brightSub': 'Slunce',
  'heroglyph.flow.dogColour.dark': 'Tmavý',
  'heroglyph.flow.dogColour.darkSub': 'Měsíc',
  'heroglyph.flow.dogColour.mix': 'Mix',
  'heroglyph.flow.dogColour.mixSub': 'Duha',
  'heroglyph.flow.dogColour.back': 'Zpět',

  // ── /heroglyph flow — krok 11: rodokmeň ──
  'heroglyph.flow.dogBloodline.infoAria': 'Info o rodokmenu psa',
  'heroglyph.flow.dogBloodline.title': 'Rodokmen',
  'heroglyph.flow.dogBloodline.questionPrefix': 'Je tvůj pes ',
  'heroglyph.flow.dogBloodline.questionPure': 'čistokrevný',
  'heroglyph.flow.dogBloodline.questionOr': ' nebo ',
  'heroglyph.flow.dogBloodline.questionWild': 'divoký',
  'heroglyph.flow.dogBloodline.questionSuffix': '?',
  'heroglyph.flow.dogBloodline.aristocrat': 'Aristokrat',
  'heroglyph.flow.dogBloodline.mutt': 'Divoch',
  'heroglyph.flow.dogBloodline.infoSignedTitle': 'Podepsaný papyrus',
  'heroglyph.flow.dogBloodline.infoSignedBody': 'Originál s rodokmenem.',
  'heroglyph.flow.dogBloodline.infoEmptyTitle': 'Prázdný papyrus',
  'heroglyph.flow.dogBloodline.infoEmptyBody': 'Originál bez rodokmenu.',
  'heroglyph.flow.dogBloodline.back': 'Zpět',

  // ── /heroglyph flow — krok 12: charakter psa ──
  'heroglyph.flow.dogCharacter.infoAria': 'Info o charakteru',
  'heroglyph.flow.dogCharacter.title': 'Charakter',
  'heroglyph.flow.dogCharacter.questionPrefix': 'Jaká je ',
  'heroglyph.flow.dogCharacter.questionWord': 'povaha',
  'heroglyph.flow.dogCharacter.questionSuffix': ' tvého psa?',
  'heroglyph.flow.dogCharacter.chooseTwo': 'Vyber dvě možnosti.',
  'heroglyph.flow.dogCharacter.infoTitle': 'Vyber vibe svého psa',
  'heroglyph.flow.dogCharacter.infoBody':
    'Vyber dvě charakterové vlastnosti, které nejlépe popisují tvého psa. Ty formují symboly uvnitř Heroglyphu.',
  'heroglyph.flow.dogCharacter.selectedCount': '{count}/2 vybráno',
  'heroglyph.flow.dogCharacter.back': 'Zpět',
  'heroglyph.flow.dogCharacter.trait.guardian': 'Strážce',
  'heroglyph.flow.dogCharacter.trait.player': 'Hráč',
  'heroglyph.flow.dogCharacter.trait.energizer': 'Hyperaktiv',
  'heroglyph.flow.dogCharacter.trait.maverick': 'Rebel',
  'heroglyph.flow.dogCharacter.trait.waterlover': 'Vodomil',
  'heroglyph.flow.dogCharacter.trait.gourmet': 'Gurmán',
  'heroglyph.flow.dogCharacter.trait.lover': 'Mazlík',
  'heroglyph.flow.dogCharacter.trait.chiller': 'Pohodář',

  // ── /heroglyph flow — krok 13: reveal ──
  'heroglyph.flow.reveal.heroglyphTitle': 'Heroglyph psa {dogName}',
  'heroglyph.flow.reveal.horizontalDesign': '↔ HORIZONTÁLNÍ DESIGN',
  'heroglyph.flow.reveal.verticalDesign': '↕ VERTIKÁLNÍ DESIGN',
  'heroglyph.flow.reveal.infoAria': 'Info',
  'heroglyph.flow.reveal.visionTitle': 'NAŠE VIZE',
  'heroglyph.flow.reveal.visionBody':
    'Abys získal svůj oficiální symbol, žádáme symbolický příspěvek. Náš plán je jednoduchý: Heroglyph pro každého psa na Zemi. Protože čím větší bude naše globální smečka, tím víc hrdinů dokážeme zachránit z ulic a útulků. Přidej se k dynastii!',
  'heroglyph.flow.reveal.welcome': 'VÍTEJ V DOGYPTU!',
  'heroglyph.flow.reveal.bond': 'Tento Heroglyph je tvoje věčné pouto.',
  'heroglyph.flow.reveal.cta': 'CHCI SVŮJ HEROGLYPH',

  // ── /heroglyph flow — krok 14: message ──
  'heroglyph.flow.message.promptPrefix': 'Zanech věčný vzkaz pro ',
  'heroglyph.flow.message.promptMid': '.',
  'heroglyph.flow.message.promptStayPrefix': 'Zůstane s ním v ',
  'heroglyph.flow.message.promptStayWord': 'dogypt',
  'heroglyph.flow.message.promptStaySuffix': ' - navždy.',
  'heroglyph.flow.message.yourMessage': 'Tvůj Vzkaz',
  'heroglyph.flow.message.placeholder':
    'Milý/Milá {dogName}, děkuji za každý den s tebou — a těším se na všechny krásné chvíle, co nás ještě čekají…',
  'heroglyph.flow.message.profileNotePrefix': 'Tento vzkaz se zobrazí na profilu tvého psa na ',
  'heroglyph.flow.message.profileNoteSite': 'DOGYPT.com',
  'heroglyph.flow.message.profileNoteSuffix': '.',
  'heroglyph.flow.message.cta': 'ZAPEČETIT VZKAZ →',

  // ── /heroglyph flow — checkout ──
  'heroglyph.checkout.orderSummary': 'Souhrn Objednávky',
  'heroglyph.checkout.dogPossessive': 'psa {dogName}',
  'heroglyph.checkout.heroglyph': 'HEROGLYPH',
  'heroglyph.checkout.yourDogFallback': 'Tvůj pes',
  'heroglyph.checkout.yourDetails': 'Tvoje Údaje',
  'heroglyph.checkout.firstName': 'Křestní jméno',
  'heroglyph.checkout.lastName': 'Příjmení',
  'heroglyph.checkout.email': 'E-mail',
  'heroglyph.checkout.country': 'Země',
  'heroglyph.checkout.cta': 'POKRAČOVAT K PLATBĚ →',
  'heroglyph.checkout.disclaimerPrefix': 'Po platbě umístíme fotku tvého psa na web a tvůj ',
  'heroglyph.checkout.disclaimerHighlight': 'DOGYPT Certifikát',
  'heroglyph.checkout.disclaimerSuffix': ' do tvého profilu.',
  'heroglyph.checkout.back': 'Zpět',
  'heroglyph.checkout.dogFallback': 'Pes',

  // ── /welcome — post-payment (WelcomeScreen) ──
  'welcome.record.title': 'NAHRAJ TENTO MOMENT',
  'welcome.record.subtitle': 'Zachyť oficiální přivítání tvého psa',
  'welcome.goal.label': 'Náš Cíl 🎯',
  'welcome.goal.target': '1 000 000 Heroglyphů',
  'welcome.congratsPrefix': 'Gratulujeme, ',
  'welcome.congratsName': '{name}.',
  'welcome.ownerFallback': 'Příteli',
  'welcome.officiallyA': 'je oficiálně',
  // MOTTO „IN DOG WE TRUST" ostáva EN; DOG/GOD slovná hračka ostáva EN.
  'welcome.missionLine1': 'Právě jsi změnil/a historii — jsme o chlup lepší!',
  'welcome.missionSpread': 'Rozšiř smečku. ',
  'welcome.missionMotto': 'IN DOG WE TRUST.',
  'welcome.cta.preparing': 'PŘIPRAVUJU TVOJE MÍSTO…',
  'welcome.cta.forging': 'KUJU TVŮJ HEROGLYPH…',
  'welcome.cta.enter': 'VSTUP MEZI BOHY →',
  'welcome.emailHint': 'Tvůj certifikát je na cestě — zkontroluj si e-mail.',

  // ── /login — magic-link callback (Login.tsx) ──
  'login.eyebrow': 'DOGYPT · Přístup do Smečky',
  'login.verifying.title': 'Otvírám bránu',
  'login.verifying.body': 'Ověřuji tvůj magic link…',
  'login.success.title': 'Vítej zpět',
  'login.success.body': 'Přesměrovávám tě do tvojí smečky…',
  'login.expired.title': 'Link vypršel',
  'login.expired.body': 'Magic linky mají krátkou platnost. Požádej o nový a pošleme ti ho do schránky.',
  'login.invalid.title': 'Link nerozpoznán',
  'login.invalid.body': 'Nepodařilo se ověřit tento link. Možná už byl použit nebo zkopírován nesprávně.',
  'login.network.title': 'Problém se spojením',
  'login.network.body': 'Nedostali jsme se do chrámu. Zkontroluj si připojení a zkus to znovu.',
  'login.missing.title': 'Token nenalezen',
  'login.missing.body': 'Tato stránka očekává magic link z e-mailu. Zkontroluj si schránku a najdi nejnovější.',
  'login.resend.idle': 'Poslat nový magic link',
  'login.resend.sending': 'Odesílám…',
  'login.resend.sent': 'Magic link odeslán',
  'login.backHome': 'Zpět domů',
  'login.homeAria': 'DOGYPT domů',

  // ── 404 — NotFound.tsx ──
  'notFound.code': '404',
  'notFound.message': 'Jejda! Stránka nenalezena',
  'notFound.returnHome': 'Zpět na úvod',
};
