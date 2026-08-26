// ZÁPISY DO MAPY („ODKAZY") — ZALOŽENIE ODKAZU.
// Zadanie: `plany/zadanie-zapisy-do-mapy-v2-DALSIA-SESSION.md` §8
//
// Komponent je rozdelený na tri časti, lebo mapa a panel žijú v inom strome:
//   `AddMapNotePin`     → značka na mape, patrí DOVNÚTRA <MapContainer>
//   `AddMapNotePanel`   → formulár, patrí MIMO mapy
//   `MapNotePlacing`    → lišta „ukáž miesto", tiež mimo mapy
// Ten istý dôvod ako pri `GeometryPicker` (mapa je v PackMap.tsx, komponent do
// nej kreslí) — jeden React strom to naraz neurobí.
//
// ── PREČO PANEL NEPREKRÝVA MAPU (Matej UX zamietol 2026-08-20) ──────────────
// Prvá verzia otvárala formulár cez celú obrazovku na tmavom backdrope. Vo chvíli
// potvrdzovania teda človek NEVIDEL miesto, ktoré označuje — a rada „potiahni
// značku, ak nesedí" bola vtip, lebo značka ležala pod panelom. Teraz je panel
// nízky pás pri spodnej hrane, backdrop nie je (len mapa), a PackMap po položení
// značky odpanuje mapu tak, aby značka ostala NAD panelom (`NOTE_PANEL_H`).
//
// ── PREČO SA NAJPRV VYBERÁ TYP A AŽ POTOM MIESTO ────────────────────────────
// Človek prichádza s úmyslom („tu je parkovisko"), nie s bodom. Pôvodné poradie
// bolo obrátené: najprv spadol bod do stredu výrezu a typ sa vyberal až v paneli.
// Rýchla cesta (dlhé podržanie) má poradie opačné a je to správne — tam začína
// gesto na konkrétnom mieste, takže typ musí prísť po ňom.
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Circle, Marker } from 'react-leaflet';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { MAP_SKIN, PALE, PALE_PC_MIN, LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { GROUP_KINDS, TICK_DISEASES, bodyRequired, groupOf, radiusRule, type NewMapNote, type NoteGroup, type NoteKind, type TickDisease } from './mapNotesData';
import { MAP_DOCK_CSS, DOCK_COL_W, DOCK_MOBILE_MAX, DOCK_VH } from '@/components/pack/mapDockShape';
import { FONT_EMOJI, threatEmoji } from './markEmoji';
import { KindGrid } from './KindGrid';
import { AinubisGuide } from '@/components/pack/addtrip/AinubisGuide';
import { noteMarkHtml } from './MapNotesLayer';
import { GROUP_TINT, HAZARD_RED, TICK_ORANGE, NotePalette, NOTE_PALETTE_CSS, type PaletteExtra } from './NotePalette';

const GOLD = '#C99A3F';
const PARK_BLUE = T.brandBlueLite;
const BODY_MAX = 600;

/**
 * Koľko miesta si panel dole vezme. PackMap podľa toho odpanuje mapu, aby
 * značka ostala vidieť. Je to KONŠTANTA, nie meraná výška: panel sa mountuje
 * až po položení značky, takže meranie by prišlo o snímku neskoro a mapa by
 * poskočila až po tom, čo človek uvidí zlú polohu.
 *
 * ⚠️ 300 → 340 (2026-08-21): pribudol posuvník polomeru a rad piatich hrozieb sa
 * na mobile zalamuje do dvoch riadkov. Keď sa panel rozrastie, ČÍSLO SA MUSÍ
 * ZDVIHNÚŤ AJ TU — inak sa mapa odpanuje primálo a značka skončí pod formulárom,
 * čo je presne tá chyba, kvôli ktorej panel vznikol.
 */
// Výška panela. Slúži DVOM veciam a preto je to jedno číslo: strop panela v CSS
// a odsadenie, o ktoré sa mapa odpanuje, nech značka ostane nad ním.
//
// 340 → 420 (22. 8. 2026). Matej: „nesmie tam byť scrolling musí to byť celé na
// jedno videnie v popupe". Samotné stlačenie druhov z troch riadkov na jeden
// ušetrilo ~62 px, ale pri kliešti s potvrdenou chorobou a zapnutým okruhom je
// obsah aj tak ~350 px — strop 340 by scrolloval ďalej, len o vlások.
// ⚠️ Vyššie sa ísť NEDÁ bez toho, aby panel na nižších telefónoch zožral mapu:
// ⚠️ TOTO ČÍSLO JE ZMLUVA S `panBy` (PackMap.tsx: `safeY = size.y - NOTE_PANEL_H - 40`).
// Strop v CSS musí byť TO ISTÉ číslo, inak mapa odsunie značku o menej, než panel zaberie,
// a bod, ktorý človek práve položil, mu zmizne za panelom — teda presne to, čo má odsun riešiť.
// Od 24. 8. 2026 je panel DOK pri spodnej hrane, nie karta 96 px nad ňou, takže z obrazovky
// berie o tých 96 px MENEJ a zmluva konečne sedí presne (predtým sa v najvyššom stave o ~56 px
// míňala). Preto je v CSS `min(78vh, 420px)` — na nízkom displeji rozhoduje vh, a vtedy je
// odsun konzervatívny, teda bezpečný smer.
//
// NAJVYŠŠÍ STAV panela (kliešte + potvrdená choroba + zapnutý okruh + text) meria
// **366 px** — odmerané v prehliadači, nie odhadnuté. Pri `64vh` sa teda zmestí bez
// scrollovania do okna vysokého **573 px a viac**, čo pokrýva každý telefón na výšku.
// Keď do panela pribudne blok, TOTO číslo premeraj znova; „vyzerá to OK" nestačí,
// scrollbar sa objaví až v tom najvyššom stave, do ktorého sa človek preklikáva.
export const NOTE_PANEL_H = 420;

/**
 * SKUTOČNÁ VÝŠKA PANELA, nie jeho strop (2026-08-24).
 *
 * Odkedy má panel značky ten istý tvar ako dok sprievodcu (`.trp-dockpanel`), je na telefóne
 * vysoký presne 33vh — teda na bežnom displeji OKOLO 250 px, nie 420. Odpanovanie mapy podľa
 * 420 by značku odsunulo vyššie, než treba: bod by síce ostal vidieť (chyba na bezpečnú
 * stranu), ale mapa by pri každom zápise nezmyselne odskočila.
 *
 * ⚠️ ZMLUVA S CSS PLATÍ ĎALEJ, len sa počíta z toho istého zdroja (`DOCK_VH`, mapDockShape.ts)
 * ako výška v CSS. Keby sa jedno z tých čísel zmenilo bez druhého, značka, ktorú človek práve
 * položil, mu zmizne za panelom — teda presne to, čo má odsun riešiť.
 */
export function notePanelH(): number {
  if (typeof window === 'undefined') return NOTE_PANEL_H;
  return window.innerWidth <= DOCK_MOBILE_MAX
    ? Math.round(window.innerHeight * DOCK_VH)
    : NOTE_PANEL_H;
}

/**
 * Bod z dlhého podržania, kým človek vyberá typ.
 *
 * Bez neho je rýchla cesta slepá: paleta sa otvorí dole, ale nikde nevidno, KDE
 * gesto pristálo — takže sa nedá zistiť, či prst trafil, alebo je bod o kus vedľa.
 * Značka je zámerne bezfarebná (typ ešte nie je zvolený) a nedá sa ťahať —
 * ťahanie prichádza až s draftom.
 */
export function NoteSpotPin({ lat, lon }: { lat: number; lon: number }) {
  const icon = useMemo(
    () => L.divIcon({ className: 'mn-wrap', html: '<div class="mn-mark mn-spot"></div>' }),
    [],
  );
  return <Marker position={[lat, lon]} icon={icon} interactive={false} />;
}

export type AddMapNotePinProps = {
  lat: number;
  lon: number;
  kind: NoteKind;
  /** null = bod. Kreslí sa ŽIVO počas ťahania posuvníka v paneli. */
  /** len pri `ticks` — mení lem značky ešte pred odoslaním */
  disease?: TickDisease | null;
  radiusM?: number | null;
  onMove: (lat: number, lon: number) => void;
};

/**
 * Ťahateľná značka počas zakladania. Patrí DOVNÚTRA <MapContainer>.
 *
 * Tvar aj emoji sú tie isté ako v `MapNotesLayer` — človek má počas písania
 * vidieť presne to, čo po odoslaní na mape ostane, nie zástupný symbol.
 *
 * ⚠️ `kind` sa MENÍ počas otvoreného panela (výber hrozby), takže značka musí
 * byť riadená zvonku. Kým bola skupina upozornení jednou kresbou, na tom
 * nezáležalo; s emoji by sa človeku pri prepnutí na medveďa naďalej usmievali
 * kliešte.
 */
export function AddMapNotePin({ lat, lon, kind, disease = null, radiusM = null, onMove }: AddMapNotePinProps) {
  const tint = GROUP_TINT[groupOf(kind)];
  // Značku kreslí `noteMarkHtml()` z MapNotesLayer — JEDEN zdroj. Kým to bola
  // kópia, prežilo tu po prechode na emoji staré „biele P v modrom štvorci"
  // a rozpracovaný zápis vyzeral inak než ten istý zápis o sekundu neskôr.
  const icon = useMemo(
    () => L.divIcon({ className: 'mn-wrap', html: noteMarkHtml(kind, ' mn-mark--draft', false, disease) }),
    [kind],
  );

  return (
    <>
      {/* Náhľad okruhu. Bez neho je posuvník slepý údaj v metroch — „500 m" nikto
          neodhadne, kým to na mape neuvidí prekryté cez les. */}
      {radiusM != null && (
        <Circle
          center={[lat, lon]}
          radius={radiusM}
          pathOptions={{ color: tint, weight: 1.5, opacity: 0.7, fillColor: tint, fillOpacity: 0.14, dashArray: '5 5' }}
          interactive={false}
        />
      )}
      <Marker
        position={[lat, lon]}
        icon={icon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const p = (e.target as L.Marker).getLatLng();
            onMove(p.lat, p.lng);
          },
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIŠTA „UKÁŽ MIESTO" — medzi výberom typu a napísaním textu.
// Mapa je v tejto chvíli celá voľná a klikateľná; lišta len hovorí, čo sa čaká,
// a drží únik. Na mobile sedí nad spodnou navigáciou, na PC nad spodnou hranou.
// ─────────────────────────────────────────────────────────────────────────────
export function MapNotePlacing({
  group,
  kind,
  ready,
  onCancel,
}: {
  group: NoteGroup;
  /**
   * Druh vybraný ešte pred ťuknutím do mapy (sprievodca výletu, krok 2). Keď je podaný,
   * lišta hovorí MEDVEĎ, nie UPOZORNENIE — inak by človek po výbere konkrétnej hrozby
   * stratil potvrdenie, že si vybral práve ju.
   */
  kind?: NoteKind | null;
  /** mapa je dosť priblížená na to, aby klik dával zmysel */
  ready: boolean;
  onCancel: () => void;
}) {
  const t = useT();
  const touch = typeof window !== 'undefined' && window.matchMedia('(hover:none)').matches;
  const key = !ready ? 'pack.mapNotes.place.zoomIn' : touch ? 'pack.mapNotes.place.touch' : 'pack.mapNotes.place.mouse';
  const what = kind ? t(`pack.mapNotes.kind.${kind}`) : t(`pack.mapNotes.group.${group}`);
  /**
   * ⚠️ HOVORÍ TO AINUBIS A HORE, NIE VLASTNÁ LIŠTA (Matej 24. 8. 2026: „po kliknutí na označ
   * parkovisko je na obrazovke správa — potrebujeme aby ju povedal ainubis a bola hore ako
   * vždy, a to isté platí aj pri ďalších odkazoch pri tom výbere a kliku na mapu").
   *
   * Pilulka `.mnp-bar` bola posledné miesto, kde s človekom hovoril niekto iný než AInubis —
   * a bola to práve tá chvíľa, keď sa naňho najviac spolieha (drží prst nad mapou a hľadá,
   * kam ťuknúť). Sprievodca výletu si v tejto chvíli svoju bublinu skrýva
   * (`drawBar.active` = false pri `notePlacing`), takže sa dve nikdy neprekryjú.
   *
   * × = ZRUŠIŤ. Je to to isté východisko, aké × nesie po celý zvyšok sprievodcu.
   */
  return (
    <AinubisGuide text={`${what} ${t(key)}`} onAbort={onCancel} abortLabel={t('pack.mapNotes.add.cancel')} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RÝCHLA CESTA — paleta priamo pri bode, kam človek podržal prst.
// Poradie je tu obrátené (miesto → typ), lebo gesto začalo na mieste.
// ─────────────────────────────────────────────────────────────────────────────
export function NoteQuickPalette({ onPick, onPickExtra, onCancel }: { onPick: (g: NoteGroup) => void; onPickExtra?: (x: PaletteExtra) => void; onCancel: () => void }) {
  const t = useT();
  return (
    <div className="mnq-wrap" role="dialog" aria-modal="true">
      <style>{ADD_NOTE_CSS}</style>
      <style>{NOTE_PALETTE_CSS}</style>
      <div className="mnq-panel">
        {/* NADPIS PANELA, nie eyebrow (Matej 2026-08-21: „namiesto čo tu je daj dostredu —
            PRIDAJ ODKAZ"). Krížik je `absolute`, aby nadpis sedel v OPTICKOM strede panela;
            keby bol v toku, centroval by sa len zvyšok šírky po jeho odčítaní a nadpis by
            sa opticky zosunul vľavo. */}
        <div className="mnq-head">
          {/* Nadpis sa mení podľa toho, čo paleta ponúka: s výletom a udalosťou v rade by
              „Pridaj odkaz" klamal o dvoch z piatich dlaždíc. */}
          <h3 className="mnq-title">{t(onPickExtra ? 'pack.mapNotes.quick.titleAny' : 'pack.mapNotes.quick.title')}</h3>
          <button type="button" className="mna-close mnq-close" onClick={onCancel} aria-label={t('pack.mapNotes.add.close')}>×</button>
        </div>
        <NotePalette variant="strip" onPick={onPick} extras={onPickExtra ? ['trip', 'event'] : undefined} onPickExtra={onPickExtra} />
      </div>
    </div>
  );
}

/**
 * „500 m" / „1,2 km" — metre pod kilometrom, nad ním kilometre s jedným
 * desatinným miestom. `2500 m` sa číta ako číslo, `2,5 km` ako vzdialenosť.
 *
 * ⚠️ Desatinný oddeľovač NEPÍŠ natvrdo — SK má čiarku, EN bodku. Preto `Intl`,
 * a jazyk cezeň vždy prekladá `intlLocale()` (viď hlavičku `i18n/bcp47.ts`).
 */
function formatRadius(m: number, locale: string): string {
  if (m < 1000) return `${m} m`;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(m / 1000)} km`;
}

export type AddMapNotePanelProps = {
  group: NoteGroup;
  lat: number;
  lon: number;
  /** RIADENÉ ZVONKU — značka na mape musí ukazovať práve vybranú hrozbu. */
  kind: NoteKind;
  onKind: (k: NoteKind) => void;
  /** null = bod. Riadené zvonku z toho istého dôvodu — kruh sa kreslí na mape. */
  radiusM: number | null;
  onRadius: (m: number | null) => void;
  /** RIADENÉ ZVONKU z rovnakého dôvodu ako `kind`: lem draft značky sa kreslí NA MAPE */
  disease: TickDisease | null;
  onDisease: (d: TickDisease | null) => void;
  /** vyplnené len keď zápis vzniká z otvoreného článku výletu */
  pinnedSlug?: string | null;
  /** názov výletu na potvrdenie „patrí sem" — čisto informatívne */
  pinnedName?: string | null;
  onSubmit: (n: NewMapNote) => Promise<void>;
  onCancel: () => void;
  /**
   * Panel stojí v SPRIEVODCOVI VÝLETU (krok 2), nie na holej mape. Na PC si vtedy sadne
   * do toho istého ľavého stĺpca ako dok sprievodcu — inak by tvar odskočil práve v kroku,
   * ktorý má byť pod prstom nemenný.
   */
  dock?: boolean;
};

export function AddMapNotePanel({
  group,
  lat,
  lon,
  kind,
  onKind,
  radiusM,
  onRadius,
  disease,
  onDisease,
  pinnedSlug,
  pinnedName,
  onSubmit,
  onCancel,
  dock = false,
}: AddMapNotePanelProps) {
  const t = useT();
  const { lang } = useLang();
  const subKinds = GROUP_KINDS[group];
  const rule = radiusRule(kind);
  const [body, setBody] = useState('');
  const [paid, setPaid] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  // Na dotyku sa NEfokusuje samo: klávesnica by vyskočila cez pol obrazovky
  // a zakryla presne tú mapu, kvôli ktorej je panel nízky. Na PC fokus vadiť
  // nemôže, tam sa dá rovno písať.
  useEffect(() => {
    if (window.matchMedia('(hover:none)').matches) return;
    areaRef.current?.focus();
  }, []);

  // ⚠️ POLOMER PATRÍ DRUHU, NIE PANELU. Bez tohto by prepnutie z „medveďa" (okruh
  // zapnutý) na „rebríky" (iba bod) nechalo na mape visieť kruh, ktorý formulár už
  // neovláda — pole zmizne, kružnica ostane. DB by ho pri odoslaní zahodila, takže
  // by človek videl na mape jednu vec a uložil druhú.
  const pickKind = (k: NoteKind) => {
    onKind(k);
    // Choroba patrí kliešťu. Bez tohto by ostala navesená na medveďovi, formulár
    // by ju nezobrazoval a odoslala by sa neviditeľná hodnota.
    if (k !== 'ticks') onDisease(null);
    const r = radiusRule(k);
    if (r.mode === 'none') onRadius(null);
    // Povinný okruh sa musí DOSADIŤ, nie len orezať. Prechod z druhu, ktorý bod dovoľuje
    // (rebríky, komentár), by inak nechal `radiusM === null` — posuvník by sa nevykreslil
    // a hrozba by sa uložila ako bod, hoci ju pravidlo zakazuje.
    else if (r.mode === 'required') onRadius(Math.min(Math.max(radiusM ?? r.def, r.min), r.max));
    else if (radiusM != null) onRadius(Math.min(Math.max(radiusM, r.min), r.max));
  };

  const trimmed = body.trim();
  const needsBody = bodyRequired(kind);
  const canSubmit = (!needsBody || trimmed.length > 0) && !busy;

  // Zápis NIE JE optimistický: čaká sa na odpoveď DB a až potom sa panel zavrie.
  // Ticho „uložené" pri parkovisku je horšie než chyba — človek by sa spoľahol
  // na informáciu, ktorá nikde nie je.
  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        kind,
        lat,
        lon,
        body: trimmed,
        // `radiusM` sa posiela AKO JE — dorovnanie na pravidlo skupiny robí DB
        // (`add_map_note`), nie formulár. Viď migráciu 20260821_map_notes_kinds.sql.
        radiusM,
        paid: kind === 'parking' ? paid : null,
        disease: kind === 'ticks' ? disease : null,
        pinnedSlug: pinnedSlug ?? null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('pack.mapNotes.error'));
      setBusy(false);
    }
  };

  return (
    <div className={`mna-sheet trp-dockpanel${dock ? ' mna-sheet--dock' : ''}`} role="dialog" aria-modal="false">
      <style>{MAP_DOCK_CSS}</style>
      <style>{ADD_NOTE_CSS}</style>
      {/* Hlavička nesie SKUPINU a za ňou VYBRANÝ DRUH. Druh mal do 22. 8. vlastný
          riadok pod kruhmi — stál 24 px v paneli, ktorý sa nesmie scrollovať,
          a hovoril to isté, čo sa zmestí sem. Skupina ostáva, lebo farba panela
          aj kruhov ide z nej. */}
      <div className="mna-head">
        <span className="mna-title" style={{ color: GROUP_TINT[group] }}>
          {t(`pack.mapNotes.group.${group}`)}
          {subKinds.length > 1 && <b className="mna-title-kind">{t(`pack.mapNotes.kind.${kind}`)}</b>}
        </span>
        <button type="button" className="mna-close" onClick={onCancel} aria-label={t('pack.mapNotes.add.close')}>×</button>
      </div>

      {/* ── SKROLUJE SA LEN STRED (Matej 2026-08-24) ────────────────────────
          Hlavička hovorí ČO píšem, CTA hovorí ako to uložiť — ani jedno nesmie odísť
          z dohľadu. Skrol tu ostáva len ako poistka pre najvyšší stav panela (kliešť
          s potvrdenou chorobou a zapnutým okruhom na nízkom displeji). */}
      <div className="mna-scroll">

      {/* ROZPAD UPOZORNENIA NA KONKRÉTNE HROZBY (Matej 2026-08-21).
          Trojuholník je spoločný tvar celej skupiny, emoji vnútri nesie podtyp —
          takže voľba tu OKAMŽITE mení značku na mape (`kind` je riadený zvonku). */}
      {subKinds.length > 1 && (
        <>
          {/* NÁZOV, NIE LEN EMOJI (Matej 2026-08-23). Deväť samotných emoji je hádanka:
              🦌 je zver, ale 🕷️ môže byť pavúk aj kliešť a ⚠️ nepovie nič. Popis bol doteraz
              len v `title`, ktorý na dotykovom displeji neexistuje. Tá istá mriežka stojí
              v kroku 2 sprievodcu výletu — preto zdieľaný komponent, nie dve kópie. */}
          {/* ⚠️ VODOROVNÝ RAD, ROVNAKO AKO V SPRIEVODCOVI (Matej 24. 8. 2026: „otvorí mi dolný
              panel so všetkými možnosťami, ale sú 3x3 a nezmestí sa to + panel je ešte väčší…
              potrebujeme docieliť súrodosť, takto to vyzerá amatérsky, každý slajd má iný vajb
              a logiku"). Mriežka 3×3 tu vyrábala tri riadky v paneli, ktorý je zámerne nízky,
              aby nezakryl mapu — a hneď po tom, čo si človek ten istý druh vybral o obrazovku
              skôr. Rad ostáva VIDNO (druh sa tu dá ešte prepnúť, panel je práve na doladenie),
              len má výšku jedného riadku a vybraná dlaždica je zvýraznená. */}
          <KindGrid row kinds={subKinds} selected={kind} tint={GROUP_TINT[group]} onPick={pickKind} />
        </>
      )}

      {/* ── KLIEŠŤ MÁ DVA STUPNE (Matej 2026-08-22) ──────────────────────────
          „bude tam možnosť prepnúť že výskyt, potvrdené ochorenie z klieťa a dropdown."

          Prepínač mení LEM ZNAČKY okamžite (oranžová → červená), lebo `disease`
          ide do `noteMarkHtml` cez ten istý kanál ako `kind`. Človek teda vidí,
          čo na mapu kladie, ešte kým to odošle.

          Výber je natívny `<select>`: štyri choroby s dlhými názvami by ako pilulky
          zabrali tri riadky v paneli, ktorý je zámerne nízky, aby nezakryl mapu. */}
      {kind === 'ticks' && (
        <div className="mna-tick">
          <div className="mna-tick-switch">
            <button
              type="button"
              className={`mna-opt mna-opt--sight${disease == null ? ' on' : ''}`}
              onClick={() => onDisease(null)}
            >
              {t('pack.mapNotes.tick.sighting')}
            </button>
            <button
              type="button"
              className={`mna-opt mna-opt--ill${disease != null ? ' on' : ''}`}
              onClick={() => onDisease(disease ?? TICK_DISEASES[0])}
            >
              {t('pack.mapNotes.tick.confirmed')}
            </button>
          </div>
          {disease != null && (
            <select
              className="mna-select"
              value={disease}
              onChange={(e) => onDisease(e.target.value as TickDisease)}
              aria-label={t('pack.mapNotes.tick.confirmed')}
            >
              {TICK_DISEASES.map((d) => (
                <option key={d} value={d}>{t(`pack.mapNotes.disease.${d}`)}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <textarea
        ref={areaRef}
        className="mna-body"
        value={body}
        maxLength={BODY_MAX}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t(`pack.mapNotes.add.placeholder.${kind}`)}
        rows={2}
      />

      {kind === 'parking' && (
        <div className="mna-paid">
          <button type="button" className={`mna-opt${paid === false ? ' on' : ''}`} onClick={() => setPaid(paid === false ? null : false)}>
            {t('pack.mapNotes.parking.free')}
          </button>
          <button type="button" className={`mna-opt${paid === true ? ' on' : ''}`} onClick={() => setPaid(paid === true ? null : true)}>
            {t('pack.mapNotes.parking.paid')}
          </button>
        </div>
      )}

      {/* ── POLOMER ────────────────────────────────────────────────────────────
          Parkovisko sem nikdy nedôjde (`mode:'none'`) — je to bod a posuvník by
          len ponúkal odpoveď na otázku, ktorú nikto nemá.
          Pri upozornení sa posuvník NEDÁ vypnúť, len posunúť od 500 m vyššie;
          pri komentári je okruh voľba (Matej: „správa môže byť bod alebo okruh"). */}
      {rule.mode !== 'none' && (
        <div className="mna-radius">
          <div className="mna-radius-head">
            <span className="mna-radius-label">{t('pack.mapNotes.radius.label')}</span>
            {rule.mode === 'optional' && (
              <div className="mna-radius-switch">
                <button
                  type="button"
                  className={`mna-opt${radiusM == null ? ' on' : ''}`}
                  onClick={() => onRadius(null)}
                >
                  {t('pack.mapNotes.radius.point')}
                </button>
                <button
                  type="button"
                  className={`mna-opt${radiusM != null ? ' on' : ''}`}
                  onClick={() => onRadius(radiusM ?? rule.def)}
                >
                  {t('pack.mapNotes.radius.area')}
                </button>
              </div>
            )}
            {radiusM != null && <span className="mna-radius-val">{formatRadius(radiusM, intlLocale(lang))}</span>}
          </div>
          {radiusM != null && (
            <input
              type="range"
              className="mna-range"
              min={rule.min}
              max={rule.max}
              step={rule.step}
              value={radiusM}
              onChange={(e) => onRadius(Number(e.target.value))}
              style={{ ['--mn-tint' as string]: GROUP_TINT[group] }}
              aria-label={t('pack.mapNotes.radius.label')}
            />
          )}
          {/* Veta ostáva aj po tom, čo polomer prestal byť povinný (22. 8.) — vtedy
              bola vysvetlením pravidla, teraz je odporúčaním. Zviazať ju s `required`
              by znamenalo, že s pravidlom ticho zmizne aj dôvod, prečo kruh existuje. */}
          {groupOf(kind) === 'warning' && <p className="mna-radius-note">{t('pack.mapNotes.radius.warnNote')}</p>}
        </div>
      )}

      {pinnedName && <p className="mna-pinned">{t('pack.mapNotes.add.pinned').replace('{trip}', pinnedName)}</p>}
      {error && <p className="mna-error">{error}</p>}

      </div>

      <div className="mna-actions">
        {/* UKAZOVATEĽ „SPLNENÉ" (Matej 2026-08-22: „vizuálne ukazovatele že je to
            vybraté a splnené"). Do 22. 8. tu stála len nápoveda o ťahaní značky
            a jediná spätná väzba o pripravenosti bolo ZOŠEDNUTÉ tlačidlo — teda
            informácia podaná NEPRÍTOMNOSŤOU, ktorú si človek všimne až keď
            klikne a nič sa nestane. Teraz sa riadok prepne na zelenú fajku
            v momente, keď je zápis odosielateľný. Text ostáva nápovedou dovtedy,
            takže riadok nepribudol — len zmenil obsah a výška panela sa nehla. */}
        {canSubmit ? (
          <span className="mna-hint mna-hint--ok">
            <i aria-hidden="true">✓</i>{t('pack.mapNotes.add.ready')}
          </span>
        ) : (
          <span className="mna-hint">{t('pack.mapNotes.add.dragHint')}</span>
        )}
        <button type="button" className="btn-gold mna-submit" onClick={submit} disabled={!canSubmit}>
          {busy ? t('pack.mapNotes.add.saving') : t('pack.mapNotes.add.submit')}
        </button>
      </div>
    </div>
  );
}

/**
 * VÝZVA „PRIBLÍŽ SI MAPU" PRIAMO V MIESTE KLIKU (Matej 2026-08-21).
 *
 * „ten oznam vieme dať aj v mieste kliku? nech je to vidno hneď… a nie pri
 * spodnom okraji." Predtým visel `position:fixed` pri spodnej hrane — teda inde,
 * než sa človek práve pozeral, a pri kliku hore na mape ho ľahko prehliadol.
 *
 * ⚠️ BUBLINA SA MUSÍ VOJSŤ DO MAPY. Klik pri okraji by ju vystrčil von z kontajnera
 * (a na mobile mimo obrazovky), takže sa priráža k okrajom — rovnaká logika ako
 * `NOTE_PANEL_H` panBy pri paneli. Šípka pod bublinou sa preto počíta zvlášť:
 * keď sa telo bubliny odsunie, šípka musí ostať nad kliknutým bodom, inak ukazuje
 * na nesprávne miesto.
 *
 * Kotva je STRED bubliny nad bodom; pri kliku úplne hore sa preklopí POD bod
 * (`is-below`), aby nevytiekla nad mapu.
 */
export function MapNoteTooFar({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  const t = useT();
  const BW = 250;      // šírka bubliny (musí sedieť s max-width v CSS)
  const BH = 54;       // odhad výšky pri dvoch riadkoch — stačí na rozhodnutie hore/dole
  const GAP = 14;      // odstup od kliknutého bodu (miesto pre šípku)
  const EDGE = 10;     // minimálny odstup od hrany mapy

  const below = y - GAP - BH < EDGE;
  const top = below ? y + GAP : y - GAP - BH;
  const left = Math.max(EDGE, Math.min(x - BW / 2, Math.max(EDGE, width - BW - EDGE)));
  // Šípka drží kliknutý bod, aj keď sa telo odsunulo k okraju.
  const arrow = Math.max(12, Math.min(x - left, BW - 12));

  return (
    <div
      className={`mntf${below ? ' is-below' : ''}`}
      role="status"
      style={{ left, top: Math.max(EDGE, Math.min(top, height - BH - EDGE)), width: BW, ['--mntf-arrow' as string]: `${arrow}px` }}
    >
      <style>{ADD_NOTE_CSS}</style>
      {t('pack.mapNotes.tooFar')}
    </div>
  );
}

/**
 * Jednorazová nápoveda o rýchlej ceste — „podrž dlhšie prst na mieste".
 *
 * Matej 2026-08-20: „na mobile vyjde tento oznam nad tlačítka kde je aj
 * pridať… podrž dlhšie prst na mieste kde chceš pridať". Na PC to isté hovorí
 * plusko pri kurzore (`MapNoteCursor`), takže tam sa pruh nekreslí.
 */
export function MapNoteHint({ onDismiss }: { onDismiss: () => void }) {
  const t = useT();
  return (
    <div className="mna-tip" role="status">
      <style>{ADD_NOTE_CSS}</style>
      <span>{t('pack.mapNotes.hint')}</span>
      <button type="button" onClick={onDismiss} aria-label={t('pack.mapNotes.add.close')}>×</button>
    </div>
  );
}

const HINT_KEY = 'dogypt.mapNotes.hintSeen.v1';
export const hintSeen = (): boolean => {
  try { return localStorage.getItem(HINT_KEY) === '1'; } catch { return true; }
};
export const markHintSeen = (): void => {
  try { localStorage.setItem(HINT_KEY, '1'); } catch { /* private mode — nápoveda sa ukáže znova, nie je to chyba */ }
};

export const ADD_NOTE_CSS = `
/* ── PANEL AKO NÍZKY PÁS ───────────────────────────────────────────────────
   Žiadny backdrop: mapa musí ostať vidieť aj klikateľná mimo panela.
   ⚠️ overflow-y:auto je POISTKA, nie návrh — obsah sa má do panela zmestiť
   VŽDY (Matej 22. 8.: „nesmie tam byť scrolling"). Necháva sa tu len pre prípad
   jazyka s výrazne dlhšími slovami; keď sa scrollbar objaví v SK alebo EN, je to
   chyba na opravu, nie stav na strpenie. Meraj scrollHeight vs clientHeight
   pri kliešti s potvrdenou chorobou a zapnutým okruhom — to je najvyšší stav.
   POZOR: PLNÁ TMAVÁ VÝPLŇ, NIE sklo (pk-glass). Sklo je priehľadné a leží tu nad
   SVETLOU mapou, takže panel zbelie a text z neho zmizne (overené screenshotom —
   celý formulár bol nečitateľný nad zeleným podkladom). To isté platí pre lištu
   aj nápovedu nižšie; tmavé sklo funguje len nad tmavou stránkou. */
/* ── SPODNÝ DOK, NIE PLÁVAJÚCA KARTA (Matej 2026-08-24) ────────────────────
   „klik na napr. kliešte → klik na mapu → a v tomto popupe nie je vidno CTA
    (zapísať na mapu), lebo nie je ako spodný panel, ako by mal byť."

   Karta visela 96 px nad spodnou hranou, mala strop 64vh a vnútri skrol — takže
   na telefóne CTA leží POD zlomom a človek ho nájde, len ak tuší, že tam je.
   Dok je pripútaný k hrane, má tvar lišty kreslenia (rovnaký povrch v tom istom
   kroku) a hlavne: CTA sa už nikam neposúva.
   ⚠️ Skrol NEZANIKOL, len sa presunul dovnútra — strop musí ostať, lebo kliešť
   s potvrdenou chorobou a zapnutým okruhom je vyšší než nízky displej. Zmenilo sa,
   ČO sa skroluje: teraz stred, kým hlavička aj CTA stoja. */
/* ── TVAR JE SPOLOČNÝ S DOKOM SPRIEVODCU (Matej 2026-08-24) ────────────────
   „pri označení parkoviska sa vysunie iný dolný panel… musí byť taký istý ako ten panel
    predtým, treba ustáliť ten istý tvar aj veľkosť."
   Povrch, výplň aj výška prišli do .trp-dockpanel (components/pack/mapDockShape.ts) —
   ten istý zdroj, z akého ich berie .trp-dstart a .trp-dbar. Tu ostáva len to, čo je
   vlastné TOMUTO panelu: pripútanie k hrane a vnútorné rozvrhnutie (hlavička a CTA stoja,
   skroluje sa stred). */
.mna-sheet{position:fixed;left:0;right:0;bottom:0;z-index:1200;display:flex;flex-direction:column;max-height:min(78vh,${NOTE_PANEL_H}px);}
/* ── 33vh JE SPODNÁ HRANICA, NIE PEVNÁ VÝŠKA ───────────────────────────────
   Dok sprievodcu má v krokoch 1-2 presných 33vh, aby sa výrez mapy nehýbal. Tento panel
   z toho berie SPODNÚ hranicu — nikdy nie je nižší než dok, ktorý práve vystriedal, takže
   nevznikne dojem, že sa vysunulo niečo iné a menšie. Strop si drží vlastný.

   ⚠️ PEVNÝCH 33vh SA VEDOME NEDRŽÍ. Odskúšané naživo: pri parkovisku (text + zadarmo/platené)
   sa obsah do 232 px na 704 px vysokom okne nezmestí a pilulky sa prerežú v polovici — a
   prerezaný riadok nevyzerá ako "skroluj", vyzerá ako pokazené. Pri upozornení je obsah
   dvojnásobný (rad hrozieb + posuvník okruhu + veta). Rásť je menšie zlo než rezať: rozdiel
   oproti doku je desiatky pixelov, kým povrch, výplň aj rám ostávajú tie isté. */
@media (max-width:${DOCK_MOBILE_MAX}px){
  .mna-sheet{height:auto;min-height:${DOCK_VH * 100}vh;max-height:min(78vh,${NOTE_PANEL_H}px);}
}
/* ── V SPRIEVODCOVI VÝLETU AJ NA PC SEDÍ V ĽAVOM STĹPCI ────────────────────
   Bez tohto by na PC panel v kroku 2 odskočil z ľavého bloku na pás cez celú spodnú hranu —
   tá istá chyba ako na telefóne, len s väčším skokom. Miery sú zhodné s .trp-dock
   (GeometryPicker.tsx): je to ten istý stĺpec, nie jeho druhá verzia.
   ⚠️ Platí LEN v sprievodcovi. Na holej mape žiadny ľavý blok nie je a panel tam ostáva
   spodným pásom. */
@media (min-width:1024px){
  /* ⚠️ ZAROVNANÝ HORE A VYSOKÝ PODĽA OBSAHU (bottom:auto). Dok má síce top aj bottom 20 px,
     ale je to len RÁM stĺpca — panely v ňom stoja hore (justify-content:flex-start) a výšku
     si berú podľa obsahu. Keď si tie isté dve hodnoty vzal panel značky priamo na seba,
     natiahol sa cez celú obrazovku a medzi vetou o okruhu a tlačidlom ostala pol metra diera. */
  .mna-sheet--dock{top:20px;bottom:auto;left:20px;right:auto;width:${DOCK_COL_W}px;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);}
}
@media (min-width:1024px) and (max-width:1400px){
  .mna-sheet--dock{width:360px;}
}
/* Na holej mape ostáva panel PRIPÚTANÝ k spodnej hrane, takže dole nemá čo zaobľovať ani
   rámovať — .trp-dockpanel zaobľuje dokola, lebo tam je karta plávajúca. */
@media (min-width:1024px){
  .mna-sheet:not(.mna-sheet--dock){border-radius:16px 16px 0 0;border-bottom:0;border-left:0;border-right:0;}
}
/* Hlavička a CTA stoja, skroluje sa len stred v .mna-scroll.
   ⚠️ NIE mna-body — to je trieda TEXTAREY o pár riadkov nižšie a obal s tým istým
   názvom by jej pretlačil výšku aj skrol. */
.mna-sheet > .mna-head{flex:0 0 auto;}
.mna-sheet > .mna-actions{flex:0 0 auto;margin-top:10px;}
.mna-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:10px;padding-top:8px;}

.mna-head{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.mna-title{font-family:${FONT_TITLE};font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;}
.mna-close{width:30px;height:30px;border:0;background:transparent;color:${T.onDarkDim};font-size:16px;line-height:1;cursor:pointer;padding:0;}
.mna-close:hover{color:${GOLD};}
/* ── DRUHY HROZBY = RAD EMOJI KRUHOV, NIE PILULKY S TEXTOM ─────────────────
   Matej 2026-08-22: „nesmie tam byť scrolling musí to byť celé na jedno videnie
   v popupe… neviem kam mam kliknúť musí to mať kekné body ako aj vizuálne
   ukazovatele že je to vybraté a splnené."

   Deväť pilulek s textom sa lámalo do TROCH riadkov a zaberalo 99 px — samo
   o sebe skoro tretinu panela a hlavný dôvod, prečo panel scrolloval (namerané:
   391 px obsahu do 338 px). Kruh s emoji zaberie JEDEN riadok (34 px) a názov
   vybraného druhu sa presunul do hlavičky (UPOZORNENIE · KLIEŠTE), takže text sa
   nestratil — len sa prestal opakovať deväťkrát a nestojí vlastný riadok.

   Kruh je zámerne TÝŽ TVAR ako značka na mape (28 px, biele pole, farebný lem) —
   človek vyberá presne to, čo o chvíľu uvidí pod prstom. Vybraný je VYPLNENÝ
   farbou skupiny a má prstenec, takže „vybraté" sa dá prečítať aj periférne. */
/* Rad zaberá CELÚ šírku panela rovnakými dielmi (flex:1 1 0) a NEZALAMUJE sa.
   Pevná šírka 34 px sa pri 360 px telefóne (panel 338) zlomila do dvoch radov
   a obsah vyskočil na 407 px, teda 2 px pod strop — teoreticky prešlo, prakticky
   by to spadlo pri prvom dlhšom preklade. Deliť šírku je odolnejšie než ju hádať.
   max-width drží kruh na 34 px na širokom paneli, nech z neho nie je ovál. */
/* Druh za skupinou. Oddelený bodkou a stlmený, aby hlavička ostala jedným
   prvkom a nie dvoma nadpismi vedľa seba. */
.mna-title-kind{font-weight:700;opacity:.72;}
.mna-title-kind::before{content:' · ';opacity:.6;}

/* ── POLOMER ───────────────────────────────────────────────────────────────
   Posuvník má vlastný vzhľad, lebo natívny je na tmavom paneli takmer neviditeľný
   (WebKit kreslí bledú dráhu na bledom pozadí). Farbu berie zo skupiny cez
   --mn-tint, takže upozornenie ťahá červenú a komentár zlatú — rovnaký jazyk
   ako značka aj kruh na mape. */
/* ── KLIEŠŤ: VÝSKYT / POTVRDENÁ CHOROBA ───────────────────────────────────
   Prepínač je ten istý tvar ako bod/okruh pri polomere (.mna-opt) — je to tá
   istá otázka „ktorá z dvoch verzií", takže nemá dôvod vyzerať inak. */
/* Prepínač a výber choroby stoja VEDĽA SEBA, nie pod sebou — pod sebou to bolo
   69 px a panel sa práve o toľko nezmestil. Sú to dve časti jednej vety
   („potvrdená choroba: borelióza"), takže jeden riadok je aj vecne správnejší. */
.mna-tick{margin-top:9px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.mna-tick-switch{display:flex;gap:6px;flex:1 1 auto;}
.mna-tick-switch .mna-opt{flex:1 1 0;font-size:10px;padding:6px 10px;}
/* Natívny select nesie na macOS aj Windows vlastný chrome — prefarbuje sa len
   to, čo sa dá, a color-scheme:dark povie prehliadaču, nech rozbaľovací zoznam
   nakreslí tmavý. Bez toho je zoznam biely nad čiernym panelom. */
.mna-select{flex:1 1 150px;min-width:0;color-scheme:dark;font-family:${FONT_UI};font-size:11.5px;color:${T.onDark};background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};border-radius:8px;padding:7px 9px;cursor:pointer;}

.mna-radius{margin-top:10px;}
.mna-radius-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.mna-radius-label{font-family:${FONT_UI};font-weight:500;font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:${T.onDarkDim};}
.mna-radius-switch{display:flex;gap:6px;}
.mna-radius-switch .mna-opt{flex:0 1 auto;font-size:10px;padding:5px 10px;}
.mna-radius-switch .mna-opt.on{color:${GOLD};border-color:${GOLD};background:rgba(201,154,63,0.12);}
.mna-radius-val{margin-left:auto;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.04em;color:${T.onDark};}
.mna-radius-note{margin:6px 0 0;font-family:${FONT_UI};font-size:10.5px;line-height:1.4;color:${T.onDarkDim};}
.mna-range{width:100%;margin:9px 0 0;-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer;}
.mna-range:focus{outline:none;}
.mna-range::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:rgba(245,240,228,0.16);}
.mna-range::-moz-range-track{height:4px;border-radius:999px;background:rgba(245,240,228,0.16);}
/* margin-top na palci = (výška dráhy − priemer palca) / 2; bez neho WebKit
   posadí palec na horný okraj dráhy a posuvník vyzerá rozbito. */
.mna-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;margin-top:-6px;border-radius:50%;background:var(--mn-tint,${GOLD});border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.5);}
.mna-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--mn-tint,${GOLD});border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.5);}
/* 16 px je minimum, pod ktorým iOS Safari pri fokuse zoomuje celú stránku —
   v mape by to znamenalo, že sa človeku pri písaní rozsype výrez. */
