// PET PAS — čitateľná časť karty psa (`/pack/dogs/:id`). VÝSTUP.
// Zadanie: plany/zadanie-mypack-petpas-2026-08-06.md §7, nákres: obrazovka C.
//
// TRI PRAVIDLÁ, KTORÉ TENTO SÚBOR VYNUCUJE:
//  1. **Needituje sa tu NIČ.** Každá sekcia má „✎", ktoré deep-linkne do príslušného
//     kroku kvízu predfiltrovaného na tohto psa (`/pack/dogs/quiz/:key?dog=<id>&field=…`).
//     Bez toho by karta bola slepá ulička. Žiadne inline formuláre — tie sem patrili
//     dovtedy, kým bol pes jeden.
//  2. **Pri každom údaji je dátum poslednej aktualizácie.** Bez neho je „32 kg" len
//     tvrdenie: veterinár musí vedieť, či je to spred týždňa alebo spred dvoch rokov.
//  3. **Nič sa nedogeneruje** (DogProfileAttrs LOCK, Matej 2026-08-03) — žiadny odhad,
//     žiadna predvyplnená hodnota. TÁ ČASŤ PLATÍ.
//     ⚠️ PREPÍSANÉ 13.8.2026 (Matej): „aj nevyplnený profil bude mať v DOG ID všetky
//     položky, ale nevyplnené budú na červeno — ale budú tam odzačiatku." Doklad teda
//     ukazuje VŠETKY polia vždy; prázdne dostane červenú pomlčku, ktorá je odkazom do
//     kvízu. Pôvodné „nevyplnené pole sa NEZOBRAZÍ" tým padlo — nový pes mal dovtedy
//     doklad takmer prázdny a nedalo sa z neho vyčítať, čo ešte chýba.
//
//  4. **JEDEN VEĽKÝ DOKUMENT** (Matej 6.8.2026: „páči sa mi štýl jedneho veľkého dokumentu
//     = človek uvidí komplet všetko (komplet) a dolu aj hore budu možnosti zazdielat info
//     (vet friend....)"). Majiteľ vidí VŽDY celý pas — žiadne taby, ktoré mu časť skryjú.
//     Pohľady (vet · opatrovateľ · kamoš) nie sú filter tejto stránky, ale **voľba pri
//     zdieľaní**: rozhodujú, čo uvidí PRÍJEMCA, nie čo vidí majiteľ. Preto sú hore aj dole
//     ako tlačidlá „poslať", nie ako prepínač zobrazenia.
//
// `stepInView()` a `views` v katalógu ostávajú — použije ich share render (§8 zadania).
import { ActedBy } from '@/components/pack/profile/ActedBy';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PACK_THEME, PACK_BOX, PILL_CSS, PF_FIELD_CSS, PROGRESS_CSS, FONT_TITLE, FONT_UI } from './packTheme';
import { PASS_GROUPS, STEP_BY_FIELD, PROGRESS_STEPS, FLOW_EXTRA_FIELDS, quizValueLabel, type QuizStep } from './dogQuiz';
import { natureArt, storedSpecials } from './natureQuiz';
import { readLatest, onDogEventsChange, hasValue, readSeries, appendDogEvents, type LatestValue } from '@/lib/dogEvents';
import { RightGate } from '@/components/pack/RightGate';
import { useMyDogRights } from '@/lib/dogRights';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { APP_NEW } from '@/lib/packFlags';
import { SysIcon } from '@/components/pack/SysIcon';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from './navGoldSkin';
import { TILT_CSS, TILT_PROPS } from './packTilt';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';

const T = PACK_THEME;

