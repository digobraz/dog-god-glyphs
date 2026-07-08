import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/PageTopBar';
import { Seo } from '@/components/Seo';
import { EDGE_BASE } from '@/lib/env';
import { track } from '@/lib/analytics';

/**
 * Public share landing — `/d/:pack`.
 *
 * The whole point of this page is the OG image: when a member shares their
 * share-card link (WhatNextPopup "Share" action), the URL they post is
 * `/d/<pack_number>`, NOT the raw Cloudinary image — so link unfurls
 * (Facebook/Twitter/Instagram/WhatsApp) show a branded landing with a CTA
 * instead of a bare image. Data comes from get-grid-dogs (same public feed
 * as the WALL), matched by pack_number.
 */

interface GridDog {
  pack_number: number | null;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  heroglyph_png_url: string | null;
  share_card_url?: string | null;
  country: string | null;
  owner_message: string | null;
}

const DEFAULT_OG = 'https://storage.googleapis.com/gpt-engineer-file-uploads/r1xjLvSkh4R0qFvw293HZyntcAI2/social-images/social-1778165377850-LOGO_DOGYPT_FINAL_web.webp';

type Status = 'loading' | 'found' | 'notfound';

export default function DogShare() {
  const { pack } = useParams<{ pack: string }>();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [dog, setDog] = useState<GridDog | null>(null);

  useEffect(() => {
    let alive = true;
    const packNum = Number(pack);
    if (!pack || Number.isNaN(packNum)) {
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
  }, [pack]);

  // Fire once on mount — a link click/unfurl is the event we care about,
  // independent of whether the dog record resolves.
  useEffect(() => {
    track('share_landing_view', {
      pack: Number(pack) || null,
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

  return (
    <div className="dark-bg min-h-screen flex flex-col">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path={`/d/${pack ?? ''}`}
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
        .dogshare-card-img {
          display: block; width: 100%; max-width: 460px; height: auto;
          border-radius: 8px; margin: 0 auto;
          box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,154,63,0.45), 0 0 60px rgba(201,154,63,0.14);
        }
      `}</style>

      <PageTopBar />

      <main className="dogshare-page flex-1 flex flex-col items-center justify-center px-4 py-10 gap-6 text-center">
        {status === 'notfound' && (
          <>
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
          </>
        )}

        {status === 'found' && dog && (
          <>
            {ogImage && <img src={ogImage} alt={`${dogName} — DOGYPT share card`} className="dogshare-card-img" />}
            <h1
              className="text-2xl md:text-4xl uppercase text-[#C99A3F] mt-2"
              style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.02em' }}
            >
              {dogName}
            </h1>
            <p className="max-w-md text-white/60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              One of the first 1,000,000 dogs of DOGYPT. Find your dog's place in the global pack.
            </p>
            <a href="/heroglyph" className="btn-gold">
              Become Dogyptian
            </a>
            <Link
              to="/"
              className="text-sm text-white/50 hover:text-[#C99A3F] transition-colors underline underline-offset-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              See the whole pack →
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
