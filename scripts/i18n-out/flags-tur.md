# Turkish (tr) translation flags

## MOTTO — "IN DOG WE TRUST"

**Keys:** `religion.preamble.headlineGrad` + `religion.preamble.headlineLine`

**Rendered as:** "Köpeğe Güveniyoruz"

**Split:** headlineGrad = "Köpeğe" · headlineLine = "Güveniyoruz"

**Analysis:** Turkish has no direct equivalent of "In God We Trust" as a canonical phrase (it is not a state motto in Turkey). The closest parody construction mirrors the US motto structure literally: "Allaha güveniriz" (We trust in God) → "Köpeğe güveniriz / Köpeğe güveniyoruz". I used the present-tense "güveniyoruz" (we trust) which reads naturally and is consistent with `religion.book.trust`, `about.crawl.p6`, and `welcome.missionMotto`.

**Flag:** The parody will land for bilingual speakers aware of the US motto, but may not immediately read as a parody to a monolingual Turkish audience since the original US phrase is not widely embedded in Turkish pop culture. If a stronger parody signal is desired, consider a bracketed note in context — but the phrase itself is clean and reverential.

---

## Other notes (<95% confidence)

- **`heroglyph.flow.dogCharacter.slide.energizer.desc`** — "what drugs is your dog on?" translated as "köpeğiniz ne içiyor?" (lit. "what does your dog drink?") — softened slightly to avoid potential platform-sensitivity issues with the drug reference; original humour preserved as "what's in your dog's water bowl" implication. If exact irreverence is preferred, consider "köpeğinize ne veriyor musunuz?" (what are you giving your dog?).

- **`heroglyph.flow.breed.cat.05`** — "Schnozzers" (dogs with prominent noses) translated as "Uzun Burunlular" (Long-nosed ones). The EN is a playful invented word; the TR is descriptive rather than equally coined. No better Turkish neologism found with confidence.

- **`heroglyph.flow.breed.cat.07`** — "Smushfaces" translated as "Basık Yüzlüler" (flat-faced ones). Same issue — descriptive rather than playful neologism.

- **`vision.beat.symbol.bigW`** — EN source is "THE" (as in "THE SYMBOL"). Translated as "O" (Turkish demonstrative "that/the"), which works as a dramatic headline split "O / SEMBOL" (That Symbol). Confirm this feels right visually given the big-word display format.

- **`about.milestone.3.body`** — Book title „Cesta s Hrdinom" kept in original Slovak as it is a proper title of a published work.

- **`religion.book.titleThe`** — EN value is "The" (article before "Dogypt Constitution"). Turkish does not use articles; value left as empty string `""` to avoid inserting a stray word. The brand sequence reads: "" + "Dogypt" + "Anayasası" → "Dogypt Anayasası". Confirm the template handles empty string without rendering a space artifact.

- **`heroglyph.flow.dogCharacter.trait.waterlover`** / `slide.waterlover.title`** — "Waterlover" kept as concept "Su Severi" (water-lover). Works naturally in Turkish.

- **`about.crawl.p6`** / **`welcome.missionMotto`** — Both contain "IN DOG WE TRUST" in EN. Kept EN per brand rules (these appear to be explicit brand motto uses rather than translated UI strings). Only the `religion.preamble` keys received the translated motto.