// ⚠️ ŽIADNE VLASTNÉ RECEPTY. Výplň, rám, radius a tieň berie tento súbor z matrice
// (`PACK_BOX` / `.pk-pill` v packTheme.ts) — Matej 13.8.2026: „pozri sa do profilu, ako
// vyzerajú chips pills okraje, skrátka chceme konzistentný dizajn naprieč apkou". Pas
// mal do tej chvíle tri vlastné hodnoty naraz (blok 1px rgba(…,0.40)/r10, ✎ 1px 0.45,
// share 1.5px 0.45) a vedľa profilu to vyzeralo ako iná appka. Interpolované konštanty
// nižšie sú TIE ISTÉ čísla ako v matrici, len prepísané do CSS (blok potrebuje
// `break-inside`, takže inline `style={{...PACK_BOX.subblock}}` sem nesadne).
const B = PACK_BOX.subblock;
const BD = PACK_BOX.subblockDark;
const PASS_CSS = `
/* ✎ a „zdieľať" = pilulky. DNA .pk-pill (papyrusový gradient + 1.5px rgba(179,130,45,.55)
   + hover lift) — rozdiel medzi nimi nesie len veľkosť písma a výplň, nie iný rám. */
.pass-share{ display:inline-flex; align-items:center; gap:7px;
  font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:600; letter-spacing:.14em;
  text-transform:uppercase; padding:8px 16px; }
.pass-share:disabled{ opacity:.5; cursor:default; }
.pass-edit{ font-family:'Space Grotesk',sans-serif; font-size:10px; letter-spacing:0.14em;
  text-transform:uppercase; padding:4px 12px; text-decoration:none; }
/* LAPIS NA DOG ID (Matej 27. 9. 2026 nad hárkom plany/nakres-dogid-detail-2026-09-27:
   „zmeň všetky zlaté veci na lapisové — progres bar, chipy atď."). Zlato ostáva len
   konštrukcii (rám karty, deliaca čiara) a čiernemu bloku závetu, kde by lapis zanikol. */
.pass-edit:not(.pk-pill--dark), .pass-chip, .pass-share{ ${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.08)} }
/* KATEGÓRIE = SAMOSTATNÉ BLOKY (Matej 12.8.: „kategorie treba vizualne zoradit do
   blokov … vacsie nadpisy kategorii a viac strukturovane"). Blok = ÚROVEŇ 2 matrice
   (PODBLOK) — je to sekcia vnútri karty DOG ID, presne ako ZÁKLAD a ŽIVOTNÝ ŠTÝL
   v profile. Rovnaká hranica 720/721 px ako zvyšok karty psa. */
.pass-groups{ columns:2; column-gap:14px; }
@media (max-width:720px){ .pass-groups{ columns:1; } }
/* Cudzí profil (readOnly) má len 3 očíslované sekcie — stĺpce ich čítali 01 · 03 · 02
   (test po FLIPe 5. 10. 2026). Mriežka drží poradie po riadkoch. */
.pass-groups--ro{ columns:auto; display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }
.pass-groups--ro .pass-block{ margin:0; }
@media (max-width:720px){ .pass-groups--ro{ grid-template-columns:1fr; } }
.pass-block{ break-inside:avoid; -webkit-column-break-inside:avoid; margin:0 0 14px;
  background:${B.background}; border:${B.border}; border-radius:${B.borderRadius}px;
  padding:16px 16px 16px; box-shadow:${B.boxShadow};
  /* Inkoust bloku je premenná, nie natvrdo písaná farba v každom riadku — inak by sa
     tmavá varianta nedala prefarbiť: riadky si farbu nesú v inline style a ten CSS
     trieda neprebije. Takto stačí prepísať tri premenné na obale. */
  --pass-lbl:${T.inkWarm}; --pass-val:${T.inkStrong}; --pass-faint:${T.inkFaint}; }
/* ZÁVET JE ČIERNY (Matej 13.8.2026). Nie je to štýlová obmena — je to jediná sekcia
   dokladu, ktorá hovorí o smrti psa, a na papyruse mala rovnakú váhu ako obľúbená
   maškrta. Recept berie matrica (PACK_BOX.subblockDark), tu sa dolaďuje len inkoust.
   Rám a radius ostávajú zhodné so svetlými blokmi — v mriežke to má byť ich súrodenec.
   Panel na PÍSANIE závetu ostáva papyrusový zámerne: čierna je na čítanie dokladu,
   nie na vypĺňanie formulára. */
.pass-block--dark{ background:${BD.background}; border:${BD.border};
  box-shadow:${BD.boxShadow};
  /* 27. 9. 2026 Matej: „závet dajme lapisovým resp. gradientom zlatá–lapis (ako je na
     heroflow)" — tá istá plocha ako bublina vstupu (.hf-speak = var(--brand-gradient)).
     Recept rámu a tieňa ostáva z PACK_BOX.subblockDark, mení sa len výplň. */
  background:var(--brand-gradient);
  --pass-lbl:${T.onDarkDim}; --pass-val:${T.onDark}; --pass-faint:rgba(245,240,228,0.34); }
.pass-block--dark .pass-btitle{ color:rgba(245,240,228,0.92); }
.pass-block--dark .pass-brule{ opacity:.55; }
/* číslo sekcie je lapisové — na gradiente závetu by zaniklo, preto zlatý inkoust lapisu */
.pass-block--dark .pass-bnum{ color:${LAPIS.ink}; }
/* Červená chýbajúceho poľa musí na čiernej zosvetliť — ${T.alertRed} na ${T.pageBg} je pod
   čitateľnou hranicou. Rovnaký odtieň, len vyššia svetlosť. */
.pass-block--dark .pass-missing{ color:#D9705C; }
.pass-block--dark .pass-missing--optional{ color:rgba(245,240,228,0.34); }
.pass-block--dark .pass-fixed{ color:${T.onDark}; }
.pass-block--dark .pass-fixed--empty{ color:rgba(245,240,228,0.34); }
.pass-block--dark .pass-note{ border-top-color:${T.onDarkBorder}; }
.pass-block--dark .pass-notetext{ color:rgba(245,240,228,0.62); }
.pass-block--dark .pass-noteadd{ color:rgba(245,240,228,0.42); }
.pass-block--dark .pass-noteadd:hover{ color:rgba(245,240,228,0.88); }
.pass-bhead{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.pass-btitle{ display:flex; align-items:center; gap:9px; font-family:'Cinzel',serif; font-weight:700;
  font-size:16px; letter-spacing:0.14em; text-transform:uppercase; color:${T.inkStrong}; margin:0; }
.pass-bnum{ font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:500;
  letter-spacing:.14em; font-variant-numeric:tabular-nums; color:${LAPIS.edge}; opacity:.75; }
/* deliaca čiara vnútri bloku = predpísaný token T.rule, nie vlastný gradient.
   POZOR: tento blok je JS template literal — spätný apostrof v komentári zhodí build. */
.pass-brule{ height:2px; margin:10px 0 12px; background:${T.rule}; opacity:.75; }
/* NEVYPLNENÉ POLE. Červená je token T.alertRed, nie ľubovoľná červená. Veľkosť 15px
   a váha 600 sú tu preto, že jeden znak v riadku s 12px popiskom inak zanikne —
   pomlčka má byť vidieť cez celý blok. Váha 600 je STROP: Space Grotesk je načítaný
   300–600, pri 700 by prehliadač dosyntetizoval fake bold. */
.pass-toresult{
  color:inherit; text-decoration:none;
  /* Podčiarknutie musí byť VIDIEŤ, inak je to mŕtve tlačidlo — bodkovaná zlatá
     linka pod hodnotou hovorí „dá sa na to kliknúť" bez toho, aby z údaja spravila
     modrý odkaz. Ostatné riadky dokladu klikateľné nie sú a nesmú tak vyzerať. */
  border-bottom:1px dotted rgba(22,48,122,0.55);
  transition:border-color .15s ease, opacity .15s ease;
}
.pass-toresult:hover{ border-bottom-color:${LAPIS.edge}; opacity:.85; }
.pass-missing{ font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:600;
  letter-spacing:0.02em; color:${T.alertRed}; text-decoration:none; }
/* zámerne prázdne pole (zvláštna úloha) — pomlčka bez poplachu */
.pass-missing--optional{ color:${T.inkFaint}; }
.pass-missing:hover{ text-decoration:underline; }
/* KOMPLETNOSŤ DOKLADU. Prúžok je zámerne tenký a bez rámu — je to meradlo, nie ďalší
   blok; matrica sa naň nevzťahuje (nie je to karta ani podblok). Zlatá výplň je tá istá
   ako pilulka .pk-pill--gold, aby „hotové" malo v celom /packu jednu farbu. */
.pass-fill{ margin:2px 0 16px; }
.pass-fillhead{ display:flex; align-items:baseline; justify-content:space-between; gap:10px;
  margin-bottom:6px; }
.pass-filllbl{ font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:10px;
  letter-spacing:.26em; text-transform:uppercase; color:${LAPIS.edge}; }
.pass-fillnum{ font-family:'Space Grotesk',sans-serif; font-size:12px; font-variant-numeric:tabular-nums;
  color:${T.inkWarm}; white-space:nowrap; }
.pass-fillbar{ height:6px; border-radius:999px; background:${T.tileBg};
  border:1px solid ${T.border}; overflow:hidden; }
.pass-fillbar__on{ height:100%; border-radius:999px;
  background:linear-gradient(90deg,${LAPIS.lite} 0%,${LAPIS.edge} 100%); transition:width .4s ease; }
/* HLAVNÉ CTA dokladu — geometria .btn-gold (r8), výplň LAPIS. Písmo: cta. */
.pass-cta{ display:block; width:100%; box-sizing:border-box; margin:0 0 16px; padding:16px; border-radius:8px;
  font-family:${FONT_TITLE}; font-weight:700; font-size:16px; letter-spacing:.14em; text-transform:uppercase; /* písmo: cta */
  text-align:center; text-decoration:none; cursor:pointer;
  background:${LAPIS.grad}; color:${LAPIS.ink}; border:1px solid ${LAPIS.edge}; box-shadow:${LAPIS_BTN_SHADOW}; }
.pass-cta:hover{ background:${LAPIS.gradHover}; }
/* riadok, ktorý sa needituje (plemeno, narodenie, pohlavie) */
.pass-fixed{ font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:500;
  color:${T.inkStrong}; }
.pass-fixed--empty{ font-size:16px; font-weight:600; letter-spacing:0.02em; color:${T.inkFaint}; }
/* poznámka vlastnými slovami — to, čo z údajov robí psa */
.pass-note{ margin-top:12px; padding-top:12px; border-top:1px dashed ${T.hairline}; }
.pass-notetext{ font-family:'Space Grotesk',sans-serif; font-size:14px; line-height:1.55;
  color:${T.inkWarm}; font-style:italic; white-space:pre-wrap; margin:0; }
.pass-noteadd{ font-family:'Space Grotesk',sans-serif; font-size:10px; letter-spacing:0.14em;
  text-transform:uppercase; color:rgba(31,26,14,.42); background:transparent; border:0; padding:0;
  cursor:pointer; }
.pass-noteadd:hover{ color:${T.inkStrong}; }
`;

/**
 * Riadok, ktorý NEPOCHÁDZA z `dog_events` — plemeno, dátum narodenia, pohlavie. Sedia
 * v tabuľke `dogs` / `selections` od kúpy heroglyfu a kvízom sa needitujú (plemeno je
 * zapečené v samotnom glyfe). Doklad ich preto vykresľuje read-only, bez „✎" a bez
 * pečiatky dátumu: pečiatka existuje preto, že údaj starne — plemeno nestarne.
 */
export interface FixedRow {
  i18n: string;
  labelEN: string;
  /** `null` = údaj chýba. Nedostane ČERVENÚ, lebo sa nedá doplniť — len tlmenú pomlčku. */
  value: string | null;
}

