import { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore, MAIN_DOG_ID } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { PageTopBar } from '@/components/PageTopBar';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS } from '@/components/screens/flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS, useSpeakMedal } from '@/components/screens/flowMedallion';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { BRAND_GOLD_BTN, PACK_R } from '@/components/pack/packTheme';
import { hekthorFace } from '@/lib/hekthorFaces';
import { HEKTHOR_GLYPH } from '@/lib/hektor';

// Symboly podstaty — tie isté súbory, aké kreslí `HeroglyphFrame`. Voľba a rám
// tým ukazujú DOSLOVA to isté; dvojica obrázkov pre jednu vec sa raz rozíde.
import kingSvg from '@/assets/gender/GENDER-MALE.svg';
import queenSvg from '@/assets/gender/GENDER-FEMALE.svg';
import brightSvg from '@/assets/colour/COLOUR-BRIGHT.svg';
import darkSvg from '@/assets/colour/COLOUR-DARK.svg';
import mixSvg from '@/assets/colour/COLOUR-MIX.svg';
import raisedSvg from '@/assets/fate/FATE-RAISED.svg';
import rescuedSvg from '@/assets/fate/FATE-RESCUED.svg';
import aristocratSvg from '@/assets/bloodline/BLOODLINE-ARISTOCRAT.svg';
import muttSvg from '@/assets/bloodline/BLOODLINE-MUTT.svg';

// ════════════════════════════════════════════════════════════════════════════
// PODSTATA — štyri sloty heroglyfu na JEDNEJ obrazovke (24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 24. 9. 2026: *„prenes mi to do live podoby a uvidíme"* nad nákresom
// `plany/nakres-heroflow-symboly-2026-08-31.html` + *„urobíme niečo medzi"*
// ním a `nakres-heroflow-cely-2026-08-31.html`.
//
// 🔑 ČO SA TÝMTO RUŠÍ: štyri samostatné routy `/heroglyph/dog-gender`,
//    `dog-fate`, `dog-colour`, `dog-bloodline`. Boli to štyri obrazovky so
//    ZHODNOU stavbou (rám + bublina + dve dlaždice), teda štyri načítania a
//    štyri čakania na to isté. Tu je jeden rám, ktorý sa pred očami plní.
//    ⚠️ Staré obrazovky sa NEMAŽÚ — starý (LIVE) vstup ide ďalej cez ne.
//
// 🔑 PORADIE OTÁZOK = PORADIE SLOTOV V RÁME (pohlavie · farba · pôvod ·
//    rodokmeň), nie abecedne a nie „od najľahšej". Kto sa pozrie na rám, vidí,
//    kam práve píše; iné poradie by z rámu urobilo hádanku.
//
// 🔴 PRI VIACERÝCH PSOCH SA PREPÍNA PES, NIE OBRAZOVKA. A prepínač konečne má
//    čo prepínať: `dogEssence[idPsa]` v store (pribudlo v ten istý deň). Tri
//    nákresy z 31. 8. ho kreslili a všetky tri ho samé volali kulisou, lebo
//    `selections` je jeden plochý záznam pre jedného psa — druhá odpoveď by
//    prepísala prvú.
//    ⚠️ PRVÝ PES sa píše AJ do `selections`: certifikát, platba a zvyšok vstupu
//       čítajú ďalej odtiaľ. Kým multi-mód nie je celý, von to ísť nesmie.
//
// ⚠️ ČERVENÁ AŽ KEĎ TÉMU OBÍDEM (`seen`). Bez toho svietia štyri červené chipy
//    v momente, keď človek ešte nič neurobil — teda „máš tam štyri chyby".
//    Neutrálny chip je ten istý šat ako nevybraná voľba, a to je správne.
// ════════════════════════════════════════════════════════════════════════════

/** Pauza medzi psami. 1400 ms z nákresu — dosť na prečítanie, nie na nudu. */
const HANDOVER_MS = 1400;
/** Ako dlho po voľbe pulzuje slot v ráme, kým príde ďalšia otázka. */
const PICK_MS = 420;

type Opt = { v: string; icon: string; label: string; sub?: string };
type Topic = { key: string; label: string; chip: string; ask: string; opts: Opt[] };

/** Štyri otázky. Texty sú EXISTUJÚCE kľúče zo starých obrazoviek — preklady do
 *  18 jazykov sú hotové a nové kľúče by ich zhodili na EN fallback. */
function useTopics(): Topic[] {
  const t = useT();
  return useMemo(() => [
    {
      key: 'dogGender',
      label: t('heroglyph.flow.dogGender.title'),
      chip: t('heroglyph.flow.essence.chipGender'),
      ask: `${t('heroglyph.flow.dogGender.questionPrefix')} ${t('heroglyph.flow.dogGender.questionKing')} ${t('heroglyph.flow.dogGender.questionOr')} ${t('heroglyph.flow.dogGender.questionQueen')}${t('heroglyph.flow.dogGender.questionSuffix')}`,
      opts: [
        { v: 'king', icon: kingSvg, label: t('heroglyph.flow.dogGender.king') },
        { v: 'queen', icon: queenSvg, label: t('heroglyph.flow.dogGender.queen') },
      ],
    },
    {
      key: 'dogColour',
      label: t('heroglyph.flow.dogColour.title'),
      chip: t('heroglyph.flow.essence.chipColour'),
      ask: `${t('heroglyph.flow.dogColour.questionPrefix')} ${t('heroglyph.flow.dogColour.questionCoat')}${t('heroglyph.flow.dogColour.questionSuffix')}`,
      opts: [
        { v: 'bright', icon: brightSvg, label: t('heroglyph.flow.dogColour.bright'), sub: t('heroglyph.flow.dogColour.brightSub') },
        { v: 'dark', icon: darkSvg, label: t('heroglyph.flow.dogColour.dark'), sub: t('heroglyph.flow.dogColour.darkSub') },
        { v: 'mix', icon: mixSvg, label: t('heroglyph.flow.dogColour.mix'), sub: t('heroglyph.flow.dogColour.mixSub') },
      ],
    },
    {
      key: 'dogFate',
      label: t('heroglyph.flow.dogFate.title'),
      chip: t('heroglyph.flow.essence.chipOrigin'),
      ask: `${t('heroglyph.flow.dogFate.questionPrefix')} ${t('heroglyph.flow.dogFate.questionSafe')} ${t('heroglyph.flow.dogFate.questionOr')} ${t('heroglyph.flow.dogFate.questionSecond')}${t('heroglyph.flow.dogFate.questionSuffix')}`,
      opts: [
        { v: 'raised', icon: raisedSvg, label: t('heroglyph.flow.dogFate.raised') },
        { v: 'rescued', icon: rescuedSvg, label: t('heroglyph.flow.dogFate.rescued') },
      ],
    },
    {
      key: 'dogBloodline',
      label: t('heroglyph.flow.dogBloodline.title'),
      chip: t('heroglyph.flow.essence.chipBloodline'),
      ask: `${t('heroglyph.flow.dogBloodline.questionPrefix')}${t('heroglyph.flow.dogBloodline.questionPure')}${t('heroglyph.flow.dogBloodline.questionOr')}${t('heroglyph.flow.dogBloodline.questionWild')}${t('heroglyph.flow.dogBloodline.questionSuffix')}`,
      opts: [
        { v: 'aristocrat', icon: aristocratSvg, label: t('heroglyph.flow.dogBloodline.aristocrat') },
        { v: 'mutt', icon: muttSvg, label: t('heroglyph.flow.dogBloodline.mutt') },
      ],
    },
  ], [t]);
}

