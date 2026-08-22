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
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PACK_THEME, PACK_BOX, PILL_CSS, PF_FIELD_CSS, FONT_TITLE, FONT_UI } from './packTheme';
import { PASS_GROUPS, STEP_BY_FIELD, PROGRESS_STEPS, type QuizStep } from './dogQuiz';
import { natureArt, storedSpecials } from './natureQuiz';
import { readLatest, onDogEventsChange, hasValue, readSeries, appendDogEvents, type LatestValue } from '@/lib/dogEvents';
import { useT } from '@/i18n/LanguageContext';

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
  font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.14em;
  text-transform:uppercase; padding:9px 15px; }
.pass-share:disabled{ opacity:.5; cursor:default; }
.pass-edit{ font-family:'Space Grotesk',sans-serif; font-size:10px; letter-spacing:.1em;
  text-transform:uppercase; padding:4px 11px; text-decoration:none; }
/* KATEGÓRIE = SAMOSTATNÉ BLOKY (Matej 12.8.: „kategorie treba vizualne zoradit do
   blokov … vacsie nadpisy kategorii a viac strukturovane"). Blok = ÚROVEŇ 2 matrice
   (PODBLOK) — je to sekcia vnútri karty DOG ID, presne ako ZÁKLAD a ŽIVOTNÝ ŠTÝL
   v profile. Rovnaká hranica 720/721 px ako zvyšok karty psa. */
.pass-groups{ columns:2; column-gap:14px; }
@media (max-width:720px){ .pass-groups{ columns:1; } }
.pass-block{ break-inside:avoid; -webkit-column-break-inside:avoid; margin:0 0 14px;
  background:${B.background}; border:${B.border}; border-radius:${B.borderRadius}px;
  padding:16px 17px 15px; box-shadow:${B.boxShadow};
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
  --pass-lbl:${T.onDarkDim}; --pass-val:${T.onDark}; --pass-faint:rgba(245,240,228,0.34); }
.pass-block--dark .pass-btitle{ color:rgba(245,240,228,0.92); }
.pass-block--dark .pass-brule{ opacity:.55; }
/* Červená chýbajúceho poľa musí na čiernej zosvetliť — #B25640 na #050505 je pod
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
  font-size:16.5px; letter-spacing:.12em; text-transform:uppercase; color:#2a1608; margin:0; }
.pass-bnum{ font-family:'JetBrains Mono',ui-monospace,monospace; font-size:10px; font-weight:700;
  color:#C99A3F; opacity:.75; }
/* deliaca čiara vnútri bloku = predpísaný token T.rule, nie vlastný gradient.
   POZOR: tento blok je JS template literal — spätný apostrof v komentári zhodí build. */
.pass-brule{ height:2px; margin:10px 0 12px; background:${T.rule}; opacity:.75; }
/* NEVYPLNENÉ POLE. Červená je token T.alertRed, nie ľubovoľná červená. Veľkosť 15px
   a váha 600 sú tu preto, že jeden znak v riadku s 11.5px popiskom inak zanikne —
   pomlčka má byť vidieť cez celý blok. Váha 600 je STROP: Space Grotesk je načítaný
   300–600, pri 700 by prehliadač dosyntetizoval fake bold. */
.pass-missing{ font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:600;
  letter-spacing:.06em; color:${T.alertRed}; text-decoration:none; }
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
  letter-spacing:.26em; text-transform:uppercase; color:${T.cardEdge}; }
.pass-fillnum{ font-family:'JetBrains Mono',ui-monospace,monospace; font-size:11px;
  color:${T.inkWarm}; white-space:nowrap; }
.pass-fillbar{ height:6px; border-radius:999px; background:${T.tileBg};
  border:1px solid ${T.border}; overflow:hidden; }
