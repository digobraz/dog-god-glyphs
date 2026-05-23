# DOGYPT — Preklad webu do SK (EN → SK)

> **Workflow:** Čítaj zľava (EN canonical) a napravo (navrhovaný SK). Hocikde môžeš prepísať návrh — ja potom prevezmem tvoju verziu a urobím replacements priamo v komponentoch.
>
> **Tónové poznámky:**
> - "you" → **tykanie** (DOGYPT = community, blízky misijný tón)
> - **brand-výrazy** (DOGYPT, Heroglyph, HEKTHOR, Pack, Codex, Pantheon) ostávajú v EN
> - **"Doglover/Doglovers"** → "psíčkar" 
> - **"In Dog We Trust"** → ostáva v EN ako brand-mantra (canonical)
> - **"Become Dogyptian"** → **"Staň sa Dogypťanom"** (primary CTA — všade rovnako)
> - **Cinzel UPPERCASE nadpisy** → držíme `VEĽKÉ PÍSMENÁ` aj v SK
> - Otáznik / výkričník / interpunkcia: SK štandard (medzera pred — len pri pomlčke s medzerami)
>
> **Otvorené otázky pre teba (označené `?`):**
> - WALL — ostáva EN alebo "STENA" / "MRIEŽKA"?
> - "Pack" — ostáva EN alebo "Svorka"?
> - "Heroglyph" — ostáva EN (etymológia HERO+GLYPH = pes+symbol)

---

## 1. MENU / NAVIGÁCIA (PageNav.tsx)

| EN (canonical) | SK (návrh) | Poznámka |
|---|---|---|
| GODS | BÔŽICI| 
| VISION | VÍZIA | |
| CODEX | KÓDEX | |
| ABOUT | O NÁS | |
| Choose language | Vyber si jazyk | (modal title) |
| Change language (current: {LANG}) | Zmeniť jazyk (aktuálne: {LANG}) | aria-label |
| English | English | (native names ostávajú) |
| Slovenčina | Slovenčina | |

---

## 2. HOMEPAGE — Spirála (`/` do 6.6.2026) — SpiralLanding.tsx

| EN | SK |
|---|---|
| In Dog<br>We Trust | In Dog<br>We Trust *(brand-mantra, ostáva EN)* |
| A new era for dogs and humans is about to begin. | Začína sa nová éra pre psov aj ľudí. |
| your@email.com | tvoj@email.com |
| I'm In | Idem do toho |
| Something went wrong. Try again. | Niečo sa pokazilo. Skús znova. |
| You're in. We'll be in touch. | Si vnútri. Ozveme sa. |

---

## 3. HOMEPAGE — GodsWall

### 3a. Top nav (vľavo)

| EN | SK |
|---|---|
| Vision | Vízia |
| Codex | Kódex |
| About | O nás |

### 3b. Stredná hero karta

| EN | SK |
|---|---|
| The place where<br>Dog is God. | Miesto, kde<br>Pes je Boh. |
| Become Dogyptian | Staň sa Dogyptťanom |
| {N} / 1 000 000 DOGS | {N} / 1 000 000 PSOV |

### 3c. Info overlay (pri kliknutí na "i")

| EN | SK |
|---|---|
| 1,000,000 dogs.<br>Will we make it? | 1 000 000 psov.<br>Dokážeme to? |
| DOGYPT is a movement for dog lovers. Every dog gets a unique Heroglyph — their permanent place in the global pack. We're collecting one million heroes. Be among the first. | DOGYPT je hnutie pre psíčkarov. Každý pes dostane unikátny Heroglyph — svoje trvalé miesto v globálnej svorke. Zbierame milión hrdinov. Buď medzi prvými. |

### 3d. Plávajúce ovládače

| EN | SK |
|---|---|
| Center | Stred |
| Find dog by number | Nájdi psa podľa čísla |
| Dog # | Pes č. |
| AWAITING | ČAKÁ |

### 3e. Hektor founder card (open overlay)

