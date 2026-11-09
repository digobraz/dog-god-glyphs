// NÚDZOVÁ KARTIČKA `/pack/dogs/:id/karticka` (kôš 3). Matej 5. 11. 2026: „foto psa tam musí byť naša editovateľná a väčšia".
// Údaje sa predvyplnia z DOG ID, ale úprava ostáva LEN v tomto zariadení (localStorage): DOG ID sa odtiaľto nikdy neprepíše
// a adresa ani vlastná fotka nejdú na server.
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent as RPE, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { readLatest, hasValue, type LatestValue } from '@/lib/dogEvents';
import { FLOW_SCREENS } from '@/components/pack/dogid/flowData.generated';
import { blobToDataUrl, toDataUrl } from '@/lib/sheetPdf';
import { cardDraftKey } from './cardDraft';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { STEP_BY_FIELD } from '@/components/pack/dogQuiz';
import { passPlainValue } from '@/components/pack/DogPassport';
import { sizedUrl } from '@/services/cloudinaryService';
import { compressFile } from '@/lib/photoIntake';
import { FONT_UI, PACK_BOX, PACK_SPACE, PACK_TEXT, PACK_THEME as T } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { SosTaskShell } from '@/components/pack/sos/SosTaskShell';
import { useSosT } from '@/components/pack/sos/sosShared';
import { CARD_CSS, CardBack, CardFront, type CardContact, type CardData, type CardGlyph, type CardPhoto } from './EmergencyCard';
import { CARD_LANGS, cardIsRtl, cardLangOf, cardTexts, cardUi } from './cardTexts';
import { exportEmergencyCardPdf, shareEmergencyCardImage } from './emergencyCardPdf';

const PHOTO_MAX = 3;
const CONTACTS_MAX = 3;
const NOTE_MAX = 130; // 2 až 3 vety, viac sa na zadnú stranu nezmestí

const CSS = `
${CARD_CSS}
.ecp-title{margin:0;}
html.papyrus3d .ecp-btn.sos-cta{width:100%;min-height:56px;padding:0 ${PACK_SPACE.lg}px;border:2.5px solid var(--b3-l);border-radius:var(--b3-r);background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);box-shadow:var(--p3d-b3);font:400 ${PACK_TEXT.h2}px/1 'LT Museum',serif;letter-spacing:0;text-transform:none;} /* písmo: cta */
html.papyrus3d .ecp-btn--sm.sos-cta{min-height:48px;font-size:${PACK_TEXT.lead}px;}
html.papyrus3d .ecp-title{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:0;text-transform:none;} /* písmo: nadpis */
html.papyrus3d .ecp-link{color:${LAPIS.edge};text-decoration:underline;}
.ecp-prev{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;width:100%;max-width:480px;margin:0 auto;}
.ecp-prev .ec-ph{cursor:grab;}
.ecp-prev .ec-ph:active{cursor:grabbing;}
.ecp-photo{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px;}
.ecp-zoom{display:flex;align-items:center;gap:${PACK_SPACE.md}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.ecp-zoom input{flex:1;accent-color:${LAPIS.edge};min-height:44px;}
.ecp-note{margin:0;font-size:${PACK_TEXT.label}px;line-height:1.45;color:${T.inkWarm};text-align:center;}
.ecp-fields{display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.ecp-two{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.md}px;}
/* HÁROK NA TLAČ: A4 pri 96 dpi, mimo obrazovky. Pár kartičiek má presne 171,2 × 54 mm. */
.ecs{position:fixed;left:-99999px;top:0;width:794px;height:1123px;background:#FFFFFF;color:${T.inkStrong};font-family:${FONT_UI};box-sizing:border-box;padding:48px 0;display:flex;flex-direction:column;align-items:center;}
.ecs h2{margin:48px 0 32px;text-align:center;font-size:16px;font-weight:600;}
.ecs-pair{position:relative;display:flex;width:648px;}
.ecs-pair .ec{flex:none;width:324px;}
.ecs-fold{position:absolute;left:50%;top:-16px;bottom:-16px;border-left:1px dashed ${T.inkWarm};}
.ecs ol{width:648px;box-sizing:border-box;margin:48px 0 0;padding-left:24px;list-style:decimal;font-size:14px;line-height:1.8;}
.ecs small{width:648px;display:block;margin-top:24px;font-size:12px;color:${T.inkWarm};}
/* OBRÁZOK NA ZDIEĽANIE: obe strany pod sebou, mimo obrazovky. */
.ecshare{position:fixed;left:-99999px;top:0;width:648px;background:#FFFFFF;box-sizing:border-box;padding:24px;display:flex;flex-direction:column;gap:24px;}
.ecp-contact{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.md}px;}
.ecp-link{all:unset;cursor:pointer;align-self:center;padding:${PACK_SPACE.sm}px;font:500 ${PACK_TEXT.label}px/1.4 ${FONT_UI};color:${T.inkWarm};text-decoration:underline;text-underline-offset:4px;}
`;

