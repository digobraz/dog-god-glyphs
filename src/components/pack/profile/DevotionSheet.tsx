// ZA ČO SA DOSTÁVA ☥ — ťuk na „Oddanosť · N ☥" v bloku DEVOTION (Matej 23. 10. 2026: *„kliknutím na
// oddanosť vpravo hore v bloku sa otvorí popup s vysvetlením za čo sa oddanosť dostáva"*).
//
// 🔴 ČÍSLA LEN TIE, KTORÉ SÚ V KÓDE — čítajú sa z `DEVOTION_DAILY/ONCE/FEED` (lib/devotion.ts), zrkadla
//    `grant-devotion`; schválené Matejom 23. 10. (zadanie `plany/zadanie-devotion-odmrazenie-2026-10-23.md`).
//    Kde hodnota ešte nie je schválená (privítanie šteňaťa, memorial, modlitba starostlivosti), stojí „čoskoro" —
//    nie vymyslené číslo. Zdroje ☥ = DOGMA 4.3.1: modlitby · sviatosti · ocenenia.
import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { BackButton } from '@/components/pack/BackButton';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, VEIL_CSS, GOLD_BTN } from '@/components/pack/packTheme';
import { NIGHT, NIGHT_EDGE, NIGHT_INK, DEVOTION_TIERS, devotionVars } from '@/lib/devotionTiers';
import { DEVOTION_LEVELS, DEVOTION_DAILY, DEVOTION_ONCE, DEVOTION_FEED, devotionLevel } from '@/lib/devotion';
import { DevotionToday } from '@/components/pack/profile/DevotionToday';
import { DevotionMark } from '@/components/pack/profile/meHead';
import { BrandIcon } from '@/components/pack/BrandIcon';
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
/* HRDINA — kde som: gulička stupňa, stav ☥, koľko chýba, a 22 guličiek cesty (Novic → Polboh). */
.dvs-hero{position:relative;overflow:hidden;margin:0 0 ${S.md}px;padding:${S.lg}px;border-radius:${PACK_R.tile}px;border:1px solid ${NIGHT_EDGE};
  background:radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--dv-glow) 22%, transparent), transparent 60%), rgba(0,0,0,.28);}
