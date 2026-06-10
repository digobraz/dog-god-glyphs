import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/i18n/LanguageContext';
import { TestimonialsColumn, type Testimonial } from './TestimonialsColumn';

/**
 * Real, sourced quotes from world-famous people about their love for their dogs.
 *
 * RULES (do not break — these are shown publicly with the person's name):
 *  - Every quote is verbatim or trimmed with … for length. NEVER paraphrased.
 *  - Each entry carries `source` (chain of custody) and `credit` (photo author for CC).
 *  - Photos are Creative-Commons / public-domain portraits from Wikimedia Commons.
 *    The /<width>px- thumbnail segment must stay at the cached width (others 400).
 *  - To swap/add a quote you MUST have a working source URL. No exceptions.
 *
 * The pool is shuffled on every page load and a random subset is shown, so the
 * line-up changes each refresh.
 */
type CelebQuote = Testimonial & { credit: string; source: string };

const POOL: CelebQuote[] = [
  {
    text: 'The truest, purest love… is the love that comes from your dog.',
    name: 'Oprah Winfrey',
    role: 'Cultural icon',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Oprah_Winfrey_2016.jpg/330px-Oprah_Winfrey_2016.jpg',
    credit: 'US Embassy SA (public domain)',
    source: 'https://www.huffpost.com/entry/oprah-dog-sophie_n_4654541',
  },
  {
    text: 'I had no intention of rescuing a dog that day, but the minute I saw him I knew he was coming home with me.',
    name: 'Chris Evans',
    role: 'Actor · on his dog Dodger',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Chris_Evans_at_the_2025_Toronto_International_Film_Festival_%28cropped%29.jpg/330px-Chris_Evans_at_the_2025_Toronto_International_Film_Festival_%28cropped%29.jpg',
    credit: 'Sara Komatsu (CC BY-SA 4.0)',
    source: 'https://www.eonline.com/news/1342743',
  },
  {
    text: 'He was an Angel. And he was my best friend. All he knew was love.',
    name: 'Tom Hardy',
    role: 'Actor · on his dog Woody',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tom_Hardy_%2841869508740%29.jpg/330px-Tom_Hardy_%2841869508740%29.jpg',
    credit: 'Gage Skidmore (CC BY-SA 2.0)',
    source: 'https://www.nme.com/news/tom-hardy-dog-tribute-2086531',
  },
  {
    text: "We'll always love you. You'll always be my lil' main man.",
    name: 'Dwayne Johnson',
    role: 'Actor · on his dog Brutus',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg/330px-Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg',
    credit: 'Harald Krichel (CC BY-SA 4.0)',
    source: 'https://abc7.com/the-rock-dwayne-johnson-dog-brutus/1009438/',
  },
  {
    text: 'You taught me how to love without fear of loss.',
    name: 'Miley Cyrus',
    role: 'Singer · on her dog Floyd',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Miley_Cyrus_Primavera19_-226_%2848986293772%29_%28cropped%29.jpg/330px-Miley_Cyrus_Primavera19_-226_%2848986293772%29_%28cropped%29.jpg',
    credit: 'Raphael Pour-Hashemi (CC BY 2.0)',
    source: 'https://www.billboard.com/music/music-news/miley-cyrus-floyd-remembrance-8454678/',
  },
  {
    text: 'Dogs are the most harmless, sweetest babes in the world. They show nothing but unconditional love.',
    name: 'Ariana Grande',
    role: 'Singer',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Ariana_Grande_promoting_Wicked_%282024%29.jpg/330px-Ariana_Grande_promoting_Wicked_%282024%29.jpg',
    credit: 'Barbie Simons (CC BY 3.0)',
    source: 'https://www.billboard.com/lists/billboard-power-pets-list-music-stars-a-list-animals/',
  },
  {
    text: 'I always, always called him the rockstar. Because he was!',
    name: 'Hugh Jackman',
    role: 'Actor · on his dog Dali',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Hugh_Jackman_by_Gage_Skidmore_3.jpg/330px-Hugh_Jackman_by_Gage_Skidmore_3.jpg',
    credit: 'Gage Skidmore (CC BY-SA 3.0)',
    source: 'https://abcnews.com/GMA/Culture/hugh-jackman-mourns-loss-beloved-dog-called-rockstar/story?id=88095066',
  },
  {
    text: "I don't think even the cliché of unconditional love is enough.",
    name: 'Drew Barrymore',
    role: 'Actor · on her dog Flossie',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Drew_Barrymore_in_2019_%28cropped%29.jpg/330px-Drew_Barrymore_in_2019_%28cropped%29.jpg',
    credit: 'Eva Rinaldi (CC BY-SA 2.0)',
    source: 'https://www.thelist.com/1320243/little-known-drew-barrymore-facts/',
  },
  {
    text: 'He has saved my emotional and psychological bacon plenty of times.',
    name: 'Henry Cavill',
    role: 'Actor · on his dog Kal',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Henry_Cavill_%2848417913146%29_%28cropped%29.jpg/330px-Henry_Cavill_%2848417913146%29_%28cropped%29.jpg',
    credit: 'Gage Skidmore (CC BY-SA 2.0)',
    source: 'https://iheartdogs.com/superman-cavill-kal/',
  },
  {
    text: "I just fell in love with him. I didn't mean to, I just picked him up along the way.",
    name: 'Ryan Reynolds',
    role: 'Actor · on his dog Baxter',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg/330px-Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg',
    credit: 'Dick Thomas Johnson (CC BY 2.0)',
    source: 'https://dogtime.com/dogs-in-film-tv/171606-ryan-reynolds-dog-baxter-breed-age',
  },
  {
    text: 'He loves me. I can do no wrong. He follows me everywhere.',
    name: 'George Clooney',
    role: 'Actor · on his dog Einstein',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/George_Clooney_Jay_Kelly-19_%28cropped%29.jpg/330px-George_Clooney_Jay_Kelly-19_%28cropped%29.jpg',
    credit: 'Bryan Berlin (CC BY-SA 4.0)',
    source: 'https://www.hellomagazine.com/celebrities/2015110228022/george-clooney-talks-about-his-dog-einstein/',
  },
  {
    text: "Charlotte loves me undyingly. They're my kids.",
    name: 'Bradley Cooper',
    role: 'Actor · on his dog Charlotte',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Bradley_Cooper_Is_This_Thing_On-41_%28cropped%29.jpg/330px-Bradley_Cooper_Is_This_Thing_On-41_%28cropped%29.jpg',
    credit: 'Bryan Berlin (CC BY-SA 4.0)',
    source: 'https://www.peta.org/news/bradley-coopers-hung-rescue-dogs/',
  },
  {
    text: "They just give you unconditional love. And you're never alone, they're just there.",
    name: 'Channing Tatum',
    role: 'Actor · on his dog Lulu',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Channing_Tatum_at_the_2026_Berlin_International_Film_Festival-69843.jpg/330px-Channing_Tatum_at_the_2026_Berlin_International_Film_Festival-69843.jpg',
    credit: 'Harald Krichel (CC BY-SA 4.0)',
    source: 'https://sharpmagazine.com/2022/02/16/channing-tatum-interview/',
  },
  {
    text: 'He was more than a companion. It was a soul connection for sure.',
    name: 'Orlando Bloom',
    role: 'Actor · on his dog Mighty',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Orlando_Bloom_at_the_2024_Toronto_International_Film_Festival_%28cropped2%29.jpg/330px-Orlando_Bloom_at_the_2024_Toronto_International_Film_Festival_%28cropped2%29.jpg',
    credit: 'Kevin Payravi (CC BY-SA 4.0)',
    source: 'https://www.etonline.com/orlando-blooms-dog-mighty-dies-after-going-missing-actor-gets-inked-in-his-honor-150050',
  },
  {
    text: "There's one that's a dog of a lifetime… and you're going to cry like a little baby when he's gone.",
    name: 'Kevin Costner',
    role: 'Actor · on his dog Wyatt',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Kevin_Costner_at_81st_Venice_Film_Festival_%28cropped%29.jpg/330px-Kevin_Costner_at_81st_Venice_Film_Festival_%28cropped%29.jpg',
    credit: 'Ariela Ortiz-Barrantes (CC BY-SA 4.0)',
    source: 'https://www.aarp.org/entertainment/movies-for-grownups/info-2019/kevin-costner-racing-interview.html',
  },
  {
    text: "She's brilliant, my best friend.",
    name: 'Tom Holland',
    role: 'Actor · on his dog Tessa',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg/330px-Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg',
    credit: 'ChristopherJClarke (CC BY-SA 4.0)',
    source: 'https://dogsmonthly.co.uk/2020/02/06/our-interview-with-tom-holland/',
  },
  {
    text: "We're already falling head over heels in love.",
    name: 'Patrick Stewart',
    role: 'Actor · on his foster pup',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Patrick_Stewart_by_Gage_Skidmore_2.jpg/330px-Patrick_Stewart_by_Gage_Skidmore_2.jpg',
    credit: 'Gage Skidmore (CC BY-SA 3.0)',
    source: 'https://www.newsweek.com/watch-sir-patrick-stewart-soothe-this-anxious-foster-pup-his-continuing-support-pitbulls-1530718',
  },
  {
    text: "The dogs are everything. They're living, breathing, pure, good love.",
    name: 'Jennifer Aniston',
    role: 'Actor',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/JenniferAnistonHWoFFeb2012.jpg/330px-JenniferAnistonHWoFFeb2012.jpg',
    credit: 'Angela George (CC BY-SA 3.0)',
    source: 'https://paradepets.com/pet-news/jennifer-aniston-playing-working-out-with-her-dogs-exclusive-video',
  },
  {
    text: 'I have no words or tears to describe how much she meant to me.',
    name: 'Salma Hayek',
    role: 'Actor · on her dog Lupe',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/MKr383631_Salma_Hayek_%28Women_In_Motion%2C_Cannes_2025%29_crop.jpg/330px-MKr383631_Salma_Hayek_%28Women_In_Motion%2C_Cannes_2025%29_crop.jpg',
    credit: 'Martin Kraft (CC BY-SA 4.0)',
    source: 'https://www.huffpost.com/entry/salma-hayek-dog-lupe-dies_n_5a60753ce4b01b82649cc317',
  },
  {
    text: 'That feeling has never left me. It is one of the most special presences in my life.',
    name: 'Eva Mendes',
    role: 'Actor · on her dog Hugo',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Eva_Mendes_2009.jpg/330px-Eva_Mendes_2009.jpg',
    credit: 'Nicolas Genin (CC BY-SA 4.0)',
    source: 'https://www.hellomagazine.com/celebrities/20220722146132/eva-mendes-sparks-emotional-response-remembers-first-love-hugo/',
  },
  {
    text: 'For them you are their entire book, their entire lives.',
    name: 'Chrissy Teigen',
    role: 'Model / TV host · on her dog Penny',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Chrissy_Teigen_2019.png/330px-Chrissy_Teigen_2019.png',
    credit: 'Adweek (CC BY 3.0)',
    source: 'https://www.aol.com/chrissy-teigen-mourns-death-her-013704458.html',
  },
  {
    text: 'You sure gave me a lot of comfort and love when I needed it the most!',
    name: 'Hilary Duff',
    role: 'Actor / singer · on her dog Jak',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Hilary_Duff_%2835661671285%29_%28cropped%29_%283%29.jpg/330px-Hilary_Duff_%2835661671285%29_%28cropped%29_%283%29.jpg',
    credit: 'Greg2600 (CC BY-SA 2.0)',
    source: 'https://www.hellomagazine.com/celebrities/20220329136723/how-i-met-your-father-hilary-duff-heartbreaking-personal-loss-dog/',
  },
  {
    text: "Finn's brought all the love, warmth and total presence a girl could only dream of.",
    name: 'Amanda Seyfried',
    role: 'Actor · on her dog Finn',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Amanda_Seyfried_at_Berlinale_2026-1_%28cropped%29.jpg/330px-Amanda_Seyfried_at_Berlinale_2026-1_%28cropped%29.jpg',
    credit: 'Elena Ternovaja (CC BY-SA 3.0)',
    source: 'https://parade.com/news/fans-gush-over-amanda-seyfrieds-beautiful-dog-finn-as-star-celebrates-his-milestone-birthday',
  },
  {
    text: "My beloved, hilarious dog Norman's unconditional love inspired me to create this company.",
    name: 'Kaley Cuoco',
    role: 'Actor · on her dog Norman',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Kaley_Cuoco_by_Gage_Skidmore.jpg/330px-Kaley_Cuoco_by_Gage_Skidmore.jpg',
    credit: 'Gage Skidmore (CC BY-SA 3.0)',
    source: 'https://www.hellomagazine.com/celebrities/505835/kaley-cuoco-thanks-beloved-pet-dog-norman-as-she-launches-new-project/',
  },
  {
    text: 'There is no better dog than Jack. How could you make a dog better than Jack!',
    name: 'Mariah Carey',
    role: 'Singer · on her dog Jack',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Mariah_Carey_Library_of_Congress_2023_1_Cropped_3.png',
    credit: 'Shawn Miller / LOC (public domain)',
    source: 'https://www.k9magazine.com/mariah-carey/',
  },
  {
    text: "He's such a good boy. I wish I could take him on my whole tour across the world.",
    name: 'Billie Eilish',
    role: 'Singer · on her dog Shark',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg/330px-BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg',
    credit: 'Raph_PH (CC BY 2.0)',
    source: 'https://www.movin925.com/read-an-interview-with-billie-eilishs-dog-shark-yes-really',
  },
  {
    text: 'I genuinely talk to my dogs. I totally believe that animals are healing.',
    name: 'Selena Gomez',
    role: 'Singer / actress',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg/330px-Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg',
    credit: 'Frank Sun (CC BY-SA 4.0)',
    source: 'https://www.wondermind.com/article/selena-gomez-speaks-out-about-her-mental-health/',
  },
  {
    text: 'She was a dear pet of mine. I remember John being amazed to see me being so loving to an animal.',
    name: 'Paul McCartney',
    role: 'The Beatles · on his dog Martha',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/MaccaLyricsRFH051121_%2815_of_18%29_%28updated%29_%28cropped%29.jpg/330px-MaccaLyricsRFH051121_%2815_of_18%29_%28updated%29_%28cropped%29.jpg',
    credit: 'Raph_PH (CC BY 2.0)',
    source: 'https://www.the-paulmccartney-project.com/1966/10/paul-mccartney-buys-an-old-english-sheepdog/',
  },
  {
    text: 'She gave us so much joy for 10 years. We love you Pippa!',
    name: 'John Legend',
    role: 'Singer · on his dog Pippa',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/JohnLegend-byPhilipRomano.jpg/330px-JohnLegend-byPhilipRomano.jpg',
    credit: 'PhilipRomanoPhoto (CC BY-SA 4.0)',
    source: 'https://www.billboard.com/music/music-news/john-legend-chrissy-teigen-dog-dies-pippa-photos-9602212/',
  },
  {
    text: "'Puppy Love' was my very first record, and six decades later, my love for pets is stronger than ever.",
    name: 'Dolly Parton',
    role: 'Singer / songwriter',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Dolly_Parton_at_%27Blue_Smoke_World_Tour%27_in_Knoxville.jpg/330px-Dolly_Parton_at_%27Blue_Smoke_World_Tour%27_in_Knoxville.jpg',
    credit: 'Kristopher Harris (CC BY 2.0)',
    source: 'https://www.foxbusiness.com/lifestyle/dolly-parton-launches-dog-apparel-line-doggy-parton',
  },
  {
    text: "Her name is Asia. She is a BATPIG. I love her, I'm her mom.",
    name: 'Lady Gaga',
    role: 'Singer · on her dog Asia',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg/330px-Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg',
    credit: 'Carlos M. Vazquez II (CC BY 2.0)',
    source: 'https://ladygaga.fandom.com/wiki/Asia_(dog)',
  },
  {
    text: 'He was with me all the way, my closest companion. All the love and cuddles we will miss forever.',
    name: 'Conor McGregor',
    role: 'UFC fighter · on his dog Hugo',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Conor_McGregor_2025.jpeg/330px-Conor_McGregor_2025.jpeg',
    credit: 'US Dept of Defense (public domain)',
    source: 'https://www.tmz.com/2021/10/20/conor-mcgregor-mourns-dog-hugo-death-so-heart-broken/',
  },
  {
    text: 'Bringing Roscoe into my life was the best decision I ever made.',
    name: 'Lewis Hamilton',
    role: 'F1 driver · on his dog Roscoe',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg/330px-Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg',
    credit: 'No. 10 Downing Street (OGL 3)',
    source: 'https://www.espn.com/racing/f1/story/_/id/46420057/lewis-hamilton-ferrari-mourns-beloved-dog-roscoe',
  },
  {
    text: 'She was there every day to lick my leg and remind me how much she loved me.',
    name: 'Serena Williams',
    role: 'Tennis champion · on her dog Jackie',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Guests_at_the_2026_Met_Gala_209_%28cropped%29.jpg/330px-Guests_at_the_2026_Met_Gala_209_%28cropped%29.jpg',
    credit: 'SWinxy (CC BY 4.0)',
    source: 'https://www.today.com/pets/serena-williams-posts-sweet-tribute-her-late-dog-jackie-t58101',
  },
  {
    text: "A man's best friend. Always happy to see you. Loves you unconditionally.",
    name: 'Tyson Fury',
    role: 'Heavyweight boxer · on his dog Cash',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Tyson_Fury_at_Place_Bell%2C_Laval_Quebec%2C_Canada_-_Dec_16_2017_%28cropped%29.jpg/330px-Tyson_Fury_at_Place_Bell%2C_Laval_Quebec%2C_Canada_-_Dec_16_2017_%28cropped%29.jpg',
    credit: 'Mike DiDomizio (CC BY-SA 4.0)',
    source: 'https://thetab.com/realityshrine/2026/04/14/insane-five-figure-sum-tyson-paid-for-his-dog-cash',
  },
  {
    text: 'Their love is unconditional and they give me and my family plenty of joy in our lives.',
    name: 'Michael Phelps',
    role: 'Olympic swimmer',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Michael_Phelps_Rio_Olympics_2016.jpg/330px-Michael_Phelps_Rio_Olympics_2016.jpg',
    credit: 'Agência Brasil (CC BY 2.0)',
    source: 'https://www.petbusiness.com/archives/walking-the-walk-an-interview-with-michael-phelps/',
  },
  {
    text: "Harry is my best friend! Definitely the best decision I've ever made.",
    name: 'Venus Williams',
    role: 'Tennis champion · on her dog Harry',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Venus_Williams_%282025_DC_Open%29_crop.jpg/330px-Venus_Williams_%282025_DC_Open%29_crop.jpg',
    credit: 'Hameltion (CC BY-SA 4.0)',
    source: 'https://tennisuptodate.com/wta/definitely-the-best-decision-ive-ever-made-venus-williams-professes-love-for-her-pet-dog-harry',
  },
  {
    text: "We couldn't be happier. Welcome to the family, Willow.",
    name: 'Roger Federer',
    role: 'Tennis champion · on his dog Willow',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Roger_Federer_2015_%28cropped%29.jpg/330px-Roger_Federer_2015_%28cropped%29.jpg',
    credit: 'Tatiana (CC BY-SA 2.0)',
    source: 'https://www.tennisworldusa.org/tennis/news/Roger_Federer/114742/',
  },
  {
    text: 'He is a good friend and traveling companion, and would rather travel about than anything he can imagine.',
    name: 'John Steinbeck',
    role: 'Nobel author · on his dog Charley',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/John_Steinbeck_1939_%28cropped%29.jpg/330px-John_Steinbeck_1939_%28cropped%29.jpg',
    credit: 'public domain',
    source: 'https://gutenberg.ca/ebooks/steinbeckj-travelswithcharley/',
  },
  {
    text: "I've never loved a dog like this in my life. Sometimes I think there's a person in there.",
    name: 'Elizabeth Taylor',
    role: 'Actress · on her dog Sugar',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Taylor%2C_Elizabeth_posed.jpg/330px-Taylor%2C_Elizabeth_posed.jpg',
    credit: 'public domain',
    source: 'https://www.wmagazine.com/story/elizabeth-taylor-dec-2004',
  },
  {
    text: 'If the kindest souls were rewarded with the longest lives, dogs would outlive us all.',
    name: 'Ricky Gervais',
    role: 'Comedian / actor',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/GervaisPall230921_%285_of_17%29_%2851528328440%29_%28cropped%29.jpg/330px-GervaisPall230921_%285_of_17%29_%2851528328440%29_%28cropped%29.jpg',
    credit: 'Raph_PH (CC BY 2.0)',
    source: 'https://www.facebook.com/rickygervais/posts/1132160746908277/',
  },
  {
    text: 'Our guardian angel is gone to heaven. She will forever live in our hearts.',
    name: 'Gisele Bündchen',
    role: 'Supermodel · on her dog Lua',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Ver%C3%A3o_Arezzo_Brasil_2019_por_Gisele_B%C3%BCndchen_17.jpg/330px-Ver%C3%A3o_Arezzo_Brasil_2019_por_Gisele_B%C3%BCndchen_17.jpg',
    credit: 'Arezzo Brasil (CC BY 3.0)',
    source: 'https://www.eonline.com/news/1391973/gisele-buendchen-and-tom-brady-mourn-death-of-family-dog',
  },
  {
    text: "Lump, he's not a dog, he's not a little man, he's somebody else.",
    name: 'Pablo Picasso',
    role: 'Painter · on his dog Lump',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pablo_picasso_1.jpg/330px-Pablo_picasso_1.jpg',
    credit: 'public domain',
    source: 'https://en.wikipedia.org/wiki/Lump_(dog)',
  },
  {
    text: "Sometimes when a man's alone, that's all you got is your dog. And they've meant the world to me.",
    name: 'Mickey Rourke',
    role: 'Actor',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Mickey_Rourke_Tribeca_2009_portrait.jpg/330px-Mickey_Rourke_Tribeca_2009_portrait.jpg',
    credit: 'David Shankbone (CC BY-SA 3.0)',
    source: 'https://abcnews.go.com/Entertainment/Oscars/story?id=6897261',
  },
];

