// DNEŠOK — panel dennej aktivity, kde si člen odklikne skutky so psom a pripíše ☥ (23. 10. 2026).
//
// Matej 23. 10.: *„notifikáciu každý deň pre ľudí — večer, kde odklikajú veci a pripíšu si body…
// môžu si nastaviť, kedy v akom čase"*. Otvára ho ťuk na večernú pripomienku (`?dnes=1`)
// a tlačidlo v okne „Za čo dostávaš oddanosť".
//
// 🔴 Body sa rátajú NA ŽIVÉHO PSA — psy v čipoch sú len živí zaplatení (DB `devotion_today`).
//    Strop a hodnoty drží server (`grant-devotion`); `DEVOTION_DAILY` je len ich zrkadlo.
// Krmenie sa neklikne — pripisuje sa samo podľa stravy v DOG ID (pole v /dogs ešte nie je).
// Štýl = noc + žiara, ten istý ako `DevotionSheet` (DEVOTION má vlastný tmavý svet).
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BackButton } from '@/components/pack/BackButton';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, VEIL_CSS } from '@/components/pack/packTheme';
import { NIGHT, NIGHT_EDGE, NIGHT_INK } from '@/lib/devotionTiers';
import { DEVOTION_DAILY, DEVOTION_FEED, type DevotionDailyKind } from '@/lib/devotion';
import { DevotionMark } from '@/components/pack/profile/meHead';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { supabase } from '@/integrations/supabase/client';
import { grantDevotion } from '@/lib/devotionGrant';
import { readHuman, patchHuman, notifOff, devotionTime } from '@/lib/humanPrefs';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

interface TodayDog { id: string; name: string | null; diet: 'kibble' | 'barf' | null; done: Record<string, number> }
interface Today { day: string; dogs: TodayDog[]; total: number }

const ROWS: Array<{ kind: DevotionDailyKind; icon: string; label: [string, string]; sub: [string, string] }> = [
  { kind: 'walk_short', icon: 'paw',      label: ['pack.dvtoday.walkShort', 'Short walk'],        sub: ['pack.dvtoday.walkShortSub', 'under 20 min · up to 5× a day'] },
  { kind: 'walk',       icon: 'walk',     label: ['pack.dvtoday.walk', 'Walk'],                   sub: ['pack.dvtoday.walkSub', '20 min – 2 hours'] },
  { kind: 'trip_day',   icon: 'mountain', label: ['pack.dvtoday.trip', 'Day trip'],               sub: ['pack.dvtoday.tripSub', 'more than 2 hours'] },
  { kind: 'presence',   icon: 'sun',      label: ['pack.dvtoday.presence', 'Prayer of presence'], sub: ['pack.dvtoday.presenceSub', '10 minutes only with your dog'] },
];

