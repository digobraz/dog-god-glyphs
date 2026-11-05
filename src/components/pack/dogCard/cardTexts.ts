// Texty NA kartičke sú v jazyku KARTIČKY, nie appky: Danka (Slovenka v zahraničí, 5. 11. 2026) potrebuje EN alebo DE aj v slovenskej appke.
// Preto samostatná tabuľka, nie i18n. `f` = fenka. Napísaný text človeka sa neprekladá.
export type CardTexts = { title: string; ask: string; backTitle: string; addr: string; note: string };
type Row = { label: string; t: string; tf?: string; a: string; af?: string; b: string; ad: string; adf?: string; n: string; rtl?: boolean };

const CARD: Record<string, Row> = {
  sk: { label: 'Slovenčina', t: 'Môj pes je doma sám', tf: 'Moja fenka je doma sama', a: 'Prosím, ak sa k nemu nemôžem vrátiť, zavolajte ľuďom na zadnej strane. Ďakujem.', af: 'Prosím, ak sa k nej nemôžem vrátiť, zavolajte ľuďom na zadnej strane. Ďakujem.', b: 'Núdzové kontakty', ad: 'Adresa, kde je pes', adf: 'Adresa, kde je fenka', n: 'Poznámka' },
  cs: { label: 'Čeština', t: 'Můj pes je doma sám', tf: 'Moje fenka je doma sama', a: 'Prosím, pokud se k němu nemohu vrátit, zavolejte lidem na zadní straně. Děkuji.', af: 'Prosím, pokud se k ní nemohu vrátit, zavolejte lidem na zadní straně. Děkuji.', b: 'Nouzové kontakty', ad: 'Adresa, kde je pes', adf: 'Adresa, kde je fenka', n: 'Poznámka' },
  en: { label: 'English', t: 'My dog is home alone', a: 'Please, if I cannot get back to him, call the people on the back. Thank you.', af: 'Please, if I cannot get back to her, call the people on the back. Thank you.', b: 'Emergency contacts', ad: 'Where the dog is', n: 'Note' },
  deu: { label: 'Deutsch', t: 'Mein Hund ist allein zu Hause', tf: 'Meine Hündin ist allein zu Hause', a: 'Bitte, falls ich nicht zu ihm zurückkommen kann, rufen Sie die Personen auf der Rückseite an. Danke.', af: 'Bitte, falls ich nicht zu ihr zurückkommen kann, rufen Sie die Personen auf der Rückseite an. Danke.', b: 'Notfallkontakte', ad: 'Wo der Hund ist', adf: 'Wo die Hündin ist', n: 'Notiz' },
  pol: { label: 'Polski', t: 'Mój pies jest sam w domu', tf: 'Moja suczka jest sama w domu', a: 'Proszę, jeśli nie mogę do niego wrócić, zadzwońcie do osób z drugiej strony. Dziękuję.', af: 'Proszę, jeśli nie mogę do niej wrócić, zadzwońcie do osób z drugiej strony. Dziękuję.', b: 'Kontakty alarmowe', ad: 'Adres, gdzie jest pies', adf: 'Adres, gdzie jest suczka', n: 'Notatka' },
  ukr: { label: 'Українська', t: 'Мій пес удома сам', tf: 'Моя собака вдома сама', a: 'Будь ласка, якщо я не можу до нього повернутися, зателефонуйте людям на звороті. Дякую.', af: 'Будь ласка, якщо я не можу до неї повернутися, зателефонуйте людям на звороті. Дякую.', b: 'Екстрені контакти', ad: 'Адреса, де пес', adf: 'Адреса, де собака', n: 'Примітка' },
  rus: { label: 'Русский', t: 'Моя собака дома одна', a: 'Пожалуйста, если я не могу к ней вернуться, позвоните людям на обороте. Спасибо.', b: 'Экстренные контакты', ad: 'Адрес, где собака', n: 'Заметка' },
  fra: { label: 'Français', t: 'Mon chien est seul à la maison', tf: 'Ma chienne est seule à la maison', a: "S'il vous plaît, si je ne peux pas revenir auprès de lui, appelez les personnes au verso. Merci.", af: "S'il vous plaît, si je ne peux pas revenir auprès d'elle, appelez les personnes au verso. Merci.", b: "Contacts d'urgence", ad: 'Adresse du chien', adf: 'Adresse de la chienne', n: 'Note' },
  esp: { label: 'Español', t: 'Mi perro está solo en casa', tf: 'Mi perra está sola en casa', a: 'Por favor, si no puedo volver con él, llame a las personas del reverso. Gracias.', af: 'Por favor, si no puedo volver con ella, llame a las personas del reverso. Gracias.', b: 'Contactos de emergencia', ad: 'Dónde está el perro', adf: 'Dónde está la perra', n: 'Nota' },
  ita: { label: 'Italiano', t: 'Il mio cane è solo a casa', tf: 'La mia cagnolina è sola a casa', a: 'Per favore, se non posso tornare da lui, chiamate le persone sul retro. Grazie.', af: 'Per favore, se non posso tornare da lei, chiamate le persone sul retro. Grazie.', b: 'Contatti di emergenza', ad: 'Dove si trova il cane', adf: 'Dove si trova la cagnolina', n: 'Nota' },
  prt: { label: 'Português', t: 'O meu cão está sozinho em casa', tf: 'A minha cadela está sozinha em casa', a: 'Por favor, se eu não puder voltar para ele, ligue para as pessoas no verso. Obrigado.', af: 'Por favor, se eu não puder voltar para ela, ligue para as pessoas no verso. Obrigado.', b: 'Contactos de emergência', ad: 'Onde está o cão', adf: 'Onde está a cadela', n: 'Nota' },
  nld: { label: 'Nederlands', t: 'Mijn hond is alleen thuis', a: 'Alstublieft, als ik niet naar hem kan terugkeren, bel dan de mensen op de achterkant. Dank u.', af: 'Alstublieft, als ik niet naar haar kan terugkeren, bel dan de mensen op de achterkant. Dank u.', b: 'Noodcontacten', ad: 'Waar de hond is', n: 'Notitie' },
  tur: { label: 'Türkçe', t: 'Köpeğim evde yalnız', a: 'Lütfen, ona dönemezsem arka yüzdeki kişileri arayın. Teşekkürler.', b: 'Acil durum kişileri', ad: 'Köpeğin bulunduğu adres', n: 'Not' },
  ind: { label: 'Indonesia', t: 'Anjing saya sendirian di rumah', a: 'Mohon, jika saya tidak bisa kembali kepadanya, hubungi orang-orang di bagian belakang. Terima kasih.', b: 'Kontak darurat', ad: 'Alamat anjing', n: 'Catatan' },
  ara: { label: 'العربية', rtl: true, t: 'كلبي وحده في المنزل', tf: 'كلبتي وحدها في المنزل', a: 'من فضلك، إذا لم أتمكن من العودة إليه، اتصل بالأشخاص المذكورين في الخلف. شكرًا.', af: 'من فضلك، إذا لم أتمكن من العودة إليها، اتصل بالأشخاص المذكورين في الخلف. شكرًا.', b: 'جهات اتصال الطوارئ', ad: 'عنوان مكان الكلب', adf: 'عنوان مكان الكلبة', n: 'ملاحظة' },
  chn: { label: '中文', t: '我的狗独自在家', a: '如果我无法回到它身边，请拨打背面的联系人电话。谢谢。', b: '紧急联系人', ad: '狗狗所在地址', n: '备注' },
  jpn: { label: '日本語', t: '私の犬は家に一匹でいます', a: '私が戻れない場合は、裏面の連絡先にお電話ください。よろしくお願いします。', b: '緊急連絡先', ad: '犬がいる住所', n: 'メモ' },
  kor: { label: '한국어', t: '우리 개가 집에 혼자 있어요', a: '제가 돌아갈 수 없다면 뒷면의 연락처로 전화해 주세요. 감사합니다.', b: '비상 연락처', ad: '개가 있는 주소', n: '메모' },
};

