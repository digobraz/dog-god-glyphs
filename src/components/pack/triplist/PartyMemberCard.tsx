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
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
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
`;

/** rola → eyebrow nad menom; `requested` sa vykresľuje len organizátorovi (stráži SQL) */
const ROLE_LABEL: Record<PartyMember['role'], string> = {
  organizer: 'Trip host',
  joiner: 'Going',
  requested: 'Wants to join',
};

export function PartyMemberCard({ member, roleLabel }: { member: PartyMember; roleLabel?: string }) {
  const dog = member.dogName?.trim();
  const owner = member.ownerFirst?.trim();
  const initial = (dog || owner || '?').charAt(0).toUpperCase();

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
    </div>
  );
}
