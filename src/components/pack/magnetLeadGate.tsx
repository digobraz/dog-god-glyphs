/**
 * E-MAILOVÁ BRÁNA PRED VÝSLEDKOM KVÍZU (`/magnet/kviz`, 12. 10. 2026).
 *
 * Vytiahnutá z v7 `pages/Magnet.tsx` (funkcia `NatureQuiz`), aby ju mohol použiť aj skutočný
 * `PackNatureQuiz` v režime náhľadu. Jediný zápis, ktorý návštevník spraví, je RPC
 * `magnet_lead` — žiadny účet, žiadny pes v DB. Pole = `.pf-field` (PF_FIELD_CSS),
 * CTA = LAPIS (bledý podklad), chyba = červená z matrice (`#B25640`).
 */
import { useState } from 'react';
import { useT, useLang } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import type { NatureResult } from './natureQuiz';
import { PACK_BOX, PACK_THEME as T, PACK_TEXT, PACK_SPACE, PACK_R, FONT_TITLE, FONT_UI, PF_FIELD_CSS } from './packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from './navGoldSkin';

const CSS = `
${PF_FIELD_CSS}
.mgl-h{margin:0 0 ${PACK_SPACE.sm}px;font:700 ${PACK_TEXT.h2}px/1.3 ${FONT_TITLE};letter-spacing:.02em;color:${T.inkStrong};}
.mgl-p{margin:0;font:400 ${PACK_TEXT.body}px/1.55 ${FONT_UI};color:${T.inkWarm};}
.mgl-field{width:100%;box-sizing:border-box;margin-top:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;
  border-radius:${PACK_R.field}px;font:400 ${PACK_TEXT.lead}px/1.4 ${FONT_UI};color:${T.inkStrong};}
.mgl-err{margin:${PACK_SPACE.sm}px 0 0;font:500 ${PACK_TEXT.label}px/1.4 ${FONT_UI};color:#B25640;}
.mgl-cta{display:inline-flex;align-items:center;justify-content:center;width:100%;margin-top:${PACK_SPACE.md}px;cursor:pointer;
  border:1px solid ${LAPIS.edge};border-radius:${PACK_R.field}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;
  background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};color:${LAPIS.ink};
  font:700 ${PACK_TEXT.body}px/1 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;transition:transform .15s ease;}
.mgl-cta:hover{background:${LAPIS.gradHover};transform:translateY(-1px);}
.mgl-cta:disabled{opacity:.6;cursor:wait;}
.mgl-fine{margin:${PACK_SPACE.md}px 0 0;font:400 ${PACK_TEXT.label}px/1.5 ${FONT_UI};color:${T.inkWarm};}
.mgl-fine a{color:${LAPIS.edge};}
`;

export function MagnetLeadGate({ answers, result, onDone }: {
  /** Odpovede kvízu (otázka → možnosť; zvláštne úlohy s prefixom `sp_`). */
  answers: Record<string, string>;
  result: NatureResult;
  /** Zavolá sa po úspešnom zápise e-mailu. */
  onDone: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const [mail, setMail] = useState('');
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.trim())) { setErr(true); return; }
    setErr(false); setBusy(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc('magnet_lead', {
      p_email: mail.trim(), p_lang: lang, p_answers: answers,
      p_result: { element: result.element, role: result.role, elementSecond: result.elementSecond, roleSecond: result.roleSecond },
    });
    setBusy(false);
    if (error) { setErr(true); return; }
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate>
      <style>{CSS}</style>
      <div style={{ ...PACK_BOX.card, padding: PACK_SPACE.xl }}>
        <h2 className="mgl-h">{tx('magnet.quiz.gate.h', 'Where should we send your result?')}</h2>
        <p className="mgl-p">{tx('magnet.quiz.gate.p', 'Your e-mail, nothing else. The full reading opens right after.')}</p>
        <input className="pf-field mgl-field" type="email" autoComplete="email" required value={mail}
          onChange={(e) => setMail(e.target.value)} placeholder="name@email.com" aria-invalid={err} />
        {err && <p className="mgl-err" role="alert">{tx('magnet.quiz.gate.err', 'That e-mail does not look right. Try again.')}</p>}
        <button type="submit" className="mgl-cta" disabled={busy}>{tx('magnet.quiz.gate.btn', 'Show my result')}</button>
        <p className="mgl-fine">{tx('magnet.quiz.gate.fine', 'Used only to send you the result.')}{' '}
          <a href="/privacy" target="_blank" rel="noreferrer">{tx('magnet.quiz.gate.privacy', 'Privacy')}</a></p>
      </div>
    </form>
  );
}
