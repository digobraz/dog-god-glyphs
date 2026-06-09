// Sacred verses — the "verse of the day" shown on /pack.
//
// COLLECTING GROUND: add new verses here, one object per verse. The /pack band
// rotates them deterministically by day-of-year, so the same verse shows all day
// and changes at midnight.
//
// ⚠️ EN STATUS (2026-06-09): the Constitution source (vystupy/constitution/index.html)
// is canonical in SK; the EN cleanup is still pending. Verses tagged `verified: true`
// are EN canon already live on the site. Verses tagged `verified: false` are FAITHFUL
// renderings of real SK doctrines — Matej should lock/replace the exact EN wording.
// Never invent doctrine: every verse must trace back to a real Constitution passage.

export type Verse = {
  text: string;
  ref: string;        // chapter / section it comes from
  verified?: boolean; // true = EN wording already canon; false = rendering pending Matej's lock
};

export const VERSES: Verse[] = [
  { text: 'GOD is DOG.', ref: 'Canon · The Theological Axiom', verified: true },
  { text: 'In dog we trust.', ref: 'Canon', verified: true },
  { text: 'A place where Dog is God.', ref: 'Canon', verified: true },

  { text: 'As you treat animals, so you are as a human.', ref: 'Commandments · The Ethical Axiom', verified: false },
  { text: 'A dog believes in his human — completely.', ref: 'Credo · Seven Truths About Dogs', verified: false },
  { text: 'The dog’s holiest gift to us is the gift of the present moment.', ref: 'Credo · The Present Moment', verified: false },
  { text: 'A dog with a heroglyph never dies — he lives on, in hearts and in DOGYPT.', ref: 'Hierarchy · The Eternal Pack', verified: false },
  { text: 'Fear is the first excuse — a Dogyptian strikes it from the dictionary.', ref: 'Commandments · The Seven Virtues', verified: false },
  { text: 'DOG-GOD is not an entity you worship — it is a principle you discover, every day, in your dog’s eyes.', ref: 'Credo · The DOG-GOD Philosophy', verified: false },
  { text: 'Dogyptism is not shown in words. It is shown in practice.', ref: 'Language · Identification', verified: false },
];