const CSS = `
.dvt-root.pk-veil{z-index:66;align-items:flex-end;padding:0;animation:dvt-fade .3s ease both;}
.dvt-sheet{position:relative;width:100%;max-height:92dvh;display:flex;flex-direction:column;background:${NIGHT};color:${NIGHT_INK};
  border-top:1.5px solid ${NIGHT_EDGE};border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};font-family:${FONT_UI};
  animation:dvt-up .38s cubic-bezier(.2,.8,.2,1) both;}
.dvt-grab{flex:none;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.onDarkBorder};margin:${S.sm}px auto 0;}
.dvt-head{flex:none;display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.lg}px ${S.md}px;}
.dvt-head h2{flex:1;margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;color:${NIGHT_EDGE};}
.dvt-bal{flex:none;display:inline-flex;align-items:center;gap:${S.xs}px;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;color:${NIGHT_EDGE};}
.dvt-body{overflow-y:auto;overscroll-behavior:contain;padding:0 ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);}
.dvt-lbl{margin:0 0 ${S.sm}px;font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};}
.dvt-dogs{display:flex;flex-wrap:wrap;gap:${S.sm}px;margin:0 0 ${S.lg}px;}
.dvt-dog{appearance:none;cursor:pointer;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.onDarkBorder};background:none;
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;letter-spacing:.02em;color:${T.onDarkDim};}
.dvt-dog.on{border-color:${NIGHT_EDGE};color:${NIGHT_INK};background:rgba(201,154,63,.16);}
.dvt-list{margin:0 0 ${S.lg}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.onDarkBorder};background:rgba(0,0,0,.22);}
.dvt-row{appearance:none;width:100%;display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px;background:none;border:0;border-top:1px solid ${T.onDarkBorder};
  color:inherit;font:inherit;text-align:left;cursor:pointer;}
.dvt-row:first-child{border-top:0;}
.dvt-row:disabled{cursor:default;}
.dvt-ic{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:${PACK_R.pill}px;border:1px solid ${NIGHT_EDGE};}
.dvt-tx{flex:1;min-width:0;}
.dvt-tx b{display:block;font-weight:500;font-size:${TX.body}px;color:${NIGHT_INK};}
.dvt-tx small{display:block;margin-top:2px;font-size:${TX.micro}px;color:${T.onDarkDim};}
.dvt-v{flex:none;display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;white-space:nowrap;
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;color:${NIGHT_EDGE};border:1px solid ${NIGHT_EDGE};}
.dvt-row:not(:disabled):active .dvt-v{transform:scale(.96);}
.dvt-v.got{color:#140D07;border-color:transparent;background:linear-gradient(180deg,#F1D58C,${NIGHT_EDGE});filter:drop-shadow(0 0 6px rgba(201,154,63,.35));}
.dvt-n{font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;color:${T.onDarkDim};}
.dvt-feed{display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px;border-top:1px solid ${T.onDarkBorder};}
.dvt-rem{display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.onDarkBorder};}
.dvt-time{flex:none;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.field}px;border:1px solid ${NIGHT_EDGE};background:rgba(0,0,0,.3);color:${NIGHT_INK};
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;color-scheme:dark;}
.dvt-time:disabled{opacity:.4;}
.dvt-sw{flex:none;appearance:none;position:relative;width:44px;height:24px;padding:0;border-radius:${PACK_R.pill}px;border:1px solid ${T.onDarkBorder};background:rgba(255,255,255,.08);cursor:pointer;}
.dvt-sw::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:${PACK_R.pill}px;background:${T.onDarkDim};transition:transform .2s;}
.dvt-sw.on{border-color:${NIGHT_EDGE};background:rgba(201,154,63,.28);}
.dvt-sw.on::after{transform:translateX(20px);background:${NIGHT_EDGE};}
.dvt-note{margin:${S.md}px 0 0;font-size:${TX.micro}px;line-height:1.5;color:${T.onDarkDim};text-align:center;}
.dvt-empty{padding:${S.xl}px 0;text-align:center;font-size:${TX.label}px;color:${T.onDarkDim};}
@media (min-width:768px){
  .dvt-root.pk-veil{align-items:center;padding:${S.xl}px;}
  .dvt-sheet{width:560px;max-height:86dvh;border:1.5px solid ${NIGHT_EDGE};border-radius:${PACK_R.card}px;}
  .dvt-grab{display:none;}
  .dvt-head{padding-top:${S.lg}px;}
  .dvt-body{padding:0 ${S.xl}px ${S.xl}px;}
}
@keyframes dvt-up{from{transform:translateY(100%);}to{transform:none;}}
@keyframes dvt-fade{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.dvt-sheet,.dvt-root.pk-veil{animation:none;}}
`;

