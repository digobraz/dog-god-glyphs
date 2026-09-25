// SNIFFER — KARTA ČLOVEKA ako na Tinderi. JEDEN komponent pre balíček (SNIFFUJ) aj pre
// „Takto ťa vidia" (zadanie-sniffer-stavba §2.1, §2.3: „tá istá Tinder karta… jeden komponent!").
// Nákres: plany/nakres-sniffer-obrazovky-2026-09-25.html, obrazovky B a C (`.tc`).
//
// 🐕 PRVÁ FOTKA = PES AKO NA WALLE (Matej 25. 9.: „v profile bude mať fotku psa ako na walle
//    s heroglyfom a menom bez textu o poradí… a za ňou budú pokračovať fotky ostatné").
//    Heroglyf je HOTOVÝ obrázok zo steny (`dogs.heroglyph_png_url`) a nesie ten istý zlatý
//    filter ako hover na WALLE (`.dog-heroglyph`, GodsGrid.tsx). Poradové číslo NIE.
// Ťuk vľavo/vpravo v hornej polovici = predošlá/ďalšia fotka (pásiky hore).
import { useEffect, useState, type CSSProperties } from 'react';
import { withTransform } from '@/services/cloudinaryService';
import {
  PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, FONT_UI,
} from '@/components/pack/packTheme';
import { ACTIVITY_OPTIONS } from '@/components/pack/profile/packProfile';
import type { SnifferCardData } from './snifferDeck';
import { loadMyCard, pilgrimFromTrips } from './snifferDeck';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

/** Meno psa na OFICIÁLNOM povrchu = Cinzel Decorative (brand lock). Karta nesie psa zo steny. */
const DOG_NAME_FONT = "'Cinzel Decorative','Cinzel',serif";
/** Zlatý heroglyf — doslovne filter `.dog-heroglyph` z WALLU, aby pes vyzeral rovnako ako tam. */
const HEROGLYPH_GLOW = 'brightness(0) invert(1) sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3) '
  + 'drop-shadow(0 0 14px rgba(201,154,63,0.95)) drop-shadow(0 0 32px rgba(201,154,63,0.55))';

const img = (u: string | null | undefined, w = 900) => withTransform(u, `c_limit,w_${w},f_auto,q_auto`);

export const SNIFFER_CARD_CSS = `
.sn-card{position:absolute;inset:0;border-radius:${PACK_R.card}px;overflow:hidden;background:${T.pageBg};
  box-shadow:${PACK_SHADOW.panel};touch-action:pan-y;user-select:none;-webkit-user-select:none;}
.sn-card.is-back{transform:scale(.95) translateY(${PACK_SPACE.sm}px);opacity:.6;pointer-events:none;}
.sn-card.is-anim{transition:transform .32s ease, opacity .32s ease;}
.sn-slide{position:absolute;inset:0;}
.sn-slide > img.sn-bg{width:100%;height:100%;object-fit:cover;display:block;}
.sn-slide--dog > img.sn-bg{object-position:50% 30%;}
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
.sn-pil{margin:0;font-size:${PACK_TEXT.label}px;opacity:.72;}
.sn-bio{margin:0;font-size:${PACK_TEXT.label}px;line-height:1.45;opacity:.92;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.sn-pills{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.xs}px;}
.sn-pills .pk-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;}
.sn-dogs{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.sn-dog.pk-pill{gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px ${PACK_SPACE.xs}px ${PACK_SPACE.xs}px;
  font-family:${DOG_NAME_FONT};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.02em;}
.sn-dog img{width:${PACK_SPACE.xl}px;height:${PACK_SPACE.xl}px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.sn-stage{position:relative;flex:1 1 auto;min-height:360px;width:100%;max-width:440px;margin:0 auto;}
.sn-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:${PACK_SPACE.xl}px;text-align:center;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.onDark};}
`;

/** Tvar čísla pre SK/CS: 1 · 2–4 · 5+ (EN berie len `one` a `other`, `few` padne na fallback). */
const plural = (n: number) => (n === 1 ? 'one' : n >= 2 && n <= 4 ? 'few' : 'other');

type Slide = { kind: 'dog'; dog: SnifferCardData['dogs'][number] } | { kind: 'photo'; url: string };

