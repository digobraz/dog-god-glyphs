import type { Dict } from '../LanguageContext';
/** DOGYPT i18n — ES dictionary (machine translation, pending human review). Partial<Dict>: missing key falls back to EN. */
export const esp: Partial<Dict> = {
  // ── /vision — hero ──
  'vision.hero.title': 'La Visión',
  'vision.hero.watch': 'Ver el vídeo de introducción de Dogypt',
  'vision.hero.videoTitle': 'Vídeo de introducción DOGYPT',
  'vision.hero.playLabel': 'Reproducir el vídeo de introducción de Dogypt',

  // ── /vision — WHAT IF beats ──
  // beat 0 (intro)
  'vision.beat.dream.bigW': 'TUVE',
  'vision.beat.dream.bigG': 'UN SUEÑO',
  'vision.beat.dream.tag': 'TUVE UN SUEÑO',
  'vision.intro.lead':
    'En 2018 tuve una <span class="wf-hl">visión</span> de cómo <span class="wf-hl">salvar a cada perro de la Tierra</span>. Y en realidad es simple: cada amante de los perros <span class="wf-hl">se une en una sola comunidad</span>, una que ve al perro como <span class="wf-hl">algo más que un animal</span>. Así que aquí estamos…',

  // beat 1
  'vision.beat.symbol.bigW': 'EL',
  'vision.beat.symbol.bigG': 'SÍMBOLO',
  'vision.beat.symbol.tag': 'EL SÍMBOLO',
  'vision.beat.symbol.h':
    'Nuestro lenguaje del amor es <span class="wf-hl">DOG</span>. Y más allá de su nombre corriente, cada perro lleva su propio <span class="wf-hl">símbolo único</span>: el <span class="wf-hl">HEROGLYPH</span>. Es un <span class="wf-hl">lenguaje universal</span>, una <span class="wf-hl">herramienta sagrada</span> para unir a cada amante de los perros de la Tierra.',

  // beat 2
  'vision.beat.nation.bigW': 'UNA NACIÓN',
  'vision.beat.nation.bigG': 'CANINA',
  'vision.beat.nation.tag': 'UNA NACIÓN CANINA',
  'vision.beat.nation.h':
    'Hagamos un <span class="wf-hl">milagro</span>. Nuestro primer hito: unir a <span class="wf-hl">un millón de amantes de los perros</span>. Imagina el <span class="wf-hl">enorme poder</span> que tendríamos juntos: todo lo que podríamos hacer por nosotros, por nuestros perros y por los <span class="wf-hl">perros necesitados</span>, más allá de cualquier estado. <span class="wf-hl">Nosotros seríamos el estado.</span>',

  // beat 3
  'vision.beat.temple.bigW': 'TEMPLO',
  'vision.beat.temple.bigG': 'DIGITAL',
  'vision.beat.temple.tag': 'TEMPLO DIGITAL',
  'vision.beat.temple.h':
    'Una sola app, <span class="wf-hl">solo para verdaderos amantes de los perros</span>: nada de gente falsa. El primer <span class="wf-hl">mundo digital amigable con los perros</span> creado solo para nosotros: un hogar social y un ecosistema que de verdad ayuda — <span class="wf-hl">viajes, veterinarios, servicios, educación</span> y <span class="wf-hl">recaudaciones</span> para perros necesitados.',

  // beat 4
  'vision.beat.centers.bigW': 'CENTROS',
  'vision.beat.centers.bigG': 'REALES',
  'vision.beat.centers.tag': 'CENTROS REALES',
  'vision.beat.centers.h':
    'El viejo refugio administraba la miseria. El <span class="wf-hl">santuario</span> le pone fin. Centros reales por todo el mundo para el <span class="wf-hl">cuidado, el adiestramiento y la investigación</span>, financiados <span class="wf-hl">de forma abierta</span>, con cada cuenta sobre la mesa.',

  // beat 5
  'vision.beat.era.bigW': 'UNA NUEVA',
  'vision.beat.era.bigG': 'ERA',
  'vision.beat.era.tag': 'UNA NUEVA ERA',
  'vision.beat.era.h':
    'Más allá de fronteras y de la política, los amantes de los perros son la <span class="wf-hl">fuerza oculta más bondadosa</span> de la Tierra. Solo juntos podemos <span class="wf-hl">reconstruir el sistema</span> y cambiar el mundo, y dejar tras de nosotros algo que proteja a nuestros perros <span class="wf-hl">para siempre</span>.',

  // ── /vision — finale CTA ──
  'vision.finale.title': '¿Y si…',
  'vision.finale.lead':
    '…cada amante de los perros dijera <span style="color:#F5C73D;font-style:italic">sí</span> a una idea loca?',
  'vision.finale.cta': 'Hazte Dogyptian',
  'vision.finale.tagline': 'Una nueva era está a solo un clic de distancia.',

  // ── /heroglyph intro ──
  'heroglyph.intro.title.line1': 'El',
  'heroglyph.intro.title.line2': 'Símbolo',
  'heroglyph.intro.title.desktop': 'El Símbolo',
  'heroglyph.intro.title.sub': 'Que Cambia la Historia',

  // dictionary blok
  'heroglyph.intro.word': 'Heroglyph',
  'heroglyph.intro.ipa': '[ˈhɪr-oʊ-ɡlɪf]',
  'heroglyph.intro.noun': 'sustantivo',
  'heroglyph.intro.definition':
    'Un símbolo único que te describe a ti y a tu perro, vuestro vínculo eterno. También un billete hacia DOGYPT — el lugar donde DOG is GOD.',

  // Heroglyph slovo tooltip (desktop hover)
  'heroglyph.intro.wordTooltip': 'HERO = DOG · GLYPH = SÍMBOLO',
  'heroglyph.intro.wordTooltipSub': 'Nombre de GOD para cada DOG.',

  // CTA + outro
  'heroglyph.intro.cta': 'Crea tu Heroglyph',
  'heroglyph.intro.outro': '¡Amantes de los perros, en formación!',
  'heroglyph.intro.loading': 'Cargando…',

  // pills rad 1
  'heroglyph.intro.pill.questions.label': '12 Preguntas',
  'heroglyph.intro.pill.questions.tooltip': 'Doce respuestas rápidas sobre tu perro.',
  'heroglyph.intro.pill.minutes.label': '3 Minutos',
  'heroglyph.intro.pill.minutes.tooltip': 'Un cuestionario interactivo lleno de diversión.',
  'heroglyph.intro.pill.forever.label': 'Para siempre en DOGYPT.com',
  'heroglyph.intro.pill.forever.tooltip':
    'El nombre de tu perro para siempre en tu corazón — y en el mundo digital.',

  // pills rad 2
  'heroglyph.intro.pill.unique.label': 'Único en su especie',
  'heroglyph.intro.pill.unique.tooltip': 'No hay dos heroglyphs iguales — ¡cada símbolo es único!',
  'heroglyph.intro.pill.vow.label': 'Voto de Fe',
  'heroglyph.intro.pill.vow.tooltip': 'Tu señal de lealtad al camino Dogyptian — ¡IN DOG WE TRUST!',
  'heroglyph.intro.pill.bond.label': 'Vínculo Eterno',
  'heroglyph.intro.pill.bond.tooltip': 'Un símbolo del vínculo eterno entre tú y tu perro.',
  'heroglyph.intro.pill.payment.label': 'Un Pago Simbólico',
  'heroglyph.intro.pill.payment.tooltip':
    '11 € una sola vez — sin suscripciones. Todo el dinero se queda en DOGYPT — ¡para el desarrollo y la ayuda sistemática!',

  // showcase symbol meanings (Hekthorov heroglyf) — label + value
  'heroglyph.intro.meaning.dog.label': 'Perro',
  'heroglyph.intro.meaning.dog.value': 'Hekthor',
  'heroglyph.intro.meaning.owner.label': 'Dueño',
  'heroglyph.intro.meaning.owner.value': 'Matej',
  'heroglyph.intro.meaning.dogGender.label': 'Sexo del Perro',
  'heroglyph.intro.meaning.dogGender.value': 'Rey',
  'heroglyph.intro.meaning.dogColour.label': 'Color del Perro',
  'heroglyph.intro.meaning.dogColour.value': 'Pelaje oscuro',
  'heroglyph.intro.meaning.dogPatron.label': 'Patrón del Perro',
  'heroglyph.intro.meaning.dogPatron.value': 'Hekthor',
  'heroglyph.intro.meaning.dogOrigin.label': 'Origen del Perro',
  'heroglyph.intro.meaning.dogOrigin.value': 'Rescatado',
  'heroglyph.intro.meaning.dogBloodline.label': 'Linaje del Perro',
  'heroglyph.intro.meaning.dogBloodline.value': 'Mestizo',
  'heroglyph.intro.meaning.dogCharacter1.label': 'Carácter del Perro I',
  'heroglyph.intro.meaning.dogCharacter1.value': 'Frisbee favorito',
  'heroglyph.intro.meaning.dogCharacter2.label': 'Carácter del Perro II',
  'heroglyph.intro.meaning.dogCharacter2.value': 'Amante del agua',
  'heroglyph.intro.meaning.ownerGender.label': 'Sexo del Dueño',
  'heroglyph.intro.meaning.ownerGender.value': 'Hombre',
  'heroglyph.intro.meaning.westernZodiac.label': 'Zodíaco Occidental',
  'heroglyph.intro.meaning.westernZodiac.value': 'Leo',
  'heroglyph.intro.meaning.chineseZodiac.label': 'Zodíaco Chino',
  'heroglyph.intro.meaning.chineseZodiac.value': 'Gallo',
  'heroglyph.intro.meaning.ownerInitial.label': 'Inicial del Dueño',
  'heroglyph.intro.meaning.ownerInitial.value': 'Matej',
  'heroglyph.intro.meaning.ranking.label': 'Clasificación',
  'heroglyph.intro.meaning.ranking.value': '#1 — Primer Perro',

  // ── /heroglyph flow — step 1: name ──
  'heroglyph.flow.name.greetingPrefix': 'Hola, soy',
  'heroglyph.flow.name.greetingQuestion': '¿Cómo se llama tu perro?',
  'heroglyph.flow.name.placeholder': 'Escribe el nombre de tu perro...',
  'heroglyph.flow.name.birthday': '¿Cuándo nació tu perro?',
  'heroglyph.flow.name.continue': 'Continuar',
  'heroglyph.flow.name.infoAria': 'Información sobre Hekthor',
  'heroglyph.flow.name.whoTitle': '¿QUIÉN ES',
  'heroglyph.flow.name.whoTitleName': 'HEKTHOR?',
  'heroglyph.flow.name.whoBody':
    'Hekthor es el primer Dogyptian. Rescatado de las calles y adoptado de un refugio, su lealtad inspiró un movimiento global para honrar a los perros como dioses. Su misión es forjar un HEROGLYPH único para cada perro de la Tierra, uniendo a la mayor comunidad de amantes de los perros del mundo para ayudar a millones de perros necesitados.',
  'heroglyph.flow.name.born': 'Nacido',
  'heroglyph.flow.name.adopted': 'Adoptado',
  'heroglyph.flow.name.location': 'Ubicación',
  'heroglyph.flow.name.locationValue': 'Eslovaquia, UE',

  // ── /heroglyph flow — step 2: photo ──
  'heroglyph.flow.photo.faceOfGodPrefix': 'EL',
  'heroglyph.flow.photo.faceOfGodWord': 'ROSTRO',
  'heroglyph.flow.photo.faceOfGodSuffix': 'DE UN DIOS',
  'heroglyph.flow.photo.uploadHint': 'Sube una foto nítida de {dogName} — quedará sellada en su Heroglyph para siempre.',
  'heroglyph.flow.photo.yourDog': 'tu perro',
  'heroglyph.flow.photo.tapToUpload': 'Toca para subir',
  'heroglyph.flow.photo.changePhoto': 'Cambiar foto',
  'heroglyph.flow.photo.sealing': 'Sellando para la eternidad…',
  'heroglyph.flow.photo.sealed': '✓ Sellado',
  'heroglyph.flow.photo.uploadFailed': 'Error al subir — reintentar',
  'heroglyph.flow.photo.tipForward': 'perro de frente',
  'heroglyph.flow.photo.tipSide': 'perfil / grupo',
  'heroglyph.flow.photo.tipBest': 'Mejores resultados: rostro claramente visible, funciona recortado en círculo.',
  'heroglyph.flow.photo.next': 'SIGUIENTE →',
  'heroglyph.flow.photo.back': '← ATRÁS',
  'heroglyph.flow.photo.adjustTitle': 'AJUSTA TU RETRATO',
  'heroglyph.flow.photo.adjustHint': 'Arrastra para colocar a tu perro dentro del marco.',
  'heroglyph.flow.photo.moreTitle': 'MÁS ROSTROS DEL DIOS',
  'heroglyph.flow.photo.moreHint': 'Añade 1–3 fotos más para sorpresas más adelante. (opcional)',
  'heroglyph.flow.photo.saving': 'GUARDANDO...',

  // ── /heroglyph flow — step 3: breed ──
  'heroglyph.flow.breed.question': 'Elige el patrón de {name}.',
  'heroglyph.flow.breed.subtitle': 'Elige la silueta que se parezca a tu perro. La raza puede ayudarte, pero la decisión es tuya.',
  'heroglyph.flow.breed.fallbackHero': 'tu héroe',
  'heroglyph.flow.breed.searchPlaceholder': 'Buscar raza (orientativo)',
  'heroglyph.flow.breed.enHint': 'Escribe la raza en inglés',
  'heroglyph.flow.breed.continue': 'Continuar',
  'heroglyph.flow.breed.cat.01': 'Bolas de pelo',
  'heroglyph.flow.breed.cat.02': 'Lanudos',
  'heroglyph.flow.breed.cat.03': 'Antenas',
  'heroglyph.flow.breed.cat.04': 'Velocistas',
  'heroglyph.flow.breed.cat.05': 'Narizotas',
  'heroglyph.flow.breed.cat.06': 'Aristócratas',
  'heroglyph.flow.breed.cat.07': 'Caracaplastados',
  'heroglyph.flow.breed.cat.08': 'Chapoteadores',
  'heroglyph.flow.breed.cat.09': 'Loboides',
  'heroglyph.flow.breed.cat.10': 'Gigantes',

  // ── /heroglyph flow — step 4: ranking ──
  'heroglyph.flow.ranking.question': '¿Es {dogName} el primer perro que has tenido?',
  'heroglyph.flow.ranking.yourPup': 'tu cachorro',
  'heroglyph.flow.ranking.yesLabel': 'SÍ, mi primer amor',
  'heroglyph.flow.ranking.noLabel': '¡NO, amante de los perros para siempre!',
  'heroglyph.flow.ranking.whichDog': '¿Qué número de perro es {dogName}?',
  'heroglyph.flow.ranking.range': '11–50',
  'heroglyph.flow.ranking.enterNumber': 'Introduce el número de perro (11–50)',
  'heroglyph.flow.ranking.continue': 'Continuar',
  'heroglyph.flow.ranking.back': 'Atrás',

  // ── /heroglyph flow — step 5: owner-info ──
  'heroglyph.flow.ownerInfo.greetingPrefix': 'Bien, hablemos de ti,',
  'heroglyph.flow.ownerInfo.greetingWord': 'humano',
  'heroglyph.flow.ownerInfo.placeholder': 'Nombre del dueño...',
  'heroglyph.flow.ownerInfo.man': 'Hombre',
  'heroglyph.flow.ownerInfo.woman': 'Mujer',
  'heroglyph.flow.ownerInfo.continue': 'Continuar',
  'heroglyph.flow.ownerInfo.back': 'Atrás',

  // ── /heroglyph flow — shared ──
  'heroglyph.flow.yourDogFallback': 'TU PERRO',
  'heroglyph.flow.dogHeroglyphTitle': 'HEROGLYPH DE {dogName}',

  // ── /heroglyph flow — step 6: owner-zodiac ──
  'heroglyph.flow.ownerZodiac.question': '¿Qué dicen las estrellas sobre ti?',
  'heroglyph.flow.ownerZodiac.westernLabel': 'Signo del Zodíaco',
  'heroglyph.flow.ownerZodiac.chineseLabel': 'Zodíaco Chino',
  'heroglyph.flow.ownerZodiac.continue': 'Continuar',
  'heroglyph.flow.ownerZodiac.back': 'Atrás',
  // western sign labels (display only — enum values stay English)
  'heroglyph.flow.ownerZodiac.sign.Aries': 'Aries',
  'heroglyph.flow.ownerZodiac.sign.Taurus': 'Tauro',
  'heroglyph.flow.ownerZodiac.sign.Gemini': 'Géminis',
  'heroglyph.flow.ownerZodiac.sign.Cancer': 'Cáncer',
  'heroglyph.flow.ownerZodiac.sign.Leo': 'Leo',
  'heroglyph.flow.ownerZodiac.sign.Virgo': 'Virgo',
  'heroglyph.flow.ownerZodiac.sign.Libra': 'Libra',
  'heroglyph.flow.ownerZodiac.sign.Scorpio': 'Escorpio',
  'heroglyph.flow.ownerZodiac.sign.Sagittarius': 'Sagitario',
  'heroglyph.flow.ownerZodiac.sign.Capricorn': 'Capricornio',
  'heroglyph.flow.ownerZodiac.sign.Aquarius': 'Acuario',
  'heroglyph.flow.ownerZodiac.sign.Pisces': 'Piscis',
  // chinese animal labels (display only — enum values stay English)
  'heroglyph.flow.ownerZodiac.animal.Monkey': 'Mono',
  'heroglyph.flow.ownerZodiac.animal.Rooster': 'Gallo',
  'heroglyph.flow.ownerZodiac.animal.Dog': 'Perro',
  'heroglyph.flow.ownerZodiac.animal.Pig': 'Cerdo',
  'heroglyph.flow.ownerZodiac.animal.Rat': 'Rata',
  'heroglyph.flow.ownerZodiac.animal.Ox': 'Buey',
  'heroglyph.flow.ownerZodiac.animal.Tiger': 'Tigre',
  'heroglyph.flow.ownerZodiac.animal.Rabbit': 'Conejo',
  'heroglyph.flow.ownerZodiac.animal.Dragon': 'Dragón',
  'heroglyph.flow.ownerZodiac.animal.Snake': 'Serpiente',
  'heroglyph.flow.ownerZodiac.animal.Horse': 'Caballo',
  'heroglyph.flow.ownerZodiac.animal.Goat': 'Cabra',

  // ── /heroglyph flow — step 7: owner-final ──
  'heroglyph.flow.ownerFinal.infoAria': 'Información sobre el Heroglyph',
  'heroglyph.flow.ownerFinal.messageLine1': 'HUMANO, tu parte está hecha.',
  'heroglyph.flow.ownerFinal.messageLine2': 'Ese pequeño marco — ¡ese eres tú!',
  'heroglyph.flow.ownerFinal.messageLine3Prefix': 'Ahora terminemos el HEROGLYPH con',
  'heroglyph.flow.ownerFinal.messageLine3Suffix': ', la parte de tu perro.',
  'heroglyph.flow.ownerFinal.cta': 'VAMOS',
  'heroglyph.flow.ownerFinal.infoTitle': 'INSPIRADO EN EL ANTIGUO EGIPTO',
  'heroglyph.flow.ownerFinal.infoBody':
    'El HEROGLYPH se compone de dos marcos que juntos forman la verdadera identidad de tu perro. En el Antiguo Egipto, los nombres de dioses y faraones se escribían dentro de marcos ovalados protectores similares, llamados cartuchos, para preservar su legado por la eternidad.',
  'heroglyph.flow.ownerFinal.cleopatraAlt': 'El cartucho de Cleopatra',
  'heroglyph.flow.ownerFinal.cleopatraCaption': 'Este jeroglífico pertenece a Cleopatra.',
  'heroglyph.flow.ownerFinal.back': 'Atrás',

  // ── /heroglyph flow — step 8: dog-gender ──
  'heroglyph.flow.dogGender.infoAria': 'Información sobre el sexo del perro',
  'heroglyph.flow.dogGender.title': 'Sexo del Perro',
  'heroglyph.flow.dogGender.questionPrefix': '¿Tienes un',
  'heroglyph.flow.dogGender.questionKing': 'rey',
  'heroglyph.flow.dogGender.questionOr': 'o una',
  'heroglyph.flow.dogGender.questionQueen': 'reina',
  'heroglyph.flow.dogGender.questionSuffix': ' en casa?',
  'heroglyph.flow.dogGender.king': 'Rey',
  'heroglyph.flow.dogGender.queen': 'Reina',
  'heroglyph.flow.dogGender.info3Title': 'Corona de 3 puntas',
  'heroglyph.flow.dogGender.info3Body':
    'Para los chicos que dominan el equilibrio sobre 3 patas. Una pata arriba, máxima puntería, leyenda absoluta.',
  'heroglyph.flow.dogGender.info4Title': 'Corona de 4 puntas',
  'heroglyph.flow.dogGender.info4Body':
    'Para las chicas que prefieren la estabilidad sobre 4 patas. Máxima comodidad, cero desorden, total elegancia.',
  'heroglyph.flow.dogGender.back': 'Atrás',

  // ── /heroglyph flow — step 9: dog-fate ──
  'heroglyph.flow.dogFate.infoAria': 'Información sobre el origen del perro',
  'heroglyph.flow.dogFate.title': 'El Origen',
  'heroglyph.flow.dogFate.questionPrefix': '¿Tu perro nació en un',
  'heroglyph.flow.dogFate.questionSafe': 'hogar seguro',
  'heroglyph.flow.dogFate.questionOr': 'o recibió una',
  'heroglyph.flow.dogFate.questionSecond': 'segunda oportunidad',
  'heroglyph.flow.dogFate.questionSuffix': ' en la vida?',
  'heroglyph.flow.dogFate.raised': 'Criado',
  'heroglyph.flow.dogFate.rescued': 'Rescatado',
  'heroglyph.flow.dogFate.infoRaisedTitle': 'Chupete de bebé',
  'heroglyph.flow.dogFate.infoRaisedBody': 'Un perro nacido en la familia. Criado con amor desde el primer día.',
  'heroglyph.flow.dogFate.infoRescuedTitle': 'Salvavidas',
  'heroglyph.flow.dogFate.infoRescuedBody': 'Un perro rescatado o encontrado. Recibió una segunda oportunidad en la vida.',
  'heroglyph.flow.dogFate.back': 'Atrás',

  // ── /heroglyph flow — step 10: dog-colour ──
  'heroglyph.flow.dogColour.title': 'Color del Perro',
  'heroglyph.flow.dogColour.questionPrefix': '¿Qué',
  'heroglyph.flow.dogColour.questionCoat': 'pelaje',
  'heroglyph.flow.dogColour.questionSuffix': ' lleva tu perro?',
  'heroglyph.flow.dogColour.bright': 'Claro',
  'heroglyph.flow.dogColour.brightSub': 'Sol',
  'heroglyph.flow.dogColour.dark': 'Oscuro',
  'heroglyph.flow.dogColour.darkSub': 'Luna',
  'heroglyph.flow.dogColour.mix': 'Mezcla',
  'heroglyph.flow.dogColour.mixSub': 'Arcoíris',
  'heroglyph.flow.dogColour.back': 'Atrás',

  // ── /heroglyph flow — step 11: dog-bloodline ──
  'heroglyph.flow.dogBloodline.infoAria': 'Información sobre el linaje del perro',
  'heroglyph.flow.dogBloodline.title': 'Linaje del Perro',
  'heroglyph.flow.dogBloodline.questionPrefix': '¿Tu perro es ',
  'heroglyph.flow.dogBloodline.questionPure': 'puro',
  'heroglyph.flow.dogBloodline.questionOr': ' o ',
  'heroglyph.flow.dogBloodline.questionWild': 'salvaje',
  'heroglyph.flow.dogBloodline.questionSuffix': '?',
  'heroglyph.flow.dogBloodline.aristocrat': 'Aristócrata',
  'heroglyph.flow.dogBloodline.mutt': 'Mestizo',
  'heroglyph.flow.dogBloodline.infoSignedTitle': 'Papiro firmado',
  'heroglyph.flow.dogBloodline.infoSignedBody': 'Original con linaje puro.',
  'heroglyph.flow.dogBloodline.infoEmptyTitle': 'Papiro vacío',
  'heroglyph.flow.dogBloodline.infoEmptyBody': 'Original sin linaje puro.',
  'heroglyph.flow.dogBloodline.back': 'Atrás',

  // ── /heroglyph flow — step 12: dog-character ──
  'heroglyph.flow.dogCharacter.infoAria': 'Información sobre el carácter',
  'heroglyph.flow.dogCharacter.title': 'El Carácter',
  'heroglyph.flow.dogCharacter.questionPrefix': '¿Cómo es la ',
  'heroglyph.flow.dogCharacter.questionWord': 'personalidad',
  'heroglyph.flow.dogCharacter.questionSuffix': ' de tu perro?',
  'heroglyph.flow.dogCharacter.chooseTwo': 'Elige dos opciones.',
  'heroglyph.flow.dogCharacter.infoTitle': 'Elige el rollo de tu perro',
  'heroglyph.flow.dogCharacter.infoBody':
    'Elige los dos rasgos de carácter que mejor describen a tu perro. Estos dan forma a los símbolos dentro del Heroglyph.',
  'heroglyph.flow.dogCharacter.selectedCount': '{count}/2 seleccionados',
  'heroglyph.flow.dogCharacter.back': 'Atrás',
  'heroglyph.flow.dogCharacter.trait.guardian': 'Guardián',
  'heroglyph.flow.dogCharacter.trait.player': 'Jugador',
  'heroglyph.flow.dogCharacter.trait.energizer': 'Energético',
  'heroglyph.flow.dogCharacter.trait.maverick': 'Rebelde',
  'heroglyph.flow.dogCharacter.trait.waterlover': 'Amante del agua',
  'heroglyph.flow.dogCharacter.trait.gourmet': 'Gourmet',
  'heroglyph.flow.dogCharacter.trait.lover': 'Cariñoso',
  'heroglyph.flow.dogCharacter.trait.chiller': 'Relajado',

  // ── /heroglyph flow — step 13: reveal ──
  'heroglyph.flow.reveal.heroglyphTitle': 'El Heroglyph de {dogName}',
  'heroglyph.flow.reveal.horizontalDesign': '↔ DISEÑO HORIZONTAL',
  'heroglyph.flow.reveal.verticalDesign': '↕ DISEÑO VERTICAL',
  'heroglyph.flow.reveal.infoAria': 'Info',
  'heroglyph.flow.reveal.visionTitle': 'NUESTRA VISIÓN',
  'heroglyph.flow.reveal.visionBody': 'Nuestro plan: unir a los amantes de los perros a través de los Heroglifos. Un proyecto con alma — uno que nos ayuda a nosotros, a nuestros perros y a los perros necesitados.',
  'heroglyph.flow.reveal.visionTribute': 'Gracias por tu contribución simbólica. Con poco basta cuando somos muchos — y gracias a ti, el mundo es un poco mejor.',
  'heroglyph.flow.reveal.welcome': '¡BIENVENIDO A DOGYPT!',
  'heroglyph.flow.reveal.bond': 'Este Heroglyph es tu vínculo eterno.',
  'heroglyph.flow.reveal.cta': 'QUIERO MI HEROGLYPH',

  // ── /heroglyph flow — step 14: message ──
  'heroglyph.flow.message.promptPrefix': 'Deja un mensaje eterno para ',
  'heroglyph.flow.message.promptMid': '.',
  'heroglyph.flow.message.promptStayPrefix': 'Se quedará con él en ',
  'heroglyph.flow.message.promptStayWord': 'dogypt',
  'heroglyph.flow.message.promptStaySuffix': ' - para siempre.',
  'heroglyph.flow.message.yourMessage': 'Tu Mensaje',
  'heroglyph.flow.message.placeholder':
    'Querido {dogName}, gracias por cada día contigo (por todo lo que hemos vivido juntos)…',
  'heroglyph.flow.message.profileNotePrefix': 'Este mensaje aparecerá en el perfil de tu perro en ',
  'heroglyph.flow.message.profileNoteSite': 'DOGYPT.com',
  'heroglyph.flow.message.profileNoteSuffix': '.',
  'heroglyph.flow.message.cta': 'SELLAR EL MENSAJE →',

  // ── /heroglyph flow — checkout ──
  'heroglyph.checkout.orderSummary': 'Resumen del Pedido',
  'heroglyph.checkout.dogPossessive': 'de {dogName}',
  'heroglyph.checkout.heroglyph': 'HEROGLYPH',
  'heroglyph.checkout.yourDogFallback': 'Tu perro',
  'heroglyph.checkout.yourDetails': 'Tus Datos',
  'heroglyph.checkout.firstName': 'Nombre',
  'heroglyph.checkout.lastName': 'Apellido',
  'heroglyph.checkout.email': 'Correo electrónico',
  'heroglyph.checkout.country': 'País',
  'heroglyph.checkout.cta': 'CONTINUAR AL PAGO →',
  'heroglyph.checkout.disclaimerPrefix': 'Tras el pago, colocaremos la foto de tu perro en el sitio web y tu ',
  'heroglyph.checkout.disclaimerHighlight': 'Certificado DOGYPT',
  'heroglyph.checkout.disclaimerSuffix': ' en tu perfil.',
  'heroglyph.checkout.back': 'Atrás',
  'heroglyph.checkout.dogFallback': 'Perro',

  // ── /welcome — post-payment (WelcomeScreen) ──
  // record-moment overlay
  // goal tracker
  'welcome.goal.label': 'Nuestra Meta 🎯',
  'welcome.goal.target': '1 000 000 de Heroglyphs',
  // congrats + name
  'welcome.congratsPrefix': 'Felicidades, ',
  'welcome.congratsName': '{name}.',
  'welcome.ownerFallback': 'Amigo',
  'welcome.officiallyA': 'es oficialmente un',
  // mission text (code source of truth — renders identically)
  'welcome.missionLine1': 'La manada creció en un dios. Ahora trae al siguiente.',
  // CTA states (PREPARING → FORGING → ENTER)
  'welcome.cta.preparing': 'PREPARANDO TU LUGAR...',
  'welcome.cta.forging': 'FORJANDO TU HEROGLYPH...',
  'welcome.cta.enter': 'ENTRA ENTRE LOS DIOSES →',
  'welcome.emailHint': 'Tu certificado va en camino — revisa tu correo.',

  // ── /login — magic-link callback (Login.tsx) ──
  'login.eyebrow': 'DOGYPT · Acceso a la Pack',
  // status: verifying
  'login.verifying.title': 'Abriendo la Puerta',
  'login.verifying.body': 'Verificando tu enlace mágico…',
  // status: success
  'login.success.title': 'Bienvenido de Nuevo',
  'login.success.body': 'Redirigiéndote a tu pack…',
  // status: expired
  'login.expired.title': 'Enlace Expirado',
  'login.expired.body': 'Los enlaces mágicos duran poco. Solicita uno nuevo y lo enviaremos a tu bandeja de entrada.',
  // status: invalid
  'login.invalid.title': 'Enlace No Reconocido',
  'login.invalid.body': 'No pudimos verificar este enlace. Puede que ya se haya usado o se haya copiado de forma incorrecta.',
  // status: network
  'login.network.title': 'Problema de Conexión',
  'login.network.body': 'No pudimos llegar al templo. Comprueba tu conexión e inténtalo de nuevo.',
  // status: missing
  'login.missing.title': 'No Se Encontró Ningún Token',
  'login.missing.body': 'Esta página espera un enlace mágico de tu correo. Revisa tu bandeja de entrada y busca el más reciente.',
  // resend button states
  'login.resend.idle': 'Reenviar enlace mágico',
  'login.resend.sending': 'Enviando…',
  'login.resend.sent': 'Enlace mágico enviado',
  'login.backHome': 'Volver al inicio',
  'login.homeAria': 'Inicio de DOGYPT',

  // ── 404 — NotFound.tsx ──
  'notFound.code': '404',
  'notFound.message': '¡Vaya! Página no encontrada',
  'notFound.returnHome': 'Volver al inicio',

  // ── /about — opening (origin + Star Wars crawl) ──
  'about.origin.title': 'El Origen',
  'about.origin.sub': 'Desliza y lee',
  'about.origin.skip': 'o salta',
  'about.crawl.intro': 'Hace diez años, en un refugio en el corazón de Europa….',
  'about.crawl.episode': 'Episodio I',
  'about.crawl.faith': 'Una Nueva Fe',
  'about.crawl.p1':
    'En 2016, ocho cachorros negros llegaron al refugio, tirados en una sola caja. Siete encontraron hogar. Al más grande nadie lo quería — esperó un año entero. Se llamaba Hekthor.',
  'about.crawl.p2':
    'Un día una pareja vino al refugio a ver a Sindy, una pequeña hembra blanca que querían adoptar. Por pura casualidad, Hekthor estaba en ese momento en su jaula — la suya se estaba limpiando. El hombre, que solo había venido por acompañar y nunca había querido un perro, se enamoró del perro negro que veía por primera vez.',
  'about.crawl.p3':
    'Una semana después los dos estaban juntos, y comenzó una hermosa historia. Toda la vida del hombre cambió, y con el tiempo entendió una cosa: solo quien tiene un perro, y sabe lo que se siente con el amor de un perro, puede de verdad ayudar a los perros necesitados.',
  'about.crawl.p4':
    'Y así nació el Heroglyph — un símbolo destinado a unir a los amantes de los perros de todas partes en la mayor comunidad que el mundo haya conocido jamás. Una comunidad que estará por nosotros, por nuestros perros y por las generaciones venideras — por personas que no temen admitir que un perro no es solo un animal, sino un ser que nos hace mejores seres humanos.',
  'about.crawl.p5':
    'Ahora mismo comienza el camino hacia el primer hito — crear 1 000 000 de Heroglyphs. Y tú puedes ser parte de ello. Porque los únicos lo bastante locos para creer que pueden cambiar el mundo son los que lo cambian.',
  'about.crawl.p6': 'IN DOG WE TRUST.',

  // ── /about — timeline (5 milestones) ──
  'about.timeline.heading': 'La Historia de Dogypt',
  'about.milestone.1.year': '2017',
  'about.milestone.1.tag': 'El Refugio',
  'about.milestone.1.title': 'Un Tesoro en el Refugio',
  'about.milestone.1.body':
    'Un perro negro que nadie quería esperaba tras la valla de un refugio. Su nombre llegó a ser Hekthor. Adoptarlo no fue un rescate — fue el comienzo de todo.',
  'about.milestone.2.year': '2018',
  'about.milestone.2.tag': 'El Vínculo',
  'about.milestone.2.title': 'Un Vínculo para Siempre',
  'about.milestone.2.body':
    'Me arrastró a través del tramo más duro de mi vida sin decir una sola palabra. Todo amante de los perros lo sabe — te sostienen justo cuando estás cayendo.',
  'about.milestone.3.year': '2019',
  'about.milestone.3.tag': 'El Viaje',
  'about.milestone.3.title': 'La Caminata que se Convirtió en Libro',
  'about.milestone.3.body':
    'Juntos caminamos por toda Eslovaquia — 42 días, 800 kilómetros, una promesa silenciosa. Aquel camino se convirtió en un libro: «Cesta s Hrdinom» — El Camino con un Héroe.',
  'about.milestone.4.year': '2022',
  'about.milestone.4.tag': 'El Nombre',
  'about.milestone.4.title': 'Una Nación de Amantes de los Perros',
  'about.milestone.4.body':
    'Pirámides, misticismo, la gloria eterna de Egipto — la humanidad lleva milenios fascinada. Une eso con el amor infinito de un perro y obtienes DOGYPT. Sellé la idea en la Expo Dubái 2022, vestido de faraón.',
  'about.milestone.5.year': 'Ahora',
  'about.milestone.5.tag': 'Dogypt',
  'about.milestone.5.title': 'El Viaje Empieza Contigo',
  'about.milestone.5.body':
    'DOGYPT es un movimiento para todos cuya vida fue cambiada por un perro. Construido sobre el vínculo más antiguo y honesto de la Tierra. Hekthor es el fundador #1. Tú eres el siguiente.',

  // ── /about — outro + reel ──
  'about.outro.quoteLead': 'Nunca Fue',
  'about.outro.quoteTail': '«Solo un Perro».',
  'about.outro.body':
    'Ya conoces la sensación — que un perro no es algo que posees, es <strong>alguien a quien amas</strong>. Ahora imagina ese amor organizado, conectado, <strong>lo bastante poderoso para cambiar las cosas.</strong> Y por eso existe <strong>DOGYPT</strong>.',
  'about.outro.name1': 'Matej',
  'about.outro.and': 'y',
  'about.outro.name2': 'Hekthor',
  'about.outro.cta': 'Hazte Dogyptian',
  'about.reel.prev': 'Foto anterior',
  'about.reel.next': 'Foto siguiente',

  // ── /religion — hero hook (cow vs dog) ──
  'religion.hook.number': '1,2',
  'religion.hook.billion': 'MIL MILLONES',
  'religion.hook.people': 'DE PERSONAS',
  'religion.hook.note': '(15% del mundo)',
  'religion.hook.bow': 'se inclinan ante la vaca',
  'religion.hook.doglovers': '¿AMANTES DE LOS PERROS?',
  'religion.hook.worship': 'ADOREMOS A NUESTROS PERROS.',
  'religion.cta': 'Hazte Dogyptian',
  'religion.aria.question': 'La Pregunta',
  'religion.aria.preamble': 'Preámbulo',
  'religion.aria.sacredIndex': 'Índice Sagrado',
  'religion.aria.scrollDown': 'Desplázate hacia abajo',

  // ── /religion — preamble (In Dog We Trust) ──
  // headlineGrad / headlineLine = motto → EN fallback (omitted)
  'religion.preamble.text':
    'Nosotros, la nación de los amantes de los perros — conociendo la <strong>lealtad infinita</strong>, el <strong>amor verdadero</strong> y el <strong>alma pura</strong> de cada perro de la Tierra — con el fin de elevar la posición de los perros en la sociedad humana, construirles una <strong>comunidad</strong>, <strong>mejorar</strong> sus vidas y <strong>reescribir</strong> el destino de cada perro necesitado, nos otorgamos esta constitución.',
  'religion.preamble.oath': 'El Juramento de la Pack',

  // ── /religion — sacred index ──
  'religion.bookTitle': 'La «Biblia» para los amantes de los perros',

  // ── /religion — Constitution book (ConstitutionBook.tsx) ──
  'religion.book.sealAlt': 'El sello Dogyptian',
  // titleThe / titleBrand / titleConstitution / trust = brand → EN fallback (omitted)
  'religion.book.sub': 'Lectura obligatoria para que todo amante de los perros se convierta en Dogyptian.',
  'religion.book.cta1.kicker': 'El Camino Comienza',
  'religion.book.cta1.head': 'Únete a la<br />Religión',
  'religion.book.cta1.text': 'Apúntate a la religión canina — toma un Heroglyph.',
  'religion.book.cta1.btn': 'Hazte Dogyptian',
  'religion.book.cta2.kicker': 'La Palabra Entera',
  'religion.book.cta2.head': 'Lee la<br />Constitución',
  'religion.book.cta2.text': 'Cada canon, credo y mandamiento — al completo.',
  'religion.book.cta2.btn': 'Constitución Completa',
  'religion.book.coverOpenAria': 'Abrir la Constitución',
  'religion.book.coverAlt': 'La Constitución Dogyptian',
  'religion.book.hint': 'Toca el libro para abrir',
  'religion.book.close': 'Cerrar libro',
  'religion.book.prevPage': 'Página anterior',
  'religion.book.nextPage': 'Página siguiente',

  // ── shared nav (PageNav top-bar + Wall) — CSS uppercases for display ──
  'nav.wall': 'Muro',
  'nav.vision': 'Visión',
  'nav.religion': 'Religión',
  'nav.about': 'Nosotros',

  // ── / (Wall / GodsGrid) ──
  // hero card — "DOG is GOD." motto stays EN inline (not keyed)
  'wall.hero.taglineLead': 'El lugar donde',
  'wall.hero.cta': 'Hazte Dogyptian',
  'wall.hero.total': '1 000 000',
  'wall.hero.dogs': 'PERROS',
  // Hekthor founder card
  'wall.hektor.msg': 'El perro que lo empezó todo. Adoptado en 2017. Todo viaje comienza con un paso — el suyo fue una caminata de 42 días por toda Eslovaquia.',
  // info overlay
  'wall.info.title': '1 000 000 de perros.<br/>¿Lo lograremos?',
  'wall.info.body': 'DOGYPT es un movimiento para amantes de los perros. Cada perro recibe un Heroglyph único — su lugar permanente en la manada global. Estamos reuniendo un millón de héroes. Sé de los primeros.',
  // filter / numpad
  'wall.filter.find': 'Buscar perro por número',
  'wall.filter.center': 'Centrar la cuadrícula',
  'wall.filter.placeholder': 'Perro #',
  'wall.filter.clear': 'Borrar',
  'wall.filter.confirm': 'Confirmar',

  // ── nav a11y (PageNav aria-labels + language modal) ──
  'nav.aria.back': 'Atrás',
  'nav.aria.openMenu': 'Abrir menú',
  'nav.aria.menu': 'Menú',
  'nav.aria.wallHome': 'WALL — inicio',
  'nav.aria.chooseLanguage': 'Elegir idioma',
  'nav.langModal.title': 'Elegir idioma',
  'nav.aria.close': 'Cerrar',

  // ── /payment (PaymentScreen) ──
  'payment.title': 'Pago Seguro',
  'payment.product': 'CERTIFICADO DOGYPT HEROGLYPH para {dogName}',
  'payment.yourDog': 'tu perro',
  'payment.sealing': 'SELLANDO LA FOTO...',
  'payment.preparing': 'PREPARANDO...',
  'payment.pay': 'PAGAR CON STRIPE',
  'payment.secured': 'Protegido por Stripe · Tarjeta, Apple Pay, Google Pay',
  'payment.back': 'Atrás',

  // ── /terms + /privacy — shared legal chrome ──
  // legal.eyebrow + legal.motto = brand → EN fallback (omitted)
  'legal.updated': 'Última actualización: 4 de mayo de 2026 · v1.0',
  // legally binding version = EN; translations are convenience (rendered in all langs)
  'legal.langNote':
    'Este documento se ofrece en varios idiomas por comodidad. Si las versiones difieren, prevalece la versión en inglés.',

  // ── /terms ──
  'terms.title': 'Términos del Servicio',
  'terms.linkPrivacy': 'Política de Privacidad →',
  'terms.s1.title': '1. Quiénes Somos',
  'terms.s1.body':
    'DOGYPT s.r.o., una sociedad de responsabilidad limitada eslovaca inscrita en el Registro Mercantil (IČO 54 444 594), con domicilio social en Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Eslovaquia. A lo largo de estos Términos nos referimos a nosotros como «DOGYPT», «nosotros» o «nos», y a ti como «tú» o «Miembro». Al usar dogypt.com, el flujo HEROGLYPH o cualquier servicio relacionado (en conjunto, el «Servicio») aceptas estos Términos. Fecha de entrada en vigor: 4 de mayo de 2026.',
  'terms.s2.title': '2. Elegibilidad',
  'terms.s2.body':
    'Debes tener al menos 16 años para usar el Servicio. Al crear una cuenta o completar una compra confirmas que tienes 16 años o más, que toda la información que facilitas es verdadera y que tu uso del Servicio es lícito en el país donde resides.',
  'terms.s3.title': '3. Cuenta y Membresía de la Pack',
  'terms.s3.body':
    'El acceso se concede mediante un enlace mágico enviado a tu correo; no se almacena ninguna contraseña. Tu cuenta es personal — por favor, no compartas el acceso. Podemos suspender o cerrar cuentas que abusen del Servicio, acosen a otros Miembros o infrinjan estos Términos. Puedes solicitar la eliminación de tu cuenta en cualquier momento escribiendo a privacy@dogypt.com.',
  'terms.s4.title': '4. Heroglyph y Bienes Digitales',
  'terms.s4.body':
    'Lo que compras es un bien digital: un HEROGLYPH personal (un certificado simbólico único), una versión PDF de ese certificado, la entrada de tu perro en el GodsGrid público y el acceso continuo a tu perfil de Pack. Te otorgamos una licencia personal, intransferible y no exclusiva para usar estos bienes digitales con fines personales no comerciales. No se envía nada físico. La reproducción, reventa o explotación comercial de las ilustraciones o recursos del HEROGLYPH requiere nuestro consentimiento previo por escrito.',
  'terms.s5.title': '5. Pagos',
  'terms.s5.body':
    'Los pagos los procesa Stripe Payments Europe, Ltd. Nunca vemos ni almacenamos los datos completos de tu tarjeta. Los precios se muestran en la moneda del momento de pago (por defecto USD); cualquier IVA aplicable se calcula y se muestra antes de que pagues. El pedido que confirmas al pagar es el pedido que entregamos — no cambiaremos el alcance ni el precio después.',
  'terms.s6.title': '6. Reembolsos y Derecho de Desistimiento',
  'terms.s6.body':
    'Conforme a la Directiva UE 2011/83/UE, los consumidores normalmente disponen de 14 días para desistir de un contrato a distancia. Dado que el HEROGLYPH se entrega como contenido digital inmediatamente tras el pago, al hacer clic en «Pagar» otorgas tu consentimiento previo expreso a la ejecución inmediata y reconoces que, por ello, pierdes tu derecho de desistimiento en cuanto comienza la entrega (art. 16(m) de la Directiva). Si algo falla por nuestra parte — un archivo dañado, un cargo duplicado, un pedido cancelado — escribe a support@dogypt.com en un plazo de 14 días y te reembolsaremos o reenviaremos, sin preguntas.',
  'terms.s7.title': '7. Uso Aceptable',
  'terms.s7.body':
    'No subas nada sobre lo que no tengas derecho a subir. Esto incluye fotos de otras personas, material protegido por derechos de autor o contenido que muestre crueldad, actividad ilegal o contenido sexual con menores. No acoses, suplantes ni amenaces a otros Miembros. No hagas scraping, descargas masivas, ingeniería inversa ni intentes interrumpir el Servicio. Podemos eliminar contenido o cuentas que incumplan estas reglas, con o sin previo aviso.',
  'terms.s8.title': '8. Responsabilidad y Exenciones',
  'terms.s8.body':
    'El HEROGLYPH es un producto simbólico y ceremonial — no es asesoramiento veterinario, médico, conductual ni de cría. El Servicio se presta «tal cual». En la máxima medida permitida por la ley eslovaca y de la UE, nuestra responsabilidad total por cualquier reclamación derivada del Servicio se limita al importe que nos pagaste en los 12 meses anteriores a la reclamación. Nada de lo aquí dispuesto limita la responsabilidad por fraude, negligencia grave o derechos que no puedan renunciarse conforme a la ley aplicable.',
  'terms.s9.title': '9. Cambios en estos Términos',
  'terms.s9.body':
    'Podemos actualizar estos Términos a medida que crece el Servicio. Los cambios materiales se anunciarán por correo electrónico con al menos 30 días de antelación a su entrada en vigor. Las aclaraciones menores entran en vigor con su publicación. El uso continuado del Servicio tras la fecha de entrada en vigor significa que aceptas los nuevos Términos. Las versiones anteriores se conservan en archivo y están disponibles a petición.',
  'terms.s10.title': '10. Legislación Aplicable y Conflictos',
  'terms.s10.body':
    'Estos Términos se rigen por las leyes de la República Eslovaca, excluyendo sus normas de conflicto de leyes. Los conflictos que no puedan resolverse de forma informal quedan sujetos a la jurisdicción de los tribunales eslovacos competentes en nuestro domicilio social. Los consumidores de la UE también pueden utilizar la plataforma europea de Resolución de Litigios en Línea en https://ec.europa.eu/consumers/odr.',
  'terms.s11.title': '11. Contacto',
  'terms.s11.body':
    'Preguntas generales: info@dogypt.com · Privacidad y solicitudes de datos: privacy@dogypt.com · Reembolsos y soporte: support@dogypt.com · Correo postal: DOGYPT s.r.o., Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Eslovaquia.',

  // ── /privacy ──
  'privacy.title': 'Política de Privacidad',
  'privacy.linkTerms': 'Términos del Servicio →',
  'privacy.s1.title': '1. Quiénes Somos',
  'privacy.s1.body':
    'DOGYPT s.r.o., una sociedad de responsabilidad limitada eslovaca (IČO 54 444 594), domicilio social Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Eslovaquia. Somos el responsable de los datos personales descritos a continuación. Para cualquier cuestión relacionada con la privacidad, escribe a privacy@dogypt.com. No hemos nombrado un Delegado de Protección de Datos porque nuestro tratamiento no alcanza los umbrales del art. 37 del RGPD. Fecha de entrada en vigor: 4 de mayo de 2026.',
  'privacy.s2.title': '2. Datos que Recopilamos',
  'privacy.s2.body':
    'Cuando usas el flujo HEROGLYPH recopilamos: tu dirección de correo electrónico, el nombre de tu perro, la foto de tu perro que subes (almacenada en Cloudinary), las respuestas simbólicas que eliges (sexo, color, destino, linaje, carácter, tu zodíaco, tu inicial) y la fecha de nacimiento de tu perro si la facilitas. Stripe recopila tus datos de pago directamente — nosotros recibimos solo una confirmación de pago, los últimos 4 dígitos de la tarjeta y el país. Nuestros servidores registran automáticamente datos técnicos (dirección IP, agente de usuario, hora de la solicitud) para seguridad y prevención de abusos.',
  'privacy.s3.title': '3. Cómo los Usamos',
  'privacy.s3.body':
    'Usamos tus datos para: generar y entregar tu certificado HEROGLYPH; enviarte el correo con el certificado y un pequeño número de mensajes de seguimiento de la Pack; mostrar la entrada de tu perro en el GodsGrid público (solo aparecen públicamente el nombre del perro, la foto y el símbolo HEROGLYPH — nunca tu correo, tu nombre ni tu código privado); operar, asegurar y mejorar el Servicio; cumplir obligaciones legales como la contabilidad y la protección del consumidor.',
  'privacy.s4.title': '4. Base Legal (RGPD)',
  'privacy.s4.body':
    'Nos basamos en el art. 6(1)(b) del RGPD (ejecución de un contrato) para la entrega del HEROGLYPH y la membresía de la Pack; en el art. 6(1)(a) (consentimiento) para cualquier correo de marketing más allá de los mensajes del servicio — puedes retirarlo en cualquier momento; en el art. 6(1)(f) (interés legítimo) para el registro de seguridad, la prevención de abusos y la analítica agregada; y en el art. 6(1)(c) (obligación legal) para los registros fiscales y contables.',
  'privacy.s5.title': '5. Compartición y Subencargados',
  'privacy.s5.body':
    'No vendemos tus datos. Solo los compartimos con subencargados que nos ayudan a operar el Servicio: Stripe Payments Europe, Ltd. (pagos) · Cloudinary Ltd. (almacenamiento y entrega de fotos) · Resend, Inc. (correo transaccional) · Supabase, Inc. (base de datos y autenticación) · WebSupport s.r.o. (alojamiento web) · GitHub, Inc. (canal de despliegue). Cada subencargado está vinculado por su propio acuerdo de tratamiento de datos.',
  'privacy.s6.title': '6. Cookies y Rastreo',
  'privacy.s6.body':
    'Usamos solo las cookies y el almacenamiento local que necesitamos para que el Servicio funcione (sesión, idioma, tus selecciones de HEROGLYPH en curso). No ejecutamos publicidad de terceros ni píxeles de rastreo entre sitios. Si añadimos analítica de producto respetuosa con la privacidad (como Plausible), actualizaremos esta sección antes de activarla.',
  'privacy.s7.title': '7. Conservación',
  'privacy.s7.body':
    'Tu HEROGLYPH y tu perfil de Pack se conservan mientras exista tu cuenta, porque el GodsGrid es el registro vitalicio de cada miembro de la Pack. Los registros de correo transaccional se conservan durante 12 meses para soporte y prevención del fraude. Los registros contables se conservan durante 10 años según exige la ley eslovaca (Ley 431/2002 Coll.). Cuando nos pides eliminar tu cuenta, eliminamos los identificadores personales en un plazo de 30 días y conservamos solo el mínimo legalmente exigido.',
  'privacy.s8.title': '8. Tus Derechos',
  'privacy.s8.body':
    'Conforme al RGPD tienes derecho a acceder a tus datos, a rectificarlos, a que se supriman, a restringir u oponerte al tratamiento, a la portabilidad de los datos y a retirar el consentimiento en cualquier momento. También puedes presentar una reclamación ante la autoridad de control eslovaca — Úrad na ochranu osobných údajov SR, Hraničná 12, 820 07 Bratislava 27, statny.dozor@pdp.gov.sk. Para ejercer cualquiera de estos derechos escribe a privacy@dogypt.com — respondemos en un plazo de 30 días.',
  'privacy.s9.title': '9. Transferencias Internacionales',
  'privacy.s9.body':
    'Algunos de nuestros subencargados (Stripe, Cloudinary, Resend, Supabase, GitHub) operan servidores fuera de la UE/EEE, principalmente en Estados Unidos. Cuando los datos personales salen de la UE/EEE, nos basamos en las Cláusulas Contractuales Tipo de la Comisión Europea, el Marco de Privacidad de Datos UE–EE. UU. y las salvaguardas adicionales exigidas por el Capítulo V del RGPD.',
  'privacy.s10.title': '10. Cambios en esta Política',
  'privacy.s10.body':
    'Te informaremos de los cambios materiales por correo electrónico con al menos 30 días de antelación a su entrada en vigor. Las ediciones menores — erratas, actualizaciones de nombres de subencargados, nuevas direcciones de contacto — entran en vigor con su publicación. La versión y fecha actuales están siempre en la parte superior de esta página; las versiones anteriores están disponibles a petición.',
  'privacy.s11.title': '11. Contacto',
  'privacy.s11.body':
    'Privacidad y solicitudes de datos: privacy@dogypt.com · Preguntas generales: info@dogypt.com · Correo postal: DOGYPT s.r.o., Jaslovské Bohunice 335, 919 30 Jaslovské Bohunice, Eslovaquia.',

  // ── /about — Council (We Need You) ──
  'about.council.imgAlt': 'Un faraón con Hekthor y sus gatos — Dogypt te necesita',
  'about.council.headline': 'Te Necesita.',
  'about.council.sub':
    'DOGYPT lo construyen personas que saben lo que significa un perro. Si tienes algo que aportar — una habilidad, una voz, una visión — aquí es donde pertenece.',
  'about.council.rolesAria': 'Elige tu rol',
  'about.council.role.dog-lover.label': 'Amante de los perros y tester',
  'about.council.role.dog-lover.desc': 'Acceso anticipado y opinión honesta',
  'about.council.role.developer.label': 'Desarrollador / Diseñador',
  'about.council.role.developer.desc': 'Crear funciones, diseñar lo visual',
  'about.council.role.dog-pro.label': 'Profesional Canino',
  'about.council.role.dog-pro.desc': 'Veterinario, adiestrador, refugio, criador',
  'about.council.role.creator.label': 'Creador',
  'about.council.role.creator.desc': 'Vídeo, foto, arte para la manada',
  'about.council.role.media.label': 'Medios / Influencer',
  'about.council.role.media.desc': 'Audiencia y cobertura',
  'about.council.role.investor.label': 'Inversor',
  'about.council.role.investor.desc': 'Financiar misiones y refugios concretos',
  'about.council.role.community.label': 'Constructor de Comunidad',
  'about.council.role.community.desc': 'Organizar a la gente a nivel local',
  'about.council.role.business.label': 'Negocios y Alianzas',
  'about.council.role.business.desc': 'Abrir puertas — marcas, refugios, acuerdos',
  'about.council.fullName': 'Nombre completo',
  'about.council.email': 'Correo electrónico',
  'about.council.message': 'Cuéntanos qué aportas… (opcional)',
  'about.council.error': 'Algo salió mal. Inténtalo de nuevo.',
  'about.council.sending': 'Enviando…',
  'about.council.submit': 'Únete al Consejo',
  'about.council.successTitle': 'Estás en el Consejo.',
  'about.council.successSub': 'Nos pondremos en contacto cuando llegue el momento adecuado.',

  // ── /about — Footer ──
  'about.footer.sealAlt': 'Sello DOGYPT',
  // about.footer.motto = brand → EN fallback (omitted)
  'about.footer.mission': 'Un movimiento para todos cuya vida fue cambiada por un perro.',
  'about.footer.privacy': 'Privacidad',
  'about.footer.terms': 'Términos',

  // ── /about — Legends (testimonials) ──
  'about.legends.title': 'HASTA LAS LEYENDAS SE ARRODILLARON',
  'about.legends.sub':
    'Los humanos más poderosos que jamás vivieron se inclinaron todos ante el mismo maestro silencioso — y lo dejaron por escrito.',
  'about.legends.creditsSummary': 'Citas de entrevistas públicas · Créditos de las fotos',
  'about.legends.creditsIntro':
    'Retratos vía Wikimedia Commons bajo licencias Creative Commons / dominio público.',
  // citáty: EN = canonical verbatim; preklady = preklad citátu
  'about.legends.q.oprah-winfrey.text': 'El amor más verdadero y puro… es el amor que viene de tu perro.',
  'about.legends.q.oprah-winfrey.role': 'Icono cultural',
  'about.legends.q.chris-evans.text': 'No tenía ninguna intención de rescatar un perro ese día, pero en cuanto lo vi supe que se venía a casa conmigo.',
  'about.legends.q.chris-evans.role': 'Actor · sobre su perro Dodger',
  'about.legends.q.tom-hardy.text': 'Era un Ángel. Y era mi mejor amigo. Solo conocía el amor.',
  'about.legends.q.tom-hardy.role': 'Actor · sobre su perro Woody',
  'about.legends.q.dwayne-johnson.text': 'Siempre te querremos. Siempre serás mi pequeño compañero del alma.',
  'about.legends.q.dwayne-johnson.role': 'Actor · sobre su perro Brutus',
  'about.legends.q.miley-cyrus.text': 'Me enseñaste a amar sin miedo a la pérdida.',
  'about.legends.q.miley-cyrus.role': 'Cantante · sobre su perro Floyd',
  'about.legends.q.ariana-grande.text': 'Los perros son los seres más inofensivos y dulces del mundo. No muestran más que amor incondicional.',
  'about.legends.q.ariana-grande.role': 'Cantante',
  'about.legends.q.hugh-jackman.text': 'Siempre, siempre lo llamé la estrella de rock. ¡Porque lo era!',
  'about.legends.q.hugh-jackman.role': 'Actor · sobre su perro Dali',
  'about.legends.q.drew-barrymore.text': 'No creo que ni siquiera el cliché del amor incondicional sea suficiente.',
  'about.legends.q.drew-barrymore.role': 'Actriz · sobre su perra Flossie',
  'about.legends.q.henry-cavill.text': 'Me ha salvado el pellejo emocional y psicológico un montón de veces.',
  'about.legends.q.henry-cavill.role': 'Actor · sobre su perro Kal',
  'about.legends.q.ryan-reynolds.text': 'Simplemente me enamoré de él. No era mi intención, solo lo recogí por el camino.',
  'about.legends.q.ryan-reynolds.role': 'Actor · sobre su perro Baxter',
  'about.legends.q.george-clooney.text': 'Me quiere. No puedo hacer nada mal. Me sigue a todas partes.',
  'about.legends.q.george-clooney.role': 'Actor · sobre su perro Einstein',
  'about.legends.q.bradley-cooper.text': 'Charlotte me quiere sin reservas. Son mis hijos.',
  'about.legends.q.bradley-cooper.role': 'Actor · sobre su perra Charlotte',
  'about.legends.q.channing-tatum.text': 'Simplemente te dan amor incondicional. Y nunca estás solo, siempre están ahí.',
  'about.legends.q.channing-tatum.role': 'Actor · sobre su perra Lulu',
  'about.legends.q.orlando-bloom.text': 'Era más que un compañero. Era una conexión de almas, sin duda.',
  'about.legends.q.orlando-bloom.role': 'Actor · sobre su perro Mighty',
  'about.legends.q.kevin-costner.text': 'Hay uno que es el perro de toda una vida… y vas a llorar como un bebé cuando se vaya.',
  'about.legends.q.kevin-costner.role': 'Actor · sobre su perro Wyatt',
  'about.legends.q.tom-holland.text': 'Es brillante, mi mejor amiga.',
  'about.legends.q.tom-holland.role': 'Actor · sobre su perra Tessa',
  'about.legends.q.patrick-stewart.text': 'Ya estamos cayendo perdidamente enamorados.',
  'about.legends.q.patrick-stewart.role': 'Actor · sobre su cachorro de acogida',
  'about.legends.q.jennifer-aniston.text': 'Los perros lo son todo. Son amor puro, bueno, vivo y que respira.',
  'about.legends.q.jennifer-aniston.role': 'Actriz',
  'about.legends.q.salma-hayek.text': 'No tengo palabras ni lágrimas para describir lo mucho que significó para mí.',
  'about.legends.q.salma-hayek.role': 'Actriz · sobre su perra Lupe',
  'about.legends.q.eva-mendes.text': 'Esa sensación nunca me ha abandonado. Es una de las presencias más especiales de mi vida.',
  'about.legends.q.eva-mendes.role': 'Actriz · sobre su perro Hugo',
  'about.legends.q.chrissy-teigen.text': 'Para ellos tú eres su libro entero, su vida entera.',
  'about.legends.q.chrissy-teigen.role': 'Modelo / presentadora · sobre su perra Penny',
  'about.legends.q.hilary-duff.text': '¡Me diste tanto consuelo y amor cuando más lo necesitaba!',
  'about.legends.q.hilary-duff.role': 'Actriz / cantante · sobre su perro Jak',
  'about.legends.q.amanda-seyfried.text': 'Finn ha traído todo el amor, la calidez y la presencia total con que una chica solo podría soñar.',
  'about.legends.q.amanda-seyfried.role': 'Actriz · sobre su perro Finn',
  'about.legends.q.kaley-cuoco.text': 'El amor incondicional de mi querido y divertido perro Norman me inspiró a crear esta empresa.',
  'about.legends.q.kaley-cuoco.role': 'Actriz · sobre su perro Norman',
  'about.legends.q.mariah-carey.text': '¡No hay mejor perro que Jack. ¿Cómo podrías hacer un perro mejor que Jack!',
  'about.legends.q.mariah-carey.role': 'Cantante · sobre su perro Jack',
  'about.legends.q.billie-eilish.text': 'Es un chico tan bueno. Ojalá pudiera llevarlo en toda mi gira por el mundo.',
  'about.legends.q.billie-eilish.role': 'Cantante · sobre su perro Shark',
  'about.legends.q.selena-gomez.text': 'De verdad hablo con mis perros. Creo totalmente que los animales sanan.',
  'about.legends.q.selena-gomez.role': 'Cantante / actriz',
  'about.legends.q.paul-mccartney.text': 'Era una querida mascota mía. Recuerdo a John asombrado de verme tan cariñoso con un animal.',
  'about.legends.q.paul-mccartney.role': 'The Beatles · sobre su perra Martha',
  'about.legends.q.john-legend.text': 'Nos dio tanta alegría durante 10 años. ¡Te queremos, Pippa!',
  'about.legends.q.john-legend.role': 'Cantante · sobre su perra Pippa',
  'about.legends.q.dolly-parton.text': '«Puppy Love» fue mi primer disco, y seis décadas después, mi amor por las mascotas es más fuerte que nunca.',
  'about.legends.q.dolly-parton.role': 'Cantante / compositora',
  'about.legends.q.lady-gaga.text': 'Se llama Asia. Es una BATPIG. La quiero, soy su mamá.',
  'about.legends.q.lady-gaga.role': 'Cantante · sobre su perra Asia',
  'about.legends.q.conor-mcgregor.text': 'Estuvo conmigo hasta el final, mi compañero más cercano. Echaremos de menos para siempre todo el amor y los mimos.',
  'about.legends.q.conor-mcgregor.role': 'Luchador de UFC · sobre su perro Hugo',
  'about.legends.q.lewis-hamilton.text': 'Traer a Roscoe a mi vida fue la mejor decisión que he tomado en mi vida.',
  'about.legends.q.lewis-hamilton.role': 'Piloto de F1 · sobre su perro Roscoe',
  'about.legends.q.serena-williams.text': 'Estaba allí cada día para lamerme la pierna y recordarme cuánto me quería.',
  'about.legends.q.serena-williams.role': 'Campeona de tenis · sobre su perra Jackie',
  'about.legends.q.tyson-fury.text': 'El mejor amigo del hombre. Siempre feliz de verte. Te quiere incondicionalmente.',
  'about.legends.q.tyson-fury.role': 'Boxeador de peso pesado · sobre su perro Cash',
  'about.legends.q.michael-phelps.text': 'Su amor es incondicional y nos dan a mí y a mi familia mucha alegría en nuestras vidas.',
  'about.legends.q.michael-phelps.role': 'Nadador olímpico',
  'about.legends.q.venus-williams.text': '¡Harry es mi mejor amigo! Sin duda la mejor decisión que he tomado en mi vida.',
  'about.legends.q.venus-williams.role': 'Campeona de tenis · sobre su perro Harry',
  'about.legends.q.roger-federer.text': 'No podríamos ser más felices. Bienvenida a la familia, Willow.',
  'about.legends.q.roger-federer.role': 'Campeón de tenis · sobre su perra Willow',
  'about.legends.q.john-steinbeck.text': 'Es un buen amigo y compañero de viaje, y preferiría viajar antes que cualquier cosa que pueda imaginar.',
  'about.legends.q.john-steinbeck.role': 'Autor Nobel · sobre su perro Charley',
  'about.legends.q.elizabeth-taylor.text': 'Nunca en mi vida he querido a un perro así. A veces creo que hay una persona ahí dentro.',
  'about.legends.q.elizabeth-taylor.role': 'Actriz · sobre su perra Sugar',
  'about.legends.q.ricky-gervais.text': 'Si las almas más bondadosas fueran premiadas con las vidas más largas, los perros nos sobrevivirían a todos.',
  'about.legends.q.ricky-gervais.role': 'Cómico / actor',
  'about.legends.q.gisele-bundchen.text': 'Nuestro ángel de la guarda se ha ido al cielo. Vivirá para siempre en nuestros corazones.',
  'about.legends.q.gisele-bundchen.role': 'Supermodelo · sobre su perra Lua',
  'about.legends.q.pablo-picasso.text': 'Lump no es un perro, no es un hombrecito, es alguien más.',
  'about.legends.q.pablo-picasso.role': 'Pintor · sobre su perro Lump',
  'about.legends.q.mickey-rourke.text': 'A veces, cuando un hombre está solo, lo único que tienes es tu perro. Y para mí han significado el mundo entero.',
  'about.legends.q.mickey-rourke.role': 'Actor',

  // ── added 2026-06-17 (launch translation delta) ──
  "heroglyph.flow.dogCharacter.slideLabel": "DIAPOSITIVA",
  "heroglyph.flow.dogCharacter.slideAriaLabel": "Siguiente diapositiva de carácter",
  "heroglyph.flow.dogCharacter.slide.guardian.title": "Guardian (Ojo de Dogo)",
  "heroglyph.flow.dogCharacter.slide.player.title": "Player (Pelota Alada)",
  "heroglyph.flow.dogCharacter.slide.energizer.title": "Energizer (Batería Llena)",
  "heroglyph.flow.dogCharacter.slide.maverick.title": "Maverick (Señal Pirata)",
  "heroglyph.flow.dogCharacter.slide.waterlover.title": "Waterlover (Olas)",
  "heroglyph.flow.dogCharacter.slide.gourmet.title": "Gourmet (Cuenco Infinito)",
  "heroglyph.flow.dogCharacter.slide.lover.title": "Lover (Amor)",
  "heroglyph.flow.dogCharacter.slide.chiller.title": "Chiller (Sofá)",
  "heroglyph.flow.dogCharacter.slide.guardian.desc": "Vigila la puerta como si fueran las puertas del más allá. Ladra primero, pregunta nunca.",
  "heroglyph.flow.dogCharacter.slide.player.desc": "Vendería su alma por un lanzamiento más de la pelota. Mayor alegría: su juguete favorito.",
  "heroglyph.flow.dogCharacter.slide.energizer.desc": "Sin interruptor de apagado. Sin batería necesaria. La pregunta más frecuente: ¿qué le das a tu perro?",
  "heroglyph.flow.dogCharacter.slide.maverick.desc": "Pirata moderno con su propio mundo y sus propias reglas. La audición selectiva es su primera ley.",
  "heroglyph.flow.dogCharacter.slide.waterlover.desc": "Existen dos tipos de perros — y uno puede confundirse con un pez. Pelo mojado: 100% felicidad.",
  "heroglyph.flow.dogCharacter.slide.gourmet.desc": "La comida es la misión. Plena dedicación, cero dudas — y se comerá lo que tú no termines.",
  "heroglyph.flow.dogCharacter.slide.lover.desc": "Jamás ha conocido a un extraño. Trata al cartero como a un alma gemela perdida hace mucho. Cada vez.",
  "heroglyph.flow.dogCharacter.slide.chiller.desc": "Ha dominado el antiguo arte de no hacer absolutamente nada, y con estilo.",
  "heroglyph.flow.message.done": "Listo",
  "welcome.password.title": "Tu cuenta: {email}",
  "welcome.password.placeholder": "Contraseña (mín. 8 caracteres)",
  "welcome.password.confirm": "Confirmar contraseña",
  "welcome.password.submit": "Establecer contraseña y entrar",
  "welcome.password.processing": "Estableciendo contraseña…",
  "welcome.password.mismatch": "Las contraseñas no coinciden.",
  "welcome.password.tooShort": "La contraseña debe tener al menos 8 caracteres.",
  "welcome.password.notPaid": "El pago aún está procesándose — inténtalo de nuevo en unos segundos.",
  "welcome.password.error": "Algo salió mal. Inténtalo de nuevo.",
  "welcome.password.altLink": "¿Prefieres un enlace? Está en tu correo.",
  "login.recovery.title": "Establecer Nueva Contraseña",
  "login.recovery.body": "Elige una nueva contraseña para tu cuenta.",
  "login.password.placeholder": "Contraseña",
  "login.password.submit": "Iniciar sesión",
  "login.password.submitting": "Iniciando sesión…",
  "login.password.error": "Correo o contraseña incorrectos.",
  "login.password.networkError": "Error de conexión. Inténtalo de nuevo.",
  "login.password.forgotPassword": "¿Olvidaste tu contraseña?",
  "login.password.magicLinkAlt": "Envíame un enlace por correo",
  "login.magicLink.placeholder": "tu@correo.com",
  "login.magicLink.submit": "Enviar enlace mágico",
  "login.magicLink.submitting": "Enviando…",
  "login.magicLink.sent": "Enlace mágico enviado — revisa tu bandeja de entrada.",
  "login.forgot.prompt": "Ingresa tu correo para restablecer tu contraseña.",
  "login.forgot.placeholder": "tu@correo.com",
  "login.forgot.submit": "Enviar enlace de restablecimiento",
  "login.forgot.submitting": "Enviando…",
  "login.forgot.sent": "Revisa tu bandeja de entrada para restablecer.",
  "login.forgot.back": "Volver al inicio de sesión",
  "login.recovery.newPasswordPlaceholder": "Nueva contraseña (mín. 8 caracteres)",
  "login.recovery.submit": "Establecer nueva contraseña",
  "login.recovery.submitting": "Guardando…",
  "login.recovery.success": "Contraseña actualizada — iniciando sesión…",
  "religion.preamble.headlineGrad": "En Perro",
  "religion.preamble.headlineLine": "Confiamos",
  "religion.book.titleThe": "La",
  "religion.book.titleBrand": "Dogypt",
  "religion.book.titleConstitution": "Constitución",
  "religion.book.trust": "En Perro Confiamos",
  "payment.transparency.title": "100% Transparencia",
  "transparency.part.development": "Desarrollo",
  "transparency.part.affiliate": "Afiliados",
  "transparency.part.directHelp": "Ayuda directa",
  "transparency.part.hekthorBowl": "El cuenco de Hekthor",
  "transparency.part.development.note": "Construir la nación y financiar todo lo que la mantiene en marcha — las personas que hacen avanzar DOGYPT, los servicios, las herramientas y los servidores detrás de ellas. Este es el motor del movimiento, y cada gasto quedará documentado y publicado abiertamente.",
  "transparency.part.affiliate.note": "No son anuncios — son personas. Esto va directo a las cuentas de los Dogyptians que difunden la fe, pagado en BONES: gástalos luego dentro de DOGYPT o dónalos a perros necesitados. Invertimos en la manada, nunca en marketing caro — la manada lleva la palabra mucho más lejos.",
  "transparency.part.directHelp.note": "Directo a los perros necesitados — refugios, comida, facturas del veterinario y misiones de rescate. Sin intermediarios, sin gastos extra: esta parte va donde está el sufrimiento, y cada céntimo queda documentado, con recibo y hecho público para toda la manada.",
  "transparency.part.hekthorBowl.note": "El perro fundador que lo empezó todo. Su parte mantiene viva la promesa original y el sueño sigue siendo gloriosamente simple: hazte millonario ayudando a los perros, no a su costa. Hekthor come primero, para que el resto de la manada nunca pase hambre.",
  "legal.eyebrow": "DOGYPT · Legal",
  "legal.motto": "DOGYPT · En Perro Confiamos",
  "about.council.formTitle": "Únete a la Misión",
  "about.council.consent": "Al enviar, acepto recibir correos de DOGYPT — sin anuncios, solo movilización del Pack y comunicación.",
  "about.footer.motto": "En perro confiamos.",
};
