// NÚDZOVÁ KARTIČKA `/pack/dogs/:id/karticka` (kôš 3). Matej 5. 11. 2026: „foto psa tam musí byť naša editovateľná a väčšia".
// Údaje sa predvyplnia z DOG ID, ale úprava ostáva LEN v tomto zariadení (localStorage): DOG ID sa odtiaľto nikdy neprepíše
// a adresa ani vlastná fotka nejdú na server.
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent as RPE } from 'react';
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
import { useBreedLabel, useSosT } from '@/components/pack/sos/sosShared';
import { CARD_CSS, CardBack, CardFront, type CardData, type CardPhoto, type CardTexts } from './EmergencyCard';
import { exportEmergencyCardPdf } from './emergencyCardPdf';

const PHOTO_MAX = 3;

const CSS = `
${CARD_CSS}
.ecp-title{margin:0;}
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
`;

type DogRow = {
  dog_name: string | null; breed: string | null; birth_year: number | null; pack_number: number | null;
  cloudinary_main_url: string | null; patron_svg: string | null; life_status: string | null;
};
// Do konceptu ide LEN to, čo človek zmenil: napísané políčka a (ak ju hýbal) poloha fotky. Vlastná fotka (`src`) len keď ju sám vybral.
type Draft = { edited: Partial<CardData>; photo?: { x: number; y: number; zoom: number; src?: string } };

const EMPTY: CardData = { contact: '', phone: '', addr: '', needs: '', vet: '', breed: '', age: '' };
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


