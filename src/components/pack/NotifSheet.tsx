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
import type React from 'react';
import { forwardRef, lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandTail } from './HandIcons';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, STAGE_CSS, BLURFADE_CSS } from './packTheme';
import { LAPIS } from './navGoldSkin';
import { AINUBIS } from './ainubisSkin';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { getPackStats } from '@/lib/sharedFetch';
import { openAinubis } from '@/lib/ainubisBus';
import { IS_APP } from '@/lib/isApp';
import { BUDDY_LIVE } from '@/lib/packFlags';
import { supabase } from '@/integrations/supabase/client';
import ainubisHead from '@/assets/ainubis-head.webp';
import dogSilhouette from '@/assets/dogypt-logo-mobile.webp';
import { FRESH_NEWS } from '@/data/freshNews';

const GlobePulse = lazy(() => import('./GlobePulse').then((m) => ({ default: m.GlobePulse })));
// Ten istý glóbus ako v štatistikách (Matej 21. 10.: „planétku daj preč… skôr by tam mohla byť tá, čo je teraz v stats pri detaile").
const PackGlobe = lazy(() => import('./GlobePulse').then((m) => ({ default: m.PackGlobe })));

const T = PACK_THEME;

type Stats = {
  dogs: number;
  total: number;
  last24h: number;
  last30d: number;
  topCountries: { country: string; count: number }[];
  topBreeds: { breed: string; count: number }[];
};

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
            .eq('user_id', uid).eq('payment_status', 'paid').order('pack_number', { ascending: true });
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

