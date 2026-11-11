// SK preklad textov registra zdrojov (11. 11. 2026). Kľúč = `key` z VAULT_SOURCES. Čo tu chýba, ukáže sa po anglicky.
import type { VaultSource } from './vaultSources';
import { HIDDEN_SOURCES } from './vaultSources';

export type SourceSk = Partial<Pick<VaultSource, 'title' | 'extent' | 'about' | 'caveat' | 'disputed' | 'tags'>>;

export const VAULT_SOURCES_SK: Record<string, SourceSk> = {
  fd: {
    extent: '24 kapitol',
    tags: ['výživa', 'surové vs granule'],
    about:
      'Priemyselná psia miska rozobratá na súčiastky: z čoho sú granule, ako sa vyrábajú a čo s nimi urobí psie telo.',
    caveat:
      'Brady je za surovú stravu a proti priemyslu spracovaného krmiva. Chémia a fyziológia sú štandardné, závery sú jeho vlastné. Každý zvitok, ktorý taký záver nesie, to priznáva a pridáva protiváhu.',
  },
  hd: {
    extent: '8 kapitol',
    tags: ['byliny', 'telesné sústavy'],
    about:
      'Byliny orgán po orgáne: čo rastlina v tele robí a kedy je to zlý nápad.',
    caveat:
      'Kniha bylinkárky, nie klinická príručka. Väčšina toho, čo z nej berieme, je tradícia, nie dôkaz z klinických štúdií, a zvitky povedia, čo je čo.',
  },
  own: {
    title: 'AINUBIS SEED: napísané tu, nie prevzaté z knihy',
    tags: ['bezpečnosť', 'konsenzus'],
    about:
      'Bezpečnostná brána a všetko, na čo knihy neodpovedajú: čo je núdza, čo je jed a kde vysvetľovanie končí a začína veterinár.',
  },
  '4pfd': {
    tags: ['päť prvkov', 'energetika potravín'],
    about:
      'Čínska medicína pre psy a mačky od veterinárky: päť prvkov, páry orgánov, osem princípov a ako psa prečítať pohľadom.',
    caveat:
      'Kapitola 7 dáva do stredu misky obilniny a pripúšťa vegetariánskeho psa. To neberieme, prednosť má Feeding Dogs, a výnimka je v korpuse zapísaná ako samostatné zvitky, nie ako poznámka pod čiarou. Neprenášame ani dávky doplnkov a značkové receptúry.',
  },
  free: {
    tags: ['domáce varenie', 'vyváženie jedla'],
    about:
      'Príručka domáceho varenia: skupiny potravín, ako vyvážiť varené jedlo a ako prejsť na novú stravu.',
    caveat:
      'Lievik na platený kurz, s tvrdeniami bez citácií. Berieme len časť o varenej strave, ktorá korpusu inak chýba. Jej tvrdenia o surovej strave idú dnu ako postoj autora s protiváhou.',
  },
  tcm: {
    tags: ['tepelná povaha', 'tabuľky potravín'],
    about:
      'Päťstupňová tepelná škála potravín: čo zahrieva, čo ochladzuje a kde na nej sedí ktorá surovina.',
    caveat:
      'Systém pre ľudí, nie pre psy. Berieme len škálu a tabuľky potravín, psiu vrstvu dodáva The Herbal Dog, a kde je potravina pre psa toxická, tabuľka neplatí.',
  },
  long: {
    tags: ['dlhovekosť', 'bunková biológia'],
    about:
      'Čo myšlienka dlhovekosti naozaj tvrdí: bunky, oxidačný stres a koľko z toho platí pre psa.',
    caveat:
      'Marketingová e-kniha k doplnkom výživy. Nevyšlo z nej ani jedno meno produktu.',
  },
  ft1: {
    tags: ['prevencia', 'odpudzovače'],
    about:
      'Chemická prevencia a prírodné odpudzovače proti blchám, kliešťom a srdcovému červovi, vedľa seba.',
    caveat:
      'Platený obsah „Inside Scoop“, ktorý mieša tri veci: chemickú prevenciu, prírodné odpudzovače a detoxikačné protokoly. Prvé dve majú podstatu, tretia je ideológia a neberieme ju.',
  },
  keto: {
    tags: ['ketogénna diéta', 'rakovina psov'],
    about:
      'Ketogénna diéta pri rakovine psov: tvrdenie, mechanizmus a kde dôkazy naozaj stoja.',
    caveat:
      'Niekoľkým jej tvrdeniam zámerne odporujeme. Zvitky s protiváhou sú naše, nie z knihy.',
  },
  ft2: {
    tags: ['prevencia', 'blchy'],
    about:
      'Krátka príručka pre majiteľa o blchách a kliešťoch.',
    caveat:
      'V päte sú provízne odkazy, v korpuse nie je pomenovaný ani jeden produkt.',
  },
  'pending-1': {
    tags: ['výživa', 'imunita'],
    about: 'Ako jedlo zapína a vypína gény: imunita, zápal a plemená, ktoré za to platia.',
  },
  'pending-pes': {
    extent: 'úvod',
    tags: ['pes', 'kniha'],
    about: 'Česká encyklopédia psa. Z jej úvodu už žije 13 zvitkov Cesty psa, plemená prídu na rad ďalej.',
  },
  eli: {
    tags: ['výživa', 'prevencia'],
    about: 'Ako kŕmiť psy a mačky skutočným jedlom: prechod z granúl, čo kúpiť, ako to pripraviť a čo robiť, keď miska ostane plná.',
    caveat: 'Berieme kuchynské remeslo: prechod na čerstvú stravu, vápnik z vaječných škrupín, bezpečné rozmrazovanie, kliešte, núdzovú špajzu. Medicínu neberieme. Autorka píše zo skúseností s vlastnými zvieratami a zo „pro-metabolickej“ školy Raya Peata, nie z veterinárneho vzdelania, a pri vakcínach, tukoch a liekoch ide kniha proti väčšine dôkazov. Nižšie je presne kde, rozhodni sa podľa seba.',
    disputed: [
      { claim: 'Granule akéhokoľvek druhu sú hlavnou príčinou chorôb a predčasnej smrti.',
        evidence: 'Skôr neoverené než vyvrátené: žiadna dlhodobá štúdia neporovnáva dĺžku života psov na granulách a na čerstvej strave. Prikláňame sa na jej stranu, ale je to presvedčenie, nie meranie.' },
      { claim: 'Tuky omega-3 a omega-6 sú toxické a nie sú nevyhnutné.',
        evidence: 'Kyselina linolová (omega-6) je pre psy aj mačky esenciálna živina. Rybí olej má dôkazy z klinických štúdií pri artritíde a ochoreniach obličiek u psov. Pravdivé je len toto: zatuchnutý olej škodí.' },
      { claim: 'Vakcíny nechránia pred ničím.',
        evidence: 'Základné vakcíny (psinka, parvoviróza, hepatitída) chránia roky. Vlastné odporúčania veterinárov (WSAVA) hovoria preočkovať najčastejšie raz za tri roky, alebo namiesto toho zmerať protilátky. Očkovanie proti besnote vyžaduje zákon.' },
      { claim: 'Surové mäso nenesie žiadne skutočné riziko, žalúdočná kyselina si s ním poradí.',
        evidence: 'Psy na surovej strave vylučujú salmonelu mnohonásobne častejšie a riziko nesú hlavne ľudia v domácnosti. Surová strava sa dá robiť dobre, s kuchynskou hygienou.' },
      { claim: 'Byliny a éterické oleje namiesto antibiotík alebo chemoterapie.',
        evidence: 'V štúdiách na psoch obstáli dva rastlinné lieky (crofelemer pri hnačke, extrakt z trúdnikovca pestrého pri jednom druhu rakoviny). Ani jeden nenahrádza liečbu. Éterické oleje podané ústami môžu mačku otráviť.' },
      { claim: 'Dobré jedlo udrží FIV, FeLV a FIP ďaleko.',
        evidence: 'Infekcia nezávisí od stravy. FIP, kedysi smrteľná, sa dnes lieči antivirotikom.' },
      { claim: 'Voda z vodovodu, Wi-Fi a mikročipy robia zvieratá chorými.',
        evidence: 'Dôkazy sme nenašli. Mikročip vo veľkej časti Európy vyžaduje zákon a strateným psom pomáha nájsť cestu domov.' },
      { claim: 'Na génoch takmer nezáleží, rozhoduje strava.',
        evidence: 'Niektoré choroby plemien sú čisto genetické: kólia bez funkčného génu MDR1 môže zomrieť po bežnom odčervovacom prípravku, nech žerie čokoľvek.' },
    ],
  },
};

