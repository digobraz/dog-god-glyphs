# Translation flags — Arabic (ara)

## MOTTO: "IN DOG WE TRUST"

**Source split:**
- `religion.preamble.headlineGrad` = "In Dog" → translated as **"بالكلب"**
- `religion.preamble.headlineLine` = "We Trust" → translated as **"نؤمن"**

**Full motto rendered:** بالكلب نؤمن

**Cultural sensitivity flag — REVIEW REQUIRED.**

Arabic is the sacred language of the Quran. The phrase "In God We Trust" maps directly to the Islamic declaration of faith (Tawhid / Shahada language). The standard Arabic rendering of "In God We Trust" is **"بالله نؤمن"** (Bi-llāhi nu'min) or **"نثق بالله"** (nathaqu bi-llāh).

The parody swap: Allāh (الله) → kalb (كلب / "dog").

**This is HIGH sensitivity.** In Islamic culture and Arabic-speaking societies, the word "dog" (كلب) is not just a neutral animal term — it carries a derogatory connotation in many dialects and contexts. Pairing it with sacred-language constructions ("بالكلب نؤمن") mimics Quranic/Islamic creedal formulas and may be read as blasphemous rather than humorous satire, even by secular Arabic speakers.

**My rendering "بالكلب نؤمن" (Bi-l-kalb nu'min)** is grammatically correct and achieves the parodic parallel, but the cultural reception may range from amused to deeply offended.

**Options considered:**
1. **"بالكلب نؤمن"** (chosen) — Direct parallel, maximal parody effect, highest sensitivity risk.
2. **"ثقتنا في الكلب"** (Thiqatunā fi-l-kalb) — "Our trust is in the dog" — softer, less creedal-sounding.
3. Keep the EN motto "IN DOG WE TRUST" untranslated on the Arabic page — safe but loses the parody for Arabic readers.

**Recommendation:** Human review before deploy. If audience is global/diaspora with irony-aware framing, option 1 works. If reaching conservative Arabic-speaking regions, consider option 3 or a disclaimer framing.

---

## Other motto occurrences translated consistently:

- `welcome.missionMotto` → "بالكلب نؤمن." (same flag applies)
- `about.crawl.p6` → "بالكلب نؤمن." (same flag applies)
- `about.footer.motto` → "بالكلب نؤمن." (same flag applies)
- `heroglyph.intro.pill.vow.tooltip` → "...بالكلب نؤمن!" (same flag applies)
- `legal.motto` → "DOGYPT · بالكلب نؤمن" (same flag applies)
- `religion.book.trust` → "بالكلب نؤمن" (same flag applies)

---

## Cultural / translation notes (<95% certainty)

**`heroglyph.flow.photo.faceOfGodPrefix` / `faceOfGodWord` / `faceOfGodSuffix`**
EN: "A FACE OF A GOD" split into prefix="A", word="FACE", suffix="OF A GOD".
Arabic: "وجه" (face) + "إله" (god) + "" (empty suffix, folded into word).
The English uses three fragment keys that concatenate into a display. Arabic RTL rendering may require reordering in CSS; I translated each fragment as best I could while keeping meaning, but the visual concatenation needs UI testing. FLAG: layout may break in RTL context — confirm concatenation order with developer.

**`heroglyph.flow.dogHeroglyphTitle`** = `"{dogName}'S HEROGLYPH"`
Arabic possessive requires suffix (-'s equivalent). I rendered as "HEROGLYPH {dogName}" because Arabic genitive construction would need restructuring of the sentence. The placeholder {dogName} stays intact. The English possessive 's has no direct Arabic equivalent as a suffix — the natural Arabic form is "Heroglyph [name]" (إضافة). This is slightly informal but works for UI display.

**`heroglyph.flow.ownerFinal.messageLine3Prefix` / `messageLine3Suffix`**
EN: "Now let's finish the HEROGLYPH with [dogName]'s part."
Split as prefix = "Now let's finish the HEROGLYPH with" / suffix = "'s part."
Arabic: prefix = "الآن لنُكمل HEROGLYPH بجزء" / suffix = "."
The {dogName} placeholder sits between them; Arabic possessive for the suffix ("جزء [dogName]" = "[name]'s part") was handled by collapsing the suffix to a period and building the possessive into the prefix construction. UI testing needed.

**`heroglyph.checkout.dogPossessive`** = `"{dogName}'s"`
Kept as `"{dogName}'s"` — Arabic genitive/possessive suffix on a variable Latin-script name is not natural. The English form is retained since this is a display fragment concatenated with "HEROGLYPH" in the UI and keeping EN form is consistent with how the app shows dog names in Latin script.

**`heroglyph.flow.photo.next` / `heroglyph.flow.photo.back`**
EN arrows: "NEXT →" and "← BACK". In RTL Arabic, directional arrows should logically flip (→ becomes ← and vice versa). I have mirrored the arrows accordingly: "التالي ←" and "→ رجوع". Confirm with developer that CSS/HTML doesn't also flip arrow glyphs via `dir="rtl"`, which would double-flip them.

**`heroglyph.flow.message.cta`** = "SEAL THE MESSAGE →"
Rendered as "← اختم الرسالة" (RTL arrow flip). Same developer confirmation needed.

**`heroglyph.checkout.cta`** = "CONTINUE TO PAYMENT →"
Rendered as "← المتابعة للدفع". Same RTL arrow note.

**`welcome.cta.enter`** = "ENTER THE GODS →"
Rendered as "← ادخل عالم الآلهة". RTL flip applied.

**`heroglyph.flow.ownerZodiac.animal.Pig`** = "Pig" → "الخنزير"
In Islamic culture, the pig is considered impure (haram). The Chinese zodiac pig year is a neutral astrological concept, but the word "خنزير" in Arabic has strong negative connotations beyond the zodiac context. No good alternative — it is the standard Arabic term for the zodiac animal. Flagging for awareness; most Arabic users who engage with Chinese zodiac will understand the cultural context.

**`religion.book.titleThe` / `religion.book.titleBrand` / `religion.book.titleConstitution`**
EN: "The" / "Dogypt" / "Constitution" — displayed as a three-line book title.
I rendered: "دستور" / "Dogypt" / "الكامل" which reads "Constitution / Dogypt / The Complete" — this is a bit awkward but maintains three-fragment structure. A natural reading "دستور Dogypt" loses the The/brand/title visual split. Recommend human review of this display choice.

**`login.magicLink.placeholder` / `login.forgot.placeholder`** = "your@email.com"
Rendered as "بريدك@هنا.com" — a loose Arabic adaptation of the placeholder. The @ sign and .com remain in Latin script as they are technical conventions. This is standard practice; no issue.

**`about.crawl.p5`** — Contains "And you can be part of it. Because the only ones crazy enough to believe they can change the world are the ones who do." — this is a paraphrase of the Steve Jobs/Apple "Here's to the crazy ones" quote. Translated into natural MSA; no attribution required in translation.

**`religion.preamble.text`** — Preamble text contains Quranic-adjacent language patterns (echoes of constitutional/religious proclamations). The Arabic translation of this is intentionally written in elevated MSA that echoes constitutional rhetoric, which fits the parody-religion tone but may read as more serious in Arabic than in English. Flagging for tone review.

---

## Key count verification
Total keys in master-en.json: 680
Total keys in translated-ara.json: 680
All keys present. ✓
