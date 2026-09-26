import { lazy, ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BonesCoin } from './BonesCoin';
import { PACK_THEME, PACK_COL, PACK_COL_INNER, usePaperRoute, PAPER_PAGE_CSS } from './packTheme';
import { devotionLevel } from '@/lib/devotion';
import { DEV_FULL } from '@/lib/packFlags';
import { usePackIdentity, type PackDog } from './usePackIdentity';
import { PackNotifications } from './PackNotifications';
import { WIZ } from './wizAnchors';
import iconHome from '@/assets/icons/nav-home.svg';
import statBadge from '@/assets/icons/stat-badge.svg';
import statBars from '@/assets/icons/stat-bars.svg';
import { useT } from '@/i18n/LanguageContext';
import { onOpenMessaging, type MessagingOpenEvent } from './messaging/openBridge';
// `tripPathById` samo dataset trás neimportuje (berie ho parametrom) — tento
// import je preto lacný, na rozdiel od `heroTrails.generated`, ktorý sa načíta
// lazy až pri kliku na štítok výletu.
import { currentTripId, tripPathById } from './tripShared';
import {
  NAV_R, NAV_GOLD, NAV_GRAIN, NAV_MOTTLE,
  NAV_FRAME_SHADOW, NAV_PLATE_SHADOW, NAV_PILL_SHADOW,
} from './navGoldSkin';
import { DOCK, DOCK_MEDAL_CSS, DockPlus } from './packDockMedal';
import type { AddChoice } from './addtrip/AddTripEntry';
import { placeForRoute, withOrigin, type CreateObject } from './createRegistry';
import { emitCreate, type CreateIntent } from '@/lib/createBus';
import { openAinubis } from '@/lib/ainubisBus';

// Inbox/Thread lazy — statický import by ich (a s nimi packMessaging.ts: HERO_TRAILS 1,5 MB,
// HERO_JOURNEYS) ťahal do PackLayout chunku vždy, aj keď overlay na LIVE
// nikdy nevykreslí nič (DEV_FULL je runtime konštanta, Rollup ju nevytrasí). Lazy = stiahne sa
// až pri reálnom otvorení overlaya (teda na LIVE nikdy).
// Panel „+" a denník sa otvárajú až klikom (audit 26. 9. 2026). Denník ťahá kompresiu
// obrázkov, panel „+" celý register vchodov — ani jedno nepatrí do prvého načítania.
// Panel „+" je hlavná akcia, preto sa po načítaní stránky potichu dotiahne (nižšie),
// aby prvé ťuknutie nečakalo na sieť.
const loadAddTripEntry = () => import('./addtrip/AddTripEntry');
const AddTripEntry = lazy(() => loadAddTripEntry().then((m) => ({ default: m.AddTripEntry })));
const DiaryEntry = lazy(() => import('./diary/DiaryEntry').then((m) => ({ default: m.DiaryEntry })));
const Inbox = lazy(() => import('./messaging/Inbox').then((m) => ({ default: m.Inbox })));
const Thread = lazy(() => import('./messaging/Thread').then((m) => ({ default: m.Thread })));

const T = PACK_THEME;

interface PackLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function PackLayout({ children, title, subtitle }: PackLayoutProps) {
  const t = useT();
  const navigate = useNavigate();
  const { session, loading, dogs, devotion, bones, avatarUrl, avatarInitial, packTotal, packToday } = usePackIdentity();

  // ── PAPYRUSOVÝ SHELL (2026-09-08) ────────────────────────────────────────────
  // Pozadie stránky sa riadi TÝM ISTÝM zoznamom `PAPER_ROUTES`, aký používa
  // `RouteFallback` v `App.tsx` a `PackNotifications` nižšie. Dva zoznamy by sa
  // rozišli a prejavilo by sa to bliknutím čiernej pred bledou stránkou.
  // ⚠️ `pk-paper` NESMIE dostať vlastný `z-index`/`transform`/`opacity` — jeho
  //    tapeta stojí na `z-index:-1` a uzavrela by sa doň (viď PAPER_PAGE_CSS).
  const paperPage = usePaperRoute(useLocation().pathname);

