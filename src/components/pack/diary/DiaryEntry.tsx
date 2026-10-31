// ════════════════════════════════════════════════════════════════════════════
// DO DENNÍKA — pisateľ, na ktorý kalendár od 12. 9. 2026 čakal. KROK 5 bloku 2.
//
// Zadanie: `plany/zadanie-pack-plus-lista-DALSIA-SESSION.md` §3 KROK 5.
// Register: `createRegistry.ts` → `diary` (handler `diary.write`) a `photo` (`diary.photo`).
// Model:    `./diaryModel.ts` — čipy, polia, emoji a pravidlo dátumu na JEDNOM mieste.
//
// 🔴 JE TO PREKRYVOVÁ VRSTVA, NIE ROUTA — zámerne. Lock `architektura-pack.md` §4.2:
//    akcia nikdy neodnesie človeka preč z miesta, kde je. Zápis do denníka sa robí
//    nad `/pack/dogs` a človek po uložení stojí tam, kde stál. Preto je v registri
//    `{ kind: 'handler' }`, nie `{ kind: 'route' }`.
//
// 🔴 PLÁN A ZÁPIS NIE SÚ DVE DLAŽDICE. Rozhoduje DÁTUM vnútri toku (minulý a dnešok =
//    stalo sa, budúci = plán). To isté pravidlo má výlet — rovnaké pravidlo dvakrát je
//    zámer, nie duplicita.
//
// ⚠️ FOTKA NIE JE SAMOSTATNÝ OBJEKT. Je príloha zápisu: adresa v `dog_events.value.photo`.
//    Človek pridáva udalosť, nie priečinok. Vchod `mode='photo'` je ten ISTÝ formulár,
//    len otvorený pri fotke — nie druhá obrazovka. (Tabuľka `dog_photos` NEEXISTUJE
//    a nezakladá sa; piate miesto na údaje o psovi nepribudne — CLAUDE.md.)
//
// ⚠️ POVRCH JE PAPYRUS, nie čierne sklo. `AddTripEntry` je sklo, lebo žije nad Portalom;
//    tento formulár stojí nad `/pack/dogs`. Tvar je prevzatý z `cal-pop` (popup dňa
//    kalendára) — je to ten istý papier na tej istej stránke.
//    Hlavné CTA je LAPIS (brandový kánon 28. 8. 2026: na bledom podklade lapis).
//    Výber čipu je PRIESVITNÝ TINT, nie plná farba (26. 8. 2026) — plná plocha patrí
//    jedinému hlavnému CTA na obrazovke a to je ZAPÍSAŤ.
//
// ⚠️ JE TO JS TEMPLATE LITERAL (CSS nižšie): spätný apostrof v komentári zhodí build
//    a `tsc` to nechytí. Po zásahu `npm run check:css` z `vystupy/web/`.
// ════════════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, GOLD_BTN, MODAL_MAX_H,
  FONT_TITLE, FONT_UI, PF_FIELD_CSS, PILL_CSS, PHOTO_CSS,
} from '@/components/pack/packTheme';
import { PackPopup } from '@/components/pack/PackPopup';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, tintRGBA } from '@/components/pack/navGoldSkin';
import { appendDogEvents, updateDiaryEvent } from '@/lib/dogEvents';
import { compressFile } from '@/lib/photoIntake';
import { uploadDogDiaryPhoto } from '@/services/cloudinaryService';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { toast } from '@/hooks/use-toast';
import {
  DIARY_CHIPS, asDiaryValue, chipOf, dayToRecordedAt, diaryEvent, isPlanDay, todayKey, type DiaryKind,
} from './diaryModel';
import { useBackClose } from './useBackClose';
import { useKeyboardLift, kbLiftCSS } from './useKeyboardLift';

const T = PACK_THEME;
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
/** KONCEPT (audit 30. 10. 2026): rozpísaný zápis prežije zatvorenie okna aj obnovu aplikácie. Fotka sa neukladá. */
const DRAFT_KEY = 'dogypt-diary-draft-v1';

type Tx = (key: string, fallback: string) => string;

export type DiaryDog = { id: string; name: string };

/** Zápis, ktorý sa UPRAVUJE (Kronika). Pes a druh sa nemenia — meniť sa dá text, fotka a deň. */
export type DiaryEditTarget = { id: string; dogId: string; field: string; value: unknown; recordedAt: string };

