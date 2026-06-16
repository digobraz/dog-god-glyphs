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
  'heroglyph.intro.cta': 'Create Your Heroglyph',
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
    '€11 once — no subscriptions. All money stays in DOGYPT — for development and systematic help!',

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
    'Choose the two character traits that best describe your dog.',
  'heroglyph.flow.dogCharacter.slideLabel': 'SLIDE',
  'heroglyph.flow.dogCharacter.slideAriaLabel': 'Next character slide',
  'heroglyph.flow.dogCharacter.slide.guardian.desc':
    'Watches the door like it\'s the gates of the afterlife. Barks first, asks questions never.',
  'heroglyph.flow.dogCharacter.slide.player.desc':
    'Will trade his soul for one more throw of the ball. Recess is a religion.',
  'heroglyph.flow.dogCharacter.slide.energizer.desc':
    'Batteries sold separately — and they never came. Powered by pure zoomies.',
  'heroglyph.flow.dogCharacter.slide.maverick.desc':
    'Rules are for leashed dogs. Selective hearing is a lifestyle, not a flaw.',
  'heroglyph.flow.dogCharacter.slide.waterlover.desc':
    'Sees a puddle, sees a baptism. Dry fur is a temporary condition.',
  'heroglyph.flow.dogCharacter.slide.gourmet.desc':
    'A nose that finds a crumb three rooms away. Every meal is sacred.',
  'heroglyph.flow.dogCharacter.slide.lover.desc':
    'Personal space is a human myth. Will love you until you\'re soggy.',
  'heroglyph.flow.dogCharacter.slide.chiller.desc':
    'Has mastered the ancient art of doing absolutely nothing, beautifully.',
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
  'heroglyph.flow.message.promptPrefix': 'Leave an eternal message for ',
  'heroglyph.flow.message.promptMid': '.',
  'heroglyph.flow.message.promptStayPrefix': 'It will stay with them in ',
  'heroglyph.flow.message.promptStayWord': 'dogypt',
  'heroglyph.flow.message.promptStaySuffix': ' - forever.',
  'heroglyph.flow.message.yourMessage': 'Your Message',
  'heroglyph.flow.message.placeholder':
    "Dear {dogName}, thank you for every day with you — and I can't wait for all the beautiful moments still ahead of us…",
  'heroglyph.flow.message.profileNotePrefix': "This message will appear on your dog's profile in the ",
  'heroglyph.flow.message.profileNoteSite': 'DOGYPT.com',
  'heroglyph.flow.message.profileNoteSuffix': '.',
  'heroglyph.flow.message.cta': 'SEAL THE MESSAGE →',
  'heroglyph.flow.message.done': 'Done',

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
  // password step (set-pack-password flow)
  'welcome.password.title': 'Your account: {email}',
  'welcome.password.placeholder': 'Password (min 8 characters)',
  'welcome.password.confirm': 'Confirm password',
  'welcome.password.submit': 'Set password & enter',
  'welcome.password.processing': 'Setting password…',
  'welcome.password.mismatch': 'Passwords do not match.',
  'welcome.password.tooShort': 'Password must be at least 8 characters.',
  'welcome.password.notPaid': 'Payment still processing — try again in a few seconds.',
  'welcome.password.error': 'Something went wrong. Try again.',
  'welcome.password.altLink': 'Prefer a link instead? It\'s in your email.',

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
  'login.missing.title': 'Sign In',
  'login.missing.body': 'Sign in with your email and password, or get a magic link.',
  // status: recovery
  'login.recovery.title': 'Set New Password',
  'login.recovery.body': 'Choose a new password for your account.',
  // resend button states
  'login.resend.idle': 'Resend magic link',
  'login.resend.sending': 'Sending…',
  'login.resend.sent': 'Magic link sent',
  'login.backHome': 'Back home',
  'login.homeAria': 'DOGYPT home',
  // password login form
  'login.password.placeholder': 'Password',
  'login.password.submit': 'Sign in',
  'login.password.submitting': 'Signing in…',
  'login.password.error': 'Incorrect email or password.',
  'login.password.networkError': 'Connection error. Try again.',
  'login.password.forgotPassword': 'Forgot password?',
  'login.password.magicLinkAlt': 'Email me a link instead',
  // magic link form (secondary)
  'login.magicLink.placeholder': 'your@email.com',
  'login.magicLink.submit': 'Send magic link',
  'login.magicLink.submitting': 'Sending…',
  'login.magicLink.sent': 'Magic link sent — check your inbox.',
  // forgot password
  'login.forgot.prompt': 'Enter your email to reset your password.',
  'login.forgot.placeholder': 'your@email.com',
  'login.forgot.submit': 'Send reset link',
  'login.forgot.submitting': 'Sending…',
  'login.forgot.sent': 'Check your inbox to reset.',
  'login.forgot.back': 'Back to sign in',
  // recovery form
  'login.recovery.newPasswordPlaceholder': 'New password (min 8 characters)',
  'login.recovery.submit': 'Set new password',
  'login.recovery.submitting': 'Saving…',
  'login.recovery.success': 'Password updated — signing you in…',

  // ── 404 — NotFound.tsx ──
  'notFound.code': '404',
  'notFound.message': 'Oops! Page not found',
  'notFound.returnHome': 'Return to Home',

  // ── /about — opening (origin + Star Wars crawl) ──
  // origin-title renders as HTML (EN baked <br/> for the two-line stack; other langs = single word)
  'about.origin.title': 'The<br />Origin',
  'about.origin.sub': 'Slide and read',
  'about.origin.skip': 'or skip',
  'about.crawl.intro': 'Ten years ago, in a shelter in the heart of Europe….',
  'about.crawl.episode': 'Episode I',
  'about.crawl.faith': 'A New Faith',
  'about.crawl.p1':
    'In 2016, eight black puppies arrived at the shelter, thrown away in a single box. Seven found a home. The biggest one nobody wanted — he waited a whole year. His name was Hekthor.',
  'about.crawl.p2':
    'One day a couple came to the shelter to see Sindy, a small white female they wanted to adopt. By pure chance, Hekthor was in her kennel at the time — his own was just being cleaned. The man, who had only come along for the ride and never wanted a dog, fell in love with the black dog he was seeing for the very first time.',
  'about.crawl.p3':
    'A week later the two of them were together, and a beautiful story began. The man\'s whole life changed, and in time he understood one thing: only someone who has a dog, and knows what a dog\'s love feels like, can truly help dogs in need.',
  'about.crawl.p4':
    'And so the Heroglyph was born — a symbol meant to unite doglovers everywhere into the largest community the world has ever known. A community that will stand for us, for our dogs, and for the generations to come — for people unafraid to admit that a dog is not just an animal, but a being that makes us better humans.',
  'about.crawl.p5':
    'Right now, the journey to the first milestone begins — to create 1,000,000 Heroglyphs. And you can be part of it. Because the only ones crazy enough to believe they can change the world are the ones who do.',
  'about.crawl.p6': 'IN DOG WE TRUST.',

  // ── /about — timeline (5 milestones) ──
  'about.timeline.heading': 'The Story of Dogypt',
  'about.milestone.1.year': '2017',
  'about.milestone.1.tag': 'The Shelter',
  'about.milestone.1.title': 'Treasure in the Shelter',
  'about.milestone.1.body':
    'A black dog nobody wanted was waiting behind a shelter fence. His name became Hekthor. Adopting him wasn\'t rescue — it was the beginning of everything.',
  'about.milestone.2.year': '2018',
  'about.milestone.2.tag': 'The Bond',
  'about.milestone.2.title': 'A Forever Bond',
  'about.milestone.2.body':
    'He pulled me through the hardest stretch of my life without saying a single word. Every dog lover knows this — they carry you exactly when you\'re falling.',
  'about.milestone.3.year': '2019',
  'about.milestone.3.tag': 'The Journey',
  'about.milestone.3.title': 'The Walk That Became a Book',
  'about.milestone.3.body':
    'Together we walked across Slovakia — 42 days, 800 kilometres, one quiet promise. That road became a book: „Cesta s Hrdinom" — The Road with a Hero.',
  'about.milestone.4.year': '2022',
  'about.milestone.4.tag': 'The Name',
  'about.milestone.4.title': 'A Nation of Dog Lovers',
  'about.milestone.4.body':
    'Pyramids, mysticism, the eternal glory of Egypt — humanity has been spellbound for millennia. Bind that to the infinite love of a dog and you get DOGYPT. I sealed the idea at Expo Dubai 2022, dressed as a pharaoh.',
  'about.milestone.5.year': 'Now',
  'about.milestone.5.tag': 'Dogypt',
  'about.milestone.5.title': 'The Journey Starts With You',
  'about.milestone.5.body':
    'DOGYPT is a movement for everyone whose life was changed by a dog. Built on the oldest, most honest bond on Earth. Hekthor is founder #1. You are next.',

  // ── /about — outro + reel ──
  'about.outro.quoteLead': 'It Was Never',
  'about.outro.quoteTail': '"Just a Dog."',
  'about.outro.body':
    'You already know the feeling — that a dog isn\'t something you own, it\'s <strong>someone you love</strong>. Now imagine that love organized, connected, <strong>powerful enough to change things.</strong> And that\'s why <strong>DOGYPT</strong> exists.',
  'about.outro.name1': 'Matej',
  'about.outro.and': 'and',
  'about.outro.name2': 'Hekthor',
  'about.outro.cta': 'Become Dogyptian',
  'about.reel.prev': 'Previous photo',
  'about.reel.next': 'Next photo',

  // ── /religion — hero hook (cow vs dog) ──
  'religion.hook.number': '1.2',
  'religion.hook.billion': 'BILLION',
  'religion.hook.people': 'PEOPLE',
  'religion.hook.note': '(15% worldwide)',
  'religion.hook.bow': 'bow to the cow',
  'religion.hook.doglovers': 'DOGLOVERS?',
  'religion.hook.worship': "LET'S WORSHIP OUR DOGS.",
  'religion.cta': 'Become Dogyptian',
  'religion.aria.question': 'The Question',
  'religion.aria.preamble': 'Preamble',
  'religion.aria.sacredIndex': 'Sacred Index',
  'religion.aria.scrollDown': 'Scroll down',

  // ── /religion — preamble (In Dog We Trust) ──
  // headline = motto → stays EN across locales (sk/cs fall back here by design)
  'religion.preamble.headlineGrad': 'In Dog',
  'religion.preamble.headlineLine': 'We Trust',
  'religion.preamble.text':
    'We, the nation of doglovers — knowing the <strong>infinite loyalty</strong>, the <strong>true love</strong> and the <strong>pure soul</strong> of every dog on Earth — in order to lift the standing of dogs in human society, build them a <strong>community</strong>, <strong>better</strong> their lives, and <strong>rewrite</strong> the fate of every dog in need, do give ourselves this constitution.',
  'religion.preamble.oath': 'The Oath of the Pack',

  // ── /religion — sacred index ──
  'religion.bookTitle': 'The “Bible” for doglovers',

  // ── /religion — Constitution book (ConstitutionBook.tsx) ──
  'religion.book.sealAlt': 'The Dogyptian seal',
  // title page = brand document title → stays EN across locales (sk/cs fall back here)
  'religion.book.titleThe': 'The',
  'religion.book.titleBrand': 'Dogypt',
  'religion.book.titleConstitution': 'Constitution',
  'religion.book.trust': 'In Dog We Trust',
  'religion.book.sub': 'Required reading for every doglover to become a Dogyptian.',
  'religion.book.cta1.kicker': 'The Path Begins',
  'religion.book.cta1.head': 'Join the<br />Religion',
  'religion.book.cta1.text': 'Sign up for the dog religion — take a Heroglyph.',
  'religion.book.cta1.btn': 'Become Dogyptian',
  'religion.book.cta2.kicker': 'The Whole Word',
  'religion.book.cta2.head': 'Read the<br />Constitution',
  'religion.book.cta2.text': 'Every canon, credo and commandment — in full.',
  'religion.book.cta2.btn': 'Full Constitution',
  'religion.book.coverOpenAria': 'Open the Constitution',
  'religion.book.coverAlt': 'The Dogyptian Constitution',
  'religion.book.hint': 'Tap the book to open',
  'religion.book.close': 'Close book',
  'religion.book.prevPage': 'Previous page',
  'religion.book.nextPage': 'Next page',

  // ── shared nav (PageNav top-bar + Wall) — CSS uppercases for display ──
  'nav.wall': 'Wall',
  'nav.vision': 'Vision',
  'nav.religion': 'Religion',
  'nav.about': 'About',

  // ── / (Wall / GodsGrid) ──
  // hero card — "DOG is GOD." motto stays EN inline (not keyed)
  'wall.hero.taglineLead': 'The place where',
  'wall.hero.cta': 'Become Dogyptian',
  'wall.hero.total': '1,000,000',
  'wall.hero.dogs': 'DOGS',
  // Hekthor founder card
  'wall.hektor.msg': 'The dog who started it all. Adopted 2017. Every journey begins with one step — his was a 42-day walk across Slovakia.',
  // info overlay
  'wall.info.title': '1,000,000 dogs.<br/>Will we make it?',
  'wall.info.body': "DOGYPT is a movement for dog lovers. Every dog gets a unique Heroglyph — their permanent place in the global pack. We're collecting one million heroes. Be among the first.",
  // filter / numpad
  'wall.filter.find': 'Find dog by number',
  'wall.filter.center': 'Center grid',
  'wall.filter.placeholder': 'Dog #',
  'wall.filter.clear': 'Clear',
  'wall.filter.confirm': 'Confirm',

  // ── nav a11y (PageNav aria-labels + language modal) ──
  'nav.aria.back': 'Back',
  'nav.aria.openMenu': 'Open menu',
  'nav.aria.menu': 'Menu',
  'nav.aria.wallHome': 'WALL — home',
  'nav.aria.chooseLanguage': 'Choose language',
  'nav.langModal.title': 'Choose language',
  'nav.aria.close': 'Close',

  // ── /payment (PaymentScreen) ──
  'payment.title': 'Secure Payment',
  'payment.product': 'DOGYPT HEROGLYPH CERTIFICATE for {dogName}',
  'payment.yourDog': 'your dog',
  'payment.sealing': 'SEALING PHOTO...',
  'payment.preparing': 'PREPARING...',
  'payment.pay': 'PAY WITH STRIPE',
  'payment.secured': 'Secured by Stripe · Card, Apple Pay, Google Pay',
  'payment.back': 'Back',
  // transparency treasury block
  'payment.transparency.title': '100% Transparency',

  // ── Transparency model part labels (shared: PaymentScreen + FounderInvite) ──
  'transparency.part.development': 'Development',
  'transparency.part.affiliate': 'Affiliate',
  'transparency.part.directHelp': 'Direct help',
  'transparency.part.hekthorBowl': "Hekthor's bowl",

  // ── /terms + /privacy — shared legal chrome ──
  // eyebrow + motto = brand → stay EN across locales (sk/cs fall back here by design)
  'legal.eyebrow': 'DOGYPT · Legal',
  'legal.motto': 'DOGYPT · In DOG We Trust',
  'legal.updated': 'Last updated: 4 May 2026 · v1.0',
  // legally binding version = EN; translations are convenience (rendered in all langs)
  'legal.langNote':
    'This document is provided in multiple languages for convenience. If the versions differ, the English version prevails.',

  // ── /terms ──
  'terms.title': 'Terms of Service',
  'terms.linkPrivacy': 'Privacy Policy →',
  'terms.s1.title': '1. Who We Are',
  'terms.s1.body':
    'DOGYPT s.r.o., a Slovak limited liability company registered in the Commercial Register (IČO 54 444 594), with its registered seat at Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovakia. Throughout these Terms we refer to ourselves as “DOGYPT”, “we”, or “us”, and to you as “you” or “Member”. By using dogypt.com, the HEROGLYPH flow, or any related service (together, the “Service”) you agree to these Terms. Effective date: 4 May 2026.',
  'terms.s2.title': '2. Eligibility',
  'terms.s2.body':
    'You must be at least 16 years old to use the Service. By creating an account or completing a purchase you confirm that you are 16+, that any information you provide is true, and that your use of the Service is lawful in the country where you live.',
  'terms.s3.title': '3. Account & Pack Membership',
  'terms.s3.body':
    'Access is granted through a magic link sent to your email; no password is stored. Your account is personal to you — please do not share access. We may suspend or close accounts that abuse the Service, harass other Members, or violate these Terms. You can request deletion of your account at any time by emailing privacy@dogypt.com.',
  'terms.s4.title': '4. Heroglyph & Digital Goods',
  'terms.s4.body':
    'What you purchase is a digital good: a personal HEROGLYPH (a unique symbolic certificate), a PDF version of that certificate, your dog’s entry in the public GodsGrid, and ongoing access to your Pack profile. We grant you a personal, non-transferable, non-exclusive licence to use these digital goods for non-commercial personal use. Nothing physical is shipped. Reproduction, resale, or commercial exploitation of HEROGLYPH artwork or assets requires our prior written consent.',
  'terms.s5.title': '5. Payments',
  'terms.s5.body':
    'Payments are processed by Stripe Payments Europe, Ltd. We never see or store your full card details. Prices are shown in the currency at checkout (default USD); any applicable VAT is calculated and displayed before you pay. The order you confirm at checkout is the order we deliver — we will not change scope or price after the fact.',
  'terms.s6.title': '6. Refunds & Right of Withdrawal',
  'terms.s6.body':
    'Under EU Directive 2011/83/EU consumers normally have 14 days to withdraw from a distance contract. Because the HEROGLYPH is delivered as digital content immediately after payment, by clicking “Pay” you give your express prior consent to immediate performance and acknowledge that you thereby lose your right of withdrawal as soon as delivery begins (Art. 16(m) of the Directive). If something on our side goes wrong — a broken file, a duplicate charge, a cancelled order — write to support@dogypt.com within 14 days and we will refund or re-deliver, no questions asked.',
  'terms.s7.title': '7. Acceptable Use',
  'terms.s7.body':
    'Don’t upload anything you don’t have the right to upload. That includes other people’s photos, copyrighted material, or content depicting cruelty, illegal activity, or sexual content involving minors. Don’t harass, impersonate, or threaten other Members. Don’t scrape, mass-download, reverse-engineer, or attempt to disrupt the Service. We may remove content or accounts that break these rules, with or without notice.',
  'terms.s8.title': '8. Liability & Disclaimers',
  'terms.s8.body':
    'The HEROGLYPH is a symbolic, ceremonial product — it is not veterinary, medical, behavioural, or breeding advice. The Service is provided “as is”. To the maximum extent allowed by Slovak and EU law, our total liability for any claim arising from the Service is limited to the amount you paid us in the 12 months before the claim. Nothing here limits liability for fraud, gross negligence, or rights that cannot be waived under applicable law.',
  'terms.s9.title': '9. Changes to These Terms',
  'terms.s9.body':
    'We may update these Terms as the Service grows. Material changes will be announced by email at least 30 days before they take effect. Minor clarifications take effect on publication. Continued use of the Service after the effective date means you accept the new Terms. Older versions are kept on file and available on request.',
  'terms.s10.title': '10. Governing Law & Disputes',
  'terms.s10.body':
    'These Terms are governed by the laws of the Slovak Republic, excluding its conflict-of-law rules. Disputes that cannot be resolved informally fall under the jurisdiction of the competent Slovak courts at our registered seat. EU consumers may also use the European Online Dispute Resolution platform at https://ec.europa.eu/consumers/odr.',
  'terms.s11.title': '11. Contact',
  'terms.s11.body':
    'General questions: info@dogypt.com · Privacy & data requests: privacy@dogypt.com · Refunds & support: support@dogypt.com · Postal: DOGYPT s.r.o., Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovakia.',

  // ── /privacy ──
  'privacy.title': 'Privacy Policy',
  'privacy.linkTerms': 'Terms of Service →',
  'privacy.s1.title': '1. Who We Are',
  'privacy.s1.body':
    'DOGYPT s.r.o., a Slovak limited liability company (IČO 54 444 594), registered seat Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovakia. We are the controller of the personal data described below. For any privacy-related question write to privacy@dogypt.com. We have not appointed a Data Protection Officer because our processing does not meet the GDPR Art. 37 thresholds. Effective date: 4 May 2026.',
  'privacy.s2.title': '2. Data We Collect',
  'privacy.s2.body':
    'When you use the HEROGLYPH flow we collect: your email address, your dog’s name, the photo of your dog you upload (stored on Cloudinary), the symbolic answers you select (gender, colour, fate, bloodline, character, your zodiac, your initial), and your dog’s birth date if provided. Stripe collects your payment details directly — we receive only a payment confirmation, the last 4 digits of the card, and country. Our servers automatically log technical data (IP address, user-agent, request time) for security and abuse prevention.',
  'privacy.s3.title': '3. How We Use It',
  'privacy.s3.body':
    'We use your data to: generate and deliver your HEROGLYPH certificate; send you the certificate email and a small number of follow-up Pack messages; display your dog’s entry in the public GodsGrid (only the dog’s name, photo, and HEROGLYPH symbol appear publicly — never your email, your name, or your private code); operate, secure, and improve the Service; comply with legal obligations such as accounting and consumer protection.',
  'privacy.s4.title': '4. Legal Basis (GDPR)',
  'privacy.s4.body':
    'We rely on Art. 6(1)(b) GDPR (performance of a contract) for the HEROGLYPH delivery and Pack membership; Art. 6(1)(a) (consent) for any marketing email beyond service messages — you can withdraw at any time; Art. 6(1)(f) (legitimate interest) for security logging, abuse prevention, and aggregate analytics; and Art. 6(1)(c) (legal obligation) for tax and accounting records.',
  'privacy.s5.title': '5. Sharing & Sub-processors',
  'privacy.s5.body':
    'We do not sell your data. We share it only with sub-processors that help us run the Service: Stripe Payments Europe, Ltd. (payments) · Cloudinary Ltd. (photo storage and delivery) · Resend, Inc. (transactional email) · Supabase, Inc. (database and authentication) · WebSupport s.r.o. (web hosting) · GitHub, Inc. (deployment pipeline). Each sub-processor is bound by its own data processing agreement.',
  'privacy.s6.title': '6. Cookies & Tracking',
  'privacy.s6.body':
    'We use only the cookies and local storage we need to make the Service work (session, language, your in-progress HEROGLYPH selections). We do not run third-party advertising or cross-site tracking pixels. If we add privacy-friendly product analytics (such as Plausible) we will update this section before turning them on.',
  'privacy.s7.title': '7. Retention',
  'privacy.s7.body':
    'Your HEROGLYPH and Pack profile are kept for as long as your account exists, because the GodsGrid is the lifetime registry of every member of the Pack. Transactional email logs are kept for 12 months for support and fraud prevention. Accounting records are kept for 10 years as required by Slovak law (Act 431/2002 Coll.). When you ask us to delete your account, we remove personal identifiers within 30 days and keep only the legally required minimum.',
  'privacy.s8.title': '8. Your Rights',
  'privacy.s8.body':
    'Under GDPR you have the right to access your data, to correct it, to have it erased, to restrict or object to processing, to data portability, and to withdraw consent at any time. You can also lodge a complaint with the Slovak supervisory authority — Úrad na ochranu osobných údajov SR, Hraničná 12, 820 07 Bratislava 27, statny.dozor@pdp.gov.sk. To exercise any of these rights write to privacy@dogypt.com — we reply within 30 days.',
  'privacy.s9.title': '9. International Transfers',
  'privacy.s9.body':
    'Some of our sub-processors (Stripe, Cloudinary, Resend, Supabase, GitHub) operate servers outside the EU/EEA, mostly in the United States. Where personal data leaves the EU/EEA we rely on the European Commission’s Standard Contractual Clauses, the EU–US Data Privacy Framework, and additional safeguards required by GDPR Chapter V.',
  'privacy.s10.title': '10. Changes to This Policy',
  'privacy.s10.body':
    'We will tell you about material changes by email at least 30 days before they take effect. Minor edits — typos, sub-processor name updates, new contact addresses — take effect on publication. The current version and date are always at the top of this page; older versions are available on request.',
  'privacy.s11.title': '11. Contact',
  'privacy.s11.body':
    'Privacy & data requests: privacy@dogypt.com · General questions: info@dogypt.com · Postal: DOGYPT s.r.o., Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Slovakia.',

  // ── /about — Council (We Need You) ──
  'about.council.imgAlt': 'A pharaoh with Hekthor and his cats — Dogypt needs you',
  'about.council.headline': 'Needs You.',
  'about.council.formTitle': 'Join the Mission',
  'about.council.sub':
    'DOGYPT is built by people who know what a dog means. If you have something to bring — a skill, a voice, a vision — this is where it belongs.',
  'about.council.rolesAria': 'Choose your role',
  'about.council.role.dog-lover.label': 'Dog Lover & Tester',
  'about.council.role.dog-lover.desc': 'Early access & honest feedback',
  'about.council.role.developer.label': 'Developer / Designer',
  'about.council.role.developer.desc': 'Build features, craft visuals',
  'about.council.role.dog-pro.label': 'Dog Professional',
  'about.council.role.dog-pro.desc': 'Vet, trainer, shelter, breeder',
  'about.council.role.creator.label': 'Creator',
  'about.council.role.creator.desc': 'Video, photo, art for the pack',
  'about.council.role.media.label': 'Media / Influencer',
  'about.council.role.media.desc': 'Audience & coverage',
  'about.council.role.investor.label': 'Investor',
  'about.council.role.investor.desc': 'Fund specific missions & shelters',
  'about.council.role.community.label': 'Community Builder',
  'about.council.role.community.desc': 'Organise people locally',
  'about.council.role.business.label': 'Business & Partnerships',
  'about.council.role.business.desc': 'Open doors — brands, shelters, deals',
  'about.council.fullName': 'Full name',
  'about.council.email': 'Email',
  'about.council.message': 'Tell us what you bring to the table… (optional)',
  'about.council.error': 'Something went wrong. Try again.',
  'about.council.sending': 'Sending…',
  'about.council.consent': 'By submitting, I agree to receive emails from DOGYPT — no ads, just pack mobilisation and communication.',
  'about.council.submit': 'Join the Council',
  'about.council.successTitle': "You're in the Council.",
  'about.council.successSub': "We'll reach out when the time is right.",

  // ── /about — Footer ──
  'about.footer.sealAlt': 'DOGYPT seal',
  // motto = brand → stays EN across locales (sk/cs fall back here by design)
  'about.footer.motto': 'In dog we trust.',
  'about.footer.mission': 'A movement for everyone whose life was changed by a dog.',
  'about.footer.privacy': 'Privacy',
  'about.footer.terms': 'Terms',

  // ── /about — Legends (testimonials) ──
  'about.legends.title': 'EVEN LEGENDS KNELT',
  'about.legends.sub':
    'The most powerful humans who ever lived all bowed to the same quiet teacher — and they wrote it down.',
  'about.legends.creditsSummary': 'Quotes from public interviews · Photo credits',
  'about.legends.creditsIntro':
    'Portraits via Wikimedia Commons under Creative Commons / public-domain licenses.',
  // citáty: EN = canonical verbatim (zdroj POOL v TestimonialsSection.tsx);
  // preklady = preklad citátu, NIKDY parafráza ani vymyslený citát
  'about.legends.q.oprah-winfrey.text': 'The truest, purest love… is the love that comes from your dog.',
  'about.legends.q.oprah-winfrey.role': 'Cultural icon',
  'about.legends.q.chris-evans.text': 'I had no intention of rescuing a dog that day, but the minute I saw him I knew he was coming home with me.',
  'about.legends.q.chris-evans.role': 'Actor · on his dog Dodger',
  'about.legends.q.tom-hardy.text': 'He was an Angel. And he was my best friend. All he knew was love.',
  'about.legends.q.tom-hardy.role': 'Actor · on his dog Woody',
  'about.legends.q.dwayne-johnson.text': "We'll always love you. You'll always be my lil' main man.",
  'about.legends.q.dwayne-johnson.role': 'Actor · on his dog Brutus',
  'about.legends.q.miley-cyrus.text': 'You taught me how to love without fear of loss.',
  'about.legends.q.miley-cyrus.role': 'Singer · on her dog Floyd',
  'about.legends.q.ariana-grande.text': 'Dogs are the most harmless, sweetest babes in the world. They show nothing but unconditional love.',
  'about.legends.q.ariana-grande.role': 'Singer',
  'about.legends.q.hugh-jackman.text': 'I always, always called him the rockstar. Because he was!',
  'about.legends.q.hugh-jackman.role': 'Actor · on his dog Dali',
  'about.legends.q.drew-barrymore.text': "I don't think even the cliché of unconditional love is enough.",
  'about.legends.q.drew-barrymore.role': 'Actor · on her dog Flossie',
  'about.legends.q.henry-cavill.text': 'He has saved my emotional and psychological bacon plenty of times.',
  'about.legends.q.henry-cavill.role': 'Actor · on his dog Kal',
  'about.legends.q.ryan-reynolds.text': "I just fell in love with him. I didn't mean to, I just picked him up along the way.",
  'about.legends.q.ryan-reynolds.role': 'Actor · on his dog Baxter',
  'about.legends.q.george-clooney.text': 'He loves me. I can do no wrong. He follows me everywhere.',
  'about.legends.q.george-clooney.role': 'Actor · on his dog Einstein',
  'about.legends.q.bradley-cooper.text': "Charlotte loves me undyingly. They're my kids.",
  'about.legends.q.bradley-cooper.role': 'Actor · on his dog Charlotte',
  'about.legends.q.channing-tatum.text': "They just give you unconditional love. And you're never alone, they're just there.",
  'about.legends.q.channing-tatum.role': 'Actor · on his dog Lulu',
  'about.legends.q.orlando-bloom.text': 'He was more than a companion. It was a soul connection for sure.',
  'about.legends.q.orlando-bloom.role': 'Actor · on his dog Mighty',
  'about.legends.q.kevin-costner.text': "There's one that's a dog of a lifetime… and you're going to cry like a little baby when he's gone.",
  'about.legends.q.kevin-costner.role': 'Actor · on his dog Wyatt',
  'about.legends.q.tom-holland.text': "She's brilliant, my best friend.",
  'about.legends.q.tom-holland.role': 'Actor · on his dog Tessa',
  'about.legends.q.patrick-stewart.text': "We're already falling head over heels in love.",
  'about.legends.q.patrick-stewart.role': 'Actor · on his foster pup',
  'about.legends.q.jennifer-aniston.text': "The dogs are everything. They're living, breathing, pure, good love.",
  'about.legends.q.jennifer-aniston.role': 'Actor',
  'about.legends.q.salma-hayek.text': 'I have no words or tears to describe how much she meant to me.',
  'about.legends.q.salma-hayek.role': 'Actor · on her dog Lupe',
  'about.legends.q.eva-mendes.text': 'That feeling has never left me. It is one of the most special presences in my life.',
  'about.legends.q.eva-mendes.role': 'Actor · on her dog Hugo',
  'about.legends.q.chrissy-teigen.text': 'For them you are their entire book, their entire lives.',
  'about.legends.q.chrissy-teigen.role': 'Model / TV host · on her dog Penny',
  'about.legends.q.hilary-duff.text': 'You sure gave me a lot of comfort and love when I needed it the most!',
  'about.legends.q.hilary-duff.role': 'Actor / singer · on her dog Jak',
  'about.legends.q.amanda-seyfried.text': "Finn's brought all the love, warmth and total presence a girl could only dream of.",
  'about.legends.q.amanda-seyfried.role': 'Actor · on her dog Finn',
  'about.legends.q.kaley-cuoco.text': "My beloved, hilarious dog Norman's unconditional love inspired me to create this company.",
  'about.legends.q.kaley-cuoco.role': 'Actor · on her dog Norman',
  'about.legends.q.mariah-carey.text': 'There is no better dog than Jack. How could you make a dog better than Jack!',
  'about.legends.q.mariah-carey.role': 'Singer · on her dog Jack',
  'about.legends.q.billie-eilish.text': "He's such a good boy. I wish I could take him on my whole tour across the world.",
  'about.legends.q.billie-eilish.role': 'Singer · on her dog Shark',
  'about.legends.q.selena-gomez.text': 'I genuinely talk to my dogs. I totally believe that animals are healing.',
  'about.legends.q.selena-gomez.role': 'Singer / actress',
  'about.legends.q.paul-mccartney.text': 'She was a dear pet of mine. I remember John being amazed to see me being so loving to an animal.',
  'about.legends.q.paul-mccartney.role': 'The Beatles · on his dog Martha',
  'about.legends.q.john-legend.text': 'She gave us so much joy for 10 years. We love you Pippa!',
  'about.legends.q.john-legend.role': 'Singer · on his dog Pippa',
  'about.legends.q.dolly-parton.text': "'Puppy Love' was my very first record, and six decades later, my love for pets is stronger than ever.",
  'about.legends.q.dolly-parton.role': 'Singer / songwriter',
  'about.legends.q.lady-gaga.text': "Her name is Asia. She is a BATPIG. I love her, I'm her mom.",
  'about.legends.q.lady-gaga.role': 'Singer · on her dog Asia',
  'about.legends.q.conor-mcgregor.text': 'He was with me all the way, my closest companion. All the love and cuddles we will miss forever.',
  'about.legends.q.conor-mcgregor.role': 'UFC fighter · on his dog Hugo',
  'about.legends.q.lewis-hamilton.text': 'Bringing Roscoe into my life was the best decision I ever made.',
  'about.legends.q.lewis-hamilton.role': 'F1 driver · on his dog Roscoe',
  'about.legends.q.serena-williams.text': 'She was there every day to lick my leg and remind me how much she loved me.',
  'about.legends.q.serena-williams.role': 'Tennis champion · on her dog Jackie',
  'about.legends.q.tyson-fury.text': "A man's best friend. Always happy to see you. Loves you unconditionally.",
  'about.legends.q.tyson-fury.role': 'Heavyweight boxer · on his dog Cash',
  'about.legends.q.michael-phelps.text': 'Their love is unconditional and they give me and my family plenty of joy in our lives.',
  'about.legends.q.michael-phelps.role': 'Olympic swimmer',
  'about.legends.q.venus-williams.text': "Harry is my best friend! Definitely the best decision I've ever made.",
  'about.legends.q.venus-williams.role': 'Tennis champion · on her dog Harry',
  'about.legends.q.roger-federer.text': "We couldn't be happier. Welcome to the family, Willow.",
  'about.legends.q.roger-federer.role': 'Tennis champion · on his dog Willow',
  'about.legends.q.john-steinbeck.text': 'He is a good friend and traveling companion, and would rather travel about than anything he can imagine.',
  'about.legends.q.john-steinbeck.role': 'Nobel author · on his dog Charley',
  'about.legends.q.elizabeth-taylor.text': "I've never loved a dog like this in my life. Sometimes I think there's a person in there.",
  'about.legends.q.elizabeth-taylor.role': 'Actress · on her dog Sugar',
  'about.legends.q.ricky-gervais.text': 'If the kindest souls were rewarded with the longest lives, dogs would outlive us all.',
  'about.legends.q.ricky-gervais.role': 'Comedian / actor',
  'about.legends.q.gisele-bundchen.text': 'Our guardian angel is gone to heaven. She will forever live in our hearts.',
  'about.legends.q.gisele-bundchen.role': 'Supermodel · on her dog Lua',
  'about.legends.q.pablo-picasso.text': "Lump, he's not a dog, he's not a little man, he's somebody else.",
  'about.legends.q.pablo-picasso.role': 'Painter · on his dog Lump',
  'about.legends.q.mickey-rourke.text': "Sometimes when a man's alone, that's all you got is your dog. And they've meant the world to me.",
  'about.legends.q.mickey-rourke.role': 'Actor',
} as const;