| EN | SK |
|---|---|
| The dog who started it all. Adopted 2017. Every journey begins with one step — his was a 42-day walk across Slovakia. | Pes, ktorým to všetko začalo. Rok strávil v útulku a v roku 2017 bol adoptovaný. Jeho prítomnosť totálne obrátila smerovanie jeho spoločníka Mateja. Spolu začali žiť ten najlepší život. Ich druhým domovom sa stal les, precestovali spolu celú svoju rodnú krajinu  - napísali knihu. Zachraňujú iné zvieratá, prevádzkovali farmu... Ich láska vytvorila myšlienku, vytvoriť naväčšiu komunitu psíčkarov na svete a tak vzdať úctu a rešpekt celej psej rase. |

### 3f. Krajiny vo vlajočkách (FLAG_NAMES — už SK)

> Tieto sú už v SK v kóde (`Slovensko`, `Česko`, `Poľsko`, …) — netreba prekladať.

---

## 4. STRÁNKA `/vision` (Vision.tsx)

### 4a. Hlavný headline

| EN | SK |
|---|---|
| Imagine A World | Predstav si Svet |
| Built By <u>Doglovers</u>. | Postavený <u>Psíčkarmi</u>. |
| Beyond borders and politics — doglovers are Earth's kindest hidden force. Only together, we can rebuild the system and change the world. | Bez ohľadu na hranice a politiku — psíčkari sú tá najláskavejšia skrytá sila Zeme. Iba spoločne dokážeme prestavať systém a zmeniť svet. |
| Become Dogyptian | Staň sa Dogypťanom |

### 4b. Pilliere / Roadmap (hover tooltips)

| Pilier | EN tooltip | SK preklad |
|---|---|---|
| **The Plan** | Dogyptism is alive. The constitution written, the first doglovers gathering, the movement set in motion. | Dogyptizmus žije. Ústava je napísaná, prví psíčkari sa schádzajú, hnutie je v pohybe. |
| **One Million** | First milestone - one million heroglyphs. The threshold where we stop being individuals and become unstoppable. | Prvý míľnik - milión heroglyfov. Prah, kde prestávame byť jednotlivcami a stávame sa nezastaviteľnými. |
| **Digital Temple** | One app, one sacred space, connecting every doglover, every dog, every act of kindness across the planet. | Jedna appka, jeden posvätný priestor, ktorý prepája každého psíčkara, každého psa a každý dobrý skutok na celej planéte. |
| **The Mission** | Not shelters but working solutions, fully backed by Dogypt. We fix the root, not the symptoms the system ignores. | Nie útulky, ale fungujúce riešenia, plne podporované Dogyptom. Liečime koreň, nie symptómy, ktoré systém ignoruje. |
| **Centers** | Real Dogypt Centers on every continent. Shelters, sanctuaries and DOGYPTLAND built by us, owned by us. | Skutočné Dogypt Centrá na každom kontinente. Útulky, svätyne a DOGYPTLANDY, ktoré sme postavili my a patria nám. |
| **Research** | Longevity research guided by Mother Nature, not the pharma machine. Helping every dog live longer, healthier. | Výskum dlhovekosti vedený Matkou Prírodou, nie farma-priemyslom. Pomáhame každému psovi žiť dlhšie a zdravšie. |
| **Goal** | A home for every stray on Earth. The final vow of the pack: zero dogs left behind, every life returned. | Domov pre každého túlavého psa na Zemi. Konečný sľub svorky: žiadny pes nezostane sám, každý život sa vráti. |

### 4c. Slider labels (Day One → One Day)

| EN | SK |
|---|---|
| Day One | Dnes |
| One Day | Jedného dňa |
| Day One — overwhelmed dog shelter | Dnes — preplnený psí útulok |
| One Day — Dogypt Center | Jedného dňa — Dogypt Centrum |

---

## 5. STRÁNKA `/codex` (Codex.tsx)

