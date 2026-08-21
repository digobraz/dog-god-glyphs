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
  /** Prúžok pod hlavičkou, keď pán prevzal slovo. Hlavička sama má od 9. 8. 2026 len tri
   *  ikonky (bez mena, podtitulu a stavu ONLINE), takže toto je JEDINÉ miesto, kde sa
   *  prevzatie slova zobrazí — nemazať bez náhrady. */
  takeoverActive: string;
  /** Intro karta = badge + meno + JEDEN riadok s dvoma rolami (Matej 2026-07-26:
   *  „tu mi chýba pod anubisom tie dve veci čo tam mal takle podnadpisy
   *  (strážca, AI podpora"). Dlhá tagline ostáva zrušená. */
  introRole: string;
  /** Hlasovka — diktovanie cez Web Speech API, text padá do poľa na kontrolu. */
  micStart: string;
  micStop: string;
  micListening: string;
  micDenied: string;
  /** Dve bubliny, nie jedna — viď 04-copy-a-vizual.md §1. */
  welcome: string[];
  suggestions: {
    problem: string;
    idea: string;
    question: string;
  };
  /**
   * VETVY PROMPTU. Klik zákazníka vyberá, ktorý prompt sa na serveri poskladá —
   * nie je to len filter témy, je to rozdiel ~5,5k vs ~25,7k tokenov na výmenu.
   * Zadanie: plany/zadanie-ainubis-vetvy-2026-08-21.md
   *
   * ⚠️ DVE dvere, rovnaké pre hosťa aj člena (Matej 21. 8. 2026: „je zle
   * rozdelenie daj len podpora a personalizácia"). Delenie na support/faith/pack
   * kopírovalo stavbu promptu, nie to, s čím človek prichádza.
   * `personal` je VIP — nesie korunku a má mesačnú dávku; `support` je voľná
   * a má v sebe aj ústavu, lebo tá je magnet, nie odmena za členstvo.
   */
  branches: {
    ask: string;
    support: { label: string; hint: string };
    personal: { label: string; hint: string };
    switchLabel: string;
    /** Popiska korunky pri VIP dverách — nesmie ostať len ikonka bez mena. */
    vip: string;
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
  /** Ikonka dashboardu v hlavičke nemá popisku — text nesie až bublina pri hoveri
   *  (na dotyku pri kliku). Tlačidlo nikam nevedie: sľubuje smer, kam widget rastie. */
  dashboardHint: string;
  /** Kríž v hlavičke = úchyt okna: stlač a ťahaj, dvojklik vráti do rohu.
   *  Žiadny režim na zapnutie ⇒ žiadne `moveStop`/`moveHint`/`moveReset`. */
  moveStart: string;
}

const sk: AinubisCopy = {
  panelTitle: 'AINUBIS',
  // Riadok pod menom v hlavičke sa renderuje mono uppercase ako technický
  // výpis — preto krátko, nie veta (dlhší text sa oreže tromi bodkami).
  takeoverActive: 'Pán prevzal slovo',
  introRole: 'Strážca chrámu · AI podpora',
  micStart: 'Nahovoriť správu',
  micStop: 'Ukončiť nahrávanie',
  micListening: 'Počúvam… klikni znova, keď dopovieš.',
  micDenied: 'K mikrofónu sa neviem dostať — povoľ ho v prehliadači, alebo mi to napíš.',
  welcome: [
    'Ahoj, ja som AInubis — digitálny strážca DOGYPTU.',
    'Náš virtuálny chrám je stále vo výstavbe. Tvoje oči sú tu veľmi vzácne: ak niečo nefunguje alebo nájdeš nejaký preklep či chybu, napíš mi (pokojne so screenshotom). Pozriem sa na to a odovzdám pánovi na posúdenie a opravu.',
  ],
  suggestions: {
    problem: 'Mám problém',
    idea: 'Mám nápad',
    question: 'Chcem sa spýtať',
  },
  branches: {
    ask: 'Čo dnes riešime?',
    support: { label: 'Podpora', hint: 'Niečo nefunguje, máš nápad, alebo sa pýtaš na DOGYPT a ústavu. Píš koľkokrát chceš.' },
    personal: { label: 'Personalizácia', hint: 'Poradím ti s tvojím psom. Poznám jeho meno, vek aj to, čo si o ňom zapísal.' },
    switchLabel: 'O čom sa bavíme',
    vip: 'VIP',
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
  dashboardHint: 'Dashboard — čoskoro',
  moveStart: 'Chyť a ťahaj — dvojklik vráti okno do rohu',
};

const en: AinubisCopy = {
  panelTitle: 'AINUBIS',
  takeoverActive: 'Master has the word',
  introRole: 'Guardian of the temple · AI support',
  micStart: 'Record a message',
  micStop: 'Stop recording',
  micListening: 'Listening… click again when you are done.',
  micDenied: "I can't reach the microphone — allow it in your browser, or just type it.",
  welcome: [
    "Hi, I'm AInubis — digital guardian of DOGYPT.",
    "Our virtual temple is still under construction. Your eyes are precious here: if something does not work, or you find a typo or a bug, tell me (a screenshot is welcome). I will look into it and pass it on to my master to judge and fix.",
  ],
  suggestions: {
    problem: 'I have a problem',
    idea: 'I have an idea',
    question: 'I want to ask something',
  },
  branches: {
    ask: 'What are we dealing with today?',
    support: { label: 'Support', hint: 'Something is broken, you have an idea, or you are asking about DOGYPT and the Constitution. Write as often as you like.' },
    personal: { label: 'Personal', hint: 'I will help you with your dog. I know their name, their age and what you wrote about them.' },
    switchLabel: "What we're on",
    vip: 'VIP',
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
  dashboardHint: 'Dashboard — coming soon',
  moveStart: 'Grab and drag — double-click returns it to the corner',
};

/** SK pre `sk`, inak EN default — rovnaký fallback princíp ako `LanguageContext`. */
export function getAinubisCopy(lang: string): AinubisCopy {
  return lang === 'sk' ? sk : en;
}