.mna-body{width:100%;box-sizing:border-box;margin-top:8px;font-family:${FONT_UI};font-size:16px;line-height:1.45;color:${T.onDark};background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};border-radius:8px;padding:9px 11px;resize:none;min-height:56px;}
.mna-body:focus{outline:none;border-color:${GOLD};}
.mna-body::placeholder{color:${T.onDarkDim};}
.mna-paid{display:flex;gap:6px;margin-top:8px;}
.mna-opt{flex:1 1 0;font-family:${FONT_UI};font-weight:600;font-size:11px;color:${T.onDarkDim};background:transparent;border:1px solid ${T.onDarkBorder};border-radius:999px;padding:7px 10px;cursor:pointer;}
.mna-opt.on{color:${PARK_BLUE};border-color:${PARK_BLUE};background:rgba(46,95,208,0.14);}
/* ── PREPÍNAČ KLIEŠŤA NESIE FARBU, KTORÚ DOSTANE ZNAČKA ────────────────────
   Do 22. 8. dedil .mna-opt.on, teda MODRÚ — a modrá je v tejto appke farba
   parkoviska. V paneli o kliešťoch tak svietila tretia farba, ktorá nič
   neznamenala, vedľa červeného kruhu a zlatého okruhu. Teraz je vybraný stav
   presne ten odtieň, aký bude mať lem značky na mape: oranžová = výskyt,
   červená = potvrdené ochorenie. Človek teda vidí následok voľby, nie len ktorá
   je aktívna. Zdroj oboch farieb je noteTint, nie nové hodnoty. */
