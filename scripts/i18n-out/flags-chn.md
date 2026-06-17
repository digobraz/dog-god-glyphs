# Flags — zh-CN (chn) — 2026-06-17

## MOTTO: "IN DOG WE TRUST" → "信犬不渝"

**Decision:** Split across `religion.preamble.headlineGrad` = "信犬" and `religion.preamble.headlineLine` = "不渝".

**Rationale:** Chinese does not have a widely recognized "In God We Trust" equivalent the way Western cultures do. The closest concept is the US motto itself, which most educated Chinese speakers know as "我们信仰上帝" or "唯信上帝". A direct swap "我们信仰狗" works but is cumbersome and unpoetic.

**Chosen rendering:** 信犬不渝 — literally "faithful to Dog, unwaveringly." It echoes the classical four-character chengyu structure (like 信守承诺, 矢志不渝), sounds solemn and authentic in Mandarin, and carries the religious/oath register. The "God→Dog" pun is lost in Chinese since 神 (shén, god) and 狗 (gǒu, dog) share no phonetic resemblance — but the gravity of the phrase compensates.

**Alternative considered:** 天佑犬民 ("Heaven protects the dog people" — parodies "God Bless America" / 天佑吾民 register). This is more recognizable as a motto-parody but shifts meaning away from "trust/faith." Flagged for human review.

**Also applied consistently in:** `religion.book.trust`, `legal.motto`, `about.footer.motto`, `welcome.missionMotto`.

---

## `religion.hook.number` — "1.2" billion

EN source uses "1.2" as a standalone number with "BILLION" and "PEOPLE" as separate keys. Chinese renders 1.2 billion as 12亿, so `religion.hook.number` = "12" and `religion.hook.billion` = "亿". This splits differently than EN — the number+unit pair changes. **Flagged: confirm the layout handles zh number+unit concatenation correctly** (12亿人 vs. 1.2 BILLION PEOPLE).

---

## `heroglyph.flow.photo.faceOfGodSuffix`

EN value is "OF A GOD" — but in this split ("A" prefix + "FACE" word + "OF A GOD" suffix), Chinese renders as: prefix="一张", word="神颜", suffix="" (empty string). The suffix is absorbed into the word to keep the phrase natural (一张神颜). Flagged in case the UI concatenates these three parts with visible spacing — the suffix is intentionally left empty.

---

## `heroglyph.flow.dogBloodline.aristocrat` / `.mutt`

Kept as "Aristocrat" and "Mutt" (EN verbatim). Rationale: these are displayed as badge labels directly associated with the HEROGLYPH symbol names. No explicit "keep EN" rule in glossary, but translating them risks mismatching with the visual symbol. **Flagged: confirm whether these badge labels should be localized** (potential translations: 纯血贵族 / 混血浪客).

---

## `about.origin.title`

EN: "The<br />Origin" — translated as "起源<br />故事" (Origin Story). The `<br/>` is preserved. "故事" (story) was added for natural flow since standalone "起源" (origin) reads abrupt in Chinese. Flagged in case a tighter single-word heading is preferred: "起源" alone is acceptable.

---

## `heroglyph.intro.pill.vow.tooltip`

Contains "IN DOG WE TRUST!" — left in EN as a brand motto signature, consistent with the motto strategy (phrase kept as English exclamation inside a Chinese sentence). The surrounding text is translated.

---

## `about.crawl.p6` / `welcome.missionMotto`

"IN DOG WE TRUST." and "IN DOG WE TRUST。" — these two motto occurrences are left fully in EN (as standalone exclamatory lines), distinct from the split motto in `religion.preamble.*` which gets the Chinese rendering. Rationale: standalone motto-as-slogan in all-caps is a brand element; the religion section headline is a semantic translation target. **Flagged: confirm this two-track approach (EN standalone slogan vs. translated religion headline) is acceptable.**