  if (loading) {
    return (
      <div
        className={`min-h-[100dvh] flex items-center justify-center relative${paperPage ? ' pk-paper' : ''}`}
        style={paperPage ? undefined : { backgroundColor: T.pageBg }}
      >
        {paperPage ? <style>{PAPER_PAGE_CSS}</style> : <HieroglyphBg />}
        <div className="relative" style={{ zIndex: 1 }}>
          <div style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.26em', fontSize: 12, color: paperPage ? T.inkWarm : T.onDarkDim }}>
            {t('pack.layout.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div
      className={`min-h-[100dvh] relative${paperPage ? ' pk-paper' : ''}`}
      style={paperPage ? { color: T.inkStrong } : { backgroundColor: T.pageBg, color: T.onDark }}
    >
      {paperPage ? <style>{PAPER_PAGE_CSS}</style> : <HieroglyphBg />}

      {/* FLOATING STATUS HUB — fixed top, slim single-row pill. DEV_FULL target model
          (D4 nav rework) drops this entirely — identity moved to the bottom nav avatar,
          notif/messages to PackTopRight above. LIVE (§8.4, no regression) keeps it. */}
      {!DEV_FULL && (
        <DevotionHeader
          avatarUrl={avatarUrl}
          avatarInitial={avatarInitial}
          devotion={devotion}
          bones={bones}
          packTotal={packTotal}
          packToday={packToday}
          dogs={dogs}
          onProfile={() => {
            // Profil je na LIVE od 2026-08-06 → avatar ide rovno tam, už neskroluje
            // na settings blok na homepage.
            navigate('/pack/profile');
          }}
          onDog={(id) => navigate(`/pack/dogs/${id}`)}
        />
      )}

      {/* `pb-40` na mobile (audit 13. 8., B4): plávajúca spodná lišta + AINUBIS
          prekrývali pri 390px posledný riadok chipov a počítadlo `0/10` — dalo sa
          doscrollovať, ale prvý dojem bol „obsah je odseknutý". Desktop ostáva `pb-32`,
          tam lišta neplává nad obsahom. */}
      <div
        className="relative z-10 mx-auto w-full px-4 sm:px-6 pb-40 sm:pb-32"
        style={{
          // Šírka z PACK_COL, nie z Tailwind triedy — to isté číslo drží aj PackTriplist,
          // ktorý PackLayout nemountuje (vlastný tmavý root). Dve čísla by sa rozišli.
          // Jedna šírka pre všetky centrované /pack obrazovky (21. 9. 2026, `narrow` zanikol).
          maxWidth: PACK_COL.wide,
          paddingTop: DEV_FULL ? 'calc(env(safe-area-inset-top, 0px) + 28px)' : 'calc(env(safe-area-inset-top, 0px) + 106px)',
        }}
      >
        {/* Global top-right hub — notif + messages, on EVERY narrow-column pack page
            (D4 nav rework, DEV_FULL-only). Matej amendment 2026-07-24: lives IN the content
            flow now (right-aligned to this same max-w column), not floating past the screen
            edge — that's PackMap's full-bleed map only (no content column there). LIVE
            keeps it exactly where it was (inside HeroCard), untouched.
            Matej amendment 2026-07-24 (round 2): sticky, not static — otherwise it scrolls
            away with the rest of the column. Pinned just under the safe-area, above content
            (z-index above the z-10 column). */}
        {DEV_FULL && (
          <div
            className="mb-5"
            style={{ position: 'sticky', top: 'calc(env(safe-area-inset-top, 0px) + 12px)', zIndex: 30 }}
          >
            <PackTopRight last24h={packToday} total={packTotal} layout="inline" />
          </div>
        )}
        {(title || subtitle) && (
          <header className="mb-7 text-center">
            {subtitle && (
              <div className="mb-2" style={{
                fontFamily: "'Cinzel', serif", letterSpacing: '0.26em',
                fontSize: 10, textTransform: 'uppercase', color: T.onDarkDim,
              }}>
                {subtitle}
              </div>
            )}
            {title && (
              <h1 style={{
                fontFamily: "'Cinzel', serif", letterSpacing: '0.14em',
                fontSize: 28, textTransform: 'uppercase', fontWeight: 700, color: T.onDark,
              }}>
                {title}
              </h1>
            )}
          </header>
        )}
        <main>{children}</main>
      </div>

      {/* Floating pill nav — dolný (Home · Map · Avatar, D4 nav rework). LIVE: skryté
          (orezaný pack). */}
      <PackBottomNav avatarUrl={avatarUrl} avatarInitial={avatarInitial} dogs={dogs} />
      <MessagingOverlayHost />
    </div>
  );
}

// ── Global top-right chrome — notif + messages hub, mounted on EVERY pack page
// (PackLayout column pages + the full-bleed PackMap map). DEV_FULL-only; LIVE
// build renders nothing here (PackNotifications stays inside HeroCard, unchanged).
export function PackTopRight({ last24h, total, className, layout }: { last24h: number | null; total: number | null; className?: string; layout?: 'overlay' | 'inline' }) {
  // ⚠️ ŠAT SA PÝTA CESTY, NIE SA ZAPISUJE NATVRDO (2026-09-02).
  // Do dneška tu stálo holé `dark`, čo bola pravda, kým bol tmavý celý `/pack`. Počas
  // prezliekania (DRAK → BRIGHT) sa to ale mení stránku po stránke, a natvrdo zapísaná
  // hodnota by na každej novo zosvetlenej stránke nechala tmavý zvonček so sklenným
  // rozostrením — teda diera, ktorá vznikne až o niekoľko commitov neskôr a nikomu sa
  // neohlási. `usePaperRoute` je ten istý zdroj pravdy, aký používa `RouteFallback`
  // v `App.tsx`, takže zvonček sa prepne v tom istom okamihu ako podklad pod ním:
  // kto prezlečie stránku, pridá jej riadok do `PAPER_ROUTES` a hotovo, sem nesiaha.
  const paper = usePaperRoute(useLocation().pathname);
  if (!DEV_FULL) return null;
  return <PackNotifications dark={!paper} last24h={last24h} total={total} className={className} layout={layout} />;
}

// ── Messaging overlay host (Inbox/Thread) — design:
// plany/zadanie-profil-messaging-2026-07-23.md §10 Fable amendment: "stav inbox/thread overlayu
// žije v PackLayout ... žiadny prop-drilling cez 1944-riadkový PackMap". PackMap.tsx je ale
// full-bleed a NEmountuje <PackLayout> (vlastný <DevotionHeader>/<PackBottomNav>, viď komentár pri
// PackBottomNav nižšie) — preto je hosting vytiahnutý ako samostatný exportovaný komponent (žije
// TU, v PackLayout.tsx, presne podľa zadania), mountnutý raz tu a raz priamo v PackMap.tsx
// (surgical 1-riadkový prídavok), nech "Message owner"/"Open trip group" na tripe aj Messages tab
// v zdieľanom bottom nave majú vždy kam otvoriť overlay. Gated DEV_FULL — spúšťacie miesta
// (PackNotifications live stav, bottom nav Messages, trip panel tlačidlá) sú tiež všetky
// DEV_FULL-only, takže LIVE build sa nemení (§8.4 bez regresie).
type MessagingOverlayState = { mode: 'closed' } | { mode: 'inbox' } | { mode: 'thread'; convId: string };

export function MessagingOverlayHost() {
  const [overlay, setOverlay] = useState<MessagingOverlayState>({ mode: 'closed' });
  // ⚠️ hook MUSÍ byť nad `if (!DEV_FULL …) return null` nižšie — pod ním by sa poradie
  // hookov medzi rendermi menilo (Rules of Hooks) a overlay by zhodil stránku.
  const navigate = useNavigate();

  useEffect(() => {
    if (!DEV_FULL) return;
    return onOpenMessaging((ev: MessagingOpenEvent) => {
      setOverlay(ev.mode === 'inbox' ? { mode: 'inbox' } : { mode: 'thread', convId: ev.convId });
    });
  }, []);

  if (!DEV_FULL || overlay.mode === 'closed') return null;

  // Klik na štítok výletu nad konverzáciou. Predtým sa `onOpenTrip` neodovzdávalo
  // vôbec, takže Thread padal do svojej TODO vetvy (`console.log`) a v Inboxe bol
  // štítok len text — na oboch povrchoch teda „klik nič nerobí".
  // Dataset trás sa načíta lazy: `tripPathById` ho berie parametrom práve preto,
  // aby sa megabajt trás nevtiahol do globálneho chrome.
  // `currentTripId` — slug uložený vo vlákne môže byť spred premenovania (3. 8.);
  // do Supabase sa mapa `RENAMED_TRIP_IDS` nikdy nepremietla, takže sa prekladá tu.
  // Bez toho by odkaz smeroval na mŕtvy slug a zachránil by ho až redirect v článku.
  const openTrip = async (tripId: string) => {
    setOverlay({ mode: 'closed' });
    const { HERO_TRAILS } = await import('@/data/heroTrails.generated');
    navigate(tripPathById(currentTripId(tripId), HERO_TRAILS));
  };

  // Suspense fallback=null — Inbox/Thread sú lazy (viď import vyššie), krátky async gap pri
  // prvom otvorení overlaya je tichý (žiadny spinner v zadaní), nie chýbajúci chunk.
  if (overlay.mode === 'inbox') {
    return (
      <Suspense fallback={null}>
        <Inbox
          onOpenThread={(convId) => setOverlay({ mode: 'thread', convId })}
          onClose={() => setOverlay({ mode: 'closed' })}
          onBrowseTrips={() => { setOverlay({ mode: 'closed' }); navigate('/pack/map'); }}
          onOpenTrip={(tripId) => void openTrip(tripId)}
        />
      </Suspense>
    );
  }

  // Thread "back" (←) sa vracia do Inboxu (rovnaký vzor ako bežné DM appky), Inbox "×" zatvára
  // overlay úplne.
  return (
    <Suspense fallback={null}>
      <Thread
        convId={overlay.convId}
        onClose={() => setOverlay({ mode: 'inbox' })}
        onOpenTrip={(tripId) => void openTrip(tripId)}
      />
    </Suspense>
  );
}

// ── SKIN dolného navu — SKÚŠKA (2026-08-24) ─────────────────────────────────
// Matej: „ten starý (čierne sklo) sa mi už vôbec nepáči" — skúšame bledý zlatý bar
// v duchu papyrusového locku. Zatiaľ LEN na očiach v lokáli, preto PREPÍNAČ a nie
// prepis: `'glass'` vráti pôvodný stav jedným slovom (zamietnuté sa odkladá, nemaže).
export const NAV_SKIN: 'gold' | 'glass' = 'gold';

// Zlatý rám navu — kreslené podľa Matejovej predlohy (`nav-predloha` 24.8., 2. kolo).
//
// ⚠️ 1. kolo som mal tvar NAOPAK. Matejovo „nebolo to ako pils" platí na VONKAJŠÍ bar
// (ten je zaoblený obdĺžnik, r ≈ 0,2 × výška), NIE na položky vnútri — MAP aj G sú
// v predlohe PLNÉ pilulky/kruh. Meranie z predlohy (výška baru 325 px):
//   rám 35 px (11 %) · doska 255 px · aktívna pilulka 215 px · polomer rohu ~65 px (20 %)
// Prepočítané na bar ~60 px: rám 6 · doska 48 · pilulka 40 · polomer 14.
//
// Ďalšie tri veci z predlohy, ktoré CSS gradient sám nedá:
//   1. TMAVÝ OBRYS na oboch stranách rámu — vonku aj na hranici s doskou. Bez tejto
//      vnútornej linky rám „pretečie" do dosky a celé to vyzerá ako nálepka.
//   2. TEXTÚRA papiera na doske (zrno + mramorovanie). Rovnomerný gradient bol to,
//      čo Matej čítal ako „umelo".
//   3. Doska je TEPLEJŠÍ piesok, nie krémová — moja bola vybledená do biela.
// ⚠️ TOKENY SA PRESŤAHOVALI (25. 8. 2026) do `navGoldSkin.ts` — ten istý rám
// potrebujú aj povrchy mimo Reactu (stena `/wall-lab` má nav v CSS template
// literáli). Dve kópie gradientov by sa rozišli pri prvej úprave. Merania
// a dôvody jednotlivých kôl ladenia ostávajú v komentároch vyššie.

/**
 * Zrnitá vrstva nad ľubovoľným povrchom navu. `radius` musí sedieť s podkladom.
 * Vykresľuje sa dvakrát (tmavé + svetlé zrno) s posunutou dlaždicou.
 */
function NavGrain({ radius, opacity = 0.3, inset = 0 }: { radius: number | string; opacity?: number; inset?: number }) {
  const base: React.CSSProperties = {
    position: 'absolute', inset, borderRadius: radius,
    backgroundImage: NAV_GRAIN,
    backgroundSize: '180px 180px',
    pointerEvents: 'none',
  };
  return (
    <>
      <div aria-hidden style={{ ...base, mixBlendMode: 'multiply', opacity: opacity * 0.85 }} />
      <div aria-hidden style={{ ...base, backgroundPosition: '37px 23px', mixBlendMode: 'screen', opacity: opacity * 0.6 }} />
    </>
  );
}

// ── Floating bottom pill nav — Home · Map · Avatar (D4 nav rework 2026-07-24) ─
// Shared between PackLayout (every narrow-column pack page) and the full-bleed
// Portal Trips surface (its own <DevotionHeader>, but the same bottom nav so
// tab-switching feels identical everywhere). DEV_FULL-gated — LIVE pack stays
// trimmed (nav hidden). Dogs (svorka) + Messages moved off the bar: Dogs lives
// in the avatar menu, Messages moved to the global PackTopRight hub.
export function PackBottomNav({ avatarUrl, avatarInitial, dogs }: { avatarUrl?: string | null; avatarInitial?: string; dogs?: PackDog[] } = {}) {
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);

  // ── PANEL `+` ŽIJE TU, LEBO LIŠTA VIE, KDE ČLOVEK STOJÍ ────────────────────────────
  // Lock `architektura-pack.md` §1.1.1: `+` je jediný slot chrbtice s KONTEXTOVÝM obsahom.
  // Miesto sa NEPÝTA stránky — rozhoduje cesta (`placeForRoute`), inak by ho piaty povrch,
  // ktorý si lištu namountuje, raz zabudol poslať.
  const { pathname } = useLocation();
  const place = placeForRoute(pathname);
  const [createOpen, setCreateOpen] = useState(false);
  const [diary, setDiary] = useState<{ mode: 'write' | 'photo' } | null>(null);
  // Panel „+" potichu dotiahni, keď prehliadač nemá čo robiť — prvé ťuknutie potom nečaká.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => { loadAddTripEntry(); }) : window.setTimeout(() => { loadAddTripEntry(); }, 2000);
    return () => { if (!w.requestIdleCallback) window.clearTimeout(id); };
  }, []);

