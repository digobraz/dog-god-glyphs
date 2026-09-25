import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';
import { DateDropdowns } from '@/components/DateDropdowns';
import { useT } from '@/i18n/LanguageContext';
import { LifeStatusPick, DeathDateModal } from '@/components/screens/lifeStatusPick';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { useBlockAutocorrect } from '@/hooks/useBlockAutocorrect';
import { FlowTextModal } from '@/components/screens/flowTextModal';
import { countryFlag } from '@/lib/countryGeo';
import { NEW_HEROFLOW } from '@/lib/flowMode';
import { hekthorFace } from '@/lib/hekthorFaces';
import { LetterReveal, REVEAL_S, LETTER_S, FLOW_INTRO_CSS } from '@/components/screens/flowIntro';
// ⚠️ `FLOW_MEDAL_CSS` sa vkladá TU. Dosiaľ ho tejto obrazovke „požičiaval"
//    `FlowRedress` — teda vrstva prezliekania, ktorú si môže Matej kedykoľvek
//    prepnúť na starý šat. Medailón by tým prišiel o kresbu obruče a nikto by
//    netušil prečo; obrazovka si svoj šat nosí sama.
import { FlowMedallion, FLOW_MEDAL_CSS } from '@/components/screens/flowMedallion';
import { FLOW_STAGE_CSS, FLOW_CARVE_CSS } from '@/components/screens/flowPaleSkin';
import { PACK_BOX } from '@/components/pack/packTheme';

/** Premena príchodovej fázy na formulárovú — jeden prechod pre všetky prvky,
 *  aby sa blok, medailón a otázka hýbali ako jedna vec, nie ako tri. */
const MORPH = { duration: 0.52, ease: [0.2, 0.8, 0.3, 1] } as const;

// Príchod (otočenie medailónu + písmená) žije od 25. 9. 2026 v `flowIntro.tsx`
// — zdieľa ho aj ODHALENIE (`FlowRevealScreen`).

// Countries list shared with CheckoutScreen (owner billing country).
// Used here for dog's country of origin / home country.
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon',
  'Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia',
  'Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador',
  'Estonia','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece',
  'Guatemala','Guinea','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia',
  'Lebanon','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malaysia','Maldives','Mali','Malta',
  'Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Macedonia','Norway','Oman','Pakistan',
  'Panama','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saudi Arabia','Senegal','Serbia','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea',
  'Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand','Tunisia',
  'Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

// ── Zadanie mena na telefóne ────────────────────────────────────────────────
// Modal sa 25. 9. 2026 presťahoval do `flowTextModal.tsx` — stál doslovne aj v
// `OwnerInfoScreen.tsx` a obrazovka MAJITEĽ by bola tretia kópia. Text sa
// PRESUNUL, nie prepísal; sem sa importuje ako `FlowTextModal`.

