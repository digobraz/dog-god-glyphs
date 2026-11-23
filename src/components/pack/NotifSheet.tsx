// ── PANEL UPOZORNENÍ (CHVOST) — CEZ CELÚ STRANU (21. 10. 2026) ───────────────────
// Matej: „ten popup čo sa vysunie… je priehľadný a nie čitateľný = treba ho urobiť na liquid glass
// … cez celú šírku resp. celú stranu ako to má instagram po kliknutí na srdiečko… 1/4 strany
// statická a aktuálna, kde budú DOGYPT STATS… pod tým v riadkoch upozornenia… keď nebude nič,
// systémové ako má instagram… aby to nebolo od začiatku prázdne" → nad nákresom
// `plany/nakres-chvost-panel-2026-10-21.html`: „A je lepšie + rozklik, kde človek uvidí všetky
// štatistiky (tie čo sú teraz na homepage)".
//
// · SKLO = papyrus, nie tmavé sklo: Temple je len pozadie, text sedí na papyruse (brand v4.1).
// · STATS = statický blok (neroluje sa). Ťuk → všetky štatistiky = TEN ISTÝ `GlobePulse`
//   ako na homepage (planéta, míľniky, krajiny, pokladnica), nie kópia.
// · TIPY hovorí AINUBIS (oznamy appky = jeho šat, brand §AINUBIS). Každý tip sa MERIA
//   (DOG ID z dogEvents, výlety z tripShared, SNIFFER z assnif_settings) a zmizne sám, keď
//   je splnený — nikdy nie zoznam natvrdo.
import { AI_LOGO } from '@/components/pack/ainubis/3d/zaklad';
import type React from 'react';
import { forwardRef, lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton, BackIcon, backCircleCSS, backHoverCSS } from './BackButton';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, STAGE_CSS, FONT_UI, PROGRESS_CSS } from './packTheme';
import { LAPIS } from './navGoldSkin';
import { AINUBIS } from './ainubisSkin';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { getPackStats } from '@/lib/sharedFetch';
import { openAinubis } from '@/lib/ainubisBus';
import { IS_APP } from '@/lib/isApp';
import { BUDDY_LIVE, APP_NEW } from '@/lib/packFlags';
import { SysIcon } from './SysIcon';
import { supabase } from '@/integrations/supabase/client';
import ainubisHead from '@/assets/ainubis-head.webp';
import logo2026 from '@/assets/app/logo-2026.svg';
import { FRESH_NEWS } from '@/data/freshNews';
import { gridFetch, GRID_URL_ALL } from '@/lib/earlyFetch';
import { sizedUrl } from '@/services/cloudinaryService';
import { dogPagePath } from '@/lib/dogSlug';
import { countryISO2 } from '@/lib/countryGeo';
import { flagUrl } from '@/lib/flagUrl';

const StatsDetail = lazy(() => import('./StatsDetail').then((m) => ({ default: m.StatsDetail })));
// Oznam AINUBISA (26. 10. 2026, TEST_BUILD) — lenivo, ťahá zvitky a výlety; viď `AinubisOznam.tsx`.
const AinubisOznam = lazy(() => import('./AinubisOznam'));
// Záložky Práve pracujeme · Vízia · Hotovo (23. 11. 2026) — lenivo, ťahajú detail príspevku.
const NotifVizia = lazy(() => import('./vizia/NotifVizia'));

const DOG_NAME_FONT = "'Cinzel Decorative','Cinzel',serif";

const T = PACK_THEME;

type Stats = {
  dogs: number;
  total: number;
  last24h: number;
  last30d: number;
  topCountries: { country: string; count: number }[];
  topBreeds: { breed: string; count: number }[];
};

/** Ikonky tipov v šate Papyrus 3D (SysIcon, `public/icons/sys/`). */
const TIP_ICON: Record<string, string> = { dogid: 'dog-id', sniffer: 'pridaj-sniffer', trip: 'pridaj-vylet', test: 'ainubis' };

type Tip = { id: string; title: string; sub: string; cta: string; go: () => void };

// Tip „testuješ appku" nemá čo merať — zmizne, keď naň človek raz ťukne.
const TEST_TIP_KEY = 'dogypt_tip_test_done';

