import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore, MAIN_DOG_ID } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { PageTopBar } from '@/components/PageTopBar';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { VerticalHeroglyphFrame } from '@/components/VerticalHeroglyphFrame';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS, FLOW_GLYPH_CSS } from '@/components/screens/flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS } from '@/components/screens/flowMedallion';
import { LetterReveal, REVEAL_S, LETTER_S, FLOW_INTRO_CSS } from '@/components/screens/flowIntro';
import { useFlowDogs, FlowDogHeader, FLOW_DOG_CSS } from '@/components/screens/flowDogPicker';
import { MessageModal, MESSAGE_MAX_CHARS } from '@/components/screens/MessageScreen';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_R } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { hekthorFace } from '@/lib/hekthorFaces';

// ════════════════════════════════════════════════════════════════════════════
// ODHALENIE + ODKAZ — jedna obrazovka namiesto dvoch (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026: *„malo by ísť odhalenie heroglyfov... hektor by povedal
// s fotkou: tvoj kľúč do dogyptu je hotový. prezri si unikátne dizajny.
// (pozrieť vertikál a horizontál) + tu by sme vsunuli aj pridať odkaz ktorý
// bude vidno verejne na stene do popupu?"* → *„súhlasím s návrhom"*.
// Nákres: `plany/nakres-chvost-flowu-2026-09-25.html` (obrazovka A).
//
// 🔑 ČO TÝMTO ZANIKÁ Z REŤAZE NOVÉHO VSTUPU: samostatná obrazovka `message`.
//    Odkaz je nepovinný, takže nepatrí na vlastný krok — ale nesmie byť ani
//    holý odkaz, lebo schovaný nepovinný krok ľudia preskočia a stena osirie.
//    Preto RIADOK s fotkou psa a ukážkou „takto ťa uvidia na stene".
//    ⚠️ `HeroglyphRevealScreen` a `MessageScreen` sa NEMAŽÚ — LIVE vstup po
//       nich chodí (lock „do FLIPu sa LIVE nedotýkame"). Router vymieňa len
//       komponent na `/heroglyph/reveal` podľa `NEW_HEROFLOW`.
//
// 🐕 MULTIPSI. Každý pes má na stene VLASTNÚ kartu, takže aj vlastný odkaz:
//    píše sa do `dogEssence[idPsa].dogMessage`, prvý pes ho má navyše
//    v `selections.dogMessage` (odtiaľ ho dnes číta platba a `/welcome`).
//    🚩 Či odkaz ostane na psa, alebo jeden na svorku, je OTVORENÁ Matejova
//       otázka (pamäť `project_dogypt_chvost_flowu_planb_2026-09-25`). Na psa
//       je to preto, že sa to dá zlúčiť bez straty; opačne nie.
//
// 🎬 PRÍCHOD (Matej 25. 9. 2026, druhá podoba v ten istý deň): *„dal by som
//    animáciu ako v úvode — veľký blok a hektor s nadpisom a animáciou, blok
//    zmizne a zostane tam len nadpis bez hektora, malým písmom nad blokom —
//    bude tu len jeden blok na celú stranu"*. Dve fázy ako krok 2 (`NameScreen`)
//    a ten istý kód (`flowIntro.tsx`): `hero` = veľká bublina, medailón sa
//    dotočí a veta sa vypíše po písmenách · `plate` = bublina odíde, ostane
//    malý nadpis a doska. Ťuk na bublinu príchod preskočí.
//    ⚠️ Kto má vypnutý pohyb, ide rovno na dosku.
//
// ↕ DVA DIZAJNY. Vodorovný má šírku z locku rámu (`--flow-glyph-w`). Zvislý
//    je vysoký (2480×3504), takže sa neviaže na šírku, ale na VÝŠKU — inak by
//    na PC zabral dvojnásobok dosky a obrazovka by sa rolovala.
// ════════════════════════════════════════════════════════════════════════════

type Design = 'h' | 'v';