export function SnifferCard({ card, tx, back = false, className = '', style }: {
  card: SnifferCardData;
  tx: Tx;
  back?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const [k, setK] = useState(0);
  const dog = card.dogs[0];
  const slides: Slide[] = [
    ...(dog?.photo ? [{ kind: 'dog' as const, dog }] : []),
    ...card.photos.filter(Boolean).map((url) => ({ kind: 'photo' as const, url })),
  ];
  const cur = slides[Math.min(k, slides.length - 1)];
  const go = (d: number) => setK((x) => (x + d + slides.length) % Math.max(1, slides.length));

  const p = pilgrimFromTrips(card.trips ?? []);
  const pilgrim = p.count > 0
    ? [
        tx('pack.sniffer.pilgrim', 'Pilgrim'),
        tx(`pack.sniffer.trips.${plural(p.count)}`, p.count === 1 ? '{n} trip' : '{n} trips', { n: p.count }),
        `${p.km} km`,
        tx(`pack.sniffer.countries.${plural(p.countries)}`, p.countries === 1 ? '{n} country' : '{n} countries', { n: p.countries }),
      ].join(' · ')
    : '';
  const interest = (v: string) => tx(`pack.map.activityLabel.${v}`, ACTIVITY_OPTIONS.find((o) => o.value === v)?.labelEN ?? v);

  return (
    <div className={`sn-card${back ? ' is-back' : ''} ${className}`} style={style}>
      {cur?.kind === 'dog' && (
        <div className="sn-slide sn-slide--dog">
          <img className="sn-bg" src={img(cur.dog.photo)} alt="" draggable={false} />
          <div className="sn-crest">
            {cur.dog.heroglyph && (
              <img className="sn-hg" src={img(cur.dog.heroglyph, 600)} alt="" draggable={false} style={{ filter: HEROGLYPH_GLOW }} />
            )}
            {cur.dog.name && <span className="sn-dogname pk-veil--plate">{cur.dog.name}</span>}
          </div>
        </div>
      )}
      {cur?.kind === 'photo' && (
        <div className="sn-slide"><img className="sn-bg" src={img(cur.url)} alt="" draggable={false} /></div>
      )}
      {!cur && <div className="sn-empty">{tx('pack.sniffer.noPhoto', 'No photo yet')}</div>}

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
        <p className="sn-nm">{card.name}{card.age ? <>, <span>{card.age}</span></> : null}</p>
        {card.region && <p className="sn-meta">{card.region}</p>}
        {/* PÚTNIK — JEDEN malý riadok (Matej 25. 9.: „nie také výrazné bloky"). */}
        {pilgrim && <p className="sn-pil">{pilgrim}</p>}
        {card.bio?.trim() && <p className="sn-bio">{card.bio.trim()}</p>}
        {(card.intents.length > 0 || card.interests.length > 0) && (
          <div className="sn-pills">
            {card.intents.map((i) => <span key={`i-${i}`} className="pk-pill pk-pill--dark">{tx(`pack.buddy.intent.${i}`, i)}</span>)}
            {card.interests.slice(0, 4).map((v) => <span key={`a-${v}`} className="pk-pill pk-pill--dark">{interest(v)}</span>)}
          </div>
        )}
        {card.dogs.length > 0 && (
          <div className="sn-dogs">
            {card.dogs.map((d, n) => (
              <span key={n} className="sn-dog pk-pill pk-pill--dark">
                {d.photo && <img src={img(d.photo, 96)} alt="" />}
                {d.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** „TAKTO ŤA VIDIA" (§2.3, nákres B) — tá istá karta ako v balíčku, dáta zo servera
 *  (`assnif_my_card`), nie poskladané v prehliadači. Čo tu vidíš, uvidia ostatní. */
export function SnifferMyCard({ tx, reloadKey }: { tx: Tx; reloadKey?: string }) {
  const [card, setCard] = useState<SnifferCardData | null>(null);
  useEffect(() => { loadMyCard().then(setCard).catch(() => setCard(null)); }, [reloadKey]);
  return (
    <div className="sn-stage">
      {card && <SnifferCard key={JSON.stringify(card.photos)} card={card} tx={tx} />}
    </div>
  );
}
