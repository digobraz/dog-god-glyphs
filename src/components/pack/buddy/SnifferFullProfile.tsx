// SNIFFER — CELÝ PROFIL (kolo 2 §6.2). Otvára ho tlačidlo „Celý profil" na karte v balíčku
// a ťuk na človeka v HĽADAŤ. Nákres: plany/nakres-sniffer-kolo2-2026-09-25.html, obrazovka B.
//
// Štyri karty v poradí (Matej 25. 9.): 1 fotka · 2 bio a info · 3 rajón + TRIPLIST/TRIPWISH +
// hľadám · 4 psy. Na PC VODOROVNE (posun do strany), na mobile ZVISLO pod sebou (odpoveď 5).
//
// 🔴 Rajón ukazuje LEN OBRYS KRAJINY a vzdialenosť — pin je súkromný (§6.6).
// 🐕 Psí blok (kolo 2, 26. 9.): MENO psa → HEROGLYF (mimo fotky) → album, za prvou fotkou
//    fotky z denníka psa. Samostatné úložisko fotiek psa neexistuje (createRegistry.ts `photo`).
// 🔒 Orientácia prichádza zo servera len so súhlasom človeka (`orientationPublic`).
import type { ReactNode } from 'react';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, FONT_UI,
} from '@/components/pack/packTheme';
import {
  GENDER_OPTIONS, SMOKE_OPTIONS, DIET_OPTIONS, WORK_OPTIONS, ORIENTATION_OPTIONS,
  PERSONALITY_OPTIONS,
} from '@/components/pack/profile/packProfile';
import { countryName } from '@/lib/countryGeo';
import { BrandIcon } from '@/components/pack/BrandIcon';
import {
  SnifferCard, SnifferLevels, SnifferStatsChip, SNIFFER_CARD_CSS, snifferPlace,
  DOG_NAME_FONT, img, bgImg, interestLabel, zodiacIcon, zodiacLabel,
} from './SnifferCard';
import { SnifferCountryOutline } from './SnifferPin';
import { tripNames, type SnifferCardData, type SnifferDog } from './snifferDeck';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

/** Od tejto šírky idú karty vedľa seba (PC). Pod ňou zvislo (mobil). */
const ROW_AT = 900;
const CARD_W = 300;

const CSS = `
.sfp{width:100%;max-width:${CARD_W * 4 + PACK_SPACE.lg * 3 + PACK_SPACE.xl * 2}px;max-height:100%;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.sfp-row{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;overflow-y:auto;padding:0 ${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;}
.sfp-photo{position:relative;flex:0 0 auto;height:min(520px, 72dvh);}
.sfp-card{flex:0 0 auto;padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;font-family:${FONT_UI};}
@media (min-width:${ROW_AT}px){
  .sfp-row{flex-direction:row;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;padding:0 ${PACK_SPACE.xl}px ${PACK_SPACE.md}px;}
  .sfp-row > *{flex:0 0 ${CARD_W}px;scroll-snap-align:start;overflow-y:auto;}
  .sfp-photo{height:auto;min-height:480px;}
}
.sfp-eb{font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.sfp-bio{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.5;color:${T.inkStrong};white-space:pre-line;overflow-wrap:anywhere;}
.sfp-kv{display:flex;justify-content:space-between;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.sm}px 0;border-top:1px solid ${T.hairline};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.sfp-kv:first-of-type{border-top:0;}
.sfp-kv b{font-weight:600;color:${T.inkStrong};text-align:right;}
.sfp-pills{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.xs}px;}
.sfp-pills .pk-pill{font-size:${PACK_TEXT.label}px;}
.sfp-sign{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;}
.sfp-sign img{height:${PACK_TEXT.body}px;width:auto;display:block;}
.sfp-place{margin:0;font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.sfp-two{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;}
.sfp-list{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;min-width:0;}
/* C6 — dlhý názov výletu sa NEOREZÁVA na jeden riadok, zalomí sa na dva (audit: „Záruby 1…"). */
.sfp-list span{font-size:${PACK_TEXT.label}px;color:${T.inkStrong};padding-top:${PACK_SPACE.xs}px;border-top:1px solid ${T.hairline};
  overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.sfp-list small{font-size:${PACK_TEXT.label}px;color:${T.inkFaint};}
.sfp-dog{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
/* KOLO 2 (Matej 26. 9.: „heroglyf dajme mimo fotky, dáme len meno psa, heroglyf a potom album").
   Meno a heroglyf stoja NAD albumom na papyruse; heroglyf v brandovej zlatej (na bledom
   podklade — žiarivý filter zo steny patrí na tmavú fotku). */
.sfp-dogname{margin:0;font-family:${DOG_NAME_FONT};font-weight:700;font-size:${PACK_TEXT.h2}px;letter-spacing:.02em;color:${T.inkStrong};text-align:center;}
.sfp-hg{display:block;width:72%;max-width:260px;height:auto;margin:0 auto;
  filter:brightness(0) saturate(100%) invert(48%) sepia(62%) saturate(520%) hue-rotate(8deg) brightness(92%);}
.sfp-dog + .sfp-dog{padding-top:${PACK_SPACE.md}px;border-top:1px solid ${T.hairline};}
.sfp-alb{display:grid;grid-template-columns:2fr 1fr;grid-auto-rows:${PACK_SPACE.xxxl + PACK_SPACE.lg}px;gap:${PACK_SPACE.xs}px;}
.sfp-alb > img{width:100%;height:100%;object-fit:cover;border-radius:${PACK_R.field}px;}
.sfp-wall{position:relative;grid-row:span 3;border-radius:${PACK_R.tile}px;overflow:hidden;border:1px solid ${T.accentGold};background:${T.pageBg};}
.sfp-wall.is-solo{grid-column:1 / -1;grid-row:span 4;}
.sfp-wall__empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.35;}
.sfp-acts{display:flex;justify-content:center;gap:${PACK_SPACE.xl}px;padding-bottom:${PACK_SPACE.sm}px;}
/* Plávajúci AINUBIS sedí vpravo dole — na úzkom mobile sa rad zúži (ten istý vzor ako balíček). */
@media (max-width:419px){.sfp-acts{gap:${PACK_SPACE.lg}px;}}
`;

