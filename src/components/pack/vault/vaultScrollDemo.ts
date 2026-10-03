// ════════════════════════════════════════════════════════════════════════════
// ZVITKY S OBRAZOM — UKÁŽKA FORMÁTU 3:4 (3. 10. 2026, LEN DEV)
// ────────────────────────────────────────────────────────────────────────────
// Matej: „ukáž mi to na real appke… 3:4… šírka panela musí byť taká, aby sa na PC
// zmestil celý obrázok aj nadpis, text aj CTA na jeden zvitok — formát 3:4, lebo
// bude to orientované na mobily".
// Zdroj textov a obrazov: plany/ainubis/extraktor/dogsPath/obrazy/O1.json
// (obrazy vyrobil scripts/obrazy-vyrob.mjs). Obrázky ležia v public/vault-demo/,
// ktoré je v .gitignore — naostro sa z nich nič nevyvezie.
// ════════════════════════════════════════════════════════════════════════════
export const SCROLL_DEMO = import.meta.env.DEV;

export type DemoScroll = {
  id: string; n: number; t: string; v: string; variant: string;
  min: number; src: number; take: string; rel: string[];
};

/* min = čas čítania obšírneho textu (slová / 200), src = citácie v texte zvitku
   (organizmus.json → d) + pramene z knihy (pr). take = „VEZMI SI Z TOHO" — jedna veta,
   ktorá nahradila ČO ÁNO / ČO NIE (fasáda v2, 18. 9.). rel = susedia z toho istého okruhu. */
const Z = [
  { t: 'Pes bol prvý — a dlho jediný', v: 'Pes bol pri človeku skôr než koza, mačka či kôň. Už pred 14 000 rokmi sa ľudia týždne starali o choré šteňa, hoci im nebolo na nič.',
    min: 3, src: 7, take: 'Keď sa staráš o chorého či starého psa, robíš to, čo ľudia robia už 14 000 rokov.',
    rel: ['Kto si koho ochočil', 'Úžitok naprieč vekom'], n: ['rez zeminou', 'miska pre šteňa', 'rad k ohňu'] },
  { t: 'Kto si koho ochočil', v: 'Vlk k človeku pristupoval po kúskoch, až si prvý raz zobral jedlo z ruky.',
    min: 2, src: 5, take: 'Dôveru psa nevynútiš. Príde po kúskoch, keď ho necháš prísť samého.',
    rel: ['Krotkosť mala vedľajšie účinky', 'Pes bol prvý — a dlho jediný'], n: ['úniková vzdialenosť', 'dve cesty', 'ruka a papuľa'] },
  { t: 'Štyri hodiny psích dejín', v: 'Predkovia psa sa od vlka oddelili pred 27 000 až 40 000 rokmi, plemená so štandardom majú asi 150 rokov.',
    min: 3, src: 4, take: 'Keď niekto povie, aký starý je pes, spýtaj sa: ktoré hodiny meria?',
    rel: ['Krotkosť mala vedľajšie účinky', 'Telo, ktoré prežilo svoju prácu'], n: ['štyri ciferníky', 'rodokmeň psovitých', 'omyl v rytine'] },
];

export const DEMO_TOTAL = 10;

export const DEMO_SCROLLS: DemoScroll[] = Z.flatMap((z, i) =>
  z.n.map((variant, j) => ({ id: `O1-${i + 1}${'ABC'[j]}`, n: i + 1, variant, t: z.t, v: z.v, min: z.min, src: z.src, take: z.take, rel: z.rel })));

export const demoImg = (id: string) => `/vault-demo/O1/${id}-34.jpg`;