type DogRow = {
  dog_name: string | null; cloudinary_main_url: string | null; patron_svg: string | null; life_status: string | null;
  selections: Record<string, string> | null; owner_name: string | null;
};
// Do konceptu ide LEN to, čo človek zmenil: napísané políčka a (ak ju hýbal) poloha fotky. Vlastná fotka (`src`) len keď ju sám vybral.
type Draft = { edited: Partial<CardData>; lang?: string; photo?: { x: number; y: number; zoom: number; src?: string } };

const EMPTY: CardData = { contacts: [{ name: '', phone: '' }], addr: '', note: '' };
/** Koncept zo staršej verzie kartičky mal `contact`, `phone`, `needs`. Človek o napísané neprichádza. */
function migrateEdited(raw: Record<string, unknown> | undefined, fresh: CardData): Partial<CardData> {
  const o = raw ?? {};
  const out: Partial<CardData> = {};
  if (Array.isArray(o.contacts)) out.contacts = o.contacts as CardContact[];
  else if (typeof o.contact === 'string' || typeof o.phone === 'string') {
    out.contacts = [{ name: typeof o.contact === 'string' ? o.contact : fresh.contacts[0].name, phone: typeof o.phone === 'string' ? o.phone : fresh.contacts[0].phone }];
  }
  if (typeof o.addr === 'string') out.addr = o.addr;
  if (typeof o.note === 'string') out.note = o.note;
  else if (typeof o.needs === 'string') out.note = o.needs;
  return out;
}
// Hodnoty „bez ťažkostí“ (none, suspect…) berie zo samotnej definície kvízu, nie z jedného doslovného reťazca.
const NONE_VALUES = (field: string): Set<string> => new Set(
  FLOW_SCREENS.filter((sc) => sc.field === field).flatMap((sc) => (sc.opts ?? []).filter((o) => o.none).map((o) => o.v)),
);

function readDraft(key: string): Draft | null {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) as Draft : null; } catch { return null; }
}
/** `false` = úložisko je plné, koncept sa nezapísal. */
function saveDraft(key: string, d: Draft): boolean {
  try { localStorage.setItem(key, JSON.stringify(d)); return true; } catch { return false; }
}

/** DOG ID má záložný kontakt v jednom texte („Janka 0900 000 000"): telefón z neho vyberie, zvyšok je meno. */
export function splitContact(raw: string): { name: string; phone: string } {
  const m = raw.match(/\+?\d[\d\s/-]{6,}\d/);
  if (!m) return { name: raw.trim(), phone: '' };
  return { name: raw.replace(m[0], '').replace(/[,;:–—-]\s*$/, '').trim(), phone: m[0].trim() };
}


