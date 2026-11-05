// SOS — akcie a okná zdieľané stránkou psa (`/pack/sos/:slug`) aj verejnou `/lost/:slug`:
// kopírovanie odkazu (zdieľanie = `shareLostDog` v `sosKit`), ZAVOLAŤ (číslo až po ťuku), VIDEL SOM HO, STÁLE HĽADÁM (otázka NAŠIEL SA je v `sosClose.tsx`).
// Okná = `PackPopup` (úchyt = gesto, bez šípky). Žiadne „zhasne o X dní“.
import { useState } from 'react';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';
import { toast } from '@/hooks/use-toast';
import { lostPhone, lostUrl } from '@/lib/sos';
import { PackPopup } from '@/components/pack/PackPopup';
import { PF_FIELD_CSS } from '@/components/pack/packTheme';
import { SOS_CSS, type SosT } from './sosShared';

export async function copyLostLink(slug: string, s: SosT): Promise<void> {
  try { await navigator.clipboard.writeText(lostUrl(slug)); toast({ title: s('pack.sos.det.copied') }); }
  catch { toast({ title: lostUrl(slug) }); }
}

/** VIDEL SOM HO — verejná edge funkcia `lost-sighting` (bez prihlásenia): { slug, lat?, lng?, note? }. */
export async function postSighting(slug: string, p: { lat?: number; lng?: number; note?: string }): Promise<void> {
  const r = await fetch(`${EDGE_BASE}/lost-sighting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ slug, ...p }),
  });
  if (!r.ok) throw new Error(`sighting_${r.status}`);
}

const here = () => new Promise<GeolocationPosition>((res, rej) => {
  if (!navigator.geolocation) { rej(new Error('no_geo')); return; }
  navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000, enableHighAccuracy: true });
});

/** ZAVOLAŤ: číslo sa stiahne až po ťuku (`lostPhone`; počíta sa odkrytie). `null` = nenájdený / nájdený (číslo sa skrylo).
 *  Chyba siete / servera / limit (429) NIE JE „číslo nie je dostupné“ — ukáže sa hláška a SKÚSIŤ ZNOVA. */
export function CallPopup({ slug, name, s, onClose }: { slug: string; name: string; s: SosT; onClose: () => void }) {
  const [phone, setPhone] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const reveal = async () => {
    setBusy(true); setErr('');
    try { setPhone(await lostPhone(slug)); }
    catch (e) { setErr((e as Error)?.message === 'rate_limited' ? s('pack.sos.err.rate_limited') : s('pack.sos.offline')); }
    finally { setBusy(false); }
  };
  return (
    <PackPopup title={s('pack.sos.det.callTitle')} onClose={onClose}>
      <style>{PF_FIELD_CSS + SOS_CSS}</style>
      <div className="sos-stack">
        <p className="sos-dogname" style={{ fontSize: 20 }}>{name}</p>
        {phone === undefined ? (
          <>
            {err && <p className="sos-err">{err}</p>}
            <button type="button" className="sos-cta" disabled={busy} onClick={reveal}>{err ? s('pack.sos.retry') : s('pack.sos.det.callOwner')}</button>
          </>
        ) : phone ? (
          <>
            <p className="sos-dogname" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24 }}>{phone}</p>
            <a className="sos-cta" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{s('pack.sos.det.call')}</a>
            <a className="sos-cta sos-cta--ghost" href={`sms:${phone.replace(/[^\d+]/g, '')}`}>{s('pack.sos.det.sms')}</a>
          </>
        ) : <p className="sos-err">{s('pack.sos.det.callNoNumber')}</p>}
      </div>
    </PackPopup>
  );
}

/** VIDEL SOM HO: poznámka + (nepovinne) poloha z prehliadača po súhlase; bez nej ide len text. */
export function SeenPopup({ slug, s, onClose }: { slug: string; s: SosT; onClose: () => void }) {
  const [note, setNote] = useState('');
  const [withLoc, setWithLoc] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const send = async () => {
    setErr('');
    if (!note.trim() && !withLoc) { setErr(s('pack.sos.det.seenEmpty')); return; }   // prázdne hlásenie server odmietne
    setBusy(true);
    let loc: { lat: number; lng: number } | undefined;
    if (withLoc) {
      try { const p = await here(); loc = { lat: p.coords.latitude, lng: p.coords.longitude }; }
      catch { setErr(s('pack.sos.det.seenLocFail')); }
    }
    if (!loc && !note.trim()) { setBusy(false); return; }   // poloha nevyšla a poznámka chýba: nič na odoslanie
    try {
      await postSighting(slug, { ...(loc ?? {}), ...(note.trim() ? { note: note.trim() } : {}) });
      setDone(true);
    } catch (e) { setErr((e as Error)?.message === 'sighting_429' ? s('pack.sos.err.rate_limited') : s('pack.sos.error')); } finally { setBusy(false); }
  };
  return (
    <PackPopup title={s('pack.sos.det.seenTitle')} onClose={onClose}>
      <style>{PF_FIELD_CSS + SOS_CSS}</style>
      <div className="sos-stack">
        {done ? (
          <>
            <p className="sos-p" style={{ textAlign: 'center' }}>{s('pack.sos.det.seenDone')}</p>
            <button type="button" className="sos-cta sos-cta--ghost" onClick={onClose}>{s('pack.sos.close')}</button>
          </>
        ) : (
          <>
            <label className="sos-field"><span>{s('pack.sos.det.seenNote')}</span>
              <textarea className="pf-field" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <label className="sos-pill" style={{ gap: 8, minHeight: 44, cursor: 'pointer' }}>
              <input type="checkbox" checked={withLoc} onChange={(e) => setWithLoc(e.target.checked)} /> {s('pack.sos.det.seenLoc')}
            </label>
            {err && <p className="sos-err">{err}</p>}
            <button type="button" className="sos-cta" disabled={busy} onClick={send}>{s('pack.sos.det.seenSend')}</button>
          </>
        )}
      </div>
    </PackPopup>
  );
}

/** Po 14 dňoch: „Stále hľadáš X?“ (`asked_at`). */
export function AskPopup({ name, s, busy, err, onStill, onFound, onClose }: {
  name: string; s: SosT; busy: boolean; err?: string; onStill: () => void; onFound: () => void; onClose: () => void;
}) {
  return (
    <PackPopup title={s('pack.sos.det.askTitle', { name })} onClose={onClose}>
      <style>{PF_FIELD_CSS + SOS_CSS}</style>
      <div className="sos-stack">
        <p className="sos-p">{s('pack.sos.det.askText')}</p>
        {err && <p className="sos-err">{err}</p>}
        <button type="button" className="sos-cta" disabled={busy} onClick={onStill}>{s('pack.sos.det.stillBtn')}</button>
        <button type="button" className="sos-cta sos-cta--green" disabled={busy} onClick={onFound}>{s('pack.sos.det.foundBtn')}</button>
      </div>
    </PackPopup>
  );
}
