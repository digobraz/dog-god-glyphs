import { Helmet } from 'react-helmet-async';

const BASE = 'https://dogypt.com';
// Značková social-share karta (1200×630, plné pozadie) — fallback pre všetky
// link previews. Statický súbor v public/ → stabilná URL bez build-hashu.
const DEFAULT_OG = 'https://dogypt.com/og-image.jpg';

type SeoProps = {
  title: string;
  description: string;
  path: string;              // "/heroglyph" → canonical + og:url = BASE+path
  type?: string;             // 'website' (default) | 'product' | 'article'
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
};

export function Seo({ title, description, path, type = 'website', ogImage = DEFAULT_OG, jsonLd, noindex }: SeoProps) {
  const url = `${BASE}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