.mna-opt--sight.on{color:${TICK_ORANGE};border-color:${TICK_ORANGE};background:rgba(224,138,46,0.16);}
.mna-opt--ill.on{color:${HAZARD_RED};border-color:${HAZARD_RED};background:rgba(206,75,60,0.16);}
.mna-pinned{margin:8px 0 0;font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};}
.mna-error{margin:8px 0 0;font-family:${FONT_UI};font-size:11.5px;color:#E0796D;}
.mna-actions{display:flex;gap:10px;align-items:center;margin-top:10px;}
.mna-hint{flex:1 1 auto;display:flex;align-items:center;gap:6px;font-family:${FONT_UI};font-size:10.5px;line-height:1.35;color:${T.onDarkDim};}
/* Zelená je tu JEDINÁ v paneli a nesie presne jeden význam: „môžeš odoslať".
   Je to ten istý odtieň, aký na mape nesie tip — pozitívny stav, nie výstraha. */
.mna-hint--ok{color:${GROUP_TINT.comment};font-weight:600;}
.mna-hint--ok i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:999px;background:${GROUP_TINT.comment};color:#08150c;font-size:10px;font-weight:700;line-height:1;}
/* CTA (brand v3.2 LOCKED): .btn-gold sa nikde neimportuje globálne (žije v
   SpiralLanding.css) — lokálna kópia hodnôt 1:1, rovnaký zavedený vzor ako
   AddTripPlan.tsx a AddEvent.tsx. Gradient 135°, radius 8, papyrusový rám. */
.mna-submit.btn-gold{
  flex:0 0 auto;padding:11px 18px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);border-radius:8px;color:#000;font-family:${FONT_TITLE};
  font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  box-shadow:0 0 40px rgba(230,158,26,0.4),inset 0 1px 0 rgba(255,255,255,0.3);
  transition:transform .2s,box-shadow .22s,opacity .22s;
}
.mna-submit.btn-gold:disabled{opacity:.45;cursor:default;box-shadow:none;}

