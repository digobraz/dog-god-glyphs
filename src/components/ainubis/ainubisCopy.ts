// Zákaznícke texty AINUBISA. ZDROJ PRAVDY = plany/ainubis/04-copy-a-vizual.md
// (Fable 5). Uvítanie = Variant A „Strážca" (odporúčaný default), rozdelený na
// DVE bubliny zámerne — prvá správa nesmie byť stena textu.
//
// AINUBIS = klon psa Hektora v egyptskom šate, strážca DOGYPTu. Vtipný, ale vecný.
// Žiadne psie zvuky (Haf/Wuf), žiadne AI frázy ("Ako AI model..."), žiadne zdrobneniny.
// Widget zobrazuje len SK a EN — AINUBIS samotný (backend) odpovedá v jazyku pisateľa,
// toto je len statický UI text okolo bublín (uvítanie, tlačidlá, chybové hlášky).

export interface AinubisCopy {
  panelTitle: string;
  panelSubtitle: string;
  takeoverActive: string;
  /** Intro karta nad prvou konverzáciou — badge + meno + rola + jedna veta. */
  introRole: string;
  introTagline: string;
  statusOnline: string;
  statusTakeover: string;
  /** Dve bubliny, nie jedna — viď 04-copy-a-vizual.md §1. */
  welcome: string[];
  suggestions: {
    problem: string;
    idea: string;
    question: string;
  };
  inputPlaceholder: string;
  typing: string;
  send: string;
  attachImage: string;
  removeImage: string;
  imagePreviewAlt: string;
  devotionGranted: (n: number) => string;
  errors: {
    generic: string;
    offline: string;
    rateLimited: string;
    sessionReset: string;
    imageTooBig: string;
  };
  unreadBadgeLabel: (n: number) => string;
  openAria: string;
  closeAria: string;
}

const sk: AinubisCopy = {
  panelTitle: 'AINUBIS',
  panelSubtitle: 'Strážca DOGYPTu',
  takeoverActive: 'Môj pán práve prevzal slovo.',
  introRole: 'Digitálny klon · Strážca chrámu',
  introTagline: 'Postavili ma z Hekthora. Strážim, čo tu stojí, a počúvam, čo tu chýba.',
  statusOnline: 'Online',
  statusTakeover: 'Pán pri slove',
  welcome: [
    'Ahoj, ja som AINUBIS — strážca DOGYPTU a digitálny klon HEKTHORA. Sprevádzam ťa po chráme.',
    'Toto miesto stavia jeden človek a mňa má ako ochrancu. Ak ti niečo nefunguje, našiel si nesúlad alebo máš nápad — napíš mi. Pri probléme kľudne rovno so screenshotom: pozriem sa naň hneď a riešenie navrhnem skôr, než bude môj pán opäť online.',
  ],
  suggestions: {
    problem: 'Mám problém',
    idea: 'Mám nápad',
    question: 'Chcem sa spýtať',
  },
  inputPlaceholder: 'Napíš strážcovi…',
  typing: 'AINUBIS ňuchá stopu…',
  send: 'Pošli',
  attachImage: 'Priložiť obrázok',
  removeImage: 'Odstrániť obrázok',
  imagePreviewAlt: 'Náhľad priloženého obrázku',
  devotionGranted: (n) => `+${n} ODDANOSŤ — strážil si chrám so mnou.`,
  errors: {
    generic: 'Spojenie s chrámom sa pretrhlo. Skús to ešte raz.',
    offline: 'Strážca práve obchádza hradby. Skús o chvíľu — alebo napíš na woof@dogypt.com.',
    rateLimited: 'Spomaľ, pútnik — aj klon má len dve labky. Skús o minútu.',
    sessionReset: 'Vlákno sa muselo obnoviť. Píš ďalej, počúvam.',
    imageTooBig: 'Obrázok sa nepodarilo spracovať. Skús iný súbor.',
  },
  unreadBadgeLabel: (n) => `${n} neprečítaných správ`,
  openAria: 'Otvoriť chat s AINUBISOM',
  closeAria: 'Zavrieť chat',
};

const en: AinubisCopy = {
  panelTitle: 'AINUBIS',
  panelSubtitle: 'Guardian of DOGYPT',
  takeoverActive: 'My master has taken the word himself.',
  introRole: 'Digital clone · Guardian of the temple',
  introTagline: 'They built me from HEKTHOR. I guard what stands here, and I listen for what is missing.',
  statusOnline: 'Online',
  statusTakeover: 'Master speaking',
  welcome: [
    "Hi, I'm AINUBIS — guardian of DOGYPT and the digital clone of HEKTHOR. I'll walk you through the temple.",
    "This place is built by one human, and I'm his guard dog. If something's broken, off, or you've got an idea — tell me. For problems, a screenshot works great: I'll look at it right away and draft a fix before my master is back online.",
  ],
  suggestions: {
    problem: 'I have a problem',
    idea: 'I have an idea',
    question: 'I want to ask something',
  },
  inputPlaceholder: 'Write to the guardian…',
  typing: 'AINUBIS is on the scent…',
  send: 'Send',
  attachImage: 'Attach image',
  removeImage: 'Remove image',
  imagePreviewAlt: 'Preview of attached image',
  devotionGranted: (n) => `+${n} devotion points granted.`,
  errors: {
    generic: 'Something broke on my side of the tomb. Please try again.',
    offline: 'Lost connection to DOGYPT. Check your internet and try again.',
    rateLimited: "That's a lot of messages at once — take a breath, write again shortly.",
    sessionReset: 'The thread had to be renewed. Keep writing, I am listening.',
    imageTooBig: "Couldn't process that image. Try a different file.",
  },
  unreadBadgeLabel: (n) => `${n} unread messages`,
  openAria: 'Open chat with AINUBIS',
  closeAria: 'Close chat',
};

/** SK pre `sk`, inak EN default — rovnaký fallback princíp ako `LanguageContext`. */
export function getAinubisCopy(lang: string): AinubisCopy {
  return lang === 'sk' ? sk : en;
}