export type DiaryEntryProps = {
  dogs: DiaryDog[];
  /** Predvyplnený pes. Prázdne = prvý zo zoznamu. */
  dogId?: string;
  /** Predvyplnený deň `YYYY-MM-DD` — popup dňa kalendára posiela ten svoj. */
  day?: string;
  /** `photo` = ten istý formulár otvorený pri fotke (vchod `diary.photo` z registra). */
  mode?: 'write' | 'photo';
  /** Úprava existujúceho zápisu (bez konceptu, bez výberu psa a druhu). */
  edit?: DiaryEditTarget;
  onClose: () => void;
  /** Zavolá sa po úspešnom zápise — volajúci si prekreslí kalendár. */
  onSaved?: () => void;
  tx: Tx;
};

type Draft = { dog?: string; kind?: DiaryKind; text?: string; kg?: string };
function readDraft(): Draft | null {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') as Draft | null; } catch { return null; }
}
function dayKeyOfIso(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

type PhotoState = { preview: string; url: string | null; busy: boolean; blob: Blob | null };

export function DiaryEntry({ dogs, dogId, day, mode = 'write', edit, onClose, onSaved, tx }: DiaryEntryProps) {
  const editChip = edit ? DIARY_CHIPS.find((c) => c.field === edit.field) : undefined;
  const editVal = edit ? asDiaryValue(edit.value) : null;
  // Koncept sa obnovuje len pri NOVOM zápise; popup dňa z kalendára si deň drží sám.
  const draft = useRef<Draft | null>(edit ? null : readDraft()).current;
  const draftDog = draft?.dog && dogs.some((g) => g.id === draft.dog) ? draft.dog : undefined;

  const [dog, setDog] = useState<string>(edit?.dogId ?? dogId ?? draftDog ?? dogs[0]?.id ?? '');
  const [kind, setKind] = useState<DiaryKind>(editChip?.id ?? draft?.kind ?? 'note');
  const [dayKey, setDayKey] = useState<string>(edit ? dayKeyOfIso(edit.recordedAt) : (day ?? todayKey()));
  const [text, setText] = useState(editVal?.text ?? draft?.text ?? '');
  const [kg, setKg] = useState(draft?.kg ?? '');
  const [photo, setPhoto] = useState<PhotoState | null>(
    editVal?.photo ? { preview: editVal.photo, url: editVal.photo, busy: false, blob: null } : null,
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [askDiscard, setAskDiscard] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoSeq = useRef(0);

  const chip = chipOf(kind);
  const plan = isPlanDay(dayKey);
  useFlowKeyboardFix();
  useKeyboardLift();

  // KONCEPT — zapisuje sa pri každej zmene, maže po uložení alebo „Zahodiť".
  const restored = useRef(false);
  useEffect(() => {
    if (edit) return;
    if (!restored.current) { restored.current = true; return; }   // prvý beh = obnova, nie zmena
    try {
      if (text.trim() || kg.trim()) localStorage.setItem(DRAFT_KEY, JSON.stringify({ dog, kind, text, kg }));
      else localStorage.removeItem(DRAFT_KEY);
    } catch { /* súkromné okno / kvóta — bez konceptu */ }
  }, [edit, dog, kind, text, kg]);
  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* nič */ } };

  // ZATVORENIE (úchyt, ťuk vedľa, Esc, gesto späť) = jedna cesta. S rozpísaným obsahom sa najprv
  // opýta inline „Zahodiť?" (nie confirm()); koncept ostáva v úložisku, kým človek nepovie Zahodiť.
  const dirty = edit
    ? (text !== (editVal?.text ?? '') || (photo?.url ?? null) !== (editVal?.photo ?? null))
    : text.trim().length > 0 || kg.trim().length > 0 || !!photo;
  const requestClose = () => {
    if (saving) return;
    if (dirty && !askDiscard) { setAskDiscard(true); return; }
    onClose();
  };
  const closeRef = useRef(requestClose);
  closeRef.current = requestClose;
  const close = useCallback(() => closeRef.current(), []);
  useBackClose(close);
  const discard = () => { if (!edit) clearDraft(); onClose(); };

  // Vchod „fotka" otvorí systémový výber hneď — inak je to len prázdny formulár
  // s malým tlačidlom a človek, ktorý klikol na FOTKU, musí kliknúť druhý raz.
  const openedPicker = useRef(false);
  useEffect(() => {
    if (mode !== 'photo' || openedPicker.current) return;
    openedPicker.current = true;
    fileRef.current?.click();
  }, [mode]);

  // Náhľad je blob adresa — po zavretí ju treba uvoľniť, inak ju prehliadač drží
  // do konca session (`photoIntake.ts` má ten istý problém popísaný).
  useEffect(() => () => { if (photo?.preview.startsWith('blob:')) URL.revokeObjectURL(photo.preview); }, [photo?.preview]);

  const canSave = useMemo(() => {
    if (!dog || saving) return false;
    // 🔴 Počas nahrávania fotky sa neukladá — zápis by odišiel bez nej (audit 30. 10. 2026).
    if (photo?.busy) return false;
    if (chip.input === 'number') return !Number.isNaN(parseFloat(kg)) && parseFloat(kg) > 0;
    // Zápis bez textu je legitímny, KEĎ nesie fotku — „takto vyzeral dnes" je celý obsah.
    return text.trim().length > 0 || !!photo?.url;
  }, [dog, saving, chip.input, kg, text, photo?.url, photo?.busy]);

  /** Nahrá hotový blob do priečinka PSA, ktorého sa zápis týka (nie toho, čo bol vybraný pri výbere súboru). */
  async function uploadFor(blob: Blob, preview: string, forDog: string): Promise<void> {
    const seq = ++photoSeq.current;
    setPhoto({ preview, url: null, busy: true, blob });
    try {
      const stamp = `${dayKey}-${Date.now()}`;
      const { secureUrl } = await uploadDogDiaryPhoto(blob, forDog, stamp);
      if (seq === photoSeq.current) setPhoto({ preview, url: secureUrl, busy: false, blob });
    } catch {
      // 🔴 NEUKLADÁ SA blob adresa. Prežije prechod medzi obrazovkami, ale nie reload
      //    ani iné zariadenie — zápis s ňou by v denníku ostal ako mŕtvy odkaz
      //    (tá istá pasca, ktorú lieči `photoIntake.ts`).
      if (seq !== photoSeq.current) return;
      setPhoto({ preview, url: null, busy: false, blob });
      setErr(tx('pack.diary.photoFailed', 'The photo could not be uploaded. You can save the entry without it.'));
    }
  }

  async function pickPhoto(file: File): Promise<void> {
    setErr(null);
    let compressed: { url: string; blob: Blob };
    try {
      compressed = await compressFile(file);
    } catch {
      setErr(tx('pack.diary.photoPrep', 'The photo could not be prepared. Try another one.'));
      return;
    }
    await uploadFor(compressed.blob, compressed.url, dog);
  }

  /** Iný pes = fotka patrí do jeho priečinka, preto sa nahrá znova z toho istého blobu. */
  function pickDog(id: string): void {
    if (id === dog) return;
    setDog(id);
    if (photo?.blob) void uploadFor(photo.blob, photo.preview, id);
  }

  async function save(): Promise<void> {
    if (!canSave) return;
    setSaving(true);
    setErr(null);
    try {
      let res: 'saved' | 'queued' = 'saved';
      if (edit) {
        await updateDiaryEvent(edit.id, {
          value: { text: text.trim(), ...(photo?.url ? { photo: photo.url } : {}) },
          recordedAt: dayToRecordedAt(dayKey),
        });
      } else {
        res = await appendDogEvents([diaryEvent(dog, chip, dayKey, {
          text: text.trim(),
          photo: photo?.url ?? undefined,
          number: chip.input === 'number' ? parseFloat(kg) : undefined,
        })]);
        clearDraft();
      }
      toast({
        title: res === 'queued'
          ? tx('pack.diary.savedOffline', 'It will be saved when you are online.')
          : edit ? tx('pack.diary.editedToast', 'Entry updated.')
            : plan ? tx('pack.diary.plannedToast', 'Planned.') : tx('pack.diary.savedToast', 'Written down.'),
      });
      onSaved?.();
      onClose();
    } catch {
      setErr(tx('pack.diary.saveFailed', 'The entry could not be saved. Try again.'));
      setSaving(false);
    }
  }

  const btnBase: CSSProperties = {
    borderRadius: PACK_R.field,
    padding: `${PACK_SPACE.md}px ${PACK_SPACE.lg}px`,
    fontFamily: FONT_TITLE,
    // 🔴 12, NIE 11. Stupnica `PACK_TEXT` nemá 11 a stráž `check:pack` ju meria —
    //    jedenástka v okolitých CTA je stará odchýlka zo základne, nie vzor.
    fontSize: PACK_TEXT.label,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  // 🔴 OKNO = `<PackPopup>` (audit 30. 10. 2026, lock POPUP 26. 10.): mobil šuplík zdola s úchytom, PC okno
  //    v strede, BEZ šípky a BEZ tlačidla ZRUŠIŤ — von sa ide stiahnutím, ťukom vedľa, Esc alebo gestom späť.
  //    Portál do `document.body` rieši PackPopup (obsahový stĺpec `/pack` je vlastný stacking kontext).
  return (
    <PackPopup
      title={edit ? tx('pack.diary.editTitle', 'Edit entry') : tx('pack.diary.title', 'To the diary')}
      onClose={close}
      className="dia-sheet"
    >
      <div className="dia-form">
        <style>{PF_FIELD_CSS}{PILL_CSS}{PHOTO_CSS}{DIARY_CSS}{kbLiftCSS('dia-sheet', MODAL_MAX_H)}</style>

        {/* KTORÉHO PSA. Jeden pes = žiadny výber; dva a viac = pilulky.
            Rovnaké pravidlo ako filter psa v kalendári — prepínač s jednou polohou
            je nábytok, ktorý nič neprepína. Pri úprave sa pes nemení. */}
        {!edit && dogs.length > 1 && (
          <div className="dia-row">
            {dogs.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`pk-pill pk-pill--tap${g.id === dog ? ' dia-on' : ''}`}
                style={g.id === dog ? pickStyle : undefined}
                onClick={() => pickDog(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        {/* ČO ZAPISUJEM. Čipy sú z registra `DIARY_CHIPS` — nový druh zápisu sa
            pridáva TAM, nie sem. Pri úprave sa druh nemení. */}
        {!edit && (
          <div className="dia-row" style={{ marginTop: PACK_SPACE.md }}>
            {DIARY_CHIPS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`pk-pill pk-pill--tap${c.id === kind ? ' dia-on' : ''}`}
                style={c.id === kind ? pickStyle : undefined}
                onClick={() => { setKind(c.id); setErr(null); }}
              >
                <span style={{ fontFamily: EMOJI_FONT }}>{c.emoji}</span>
                {tx(c.labelKey, c.labelFallback)}
              </button>
            ))}
          </div>
        )}

        {/* KEDY. Dátum je jediný prepínač medzi zápisom a plánom, preto stojí NAD
            obsahom — človek má vedieť, čo robí, skôr než začne písať. */}
        <label className="dia-lbl" htmlFor="dia-day">{tx('pack.diary.when', 'When')}</label>
        <input
          id="dia-day"
          className="pf-field dia-inp"
          type="date"
          value={dayKey}
          onChange={(e) => setDayKey(e.target.value || todayKey())}
        />
        <p className="dia-hint">
          {plan
            ? tx('pack.diary.isPlan', 'Future date — this becomes a plan in the calendar.')
            : tx('pack.diary.isLog', 'Past date — this is a diary entry.')}
        </p>

        {/* ČO. Váha je číslo, zvyšok je text. */}
        {chip.input === 'number' ? (
          <>
            <label className="dia-lbl" htmlFor="dia-kg">{tx(chip.labelKey, chip.labelFallback)}</label>
            <input
              id="dia-kg"
              className="pf-field dia-inp"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              placeholder={tx(chip.hintKey, chip.hintFallback)}
              value={kg}
              onChange={(e) => setKg(e.target.value)}
            />
          </>
        ) : (
          <>
            {/* ⚠️ POPISOK JE MENO ČIPU, PRÍKLAD JE V POLI. Kým bol popiskom príklad,
                stálo nad prázdnym poľom veľkými „FIRST SWIM, GOTCHA DAY, A WIN" —
                eyebrow je krátke slovo, nie veta, a rozstrelené verzálky z príkladu
                spravili krik. Placeholder na to matrica `.pf-field` už má. */}
            <label className="dia-lbl" htmlFor="dia-text">{tx(chip.labelKey, chip.labelFallback)}</label>
            <textarea
              id="dia-text"
              className="pf-field dia-inp dia-area"
              rows={6}
              placeholder={tx(chip.hintKey, chip.hintFallback)}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </>
        )}

        {/* FOTKA — príloha zápisu, nie samostatný objekt. Pri vážení sa nekreslí:
            `value` váženia musí ostať holé číslo (viď `diaryModel.ts`). */}
        {chip.photo && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void pickPhoto(f); e.target.value = ''; }}
            />
            {photo ? (
              <div className="dia-photo">
                <div className="pk-photo" style={{ width: 72, height: 72, flex: '0 0 auto' }}>
                  <img src={photo.preview} alt="" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="dia-hint" style={{ margin: 0 }}>
                    {photo.busy
                      ? tx('pack.diary.photoBusy', 'Uploading…')
                      : photo.url
                        ? tx('pack.diary.photoReady', 'Photo attached.')
                        : tx('pack.diary.photoOff', 'Not uploaded — the entry will be saved without it.')}
                  </p>
                  <button
                    type="button"
                    className="dia-link"
                    onClick={() => { photoSeq.current++; setPhoto(null); }}
                  >
                    {tx('pack.diary.photoRemove', 'Remove')}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="pk-pill pk-pill--tap dia-add" onClick={() => fileRef.current?.click()}>
                <span style={{ fontFamily: EMOJI_FONT }}>📷</span>
                {tx('pack.diary.photoAdd', 'Add a photo')}
              </button>
            )}
          </>
        )}

        {err && <p className="dia-err" role="alert">{err}</p>}

        {/* ZAHODIŤ? — inline otázka namiesto browser confirm(), ten istý tvar ako v MeCompose. */}
        {askDiscard && (
          <div className="dia-ask" role="alertdialog" aria-label={tx('pack.compose.discardQ', 'Discard?')}>
            <span>{tx('pack.compose.discardQ', 'Discard?')}</span>
            <button type="button" onClick={discard}>{tx('pack.compose.discard', 'Discard')}</button>
            <button type="button" className="no" onClick={() => setAskDiscard(false)}>{tx('pack.compose.keepWriting', 'Keep writing')}</button>
          </div>
        )}

        <div className="dia-btns">
          <button
            type="button"
            className="dia-primary"
            disabled={!canSave}
            onClick={() => void save()}
            style={{
              ...btnBase,
              background: LAPIS.grad,
              border: `1px solid ${GOLD_BTN.edge}`,
              color: LAPIS.ink,
              boxShadow: LAPIS_BTN_SHADOW,
              opacity: canSave ? 1 : 0.45,
              cursor: canSave ? 'pointer' : 'default',
            }}
          >
            {saving
              ? tx('pack.diary.saving', 'Saving…')
              : edit ? tx('pack.diary.saveEdit', 'Save changes')
                : plan ? tx('pack.diary.savePlan', 'Plan it') : tx('pack.diary.save', 'Write it down')}
          </button>
        </div>
      </div>
    </PackPopup>
  );
}

