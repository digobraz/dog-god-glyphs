import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore, MAIN_DOG_ID } from '@/store/dogyptStore';
import { useFlowDogs, FlowDogHeader, FLOW_DOG_CSS } from '@/components/screens/flowDogPicker';
import { useT } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { PageTopBar } from '@/components/PageTopBar';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS, FLOW_GLYPH_CSS } from '@/components/screens/flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS, useSpeakMedal } from '@/components/screens/flowMedallion';
import { Scroller, FLOW_SCROLL_CSS } from '@/components/screens/flowScroller';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_R } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { hekthorFace } from '@/lib/hekthorFaces';
import { HEKTHOR_GLYPH } from '@/lib/hektor';

import guardianSvg from '@/assets/character/CHARACTER-GUARDIAN.svg';
import playerSvg from '@/assets/character/CHARACTER-PLAYER.svg';
import energizerSvg from '@/assets/character/CHARACTER-ENERGIZER.svg';
import maverickSvg from '@/assets/character/CHARACTER-MAVERICK.svg';
import waterloverSvg from '@/assets/character/CHARACTER-WATERLOVER.svg';
import gourmetSvg from '@/assets/character/CHARACTER-GOURMET.svg';
import loverSvg from '@/assets/character/CHARACTER-LOVER.svg';
import chillerSvg from '@/assets/character/CHARACTER-CHILLER.svg';

// ════════════════════════════════════════════════════════════════════════════
// POVAHA — Hektorova otázka a výber dvoch vlastností (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026: *„Povaha = otázka hektora a výber tak ako to už raz máme
// hotovo… len prehodiť bloky aby bol heky hore + zapracovať do nového dizajnu"*.
//
// 🔑 NIE JE TO NOVÝ KROK, JE TO PREZLEČENÝ. Výber ôsmich vlastností (dve naraz,
//    druhé ťuknutie na tú istú ju odoberá) je presne to, čo robila stará
//    obrazovka — mení sa PORADIE BLOKOV a MATERIÁL, nie otázka.
//
// 🔑 ČO SA PREHODILO: stará stavba mala rám heroglyfu ako 1. blok a Hektora až
//    pod ním. Odteraz hovorí Hektor zhora (`.hf-speak`) a rám je vnútri dosky
//    nad výberom — rovnako ako na PODSTATE a PATRÓNOVI. Dôvod je ten istý, aký
//    Matej povedal 24. 9. pri podstate: *najprv sa niekto pýta, potom je vidno,
//    čoho sa to týka* — a odpoveď má pristáť tam, kam sa človek práve pozerá.
//
// 🔑 ZÁPIS DO HEROGLYFU JE OKAMŽITÝ (`setSelection` pri ťuknutí, nie na CTA).
//    Rám číta oba znaky povahy zo `selections`, takže pribudnú do glyfu v tom
//    istom okamihu, ako na ne človek ťukne. To je celý zmysel nového šatu.
//
// ⚠️ STARÁ OBRAZOVKA SA NEMAŽE. `DogCharacterScreen.tsx` beží ďalej na LIVE
//    (lock „do FLIPu sa LIVE nedotýkame"); routa `/heroglyph/dog-character` sa
//    vetví v `App.tsx` rovnako ako `/heroglyph/breed` (PATRÓN vs. pôvodná
//    `BreedPatronScreen`). Vetvenie je v routeri, nie v komponente — obrazovka,
//    ktorá si sama rozhoduje, či je stará alebo nová, sa nikdy nedá zmazať.
//
// 🔑 SLIDESHOW ZANIKLA, TEXTY OSTALI. Stará obrazovka mala za Hektorovou
//    bublinou odklápací „info" prehľad ôsmich vlastností (⓵/8, swipe, vodoznak).
//    Bolo to osem obrazoviek textu schovaných za ikonkou, ktorú si väčšina
//    nevšimla — a čítať sa dali len VŠETKY naraz, teda aj tie, ktoré človeka
//    nezaujímali. Odteraz je popis JEDNEJ vlastnosti pod radom a ukáže sa tá,
//    na ktorú človek práve ťukol. Žiadny text z 18 jazykov sa nezahodil:
//    kľúče `slide.<vlastnosť>.title` aj `.desc` sa používajú ďalej.
// ════════════════════════════════════════════════════════════════════════════

