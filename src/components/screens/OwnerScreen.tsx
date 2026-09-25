import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore, MAIN_DOG_ID } from '@/store/dogyptStore';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { useBlockAutocorrect } from '@/hooks/useBlockAutocorrect';
import { PageTopBar } from '@/components/PageTopBar';
// ⚠️ Sady symbolov sa berú Z RÁMU, nevymenúvajú sa tu znovu — inak by náhľad
//    vedľa poľa a slot v ráme boli dve rôzne sady toho istého.
import { HeroglyphFrame, letterMap, zodiacMap, chineseMap, genderMap } from '@/components/HeroglyphFrame';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS, FLOW_GLYPH_CSS } from '@/components/screens/flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS, useSpeakMedal } from '@/components/screens/flowMedallion';
import { FlowTextModal } from '@/components/screens/flowTextModal';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_R } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { hekthorFace } from '@/lib/hekthorFaces';
import { HEKTHOR_GLYPH } from '@/lib/hektor';
import { initialLetter } from '@/lib/initialLetter';
import { getChineseZodiac, getWesternZodiac } from '@/lib/zodiac';
import { ZodiacSheet } from '@/components/screens/zodiacSheet';
import { useFlowDogs, FlowDogHeader, FLOW_DOG_CSS } from '@/components/screens/flowDogPicker';

// ════════════════════════════════════════════════════════════════════════════
// MAJITEĽ — poradie, meno, pohlavie a obidva horoskopy na JEDNEJ obrazovke
// (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026: *„ideme zliať majiteľa do jednej obrazovky a tam dáme
// pohlavie meno aj horoskopy + otázka na poradie ktoré si vybral v kroku dva
// (zmeniť) prelinkovanie na tento krok a po vyplnení a pokračovať hodí to tu
// bez preklikávania"*.
//
// 🔑 ČO TÝMTO ZANIKÁ Z REŤAZE NOVÉHO VSTUPU — SEDEM OBRAZOVIEK:
//    `ranking` (poradie už pýta krok 2, `DogsScreen` ho píše do
//    `selections.ranking`) · `owner-info` v starej podobe · `owner-zodiac` ·
//    `owner-final` (bola to len medzistránka „tvoja časť je hotová") a štyri
//    otázky o psovi `dog-gender` · `dog-fate` · `dog-colour` · `dog-bloodline`,
//    ktoré od 24. 9. pýta PODSTATA. Chvost za patrónom sa teda pýtal na veci,
//    na ktoré človek v tom istom priechode UŽ odpovedal.
//    ⚠️ Žiadna z tých obrazoviek sa NEMAŽE — LIVE vstup ide ďalej cez ne (lock
//       „do FLIPu sa LIVE nedotýkame"). Odvesili sa, nezanikli.
//
// 🔑 PORADIE SA NEPÝTA ZNOVU, LEN SA UKAZUJE. Človek ho nastavil na kroku 2
//    (ťahaním psov za úchyt), takže tu je to VETA so stavom a tlačidlom ZMENIŤ,
//    ktoré vedie späť na ten krok — nie tretia podoba tej istej otázky.
//    ⚠️ Kto sa vráti a poradie prehodí, príde sem znovu cez reťaz krokov; stav
//       sa číta zo `selections.ranking` pri každom vykreslení, takže je vždy
//       čerstvý.
//
// 🔑 JEDEN DÁTUM, DVE ZNAMENIA (Matejov výber 25. 9. z troch možností).
//    Stará dvojica obrazoviek pýtala klasický horoskop ručne z radu dvanástich
//    znamení a čínsky z kolieska rokov — dva vstupy pre vec, ktorú dátum
//    narodenia určuje presne. Odteraz je to jeden dátum a obe znamenia sa
//    dopočítajú (`getWesternZodiac`, `getChineseZodiac`) a hneď pristanú v ráme.
//    ⚠️ Dátum sa UKLADÁ (`selections.ownerBirthday`) a ide aj do DB — Matej
//       25. 9.: *„kto chce nam ho da je to dobre vedieť"*. Bez uloženia by sa
//       pri návrate na krok nedal obnoviť: zo znamenia sa deň ani rok spätne
//       odvodiť nedá (čínsky cyklus má 12 rokov, znamenie pokrýva ~30 dní).
//    ⚠️ Do heroglyfu ide ďalej LEN znamenie — `ownerZodiac` a
//       `ownerChineseZodiac` sú tie isté kľúče, aké písala stará obrazovka,
//       takže kód heroglyfu, certifikát ani `/welcome` o zmene nevedia.
//
// 🔑 MAJITEĽ JE POSLEDNÁ OTÁZKA, AŽ ZA PSOM (Matej 25. 9. 2026: *„krok 8 bude
//    majitel… najprv pes a potom pán"*). Reťaz je teda 6 PATRÓN → 7 POVAHA →
//    8 MAJITEĽ → odhalenie. Nie je to poradie kvôli poradiu: v heroglyfe sedí
//    malý rámik majiteľa VNÚTRI rámika psa, takže sa aj pýta v tom poradí —
//    a veta v bubline to hovorí nahlas.
//
// 🔑 ZÁPIS DO RÁMU JE OKAMŽITÝ — rovnako ako na PODSTATE, PATRÓNOVI a POVAHE.
//    Pohlavie, písmeno mena aj obe znamenia pristanú v malom kartuši v momente
//    voľby, nie na CTA. Malý rámik je VNÚTRI rámika psa (DOGMA: pes je
//    nadradený), takže je na jednej obrazovke vidieť aj to, čím sa človek stáva.
//
// 🐕 MULTIPSI (25. 9. 2026 večer). Matej: *„pri majiteľovi musíme vymyslieť
//    tiež multi psov... je to síce len raz vyplnený ale u každého psa bude mať
//    iný heroglyf"*. Malý rámik je u všetkých psov TEN ISTÝ človek — líši sa
//    len poradové číslo psa. Preto:
//    · prepínač psov je tu LEN NA PREZERANIE — nič sa pri ňom nevypĺňa znova,
//      CTA je jedno (POKRAČOVAŤ), žiadne ĎALŠÍ PES;
//    · rám dostáva `dogValues` psa na rade (jeho podstata, patrón, povaha)
//      + jeho `ranking`;
//    · poradie sa ODVODZUJE zo zoznamu kroku 3 (`dogOrderStart + poloha`),
//      presne ako ho tam ráta `DogsScreen` pre prvého psa. Na CTA sa zapíše
//      každému psovi do `dogEssence[idPsa].ranking`.
//
// ♈ ZNAMENIA SÚ CELÉ V POPUPE (Matej 25. 9. večer: *„kludne mozme znamenie dať
//    celé do popuu kde bude aj info aj výber podla datumu alebo ručne a na
//    hlavný obraz bude uť len výsledok"*). Na obrazovke ostal jeden riadok
//    s výsledkom a tlačidlom VYBRAŤ / ZMENIŤ; dátum, vysvetlenie o vinši aj
//    ručný výber sú v `zodiacSheet.tsx`.
// ════════════════════════════════════════════════════════════════════════════

