import { useEffect, useRef, useState } from 'react';
import { Bell, UserPlus } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

interface PackNotificationsProps {
  last24h: number;
  last30d: number;
  total: number;
}

export function PackNotifications({ last24h, last30d, total }: PackNotificationsProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // click-away close
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const items = [
    { iconNode: <UserPlus className="h-3.5 w-3.5 shrink-0" style={{ color: T.accentGold, marginTop: 2 }} />, text: last24h > 0 ? `${last24h} new Dogyptian${last24h === 1 ? '' : 's'} today` : 'No new members today — yet' },
    { iconNode: <UserPlus className="h-3.5 w-3.5 shrink-0" style={{ color: T.accentGold, marginTop: 2 }} />, text: `${last30d} joined in the last 30 days` },
    { iconNode: <BrandIcon name="globe" size={14} tint="gold" className="shrink-0" style={{ marginTop: 2 }} />, text: `${total.toLocaleString('en-US')} Dogyptians worldwide` },
  ];

  return (
    <div ref={wrapRef} className="absolute flex items-center gap-1.5" style={{ top: 16, right: 16, zIndex: 12 }}>
      {/* Messages — coming soon (disabled) */}
      <button
        type="button"
        disabled
        aria-label="Messages — coming soon"
        title="Messages — coming soon"
        className="relative inline-flex items-center justify-center"
        style={{
          width: 38,
          height: 38,
          borderRadius: 999,
          border: `1px solid ${T.hairline}`,
          background: 'transparent',
          color: T.inkDim,
          opacity: 0.5,
          cursor: 'default',
        }}
      >
        <BrandIcon name="chat" size={16} tint="gold" />
        <span
          style={{
            position: 'absolute',
            bottom: -5,
            right: -3,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 7,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: T.inkDim,
            background: T.card,
            padding: '1px 3px',
            borderRadius: 4,
            border: `1px solid ${T.hairline}`,
            lineHeight: 1,
          }}
        >
          soon
        </span>
      </button>

      {/* Notifications bell */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
        className="relative inline-flex items-center justify-center"
        style={{
          width: 38,
          height: 38,
          borderRadius: 999,
          border: `1px solid ${T.border}`,
          background: open ? 'rgba(31,26,14,0.05)' : 'transparent',
          color: T.ink,
          cursor: 'pointer',
        }}
      >
        <Bell className="h-4 w-4" />
        {last24h > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 999,
              background: T.accentGold,
              color: '#1F1A0E',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1.5px solid ${T.card}`,
              lineHeight: 1,
            }}
          >
            {last24h > 9 ? '9+' : last24h}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 46,
            right: 0,
            width: 244,
            background: T.card,
            border: `1px solid ${T.hairline}`,
            borderRadius: 14,
            boxShadow: '0 18px 44px -12px rgba(10,10,10,0.28)',
            padding: 12,
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9.5,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: T.inkDim,
              marginBottom: 10,
            }}
          >
            The Pack pulse
          </div>
          <ul className="flex flex-col gap-2.5">
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-2.5">
                {it.iconNode}
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12.5,
                    lineHeight: 1.4,
                    color: T.ink,
                  }}
                >
                  {it.text}
                </span>
              </li>
            ))}
          </ul>
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: `1px solid ${T.hairline}`,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              color: T.inkDim,
              textAlign: 'center',
            }}
          >
            Personal notifications coming soon
          </div>
        </div>
      )}
    </div>
  );
}
