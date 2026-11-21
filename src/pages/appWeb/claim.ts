/** CLAIM 2 (Matej 21. 11. 2026) — nový hlavný claim a texty homepage, výber z nákresu
 *  `plany/nakresy/web-claim-struktura-2026-11-21/vyber.json`. Zatiaľ LEN za `?claim` (AppWeb.tsx, `V2`),
 *  na LIVE až po Matejovom „ok“. Prebíja COPY/COPY3 aj `copyLangs/*.json` pri rovnakom kľúči;
 *  chýbajúci jazyk → EN. Kódy jazykov = `langs.ts`.
 *  Hero: nad nadpisom, čo to je · nadpis „Každé hovno sa počíta“ na tri riadky (h1a · h1b · h1c zlaté) ·
 *  podnadpis Matejov · CTA „Vstúp do DOGYPTU“ · pod ním „Náš cieľ: N / 1 000 000 psov“. */
type Row = Record<string, string>;
export const CLAIM: Record<string, Row> = {
 /* menu: odkaz na planétku so psami (Matej 21. 11.: „PSY“) */
 nav_dogs: { sk: 'Psy', en: 'Dogs', cs: 'Psi', deu: 'Hunde', pol: 'Psy', ukr: 'Собаки', esp: 'Perros', fra: 'Chiens', ita: 'Cani', prt: 'Cães', nld: 'Honden', tur: 'Köpekler', rus: 'Собаки', ara: 'الكلاب', chn: '狗狗', jpn: '犬たち', kor: '강아지들', ind: 'कुत्ते' },
 e_life2: { sk: 'Appka pre život so psom', en: 'The app for life with a dog', cs: 'Appka pro život se psem', deu: 'Die App fürs Leben mit Hund', pol: 'Apka na życie z psem', ukr: 'Застосунок для життя з собакою', esp: 'La app para la vida con perro', fra: 'L’appli pour la vie avec un chien', ita: 'L’app per la vita con il cane', prt: 'A app para a vida com cão', nld: 'De app voor het leven met een hond', tur: 'Köpekle hayatın uygulaması', rus: 'Приложение для жизни с собакой', ara: 'تطبيق الحياة مع الكلب', chn: '与狗生活的应用', jpn: '犬との暮らしのアプリ', kor: '반려견과의 삶을 위한 앱', ind: 'कुत्ते के साथ जीवन का ऐप' },
 /* rozdelenie čo najrovnomernejšie (Matej 21. 11.: „sa daj do 2. riadku“): h1a = 1. riadok · h1b + zlaté h1c = 2. riadok */
 h1a: { sk: 'Každé hovno', en: 'Every sh*t', cs: 'Každé h*vno', deu: 'Jeder Sch*iß', pol: 'Każda k*pa', ukr: 'Кожне г*вно', esp: 'Cada caca', fra: 'Chaque crotte', ita: 'Ogni cacca', prt: 'Cada cocó', nld: 'Elke dr*l', tur: 'Her b*k', rus: 'Каждая к*чка', ara: 'كل خ*ء', chn: '每一坨屎', jpn: 'う〇こ1個も', kor: '똥 하나하나가', ind: 'हर पॉटी' },
 h1b: { sk: 'sa', en: '', cs: 'se', deu: '', pol: 'się', ukr: '', esp: '', fra: '', ita: '', prt: '', nld: '', tur: '', rus: '', ara: '', chn: '', jpn: '', kor: '', ind: '' },
 h1y: { sk: '', en: '', cs: '', deu: '', pol: '', ukr: '', esp: '', fra: '', ita: '', prt: '', nld: '', tur: '', rus: '', ara: '', chn: '', jpn: '', kor: '', ind: '' },
 h1c: { sk: 'POČÍTA.', en: 'COUNTS.', cs: 'POČÍTÁ.', deu: 'ZÄHLT.', pol: 'LICZY.', ukr: 'РАХУЄТЬСЯ.', esp: 'CUENTA.', fra: 'COMPTE.', ita: 'CONTA.', prt: 'CONTA.', nld: 'TELT.', tur: 'SAYILIR.', rus: 'НА СЧЕТУ.', ara: 'يُحتسب.', chn: '都算数。', jpn: 'カウント。', kor: '다 점수.', ind: 'गिनी जाती है।' },
 seo_t: { sk: 'Každé hovno sa počíta', en: 'Every sh*t counts', cs: 'Každé h*vno se počítá', deu: 'Jeder Sch*iß zählt', pol: 'Każda k*pa się liczy', ukr: 'Кожне г*вно рахується', esp: 'Cada caca cuenta', fra: 'Chaque crotte compte', ita: 'Ogni cacca conta', prt: 'Cada cocó conta', nld: 'Elke dr*l telt', tur: 'Her b*k sayılır', rus: 'Каждая к*чка на счету', ara: 'كل خ*ء يُحتسب', chn: '每一坨屎都算数', jpn: 'う〇こ1個もカウント', kor: '똥 하나하나가 다 점수', ind: 'हर पॉटी गिनी जाती है' },
 /* bez zalomenia natvrdo: text tečie sám, max 3 riadky (Matej 21. 11.: „texting je zle oddelený“) */
 sub: {
  sk: 'Výlety, veterinár, AI mentor, zoznamka, prvá pomoc, edukácia aj denník. Všetko, čo psíčkar potrebuje, v jednej appke, ktorá ho baví. ZADARMO.',
  en: 'Trips, vets, an AI mentor, dog-friend dating, first aid, education and a diary. Everything a dog person needs, in one app they enjoy. FREE.',
  cs: 'Výlety, veterinář, AI mentor, seznamka, první pomoc, vzdělávání i deník. Všechno, co pejskař potřebuje, v jedné appce, která ho baví. ZDARMA.',
  deu: 'Ausflüge, Tierarzt, KI-Mentor, Hundefreunde-Börse, Erste Hilfe, Wissen und Tagebuch. Alles, was ein Hundemensch braucht, in einer App, die Spaß macht. GRATIS.',
  pol: 'Wycieczki, weterynarz, mentor AI, randki psiarzy, pierwsza pomoc, edukacja i dziennik. Wszystko, czego psiarz potrzebuje, w jednej apce, która go bawi. ZA DARMO.',
  ukr: 'Мандрівки, ветеринар, ШІ-ментор, знайомства, перша допомога, навчання і щоденник. Усе, що потрібно собачнику, в одному застосунку, який приносить радість. БЕЗКОШТОВНО.',
  esp: 'Excursiones, veterinario, mentor IA, citas perrunas, primeros auxilios, formación y diario. Todo lo que necesita quien tiene perro, en una app que divierte. GRATIS.',
  fra: 'Balades, vétérinaire, mentor IA, rencontres canines, premiers secours, savoir et journal. Tout ce qu’il faut quand on a un chien, dans une appli qui amuse. GRATUIT.',
  ita: 'Gite, veterinario, mentore IA, incontri tra cinofili, primo soccorso, formazione e diario. Tutto ciò che serve a chi ha un cane, in un’app che diverte. GRATIS.',
  prt: 'Passeios, veterinário, mentor IA, encontros caninos, primeiros socorros, formação e diário. Tudo o que quem tem cão precisa, numa app que diverte. GRÁTIS.',
  nld: 'Uitstapjes, dierenarts, AI-mentor, hondenmatch, eerste hulp, kennis en dagboek. Alles wat een hondenmens nodig heeft, in één app die leuk is. GRATIS.',
  tur: 'Geziler, veteriner, yapay zekâ mentoru, köpekseverlerle tanışma, ilk yardım, eğitim ve günlük. Köpek sahibinin ihtiyacı olan her şey, keyif veren tek bir uygulamada. ÜCRETSİZ.',
  rus: 'Походы, ветеринар, ИИ-наставник, знакомства, первая помощь, обучение и дневник. Всё, что нужно собачнику, в одном приложении, которое радует. БЕСПЛАТНО.',
  ara: 'رحلات، بيطري، مرشد ذكي، تعارف، إسعافات أولية، تعلّم ويوميات. كل ما يحتاجه صاحب الكلب في تطبيق واحد ممتع. مجانًا.',
  chn: '出游、兽医、AI 导师、狗友交友、急救、知识和日记。 养狗人需要的一切，都在一个好玩的应用里。免费。',
  jpn: 'おでかけ、獣医、AIメンター、犬友マッチング、応急処置、学び、日記。 犬と暮らす人に必要なすべてを、楽しいひとつのアプリに。無料。',
  kor: '나들이, 수의사, AI 멘토, 반려인 만남, 응급처치, 배움, 일기. 반려인에게 필요한 모든 것을 즐거운 앱 하나에. 무료.',
  ind: 'सैर, पशु चिकित्सक, AI मेंटर, डॉग-दोस्त मुलाक़ात, प्राथमिक उपचार, सीख और डायरी। कुत्ते वाले को जो कुछ चाहिए, एक मज़ेदार ऐप में। मुफ़्त।',
 },
 start: { sk: 'Vstúp do DOGYPTU', en: 'Enter DOGYPT', cs: 'Vstup do DOGYPTU', deu: 'Tritt DOGYPT bei', pol: 'Wejdź do DOGYPTU', ukr: 'Увійди в DOGYPT', esp: 'Entra en DOGYPT', fra: 'Entre dans DOGYPT', ita: 'Entra in DOGYPT', prt: 'Entra no DOGYPT', nld: 'Stap DOGYPT binnen', tur: 'DOGYPT’e gir', rus: 'Войди в DOGYPT', ara: 'ادخل DOGYPT', chn: '进入 DOGYPT', jpn: 'DOGYPTに入る', kor: 'DOGYPT 입장하기', ind: 'DOGYPT में आएँ' },
 /* tlačidlo v hlavičke (Matej 21. 11.: „namiesto Vstúp dajme Pridaj sa“); v hero ostáva „Vstúp do DOGYPTU“ */
 start_s: { sk: 'Pridaj sa', en: 'Join', cs: 'Přidej se', deu: 'Mach mit', pol: 'Dołącz', ukr: 'Приєднуйся', esp: 'Únete', fra: 'Rejoins-nous', ita: 'Unisciti', prt: 'Junta-te', nld: 'Doe mee', tur: 'Katıl', rus: 'Присоединяйся', ara: 'انضم', chn: '加入', jpn: '参加する', kor: '함께하기', ind: 'जुड़ें' },
 goal: { sk: 'Náš cieľ:', en: 'Our goal:', cs: 'Náš cíl:', deu: 'Unser Ziel:', pol: 'Nasz cel:', ukr: 'Наша мета:', esp: 'Nuestra meta:', fra: 'Notre objectif :', ita: 'Il nostro obiettivo:', prt: 'O nosso objetivo:', nld: 'Ons doel:', tur: 'Hedefimiz:', rus: 'Наша цель:', ara: 'هدفنا:', chn: '我们的目标：', jpn: '目標：', kor: '우리의 목표:', ind: 'हमारा लक्ष्य:' },
 /* ŽIVOT HROU — Matejova poznámka v nákrese: „reálny multiplayer, Pes má len jeden život, hraj ho naplno!“ */
 e_life3: { sk: 'Reálny multiplayer', en: 'Real-life multiplayer', cs: 'Reálný multiplayer', deu: 'Echter Multiplayer', pol: 'Prawdziwy multiplayer', ukr: 'Справжній мультиплеєр', esp: 'Multijugador real', fra: 'Multijoueur réel', ita: 'Multiplayer reale', prt: 'Multijogador real', nld: 'Echte multiplayer', tur: 'Gerçek multiplayer', rus: 'Настоящий мультиплеер', ara: 'لعب جماعي حقيقي', chn: '真实多人游戏', jpn: 'リアルマルチプレイ', kor: '리얼 멀티플레이', ind: 'असली मल्टीप्लेयर' },
 h_life2a: { sk: 'Pes má len jeden', en: 'A dog gets one', cs: 'Pes má jen jeden', deu: 'Ein Hund hat nur ein', pol: 'Pies ma tylko jedno', ukr: 'У собаки лише одне', esp: 'Un perro solo tiene una', fra: 'Un chien n’a qu’une', ita: 'Un cane ha una sola', prt: 'Um cão só tem uma', nld: 'Een hond heeft maar één', tur: 'Bir köpeğin tek bir', rus: 'У собаки всего одна', ara: 'للكلب', chn: '狗只有一次', jpn: '犬の一生は', kor: '개의 삶은', ind: 'कुत्ते का एक ही' },
 h_life2b: { sk: 'ŽIVOT.', en: 'LIFE.', cs: 'ŽIVOT.', deu: 'LEBEN.', pol: 'ŻYCIE.', ukr: 'ЖИТТЯ.', esp: 'VIDA.', fra: 'VIE.', ita: 'VITA.', prt: 'VIDA.', nld: 'LEVEN.', tur: 'HAYATI var.', rus: 'ЖИЗНЬ.', ara: 'حياة واحدة.', chn: '生命。', jpn: '一度きり。', kor: '단 한 번.', ind: 'जीवन है।' },
 h_life2c: { sk: 'Hraj ho naplno!', en: 'Play it well!', cs: 'Hraj ho naplno!', deu: 'Spiel es richtig!', pol: 'Graj na całego!', ukr: 'Грай на повну!', esp: '¡Juégala a tope!', fra: 'Joue-la à fond !', ita: 'Giocala fino in fondo!', prt: 'Joga-a a fundo!', nld: 'Speel het voluit!', tur: 'Dolu dolu oyna!', rus: 'Играй на полную!', ara: 'العبها كاملة!', chn: '尽情去玩！', jpn: '思いきり遊ぼう！', kor: '마음껏 플레이!', ind: 'जी भरकर खेलो!' },
 /* AINUBIS — nadpis z citátu, ktorý na slajde už je („Viac vedieť znamená menej sa báť“); text pomenuje bolesť */
 h_ai1: { sk: 'Viac vedieť.', en: 'Know more.', cs: 'Víc vědět.', deu: 'Mehr wissen.', pol: 'Wiedzieć więcej.', ukr: 'Знати більше.', esp: 'Saber más.', fra: 'Savoir plus.', ita: 'Sapere di più.', prt: 'Saber mais.', nld: 'Meer weten.', tur: 'Daha çok bil.', rus: 'Знать больше.', ara: 'اعرف أكثر.', chn: '知道更多。', jpn: 'もっと知る。', kor: '더 많이 알면', ind: 'ज़्यादा जानो।' },
 h_ai2: { sk: 'Menej sa', en: 'Fear', cs: 'Míň se', deu: 'Weniger', pol: 'Bać się', ukr: 'Боятися', esp: 'Temer', fra: 'Craindre', ita: 'Temere', prt: 'Temer', nld: 'Minder', tur: 'Daha az', rus: 'Бояться', ara: 'خَف', chn: '害怕', jpn: '不安は', kor: '걱정은', ind: 'कम' },
 h_ai3b: { sk: 'BÁŤ.', en: 'LESS.', cs: 'BÁT.', deu: 'ANGST.', pol: 'MNIEJ.', ukr: 'МЕНШЕ.', esp: 'MENOS.', fra: 'MOINS.', ita: 'MENO.', prt: 'MENOS.', nld: 'ANGST.', tur: 'KORK.', rus: 'МЕНЬШЕ.', ara: 'أقل.', chn: '更少。', jpn: '減る。', kor: '줄어든다.', ind: 'डरो।' },
 l_ai: {
  sk: 'Alergia, svrbenie, strava, ktorá nesadla. AINUBIS prečítal knihy, štúdie a stovky hodín prednášok, aby si k veterinárovi išiel pripravený.',
  en: 'Allergies, itching, food that did not sit well. AINUBIS read the books, the studies and hundreds of hours of lectures, so you walk into the vet prepared.',
  cs: 'Alergie, svědění, strava, která nesedla. AINUBIS přečetl knihy, studie a stovky hodin přednášek, abys k veterináři šel připravený.',
  deu: 'Allergie, Juckreiz, Futter, das nicht bekommt. AINUBIS hat Bücher, Studien und Hunderte Stunden Vorträge gelesen, damit du vorbereitet zum Tierarzt gehst.',
  pol: 'Alergia, świąd, karma, która nie posłużyła. AINUBIS przeczytał książki, badania i setki godzin wykładów, żebyś szedł do weterynarza przygotowany.',
  ukr: 'Алергія, свербіж, корм, який не підійшов. AINUBIS прочитав книги, дослідження і сотні годин лекцій, щоб ти йшов до ветеринара підготовленим.',
  esp: 'Alergia, picor, comida que no sentó bien. AINUBIS leyó los libros, los estudios y cientos de horas de charlas para que llegues al veterinario preparado.',
  fra: 'Allergie, démangeaisons, nourriture mal tolérée. AINUBIS a lu les livres, les études et des centaines d’heures de conférences pour que tu arrives chez le vétérinaire préparé.',
  ita: 'Allergia, prurito, cibo che non è andato giù. AINUBIS ha letto libri, studi e centinaia di ore di lezioni, così arrivi dal veterinario preparato.',
  prt: 'Alergia, comichão, comida que não caiu bem. O AINUBIS leu os livros, os estudos e centenas de horas de palestras para chegares ao veterinário preparado.',
  nld: 'Allergie, jeuk, voer dat niet goed viel. AINUBIS las de boeken, de studies en honderden uren lezingen, zodat je voorbereid naar de dierenarts gaat.',
  tur: 'Alerji, kaşıntı, iyi gelmeyen mama. AINUBIS kitapları, araştırmaları ve yüzlerce saatlik konuşmayı okudu ki veterinere hazırlıklı git.',
  rus: 'Аллергия, зуд, корм, который не подошёл. AINUBIS прочитал книги, исследования и сотни часов лекций, чтобы ты шёл к ветеринару подготовленным.',
  ara: 'حساسية، حكّة، طعام لم يناسبه. قرأ AINUBIS الكتب والدراسات ومئات الساعات من المحاضرات لتذهب إلى البيطري مستعدًا.',
  chn: '过敏、瘙痒、不合适的食物。AINUBIS 读过书籍、研究和数百小时的讲座，让你有备而去见兽医。',
  jpn: 'アレルギー、かゆみ、合わなかったごはん。AINUBISは本や研究、何百時間もの講義を読み込みました。あなたが準備して獣医に行けるように。',
  kor: '알레르기, 가려움, 맞지 않았던 사료. AINUBIS는 책과 연구, 수백 시간의 강의를 읽었습니다. 준비된 채로 수의사를 만날 수 있도록.',
  ind: 'एलर्जी, खुजली, खाना जो रास नहीं आया। AINUBIS ने किताबें, शोध और सैकड़ों घंटों के व्याख्यान पढ़े हैं, ताकि आप पशु चिकित्सक के पास तैयार होकर जाएँ।',
 },
 /* INSTAGRAM — „na smiech“ mierilo na človeka, ktorý psovi profil vedie; kontroverzia ide proti algoritmu */
 cap1: {
  sk: 'Psí profil na Instagrame je milý nápad. Len ho algoritmus pre ľudí nikdy neocení.',
  en: 'A dog profile on Instagram is a sweet idea. An algorithm built for people will just never value it.',
  cs: 'Psí profil na Instagramu je milý nápad. Jen ho algoritmus pro lidi nikdy neocení.',
  deu: 'Ein Hundeprofil auf Instagram ist eine nette Idee. Nur wird ein Algorithmus für Menschen es nie zu schätzen wissen.',
  pol: 'Psi profil na Instagramie to miły pomysł. Tyle że algorytm dla ludzi nigdy go nie doceni.',
  ukr: 'Собачий профіль в Instagram — мила ідея. Та алгоритм для людей ніколи його не оцінить.',
  esp: 'Un perfil de perro en Instagram es una idea simpática. Pero un algoritmo hecho para personas nunca lo valorará.',
  fra: 'Un profil de chien sur Instagram, c’est une jolie idée. Mais un algorithme fait pour les humains ne l’appréciera jamais.',
  ita: 'Un profilo da cane su Instagram è un’idea carina. Ma un algoritmo fatto per le persone non lo apprezzerà mai.',
  prt: 'Um perfil de cão no Instagram é uma ideia simpática. Mas um algoritmo feito para pessoas nunca lhe dará valor.',
  nld: 'Een hondenprofiel op Instagram is een leuk idee. Alleen zal een algoritme voor mensen het nooit waarderen.',
  tur: 'Instagram’da köpek profili tatlı bir fikir. Ama insanlar için yazılmış bir algoritma ona asla değer vermez.',
  rus: 'Собачий профиль в Instagram — милая идея. Только алгоритм для людей никогда его не оценит.',
  ara: 'حساب للكلب على إنستغرام فكرة لطيفة. لكن خوارزمية صُمّمت للبشر لن تقدّره أبدًا.',
  chn: '在 Instagram 上给狗开账号是个可爱的主意。只是为人设计的算法永远不会看重它。',
  jpn: 'Instagramの犬アカウントは素敵なアイデア。でも人間向けのアルゴリズムは、決して評価してくれません。',
  kor: '인스타그램의 강아지 계정은 귀여운 아이디어예요. 다만 사람을 위한 알고리즘은 결코 알아주지 않죠.',
  ind: 'Instagram पर कुत्ते की प्रोफ़ाइल एक प्यारा विचार है। बस इंसानों के लिए बना एल्गोरिदम इसकी क़द्र कभी नहीं करेगा।',
 },
 /* ODZNAKY PRI TELEFÓNOCH (Matej 21. 11.: „doladiť texting a popis k tým odznakom“) — názov = level, popis = čo sa počíta. Čísla sedia s ikonkou: pilgrim-1 = pásmo 4–7, servant-2 = 9–13 rokov, ucen-4 = 10 % */
 fl1a: { sk: 'Pútnik level 5', en: 'Pilgrim level 5', cs: 'Poutník level 5', deu: 'Pilger Level 5', pol: 'Pielgrzym level 5', ukr: 'Паломник рівень 5', esp: 'Peregrino nivel 5', fra: 'Pèlerin niveau 5', ita: 'Pellegrino livello 5', prt: 'Peregrino nível 5', nld: 'Pelgrim level 5', tur: 'Hacı seviye 5', rus: 'Пилигрим, уровень 5', ara: 'الرحّالة المستوى 5', chn: '朝圣者 5 级', jpn: '巡礼者 レベル 5', kor: '순례자 레벨 5', ind: 'तीर्थयात्री लेवल 5' },
 fl1b: { sk: 'Každý kilometer sa počíta', en: 'Every kilometre counts', cs: 'Každý kilometr se počítá', deu: 'Jeder Kilometer zählt', pol: 'Każdy kilometr się liczy', ukr: 'Кожен кілометр рахується', esp: 'Cada kilómetro cuenta', fra: 'Chaque kilomètre compte', ita: 'Ogni chilometro conta', prt: 'Cada quilómetro conta', nld: 'Elke kilometer telt', tur: 'Her kilometre sayılır', rus: 'Каждый километр на счету', ara: 'كل كيلومتر يُحتسب', chn: '每一公里都算数', jpn: '1キロも全部カウント', kor: '1킬로미터도 다 점수', ind: 'हर किलोमीटर गिना जाता है' },
 fl2b: { sk: '3 285 dní zbierania kôpok', en: '3,285 days of picking up poop', cs: '3 285 dní sbírání hromádek', deu: '3.285 Tage Häufchen sammeln', pol: '3 285 dni sprzątania kupek', ukr: '3 285 днів прибирання купок', esp: '3.285 días recogiendo cacas', fra: '3 285 jours à ramasser les crottes', ita: '3.285 giorni a raccogliere cacche', prt: '3285 dias a apanhar cocós', nld: '3.285 dagen drollen opruimen', tur: '3.285 gün kaka toplama', rus: '3 285 дней уборки кучек', ara: '3285 يومًا من جمع الفضلات', chn: '捡便便 3285 天', jpn: 'うんち拾い 3,285日', kor: '똥 치우기 3,285일', ind: '3,285 दिन पॉटी उठाना' },
 fl3a: { sk: 'Učeň level 4', en: 'Disciple level 4', cs: 'Učeň level 4', deu: 'Schüler Level 4', pol: 'Uczeń level 4', ukr: 'Учень рівень 4', esp: 'Discípulo nivel 4', fra: 'Disciple niveau 4', ita: 'Discepolo livello 4', prt: 'Discípulo nível 4', nld: 'Leerling level 4', tur: 'Çırak seviye 4', rus: 'Ученик, уровень 4', ara: 'تلميذ المستوى 4', chn: '学徒 4 级', jpn: '弟子 レベル 4', kor: '제자 레벨 4', ind: 'शिष्य लेवल 4' },
 fl3b: { sk: '10 % psieho rozumu prečítaných', en: '10 % of Dog Sense read', cs: '10 % psího rozumu přečteno', deu: '10 % Hundeverstand gelesen', pol: '10 % psiego rozumu przeczytane', ukr: '10 % Dog Sense прочитано', esp: '10 % de Dog Sense leído', fra: '10 % de Dog Sense lu', ita: '10 % di Dog Sense letto', prt: '10 % do Dog Sense lido', nld: '10 % van Dog Sense gelezen', tur: 'Dog Sense’in %10’u okundu', rus: '10 % Dog Sense прочитано', ara: 'قُرئ 10% من Dog Sense', chn: 'Dog Sense 已读 10%', jpn: 'Dog Sense 10% 読了', kor: 'Dog Sense 10% 읽음', ind: 'Dog Sense का 10% पढ़ा' },
 /* SOS — riadky ako v SOS appky (SosButton.tsx); zbierky, útulky, týranie = čoskoro */
 sos_lost: { sk: 'Stratený pes: leták a poplach v okolí', en: 'Lost dog: a flyer and an alert nearby', cs: 'Ztracený pes: leták a poplach v okolí', deu: 'Hund entlaufen: Flyer und Alarm in der Nähe', pol: 'Zaginiony pies: ulotka i alarm w okolicy', ukr: 'Загублений пес: листівка і тривога поблизу', esp: 'Perro perdido: cartel y alerta en la zona', fra: 'Chien perdu : affiche et alerte à proximité', ita: 'Cane smarrito: volantino e allerta in zona', prt: 'Cão perdido: cartaz e alerta na zona', nld: 'Hond kwijt: flyer en alarm in de buurt', tur: 'Kayıp köpek: el ilanı ve yakındakilere uyarı', rus: 'Пропала собака: листовка и тревога поблизости', ara: 'كلب مفقود: منشور وتنبيه في المنطقة', chn: '走失的狗：寻狗启事与附近警报', jpn: '迷子の犬：チラシと近所への通知', kor: '잃어버린 개: 전단지와 근처 알림', ind: 'खोया कुत्ता: पर्चा और आस-पास अलर्ट' },
 sos_danger: { sk: 'Nahlás nebezpečenstvo na mape', en: 'Report a danger on the map', cs: 'Nahlas nebezpečí na mapě', deu: 'Gefahr auf der Karte melden', pol: 'Zgłoś zagrożenie na mapie', ukr: 'Повідом про небезпеку на мапі', esp: 'Avisa de un peligro en el mapa', fra: 'Signale un danger sur la carte', ita: 'Segnala un pericolo sulla mappa', prt: 'Assinala um perigo no mapa', nld: 'Meld gevaar op de kaart', tur: 'Haritada tehlike bildir', rus: 'Сообщи об опасности на карте', ara: 'بلّغ عن خطر على الخريطة', chn: '在地图上报告危险', jpn: '地図で危険を知らせる', kor: '지도에 위험 알리기', ind: 'नक्शे पर ख़तरे की सूचना दें' },
 sos_fund: { sk: 'Zbierky, útulky a adopcie', en: 'Fundraisers, shelters and adoption', cs: 'Sbírky, útulky a adopce', deu: 'Spenden, Tierheime und Adoption', pol: 'Zbiórki, schroniska i adopcje', ukr: 'Збори, притулки та адопція', esp: 'Colectas, refugios y adopción', fra: 'Cagnottes, refuges et adoption', ita: 'Raccolte fondi, rifugi e adozioni', prt: 'Angariações, abrigos e adoção', nld: 'Inzamelingen, asielen en adoptie', tur: 'Bağış kampanyaları, barınaklar ve sahiplenme', rus: 'Сборы, приюты и усыновление', ara: 'حملات تبرّع وملاجئ وتبنٍّ', chn: '募捐、收容所与领养', jpn: '募金・保護施設・譲渡', kor: '모금, 보호소, 입양', ind: 'चंदा, शेल्टर और गोद लेना' },
 sos_shelter: { sk: 'Útulky a adopcie', en: 'Shelters and adoption', cs: 'Útulky a adopce', deu: 'Tierheime und Adoption', pol: 'Schroniska i adopcje', ukr: 'Притулки та адопція', esp: 'Refugios y adopción', fra: 'Refuges et adoption', ita: 'Rifugi e adozioni', prt: 'Abrigos e adoção', nld: 'Asielen en adoptie', tur: 'Barınaklar ve sahiplenme', rus: 'Приюты и усыновление', ara: 'ملاجئ وتبنٍّ', chn: '收容所与领养', jpn: '保護施設と譲渡', kor: '보호소와 입양', ind: 'शेल्टर और गोद लेना' },
 sos_abuse: { sk: 'Nahlás týranie', en: 'Report abuse', cs: 'Nahlas týrání', deu: 'Tierquälerei melden', pol: 'Zgłoś znęcanie', ukr: 'Повідом про жорстоке поводження', esp: 'Denuncia el maltrato', fra: 'Signale une maltraitance', ita: 'Segnala un maltrattamento', prt: 'Denuncia maus-tratos', nld: 'Meld dierenmishandeling', tur: 'Hayvana kötü muameleyi bildir', rus: 'Сообщи о жестоком обращении', ara: 'بلّغ عن إساءة معاملة', chn: '举报虐待', jpn: '虐待を通報する', kor: '학대 신고하기', ind: 'क्रूरता की शिकायत करें' },
 /* PLANÉTKA — spodná lišta = dve pilulky (Matej 21. 11.: „vyhľadaj svojho psa / hall of dog (sieň psov)“) */
 pl_find: { sk: 'Vyhľadaj svojho psa', en: 'Find your dog', cs: 'Vyhledej svého psa', deu: 'Finde deinen Hund', pol: 'Znajdź swojego psa', ukr: 'Знайди свого пса', esp: 'Busca a tu perro', fra: 'Trouve ton chien', ita: 'Trova il tuo cane', prt: 'Procura o teu cão', nld: 'Zoek je hond', tur: 'Köpeğini bul', rus: 'Найди свою собаку', ara: 'ابحث عن كلبك', chn: '找到你的狗', jpn: 'あなたの犬を探す', kor: '내 개 찾기', ind: 'अपना कुत्ता खोजें' },
 pl_hall: { sk: 'Sieň psov', en: 'Hall of Dogs', cs: 'Síň psů', deu: 'Halle der Hunde', pol: 'Galeria psów', ukr: 'Зала псів', esp: 'Salón de los perros', fra: 'Salle des chiens', ita: 'Sala dei cani', prt: 'Salão dos cães', nld: 'Hal der honden', tur: 'Köpekler Salonu', rus: 'Зал собак', ara: 'قاعة الكلاب', chn: '狗狗殿堂', jpn: '犬の殿堂', kor: '개의 전당', ind: 'कुत्तों का हॉल' },
 pl_center: { sk: 'Vycentrovať', en: 'Recenter', cs: 'Vycentrovat', deu: 'Zentrieren', pol: 'Wyśrodkuj', ukr: 'По центру', esp: 'Centrar', fra: 'Recentrer', ita: 'Centra', prt: 'Centrar', nld: 'Centreren', tur: 'Ortala', rus: 'По центру', ara: 'توسيط', chn: '居中', jpn: '中央へ', kor: '가운데로', ind: 'बीच में करें' },
 pl_back: { sk: 'Späť', en: 'Back', cs: 'Zpět', deu: 'Zurück', pol: 'Wróć', ukr: 'Назад', esp: 'Volver', fra: 'Retour', ita: 'Indietro', prt: 'Voltar', nld: 'Terug', tur: 'Geri', rus: 'Назад', ara: 'رجوع', chn: '返回', jpn: '戻る', kor: '돌아가기', ind: 'वापस' },
 /* prihlásenie v mobilnom menu — „Už hráš?“ sedelo k starému „Začni hrať“ */
 have_acc: { sk: 'Už máš účet?', en: 'Already have an account?', cs: 'Už máš účet?', deu: 'Schon ein Konto?', pol: 'Masz już konto?', ukr: 'Вже маєш акаунт?', esp: '¿Ya tienes cuenta?', fra: 'Déjà un compte ?', ita: 'Hai già un account?', prt: 'Já tens conta?', nld: 'Al een account?', tur: 'Hesabın var mı?', rus: 'Уже есть аккаунт?', ara: 'لديك حساب؟', chn: '已有账号？', jpn: 'アカウントをお持ちですか？', kor: '이미 계정이 있나요?', ind: 'पहले से खाता है?' },
};

/** Režim CLAIM 2 (do flipu len za `?claim`). Zapamätá sa na celú návštevu (sessionStorage), aby /story
 *  a návrat na homepage z jej menu ostali v novej verzii aj bez `?claim` v adrese. */
export function isClaim(): boolean {
  if (typeof window === 'undefined') return false;
  const on = new URLSearchParams(window.location.search).has('claim');
  try { if (on) sessionStorage.setItem('dogypt_claim', '1'); return on || sessionStorage.getItem('dogypt_claim') === '1'; } catch { return on; }
}
