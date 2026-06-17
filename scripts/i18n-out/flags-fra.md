# Translation flags — French (fra)

## MOTTO: "In Dog We Trust"

**Keys:** `religion.preamble.headlineGrad` / `religion.preamble.headlineLine` / `religion.book.trust` / `legal.motto` / `about.footer.motto`

**Parody analysis:** The French equivalent of "In God We Trust" is not an official state motto (France is secular). The phrase is known to francophones mainly as the US motto, typically rendered as "En Dieu nous faisons confiance" or "Nous croyons en Dieu". The swap God→Dog becomes Dieu→Chien.

**Rendering chosen:** "En Chien Nous Faisons Confiance" (split: "En Chien" / "Nous Faisons Confiance").

**Issue:** Because France has no equivalent constitutional motto, the parody relies on recognizing the US motto in French translation — a culturally indirect reference. The swap (Dieu→Chien) is phonetically and semantically clear but the source phrase may not land instantly for all francophones. Alternative renderings considered:
- "En Chien nous croyons" (more literal God→belief phrasing, shorter, punchier)
- "Aie confiance en le Chien" (echoes Jungle Book — unintended reference)

**Recommendation:** "En Chien nous croyons" may feel punchier and more self-contained. Human review advised before deploy.

---

## `heroglyph.flow.dogCharacter.slide.waterlover.title` — "Waterlover (Vagues)"

**Note:** "Waterlover" kept verbatim per DO-NOT-TRANSLATE logic (it is a character archetype name used consistently across all languages). Confirmed intentional.

---

## `heroglyph.flow.dogCharacter.slide.chiller.title` — "Chiller (Canapé)"

**Note:** "Chiller" kept verbatim (EN archetype name). "Canapé" chosen for "Sofa" — standard FR term; "sofa" also valid and widely understood in FR. No strong flag, noting for awareness.

---

## `religion.book.titleThe` — "La"

**Note:** "La Constitution" uses feminine article "La". If the layout concatenates `titleThe + " " + titleBrand + " " + titleConstitution`, the result is "La Dogypt Constitution" which is grammatically acceptable (DOGYPT acts as a proper noun modifier). If layout is `titleThe + " " + titleConstitution`, result is "La Constitution" — correct. Flagging in case word order or article gender creates layout issues.

---

## `about.council.consent` — consent text

**Note:** Legal/consent strings should be reviewed by a native FR speaker familiar with RGPD (GDPR FR) compliance wording. The translation is natural but not legally validated.
