import type { Dict } from '../LanguageContext';

/**
 * DOGYPT i18n — SK slovník. Partial<Dict>: chýbajúci kľúč ticho padne na EN.
 *
 * Brand termíny ostávajú: HEROGLYPH, Dogypt, DOGYPT.
 * „doglover" = psíčkar (konzistentne s Matejovým tónom).
 *
 * Texty = Matejova ručná úprava 2026-06-07 (prvý strojový draft prepísaný).
 * PRAVIDLO (Matej 2026-06-07): „DOG" sa v bežnom texte PREKLADÁ (→ PES), ale MOTTO
 *   sa nikdy nemení — „DOG IS GOD" / brand motto ostáva vždy EN naprieč jazykmi.
 * Vyriešené: beat 1 „PES" OK (text, nie motto); beat 3 „dog-friendly" (bol preklep).
 * OTVORENÉ (čakajú Mateja):
 *   - finále lead: „áno" ostáva malými (zlatá kurzíva už zvýrazňuje); Matej napísal „ÁNO".
 *   - finále CTA „Staň sa Dogypťanom" — Matej ešte nevybral (alt: „Pridaj sa" / nechať EN).
 */
export const sk: Partial<Dict> = {
  // ── /vision — hero ──
  'vision.hero.title': 'Vízia',
  'vision.hero.watch': 'Pozri Dogypt intro film',
  'vision.hero.videoTitle': 'DOGYPT intro film',
  'vision.hero.playLabel': 'Prehrať Dogypt intro film',

  // ── /vision — WHAT IF beaty ──
  // beat 0 (intro)
  'vision.beat.dream.bigW': 'MAL SOM',
  'vision.beat.dream.bigG': 'SEN',
  'vision.beat.dream.tag': 'MAL SOM SEN',
  'vision.intro.lead':
    'V roku 2018 som mal <span class="wf-hl">víziu</span>, ako <span class="wf-hl">zachrániť každého psa na Zemi</span>. Je to vlastne celkom „jednoduché" — stačí ak sa psíčkari <span class="wf-hl">spoja do jednej komunity</span>, takej, ktorá vidí psa ako <span class="wf-hl">viac než len zviera</span>. A tak sme tu…',

  // beat 1
  'vision.beat.symbol.bigW': 'NÁŠ',
  'vision.beat.symbol.bigG': 'SYMBOL',
  'vision.beat.symbol.tag': 'SYMBOL',
  'vision.beat.symbol.h':
    'Náš jazyk lásky je <span class="wf-hl">PES</span>. Ten okrem svojho bežného mena nesie aj svoj vlastný <span class="wf-hl">jedinečný symbol</span> — <span class="wf-hl">HEROGLYPH</span>. Je to <span class="wf-hl">univerzálny jazyk</span>, <span class="wf-hl">posvätný nástroj</span>, ktorý má za cieľ spojiť každého psíčkara na Zemi.',

  // beat 2
  'vision.beat.nation.bigW': 'PSÍ',
  'vision.beat.nation.bigG': 'NÁROD',
  'vision.beat.nation.tag': 'PSÍ NÁROD',
  'vision.beat.nation.h':
    'Spravme <span class="wf-hl">zázrak</span>. Náš prvý míľnik: spojiť <span class="wf-hl">milión psíčkarov</span>. Predstav si tú <span class="wf-hl">čistú silu</span>, ktorú by sme spolu mali — čo všetko by sme dokázali pre nás, naše psy a <span class="wf-hl">psy v núdzi</span>, a to nad rámec akéhokoľvek štátu. <span class="wf-hl">My by sme boli štát.</span>',

  // beat 3
  'vision.beat.temple.bigW': 'ONLINE',
  'vision.beat.temple.bigG': 'CHRÁM',
  'vision.beat.temple.tag': 'ONLINE CHRÁM',
  'vision.beat.temple.h':
    'Jedna appka, <span class="wf-hl">len pre skutočných psíčkarov</span> — žiadni falošní ľudia. Prvý <span class="wf-hl">dog-friendly digitálny svet</span> vytvorený len pre nás: sociálna sieť a ekosystém, ktorý naozaj pomáha — <span class="wf-hl">cestovanie, veterinári, služby, vzdelávanie</span> a <span class="wf-hl">zbierky</span> pre psy v núdzi na jednom mieste.',

  // beat 4
  'vision.beat.centers.bigW': 'FUNKČNÉ',
  'vision.beat.centers.bigG': 'STREDISKÁ',
  'vision.beat.centers.tag': 'FUNKČNÉ STREDISKÁ',
  'vision.beat.centers.h':
    'Starý koncept útulkov funguje len veľmi ťažko… Predstav si <span class="wf-hl">centrá po celom svete</span>, kde by psy mali svoju <span class="wf-hl">zmysluplnú prácu</span>, a ľudia, ktorí by sa im venovali, by boli <span class="wf-hl">financovaní nami</span> — starostlivosť, výcvik a výskum.',

  // beat 5
  'vision.beat.era.bigW': 'NOVÁ',
  'vision.beat.era.bigG': 'ÉRA',
  'vision.beat.era.tag': 'NOVÁ ÉRA',
  'vision.beat.era.h':
    'Nad rámec štátnych hraníc a politiky sú psíčkari <span class="wf-hl">najláskavejšou skrytou silou</span> Zeme. Len spolu dokážeme <span class="wf-hl">prebudovať systém</span>, zmeniť svet — a zanechať niečo, čo <span class="wf-hl">ochráni naše psy navždy</span>.',

  // ── /vision — finále CTA ──
  'vision.finale.title': 'Čo ak by…',
  'vision.finale.lead':
    '…každý psíčkar povedal <span style="color:#F5C73D;font-style:italic">áno</span> tomuto bláznivému nápadu?',
  'vision.finale.cta': 'Staň sa Dogypťanom',
  'vision.finale.tagline': 'Od novej éry ťa delí jeden klik.',
};