  // Je pod nami namountovaný `PackMap`? Len tieto dve cesty ho mountujú — `/pack/map/triplist`
  // a článok výletu sú iné komponenty, hoci ležia na tej istej vetve adries.
  const onMapScreen = pathname === '/pack/map' || pathname.startsWith('/pack/add');

  /**
   * Mapový objekt (výlet · rýchly odkaz · podujatie). Vykonáva ho `PackMap`, nie lišta.
   *
   * 🔴 PRAVIDLO NÁVRATU (lock §1.1.1): keď tok začína inde než na mape, pripneme `?from=`
   *    a `PackMap` sa naň po uložení či zrušení vráti. Parameter, nie pamäť komponentu —
   *    tok výletu ide cez celú mapu a musí prežiť obnovenie stránky.
   * ⚠️ PORADIE: najprv navigácia, potom voľba. `createBus` ju podrží, kým sa `PackMap`
   *    nenamountuje a neprihlási — opačné poradie by ju odovzdalo nikomu.
   */
  const runPick = (choice: AddChoice) => {
    setCreateOpen(false);
    const intent: CreateIntent =
      choice.kind === 'trip' ? { id: 'trip' }
        : choice.kind === 'wish' ? { id: 'wish' }
        : choice.kind === 'note' ? { id: 'note', group: choice.group }
          : { id: 'event', origin: choice.origin };
    if (!onMapScreen) navigate(withOrigin('/pack/map', pathname));
    emitCreate(intent);
  };

  /**
   * Objekt, ktorý mapa nevykonáva. Dnes sú to tri: denník, fotka (ten istý formulár
   * otvorený pri fotke) a nový rozhovor s AINUBISOM.
   *
   * ⚠️ Ohlásené položky („čoskoro") sem NEPRÍDU — panel ich nedá kliknúť. Preto tu nie je
   *    vetva pre `post`, `brain` ani `board`: keby tu bola, bola by to mŕtva vetva, ktorá
   *    tvrdí, že tie obrazovky existujú.
   * ⚠️ DENNÍK JE PREKRYVOVÁ VRSTVA, NIE ROUTA (lock §4.2: akcia nikdy neodnesie človeka
   *    preč z miesta, kde je). Zapíše sa a človek stojí tam, kde stál.
   */
  const runCreate = (o: CreateObject) => {
    setCreateOpen(false);
    if (o.target.kind !== 'handler') return;
    if (o.target.id === 'diary.write') { setDiary({ mode: 'write' }); return; }
    if (o.target.id === 'diary.photo') { setDiary({ mode: 'photo' }); return; }
    if (o.target.id === 'ainubis.chat') { openAinubis(); return; }
  };