| EN | SK |
|---|---|
| Sacred Laws of Dogyptism | Posvätné Zákony Dogyptizmu |
| The Codex | Kódex |
| The living constitution of the Pack. | Živá ústava Svorky. |
| **PREAMBLE** | **PREAMBULA** |
| "We, the nation of doglovers — knowing the infinite loyalty, the true love and the pure soul of every dog on Earth — in order to lift the standing of dogs in human society, build them a community, better their lives, and rewrite the fate of every dog in need, do give ourselves this constitution." | „My, národ psíčkarov — poznajúc nekonečnú vernosť, pravú lásku a čistú dušu každého psa na Zemi — aby sme pozdvihli postavenie psov v ľudskej spoločnosti, vybudovali im komunitu, zlepšili ich životy a prepísali osud každého psa v núdzi, dávame si túto ústavu." |
| A billion people hold the cow sacred. **Will enough of us stand for the dog?** | Miliarda ľudí považuje kravu za posvätnú. **Postavíme sa za psa, ak nás bude dosť?** |
| Full Constitution → dogyptism.dogypt.com | Celá ústava → dogyptism.dogypt.com |

---

## 6. STRÁNKA `/about` (About.tsx)

| EN | SK |
|---|---|
| Our Origin | Náš Pôvod |
| Blame it on a<br>**Black Shelter Dog.** | Môže za to<br>**Čierny pes z útulku.** |
| In 2017 a black shelter dog named Hekthor walked into Matej's life and never left. Together they crossed Slovakia — 42 days, 800 kilometres, one quiet promise. That walk became a book. The book became a question we couldn't put down: what if doglovers shared more than photos? | V roku 2017 vstúpil do Matejovho života čierny pes z útulku menom Hekthor — a nikdy z neho neodišiel. Spolu prešli Slovensko — 42 dní, 800 kilometrov, jeden tichý sľub. Z tej cesty vznikla kniha. Z knihy otázka, ktorú sme nedokázali odložiť: čo ak by si psíčkari vymieňali viac než len fotky? |
| DOGYPT is the answer. A movement built on the oldest, most honest relationship on Earth. Hekthor is founder #1. The Pack is growing. You are next. | DOGYPT je odpoveď. Hnutie postavené na najstaršom a najúprimnejšom vzťahu na Zemi. Hekthor je zakladateľ č. 1. Svorka rastie. Ty si ďalší. |
| Become Dogyptian | Staň sa Dogyptiánom |

---

## 7. STRÁNKA `/heroglyph` — INTRO (Heroglyph.tsx)

### 7a. Hero title + dictionary block

| EN | SK |
|---|---|
| The Symbol That Changes History | Symbol, Ktorý Mení Históriu |
| **Heroglyph** | **Heroglyph** *(brand pojem, ostáva)* |
| [ˈhɪr-oʊ-ɡlɪf] *noun* | [ˈhɪr-oʊ-ɡlɪf] *podstatné meno* |
| A unique symbol describing you and your dog, your eternal bond. Also a ticket to DOGYPT — the place where DOG is GOD. | Unikátny symbol, ktorý opisuje teba a tvojho psa — vaše večné puto. Zároveň vstupenka do DOGYPT — miesta, kde DOG is GOD. |

### 7b. "Heroglyph" tooltip (hover na slovo)

| EN | SK |
|---|---|
| HERO = DOG · GLYPH = SYMBOL | HERO = PES · GLYPH = SYMBOL |
| GOD name for every DOG. | BOŽSKÉ meno pre každého PSA. |

### 7c. Pills marquee — rad 1

| Pill | EN tooltip | SK preklad |
|---|---|---|
| **12 Questions** → 12 otázok | Twelve quick answers about your dog. | Dvanásť rýchlych odpovedí o tvojom psovi. |
| **3 Minutes** → 3 minúty | An interactive quiz full of fun. | Interaktívny kvíz plný zábavy. |
| **Forever in DOGYPT.com** → Navždy na DOGYPT.com | Your dog's name forever in your heart — and in the digital wall. | Meno tvojho psa navždy v tvojom srdci — aj na digitálnej nástenke. |

### 7d. Pills marquee — rad 2

