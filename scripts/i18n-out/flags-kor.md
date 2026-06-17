# Flags — Korean (kor)

## MOTTO: "IN DOG WE TRUST"

**Source:** "In God We Trust" (US motto) with God→Dog swap.

**Issue:** Korean has no equivalent of "In God We Trust" as a culturally recognized phrase. The US motto is not embedded in Korean public consciousness the way it is in English-speaking countries, so the parody is lost on most Korean readers.

**Translation chosen:**
- `religion.preamble.headlineGrad` → "개를 믿어요" ("We believe in the dog" / "We trust the dog")
- `religion.preamble.headlineLine` → "우리는" ("We")

Read together: **"우리는 개를 믿어요"** ("We trust in the dog / We believe in the dog")

**Problem:** The split feels grammatically awkward — in Korean, "우리는" (subject) comes before "개를 믿어요" (predicate), so visually the headline order is reversed from the natural reading order. Options:

1. Keep as-is (subject on line 2, predicate on line 1) — dramatic visual split, but grammatically inverted.
2. Swap: line1 = "우리는", line2 = "개를 믿어요" — grammatically natural, but requires checking with the UI team that this split point works visually.
3. Single phrase approach: "개를 믿는다" (literary/declarative register, stronger tone).

**Recommendation:** Option 2 or 3. Needs human review before deploy.

**Also used in:**
- `about.crawl.p6` → "개를 믿습니다." (formal/polite register, standalone line — slightly different register for narrative context; flagging for consistency check)
- `welcome.missionMotto` → "개를 믿습니다." (same)
- `about.footer.motto` → "개를 믿습니다." (same)
- `legal.motto` → "DOGYPT · 개를 믿습니다" (same)

Consistency note: motto appears in 4 registers across the file (headline split vs. standalone sentence). All standalone uses use "개를 믿습니다" (formal polite) — this is consistent. The headline split is the only uncertain case.

---

## Other flags (<95% confidence)

**`heroglyph.flow.photo.faceOfGodPrefix` + `faceOfGodWord` + `faceOfGodSuffix`**
- EN: "A FACE OF A GOD" split across 3 keys (prefix "A", word "FACE", suffix "OF A GOD")
- KO: "신의" + "얼굴" + "" — suffix left empty because Korean structure is: 신의(of God) + 얼굴(face), suffix not needed.
- Rendered: "신의 얼굴" — natural Korean. But if the UI concatenates these keys literally with spaces, the result "신의 얼굴 " may have a trailing space from the empty suffix. Worth checking.

**`heroglyph.flow.dogCharacter.trait.waterlover` and `slide.waterlover.title`**
- "Waterlover" is an invented DOGYPT term (portmanteau like "pawtner"). Kept EN per glossary rule on untranslatable puns/invented terms.

**`about.origin.title`**
- EN: `"The<br />Origin"` — translated as `"기원<br />"` (The origin — Korean doesn't need "The" article; "기원" = origin). The `<br />` is preserved but now appears after the word rather than splitting "The" from "Origin". If this breaks the visual split, consider `"기<br />원"` or `"그<br />기원"`. Needs visual check.

**`religion.hook.number` / `religion.hook.billion` / `religion.hook.people`**
- EN concatenates as "1.2 BILLION PEOPLE". Korean natural order: "12억 명의 사람들". Translated `number` as "12억", `billion` as "명", `people` as "사람들이" — but if these concatenate as-is, result would be "12억 명 사람들이" which is slightly redundant. Recommend keeping `billion` as "억" and `people` as "명" if the UI concatenates all three sequentially; human review advised.

**`heroglyph.flow.ownerInfo.greetingWord` = "hooman"**
- "hooman" is internet slang for "human" (from dog's perspective). Translated as "인간" (human) — loses the playful misspelling. No Korean equivalent of "hooman" spelling gag exists. Kept natural Korean; flagging as charm loss.

**`heroglyph.flow.dogFate.infoRaisedTitle` = "Baby Pacifier"**
- Translated as "아기 젖꼭지" — this is the literal term and may sound clinical. Alternative: "아기 노리개" (baby pacifier/toy). Flagging.

**`welcome.emailHint` = "DOGYPT is fur better"**
- Pun: "fur" = "far" (dog fur). No equivalent Korean pun exists. Translated as "DOGYPT는 훨씬 더 나아집니다" — pun is lost. Flagging.

**`about.legends.q.dwayne-johnson.text` = "lil' main man"**
- Casual affectionate English. Translated as "소중한 친구" (precious friend) — loses the masculine casual "main man" vibe. Acceptable but flagging.