  // Nav publikuje svoju polovičnú šírku ako `--pack-nav-half` + značku
  // `has-pack-nav` na <body>. Odoberá to AinubisWidget, ktorý sa vďaka tomu
  // prilepí tesne k pravému okraju pillu (Matej 2026-07-26: „dajme ho pri nav
  // bar spodný homemap profil a vedľa samostatne floating"). Šírka pillu je
  // premenlivá — labely sa pod `sm:` skrývajú a jazyky majú rôzne dĺžky —
  // preto ResizeObserver, nie natvrdo číslo. Keď nav nie je (LIVE build, routy
  // mimo /pack), trieda chýba a widget ostáva vpravo dole.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const root = document.documentElement;
    const apply = () => {
      const r = el.getBoundingClientRect();
      root.style.setProperty('--pack-nav-half', `${r.width / 2}px`);
      // Výška ide von tiež — widget sa podľa nej vycentruje na vodorovnú os
      // pillu. Bez nej by len stál na tej istej základni a pri väčšom priemere
      // by mu stred ušiel nahor.
      root.style.setProperty('--pack-nav-h', `${r.height}px`);
      // Odstup baru od spodku okna — panel `+` sa vysúva tesne nad bar v jeho šírke
      // (Matej 22. 9.: „musí sa vysunúť zo spodného navu v jeho šírke").
      root.style.setProperty('--pack-nav-bottom', `${Math.max(0, window.innerHeight - r.bottom)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener('resize', apply);
    document.body.classList.add('has-pack-nav');
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
      document.body.classList.remove('has-pack-nav');
      root.style.removeProperty('--pack-nav-half');
      root.style.removeProperty('--pack-nav-h');
      root.style.removeProperty('--pack-nav-bottom');
    };
  }, []);

  if (!DEV_FULL) return null;
  return (
    /* ── LIŠTA JE PÁS CEZ CELÉ OKNO, BAR STOJÍ V JEHO STREDE (2026-09-11) ─────────
       Matej: „obsahy na obidvoch stranách centruj (teraz je tlačítko domov viac na
       lavo… a pravá strana je nalepená moc na pravo)."
       ⚠️ Prečo pás a nie pôvodné `left:50%` + `translateX(-50%)`: fixovaný prvok
       s `left:50%` má dostupnú šírku len POLOVICU okna. Kým sa doň bar zmestí, je
       sizovaný na max-content a rovnaké `1fr` stĺpce dostanú rovnaký diel; len čo sa
       nezmestí (mobil), prepne sa na min-content a KAŽDÝ `1fr` dostane svoju vlastnú
       šírku — centrovanie by na telefóne ticho zmizlo. Tú istú pascu má zapísanú
       `.nav-top` na `/onepage` (CLAUDE.md, 28. 8. 2026).
       ⚠️ `navRef` MUSÍ ostať na bare, nie na páse: publikuje `--pack-nav-half`,
       z ktorej si AINUBIS panel počíta polohu (`AinubisWidget.css`). Na páse by to
       bola polovica okna. */
    <>
    {/* `pk-dock-band` = háčik pre zámok obrazovky na mape (`body.trp-draw-lock` v PackMap):
        pri zápise výletu aj prania lišta zmizne. Bez triedy ju zámok netrafil — jeho pravidlo
        mieri na starý `.trp-root > nav.fixed` spred prestavby lišty 21. 9. 2026. */}
    <div
      className="fixed z-40 pk-dock-band"
      style={{
        /* ⛔ `var(--consent-h)` tu bolo 17. 9.–22. 9. 2026 (lišta mala na mobile 197 px
           a nav ležal celý pod ňou). ZRUŠENÉ: Cookie lišta od 22. 9. 2026 obsah PREKRÝVA, neposúva ho (Matej: „radšej keby zakryli obsah na mobile než ho vytlačiť“) — lišta má 112 px a zmizne na jedno ťuknutie.
           Nav sa NEPOSÚVA; kým človek nevyberie, lišta ho zakryje. */
        left: 0, right: 0,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        display: 'flex', justifyContent: 'center',
        // Pás je cez celé okno — bez tohto by prekryl obsah stránky po oboch stranách baru.
        pointerEvents: 'none',
      }}
    >
    <nav ref={navRef} className="relative" style={{ pointerEvents: 'auto' }}>
      <div className="relative">
        {/* Sklenená vrstva pill-u — VLASTNÝ element, nie pozadie riadku s ikonami.
            issue #51 (Instagram-style fade): horný okraj pill-u sa rozplýva do priehľadna
            namiesto tvrdej hrany, takže obsah stránky pod ním mizne postupne. Maska sedí len
            na tejto blur vrstve — žiadny extra backdrop-filter povrch, na starších telefónoch
            to ostáva lacné.
            ⚠️ Maska NESMIE byť na kontajneri s obsahom: `mask-image` klipuje celý podstrom na
            svoj box, takže dropdown avatara (visí nad pill-om) sa vôbec nenamaľoval — DOM ho
            mal, geometriu mal správnu, ale bol odmaskovaný preč (Matej 2026-08-06). */}
        {NAV_SKIN === 'gold' ? (
          <>
            {/* RÁM — tmavý obrys vonku, leštené zlato, svetlá hrana hore.
                Maska sa tu NEPOUŽÍVA: fade horného okraja má zmysel na skle,
                na plnom zlate by len odhryzol rám. */}
            <div
              aria-hidden
              style={{
                position: 'absolute', inset: 0, borderRadius: NAV_R.frame,
                background: NAV_GOLD.frame,
                border: `${NAV_R.line}px solid ${NAV_GOLD.edge}`,
                boxShadow: NAV_FRAME_SHADOW,
                pointerEvents: 'none',
              }}
            />
            <NavGrain radius={NAV_R.frame} opacity={0.2} />
            {/* DOSKA — pieskovec s vlastným tmavým obrysom. Bez tej vnútornej linky
                rám pretečie do dosky a bar vyzerá ako nálepka, nie ako odliatok. */}
            <div
              aria-hidden
              style={{
                position: 'absolute', inset: NAV_R.rim, borderRadius: NAV_R.plate,
                background: `${NAV_MOTTLE}, ${NAV_GOLD.surface}`,
                border: `${NAV_R.line}px solid ${NAV_GOLD.edge}`,
                boxShadow: NAV_PLATE_SHADOW,
                pointerEvents: 'none',
              }}
            />
            <NavGrain radius={NAV_R.plate} opacity={0.46} inset={NAV_R.rim} />
          </>
        ) : (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            background: T.glass,
            border: `1px solid ${T.onDarkBorder}`,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 12px 36px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,240,228,0.06)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 16%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 16%, black 100%)',
            pointerEvents: 'none',
          }}
        />
        )}
        {/* ── ZLOŽENIE: DOMOV · VON │ ⊕ │ AINUBIS · JA (chrbtica, LOCKED 21. 9. 2026) ──
            Päť miest, ktoré NIKDY nerastú (lock `architektura-pack.md` §1.1). Delia sa
            podľa ZÁMERU človeka, nie podľa funkcií: zámerov je konečný počet, funkcií nie.
            Šieste miesto znamená, že niečo z pätice odchádza — a nemá čo.

            🔴 ČO SA 21. 9. ZMENILO oproti zloženiu zo 4. 9. („DOMOV │ AINUBIS │ MAPA · PROFIL"):
               · stred je `+`, nie AINUBIS — kotúč prestal byť spúšťačom chatu a stal sa
                 pridávaním. Medailón už predtým NEODPOVEDAL na „kde som" (bol to spúšťač
                 overlayu), takže argument „v strede má byť miesto" padol meraním, nie názorom.
               · AINUBIS dostal VLASTNÚ POLOŽKU a routu `/pack/ainubis` (pristáva na rovine
                 VAULT — v CHATE a na NÁSTENKE lišta mizne, takže pristátie na chate by viedlo
                 do miesta, kde sa záložka sama skryje).
               · MAPA sa volá VON. Je to jediné z piatich mien, ktoré hovorí ZÁMER („kam a s kým
                 dnes"), nie obrazovku. `/pack/map` v URL ostáva — identifikátor nie je text
                 pre človeka (ten istý precedens ako `/pack` proti slovu „svorka").

            ⚠️ SVORKA vlastné tlačidlo NEMÁ (Matej 4. 9.) — ostáva položkou v rozbaľovačke
               avatara, kde bola aj doteraz. Avatar JE miesto JA.
            ⚠️ Krídla majú odteraz po DVE položky, takže nesymetria, kvôli ktorej kedysi
               existoval `DOCK.medalX = +10`, je preč aj vecne, nielen cez `1fr auto 1fr`. */}
        <style>{DOCK_MEDAL_CSS}</style>
        {/* `1fr auto 1fr` = obe krídla dostanú ROVNAKÝ diel a v ňom sa obsah vycentruje.
            Vľavo je jedna položka a vpravo dve, takže bez toho sedel DOMOV nalepený na
            ľavom okraji a dvojica MAPA+avatar na pravom (odmerané: DOMOV 29 px prid
            ďaleko vľavo, pravé krídlo 15 px príliš vpravo). Šírku baru teraz drží
            ŠIRŠIE krídlo — bar je o niečo širší než predtým, to je cena za symetriu. */}
        <div
          className="relative items-center"
          style={{
            display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
            gap: NAV_SKIN === 'gold' ? NAV_WING_GAP : 4, padding: NAV_SKIN === 'gold' ? NAV_R.rim + 5 : 6,
          }}
        >
          <span className="flex items-center justify-center" style={{ minWidth: 0, gap: NAV_SKIN === 'gold' ? NAV_WING_GAP : 4 }}>
            <FloatingNavLink to="/pack" label={t('pack.layout.navHome')} icon={iconHome} end />
            {/* `WIZ.navMap` — sem svieti krok prehliadky o mape (spotlight na IKONKU,
                nie na blok stránky). Kotva sedí na obale, nie na `NavLink`: spotlight
                pridáva `position:relative` + `z-index`, a to by prebilo štýl pillu.
                ⚠️ IKONKA OSTÁVA PLANÉTKA. Matej 21. 9. 2026 k návrhu vymeniť ju za
                   `walk.svg`: „počkaj, ja som neschválil vymeniť planétku" — a v tej istej
                   dávke rozhodnutí o značkách potvrdil „VON ostáva planétka world-grid.svg".
                   Výmena je NÁVRH na nákres, nie hotová vec. */}
            <span id={WIZ.navMap} style={{ display: 'inline-flex', borderRadius: 999 }}>
              <FloatingNavLink to="/pack/map" label={tx('pack.layout.navOut', 'OUT')} icon="/icons/pack/world-grid.svg" />
            </span>
          </span>
          <DockPlus label={tx('pack.layout.navAdd', 'Add')} onClick={() => setCreateOpen(true)} />
          <span className="flex items-center justify-center" style={{ minWidth: 0, gap: NAV_SKIN === 'gold' ? NAV_WING_GAP : 4 }}>
            <AinubisNavLink label={t('pack.layout.navAinubis')} />
            <AvatarNavButton avatarUrl={avatarUrl} avatarInitial={avatarInitial} dogs={dogs} />
          </span>
        </div>
      </div>
    </nav>
    </div>
    {/* ── PANEL `+` JE SÚRODENEC PÁSU, NIE JEHO POTOMOK ─────────────────────────────────
        🔴 DVA DÔVODY, OBA MERATEĽNÉ:
        1. VRSTVENIE. Pás je `fixed z-40`, teda VLASTNÝ stacking kontext — čokoľvek v ňom
           sa vrství len voči nemu a mapové ovládače (z-900) by prekryli aj `z-9999`.
           Je to presne tá pasca, ktorá 21. 9. položila spodný nav CEZ tlačidlo ZAPÍSAŤ
           v denníku (KROK 5) a riešila sa portálom.
        2. ŠAT. Na mape musí panel ostať VNÚTRI `.trp-root` — bledú (papyrusovú) podobu
           mu dáva `PALE_ADD_CSS` s predponou `.trp-root`. Portál do `document.body` by ho
           z nej vyviedol a na mape by zrazu svietil tmavý sklenený popup vedľa bledého,
           ktorý otvára ten istý tok z bočného panela.
        Súrodenectvo rieši oboje naraz: panel sa vrství v kontexte STRÁNKY a šat zdedí. */}
    {createOpen && (
      <Suspense fallback={null}>
        <AddTripEntry
          place={place}
          onPick={runPick}
          onCreate={runCreate}
          onClose={() => setCreateOpen(false)}
        />
      </Suspense>
    )}
    {/* DENNÍK — druhý a tretí vchod doň sú dlaždica na `/pack/dogs` a popup dňa v kalendári
        (KROK 5). Toto je štvrtý: `+` na mieste JA. Ten istý komponent, žiadna druhá obrazovka
        „pridať zápis" — lock §1.1.1: jeden panel, viac vchodov. */}
    {diary && (dogs?.length ?? 0) > 0 && (
      <Suspense fallback={null}>
        <DiaryEntry
          dogs={(dogs ?? []).map((d) => ({ id: d.id, name: d.dog_name ?? '—' }))}
          mode={diary.mode}
          onClose={() => setDiary(null)}
          tx={tx}
        />
      </Suspense>
    )}
    </>
  );
}

// Avatar entry — last item in the bottom pill (rightmost). Single click opens a small
// glass dropdown, NO double-tap — click-away closes it (same pattern as PackNotifications'
// bell dropdown). Matej amendment 2026-07-24: clean 2-item menu (Profile / My Pack), each
// row carries its own small photo thumbnail — owner avatar for Profile, dog photo(s) for My
// Pack (stacked circles when there's more than one dog). Settings does NOT live here — stays
// a block on home (PackSettings, #pack-settings anchor).
function AvatarNavButton({ avatarUrl, avatarInitial, dogs = [] }: { avatarUrl?: string | null; avatarInitial?: string; dogs?: PackDog[] }) {
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative" style={{ marginLeft: 4 }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label={t('pack.layout.profileAriaLabel')}
        aria-expanded={open}
        className="flex items-center justify-center"
        style={NAV_SKIN === 'gold' ? {
          // Šírka zlatého rámu aj priemer fotky sú Matejov výber z nákresu — `DOCK`,
          // nie čísla natvrdo (4. 9. 2026: „nech sa pohrám aj so šírkou toho orámovania").
          padding: DOCK.avRing, lineHeight: 0, borderRadius: '50%',
          background: NAV_GOLD.activeFill,
          border: `${NAV_R.line}px solid ${NAV_GOLD.edge}`,
          boxShadow: [
            'inset 0 2px 0 rgba(255,250,222,0.85)',
            'inset 0 -3px 5px rgba(110,74,20,0.42)',
            open ? '0 1px 2px rgba(70,45,10,0.5)' : '0 3px 6px -1px rgba(70,45,10,0.5)',
          ].join(', '),
          cursor: 'pointer',
          position: 'relative',
        } : { ...pillStyle(open), padding: 4, lineHeight: 0 }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            style={{
              width: DOCK.avPhoto, height: DOCK.avPhoto, borderRadius: '50%', objectFit: 'cover', display: 'block',
              border: NAV_SKIN === 'gold' ? '1.5px solid rgba(150,105,30,0.7)' : '1.5px solid rgba(201,154,63,0.45)',
            }}
          />
        ) : (
          <div style={{
            width: DOCK.avPhoto, height: DOCK.avPhoto, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #F5C73D, #E69E1A)',
            border: NAV_SKIN === 'gold' ? '1.5px solid rgba(150,105,30,0.7)' : 'none',
            boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, color: '#1c160c',
          }}>
            {avatarInitial || 'D'}
          </div>
        )}
      </button>

      {open && (
        <div
          className="pack-avatar-menu"
          style={{
            position: 'absolute', right: 0, minWidth: 190,
            ...(NAV_SKIN === 'gold'
              ? { background: T.panelGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 14, boxShadow: T.panelShadow }
              : {
                  background: T.glass, border: `1px solid ${T.onDarkBorder}`, borderRadius: 14,
                  backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                  boxShadow: '0 12px 36px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,240,228,0.06)',
                }),
            padding: 6, zIndex: 50,
          }}
        >
          {/* .pack-avatar-menu bottom offset žije v CSS (nie inline) — na /pack/map
              (≤1023px) musí preskočiť .trp-mtoggle LIST/MAP pilulku (bottom 78px + výška),
              inak ju prekrýva a schová druhú položku menu pod ňou (Matej 2026-07-27 bug report). */}
          <style>{`
            .pack-avatar-menu{bottom:calc(100% + 10px);}
            /* ⚠️ Tá istá rezerva ako u dvojice ZOZNAM/PRIDAŤ (.trp-mactions v PackMap):
               menu ju musí preskočiť, inak mu spodnú položku prekryje — dvojica má
               z-index 900, menu žije v nave na z-40. Preto obe strany berú kotúč
               AINUBISA z jedného zdroja (--pack-medal-rise), nie z dvoch čísel, ktoré
               sa rozišli pri prvej úprave (stalo sa 4. 9. 2026, prekryv 4 px). */
            @media (max-width:1023px){.pack-avatar-menu{bottom:calc(100% + 76px + var(--pack-medal-rise, 0px) + 4px);}}
          `}</style>
          <AvatarMenuItem
            label={t('pack.layout.navProfile')}
            onClick={() => { setOpen(false); navigate('/pack/profile'); }}
            thumb={<MiniAvatar avatarUrl={avatarUrl} avatarInitial={avatarInitial} />}
          />
          {/* ⚠️ Cieľ opravený 2026-08-06: mierilo to na `/pack/profile#my-gods` — kotvu bloku
              „OH, MY DOG!", ktorý v ten deň z profilu ZANIKOL. Odkaz teda nespadol na 404, ale
              ticho otvoril profil bez toho bloku a vyzeralo to, že hub neexistuje (Matej:
              „po kliknutí na moja svorka = otvorí mi profil nevidím ten náš hub"). Mŕtva kotva
              je horšia než mŕtvy odkaz — nič nezlyhá, len ťa to odvedie inam. */}
          <AvatarMenuItem
            label={t('pack.tree.title')}
            onClick={() => { setOpen(false); navigate('/pack/dogs'); }}
            thumb={<MiniDogStack dogs={dogs} />}
          />
        </div>
      )}
    </div>
  );
}