export function NameScreen() {
  useFlowKeyboardFix();
  const navigate = useNavigate();
  const t = useT();
  const setDogName = useDogyptStore((s) => s.setDogName);
  const storedDogName = useDogyptStore((s) => s.dogName);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const selections = useDogyptStore((s) => s.selections);
  // ── NOVÝ VSTUP (23. 9. 2026): táto obrazovka pohltila otázku „žije?" ───────
  // Matej ukázal obrazovku 2 z nákresu 31. 8.: meno + blok ZÁKLAD (stav ·
  // narodenie · krajina). Dôvod nie je vzhľad:
  // 🔴 v ceste ZO STENY sa dnes `lifeStatus` nespýta NIKDY — je len v Intro,
  //    ktoré popup na stene preskočí (`GodsGridLab` ide rovno na `/heroglyph/name`),
  //    takže zosnulý pes pristane na stene ako živý.
  // Tým zároveň zaniká `AboutScreen` (papierovačky) — pýtal sa na tie isté polia
  // druhýkrát a pri druhom priechode ich prepísal hodnotami prvého psa.
  const setLifeStatus = useDogyptStore((s) => s.setLifeStatus);
  const setDeathDate = useDogyptStore((s) => s.setDeathDate);
  const storedLifeStatus = useDogyptStore((s) => s.lifeStatus);
  const storedDeathDate = useDogyptStore((s) => s.deathDate);

  const initialName = storedDogName || '';
  const today = new Date();
  const currentYear = today.getFullYear();
  const minYear = currentYear - 25;
  const maxYear = currentYear;

  const stored = {
    d: parseInt(selections.birthdayDay || '0'),
    m: parseInt(selections.birthdayMonth || '0'),
    y: parseInt(selections.birthdayYear || '0'),
  };
  const hasStored = stored.d && stored.m && stored.y;

  const [input, setInput] = useState(initialName);
  const [day, setDay] = useState<number>(hasStored ? stored.d : 1);
  const [month, setMonth] = useState<number>(hasStored ? stored.m : 1);
  const [year, setYear] = useState<number>(hasStored ? stored.y : currentYear - 5);
  const [touched, setTouched] = useState<boolean>(!!hasStored);
  // Dog's country — restored from selections if user navigates back.
  // Default empty: user must consciously pick (LOCKED decision 2026-07-06).
  const [dogCountry, setDogCountry] = useState<string>(selections.country || '');
  const [alive, setAlive] = useState<boolean>(storedLifeStatus !== 'deceased');
  const [deathModal, setDeathModal] = useState(false);

  // ── PRÍCHOD NA OBRAZOVKU (23. 9. 2026) ────────────────────────────────────
  // Matej: *„príchod fotky, zväčšená fota a otázka v ráme cez celú stránku /
  // bez spodného bloku; blok s otázkou sa zvrkne a vysunie sa blok s otázkami"*.
  // Dve fázy, nie tri: najprv len Hektor s otázkou, potom sa zmenší a zdola
  // príde formulár.
  //
  // ⚠️ KTO SA VRACIA, ANIMÁCIU NEDOSTANE. Meno v store znamená návrat z ďalšieho
  //    kroku — prehrať mu príchod znova by bolo zdržanie, nie privítanie.
  // ⚠️ `prefers-reduced-motion` preskakuje rovno na formulár.
  const [phase, setPhase] = useState<'hero' | 'form'>(() => {
    if (!NEW_HEROFLOW || initialName) return 'form';
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'form';
    }
    return 'hero';
  });
  /** Hrá sa príchod? Rozhodne sa RAZ, pri prvom renderi — aby sa písmená
   *  nezačali vypisovať znova, keď sa fáza prepne na formulár. */
  const playIntro = useRef(phase === 'hero').current;

  // Koľko písmen má prvý riadok — druhý riadok naň nadväzuje, nie začína odznova.
  const greetLen = (t('heroglyph.flow.name.greetingPrefix') + ' ').length;

  // 🔴 ČAS PRÍCHODU SA RÁTA, NIE HÁDŽE. Otázka sa vypisuje po písmenách a text
  //    má v 18 jazykoch rôznu dĺžku — pevné číslo by v jednom jazyku sedelo
  //    a v druhom by formulár prišiel doprostred rozpísanej vety. Strop 3,2 s
  //    drží aj najdlhší preklad v znesiteľnom čase.
  const introMs = useMemo(() => {
    if (phase !== 'hero') return 0;
    const letters = greetLen + 8 + t('heroglyph.flow.name.greetingQuestion').length;
    return Math.min(3200, Math.round((REVEAL_S + letters * LETTER_S + 0.45) * 1000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'hero') return;
    const id = window.setTimeout(() => setPhase('form'), introMs);
    return () => window.clearTimeout(id);
  }, [phase, introMs]);

  // Ako veľmi sa medailón v príchodovej fáze nafúkne. Číslo NIE JE natvrdo:
  // ráta sa z okna, lebo „čo najväčšia fotka" znamená na telefóne inú veľkosť
  // než na stolnom počítači. Strop 2,1× drží kresbu ostrou — medailón je SVG
  // + rastrový ksicht 260 px, nad tým by začal mäknúť.
  const heroMedallion = useMemo(() => {
    if (typeof window === 'undefined') return 240;
    const byWidth = Math.min(window.innerWidth, 640) * 0.72;
    const byHeight = window.innerHeight * 0.38;
    return Math.round(Math.max(148, Math.min(310, Math.min(byWidth, byHeight))));
  }, []);
  // ── MEDAILÓN VO FORMULÁROVEJ FÁZE SA MUSÍ ZMESTIŤ (24. 9. 2026) ───────────
  // Matej: *„úvod máme zlý = lockni a nastav to konečne pre každú stránku, aby
  // sme mali minimálne rozostupy od okrajov a nevzniklo toto"*. Na jeho okne
  // (1477×724) končila doska 24 px POD spodnou hranou a POKRAČOVAŤ nebolo vidno.
  //
  // 🔴 Vzduch (`FLOW_AIR`) sa nekráti — kráti sa OBSAH. Medailón je najväčší
  //    jediný kus výšky, ktorý obrazovka nesie, takže ustupuje ako prvý.
  // ⚠️ Prepočítava sa pri zmene okna. Hodnota z prvého renderu by pri ťahaní
  //    okna ostala visieť a obrazovka by sa správala „nejak divne".
  const [winH, setWinH] = useState(() => (typeof window === 'undefined' ? 900 : window.innerHeight));
  useEffect(() => {
    const onResize = () => setWinH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const formMedallion = winH < 700 ? 96 : winH < 820 ? 118 : 148;

  const [showInfo, setShowInfo] = useState(false);
  const isMobile = useMemo(() => window.matchMedia('(pointer: coarse)').matches, []);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const nameModalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  // Desktop inline input — block Android (tablet/Chromebook) auto-correct swaps too.
  const desktopInputRef = useRef<HTMLInputElement>(null);
  useBlockAutocorrect(desktopInputRef);

  // iOS opens the soft keyboard only when focus() runs synchronously inside the
  // tap gesture on an already-mounted input. So we reveal the (always-mounted)
  // modal imperatively and focus its input in the same tick, then sync React state.
  const openNameModal = () => {
    nameModalRef.current?.classList.add('is-open');
    nameInputRef.current?.focus();
    setNameModalOpen(true);
  };
  const closeNameModal = () => {
    nameInputRef.current?.blur();
    setNameModalOpen(false);
  };

  const trimmed = input.trim();
  const nameValid = trimmed.length >= 1 && trimmed.length <= 30;
  const dateValid = touched;
  // ── KRAJINA ODIŠLA NA KROK 3 (Matej 23. 9. 2026) ──────────────────────────
  // *„pri 2 kroku dajme preč krajinu… bude tam len meno a datum a status,
  // krajinu necháme až v 3 kroku"*. Nie je to úspora miesta: krajina je
  // JEDNA hodnota pre celý vstup (`nat` v `DogsScreen`) a pes z kroku 2 ju
  // nesie tiež — pýtať sa na ňu tu znamenalo pýtať sa dvakrát na to isté,
  // a pri dvoch psoch si tie dve odpovede mohli protirečiť.
  // ⚠️ V STAROM VSTUPE OSTÁVA. Tam za krokom 2 nič ako zoznam psov nie je,
  //    takže by krajina vypadla z kódu heroglyfu (15. segment) úplne.
  const countryValid = NEW_HEROFLOW ? true : dogCountry !== '';
  const canContinue = nameValid && dateValid && countryValid;

  const handleSend = () => {
    if (!canContinue) return;
    setDogName(trimmed.toUpperCase());
    setSelection('birthdayDay', String(day).padStart(2, '0'));
    setSelection('birthdayMonth', String(month).padStart(2, '0'));
    setSelection('birthdayYear', String(year));
    // Dog's country → heroglyph pos 15 + dogs.country + WALL flag.
    // Stored as English name (matches COUNTRY_TO_ISO3 map in heroglyphCode.ts).
    // V novom vstupe sa krajina pýta až na kroku 3 (jedna pre celú svorku).
    if (!NEW_HEROFLOW) setSelection('country', dogCountry);
    if (NEW_HEROFLOW) {
      // Stav zapisujeme VŽDY, aj keď človek nechal predvolené „žije" — inak by
      // pole ostalo tým, čím ho nechal predošlý priechod.
      setLifeStatus(alive ? 'alive' : 'deceased');
      if (alive) setDeathDate(null);
      // Fotka je za nami (popup na stene), ďalej ide zoznam psov.
      navigate('/heroglyph/dogs');
      return;
    }
    navigate('/heroglyph/photo');
  };

  const handleDateChange = (d: number, m: number, y: number) => {
    setDay(d);
    setMonth(m);
    setYear(y);
    setTouched(true);
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Javisko a jeho vzduch (`FLOW_AIR`) sú spoločné pre celý vstup. Táto
          obrazovka je v TMAVOM šate, takže `FLOW_PALE_CSS` nevkladá — pravidlo
          o rezerve nad a pod obsahom si preto donesie samostatne. */}
      <style>{FLOW_STAGE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}</style>
      {/* Späť: v novom vstupe je za nami popup na stene, nie Intro (to je len
          redirect na fotku, takže by šípka skončila v kruhu). */}
      {/* 🔴 POČAS PRÍCHODU NIE JE HORNÁ LIŠTA — ani logo, ani šípka, ani vlajka
          (Matej 23. 9.: „pri uvodnom načítaní nebude logo šípka ani vlajka, až
          keď dosadne animácia a načíta sa aj blok s odpoveďami"). Príchod je
          obraz; ovládanie prichádza až s tým, čo treba ovládať.
          ⚠️ Lišta sa NEODSTRAŇUJE, len sa nekreslí — v starom vstupe a po
          príchode je presne tam, kde bola. */}
      {phase === 'form' && (
        <motion.div
          initial={playIntro ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.18 }}
        >
          <PageTopBar brandBack onBack={() => navigate(NEW_HEROFLOW ? '/' : '/heroglyph/intro')} />
        </motion.div>
      )}

      {/* Príchod kroku 2 — otočenie medailónu a vypisovanie otázky.
          ⚠️ Bez spätných apostrofov: CSS vnútri template literalu. */}
      <style>{FLOW_INTRO_CSS}</style>

      {/* 🔴 OBAL MUSÍ ROLOVAŤ (24. 9. 2026). Bez `overflow-y-auto` nemal nedostatok
          výšky kam ujsť: bublina (jediná so `flex-shrink`) ho absorbovala celý —
          pri okne 720 px zo 284 na 260, pri 640 na 180 — a keďže má
          `overflow:hidden`, VETA SA ODREZALA V POLOVICI. Matej 24. 9.: *„na pc
          hneď prvý krok písmo je moc veľké na PC!"*
          ⚠️ Ostatné obrazovky nového vstupu (`dogs`, `email`) rolovací obal majú;
             táto bola jediná bez neho. */}
      <div className="hf-stage">
        {/* ⚠️ Bublina sa NEROZŤAHUJE na celú výšku (Matej 23. 9.: „nemusí byť cez
            cely displaj, centruj ten blok na stred normalne"). Stĺpec má preto
            obsahovú výšku v oboch fázach a na stred ho dáva `justify-center`
            rodiča — blok v príchode vyrastie len o to, čo si vypýta veľká fotka. */}
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0">

          {/* Speech bubble — v príchodovej fáze je len VYŠŠIA (veľká fotka),
              nie roztiahnutá cez displej, a stojí v strede obrazovky.
              ⚠️ Prechod robí `layout`, nie animácia výšky: výška je `auto`
              a tú CSS animovať nevie — framer ju preloží na transform. */}
          <motion.div
            layout
            transition={MORPH}
            // ⚠️ `flex-shrink-0`: bublina sa NESMIE zmršťovať pod svoj obsah.
            //    S `overflow:hidden` to nebolo zmenšenie, ale OREZANIE — chýbajúcu
            //    výšku rieši odteraz rolovanie obalu, nie nôž.
            className="w-full rounded-2xl relative overflow-hidden flex-shrink-0"
            // `containerType` robí z bubliny MERACÍ RÁM pre písmo otázky —
            // stupeň sa viaže na šírku karty (cqw), nikdy na okno (vw).
            // Brand lock: inak nadpis pri zmene šírky ticho pretečie.
            //
            // 🔴 BLOK 1 SA PRI (i) NENAFÚKNE — A NIE JE TO ZARIADENÉ MERANÍM
            //    (Matej 24. 9. 2026: *„pri kliku na (i) sa otvára zadná časť,
            //    ktorá je vyššia ako pôvodný blok — oprav to, blok 1 sa
            //    veľkostne nemení! zmenši písmo, fotku, krížik... čokoľvek, ale
            //    nenaťahuj blok!"*).
            //    Výšku bubliny drží PREDNÁ strana, ktorá ostáva v toku (len
            //    zhasne), a zadná leží NA nej ako prekryv (`position:absolute`).
            //    Blok tým nemá ako narásť — ani v jazyku s dlhším textom, ani
            //    keď niekto text o Hektorovi predĺži.
            // ⚠️ Prvý pokus meral výšku prednej strany `ResizeObserver`-om a
            //    zapisoval ju bubline. Nefungoval z dvoch dôvodov naraz:
            //    `ref` sa na `motion.div` nechytil (React 19 hlási „ref is not
            //    a prop") a výšku bubliny si aj tak animuje framer sám
            //    (`layout` píše inline `height`), takže by ju prepísal.
            style={{ background: 'var(--brand-gradient)', containerType: 'inline-size' }}
          >
            {/* Info toggle button — POČAS PRÍCHODU NIE JE (Matej 23. 9.: „pri
                animácii nebude info ikonka hore vpravo v bloku"). Scéna príchodu
                je obraz, nie ovládací panel: jediné, čo sa v nej hýbe, má byť
                medailón a veta. Ikonka sa vráti aj s formulárom. */}
            {phase === 'form' && (
            <button
              className="absolute top-3 right-3 z-20 flex items-center justify-center"
              style={{ width: 44, height: 44 }}
              aria-label={t('heroglyph.flow.name.infoAria')}
              onClick={() => setShowInfo((p) => !p)}
            >
              <span className="w-7 h-7 rounded-full border-2 border-foreground/40 flex items-center justify-center transition-colors hover:border-foreground/70">
                {showInfo
                  ? <X className="h-4 w-4 text-foreground/70" />
                  : <Info className="h-4 w-4 text-white/80" />}
              </span>
            </button>
            )}

            {/* 🔴 PREDNÁ STRANA OSTÁVA V TOKU VŽDY — len zhasne. Ona drží výšku
                bubliny, takže zadná (info) ju nemôže naťahovať. Dovtedy sa obe
                strany vymieňali v `AnimatePresence mode="wait"` a bublina brala
                výšku tej, ktorá bola práve na svete. */}
            <>
              {(
                <motion.div
                  key="front"
                  layout
                  aria-hidden={showInfo}
                  className="px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showInfo ? 0 : 1 }}
                  style={{ pointerEvents: showInfo ? 'none' : undefined }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Nový vstup má na každom kroku iný Hektorov ksicht (Matej 23. 9.:
                      „bolo by to zaujímavejšie a človek by chcel vidieť čo bude
                      nasledovať"). Kruh je v súbore orezaný na pixel, preto stačí
                      `rounded-full` — netreba `object-contain`. */}
                  {NEW_HEROFLOW ? (
                    // V príchodovej fáze je medailón väčší a potom sa zvrkne —
                    // `motion` mu dá plynulý prechod, nie skok.
                    // 🔴 VEĽKOSŤ SA MENÍ SKUTOČNE, NIE CEZ `scale`. Prvý pokus
                    //    medailón iba škáloval — transform nemení tok, takže
                    //    nafúknutý medailón LEŽAL NA OTÁZKE pod sebou. Plynulosť
                    //    rieši `layout` (framer si zmenu rozmeru sám preloží na
                    //    transform), nie animácia škály.
                    <motion.div
                      layout
                      transition={MORPH}
                      // Príchod: medailón sa dotočí a vyrastie. Otáča sa CELÝ
                      // odliatok aj so zlatým prstencom — to je na ňom to, čo
                      // pri otáčaní vidno. Animáciu nesie CSS trieda, nie
                      // `initial` — dôvod pri `LetterReveal`.
                      className={playIntro ? 'hf-medin' : undefined}
                    >
                      <FlowMedallion
                        src={hekthorFace('name')}
                        size={phase === 'hero' ? heroMedallion : formMedallion}
                        className="hf-medal"
                      />
                    </motion.div>
                  ) : (
                    <img src={hekthorImg} alt="HEKTHOR" className="hek-lg w-36 h-36 md:w-56 md:h-56 object-contain" />
                  )}
                  <motion.p
                    layout
                    transition={MORPH}
                    className="text-white text-center leading-snug drop-shadow-sm"
                    // Matej 23. 9.: *„dal by som väčšie písmo «ahoj ja som hektor»
                    // aj v úvode aj po tom čo sa scvrkne — je to úvodná obrazovka"*.
                    // Matej 24. 9. nad 1280 px oknom: *„na pc hneď prvý krok písmo
                    // je moc veľké na PC!"* — a bol PRETEČENÝ, nie len veľký.
                    //
                    // 🔴 STUPEŇ MUSÍ VIDIEŤ OBE OSI. Predtým visel len na `cqw`, teda
                    //    na ŠÍRKE karty: na širokom, ale NÍZKOM okne vyrástol na
                    //    strop 32 px, hoci na výšku miesto nebolo. Bublina sa pritom
                    //    zmršťuje (900 → 300 px, 720 → 260, 680 → 220) a má
                    //    `overflow:hidden`, takže veta sa ticho ODREZALA v polovici.
                    //    Premerané 24. 9.: pri okne 720 px preteklo 16 px, pri 680 až 56.
                    // ⚠️ `min(cqw, dvh)` mení LEN počítač — na 390 px rozhoduje ďalej
                    //    šírka (20,8 px, ako doteraz), takže Matejovo „väčšie písmo"
                    //    z 23. 9. na telefóne platí nezmenené.
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: phase === 'hero'
                        ? 'clamp(20px, min(7.4cqw, 4.6dvh), 34px)'
                        : 'clamp(17px, min(5.8cqw, 3.4dvh), 26px)',
                    }}
                  >
                    {playIntro ? (
                      <>
                        <span className="whitespace-nowrap">
                          <LetterReveal text={`${t('heroglyph.flow.name.greetingPrefix')} `} from={REVEAL_S} />
                          <LetterReveal text="HEKTHOR." from={REVEAL_S + greetLen * LETTER_S} bold />
                        </span>
                        <br />
                        <span className="whitespace-nowrap">
                          <LetterReveal
                            text={t('heroglyph.flow.name.greetingQuestion')}
                            from={REVEAL_S + (greetLen + 8) * LETTER_S}
                          />
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="whitespace-nowrap">{t('heroglyph.flow.name.greetingPrefix')} <span className="font-bold text-amber-300">HEKTHOR</span>.</span><br />
                        <span className="whitespace-nowrap">{t('heroglyph.flow.name.greetingQuestion')}</span>
                      </>
                    )}
                  </motion.p>
                </motion.div>
              )}
              <AnimatePresence initial={false}>
              {showInfo && (
                <motion.div
                  key="info"
                  // Prekryv: leží NA prednej strane, takže do výšky bubliny
                  // nehovorí. `inset: 0` + vlastné rolovanie vnútri.
                  className="absolute inset-0 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  // Odvrátená strana bubliny (text o Hektorovi) je BLEDÝ BLOK ako
                  // všetky ostatné v appke — Matej 23. 9.: „musí byť v našom brande,
                  // teda vo farbe blokov aké máme naprieč /packom".
                  // ⚠️ Matrica sa berie VYKONATEĽNE, hodnoty sa neopisujú (CLAUDE.md):
                  //    dosiaľ tu bola plochá `hsl(var(--papyrus))` a `rounded-2xl`,
                  //    teda plochá výplň bez gradientu, zlatého rámu a tieňa.
                  // 🔴 `height: 100%` + `overflow: hidden` = zadná strana sa
                  //    vpisuje do výšky prednej (`frontH` na bubline), nie
                  //    naopak. Obsah sa preto SKRÁŠIL: video berie výšku, akú
                  //    dostane (nie pomer 4:5, ktorý si výšku diktoval sám),
                  //    a text je v rolovateľnom stĺpci — radšej pár riadkov
                  //    dorolovať než naťahovať blok.
                  style={{ ...PACK_BOX.card, height: '100%', overflow: 'hidden' }}
                >
                  {/* pt accounts for the X button */}
                  <div className="p-3 pt-10 pb-3 md:p-4 md:pt-12 md:pb-4 h-full min-h-0">
                    {/* Two-column layout */}
                    <div className="flex gap-3 md:gap-4 items-stretch h-full min-h-0">
                      {/* Left column – video */}
                      <div className="w-[36%] md:w-[32%] flex-shrink-0 rounded-2xl overflow-hidden h-full min-h-0">
                        <video
                          src="/videos/WHO_IS_HEKTHOR.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      {/* Right column */}
                      <div className="flex-1 flex flex-col gap-1 md:gap-2 min-w-0 min-h-0">
                        <h3
                          className="text-sm md:text-lg font-bold leading-tight flex-shrink-0"
                          style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}
                        >
                          {t('heroglyph.flow.name.whoTitle')} {t('heroglyph.flow.name.whoTitleName')}
                        </h3>

                        {/* ⚠️ `line-clamp` tu už NIE JE: orezával text natvrdo po
                            šiestich riadkoch bez ohľadu na to, koľko miesta
                            naozaj je. Odteraz rozhoduje MIESTO — stĺpec roluje
                            a na PC sa text zmestí celý. */}
                        <p
                          className="text-foreground/80 text-[11px] md:text-[12.5px] leading-snug flex-1 min-h-0 overflow-y-auto pr-1"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {t('heroglyph.flow.name.whoBody')}
                        </p>

                        {/* Stats – stacked on mobile, decorative table on desktop */}
                        <div className="flex flex-col md:flex-row md:gap-0 gap-1 pt-1.5 md:pt-1 flex-shrink-0">
                          {/* Mobile: simple stacked */}
                          <div className="flex flex-col gap-1 md:hidden">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.born')}:</p>
                              <p className="text-foreground text-sm font-semibold">2016</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.adopted')}:</p>
                              <p className="text-foreground text-sm font-semibold">2017</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.location')}:</p>
                              <p className="text-foreground text-sm font-semibold">{t('heroglyph.flow.name.locationValue')}</p>
                            </div>
                          </div>

                          {/* Desktop: decorative open-table style */}
                          <div className="hidden md:flex md:gap-0 w-full rounded-lg border-2" style={{ borderColor: 'hsl(var(--gold-dark) / 0.35)' }}>
                            <div className="flex-1 flex flex-col items-center py-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.born')}</p>
                              <p className="text-foreground text-sm font-semibold">2016</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center py-1.5 border-l-2 border-r-2" style={{ borderColor: 'hsl(var(--gold-dark) / 0.35)' }}>
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.adopted')}</p>
                              <p className="text-foreground text-sm font-semibold">2017</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center py-1.5">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ fontFamily: "'Cinzel', serif", color: 'hsl(var(--gold-dark))' }}>{t('heroglyph.flow.name.location')}</p>
                              <p className="text-foreground text-sm font-semibold">{t('heroglyph.flow.name.locationValue')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </>
          </motion.div>

          {/* Input — v príchodovej fáze ešte nie je na svete. Prichádza ZDOLA
              (Matej 23. 9.: „vysunie sa blok s otázkami"), nie zboku ako dosiaľ:
              zboku to vyzeralo ako výmena obrazovky, zdola to vyzerá ako ponuka,
              ktorá sa podáva. V starom vstupe ostáva pôvodný príchod. */}
          {phase === 'form' && (
          <motion.div
            // `hf-carved` + jej obruba = rytá linka tesne pod zlatým rámom
            // (24. 9. 2026, recept vo `FLOW_CARVE_CSS`). Doska tým prestáva byť
            // plochý obdĺžnik a dostane hĺbku bez druhého rámu.
            className="hf-carved w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0"
            initial={NEW_HEROFLOW ? { opacity: 0, y: 48 } : { opacity: 0, x: 40 }}
            animate={NEW_HEROFLOW ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
            transition={NEW_HEROFLOW
              ? { duration: 0.46, ease: [0.2, 0.8, 0.3, 1] }
              : { duration: 0.35, delay: 0.1 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            <div className="flex flex-col gap-2 md:gap-3">
            {/* Name + Dog Country row — name 70 %, country select 30 % */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

            {/* Name input — modal on mobile (keeps field above iOS keyboard),
                inline input on desktop (direct keyboard typing). */}
            <div className={`name-preview-wrap${trimmed.length > 0 ? ' is-filled' : ''}`} style={{ flex: '7 0 0', minWidth: 0 }}>
              {isMobile ? (
                <button
                  type="button"
                  onClick={openNameModal}
                  className="name-preview-btn w-full rounded-xl px-4 py-3 border-2 transition-colors"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '16px',
                    textAlign: 'center',
                    textTransform: trimmed.length > 0 ? 'uppercase' : 'none',
                    letterSpacing: trimmed.length > 0 ? '0.05em' : 'normal',
                    background: trimmed.length > 0 ? 'hsl(224 60% 45% / 0.10)' : 'hsl(var(--card))',
                    borderColor: trimmed.length > 0 ? 'hsl(224 60% 45%)' : 'rgba(47, 107, 255, 0.30)',
                    color: trimmed.length > 0 ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.5)',
                    cursor: 'text',
                  }}
                >
                  {trimmed.length > 0 ? input : t('heroglyph.flow.name.placeholder')}
                </button>
              ) : (
                <input
                  ref={desktopInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase().slice(0, 30))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) handleSend(); }}
                  placeholder={t('heroglyph.flow.name.placeholder')}
                  maxLength={30}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  data-1p-ignore
                  data-lpignore="true"
                  className="name-preview-btn w-full rounded-xl px-4 py-3 border-2 transition-colors"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '16px',
                    textAlign: 'center',
                    textTransform: trimmed.length > 0 ? 'uppercase' : 'none',
                    letterSpacing: trimmed.length > 0 ? '0.05em' : 'normal',
                    background: trimmed.length > 0 ? 'hsl(224 60% 45% / 0.10)' : 'hsl(var(--card))',
                    borderColor: trimmed.length > 0 ? 'hsl(224 60% 45%)' : 'rgba(47, 107, 255, 0.30)',
                    color: trimmed.length > 0 ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.5)',
                    outline: 'none',
                  }}
                />
              )}
              <style>{`
                @property --name-prev-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
                .name-preview-wrap { position: relative; border-radius: 0.75rem; box-shadow: 0 0 10px rgba(47, 107, 255, 0.14); }
                .name-preview-btn { position: relative; z-index: 1; }
                .name-preview-wrap::before {
                  content: ''; position: absolute; inset: -2px; border-radius: 14px; z-index: 0;
                  pointer-events: none; padding: 2px;
                  background: conic-gradient(from var(--name-prev-ang),
                    transparent 0deg, transparent 250deg,
                    rgba(47,107,255,0.85) 312deg, rgba(156,196,255,0.95) 334deg,
                    rgba(47,107,255,0.85) 352deg, transparent 360deg);
                  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                  -webkit-mask-composite: xor;
                          mask-composite: exclude;
                  filter: blur(1px);
                  animation: namePrevSpin 3.8s linear infinite;
                }
                @keyframes namePrevSpin { to { --name-prev-ang: 360deg; } }
                @media (prefers-reduced-motion: reduce) { .name-preview-wrap::before { animation: none; } }
                /* Filled = no animation, static "selected" highlight (like flow options) */
                .name-preview-wrap.is-filled::before { animation: none; opacity: 0; }
                .name-preview-wrap.is-filled { box-shadow: 0 0 0 2px hsl(224 60% 45% / 0.45), 0 0 14px hsl(224 60% 45% / 0.22); }
              `}</style>
            </div>

            {/* ⚠️ Krajina je v novom vstupe na kroku 3 — dôvod pri `countryValid`. */}
            {!NEW_HEROFLOW && (<>
              {/* Dog Country select — 30% of name row; placeholder = short "HOME" label.
                  Closed box shows ONLY the flag (full "flag + name" option text is kept for
                  the native dropdown list — full names help pick, but overflow the tiny
                  closed box). The select's own text is made transparent once a value is
                  chosen; a non-interactive flag overlay renders on top of it instead. */}
              <div style={{ flex: '3 0 0', minWidth: 0, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                  value={dogCountry}
                  onChange={(e) => setDogCountry(e.target.value)}
                  aria-label={t('heroglyph.flow.name.dogCountry')}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    width: '100%',
                    height: 48,
                    background: dogCountry ? 'hsl(var(--papyrus))' : 'hsl(var(--card))',
                    border: dogCountry
                      ? '2px solid hsl(var(--gold))'
                      : '2px solid hsl(var(--gold) / 0.5)',
                    borderRadius: 12,
                    fontFamily: "'Cinzel', serif",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    color: dogCountry ? 'transparent' : 'hsl(var(--muted-foreground) / 0.6)',
                    paddingLeft: 4,
                    paddingRight: 20,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="">{t('heroglyph.flow.name.dogCountry')}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{countryFlag(c) || '🏳'} {c}</option>
                  ))}
                </select>
                {dogCountry && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      pointerEvents: 'none',
                      fontSize: 20,
                      lineHeight: 1,
                    }}
                  >{countryFlag(dogCountry) || '🏳'}</span>
                )}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    right: 8,
                    pointerEvents: 'none',
                    color: 'hsl(var(--gold))',
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                >▾</span>
              </div>
            </>)}

            </div>{/* end name + country flex row */}

            {/* Birthday — inline iOS-style 3-wheel picker.
                Nadpis úseku je RYTÝ VLYS (`.hf-legend`): text medzi dvoma
                drážkami, ktoré idú od kraja dosky ku kraju. Bez nich boli tri
                otázky pod sebou jeden odstavec. */}
            <p className="hf-legend">{t('heroglyph.flow.name.birthday')}</p>
            <DateDropdowns
              day={day}
              month={month}
              year={year}
              minYear={minYear}
              maxYear={maxYear}
              maxDate={today}
              onChange={handleDateChange}
            />

            {/* STAV — len v novom vstupe. Tvar (ikonky + popup s dátumom) sa
                23. 9. vrátil z `IntroScreen`, ktorý v tomto vstupe zaniká; tu
                boli dovtedy holé textové tlačidlá. Dátum odchodu sa pýta PRÁVE
                TU: bez neho je anjel nedokončená voľba. */}
            {NEW_HEROFLOW && (
              <LifeStatusPick
                value={alive ? 'alive' : 'deceased'}
                onChange={(v) => {
                  setAlive(v === 'alive');
                  if (v === 'alive') setDeathDate(null);
                }}
                onWantDate={() => setDeathModal(true)}
                deathDate={storedDeathDate}
              />
            )}

            <Button
              onClick={handleSend}
              disabled={!canContinue}
              className="w-full rounded-xl gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
              }}
            >
              {t('heroglyph.flow.name.continue')}
            </Button>
            </div>
          </motion.div>
          )}
        </div>
      </div>

      {/* Dátum odchodu — vysunie sa po kliku na „psí anjel". */}
      {NEW_HEROFLOW && (
        <DeathDateModal
          open={deathModal}
          deathDate={storedDeathDate}
          onSave={(iso) => { setDeathDate(iso); setDeathModal(false); }}
          onClose={() => setDeathModal(false)}
        />
      )}

      {/* Name entry modal — only on mobile (iOS keyboard-safe); desktop types inline. */}
      {isMobile && <FlowTextModal
        open={nameModalOpen}
        value={input}
        placeholder={t('heroglyph.flow.name.placeholder')}
        title={t('heroglyph.flow.name.greetingQuestion')}
        doneLabel={t('heroglyph.flow.message.done')}
        closeLabel={t('nav.aria.close')}
        rootRef={nameModalRef}
        inputRef={nameInputRef}
        onChange={setInput}
        onDone={closeNameModal}
        onClose={closeNameModal}
      />}
    </div>
  );
}
