// PRVÁ POMOC · SK — vygenerované z plany/nakresy/prva-pomoc-2026-11-16/data.js (17. 11. 2026), texty doslova.
// Zdroj obsahu: plany/prva-pomoc/obsah.md. Zmena textu = tu aj v aidEn.ts a aidCs.ts (stráž: aidData.test.ts).
import type { AidCard, AidLinks } from './aidTypes';

export const AID_SK: AidCard[] = [
 {
  id: "nedycha",
  group: "A",
  tile: "Nedýcha",
  title: "Nedýcha, nereaguje",
  sub: "oživovanie",
  img: "/prva-pomoc/nedycha-kpr.webp",
  imgCap: "stláčanie hrudníka, záchranca pri chrbte",
  fotky: [
   {
    src: "/prva-pomoc/commons-forthood-dalmatin-na-boku-kpr.webp",
    cap: "KPR na boku (US Army, PD)"
   },
   {
    src: "/prva-pomoc/dvids9092345-malinois-na-boku-dlane-na-hrudniku.webp",
    cap: "dlane na hrudníku (US Army, PD)"
   }
  ],
  spoznas: [
   "nereaguje na meno ani dotyk",
   "hrudník sa nehýbe",
   "necítiš tep na ľavom boku za lakťom"
  ],
  kroky: [
   "Zavolaj naňho a zatras ním. Ak sa bráni alebo dýcha, oživovanie nerob.",
   "Otvor papuľu, vytiahni jazyk, pozri do hrdla. Čo vidíš, vyber.",
   "Polož ho na bok na tvrdú zem.",
   "Stláčaj hrudník: rýchlo, 2 stlačenia za sekundu, do tretiny hĺbky hrudníka. Vždy ho nechaj vrátiť.",
   "Po 30 stlačeniach zavri papuľu, natiahni krk a 2× mu vdýchni do nosa, kým sa zdvihne hrudník.",
   "Opakuj 30 : 2. Každé 2 minúty na pár sekúnd skontroluj dych. Ak ste dvaja, striedajte sa.",
   "Pokračuj aj cestou k veterinárovi."
  ],
  extra: [
   {
    h: "Kam dať ruky",
    items: [
     "Stredný a veľký pes s guľatým hrudníkom (labrador): obe dlane na najširšie miesto hrudníka.",
     "Úzky hlboký hrudník (chrt, doberman): obe dlane nad srdce, tam, kde sa hrudníka dotkne lakeť.",
     "Malý pes do 10 kg: jedna ruka obopne hrudník, stláčaš palcom oproti prstom.",
     "Buldog, mops: na boku, dlane na najširšie miesto."
    ]
   }
  ],
  nikdy: [
   "nestláčaj psa, ktorému bije srdce",
   "neprerušuj stláčanie na viac než 10 sekúnd"
  ],
  bezSignalu: "oživovanie len kupuje čas na cestu. Úprimne: prežije málo psov (5 až 7 zo 100 aj na klinike). Ak je pomoc ďaleko a nič sa nemení, smieš prestať."
 },
 {
  id: "dusi",
  group: "A",
  tile: "Dusí sa",
  title: "Dusí sa",
  img: "/prva-pomoc/dusi-heimlich.webp",
  imgCap: "päsť hneď za posledné rebrá",
  spoznas: [
   "panika, škrabe si papuľu",
   "nevie sa nadýchnuť, je ticho",
   "ďasná modrajú"
  ],
  lead: [
   "Ak kašle, vzduch prechádza. Nechaj ho kašľať a choď k veterinárovi."
  ],
  kroky: [
   "Otvor papuľu a pozri sa. Čo vidíš, vyber pinzetou alebo kliešťami. Nie prstami.",
   "Nejde to: postav sa za psa, päsť pod rebrá, 5 prudkých stlačení dovnútra a nahor. Malého psa drž chrbtom k sebe.",
   "Stále nič: zdvihni mu zadok, hlava dole, 5 úderov dlaňou medzi lopatky. Opakuj.",
   "Stratil vedomie: teraz už vyber prstami, čo je v hrdle.",
   "Loptička v hrdle a pes v bezvedomí: polož ho na chrbát, natiahni krk, palcami zvonku pod sánkou tlač loptičku smerom k papuli.",
   "Nedýcha: pokračuj kartou NEDÝCHA.",
   "Aj keď predmet vyšiel, choď k veterinárovi. Hrdlo môže opuchnúť."
  ],
  nikdy: [
   "prsty do papule psa pri vedomí",
   "nehmataj naslepo",
   "žiadny náhubok"
  ],
  bezSignalu: "celý kruh opakuj sám, kým predmet nevyjde."
 },
 {
  id: "krvaca",
  group: "A",
  tile: "Silne krváca",
  title: "Silne krváca",
  img: "/prva-pomoc/krvaca-tlak.webp",
  imgCap: "tlak priamo na ranu, celou dlaňou",
  posledne: {
   img: "/prva-pomoc/krvaca-skrtidlo.webp",
   h: "Až keď nič iné nepomáha: škrtidlo",
   t: "široký pás látky NAD ranou, pevne uviazať. Zapíš si čas a už ho nepovoľuj."
  },
  fotky: [
   {
    src: "/prva-pomoc/dvids9049537-tlak-dlanami-cez-gazu-figurina.webp",
    cap: "tlak dlaňami cez gázu (US Air Force, PD)"
   },
   {
    src: "/prva-pomoc/commons-tccc-obvaz-prednej-nohy-figurina.webp",
    cap: "tlakový obväz nohy (US Army, PD)"
   }
  ],
  spoznas: [
   "krv strieka alebo rýchlo tečie",
   "bledé ďasná, rýchly dych, studené labky = šok"
  ],
  kroky: [
   "Pritlač na ranu čistú látku (tričko, šatka) a drž. Silno, celou dlaňou.",
   "Nohu zdvihni nad úroveň srdca, ak sa dá.",
   "Obviaž pevne cez látku.",
   "Presiaklo to? Nedávaj nič dole. Pridaj ďalšiu vrstvu a tlač ďalej.",
   "Choď k veterinárovi, tlak drž celú cestu."
  ],
  extra: [
   {
    h: "Zapichnutý predmet (konár, sklo)",
    t: "nevyťahuj. Obviaž okolo neho."
   },
   {
    h: "Pazúr, ucho, labka",
    t: "krvácajú veľa, vyzerajú horšie, než sú. Tlač 5 až 10 minút bez pozerania. Ak neprestane do 15 minút, pohotovosť."
   }
  ],
  nikdy: [
   "nepozeraj pod obväz, či to prestalo",
   "žiadny peroxid ani alkohol do rany"
  ],
  bezSignalu: "škrtidlo je posledná možnosť, len na nohu alebo chvost, keď tlak nezaberá. Použi široký elastický obväz, zapíš si čas a už ho nepovoľuj."
 },
 {
  id: "brucho",
  group: "A",
  tile: "Nafúknuté brucho",
  title: "Nafúknuté brucho, dáví naprázdno",
  img: "/prva-pomoc/brucho-nafuknute.webp",
  imgCap: "nafúknutý žalúdok tlačí na rebrá",
  sub: "otočenie žalúdka",
  spoznas: [
   "chce vracať a nič nevyjde",
   "brucho tvrdé ako bubon",
   "nevie si ľahnúť, slintá",
   "najmä veľké psy s hlbokým hrudníkom"
  ],
  kroky: [
   "Hneď do auta k NAJBLIŽŠIEMU veterinárovi. Zavolaj mu cestou.",
   "Nedávaj nič jesť ani piť.",
   "Skolabuje: karta NEDÝCHA."
  ],
  extra: [
   {
    h: "Doma sa nedá urobiť nič.",
    t: "Bez operácie pes zomrie, po 6 hodinách šance rýchlo klesajú.",
    warn: true
   }
  ],
  nikdy: [
   "nečakaj, či to prejde",
   "žiadne kvapky proti nafukovaniu",
   "nič neprepichuj"
  ]
 },
 {
  id: "krce",
  group: "A",
  tile: "Kŕče",
  title: "Kŕče, záchvat",
  img: "/prva-pomoc/krce-cas.webp",
  imgCap: "nedrž ho, meraj čas",
  spoznas: [
   "spadne, stuhne, „pádluje“ nohami, slintá, môže sa pomočiť",
   "potom je zmätený"
  ],
  vet: {
   h: "Hneď k veterinárovi, ak",
   items: [
    "záchvat trvá viac než 2 minúty (volaj)",
    "viac než 5 minút (ide o život)",
    "druhý záchvat v ten istý deň",
    "neprebral sa",
    "je to jeho prvý záchvat (ozvi sa v ten deň)"
   ]
  },
  kroky: [
   "Pozri na hodinky. Meraj čas.",
   "Odprac všetko, o čo sa môže udrieť. Nedrž ho.",
   "Ticho, tieň. Neprikrývaj ho, prehrieva sa.",
   "Ak sa dá, natoč video pre veterinára.",
   "Po záchvate: pokoj, voda, pozor na schody a svah. Môže byť zmätený až deň."
  ],
  nikdy: [
   "ruky do papule (jazyk neprehltne, ale pohryzie ťa)",
   "nedrž ho, nekrop vodou",
   "nič mu nedávaj do úst",
   "neprenášaj ho počas záchvatu"
  ],
  bezSignalu: "počkaj, kým záchvat skončí, potom ho nes. V horúčave mu vlaž brucho a slabiny."
 },
 {
  id: "prehriatie",
  group: "B",
  tile: "Prehriatie",
  title: "Prehriatie",
  img: "/prva-pomoc/prehriatie.webp",
  imgCap: "voda na hruď, brucho a stehná, hlava suchá",
  fotky: [
   {
    src: "/prva-pomoc/pes-vo-vode.webp",
    cap: "zdravý pes vo vode (CC BY-SA, Chris Light)"
   }
  ],
  spoznas: [
   "silno dychčí a neprestáva",
   "slintá, vracia, potáca sa",
   "v najhoršom kŕče a kolaps"
  ],
  kroky: [
   "Stoj. Tieň.",
   "Chlaď HNEĎ, najstudenejšou vodou, akú máš (potok, fľaša, hadica). Najprv chladiť, až potom cestovať.",
   "Zdravého psa pri vedomí ponor do vody po krk. Hlava vždy nad vodou.",
   "Starého, chorého, krátkonosého alebo apatického psa neponáraj. Polievaj ho a ovievaj.",
   "Lej na hruď, brucho a vnútorné stehná. Hlava a papuľa ostávajú suché.",
   "Daj mu piť po dúškoch.",
   "Prestaň, keď sa dych upokojí. Potom k veterinárovi, aj keď vyzerá dobre."
  ],
  nikdy: [
   "nečakaj s chladením na veterinára",
   "neprikrývaj ho mokrým uterákom (pod neho áno)",
   "nenúť ho ísť pešo"
  ],
  bezSignalu: "chladenie JE liečba. Chlaď v potoku, potom ho pomaly nes."
 },
 {
  id: "had",
  group: "B",
  tile: "Had",
  title: "Uštipol ho had",
  sub: "vretenica",
  img: "/prva-pomoc/had-nesenie.webp",
  imgCap: "malého psa nes, nech nechodí",
  fotky: [
   {
    src: "/prva-pomoc/vlastna-opuch-prednej-nohy-po-vretenici-1.webp",
    cap: "opuch nohy po vretenici"
   },
   {
    src: "/prva-pomoc/vretenica-samica-pieniny.webp",
    cap: "vretenica (CC BY-SA, Charles J. Sharp)",
    znak: "zle"
   },
   {
    src: "/prva-pomoc/uzovka-hlava-zlte-skvrny.webp",
    cap: "užovka (PD, G. Chernilevsky)",
    znak: "ok"
   }
  ],
  porovnanie: {
   img: "/prva-pomoc/vretenica-vs-uzovka.webp",
   h: "Vretenica alebo užovka?",
   l: "Jedovatá",
   r: "Neškodná",
   t: "Vretenica: cikcak na chrbte, zvislá zrenička. Užovka: žlté polmesiace za hlavou, okrúhla zrenička. Aj tak hada nechytaj."
  },
  spoznas: [
   "náhla bolesť a rýchly tmavý opuch, často na papuli alebo nohe",
   "niekedy dve bodky",
   "slabosť, potácanie"
  ],
  kroky: [
   "Pokoj. Hada nechytaj, stačí fotka z diaľky.",
   "Psa upokoj a nenechaj ho behať. Pohyb rozháňa jed.",
   "Malého psa nes. K veľkému priveď auto, alebo choď pomaly s prestávkami.",
   "Zavolaj veterinárovi, že idete.",
   "Choď hneď, aj keď opuch nevidíš. Príznaky prídu do hodiny."
  ],
  nikdy: [
   "škrtidlo ani obväz",
   "nevysávaj, nerež",
   "žiadny ľad",
   "žiadne lieky"
  ],
  bezSignalu: "jediná prvá pomoc je pokoj a rýchly, pokojný presun."
 },
 {
  id: "hmyz",
  group: "B",
  tile: "Hmyz",
  title: "Bodol ho hmyz",
  img: "/prva-pomoc/hmyz-zihadlo.webp",
  imgCap: "žihadlo zoškrabni do boku, nestláčaj",
  fotky: [
   {
    src: "/prva-pomoc/osa-vespula.webp",
    cap: "osa (CC BY-SA, Soebe)"
   }
  ],
  spoznas: [
   "kňučí, líže si miesto, malý opuch"
  ],
  vet: {
   h: "Hneď k veterinárovi, ak",
   items: [
    "opúcha papuľa, hlava alebo krk",
    "dýcha ťažko, píska",
    "vracia alebo má hnačku",
    "slabne, kolabuje",
    "bodnutie je v papuli alebo hrdle",
    "bodnutí je veľa"
   ]
  },
  kroky: [
   "Žihadlo vyber hneď, čímkoľvek (necht, karta, pinzeta). Rozhoduje rýchlosť. Nestláčaj vačok.",
   "Prilož studený obklad cez látku, 10 minút.",
   "Sleduj ho aspoň pol hodiny, potom ešte zvyšok dňa."
  ],
  nikdy: [
   "ľudské lieky na alergiu bez pokynu veterinára. Niektoré obsahujú látky, ktoré psa otrávia."
  ],
  bezSignalu: "ak chodíš ďaleko od ciest, vypýtaj si vopred od svojho veterinára liek a dávku pre svojho psa."
 },
 {
  id: "jed",
  group: "B",
  tile: "Jed",
  title: "Zjedol jed",
  img: "/prva-pomoc/jed-vybrat.webp",
  imgCap: "úchop za špicákmi, vyber spredu, odfoť obal",
  dalsi: [
   {
    img: "/prva-pomoc/jed-panel.webp",
    h: "Vždy nebezpečné"
   }
  ],
  spoznas: [
   "vracia, slintá, trasie sa, potáca",
   "niekedy nič, príznaky prídu o hodiny až dni"
  ],
  kroky: [
   "Zober mu to. Vyprázdni papuľu, ak sa dá bezpečne.",
   "Zisti čo, koľko a kedy. Odfoť obal alebo zober vzorku.",
   "Volaj veterinára HNEĎ. Nečakaj na príznaky.",
   "Choď, aj keď vyzerá zdravo."
  ],
  extra: [
   {
    h: "Vždy nebezpečné",
    items: [
     "čokoláda (čím tmavšia, tým horšie)",
     "sladidlo xylitol (žuvačky)",
     "hrozno a hrozienka",
     "jed na potkany a slimáky",
     "nemrznúca zmes",
     "ľudské lieky (ibuprofén, paracetamol)",
     "huby",
     "zelená voda so sinicami"
    ],
    pills: true
   },
   {
    h: "Sinice",
    t: "opláchni ho čistou vodou a nedovoľ mu olizovať srsť."
   }
  ],
  nikdy: [
   "nevyvolávaj vracanie, pokiaľ ti to veterinár výslovne nepovie.",
   "žiadna slaná voda",
   "žiadne mlieko ani živočíšne uhlie namiesto veterinára"
  ],
  bezSignalu: "nestrácaj čas domácimi receptami. Choď k signálu a k autu."
 },
 {
  id: "kliest",
  group: "B",
  tile: "Kliešť",
  title: "Kliešť",
  img: "/prva-pomoc/kliest-pinzeta.webp",
  imgCap: "pinzetou tesne pri koži, rovno hore",
  fotky: [
   {
    src: "/prva-pomoc/ixodes-ricinus-samica-samec.webp",
    cap: "kliešť obyčajný (CC BY-SA, Alan R Walker)"
   }
  ],
  vet: {
   h: "Hneď k veterinárovi, ak",
   pre: "3 týždne sleduj.",
   items: [
    "je apatický, nežerie, má horúčku",
    "moč je tmavý alebo červený",
    "žltnú mu ďasná alebo oči"
   ],
   post: "Na Slovensku je to často babezióza a ide o dni."
  },
  kroky: [
   "Vyber ho hneď, nečakaj domov.",
   "Chyť ho tesne pri koži.",
   "Pinzetou ťahaj rovno a pomaly. Háčikom na kliešte otáčaj.",
   "Nestláčaj mu telo.",
   "Miesto umy. Zapíš si dátum.",
   "Prezri celého psa: hlava, uši, podpazušie, medzi prstami, slabiny."
  ],
  nikdy: [
   "olej, alkohol, lak ani oheň na kliešťa"
  ]
 },
 {
  id: "podchladenie",
  group: "B",
  tile: "Podchladenie",
  title: "Podchladenie",
  img: "/prva-pomoc/podchladenie.webp",
  imgCap: "izolácia pod psa, zabaliť, teplá fľaša pri hrudi",
  fotky: [
   {
    src: "/prva-pomoc/pes-zabaleny-v-deke.webp",
    cap: "pes zabalený v deke (CC0)"
   }
  ],
  spoznas: [
   "trasie sa, je stuhnutý, spomalený",
   "keď sa triasť prestane a slabne, je to horšie, nie lepšie"
  ],
  kroky: [
   "Závetrie, sucho. Daj dole mokrý postroj.",
   "Osuš ho a polož na niečo, čo izoluje (karimatka, ruksak).",
   "Zabaľ ho, aj zospodu. Pritlač si ho k telu.",
   "Fľašu s teplou vodou zabaľ do látky a daj mu ju k hrudníku a bruchu.",
   "Ak pije, daj vlažnú vodu.",
   "K veterinárovi, aj keď sa preberie."
  ],
  extra: [
   {
    h: "Omrzliny (uši, chvost, labky sú bledé, tvrdé)",
    t: "netrieť. Ohrievať až tam, kde už znovu nezamrznú, teplou vodou, v ktorej udržíš ruku."
   }
  ],
  nikdy: [
   "horúca voda, fén, trenie snehom",
   "teplý predmet priamo na kožu"
  ]
 },
 {
  id: "topil",
  group: "B",
  tile: "Topil sa",
  title: "Topil sa",
  img: "/prva-pomoc/topil-bok.webp",
  imgCap: "na boku, hlava nižšie, vyčisti papuľu",
  fotky: [
   {
    src: "/prva-pomoc/03-commons-figurina-na-boku-plaz.webp",
    cap: "záchranárska figurína na boku (CC0)"
   },
   {
    src: "/prva-pomoc/04-flickr-stena-zabalene-v-uteraku.webp",
    cap: "zabalený v uteráku (CC BY-SA, Clevergrrl)"
   }
  ],
  kroky: [
   "Na ľad za ním nechoď.",
   "Polož ho na bok, hlavu nižšie než telo, vyčisti papuľu. Len pár sekúnd.",
   "Nedýcha: karta NEDÝCHA, začni vdychmi.",
   "Osuš ho a zabaľ.",
   "K veterinárovi, aj keď vyzerá dobre."
  ],
  extra: [
   {
    h: "Potom 2 dni sleduj dych.",
    t: "Kašeľ, rýchle alebo ťažké dýchanie = hneď k veterinárovi.",
    warn: true
   },
   {
    h: "Pozor aj na",
    t: "veľa vypitej vody pri aportovaní z vody a morskú vodu. Potácanie, vracanie, nafúknuté brucho = veterinár."
   }
  ],
  nikdy: [
   "nestláčaj mu brucho, aby „vyšla voda“",
   "nedrž ho dlho dole hlavou"
  ]
 },
 {
  id: "zlomenina",
  group: "C",
  tile: "Zlomenina",
  title: "Zlomenina, nedostúpi na nohu",
  img: "/prva-pomoc/zlomenina-maly.webp",
  imgCap: "malého nes, zranená noha voľne",
  fotky: [
   {
    src: "/prva-pomoc/mwd-nosidla-dvaja-nosici-2025.webp",
    cap: "nosidlá (US Air Force, PD)"
   }
  ],
  dalsi: [
   {
    img: "/prva-pomoc/zlomenina-deka.webp",
    h: "Veľký pes",
    t: "na bundu alebo deku, napnúť ako nosidlá, nesú dvaja."
   }
  ],
  spoznas: [
   "nohu drží hore, visí v divnom uhle, opúcha",
   "pri chrbtici ťahá zadné nohy"
  ],
  kroky: [
   "Pozor, aj tvoj pes ťa od bolesti môže pohrýzť. Pozri kartu NÁHUBOK.",
   "Nohu nenaprávaj a nedlahuj.",
   "Otvorenú ranu len prekry čistou látkou.",
   "Nenechaj ho chodiť. Malého nes v náručí, zranená noha voľne, nič ju netlačí. Veľkého presuň na bundu alebo deku a neste dvaja.",
   "Podozrenie na chrbticu: len na niečom pevnom a rovnom (doska, karimatka), bez ohýbania.",
   "K veterinárovi hneď."
  ],
  nikdy: [
   "ľudské lieky proti bolesti. Ibuprofén a paracetamol psa otrávia."
  ],
  bezSignalu: "ak musí ísť sám, tak pomaly a po troch. Nohu pod lakťom alebo kolenom môžeš zľahka obložiť zrolovanou karimatkou. Stehno a rameno nikdy."
 },
 {
  id: "labka",
  group: "C",
  tile: "Labka",
  title: "Poranená labka",
  img: "/prva-pomoc/labka-obvaz.webp",
  imgCap: "obväz od prstov nahor, dva prsty pod obväz",
  vet: {
   h: "Hneď k veterinárovi, ak",
   items: [
    "krváca aj po 15 minútach",
    "rana je hlboká alebo v nej niečo ostalo",
    "je odtrhnutý pazúr",
    "popálil si labky (horúci asfalt: chlaď chladnou vodou 10 až 20 minút)"
   ]
  },
  kroky: [
   "Opláchni čistou vodou. Sklo alebo tŕň vyber, len ak ide ľahko. Hlboké nechaj.",
   "Tlač čistou látkou 5 až 10 minút.",
   "Obviaž: gáza na ranu, kúsok vaty medzi prsty, obväz od prstov nahor. Pod obväz musia vojsť dva prsty.",
   "Vonku naň natiahni vrecko alebo ponožku, doma daj dole.",
   "Nenechaj ho obväz hrýzť."
  ],
  extra: [
   {
    h: "Osina medzi prstami",
    t: "vytiahni len to, čo jasne trčí. Opuch medzi prstami = veterinár, osina putuje hlbšie."
   }
  ]
 },
 {
  id: "pohryzol",
  group: "C",
  tile: "Pohryzenie",
  title: "Pohryzol ho pes alebo diviak",
  img: "/prva-pomoc/pohryzenie-hrudnik.webp",
  imgCap: "rana na hrudníku: fólia a dlaň",
  fotky: [
   {
    src: "/prva-pomoc/k9-tccc-osetrenie-simulator-2026.webp",
    cap: "obväzovanie psa, simulátor (US Army, PD)"
   }
  ],
  vet: {
   h: "K veterinárovi",
   items: [
    "hrudník, brucho, krk, hlava = hneď",
    "Všetko ostatné v ten istý deň, najlepšie do 6 hodín"
   ]
  },
  lead: [
   "Malá dierka klame. Zuby trhajú pod kožou. Pes môže vyzerať v poriadku a skolabovať o hodinu."
  ],
  kroky: [
   "Silné krvácanie: karta KRVÁCA.",
   "Malú ranu vypláchni čistou vodou.",
   "Rana na hrudníku, z ktorej to syčí alebo bublá: prekry ju fóliou alebo vreckom a pritlač. Ak sa dych zhorší, okraj nadvihni.",
   "Vyhreznuté črevá netlač späť. Prekry vlhkou čistou látkou.",
   "Zabaľ ho, nech nechodí, a choď."
  ],
  extra: [
   {
    h: "Líška alebo iné divé zviera",
    t: "zavolaj veterinára kvôli besnote a maj pri sebe očkovací preukaz."
   }
  ],
  nikdy: [
   "peroxid do rany",
   "nič nezašívaj ani nelep"
  ]
 },
 {
  id: "popalenina",
  group: "C",
  tile: "Popálenina",
  title: "Popálenina",
  img: "/prva-pomoc/popalenina-chladenie.webp",
  imgCap: "chladná voda len na popálené miesto",
  kroky: [
   "Elektrina: najprv vypni prúd, až potom sa psa dotkni.",
   "Chlaď chladnou tečúcou vodou 20 minút. Malého psa chlaď len na mieste a zvyšok drž v teple. Vodu nie na papuľu.",
   "Chemikália: zmývaj veľkým množstvom vody.",
   "Voľne prekry potravinovou fóliou alebo čistou vlhkou látkou.",
   "K veterinárovi vždy. Po prehryznutom kábli aj vtedy, keď vyzerá dobre."
  ],
  nikdy: [
   "ľad",
   "masť, maslo, krém",
   "neprepichuj pľuzgiere"
  ]
 },
 {
  id: "oko",
  group: "C",
  tile: "Oko",
  title: "Poranené oko",
  img: "/prva-pomoc/oko-vyplach.webp",
  imgCap: "slabý prúd od vnútorného kútika",
  kroky: [
   "Chemikália: vyplachuj hneď a dlho, 15 až 20 minút. Čím máš: fyziologický roztok, inak čistá voda. Slabým prúdom, nie do papule.",
   "Nenechaj ho škrabať si oko.",
   "Zapichnutý predmet nevyberaj.",
   "Vypadnuté oko (krátkonosé psy): nezatláčaj. Prekry mokrou čistou látkou, stále vlhči a choď hneď.",
   "K veterinárovi v ten istý deň, aj keď len žmúri."
  ],
  nikdy: [
   "netlač na oko",
   "žiadne ľudské kvapky"
  ]
 },
 {
  id: "vracia",
  group: "C",
  tile: "Vracia",
  title: "Vracia, má hnačku",
  img: "/prva-pomoc/vracia-koza.webp",
  imgCap: "koža medzi lopatkami, má hneď klesnúť",
  fotky: [
   {
    src: "/prva-pomoc/02-usmc-dasna-tlak-palcom.webp",
    cap: "kontrola ďasien (USMC, PD)"
   },
   {
    src: "/prva-pomoc/04-usmc-voda-po-troche-z-dlani.webp",
    cap: "voda po troche (USMC, PD)"
   }
  ],
  vet: {
   h: "Hneď k veterinárovi, ak",
   items: [
    "krv vo zvratkoch alebo stolici",
    "dávi naprázdno a má nafúknuté brucho (karta NAFÚKNUTÉ BRUCHO)",
    "vracia opakovane viac než 4 až 6 hodín",
    "je apatický",
    "je to šteňa alebo starý pes"
   ]
  },
  lead: [
   "Stačí sledovať: raz vracal, inak je čulý. Dávaj vodu po troche a nechaj ho oddychovať."
  ],
  extra: [
   {
    h: "Je odvodnený?",
    t: "Zdvihni kožu medzi lopatkami. Ak sa vracia pomaly a ďasná sú suché a lepkavé, potrebuje veterinára. U vráskavých a starých psov sa radšej pozri na ďasná."
   }
  ],
  nikdy: [
   "ľudské lieky"
  ]
 },
 {
  id: "nahubok",
  group: "D",
  tile: "Náhubok",
  title: "Náhubok z obväzu alebo vodítka",
  img: "/prva-pomoc/nahubok-fazy.webp",
  imgCap: "slučka zhora, kríženie pod bradou, mašľa za ušami",
  fotky: [
   {
    src: "/prva-pomoc/mwd-improvizovany-nahubok-z-gazy.webp",
    cap: "náhubok z gázy (US Army, PD)"
   }
  ],
  kroky: [
   "Urob slučku, zhora ju nasaď na papuľu a utiahni.",
   "Prekríž konce pod bradou.",
   "Zaviaž na mašľu za ušami, aby sa dal hneď stiahnuť."
  ],
  extra: [
   {
    h: "Nie, ak",
    items: [
     "vracia",
     "dýcha ťažko",
     "dusí sa",
     "má krátky nos",
     "má poranenú tvár alebo hrudník",
     "je v bezvedomí",
     "je prehriaty"
    ],
    after: "Krátkonosého psa radšej zabaľ do deky.",
    warn: true
   }
  ]
 },
 {
  id: "poriadok",
  group: "D",
  tile: "Je v poriadku?",
  title: "Je v poriadku?",
  sub: "životné funkcie",
  img: "/prva-pomoc/dasna-tlak.webp",
  imgCap: "zatlač na ružové ďasno nad tesákom",
  dalsi: [
   {
    img: "/prva-pomoc/tep-stehno.webp",
    h: "Tep vnútri stehna",
    t: "bruškami ukazováka a prostredníka, vysoko pri slabine."
   }
  ],
  fotky: [
   {
    src: "/prva-pomoc/B1-dvids-femoralny-pulz-stojaci-pes.webp",
    cap: "tep na stehne (US Air Force, PD)"
   },
   {
    src: "/prva-pomoc/B2-dvids-femoralny-pulz-zozadu.webp",
    cap: "tep na stehne zozadu (US Army, PD)"
   }
  ],
  fakty: [
   {
    h: "Ďasná",
    t: "ružové a vlhké. Bledé = krvácanie, šok. Modré = dusí sa. Tehlovočervené = prehriatie. Žlté = pečeň, krv."
   },
   {
    h: "Zatlač na ďasno",
    t: "ružová sa má vrátiť do 2 sekúnd. Pri tmavých ďasnách tlač na ružové miesto."
   },
   {
    h: "Dych v pokoji",
    t: "10 až 35 za minútu."
   },
   {
    h: "Tep (ľavý bok za lakťom alebo vnútro stehna)",
    t: "hmataj ukazovákom a prostredníkom, nie palcom. Veľký pes 60 až 100, malý 90 až 140."
   },
   {
    h: "Teplota",
    t: "37,5 až 39,2 °C."
   }
  ]
 },
 {
  id: "niest",
  group: "D",
  tile: "Ako ho niesť",
  title: "Ako ho niesť",
  img: "/prva-pomoc/zlomenina-maly.webp",
  imgCap: "malého v náručí, hrudník a zadok",
  dalsi: [
   {
    img: "/prva-pomoc/zlomenina-deka.webp",
    h: "Veľký",
    t: "deku napni ako nosidlá, nesú dvaja."
   },
   {
    img: "/prva-pomoc/niest-doska.webp",
    h: "Chrbtica",
    t: "pevná doska, podlož krk a boky, pripútaj, dvíhajte naraz."
   }
  ],
  fotky: [
   {
    src: "/prva-pomoc/mwd-pes-na-nosidlach-2025.webp",
    cap: "pes na nosidlách (US Air Force, PD)"
   },
   {
    src: "/prva-pomoc/dvids-psia-figurina-na-boku-dvihaju-nosidla.webp",
    cap: "dvaja dvíhajú naraz (US Navy, PD)"
   }
  ],
  fakty: [
   {
    h: "Malý",
    t: "v náručí, podopri hrudník a zadok."
   },
   {
    h: "Veľký",
    t: "na bunde alebo deke, dvaja."
   },
   {
    h: "Chrbtica",
    t: "len na pevnom."
   }
  ]
 },
 {
  id: "lekarnicka",
  group: "D",
  tile: "Lekárnička",
  title: "Lekárnička do ruksaku",
  img: "/prva-pomoc/lekarnicka.webp",
  imgCap: "10 vecí do ruksaku",
  fotky: [
   {
    src: "/prva-pomoc/lekarnicka-pre-psa-box.webp",
    cap: "lekárnička pre psa (CC BY-SA, Elgaard)"
   },
   {
    src: "/prva-pomoc/commons-hacik-na-klieste-otom.webp",
    cap: "háčik na kliešte (CC BY-SA, Otom)"
   }
  ],
  zoznam: [
   "Gáza a obväz",
   "samolepiaci obväz",
   "páska",
   "rukavice",
   "nožnice s tupou špičkou",
   "pinzeta a háčik na kliešte",
   "fyziologický roztok",
   "záchranná fólia",
   "náhradné vodítko (náhubok aj nosidlá)",
   "číslo na veterinára a pohotovosť"
  ],
  extra: [
   {
    h: "K tomu po dohode s veterinárom",
    t: "liek na alergiu s dávkou pre tvojho psa."
   },
   {
    h: "Do lekárničky nepatrí",
    t: "peroxid, živočíšne uhlie, škrtidlo, masti."
   }
  ]
 }
];

export const AID_LINKS_SK: AidLinks = [
  [/kartou NEDÝCHA|karta NEDÝCHA/g, 'nedycha'],
  [/karta KRVÁCA/g, 'krvaca'],
  [/kartu NÁHUBOK/g, 'nahubok'],
  [/karta NAFÚKNUTÉ BRUCHO/g, 'brucho'],
];