function useTips(open: boolean, close: () => void): Tip[] {
  const t = useT();
  const navigate = useNavigate();
  const [tips, setTips] = useState<Tip[]>([]);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const out: Tip[] = [];
      const go = (path: string) => () => { close(); navigate(path); };
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user?.id;

      // DOG ID — to isté percento ako pilulka na /pack/dogs (PROGRESS_STEPS + hasValue).
      if (uid) {
        try {
          const { data: dogs } = await supabase.from('dogs').select('id, dog_name, pack_number')
            .eq('user_id', uid).in('payment_status', ['paid', 'guest']).order('pack_number', { ascending: true });
          const dog = dogs?.[0];
          if (dog) {
            const [{ readLatestForDogs, hasValue }, { PROGRESS_STEPS }] = await Promise.all([
              import('@/lib/dogEvents'), import('./dogQuiz'),
            ]);
            const latest = (await readLatestForDogs([dog.id]))[dog.id] ?? {};
            const total = PROGRESS_STEPS.length;
            const filled = PROGRESS_STEPS.filter((st) => hasValue(latest[st.field])).length;
            const pct = total === 0 ? 100 : Math.round((filled / total) * 100);
            if (pct < 100) out.push({
              id: 'dogid', title: t('pack.notif.tip.dogid', { dog: dog.dog_name || '—', pct }),
              sub: t('pack.notif.tip.dogidSub'), cta: t('pack.notif.tip.dogidCta'), go: go('/pack/dogs'),
            });
          }
        } catch { /* tip sa len neukáže */ }
      }

      // SNIFFER — zapnutý = `assnif_settings.enabled`.
      if (BUDDY_LIVE && uid) {
        try {
          const { loadBuddySettings } = await import('./buddy/buddyGate');
          if (!(await loadBuddySettings()).enabled) out.push({
            id: 'sniffer', title: t('pack.notif.tip.sniffer'), sub: t('pack.notif.tip.snifferSub'),
            cta: t('pack.notif.tip.snifferCta'), go: go('/pack/sniffer'),
          });
        } catch { /* nič */ }
      }

      // VÝLET — rovnaký zdroj ako počty na /pack/profile.
      try {
        const { readLocalTrails, visibleLocalTrails } = await import('./tripShared');
        if (visibleLocalTrails(readLocalTrails()).length === 0) out.push({
          id: 'trip', title: t('pack.notif.tip.trip'), sub: t('pack.notif.tip.tripSub'),
          cta: t('pack.notif.tip.tripCta'), go: go('/pack/add/trip'),
        });
      } catch { /* nič */ }

      let testDone = false;
      try { testDone = localStorage.getItem(TEST_TIP_KEY) === '1'; } catch { /* súkromné okno */ }
      if (IS_APP && !testDone) out.push({
        id: 'test', title: t('pack.notif.tip.test'), sub: t('pack.notif.tip.testSub'), cta: t('pack.notif.tip.testCta'),
        go: () => { try { localStorage.setItem(TEST_TIP_KEY, '1'); } catch { /* nič */ } close(); openAinubis(); },
      });

      if (!cancelled) setTips(out);
    })();
    return () => { cancelled = true; };
  }, [open, close, navigate, t]);
  return tips;
}

// ── NAJNOVŠÍ PES NAMIESTO GLÓBU (21. 10. 2026) ──────────────────────────────────
// Matej: „fotka posledného psíka namiesto planéty… fotka v kruhu aj s číslom" → „ok sprav tú
// fotku namiesto glóbusu (najnovší člen), možno by som dal šípky po bokoch a človek by si
// mohol preklikávať". Zdroj = TEN ISTÝ verejný zoznam ako stena (`get-grid-dogs?tiers=all`,
// cez Cloudflare `/api/dogs`), nie vlastný dotaz na `dogs`. Číslo patrí psovi aj u hosťa;
// pes, ktorého fotku AINUBIS ešte neposúdil (`wall_pending`), sa tu neukáže nikdy.
type WallDog = { pack_number: number | null; dog_name: string | null; cloudinary_main_url: string | null; wall_pending?: boolean; country?: string | null };
type NewDog = { n: number; name: string; photo: string; iso: string | null };

function useNewestDogs(): NewDog[] {
  const [dogs, setDogs] = useState<NewDog[]>([]);
  useEffect(() => {
    let cancelled = false;
    gridFetch(GRID_URL_ALL).then((rows) => {
      if (cancelled) return;
      const out = (rows as WallDog[])
        .filter((d) => (d.pack_number ?? 0) > 0 && !d.wall_pending && !!d.cloudinary_main_url)
        .sort((a, b) => (b.pack_number ?? 0) - (a.pack_number ?? 0))
        .map((d) => ({ n: d.pack_number as number, name: d.dog_name || '—', photo: d.cloudinary_main_url as string, iso: d.country ? countryISO2(d.country) : null }));
      setDogs(out);
    }).catch(() => { /* blok ostane bez fotky, čísla fungujú ďalej */ });
    return () => { cancelled = true; };
  }, []);
  return dogs;
}

// ── VITAJ NOVÉHO ČLENA (23. 11. 2026, APP_NEW) ───────────────────────────────────
// Matej: karta s fotkou, #číslom, menom a tlačidlom Vitaj NAPRAVO; labka máva ako ruka. Ukáže sa najnovší pes, ktorý nie je môj
// a ktorého som ešte neprivítal (z tých troch najnovších, nech sa karta nevlečie k starým členom). Ťuk = `welcome_dog(n)`:
// človek, ktorému patrí pes, dostane upozornenie `dog_welcome`. Čo som privítal, drží server (`my_dog_welcomes`) a localStorage.
const WELCOMED_KEY = 'dogypt_welcomed_dogs';
const readWelcomedLocal = (): number[] => { try { return JSON.parse(localStorage.getItem(WELCOMED_KEY) || '[]') as number[]; } catch { return []; } };
const SHOW_NEWEST = 3;