export function FlowRevealScreen() {
  useFlowKeyboardFix();
  const navigate = useNavigate();
  const t = useT();
  const flowOk = useFlowGuard();

  const selections = useDogyptStore((s) => s.selections);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const ownerName = useDogyptStore((s) => s.ownerName);
  const patronSvg = useDogyptStore((s) => s.patronSvg);
  const dogEssence = useDogyptStore((s) => s.dogEssence);
  const setDogEssence = useDogyptStore((s) => s.setDogEssence);

  const dogs = useFlowDogs();
  const [cur, setCur] = useState(0);
  const idx = Math.min(cur, Math.max(0, dogs.length - 1));
  const dog = dogs[idx];
  const dogId = dog?.id ?? MAIN_DOG_ID;
  const isMain = dogId === MAIN_DOG_ID;

  const [design, setDesign] = useState<Design>('h');

  // ── PRÍCHOD ───────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<'hero' | 'plate'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'plate'
      : 'hero',
  );
  const titleA = t('heroglyph.flow.revealNew.titlePrefix');
  const titleB = t('heroglyph.flow.revealNew.titleWord');
  const titleC = t('heroglyph.flow.revealNew.titleSuffix');
  /** Čas príchodu sa RÁTA z dĺžky vety (18 jazykov) + chvíľa na prečítanie
   *  podnadpisu — ten istý princíp ako krok 2, strop 4 s. */
  const introMs = useMemo(() => {
    const letters = (titleA + titleB + titleC).length;
    return Math.min(4000, Math.round((REVEAL_S + letters * LETTER_S + 1.4) * 1000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (phase !== 'hero') return;
    const id = window.setTimeout(() => setPhase('plate'), introMs);
    return () => window.clearTimeout(id);
  }, [phase, introMs]);
  /** Medailón v príchode — z okna, ten istý výpočet ako krok 2. */
  const heroMedallion = useMemo(() => {
    if (typeof window === 'undefined') return 240;
    const byWidth = Math.min(window.innerWidth, 640) * 0.72;
    const byHeight = window.innerHeight * 0.38;
    return Math.round(Math.max(148, Math.min(310, Math.min(byWidth, byHeight))));
  }, []);

  // ── ÚDAJE PSA NA RADE ─────────────────────────────────────────────────────
  // Prvý pes má svoje odpovede v `selections`, ostatní v `dogEssence`. Zvislý
  // rám berie jeden objekt, takže sa zlejú: psia časť psa na rade prepíše psiu
  // časť prvého, majiteľ ostáva (je jeden pre celú svorku).
  const essence = dogEssence[dogId] || {};
  const dogValues = isMain ? { ...selections, ...essence } : essence;
  const verticalData = {
    selections: { ...selections, ...essence },
    ownerName,
    patronSvg: isMain ? (essence.patronSvg || patronSvg) : (essence.patronSvg || ''),
  };

  // ── ODKAZ ─────────────────────────────────────────────────────────────────
  const storedMsg = (isMain ? (essence.dogMessage ?? selections.dogMessage) : essence.dogMessage) || '';
  const [draft, setDraft] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const isOverLimit = draft.length > MESSAGE_MAX_CHARS;

  const openModal = () => {
    // iOS otvorí klávesnicu len pri focus() SYNCHRÓNNE v ťuknutí — skrytý input
    // ju chytí a textarea v popupe si ju prevezme. Ten istý trik ako MessageScreen.
    hiddenInputRef.current?.focus();
    setDraft(storedMsg);
    setModalOpen(true);
  };
  const saveMsg = () => {
    const v = draft.trim();
    if (v.length > MESSAGE_MAX_CHARS) return;
    setDogEssence(dogId, 'dogMessage', v);
    if (isMain) setSelection('dogMessage', v);
    setModalOpen(false);
  };

  const dogName = dog?.name || t('heroglyph.flow.yourDogFallback');

  if (!flowOk) return null;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_INTRO_CSS}{FLOW_CARVE_CSS}{FLOW_GLYPH_CSS}{FLOW_DOG_CSS}{REVEAL_CSS}</style>
      <input
        ref={hiddenInputRef}
        type="text"
        aria-hidden="true"
        readOnly
        tabIndex={-1}
        style={{ position: 'fixed', top: 0, left: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/owner-info')} />
      </div>

      <div className="hf-stage">
        <div className="w-full max-w-xl flex flex-col items-center">

          <AnimatePresence mode="wait">
          {phase === 'hero' ? (
            /* ── PRÍCHOD: HEKTHOR ODOVZDÁVA KĽÚČ ─────────────────────────── */
            <motion.button
              key="hero"
              type="button"
              className="rv-hero"
              onClick={() => setPhase('plate')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              <span className="hf-medin">
                <FlowMedallion src={hekthorFace('reveal')} size={heroMedallion} className="hf-medal" />
              </span>
              <span className="rv-hero-h">
                <LetterReveal text={titleA} from={REVEAL_S} />
                <LetterReveal text={titleB} from={REVEAL_S + titleA.length * LETTER_S} bold />
                <LetterReveal text={titleC} from={REVEAL_S + (titleA.length + titleB.length) * LETTER_S} />
              </span>
              <span
                className="rv-hero-sub"
                style={{ animationDelay: `${(REVEAL_S + (titleA + titleB + titleC).length * LETTER_S).toFixed(2)}s` }}
              >
                {t('heroglyph.flow.revealNew.sub')}
              </span>
            </motion.button>
          ) : (
          <motion.div
            key="plate"
            className="w-full flex flex-col items-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
          {/* Nadpis ostáva MALÝM písmom nad doskou, bez Hektora. */}
          <p className="rv-kicker">{titleA}<b>{titleB}</b>{titleC}</p>

          {/* ── 2. BLOK: PES → DIZAJN → ODKAZ → ĎALEJ ─────────────────────── */}
          <motion.div
            className="hf-block hf-carved rv-stack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            <div className="hf-plate">
              <FlowDogHeader dogs={dogs} cur={idx} onGo={setCur} done={!!storedMsg} />
              <span className="fdh-rule" aria-hidden />

              <div className="rv-glyph">
                <AnimatePresence mode="wait" initial={false}>
                  {design === 'h' ? (
                    <motion.div
                      key={`h-${dogId}`}
                      className="rv-glyph-h"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.22 }}
                    >
                      <HeroglyphFrame
                        showOwner
                        dogValues={dogValues}
                        className="hf-glyph"
                        // 🔴 Šírka cez `style` — rám si píše `width:100%` inline.
                        style={{ width: 'var(--flow-glyph-w)' }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`v-${dogId}`}
                      className="rv-glyph-v"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.22 }}
                    >
                      <VerticalHeroglyphFrame data={verticalData} className="rv-vsvg" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Prepínač DIZAJNU — voľba, teda lapisový tint (lock: ZLATO =
                  poloha, LAPIS = moja voľba). */}
              <div className="rv-seg" role="tablist">
                {(['h', 'v'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="tab"
                    aria-selected={design === d}
                    className={`rv-seg-b${design === d ? ' on' : ''}`}
                    onClick={() => setDesign(d)}
                  >
                    {t(d === 'h' ? 'heroglyph.flow.revealNew.horizontal' : 'heroglyph.flow.revealNew.vertical')}
                  </button>
                ))}
              </div>

              <p className="hf-legend">{t('heroglyph.flow.revealNew.msgLegend')}</p>

              {/* ODKAZ NA STENU — riadok, ktorý vyzerá ako kúsok karty na stene:
                  fotka psa + odkaz (alebo výzva). Ťuk = popup. */}
              <button type="button" className={`rv-msg${storedMsg ? ' has' : ''}`} onClick={openModal}>
                {dog?.photo
                  ? <img className="rv-msg-photo" src={dog.photo} alt="" />
                  : <span className="rv-msg-photo rv-msg-photo--empty">{dogName.slice(0, 1)}</span>}
                <span className="rv-msg-tx">
                  {storedMsg
                    ? <i>„{storedMsg}“</i>
                    : t('heroglyph.flow.revealNew.msgEmpty', { dogName })}
                </span>
                <span className="rv-msg-act">
                  {storedMsg ? t('heroglyph.flow.owner.orderChange') : t('heroglyph.flow.revealNew.msgAdd')}
                </span>
              </button>

              <button type="button" className="hf-cta" onClick={() => navigate('/checkout')}>
                {t('heroglyph.flow.breed.continue')}
              </button>
            </div>
          </motion.div>
          </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {modalOpen && (
        <MessageModal
          value={draft}
          placeholder={t('heroglyph.flow.message.placeholder', { dogName })}
          doneLabel={t('heroglyph.flow.message.done')}
          isOverLimit={isOverLimit}
          charCount={draft.length}
          maxChars={MESSAGE_MAX_CHARS}
          onChange={setDraft}
          onDone={saveMsg}
          onClose={saveMsg}
        />
      )}
    </div>
  );
}

/**
 * Šat obrazovky. Materiál (doska, vlys, CTA) je z `FLOW_CARVE_CSS` a
 * `FLOW_PALE_CSS` — tu je len to, čo má iba odhalenie.
 *
 * 📏 ROZPOČET VÝŠKY (Matejovo okno 1477×724, mantinel `PAGE_AIR`): 595 px.
 *    nadpis 20 + 12 + doska (pes 40 · jamka rámu 200 · prepínač 30 · vlys 16 ·
 *    odkaz 56 · CTA 40 + 6 medzier po 8 + 2×18) = ~526. (Bublina s Hektorom je od 25. 9. len v príchode, takže rám dostal jej miesto.)
 *    ⚠️ Jamka je viazaná na VÝŠKU okna (`min(200px, 28dvh)`), nie na šírku —
 *       zvislý dizajn je vysoký a na šírke by na PC zabral dvojnásobok dosky.
 */
const REVEAL_CSS = `
/* ── PRÍCHOD — veľká bublina (ten istý gradient ako \`.hf-speak\`) ─────────── */
.rv-hero {
  width: 100%; container-type: inline-size; cursor: pointer; border: none;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 32px 16px; border-radius: 16px; text-align: center;
  background: var(--brand-gradient); color: #FAF4EC;
}
.rv-hero-h {
  font-family: 'Cinzel', serif; font-weight: 700; line-height: 1.25;
  font-size: clamp(20px, min(7cqw, 4.4dvh), 32px);
}
.rv-hero-sub {
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; line-height: 1.4;
  color: rgba(250, 244, 236, 0.78);
  animation: hf-letter .5s ease-out both;
}
@media (prefers-reduced-motion: reduce) { .rv-hero-sub { animation: none; } }

/* ── NADPIS NAD DOSKOU — po príchode ostane len veta, malým písmom ────────── */
.rv-kicker {
  margin: 0 0 12px; text-align: center;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px;
  letter-spacing: 0.14em; text-transform: uppercase; color: ${LAB.inkSoft};
}
.rv-kicker b { color: ${LAB.goldInk}; }
.rv-stack .hf-plate { gap: 8px; }

/* 🔴 JAMKA RÁMU MÁ PEVNÚ VÝŠKU PRE OBA DIZAJNY. Doska je centrovaná, takže
   keď sa pri prepnutí zmenila výška rámu (104 → 217), poskočila CELÁ obrazovka
   (merané 25. 9. na 1477×724: aj bublina hore o 73 px) a doska pretiekla o 5.
   Výšku určuje zvislý dizajn; vodorovný stojí v jej strede. */
.rv-glyph { --rv-h: min(200px, 28dvh); width: 100%; height: var(--rv-h); display: grid; place-items: center; }
.rv-glyph-h { width: 100%; display: grid; place-items: center; }
/* ⚠️ ŠÍRKA SA POČÍTA Z VÝŠKY, nie cez \`aspect-ratio\`: \`VerticalHeroglyphFrame\`
   si píše INLINE \`width:100%; height:auto\`, takže výšku SVG určuje šírka
   obalu. S \`aspect-ratio\` obal dostal šírku celej dosky a rám pretiekol cez
   prepínač aj CTA (merané 25. 9.). */
.rv-glyph-v { height: var(--rv-h); width: calc(var(--rv-h) * 2480 / 3504); }
.rv-vsvg { width: 100%; height: 100%; color: ${LAB.inkSoft}; }

.rv-seg { display: flex; justify-content: center; gap: 8px; }
.rv-seg-b {
  height: 30px; padding: 0 16px; cursor: pointer;
  border-radius: ${PACK_R.pill}px; border: 1.5px solid ${LAB.hairline};
  background: transparent; color: ${LAB.inkSoft};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
}
.rv-seg-b:hover { border-color: ${LAPIS.edge}; }
.rv-seg-b.on { border-color: ${LAPIS.edge}; background: ${LAPIS.fill}; color: ${LAPIS.edge}; }

/* ── ODKAZ NA STENU ─────────────────────────────────────────────────────────
   Jamka ako riadok poradia na MAJITEĽOVI: je to STAV s tlačidlom, nie voľba.
   Prázdny má čiarkovaný lem — miesto, ktoré čaká na vyplnenie. */
.rv-msg {
  width: 100%; min-height: 56px; display: flex; align-items: center; gap: 12px;
  padding: 8px 8px 8px 8px; cursor: pointer; text-align: left;
  border-radius: ${PACK_R.tile}px; border: 1.5px dashed ${LAB.hairline};
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.55), rgba(242, 226, 189, 0.45));
}
.rv-msg.has { border-style: solid; }
.rv-msg-photo {
  flex: 0 0 auto; width: 40px; height: 40px; border-radius: ${PACK_R.tile}px;
  object-fit: cover; border: 1.5px solid ${LAB.hairline};
}
.rv-msg-photo--empty {
  display: grid; place-items: center; font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 16px; color: ${LAB.inkMuted};
}
.rv-msg-tx {
  flex: 1 1 auto; min-width: 0; font-family: 'Space Grotesk', sans-serif;
  font-size: 14px; line-height: 1.3; color: ${LAB.inkSoft};
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.rv-msg-tx i { font-style: italic; color: ${LAB.ink}; }
.rv-msg-act {
  flex: 0 0 auto; height: 26px; padding: 0 10px; display: inline-flex; align-items: center;
  border-radius: ${PACK_R.pill}px; border: 1.5px solid ${LAPIS.edge}; color: ${LAPIS.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  transition: background 150ms ease, color 150ms ease;
}
.rv-msg:hover .rv-msg-act { background: ${LAPIS.edge}; color: #FDF7E7; }

@media (max-height: 700px) {
  .rv-stack .hf-plate { padding: 14px 16px; gap: 5px; }
  .rv-stack .hf-cta { height: 36px; }
  .rv-kicker { margin-bottom: 8px; font-size: 12px; }
  .rv-msg { min-height: 48px; }
  .rv-msg-photo { width: 32px; height: 32px; }
}
@media (max-width: 559px) and (min-height: 701px) {
  .rv-stack .hf-plate { padding: 26px 22px; gap: 12px; }
}
`;
