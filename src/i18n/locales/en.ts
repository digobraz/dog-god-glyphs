/**
 * DOGYPT i18n — EN master dictionary (zdroj pravdy typu Dict).
 *
 * FLAT dotted kľúče. Hodnoty s `<span class="wf-hl">…</span>` / inline štýlom sú HTML
 * a renderujú sa cez dangerouslySetInnerHTML (rovnaký pattern ako pôvodný kód).
 *
 * Brand termíny ostávajú EN naprieč jazykmi (Heroglyph / Dogyptian / Pack / DOGYPT,
 * + slovná hračka „DOG" ako jazyk lásky).
 *
 * Pridať stránku = nový blok kľúčov tu + zodpovedajúce kľúče v ostatných locale.
 */
export const en = {
  // ── /vision — hero ──
  'vision.hero.title': 'The Vision',
  'vision.hero.watch': 'Watch Dogypt Intro Movie',
  'vision.hero.videoTitle': 'DOGYPT Intro Movie',
  'vision.hero.playLabel': 'Play Dogypt Intro Movie',

  // ── /vision — WHAT IF beats ──
  // beat 0 (intro)
  'vision.beat.dream.bigW': 'I HAD',
  'vision.beat.dream.bigG': 'A DREAM',
  'vision.beat.dream.tag': 'I HAD A DREAM',
  'vision.intro.lead':
    'In 2018, I had a <span class="wf-hl">vision</span> of how to <span class="wf-hl">save every dog on Earth</span>. And it\'s actually simple — every doglover <span class="wf-hl">unites into one community</span>, one that sees a dog as <span class="wf-hl">more than just an animal</span>. So here we are…',

  // beat 1
  'vision.beat.symbol.bigW': 'THE',
  'vision.beat.symbol.bigG': 'SYMBOL',
  'vision.beat.symbol.tag': 'THE SYMBOL',
  'vision.beat.symbol.h':
    'Our language of love is <span class="wf-hl">DOG</span>. And beyond its ordinary name, every dog carries its own <span class="wf-hl">unique symbol</span> — the <span class="wf-hl">HEROGLYPH</span>. It\'s a <span class="wf-hl">universal language</span>, a <span class="wf-hl">sacred tool</span> to unite every doglover on Earth.',

  // beat 2
  'vision.beat.nation.bigW': 'A DOG',
  'vision.beat.nation.bigG': 'NATION',
  'vision.beat.nation.tag': 'A DOG NATION',
  'vision.beat.nation.h':
    'Let\'s make a <span class="wf-hl">miracle</span>. Our first milestone: to unite <span class="wf-hl">a million doglovers</span>. Imagine the <span class="wf-hl">sheer power</span> we\'d hold together — everything we could do for ourselves, our dogs, and <span class="wf-hl">dogs in need</span>, beyond any state. <span class="wf-hl">We would be the state.</span>',

  // beat 3
  'vision.beat.temple.bigW': 'DIGITAL',
  'vision.beat.temple.bigG': 'TEMPLE',
  'vision.beat.temple.tag': 'DIGITAL TEMPLE',
  'vision.beat.temple.h':
    'One app, <span class="wf-hl">only for real doglovers</span> — no fake people. The first <span class="wf-hl">dog-friendly digital world</span> built just for us: a social home, and an ecosystem that truly helps — <span class="wf-hl">travel, vets, services, education</span>, and <span class="wf-hl">fundraisers</span> for dogs in need.',

  // beat 4
  'vision.beat.centers.bigW': 'REAL',
  'vision.beat.centers.bigG': 'CENTERS',
  'vision.beat.centers.tag': 'REAL CENTERS',
  'vision.beat.centers.h':
    'The old shelter managed misery. The <span class="wf-hl">sanctuary</span> ends it. Real centers across the world for <span class="wf-hl">care, training, and research</span> — financed <span class="wf-hl">in the open</span>, every account on the table.',

  // beat 5
  'vision.beat.era.bigW': 'A NEW',
  'vision.beat.era.bigG': 'ERA',
  'vision.beat.era.tag': 'A NEW ERA',
  'vision.beat.era.h':
    'Beyond borders and politics, doglovers are Earth\'s <span class="wf-hl">kindest hidden force</span>. Only together can we <span class="wf-hl">rebuild the system</span> and change the world — and leave behind something that protects our dogs <span class="wf-hl">forever</span>.',

  // ── /vision — finale CTA ──
  'vision.finale.title': 'What if…',
  'vision.finale.lead':
    '…every doglover said <span style="color:#F5C73D;font-style:italic">yes</span> to one crazy idea?',
  'vision.finale.cta': 'Become Dogyptian',
  'vision.finale.tagline': 'A new era is just one click away.',

  // ── /heroglyph intro ──
  // hero title (mobile = 2 riadky "The"/"Symbol"; desktop = "The Symbol") — case riadi CSS text-transform
  'heroglyph.intro.title.line1': 'The',
  'heroglyph.intro.title.line2': 'Symbol',
  'heroglyph.intro.title.desktop': 'The Symbol',
  'heroglyph.intro.title.sub': 'That Changes History',

  // dictionary blok
  'heroglyph.intro.word': 'Heroglyph',
  'heroglyph.intro.ipa': '[ˈhɪr-oʊ-ɡlɪf]',
  'heroglyph.intro.noun': 'noun',
  'heroglyph.intro.definition':
    'A unique symbol describing you and your dog, your eternal bond. Also a ticket to DOGYPT — the place where DOG is GOD.',

  // Heroglyph slovo tooltip (desktop hover)
  'heroglyph.intro.wordTooltip': 'HERO = DOG · GLYPH = SYMBOL',
  'heroglyph.intro.wordTooltipSub': 'GOD name for every DOG.',

  // CTA + outro
  'heroglyph.intro.cta': 'Become Dogyptian',
  'heroglyph.intro.outro': 'Doglovers, assemble!',
  'heroglyph.intro.loading': 'Loading…',

  // pills rad 1
  'heroglyph.intro.pill.questions.label': '12 Questions',
  'heroglyph.intro.pill.questions.tooltip': 'Twelve quick answers about your dog.',
  'heroglyph.intro.pill.minutes.label': '3 Minutes',
  'heroglyph.intro.pill.minutes.tooltip': 'An interactive quiz full of fun.',
  'heroglyph.intro.pill.forever.label': 'Forever in DOGYPT.com',
  'heroglyph.intro.pill.forever.tooltip':
    "Your dog's name forever in your heart — and in the digital world.",

  // pills rad 2
  'heroglyph.intro.pill.unique.label': 'One of a Kind',
  'heroglyph.intro.pill.unique.tooltip': 'No two heroglyphs are alike — every symbol is unique!',
  'heroglyph.intro.pill.vow.label': 'Vow of Faith',
  'heroglyph.intro.pill.vow.tooltip': 'Your sign of allegiance to the Dogyptian path — IN DOG WE TRUST!',
  'heroglyph.intro.pill.bond.label': 'Eternal Bond',
  'heroglyph.intro.pill.bond.tooltip': 'A symbol of the eternal bond between you and your dog.',
  'heroglyph.intro.pill.payment.label': 'One Symbolic Payment',
  'heroglyph.intro.pill.payment.tooltip':
    '$11 once — no subscriptions. All money stays in DOGYPT — for development and systematic help!',

  // showcase symbol meanings (Hekthorov heroglyf) — label + value
  'heroglyph.intro.meaning.dog.label': 'Dog',
  'heroglyph.intro.meaning.dog.value': 'Hekthor',
  'heroglyph.intro.meaning.owner.label': 'Owner',
  'heroglyph.intro.meaning.owner.value': 'Matej',
  'heroglyph.intro.meaning.dogGender.label': 'Dog Gender',
  'heroglyph.intro.meaning.dogGender.value': 'King',
  'heroglyph.intro.meaning.dogColour.label': 'Dog Colour',
  'heroglyph.intro.meaning.dogColour.value': 'Dark Coat',
  'heroglyph.intro.meaning.dogPatron.label': 'Dog Patron',
  'heroglyph.intro.meaning.dogPatron.value': 'Hekthor',
  'heroglyph.intro.meaning.dogOrigin.label': 'Dog Origin',
  'heroglyph.intro.meaning.dogOrigin.value': 'Rescued',
  'heroglyph.intro.meaning.dogBloodline.label': 'Dog Bloodline',
  'heroglyph.intro.meaning.dogBloodline.value': 'Mutt',
  'heroglyph.intro.meaning.dogCharacter1.label': 'Dog Character I',
  'heroglyph.intro.meaning.dogCharacter1.value': 'Favourite Frisbee',
  'heroglyph.intro.meaning.dogCharacter2.label': 'Dog Character II',
  'heroglyph.intro.meaning.dogCharacter2.value': 'Water Lover',
  'heroglyph.intro.meaning.ownerGender.label': 'Owner Gender',
  'heroglyph.intro.meaning.ownerGender.value': 'Man',
  'heroglyph.intro.meaning.westernZodiac.label': 'Western Zodiac',
  'heroglyph.intro.meaning.westernZodiac.value': 'Leo',
  'heroglyph.intro.meaning.chineseZodiac.label': 'Chinese Zodiac',
  'heroglyph.intro.meaning.chineseZodiac.value': 'Rooster',
  'heroglyph.intro.meaning.ownerInitial.label': 'Owner Initial',
  'heroglyph.intro.meaning.ownerInitial.value': 'Matej',
  'heroglyph.intro.meaning.ranking.label': 'Ranking',
  'heroglyph.intro.meaning.ranking.value': '#1 — First Dog',

  // ── /heroglyph flow — step 1: name ──
  'heroglyph.flow.name.greetingPrefix': "Hi, I'm",
  'heroglyph.flow.name.greetingQuestion': "What's your dog's name?",
  'heroglyph.flow.name.placeholder': "Type your dog's name...",
  'heroglyph.flow.name.birthday': 'When was your dog born?',
  'heroglyph.flow.name.continue': 'Continue',
  'heroglyph.flow.name.infoAria': 'Info about Hekthor',
  'heroglyph.flow.name.whoTitle': 'WHO IS',
  'heroglyph.flow.name.whoTitleName': 'HEKTHOR?',
  'heroglyph.flow.name.whoBody':
    "Hekthor is the first Dogyptian. Rescued from the streets and adopted from a shelter, his loyalty inspired a global movement to honor dogs as gods. His mission is to forge a unique HEROGLYPH for every dog on Earth, uniting the world's largest community of dog lovers to help millions of dogs in need.",
  'heroglyph.flow.name.born': 'Born',
  'heroglyph.flow.name.adopted': 'Adopted',
  'heroglyph.flow.name.location': 'Location',
  'heroglyph.flow.name.locationValue': 'Slovakia, EU',

  // ── /heroglyph flow — step 2: photo ──
  'heroglyph.flow.photo.faceOfGodPrefix': 'A',
  'heroglyph.flow.photo.faceOfGodWord': 'FACE',
  'heroglyph.flow.photo.faceOfGodSuffix': 'OF A GOD',
  'heroglyph.flow.photo.uploadHint': 'Upload a clear photo of {dogName} — it will be sealed into their Heroglyph forever.',
  'heroglyph.flow.photo.yourDog': 'your dog',
  'heroglyph.flow.photo.tapToUpload': 'Tap to upload',
  'heroglyph.flow.photo.changePhoto': 'Change photo',
  'heroglyph.flow.photo.sealing': 'Sealing into eternity…',
  'heroglyph.flow.photo.sealed': '✓ Sealed',
  'heroglyph.flow.photo.uploadFailed': 'Upload failed — retry',
  'heroglyph.flow.photo.tipForward': 'dog facing forward',
  'heroglyph.flow.photo.tipSide': 'side profile / group',
  'heroglyph.flow.photo.tipBest': 'Best results: face clearly visible, works cropped into a circle.',
  'heroglyph.flow.photo.next': 'NEXT →',
  'heroglyph.flow.photo.back': '← BACK',
  'heroglyph.flow.photo.adjustTitle': 'ADJUST YOUR PORTRAIT',
  'heroglyph.flow.photo.adjustHint': 'Drag to position your dog within the frame.',
  'heroglyph.flow.photo.moreTitle': 'MORE FACES OF THE GOD',
  'heroglyph.flow.photo.moreHint': 'Add 1–3 more photos for surprises later. (optional)',
  'heroglyph.flow.photo.saving': 'SAVING...',

  // ── /heroglyph flow — step 3: breed ──
  'heroglyph.flow.breed.question': 'Tell me, what breed is your hero?',
  'heroglyph.flow.breed.searchPlaceholder': 'Search breed...',
  'heroglyph.flow.breed.continue': 'Continue',
  'heroglyph.flow.breed.cat.01': 'Furballs',
  'heroglyph.flow.breed.cat.02': 'Wooligans',
  'heroglyph.flow.breed.cat.03': 'Antennas',
  'heroglyph.flow.breed.cat.04': 'Speedsters',
  'heroglyph.flow.breed.cat.05': 'Schnozzers',
  'heroglyph.flow.breed.cat.06': 'Aristocrats',
  'heroglyph.flow.breed.cat.07': 'Smushfaces',
  'heroglyph.flow.breed.cat.08': 'Splashers',
  'heroglyph.flow.breed.cat.09': 'Wolflikes',
  'heroglyph.flow.breed.cat.10': 'Giants',

  // ── /heroglyph flow — step 4: ranking ──
  'heroglyph.flow.ranking.question': "Is {dogName} the first dog you've ever had?",
  'heroglyph.flow.ranking.yourPup': 'your pup',
  'heroglyph.flow.ranking.yesLabel': 'YES, my first love',
  'heroglyph.flow.ranking.noLabel': 'NO, dog lover forever!',
  'heroglyph.flow.ranking.whichDog': 'Which dog is {dogName}?',
  'heroglyph.flow.ranking.range': '11–50',
  'heroglyph.flow.ranking.enterNumber': 'Enter dog number (11–50)',
  'heroglyph.flow.ranking.continue': 'Continue',
  'heroglyph.flow.ranking.back': 'Back',

  // ── /heroglyph flow — step 5: owner-info ──
  'heroglyph.flow.ownerInfo.greetingPrefix': "Okay, let's talk about you,",
  'heroglyph.flow.ownerInfo.greetingWord': 'hooman',
  'heroglyph.flow.ownerInfo.placeholder': "Owner's first name...",
  'heroglyph.flow.ownerInfo.man': 'Man',
  'heroglyph.flow.ownerInfo.woman': 'Woman',
  'heroglyph.flow.ownerInfo.continue': 'Continue',
  'heroglyph.flow.ownerInfo.back': 'Back',

  // ── /heroglyph flow — shared ──
  'heroglyph.flow.yourDogFallback': 'YOUR DOG',
  'heroglyph.flow.dogHeroglyphTitle': "{dogName}'S HEROGLYPH",

  // ── /heroglyph flow — step 6: owner-zodiac ──
  'heroglyph.flow.ownerZodiac.question': 'What do the stars say about you?',
  'heroglyph.flow.ownerZodiac.westernLabel': 'Zodiac Sign',
  'heroglyph.flow.ownerZodiac.chineseLabel': 'Chinese Zodiac',
  'heroglyph.flow.ownerZodiac.continue': 'Continue',
  'heroglyph.flow.ownerZodiac.back': 'Back',
  // western sign labels (display only — enum values stay English)
  'heroglyph.flow.ownerZodiac.sign.Aries': 'Aries',
  'heroglyph.flow.ownerZodiac.sign.Taurus': 'Taurus',
  'heroglyph.flow.ownerZodiac.sign.Gemini': 'Gemini',
  'heroglyph.flow.ownerZodiac.sign.Cancer': 'Cancer',
  'heroglyph.flow.ownerZodiac.sign.Leo': 'Leo',
  'heroglyph.flow.ownerZodiac.sign.Virgo': 'Virgo',
  'heroglyph.flow.ownerZodiac.sign.Libra': 'Libra',
  'heroglyph.flow.ownerZodiac.sign.Scorpio': 'Scorpio',
  'heroglyph.flow.ownerZodiac.sign.Sagittarius': 'Sagittarius',
  'heroglyph.flow.ownerZodiac.sign.Capricorn': 'Capricorn',
  'heroglyph.flow.ownerZodiac.sign.Aquarius': 'Aquarius',
  'heroglyph.flow.ownerZodiac.sign.Pisces': 'Pisces',
  // chinese animal labels (display only — enum values stay English)
  'heroglyph.flow.ownerZodiac.animal.Monkey': 'Monkey',
  'heroglyph.flow.ownerZodiac.animal.Rooster': 'Rooster',
  'heroglyph.flow.ownerZodiac.animal.Dog': 'Dog',
  'heroglyph.flow.ownerZodiac.animal.Pig': 'Pig',
  'heroglyph.flow.ownerZodiac.animal.Rat': 'Rat',
  'heroglyph.flow.ownerZodiac.animal.Ox': 'Ox',
  'heroglyph.flow.ownerZodiac.animal.Tiger': 'Tiger',
  'heroglyph.flow.ownerZodiac.animal.Rabbit': 'Rabbit',
  'heroglyph.flow.ownerZodiac.animal.Dragon': 'Dragon',
  'heroglyph.flow.ownerZodiac.animal.Snake': 'Snake',
  'heroglyph.flow.ownerZodiac.animal.Horse': 'Horse',
  'heroglyph.flow.ownerZodiac.animal.Goat': 'Goat',

  // ── /heroglyph flow — step 7: owner-final ──
  'heroglyph.flow.ownerFinal.infoAria': 'Info about Heroglyph',
  'heroglyph.flow.ownerFinal.messageLine1': 'HOOMAN, your part is done.',
  'heroglyph.flow.ownerFinal.messageLine2': 'That little frame — that is you!',
  'heroglyph.flow.ownerFinal.messageLine3Prefix': "Now let's finish the HEROGLYPH with",
  'heroglyph.flow.ownerFinal.messageLine3Suffix': "'s part.",
  'heroglyph.flow.ownerFinal.cta': "LET'S GO",
  'heroglyph.flow.ownerFinal.infoTitle': 'INSPIRED BY ANCIENT EGYPT',
  'heroglyph.flow.ownerFinal.infoBody':
    "The HEROGLYPH consists of two frames that together form your dog's true identity. In Ancient Egypt, the names of gods and pharaohs were written inside similar protective oval frames, called cartouches, to preserve their legacy for eternity.",
  'heroglyph.flow.ownerFinal.cleopatraAlt': "Cleopatra's cartouche",
  'heroglyph.flow.ownerFinal.cleopatraCaption': 'This hieroglyph belongs to Cleopatra.',
  'heroglyph.flow.ownerFinal.back': 'Back',

  // ── /heroglyph flow — step 8: dog-gender ──
  'heroglyph.flow.dogGender.infoAria': 'Info about Dog Gender',
  'heroglyph.flow.dogGender.title': 'Dog Gender',
  'heroglyph.flow.dogGender.questionPrefix': 'Do you have a',
  'heroglyph.flow.dogGender.questionKing': 'king',
  'heroglyph.flow.dogGender.questionOr': 'or a',
  'heroglyph.flow.dogGender.questionQueen': 'queen',
  'heroglyph.flow.dogGender.questionSuffix': ' at home?',
  'heroglyph.flow.dogGender.king': 'King',
  'heroglyph.flow.dogGender.queen': 'Queen',
  'heroglyph.flow.dogGender.info3Title': '3-Point Crown',
  'heroglyph.flow.dogGender.info3Body':
    "For boys who've mastered the 3-paw balance. One leg up, maximum aim, absolute legend.",
  'heroglyph.flow.dogGender.info4Title': '4-Point Crown',
  'heroglyph.flow.dogGender.info4Body':
    'For girls who prefer the 4-paw stability. Maximum comfort, zero mess, total elegance.',
  'heroglyph.flow.dogGender.back': 'Back',

  // ── /heroglyph flow — step 9: dog-fate ──
  'heroglyph.flow.dogFate.infoAria': 'Info about Dog Fate',
  'heroglyph.flow.dogFate.title': 'The Origin',
  'heroglyph.flow.dogFate.questionPrefix': 'Was your dog born into a',
  'heroglyph.flow.dogFate.questionSafe': 'safe home',
  'heroglyph.flow.dogFate.questionOr': 'or given a',
  'heroglyph.flow.dogFate.questionSecond': 'second chance',
  'heroglyph.flow.dogFate.questionSuffix': ' at life?',
  'heroglyph.flow.dogFate.raised': 'Raised',
  'heroglyph.flow.dogFate.rescued': 'Rescued',
  'heroglyph.flow.dogFate.infoRaisedTitle': 'Baby Pacifier',
  'heroglyph.flow.dogFate.infoRaisedBody': 'A dog born into the family. Raised with love from day one.',
  'heroglyph.flow.dogFate.infoRescuedTitle': 'Lifebuoy',
  'heroglyph.flow.dogFate.infoRescuedBody': 'A rescued or found dog. Given a second chance at life.',
  'heroglyph.flow.dogFate.back': 'Back',

  // ── /heroglyph flow — step 10: dog-colour ──
  'heroglyph.flow.dogColour.title': 'Dog Colour',
  'heroglyph.flow.dogColour.questionPrefix': 'What',
  'heroglyph.flow.dogColour.questionCoat': 'coat',
  'heroglyph.flow.dogColour.questionSuffix': ' is your dog wearing?',
  'heroglyph.flow.dogColour.bright': 'Bright',
  'heroglyph.flow.dogColour.brightSub': 'Sun',
  'heroglyph.flow.dogColour.dark': 'Dark',
  'heroglyph.flow.dogColour.darkSub': 'Moon',
  'heroglyph.flow.dogColour.mix': 'Mix',
  'heroglyph.flow.dogColour.mixSub': 'Rainbow',
  'heroglyph.flow.dogColour.back': 'Back',

  // ── /heroglyph flow — step 11: dog-bloodline ──
  'heroglyph.flow.dogBloodline.infoAria': 'Info about Dog Bloodline',
  'heroglyph.flow.dogBloodline.title': 'Dog Bloodline',
  'heroglyph.flow.dogBloodline.questionPrefix': 'Is your dog ',
  'heroglyph.flow.dogBloodline.questionPure': 'pure',
  'heroglyph.flow.dogBloodline.questionOr': ' or ',
  'heroglyph.flow.dogBloodline.questionWild': 'wild',
  'heroglyph.flow.dogBloodline.questionSuffix': '?',
  'heroglyph.flow.dogBloodline.aristocrat': 'Aristocrat',
  'heroglyph.flow.dogBloodline.mutt': 'Mutt',
  'heroglyph.flow.dogBloodline.infoSignedTitle': 'Signed Papyrus',
  'heroglyph.flow.dogBloodline.infoSignedBody': 'Original with pure bloodline.',
  'heroglyph.flow.dogBloodline.infoEmptyTitle': 'Empty Papyrus',
  'heroglyph.flow.dogBloodline.infoEmptyBody': 'Original without pure bloodline.',
  'heroglyph.flow.dogBloodline.back': 'Back',

  // ── /heroglyph flow — step 12: dog-character ──
  'heroglyph.flow.dogCharacter.infoAria': 'Info about Character',
  'heroglyph.flow.dogCharacter.title': 'The Character',
  'heroglyph.flow.dogCharacter.questionPrefix': "What's your dog's ",
  'heroglyph.flow.dogCharacter.questionWord': 'personality',
  'heroglyph.flow.dogCharacter.questionSuffix': ' like?',
  'heroglyph.flow.dogCharacter.chooseTwo': 'Choose two options.',
  'heroglyph.flow.dogCharacter.infoTitle': "Pick your dog's vibe",
  'heroglyph.flow.dogCharacter.infoBody':
    'Choose the two character traits that best describe your dog. These shape the symbols inside the Heroglyph.',
  'heroglyph.flow.dogCharacter.selectedCount': '{count}/2 selected',
  'heroglyph.flow.dogCharacter.back': 'Back',
  'heroglyph.flow.dogCharacter.trait.guardian': 'Guardian',
  'heroglyph.flow.dogCharacter.trait.player': 'Player',
  'heroglyph.flow.dogCharacter.trait.energizer': 'Energizer',
  'heroglyph.flow.dogCharacter.trait.maverick': 'Maverick',
  'heroglyph.flow.dogCharacter.trait.waterlover': 'Waterlover',
  'heroglyph.flow.dogCharacter.trait.gourmet': 'Gourmet',
  'heroglyph.flow.dogCharacter.trait.lover': 'Lover',
  'heroglyph.flow.dogCharacter.trait.chiller': 'Chiller',

  // ── /heroglyph flow — step 13: reveal ──
  'heroglyph.flow.reveal.heroglyphTitle': "{dogName}'s Heroglyph",
  'heroglyph.flow.reveal.horizontalDesign': '↔ HORIZONTAL DESIGN',
  'heroglyph.flow.reveal.verticalDesign': '↕ VERTICAL DESIGN',
  'heroglyph.flow.reveal.infoAria': 'Info',
  'heroglyph.flow.reveal.visionTitle': 'OUR VISION',
  'heroglyph.flow.reveal.visionBody':
    'To claim your official symbol, we ask for a symbolic tribute. Our grand plan is simple: a Heroglyph for every dog on Earth. Because the bigger our global pack becomes, the more heroes we can rescue from the streets and shelters. Join the dynasty!',
  'heroglyph.flow.reveal.welcome': 'WELCOME TO DOGYPT!',
  'heroglyph.flow.reveal.bond': 'This Heroglyph is your eternal bond.',
  'heroglyph.flow.reveal.cta': 'GRAB MY HEROGLYPH',

  // ── /heroglyph flow — step 14: message ──
  'heroglyph.flow.message.promptPrefix': 'Leave a eternal message for ',
  'heroglyph.flow.message.promptMid': '.',
  'heroglyph.flow.message.promptStayPrefix': 'It will stay with them in ',
  'heroglyph.flow.message.promptStayWord': 'dogypt',
  'heroglyph.flow.message.promptStaySuffix': ' - forever.',
  'heroglyph.flow.message.yourMessage': 'Your Message',
  'heroglyph.flow.message.placeholder':
    'Dear {dogName}, thank you for every second I was lucky enough to spend by your side…',
  'heroglyph.flow.message.profileNotePrefix': "This message will appear on your dog's profile in the ",
  'heroglyph.flow.message.profileNoteSite': 'DOGYPT.com',
  'heroglyph.flow.message.profileNoteSuffix': '.',
  'heroglyph.flow.message.cta': 'SEAL THE MESSAGE →',

  // ── /heroglyph flow — checkout ──
  'heroglyph.checkout.orderSummary': 'Order Summary',
  'heroglyph.checkout.dogPossessive': "{dogName}'s",
  'heroglyph.checkout.heroglyph': 'HEROGLYPH',
  'heroglyph.checkout.yourDogFallback': 'Your dog',
  'heroglyph.checkout.yourDetails': 'Your Details',
  'heroglyph.checkout.firstName': 'First Name',
  'heroglyph.checkout.lastName': 'Last Name',
  'heroglyph.checkout.email': 'Email',
  'heroglyph.checkout.country': 'Country',
  'heroglyph.checkout.cta': 'CONTINUE TO PAYMENT →',
  'heroglyph.checkout.disclaimerPrefix': "After payment, we'll place your dog's photo on the website and your ",
  'heroglyph.checkout.disclaimerHighlight': 'DOGYPT Certificate',
  'heroglyph.checkout.disclaimerSuffix': ' in your profile.',
  'heroglyph.checkout.back': 'Back',
  'heroglyph.checkout.dogFallback': 'Dog',

  // ── /welcome — post-payment (WelcomeScreen) ──
  // record-moment overlay
  'welcome.record.title': 'RECORD THIS MOMENT',
  'welcome.record.subtitle': "Capture your dog's official welcome",
  // goal tracker
  'welcome.goal.label': 'Our Goal 🎯',
  'welcome.goal.target': '1,000,000 Heroglyphs',
  // congrats + name
  'welcome.congratsPrefix': 'Congratulations, ',
  'welcome.congratsName': '{name}.',
  'welcome.ownerFallback': 'Friend',
  'welcome.officiallyA': 'is officially a',
  // mission text (code source of truth — renders identically)
  'welcome.missionLine1': 'You just changed history — one dog at a time.',
  'welcome.missionSpread': 'Spread the pack. ',
  'welcome.missionMotto': 'IN DOG WE TRUST.',
  // CTA states (PREPARING → FORGING → ENTER)
  'welcome.cta.preparing': 'PREPARING YOUR PLACE...',
  'welcome.cta.forging': 'FORGING YOUR HEROGLYPH...',
  'welcome.cta.enter': 'ENTER THE GODS →',
  'welcome.emailHint': 'Your certificate is on its way — check your email.',

  // ── /login — magic-link callback (Login.tsx) ──
  'login.eyebrow': 'DOGYPT · Pack Access',
  // status: verifying
  'login.verifying.title': 'Opening the Gate',
  'login.verifying.body': 'Verifying your magic link…',
  // status: success
  'login.success.title': 'Welcome Back',
  'login.success.body': 'Redirecting you to your pack…',
  // status: expired
  'login.expired.title': 'Link Expired',
  'login.expired.body': 'Magic links are short-lived. Request a fresh one and we will send it to your inbox.',
  // status: invalid
  'login.invalid.title': 'Link Not Recognised',
  'login.invalid.body': 'We could not verify this link. It may have already been used or copied incorrectly.',
  // status: network
  'login.network.title': 'Connection Hiccup',
  'login.network.body': 'We could not reach the temple. Check your connection and try again.',
  // status: missing
  'login.missing.title': 'No Token Found',
  'login.missing.body': 'This page expects a magic link from your email. Check your inbox for the latest one.',
  // resend button states
  'login.resend.idle': 'Resend magic link',
  'login.resend.sending': 'Sending…',
  'login.resend.sent': 'Magic link sent',
  'login.backHome': 'Back home',
  'login.homeAria': 'DOGYPT home',

  // ── 404 — NotFound.tsx ──
  'notFound.code': '404',
  'notFound.message': 'Oops! Page not found',
  'notFound.returnHome': 'Return to Home',
} as const;
