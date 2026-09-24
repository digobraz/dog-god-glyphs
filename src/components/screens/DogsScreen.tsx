import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore, newExtraDog, type ExtraDog } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import { DateDropdowns } from '@/components/DateDropdowns';
import { countryFlag, countryISO2 } from '@/lib/countryGeo';
import { countryLabel } from '@/lib/countryOptions';
import { guessCountryName } from '@/lib/guessCountry';
import { CountryPick } from './CountryPick';
import { useLang, useT } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { track } from '@/lib/analytics';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS } from './flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS } from './flowMedallion';
import { hekthorFace } from '@/lib/hekthorFaces';
import { intakePhoto, finishPhotoChoice, mainPhotoTarget, type PhotoTarget } from '@/lib/photoIntake';
import { openPhotoConfirm } from '@/components/gods/photoConfirm';
import { uploadPackDogPhoto } from '@/services/cloudinaryService';
import legendIconUrl from '@/assets/legend-icon.svg';
import angelIconUrl from '@/assets/angel-icon.svg';

// ── /heroglyph/dogs — krok 3: TVOJA SVORKA
//
// Predloha: `plany/nakres-heroflow-cely-2026-08-31.html`, obrazovka „Ďalší psi".
//
// Obrazovka drží VŠETKO NA JEDNEJ PLOCHE — riadok úchyt·číslo·fotka·meno·pilulky,
// klik na riadok otvorí panel (žijúca legenda / anjel, dátumy, vlastná národnosť).
//
// ── ČO SA ZMENILO 23. 9. 2026 (Matej) ──────────────────────────────────────
// 1. **Horná bublina je NA ŠÍRKU a menšia** — fotka vľavo, text vpravo.
//    Veľký pozdrav je vec kroku 2; odtiaľto je Hektor sprievodca.
// 2. **Psi sa dajú medzi sebou prehodiť** (úchyt ⋮⋮) a nesú PORADIE V ŽIVOTE.
//    To poradie sa predvyplní do heroglyfu (`selections.ranking`) ⇒ obrazovka
//    `RankingScreen` („je to tvoj prvý pes?") je v novom vstupe preskočená.
//    Ťuknutie na číslo PRVÉHO psa posunie celú skupinu (kto mal psov aj predtým).
// 3. **Fotku má každý pes**, nie len ten z kroku 2 — bez nej pes nie je hotový.
// 4. **Celý blok psa zozelenie**, keď je vyplnený; POKRAČOVAŤ je súčet zelených.
// 5. **Krajina sa pýta TU** (odišla z kroku 2) — jedna hodnota pre celú svorku.
//
// 🔴 ĎALŠÍ PSI SA ZATIAĽ IBA ZBIERAJÚ (`store.extraDogs`). Flow, platba aj
//    certifikát bežia ďalej s prvým psom. Matej 28. 8.: každý pes prejde celým
//    flow a platí sa €11 za každého ⇒ platba × N, N poradových čísel a N
//    certifikátov je samostatná práca a BEZ NEJ TENTO KROK NESMIE ÍSŤ NA
//    PRODUKCIU (preto celý nový vstup visí na `import.meta.env.DEV`).
//
// Back: /heroglyph/name  ·  Continue: /heroglyph/email

/** Riadok zoznamu. `id: null` = pes z kroku 2 (žije v store poliach, nie v `extraDogs`). */
type Row = {
  key: string;
  id: string | null;
  name: string;
  photo: string | null;
  lifeStatus: 'alive' | 'deceased';
  deathDate: string | null;
  birthday: string;
  /** `null` = berie spoločnú národnosť svorky. Pes z kroku 2 má vždy `null`. */
  country: string | null;
};

const MAIN = 'main';

