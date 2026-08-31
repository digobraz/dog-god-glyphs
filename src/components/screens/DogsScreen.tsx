import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore, type ExtraDog } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import { DateDropdowns } from '@/components/DateDropdowns';
import { countryFlag, countryISO2 } from '@/lib/countryGeo';
import { countryLabel } from '@/lib/countryOptions';
import { guessCountryName } from '@/lib/guessCountry';
import { CountryPick } from './CountryPick';
import { useLang, useT } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { track } from '@/lib/analytics';
import { FLOW_PALE_CSS } from './flowPaleSkin';
import hekthorImg from '@/assets/hekthor.png';
import legendIconUrl from '@/assets/legend-icon.svg';
import angelIconUrl from '@/assets/angel-icon.svg';

// ── /heroglyph/dogs — krok 3: „Máš, alebo si mal, aj ďalšieho psa?"
//
// Predloha: `plany/lab-heroflow-2026-08-28.html`, obrazovka `dogs`.
// Matej 28. 8.: *„v labe som už riešil aj meno aj multipsov… najdi to a postav to"*.
//
// Obrazovka drží VŠETKO NA JEDNEJ PLOCHE — riadok fotka·meno·ikonka stavu, klik na
// ikonku otvorí panel (žijúca legenda / anjel, dátum narodenia, pri anjelovi aj dátum
// odchodu, vlastná národnosť). Žiadne preklikávanie medzi obrazovkami.
//
// 🔴 PAPIEROVAČKY (`/heroglyph/about`) TÝM STRÁCAJÚ OBSAH. Krajina aj dátum narodenia
//    sa pýtajú tu a zapisujú sa do TÝCH ISTÝCH polí store (`selections.country`,
//    `selections.birthday*`), aby kód heroglyfu mal 15. a 16. segment. Obrazovku
//    papierovačiek som ale NEZRUŠIL — to je Matejovo rozhodnutie, nie moje.
//
// 🔴 ĎALŠÍ PSI SA ZATIAĽ IBA ZBIERAJÚ (`store.extraDogs`). Flow, platba aj certifikát
//    bežia ďalej s prvým psom. Matej 28. 8.: každý pes prejde celým flow a platí sa
//    €11 za každého ⇒ platba × N, N poradových čísel a N certifikátov je samostatná
//    práca a BEZ NEJ TENTO KROK NESMIE ÍSŤ NA PRODUKCIU.
//
// Back: /heroglyph/name  ·  Continue: /heroglyph/email
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

  // Národnosť je JEDNA hodnota pre celý vstup; pes sa z nej len vyviaže. Opačne
  // (každý pes vlastnú krajinu + odvodiť „spoločnú") by sa pri troch psoch nedalo
  // povedať, ktorá z nich je tá predvyplnená.
  // Matej 28. 8.: „už od začiatku tam musí byť podľa IP alebo stránky webu".
  // Odhad ide z prehliadača (pásmo → región jazyka → jazyk stránky), nie zo siete —
  // detail a dôvod v `lib/guessCountry.ts`. Uložená voľba vždy vyhráva nad odhadom.
  const [nat, setNat] = useState<string>(() => selections.country || guessCountryName(lang) || '');
  // „Platí pre všetkých" má zmysel až od DRUHÉHO psa — pri jednom je to políčko
  // bez obsahu a robí z jednoduchej obrazovky formulár (LAB).
  // ⚠️ Toto políčko ROZHODUJE, či sa národnosť vôbec pýta v paneli psa. LAB má
  // oba ovládače naraz (spoločné + vlastné pri každom psovi) a tie sa prekrývajú —
  // vybral som jeden význam na jeden ovládač. 🚩 Ak to Matej chce ako v LABe, vrátim.
  const [natAll, setNatAll] = useState(() => extraDogs.every((d) => d.country === null));
  // Index otvoreného panela; -1 = zavretý. 0 = pes z kroku 2, 1+ = `extraDogs`.
  const [leg, setLeg] = useState(-1);

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const panelRef = useRef<HTMLDivElement>(null);

  // Odchod z panela: klik mimo alebo Esc. Krížik nemá (lock 28. 8.).
  useEffect(() => {
    if (leg < 0) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leg, extraDogs]);

  const displayName = dogName || t('heroglyph.flow.yourDogFallback');

  // ── Pes #1 nie je v `extraDogs` — číta a zapisuje sa do polí, ktoré už existujú.
  type Row = ExtraDog & { photo: string | null };
  const first: Row = {
    name: displayName,
    photo: dogPhotoUrl || null,
    lifeStatus,
    deathDate,
    birthday: selections.birthdayYear
      ? `${selections.birthdayYear}-${selections.birthdayMonth || '01'}-${selections.birthdayDay || '01'}`
      : '',
    country: null as string | null,
  };
  // Ďalší psi fotku NEMAJÚ (LAB: „fotka ďalších psov = iniciála", Matej ju odložil),
  // takže riadky idú na jeden tvar — inak by `all` bol únia dvoch typov.
  const all: Row[] = [first, ...extraDogs.map((d) => ({ ...d, photo: null }))];

  const patchExtra = (i: number, patch: Partial<ExtraDog>) => {
    setExtraDogs(extraDogs.map((d, k) => (k === i ? { ...d, ...patch } : d)));
  };

  /** Zápis do psa na indexe `i` — pes #1 ide do store polí, ostatní do `extraDogs`. */
  const patch = (i: number, patch: Partial<ExtraDog>) => {
    if (i > 0) { patchExtra(i - 1, patch); return; }
    if (patch.lifeStatus !== undefined) {
      setLifeStatus(patch.lifeStatus);
      if (patch.lifeStatus === 'alive') setDeathDate(null);
    }
    if (patch.deathDate !== undefined) setDeathDate(patch.deathDate);
    if (patch.birthday !== undefined && patch.birthday) {
      const [y, m, d] = patch.birthday.split('-');
      setSelection('birthdayYear', y);
      setSelection('birthdayMonth', m);
      setSelection('birthdayDay', d);
    }
  };

  const addDog = () => {
    track('flow_dogs_add');
    setExtraDogs([
      ...extraDogs,
      { name: '', lifeStatus: 'alive', deathDate: null, birthday: '', country: null },
    ]);
    setLeg(all.length);
  };

  // ── ZATVORENIE PANELA ────────────────────────────────────────────────────
  // Matej 28. 8.: „ak kliknem na + a nenapíšem meno = nepridá sa ďalší pes!".
  // Doslova to znamená, že pes bez mena NEVZNIKNE — nie že sa niekde zamkne
  // tlačidlo. Riadok teda zaniká vo chvíli, keď panel zavrieš bez mena, a je
  // jedno ktorou cestou (HOTOVO · Esc · klik mimo) — všetky tri idú tadeto.
  const closePanel = () => {
    if (leg > 0) {
      const d = extraDogs[leg - 1];
      if (d && !d.name.trim()) setExtraDogs(extraDogs.filter((_, k) => k !== leg - 1));
    }
    setLeg(-1);
  };

  const removeDog = (i: number) => {
    setExtraDogs(extraDogs.filter((_, k) => k !== i - 1));
    setLeg(-1);
  };

  // ── KEDY JE PES HOTOVÝ ────────────────────────────────────────────────────
  // Matej 31. 8.: *„aktuálne môže človek kliknúť na pokračovať a nemať nič
  // vyplnené! oprava = tlačidlo pokračovať bude aktívne len ak budú údaje
  // kompletne vyplnené = buď jeden pes, alebo ak bude 2. začatý musí byť vždy
  // kompletný"*.
  //
  // Požadované údaje sú tie, ktoré nesie kód heroglyfu: meno · stav · dátum
  // narodenia · (pri anjelovi dátum odchodu) · krajina. Stav hodnotu má vždy
  // (predvolene „žijúca legenda"), ale ostáva v rade pilulek — inak by sa rad
  // nikdy nezložil do jednej zelenej odpovede.
  //
  // ⚠️ Krajina psa #1 JE spoločná `nat` — pes #1 vlastnú nemá (pole `country`
  // v `first` je natvrdo `null`). Ďalší pes ju má buď zdedenú (`null`), alebo
  // vlastnú, a tá potom nesmie byť prázdna.
  const dogFlags = (d: Row, i: number) => ({
    name: !!d.name.trim(),
    born: !!d.birthday,
    gone: d.lifeStatus === 'alive' || !!d.deathDate,
    country: i === 0 || d.country === null ? !!nat : !!d.country,
  });
  const dogDone = (d: Row, i: number) => Object.values(dogFlags(d, i)).every(Boolean);
  const allDone = all.every(dogDone);

  const handleContinue = () => {
    if (!allDone) return;
    if (nat) setSelection('country', nat);
    track('flow_dogs_continue', { dogs: all.length });
    navigate('/heroglyph/email');
  };

  if (!flowOk) return null;

  const open = leg >= 0 ? all[leg] : null;
  const openIsExtra = leg > 0;

  const parseBd = (bd: string) => {
    const [y, m, d] = (bd || '').split('-').map((n) => parseInt(n, 10));
    return {
      d: d || 1,
      m: m || 1,
      y: y || currentYear - 5,
    };
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
      <style>{FLOW_PALE_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/name')} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center">

          <motion.div
            className="hf-bubble"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Matej 28. 8.: „otázku kladie Hektor, mal by tam mať avatara ako v prvom
                kroku". Veľkosť drží `.hf-hek` z `flowPaleSkin.ts` — jedno číslo pre
                celý vstup, nie tailwindová trieda na každej obrazovke zvlášť. */}
            <img src={hekthorImg} alt="HEKTHOR" className="hf-hek" />
            <h2>{t('heroglyph.flow.dogs.title')}</h2>
            <p>{t('heroglyph.flow.dogs.sub')}</p>
          </motion.div>

          <motion.div
            className="hf-block"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="hf-plate">

              {all.map((d, i) => {
                const named = !!d.name.trim();
                const year = (d.birthday || '').slice(0, 4);
                const fl = dogFlags(d, i);
                const goneYear = (d.deathDate || '').slice(0, 4);
                const dogISO = countryISO2((i === 0 || d.country === null ? nat : d.country) || '');
                return (
                  <button
                    key={i}
                    type="button"
                    className={`hf-dogrow${named ? '' : ' is-empty'}`}
                    onClick={() => setLeg(i)}
                    aria-label={t('heroglyph.flow.dogs.editAria')}
                  >
                    <span className="pic">
                      {d.photo
                        ? <img src={d.photo} alt="" />
                        : (d.name || '?').charAt(0).toUpperCase()}
                    </span>
                    {/* JEDEN RIADOK — meno vycentrované na fotku (Matej 31. 8.:
                        *„druhý riadok pod menom zruš a meno zacentruj na fotku ako
                        keby jeden riadok"*). Stav aj rok narodenia, ktoré ten riadok
                        niesol, sú odteraz v pilulkách vpravo — hovoril to isté dvakrát. */}
                    <span className="txt">
                      <span className="nm">
                        {d.name || t('heroglyph.flow.dogs.unnamed')}
                      </span>
                    </span>
                    {/* ── STAV NA PRVÝ POHĽAD (Matej 31. 8.) ────────────────────
                        Pilulka na každý údaj, ktorý pes musí mať. Zelená = máme ho,
                        červená = chýba, a zámok tlačidla dole je presne súčet tohto
                        radu.
                        🔑 Poradie NARODENINY · NÁRODNOSŤ · STAV je Matejovo
                        (31. 8.) — údaje, ktoré sa vypĺňajú, idú prvé; stav je
                        vždy nastavený, takže uzatvára rad.
                        🔑 Chýbajúca hodnota je \`???\` za tým istým znakom, aký
                        nesie vyplnená (\`🎂\`, \`†\`) — pilulka tak nemení tvar ani
                        význam, mení sa len to, či hodnotu poznáme. Slovná skratka
                        („NAR.?") sa musela prekladať a v každom jazyku bola inak
                        dlhá, takže rad pri anjelovi preskakoval do dvoch riadkov. */}
                    <span className="hf-dogpills">
                      <span className={`hf-dpill ${fl.born ? 'ok' : 'miss'}`}
                            title={t('heroglyph.flow.dogs.born')}>
                        <span className="em">🎂</span>{fl.born ? year : '???'}
                      </span>
                      {d.lifeStatus === 'deceased' && (
                        <span className={`hf-dpill ${d.deathDate ? 'ok' : 'miss'}`}
                              title={t('heroglyph.flow.dogs.died')}>
                          †&nbsp;{d.deathDate ? goneYear : '???'}
                        </span>
                      )}
                      <span className={`hf-dpill solo ${fl.country ? 'ok' : 'miss'}`}
                            title={t('heroglyph.flow.dogs.nationality')}>
                        <span className="em">{fl.country ? (countryFlag(dogISO || '') || '🏳') : '?'}</span>
                      </span>
                      <span
                        className={`hf-dpill solo ${fl.gone ? 'ok' : 'miss'}`}
                        title={t(d.lifeStatus === 'alive'
                          ? 'heroglyph.flow.dogs.statusAlive'
                          : 'heroglyph.flow.dogs.statusAngel')}
                      >
                        <img src={d.lifeStatus === 'alive' ? legendIconUrl : angelIconUrl} alt="" />
                      </span>
                    </span>
                  </button>
                );
              })}

              <button type="button" className="hf-addrow" onClick={addDog}>
                <b>+</b>{t('heroglyph.flow.dogs.add')}
              </button>

              {/* ── NÁRODNOSŤ — jedna hodnota pre celý vstup, JEDEN riadok ─── */}
              <div className="hf-natline">
              <CountryPick value={nat} onChange={setNat} />

              {/* Políčko stojí vedľa výberu VŽDY (Matej 28. 8.: „vedľa v riadku chýba
                  checkmark aplikovať na každého psa"). Pri jednom psovi hovorí o tých,
                  ktorých ešte pridá — a výber tak neostane roztiahnutý cez celú šírku,
                  čo Matej označil za „divne zbytočne veľké". */}
              {(
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
                  <span className="lbl">
                    {t('heroglyph.flow.dogs.allSameShort')}
                  </span>
                </button>
              )}
              </div>

              {/* Zámok vysvetľujú pilulky v riadkoch vyššie — veta pod tlačidlom by
                  hovorila to isté tretíkrát. */}
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
          <div className="hf-legpanel" ref={panelRef}>
            <p className="who">{open.name || t('heroglyph.flow.dogs.unnamed')}</p>

            {/* Meno má tu len ďalší pes — prvý ho dostal na kroku 2. */}
            {openIsExtra && (
              <input
                className="hf-field"
                value={open.name}
                onChange={(e) => patch(leg, { name: e.target.value.toUpperCase() })}
                placeholder={t('heroglyph.flow.dogs.namePlaceholder')}
                maxLength={30}
              />
            )}

            <div className="hf-picks">
              <button
                type="button"
                className={`hf-pick${open.lifeStatus === 'alive' ? ' on' : ''}`}
                onClick={() => patch(leg, { lifeStatus: 'alive' })}
              >
                <img src={legendIconUrl} alt="" />
                <span>{t('heroglyph.flow.dogs.statusAlive')}</span>
              </button>
              <button
                type="button"
                className={`hf-pick${open.lifeStatus === 'deceased' ? ' on' : ''}`}
                onClick={() => patch(leg, { lifeStatus: 'deceased' })}
              >
                <img src={angelIconUrl} alt="" />
                <span>{t('heroglyph.flow.dogs.statusAngel')}</span>
              </button>
            </div>

            <p className="hf-qlabel">{t('heroglyph.flow.dogs.born')}</p>
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
              onChange={(d, m, y) => patch(leg, {
                birthday: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
              })}
            />

            {/* Dátum odchodu sa PÝTA LEN PRI ANJELOVI — pri živom psovi je to otázka bez zmyslu. */}
            {open.lifeStatus === 'deceased' && (
              <>
                <p className="hf-qlabel">{t('heroglyph.flow.dogs.died')}</p>
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
                  onChange={(d, m, y) => patch(leg, {
                    deathDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                  })}
                />
              </>
            )}

            {/* ── NÁRODNOSŤ V DETAILE PSA ─────────────────────────────────────
                Matej 28. 8.: „v detaile psa nie je národnosť ak je pes inej!"
                Panel ju preto ukazuje VŽDY, nie len keď je spoločné políčko vypnuté —
                inak sa pes, ktorý je z inej krajiny, nemal kde vyviazať.
                Pes #1 nesie SPOLOČNÚ hodnotu (`nat`) — je to tá istá krajina, akú
                ukazuje riadok pod zoznamom, len dostupná aj odtiaľto. */}
            <p className="hf-qlabel">{t('heroglyph.flow.dogs.nationality')}</p>
            {!openIsExtra && (
              <CountryPick value={nat} onChange={setNat} />
            )}
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
                    patch(leg, { country: own ? (nat || '') : null });
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
                    onChange={(c) => patch(leg, { country: c })}
                  />
                )}
              </>
            )}

            {openIsExtra && (
              <button type="button" className="hf-skip" onClick={() => removeDog(leg)}>
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