| Pill | EN tooltip | SK preklad |
|---|---|---|
| **One of a Kind** → Jediný svojho druhu | No two heroglyphs are alike — every symbol is unique! | Žiadne dva heroglyfy nie sú rovnaké — každý symbol je unikátny! |
| **Vow of Faith** → Sľub Viery | Your sign of allegiance to the Dogyptian path — IN DOG WE TRUST! | Tvoj znak vernosti dogyptiánskej ceste — IN DOG WE TRUST! |
| **Eternal Bond** → Večné Puto | A symbol of the eternal bond between you and your dog. | Symbol večného puta medzi tebou a tvojím psom. |
| **One Symbolic Payment** → Jedna Symbolická Platba | $11 once — no subscriptions. All money stays in DOGYPT — for development and systematic help! | $11 raz — žiadne predplatné. Všetky peniaze ostávajú v DOGYPT — na vývoj a systematickú pomoc! |

### 7e. CTA + sub-text

| EN | SK |
|---|---|
| Create Heroglyph | Vytvoriť Heroglyph |
| Doglovers, assemble! | Psíčkari, do zbrane! |
| Loading… | Načítava sa… |

### 7f. Heroglyph symbol tooltips (hover na symboly na heroglyfe)

| EN label | SK label |
|---|---|
| Dog | Pes |
| Owner | Majiteľ |
| Dog Gender | Pohlavie Psa |
| Dog Colour | Farba Psa |
| Dog Patron | Patrón Psa |
| Dog Origin | Pôvod Psa |
| Dog Bloodline | Pôvodová Línia |
| Dog Character I | Charakter Psa I |
| Dog Character II | Charakter Psa II |
| Owner Gender | Pohlavie Majiteľa |
| Western Zodiac | Západný Zverokruh |
| Chinese Zodiac | Čínsky Zverokruh |
| Owner Initial | Iniciála Majiteľa |
| Ranking | Poradie |

---

## 8. HEROGLYPH FLOW — 14 KROKOV

### Krok 1 — `/heroglyph/name` (NameScreen)

| EN | SK |
|---|---|
| Hi, I'm **HEKTHOR**. What's your dog's name? | Ahoj, ja som **HEKTHOR**. Ako sa volá tvoj pes? |
| Type your dog's name... | Napíš meno svojho psa… |
| When was your dog born? | Kedy sa tvoj pes narodil? |
| Continue | Pokračovať |
| **WHO IS HEKTHOR?** (info modal heading) | **KTO JE HEKTHOR?** |
| Hekthor is the first DOGYPTIAN. Rescued from the streets and adopted from shelter, his loyalty inspired a global movement to honor dogs as gods. His mission is to forge a unique HEROGLYPH for every dog on Earth, uniting the world's largest community of dog lovers to help millions of dogs in need. | Hekthor je prvý DOGYPTŤAN. Zachránený z ulice a adoptovaný z útulku, jeho vernosť a láska inšpirovala k vytvoreniu globálneho hnutia, ktoré uctieva psov ako bohov. Jeho misiou je vyrobiť jedinečný HEROGLYPH pre každého psa na Zemi a zjednotiť najväčšiu komunitu psíčkarov, ktorá pomôže miliónom psov v núdzi. |
| Born | Narodený |
| Adopted | Adoptovaný |
| Location | Miesto |
| Slovakia, EU | Slovensko, EÚ |

### Krok 2 — `/heroglyph/photo` (PhotoScreen)

| EN | SK |
|---|---|
| A **FACE** OF A GOD | **TVÁR** BOHA |
| Upload a clear photo of {dogName} — it will be sealed into their Heroglyph forever. | Nahraj jasnú fotku {dogName} — navždy ju zapečatíme do jeho Heroglyphu. |
| Tap to upload | Klikni pre nahratie |
| Change photo | Zmeniť fotku |
| Sealing into eternity… | Pečatím do večnosti… |
| ✓ Sealed | ✓ Zapečatené |
| Upload failed — retry | Nahratie zlyhalo — skús znova |
| ✓ dog facing forward · ✗ side profile / group | ✓ pes čelom · ✗ z profilu / skupina |
| Best results: face clearly visible, works cropped into a circle. | Najlepší výsledok: tvár jasne viditeľná, funguje orezaná do kruhu. |
| NEXT → | ĎALEJ → |
| ← BACK | ← SPÄŤ |
| ADJUST YOUR PORTRAIT | UPRAV SVOJ PORTRÉT |
| Drag to position your dog within the frame. | Ťahaním umiestni psa do rámu. |
| MORE FACES OF THE GOD | VIAC TVÁRÍ BOHA |
| Add 1–3 more photos for surprises later. (optional) | Pridaj 1–3 ďalšie fotky pre prekvapenia neskôr. (voliteľné) |
| SAVING... | UKLADÁM… |