.pass-fillbar__on{ height:100%; border-radius:999px;
  background:linear-gradient(90deg,#F5C73D 0%,#E69E1A 100%); transition:width .4s ease; }
/* riadok, ktorý sa needituje (plemeno, narodenie, pohlavie) */
.pass-fixed{ font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:500;
  color:${T.inkStrong}; }
.pass-fixed--empty{ font-size:15px; font-weight:600; letter-spacing:.06em; color:${T.inkFaint}; }
/* poznámka vlastnými slovami — to, čo z údajov robí psa */
.pass-note{ margin-top:12px; padding-top:11px; border-top:1px dashed ${T.hairline}; }
.pass-notetext{ font-family:'Space Grotesk',sans-serif; font-size:12.5px; line-height:1.55;
  color:#7a5a2a; font-style:italic; white-space:pre-wrap; margin:0; }
.pass-noteadd{ font-family:'Space Grotesk',sans-serif; font-size:10.5px; letter-spacing:.1em;
  text-transform:uppercase; color:rgba(31,26,14,.42); background:transparent; border:0; padding:0;
  cursor:pointer; }
.pass-noteadd:hover{ color:#2a1608; }
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
export function DogPassport({
  dogId, bare = false, fixedRows, onEditPanel,
}: {
  dogId: string;
  bare?: boolean;
  /** Read-only riadky navrch skupiny — kľúč je `PassGroup.key`. */
  fixedRows?: Record<string, FixedRow[]>;
  /** Skupina s `editPanel` neodkazuje do kvízu, ale volá toto. */
  onEditPanel?: (panel: string) => void;
}) {
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };

  const [latest, setLatest] = useState<Record<string, LatestValue> | null>(null);
  const [weightTrend, setWeightTrend] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => { readLatest(dogId).then((r) => { if (alive) setLatest(r); }); };
    load();
    const off = onDogEventsChange(load);
    return () => { alive = false; off(); };
  }, [dogId]);

  // Trend váhy — jediné pole, kde má priebeh na karte reálnu výpovednú hodnotu.
  // Práve preto je log append-only: z prepísaného stĺpca by sa toto nedalo spočítať.
  useEffect(() => {
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
    return PASS_GROUPS.map((g) => {
      // Bez filtra podľa pohľadu — majiteľ vidí komplet. Filtruje sa až pri zdieľaní.
      const rows = g.fields
        .map((f) => ({ step: STEP_BY_FIELD[f], value: capSpecials(f, latest[f], latest) }))
        .filter((r) => !!r.step);
      return { group: g, rows };
    }).filter((g) => g.rows.length > 0);
  }, [latest]);

  // KOMPLETNOSŤ NA SAMOTNOM DOKLADE. Percento žilo len na dlaždici v `/pack/dogs` —
  // teda nie tam, kde človek vypĺňa. Odkedy je nevyplnené červené, doklad JE checklist
  // a potrebuje jedno číslo, ktoré povie, ako ďaleko si.
  // Ráta sa z `PROGRESS_STEPS` (bez `noProgress` a `optional`) — TEN ISTÝ zdroj ako
  // dlaždica na hube, aby dve miesta nemohli ukázať dve rôzne čísla.
  const fill = useMemo(() => {
    if (!latest) return null;
    const total = PROGRESS_STEPS.length;
    const done = PROGRESS_STEPS.filter((s) => hasValue(latest[s.field])).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [latest]);

  if (!latest) return null;

  return (
    <section
      style={bare
        ? { color: T.ink }
        : {
          background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
          boxShadow: T.cardShadow, padding: '22px 20px', color: T.ink,
        }}
    >
      {/* Poradie je záväzné: matrica (PILL_CSS, PF_FIELD_CSS) najprv, lokálna
          typografia až za ňou — pri rovnakej špecificite rozhoduje poradie pravidiel. */}
      <style>{PILL_CSS}</style>
      <style>{PF_FIELD_CSS}</style>
      <style>{PASS_CSS}</style>

      <ShareRow tx={tx} position="top" onWill={onEditPanel ? () => onEditPanel('will') : undefined} />

      {/* Hláška „zatiaľ nič vyplnené" zanikla 13.8.2026 — doklad má odteraz všetky
          položky od prvej sekundy, takže prázdno nie je stav, ktorý by sa dal opísať
          vetou. Nevyplnené sa ukáže samo, červenou. Namiesto nej stojí percento. */}
      {fill && (
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

      <div className="pass-groups">
      {groups.map(({ group, rows }, i) => {
        // ČIERNY JE PRÁVE JEDEN BLOK — závet. Podmienka je na `key`, nie na `editPanel`:
        // panel je technická vlastnosť (edituje sa inde než kvízom) a keby ho zajtra dostala
        // ďalšia sekcia, sčernela by bez rozhodnutia. Čierna je tu za VÝZNAM, nie za mechaniku.
        const dark = group.key === 'will';
        return (
        <div key={group.key} className={`pass-block${dark ? ' pass-block--dark' : ''}`}>
          <div className="pass-bhead">
            <h5 className="pass-btitle">
              <span className="pass-bnum">{String(i + 1).padStart(2, '0')}</span>
              {tx(group.i18n, group.labelEN)}
            </h5>
            {/* ✎ — jediná cesta k editácii ÚDAJOV. Predfiltrované na TOHTO psa.
                `editHref` = sekcia má vlastný povrch (osobnostný kvíz), kde deep-link
                na jedno pole nedáva zmysel: je to jeden priebeh so scoringom.
                `editPanel` = needituje sa inde, ale priamo tu (závet). */}
            {group.editPanel ? (
              <button
                type="button"
                className={`pk-pill pk-pill--tap pass-edit${dark ? ' pk-pill--dark' : ''}`}
                onClick={() => onEditPanel?.(group.editPanel!)}
              >
                ✎ {tx('pack.pass.edit', 'edit')}
              </button>
            ) : (
              <Link
                className="pk-pill pk-pill--tap pass-edit"
                to={group.editHref
                  ? `${group.editHref}?dog=${dogId}`
                  : `/pack/dogs/quiz/${group.editSection}?dog=${dogId}&field=${group.fields[0]}`}
              >
                ✎ {tx('pack.pass.edit', 'edit')}
              </Link>
            )}
          </div>

          <div className="pass-brule" />

          <dl
            style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px',
              alignItems: 'baseline', margin: 0,
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
                editTo={step.editHref
                  ? `${step.editHref}?dog=${dogId}`
                  : `/pack/dogs/quiz/${group.editSection}?dog=${dogId}&field=${step.field}`}
                onEditPanel={group.editPanel ? () => onEditPanel?.(group.editPanel!) : undefined}
                tx={tx}
              />
            ))}
          </dl>

          {/* POZNÁMKA VLASTNÝMI SLOVAMI — jediné pole, ktoré sa edituje priamo tu.
              Údaje ostávajú read-only (patria kvízu), ale veta o psovi patrí tam, kde
              sa číta: „Bojí sa búrky, vtedy chce byť v kúpeľni." Toto je to, čo z
              tabuľky robí psa — a čo veterinár ani opatrovateľ z hodnôt nevyčíta. */}
          <GroupNote
            dogId={dogId}
            groupKey={group.key}
            value={typeof latest[`${group.key}.note`]?.value === 'string' ? String(latest[`${group.key}.note`]!.value) : ''}
            tx={tx}
          />
        </div>
        );
      })}
      </div>

      {/* Druhý rovnaký rad dole — pri dlhom dokumente je scroll späť hore réžia navyše.
          Nie je to duplicita obsahu, je to ten istý ovládač na oboch koncoch. */}
      <ShareRow tx={tx} position="bottom" onWill={onEditPanel ? () => onEditPanel('will') : undefined} />
    </section>
  );
}

// ── ZDIEĽANIE ────────────────────────────────────────────────────────────────
// Hore aj dole. Voľba príjemcu = voľba POHĽADU, a ten sa zapečie do odkazu (§2/8 zadania):
// odkaz sa nedá dodatočne prepnúť, chceš iný — vyrobíš nový. Bezpečnostná vlastnosť.
//
// Share sheet sa ešte nestavia (krok 6 poradia), preto sú tlačidlá zatiaľ mŕtve a označené
// „čoskoro" — radšej viditeľný zámer než tlačidlo, ktoré nič neurobí a tvári sa funkčne.
function ShareRow({
  tx, position, onWill,
}: {
  tx: (k: string, f: string) => string; position: 'top' | 'bottom'; onWill?: () => void;
}) {
  // ZÁVET UŽ NIE JE MŔTVE TLAČIDLO (13.8.2026). Ostatné tri ciele stále čakajú na share
  // sheet, ale závet má odteraz vlastný panel priamo na doklade — takže jediné tlačidlo
  // v tomto rade, ktoré niečo robí, je ono.
  const targets = [
    { key: 'vet', labelEN: 'Vet', i18n: 'pack.pass.share.vet', emoji: '🩺' },
    { key: 'sitter', labelEN: 'Sitter', i18n: 'pack.pass.share.sitter', emoji: '🏠' },
    { key: 'story', labelEN: 'Friend', i18n: 'pack.pass.share.friend', emoji: '✨' },
    { key: 'will', labelEN: 'Will', i18n: 'pack.pass.share.will', emoji: '🕊' },
  ];
  return (
    <div style={position === 'top' ? { marginBottom: 6 } : { marginTop: 22 }}>
      <div
        className="text-center"
        style={{
          fontFamily: FONT_UI, fontWeight: 500, fontSize: 10, letterSpacing: '0.26em',
          textTransform: 'uppercase', color: T.accentGold, marginBottom: 9,
        }}
      >
        {tx('pack.pass.shareTitle', 'Share this card')}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {targets.map((x) => {
          const live = x.key === 'will' && !!onWill;
          return (
            <button
              key={x.key}
              type="button"
              className={`pk-pill pass-share${live ? ' pk-pill--tap' : ''}`}
              disabled={!live}
              onClick={live ? onWill : undefined}
            >
              <span aria-hidden>{x.emoji}</span>
              {tx(x.i18n, x.labelEN)}
            </button>
          );
        })}
      </div>
      {position === 'top' && (
        <p
          className="text-center"
          style={{ fontFamily: FONT_UI, fontSize: 11, color: T.inkFaint, margin: '9px 0 14px' }}
        >
          {tx('pack.pass.shareNote', 'Each recipient sees only what they need — you pick when you create the link.')}
        </p>
      )}
    </div>
  );
}

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
function capSpecials(
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
      <dt style={{ fontFamily: FONT_UI, fontSize: 11.5, color: 'var(--pass-lbl)', whiteSpace: 'nowrap' }}>
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
  step, value, trend, editTo, onEditPanel, tx,
}: {
  step: QuizStep; value: LatestValue | undefined; trend: string | null; editTo: string;
  onEditPanel?: () => void;
  tx: (k: string, f: string) => string;
}) {
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
    return (
      <>
        <dt style={{ fontFamily: FONT_UI, fontSize: 11.5, color: 'var(--pass-lbl)', whiteSpace: 'nowrap' }}>
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
      <dt style={{ fontFamily: FONT_UI, fontSize: 11.5, color: 'var(--pass-lbl)', whiteSpace: 'nowrap' }}>
        {tx(step.rowI18n, step.rowEN)}
      </dt>
      <dd style={{ margin: 0, fontFamily: FONT_UI, fontSize: 13, color: 'var(--pass-val)', fontWeight: 500 }}>
        {renderValue(step, value.value, tx)}
        {trend && (
          <span style={{ fontFamily: FONT_UI, fontSize: 10.5, color: T.growGreen, marginLeft: 6 }}>{trend}</span>
        )}
        {/* Dátum aktualizácie — bez neho je údaj len tvrdenie (§2/6). */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 9.5,
            color: 'var(--pass-faint)', marginLeft: 7, whiteSpace: 'nowrap',
          }}
        >
          {shortDate(value.recordedAt)}
        </span>
      </dd>
    </>
  );
}

