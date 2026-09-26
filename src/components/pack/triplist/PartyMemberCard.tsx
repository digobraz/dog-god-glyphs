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
import { sizedUrl } from '@/services/cloudinaryService';
import { useState } from 'react';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { emitOpenThread } from '@/components/pack/messaging/openBridge';
import type { PartyMember } from './useTripParty';
import { useMemberProfile, memberDisplayName } from '@/components/pack/profile/memberProfile';
import { RightGate } from '@/components/pack/RightGate';

const T = PACK_THEME;
const GOLD = T.cardEdge;
const INK = T.ink;
const DOG_FONT = "'Cinzel Decorative', 'Cinzel', serif";

export const PARTY_CARD_CSS = `
.pmc{display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:14px;border:1px solid ${T.onDarkBorder};background:rgba(245,240,228,0.04);min-width:0;}
.pmc + .pmc{margin-top:8px;}
.pmc-av{position:relative;flex-shrink:0;width:44px;height:44px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:17px;color:${INK};border:1px solid rgba(201,154,63,0.5);}
.pmc-av img{width:100%;height:100%;object-fit:cover;display:block;}
/* #41 — klik na ikonku tvorcu/účastníka otvorí TripProfileCard (padding:0 reset, button je inak UA-štýlovaný) */
button.pmc-av{padding:0;margin:0;cursor:pointer;}
button.pmc-av:hover{filter:brightness(1.08);}
.pmc-txt{min-width:0;flex:1;}
.pmc-role{font-family:${FONT_UI};font-weight:500;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:${GOLD};margin-bottom:3px;}
.pmc-dog{font-family:${DOG_FONT};font-weight:700;font-size:14px;line-height:1.15;color:${T.onDark};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pmc-owner{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.03em;color:${T.onDarkDim};margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pmc-num{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.06em;color:${T.onDarkDim};}
.pmc-more{font-family:${FONT_UI};font-weight:500;font-size:10.5px;color:${T.onDarkDim};padding:6px 2px 0;}
.pmc-msg{flex-shrink:0;align-self:center;display:flex;align-items:center;justify-content:center;height:30px;padding:0 12px;border-radius:999px;background:rgba(201,154,63,0.14);border:1px solid ${PACK_THEME.border};color:${GOLD};font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;white-space:nowrap;}
.pmc-msg:hover{background:rgba(201,154,63,0.24);}
.pmc-msg:disabled{opacity:.45;cursor:default;}

/* ── BLEDÁ VETVA — KARTA NA PAPYRUSE (Matej 2026-09-15: „ten otvorený vylet od svorky je
   furt zle") ──────────────────────────────────────────────────────────────────────────
   Karta vznikla pre TMAVÝ dok mapy (.trp-dockpanel, rgba(18,13,7,0.94)) a TAM JE SPRÁVNE.
   V článku výletu a v triplist-e však stojí na papyrusovej doske (goldFrameCSS), takže
   T.onDark (biely inkoust s 86 % krytím) svietil bielym na krémovom — meno psa sa nedalo
   prečítať vôbec. To isté zistenie ako pri .mnts-back a .mnk-tile.on: prevrátený povrch
   treba prevrátiť aj v štítkoch.
   ⚠️ AVATAR SA NEPREFARBUJE — zlatý kruh je identita člena a na papyruse drží; mení sa len
   to, čo nesie TEXT a hranicu. Žiadne nové číslo: polomery, odsadenia ani písmo sa netýkajú.
   ⚠️ V CSS KOMENTÁRI NESMIE BYŤ SPÄTNÝ APOSTROF — ukončí template literál (check:css). */
.pmc--pale{border-color:${PACK_THEME.border};background:${PACK_THEME.tileBg};}
.pmc--pale .pmc-dog{color:${PACK_THEME.inkStrong};}
.pmc--pale .pmc-owner,.pmc--pale .pmc-num,.pmc--pale .pmc-more{color:${PACK_THEME.inkWarm};}
/* Rola ostáva zlatá (GOLD) — na papyruse je čitateľná a je to tá istá eyebrow, akú má
   nadpis sekcie nad kartou. */
`;

/**
 * rola → eyebrow nad menom; `requested` sa vykresľuje len organizátorovi (stráži SQL).
 *
 * ⚠️ NIE NATVRDO PO ANGLICKY (opravené 2026-09-15). Karta písala „GOING" a „with …" aj
 * v slovenskej appke — grep po slovenskom texte taký reťazec nenájde, lebo v `sk.ts`
 * nikdy nebol. Toto je kľúč, nie text.
 */
