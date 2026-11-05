// NÚDZOVÁ KARTIČKA `/pack/dogs/:id/karticka` (kôš 3). Matej 5. 11. 2026: „foto psa tam musí byť naša editovateľná a väčšia".
// Údaje sa predvyplnia z DOG ID, ale úprava ostáva LEN v tomto zariadení (localStorage): DOG ID sa odtiaľto nikdy neprepíše
// a adresa ani vlastná fotka nejdú na server.
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent as RPE } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { readLatest, hasValue, type LatestValue } from '@/lib/dogEvents';
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
  cloudinary_main_url: string | null; patron_svg: string | null;
};
type Draft = { data: CardData; photo: CardPhoto };

const EMPTY: CardData = { contact: '', phone: '', addr: '', needs: '', vet: '', breed: '', age: '' };
const DRAFT_KEY = (id: string) => `dogypt.ecard.${id}`;

function readDraft(id: string): Draft | null {
  try { const s = localStorage.getItem(DRAFT_KEY(id)); return s ? JSON.parse(s) as Draft : null; } catch { return null; }
}
function saveDraft(id: string, d: Draft) {
  try { localStorage.setItem(DRAFT_KEY(id), JSON.stringify(d)); } catch { /* plné úložisko: kartička funguje ďalej, len sa nezapamätá */ }
}

/** DOG ID má záložný kontakt v jednom texte („Janka 0900 000 000"): telefón z neho vyberie, zvyšok je meno. */
export function splitContact(raw: string): { name: string; phone: string } {
  const m = raw.match(/\+?\d[\d\s/-]{6,}\d/);
  if (!m) return { name: raw.trim(), phone: '' };
  return { name: raw.replace(m[0], '').replace(/[,;:–—-]\s*$/, '').trim(), phone: m[0].trim() };
}


async function toDataUrl(url: string): Promise<string | null> {
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result));
      fr.onerror = () => rej(fr.error);
      fr.readAsDataURL(blob);
    });
  } catch { return null; }
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
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number; w: number; h: number } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: row } = await supabase.from('dogs')
        .select('dog_name, breed, birth_year, pack_number, cloudinary_main_url, patron_svg')
        .eq('id', id).maybeSingle();
      if (!alive) return;
      const d = row as DogRow | null;
      setDog(d);
      const draft = readDraft(id);
      const latest = await readLatest(id).catch(() => ({} as Awaited<ReturnType<typeof readLatest>>));
      // Hodnoty v DOG ID sú kódy („none", „ib"): na kartičku ide to, čo vidí človek. „Žiadne" sa na kartičku nepíše.
      const tr = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };
      const shown = (f: string, v: LatestValue | undefined) => {
        if (!hasValue(v) || !STEP_BY_FIELD[f]) return '';
        const raw = Array.isArray(v!.value) ? v!.value.filter((x) => x !== 'none') : v!.value === 'none' ? '' : v!.value;
        if (raw === '' || (Array.isArray(raw) && !raw.length)) return '';
        return passPlainValue(STEP_BY_FIELD[f], raw, tr, intlLocale(lang));
      };
      const { name, phone } = splitContact(shown('health.backupContact', latest['health.backupContact']));
      const birth = d?.birth_year;
      const needs = [shown('health.meds', latest['health.meds']), shown('health.allergies', latest['health.allergies'])].filter(Boolean).join(', ');
      if (!alive) return;
      const fresh: CardData = {
        ...EMPTY, contact: name, phone, needs, vet: shown('health.vetContact', latest['health.vetContact']),
        breed: d?.breed ? breedLabel(d.breed) : '',
        age: birth ? s('pack.sos.card.ageYears', { n: new Date().getFullYear() - birth }) : '',
      };
      // Čo človek napísal, ostáva. Prázdne políčko si doplní z DOG ID, inak by prvé otvorenie kartičku zmrazilo.
      const merged = { ...fresh };
      if (draft) (Object.keys(EMPTY) as (keyof CardData)[]).forEach((k) => { if (draft.data[k]) merged[k] = draft.data[k]; });
      setData(merged);
      if (draft?.photo.src) { setPhoto(draft.photo); setReady(true); return; }
      const src = d?.cloudinary_main_url ? await toDataUrl(sizedUrl(d.cloudinary_main_url, 900)) : null;
      if (alive) { setPhoto((p) => ({ ...p, src })); setReady(true); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { if (ready && id) saveDraft(id, { data, photo }); }, [ready, id, data, photo]);

  const tx: CardTexts = useMemo(() => ({
    frontTitle: s('pack.sos.card.frontTitle'), ask: s('pack.sos.card.ask'),
    contact: s('pack.sos.card.contact'), phone: s('pack.sos.card.phone'),
    backTitle: s('pack.sos.card.backTitle'), breed: s('pack.sos.card.breed'), age: s('pack.sos.card.age'),
    addr: s('pack.sos.card.addr'), needs: s('pack.sos.card.needs'), vet: s('pack.sos.card.vet'),
  }), [s]);

  const dogName = dog?.dog_name ?? '';
  const number = dog?.pack_number ? `#${dog.pack_number}` : '';
  const patron = dog?.patron_svg ? `/patrons/${dog.patron_svg}` : null;
  const set = (k: keyof CardData) => (e: ChangeEvent<HTMLInputElement>) => setData((d) => ({ ...d, [k]: e.target.value }));

  // Posun fotky prstom. Ťah doprava ukáže viac z ľavej časti fotky, preto mínus.
  const onDown = (e: RPE) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: photo.x, py: photo.y, w: r.width, h: r.height };
  };
  const onMove = (e: RPE) => {
    const g = drag.current;
    if (!g) return;
    const clamp = (v: number) => Math.min(100, Math.max(0, v));
    setPhoto((p) => ({ ...p, x: clamp(g.px - ((e.clientX - g.x) / g.w) * 100), y: clamp(g.py - ((e.clientY - g.y) / g.h) * 100) }));
  };
  const onUp = () => { drag.current = null; };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const { blob } = await compressFile(f);
      const src = await new Promise<string>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result));
        fr.onerror = () => rej(fr.error);
        fr.readAsDataURL(blob);
      });
      setPhoto({ src, x: 50, y: 50, zoom: 1 });
    } catch {
      toast({ title: s('pack.sos.error'), variant: 'destructive' });
    }
  };

  const download = async () => {
    if (!sheetRef.current || busy) return;
    setBusy(true);
    try {
      const handed = await exportEmergencyCardPdf(sheetRef.current, dogName);
      if (!handed) toast({ title: s('pack.sos.card.noShare') });
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
      {!ready ? <p className="ecp-note">{s('pack.sos.loading')}</p> : (
        <>
          <div className="ecp-prev">
            <CardFront dogName={dogName} number={number} photo={photo} data={data} tx={tx}
              photoHandlers={{ onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp }} />
            <CardBack dogName={dogName} patron={patron} data={data} tx={tx} />
          </div>
          <div className="ecp-photo" style={{ ...PACK_BOX.subblock }}>
            <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm" onClick={() => fileRef.current?.click()}>{s('pack.sos.card.photoChange')}</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
            <label className="ecp-zoom">
              {s('pack.sos.card.photoZoom')}
              <input type="range" min={1} max={3} step={0.05} value={photo.zoom} onChange={(e) => setPhoto((p) => ({ ...p, zoom: +e.target.value }))} />
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
