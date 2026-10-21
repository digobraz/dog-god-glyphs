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
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, PACK_SHADOW, STAGE_CSS, PROGRESS_CSS } from './packTheme';
import { LAPIS, goldFrameCSS } from './navGoldSkin';
import { AINUBIS } from './ainubisSkin';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { getPackStats } from '@/lib/sharedFetch';
import { openAinubis } from '@/lib/ainubisBus';
import { IS_APP } from '@/lib/isApp';
import { BUDDY_LIVE } from '@/lib/packFlags';
import { supabase } from '@/integrations/supabase/client';
import planet from '@/assets/notif-planeta.webp';
import ainubisHead from '@/assets/ainubis-head.webp';

const GlobePulse = lazy(() => import('./GlobePulse').then((m) => ({ default: m.GlobePulse })));

const T = PACK_THEME;

type Stats = {
  dogs: number;
  total: number;
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
.ntf-stats{${goldFrameCSS()}display:flex;gap:${PACK_SPACE.lg}px;align-items:center;margin:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px 0;padding:${PACK_SPACE.lg}px;
  min-height:calc(25dvh - ${PACK_SPACE.xl}px);cursor:pointer;text-align:left;font:inherit;color:inherit;width:calc(100% - ${PACK_SPACE.xxl}px);transition:transform .15s ease;}
.ntf-stats:active{transform:scale(0.98);}
.ntf-planet{position:relative;flex:0 0 auto;width:120px;height:120px;border-radius:${PACK_R.pill}px;background:url(${planet}) center/cover;box-shadow:${PACK_SHADOW.card};}
.ntf-planet::after{content:'';position:absolute;inset:14%;border-radius:${PACK_R.pill}px;background:radial-gradient(circle,rgba(251,245,230,0.98) 55%,rgba(251,245,230,0) 71%);}
.ntf-planet b{position:absolute;inset:0;z-index:1;display:grid;place-items:center;font-family:'Cinzel',serif;font-weight:700;font-size:${PACK_TEXT.lead}px;}
.ntf-eyebrow{font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};}
.ntf-big{font-family:'Cinzel',serif;font-weight:700;font-size:${PACK_TEXT.h1}px;letter-spacing:.14em;line-height:1.2;}
.ntf-of{font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.ntf-bar{margin:${PACK_SPACE.sm}px 0;}
.ntf-bar .pk-progress__fill{min-width:6px;}
.ntf-more{display:inline-block;margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.label}px;font-weight:600;color:${LAPIS.edge};}
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
${STAGE_CSS}${PROGRESS_CSS}`;

type Props = { onClose: () => void; children?: React.ReactNode; hasReal: boolean };

export const NotifSheet = forwardRef<HTMLDivElement, Props>(function NotifSheet({ onClose, children, hasReal }, ref) {
  const t = useT();
  const { lang } = useLang();
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
  // Cesta k miliónu — pri 132 psoch je to 0,01 %, preto `min-width` na výplni (inak by pruh vyzeral prázdny).
  const fillW = Math.min(100, (dogs / 1_000_000) * 100) + '%';

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
            <button type="button" className="ntf-stats" onClick={() => setView('stats')}>
              <span className="ntf-planet"><b>{stats ? fmt(dogs) : ''}</b></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="ntf-eyebrow">DOGYPT STATS</span>
                <span className="ntf-big" style={{ display: 'block' }}>{stats ? fmt(dogs) : '—'}</span>
                <span className="ntf-of" style={{ display: 'block' }}>{t('pack.notif.ofMillion')}</span>
                <span className="ntf-bar pk-progress" style={{ display: 'block' }}><span className="pk-progress__fill" style={{ display: 'block', width: fillW }} /></span>
                {stats && (
                  <span className="ntf-of" style={{ display: 'block' }}>
                    <b style={{ color: T.growGreen }}>+{fmt(stats.last30d)}</b> {t('pack.notif.perMonth')} · <b>{fmt(stats.total)}</b> {t('pack.notif.members')} · <b>{stats.topCountries.length}</b> {t('pack.notif.countries')}
                  </span>
                )}
                <span className="ntf-more">{t('pack.notif.allStats')} →</span>
              </span>
            </button>

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
