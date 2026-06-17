# Flags — Hindi (ind) translation

## MOTTO — "IN DOG WE TRUST"

**Keys:** `religion.preamble.headlineGrad` + `religion.preamble.headlineLine`

**Rendered:** "कुत्ते पर हम भरोसा करते हैं"

**Issue:** Hindi has no direct equivalent of "In God We Trust" as a single famous cultural phrase the way English does. India is a multi-religious country and no single god-trust motto is universally recognized. The US motto parody works only for English speakers.

**What was done:** Literal swap — "ईश्वर पर भरोसा" (trust in God) → "कुत्ते पर भरोसा" (trust in dog). Split:
- `headlineGrad` = "कुत्ते पर" (In/On Dog)
- `headlineLine` = "हम भरोसा करते हैं" (We Trust)

**Options for review:**
1. Keep as-is — literal, clear, grammatically correct Hindi. The parody is understood by those who know the EN original.
2. Use "कुत्ते पर विश्वास" (more formal/religious register for "trust") — closer to religious tone.
3. Keep the original EN "IN DOG WE TRUST" untranslated — recognized by Indian English speakers who are the likely Hindi-reading audience.

**Recommendation:** Option 1 is fine but flagged for human review. The parody lands weakly for monolingual Hindi speakers with no exposure to the US motto.

---

## Other flags (<95% certain)

- `heroglyph.flow.breed.cat.01` **"Furballs"** → "फर के गोले" — playful, but "फर" is a loanword. Could also be "रोएँदार गोले" — slightly more native but less punchy.
- `heroglyph.flow.breed.cat.02` **"Wooligans"** (portmanteau: wool + hooligans) → "ऊनी शरारती" — loses the pun. No native Hindi portmanteau equivalent found.
- `heroglyph.flow.breed.cat.05` **"Schnozzers"** (slang for big-nosed) → "नाक वाले" — simplified. The slang-comedy is lost.
- `heroglyph.flow.breed.cat.07` **"Smushfaces"** → "चपटे मुँह वाले" — accurate but long. Alternative: "चिपटे मुँह वाले".
- `welcome.emailHint` **"DOGYPT is fur better"** (fur/far pun) → "DOGYPT और भी बेहतर है" — pun untranslatable, dropped.
- `heroglyph.flow.dogCharacter.slide.energizer.desc` **"what drugs is your dog on?"** → translated as "आपके कुत्ते ने क्या खाया है?" (what has your dog eaten?) — softened the drug reference for cultural sensitivity. Could keep closer to original if tone allows.
- `about.legends.q.drew-barrymore.role` — kept "Actor" gender-neutral in EN but translated as "अभिनेत्री" (actress, female) based on known identity of Drew Barrymore.
- `religion.hook.bow` **"bow to the cow"** → "गाय को पूजते हैं" (worship the cow) — this is a sensitive cultural reference in India (cow is sacred in Hinduism). The EN text uses it as a neutral comparison. In Hindi context this could read as irreverent. Flagged for human review before deploying to Hindi market.
- `heroglyph.flow.ownerFinal.messageLine3Suffix` **"'s part."** → " के हिस्से से।" — this suffix concatenates with a dog name prefix in `messageLine3Prefix`. The Hindi possessive structure is different from English; the full phrase reads: "अब HEROGLYPH को पूरा करते हैं [dogName] के हिस्से से।" which is grammatically correct.