function useWelcomeCandidate(newest: NewDog[]): { dog: NewDog | null; welcome: (n: number) => Promise<void>; hide: (n: number) => void } {
  const [mine, setMine] = useState<number[]>([]);
  const [welcomed, setWelcomed] = useState<number[]>(readWelcomedLocal);
  useEffect(() => {
    if (!APP_NEW) return;
    let cancelled = false;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user?.id;
      if (!uid) return;
      try {
        const { data: own } = await supabase.from('dogs').select('pack_number').eq('user_id', uid);
        if (!cancelled) setMine((own ?? []).map((d) => d.pack_number as number).filter(Boolean));
      } catch { /* karta sa len neskryje pred vlastným psom */ }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any).rpc('my_dog_welcomes');
        if (!cancelled && Array.isArray(data)) setWelcomed((w) => Array.from(new Set([...w, ...(data as number[])])));
      } catch { /* zostane localStorage */ }
    })();
    return () => { cancelled = true; };
  }, []);
  const hide = (n: number) => setWelcomed((w) => {
    const next = Array.from(new Set([...w, n]));
    try { localStorage.setItem(WELCOMED_KEY, JSON.stringify(next.slice(-200))); } catch { /* plné úložisko */ }
    return next;
  });
  const welcome = async (n: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { await (supabase as any).rpc('welcome_dog', { p_pack_number: n }); } catch { /* upozornenie sa nedoručí, človek to nevidí */ }
  };
  const dog = APP_NEW ? newest.filter((d) => !mine.includes(d.n)).slice(0, SHOW_NEWEST).find((d) => !welcomed.includes(d.n)) ?? null : null;
  return { dog, welcome, hide };
}