const CSS = `
.ntf-root{position:fixed;inset:0;z-index:2100;display:flex;justify-content:flex-end;}
.ntf-scrim{position:absolute;inset:0;background:rgba(0,0,0,0.32);animation:ntf-fade .3s ease both;}
.ntf-sheet{position:relative;width:100%;height:100%;display:flex;flex-direction:column;color:${T.inkStrong};
  --pk-stage:linear-gradient(180deg,rgba(251,245,230,0.86),rgba(242,229,197,0.80));
  animation:ntf-in .38s cubic-bezier(.2,.8,.2,1) both;}
@media (min-width:768px){.ntf-sheet{width:420px;}}
@keyframes ntf-in{from{transform:translateX(100%);}to{transform:none;}}
@keyframes ntf-fade{from{opacity:0;}to{opacity:1;}}
.ntf-top{display:flex;align-items:center;gap:${PACK_SPACE.md}px;padding:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.lg}px) ${PACK_SPACE.lg}px ${PACK_SPACE.sm}px;}
.ntf-back{width:32px;height:32px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;border:1.5px solid ${T.hairline};background:none;color:${LAPIS.edge};cursor:pointer;font-size:${PACK_TEXT.lead}px;line-height:1;}
.ntf-ttl{flex:1;font-family:'Cinzel',serif;font-weight:700;font-size:${PACK_TEXT.lead}px;letter-spacing:.14em;text-transform:uppercase;}
.ntf-tail{width:40px;height:40px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};}
.ntf-stats{position:relative;display:block;flex:0 0 auto;overflow:hidden;container-type:inline-size;
  margin:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px 0;
  height:25dvh;min-height:176px;width:calc(100% - ${PACK_SPACE.xxl}px);cursor:pointer;text-align:left;font:inherit;color:inherit;
  background:
    radial-gradient(120% 90% at 100% 0%, rgba(16,52,166,0.16) 0%, rgba(16,52,166,0) 55%),
    radial-gradient(90% 80% at 0% 100%, rgba(201,154,63,0.30) 0%, rgba(201,154,63,0) 60%),
    rgba(255,255,255,0.40);
  border:1px solid ${T.hairline};border-radius:${PACK_R.card}px;box-shadow:${PACK_SHADOW.card};transition:transform .15s ease;}
.ntf-stats:active{transform:scale(0.98);}
/* GLÓBUS ZREZANÝ OKRAJOM (Matej 21. 10.: „zväčšiť tak, že bude zrezaná a bude smerovať za okraje
   ľavej aj spodnej strany, vrch bude vidno a bude tesne pod horným okrajom" → „ešte zväčši").
   Rozmer zo ŠÍRKY BLOKU (cqw), nie z okna — lock pack-dizajn-system §plynulý stupeň. */
.ntf-globe{position:absolute;left:-34cqw;top:-7cqw;width:96cqw;height:96cqw;}
.ntf-stats .pk-blurfade{height:46%;z-index:1;}
.ntf-nums{position:absolute;z-index:2;right:${PACK_SPACE.xxl}px;top:${PACK_SPACE.sm}px;bottom:52px;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;gap:${PACK_SPACE.xs}px;}
/* Počítadlo nad stupnicou PACK_TEXT — ten istý precedens ako počítadlo glóbu na homepage
   (GlobePulse, clamp 40–58 px). Matej: „psy a ľudia… max veľkosti", slovo VEDĽA čísla,
   a „zachvíľku tam bude 1000, 10 000 až 1 000 000, prispôsob to tomu" → písmo sa zmenšuje
   podľa POČTU ZNAKOV (--ntf-len), takže aj „1 000 000" sa zmestí na 360 px. Obe čísla
   dostanú dĺžku dlhšieho, aby boli rovnako veľké. */
.ntf-num{display:flex;align-items:baseline;gap:${PACK_SPACE.sm}px;}
.ntf-num b{background:linear-gradient(135deg,#1034A6 0%,#16307A 45%,#C99A3F 100%);-webkit-background-clip:text;background-clip:text;color:transparent;font-family:'Cinzel',serif;font-weight:700;font-size:min(48px, calc(64cqw / var(--ntf-len, 3)));letter-spacing:.02em;line-height:1;white-space:nowrap;}
.ntf-num span{font-size:${PACK_TEXT.label}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};}
.ntf-logo{position:absolute;left:30%;top:8%;width:56%;height:56%;z-index:1;display:grid;place-items:center;pointer-events:none;}
.ntf-logo img{width:100%;height:auto;opacity:0.16;filter:grayscale(1) brightness(0);}
.ntf-tick{position:absolute;z-index:3;left:0;right:0;bottom:${PACK_SPACE.md}px;display:block;overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 ${PACK_SPACE.lg}px,#000 calc(100% - ${PACK_SPACE.lg}px),transparent);
  mask-image:linear-gradient(90deg,transparent,#000 ${PACK_SPACE.lg}px,#000 calc(100% - ${PACK_SPACE.lg}px),transparent);}
.ntf-tick-track{display:flex;gap:${PACK_SPACE.sm}px;padding-right:${PACK_SPACE.sm}px;width:max-content;animation:ntf-tick var(--ntf-tick-s,24s) linear infinite;}
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
.ntf-chev{position:absolute;z-index:2;top:${PACK_SPACE.sm}px;right:${PACK_SPACE.md}px;color:${LAPIS.edge};font-size:${PACK_TEXT.h2}px;}
.ntf-list{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.xl}px);display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.ntf-sec{font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};margin-top:${PACK_SPACE.sm}px;}
.ntf-row{display:flex;gap:${PACK_SPACE.md}px;align-items:center;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:rgba(251,245,230,0.78);border:1px solid ${T.hairline};}
.ntf-real{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.ntf-real ul{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;margin:0;padding:0;list-style:none;}
.ntf-real li{padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:rgba(251,245,230,0.78);border:1px solid ${T.hairline};}
.ntf-av{flex:0 0 auto;width:40px;height:40px;border-radius:${PACK_R.pill}px;background:${AINUBIS.faceBg};box-shadow:${AINUBIS.faceRing};display:grid;place-items:center;overflow:hidden;}
.ntf-av img{height:78%;width:auto;}
.ntf-txt{flex:1;min-width:0;font-size:${PACK_TEXT.body}px;line-height:1.35;}
.ntf-txt small{display:block;font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.ntf-ai{font-weight:600;color:${T.inkStrong};}
.ntf-ai span{color:${AINUBIS.aiInk};-webkit-text-stroke:0.4px #0B3A44;}
.ntf-cta{flex:0 0 auto;font-family:'Cinzel',serif;font-weight:700;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;background:${LAPIS.grad};color:${LAPIS.ink};border:none;cursor:pointer;white-space:nowrap;}
.ntf-empty{font-size:${PACK_TEXT.label}px;color:${T.inkDim};text-align:center;padding:${PACK_SPACE.sm}px;}
.ntf-all{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.xl}px);}
${STAGE_CSS}${BLURFADE_CSS}`;

type Props = { onClose: () => void; children?: React.ReactNode; hasReal: boolean };

