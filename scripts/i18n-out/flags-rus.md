# Translation flags — Russian (rus)

## MOTTO: "In Dog We Trust"

**Keys:** `religion.preamble.headlineGrad`, `religion.preamble.headlineLine`, `religion.book.trust`, `legal.motto`, `about.footer.motto`

**Issue:** Russian has no single universally recognized state motto equivalent to the US "In God We Trust". The closest canonical phrase is "На Бога уповаем" (Church-Slavonic/literary register) or "Уповаем на Бога" — recognizable to educated speakers, but not a pop-culture reflex like the US original.

**Chosen rendering:** "На Пса уповаем" (God → Пса = genitive of пёс/dog).

- Split for headline keys: `headlineGrad` = "На Пса" / `headlineLine` = "Уповаем" — grammatically coherent when combined.
- The parody lands for speakers who know "На Бога уповаем", but the recognition rate is lower than in EN/DE. A Russian speaker unfamiliar with the phrase will read it as "We put our trust in the Dog" — which still works as a Dogyptism statement, but may not register as a parody of the US motto.

**Options considered:**
1. "На Пса уповаем" ← chosen (most idiomatic Church-Slavonic echo)
2. "На Пса надеемся" (colloquial, loses archaic parody feel)
3. Keep EN "In Dog We Trust" verbatim (loses localization intent)

**Recommendation:** Human review before deploy. Option 1 is the best translation, but confidence on parody recognition is ~80%.

---

## `heroglyph.flow.dogCharacter.slide.maverick.title`

**EN:** "Maverick (Pirate Sign)"
**RU:** "Maverick (Пиратский знак)"

"Maverick" kept in EN as it is a character archetype name that arguably functions as a brand term (like the other titles which are translated). Could also be "Независимый (Пиратский знак)" or "Бунтарь (Пиратский знак)". Kept EN for consistency with the character identity, but worth confirming whether character titles should be fully translated.

---

## `heroglyph.flow.dogCharacter.slide.chiller.title`

**EN:** "Chiller (Sofa)"
**RU:** "Чиллер (Диван)"

"Чиллер" is a phonetic transliteration of "Chiller" — used in Russian youth/internet culture. More formal option: "Лежебока (Диван)" or "Расслабон (Диван)". Transliteration preserves the brand feel of the archetype names; flagging in case a more Russian-native word is preferred.

---

## `transparency.part.affiliate`

**EN:** "Affiliate"
**RU:** "Affiliate" (kept EN)

"Affiliate" as a business/revenue model term is widely used in Russian digital marketing unchanged ("аффилиат" is also used). Kept EN to match glossary pattern of keeping brand/technical terms. If a Russian word is preferred: "Партнёрская программа" or "Реферальная программа".