/* ── LIŠTA „UKÁŽ MIESTO" ───────────────────────────────────────────────────
   Plná tmavá výplň, nie sklo: leží nad SVETLOU mapou, kde priesvitné sklo zmizne
   (overené screenshotom pri prvej verzii — biely text na svetlozelenej mape). */
/* VÝZVA PRIBLÍŽIŤ = jediný stav, keď lišta hovorí „takto to nepôjde" (Matej 2026-08-21:
   „daj ju do červeného rámika ten čierny sa stratí"). Zlatý rám na mape splýva s okolím
   aj s vlastnou paletou; červená je jediná farba, ktorú appka inde nepoužíva na nič iné
   než na upozornenie. NEDÁVAJ ju na MapNoteHint — tá privíta, nie varuje. */

/* ── RÝCHLA PALETA PRI BODE ────────────────────────────────────────────────── */
/* Šírka je ORÁMOVANÁ, nie max-content: tri pilulky s celými názvami merajú ~470 px
   a na 390 px displeji by z panela vytiekli von. S obmedzením sa rad zalomí. */
/* ── PALETA TIEŽ DO SPODNÉHO DOKU (Matej 2026-08-24) ───────────────────────
   „pri výbere ODKAZU mi otvorí popup, treba tam scrollovať, je tam moc obsahu —
    uprav to tak, že to natiahni, resp. daj to do spodného panela ako je to pri
    2. kroku."
   Ide o tvar, nie o obsah: mriežka s NÁZVAMI ostáva. Rad holých kruhov padol
   23. 8. práve preto, že voľba schovaná za akciu je voľba, ktorú človek nevidí —
   a rozbaľovací zoznam by ju schoval znova. Šetrí sa teda na TVARE panela
   (pripútaný k hrane, plná šírka), nie na tom, čo je v ňom čitateľné. */
