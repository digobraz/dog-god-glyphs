// ZÁPISY DO MAPY — ZALOŽENIE ZÁPISU.
// Zadanie: `plany/zadanie-zapisy-do-mapy-2026-08-20.md` §4
//
// Komponent je rozdelený na DVE časti, lebo mapa a panel žijú v inom strome:
//   `AddMapNotePin`   → ťahateľná značka, patrí DOVNÚTRA <MapContainer>
//   `AddMapNotePanel` → formulár, patrí MIMO mapy
// Ten istý dôvod ako pri `GeometryPicker` (mapa je v PackMap.tsx, komponent do
// nej kreslí) — jeden React strom to naraz neurobí.
//
// ── PREČO JE ZNAČKA ŤAHATEĽNÁ ───────────────────────────────────────────────
// Prvý dotyk nikdy nie je presný: prst zakrýva presne to miesto, kam človek
// mieri. Zoomový prah (`MIN_ZOOM_FOR_NOTE`) je poistka, ale skutočnú presnosť
// rieši až to, že si položenú značku vie dotiahnuť. Bez toho by vznikali
// parkoviská o 30 m vedľa a nikto by ich už neopravil.
//
// ── PREČO JE TEXT POVINNÝ ───────────────────────────────────────────────────
// Matej 2026-08-20: „na výber s povinným textom a potvrdením". Značka bez textu
// je len bodka — „niečo tu je" nikomu nepomôže. Pri parkovisku je text miesto,
// kde sa povie „vojde sa 5 áut, v sezónu plné".
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { PACK_THEME as T, GLASS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import type { NewMapNote, NoteKind } from './mapNotesData';
import { noteGlyphSvg } from './noteIcons';

const GOLD = '#C99A3F';
const PARK_BLUE = T.brandBlueLite;
const BODY_MAX = 600;

// Vlna A = parkovisko (Matej: „jedná sa mi hlavne o možnosť pridať parking").
// Ostatné druhy sú v dátovom modeli aj vo vrstve hotové — sem sa pridajú vo
// vlne B, keď k nim pribudne aj obsluha oblasti (polomer).
export const WAVE_A_KINDS: NoteKind[] = ['parking'];

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
            : `<div class="mn-mark mn-mark--round mn-mark--draft" style="--mn-tint:${GOLD}">${noteGlyphSvg(kind, 15)}</div>`,
      }),
    [kind],
  );

  return (
    <Marker
      position={[lat, lon]}
      icon={icon}
      draggable
      autoPan
      eventHandlers={{
        dragend: (e) => {
          const p = (e.target as L.Marker).getLatLng();
          onMove(p.lat, p.lng);
        },
      }}
    />
  );
}

export type AddMapNotePanelProps = {
  lat: number;
  lon: number;
  /** vyplnené len keď zápis vzniká z otvoreného článku výletu */
  pinnedSlug?: string | null;
  /** názov výletu na potvrdenie „patrí sem" — čisto informatívne */
  pinnedName?: string | null;
  kinds?: NoteKind[];
  onSubmit: (n: NewMapNote) => Promise<void>;
  onCancel: () => void;
};

