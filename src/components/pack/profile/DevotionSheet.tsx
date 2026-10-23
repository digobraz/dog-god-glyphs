// ZA ČO SA DOSTÁVA ☥ — ťuk na „Oddanosť · N ☥" v bloku DEVOTION (Matej 23. 10. 2026: *„kliknutím na
// oddanosť vpravo hore v bloku sa otvorí popup s vysvetlením za čo sa oddanosť dostáva"*).
//
// 🔴 ČÍSLA LEN TIE, KTORÉ SÚ V KÓDE (`grant-devotion`, zadanie `plany/zadanie-devotion-odmrazenie-2026-10-23.md`).
//    Kde hodnota ešte nie je schválená (sviatosti, ocenenia, modlitba starostlivosti), stojí „čoskoro" —
//    nie vymyslené číslo. Zdroje ☥ = DOGMA 4.3.1: modlitby · sviatosti · ocenenia.
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BackButton } from '@/components/pack/BackButton';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, VEIL_CSS } from '@/components/pack/packTheme';
import { NIGHT, NIGHT_EDGE, NIGHT_INK } from '@/lib/devotionTiers';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

const CSS = `
.dvs-root.pk-veil{z-index:65;align-items:flex-end;padding:0;animation:dvs-fade .3s ease both;}
.dvs-sheet{position:relative;width:100%;max-height:88dvh;display:flex;flex-direction:column;background:${NIGHT};color:${NIGHT_INK};
  border-top:1.5px solid ${NIGHT_EDGE};border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};font-family:${FONT_UI};
  animation:dvs-up .38s cubic-bezier(.2,.8,.2,1) both;}
.dvs-grab{flex:none;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.onDarkBorder};margin:${S.sm}px auto 0;}
.dvs-head{flex:none;display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.lg}px ${S.md}px;}
.dvs-head h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;color:${NIGHT_EDGE};}
.dvs-body{overflow-y:auto;overscroll-behavior:contain;padding:0 ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);}
.dvs-body > p{margin:0 0 ${S.lg}px;font-size:${TX.body}px;line-height:1.5;}
.dvs-grp{margin:0 0 ${S.lg}px;}
.dvs-grp h3{margin:0 0 ${S.sm}px;padding-bottom:${S.sm}px;border-bottom:1px solid ${T.onDarkBorder};font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${NIGHT_EDGE};}
.dvs-row{display:flex;justify-content:space-between;align-items:baseline;gap:${S.md}px;padding:${S.xs}px 0;font-size:${TX.body}px;}
.dvs-row b{flex:none;font-family:${FONT_TITLE};font-weight:700;color:${NIGHT_EDGE};white-space:nowrap;}
.dvs-row b.soon{font-family:${FONT_UI};font-weight:500;font-size:${TX.label}px;color:${T.onDarkDim};}
.dvs-note{margin:0;font-size:${TX.label}px;line-height:1.5;color:${T.onDarkDim};}
@media (min-width:768px){
  .dvs-root.pk-veil{align-items:center;padding:${S.xl}px;}
  .dvs-sheet{width:560px;max-height:86dvh;border:1.5px solid ${NIGHT_EDGE};border-radius:${PACK_R.card}px;}
  .dvs-grab{display:none;}
  .dvs-head{padding-top:${S.lg}px;}
  .dvs-body{padding:0 ${S.xl}px ${S.xl}px;}
}
@keyframes dvs-up{from{transform:translateY(100%);}to{transform:none;}}
@keyframes dvs-fade{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.dvs-sheet,.dvs-root.pk-veil{animation:none;}}
`;

export function DevotionSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const soon = <b className="soon">{tx('pack.dvinfo.soon', 'soon')}</b>;
  const groups: Array<[string, Array<[string, JSX.Element]>]> = [
    [tx('pack.dvinfo.prayers', 'Prayers'), [
      [tx('pack.dvinfo.presence', 'Prayer of presence'), <b>+3 ☥</b>],
      [tx('pack.dvinfo.care', 'Prayer of care'), soon],
    ]],
    [tx('pack.dvinfo.walks', 'Walks and trips'), [
      [tx('pack.dvinfo.walkShort', 'A walk under an hour'), <b>+0,5 ☥</b>],
      [tx('pack.dvinfo.walkLong', 'Every hour on the way'), <b>+1 ☥</b>],
      [tx('pack.dvinfo.walkCap', 'Most from one walk'), <b>5 ☥</b>],
    ]],
    [tx('pack.dvinfo.firsts', 'First steps'), [
      [tx('pack.dvinfo.firstSteps', 'Finish your first steps in DOGYPT (once)'), <b>+10 ☥</b>],
    ]],
    [tx('pack.dvinfo.sacraments', 'Sacraments'), [
      [tx('pack.dvinfo.baptism', 'Baptism with a heroglyph'), soon],
      [tx('pack.dvinfo.puppy', 'Welcoming a puppy'), soon],
      [tx('pack.dvinfo.memorial', 'Memorial for a dog who left'), soon],
    ]],
    [tx('pack.dvinfo.honours', 'Recognitions'), [
      [tx('pack.dvinfo.charity', 'Helping dogs in need'), soon],
      [tx('pack.dvinfo.learning', 'Learning in the VAULT'), soon],
      [tx('pack.dvinfo.helping', 'Helping another Dogyptian'), soon],
    ]],
  ];

  return createPortal(
    <div className="dvs-root pk-veil pk-veil--modal" role="dialog" aria-modal="true" aria-label={tx('pack.dvinfo.title', 'How you earn devotion')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{VEIL_CSS}</style>
      <style>{CSS}</style>
      <div className="dvs-sheet">
        <span className="dvs-grab" aria-hidden />
        <div className="dvs-head">
          <BackButton tone="dark" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          <h2>{tx('pack.dvinfo.title', 'How you earn devotion')}</h2>
        </div>
        <div className="dvs-body">
          <p>{tx('pack.dvinfo.intro', 'Devotion ☥ grows with what you do for your dog and the pack — prayers, sacraments and recognitions. It cannot be bought.')}</p>
          {groups.map(([head, rows]) => (
            <div key={head} className="dvs-grp">
              <h3>{head}</h3>
              {rows.map(([label, val]) => <div key={label} className="dvs-row"><span>{label}</span>{val}</div>)}
            </div>
          ))}
          <p className="dvs-note">{tx('pack.dvinfo.note', 'Values marked “soon” are being set. Every step of the ladder needs more ☥ than the one before.')}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