export default function PackDogCard() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const s = useSosT();
  const breedLabel = useBreedLabel();
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
  const sheetRef = useRef<HTMLDivElement>(null);
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
          .select('dog_name, breed, birth_year, pack_number, cloudinary_main_url, patron_svg, life_status')
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
        const birth = d.birth_year;
        const allergies = shown('health.allergies', latest['health.allergies']);
        const needs = [
          shown('health.meds', latest['health.meds']),
          allergies && s('pack.sos.card.allergy', { what: allergies }),
          shown('health.conditions', latest['health.conditions']),
        ].filter(Boolean).join(', ');
        const fresh: CardData = {
          ...EMPTY, contact: name, phone, needs, vet: shown('health.vetContact', latest['health.vetContact']),
          breed: d.breed ? breedLabel(d.breed) : '',
          age: birth ? s('pack.sos.card.ageYears', { n: new Date().getFullYear() - birth }) : '', // vek vždy nanovo z roku narodenia
        };
        // Čo človek napísal, ostáva (aj prázdne, ak to zámerne zmazal). Zvyšok si doberá z DOG ID.
        edited.current = { ...(draft?.edited ?? {}) };
        delete edited.current.age;
        photoTouched.current = !!draft?.photo;
        ownPhoto.current = !!draft?.photo?.src;
        setHasDraft(!!draft);
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
        ...(photoTouched.current ? { photo: { x: photo.x, y: photo.y, zoom: photo.zoom, ...(ownPhoto.current && photo.src ? { src: photo.src } : {}) } } : {}),
      };
      if (saveDraft(keyRef.current, draft)) setHasDraft(true);
      else if (!warnedFull.current) { warnedFull.current = true; toast({ title: s('pack.sos.card.storageFull') }); }
    }, 600);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, data, photo, status]);

  const tx: CardTexts = useMemo(() => ({
    frontTitle: s('pack.sos.card.frontTitle'), ask: s('pack.sos.card.ask'),
    contact: s('pack.sos.card.contact'), phone: s('pack.sos.card.phone'),
    backTitle: s('pack.sos.card.backTitle'), breed: s('pack.sos.card.breed'), age: s('pack.sos.card.age'),
    addr: s('pack.sos.card.addr'), needs: s('pack.sos.card.needs'), vet: s('pack.sos.card.vet'),
  }), [s]);

  const dogName = dog?.dog_name ?? '';
  const number = dog?.pack_number ? `#${dog.pack_number}` : '';
  const patron = dog?.patron_svg ? `/patrons/${dog.patron_svg}` : null;
  const set = (k: keyof CardData) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    edited.current = { ...edited.current, [k]: v };
    setData((d) => ({ ...d, [k]: v }));
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

  // Čo sa na kartičke nezmestí ani po zmenšení a dvoch riadkoch, sa pred stiahnutím pomenuje, nie ticho skráti.
  const overflowing = (): string[] => {
    const out: string[] = [];
    sheetRef.current?.querySelectorAll<HTMLElement>('.ec-fl').forEach((fl) => {
      const b = fl.querySelector('b');
      if (b && (b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1)) out.push(fl.querySelector('span')?.textContent ?? '');
    });
    return out;
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

  const field = (k: keyof CardData, label: string, type = 'text') => (
    <label className="sos-field">
      <span>{label}</span>
      <input className="pf-field" type={type} value={data[k]} onChange={set(k)} />
    </label>
  );

  return (
    <SosTaskShell onBack={() => nav(`/pack/dogs/${id}`)} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <h1 className="sos-h2 ecp-title">{s('pack.sos.card.title')}</h1>
      {status === 'load' && <p className="ecp-note">{s('pack.sos.loading')}</p>}
      {status === 'missing' && <p className="ecp-note">{s('pack.sos.card.notFound')}</p>}
      {status === 'error' && (
        <>
          <p className="ecp-note">{s('pack.sos.card.loadFail')}</p>
          <button type="button" className="sos-cta" onClick={() => setReload((n) => n + 1)}>{s('pack.sos.card.retry')}</button>
        </>
      )}
      {status === 'ok' && (
        <>
          <div className="ecp-prev">
            <CardFront dogName={dogName} number={number} photo={photo} data={data} tx={tx}
              photoHandlers={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp }} />
            <CardBack dogName={dogName} patron={patron} data={data} tx={tx} />
          </div>
          <div className="ecp-photo" style={{ ...PACK_BOX.subblock }}>
            <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm" onClick={() => fileRef.current?.click()}>{s('pack.sos.card.photoChange')}</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
            <label className="ecp-zoom">
              {s('pack.sos.card.photoZoom')}
              <input type="range" min={1} max={PHOTO_MAX} step={0.05} value={photo.zoom} onChange={(e) => { photoTouched.current = true; setPhoto((p) => ({ ...p, zoom: +e.target.value })); setDirty((n) => n + 1); }} />
            </label>
            <p className="ecp-note">{s('pack.sos.card.photoHint')}</p>
          </div>
          <div className="ecp-fields">
            {field('contact', s('pack.sos.card.contact'))}
            {field('phone', s('pack.sos.card.phone'), 'tel')}
            {field('addr', s('pack.sos.card.addr'))}
            {field('needs', s('pack.sos.card.needs'))}
            {field('vet', s('pack.sos.card.vet'))}
            <div className="ecp-two">
              {field('breed', s('pack.sos.card.breed'))}
              {field('age', s('pack.sos.card.age'))}
            </div>
          </div>
          <button type="button" className="sos-cta" disabled={busy} onClick={download}>
            {s(busy ? 'pack.sos.loading' : 'pack.sos.card.download')}
          </button>
          {hasDraft && <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm" onClick={resetFromDogId}>{s('pack.sos.card.reset')}</button>}
          <p className="ecp-note">{s('pack.sos.card.private')}</p>

          <div className="ecs" ref={sheetRef} aria-hidden>
            <h2>{s('pack.sos.card.title')}</h2>
            <div className="ecs-pair">
              <CardFront dogName={dogName} number={number} photo={photo} data={data} tx={tx} flat />
              <CardBack dogName={dogName} patron={patron} data={data} tx={tx} flat />
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
        </>
      )}
    </SosTaskShell>
  );
}