/** VÝBER JE PRIESVITNÝ TINT (lock 26. 8. 2026), nie plná lapisová plocha — tá patrí
 *  jedinému hlavnému CTA na obrazovke a tým je ZAPÍSAŤ. Čitateľnosť nesie tmavý
 *  inkoust a plný farebný rám, nie krytie výplne. */
const pickStyle: CSSProperties = {
  background: LAPIS.fill,
  borderColor: LAPIS.edge,
  boxShadow: `inset 0 0 0 1px ${tintRGBA(LAPIS.edge, 0.45)}`,
  color: PICK_INK.lapis,
};

/** Rozmery sú z matríc `PACK_R` / `PACK_SPACE` / `PACK_TEXT` — číslo mimo stupnice
 *  je bug, nie štýl, a zhodí `npm run check:pack`. */
export const DIARY_CSS = `
.dia-bg{position:fixed;inset:0;background:rgba(20,12,4,.55);display:flex;
  padding:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.lg}px) ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;z-index:70;overflow-y:auto;
  padding-bottom:calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.lg}px + var(--consent-h, 0px))}
.dia-pop{background:${PACK_BOX.panel.background};border:${PACK_BOX.panel.border};
  border-radius:${PACK_BOX.panel.borderRadius}px;box-shadow:${PACK_BOX.panel.boxShadow};
  padding:${PACK_SPACE.lg}px;max-width:420px;width:100%;margin:auto;max-height:calc(100dvh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - ${PACK_SPACE.xxl}px - var(--consent-h, 0px));
  overflow-y:auto}
/* 🔴 CENTRUJE margin:auto NA DIEŤATI, nie align-items:center na rodičovi s overflow-y:auto
   (CLAUDE.md, PAGE_AIR): pretečenie by sa rozdelilo na obe strany a hornú časť by sa nedalo
   odrolovať. Zmenené 8. 10. 2026 pri roztiahnutí okna písania.
   ✍️ OKNO PÍSANIA = 640 px a vysoké pole (Matej 8. 10.: „popup na písanie centrovať a roztiahnuť,
   nech je veľký priestor"). 640 je šírka FORMULÁRA PÍSANIA z locku stĺpca (pack-dizajn-system). */
.dia-pop--write{max-width:640px}
.dia-pop--write .dia-area{min-height:40vh}
.dia-form .dia-area{min-height:min(24dvh,180px)}
.dia-pop h4{font-family:${FONT_TITLE};font-size:${PACK_HEAD.card.fontSize}px;font-weight:700;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  margin:0 0 ${PACK_SPACE.md}px;color:${T.inkStrong}}
.dia-row{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px}
.dia-row .pk-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px}
.dia-lbl{display:block;font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${T.inkWarm};
  margin:${PACK_SPACE.lg}px 0 ${PACK_SPACE.xs}px}
.dia-inp{width:100%;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;
  color:${T.inkStrong};font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color-scheme:light}
/* color-scheme:light: bez neho kreslil prehliadac ikonku kalendara v datumovom poli BIELU
   na papyruse (Matej 8. 10.). Ten isty recept ako .tl-dateinput v triliste. */
.dia-area{resize:vertical;min-height:72px;line-height:1.5}
.dia-hint{font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;line-height:1.55;
  color:${T.inkFaint};margin:${PACK_SPACE.xs}px 0 0}
.dia-err{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.5;
  color:#B25640;margin:${PACK_SPACE.md}px 0 0}
.dia-add{margin-top:${PACK_SPACE.lg}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px}
.dia-photo{display:flex;gap:${PACK_SPACE.md}px;align-items:center;margin-top:${PACK_SPACE.lg}px}
.dia-link{background:none;border:0;padding:0;margin-top:${PACK_SPACE.xs}px;cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:0.14em;
  text-transform:uppercase;color:${LAPIS.edge};text-decoration:underline}
/* Rad tlačidiel: na širokom povrchu vedľa seba, na mobile primárne cez celú šírku.
   Hranica 720 px je tá istá, akú drží psí blok na /pack/dogs — jedno číslo naprieč appkou. */
.dia-btns{display:flex;gap:${PACK_SPACE.sm}px;flex-wrap:wrap;margin-top:${PACK_SPACE.xl}px}
.dia-btns > button{flex:1 1 auto}
.dia-ask{display:flex;align-items:center;gap:${PACK_SPACE.md}px;flex-wrap:wrap;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;margin-top:${PACK_SPACE.lg}px;
  border-radius:${PACK_R.tile}px;border:1.5px solid ${T.cardEdge};background:${T.card}}
.dia-ask span{flex:1 1 100%;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.body}px;color:${T.inkStrong}}
.dia-ask button{border-radius:${PACK_R.field}px;cursor:pointer;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;font-family:${FONT_UI};font-weight:600;
  font-size:${PACK_TEXT.label}px;border:1.5px solid ${T.border};background:${T.card};color:${T.inkStrong}}
.dia-ask button.no{border-color:${LAPIS.edge};color:${LAPIS.edge}}
@media (max-width:720px){ .dia-btns > .dia-primary{flex:1 1 100%} }
`;
