// Oznamový popup pre OPEN TRIP (Matej 2026-07-23, flow A + rozšírenie kolo 2). Open trip = Event =
// jedna entita, dva vstupy (Triplist „Open trips" + neskôr Events) → OBA otvárajú tento komponent.
// ŠIRŠÍ, dvojzónový: ĽAVO = rail účastníkov (scroll, klik = prepnutie), PRAVO = profil vybraného člena
// (human + dog tagy v pills s emoji — štartovací set, doladí sa v profile). REQUEST TO JOIN = mock stav.
// Trasa/blog ostáva čistá — oznam v nej NEžije.
import { useState } from 'react';
import { PACK_THEME, GLASS_CSS } from '@/components/pack/packTheme';
import { flagUrl } from '@/lib/countryGeo';
import { ICON } from '@/components/pack/tripShared';
import type { MockMember } from '@/components/pack/packCommunity';
import { deriveMemberProfile, trailWCE, WCE_LABEL, type PublicTrip, type ProfilePill } from '@/components/pack/triplist/triplist';

const T = PACK_THEME;
const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const DAY_MS = 86400000;

function countdown(dateStr: string, nowMs: number): { label: string; soon: boolean } | null {
  const ms = new Date(dateStr + 'T00:00:00').getTime();
  if (Number.isNaN(ms)) return null;
  const d = Math.round((ms - nowMs) / DAY_MS);
  if (d < 0) return null;
  const label = d <= 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d} days left`;
  return { label, soon: d <= 3 };
}

const CSS = `
.tap-overlay{position:fixed;inset:0;z-index:1300;background:rgba(3,2,1,0.74);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:18px;}
.tap-modal{width:100%;max-width:660px;max-height:calc(100dvh - 36px);display:flex;flex-direction:column;background:${T.glass};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid ${T.onDarkBorder};border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,0.65),inset 0 1px 0 rgba(245,240,228,0.06);overflow:hidden;}
.tap-cover{position:relative;flex-shrink:0;height:150px;background-size:cover;background-position:center;background-color:#111;}
.tap-cover::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(8,6,3,0.9),rgba(8,6,3,0) 60%);}
.tap-flag{position:absolute;top:12px;left:12px;width:26px;height:26px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.45);background:#1a1a1a;z-index:2;}
.tap-x{position:absolute;top:12px;right:12px;z-index:3;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.5);border:1px solid ${T.onDarkBorder};color:#fff;font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.tap-x:hover{border-color:${GOLD};color:${GOLD};}
.tap-countdown{position:absolute;top:12px;right:54px;z-index:3;font-family:'Cinzel',serif;font-weight:700;font-size:9.5px;letter-spacing:.03em;text-transform:uppercase;padding:5px 11px;border-radius:999px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};box-shadow:0 2px 10px rgba(230,158,26,0.5);}
.tap-countdown.soon{background:linear-gradient(135deg,#FF7A45,#E5502A);color:#fff;}
.tap-cover-cap{position:absolute;left:18px;right:18px;bottom:13px;z-index:2;}
.tap-badge{display:inline-block;font-family:'Cinzel',serif;font-weight:700;font-size:8.5px;letter-spacing:.04em;text-transform:uppercase;padding:4px 10px;border-radius:999px;background:#2ED3C3;color:#032420;margin-bottom:8px;}
.tap-title{font-family:'Cinzel',serif;font-weight:700;font-size:21px;line-height:1.2;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,0.6);}
.tap-sub{font-size:11.5px;color:rgba(245,240,228,0.82);margin-top:4px;text-shadow:0 1px 6px rgba(0,0,0,0.6);}

/* dve zóny — rail účastníkov + profil */
.tap-zones{display:flex;min-height:0;flex:1;overflow:hidden;}
.tap-rail{flex:0 0 168px;border-right:1px solid ${T.onDarkHair};overflow-y:auto;padding:14px 12px;}
.tap-rail-head{font-family:'Cinzel',serif;font-weight:700;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:${GOLD};margin-bottom:11px;}
.tap-member{display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:8px 9px;border-radius:11px;border:1px solid transparent;background:transparent;cursor:pointer;transition:all .15s;margin-bottom:5px;}
.tap-member:hover{background:rgba(245,240,228,0.05);}
.tap-member.on{background:rgba(201,154,63,0.12);border-color:rgba(201,154,63,0.45);}
/* pár človek+pes (Matej 2026-07-23: „who coming musí tam byť aj jeho pes/psy, nie len on") */
.tap-avpair{position:relative;flex-shrink:0;width:40px;height:32px;}
.tap-mav{position:absolute;top:0;left:0;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;font-size:12px;color:${INK};}
.tap-dav{position:absolute;bottom:0;right:0;width:19px;height:19px;border-radius:50%;background:#2a2118;border:1.5px solid ${T.glass};display:flex;align-items:center;justify-content:center;}
.tap-dav img{width:11px;height:11px;filter:brightness(0) invert(1);opacity:.82;}
.tap-mtxt{min-width:0;display:flex;flex-direction:column;gap:2px;}
.tap-mname{font-family:'Cinzel',serif;font-weight:700;font-size:11.5px;color:${T.onDark};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.tap-mrole{font-size:9px;color:${T.onDarkDim};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.tap-pending{font-size:10px;color:${T.onDarkDim};font-style:italic;padding:6px 9px;}

.tap-main{flex:1;overflow-y:auto;padding:18px 20px;min-width:0;}
.tap-prof-head{display:flex;align-items:center;gap:12px;}
.tap-av{flex-shrink:0;width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;font-size:17px;color:${INK};}
.tap-owner-name{font-family:'Cinzel',serif;font-weight:700;font-size:15px;color:${T.onDark};}
.tap-owner-meta{font-size:10.5px;color:${T.onDarkDim};margin-top:2px;}
.tap-msg{margin-top:15px;font-size:12px;line-height:1.55;color:${T.onDarkDim};background:rgba(245,240,228,0.04);border:1px solid ${T.onDarkBorder};border-radius:12px;padding:12px 14px;}
.tap-grp{margin-top:16px;}
.tap-grp-title{font-family:'Cinzel',serif;font-weight:700;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:${GOLD};margin-bottom:9px;}
.tap-pills{display:flex;flex-wrap:wrap;gap:6px;}
.tap-pill{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;color:${T.onDark};background:rgba(245,240,228,0.06);border:1px solid ${T.onDarkBorder};border-radius:999px;padding:5px 10px;}
/* preklik na verejný profil — vedľa mena (parking; profil stránka = neskôr, iná session) */
.tap-profilelink{flex-shrink:0;margin-left:auto;align-self:flex-start;display:inline-flex;align-items:center;gap:5px;font-family:'Cinzel',serif;font-weight:700;font-size:9px;letter-spacing:.04em;text-transform:uppercase;padding:7px 11px;border-radius:999px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDarkDim};cursor:pointer;transition:all .15s;}
.tap-profilelink:hover{border-color:${GOLD};color:${GOLD};}
.tap-soonnote{margin-top:8px;font-size:10px;color:${T.onDarkDim};font-style:italic;}

.tap-foot{flex-shrink:0;border-top:1px solid ${T.onDarkHair};padding:14px 18px 16px;}
.tap-foot-row{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.tap-datepill{display:inline-flex;align-items:center;font-family:'Cinzel',serif;font-weight:700;font-size:10px;letter-spacing:.03em;padding:6px 11px;border-radius:9px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.05);color:${T.onDark};}
.tap-going{font-size:10.5px;color:${T.onDarkDim};margin-left:auto;}
.tap-join{width:100%;font-family:'Cinzel',serif;font-weight:700;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:12px;background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);color:#000;border:1px solid rgba(250,244,236,0.30);cursor:pointer;transition:filter .15s;}
.tap-join:hover{filter:brightness(1.05);}
.tap-join.sent{background:rgba(55,178,106,0.16);border-color:rgba(55,178,106,0.5);color:#5FD98C;cursor:default;}
.tap-note{font-size:10px;color:${T.onDarkDim};text-align:center;margin-top:8px;}
.tap-viewtrail{display:block;width:100%;margin-top:10px;text-align:center;font-family:'Cinzel',serif;font-weight:700;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;padding:11px;border-radius:12px;border:1px solid ${T.onDarkBorder};background:transparent;color:${T.onDarkDim};cursor:pointer;transition:all .15s;}
.tap-viewtrail:hover{border-color:${GOLD};color:${GOLD};}

/* MOBILE — zóny na seba, rail = horizontálny pás avatarov */
@media(max-width:560px){
  .tap-zones{flex-direction:column;overflow:visible;}
  .tap-rail{flex:none;border-right:0;border-bottom:1px solid ${T.onDarkHair};display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:12px;}
  .tap-rail-head{display:none;}
  .tap-member{flex:0 0 auto;flex-direction:column;width:66px;gap:5px;margin-bottom:0;text-align:center;padding:6px;}
  .tap-mname{font-size:9.5px;max-width:60px;}
  .tap-mrole{display:none;}
  .tap-main{overflow-y:visible;}
}
`;

function PillRow({ pills }: { pills: ProfilePill[] }) {
  return (
    <div className="tap-pills">
      {pills.map((p, i) => (
        <span key={i} className="tap-pill"><span>{p.emoji}</span>{p.label}</span>
      ))}
    </div>
  );
}

export function TripAnnouncePopup({ trip, nowMs, joined, onRequestJoin, onViewTrail, onClose }: {
  trip: PublicTrip;
  nowMs: number;
  joined: boolean;
  onRequestJoin: () => void;
  onViewTrail: () => void;
  onClose: () => void;
}) {
  const cd = countdown(trip.date, nowMs);
  const members: { m: MockMember; role: string }[] = [
    { m: trip.owner, role: 'Organiser' },
    ...trip.joiners.map((m) => ({ m, role: 'Going' })),
  ];
  const [focus, setFocus] = useState(0);
  const [soon, setSoon] = useState(false);
  const active = members[Math.min(focus, members.length - 1)];
  const prof = deriveMemberProfile(active.m);

  return (
    <div className="tap-overlay" onClick={onClose}>
      <style>{GLASS_CSS}</style>
      <style>{CSS}</style>
      <div className="tap-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tap-cover" style={trip.trail.photos[0] ? { backgroundImage: `url('${trip.trail.photos[0]}')` } : undefined}>
          <img className="tap-flag" src={flagUrl('sk')} alt="Slovakia" title="Slovakia" loading="lazy" draggable={false} />
          {cd && <span className={`tap-countdown${cd.soon ? ' soon' : ''}`}>{cd.label}</span>}
          <button type="button" className="tap-x" onClick={onClose} aria-label="Close">×</button>
          <div className="tap-cover-cap">
            <span className="tap-badge">Looking for pack</span>
            <div className="tap-title">{trip.trail.name}</div>
            <div className="tap-sub">{trip.trail.region} · {WCE_LABEL[trailWCE(trip.trail)]}</div>
          </div>
        </div>

        <div className="tap-zones">
          {/* ĽAVO — účastníci (klik = prepnutie profilu) */}
          <div className="tap-rail">
            <div className="tap-rail-head">Who's going · {members.length}</div>
            {members.map((mm, i) => (
              <button key={mm.m.id} type="button" className={`tap-member${i === focus ? ' on' : ''}`} onClick={() => { setFocus(i); setSoon(false); }}>
                <span className="tap-avpair">
                  <span className="tap-mav">{mm.m.name.charAt(0).toUpperCase()}</span>
                  <span className="tap-dav" title={mm.m.dog}><img src={ICON('paw')} alt="" /></span>
                </span>
                <span className="tap-mtxt">
                  <span className="tap-mname">{mm.m.name}</span>
                  <span className="tap-mrole">{mm.m.dog} · {mm.role}</span>
                </span>
              </button>
            ))}
            {joined && <div className="tap-pending">You · pending ✓</div>}
          </div>

          {/* PRAVO — profil vybraného člena */}
          <div className="tap-main">
            <div className="tap-prof-head">
              <span className="tap-avpair" style={{ width: 52, height: 44 }}>
                <span className="tap-av">{active.m.name.charAt(0).toUpperCase()}</span>
                <span className="tap-dav" title={active.m.dog} style={{ width: 24, height: 24 }}><img src={ICON('paw')} alt="" style={{ width: 14, height: 14 }} /></span>
              </span>
              <div>
                <div className="tap-owner-name">{active.m.name} &amp; {active.m.dog}</div>
                <div className="tap-owner-meta">{active.role === 'Organiser' ? 'Organiser of this trip' : 'Joining this trip'}</div>
              </div>
              {/* preklik na verejný profil — vedľa mena, parking (profil = neskôr, iná session) */}
              <button type="button" className="tap-profilelink" onClick={() => setSoon(true)}>Profile →</button>
            </div>
            {soon && <div className="tap-soonnote">Public profiles are coming soon.</div>}

            {active.role === 'Organiser' && <div className="tap-msg">{trip.message}</div>}

            <div className="tap-grp">
              <div className="tap-grp-title">Human</div>
              <PillRow pills={prof.human} />
            </div>
            <div className="tap-grp">
              <div className="tap-grp-title">Dog · {active.m.dog}</div>
              <PillRow pills={prof.dog} />
            </div>
          </div>
        </div>

        <div className="tap-foot">
          <div className="tap-foot-row">
            <span className="tap-datepill">{trip.date}</span>
            <span className="tap-going">
              {members.length} going{joined ? ' · you pending' : ''}
            </span>
          </div>
          <button type="button" className={`tap-join${joined ? ' sent' : ''}`} onClick={joined ? undefined : onRequestJoin} disabled={joined}>
            {joined ? '✓ Request sent' : 'Request to join'}
          </button>
          {joined && <div className="tap-note">{trip.owner.name} will confirm your spot.</div>}
          <button type="button" className="tap-viewtrail" onClick={onViewTrail}>View trail &amp; reviews →</button>
        </div>
      </div>
    </div>
  );
}
