// SPACIE MIESTO — CHIPY „ČO SA TU DÁ". Jediný zdroj sady.
//
// Kánon: `plany/zadanie-aktivity-taxonomia.md` §14.2
// Matej 2026-08-27: „navrhni mi sadu, pošli mi sem tabuľku s rozpadom, schválime si to."
// „sú to miesta na kemping, spanie ktoré budú mať vlastné chipy ako napríklad (parkovanie,
//  či spanie v aute či je možné, alebo stan…)"
//
// 🅿️ NEODKLEPNUTÉ. Sada je NÁVRH postavený z reálnych OSM tagov na 738 spacích miestach,
// nie z hlavy. Odklepáva sa v matrici značiek (`npm run emoji-matrica`, sekcia „Spacie
// miesto — chipy"), kde sa dá chip vyradiť, premenovať aj pridať. Až po odklepnutí sa
// zapája do UI — dovtedy tento súbor nikto nevykresľuje.
//
// ── PREČO DRUH A CHIPY ZVLÁŠŤ ───────────────────────────────────────────────
// DRUH (`sleepSpots.ts`) je JEDNA voľba a nesie ikonu na mape. CHIPY sú „čo sa tu dá",
// viac naraz, a na mape sa nekreslia. Jeden plochý zoznam sedemnástich vecí by bol
// nečitateľný a človek by v ňom hľadal útulňu medzi sprchami.
//
// ── 🔴 OSM TIETO CHIPY NEVYPLNÍ ─────────────────────────────────────────────
// Percentá v komentároch sú POKRYTIE tagu na tých 738 bodoch. Najsilnejší má 22 %, väčšina
// 5–11 %. Naimportované miesto teda príde s menom, súradnicou a druhom — a chipy ostanú
// PRÁZDNE, kým ich niekto nedoplní. Vrstva je na štarte zoznam adries, nie sprievodca;
// prvú hodnotu jej dá Matejových pár útulní. Nie je to chyba importu, je to jeho strop.
//
// ── EMOJI ───────────────────────────────────────────────────────────────────
// Všetko Emoji 1.0 — to isté kritérium, kvôli ktorému 22. 8. padol 🪜.
// ⚠️ Zhody s inými sadami (⛺ kemp, 🌙 divoké miesto, 🅿️ parkovisko, 💧 prameň, 🔥 ohnisko)
// NIE SÚ kolízie: chipy sú FORMULÁR, tie ostatné sú MAPA, a na jednej ploche sa nestretnú.
// Naopak — chip „Stan" má vyzerať ako druh „Kemp", lebo hovorí o tom istom.
export type SleepChipGroup = 'build' | 'access' | 'has' | 'rules';

export const SLEEP_CHIPS: Array<{ id: string; label: string; emoji: string; group: SleepChipGroup }> = [
  // ČO TU POSTAVÍŠ
  { id: 'tent', label: 'Stan', emoji: '⛺', group: 'build' },              // OSM `tents` 11 %
  { id: 'van', label: 'Karavan / spanie v aute', emoji: '🚐', group: 'build' }, // `caravans` 10 %
  { id: 'bivouac', label: 'Bivak pod šírym nebom', emoji: '🌙', group: 'build' }, // OSM nepozná
  // AKO SA SEM DOSTANEŠ
  { id: 'parking', label: 'Zaparkuješ pri mieste', emoji: '🅿️', group: 'access' }, // `access` 14 %
  // ČO TU JE
  { id: 'water', label: 'Pitná voda', emoji: '💧', group: 'has' },         // `drinking_water` 7 %
  { id: 'fire', label: 'Ohnisko', emoji: '🔥', group: 'has' },             // `fireplace`+`openfire` 15 %
  { id: 'wc', label: 'WC', emoji: '🚻', group: 'has' },                    // `toilets` 5 %
  { id: 'shower', label: 'Sprcha', emoji: '🚿', group: 'has' },            // `shower` 6 %
  { id: 'power', label: 'Elektrina', emoji: '🔌', group: 'has' },          // `power_supply` 5 %
  // ➕ 27. 8. — PRIBUDOL SO ZLÚČENÍM DRUHOV, nie ako nápad navyše. Keď `lodge` („chata
  // s obsluhou") splynul s `hut`, zanikol jediný nosič informácie „niekto tam je a varí".
  // Bez tohto chipu by sa zlúčením stratila — a to je presne tá výmena, ktorú zlúčenie
  // sľubovalo opačne: druh hovorí ČO to je, chipy hovoria AKÝ je to obchod (`fee`, `meals`).
  { id: 'meals', label: 'Varia tu', emoji: '🍲', group: 'has' },           // OSM nepozná spoľahlivo
  // PRAVIDLÁ
  { id: 'fee', label: 'Platí sa', emoji: '💶', group: 'rules' },           // `fee` 22 % — najsilnejší
  // 🚩 PRÁVNE CITLIVÉ — čaká na Mateja. Voľné táborenie je v národných parkoch ZAKÁZANÉ,
  // takže CHÝBAJÚCI chip sa nesmie čítať ako „tak asi hej". Buď ostáva a pri druhu
  // „Divoké miesto" k nemu ide veta o zodpovednosti toho, kto tam ide, alebo sa chip
  // vypustí úplne a nechá sa to na text. Vedomá voľba, nie detail.
  { id: 'legal', label: 'Oficiálne povolené', emoji: '✅', group: 'rules' },
  // ⛔ JEDEN CHIP, A JE TO ZÁKAZ — Matej 27. 8. v matrici (prepísal „Pes bez obmedzení"
  // na „Zákaz pre psov" a „Pes len na vôdzke" vyradil).
  //
  // Návrh §14.2 mal „Pes bez obmedzení", návrh Clauda dvojicu s vôdzkou. Oboje padlo a je
  // to správne: v divočine je pes samozrejmosť, takže potvrdzujúci chip nepovie nič, a
  // vôdzka je medzistupeň, ktorý sa nedá overiť. Jediná informácia, ktorá zmení, či tam
  // človek s psom vôbec pôjde, je ZÁKAZ — a ten platí práve v platených kempoch.
  // Chýbajúci chip potom neznamená „asi hej", ale „nikto to nevyplnil".
  //
  // ⛔ (Emoji 1.0) nie je 🚫 z `MARK_EMOJI.noentry` — iné emoji, iná plocha, žiadna kolízia.
  { id: 'dogban', label: 'Zákaz pre psov', emoji: '⛔', group: 'rules' },
];