// `bare` — pas sa od 12.8.2026 kreslí VNÚTRI karty identity (`PackDogDetail`), takže
// si nesmie priniesť vlastný rám: jeden doklad = jeden rám. Samostatný režim (bez
// `bare`) ostáva funkčný pre prípadné iné použitie.
// 👁️ VEREJNÁ ČASŤ DOG ID — čo vidí iný člen na profile (Matej 5. 10. 2026, „tri sekcie
//    pre turistiku"). Výsledok osobnostného kvízu (element + úloha) ide do POVAHY: v plnom
//    doklade sedí v Identite, ale Identita nesie aj čip, a tá je súkromná.
//    ⚠️ Server má ten istý allow-list (`20261008_member_profiles_dogid.sql`) — klient len
//    vyberá, čo z neho ukáže; o tom, čo cudzí VÔBEC dostane, rozhoduje SQL.
export const PUBLIC_DOGID_GROUPS = ['howWorks', 'social', 'temperament'] as const;
const PUBLIC_EXTRA_FIELDS: Record<string, string[]> = { temperament: ['nature.element', 'nature.role'] };

/** Kapitola mimo údajov dokladu (dokumenty, odkaz na stene). */
export type DogIdExtraChapter = { key: string; title: string; icon: string; sub: string; body: React.ReactNode };