// Small circular owner-avatar thumbnail — Profile row.
function MiniAvatar({ avatarUrl, avatarInitial }: { avatarUrl?: string | null; avatarInitial?: string }) {
  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt=""
      style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '1px solid rgba(201,154,63,0.45)', flexShrink: 0 }}
    />
  ) : (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
      background: 'radial-gradient(circle at 35% 30%, #F5C73D, #E69E1A)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 10, color: '#1c160c',
    }}>
      {avatarInitial || 'D'}
    </div>
  );
}

// Stacked dog-photo thumbnails — My Pack row. 1 dog = single circle; 2+ dogs = overlapping
// stack (AllTrails/Instagram "who's going" pattern), max 3 shown + no photo fallback (🐕 chip).
function MiniDogStack({ dogs }: { dogs: PackDog[] }) {
  const shown = dogs.slice(0, 3);
  if (shown.length === 0) {
    return (
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(201, 154, 63, 0.22)', border: `1px solid ${PACK_THEME.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
      }}>🐕</div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {shown.map((dog, i) => (
        <div
          key={dog.id}
          style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            marginLeft: i === 0 ? 0 : -8,
            border: `1px solid ${T.pageBg}`,
            boxShadow: '0 0 0 1px rgba(201,154,63,0.45)',
            overflow: 'hidden',
            background: dog.cloudinary_main_url ? 'transparent' : 'rgba(201, 154, 63, 0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
            zIndex: shown.length - i,
          }}
        >
          {dog.cloudinary_main_url ? (
            <img src={dog.cloudinary_main_url} alt={dog.dog_name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : '🐕'}
        </div>
      ))}
    </div>
  );
}