// ── MANTINELY ZOZNAMU (24. 9. 2026) ─────────────────────────────────────────
// Matej: *„ak je teraz 6 psov, celá stránka sa roztiahne a je zle — musíme si
// určiť mantinely a pri dosiahnutí limitu zvoliť iný pohľad"* + *„keď ich bude
// 4/5, riadok sa zmenší len na číslo, meno a checkmark a plocha bude
// scrollovateľná"*.
//
// 🔴 ROVNICA, NIE MERANIE VYKRESLENÉHO. Koľko psov sa zmestí, sa počíta z
//    konštánt nižšie a z VÝŠKY OKNA (`window.innerHeight` — okno, nie prvok).
//    Meranie po vykreslení je kruh: výška zoznamu závisí od režimu a režim od
//    výšky. Ladí sa TU, nie v CSS.
//
//   strop = clamp(160, 38 % okna, 330)
//   zmestí sa  ⇔  n · (ROW_FULL + GAP) − GAP ≤ strop
//
// Pri okne 900 px (PC) sú to 4 plné riadky, pri 700 px (telefón) 3 — presne to
// Matejovo „4/5". Čo sa nezmestí, ide do ÚZKEHO režimu: úchyt · číslo · meno ·
// značka stavu. Fotka a pilulky odtiaľ zmiznú, ale nezanikajú — otvárajú sa
// panelom psa (preto doň 24. 9. pribudla fotka).
const LIST = {
  /** Plný riadok — 74 px odmerané v prehliadači: fotka (42) < meno (18) + medzera
   *  (6) + pilulky (26) = 50, plus odsadenie (18) a rám (2), plus 4 px na lift. */
  rowFull: 74,
  /** Úzky riadok — 40 px odmerané: meno (22) + odsadenie (12) + rám (2) + lift. */
  rowSlim: 40,
  gap: 8,
  maxPx: 330,
  minPx: 160,
  /** Podiel okna, ktorý zoznam smie zabrať. Zvyšok patrí bubline, krajine a CTA. */
  share: 0.38,
};

