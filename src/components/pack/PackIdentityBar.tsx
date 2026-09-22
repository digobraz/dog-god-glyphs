// ════════════════════════════════════════════════════════════════════════════
// HLAVIČKA IDENTITY — avatar s rangom · km a výlety · správy · zvonček (2026-09-22)
// ────────────────────────────────────────────────────────────────────────────
// Matej 22. 9.: *„hore na mobile ako aj na PC treba mať riadok s ikonkou mena ako
// máme v /map = horný header meno level, správy, notifikácie… ešte tam možno vieme
// niečo doplniť časom"*.
//
// PRENOS `renderIdentity()` z `PackMap.tsx` (lock `plany/locky/map-identita.md`):
//   · RANG NESIE AVATAR — prstenec postupu v leveli + číslo na jeho okraji,
//   · MOBIL NIE JE ZMENŠENÉ PC — slovo PÚTNIK je na mobile skryté, jeho miesto berú
//     dva riadky (km, výlety); render je JEDEN, rozhoduje CSS,
//   · klik vedie tam, kam na mape: `/pack/map/triplist?tab=stats`.
// Level sa ráta cez `profileLevelFor` — TÚ ISTÚ funkciu ako mapa a TripSpotlight,
// z tých istých zdrojov ako TripSpotlight. Vlastný výpočet by dal iné číslo.
//
// ⚠️ DNES HO NOSÍ LEN `/pack/ainubis`. `/map` má stále vlastný `renderIdentity()`
//    (2 kópie geometrie). Kým sa mapa neprevedie SEM, `AV_*` nižšie a v `PackMap.tsx`
//    sa musia meniť SPOLU — presne tak sa identita rozišla 5. 8. 2026.
// ⚠️ Šat je AINUBISOV (tmavý displej). Papyrusovú polohu komponent zatiaľ nemá.
// ⚠️ Panel pásiem (klik na číslo levelu na mape) tu NIE JE — žije vnútri PackMap.
// ════════════════════════════════════════════════════════════════════════════
import { useMemo, type ReactNode } from 'react';
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

/* Geometria = `AV_D` / `AV_RING` / `AV_GAP` z `PackMap.tsx` (lock map-identita). */
const AV_D = 44;
const AV_RING = 3;
const AV_GAP = 2;
const RING_SW = (AV_RING / AV_D) * 100;
const RING_R = 50 - RING_SW / 2;
const RING_C = 2 * Math.PI * RING_R;
const PHOTO = AV_D - 2 * (AV_RING + AV_GAP);

/** Tá istá hranica ako mapa a VAULT: ≤1023 = mobilný pohľad. */
const PC_MIN = 1024;

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
.pkid-rank{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;white-space:nowrap;color:${AINUBIS.ink};}
.pkid-stats{display:none;flex-direction:column;gap:2px;}
.pkid-stats span{display:flex;align-items:baseline;gap:${PACK_SPACE.xs}px;white-space:nowrap;line-height:1.05;}
.pkid-stats b{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.lead}px;color:${AINUBIS.ink};font-variant-numeric:tabular-nums;}
.pkid-stats i{font-family:${FONT_UI};font-style:normal;font-weight:500;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.pkid-mid{flex:1 1 auto;min-width:0;display:flex;justify-content:center;}
.pkid-right{flex:0 0 auto;display:flex;align-items:center;}
@media (max-width:${PC_MIN - 1}px){
  .pkid-rank{display:none;}
  .pkid-stats{display:flex;}
}
`;

/** `id` podáva stránka — druhé volanie `usePackIdentity` by načítalo session a psov znova. */
export function PackIdentityBar({ id, middle }: { id: ReturnType<typeof usePackIdentity>; middle?: ReactNode }) {
  const t = useT();
  const navigate = useNavigate();
  const myNotePoints = useMyNotePoints();

  const email = id.session?.user?.email ?? '';
  const meta = (id.session?.user?.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = (meta.full_name || meta.name) as string | undefined;

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
      ownerName: fullName?.trim() ? fullName.trim().split(' ')[0] : '',
      notePoints: myNotePoints,
    });
    return { level, count: walkedTrails.length, km: Math.round(km) };
  }, [email, fullName, myNotePoints]);

  const lv = view.level;
  return (
    <div className="pkid">
      <style>{CSS}</style>
      <button type="button" className="pkid-me" onClick={() => navigate('/pack/map/triplist?tab=stats')}>
        <span className="pkid-av" style={tierVars(lv.level)}>
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth={RING_SW}
              stroke="var(--tier-b,#E69E1A)" strokeOpacity={0.2} />
            <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth={RING_SW}
              stroke="var(--tier-b,#E69E1A)" strokeLinecap="round"
              strokeDasharray={`${(RING_C * lv.pct) / 100} ${RING_C}`}
              transform="rotate(-90 50 50)" />
          </svg>
          {id.avatarUrl
            ? <img className="pkid-photo" src={id.avatarUrl} alt="" />
            : <span className="pkid-photo">{id.avatarInitial}</span>}
          <span className="pkid-lvl" aria-label={t('pack.map.levelAriaLabel', { level: lv.level })}>{lv.level}</span>
        </span>
        <span className="pkid-txt">
          <span className="pkid-rank">{t('pack.map.rankPilgrim')}</span>
          <span className="pkid-stats">
            <span><b>{view.km}</b><i>{t('pack.map.statKm')}</i></span>
            <span><b>{view.count}</b><i>{t('pack.map.statTrips' + pluralKey(view.count))}</i></span>
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
