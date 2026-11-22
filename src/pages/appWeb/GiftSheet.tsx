/** DAR BEZ REGISTRÁCIE z webu (Matej 22. 11. 2026: blok „Nehráš? Aj tak môžeš POMÔCŤ“ zanikol, ostala veta vo FAQ
 *  „…alebo nás podpor bez registrácie TU“). Ten istý dar ako v profile appky (`MisiaGroup.tsx` · GiftForm) a ten istý
 *  server `prispevok` — len s `back:'web'`, takže Stripe vráti človeka na homepage s `?dakujeme=cs_…`.
 *  Dar sa sám pripočíta do pokladnice (Rozvoj). Nič zaň nedostane — inak by to nebol dar, ale platba za službu.
 *  Texty formulára = `carry.*` z i18n appky; nadpis a popis = `gift_*` v `claim22.ts`. */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { EDGE_BASE } from '@/lib/env';
import { GIFT_TIERS, GIFT_DEFAULT, GIFT_MIN, GIFT_MAX, giftFee } from '@/lib/prispevok';

type Thanks = { paid: boolean; amount: number; interval: 'month' | 'once'; next: string | null; manage: string | null };

async function call<R>(body: Record<string, unknown>): Promise<R> {
  const r = await fetch(`${EDGE_BASE}/prispevok`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error ?? `http_${r.status}`);
  return j as R;
}

/** Návrat zo Stripe: `?dakujeme=cs_…` → zhrnutie pre poďakovanie; `?zrusene=1` → nič sa nestiahlo. Adresu hneď upracme. */
export function useGiftReturn() {
  const [thanks, setThanks] = useState<Thanks | null>(null);
  const [canceled, setCanceled] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const sid = q.get('dakujeme');
    if (!sid && !q.has('zrusene')) return;
    if (sid) call<Thanks>({ action: 'session', session_id: sid }).then((t) => { if (t.paid) setThanks(t); }).catch(() => {});
    else setCanceled(true);
    q.delete('dakujeme'); q.delete('zrusene');
    const qs = q.toString().replace(/=(?=&|$)/g, '');  /* „?claim“ ostane „?claim“, nie „?claim=“ */
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
  }, []);
  return { thanks, canceled, close: () => { setThanks(null); setCanceled(false); } };
}

export function GiftSheet({ c, onClose, thanks, canceled }: { c: (k: string) => string; onClose: () => void; thanks?: Thanks | null; canceled?: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const loc = intlLocale(lang);
  const [monthly, setMonthly] = useState(false);  /* z webu najčastejšie jednorazovo; mesačne je o ťuk vedľa */
  const [amount, setAmount] = useState<number>(GIFT_DEFAULT);
  const [own, setOwn] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', k); document.documentElement.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.documentElement.style.overflow = ''; };
  }, [onClose]);

  const e2 = (n: number) => `${n.toLocaleString(loc, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`;
  const ownNum = own ? Math.round(Number(own.replace(',', '.'))) : NaN;
  const value = own ? ownNum : amount;
  const valid = Number.isFinite(value) && value >= GIFT_MIN && value <= GIFT_MAX;
  const fee = valid ? giftFee(value, monthly) : 0;
  const gl = lang === 'sk' || lang === 'cs' ? lang : 'en';
  const give = async () => {
    if (!valid || busy) return;
    setBusy(true); setErr(false);
    try {
      const { url } = await call<{ url: string }>({ action: 'checkout', amount: value, interval: monthly ? 'month' : 'once', lang: gl, back: 'web' });
      location.href = url;
    } catch { setErr(true); setBusy(false); }
  };
  const next = thanks?.next ? new Date(thanks.next).toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' }) : '';

  /* portál do body: `.aw` drží vlastnú vrstvu, takže závoj by inak ostal POD AINUBIS bublinou (z 60) */
  return createPortal(
    <div className="aw gift-root"><div className="gift-veil" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gift pk-stage" role="dialog" aria-modal="true" aria-labelledby="gift-h">
        <button type="button" className="gift-x" aria-label={c('pl_back')} onClick={onClose}><i /><i /></button>
        <img className="gift-ic" src="/web-app/ikony/centra.webp" alt="" />
        {thanks ? (<>
          <h3 id="gift-h">{t('carry.thanks.h')}</h3>
          <p className="gift-p">{t('carry.thanks.p')}</p>
          <div className="gift-kv">
            <span>{thanks.interval === 'month' ? t('carry.monthly') : t('carry.once')}</span><b>{e2(thanks.amount)}</b>
            {next && <><span>{t('carry.thanks.next')}</span><b>{next}</b></>}
            <span>{t('carry.thanks.receipt')}</span><b>{t('carry.thanks.inMail')}</b>
          </div>
          {thanks.manage && <a className="gift-link" href={thanks.manage}>{t('carry.thanks.manage')}</a>}
          <button type="button" className="pk-cta" onClick={onClose}>{c('gift_back')}</button>
        </>) : canceled ? (<>
          <h3 id="gift-h">{c('gift_h')}</h3>
          <p className="gift-p">{t('carry.canceled')}</p>
          <button type="button" className="pk-cta" onClick={onClose}>{c('gift_back')}</button>
        </>) : (<>
          <h3 id="gift-h">{c('gift_h')}</h3>
          <p className="gift-p">{c('gift_p')}</p>
          <div className="gift-tog" role="group">
            <button type="button" className={monthly ? '' : 'pk-pick'} aria-pressed={!monthly} onClick={() => setMonthly(false)}>{t('carry.once')}</button>
            <button type="button" className={monthly ? 'pk-pick' : ''} aria-pressed={monthly} onClick={() => setMonthly(true)}>{t('carry.monthly')}</button>
          </div>
          <div className="gift-tiers">
            {GIFT_TIERS.map((g) => (
              <button key={g.eur} type="button" className={!own && amount === g.eur ? 'pk-pick' : ''} aria-pressed={!own && amount === g.eur} onClick={() => { setAmount(g.eur); setOwn(''); }}>
                <b>{g.eur} €</b><span>{t(`carry.tier.${g.key}`)}</span>
              </button>
            ))}
          </div>
          <label className="gift-own">{t('carry.own')}
            <input inputMode="numeric" value={own} placeholder="20" onChange={(e) => setOwn(e.target.value.replace(/[^\d.,]/g, ''))} />
            <span>€</span>
          </label>
          <p className="gift-fee">{valid
            ? t('carry.fee').replace('{a}', e2(value)).replace('{f}', e2(fee))
            : t('carry.min').replace('{min}', String(GIFT_MIN)).replace('{max}', String(GIFT_MAX))}</p>
          <button type="button" className="pk-cta" disabled={!valid || busy} onClick={give}>
            {(monthly ? t('carry.cta.month') : t('carry.cta.once')).replace('{a}', valid ? e2(value) : '')}
          </button>
          <p className="gift-hint">{t('carry.hint')}</p>
          {err && <p className="gift-err" role="alert">{t('carry.err')}</p>}
          <p className="gift-legal">{t('carry.legal')}</p>
        </>)}
      </div>
    </div></div>,
    document.body,
  );
}