// ── formátovanie hodnôt ──────────────────────────────────────────────────────
function renderValue(step: QuizStep, v: unknown, tx: (k: string, f: string) => string) {
  const label = (val: string) => {
    // Vlastné labely poľa majú PREDNOSŤ pred zdieľanými priestormi. Bez toho by
    // `nature.specials: ['loner']` spadlo na `pack.dogTag.loner` = „Samotár",
    // čo je TAG POVAHY, nie zvláštna úloha „The Loner" — presne tá kolízia,
    // kvôli ktorej sa zvláštna úloha nikdy neukazuje ako holý chip.
    const own = step.valueLabels?.[val];
    if (own) return tx(own.i18n, own.labelEN);
    // Rovnaký kľúčový priestor ako `DogCardFields.tsx` — preklady možností už existujú.
    const fromOpt = tx(`pack.dogCard.opt.${val}`, '');
    if (fromOpt) return fromOpt;
    const fromTag = tx(`pack.dogTag.${val}`, '');
    if (fromTag) return fromTag;
    const known = step.options?.find((o) => o.value === val);
    return known ? known.labelEN : humanize(val);
  };

  if (Array.isArray(v)) {
    return (
      <span className="inline-flex flex-wrap gap-1.5">
        {v.map((x) => (
          // Chip hodnoty = tá istá pilulka ako v profile (`.pk-pill`); komponent dodá
          // len veľkosť písma a rozostupy, výplň a rám nesie matrica.
          <span
            key={String(x)}
            className="pk-pill"
            style={{
              fontFamily: FONT_UI, fontSize: 11, padding: '3px 10px',
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
  if (step.kind === 'date') return longDate(s);
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

function shortDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' });
}

function longDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function monthsBetween(a: string, b: string): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0;
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24 * 30.44));
}

function humanize(v: string): string {
  const s = v.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
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
            width: '100%', borderRadius: 8, padding: '9px 10px', fontFamily: FONT_UI,
            fontSize: 12.5, lineHeight: 1.5, color: T.inkStrong, resize: 'none', outline: 'none',
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
        <p className="pass-notetext" onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
          „{value}"
        </p>
      ) : (
        <button type="button" className="pass-noteadd" onClick={() => setEditing(true)}>
          ✎ {tx('pack.pass.noteAdd', 'add a note in your own words')}
        </button>
      )}
    </div>
  );
}