.mnq-wrap{position:fixed;left:0;right:0;bottom:0;z-index:1250;}
.mnq-panel{max-height:70vh;overflow-y:auto;overscroll-behavior:contain;padding:12px 14px calc(14px + env(safe-area-inset-bottom,0px));border-radius:16px 16px 0 0;background:rgba(5,5,5,0.96);backdrop-filter:blur(12px);border-top:1px solid rgba(201,154,63,0.5);box-shadow:0 -14px 40px rgba(0,0,0,0.6);}
.mnq-head{position:relative;display:flex;align-items:center;justify-content:center;min-height:30px;margin-bottom:8px;}
/* Panel je RASTÚCI ZOZNAM („tu časom vieme pridať dalšie položky") — nadpis preto
   patrí nad celý panel, nie k prvej dlaždici. */
.mnq-title{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${T.onDark};text-align:center;}
.mnq-close{position:absolute;right:0;top:50%;transform:translateY(-50%);}

/* Bod z podržania — kruh bez významu, typ sa vyberá až v palete pod ním. */
.mn-spot{width:18px;height:18px;border-radius:50%;background:rgba(5,5,5,0.55);border:2px solid rgba(245,240,228,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.5);animation:mnPulse 1.4s ease-in-out infinite;}

/* Značka počas zakladania pulzuje — odlišuje rozpracovaný zápis od uložených. */
.mn-mark--draft{animation:mnPulse 1.4s ease-in-out infinite;cursor:grab;}
.mn-mark--draft:active{cursor:grabbing;}
@keyframes mnPulse{0%,100%{box-shadow:0 2px 6px rgba(0,0,0,0.45);}50%{box-shadow:0 2px 6px rgba(0,0,0,0.45),0 0 0 7px rgba(201,154,63,0.18);}}

