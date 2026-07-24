// /pack/portal/trips/:slug — full-page trip article (iterácia 12 bod 5). Route model
// (LOCKED): klik na kartu v PackPortal.tsx → inline detail v paneli, BEZ navigácie (zostáva
// na /pack/portal/trips). ⤢ expand → navigate() SEM, na SAMOSTATNÚ route — toto NAHRÁDZA
// starý `.trp-detoverlay` popup modal (zrušený z PackPortal.tsx). Deep-link na :slug ide
// rovno sem (žiadna mapa/panel, shareable článok — AllTrails trail-page vzor).
//
// ADD-flow tripy (PackPortal bod 6, iterácia 11) aj wishlist/walked toggle žijú v PackPortal
// component state, ktorý sa pri navigácii sem zruší — tripShared.ts sessionStorage mirror
// (readLocalTrails/readFavIds/readWalkedIds) drží ich konzistentné cez mount/unmount v rámci
// tej istej browser session (žiadna Supabase perzistencia, tá je mimo rozsahu).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // KRITICKÉ: bez neho .leaflet-tile stratí position:absolute a
// dlaždice kaskádujú dole ako bloky (Matej 2026-07-22 „mapa sa vykresľuje zle"). PackPortal ho
// importuje, ale pri PRIAMOM otvorení článku (deep-link / ⤢ expand) PackPortal nie je mountnutý.
import { mapyTiles } from '@/lib/env';
import { placeIcon } from '@/components/trails/trailIcons';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { PackBottomNav, HieroglyphBg } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, GLASS_CSS } from '@/components/pack/packTheme';
import { useToast } from '@/hooks/use-toast';
import {
  ICON, authorOf, REGION_OF, DiffMark, DIFF_MARK_CSS, RatingPaws,
  readLocalTrails, readFavIds, writeFavIds, readWalkedIds, writeWalkedIds,
} from '@/components/pack/tripShared';
import {
  crowdAggregate, FOUNDER_WALKERS, readVotes, writeVotes, readPlans, writePlans, readEvents, writeEvents,
  type TripVote, type TripPlan, type PartnerEvent,
} from '@/components/pack/packCommunity';
import {
  COMMUNITY_CSS, WalkedPopup, WishlistIntentPopup, PartnerAdForm,
  type WalkedInput, type PartnerAdInput,
} from '@/components/pack/packCommunityUI';
import { TripComments } from '@/components/pack/trip/TripComments';
import { upsertMyTrip } from '@/components/pack/triplist/triplist'; // TRIPLIST (Slice A) — star popup upserts alongside the existing wishlist plan

const GOLD = '#C99A3F';
const INK = '#1F1A0E';
const T = PACK_THEME;

// bod 2 (iterácia 14): rovnaké emoji mapovanie ako inline detail v PackPortal.tsx (Aktivita/
// Tag vocabulary) — LOKÁLNA kópia, lebo zadanie scopuje bod 2 výhradne na tento súbor
// (PackPortal.tsx sa v tejto iterácii nemení). Ak sa emoji sada niekedy zmení, treba upraviť
// na oboch miestach. Rovnaká poznámka ako PackPortal: tr.acts[] nesie dátové id 'hike' (nie
// 'hiking'), takže ACT_EMOJI['hike'] je undefined — zdedený stav z inline detailu, flag v reporte.
const ACT_EMOJI: Record<string, string> = { hiking: '🥾', picnic: '🧺', overnight: '⛺', skating: '🛼', paddleboard: '🏄' };
const TAG_EMOJI: Record<string, string> = {
  Mountains: '🏔️', Forest: '🌲', 'Lake/Reservoir': '🏞️', River: '💧', View: '🌄', Meadow: '🌼', Sunset: '🌅', Asphalt: '🛣️',
};

