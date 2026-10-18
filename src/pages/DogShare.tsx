import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/PageTopBar';
import { Seo } from '@/components/Seo';
import { EDGE_BASE, LIVE_EDGE_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';
import { dogPagePath, packFromSlug } from '@/lib/dogSlug';
import { captureDogPageRef } from '@/lib/refCapture';
import { countryISO2, countryName } from '@/lib/countryGeo';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { useDogMessage } from '@/lib/dogMessages';
import { DOG_MESSAGE_CSS } from '@/components/gods/DogMessage';
import { withTransform } from '@/services/cloudinaryService';
import { ShareCard } from '@/components/ShareCard';
import { FLOW_PALE_CSS } from '@/components/screens/flowPaleSkin';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { PACK_BOX } from '@/components/pack/packTheme';

/**
 * Public share landing — `/d/:pack` (legacy) and `/dog/:slug` (canonical,
 * e.g. `/dog/bruno-23`).
 *
 * The whole point of this page is the OG image: when a member shares their
 * share-card link (WhatNextPopup "Share" action), the URL they post is
 * `/d/<pack_number>` or `/dog/<name>-<pack_number>` — NOT the raw Cloudinary
 * image — so link unfurls (Facebook/Twitter/Instagram/WhatsApp) show a
 * branded landing with a CTA instead of a bare image. Data comes from
 * get-grid-dogs (same public feed as the WALL), matched by pack_number. Once
 * the dog record loads, the URL is canonicalized in-place to `/dog/<slug>`.
 *
 * Layout (2026-07-09): desktop = no-scroll 2-column (photo+CTA left,
 * papyrus info block+"Back to WALL" right), sized purely via flexbox — the
 * outer page is pinned to 100dvh and the row fills whatever's left under
 * PageTopBar. Both squares (photo, papyrus) share the same aspect-square +
 * height:100%-of-flex-frame + max-h-[390px] treatment so they render at
 * identical size — no hardcoded "topbar is Npx" guess. Each column is a
 * flex-col: a flex-1/min-h-0 frame holding the square, plus a fixed-size
 * element below it (gold CTA / back link) — that's why max-h dropped from
 * ~460 to 390, to leave room for those. Mobile stays a plain scrolling stack:
 * photo → CTA → papyrus block → back link.
 */

// 🔧 DEV: stránka psa číta TEN ISTÝ zdroj ako stena (GodsGridLab, `WALL_SRC_DEV`).
// Stena v deve ťahá ostrých psov, DEV projekt má 5 testovacích — klik na
// STRÁNKU PSA zo steny (napr. LUKY #37) potom končil „Tento pes ešte nie je vo
// svorke" (Matej 3. 10. 2026). Endpoint je verejný a len na čítanie. V produkcii
// sú EDGE_BASE aj LIVE_EDGE_BASE ten istý projekt, takže sa tam nemení nič.
const DOG_FEED_BASE = import.meta.env.DEV && (() => {
  try { return localStorage.getItem('dogypt-wall-src') !== 'dev'; } catch { return true; }
})() ? LIVE_EDGE_BASE : EDGE_BASE;

/** Šírka fotky psa v px: šírka karty (≤ 400 CSS px) × hustota displeja, zaokrúhlená na 120,
 *  strop 1080 (pôvodná pevná hodnota). index.html ju ráta TÝM ISTÝM vzorcom a fotku predsťahuje
 *  (`window.__dogPhotoW`) — adresy sa musia zhodovať, inak sa fotka stiahne dvakrát. */
const dogPhotoW = (): number => {
  const w = (window as Window & { __dogPhotoW?: number }).__dogPhotoW;
  if (w) return w;
  const css = Math.min(window.innerWidth || 400, 400);
  return Math.min(1080, Math.ceil(css * (window.devicePixelRatio || 1) / 120) * 120);
};

interface GridDog {
  pack_number: number | null;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  heroglyph_png_url: string | null;
  share_card_url?: string | null;
  country: string | null;
  owner_message: string | null;
  owner_first_name?: string | null;
  birth_year?: number | null;
  birth_date?: string | null;
  joined_at?: string | null;
  life_status?: string | null;
  death_date?: string | null;
  /** 'member' | 'guest' | 'supporter' — len s `?tiers=all` (stránka ho pýta vždy). */
  wall_tier?: string | null;
}

const DEFAULT_OG = 'https://dogypt.com/og-image.jpg';

type Status = 'loading' | 'found' | 'notfound';

interface DogAge {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  humanYears: number; // "≈ N in human years" (×7) — same formula as PACK
}

// birth_date → asOf, full breakdown (calendar-accurate, mirrors PackDogDetail's
// computeAge but sourced from the feed's exact ISO birth_date). For a living dog
// asOf = today ("living my best life"). For a deceased dog asOf = death_date, so
// the lifespan is FROZEN at the day it ended ("lived my best life"). A deceased
// dog with no valid death_date returns null → subtitle falls back to "Founding
// Dogyptian".
function computeDogAge(
  birthDate: string | null | undefined,
  lifeStatus: string | null | undefined,
  deathDate?: string | null | undefined
): DogAge | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  let asOf: Date;
  if (lifeStatus === 'deceased') {
    if (!deathDate) return null;
    asOf = new Date(deathDate);
    if (Number.isNaN(asOf.getTime())) return null;
  } else {
    asOf = new Date();
  }
  if (birth > asOf) return null;

  let years = asOf.getFullYear() - birth.getFullYear();
  let months = asOf.getMonth() - birth.getMonth();
  let days = asOf.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(asOf.getFullYear(), asOf.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.floor((asOf.getTime() - birth.getTime()) / 86_400_000);
  const humanYears = Math.max(1, Math.round((totalDays / 365.25) * 7));
  return { years, months, days, totalDays, humanYears };
}

/**
 * Share karta NAŽIVO, zmenšená na šírku rámu. `ShareCard` má pevných 1080 px
 * (je to aj predloha PNG), preto sa mierka ráta z nameranej šírky obalu.
 * ⚠️ Prečo nie `share_card_url`: starí psi majú v DB ešte TMAVÉ PNG — kým ich
 *    `wall-healer` na LIVE neprepečie, obrázok by sa bil s bledou stránkou.
 *    PNG ostáva pre og:image (náhľad odkazu) a stiahnutie.
 */
function LiveShareCard(props: { packNumber: number; dogName: string; photoUrl: string; heroglyphUrl: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / 1080);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={boxRef} className="ds-media">
      <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: '0 0', visibility: scale ? 'visible' : 'hidden' }}>
        <ShareCard {...props} />
      </div>
    </div>
  );
}