const VISIBLE = 21; // random subset shown per page load (7 per column on desktop)

// i18n kľúč citátu zo slugu mena (POOL je module-level → preklad až pri renderi).
// EN text v POOL = canonical verbatim; preklady v locale slovníkoch sú preklady citátu.
const quoteSlug = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '-');

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TestimonialsSection() {
  const t = useT();
  // Shuffle + pick a random subset once per mount → line-up changes each refresh.
  const { columns } = useMemo(() => {
    const picked = shuffle(POOL).slice(0, VISIBLE);
    const per = Math.ceil(picked.length / 3);
    return {
      columns: [picked.slice(0, per), picked.slice(per, per * 2), picked.slice(per * 2)],
    };
  }, []);

  // Preklad pri renderi (nie v useMemo) → reaguje na zmenu jazyka bez re-shuffle.
  const localize = (q: CelebQuote): Testimonial => ({
    ...q,
    text: t(`about.legends.q.${quoteSlug(q.name)}.text`),
    role: t(`about.legends.q.${quoteSlug(q.name)}.role`),
  });

  return (
    <section
      id="testimonials"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 18%, #000000 42%)' }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-12 md:mb-16"
        >
          <h2
            className="text-4xl md:text-5xl font-black tracking-wider"
            style={{
              fontFamily: "'Cinzel', serif",
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              background: 'linear-gradient(135deg, #F5C73D 0%, #FFB840 40%, #E69E1A 70%, #F5C73D 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 16px rgba(245,199,61,0.32))',
              // headroom pre diakritiku nad verzálkami (background-clip:text by ju osekol)
              paddingTop: '0.12em',
            }}
          >
            {t('about.legends.title')}
          </h2>
          <p
            className="mt-4 max-w-xl text-base md:text-lg"
            style={{ color: 'rgba(250,244,236,0.76)', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.65 }}
          >
            {t('about.legends.sub')}
          </p>
        </motion.div>

        <div
          className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"
          style={{ maxHeight: '640px', overflow: 'hidden' }}
        >
          <TestimonialsColumn testimonials={columns[0].map(localize)} duration={48} />
          <TestimonialsColumn testimonials={columns[1].map(localize)} className="hidden md:block" duration={56} />
          <TestimonialsColumn testimonials={columns[2].map(localize)} className="hidden lg:block" duration={52} />
        </div>

        {/* CC attribution — required for the Wikimedia Commons portraits (CC BY / BY-SA / public domain) */}
        <details className="mt-10 mx-auto max-w-2xl text-center">
          <summary
            className="cursor-pointer text-[11px] tracking-wide select-none"
            style={{ color: 'rgba(250,244,236,0.4)', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t('about.legends.creditsSummary')}
          </summary>
          <p
            className="mt-3 text-[10px] leading-relaxed"
            style={{ color: 'rgba(250,244,236,0.32)', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t('about.legends.creditsIntro')}{' '}
            {POOL.map((q) => `${q.name} — ${q.credit}`).join(' · ')}
          </p>
        </details>
      </div>
    </section>
  );
}
