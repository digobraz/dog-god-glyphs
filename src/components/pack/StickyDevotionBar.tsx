// ============================================================================
// StickyDevotionBar — pinned identity + devotion summary on the dog profile.
// Mobile AND desktop (same bar, Matej's call). Shows owner avatar, name,
// XP (devotion + level) and bones. When devotion rises (e.g. a prayer is
// credited) it bumps and floats the delta — the "+N ☥ live" moment.
//
// Also the carrier that makes the onboarding wizard's cross-page climax work:
// the counter travels with the user onto the dog page.
// ============================================================================
import { useEffect, useRef, useState } from 'react';
import { devotionLevel } from '@/lib/devotion';
import './StickyDevotionBar.css';

interface Props {
  ownerName: string;
  avatarUrl?: string | null;
  dogName: string;
  devotion: number;
  bones: number;
}

export function StickyDevotionBar({ ownerName, avatarUrl, dogName, devotion, bones }: Props) {
  const lv = devotionLevel(devotion);
  const initial = ownerName?.[0]?.toUpperCase() || 'D';

  // Animate when devotion increases.
  const prev = useRef(devotion);
  const [bump, setBump] = useState(false);
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    const diff = devotion - prev.current;
    if (diff > 0) {
      setDelta(diff);
      setBump(true);
      const t1 = setTimeout(() => setBump(false), 650);
      const t2 = setTimeout(() => setDelta(null), 1200);
      prev.current = devotion;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    prev.current = devotion;
  }, [devotion]);

  return (
    <div className="sdb">
      <div className="sdb-id">
        {avatarUrl ? (
          <img className="sdb-avatar" src={avatarUrl} alt={ownerName} />
        ) : (
          <div className="sdb-avatar sdb-avatar--fallback">{initial}</div>
        )}
        <div className="sdb-name">
          <strong>{ownerName || 'You'}</strong>
          <span>with {dogName}</span>
        </div>
      </div>

      <div className="sdb-stats">
        <div className="sdb-stat">
          <b className={bump ? 'bump' : ''}>{Math.round(devotion).toLocaleString('en-US')}</b>
          <span>☥ {lv.name}</span>
          {delta !== null && <i className="sdb-float">+{delta % 1 === 0 ? delta : delta.toFixed(1)} ☥</i>}
        </div>
        <div className="sdb-stat">
          <b>{bones}</b>
          <span>🦴 Bones</span>
        </div>
      </div>
    </div>
  );
}