/** `quick` = rýchly prístup z trojuholníka SOS: len kartička a ZDIEĽAŤ, nastavenie ostáva v DOG ID. */
export default function PackDogCard({ dogId, quick, picker, onBack }: { dogId?: string; quick?: boolean; picker?: ReactNode; onBack?: () => void } = {}) {
  const params = useParams();
  const id = dogId ?? params.id ?? '';
  const nav = useNavigate();
  const s = useSosT();
  const t = useT();
  const { lang } = useLang();
  const [dog, setDog] = useState<DogRow | null>(null);
  const [data, setData] = useState<CardData>(EMPTY);
  const [photo, setPhoto] = useState<CardPhoto>({ src: null, x: 50, y: 50, zoom: 1 });
  // load = načítava sa · error = chyba siete / databázy (SKÚSIŤ ZNOVA) · missing = pes neexistuje (žiadny koncept, žiadne čítanie)
  const [status, setStatus] = useState<'load' | 'ok' | 'error' | 'missing'>('load');
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [cardLang, setCardLang] = useState(() => cardLangOf(lang));
  const sheetRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef('');
  // Autosave sa spustí až po ručnej zmene: `edited` = políčka, ktoré človek písal; `photoTouched` = hýbal fotkou; `ownPhoto` = vybral vlastnú.
  const edited = useRef<Partial<CardData>>({});
  const photoTouched = useRef(false);
  const ownPhoto = useRef(false);
  const [dirty, setDirty] = useState(0);
  const saveTimer = useRef<number | null>(null);
  const warnedFull = useRef(false);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ kind: 'drag'; x: number; y: number; px: number; py: number; w: number; h: number } | { kind: 'pinch'; d0: number; z0: number } | null>(null);

  useEffect(() => {
    let alive = true;
    setStatus('load');
    (async () => {
      try {
        const { data: row, error } = await supabase.from('dogs')
          .select('dog_name, cloudinary_main_url, patron_svg, life_status, selections, owner_name')
          .eq('id', id).maybeSingle();
        if (!alive) return;
        if (error) throw error;
        if (!row) { setDog(null); setStatus('missing'); return; }
        const d = row as DogRow;
        // Zosnulý pes kartičku „doma sám“ nepotrebuje: späť na jeho stránku.
        if (d.life_status === 'deceased') { nav(`/pack/dogs/${id}`, { replace: true }); return; }
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user.id;
        if (!uid) throw new Error('no_user');
        const latest = await readLatest(id, { strict: true });
        if (!alive) return;
        setDog(d);
        keyRef.current = cardDraftKey(uid, id);
        try { localStorage.removeItem(`dogypt.ecard.${id}`); } catch { /* starý tvar kľúča bez user.id */ }
        const draft = readDraft(keyRef.current);
        // Hodnoty v DOG ID sú kódy („none", „ib"): na kartičku ide to, čo vidí človek.
        // „Žiadne“ a „nie je isté“ (príznak `none` v definícii kvízu) sa na kartičku nepíšu.
        const tr = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };
        const shown = (f: string, v: LatestValue | undefined) => {
          if (!hasValue(v) || !STEP_BY_FIELD[f]) return '';
          const skip = NONE_VALUES(f);
          const raw = Array.isArray(v!.value) ? v!.value.filter((x) => !skip.has(String(x))) : skip.has(String(v!.value)) ? '' : v!.value;
          if (raw === '' || (Array.isArray(raw) && !raw.length)) return '';
          return passPlainValue(STEP_BY_FIELD[f], raw, tr, intlLocale(lang));
        };
        const { name, phone } = splitContact(shown('health.backupContact', latest['health.backupContact']));
        const allergies = shown('health.allergies', latest['health.allergies']);
        const needs = [
          shown('health.meds', latest['health.meds']),
          allergies && s('pack.sos.card.allergy', { what: allergies }),
          shown('health.conditions', latest['health.conditions']),
        ].filter(Boolean).join(', ');
        const fresh: CardData = { contacts: [{ name, phone }], addr: '', note: needs };
        // Čo človek napísal, ostáva (aj prázdne, ak to zámerne zmazal). Zvyšok si doberá z DOG ID.
        edited.current = migrateEdited(draft?.edited as Record<string, unknown> | undefined, fresh);
        photoTouched.current = !!draft?.photo;
        ownPhoto.current = !!draft?.photo?.src;
        setHasDraft(!!draft);
        setCardLang(cardLangOf(draft?.lang ?? lang));
        setData({ ...fresh, ...edited.current });
        const keep = draft?.photo;
        if (keep?.src) { setPhoto({ src: keep.src, x: keep.x, y: keep.y, zoom: keep.zoom }); setStatus('ok'); return; }
        const src = d.cloudinary_main_url ? await toDataUrl(sizedUrl(d.cloudinary_main_url, 900)) : null;
        if (!alive) return;
        setPhoto({ src, x: keep?.x ?? 50, y: keep?.y ?? 50, zoom: keep?.zoom ?? 1 });
        setStatus('ok');
      } catch {
        if (alive) setStatus('error'); // žiadny prázdny koncept sa neukladá
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reload]);

  // Zápis až po ručnej zmene (`dirty` > 0), oneskorený, aby sa nepísalo pri každom pohybe prsta.
  useEffect(() => {
    if (status !== 'ok' || !dirty || !keyRef.current) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const draft: Draft = {
        edited: edited.current,
        lang: cardLang,
        ...(photoTouched.current ? { photo: { x: photo.x, y: photo.y, zoom: photo.zoom, ...(ownPhoto.current && photo.src ? { src: photo.src } : {}) } } : {}),
      };
      if (saveDraft(keyRef.current, draft)) setHasDraft(true);
      else if (!warnedFull.current) { warnedFull.current = true; toast({ title: s('pack.sos.card.storageFull') }); }
    }, 600);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, data, photo, status, cardLang]);

  const fem = dog?.selections?.dogGender === 'queen';
  const tx = useMemo(() => cardTexts(cardLang, fem), [cardLang, fem]);
  const rtl = cardIsRtl(cardLang);
  const dogName = dog?.dog_name ?? '';
  const glyph: CardGlyph | null = dog?.selections ? { selections: dog.selections, ownerName: dog.owner_name ?? '', patronSvg: dog.patron_svg ?? '' } : null;
  const hasContact = data.contacts.some((c) => c.phone.trim());
  const set = (k: 'addr' | 'note') => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    edited.current = { ...edited.current, [k]: v };
    setData((d) => ({ ...d, [k]: v }));
    setDirty((n) => n + 1);
  };
  const setContacts = (contacts: CardContact[]) => {
    edited.current = { ...edited.current, contacts };
    setData((d) => ({ ...d, contacts }));
    setDirty((n) => n + 1);
  };

  const resetFromDogId = () => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    try { localStorage.removeItem(keyRef.current); } catch { /* nič */ }
    edited.current = {}; photoTouched.current = false; ownPhoto.current = false;
    setDirty(0); setHasDraft(false);
    setReload((n) => n + 1);
  };

  // Fotka prstom: jeden prst posúva, dva prsty približujú. Ťah doprava ukáže viac z ľavej časti fotky, preto mínus.
  const startDrag = (e: RPE, rect: DOMRect) => {
    gesture.current = { kind: 'drag', x: e.clientX, y: e.clientY, px: photo.x, py: photo.y, w: rect.width, h: rect.height };
  };
  const dist = () => { const [a, b] = [...ptrs.current.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const onDown = (e: RPE) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.current.size === 2) gesture.current = { kind: 'pinch', d0: Math.max(1, dist()), z0: photo.zoom };
    else if (ptrs.current.size === 1) startDrag(e, e.currentTarget.getBoundingClientRect());
  };
  const onMove = (e: RPE) => {
    const g = gesture.current;
    if (!g || !ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const clamp = (v: number) => Math.min(100, Math.max(0, v));
    if (g.kind === 'pinch' && ptrs.current.size >= 2) {
      const z = Math.min(PHOTO_MAX, Math.max(1, g.z0 * (dist() / g.d0)));
      photoTouched.current = true;
      setPhoto((p) => ({ ...p, zoom: z }));
      setDirty((n) => n + 1);
    } else if (g.kind === 'drag') {
      photoTouched.current = true;
      setPhoto((p) => ({ ...p, x: clamp(g.px - ((e.clientX - g.x) / g.w) * 100), y: clamp(g.py - ((e.clientY - g.y) / g.h) * 100) }));
      setDirty((n) => n + 1);
    }
  };
  // Zrušenie (hovor, systémové gesto) sa berie ako zdvihnutie prsta, inak by posun ostal „zaseknutý“.
  const onUp = (e: RPE) => {
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size === 1) {
      const [only] = [...ptrs.current.values()];
      const rect = e.currentTarget.getBoundingClientRect();
      gesture.current = { kind: 'drag', x: only.x, y: only.y, px: photo.x, py: photo.y, w: rect.width, h: rect.height };
    } else if (ptrs.current.size === 0) gesture.current = null;
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const { blob } = await compressFile(f);
      const src = await blobToDataUrl(blob);
      ownPhoto.current = true; photoTouched.current = true;
      setPhoto({ src, x: 50, y: 50, zoom: 1 });
      setDirty((n) => n + 1);
    } catch {
      toast({ title: s('pack.sos.error'), variant: 'destructive' });
    }
  };

  // Čo sa na kartičke nezmestí, sa pred stiahnutím pomenuje, nie ticho skráti.
  const overflowing = (): string[] => {
    const out = new Set<string>();
    sheetRef.current?.querySelectorAll<HTMLElement>('[data-check]').forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) out.add(el.dataset.check ?? '');
    });
    return [...out].filter(Boolean);
  };

  const download = async () => {
    if (!sheetRef.current || busy) return;
    const long = overflowing();
    if (long.length) { toast({ title: s('pack.sos.card.tooLong', { fields: long.join(', ') }), variant: 'destructive' }); return; }
    setBusy(true);
    try {
      const { handed, photoOk } = await exportEmergencyCardPdf(sheetRef.current, dogName, s('pack.sos.card.fileName'));
      if (!handed) toast({ title: s('pack.sos.card.noShare') });
      else if (!photoOk) toast({ title: s('pack.sos.card.noPhotoPdf'), variant: 'destructive' });
    } catch {
      toast({ title: s('pack.sos.error'), variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!shareRef.current || busy) return;
    const long = overflowing();
    if (long.length) { toast({ title: s('pack.sos.card.tooLong', { fields: long.join(', ') }), variant: 'destructive' }); return; }
    setBusy(true);
    try {
      const { handed, photoOk } = await shareEmergencyCardImage(shareRef.current, dogName, cardUi('shareFile', lang));
      if (!handed) toast({ title: s('pack.sos.card.noShare') });
      else if (!photoOk) toast({ title: s('pack.sos.card.noPhotoPdf'), variant: 'destructive' });
    } catch {
      toast({ title: s('pack.sos.error'), variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const editHref = `/pack/dogs/${id}/karticka`;

  return (
    <SosTaskShell onBack={onBack ?? (() => nav(`/pack/dogs/${id}`))} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <h1 className="sos-h2 ecp-title">{s('pack.sos.card.title')}</h1>
      {picker}
      {status === 'load' && <p className="ecp-note">{s('pack.sos.loading')}</p>}
      {status === 'missing' && <p className="ecp-note">{s('pack.sos.card.notFound')}</p>}
      {status === 'error' && (
        <>
          <p className="ecp-note">{s('pack.sos.card.loadFail')}</p>
          <button type="button" className="sos-cta ecp-btn pk-b3 pk-b3--lapis" onClick={() => setReload((n) => n + 1)}>{s('pack.sos.card.retry')}</button>
        </>
      )}
      {status === 'ok' && (
        <>
          <div className="ecp-prev">
            <CardFront dogName={dogName} photo={photo} tx={tx} rtl={rtl}
              photoHandlers={quick ? undefined : { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }} />
            <CardBack data={data} glyph={glyph} tx={tx} rtl={rtl} />
          </div>
          {quick ? (
            <>
              {hasContact
                ? <button type="button" className="sos-cta ecp-btn pk-b3 pk-b3--lapis" disabled={busy} onClick={share}>{busy ? s('pack.sos.loading') : cardUi('share', lang)}</button>
                : <button type="button" className="sos-cta ecp-btn pk-b3 pk-b3--lapis" onClick={() => nav(editHref)}>{cardUi('setUp', lang)}</button>}
              {hasContact && <button type="button" className="ecp-link" onClick={() => nav(editHref)}>{cardUi('edit', lang)}</button>}
            </>
          ) : (
            <>
              <label className="sos-field">
                <span>{cardUi('lang', lang)}</span>
                <select className="pf-field" value={cardLang} onChange={(e) => { setCardLang(e.target.value); setDirty((n) => n + 1); }}>
                  {CARD_LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </label>
              <p className="ecp-note">{cardUi('langHint', lang)}</p>
              <div className="ecp-photo" style={{ ...PACK_BOX.subblock }}>
                <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm ecp-btn ecp-btn--sm pk-b3 pk-b3--paper" onClick={() => fileRef.current?.click()}>{s('pack.sos.card.photoChange')}</button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
                <label className="ecp-zoom">
                  {s('pack.sos.card.photoZoom')}
                  <input type="range" min={1} max={PHOTO_MAX} step={0.05} value={photo.zoom} onChange={(e) => { photoTouched.current = true; setPhoto((p) => ({ ...p, zoom: +e.target.value })); setDirty((n) => n + 1); }} />
                </label>
                <p className="ecp-note">{s('pack.sos.card.photoHint')}</p>
              </div>
              <div className="ecp-fields">
                {data.contacts.map((c, i) => (
                  <div className="ecp-contact" style={{ ...PACK_BOX.subblock }} key={i}>
                    <label className="sos-field">
                      <span>{cardUi('name', lang)}</span>
                      <input className="pf-field" value={c.name} onChange={(e) => setContacts(data.contacts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                    </label>
                    <label className="sos-field">
                      <span>{s('pack.sos.card.phone')}</span>
                      <input className="pf-field" type="tel" value={c.phone} onChange={(e) => setContacts(data.contacts.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} />
                    </label>
                    {data.contacts.length > 1 && <button type="button" className="ecp-link" onClick={() => setContacts(data.contacts.filter((_, j) => j !== i))}>{cardUi('remove', lang)}</button>}
                  </div>
                ))}
                {data.contacts.length < CONTACTS_MAX && (
                  <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm ecp-btn ecp-btn--sm pk-b3 pk-b3--paper" onClick={() => setContacts([...data.contacts, { name: '', phone: '' }])}>{cardUi('add', lang)}</button>
                )}
                <label className="sos-field">
                  <span>{tx.addr}</span>
                  <input className="pf-field" value={data.addr} onChange={set('addr')} />
                </label>
                <label className="sos-field">
                  <span>{tx.note}</span>
                  <textarea className="pf-field" rows={3} maxLength={NOTE_MAX} value={data.note} onChange={set('note')} />
                </label>
              </div>
              <button type="button" className="sos-cta ecp-btn pk-b3 pk-b3--lapis" disabled={busy} onClick={download}>
                {s(busy ? 'pack.sos.loading' : 'pack.sos.card.download')}
              </button>
              <button type="button" className="sos-cta sos-cta--ghost ecp-btn pk-b3 pk-b3--paper" disabled={busy} onClick={share}>{cardUi('share', lang)}</button>
              {hasDraft && <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm ecp-btn ecp-btn--sm pk-b3 pk-b3--paper" onClick={resetFromDogId}>{s('pack.sos.card.reset')}</button>}
              <p className="ecp-note">{s('pack.sos.card.private')}</p>
            </>
          )}

          <div className="ecs" ref={sheetRef} aria-hidden>
            <h2>{s('pack.sos.card.title')}</h2>
            <div className="ecs-pair">
              <CardFront dogName={dogName} photo={photo} tx={tx} rtl={rtl} flat />
              <CardBack data={data} glyph={glyph} tx={tx} rtl={rtl} flat />
              <i className="ecs-fold" />
            </div>
            <ol>
              <li>{s('pack.sos.card.step1')}</li>
              <li>{s('pack.sos.card.step2')}</li>
              <li>{s('pack.sos.card.step3')}</li>
              <li>{s('pack.sos.card.step4')}</li>
            </ol>
            <small>{s('pack.sos.card.printHint')}</small>
          </div>
          <div className="ecshare" ref={shareRef} aria-hidden>
            <CardFront dogName={dogName} photo={photo} tx={tx} rtl={rtl} />
            <CardBack data={data} glyph={glyph} tx={tx} rtl={rtl} />
          </div>
        </>
      )}
    </SosTaskShell>
  );
}