/** Popisy skupín (SOURCE_GROUPS) — kľúč = group key, hodnota = objekt s rovnakými textovými poľami ako v origináli, preložený. */
export const SOURCE_GROUPS_SK: Record<string, Record<string, string>> = {
  books: { label: 'Knihy', empty: 'Zatiaľ žiadne knihy.' },
  other: { label: 'Iné publikácie', empty: 'Zatiaľ tu nič nie je.' },
  video: { label: 'Videá', empty: 'Zatiaľ žiadne. Prednášku s časovými značkami môžeš pridať.' },
  own: { label: 'AINUBIS SEED', empty: '' },
};

/** SOURCES_CLAUSE po slovensky. */
export const SOURCES_CLAUSE_SK = 'AINUBIS z týchto diel nič nereprodukuje. '
  + 'Čo vie, je tu napísané našimi slovami a stojí na nich. Každá odpoveď '
  + 'menuje knihu, z ktorej vychádza, nech môžeš ísť k originálu. '
  + 'Prácu urobili autori, my na ňu ukazujeme.';

/** SOURCE_KINDS — kľúč = key druhu, textové polia preložené. */
export const SOURCE_KINDS_SK: Record<string, Record<string, string>> = {
  pdf: { label: 'PDF', hint: 'sken alebo e-kniha, 50+ strán' },
  text: { label: 'Textová rada', hint: 'čo vieš a odkiaľ to vieš' },
  video: { label: 'Video', hint: 'prednáška alebo rozbor, s časovými značkami' },
  link: { label: 'Odkaz', hint: 'blog, štúdia, organizácia' },
};

/** SK tvar slova podľa čísla: 1 · 2–4 · 0 a 5+. */
const skPlural = (n: number, one: string, few: string, many: string): string =>
  n === 1 ? one : n >= 2 && n <= 4 ? few : many;

/** Veta o neuvedených zdrojoch po slovensky. Rovnaká logika ako hiddenNote(). */
export const HIDDEN_NOTE_SK = (): string | null => {
  if (HIDDEN_SOURCES.length === 0) return null;
  const docs = HIDDEN_SOURCES.length;
  const n = HIDDEN_SOURCES.reduce((s, d) => s + d.scrolls, 0);
  return docs + ' ' + skPlural(docs, 'ďalší dokument', 'ďalšie dokumenty', 'ďalších dokumentov')
    + ' (' + n + ' ' + skPlural(n, 'zvitok', 'zvitky', 'zvitkov') + ') '
    + skPlural(docs, 'je', 'sú', 'je') + ' v mozgu, ale zoznam ' + skPlural(docs, 'ho', 'ich', 'ich')
    + ' neuvádza: marketingová príručka, z ktorej berieme jednu úzku vec.';
};