export function EssenceScreen() {
  const navigate = useNavigate();
  const t = useT();
  const flowOk = useFlowGuard();
  const topics = useTopics();

  const dogName = useDogyptStore((s) => s.dogName);
  const dogPhotoUrl = useDogyptStore((s) => s.dogPhotoUrl);
  const extraDogs = useDogyptStore((s) => s.extraDogs);
  const mainDogPos = useDogyptStore((s) => s.mainDogPos);
  const dogEssence = useDogyptStore((s) => s.dogEssence);
  const setDogEssence = useDogyptStore((s) => s.setDogEssence);
  const setSelection = useDogyptStore((s) => s.setSelection);

  /**
   * Zoznam psov v poradí, v akom ich človek zoradil v kroku 3 — prvý pes stojí
   * na `mainDogPos`, nie vždy na začiatku (`DogsScreen` ho tam vie presunúť).
   * Poradie sa tu NERADÍ ZNOVA: pes na rade musí byť ten istý, ktorého človek
   * videl prvého v zozname.
   */
  const dogs = useMemo(() => {
    const rest = extraDogs.map((d) => ({ id: d.id, name: d.name, photo: d.photoUrl }));
    const main = { id: MAIN_DOG_ID, name: dogName, photo: dogPhotoUrl || null };
    const at = Math.max(0, Math.min(mainDogPos, rest.length));
    return [...rest.slice(0, at), main, ...rest.slice(at)];
  }, [extraDogs, dogName, dogPhotoUrl, mainDogPos]);

  /**
   * Priemer veľkej fotky psa. Matejovo „zväčšiť o 300 %" z 28 px pilulky je
   * 112; beriem 124 na mobile a 148 od 768 px, aby fotka mala rovnakú váhu ako
   * medailón na kroku 2 a pes bol naozaj rozpoznateľný.
   * ⚠️ Prepočítava sa pri zmene okna — hodnota z prvého renderu by pri ťahaní
   *    okna ostala visieť.
   */
  const [cur, setCur] = useState(0);
  const [step, setStep] = useState(0);
  /** Na ktorých témach ktorý pes UŽ STÁL. Rozdiel medzi „ešte som tam nebol"
   *  (neutrál) a „bol som tam a nechal to tak" (červená). */
  const [seen, setSeen] = useState<Record<string, Record<string, true>>>({});
  const [handover, setHandover] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /** Hektor je na telefóne väčší (104), na PC 80 — Matej 24. 9. na kroku PATRÓN.
   *  Prenesené aj sem: dva susedné kroky s rôzne veľkým Hektorom vyzerajú ako
   *  dva návrhy. Na PC sa nemení nič. */
  const medal = useSpeakMedal();
  const dog = dogs[Math.min(cur, dogs.length - 1)];
  const dogId = dog?.id ?? MAIN_DOG_ID;
  const picks = dogEssence[dogId] || {};
  const topic = topics[step];

  // Kde stojím, to vidím — téma na rade sa značí ako „bol som tu".
  useEffect(() => {
    if (handover !== null || !topic) return;
    setSeen((s) => ({ ...s, [dogId]: { ...(s[dogId] || {}), [topic.key]: true } }));
  }, [dogId, topic, handover]);

  const dogDone = (id: string) => topics.every((q) => (dogEssence[id] || {})[q.key]);
  const allDone = dogs.every((d) => dogDone(d.id));
  const missing = dogs.find((d) => !dogDone(d.id));

  /** Prvá nezodpovedaná téma daného psa; -1 keď je hotový. */
  const firstOpen = (id: string) => topics.findIndex((q) => !(dogEssence[id] || {})[q.key]);

  const handlePick = (value: string) => {
    if (!topic) return;
    setDogEssence(dogId, topic.key, value);
    // 🔴 Prvý pes ide AJ do `selections` — heroglyf, certifikát a platba čítajú
    //    ďalej odtiaľ. Ostatní psi zatiaľ žijú len v `dogEssence`.
    if (dogId === MAIN_DOG_ID) setSelection(topic.key, value);

    const after = { ...picks, [topic.key]: value };
    const nextOpen = topics.findIndex((q) => !after[q.key]);
    if (nextOpen >= 0) {
      timer.current = setTimeout(() => setStep(nextOpen), PICK_MS);
      return;
    }
    // Pes je hotový. Ak niekto ďalší chýba, prepneme sa NA NEHO — s medzikartou,
    // aby prepnutie nebolo prekvapenie (nákres 31. 8.).
    const nextDog = dogs.findIndex((d, i) => i !== cur && !dogDone(d.id));
    if (nextDog >= 0) {
      timer.current = setTimeout(() => {
        setHandover(nextDog);
        timer.current = setTimeout(() => {
          setCur(nextDog);
          setStep(Math.max(0, firstOpen(dogs[nextDog].id)));
          setHandover(null);
        }, HANDOVER_MS);
      }, PICK_MS);
    }
  };

  const goDog = (i: number) => {
    if (i === cur || handover !== null) return;
    setCur(i);
    const open = firstOpen(dogs[i].id);
    setStep(open >= 0 ? open : 0);
  };

  /**
   * Šípka ← cúva PO OTÁZKACH; z prvej vedie von z kroku (nákres 31. 8.).
   *
   * 🔴 VON ZNAMENÁ E-MAIL, NIE „PREČO" (Matej 24. 9. 2026: *„keď dám v labe krok
   *    dozadu, ukáže mi toto — zmaž to, to je neaktuálna obrazovka"*). Krok
   *    PREČO je odvesený, takže šípka doň nesmie viesť ani tu: reťaz je
   *    e-mail → podstata, a späť sa ide tou istou cestou, akou sa prišlo.
   */
  const back = () => {
    if (step > 0) { setStep(step - 1); return; }
    navigate('/heroglyph/email');
  };

  if (!flowOk) return null;

  const chipState = (i: number): 'done' | 'miss' | 'todo' => {
    const q = topics[i];
    if (picks[q.key]) return 'done';
    if (i === step && handover === null) return 'todo';
    return seen[dogId]?.[q.key] ? 'miss' : 'todo';
  };

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}{ESSENCE_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={back} />
      </div>

      <div className="hf-stage">
        {/* ── BUBLINA JE NAD DOSKOU, VŽDY ─────────────────────────────────
            Tretie kolo ju na širokom a nízkom okne odsúvalo VEDĽA dosky, aby sa
            ušetrila výška. Matej to 24. 9. zamietol: *„majú byť pod sebou"*.
            Stavba je preto jedna pre každé okno — odôvodnenie a namerané čísla
            sú pri zrušenom pravidle v `ESSENCE_CSS`. */}
        <div className="w-full max-w-xl flex flex-col items-center es-col">

          {/* ── 1. BLOK: HEKTHOR SA PÝTA (24. 9. 2026, druhé kolo) ──────────
              🔴 BUBLINA JE ÚPLNE HORE (Matej: *„Hektor bublina pôjde úplne
                 hore, 1. blok — zväčši foto ako je v kroku tvoja svorka"*).
                 Ráno stála pod fotkou psa; vtedy bola hlavou obrazovky tvoja
                 tvár. Matej to prehodil: **najprv sa niekto pýta, potom je
                 vidno, koho sa to týka.**
              ⚠️ 104 px je veľkosť Z KROKU SVORKY (`DogsScreen`) — nie nové
                 číslo. Matejova voľba „C" z hárku štyroch veľkostí (24. 9.).
              ⚠️ Bublina sa NESKRÝVA ani počas medzikarty — jej zmiznutie menilo
                 výšku obrazovky, a tá sa meniť nemá. */}
          <motion.div className="hf-speak es-speak" layout transition={{ duration: 0.28 }}>
            {/* ⚠️ 104 → 80 (Matej 24. 9., štvrté kolo: *„zmenšiť foto hektora/psa,
                CTA a pod."*). Ranné 104 bolo prevzaté z kroku SVORKA, kde je
                Hektor hlavou obrazovky; tu stojí len ako ten, kto sa pýta, a
                obrazovka potrebovala výšku inde. */}
            <FlowMedallion src={hekthorFace('essence')} size={medal} />
            <span className="say">
              <AnimatePresence mode="wait" initial={false}>
                <motion.h2
                  key={handover !== null ? 'hand' : topic?.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {handover !== null ? `✓ ${dog?.name}` : topic?.ask}
                </motion.h2>
              </AnimatePresence>
            </span>
          </motion.div>

          {/* JEDNA DOSKA: rám, pás tém a otázka. Rám je nad otázkou zámerne —
              odpoveď má pristáť tam, kam sa človek práve pozeral. */}
          <motion.div
            className="hf-block hf-carved es-stack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            <div className="hf-plate">
              {/* ── KTO JE OPISOVANÝ ────────────────────────────────────
                  🔴 FOTKA A MENO SÚ VEDĽA SEBA A VNÚTRI DOSKY, NAD RÁMOM
                     (Matej 24. 9. 2026: *„fotku opisovaného psa s menom dajme
                     vedľa seba a dajme ju do 2. bloku nad heroglyf, oddeľme
                     rytinou"*). Dôvod nie je len miesto: pes, ktorého práve
                     opisujem, patrí k RÁMU, ktorý sa plní — nie nad dosku ako
                     samostatná hlava. Vedľa seba to navyše ušetrí riadok
                     s menom, takže obrazovka klesla bez jediného zmenšovania.
                  ⚠️ Rytina pod riadkom je tá istá drážka ako vlysy pri nadpise
                     (`FLOW_CARVE_CSS`): tmavá hrana + svetlá pod ňou. */}
              <div className="es-who">
                {dog?.photo
                  ? <img className="es-dogphoto" src={dog.photo} alt={dog?.name || ''} />
                  : (
                    <span className="es-dogphoto es-dogphoto--empty">
                      {(dog?.name || '?').slice(0, 1)}
                    </span>
                  )}
                <span className="es-name">
                  {dog?.name || t('heroglyph.flow.yourDogFallback')}
                  {dogDone(dogId) && <i className="es-ok">✓</i>}
                </span>
                {dogs.length > 1 && (
                  <div className="es-switch">
                    <button
                      type="button"
                      className="es-arrow"
                      // ⚠️ Vlastný kľúč si nezakladám — `whatNext.prev/next` je
                      //    preložené v 18 jazykoch a znamená presne toto.
                      aria-label={t('whatNext.prev')}
                      onClick={() => goDog((cur - 1 + dogs.length) % dogs.length)}
                    >‹</button>
                    <em>{cur + 1}/{dogs.length}</em>
                    <button
                      type="button"
                      className="es-arrow"
                      aria-label={t('whatNext.next')}
                      onClick={() => goDog((cur + 1) % dogs.length)}
                    >›</button>
                  </div>
                )}
              </div>
              <span className="es-rule" aria-hidden />

              <HeroglyphFrame
                showOwner
                dogValues={picks}
                // Podmalba: Hektorov glyf slabo v prázdnych slotoch, aby rám
                // nepôsobil prázdno (Matej 24. 9.). Pod vybranou voľbou zmizne.
                ghostValues={HEKTHOR_GLYPH}
                pulseSlot={handover === null ? topic?.key : undefined}
                className="es-glyph"
                // 🔴 ŠÍRKA IDE CEZ `style`, NIE CEZ TRIEDU. `HeroglyphFrame` si
                // píše `style={{ width: '100%' }}` inline a inline zápis prebije
                // akékoľvek pravidlo v hárku — `.es-glyph { width: 78% }` tu
                // preto 24. 9. celý deň VISELO MŔTVE a rám stál na plnej šírke
                // (merané: 575 px namiesto 448). Prop `style` sa v komponente
                // rozbaľuje AŽ ZA `width: '100%'`, takže tadiaľ sa presadí.
                style={{ width: 'var(--es-glyph-w)' }}
              />

              <div className="es-chips">
                {topics.map((q, i) => {
                  const st = chipState(i);
                  return (
                    <button
                      key={q.key}
                      type="button"
                      className={`es-chip ${st}${i === step && handover === null ? ' on' : ''}`}
                      onClick={() => handover === null && setStep(i)}
                    >
                      <span className="st">{st === 'done' ? '✓' : st === 'miss' ? '!' : ''}</span>
                      <span className="lb">{q.chip}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {handover !== null ? (
                  <motion.div
                    key="handover"
                    className="es-hand"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <b>✓ {dog?.name}</b>
                    <span className="es-next">
                      {dogs[handover]?.photo && <img className="es-face" src={dogs[handover].photo!} alt="" />}
                      <b>{dogs[handover]?.name}</b>
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`q-${topic?.key}`}
                    className="es-q"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                  >
                    {/* ⚠️ Nadpis témy ani otázka tu UŽ NIE SÚ. Otázku hovorí
                        Hektor v bubline nad doskou a názov témy nesie zelený
                        chip — trojmo to isté slovo robilo z dosky zoznam. */}
                    <div className={`es-picks${(topic?.opts.length ?? 2) > 2 ? ' n3' : ''}`}>
                      {topic?.opts.map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          // `is-gold` = zlatá poloha dlaždice zo spoločného šatu
                          // (`FLOW_CARVE_CSS`). Od 25. 9. ju nesie aj otázka
                          // „žije tvoj pes?" na kroku MENO — jeden recept, dve miesta.
                          className={`hf-pick is-gold${picks[topic.key] === o.v ? ' on' : ''}`}
                          onClick={() => handlePick(o.v)}
                        >
                          <span className="well"><img src={o.icon} alt="" /></span>
                          <span className="tx">
                            {o.label}
                            {o.sub && <em>{o.sub}</em>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── RAD AKCIE — PEVNÁ VÝŠKA ─────────────────────────────────
                  🔴 Matej 24. 9. 2026: *„keď prepnem na druhého psa, dolu pod
                     tlačítkami sa objaví text a zväčší celý 2. blok? prečo? je
                     to nevyhnutné? oprav to"*. Nie je to nevyhnutné — bola to
                     moja chyba. Brána (odkaz na chýbajúceho psa) aj CTA pribúdali
                     DO TOKU, takže doska narástla presne v momente prepnutia psa.
                     Rad má odteraz výšku VŽDY, aj keď je prázdny: obsah sa
                     v ňom mení, rozmer nie.
                  ⚠️ Výška je výška CTA (`--es-act`), nie odhad — inak by sa
                     blok pri objavení tlačidla zväčšil znova. */}
              <div className="es-act">
              {allDone ? (
                /* CTA je LAPISOVÉ (`.hf-cta`), nie zlaté: doska je bledá a
                   brandový kánon od 28. 8. 2026 hovorí lapis na bledom podklade,
                   zlato na naozaj tmavom. Zlaté tu vyzeralo ako nábytok. */
                <button type="button" className="hf-cta es-cta" onClick={() => navigate('/heroglyph/breed')}>
                  {t('heroglyph.flow.name.continue')}
                </button>
              ) : handover === null && missing && missing.id !== dogId ? (
                <button
                  type="button"
                  className="es-gate"
                  onClick={() => goDog(dogs.findIndex((d) => d.id === missing.id))}
                >
                  {missing.name || t('heroglyph.flow.yourDogFallback')} ↗
                </button>
              ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/** Šat obrazovky. Rytiny, jamky a tint si berie z `FLOW_CARVE_CSS` — tu je len
 *  to, čo má iba táto obrazovka: prepínač psov, pás tém a rám. */
const ESSENCE_CSS = `
/* ── VZDUCH NAD OBSAHOM = VZDUCH POD NÍM ──────────────────────────────────
   🔴 Matej 24. 9. (piate kolo): *„vycentroval obsah blokov tak aby bola medzera
   od progres baru po blok a od spodného okraja po blok totožná aby to vyzeralo
   súmerne (na každej obrazovke)"*. Medzitým tu stálo \`margin-top: 0\` (obsah
   ukotvený hore) — bola to odpoveď na *„aby sa to zmestilo hore"*, keď doska
   ešte merala 475 px a visela v strede. Po zoštíhlení na 427 px je súmerné
   rozloženie to isté ako „hore" a navyše to platí pre celý vstup.
   ⚠️ Nič sa tu preto NEPRETLÁČA — súmernosť robí spoločné
   \`.hf-stage > * { margin: auto }\` z \`FLOW_STAGE_CSS\`. Keby tu znova pribudlo
   vlastné pravidlo, rozíde sa táto obrazovka so zvyškom flow. */
/* ── KTO JE OPISOVANÝ ──────────────────────────────────────────────────────
   Riadok VNÚTRI dosky, nad rámom, oddelený rytinou. Ráno to bol stĺpec nad
   doskou (fotka, pod ňou meno) — Matej to poobede prehodil na dvojicu vedľa
   seba a presunul dnu, k rámu, ktorý sa plní. */
/* 🔴 FOTKA + MENO STOJA V STREDE BLOKU (Matej 24. 9., piate kolo: *„foto a meno
   psa by som centroval do stredu bloku takto vedľa seba = posuň to doprava aby
   obsah toho riadku bol na strede"*). Dovtedy boli zarovnané doľava a meno
   naťahovalo zvyšok riadka.
   🔑 Prečo MRIEŽKA a nie \`justify-content: center\`: prepínač psov sa musí držať
   pravého kraja, a ten by dvojicu odtlačil doľava — stred by potom platil len
   pri jedinom psovi. Dva prázdne \`1fr\` stĺpce po krajoch sú vždy rovnaké, takže
   dvojica stojí na strede BLOKU, nie na strede zvyšku po prepínači.
   ⚠️ Preto sa prepínač nesmie prepnúť na \`position: absolute\` — pri dlhom mene
   by sa naň meno nasunulo. Mriežka mu miesto vyhradí. */
.es-who {
  display: grid; grid-template-columns: 1fr auto auto 1fr;
  align-items: center; gap: 10px; width: 100%;
}
.es-who .es-dogphoto { grid-column: 2; }
/* Meno nerastie ani nekrčí susedov — šírku si berie podľa textu a pri dlhom mene
   ustúpi písmom (pravidlo nižšie), nie ellipsis. */
.es-who .es-name { grid-column: 3; justify-self: start; min-width: 0; }
.es-who .es-switch { grid-column: 4; justify-self: end; }
/* Pri dlhom mene ustúpi PÍSMO, nie posledné písmená — ellipsis v mene psa je
   to najhoršie, čo môže na tejto obrazovke stáť. */
@media (max-width: 420px) { .es-who .es-name { font-size: 17px; } }
.es-who .es-switch { flex: 0 0 auto; }
/* Rytina = tá istá drážka ako vlysy pri nadpise: tmavá hrana a svetlá pod ňou.
   Jedna šedá linka by bola čiara v tabuľke, nie zásah do plochy. */
.es-rule {
  display: block; width: 100%; height: 2px; border-radius: 1px; flex: none;
  background: linear-gradient(180deg,
    rgba(120, 86, 26, 0.34) 0 1px,
    rgba(255, 252, 240, 0.72) 1px 2px);
}
.es-dogphoto {
  width: 48px; height: 48px; border-radius: 999px; object-fit: cover; flex: none;
  display: grid; place-items: center;
  /* Vlások, nie obruč: fotka má byť FOTKA. Cloisonné rám ostáva Hektorovi, aby
     bolo na prvý pohľad jasné, kto sa pýta a kto je tvoj pes. */
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  box-shadow: 0 1px 3px rgba(60, 40, 10, 0.22);
}
.es-dogphoto--empty {
  background: radial-gradient(circle at 50% 35%, #F7ECD2 0%, #E8D5AA 100%);
  font-family: 'Cinzel', serif; font-size: 22px; color: #8a5a14;
}
.es-name {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Cinzel Decorative', 'Cinzel', serif; font-weight: 700;
  font-size: 19px; letter-spacing: 0.04em; line-height: 1.1;
  color: rgba(35, 22, 8, 0.90); text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
  text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── PREPÍNAČ PSOV ─────────────────────────────────────────────────────────
   Šípky a počítadlo POD menom. Meno nesie fotka nad nimi, takže v prepínači
   už druhýkrát nie je — inak stojí to isté slovo dvakrát nad sebou. */
.es-switch {
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.es-switch em {
  font-family: 'Space Grotesk', sans-serif; font-style: normal; font-size: 12px;
  letter-spacing: 0.10em; color: rgba(60, 40, 12, 0.52);
}

/* ── BUBLINA S OTÁZKOU ─────────────────────────────────────────────────────
   Recept je \`.hf-speak\` z kroku 3; tu sa mení len STUPEŇ písma, a to vo
   VLASTNEJ triede. \`SPEAK.title\` (24) je spoločná hodnota pre celý vstup a
   nesie ju aj krok 3 — zdvihnutím či znížením by sa ticho zmenil aj on.
   \`container-type\` dovolí viazať stupeň na ŠÍRKU BUBLINY (cqw), nie na okno. */
.es-speak { container-type: inline-size; margin-bottom: 8px; }

/* ── ⛔️ DVA STĹPCE ZRUŠENÉ (Matej 24. 9., štvrté kolo) ────────────────────
   *„prečo ich dávaš vedľa seba keď majú byť pod sebou?"* — sem patrili od
   tretieho kola: pri šírke ≥ 1000 a výške ≤ 860 išla bublina VEDĽA dosky.
   Nebolo to rozhodnutie o vzhľade, bola to náhrada za výšku — stojatá stavba
   vtedy na jeho okne (1477×724) pretekala o 47 px a hrana vyzerala odseknutá.
   🔑 Dôvod zanikol tým, čo sa stalo o kolo neskôr: doska schudla 475 → 427 px
   a prestala plávať na stred. Premerané po zmene, stojato: **543 px obsahu do
   595 px miesta na jeho okne, rezerva 52 px** — a aj na 1280×700 ešte 28 px.
   ⚠️ Keby sa doska niekedy zase natiahla, riešením NIE JE vrátiť dva stĺpce,
   ale zmenšiť obsah — to je pravidlo \`PAGE_AIR\`. */
/* Doska vstupu má spoločný rozstup 14 px; tu je päť medzier pod sebou, takže
   dva pixely z každej sú na tejto obrazovke rozdiel jedného riadka. */
.es-stack .hf-plate { gap: 10px; }
/* ⚠️ ŽIADNE STUPŇOVANIE PODĽA VÝŠKY OKNA. Ráno tu stálo, že na nízkom okne
   ustúpi hlava aj Hektor (88/108/124/148 px). Matej to zamietol: *„nič sa tu
   nemení veľkosťou = je to súrodé bez zväčšovania alebo scvrkávania
   s minimálnymi okrajmi hore a dolu"*. Obrazovka má JEDNU veľkosť; keď sa
   nezmestí, roluje sa — rezervu od okraja drží \`PAGE_AIR\`. */
/* ⚠️ Spodná hranica 18 (bola 16) — na telefóne je clamp vždy na nej, takže je to
   jediné číslo, ktoré tam platí. Matej 24. 9. na kroku PATRÓN: *„na mobile môžme
   zväčšiť prvý blok aj foto aj písmo"*; prenesené sem, aby sa kroky nerozišli.
   Na PC sa nemení nič — tam 4,6cqw drží strop 20. */
.es-speak h2 { font-size: clamp(18px, 4.6cqw, 20px); }
.es-arrow {
  flex: none; width: 34px; height: 34px; border-radius: 999px; cursor: pointer;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 252, 240, 0.85), 0 1px 2px rgba(60, 40, 10, 0.10);
  font-family: 'Cinzel', serif; font-size: 18px; line-height: 1; color: #8a5a14;
}
/* ⚠️ Tu stála DRUHÁ definícia \`.es-who\` — ranná pilulka (gradient, plný zlatý
   rám, polomer 999) z prvej verzie prepínača. Po presune riadka do dosky
   prebíjala nový riadok a fotka s menom sedeli v „tabletke" vnútri dosky, teda
   rám v ráme. Dve definície tej istej triedy v jednom šate = ten istý rozchod,
   ktorý si vyžiadal zrušenie druhého \`.hf-pick\`. */
.es-ok { font-style: normal; font-size: 12px; color: #2E5C3B; }
.es-face {
  flex: none; width: 28px; height: 28px; border-radius: 999px; object-fit: cover;
  box-shadow: 0 0 0 1.5px rgba(179, 130, 45, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.35);
}
.es-face--empty {
  display: grid; place-items: center; background: rgba(120, 86, 26, 0.14);
  font-family: 'Cinzel', serif; font-size: 13px; color: #8a5a14;
}

/* ── PÁS TÉM ───────────────────────────────────────────────────────────────
   Chipy s NÁZVOM, nie bodky (Matej 31. 8.): bodka povie „šesť krokov",
   názov povie „toto som už vybral a toto ešte nie". */
/* ── RÁM ───────────────────────────────────────────────────────────────────
   Farba je INKOUST papyrusu, nie \`--foreground\` z tmavého šatu: rám kreslí
   \`currentColor\`, takže na bledej doske by čierna pôsobila ako tlač, nie rytina. */
/* ⚠️ RÁM JE MENŠÍ, NIE PLNÁ ŠÍRKA (Matej 24. 9.: *„a heroglyf zmenšiť.. či?"* —
   áno). Je to najväčší jediný kus výšky na obrazovke a od chvíle, čo má
   podmalbu, sa dá čítať aj menší. 82 % šírky znamená ~18 % nižšiu výšku, lebo
   pomer strán drží \`viewBox\`. Pod 70 % už symboly v malých slotoch splývajú.
   🔴 **78 % PLATÍ LEN NA ŠIROKOM OKNE.** Na telefóne je doska sama úzka a
   sťahovanie na 78 % dalo rámu 63 px výšky proti 80 px na ostrom webe — symboly
   v malých slotoch zmizli. Do 560 px preto berie rám celú dosku, rovnako ako
   LIVE. Merané 24. 9. (šírka rámu × výška): 1280 → 448×120 (LIVE 516×138) ·
   1477×724 → 448×120 (LIVE 464×124) · 390 → 302×81 (LIVE 298×80).
   ⚠️ Číslo sa podáva ako premenná, lebo šírku zapisuje INLINE \`style\` na
   komponente — pravidlo z hárku by prehralo. */
.es-glyph { --es-glyph-w: 78%; max-width: 100%; margin-inline: auto; display: block; color: rgba(35, 22, 8, 0.88); }
@media (max-width: 559px) { .es-glyph { --es-glyph-w: 100%; } }

/* 🔴 NA MOBILE 2×2, NIE RAD (Matej 24. 9.: *„na mobile dať 4 chipy 2 a 2 pod
   seba zarovnané"*). Rad štyroch sa na 390 px zalomil kde sa mu chcelo — raz
   3+1, raz 2+2 podľa dĺžky prekladu, takže pás nikdy nesedel. Mriežka to určí. */
.es-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; width: 100%; }
@media (min-width: 560px) { .es-chips { grid-template-columns: repeat(4, 1fr); } }
.es-chip {
  flex: 1 1 auto; display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  padding: 5px 7px; border-radius: 999px; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-weight: 500;
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  background: rgba(255, 253, 247, 0.55); color: rgba(60, 40, 12, 0.62);
}
/* Posledný znak nesie rozstrelenie aj za sebou — bez orezania to je ~1 px na chip. */
.es-chip .lb { margin-right: -0.08em; white-space: nowrap; }
.es-chip .st { flex: 0 0 9px; width: 9px; text-align: center; font-size: 9.5px; line-height: 1; }
.es-chip.done { border-color: #3D7A4E; background: rgba(61, 122, 78, 0.12); color: #2E5C3B; }
.es-chip.miss { border-color: #B25640; background: rgba(178, 86, 64, 0.12); color: #8E3F2C; }
/* Kde stojím, hovorí PRSTENEC — nie farba. Farba už nesie „hotové / obídené". */
.es-chip.on { box-shadow: 0 0 0 2px rgba(22, 48, 122, 0.55); }

/* ── OTÁZKA ────────────────────────────────────────────────────────────────*/
.es-q { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.es-ask {
  margin: 0; text-align: center; font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 14px; line-height: 1.35; color: rgba(35, 22, 8, 0.90);
  text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
}
/* 🔴 ODPOVEDE SÚ VEDĽA SEBA A PLOCHA MÁ PEVNÚ VÝŠKU (Matej 24. 9., tretie kolo:
   *„nesedí mi to výškovo na PC, môžeš dať odpovede vedľa seba, nie pod seba"*).
   Pod sebou zaberali o jeden riadok viac, než na jeho okne (1477×724) bolo.
   ⚠️ Pevná výška \`--es-picks-h\` je to, čo drží Matejovo staršie *„nič sa tu
      nemení veľkosťou"*. Dve voľby v jednom rade a tri v dvoch radoch sú dve
      rôzne výšky; plocha je preto rovnaká vždy a dlaždice sa v nej NAŤAHUJÚ
      (\`stretch\`) — pri dvojici sú vyššie, pri trojici nižšie, ale doska stojí.
   ⚠️ Poradie pri farbe je Matejovo: *„tmavý, bledý v jednom riadku, mix
      samostatne v druhom"*. */
/* ⚠️ ROZOSTUP MEDZI DLAŽDICAMI JE VÄČŠÍ NEŽ MEDZI RIADKAMI (Matej 24. 9.:
   *„nemusia byť také veľké urob ich s väčšími rozostupmi"*) — \`gap: 8px 16px\`.
   Stĺpce dýchajú, ale tri voľby sa musia zmestiť do TEJ ISTEJ výšky ako dve,
   takže riadkový rozostup ostáva na 8. Obe čísla sú z \`PACK_SPACE\`. */
.es-picks {
  --es-picks-h: 80px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; width: 100%;
  min-height: var(--es-picks-h); align-items: stretch;
}
/* ── TRI VOĽBY: JEDEN RAD TROCH (Matej 24. 9., šieste kolo) ───────────────
   Rozhodnutie padlo nad tromi cestami: *„tri vedľa seba v jednom rade"*. Dôvod
   je jeho vlastné zadanie o kolo skôr — *„ikonky zväčši tie sú podstatné"*.
   Predtým tu boli dva rady (2+1) stlačené do výšky dvojice, takže ikonka pri
   FARBE spadla na 22 px proti 40 px pri ostatných otázkach; rad bol viditeľne
   slabší než zvyšok vstupu, hoci doska stála.
   🔑 V jednom rade má trojica TÚ ISTÚ výšku aj ikonku ako dvojica — doska sa
   ďalej nehýbe a *„nič sa tu nemení veľkosťou"* platí.
   ⚠️ CENA, ktorú Matej odklepol: dlaždica je užšia (~165 px), takže TEXT IDE POD
   IKONKU. Kriesi to výnimku „ikonka nad text", ktorá 24. 9. ráno zanikla — vtedy
   ju rušil OPAČNÝ stav (voľby stáli vedľa seba a na text ostávalo 80 px).
   Platí LEN pre trojicu; dvojica drží riadok, ikonka vedľa textu. */
.es-picks.n3 { grid-template-columns: repeat(3, 1fr); }
.es-picks.n3 .hf-pick {
  flex-direction: column; justify-content: center; gap: 4px;
  padding: 6px 10px; text-align: center;
}
.es-picks.n3 .hf-pick .tx { font-size: 13px; letter-spacing: 0.04em; }
/* Jamka o kúsok menšia než pri dvojici — v stĺpci pod ňou stojí ešte text a do
   80 px sa 52 + riadok nezmestí (odmerané: 102 px, doska by sa hýbala o 22 px). */
.es-picks.n3 .hf-pick .well { width: 44px; height: 44px; }
.es-picks.n3 .hf-pick .well img { width: 34px; height: 34px; }
/* 🔴 PODNADPIS (Sun · Moon · Rainbow) V STĹPCI NEJDE — a nie je to strata:
   je to DOSLOVA to, čo kreslí ikonka nad ním. V riadku (dvojica, mobil) bol
   druhou informáciou vedľa mena; v stĺpci by bol treťou vrstvou pod obrázkom
   toho istého a zobral by presne tú výšku, ktorú potrebuje ikonka. */
.es-picks.n3 .hf-pick .tx em { display: none; }

/* 📱 NA MOBILE OSTÁVA 2+1 (Matej: *„na mobile to môžeš nechať tak aby to bolo ok
   s rozmermi (iné od PC)"*). Tri stĺpce by na 390 px mali po ~90 px a slovo
   RAINBOW sa doň nezmestí ani na dva riadky. */
/* ── 📱 MOBIL: VOĽBY SÚ POD SEBOU, JEDNA NA RIADOK (Matej 24. 9., siedme kolo) ─
   *„na pc je to ok ale na mobile to dajme predsa len do riadkov… aj pohlavie aj
   tam kde sú 3 možnosti na mobile máme rezervu a môžme zväčšiť výšku"*.
   Dovtedy mal mobil dva stĺpce ako PC (a pri troch voľbách 2+1), takže na 302 px
   dosky pripadlo na dlaždicu ~145 px — ikonka aj meno sa tlačili do polovice
   šírky, hoci POD nimi ostávalo 220 px nevyužitej výšky.
   🔑 PLOCHA JE PEVNÁ AJ TU (190 px) a rady sa naťahujú (\`grid-auto-rows: 1fr\`).
   Dve voľby ⇒ dva rady po 91, tri ⇒ tri po 58. Keby plocha rástla s počtom
   volieb, doska by medzi otázkami poskakovala — a to je to jediné, čo sa na
   tejto obrazovke nesmie hýbať.
   ⚠️ Toto je JEDINÉ miesto, kde sa mobil zámerne líši od PC (Matej: *„iné od
   PC"*) — na PC ostávajú dva stĺpce a trojica v jednom rade. */
@media (max-width: 559px) {
  .es-picks {
    /* 190 = tri rady po 58 + dve medzery po 8. Nie je to odhad: 58 px je
       najmenšia výška, do ktorej sa vojde meno s podnadpisom vedľa jamky —
       pri 184 dala trojica 190 aj tak a doska medzi otázkami poskočila o 6 px. */
    --es-picks-h: 190px;
    grid-template-columns: 1fr;
    grid-auto-rows: 1fr;
  }
  /* Ikonka vedľa textu a podnadpis späť — v celej šírke riadka majú miesto. */
  .es-picks .hf-pick {
    flex-direction: row; justify-content: flex-start; gap: 12px;
    padding: 8px 14px; text-align: left;
  }
  .es-picks .hf-pick .tx em { display: block; }
  /* Trojica má rad o 32 px nižší než dvojica, takže jamka ustúpi — ale ostáva
     väčšia, než bola pri dvoch stĺpcoch (28 px). */
  .es-picks.n3 { grid-template-columns: 1fr; }
  .es-picks.n3 .hf-pick:nth-child(3) { grid-column: auto; }
  /* ⚠️ MUSÍ TU STÁŤ ZNOVA, hoci to isté hovorí pravidlo o riadok vyššie:
     \`.es-picks.n3 .hf-pick\` (tri triedy) prebíja \`.es-picks .hf-pick\` (dve),
     takže trojica ostávala v stĺpci aj na mobile — dlaždica mala 74 px namiesto
     56 a plocha narástla na 237 px. Špecificita, nie poradie. */
  .es-picks.n3 .hf-pick {
    flex-direction: row; justify-content: flex-start; gap: 12px;
    padding: 8px 14px; text-align: left;
  }
  .es-picks.n3 .hf-pick .tx em { display: block; }
  .es-picks.n3 .hf-pick .well { width: 40px; height: 40px; }
  .es-picks.n3 .hf-pick .well img { width: 30px; height: 30px; }
}
/* Symbol podstaty je KRESBA, nie ikonka rozhrania — jamka je preto väčšia než
   pri voľbe stavu psa a obrázok v nej dýcha. Riadok je aj vyšší: obrazovka
   pôsobila „scvrknuto" (Matej 24. 9.) a práve toto je jej najväčšia plocha. */
/* ── 🟨 ZLATÁ DLAŽDICA JE ODTERAZ SPOLOČNÁ — .hf-pick.is-gold (25. 9. 2026) ───
   Recept (plná brandová zlatá, tmavý inkoust, papyrusová jamka, lapisový lem pri
   výbere) aj s celým Matejovým odôvodnením sa PRESUNUL do FLOW_CARVE_CSS,
   lebo tú istú dlaždicu dostala aj otázka „žije tvoj pes?" na kroku MENO.
   Text je nezmenený, len sa presťahoval. Tu ostáva LEN geometria PODSTATY. */
.es-picks .hf-pick { padding: 8px 14px; gap: 12px; }
/* 🔴 IKONKA JE PODSTATA, NIE OZDOBA (Matej 24. 9.: *„ikonky zväčši tie sú
   podstatné"*). Je to ten istý symbol, aký sa o dva riadky vyššie vkreslí do
   rámu heroglyfu — čím väčší je tu, tým skôr si človek spojí voľbu s tým, čo mu
   pribudne do glyfu. LIVE flow ho má 48–64 px (\`DogGenderScreen\`, ikonka NAD
   textom); v riadku vedľa textu je strop daný výškou dlaždice. */
.es-picks .hf-pick .well { width: 52px; height: 52px; }
.es-picks .hf-pick .well img { width: 40px; height: 40px; object-fit: contain; }
.es-picks .hf-pick .tx { font-size: 14px; letter-spacing: 0.05em; }
.es-picks .hf-pick .tx em {
  display: block; font-style: normal; font-family: 'Space Grotesk', sans-serif;
  font-weight: 400; font-size: 10px; letter-spacing: 0.06em;
  color: rgba(60, 40, 12, 0.52); text-transform: none;
}
/* ⚠️ Výnimka „pri troch voľbách ikonka nad text" ZANIKLA. Bola potrebná, kým
   voľby stáli vedľa seba a na text zostalo 80 px; v riadkoch je miesta dosť,
   takže ikonka je vedľa textu vždy — jedno pravidlo namiesto dvoch. */

/* ── MEDZIKARTA MEDZI PSAMI ───────────────────────────────────────────────*/
.es-hand {
  display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;
  padding: 10px 0;
}
.es-hand > b {
  font-family: 'Cinzel', serif; font-size: 15px; color: #2E5C3B;
  text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
}
.es-next { display: inline-flex; align-items: center; gap: 8px; }
.es-next b { font-family: 'Cinzel Decorative', 'Cinzel', serif; font-size: 15px; color: rgba(35, 22, 8, 0.90); }

/* ── BRÁNA A CTA ──────────────────────────────────────────────────────────*/
/* Rad akcie: výška je daná VŽDY (CTA 48 px), obsah sa v nej mení. */
.es-act {
  width: 100%; min-height: 40px; display: flex; align-items: center;
  justify-content: center;
}
.es-cta { width: 100%; }
.es-gate {
  width: 100%; background: none; border: none; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.4;
  color: #8E3F2C; text-decoration: underline; text-decoration-style: dotted;
}

/* ── 🔴 KRÁTKE OKNO: JEDNA PEVNÁ POLOHA, NIE STUPŇOVANIE (25. 9. 2026) ───────
   Matej 25. 9.: *„chceme, aby každá obrazovka mobil aj PC mali tie isté zásady
   a boli cca rovnaké, nepretekali a sedeli aj na mobile aj PC."* PODSTATA
   pretekala na iPhone SE (375×667) o 67 px — premerané meračom HRANICA.

   ⚠️ NEODPORUJE TO Matejovmu *„nič sa tu nemení veľkosťou"* z 24. 9. Tam išlo
      o obrazovku, ktorá sa menila PRI ODPOVEDANÍ (výška rástla s počtom volieb).
      Toto je JEDNA pevná poloha pre nízke okno a v nej sa už nič nehýbe — ten
      istý precedens, aký má PATRÓN (media dotaz na max-height 700px).
   🔑 USTUPUJE OBSAH, NIE REZERVA OD OKRAJA (lock PAGE_AIR): plocha odpovedí,
      fotka psa, rám a rozstupy. Hektor sa nezmenšuje — useSpeakMedal mu na
      krátkom okne veľkú polohu nedá tak či tak. */
@media (max-height: 700px) {
  .es-stack .hf-plate { gap: 8px; }
  .es-picks { --es-picks-h: 150px; }
  .es-dogphoto { width: 40px; height: 40px; }
  .es-name { font-size: 17px; }
  .es-glyph { --es-glyph-w: 88%; }
  .es-act { min-height: 36px; }
  .es-cta { height: 36px; }
}
`;
