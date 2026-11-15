// ─────────────────────────────────────────────────────────────────────────────
// MOMENT — spoločný komponent odmeny (PEČAŤ · ODHALENIE · OBRAD) + ISKRA na prvku. PACK_BLOCKS „MOMENT“.
//
// Matej 15. 11. 2026 nad prehliadkou (claude.ai/artifact/F3qpEgbwp9pAWxjJiEzPFo): *„koncept sedí“* → *„sprav“*.
// Vzhľad drží `momentCss.ts`; veľkosť, haptiku a zdieľanie neurčuje volajúci, ale register `lib/momenty`.
//
// Ako volať (jeden hostiteľ na appku, montuje ho PackLayout):
//   ukazMoment({ id: 'ucen', obrazok: '/icons/pack/rank/learner-4.webp', stuha: 'UČEŇ 4', nadpis: 'Nový <em>level</em>' })
//   iskra(element, 'lajk')   // ISKRA: prvok pukne, ľahký ťuk — nič nezakryje, nič neotvorí
//
// Pravidlá z hárku Zážitok appky: ZDIEĽAŤ na každom odhalení a obrade (`maZdielanie`) · zvuk len pri obrade ·
// odhalenie a obrad čakajú na človeka, pečať sa zbalí sama · moment človeka nikdy neodnesie inam (lock §4.2).
// ⚠️ Montuje sa len pod `MOMENTY_ON` (= TEST_BUILD), kým etapa 2 nenapojí udalosti a Matej nepovie „ostro“.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MOMENTY, maZdielanie, moment, uder } from '@/lib/momenty';
import { listeners, fronta, type Listener, type MomentData } from './momentBus';
import { useT } from '@/i18n/LanguageContext';
import { MOMENT_CSS } from './momentCss';

/** Povolené je len `<em>` (zlaté slovo); všetko ostatné je text, nie HTML. */
function Nadpis({ html }: { html: string }) {
  const parts = html.split(/<em>|<\/em>/);
  return <h2 className="pkm-h">{parts.map((p, i) => (i % 2 ? <em key={i}>{p}</em> : <span key={i}>{p}</span>))}</h2>;
}

/** Pečať trvá 1,5 s a zbalí sa sama. */
const PECAT_MS = 1700;

export function MomentHost() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [m, setM] = useState<MomentData | null>(null);
  const [out, setOut] = useState(false);
  const queue = useRef<MomentData[]>([]);
  const cur = useRef<MomentData | null>(null);
  cur.current = m;

  useEffect(() => {
    const on: Listener = (x) => { if (cur.current) queue.current.push(x); else setM(x); };
    listeners.add(on);
    while (fronta.length) on(fronta.shift()!);
    return () => { listeners.delete(on); };
  }, []);

  const def = m ? MOMENTY[m.id] : null;

  useEffect(() => {
    if (!m || !def) return;
    moment(m.id);
    const t = def.velkost === 'pecat'
      ? window.setTimeout(zavri, PECAT_MS)
      : window.setTimeout(() => uder('dopad'), 900); // medaila dosadne
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);

  function zavri() {
    setOut(true);
    window.setTimeout(() => {
      const done = cur.current?.hotovo;
      setOut(false);
      setM(queue.current.shift() ?? null);
      done?.();
    }, 350);
  }

  if (!m || !def) return null;
  const share = maZdielanie(m.id) && m.zdielat;
  const pecat = def.velkost === 'pecat';
  return createPortal(
    <>
      <style>{MOMENT_CSS}</style>
      <div className={`pkm pkm--${def.velkost}${out ? ' out' : ''}`} role="dialog" aria-modal="true"
        aria-label={m.nadpis.replace(/<\/?em>/g, '')} onClick={pecat ? zavri : undefined}>
        <div className="pkm-col">
          {!pecat && <span className="pkm-rays" aria-hidden />}
          {pecat ? (
            <div className="pkm-seal" aria-hidden><b>{m.cislo ?? ''}</b>{m.pecatText && <small>{m.pecatText}</small>}</div>
          ) : m.obrazok ? (
            <div className={`pkm-medal${m.lapis ? ' pkm-medal--lapis' : ''}`} aria-hidden><img src={m.obrazok} alt="" /></div>
          ) : m.cislo != null ? <div className="pkm-num">{m.cislo}</div> : null}
          {m.stuha && <div className="pkm-ribbon">{m.stuha}</div>}
          {m.eyebrow && <span className="pkm-eb">{m.eyebrow}</span>}
          <Nadpis html={m.nadpis} />
          {m.podnadpis && <p className="pkm-sub">{m.podnadpis}</p>}
          {!pecat && (
            <div className="pkm-acts">
              {share && <button type="button" className="pk-b3 pk-b3--lapis" onClick={() => m.zdielat?.()}>{tx('pack.moment.share', 'Share')}</button>}
              <button type="button" className="pk-b3 pk-b3--paper" onClick={zavri}>{tx('pack.moment.continue', 'Continue')}</button>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
