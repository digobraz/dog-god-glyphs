// SOS — EDITOR LETÁKA `/pack/sos/:slug/letak` (kôš 3 · ROBÍM ÚLOHU: bez lišty, šípka späť, vpravo nič).
// Hore prepínač vzhľadu (Papyrus · Na tlač), pod ním živý náhľad `SosFlyer`, potom polia. ULOŽIŤ LETÁK = PNG 2480×3508
// → Cloudinary → `sosUpdate(id, { flyer, flyerUrl, phone, place })`. STIAHNUŤ = PDF A4 + PNG.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { sosUpdate, type SosFlyer as FlyerFields } from '@/lib/sos';
import { SosCard, sosErrCode, useBack, useSosLost, useSosT } from './sosShared';
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

export default function PackSosFlyer() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const load = useSosLost(slugParam);
  const s = useSosT(load.state === 'ready' ? load.pub.dog_gender : null);
  const back = useBack(sosPath.page(slugParam ?? ''));
  const [look, setLook] = useState<FlyerLook>('papyrus');
  const [f, setF] = useState<{ headline: string; place: string; about: string; phone: string; reward: string; thanks: string; deg: number | null } | null>(null);
  const [busy, setBusy] = useState<'save' | 'dl' | null>(null);
  const [err, setErr] = useState('');
  const [exporting, setExporting] = useState(false);
  const off = useRef<HTMLDivElement>(null);

  // predvolené texty podľa jazyka majiteľa; uložené hodnoty ich prebíjajú (aj prázdny reťazec = vedome prázdne)
  useEffect(() => {
    if (load.state !== 'ready' || !load.mine || f) return;
    const def = flyerDefaults(s);
    const fl = load.mine.flyer ?? {};
    setF({
      headline: fl.headline ?? def.headline, about: fl.about ?? def.about, reward: fl.reward ?? def.reward, thanks: fl.thanks ?? def.thanks,
      place: load.mine.place_label ?? '', phone: load.mine.phone ?? '', deg: typeof fl.direction_deg === 'number' ? nearestDir(fl.direction_deg) : null,
    });
  }, [load, f, s]);

  const data = useMemo<FlyerData | null>(() => {
    if (load.state !== 'ready' || !load.mine || !f) return null;
    const m = load.mine;
    return {
      slug: m.slug, name: m.dog_name, dogGender: m.dog_gender, photo: m.photo, breed: m.breed, color: m.color, place: f.place, lastSeen: m.last_seen_at,
      lat: m.lat, lng: m.lng, phone: f.phone,
      flyer: { headline: f.headline, about: f.about, reward: f.reward, thanks: f.thanks, direction_deg: f.deg },
    };
  }, [load, f]);

  const set = <K extends keyof NonNullable<typeof f>>(k: K, v: NonNullable<typeof f>[K]) => setF((p) => (p ? { ...p, [k]: v } : p));

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
          {load.state === 'loading' || (load.state === 'ready' && load.mine && !f) ? s('pack.sos.loading') : load.state === 'error' ? s('pack.sos.error') : s('pack.sos.notFound')}
        </p>
      </SosTaskShell>
    );
  }
  const mine = load.mine!;

  const save = async () => {
    setBusy('save'); setErr('');
    try {
      const png = await renderPng();
      const url = await flyerUpload(png, mine.slug);
      const flyer: FlyerFields = { headline: f.headline, about: f.about, reward: f.reward, thanks: f.thanks, direction_deg: f.deg };
      await sosUpdate(mine.id, { flyer, flyerUrl: url, phone: f.phone.trim(), place: f.place.trim() });
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
    try { await flyerDownload(await renderPng(), mine.slug); }
    catch (e) { setErr(s('pack.sos.fl.exportFail')); console.warn('sos flyer', e); }
    finally { setBusy(null); }
  };

  const field = (k: 'headline' | 'place' | 'phone' | 'reward' | 'thanks', label: SosKey, extra?: { hint?: SosKey; type?: string }) => (
    <label className="sos-field"><span>{s(label)}</span>
      <input className="pf-field" type={extra?.type ?? 'text'} value={f[k]} maxLength={k === 'phone' ? 40 : 120} onChange={(e) => set(k, e.target.value)} />
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
            <button key={k} type="button" className={`sos-pick${look === k ? ' is-on' : ''}`} aria-pressed={look === k} onClick={() => setLook(k)}>
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
          <textarea className="pf-field" rows={3} maxLength={120} value={f.about} onChange={(e) => set('about', e.target.value)} />
          <span className="sos-small" style={{ textTransform: 'none', letterSpacing: 0 }}>{f.about.length}/120</span>
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