function AvatarMenuItem({ label, onClick, thumb }: { label: string; onClick: () => void; thumb: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center"
      style={{
        width: '100%', textAlign: 'left', padding: '8px 12px', gap: 9,
        borderRadius: 9, background: 'none', border: 'none', cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = NAV_SKIN === 'gold' ? 'rgba(201,154,63,0.18)' : 'rgba(245,240,228,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
    >
      {thumb}
      <span style={{
        fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '0.14em',
        textTransform: 'uppercase', fontWeight: 700, color: NAV_SKIN === 'gold' ? T.inkStrong : T.onDark,
      }}>
        {label}
      </span>
    </button>
  );
}

// ── Floating devotion header ────────────────────────────────────────────────

interface DevotionHeaderProps {
  avatarUrl: string | null;
  avatarInitial: string;
  devotion: number;
  bones: number;
  packTotal: number | null;
  packToday: number | null;
  dogs: PackDog[];
  onProfile: () => void;
  onDog: (id: string) => void;
}

function VDivider() {
  return <div aria-hidden style={{ width: 1, height: 20, background: T.onDarkBorder, flexShrink: 0 }} />;
}

export function DevotionHeader({ avatarUrl, avatarInitial, devotion, bones, packTotal, packToday, dogs, onProfile, onDog }: DevotionHeaderProps) {
  const t = useT();
  const glassPill: React.CSSProperties = {
    background: T.glass,
    border: `1px solid ${T.onDarkBorder}`,
    borderRadius: 999,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: '0 12px 36px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,240,228,0.06)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
  };
  return (
    // Okraj lišty = okraj OBSAHU stĺpca pod ňou (PACK_COL_INNER, od `sm` padding 24),
    // nie rám stĺpca — dovtedy lišta na PC presahovala obsah o 24 px na každú stranu.
    <header
      className="w-[calc(100%-32px)] sm:w-[calc(100%-48px)]"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        top: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        maxWidth: PACK_COL_INNER,
        zIndex: 40,
        display: 'flex',
        alignItems: 'stretch',
        gap: 8,
      }}
    >
      {/* ── LEFT block 60%: member identity ── */}
      <div style={{ ...glassPill, flex: '3 1 0', minWidth: 0, gap: 10, width: '100%' }}>
        <button type="button" onClick={onProfile} style={{ flexShrink: 0, lineHeight: 0 }} aria-label={t('pack.layout.profileAriaLabel')}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={t('pack.layout.yourAvatarAlt')}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,154,63,0.45)', display: 'block' }}
            />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #F5C73D, #E69E1A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: '#1c160c',
              border: '2px solid rgba(201,154,63,0.45)',
            }}>
              {avatarInitial}
            </div>
          )}
        </button>
        <DogSvorka dogs={dogs} onDog={onDog} />
        <DevotionBarCompact devotion={devotion} />
        <BonesChip bones={bones} />
      </div>

      {/* ── RIGHT block 40%: DOGYPT global stats ── */}
      {/* Mobile: flex-[1_1_0] + smaller padding/icons. Desktop sm+: flex-[2_1_0] + full size. */}
      <div
        className="flex-[1_1_0] sm:flex-[2_1_0] px-2 py-2 sm:px-[14px] sm:py-[13px]"
        style={{
          ...glassPill,
          padding: undefined, // overridden by Tailwind px/py above
          flex: undefined,    // overridden by Tailwind flex above
          minWidth: 0,
          justifyContent: 'space-around',
          width: '100%',
          cursor: 'pointer',
        }}
        role="button"
        tabIndex={0}
        aria-label={t('pack.layout.jumpToStatsAriaLabel')}
        onClick={() => document.getElementById('wiz-globe')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('wiz-globe')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      >
        {/* PART A: badge icon + total count (gold number + pale zeros → 1M frame) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {/* Mobile: ikona 20px, desktop: 28px */}
          <img src={statBadge} alt="" aria-hidden className="h-5 w-auto sm:h-7" style={{ objectFit: 'contain', flexShrink: 0, display: 'block', filter: 'saturate(0.1) brightness(1.8) opacity(0.45)' }} />
          {packTotal == null ? (
            <span className="text-sm sm:text-[17px]" style={{ fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, color: 'rgba(245,240,228,0.4)', whiteSpace: 'nowrap' }}>—</span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
              {/* leading zeros — hidden on mobile, visible sm+ */}
              <span className="hidden sm:inline" style={{ fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: Math.round(17 * 0.8), color: 'rgba(245,240,228,0.2)', letterSpacing: '0.02em' }}>
                {'0'.repeat(Math.max(0, 7 - String(packTotal).length))}
              </span>
              {/* Mobile: 13px, desktop: 17px */}
              <span className="text-[13px] sm:text-[17px]" style={{ fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, color: T.cardEdge, letterSpacing: '0.02em' }}>
                {String(packTotal)}
              </span>
            </span>
          )}
        </div>
        {/* PART B: bars icon + new members 24h — schované na mobile (tam ostáva
            v pravej pilulke len celkový počet psov v DOGYPTe). sm:contents → na
            desktope divider + PART B participujú priamo v space-around layoute. */}
        <div className="hidden sm:contents">
          <VDivider />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src={statBars} alt="" aria-hidden style={{ height: 22, width: 'auto', objectFit: 'contain', flexShrink: 0, display: 'block', filter: 'saturate(0.1) brightness(1.8) opacity(0.45)' }} />
            <span style={{
              fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.02em', color: 'rgba(120,200,120,0.9)', whiteSpace: 'nowrap',
            }}>
              +{packToday ?? 0}/d
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function BonesChip({ bones }: { bones: number }) {
  return (
    <div
      title="BONES"
      aria-label={`${bones} BONES`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
    >
      {/* Minca = `BonesCoin`, jediný zdroj značky meny (locked 12. 9. 2026). */}
      <BonesCoin size="s" />
      <span style={{
        fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: 11,
        color: 'rgba(245,240,228,0.92)',
      }}>
        {bones.toLocaleString('en-US')}
      </span>
    </div>
  );
}


function DevotionBarCompact({ devotion }: { devotion: number }) {
  const lv = devotionLevel(devotion);
  return (
    <div style={{
      flex: '1 1 auto',
      minWidth: 56,
      position: 'relative',
      height: 22,
      borderRadius: 999,
      overflow: 'hidden',
      background: 'rgba(245, 240, 228, 0.07)',
      border: '1px solid rgba(245, 240, 228, 0.14)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: `${lv.pct}%`,
        background: 'linear-gradient(90deg, hsl(224 42% 42%), hsl(45 82% 55%))',
        transition: 'width 0.5s ease',
      }} />
      <span style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3, display: 'inline-flex', alignItems: 'baseline', gap: 2,
        pointerEvents: 'none',
        fontFamily: 'system-ui,-apple-system,Arial,sans-serif', fontWeight: 700, fontSize: 11,
        color: 'rgba(245, 240, 228, 0.92)', letterSpacing: '0.02em',
        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
      }}>
        {Math.round(devotion).toLocaleString('en-US')}
        <i style={{ fontStyle: 'normal', fontSize: 10 }}>☥</i>
      </span>
    </div>
  );
}

