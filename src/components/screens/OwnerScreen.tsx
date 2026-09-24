import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { useBlockAutocorrect } from '@/hooks/useBlockAutocorrect';
import { PageTopBar } from '@/components/PageTopBar';
// ⚠️ Sady symbolov sa berú Z RÁMU, nevymenúvajú sa tu znovu — inak by náhľad
//    vedľa poľa a slot v ráme boli dve rôzne sady toho istého.
import { HeroglyphFrame, letterMap, zodiacMap, chineseMap, genderMap } from '@/components/HeroglyphFrame';
import { DateDropdowns } from '@/components/DateDropdowns';
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
//    ⚠️ Dátum sa DRŽÍ MIMO STORE (`sessionStorage`, viď `BD_KEY`) — do DB ide
//       len znamenie. Bez jeho uloženia by sa pri návrate na krok nedal
//       obnoviť: zo znamenia sa deň ani rok spätne odvodiť nedá (čínsky cyklus
//       má 12 rokov, západné znamenie pokrýva ~30 dní).
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
// ════════════════════════════════════════════════════════════════════════════

/** Prvý rok, ktorý koliesko dátumu ponúkne. Zhodné so starou obrazovkou. */
const MIN_YEAR = 1930;

/**
 * 🔴 DÁTUM NARODENIA ŽIJE MIMO `selections` — A JE TO BEZPEČNOSTNÉ ROZHODNUTIE.
 *
 * `PaymentScreen.tsx:133` posiela CELÝ objekt `selections` do `create-checkout`,
 * odkiaľ sa ukladá do DB. Čokoľvek, čo doň zapíšem, teda opustí prehliadač.
 * Dátum narodenia človeka pritom nepotrebujeme nikde: do heroglyfu ide IBA
 * znamenie (`ownerZodiac`, `ownerChineseZodiac`, pozície 10 a 11 kódu).
 *
 * Preto sa dátum drží v `sessionStorage` — obrazovka si ho pri návrate na krok
 * prečíta, ale do platby ani do DB sa nedostane. Vďaka tomu je veta pod
 * značkami („použijeme ho na výpočet, neukladáme ho") PRAVDIVÁ aj na bežnej
 * ceste, nielen pri odkaze „nechcem uviesť".
 * ⚠️ Kto sem dátum vráti do `selections`, musí zároveň prepísať tú vetu —
 *    inak appka o osobných údajoch klame.
 */
const BD_KEY = 'dogypt-owner-bd';

/** Dve voľby pohlavia. Kresby sú z tej istej sady, akú kreslí rám (`genderMap`). */
const GENDERS = [{ v: 'man' }, { v: 'woman' }] as const;

