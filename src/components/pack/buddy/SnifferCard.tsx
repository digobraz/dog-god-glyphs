// SNIFFER — KARTA ČLOVEKA ako na Tinderi. JEDEN komponent pre balíček (SNIFFUJ) aj pre
// „Takto ťa vidia" (zadanie-sniffer-stavba §2.1, §2.3: „tá istá Tinder karta… jeden komponent!").
// Nákres: plany/nakres-sniffer-kolo2-2026-09-25.html, obrazovka A.
//
// 👫 PRVÁ FOTKA = ČLOVEK A PES (kolo 2, Matej 25. 9.: „prvá foto na profile bude človek a pes").
//    Server ju dáva na prvé miesto (`buddyPhoto`). Pes s heroglyfom sa z karty PRESUNUL do
//    psích albumov v celom profile (§6.2) — pôvodný bod §3.4 bol prepísaný.
// 🏅 Pri mene dva levely POD SEBOU (PÚTNIK, DEVOTION) · výlety · km · krajiny v JEDNOM chipe ·
//    📍 pri bydlisku (Matej 25. 9. k nákresu kola 2).
// Ťuk vľavo/vpravo v hornej polovici = predošlá/ďalšia fotka (pásiky hore).
import { useEffect, useState, type CSSProperties } from 'react';
import { withTransform } from '@/services/cloudinaryService';
import {
  PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, FONT_UI, FONT_TITLE, BRAND_GOLD_BTN,
} from '@/components/pack/packTheme';
import { ACTIVITY_OPTIONS } from '@/components/pack/profile/packProfile';
import type { SnifferCardData } from './snifferDeck';
import { loadMyCard, pilgrimFromTrips } from './snifferDeck';
import { devotionLevel } from '@/lib/devotion';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

/** Meno psa na OFICIÁLNOM povrchu = Cinzel Decorative (brand lock). Karta nesie psa zo steny. */
export const DOG_NAME_FONT = "'Cinzel Decorative','Cinzel',serif";
/** Zlatý heroglyf — doslovne filter `.dog-heroglyph` z WALLU, aby pes vyzeral rovnako ako tam. */
export const HEROGLYPH_GLOW = 'brightness(0) invert(1) sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3) '
  + 'drop-shadow(0 0 14px rgba(201,154,63,0.95)) drop-shadow(0 0 32px rgba(201,154,63,0.55))';

export const img = (u: string | null | undefined, w = 900) => withTransform(u, `c_limit,w_${w},f_auto,q_auto`);