export function AddMapNotePanel({
  lat,
  lon,
  pinnedSlug,
  pinnedName,
  kinds = WAVE_A_KINDS,
  onSubmit,
  onCancel,
}: AddMapNotePanelProps) {
  const t = useT();
  const [kind, setKind] = useState<NoteKind>(kinds[0]);
  const [body, setBody] = useState('');
  const [paid, setPaid] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { areaRef.current?.focus(); }, []);

  const trimmed = body.trim();
  const canSubmit = trimmed.length > 0 && !busy;

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
    <div className="mna-backdrop" onClick={onCancel}>
      <style>{GLASS_CSS}</style>
      <style>{ADD_NOTE_CSS}</style>
      <div className="mna-panel pk-glass" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="mna-head">
          <span className="mna-eyebrow">{t('pack.mapNotes.add.eyebrow')}</span>
          <button type="button" className="mna-close" onClick={onCancel} aria-label={t('pack.mapNotes.add.close')}>×</button>
        </div>

        {kinds.length > 1 && (
          <div className="mna-kinds">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                className={`mna-kind${kind === k ? ' on' : ''}`}
                onClick={() => setKind(k)}
              >
                {t(`pack.mapNotes.kind.${k}`)}
              </button>
            ))}
          </div>
        )}

        <h3 className="mna-title" style={{ color: kind === 'parking' ? PARK_BLUE : GOLD }}>
          {t(`pack.mapNotes.kind.${kind}`)}
        </h3>

        {/* Nápoveda k ťahaniu — bez nej človek netuší, že sa značka dá dotiahnuť. */}
        <p className="mna-hint">{t('pack.mapNotes.add.dragHint')}</p>

        <textarea
          ref={areaRef}
          className="mna-body"
          value={body}
          maxLength={BODY_MAX}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t(`pack.mapNotes.add.placeholder.${kind}`)}
          rows={3}
        />
        <div className="mna-count">{trimmed.length}/{BODY_MAX}</div>

        {kind === 'parking' && (
          <div className="mna-paid">
            <span className="mna-paid-label">{t('pack.mapNotes.parking.question')}</span>
            <div className="mna-paid-opts">
              <button type="button" className={`mna-opt${paid === false ? ' on' : ''}`} onClick={() => setPaid(paid === false ? null : false)}>
                {t('pack.mapNotes.parking.free')}
              </button>
              <button type="button" className={`mna-opt${paid === true ? ' on' : ''}`} onClick={() => setPaid(paid === true ? null : true)}>
                {t('pack.mapNotes.parking.paid')}
              </button>
            </div>
          </div>
        )}

        {pinnedName && <p className="mna-pinned">{t('pack.mapNotes.add.pinned').replace('{trip}', pinnedName)}</p>}

        {error && <p className="mna-error">{error}</p>}

        <div className="mna-actions">
          <button type="button" className="mna-cancel" onClick={onCancel} disabled={busy}>
            {t('pack.mapNotes.add.cancel')}
          </button>
          <button type="button" className="btn-gold mna-submit" onClick={submit} disabled={!canSubmit}>
            {busy ? t('pack.mapNotes.add.saving') : t('pack.mapNotes.add.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Jednorazová nápoveda, že sa po mape dá písať.
 *
 * ⚠️ Matej to chcel vysvetliť vo wizardovi, lenže **wizard je parkovaný na po
 * launchi** — nápoveda preto musí stáť sama. Keď wizard príde, len to zopakuje.
 * Na mobile je to jediný spôsob, ako sa človek o geste dozvie: kurzor tam nie je,
 * takže „plusko pri kurzore" nemá kde svietiť.
 */
export function MapNoteHint({ onDismiss }: { onDismiss: () => void }) {
  const t = useT();
  return (
    <div className="mna-tip pk-glass" role="status">
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
/* Na mobile panel dosadá naspodok, takže potrebuje rezervu na spodný nav —
   bez nej leží CTA "zapísať na mapu" pod ním (overené na 390 px).
   Krytie 0.72 (nie 0.55): cez slabšie presvitali zlaté tlačidlá LIST/ADD
   a bili sa s pilulkami zdarma/platené priamo v paneli. */
.mna-backdrop{position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,0.72);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center;padding:16px 16px 104px;}
@media (min-width:721px){.mna-backdrop{align-items:center;padding:20px;}}
.mna-panel{position:relative;width:100%;max-width:420px;padding:18px 20px 20px;}
.mna-head{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.mna-eyebrow{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${T.onDarkDim};}
.mna-close{width:32px;height:32px;border:0;background:transparent;color:${T.onDarkDim};font-size:16px;line-height:1;cursor:pointer;padding:0;}
.mna-close:hover{color:${GOLD};}
.mna-kinds{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;}
.mna-kind{flex:1 1 0;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${T.onDarkDim};background:transparent;border:1px solid ${T.onDarkBorder};border-radius:999px;padding:7px 10px;cursor:pointer;}
.mna-kind.on{color:${GOLD};border-color:${GOLD};background:rgba(201,154,63,0.12);}
.mna-title{font-family:${FONT_TITLE};font-weight:700;font-size:17px;letter-spacing:.06em;text-transform:uppercase;margin:10px 0 4px;}
.mna-hint{margin:0 0 12px;font-family:${FONT_UI};font-size:11.5px;line-height:1.45;color:${T.onDarkDim};}
/* 16 px je minimum, pod ktorým iOS Safari pri fokuse zoomuje celú stránku —
   v mape by to znamenalo, že sa človeku pri písaní rozsype výrez. */
.mna-body{width:100%;box-sizing:border-box;font-family:${FONT_UI};font-size:16px;line-height:1.5;color:${T.onDark};background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:8px;padding:10px 12px;resize:vertical;min-height:76px;}
.mna-body:focus{outline:none;border-color:${GOLD};}
.mna-body::placeholder{color:${T.onDarkDim};}
.mna-count{text-align:right;font-family:${FONT_UI};font-size:10px;color:${T.onDarkDim};margin-top:4px;}
.mna-paid{margin-top:12px;}
.mna-paid-label{display:block;font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:6px;}
.mna-paid-opts{display:flex;gap:6px;}
.mna-opt{flex:1 1 0;font-family:${FONT_UI};font-weight:600;font-size:11px;color:${T.onDarkDim};background:transparent;border:1px solid ${T.onDarkBorder};border-radius:999px;padding:8px 10px;cursor:pointer;}
.mna-opt.on{color:${PARK_BLUE};border-color:${PARK_BLUE};background:rgba(46,95,208,0.14);}
.mna-pinned{margin:12px 0 0;font-family:${FONT_UI};font-size:11px;color:${T.onDarkDim};}
.mna-error{margin:10px 0 0;font-family:${FONT_UI};font-size:11.5px;color:#E0796D;}
.mna-actions{display:flex;gap:10px;align-items:center;margin-top:16px;}
.mna-cancel{flex:0 0 auto;font-family:${FONT_UI};font-weight:600;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${T.onDarkDim};background:transparent;border:0;padding:10px 4px;cursor:pointer;}
.mna-cancel:hover{color:${T.onDark};}
/* CTA (brand v3.2 LOCKED): .btn-gold sa nikde neimportuje globálne (žije v
   SpiralLanding.css) — lokálna kópia hodnôt 1:1, rovnaký zavedený vzor ako
   AddTripPlan.tsx a AddEvent.tsx. Gradient 135°, radius 8, papyrusový rám. */
.mna-submit.btn-gold{
  flex:1 1 auto;padding:12px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);border-radius:8px;color:#000;font-family:${FONT_TITLE};
  font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  box-shadow:0 0 40px rgba(230,158,26,0.4),inset 0 1px 0 rgba(255,255,255,0.3);
  transition:transform .2s,box-shadow .22s,opacity .22s;
}
.mna-submit.btn-gold:disabled{opacity:.45;cursor:default;box-shadow:none;}
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