### Krok 3 — `/heroglyph/breed` (BreedPatronScreen)

| EN | SK |
|---|---|
| Tell me, what breed is your hero? | Povedz, akej rasy je tvoj hrdina? |
| Search breed... | Hľadaj rasu… |
| Continue | Pokračovať |

**Kategórie patrónov (01–10):**

| EN | SK |
|---|---|
| Furballs | Chlpáči |
| Wooligans | Vlnáči |
| Antennas | Antény |
| Speedsters | Šprintéri |
| Schnozzers | Ňuchači |
| Aristocrats | Aristokrati |
| Smushfaces | Čapatí |
| Splashers | Špliechači |
| Wolflikes | Vĺčkovia |
| Giants | Obri |

### Krok 4 — `/heroglyph/ranking` (RankingScreen)

| EN | SK |
|---|---|
| Is {dogName} the first dog you've ever had? | Je {dogName} tvoj prvý pes? |
| YES, my first love | ÁNO, moja prvá láska |
| NO, dog lover forever! | NIE, psíčkar navždy! |
| Which dog is {dogName}? | Koľký pes je {dogName}? |
| 2nd, 3rd, 4th… 10th | 2., 3., 4. … 10. |
| 11–50 | 11–50 |
| Enter dog number (11–50) | Zadaj číslo psa (11–50) |
| Continue | Pokračovať |
| Back | Späť |

### Krok 5 — `/heroglyph/owner-info` (OwnerInfoScreen)

| EN | SK |
|---|---|
| Okay, let's talk about you, **hooman**! | Tak, poďme sa porozprávať o tebe, **človeče**! |
| Owner's first name... | Krstné meno majiteľa… |
| Man | Muž |
| Woman | Žena |
| Continue | Pokračovať |
| Back | Späť |

### Krok 6 — `/heroglyph/owner-zodiac` (OwnerZodiacScreen)

| EN | SK |
|---|---|
| What do the stars say about you? | Čo o tebe hovoria hviezdy? |
| Zodiac Sign | Znamenie Zverokruhu |
| Chinese Zodiac | Čínsky Zverokruh |
| Continue | Pokračovať |
| Back | Späť |

**Zverokruh — znamenia:**

| EN | SK |
|---|---|
| Aries | Baran |
| Taurus | Býk |
| Gemini | Blíženci |
| Cancer | Rak |
| Leo | Lev |
| Virgo | Panna |
| Libra | Váhy |
| Scorpio | Škorpión |
| Sagittarius | Strelec |
| Capricorn | Kozorožec |
| Aquarius | Vodnár |
| Pisces | Ryby |

**Čínsky zverokruh:**

| EN | SK |
|---|---|
| Monkey | Opica |
| Rooster | Kohút |
| Dog | Pes |
| Pig | Prasa |
| Rat | Potkan |
| Ox | Vôl |
| Tiger | Tiger |
| Rabbit | Zajac |
| Dragon | Drak |
| Snake | Had |
| Horse | Kôň |
| Goat | Koza |

### Krok 7 — `/heroglyph/owner-final` (OwnerFinalScreen)

| EN | SK |
|---|---|
| {dogName}'S HEROGLYPH | HEROGLYPH PSA {dogName} |
| HOOMAN, your part is done. That little frame — that is you! Now let's finish the HEROGLYPH with {dogName}'s part. | ČLOVEČE, tvoja časť je hotová. Ten malý rámik — to si ty! Teraz dokončme celý HEROGLYPH a časť patriacu pre {dogName}. |
| LET'S GO | POĎME NA TO |
| INSPIRED BY ANCIENT EGYPT | INŠPIROVANÉ STAROVEKÝM EGYPTOM |
| The HEROGLYPH consists of two frames that together form your dog's true identity. In Ancient Egypt, the names of gods and pharaohs were written inside similar protective oval frames, called cartouches, to preserve their legacy for eternity. | HEROGLYPH sa skladá z dvoch rámikov, ktoré spolu tvoria pravú identitu tvojho psa. V starovekom Egypte sa mená bohov či faraónov vpisovali do podobných ochranných oválnych rámikov — kartuší — aby ich odkaz pretrval naveky. |
| This hieroglyph belongs to Cleopatra. | Tento hieroglyf patrí Kleopatre. |