export function DogPassport({
  dogId, bare = false, fixedRows, onEditPanel, values, readOnly = false, chapters, memorial = false,
}: {
  /** Zosnulý pes (len kapitoly v appke): bez VYPLNIŤ DOG ID, bez červeného „chýba“, bez percenta a bez „+ doplniť“. */
  memorial?: boolean;
  /** Kapitoly na rozkliknutie (appka, Matej 4. 11. 2026). Bez neho kreslí doklad ako doteraz. */
  chapters?: { head?: React.ReactNode; extra: DogIdExtraChapter[]; footer?: React.ReactNode };
  dogId: string;
  bare?: boolean;
  /** Read-only riadky navrch skupiny — kľúč je `PassGroup.key`. */
  fixedRows?: Record<string, FixedRow[]>;
  /** Skupina s `editPanel` neodkazuje do kvízu, ale volá toto. */
  onEditPanel?: (panel: string) => void;
  /** Hodnoty zvonka (cudzí pes z `get_member_profiles`) — doklad ich nečíta z DB sám,
   *  lebo RLS cudziemu `dog_events` nevydá. */
  values?: Record<string, LatestValue>;
  /** Pohľad iného člena: len `PUBLIC_DOGID_GROUPS`, bez ✎, bez percenta, bez poznámok,
   *  prázdne pole tlmenou pomlčkou (červená = „doplň to" patrí len majiteľovi). */
  readOnly?: boolean;
}) {
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };

  const rights = useMyDogRights();
  // Kapitoly v appke: pawmate bez práva `will` závet nevidí a jeho polia sa do percenta ani do „ďalšie prázdne“ nerátajú.
  const hideWill = !!chapters && !rights.can(dogId, 'will');
  const [latest, setLatest] = useState<Record<string, LatestValue> | null>(null);
  const [weightTrend, setWeightTrend] = useState<string | null>(null);

  useEffect(() => {
    if (values) { setLatest(values); return; }
    let alive = true;
    const load = () => { readLatest(dogId).then((r) => { if (alive) setLatest(r); }); };
    load();
    const off = onDogEventsChange(load);
    return () => { alive = false; off(); };
  }, [dogId, values]);

  // Trend váhy — jediné pole, kde má priebeh na karte reálnu výpovednú hodnotu.
  // Práve preto je log append-only: z prepísaného stĺpca by sa toto nedalo spočítať.
  useEffect(() => {
    if (readOnly) return; // zdravie cudzí nevidí — a trend váhy je zdravie
    let alive = true;
    readSeries(dogId, 'health.weightKg').then((rows) => {
      if (!alive || rows.length < 2) { setWeightTrend(null); return; }
      const last = Number(rows[rows.length - 1].value);
      const prev = Number(rows[rows.length - 2].value);
      if (!Number.isFinite(last) || !Number.isFinite(prev)) { setWeightTrend(null); return; }
      const diff = last - prev;
      if (Math.abs(diff) < 0.05) { setWeightTrend(null); return; }
      const months = monthsBetween(rows[rows.length - 2].recordedAt, rows[rows.length - 1].recordedAt);
      const span = months >= 1 ? ` / ${months} ${tx('pack.pass.months', 'mo.')}` : '';
      setWeightTrend(`${diff > 0 ? '↗ +' : '↘ −'}${Math.abs(diff).toFixed(1)} kg${span}`);
    });
    return () => { alive = false; };
  }, [dogId]);

  const groups = useMemo(() => {
    if (!latest) return [];
    // ⚠️ ZMENA PRAVIDLA 3 Z HLAVIČKY (Matej 13.8.2026): „logika bude, že aj nevyplnený
    // profil bude mať v DOG ID všetky položky, ale nevyplnené budú na červeno — ale
    // budú tam odzačiatku." Dovtedy sa prázdny riadok NEZOBRAZIL, takže nový pes mal
    // doklad takmer prázdny a nebolo z čoho vidieť, čo ešte chýba.
    // Čo z pôvodného locku PLATÍ ĎALEJ: nič sa nedogeneruje. Prázdne pole nedostane
    // odhad ani predvyplnenú hodnotu — dostane pomlčku a odkaz, kde sa doplní.
    const source = readOnly
      ? PASS_GROUPS.filter((g) => (PUBLIC_DOGID_GROUPS as readonly string[]).includes(g.key))
      : PASS_GROUPS.filter((g) => !(hideWill && g.key === 'will'));
    return source.map((g) => {
      // Bez filtra podľa pohľadu — majiteľ vidí komplet. Filtruje sa až pri zdieľaní.
      const fields = readOnly ? [...(PUBLIC_EXTRA_FIELDS[g.key] ?? []), ...g.fields] : g.fields;
      const rows = fields
        .map((f) => ({ step: STEP_BY_FIELD[f], value: capSpecials(f, latest[f], latest) }))
        .filter((r) => !!r.step && (!FLOW_EXTRA_FIELDS.has(r.step.field) || hasValue(r.value)));
      return { group: g, rows };
    }).filter((g) => g.rows.length > 0);
  }, [latest, readOnly, hideWill]);

  // KOMPLETNOSŤ NA SAMOTNOM DOKLADE. Percento žilo len na dlaždici v `/pack/dogs` —
  // teda nie tam, kde človek vypĺňa. Odkedy je nevyplnené červené, doklad JE checklist
  // a potrebuje jedno číslo, ktoré povie, ako ďaleko si.
  // Ráta sa z `PROGRESS_STEPS` (bez `noProgress` a `optional`) — TEN ISTÝ zdroj ako
  // dlaždica na hube, aby dve miesta nemohli ukázať dve rôzne čísla.
  const fill = useMemo(() => {
    if (!latest) return null;
    if (memorial && chapters) return null; // zosnulému psovi sa nič nedopĺňa, percento nemá zmysel
    const steps = PROGRESS_STEPS.filter((s) => !(hideWill && s.field.startsWith('will.')));
    const total = steps.length;
    const done = steps.filter((s) => hasValue(latest[s.field])).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [latest, hideWill, memorial, chapters]);

  // ĎALŠIE PRÁZDNE POLE — kam vedie VYPLNIŤ DOG ID (Matej 26. 10. 2026, nakres-cta 4A). Hľadá sa
  // v PORADÍ DOKLADU (sekcie zhora), nie v poradí `PROGRESS_STEPS`, aby tlačidlo viedlo na prvú
  // červenú pomlčku, ktorú človek pod ním uvidí. Cieľ je ten istý ako pri pomlčke (`PassRow`).
  const nextMissing = useMemo(() => {
    if (!latest || readOnly || (memorial && chapters)) return null;
    const counted = new Set(PROGRESS_STEPS.filter((st) => !(hideWill && st.field.startsWith('will.'))).map((st) => st.field));
    for (const { group, rows } of groups) {
      const hit = rows.find(({ step }) => counted.has(step.field) && !hasValue(latest[step.field]));
      if (!hit) continue;
      if (group.editPanel) return { panel: group.editPanel, to: null as string | null };
      return {
        panel: null as string | null,
        to: hit.step.editHref
          ? `${hit.step.editHref}?dog=${dogId}`
          : `/pack/dogs/quiz/${group.editSection}?dog=${dogId}&field=${hit.step.field}`,
      };
    }
    return null;
  }, [groups, latest, readOnly, dogId, hideWill, memorial, chapters]);

  if (!latest) return null;

  if (chapters) {
    return (
      <DogIdChapters
        dogId={dogId} groups={groups} latest={latest} fixedRows={fixedRows ?? {}} fill={fill}
        nextMissing={nextMissing} onEditPanel={onEditPanel} weightTrend={weightTrend} tx={tx} memorial={memorial} {...chapters}
      />
    );
  }

  return (
    <section
      style={bare
        ? { color: T.ink }
        : {
          background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
          boxShadow: T.cardShadow, padding: '24px 24px', color: T.ink,
        }}
    >
      {/* Poradie je záväzné: matrica (PILL_CSS, PF_FIELD_CSS) najprv, lokálna
          typografia až za ňou — pri rovnakej špecificite rozhoduje poradie pravidiel. */}
      <style>{PILL_CSS}</style>
      <style>{PF_FIELD_CSS}</style>
      <style>{PASS_CSS}</style>
      <style>{TILT_CSS}</style>


      {/* Hláška „zatiaľ nič vyplnené" zanikla 13.8.2026 — doklad má odteraz všetky
          položky od prvej sekundy, takže prázdno nie je stav, ktorý by sa dal opísať
          vetou. Nevyplnené sa ukáže samo, červenou. Namiesto nej stojí percento. */}
      {fill && !readOnly && (
        <div className="pass-fill">
          <div className="pass-fillhead">
            <span className="pass-filllbl">{tx('pack.pass.fillTitle', 'Filled in')}</span>
            <span className="pass-fillnum">
              {fill.done}/{fill.total} · {fill.pct}%
            </span>
          </div>
          <div className="pass-fillbar">
            <div
              className="pass-fillbar__on"
              style={{ width: `${fill.pct}%` }}
              role="progressbar"
              aria-valuenow={fill.pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* VYPLNIŤ DOG ID · N CHÝBA — jediné plné lapis na detaile psa (Matej 26. 10. 2026, nakres-cta 4A:
          „žiadne hlavné tlačidlo"). Pod pásom VYPLNENÉ, lebo pás hovorí koľko a tlačidlo kam ďalej.
          Na 100 % zmizne — nie je čo vyplniť. UPRAVIŤ pri sekciách ostáva ako druhá cesta. */}
      {fill && !readOnly && fill.done < fill.total && nextMissing && (
        <RightGate right="dogid.edit" dogId={dogId}>
          {nextMissing.panel ? (
            <button type="button" className="pass-cta" onClick={() => onEditPanel?.(nextMissing.panel!)}>
              {tx('pack.pass.fillCta', 'Fill in DOG ID')} · {fill.total - fill.done} {tx('pack.pass.fillMissing', 'missing')}
            </button>
          ) : (
            <Link className="pass-cta" to={nextMissing.to!}>
              {tx('pack.pass.fillCta', 'Fill in DOG ID')} · {fill.total - fill.done} {tx('pack.pass.fillMissing', 'missing')}
            </Link>
          )}
        </RightGate>
      )}

      <div className={readOnly ? 'pass-groups pass-groups--ro' : 'pass-groups'}>
      {groups.map(({ group, rows }, i) => {
        // ČIERNY JE PRÁVE JEDEN BLOK — závet. Podmienka je na `key`, nie na `editPanel`:
        // panel je technická vlastnosť (edituje sa inde než kvízom) a keby ho zajtra dostala
        // ďalšia sekcia, sčernela by bez rozhodnutia. Čierna je tu za VÝZNAM, nie za mechaniku.
        const dark = group.key === 'will';
        return (
        <div key={group.key} className={`pass-block pk-tilt${dark ? ' pass-block--dark' : ''}`} {...TILT_PROPS}>
          <div className="pass-bhead">
            <h5 className="pass-btitle">
              <span className="pass-bnum">{String(i + 1).padStart(2, '0')}</span>
              {tx(group.i18n, group.labelEN)}
            </h5>
            {/* ✎ — jediná cesta k editácii ÚDAJOV. Predfiltrované na TOHTO psa.
                `editHref` = sekcia má vlastný povrch (osobnostný kvíz), kde deep-link
                na jedno pole nedáva zmysel: je to jeden priebeh so scoringom.
                `editPanel` = needituje sa inde, ale priamo tu (závet). */}
            {readOnly ? null : group.editPanel ? (
              /* Závet má vlastné právo — je to jediná sekcia dokladu, ktorá hovorí
                 o tom, čo bude PO psovi, a §5 ju drží oddelene od `dogid.edit`. */
              <RightGate right={group.key === 'will' ? 'will' : 'dogid.edit'} dogId={dogId}>
              <button
                type="button"
                className={`pk-pill pk-pill--tap pass-edit${dark ? ' pk-pill--dark' : ''}`}
                onClick={() => onEditPanel?.(group.editPanel!)}
              >
                {APP_NEW ? <SysIcon name="ceruzka" size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> : '✎'} {tx('pack.pass.edit', 'edit')}
              </button>
              </RightGate>
            ) : (
              <RightGate right="dogid.edit" dogId={dogId}>
              <Link
                className="pk-pill pk-pill--tap pass-edit"
                to={group.editHref
                  ? `${group.editHref}?dog=${dogId}`
                  : `/pack/dogs/quiz/${group.editSection}?dog=${dogId}&field=${group.fields[0]}`}
              >
                {APP_NEW ? <SysIcon name="ceruzka" size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> : '✎'} {tx('pack.pass.edit', 'edit')}
              </Link>
              </RightGate>
            )}
          </div>

          <div className="pass-brule" />

          <dl
            style={{
              // minmax(0,1fr) + anywhere: dlhý e-mail v Závete roztiahol stĺpec
              // a celý odkaz pretiekol z karty (Daniela 12. 10. 2026, mobil 400 px).
              display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '6px 14px',
              alignItems: 'baseline', margin: 0, overflowWrap: 'anywhere',
            }}
          >
            {/* Read-only riadky navrch — plemeno, narodenie, pohlavie. Stoja PRED
                kvízovými, lebo doklad sa číta zhora: najprv kto to je, potom detaily. */}
            {(fixedRows?.[group.key] ?? []).map((r) => (
              <FixedPassRow key={r.i18n} row={r} tx={tx} />
            ))}
            {rows.map(({ step, value }) => (
              <PassRow
                key={step.field}
                step={step}
                value={value}
                trend={step.field === 'health.weightKg' ? weightTrend : null}
                // Kam ide oprava PRÁVE TOHTO poľa. Krok si smer nesie sám, keď sa
                // needituje kvízom svojej skupiny (`nature.*` → osobnostný kvíz).
                dogId={dogId}
                editTo={step.editHref
                  ? `${step.editHref}?dog=${dogId}`
                  : `/pack/dogs/quiz/${group.editSection}?dog=${dogId}&field=${step.field}`}
                onEditPanel={group.editPanel ? () => onEditPanel?.(group.editPanel!) : undefined}
                readOnly={readOnly}
                tx={tx}
              />
            ))}
          </dl>

          {/* POZNÁMKA VLASTNÝMI SLOVAMI — jediné pole, ktoré sa edituje priamo tu.
              Údaje ostávajú read-only (patria kvízu), ale veta o psovi patrí tam, kde
              sa číta: „Bojí sa búrky, vtedy chce byť v kúpeľni." Toto je to, čo z
              tabuľky robí psa — a čo veterinár ani opatrovateľ z hodnôt nevyčíta. */}
          {!readOnly && (
          <GroupNote
            dogId={dogId}
            groupKey={group.key}
            value={typeof latest[`${group.key}.note`]?.value === 'string' ? String(latest[`${group.key}.note`]!.value) : ''}
            tx={tx}
          />
          )}
        </div>
        );
      })}
      </div>

    </section>
  );
}

// ── KAPITOLY DOG ID (appka, Matej 4. 11. 2026, nákres plany/nakresy/dogid-2026-11-04) ─────
// Deväť rovnakých kariet (4 091 px) sa zmenilo na kapitoly na rozkliknutie. Údaje, práva aj odkazy
// do kvízu sú tie isté ako v doklade vyššie; mení sa len kresba. Dátum z každého riadku odišiel
// do jedného „Upravené" na konci kapitoly, veterinár ho teda stále vidí.
// Ikonky vybral Matej v hárku plany/nakresy/dogid-2026-11-04/ikonky (4. 11. 2026).
const CH_ICON: Record<string, string> = {
  identity: 'dogid-identity', health: 'dogid-health', vax: 'dogid-vax', food: 'dogid-food', howWorks: 'dogid-works',
  social: 'dogid-social', temperament: 'dogid-temperament', contacts: 'dogid-contacts', will: 'dogid-will',
};
/** Polia, ktoré hore nesú veľké emblémy, a preto ich kapitola Identita neopakuje. */
const TRIO_FIELDS = ['nature.element', 'nature.role', 'nature.specials'];
// Ten istý dopočítaný filter ako `lapis` v lab/NavMedallion: trafí LAPIS.edge, teda rgb(22,48,122).
const LAPIS_ICON = 'brightness(0) saturate(100%) invert(41%) sepia(94%) saturate(708%) hue-rotate(198deg) brightness(48%) contrast(123%)';

const CH_CSS = `
.dic-cta{ position:relative; overflow:hidden; padding:16px 16px 24px; }
.dic-cta small{ display:block; margin-top:4px; font-family:${FONT_UI}; font-weight:500; font-size:12px; letter-spacing:.02em; text-transform:none; opacity:.85; }
.dic-cta .dic-bar{ position:absolute; left:0; bottom:0; height:4px; border-radius:0; background:transparent; }
.dic-cta .dic-bar > span{ display:block; border-radius:0; background:linear-gradient(90deg,#EDCE7C,${T.accentGold}); }
/* PLOCHA (9. 11. 2026): kapitola nie je karta, je to sekcia s vlasovou čiarou; karta ostáva len pre tmavý ZÁVET. */
.dic-card{ background:none; border:0; border-bottom:1px solid ${T.cardEdge}; border-radius:0; box-shadow:none; margin-bottom:0; }
.dic-card.dic-dark{ border:1px solid ${T.cardEdge}; border-radius:16px; margin:12px 0; }
.dic-card.dic-trio{ border-bottom:0; margin-bottom:8px; }
.dic-trio{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; padding:16px 8px; text-align:center; margin-bottom:16px; }
.dic-trio.two{ grid-template-columns:repeat(2,minmax(0,1fr)); }
.dic-tr{ display:block; color:inherit; text-decoration:none; min-width:0; }
button.dic-tr{ background:none; border:0; padding:0; width:100%; font:inherit; cursor:pointer; }
.dic-tr img{ width:72px; height:72px; object-fit:contain; display:block; margin:0 auto 8px; }
.dic-tr em{ display:block; font-style:normal; font-family:${FONT_UI}; font-weight:500; font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:${T.inkWarm}; }
.dic-tr b{ font-family:${FONT_UI}; font-weight:600; font-size:14px; color:${T.inkStrong}; }
.dic-tr .dic-q{ width:72px; height:72px; margin:0 auto 8px; border-radius:50%; border:1px dashed ${LAPIS.edge}; display:flex; align-items:center; justify-content:center; font-family:${FONT_UI}; font-size:24px; color:${LAPIS.edge}; }
.dic-coin{ flex:none; width:44px; height:44px; border-radius:50%; background:${T.cardGrad}; border:1px solid ${T.cardEdge}; display:flex; align-items:center; justify-content:center; box-shadow:${T.cardShadow}; }
.dic-hd{ display:flex; align-items:center; gap:12px; width:100%; background:none; border:0; padding:12px; text-align:left; cursor:pointer; color:inherit; }
.dic-ttl{ flex:1; min-width:0; }
.dic-ttl h3{ margin:0; font-family:${FONT_TITLE}; font-weight:700; font-size:14px; letter-spacing:.14em; text-transform:uppercase; color:${T.inkStrong}; } /* písmo: nadpis */
.dic-ttl p{ margin:0; font-family:${FONT_UI}; font-size:12px; color:${T.inkWarm}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dic-ttl p.miss{ color:${T.alertRed}; }
.dic-ok{ flex:none; position:relative; width:20px; height:20px; border-radius:50%; background:${T.growGreen}; }
.dic-ok::after{ content:''; position:absolute; left:7px; top:3px; width:5px; height:10px; border:solid #EAF7ED; border-width:0 2px 2px 0; transform:rotate(45deg); }
.dic-chev{ flex:none; width:8px; height:8px; margin:0 4px; border:solid ${T.inkWarm}; border-width:0 2px 2px 0; transform:rotate(45deg); transition:transform .2s; }
.dic-open .dic-chev{ transform:rotate(-135deg); }
.dic-bd{ padding:0 12px 12px; }
.dic-tiles{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:8px; }
.dic-t{ display:block; min-width:0; min-height:56px; padding:8px 12px; border-radius:12px; background:${B.background}; border:${B.border}; text-decoration:none; color:${T.inkStrong}; overflow-wrap:anywhere; font-family:${FONT_UI}; font-size:14px; font-weight:600; text-align:left; }
.dic-t.w{ grid-column:1/-1; }
.dic-t em{ display:block; font-style:normal; font-weight:500; font-size:10px; letter-spacing:.14em; color:${T.inkWarm}; }
.dic-t.e{ background:${LAPIS.fill}; border:1px dashed ${LAPIS.edge}; color:${LAPIS.edge}; font-size:12px; font-weight:500; cursor:pointer; }
.dic-foot{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:12px; font-family:${FONT_UI}; font-size:10px; color:${T.inkWarm}; }
/* ZÁVET ostáva tmavý — ten istý význam ako .pass-block--dark. */
.dic-dark{ background:var(--brand-gradient); }
.dic-dark .dic-ttl h3{ color:${LAPIS.ink}; }
.dic-dark .dic-ttl p.miss{ color:#D9705C; }
.dic-dark .dic-chev{ border-color:${LAPIS.ink}; }
.dic-dark .dic-t{ background:rgba(245,240,228,0.08); border:1px solid ${T.onDarkBorder}; color:${T.onDark}; }
.dic-dark .dic-t em, .dic-dark .dic-foot{ color:${T.onDarkDim}; }
.dic-dark .dic-t.e{ border-style:dashed; color:${LAPIS.ink}; }
.dic-dark .pass-noteadd{ color:rgba(245,240,228,0.42); }
.dic-dark .pass-notetext{ color:rgba(245,240,228,0.62); }
.dic-dark .pass-note{ border-top-color:${T.onDarkBorder}; }
`;

/** Šírka výplne PROGRESU (recept `.pk-progress`), ten istý pomocník ako v `StatsDetail`. */
const fillW = (pct: number) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { display: 'block', width: w };
};

/** Text hodnoty bez kresby: zhrnutie kapitoly a PDF na tlač. */
export function passPlainValue(step: QuizStep, v: unknown, tx: (k: string, f: string) => string, loc: string): string {
  if (Array.isArray(v)) return v.map((x) => quizValueLabel(step, String(x), tx)).join(', ');
  const s = String(v);
  if (step.kind === 'date') return longDate(s, loc);
  if (step.kind === 'number') return step.unit ? `${s} ${step.unit}` : s;
  if (step.kind === 'single') return quizValueLabel(step, s, tx);
  return s;
}

function DogIdChapters({
  dogId, groups, latest, fixedRows, fill, nextMissing, onEditPanel, weightTrend, tx, head, extra, footer, memorial,
}: {
  memorial: boolean;
  dogId: string;
  groups: { group: (typeof PASS_GROUPS)[number]; rows: { step: QuizStep; value: LatestValue | undefined }[] }[];
  latest: Record<string, LatestValue>;
  fixedRows: Record<string, FixedRow[]>;
  fill: { done: number; total: number; pct: number } | null;
  nextMissing: { panel: string | null; to: string | null } | null;
  onEditPanel?: (panel: string) => void;
  weightTrend: string | null;
  tx: (k: string, f: string) => string;
  head?: React.ReactNode; extra: DogIdExtraChapter[]; footer?: React.ReactNode;
}) {
  const { lang } = useLang();
  const nav = useNavigate();
  const loc = intlLocale(lang);
  const [open, setOpen] = useState('identity');
  const counted = useMemo(() => new Set(PROGRESS_STEPS.map((s) => s.field)), []);
  const left = fill ? fill.total - fill.done : 0;

  const ctaInner = fill && (
    <>
      {tx('pack.pass.fillCta', 'Fill in DOG ID')}
      <small>
        {tx('pack.dogs2.left', '{n} questions left · about {m} min').replace('{n}', String(left)).replace('{m}', String(Math.max(1, Math.ceil((left * 10) / 60))))}
      </small>
      <span className="pk-progress dic-bar"><span className="pk-progress__fill" style={fillW(fill.pct)} /></span>
    </>
  );

  const trio = TRIO_FIELDS.flatMap((f) => {
    const step = STEP_BY_FIELD[f];
    if (!step) return [];
    const val = capSpecials(f, latest[f], latest);
    // Zvláštna úloha je u väčšiny psov prázdna zámerne, prázdne miesto by hlásilo poruchu, ktorá nie je.
    if (f === 'nature.specials' && !hasValue(val)) return [];
    const raw = Array.isArray(val?.value) ? val!.value[0] : val?.value;
    const label = f === 'nature.element' ? tx('pack.dogs2.element', 'Element') : tx(step.rowI18n, step.rowEN);
    const to = hasValue(val) && step.resultHref ? `${step.resultHref}&dog=${dogId}&from=id` : `${step.editHref}?dog=${dogId}`;
    const art = hasValue(val) ? natureArt(f, raw) : '';
    if (!hasValue(val)) {
      const body = (<><span className="dic-q">?</span><em>{label}</em><b>{memorial ? '—' : tx('pack.pass.addValue', 'add')}</b></>);
      // Zosnulému sa nič nedopĺňa. Inak je to ťuk do kvízu, ktorý patrí len tomu, kto smie upravovať DOG ID (DOM prvok, aby sa gate nezabalil).
      return [memorial
        ? <div key={f} className="dic-tr">{body}</div>
        : <RightGate key={f} right="dogid.edit" dogId={dogId}><button type="button" className="dic-tr" onClick={() => nav(to)}>{body}</button></RightGate>];
    }
    return [(
      <Link key={f} className="dic-tr" to={to}>
        {art ? <img src={art} alt="" /> : <span className="dic-q">?</span>}
        <em>{label}</em>
        <b>{quizValueLabel(step, String(raw), tx)}</b>
      </Link>
    )];
  });

  const editOf = (group: (typeof PASS_GROUPS)[number], dark: boolean) => (
    group.editPanel ? (
      <RightGate right={group.key === 'will' ? 'will' : 'dogid.edit'} dogId={dogId}>
        <button type="button" className={`pk-pill pk-pill--tap pass-edit${dark ? ' pk-pill--dark' : ''}`} onClick={() => onEditPanel?.(group.editPanel!)}>
          {APP_NEW ? <SysIcon name="ceruzka" size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> : '✎'} {tx('pack.pass.edit', 'edit')}
        </button>
      </RightGate>
    ) : (
      <RightGate right="dogid.edit" dogId={dogId}>
        <Link className="pk-pill pk-pill--tap pass-edit" to={`/pack/dogs/quiz/${group.editSection}?dog=${dogId}&field=${group.fields[0]}`}>
          {APP_NEW ? <SysIcon name="ceruzka" size={18} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> : '✎'} {tx('pack.pass.edit', 'edit')}
        </Link>
      </RightGate>
    )
  );

  const row = (key: string, title: string, icon: string, sub: string, miss: boolean, done: boolean, dark: boolean, body: React.ReactNode) => (
    <div key={key} className={`dic-card${dark ? ' dic-dark' : ''}${open === key ? ' dic-open' : ''}`}>
      <button type="button" className="dic-hd" aria-expanded={open === key} onClick={() => setOpen(open === key ? '' : key)}>
        <span className="dic-coin"><BrandIcon name={icon} size={24} style={APP_NEW ? undefined : { filter: LAPIS_ICON }} /></span>
        <span className="dic-ttl"><h3>{title}</h3>{sub && <p className={miss ? 'miss' : ''}>{sub}</p>}</span>
        {done && <span className="dic-ok" />}
        <span className="dic-chev" />
      </button>
      {open === key && <div className="dic-bd">{body}</div>}
    </div>
  );

  return (
    <section style={{ color: T.ink, textAlign: 'left' }}>
      <style>{PILL_CSS}</style>
      <style>{PF_FIELD_CSS}</style>
      <style>{PASS_CSS}</style>
      <style>{PROGRESS_CSS}</style>
      <style>{CH_CSS}</style>

      {fill && fill.done < fill.total && nextMissing && (
        <RightGate right="dogid.edit" dogId={dogId}>
          {nextMissing.panel
            ? <button type="button" className="pass-cta dic-cta" onClick={() => onEditPanel?.(nextMissing.panel!)}>{ctaInner}</button>
            : <Link className="pass-cta dic-cta" to={nextMissing.to!}>{ctaInner}</Link>}
        </RightGate>
      )}

      {trio.length > 0 && <div className={`dic-card dic-trio${trio.length === 2 ? ' two' : ''}`}>{trio}</div>}
      {head}

      {groups.map(({ group, rows }) => {
        const dark = group.key === 'will';
        const shown = rows.filter((r) => !TRIO_FIELDS.includes(r.step.field));
        const fixed = fixedRows[group.key] ?? [];
        const missing = memorial ? [] : shown.filter((r) => counted.has(r.step.field) && !hasValue(r.value));
        const filled = shown.filter((r) => hasValue(r.value));
        const summary = [...fixed.map((r) => r.value ?? ''), ...filled.map((r) => passPlainValue(r.step, r.value!.value, tx, loc))]
          .filter(Boolean).slice(0, 3).join(' · ');
        const sub = missing.length
          ? `${tx('pack.pass.missingList', 'missing')}: ${missing.map((r) => tx(r.step.rowI18n, r.step.rowEN).toLowerCase()).join(', ')}`
          : summary;
        const stamp = filled.map((r) => r.value!.recordedAt).sort().pop();

        // Široká dlaždica = dlhý text alebo pilulky. Úzka bez suseda sa natiahne, aby v mriežke neostala diera.
        const cells = [
          ...fixed.map((r) => ({ key: r.i18n, wide: (r.value ?? '').length > 16, node: (w: boolean) => (
            <div key={r.i18n} className={`dic-t${w ? ' w' : ''}`}><em>{tx(r.i18n, r.labelEN)}</em>{r.value || '—'}</div>
          ) })),
          ...shown.map(({ step, value }) => {
            const to = step.editHref ? `${step.editHref}?dog=${dogId}` : `/pack/dogs/quiz/${group.editSection}?dog=${dogId}&field=${step.field}`;
            const name = tx(step.rowI18n, step.rowEN);
            if (!hasValue(value)) {
              // Zosnulý: len tlmená pomlčka. Inak „+ doplniť“ za bránou práva (DOM prvok `button`, aby gate nezabalil dlaždicu do obalu).
              const inner = (w: boolean) => (memorial
                ? <div key={step.field} className={`dic-t${w ? ' w' : ''}`}><em>{name}</em>—</div>
                : (
                  <RightGate key={step.field} right={group.key === 'will' ? 'will' : 'dogid.edit'} dogId={dogId}>
                    <button type="button" className={`dic-t e${w ? ' w' : ''}`} onClick={() => (group.editPanel ? onEditPanel?.(group.editPanel) : nav(to))}><em>{name}</em>+ {tx('pack.pass.addValue', 'add')}</button>
                  </RightGate>
                ));
              return { key: step.field, wide: name.length > 16, node: inner };
            }
            const text = passPlainValue(step, value!.value, tx, loc);
            const wide = Array.isArray(value!.value) || text.length > 16;
            return { key: step.field, wide, node: (w: boolean) => (
              <div key={step.field} className={`dic-t${w ? ' w' : ''}`}>
                <em>{name}</em>
                {renderValue(step, value!.value, tx, loc)}
                {step.field === 'health.weightKg' && weightTrend && <span style={{ fontFamily: FONT_UI, fontSize: 10, color: T.growGreen, marginLeft: 8 }}>{weightTrend}</span>}
                {(value!.actedBy || value!.actedName) && <> <ActedBy id={value!.actedBy} name={value!.actedName} /></>}
              </div>
            ) };
          }),
        ];
        let col = 0;
        const tiles = cells.map((c, i) => {
          const next = cells[i + 1];
          const wide = c.wide || (col === 0 && (!next || next.wide));
          col = wide ? 0 : (col + 1) % 2;
          return c.node(wide);
        });

        return row(
          group.key, tx(group.i18n, group.labelEN), CH_ICON[group.key] ?? 'dogid-identity', sub, missing.length > 0,
          // Očkovania sú v appke nepovinné (nehlásia sa ako chýbajúce), ale háčik dostanú až keď sú vyplnené VŠETKY polia.
          group.key === 'vax' ? shown.length > 0 && filled.length === shown.length : missing.length === 0 && filled.length + fixed.length > 0, dark,
          <>
            <div className="dic-tiles">{tiles}</div>
            <GroupNote dogId={dogId} groupKey={group.key} value={typeof latest[`${group.key}.note`]?.value === 'string' ? String(latest[`${group.key}.note`]!.value) : ''} tx={tx} />
            <div className="dic-foot">
              <span>{stamp ? tx('pack.pass.updated', 'Updated {date}').replace('{date}', shortDate(stamp, loc)) : ''}</span>
              {editOf(group, dark)}
            </div>
          </>,
        );
      })}
      {extra.map((c) => row(c.key, c.title, c.icon, c.sub, false, false, false, c.body))}
      {footer}
    </section>
  );
}

// ── ZDIEĽANIE ────────────────────────────────────────────────────────────────
// Hore aj dole. Voľba príjemcu = voľba POHĽADU, a ten sa zapečie do odkazu (§2/8 zadania):
// odkaz sa nedá dodatočne prepnúť, chceš iný — vyrobíš nový. Bezpečnostná vlastnosť.
//
// Share sheet sa ešte nestavia (krok 6 poradia), preto sú tlačidlá zatiaľ mŕtve a označené
// „čoskoro" — radšej viditeľný zámer než tlačidlo, ktoré nič neurobí a tvári sa funkčne.
// ShareRow (rad „Zdieľať kartu“ s tlačidlom Závet hore aj dole) zanikol 27. 9. 2026 — Matej
// nad hárkom DOG ID: „zavet tlačítko daj preč“. Závet sa píše cez ✎ v bloku 09.

/**
 * Zvláštna úloha na doklade — orezaná na dnešný strop (najviac JEDNA, lock 22. 8. 2026).
 * V `dog_events` psom z predošlých behov ležia zapísané aj štyri naraz; tabuľka je
 * append-only, takže sa história neprepisuje a oreže sa až čítanie.
 *
 * ⚠️ ROZPAD BODOV SA MUSÍ PODAŤ. Bez neho padne výber na poradie v `SPECIAL_KEYS` a doklad
 * ukáže INÚ úlohu než psí blok na `/pack/dogs` a než výsledok kvízu — presne to sa stalo
 * pri prvom pokuse 22. 8. (doklad „The Peacemaker", blok „The Nurturer", ten istý pes).
 * Jeden zdroj čísel = jedna odpoveď na všetkých troch povrchoch.
 */
export function capSpecials(
  field: string,
  value: LatestValue | undefined,
  latest: Record<string, LatestValue>,
): LatestValue | undefined {
  if (field !== 'nature.specials' || !value || !Array.isArray(value.value)) return value;
  const spec = (latest['nature.scores']?.value as { spec?: Record<string, number> } | undefined)?.spec;
  return { ...value, value: storedSpecials(value.value, spec) };
}

/**
 * Riadok, ktorý sa needituje — hodnota prišla s heroglyfom, nie z kvízu.
 * Bez „✎", bez pečiatky dátumu; keď chýba, je pomlčka TLMENÁ, nie červená:
 * červená hovorí „doplň to", a toto sa doplniť nedá.
 */
function FixedPassRow({ row, tx }: { row: FixedRow; tx: (k: string, f: string) => string }) {
  return (
    <>
      <dt style={{ fontFamily: FONT_UI, fontSize: 12, color: 'var(--pass-lbl)', whiteSpace: 'nowrap' }}>
        {tx(row.i18n, row.labelEN)}
      </dt>
      <dd style={{ margin: 0 }}>
        <span className={row.value ? 'pass-fixed' : 'pass-fixed pass-fixed--empty'}>
          {row.value || '—'}
        </span>
      </dd>
    </>
  );
}

function PassRow({
  step, value, trend, editTo, dogId, onEditPanel, readOnly = false, tx,
}: {
  step: QuizStep; value: LatestValue | undefined; trend: string | null; editTo: string;
  dogId: string;
  onEditPanel?: () => void;
  readOnly?: boolean;
  tx: (k: string, f: string) => string;
}) {
  // Dátum podľa jazyka APPKY, nie prehliadača — slovenský doklad v anglickom Chrome
  // písal „8/6/2026" (28. 9. 2026).
  const { lang } = useLang();
  const loc = intlLocale(lang);
  // NEVYPLNENÉ POLE = ČERVENÁ POMLČKA, KTORÁ VEDIE TAM, KDE SA DOPLNÍ (Matej 13.8.2026).
  // Doklad tým prestal byť výpisom toho, čo je hotové, a stal sa zoznamom toho, čo chýba —
  // preto je pomlčka odkaz, nie mŕtvy znak. Výnimka: `nature.specials` (`noProgress`) je
  // u väčšiny psov prázdne ZÁMERNE, nie zabudnutím — červená by tam hlásila poruchu,
  // ktorá neexistuje, takže dostáva tlmenú pomlčku.
  if (!hasValue(value)) {
    // DVA rôzne dôvody, rovnaký prejav: `noProgress` = nedá sa vyplniť vôľou (zvláštna
    // úloha), `optional` = vyplniť sa dá, ale nič to neohrozí (povely, záložný e-mail).
    // Ani jedno nie je diera, takže ani jedno nedostane červenú.
    const optional = !!step.noProgress || !!step.optional;
    if (readOnly) {
      return (
        <>
          <dt style={{ fontFamily: FONT_UI, fontSize: 12, color: 'var(--pass-lbl)', whiteSpace: 'nowrap' }}>
            {tx(step.rowI18n, step.rowEN)}
          </dt>
          <dd style={{ margin: 0 }}>
            <span className="pass-missing pass-missing--optional">—</span>
          </dd>
        </>
      );
    }
    return (
      <>
        <dt style={{ fontFamily: FONT_UI, fontSize: 12, color: 'var(--pass-lbl)', whiteSpace: 'nowrap' }}>
          {tx(step.rowI18n, step.rowEN)}
        </dt>
        <dd style={{ margin: 0 }}>
          {onEditPanel ? (
            <button
              type="button"
              onClick={onEditPanel}
              title={tx('pack.pass.missing', 'not filled in')}
              className={`pass-missing${optional ? ' pass-missing--optional' : ''}`}
              style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}
            >
              —
            </button>
          ) : (
            <Link
              to={editTo}
              title={tx('pack.pass.missing', 'not filled in')}
              className={`pass-missing${optional ? ' pass-missing--optional' : ''}`}
            >
              —
            </Link>
          )}
        </dd>
      </>
    );
  }

  return (
    <>
      <dt style={{ fontFamily: FONT_UI, fontSize: 12, color: 'var(--pass-lbl)', whiteSpace: 'nowrap' }}>
        {tx(step.rowI18n, step.rowEN)}
      </dt>
      <dd style={{ margin: 0, fontFamily: FONT_UI, fontSize: 14, color: 'var(--pass-val)', fontWeight: 500 }}>
        {/* HODNOTA JE ODKAZ NA VÝSLEDOK, nie samostatné tlačidlo vedľa nej.
            „Metal" a „The Defender" nie sú údaje ako výška v kohútiku — sú to
            závery dvadsiatich dvoch otázok a za každým stojí celá strana textu.
            Odkaz preto visí priamo na nich: jeden klik, žiadny nový prvok v mriežke.
            `from=id` povie kvízu, že šípka späť patrí na TENTO doklad — posiela sa
            príznak, nie cesta, aby sa cez parameter nedalo poslať človeka inam. */}
        {step.resultHref && !readOnly ? (
          <Link
            to={`${step.resultHref}&dog=${dogId}&from=id`}
            className="pass-toresult"
            title={tx('pack.pass.openResult', 'Open the full result')}
          >
            {renderValue(step, value.value, tx, loc)}
          </Link>
        ) : renderValue(step, value.value, tx, loc)}
        {trend && (
          <span style={{ fontFamily: FONT_UI, fontSize: 10, color: T.growGreen, marginLeft: 6 }}>{trend}</span>
        )}
        {/* Dátum aktualizácie — bez neho je údaj len tvrdenie (§2/6). */}
        <span
          style={{
            fontFamily: FONT_UI, fontSize: 10, fontVariantNumeric: 'tabular-nums',
            color: 'var(--pass-faint)', marginLeft: 7, whiteSpace: 'nowrap',
          }}
        >
          {shortDate(value.recordedAt, loc)}
        </span>
        {/* K4: poslednú zmenu poľa urobil pawmate */}
        {(value.actedBy || value.actedName) && <> <ActedBy id={value.actedBy} name={value.actedName} /></>}
      </dd>
    </>
  );
}

// ── formátovanie hodnôt ──────────────────────────────────────────────────────
function renderValue(step: QuizStep, v: unknown, tx: (k: string, f: string) => string, loc: string) {
  // Jeden popisok pre kvíz aj doklad — `quizValueLabel` v dogQuiz.ts (vlastné labely poľa,
  // jeho priečinok `labelNs`, zdieľané `opt.*`/`dogTag.*`, až potom EN).
  const label = (val: string) => quizValueLabel(step, val, tx);

  if (Array.isArray(v)) {
    return (
      <span className="inline-flex flex-wrap gap-1.5">
        {v.map((x) => (
          // Chip hodnoty = tá istá pilulka ako v profile (`.pk-pill`); komponent dodá
          // len veľkosť písma a rozostupy, výplň a rám nesie matrica.
          <span
            key={String(x)}
            className="pk-pill pass-chip"
            style={{
              fontFamily: FONT_UI, fontSize: 12, padding: '4px 12px',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <NatureArt field={step.field} value={x} size={20} />
            {label(String(x))}
          </span>
        ))}
      </span>
    );
  }

  const s = String(v);
  if (step.kind === 'date') return longDate(s, loc);
  if (step.kind === 'number') return step.unit ? `${s} ${step.unit}` : s;
  if (step.kind === 'single') {
    const art = natureArt(step.field, s);
    if (!art) return label(s);
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <NatureArt field={step.field} value={s} size={26} />
        {label(s)}
      </span>
    );
  }
  return s;
}

/**
 * Odznak úlohy / elementu na doklade DOG ID.
 *
 * MALÝ ZÁMERNE. Doklad je hustý dvojstĺpcový výpis `dt/dd` — veľký odznak by z riadku
 * spravil kartu a rozhodil sadzbu oboch stĺpcov. Odznak v plnej veľkosti žije na
 * výsledku kvízu (`PackNatureQuiz.tsx`, `ResultDoc`); tu je to značka pri hodnote.
 *
 * ⚠️ Psí blok na `/pack/dogs` odznak NEDOSTÁVA — je LOCKED (12. 8., „1 blok, PC aj
 * mobil ok") a jeho výška sa počíta rovnicou, ktorú by vyšší riadok pilulek rozhodil.
 * Matej to potvrdil 20. 8.: odznaky idú do výsledku kvízu a sem, blok ostáva.
 *
 * Prázdny výsledok `natureArt()` = žiadny obrázok, nie zástupný štvorec. Pole môže
 * niesť starý kľúč a chýbajúci odznak nesmie hodnotu zatlačiť ani posunúť.
 */
function NatureArt({ field, value, size }: { field: string; value: unknown; size: number }) {
  const src = natureArt(field, value);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block', flex: '0 0 auto' }}
    />
  );
}

function shortDate(iso: string, loc: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' });
}

function longDate(iso: string, loc: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' });
}

function monthsBetween(a: string, b: string): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0;
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24 * 30.44));
}