export function DevotionToday({ onClose }: { onClose: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [today, setToday] = useState<Today | null>(null);
  const [pick, setPick] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [remOn, setRemOn] = useState(true);
  const [remTime, setRemTime] = useState('20:00');

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('devotion_today' as never);
    if (error || !data) { setToday({ day: '', dogs: [], total: 0 }); return; }
    const d = data as unknown as Today;
    setToday(d);
    setPick((p) => (p.length ? p.filter((id) => d.dogs.some((g) => g.id === id)) : d.dogs.map((g) => g.id)));
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    void readHuman().then(({ human }) => {
      setRemOn(!notifOff(human).includes('devotion_evening'));
      setRemTime(devotionTime(human));
    });
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const sel = (today?.dogs ?? []).filter((g) => pick.includes(g.id));
  // Riadok ukazuje, koľko psov ešte smie dostať body — pes na strope už nedostane nič.
  const used = (k: DevotionDailyKind) => (sel.length ? Math.min(...sel.map((g) => g.done[k] ?? 0)) : 0);
  const fresh = (k: DevotionDailyKind) => sel.filter((g) => (g.done[k] ?? 0) < DEVOTION_DAILY[k].perDay).length;

  const grant = async (kind: DevotionDailyKind) => {
    if (busy || fresh(kind) === 0) return;
    setBusy(kind);
    try {
      await grantDevotion({ kind, dog_ids: sel.map((g) => g.id) });
      await load();
    } catch {
      toast({ title: tx('pack.dog.toastCouldntLog', 'Could not save'), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const saveRem = async (on: boolean, time: string) => {
    const prev = { on: remOn, time: remTime };
    setRemOn(on); setRemTime(time);
    try {
      const { human } = await readHuman();
      const off = notifOff(human).filter((x) => x !== 'devotion_evening');
      await patchHuman({ devotion_time: time, notif_off: on ? off : [...off, 'devotion_evening'] });
    } catch {
      setRemOn(prev.on); setRemTime(prev.time);
      toast({ title: tx('pack.settings.notifErr', 'Could not save') });
    }
  };

  const fmtN = (n: number) => Math.round(n).toLocaleString('sk-SK');
  const feedDogs = (today?.dogs ?? []).filter((g) => g.diet);

  return createPortal(
    <div className="dvt-root pk-veil pk-veil--modal" role="dialog" aria-modal="true" aria-label={tx('pack.dvtoday.title', 'Today')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{VEIL_CSS}</style>
      <style>{CSS}</style>
      <div className="dvt-sheet">
        <span className="dvt-grab" aria-hidden />
        <div className="dvt-head">
          <BackButton tone="dark" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          <h2>{tx('pack.dvtoday.title', 'Today')}</h2>
          {today && today.total > 0 && <span className="dvt-bal">{fmtN(today.total)}<DevotionMark size={16} /></span>}
        </div>
        <div className="dvt-body">
          {today === null ? <div className="dvt-empty">…</div> : today.dogs.length === 0 ? (
            <div className="dvt-empty">{tx('pack.dvtoday.noDogs', 'Devotion is counted for living dogs in the pack.')}</div>
          ) : (
            <>
              {today.dogs.length > 1 && (
                <>
                  <p className="dvt-lbl">{tx('pack.dvtoday.with', 'With whom')}</p>
                  <div className="dvt-dogs">
                    {today.dogs.map((g) => (
                      <button key={g.id} type="button" className={`dvt-dog${pick.includes(g.id) ? ' on' : ''}`}
                        onClick={() => setPick((p) => (p.includes(g.id) ? p.filter((x) => x !== g.id) : [...p, g.id]))}>
                        {(g.name || '').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="dvt-list">
                {ROWS.map((r) => {
                  const { points, perDay } = DEVOTION_DAILY[r.kind];
                  const can = fresh(r.kind);
                  const got = sel.length > 0 && can === 0;
                  return (
                    <button key={r.kind} type="button" className="dvt-row" disabled={!sel.length || got || busy !== null} onClick={() => void grant(r.kind)}>
                      <span className="dvt-ic"><BrandIcon name={r.icon} size={18} /></span>
                      <span className="dvt-tx"><b>{tx(...r.label)}</b><small>{tx(...r.sub)}</small></span>
                      {perDay > 1 && <span className="dvt-n">{used(r.kind)}/{perDay}</span>}
                      <span className={`dvt-v${got ? ' got' : ''}`}>+{points * (got ? sel.length : Math.max(1, can))}<DevotionMark size={12} tint={got ? 'dark' : 'gold'} /></span>
                    </button>
                  );
                })}
                <div className="dvt-feed">
                  <span className="dvt-ic"><BrandIcon name="food" size={18} /></span>
                  <span className="dvt-tx">
                    <b>{tx('pack.dvtoday.feed', 'Feeding')}</b>
                    <small>{(feedDogs.length
                      ? tx('pack.dvtoday.feedAuto', 'added by itself every day · kibble +{k} · BARF +{b}')
                      : tx('pack.dvtoday.feedSoon', 'soon in DOG ID — kibble +{k} · BARF +{b}, added by itself every day'))
                      .replace('{k}', String(DEVOTION_FEED.kibble)).replace('{b}', String(DEVOTION_FEED.barf))}</small>
                  </span>
                </div>
              </div>
            </>
          )}

          <p className="dvt-lbl">{tx('pack.dvtoday.reminder', 'Evening reminder')}</p>
          <div className="dvt-rem">
            <span className="dvt-tx"><b>{tx('pack.dvtoday.remWhen', 'Every day at')}</b><small>{tx('pack.dvtoday.remSub', 'Not sent once you have logged today.')}</small></span>
            <input className="dvt-time" type="time" step={900} value={remTime} disabled={!remOn}
              onChange={(e) => { if (/^\d{2}:\d{2}$/.test(e.target.value)) void saveRem(remOn, e.target.value); }}
              aria-label={tx('pack.dvtoday.remWhen', 'Every day at')} />
            <button type="button" className={`dvt-sw${remOn ? ' on' : ''}`} role="switch" aria-checked={remOn}
              aria-label={tx('pack.dvtoday.reminder', 'Evening reminder')} onClick={() => void saveRem(!remOn, remTime)} />
          </div>
          <p className="dvt-note">{tx('pack.dvtoday.note', 'Devotion is counted for every living dog you were with.')}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