### Krok 8 — `/heroglyph/dog-gender` (DogGenderScreen)

| EN | SK |
|---|---|
| Dog Gender | Pohlavie Psa |
| Do you have a **king** or a **queen** at home? | Máš doma **kráľa** alebo **kráľovnú**? |
| King | Kráľ |
| Queen | Kráľovná |
| **3-Point Crown** — For boys who've mastered the 3-paw balance. One leg up, maximum aim, absolute joy. | **Trojcípa koruna** — Pre chlapcov, čo zvládli balans na 3 labkách. Jedna noha hore, maximálna presnosť, absolútny pôžitok. |
| **4-Point Crown** — For girls who prefer the 4-paw stability. Maximum comfort, zero mess, total elegance. | **Štvorcípa koruna** — Pre dievčatá, čo majú radšej stabilitu na 4 labkách. Maximálne pohodlie, žiadny chaos, totálna elegancia. |

### Krok 9 — `/heroglyph/dog-fate` (DogFateScreen)

| EN | SK |
|---|---|
| The Origin | Pôvod |
| Was your dog born into a **safe home** or given a **second chance** at life? | Narodil sa tvoj pes do **bezpečného domova** alebo dostal **druhú šancu** v živote? |
| Raised | Vychovaný |
| Rescued | Zachránený |
| **Baby Pacifier** — A dog born into the family. Raised with love from day one. | **Cumlík** — Pes, ktorý sa narodil do rodiny. Vychovávaný s láskou od prvého dňa. |
| **Lifebuoy** — A rescued or found dog. Given a second chance at life. | **Záchranný kruh** — Zachránený alebo nájdený pes. Dostal druhú šancu v živote. |

### Krok 10 — `/heroglyph/dog-colour` (DogColourScreen)

| EN | SK |
|---|---|
| Dog Colour | Farba Psa |
| What **coat** is your dog wearing? | Aký **kožuch** má tvoj pes? |
| Bright — Sun | Svetlý — Slnko |
| Dark — Moon | Tmavý — Mesiac |
| Mix — Rainbow | Mix — Dúha |

### Krok 11 — `/heroglyph/dog-bloodline` (DogBloodlineScreen)

| EN | SK |
|---|---|
| Dog Bloodline | Rodokmeň |
| Is your dog **pure** or **wild**? | Je tvoj pes **čistokrvný** alebo **divoký**? |
| Aristocrat | Aristokrat |
| Mutt | Divoch |
| **Signed Papyrus** — Original with pure bloodline. | **Podpísaný papyrus** — Originál s rodokmeňom. |
| **Empty Papyrus** — Original without pure bloodline. | **Prázdny papyrus** — Originál bez rodokmeňu. |

### Krok 12 — `/heroglyph/dog-character` (DogCharacterScreen)

| EN | SK |
|---|---|
| The Character | Charakter |
| What's your dog's **personality** like? | Aká je **povaha** tvojho psa? |
| Choose two options. | Vyber dve možnosti. |
| Pick your dog's vibe | Vyber vibe svojho psa |
| Choose the two character traits that best describe your dog. | Vyber dve charakterové vlastnosti, ktoré najlepšie opisujú tvojho psa. |
| {n}/2 selected | {n}/2 vybraté |

**Charaktery (8):**

| EN | SK |
|---|---|
| Watcher | Strážca |
| Playful | Hravý |
| Hyperactive | Hyperaktívny |
| Maverick | Rebel |
| Water Lover | Vodomil |
| Gourmet | Gurmán |
| Lover | Maznáčik |
| Chillman | Pohodár |

### Krok 13 — `/heroglyph/reveal` (HeroglyphRevealScreen)