// bod 6 (iterácia 13): mobile route mapa sa renderovala sčasti čierna — Leaflet meria
// veľkosť pri mounte, kedy layout (hero/statrow nad ňou) ešte nemusí byť dokončený. Rovnaký
// vzor ako MapRefBridge v PackPortal.tsx, len tu priamo volá invalidateSize namiesto expose.
// Leaflet si meria veľkosť kontajnera pri mounte — lenže nad mapou sú fotky galérie, ktoré sa
// ešte doťahujú a posúvajú layout, takže dlaždice sa napozicujú podľa zastaralej/nulovej veľkosti
// (Matej 2026-07-22: „mapa sa vykresľuje zle" — dva odsadené útržky). Fix = invalidateSize až keď
// sa layout ustáli: rAF + oneskorený tik + ResizeObserver na kontajner (chytí aj neskorý reflow).
function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const raf = requestAnimationFrame(fix);
    const t = setTimeout(fix, 250);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fix) : null;
    ro?.observe(map.getContainer());
    return () => { cancelAnimationFrame(raf); clearTimeout(t); ro?.disconnect(); };
  }, [map]);
  return null;
}

const CSS = `
/* bod 1 (iterácia 14): action bar presunutý z fixného spodného pruhu (.pta-actions zrušený)
   na spodný okraj hero fotky — .pta-root už nepotrebuje veľkú rezervu, len bežný bottom
   padding nech posledná sekcia (Comments) nezmizne za PackBottomNav. */
.pta-root{min-height:100dvh;background:${T.pageBg};color:${T.onDark};font-family:'DM Sans',system-ui,sans-serif;position:relative;padding-bottom:100px;}
/* §16 (2026-07-23): fotka je VNÚTRI glass rámika (.pta-shell) — full-bleed hore, zaoblené rohy
   dedí z rámika (overflow:hidden). Už NIE samostatná karta + rámik pod ňou, ale fotka v rámiku. */
.pta-shell{max-width:800px;width:calc(100% - 32px);margin:22px auto 0;position:relative;z-index:2;overflow:hidden;}
.pta-hero{position:relative;width:100%;height:34vh;min-height:230px;max-height:360px;overflow:hidden;background-size:cover;background-position:center;background-color:#111;}
.pta-hero-grad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.30) 0%,rgba(0,0,0,0) 34%,rgba(0,0,0,0.55) 100%);}
.pta-back{position:absolute;top:calc(env(safe-area-inset-top,0px) + 18px);left:18px;z-index:5;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,0.55);border:1px solid rgba(255,255,255,0.28);color:#fff;font-size:17px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;}
/* bod 1 (iterácia 14): WISHLIST/WALKED/SHARE presunuté na spodný okraj hero fotky (nahrádza
   starý top-right ♡ — .pta-hero-save zrušený, wishlist je teraz len tu, nie 2×). Mobile:
   IntersectionObserver na .pta-hero → .collapsed trieda, keď fotka vyscrolluje z viewportu —
   rad sa "odtrhne" a prilepí ako zvislý icon-only rail vpravo (position:fixed). Desktop bez
   collapse (.collapsed nemá na ≥761px žiadny efekt, len base štýl na fotke). */
.pta-hero-actions{position:absolute;left:0;right:0;bottom:14px;z-index:5;display:flex;gap:9px;padding:0 18px;}
.pta-hero-actions .pta-actbtn{display:flex;align-items:center;justify-content:center;gap:6px;}
.pta-actbtn-label{white-space:nowrap;}
@media (max-width:760px){
  .pta-hero-actions.collapsed{position:fixed;left:auto;right:14px;bottom:auto;top:50%;transform:translateY(-50%);flex-direction:column;padding:0;gap:10px;z-index:45;}
  .pta-hero-actions.collapsed .pta-actbtn{flex:0 0 auto;width:42px;height:42px;padding:0;border-radius:50%;box-shadow:0 6px 18px rgba(0,0,0,0.45);}
  .pta-hero-actions.collapsed .pta-actbtn-label{display:none;}
}
/* bod 3 (iterácia 14): fotky v galérii klikacie → lightbox (fullscreen popup) */
.pta-lightbox{position:fixed;inset:0;z-index:200;background:rgba(5,5,5,0.94);display:flex;align-items:center;justify-content:center;padding:28px;}
.pta-lightbox img{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;}
.pta-lightbox-close{position:absolute;top:16px;right:16px;z-index:2;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.pta-lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.pta-lightbox-prev{left:16px;}
.pta-lightbox-next{right:16px;}
/* bod 1: bez negatívneho margin-top prekryvu (buttony teraz sedia na spodku hero fotky —
   prekryv by kolidoval s nimi); telo článku začína čisto pod fotkou. */
.pta-body{max-width:760px;margin:0 auto;padding:20px 20px 0;position:relative;z-index:2;}
/* §16 (2026-07-23): obsahová časť článku do zdieľaného LIQUID GLASS panelu (.pk-glass z GLASS_CSS)
   — nemá plávať na plnej čiernej, rovnaká situácia ako triplist/walked. */
.pta-panel{padding:22px 20px 26px;}
.pta-loc{font-family:'Cinzel',serif;font-weight:700;font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:${T.onDarkDim};}
.pta-title{font-family:'Cinzel',serif;font-weight:700;font-size:26px;line-height:1.15;color:${T.onDark};margin-top:4px;}
.pta-author{font-size:11.5px;color:${T.onDarkDim};margin-top:8px;}
.pta-statrow{display:flex;margin-top:20px;border-radius:14px;overflow:hidden;border:1px solid ${T.onDarkBorder};background:${T.glassSoft};}
.pta-stat{flex:1;padding:13px 6px;text-align:center;}
.pta-stat + .pta-stat{border-left:1px solid ${T.onDarkBorder};}
.pta-stat b{display:flex;align-items:center;justify-content:center;gap:5px;font-family:'Cinzel',serif;font-size:15px;font-weight:700;color:${T.onDark};}
.pta-stat span{display:block;font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:${T.onDarkDim};margin-top:2px;}
/* bod 2 (iterácia 14): tagy + aktivity s emoji, POD stat tabuľkou */
.pta-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;}
.pta-tag{background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:11px;font-weight:600;padding:5px 11px;border-radius:999px;}
.pta-gallery{display:flex;gap:8px;overflow-x:auto;margin-top:20px;padding-bottom:4px;scrollbar-width:none;}
.pta-gallery::-webkit-scrollbar{display:none;}
.pta-gallery img{flex:0 0 148px;height:104px;border-radius:11px;object-fit:cover;background:#111;cursor:pointer;}
.pta-desc{font-size:14px;line-height:1.75;color:${T.onDarkDim};margin-top:20px;}
.pta-dognote{font-size:14px;line-height:1.75;color:${T.onDarkDim};margin-top:10px;}
.pta-mapwrap{margin-top:24px;border-radius:16px;overflow:hidden;height:320px;border:1px solid ${T.onDarkBorder};background:#0a0a0a;}
.pta-mapwrap .leaflet-container{width:100%;height:100%;background:#0a0a0a;}
.pta-mapempty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${T.onDarkDim};font-family:'Cinzel',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;text-align:center;padding:20px;}
.pta-section{margin-top:28px;}
.pta-section h3{font-family:'Cinzel',serif;font-weight:700;font-size:12.5px;letter-spacing:.07em;text-transform:uppercase;color:${GOLD};margin-bottom:8px;}
.pta-empty{font-size:12.5px;color:${T.onDarkDim};font-style:italic;}
/* .pta-actbtn — zdieľané medzi .pta-hero-actions (bod 1, iterácia 14; predtým fixný spodný
   .pta-actions pruh, teraz zrušený) */
.pta-actbtn{flex:1;font-family:'Cinzel',serif;font-weight:700;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;padding:12px 6px;border-radius:10px;cursor:pointer;border:1px solid transparent;transition:all .15s;}
.pta-actbtn--gold{background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border-color:rgba(250,244,236,0.3);}
.pta-actbtn--gold.on{background:rgba(201,154,63,0.18);color:${GOLD};border-color:${GOLD};}
.pta-actbtn--ghost{background:rgba(245,240,228,0.06);color:${T.onDark};border-color:${T.onDarkBorder};}
.pta-actbtn--ghost.on{background:rgba(201,154,63,0.16);color:${GOLD};border-color:${GOLD};}
.pta-notfound{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:${T.onDarkDim};font-family:'Cinzel',serif;text-align:center;padding:20px;}
${DIFF_MARK_CSS}
`;