const opt = (list: Array<{ value: string; labelEN: string; emoji?: string }>, v?: string) => list.find((o) => o.value === v);

function DogAlbum({ dog, tx }: { dog: SnifferDog; tx: Tx }) {
  const photos = [dog.photo, ...(dog.album ?? []).filter((u) => u && u !== dog.photo)].filter(Boolean).slice(0, 7) as string[];
  const [first, ...rest] = photos;
  return (
    <div className="sfp-dog">
      {dog.name && <p className="sfp-dogname">{dog.name}</p>}
      {dog.heroglyph && <img className="sfp-hg" src={img(dog.heroglyph, 520)} alt="" />}
      <div className="sfp-alb">
        <div className={`sfp-wall sn-slide${rest.length ? '' : ' is-solo'}`}>
          {/* C2 — fotka psa má uložený výrez (c_crop): bgImg REŤAZÍ zmenšenie ZA ním, nie namiesto. */}
          {first
            ? <img className="sn-bg" src={bgImg(first, 220, 240)} alt="" style={{ objectPosition: '50% 30%' }} />
            : <div className="sfp-wall__empty"><BrandIcon name="paw" size={PACK_SPACE.xxl} tint="white" /></div>}
        </div>
        {rest.map((u) => <img key={u} src={bgImg(u, 100, 64)} alt="" loading="lazy" />)}
      </div>
      {dog.bio?.trim() && <p className="sfp-bio">{dog.bio.trim()}</p>}
      {dog.temperament.length > 0 && (
        <div className="sfp-pills">
          {dog.temperament.map((v) => <span key={v} className="pk-pill">{tx(`pack.dogTag.${v}`, v)}</span>)}
        </div>
      )}
    </div>
  );
}

