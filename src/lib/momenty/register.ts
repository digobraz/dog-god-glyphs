// ─────────────────────────────────────────────────────────────────────────────
// REGISTER MOMENTOV — jediné miesto, kde appka vie, KTORÁ udalosť je aká VEĽKÁ.
//
// Matej 14. 11. 2026: *„každý úspešný task či udalosť by mala byť ocenená nejakým revealom… mali by sme to
// mať na jednom mieste, aby sme časom vedeli do toho vstúpiť a zmeniť“*. 15. 11. odklikol v hárku Zážitok
// appky všetkých 37 momentov (claude.ai/artifact/Mnn1wPz8REn8Cv9jkyrFB4) a nad prehliadkou animácií
// (claude.ai/artifact/F3qpEgbwp9pAWxjJiEzPFo, kópia plany/nakresy/momenty-appky-2026-11-15/) povedal
// *„ok myslím že koncept sedí naozaj to bude krajšie“* → *„sprav“*.
//
// ŠTYRI VEĽKOSTI (voľba „velkosti = a“):
//   iskra      0,3 s · prvok pod prstom (lajk, uloženie, bod na mape) · bez zakrytia obrazovky
//   pecat      1,5 s · dokončená úloha (zápis dňa, zvitok, modul DOG ID)
//   odhalenie  3 s   · nový level, odznak, pásmo · medaila + stuha + ZDIEĽAŤ
//   obrad      6 s   · raz za čas (heroglyf, číslo psa, výročie, wrap) · celá obrazovka + ZVUK
//
// Voľby, ktoré tu platia: haptika všade, zvuk LEN pri obrade, dá sa vypnúť (haptika = a) · séria je TVRDÁ (seria = b).
// ZDIEĽAŤ NEMÁ ŽIADNY MOMENT — Matej 15. 11. nad testovacou appkou: *„zdielať netreba nemyslim si že by to niekto
// zdielal“* (ruší voľbu zdielanie = a z toho istého dňa). Zmena veľkosti alebo haptiky = zmena TU, nie v komponente udalosti.
// ─────────────────────────────────────────────────────────────────────────────

export type MomentVelkost = 'iskra' | 'pecat' | 'odhalenie' | 'obrad';

export type MomentId =
  // prvý deň
  | 'brana' | 'heroglyf' | 'kod' | 'vitaj' | 'cislo' | 'wizard'
  // prvý týždeň
  | 'prvykrat' | 'dogid-modul' | 'dogid-cele' | 'povaha'
  // každý deň
  | 'zapis' | 'pripomienka' | 'seria' | 'odznak-zapis' | 'zvitok' | 'ucen' | 'vault-odznak'
  | 'prispevok' | 'lajk' | 'ainubis'
  // každý výlet
  | 'vylet' | 'putnik' | 'pasmo' | 'hrdina' | 'pas' | 'pridanie' | 'sniffer' | 'miesto'
  // mesiac a rok
  | 'wrap-mesiac' | 'wrap-rok' | 'narodeniny' | 'vyrocie' | 'zlato' | 'pred-rokom' | 'bones' | 'svorka' | 'hodnost';

export interface MomentDef {
  velkost: MomentVelkost;
  /** Spúšťa ho push (voľba push-nove). Push sám rieši send-push, tu je len značka pre register. */
  push?: boolean;
  /** Etapa stavby (1 jadro · 2 tiché prahy · 3 rytmy · 4 wrapy). Etapa 1 = už existujúci reveal napojený na jadro. */
  etapa: 1 | 2 | 3 | 4;
}

export const MOMENTY: Record<MomentId, MomentDef> = {
  brana: { velkost: 'obrad', etapa: 2 },
  heroglyf: { velkost: 'obrad', etapa: 2 },
  kod: { velkost: 'iskra', etapa: 2 },
  vitaj: { velkost: 'odhalenie', etapa: 2 },
  cislo: { velkost: 'obrad', push: true, etapa: 2 },
  wizard: { velkost: 'odhalenie', etapa: 2 }, // 17. 11.: odznak komnaty = kresba + meno + veta (pečať kreslila prázdny kotúč)

  prvykrat: { velkost: 'odhalenie', etapa: 2 },
  'dogid-modul': { velkost: 'pecat', etapa: 2 },
  'dogid-cele': { velkost: 'odhalenie', etapa: 2 },
  povaha: { velkost: 'odhalenie', etapa: 2 },

  zapis: { velkost: 'pecat', etapa: 1 },
  pripomienka: { velkost: 'iskra', push: true, etapa: 3 },
  seria: { velkost: 'odhalenie', etapa: 2 },
  'odznak-zapis': { velkost: 'odhalenie', etapa: 2 },
  zvitok: { velkost: 'pecat', etapa: 2 },
  ucen: { velkost: 'odhalenie', etapa: 2 },
  'vault-odznak': { velkost: 'odhalenie', etapa: 2 },
  prispevok: { velkost: 'iskra', etapa: 2 },
  lajk: { velkost: 'iskra', etapa: 2 },
  ainubis: { velkost: 'iskra', etapa: 2 },

  vylet: { velkost: 'odhalenie', etapa: 1 },
  putnik: { velkost: 'odhalenie', etapa: 1 },
  pasmo: { velkost: 'obrad', etapa: 2 },
  hrdina: { velkost: 'odhalenie', etapa: 2 },
  pas: { velkost: 'pecat', etapa: 2 },
  pridanie: { velkost: 'iskra', push: true, etapa: 3 },
  sniffer: { velkost: 'odhalenie', etapa: 1 },
  miesto: { velkost: 'iskra', etapa: 2 },

  'wrap-mesiac': { velkost: 'obrad', push: true, etapa: 4 },
  'wrap-rok': { velkost: 'obrad', push: true, etapa: 4 },
  narodeniny: { velkost: 'obrad', push: true, etapa: 3 },
  vyrocie: { velkost: 'obrad', push: true, etapa: 3 },
  zlato: { velkost: 'odhalenie', etapa: 3 },
  'pred-rokom': { velkost: 'iskra', push: true, etapa: 3 },
  bones: { velkost: 'pecat', push: true, etapa: 3 },
  svorka: { velkost: 'odhalenie', etapa: 3 },
  hodnost: { velkost: 'obrad', etapa: 3 },
};

/** Zvuk len pri obrade (voľba haptika = a). */
export const maZvuk = (id: MomentId) => MOMENTY[id].velkost === 'obrad';