.dvs-me{display:flex;align-items:center;gap:${S.md}px;}
.dvs-orb{flex:none;display:grid;place-items:center;width:48px;height:48px;border-radius:${PACK_R.pill}px;background:var(--dv-dot);filter:drop-shadow(0 0 12px var(--dv-glow));}
.dvs-orb b{font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h2}px;line-height:1;color:var(--dv-icon-ink);}
.dvs-me .tx{flex:1;min-width:0;}
.dvs-me h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;color:${NIGHT_INK};}
.dvs-me p{margin:${S.xs}px 0 0;white-space:nowrap;font-size:${TX.label}px;color:${T.onDarkDim};}
.dvs-me p b{font-family:${FONT_TITLE};font-weight:700;color:${NIGHT_EDGE};}
.dvs-bal{flex:none;display:inline-flex;align-items:center;gap:${S.xs}px;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.h2}px;color:${NIGHT_EDGE};}
.dvs-path{display:flex;justify-content:space-between;align-items:center;margin-top:${S.lg}px;}
.dvs-path i{display:block;width:8px;height:8px;border-radius:${PACK_R.pill}px;border:1px solid ${T.onDarkBorder};}
.dvs-path i.done{border:0;background:var(--d);}
.dvs-path i.cur{width:12px;height:12px;border:0;background:var(--d);filter:drop-shadow(0 0 6px var(--d));}
.dvs-ends{display:flex;justify-content:space-between;margin-top:${S.sm}px;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.onDarkDim};}
.dvs-intro{margin:0 0 ${S.lg}px;font-size:${TX.label}px;line-height:1.5;color:${T.onDarkDim};}
/* SKUPINY = tmavé podbloky, každá s kresbou z kitu. Hodnota = žiariaca pilulka, „čoskoro“ = čiarkovaný obrys. */
.dvs-grp{margin:0 0 ${S.md}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.onDarkBorder};background:rgba(0,0,0,.22);}
.dvs-grp h4{display:flex;align-items:center;gap:${S.sm}px;margin:0 0 ${S.sm}px;font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${NIGHT_EDGE};}
.dvs-grp h4 span{display:grid;place-items:center;width:24px;height:24px;border-radius:${PACK_R.pill}px;border:1px solid ${NIGHT_EDGE};}
.dvs-row{display:flex;justify-content:space-between;align-items:center;gap:${S.md}px;padding:${S.sm}px 0;font-size:${TX.body}px;border-top:1px solid ${T.onDarkBorder};}
.dvs-row:first-of-type{border-top:0;}
.dvs-row.off > span{color:${T.onDarkDim};}
.dvs-v{flex:none;display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;white-space:nowrap;
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;color:#140D07;background:linear-gradient(180deg,#F1D58C,${NIGHT_EDGE});filter:drop-shadow(0 0 6px rgba(201,154,63,.35));}
.dvs-v.soon{font-family:${FONT_UI};font-weight:500;color:${T.onDarkDim};background:none;filter:none;border:1px dashed ${T.onDarkBorder};}
.dvs-cta{display:block;width:100%;margin:0 0 ${S.lg}px;padding:${S.md}px;border:1px solid ${GOLD_BTN.edge};border-radius:${PACK_R.field}px;cursor:pointer;
  font-family:${FONT_TITLE};font-weight:700;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;
  background:${GOLD_BTN.grad};color:#140D07;box-shadow:${GOLD_BTN.glow};}
.dvs-note{margin:${S.sm}px 0 0;font-size:${TX.micro}px;line-height:1.5;color:${T.onDarkDim};text-align:center;}
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

export function DevotionSheet({ devotion, onClose }: { devotion?: number; onClose: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [todayOpen, setTodayOpen] = useState(false);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const soon = <b className="dvs-v soon">{tx('pack.dvinfo.soon', 'soon')}</b>;
  const pts = (v: string) => <b className="dvs-v">{v}<DevotionMark size={12} tint="dark" /></b>;
  const plus = (n: number) => pts(`+${n}`);
  const groups: Array<[string, string, Array<[string, JSX.Element | null]>]> = [
    ['walk', tx('pack.dvinfo.daily', 'Every day with your dog'), [
      [tx('pack.dvinfo.walkShort2', 'Short walk under 20 min (up to 5× a day)'), plus(DEVOTION_DAILY.walk_short.points)],
      [tx('pack.dvinfo.walk2', 'Walk 20 min – 2 hours'), plus(DEVOTION_DAILY.walk.points)],
      [tx('pack.dvinfo.trip2', 'Day trip over 2 hours'), plus(DEVOTION_DAILY.trip_day.points)],
    ]],
    ['sun', tx('pack.dvinfo.prayers', 'Prayers'), [
      [tx('pack.dvinfo.presence2', 'Prayer of presence — 10 min only with your dog'), plus(DEVOTION_DAILY.presence.points)],
      [tx('pack.dvinfo.care', 'Prayer of care'), plus(DEVOTION_DAILY.care.points)],
    ]],
    ['food', tx('pack.dvinfo.feeding', 'Feeding — adds itself every day'), [
      [tx('pack.dvinfo.kibble', 'Kibble'), plus(DEVOTION_FEED.kibble)],
      [tx('pack.dvinfo.barf', 'BARF'), plus(DEVOTION_FEED.barf)],
    ]],
    ['ankh', tx('pack.dvinfo.sacraments', 'Sacraments'), [
      [tx('pack.dvinfo.baptism', 'Baptism with a heroglyph'), plus(DEVOTION_ONCE.baptism)],
      [tx('pack.dvinfo.puppy', 'Welcoming a puppy'), null],
      [tx('pack.dvinfo.memorial', 'Memorial for a dog who left'), null],
    ]],
    ['trophy', tx('pack.dvinfo.honours', 'Recognitions'), [
      [tx('pack.dvinfo.dogid', 'DOG ID at 100 % (once per dog)'), plus(DEVOTION_ONCE.dogid_full)],
      [tx('pack.dvinfo.scroll', 'A scroll read in the VAULT'), plus(DEVOTION_ONCE.scroll_read)],
      [tx('pack.dvinfo.charity', 'Helping dogs in need'), null],
      [tx('pack.dvinfo.helping', 'Helping another Dogyptian'), null],
    ]],
  ];
  const dev = devotionLevel(devotion ?? 0);
  const fmtN = (n: number) => Math.round(n).toLocaleString('sk-SK');

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
          {/* HRDINA — kde na ceste stojím (Matej 23. 10.: „urobiť krajší“). Bez `devotion` sa nekreslí. */}
          {devotion != null && (
            <div className="dvs-hero" style={devotionVars(dev.index)}>
              <div className="dvs-me">
                <span className="dvs-orb"><b>{dev.index}</b></span>
                <div className="tx">
                  <h3>{tx(`pack.ladder.${dev.key}`, dev.name)}</h3>
                  {dev.next && (
                    <p>{tx('pack.dvinfo.toNext', 'To {name}:').replace('{name}', tx(`pack.ladder.${dev.next.key}`, dev.next.name))} <b>{fmtN(dev.toNext)}</b> <DevotionMark size={12} /></p>
                  )}
                </div>
                <span className="dvs-bal">{fmtN(devotion)}<DevotionMark size={18} /></span>
              </div>
              <div className="dvs-path" aria-label={tx('pack.rank.devAbout', 'Devotion is your path in DOGYPT — {n} steps from Novice to Demigod.').replace('{n}', String(DEVOTION_LEVELS.length))}>
                {DEVOTION_TIERS.map((t, i) => (
                  <i key={t.key} className={i + 1 < dev.index ? 'done' : i + 1 === dev.index ? 'cur' : ''} style={{ '--d': t.dot } as CSSProperties} />
                ))}
              </div>
              <div className="dvs-ends">
                <span>{tx('pack.ladder.novice', 'Novice')}</span>
                <span>{DEVOTION_LEVELS.length}</span>
                <span>{tx('pack.ladder.demigod', 'Demigod')}</span>
              </div>
            </div>
          )}
          <p className="dvs-intro">{tx('pack.dvinfo.intro', 'Devotion grows with what you do for your dog and the pack — prayers, sacraments and recognitions. It cannot be bought.')}</p>
          <button type="button" className="dvs-cta" onClick={() => setTodayOpen(true)}>{tx('pack.dvinfo.logToday', 'Log today')}</button>
          {groups.map(([icon, head, rows]) => (
            <div key={head} className="dvs-grp">
              <h4><span><BrandIcon name={icon} size={14} /></span>{head}</h4>
              {rows.map(([label, val]) => <div key={label} className={`dvs-row${val ? '' : ' off'}`}><span>{label}</span>{val ?? soon}</div>)}
            </div>
          ))}
          <p className="dvs-note">{tx('pack.dvinfo.note2', 'Devotion is counted for every living dog. Values marked “soon” are being set.')}</p>
        </div>
      </div>
      {todayOpen && <DevotionToday onClose={() => setTodayOpen(false)} />}
    </div>,
    document.body,
  );
}
