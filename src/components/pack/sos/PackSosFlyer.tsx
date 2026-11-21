// SOS — EDITOR LETÁKA `/pack/sos/:slug/letak` (kôš 3 · ROBÍM ÚLOHU: bez lišty, šípka späť, vpravo nič).
// Hore prepínač vzhľadu (Papyrus · Na tlač), pod ním živý náhľad `SosFlyer`, potom polia. ULOŽIŤ LETÁK = PNG 2480×3508
// → Cloudinary → `sosUpdate(id, { flyer, flyerUrl, phone, place })`. STIAHNUŤ = PDF A4 + PNG.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { sosUpdate, type SosFlyer as FlyerFields } from '@/lib/sos';
import { SosCard, sosErrCode, useBack, useSosLost, useSosT } from './sosShared';
import { SOS_TEXTS } from './sosTexts';
import { SosFlyer, flyerDefaults, nearestDir, type FlyerData, type FlyerLook } from './SosFlyer';
import { sosInvalidate } from '@/components/pack/sosKit';
import { flyerDownload, flyerToPng, flyerUpload, FLYER_CSS_W } from './sosFlyerExport';
import { PACK_R, PACK_SHADOW, PACK_SPACE, PACK_TEXT, PACK_THEME as T } from '@/components/pack/packTheme';
import { sosPath } from './sosShared';
import { SosTaskShell } from './SosTaskShell';
import type { SosKey } from './sosTexts';

const CSS = `
.sosf-look{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;}
.sosf-look button{min-height:44px;border-radius:${PACK_R.pill}px;font-size:${PACK_TEXT.body}px;font-weight:500;}
.sosf-look button.is-on{font-weight:600;}
.sosf-prev{box-shadow:${PACK_SHADOW.panel};}
.sosf-dirs{display:grid;grid-template-columns:repeat(4,1fr);gap:${PACK_SPACE.sm}px;}
.sosf-dirs button{min-height:44px;border-radius:${PACK_R.tile}px;display:flex;align-items:center;justify-content:center;font-size:${PACK_TEXT.label}px;}
.sosf-dirs svg{width:20px;height:20px;}
.sosf-off{position:fixed;left:-20000px;top:0;width:${FLYER_CSS_W}px;pointer-events:none;}
`;

const DIRS = [0, 45, 90, 135, 180, 225, 270, 315] as const;

/** Server (`sos_check_phone`): jedno číslo, 6 až 15 číslic, najviac 20 znakov, len číslice a + ( ) . / - medzera. Klient to overí PRED nahratím letáku. */
const phoneOk = (p: string) => {
  const t = p.trim();
  const n = t.replace(/\D/g, '').length;
  return n >= 6 && n <= 15 && t.length <= 20 && /^[0-9+()./ -]+$/.test(t);
};

type TextKey = 'headline' | 'about' | 'reward' | 'thanks';
const TEXT_KEYS: TextKey[] = ['headline', 'about', 'reward', 'thanks'];
const DEF_KEY: Record<TextKey, 'pack.sos.fl.defHeadline' | 'pack.sos.fl.defAbout' | 'pack.sos.fl.defReward' | 'pack.sos.fl.defThanks'> = {
  headline: 'pack.sos.fl.defHeadline', about: 'pack.sos.fl.defAbout', reward: 'pack.sos.fl.defReward', thanks: 'pack.sos.fl.defThanks',
};
/** Je uložená hodnota len predvolený text v niektorom jazyku? Predvolené sa neukladajú, takže sa po prepnutí jazyka prepíšu aj staré uloženia. */
const isDefaultText = (k: TextKey, v: string) => {
  const d = SOS_TEXTS[DEF_KEY[k]];
  return v === d.en || v === d.sk || v === d.cs;
};

