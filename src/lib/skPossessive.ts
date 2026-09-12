/** Privlastňovacie prídavné meno z krstného mena pre SK — „Matej" → „Matejova".
 *
 *  Matej 12. 9. 2026: *„a text je matejova svorka... nie matej svorka"*. Flag, že sa
 *  privlastňovací tvar v slovenčine programovo skladať nedá spoľahlivo, dostal PRED prácou
 *  a rozhodol napriek nemu — takže tu nejde o to byť neomylný, ale **netrafiť sa čo
 *  najmenejkrát**. Kto si tvar neuzná, prepíše si menovku ceruzkou (`PackNameRow`), takže
 *  cena omylu je jeden klik, nie zlé dáta: **toto sa NIKDY neukladá do DB**, je to len
 *  východisko na obrazovke, kým `pack_profiles.human.packName` nie je vyplnené.
 *
 *  Pravidlo:
 *    · končí na -a/-á  → kmeň + „ina"  (Zuzana→Zuzanina, Lucia→Luciina, Mária→Máriina)
 *    · žena inak       → meno + „ina"  (Ines→Inesina, Nikol→Nikolina)
 *    · muž / neznáme   → meno + „ova"  (Matej→Matejova, Ivan→Ivanova, Tomáš→Tomášova)
 *
 *  ⚠️ VYPÚŠŤANIE POHYBNÉHO -e- SA NEROBÍ PRAVIDLOM, ale tabuľkou. Peter→Petrova a
 *  Pavel→Pavlova by zvádzali na vzor „-er/-el ⇒ vypusť e", lenže ten istý vzor rozbije
 *  Oliver→Oliverova a Samuel→Samuelova — a Oliver aj Samuel sú dnes bežnejšie než Pavel.
 *  Pravidlo, ktoré opraví dve mená a pokazí dve, je horšie než žiadne; tabuľka opraví
 *  presne tie, ktoré v nej stoja. Pribudne meno → pribudne riadok.
 */

/** Mená, kde by pravidlo dalo zlý tvar (pohyblivé -e-, cudzie zakončenie). Kľúč = lowercase. */
const IRREGULAR: Record<string, string> = {
  peter: 'Petrova',
  pavel: 'Pavlova',
  alexander: 'Alexandrova',
  ondrej: 'Ondrejova',
  matej: 'Matejova',
  karol: 'Karolova',
  vavrinec: 'Vavrincova',
};

export function skPossessive(name: string, gender: 'man' | 'woman' | null = null): string {
  const n = (name || '').trim();
  if (!n) return n;

  const irregular = IRREGULAR[n.toLowerCase()];
  if (irregular) return irregular;

  // Zakončenie na -a/-á: kmeň + „ina". Platí pre drvivú väčšinu ženských mien; mužské
  // mená na -a (Ilja, Kuba) sú u nás natoľko zriedkavé, že sa im obetuje jednoduchosť.
  if (/[aá]$/.test(n)) return `${n.slice(0, -1)}ina`;

  if (gender === 'woman') return `${n}ina`;
  return `${n}ova`;
}