/* Nápoveda leží nad MAPOU, nie nad tmavou stránkou — priesvitné sklo na nej
   zmizlo (overené screenshotom: biely text na svetlozelenej mape). Preto plná
   tmavá výplň a papyrusový text, nie pk-glass. */
.mna-tip{position:fixed;left:50%;transform:translateX(-50%);bottom:96px;z-index:900;display:flex;align-items:flex-start;gap:10px;padding:10px 14px;max-width:min(92vw,420px);border-radius:14px;background:rgba(5,5,5,0.92);border:1px solid rgba(201,154,63,0.45);box-shadow:0 6px 20px rgba(0,0,0,0.5);font-family:${FONT_UI};font-size:12px;line-height:1.4;color:${T.onDark};}
.mna-tip button{flex:0 0 auto;border:0;background:transparent;color:${T.onDarkDim};font-size:15px;line-height:1;cursor:pointer;padding:0 2px;}
.mna-tip button:hover{color:${GOLD};}
@media (max-width:720px){.mna-tip{bottom:156px;}}

/* ── VÝZVA PRIBLÍŽIŤ — V MIESTE KLIKU ──────────────────────────────────────
   absolute, nie fixed: kotví sa do kontajnera mapy, lebo súradnice prichádzajú
   v jeho pixeloch. Červený rám je Matejov (21. 8.: „daj ju do červeného rámika ten
   čierny sa stratí") — červená je jediná farba, ktorú appka inde nepoužíva na nič
   iné než na upozornenie. NEDÁVAJ ju na MapNoteHint: tá privíta, nevaruje.
   pointer-events:none — bublina nesmie zjesť ďalší klik, ktorým sa človek
   pokúsi priblížiť dvojklikom. */