export default function PackSosFlyer() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const load = useSosLost(slugParam);
  const s = useSosT(load.state === 'ready' ? load.pub.dog_gender : null);
  const back = useBack(sosPath.page(slugParam ?? ''));
  const [look, setLook] = useState<FlyerLook>('papyrus');
  // Texty `null` = predvolené (v jazyku, v ktorom leták práve vidíš); ukladá sa len to, čo človek naozaj prepísal.
  const [f, setF] = useState<{ headline: string | null; place: string; about: string | null; phone: string; reward: string | null; thanks: string | null; deg: number | null } | null>(null);
  const [dirty, setDirty] = useState(false);
  const uploaded = useRef<{ key: string; url: string } | null>(null);   // už nahraný PNG: opakované uloženie ho použije znova
  const [busy, setBusy] = useState<'save' | 'dl' | null>(null);
  const [err, setErr] = useState('');
  const [exporting, setExporting] = useState(false);
  const off = useRef<HTMLDivElement>(null);

  // predvolené texty podľa jazyka majiteľa; uložené hodnoty ich prebíjajú (aj prázdny reťazec = vedome prázdne)
  useEffect(() => {
    if (load.state !== 'ready' || !load.mine || f) return;
    const fl = load.mine.flyer ?? {};
    const own = (k: TextKey, max: number): string | null => {
      const v = fl[k];
      // stará predvolená „ODMENA“ (v ktoromkoľvek jazyku) = nevyplnená odmena
      return typeof v === 'string' && !isDefaultText(k, v) && !(k === 'headline' && v.trim() === '') ? v.slice(0, max) : null;   // aj prázdny reťazec = vedome prázdne
    };
    setF({
      headline: own('headline', 28), about: own('about', 120), reward: own('reward', 40), thanks: own('thanks', 120),
      place: load.mine.place_label ?? '', phone: load.mine.phone ?? '', deg: typeof fl.direction_deg === 'number' ? nearestDir(fl.direction_deg) : null,
    });
  }, [load, f]);

  const data = useMemo<FlyerData | null>(() => {
    if (load.state !== 'ready' || !load.mine || !f) return null;
    const m = load.mine;
    return {
      slug: m.slug, name: m.dog_name, dogGender: m.dog_gender, photo: m.photo, breed: m.breed, color: m.color, place: f.place, lastSeen: m.last_seen_at,
      lat: m.lat, lng: m.lng, phone: phoneOk(f.phone) ? f.phone : '',   // neplatné číslo sa na letáku nikdy nevykreslí
      // `undefined` = leták si vezme predvolený text v aktuálnom jazyku (`SosFlyer`)
      flyer: { headline: f.headline ?? undefined, about: f.about ?? undefined, reward: f.reward ?? undefined, thanks: f.thanks ?? undefined, direction_deg: f.deg },
    };
  }, [load, f]);

  const set = <K extends keyof NonNullable<typeof f>>(k: K, v: NonNullable<typeof f>[K]) => { setDirty(true); setF((p) => (p ? { ...p, [k]: v } : p)); };
  const def = flyerDefaults(s);

  // PNG z neviditeľného uzla v pevnej šírke 1240 px — nezávisí od šírky obrazovky
  const renderPng = async () => {
    setExporting(true);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    try {
      if (!off.current) throw new Error('flyer_no_node');
      return await flyerToPng(off.current);
    } finally { setExporting(false); }
  };

  if (load.state !== 'ready' || !data || !f) {
    return (
      <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
        <p className="sos-p" style={{ textAlign: 'center' }}>
          {load.state === 'loading' || (load.state === 'ready' && load.mine && !f) ? s('pack.sos.loading') : load.state === 'error' ? s('pack.sos.offline') : s('pack.sos.notFound')}
        </p>
        {load.state === 'error' && <button type="button" className="sos-cta" onClick={load.reload}>{s('pack.sos.retry')}</button>}
      </SosTaskShell>
    );
  }
  const mine = load.mine!;

  const save = async () => {
    setErr('');
    // Nič sa nezmenilo a leták už je uložený: nový súbor na Cloudinary nevzniká (unsigned preset neprepisuje, každé nahratie = nový súbor).
    if (!dirty && mine.flyer_url) { toast({ title: s('pack.sos.fl.unchanged') }); back(); return; }
    // Telefón najprv na klientovi, potom na serveri, až potom PNG na Cloudinary: zlé číslo nesmie nechať sirotu.
    if (!phoneOk(f.phone)) { setErr(s('pack.sos.err.bad_phone')); return; }
    setBusy('save');
    try {
      await sosUpdate(mine.id, { phone: f.phone.trim(), place: f.place.trim() });   // server číslo overí; nezaplatená chyba = žiadne nahratie
      const flyer: FlyerFields = { direction_deg: f.deg };
      TEXT_KEYS.forEach((k) => { if (f[k] !== null && !(k === 'headline' && f[k]!.trim() === '')) flyer[k] = f[k]!; });
      // ten istý obsah už raz nahratý (zlyhalo až uloženie do DB): použi existujúci súbor
      const key = JSON.stringify([look, f, mine.slug]);
      let url = uploaded.current?.key === key ? uploaded.current.url : null;
      if (!url) {
        const png = await renderPng();
        url = await flyerUpload(png, mine.slug);
        uploaded.current = { key, url };
      }
      await sosUpdate(mine.id, { flyer, flyerUrl: url });
      sosInvalidate();
      toast({ title: s('pack.sos.fl.saved') });
      back();
    } catch (e) {
      const code = sosErrCode(e);
      setErr(code === 'bad_phone' ? s('pack.sos.err.bad_phone') : s('pack.sos.fl.exportFail'));
      console.warn('sos flyer', e);
    } finally { setBusy(null); }
  };

  const download = async () => {
    setBusy('dl'); setErr('');
    try { if (!(await flyerDownload(await renderPng(), mine.slug))) setErr(s('pack.sos.fl.noShare')); }
    catch (e) { setErr(s('pack.sos.fl.exportFail')); console.warn('sos flyer', e); }
    finally { setBusy(null); }
  };

  const field = (k: 'headline' | 'place' | 'phone' | 'reward' | 'thanks', label: SosKey, extra?: { hint?: SosKey; type?: string }) => (
    <label className="sos-field"><span>{s(label)}</span>
      <input className="pf-field" type={extra?.type ?? 'text'} value={k === 'place' || k === 'phone' ? f[k] : f[k] ?? (k === 'reward' ? '' : def[k])} placeholder={k === 'reward' ? s('pack.sos.fl.rewardPh') : undefined} maxLength={k === 'phone' ? 20 : k === 'headline' ? 28 : k === 'reward' ? 40 : 120} onChange={(e) => set(k, e.target.value)} />
      {k === 'phone' && f.phone.trim() !== '' && !phoneOk(f.phone) && <span className="sos-err" role="alert" style={{ textTransform: 'none', letterSpacing: 0 }}>{s('pack.sos.err.bad_phone')}</span>}
      {extra?.hint && <span className="sos-small" style={{ textTransform: 'none', letterSpacing: 0, marginTop: 4 }}>{s(extra.hint)}</span>}
    </label>
  );

  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <SosCard>
        <h1 className="sos-h2">{s('pack.sos.fl.title')}</h1>
        <p className="sos-eyebrow">{s('pack.sos.fl.look')}</p>
        <div className="sosf-look">
          {(['papyrus', 'print'] as const).map((k) => (
            <button key={k} type="button" className={`sos-pick${look === k ? ' is-on' : ''}`} aria-pressed={look === k} onClick={() => { setDirty(true); setLook(k); }}>
              {s(k === 'papyrus' ? 'pack.sos.fl.lookPapyrus' : 'pack.sos.fl.lookPrint')}
            </button>
          ))}
        </div>
        <div className="sosf-prev"><SosFlyer data={data} look={look} /></div>
        <p className="sos-small" style={{ textAlign: 'center' }}>{s('pack.sos.fl.a4')}</p>
      </SosCard>

      <SosCard>
        {field('headline', 'pack.sos.fl.headline')}
        {field('place', 'pack.sos.fl.place')}
        <label className="sos-field"><span>{s('pack.sos.fl.about')}</span>
          <textarea className="pf-field" rows={3} maxLength={120} value={f.about ?? def.about} onChange={(e) => set('about', e.target.value)} />
          <span className="sos-small" style={{ textTransform: 'none', letterSpacing: 0 }}>{(f.about ?? def.about).length}/120</span>
        </label>
        {field('phone', 'pack.sos.fl.phone', { type: 'tel' })}
        {field('reward', 'pack.sos.fl.reward', { hint: 'pack.sos.fl.rewardHint' })}
        {field('thanks', 'pack.sos.fl.thanks')}
        <div className="sos-field"><span>{s('pack.sos.fl.direction')}</span>
          <div className="sosf-dirs">
            {DIRS.map((d) => (
              <button key={d} type="button" className={`sos-pick${f.deg === d ? ' is-on' : ''}`} aria-pressed={f.deg === d} aria-label={s(`pack.sos.fl.dir.${d}` as SosKey)} onClick={() => set('deg', d)}>
                <svg viewBox="0 0 24 24" style={{ transform: `rotate(${d}deg)` }} fill="none" stroke={T.inkStrong} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20V5M6 11l6-6 6 6" /></svg>
              </button>
            ))}
            <button type="button" className={`sos-pick${f.deg === null ? ' is-on' : ''}`} aria-pressed={f.deg === null} onClick={() => set('deg', null)}>{s('pack.sos.fl.dirNone')}</button>
          </div>
        </div>
      </SosCard>

      {err && <p className="sos-err">{err}</p>}
      <button type="button" className="sos-cta" disabled={!!busy} onClick={save}>{busy === 'save' ? s('pack.sos.fl.saving') : s('pack.sos.fl.save')}</button>
      <button type="button" className="sos-cta sos-cta--ghost" disabled={!!busy} onClick={download}>{busy === 'dl' ? s('pack.sos.fl.exporting') : s('pack.sos.fl.download')}</button>

      {exporting && <div className="sosf-off" ref={off} aria-hidden><SosFlyer data={data} look={look} /></div>}
    </SosTaskShell>
  );
}