function DogSvorka({ dogs, onDog }: { dogs: PackDog[]; onDog: (id: string) => void }) {
  const t = useT();
  // Slajdovateľná svorka od 3 psov — pevný maxWidth, takže psy scrollujú horizontálne
  // a nikdy netlačia devotion bar / bones v header pilulke (najmä mobil).
  const scrollable = dogs.length >= 3;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
      overflowX: scrollable ? 'auto' : 'visible',
      maxWidth: scrollable ? 112 : undefined,
      // hide scrollbar
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    } as React.CSSProperties}>
      {dogs.map((dog) => (
        <button
          key={dog.id}
          type="button"
          onClick={() => onDog(dog.id)}
          style={{ flexShrink: 0, lineHeight: 0 }}
          aria-label={dog.dog_name || t('pack.layout.dogFallbackAriaLabel')}
        >
          {dog.cloudinary_main_url ? (
            <img
              src={dog.cloudinary_main_url}
              alt={dog.dog_name || ''}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${PACK_THEME.border}`, display: 'block' }}
            />
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(201, 154, 63, 0.22)',
              border: `1.5px solid ${PACK_THEME.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13,
            }}>🐕</div>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Shared background ───────────────────────────────────────────────────────

export function HieroglyphBg() {
  return (
    <>
      {/* 100lvh (nie inset:0) — na mobile stabilné pozadie pri scroll (URL bar zmena viewportu) */}
      <div
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100lvh',
          backgroundImage: "url('/images/bg-dark.webp')",
          backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)', zIndex: 0, pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100lvh',
          background: 'radial-gradient(ellipse at center, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.45) 60%, rgba(5,5,5,0.6) 100%)',
          zIndex: 0, pointerEvents: 'none',
        }}
      />
    </>
  );
}

// ── Bottom pill nav ─────────────────────────────────────────────────────────

/* 🔴 UŽŠIA LIŠTA (Matej 22. 9. 2026: „spodný nav musí byť užší, keďže nemáme texty").
   Bočné odsadenie položky 16 → 12 a medzery v krídlach 10 → 4: vzduch po menovkách,
   ktoré 21. 9. zanikli. Výška ani `DOCK` sa NEMENIA — lock blok1-nav: „keby mal dostať
   bočný okraj, platí sa zmenšením krídel, nie zmenou DOCK". */
const NAV_ITEM_PAD = '12px 12px';
const NAV_WING_GAP = 4;

const pillStyle = (active: boolean): React.CSSProperties =>
  NAV_SKIN === 'gold' ? {
    padding: NAV_ITEM_PAD,
    // PLNÁ pilulka — v predlohe sú MAP aj G celkom okrúhle. Hranatý bol len bar.
    borderRadius: 999,
    // Neaktívna položka NIE JE vyblednutá: v predlohe je HOME rovnako tmavé ako MAP,
    // rozdiel nesie vystúpená pilulka, nie sila inkoustu.
    color: NAV_GOLD.ink,
    background: active ? NAV_GOLD.activeFill : 'transparent',
    border: `${NAV_R.line}px solid ${active ? NAV_GOLD.edge : 'transparent'}`,
    boxShadow: active ? NAV_PILL_SHADOW : 'none',
    textDecoration: 'none',
    position: 'relative',
  } : ({
  padding: '12px 16px',
  borderRadius: 999,
  color: active ? '#FFF6E6' : T.onDarkDim,
  background: active
    ? 'linear-gradient(135deg, hsl(45 80% 48%) 0%, hsl(224 50% 42%) 100%)'
    : 'transparent',
  boxShadow: active
    // Tieň drží farbu vlastného gradientu (zlatá → modrá), nie zdedenú fialovú.
    ? '0 5px 16px -5px rgba(16, 52, 166, 0.55), inset 0 1px 0 rgba(255,255,255,0.25)'
    : 'none',
  textDecoration: 'none',
  });

/* ⚠️ NEPOUŽITÉ OD 21. 9. 2026 — menovky v spodnom nave zanikli (Matej: „len ikonky bez
   vysvetľovania"). NEMAŽE SA: je to jediný zápis, ako menovka vyzerala — keby sa mal text
   niekedy vrátiť, vráti sa V TOMTO tvare, nie v novom vymyslenom.
   eslint-disable-next-line @typescript-eslint/no-unused-vars */
const pillLabelStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontSize: 11,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  fontWeight: 700,
};