export const SNIFFER_CARD_CSS = `
.sn-card{position:absolute;inset:0;border-radius:${PACK_R.card}px;overflow:hidden;background:${T.pageBg};
  box-shadow:${PACK_SHADOW.panel};touch-action:pan-y;user-select:none;-webkit-user-select:none;}
.sn-card.is-back{transform:scale(.95) translateY(${PACK_SPACE.sm}px);opacity:.6;pointer-events:none;}
.sn-card.is-anim{transition:transform .32s ease, opacity .32s ease;}
.sn-slide{position:absolute;inset:0;}
.sn-slide > img.sn-bg{width:100%;height:100%;object-fit:cover;display:block;}
/* heroglyf a meno psa sú JEDEN stĺpec — meno ide vždy tesne pod glyf, nikdy do textu dole */
.sn-crest{position:absolute;left:50%;top:32%;transform:translate(-50%,-50%);width:56%;max-width:240px;display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.sm}px;pointer-events:none;}
.sn-hg{width:100%;height:auto;}
.sn-slide .sn-dogname{position:static;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;
  font-family:${DOG_NAME_FONT};font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:.02em;color:${T.onDark};white-space:nowrap;}
.sn-bars{position:absolute;top:${PACK_SPACE.sm}px;left:${PACK_SPACE.md}px;right:${PACK_SPACE.md}px;display:flex;gap:${PACK_SPACE.xs}px;z-index:2;}
.sn-bars i{flex:1 1 0;height:3px;border-radius:${PACK_R.pill}px;background:rgba(255,255,255,.35);}
.sn-bars i.is-on{background:${T.onDark};}
.sn-tap{position:absolute;top:0;bottom:45%;width:50%;z-index:3;background:none;border:0;padding:0;cursor:pointer;}
.sn-tap--l{left:0;} .sn-tap--r{right:0;}
.sn-ov{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:${PACK_SPACE.xxxl}px ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;
  background:linear-gradient(180deg, rgba(24,14,4,0) 0%, rgba(24,14,4,.55) 22%, rgba(24,14,4,.92) 100%);
  color:${T.onDark};display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;font-family:${FONT_UI};}
.sn-nm{margin:0;font-weight:600;font-size:${PACK_TEXT.h1}px;line-height:1.1;}
.sn-nm span{font-weight:400;}
.sn-meta{margin:0;font-size:${PACK_TEXT.label}px;opacity:.85;}
.sn-head{display:flex;align-items:center;gap:${PACK_SPACE.md}px;}
.sn-lv{display:flex;flex-direction:column;align-items:flex-start;gap:${PACK_SPACE.xs}px;}
.sn-lv span{display:inline-flex;align-items:center;padding:0 ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:${PACK_SPACE.lg}px;letter-spacing:.14em;text-transform:uppercase;color:#fff;white-space:nowrap;}
.sn-lv .is-pilgrim{background:${T.tripPurple};}
.sn-lv .is-devotion{background:${BRAND_GOLD_BTN.grad};}
.sn-chip{align-self:flex-start;display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;white-space:nowrap;}
.sn-chip b{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;}
.sn-chip i{font-style:normal;opacity:.5;}
.sn-full{align-self:center;display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.lg}px;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;}
.sn-bio{margin:0;font-size:${PACK_TEXT.label}px;line-height:1.45;opacity:.92;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.sn-pills{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.xs}px;}
.sn-pills .pk-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;}
.sn-stage{position:relative;flex:1 1 auto;min-height:360px;width:100%;max-width:440px;margin:0 auto;}
.sn-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:${PACK_SPACE.xl}px;text-align:center;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.onDark};}
`;

/** Tvar čísla pre SK/CS: 1 · 2–4 · 5+ (EN berie len `one` a `other`, `few` padne na fallback). */
export const plural = (n: number) => (n === 1 ? 'one' : n >= 2 && n <= 4 ? 'few' : 'other');

/** Levely pri mene — PÚTNIK (zapisuje majiteľov klient) a DEVOTION (server, 100 + ledger).
 *  Chýbajúci PÚTNIK = človek ešte neotvoril mapu po zverejnení levelov; neukazuje sa nič,
 *  nie vymyslená jednotka. */
export function SnifferLevels({ card, tx }: { card: SnifferCardData; tx: Tx }) {
  const dev = card.devotion != null ? devotionLevel(Number(card.devotion)) : null;
  if (!card.pilgrimLevel && !dev) return null;
  return (
    <span className="sn-lv">
      {card.pilgrimLevel ? <span className="is-pilgrim">{tx('pack.sniffer.pilgrimLv', 'Pilgrim {n}', { n: card.pilgrimLevel })}</span> : null}
      {dev && <span className="is-devotion">{tx(`pack.ladder.${dev.key}`, dev.name)}</span>}
    </span>
  );
}

/** Výlety · km · krajiny v JEDNOM podlhovastom chipe (Matej 25. 9.: „vedľa seba, nie pod sebou"). */
export function SnifferStatsChip({ card, tx }: { card: SnifferCardData; tx: Tx }) {
  const p = pilgrimFromTrips(card.trips ?? []);
  if (p.count === 0) return null;
  return (
    <span className="sn-chip pk-pill pk-pill--dark">
      <span><b>{p.count}</b> {tx(`pack.sniffer.tripsWord.${plural(p.count)}`, p.count === 1 ? 'trip' : 'trips')}</span><i>·</i>
      <span><b>{p.km}</b> km</span><i>·</i>
      <span><b>{p.countries}</b> {tx(`pack.sniffer.countriesWord.${plural(p.countries)}`, p.countries === 1 ? 'country' : 'countries')}</span>
    </span>
  );
}

/** 📍 bydlisko + vzdialenosť od diváka (pin sám von nejde). */
export function snifferPlace(card: SnifferCardData, tx: Tx): string {
  const km = card.distance_km != null ? tx('pack.sniffer.kmAway', '{n} km away', { n: Math.max(1, Math.round(Number(card.distance_km))) }) : '';
  return [card.region, km].filter(Boolean).join(' · ');
}