const CSS = `${PROGRESS_CSS}
.ntf-root{position:fixed;inset:0;z-index:2100;display:flex;justify-content:flex-end;}
.ntf-scrim{position:absolute;inset:0;background:rgba(0,0,0,0.32);animation:ntf-fade .3s ease both;}
.ntf-sheet{position:relative;width:100%;height:100%;display:flex;flex-direction:column;color:${T.inkStrong};
  --pk-stage:linear-gradient(180deg,rgba(251,245,230,0.86),rgba(242,229,197,0.80));
  animation:ntf-in .38s cubic-bezier(.2,.8,.2,1) both;}
@media (min-width:768px){.ntf-sheet{width:420px;}}
@keyframes ntf-in{from{transform:translateX(100%);}to{transform:none;}}
@keyframes ntf-fade{from{opacity:0;}to{opacity:1;}}
.ntf-top{display:flex;align-items:center;gap:${PACK_SPACE.md}px;padding:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.lg}px) ${PACK_SPACE.lg}px ${PACK_SPACE.sm}px;}
.ntf-ttl{flex:1;font-family:'Cinzel',serif;font-weight:700;font-size:${PACK_TEXT.lead}px;letter-spacing:.14em;text-transform:uppercase;}
.ntf-stats{position:relative;display:block;flex:0 0 auto;overflow:visible;container-type:inline-size;
  margin:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px 0;
  height:clamp(176px, 25dvh, 220px);width:calc(100% - ${PACK_SPACE.xxl}px);cursor:pointer;text-align:left;font:inherit;color:inherit;
  background:rgba(255,255,255,0.40);
  border:1px solid ${T.hairline};border-radius:${PACK_R.card}px;box-shadow:${PACK_SHADOW.card};transition:transform .15s ease;}
.ntf-stats:active{transform:scale(0.98);}
/* FOTKA NAJNOVŠIEHO PSA — ŠTVOREC cez celú výšku bloku (Matej 23. 10.: „dajme štvorcovú fotku…
   fotku zväčši cez celý blok"). Meno a číslo sedia NA fotke dole, na tmavom prechode. */
.ntf-dogwrap{position:absolute;z-index:2;left:0;top:0;bottom:0;aspect-ratio:1;max-width:58%;}
/* Pravý okraj fotky sa ROZPLYNIE do bloku, nie ostrý sek (Matej 23. 10.). */
.ntf-dog{position:relative;display:block;width:100%;height:100%;overflow:hidden;border:0;border-radius:${PACK_R.card}px 0 0 ${PACK_R.card}px;background:none;cursor:pointer;padding:0;touch-action:pan-y;
  -webkit-mask-image:linear-gradient(90deg,#000 62%,transparent);mask-image:linear-gradient(90deg,#000 62%,transparent);}
.ntf-dog img{width:100%;height:100%;object-fit:cover;display:block;animation:ntf-fade .3s ease both;}
.ntf-dog::after{content:'';position:absolute;left:0;right:0;bottom:0;height:46%;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.62));}
/* Odznak čísla — ten istý ako na homepage (HeroCard): lapis. */
.ntf-dog-cap{position:absolute;z-index:1;left:${PACK_SPACE.sm}px;right:${PACK_SPACE.sm}px;bottom:${PACK_SPACE.sm}px;display:flex;align-items:center;gap:${PACK_SPACE.sm}px;pointer-events:none;}
.ntf-dog-num{flex:0 0 auto;white-space:nowrap;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:${PACK_TEXT.label}px;letter-spacing:.02em;line-height:1;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;
  background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${T.hairline};box-shadow:${PACK_SHADOW.lift};}
/* Trojbodka NEEXISTUJE (brand v4.1) — meno psa sa radšej zalomí. */
.ntf-dog-name{min-width:0;overflow-wrap:anywhere;line-height:1.15;font-family:${DOG_NAME_FONT};font-weight:700;font-size:${PACK_TEXT.body}px;color:${T.card};}
.ntf-dog-new{position:absolute;z-index:1;left:${PACK_SPACE.sm}px;top:${PACK_SPACE.sm}px;pointer-events:none;white-space:nowrap;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;line-height:1;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;background:rgba(251,245,230,0.9);color:${T.inkStrong};border:1px solid ${T.hairline};}
.ntf-dog-flag{flex:0 0 auto;width:16px;height:16px;border-radius:${PACK_R.pill}px;object-fit:cover;border:1px solid ${T.card};}
/* Šípky = brandový kruh návratu na fotke (backCircleCSS scrim + BackIcon). Dozadu sedí na ĽAVOM
   okraji (Matej 23. 10.: „šípku čo je v strede daj na ľavú časť hranu a daj ju v brande"); dopredu sa
   objaví vpravo na fotke, až keď je kam. */
/* Menšie a BLEDÉ, nech nekričia (Matej 23. 10.) — papyrusový kruh návratu, 28 px namiesto 38. */
.ntf-arr{position:absolute;z-index:3;top:50%;transform:translateY(-50%);${backCircleCSS('pale')}width:28px;height:28px;}
.ntf-arr:hover{${backHoverCSS('pale')}}
.ntf-arr svg{width:12px;height:12px;}
/* Šípky na HRANICIACH, nie vo fotke (Matej 23. 10.): dozadu napoly cez ľavý okraj bloku,
   dopredu na konci prechodu, kde fotka končí v bloku — nie vo fotke. */
.ntf-arr--prev{left:0;transform:translate(-50%,-50%);}
.ntf-arr--next{left:100%;transform:translate(-50%,-50%);}
/* Celá hlava psa aj s nosom (Matej 23. 10.: „daj to logo nižšie, nech je vidno celá tvár aj nos“). */
.ntf-logo-clip{position:absolute;inset:0;z-index:1;overflow:hidden;border-radius:${PACK_R.card}px;pointer-events:none;}
/* +50 px doľava a +15 px nižšie, aby bol vidno celý nos ako na novej ikonke appky (Matej 23. 10.). */
.ntf-logo{position:absolute;z-index:1;right:calc(-14% + 35px);top:calc(-6% - 15px);width:calc(84% * 1.15);aspect-ratio:1;pointer-events:none;background:${T.inkStrong};opacity:.07;
  -webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;}
.ntf-nums{position:absolute;z-index:2;right:${PACK_SPACE.xxl}px;top:${PACK_SPACE.md}px;bottom:${PACK_SPACE.md}px;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;gap:${PACK_SPACE.xs}px;}
/* Počítadlo — písmo sa zmenšuje podľa POČTU ZNAKOV (--ntf-len), aby sa zmestilo aj „1 000 000".
   Farba = tmavý atrament papyrusu (Matej 23. 10.: lapis→zlatý gradient „nie sú v brande"). */
.ntf-num{display:flex;align-items:baseline;gap:${PACK_SPACE.sm}px;}
.ntf-num b{color:${T.inkStrong};font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:min(48px, calc(40cqw / var(--ntf-len, 3)));letter-spacing:.02em;line-height:1;white-space:nowrap;}
.ntf-num span{font-size:${PACK_TEXT.label}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
/* BEŽIACI PÁS — NAD blokom (Matej 23. 10.), nie v ňom. */
.ntf-tick{position:relative;flex:0 0 auto;display:block;overflow:hidden;margin:${PACK_SPACE.sm}px 0 0;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 ${PACK_SPACE.lg}px,#000 calc(100% - ${PACK_SPACE.lg}px),transparent);
  mask-image:linear-gradient(90deg,transparent,#000 ${PACK_SPACE.lg}px,#000 calc(100% - ${PACK_SPACE.lg}px),transparent);}
.ntf-tick-track{display:flex;gap:${PACK_SPACE.sm}px;padding:0 ${PACK_SPACE.sm}px 0 ${PACK_SPACE.lg}px;width:max-content;animation:ntf-tick var(--ntf-tick-s,24s) linear infinite;}
.ntf-tick:hover .ntf-tick-track{animation-play-state:paused;}
.ntf-pill{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;height:28px;padding:0 ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  font-size:${PACK_TEXT.label}px;white-space:nowrap;border:1px solid ${T.hairline};background:rgba(251,245,230,0.78);color:inherit;font-family:inherit;}
.ntf-pill b{font-weight:600;}
.ntf-pill--up{background:rgba(61,122,78,0.12);border-color:rgba(61,122,78,0.35);}
.ntf-pill--up b{color:${T.growGreen};}
.ntf-pill--lapis{background:${LAPIS.fill};border-color:rgba(22,48,122,0.30);}
.ntf-pill--lapis b{color:${LAPIS.edge};}
.ntf-pill--gold{background:rgba(201,154,63,0.16);border-color:rgba(201,154,63,0.45);}
.ntf-pill--gold b{color:#8A6420;}
.ntf-pill--news{background:rgba(91,224,240,0.12);border-color:rgba(91,224,240,0.45);}
.ntf-pill--news{cursor:pointer;}
.ntf-pill--news i{width:8px;height:8px;border-radius:${PACK_R.pill}px;background:${AINUBIS.cyan};box-shadow:0 0 6px ${AINUBIS.cyan};}
@keyframes ntf-tick{from{transform:translateX(0);}to{transform:translateX(-50%);}}
@media (prefers-reduced-motion:reduce){.ntf-tick-track{animation:none;flex-wrap:wrap;width:auto;}.ntf-tick-track [aria-hidden]{display:none;}}
.ntf-list{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.xl}px);display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.ntf-sec{font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};margin-top:${PACK_SPACE.sm}px;}
.ntf-row{display:flex;gap:${PACK_SPACE.md}px;align-items:center;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:rgba(251,245,230,0.78);border:1px solid ${T.hairline};}
.ntf-real{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.ntf-real ul{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;margin:0;padding:0;list-style:none;}
.ntf-real li{padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:rgba(251,245,230,0.78);border:1px solid ${T.hairline};}
/* Riadok AINUBISA (odpoveď pod citátom, 27. 10.) nesie vlastný tmavý šat — papyrusový rám okolo by ho zdvojil. */
.ntf-real li.ntf-li-ai{padding:0;background:none;border:0;}
.ntf-real li.ntf-li-sec{padding:0;background:none;border:0;}
.ntf-real li.ntf-li-sec .ntf-sec{margin-top:0;}
/* AINUBIS riadky v JEHO tmavom brande (Matej 26. 10.: „ak sa jedná o ainubisa, musí byť v jeho tmavom brande… nie v bledom") — oznam aj „Pre teba". */
.ntf-row--ai{background:${AINUBIS.surfaceBase};border-color:${AINUBIS.edge};color:${AINUBIS.ink};}
.ntf-row--ai .ntf-txt small{color:${AINUBIS.inkDim};}
.ntf-row--ai .ntf-ai{color:${AINUBIS.ink};}
.ntf-row--ai .ntf-ai span{-webkit-text-stroke:0;text-shadow:${AINUBIS.aiShadow};}
.ntf-row--ai .ntf-cta{background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};box-shadow:${AINUBIS.ctaShadow};}
.ntf-av{flex:0 0 auto;width:40px;height:40px;border-radius:${PACK_R.pill}px;background:${AINUBIS.faceBg};box-shadow:${AINUBIS.faceRing};display:grid;place-items:center;overflow:hidden;}
.ntf-av img{height:78%;width:auto;}
.ntf-txt{flex:1;min-width:0;font-size:${PACK_TEXT.body}px;line-height:1.35;}
.ntf-txt small{display:block;font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.ntf-ai{font-weight:600;color:${T.inkStrong};}
.ntf-ai span{color:${AINUBIS.aiInk};-webkit-text-stroke:0.4px #0B3A44;}
.ntf-cta{flex:0 0 auto;font-family:'Cinzel',serif;font-weight:700;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;background:${LAPIS.grad};color:${LAPIS.ink};border:none;cursor:pointer;white-space:nowrap;}
.ntf-empty{font-size:${PACK_TEXT.label}px;color:${T.inkDim};text-align:center;padding:${PACK_SPACE.sm}px;}
.ntf-history{align-self:center;background:none;border:0;cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};padding:${PACK_SPACE.md}px;}
.ntf-all{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.xl}px);}
${STAGE_CSS}`;

