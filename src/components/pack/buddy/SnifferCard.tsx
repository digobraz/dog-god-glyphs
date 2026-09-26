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
import { withTransform, bgImg as bgImgSized } from '@/services/cloudinaryService';
import {
  PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, FONT_UI, FONT_TITLE, BRAND_GOLD_BTN,
} from '@/components/pack/packTheme';
import { ACTIVITY_OPTIONS } from '@/components/pack/profile/packProfile';
import { zodiacMap, chineseMap } from '@/components/HeroglyphFrame';
import type { SnifferCardData } from './snifferDeck';
import { loadMyCard, pilgrimFromTrips } from './snifferDeck';
import { devotionLevel } from '@/lib/devotion';
import { tierOfLevel, tierGradient } from '@/lib/packTiers';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

/** Meno psa na OFICIÁLNOM povrchu = Cinzel Decorative (brand lock). Karta nesie psa zo steny. */
export const DOG_NAME_FONT = "'Cinzel Decorative','Cinzel',serif";
/** Zlatý heroglyf — doslovne filter `.dog-heroglyph` z WALLU, aby pes vyzeral rovnako ako tam. */
export const HEROGLYPH_GLOW = 'brightness(0) invert(1) sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3) '
  + 'drop-shadow(0 0 14px rgba(201,154,63,0.95)) drop-shadow(0 0 32px rgba(201,154,63,0.55))';

/** FIT (nezoreže, len ohraničí) — heroglyf a iné assety s vlastným pomerom strán, nie fotky na oreznutie. */
export const img = (u: string | null | undefined, w = 900) => withTransform(u, `c_limit,w_${w},f_auto,q_auto`);

/** FOTKA NA PLOCHU — audit SNIFFER C1/C2 (26. 9. 2026): `c_fill,g_auto` PODĽA DPR displeja,
 *  reťazené ZA prípadný uložený výrez (`sizedUrl`/`fillUrl` v `cloudinaryService.ts`), nie
 *  namiesto neho — jeden pomocník pre kartu, album aj mriežku HĽADAŤ (`SnifferSearch.tsx`). */
export const bgImg = (u: string | null | undefined, w: number, h: number) => bgImgSized(u, w, h);

/** Znamenie: kresba + text — bola duplicita (`SnifferProfile` vs. `SnifferFullProfile`, audit
 *  „Duplicity", 26. 9. 2026), teraz jeden zdroj. */
export const zodiacIcon = (kind: 'western' | 'chinese', v: string): string | undefined =>
  (kind === 'western' ? zodiacMap[v] : chineseMap[v]);
export const zodiacLabel = (kind: 'western' | 'chinese', v: string, tx: Tx): string =>
  (kind === 'western' ? tx(`heroglyph.flow.ownerZodiac.sign.${v}`, v) : tx(`heroglyph.flow.ownerZodiac.animal.${v}`, v));

/** Záľuba/aktivita — bola duplicita (`SnifferCard` vs. `SnifferFullProfile`), teraz jeden zdroj. */
export const interestLabel = (v: string, tx: Tx): string =>
  tx(`pack.map.activityLabel.${v}`, ACTIVITY_OPTIONS.find((o) => o.value === v)?.labelEN ?? v);

/** Vzdialenosť V PÁSMACH (A3, Matej 26. 9.: „4. ok" — nie presné km, aby sa z opakovanej zmeny
 *  pinu nedala trilaterovať poloha bydliska). Server posiela `distanceBand`, kým sa tam nezapíše
 *  (kolo servera/logiky) je pole nepovinné navyše k `SnifferCardData`. */
export type DistanceBand = '0-5' | '5-10' | '10-25' | '25-50' | '50+';
type WithDistance = SnifferCardData & { distanceBand?: DistanceBand | null };
const DIST_LABEL: Record<DistanceBand, [string, string]> = {
  '0-5': ['pack.sniffer.dist.b0_5', 'within 5 km'],
  '5-10': ['pack.sniffer.dist.b5_10', '5–10 km away'],
  '10-25': ['pack.sniffer.dist.b10_25', '10–25 km'],
  '25-50': ['pack.sniffer.dist.b25_50', '25–50 km'],
  '50+': ['pack.sniffer.dist.b50p', 'more than 50 km away'],
};
export function distanceLabel(card: WithDistance, tx: Tx): string {
  const b = card.distanceBand;
  if (!b || !DIST_LABEL[b]) return '';
  const [k, f] = DIST_LABEL[b];
  return tx(k, f);
}

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
.sn-ov{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:${PACK_SPACE.xxxl * 2}px ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;
  /* Fotka viac v prechode, dole ÚPLNE čierna (Matej 25. 9.) — text nesmie stáť na farbe fotky. */
  background:linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.5) 28%, rgba(0,0,0,.86) 62%, #000 100%);
  color:${T.onDark};display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;font-family:${FONT_UI};}
/* C7 — meno ČLOVEKA je identita: Cinzel 700 (brand lock), nie Space Grotesk zdedený z .sn-ov. */
.sn-nm{margin:0;min-width:0;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.1;}
.sn-nm span{font-weight:400;}
.sn-meta{margin:0;font-size:${PACK_TEXT.label}px;opacity:.85;}
/* flex-wrap — dlhé meno + dva odznaky levelov sa na 360 px inak pobijú (audit C7). */
.sn-head{display:flex;align-items:center;flex-wrap:wrap;gap:${PACK_SPACE.md}px;row-gap:${PACK_SPACE.xs}px;}
.sn-lv{display:flex;flex-direction:column;align-items:flex-start;gap:${PACK_SPACE.xs}px;}
/* LEVELY — odznak, nie štítok (Matej 25. 9.: „vo farbe a v luxusnejšom chipe… lapis alebo zlato").
   PÚTNIK nesie farbu SVOJHO pásma (tierOfLevel, tá istá ako prstenec na mape), DEVOTION je
   lapis so zlatým písmom. Číslo v kotúči vľavo, zlatý lem, jemný lesk. */
