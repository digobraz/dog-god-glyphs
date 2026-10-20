import{r as z,c as xo,j as e,ai as Xa,F as s,k as Q,K as _,O as H,J as K,P as V,b as He,L as G,U as Be,e as ka,z as qa,_ as yo,Q as q,af as $e,W as Qa,D as la,i as Le,d as Ae,u as eo,T as vo,aJ as jo,an as wo}from"./index-B-BQrD2y.js";import{s as na}from"./cloudinaryService-BTfH_t1m.js";import{P as sa}from"./PackLayout-CGhWU_Yk.js";import{B as _e}from"./BrandIcon-Cj2cTb6H.js";import{b as Ia}from"./HandIcons-nK6bMixK.js";import{u as So,C as zo}from"./DiaryList-Ch7E3XYG.js";import{F as $o}from"./FlagCircle-DvRRQ32j.js";import{A as ae}from"./ainubisSkin-B7Z96MPq.js";import{a as No}from"./ainubis-head-g4iOYlxZ.js";import{a as Do,o as ao,d as Eo,r as To,h as Ao}from"./dogEvents-O4Dj4HRt.js";import{D as Po,a as Co,b as Mo,i as Bo,c as Ko,d as Io}from"./DiaryEntry-Zurhg1yc.js";import{a as Oo}from"./triplist-CjhvWRRF.js";import{r as Ro}from"./tripShared-DMsMy27X.js";import{a as Lo,P as Fo}from"./packStore-DJ0be3Fh.js";import{c as _o,d as Go}from"./dogAge-qL9nwVXc.js";import{B as Wo}from"./BackButton-XC1Pn_3O.js";import{a as Ho}from"./ainubis-badge-BGb27Nxy.js";import{a as oo,S as Vo}from"./dogQuiz-DTCKwKwf.js";import{d as Uo,L as Yo,m as Jo}from"./dogIdModules-D7bMwhlu.js";import{s as Zo}from"./natureQuiz-BjVOn8Uc.js";import{a as Xo}from"./countryGeo-BaPfaSrG.js";import{l as qo}from"./packDogsList-BLfpB1x_.js";import{s as Qo}from"./dogOrder-DtDpqFpm.js";import{R as en,u as an,a as on}from"./Item-BORLDRyi.js";import{R as nn}from"./RightGate-zty8MLC_.js";import"./magnetPreview-CvEjQVpP.js";import"./chataNahlad-BvQ_JlDS.js";import"./dogRights-BhKk5QOi.js";import"./ainubisBus-BMRzmB2O.js";import"./SnifferLogo-Ch81E6FO.js";import"./client-rJzPTh-q.js";import"./tslib.es6-CmEaCU22.js";import"./devMockDogs-BzGWz4qV.js";import"./pawmateRights-CWmFDd90.js";import"./wizAnchors-E3ARHgZI.js";import"./consent-DRIYVBQY.js";import"./handArrowLeft-DN9pj_cL.js";import"./flagUrl-B21iQI9I.js";import"./photoIntake-Bduu-Ry_.js";import"./addTripModel-BuQrZHBF.js";import"./packProfile-C55E2wZh.js";import"./proxy-wes7Zgjy.js";import"./use-toast-NWTrH8M9.js";const je=(a,n)=>new Date(a,n,0).getDate();function ce(a,n,o){let t=0;for(let i=1;i<n;i++)t+=je(a,i);return t+o}const aa=(a,n)=>`${a}-${n}`,Ge=[{key:"water",nameSK:"ZIMA",elementSK:"Voda",shortSK:"zima",from:{m:11,d:7},to:{m:2,d:3},bg:"#D6E6EF",ink:"#2C5870"},{key:"wood",nameSK:"JAR",elementSK:"Drevo",shortSK:"jar",from:{m:2,d:4},to:{m:5,d:5},bg:"#DCE9CE",ink:"#4A6B2F"},{key:"fire",nameSK:"LETO",elementSK:"Oheň",shortSK:"leto",from:{m:5,d:6},to:{m:7,d:21},bg:"#F6D8D6",ink:"#8E3A32"},{key:"earth",nameSK:"NESKORÉ LETO",elementSK:"Zem",shortSK:"n. leto",from:{m:7,d:22},to:{m:8,d:7},bg:"#F1E4C4",ink:"#7A5A2A"},{key:"metal",nameSK:"JESEŇ",elementSK:"Kov",shortSK:"jeseň",from:{m:8,d:8},to:{m:11,d:6},bg:"#E2E2E4",ink:"#55565C"}];function We(a,n,o){const t=ce(a,n,o);for(const i of Ge){const r=ce(a,i.from.m,i.from.d),c=ce(a,i.to.m,i.to.d);if(r<=c?t>=r&&t<=c:t>=r||t<=c)return i}return Ge[0]}function no(a,n){const o=new Map,t=[];for(let i=1;i<=je(a,n);i++){const r=We(a,n,i);let c=o.get(r.key);c||(c={season:r,days:0},o.set(r.key,c),t.push(c)),c.days+=1}return t}function tn(a,n){let o=Ge[0],t=-1;for(const i of no(a,n))i.days>t&&(t=i.days,o=i.season);return o}const rn=29.530588861,da=a=>a*Math.PI/180;function ca(a,n,o){let t=a,i=n;i<=2&&(t-=1,i+=12);const r=Math.floor(t/100),c=2-r+Math.floor(r/4);return Math.floor(365.25*(t+4716))+Math.floor(30.6001*(i+1))+o+c-1524.5}function ln(a){const n=a/1236.85,o=n*n,t=o*n;let i=245155009766e-5+rn*a+15437e-8*o-15e-8*t;const r=1-.002516*n-74e-7*o,c=da(2.5534+29.1053567*a-14e-7*o),m=da(201.5643+385.81693528*a+.0107582*o),h=da(160.7108+390.67050284*a-.0016118*o),j=Math.abs(a-Math.round(a))>.25,u=j?-.40614:-.4072,E=j?.01614:.01608,I=j?.01043:.01039,P=j?.00734:.00739,$=j?-.00515:-.00514;return i+=u*Math.sin(m)+(j?.17302:.17241)*r*Math.sin(c)+E*Math.sin(2*m)+I*Math.sin(2*h)+P*r*Math.sin(m-c)+$*r*Math.sin(m+c)+.00208*r*r*Math.sin(2*c),i}function sn(a){const n=new Map,o=Math.floor((a-2e3)*12.3685)-2,t=ca(a,1,1),i=ca(a+1,1,1);for(let r=0;r<18;r++)for(const c of[0,.5]){const m=ln(o+r+c);if(m<t||m>=i)continue;const h=Math.floor(m+.5),j=new Date(Date.UTC(2e3,0,1)+(h-ca(2e3,1,1)-.5)*864e5);n.set(aa(j.getUTCMonth()+1,j.getUTCDate()),c===0?"new":"full")}return n}const dn=[{id:"dewormSpring",nameSK:"Odčervenie",emoji:"💊",group:"give",from:{m:3,d:1},to:{m:3,d:31}},{id:"coproSpring",nameSK:"Koprológia",emoji:"🔬",group:"lab",from:{m:3,d:1},to:{m:3,d:31}},{id:"biochem",nameSK:"Biochémia",emoji:"🔬",group:"lab",from:{m:5,d:1},to:{m:7,d:31}},{id:"dewormAugust",nameSK:"Odčervenie",emoji:"💊",group:"give",from:{m:8,d:1},to:{m:8,d:31}},{id:"coproAutumn",nameSK:"Koprológia",emoji:"🔬",group:"lab",from:{m:9,d:1},to:{m:10,d:31}},{id:"immune",nameSK:"Imunitná kúra",emoji:"🌿",group:"give",from:{m:9,d:1},to:{m:10,d:15}},{id:"joints",nameSK:"Kĺbová kúra",emoji:"🌿",group:"give",from:{m:11,d:1},to:{m:12,d:31},dogOnly:"senior"}],he={nameSK:"Kliešťová sezóna",emoji:"🩸",fromMonth:4,toMonth:10},io=(a,n)=>a.group==="lab"?n.vet:n.give;function ba(a){return dn.filter(n=>!n.dogOnly||a)}function cn(a,n,o,t){const i=ce(a,n,o);return ba(t).filter(r=>i>=ce(a,r.from.m,r.from.d)&&i<=ce(a,r.to.m,r.to.d))}const to=a=>a>=he.fromMonth&&a<=he.toMonth,pn=(a,n,o)=>ce(a,n.from.m,n.from.d)<=ce(a,o,1)&&ce(a,n.to.m,n.to.d)>=ce(a,o,je(a,o));function mn(a){const n=ba(a).map(t=>({w:t,lane:0,m1:t.from.m,m2:t.to.m})).sort((t,i)=>t.m1-i.m1||t.m2-i.m2),o=[[],[]];for(const t of n){let i=!1;for(let r=0;r<o.length;r++)if(o[r].every(c=>t.m1>c.m2||t.m2<c.m1)){t.lane=r,o[r].push(t),i=!0;break}i||(t.lane=o.length-1,o[o.length-1].push(t))}return n}const Ke={log:"61,122,78",vet:"16,52,166",give:"224,138,46",gold:"201,154,63",nat:"142,42,32"},oe=(a,n)=>`rgba(${Ke[a]},${n})`;function Oa(a,n){let o=a.replace("#","");o.length===3&&(o=o.split("").map(i=>i+i).join(""));const t=parseInt(o,16);return`rgba(${t>>16&255},${t>>8&255},${t&255},${n})`}const ie={trip:{emoji:"⛰️",group:"log",nameSK:"Výlet",i18n:"pack.cal.type.trip"},vet:{emoji:"💉",group:"vet",nameSK:"Veterinár",i18n:"pack.cal.type.vet"},deworm:{emoji:"💊",group:"vet",nameSK:"Odčervenie",i18n:"pack.cal.type.deworm"},note:{emoji:"🗓️",group:"log",nameSK:"Denník",i18n:"pack.cal.type.note"},alone:{emoji:"🏠",group:"log",nameSK:"Deň bez seba",i18n:"pack.cal.type.alone"},milestone:{emoji:"⭐",group:"log",nameSK:"Míľnik",i18n:"pack.cal.type.milestone"},weigh:{emoji:"⚖️",group:"log",nameSK:"Váženie",i18n:"pack.cal.type.weigh"},plan:{emoji:"📍",group:"plan",nameSK:"Plán",i18n:"pack.cal.type.plan"}};function ro(a){let n=!1,o=0;for(const t of a){const i=ie[t.kind].group;i==="vet"?n=!0:i==="log"&&(o+=1)}return n?oe("vet",.72):o>=3?oe("log",.92):o===2?oe("log",.66):o===1?oe("log",.42):null}const xa=(a,n,o)=>a.filter(t=>t.birth&&t.birth.m===n&&t.birth.d===o);function ya(a,n,o,t,i){if(!i)return[];const r=ce(a,o,t),c=ce(a,12,31),m=[];for(const h of n){if(!h.birth)continue;const j=ce(a,h.birth.m,h.birth.d);for(let u=1;u<7;u++)if((j+Math.round(u*c/7)-1)%c+1===r){m.push(h);break}}return m}function Fe(a){if(!a||typeof a!="string")return null;const n=/^(\d{4})-(\d{2})-(\d{2})/.exec(a);if(!n)return null;const o=Number(n[1]),t=Number(n[2]),i=Number(n[3]);return o<1900||o>2200||t<1||t>12||i<1||i>je(o,t)?null:{y:o,m:t,d:i}}const lo=30,qe=20,Me=52,hn=lo*Me,un=5;function Qe(a,n){return Math.floor((n.getTime()-a.getTime())/(7*864e5))}function Ra(a,n){let o=n.getFullYear()-a.getFullYear(),t=n.getMonth()-a.getMonth(),i=n.getDate()-a.getDate();return i<0&&(t-=1,i+=je(n.getFullYear(),n.getMonth()===0?12:n.getMonth())),t<0&&(o-=1,t+=12),{y:Math.max(0,o),m:Math.max(0,t),w:Math.max(0,Math.floor(i/7))}}function ga(a,n){return new Date(a.getTime()+n*7*864e5)}const pa=[{name:"Bluey",years:29.4,exactSK:"29 rokov 160 dní",breedSK:"Austrálsky honácky pes",born:1910,died:1939,countrySK:"Austrália",verified:!0,photo:"/images/records/bluey.jpg",photoCredit:"Bluey: neznámy autor, 20. roky 20. st. · public domain · Wikimedia Commons"},{name:"Lazare",years:30.4,exactSK:"30 rokov 161 dní",breedSK:"Papillon",born:1995,died:2026,countrySK:"Francúzsko",verified:!1,patron:"03-02"},{name:"Maggie",years:30,exactSK:"",breedSK:"Austrálsky kelpie",born:1986,died:2016,countrySK:"Austrália",verified:!1,patron:"09-05"},{name:"Max",years:29.8,exactSK:"29 rokov 282 dní",breedSK:"Kríženec beagla a jazvečíka",born:1983,died:2013,countrySK:"USA",verified:!1,patron:"05-06"},{name:"Bella",years:29,exactSK:"",breedSK:"Kríženec labradora",born:1979,died:2008,countrySK:"Veľká Británia",verified:!0,patron:"08-01"},{name:"Butch",years:28,exactSK:"",breedSK:"Plemeno sa neuvádza",born:1975,died:2003,countrySK:"USA",verified:!0},{name:"Taffy",years:27.6,exactSK:"27 rokov 211 dní",breedSK:"Welšský ovčiak",born:1975,died:2003,countrySK:"Veľká Británia",verified:!0},{name:"Adjutant",years:27.3,exactSK:"27 rokov 98 dní",breedSK:"Labradorský retríver",born:1936,died:1963,countrySK:"Veľká Británia",verified:!0,patron:"08-01"},{name:"Pusuke",years:26.7,exactSK:"26 rokov 8 mesiacov",breedSK:"Kríženec šiba inu",born:1985,died:2011,countrySK:"Japonsko",verified:!0,patron:"01-05"},{name:"Spike",years:26.8,exactSK:"26 rokov 286 dní",breedSK:"Kríženec čivavy",born:1999,countrySK:"USA",verified:!0,patron:"03-01"},{name:"Bramble",years:25,exactSK:"",breedSK:"Border kólia",born:1978,died:2003,countrySK:"Veľká Británia",verified:!1,patron:"09-01"},{name:"TobyKeith",years:23.3,exactSK:"23 rokov 112 dní",breedSK:"Čivava",born:2001,died:2024,countrySK:"USA",verified:!0,patron:"03-01"},{name:"Harajuku",years:23,exactSK:"",breedSK:"Čivava",born:2e3,died:2023,countrySK:"USA",verified:!1,patron:"03-01"},{name:"Pebbles",years:22.5,exactSK:"22 rokov 189 dní",breedSK:"Toy foxteriér",born:2e3,died:2022,countrySK:"USA",verified:!0,patron:"03-04"}],gn=[{id:"weight",emoji:"⚖️",when:"always",titleSK:"Štíhlosť je jediné, čo je dokázané",bodySK:"Zo všetkého, čo sa dá so psom urobiť, má na dĺžku života najtvrdší doklad jedna vec: nenechať ho pribrať. Rozdiel medzi štíhlym a mierne obéznym psom sú roky, nie mesiace. Rebrá musia byť nahmatateľné bez tlaku."},{id:"move",emoji:"🥾",when:"always",titleSK:"Pohyb v teréne, nie kolečko okolo bloku",bodySK:"Nerovný povrch drží kĺby, svaly aj hlavu. Každý výlet, ktorý si zapíšeš, je na tejto mriežke tmavý týždeň — a tmavých týždňov je to jediné, čo vieš ovplyvniť."},{id:"food",emoji:"🍖",when:"always",titleSK:"Jedlo, ktoré pes pozná ako jedlo",bodySK:"Čím menej krokov medzi surovinou a miskou, tým menej vecí sa cestou pokazí. Granule nie sú hriech, ale nie sú ani strava — sú skratka."},{id:"chem",emoji:"🧪",when:"always",titleSK:"Chémia len vtedy, keď ju naozaj treba",bodySK:'Celoročné antiparazitiká, narkóza pre pohodlie a antibiotiká „pre istotu" sú rozhodnutia, nie rutina. Pýtaj sa pri každom jednom: čo sa stane, ak to nedám? Kde je odpoveď „nič", tam to nedávaj.'},{id:"stress",emoji:"🌙",when:"always",titleSK:"Pokoj sa počíta rovnako ako pohyb",bodySK:"Pes, ktorý je stále v strehu, spaľuje telo zvnútra. Spánok bez vyrušovania, predvídateľný deň a ticho po záťaži nie sú lenivosť — sú to hodiny, v ktorých sa telo opravuje."},{id:"protocol",emoji:"🌿",when:"always",titleSK:"Protokol namiesto panického behu k vete",bodySK:"Odčervenie, koprológia a biochémia majú v kalendári svoje okná. Pes, ktorému sa dvakrát ročne pozrieš do krvi, sa nelieči — predchádza."},{id:"joints",emoji:"🦴",when:"senior",titleSK:"Kĺby sa riešia PRED tým, než začnú bolieť",bodySK:"Tvoj pes je v seniorskom pásme. Kĺbová kúra má v kalendári okno od novembra — nie preto, že kríva, ale preto, aby nezačal."}],oa={toy:{median:14.5,low:13,high:16,kgSK:"do 6 kg"},small:{median:13,low:12,high:15,kgSK:"6–12 kg"},medium:{median:12,low:11,high:14,kgSK:"12–25 kg"},large:{median:10,low:9,high:12,kgSK:"25–45 kg"},giant:{median:8,low:7,high:10,kgSK:"nad 45 kg"}},La={toy:"Trpaslíčie",small:"Malé",medium:"Stredné",large:"Veľké",giant:"Obrie"},Fa={toy:["Affenpinscher","Bichon Frise","Biewer Terrier","Bolognese","Brussels Griffon","Chihuahua","Chinese Crested","Coton de Tulear","English Toy Terrier","German Spitz (Klein)","Havanese","Italian Greyhound","Japanese Chin","Japanese Terrier","King Charles Spaniel","Löwchen","Maltese","Maltipoo","Miniature Pinscher","Morkie","Norfolk Terrier","Norwich Terrier","Papillon","Pekingese","Petit Brabançon","Phalène","Pomeranian","Poochon","Prague Ratter","Russian Toy","Russian Tsvetnaya Bolonka","Russkiy Toy (long-haired)","Shichon","Shih Tzu","Shorkie","Silky Terrier","Tibetan Spaniel","Toy Fox Terrier","Toy Manchester Terrier","Toy Poodle","Volpino Italiano","Yorkipoo","Yorkshire Terrier"],small:["Alaskan Klee Kai","Alpine Dachsbracke","American Cocker Spaniel","American Eskimo Dog","Australian Terrier","Austrian Pinscher","Basenji","Basset Fauve de Bretagne","Beagle","Bedlington Terrier","Berger des Pyrénées","Border Terrier","Boston Terrier","Cairn Terrier","Cardigan Welsh Corgi","Cavachon","Cavalier King Charles Spaniel","Cavapoo","Cesky Terrier","Cirneco dell'Etna","Cockapoo","Dachshund","Dandie Dinmont Terrier","Danish-Swedish Farmdog","Drever","Dutch Smoushond","Finnish Spitz","French Bulldog","German Hunting Terrier","German Spitz (Mittel)","Glen of Imaal Terrier","Icelandic Sheepdog","Irish Terrier","Jack Russell Terrier","Japanese Spitz","Kooikerhondje","Kromfohrländer","Lakeland Terrier","Lancashire Heeler","Lhasa Apso","Manchester Terrier","Miniature Bull Terrier","Miniature Poodle","Miniature Schnauzer","Norrbottenspets","Norwegian Lundehund","Parson Russell Terrier","Patterdale Terrier","Pembroke Welsh Corgi","Petit Basset Griffon Vendéen","Plummer Terrier","Pomsky","Portuguese Podengo","Pug","Puggle","Pumi","Rat Terrier","Schipperke","Schnoodle","Scottish Terrier","Sealyham Terrier","Shetland Sheepdog","Shiba Inu","Skye Terrier","Small Swiss Hound","Smooth Fox Terrier","Swedish Vallhund","Teddy Roosevelt Terrier","Tibetan Terrier","Welsh Terrier","West Highland White Terrier","Westphalian Dachsbracke","Whippet","Wire Fox Terrier"],medium:["Aidi","Airedale Terrier","American Pit Bull Terrier","American Staffordshire Terrier","American Water Spaniel","Anglo-Français de Petite Vénerie","Aussiedoodle","Australian Cattle Dog","Australian Kelpie","Australian Shepherd","Austrian Black and Tan Hound","Azawakh","Barbet","Basset Artésien Normand","Basset Bleu de Gascogne","Basset Hound","Bavarian Mountain Scent Hound","Beagle Harrier","Bearded Collie","Berger Picard","Black Norwegian Elkhound","Blue Picardy Spaniel","Border Collie","Boykin Spaniel","Braque du Bourbonnais","Brittany","Canaan Dog","Canarian Warren Hound","Cao da Serra de Aires","Catalan Sheepdog","Chien d'Artois","Chow Chow","Croatian Sheepdog","Deutscher Wachtelhund","Drentse Patrijshond","Dunker","East Siberian Laika","English Bulldog","English Cocker Spaniel","English Springer Spaniel","Entlebucher Mountain Dog","Eurasier","Field Spaniel","Finnish Hound","Finnish Lapphund","French Spaniel","German Pinscher","Grand Basset Griffon Vendéen","Griffon Fauve de Bretagne","Griffon Nivernais","Halden Hound","Hamilton Hound","Harrier","Hellinikos Ichnilatis","Hokkaido","Hygenhund","Ibizan Hound","Istrian Shorthaired Hound","Italian Hound","Jindo","Kai Ken","Karelian Bear Dog","Keeshond","Kerry Blue Terrier","Kishu Ken","Lagotto Romagnolo","Mountain Cur","Mudi","Norwegian Buhund","Norwegian Elkhound","Norwegian Hound","Nova Scotia Duck Tolling Retriever","Peruvian Inca Orchid","Pharaoh Hound","Picardy Spaniel","Plott Hound","Polish Lowland Sheepdog","Pont-Audemer Spaniel","Portuguese Pointing Dog","Portuguese Water Dog","Posavaz Hound","Puli","Russian-European Laika","Saluki","Samoyed","Schapendoes","Schiller Hound","Serbian Hound","Serbian Tricolour Hound","Shar Pei","Shikoku","Siberian Husky","Sloughi","Slovensky Kopov","Small Münsterländer","Smålandsstövare","Soft Coated Wheaten Terrier","Spanish Water Dog","St. Germain Pointing Dog","Stabyhoun","Staffordshire Bull Terrier","Standard Schnauzer","Styrian Coarse-haired Hound","Sussex Spaniel","Swedish Lapphund","Swiss Hound","Thai Ridgeback","Tyrolean Hound","Vizsla","Welsh Springer Spaniel","West Siberian Laika","Wetterhoun","Wirehaired Vizsla","Xoloitzcuintli"],large:["Afghan Hound","Akita Inu","Alaskan Malamute","American Akita","American Bulldog","American Bully","American English Coonhound","American Foxhound","Appenzeller Sennenhund","Ariegeois","Beauceron","Belgian Groenendael","Belgian Laekenois","Belgian Malinois","Belgian Tervuren","Bergamasco Sheepdog","Bernedoodle","Billy","Black Mouth Cur","Black and Tan Coonhound","Bluetick Coonhound","Borzoi","Bouvier des Ardennes","Bouvier des Flandres","Boxer","Bracco Italiano","Briard","Bull Terrier","Ca de Bou","Cao de Castro Laboreiro","Catahoula Leopard Dog","Cesky Fousek","Chart Polski","Chesapeake Bay Retriever","Cimarrón Uruguayo","Clumber Spaniel","Curly-Coated Retriever","Czechoslovakian Wolfdog","Dalmatian","Dobermann","Dutch Shepherd","English Foxhound","English Setter","Flat-Coated Retriever","French Pointing Dog","Galgo Español","German Longhaired Pointer","German Shepherd","German Shorthaired Pointer","German Wirehaired Pointer","Giant Schnauzer","Golden Retriever","Goldendoodle","Gonczy Polski","Gordon Setter","Grand Anglo-Français","Grand Bleu de Gascogne","Grand Griffon Vendéen","Greenland Dog","Greyhound","Hanoverian Scenthound","Hovawart","Irish Red and White Setter","Irish Setter","Irish Water Spaniel","Italian Spinone","Krasky Ovcar","Labradoodle","Labrador Retriever","Lapinporokoira","Large Münsterländer","Magyar Agar","Majorca Shepherd Dog","Old Danish Pointing Dog","Old English Sheepdog","Olde English Bulldogge","Otterhound","Perdiguero de Burgos","Pointer (English)","Poitevin","Polish Hound","Porcelaine","Pudelpointer","Redbone Coonhound","Rhodesian Ridgeback","Rottweiler","Rough Collie","Saarloos Wolfdog","Sheepadoodle","Slovakian Wirehaired Pointer","Smooth Collie","Standard Poodle","Swedish Elkhound","Transylvanian Hound","Treeing Walker Coonhound","Weimaraner","White Swiss Shepherd","Wirehaired Pointing Griffon"],giant:["Akbash","American Bandogge","Anatolian Shepherd","Bernese Mountain Dog","Black Russian Terrier","Bloodhound","Boerboel","Broholmer","Bucovina Shepherd","Bullmastiff","Cane Corso","Caucasian Shepherd","Central Asian Shepherd","Cão de Gado Transmontano","Dogo Argentino","Dogue de Bordeaux","English Mastiff","Estrela Mountain Dog","Fila Brasileiro","Great Dane","Greater Swiss Mountain Dog","Irish Wolfhound","Kangal","Karakachan","Komondor","Kuvasz","Landseer","Leonberger","Maremma Sheepdog","Mioritic Shepherd","Moscow Watchdog","Neapolitan Mastiff","Newfoundland","Perro de Presa Canario","Polish Tatra Sheepdog","Pyrenean Mastiff","Pyrenean Mountain Dog","Rafeiro do Alentejo","Saint Bernard","Sarplaninac","Scottish Deerhound","Slovensky Cuvac","South African Boerboel","South Russian Ovcharka","Spanish Mastiff","Tibetan Mastiff","Tornjak","Tosa Inu","Šarplaninac"]},fn={Affenpinscher:[12,15],"Biewer Terrier":[12,15],Bolognese:[12,14],"Brussels Griffon":[12,15],Chihuahua:[14,16],"Chinese Crested":[13,18],"Coton de Tulear":[15,19],"English Toy Terrier":[12,13],Havanese:[14,16],"Italian Greyhound":[14,15],"Japanese Chin":[10,12],"Japanese Terrier":[12,15],Löwchen:[13,15],Maltese:[12,15],Maltipoo:[12,16],Morkie:[10,13],Papillon:[14,16],Pekingese:[12,14],"Petit Brabançon":[12,15],Phalène:[14,16],Pomeranian:[12,16],"Prague Ratter":[12,14],"Russian Toy":[12,14],"Russkiy Toy (long-haired)":[12,14],"Toy Fox Terrier":[13,15],"Toy Poodle":[14,17],"Volpino Italiano":[14,16],"Yorkshire Terrier":[11,15],"Alaskan Klee Kai":[13,16],"Alpine Dachsbracke":[12,14],"Australian Terrier":[11,15],Basenji:[13,14],"Basset Fauve de Bretagne":[11,14],"Bichon Frise":[14,15],"Border Terrier":[12,15],"Boston Terrier":[11,13],"Cairn Terrier":[13,15],"Cardigan Welsh Corgi":[12,15],Cavachon:[12,15],"Cavalier King Charles Spaniel":[12,15],Cavapoo:[12,15],"Cesky Terrier":[12,15],Cockapoo:[12,15],"Croatian Sheepdog":[13,14],Dachshund:[12,16],"Dandie Dinmont Terrier":[12,15],Drever:[12,15],"French Bulldog":[10,12],"German Hunting Terrier":[13,15],"German Pinscher":[12,14],"German Spitz (Klein)":[13,15],"German Spitz (Mittel)":[13,15],"Glen of Imaal Terrier":[10,15],"Grand Basset Griffon Vendéen":[12,14],"Jack Russell Terrier":[13,16],"Japanese Spitz":[12,16],"King Charles Spaniel":[10,12],Kooikerhondje:[12,15],Kromfohrländer:[13,15],"Lagotto Romagnolo":[15,17],"Lakeland Terrier":[12,15],"Lancashire Heeler":[12,15],"Lhasa Apso":[12,15],"Manchester Terrier":[15,17],"Miniature Bull Terrier":[11,13],"Miniature Pinscher":[12,16],"Miniature Poodle":[13,16],"Miniature Schnauzer":[12,15],Mudi:[12,14],"Norfolk Terrier":[12,16],"Norwegian Lundehund":[12,15],"Norwich Terrier":[12,15],"Parson Russell Terrier":[13,15],"Pembroke Welsh Corgi":[12,13],"Petit Basset Griffon Vendéen":[14,16],Pomsky:[12,15],Pug:[13,15],Puggle:[10,15],Pumi:[12,13],"Rat Terrier":[12,18],Schapendoes:[12,15],Schipperke:[13,15],Schnoodle:[12,15],"Scottish Terrier":[11,13],"Sealyham Terrier":[12,14],"Shetland Sheepdog":[12,14],"Shih Tzu":[11,15],"Silky Terrier":[13,15],"Skye Terrier":[12,14],"Smooth Fox Terrier":[12,15],"Spanish Water Dog":[12,14],Stabyhoun:[13,14],"Swedish Vallhund":[12,15],"Teddy Roosevelt Terrier":[14,16],"Tibetan Spaniel":[12,15],"Tibetan Terrier":[12,15],"Welsh Terrier":[12,15],"West Highland White Terrier":[13,15],"Westphalian Dachsbracke":[12,14],"Wire Fox Terrier":[12,15],"Afghan Hound":[12,18],Aidi:[10,12],"Airedale Terrier":[11,14],"American Cocker Spaniel":[10,14],"American English Coonhound":[11,12],"American Foxhound":[11,13],"American Pit Bull Terrier":[12,16],"American Staffordshire Terrier":[12,16],"American Water Spaniel":[10,14],"Appenzeller Sennenhund":[12,15],Aussiedoodle:[10,13],"Australian Cattle Dog":[12,16],"Australian Shepherd":[12,15],Azawakh:[12,15],Barbet:[12,14],"Basset Hound":[12,13],"Bavarian Mountain Scent Hound":[12,14],Beagle:[10,15],"Bearded Collie":[12,14],"Bedlington Terrier":[11,16],"Belgian Groenendael":[10,14],"Belgian Laekenois":[10,12],"Belgian Malinois":[14,16],"Belgian Tervuren":[12,14],"Bergamasco Sheepdog":[13,15],"Berger Picard":[12,13],"Berger des Pyrénées":[15,17],"Black and Tan Coonhound":[10,12],"Blue Picardy Spaniel":[12,14],"Bluetick Coonhound":[11,12],"Border Collie":[12,15],Borzoi:[9,14],"Boykin Spaniel":[10,15],"Bracco Italiano":[10,14],Brittany:[12,14],"Bull Terrier":[12,13],"Canaan Dog":[12,15],"Catalan Sheepdog":[12,14],"Cesky Fousek":[12,15],"Chart Polski":[10,12],"Chow Chow":[8,12],"Cirneco dell'Etna":[12,14],"Clumber Spaniel":[10,12],"Curly-Coated Retriever":[10,12],"Czechoslovakian Wolfdog":[12,16],Dalmatian:[11,13],"Deutscher Wachtelhund":[12,14],"Drentse Patrijshond":[12,14],"Dutch Shepherd":[11,14],"English Bulldog":[8,10],"English Cocker Spaniel":[12,14],"English Foxhound":[10,13],"English Springer Spaniel":[12,14],"Entlebucher Mountain Dog":[11,13],Eurasier:[12,16],"Field Spaniel":[12,13],"Finnish Hound":[12,14],"Finnish Lapphund":[12,15],"Finnish Spitz":[13,15],"Flat-Coated Retriever":[8,10],"French Spaniel":[10,12],"Galgo Español":[12,15],"German Longhaired Pointer":[12,14],"German Shorthaired Pointer":[10,12],"German Wirehaired Pointer":[12,14],Goldendoodle:[10,15],"Greenland Dog":[12,14],Harrier:[12,15],Hokkaido:[11,13],"Ibizan Hound":[11,14],"Icelandic Sheepdog":[12,14],"Irish Terrier":[13,15],"Irish Water Spaniel":[10,12],"Italian Spinone":[10,12],"Kai Ken":[12,15],"Karelian Bear Dog":[11,13],Keeshond:[12,15],"Kerry Blue Terrier":[12,15],Labradoodle:[12,14],"Norwegian Buhund":[12,15],"Norwegian Elkhound":[12,15],"Nova Scotia Duck Tolling Retriever":[12,14],"Peruvian Inca Orchid":[12,14],"Pharaoh Hound":[12,14],"Picardy Spaniel":[12,14],"Plott Hound":[12,14],"Polish Hound":[13,14],"Polish Lowland Sheepdog":[12,14],"Portuguese Podengo":[12,15],"Portuguese Water Dog":[11,13],Puli:[12,16],"Redbone Coonhound":[12,15],"Rough Collie":[12,14],"Saarloos Wolfdog":[10,12],Saluki:[10,17],"Shar Pei":[8,12],"Shiba Inu":[13,16],Sloughi:[10,15],"Smooth Collie":[12,14],"Soft Coated Wheaten Terrier":[12,14],"Staffordshire Bull Terrier":[12,14],"Standard Poodle":[11,14],"Standard Schnauzer":[13,16],"Sussex Spaniel":[12,15],"Thai Ridgeback":[12,13],"Transylvanian Hound":[10,14],"Treeing Walker Coonhound":[12,13],Vizsla:[12,14],Weimaraner:[10,13],"Welsh Springer Spaniel":[12,15],Whippet:[12,15],"Wirehaired Vizsla":[12,14],Xoloitzcuintli:[13,18],"Akita Inu":[10,13],"Alaskan Malamute":[10,14],"American Akita":[10,13],"American Bulldog":[10,12],"Anatolian Shepherd":[11,13],"Australian Kelpie":[12,15],Beauceron:[10,12],Bernedoodle:[10,14],"Bernese Mountain Dog":[7,10],"Black Russian Terrier":[10,12],Bloodhound:[10,12],"Bouvier des Flandres":[10,12],Boxer:[10,12],Briard:[12,12],Bullmastiff:[7,9],"Ca de Bou":[10,12],"Cane Corso":[9,12],"Caucasian Shepherd":[10,12],"Central Asian Shepherd":[12,15],"Chesapeake Bay Retriever":[10,13],Dobermann:[10,12],"Dogo Argentino":[9,15],"Dogue de Bordeaux":[5,8],"English Setter":[10,12],"Estrela Mountain Dog":[10,14],"Fila Brasileiro":[9,11],"German Shepherd":[9,13],"Giant Schnauzer":[10,12],"Golden Retriever":[10,12],"Gordon Setter":[12,13],"Grand Bleu de Gascogne":[10,12],"Greater Swiss Mountain Dog":[8,11],Greyhound:[10,13],Hovawart:[10,14],"Irish Red and White Setter":[11,15],"Irish Setter":[12,15],"Irish Wolfhound":[6,8],Kangal:[12,15],Komondor:[10,12],Kuvasz:[10,12],"Labrador Retriever":[11,13],Landseer:[9,11],Lapinporokoira:[10,14],"Large Münsterländer":[12,13],Leonberger:[7,9],"Maremma Sheepdog":[11,13],Newfoundland:[9,10],"Old English Sheepdog":[10,12],Otterhound:[10,13],"Perro de Presa Canario":[9,11],"Pointer (English)":[12,17],"Polish Tatra Sheepdog":[10,12],"Pyrenean Mountain Dog":[10,12],"Rhodesian Ridgeback":[10,12],Rottweiler:[9,10],"Saint Bernard":[8,10],Samoyed:[12,14],Sarplaninac:[11,13],"Scottish Deerhound":[8,11],Sheepadoodle:[12,15],"Siberian Husky":[12,14],"Slovensky Cuvac":[11,13],"Small Münsterländer":[12,14],"South African Boerboel":[9,11],"Spanish Mastiff":[10,12],"Tibetan Mastiff":[10,12],Tornjak:[12,14],"Tosa Inu":[10,12],"White Swiss Shepherd":[12,14],"Wirehaired Pointing Griffon":[12,15],Broholmer:[8,10],"English Mastiff":[6,10],"Great Dane":[7,10],"Moscow Watchdog":[9,11],"Neapolitan Mastiff":[7,9],"Pyrenean Mastiff":[10,13],"American Bully":[8,13],"American Eskimo Dog":[13,15],Akbash:[10,11],"Bucovina Shepherd":[10,12],Karakachan:[12,14],"Catahoula Leopard Dog":[10,14],"Black Mouth Cur":[12,16],"Patterdale Terrier":[11,13],"Toy Manchester Terrier":[14,16],"Olde English Bulldogge":[9,14],"Danish-Swedish Farmdog":[11,13],Boerboel:[9,11],Šarplaninac:[11,13]};let ma=null;function kn(){if(ma)return ma;const a=new Map;return Object.keys(Fa).forEach(n=>{for(const o of Fa[n])a.set(o.toLowerCase(),n)}),ma=a,a}function fa(a){return a?kn().get(a.trim().toLowerCase())??null:null}function ha(a){if(!a)return null;const n=a.trim(),o=fn[n],t=fa(n);if(o){const[i,r]=o;return{low:i,high:r,median:Math.round((i+r)/2*10)/10,kgSK:t?oa[t].kgSK:"",fromBreed:!0}}return t?oa[t]:null}function bn(a){return a<6?"toy":a<12?"small":a<25?"medium":a<45?"large":"giant"}function xn(a,n,o,t){if(!((a||"").trim().toLowerCase()==="mixed")){const h=ha(a);if(h)return{band:h,basis:"breed",labelSK:(a||"").trim(),size:fa(a)}}const r=ha(n),c=ha(o);if(r&&c){const h=(j,u)=>Math.round((j+u)/2*10)/10;return{band:{median:h(r.median,c.median),low:h(r.low,c.low),high:h(r.high,c.high),kgSK:""},basis:"mix",labelSK:`${(n||"").trim()} × ${(o||"").trim()}`,size:null}}const m=r||c;if(m)return{band:m,basis:"mix",labelSK:(n||o||"").trim(),size:fa(n||o)};if(t&&t>0){const h=bn(t);return{band:oa[h],basis:"weight",labelSK:`${t} kg`,size:h}}return{band:oa.medium,basis:"default",labelSK:"",size:null}}const Re=V,so="calendar.bands",le="#B25640",_a="rgba(217,130,43,.55)";function yn(a){if(!a||typeof a!="object")return{};const n=a,o=t=>{if(!t||typeof t!="object")return;const{low:i,high:r}=t;return typeof i=="number"&&typeof r=="number"&&i>=0&&r>=i&&r<=30?{low:i,high:r}:void 0};return{life:o(n.life),target:o(n.target)}}function vn({dogId:a,dogName:n,birthLabel:o,since:t,ourLife:i,ourTarget:r,ourLifeBasis:c,preName:m,saved:h,onClose:j,tx:u}){const[E,I]=z.useState(t),[P,$]=z.useState(h.life??i),[D,k]=z.useState(h.target??r),[b,p]=z.useState(!1),[f,C]=z.useState(null);z.useEffect(()=>{const w=v=>{v.key==="Escape"&&j()};return window.addEventListener("keydown",w),()=>window.removeEventListener("keydown",w)},[j]);const N=(w,v)=>w.low===v.low&&w.high===v.high,x=w=>Number.isFinite(w.low)&&Number.isFinite(w.high)&&w.low>=1&&w.high>=w.low&&w.high<=30;async function O(){if(!x(P)||!x(D)){C(u("pack.cal.set.invalid",'Years must be 1–30 and "from" cannot be higher than "to".'));return}p(!0),C(null);const w=new Date().toISOString(),v=[];E&&E!==t&&v.push({dogId:a,field:"basics.since",value:E,source:"profile",recordedAt:w});const F={...N(P,i)?{}:{life:P},...N(D,r)?{}:{target:D}},W=JSON.stringify(h);JSON.stringify(F)!==W&&v.push({dogId:a,field:so,value:F,source:"profile",recordedAt:w});try{v.length&&await Do(v),j()}catch{C(u("pack.diary.saveFailed","The entry could not be saved. Try again.")),p(!1)}}const S={borderRadius:Q.field,padding:`${s.md}px ${s.lg}px`,fontFamily:_,fontSize:H.label,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",cursor:"pointer",whiteSpace:"nowrap",width:"100%",background:G.grad,border:`1px solid ${Be.edge}`,color:G.ink,boxShadow:He,opacity:b?.45:1},A=u("pack.cal.life.years","rokov"),y=(w,v,F)=>e.jsxs("div",{className:"cbs-span",children:[e.jsx("input",{id:`${F}-lo`,className:"pf-field dia-inp",type:"number",inputMode:"numeric",min:1,max:30,value:Number.isFinite(w.low)?w.low:"",onChange:W=>v({...w,low:parseInt(W.target.value,10)}),"aria-label":u("pack.cal.set.from","from")}),e.jsx("span",{children:"–"}),e.jsx("input",{id:`${F}-hi`,className:"pf-field dia-inp",type:"number",inputMode:"numeric",min:1,max:30,value:Number.isFinite(w.high)?w.high:"",onChange:W=>v({...w,high:parseInt(W.target.value,10)}),"aria-label":u("pack.cal.set.to","to")}),e.jsx("span",{children:A})]}),M=(w,v)=>e.jsxs("p",{className:"dia-hint",children:[u("pack.cal.set.ours","Our estimate:")," ",w.low,"–",w.high," ",A," · ",v," ",e.jsx("i",{children:u("pack.cal.set.disclaimer","Based on available information — every dog is different.")})]}),R=(w,v,F)=>!N(w,v)&&e.jsx("button",{type:"button",className:"dia-link",onClick:()=>F(v),children:u("pack.cal.set.reset","Use our estimate")});return xo.createPortal(e.jsxs("div",{className:"dia-bg",onClick:w=>{w.target===w.currentTarget&&j()},children:[e.jsxs("style",{children:[Xa,Po,jn]}),e.jsxs("div",{className:"dia-pop",role:"dialog","aria-modal":"true","aria-label":u("pack.cal.set.title","Life frames"),children:[e.jsxs("div",{className:"cbs-head",children:[e.jsx(Wo,{tone:"pale",onClick:j,label:u("pack.diary.cancel","Cancel")}),e.jsx("h4",{children:u("pack.cal.set.title","Life frames")})]}),e.jsx("p",{className:"dia-hint",style:{marginTop:0},children:u("pack.cal.set.intro","Three frames next to the years in the LIFE view. We set them for you; you can set them your way — {name} is your dog.").replace("{name}",n)}),e.jsxs("div",{className:"cbs-sec",style:{borderColor:le},children:[e.jsx("div",{className:"cbs-t",style:{color:le},children:m}),e.jsx("p",{className:"dia-hint",children:u("pack.cal.set.preSub","From birth to the day they came to you — from a breeder, a shelter or the street.")}),e.jsx("label",{className:"dia-lbl",htmlFor:"cbs-since",children:u("pack.cal.set.since","Together since")}),e.jsx("input",{id:"cbs-since",className:"pf-field dia-inp",type:"date",value:E,onChange:w=>I(w.target.value)}),e.jsxs("p",{className:"dia-hint",children:[u("pack.cal.set.birth","Born:")," ",o," · ",u("pack.cal.set.sinceNote","the same date as in DOG ID")]})]}),e.jsxs("div",{className:"cbs-sec",style:{borderColor:Re.accentGold},children:[e.jsx("div",{className:"cbs-t",style:{color:Re.accentGold},children:u("pack.cal.set.life","Average lifespan")}),y(P,$,"cbs-life"),M(i,c),R(P,i,$)]}),e.jsxs("div",{className:"cbs-sec",style:{borderColor:Re.growGreen},children:[e.jsx("div",{className:"cbs-t",style:{color:Re.growGreen},children:u("pack.cal.set.target","With excellent care")}),y(D,k,"cbs-tgt"),M(r,u("pack.cal.set.targetWhy","up to 5 years above average with lean weight, movement and prevention")),R(D,r,k)]}),f&&e.jsx("p",{className:"dia-err",children:f}),e.jsx("div",{style:{marginTop:s.xl},children:e.jsx("button",{type:"button",style:S,disabled:b,onClick:()=>void O(),children:b?u("pack.diary.saving","Saving…"):u("pack.cal.set.save","Save")})})]})]}),document.body)}const jn=`
.cbs-head{display:flex;align-items:center;gap:${s.md}px;margin-bottom:${s.md}px}
.cbs-head h4{margin:0}
.cbs-sec{border:1px solid;border-radius:${Q.tile}px;padding:${s.md}px ${s.lg}px;margin-top:${s.lg}px}
.cbs-t{font-family:${_};font-weight:700;font-size:${H.body}px;letter-spacing:0.14em;text-transform:uppercase}
.cbs-span{display:flex;align-items:center;gap:${s.sm}px;margin-top:${s.sm}px;
  font-family:${K};font-size:${H.body}px;color:${Re.inkWarm}}
.cbs-span .dia-inp{width:72px;text-align:center}
`,d=V,xe="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif",De=a=>`background:${a.background};border:${a.border};border-radius:${a.borderRadius}px`+(a.boxShadow?`;box-shadow:${a.boxShadow}`:""),wn=a=>`font-family:${a.fontFamily};font-weight:${a.fontWeight};font-size:${a.fontSize}px;letter-spacing:${a.letterSpacing};text-transform:${a.textTransform}`,Ee=a=>{const n=typeof document<"u"&&document.documentElement.lang||"sk";try{return new Intl.NumberFormat(n,{maximumFractionDigits:1}).format(a)}catch{return String(a)}},Sn=a=>a===1?"one":a>=2&&a<=4?"few":"many",ua=(a,n,o,t,i,r)=>{const c=Sn(n),m=c==="one"?t:c==="few"?i:r;return`${n} ${a(`pack.cal.ageUnit.${o}.${c}`,m)}`},Te=(a,n)=>a.toLocaleDateString(n,{day:"numeric",month:"numeric",year:"numeric"}),Ga=(a,n)=>{const o=[];return n.y&&o.push(ua(a,n.y,"year","rok","roky","rokov")),n.m&&o.push(ua(a,n.m,"month","mesiac","mesiace","mesiacov")),(n.w||o.length===0)&&o.push(ua(a,n.w,"week","týždeň","týždne","týždňov")),o.join(" · ")};function Wa(a,n){const o=new Intl.DateTimeFormat(a,{month:n});return Array.from({length:12},(t,i)=>o.format(new Date(2020,i,1)))}function zn(a){const n=new Intl.DateTimeFormat(a,{weekday:"short"});return Array.from({length:7},(o,t)=>n.format(new Date(2024,0,1+t)))}const $n=new Set([1,5,10,15,20,25,31]);function Nn({dogs:a,latest:n,tx:o,onAddToDay:t}){var we,Ve;const i=new Date().getFullYear(),r=z.useMemo(()=>{const l=new Date;return{m:l.getMonth()+1,d:l.getDate(),year:l.getFullYear()}},[]),{lang:c}=ka(),m=z.useMemo(()=>qa(c),[c]),h=z.useMemo(()=>Wa(m,"long"),[m]),j=z.useMemo(()=>Wa(m,"short"),[m]),u=z.useMemo(()=>zn(m),[m]),[E,I]=z.useState("life"),[P,$]=z.useState("all"),[D,k]=z.useState({log:!0,prot:!0,nat:!0}),[b,p]=z.useState(r.m),[f,C]=z.useState(null),N=z.useMemo(()=>a.map(l=>{var J,L;const T=l.selections??void 0,U=parseInt((T==null?void 0:T.birthdayMonth)||"",10),Y=parseInt((T==null?void 0:T.birthdayDay)||"",10),Z=_o(T,l.birth_year,l.life_status==="deceased"&&l.death_date?new Date(l.death_date):void 0),X=(L=(J=n[l.id])==null?void 0:J["nature.element"])==null?void 0:L.value;return{id:l.id,name:l.dog_name||"—",birth:U>=1&&U<=12&&Y>=1&&Y<=31?{m:U,d:Y}:null,element:typeof X=="string"?X:null,years:(Z==null?void 0:Z.years)??null,senior:((Z==null?void 0:Z.years)??0)>=8}}),[a,n]),x=z.useMemo(()=>P==="all"?N:N.filter(l=>l.id===P),[P,N]),O=z.useMemo(()=>(P==="all"?a[0]:a.find(l=>l.id===P))??a[0],[P,a]),S=P!=="all",A=S?((we=x[0])==null?void 0:we.element)??null:null,y=S?((Ve=x[0])==null?void 0:Ve.senior)??!1:N.some(l=>l.senior),[M,R]=z.useState([]),[w,v]=z.useState([]);z.useEffect(()=>{let l=!0;const T=Oo(),U=Object.entries(T).filter(([,Z])=>!!Z.date);if(U.length===0){R([]);return}const Y=Lo(Fo.walked);return(async()=>{const Z=await yo(()=>import("./data-trails-C7pS6eM2.js"),[]);if(!l)return;const X=new Map([...Z.HERO_TRAILS,...Ro()].map(L=>[L.id,L])),J=[];for(const[L,ve]of U){const Se=Fe(ve.date);if(!Se)continue;const de=X.get(L);J.push({kind:Y.has(L)?"trip":"plan",y:Se.y,m:Se.m,d:Se.d,title:(de==null?void 0:de.name)||"",dogId:null,href:de?`/pack/map/${de.country?de.country.toLowerCase():"svk"}/${L}`:void 0})}R(J)})(),()=>{l=!1}},[]),z.useEffect(()=>{let l=!0;const T=a.map(Z=>Z.id);if(T.length===0){v([]);return}const U=()=>{Eo(T,[...Co]).then(Z=>{if(!l)return;const X=[];for(const J of Z){const L=Fe(J.recordedAt);if(!L)continue;const ve=Mo[J.field];if(!ve)continue;const Se=Bo(`${L.y}-${String(L.m).padStart(2,"0")}-${String(L.d).padStart(2,"0")}`);if(ve==="weigh"){const Pe=typeof J.value=="number"?J.value:parseFloat(String(J.value??""));if(!Pe||Number.isNaN(Pe))continue;X.push({kind:"weigh",y:L.y,m:L.m,d:L.d,title:`${Pe} kg`,dogId:J.dogId});continue}const de=Ko(J.value);de&&X.push({kind:Se?"plan":ve,y:L.y,m:L.m,d:L.d,title:de.text.split(`
`)[0].slice(0,80),text:de.text.split(`
`).slice(1).join(`
`).trim()||void 0,dogId:J.dogId,photo:de.photo})}v(X)}).catch(()=>{l&&v([])})};U();const Y=ao(U);return()=>{l=!1,Y()}},[a]);const F=z.useMemo(()=>{var U,Y;const l=[],T=[{field:"health.vaxRabies",kind:"vet",fb:"Besnota",key:"pack.cal.vaxRabies"},{field:"health.vaxCombo",kind:"vet",fb:"Kombinovaná vakcína",key:"pack.cal.vaxCombo"},{field:"health.deworm",kind:"deworm",fb:"Odčervenie",key:"pack.cal.deworm"}];for(const Z of a)for(const X of T){const J=(Y=(U=n[Z.id])==null?void 0:U[X.field])==null?void 0:Y.value,L=Fe(typeof J=="string"?J:null);L&&l.push({kind:X.kind,y:L.y,m:L.m,d:L.d,title:o(X.key,X.fb),dogId:Z.id})}return l},[a,n,o]),W=z.useMemo(()=>{const l=new Map;for(const T of[...M,...w,...F]){if(T.y!==i||T.dogId!==null&&S&&T.dogId!==P)continue;const U=aa(T.m,T.d),Y=l.get(U);Y?Y.push(T):l.set(U,[T])}return l},[M,w,F,S,P,i]),ke=z.useMemo(()=>[...M,...w,...F].filter(l=>!(l.dogId!==null&&S&&l.dogId!==P)),[M,w,F,S,P]),re=(l,T)=>D.log?W.get(aa(l,T))??[]:[],ee=z.useMemo(()=>sn(i),[i]),ne=(l,T)=>D.nat?ee.get(aa(l,T))??null:null,se=W.size>0;z.useEffect(()=>{if(!f)return;const l=T=>{T.key==="Escape"&&C(null)};return window.addEventListener("keydown",l),()=>window.removeEventListener("keydown",l)},[f]);const pe=l=>h[l-1]??"",be=l=>j[l-1]??"",ue=l=>o(`pack.cal.season.${l}`,Ge.find(T=>T.key===l).nameSK),ye=l=>o(`pack.nature.el.${l}`,Ge.find(T=>T.key===l).elementSK),Ne=l=>o(ie[l].i18n,ie[l].nameSK),ge=l=>o(`pack.cal.prot.${l.id}`,l.nameSK);return e.jsxs("section",{id:"calendar",style:{...q.card,padding:24},children:[e.jsx("style",{children:Bn}),e.jsx("style",{children:Xa}),e.jsxs("div",{className:"cal-head",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(_e,{name:"bars",size:24,tint:"gold"}),e.jsx("h2",{style:{...Qa.card,color:d.inkStrong,lineHeight:1.05},children:o("pack.cal.title","Kalendár")})]}),e.jsx("div",{className:"pf-toggle inline-flex items-center cal-viewsw",style:{borderRadius:Q.pill,padding:4,gap:4},children:["life","year","month"].map(l=>e.jsx("button",{type:"button",className:`pf-toggle__opt${E===l?" is-on":""}`,"aria-pressed":E===l,onClick:()=>I(l),children:l==="year"?o("pack.cal.viewYear","Rok"):l==="month"?o("pack.cal.viewMonth","Mesiac"):o("pack.cal.viewLife","Život")},l))})]}),e.jsx("div",{className:"cal-ctl",children:e.jsx("div",{className:"cal-layers",role:"group","aria-label":o("pack.cal.layers","Vrstvy"),style:E==="life"?{display:"none"}:void 0,children:[["log",o("pack.cal.layerLog","Zápisy")],["prot",o("pack.cal.layerProt","Protokol")],["nat",o("pack.cal.layerNat","Príroda")]].map(([l,T])=>{const U=D[l];return e.jsxs("button",{type:"button",className:`cal-lay${U?" on":""}`,"aria-pressed":U,onClick:()=>k(Y=>({...Y,[l]:!Y[l]})),children:[e.jsx("span",{className:"cal-dot"}),T]},l)})})}),N.length>1&&e.jsxs("div",{className:"cal-dogsel",role:"group","aria-label":o("pack.cal.filter","Filter psov"),children:[E!=="life"&&e.jsx("button",{type:"button",className:`cal-dogpill${P==="all"?" on":""}`,onClick:()=>$("all"),children:o("pack.cal.allDogs","Celá svorka")}),N.map(l=>e.jsx("button",{type:"button",className:`cal-dogpill${(E==="life"?(O==null?void 0:O.id)===l.id:P===l.id)?" on":""}`,onClick:()=>$(l.id),children:l.name},l.id))]}),E==="life"?O?e.jsx(Pn,{row:O,dogs:x,entries:ke,latest:n,tx:o,monthName:pe,dow:u}):null:E==="year"?e.jsx(Dn,{year:i,today:r,dogs:x,solo:S,myElement:A,seniorSelected:y,layers:D,entriesOn:re,moonOn:ne,onDay:(l,T)=>C({m:l,d:T}),monthShort:be,seasonName:ue,elementName:ye,protName:ge,tx:o}):e.jsx(En,{year:i,month:b,today:r,dogs:x,solo:S,myElement:A,seniorSelected:y,layers:D,entriesOn:re,moonOn:ne,onDay:(l,T)=>C({m:l,d:T}),setMonth:p,monthName:pe,seasonName:ue,elementName:ye,protName:ge,tx:o,dow:u}),E!=="life"&&D.log&&!se&&e.jsx("p",{className:"cal-note",style:{marginTop:12},children:o("pack.cal.emptyHint","Zatiaľ tu nie je ani jeden zápis. Kalendár kreslí len to, čo má DEŇ — výlet s dátumom, očkovanie, váženie.")}),E!=="life"&&e.jsx(Tn,{layers:D,solo:S,tx:o,typeName:Ne}),f&&e.jsx(An,{year:i,day:f,dogs:x,solo:S,myElement:A,seniorSelected:y,layers:D,entries:re(f.m,f.d),moon:ne(f.m,f.d),onClose:()=>C(null),onAdd:t&&a.length>0?()=>{const l=T=>String(T).padStart(2,"0");t(`${i}-${l(f.m)}-${l(f.d)}`),C(null)}:void 0,monthName:pe,seasonName:ue,elementName:ye,typeName:Ne,protName:ge,tx:o})]})}function Dn({year:a,today:n,dogs:o,solo:t,myElement:i,seniorSelected:r,layers:c,entriesOn:m,moonOn:h,onDay:j,monthShort:u,seasonName:E,elementName:I,protName:P,tx:$}){const D=c.prot?mn(r):[];return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"cal-yr",children:[e.jsx("span",{}),e.jsx("div",{className:"cal-yr-hdnum","aria-hidden":!0,children:Array.from({length:31},(k,b)=>e.jsx("span",{className:$n.has(b+1)?"is-tick":void 0,children:b+1},b))}),e.jsx("div",{className:"cal-yr-hdrail",children:$("pack.cal.periods","Obdobia")}),Array.from({length:12},(k,b)=>{const p=b+1,f=no(a,p),C=tn(a,p),N=i!==null&&f.some(x=>x.season.key===i);return e.jsxs(z.Fragment,{children:[e.jsxs("div",{className:`cal-mlbl${N?" mine":""}`,style:{background:Oa(C.bg,.85),color:C.ink},title:f.map(x=>`${E(x.season.key)} · ${I(x.season.key)}`).join(" → "),children:[e.jsx("b",{children:u(p)}),e.jsx("i",{children:f.map(x=>$(`pack.cal.seasonShort.${x.season.key}`,x.season.shortSK)).join(" · ")})]}),e.jsx("div",{className:"cal-yr-cells",children:Array.from({length:31},(x,O)=>{const S=O+1;if(S>je(a,p))return e.jsx("span",{className:"cal-cell void"},S);const A=We(a,p,S),y=m(p,S),M=c.log?ro(y):null,R=["cal-cell"];c.log&&(xa(o,p,S).length?R.push("ringBirth"):ya(a,o,p,S,t).length?R.push("ringHuman"):!M&&y.some(v=>ie[v.kind].group==="plan")&&R.push("isPlan")),a===n.year&&p===n.m&&S===n.d&&R.push("today");const w=h(p,S);return e.jsx("span",{className:R.join(" "),style:{background:M||Oa(A.bg,.5)},role:"button",tabIndex:0,"aria-label":`${S}. ${u(p)}`,onClick:()=>j(p,S),onKeyDown:v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),j(p,S))},children:w&&e.jsx("span",{className:w==="full"?"moonF":"moonN"})},S)})})]},p)}),e.jsxs("div",{className:"cal-rail","aria-hidden":!0,children:[D.map((k,b)=>{const p=io(k.w,Ke);return e.jsxs("div",{className:"cal-bar",style:{gridColumn:k.lane+1,gridRow:`${k.m1}/${k.m2+1}`,background:`rgba(${p},0.15)`,border:`1px solid rgba(${p},0.45)`,color:`rgb(${p})`},title:`${P(k.w)} — ${va(k.w)}`,children:[e.jsx("em",{style:{fontFamily:xe},children:k.w.emoji}),e.jsx("span",{children:P(k.w)})]},`${k.w.id}-${b}`)}),c.nat&&e.jsx("div",{className:"cal-barnat",style:{gridRow:`${he.fromMonth}/${he.toMonth+1}`,background:oe("nat",.13),border:`1px solid ${oe("nat",.4)}`},title:$("pack.cal.ticks",he.nameSK),children:e.jsx("span",{style:{fontFamily:xe},children:he.emoji})})]})]}),e.jsx("p",{className:"cal-note",style:{marginTop:12},children:$("pack.cal.yearNote","Bunka nesie jeden deň. Všetko, čo trvá — sezóna, okno protokolu, kliešte — stojí vpravo a má meno.")})]})}const va=a=>`${a.from.d}. ${a.from.m}. – ${a.to.d}. ${a.to.m}.`;function En({year:a,month:n,today:o,dogs:t,solo:i,myElement:r,seniorSelected:c,layers:m,entriesOn:h,moonOn:j,onDay:u,setMonth:E,monthName:I,seasonName:P,elementName:$,protName:D,tx:k,dow:b}){const p=We(a,n,1),f=We(a,n,je(a,n)),C=(new Date(a,n-1,1).getDay()+6)%7,N=x=>`${P(x)} · ${$(x)}${x===r?` — ${k("pack.cal.hisSeason","jeho sezóna")}`:""}`;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"cal-monav",children:[e.jsx("button",{type:"button",onClick:()=>E(n>1?n-1:12),"aria-label":k("pack.cal.prevMonth","Predchádzajúci mesiac"),children:"‹"}),e.jsxs("span",{className:"cal-moname",children:[I(n)," ",a]}),e.jsx("button",{type:"button",onClick:()=>E(n<12?n+1:1),"aria-label":k("pack.cal.nextMonth","Ďalší mesiac"),children:"›"})]}),e.jsxs("div",{className:"cal-band",children:[e.jsx("span",{className:"cal-chip",style:{background:p.bg,color:p.ink,borderColor:`${p.ink}55`},children:N(p.key)}),f.key!==p.key&&e.jsx("span",{className:"cal-chip",style:{background:f.bg,color:f.ink,borderColor:`${f.ink}55`},children:N(f.key)}),m.prot&&ba(c).filter(x=>x.from.m<=n&&x.to.m>=n).map((x,O)=>{const S=io(x,Ke);return e.jsxs("span",{className:"cal-chip",style:{color:`rgb(${S})`,borderColor:`rgba(${S},0.45)`,background:`rgba(${S},0.08)`},children:[e.jsx("span",{style:{fontFamily:xe},children:x.emoji}),D(x),!pn(a,x,n)&&e.jsx("small",{children:va(x)})]},`${x.id}-${O}`)}),m.nat&&to(n)&&e.jsxs("span",{className:"cal-chip",style:{color:`rgb(${Ke.nat})`,borderColor:oe("nat",.4),background:oe("nat",.07)},children:[e.jsx("span",{style:{fontFamily:xe},children:he.emoji}),k("pack.cal.ticks",he.nameSK)]})]}),e.jsxs("div",{className:"cal-mogrid",children:[b.map((x,O)=>e.jsx("div",{className:"cal-dow",children:x},`${O}-${x}`)),Array.from({length:C},(x,O)=>e.jsx("div",{className:"cal-mocell out"},`out-${O}`)),Array.from({length:je(a,n)},(x,O)=>{const S=O+1,A=h(n,S),y=m.log?ro(A):null,M=[];m.log&&(xa(t,n,S).forEach(()=>M.push("🎂")),ya(a,t,n,S,i).forEach(()=>M.push("🎈")),A.forEach(v=>M.push(ie[v.kind].emoji)));const R=j(n,S),w=a===o.year&&n===o.m&&S===o.d;return e.jsxs("div",{className:`cal-mocell${w?" today":""}`,style:y?{background:Ha(y,.1),borderColor:Ha(y,.45)}:void 0,role:"button",tabIndex:0,onClick:()=>u(n,S),onKeyDown:v=>{(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),u(n,S))},children:[e.jsx("span",{className:"cal-monum",children:S}),R&&e.jsx("span",{className:"cal-momoon",style:{background:R==="full"?"#FFFDF5":"#241a09"}}),e.jsxs("span",{className:"cal-momk",style:{fontFamily:xe},children:[M.slice(0,3).join(""),M.length>3&&e.jsxs("u",{children:["+",M.length-3]})]})]},S)})]}),e.jsx("p",{className:"cal-note",style:{marginTop:12},children:k("pack.cal.monthNote","Kalendár kreslí len to, čo má deň. Výlet bez dátumu tu nie je — ostáva v tripliste.")})]})}function Ha(a,n){return a.replace(/[\d.]+\)$/,`${n})`)}function Tn({layers:a,solo:n,tx:o,typeName:t}){const i=(c,m,h)=>e.jsxs("div",{className:"cal-lg",children:[e.jsx("span",{className:"cal-sw",style:c}),e.jsxs("div",{children:[e.jsx("b",{children:m}),h&&e.jsx("span",{children:h})]})]},m),r=(c,m,h)=>e.jsxs("div",{className:"cal-lg",children:[e.jsx("span",{className:"cal-sw",style:{fontFamily:xe},children:c}),e.jsxs("div",{children:[e.jsx("b",{children:m}),h&&e.jsx("span",{children:h})]})]},`${c}${m}`);return e.jsxs(e.Fragment,{children:[a.log&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"cal-lgroup",children:[e.jsx("div",{className:"cal-lgtitle",children:o("pack.cal.legendHuman","Píše človek")}),e.jsx("div",{className:"cal-lgrid",children:["trip","vet","deworm","note","alone","weigh"].map(c=>r(ie[c].emoji,t(c)))})]}),e.jsxs("div",{className:"cal-lgroup",children:[e.jsx("div",{className:"cal-lgtitle",children:o("pack.cal.legendAuto","Objaví sa samo")}),e.jsxs("div",{className:"cal-lgrid",children:[r("🎂",o("pack.cal.birthday","Narodeniny"),o("pack.cal.birthdayDesc","zlatý prstenec")),r("🎈",o("pack.cal.humanYear","Ľudský rok"),n?o("pack.cal.humanYearDesc","1 zo 7"):o("pack.cal.humanYearPick","vyber psa, aby sa ukázal")),r(ie.plan.emoji,t("plan"),o("pack.cal.planDesc","budúci termín, tenký obrys")),a.nat&&r("🌕",o("pack.cal.full","Spln"),o("pack.cal.fullDesc","regenerácia, hojenie")),a.nat&&r("🌑",o("pack.cal.new","Nov"),o("pack.cal.newDesc","detoxikácia, očista"))]})]}),e.jsxs("div",{className:"cal-lgroup",children:[e.jsx("div",{className:"cal-lgtitle",children:o("pack.cal.legendDensity","Sila zelenej = koľko toho bolo")}),e.jsxs("div",{className:"cal-lgrid",children:[i({background:oe("log",.42)},o("pack.cal.one","Jeden zápis")),i({background:oe("log",.66)},o("pack.cal.two","Dva")),i({background:oe("log",.92)},o("pack.cal.three","Tri a viac")),i({background:oe("vet",.72)},t("vet"),o("pack.cal.vetWins","modrá prebíja — je to druhá otázka roka"))]})]})]}),(a.prot||a.nat)&&e.jsxs("div",{className:"cal-lgroup",children:[e.jsx("div",{className:"cal-lgtitle",children:o("pack.cal.legendRail","Pás období")}),e.jsxs("div",{className:"cal-lgrid",children:[a.prot&&i({background:oe("give",.15),border:`1px solid ${oe("give",.45)}`},o("pack.cal.giveGroup","💊 🌿 Čo podáš"),o("pack.cal.giveDesc","odčervenie, kúry, doplnky")),a.prot&&i({background:oe("vet",.15),border:`1px solid ${oe("vet",.45)}`},o("pack.cal.labGroup","🔬 Čo zmeriaš"),o("pack.cal.labDesc","koprológia, biochémia")),a.nat&&i({background:oe("nat",.13),border:`1px solid ${oe("nat",.4)}`},`${he.emoji} ${o("pack.cal.ticks",he.nameSK)}`,o("pack.cal.ticksDesc","apríl – október"))]})]})]})}function An({year:a,day:n,dogs:o,solo:t,myElement:i,seniorSelected:r,layers:c,entries:m,moon:h,onClose:j,onAdd:u,monthName:E,seasonName:I,elementName:P,typeName:$,protName:D,tx:k}){const{m:b,d:p}=n,f=We(a,b,p),C=c.prot?cn(a,b,p,r):[],N=c.log?xa(o,b,p):[],x=c.log?ya(a,o,b,p,t):[],O=y=>{var M;return y===null?k("pack.cal.wholePack","celá svorka"):((M=o.find(R=>R.id===y))==null?void 0:M.name)??"—"};let S=`${I(f.key)} · ${P(f.key)}${f.key===i?` — ${k("pack.cal.hisSeason","jeho sezóna")}`:""}`;h&&(S+=` · ${h==="full"?`${k("pack.cal.full","Spln")} 🌕`:`${k("pack.cal.new","Nov")} 🌑`}`),c.nat&&to(b)&&(S+=` · ${k("pack.cal.ticks",he.nameSK)} ${he.emoji}`);const A=m.length===0&&C.length===0&&N.length===0&&x.length===0;return e.jsx("div",{className:"cal-popbg",onClick:y=>{y.target===y.currentTarget&&j()},children:e.jsxs("div",{className:"cal-pop",role:"dialog","aria-modal":"true",children:[e.jsxs("h4",{children:[p,". ",E(b).toLowerCase()," ",a]}),e.jsx("div",{className:"cal-when",children:S}),A&&e.jsx("p",{className:"cal-note",style:{marginBottom:12},children:k("pack.cal.emptyDay","Tento deň je zatiaľ prázdny. To nie je dlh — je to len deň.")}),N.map(y=>e.jsxs("div",{className:"cal-entry",children:[e.jsx("span",{className:"cal-ico",children:"🎂"}),e.jsxs("div",{children:[e.jsx("b",{children:k("pack.cal.birthday","Narodeniny")}),e.jsx("p",{children:y.years!==null?k("pack.cal.birthdayLine","{name} má {years}.").replace("{name}",y.name).replace("{years}",String(y.years)):y.name})]})]},`b-${y.id}`)),x.map(y=>e.jsxs("div",{className:"cal-entry",children:[e.jsx("span",{className:"cal-ico",children:"🎈"}),e.jsxs("div",{children:[e.jsx("b",{children:k("pack.cal.humanYear","Ľudský rok")}),e.jsxs("p",{children:[y.name," — ",k("pack.cal.humanYearLine","jeden zo siedmich. Naplánuj niečo.")]})]})]},`h-${y.id}`)),m.map((y,M)=>{const R=ie[y.kind].group,w=y.title||$(y.kind),v=R==="vet"?`rgb(${Ke.vet})`:R==="log"?`rgb(${Ke.log})`:d.inkWarm,F=e.jsxs(e.Fragment,{children:[e.jsx("b",{children:w}),y.text&&e.jsx("p",{children:y.text}),y.photo&&e.jsx("img",{className:"cal-shot",src:na(y.photo,480),alt:"",loading:"lazy"}),e.jsxs("p",{style:{color:v,marginTop:4,fontWeight:600},children:[$(y.kind)," · ",O(y.dogId)]})]});return e.jsxs("div",{className:"cal-entry",children:[e.jsx("span",{className:"cal-ico",style:{fontFamily:xe},children:ie[y.kind].emoji}),y.href?e.jsx("a",{href:y.href,style:{minWidth:0,textDecoration:"none",color:"inherit"},children:F}):e.jsx("div",{style:{minWidth:0},children:F})]},`e-${M}`)}),C.map((y,M)=>e.jsxs("div",{className:"cal-entry",style:{opacity:.85,borderStyle:"dashed"},children:[e.jsx("span",{className:"cal-ico",style:{fontFamily:xe},children:y.emoji}),e.jsxs("div",{children:[e.jsx("b",{children:D(y)}),e.jsxs("p",{children:[k("pack.cal.protWindow","Okno protokolu")," — ",va(y)," ",k("pack.cal.protHint","Odporúčanie, nie termín.")]})]})]},`p-${y.id}-${M}`)),u&&e.jsx("button",{type:"button",className:"cal-add",onClick:u,children:k("pack.cal.addToDay","Add to this day")}),e.jsx("p",{className:"cal-note",style:{marginTop:12,textAlign:"center"},children:k("pack.cal.closeHint","Klikni mimo bloku alebo Esc")})]})})}function Pn({row:a,dogs:n,entries:o,latest:t,tx:i,monthName:r,dow:c}){var wa,Sa,za,$a,Na,Da,Ea,Ta,Aa,Pa,Ca,Ma;const{lang:m}=ka(),h=qa(m),[j,u]=z.useState(null),[E,I]=z.useState(null),[P,$]=z.useState(!1),D=z.useRef(null),k=()=>{var g;return Math.max(160,(((g=D.current)==null?void 0:g.clientWidth)??480)-96)},b=a.selections??void 0,p=parseInt((b==null?void 0:b.birthdayYear)||"",10)||a.birth_year||0,f=parseInt((b==null?void 0:b.birthdayMonth)||"",10)||1,C=parseInt((b==null?void 0:b.birthdayDay)||"",10)||1,N=p>=1990?new Date(p,f-1,C):null,x=a.life_status==="deceased"&&!!a.death_date,O=z.useMemo(()=>x?new Date(a.death_date):new Date,[x,a.death_date]),S=(Sa=(wa=t[a.id])==null?void 0:wa["basics.since"])==null?void 0:Sa.value,A=Fe(typeof S=="string"?S:null),y=Fe(a.created_at),M=($a=(za=t[a.id])==null?void 0:za["health.weightKg"])==null?void 0:$a.value,R=typeof M=="number"?M:parseFloat(String(M??""))||null,w=(b==null?void 0:b.breed)||a.breed||null,v=z.useMemo(()=>xn(w,b==null?void 0:b.mixBreed1,b==null?void 0:b.mixBreed2,R),[w,b==null?void 0:b.mixBreed1,b==null?void 0:b.mixBreed2,R]),F=z.useMemo(()=>{const g=new Map;if(!N)return g;for(const B of o){const fe=Qe(N,new Date(B.y,B.m-1,B.d));if(fe<0||fe>=hn)continue;const ze=g.get(fe);ze?ze.push(B):g.set(fe,[B])}return g},[o,N]);if(!N)return e.jsx("p",{className:"cal-note",style:{marginTop:4},children:i("pack.cal.life.noBirth","Životná os potrebuje dátum narodenia. Doplň ho psovi v DOG ID a mriežka sa vykreslí od prvého týždňa.")});const W=Math.max(0,Qe(N,O)),ke=W/Me,re=Math.max(0,Math.floor((O.getTime()-N.getTime())/864e5)),ee=v.band,ne=A?Qe(N,new Date(A.y,A.m-1,A.d)):null,se=y?Qe(N,new Date(y.y,y.m-1,y.d)):null,pe=A?Math.max(0,Math.floor((O.getTime()-new Date(A.y,A.m-1,A.d).getTime())/864e5)):null,be=ke>=8,ue=x?qe:lo,ye=x?[]:gn.filter(g=>g.when==="always"||be),Ne=j?F.get(j.wi)??[]:[],ge={low:Math.floor(ee.low),high:Math.floor(ee.high)},we=yn((Da=(Na=t[a.id])==null?void 0:Na[so])==null?void 0:Da.value),Ve=((Ea=we.life)==null?void 0:Ea.low)??ge.low,l=((Ta=we.life)==null?void 0:Ta.high)??ge.high,T={low:l+1,high:Math.min(l+un,ue-1)},U=x?-1:((Aa=we.target)==null?void 0:Aa.low)??T.low,Y=Math.min(((Pa=we.target)==null?void 0:Pa.high)??T.high,ue-1),Z=0,X=ne!==null&&ne>0?Math.min(Math.floor((ne-1)/Me),ue-1):-1,J=Math.max(Ve,X+1),L=U>=0?Math.max(U,X+1):-1,ve=v.basis==="default"?i("pack.cal.life.srcNone","Priemerný vek dožitia: plemeno ani hmotnosť zatiaľ nepoznáme, takže odhad stojí na strednej triede. Doplň plemeno v DOG ID."):`${i("pack.cal.life.srcPre","Priemerný vek dožitia:")} ${Ee(ee.low)}–${Ee(ee.high)} ${i("pack.cal.life.years","rokov")} · ${v.labelSK}`+(ee.fromBreed?` · ${i("pack.cal.life.srcBreed","publikovaný údaj plemena")}`:v.size?` · ${i("pack.cal.life.srcWeight","odhad podľa hmotnosti")} (${i(`pack.cal.life.size.${v.size}`,La[v.size])}, ${i(`pack.cal.life.kg.${v.size}`,ee.kgSK)})`:""),Se=v.basis==="default"?ve:v.labelSK+(ee.fromBreed?` · ${i("pack.cal.life.srcBreed","publikovaný údaj plemena")}`:v.size?` · ${i("pack.cal.life.srcWeight","odhad podľa hmotnosti")} (${i(`pack.cal.life.size.${v.size}`,La[v.size])}, ${i(`pack.cal.life.kg.${v.size}`,ee.kgSK)})`:""),de=`${ve}
${i("pack.cal.life.bandNote","Je to priemer tisícok psov, nie predpoveď o tomto jednom.")}
${ee.fromBreed?i("pack.cal.life.srcRefBreed","Zdroj: publikované rozpätie plemenného klubu (AKC / The Kennel Club)."):i("pack.cal.life.srcRefWeight","Zdroj: veterinárne prehľady dožitia podľa hmotnosti (UK VetCompass / RVC life tables).")}`,Pe=`${i("pack.cal.life.tgtPre","Cieľ:")} ${Ee(l+1)}–${Ee(Y)} ${i("pack.cal.life.years","rokov")} · `+i("pack.cal.life.tgtBody","až päť rokov navyše, ktoré vie pridať holistická starostlivosť — štíhlosť, pohyb v teréne, chrup, spánok a čo najmenej zbytočnej chémie."),po=`${Pe}
${i("pack.cal.life.tgtSrc","Hrubý odhad, nie sľub. Zmerané je z toho zatiaľ jedno: samotná štíhlosť pridala labradorom 1,8 roka (Purina Life Span Study, JAVMA 2002).")}`,ia=(Ma=(Ca=t[a.id])==null?void 0:Ca["basics.origin"])==null?void 0:Ma.value,ja=typeof ia=="string"&&ia!=="other"?`pack.dogCard.opt.${ia}`:null,ta=ja?i(ja,""):"",Ue=`${i("pack.cal.set.pre","Pred vami")} (${ta?ta.charAt(0).toLocaleLowerCase(h)+ta.slice(1):i("pack.cal.set.preAll","chovateľ, útulok, ulica")})`,mo=A?`${Ue}: ${Te(N,h)} – ${Te(new Date(A.y,A.m-1,A.d),h)}`:"",Ye=j===null?-1:Math.floor(j.wi/Me),ho=Ye>=J&&Ye<=l,uo=L>=0&&Ye>=L&&Ye<=Y,go=j!==null&&ne!==null&&j.wi<ne,ra=g=>{const B=ga(N,g),fe=new Date(B.getTime()+6*864e5);return`${B.toLocaleDateString(h,{day:"numeric",month:"numeric"})} – ${Te(fe,h)}`};return e.jsxs("div",{className:"cal-life",children:[e.jsx("p",{className:"cal-intro",children:i("pack.cal.life.intro","Nižšie vidíš celý život svojho psa v blokoch. Jeden blok = jeden týždeň, riadok = jeden rok. Na jednej strane je to desivé, na druhej presne tá pripomienka, že si treba užiť každý okamih a neodkladať veci na potom.")}),e.jsxs("div",{className:"cal-lifetop",children:[e.jsxs("div",{className:"cal-lifehead",children:[e.jsxs("div",{className:"cal-lifestat",title:`${i("pack.cal.life.fromBirth","Počíta sa od narodenia")}: ${Te(N,h)}`,children:[e.jsx("b",{children:Ee(re)}),e.jsx("span",{children:i(x?"pack.cal.life.daysLived":"pack.cal.life.days","dní najlepšieho života")}),e.jsx("u",{children:Ga(i,Ra(N,O))})]}),pe!==null&&A&&e.jsxs("div",{className:"cal-lifestat",title:`${i("pack.cal.life.fromSince","Počíta sa od")}: ${Te(new Date(A.y,A.m-1,A.d),h)}`,children:[e.jsx(Ae,{className:"cal-statedit",to:`/pack/dogs/quiz/basics?dog=${a.id}&field=basics.since`,"aria-label":i("pack.pass.edit","edit"),children:"✎"}),e.jsx("b",{children:Ee(pe)}),e.jsx("span",{children:i("pack.cal.life.together","dní spolu")}),e.jsx("u",{children:Te(new Date(A.y,A.m-1,A.d),h)})]})]}),e.jsxs("div",{className:"cal-lgcol",children:[e.jsx(Mn,{tx:i,pre:X>=0?Ue:null}),!x&&e.jsx("button",{type:"button",className:"cal-bandsbtn",onClick:()=>$(!0),children:i("pack.cal.set.open","Nastaviť rámiky")})]})]}),P&&e.jsx(vn,{dogId:a.id,dogName:a.dog_name??"",birthLabel:Te(N,h),since:A?`${A.y}-${String(A.m).padStart(2,"0")}-${String(A.d).padStart(2,"0")}`:"",ourLife:ge,ourTarget:T,ourLifeBasis:Se,preName:Ue,saved:we,onClose:()=>$(!1),tx:i}),x&&e.jsx("p",{className:"cal-bestlife",children:i("pack.cal.life.bestLife","Žil najlepší život.")}),e.jsxs("div",{className:"cal-lifewrap",children:[e.jsx("div",{className:"cal-lifegrid",onMouseLeave:()=>u(null),children:Array.from({length:ue},(g,B)=>{const fe=B>=qe,ze=B>=J&&B<=l,Je=L>=0&&B>=L&&B<=Y,Ce=X>=0&&B>=Z&&B<=X;return e.jsxs(z.Fragment,{children:[e.jsx("div",{className:`cal-lifeyr${fe?" faded":""}`+(ze?" inband":"")+(B===J?" bandtop":"")+(B===l?" bandbot":"")+(Je?" intgt":"")+(B===L?" tgttop":"")+(B===Y?" tgtbot":"")+(Ce?" inpre":"")+(Ce&&B===Z?" pretop":"")+(Ce&&B===X?" prebot":""),title:Je?po:ze?de:Ce?mo:void 0,children:B}),e.jsx("div",{className:`cal-liferow${fe?" faded":""}${ze?" inband":""}${B===qe?" zone":""}`,"data-zone":B===qe?i("pack.cal.life.zone","Few dogs in history got past here"):void 0,children:Array.from({length:Me},(ei,Ba)=>{const me=B*Me+Ba,Ze=me<W,Xe=F.get(me),fo=Ze?Xe?"dark":"lived":"empty",ko=Ze&&!Xe&&ne!==null&&me<ne?" pre":"",Ka=me<=W,bo=(Ka&&ne!==null&&me>=ne?" mSince":"")+(Ka&&se!==null&&me>=se?" mJoin":"");return e.jsx("span",{className:`cal-lifecell ${fo}${ko}${bo}${me===W?" now":""}`,onMouseEnter:Ie=>u({wi:me,x:Ie.clientX,y:Ie.clientY}),onMouseMove:Ie=>u({wi:me,x:Ie.clientX,y:Ie.clientY}),onClick:()=>{Xe&&Ze&&I(me)},role:Xe&&Ze?"button":void 0,tabIndex:-1,"aria-label":ra(me),children:me===W&&e.jsx("i",{className:"cal-nowdot","aria-hidden":!0})},Ba)})})]},B)})}),e.jsx("div",{className:"cal-lifeend","aria-hidden":!0})]}),!x&&e.jsxs("div",{className:"cal-records cal-sec",children:[e.jsx("h4",{className:"cal-sectitle",children:i("pack.cal.life.recTitle","Dlhovekosť psov nie je náhoda")}),e.jsx("p",{className:"cal-secsub",children:i("pack.cal.life.recSub","Nižšie nájdeš zopár rekordmanov, ktorí sa dožili takmer 30 rokov. Dlhý a šťastný život stojí hlavne na tvojich každodenných rozhodnutiach.")}),e.jsxs("div",{className:"cal-recwrap",children:[e.jsx("button",{type:"button",className:"cal-recarrow left","aria-label":i("pack.cal.life.recPrev","Predchádzajúci"),onClick:()=>{var g;return(g=D.current)==null?void 0:g.scrollBy({left:-k(),behavior:"smooth"})},children:"‹"}),e.jsx("button",{type:"button",className:"cal-recarrow right","aria-label":i("pack.cal.life.recNext","Ďalší"),onClick:()=>{var g;return(g=D.current)==null?void 0:g.scrollBy({left:k(),behavior:"smooth"})},children:"›"}),e.jsx("div",{className:"cal-recgrid",ref:D,children:pa.map(g=>{const B=g.name.toLowerCase(),fe=i(`pack.cal.life.rec.${B}.breed`,g.breedSK),ze=i(`pack.cal.life.rec.${B}.country`,g.countrySK),Je=g.exactSK?i(`pack.cal.life.rec.${B}.exact`,g.exactSK):"",Ce=g.died!=null?`${g.born} – ${g.died}`:i("pack.cal.life.recSince","od {year}").replace("{year}",String(g.born));return e.jsxs("div",{className:`cal-rec${g.verified?"":" unver"}`,children:[e.jsxs("div",{className:"cal-rechead",children:[e.jsx("span",{className:`cal-recphoto${g.patron&&!g.photo?" pat":""}`,"aria-hidden":!0,children:g.photo?e.jsx("img",{src:na(g.photo,200),alt:"",loading:"lazy"}):g.patron?e.jsx("img",{src:`/patrons/${g.patron}.svg`,alt:""}):g.name.slice(0,1)}),e.jsxs("span",{className:"cal-recname",children:[e.jsx("b",{children:g.name}),e.jsx("u",{children:Je||`${Ee(g.years)} ${i("pack.cal.life.years","rokov")}`})]})]}),e.jsxs("i",{children:[fe," · ",ze," · ",Ce]}),!g.verified&&e.jsx("em",{children:i("pack.cal.life.unverified","neoverené — stojí na tvrdení majiteľa")})]},g.name)})})]}),pa.some(g=>g.photo&&g.photoCredit)&&e.jsx("p",{className:"cal-reccredit",children:pa.filter(g=>g.photo&&g.photoCredit).map(g=>i(`pack.cal.life.rec.${g.name.toLowerCase()}.photoCredit`,g.photoCredit)).join(" · ")})]}),ye.length>0&&e.jsxs("div",{className:"cal-records cal-sec",children:[e.jsx("h4",{className:"cal-sectitle",children:i("pack.cal.life.tipsTitle","Čo s tým vieš urobiť")}),e.jsx("p",{className:"cal-secsub",children:i("pack.cal.life.tipsSub","Šesť vecí, ktoré rozhodujú viac než plemeno. Nič z toho nestojí peniaze, všetko stojí pozornosť.")}),e.jsx("div",{className:"cal-tipgrid",children:ye.map(g=>e.jsxs("details",{className:"cal-tip",children:[e.jsxs("summary",{children:[e.jsx("em",{children:g.emoji}),e.jsx("b",{children:i(`pack.cal.life.tip.${g.id}.title`,g.titleSK)}),e.jsx("i",{"aria-hidden":!0,children:"▾"})]}),e.jsx("p",{children:i(`pack.cal.life.tip.${g.id}.body`,g.bodySK)})]},g.id))}),e.jsxs("div",{className:"cal-longev",children:[e.jsx("span",{className:"cal-longev-face","aria-hidden":!0,children:e.jsx("img",{src:No,alt:""})}),e.jsxs("div",{className:"cal-longev-txt",children:[e.jsx("b",{children:i("pack.cal.life.protoTitle","Longevity protokol")}),e.jsxs("p",{children:[i("pack.cal.life.protoBody","Celý postup, na ktorom týchto pár rád stojí — výživa, záťaž, pokoj a čo si nechať zmerať. Bude žiť v databáze, ktorú stráži "),e.jsxs("span",{className:"cal-ai",children:[e.jsx("span",{children:"AI"}),"NUBIS"]}),"."]})]}),e.jsx("span",{className:"cal-soon",children:i("pack.cal.life.protoSoon","Čoskoro")})]})]}),j&&e.jsxs("div",{className:"cal-lifetip",style:{left:j.x+14,top:j.y+14},children:[e.jsx("b",{children:Ga(i,Ra(N,ga(N,j.wi)))}),e.jsx("span",{children:ra(j.wi)}),Ne.map((g,B)=>e.jsxs("span",{children:[ie[g.kind].emoji," ",g.title||i(ie[g.kind].i18n,ie[g.kind].nameSK)]},B)),ho&&e.jsxs("span",{className:"wrap dim",children:[ve,v.basis!=="default"&&` · ${ee.fromBreed?i("pack.cal.life.srcRefShort","zdroj: plemenný klub (AKC / The Kennel Club)"):i("pack.cal.life.srcRefShortW","zdroj: UK VetCompass / RVC life tables")}`]}),uo&&e.jsx("span",{className:"wrap tgt",children:Pe}),go&&e.jsxs("span",{className:"wrap pre",children:[Ue," · ",i("pack.cal.life.preTip","v tomto čase ste ešte neboli spolu")]})]}),E!==null&&e.jsx(Cn,{birth:N,wi:E,entries:F.get(E)??[],onClose:()=>I(null),monthName:r,tx:i,label:ra(E),dow:c})]})}function Cn({birth:a,wi:n,entries:o,onClose:t,monthName:i,tx:r,label:c,dow:m}){const h=ga(a,n),j=new Date(h.getTime()+6*864e5),u=new Date(h.getTime()+3*864e5),E=u.getFullYear(),I=u.getMonth()+1,$=(new Date(E,I-1,1).getDay()+6)%7,D=je(E,I),k=p=>{const f=new Date(E,I-1,p).getTime();return f>=h.getTime()&&f<=j.getTime()},b=p=>o.filter(f=>f.y===E&&f.m===I&&f.d===p);return z.useEffect(()=>{const p=f=>{f.key==="Escape"&&t()};return window.addEventListener("keydown",p),()=>window.removeEventListener("keydown",p)},[t]),e.jsx("div",{className:"cal-popbg",onClick:t,role:"presentation",children:e.jsxs("div",{className:"cal-pop",onClick:p=>p.stopPropagation(),role:"dialog","aria-modal":"true",children:[e.jsxs("h4",{children:[i(I)," ",E]}),e.jsx("div",{className:"cal-when",children:c}),e.jsxs("div",{className:"cal-wkmini",children:[m.map((p,f)=>e.jsx("div",{className:"cal-dow",children:p},`${f}-${p}`)),Array.from({length:$},(p,f)=>e.jsx("div",{},`l${f}`)),Array.from({length:D},(p,f)=>{const C=f+1,N=b(C);return e.jsxs("div",{className:`cal-wkday${k(C)?" on":""}${N.length?" has":""}`,children:[e.jsx("u",{children:C}),N.length>0&&e.jsx("em",{children:ie[N[0].kind].emoji})]},C)})]}),o.length===0?e.jsx("p",{className:"cal-note",children:r("pack.cal.life.weekEmpty","V tomto týždni nemáš zapísané nič. Prežili ste ho, len o ňom nič nevieme.")}):o.map((p,f)=>e.jsxs("div",{className:"cal-entry",children:[e.jsx("span",{className:"cal-ico",children:ie[p.kind].emoji}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("b",{children:p.title||r(ie[p.kind].i18n,ie[p.kind].nameSK)}),e.jsxs("p",{children:[p.d,". ",p.m,". ",p.y,p.text?` · ${p.text}`:""]})]})]},f))]})})}function Mn({tx:a,pre:n}){const o=[...n?[{cls:"presw",b:n,t:a("pack.cal.life.lgPreSub","ešte ste neboli spolu")}]:[],{cls:"dark",b:a("pack.cal.life.lgDark","Aktivita"),t:a("pack.cal.life.lgDarkSub","výlet, váženie, zápis")},{cls:"sincesw",b:a("pack.cal.life.lgSince","Spoločný život"),t:a("pack.cal.life.lgSinceSub","z DOG ID")},{cls:"nowsw",b:a("pack.cal.life.lgNow","Tento týždeň"),t:a("pack.cal.life.lgNowSub","práve tu ste")},{cls:"joinsw",b:a("pack.cal.life.lgJoin","V Dogypte"),t:a("pack.cal.life.lgJoinSub","od dňa heroglyfu")}];return e.jsxs("div",{className:"cal-lgroup",children:[e.jsx("div",{className:"cal-lgtitle",children:a("pack.cal.life.legend","Ako čítať mriežku")}),e.jsx("div",{className:"cal-lgrid",children:o.map(t=>e.jsxs("div",{className:"cal-lg",children:[e.jsx("span",{className:`cal-sw cal-lifecell ${t.cls}`}),e.jsxs("div",{children:[e.jsx("b",{children:t.b}),e.jsx("span",{children:t.t})]})]},t.cls))})]})}const Bn=`
/* Pohľad vľavo, vrstvy na opačnom konci riadku — sú tichšie, je to nastavenie
   viditeľnosti, nie hlavná voľba. */
/* Nadpis vľavo, prepínač pohľadu v PRAVOM HORNOM ROHU bloku (13. 9. 2026).
   Na telefóne sa zalomí pod nadpis a roztiahne na celú šírku — tri slová
   stlačené do rohu 360 px displeja sa nedajú trafiť palcom. */
.cal-head{display:flex;align-items:center;justify-content:space-between;gap:8px 16px;flex-wrap:wrap;margin-bottom:16px}
.cal-ctl{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-bottom:12px}
.cal-layers{display:flex;gap:8px;flex-wrap:wrap}
.cal-lay{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;
  font-family:${K};font-size:10px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase;
  cursor:pointer;border:1px solid ${d.border};background:${d.tileBg};color:${d.inkWarm};user-select:none}
/* Vypnutá vrstva je TICHÁ PILULKA, nie preškrtnutá: preškrtnutie hovorí „chyba",
   pritom vypnutá vrstva je legitímny stav, ktorý si človek práve vybral. */
.cal-lay.on{${la(G.edge,Le.lapis)}}
.cal-lay .cal-dot{width:8px;height:8px;border-radius:2px;background:currentColor;opacity:.75;flex:0 0 auto}
.cal-dogsel{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
/* Meno psa je na OFICIÁLNYCH povrchoch Cinzel Decorative (DOG ID, certifikát,
   WALL), ale filter kalendára oficiálny povrch NIE JE — brand lock zúžený
   2026-08-14: mapa, zoznamy a bežná prevádzka smú mať meno v obyčajnom Cinzeli. */
.cal-dogpill{font-family:${_};font-size:12px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;
  padding:8px 12px;border-radius:999px;border:1px solid ${d.border};background:${d.tileBg};color:${d.inkWarm};cursor:pointer}
.cal-dogpill.on{${la(G.edge,Le.lapis)}}
.cal-note{font-family:${K};font-size:10px;line-height:1.55;color:${d.inkFaint};margin:0}

/* ── ROK: menovka mesiaca · 31 dní · pás období ─────────────────────────── */
.cal-yr{display:grid;grid-template-columns:76px 1fr 200px;column-gap:8px;row-gap:4px}
.cal-yr-hdnum{display:flex;gap:3px;min-width:0;align-items:flex-end}
.cal-yr-hdnum span{flex:1 1 0;min-width:0;text-align:center;font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${d.inkFaint};visibility:hidden}
.cal-yr-hdnum span.is-tick{visibility:visible;overflow:visible;white-space:nowrap}
.cal-yr-hdrail{font-family:${_};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${d.inkFaint};align-self:end;padding-bottom:2px}
.cal-mlbl{display:flex;flex-direction:column;justify-content:center;border-radius:8px;padding:4px 8px;min-width:0}
.cal-mlbl b{font-family:${_};font-size:10px;letter-spacing:0.02em;text-transform:uppercase;line-height:1.15}
.cal-mlbl i{font-style:normal;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;opacity:.9;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cal-mlbl.mine{box-shadow:inset 0 0 0 1.5px currentColor}
.cal-yr-cells{display:flex;gap:3px;min-width:0;align-items:center}
.cal-cell{flex:1 1 0;min-width:0;aspect-ratio:1/1;border-radius:2px;position:relative;cursor:pointer}
.cal-cell.void{background:transparent!important;cursor:default;pointer-events:none}
.cal-cell.ringBirth{box-shadow:inset 0 0 0 1.8px ${d.accentGold}}
.cal-cell.ringHuman{box-shadow:inset 0 0 0 1.2px rgba(201,154,63,.6)}
.cal-cell.isPlan{box-shadow:inset 0 0 0 1.2px rgba(42,22,8,.34)}
/* Mesiac je ROH bunky, nie celá bunka — inak prekryje značku zápisu a deň so
   splnom vyzerá ako deň bez zápisu. */
.cal-cell .moonF,.cal-cell .moonN{position:absolute;top:-1px;right:-1px;width:40%;height:40%;border-radius:50%;
  border:1px solid rgba(107,90,52,.75);box-shadow:0 0 0 1px rgba(247,237,214,.85)}
.cal-cell .moonF{background:${d.card}}
.cal-cell .moonN{background:rgba(36,26,9,.62)}
.cal-cell.today{outline:2px solid ${G.edge};outline-offset:1px}
.cal-rail{grid-column:3;grid-row:2/14;display:grid;grid-template-columns:1fr 1fr 20px;grid-template-rows:repeat(12,1fr);gap:3px;align-self:stretch}
.cal-bar{border-radius:8px;padding:4px;display:flex;align-items:center;gap:4px;font-family:${K};font-size:10px;font-weight:600;line-height:1.15;overflow:hidden;min-width:0}
.cal-bar span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.cal-bar em{font-style:normal;font-size:10px;flex:0 0 auto}
.cal-barnat{grid-column:3;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px}

/* ── MESIAC ─────────────────────────────────────────────────────────────── */
.cal-monav{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:12px}
.cal-monav button{border:1.5px solid ${d.border};background:${d.tileBg};border-radius:8px;width:34px;height:30px;font-size:14px;color:${d.inkWarm};cursor:pointer}
.cal-moname{font-family:${_};font-size:16px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${d.inkStrong}}
.cal-band{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.cal-chip{display:inline-flex;align-items:center;gap:8px;padding:4px 12px;border-radius:999px;font-family:${K};
  font-size:10px;font-weight:600;border:1px solid ${d.border};background:${d.tileBg};color:${d.inkWarm}}
.cal-chip small{font-size:10px;opacity:.75;font-weight:500}
.cal-mogrid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal-dow{text-align:center;font-family:${_};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${d.inkFaint};padding-bottom:4px}
/* Bunka mesiaca je NEUTRÁLNA. Sezóna aj okná protokolu sú v pilulkách nad
   mriežkou, takže ich netreba opakovať 31-krát pod sebou — a zápis konečne vidno. */
.cal-mocell{${De(q.row)};min-height:74px;position:relative;padding:4px;
  display:flex;flex-direction:column;cursor:pointer;overflow:hidden}
.cal-mocell.out{opacity:.25;cursor:default;pointer-events:none}
.cal-mocell.today{border:1.5px solid ${G.edge};box-shadow:0 0 0 2px rgba(22,48,122,.14)}
.cal-monum{font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${d.inkWarm};line-height:1}
.cal-momk{margin-top:auto;display:flex;gap:4px;flex-wrap:wrap;font-size:16px;line-height:1}
.cal-momk u{font-style:normal;text-decoration:none;font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${d.inkWarm};align-self:center}
.cal-momoon{position:absolute;top:4px;right:4px;width:9px;height:9px;border-radius:50%;border:1.4px solid #6b5a34}

/* ── POPUP DŇA ──────────────────────────────────────────────────────────── */
.cal-popbg{position:fixed;inset:0;background:rgba(20,12,4,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:60}
.cal-pop{${De(q.panel)};padding:16px;max-width:420px;width:100%;
  max-height:86vh;overflow:auto}
.cal-pop h4{font-family:${_};font-size:14px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 4px;color:${d.inkStrong}}
.cal-when{font-family:${K};font-size:12px;color:${d.inkWarm};margin-bottom:12px}
.cal-entry{${De(q.row)};display:flex;gap:8px;align-items:flex-start;padding:8px 12px;margin-bottom:8px}
.cal-ico{font-size:16px;line-height:1.1;flex:0 0 auto}
/* Fotka zápisu — matrica FOTKA (.pk-photo): obdĺžnik, radius PACK_R.tile, zlatý vlas.
   Nie je to medailón (ten patrí identite), preto štvorec nie je. */
.cal-shot{display:block;width:100%;max-height:180px;object-fit:cover;margin:8px 0 0;
  border-radius:${Q.tile}px;border:1px solid ${d.border};background:${d.tileBg}}
.cal-entry b{font-family:${_};font-size:12px;font-weight:700;letter-spacing:0.02em;display:block;margin-bottom:2px;color:${d.inkStrong}}
.cal-entry p{font-family:${K};font-size:12px;color:${d.inkWarm};margin:0;line-height:1.5;white-space:pre-line}
/* PRIDAŤ K TOMUTO DŇU — HLAVNÉ CTA popupu, teda LAPIS (brandový kánon 28. 8. 2026:
   na bledom podklade lapis). Geometria je z locku .btn-gold: radius 8, NIE pilulka;
   mení sa len výplň. Je to jediná plná farebná plocha v popupe, takže vedie. */
.cal-add{display:block;width:100%;margin-top:12px;padding:12px 16px;border-radius:8px;
  background:${G.grad};border:1px solid ${Be.edge};color:${G.ink};
  box-shadow:${He};cursor:pointer;
  font-family:${_};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase}
.cal-add:hover{background:${G.gradHover}}

/* ── LEGENDA ────────────────────────────────────────────────────────────── */
.cal-lgroup{margin-top:16px}
/* Názov SEKCIE vnútri karty = PACK_HEAD.section (Space Grotesk 500 / 10 / .22em) —
   do 13. 9. tu bol Cinzel 9,5 px, teda siedmy tvar nadpisu v appke. */
.cal-lgtitle{${wn(Qa.section)};color:${d.accentGold};margin-bottom:8px}
.cal-lgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(152px,1fr));gap:8px}
.cal-lg{display:flex;gap:8px;align-items:center}
.cal-lg .cal-sw{width:17px;height:17px;border-radius:2px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:12px}
.cal-lg b{font-family:${_};font-size:12px;font-weight:700;display:block;line-height:1.2;color:${d.inkStrong}}
.cal-lg span{font-family:${K};font-size:10px;color:${d.inkFaint};display:block}

/* Pás období sa pod 860 px NEZMRŠŤUJE, ale ODCHÁDZA: jeho mená potrebujú šírku
   a v pohľade MESIAC sú tie isté okná ako pilulky nad mriežkou, kde je na ne miesto. */
@media(max-width:860px){
  .cal-yr{grid-template-columns:62px 1fr}
  .cal-rail{display:none}
  .cal-yr-hdrail{display:none}
}
@media(max-width:700px){
  .cal-mocell{min-height:0;aspect-ratio:1/1}
  .cal-momk{font-size:12px}
  .cal-mogrid{gap:4px}
  /* Prepínač pohľadu na celú šírku — tri rovnaké diely, palcom trafiteľné. */
  .cal-viewsw{width:100%}
  .cal-viewsw .pf-toggle__opt{flex:1 1 0;padding-left:0;padding-right:0}
}
/* ── ŽIVOT: 30 rokov × 52 týždňov ───────────────────────────────────────── */
.cal-life{margin-top:2px}
/* Úvodná veta — Matejov text pod nadpisom bloku. Šírka je obmedzená: riadok
   cez celých 1100 px sa nečíta, oko stratí návrat na začiatok. */
.cal-intro{font-family:${K};font-size:12px;line-height:1.6;color:${d.inkWarm};
  max-width:62ch;margin:0 0 16px}
/* ĽAVÁ POLOVICA = ČÍSLA POD SEBOU, PRAVÁ = LEGENDA (13. 9. 2026).
   Pravý stĺpec je širší: legenda má štyri položky s dvoma riadkami textu,
   dlaždice majú jedno číslo. Pri rovnakých dieloch sa legenda lámala na štyri
   riadky, kým vedľa nej stál poloprázdny stĺpec. */
.cal-lifetop{display:grid;grid-template-columns:minmax(0,0.85fr) minmax(0,1.15fr);
  gap:12px 16px;align-items:start;margin-bottom:12px}
.cal-lifehead{display:flex;flex-direction:column;gap:8px;margin-bottom:0}
.cal-lifestat{${De(q.row)};min-width:0;padding:8px 12px}
.cal-lifestat b{display:block;font-family:${_};font-size:20px;font-weight:700;line-height:1.05;color:${d.inkStrong}}
.cal-lifestat b i{font-style:normal;font-size:12px;opacity:.6;margin-right:4px}
.cal-lifestat{position:relative}
.cal-lifestat span{display:block;font-family:${K};font-size:10px;letter-spacing:0.14em;
  text-transform:uppercase;color:${d.inkFaint};margin-top:4px}
/* Prevod veľkého čísla na ľudský vek — tichý riadok pod popiskom, nie druhé
   číslo: dlaždica má jednu hlavnú hodnotu a toto je jej preklad. */
.cal-lifestat u{display:block;font-family:${K};font-size:10px;text-decoration:none;
  color:${d.inkWarm};margin-top:4px;line-height:1.35}
/* ✎ vedie do DOG ID, needituje tu — preto je tichá a malá. */
.cal-statedit{position:absolute;top:6px;right:8px;font-size:12px;line-height:1;color:${d.cardEdge};
  text-decoration:none;padding:4px;border-radius:8px}
.cal-statedit:hover{color:${d.inkStrong};background:rgba(201,154,63,.16)}
.cal-lifesrc{margin-bottom:12px}
/* Legenda stojí v pravom stĺpci, takže sa skladá na DVA stĺpce po dvoch —
   pôvodné auto-fit ju v polovičnej šírke natiahlo na štyri riadky. */
.cal-lifetop .cal-lgroup{margin-top:0}
.cal-lifetop .cal-lgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
/* Veta o psovi, ktorý odišiel. Cinzel a pokoj — nie štatistika, nie tučné. */
.cal-bestlife{font-family:${_};font-size:16px;font-weight:700;letter-spacing:0.14em;
  text-transform:uppercase;color:${d.accentGold};text-align:center;margin:2px 0 16px}

/* Mriežka nesmie tlačiť stránku do vodorovného rolovania — 52 buniek sa vojde
   do šírky vždy, lebo bunka je zlomok riadku, nie pevné číslo. */
/* ⚠️ Mriežka má po stranách 10 px vzduchu ZÁMERNE: hrany pásma dožitia z nej
   o pol bunky trčia (.cal-medline), a bez rezervy by ich overflow:hidden
   vpravo odrezal a vľavo by naliezli na číslo roka. */
.cal-lifewrap{overflow:hidden;padding:0 12px;margin:0 -12px}
.cal-lifegrid{display:grid;grid-template-columns:22px 1fr;row-gap:2px;column-gap:12px;align-items:center}
.cal-lifeyr{font-family:ui-monospace,Menlo,monospace;font-size:10px;color:${d.inkFaint};text-align:right;line-height:1}
.cal-liferow{display:flex;gap:2px;min-width:0;padding-bottom:1px}
/* Vyblednutá zóna 20–30 — história, nie predpoveď. */
.cal-lifeyr.faded{opacity:.4}
.cal-liferow.faded{opacity:.42}
/* ── PÁSMO DOŽITIA = RÁMIK OKOLO ČÍSEL ROKOV (13. 9. 2026) ────────────────
   🔴 Z MRIEŽKY VON (Matej: „tú hranicu/pásmo dožitia daj preč a dávajme ho za
   okraj blokov = daj do rámika čísla, ktorých sa pásmo týka"). Dve zlaté hrany
   ležali priamo na prežitých týždňoch — predpoveď prekreslená cez život psa.
   Rámik stojí v ľavom stĺpci, teda MIMO mriežky, a hovorí to isté.
   Skladá sa z troch tried, aby to bol JEDEN box cez viac riadkov, nie štyri
   samostatné rámčeky: bočnice má každý riadok pásma, hornú hranu prvý,
   spodnú posledný.
   ⚠️ ČÍSLO MUSÍ VYPLNIŤ CELÝ RIADOK (align-self:stretch), inak je vysoké
   len ako písmo (8 px) a rámik sa medzi rokmi rozpadne na štyri visiace
   zátvorky.
   🔴 RÁMIK KRESLÍ ::before, NIE SAMOTNÉ ČÍSLO (Matej 13. 9.: „nepáči sa mi,
   že z ľavej strany je vyššie než z pravej"). Prvá verzia zošívala 2 px
   medzeru medzi riadkami záporným marginom, lenže ten prvok naozaj POSUNIE —
   orámované číslo sedelo o 1 px vyššie než jeho riadok buniek, teda ľavá
   strana bola oproti pravej posunutá hore. Odmerané: číslo 11 malo top
   1672,23 px, jeho riadok 1673,23 px. Pseudo-prvok sa smie roztiahnuť cez
   medzeru (top:-1px; bottom:-1px) bez toho, aby s číslom pohol. */
.cal-liferow{position:relative}
.cal-lifeyr.inband{color:${d.accentGold};opacity:1;position:relative;
  align-self:stretch;display:flex;align-items:center;justify-content:flex-end}
/* ⚠️ BEZ z-index:-1 A BEZ VÝPLNE. Prvá verzia mala jemný zlatý tint a pseudo-prvok
   poslala pod obsah — a tam zmizol úplne: najbližší stacking context nie je
   papyrusová karta, takže sa vrstva schovala za jej pozadie a ostalo len zlaté
   písmo bez rámika. Samotné čiary smú stáť NAD číslom, lebo ležia na okrajoch. */
.cal-lifeyr.inband::before{content:'';position:absolute;left:-3px;right:-2px;top:-1px;bottom:-1px;
  pointer-events:none;
  box-shadow:inset 1px 0 0 ${d.accentGold},inset -1px 0 0 ${d.accentGold}}
.cal-lifeyr.inband.bandtop::before{top:0;border-radius:2px 2px 0 0;
  box-shadow:inset 1px 0 0 ${d.accentGold},inset -1px 0 0 ${d.accentGold},inset 0 1px 0 ${d.accentGold}}
.cal-lifeyr.inband.bandbot::before{bottom:0;border-radius:0 0 2px 2px;
  box-shadow:inset 1px 0 0 ${d.accentGold},inset -1px 0 0 ${d.accentGold},inset 0 -1px 0 ${d.accentGold}}
.cal-lifeyr.inband.bandtop.bandbot::before{box-shadow:inset 0 0 0 1px ${d.accentGold};border-radius:2px}
/* ── 🎯 CIEĽOVÉ PÁSMO = ZELENÝ RÁMIK HNEĎ POD ZLATÝM (13. 9. 2026) ────────
   Matej: „pridaj 5 rokov rámik… ten bude zelený a bude hovoriť: pridaj až
   extra 5 rokov super starostlivosťou (target – longevity)".
   Zlatý rámik hovorí, čo je PRIEMER; zelený, čo je CIEĽ. Zelená je tá istá,
   akou appka inde značí „splnené" a „tip od svorky" (T.growGreen), takže
   nesie rovnaký význam: toto sa dá dosiahnuť.
   ⚠️ Recept je zhodný so zlatým rámikom vrátane ::before — pozri poznámku
   vyššie o zápornom margine a o z-index:-1. Kto sem pridá tretie pásmo,
   kopíruje TENTO tvar, nie vlastné čísla. */
.cal-lifeyr.intgt{color:${d.growGreen};opacity:1;position:relative;
  align-self:stretch;display:flex;align-items:center;justify-content:flex-end}
.cal-lifeyr.intgt::before{content:'';position:absolute;left:-3px;right:-2px;top:-1px;bottom:-1px;
  pointer-events:none;
  box-shadow:inset 1px 0 0 ${d.growGreen},inset -1px 0 0 ${d.growGreen}}
.cal-lifeyr.intgt.tgttop::before{top:0;border-radius:2px 2px 0 0;
  box-shadow:inset 1px 0 0 ${d.growGreen},inset -1px 0 0 ${d.growGreen},inset 0 1px 0 ${d.growGreen}}
.cal-lifeyr.intgt.tgtbot::before{bottom:0;border-radius:0 0 2px 2px;
  box-shadow:inset 1px 0 0 ${d.growGreen},inset -1px 0 0 ${d.growGreen},inset 0 -1px 0 ${d.growGreen}}
/* ── 🟥 PRED VAMI = ČERVENÝ RÁMIK (8. 10. 2026) — roky od narodenia po prevzatie.
   Recept ZHODNÝ so zlatým a zeleným (::before, bez výplne, bez z-index:-1). */
.cal-lifeyr.inpre{color:${le};opacity:1;position:relative;
  align-self:stretch;display:flex;align-items:center;justify-content:flex-end}
.cal-lifeyr.inpre::before{content:'';position:absolute;left:-3px;right:-2px;top:-1px;bottom:-1px;
  pointer-events:none;
  box-shadow:inset 1px 0 0 ${le},inset -1px 0 0 ${le}}
.cal-lifeyr.inpre.pretop::before{top:0;border-radius:2px 2px 0 0;
  box-shadow:inset 1px 0 0 ${le},inset -1px 0 0 ${le},inset 0 1px 0 ${le}}
.cal-lifeyr.inpre.prebot::before{bottom:0;border-radius:0 0 2px 2px;
  box-shadow:inset 1px 0 0 ${le},inset -1px 0 0 ${le},inset 0 -1px 0 ${le}}
.cal-lifeyr.inpre.pretop.prebot::before{box-shadow:inset 0 0 0 1px ${le};border-radius:2px}
.cal-lgcol{display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.cal-bandsbtn{border-radius:999px;padding:4px 12px;cursor:pointer;font-family:${K};font-size:10px;
  font-weight:600;letter-spacing:0.14em;text-transform:uppercase;${la(G.edge,Le.lapis)}}
/* Vyblednutá zóna 20+ nesmie zhasnúť cieľ: pri dlhovekom plemene doň zasahuje. */
.cal-lifeyr.intgt.faded,.cal-lifeyr.inband.faded{opacity:.75}
/* Hranica dvadsiatky je PREDEL, nie ďalší riadok mriežky: nad ňou je pes,
   pod ňou je história. Bez nej sa vyblednutá zóna pri prázdnych bunkách
   nedala odlíšiť od zvyšku prázdneho miesta. */
.cal-liferow.zone{position:relative;margin-top:24px}
.cal-liferow.zone::before{content:attr(data-zone);position:absolute;left:0;right:0;top:-20px;
  font-family:${K};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;
  color:${d.accentGold};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.95}
/* 28. 9. 2026: veta sa na mobile orezávala („…PSOV V …") — preto kratšie znenie
   v i18n a na úzkom riadku tesnejšie písmenká (.02em patrí husté popisky). */
@media (max-width:480px){ .cal-liferow.zone::before{ letter-spacing:0.02em; } }
.cal-liferow.zone::after{content:'';position:absolute;left:0;right:0;top:-7px;height:1px;
  background:linear-gradient(90deg,rgba(201,154,63,.55),rgba(201,154,63,0))}
/* KONIEC TABUĽKY (Matej 13. 9. 2026: „pod 30 riadkom treba urobiť vizuálnu
   čiaru, koniec tabuľky"). Bez nej sa posledný riadok prázdnych buniek stratil
   v papyruse a mriežka nikde nekončila — jednoducho prestala byť. Čiara ide
   cez celú šírku riadku, teda vrátane stĺpca s číslami. */
.cal-lifeend{height:1px;margin:8px 0 0;
  background:linear-gradient(90deg,rgba(201,154,63,.12),rgba(201,154,63,.55) 10%,rgba(201,154,63,.55) 90%,rgba(201,154,63,.12))}
.cal-lifecell{flex:1 1 0;min-width:0;aspect-ratio:1/1;border-radius:2px;background:transparent;
  box-shadow:inset 0 0 0 .5px rgba(122,90,42,.22);cursor:default;position:relative}
/* Prežitý čas = bledá modrá. Je to ten istý lapis, akým appka hovorí „moje" —
   len stiahnutý na tapetu, lebo ubehnutý čas nie je akcia. */
.cal-lifecell.lived{background:rgba(46,95,208,.30);box-shadow:none}
/* 🟧 Týždeň PRED VAMI (8. 10. 2026) — prežitý, ale ešte nie spolu. */
.cal-lifecell.lived.pre{background:${_a}}
/* Tmavá = boli ste spolu vonku. Plná, neškálovaná — jeden zápis stačí. */
.cal-lifecell.dark{background:#14243F;box-shadow:none;cursor:pointer}
.cal-lifecell.dark:hover{background:${G.edge};transform:scale(1.55);border-radius:2px;position:relative;z-index:2}
/* vzorka v LEGENDE nie je týždeň — nesmie sa tváriť klikateľne (audit 27. 9. 2026: ruka + zväčšenie bez akcie) */
.cal-sw.cal-lifecell,.cal-sw.cal-lifecell.dark{cursor:default}
.cal-sw.cal-lifecell.dark:hover{background:#14243F;transform:none}
/* BUDÚCI TÝŽDEŇ = NAZNAČENÝ BLOK (Matej 13. 9. popoludní: „bloky tam vráť,
   klasika priesvitné, naznačené"). Nie je to biely štvorec ako predtým, ale
   ani prázdno: tichý obrys bez výplne. Vidno, že mriežka pokračuje, a pritom
   sa to nebije s prežitým časom, ktorý jediný má farbu. */
.cal-lifecell.empty{background:rgba(250,244,236,.34);box-shadow:inset 0 0 0 .5px rgba(122,90,42,.16)}
/* ── AKTUÁLNY TÝŽDEŇ = PULZUJÚCA ZELENÁ BODKA (13. 9. 2026) ────────────────
   Zlatý obrys bunky zanikol medzi hranami pásma aj podčiarknutiami udalostí —
   a hlavne stál na tom istom mieste ako výplň, takže na ňom nebolo čo chytiť
   okom. Bodka je VLASTNÝ prvok nad bunkou: jediná vec v mriežke, ktorá sa hýbe,
   preto oko padne presne na „tu sme teraz".
   ⚠️ Nesmie to byť ::before ani ::after — obe sú obsadené podčiarknutiami
   „odkedy sme spolu" a „odkedy je v Dogypte", a práve aktuálny týždeň ich má
   spravidla obe. */
.cal-lifecell.now{box-shadow:none}
.cal-nowdot{position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;
  border-radius:50%;background:${d.growGreen};z-index:6;pointer-events:none;
  box-shadow:0 0 0 1.5px rgba(250,244,236,.9);animation:calNowPulse 1.9s ease-in-out infinite}
@keyframes calNowPulse{
  0%,100%{transform:scale(1);box-shadow:0 0 0 1.5px rgba(250,244,236,.9),0 0 0 0 rgba(61,122,78,.55)}
  55%{transform:scale(1.25);box-shadow:0 0 0 1.5px rgba(250,244,236,.9),0 0 0 5px rgba(61,122,78,0)}
}
@media(prefers-reduced-motion:reduce){.cal-nowdot{animation:none}}
/* ── DVE UDALOSTI ŽIVOTA = DVE SÚVISLÉ ČIARY POD/NAD MRIEŽKOU ─────────────
   Sú to HRANY bunky, nie výplň — výplň už nesie „prežité" a „boli sme vonku",
   a tretí význam v tom istom mieste by prepísal jeden z nich.
   Zelená = odkedy ste spolu (spodná hrana) · LAPIS = odkedy je v Dogypte (horná).
   ⚠️ Obe naraz na jednej bunke sa nebijú — každá má svoju hranu.
   ⚠️ ČIARA BEŽÍ OD TEJ UDALOSTI ĎALEJ, nie len na jednej bunke (Matej 13. 9. 2026:
   „dolná zelená čiarka bude od týždňa, čo sú spolu, na každom bloku, nie len na
   jednom — a to isté aj Dogypt"). Jedna čiarka hovorila „v tomto týždni sa niečo
   stalo"; súvislá hovorí „odvtedy to platí", čo je presne to, čo obe udalosti
   znamenajú. Preto presah -1.5 px na oboch stranách: medzera medzi bunkami je
   2 px a bez preklenutia by z čiary bola bodkovaná čiara.
   ⚠️ Vstup do Dogyptu bol najprv ZLATÝ (zlato = príslušnosť) a bola to chyba:
   pásmo dožitia má zlaté hrany cez celú šírku, takže zlatý ťah na bunke sa
   čítal ako ich odrobinka. Lapis je navyše presnejší — vstup do svorky je
   ČIN člena, a lapis v brande znamená práve „čo urobím ja". */
/* ⚠️ ČIARA LEŽÍ VNÚTRI BUNKY (bottom/top:0), NIE V MEDZERE POD ŇOU. Kým to bola
   jedna čiarka na jednej bunke, sedela v 2 px medzere medzi riadkami a bolo to
   v poriadku. Len čo beží cez celý riadok a cez desať riadkov pod sebou, tá istá
   medzera je jediné, čo riadky oddeľuje — a mriežka sa zmenila na linajkový
   papier, v ktorom sa stratili tmavé týždne. Vnútri bunky je z toho podčiarknutie
   modrých buniek, teda vlastnosť času, nie mreža cez obrázok. */
.cal-lifecell.mSince{z-index:4}
.cal-lifecell.mSince::after{content:'';position:absolute;left:-1.5px;right:-1.5px;bottom:0;height:1.5px;
  background:${d.growGreen}}
.cal-lifecell.mJoin{z-index:4}
.cal-lifecell.mJoin::before{content:'';position:absolute;left:-1.5px;right:-1.5px;top:0;height:1.5px;
  background:${G.edge}}
/* ── SWATCH = HOLÁ ZNAČKA, BEZ BLOKU POD ŇOU (13. 9. 2026 popoludní) ──────
   Matej: „v legende bude zelený pásik bez bloku… zelenú guličku bez bloku".
   Modrý štvorček pod značkou hovoril „prežitý týždeň", teda tretiu vec, ktorú
   legenda nevysvetľuje — a pásik sa v ňom čítal ako jeho spodná hrana, nie
   ako samostatná značka. Bez neho je swatch presne to, čo v mriežke vidno. */
.cal-sw.cal-lifecell{aspect-ratio:auto;border-radius:0;flex:0 0 auto;
  background:transparent;box-shadow:none;display:flex;align-items:center;justify-content:center}
/* Aktivita je VÝPLŇ bunky, nie značka na nej — jej swatch má teda blok. */
.cal-sw.cal-lifecell.dark{width:17px;height:17px;border-radius:2px;background:#14243F}
.cal-sw.cal-lifecell.sincesw{height:3px;border-radius:2px;background:${d.growGreen}}
.cal-sw.cal-lifecell.presw{width:17px;height:17px;border-radius:2px;background:${_a};
  box-shadow:inset 0 0 0 1px ${le}}
.cal-sw.cal-lifecell.joinsw{height:3px;border-radius:2px;background:${G.edge}}
.cal-sw.cal-lifecell.nowsw{background:transparent}
.cal-sw.cal-lifecell.nowsw::after{content:'';width:7px;height:7px;border-radius:50%;background:${d.growGreen};
  box-shadow:0 0 0 1.5px rgba(250,244,236,.9);animation:calNowPulse 1.9s ease-in-out infinite}

.cal-lifetip{${De(q.panel)};position:fixed;z-index:70;pointer-events:none;max-width:250px;padding:8px 12px}
.cal-lifetip b{display:block;font-family:${_};font-size:10px;font-weight:700;letter-spacing:0.02em;
  text-transform:uppercase;color:${d.inkStrong};margin-bottom:4px}
.cal-lifetip span{display:block;font-family:${K};font-size:12px;color:${d.inkWarm};line-height:1.45;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Bublina pásma nesie vetu, nie zoznam položiek — orezanie tromi bodkami by
   z vysvetlenia spravilo hádanku. */
.cal-lifetip span.wrap{white-space:normal;overflow:visible;text-overflow:clip}
.cal-lifetip span.dim{color:${d.inkFaint};font-size:10px;margin-top:4px}
/* Cieľ je zelený aj v bubline — tá istá farba ako jeho rámik, inak si človek
   nespojí, ktorý z dvoch rámikov práve číta. */
.cal-lifetip span.pre{color:${le};font-size:10px;margin-top:4px}
.cal-lifetip span.tgt{color:${d.growGreen};font-size:10px;margin-top:4px}

/* ── REKORDY a RADY ─────────────────────────────────────────────────────── */
.cal-records{margin-top:16px}
/* ── SPODNÁ ČASŤ BLOKU = VLASTNÉ SEKCIE (13. 9. 2026) ─────────────────────
   Matej: „tú časť treba oddeliť vizuálne, zväčšiť nadpis… zväčšiť tie nadpisy,
   lebo sa strácajú". Nadpis sekcie mal 9,5 px a rovnaký tvar ako popisok
   legendy, takže sa čítal ako menovka, nie ako nová téma.
   Oddelenie nesie zlatá čiara + vzduch, nie rám: ďalší rámik vnútri papyrusovej
   karty by robil kartu v karte. */
.cal-sec{margin-top:24px;padding-top:24px;position:relative}
.cal-sec::before{content:'';position:absolute;left:0;right:0;top:0;height:1px;
  background:linear-gradient(90deg,rgba(201,154,63,.10),rgba(201,154,63,.5) 10%,rgba(201,154,63,.5) 90%,rgba(201,154,63,.10))}
/* Nadpis sekcie v Cinzeli = PACK_TEXT.h2 (20). Matej 13. 9. žiadal ZVÄČŠIŤ, takže
   tichý eyebrow (PACK_HEAD.section) tu nie je na mieste. */
.cal-sectitle{font-family:${_};font-size:20px;font-weight:700;letter-spacing:0.14em;
  text-transform:uppercase;color:${d.inkStrong};margin:0 0 8px;line-height:1.25}
.cal-secsub{font-family:${K};font-size:12px;line-height:1.6;color:${d.inkWarm};
  max-width:66ch;margin:0 0 12px}
/* ── REKORDMANI = JEDEN RIADOK NA SLAJD (13. 9. 2026) ─────────────────────
   Trinásť kariet v mriežke auto-fill zabralo na PC štyri rady a zo zóny
   rekordov spravilo hlavnú tému stránky. Vodorovný pás drží jednu výšku,
   prichytáva sa po kartách a samotným odrezaním poslednej karty hovorí
   „je toho viac". Karta má PEVNÚ šírku — flex-basis:auto by ju nafúkol
   podľa najdlhšieho názvu plemena. */
/* Obal pásu — drží šípky. Musí byť position:relative, inak sa pripnú na kartu. */
.cal-recwrap{position:relative}
.cal-recarrow{position:absolute;top:calc(50% - 4px);transform:translateY(-50%);z-index:3;
  width:28px;height:28px;border-radius:50%;display:grid;place-items:center;cursor:pointer;
  background:${d.card};border:1px solid ${d.cardEdge};color:${d.inkStrong};
  font-size:16px;line-height:1;padding:0 0 4px;
  box-shadow:${$e.lift}}
.cal-recarrow:hover{background:${d.card};border-color:${d.accentGold}}
.cal-recarrow.left{left:0}
.cal-recarrow.right{right:0}
/* Šípka NESMIE LEŽAŤ NA TEXTE karty. Pás preto dostane po stranách odsadenie
   presne na jej šírku — v skrolovacom kontajneri sa padding správa ako vzduch
   pred prvou a za poslednou kartou, takže sa nič neoreže a šípka má kam sadnúť.
   Odsadenie sa pridáva len tam, kde šípky sú: na dotykovom displeji by
   zbytočne ujedalo šírku. */
/* ⚠️ K PADDINGU PATRÍ scroll-padding, INAK SI HO SNAP HNEĎ ODROLUJE.
   scroll-snap-align:start zarovnáva kartu na začiatok SNAPPORTU, a ten je
   štandardne padding-box — prehliadač preto pás pri načítaní sám posunul
   o tých 34 px a karta skončila zase pod šípkou. Odmerané: padding sedel
   (34 px), a karta aj tak začínala na nule. */
@media(hover:hover){.cal-recgrid{padding-left:32px;padding-right:32px;
  scroll-padding-left:32px;scroll-padding-right:34px}}
/* Na dotykovom displeji je gesto prirodzené a šípky by len zakrývali karty. */
@media(hover:none){.cal-recarrow{display:none}}
.cal-recgrid{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;
  scroll-snap-type:x proximity;padding-bottom:8px;scrollbar-width:thin;
  scrollbar-color:rgba(201,154,63,.45) transparent;overscroll-behavior-x:contain}
.cal-recgrid::-webkit-scrollbar{height:6px}
.cal-recgrid::-webkit-scrollbar-thumb{background:rgba(201,154,63,.45);border-radius:2px}
.cal-recgrid::-webkit-scrollbar-track{background:transparent}
/* ── KARTA REKORDMANA JE BLEDÁ, NIE PIESKOVÁ (13. 9. 2026) ────────────────
   Matej: „tie bloky so psami daj bledou/bielou, trochu to treba oživiť,
   vyzerá to otrasne." Karty stáli na tokene tileBg, teda takmer na tom istom
   piesku ako papyrus pod nimi — trinásť obdĺžnikov bez hrany. Svetlejšia
   výplň ich zdvihne z podkladu, zlatý rám im dá tvar a tieň hĺbku.
   Nie je to nová farba: #FFFDF6 je papyrusová biela, ktorú appka už
   používa (.pf-field--flat je jej o odtieň tmavší súrodenec).

   ── A OD 15. 9. 2026 JE TO PODBLOK ────────────────────────────────────────
   Výplň bola jediná vec na tejto karte MIMO matrice — ručne miešaný gradient,
   kým rám, radius aj tieň už z matrice brala. Bol to jeden z troch otvorených
   bodov locku pack-dizajn-system.md a Matej ho 15. 9. zavrel: karta ide do
   PODBLOKU, teda PACK_BOX.subblock ako každá iná sekcia vnútri karty.

   Prejaví sa to tak, že karty o odtieň stmavnú do piesku (panelGrad končí na
   #F2E2BD, nie na papyrusovej bielej). Pôvodný dôvod bledej — „zdvihni ich
   z podkladu" — tým nepadá: drží ho zlatý RÁM a TIEŇ, ktoré karty predtým
   nemali vôbec. 13. 9. sa menili tri veci naraz a zásluha sa pripísala výplni.
   ⚠️ Keby sa to malo vracať, nevracaj ručný gradient — vypýtaj si MENO do
   PACK_BLOCKS. Blok bez mena je presne to, čo tento prevod odstraňuje. */
.cal-rec{background:${q.subblock.background};
  border:${q.subblock.border};border-radius:${q.subblock.borderRadius}px;padding:12px;
  flex:0 0 232px;scroll-snap-align:start;
  box-shadow:${q.subblock.boxShadow}}
.cal-rechead{display:flex;align-items:center;gap:8px;margin-bottom:4px}
/* Kruh drží rozmer aj bez fotky — s iniciálou vnútri. Prázdny slot, ktorý
   zmizne, by posunul text a karty by mali každá inú výšku. */
.cal-recphoto{flex:0 0 auto;width:38px;height:38px;border-radius:50%;overflow:hidden;
  display:grid;place-items:center;background:${d.panelGrad};border:1px solid ${d.cardEdge};
  font-family:${_};font-size:16px;font-weight:700;color:${d.accentGold};
  line-height:1;user-select:none}
.cal-recphoto img{width:100%;height:100%;object-fit:cover;display:block}
/* Silueta plemena nie je fotka — nesmie sa orezávať na kruh, musí sa doň
   zmestiť celá, a dýchať. Zlatý filter ju zladí s rámom (SVG sú čierne). */
.cal-recphoto.pat img{object-fit:contain;padding:4px;
  filter:brightness(0) saturate(100%) invert(62%) sepia(35%) saturate(680%) hue-rotate(1deg) brightness(93%) contrast(88%)}
.cal-recname{min-width:0;display:block}
.cal-rec b{font-family:${_};font-size:14px;font-weight:700;letter-spacing:0.02em;color:${d.inkStrong};
  display:block;line-height:1.2}
.cal-rec u{font-family:${K};font-size:12px;font-weight:600;text-decoration:none;color:${d.accentGold};
  display:block;margin-top:2px}
.cal-rec i{display:block;font-style:normal;font-family:${K};font-size:10px;letter-spacing:0.02em;
  text-transform:uppercase;color:${d.inkFaint};margin:4px 0}
.cal-rec em{display:block;font-style:normal;font-family:${K};font-size:10px;line-height:1.4;
  color:${d.alertRed};letter-spacing:.02em}
.cal-rec.unver{opacity:.82}
/* Pôvod fotiek — tichý riadok pod pásom. Je to licenčná podmienka, takže musí
   byť čitateľný, nie schovaný: 9,5 px a inkFaint, rovnako ako ostatné popisky. */
.cal-reccredit{font-family:${K};font-size:10px;line-height:1.5;color:${d.inkFaint};
  margin:2px 0 0;letter-spacing:.02em}
/* Rady sú ZAVRETÉ rozbaľovačky — jeden stĺpec, nie mriežka: v dvoch stĺpcoch
   by sa pri otvorení jednej posunula susedná a zoznam by poskakoval. */
.cal-tipgrid{display:flex;flex-direction:column;gap:8px}
.cal-tip{${De(q.row)}}
.cal-tip>summary{display:flex;align-items:center;gap:12px;padding:12px;cursor:pointer;
  list-style:none;user-select:none}
.cal-tip>summary::-webkit-details-marker{display:none}
.cal-tip em{font-style:normal;font-size:20px;line-height:1.1;flex:0 0 auto;font-family:${xe}}
.cal-tip b{flex:1 1 auto;min-width:0;font-family:${_};font-size:12px;font-weight:700;
  letter-spacing:0.02em;color:${d.inkStrong};line-height:1.3}
/* Šípka sa otočí — jediný signál, že blok je otvorený, keď je text dlhý
   a jeho koniec už nie je na obrazovke. */
.cal-tip>summary i{flex:0 0 auto;font-style:normal;font-size:12px;color:${d.cardEdge};
  transition:transform .18s ease}
.cal-tip[open]>summary i{transform:rotate(180deg)}
.cal-tip[open]>summary{padding-bottom:4px}
/* Ľavé odsadenie = padding 12 + emoji 20 + gap 12: text sedí pod nadpisom, nie pod ikonkou. */
.cal-tip p{font-family:${K};font-size:12px;line-height:1.6;color:${d.inkWarm};
  margin:0;padding:0 12px 12px 44px}

/* ── KAM RADY VEDÚ — AINUBISOV POVRCH, NIE PAPYRUS ────────────────────────
   Longevity protokol bude bývať v jeho databáze, takže hovorí ON. Papyrusová
   dlaždica by tvrdila, že je to ďalšia rada v poradí; tmavý displej hovorí,
   že je to iná vrstva appky. Nie je to odkaz, kým databáza neexistuje — preto
   žiadny hover ani kurzor ruky. */
.cal-longev{margin-top:12px;display:flex;align-items:center;justify-content:space-between;
  gap:12px 16px;flex-wrap:wrap;border-radius:${Q.card}px;padding:12px 16px;
  background:${ae.surface};border:1px solid ${ae.edge};
  box-shadow:${$e.panel}}
/* Hlava má PEVNÝ kruh a nesmie sa zmršťovať (flex:0 0 auto), inak ju text
   pri úzkom okne stlačí na ovál. */
.cal-longev-face{flex:0 0 auto;width:46px;height:46px;border-radius:50%;
  background:${ae.faceBg};box-shadow:${ae.faceRing};
  display:flex;align-items:center;justify-content:center;overflow:hidden}
/* Rozmer drží VÝŠKA — hlava je vyššia než širšia, tak ako v medailóne navu. */
.cal-longev-face img{height:82%;width:auto;display:block}
.cal-longev-txt{min-width:0;flex:1 1 230px}
.cal-longev-txt b{display:block;font-family:${_};font-size:14px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;color:${ae.ink};line-height:1.2}
.cal-longev-txt p{font-family:${K};font-size:12px;line-height:1.55;
  color:${ae.inkDim};margin:4px 0 0}
/* Meno má tvar: AI je cyan a svieti (lock 12. 9. 2026). */
.cal-ai{font-family:${_};font-weight:700;letter-spacing:0.02em;color:${ae.ink};white-space:nowrap}
.cal-ai > span{color:${ae.aiInk};text-shadow:${ae.aiShadow}}
.cal-soon{flex:0 0 auto;font-family:${K};font-size:10px;font-weight:600;letter-spacing:0.22em;
  text-transform:uppercase;padding:8px 16px;border-radius:999px;
  border:1px solid ${ae.edge};background:${ae.raised};color:${ae.inkFaint}}

/* ── MINI MESIAC v popupe týždňa ────────────────────────────────────────── */
.cal-wkmini{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:16px}
.cal-wkday{${De(q.row)};aspect-ratio:1/1;
  display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}
.cal-wkday u{font-family:ui-monospace,Menlo,monospace;font-size:10px;text-decoration:none;color:${d.inkFaint};line-height:1}
.cal-wkday em{font-style:normal;font-size:12px;line-height:1;font-family:${xe}}
/* Zvýraznený je TÝŽDEŇ, na ktorý sa kliklo — preto plný lapis tint, nie rám:
   rám by sa bil s rámom dnešného dňa v mriežke mesiaca vedľa. */
.cal-wkday.on{background:rgba(46,95,208,.16);border-color:${G.edge}}
.cal-wkday.has u{color:${d.inkStrong};font-weight:700}

@media(max-width:700px){
  .cal-lifegrid{column-gap:8px;grid-template-columns:16px 1fr}
  .cal-liferow{gap:1px}
  .cal-lifecell{border-radius:1px}
  /* Bunka má na telefóne ~5 px — kliknúť sa na ňu nedá a hover tam neexistuje.
     Mriežka je tam OBRAZ, nie nástroj; detail týždňa je na PC. */
  .cal-lifecell.dark{cursor:default}
  .cal-nowdot{width:4px;height:4px;margin:-2px 0 0 -2px;box-shadow:0 0 0 1px rgba(250,244,236,.9)}
  .cal-lifestat b{font-size:16px}
  /* Karta rekordu sa na telefóne zúži, aby bolo vidieť kúsok tej ďalšej —
     to je jediný signál, že sa pás dá posunúť. */
  .cal-rec{flex:0 0 78%}
  /* Dva stĺpce (čísla | legenda) sú rozdelenie pre PLOCHU. Na 390 px z toho
     vzniknú dva úzke pruhy: popisok dlaždice sa láme na tri riadky a legenda
     na štyri — teda vyššie a horšie čitateľné než pod sebou. */
  .cal-lifetop{grid-template-columns:1fr;gap:12px}
  .cal-lifehead{flex-direction:row;flex-wrap:wrap}
  .cal-lifehead .cal-lifestat{flex:1 1 140px}
  .cal-sectitle{font-size:16px;letter-spacing:0.02em}
  .cal-sec{padding-top:16px}
}

`,Kn=`
.dor-bar{ display:flex; justify-content:flex-end; margin-bottom:-${s.xs}px; }
.dor-pill{ display:inline-flex; align-items:center; justify-content:center; padding:${s.xs}px ${s.md}px;
  border-radius:${Q.pill}px; border:1px solid; cursor:pointer; white-space:nowrap;
  font-family:${_}; font-weight:700; font-size:${H.label}px; letter-spacing:0.14em; text-transform:uppercase;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%); border-color:${G.edge}; color:${Le.lapis};
  transition:transform .12s ease; }
.dor-pill:hover{ transform:translateY(-1px); }
.dor-card{ padding:${s.lg}px; width:100%; max-width:640px; margin:0 auto; }
.dor-list{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:${s.sm}px; }
.dor-row{ display:flex; align-items:center; gap:${s.md}px; padding:${s.sm}px ${s.md}px;
  position:relative; user-select:none; -webkit-user-select:none; }
.dor-photo{ width:48px; height:48px; border-radius:${Q.pill}px; object-fit:cover; flex:none;
  border:2px solid ${V.cardEdge}; background:${V.tileBg}; }
.dor-name{ flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  font-family:${_}; font-weight:700; font-size:${H.body}px; letter-spacing:0.02em; color:${V.ink}; }
.dor-num{ flex:none; font-family:${_}; font-weight:700; font-size:${H.label}px; letter-spacing:0.02em;
  padding:${s.xs}px ${s.sm}px; border-radius:${Q.pill}px; background:${G.grad}; color:${G.ink}; }
.dor-grip{ flex:none; width:${s.xl}px; height:${s.xl+s.md}px; display:grid; place-items:center;
  cursor:grab; touch-action:none; border-radius:${Q.field}px; }
.dor-grip:active{ cursor:grabbing; }
.dor-grip i{ display:grid; grid-template-columns:repeat(2,4px); gap:4px; }
.dor-grip i b{ width:4px; height:4px; border-radius:${Q.pill}px; background:${G.edge}; }
.dor-err{ margin:${s.md}px 0 0; text-align:center; font-family:${K}; font-size:${H.label}px; color:${Le.red}; }
.dor-done{ display:flex; width:100%; align-items:center; justify-content:center; margin-top:${s.lg}px;
  padding:${s.md}px ${s.xl}px; border-radius:${Q.field}px; border:1px solid ${Be.edge}; cursor:pointer;
  font-family:${_}; font-weight:700; font-size:${H.label}px; letter-spacing:0.14em; text-transform:uppercase;
  background:${G.grad}; color:${G.ink}; box-shadow:${He}; transition:transform .2s; }
.dor-done:hover{ transform:scale(1.03); background:${G.gradHover}; }
.dor-done:disabled{ opacity:.6; cursor:default; transform:none; }
`;function In({onClick:a,tx:n}){return e.jsx("div",{className:"dor-bar",children:e.jsx("button",{type:"button",className:"dor-pill",onClick:a,children:n("pack.dogs.order","Order")})})}function On({dog:a}){const n=an();return e.jsxs(on,{value:a,dragListener:!1,dragControls:n,className:"dor-row",style:{...q.row},whileDrag:{scale:1.02,boxShadow:$e.panel,zIndex:2},children:[a.cloudinary_main_url?e.jsx("img",{className:"dor-photo",src:na(a.cloudinary_main_url,96),alt:"",draggable:!1}):e.jsx("span",{className:"dor-photo"}),e.jsx("span",{className:"dor-name",children:a.dog_name??"—"}),a.pack_number?e.jsxs("span",{className:"dor-num",children:["#",a.pack_number]}):null,e.jsx("span",{className:"dor-grip",role:"button","aria-label":a.dog_name??"",onPointerDown:o=>{o.preventDefault(),n.start(o)},children:e.jsx("i",{children:Array.from({length:6},(o,t)=>e.jsx("b",{},t))})})]})}function Rn({dogs:a,tx:n,onDone:o}){const[t,i]=z.useState(a),[r,c]=z.useState(!1),[m,h]=z.useState(!1),j=async()=>{if(t.every((u,E)=>{var I;return u.id===((I=a[E])==null?void 0:I.id)})){o(t);return}c(!0),h(!1);try{await Qo(t.map(u=>u.id)),o(t)}catch{h(!0)}finally{c(!1)}};return e.jsxs("div",{className:"dor-card",style:{...q.card},children:[e.jsx(en,{axis:"y",values:t,onReorder:i,className:"dor-list",children:t.map(u=>e.jsx(On,{dog:u},u.id))}),m&&e.jsx("p",{className:"dor-err",children:n("pack.dogs.orderErr","Could not save the order. Try again.")}),e.jsx("button",{type:"button",className:"dor-done",onClick:j,disabled:r,children:n("pack.dogs.orderDone","Done")})]})}const te=V,Ln="'Cinzel Decorative', 'Cinzel', serif",Va=1.1,Ua=.62,Fn=.9,_n=.95,Gn=.3,Wn=96,Hn=132,Vn=230,co=13100/3500,ea={background:G.grad,color:G.ink,letterSpacing:"0.02em",boxShadow:He},Ya=`
.hub-hover{ transition: transform .2s ease, box-shadow .2s ease; }
.hub-hover:hover{ transform: translateY(-2px); }
.hub-gold{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:12px 24px;
  background:${Be.grad};
  border:1px solid ${Be.edge};
  border-radius:8px;
  color:#000;
  font-family:'Cinzel',serif; font-size:12px; font-weight:800;
  letter-spacing:0.14em; text-transform:uppercase;
  cursor:pointer; white-space:nowrap; text-decoration:none;
  box-shadow:0 0 28px rgba(230,158,26,0.34), inset 0 1px 0 rgba(255,255,255,0.3);
  transition: transform .2s, box-shadow .22s;
}
.hub-gold:hover{ transform:scale(1.04); box-shadow:0 0 44px rgba(230,158,26,0.5), inset 0 1px 0 rgba(255,255,255,0.3); }
.hub-gold:active{ transform:scale(0.98); }

/* ── psí blok ───────────────────────────────────────────────────────────────── */
/* TRI STĹPCE (Matej 12.8., 3. kolo — papyrus):
     1 fotka s poradovým číslom NA KRUHU
     2 meno + heroglyf a POD nimi rad pilulek
     3 lišta: pilulka s percentom · dogposter · popisok DOG ID
   Pilulky sú v STREDNOM stĺpci, teda začínajú pod menom a nie pod fotkou — blok tým
   stratil celý riadok (Matej: „ušetríme priestor"). Predtým mali vlastný pravý stĺpec
   (.dogblk-side) a pod fotkou ostávala mŕtva plocha.
   ZANIKLO 12.8.: progresbar (.dogblk-prog), zlaté CTA (.dogblk-open), stĺpec pilulek
   (.dogblk-side) aj spodný riadok (.dogblk-foot). Nehľadaj ich, nie sú parkované. */
.dogblk{ display:flex; align-items:center; gap:16px; }
/* Ľavý stĺpec je LEN fotka. position:relative tu je kvôli pilulke s číslom, ktorá
   sadá na spodný okraj kruhu a vnútri neho by sa orezala. */
.dogblk-left{ position:relative; flex:0 0 auto; line-height:0; }
.dogblk-main{ flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:12px; }

/* Meno a glyf zdieľajú jeden obal — konkrétne rozmery dopočíta useFitName tak, aby
   pravý okraj glyfu sedel na hrane lišty s posterom. */
.dogblk-idw{
  width:100%;
  display:flex; flex-direction:column; gap:4px;
  /* Hranice veľkosti mena. Sú TU, nie v JS, aby breakpoint zostal jediný a v CSS;
     useFitName si ich prečíta cez getComputedStyle. */
  --fit-min:24px; --fit-max:200px;
  container-type:inline-size;   /* len kvôli cqw fallbacku v .dogblk-name */
}
/* Veľkosť písma nastavuje useFitName PRESNÝM meraním po vykreslení. Hodnota nižšie je
   len štartovacia, aby meno pred prvým meraním neblikalo — odhad --len × 0.86 je
   zámerne podstrelený, teda skôr malé písmo než pretečené.
   ⚠️ Prečo meranie: odhad podľa počtu znakov nemôže sedieť naprieč písmami. V ostrej
   databáze sú 奥莉 (Aoli) (Cinzel Decorative ich NEMÁ a padá na systémový font) aj
   BABY (МАЛЮК) — tam je šírka znaku úplne iná než v latinke. */
.dogblk-name{
  font-size:clamp(24px, calc(100cqw / (var(--len,7) * 0.86)), 100px);
  line-height:1.02;
  /* Poistka: keby meranie zlyhalo, meno sa radšej zlomí, než pôjde cez lištu. */
  overflow-wrap:anywhere;
}
/* Kruh = ten istý recept ako HeroCard na homepage (Matej 12.8.: „aplikujem tú istú
   logiku ako je to pri homepage"). Prstenec progresu, ktorý tu žil jedno kolo, zanikol
   — progres sa presunul do pilulky v lište. */
.dogblk-photo{
  width:132px; height:132px; border-radius:50%; object-fit:cover; display:block;
  border:2px solid ${te.cardEdge};
  box-shadow:0 0 0 1px ${te.border}, 0 8px 24px rgba(201,154,63,0.24);
}
/* Poradové číslo NA KRUHU — recept 1:1 z HeroCard.tsx (~riadky 598–624): locknutá
   pilulka dní, navyše svetlý hairline, lebo leží na fotke a bez neho splynie s tmavým
   psom. Z radu pilulek preto #N VYPADLO, aby tam nebolo dvakrát. */
.dogblk-num{
  position:absolute; bottom:-4px; left:50%; transform:translateX(-50%);
  display:inline-flex; align-items:center; justify-content:center;
  font-family:'Cinzel',serif; font-weight:700; font-size:14px; letter-spacing:0.02em;
  line-height:1; white-space:nowrap; padding:4px 8px; border-radius:999px;
  /* LAPIS od 28. 9. 2026 (Matej: „daj lapis") — ten istý odznak ako #1 na homepage (HeroCard). */
  background:${G.grad}; color:${G.ink};
  border:1px solid rgba(239,215,154,0.55);
  box-shadow:${$e.lift};
}
/* ⚠️ 721px, NIE 900px. Hranica musí byť tá istá, akú používa useFitName — kým tu bolo
   900 a v mobilnej vetve 720, ostalo medzi nimi pásmo 721–899 bez pravidiel a meno sa
   lámalo na „HEKTHO/R" (Matej 8.8.: „pri shrinku sa to správa divne"). */
@media (min-width:721px){
  /* PC: fotka · meno · glyf VEDĽA SEBA. Na mobile ostáva meno NAD glyfom — preto je to
     media query, nie zmena základu. Konkrétne rozmery dopočíta useFitName. */
  .dogblk-idw{ flex-direction:row; align-items:center; }
  .dogblk-idw > .dogblk-name{ flex:0 0 auto; white-space:nowrap; }
  .dogblk-idw > .dogblk-glyph{ flex:0 0 auto; width:auto; }
  /* ⚠️ TIETO DVE HODNOTY MUSIA BYŤ ZHODNÉ (Matej 8.8.: „meno … aby z každej strany malo
     dostatočný a totožný rozostup od fotky aj heroglyfu"). Prvá je medzera fotka↔meno,
     druhá meno↔glyf — sú to dva RÔZNE flex kontajnery, takže sa nedajú zapísať raz.
     Obe si useFitName číta zo štýlu, čiže nikde inde v kóde zapísané nie sú. */
  .dogblk{ gap:24px; }
  .dogblk-idw{ gap:24px; }
}
/* PAPYRUS (lock 2026-07-26, zdroj pravdy Entry.tsx): odsadenie je TU, nie v inline
   štýle — inak by ho media query nižšie nemala ako prebiť. */
.dogblk-card{ padding:24px; }

/* Rad pilulek pod menom. Rovnaké diely sa tu ZÁMERNE nepoužívajú — pilulky sú rôzne
   dlhé údaje, nie tlačidlá, a naťahovanie na rovnakú šírku by z „SVK" spravilo prázdny
   pruh. Šírku určuje obsah, zalamujú sa. */
.dogblk-pills{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
/* Rozmery pilulky žijú TU, nie v inline štýle komponentu — inline by triedu prebil
   a mobilné zmenšenie by ticho nezabralo. */
.dogblk-pill{ padding:4px 12px; font-size:10px; letter-spacing:0.14em; }
/* Dni majú vlastnú veľkosť — sú to hlavné číslo bloku, nie tag. Hodnota z PackTree,
   aby bol ten istý údaj rovnako veľký aj rovnako farebný. */
.dogblk-days{ padding:4px 12px; font-size:12px; }

/* ── lišta na pravom kraji ──────────────────────────────────────────────────── */
/* Nesie progres, poster a slovo DOG ID. Jej šírku určuje POSTER a pilulka s pevným
   min-width — teda nič, čo by záviselo od fotky alebo mena. Práve preto sa z nej dá
   v useFitName počítať dostupná šírka bez rizika kruhu. */
.dogblk-rail{
  position:relative;
  flex:0 0 auto; align-self:stretch;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  padding-left:16px;
  --poster-h:78px;
}
/* Deliaca čiara = papyrusový lock (2026-07-26): zlatá, 2px, VYBLEDNUTÁ DO STRÁN — nie
   šedý ani priehľadný 1px hairline. T.rule je vodorovná (90deg), toto je jej zvislá
   dvojička (Matej 12.8.: „zvýrazni viac vertikálu … teraz ju skoro nevidno, urob ju
   takú aby bola na krajoch tenšia").
   ⚠️ Je to ::before, NIE border — border má rovnakú sýtosť po celej dĺžke a nedá sa
   vyblednúť. Zároveň nezaberá miesto v layoute, takže sa nemení šírka lišty, z ktorej
   useFitName počíta dostupnú šírku riadka. */
.dogblk-rail::before{
  content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
  background:linear-gradient(180deg, transparent 0%, ${te.cardEdge} 28%, ${te.cardEdge} 72%, transparent 100%);
  border-radius:2px; pointer-events:none;
}
.dogblk-poster{ opacity:.88; transition:transform .2s ease, opacity .2s ease; }
.hub-hover:hover .dogblk-poster{ transform:translateX(3px); opacity:1; }
.dogblk-railcap{
  font-family:${_}; font-weight:800; font-size:10px; letter-spacing:0.22em;
  text-transform:uppercase; color:${te.inkStrong}; white-space:nowrap;
}
/* Progres = pilulka NAD posterom (Matej 12.8.). Percento je ÚDAJ, takže Space Grotesk
   600 (strop načítanej váhy), nie Cinzel.
   ⚠️ MODRÁ ODIŠLA 12. 9. 2026 (Matej: „% vyplnenie nejak inak v inej farbe, napr.
   červená"). Dôvod je konkrétny: v ten istý deň prešli DNI na lapis, takže modré
   percento stálo pár pixelov od modrej pilulky a blok mal dve modré, ktoré spolu
   nesúvisia. Zostali DVA STAVY a nesú presne brandový význam:
     < 100 %   červená  ${te.alertRed}  = chýba
     100 %     zelená   ${te.growGreen}  = splnené
   Zanikol tým samostatný stav 0 % — bol to tretí odtieň pre to isté („nie je hotovo")
   a koľko presne chýba, hovorí číslo v pilulke, nie farba.
   ⚠️ min-width je nutnosť, nie kozmetika: bez neho je „24%" o polovicu užšie než
   „COMPLETE" a poster by sa v zozname psov pri každom bloku posunul inam. */
.dogblk-fill{
  min-width:78px; text-align:center;
  padding:4px 8px; border-radius:999px; white-space:nowrap;
  background:${te.alertRed}; color:#FDECE7;
  font-family:${K}; font-weight:600;
  font-size:10px; letter-spacing:0.02em; text-transform:uppercase;
  box-shadow:${$e.lift};
}
.dogblk-fill.is-done{ background:${te.growGreen}; color:#EAF7ED; box-shadow:${$e.lift}; }

/* Heroglyf: zdrojový PNG má ČIERNE ťahy. Na tmavom podklade sa musel prefarbovať na
   zlato — na PAPYRUSE sa filter ZRUŠIL a glyf ostáva čierny (Matej 12.8.: „čierny
   heroglyf aj meno"). Šírku aj výšku určuje useFitName. */
.dogblk-glyph{
  width:100%; height:auto; object-fit:contain; display:block;
  pointer-events:none;
}
/* Prázdna kartuša, keď pes glyf ešte nemá. Pomer strán drží tvar v OBOCH vetvách naraz:
   na PC mu useFitName nastaví výšku (šírku dopočíta prehliadač), na mobile je široký na celý
   obal a výšku si dopočíta sám. Vizuál je zámerne tichý — je to chýbajúci doklad, nie prvok,
   ktorý má súťažiť s menom. Rám aj radius podľa brandu (kartuša 8px, zlatý rám polí). */
.dogblk-glyph--empty{
  aspect-ratio:${co};
  border:1px dashed ${vo.border};
  border-radius:8px;
  background:rgba(201,154,63,0.06);
  box-sizing:border-box;
}

/* Mobil = tie isté tri stĺpce, len zmenšené. Meno ide NAD glyf (vlastná vetva rovnice
   v useFitName).
   ⚠️ POSTER SA NEZMENŠUJE — --poster-h ostáva 78 px ako na PC (Matej 12.8.). Zmenšuje sa
   meno a heroglyf; šírku, ktorú tým uvoľnia, dostane lišta a poster sa v nej vycentruje. */
@media (max-width:720px){
  .dogblk-card{ padding:16px 12px; }
  /* KRAJE DRŽIA FOTKA A LIŠTA (Matej 12.8., 4. kolo). space-between, NIE center:
     nad stropmi MOBILE_PHOTO_MAX a MOBILE_MAX_IDW ostane voľné miesto a musí ísť do
     dvoch MEDZIER medzi stĺpcami, nie do okrajov. S center stála pri 680 px fotka
     152 px od ľavej hrany karty a lišta 128 px od pravej — blok vyzeral vycentrovaný.
     flex:0 1 auto na strednom stĺpci musí ostať: s flex:1 by sa celý zvyšok nalepil
     doň a vznikla by jedna diera medzi glyfom a deliacou čiarou. */
  .dogblk{ gap:16px; justify-content:space-between; }
  .dogblk-main{ gap:8px; flex:0 1 auto; }
  /* Štartovacia hodnota = MOBILE_PHOTO_MIN. Konkrétny rozmer dopočíta useFitName
     (rastie s dostupnou šírkou po MOBILE_PHOTO_MAX); toto je len to, čo platí, kým sa
     nenačíta glyf a rovnica nemá pomer strán. */
  .dogblk-photo{ width:96px; height:96px; }
  .dogblk-num{ font-size:12px; padding:4px 8px; bottom:-3px; }
  .dogblk-idw{ --fit-min:14px; --fit-max:60px; }
  .dogblk-name{ font-size:clamp(14px, calc(100cqw / (var(--len,7) * 0.86)), 36px); }
  /* O chlp menšie než predtým: stredný stĺpec sa zúžil kvôli väčšej lište a rad
     „3 736 DNÍ + SK" sa doň pri pôvodných rozmeroch nezmestil na jeden riadok. */
  .dogblk-pill{ padding:4px 8px; font-size:10px; letter-spacing:0.02em; }
  .dogblk-days{ padding:4px 8px; font-size:10px; }
  .dogblk-rail{ padding-left:12px; gap:4px; }
  .dogblk-railcap{ font-size:10px; letter-spacing:0.14em; }
  .dogblk-fill{ min-width:58px; font-size:10px; padding:4px 8px; letter-spacing:0.02em; }
}
/* Úzke telefóny (iPhone SE 375, staršie 360): ustupuje odsadenie karty a medzery,
   meno a glyf nie. */
@media (max-width:430px){
  .dogblk-card{ padding:12px; }
  .dogblk{ gap:8px; }
  .dogblk-rail{ padding-left:8px; }
}

/* ── DOG ID — karta modulov (8. 10. 2026, 3. kolo: kompaktný pás) ──────── */
.dic{ position:relative; overflow:hidden; display:grid; grid-template-columns:200px minmax(0,1fr); }
.dic-art{ position:relative; }
.dic-art img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:0 18%;
  -webkit-mask-image:linear-gradient(90deg,#000 55%,transparent 100%); mask-image:linear-gradient(90deg,#000 55%,transparent 100%); }
.dic-body{ position:relative; display:flex; flex-direction:column; gap:${s.lg}px; padding:${s.xl}px ${s.xl}px ${s.xl}px ${s.sm}px; min-width:0; }
.dic-head{ display:flex; align-items:center; justify-content:space-between; gap:${s.lg}px; }
.dic-eyebrow{ display:block; font-family:${K}; font-weight:500; font-size:${H.micro}px; letter-spacing:0.26em; text-transform:uppercase; color:${V.inkWarm}; margin-bottom:${s.xs}px; }
/* Nadpis TMAVÝ (Matej 8. 10.: „nie je výrazný, daj ho tmavou nie zlatou"). */
.dic-h{ margin:0; font-family:${_}; font-weight:700; font-size:${H.h1}px; line-height:1.1; letter-spacing:0.14em; text-transform:uppercase; color:${V.inkStrong}; }
.dic-h--sm{ font-size:${H.lead}px; }
.dic-mods{ list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:${s.md}px; }
.dic-mods li{ display:flex; align-items:center; gap:${s.md}px; min-width:0;
  padding:${s.sm}px ${s.md}px ${s.sm}px ${s.sm}px; border-radius:${Q.tile}px;
  background:rgba(255,253,247,0.62); border:1px solid ${V.border}; box-shadow:${$e.lift}; }
.dic-badge{ position:relative; flex:0 0 auto; display:flex; align-items:center; justify-content:center; width:${s.xxl+s.xs}px; height:${s.xxl+s.xs}px;
  border-radius:${Q.tile}px; background:${V.panelGrad}; border:1px solid ${V.cardEdge}; }
.dic-tick{ position:absolute; right:-${s.xs+2}px; top:-${s.xs+2}px; display:flex; align-items:center; justify-content:center;
  width:${s.lg+2}px; height:${s.lg+2}px; border-radius:${Q.pill}px; background:#3D7A4E; color:#EAF7ED; border:2px solid ${V.card}; }
.dic-mod-main{ display:flex; flex-direction:column; gap:${s.xs+2}px; min-width:0; flex:1; }
.dic-mod-main .pk-progress,.dic-mod-main .pk-progress__fill{ display:block; }
.dic-mod-bar{ display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:${s.sm}px; }
.dic-mod-main b{ font-family:${_}; font-weight:700; font-size:${H.label}px; letter-spacing:0.14em; text-transform:uppercase; color:${V.inkStrong}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dic-mod-bar i{ font-style:normal; font-family:${K}; font-size:${H.label}px; font-weight:600; color:${V.inkWarm}; white-space:nowrap; }
.dic-cta,.dic-ghost{ display:inline-flex; align-items:center; justify-content:center; border-radius:${Q.field}px;
  font-family:${_}; font-size:${H.label}px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;
  white-space:nowrap; text-decoration:none; transition:transform .2s; }
.dic-cta{ padding:${s.md}px ${s.xl}px; background:${G.grad}; border:1px solid ${Be.edge}; color:${G.ink}; box-shadow:${He}; }
.dic-cta:hover{ transform:scale(1.03); background:${G.gradHover}; }
/* hotový stav — jeden riadok s pásikom vitráže vľavo */
.dic--done{ display:flex; align-items:center; gap:${s.lg}px; min-height:0; padding:${s.md}px ${s.lg}px ${s.md}px 0; }
.dic--done::after{ display:none; }
.dic-thumb{ align-self:stretch; width:88px; flex:0 0 auto; margin:-${s.md}px 0; position:relative; }
.dic-thumb img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:0 22%;
  -webkit-mask-image:linear-gradient(90deg,#000 50%,transparent); mask-image:linear-gradient(90deg,#000 50%,transparent); }
.dic-done-body{ min-width:0; flex:1; }
.dic-done-head{ display:flex; align-items:center; gap:${s.sm}px; }
.dic-full{ border-radius:${Q.pill}px; padding:${s.xs}px ${s.sm}px; background:#3D7A4E; color:#EAF7ED;
  font-family:${K}; font-size:${H.micro}px; font-weight:600; letter-spacing:0.02em; }
.dic-donemods{ display:flex; flex-wrap:wrap; gap:${s.xs}px ${s.md}px; font-family:${K}; font-size:${H.label}px; color:${V.inkWarm}; margin:${s.xs}px 0 0; }
.dic-donemods span{ display:inline-flex; align-items:center; gap:${s.xs}px; }
.dic-donemods svg{ color:#3D7A4E; }
.dic-ghost{ flex:0 0 auto; padding:${s.sm}px ${s.md}px; background:transparent; border:1px solid ${V.border}; color:${V.inkWarm}; }
.dic-ghost:hover{ border-color:${V.cardEdge}; color:${V.inkStrong}; }

/* ── KRONIKA — linajková strana zošita (kompaktná, 3. kolo) ─────────── */
.ctz{ position:relative; overflow:hidden; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center;
  gap:${s.lg}px; padding:${s.lg}px ${s.xl}px; }
.ctz::before{ content:''; position:absolute; inset:0; pointer-events:none;
  background:repeating-linear-gradient(180deg,transparent 0,transparent 23px,rgba(201,154,63,0.16) 23px,rgba(201,154,63,0.16) 24px); }
.ctz::after{ content:''; position:absolute; top:0; bottom:0; left:104px; width:1px; background:rgba(178,86,64,0.32); pointer-events:none; z-index:0; }
.ctz > *{ position:relative; z-index:1; }
.ctz-book{ display:flex; align-items:center; justify-content:center; width:64px; height:64px;
  background:radial-gradient(circle at 50% 55%,rgba(245,199,61,0.34) 0%,rgba(245,199,61,0) 68%); }
.ctz-text{ display:flex; flex-direction:column; gap:${s.xs}px; min-width:0; padding-left:${s.md}px; }
.ctz-text .dic-h{ font-size:${H.h2}px; }
.ctz-prompt{ margin:0; font-family:${K}; font-size:${H.body}px; line-height:1.4; color:${V.inkWarm}; }
.ctz-meta{ margin:0; font-family:${K}; font-size:${H.micro}px; letter-spacing:0.14em; text-transform:uppercase; color:${V.inkWarm}; }
.ctz-meta b{ color:${V.inkStrong}; }

@media (max-width:760px){
  .dic-mods{ grid-template-columns:1fr; gap:${s.sm}px; }
}
@media (max-width:640px){
  .dic{ grid-template-columns:88px minmax(0,1fr); }
  .dic-art img{ object-position:4% 20%; }
  .dic-body{ padding:${s.lg}px ${s.lg}px ${s.lg}px 0; gap:${s.md}px; }
  /* Na mobile ide CTA POD moduly (palec dole), hlavička sa rozloží do tela karty. */
  .dic-head{ display:contents; }
  .dic-mods{ order:1; }
  .dic-head > :last-child{ order:2; }
  .dic-cta{ width:100%; }
  .dic-mods li{ padding:${s.xs}px ${s.sm}px ${s.xs}px ${s.xs}px; }
  .ctz{ grid-template-columns:auto minmax(0,1fr); gap:${s.md}px; padding:${s.lg}px; }
  .ctz::after{ left:84px; }
  .ctz-book{ width:56px; height:56px; }
  .ctz-book svg{ width:56px; height:42px; }
  .ctz-cta{ grid-column:1/-1; width:100%; }
}
`;function Wi(){const a=eo(),n=($,D)=>{const k=a($);return k===$?D:k},[o,t]=z.useState(null),[i,r]=z.useState(null),[c,m]=z.useState({}),[h,j]=z.useState(!1),[u,E]=z.useState(!1);z.useEffect(()=>{let $=!0;return qo("id, dog_name, cloudinary_main_url, heroglyph_png_url, pack_number, country, life_status, death_date, birth_year, selections, created_at, breed").then(D=>{$&&t(D)}),()=>{$=!1}},[]),z.useEffect(()=>{if(!o||o.length===0)return;const $=o.map(p=>p.id);let D=!0;const k=()=>{To($).then(p=>{D&&(m(p),j(!0))})};k();const b=ao(k);return()=>{D=!1,b()}},[o]);const I=oo.length,P=o!==null&&o.length>0&&o.every($=>Uo(c[$.id]));return o===null?e.jsx(sa,{children:e.jsx(qn,{})}):o.length===0?e.jsxs(sa,{children:[e.jsx("style",{children:Ya}),e.jsx(Qn,{})]}):e.jsxs(sa,{children:[e.jsxs("style",{children:[Ya,jo,Kn]}),u?e.jsx(Rn,{dogs:o,tx:n,onDone:$=>{t($),E(!1)}}):e.jsxs("div",{className:"flex flex-col gap-3",children:[o.length>=2&&e.jsx(In,{onClick:()=>E(!0),tx:n}),o.map($=>e.jsx(Yn,{dog:$,latest:c[$.id],total:I,t:a,tx:n},$.id))]}),h&&!P&&e.jsx(Za,{latest:c,dogs:o,tx:n}),e.jsx(Zn,{dogs:o,tx:n}),e.jsx("div",{style:{marginTop:s.md},children:e.jsx(Nn,{dogs:o,latest:c,tx:n,onAddToDay:$=>r({day:$,mode:"write"})})}),e.jsx("div",{style:{marginTop:s.md},children:e.jsx(Xn,{tx:n})}),h&&P&&e.jsx(Za,{latest:c,dogs:o,tx:n}),i&&e.jsx(Io,{dogs:o.map($=>({id:$.id,name:$.dog_name??"—"})),day:i.day,mode:i.mode,onClose:()=>r(null),tx:n})]})}function Un(a,n,o,t){z.useLayoutEffect(()=>{var P,$;const i=a.current,r=n.current;if(!i||!r)return;let c=0,m=!0;const h=()=>{var ne;if(!m)return;const D=i.parentElement,k=(D==null?void 0:D.parentElement)??null,b=D==null?void 0:D.closest(".dogblk-card"),p=k==null?void 0:k.querySelector(".dogblk-rail");i.style.maxWidth="none";const f=b==null?void 0:b.querySelector(".dogblk-photo"),C=i.querySelector(".dogblk-glyph"),N=C instanceof HTMLImageElement?C:null,x=i.clientWidth;if(!x)return;const O=getComputedStyle(i),S=parseFloat(O.getPropertyValue("--fit-min"))||14,A=parseFloat(O.getPropertyValue("--fit-max"))||200,y=r.style.whiteSpace;r.style.whiteSpace="nowrap",r.style.fontSize="100px";const M=document.createRange();M.selectNodeContents(r);const R=M.getBoundingClientRect().width/100,w=(parseFloat(getComputedStyle(r).lineHeight)||102)/100;if((ne=M.detach)==null||ne.call(M),r.style.whiteSpace=y,!R)return;const v=typeof window<"u"&&window.matchMedia("(min-width:721px)").matches,F=N?N.naturalWidth&&N.naturalHeight?N.naturalWidth/N.naturalHeight:0:C?co:0;parseFloat(O.rowGap)||parseFloat(O.columnGap);const W=k&&parseFloat(getComputedStyle(k).columnGap)||0;p&&(p.style.width="");const ke=p?p.getBoundingClientRect().width:0,re=k?Math.max(0,k.clientWidth-ke-(ke?W:0)):0;f&&(f.style.width="",f.style.height=""),C&&(C.style.width="",C.style.height=""),D&&(D.style.marginLeft=""),i.style.columnGap="";let ee=i.clientWidth||x;if(re>0&&F>0)if(v){const se=(re-2*W)/(Va+R*Ua/w+F);if(se>30){const pe=Math.round(se*Va),be=Math.round(se*_n),ue=Math.max(S,Math.min(A,se*Ua*Fn/w)),ye=R*ue,Ne=be*F,ge=Math.max(W,(re-pe-ye-Ne)/2);f&&(f.style.width=`${pe}px`,f.style.height=`${pe}px`),C&&(C.style.height=`${be}px`,C.style.width="auto"),D&&(D.style.marginLeft=`${Math.round(ge-W)}px`),i.style.maxWidth="none",i.style.columnGap=`${Math.round(ge)}px`,i.style.width=`${Math.round(ye+ge+Ne)}px`,r.style.fontSize=`${ue}px`;return}}else{const se=Math.round(Math.min(Hn,Math.max(Wn,re*Gn)));f&&(f.style.width=`${se}px`,f.style.height=`${se}px`);const pe=re-se-W,be=Math.min(pe,Vn);if(be>40){i.style.maxWidth="none",i.style.width=`${Math.round(be)}px`,r.style.fontSize=`${Math.max(S,Math.min(A,(be-1)/R))}px`;return}}i.style.width="",ee=i.clientWidth||x,r.style.fontSize=`${Math.max(S,Math.min(A,(ee-1)/R))}px`};h(),(P=document.fonts)==null||P.ready.then(h).catch(()=>{});const j=new ResizeObserver(()=>{cancelAnimationFrame(c),c=requestAnimationFrame(h)});j.observe(i);const u=($=i.parentElement)==null?void 0:$.closest(".dogblk-card"),E=u==null?void 0:u.querySelector(".dogblk-rail");E&&j.observe(E);const I=u==null?void 0:u.querySelector(".dogblk");return I&&j.observe(I),()=>{m=!1,j.disconnect(),cancelAnimationFrame(c)}},[a,n,o,t])}function Yn({dog:a,latest:n,total:o,t,tx:i}){var y,M,R,w,v;const{lang:r}=ka(),c=z.useRef(null),m=z.useRef(null),[h,j]=z.useState(!1),u=oo.filter(F=>Ao(n==null?void 0:n[F.field])).length,E=o===0?0:Math.round(u/o*100),I=(a.dog_name||"").toUpperCase(),P=Xo(a.country||"")||"sk",$=Go(a);Un(c,m,I,h);const D=(y=n==null?void 0:n["nature.role"])==null?void 0:y.value,k=(M=n==null?void 0:n["nature.element"])==null?void 0:M.value,b=Zo((R=n==null?void 0:n["nature.specials"])==null?void 0:R.value,(v=(w=n==null?void 0:n["nature.scores"])==null?void 0:w.value)==null?void 0:v.spec),p=(F,W)=>{var re,ee;if(typeof W!="string"||!W)return null;const ke=(ee=(re=Vo[F])==null?void 0:re.valueLabels)==null?void 0:ee[W];return ke?i(ke.i18n,ke.labelEN):null},f=p("nature.role",D),C=p("nature.element",k),N=$.days===null?null:t("pack.tree.daysUnit",{days:wo($.days,r,0)}),x=[N?e.jsx(Oe,{solid:!0,children:$.isAngel?`🕊 ${N}`:N},"days"):null,e.jsxs(Oe,{children:[e.jsx($o,{iso2:P,label:P.toUpperCase(),size:13}),P.toUpperCase()]},"country"),f?e.jsx(Oe,{children:f},"role"):null,C?e.jsx(Oe,{children:C},"el"):null,...b.map(F=>{const W=p("nature.specials",F);return W?e.jsx(Oe,{dashed:!0,children:W},F):null})].filter(Boolean),O=o>0&&u>=o,S=O?" is-done":"",A=O?i("pack.hub.passComplete","Complete"):`${E}%`;return e.jsx(Ae,{to:`/pack/dogs/${a.id}`,className:"hub-hover dogblk-card",style:{...q.card,display:"block",textDecoration:"none"},children:e.jsxs("div",{className:"dogblk",children:[e.jsxs("div",{className:"dogblk-left",children:[a.cloudinary_main_url?e.jsx("img",{className:"dogblk-photo",src:na(a.cloudinary_main_url,320),alt:""}):e.jsx("div",{className:"dogblk-photo",style:{background:"rgba(201,154,63,0.16)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(_e,{name:"paw",size:36,tint:"gold"})}),a.pack_number!==null&&e.jsx("span",{className:"dogblk-num",children:`#${a.pack_number}`})]}),e.jsxs("div",{className:"dogblk-main",children:[e.jsxs("div",{ref:c,className:"dogblk-idw",style:{"--len":Math.max(I.length,3)},children:[e.jsx("span",{ref:m,className:"dogblk-name",style:{fontFamily:Ln,fontWeight:700,color:te.inkStrong},children:I}),a.heroglyph_png_url&&!h?e.jsx("img",{className:"dogblk-glyph",src:a.heroglyph_png_url,alt:"","aria-hidden":!0,onError:()=>j(!0)}):e.jsx("div",{className:"dogblk-glyph dogblk-glyph--empty","aria-hidden":!0})]}),e.jsx("div",{className:"dogblk-pills",children:x})]}),e.jsxs("div",{className:"dogblk-rail",children:[e.jsx("span",{className:`dogblk-fill${S}`,children:A}),e.jsx(_e,{name:"dogposter",size:78,tint:"dark",className:"dogblk-poster",style:{width:"auto",height:"var(--poster-h, 78px)"}}),e.jsx("span",{className:"dogblk-railcap",children:i("pack.hub.profileTitle","DOG ID")})]})]})})}function Oe({children:a,dashed:n=!1,mono:o=!1,solid:t=!1}){const i=t?ea.background:n?"transparent":te.tileBg;return e.jsx("span",{className:`dogblk-pill${t?" dogblk-days":""}`,style:{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:s.xs,borderRadius:Q.pill,textAlign:"center",background:i,border:t?"none":`1px solid ${n?"rgba(179,130,45,0.6)":te.border}`,borderStyle:t?"none":n?"dashed":"solid",fontFamily:o?"'JetBrains Mono', ui-monospace, monospace":_,fontWeight:700,textTransform:t?"none":"uppercase",lineHeight:t?1.1:1.25,letterSpacing:t?ea.letterSpacing:void 0,boxShadow:t?ea.boxShadow:void 0,color:t?ea.color:n?te.inkWarm:o?"#8a5a12":te.inkStrong},children:a})}const Ja="/images/nature-quiz-art.webp";function Za({latest:a,dogs:n,tx:o}){const t=n.map(m=>m.id),i=Yo.map(m=>({m,p:Jo(m,a,t)})),r=i.every(m=>m.p.done),c=o("pack.hub.profileTitle","DOG ID");return r?e.jsxs("section",{className:"dic dic--done",style:{...q.card,marginTop:s.md},children:[e.jsx("div",{className:"dic-thumb","aria-hidden":!0,children:e.jsx("img",{src:Ja,alt:""})}),e.jsxs("div",{className:"dic-done-body",children:[e.jsxs("div",{className:"dic-done-head",children:[e.jsx("h4",{className:"dic-h dic-h--sm",children:c}),e.jsx("span",{className:"dic-full",children:"100 %"})]}),e.jsx("p",{className:"dic-donemods",children:i.map(({m})=>e.jsxs("span",{children:[o(m.i18n,m.labelEN)," ",e.jsx(Ia,{size:H.label})]},m.key))})]}),e.jsx(Ae,{to:"/pack/dogs/dogid",className:"dic-ghost",children:o("pack.dogid.edit","Edit")})]}):e.jsxs("section",{className:"dic",style:{...q.card,boxShadow:$e.panel,marginTop:s.xl},children:[e.jsx("div",{className:"dic-art","aria-hidden":!0,children:e.jsx("img",{src:Ja,alt:""})}),e.jsxs("div",{className:"dic-body",children:[e.jsxs("div",{className:"dic-head",children:[e.jsxs("div",{style:{minWidth:0},children:[e.jsx("span",{className:"dic-eyebrow",children:o("pack.dogid.eyebrow","Your dog’s document")}),e.jsx("h3",{className:"dic-h",children:c})]}),e.jsx(nn,{right:"dogid.edit",children:e.jsx(Ae,{to:"/pack/dogs/dogid",className:"dic-cta",children:o("pack.dogid.fill","Fill in")})})]}),e.jsx("ul",{className:"dic-mods",children:i.map(({m,p:h})=>e.jsxs("li",{className:h.done?"is-done":void 0,children:[e.jsxs("span",{className:"dic-badge","aria-hidden":!0,children:[e.jsx(_e,{name:m.icon,size:H.h2,tint:"gold"}),h.done&&e.jsx("span",{className:"dic-tick",children:e.jsx(Ia,{size:H.micro})})]}),e.jsxs("span",{className:"dic-mod-main",children:[e.jsx("b",{children:o(m.i18n,m.labelEN)}),e.jsxs("span",{className:"dic-mod-bar",children:[e.jsx("span",{className:"pk-progress",children:e.jsx("span",{className:`pk-progress__fill ${h.done?"pk-progress__fill--done":"pk-progress__fill--low"}`,style:Jn(h.pct)})}),e.jsxs("i",{children:[h.pct," %"]})]})]})]},m.key))})]})]})}const Jn=a=>({width:`${Math.min(100,Math.max(0,a))}%`});function Zn({dogs:a,tx:n}){const o=So(a.map(r=>r.id)),t=typeof document<"u"&&document.documentElement.lang||void 0,i=o&&o.length>0?o[0]:null;return e.jsxs("section",{className:"ctz",style:{...q.card,marginTop:s.md},children:[e.jsx("div",{className:"ctz-book","aria-hidden":!0,children:e.jsx(zo,{size:64})}),e.jsxs("div",{className:"ctz-text",children:[e.jsx("h3",{className:"dic-h",children:n("pack.chronicle.title","Chronicle")}),e.jsx("p",{className:"ctz-prompt",children:n("pack.chronicle.prompt","What did you two live through today? Keep it.")}),o&&o.length>0&&e.jsxs("p",{className:"ctz-meta",children:[n("pack.chronicle.countLabel","Entries"),": ",e.jsx("b",{children:o.length}),i&&e.jsxs(e.Fragment,{children:[" · ",n("pack.chronicle.lastLabel","last")," ",new Date(i.recordedAt).toLocaleDateString(t,{day:"numeric",month:"numeric"})]})]})]}),e.jsx(Ae,{to:"/pack/dogs/chronicle",className:"dic-cta ctz-cta",children:n("pack.hub.open","Open")})]})}function Xn({tx:a}){return e.jsxs(Ae,{to:"/pack/ainubis",className:"flex items-center gap-4 flex-wrap",style:{textDecoration:"none",padding:"16px 24px",borderRadius:Q.card,background:"radial-gradient(circle at 22% 20%, #12233a 0%, #01050A 74%)",border:"1px solid rgba(91,224,240,0.28)",boxShadow:"0 0 0 4px rgba(59,158,255,0.05), 0 18px 44px -22px rgba(59,158,255,0.45)"},children:[e.jsx("img",{src:Ho,alt:"","aria-hidden":!0,style:{width:88,height:88,objectFit:"contain",borderRadius:"50%",flex:"0 0 auto",background:"radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)",border:"1px solid rgba(91,224,240,0.35)",boxShadow:"0 0 0 5px rgba(59,158,255,0.06), 0 0 26px rgba(59,158,255,0.34)"}}),e.jsxs("div",{style:{flex:1,minWidth:200},children:[e.jsxs("h4",{style:{fontFamily:_,fontWeight:700,fontSize:H.h1,lineHeight:1,letterSpacing:"0.14em",textTransform:"uppercase",color:ae.ink,margin:0,textShadow:"0 0 22px rgba(91,224,240,0.55)"},children:[e.jsx("span",{style:{color:ae.aiInk,textShadow:ae.aiShadow},children:"AI"}),"NUBIS"]}),e.jsx("div",{style:{fontFamily:K,fontWeight:500,fontSize:H.label,letterSpacing:"0.02em",color:"#5BE0F0",margin:"8px 0 4px"},children:a("pack.hub.ainubisTagline","your virtual pack member!")}),e.jsx("p",{style:{fontFamily:K,fontSize:H.label,lineHeight:1.55,color:"rgba(230,250,255,0.62)",margin:0,maxWidth:"52ch"},children:a("pack.hub.ainubisBody","A personal advisor made just for your dog — always at hand.")})]}),e.jsx("span",{style:{fontFamily:"'JetBrains Mono', ui-monospace, monospace",fontSize:H.micro,letterSpacing:"0.22em",textTransform:"uppercase",whiteSpace:"nowrap",color:ae.cyan,background:`rgba(${ae.cyanRGB},0.08)`,border:`1px solid rgba(${ae.cyanRGB},0.35)`,borderRadius:Q.pill,padding:"8px 16px"},children:a("pack.hub.ainubisEnter","Enter")})]})}function qn(){return e.jsx("div",{className:"flex flex-col gap-3",children:[0,1].map(a=>e.jsx("div",{style:{...q.card,height:132,opacity:.5}},a))})}function Qn(){const a=eo(),n=(o,t)=>{const i=a(o);return i===o?t:i};return e.jsxs("div",{className:"flex flex-col items-center text-center gap-4",style:{...q.card,padding:s.xl},children:[e.jsx(_e,{name:"bone",size:30,tint:"dark"}),e.jsx("p",{style:{fontFamily:K,fontSize:H.body,lineHeight:1.6,color:te.inkDim,margin:0,maxWidth:320},children:n("pack.hub.empty","No dog on your leash yet. Give one a heroglyph and it'll show up here.")}),e.jsx(Ae,{to:"/heroglyph/name",className:"hub-gold",children:n("pack.hub.emptyCta","Get a heroglyph")})]})}export{Wi as default};