// ── POZNÁMKA KU KATEGÓRII ────────────────────────────────────────────────────
// Zapisuje sa do toho istého append-only logu ako údaje (`<kategória>.note`), takže
// história ostáva a `onDogEventsChange` prekreslí kartu hneď po uložení.
//
// ⚠️ Vedomá odchýlka od pravidla „na karte sa needituje NIČ" (hlavička súboru).
// To pravidlo chráni ÚDAJE — tie majú jeden vstup (kvíz), aby sa pri viacerých psoch
// nerozsypali. Poznámka je iná vec: je to jedna veta o TOMTO psovi, píše sa raz a číta
// sa presne tam, kde stojí. Cez kvíz by pribudlo 9 otázok navyše do sekcií.
function GroupNote({
  dogId, groupKey, value, tx,
}: {
  dogId: string; groupKey: string; value: string; tx: (k: string, f: string) => string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) areaRef.current?.focus(); }, [editing]);

  const save = async () => {
    const next = draft.trim();
    if (next === value.trim()) { setEditing(false); return; }
    setSaving(true);
    try {
      await appendDogEvents([{ dogId, field: `${groupKey}.note`, value: next || null, source: 'profile' }]);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="pass-note">
        <textarea
          ref={areaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 240))}
          rows={3}
          placeholder={tx('pack.pass.notePlaceholder', 'In your own words — what should anyone reading this know?')}
          // Textové pole = `.pf-field--flat`, ten istý povrch ako bio v profile
          // (plochý papyrus #FBF5E6, radius 8). Vlastný rám a výplň tu nemajú čo robiť.
          className="pf-field pf-field--flat"
          style={{
            width: '100%', borderRadius: 8, padding: '8px 12px', fontFamily: FONT_UI,
            fontSize: 14, lineHeight: 1.5, color: T.inkStrong, resize: 'none', outline: 'none',
          }}
        />
        <div className="flex items-center justify-end gap-3" style={{ marginTop: 7 }}>
          <button type="button" className="pass-noteadd" onClick={() => { setDraft(value); setEditing(false); }}>
            {tx('pack.pass.noteCancel', 'cancel')}
          </button>
          <button type="button" className="pk-pill pk-pill--tap pass-share" onClick={save} disabled={saving}>
            {saving ? tx('pack.pass.noteSaving', 'saving…') : tx('pack.pass.noteSave', 'save')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pass-note">
      {value ? (
        /* Poznámka je ÚDAJ o psovi — píše sa do `dog_events` rovnako ako váha,
           takže ju drží to isté právo, nie vlastné. */
        <RightGate right="dogid.edit" dogId={dogId}>
        <p className="pass-notetext" onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
          „{value}"
        </p>
        </RightGate>
      ) : (
        <RightGate right="dogid.edit" dogId={dogId}>
        <button type="button" className="pass-noteadd" onClick={() => setEditing(true)}>
          ✎ {tx('pack.pass.noteAdd', 'add a note in your own words')}
        </button>
        </RightGate>
      )}
    </div>
  );
}