/** `oznam` = riadok AINUBISA navrchu zoznamu (TEST_BUILD); `grown` = koľko psov pribudlo od poslednej návštevy.
 *  `history` (5. 11. 2026, TEST_BUILD): staré upozornenia a tipy sú zložené za malým textom; `has` = je čo ukázať okrem tipov. */
type Props = { onClose: () => void; children?: React.ReactNode; hasReal: boolean; oznam?: { grown: number }; history?: { has: boolean; open: boolean; onOpen: () => void } };

export const NotifSheet = forwardRef<HTMLDivElement, Props>(function NotifSheet({ onClose, children, hasReal, oznam, history }, ref) {
  const t = useT();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [view, setView] = useState<'list' | 'stats'>('list');
  const allTips = useTips(true, onClose);
  const folded = !!history && !history.open;
  const tips = folded ? [] : allTips;
  const showOznam = !!oznam && oznam.grown > 0;
  const newest = useNewestDogs();
  const wc = useWelcomeCandidate(newest);
  const [tab, setTab] = useState<'alerts' | 'wip' | 'plan' | 'done'>('alerts');
  const [paused, setPaused] = useState(false);
  const [thx, setThx] = useState<number | null>(null);
  const [gone, setGone] = useState<number | null>(null);
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const [di, setDi] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const cur = newest[di];
  const step = (d: number) => setDi((i) => Math.min(Math.max(i + d, 0), Math.max(newest.length - 1, 0)));
  // Načíta sa len susedná fotka, nie celá stena — Cloudinary kvóta (pamäť cloudinary_platba_roboty).
  useEffect(() => {
    for (const k of [di - 1, di + 1]) { const d = newest[k]; if (d) new Image().src = sizedUrl(d.photo, 400); }
  }, [di, newest]);

  useEffect(() => { getPackStats<Stats>().then(setStats).catch(() => {}); }, []);
  // Stránka pod panelom sa nesmie rolovať (inak na iPhone „ťahá" celé okno).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const fmt = (n: number) => n.toLocaleString(intlLocale(lang));
  const dogs = stats?.dogs ?? stats?.total ?? 0;
  const numLen = Math.max(3, fmt(dogs).length, fmt(stats?.total ?? 0).length);
  // BEŽIACI PÁS „FRESH NEWS" (Matej 21. 10.: „aspoň 3 neustále rotovať v loope ako pri hlavných
  // správach") — rýchle štatistiky + naše oznamy (`data/freshNews.ts`, cyan bodka = hlas AINUBISa).
  const today = new Date().toISOString().slice(0, 10);
  const news = FRESH_NEWS.filter((n) => !n.until || n.until >= today);
  const lk = (lang === 'sk' || lang === 'cs') ? lang : 'en';
  const pillsOld: React.ReactNode[] = stats ? [
    ...news.map((n) => (
      <button key={`n-${n.id}`} type="button" className="ntf-pill ntf-pill--news"
        onClick={(e) => { e.stopPropagation(); if (n.href) { onClose(); navigate(n.href); } }}>
        <i aria-hidden />{n.text[lk] ?? n.text.en}
      </button>
    )),
    <span key="m" className="ntf-pill ntf-pill--up"><b>+{fmt(stats.last30d)}</b>{t('pack.notif.perMonth')}</span>,
    <span key="c" className="ntf-pill ntf-pill--lapis"><b>{fmt(stats.topCountries.length)}</b>{t('pack.notif.countries')}</span>,
    ...(stats.last24h > 0 ? [<span key="d" className="ntf-pill ntf-pill--up"><b>+{fmt(stats.last24h)}</b>{t('pack.notif.today')}</span>] : []),
    <span key="k" className="ntf-pill ntf-pill--gold"><b>{(dogs / 10_000).toLocaleString(intlLocale(lang), { maximumFractionDigits: 2 })} %</b>{t('pack.notif.toMillion')}</span>,
    ...(stats.topCountries[0] ? [<span key="t" className="ntf-pill ntf-pill--lapis"><b>{fmt(stats.topCountries[0].count)}</b>{stats.topCountries[0].country}</span>] : []),
  ] : [];
  const pi = (src: string) => <img src={src} alt="" draggable={false} />;
  // FAREBNÉ PILULKY (23. 11. 2026): zlatá = psy a míľnik, lapis = krajiny, zelená = prírastok, cyan = oznam AINUBISA. Ťuk = zastaví / pustí točenie.
  const pillsNew: React.ReactNode[] = stats ? [
    <span key="dg" className="ntf-pill ntf-pill--gold">{pi('/icons/kruhy/all.webp')}<b>{fmt(dogs)}</b>{t('pack.notif.dogsWord')}</span>,
    ...news.map((n) => (
      <span key={`n-${n.id}`} className="ntf-pill ntf-pill--news" onClick={() => { if (n.href) { onClose(); navigate(n.href); } }}>
        {pi('/icons/sys/ainubis.webp')}{n.text[lk] ?? n.text.en}
      </span>
    )),
    <span key="m" className="ntf-pill ntf-pill--up">{pi('/icons/sys/fajka-zelena.webp')}<b>+{fmt(stats.last30d)}</b>{t('pack.notif.perMonth')}</span>,
    <span key="c" className="ntf-pill ntf-pill--lapis">{pi('/icons/sys/poloha.webp')}<b>{fmt(stats.topCountries.length)}</b>{t('pack.notif.countries')}</span>,
    ...(stats.last24h > 0 ? [<span key="d" className="ntf-pill ntf-pill--up">{pi('/icons/sys/fajka-zelena.webp')}<b>+{fmt(stats.last24h)}</b>{t('pack.notif.today')}</span>] : []),
    <span key="k" className="ntf-pill ntf-pill--gold">{pi('/icons/sys/trofej.webp')}<b>{(dogs / 10_000).toLocaleString(intlLocale(lang), { maximumFractionDigits: 2 })} %</b>{t('pack.notif.toMillion')}</span>,
    ...(stats.topCountries[0] ? [<span key="t" className="ntf-pill ntf-pill--lapis">{pi('/icons/sys/poloha.webp')}<b>{fmt(stats.topCountries[0].count)}</b>{stats.topCountries[0].country}</span>] : []),
  ] : [];
  const pills = APP_NEW ? pillsNew : pillsOld;

  return (
    <div className="ntf-root" role="dialog" aria-modal="true" aria-label={t('pack.notif.sheetTitle')}>
      <style>{CSS}</style>
      <div className="ntf-scrim" onClick={onClose} />
      <div ref={ref} className={`ntf-sheet pk-stage${APP_NEW && view === 'list' ? ' ntf-compact' : ''}`}>
        <div className="ntf-top">
          {/* Brandová šípka (`BackButton`), chvost v hlavičke zanikol (Matej 23. 10.: „šípka dozadu nie je
              v brande a ten chvost daj preč na tom paneli ho netreba"). */}
          <BackButton tone="pale" label={t('pack.notif.back')}
            onClick={() => (view === 'stats' ? setView('list') : onClose())} />
          <span className="ntf-ttl">{view === 'stats' ? t('pack.notif.allStats') : t('pack.notif.sheetTitle')}</span>
        </div>

        {view === 'stats' ? (
          <div className="ntf-all">
            {/* Jedna obrazovka bez scrollu — nákres štatistík 23. 10. (A + rebríček z B). */}
            <Suspense fallback={null}>
              <StatsDetail stats={stats} />
            </Suspense>
          </div>
        ) : (
          <>

            {/* BEŽIACI PÁS NAD blokom (Matej 23. 10.: „tie rotujúce pills dáme nad tento blok hore"). */}
            {pills.length > 0 && (
              <div className={`ntf-tick${paused ? ' is-paused' : ''}`} style={{ ['--ntf-tick-s' as string]: `${Math.max(16, pills.length * 5)}s` }}
                onClick={APP_NEW ? () => setPaused((p) => !p) : undefined}>
                {/* Dve kópie za sebou — posun o -50 % je presne jedna kópia, takže slučka nemá švík. */}
                <span className="ntf-tick-track">
                  {pills}
                  <span aria-hidden style={{ display: 'contents' }}>{pills}</span>
                </span>
              </div>
            )}
            {/* BLOK = dvere do všetkých štatistík. Max 1/4 výšky (Matej 21. 10.). */}
            {!APP_NEW && <div className="ntf-stats" role="button" tabIndex={0} aria-label={t('pack.notif.allStats')}
              onClick={() => setView('stats')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setView('stats'); }}>
              {/* Ťuk na fotku = karta psa, ťuk na zvyšok bloku = všetky štatistiky. Švih = ďalší pes. */}
              {cur && (
                <span className="ntf-dogwrap">
                  <button type="button" className="ntf-dog" aria-label={`#${cur.n} ${cur.name}`}
                    onClick={(e) => { e.stopPropagation(); onClose(); navigate(dogPagePath(cur.name, cur.n)); }}
                    onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                      if (touchX === null) return;
                      const dx = e.changedTouches[0].clientX - touchX;
                      setTouchX(null);
                      if (Math.abs(dx) > 40) { e.preventDefault(); step(dx < 0 ? 1 : -1); }
                    }}>
                    <img key={cur.n} src={sizedUrl(cur.photo, 400)} alt="" />
                  </button>
                  {/* Štítok len pri najnovšom psovi (Matej 23. 10.: „hore na fotke psa by som dal že najnovší prírastok"). */}
                  {di === 0 && <span className="ntf-dog-new">{t('pack.notif.newest')}</span>}
                  <span className="ntf-dog-cap">
                    <span className="ntf-dog-num">#{cur.n}</span>
                    <span className="ntf-dog-name">{cur.name}</span>
                    {cur.iso && <img className="ntf-dog-flag" src={flagUrl(cur.iso.toLowerCase())} alt="" />}
                  </span>
                  {di < newest.length - 1 && (
                    <button type="button" className="ntf-arr ntf-arr--prev" aria-label={t('pack.notif.olderDog')}
                      onClick={(e) => { e.stopPropagation(); step(1); }}><BackIcon /></button>
                  )}
                  {di > 0 && (
                    <button type="button" className="ntf-arr ntf-arr--next" aria-label={t('pack.notif.newerDog')}
                      onClick={(e) => { e.stopPropagation(); step(-1); }}><BackIcon style={{ transform: 'scaleX(-1)' }} /></button>
                  )}
                </span>
              )}
              {/* Za číslami priesvitná SILUETA loga, priblížený výrez (Matej 23. 10.: „namiesto toho daj priehľadné
                  logo dogyptu za tie čísla… zoomni ho = nemusí byť celé, skôr detail loga"). */}
              <span className="ntf-logo-clip" aria-hidden><span className="ntf-logo" style={{ WebkitMaskImage: `url(${logo2026})`, maskImage: `url(${logo2026})` }} /></span>
              {/* Najvýraznejšie: psy a ľudia, pod sebou (Matej 21. 10.). */}
              <span className="ntf-nums" style={{ ['--ntf-len' as string]: numLen }}>
                <span className="ntf-num"><b>{stats ? fmt(dogs) : '—'}</b><span>{t('pack.notif.dogsWord')}</span></span>
                <span className="ntf-num"><b>{stats ? fmt(stats.total) : '—'}</b><span>{t('pack.notif.peopleWord')}</span></span>
              </span>
            </div>}
            {/* ZÁLOŽKY (23. 11. 2026): Upozornenia · Práve pracujeme · Vízia · Hotovo (bez čísla). */}
            {APP_NEW && (
              <div className="ntf-tabs" role="tablist">
                {([['alerts', 'pack.notif.tab.alerts', 'Notifications'], ['wip', 'pack.notif.tab.wip', 'Working on now'], ['plan', 'pack.notif.tab.vision', 'Vision'], ['done', 'pack.notif.tab.done', 'Done']] as const).map(([k, key, fb]) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{tx(key, fb)}</button>
                ))}
              </div>
            )}
            <div className="ntf-list">
              {APP_NEW && tab !== 'alerts' && <Suspense fallback={null}><NotifVizia kind={tab} /></Suspense>}
              {APP_NEW && tab === 'alerts' && wc.dog && (
                <div className={`ntf-wel${thx === wc.dog.n ? ' thx' : ''}${gone === -wc.dog.n ? ' done' : ''}`}>
                  <button type="button" className="ntf-wel-ph" aria-label={`#${wc.dog.n} ${wc.dog.name}`}
                    onClick={() => { onClose(); navigate(dogPagePath(wc.dog!.name, wc.dog!.n)); }}>
                    <img src={sizedUrl(wc.dog.photo, 200)} alt="" /><b>#{wc.dog.n}</b>
                  </button>
                  <span className="ntf-wel-tx">
                    <span className="ntf-wel-nm">{wc.dog.name}</span>
                    <small>{tx('pack.notif.welcome.new', 'New in the pack')}</small>
                    <span className="ntf-wel-ok">{tx('pack.notif.welcome.thx', 'Welcomed. Your paw is on its way.')}</span>
                  </span>
                  <button type="button" className="ntf-wel-btn" disabled={thx === wc.dog.n}
                    onClick={() => {
                      const n = wc.dog!.n;
                      setThx(n);
                      void wc.welcome(n);
                      setTimeout(() => setGone(-n), 1300);
                      setTimeout(() => { wc.hide(n); setThx(null); setGone(null); }, 2000);
                    }}>
                    <img src="/icons/sys/hodnotenie-packa.webp" alt="" draggable={false} />{tx('pack.notif.welcome.btn', 'Welcome')}
                  </button>
                </div>
              )}
              {APP_NEW && tab !== 'alerts' ? null : <>
              {showOznam && <Suspense fallback={null}><AinubisOznam grown={oznam.grown} onClose={onClose} /></Suspense>}
              {hasReal && <div className="ntf-real">{children}</div>}
              {tips.length > 0 && <div className="ntf-sec">{t('pack.notif.forYou')}</div>}
              {/* Papyrus 3D (hárok K5): tip je papierová karta s ikonkou z továrne a akciou vpravo, nie riadok AINUBISA. */}
              {APP_NEW && tips.map((tip) => (
                <div key={tip.id} className={`ntf-row ntf-row--tip ntf-tip-${tip.id}`}>
                  <SysIcon name={TIP_ICON[tip.id] ?? 'ainubis'} size={46} />
                  <span className="ntf-txt">{tip.title}<small>{tip.sub}</small></span>
                  <button type="button" className="ntf-act" onClick={tip.go}>{tip.cta}</button>
                </div>
              ))}
              {!APP_NEW && tips.map((tip) => (
                <div key={tip.id} className="ntf-row ntf-row--ai">
                  <span className="ntf-av"><img src={APP_NEW ? AI_LOGO : ainubisHead} alt="" /></span>
                  <span className="ntf-txt">
                    <span className="ntf-ai"><span>AI</span>NUBIS</span> · {tip.title}
                    <small>{tip.sub}</small>
                  </span>
                  <button type="button" className="ntf-cta" onClick={tip.go}>{tip.cta}</button>
                </div>
              ))}
              {folded && (history.has || allTips.length > 0) && (
                <button type="button" className="ntf-history" onClick={history.onOpen}>{t('pack.alerts.history')}</button>
              )}
              {!hasReal && !showOznam && tips.length === 0 && !(folded && (history.has || allTips.length > 0)) && <div className="ntf-empty">{t('pack.notif.allClear')}</div>}
              {APP_NEW && <button type="button" className="ntf-history ntf-allstats" onClick={() => setView('stats')}>{t('pack.notif.allStats')}</button>}
              </>}
            </div>
          </>
        )}
      </div>
    </div>
  );
});