| EN | SK |
|---|---|
| {dogName}'s Heroglyph | Heroglyph psa {dogName} |
| ↔ HORIZONTAL DESIGN | ↔ HORIZONTÁLNY DIZAJN |
| ↕ VERTICAL DESIGN | ↕ VERTIKÁLNY DIZAJN |
| WELCOME TO DOGYPT! | VITAJ V DOGYPTE! |
| This Heroglyph is your eternal bond. | Tento Heroglyph je vaše večné puto. |
| GRAB MY HEROGLYPH | CHCEM SVOJ HEROGLYPH |
| **OUR VISION** | **NAŠA VÍZIA** |
| To claim your official symbol, we ask for a symbolic tribute. Our grand plan is simple: a Heroglyph for every dog on Earth. Because the bigger our global pack becomes, the more heroes we can rescue from the streets and shelters. Join the dynasty! | Aby si si nárokoval svoj oficiálny symbol, žiadame symbolický príspevok. Náš plán je jednoduchý: Heroglyph pre každého psa na Zemi. Pretože čím väčšia bude naša globálna svorka, tým viac hrdinov dokážeme zachrániť z ulíc a útulkov. Pripoj sa k dynastii! |

### Krok 14 — `/heroglyph/message` (MessageScreen)

| EN | SK |
|---|---|
| Leave a eternal message for {dogName}. It will stay with them in **dogypt** — forever. | Zanechaj večný odkaz pre {dogName}. Ostane s ním v **dogypt** — navždy. |
| Your Message | Tvoj Odkaz |
| Dear {dogName}, thank you for every second I was lucky enough to spend by your side… | Milý/Milá {dogName}, ďakujem za každú sekundu, ktorú som mal/a to šťastie stráviť po tvojom boku… |
| This message will appear on your dog's profile in the **DOGYPT.com**. | Tento odkaz sa zobrazí na profile tvojho psa na **DOGYPT.com**. |
| SEAL THE MESSAGE → | ZAPEČATIŤ ODKAZ → |

---

## 9. CHECKOUT — `/checkout` (CheckoutScreen)

| EN | SK |
|---|---|
| Order Summary | Súhrn Objednávky |
| {dogName}'s **HEROGLYPH** | **HEROGLYPH** psa {dogName} |
| $11 | $11 |
| Your Details | Tvoje Údaje |
| First Name | Krstné meno |
| Last Name | Priezvisko |
| Email | E-mail |
| Country | Krajina |
| CONTINUE TO PAYMENT → | POKRAČOVAŤ NA PLATBU → |
| After payment, we will create you a **DOGYPT Profile** and place your photo on the website. | Po platbe ti vytvoríme **DOGYPT Profil** a umiestnime fotku tvojho psa na web. |
| Back | Späť |

---

## 10. WELCOME — `/welcome` (WelcomeScreen, post-payment)

| EN | SK |
|---|---|
| RECORD THIS MOMENT | NAHRAJ TENTO MOMENT |
| Capture your dog's official welcome | Zachyť oficiálne privítanie tvojho psa |
| Our Goal 🎯 | Náš Cieľ 🎯 |
| 1,000,000 Heroglyphs | 1 000 000 Heroglyphov |
| Congratulations, {ownerFirstName}. | Gratulujeme, {ownerFirstName}. |
| {dogName} is officially a **DOG** / **GOD** *(strieda sa)* | {dogName} je oficiálne **DOG** / **GOD** *(strieda sa)* |
| You just changed history — We are Just a hair better! **IN DOG WE TRUST.** | Práve si zmenil/a históriu — sme o chlp lepší!.  **IN DOG WE TRUST.** |
| PREPARING YOUR PLACE... | PRIPRAVUJEM TVOJE MIESTO… |
| FORGING YOUR HEROGLYPH... | KUJEM TVOJ HEROGLYPH… |
| ENTER THE GODS → | VSTÚP MEDZI BOHOV → |
| Your certificate is on its way — check your email. | Tvoj certifikát je na ceste — skontroluj si e-mail. |

---

## 11. LOGIN — `/login` (Login.tsx, magic link callback)

