import { useState } from 'react';
import { flagEmojiFromISO2, flagUrl } from '@/lib/countryGeo';

// Vlajkový krúžok — rovnaký ako na GRIDE. Vytiahnuté z `PackDogDetail.tsx` (2026-08-06),
// aby ho vedel použiť aj MY PACK hub: z detailu psa sa NEIMPORTUJE nič (má ~4000 riadkov
// a je lazy-loaded — import by ho vtiahol do cudzieho chunku). Rovnaký dôvod, prečo už
// skôr vznikli `lib/dogAge.ts` a `lib/dogHealth.ts`.
//
// Emoji fallback je nutný: flagcdn.com je cudzí CDN a nie je dostupný všade (člen
// nahlásil prázdne miesto namiesto vlajky) — `onError` prepne na natívne emoji.
export function FlagCircle({
  iso2,
  label,
  size = 28,
}: {
  iso2: string;
  label: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flex: '0 0 auto',
    border: '1.5px solid rgba(201, 154, 63, 0.55)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    background: '#1a1a1a',
  };

  if (failed) {
    return (
      <span
        title={label}
        aria-label={label}
        role="img"
        style={{
          ...base,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(size * 0.57),
          lineHeight: 1,
          overflow: 'hidden',
        }}
      >
        {flagEmojiFromISO2(iso2)}
      </span>
    );
  }

  return (
    <img
      src={flagUrl(iso2, 160)}
      alt={label}
      title={label}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ ...base, objectFit: 'cover' }}
    />
  );
}