const ROLE_KEY: Record<PartyMember['role'], string> = {
  organizer: 'pack.trip.host',
  joiner: 'pack.party.role.joiner',
  requested: 'pack.party.role.requested',
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

/**
 * Tlačidlo „Message" nad členom partie — jediné miesto v appke, kde sa z partie
 * otvára REÁLNE vlákno (`start_dm`). Vydelené z karty, lebo ten istý človek sa dá
 * napísať aj z buddy listu v EVENTS, kde sa vykresľuje bohatšou `TripProfileCard`.
 * Bez `dm` kontextu sa nevykreslí nič — adresát bez výletu neexistuje.
 */
export function PartyDmButton({ member, dm, className = 'pmc-msg' }: {
  member: PartyMember;
  dm?: PartyDmContext;
  className?: string;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const owner = member.ownerFirst?.trim();

  // organizátora vieme adresovať vždy (máme jeho id), účastníka len cez číslo psa
  const canMessage = !!dm && !dm.isMe
    && (member.role === 'organizer' || member.packNumber != null);
  if (!canMessage) return null;

  const openDm = async () => {
    if (!dm || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      // dynamický import — packMessaging ťahá pri module-load celý katalóg trás;
      // statický import by ho vtiahol do triplistu aj mapy
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
    <RightGate right="social">
    <button
      type="button"
      className={className}
      onClick={openDm}
      disabled={busy}
      aria-label={`${t('pack.party.message')} ${owner ?? ''}`.trim()}
    >
      {busy ? '…' : t(failed ? 'pack.party.unavailable' : 'pack.party.message')}
    </button>
    </RightGate>
  );
}

export function PartyMemberCard({ member, roleLabel, dm, onOpenProfile, pale }: {
  member: PartyMember;
  roleLabel?: string;
  dm?: PartyDmContext;
  /** issue #41 — klik na ikonku otvorí TripProfileCard (majiteľ + pes). Bez neho ostáva
   *  avatar čisto zobrazovací, ako doteraz. */
  onOpenProfile?: () => void;
  /**
   * Karta stojí na PAPYRUSE, nie na tmavom doku (článok výletu, triplist). Rozhoduje
   * podklad POD prvkom, nie poloha prepínača šatu — to isté pravidlo, aké má lapisové CTA
   * v brand locku. Bez neho je meno psa biele na krémovom.
   */
  pale?: boolean;
}) {
  const t = useT();
  const dog = member.dogName?.trim();
  // MENO ČLOVEKA sa berie z profilu, nie z objednávky (Matej 2026-08-26: „meno ukazuje ako si
  // to človek nastaví v profile… štandardne to bude to čo zadal pri objednávke"). `get_trip_party`
  // o prezývke ani o mene z profilu nevie — vydáva len krstné meno z objednávky, preto sa profil
  // dotiahne podľa poradového čísla. Kým sa načíta (alebo keď číslo nie je), platí to z výletu,
  // takže karta nikdy nezostane bez mena. Rozhoduje tá istá funkcia ako na profile a mini-karte.
  const memberProfile = useMemberProfile(member.packNumber ?? undefined);
  const owner = memberDisplayName(memberProfile, member.ownerFirst) || undefined;
  const initial = (dog || owner || '?').charAt(0).toUpperCase();

  const avatar = member.dogPhoto
    ? <img src={sizedUrl(member.dogPhoto, 200)} alt={dog ?? 'Dog'} loading="lazy" draggable={false} />
    : initial;

  return (
    <div className={pale ? 'pmc pmc--pale' : 'pmc'}>
      {onOpenProfile ? (
        <button
          type="button"
          className="pmc-av"
          onClick={onOpenProfile}
          aria-label={`View ${dog ?? owner ?? 'this Dogyptian'}'s profile`}
        >
          {avatar}
        </button>
      ) : (
        <span className="pmc-av">{avatar}</span>
      )}
      <span className="pmc-txt">
        <span className="pmc-role" style={{ display: 'block' }}>{roleLabel ?? t(ROLE_KEY[member.role])}</span>
        <span className="pmc-dog" style={{ display: 'block' }}>{dog ?? t('pack.party.someDog')}</span>
        {/* ⚠️ SK vetva nemá predložku — „s {owner}" by pýtalo inštrumentál (s Matejom), ale
            meno prichádza z profilu v 1. páde a skloňovať sa nedá. EN si „with" nesie v kľúči. */}
        <span className="pmc-owner" style={{ display: 'block' }}>
          {t('pack.party.with', { owner: owner ?? t('pack.party.someone') })}
          {member.packNumber ? <span className="pmc-num"> · #{member.packNumber}</span> : null}
        </span>
      </span>
      <PartyDmButton member={member} dm={dm} />
    </div>
  );
}
