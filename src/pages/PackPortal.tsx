import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME } from '@/components/pack/packTheme';
import iconPortalNav from '@/assets/icons/nav-portal.svg';
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

const T = PACK_THEME;

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

export default function PackPortal() {
  return (
    <PackLayout wide>
      <div className="flex flex-col gap-4">

        {/* ── Row 1: What we're building (left) + Portal (right) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">

          {/* Left: The vision — bledá tyrkysová */}
          <div
            style={{
              background: 'linear-gradient(160deg, #ECF6F3 0%, #F7FBF9 100%)',
              border: `1px solid rgba(26,163,154,0.30)`,
              borderRadius: 16,
              padding: '22px 20px',
              boxShadow: '0 8px 28px rgba(10,10,10,0.06)',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12,
            }}
          >
            <div style={{
              fontFamily: "'Cinzel', serif", fontWeight: 700,
              fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#1AA39A',
            }}>
              The vision
            </div>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14.5, lineHeight: 1.6, color: T.inkDim, margin: 0,
            }}>
              A sketch of what will live here — every place, service and gathering
              your dog needs: vets, parks, hotels, salons, shelters. Mapped and kept
              by the Pack.
            </p>
          </div>

          {/* Right: PORTAL */}
          <div
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              padding: '22px 20px',
              boxShadow: '0 8px 28px rgba(10,10,10,0.06)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
              <img
                src={iconPortalNav}
                alt=""
                aria-hidden
                style={{ width: 52, height: 52, flexShrink: 0, filter: 'brightness(0)', opacity: 0.55 }}
              />
              <div>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontWeight: 700,
                  fontSize: 26, letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: T.ink, lineHeight: 1,
                }}>
                  PORTAL
                </div>
                <div style={{
                  marginTop: 6,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14, color: T.inkDim, lineHeight: 1.4,
                }}>
                  Everything your dog needs — one place.
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: T.hairline, margin: '16px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontWeight: 700,
                fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: T.inkFaint, flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                My location
              </span>
              <div style={{
                flex: 1,
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(31,26,14,0.03)',
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: '9px 14px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, opacity: 0.35 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={T.ink} />
                </svg>
                <input
                  type="text"
                  placeholder="Enter your city…"
                  disabled
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 13.5, color: T.inkFaint, cursor: 'default',
                  }}
                />
              </div>
            </div>
          </div>


        </div>

        {/* ── Block 3: Categories ── */}
        <div
          className="pack-card-hover"
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: '20px',
            boxShadow: '0 8px 28px rgba(10,10,10,0.06)',
          }}
        >
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto',
            scrollbarWidth: 'none', paddingBottom: 2,
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
                    border: `1px solid ${active ? T.accentGold : T.border}`,
                    background: active ? 'rgba(201,154,63,0.10)' : 'rgba(31,26,14,0.03)',
                    color: active ? T.accentGold : T.inkFaint,
                    cursor: 'default',
                  }}
                >
                  {tab}
                </div>
              );
            })}
          </div>

          {/* Grid + centrálny coming soon badge */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              pointerEvents: 'none',
              opacity: 0.6,
            }}>
              {CATEGORIES.map(({ label, icon }) => (
                <PortalCard key={label} label={label} icon={icon} />
              ))}
            </div>

            {/* Centrálny badge */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontWeight: 700,
                fontSize: 16, letterSpacing: '0.32em', textTransform: 'uppercase',
                color: T.accentGold,
                background: 'rgba(255, 251, 242, 0.72)',
                border: '1px solid rgba(201, 154, 63, 0.40)',
                backdropFilter: 'blur(1px)',
                padding: '12px 26px',
                borderRadius: 999,
                boxShadow: '0 10px 30px -10px rgba(20, 8, 40, 0.35)',
                whiteSpace: 'nowrap',
              }}>
                Coming soon
              </div>
            </div>
          </div>
        </div>

      </div>
    </PackLayout>
  );
}

function PortalCard({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      background: 'rgba(31,26,14,0.03)',
      padding: '16px 10px 12px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      minHeight: 82,
    }}>
      <img
        src={icon}
        alt=""
        aria-hidden
        style={{ width: 32, height: 32, opacity: 0.5, filter: 'brightness(0)' }}
      />
      <span style={{
        fontFamily: "'Cinzel', serif", fontWeight: 700,
        fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: T.inkDim, textAlign: 'center', lineHeight: 1.3,
      }}>{label}</span>
    </div>
  );
}