function BrandIcon({ src, active }: { src: string; active: boolean }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className="h-5 w-5 shrink-0"
      style={{
        position: 'relative',
        filter: NAV_SKIN === 'gold' ? 'brightness(0)' : 'brightness(0) invert(1)',
        opacity: active ? (NAV_SKIN === 'gold' ? 0.92 : 1) : 0.55,
        transition: 'opacity 0.15s',
      }}
    />
  );
}

/**
 * AINUBIS — štvrté miesto chrbtice (21. 9. 2026).
 *
 * Do 21. 9. sedel v KOTÚČI v strede lišty a klik otváral overlay chatu (`openAinubis()`).
 * Odteraz je to MIESTO s vlastnou adresou `/pack/ainubis` a pristáva na rovine VAULT —
 * nie na chate: v rovine CHAT spodná lišta MIZNE (kôš 3), takže by záložka viedla do
 * miesta, kde sa tá istá záložka okamžite skryje.
 * ⚠️ NÁSTENKA TO NIE JE (Matej 24. 9. 2026, voľba A1). Do 24. 9. tu stálo, že lišta
 *    mizne aj v nej — nemizne: nástenka je ČÍTANIE (kôš 2), lišta aj pilulky rovín
 *    v nej ostávajú. Rozhodnuté nad `plany/nakres-nastenka-zdroje-2026-09-24.html`.
 *
 * ⚠️ `ainubisBus` sa NERUŠÍ. `openAinubis()` volajú `Gateways.tsx`, `MapCoach.tsx`, dlaždica
 *    chatu v kostre aj položka „nový rozhovor" v paneli `+` — záložka len naviguje.
 * ⚠️ ODZNAK NEPREČÍTANÝCH TU UŽ NIE JE (Matej 23. 9. 2026: „ano iba ikonka"). Prišiel sem
 *    z kotúča 21. 9. preto, že plávajúca guľa bola v `/pack` skrytá a číslo by nenieslo nič.
 *    23. 9. sa guľa vrátila nad lištu a nesie ho zase ona — číslo na dvoch miestach naraz
 *    by bola tá istá správa dvakrát. A je to aj správnejšie miesto: **guľa chat OTVORÍ**,
 *    kým táto záložka vedie na `/pack/ainubis` (rovina VAULT), kde tie správy nie sú.
 *    Kresba odznaku ostáva v `DOCK_MEDAL_CSS` (`packDockMedal.tsx`) — keby sa lišta opäť
 *    stala spúšťačom chatu, netreba ju písať nanovo.
 *
 * ✅ IKONKA ROZHODNUTÁ 22. 9. 2026 — `idea.svg` (hlava so žiarovkou). Matej: „namiesto
 *    ikony sfingy psa daj ikonku, ktorá je v ainubisovi ako pochopenie". Tá istá kresba
 *    nesie vo VAULTE svet POCHOPENIE (`vault/worlds.ts`) — zámerne jedna značka pre
 *    „miesto, kde sa učím". Predtým tu bola návrhom `dogsphinx.svg`, ktorú si ďalej drží
 *    svet CESTA PSA.
 */
function AinubisNavLink({ label }: { label: string }) {
  return <FloatingNavLink to="/pack/ainubis" label={label} icon="/icons/pack/idea.svg" />;
}

function FloatingNavLink({ to, label, icon, end }: { to: string; label: string; icon: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className="group flex items-center gap-2 transition-all"
      style={({ isActive }) => pillStyle(isActive)}
    >
      {({ isActive }) => (
        <>
          {NAV_SKIN === 'gold' && isActive && <NavGrain radius={999} opacity={0.22} />}
          <BrandIcon src={icon} active={isActive} />
          {/* 🔴 MENOVKA ZANIKLA 21. 9. 2026 (Matej: „spodný nav nechajme len ikonky bez
              vysvetľovania DOMOV VON a pod..."). Do vtedy sa nad 640 px vypisovala
              (`hidden sm:inline`), takže lišta mala na PC iný jazyk než na telefóne —
              a na telefóne, kde je appka doma, ju nikto nikdy nevidel.
              ⚠️ `label` sa NEMAŽE: nesie ho `aria-label` nižšie, teda čítačka obrazovky.
              Ikonka bez mena je pre ňu prázdny odkaz. */}
        </>
      )}
    </NavLink>
  );
}