/**
 * 🔴 DÁTUM NARODENIA SA UKLADÁ — A TEXT POD ZNAČKAMI TO NEPOPIERA.
 *
 * Matej 25. 9. 2026: *„nepis ze ho neukladame, kto chce nam ho da je to dobre
 * vedieť"* + *„vieme posielať vinše a darčeky"*. Dátum teda NIE JE odpad po
 * výpočte znamenia — je to dôvod, prečo vieme človeku v jeho deň napísať.
 * Kto ho dá, dá nám ho vedome; kto nechce, má odkaz „nechcem uviesť" a vyberie
 * si rovno znamenie. Obe cesty sú v poriadku, len sa o nich nesmie klamať.
 *
 * 🚩 V texte stojí IBA vinš, nie darček. Vinš vieme poslať hneď (dátum máme),
 *    darček je sľub, ktorý zatiaľ nič nekryje — a sľubovať v appke to, čo nie
 *    je postavené, je presne to, čo sa potom nedá dodržať. Keď darčeky vzniknú,
 *    patrí to do tejto vety.
 *
 * ⚠️ `PaymentScreen.tsx:133` posiela CELÝ objekt `selections` do
 *    `create-checkout`, odkiaľ ide do DB — dátum teda prehliadač OPÚŠŤA. Preto
 *    v texte pod značkami nesmie stáť „neukladáme ho": jedna veta navyše by
 *    z pravdivého vysvetlenia urobila nepravdivé tvrdenie o osobných údajoch.
 *    (Napísal som ju tam a vrátil — overenie cesty dát ju vyvrátilo.)
 * ⚠️ Do heroglyfu ide tak či tak IBA znamenie (pozície 10 a 11 kódu); dátum je
 *    údaj navyše, nie podmienka.
 */

/** Dve voľby pohlavia. Kresby sú z tej istej sady, akú kreslí rám (`genderMap`). */
const GENDERS = [{ v: 'man' }, { v: 'woman' }] as const;

