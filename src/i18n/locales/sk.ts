import type { Dict } from '../LanguageContext';

/**
 * DOGYPT i18n — SK slovník. Partial<Dict>: chýbajúci kľúč ticho padne na EN.
 *
 * Brand termíny ostávajú: HEROGLYPH, Dogypt, DOGYPT.
 * „doglover" = psíčkar (konzistentne s Matejovým tónom).
 *
 * Texty = Matejova ručná úprava 2026-06-07 (prvý strojový draft prepísaný).
 * PRAVIDLO (Matej 2026-06-07): „DOG" sa v bežnom texte PREKLADÁ (→ PES), ale MOTTO
 *   sa nikdy nemení — „DOG IS GOD" / brand motto ostáva vždy EN naprieč jazykmi.
 * Vyriešené (Matej 2026-06-07): beat 1 „PES" OK (text, nie motto); beat 3 „dog-friendly";
 *   finále „áno" = malými + BOLD (zlatá, font-weight 700, nie kurzíva, nie verzálky);
 *   CTA „Staň sa Dogypťanom" OSTÁVA. /vision SK = FINÁL.
 */
export const sk: Partial<Dict> = {
  // ── /vision — hero ──
  'vision.hero.title': 'Vízia',
  'vision.hero.watch': 'Pozri Dogypt intro film',
  'vision.hero.videoTitle': 'DOGYPT intro film',
  'vision.hero.playLabel': 'Prehrať Dogypt intro film',

  // ── /vision — WHAT IF beaty ──
  // beat 0 (intro)
  'vision.beat.dream.bigW': 'MAL SOM',
  'vision.beat.dream.bigG': 'SEN',
  'vision.beat.dream.tag': 'MAL SOM SEN',
  'vision.intro.lead':
    'V roku 2018 som mal <span class="wf-hl">víziu</span>, ako <span class="wf-hl">zachrániť každého psa na Zemi</span>. Je to vlastne celkom „jednoduché" — stačí ak sa psíčkari <span class="wf-hl">spoja do jednej komunity</span>, takej, ktorá vidí psa ako <span class="wf-hl">viac než len zviera</span>. A tak sme tu…',

  // beat 1
  'vision.beat.symbol.bigW': 'NÁŠ',
  'vision.beat.symbol.bigG': 'SYMBOL',
  'vision.beat.symbol.tag': 'SYMBOL',
  'vision.beat.symbol.h':
    'Náš jazyk lásky je <span class="wf-hl">PES</span>. Ten okrem svojho bežného mena nesie aj svoj vlastný <span class="wf-hl">jedinečný symbol</span> — <span class="wf-hl">HEROGLYPH</span>. Je to <span class="wf-hl">univerzálny jazyk</span>, <span class="wf-hl">posvätný nástroj</span>, ktorý má za cieľ spojiť každého psíčkara na Zemi.',

  // beat 2
  'vision.beat.nation.bigW': 'PSÍ',
  'vision.beat.nation.bigG': 'NÁROD',
  'vision.beat.nation.tag': 'PSÍ NÁROD',
  'vision.beat.nation.h':
    'Spravme <span class="wf-hl">zázrak</span>. Náš prvý míľnik: spojiť <span class="wf-hl">milión psíčkarov</span>. Predstav si tú <span class="wf-hl">čistú silu</span>, ktorú by sme spolu mali — čo všetko by sme dokázali pre nás, naše psy a <span class="wf-hl">psy v núdzi</span>, a to nad rámec akéhokoľvek štátu. <span class="wf-hl">My by sme boli štát.</span>',

  // beat 3
  'vision.beat.temple.bigW': 'ONLINE',
  'vision.beat.temple.bigG': 'CHRÁM',
  'vision.beat.temple.tag': 'ONLINE CHRÁM',
  'vision.beat.temple.h':
    'Jedna appka, <span class="wf-hl">len pre skutočných psíčkarov</span> — žiadni falošní ľudia. Prvý <span class="wf-hl">dog-friendly digitálny svet</span> vytvorený len pre nás: sociálna sieť a ekosystém, ktorý naozaj pomáha — <span class="wf-hl">cestovanie, veterinári, služby, vzdelávanie</span> a <span class="wf-hl">zbierky</span> pre psy v núdzi na jednom mieste.',

  // beat 4
  'vision.beat.centers.bigW': 'FUNKČNÉ',
  'vision.beat.centers.bigG': 'STREDISKÁ',
  'vision.beat.centers.tag': 'FUNKČNÉ STREDISKÁ',
  'vision.beat.centers.h':
    'Starý koncept útulkov funguje len veľmi ťažko… Predstav si <span class="wf-hl">centrá po celom svete</span>, kde by psy mali svoju <span class="wf-hl">zmysluplnú prácu</span>, a ľudia, ktorí by sa im venovali, by boli <span class="wf-hl">financovaní nami</span> — starostlivosť, výcvik a výskum.',

  // beat 5
  'vision.beat.era.bigW': 'NOVÁ',
  'vision.beat.era.bigG': 'ÉRA',
  'vision.beat.era.tag': 'NOVÁ ÉRA',
  'vision.beat.era.h':
    'Nad rámec štátnych hraníc a politiky sú psíčkari <span class="wf-hl">najláskavejšou skrytou silou</span> Zeme. Len spolu dokážeme <span class="wf-hl">prebudovať systém</span>, zmeniť svet — a zanechať niečo, čo <span class="wf-hl">ochráni naše psy navždy</span>.',

  // ── /vision — finále CTA ──
  'vision.finale.title': 'Čo ak by…',
  'vision.finale.lead':
    '…každý psíčkar povedal <span style="color:#F5C73D;font-weight:700">áno</span> tomuto bláznivému nápadu?',
  'vision.finale.cta': 'Staň sa Dogypťanom',
  'vision.finale.tagline': 'Od novej éry ťa delí jeden klik.',

  // ── /heroglyph intro ──
  // hero title — case riadi CSS text-transform. SK = iba „SYMBOL," (Matej 2026-06-07);
  // mobile = 1 riadok (line2 prázdny → render vynechá <br>), desktop = „Symbol,". Číta sa
  // s sublinom „Ktorý Mení Históriu" = „Symbol, ktorý mení históriu".
  'heroglyph.intro.title.line1': 'Symbol,',
  'heroglyph.intro.title.line2': '',
  'heroglyph.intro.title.desktop': 'Symbol,',
  'heroglyph.intro.title.sub': 'Ktorý Mení Históriu',

  // dictionary blok ("DOG is GOD" = MOTTO → ostáva EN)
  'heroglyph.intro.word': 'Heroglyph',
  'heroglyph.intro.ipa': '[ˈhɪr-oʊ-ɡlɪf]',
  'heroglyph.intro.noun': 'podstatné meno',
  'heroglyph.intro.definition':
    'Unikátny symbol, ktorý opisuje teba a tvojho psa — vaše večné puto. Zároveň vstupenka do DOGYPT — miesta, kde DOG is GOD.',

  // Heroglyph slovo tooltip (motto IN DOG WE TRUST sa nikde tu nevyskytuje)
  'heroglyph.intro.wordTooltip': 'HERO = PES · GLYPH = SYMBOL',
  'heroglyph.intro.wordTooltipSub': 'BOŽSKÉ meno pre každého PSA.',

  // CTA + outro
  'heroglyph.intro.cta': 'Staň sa Dogypťanom',
  'heroglyph.intro.outro': 'Psíčkari, do zbrane!',
  'heroglyph.intro.loading': 'Načítava sa…',

  // pills rad 1
  'heroglyph.intro.pill.questions.label': '12 otázok',
  'heroglyph.intro.pill.questions.tooltip': 'Dvanásť rýchlych odpovedí o tvojom psovi.',
  'heroglyph.intro.pill.minutes.label': '3 minúty',
  'heroglyph.intro.pill.minutes.tooltip': 'Interaktívny kvíz plný zábavy.',
  'heroglyph.intro.pill.forever.label': 'Navždy na DOGYPT.com',
  'heroglyph.intro.pill.forever.tooltip':
    'Meno tvojho psa navždy v tvojom srdci — aj v digitálnom svete.',

  // pills rad 2 (MOTTO IN DOG WE TRUST ostáva EN)
  'heroglyph.intro.pill.unique.label': 'Jediný svojho druhu',
  'heroglyph.intro.pill.unique.tooltip': 'Žiadne dva heroglyfy nie sú rovnaké — každý symbol je unikátny!',
  'heroglyph.intro.pill.vow.label': 'Sľub Viery',
  'heroglyph.intro.pill.vow.tooltip': 'Tvoj znak vernosti dogyptiánskej ceste — IN DOG WE TRUST!',
  'heroglyph.intro.pill.bond.label': 'Večné Puto',
  'heroglyph.intro.pill.bond.tooltip': 'Symbol večného puta medzi tebou a tvojím psom.',
  'heroglyph.intro.pill.payment.label': 'Jedna Symbolická Platba',
  'heroglyph.intro.pill.payment.tooltip':
    '$11 raz — žiadne predplatné. Všetky peniaze ostávajú v DOGYPT — na vývoj a systematickú pomoc!',

  // showcase symbol meanings (Hekthorov heroglyf) — vlastné mená (Hekthor/Matej) NEPREKLADÁM
  'heroglyph.intro.meaning.dog.label': 'Pes',
  'heroglyph.intro.meaning.dog.value': 'Hekthor',
  'heroglyph.intro.meaning.owner.label': 'Majiteľ',
  'heroglyph.intro.meaning.owner.value': 'Matej',
  'heroglyph.intro.meaning.dogGender.label': 'Pohlavie Psa',
  'heroglyph.intro.meaning.dogGender.value': 'Kráľ',
  'heroglyph.intro.meaning.dogColour.label': 'Farba Psa',
  'heroglyph.intro.meaning.dogColour.value': 'Tmavá srsť',
  'heroglyph.intro.meaning.dogPatron.label': 'Patrón Psa',
  'heroglyph.intro.meaning.dogPatron.value': 'Hekthor',
  'heroglyph.intro.meaning.dogOrigin.label': 'Pôvod Psa',
  'heroglyph.intro.meaning.dogOrigin.value': 'Zachránený',
  'heroglyph.intro.meaning.dogBloodline.label': 'Pôvodová Línia',
  'heroglyph.intro.meaning.dogBloodline.value': 'Kríženec',
  'heroglyph.intro.meaning.dogCharacter1.label': 'Charakter Psa I',
  'heroglyph.intro.meaning.dogCharacter1.value': 'Obľúbené frisbee',
  'heroglyph.intro.meaning.dogCharacter2.label': 'Charakter Psa II',
  'heroglyph.intro.meaning.dogCharacter2.value': 'Milovník vody',
  'heroglyph.intro.meaning.ownerGender.label': 'Pohlavie Majiteľa',
  'heroglyph.intro.meaning.ownerGender.value': 'Muž',
  'heroglyph.intro.meaning.westernZodiac.label': 'Západný Zverokruh',
  'heroglyph.intro.meaning.westernZodiac.value': 'Lev',
  'heroglyph.intro.meaning.chineseZodiac.label': 'Čínsky Zverokruh',
  'heroglyph.intro.meaning.chineseZodiac.value': 'Kohút',
  'heroglyph.intro.meaning.ownerInitial.label': 'Iniciála Majiteľa',
  'heroglyph.intro.meaning.ownerInitial.value': 'Matej',
  'heroglyph.intro.meaning.ranking.label': 'Poradie',
  'heroglyph.intro.meaning.ranking.value': '#1 — Prvý pes',

  // ── /heroglyph flow — krok 1: meno ──
  'heroglyph.flow.name.greetingPrefix': 'Ahoj, ja som',
  'heroglyph.flow.name.greetingQuestion': 'Ako sa volá tvoj pes?',
  'heroglyph.flow.name.placeholder': 'Napíš meno svojho psa…',
  'heroglyph.flow.name.birthday': 'Kedy sa tvoj pes narodil?',
  'heroglyph.flow.name.continue': 'Pokračovať',
  'heroglyph.flow.name.infoAria': 'Info o Hekthorovi',
  'heroglyph.flow.name.whoTitle': 'KTO JE',
  'heroglyph.flow.name.whoTitleName': 'HEKTHOR?',
  'heroglyph.flow.name.whoBody':
    'Hekthor je zakladajúci hrdina a duša DOGYPT. Zachránený z útulku, jeho vernosť inšpirovala globálne hnutie, ktoré uctieva psov ako bohov. Jeho misiou je vytvoriť jedinečný HEROGLYPH pre každého psa na Zemi a zjednotiť najväčšiu komunitu psíčkarov na svete, aby pomohla miliónom psov v núdzi.',
  'heroglyph.flow.name.born': 'Narodený',
  'heroglyph.flow.name.adopted': 'Adoptovaný',
  'heroglyph.flow.name.location': 'Miesto',
  'heroglyph.flow.name.locationValue': 'Slovensko, EÚ',

  // ── /heroglyph flow — krok 2: foto ──
  'heroglyph.flow.photo.faceOfGodPrefix': '',
  'heroglyph.flow.photo.faceOfGodWord': 'TVÁR',
  'heroglyph.flow.photo.faceOfGodSuffix': 'BOHA',
  'heroglyph.flow.photo.uploadHint': 'Nahraj jasnú fotku {dogName} — navždy ju zapečatíme do jeho Heroglyphu.',
  'heroglyph.flow.photo.yourDog': 'svojho psa',
  'heroglyph.flow.photo.tapToUpload': 'Klikni pre nahratie',
  'heroglyph.flow.photo.changePhoto': 'Zmeniť fotku',
  'heroglyph.flow.photo.sealing': 'Pečatím do večnosti…',
  'heroglyph.flow.photo.sealed': '✓ Zapečatené',
  'heroglyph.flow.photo.uploadFailed': 'Nahratie zlyhalo — skús znova',
  'heroglyph.flow.photo.tipForward': 'pes čelom',
  'heroglyph.flow.photo.tipSide': 'z profilu / skupina',
  'heroglyph.flow.photo.tipBest': 'Najlepší výsledok: tvár jasne viditeľná, funguje orezaná do kruhu.',
  'heroglyph.flow.photo.next': 'ĎALEJ →',
  'heroglyph.flow.photo.back': '← SPÄŤ',
  'heroglyph.flow.photo.adjustTitle': 'UPRAV SVOJ PORTRÉT',
  'heroglyph.flow.photo.adjustHint': 'Ťahaním umiestni psa do rámu.',
  'heroglyph.flow.photo.moreTitle': 'VIAC TVÁRÍ BOHA',
  'heroglyph.flow.photo.moreHint': 'Pridaj 1–3 ďalšie fotky pre prekvapenia neskôr. (voliteľné)',
  'heroglyph.flow.photo.saving': 'UKLADÁM…',

  // ── /heroglyph flow — krok 3: rasa ──
  'heroglyph.flow.breed.question': 'Povedz, akej rasy je tvoj hrdina?',
  'heroglyph.flow.breed.searchPlaceholder': 'Hľadaj rasu…',
  'heroglyph.flow.breed.continue': 'Pokračovať',
  'heroglyph.flow.breed.cat.01': 'Chlpáči',
  'heroglyph.flow.breed.cat.02': 'Vlnáči',
  'heroglyph.flow.breed.cat.03': 'Antény',
  'heroglyph.flow.breed.cat.04': 'Šprintéri',
  'heroglyph.flow.breed.cat.05': 'Ňuchači',
  'heroglyph.flow.breed.cat.06': 'Aristokrati',
  'heroglyph.flow.breed.cat.07': 'Čapatí',
  'heroglyph.flow.breed.cat.08': 'Špliechači',
  'heroglyph.flow.breed.cat.09': 'Vĺčkovia',
  'heroglyph.flow.breed.cat.10': 'Obri',

  // ── /heroglyph flow — krok 4: poradie ──
  'heroglyph.flow.ranking.question': 'Je {dogName} tvoj prvý pes?',
  'heroglyph.flow.ranking.yourPup': 'tvoj pes',
  'heroglyph.flow.ranking.yesLabel': 'ÁNO, moja prvá láska',
  'heroglyph.flow.ranking.noLabel': 'NIE, psíčkar navždy!',
  'heroglyph.flow.ranking.whichDog': 'Koľký pes je {dogName}?',
  'heroglyph.flow.ranking.range': '11–50',
  'heroglyph.flow.ranking.enterNumber': 'Zadaj číslo psa (11–50)',
  'heroglyph.flow.ranking.continue': 'Pokračovať',
  'heroglyph.flow.ranking.back': 'Späť',

  // ── /heroglyph flow — krok 5: majiteľ ──
  'heroglyph.flow.ownerInfo.greetingPrefix': 'Tak, poďme sa porozprávať o tebe,',
  'heroglyph.flow.ownerInfo.greetingWord': 'človeče',
  'heroglyph.flow.ownerInfo.placeholder': 'Krstné meno majiteľa…',
  'heroglyph.flow.ownerInfo.man': 'Muž',
  'heroglyph.flow.ownerInfo.woman': 'Žena',
  'heroglyph.flow.ownerInfo.continue': 'Pokračovať',
  'heroglyph.flow.ownerInfo.back': 'Späť',

  // ── /heroglyph flow — spoločné ──
  'heroglyph.flow.yourDogFallback': 'TVOJHO PSA',
  'heroglyph.flow.dogHeroglyphTitle': 'HEROGLYPH PSA {dogName}',

  // ── /heroglyph flow — krok 6: zverokruh majiteľa ──
  'heroglyph.flow.ownerZodiac.question': 'Čo o tebe hovoria hviezdy?',
  'heroglyph.flow.ownerZodiac.westernLabel': 'Znamenie Zverokruhu',
  'heroglyph.flow.ownerZodiac.chineseLabel': 'Čínsky Zverokruh',
  'heroglyph.flow.ownerZodiac.continue': 'Pokračovať',
  'heroglyph.flow.ownerZodiac.back': 'Späť',
  // znamenia zverokruhu (iba label — hodnota enumu ostáva anglická)
  'heroglyph.flow.ownerZodiac.sign.Aries': 'Baran',
  'heroglyph.flow.ownerZodiac.sign.Taurus': 'Býk',
  'heroglyph.flow.ownerZodiac.sign.Gemini': 'Blíženci',
  'heroglyph.flow.ownerZodiac.sign.Cancer': 'Rak',
  'heroglyph.flow.ownerZodiac.sign.Leo': 'Lev',
  'heroglyph.flow.ownerZodiac.sign.Virgo': 'Panna',
  'heroglyph.flow.ownerZodiac.sign.Libra': 'Váhy',
  'heroglyph.flow.ownerZodiac.sign.Scorpio': 'Škorpión',
  'heroglyph.flow.ownerZodiac.sign.Sagittarius': 'Strelec',
  'heroglyph.flow.ownerZodiac.sign.Capricorn': 'Kozorožec',
  'heroglyph.flow.ownerZodiac.sign.Aquarius': 'Vodnár',
  'heroglyph.flow.ownerZodiac.sign.Pisces': 'Ryby',
  // čínsky zverokruh (iba label — hodnota enumu ostáva anglická)
  'heroglyph.flow.ownerZodiac.animal.Monkey': 'Opica',
  'heroglyph.flow.ownerZodiac.animal.Rooster': 'Kohút',
  'heroglyph.flow.ownerZodiac.animal.Dog': 'Pes',
  'heroglyph.flow.ownerZodiac.animal.Pig': 'Prasa',
  'heroglyph.flow.ownerZodiac.animal.Rat': 'Potkan',
  'heroglyph.flow.ownerZodiac.animal.Ox': 'Vôl',
  'heroglyph.flow.ownerZodiac.animal.Tiger': 'Tiger',
  'heroglyph.flow.ownerZodiac.animal.Rabbit': 'Zajac',
  'heroglyph.flow.ownerZodiac.animal.Dragon': 'Drak',
  'heroglyph.flow.ownerZodiac.animal.Snake': 'Had',
  'heroglyph.flow.ownerZodiac.animal.Horse': 'Kôň',
  'heroglyph.flow.ownerZodiac.animal.Goat': 'Koza',

  // ── /heroglyph flow — krok 7: finále majiteľa ──
  'heroglyph.flow.ownerFinal.infoAria': 'Info o Heroglyphe',
  'heroglyph.flow.ownerFinal.messageLine1': 'ČLOVEČE, tvoja časť je hotová.',
  'heroglyph.flow.ownerFinal.messageLine2': 'Ten malý rámik — to si ty!',
  'heroglyph.flow.ownerFinal.messageLine3Prefix': 'Teraz dokončme celý HEROGLYPH a časť patriacu pre',
  'heroglyph.flow.ownerFinal.messageLine3Suffix': '.',
  'heroglyph.flow.ownerFinal.cta': 'POĎME NA TO',
  'heroglyph.flow.ownerFinal.infoTitle': 'INŠPIROVANÉ STAROVEKÝM EGYPTOM',
  'heroglyph.flow.ownerFinal.infoBody':
    'HEROGLYPH sa skladá z dvoch rámikov, ktoré spolu tvoria pravú identitu tvojho psa. V starovekom Egypte sa mená bohov či faraónov vpisovali do podobných ochranných oválnych rámikov — kartuší — aby ich odkaz pretrval naveky.',
  'heroglyph.flow.ownerFinal.cleopatraAlt': 'Kleopatrina kartuša',
  'heroglyph.flow.ownerFinal.cleopatraCaption': 'Tento hieroglyf patrí Kleopatre.',
  'heroglyph.flow.ownerFinal.back': 'Späť',

  // ── /heroglyph flow — krok 8: pohlavie psa ──
  'heroglyph.flow.dogGender.infoAria': 'Info o pohlaví psa',
  'heroglyph.flow.dogGender.title': 'Pohlavie Psa',
  'heroglyph.flow.dogGender.questionPrefix': 'Máš doma',
  'heroglyph.flow.dogGender.questionKing': 'kráľa',
  'heroglyph.flow.dogGender.questionOr': 'alebo',
  'heroglyph.flow.dogGender.questionQueen': 'kráľovnú',
  'heroglyph.flow.dogGender.questionSuffix': '?',
  'heroglyph.flow.dogGender.king': 'Kráľ',
  'heroglyph.flow.dogGender.queen': 'Kráľovná',
  'heroglyph.flow.dogGender.info3Title': 'Trojcípa koruna',
  'heroglyph.flow.dogGender.info3Body':
    'Pre chlapcov, čo zvládli balans na 3 labkách. Jedna noha hore, maximálna presnosť, absolútna legenda.',
  'heroglyph.flow.dogGender.info4Title': 'Štvorcípa koruna',
  'heroglyph.flow.dogGender.info4Body':
    'Pre dievčatá, čo majú radšej stabilitu na 4 labkách. Maximálne pohodlie, žiadny chaos, totálna elegancia.',
  'heroglyph.flow.dogGender.back': 'Späť',

  // ── /heroglyph flow — krok 9: osud psa ──
  'heroglyph.flow.dogFate.infoAria': 'Info o pôvode psa',
  'heroglyph.flow.dogFate.title': 'Pôvod',
  'heroglyph.flow.dogFate.questionPrefix': 'Narodil sa tvoj pes do',
  'heroglyph.flow.dogFate.questionSafe': 'bezpečného domova',
  'heroglyph.flow.dogFate.questionOr': 'alebo dostal',
  'heroglyph.flow.dogFate.questionSecond': 'druhú šancu',
  'heroglyph.flow.dogFate.questionSuffix': ' v živote?',
  'heroglyph.flow.dogFate.raised': 'Vychovaný',
  'heroglyph.flow.dogFate.rescued': 'Zachránený',
  'heroglyph.flow.dogFate.infoRaisedTitle': 'Cumlík',
  'heroglyph.flow.dogFate.infoRaisedBody': 'Pes, ktorý sa narodil do rodiny. Vychovávaný s láskou od prvého dňa.',
  'heroglyph.flow.dogFate.infoRescuedTitle': 'Záchranný kruh',
  'heroglyph.flow.dogFate.infoRescuedBody': 'Zachránený alebo nájdený pes. Dostal druhú šancu v živote.',
  'heroglyph.flow.dogFate.back': 'Späť',

  // ── /heroglyph flow — krok 10: farba psa ──
  'heroglyph.flow.dogColour.title': 'Farba Psa',
  'heroglyph.flow.dogColour.questionPrefix': 'Aký',
  'heroglyph.flow.dogColour.questionCoat': 'kožuch',
  'heroglyph.flow.dogColour.questionSuffix': ' má tvoj pes?',
  'heroglyph.flow.dogColour.bright': 'Svetlý',
  'heroglyph.flow.dogColour.brightSub': 'Slnko',
  'heroglyph.flow.dogColour.dark': 'Tmavý',
  'heroglyph.flow.dogColour.darkSub': 'Mesiac',
  'heroglyph.flow.dogColour.mix': 'Mix',
  'heroglyph.flow.dogColour.mixSub': 'Dúha',
  'heroglyph.flow.dogColour.back': 'Späť',

  // ── /heroglyph flow — step 11: dog-bloodline ──
  'heroglyph.flow.dogBloodline.infoAria': 'Info o rodokmeni psa',
  'heroglyph.flow.dogBloodline.title': 'Rodokmeň',
  'heroglyph.flow.dogBloodline.questionPrefix': 'Je tvoj pes ',
  'heroglyph.flow.dogBloodline.questionPure': 'čistokrvný',
  'heroglyph.flow.dogBloodline.questionOr': ' alebo ',
  'heroglyph.flow.dogBloodline.questionWild': 'divoký',
  'heroglyph.flow.dogBloodline.questionSuffix': '?',
  'heroglyph.flow.dogBloodline.aristocrat': 'Aristokrat',
  'heroglyph.flow.dogBloodline.mutt': 'Divoch',
  'heroglyph.flow.dogBloodline.infoSignedTitle': 'Podpísaný papyrus',
  'heroglyph.flow.dogBloodline.infoSignedBody': 'Originál s rodokmeňom.',
  'heroglyph.flow.dogBloodline.infoEmptyTitle': 'Prázdny papyrus',
  'heroglyph.flow.dogBloodline.infoEmptyBody': 'Originál bez rodokmeňu.',
  'heroglyph.flow.dogBloodline.back': 'Späť',

  // ── /heroglyph flow — step 12: dog-character ──
  'heroglyph.flow.dogCharacter.infoAria': 'Info o charaktere',
  'heroglyph.flow.dogCharacter.title': 'Charakter',
  'heroglyph.flow.dogCharacter.questionPrefix': 'Aká je ',
  'heroglyph.flow.dogCharacter.questionWord': 'povaha',
  'heroglyph.flow.dogCharacter.questionSuffix': ' tvojho psa?',
  'heroglyph.flow.dogCharacter.chooseTwo': 'Vyber dve možnosti.',
  'heroglyph.flow.dogCharacter.infoTitle': 'Vyber vibe svojho psa',
  'heroglyph.flow.dogCharacter.infoBody':
    'Vyber dve charakterové vlastnosti, ktoré najlepšie opisujú tvojho psa. Tie formujú symboly vo vnútri Heroglyphu.',
  'heroglyph.flow.dogCharacter.selectedCount': '{count}/2 vybraté',
  'heroglyph.flow.dogCharacter.back': 'Späť',
  'heroglyph.flow.dogCharacter.trait.guardian': 'Strážca',
  'heroglyph.flow.dogCharacter.trait.player': 'Hravý',
  'heroglyph.flow.dogCharacter.trait.energizer': 'Hyperaktívny',
  'heroglyph.flow.dogCharacter.trait.maverick': 'Rebel',
  'heroglyph.flow.dogCharacter.trait.waterlover': 'Vodomil',
  'heroglyph.flow.dogCharacter.trait.gourmet': 'Gurmán',
  'heroglyph.flow.dogCharacter.trait.lover': 'Maznáčik',
  'heroglyph.flow.dogCharacter.trait.chiller': 'Pohodár',

  // ── /heroglyph flow — step 13: reveal ──
  'heroglyph.flow.reveal.heroglyphTitle': 'Heroglyph psa {dogName}',
  'heroglyph.flow.reveal.horizontalDesign': '↔ HORIZONTÁLNY DIZAJN',
  'heroglyph.flow.reveal.verticalDesign': '↕ VERTIKÁLNY DIZAJN',
  'heroglyph.flow.reveal.infoAria': 'Info',
  'heroglyph.flow.reveal.visionTitle': 'NAŠA VÍZIA',
  'heroglyph.flow.reveal.visionBody':
    'Aby si si nárokoval svoj oficiálny symbol, žiadame symbolický príspevok. Náš plán je jednoduchý: Heroglyph pre každého psa na Zemi. Pretože čím väčšia bude naša globálna svorka, tým viac hrdinov dokážeme zachrániť z ulíc a útulkov. Pripoj sa k dynastii!',
  'heroglyph.flow.reveal.welcome': 'VITAJ V DOGYPTE!',
  'heroglyph.flow.reveal.bond': 'Tento Heroglyph je tvoje večné puto.',
  'heroglyph.flow.reveal.cta': 'CHCEM SVOJ HEROGLYPH',

  // ── /heroglyph flow — step 14: message ──
  'heroglyph.flow.message.promptPrefix': 'Zanechaj večný odkaz pre ',
  'heroglyph.flow.message.promptMid': '.',
  'heroglyph.flow.message.promptStayPrefix': 'Ostane s ním v ',
  'heroglyph.flow.message.promptStayWord': 'dogypt',
  'heroglyph.flow.message.promptStaySuffix': ' - navždy.',
  'heroglyph.flow.message.yourMessage': 'Tvoj Odkaz',
  'heroglyph.flow.message.placeholder':
    'Milý/Milá {dogName}, ďakujem za každú sekundu, ktorú som mal/a to šťastie stráviť po tvojom boku…',
  'heroglyph.flow.message.profileNotePrefix': 'Tento odkaz sa zobrazí na profile tvojho psa na ',
  'heroglyph.flow.message.profileNoteSite': 'DOGYPT.com',
  'heroglyph.flow.message.profileNoteSuffix': '.',
  'heroglyph.flow.message.cta': 'ZAPEČATIŤ ODKAZ →',

  // ── /heroglyph flow — checkout ──
  'heroglyph.checkout.orderSummary': 'Súhrn Objednávky',
  'heroglyph.checkout.dogPossessive': 'psa {dogName}',
  'heroglyph.checkout.heroglyph': 'HEROGLYPH',
  'heroglyph.checkout.yourDogFallback': 'Tvoj pes',
  'heroglyph.checkout.yourDetails': 'Tvoje Údaje',
  'heroglyph.checkout.firstName': 'Krstné meno',
  'heroglyph.checkout.lastName': 'Priezvisko',
  'heroglyph.checkout.email': 'E-mail',
  'heroglyph.checkout.country': 'Krajina',
  'heroglyph.checkout.cta': 'POKRAČOVAŤ NA PLATBU →',
  'heroglyph.checkout.disclaimerPrefix': 'Po platbe ti pošleme ',
  'heroglyph.checkout.disclaimerHighlight': 'DOGYPT Certifikát',
  'heroglyph.checkout.disclaimerSuffix': ' a umiestnime fotku tvojho psa na web.',
  'heroglyph.checkout.back': 'Späť',
  'heroglyph.checkout.dogFallback': 'Pes',

  // ── /welcome — post-payment (WelcomeScreen) ──
  'welcome.record.title': 'NAHRAJ TENTO MOMENT',
  'welcome.record.subtitle': 'Zachyť oficiálne privítanie tvojho psa',
  'welcome.goal.label': 'Náš Cieľ 🎯',
  'welcome.goal.target': '1 000 000 Heroglyphov',
  'welcome.congratsPrefix': 'Gratulujeme, ',
  'welcome.congratsName': '{name}.',
  'welcome.ownerFallback': 'Priateľu',
  'welcome.officiallyA': 'je oficiálne',
  // MOTTO „IN DOG WE TRUST" ostáva EN; DOG/GOD slovná hračka ostáva EN.
  'welcome.missionLine1': 'Práve si zmenil/a históriu — sme o chlp lepší!',
  'welcome.missionSpread': 'Rozšír svorku. ',
  'welcome.missionMotto': 'IN DOG WE TRUST.',
  'welcome.cta.preparing': 'PRIPRAVUJEM TVOJE MIESTO…',
  'welcome.cta.forging': 'KUJEM TVOJ HEROGLYPH…',
  'welcome.cta.enter': 'VSTÚP MEDZI BOHOV →',
  'welcome.emailHint': 'Tvoj certifikát je na ceste — skontroluj si e-mail.',

  // ── /login — magic-link callback (Login.tsx) ──
  'login.eyebrow': 'DOGYPT · Prístup do Svorky',
  'login.verifying.title': 'Otváram bránu',
  'login.verifying.body': 'Overujem tvoj magic link…',
  'login.success.title': 'Vitaj späť',
  'login.success.body': 'Presmerovávam ťa do tvojej svorky…',
  'login.expired.title': 'Link expiroval',
  'login.expired.body': 'Magic linky majú krátku platnosť. Požiadaj o nový a pošleme ti ho do schránky.',
  'login.invalid.title': 'Link nerozpoznaný',
  'login.invalid.body': 'Nedokázali sme overiť tento link. Možno bol už použitý alebo skopírovaný nesprávne.',
  'login.network.title': 'Problém so spojením',
  'login.network.body': 'Nedostali sme sa do chrámu. Skontroluj si pripojenie a skús znova.',
  'login.missing.title': 'Token nenájdený',
  'login.missing.body': 'Táto stránka očakáva magic link z e-mailu. Skontroluj si schránku a nájdi najnovší.',
  'login.resend.idle': 'Poslať nový magic link',
  'login.resend.sending': 'Odosielam…',
  'login.resend.sent': 'Magic link odoslaný',
  'login.backHome': 'Späť domov',
  'login.homeAria': 'DOGYPT domov',

  // ── 404 — NotFound.tsx ──
  'notFound.code': '404',
  'notFound.message': 'Hups! Stránka sa nenašla',
  'notFound.returnHome': 'Späť na úvod',
};
