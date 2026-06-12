import { PackLayout } from '@/components/pack/PackLayout';
import iconVet from '@/assets/icons/portal-vet.svg';
import iconHotel from '@/assets/icons/portal-hotel.svg';
import iconGastro from '@/assets/icons/portal-gastro.svg';
import iconSalon from '@/assets/icons/portal-salon.svg';
import iconPetshop from '@/assets/icons/portal-petshop.svg';
import iconEshop from '@/assets/icons/portal-eshop.svg';
import iconShelter from '@/assets/icons/portal-shelter.svg';
import iconPark from '@/assets/icons/portal-park.svg';
import iconHike from '@/assets/icons/portal-hike.svg';
import iconTraining from '@/assets/icons/portal-training.svg';
import iconPetting from '@/assets/icons/portal-petting.svg';
import iconTaxi from '@/assets/icons/portal-taxi.svg';

const CATEGORIES = [
  { label: 'Vet Clinic',  icon: iconVet },
  { label: 'Hotels',      icon: iconHotel },
  { label: 'Gastro',      icon: iconGastro },
  { label: 'Salons',      icon: iconSalon },
  { label: 'Pet Shop',    icon: iconPetshop },
  { label: 'Pet E-shop',  icon: iconEshop },
  { label: 'Shelters',    icon: iconShelter },
  { label: 'Parks',       icon: iconPark },
  { label: 'Hikes',       icon: iconHike },
  { label: 'Training',    icon: iconTraining },
  { label: 'Petting',     icon: iconPetting },
  { label: 'Taxi',        icon: iconTaxi },
] as const;

const TABS = ['ALL', 'PLACES & SERVICES', 'EVENTS', 'MARKET'] as const;

const gold = '#C99A3F';
const ink = '#1F1A0E';

export default function PackPortal() {
  return (
    <PackLayout>
      {/* Hero */}
      <div style={{ textAlign: 'center', paddingBottom: 28 }}>
        <div style={{
          fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 42,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: gold, lineHeight: 1,
          textShadow: '0 2px 24px rgba(201,154,63,0.35)',
        }}>
          PORTAL
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginTop: 8,
          fontFamily: "'Cinzel', serif", fontSize: 10.5, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'rgba(245,240,228,0.55)',
        }}>
          <span style={{ color: gold, fontSize: 12 }}>◈</span>
          BRATISLAVA
          <span style={{ color: gold, fontSize: 12 }}>◈</span>
        </div>

        {/* Stars row */}
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{
              fontFamily: "'Cinzel', serif", fontSize: 14, color: gold, opacity: 0.5 + i * 0.1,
            }}>★</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto',
        scrollbarWidth: 'none', paddingBottom: 4,
      }}>
        {TABS.map((tab) => {
          const active = tab === 'ALL';
          return (
            <div
              key={tab}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: 999,
                fontFamily: "'Cinzel', serif", fontWeight: 700,
                fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase',
                border: `1px solid ${active ? gold : 'rgba(201,154,63,0.30)'}`,
                background: active ? `rgba(201, 154, 63, 0.15)` : 'rgba(255, 251, 242, 0.03)',
                color: active ? gold : 'rgba(245,240,228,0.40)',
                cursor: 'default',
              }}
            >
              {tab}
            </div>
          );
        })}
      </div>

      {/* 3-column grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        pointerEvents: 'none',
      }}>
        {CATEGORIES.map(({ label, icon }) => (
          <PortalCard key={label} label={label} icon={icon} />
        ))}
      </div>

      {/* Tagline */}
      <div style={{
        marginTop: 28, textAlign: 'center',
        fontFamily: "'Cinzel', serif", fontSize: 10,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'rgba(245,240,228,0.30)',
      }}>
        COMING FOR THE PACK
      </div>
    </PackLayout>
  );
}

function PortalCard({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Card */}
      <div style={{
        border: `1px solid ${gold}`,
        borderRadius: 8,
        background: 'rgba(255, 251, 242, 0.04)',
        padding: '18px 10px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        boxShadow: `0 0 0 0 transparent, inset 0 1px 0 rgba(201,154,63,0.15)`,
        minHeight: 90,
      }}>
        {/* Icon */}
        <img
          src={icon}
          alt=""
          aria-hidden
          style={{ width: 36, height: 36, opacity: 0.55, filter: 'brightness(0) invert(1)' }}
        />
        {/* Label */}
        <span style={{
          fontFamily: "'Cinzel', serif", fontWeight: 700,
          fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'rgba(245, 240, 228, 0.6)',
          textAlign: 'center', lineHeight: 1.3,
        }}>{label}</span>
      </div>

      {/* SOON badge */}
      <div style={{
        position: 'absolute', top: -7, right: -7,
        background: ink,
        border: `1px solid ${gold}`,
        borderRadius: 999,
        padding: '2px 7px',
        fontFamily: "'Cinzel', serif", fontWeight: 700,
        fontSize: 7, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: gold,
        pointerEvents: 'none',
      }}>
        SOON
      </div>
    </div>
  );
}
