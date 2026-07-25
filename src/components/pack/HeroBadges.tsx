// ── HERO BADGES — deviatka hrdinských odznakov (Matej 2026-07-24 zadanie plany/zadanie-hero-badges-2026-07-24.md,
// upresnenie 2026-07-24 = REVEAL-moment, upresnenie #2 = zdieľaná card popup pre reveal aj klik).
// Globálny achievement pásmo (celkový počet prejdených tripov, nezávislé od krajiny) → žije v
// BLOKU 1 (identita) TripStatsPanelu, hneď pod WORLD staty. Dáta = statické HERO_BADGES
// (heroBadges.ts, needituj), earned = derivované z walkedCount (žiadny perzistovaný unlock flag —
// rovnaká logika ako NP medaily v TripStatsPanel).
//
// REVEAL-moment (Matej citát: „ak človek dosiahne daný počet tripov - otvorí sa čierna obrazovka
// s popupom kde bude krátka gratulácia odznak a text story o psovi, klikne vedľa zmizne to a
// odznak sa zobrazí už farebný v riadku"). Diff sa počíta cez localStorage kľúč
// `pack_hero_revealed` (string[] id-čiek už odhalených odznakov):
//  - kľúč NEEXISTUJE (prvé načítanie appky vôbec) → baseline-silent: zapíš aktuálne earned id-čka,
//    ŽIADNY overlay (nechceme retro-blast gratulácií za odznaky odomknuté pred týmto featurom).
//  - kľúč existuje → nové earned id-čka oproti uloženému stavu = fronta popupov (jeden po druhom,
//    poradie = HERO_BADGES tiers).
//
// KLIK na odznak v riadku (Matej upresnenie #2: „card popup ako reveal, NIE inline dropdown") →
// otvorí ten istý card layout ako REVEAL, len s iným kickerom (earned = "Hero badge", locked =
// "N more trips to unlock") a grayscale odznakom keď locked. Zdieľaný renderer = HeroRevealCard.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HERO_BADGES, type HeroBadge } from '@/components/pack/heroBadgesData';

const REVEALED_KEY = 'pack_hero_revealed';

function loadRevealed(): string[] | null {
  try {
    const raw = localStorage.getItem(REVEALED_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return null;
  }
}

function saveRevealed(ids: string[]): void {
  try {
    localStorage.setItem(REVEALED_KEY, JSON.stringify(ids));
  } catch {
    // localStorage nedostupné (privátne okno a pod.) — reveal proste nebude perzistentný, nič nezlomí.
  }
}

// Zdieľaný card popup — používa ho REVEAL fronta (nový míľnik) aj manuálny klik na odznak v riadku.
// Portál do document.body: rodičovský .pk-glass má backdrop-filter → containing block by ukotvil
// position:fixed o panel, nie o viewport. Backdrop klik = dismiss; klik NA card = nič.
function HeroRevealCard({ badge, kicker, locked, onClose }: {
  badge: HeroBadge;
  kicker: string;
  locked: boolean;
  onClose: () => void;
}) {
  return createPortal(
    <div
      className="comm-reveal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="comm-reveal-card">
        <button type="button" className="comm-reveal-x" aria-label="Close" onClick={onClose}>×</button>
        <div className="comm-reveal-left">
          <img className={`comm-reveal-badge${locked ? ' comm-reveal-badge--off' : ''}`} src={badge.img} alt={badge.name} />
          <div className="comm-reveal-trips">{badge.trips} trips</div>
        </div>
        <div className="comm-reveal-right">
          <div className={`comm-reveal-kicker${locked ? ' comm-reveal-kicker--locked' : ''}`}>{kicker}</div>
          <div className="comm-reveal-name">{badge.name}</div>
          <p className="comm-reveal-story">{badge.story}</p>
          {badge.source && (
            <a className="comm-reveal-source" href={badge.source.url} target="_blank" rel="noopener noreferrer">
              Viac o príbehu → <span className="comm-reveal-source-label">{badge.source.label}</span>
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function HeroBadges({ walkedCount }: { walkedCount: number }) {
  const [clicked, setClicked] = useState<HeroBadge | null>(null);
  const [queue, setQueue] = useState<HeroBadge[]>([]);

  // localStorage diff — nájde nové míľniky oproti tomu, čo bolo naposledy odhalené. Hooky MUSIA
  // byť nad akýmkoľvek podmieneným returnom (tento komponent žiaden nemá, ale drží sa poriadok).
  useEffect(() => {
    const earnedIds = HERO_BADGES.filter((b) => walkedCount >= b.trips).map((b) => b.id);
    const stored = loadRevealed();
    if (stored === null) {
      // prvé načítanie appky vôbec — baseline-silent, žiadna retro-gratulácia.
      saveRevealed(earnedIds);
      return;
    }
    const toReveal = HERO_BADGES.filter((b) => earnedIds.includes(b.id) && !stored.includes(b.id));
    if (toReveal.length > 0) setQueue(toReveal);
  }, [walkedCount]);

  const earnedCount = HERO_BADGES.filter((b) => walkedCount >= b.trips).length;
  const revealing = queue[0];

  const dismissReveal = () => {
    setQueue((cur) => {
      if (cur.length === 0) return cur;
      const [first, ...rest] = cur;
      const stored = loadRevealed() ?? [];
      if (!stored.includes(first.id)) saveRevealed([...stored, first.id]);
      return rest;
    });
  };

  return (
    <>
      <div className="comm-dash-section-title" style={{ marginTop: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Hero badges</span>
        <span>{earnedCount}/9</span>
      </div>
      <div className="comm-heroes">
        {HERO_BADGES.map((b) => {
          const earned = walkedCount >= b.trips;
          return (
            <button
              key={b.id}
              type="button"
              className={`comm-hero ${earned ? 'comm-hero--on' : 'comm-hero--off'}`}
              onClick={() => setClicked(b)}
            >
              <img src={b.img} alt={b.name} />
              <span className="comm-hero-trips">{b.trips}</span>
            </button>
          );
        })}
      </div>

      {revealing ? (
        <HeroRevealCard badge={revealing} kicker="Milestone reached" locked={false} onClose={dismissReveal} />
      ) : clicked ? (() => {
        const earned = walkedCount >= clicked.trips;
        const kicker = earned ? 'Hero badge' : `${clicked.trips - walkedCount} more trips to unlock`;
        return (
          <HeroRevealCard badge={clicked} kicker={kicker} locked={!earned} onClose={() => setClicked(null)} />
        );
      })() : null}
    </>
  );
}
