import type { Dict } from '../LanguageContext';

/**
 * DOGYPT i18n — SK slovník. Partial<Dict>: chýbajúci kľúč ticho padne na EN.
 *
 * Brand termíny ostávajú: DOG (jazyk lásky), HEROGLYPH, Dogypt, DOGYPT.
 * „doglover" = psíčkar (konzistentne s Matejovým tónom).
 *
 * FLAG pre Mateja (brand-term rozhodnutie, čaká potvrdenie):
 *   - finale CTA „Become Dogyptian" → SK „Staň sa Dogypťanom" (DOGYPŤAN z CLAUDE.md).
 *     Ak má ostať EN „Become Dogyptian", zmaž kľúč `vision.finale.cta` → padne na EN.
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
    'V roku 2018 som mal <span class="wf-hl">víziu</span>, ako <span class="wf-hl">zachrániť každého psa na Zemi</span>. A je to vlastne jednoduché — každý psíčkar sa <span class="wf-hl">spojí do jednej komunity</span>, takej, ktorá vidí psa ako <span class="wf-hl">viac než len zviera</span>. Tak sme tu…',

  // beat 1
  'vision.beat.symbol.bigW': 'NÁŠ',
  'vision.beat.symbol.bigG': 'SYMBOL',
  'vision.beat.symbol.tag': 'SYMBOL',
  'vision.beat.symbol.h':
    'Náš jazyk lásky je <span class="wf-hl">DOG</span>. A okrem svojho bežného mena nesie každý pes svoj vlastný <span class="wf-hl">jedinečný symbol</span> — <span class="wf-hl">HEROGLYPH</span>. Je to <span class="wf-hl">univerzálny jazyk</span>, <span class="wf-hl">posvätný nástroj</span>, ktorý spojí každého psíčkara na Zemi.',

  // beat 2
  'vision.beat.nation.bigW': 'PSÍ',
  'vision.beat.nation.bigG': 'NÁROD',
  'vision.beat.nation.tag': 'PSÍ NÁROD',
  'vision.beat.nation.h':
    'Spravme <span class="wf-hl">zázrak</span>. Náš prvý míľnik: spojiť <span class="wf-hl">milión psíčkarov</span>. Predstav si <span class="wf-hl">čistú silu</span>, ktorú by sme spolu mali — všetko, čo by sme dokázali pre seba, naše psy a <span class="wf-hl">psy v núdzi</span>, nad rámec akéhokoľvek štátu. <span class="wf-hl">Boli by sme štát.</span>',

  // beat 3
  'vision.beat.temple.bigW': 'DIGITÁLNY',
  'vision.beat.temple.bigG': 'CHRÁM',
  'vision.beat.temple.tag': 'DIGITÁLNY CHRÁM',
  'vision.beat.temple.h':
    'Jedna appka, <span class="wf-hl">len pre skutočných psíčkarov</span> — žiadni falošní ľudia. Prvý <span class="wf-hl">psom prajný digitálny svet</span> vytvorený len pre nás: sociálny domov a ekosystém, ktorý naozaj pomáha — <span class="wf-hl">cestovanie, veterinári, služby, vzdelávanie</span> a <span class="wf-hl">zbierky</span> pre psy v núdzi.',

  // beat 4
  'vision.beat.centers.bigW': 'SKUTOČNÉ',
  'vision.beat.centers.bigG': 'CENTRÁ',
  'vision.beat.centers.tag': 'SKUTOČNÉ CENTRÁ',
  'vision.beat.centers.h':
    'Starý útulok spravoval biedu. <span class="wf-hl">Útočisko</span> ju ukončí. Skutočné centrá po celom svete na <span class="wf-hl">starostlivosť, výcvik a výskum</span> — financované <span class="wf-hl">otvorene</span>, každý účet na stole.',

  // beat 5
  'vision.beat.era.bigW': 'NOVÁ',
  'vision.beat.era.bigG': 'ÉRA',
  'vision.beat.era.tag': 'NOVÁ ÉRA',
  'vision.beat.era.h':
    'Nad rámec hraníc a politiky sú psíčkari <span class="wf-hl">najláskavejšou skrytou silou</span> Zeme. Len spolu dokážeme <span class="wf-hl">prebudovať systém</span> a zmeniť svet — a zanechať niečo, čo ochráni naše psy <span class="wf-hl">navždy</span>.',

  // ── /vision — finále CTA ──
  'vision.finale.title': 'Čo ak…',
  'vision.finale.lead':
    '…každý psíčkar povedal <span style="color:#F5C73D;font-style:italic">áno</span> jednému bláznivému nápadu?',
  'vision.finale.cta': 'Staň sa Dogypťanom',
  'vision.finale.tagline': 'Nová éra je vzdialená jeden klik.',
};