.mntf{position:absolute;z-index:1150;pointer-events:none;padding:10px 13px;border-radius:12px;background:rgba(5,5,5,0.94);border:1px solid ${HAZARD_RED};box-shadow:0 6px 20px rgba(0,0,0,0.5),0 0 0 1px rgba(206,75,60,0.35),0 0 18px rgba(206,75,60,0.3);font-family:${FONT_UI};font-size:12px;line-height:1.4;color:#F4C9C2;animation:mntfIn .16s ease-out;}
/* Šípka = otočený štvorec s dvomi zvýraznenými hranami. Posúva sa cez
   --mntf-arrow, aby ukazovala na bod aj keď je telo prirazené k okraju. */
.mntf::after{content:'';position:absolute;left:var(--mntf-arrow,50%);width:10px;height:10px;margin-left:-5px;background:rgba(5,5,5,0.94);transform:rotate(45deg);}
.mntf:not(.is-below)::after{bottom:-6px;border-right:1px solid ${HAZARD_RED};border-bottom:1px solid ${HAZARD_RED};}
.mntf.is-below::after{top:-6px;border-left:1px solid ${HAZARD_RED};border-top:1px solid ${HAZARD_RED};}
@keyframes mntfIn{from{opacity:0;transform:scale(.94);}to{opacity:1;transform:scale(1);}}

/* ⚠️ TENTO BLOK MUSÍ OSTAŤ POSLEDNÝ. Pravidlá v ňom majú ROVNAKÚ špecifickosť
   ako ich široké dvojičky, takže rozhoduje PORADIE v súbore. (Historicky sa na tom
   zlomil kruh druhu: media query sa vyhodnotila správne, ale neskoršie pravidlo ju
   prebilo — vyzeralo to ako nefunkčná media query, bola to kaskáda.)
   ⚠️ Rad kruhov .mna-kinds/.mna-kind 23. 8. 2026 ZANIKOL — druhy kreslí KindGrid
   (mriežka 3 stĺpce, emoji + názov), ktorá si nesie vlastné CSS. Pravidlá pre neho tu nie sú.
   ⚠️ A dôvod, prečo je tu trieda bez spätných apostrofov: toto je JS template literal,
   takže spätný apostrof v CSS komentári ho ukončí a zhodí build (CLAUDE.md, HUB_CSS). */
/* ── ÚZKY DISPLEJ ─────────────────────────────────────────────────────────
   Pri 390 px je panel 367 px široký a dva rady sa zalomia naraz. Namerané: obsah
   skočil z 366 na 447 px, teda nad strop 64vh na 667 px vysokom telefóne — panel by
   scrolloval presne tam, kde to Matej zakázal, a na širokom okne by o tom nikto nevedel.
   ⚠️ Responzívnu zmenu preto meraj v PÁSME (338/367/400/440), nie na jednej
   šírke — to je tá istá pasca ako pri psom bloku na /pack/dogs. */
@media (max-width:430px){
  .mna-sheet .mnk-tile{padding:8px 3px;}
  .mna-sheet .mnk-tile i{font-size:17px;}
  .mna-sheet .mnk-tile em{font-size:9.5px;}
  .mna-sheet .mna-tick-switch .mna-opt{font-size:9px;padding:6px 5px;letter-spacing:.04em;}
  .mna-sheet .mna-select{flex:1 1 120px;font-size:11px;padding:6px 7px;}
  .mna-sheet .mna-radius-note{font-size:10px;}
}
${MAP_SKIN !== 'pale' ? '' : `
/* ══ BLEDÝ SKIN PC (2026-08-26) ══════════════════════════════════════════════════════════
   Kartička značky sedí na spoločnom povrchu .trp-dockpanel (mapDockShape.ts), ktorý je na PC
   papyrusový — obsah tu preto nesmie ostať v onDark tokenoch. Mobil ostáva tmavý.
   ⚠️ .mna-title-kind a .mna-opt--sight/--ill si držia SVOJE farby (skupina značky, potvrdená
   choroba): tie nesú význam a menia sa len tam, kde by boli na svetlom nečitateľné.
   ⚠️ color-scheme na <select> sa musí prepnúť na light, inak WebKit kreslí rozbaľovaciu
   ponuku ďalej načierno a v papyrusovom paneli vyskočí tmavý zoznam. */
@media (min-width:${PALE_PC_MIN}px){
  /* ── HLAVNÉ CTA JE LAPIS, NIE ZLATÉ (Matej 2026-08-26: „CTA oprav máme predsa modrú") ───
     Formulár značky sa otvára Z KROKU 2 pridávania výletu, takže stojí v tom istom slede
     obrazoviek ako HOTOVO a OZNAČ — a pre ten platí Matejov lock z 24. 8.: „každý slajd musí
     mať totožné CTA, rovnaká farba a štýl". Kým tie dve zmodreli a toto ostalo zlaté, bola
     v jednom toku dvojica CTA v dvoch farbách.
     ⚠️ Len bledé PC chrome mapy. Tmavý mobil ostáva zlatý — tam je zlatá najvýraznejšia vec
     na čiernom paneli a lapis by na ňom zanikol. */
  .mna-submit.btn-gold{background:${LAPIS.grad};border-color:${LAPIS.deep};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};}
  .mna-submit.btn-gold:hover:not(:disabled){background:${LAPIS.gradHover};box-shadow:${LAPIS_BTN_SHADOW};}
  .mna-close{color:${PALE.dim};}
  .mna-close:hover{color:${PALE.deep};}
  .mna-select{color-scheme:light;color:${PALE.ink};background:${PALE.field};border-color:${PALE.border};}
  .mna-radius-label{color:${PALE.dim};}
  .mna-radius-val{color:${PALE.ink};}
  .mna-radius-note{color:${PALE.dim};}
  .mna-body{color:${PALE.ink};background:${PALE.field};border-color:${PALE.border};}
  .mna-body::placeholder{color:${PALE.dim};opacity:.75;}
  .mna-opt{color:${PALE.dim};background:${PALE.soft};border-color:${PALE.border};}
  .mna-opt.on{color:${PALE.ink};}
  .mna-pinned{color:${PALE.dim};}
  .mna-hint{color:${PALE.dim};}
  .mnq-title{color:${PALE.ink};}
}
`}

`;