/** Výška okna. Resize sa počúva, ale hodnota sa berie z OKNA — nie z prvku. */
function useWindowH() {
  const [h, setH] = useState(() => (typeof window === 'undefined' ? 800 : window.innerHeight));
  useEffect(() => {
    const on = () => setH(window.innerHeight);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return h;
}

export function DogsScreen() {
  const flowOk = useFlowGuard();
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();

  const dogName = useDogyptStore((s) => s.dogName);
  const dogPhotoUrl = useDogyptStore((s) => s.dogPhotoUrl);
  const lifeStatus = useDogyptStore((s) => s.lifeStatus);
  const setLifeStatus = useDogyptStore((s) => s.setLifeStatus);
  const deathDate = useDogyptStore((s) => s.deathDate);
  const setDeathDate = useDogyptStore((s) => s.setDeathDate);
  const selections = useDogyptStore((s) => s.selections);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const extraDogs = useDogyptStore((s) => s.extraDogs);
  const setExtraDogs = useDogyptStore((s) => s.setExtraDogs);
  const mainDogPos = useDogyptStore((s) => s.mainDogPos);
  const setMainDogPos = useDogyptStore((s) => s.setMainDogPos);
  const dogOrderStart = useDogyptStore((s) => s.dogOrderStart);
  const setDogOrderStart = useDogyptStore((s) => s.setDogOrderStart);

  // Národnosť je JEDNA hodnota pre celý vstup; pes sa z nej len vyviaže. Opačne
  // (každý pes vlastnú krajinu + odvodiť „spoločnú") by sa pri troch psoch nedalo
  // povedať, ktorá z nich je tá predvyplnená.
  // Matej 28. 8.: „už od začiatku tam musí byť podľa IP alebo stránky webu".
  // Odhad ide z prehliadača (pásmo → región jazyka → jazyk stránky), nie zo siete —
  // detail a dôvod v `lib/guessCountry.ts`. Uložená voľba vždy vyhráva nad odhadom.
  const [nat, setNat] = useState<string>(() => selections.country || guessCountryName(lang) || '');
  // „Platí pre všetkých" má zmysel až od DRUHÉHO psa — pri jednom je to políčko
  // bez obsahu a robí z jednoduchej obrazovky formulár (LAB).
  const [natAll, setNatAll] = useState(() => extraDogs.every((d) => d.country === null));
  /** Kľúč otvoreného panela; `null` = zavretý. */
  const [openKey, setOpenKey] = useState<string | null>(null);
  /** Otvorené pole „koľký pes v živote je prvý riadok". */
  const [ordEdit, setOrdEdit] = useState(false);

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const fileRef = useRef<HTMLInputElement>(null);
  /** Pre ktorý riadok práve vyberáme fotku. */
  const pickFor = useRef<string | null>(null);

  const displayName = dogName || t('heroglyph.flow.yourDogFallback');

  // ── ZOZNAM ─────────────────────────────────────────────────────────────────
  // Pes #1 nie je v `extraDogs` — číta a zapisuje sa do polí, ktoré už existujú.
  // Jeho MIESTO v zozname drží `mainDogPos`: ťahanie ho môže odsunúť za psa,
  // ktorý bol v živote skôr.
  const rows: Row[] = useMemo(() => {
    const first: Row = {
      key: MAIN,
      id: null,
      name: displayName,
      photo: dogPhotoUrl || null,
      lifeStatus,
      deathDate,
      birthday: selections.birthdayYear
        ? `${selections.birthdayYear}-${selections.birthdayMonth || '01'}-${selections.birthdayDay || '01'}`
        : '',
      country: null,
    };
    const rest: Row[] = extraDogs.map((d) => ({
      key: d.id,
      id: d.id,
      name: d.name,
      photo: d.photoUrl,
      lifeStatus: d.lifeStatus,
      deathDate: d.deathDate,
      birthday: d.birthday,
      country: d.country,
    }));
    const pos = Math.max(0, Math.min(mainDogPos, rest.length));
    return [...rest.slice(0, pos), first, ...rest.slice(pos)];
  }, [displayName, dogPhotoUrl, lifeStatus, deathDate, selections, extraDogs, mainDogPos]);

  const keys = useMemo(() => rows.map((r) => r.key), [rows]);

  // ── KOĽKO SA ICH ZMESTÍ (24. 9. 2026) ──────────────────────────────────────
  // Strop plochy + režim riadka. Obe z tej istej rovnice (`LIST` hore), aby
  // sa nemohlo stať, že zoznam je „plný" a pritom pretečie.
  const winH = useWindowH();
  const listMax = Math.round(
    Math.max(LIST.minPx, Math.min(LIST.maxPx, winH * LIST.share)),
  );
  const fullH = rows.length * (LIST.rowFull + LIST.gap) - LIST.gap;
  const slim = fullH > listMax;

  /** Nové poradie zo ťahania — z kľúčov späť na `mainDogPos` + `extraDogs`. */
  const onReorder = (next: string[]) => {
    const byId = new Map(extraDogs.map((d) => [d.id, d]));
    setMainDogPos(Math.max(0, next.indexOf(MAIN)));
    setExtraDogs(next.filter((k) => k !== MAIN).map((k) => byId.get(k)!).filter(Boolean));
  };

  /** Zápis do psa — pes #1 ide do store polí, ostatní do svojho riadka podľa `id`. */
  const patch = (row: Row, p: Partial<ExtraDog>) => {
    if (row.id) {
      const list = useDogyptStore.getState().extraDogs;
      setExtraDogs(list.map((d) => (d.id === row.id ? { ...d, ...p } : d)));
      return;
    }
    if (p.lifeStatus !== undefined) {
      setLifeStatus(p.lifeStatus);
      if (p.lifeStatus === 'alive') setDeathDate(null);
    }
    if (p.deathDate !== undefined) setDeathDate(p.deathDate);
    if (p.birthday !== undefined && p.birthday) {
      const [y, m, d] = p.birthday.split('-');
      setSelection('birthdayYear', y);
      setSelection('birthdayMonth', m);
      setSelection('birthdayDay', d);
    }
  };

  const addDog = () => {
    track('flow_dogs_add');
    const dog = newExtraDog();
    setExtraDogs([...extraDogs, dog]);
    setOpenKey(dog.id);
  };

  // ── ZATVORENIE PANELA ────────────────────────────────────────────────────
  // Matej 28. 8.: „ak kliknem na + a nenapíšem meno = nepridá sa ďalší pes!".
  // Doslova to znamená, že pes bez mena NEVZNIKNE — nie že sa niekde zamkne
  // tlačidlo. Riadok teda zaniká vo chvíli, keď panel zavrieš bez mena, a je
  // jedno ktorou cestou (HOTOVO · Esc · klik mimo) — všetky tri idú tadeto.
  const closePanel = () => {
    const list = useDogyptStore.getState().extraDogs;
    const d = list.find((x) => x.id === openKey);
    if (d && !d.name.trim()) setExtraDogs(list.filter((x) => x.id !== d.id));
    setOpenKey(null);
  };

  const removeDog = (row: Row) => {
    if (!row.id) return;
    setExtraDogs(extraDogs.filter((d) => d.id !== row.id));
    setOpenKey(null);
  };

  // Odchod z panela: klik mimo alebo Esc. Krížik nemá (lock 28. 8.).
  useEffect(() => {
    if (!openKey) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey, extraDogs]);

  // ── FOTKA KAŽDÉHO PSA (23. 9. 2026) ───────────────────────────────────────
  // Matej: *„fotku pýtaj hneď"*. Cesta je TÁ ISTÁ ako na stene: vyber súbor →
  // popup s výrezom → nahranie na pozadí. Líši sa jedine CIEĽ zápisu
  // (`PhotoTarget`) — hlavný pes píše do store polí, ďalší do svojho riadka.
  const targetFor = (row: Row): PhotoTarget => {
    if (!row.id) return mainPhotoTarget();
    const id = row.id;
    const write = (p: Partial<ExtraDog>) => {
      const st = useDogyptStore.getState();
      st.setExtraDogs(st.extraDogs.map((d) => (d.id === id ? { ...d, ...p } : d)));
    };
    return {
      read: () => useDogyptStore.getState().extraDogs.find((d) => d.id === id)?.photoUrl ?? null,
      write: (url) => write({ photoUrl: url }),
      writePublicId: (pid) => write({ publicId: pid }),
      upload: (blob, sessionId) => uploadPackDogPhoto(blob, sessionId, id),
    };
  };

  const askPhoto = (row: Row) => {
    pickFor.current = row.key;
    // ⚠️ Hodnota sa nuluje PRED otvorením — inak by výber tej istej fotky
    //    druhýkrát nevyvolal `change` a nič by sa nestalo.
    if (fileRef.current) fileRef.current.value = '';
    fileRef.current?.click();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = pickFor.current;
    if (!file || !key) return;
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    const target = targetFor(row);
    const { previewUrl, uploaded } = intakePhoto(file, target);
    track('flow_dogs_photo', { main: !row.id });
    openPhotoConfirm({
      photoUrl: previewUrl,
      onContinue: (crop) => { void finishPhotoChoice(crop, uploaded, target); },
      onPickAnother: () => askPhoto(row),
      copy: {
        lead: row.name || t('heroglyph.flow.dogs.unnamed'),
        cta: t('heroglyph.flow.dogs.done'),
        another: t('heroglyph.flow.dogs.photoAnother'),
        later: t('heroglyph.flow.dogs.photoLater'),
      },
    });
  };

  // ── KEDY JE PES HOTOVÝ ────────────────────────────────────────────────────
  // Matej 31. 8.: *„tlačidlo pokračovať bude aktívne len ak budú údaje kompletne
  // vyplnené"* + 23. 9.: *„ďalej môžeš ísť len ak budú zvolení psi vyplnení na
  // 100 %"*. Požadované údaje sú tie, ktoré nesie kód heroglyfu a dlaždica na
  // stene: fotka · meno · stav · narodenie · (pri anjelovi odchod) · krajina.
  //
  // ⚠️ Krajina psa #1 JE spoločná `nat` — vlastnú nemá (`country` je `null`).
  const dogFlags = (d: Row) => ({
    photo: !!d.photo,
    name: !!d.name.trim(),
    born: !!d.birthday,
    gone: d.lifeStatus === 'alive' || !!d.deathDate,
    country: d.country === null ? !!nat : !!d.country,
  });
  const dogDone = (d: Row) => Object.values(dogFlags(d)).every(Boolean);
  const allDone = rows.every(dogDone);

  const handleContinue = () => {
    if (!allDone) return;
    if (nat) setSelection('country', nat);
    // 🔑 PORADIE V ŽIVOTE → HEROGLYF. 12. segment kódu (`ranking`) sa doteraz
    //    pýtal samostatnou obrazovkou; teraz je to poloha psa v zozname svorky.
    const mine = rows.findIndex((r) => r.key === MAIN);
    setSelection('ranking', String(dogOrderStart + Math.max(0, mine)));
    track('flow_dogs_continue', { dogs: rows.length });
    navigate('/heroglyph/email');
  };

  if (!flowOk) return null;

  const open = openKey ? rows.find((r) => r.key === openKey) ?? null : null;
  const openIsExtra = !!open?.id;

  const parseBd = (bd: string) => {
    const [y, m, d] = (bd || '').split('-').map((n) => parseInt(n, 10));
    return { d: d || 1, m: m || 1, y: y || currentYear - 5 };
  };
  const parseDd = (dd: string | null) => {
    const [y, m, d] = (dd || '').split('-').map((n) => parseInt(n, 10));
    return { d: d || today.getDate(), m: m || today.getMonth() + 1, y: y || currentYear };
  };

  // Fajka je v DOM-e vždy; viditeľnosť rieši `.hf-chk.on .box svg` (prechod krytím).
  const checkBox = (
    <span className="box">
      <svg viewBox="0 0 24 24" fill="none" stroke="#16307A" strokeWidth="3.4"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 12.5 L9.5 18 L20 6" />
      </svg>
    </span>
  );

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/name')} />
      </div>

      {/* Jeden skrytý výber súboru pre celý zoznam — pre ktorý riadok, drží `pickFor`. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        style={{ display: 'none' }}
      />

      <div className="hf-stage">
        {/* `hf-dogfit` = poistka proti pretečeniu (25. 9. 2026): zoznam sa smie
            len ZMENŠIŤ, nikdy nerastie. Pri jednom psovi vyzerá obrazovka ako
            predtým, pri piatich sa zoznam zmenší a roluje vnútri. Natiahnutie
            na plnú výšku Matej zamietol — pozri `.hf-dogfit` vo `flowPaleSkin`. */}
        <div className="w-full max-w-xl flex flex-col items-center hf-dogfit">

          {/* BUBLINA NA ŠÍRKU — fotka vľavo, text vpravo (Matej 23. 9.). */}
          <motion.div
            className="hf-speak"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Medailón je ten istý odliatok ako na kroku 2, len menší — ksicht
                si berie podľa KROKU (`hekthorFaces.ts`), nie podľa poradia. */}
            {/* 104 px: Matejova voľba „C" z hárku štyroch veľkostí (24. 9.).
                Písmo bubliny drží `SPEAK` vo `flowPaleSkin.ts` — vlastné číslo,
                nie `HF.bubble.title`, ktorý nesie aj pozdrav kroku 2. */}
            <FlowMedallion src={hekthorFace('dogs')} size={104} className="hf-medal" />
            <span className="say">
              <h2>{t('heroglyph.flow.dogs.packTitle')}</h2>
              {/* ⚠️ JEDNA VETA. Druhá („Nezabudni na žiadneho psa v tvojom
                  živote!") tu ráno bola a Matej ju vzápätí vyhodil. */}
              <p>{t('heroglyph.flow.dogs.title')}</p>
            </span>
          </motion.div>

          <motion.div
            // `hf-carved` + rytá obruba (recept z kroku 2, `FLOW_CARVE_CSS`) —
            // Matej 24. 9.: „tie rytiny a štýl prenes z prvého kroku aj na ďalšie".
            className="hf-block hf-carved"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            <div className="hf-plate">

              {/* ⚠️ OSTÁVA `.hf-qlabel`, NIE `.hf-legend` — nesie vnorený `.hint`
                  (druhý riadok pod nadpisom). `.hf-legend` je jednoriadková veta
                  medzi dvoma vlysmi bez miesta pre druhý riadok; vecpať doň hint
                  by ho pripravilo o vlastný štýl (`.hf-qlabel .hint`, cielený na
                  presne túto triedu). */}
              <p className="hf-qlabel">
                {t('heroglyph.flow.dogs.orderLabel')}
                <span className="hint">{t('heroglyph.flow.dogs.orderHint')}</span>
              </p>

              {/* Plocha psov má STROP a scrolluje — bez neho šiesty pes odsunul
                  tlačidlo POKRAČOVAŤ pod ohyb (Matej 24. 9.).
                  ⚠️ `layoutScroll` je pri ťahaní povinné: bez neho počíta framer
                     polohy riadkov voči oknu a v odscrolovanej ploche skáču. */}
              <motion.div
                layoutScroll
                className={`hf-dogscroll${slim ? ' is-slim' : ''}`}
                style={{ maxHeight: listMax }}
              >
                <Reorder.Group axis="y" as="ul" className="hf-doglist" values={keys} onReorder={onReorder}>
                  {rows.map((d, i) => (
                    <DogRow
                      key={d.key}
                      row={d}
                      order={dogOrderStart + i}
                      first={i === 0}
                      slim={slim}
                      done={dogDone(d)}
                      flags={dogFlags(d)}
                      nat={nat}
                      onOpen={() => setOpenKey(d.key)}
                      onPhoto={() => askPhoto(d)}
                      onOrder={() => setOrdEdit((p) => !p)}
                      t={t}
                    />
                  ))}
                </Reorder.Group>
              </motion.div>

              <button type="button" className="hf-addrow" onClick={addDog}>
                <b>+</b>{t('heroglyph.flow.dogs.add')}
              </button>

              {/* ŤUKNUTIE NA ČÍSLO — jedna otázka pre celý zoznam.
                  Ťahanie určuje vzájomné poradie, číslo určuje, kde tá skupina
                  v živote ZAČÍNA. Kto mal psa jedného, sa toho ani nedotkne. */}
              {ordEdit && (
                <div className="hf-ordedit">
                  <p>
                    {t('heroglyph.flow.dogs.orderQ', { name: rows[0]?.name || t('heroglyph.flow.dogs.unnamed') })}
                  </p>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={dogOrderStart}
                    autoFocus
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      setDogOrderStart(Number.isFinite(n) ? Math.max(1, Math.min(50, n)) : 1);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') setOrdEdit(false); }}
                  />
                  <p className="hf-ordnote">{t('heroglyph.flow.dogs.orderNote')}</p>
                </div>
              )}

              {/* ── NÁRODNOSŤ — jedna hodnota pre celý vstup, JEDEN riadok ───
                  Od 23. 9. sa pýta LEN TU: z kroku 2 odišla, aby tá istá otázka
                  neprišla dvakrát a dve odpovede si neprotirečili. */}
              <div className="hf-natline">
                <CountryPick value={nat} onChange={setNat} />
                <button
                  type="button"
                  className={`hf-chk hf-chk--inline${natAll ? ' on' : ''}`}
                  onClick={() => {
                    const next = !natAll;
                    setNatAll(next);
                    // Zapnutie zruší vlastné krajiny — inak by políčko tvrdilo niečo,
                    // čo v dátach neplatí.
                    if (next) setExtraDogs(extraDogs.map((d) => ({ ...d, country: null })));
                  }}
                >
                  {checkBox}
                  <span className="lbl">{t('heroglyph.flow.dogs.allSameShort')}</span>
                </button>
              </div>

              {/* Zámok vysvetľujú pilulky a farba riadkov vyššie — veta pod
                  tlačidlom by hovorila to isté tretíkrát. */}
              <button type="button" className="hf-cta" onClick={handleContinue} disabled={!allDone}>
                {t('heroglyph.flow.name.continue')}
              </button>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── PANEL PSA — bez krížika, von klikom mimo alebo Esc ─────────── */}
      {open && (
        <div className="hf-legwrap" role="dialog" aria-modal="true">
          <div className="hf-legveil" onClick={closePanel} />
          <div className="hf-legpanel">
            {/* ── HLAVIČKA PANELA: FOTKA + MENO (24. 9. 2026) ────────────────
                Fotka tu pribudla kvôli ÚZKEMU REŽIMU — z riadka pri veľkej
                svorke mizne a bez nej by pes nešiel dokončiť. Je to tá istá
                cesta (`askPhoto`), nie druhá implementácia príjmu. */}
            <div className="hf-legtop">
              <button
                type="button"
                className={`hf-pic lg${open.photo ? '' : ' add'}`}
                onClick={() => askPhoto(open)}
                aria-label={t('heroglyph.flow.dogs.photoAdd')}
              >
                {open.photo ? <img src={open.photo} alt={t('heroglyph.flow.dogs.photoOf')} /> : '+'}
              </button>
              <p className="who">{open.name || t('heroglyph.flow.dogs.unnamed')}</p>
            </div>

            {/* Meno má tu len ďalší pes — prvý ho dostal na kroku 2. */}
            {openIsExtra && (
              <input
                className="hf-field"
                value={open.name}
                onChange={(e) => patch(open, { name: e.target.value.toUpperCase() })}
                placeholder={t('heroglyph.flow.dogs.namePlaceholder')}
                maxLength={30}
              />
            )}

            {/* Ikonka vedľa textu, vsadená do jamky (`.hf-pick .well`/`.tx`,
                FLOW_CARVE_CSS) — ten istý tvar, aký má tá istá otázka na kroku 2
                (`LifeStatusPick`). Bez obalu `.well` by ikonka ostala holá na
                zlatej doske bez priehlbiny. */}
            <div className="hf-picks">
              <button
                type="button"
                className={`hf-pick${open.lifeStatus === 'alive' ? ' on' : ''}`}
                onClick={() => patch(open, { lifeStatus: 'alive' })}
              >
                <span className="well"><img src={legendIconUrl} alt="" /></span>
                <span className="tx">{t('heroglyph.flow.dogs.statusAlive')}</span>
              </button>
              <button
                type="button"
                className={`hf-pick${open.lifeStatus === 'deceased' ? ' on' : ''}`}
                onClick={() => patch(open, { lifeStatus: 'deceased' })}
              >
                <span className="well"><img src={angelIconUrl} alt="" /></span>
                <span className="tx">{t('heroglyph.flow.dogs.statusAngel')}</span>
              </button>
            </div>

            {/* Holý nadpis úseku bez hintu -> rytý vlys (`.hf-legend`), presne
                ako narodenie na kroku 2. */}
            <p className="hf-legend">{t('heroglyph.flow.dogs.born')}</p>
            {/* `empty` = rolety mlčia, kým človek nevyberie. Bez neho by ukazovali
                hotový dátum (1. 1. pred piatimi rokmi), ktorý nikto nezadal — a nad
                nimi by svietila červená pilulka, že dátum chýba. */}
            <DateDropdowns
              {...(() => { const b = parseBd(open.birthday); return { day: b.d, month: b.m, year: b.y }; })()}
              empty={!open.birthday}
              emptyLabels={{
                day: t('heroglyph.flow.dogs.phDay'),
                month: t('heroglyph.flow.dogs.phMonth'),
                year: t('heroglyph.flow.dogs.phYear'),
              }}
              minYear={currentYear - 25}
              maxYear={currentYear}
              maxDate={today}
              skin="pale"
              onChange={(d, m, y) => patch(open, {
                birthday: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
              })}
            />

            {/* Dátum odchodu sa PÝTA LEN PRI ANJELOVI — pri živom psovi je to otázka bez zmyslu. */}
            {open.lifeStatus === 'deceased' && (
              <>
                <p className="hf-legend">{t('heroglyph.flow.dogs.died')}</p>
                <DateDropdowns
                  {...(() => { const b = parseDd(open.deathDate); return { day: b.d, month: b.m, year: b.y }; })()}
                  empty={!open.deathDate}
                  emptyLabels={{
                    day: t('heroglyph.flow.dogs.phDay'),
                    month: t('heroglyph.flow.dogs.phMonth'),
                    year: t('heroglyph.flow.dogs.phYear'),
                  }}
                  minYear={currentYear - 25}
                  maxYear={currentYear}
                  maxDate={today}
                  skin="pale"
                  onChange={(d, m, y) => patch(open, {
                    deathDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                  })}
                />
              </>
            )}

            {/* ── NÁRODNOSŤ V DETAILE PSA ─────────────────────────────────────
                Matej 28. 8.: „v detaile psa nie je národnosť ak je pes inej!"
                Panel ju preto ukazuje VŽDY, nie len keď je spoločné políčko vypnuté.
                Pes #1 nesie SPOLOČNÚ hodnotu (`nat`). */}
            <p className="hf-legend">{t('heroglyph.flow.dogs.nationality')}</p>
            {!openIsExtra && <CountryPick value={nat} onChange={setNat} />}
            {openIsExtra && (
              <>
                <button
                  type="button"
                  className={`hf-chk${open.country === null ? ' on' : ''}`}
                  onClick={() => {
                    const own = open.country === null;
                    // Vyviazanie psa ruší aj spoločné políčko — inak by tvrdilo
                    // niečo, čo v dátach už neplatí.
                    if (own) setNatAll(false);
                    patch(open, { country: own ? (nat || '') : null });
                  }}
                >
                  {checkBox}
                  <span className="lbl">
                    {/* Názov krajiny sa ukazuje v jazyku stránky — uložená hodnota
                        ostáva anglická (15. segment kódu heroglyfu). */}
                    {t('heroglyph.flow.dogs.sameNat', {
                      flag: countryFlag(nat) || '🏳',
                      country: countryLabel(countryISO2(nat) || '', lang) || nat,
                    })}
                  </span>
                </button>
                {open.country !== null && (
                  <CountryPick
                    value={open.country}
                    onChange={(c) => patch(open, { country: c })}
                  />
                )}
              </>
            )}

            {openIsExtra && (
              <button type="button" className="hf-skip" onClick={() => removeDog(open)}>
                {t('heroglyph.flow.dogs.remove')}
              </button>
            )}

            <button type="button" className="hf-cta" onClick={closePanel}>
              {t('heroglyph.flow.dogs.done')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RIADOK PSA ──────────────────────────────────────────────────────────────
// Vlastný komponent kvôli `useDragControls` — hook musí bežať na úrovni riadka,
// nie v slučke rodiča.
//
// 🔴 ŤAHÁ SA LEN ZA ÚCHYT (`dragListener={false}`). Riadok je zároveň klikateľný
//    (otvára panel) a fotka je tlačidlo; keby ťahal celý riadok, na dotykovom
//    zariadení by sa klik nedal odlíšiť od začiatku ťahania.
function DogRow({ row, order, first, slim, done, flags, nat, onOpen, onPhoto, onOrder, t }: {
  row: Row;
  order: number;
  first: boolean;
  /** Úzky režim — viac psov, než sa zmestí v plnej podobe (`LIST` hore). */
  slim: boolean;
  done: boolean;
  flags: { photo: boolean; name: boolean; born: boolean; gone: boolean; country: boolean };
  nat: string;
  onOpen: () => void;
  onPhoto: () => void;
  onOrder: () => void;
  t: (k: string, p?: Record<string, string | number>) => string;
}) {
  const controls = useDragControls();
  const year = (row.birthday || '').slice(0, 4);
  const goneYear = (row.deathDate || '').slice(0, 4);
  const dogISO = countryISO2((row.country === null ? nat : row.country) || '');

  return (
    <Reorder.Item value={row.key} dragListener={false} dragControls={controls}>
      <div className={`hf-dogrow as-row${slim ? ' is-slim' : ''}${done ? ' is-done' : ''}${row.name.trim() ? '' : ' is-empty'}`}>
        <span
          className="hf-grip"
          aria-hidden
          onPointerDown={(e) => controls.start(e)}
        >⋮⋮</span>

        {/* Číslo: prvý riadok ho MENÍ (celá skupina sa posunie), ostatné ho len nesú. */}
        {first ? (
          <button
            type="button"
            className="hf-ord set"
            onClick={onOrder}
            aria-label={t('heroglyph.flow.dogs.orderAria')}
          >{order}</button>
        ) : (
          <span className="hf-ord derived">{order}</span>
        )}

        {/* ⚠️ V úzkom režime fotka z riadka MIZNE, nezaniká — pýta si ju panel
            psa. Keby zmizla úplne, pes by sa nedal dokončiť a tlačidlo
            POKRAČOVAŤ by ostalo zamknuté bez cesty von. */}
        {!slim && (
          <button
            type="button"
            className={`hf-pic${row.photo ? '' : ' add'}`}
            onClick={onPhoto}
            aria-label={t('heroglyph.flow.dogs.photoAdd')}
          >
            {row.photo ? <img src={row.photo} alt="" /> : '+'}
          </button>
        )}

        <button type="button" className="hf-dogmid" onClick={onOpen} aria-label={t('heroglyph.flow.dogs.editAria')}>
          <span className="nm">{row.name || t('heroglyph.flow.dogs.unnamed')}</span>
          {/* ── STAV NA PRVÝ POHĽAD (31. 8.) ───────────────────────────────
              Pilulka na každý údaj, ktorý pes musí mať. Zelená = máme ho,
              červená = chýba. Fotka v rade NIE JE — tú nesie samotný kruh
              vľavo (prerušovaný červený plus), inak by bol rad päťprvkový
              a na 390 px by sa zalomil.
              🔑 Chýbajúca hodnota je `???` za tým istým znakom, aký nesie
              vyplnená — pilulka nemení tvar, mení sa len to, či hodnotu vieme. */}
          {!slim && (
            <span className="hf-dogpills">
              <span className={`hf-dpill ${flags.born ? 'ok' : 'miss'}`} title={t('heroglyph.flow.dogs.born')}>
                <span className="em">🎂</span>{flags.born ? year : '???'}
              </span>
              {row.lifeStatus === 'deceased' && (
                <span className={`hf-dpill ${row.deathDate ? 'ok' : 'miss'}`} title={t('heroglyph.flow.dogs.died')}>
                  †&nbsp;{row.deathDate ? goneYear : '???'}
                </span>
              )}
              <span className={`hf-dpill solo ${flags.country ? 'ok' : 'miss'}`} title={t('heroglyph.flow.dogs.nationality')}>
                <span className="em">{flags.country ? (countryFlag(dogISO || '') || '🏳') : '?'}</span>
              </span>
              <span
                className={`hf-dpill solo ${flags.gone ? 'ok' : 'miss'}`}
                title={t(row.lifeStatus === 'alive' ? 'heroglyph.flow.dogs.statusAlive' : 'heroglyph.flow.dogs.statusAngel')}
              >
                <img src={row.lifeStatus === 'alive' ? legendIconUrl : angelIconUrl} alt="" />
              </span>
            </span>
          )}
        </button>

        {/* ── ÚZKY REŽIM: JEDNA ODPOVEĎ MIESTO ŠTYROCH ────────────────────────
            Matej 24. 9.: *„riadok sa zmenší len na číslo, meno a checkmark"*.
            Štyri pilulky hovoria, ČO chýba; keď sa nezmestia, ostáva otázka,
            na ktorej visí tlačidlo POKRAČOVAŤ: je tento pes hotový?
            Farby sú tie isté brandové tokeny ako pilulky — zelená #3D7A4E,
            červená #B25640. Podrobnosti si vypýtaš klikom (panel). */}
        {slim && (
          <span
            className={`hf-dogmark ${done ? 'ok' : 'miss'}`}
            title={t(done ? 'heroglyph.flow.dogs.ready' : 'heroglyph.flow.dogs.missing')}
            aria-hidden
          >
            {done ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5 L9.5 18 L20 6" />
              </svg>
            ) : '!'}
          </span>
        )}
      </div>
    </Reorder.Item>
  );
}