export function SnifferFullProfile({ card, tx, actions }: { card: SnifferCardData; tx: Tx; actions?: ReactNode }) {
  const info = card.info ?? {};
  const rows: Array<[string, string]> = [];
  const add = (label: string, v?: string | null) => { if (v) rows.push([label, v]); };
  const o = (key: string, list: Array<{ value: string; labelEN: string; emoji?: string }>, v?: string) => {
    const x = opt(list, v);
    return x ? `${x.emoji ? x.emoji + ' ' : ''}${tx(`pack.sniffer.info.${key}.${x.value}`, x.labelEN)}` : v;
  };
  add(tx('pack.sniffer.info.gender', 'Gender'), o('gender', GENDER_OPTIONS, info.gender));
  add(tx('pack.sniffer.info.orientation', 'Orientation'), o('orientation', ORIENTATION_OPTIONS, info.orientation));
  add(tx('pack.sniffer.info.nationality', 'Nationality'), info.nationality ? countryName(info.nationality.toLowerCase()) : null);
  add(tx('pack.sniffer.info.languages', 'Languages'), info.languages?.length ? info.languages.join(' · ') : null);
  add(tx('pack.sniffer.info.smoke', 'Smoking'), o('smoke', SMOKE_OPTIONS, info.smoke));
  add(tx('pack.sniffer.info.diet', 'Diet'), o('diet', DIET_OPTIONS, info.diet));
  add(tx('pack.sniffer.info.work', 'Work'), o('work', WORK_OPTIONS, info.work));

  const walked = tripNames(card.trips ?? []);
  const wishes = card.wishes ?? [];
  const place = snifferPlace(card, tx);
  const interest = (v: string) => interestLabel(v, tx);

  return (
    <div className="sfp">
      <style>{SNIFFER_CARD_CSS}</style>
      <style>{CSS}</style>
      <div className="sfp-row">
        {/* 1 · FOTKA — tá istá karta ako v balíčku, bez bia (to má karta 2) */}
        <div className="sfp-photo"><SnifferCard card={card} tx={tx} lean /></div>

        {/* 2 · BIO A INFO */}
        <section className="sfp-card" style={{ ...PACK_BOX.card }}>
          <span className="sfp-eb">{tx('pack.sniffer.full.bio', 'Bio & info')}</span>
          {card.bio?.trim() && <p className="sfp-bio">{card.bio.trim()}</p>}
          {rows.map(([k, v]) => <div key={k} className="sfp-kv"><span>{k}</span><b>{v}</b></div>)}
          {/* ZNAMENIE — tá istá kresba ako malý rámik heroglyfu (nie emoji, `check:ikony`). */}
          {(card.zodiac?.western || card.zodiac?.chinese) && (
            <div className="sfp-pills">
              {card.zodiac?.western && (
                <span className="pk-pill sfp-sign">
                  {zodiacIcon('western', card.zodiac.western) && <img src={zodiacIcon('western', card.zodiac.western)} alt="" />}
                  {zodiacLabel('western', card.zodiac.western, tx)}
                </span>
              )}
              {card.zodiac?.chinese && (
                <span className="pk-pill sfp-sign">
                  {zodiacIcon('chinese', card.zodiac.chinese) && <img src={zodiacIcon('chinese', card.zodiac.chinese)} alt="" />}
                  {zodiacLabel('chinese', card.zodiac.chinese, tx)}
                </span>
              )}
            </div>
          )}
          {/* AKÝ SI — to, čo človek vybral v „Váš profil" 2/6. */}
          {((card.personality?.length ?? 0) > 0 || card.customPersonality) && (
            <div className="sfp-pills">
              {PERSONALITY_OPTIONS.filter((o) => card.personality?.includes(o.value)).map((o) => (
                <span key={o.value} className="pk-pill">{tx(`pack.profileTag.${o.value}`, o.labelEN)}</span>
              ))}
              {card.customPersonality && <span className="pk-pill">{card.customPersonality}</span>}
            </div>
          )}
          {card.interests.length > 0 && (
            <div className="sfp-pills">{card.interests.map((v) => <span key={v} className="pk-pill">{interest(v)}</span>)}</div>
          )}
        </section>

        {/* 3 · MÔJ RAJÓN + TRIPLIST / TRIPWISH + HĽADÁM (skica Mateja 25. 9.) */}
        <section className="sfp-card" style={{ ...PACK_BOX.card }}>
          <span className="sfp-eb">{tx('pack.sniffer.full.patch', 'My patch')}</span>
          <SnifferCountryOutline iso={card.country} />
          {place && <p className="sfp-place">📍 {place}</p>}
          <div className="sfp-two">
            <div className="sfp-list" style={{ ...PACK_BOX.subblock }}>
              <span className="sfp-eb" style={{ border: 0, padding: 0 }}>TRIPLIST</span>
              {walked.length ? walked.slice(0, 8).map((n) => <span key={n}>{n}</span>) : <small>{tx('pack.sniffer.full.none', 'Nothing yet')}</small>}
            </div>
            <div className="sfp-list" style={{ ...PACK_BOX.subblock }}>
              <span className="sfp-eb" style={{ border: 0, padding: 0 }}>TRIPWISH</span>
              {wishes.length ? wishes.slice(0, 8).map((n) => <span key={n}>{n}</span>) : <small>{tx('pack.sniffer.full.none', 'Nothing yet')}</small>}
            </div>
          </div>
          {card.intents.length > 0 && (
            <>
              <span className="sfp-eb">{tx('pack.sniffer.full.seeking', 'Looking for')}</span>
              <div className="sfp-pills">{card.intents.map((i) => <span key={i} className="pk-pill">{tx(`pack.buddy.intent.${i}`, i)}</span>)}</div>
            </>
          )}
        </section>

        {/* 4 · PSY — pri každom album, bio a povaha */}
        <section className="sfp-card" style={{ ...PACK_BOX.card }}>
          <span className="sfp-eb">{tx('pack.sniffer.full.dogs', 'Dogs')}</span>
          {card.dogs.length
            ? card.dogs.map((d, n) => <DogAlbum key={n} dog={d} tx={tx} />)
            : <p className="sfp-bio">{tx('pack.sniffer.full.none', 'Nothing yet')}</p>}
        </section>
      </div>
      {actions && <div className="sfp-acts">{actions}</div>}
    </div>
  );
}

// Znova export, aby HĽADAŤ nemusel poznať dva súbory kvôli jednému riadku mena.
export { SnifferLevels, SnifferStatsChip };
