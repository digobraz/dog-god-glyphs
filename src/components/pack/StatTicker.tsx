import { useEffect, useState } from 'react';
import { PACK_THEME } from './packTheme';
import { TrendingUp, Activity, Globe } from 'lucide-react';

const T = PACK_THEME;

interface Stats {
  total: number;
  last24h: number;
  last30d: number;
  topCountry?: string;
}

const EDGE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/get-pack-stats';

export function StatTicker({ stats }: { stats?: Stats | null }) {
  const [local, setLocal] = useState<Stats | null>(stats ?? null);

  useEffect(() => {
    if (stats) {
      setLocal(stats);
      return;
    }
    let cancelled = false;
    fetch(EDGE)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const top = (d.topCountries?.[0]?.country as string | undefined) ?? undefined;
        setLocal({
          total: d.total ?? 0,
          last24h: d.last24h ?? 0,
          last30d: d.last30d ?? 0,
          topCountry: top,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [stats]);

  const show = local ?? { total: 0, last24h: 0, last30d: 0 };

  const pills = [
    {
      icon: <Activity className="h-3 w-3" />,
      label: 'The Pack',
      value: show.total.toLocaleString('en-US'),
      tone: 'neutral' as const,
    },
    {
      icon: <TrendingUp className="h-3 w-3" />,
      label: 'Last 24h',
      value: `+${show.last24h.toLocaleString('en-US')}`,
      tone: 'up' as const,
    },
    {
      icon: <TrendingUp className="h-3 w-3" />,
      label: '30 days',
      value: `+${show.last30d.toLocaleString('en-US')}`,
      tone: show.last30d > 0 ? ('up' as const) : ('down' as const),
    },
    {
      icon: <Globe className="h-3 w-3" />,
      label: 'Top region',
      value: show.topCountry || '—',
      tone: 'neutral' as const,
    },
  ];

  // Duplicate twice for seamless infinite scroll
  const stream = [...pills, ...pills, ...pills];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 999,
        padding: '10px 0',
        boxShadow: '0 6px 18px -10px rgba(31, 26, 14, 0.16)',
      }}
    >
      {/* Edge gradients for fade-out effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-12 z-10"
        style={{
          background: `linear-gradient(90deg, ${T.card} 0%, rgba(255,251,242,0) 100%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10"
        style={{
          background: `linear-gradient(270deg, ${T.card} 0%, rgba(255,251,242,0) 100%)`,
        }}
      />

      <div
        className="flex items-center gap-3 whitespace-nowrap"
        style={{
          animation: 'pack-ticker-scroll 32s linear infinite',
          width: 'max-content',
        }}
      >
        {stream.map((p, i) => (
          <Pill key={i} {...p} />
        ))}
      </div>

      <style>{`
        @keyframes pack-ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

function Pill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'up' | 'down' | 'neutral';
}) {
  const bg =
    tone === 'up' ? T.growGreenSoft : tone === 'down' ? T.alertRedSoft : 'transparent';
  const fg = tone === 'up' ? T.growGreen : tone === 'down' ? T.alertRed : T.ink;
  const border =
    tone === 'up'
      ? 'rgba(61, 122, 78, 0.22)'
      : tone === 'down'
      ? 'rgba(178, 86, 64, 0.22)'
      : T.hairline;

  return (
    <span
      className="inline-flex items-center gap-2"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        padding: '6px 14px',
        borderRadius: 999,
        color: fg,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 12,
        letterSpacing: '0.04em',
        flexShrink: 0,
      }}
    >
      {icon}
      <span style={{ fontWeight: 700 }}>{value}</span>
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 9,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: tone === 'neutral' ? T.inkDim : fg,
          opacity: 0.75,
        }}
      >
        {label}
      </span>
    </span>
  );
}
