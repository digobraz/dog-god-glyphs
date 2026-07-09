import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/PageTopBar';
import { Seo } from '@/components/Seo';
import { EDGE_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';
import { dogPagePath, packFromSlug } from '@/lib/dogSlug';
import { captureDogPageRef } from '@/lib/refCapture';
import { countryISO2, flagUrl, iso2ToISO3 } from '@/lib/countryGeo';
import { useT } from '@/i18n/LanguageContext';

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

// today − birth_date, full breakdown (calendar-accurate, mirrors PackDogDetail's
// computeAge but sourced from the feed's exact ISO birth_date instead of raw
// selections). Deceased dogs (memorial mode) never show a "living my best
// life" line — the subtitle falls back to "Founding Dogyptian" for them.
function computeDogAge(
  birthDate: string | null | undefined,
  lifeStatus: string | null | undefined
): DogAge | null {
  if (!birthDate || lifeStatus === 'deceased') return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  if (birth > now) return null;

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86_400_000);
  const humanYears = Math.max(1, Math.round((totalDays / 365.25) * 7));
  return { years, months, days, totalDays, humanYears };
}

// today − joined_at, in whole days.
function computeDaysInPack(joinedAt: string | null | undefined): number | null {
  if (!joinedAt) return null;
  const joined = new Date(joinedAt);
  if (Number.isNaN(joined.getTime())) return null;
  const days = Math.floor((Date.now() - joined.getTime()) / 86_400_000);
  return days >= 0 ? days : null;
}

function daysInPackLabel(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

// Same pill + hover/tap tooltip as PACK's BestLifeBadge (PackDogDetail.tsx) —
// days as the headline pill, exact years/months/days/human-years on hover.
function DogAgePill({ age }: { age: DogAge }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex flex-col items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('pack.dog.ariaShowAgeDetail')}
        style={{
          padding: '5px 14px',
          borderRadius: 999,
          background: 'linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%)',
          color: '#3d1f00',
          fontFamily: "'Cinzel', serif",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.02em',
          cursor: 'pointer',
          boxShadow: '0 6px 16px -6px rgba(201, 154, 63, 0.6)',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
          border: 'none',
        }}
      >
        {age.totalDays.toLocaleString('en-US')} days
      </button>
      {open && (
        <div
          className="absolute"
          style={{
            top: 'calc(100% + 9px)',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            padding: '9px 15px',
            borderRadius: 10,
            background: '#1a1a1a',
            color: '#FAF4EC',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12.5,
            fontWeight: 500,
            boxShadow: '0 10px 28px rgba(10,10,10,0.28)',
            zIndex: 5,
          }}
        >
          {t('pack.dog.ageDetail', {
            years: String(age.years),
            months: String(age.months),
            days: String(age.days),
            humanYears: String(age.humanYears),
          })}
        </div>
      )}
    </div>
  );
}