export function OwnerScreen() {
  useFlowKeyboardFix();
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const flowOk = useFlowGuard();
  const medal = useSpeakMedal();

  const ownerName = useDogyptStore((s) => s.ownerName);
  const setOwnerName = useDogyptStore((s) => s.setOwnerName);
  const selections = useDogyptStore((s) => s.selections);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const dogEssence = useDogyptStore((s) => s.dogEssence);
  const setDogEssence = useDogyptStore((s) => s.setDogEssence);
  const dogOrderStart = useDogyptStore((s) => s.dogOrderStart);

  // ── KTORÉHO PSA PRÁVE UKAZUJEM (len náhľad) ───────────────────────────────
  const dogs = useFlowDogs();
  const [cur, setCur] = useState(0);
  const dog = dogs[Math.min(cur, Math.max(0, dogs.length - 1))];
  const dogId = dog?.id ?? MAIN_DOG_ID;
  /** Koľký pes v živote je pes na indexe `i` — ten istý výpočet ako krok 3. */
  const rankOf = (i: number) => (dogOrderStart || 1) + i;

  const [input, setInput] = useState(ownerName || '');
  const gender = selections.ownerGender || '';
  const birthday = selections.ownerBirthday || '';

  // Pole mena: na dotykovej obrazovke modal (iOS otvorí klávesnicu len na už
  // pripojenom vstupe), na myši priame písanie do poľa. Ten istý rozsudok ako
  // na kroku 2 — preto aj ten istý komponent modalu.
  const isMobile = useMemo(() => window.matchMedia('(pointer: coarse)').matches, []);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const nameModalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const deskInputRef = useRef<HTMLInputElement>(null);
  useBlockAutocorrect(deskInputRef);

  const openNameModal = () => {
    nameModalRef.current?.classList.add('is-open');
    nameInputRef.current?.focus();
    setNameModalOpen(true);
  };
  const closeNameModal = () => {
    nameInputRef.current?.blur();
    setNameModalOpen(false);
  };

  /**
   * Meno ide do store pri KAŽDEJ zmene, nie na CTA — písmeno v ráme sa má
   * meniť pod prstom. `ownerName` je zároveň jediný zdroj pre `initialLetter`,
   * takže rám a náhľad vedľa poľa nikdy neukazujú dve rôzne písmená.
   */
  const typeName = (v: string) => {
    setInput(v);
    setOwnerName(v.trim().toUpperCase());
  };

  const trimmed = input.trim();
  const letter = initialLetter(trimmed) ?? '';
  const letterSvg = letterMap[letter] || null;

  // ── PORADIE PSA NA RADE (odvodené zo zoznamu kroku 3) ───────────────────────
  const rankNum = rankOf(Math.min(cur, Math.max(0, dogs.length - 1)));
  const hasRank = rankNum > 0;
  /** `1st` v angličtine, `1.` inde — tá istá pomôcka, akú mala obrazovka poradia. */
  const ordinal = (n: number) => {
    if (lang !== 'en') return `${n}.`;
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
  };

  // ── DÁTUM → DVE ZNAMENIA ───────────────────────────────────────────────────
  const bd = (() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthday);
    if (!m) return null;
    return { y: +m[1], m: +m[2], d: +m[3] };
  })();
  /**
   * Znamenia sa čítajú ZO STORE, nie z dátumu — dostať sa tam dajú dvoma
   * cestami: z dátumu narodenia (bežná) alebo ručným výberom v popupe
   * („nechcem uviesť"). Obrazovka o tom, ktorá to bola, nemusí vedieť nič.
   */
  const westName = selections.ownerZodiac || '';
  const chinName = selections.ownerChineseZodiac || '';
  const western = westName ? { name: westName } : null;
  const chinese = chinName ? { name: chinName } : null;

  /** Otvorený popup znamení. */
  const [sheet, setSheet] = useState(false);

  const pickDate = (d: number, m: number, y: number) => {
    setSelection('ownerBirthday', `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    // Obe znamenia sú ODVODENÉ, ale do store idú ako hodnota — heroglyf,
    // certifikát aj `/welcome` čítajú `ownerZodiac` / `ownerChineseZodiac`
    // a o dátume nevedia nič.
    setSelection('ownerZodiac', getWesternZodiac(m, d).name);
    setSelection('ownerChineseZodiac', getChineseZodiac(y).name);
    setSheet(false);
  };

  /**
   * Znamenia BEZ dátumu. `ownerBirthday` sa zámerne NEZAPISUJE — celý zmysel
   * tejto cesty je, že citlivý údaj nikde nevznikne. Rok slúži len na výpočet
   * čínskeho zvieraťa a do store ide už len jeho výsledok.
   */
  const pickSigns = (sign: string, year: number) => {
    // Kto znamenie vyberie ručne, dátum nedal — a ten, ktorý prípadne zadal
    // predtým, sa zahadzuje. Inak by v store ostal údaj, o ktorom si človek
    // myslí, že ho odvolal.
    setSelection('ownerBirthday', '');
    setSelection('ownerZodiac', sign);
    setSelection('ownerChineseZodiac', getChineseZodiac(year).name);
    setSheet(false);
  };

  const canGo = trimmed.length >= 1 && !!gender && !!western && !!chinese;

  /**
   * POKRAČOVAŤ. Majiteľ je jeden, ale poradie je psie — každý pes dostane
   * svoje číslo do `dogEssence`, prvý pes ho má navyše v `selections`
   * (heroglyf, certifikát a platba čítajú odtiaľ).
   */
  const goOn = () => {
    if (!canGo) return;
    dogs.forEach((d, i) => {
      setDogEssence(d.id, 'ranking', String(rankOf(i)));
      if (d.id === MAIN_DOG_ID) setSelection('ranking', String(rankOf(i)));
    });
    navigate('/heroglyph/reveal');
  };

  if (!flowOk) return null;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}{FLOW_GLYPH_CSS}{FLOW_DOG_CSS}{OWNER_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/dog-character')} />
      </div>

      <div className="hf-stage">
        <div className="w-full max-w-xl flex flex-col items-center">

          {/* ── 1. BLOK: HEKTHOR SA PÝTA ────────────────────────────────── */}
          <motion.div
            className="hf-speak ow-speak"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <FlowMedallion src={hekthorFace('owner-info')} size={medal} />
            <span className="say">
              <h2>
                {t('heroglyph.flow.owner.questionPrefix')}
                <b>{t('heroglyph.flow.owner.questionWord')}</b>
                {t('heroglyph.flow.owner.questionSuffix')}
              </h2>
              <p>{t('heroglyph.flow.owner.sub')}</p>
            </span>
          </motion.div>

          {/* ── 2. BLOK: RÁM → PORADIE → KTO SI → NARODENIE ──────────────── */}
          <motion.div
            className="hf-block hf-carved ow-stack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            <div className="hf-plate">

              {/* KOHO HEROGLYF PRÁVE VIDÍM — rovnaký riadok ako na PODSTATE,
                  PATRÓNOVI a POVAHE, ale LEN NA PREZERANIE: majiteľ sa vypĺňa
                  raz, psy sa líšia len číslom a psou časťou rámu. */}
              <FlowDogHeader dogs={dogs} cur={cur} onGo={setCur} />
              <span className="fdh-rule" aria-hidden />

              <HeroglyphFrame
                showOwner
                // Pes NA RADE: jeho podstata, patrón, povaha + jeho poradie.
                dogValues={{ ...(dogEssence[dogId] || {}), ranking: String(rankNum) }}
                ghostValues={HEKTHOR_GLYPH}
                className="hf-glyph ow-glyph"
                // 🔴 Šírka cez `style`, nie cez triedu — `HeroglyphFrame` si píše
                // `width: '100%'` INLINE a pravidlo z hárku by prehralo.
                style={{ width: 'var(--flow-glyph-w)' }}
              />

              {/* ── KTO SI: mriežka 30 / 70 (Matej 25. 9. 2026) ──────────────
                  *„zmenšiť text žena muž alebo zväčšiť tie tlačidlá hore cez
                  riadok a to poradie psa sa zarovná so začiatkom textarey
                  s krstným menom… blok sa rozdelí na 30/70, na 30 časti budú
                  veľké tlačidlá cez dva riadky a vedľa dva riadky"*.
                  Vľavo dve dlaždice pohlavia na výšku OBOCH riadkov, vpravo
                  poradie psa a pod ním meno + písmeno — oba riadky začínajú
                  na tej istej zvislici. */}
              <p className="hf-legend">{t('heroglyph.flow.owner.whoLegend')}</p>

              <div className="ow-who">
                <div className="ow-genders">
                {GENDERS.map((g) => (
                  <button
                    key={g.v}
                    type="button"
                    // `is-gold` = zlatá poloha dlaždice zo spoločného šatu (Matej
                    // 25. 9.: *„tlačítka s ikonami — daj zlaté"*). Ten istý recept
                    // ako PODSTATA a „žije tvoj pes?" na kroku 2 — dve voľby
                    // s kresbou majú vyzerať rovnako naprieč vstupom.
                    className={`hf-pick is-gold ow-gender${gender === g.v ? ' on' : ''}`}
                    aria-pressed={gender === g.v}
                    onClick={() => setSelection('ownerGender', g.v)}
                  >
                    <span className="well"><img src={genderMap[g.v]} alt="" /></span>
                    <span className="tx">{t(`heroglyph.flow.ownerInfo.${g.v}`)}</span>
                  </button>
                ))}
                </div>

                <div className="ow-right">
                  <div className="ow-order">
                    <span className="tx">
                      {hasRank
                        ? t('heroglyph.flow.owner.orderLine', {
                            dogName: dog?.name || t('heroglyph.flow.yourDogFallback'),
                            ord: ordinal(rankNum),
                          })
                        : t('heroglyph.flow.owner.orderMissing')}
                    </span>
                    <button type="button" className="ow-change" onClick={() => navigate('/heroglyph/dogs')}>
                      {hasRank ? t('heroglyph.flow.owner.orderChange') : t('heroglyph.flow.owner.orderPick')}
                    </button>
                  </div>

                  <div className="ow-namerow">
                    {isMobile ? (
                      <button
                        type="button"
                        className={`hf-field ow-name${trimmed ? ' is-valid' : ''}`}
                        onClick={openNameModal}
                      >
                        {/* Krátky tvar — v riadku s pohlavím a písmenom ostane poľu
                            na telefóne ~120 px a dlhý placeholder by sa odsekol. */}
                        {trimmed || t('heroglyph.checkout.firstName')}
                      </button>
                    ) : (
                      <input
                        ref={deskInputRef}
                        className={`hf-field ow-name${trimmed ? ' is-valid' : ''}`}
                        value={input}
                        onChange={(e) => typeName(e.target.value.toUpperCase().slice(0, 30))}
                        placeholder={t('heroglyph.flow.ownerInfo.placeholder')}
                        maxLength={30}
                        name="ownerName"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    )}
                    {/* Náhľad písmena = presne ten symbol, ktorý práve pristál v ráme. */}
                    <span className={`ow-mark${letterSvg ? ' on' : ''}`}>
                      {letterSvg ? <img src={letterSvg} alt={letter} /> : <i>?</i>}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── ČO O TEBE HOVORIA HVIEZDY — len VÝSLEDOK ─────────────────
                  Dátum, vysvetlenie o vinši a ručný výber sú v popupe
                  (`zodiacSheet.tsx`). Tu stojí vlys, dve značky, mená znamení
                  a jedno tlačidlo. Celý riadok je ťukací — kto ťukne na
                  otáznik, chce presne to, čo tlačidlo. */}
              <p className="hf-legend">{t('heroglyph.flow.ownerZodiac.question')}</p>

              <button type="button" className="ow-stars" onClick={() => setSheet(true)}>
                <span className={`ow-mark${western ? ' on' : ''}`}>
                  {western ? <img src={zodiacMap[western.name]} alt="" /> : <i>?</i>}
                </span>
                <span className={`ow-mark${chinese ? ' on' : ''}`}>
                  {chinese ? <img src={chineseMap[chinese.name]} alt="" /> : <i>?</i>}
                </span>
                <span className="ow-said">
                  {western && chinese
                    ? `${t(`heroglyph.flow.ownerZodiac.sign.${western.name}`)} · ${t(`heroglyph.flow.ownerZodiac.animal.${chinese.name}`)}`
                    : t('heroglyph.flow.owner.signsEmpty')}
                </span>
                <span className="ow-change">
                  {western && chinese ? t('heroglyph.flow.owner.orderChange') : t('heroglyph.flow.owner.orderPick')}
                </span>
              </button>

              <button type="button" className="hf-cta" disabled={!canGo} onClick={goOn}>
                {t('heroglyph.flow.breed.continue')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <ZodiacSheet
        open={sheet}
        birthday={bd}
        sign={westName || undefined}
        year={bd?.y}
        onClose={() => setSheet(false)}
        onDate={pickDate}
        onManual={pickSigns}
      />

      {isMobile && <FlowTextModal
        open={nameModalOpen}
        value={input}
        placeholder={t('heroglyph.flow.ownerInfo.placeholder')}
        title={t('heroglyph.flow.owner.nameTitle')}
        doneLabel={t('heroglyph.flow.message.done')}
        closeLabel={t('nav.aria.close')}
        rootRef={nameModalRef}
        inputRef={nameInputRef}
        onChange={typeName}
        onDone={closeNameModal}
        onClose={closeNameModal}
        fieldName="ownerName"
      />}
    </div>
  );
}

/**
 * Šat obrazovky. Materiál (doska, vlys, voľba, pole, CTA) si berie z
 * `FLOW_CARVE_CSS` a `FLOW_PALE_CSS` — tu je len to, čo má iba táto obrazovka.
 *
 * 📏 ROZPOČET VÝŠKY (mantinel `PAGE_AIR`, Matejovo okno 1477×724):
 *    javisko 724 − lišta 81 − vzduch 2×24 = **595 px**.
 *    bublina 104 + medzera 8 + doska (rám 104 · vlys 16 ·
 *    KTO SI 96 (dva riadky 44 + 8, poradie je v nich) · vlys 16 · dátum 40 · mená 18 · CTA 40 + 7 medzier po 8 +
 *    2×18 výplň) = **~416 px**, teda rezerva ~75 px (25. 9.: pohlavie a meno
 *    zliate do jedného riadka).
 * 🔴 JE TO NAJPLNŠIA OBRAZOVKA VSTUPU — nesie štyri odpovede proti jednej až
 *    dvom inde. Kto sem pridá prvok, MUSÍ iný zmenšiť (lock 24. 9.: zmenšuje sa
 *    OBSAH, nie rezerva od okraja).
 */
const OWNER_CSS = `
/* Bublina: stupeň písma viazaný na ŠÍRKU BUBLINY (cqw), nie na okno — tá istá
   dvojica hodnôt ako PODSTATA, PATRÓN a POVAHA. */
.ow-speak { container-type: inline-size; margin-bottom: 8px; }
.ow-speak h2 { font-size: clamp(18px, 4.6cqw, 20px); }
.ow-speak h2 b { color: ${LAB.goldInk}; font-weight: 700; }
/* Osem prvkov pod sebou — rozstup je 8, nie 12 ako na POVAHE. Tá nesie jednu
   otázku, táto štyri. */
.ow-stack .hf-plate { gap: 8px; }

/* ── RÁM ─────────────────────────────────────────────────────────────────
   ⚠️ 72 %, nie 84 ako na POVAHE: pod rámom stoja štyri úseky namiesto jedného
   radu, takže rám je jediný prvok, z ktorého sa dá ubrať bez toho, aby prestal
   byť čitateľný. Pod 70 % splývajú symboly v malých slotoch. */
/* 🔒 Šírku rámu určuje LOCK \`FLOW_GLYPH_CSS\` (\`--flow-glyph-w\`), nie táto
   obrazovka — na každom kroku musí byť heroglyf rovnako veľký (Matej 25. 9.).
   Vlastné percento sa sem NEVRACIA; keď sa obsah nezmestí, ustúpi obsah. */

/* ── PORADIE ─────────────────────────────────────────────────────────────
   Nie je to otázka, je to STAV — preto riadok, nie dlaždica. Papyrusová jamka
   ako pole, aby bolo vidieť, že údaj prišiel odinakiaľ a dá sa s ním hýbať. */
.ow-order {
  width: 100%; min-height: 44px; display: flex; align-items: center; gap: 8px;
  padding: 4px 8px 4px 12px; border-radius: ${PACK_R.tile}px;
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.55), rgba(242, 226, 189, 0.45));
  border: 1px solid ${LAB.hairline};
}
.ow-order .tx {
  flex: 1 1 auto; min-width: 0;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.25;
  color: ${LAB.inkSoft};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* 🔵 ZMENIŤ je AKCIA, teda lapis — a je to odkaz späť na krok 2, nie druhé CTA,
   preto obrys namiesto plnej plochy (lock: plná plocha len pre jediné CTA). */
.ow-change {
  flex: 0 0 auto; height: 26px; padding: 0 10px; cursor: pointer;
  border-radius: ${PACK_R.pill}px; border: 1.5px solid ${LAPIS.edge};
  background: transparent; color: ${LAPIS.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  transition: background 150ms ease, color 150ms ease;
}
.ow-change:hover { background: ${LAPIS.edge}; color: #FDF7E7; }

/* ── KTO SI: mriežka 30 / 70 (25. 9. 2026, druhá podoba v ten istý deň) ─────
   Vľavo dve dlaždice pohlavia na výšku OBOCH riadkov, vpravo poradie psa
   a pod ním meno + písmeno. Poradie a meno tak začínajú na TEJ ISTEJ zvislici
   (Matej: *„poradie psa sa zarovná so začiatkom textarey s krstným menom"*).
   ⚠️ Ľavý stĺpec je \`minmax(min-content, 3fr)\`, nie holé 3fr: na telefóne je
      30 % ~90 px a EN „WOMAN" / RU „ЖЕНЩИНА" by v dlaždici pretiekli. Keď
      nápis nevojde, stĺpec narastie a ustúpi pravá strana, nie text. */
.ow-who {
  width: 100%; display: grid; gap: 8px;
  grid-template-columns: minmax(min-content, 3fr) minmax(0, 7fr);
}
.ow-right { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.ow-namerow { height: 44px; display: flex; align-items: stretch; gap: 8px; }
/* Pole si berie materiál \`.hf-field\`; mobilná podoba je tlačidlo, takže
   potrebuje zarovnanie textu doľava a výšku poľa. */
.ow-name {
  flex: 1 1 auto; min-width: 0; height: auto; text-align: left;
  text-transform: uppercase; letter-spacing: 0.05em;
}
/* Prázdne pole nesmie kričať veľkými písmenami cez placeholder. */
.ow-name:placeholder-shown { text-transform: none; letter-spacing: normal; }
/* 📱 Na telefóne je pole TLAČIDLO (otvára popup), takže \`:placeholder-shown\`
   nezaberie a dlhý text by sa zalomil na tri riadky cez vlys pod ním (merané
   25. 9. na 390 px). Jeden riadok, tri bodky; prázdne tlačidlo bez verzálok. */
button.ow-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
button.ow-name:not(.is-valid) { text-transform: none; letter-spacing: normal; }

/* ── NÁHĽAD SYMBOLU (písmeno · znamenie · zviera) ─────────────────────────
   Jeden tvar pre všetky tri: sú to VÝSLEDKY, nie voľby. Prázdny je tichá jamka
   s otáznikom, plný dostane lapisový lem — tá istá reč ako \`.hf-field.is-valid\`. */
.ow-mark {
  /* ⚠️ 36, nie 40 (25. 9.): riadok hviezd pribudol k dátumu a obrazovka na
     Matejovom okne pretiekla o 2 px. Rám je zamknutý, takže ustupujú náhľady —
     sú to značky, nie plochy, do ktorých sa ťuká. */
  flex: 0 0 auto; width: 36px; height: 36px; display: grid; place-items: center;
  border-radius: ${PACK_R.tile}px; overflow: hidden;
  border: 1.5px solid ${LAB.hairline};
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.65), rgba(242, 226, 189, 0.5));
}
.ow-mark.on { border-color: ${LAPIS.edge}; }
.ow-mark img { width: 26px; height: 26px; object-fit: contain; }
.ow-mark i {
  font-style: normal; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px;
  color: ${LAB.inkMuted};
}

/* Písmeno v riadku mena je štvorec vo výške riadka — menšie \`.ow-mark\`
   (36) ostáva pri hviezdach. */
.ow-namerow .ow-mark { width: 44px; height: auto; }
.ow-namerow .ow-mark img { width: 30px; height: 30px; }

/* ── POHLAVIE ────────────────────────────────────────────────────────────
   Dve VEĽKÉ dlaždice cez oba riadky — kresba hore, nápis MUŽ / ŽENA pod ňou.
   Materiál je spoločný \`.hf-pick\`; mení sa len smer a rozmer. */
.ow-genders { display: flex; gap: 8px; }
.ow-gender {
  flex: 1 1 0; width: auto; min-width: 0; padding: 8px 6px;
  flex-direction: column; justify-content: center; gap: 6px;
}
.ow-gender .tx { font-size: 12px; line-height: 1; letter-spacing: 0.06em; white-space: nowrap; }
/* 🔴 KRESBA V JAMKE MUSÍ MAŤ ROZMER. Bez neho si SVG vezme svoju natívnu výšku
   a silueta vytečie z dlaždice von (merané 25. 9.: nohy muža aj ženy viseli
   30 px pod okrajom). Tá istá pasca a to isté riešenie ako na PODSTATE
   (\`.es-picks .hf-pick .well img\`). */
.ow-gender .well { width: 48px; height: 48px; }
.ow-gender .well img { width: 40px; height: 40px; object-fit: contain; }

/* ── ČO O TEBE HOVORIA HVIEZDY — riadok VÝSLEDKU ─────────────────────────
   Od 25. 9. večer je to jeden ťukací riadok: dve značky · mená · VYBRAŤ /
   ZMENIŤ. Dátum a ručný výber sú v popupe. Materiál je jamka poradia
   (\`.ow-order\`) — obe sú STAV s tlačidlom, nie voľba. */
.ow-stars {
  width: 100%; display: flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 4px 8px 4px 4px; border-radius: ${PACK_R.tile}px; text-align: left;
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.55), rgba(242, 226, 189, 0.45));
  border: 1px solid ${LAB.hairline};
}
.ow-said {
  flex: 1 1 auto; min-width: 0; margin: 0;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.06em; text-transform: uppercase; color: ${LAB.inkSoft};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* V riadku je ZMENIŤ \`span\`, nie tlačidlo (celý riadok je tlačidlo) — text
   preto centruje flex, nie výška riadka tlačidla. */
.ow-stars .ow-change { display: inline-flex; align-items: center; }
.ow-stars:hover .ow-change { background: ${LAPIS.edge}; color: #FDF7E7; }

/* ── ZAMKNUTÉ CTA NESIE MATERIÁL, NIE PRIESVITNOSŤ ────────────────────────
   Ten istý recept ako na PATRÓNOVI a POVAHE: 40 % lapisu je na papyruse šedá
   plocha cez celú šírku dosky (Matej to zamietol 31. 8. 2026). */
.ow-stack .hf-cta:disabled {
  opacity: 1; cursor: default;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  color: ${LAB.inkMuted};
  box-shadow: none;
  border: 1.5px solid ${LAB.hairline};
}

/* ── 📱 TELEFÓN ──────────────────────────────────────────────────────────
   Dátum a dve značky sa do 360 px v jednom riadku nezmestia — rolety pod 96 px
   prestanú ukazovať názov mesiaca. Riadok sa preto zalomí a značky idú pod
   dátum, doprostred. */
/* 📱 Na telefóne sa do riadka nezmestí text aj mená — mená idú preč a ostávajú
   len značky (kresba znamenia je zrozumiteľnejšia než jej názov v 9 px). */
@media (max-width: 559px) {
  .ow-said { font-size: 10px; }
  /* 📱 V pravých 70 % ostáva na telefóne ~180 px a ZMENIŤ si z nich berie 76 —
     veta o poradí by sa skrátila na „HEKT…" (merané 25. 9. na 390 px). Zalomí
     sa preto na dva riadky menším písmom; výška riadka (44) sa nemení. */
  .ow-order .tx {
    white-space: normal; font-size: 12px; line-height: 1.2;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .ow-gender { padding: 6px 4px; }
  .ow-gender .tx { font-size: 10px; }
  .ow-gender .well { width: 40px; height: 40px; }
  .ow-gender .well img { width: 34px; height: 34px; }
}
/* 🔴 KRÁTKE OKNO — a MUSÍ to stáť AŽ TU. Obe podmienky majú rovnakú
   špecificitu, takže rozhoduje poradie (tá istá pasca, čo 24. 9. zožrala
   zmenšenie siluet na PATRÓNOVI). */
/* ── 🔴 NÍZKE OKNO — a je jedno, či je to telefón, alebo Matejov notebook ─────
   Pravidlá tu stáli pôvodne len pre iPhone SE (max-width 559 AND max-height 700)
   a nízke ŠIROKÉ okno tým vypadlo — pritom je na ňom MAJITEĽ rovnako tesný:
   merané 25. 9. na 1477×660 mu pod doskou ostal 1 px. Rozhoduje VÝŠKA, nie šírka.
   🔑 Ustupuje OBSAH, nie rezerva od okraja (lock PAGE_AIR): výplň dosky,
      rozstupy, výška dlaždíc a náhľadov. Rám má vlastnú stupnicu vo
      FLOW_GLYPH_CSS a tá je spoločná pre celý vstup. */
@media (max-height: 700px) {
  .ow-stack .hf-plate { padding: 14px 16px; gap: 5px; }
  .ow-stack .hf-cta { height: 36px; }
  .ow-speak { margin-bottom: 4px; }
  .ow-order { min-height: 30px; }
  .ow-mark { width: 36px; height: 36px; }
  .ow-mark img { width: 24px; height: 24px; }
  .ow-namerow { height: 38px; }
  .ow-order { min-height: 38px; }
  .ow-namerow .ow-mark { width: 38px; }
  .ow-namerow .ow-mark img { width: 26px; height: 26px; }
  .ow-gender { padding: 6px 4px; gap: 4px; }
  .ow-gender .well { width: 38px; height: 38px; }
  .ow-gender .well img { width: 32px; height: 32px; }
}

/* ── 📱 VYSOKÝ TELEFÓN: VIAC VZDUCHU V BLOKOCH ───────────────────────────────
   Ten istý zásah ako na PATRÓNOVI a POVAHE a z tej istej Matejovej vety
   (*„mali by sme mať každú obrazovku cca rovnako vyplnenú"*). Merané 25. 9. na
   390×844: MAJITEĽ mal 83 %, teda na spodnej hrane pásma 82–95 %, hoci susedné
   kroky tam už vzduch dostali — pri prechode by pôsobil stiesnene.
   ⚠️ LEN VYSOKÝ TELEFÓN (min-height 701). Na iPhone SE je táto obrazovka na
      95 % a ďalšia výplň by ju potopila. */
@media (max-width: 559px) and (min-height: 701px) {
  .ow-speak { padding: 16px; margin-bottom: 12px; }
  /* ⚠️ BOČNÝ PADDING 22 JE ZHODNÝ SO SUSEDMI, hoci zvislý je menší. Rám berie
     na telefóne 100 % vnútra dosky, takže 20 vs. 22 znamenalo rám 306 px tu a
     302 px na patrónovi — teda presne to, čo lock zakazuje. */
  .ow-stack .hf-plate { padding: 26px 22px; gap: 12px; }
}
`;