/** Koľko vlastností nesie heroglyf. Dva sloty v ráme = dve voľby, nie „aspoň dve". */
const PICK_N = 2;

// `value` === názov súboru (malými písmenami), aby sedel s mapou v `HeroglyphFrame`.
const TRAITS = [
  { v: 'guardian', img: guardianSvg },
  { v: 'player', img: playerSvg },
  { v: 'energizer', img: energizerSvg },
  { v: 'maverick', img: maverickSvg },
  { v: 'waterlover', img: waterloverSvg },
  { v: 'gourmet', img: gourmetSvg },
  { v: 'lover', img: loverSvg },
  { v: 'chiller', img: chillerSvg },
] as const;

export function CharacterScreen() {
  const navigate = useNavigate();
  const t = useT();
  const flowOk = useFlowGuard();
  const medal = useSpeakMedal();

  const setSelection = useDogyptStore((s) => s.setSelection);
  const dogEssence = useDogyptStore((s) => s.dogEssence);
  const setDogEssence = useDogyptStore((s) => s.setDogEssence);

  // ── KTORÉMU PSOVI VYBERÁM (25. 9. 2026) ───────────────────────────────────
  // Matej: *„v hero labe od kroku 6 neriešime multipsov! musíme to opraviť!"*.
  // Dovtedy sa povaha písala do `selections`, teda vždy prvému psovi — to isté,
  // čo sa v ten deň opravilo na PATRÓNOVI. Pravda žije v `dogEssence[idPsa]`,
  // prvý pes ide NAVYŠE do `selections` (heroglyf a certifikát čítajú odtiaľ).
  const dogs = useFlowDogs();
  const [cur, setCur] = useState(0);
  const dog = dogs[Math.min(cur, Math.max(0, dogs.length - 1))];
  const dogId = dog?.id ?? MAIN_DOG_ID;

  /** Vlastnosti psa NA RADE. Čítajú sa zo store, nie z lokálneho stavu — inak
   *  by prepnutie psa ukázalo voľby toho predošlého. */
  const picksOf = (id: string) => {
    const e = dogEssence[id] || {};
    return [e.dogCharacter1, e.dogCharacter2].filter(Boolean) as string[];
  };
  const sel = picksOf(dogId);

  /** Ktorú vlastnosť práve vysvetľujeme pod radom. Posledná, na ktorú sa ťuklo. */
  const [saidBy, setSaidBy] = useState<Record<string, string>>({});
  const said = saidBy[dogId] || sel[0] || null;

  /** Zápis do store = zápis do rámu. Prázdny reťazec slot vyprázdni. */
  const write = (next: string[]) => {
    setDogEssence(dogId, 'dogCharacter1', next[0] || '');
    setDogEssence(dogId, 'dogCharacter2', next[1] || '');
    if (dogId !== MAIN_DOG_ID) return;
    setSelection('dogCharacter1', next[0] || '');
    setSelection('dogCharacter2', next[1] || '');
  };

  /**
   * Ťuknutie. Pravidlo je ZHODNÉ so starou obrazovkou: vybraná sa odoberie,
   * inak sa pridá, a keď sú už dve, vypadne TÁ STARŠIA. Tretie ťuknutie teda
   * nikdy nie je „nedá sa" — človek prepisuje, nie naráža do stropu.
   */
  const tap = (v: string) => {
    // ⚠️ VOĽBA ŽIJE V STORE, NIE V LOKÁLNOM POLI (od 25. 9., s prepínačom psov).
    //    Predtým to bol `useState` a zápis musel stáť MIMO updatera, inak React
    //    hlásil „Cannot update a component while rendering a different
    //    component" (`HeroglyphFrame` číta ten istý store). Teraz je zdroj
    //    jeden, takže tá pasca zanikla — ťuknutie je udalosť a `sel` je čerstvé.
    const next = sel.includes(v)
      ? sel.filter((x) => x !== v)
      : (sel.length < PICK_N ? [...sel, v] : [...sel.slice(1), v]);
    setSaidBy((m) => ({ ...m, [dogId]: v }));
    write(next);
  };

  const canGo = sel.length === PICK_N;
  /** Prvý pes bez dvoch vlastností. -1 = hotoví sú všetci. */
  const missing = dogs.findIndex((d) => picksOf(d.id).length < PICK_N);
  /** Tá istá dvojpoloha CTA ako na PATRÓNOVI: ĎALŠÍ PES → POKRAČOVAŤ. */
  const handover = canGo && missing >= 0;

  if (!flowOk) return null;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}{FLOW_GLYPH_CSS}{FLOW_SCROLL_CSS}{FLOW_DOG_CSS}{CHARACTER_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        {/* Späť vedie na PATRÓNA. Štyri staré otázky o psovi, ktoré tu kedysi
            stáli medzi nimi (pohlavie · farba · pôvod · rodokmeň), sú z nového
            vstupu odvesené — pýta ich PODSTATA. */}
        <PageTopBar onBack={() => navigate('/heroglyph/breed')} />
      </div>

      <div className="hf-stage">
        <div className="w-full max-w-xl flex flex-col items-center">

          {/* ── 1. BLOK: HEKTHOR SA PÝTA ──────────────────────────────────
              Ten istý pás ako na PODSTATE a PATRÓNOVI — medailón a veta vedľa
              neho. Susedné kroky majú vyzerať ako súrodenci, nie ako tri návrhy,
              takže sa tu veľkosť ani písmo nemení. */}
          <motion.div
            className="hf-speak ch-speak"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            {/* 🔴 HEKTHOR JE TU O 24 px VÄČŠÍ NEŽ NA SUSEDNÝCH KROKOCH — a je to
                MERANÉ, nie vkus. Matej 25. 9. 2026: *„máme veľké rezervy na
                priestor = môžme zväčšiť bloky, fotku hektora… mali by sme mať
                každú obrazovku cca rovnako vyplnenú"*. POVAHA bola z celého
                vstupu najprázdnejšia (82 / 68 / 79 % proti pásmu 82–95 %).
                ⚠️ Spoločný `useSpeakMedal` sa NEZDVIHOL zámerne: PODSTATA na
                   iPhone SE preteká o 67 px a SVORKA o 64, takže by ich väčší
                   Hektor potopil ešte hlbšie. Keď sa tie dve zoštíhlia, patrí
                   toto číslo do `useSpeakMedal` a tento riadok zmizne. */}
            <FlowMedallion src={hekthorFace('dog-character')} size={medal + 24} />
            <span className="say">
              <h2>
                {t('heroglyph.flow.dogCharacter.questionPrefix')}
                <b>{t('heroglyph.flow.dogCharacter.questionWord')}</b>
                {t('heroglyph.flow.dogCharacter.questionSuffix')}
              </h2>
              <p>{t('heroglyph.flow.dogCharacter.chooseTwo')}</p>
            </span>
          </motion.div>

          {/* ── 2. BLOK: RÁM → VÝBER ───────────────────────────────────────*/}
          <motion.div
            className="hf-block hf-carved ch-stack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            <div className="hf-plate">

              {/* KOMU VYBERÁM — fotka a meno VŽDY, šípky až od druhého psa.
                  Rovnaký riadok ako na PODSTATE a PATRÓNOVI. */}
              <FlowDogHeader
                className="ch-who"
                dogs={dogs}
                cur={cur}
                onGo={setCur}
                done={sel.length === PICK_N}
              />
              <span className="fdh-rule" aria-hidden />

              {/* Kým sú sloty povahy prázdne, pulzujú a nesú Hektorovu podmalbu —
                  rám teda nikdy nevyzerá prázdny a je vidno, KAM voľba pristane. */}
              <HeroglyphFrame
                showOwner
                // Rám ukazuje psa NA RADE, nie prvého (`dogEssence[idPsa]`).
                dogValues={dogEssence[dogId] || {}}
                ghostValues={HEKTHOR_GLYPH}
                pulseSlot={canGo ? undefined : 'dogCharacter'}
                className="hf-glyph ch-glyph"
                // 🔴 Šírka ide cez `style`, nie cez triedu — `HeroglyphFrame` si
                // píše `width: '100%'` INLINE a pravidlo z hárku by prehralo
                // (tá istá pasca stála 24. 9. celý deň na PODSTATE).
                style={{ width: 'var(--flow-glyph-w)' }}
              />

              <p className="hf-legend">{t('heroglyph.flow.dogCharacter.title')}</p>

              {/* Rad ôsmich vlastností. Dlaždica je `.hf-pick` — ten istý materiál
                  ako voľba na PODSTATE a PATRÓNOVI, mení sa len geometria na
                  štvorec s popiskom pod kresbou. Vybraná preto svieti lapisom
                  bez jediného nového pravidla o farbe. */}
              {/* ⚠️ Na stred sa ťahá POSLEDNÁ ŤUKNUTÁ, nie prvá vybraná: pri
                  selektore `.ch-trait.on` vzal `querySelector` vždy tú prvú,
                  takže druhá voľba ostala odrezaná za hranou radu (merané 25. 9.
                  na 1477 px — GOURMET visel pod pravou šípkou). */}
              <Scroller rowClass="ch-traits" measureKey={said || ''} centerSel={`.ch-trait[data-v="${said || ''}"]`}>
                {TRAITS.map((c) => {
                  const at = sel.indexOf(c.v);
                  return (
                    <button
                      key={c.v}
                      type="button"
                      data-v={c.v}
                      className={`hf-pick ch-trait${at >= 0 ? ' on' : ''}`}
                      aria-pressed={at >= 0}
                      onClick={() => tap(c.v)}
                    >
                      {/* Poradové číslo hovorí, ktorý slot rámu vlastnosť obsadila —
                          horný alebo dolný. Bez neho je pri dvoch vybraných
                          hádanka, ktorá je ktorá. */}
                      {at >= 0 && <i className="ord">{at + 1}</i>}
                      <img src={c.img} alt="" />
                      <span className="lb">{t(`heroglyph.flow.dogCharacter.trait.${c.v}`)}</span>
                    </button>
                  );
                })}
              </Scroller>

              {/* ── ČO TÁ VLASTNOSŤ ZNAMENÁ ──────────────────────────────────
                  🔴 PLOCHA MÁ VÝŠKU VŽDY, aj keď je prázdna. Text sa v nej mení,
                     rozmer nie — inak by doska pri každom ťuknutí poskočila
                     (tá istá chyba, ktorú Matej 24. 9. vrátil na PODSTATE:
                     *„objaví sa text a zväčší celý 2. blok? prečo?"*).
                  ⚠️ Vtip je v zátvorke pri názve (*Strážca (Oko Doga)*) — je to
                     meno SYMBOLU, ktorý práve pribudol do rámu, takže sa číta
                     menším písmom ako podnadpis, nie ako druhý nadpis. */}
              <div className="ch-say">
                <AnimatePresence mode="wait" initial={false}>
                  {said ? (
                    <motion.p
                      key={said}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      <b>{t(`heroglyph.flow.dogCharacter.slide.${said}.title`)}</b>
                      {t(`heroglyph.flow.dogCharacter.slide.${said}.desc`)}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="hint"
                      className="dim"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {t('heroglyph.flow.dogCharacter.infoBody')}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA namiesto samopohybu. Stará obrazovka po druhej voľbe sama
                  odskočila (600 ms) — kto sa pomýlil, opravoval to už na ďalšom
                  kroku. Tu je posledné slovo človeka, rovnako ako na PATRÓNOVI. */}
              <button
                type="button"
                className="hf-cta"
                disabled={!canGo}
                onClick={() => { if (!canGo) return; if (handover) setCur(missing); else navigate('/heroglyph/owner-info'); }}
              >
                {handover ? t('heroglyph.flow.multi.nextDog') : t('heroglyph.flow.breed.continue')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/**
 * Šat obrazovky. Materiál (rytina, jamka, voľba, doska, rad so šípkami) si berie
 * z `FLOW_CARVE_CSS`, `FLOW_PALE_CSS` a `FLOW_SCROLL_CSS` — tu je len to, čo má
 * iba táto obrazovka.
 *
 * 📏 ROZPOČET VÝŠKY (mantinel `PAGE_AIR`, Matejovo okno 1477×724):
 *    javisko 724 − lišta 81 − vzduch 2×24 = **595 px**.
 *    bublina 104 + medzera 12 + doska (rám 120 · vlys 16 · rad 86 · popis 40 ·
 *    CTA 40 + 4 medzery po 10 + 2×18 výplň) = **480 px**, teda rezerva 115 px.
 *    Kto pridá ďalší prvok, ju vyčerpá — a vtedy sa ZMENŠUJE OBSAH, nie rezerva
 *    od okraja (lock 24. 9.).
 */
const CHARACTER_CSS = `
/* Bublina: stupeň písma viazaný na ŠÍRKU BUBLINY (cqw), nie na okno — inak
   nadpis pri zmene šírky ticho pretečie. Tá istá dvojica hodnôt ako PODSTATA
   a PATRÓN, aby tri susedné kroky mali to isté písmo. */
.ch-speak { container-type: inline-size; margin-bottom: 8px; }
.ch-speak h2 { font-size: clamp(18px, 4.6cqw, 20px); }
/* Zlaté slovo v otázke je zvýraznenie vnútri vety, nie druhá farba textu —
   ten istý zvyk, aký mala otázka v starom šate (\`text-amber-300\`). */
/* Farbu slova drží \`.hf-speak b\` (HF_HIGHLIGHT) — tu sa neprepisuje. */
/* ⚠️ ROZSTUP 12, NIE 10 (25. 9.). Desiatku si vzali PODSTATA a PATRÓN preto,
   že sa im obsah nezmestil — táto obrazovka ten problém nemá, takže sa dýcha. */
.ch-stack .hf-plate { gap: 12px; }

/* ── RÁM ──────────────────────────────────────────────────────────────────
   Tá istá šírka ako na PODSTATE a PATRÓNOVI: 78 % od 560 px, 100 % pod tým. Na
   telefóne je doska sama úzka a sťahovanie na 78 % zrazilo symboly v malých
   slotoch na nečitateľné.
   ⚠️ Číslo je premenná, lebo šírku zapisuje INLINE \`style\` na komponente. */
/* 🔒 Šírku rámu určuje LOCK \`FLOW_GLYPH_CSS\` (\`--flow-glyph-w\`), nie táto
   obrazovka — na každom kroku musí byť heroglyf rovnako veľký (Matej 25. 9.).
   Vlastné percento sa sem NEVRACIA; keď sa obsah nezmestí, ustúpi obsah. */

/* ── DLAŽDICA VLASTNOSTI ──────────────────────────────────────────────────
   🔴 MATERIÁL JE \`.hf-pick\`, mení sa LEN GEOMETRIA: stĺpec (kresba, pod ňou
      meno) namiesto riadka. Opísať tu papyrusový gradient či lapisový tint by
      znamenalo tretiu podobu tej istej voľby vo vstupe.
   ⚠️ NEDOSTÁVA PLNÚ ZLATÚ VÝPLŇ, akú majú dlaždice PODSTATY. Tam sú dve až tri
      a zlato ich odlíši od chipov nad nimi; tu ich je OSEM v rade a plná zlatá
      by z radu urobila zlatý pás, v ktorom čierna kresba prestane byť tým, na čo
      sa oko pozerá. Je to tá istá poloha, akú má rad siluet na PATRÓNOVI —
      🚩 a tá istá otvorená otázka na Mateja (do 3 volieb zlato, od 4 tint). */
.ch-trait {
  position: relative;
  flex: 0 0 auto; width: 104px; padding: 10px 4px;
  flex-direction: column; justify-content: center; gap: 4px;
  text-align: center; border-radius: ${PACK_R.tile}px;
}
.ch-trait img { width: 56px; height: 56px; object-fit: contain; }
/* Meno je POPISOK, nie nadpis: najmenší stupeň zo stupnice a tesné sledovanie,
   aby sa aj „Hyperaktív" zmestilo do dlaždice bez zalomenia. */
.ch-trait .lb {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.02em; line-height: 1.1; text-transform: uppercase;
  color: ${LAB.inkSoft}; text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}
.ch-trait.on .lb { color: #16307A; text-shadow: 0 1px 0 rgba(255, 252, 240, 0.55); }
/* Poradové číslo = ktorý slot rámu vlastnosť obsadila. Plná lapisová plocha je tu
   v poriadku: je to ZNAČKA veľkosti 18 px, nie plocha, ktorá by konkurovala CTA. */
.ch-trait .ord {
  position: absolute; top: -6px; right: -6px; z-index: 1;
  width: 18px; height: 18px; border-radius: ${PACK_R.pill}px;
  display: grid; place-items: center; font-style: normal;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px; line-height: 1;
  color: #FDF7E7; background: ${LAPIS.edge};
  box-shadow: 0 1px 2px rgba(20, 50, 90, 0.35);
}

/* ── POPIS VYBRANEJ VLASTNOSTI ────────────────────────────────────────────
   Výška je daná VŽDY (dva riadky na PC), obsah sa v nej mení. */
.ch-say {
  position: relative; width: 100%; min-height: 44px;
  display: flex; align-items: flex-start;
}
/* ⚠️ 14 px, nie 12 (25. 9.) — je to jediný súvislý text obrazovky a mal
   najmenší stupeň zo stupnice, hoci miesto bolo. Obe čísla sú z PACK_TEXT. */
.ch-say p {
  margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px;
  line-height: 1.4; color: ${LAB.inkSoft};
}
.ch-say p.dim { color: ${LAB.inkMuted}; }
/* Meno symbolu pred popisom — Cinzel, o stupeň menej výrazné než popisok
   dlaždice, aby to ostala VETA, nie nadpis. */
.ch-say p b {
  font-family: 'Cinzel', serif; font-weight: 700; color: ${LAB.ink};
  letter-spacing: 0.02em; margin-right: 6px;
}

/* ── ZAMKNUTÉ CTA NESIE MATERIÁL, NIE PRIESVITNOSŤ ────────────────────────
   \`.hf-cta:disabled\` má \`opacity: .4\` — a 40 % lapisu je na papyruse ŠEDÁ
   PLOCHA cez celú šírku dosky (Matej to zamietol 31. 8. 2026: *„šedé tlačítko
   a tieň presvitá"*). Ten istý recept ako na PATRÓNOVI: plochý papyrus, tlmený
   inkoust, žiadny tieň. Tvar ostáva, takže je vidno, čo pribudne. */
.ch-stack .hf-cta:disabled {
  opacity: 1; cursor: default;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  color: ${LAB.inkMuted};
  box-shadow: none;
  border: 1.5px solid ${LAB.hairline};
}


/* ── 📱 NA TELEFÓNE JE DLAŽDICA VÄČŠIA ────────────────────────────────────
   Tá istá úvaha ako pri siluetách patróna (Matej 24. 9.: *„na mobile to má
   rezervy = zväčši"*): Matej pozerá rám 500 px, doska v ňom má 412 px, takže
   ŠTYRI dlaždice s rozstupom 8 vyjdú na (412 − 3×8) / 4 = **97 px**.
   Popis pod radom potrebuje na 302 px tri riadky, nie dva. */
@media (max-width: 559px) {
  .ch-trait { width: 116px; }
  .ch-trait img { width: 68px; height: 68px; }
  .ch-say { min-height: 66px; }
}
/* 🔴 KRÁTKE OKNO + TELEFÓN NARAZ — a MUSÍ to stáť AŽ TU. Obe podmienky majú
   rovnakú špecificitu, takže rozhoduje poradie; keď pravidlo stálo vyššie,
   iPhone SE si bral mobilnú veľkosť a zmenšenie sa ticho nedialo (presne to sa
   24. 9. stalo siluetám na PATRÓNOVI). */
@media (max-height: 700px) {
  .ch-stack .hf-plate { gap: 8px; }
  .ch-stack .hf-cta { height: 36px; }
  .ch-speak { margin-bottom: 4px; }
}
@media (max-width: 559px) and (max-height: 700px) {
  .ch-trait { width: 96px; padding: 8px 4px; }
  .ch-trait img { width: 52px; height: 52px; }
  .ch-say { min-height: 60px; }
}

/* ── 📱 VYSOKÝ TELEFÓN: VIAC VZDUCHU V BLOKOCH (25. 9. 2026) ──────────────────
   Ten istý zásah ako na PATRÓNOVI a z tej istej vety (Matej: *„patrón a povaha
   na tel kľudne daj na 85 = pridaj väčšie okraje 1. alebo druhému bloku"*).
   Povaha mala na 390×844 výplň 77 %.
   ⚠️ LEN VYSOKÝ TELEFÓN (min-height 701) — na iPhone SE je povaha na 87 %. */
@media (max-width: 559px) and (min-height: 701px) {
  .ch-speak { padding: 16px; margin-bottom: 12px; }
  .ch-stack .hf-plate { padding: 32px 22px; gap: 16px; }
}
`;
