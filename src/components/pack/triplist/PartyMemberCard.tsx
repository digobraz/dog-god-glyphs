// KOMPAKTNÁ KARTA ČLENA PARTIE (issue #41) — kto výlet vypísal / kto ide.
//
// PREČO NIE `profile/TripProfileCard.tsx`: tá jedáva `CentralProfile`, a ten žije
// (zatiaľ, viď packProfile.ts „SWAP: localStorage → supabase") len v localStorage
// vlastného prehliadača. O CUDZOM človeku appka fyzicky nemá odkiaľ vziať pilulky
// povahy ani D3 tiery — `get_trip_party()` vydáva presne štyri polia: krstné meno,
// meno psa, fotku psa a poradové číslo. Karta zobrazuje ich a nič viac; keď raz
// bude verejný profil v DB, rozšíri sa TÁTO karta, nie tamtá.
//
// Brand: meno psa = Cinzel Decorative (CLAUDE.md, „mená psov sú cinzel dekoratívne"),
// meno človeka = Cinzel, číslo/rola = Space Grotesk.
import { useState } from 'react';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { emitOpenThread } from '@/components/pack/messaging/openBridge';
import type { PartyMember } from './useTripParty';

const T = PACK_THEME;
const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const DOG_FONT = "'Cinzel Decorative', 'Cinzel', serif";

export const PARTY_CARD_CSS = `
.pmc{display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:14px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);min-width:0;}
.pmc + .pmc{margin-top:8px;}
.pmc-av{position:relative;flex-shrink:0;width:44px;height:44px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:17px;color:${INK};border:1px solid rgba(201,154,63,0.5);}
.pmc-av img{width:100%;height:100%;object-fit:cover;display:block;}
.pmc-txt{min-width:0;flex:1;}
.pmc-role{font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:${GOLD};margin-bottom:3px;}
.pmc-dog{font-family:${DOG_FONT};font-weight:700;font-size:14px;line-height:1.15;color:${T.onDark};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pmc-owner{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.03em;color:${T.onDarkDim};margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pmc-num{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.06em;color:${T.onDarkDim};}
.pmc-more{font-family:${FONT_UI};font-weight:500;font-size:10.5px;color:${T.onDarkDim};padding:6px 2px 0;}
.pmc-msg{flex-shrink:0;align-self:center;display:flex;align-items:center;justify-content:center;height:30px;padding:0 12px;border-radius:999px;background:rgba(201,154,63,0.14);border:1px solid rgba(201,154,63,0.42);color:${GOLD};font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;white-space:nowrap;}
.pmc-msg:hover{background:rgba(201,154,63,0.24);}
.pmc-msg:disabled{opacity:.45;cursor:default;}
`;

/** rola → eyebrow nad menom; `requested` sa vykresľuje len organizátorovi (stráži SQL) */
const ROLE_LABEL: Record<PartyMember['role'], string> = {
  organizer: 'Trip host',
  joiner: 'Going',
  requested: 'Wants to join',
};

/**
 * `dm` = kontext výletu, cez ktorý sa dá tomuto človeku napísať (issue #53).
 * Bez neho karta ostáva čisto zobrazovacia — presne ako doteraz.
 *
 * Adresa nie je `user_id` (ten appka o cudzom človeku nemá a mať nemá), ale
 * poradové číslo psa + výlet; server v `start_dm()` overí, že sme sa nad ním
 * naozaj stretli. Organizátor sa adresuje bez čísla — `pack_number` je nullable
 * a zakladajúci pes ho nemá vôbec.
 */
export interface PartyDmContext {
  tripSlug: string;
  organizerId: string;
  /** true pre kartu prihláseného člena — na seba sa písať nedá */
  isMe?: boolean;
}

export function PartyMemberCard({ member, roleLabel, dm }: {
  member: PartyMember;
  roleLabel?: string;
  dm?: PartyDmContext;
}) {
  const dog = member.dogName?.trim();
  const owner = member.ownerFirst?.trim();
  const initial = (dog || owner || '?').charAt(0).toUpperCase();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // organizátora vieme adresovať vždy (máme jeho id), účastníka len cez číslo psa
  const canMessage = !!dm && !dm.isMe
    && (member.role === 'organizer' || member.packNumber != null);

  const openDm = async () => {
    if (!dm || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      // dynamický import — packMessaging ťahá pri module-load MOCK_MEMBER_POOL
      // a celý katalóg trás; statický import by ich vtiahol do triplistu aj mapy
      const m = await import('@/components/pack/messaging/packMessaging');
      const convId = await m.startTripDM({
        tripSlug: dm.tripSlug,
        organizerId: dm.organizerId,
        packNumber: member.role === 'organizer' ? null : member.packNumber,
      });
      if (convId) emitOpenThread(convId);
      else setFailed(true);   // blok, odhlásenie alebo nemám s ním nič spoločné
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pmc">
      <span className="pmc-av">
        {member.dogPhoto
          ? <img src={member.dogPhoto} alt={dog ?? 'Dog'} loading="lazy" draggable={false} />
          : initial}
      </span>
      <span className="pmc-txt">
        <span className="pmc-role" style={{ display: 'block' }}>{roleLabel ?? ROLE_LABEL[member.role]}</span>
        <span className="pmc-dog" style={{ display: 'block' }}>{dog ?? 'A Dogyptian dog'}</span>
        <span className="pmc-owner" style={{ display: 'block' }}>
          with {owner ?? 'a Dogyptian'}
          {member.packNumber ? <span className="pmc-num"> · #{member.packNumber}</span> : null}
        </span>
      </span>
      {canMessage && (
        <button
          type="button"
          className="pmc-msg"
          onClick={openDm}
          disabled={busy}
          aria-label={`Message ${owner ?? 'this Dogyptian'}`}
        >
          {busy ? '…' : failed ? 'Unavailable' : 'Message'}
        </button>
      )}
    </div>
  );
}