export function SnifferCard({ card, tx, back = false, className = '', style, onOpenFull, lean = false }: {
  card: SnifferCardData;
  tx: Tx;
  back?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Tlačidlo „Celý profil" (kolo 2 §6.1). Bez neho sa tlačidlo neukáže („Takto ťa vidia" ho má). */
  onOpenFull?: () => void;
  /** Len fotky, meno, levely, chip a 📍 — prvá karta CELÉHO PROFILU (bio a záľuby má vlastnú kartu). */
  lean?: boolean;
}) {
  const [k, setK] = useState(0);
  const slides = card.photos.filter(Boolean);
  const cur = slides[Math.min(k, slides.length - 1)];
  const go = (d: number) => setK((x) => (x + d + slides.length) % Math.max(1, slides.length));
  const place = snifferPlace(card, tx);
  const interest = (v: string) => tx(`pack.map.activityLabel.${v}`, ACTIVITY_OPTIONS.find((o) => o.value === v)?.labelEN ?? v);

  return (
    <div className={`sn-card${back ? ' is-back' : ''} ${className}`} style={style}>
      {cur
        ? <div className="sn-slide"><img className="sn-bg" src={img(cur)} alt="" draggable={false} /></div>
        : <div className="sn-empty">{tx('pack.sniffer.noPhoto', 'No photo yet')}</div>}

      {slides.length > 1 && (
        <>
          <div className="sn-bars" aria-hidden>
            {slides.map((_, n) => <i key={n} className={n === k ? 'is-on' : ''} />)}
          </div>
          <button type="button" className="sn-tap sn-tap--l" aria-label={tx('pack.sniffer.prevPhoto', 'Previous photo')}
            onClick={(e) => { e.stopPropagation(); go(-1); }} />
          <button type="button" className="sn-tap sn-tap--r" aria-label={tx('pack.sniffer.nextPhoto', 'Next photo')}
            onClick={(e) => { e.stopPropagation(); go(1); }} />
        </>
      )}

      <div className="sn-ov">
        <div className="sn-head">
          <p className="sn-nm">{card.name}{card.age ? <>, <span>{card.age}</span></> : null}</p>
          <SnifferLevels card={card} tx={tx} />
        </div>
        <SnifferStatsChip card={card} tx={tx} />
        {place && <p className="sn-meta">📍 {place}</p>}
        {!lean && card.bio?.trim() && <p className="sn-bio">{card.bio.trim()}</p>}
        {!lean && (card.intents.length > 0 || card.interests.length > 0) && (
          <div className="sn-pills">
            {card.intents.map((i) => <span key={`i-${i}`} className="pk-pill pk-pill--dark">{tx(`pack.buddy.intent.${i}`, i)}</span>)}
            {card.interests.slice(0, 4).map((v) => <span key={`a-${v}`} className="pk-pill pk-pill--dark">{interest(v)}</span>)}
          </div>
        )}
        {onOpenFull && (
          <button type="button" className="sn-full pk-pill pk-pill--dark" onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onOpenFull(); }}>
            {tx('pack.sniffer.fullProfile', 'Full profile')} ↑
          </button>
        )}
      </div>
    </div>
  );
}

/** „TAKTO ŤA VIDIA" (§2.3, nákres B) — tá istá karta ako v balíčku, dáta zo servera
 *  (`assnif_my_card`), nie poskladané v prehliadači. Čo tu vidíš, uvidia ostatní — aj
 *  celý profil (kolo 2), ktorý sa otvorí tým istým tlačidlom ako cudzí. */
export function SnifferMyCard({ tx, reloadKey, onOpenFull }: { tx: Tx; reloadKey?: string; onOpenFull?: (card: SnifferCardData) => void }) {
  const [card, setCard] = useState<SnifferCardData | null>(null);
  useEffect(() => { loadMyCard().then(setCard).catch(() => setCard(null)); }, [reloadKey]);
  return (
    <div className="sn-stage">
      {card && <SnifferCard key={JSON.stringify(card.photos)} card={card} tx={tx} onOpenFull={onOpenFull ? () => onOpenFull(card) : undefined} />}
    </div>
  );
}
