// ADD — vstupný popup (vlna 1 reštruktúra, plany/zadanie-eventy-2026-08-06.md §2).
// Dve úrovne: 1) TRIP / EVENT (Matejov feedback 2026-08-06: SERVICE dlaždica bola disabled a pri
// troch dlaždiciach jej flex-wrap dal celú šírku popupu — vizuálne najväčší prvok bol mŕtvy. Von
// z renderu, i18n kľúče `pack.addTrip.entry.kind.service.*` a `Kind`/`KINDS` tvar OSTÁVAJÚ —
// SERVICE sa vráti vo vlne 2, len sa nevykresľuje). 2) pre TRIP „WE'VE BEEN THERE" (log) vs
// „WE'RE HEADING OUT" (plán); pre EVENT „OUR OWN EVENT" vs „FROM A LINK" — rovnaký vzor druhej
// úrovne, obe rovnako veľké a klikateľné, s tlačidlom späť.
// Žije na tmavom povrchu Portalu → pk-glass primitív z packTheme.ts (NIE papyrus — ten je pre
// bledé bloky podľa Entry.tsx locku, sem nepatrí).
import { useEffect, useState } from 'react';
import { GLASS_CSS, PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { PLATE_TILE_R } from '@/components/pack/navGoldSkin';
import { useT } from '@/i18n/LanguageContext';
import { NotePalette, NOTE_PALETTE_CSS } from '@/components/pack/mapnotes/NotePalette';
import { NOTE_GROUPS, type NoteGroup } from '@/components/pack/mapnotes/mapNotesData';
import { GROUP_EMOJI, EVENT_EMOJI, FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';
import { TRIP_CATEGORIES } from '@/components/pack/tripCategories';
import { EVENT_KINDS, EVENT_KIND_LABEL_KEYS, type EventKind } from '@/components/pack/events/eventModel';
import type { TripState } from './addTripModel';
import { POINTS } from '@/lib/tripPoints';

const GOLD = '#C99A3F'; // §8: hover na aktívnej dlaždici = zlatý okraj, presne tento hex

// §2: kontrakt komponentu rozšírený nad rámec TRIP-only. `kind: 'event'` teraz emituje reálnu
// voľbu (druhá úroveň EVENT_BLOCKS) — volajúci (PackMap.tsx) ju napája na `AddEvent` formulár
// (components/pack/events/AddEvent.tsx, krok 3 zadania).
export type AddChoice =
  | { kind: 'trip'; state: TripState }
  | { kind: 'event'; origin: 'own' | 'tip' }
  // ODKAZ (2026-08-20) — tretia dlaždica. Nevracia hotový zápis, ale ZVOLENÚ SKUPINU:
  // po nej sa popup zavrie a človek ukazuje miesto na odkrytej mape. Poradie
  // „najprv čo, potom kde" je zámer — človek prichádza s úmyslom, nie s bodom.
  | { kind: 'note'; group: NoteGroup };

export type AddTripEntryProps = {
  onPick: (choice: AddChoice) => void;
  onClose: () => void;
};

type Kind = 'trip' | 'event' | 'note' | 'service';

// ── CHIPY: ČO SA POD DLAŽDICOU SKRÝVA (Matej 2026-08-27) ────────────────────────────────────
// „mohli by sme pridať chipy s emoji čo všetko človek môže pridať… aby bolo hneď jasné, čo
// človek môže pridať."
// Popup bol dovtedy tri vety v štýle „miesto na prechádzku so psom" — pravdivé, ale človek sa
// dozvedel až o obrazovku ďalej, že sa sem dá zapísať aj kemp, preteky či kliešte.
//
// ⚠️ ŽIADNY VLASTNÝ ZOZNAM. Každá trojica sa ťahá zo zdroja pravdy tej vetvy — inak by tu
// o mesiac stála taxonómia, ktorá už nikde inde neplatí (presne to sa stalo aktivitám, keď
// ležali v kóde štyrikrát). Kategórie: `tripCategories.ts` · typy podujatí: `eventModel.ts`
// + `markEmoji.ts` · skupiny odkazov: `mapNotesData.ts` + `GROUP_EMOJI`.
//
// ⚠️ Chip je POPIS, nie ovládací prvok. Celá dlaždica je jedno tlačidlo, chipy v nej sú
// `<span>` — klikateľné chipy vnútri tlačidla by sľubovali skratku („chcem rovno preteky"),
// ktorú druhá úroveň nevie splniť, a vnorené tlačidlo je aj neplatné HTML.
type Chip = { emoji: string; labelKey: string };

/** Typy podujatí, ktoré sa v ukážke NEZOBRAZUJÚ (vo formulári ostávajú). Viď `event` nižšie. */
const EVENT_CHIP_SKIP: EventKind[] = ['camp', 'expo'];

const KIND_CHIPS: Record<'trip' | 'event' | 'note', Chip[]> = {
  trip: TRIP_CATEGORIES.map((c) => ({ emoji: c.emoji, labelKey: `pack.map.activityLabel.${c.id}` })),
  // ⚠️ NIE VŠETKÝCH OSEM (Matej 2026-08-27: „pri eventoch dajme len 2 riadky bez camp a expo").
  // Chip je ukážka, nie číselník — tri riadky robili z dlaždice zoznam a EVENT tým prerástol
  // susedný odkaz o pol dlaždice. `camp` a `expo` z formulára NEMIZNÚ, len sa sem nevojdú:
  // sú to dva najzriedkavejšie typy, ktoré človek hľadá až vtedy, keď už vie, čo zapisuje.
  event: EVENT_KINDS.filter((k) => !EVENT_CHIP_SKIP.includes(k))
    .map((k) => ({ emoji: EVENT_EMOJI[k], labelKey: EVENT_KIND_LABEL_KEYS[k] })),
  // Skupiny, nie podtypy: „kliešte / vretenica / medveď" je rozpad JEDNEJ skupiny a v popupe
  // by z troch chipov spravil trinásť. Rozcestníkové ⚠️ hovorí to isté jedným znakom.
  note: NOTE_GROUPS.map((g) => ({ emoji: GROUP_EMOJI[g], labelKey: `pack.mapNotes.group.${g}` })),
};

// Prvá úroveň — dve dlaždice (Matej 2026-08-06: SERVICE preč z renderu, viď hlavičkový
// komentár). `Kind`/`disabled` tvar ostáva nezmenený pre vlnu 2 — SERVICE sa vtedy len pridá
// späť do tohto poľa, nič iné sa v komponente meniť nemusí.
const KINDS: Array<{ kind: Kind; emoji: string; titleKey: string; textKey: string; disabled?: boolean; points?: number }> = [
  // ⚠️ BODY PATRIA SEM, NIE NA TLAČIDLO PRIDAŤ (Matej 2026-08-23: „má pridanie konkrétnu taxu?").
  // Tlačidlo otvára tri rôzne veci a každá je inak drahá — číslo na ňom by teda klamalo pri
  // dvoch z troch. Hodnoty sú z `lib/tripPoints.ts`; pri výlete je to ZÁKLAD, reálny výlet
  // býva vyšší (km, prevýšenie, nové pohorie).
  // 24. 8. 2026 dostali číslo aj zvyšné dve dlaždice (Matej: „pridanie odkazu je vždy bodované,
  // buď samostatne alebo v rámci pridania výletu"). Dlaždica ukazuje cenu ZA KUS — stropy
  // (9 v rámci výletu, 5 samostatných za deň) sa na ňu nepíšu, lebo v okamihu voľby ešte
  // nikto nevie, koľko značiek človek zapíše. Povie sa to až vtedy, keď na strop naozaj narazí.
  // 🥾 → 🐾 (matrica 24. 8. 2026): topánka je AKTIVITA „Hiking" o obrazovku ďalej. Dlaždica
  // VÝLET zastrešuje aj korčule, paddleboard a hrad — labka je jediné, čo platí na všetky.
  { kind: 'trip', emoji: '🐾', titleKey: 'pack.addTrip.entry.kind.trip.title', textKey: 'pack.addTrip.entry.kind.trip.text', points: POINTS.add },
  { kind: 'event', emoji: '📣', titleKey: 'pack.addTrip.entry.kind.event.title', textKey: 'pack.addTrip.entry.kind.event.text', points: POINTS.event },
  { kind: 'note', emoji: '💬', titleKey: 'pack.addTrip.entry.kind.note.title', textKey: 'pack.addTrip.entry.kind.note.text', points: POINTS.note },
];

// Druhá úroveň pre TRIP — texty prevzaté 1:1 z pôvodných BLOCKS (needituje sa, len sa
// presúva sem, §2.2).
// ⚠️ NERENDERUJE SA od 22. 8. 2026 (rez C) — ostáva ako doklad, čo tu stálo, a ako
// zdroj i18n kľúčov, ktoré sa ešte používajú inde. Voľbu nahradil dátum vo formulári.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TRIP_BLOCKS: Array<{ state: TripState; emoji: string; titleKey: string; textKey: string }> = [
  { state: 'planned', emoji: '🗓️', titleKey: 'pack.addTrip.entry.planned.title', textKey: 'pack.addTrip.entry.planned.text' },
  { state: 'walked', emoji: '✅', titleKey: 'pack.addTrip.entry.walked.title', textKey: 'pack.addTrip.entry.walked.text' },
];

// Druhá úroveň pre EVENT (§2.2 + Matejov feedback 2026-08-06) — rovnaký vzor ako TRIP_BLOCKS.
const EVENT_BLOCKS: Array<{ origin: 'own' | 'tip'; emoji: string; titleKey: string; textKey: string }> = [
  { origin: 'own', emoji: '📝', titleKey: 'pack.addTrip.entry.event.own.title', textKey: 'pack.addTrip.entry.event.own.text' },
  { origin: 'tip', emoji: '🔗', titleKey: 'pack.addTrip.entry.event.tip.title', textKey: 'pack.addTrip.entry.event.tip.text' },
];

export function AddTripEntry({ onPick, onClose }: AddTripEntryProps) {
  const t = useT();
  const [step, setStep] = useState<'kind' | 'trip' | 'event' | 'note'>('kind');

  // Bez krížika je Escape jediná cesta von pre toho, kto neťuká myšou vedľa panela.
  // Poslucháč visí na dokumente, nie na paneli — ten nemá fókus, kým človek na niečo neklikne.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="att-entry-backdrop"
      onClick={onClose}
      role="button"
      tabIndex={-1}
      aria-label={t('pack.addTrip.entry.closeAriaLabel')}
    >
      <style>{GLASS_CSS}</style>
      <style>{ENTRY_CSS}</style>
      <div className="att-entry-panel pk-glass" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* ⚠️ KRÍŽIK ZANIKOL (Matej 2026-08-26: „odstráň krížik… stačí len klik vedľa").
            Zatvára sa klikom na podklad (`att-entry-backdrop` vyššie) a klávesou Escape —
            popup nemá žiadny nevratný účinok, takže východ nepotrebuje vlastný ovládací
            prvok. Padol tým aj celý spor z 5. 8. o tom, ako ďaleko má krížik stáť od rámu.
            Kľúč `pack.addTrip.entry.closeAriaLabel` ostáva — nesie ho podklad. */}
        {step !== 'kind' && (
          <button type="button" className="att-entry-back" onClick={() => setStep('kind')} aria-label={t('pack.addTrip.entry.backAriaLabel')}>
            ‹ {t('pack.addTrip.entry.backAriaLabel')}
          </button>
        )}
        {/* ── VÝCHOD Z CELOOBRAZOVKOVEJ PODOBY (Matej 2026-08-28) ────────────────────────
            „na mobile to dať bez toho bloku resp bez okrajov = celá stránka bude bledá ako
             keby menu na celú obrazovku a na nej 3 bloky, nebude vidno mapu vzadu"
            ⚠️ Celá obrazovka ZRUŠILA jedinú cestu von. Popup sa dovtedy zatváral klikom na
            podklad (lock z 26. 8.: „odstráň krížik… stačí len klik vedľa") — lenže keď panel
            zaberie celé okno, žiadne „vedľa" neostane a na telefóne nie je ani Escape.
            NIE JE TO NÁVRAT KRÍŽIKA: lock hovorí o BLOKU plávajúcom nad stránkou, toto je
            celoobrazovková obrazovka toku, a tie majú v pridávaní návrat vľavo hore od
            začiatku (.atl-log-back). Šípka je teda zhoda so susedom, nie výnimka.
            Vykresľuje sa vždy, ale VIDITEĽNÁ je len tam, kde je popup na celú obrazovku —
            rozhoduje CSS v PALE_ADD_CSS (PackMap.tsx), nie meranie šírky v JS. */}
        {step === 'kind' && (
          <button type="button" className="att-entry-x" onClick={onClose} aria-label={t('pack.addTrip.entry.closeAriaLabel')}>
            ←
          </button>
        )}
        {step === 'kind' && (
          <div className="att-entry-blocks att-entry-blocks-kind">
            {KINDS.map((k) => (
              <button
                key={k.kind}
                type="button"
                className={`att-entry-block${k.disabled ? ' att-entry-block-disabled' : ''}`}
                disabled={k.disabled}
                aria-disabled={k.disabled}
                onClick={() => {
                  if (k.disabled) return;
                  // ⏳ DRUHÁ ÚROVEŇ PRE VÝLET ZANIKLA (Matej 22. 8.). Bola to otázka
                  // „prešli ste to, alebo sa chystáte?", na ktorú odpoveď leží o pár polí
                  // nižšie — v dátume. Formulár je jeden a prepne sa podľa neho.
                  // `TRIP_BLOCKS` ostáva v súbore ako doklad, čo tu stálo; nerenderuje sa.
                  if (k.kind === 'trip') onPick({ kind: 'trip', state: 'walked' });
                  if (k.kind === 'event') setStep('event');
                  if (k.kind === 'note') setStep('note');
                }}
              >
                {k.disabled && <span className="att-entry-soon">{t('pack.map.comingSoon')}</span>}
                {/* JEDNOTKA MUSÍ BYŤ PRI ČÍSLE (Matej 24. 8. 2026: „pri kliknutí na pridať je tam
                    +20… chýba BODOV"). Holé „+20" nepovie, či ide o body, kilometre alebo eurá —
                    a dlaždica je prvé miesto, kde človek vidí, že sa zápis vôbec odmeňuje.
                    ⚠️ SKLOŇUJE SA. Pevná jednotka („bodov") dala na odkaze „+3 BODOV" — slovenčina
                    má tri tvary a dlaždice nesú 20 / 10 / 3, teda dva z nich naraz. Rovnaký
                    trojtvarový vzor drží aj `pack.addTrip.geo.pointsSuffix` pre kotvy trasy;
                    zámerne sa NEPOŽIČIAVA — tam sú to body na mape, tu odmena, a v angličtine
                    sa tie dve slová raz rozídu. */}
                {!!k.points && (
                  <span className="att-entry-pts">
                    +{t(`pack.points.unit.${k.points === 1 ? 'one' : k.points < 5 ? 'few' : 'many'}`, { n: k.points })}
                  </span>
                )}
                <span className="att-entry-emoji" aria-hidden="true">{k.emoji}</span>
                <span className="att-entry-title">{t(k.titleKey)}</span>
                <span className="att-entry-text">{t(k.textKey)}</span>
                {!!KIND_CHIPS[k.kind as keyof typeof KIND_CHIPS] && (
                  // ── NEKONEČNÁ SLUČKA CHIPOV (Matej 2026-08-28: „chipy daj do infinity slučky") ──
                  // Rad sa posúva sám, takže človek uvidí VŠETKY možnosti bez toho, aby na chipy
                  // musel ťahať prstom — presne to bola sťažnosť („v prvej sekunde nevie… aké sú
                  // možnosti"). Ručný posuv (overflow-x + touch-action:pan-x) tým zanikol: na
                  // 390 px sa nevošli ani štyri chipy a zvyšok o sebe nedal vedieť.
                  //
                  // ⚠️ TRI KÓPIE, NIE DVE. Posuv je bezšvíkový vždy (perióda = šírka jednej sady,
                  // animácia posúva presne o ňu), ale DIERU na pravom okraji urobí každá sada,
                  // ktorá je užšia než blok — a to je práve ODKAZ s tromi chipmi (~330 px na 390 px
                  // širokej obrazovke). Tri kópie pokryjú aj ten prípad.
                  // ⚠️ Kópie sú `aria-hidden` — čítačka má prečítať zoznam raz, nie trikrát.
                  //
                  // ⚠️ TRVANIE JE PODĽA POČTU CHIPOV, nie pevné. Pevná hodnota by rad troch chipov
                  // hnala trikrát pomalšie než rad šiestich a tri bloky nad sebou by sa hýbali
                  // každý inou rýchlosťou. `--att-loop` = čas na PREJDENIE JEDNEJ sady.
                  //
                  // ⚠️ Slučka je LEN mobilná vetva (PALE_ADD_CSS v PackMap.tsx). Na PC sa chipy
                  // zalamujú do riadkov a všetky sú vidno naraz, takže obal aj sada tam majú
                  // `display:contents` a kópie `display:none` — v DOM sú, v layoute nie.
                  <span
                    className="att-entry-chips"
                    style={{ '--att-loop': `${(KIND_CHIPS[k.kind as keyof typeof KIND_CHIPS].length * 3.2).toFixed(1)}s` } as React.CSSProperties}
                  >
                    <span className="att-entry-chiploop">
                      {[0, 1, 2].map((copy) => (
                        <span
                          key={copy}
                          className={`att-entry-chipset${copy ? ' att-entry-chipset-copy' : ''}`}
                          aria-hidden={copy ? true : undefined}
                        >
                          {KIND_CHIPS[k.kind as keyof typeof KIND_CHIPS].map((c) => (
                            <span key={c.labelKey} className="att-entry-chip">
                              <span className="att-entry-chip-emoji" aria-hidden="true">{c.emoji}</span>
                              {t(c.labelKey)}
                            </span>
                          ))}
                        </span>
                      ))}
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        {/* `step === 'trip'` sa už nenastavuje — viď komentár pri kliku na dlaždicu VÝLET. */}
        {step === 'note' && (
          <div className="att-entry-note">
            <p className="att-entry-lead">{t('pack.mapNotes.palette.lead')}</p>
            <NotePalette onPick={(group) => onPick({ kind: 'note', group })} />
          </div>
        )}
        {step === 'event' && (
          <div className="att-entry-blocks">
            {EVENT_BLOCKS.map((b) => (
              <button key={b.origin} type="button" className="att-entry-block" onClick={() => onPick({ kind: 'event', origin: b.origin })}>
                <span className="att-entry-emoji" aria-hidden="true">{b.emoji}</span>
                <span className="att-entry-title">{t(b.titleKey)}</span>
                <span className="att-entry-text">{t(b.textKey)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ENTRY_CSS = `
.att-entry-backdrop{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;}
/* Horný padding je väčší než ostatné strany zámerne: krížik sedí v rohu na vlastnom odsadení
   (nie na paddingu panela), takže bez tejto rezervy sa dotýka rámu aj blokov pod ním.
   Matej 2026-08-05: „krížik je nalepený na rámiku = nevkusné, treba dopriať tomu priestor."
   Druhé kolo: krúžok preč, samotný znak menší — kruh z neho robil ovládací prvok rovnakej váhy
   ako dva hlavné bloky pod ním, hoci je to len východ. Klikacia plocha ostáva 32×32 px (dotyk),
   viditeľný je iba znak. */
.att-entry-panel{position:relative;width:100%;max-width:640px;padding:32px;}
.att-entry-back{position:absolute;top:18px;left:32px;border:0;background:transparent;color:${T.onDarkDim};font-family:${FONT_UI};font-weight:600;font-size:12px;letter-spacing:.02em;cursor:pointer;padding:4px 0;}
.att-entry-back:hover{color:${GOLD};}
/* Skrytá, kým je popup plávajúci blok — tam sa zatvára klikom vedľa. Viď komentár pri
   jej vykreslení; zobrazuje ju bledá mobilná vetva v PALE_ADD_CSS (PackMap.tsx). */
.att-entry-x{display:none;}
.att-entry-blocks{display:flex;gap:18px;align-items:stretch;}
.att-entry-lead{margin:0 0 14px;font-family:${FONT_UI};font-size:12.5px;line-height:1.5;color:${T.onDarkDim};}
.att-entry-blocks-kind{flex-wrap:wrap;}
/* ── DVA RIADKY: VÝLET HORE CEZ CELÚ ŠÍRKU, EVENT + ODKAZ POD NÍM (Matej 2026-08-26) ──────
   „popup ADD urobme dvojriadkový — v prvom riadku bude veľký trip a dolu pod ním na jeho
    šírku dva bloky event a odkaz."
   ⚠️ MENÍ TO PRAVIDLO Z 20. 8. („základ MUSÍ byť tretina, nie polovica"). To pravidlo
   riešilo tri ROVNOCENNÉ dlaždice, kde sa tretia zalomila a flex-grow ju roztiahol na celú
   šírku — vtedy to bola chyba. Tu je zalomenie ZÁMER a hierarchia je zámer tiež: výlet je
   dôvod, prečo sa tlačidlo otvára, event a odkaz sú vedľajšie.
   Zalomenie drží prvá dlaždica na 100 % základni; zvyšné dve si delia riadok na polovice. */
.att-entry-blocks-kind .att-entry-block{flex:1 1 calc(50% - 9px);min-width:150px;}
.att-entry-blocks-kind .att-entry-block:first-child{flex:1 1 100%;}
.att-entry-blocks-kind .att-entry-text{max-width:none;}
/* Veľká dlaždica má aj väčší glyf — inak je z nej len široký pás s rovnakým obsahom.
   Popis je v nej na jeden riadok, tak sa ruší aj rezerva na dvojriadkový text (min-height
   drží rovnaké dno len tým dlaždiciam, ktoré stoja VEDĽA SEBA). */
.att-entry-blocks-kind .att-entry-block:first-child .att-entry-emoji{font-size:48px;height:54px;}
.att-entry-blocks-kind .att-entry-block:first-child .att-entry-title{font-size:19px;letter-spacing:.06em;margin-bottom:12px;}
.att-entry-blocks-kind .att-entry-block:first-child .att-entry-text{min-height:0;font-size:14.5px;max-width:none;}
.att-entry-block{position:relative;flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(245,240,228,0.04);border:1.5px solid ${T.onDarkBorder};border-radius:${PLATE_TILE_R}px;padding:24px 20px;cursor:pointer;transition:border-color .15s ease,background .15s ease,transform .15s ease;}
.att-entry-block:hover,.att-entry-block:focus-visible{border-color:${GOLD};background:rgba(201,154,63,0.08);transform:translateY(-2px);outline:none;}
/* Body za zápis — malá pilulka v rohu dlaždice, nie súčasť nadpisu. Je to odmena, nie názov. */
.att-entry-pts{position:absolute;top:10px;right:10px;padding:3px 8px;border-radius:999px;background:rgba(201,154,63,0.16);border:1px solid rgba(201,154,63,0.55);font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;color:${GOLD};}
.att-entry-block-disabled{opacity:.42;cursor:default;}
.att-entry-block-disabled:hover,.att-entry-block-disabled:focus-visible{border-color:${T.onDarkBorder};background:rgba(245,240,228,0.04);transform:none;}
.att-entry-soon{position:absolute;top:10px;right:10px;font-family:${FONT_UI};font-weight:600;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:${T.onDarkDim};border:1px solid ${T.onDarkBorder};border-radius:999px;padding:3px 8px;}
/* Pevná výška riadku s emoji: jednotlivé emoji majú rôzne metriky (📍 kreslí
   menší glyf než 🥾) a bez nej by nadpisy susedných dlaždíc sedeli inde. */
.att-entry-emoji{font-size:38px;line-height:1;height:44px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
.att-entry-title{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${T.onDark};margin-bottom:10px;}
.att-entry-text{font-family:${FONT_UI};font-weight:400;font-size:12.5px;line-height:1.45;color:${T.onDarkDim};max-width:210px;min-height:2.9em;display:flex;align-items:center;justify-content:center;}
/* Chipy „čo sem patrí" — popis, nie ovládací prvok, tak sú tichšie než dlaždica: bez
   zlatého rámu (ten drží hover celej dlaždice) a s krytím pod nadpisom. Emoji má vlastný
   font-family, inak by naň sadol zdedený Cinzel a na Windows sa z 🅿️ stane obdĺžnik. */
.att-entry-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px;}
/* Obal slučky a jej kópie — mimo mobilnej mapy sa vôbec nepodieľajú na layoute: obal aj prvá
   sada sú display:contents (chipy tak ostávajú priamymi položkami zalamovaného radu vyššie)
   a dve kópie sú preč. Viď komentár pri ich renderi. */
.att-entry-chiploop,.att-entry-chipset{display:contents;}
.att-entry-chipset-copy{display:none;}
.att-entry-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};font-family:${FONT_UI};font-weight:500;font-size:10.5px;letter-spacing:.02em;line-height:1.5;color:${T.onDarkDim};white-space:nowrap;}
.att-entry-chip-emoji{font-family:${FONT_EMOJI};font-size:12px;line-height:1;}
.att-entry-block:hover .att-entry-chip,.att-entry-block:focus-visible .att-entry-chip{border-color:rgba(201,154,63,0.42);color:${T.onDark};}
/* Veľká dlaždica má štyri chipy do jedného radu — smie byť voľnejšia (Matej 2026-08-27:
   „pri tripe daj chipy väčšie aj nadpis a podnadpis… celkovo je to také prázdne veľké
   tlačítko"). Šírku má na celý popup, takže rástol obsah, nie dlaždica. */
.att-entry-blocks-kind .att-entry-block:first-child .att-entry-chips{gap:10px;margin-top:18px;}
.att-entry-blocks-kind .att-entry-block:first-child .att-entry-chip{font-size:13px;padding:6px 15px;gap:7px;}
.att-entry-blocks-kind .att-entry-block:first-child .att-entry-chip-emoji{font-size:16px;}
@media (max-width:640px){
  .att-entry-blocks{flex-direction:column;}
  .att-entry-blocks-kind .att-entry-block{flex:1 1 auto;}
  .att-entry-block{padding:26px 18px;}
}
`;