export const NotifSheet = forwardRef<HTMLDivElement, Props>(function NotifSheet({ onClose, children, hasReal }, ref) {
  const t = useT();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [view, setView] = useState<'list' | 'stats'>('list');
  const tips = useTips(true, onClose);

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
  const pills: React.ReactNode[] = stats ? [
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

  return (
    <div className="ntf-root" role="dialog" aria-modal="true" aria-label={t('pack.notif.sheetTitle')}>
      <style>{CSS}</style>
      <div className="ntf-scrim" onClick={onClose} />
      <div ref={ref} className="ntf-sheet pk-stage">
        <div className="ntf-top">
          <button type="button" className="ntf-back" aria-label={t('pack.notif.back')}
            onClick={() => (view === 'stats' ? setView('list') : onClose())}>&#8592;</button>
          <span className="ntf-ttl">{view === 'stats' ? t('pack.notif.allStats') : t('pack.notif.sheetTitle')}</span>
          <span className="ntf-tail"><HandTail size={22} className="ntf-wag" style={{ color: T.inkStrong }} /></span>
        </div>

        {view === 'stats' ? (
          <div className="ntf-all">
            <Suspense fallback={null}>
              <GlobePulse total={dogs} topCountries={stats?.topCountries ?? []} topBreeds={stats?.topBreeds ?? []} />
            </Suspense>
          </div>
        ) : (
          <>

            {/* ŠTATISTIKY HORE (21. 10. 2026) — skúšané aj dole, Matej: „vieš čo daj to predsa len
                hore". Max 1/4 výšky (Matej). */}
            {/* BLOK = dvere do všetkých štatistík. Pás pod ním je SÚČASŤ bloku, ale oznam v ňom
                vedie na vlastný príspevok — preto blok nie je <button> (tlačidlo v tlačidle). */}
            <div className="ntf-stats" role="button" tabIndex={0} aria-label={t('pack.notif.allStats')}
              onClick={() => setView('stats')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setView('stats'); }}>
              <span className="ntf-globe">
                <Suspense fallback={null}><PackGlobe topCountries={stats?.topCountries ?? []} /></Suspense>
                {/* Silueta DOGYPTU na glóbe — priehľadný vodoznak bez nápisu, ten istý ako v D-BLOKU
                  KOMUNITA na homepage (Matej 21. 10.: „logo daj priehľadné ako je teraz v dbloku komunita"). */}
                <span className="ntf-logo"><img src={dogSilhouette} alt="" /></span>
              </span>
              {/* Spodok glóbu sa rozplynie (Matej 21. 10.: „spodnú časť rozmaž nejak takto"). */}
              <span className="pk-blurfade" aria-hidden />
              {/* Najvýraznejšie: psy a ľudia, pod sebou (Matej 21. 10.). */}
              <span className="ntf-nums" style={{ ['--ntf-len' as string]: numLen }}>
                <span className="ntf-num"><b>{stats ? fmt(dogs) : '—'}</b><span>{t('pack.notif.dogsWord')}</span></span>
                <span className="ntf-num"><b>{stats ? fmt(stats.total) : '—'}</b><span>{t('pack.notif.peopleWord')}</span></span>
              </span>
              <span className="ntf-chev" aria-hidden>&#8250;</span>
              {pills.length > 0 && (
                <span className="ntf-tick" style={{ ['--ntf-tick-s' as string]: `${Math.max(16, pills.length * 5)}s` }}>
                  {/* Dve kópie za sebou — posun o -50 % je presne jedna kópia, takže slučka nemá švík. */}
                  <span className="ntf-tick-track">
                    {pills}
                    <span aria-hidden style={{ display: 'contents' }}>{pills}</span>
                  </span>
                </span>
              )}
            </div>
            <div className="ntf-list">
              {hasReal && <div className="ntf-real">{children}</div>}
              {tips.length > 0 && <div className="ntf-sec">{t('pack.notif.forYou')}</div>}
              {tips.map((tip) => (
                <div key={tip.id} className="ntf-row">
                  <span className="ntf-av"><img src={ainubisHead} alt="" /></span>
                  <span className="ntf-txt">
                    <span className="ntf-ai"><span>AI</span>NUBIS</span> · {tip.title}
                    <small>{tip.sub}</small>
                  </span>
                  <button type="button" className="ntf-cta" onClick={tip.go}>{tip.cta}</button>
                </div>
              ))}
              {!hasReal && tips.length === 0 && <div className="ntf-empty">{t('pack.notif.allClear')}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
});