.sn-lv > span{display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px ${PACK_SPACE.xs}px ${PACK_SPACE.xs}px;
  border-radius:${PACK_R.pill}px;border:1px solid ${BRAND_GOLD_BTN.edge};white-space:nowrap;box-shadow:${PACK_SHADOW.panel};
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;}
.sn-lv > span > b{display:inline-grid;place-items:center;min-width:${PACK_SPACE.lg + PACK_SPACE.xs}px;height:${PACK_SPACE.lg + PACK_SPACE.xs}px;padding:0 ${PACK_SPACE.xs}px;
  border-radius:${PACK_R.pill}px;font-family:${FONT_UI};font-weight:700;font-size:${PACK_TEXT.micro}px;letter-spacing:0;}
.sn-lv .is-pilgrim > b{background:rgba(0,0,0,.28);color:#fff;}
.sn-lv .is-devotion{background:${LAPIS.grad};color:${LAPIS.ink};}
.sn-lv .is-devotion > b{background:${BRAND_GOLD_BTN.grad};color:${BRAND_GOLD_BTN.ink};}
/* PSY pred zámerom: „1 pes · HEKTOR · Hľadám: Priateľstvo" */
.sn-dogs{margin:0;display:flex;align-items:center;gap:${PACK_SPACE.sm}px;font-size:${PACK_TEXT.label}px;}
/* C7 — karta nie je OFICIÁLNY povrch (DOG ID/certifikát/share/WALL/PackTree) → meno psa
   stačí plain Cinzel, nie Decorative (brand lock, výnimka zúžená 2026-08-14). */
.sn-dogs em{font-style:normal;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:.02em;}
.sn-lbl{align-self:center;font-size:${PACK_TEXT.label}px;opacity:.75;margin-right:${PACK_SPACE.xs}px;}
.sn-chip{align-self:flex-start;display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;white-space:nowrap;}
.sn-chip b{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;}
.sn-chip i{font-style:normal;opacity:.5;}
/* C5 — vizuálne 28 px vysoký, ale ťukacia plocha ≥40 px cez neviditeľný ::after (vzor HIT_CSS). */
.sn-full{position:relative;align-self:center;display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.lg}px;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;}
.sn-full::after{content:'';position:absolute;inset:-6px;}
/* C9 — šípka je KRESLENÁ (chevron z okraja), nie holý znak `↑`. */
.sn-full i{display:inline-block;width:6px;height:6px;margin-top:2px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-135deg);}
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
      {card.pilgrimLevel ? (() => {
        const t = tierOfLevel(card.pilgrimLevel);
        return (
          <span className="is-pilgrim" style={{ background: tierGradient(t), color: t.ink }}>
            <b>{card.pilgrimLevel}</b>{tx('pack.sniffer.pilgrim', 'Pilgrim')}
          </span>
        );
      })() : null}
      {dev && <span className="is-devotion"><b>{dev.index}</b>{tx(`pack.ladder.${dev.key}`, dev.name)}</span>}
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

/** 📍 bydlisko + vzdialenosť od diváka (pin sám von nejde, vzdialenosť ide v PÁSME — A3). */
export function snifferPlace(card: SnifferCardData, tx: Tx): string {
  return [card.region, distanceLabel(card, tx)].filter(Boolean).join(' · ');
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
  const interest = (v: string) => interestLabel(v, tx);

  return (
    <div className={`sn-card${back ? ' is-back' : ''} ${className}`} style={style}>
      {cur
        ? <div className="sn-slide"><img className="sn-bg" src={bgImg(cur, 400, 640)} alt="" draggable={false} /></div>
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
        {!lean && card.dogs.length > 0 && (
          <p className="sn-dogs">
            <BrandIcon name="paw" size={PACK_SPACE.lg} tint="white" />
            <span><b>{card.dogs.length}</b> {tx(`pack.sniffer.dogsWord.${plural(card.dogs.length)}`, card.dogs.length === 1 ? 'dog' : 'dogs')}</span>
            <i style={{ fontStyle: 'normal', opacity: 0.5 }}>·</i>
            <em>{card.dogs.map((d) => d.name).filter(Boolean).join(', ')}</em>
          </p>
        )}
        {!lean && (card.intents.length > 0 || card.interests.length > 0) && (
          <div className="sn-pills">
            {card.intents.length > 0 && <span className="sn-lbl">{tx('pack.sniffer.seeking', 'Looking for:')}</span>}
            {card.intents.map((i) => <span key={`i-${i}`} className="pk-pill pk-pill--dark">{tx(`pack.buddy.intent.${i}`, i)}</span>)}
            {card.interests.slice(0, 4).map((v) => <span key={`a-${v}`} className="pk-pill pk-pill--dark">{interest(v)}</span>)}
          </div>
        )}
        {onOpenFull && (
          <button type="button" className="sn-full pk-pill pk-pill--dark" onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onOpenFull(); }}>
            {tx('pack.sniffer.fullProfile', 'Full profile')} <i aria-hidden />
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
