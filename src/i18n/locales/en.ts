/**
 * DOGYPT i18n — EN master dictionary (zdroj pravdy typu Dict).
 *
 * FLAT dotted kľúče. Hodnoty s `<span class="wf-hl">…</span>` / inline štýlom sú HTML
 * a renderujú sa cez dangerouslySetInnerHTML (rovnaký pattern ako pôvodný kód).
 *
 * Brand termíny ostávajú EN naprieč jazykmi (Heroglyph / Dogyptian / Pack / DOGYPT,
 * + slovná hračka „DOG" ako jazyk lásky).
 *
 * Pridať stránku = nový blok kľúčov tu + zodpovedajúce kľúče v ostatných locale.
 */
export const en = {
  // ── /vision — hero ──
  'vision.hero.title': 'The Vision',
  'vision.hero.watch': 'Watch Dogypt Intro Movie',
  'vision.hero.videoTitle': 'DOGYPT Intro Movie',
  'vision.hero.playLabel': 'Play Dogypt Intro Movie',

  // ── /vision — WHAT IF beats ──
  // beat 0 (intro)
  'vision.beat.dream.bigW': 'I HAD',
  'vision.beat.dream.bigG': 'A DREAM',
  'vision.beat.dream.tag': 'I HAD A DREAM',
  'vision.intro.lead':
    'In 2018, I had a <span class="wf-hl">vision</span> of how to <span class="wf-hl">save every dog on Earth</span>. And it\'s actually simple — every doglover <span class="wf-hl">unites into one community</span>, one that sees a dog as <span class="wf-hl">more than just an animal</span>. So here we are…',

  // beat 1
  'vision.beat.symbol.bigW': 'THE',
  'vision.beat.symbol.bigG': 'SYMBOL',
  'vision.beat.symbol.tag': 'THE SYMBOL',
  'vision.beat.symbol.h':
    'Our language of love is <span class="wf-hl">DOG</span>. And beyond its ordinary name, every dog carries its own <span class="wf-hl">unique symbol</span> — the <span class="wf-hl">HEROGLYPH</span>. It\'s a <span class="wf-hl">universal language</span>, a <span class="wf-hl">sacred tool</span> to unite every doglover on Earth.',

  // beat 2
  'vision.beat.nation.bigW': 'A DOG',
  'vision.beat.nation.bigG': 'NATION',
  'vision.beat.nation.tag': 'A DOG NATION',
  'vision.beat.nation.h':
    'Let\'s make a <span class="wf-hl">miracle</span>. Our first milestone: to unite <span class="wf-hl">a million doglovers</span>. Imagine the <span class="wf-hl">sheer power</span> we\'d hold together — everything we could do for ourselves, our dogs, and <span class="wf-hl">dogs in need</span>, beyond any state. <span class="wf-hl">We would be the state.</span>',

  // beat 3
  'vision.beat.temple.bigW': 'DIGITAL',
  'vision.beat.temple.bigG': 'TEMPLE',
  'vision.beat.temple.tag': 'DIGITAL TEMPLE',
  'vision.beat.temple.h':
    'One app, <span class="wf-hl">only for real doglovers</span> — no fake people. The first <span class="wf-hl">dog-friendly digital world</span> built just for us: a social home, and an ecosystem that truly helps — <span class="wf-hl">travel, vets, services, education</span>, and <span class="wf-hl">fundraisers</span> for dogs in need.',

  // beat 4
  'vision.beat.centers.bigW': 'REAL',
  'vision.beat.centers.bigG': 'CENTERS',
  'vision.beat.centers.tag': 'REAL CENTERS',
  'vision.beat.centers.h':
    'The old shelter managed misery. The <span class="wf-hl">sanctuary</span> ends it. Real centers across the world for <span class="wf-hl">care, training, and research</span> — financed <span class="wf-hl">in the open</span>, every account on the table.',

  // beat 5
  'vision.beat.era.bigW': 'A NEW',
  'vision.beat.era.bigG': 'ERA',
  'vision.beat.era.tag': 'A NEW ERA',
  'vision.beat.era.h':
    'Beyond borders and politics, doglovers are Earth\'s <span class="wf-hl">kindest hidden force</span>. Only together can we <span class="wf-hl">rebuild the system</span> and change the world — and leave behind something that protects our dogs <span class="wf-hl">forever</span>.',

  // ── /vision — finale CTA ──
  'vision.finale.title': 'What if…',
  'vision.finale.lead':
    '…every doglover said <span style="color:#F5C73D;font-style:italic">yes</span> to one crazy idea?',
  'vision.finale.cta': 'Become Dogyptian',
  'vision.finale.tagline': 'A new era is just one click away.',
} as const;
