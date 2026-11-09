// Kresba z hand-drawn kitu → vybraná ikonka z továrne (`plany/ikonky/okna.json`, súbory `public/icons/sys/`).
// Len appka: BrandIcon sa sem pozerá iba pod APP_NEW, web na dogypt.com ostáva na kresbách.
// `paw` a `feather` tu zámerne nie sú: labka je z továrne len hodnotenie výletu, pierko inde znamená písanie.
export const SYS_ZA_KRESBU: Record<string, string> = {
  back: 'spat', pencil: 'ceruzka', camera: 'foto', lock: 'zamok', link: 'zdielat', send: 'odoslat',
  cycle: 'znova', eye: 'oko', question: 'otaznik', alert: 'pozor', sliders: 'filter', menu: 'zoznam',
  map: 'mapa', layers: 'vrstvy', locate: 'poloha', play: 'prehraj', frame: 'galeria', idea: 'mozog',
  dogposter: 'dog-id', clipboard: 'modul-zaklad', food: 'krmenie', heart: 'zdravie',
  bone: 'kost', person: 'ja-muz', heartpaw: 'misia', 'add-user': 'pridaj-cloveka', envelope: 'obalka',
  globe: 'jazyk', mountain: 'hora', 'house-heart': 'doma', trophy: 'trofej', plus: 'plus', yinyang: 'modul-povaha',
  'dogid-will': 'modul-vola', people: 'svorka', document: 'dokument',
};
