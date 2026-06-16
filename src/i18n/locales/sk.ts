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
  'heroglyph.intro.cta': 'Vytvor svoj Heroglyph',
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
    '€11 raz — žiadne predplatné. Všetky peniaze ostávajú v DOGYPT — na vývoj a systematickú pomoc!',

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
  'heroglyph.flow.name.greetingQuestion': 'Ako sa volá tvoj psík?',
  'heroglyph.flow.name.placeholder': 'Napíš meno svojho psa…',
  'heroglyph.flow.name.birthday': 'Kedy sa tvoj pes narodil?',
  'heroglyph.flow.name.continue': 'Pokračovať',
  'heroglyph.flow.name.infoAria': 'Info o Hekthorovi',
  'heroglyph.flow.name.whoTitle': 'KTO JE',
  'heroglyph.flow.name.whoTitleName': 'HEKTHOR?',
  'heroglyph.flow.name.whoBody':
    'Hekthor je prvý Dogypťan. Zachránený z ulice a adoptovaný z útulku, jeho vernosť a láska inšpirovala globálne hnutie, ktoré uctieva psov ako bohov. Jeho misiou je vyrobiť jedinečný HEROGLYPH pre každého psa na Zemi a zjednotiť najväčšiu komunitu psíčkarov, ktorá pomôže miliónom psov v núdzi.',
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
  'heroglyph.flow.breed.enHint': 'Začni písať rasu po anglicky',
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
  'heroglyph.flow.ranking.noLabel': 'NIE, mal som ich viac',
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
  'heroglyph.flow.dogFate.infoRescuedTitle': 'Záchranné koleso',
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
    'Vyber dve charakterové vlastnosti, ktoré najlepšie opisujú tvojho psa.',
  'heroglyph.flow.dogCharacter.selectedCount': '{count}/2 vybraté',
  'heroglyph.flow.dogCharacter.back': 'Späť',
  'heroglyph.flow.dogCharacter.trait.guardian': 'Strážca',
  'heroglyph.flow.dogCharacter.trait.player': 'Hráč',
  'heroglyph.flow.dogCharacter.trait.energizer': 'Hyperaktív',
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
    'Milý/Milá {dogName}, ďakujem za každý deň s tebou — a teším sa na všetky krásne chvíle, čo nás ešte čakajú…',
  'heroglyph.flow.message.profileNotePrefix': 'Tento odkaz sa zobrazí na profile tvojho psa na ',
  'heroglyph.flow.message.profileNoteSite': 'DOGYPT.com',
  'heroglyph.flow.message.profileNoteSuffix': '.',
  'heroglyph.flow.message.cta': 'ZAPEČATIŤ ODKAZ →',
  'heroglyph.flow.message.done': 'Hotovo',

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
  'heroglyph.checkout.disclaimerPrefix': 'Po platbe umiestnime fotku tvojho psa na web a tvoj ',
  'heroglyph.checkout.disclaimerHighlight': 'DOGYPT Certifikát',
  'heroglyph.checkout.disclaimerSuffix': ' do tvojho profilu.',
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
  'welcome.emailHint': 'Ďakujeme, vďaka tebe je DOGYPT o chlp lepší.',
  // password step (set-pack-password flow)
  'welcome.password.title': 'Tvoje konto: {email}',
  'welcome.password.placeholder': 'Heslo (min. 8 znakov)',
  'welcome.password.confirm': 'Potvrď heslo',
  'welcome.password.submit': 'Nastaviť heslo & vstúpiť',
  'welcome.password.processing': 'Nastavujem heslo…',
  'welcome.password.mismatch': 'Heslá sa nezhodujú.',
  'welcome.password.tooShort': 'Heslo musí mať aspoň 8 znakov.',
  'welcome.password.notPaid': 'Platba sa ešte spracováva — skús za chvíľu.',
  'welcome.password.error': 'Niečo sa nepodarilo. Skús znova.',
  'welcome.password.altLink': 'Radšej link? Je v tvojom e-maile.',

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
  'login.missing.title': 'Prihlásenie',
  'login.missing.body': 'Prihlás sa e-mailom a heslom, alebo si nechaj poslať magic link.',
  // status: recovery
  'login.recovery.title': 'Nastaviť nové heslo',
  'login.recovery.body': 'Vyber nové heslo pre svoje konto.',
  'login.resend.idle': 'Poslať nový magic link',
  'login.resend.sending': 'Odosielam…',
  'login.resend.sent': 'Magic link odoslaný',
  'login.backHome': 'Späť domov',
  'login.homeAria': 'DOGYPT domov',
  // password login form
  'login.password.placeholder': 'Heslo',
  'login.password.submit': 'Prihlásiť sa',
  'login.password.submitting': 'Prihlasujem…',
  'login.password.error': 'Nesprávny e-mail alebo heslo.',
  'login.password.networkError': 'Chyba spojenia. Skús znova.',
  'login.password.forgotPassword': 'Zabudol/a si heslo?',
  'login.password.magicLinkAlt': 'Radšej pošli mi link',
  // magic link form (secondary)
  'login.magicLink.placeholder': 'tvoj@email.com',
  'login.magicLink.submit': 'Poslať magic link',
  'login.magicLink.submitting': 'Odosielam…',
  'login.magicLink.sent': 'Magic link odoslaný — skontroluj schránku.',
  // forgot password
  'login.forgot.prompt': 'Zadaj e-mail na resetovanie hesla.',
  'login.forgot.placeholder': 'tvoj@email.com',
  'login.forgot.submit': 'Poslať reset link',
  'login.forgot.submitting': 'Odosielam…',
  'login.forgot.sent': 'Skontroluj schránku pre reset.',
  'login.forgot.back': 'Späť na prihlásenie',
  // recovery form
  'login.recovery.newPasswordPlaceholder': 'Nové heslo (min. 8 znakov)',
  'login.recovery.submit': 'Nastaviť nové heslo',
  'login.recovery.submitting': 'Ukladám…',
  'login.recovery.success': 'Heslo aktualizované — prihlasujem ťa…',

  // ── 404 — NotFound.tsx ──
  'notFound.code': '404',
  'notFound.message': 'Hups! Stránka sa nenašla',
  'notFound.returnHome': 'Späť na úvod',

  // ── /about — opening (origin + Star Wars crawl) ──
  'about.origin.title': 'Pôvod',
  'about.origin.sub': 'Potiahni a čítaj',
  'about.origin.skip': 'alebo preskočiť',
  'about.crawl.intro': 'Pred desiatimi rokmi, v útulku v srdci Európy….',
  'about.crawl.episode': 'Epizóda I',
  'about.crawl.faith': 'Nová viera',
  'about.crawl.p1':
    'V roku 2016 prišlo do útulku osem čiernych šteniat, pohodených v jednej krabici. Sedem si našlo domov. Toho najväčšieho nikto nechcel — čakal celý rok. Volal sa Hekthor.',
  'about.crawl.p2':
    'Jedného dňa prišiel do útulku pár pozrieť si Sindy, malú bielu fenku, ktorú si chceli adoptovať. Čírou náhodou bol vtedy Hekthor v jej koterci — ten jeho práve čistili. Muž, ktorý prišiel len odviezť ostatných a psa nikdy nechcel, sa zamiloval do čierneho psa, ktorého videl úplne prvýkrát.',
  'about.crawl.p3':
    'O týždeň neskôr boli spolu a začal sa krásny príbeh. Mužovi sa zmenil celý život a časom pochopil jedno: naozaj pomôcť psom v núdzi dokáže len ten, kto psa má a vie, aké je to cítiť psiu lásku.',
  'about.crawl.p4':
    'A tak sa zrodil Heroglyph — symbol, ktorý má zjednotiť psíčkarov všade na svete do najväčšej komunity, akú svet kedy poznal. Komunity, ktorá sa postaví za nás, za naše psy aj za generácie, čo prídu — za ľudí, ktorí sa neboja priznať, že pes nie je len zviera, ale bytosť, ktorá z nás robí lepších ľudí.',
  'about.crawl.p5':
    'Práve teraz sa začína cesta k prvému míľniku — vytvoriť 1 000 000 Heroglyphov. A ty môžeš byť pri tom. Lebo svet menia jedine tí, čo sú dosť blázniví veriť, že to dokážu.',
  'about.crawl.p6': 'IN DOG WE TRUST.',

  // ── /about — timeline (5 míľnikov) ──
  'about.timeline.heading': 'Príbeh Dogyptu',
  'about.milestone.1.year': '2017',
  'about.milestone.1.tag': 'Útulok',
  'about.milestone.1.title': 'Poklad v útulku',
  'about.milestone.1.body':
    'Za plotom útulku čakal čierny pes, ktorého nikto nechcel. Dostal meno Hekthor. Adoptovať si ho nebola záchrana — bol to začiatok všetkého.',
  'about.milestone.2.year': '2018',
  'about.milestone.2.tag': 'Puto',
  'about.milestone.2.title': 'Puto navždy',
  'about.milestone.2.body':
    'Previedol ma najťažším úsekom môjho života bez jediného slova. Každý psíčkar to pozná — podržia ťa presne vtedy, keď padáš.',
  'about.milestone.3.year': '2019',
  'about.milestone.3.tag': 'Cesta',
  'about.milestone.3.title': 'Cesta, z ktorej sa stala kniha',
  'about.milestone.3.body':
    'Spolu sme prešli celé Slovensko — 42 dní, 800 kilometrov, jeden tichý sľub. Z tej cesty vznikla kniha: „Cesta s Hrdinom".',
  'about.milestone.4.year': '2022',
  'about.milestone.4.tag': 'Meno',
  'about.milestone.4.title': 'Národ psíčkarov',
  'about.milestone.4.body':
    'Pyramídy, mystika, večná sláva Egypta — ľudstvo to fascinuje už tisícročia. Spoj to s nekonečnou psou láskou a vznikne DOGYPT. Nápad som si osobne odobril na Expo Dubai 2022 — oblečený ako faraón.',
  'about.milestone.5.year': 'Teraz',
  'about.milestone.5.tag': 'Dogypt',
  'about.milestone.5.title': 'Cesta sa začína tebou',
  'about.milestone.5.body':
    'DOGYPT je hnutie pre každého, komu pes zmenil život. Postavené na najstaršom a najúprimnejšom pute na Zemi. Hekthor je zakladateľ #1. Ty si ďalší.',

  // ── /about — outro + reel ──
  'about.outro.quoteLead': 'Nikdy to nebol',
  'about.outro.quoteTail': '„len pes."',
  'about.outro.body':
    'Ten pocit už poznáš — že pes nie je niečo, čo vlastníš, ale <strong>niekto, koho miluješ</strong>. A teraz si predstav tú lásku zorganizovanú, prepojenú, <strong>dosť silnú na to, aby menila veci.</strong> A práve preto existuje <strong>DOGYPT</strong>.',
  'about.outro.name1': 'Matej',
  'about.outro.and': 'a',
  'about.outro.name2': 'Hekthor',
  'about.outro.cta': 'Staň sa Dogypťanom',
  'about.reel.prev': 'Predošlá fotka',
  'about.reel.next': 'Ďalšia fotka',

  // ── /religion — hero hook (krava vs pes) ──
  'religion.hook.number': '1,2',
  'religion.hook.billion': 'MILIARDY',
  'religion.hook.people': 'ĽUDÍ',
  'religion.hook.note': '(15 % sveta)',
  'religion.hook.bow': 'sa klania krave',
  'religion.hook.doglovers': 'PSÍČKARI?',
  'religion.hook.worship': 'KLAŇAJME SA SVOJIM PSOM.',
  'religion.cta': 'Staň sa Dogypťanom',
  'religion.aria.question': 'Otázka',
  'religion.aria.preamble': 'Preambula',
  'religion.aria.sacredIndex': 'Posvätný index',
  'religion.aria.scrollDown': 'Posunúť nadol',

  // ── /religion — preambula (preklad doslovne z canonical ústavy) ──
  'religion.preamble.text':
    'My, národ psíčkarov — vnímajúc <strong>nekonečnú oddanosť</strong>, <strong>pravú lásku</strong> a <strong>čistú dušu</strong> každého psa na svete — aby sme upevnili postavenie psov v ľudskej spoločnosti, vytvorili im <strong>podpornú komunitu</strong>, <strong>zlepšili</strong> im životy a <strong>zmenili</strong> osud každého psa v núdzi, dávame si túto ústavu.',
  'religion.preamble.oath': 'Prísaha svorky',

  // ── /religion — sacred index ──
  'religion.bookTitle': '„Biblia" pre psíčkarov',

  // ── /religion — Constitution book ──
  'religion.book.sealAlt': 'Dogyptská pečať',
  'religion.book.sub': 'Povinné čítanie pre každého psíčkara, ktorý sa chce stať Dogypťanom.',
  'religion.book.cta1.kicker': 'Cesta sa začína',
  'religion.book.cta1.head': 'Pridaj sa k<br />náboženstvu',
  'religion.book.cta1.text': 'Prihlás sa do psieho náboženstva — vezmi si Heroglyph.',
  'religion.book.cta1.btn': 'Staň sa Dogypťanom',
  'religion.book.cta2.kicker': 'Celé slovo',
  'religion.book.cta2.head': 'Prečítaj si<br />ústavu',
  'religion.book.cta2.text': 'Každý kánon, krédo a prikázanie — v plnom znení.',
  'religion.book.cta2.btn': 'Celá ústava',
  'religion.book.coverOpenAria': 'Otvoriť ústavu',
  'religion.book.coverAlt': 'Dogyptská ústava',
  'religion.book.hint': 'Klikni na knihu a otvor ju',
  'religion.book.close': 'Zavrieť knihu',
  'religion.book.prevPage': 'Predošlá strana',
  'religion.book.nextPage': 'Ďalšia strana',

  // ── shared nav (PageNav top-bar + Wall) ──
  'nav.wall': 'Stena',
  'nav.vision': 'Vízia',
  'nav.religion': 'Náboženstvo',
  'nav.about': 'O nás',

  // ── / (Wall / GodsGrid) ──
  'wall.hero.taglineLead': 'Miesto, kde',
  'wall.hero.cta': 'Staň sa Dogypťanom',
  'wall.hero.total': '1 000 000',
  'wall.hero.dogs': 'PSOV',
  'wall.hektor.msg': 'Pes, ktorý to celé začal. Adoptovaný v roku 2017. Každá cesta sa začína jedným krokom — jeho bola 42-dňová púť cez Slovensko.',
  'wall.info.title': '1 000 000 psov.<br/>Dáme to?',
  'wall.info.body': 'DOGYPT je hnutie pre psíčkarov. Každý pes dostane jedinečný Heroglyph — svoje trvalé miesto v globálnej svorke. Zbierame milión hrdinov. Buď medzi prvými.',
  'wall.filter.find': 'Nájsť psa podľa čísla',
  'wall.filter.center': 'Vycentrovať mriežku',
  'wall.filter.placeholder': 'Pes #',
  'wall.filter.clear': 'Vymazať',
  'wall.filter.confirm': 'Potvrdiť',

  // ── nav a11y ──
  'nav.aria.back': 'Späť',
  'nav.aria.openMenu': 'Otvoriť menu',
  'nav.aria.menu': 'Menu',
  'nav.aria.wallHome': 'WALL — domov',
  'nav.aria.chooseLanguage': 'Vybrať jazyk',
  'nav.langModal.title': 'Vyber si jazyk',
  'nav.aria.close': 'Zavrieť',

  // ── /payment (PaymentScreen) — STROJOVÝ PREKLAD, čaká review ──
  'payment.title': 'Bezpečná platba',
  'payment.product': 'DOGYPT HEROGLYPH CERTIFIKÁT pre {dogName}',
  'payment.yourDog': 'tvojho psa',
  'payment.sealing': 'PEČATÍME FOTKU...',
  'payment.preparing': 'PRIPRAVUJEME...',
  'payment.pay': 'ZAPLATIŤ CEZ STRIPE',
  'payment.secured': 'Zabezpečené cez Stripe · Karta, Apple Pay, Google Pay',
  'payment.back': 'Späť',
  // transparency treasury block
  'payment.transparency.title': '100% Transparentnosť',

  // ── Transparency model part labels (shared: PaymentScreen + FounderInvite) ──
  'transparency.part.development': 'Rozvoj',
  'transparency.part.affiliate': 'Affiliate',
  'transparency.part.directHelp': 'Priama pomoc',
  'transparency.part.hekthorBowl': 'Hekthorova miska',

  // ── /terms + /privacy — STROJOVÝ PREKLAD (právne texty), čaká review ──
  // legal.eyebrow + legal.motto = brand → EN fallback by design (nezapisovať sem)
  'legal.updated': 'Posledná aktualizácia: 4. mája 2026 · v1.0',
  'legal.langNote':
    'Tento dokument poskytujeme vo viacerých jazykoch pre pohodlie. V prípade rozdielov medzi verziami má prednosť anglické znenie.',

  // ── /terms ──
  'terms.title': 'Podmienky používania',
  'terms.linkPrivacy': 'Zásady ochrany súkromia →',
  'terms.s1.title': '1. Kto sme',
  'terms.s1.body':
    'DOGYPT s.r.o., slovenská spoločnosť s ručením obmedzeným zapísaná v Obchodnom registri (IČO 54 444 594), so sídlom Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovensko. V týchto Podmienkach o sebe hovoríme ako „DOGYPT“, „my“ alebo „nás“ a o vás ako „vy“ alebo „Člen“. Používaním dogypt.com, HEROGLYPH procesu alebo akejkoľvek súvisiacej služby (spolu „Služba“) súhlasíte s týmito Podmienkami. Dátum účinnosti: 4. mája 2026.',
  'terms.s2.title': '2. Kto môže Službu používať',
  'terms.s2.body':
    'Službu môžete používať, len ak máte aspoň 16 rokov. Vytvorením účtu alebo dokončením nákupu potvrdzujete, že máte 16 a viac rokov, že údaje, ktoré poskytujete, sú pravdivé, a že používanie Služby je v krajine, kde žijete, zákonné.',
  'terms.s3.title': '3. Účet a členstvo v Packu',
  'terms.s3.body':
    'Prístup sa udeľuje cez prihlasovací odkaz (magic link) odoslaný na váš e-mail; žiadne heslo sa neukladá. Účet je osobný — prosíme, nezdieľajte prístup. Účty, ktoré zneužívajú Službu, obťažujú iných Členov alebo porušujú tieto Podmienky, môžeme pozastaviť alebo zrušiť. O vymazanie účtu môžete kedykoľvek požiadať e-mailom na privacy@dogypt.com.',
  'terms.s4.title': '4. Heroglyph a digitálny tovar',
  'terms.s4.body':
    'Kupujete digitálny tovar: osobný HEROGLYPH (jedinečný symbolický certifikát), jeho PDF verziu, záznam vášho psa vo verejnom GodsGrid a trvalý prístup k vášmu Pack profilu. Udeľujeme vám osobnú, neprenosnú a nevýhradnú licenciu na používanie tohto digitálneho tovaru na nekomerčné osobné účely. Nič fyzické sa neposiela. Reprodukcia, ďalší predaj alebo komerčné využitie HEROGLYPH grafiky či podkladov vyžaduje náš predchádzajúci písomný súhlas.',
  'terms.s5.title': '5. Platby',
  'terms.s5.body':
    'Platby spracúva Stripe Payments Europe, Ltd. Vaše úplné údaje o karte nikdy nevidíme ani neukladáme. Ceny sa zobrazujú v mene uvedenej pri pokladni (predvolene USD); prípadná DPH sa vypočíta a zobrazí pred zaplatením. Objednávka, ktorú potvrdíte pri pokladni, je objednávka, ktorú doručíme — rozsah ani cenu dodatočne nemeníme.',
  'terms.s6.title': '6. Vrátenie peňazí a právo na odstúpenie',
  'terms.s6.body':
    'Podľa smernice EÚ 2011/83/EÚ majú spotrebitelia spravidla 14 dní na odstúpenie od zmluvy uzavretej na diaľku. Keďže HEROGLYPH sa dodáva ako digitálny obsah ihneď po zaplatení, kliknutím na „Zaplatiť“ udeľujete výslovný predchádzajúci súhlas so začatím okamžitého plnenia a beriete na vedomie, že začatím dodania strácate právo na odstúpenie (čl. 16 písm. m) smernice). Ak sa niečo pokazí na našej strane — poškodený súbor, duplicitná platba, zrušená objednávka — napíšte na support@dogypt.com do 14 dní a peniaze vrátime alebo dodáme znova, bez otázok.',
  'terms.s7.title': '7. Prípustné používanie',
  'terms.s7.body':
    'Nenahrávajte nič, na čo nemáte právo. Patria sem fotografie iných ľudí, materiál chránený autorským právom alebo obsah zobrazujúci týranie, nezákonnú činnosť či sexuálny obsah s maloletými. Neobťažujte iných Členov, nevydávajte sa za nich a nevyhrážajte sa im. Nezbierajte dáta automatizovane (scraping), hromadne nesťahujte, nevykonávajte spätné inžinierstvo ani sa nepokúšajte narušiť prevádzku Služby. Obsah alebo účty porušujúce tieto pravidlá môžeme odstrániť, s upozornením aj bez neho.',
  'terms.s8.title': '8. Zodpovednosť a vyhlásenia',
  'terms.s8.body':
    'HEROGLYPH je symbolický, ceremoniálny produkt — nie je to veterinárne, medicínske, behaviorálne ani chovateľské poradenstvo. Služba sa poskytuje „tak, ako je“. V maximálnom rozsahu povolenom slovenským právom a právom EÚ je naša celková zodpovednosť za akýkoľvek nárok vyplývajúci zo Služby obmedzená na sumu, ktorú ste nám zaplatili za 12 mesiacov pred vznikom nároku. Nič v týchto Podmienkach neobmedzuje zodpovednosť za podvod, hrubú nedbanlivosť ani práva, ktorých sa podľa platného práva nemožno vzdať.',
  'terms.s9.title': '9. Zmeny týchto Podmienok',
  'terms.s9.body':
    'Tieto Podmienky môžeme s rastom Služby aktualizovať. Podstatné zmeny oznámime e-mailom najmenej 30 dní pred nadobudnutím účinnosti. Drobné spresnenia nadobúdajú účinnosť zverejnením. Pokračovaním v používaní Služby po dátume účinnosti nové Podmienky prijímate. Staršie verzie archivujeme a na požiadanie sprístupníme.',
  'terms.s10.title': '10. Rozhodné právo a spory',
  'terms.s10.body':
    'Tieto Podmienky sa riadia právom Slovenskej republiky s vylúčením kolíznych noriem. Spory, ktoré sa nepodarí vyriešiť neformálne, patria do právomoci príslušných slovenských súdov podľa nášho sídla. Spotrebitelia v EÚ môžu využiť aj európsku platformu riešenia sporov online na https://ec.europa.eu/consumers/odr.',
  'terms.s11.title': '11. Kontakt',
  'terms.s11.body':
    'Všeobecné otázky: info@dogypt.com · Súkromie a osobné údaje: privacy@dogypt.com · Refundácie a podpora: support@dogypt.com · Pošta: DOGYPT s.r.o., Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovensko.',

  // ── /privacy ──
  'privacy.title': 'Zásady ochrany súkromia',
  'privacy.linkTerms': 'Podmienky používania →',
  'privacy.s1.title': '1. Kto sme',
  'privacy.s1.body':
    'DOGYPT s.r.o., slovenská spoločnosť s ručením obmedzeným (IČO 54 444 594), sídlo Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovensko. Sme prevádzkovateľom osobných údajov opísaných nižšie. S akoukoľvek otázkou o súkromí nám píšte na privacy@dogypt.com. Zodpovednú osobu (DPO) sme nevymenovali, pretože naše spracúvanie nedosahuje prahové hodnoty čl. 37 GDPR. Dátum účinnosti: 4. mája 2026.',
  'privacy.s2.title': '2. Aké údaje zbierame',
  'privacy.s2.body':
    'Pri používaní HEROGLYPH procesu zbierame: vašu e-mailovú adresu, meno psa, nahranú fotografiu psa (uloženú na Cloudinary), symbolické odpovede, ktoré vyberiete (pohlavie, farba, osud, pokrvná línia, charakter, váš horoskop, vaša iniciála), a dátum narodenia psa, ak ho uvediete. Platobné údaje zbiera priamo Stripe — my dostávame len potvrdenie platby, posledné 4 číslice karty a krajinu. Naše servery automaticky zaznamenávajú technické údaje (IP adresa, user-agent, čas požiadavky) na účely bezpečnosti a prevencie zneužitia.',
  'privacy.s3.title': '3. Ako ich používame',
  'privacy.s3.body':
    'Vaše údaje používame na: vygenerovanie a doručenie HEROGLYPH certifikátu; odoslanie e-mailu s certifikátom a malého počtu nadväzujúcich Pack správ; zobrazenie záznamu vášho psa vo verejnom GodsGrid (verejne sa zobrazuje len meno psa, fotografia a HEROGLYPH symbol — nikdy nie váš e-mail, vaše meno ani súkromný kód); prevádzku, zabezpečenie a zlepšovanie Služby; plnenie zákonných povinností, ako sú účtovníctvo a ochrana spotrebiteľa.',
  'privacy.s4.title': '4. Právny základ (GDPR)',
  'privacy.s4.body':
    'Opierame sa o čl. 6 ods. 1 písm. b) GDPR (plnenie zmluvy) pri dodaní HEROGLYPHu a členstve v Packu; čl. 6 ods. 1 písm. a) (súhlas) pri marketingových e-mailoch nad rámec servisných správ — súhlas môžete kedykoľvek odvolať; čl. 6 ods. 1 písm. f) (oprávnený záujem) pri bezpečnostnom logovaní, prevencii zneužitia a agregovanej analytike; a čl. 6 ods. 1 písm. c) (zákonná povinnosť) pri daňových a účtovných záznamoch.',
  'privacy.s5.title': '5. Zdieľanie a sprostredkovatelia',
  'privacy.s5.body':
    'Vaše údaje nepredávame. Zdieľame ich len so sprostredkovateľmi, ktorí nám pomáhajú prevádzkovať Službu: Stripe Payments Europe, Ltd. (platby) · Cloudinary Ltd. (ukladanie a doručovanie fotografií) · Resend, Inc. (transakčné e-maily) · Supabase, Inc. (databáza a autentifikácia) · WebSupport s.r.o. (webhosting) · GitHub, Inc. (nasadzovanie). Každý sprostredkovateľ je viazaný vlastnou zmluvou o spracúvaní údajov.',
  'privacy.s6.title': '6. Cookies a sledovanie',
  'privacy.s6.body':
    'Používame len cookies a lokálne úložisko, ktoré Služba potrebuje na fungovanie (relácia, jazyk, rozpracované HEROGLYPH voľby). Nepoužívame reklamu tretích strán ani sledovacie pixely naprieč stránkami. Ak pridáme analytiku šetrnú k súkromiu (napríklad Plausible), túto sekciu pred jej zapnutím aktualizujeme.',
  'privacy.s7.title': '7. Uchovávanie údajov',
  'privacy.s7.body':
    'Váš HEROGLYPH a Pack profil uchovávame, kým existuje váš účet, pretože GodsGrid je doživotný register každého člena Packu. Záznamy o transakčných e-mailoch uchovávame 12 mesiacov na účely podpory a prevencie podvodov. Účtovné záznamy uchovávame 10 rokov, ako vyžaduje slovenské právo (zákon č. 431/2002 Z. z.). Keď požiadate o vymazanie účtu, osobné identifikátory odstránime do 30 dní a ponecháme len zákonom vyžadované minimum.',
  'privacy.s8.title': '8. Vaše práva',
  'privacy.s8.body':
    'Podľa GDPR máte právo na prístup k svojim údajom, ich opravu, vymazanie, obmedzenie spracúvania alebo námietku proti nemu, prenosnosť údajov a kedykoľvek odvolať súhlas. Sťažnosť môžete podať aj slovenskému dozornému orgánu — Úrad na ochranu osobných údajov SR, Hraničná 12, 820 07 Bratislava 27, statny.dozor@pdp.gov.sk. Na uplatnenie ktoréhokoľvek z týchto práv napíšte na privacy@dogypt.com — odpovieme do 30 dní.',
  'privacy.s9.title': '9. Medzinárodné prenosy',
  'privacy.s9.body':
    'Niektorí naši sprostredkovatelia (Stripe, Cloudinary, Resend, Supabase, GitHub) prevádzkujú servery mimo EÚ/EHP, väčšinou v USA. Tam, kde osobné údaje opúšťajú EÚ/EHP, sa opierame o štandardné zmluvné doložky Európskej komisie, rámec EÚ–USA Data Privacy Framework a dodatočné záruky podľa kapitoly V GDPR.',
  'privacy.s10.title': '10. Zmeny týchto zásad',
  'privacy.s10.body':
    'O podstatných zmenách vás budeme informovať e-mailom najmenej 30 dní pred nadobudnutím účinnosti. Drobné úpravy — preklepy, zmeny názvov sprostredkovateľov, nové kontaktné adresy — nadobúdajú účinnosť zverejnením. Aktuálna verzia a dátum sú vždy v hornej časti tejto stránky; staršie verzie sú dostupné na požiadanie.',
  'privacy.s11.title': '11. Kontakt',
  'privacy.s11.body':
    'Súkromie a osobné údaje: privacy@dogypt.com · Všeobecné otázky: info@dogypt.com · Pošta: DOGYPT s.r.o., Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovensko.',

  // ── /about — Council (We Need You) — STROJOVÝ PREKLAD, čaká review ──
  'about.council.imgAlt': 'Faraón s Hekthorom a svojimi mačkami — Dogypt ťa potrebuje',
  'about.council.headline': 'Ťa potrebuje.',
  'about.council.formTitle': 'Pridaj sa k misii',
  'about.council.sub':
    'DOGYPT stavajú ľudia, ktorí vedia, čo pes znamená. Ak máš čo priniesť — zručnosť, hlas, víziu — patrí to sem.',
  'about.council.rolesAria': 'Vyber si rolu',
  'about.council.role.dog-lover.label': 'Psíčkar & tester',
  'about.council.role.dog-lover.desc': 'Skorý prístup a úprimná spätná väzba',
  'about.council.role.developer.label': 'Vývojár / dizajnér',
  'about.council.role.developer.desc': 'Stavaj funkcie, tvor vizuály',
  'about.council.role.dog-pro.label': 'Psí profesionál',
  'about.council.role.dog-pro.desc': 'Veterinár, tréner, útulok, chovateľ',
  'about.council.role.creator.label': 'Tvorca',
  'about.council.role.creator.desc': 'Video, foto, umenie pre svorku',
  'about.council.role.media.label': 'Médiá / influencer',
  'about.council.role.media.desc': 'Publikum a dosah',
  'about.council.role.investor.label': 'Investor',
  'about.council.role.investor.desc': 'Financuj konkrétne misie a útulky',
  'about.council.role.community.label': 'Budovateľ komunity',
  'about.council.role.community.desc': 'Organizuj ľudí vo svojom okolí',
  'about.council.role.business.label': 'Biznis & partnerstvá',
  'about.council.role.business.desc': 'Otváraj dvere — značky, útulky, spolupráce',
  'about.council.fullName': 'Meno a priezvisko',
  'about.council.email': 'E-mail',
  'about.council.message': 'Napíš nám, čo prinášaš… (nepovinné)',
  'about.council.error': 'Niečo sa pokazilo. Skús znova.',
  'about.council.sending': 'Odosielam…',
  'about.council.consent': 'Odoslaním súhlasím s posielaním emailov od DOGYPT — žiadna reklama, iba mobilizácia a komunikácia s packom.',
  'about.council.submit': 'Pridaj sa do Rady',
  'about.council.successTitle': 'Si v Rade.',
  'about.council.successSub': 'Ozveme sa, keď príde správny čas.',

  // ── /about — Footer ── (motto = EN by design, nezapisovať sem)
  'about.footer.sealAlt': 'Pečať DOGYPT',
  'about.footer.mission': 'Hnutie pre každého, komu pes zmenil život.',
  'about.footer.privacy': 'Súkromie',
  'about.footer.terms': 'Podmienky',

  // ── /about — Legends (citáty celebrít) — STROJOVÝ PREKLAD citátov, čaká review ──
  'about.legends.title': 'AJ LEGENDY POKĽAKLI',
  'about.legends.sub':
    'Najmocnejší ľudia, akí kedy žili, sa klaňali tomu istému tichému učiteľovi — a napísali to.',
  'about.legends.creditsSummary': 'Citáty z verejných rozhovorov · Autori fotografií',
  'about.legends.creditsIntro':
    'Portréty cez Wikimedia Commons pod licenciami Creative Commons / public domain.',
  'about.legends.q.oprah-winfrey.text': 'Najpravdivejšia, najčistejšia láska… je láska, ktorá prichádza od tvojho psa.',
  'about.legends.q.oprah-winfrey.role': 'Kultúrna ikona',
  'about.legends.q.chris-evans.text': 'V ten deň som nemal v úmysle adoptovať psa, ale v momente, keď som ho uvidel, som vedel, že ide domov so mnou.',
  'about.legends.q.chris-evans.role': 'Herec · o svojom psovi Dodgerovi',
  'about.legends.q.tom-hardy.text': 'Bol to Anjel. A bol môj najlepší priateľ. Poznal iba lásku.',
  'about.legends.q.tom-hardy.role': 'Herec · o svojom psovi Woodym',
  'about.legends.q.dwayne-johnson.text': 'Vždy ťa budeme ľúbiť. Navždy ostaneš môj malý parťák.',
  'about.legends.q.dwayne-johnson.role': 'Herec · o svojom psovi Brutusovi',
  'about.legends.q.miley-cyrus.text': 'Naučil si ma milovať bez strachu zo straty.',
  'about.legends.q.miley-cyrus.role': 'Speváčka · o svojom psovi Floydovi',
  'about.legends.q.ariana-grande.text': 'Psy sú tie najneškodnejšie, najsladšie stvorenia na svete. Nedávajú nič iné než bezpodmienečnú lásku.',
  'about.legends.q.ariana-grande.role': 'Speváčka',
  'about.legends.q.hugh-jackman.text': 'Vždy, vždy som ho volal rocková hviezda. Lebo ňou bol!',
  'about.legends.q.hugh-jackman.role': 'Herec · o svojom psovi Dalim',
  'about.legends.q.drew-barrymore.text': 'Myslím, že ani klišé o bezpodmienečnej láske nestačí.',
  'about.legends.q.drew-barrymore.role': 'Herečka · o svojej fenke Flossie',
  'about.legends.q.henry-cavill.text': 'Neraz mi zachránil emocionálnu aj psychickú kožu.',
  'about.legends.q.henry-cavill.role': 'Herec · o svojom psovi Kalovi',
  'about.legends.q.ryan-reynolds.text': 'Jednoducho som sa do neho zaľúbil. Nemal som to v pláne, len som ho cestou zobral so sebou.',
  'about.legends.q.ryan-reynolds.role': 'Herec · o svojom psovi Baxterovi',
  'about.legends.q.george-clooney.text': 'Miluje ma. Nemôžem urobiť nič zlé. Chodí za mnou všade.',
  'about.legends.q.george-clooney.role': 'Herec · o svojom psovi Einsteinovi',
  'about.legends.q.bradley-cooper.text': 'Charlotte ma ľúbi bezvýhradne. Sú to moje deti.',
  'about.legends.q.bradley-cooper.role': 'Herec · o svojej fenke Charlotte',
  'about.legends.q.channing-tatum.text': 'Jednoducho ti dávajú bezpodmienečnú lásku. A nikdy nie si sám, proste sú tu.',
  'about.legends.q.channing-tatum.role': 'Herec · o svojej fenke Lulu',
  'about.legends.q.orlando-bloom.text': 'Bol viac než spoločník. Bolo to spojenie duší, tým som si istý.',
  'about.legends.q.orlando-bloom.role': 'Herec · o svojom psovi Mightym',
  'about.legends.q.kevin-costner.text': 'Je jeden, ktorý je psom celého života… a keď odíde, budeš plakať ako malé dieťa.',
  'about.legends.q.kevin-costner.role': 'Herec · o svojom psovi Wyattovi',
  'about.legends.q.tom-holland.text': 'Je úžasná, moja najlepšia priateľka.',
  'about.legends.q.tom-holland.role': 'Herec · o svojej fenke Tesse',
  'about.legends.q.patrick-stewart.text': 'Už teraz sme do neho po uši zaľúbení.',
  'about.legends.q.patrick-stewart.role': 'Herec · o šteniatku v dočasnej opatere',
  'about.legends.q.jennifer-aniston.text': 'Psy sú všetko. Sú žijúca, dýchajúca, čistá a dobrá láska.',
  'about.legends.q.jennifer-aniston.role': 'Herečka',
  'about.legends.q.salma-hayek.text': 'Nemám slová ani slzy, ktorými by som opísala, koľko pre mňa znamenala.',
  'about.legends.q.salma-hayek.role': 'Herečka · o svojej fenke Lupe',
  'about.legends.q.eva-mendes.text': 'Ten pocit ma nikdy neopustil. Je to jedna z najvzácnejších prítomností v mojom živote.',
  'about.legends.q.eva-mendes.role': 'Herečka · o svojom psovi Hugovi',
  'about.legends.q.chrissy-teigen.text': 'Pre nich si celá ich kniha, celý ich život.',
  'about.legends.q.chrissy-teigen.role': 'Modelka / moderátorka · o svojej fenke Penny',
  'about.legends.q.hilary-duff.text': 'Dal si mi toľko útechy a lásky, keď som to najviac potrebovala!',
  'about.legends.q.hilary-duff.role': 'Herečka / speváčka · o svojom psovi Jakovi',
  'about.legends.q.amanda-seyfried.text': 'Finn mi priniesol všetku lásku, teplo a úplnú prítomnosť, o akej môže dievča len snívať.',
  'about.legends.q.amanda-seyfried.role': 'Herečka · o svojom psovi Finnovi',
  'about.legends.q.kaley-cuoco.text': 'Bezpodmienečná láska môjho milovaného, zábavného psa Normana ma inšpirovala založiť túto firmu.',
  'about.legends.q.kaley-cuoco.role': 'Herečka · o svojom psovi Normanovi',
  'about.legends.q.mariah-carey.text': 'Niet lepšieho psa ako Jack. Ako by si mohol urobiť psa lepšieho než Jack!',
  'about.legends.q.mariah-carey.role': 'Speváčka · o svojom psovi Jackovi',
  'about.legends.q.billie-eilish.text': 'Je to taký dobrý chlapec. Kiežby som ho mohla zobrať na celé turné po svete.',
  'about.legends.q.billie-eilish.role': 'Speváčka · o svojom psovi Sharkovi',
  'about.legends.q.selena-gomez.text': 'So svojimi psami sa naozaj rozprávam. Úplne verím, že zvieratá liečia.',
  'about.legends.q.selena-gomez.role': 'Speváčka / herečka',
  'about.legends.q.paul-mccartney.text': 'Bola mojím drahým miláčikom. Pamätám si, ako John žasol, keď videl, aký som k zvieraťu nežný.',
  'about.legends.q.paul-mccartney.role': 'The Beatles · o svojej fenke Marthe',
  'about.legends.q.john-legend.text': 'Desať rokov nám dávala toľko radosti. Ľúbime ťa, Pippa!',
  'about.legends.q.john-legend.role': 'Spevák · o svojej fenke Pippe',
  'about.legends.q.dolly-parton.text': '„Puppy Love“ bola moja úplne prvá nahrávka a o šesť desaťročí neskôr je moja láska k zvieratám silnejšia než kedykoľvek.',
  'about.legends.q.dolly-parton.role': 'Speváčka / skladateľka',
  'about.legends.q.lady-gaga.text': 'Volá sa Asia. Je to BATPIG. Ľúbim ju, som jej mama.',
  'about.legends.q.lady-gaga.role': 'Speváčka · o svojej fenke Asii',
  'about.legends.q.conor-mcgregor.text': 'Bol so mnou celou cestou, môj najbližší spoločník. Všetka tá láska a maznanie nám budú navždy chýbať.',
  'about.legends.q.conor-mcgregor.role': 'UFC bojovník · o svojom psovi Hugovi',
  'about.legends.q.lewis-hamilton.text': 'Vziať si Roscoea do života bolo najlepšie rozhodnutie, aké som kedy urobil.',
  'about.legends.q.lewis-hamilton.role': 'Pilot F1 · o svojom psovi Roscoeovi',
  'about.legends.q.serena-williams.text': 'Každý deň mi prišla oblízať nohu a pripomenúť, ako veľmi ma ľúbi.',
  'about.legends.q.serena-williams.role': 'Tenisová šampiónka · o svojej fenke Jackie',
  'about.legends.q.tyson-fury.text': 'Najlepší priateľ človeka. Vždy sa teší, keď ťa vidí. Ľúbi ťa bezpodmienečne.',
  'about.legends.q.tyson-fury.role': 'Boxer ťažkej váhy · o svojom psovi Cashovi',
  'about.legends.q.michael-phelps.text': 'Ich láska je bezpodmienečná a mne aj mojej rodine prinášajú do života obrovskú radosť.',
  'about.legends.q.michael-phelps.role': 'Olympijský plavec',
  'about.legends.q.venus-williams.text': 'Harry je môj najlepší priateľ! Rozhodne najlepšie rozhodnutie, aké som kedy urobila.',
  'about.legends.q.venus-williams.role': 'Tenisová šampiónka · o svojom psovi Harrym',
  'about.legends.q.roger-federer.text': 'Nemohli by sme byť šťastnejší. Vitaj v rodine, Willow.',
  'about.legends.q.roger-federer.role': 'Tenisový šampión · o svojej fenke Willow',
  'about.legends.q.john-steinbeck.text': 'Je to dobrý priateľ a spoločník na cesty a cestovanie má radšej než čokoľvek, čo si vie predstaviť.',
  'about.legends.q.john-steinbeck.role': 'Nobelovský spisovateľ · o svojom psovi Charleym',
  'about.legends.q.elizabeth-taylor.text': 'Nikdy v živote som žiadneho psa neľúbila tak ako ju. Niekedy si myslím, že je tam vnútri človek.',
  'about.legends.q.elizabeth-taylor.role': 'Herečka · o svojej fenke Sugar',
  'about.legends.q.ricky-gervais.text': 'Keby najláskavejšie duše dostávali najdlhšie životy, psy by nás všetkých prežili.',
  'about.legends.q.ricky-gervais.role': 'Komik / herec',
  'about.legends.q.gisele-bundchen.text': 'Náš anjel strážny odišiel do neba. Navždy bude žiť v našich srdciach.',
  'about.legends.q.gisele-bundchen.role': 'Supermodelka · o svojej fenke Lua',
  'about.legends.q.pablo-picasso.text': 'Lump nie je pes, nie je to malý človek, je to niekto iný.',
  'about.legends.q.pablo-picasso.role': 'Maliar · o svojom psovi Lumpovi',
  'about.legends.q.mickey-rourke.text': 'Niekedy, keď je človek sám, jediné, čo má, je jeho pes. A pre mňa znamenali celý svet.',
  'about.legends.q.mickey-rourke.role': 'Herec',
};