export const CARD_LANGS = Object.entries(CARD).map(([code, r]) => ({ code, label: r.label }));
export const cardLangOf = (lang: string | undefined | null) => (lang && CARD[lang] ? lang : 'en');
export const cardIsRtl = (lang: string) => !!CARD[cardLangOf(lang)].rtl;
export function cardTexts(lang: string, fem: boolean): CardTexts {
  const r = CARD[cardLangOf(lang)];
  return { title: (fem && r.tf) || r.t, ask: (fem && r.af) || r.a, backTitle: r.b, addr: (fem && r.adf) || r.ad, note: r.n };
}

// Popisy obrazovky okolo kartičky (jazyk appky). Ostatné jazyky padajú na EN ako celý SOS.
const UI = {
  lang: { en: 'Card language', sk: 'Jazyk kartičky', cs: 'Jazyk kartičky' },
  langHint: { en: 'Text you wrote stays as you wrote it.', sk: 'Tvoj napísaný text ostáva tak, ako si ho napísal.', cs: 'Tvůj napsaný text zůstává tak, jak jsi ho napsal.' },
  name: { en: 'Name', sk: 'Meno', cs: 'Jméno' },
  add: { en: '+ Add a number', sk: '+ Pridať číslo', cs: '+ Přidat číslo' },
  remove: { en: 'Remove', sk: 'Odstrániť', cs: 'Odebrat' },
  share: { en: 'Share', sk: 'Zdieľať', cs: 'Sdílet' },
  edit: { en: 'Edit in DOG ID', sk: 'Upraviť v DOG ID', cs: 'Upravit v DOG ID' },
  setUp: { en: 'Set up the card', sk: 'Nastaviť kartičku', cs: 'Nastavit kartičku' },
  noDogs: { en: 'You have no dog to make a card for yet.', sk: 'Zatiaľ nemáš psa, pre ktorého by sa dala kartička vytvoriť.', cs: 'Zatím nemáš psa, pro kterého by šla kartička vytvořit.' },
  shareFile: { en: 'emergency-card', sk: 'nudzova-karticka', cs: 'nouzova-karticka' },
} as const;
export const cardUi = (k: keyof typeof UI, lang: string) => {
  const row = UI[k] as Record<string, string>;
  return row[lang] ?? row.en;
};