export function OwnerScreen() {
  useFlowKeyboardFix();
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const flowOk = useFlowGuard();
  const medal = useSpeakMedal();

  const dogName = useDogyptStore((s) => s.dogName);
  const ownerName = useDogyptStore((s) => s.ownerName);
  const setOwnerName = useDogyptStore((s) => s.setOwnerName);
  const selections = useDogyptStore((s) => s.selections);
  const setSelection = useDogyptStore((s) => s.setSelection);

  const [input, setInput] = useState(ownerName || '');
  const gender = selections.ownerGender || '';
  const [birthday, setBirthday] = useState(() => {
    try { return sessionStorage.getItem(BD_KEY) || ''; } catch { return ''; }
  });

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

  // ── PORADIE Z KROKU 2 ──────────────────────────────────────────────────────
  const rankNum = parseInt(selections.ranking || '', 10);
  const hasRank = Number.isFinite(rankNum) && rankNum > 0;
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

  const pickDate = (d: number, m: number, y: number) => {
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setBirthday(iso);
    // Mimo store (viď `BD_KEY`): do DB ide znamenie, nie dátum.
    try { sessionStorage.setItem(BD_KEY, iso); } catch { /* súkromné okno */ }
    // Obe znamenia sú ODVODENÉ, ale do store idú ako hodnota — heroglyf,
    // certifikát aj `/welcome` čítajú `ownerZodiac` / `ownerChineseZodiac`
    // a o dátume nevedia nič.
    setSelection('ownerZodiac', getWesternZodiac(m, d).name);
    setSelection('ownerChineseZodiac', getChineseZodiac(y).name);
  };

  /** Otvorený popup „nechcem uviesť". */
  const [sheet, setSheet] = useState(false);
  /**
   * Znamenia BEZ dátumu. `ownerBirthday` sa zámerne NEZAPISUJE — celý zmysel
   * tejto cesty je, že citlivý údaj nikde nevznikne. Rok slúži len na výpočet
   * čínskeho zvieraťa a do store ide už len jeho výsledok.
   */
  const pickSigns = (sign: string, year: number) => {
    // Kto znamenie vyberie ručne, dátum už nedal — a ten, ktorý prípadne zadal
    // predtým, sa zahadzuje. Inak by v pamäti ostal údaj, o ktorom si človek
    // myslí, že ho odvolal.
    setBirthday('');
    try { sessionStorage.removeItem(BD_KEY); } catch { /* súkromné okno */ }
    setSelection('ownerZodiac', sign);
    setSelection('ownerChineseZodiac', getChineseZodiac(year).name);
    setSheet(false);
  };

  const today = useMemo(() => new Date(), []);
  const canGo = trimmed.length >= 1 && !!gender && !!western && !!chinese;

  if (!flowOk) return null;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}{FLOW_GLYPH_CSS}{OWNER_CSS}</style>

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

              <HeroglyphFrame
                showOwner
                ghostValues={HEKTHOR_GLYPH}
                className="hf-glyph ow-glyph"
                // 🔴 Šírka cez `style`, nie cez triedu — `HeroglyphFrame` si píše
                // `width: '100%'` INLINE a pravidlo z hárku by prehralo.
                style={{ width: 'var(--flow-glyph-w)' }}
              />

              {/* ── PORADIE (len stav + odkaz na krok 2) ───────────────────── */}
              <div className="ow-order">
                <span className="tx">
                  {hasRank
                    ? t('heroglyph.flow.owner.orderLine', {
                        dogName: dogName || t('heroglyph.flow.yourDogFallback'),
                        ord: ordinal(rankNum),
                      })
                    : t('heroglyph.flow.owner.orderMissing')}
                </span>
                <button type="button" className="ow-change" onClick={() => navigate('/heroglyph/dogs')}>
                  {hasRank ? t('heroglyph.flow.owner.orderChange') : t('heroglyph.flow.owner.orderPick')}
                </button>
              </div>

              {/* ── KTO SI: meno + písmeno, pod tým pohlavie ───────────────── */}
              <p className="hf-legend">{t('heroglyph.flow.owner.whoLegend')}</p>

              <div className="ow-who">
                {isMobile ? (
                  <button
                    type="button"
                    className={`hf-field ow-name${trimmed ? ' is-valid' : ''}`}
                    onClick={openNameModal}
                  >
                    {trimmed || t('heroglyph.flow.ownerInfo.placeholder')}
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

              {/* ── ČO O TEBE HOVORIA HVIEZDY ────────────────────────────────
                  🔴 VLYS NEHOVORÍ „NARODIL SI SA" (Matej 25. 9.: *„a nie narodil
                     si sa ale: čo o tebe hovoria hviezdy"*). Dátum nie je to, čo
                     od človeka chceme — chceme znamenia. Dátum je len cesta
                     k nim, a preto to hneď pod ním aj stojí.
                  ⚠️ Kľúč `ownerZodiac.question` existuje v 18 jazykoch a znamená
                     presne túto vetu; nový sa nezakladá. */}
              <p className="hf-legend">{t('heroglyph.flow.ownerZodiac.question')}</p>

              <div className="ow-date">
                <DateDropdowns
                  day={bd?.d ?? 1}
                  month={bd?.m ?? 1}
                  year={bd?.y ?? 1990}
                  empty={!bd}
                  emptyLabels={{
                    day: t('heroglyph.flow.dogs.phDay'),
                    month: t('heroglyph.flow.dogs.phMonth'),
                    year: t('heroglyph.flow.dogs.phYear'),
                  }}
                  minYear={MIN_YEAR}
                  maxYear={today.getFullYear()}
                  maxDate={today}
                  skin="pale"
                  onChange={pickDate}
                />
              </div>

              {/* 🔴 TEXT STOJÍ VEDĽA ZNAČIEK, NIE POD NIMI (Matej 25. 9.: *„dolu
                  tu info daj vedla blokov so znameniami aby sme nepredlžovali
                  výšku bloku = najprv text a vedľa dva bloky a vedľa názvy
                  znamení"*). Tri veci v jednom riadku namiesto dvoch riadkov pod
                  sebou — a `MAJITEĽ` je najplnšia obrazovka vstupu, takže každý
                  ušetrený riadok je ten, o ktorý sa nemusí zmenšovať rám.
                  🔑 Vysvetlenie je zároveň jediné miesto, kde sa človek dozvie,
                     že dátum nikam neukladáme — preto v ňom rovno stojí aj
                     odkaz „nechcem uviesť". */}
              <div className="ow-stars">
                <p className="tx">
                  {t('heroglyph.flow.owner.signsHint')}{' '}
                  <button type="button" className="ow-optout" onClick={() => setSheet(true)}>
                    {t('heroglyph.flow.owner.optOut')}
                  </button>
                </p>
                <span className={`ow-mark${western ? ' on' : ''}`}>
                  {western ? <img src={zodiacMap[western.name]} alt="" /> : <i>?</i>}
                </span>
                <span className={`ow-mark${chinese ? ' on' : ''}`}>
                  {chinese ? <img src={chineseMap[chinese.name]} alt="" /> : <i>?</i>}
                </span>
                {/* Názvy znamení — kým ich nepoznáme, miesto drží pomlčka, aby
                    riadok pri vyplnení dátumu nepodskočil. */}
                <span className="ow-said">
                  {western && chinese
                    ? `${t(`heroglyph.flow.ownerZodiac.sign.${western.name}`)} · ${t(`heroglyph.flow.ownerZodiac.animal.${chinese.name}`)}`
                    : '—'}
                </span>
              </div>

              <button type="button" className="hf-cta" disabled={!canGo} onClick={() => canGo && navigate('/heroglyph/reveal')}>
                {t('heroglyph.flow.breed.continue')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <ZodiacSheet
        open={sheet}
        sign={westName || undefined}
        year={bd?.y}
        onClose={() => setSheet(false)}
        onDone={pickSigns}
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
 *    bublina 104 + medzera 8 + doska (rám 104 · poradie 34 · vlys 16 · pole 40 ·
 *    pohlavie 52 · vlys 16 · dátum 40 · mená 18 · CTA 40 + 8 medzier po 8 +
 *    2×18 výplň) = **464 px**, teda rezerva 27 px.
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
  width: 100%; min-height: 30px; display: flex; align-items: center; gap: 8px;
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

/* ── KTO SI ──────────────────────────────────────────────────────────────── */
.ow-who { width: 100%; display: flex; align-items: center; gap: 8px; }
/* Pole si berie materiál \`.hf-field\`; mobilná podoba je tlačidlo, takže
   potrebuje zarovnanie textu doľava a výšku poľa. */
.ow-name {
  flex: 1 1 auto; min-width: 0; height: 40px; text-align: left;
  text-transform: uppercase; letter-spacing: 0.05em;
}
/* Prázdne pole nesmie kričať veľkými písmenami cez placeholder. */
.ow-name:placeholder-shown { text-transform: none; letter-spacing: normal; }

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

/* ── POHLAVIE ────────────────────────────────────────────────────────────
   Dve dlaždice \`.hf-pick\` na celú šírku. Materiál sa nepíše znovu — mení sa
   len to, že si delia riadok. */
.ow-genders { width: 100%; display: flex; gap: 8px; }
.ow-gender { flex: 1 1 0; min-width: 0; height: 52px; padding: 6px 10px; }
/* 🔴 KRESBA V JAMKE MUSÍ MAŤ ROZMER. Bez neho si SVG vezme svoju natívnu výšku
   a silueta vytečie z dlaždice von (merané 25. 9.: nohy muža aj ženy viseli
   30 px pod okrajom). Tá istá pasca a to isté riešenie ako na PODSTATE
   (\`.es-picks .hf-pick .well img\`). */
.ow-gender .well { width: 40px; height: 40px; }
.ow-gender .well img { width: 34px; height: 34px; object-fit: contain; }

/* ── ČO O TEBE HOVORIA HVIEZDY ───────────────────────────────────────────
   Dátum je celý riadok sám; pod ním JEDEN riadok, v ktorom stoja vedľa seba
   vysvetlenie, dve značky a názvy znamení (Matej 25. 9.: *„aby sme
   nepredlžovali výšku bloku"*). Predtým to boli dva riadky pod sebou. */
.ow-date { width: 100%; }
.ow-stars { width: 100%; display: flex; align-items: center; gap: 8px; }
/* Text si berie zvyšok riadka a smie sa zalomiť — je to jediný prvok, ktorý to
   znesie. Značky a názvy majú pevnú šírku, takže riadok nikdy nepreskočí. */
.ow-stars .tx {
  flex: 1 1 auto; min-width: 0; margin: 0;
  font-family: 'Space Grotesk', sans-serif; font-size: 11px; line-height: 1.3;
  color: ${LAB.inkMuted};
}
/* 🔵 „NECHCEM UVIESŤ" JE AKCIA, teda lapis — ale vnútri vety, takže podčiarknutý
   text, nie tlačidlo. Plná plocha patrí jedinému CTA na doske. */
.ow-optout {
  display: inline; padding: 0; border: none; background: none; cursor: pointer;
  font: inherit; color: ${LAPIS.edge}; text-decoration: underline;
  text-underline-offset: 2px;
}
/* Mená znamení — pevná šírka, aby sa riadok pri vyplnení dátumu nepohol. */
.ow-said {
  flex: 0 0 auto; max-width: 132px; margin: 0; text-align: right;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 11px;
  letter-spacing: 0.06em; text-transform: uppercase; color: ${LAB.inkSoft};
  overflow: hidden; text-overflow: ellipsis;
}

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
  .ow-said { display: none; }
  .ow-stars .tx { font-size: 10px; }
}
/* 🔴 KRÁTKE OKNO — a MUSÍ to stáť AŽ TU. Obe podmienky majú rovnakú
   špecificitu, takže rozhoduje poradie (tá istá pasca, čo 24. 9. zožrala
   zmenšenie siluet na PATRÓNOVI). */
@media (max-height: 700px) {
  .ow-stack .hf-plate { gap: 6px; }
  .ow-stack .hf-cta { height: 36px; }
  .ow-speak { margin-bottom: 4px; }
  .ow-gender { height: 46px; }
}
@media (max-width: 559px) and (max-height: 700px) {
  /* ⚠️ 66 %, nie 78 (merané 25. 9. na 375×667: doska pretekala o 5 px). Pribudlo
     VYSVETLENIE pod značkami — na 375 px sa zalomí na dva riadky, teda +16 px.
     Ustupuje rám, nie rezerva od okraja (lock PAGE_AIR). */
  /* Plocha vysvetlenia počíta s dvoma riadkami, aby doska pri zadaní dátumu
     (keď ho vystrieda jednoriadkové meno znamenia) nepodskočila. */
  .ow-said { min-height: 32px; }
  /* Ešte 12 px z prvkov, nie z rámu: pod 66 % by symboly v malých slotoch
     splynuli (tá istá hranica, akú má PATRÓN). So 4 px rezervy by obrazovku
     pretiekol hocijaký dlhší preklad. */
  .ow-order { min-height: 30px; }
  .ow-mark { width: 36px; height: 36px; }
  .ow-mark img { width: 24px; height: 24px; }
  /* 🔒 RÁM SA UŽ NEZMENŠUJE (lock \`FLOW_GLYPH_CSS\`), takže na najkratšom okne
     ustupuje všetko ostatné: výplň dosky, rozstupy a výška dlaždíc pohlavia.
     MAJITEĽ je najplnšia obrazovka vstupu — nesie štyri odpovede — a práve on
     to číslo pre celý vstup vymedzuje. */
  .ow-stack .hf-plate { padding: 14px 16px; gap: 5px; }
  .ow-gender { height: 42px; }
  .ow-gender .well { width: 34px; height: 34px; }
  .ow-gender .well img { width: 28px; height: 28px; }
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
