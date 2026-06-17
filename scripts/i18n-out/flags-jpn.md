# Flags — Japanese (jpn)

## MOTTO: "IN DOG WE TRUST"

**Source keys:** `religion.preamble.headlineGrad` + `religion.preamble.headlineLine`
**EN original:** "In Dog We Trust" (parody of US motto "In God We Trust")

**Problem:** Japanese does not have a native "In God We Trust" equivalent that is widely recognized. The US motto is not a culturally embedded phrase in Japan, so the parody mechanism (swapping God→Dog) does not land in the same way for Japanese speakers.

**Approach taken:** Rendered as a two-part phrase:
- `headlineGrad`: 「犬を信じて」 ("Believe in Dog" / "Trusting in Dog")
- `headlineLine`: 「疑わない」 ("Without doubt" / "Never doubt")

Together: 「犬を信じて疑わない」 — natural Japanese expression meaning "trust in Dog completely / without question". This reads as a genuine statement of faith rather than a recognized parody, but carries the devotional weight.

**Alternative options considered:**
1. 「神ならぬ犬を信ぜよ」 — more archaic/formal, closer to biblical register; may feel stilted
2. 「犬こそ我らの神なり」 — "Dog is our God" — loses the "trust" element
3. Transliteration: 「イン・ドッグ・ウィー・トラスト」 — keeps EN sound, loses all meaning for Japanese readers

**Recommendation:** Current translation is semantically clear and devotionally appropriate but the parody punch is lost. Consider adding a small EN superscript or note "IN DOG WE TRUST" next to the Japanese phrase for audiences who know the US motto reference.

---

## Other flags (<95% confidence)

### `welcome.missionMotto` — "IN DOG WE TRUST."
Rendered as 「犬を信じよ。」 ("Trust in Dog." / "Believe in Dog.") — imperative form, punchy for a motto. Consistent with the preamble spirit but slightly different phrasing for variety. Human review recommended for consistency across all motto appearances.

### `about.crawl.p6` and `about.footer.motto`
Also rendered as 「犬を信じよ。」 and 「犬を信じよ。」 respectively — same reasoning applies.

### `religion.hook.billion` — "BILLION"
Rendered as 「億」 (100 million). Note: 1.2 billion = 12億 in Japanese counting. The key `religion.hook.number` is "1.2" and `religion.hook.billion` is "BILLION" — together they display as "1.2 BILLION". In Japanese this would naturally be 「12億」 but since the number and unit are separate keys, I translated only the unit. The combined display "1.2 億" may look odd to Japanese readers who expect "12億". Recommend either: (a) change `religion.hook.number` to "12" for JA locale, or (b) keep as-is and accept minor awkwardness.

### `heroglyph.flow.photo.faceOfGodPrefix` + `faceOfGodWord` + `faceOfGodSuffix`
EN: "A FACE OF A GOD" (split across three keys)
- Prefix: 「神の」 ("of God / the God's")
- Word: 「顔」 ("FACE")
- Suffix: 「」 (empty — the suffix "OF A GOD" is already absorbed into prefix in Japanese word order)

Japanese word order is SOV so the natural phrase is 「神の顔」 (God's Face). The suffix key was left empty to avoid duplication. This may need CSS/layout adjustment since the suffix key is empty and previously had content.

### `heroglyph.flow.breed.cat.*` — Playful breed category names
These are invented DOGYPT-specific category names (Furballs, Wooligans, Antennas, etc.). Translated with playful Japanese equivalents that preserve the whimsical tone:
- "Wooligans" → 「ウールっ子」 — not a standard word, invented for playfulness; may need refinement
- "Schnozzers" → 「鼻長犬」 ("long-nosed dogs") — functional but loses the invented-word charm
- "Smushfaces" → 「ぺちゃ顔族」 — natural Japanese colloquial for brachycephalic breeds

### `heroglyph.flow.ownerInfo.greetingWord` — "hooman"
Kept as "hooman" per glossary rules (untranslatable internet pun / brand term). Flagging for awareness.

### `about.legends.q.lady-gaga.text` — "BATPIG"
"BATPIG" is a made-up word for Asia's appearance (bat-pig looking dog). Kept as "BATPI" in translation — note: the original says "BATPIG" but this appears to be a deliberate dog breed nickname. Kept EN verbatim as a proper name/brand term.