| EN | SK |
|---|---|
| DOGYPT · Pack Access | DOGYPT · Prístup do Svorky |
| **Opening the Gate** — Verifying your magic link… | **Otváram bránu** — Overujem tvoj magic link… |
| **Welcome Back** — Redirecting you to your pack… | **Vitaj späť** — Presmerovávam ťa do tvojej svorky… |
| **Link Expired** — Magic links are short-lived. Request a fresh one and we will send it to your inbox. | **Link expiroval** — Magic linky majú krátku platnosť. Požiadaj o nový a pošleme ti ho do schránky. |
| **Link Not Recognised** — We could not verify this link. It may have already been used or copied incorrectly. | **Link nerozpoznaný** — Nedokázali sme overiť tento link. Možno bol už použitý alebo skopírovaný nesprávne. |
| **Connection Hiccup** — We could not reach the temple. Check your connection and try again. | **Problém so spojením** — Nedostali sme sa do chrámu. Skontroluj si pripojenie a skús znova. |
| **No Token Found** — This page expects a magic link from your email. Check your inbox for the latest one. | **Token nenájdený** — Táto stránka očakáva magic link z e-mailu. Skontroluj si schránku a nájdi najnovší. |
| Resend magic link | Poslať nový magic link |
| Sending… | Odosielam… |
| Magic link sent | Magic link odoslaný |
| Back home | Späť domov |

---

## 12. 404 — NotFound.tsx

| EN | SK |
|---|---|
| 404 | 404 |
| Oops! Page not found | Hups! Stránka sa nenašla |
| Return to Home | Späť na úvod |

---

## 13. /PACK — auth-gated backoffice (vyšší level — netýka sa hlavného launchu)

> **Poznámka:** Pack stránky (Pack.tsx, PackDogDetail.tsx, PackEternal.tsx, PackProfile.tsx) sú prístupné iba pre kupujúcich po prihlásení magic linkom. Obsahujú vlastné sub-komponenty (HeroCard, PackTree, FeatureSurveyCard, ConstitutionCard, Announcements, OnboardingProgress, TopCountries, StatTicker, PhaseCard). Tieto texty si urobíme samostatne pred launchom Pack-u, ak budeš chcieť — alebo ostanú EN, keďže primárna komunikácia v Packu je akademická / globálna.

| EN | SK (návrh, len top-level labely z Pack.tsx) |
|---|---|
| Forge your first heroglyph | Vykuj svoj prvý Heroglyph |
| Add your photo | Pridaj svoju fotku |
| Write a message on the Grid | Napíš odkaz na Grid |
| Add extra photos of your dog | Pridaj ďalšie fotky svojho psa |
| Top countries | Top krajiny |


---

## OTVORENÉ OTÁZKY (vyriešiť pred implementáciou)

1. **WALL / GRID** — preložiť alebo nechať EN? *(brand pojem pre homepage od 6.6.)*
2. **Pack** — nechať EN alebo preložiť ako "Svorka"?
3. **Heroglyph** — nechať EN (etymológia HERO+GLYPH)? *(odporúčam EN)*
4. ~~**Doglover/Doglovers** — "milovník psov" vs "psíčkar"?~~ ✅ **VYRIEŠENÉ 2026-05-23: "psíčkar"** (Matejova voľba pri reálnom písaní)

---

## ČO TENTO DOKUMENT NEPOKRÝVA

- **E-mail šablóny** (Resend templates v `vystupy/supabase/functions/send-certificate/`) — texty v EN HTML, treba samostatný prekladový soubor
- **PDF Certificate texty** (CertificateCard.tsx) — predpokladám že ostáva EN ako oficiálny dokument
- **Constitution / Dogyptism** plný text (`vystupy/constitution/index.html`, 1196 r.) — to je samostatný projekt, SK už existuje v PDF
- **Stripe checkout UI** (texty v Stripe Dashboard / language=auto-detect) — Stripe sa preklopí sám podľa locale
- **Terms / Privacy** (Terms.tsx, Privacy.tsx) — právne texty, urobíme samostatne keď budeš mať SK ZP/Privacy

---

**Hotovo.** Prepíš si návrhy a pošli späť, ja potom urobím replacements priamo v komponentoch.
