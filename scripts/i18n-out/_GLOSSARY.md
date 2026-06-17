# DOGYPT translation — shared rules for all agents (2026-06-17 launch)

You translate UI strings for the DOGYPT web app (a satirical "dog religion" movement, Pastafarian model: meaningful absurdity + satire + real facts). Tone: missionary, warm, witty, self-aware. NOT corporate, NOT startup-hype, NO "buy now".

## OUTPUT
Write ONLY a JSON file `scripts/i18n-out/translated-<CODE>.json` = `{ "<key>": "<translation>", ... }` with the SAME keys you were given, values translated into the target language. Valid JSON, UTF-8. Nothing else in it.

## DO-NOT-TRANSLATE (keep EN verbatim, exact casing)
DOGYPT · DOGYPTISM · Dogyptism · Dogyptian · DOGMA · Heroglyph (NEVER "hieroglyph") · Hekthor · DEVOTION · bones · Pack · Eternal Pack · all domains (dogypt.com, DOGYPT.com, woof@dogypt.com) · proper names of quoted people/breeds.
- "GOD is DOG" wordplay → keep EN (the text itself admits it's a pun). May stay EN inside a translated sentence.
- "pawtner" / similar untranslatable puns → keep EN.

## MOTTO "IN DOG WE TRUST" — TRANSLATE per language (Matej decision 2026-06-17)
It parodies the US motto "In God We Trust" (God→Dog). GOAL: render the LOCAL equivalent of "In God We Trust" with God swapped to Dog, so a native speaker hears the parody.
- Example DE: "Auf Gott vertrauen wir" → "Auf Hund vertrauen wir".
- Keep brand prefix parts (e.g. "DOGYPT · ") as-is, translate only the motto part.
- The motto is SPLIT across keys in the religion headline: `religion.preamble.headlineGrad` ("In Dog") + `religion.preamble.headlineLine` ("We Trust") — translate as ONE coherent phrase split at a natural point; no stray spaces.
- **If the parody does NOT work naturally in your language** (no recognizable "In God We Trust" equivalent, or the swap sounds wrong) → still give your BEST rendering, but ADD an entry in `scripts/i18n-out/flags-<CODE>.md` explaining the issue + your options. These get human review before deploy.

## PRESERVE EXACTLY
- HTML inside values: `<span class="wf-hl">…</span>`, inline `style="…"`, `<br/>`, etc. Translate only the human text between tags. Keep tags/classes/attributes byte-identical.
- Interpolation placeholders: `{dogName}`, `{count}`, `{n}`, `{name}` — keep exactly, never translate or reorder away from meaning.
- Leading/trailing spaces in "sentence-fragment" keys (e.g. questionPrefix " like?") — keep them; they concatenate with siblings.

## STYLE
- "dog lover" → natural native equivalent (NOT "dog people"/"dog person"). SK psíčkar, CS pejskař, etc.
- Headings can overflow — prefer concise wording; if a heading is long in EN, a tight synonym is better than a literal long phrase.
- Match register: playful slide descriptions stay playful; legal/privacy sections stay precise.
- Non-Latin scripts (zh/ja/ko/hi) + RTL (ar): translate fully into native script. (Font fallback is handled in CSS separately.)

## FLAGS
Anything you are <95% sure about (motto, puns, ambiguous source, cultural mismatch) → one line in `scripts/i18n-out/flags-<CODE>.md`. Better to flag than to guess silently.
