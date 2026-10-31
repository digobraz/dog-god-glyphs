// PRAVIDLÁ SVORKY — výslovný súhlas s podmienkami v appke (31. 10. 2026, App Store 1.2 / EULA).
//
// Matej 31. 10.: „netreba mať popup … a dať súhlasím?" — pasívny riadok „Pokračovaním súhlasíš…"
// pod číslom psa je tvrdenie, nie súhlas; pri appkách s obsahom od ľudí ho recenzia Apple vracia.
// Okno zdola, tri pravidlá, odkazy na /terms a /privacy, jedno SÚHLASÍM. Bez súhlasu sa do appky nevstúpi
// („Nesúhlasím" = odhlásenie). Ukáže sa raz — a znova len keď sa zdvihne `TERMS_V`.
//
// Súhlas žije v `user_metadata.terms_ok = { v, at }` — miesto, kam už ide `app_perm` (CLAUDE.md §Identita:
// piate miesto na údaje o človeku nepribudne).
// Dve miesta volania: `AppEntry` (krok po kóde, pred povoleniami) a `PackLayout` (kto už bol prihlásený
// pred týmto krokom alebo prišla nová verzia podmienok).
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';
import { HandAlert, HandHeart } from '@/components/pack/HandIcons';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import {
  FONT_UI, PACK_BOX, PACK_HEAD, PACK_R, PACK_SHADOW, PACK_SPACE, PACK_TEXT, PACK_THEME, PACK_VEIL,
} from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';

/** Verzia podmienok, s ktorou človek súhlasí. Zdvihni pri podstatnej zmene /terms — okno sa ukáže znova. */
export const TERMS_V = 1;

export const termsOk = (u: User | null | undefined): boolean => {
  const t = (u?.user_metadata as { terms_ok?: { v?: number } } | undefined)?.terms_ok;
  return typeof t?.v === 'number' && t.v >= TERMS_V;
};

export function RulesSheet({ onDone }: { onDone: () => void }) {
  const t = useT();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const agree = async () => {
    if (busy) return;
    setBusy(true); setErr('');
    const { error } = await supabase.auth.updateUser({ data: { terms_ok: { v: TERMS_V, at: new Date().toISOString() } } });
    setBusy(false);
    if (error) { setErr(tx('appEntry.rules.fail', 'Could not save. Check your connection and try again.')); return; }
    onDone();
  };
  const decline = async () => {
    try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* aj tak späť na vstup */ }
    window.location.replace('/login');
  };

  const row = (icon: JSX.Element, text: string) => (
    <li className="tr-row"><span className="tr-ib">{icon}</span><span>{text}</span></li>
  );

  return (
    <div className="tr-veil" role="dialog" aria-modal="true" aria-labelledby="tr-title">
      <style>{TERMS_CSS}</style>
      <div className="tr-sheet">
        <span className="tr-grip" />
        <p className="tr-eyebrow">{tx('appEntry.rules.eyebrow', 'Before you enter')}</p>
        <h2 id="tr-title" className="tr-title">{tx('appEntry.rules.title', 'Pack rules')}</h2>
        <ul className="tr-list">
          {row(<HandHeart size={20} />, tx('appEntry.rules.r1', 'Zero tolerance for abuse, hate and indecent content.'))}
          {row(<HandAlert size={20} />, tx('appEntry.rules.r2', 'You can report and block any post, comment or member.'))}
          {row(<img src="/icons/pack/clock.svg" alt="" />, tx('appEntry.rules.r3', 'We handle every report within 24 hours and remove content that breaks the rules.'))}
        </ul>
        <p className="tr-legal">
          {tx('appEntry.rules.pre', 'I agree to the ')}
          <a href="/terms">{tx('appEntry.legal.terms', 'Terms')}</a>
          {tx('appEntry.legal.and', ' and the ')}
          <a href="/privacy">{tx('appEntry.legal.privacy', 'Privacy Policy')}</a>.
        </p>
        {err && <p className="tr-err" role="alert">{err}</p>}
        <button type="button" className="tr-cta" disabled={busy} onClick={() => void agree()}>
          {tx('appEntry.rules.agree', 'I agree')}
        </button>
        <button type="button" className="tr-link" onClick={() => void decline()}>
          {tx('appEntry.rules.decline', "I don't agree")}
        </button>
      </div>
    </div>
  );
}

/** Strážca pre `/pack`: prihlásený člen bez súhlasu aktuálnej verzie dostane okno nad všetkým. */
export function TermsGuard() {
  const [need, setNeed] = useState(false);
  useEffect(() => {
    let off = false;
    void supabase.auth.getUser().then(({ data }) => { if (!off && data.user && !termsOk(data.user)) setNeed(true); });
    return () => { off = true; };
  }, []);
  return need ? <RulesSheet onDone={() => setNeed(false)} /> : null;
}

