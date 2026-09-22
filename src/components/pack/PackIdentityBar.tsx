// ════════════════════════════════════════════════════════════════════════════
// HLAVIČKA IDENTITY — avatar s rangom · km a výlety · správy · zvonček (2026-09-22)
// ────────────────────────────────────────────────────────────────────────────
// Matej 22. 9.: *„hore na mobile ako aj na PC treba mať riadok s ikonkou mena ako
// máme v /map = horný header meno level, správy, notifikácie… ešte tam možno vieme
// niečo doplniť časom"*.
//
// PRENOS `renderIdentity()` z `PackMap.tsx` (lock `plany/locky/map-identita.md`):
//   · RANG NESIE AVATAR — prstenec postupu v leveli + číslo na jeho okraji,
//   · render je JEDEN pre obe šírky.
// ⚠️ ODCHÝLKA OD MAPY (Matej 22. 9.: „daj tam meno, nie pútnik"): namiesto slova
//    PÚTNIK nesie riadok MENO člena a pod ním jeden riadok „km · výlety" — na PC aj
//    na mobile rovnako. Rang ostáva tam, kde ho lock mapy dal: na avatare.
//   · klik vedie tam, kam na mape: `/pack/map/triplist?tab=stats`.
// Level sa ráta cez `profileLevelFor` — TÚ ISTÚ funkciu ako mapa a TripSpotlight,
// z tých istých zdrojov ako TripSpotlight. Vlastný výpočet by dal iné číslo.
//
// ⚠️ DNES HO NOSÍ LEN `/pack/ainubis`. `/map` má stále vlastný `renderIdentity()` —
//    NIE preto, že by sa nechcelo, ale preto, že nesie vlastnosti, ktoré tento bar
//    nemá a lock `map-identita.md` ich vyžaduje: slovo PÚTNIK (nie meno) na desktope,
//    klik NA ČÍSLO otvára panel pásiem (tento bar celý blok vedie len na triplist),
//    a papyrusový PC skin popri tmavom mobilnom — ten istý render, dva skiny cez CSS.
//    Geometria AVATARA (kruh + fotka + odznak) je od 22. 9. 2026 JEDNA — `AvatarRing`
//    — a oba povrchy z nej čerpajú; to bola tá časť, čo sa reálne rozišla 5. 8. 2026.
// ⚠️ Šat je AINUBISOV (tmavý displej). Papyrusovú polohu komponent zatiaľ nemá.
// ⚠️ Panel pásiem (klik na číslo levelu na mape) tu NIE JE — žije vnútri PackMap.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readLocalTrails, readWalkedIds, visibleLocalTrails, pluralKey } from './tripShared';
import { profileLevelFor, readVotes } from './packCommunity';
import { useMyNotePoints } from './mapnotes/useMyNotePoints';
import { tierVars } from '@/lib/packTiers';
import type { usePackIdentity } from './usePackIdentity';
import { PackTopRight } from './PackLayout';
import { PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI } from './packTheme';
import { AINUBIS } from './ainubisSkin';
import { useT } from '@/i18n/LanguageContext';
import { AvatarRing, AV_D, PHOTO } from './AvatarRing';

/** Krstné meno — PORADIE AKO blok JA v `Pack.tsx` (`displayName`): účet (full_name
 *  z /pack/profile) → meno z objednávky psa (`dogs.owner_name`, kartuša) → e-mail.
 *  ⚠️ 22. 9. náhľad na ostrých dátach ukázal „HEKTHORSK": prostredný krok chýbal
 *  a účet bez full_name spadol rovno na e-mail. */
