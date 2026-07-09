import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/PageTopBar';
import { Seo } from '@/components/Seo';
import { EDGE_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';
import { dogPagePath, packFromSlug } from '@/lib/dogSlug';
import { captureDogPageRef } from '@/lib/refCapture';
import { countryISO2, flagUrl } from '@/lib/countryGeo';

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
 * Layout (2026-07-09): desktop = no-scroll 2-column (photo left, papyrus
 * info block right), sized purely via flexbox — the outer page is pinned to
 * 100dvh and the row fills whatever's left under PageTopBar, so the photo's
 * square size falls out of aspect-ratio + height:100%, not a hardcoded
 * "topbar is Npx" guess. Mobile stays a plain scrolling 2-block stack.
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
  joined_at?: string | null;
  life_status?: string | null;
}

const DEFAULT_OG = 'https://dogypt.com/og-image.jpg';

type Status = 'loading' | 'found' | 'notfound';

// currentYear − birth_year. Deceased dogs (memorial mode) skip the age line entirely.
function computeAgeYears(birthYear: number | null | undefined, lifeStatus: string | null | undefined): number | null {
  if (!birthYear || lifeStatus === 'deceased') return null;
  const years = new Date().getFullYear() - birthYear;
  return years > 0 ? years : null;
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
  const dogNameUpper = dogName.toUpperCase();
  const ogImage = dog?.share_card_url || dog?.cloudinary_main_url || DEFAULT_OG;
  const seoTitle = status === 'found' ? `${dogName} — DOGYPT` : 'DOGYPT';
  const seoDescription =
    status === 'found'
      ? `${dogName} is one of the first 1,000,000 dogs of DOGYPT. Find your dog's place in the global pack.`
      : "Join the first 1,000,000 dogs of DOGYPT. Find your dog's place in the global pack.";

  const flagIso = dog ? countryISO2(dog.country) : null;
  const ageYears = dog ? computeAgeYears(dog.birth_year, dog.life_status) : null;
  const daysInPack = dog ? computeDaysInPack(dog.joined_at) : null;
  const alphaName = dog?.owner_first_name?.trim() || null;
  const ownerMessage = dog?.owner_message?.trim() || '';

  const voiceQuote = alphaName
    ? `I, ${dogNameUpper}, and my pawtner ${alphaName} have joined the movement that will change the world for dogs. Hop on!`
    : `I, ${dogNameUpper}, have joined the movement that will change the world for dogs. Hop on!`;

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
          padding: 14px 36px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250,244,236,0.30);
          border-radius: 8px; color: #000;
          font-family: 'Cinzel', serif; font-size: 0.88rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap;
          cursor: pointer; text-decoration: none; display: inline-block;
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
        .dogshare-pack-link {
          color: #4a3a1f;
        }
        .dogshare-pack-link:hover {
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
          <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 md:h-full">
            {/* Photo column */}
            <div className="flex-shrink-0 flex items-center justify-center w-full md:w-auto md:h-full">
              {ogImage && (
                <img
                  src={ogImage}
                  alt={`${dogName} — DOGYPT share card`}
                  className="dogshare-photo w-full max-w-[460px] md:w-auto md:h-full md:max-h-[460px]"
                />
              )}
            </div>

            {/* Info column — papyrus block */}
            <div className="dogshare-info-card w-full max-w-[460px] md:max-w-[420px] md:h-full flex flex-col justify-center gap-3 md:gap-3.5 p-6 md:p-7 md:overflow-y-auto">
              <h1
                className="text-2xl md:text-3xl"
                style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: '0.01em' }}
              >
                {dogName}
              </h1>

              {dog.pack_number !== null && (
                <p
                  className="text-sm"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    color: '#C99A3F',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  Founding Dogyptian #{dog.pack_number}
                </p>
              )}

              {flagIso && (
                <img
                  src={flagUrl(flagIso, 40)}
                  alt={dog.country || ''}
                  title={dog.country || ''}
                  style={{ width: 26, height: 'auto', borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}
                />
              )}

              {(ageYears !== null || daysInPack !== null) && (
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, lineHeight: 1.6 }}>
                  {ageYears !== null && (
                    <div>
                      <span style={{ fontWeight: 700 }}>Age:</span> {ageYears} {ageYears === 1 ? 'year' : 'years'}
                    </div>
                  )}
                  {daysInPack !== null && (
                    <div>
                      <span style={{ fontWeight: 700 }}>In the pack:</span> {daysInPackLabel(daysInPack)}
                    </div>
                  )}
                </div>
              )}

              {alphaName && (
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>Alpha:</span> {alphaName.toUpperCase()}
                </p>
              )}

              <p
                className="italic"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, lineHeight: 1.5 }}
              >
                &ldquo;{voiceQuote}&rdquo;
              </p>

              {ownerMessage && (
                <div>
                  <p
                    className="italic"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: 'rgba(26,26,26,0.7)' }}
                  >
                    &ldquo;{ownerMessage}&rdquo;
                  </p>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: 'rgba(26,26,26,0.5)', marginTop: 2 }}>
                    — {dogName}'s alpha
                  </p>
                </div>
              )}

              <div className="flex flex-col items-start gap-3 mt-1">
                <a href="/heroglyph" className="btn-gold">
                  Become Dogyptian
                </a>
                <Link
                  to="/"
                  className="dogshare-pack-link text-sm underline underline-offset-4 transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  See the whole pack →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