const TERMS_CSS = `
.tr-veil { position: fixed; inset: 0; z-index: 1000; background: ${PACK_VEIL.modal}; display: flex; align-items: flex-end; justify-content: center; }
.tr-sheet { width: 100%; max-width: 560px; display: flex; flex-direction: column; align-items: center; text-align: center;
  background: ${PACK_BOX.panel.background}; border-top: ${PACK_BOX.panel.border}; box-shadow: ${PACK_SHADOW.panel};
  border-radius: ${PACK_R.card}px ${PACK_R.card}px 0 0; color: ${LAB.ink}; font-family: ${FONT_UI};
  padding: ${PACK_SPACE.md}px ${PACK_SPACE.xl}px calc(env(safe-area-inset-bottom, 0px) + ${PACK_SPACE.xl}px);
  animation: trUp .28s cubic-bezier(.2,.8,.2,1); }
.tr-sheet > * { max-width: 400px; }
@keyframes trUp { from { transform: translateY(100%); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { .tr-sheet { animation-duration: .01s; } }
.tr-grip { width: 40px; height: 4px; border-radius: ${PACK_R.pill}px; background: ${PACK_THEME.border}; margin-bottom: ${PACK_SPACE.lg}px; }
.tr-eyebrow { margin: 0 0 ${PACK_SPACE.sm}px; font-family: ${PACK_HEAD.label.fontFamily}; font-weight: ${PACK_HEAD.label.fontWeight};
  font-size: ${PACK_HEAD.label.fontSize}px; letter-spacing: ${PACK_HEAD.label.letterSpacing}; text-transform: uppercase; color: ${LAB.goldInk}; }
.tr-title { margin: 0 0 ${PACK_SPACE.lg}px; font-family: ${PACK_HEAD.card.fontFamily}; font-weight: 700; font-size: ${PACK_TEXT.h2}px; /* písmo: nadpis */
  letter-spacing: ${PACK_HEAD.card.letterSpacing}; text-transform: uppercase; }
.tr-list { list-style: none; margin: 0; padding: 0; width: 100%; display: flex; flex-direction: column; gap: ${PACK_SPACE.sm}px; }
.tr-row { display: grid; grid-template-columns: 36px minmax(0,1fr); align-items: center; column-gap: ${PACK_SPACE.md}px; text-align: left;
  padding: ${PACK_SPACE.md}px; font-size: ${PACK_TEXT.label}px; line-height: 1.45; color: ${LAB.ink};
  background: ${PACK_BOX.subblock.background}; border: ${PACK_BOX.subblock.border}; border-radius: ${PACK_BOX.subblock.borderRadius}px; box-shadow: ${PACK_BOX.subblock.boxShadow}; }
.tr-ib { width: 36px; height: 36px; border-radius: ${PACK_R.pill}px; display: grid; place-items: center;
  background: ${PACK_THEME.card}; border: 1px solid ${PACK_THEME.hairline}; color: ${LAB.ink}; }
.tr-ib img { width: 20px; height: 20px; display: block; }
.tr-legal { margin: ${PACK_SPACE.lg}px 0 0; font-size: ${PACK_TEXT.label}px; line-height: 1.5; color: ${LAB.inkMuted}; text-wrap: balance; }
.tr-legal a { color: ${LAB.inkSoft}; text-decoration: underline; text-underline-offset: 3px; }
.tr-err { margin: ${PACK_SPACE.sm}px 0 0; font-size: ${PACK_TEXT.label}px; color: ${PACK_THEME.ink}; }
.tr-cta { width: 100%; height: 48px; margin-top: ${PACK_SPACE.lg}px; border: 0; border-radius: ${PACK_R.field}px; cursor: pointer;
  background: ${LAPIS.grad}; color: ${LAPIS.ink}; box-shadow: ${LAPIS_BTN_SHADOW};
  font-family: ${PACK_HEAD.card.fontFamily}; font-weight: 700; font-size: ${PACK_TEXT.body}px; /* písmo: cta */
  letter-spacing: ${PACK_HEAD.card.letterSpacing}; text-transform: uppercase; }
.tr-cta:hover:not(:disabled) { background: ${LAPIS.gradHover}; }
.tr-cta:disabled { opacity: .4; cursor: default; box-shadow: none; }
.tr-link { margin-top: ${PACK_SPACE.md}px; border: 0; background: none; padding: ${PACK_SPACE.xs}px; cursor: pointer;
  font-family: ${FONT_UI}; font-size: ${PACK_TEXT.label}px; color: ${LAB.inkSoft}; }
`;
