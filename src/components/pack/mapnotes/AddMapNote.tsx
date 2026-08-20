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
import { Marker } from 'react-leaflet';
import { PACK_THEME as T, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { GROUP_KINDS, bodyRequired, groupOf, type NewMapNote, type NoteGroup, type NoteKind } from './mapNotesData';
import { noteGlyphSvg } from './noteIcons';
import { GROUP_TINT, NotePalette, NOTE_PALETTE_CSS } from './NotePalette';

const GOLD = '#C99A3F';
const PARK_BLUE = T.brandBlueLite;
const BODY_MAX = 600;

/**
 * Koľko miesta si panel dole vezme. PackMap podľa toho odpanuje mapu, aby
 * značka ostala vidieť. Je to KONŠTANTA, nie meraná výška: panel sa mountuje
 * až po položení značky, takže meranie by prišlo o snímku neskoro a mapa by
 * poskočila až po tom, čo človek uvidí zlú polohu.
 */
export const NOTE_PANEL_H = 300;

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
  onMove: (lat: number, lon: number) => void;
};

/** Ťahateľná značka počas zakladania. Patrí DOVNÚTRA <MapContainer>. */
export function AddMapNotePin({ lat, lon, kind, onMove }: AddMapNotePinProps) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'mn-wrap',
        html:
          kind === 'parking'
            ? `<div class="mn-mark mn-mark--park mn-mark--draft"><span>P</span></div>`
            : `<div class="mn-mark mn-mark--round mn-mark--draft" style="--mn-tint:${GROUP_TINT[groupOf(kind)]}">${noteGlyphSvg(kind, 15)}</div>`,
      }),
    [kind],
  );

  return (
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIŠTA „UKÁŽ MIESTO" — medzi výberom typu a napísaním textu.
// Mapa je v tejto chvíli celá voľná a klikateľná; lišta len hovorí, čo sa čaká,
// a drží únik. Na mobile sedí nad spodnou navigáciou, na PC nad spodnou hranou.
// ─────────────────────────────────────────────────────────────────────────────
export function MapNotePlacing({
  group,
  ready,
  onCancel,
}: {
  group: NoteGroup;
  /** mapa je dosť priblížená na to, aby klik dával zmysel */
  ready: boolean;
  onCancel: () => void;
}) {
  const t = useT();
  const touch = typeof window !== 'undefined' && window.matchMedia('(hover:none)').matches;
  const key = !ready ? 'pack.mapNotes.place.zoomIn' : touch ? 'pack.mapNotes.place.touch' : 'pack.mapNotes.place.mouse';
  return (
    <div className="mnp-bar" role="status">
      <style>{ADD_NOTE_CSS}</style>
      <span className="mnp-dot" style={{ background: GROUP_TINT[group] }} aria-hidden />
      <span className="mnp-text">
        <b>{t(`pack.mapNotes.group.${group}`)}</b>
        {t(key)}
      </span>
      <button type="button" className="mnp-cancel" onClick={onCancel}>{t('pack.mapNotes.add.cancel')}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RÝCHLA CESTA — paleta priamo pri bode, kam človek podržal prst.
// Poradie je tu obrátené (miesto → typ), lebo gesto začalo na mieste.
// ─────────────────────────────────────────────────────────────────────────────
export function NoteQuickPalette({ onPick, onCancel }: { onPick: (g: NoteGroup) => void; onCancel: () => void }) {
  const t = useT();
  return (
    <div className="mnq-wrap" role="dialog" aria-modal="true">
      <style>{ADD_NOTE_CSS}</style>
      <style>{NOTE_PALETTE_CSS}</style>
      <div className="mnq-panel">
        <div className="mnq-head">
          <span className="mnq-eyebrow">{t('pack.mapNotes.quick.eyebrow')}</span>
          <button type="button" className="mna-close" onClick={onCancel} aria-label={t('pack.mapNotes.add.close')}>×</button>
        </div>
        <NotePalette variant="strip" onPick={onPick} />
      </div>
    </div>
  );
}

export type AddMapNotePanelProps = {
  group: NoteGroup;
  lat: number;
  lon: number;
  /** vyplnené len keď zápis vzniká z otvoreného článku výletu */
  pinnedSlug?: string | null;
  /** názov výletu na potvrdenie „patrí sem" — čisto informatívne */
  pinnedName?: string | null;
  onSubmit: (n: NewMapNote) => Promise<void>;
  onCancel: () => void;
};

export function AddMapNotePanel({
  group,
  lat,
  lon,
  pinnedSlug,
  pinnedName,
  onSubmit,
  onCancel,
}: AddMapNotePanelProps) {
  const t = useT();
  const subKinds = GROUP_KINDS[group];
  const [kind, setKind] = useState<NoteKind>(subKinds[0]);
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
        paid: kind === 'parking' ? paid : null,
        pinnedSlug: pinnedSlug ?? null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('pack.mapNotes.error'));
      setBusy(false);
    }
  };

  return (
    <div className="mna-sheet" role="dialog" aria-modal="false">
      <style>{ADD_NOTE_CSS}</style>
      <div className="mna-head">
        <span className="mna-title" style={{ color: GROUP_TINT[group] }}>{t(`pack.mapNotes.group.${group}`)}</span>
        <button type="button" className="mna-close" onClick={onCancel} aria-label={t('pack.mapNotes.add.close')}>×</button>
      </div>

      {/* Podtypy upozornenia (zver · kliešte · iné). Na mape majú JEDNU výstražnú
          značku — rozlišuje sa až tu a v bubline (viď noteIcons.ts). */}
      {subKinds.length > 1 && (
        <div className="mna-kinds">
          {subKinds.map((k) => (
            <button key={k} type="button" className={`mna-kind${kind === k ? ' on' : ''}`} onClick={() => setKind(k)}>
              {t(`pack.mapNotes.kind.${k}`)}
            </button>
          ))}
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

      {pinnedName && <p className="mna-pinned">{t('pack.mapNotes.add.pinned').replace('{trip}', pinnedName)}</p>}
      {error && <p className="mna-error">{error}</p>}

      <div className="mna-actions">
        <span className="mna-hint">{t('pack.mapNotes.add.dragHint')}</span>
        <button type="button" className="btn-gold mna-submit" onClick={submit} disabled={!canSubmit}>
          {busy ? t('pack.mapNotes.add.saving') : t('pack.mapNotes.add.submit')}
        </button>
      </div>
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
   Žiadny backdrop: mapa musí ostať vidieť aj klikateľná mimo panela. Výška je
   obmedzená (NOTE_PANEL_H), obsah sa v krajnom prípade scrolluje vnútri.
   POZOR: PLNÁ TMAVÁ VÝPLŇ, NIE sklo (pk-glass). Sklo je priehľadné a leží tu nad
   SVETLOU mapou, takže panel zbelie a text z neho zmizne (overené screenshotom —
   celý formulár bol nečitateľný nad zeleným podkladom). To isté platí pre lištu
   aj nápovedu nižšie; tmavé sklo funguje len nad tmavou stránkou. */
.mna-sheet{position:fixed;left:50%;transform:translateX(-50%);bottom:96px;z-index:1200;width:min(94vw,440px);max-height:${NOTE_PANEL_H}px;overflow-y:auto;padding:12px 14px 14px;border-radius:14px;background:rgba(5,5,5,0.94);border:1px solid rgba(201,154,63,0.5);box-shadow:0 12px 34px rgba(0,0,0,0.55);}
@media (max-width:720px){.mna-sheet{bottom:82px;}}
.mna-head{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.mna-title{font-family:${FONT_TITLE};font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;}
.mna-close{width:30px;height:30px;border:0;background:transparent;color:${T.onDarkDim};font-size:16px;line-height:1;cursor:pointer;padding:0;}
.mna-close:hover{color:${GOLD};}
.mna-kinds{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
.mna-kind{flex:1 1 0;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${T.onDarkDim};background:transparent;border:1px solid ${T.onDarkBorder};border-radius:999px;padding:6px 8px;cursor:pointer;}
.mna-kind.on{color:${GOLD};border-color:${GOLD};background:rgba(201,154,63,0.12);}
/* 16 px je minimum, pod ktorým iOS Safari pri fokuse zoomuje celú stránku —
   v mape by to znamenalo, že sa človeku pri písaní rozsype výrez. */
.mna-body{width:100%;box-sizing:border-box;margin-top:8px;font-family:${FONT_UI};font-size:16px;line-height:1.45;color:${T.onDark};background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};border-radius:8px;padding:9px 11px;resize:none;min-height:56px;}
.mna-body:focus{outline:none;border-color:${GOLD};}
.mna-body::placeholder{color:${T.onDarkDim};}
.mna-paid{display:flex;gap:6px;margin-top:8px;}
.mna-opt{flex:1 1 0;font-family:${FONT_UI};font-weight:600;font-size:11px;color:${T.onDarkDim};background:transparent;border:1px solid ${T.onDarkBorder};border-radius:999px;padding:7px 10px;cursor:pointer;}
.mna-opt.on{color:${PARK_BLUE};border-color:${PARK_BLUE};background:rgba(46,95,208,0.14);}
.mna-pinned{margin:8px 0 0;font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};}
.mna-error{margin:8px 0 0;font-family:${FONT_UI};font-size:11.5px;color:#E0796D;}
.mna-actions{display:flex;gap:10px;align-items:center;margin-top:10px;}
.mna-hint{flex:1 1 auto;font-family:${FONT_UI};font-size:10.5px;line-height:1.35;color:${T.onDarkDim};}
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
.mnp-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:96px;z-index:1200;display:flex;align-items:center;gap:10px;width:min(94vw,440px);padding:10px 12px;border-radius:14px;background:rgba(5,5,5,0.94);border:1px solid rgba(201,154,63,0.5);box-shadow:0 8px 26px rgba(0,0,0,0.55);}
@media (max-width:720px){.mnp-bar{bottom:82px;}}
.mnp-dot{flex:0 0 auto;width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 3px rgba(255,255,255,0.14);}
.mnp-text{flex:1 1 auto;font-family:${FONT_UI};font-size:11.5px;line-height:1.4;color:${T.onDark};}
.mnp-text b{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-right:7px;}
.mnp-cancel{flex:0 0 auto;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${T.onDarkDim};background:transparent;border:0;padding:6px 2px;cursor:pointer;}
.mnp-cancel:hover{color:${T.onDark};}

/* ── RÝCHLA PALETA PRI BODE ────────────────────────────────────────────────── */
/* Šírka je ORÁMOVANÁ, nie max-content: tri pilulky s celými názvami merajú ~470 px
   a na 390 px displeji by z panela vytiekli von. S obmedzením sa rad zalomí. */
.mnq-wrap{position:fixed;left:50%;transform:translateX(-50%);bottom:96px;z-index:1250;width:min(94vw,470px);}
@media (max-width:720px){.mnq-wrap{bottom:82px;}}
.mnq-panel{padding:10px 12px 12px;border-radius:14px;background:rgba(5,5,5,0.94);border:1px solid rgba(201,154,63,0.5);box-shadow:0 10px 28px rgba(0,0,0,0.55);}
.mnq-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:8px;}
.mnq-eyebrow{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${T.onDarkDim};}

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
`;
