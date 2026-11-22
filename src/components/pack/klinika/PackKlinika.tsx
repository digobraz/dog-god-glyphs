// PROFIL KLINIKY `/pack/klinika/:cid` — kôš 2 POZERÁM SA (lock architektura-pack §3: lišta ustúpi, hore šípka späť).
// Zadanie: `plany/zadanie-veterinar-profil-admin-hodnotenie-2026-11-17.md` §STAVBA 3–4 · schválený nákres
// `plany/nakresy/veterinar-profil-2026-11-17/nakres.html` (Matej 17. 11.: „ok je to super").
//
// Rozhodnutia, ktoré tu držia:
//  b  hodnotí len člen so psom a odklikne „Boli sme tu"; 1 hodnotenie na človeka a kliniku, dá sa prepísať
//  c  packy Dogypťanov VEDĽA Google; naše číslo až od 3 hodnotení, dovtedy výzva „Boli ste tu?" (nikdy nula)
//  d  správy klinike sa NESTAVAJÚ — len volať
// Karta (hodiny, čísla, fotka) žije v balíku appky (`lib/clinics.ts`), postrehy a „O klinike" v DB (`clinicPosts.ts`).
// Správca nie je nový druh účtu: je to rola (`clinic_admins`), ktorú vráti `clinic_info.i_am_admin`.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase as db } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PackPopup } from '@/components/pack/PackPopup';
import { SysIcon } from '@/components/pack/SysIcon';
import { PawRating } from '@/components/pack/addtrip/PawRating';
import { ICON, RatingPaws } from '@/components/pack/tripShared';
import { driveTimes, type DriveTime } from '@/components/pack/addtrip/mapProxyClient';
import { kmText, useBack, useSosT, type SosT } from '@/components/pack/sos/sosShared';
import { SosStyles } from '@/components/pack/sos/sosShared';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { FONT_TITLE, FONT_UI, PACK_BOX, PACK_R, PACK_SPACE as S, PACK_TEXT, PACK_THEME as T, PF_FIELD_CSS } from '@/components/pack/packTheme';
import { B3_CSS } from '@/lib/papyrus3d';
import { useToast } from '@/hooks/use-toast';
import { useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { distanceKm } from '@/lib/vetEmergency';
import { clinicNavUrl, googleReviews, hoursLabel, useClinic, type MapVet } from '@/lib/clinics';
import type { NavApp } from '@/lib/vetEmergency';
import { uploadPlaceFile } from '@/components/geo/placePosts';
import {
  CLINIC_VISIT_CHIPS, confirmClinicClaim, deleteClinicRating, rateClinic, reportClinicPost, replyClinicPost,
  requestClinicChange, shownAverage, startClinicClaim, updateClinicAbout, useClinicProfile, useClinicStats,
  type ClinicInfo, type ClinicPost,
} from '@/components/geo/clinicPosts';

// Logá v `public/nav-apps/` — to isté poradie ako výber v SOS (`PackSosVet.tsx`).
const NAV_APPS: { id: NavApp; name: string; logo: string }[] = [
  { id: 'google', name: 'Google Maps', logo: '/nav-apps/google.svg' },
  { id: 'waze', name: 'Waze', logo: '/nav-apps/waze.svg' },
  { id: 'mapy', name: 'Mapy.com', logo: '/nav-apps/mapy.svg' },
];
/** „Toto je moja klinika“ — Matej 17. 11. 2026: „daj zatiaľ celkom preč“. Odkaz z mailu (prevzatie) žije ďalej. */
const CLAIM_ON = false;
const MAX_PHOTOS = 4;
const BODY_MAX = 1200;
const BEFORE_MAX = 600;
const REPLY_MAX = 1200;
const ANIMALS = ['dog', 'cat', 'small', 'bird', 'reptile', 'exotic'] as const;
const DEVICES = ['xray', 'ultrasound', 'ct', 'lab', 'endoscopy', 'dental'] as const;
const LANGS = ['sk', 'cs', 'en', 'de', 'hu', 'uk', 'pl'] as const;

// ── POLOHA — poloha len ak je už povolená (princíp `myPosition` z VetLayer), profil sa na ňu nepýta ──
function myPosition(): Promise<[number, number] | null> {
  return (async () => {
    try {
      if (!navigator.geolocation || !navigator.permissions) return null;
      const st = await navigator.permissions.query({ name: 'geolocation' });
      if (st.state !== 'granted') return null;
      return await new Promise<[number, number] | null>((res) => navigator.geolocation.getCurrentPosition(
        (p) => res([p.coords.latitude, p.coords.longitude]), () => res(null), { timeout: 8000, maximumAge: 300000 }));
    } catch { return null; }
  })();
}
function etaLabel(d: DriveTime, loc: string): string {
  const min = Math.max(1, Math.round(d.durationS / 60));
  return `${kmText(d.lengthM / 1000, loc)} km · ${min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`}`;
}
const domainOf = (web?: string): string | null => {
  if (!web) return null;
  try { return new URL(web).hostname.replace(/^www\./, ''); } catch { return null; }
};
const errText = (e: unknown) => (e instanceof Error ? e.message : (e as { message?: string })?.message) ?? '';

// ⚠️ JS template literal — spätný apostrof v komentári ho ukončí (`npm run check:css`).
const CSS = `
.kl-root{--rp-fill:#A3782B;--rp-empty:#A3782B;--rp-empty-op:0.28;display:flex;flex-direction:column;gap:${S.lg}px;font-family:${FONT_UI};color:${T.inkStrong};}
.kl-sheet{--rp-fill:#A3782B;--rp-empty:#A3782B;--rp-empty-op:0.28;}
.kl-hero{position:relative;height:200px;border-radius:${PACK_R.card}px;overflow:hidden;background:${T.tileBg};}
.kl-hero img{display:block;width:100%;height:100%;object-fit:cover;}
.kl-eta{position:absolute;left:${S.md}px;top:${S.md}px;display:inline-flex;align-items:center;min-height:24px;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;
  background:${LAPIS.grad};color:${LAPIS.ink};font-size:${PACK_TEXT.label}px;line-height:1.2;font-weight:600;white-space:nowrap;}
.kl-tags{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.kl-tag{display:inline-flex;align-items:center;gap:${S.xs}px;min-height:24px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};
  font-size:${PACK_TEXT.micro}px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.kl-tag--sos{border-color:${T.sosRed};color:${T.sosRedDark};}
.kl-tag--admin{background:${LAPIS.grad};border-color:${LAPIS.edge};color:${LAPIS.ink};letter-spacing:.02em;text-transform:none;}
.kl-name{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.15;letter-spacing:.02em;color:${T.inkStrong};overflow-wrap:anywhere;} /* písmo: meno */
.kl-addr{margin:0;font-size:${PACK_TEXT.body}px;color:${T.inkWarm};}
.kl-pill{align-self:flex-start;display:inline-flex;align-items:center;min-height:24px;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;font-size:${PACK_TEXT.label}px;font-weight:600;
  background:${T.growGreen};color:#fff;}
.kl-pill--soft{background:${T.tileBg};border:1px solid ${T.cardEdge};color:${T.inkWarm};}
.kl-rate{display:flex;flex-direction:column;gap:${S.sm}px;}
.kl-rl{display:flex;align-items:center;flex-wrap:wrap;gap:${S.sm}px;font-size:${PACK_TEXT.body}px;font-weight:600;}
.kl-rl small{font-size:${PACK_TEXT.body}px;font-weight:400;color:${T.inkWarm};}
.kl-g{display:inline-flex;align-items:center;gap:${S.xs}px;color:${T.inkStrong};text-decoration:underline;text-underline-offset:3px;}
.kl-g img{display:block;width:16px;height:16px;}
.kl-invite{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1.5px dashed ${T.cardEdge};}
.kl-invite b{display:block;font-size:${PACK_TEXT.body}px;font-weight:600;}
.kl-invite small{font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.kl-acts{display:flex;flex-direction:column;gap:${S.md}px;}
.kl-acts2{display:grid;grid-template-columns:1fr 1fr;gap:${S.md}px;}
.kl-acts .pk-b3,.kl-acts2 .pk-b3{width:100%;min-height:52px;padding:0 ${S.md}px;font-size:${PACK_TEXT.lead}px;text-align:center;}
.kl-nav{display:grid;grid-template-columns:repeat(3,1fr);gap:${S.sm}px;}
.kl-nav a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.xs}px;min-height:56px;padding:${S.sm}px;border-radius:${PACK_R.field}px;border:1.5px solid ${T.cardEdge};background:${T.tileBg};font-size:${PACK_TEXT.micro}px;font-weight:600;color:${T.inkStrong};text-align:center;text-decoration:none;}
.kl-nav img{width:24px;height:24px;display:block;}
.kl-more{margin:0;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.kl-more a{color:inherit;text-decoration:underline;}
.kl-sec{display:flex;flex-direction:column;gap:${S.sm}px;}
.kl-eb{margin:0;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.kl-box{display:flex;flex-direction:column;padding:${S.lg}px;}
.kl-post{display:grid;grid-template-columns:36px minmax(0,1fr);gap:${S.sm}px;padding:${S.md}px 0;border-top:1px solid ${T.hairline};}
.kl-post:first-child{border-top:0;padding-top:0;}
.kl-post:last-child{padding-bottom:0;}
.kl-av{width:36px;height:36px;border-radius:${PACK_R.pill}px;object-fit:cover;border:1.5px solid ${T.cardEdge};display:grid;place-items:center;background:${T.tileBg};}
.kl-who{display:flex;align-items:center;flex-wrap:wrap;gap:${S.sm}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.kl-who b{font-family:${FONT_TITLE};font-weight:700;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: meno */
.kl-num{font-weight:600;color:${LAPIS.edge};}
.kl-chips{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.kl-chip{display:inline-flex;align-items:center;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.hairline};background:${T.tileBg};
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
button.kl-chip{cursor:pointer;min-height:36px;font-weight:600;color:${T.inkStrong};}
button.kl-chip.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.kl-text{margin:${S.xs}px 0 0;font-size:${PACK_TEXT.body}px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere;}
.kl-ph{display:flex;flex-wrap:wrap;gap:${S.xs}px;margin-top:${S.sm}px;}
.kl-ph img{width:64px;height:64px;border-radius:${PACK_R.field}px;object-fit:cover;}
.kl-reply{margin-top:${S.sm}px;padding:${S.sm}px ${S.md}px;border-left:3px solid ${T.accentGold};background:${T.tileBg};border-radius:0 ${PACK_R.field}px ${PACK_R.field}px 0;font-size:${PACK_TEXT.label}px;}
.kl-reply b{display:block;font-family:${FONT_TITLE};font-weight:700;letter-spacing:.02em;} /* písmo: meno */
.kl-reply p{margin:${S.xs}px 0 0;white-space:pre-line;overflow-wrap:anywhere;}
.kl-link{all:unset;box-sizing:border-box;cursor:pointer;min-height:36px;display:inline-flex;align-items:center;font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkWarm};}
.kl-link:hover{text-decoration:underline;}
.kl-link--lapis{color:${LAPIS.edge};}
.kl-linkrow{display:flex;flex-wrap:wrap;gap:${S.lg}px;}
.kl-note{margin:${S.xs}px 0 0;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.kl-note--bad{color:${PICK_INK.red};}
.kl-empty{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.5;color:${T.inkWarm};}
.kl-facts{display:grid;gap:${S.sm}px;margin:0;font-size:${PACK_TEXT.body}px;}
.kl-facts div{display:flex;justify-content:space-between;gap:${S.md}px;padding-bottom:${S.xs}px;border-bottom:1px dotted ${T.hairline};}
.kl-facts dt{color:${T.inkWarm};}
.kl-facts dd{margin:0;text-align:right;overflow-wrap:anywhere;white-space:pre-line;}
.kl-mine{border:1.5px solid ${LAPIS.edge};border-radius:${PACK_R.tile}px;padding:${S.md}px;}
.kl-claim{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:${S.sm}px;min-height:44px;margin:${S.sm}px 0;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.kl-claim:hover{text-decoration:underline;}
.kl-banner{margin:0;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${LAPIS.edge};font-size:${PACK_TEXT.body}px;font-weight:600;}
.kl-sheet-b{display:flex;flex-direction:column;gap:${S.lg}px;padding-top:${S.xs}px;}
.kl-sheet-b .pk-b3{width:100%;min-height:52px;padding:0 ${S.md}px;font-size:${PACK_TEXT.lead}px;}
.kl-paws{display:flex;justify-content:center;}
.kl-check{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1.5px solid ${T.cardEdge};background:${T.tileBg};font-size:${PACK_TEXT.body}px;font-weight:600;}
.kl-check.on{border-color:${LAPIS.edge};}
.kl-check i{width:22px;height:22px;border-radius:${PACK_R.field}px;border:2px solid ${T.inkStrong};display:grid;place-items:center;font-style:normal;font-size:${PACK_TEXT.label}px;line-height:1;}
.kl-text-in{width:100%;min-height:88px;padding:${S.md}px;font-family:${FONT_UI};font-size:${PACK_TEXT.lead}px;line-height:1.5;color:${T.inkStrong};resize:vertical;}
.kl-slots{display:grid;grid-template-columns:repeat(4,1fr);gap:${S.sm}px;}
.kl-slot{position:relative;aspect-ratio:1;border-radius:${PACK_R.tile}px;background:center/cover no-repeat;border:1px solid ${T.hairline};}
.kl-slot--add{border:1.5px dashed ${T.cardEdge};background:${T.tileBg};display:grid;place-items:center;cursor:pointer;padding:0;}
.kl-slot-x{position:absolute;right:${S.xs}px;top:${S.xs}px;width:24px;height:24px;border-radius:${PACK_R.pill}px;border:0;background:rgba(10,8,4,0.6);display:grid;place-items:center;cursor:pointer;padding:0;}
.kl-busy{position:absolute;inset:0;border-radius:inherit;background:rgba(255,253,247,0.55);}
.kl-ai{display:flex;align-items:center;gap:${S.sm}px;padding:${S.sm}px ${S.md}px;font-size:${PACK_TEXT.label}px;}
.kl-ai b span{color:${LAPIS.edge};}
.kl-opt{display:flex;gap:${S.sm}px;}
.kl-opt .kl-chip{flex:1;justify-content:center;}
@media (min-width:768px){
  .kl-hero{height:280px;}
  .kl-name{font-size:${PACK_TEXT.h1}px;}
}
`;

// ============================================================================
// OBAL — nájde kliniku, kým sa hľadá, ukáže kostru
// ============================================================================
export default function PackKlinika() {
  const { cid } = useParams<{ cid: string }>();
  const s = useSosT();
  const onBack = useBack('/pack/map');
  const v = useClinic(cid);
  return (
    <PackLayout onBack={onBack} backLabel={s('pack.sos.back')}>
      <SosStyles />
      <style>{B3_CSS + CSS}</style>
      <div className="kl-root">
        {v === undefined && <div className="pk-skel" style={{ height: 320, borderRadius: PACK_R.card }} aria-hidden />}
        {v === null && <p className="kl-empty">{s('pack.sos.notFound')}</p>}
        {v && <KlinikaBody v={v} />}
      </div>
    </PackLayout>
  );
}

type Sheet = null | 'rate' | 'about' | 'change' | 'claim';

function KlinikaBody({ v }: { v: MapVet }) {
  const s = useSosT();
  const { lang } = useLang();
  const loc = intlLocale(lang);
  const { toast } = useToast();
  const { posts, info, reload } = useClinicProfile(v.cid);
  const stats = useClinicStats();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [navOpen, setNavOpen] = useState(false); // výber navigácie ako v SOS (Google · Waze · Mapy.com)
  const [now, setNow] = useState(() => new Date());
  const [eta, setEta] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(tick);
  }, []);

  // Km a minúty: vzdušná čiara hneď, trasa keď dorazí (rovnako ako VetLayer).
  useEffect(() => {
    let alive = true;
    void myPosition().then((pos) => {
      if (!pos || !alive) return;
      setEta(s('pack.sos.er.airKm', { km: kmText(distanceKm(pos, v.at), loc) }));
      void driveTimes(pos, [v.at]).then(([d]) => { if (alive && d) setEta(etaLabel(d, loc)); });
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.cid, loc]);

  // Odkaz z mailu `?prevzat=<token>` → správca, potom parameter preč (nech ho obnova stránky nepoužije druhýkrát).
  const claimToken = params.get('prevzat');
  const claimRan = useRef<string | null>(null);
  useEffect(() => {
    if (!claimToken || claimRan.current === claimToken) return;
    claimRan.current = claimToken;
    void confirmClinicClaim(claimToken)
      .then(() => setBanner(s('pack.sos.er.clClaimDone')))
      .catch((e: unknown) => {
        const c = errText(e);
        setBanner(c === 'expired' ? s('pack.sos.er.clClaimExpired') : c === 'used' ? s('pack.sos.er.clClaimUsed') : s('pack.sos.error'));
      })
      .finally(() => {
        const next = new URLSearchParams(params);
        next.delete('prevzat');
        setParams(next, { replace: true });
        reload();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimToken]);

  const hrs = useMemo(() => hoursLabel(v, s, now), [v, s, now]);
  const st = shownAverage(stats[v.cid]);
  const mine = posts.find((p) => p.isMine);
  const others = posts.filter((p) => !p.isMine && (p.body.trim() || p.photos.length));
  const admin = !!info?.iAmAdmin;
  const tel = v.tels[0];
  const moreTels = v.tels.slice(1);
  const canNav = clinicNavUrl('google', v) !== null;
  const close = useCallback(() => setSheet(null), []);
  const saved = useCallback(() => { setSheet(null); reload(); toast({ description: s('pack.sos.er.clSaved') }); }, [reload, toast, s]);

  const count = (n: number) => {
    const cat = new Intl.PluralRules(loc).select(n);
    return s(cat === 'one' ? 'pack.sos.er.clRateOne' : cat === 'few' ? 'pack.sos.er.clRateFew' : 'pack.sos.er.clRateMany', { count: n.toLocaleString(loc) });
  };
  const avgTxt = (n: number) => n.toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <>
      {banner && <p className="kl-banner" role="status">{banner}</p>}

      <div className="kl-hero">
        <img src={v.photo} alt="" decoding="async" />
        {eta && <span className="kl-eta">{eta}</span>}
      </div>

      <div className="kl-sec">
        <div className="kl-tags">
          <span className="kl-tag">{s('pack.sos.er.clKind')}</span>
          {v.sos && <span className="kl-tag kl-tag--sos">{s('pack.sos.er.title')}</span>}
          {admin && <span className="kl-tag kl-tag--admin">{s('pack.sos.er.clAdmin')}</span>}
          {!admin && info?.claimed && <span className="kl-tag">{s('pack.sos.er.clClaimed')}</span>}
        </div>
        <h1 className="kl-name">{v.name}</h1>
        <p className="kl-addr">{v.address}</p>
        <span className={`kl-pill${hrs.on ? '' : ' kl-pill--soft'}`}>{hrs.text}</span>
      </div>

      {/* Packy Dogypťanov VEDĽA Google (rozhodnutie c). Pod 3 hodnotenia nula nikdy — výzva. */}
      <div className="kl-rate">
        {st ? (
          <div className="kl-rl">
            <RatingPaws stars={st.avg} size={18} gap={3} />
            <span>{avgTxt(st.avg)}</span>
            <small>· {s('pack.sos.er.clOurs')} · {count(st.n)}</small>
          </div>
        ) : (
          <button type="button" className="kl-invite" onClick={() => setSheet('rate')}>
            <RatingPaws stars={0} size={16} gap={3} />
            <span>
              <b>{s('pack.sos.er.clBeenQ')}</b>
              <small>{s('pack.sos.er.clBeenSub')}</small>
            </span>
          </button>
        )}
        {v.google && v.googleUrl && (
          <div className="kl-rl">
            <a className="kl-g" href={v.googleUrl} target="_blank" rel="noopener noreferrer">
              {avgTxt(v.google.rating)}
              <img src="/nav-apps/google-g.svg" alt="Google" />
              {v.google.count ? `· ${googleReviews(v.google.count, s, loc)}` : ''}
            </a>
          </div>
        )}
      </div>

      <div className="kl-acts">
        {tel && (
          <a className="pk-b3 pk-b3--lapis" href={`tel:${tel.replace(/\s/g, '')}`}>{s('pack.sos.er.callBtn')} · {tel}</a>
        )}
        <div className="kl-acts2">
          {canNav
            ? <button type="button" className="pk-b3 pk-b3--paper" aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)}>{s('pack.sos.er.navBtn')}</button>
            : <span />}
          <button type="button" className="pk-b3 pk-b3--paper" onClick={() => setSheet('rate')}>{s('pack.sos.er.clRate')}</button>
        </div>
        {canNav && navOpen && (
          <div className="kl-nav" role="group" aria-label={s('pack.sos.er.navOpen')}>
            {NAV_APPS.map((a) => (
              <a key={a.id} href={clinicNavUrl(a.id, v)!} target="_blank" rel="noopener noreferrer" onClick={() => setNavOpen(false)}>
                <img src={a.logo} alt="" aria-hidden="true" />{a.name}
              </a>
            ))}
          </div>
        )}
        {moreTels.length > 0 && (
          <p className="kl-more">
            {moreTels.map((t, i) => (
              <span key={t}>{i > 0 && ' · '}<a href={`tel:${t.replace(/\s/g, '')}`}>{t}</a></span>
            ))}
          </p>
        )}
      </div>

      <section className="kl-sec">
        <h2 className="kl-eb">{s('pack.sos.er.clPosts')}</h2>
        <div className="kl-box" style={{ ...PACK_BOX.subblock }}>
          {mine && (
            <div className="kl-mine" style={{ marginBottom: others.length ? S.md : 0 }}>
              <p className="kl-note" style={{ marginTop: 0 }}>{s('pack.sos.er.clMine')}</p>
              <PostRow p={mine} loc={loc} s={s} admin={false} onChanged={reload} />
              <div className="kl-linkrow">
                <button type="button" className="kl-link kl-link--lapis" onClick={() => setSheet('rate')}>{s('pack.sos.er.clEdit')}</button>
                <button type="button" className="kl-link" onClick={async () => { try { await deleteClinicRating(mine.id); reload(); } catch { toast({ description: s('pack.sos.error') }); } }}>
                  {s('pack.sos.er.clDelete')}
                </button>
              </div>
            </div>
          )}
          {others.length === 0 && !mine && <p className="kl-empty">{s('pack.sos.er.clNoPosts')}</p>}
          {others.map((p) => <PostRow key={p.id} p={p} loc={loc} s={s} admin={admin} onChanged={reload} />)}
        </div>
      </section>

      <section className="kl-sec">
        <h2 className="kl-eb">{s('pack.sos.er.clAbout')}</h2>
        <div className="kl-box" style={{ ...PACK_BOX.subblock }}>
          <About info={info} loc={loc} s={s} />
          {admin && (
            <div className="kl-linkrow" style={{ marginTop: S.md }}>
              <button type="button" className="kl-link kl-link--lapis" onClick={() => setSheet('about')}>{s('pack.sos.er.clAboutEdit')}</button>
              <button type="button" className="kl-link kl-link--lapis" onClick={() => setSheet('change')}>{s('pack.sos.er.clChange')}</button>
            </div>
          )}
        </div>
      </section>

      {CLAIM_ON && !admin && (
        <button type="button" className="kl-claim" onClick={() => setSheet('claim')}>
          <SysIcon name="kluc" size={22} />{s('pack.sos.er.clClaim')}
        </button>
      )}

      {sheet === 'rate' && <RateSheet v={v} mine={mine} s={s} onClose={close} onSaved={saved} />}
      {sheet === 'about' && info && <AboutSheet v={v} info={info} loc={loc} s={s} onClose={close} onSaved={saved} />}
      {sheet === 'change' && <ChangeSheet v={v} s={s} onClose={close} onSent={() => { setSheet(null); toast({ description: s('pack.sos.er.clChangeSent') }); }} />}
      {sheet === 'claim' && <ClaimSheet v={v} info={info} lang={lang} s={s} onClose={close} />}
    </>
  );
}

// ── O KLINIKE ──────────────────────────────────────────────────────────────
function About({ info, loc, s }: { info: ClinicInfo | null; loc: string; s: SosT }) {
  const names = useMemo(() => { try { return new Intl.DisplayNames([loc], { type: 'language' }); } catch { return null; } }, [loc]);
  const rows: [string, string][] = [];
  if (info?.animals.length) rows.push([s('pack.sos.er.clAnimals'), info.animals.map((a) => s(`pack.sos.er.clAn.${a}` as never)).join(', ')]);
  if (info?.devices.length) rows.push([s('pack.sos.er.clDevices'), info.devices.map((d) => s(`pack.sos.er.clDev.${d}` as never)).join(', ')]);
  if (info?.before.trim()) rows.push([s('pack.sos.er.clBefore'), info.before.trim()]);
  if (info?.languages.length) rows.push([s('pack.sos.er.clLangs'), info.languages.map((l) => names?.of(l) ?? l).join(', ')]);
  if (rows.length === 0) return <p className="kl-empty">{s('pack.sos.er.clAboutEmpty')}</p>;
  return (
    <dl className="kl-facts">
      {rows.map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}
    </dl>
  );
}

// ── POSTREH ────────────────────────────────────────────────────────────────
function PostRow({ p, loc, s, admin, onChanged }: { p: ClinicPost; loc: string; s: SosT; admin: boolean; onChanged: () => void }) {
  const [reported, setReported] = useState(false);
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState(p.replyBody ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const date = new Date(p.createdAt).toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' });

  const report = async () => {
    setBusy(true);
    try { await reportClinicPost(p.id, 'other'); setReported(true); } catch { setErr(true); } finally { setBusy(false); }
  };
  const send = async () => {
    if (!reply.trim()) return;
    setBusy(true); setErr(false);
    try { await replyClinicPost(p.id, reply.trim().slice(0, REPLY_MAX)); setReplying(false); onChanged(); } catch { setErr(true); } finally { setBusy(false); }
  };

  return (
    <article className="kl-post">
      {p.avatarUrl ? <img className="kl-av" src={p.avatarUrl} alt="" loading="lazy" /> : <span className="kl-av" aria-hidden><img src={ICON('paw')} alt="" style={{ width: 18, height: 18 }} /></span>}
      <div style={{ minWidth: 0 }}>
        <div className="kl-who">
          <b>{p.authorFirst || '—'}</b>
          {p.packNumber != null && <span className="kl-num">#{p.packNumber}</span>}
          {p.paws != null && <RatingPaws stars={p.paws} size={12} gap={2} />}
          <span style={{ marginLeft: 'auto' }}>{date}</span>
        </div>
        {p.chips.length > 0 && (
          <div className="kl-chips" style={{ marginTop: S.xs }}>
            {p.chips.map((c) => <span key={c} className="kl-chip">{s(`pack.sos.er.clChip.${c}` as never)}</span>)}
          </div>
        )}
        {p.body && <p className="kl-text">{p.body}</p>}
        {p.photos.length > 0 && <div className="kl-ph">{p.photos.map((u) => <img key={u} src={u} alt="" loading="lazy" />)}</div>}
        {p.isMine && p.review === 'pending' && <p className="kl-note">{s('pack.sos.er.clPending')}</p>}
        {p.replyBody && !replying && (
          <div className="kl-reply"><b>{s('pack.sos.er.clReply')}</b><p>{p.replyBody}</p></div>
        )}
        {replying && (
          <div style={{ marginTop: S.sm, display: 'flex', flexDirection: 'column', gap: S.sm }}>
            <textarea className="pf-field kl-text-in" rows={3} maxLength={REPLY_MAX} value={reply} onChange={(e) => setReply(e.target.value)} />
            <button type="button" className="pk-b3 pk-b3--lapis" style={{ minHeight: 44, padding: `0 ${S.md}px`, fontSize: PACK_TEXT.body }} disabled={busy || !reply.trim()} onClick={send}>{s('pack.sos.er.clSend')}</button>
          </div>
        )}
        <div className="kl-linkrow">
          {!p.isMine && !reported && <button type="button" className="kl-link" disabled={busy} onClick={report}>⚑ {s('pack.sos.er.clReport')}</button>}
          {!p.isMine && reported && <span className="kl-note">{s('pack.sos.er.clReported')}</span>}
          {admin && !replying && <button type="button" className="kl-link kl-link--lapis" onClick={() => setReplying(true)}>{s('pack.sos.er.clReplyBtn')}</button>}
        </div>
        {err && <p className="kl-note kl-note--bad">{s('pack.sos.error')}</p>}
      </div>
    </article>
  );
}

// ── ŠUPLÍK: AKO TU BOLO? ───────────────────────────────────────────────────
type PhotoSlot = { preview: string; url: string | null; busy: boolean };

function RateSheet({ v, mine, s, onClose, onSaved }: { v: MapVet; mine?: ClinicPost; s: SosT; onClose: () => void; onSaved: () => void }) {
  const [paws, setPaws] = useState(mine?.paws ?? 0);
  const [been, setBeen] = useState(!!mine); // kto už hodnotil, „Boli sme tu" už raz odklikol
  const [chips, setChips] = useState<string[]>(mine?.chips ?? []);
  const [body, setBody] = useState(mine?.body ?? '');
  const [photos, setPhotos] = useState<PhotoSlot[]>((mine?.photos ?? []).map((u) => ({ preview: u, url: u, busy: false })));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploading = photos.some((p) => p.busy);

  useEffect(() => () => photos.forEach((p) => { if (p.preview.startsWith('blob:')) URL.revokeObjectURL(p.preview); }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (list: FileList | null) => {
    if (!list?.length) return;
    // Kópia hneď: FileList je živý a `value = ''` ho vyprázdni počas await (PlaceSheet, 31. 10. 2026).
    const files = Array.from(list);
    setErr(null);
    const { data } = await db.auth.getUser();
    const uid = data.user?.id;
    if (!uid) { setErr(s('pack.sos.error')); return; }
    for (const f of files.slice(0, MAX_PHOTOS - photos.length)) {
      const preview = URL.createObjectURL(f);
      setPhotos((prev) => [...prev, { preview, url: null, busy: true }]);
      uploadPlaceFile(f, uid)
        .then((url) => setPhotos((prev) => prev.map((p) => (p.preview === preview ? { ...p, url, busy: false } : p))))
        // Zlyhaná fotka odpadne; blob adresa sa neukladá.
        .catch(() => { setPhotos((prev) => prev.filter((p) => p.preview !== preview)); setErr(s('pack.sos.error')); });
    }
  };

  const submit = async () => {
    if (saving || uploading) return;
    if (paws < 1) { setErr(s('pack.sos.er.clNeedPaws')); return; }
    if (!been) { setErr(s('pack.sos.er.clNeedBeen')); return; }
    setSaving(true); setErr(null);
    try {
      await rateClinic({
        clinicId: v.cid, paws, body: body.trim().slice(0, BODY_MAX), chips, beenThere: true,
        photos: photos.filter((p) => p.url).map((p) => p.url as string),
      });
      onSaved();
    } catch (e) {
      const m = errText(e);
      setErr(m.includes('not_member') ? s('pack.sos.er.clNeedDog') : m.includes('not_been_there') ? s('pack.sos.er.clNeedBeen') : s('pack.sos.error'));
      setSaving(false);
    }
  };

  return (
    <PackPopup title={s('pack.sos.er.clSheet')} onClose={onClose} className="kl-sheet">
      <style>{PF_FIELD_CSS}</style>
      <div className="kl-sheet-b">
        <p className="kl-note" style={{ margin: 0, textAlign: 'center' }}>{v.name}</p>
        <div className="kl-paws"><PawRating value={paws} onChange={(n) => { setPaws(n); setErr(null); }} size={36} /></div>
        <button type="button" className={`kl-check${been ? ' on' : ''}`} role="checkbox" aria-checked={been} onClick={() => { setBeen(!been); setErr(null); }}>
          <i aria-hidden>{been && <SysIcon name="fajka" size={14} />}</i>{s('pack.sos.er.clBeen')}
        </button>

        <div className="kl-sec">
          <h3 className="kl-eb">{s('pack.sos.er.clWhy')}</h3>
          <div className="kl-chips">
            {CLINIC_VISIT_CHIPS.map((c) => {
              const on = chips.includes(c);
              return (
                <button key={c} type="button" className={`kl-chip${on ? ' on' : ''}`} aria-pressed={on}
                  onClick={() => setChips((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))}>
                  {s(`pack.sos.er.clChip.${c}` as never)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="kl-sec">
          <h3 className="kl-eb">{s('pack.sos.er.clNote')} {s('pack.sos.er.clOptional')}</h3>
          <textarea className="pf-field kl-text-in" rows={3} maxLength={BODY_MAX} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>

        <div className="kl-sec">
          <h3 className="kl-eb">{s('pack.sos.er.clPhotos')}</h3>
          <div className="kl-slots">
            {photos.map((p) => (
              <div key={p.preview} className="kl-slot" style={{ backgroundImage: `url(${p.preview})` }}>
                {p.busy && <span className="kl-busy" />}
                <button type="button" className="kl-slot-x" aria-label={s('pack.sos.er.clDelete')} onClick={() => setPhotos((prev) => prev.filter((q) => q.preview !== p.preview))}><img src={ICON('cross')} alt="" aria-hidden style={{ width: 12, height: 12, filter: 'invert(1)' }} /></button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button type="button" className="kl-slot kl-slot--add" onClick={() => fileRef.current?.click()}>
                <SysIcon name="foto" size={28} />
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { void pick(e.target.files); e.target.value = ''; }} />
        </div>

        <div className="kl-ai" style={{ ...PACK_BOX.subblock }}>
          <SysIcon name="ainubis" size={28} />
          <span>{s('pack.sos.er.clReviewBy')} <b><span>AI</span>NUBIS</b>.</span>
        </div>
        {err && <p className="kl-note kl-note--bad" role="alert">{err}</p>}
        <button type="button" className="pk-b3 pk-b3--lapis" disabled={saving || uploading} onClick={submit}>{s('pack.sos.er.clSave')}</button>
      </div>
    </PackPopup>
  );
}

// ── ŠUPLÍK: UPRAVIŤ „O KLINIKE" (správca) ──────────────────────────────────
function Toggles({ ids, picked, setPicked, label }: { ids: readonly string[]; picked: string[]; setPicked: (x: string[]) => void; label: (id: string) => ReactNode }) {
  return (
    <div className="kl-chips">
      {ids.map((id) => {
        const on = picked.includes(id);
        return (
          <button key={id} type="button" className={`kl-chip${on ? ' on' : ''}`} aria-pressed={on}
            onClick={() => setPicked(on ? picked.filter((x) => x !== id) : [...picked, id])}>{label(id)}</button>
        );
      })}
    </div>
  );
}

function AboutSheet({ v, info, loc, s, onClose, onSaved }: { v: MapVet; info: ClinicInfo; loc: string; s: SosT; onClose: () => void; onSaved: () => void }) {
  const [animals, setAnimals] = useState(info.animals);
  const [devices, setDevices] = useState(info.devices);
  const [languages, setLanguages] = useState(info.languages);
  const [before, setBefore] = useState(info.before);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(false);
  const names = useMemo(() => { try { return new Intl.DisplayNames([loc], { type: 'language' }); } catch { return null; } }, [loc]);

  const save = async () => {
    setSaving(true); setErr(false);
    try { await updateClinicAbout(v.cid, { animals, devices, languages, before: before.trim().slice(0, BEFORE_MAX) }); onSaved(); } catch { setErr(true); setSaving(false); }
  };
  return (
    <PackPopup title={s('pack.sos.er.clAbout')} onClose={onClose} className="kl-sheet">
      <style>{PF_FIELD_CSS}</style>
      <div className="kl-sheet-b">
        <div className="kl-sec"><h3 className="kl-eb">{s('pack.sos.er.clAnimals')}</h3>
          <Toggles ids={ANIMALS} picked={animals} setPicked={setAnimals} label={(id) => s(`pack.sos.er.clAn.${id}` as never)} /></div>
        <div className="kl-sec"><h3 className="kl-eb">{s('pack.sos.er.clDevices')}</h3>
          <Toggles ids={DEVICES} picked={devices} setPicked={setDevices} label={(id) => s(`pack.sos.er.clDev.${id}` as never)} /></div>
        <div className="kl-sec"><h3 className="kl-eb">{s('pack.sos.er.clLangs')}</h3>
          <Toggles ids={LANGS} picked={languages} setPicked={setLanguages} label={(id) => names?.of(id) ?? id} /></div>
        <div className="kl-sec"><h3 className="kl-eb">{s('pack.sos.er.clBefore')}</h3>
          <textarea className="pf-field kl-text-in" rows={4} maxLength={BEFORE_MAX} value={before} onChange={(e) => setBefore(e.target.value)} /></div>
        {err && <p className="kl-note kl-note--bad" role="alert">{s('pack.sos.error')}</p>}
        <button type="button" className="pk-b3 pk-b3--lapis" disabled={saving} onClick={save}>{s('pack.sos.er.clSave')}</button>
      </div>
    </PackPopup>
  );
}

// ── ŠUPLÍK: ZMENIŤ ČÍSLO ALEBO HODINY (správca; overí AINUBIS) ─────────────
function ChangeSheet({ v, s, onClose, onSent }: { v: MapVet; s: SosT; onClose: () => void; onSent: () => void }) {
  const [what, setWhat] = useState<'tel' | 'hours'>('tel');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const send = async () => {
    if (!value.trim()) return;
    setBusy(true); setErr(false);
    try { await requestClinicChange(v.cid, what, value.trim()); onSent(); } catch { setErr(true); setBusy(false); }
  };
  return (
    <PackPopup title={s('pack.sos.er.clChange')} onClose={onClose} className="kl-sheet">
      <style>{PF_FIELD_CSS}</style>
      <div className="kl-sheet-b">
        <div className="kl-opt">
          <button type="button" className={`kl-chip${what === 'tel' ? ' on' : ''}`} aria-pressed={what === 'tel'} onClick={() => setWhat('tel')}>{s('pack.sos.er.clChangeTel')}</button>
          <button type="button" className={`kl-chip${what === 'hours' ? ' on' : ''}`} aria-pressed={what === 'hours'} onClick={() => setWhat('hours')}>{s('pack.sos.er.clChangeHours')}</button>
        </div>
        <input className="pf-field" value={value} maxLength={300} inputMode={what === 'tel' ? 'tel' : 'text'} onChange={(e) => setValue(e.target.value)} />
        <p className="kl-note" style={{ margin: 0 }}>{s('pack.sos.er.clChangeHint')}</p>
        {err && <p className="kl-note kl-note--bad" role="alert">{s('pack.sos.error')}</p>}
        <button type="button" className="pk-b3 pk-b3--lapis" disabled={busy || !value.trim()} onClick={send}>{s('pack.sos.er.clSend')}</button>
      </div>
    </PackPopup>
  );
}

// ── ŠUPLÍK: PREVZIATÝ PROFIL ───────────────────────────────────────────────
function ClaimSheet({ v, info, lang, s, onClose }: { v: MapVet; info: ClinicInfo | null; lang: string; s: SosT; onClose: () => void }) {
  const domain = domainOf(v.web);
  // Bez webu (alebo keď DB doménu nepozná) overenie e-mailom nejde.
  const canMail = !!domain && info?.hasDomain !== false;
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const send = async () => {
    if (!email.trim()) return;
    setBusy(true); setErr(null);
    try { await startClinicClaim(v.cid, email.trim(), lang); setSent(s('pack.sos.er.clClaimSent', { email: email.trim() })); }
    catch (e) {
      const c = errText(e);
      setErr(c === 'bad_domain' ? s('pack.sos.er.clClaimBad', { domain: domain ?? '' }) : s('pack.sos.error'));
    } finally { setBusy(false); }
  };
  return (
    <PackPopup title={s('pack.sos.er.clClaimTitle')} onClose={onClose} className="kl-sheet">
      <style>{PF_FIELD_CSS}</style>
      <div className="kl-sheet-b">
        {!canMail && <p className="kl-empty">{s('pack.sos.er.clClaimNoWeb')}</p>}
        {canMail && !sent && (
          <>
            <p className="kl-empty">{s('pack.sos.er.clClaimIntro', { domain: domain! })}</p>
            <input className="pf-field" type="email" autoComplete="email" inputMode="email" value={email} placeholder={s('pack.sos.er.clClaimEmail')}
              aria-label={s('pack.sos.er.clClaimEmail')} onChange={(e) => setEmail(e.target.value)} />
            {err && <p className="kl-note kl-note--bad" role="alert">{err}</p>}
            <button type="button" className="pk-b3 pk-b3--lapis" disabled={busy || !email.trim()} onClick={send}>{s('pack.sos.er.clClaimSend')}</button>
          </>
        )}
        {sent && <p className="kl-banner" role="status">{sent}</p>}
        <p className="kl-note" style={{ margin: 0 }}>{s('pack.sos.er.clClaimPhone')}</p>
      </div>
    </PackPopup>
  );
}
