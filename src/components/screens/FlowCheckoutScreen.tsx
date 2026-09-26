import { createPortal } from 'react-dom';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { HandArrowLeft } from '@/components/pack/HandIcons';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS, HF } from '@/components/screens/flowPaleSkin';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { PACK_R } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { EDGE_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';
import { getStoredRef } from '@/lib/refCapture';
import { getAttribution } from '@/lib/attribution';
import { suggestEmailFix } from '@/lib/emailTypo';
import { saveCheckoutDraft } from '@/lib/checkoutDraft';
import { FlowPanelShell, FLOW_PANEL_CSS } from '@/components/screens/flowPanel';
import { FlowStayChoice } from '@/components/screens/FlowStayScreen';
import { FlowMoreInfo } from '@/components/screens/flowMoreInfo';
import {
  readSvorka, svorkaDogPayload, waitForStablePhotos, PRICE_MEMBER, PRICE_ANGEL, type SvorkaDog,
} from '@/lib/flowSvorka';

// ════════════════════════════════════════════════════════════════════════════
// B · POKLADŇA — checkout + platba na jednej obrazovke (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Nákres `plany/nakres-chvost-flowu-2026-09-25.html` (obrazovka B), Matej:
// *„súhlasím s návrhom"*. Nahrádza v NOVOM vstupe dvojicu `CheckoutScreen` +
// `PaymentScreen`; tie sa NEMAŽÚ, LIVE po nich chodí (lock „do FLIPu sa LIVE
// nedotýkame"). Router vymieňa komponent na `/checkout` podľa `NEW_HEROFLOW`.
//
// 🔑 ČO TU UŽ NIE JE:
//    · FORMULÁR. Meno (krok 8) aj e-mail (krok 4) flow už pozná, takže sú tu
//      len ako zhrnutie s tlačidlom ZMENIŤ — upravujú sa NA MIESTE, nie
//      návratom o päť krokov (tam by ďalej viedla celá reťaz znova).
//    · ADRESA. Matej 25. 9.: *„dajme cez stripe"* (nákres
//      `plany/nakres-adresa-u-nas-vs-stripe-2026-09-25.html`). Pýta ju Stripe
//      (`billing_address_collection`), webhook ju zapíše do `bill_*`.
//
// 🐕 SVORKA. Každý pes je riadok s vlastnou cenou: €11, psí anjel sa dá
//    prepnúť na €1 (Matej 25. 9.) a dostane PLNÉ členstvo. Spolu = súčet.
//
// ⚠️ E-MAIL SA UKAZUJE CELÝ a pred platbou naposledy (člen #60, 6. 8. 2026:
//    preklep `cabane@` bol platná adresa, certifikát aj prístup odišli cudzím).
// ════════════════════════════════════════════════════════════════════════════

const CREATE_CHECKOUT_URL = `${EDGE_BASE}/create-checkout`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Mriežka kariet psov (25. 9. 2026) zanikla 26. 9. — psi sú v pokladni v RADE
   ako riadok položky, nie ako karty (Matej: *„mená psov kľudne vedľa seba v rade"*). */

export function FlowCheckoutScreen() {
  useFlowKeyboardFix();
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const flowOk = useFlowGuard();

  const ownerName = useDogyptStore((s) => s.ownerName);
  const setOwnerName = useDogyptStore((s) => s.setOwnerName);
  const email = useDogyptStore((s) => s.email);
  const setEmail = useDogyptStore((s) => s.setEmail);
  const extraPhotos = useDogyptStore((s) => s.extraPhotos);
  // Svorka sa číta pri vykreslení — obrazovka psov nemení, len ich platí.
  const extraDogs = useDogyptStore((s) => s.extraDogs);
  const dogName = useDogyptStore((s) => s.dogName);
  const dogs = useMemo(() => readSvorka(), [extraDogs, dogName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── CENA NA PSA ───────────────────────────────────────────────────────────
  /** Anjeli, ktorým človek prepol cenu na €1. Predvolene stojí aj anjel €11. */
  const [angelLow, setAngelLow] = useState<Record<string, boolean>>({});
  const priceOf = (d: SvorkaDog) =>
    d.lifeStatus === 'deceased' && angelLow[d.flowId] ? PRICE_ANGEL : PRICE_MEMBER;
  const base = dogs.reduce((sum, d) => sum + priceOf(d), 0);

  // ── ÚPRAVA MENA A E-MAILU NA MIESTE ───────────────────────────────────────
  const [edit, setEdit] = useState<'name' | 'email' | null>(null);
  const [draft, setDraft] = useState('');
  const openEdit = (what: 'name' | 'email') => {
    setDraft(what === 'name' ? ownerName : email);
    setEdit(what);
  };
  const draftOk = edit === 'email' ? EMAIL_RE.test(draft.trim()) : draft.trim().length > 0;
  const emailFix = edit === 'email' && draftOk ? suggestEmailFix(draft.trim()) : null;
  const saveEdit = () => {
    if (!draftOk) return;
    const v = draft.trim();
    if (edit === 'name') setOwnerName(v);
    else {
      setEmail(v);
      saveCheckoutDraft(v, lang);
      track('checkout_email_changed');
    }
    setEdit(null);
  };

  // ── PROMO ─────────────────────────────────────────────────────────────────
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoState, setPromoState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  const [discount, setDiscount] = useState<{ percentOff: number | null; amountOff: number | null } | null>(null);
  const applyPromo = async () => {
    const code = promoCode.trim();
    if (!code || promoState === 'checking') return;
    setPromoState('checking');
    try {
      const res = await fetch(`${EDGE_BASE}/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = res.ok ? await res.json() : { valid: false };
      if (data.valid) {
        setDiscount({ percentOff: data.percentOff ?? null, amountOff: data.amountOff ?? null });
        setPromoState('ok');
        track('promo_applied', { code });
      } else setPromoState('bad');
    } catch {
      // Sieťová chyba ≠ neplatný kód — kód sa pošle a overí ho Stripe.
      setPromoState('idle');
    }
  };
  const total = (() => {
    if (promoState !== 'ok' || !discount) return base;
    if (discount.amountOff != null) return Math.max(0, base - discount.amountOff / 100);
    if (discount.percentOff != null) return Math.max(0, base * (1 - discount.percentOff / 100));
    return base;
  })();
  const totalShown = Math.round(total * 100) / 100;

  // ── KAM IDÚ PENIAZE (zbalené) ─────────────────────────────────────────────
  /** Panel nad doskou: ČO DOSTANEŠ alebo KAM IDÚ PENIAZE. */
  const [panel, setPanel] = useState<'get' | null>(null);
  /** ZADRŽANIE ako popup (Matej 26. 9. 2026). `?stay=1` ho otvorí hneď —
   *  tam presmeruje stará adresa `/heroglyph/stay`. */
  const [stay, setStay] = useState(() => new URLSearchParams(window.location.search).get('stay') === '1');

  // ── PLATBA ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [waitingPhoto, setWaitingPhoto] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const pay = async () => {
    if (loading || edit) return;
    setLoading(true);
    setPayError(null);
    try {
      setWaitingPhoto(true);
      const stable = await waitForStablePhotos();
      setWaitingPhoto(false);
      if (stable.some((d) => d.photo?.startsWith('blob:'))) {
        setPayError(t('payment.photoNotReady'));
        setLoading(false);
        return;
      }
      track('payment_initiated', { amount: base, dogs: stable.length });
      const res = await fetch(CREATE_CHECKOUT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ownerName,
          dogs: stable.map((d) => svorkaDogPayload(d, ownerName, priceOf(d))),
          // Extra fotky z kroku 1 patria prvému psovi (tak ich ukladal aj starý vstup).
          cloudinaryExtras: extraPhotos.filter((u) => u && !u.startsWith('blob:')),
          refCode: getStoredRef(),
          promoCode: promoCode.trim() || undefined,
          language: lang,
          ...getAttribution(),
        }),
      });
      const data = res.ok ? await res.json() : null;
      if (!data?.url) {
        console.error('create-checkout failed:', res.status, data?.error);
        setPayError(t('payment.error'));
        setLoading(false);
        return;
      }
      window.open(data.url, '_top');
      setTimeout(() => setLoading(false), 2000);
    } catch (err) {
      console.error('payment fetch error:', err);
      setPayError(t('payment.error'));
      setLoading(false);
      setWaitingPhoto(false);
    }
  };

  if (!flowOk) return null;

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_CARVE_CSS}{FLOW_PANEL_CSS}{CHECKOUT_CSS}</style>

      {/* Hlavička BEZ loga a jazyka (Matej 25. 9. 2026: *„blok je malý — daj
          preč horné logo, jazyk, šípku dozadu do stredu"*). Punc nesie pečať
          na doske, nie logo nad ňou. */}
      <div className="hf-topbar flex-shrink-0 co-top">
        <button
          type="button"
          className="co-back"
          onClick={() => navigate('/heroglyph/reveal')}
          aria-label={t('nav.aria.back')}
        >
          <HandArrowLeft size={20} />
        </button>
      </div>

      <div className="hf-stage">
        <div className="w-full max-w-xl flex flex-col items-center">
          {/* Nadpis „Posledný krok" zanikol: punc záveru nesie veľká pečať a nadpis
              by pod ňou zmizol (Matej 25. 9. 2026). Kľúč ostáva v i18n. */}

          <motion.div
            className={`hf-block hf-carved co-stack${dogs.length > 2 ? ' co-stack--many' : ''}${panel || stay ? ' is-veiled' : ''}${stay && panel !== 'get' ? ' is-staying' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            {/* Zlatá pečať DOGYPTU na hornej hrane dosky — „správny punc na záver"
                (Matej 25. 9. 2026). Tá istá pečať ako na faktúre a certifikáte. */}
            <img className="co-seal" src="/images/peciat-dogypt.png" alt="" aria-hidden />
            <div className="hf-plate">

              {/* ── KTO PLATÍ ─────────────────────────────────────────────── */}
              {edit ? (
                <div className="co-edit">
                  <input
                    className={`hf-field${draftOk ? ' is-valid' : ''}`}
                    type={edit === 'email' ? 'email' : 'text'}
                    autoComplete={edit === 'email' ? 'email' : 'name'}
                    value={draft}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); }}
                  />
                  {emailFix && (
                    <button type="button" className="hf-hint" onClick={() => setDraft(emailFix)}>
                      {t('heroglyph.checkout.emailTypo').replace('{suggestion}', emailFix)}
                    </button>
                  )}
                  <div className="co-edit-row">
                    <button type="button" className="hf-skip" onClick={() => setEdit(null)}>
                      {t('heroglyph.flow.checkoutNew.cancel')}
                    </button>
                    <button type="button" className="co-mini" disabled={!draftOk} onClick={saveEdit}>
                      {t('heroglyph.flow.checkoutNew.save')}
                    </button>
                  </div>
                </div>
              ) : (
                /* Meno a e-mail VEDĽA SEBA, oddelené rytinou (Matej 25. 9.). */
                <div className="co-who">
                  <div className="co-who-cell">
                    <span className="co-who-top">
                      <span className="co-who-k">{t('heroglyph.flow.checkoutNew.name')}</span>
                      <button type="button" className="co-mini" onClick={() => openEdit('name')}>
                        {t('heroglyph.flow.owner.orderChange')}
                      </button>
                    </span>
                    <span className="co-who-v">{ownerName || '—'}</span>
                  </div>
                  <span className="co-who-rule" aria-hidden />
                  <div className="co-who-cell">
                    <span className="co-who-top">
                      <span className="co-who-k">{t('heroglyph.flow.checkoutNew.email')}</span>
                      <button type="button" className="co-mini" onClick={() => openEdit('email')}>
                        {t('heroglyph.flow.owner.orderChange')}
                      </button>
                    </span>
                    {/* Zlom smie prísť len pred zavináčom — nie uprostred domény. */}
                    <span className="co-who-v co-who-mail">
                      {email.split('@')[0]}<wbr />{email.includes('@') ? `@${email.split('@').slice(1).join('@')}` : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* ── ČO KUPUJEŠ = BLEDÝ RÁM ÚČTENKY (Matej 26. 9. 2026, druhé kolo) ──
                  *„priestor kde má byť položka musí byť v nejakom bledšom ráme, a na
                  miesto item by som dal WHAT YOU BUY — a do políčka už názov položky
                  ale menším"* + nákres: WHAT YOU BUY nad rámom · ITEM: · HEROGLYPH FOR:
                  · psi s cenou vpravo · +MEMBERSHIP (podčiarknuté, v jednom riadku,
                  otvára VIAC INFO) · free · TOTAL. Ranná verzia (veľký podčiarknutý
                  názov na dva riadky bez rámu) Matej zamietol: *„vyzerá to hrozne"*. */}
              <p className="hf-legend co-buy">{t('heroglyph.flow.checkoutNew.whatYouBuy')}</p>
              <div className="co-bill">
                <span className="co-item-k">{t('heroglyph.flow.checkoutNew.itemLabel')}</span>
                <span className="co-item-t">{t('heroglyph.flow.checkoutNew.itemTitle')}</span>
                <ul className="co-dogs">
                  {dogs.map((d) => {
                    const angel = d.lifeStatus === 'deceased';
                    return (
                      <li key={d.flowId} className="co-dog">
                        {d.photo
                          ? <img className="co-dog-ph" src={d.photo} alt="" />
                          : <span className="co-dog-ph co-dog-ph--empty">{(d.dogName || '?').slice(0, 1)}</span>}
                        <span className="co-dog-name">{d.dogName}</span>
                        {angel ? (
                          <span className="co-seg" role="radiogroup" aria-label={t('heroglyph.flow.checkoutNew.angel')}>
                            {[PRICE_MEMBER, PRICE_ANGEL].map((p) => {
                              const on = priceOf(d) === p;
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  role="radio"
                                  aria-checked={on}
                                  className={`co-seg-b${on ? ' on' : ''}`}
                                  onClick={() => setAngelLow((s) => ({ ...s, [d.flowId]: p === PRICE_ANGEL }))}
                                >
                                  €{p}
                                </button>
                              );
                            })}
                          </span>
                        ) : (
                          <span className="co-dog-price">€{PRICE_MEMBER}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="co-bill-row">
                  <button type="button" className="co-member-link" onClick={() => setPanel('get')}>
                    {t('heroglyph.flow.checkoutNew.memberLine')}
                  </button>
                  <span className="co-free">{t('heroglyph.flow.checkoutNew.free')}</span>
                </div>
                <div className="co-total">
                  <span>{t('heroglyph.flow.checkoutNew.total')}</span>
                  <b>
                    {totalShown < base && <s>€{base}</s>}
                    €{totalShown}
                  </b>
                </div>
              </div>
              {!promoOpen && (
                <button type="button" className="hf-hint co-promo-ask" onClick={() => setPromoOpen(true)}>
                  {t('heroglyph.flow.checkoutNew.promoAsk')}
                </button>
              )}
              {promoOpen && (
                <div className="co-promo">
                  <input
                    className={`hf-field co-promo-f${promoState === 'ok' ? ' is-valid' : ''}`}
                    value={promoCode}
                    maxLength={32}
                    placeholder={t('payment.promo.placeholder')}
                    readOnly={promoState === 'ok'}
                    onChange={(e) => { setPromoCode(e.target.value); setPromoState('idle'); setDiscount(null); }}
                  />
                  <button
                    type="button"
                    className="co-mini"
                    disabled={!promoCode.trim() || promoState === 'checking' || promoState === 'ok'}
                    onClick={applyPromo}
                  >
                    {promoState === 'checking'
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : promoState === 'ok' ? t('payment.promo.applied') : t('payment.promo.apply')}
                  </button>
                  {/* Cesta späť (Matej 25. 9. 2026). Neplatný kód sa zahodí, uplatnený ostáva. */}
                  <button
                    type="button"
                    className="hf-hint co-promo-back"
                    onClick={() => {
                      setPromoOpen(false);
                      if (promoState !== 'ok') { setPromoCode(''); setPromoState('idle'); setDiscount(null); }
                    }}
                  >
                    {t('heroglyph.flow.checkoutNew.promoBack')}
                  </button>
                </div>
              )}
              {promoState === 'bad' && <p className="co-err">{t('payment.promo.invalid')}</p>}

              {/* ── ZAPLATIŤ / NECHCEM PLATIŤ — vedľa seba. Plná plocha patrí
                  jedinému CTA (brand lock), odmietnutie je obrysové. Vedie na
                  ZADRŽANIE (obrazovka C): kto vstúpil, odchádza aspoň so psom
                  na stene (Matej 25. 9.). ── */}
              {/* ZAPLATIŤ VPRAVO, bližšie k palcu, 70 % · NECHCEM PLATIŤ vľavo 30 %
                  (Matej 25. 9. 2026: *„pozitívne napravo, bližšie k palcu"*). */}
              {/* Rytina nad CTA (Matej 25. 9. 2026) — ten istý vlys ako pri „Čo
                  dostaneš", len bez nápisu. */}
              <p className="hf-legend co-rule" aria-hidden />
              {/* POD SEBOU (Matej 26. 9. 2026: *„obidve CTA môžu byť pod sebou"*):
                  ZAPLATIŤ plné hore, NECHCEM PLATIŤ obrysové pod ním. */}
              <div className="co-actions">
                <button type="button" className="hf-cta" onClick={pay} disabled={loading || !!edit}>
                  {loading
                    ? <span className="co-cta-in"><Loader2 className="h-4 w-4 animate-spin" />{waitingPhoto ? t('payment.sealing') : t('payment.preparing')}</span>
                    : t('heroglyph.flow.checkoutNew.pay', { sum: `€${totalShown}` })}
                </button>
                <button type="button" className="co-decline" onClick={() => setStay(true)} disabled={loading}>
                  {t('heroglyph.flow.checkoutNew.decline')}
                </button>
                <p className="co-secure">{t('heroglyph.flow.checkoutNew.secureShort')}</p>
              </div>
              {payError && <p role="alert" className="co-err">{payError}</p>}

              {createPortal(
                <AnimatePresence>
                  {(panel || stay) && (
                    <motion.div
                      key="veil"
                      className="co-veil"
                      aria-hidden
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>,
                document.body,
              )}
              <AnimatePresence>
                {panel === 'get' && (
                  <FlowPanelShell key="get" className="co-more-info" label={t('heroglyph.flow.more.eyebrow')} onClose={() => setPanel(null)}>
                    <FlowMoreInfo onClose={() => setPanel(null)} />
                  </FlowPanelShell>
                )}
                {stay && panel !== 'get' && (
                  <FlowPanelShell key="stay" className="co-stay" label={t('heroglyph.flow.checkoutNew.decline')} onClose={() => setStay(false)}>
                    <FlowStayChoice onMember={() => setStay(false)} onMore={() => setPanel('get')} />
                  </FlowPanelShell>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

/**
 * Šat pokladne. Doska, vlys, pole a CTA sú z `FLOW_PALE_CSS` + `FLOW_CARVE_CSS`;
 * tu je len to, čo má iba pokladňa. Čísla zo stupníc `/pack` (4·8·12·16…,
 * písmo 10·12·14·16·20).
 */
const CHECKOUT_CSS = `
.co-kicker {
  margin: 0 0 12px; text-align: center;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px;
  letter-spacing: 0.14em; text-transform: uppercase; color: ${LAB.inkSoft};
}
.co-stack .hf-plate { gap: 12px; container-type: inline-size; position: relative; }
.co-center { align-self: center; }

/* Kto platí — zhrnutie, nie formulár. */
.co-who { display: grid; grid-template-columns: minmax(0, 1fr) 2px minmax(0, 1fr); gap: 12px; }
.co-who-cell { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.co-who-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.co-who-top .co-mini { height: 22px; padding: 0 8px; }
/* Zvislá rytina — dvojica čiar ako vlys (\`.hf-legend\`): tieň + svetlo. */
.co-who-rule {
  align-self: stretch; border-radius: 1px;
  background: linear-gradient(90deg, rgba(120, 86, 26, 0.34) 0 1px, rgba(255, 252, 240, 0.72) 1px 2px);
}
.co-who-k {
  font-family: 'Space Grotesk', sans-serif; font-weight: 500;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: ${LAB.inkMuted};
}
.co-who-v {
  max-width: 100%; font-family: 'Space Grotesk', sans-serif; font-weight: 600;
  font-size: 14px; color: ${LAB.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* E-mail sa NESKRACUJE — preklep musí byť vidno celý (člen #60). */
.co-who-mail { white-space: normal; overflow-wrap: anywhere; }
@container (max-width: 479px) { .co-who .co-who-v { font-size: 12px; } }
.co-mini {
  flex: 0 0 auto; height: 26px; padding: 0 12px; display: inline-flex; align-items: center; gap: 4px;
  border-radius: ${PACK_R.pill}px; border: 1.5px solid ${LAPIS.edge}; color: ${LAPIS.edge};
  background: transparent; cursor: pointer;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  transition: background 150ms ease, color 150ms ease, opacity 150ms ease;
}
.co-mini:hover:not(:disabled) { background: ${LAPIS.edge}; color: #FDF7E7; }
.co-mini:disabled { opacity: .4; cursor: default; }
.co-edit { display: flex; flex-direction: column; gap: 8px; }
.co-edit-row { display: flex; justify-content: space-between; align-items: center; }

/* Psi POD SEBOU ako riadky účtenky: miniatúra · meno · cena vpravo (nákres 26. 9.). */
.co-dogs {
  list-style: none; margin: 0; padding: 0; width: 100%;
  display: flex; flex-direction: column; gap: 6px; max-height: 132px; overflow-y: auto;
}
.co-dog { display: flex; align-items: center; gap: 8px; }
.co-dog-ph {
  flex: 0 0 auto; width: 28px; height: 28px; border-radius: 999px;
  object-fit: cover; border: 1.5px solid ${LAB.hairline};
}
.co-dog-ph--empty {
  display: grid; place-items: center; font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 12px; color: ${LAB.inkMuted};
}
.co-dog-name {
  flex: 1 1 auto; min-width: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 500;
  font-size: 14px; letter-spacing: 0.04em; text-transform: uppercase; color: ${LAB.ink};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.co-dog-price { font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${LAB.inkSoft}; }
.co-seg { display: inline-flex; gap: 4px; }
.co-seg-b {
  height: 26px; min-width: 40px; padding: 0 8px; cursor: pointer;
  border-radius: ${PACK_R.pill}px; border: 1.5px solid ${LAB.hairline};
  background: transparent; color: ${LAB.inkSoft};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
}
.co-seg-b:hover { border-color: ${LAPIS.edge}; }
.co-seg-b.on { border-color: ${LAPIS.edge}; background: ${LAPIS.fill}; color: ${LAPIS.edge}; }

/* Hlavička: len šípka späť, v strede. */
.co-top { display: flex; justify-content: center; padding: 12px 0 4px; }
.co-back {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 999px; background: transparent; cursor: pointer;
  /* Obrys v krúžku — tá istá šípka ako na krokoch pred pokladňou (PageTopBar brandBack). */
  border: 1.5px solid rgba(120, 86, 26, 0.55); color: #3C2A0E;
}
.co-back:hover { background: rgba(201, 154, 63, 0.14); }

/* Pečať na hornej hrane dosky — VEĽKÁ (Matej 25. 9. 2026: *„chcel som ju
   veľkú, zväčši aspoň o 200 %"* ⇒ 80 → 240 px). Veľkosť drží výška okna, nie
   pevné číslo: na nízkom okne sa scvrkne a doska sa zmestí bez scrollu. Polovica
   pečate visí nad rámom, druhá polovica zaberá hornú časť dosky. */
.co-stack { --seal: clamp(120px, 24dvh, 240px); margin-top: calc(var(--seal) * 0.42); }
.co-seal {
  position: absolute; z-index: 3; left: 50%; top: 0; width: var(--seal); height: var(--seal);
  transform: translate(-50%, -58%) rotate(-5deg); pointer-events: none;
  filter: drop-shadow(0 6px 12px rgba(60, 40, 10, 0.35));
}
.co-stack .hf-plate { padding-top: calc(var(--seal) * 0.42 + 8px); }
/* Viac psov = viac riadkov kariet ⇒ pečať sa scvrkne (Matej 25. 9. 2026). */
.co-stack--many { --seal: clamp(88px, 13dvh, 160px); }
@media (max-height: 700px) {
  .co-stack { --seal: 18dvh; }
  .co-stack--many { --seal: 12dvh; }
}

/* ⚠️ ZELENÁ je tu Matejova výslovná voľba. Inde v appke zelená znamená TIP
   alebo SPLNENÉ; tón je ten istý ako 100 % DOG ID (#3D7A4E), nie nový. */
.co-more {
  height: 28px; padding: 0 16px; border-radius: 999px; border: 0; cursor: pointer;
  background: #3D7A4E; color: #FDF7E7;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px; letter-spacing: .14em; text-transform: uppercase;
  box-shadow: 0 2px 6px rgba(30, 60, 38, 0.25);
}
.co-more:hover { background: #336A43; }
.co-more:focus-visible { outline: 2px solid #3D7A4E; outline-offset: 2px; }
/* ZÁVOJ pri otvorenom paneli (Matej 25. 9. 2026: *„zatmaví sa celé pozadie aj
   logo aj šípka… aby pečať nebola vidno pri popupoch"*). Vrstva cez CELÉ okno
   v portáli do <body> — tieň z bloku orezal \`.hf-stage\` a lišta s logom ostala
   svetlá. Blok ide nad závoj, pečať zmizne. Ťuk do závoja zatvára panel
   (\`FlowPanel\` počúva ťuk mimo seba). */
.co-more-info.fp-panel { padding: 16px 20px; }
.co-stay.fp-panel { overflow-y: auto; overscroll-behavior: contain; padding: 16px; }
/* Centrovať margin:auto na dieťati, nie justify-center (pretečenie by sa nedalo odrolovať hore). */
.co-stay > .st-wrap { margin: auto 0; }
/* ZADRŽANIE: panel bol \`inset: 0\` DOSKY, takže mal len jej výšku — a tá závisí
   od obsahu pokladne (počet psov, promo). Na 390×844 v dielni tlačidlá odrezalo
   (Matej 26. 9.: *„zadržanie preteká a máš to aj na screene"*). Kým je otvorené,
   obsah pokladne pod závojom zmizne a panel stojí V TOKU — doska má jeho výšku,
   nie opačne. */
.co-stack.is-staying > .hf-plate { padding: 0; }
.co-stack.is-staying > .hf-plate > *:not(.co-stay) { display: none; }
.co-stack.is-staying .co-stay.fp-panel { position: relative; inset: auto; overflow: visible; }
.co-veil { position: fixed; inset: 0; z-index: 60; background: rgba(8, 6, 4, 0.62); }
/* \`.hf-stage\` je vlastná vrstva (z 1) ⇒ z-index bloku sa nad závoj nedostane;
   zdvihne sa celé javisko. Tapeta aj lišta s logom sú mimo neho, ostanú pod závojom. */
.hf-stage:has(.co-stack.is-veiled) { z-index: 61; }
.co-seal { transition: opacity 200ms ease; }
.co-stack.is-veiled .co-seal { opacity: 0; }

/* Mobil: ZAPLATIŤ hore, NECHCEM PLATIŤ pod ním (Matej 26. 9.: *„obidve CTA
   môžu byť pod sebou"*). */
.co-actions { display: flex; flex-direction: column; gap: 8px; }
.co-actions > button { width: 100%; }
/* Nákres Mateja 26. 9. (druhé kolo): aj na mobile NECHCEM hore, ZAPLATIŤ pod ním —
   prebíja ranné „ZAPLATIŤ hore". Na PC to isté poradie zľava doprava (30/70). */
.co-actions > .co-decline { order: 1; }
.co-actions > .hf-cta { order: 2; }
.co-actions > .co-secure { order: 3; }
/* PC: opäť VEDĽA SEBA 30/70 (Matej 26. 9. ~15:00) — NECHCEM PLATIŤ vľavo
   obrysové, ZAPLATIŤ lapis vpravo, texty na jeden riadok. Poradie cez \`order\`,
   aby na mobile ostalo plné CTA hore. */
@media (min-width: 601px) {
  .co-actions { display: grid; grid-template-columns: 3fr 7fr; gap: 8px 12px; }
  .co-actions > .co-decline { order: 1; white-space: nowrap; }
  .co-actions > .hf-cta { order: 2; white-space: nowrap; }
  .co-actions > .co-secure { order: 3; grid-column: 1 / -1; }
}

/* ── ČO KUPUJEŠ: bledý rám účtenky (nákres Mateja 26. 9.) ─────────────────── */
.co-buy { margin-bottom: -4px; }
.co-bill {
  display: flex; flex-direction: column; gap: 8px; padding: 12px 16px;
  /* Bledý PAPYRUS, nie biela (Matej 26. 9.: *„daj len bledší v brande, lebo to bije
     do očí“*) — o tón svetlejší než doska, rám vlások. */
  border-radius: ${PACK_R.tile}px; border: 1px solid rgba(179, 130, 45, 0.30);
  background: linear-gradient(180deg, rgba(255, 252, 242, 0.55) 0%, rgba(250, 240, 214, 0.45) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 1px 2px rgba(122, 90, 42, 0.08);
}
.co-item-k {
  font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase; color: ${LAB.inkMuted};
}
.co-item-t {
  margin-top: -4px; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px;
  letter-spacing: 0.08em; text-transform: uppercase; color: ${LAB.ink};
}
.co-bill-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.co-member-link {
  border: 0; background: none; padding: 0; cursor: pointer; white-space: nowrap;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px;
  letter-spacing: 0.08em; text-transform: uppercase; color: ${LAB.ink};
  text-decoration: underline; text-decoration-color: ${LAPIS.edge};
  text-decoration-thickness: 2px; text-underline-offset: 4px;
}
.co-member-link:hover { color: ${LAPIS.edge}; }
.co-free { font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${LAB.inkSoft}; }
.co-promo-ask { align-self: flex-end; margin-top: -8px; font-size: 12px; }
.co-decline {
  height: ${HF.cta.h}px; border-radius: ${HF.cta.radius}px; cursor: pointer;
  border: 1.5px solid ${LAPIS.edge}; background: transparent; color: ${LAPIS.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${HF.cta.size}px;
  letter-spacing: .08em; text-transform: uppercase; white-space: normal; line-height: 1.15; padding: 0 8px;
  transition: background .18s, color .18s;
}
.co-decline:hover:not(:disabled) { background: ${LAPIS.fill}; }
.co-decline:disabled { opacity: .4; cursor: default; }

.co-rule { gap: 0; margin: 0; }
.co-promo { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; align-items: center; }
.co-promo-back { grid-column: 2; justify-self: center; }
.co-promo-f { height: 40px; text-transform: uppercase; }

.co-total {
  display: flex; justify-content: space-between; align-items: baseline;
  padding-top: 8px; border-top: 1px solid ${LAB.hairline};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.14em; text-transform: uppercase; color: ${LAB.inkSoft};
}
.co-total b { font-size: 20px; color: ${LAB.ink}; letter-spacing: 0.02em; }
.co-total s { margin-right: 8px; font-size: 14px; color: ${LAB.inkMuted}; }
.co-cta-in { display: inline-flex; align-items: center; gap: 8px; }
.co-secure, .co-err {
  margin: 0; text-align: center; font-family: 'Space Grotesk', sans-serif; font-size: 12px;
}
.co-secure { color: ${LAB.inkMuted}; }
.co-err { color: #8a2c1d; }

/* Nízke okno (Matejovo PC 1477×724): pod doskou musí ostať „Teraz nie" aj dno
   PAGE_AIR. Ustupuje najprv nadpis nad doskou (kontext, nie obsah), potom medzery. */
@media (max-height: 780px) {
  .co-kicker { display: none; }
  .co-stack .hf-plate { gap: 10px; }
  /* Karty psov ustúpia ako prvé z obsahu: pri 2×2 berú dva riadky dosky. */
}
@media (max-height: 700px) {
  .co-stack .hf-plate { padding-left: 16px; padding-right: 16px; padding-bottom: 14px; gap: 8px; }
  .co-kicker { margin-bottom: 8px; font-size: 12px; }
  .co-dogs { max-height: 72px; }
  .co-secure { display: none; }
  .co-item-t { font-size: 14px; }
}
`;