export default function DogShare() {
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
    fetch(`${EDGE_BASE}/get-grid-dogs`)
      .then((r) => (r.ok ? r.json() : []))
      .then((dogs: GridDog[]) => {
        if (!alive) return;
        const found = dogs.find((d) => d.pack_number === packNum);
        if (found) {
          setDog(found);
          setStatus('found');
          // Visiting a dog's public page is a structural referral, even
          // without an explicit ?ref= — first-touch never overwrites an
          // earlier explicit ref, so precedence is preserved automatically.
          captureDogPageRef(packNum);
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
  const seoTitle = status === 'found' ? `${dogName} — DOGYPT` : 'DOGYPT';
  const seoDescription =
    status === 'found'
      ? `${dogName} is one of the first 1,000,000 dogs of DOGYPT. Find your dog's place in the global pack.`
      : "Join the first 1,000,000 dogs of DOGYPT. Find your dog's place in the global pack.";

  const flagIso = dog ? countryISO2(dog.country) : null;
  const age = dog ? computeDogAge(dog.birth_date, dog.life_status) : null;
  const daysInPack = dog ? computeDaysInPack(dog.joined_at) : null;
  const alphaName = dog?.owner_first_name?.trim() || null;
  const ownerMessage = dog?.owner_message?.trim() || '';

  return (
    <div className="dark-bg dogshare-page min-h-screen flex flex-col md:h-[100dvh] md:overflow-hidden">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={status === 'found' && packNum !== null ? dogPagePath(dogName, packNum) : window.location.pathname}
        type="article"
        ogImage={ogImage}
      />
      <style>{`
        .dogshare-page .btn-gold {
          padding: 14px 32px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250,244,236,0.30);
          border-radius: 8px; color: #000;
          font-family: 'Cinzel', serif; font-size: 0.85rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; text-decoration: none; display: block; text-align: center;
          transition: transform 0.2s, box-shadow 0.22s;
          box-shadow: 0 0 40px rgba(230,158,26,0.38), inset 0 1px 0 rgba(255,255,255,0.28);
        }
        .dogshare-page .btn-gold:hover {
          transform: scale(1.04);
          box-shadow: 0 0 56px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.28);
        }
        .dogshare-photo {
          display: block; object-fit: cover; aspect-ratio: 1 / 1;
          border-radius: 8px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,154,63,0.45), 0 0 60px rgba(201,154,63,0.14);
        }
        .dogshare-info-card {
          background-color: #FAF4EC;
          color: #1a1a1a;
          border-radius: 8px;
          border: 1px solid rgba(201,154,63,0.45);
          box-shadow: 0 30px 80px rgba(0,0,0,0.45);
        }
        .dogshare-hairline {
          height: 1px;
          width: 100%;
          background: rgba(201,154,63,0.35);
        }
        .dogshare-label {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #C99A3F;
        }
        .dogshare-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.85rem;
          color: #1a1a1a;
          font-weight: 600;
        }
        .dogshare-back-link {
          color: rgba(255,255,255,0.5);
        }
        .dogshare-back-link:hover {
          color: #C99A3F;
        }
      `}</style>

      <PageTopBar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-4 md:min-h-0 md:overflow-hidden">
        {status === 'notfound' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <h1
              className="text-2xl md:text-4xl uppercase text-white"
              style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.02em' }}
            >
              This dog isn't in the pack yet.
            </h1>
            <p className="max-w-md text-white/60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Every dog gets a heroglyph — a unique symbol among the first 1,000,000. Yours is waiting.
            </p>
            <a href="/heroglyph" className="btn-gold">
              Become Dogyptian
            </a>
          </div>
        )}

        {status === 'found' && dog && (
          <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10">
            {/* Left column — photo with CTA glued under it. Both columns share the
                exact same vertical composition (square + gap-4 + h-14 slot), so the
                two squares stay top-aligned without any h-full/flex-1 juggling. */}
            <div className="flex flex-col items-center gap-4 w-full md:w-auto">
              {ogImage && (
                <img
                  src={ogImage}
                  alt={`${dogName} — DOGYPT share card`}
                  className="dogshare-photo w-full max-w-[390px] md:w-[min(390px,calc(100dvh_-_280px))] md:max-w-none"
                />
              )}
              <div className="h-14 flex items-center w-full">
                <a href="/heroglyph" className="btn-gold w-full text-center">
                  Join Us
                </a>
              </div>
            </div>

            {/* Right column — papyrus info block + back link (same composition) */}
            <div className="flex flex-col items-center gap-4 w-full md:w-auto">
              <div className="dogshare-info-card w-full max-w-[390px] md:w-[min(390px,calc(100dvh_-_280px))] md:max-w-none md:aspect-square flex flex-col p-6 md:p-5 gap-2.5 md:gap-2 md:overflow-y-auto">
                  {/* Rank pill + name + living-my-best-life pill */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    {dog.pack_number !== null && (
                      <span
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#1a1a1a',
                          background: 'linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)',
                          border: '1px solid rgba(201,154,63,0.55)',
                          borderRadius: 999,
                          padding: '3px 15px',
                        }}
                      >
                        #{dog.pack_number}
                      </span>
                    )}
                    <h1
                      style={{
                        fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
                        fontWeight: 700,
                        fontSize: 'clamp(1.4rem, 4vw, 1.85rem)',
                        color: '#1a1a1a',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {dogName}
                    </h1>
                    {age ? (
                      <div className="flex flex-col items-center gap-1.5 mt-1">
                        <span
                          style={{
                            fontFamily: "'Cinzel', serif",
                            fontWeight: 700,
                            color: '#C99A3F',
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            fontSize: '0.68rem',
                          }}
                        >
                          Living My Best Life
                        </span>
                        <DogAgePill age={age} />
                      </div>
                    ) : (
                      dog.pack_number !== null && (
                        <p
                          className="mt-1"
                          style={{
                            fontFamily: "'Cinzel', serif",
                            fontWeight: 700,
                            color: '#C99A3F',
                            textTransform: 'uppercase',
                            letterSpacing: '0.14em',
                            fontSize: '0.72rem',
                          }}
                        >
                          Founding Dogyptian
                        </p>
                      )
                    )}
                  </div>

                  <div className="dogshare-hairline flex-shrink-0" />

                  {/* 3-col info row — flag+ISO3 (no label) / In the Pack / Pawtner */}
                  {(flagIso || daysInPack !== null || alphaName) && (
                    <div className="flex items-start justify-center gap-5 flex-wrap flex-shrink-0">
                      {flagIso && (
                        <div className="flex flex-col items-center gap-1 justify-end" style={{ minHeight: 40 }}>
                          <img
                            src={flagUrl(flagIso, 40)}
                            alt={dog.country || ''}
                            title={dog.country || ''}
                            style={{ width: 22, height: 'auto', borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}
                          />
                          <span className="dogshare-value">{iso2ToISO3(flagIso)}</span>
                        </div>
                      )}
                      {daysInPack !== null && (
                        <div className="flex flex-col items-center gap-1" style={{ minHeight: 40, justifyContent: 'flex-end' }}>
                          <span className="dogshare-label">In the Pack</span>
                          <span className="dogshare-value">{daysInPackLabel(daysInPack)}</span>
                        </div>
                      )}
                      {alphaName && (
                        <div className="flex flex-col items-center gap-1" style={{ minHeight: 40, justifyContent: 'flex-end' }}>
                          <span className="dogshare-label">Pawtner</span>
                          <span className="dogshare-value">{alphaName.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="dogshare-hairline flex-shrink-0" />

                  {ownerMessage && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <p
                        className="italic md:line-clamp-6"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: 'rgba(26,26,26,0.7)' }}
                      >
                        &ldquo;{ownerMessage}&rdquo;
                      </p>
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: 'rgba(26,26,26,0.5)', marginTop: 2 }}>
                        — {dogName}'s pawtner
                      </p>
                    </div>
                )}
              </div>
              <div className="h-14 flex items-center">
                <Link
                  to="/"
                  className="dogshare-back-link text-sm transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Back to WALL →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
