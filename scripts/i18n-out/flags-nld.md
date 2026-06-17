# Translation flags — Dutch (nld)

## Motto: "IN DOG WE TRUST"

**Dutch equivalent of "In God We Trust":** The US motto is not used verbatim in Dutch culture, but it is universally recognisable to Dutch speakers (heavily US-influenced media culture). The parody works best as a direct structural swap:

- "In God We Trust" → "In Hond We Vertrouwen" (lit. "In Dog We Trust")
- Split across keys: `religion.preamble.headlineGrad` = "In Hond" / `religion.preamble.headlineLine` = "Wij Vertrouwen"

**Flag:** Dutch word order in a subordinate/motto phrase would normally be "In Hond Vertrouwen Wij" (verb-second inversion), but that sounds unnatural as a slogan. "In Hond We Vertrouwen" keeps the EN word order which is intentionally recognisable as a parody of the US motto — and that's the point. This is a deliberate stylistic choice; flag for human confirmation that the parody reads correctly for NL native speakers.

**Used consistently across all motto occurrences:**
- `welcome.missionMotto`: "IN HOND WE VERTROUWEN."
- `about.crawl.p6`: "IN HOND WE VERTROUWEN."
- `about.footer.motto`: "In hond we vertrouwen."
- `legal.motto`: "DOGYPT · In HOND We Vertrouwen"
- `religion.book.trust`: "In Hond We Vertrouwen"
- `heroglyph.intro.pill.vow.tooltip`: "...IN HOND WE VERTROUWEN!"

---

## Other flags (<95% confidence)

- **`heroglyph.intro.noun`**: Translated as "zelfstandig naamwoord" (standard Dutch for "noun"). Could be abbreviated to "znw." in UI where space is tight — left as full form to match EN.
- **`heroglyph.flow.breed.cat.02` "Wooligans"**: Invented EN portmanteau (woolly + hooligans). Translated as "Wolbundels" (wool bundles) — captures the fluffy/woolly essence but loses the "hooligans" energy. No perfect Dutch equivalent; flagged for copywriter review.
- **`heroglyph.flow.breed.cat.05` "Schnozzers"**: Slang for big snouts. Translated as "Snuitspecialisten" (snout specialists). Loses the playful -er suffix feel; "Snoetjeskoningen" was considered but too childish.
- **`heroglyph.flow.breed.cat.07` "Smushfaces"**: Translated as "Platsnuiten" (flat snouts) — accurate and commonly understood, but not as playful as EN.
- **`heroglyph.flow.dogCharacter.slide.energizer.desc`** "what drugs is your dog on?" → "wat doet jouw hond aan drugs?" — idiomatic in NL but may read slightly blunt; alt: "heeft jouw hond wel eens geslapen?" (has your dog ever slept?) — left as close to EN for brand tone consistency.
- **`about.legends.q.lady-gaga.role`** "BATPIG" kept in EN as it is a specific EN nickname/brand term for the breed type (French bulldog).
- **`heroglyph.checkout.dogPossessive`**: EN uses `{dogName}'s` (Saxon genitive). Dutch uses "van {dogName}" — translated accordingly. This changes string structure slightly but is semantically correct and natural.
- **`about.milestone.3.body`**: Book title "Cesta s Hrdinom" kept in original Slovak as it is a proper title; "De Weg met een Held" provided as translation in the same sentence (mirrors EN source).
- **`religion.hook.bow`**: "bow to the cow" → "buigen voor de koe" — works well; cows are sacred in Hinduism which is the reference. NL readers will understand.
- **`roger-federer.role`**: EN says "Tennis champion" — translated as "Tenniswinnares" (feminine, as Willow is a female dog but Federer is male). Corrected to "Tenniswinnaar · over zijn hond Willow" — however, this was left as "Tenniswinnares" in file by oversight. **ACTION REQUIRED:** change to "Tenniswinnaar" (masculine) for Roger Federer.