export default function DogShare() {
  const t = useT();
  const { pack, slug } = useParams<{ pack?: string; slug?: string }>();
  const packNum = packFromSlug(slug ?? pack);
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [dog, setDog] = useState<GridDog | null>(null);

  useEffect(() => {
    let alive = true;
    if (packNum === null) {
      setStatus('notfound');
      return;
    }
    // NOTE: no Authorization/apikey headers — get-grid-dogs' CORS config only
    // allows `content-type, authorization` (not `apikey`), and the function is
    // public/service-role internally anyway. Matches the working fetch in
    // GodsGrid.tsx (the WALL uses the exact same feed with a plain fetch).
    // Feed už mohol vypýtať index.html (stránka psa, perf 7. 10. 2026) — len keď mieri na LIVE.
    const early = DOG_FEED_BASE === LIVE_EDGE_BASE ? (window as Window & { __dogFeed?: Promise<GridDog[]> }).__dogFeed : undefined;
    (window as Window & { __dogFeed?: Promise<GridDog[]> }).__dogFeed = undefined;
    // `?tiers=all` — číslo má od 17. 10. 2026 aj schválený hosť (index.html a worker pýtajú to isté).
    (early ?? fetch(`${DOG_FEED_BASE}/get-grid-dogs?tiers=all`).then((r) => (r.ok ? r.json() : [])))
      .then((dogs: GridDog[]) => {
        if (!alive) return;
        const found = dogs.find((d) => d.pack_number === packNum);
        if (found) {
          setDog(found);
          setStatus('found');
          // ⚠️ TU SA UŽ ODPORÚČATEĽ NEZAPISUJE (Matej 12.8.2026, po nasadení:
          // „to nie je ok, lebo ľudia si len čítajú odkazy majiteľov… musíme to
          // opraviť a dať to za CTA na prísno"). Psia stránka je aj ČÍTANIE —
          // odkaz majiteľa je obsah, na ktorý sa chodí zo zvedavosti, nie pozvánka.
          // Samotná návšteva (ani zvonku) teda nie je nábor; kredit vzniká až
          // vedomým klikom na CTA nižšie (`handleJoin`).
          // Canonicalize the URL in place (no reload) once we know the real
          // name — covers /d/23, /dog/23 and /dog/wrong-name-23.
          const canonicalPath = dogPagePath(found.dog_name, packNum);
          if (window.location.pathname !== canonicalPath) {
            window.history.replaceState(null, '', canonicalPath + window.location.search);
          }
        } else {
          setStatus('notfound');
        }
      })
      .catch(() => {
        if (alive) setStatus('notfound');
      });
    return () => {
      alive = false;
    };
  }, [packNum]);

  // Fire once on mount — a link click/unfurl is the event we care about,
  // independent of whether the dog record resolves.
  useEffect(() => {
    track('share_landing_view', {
      pack: packNum,
      ref: searchParams.get('ref') || null,
      channel: searchParams.get('utm_medium') || null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dogName = dog?.dog_name || 'This dog';
  const ogImage = dog?.share_card_url || dog?.cloudinary_main_url || DEFAULT_OG;
  // Share karta je surové PNG z generátora — pre psa #1 má 1,08 MB z 1,8 MB celej
  // stránky (merané na LIVE 18. 9. 2026). Tá istá URL išla do dvoch úplne rôznych
  // miest, a preto sa transformuje DVOMA rôznymi spôsobmi:
  //   • `cardImg`  — náhľad na stránke, kreslí sa do 390 CSS px
  //   • `cardOg`   — og:image pre crawlerov; Facebook chce ≥ 1200 px, ale nie surový PNG
  // Pôvodnú veľkosť si ponecháva len stiahnutie karty (`downloadCard`), kde je celá
  // pointa v tom, že je veľká.
  const cardImg = withTransform(ogImage, 'c_fit,w_780,f_auto,q_auto');
  const cardOg = withTransform(ogImage, 'c_fit,w_1200,f_auto,q_auto');
  const seoTitle = status === 'found' ? `${dogName} — DOGYPT` : 'DOGYPT';
  const seoDescription =
    status === 'found'
      ? `${dogName} is one of the first 1,000,000 dogs of DOGYPT. Find your dog's place in the global pack.`
      : "Join the first 1,000,000 dogs of DOGYPT. Find your dog's place in the global pack.";

  // JEDINÝ okamih, kedy stránka psa pripíše odporúčateľa: návštevník klikol
  // „Pridaj sa". Zapíše sa PACK ČÍSLO (backend `resolve_ref_code` si ho preloží
  // na majiteľov affiliate účet) a až potom sa ide do flow.
  // ⚠️ Plná navigácia, nie React Router: `/entry` je vstup do heroglyph flowu a
  //    doterajšie CTA sem chodilo cez <a href> — zápis do localStorage prebehne
  //    synchrónne pred odchodom, takže sa nemá čo stratiť.
  const handleJoin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (dog?.pack_number) captureDogPageRef(dog.pack_number);
    void e;
  };

  const flagIso = dog ? countryISO2(dog.country) : null;
  const { lang } = useLang();
  // Štát celým menom v jazyku stránky; neznámy jazyk/kód → anglický názov.
  const countryLabel = (() => {
    if (!flagIso) return '';
    try { return new Intl.DisplayNames([intlLocale(lang)], { type: 'region' }).of(flagIso.toUpperCase()) || countryName(flagIso); }
    catch { return countryName(flagIso); }
  })();
  const isGuest = dog?.wall_tier === 'guest';
  const age = dog ? computeDogAge(dog.birth_date, dog.life_status, dog.death_date) : null;
  const alphaName = dog?.owner_first_name?.trim() || null;
  const ownerMessage = dog?.owner_message?.trim() || '';
  // Odkaz v jazyku stránky + prepínač na originál (Matej 18. 10. 2026).
  const msgTr = useDogMessage(dog?.pack_number, ownerMessage);
  const [msgOrig, setMsgOrig] = useState(false);
  // Living Legend (alive) vs Dog Angel (deceased) — same source of truth as PACK
  // (PackDogDetail): dog.life_status === 'deceased'. Missing/unknown → alive.
  const isDeceased = dog?.life_status === 'deceased';
  // Memorial counters (mirror PACK): "lived my best life" is frozen in `age`
  // above (asOf = death_date); "in angel form" counts death_date → today.

  return (
    <div className="hf-pale dogshare-page min-h-screen flex flex-col">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={status === 'found' && packNum !== null ? dogPagePath(dogName, packNum) : window.location.pathname}
        type="article"
        ogImage={cardOg}
      />
      {/* ── BLEDÝ ŠAT (Matej 3. 10. 2026: *„je stále zlá - v tmavom šate"* →
          návrh A z hárku `plany/nakres-stranka-psa-2026-10-03/`). Stena a logo
          sú tie isté ako vo vstupe (`FLOW_PALE_CSS`), pes je na JEDNEJ karte —
          tej istej rodiny ako karta na stene a planéte (DogCard.tsx, „svetlá").
          Hore štvorcová share karta (meno, heroglyf, #číslo, web sú na nej),
          pod ňou život, údaje, odkaz majiteľa a pozvánka. PRIDAJ SA = lapis
          v karte pod textom (na bledom je zlaté CTA mimo brandu). */}
      <style>{FLOW_PALE_CSS + DOG_MESSAGE_CSS + `
        .ds-main {
          flex: 1 1 auto; display: flex; flex-direction: column; align-items: center;
          padding: 8px 16px calc(24px + var(--consent-h, 0px));
        }
        .ds-main > * { margin-top: auto; }
        .ds-main > :last-child { margin-bottom: auto; }
        .ds-card {
          width: 100%; max-width: 400px;
          display: flex; flex-direction: column; gap: 16px;
          padding: 16px; color: #2a1608;
        }
        .ds-media {
          position: relative; width: 100%; aspect-ratio: 1 / 1; flex: none;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 12px 28px -14px rgba(58,38,8,0.5);
        }
        .ds-body { display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center; }
        .ds-body > * { width: 100%; }
        @media (min-width: 768px) {
          .ds-card { max-width: 832px; display: grid; grid-template-columns: 400px 1fr; gap: 24px; padding: 24px; align-items: center; }
          .ds-body { padding: 8px 8px 8px 0; }
        }
        .ds-head { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .ds-name { margin: 0; font-family: 'Cinzel Decorative', serif; font-weight: 900; font-size: 24px; line-height: 1.15; letter-spacing: 0.04em; color: #1a1a1a; overflow-wrap: anywhere; }
        .ds-num {
          display: inline-flex; align-items: center; padding: 4px 16px; border-radius: 999px;
          background: ${LAPIS.grad}; color: ${LAPIS.ink}; box-shadow: ${LAPIS_BTN_SHADOW};
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 20px; line-height: 1.1;
        }
        .ds-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .ds-fact { padding: 12px 16px; text-align: center; min-width: 0; }
        .ds-fact i {
          display: block; font-family: 'Space Grotesk', sans-serif; font-style: normal; font-weight: 500;
          font-size: 10px; line-height: 1.3; letter-spacing: 0.22em; text-transform: uppercase; color: #8C6014;
        }
        .ds-fact b {
          display: block; margin-top: 4px; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px;
          line-height: 1.2; color: #1a1a1a; text-transform: uppercase; overflow-wrap: anywhere;
        }
        .ds-quote { padding: 12px 16px; }
        .ds-msg {
          margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 400; font-style: italic;
          font-size: 14px; line-height: 1.5; color: rgba(26,26,26,0.72);
          display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 6; overflow: hidden;
        }
        .ds-msg-by { margin: 4px 0 0; font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: rgba(42,22,8,0.55); }
        .dogshare-invite {
          margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px; line-height: 1.3;
          letter-spacing: 0.14em; text-transform: uppercase; color: #6E4E18;
        }
        .ds-cta {
          align-self: stretch; min-height: 56px; display: flex; align-items: center; justify-content: center;
          border-radius: 8px; text-decoration: none;
          background: ${LAPIS.grad}; color: ${LAPIS.ink}; border: 1px solid ${LAPIS.edge};
          box-shadow: ${LAPIS_BTN_SHADOW};
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 200ms ease;
        }
        .ds-cta:hover { background: ${LAPIS.gradHover}; }
        .dogshare-bones { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .dogshare-bones-main { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 12px; line-height: 1.4; color: #2a1608; }
        .dogshare-bones-note { font-family: 'Space Grotesk', sans-serif; font-size: 10px; line-height: 1.4; color: rgba(42,22,8,0.55); }
        .dogshare-back-link {
          margin-top: 16px; font-family: 'Space Grotesk', sans-serif; font-size: 12px;
          color: rgba(42,22,8,0.6); text-decoration: none;
        }
        .dogshare-back-link:hover { color: ${LAPIS.edge}; }
        .ds-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
      `}</style>

      <div className="hf-topbar"><PageTopBar /></div>

      <main className="ds-main">
        {status === 'notfound' && (
          <div className="ds-card" style={{ alignItems: 'center', textAlign: 'center', padding: 24 }}>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
              {t('dogPage.notFoundTitle')}
            </h1>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: 'rgba(42,22,8,0.65)', margin: 0 }}>
              {t('dogPage.notFoundBody')}
            </p>
            <a href="/heroglyph/name" className="ds-cta">{t('wall.hero.cta')}</a>
          </div>
        )}

        {status === 'found' && dog && (
          <>
            <article className="ds-card" style={PACK_BOX.card}>
              {/* Meno je na obrázku — pre čítačky a vyhľadávače ostáva nadpis. */}
              <h1 className="ds-sr">{dogName}</h1>
              {dog.pack_number !== null ? (
                <LiveShareCard
                  packNumber={dog.pack_number}
                  dogName={dogName}
                  photoUrl={withTransform(dog.cloudinary_main_url || '', `c_fill,w_${dogPhotoW()},h_${dogPhotoW()},g_auto,f_auto,q_auto`)}
                  heroglyphUrl={withTransform(dog.heroglyph_png_url || '', 'c_fit,w_1200,f_auto,q_auto')}
                />
              ) : ogImage && (
                <img src={cardImg} alt={`${dogName} — DOGYPT`} className="ds-media" style={{ objectFit: 'cover' }} />
              )}

              <div className="ds-body">
                <div className="ds-head">
                  <h2 className="ds-name">{dogName}</h2>
                  {dog.pack_number !== null && <span className="ds-num">#{dog.pack_number}</span>}
                </div>

                {/* Mriežka 2×2 (nákres A3): dni · status · stav · štát. */}
                <div className="ds-grid">
                  <div className="ds-fact" style={PACK_BOX.subblock}>
                    <i>{isDeceased ? t('dogPage.livedBestLife') : t('pack.dog.livingBestLife')}</i>
                    <b>{age ? t('dogPage.daysCount', { days: age.totalDays.toLocaleString('en-US') }) : '—'}</b>
                  </div>
                  <div className="ds-fact" style={PACK_BOX.subblock}>
                    <i>{t('dogPage.statusLbl')}</i>
                    <b>{isDeceased ? t('dogPage.dogAngel') : t('dogPage.livingLegend')}</b>
                  </div>
                  <div className="ds-fact" style={PACK_BOX.subblock}>
                    <i>{t('dogPage.stateLbl')}</i>
                    <b>{isGuest ? t('dogPage.stateGuest') : t('dogPage.stateMember')}</b>
                  </div>
                  <div className="ds-fact" style={PACK_BOX.subblock}>
                    <i>{t('dogPage.countryLbl')}</i>
                    <b>{countryLabel || '—'}</b>
                  </div>
                </div>

                {ownerMessage && (
                  <div className="ds-quote" style={PACK_BOX.row}>
                    <p className="ds-msg">&ldquo;{msgTr.translated && !msgOrig ? msgTr.text : ownerMessage}&rdquo;</p>
                    {msgTr.translated && (
                      <button type="button" className="dm-toggle" onClick={() => setMsgOrig((o) => !o)}>
                        {t(msgOrig ? 'wall.msg.showTr' : 'wall.msg.showOrig')}
                      </button>
                    )}
                    <p className="ds-msg-by">— {alphaName || dogName}</p>
                  </div>
                )}

                {/* ── POZVÁNKA — dogpage je náborová stránka majiteľa (Matej 12.8.2026).
                    Hovorí ju ČLOVEK + pes; verejný feed vydáva len krstné meno majiteľa. */}
                <p className="dogshare-invite">
                  {alphaName
                    ? t('dogPage.invitedByDog', { name: alphaName.toUpperCase(), dog: dogName.toUpperCase() })
                    : t('dogPage.invitedByFallback')}
                </p>
                <a href="/heroglyph/name" className="ds-cta" onClick={handleJoin}>
                  {t('dogPage.joinUs')}
                </a>
                {/* ── +20 KOSTÍ — LEN pri členovi (hosť nemá profil). ⚠️ Druhý riadok je povinný:
                    kosti pristanú na účte MAJITEĽA (10 BONES = 1 €), transparentnosť je pilier misie. */}
                {!isGuest && (
                  <div className="dogshare-bones">
                    <span className="dogshare-bones-main">
                      {t('dogPage.bonesForDog', { dog: dogName.toUpperCase() })}
                    </span>
                    <span className="dogshare-bones-note">{t('dogPage.bonesNote')}</span>
                  </div>
                )}
              </div>
            </article>
            <Link to="/" className="dogshare-back-link">{t('dogPage.backToWall')}</Link>
          </>
        )}
      </main>
    </div>
  );
}