export default function PackTripArticle() {
  const t = useT();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const id = usePackIdentity();
  const { toast } = useToast();

  // bod 5 side-effect (viď súborový komentár hore): allTrails = statické HERO_TRAILS +
  // sessionStorage mirror ADD-flow tripov z PackPortal (jeden-krát na mount stačí — táto
  // stránka je detail jedného tripu, nepotrebuje živú reaktivitu na iný tab/mount).
  const allTrails = useMemo(() => [...readLocalTrails(), ...HERO_JOURNEYS, ...HERO_TRAILS], []);
  const trail = useMemo(() => allTrails.find((x) => x.id === slug) ?? null, [allTrails, slug]);

  const [favIds, setFavIds] = useState<Set<string>>(() => readFavIds());
  const [walkedIds, setWalkedIds] = useState<Set<string>>(() => readWalkedIds());
  useEffect(() => { writeFavIds(favIds); }, [favIds]);
  useEffect(() => { writeWalkedIds(walkedIds); }, [walkedIds]);

  // ── KOMUNITNÁ vrstva (rovnaké flowy ako PackPortal — walked popup / wishlist zámer /
  // partner ad); sessionStorage mirror (packCommunity), žiadna Supabase. ──
  const nowMs = useMemo(() => Date.now(), []);
  const [votes, setVotes] = useState<Record<string, TripVote>>(() => readVotes());
  const [plans, setPlans] = useState<TripPlan[]>(() => readPlans());
  const [events, setEvents] = useState<PartnerEvent[]>(() => readEvents());
  useEffect(() => { writeVotes(votes); }, [votes]);
  useEffect(() => { writePlans(plans); }, [plans]);
  useEffect(() => { writeEvents(events); }, [events]);
  const [walkedPopupOpen, setWalkedPopupOpen] = useState(false);
  const [wishlistPopupOpen, setWishlistPopupOpen] = useState(false);
  const [partnerAdOpen, setPartnerAdOpen] = useState(false);

  // greeting meno pre partner-ad host (rovnaký vzor ako PackPortal firstNameFrom)
  const firstName = useMemo(() => {
    const meta = (id.session?.user?.user_metadata ?? {}) as Record<string, unknown>;
    const full = (meta.full_name || meta.name) as string | undefined;
    if (full && full.trim()) return full.trim().split(' ')[0];
    const local = (id.session?.user?.email ?? '').split('@')[0] || '';
    const base = local.split('+')[0].replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
    return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Dogyptian';
  }, [id.session]);

  // bod 1 (iterácia 14): mobile sticky icon-only rail — keď .pta-hero vyscrolluje z viewportu
  // (IntersectionObserver), akčné tlačidlá sa "odtrhnú" z fotky a prilepia napravo (viď CSS
  // .pta-hero-actions.collapsed, scoped len ≤760px). Effect musí bežať aj po tom, čo `trail`
  // prejde z null→nájdený (heroRef sa naplní až vtedy), preto dep [trail?.id] nie [].
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([entry]) => setHeroCollapsed(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [trail?.id]);

  // bod 3 (iterácia 14): lightbox — index otvorenej fotky v trail.photos, null = zavreté
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // ★ wishlist → zámer popup (ak nie je uložený); walked → povinný walked popup. Odznačenie
  // = priame odobratie (aj hlas/plán). Rovnaká logika ako PackPortal.
  const toggleFav = (tid: string) => {
    if (favIds.has(tid)) {
      setFavIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setPlans((prev) => prev.filter((p) => p.tripId !== tid));
    } else {
      setWishlistPopupOpen(true);
    }
  };
  const toggleWalked = (tid: string) => {
    if (walkedIds.has(tid)) {
      setWalkedIds((prev) => { const n = new Set(prev); n.delete(tid); return n; });
      setVotes((prev) => { const n = { ...prev }; delete n[tid]; return n; });
    } else {
      setWalkedPopupOpen(true);
    }
  };
  const submitWalked = (v: WalkedInput) => {
    if (!trail) return;
    setVotes((prev) => ({ ...prev, [trail.id]: { tripId: trail.id, ...v, at: nowMs } }));
    setWalkedIds((prev) => { const n = new Set(prev); n.add(trail.id); return n; });
    setWalkedPopupOpen(false);
  };
  const addPlan = (intent: 'solo' | 'partner', date = '') => {
    if (!trail) return;
    setPlans((prev) => [{ tripId: trail.id, intent, date, at: nowMs }, ...prev.filter((p) => p.tripId !== trail.id)]);
  };
  const chooseSolo = () => {
    if (!trail) return;
    setFavIds((prev) => { const n = new Set(prev); n.add(trail.id); return n; });
    addPlan('solo');
    // TRIPLIST (Slice A): rename wishlist → triplist, star popup navyše upsertne triplist entry.
    upsertMyTrip(trail.id, { status: 'solo', openness: 'closed', date: '' });
    setWishlistPopupOpen(false);
  };
  const choosePartner = () => {
    if (!trail) return;
    setFavIds((prev) => { const n = new Set(prev); n.add(trail.id); return n; });
    addPlan('partner');
    upsertMyTrip(trail.id, { status: 'looking', openness: 'open', date: '' });
    setWishlistPopupOpen(false);
    setPartnerAdOpen(true);
  };
  const submitPartnerAd = (ad: PartnerAdInput) => {
    if (!trail) return;
    // partner inzerát je VŽDY public → Events (Matej 2026-07-22).
    const ev: PartnerEvent = {
      id: `ad-${nowMs}-${trail.id}`, tripId: trail.id, dates: ad.dates, month: ad.month,
      socialization: ad.socialization, host: `${firstName} & your dog`,
      at: nowMs, joinedByMe: true, seedGoing: 0,
    };
    setEvents((prev) => [ev, ...prev]);
    setPlans((prev) => prev.map((p) => (p.tripId === trail.id ? { ...p, date: ad.dates[0] ?? ad.month } : p)));
    setPartnerAdOpen(false);
  };

  const handleShare = async () => {
    if (!trail) return;
    const url = `${window.location.origin}/pack/portal/trips/${trail.id}`;
    const shareData = { title: trail.name, text: `${trail.name} — ${trail.km} km, ${trail.diff}`, url };
    if (typeof navigator.share === 'function') {
      try { await navigator.share(shareData); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: 'Link copied' });
    } catch {
      toast({ description: url });
    }
  };

  if (id.loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center relative" style={{ backgroundColor: T.pageBg }}>
        <HieroglyphBg />
        <div className="relative" style={{ zIndex: 1 }}>
          <div style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.3em', fontSize: 12, color: T.onDarkDim }}>
            {t('pack.layout.loading')}
          </div>
        </div>
      </div>
    );
  }
  if (!id.session) return null;

  if (!trail) {
    return (
      <div className="pta-notfound" style={{ backgroundColor: T.pageBg }}>
        <style>{CSS}</style>
        <div style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Trip not found</div>
        <button
          type="button"
          onClick={() => navigate('/pack/portal/trips')}
          style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD, background: 'none', border: 'none', cursor: 'pointer' }}
        >← Back to trips</button>
      </div>
    );
  }

  const cover = trail.photos[0];
  // crowd agregát (design §A) — konzistentné s kartami v PackPortal
  const agg = crowdAggregate(trail, votes[trail.id]);
  // bod 2 (iterácia 14): rovnaká chip-skladačka ako inline detail v PackPortal.tsx (acts + tags,
  // emoji prefix keď existuje mapovanie).
  const tripChips = [
    ...(trail.acts ?? []).map((a) => ({ key: `a:${a}`, label: a, emoji: ACT_EMOJI[a] ?? '' })),
    ...(trail.tags ?? []).map((tg) => ({ key: `t:${tg}`, label: tg, emoji: TAG_EMOJI[tg] ?? '' })),
  ];

  return (
    <div className="pta-root">
      <style>{CSS}</style>
      <style>{COMMUNITY_CSS}</style>
      <style>{GLASS_CSS}</style>
      {/* §16 (2026-07-23): heroglyf textúra ZA obsahom — bez nej glass panel nemá čo rozmazať
          (predtým holá čierna = „všetko na čiernej"). Rovnaké pozadie ako triplist/pack. */}
      <HieroglyphBg />

      <div className="pta-shell pk-glass">
      <div className="pta-hero" ref={heroRef} style={cover ? { backgroundImage: `url('${cover}')` } : undefined}>
        <div className="pta-hero-grad" />
        <button type="button" className="pta-back" onClick={() => navigate('/pack/portal/trips')} aria-label="Back to trips">←</button>
        {/* bod 1 (iterácia 14): WISHLIST/WALKED/SHARE presunuté sem (zo starého fixného
            spodného .pta-actions pruhu) — top-right ♡ zrušený, wishlist je len tu. */}
        <div className={`pta-hero-actions${heroCollapsed ? ' collapsed' : ''}`}>
          <button
            type="button"
            className={`pta-actbtn pta-actbtn--gold${favIds.has(trail.id) ? ' on' : ''}`}
            onClick={() => toggleFav(trail.id)}
          >
            <span className="pta-actbtn-icon">{favIds.has(trail.id) ? '♥' : '♡'}</span>
            <span className="pta-actbtn-label">{favIds.has(trail.id) ? 'In triplist' : 'Triplist'}</span>
          </button>
          <button
            type="button"
            className={`pta-actbtn pta-actbtn--ghost${walkedIds.has(trail.id) ? ' on' : ''}`}
            onClick={() => toggleWalked(trail.id)}
          >
            <span className="pta-actbtn-icon">🐾</span>
            <span className="pta-actbtn-label">{walkedIds.has(trail.id) ? 'Walked ✓' : 'Mark walked'}</span>
          </button>
          <button type="button" className="pta-actbtn pta-actbtn--ghost" onClick={handleShare}>
            <span className="pta-actbtn-icon"><img src={ICON('link')} alt="" style={{ width: 12, height: 12, filter: 'brightness(0) invert(1)', opacity: 0.8 }} /></span>
            <span className="pta-actbtn-label">Share</span>
          </button>
        </div>
      </div>

        <div className="pta-panel">
        <div className="pta-loc">{trail.region}{REGION_OF[trail.region] ? ` · ${REGION_OF[trail.region]}` : ''}</div>
        <div className="pta-title">{trail.name}</div>
        {/* bod 4 (iterácia 13): samostatný DiffMark+diff riadok pod titulom ZMAZANÝ —
            difficulty ostáva len v stat tabuľke nižšie (bolo 2×, teraz 1×). */}
        <div className="pta-author">by {authorOf(trail)}{agg.walkedCount - FOUNDER_WALKERS > 0 ? ` · +${agg.walkedCount - FOUNDER_WALKERS} Dogyptians` : ''}</div>

        {/* crowd agregát (design §A): rating = priemer, difficulty = konsenzus. */}
        <div className="pta-statrow">
          <div className="pta-stat"><b>{trail.km} km</b><span>Distance</span></div>
          <div className="pta-stat"><b><DiffMark diff={agg.difficulty} /> {agg.difficulty}</b><span>Difficulty</span></div>
          <div className="pta-stat"><b><RatingPaws stars={agg.rating} size={11} gap={2} /> {agg.rating.toFixed(1)}</b><span>Rating</span></div>
        </div>

        {/* bod 2 (iterácia 14): tagy + aktivity s emoji, POD stat tabuľkou */}
        {tripChips.length > 0 && (
          <div className="pta-tags">
            {tripChips.map((c) => <span key={c.key} className="pta-tag">{c.emoji ? `${c.emoji} ` : ''}{c.label}</span>)}
          </div>
        )}

        {trail.photos.length > 0 && (
          <div className="pta-gallery">
            {/* bod 3 (iterácia 14): klik na fotku → lightbox */}
            {trail.photos.map((p, i) => (
              <img key={i} src={p} alt="" loading="lazy" onClick={() => setLightboxIdx(i)} />
            ))}
          </div>
        )}

        {trail.desc && <p className="pta-desc">{trail.desc}</p>}
        {trail.dogNote && <p className="pta-dognote">🐾 {trail.dogNote}</p>}

        {/* §16 (2026-07-23): reviews + advice (rovnaká komponenta ako inline detail v PackPortal)
            NAD mapou — nahrádza starú spodnú „Comments" sekciu (zmazaná). walked/onRequestWalk
            napojené na tunajší walked-popup: keď trip nie je walked, CTA otvorí „you did it" popup. */}
        <TripComments
          tripId={trail.id}
          tripName={trail.name}
          walked={walkedIds.has(trail.id)}
          onMarkWalked={() => setWalkedIds((prev) => (prev.has(trail.id) ? prev : new Set(prev).add(trail.id)))}
          onRequestWalk={() => setWalkedPopupOpen(true)}
        />

        <div className="pta-mapwrap">
          {trail.path.length > 0 ? (
            <MapContainer
              center={trail.path[Math.floor(trail.path.length / 2)]}
              zoom={13} zoomControl={false} attributionControl={false} style={{ width: '100%', height: '100%' }}
            >
              <TileLayer url={mapyTiles('outdoor')} />
              <InvalidateSizeOnMount />
              {/* bod 1 (iterácia 17): article route mapa = trasa je vždy "tá" → plný AllTrails-
                  style čierno-zlatý casing (rovnaké dve vrstvy ako zvýraznená trasa v PackPortal). */}
              <Polyline positions={trail.path} pathOptions={{ color: '#0A0A0A', weight: 8, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />
              <Polyline positions={trail.path} pathOptions={{ color: '#F5C73D', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />
              <Marker position={trail.path[0]} icon={placeIcon('walk', true)} />
            </MapContainer>
          ) : (
            <div className="pta-mapempty">Route map coming soon</div>
          )}
        </div>

        <div className="pta-section">
          <h3>Walked by {agg.walkedCount} Dogyptian{agg.walkedCount === 1 ? '' : 's'}</h3>
          {agg.walkedCount === 0 && <div className="pta-empty">Be the first to walk this.</div>}
        </div>
        </div>
      </div>

      {/* bod 3 (iterácia 14): lightbox — fullscreen popup, tmavé pozadie, ✕ + prev/next */}
      {lightboxIdx !== null && (
        <div className="pta-lightbox" onClick={() => setLightboxIdx(null)}>
          <button type="button" className="pta-lightbox-close" onClick={() => setLightboxIdx(null)} aria-label="Close">×</button>
          {trail.photos.length > 1 && (
            <button
              type="button"
              className="pta-lightbox-nav pta-lightbox-prev"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => ((i ?? 0) - 1 + trail.photos.length) % trail.photos.length); }}
              aria-label="Previous photo"
            >‹</button>
          )}
          <img src={trail.photos[lightboxIdx]} alt="" onClick={(e) => e.stopPropagation()} />
          {trail.photos.length > 1 && (
            <button
              type="button"
              className="pta-lightbox-nav pta-lightbox-next"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => ((i ?? 0) + 1) % trail.photos.length); }}
              aria-label="Next photo"
            >›</button>
          )}
        </div>
      )}

      {/* ── KOMUNITNÉ modaly (rovnaké ako PackPortal) ── */}
      {walkedPopupOpen && (
        <WalkedPopup
          trailName={trail.name}
          initial={votes[trail.id] ? { rating: votes[trail.id].rating, difficulty: votes[trail.id].difficulty, vibe: votes[trail.id].vibe, comment: votes[trail.id].comment, when: votes[trail.id].when, hazards: votes[trail.id].hazards } : null}
          onSubmit={submitWalked}
          onClose={() => setWalkedPopupOpen(false)}
        />
      )}
      {wishlistPopupOpen && (
        <WishlistIntentPopup
          trailName={trail.name}
          onSolo={chooseSolo}
          onPartner={choosePartner}
          onClose={() => setWishlistPopupOpen(false)}
        />
      )}
      {partnerAdOpen && (
        <PartnerAdForm
          trailName={trail.name}
          onSubmit={submitPartnerAd}
          onClose={() => setPartnerAdOpen(false)}
        />
      )}

      <PackBottomNav />
    </div>
  );
}