function firstNameFrom(email: string, fullName?: string): string {
  if (fullName && fullName.trim()) return fullName.trim().split(' ')[0];
  if (!email) return 'Dogyptian';
  const base = (email.split('@')[0] || '').split('+')[0].replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
  if (!base) return 'Dogyptian';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const CSS = `
.pkid{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;min-width:0;}
.pkid-me{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;min-width:0;flex:0 1 auto;
  background:none;border:none;padding:0;cursor:pointer;text-align:left;color:${AINUBIS.ink};}
.pkid-av{position:relative;flex:0 0 auto;width:${AV_D}px;height:${AV_D}px;display:grid;place-items:center;}
.pkid-av svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;}
.pkid-photo{position:relative;z-index:1;width:${PHOTO}px;height:${PHOTO}px;border-radius:${PACK_R.pill}px;object-fit:cover;
  display:flex;align-items:center;justify-content:center;background:${AINUBIS.faceBg};color:${AINUBIS.ctaA};
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;line-height:1;}
/* Číslo NA OKRAJI avatara; lem = farba podkladu pod ním (tu AINUBISOV displej). */
.pkid-lvl{position:absolute;z-index:3;right:-2px;bottom:-2px;width:20px;height:20px;border-radius:${PACK_R.pill}px;
  display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;
  background:linear-gradient(135deg,var(--tier-a,#F5C73D),var(--tier-b,#E69E1A));color:var(--tier-ink,#1c160c);
  box-shadow:0 0 0 2px ${AINUBIS.bg};}
.pkid-txt{display:flex;flex-direction:column;gap:2px;min-width:0;}
.pkid-name{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;color:${AINUBIS.ink};}
.pkid-stats{display:flex;align-items:baseline;gap:${PACK_SPACE.xs}px;white-space:nowrap;line-height:1.05;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkFaint};}
.pkid-stats b{font-weight:600;color:${AINUBIS.inkDim};font-variant-numeric:tabular-nums;}
.pkid-mid{flex:1 1 auto;min-width:0;display:flex;justify-content:center;}
.pkid-right{flex:0 0 auto;display:flex;align-items:center;}
`;

/** `id` podáva stránka — druhé volanie `usePackIdentity` by načítalo session a psov znova. */
/** `stats` nahradí riadok „km · výlety" — povrch, ktorý nie je o výletoch, nesie vlastné
 *  počty (AINUBIS 22. 9.: „meno nebude mať počet tripov ani km, tu sa bude rátať počet
 *  svetov / okruhov / zvitkov / celkové %"). */
export function PackIdentityBar({ id, middle, stats }: {
  id: ReturnType<typeof usePackIdentity>; middle?: ReactNode; stats?: ReactNode;
}) {
  const t = useT();
  const navigate = useNavigate();
  const myNotePoints = useMyNotePoints();

  const email = id.session?.user?.email ?? '';
  const meta = (id.session?.user?.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = (meta.full_name || meta.name) as string | undefined;
  /* Meno z objednávky: `usePackIdentity` je zamknutý (byte-identical) a `owner_name`
     nečíta, preto jeden malý dotaz podľa ID psov, ktoré už máme. */
  const [cartouche, setCartouche] = useState('');
  const dogIds = (id.dogs ?? []).map((d) => d.id).join(',');
  useEffect(() => {
    if (!dogIds || fullName?.trim()) return;
    let alive = true;
    supabase.from('dogs').select('owner_name').in('id', dogIds.split(',')).then(({ data }) => {
      const n = (data ?? []).map((d) => (d.owner_name ?? '').trim()).find(Boolean) ?? '';
      if (alive) setCartouche(n);
    });
    return () => { alive = false; };
  }, [dogIds, fullName]);
  const name = fullName?.trim() ? firstNameFrom(email, fullName)
    : cartouche ? firstNameFrom('', cartouche)
      : firstNameFrom(email);

  const view = useMemo(() => {
    const all: HeroTrail[] = [...visibleLocalTrails(readLocalTrails()), ...HERO_JOURNEYS, ...HERO_TRAILS];
    const walked = readWalkedIds();
    /* ⚠️ Počet aj km z JEDNEJ množiny (mapa, UX audit 14. 9. 2026). */
    const walkedTrails = all.filter((tr) => walked.has(tr.id));
    const km = walkedTrails.reduce((s, tr) => s + (parseFloat(String(tr.km ?? '').replace(',', '.')) || 0), 0);
    const { level } = profileLevelFor({
      walkedTrails,
      localTrailIds: readLocalTrails().map((tr) => tr.id),
      votes: readVotes(),
      email,
      ownerName: firstNameFrom(email, fullName),
      notePoints: myNotePoints,
    });
    return { level, count: walkedTrails.length, km: Math.round(km) };
  }, [email, fullName, myNotePoints]);

  const lv = view.level;
  return (
    <div className="pkid">
      <style>{CSS}</style>
      <button type="button" className="pkid-me" onClick={() => navigate('/pack/map/triplist?tab=stats')}>
        <AvatarRing
          pct={lv.pct}
          avatarUrl={id.avatarUrl}
          avatarInitial={id.avatarInitial}
          wrapClassName="pkid-av"
          wrapStyle={tierVars(lv.level)}
          photoClassName="pkid-photo"
          badgeClassName="pkid-lvl"
          badgeAriaLabel={t('pack.map.levelAriaLabel', { level: lv.level })}
          badgeContent={lv.level}
        />
        <span className="pkid-txt">
          <span className="pkid-name">{name}</span>
          <span className="pkid-stats">
            {stats ?? (
              <><b>{view.km}</b>{t('pack.map.statKm')} · <b>{view.count}</b>{t('pack.map.statTrips' + pluralKey(view.count))}</>
            )}
          </span>
        </span>
      </button>
      <div className="pkid-mid">{middle}</div>
      <div className="pkid-right">
        <PackTopRight last24h={id.packToday} total={id.packTotal} layout="inline" />
      </div>
    </div>
  );
}
