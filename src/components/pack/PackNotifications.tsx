import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BrandIcon } from './BrandIcon';
import { HandTail } from './HandIcons';
import { NotifSheet } from './NotifSheet';
import { PACK_THEME } from './packTheme';
import { pluralKey } from '@/lib/plural';
import { useT } from '@/i18n/LanguageContext';
import { openAinubis, getAinubisUnread, onAinubisUnread } from '@/lib/ainubisBus';
import { AINUBIS } from './ainubisSkin';
import ainubisFace from '@/assets/ainubis-badge.webp';
// Odznak v kapsule = ČERVENÁ zo SNIFFERu s bielym číslom (Matej 26. 9.: „červené upozornenia
// s bielym textom… červená zo sniffer“). Jedna červená v appke, nie nový odtieň.
import { SNIFFER_HEART } from './buddy/SnifferLogo';
import { DEV_FULL } from '@/lib/packFlags';
import { TEST_BUILD } from '@/lib/env';
import { LAPIS } from './navGoldSkin';
// Lazy, rovnaký dôvod ako pri `packAlerts`: `packHumans` ťahá `packStore`.
const respondWalkInviteLazy = (id: string, accept: boolean) =>
  import('@/lib/packHumans').then((m) => m.respondWalkInvite(id, accept));
// `import type` (nie runtime import) — packMessaging.ts ťahá pri module-load
// HERO_TRAILS (1,5 MB) a HERO_JOURNEYS; esbuild/Vite `import type` úplne vytrasí (isolatedModules),
// takže tento riadok sa do bundlu nedostane. Runtime funkcie (getMe/unreadCount/…) sa nahrádzajú
// dynamickým import()-om nižšie, vyhodnoteným až v efekte, keď je DEV_FULL true.
import type { Conversation } from './messaging/packMessaging';
import { emitOpenInbox, emitOpenThread } from './messaging/openBridge';
// UPOZORNENIA (NOS) — rovnaký dôvod pre `import type` + dynamický import ako pri messagingu:
// `packAlerts` siaha cez `tripLabel` na dataset trás a cez `tripShared` na packStore.
import type { PackAlert } from './packAlerts';
import { useNavigate } from 'react-router-dom';

const T = PACK_THEME;

// Kapsula (variant B, 26. 9. 2026): čierna plocha, zlatý lem = konštrukcia, nie CTA.
const CAPSULE: React.CSSProperties = {
  zIndex: 12,
  width: 'fit-content',
  padding: 4,
  borderRadius: 999,
  background: T.pageBg,
  border: `1.5px solid ${T.cardEdge}`,
  boxShadow: T.panelShadow,
};
// LEN IKONKY (24. 10. 2026, Matej: *„skúsme to bez bubliniek a pils — len ikonky"*,
// nákres `plany/nakres-header-vyska-2026-10-24.html`). Obálka a chvost stoja holé v rade, ktorý
// má 40 px; tlačidlo ostáva 44 (dotyk), takže o 2 px presahuje rad hore aj dole — nevidno to.
// Kapsula ostala LEN kolieska AINUBISA (`HubAinubis` nižšie) — to je jeho podobizeň, nie ikonka.
// Farba podľa PODKLADU: na tmavom zlato, na papyruse tmavý atrament (zlato na zlatom zanikne).
const ICON_ROW: React.CSSProperties = { zIndex: 12, gap: 4 };
const capBtn = (active: boolean, dark: boolean): React.CSSProperties => ({
  width: 44,
  height: 44,
  borderRadius: 999,
  border: 'none',
  background: active ? 'rgba(201,154,63,0.18)' : 'transparent',
  color: dark ? T.cardEdge : T.inkStrong,
  cursor: 'pointer',
});
// Odznak bez kapsuly = BODKA, nie číslo (Matej 24. 10.: „áno daj to tak“). Červená = sociálne.
const CAP_DOT: React.CSSProperties = {
  position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 999,
  background: SNIFFER_HEART, boxShadow: `0 0 0 1.5px ${T.pageBg}`,
};
// ODZNAK S ČÍSLOM NA CHVOSTE (26. 10. 2026, TEST_BUILD). Matej 24. 10. vybral bodku (vyššie), 26. 10. nad
// krokom 1: *„myslel som bodku cyan s upozornením … bodka s číslom tak ako bude aj červené upozornenie"*.
// Novší pokyn platí pre chvost; obálka správ ostáva bodkou. Červená = od členov, cyan = AINUBIS a systém.
// Oba naraz (Matej 26. 10.: *„môžu byť aj dve naraz a zobrazia sa spolu jedno hore jedno dolu
// (červená/cyan)"*) — červená hore vpravo, cyan dole vpravo; samotný cyan ostáva tiež dole.
// Menšie a bez obruby (Matej 26. 10.: *„upozornenie bez ohraničenia skúsme a asi aj menšie… musia sa
// zmestiť dve bodky pri chvoste aj správach"*) — 14 px, dve pod sebou sa zmestia do 40 px kapsuly.
const capBadge = (cyan: boolean): React.CSSProperties => ({
  position: 'absolute', ...(cyan ? { bottom: 4 } : { top: 4 }), right: 4, minWidth: 14, height: 14, padding: '0 4px', borderRadius: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
  fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 600,
  background: cyan ? AINUBIS.cyan : SNIFFER_HEART, color: cyan ? AINUBIS.bg : '#fff',
});

// ── OZNAM AINUBISA = CYAN BODKA (26. 10. 2026, len za TEST_BUILD) ─────────────────────────────
// Matej: *„každé prihlásenie hlási cyan upozornenie — kde oznámime počet členov (ak pribudnú) alebo
// nejaký oznam"* · *„cyan = systém + AINUBIS · červená = upozornenia od členov"*. Riadok je v
// `AinubisOznam.tsx`, tu sa len rozhoduje, či svieti ako nový:
//   · „prihlásenie" = nové otvorenie appky (sessionStorage) — po otvorení panela zhasne do ďalšieho;
//   · prírastok = psy s číslom (`total` z `get-pack-stats.dogs`, ten istý počet ako homepage), porovnaný
//     s číslom, ktoré človek videl pri poslednom otvorení panela (localStorage).
// Do dnes to isté miesto rozsvecoval prírastok za 24 h ČERVENOU — systém sa tvári ako člen.
const OZNAM_SEEN_KEY = 'pack-oznam-seen';
const SEEN_DOGS_KEY = 'pack-seen-dogs';
function readOznamSeen(): boolean {
  try { return sessionStorage.getItem(OZNAM_SEEN_KEY) === '1'; } catch { return false; }
}
function readSeenDogs(): number | null {
  try { const v = Number(localStorage.getItem(SEEN_DOGS_KEY)); return v > 0 ? v : null; } catch { return null; }
}
function markOznamSeen(dogs: number | null | undefined): void {
  try {
    sessionStorage.setItem(OZNAM_SEEN_KEY, '1');
    if (dogs && dogs > 0) localStorage.setItem(SEEN_DOGS_KEY, String(dogs));
  } catch { /* súkromné okno — oznam sa ukáže znova, nič sa nerozbije */ }
}

type PackMessagingModule = typeof import('./messaging/packMessaging');
type PackAlertsModule = typeof import('./packAlerts');

// unread konverzácie pre dropdown položky — rovnaká logika ako Inbox.tsx (zámerne duplikovaná,
// UI komponenty na seba nenaväzujú, viď packMessaging.ts vzor).
function hasUnread(conv: Conversation, meId: string): boolean {
  if (!conv.memberIds.includes(meId)) return false;
  const readAt = conv.lastReadAt[meId] ?? '';
  return conv.messages.some((m) => m.senderId !== meId && m.createdAt > readAt);
}

interface PackNotificationsProps {
  last24h?: number | null;
  last30d?: number | null;
  total?: number | null;
  /** Global top-right chrome mount (D4 nav rework, DEV_FULL-only) sits directly on the
   * dark page bg (HieroglyphBg), NOT on the light papyrus HeroCard — needs onDark tokens
   * + fixed positioning instead of the original absolute-inside-a-card behaviour.
   * Default (false) = byte-identical to the original HeroCard mount (LIVE + DEV_FULL both
   * still render it there unchanged when `dark` is omitted). */
  dark?: boolean;
  /** Extra className on the wrapper — lets a specific page override the top:16/right:16
   * position via its own scoped CSS, or (D4 nav rework, round 2) cancel the 'inline' width:100%
   * when the hub is appended into an existing row instead of getting its own (e.g. PackMap's
   * map header status row — `.trp-status-notif` in PackMap.tsx). */
  className?: string;
  /** 'overlay' (default) = original top:16/right:16 corner float (fixed when `dark`, absolute
   * inside the HeroCard otherwise) — UNCHANGED behaviour.
   * 'inline' = normal content-flow row, right-aligned inside whatever box the parent gives it
   * (D4 nav rework amendment 2026-07-24: on narrow-column /pack pages this hub sits ABOVE the
   * content, right-edge aligned to the column — not floating past the screen edge; PackLayout
   * wraps it in the same max-w column as everything else). */
  layout?: 'overlay' | 'inline';
  /** KAPSULA (Matej 26. 9. 2026, audit homepage, variant B3): obálka + nos (+ na mobile
   *  od 26. 9. poobede BEZ oka AINUBISA — to má vlastné koliesko vľavo, `HubAinubis`) v JEDNOM tmavom ovále so zlatým lemom. Dôvod: dve samostatné kolieska
   *  38 px zanikali pri scrollovaní — papyrusové na papyruse, sklenené na tmavej karte.
   *  Čierna kapsula so zlatým lemom je jediná, ktorá je vidieť na oboch podkladoch.
   *  Zapína ju len `PackTopRight` (stĺpcové stránky /pack); hlavička mapy má vlastný rad. */
  capsule?: boolean;
}


export function PackNotifications({ last24h, last30d, total, dark = false, className, layout = 'overlay', capsule = false }: PackNotificationsProps) {
  const inline = layout === 'inline';
  const t = useT();
  const [open, setOpen] = useState(false);
  const closeSheet = useCallback(() => setOpen(false), []);
  // CHVOST SA ZAVRTÍ (21. 10. 2026, Matej: „po kliknutí na chvost by bolo dobré urobiť mini
  // animáciu, ako sa zavrtí"). Panel sa vysunie až o chvíľu, aby bolo zavrtenie vidno —
  // na mobile ho panel cez celú stranu inak hneď prekryje. Zavrtí sa aj chvost v hlavičke panela.
  const [wag, setWag] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Dropdown is portaled to <body> (fixed, viewport-anchored) — ancestors like
  // .trp-status-row use backdrop-filter, which creates its own stacking context and
  // traps any in-place z-index inside it, so a later sibling (search/filter row) always
  // painted over this panel regardless of zIndex (recurring bug class, see
  // BreedPatronScreen's dropRect for the same fix pattern).
  const panelRef = useRef<HTMLDivElement>(null);
  // Color tokens — light (original, on papyrus card) vs dark (global chrome, on pageBg).
  // Dark variant's trigger buttons get a T.glass backing (not transparent) — this hub also
  // mounts on PackMap's full-bleed light map (not just the black hieroglyph bg), so a
  // transparent pale-on-pale button would vanish there; same blurred glass chip language as
  // the bottom nav / PackMap's own map controls.
  // ⚠️ BLEDÝ VARIANT MÁ PLNÝ KOTÚČ, NIE PRIESVITNÝ OBRYS (Matej 12. 9. 2026:
  // „pri bledom režime sú notifikácie a správy slabo viditeľné = mali by byť ako
  // v tmavom móde alebo nejak inak, aby vynikli a nezanikli ako teraz").
  // Do dneška mal `buttonBg: 'transparent'` + slabý `T.border`, takže z tlačidla
  // ostal bledý obrys na bledej tapete a zmizol. Tmavý variant vyniká preto, že má
  // PLNÚ výplň (`T.glass`), lem a vrhnutý tieň — bledý dostáva to isté v papyrusovej
  // reči: `PACK_BOX.panel` (plávajúci prvok NAD stránkou), teda `panelGrad` +
  // 1.5px `cardEdge` + `panelShadow`. Inkoust ide na `inkStrong`, lebo `ink` je na
  // papyruse rovnaká šeď ako popisky a ikonka sa v nej stráca.
  // ⚠️ Nie je to lapis ani zlatá plocha: sú to DVE rovnocenné tlačidlá chrome, nie
  // hlavné CTA — plná farba je rezervovaná pre jediné CTA na obrazovke.
  const c = dark
    ? { border: T.onDarkBorder, ink: T.onDark, inkDim: T.onDarkDim, hairline: T.onDarkHair, panelBg: T.glass, badgeBorder: T.pageBg, buttonBg: T.glass, buttonShadow: '0 4px 14px rgba(0,0,0,0.4)', buttonBorderW: 1 }
    : { border: T.cardEdge, ink: T.inkStrong, inkDim: T.inkDim, hairline: T.hairline, panelBg: T.card, badgeBorder: T.card, buttonBg: T.panelGrad, buttonShadow: T.panelShadow, buttonBorderW: 1.5 };

  // packMessaging modul sa načíta dynamicky, len keď je DEV_FULL true (na LIVE sa toto
  // import() telo nikdy nespustí → chunk sa nestiahne). msgCount preto štartuje na 0 a
  // dorovná sa hneď ako import() resolvne (rovnaký tick, žiadny viditeľný "coming soon" stav
  // medzitým — bunka je skrytá/disabled len keď !DEV_FULL, viď JSX nižšie).
  const [messaging, setMessaging] = useState<PackMessagingModule | null>(null);
  useEffect(() => {
    if (!DEV_FULL) return;
    let cancelled = false;
    import('./messaging/packMessaging').then((m) => { if (!cancelled) setMessaging(m); });
    return () => { cancelled = true; };
  }, []);

  // ── NOS: upozornenia (Matej 26. 8. 2026: „nos sú upozornenie a obálka sú správy") ──
  // Modul sa načíta rovnakou cestou ako messaging — dynamicky a len za DEV_FULL, aby sa
  // dataset trás nedostal do hlavného bundlu.
  const navigate = useNavigate();
  const [alertsMod, setAlertsMod] = useState<PackAlertsModule | null>(null);
  const [alerts, setAlerts] = useState<PackAlert[]>([]);
  const [answering, setAnswering] = useState<string | null>(null);
  useEffect(() => {
    if (!DEV_FULL) return;
    let cancelled = false;
    void import('./packAlerts').then((m) => { if (!cancelled) setAlertsMod(m); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!alertsMod) return;
    let cancelled = false;
    const load = () => { void alertsMod.loadAlerts().then((a) => { if (!cancelled) setAlerts(a); }); };
    load();
    // Znovu pri návrate na kartu — žiadosť mohla prísť, kým bola appka na pozadí. Bez toho
    // by odznak visel na starom čísle až do reloadu.
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', onVis); };
  }, [alertsMod]);

  // Neprečítané sa počítajú pri každom renderi zo živej `seen` — otvorenie panela ju zmení
  // a odznak musí zhasnúť hneď, nie až po ďalšom načítaní.
  const [seenEpoch, setSeenEpoch] = useState(0);
  const freshAlerts = alertsMod ? alertsMod.unseen(alerts, alertsMod.readSeen()) : [];
  void seenEpoch; // len spúšťač prepočtu vyššie

  const [msgCount, setMsgCount] = useState(0);
  const [meId, setMeId] = useState('me');
  const [unreadConvs, setUnreadConvs] = useState<Conversation[]>([]);
  useEffect(() => {
    if (!DEV_FULL || !messaging) return;
    const me = messaging.getMe();
    setMeId(me.id);
    const load = () => {
      setMsgCount(messaging.unreadCount());
      messaging.listConversations().then((cs) => setUnreadConvs(cs.filter((c) => hasUnread(c, me.id))));
    };
    load();
    return messaging.subscribe(load);
  }, [messaging]);

  // click-away close — must check both the trigger (wrapRef) AND the portaled panel
  // (panelRef lives outside wrapRef in the DOM now), else any click inside the dropdown
  // is seen as "outside" and closes it instantly.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);


  // Odznak NOSA = neprečítané upozornenia + dnešný prírastok svorky. Správy sa sem
  // ZÁMERNE nepočítajú — má ich obálka vedľa a dve rovnaké čísla vedľa seba nič nehovoria.
  const bellCount = (last24h ?? 0) + freshAlerts.length;
  // TEST_BUILD: červená = len od členov, cyan = oznam AINUBISA / prírastok (hlavička súboru).
  const [oznamFresh, setOznamFresh] = useState(() => TEST_BUILD && !readOznamSeen());
  const [seenDogs] = useState(readSeenDogs);
  const grown = TEST_BUILD && total && seenDogs && total > seenDogs ? total - seenDogs : 0;
  const memberDot = TEST_BUILD ? freshAlerts.length > 0 : bellCount > 0;
  const cyanDot = TEST_BUILD && oznamFresh;

  return (
    <div
      ref={wrapRef}
      className={`${capsule ? 'relative ml-auto' : inline ? 'relative w-full justify-end' : dark ? 'fixed' : 'absolute'} flex items-center${capsule ? '' : ' gap-1.5'}${className ? ` ${className}` : ''}`}
      style={capsule ? ICON_ROW : inline ? { zIndex: 12 } : { top: 16, right: 16, zIndex: dark ? 45 : 12 }}
    >
      {/* Messages — LIVE za DEV_FULL (opens Inbox overlay); LIVE build (bez DEV_FULL) ostáva
          presne ako predtým, "coming soon" disabled (§8.4 zadania — bez regresie). */}
      {DEV_FULL ? (
        <button
          type="button"
          onClick={() => emitOpenInbox()}
          data-mg="msgs"
          aria-label={t('pack.notif.messages')}
          title={t('pack.notif.messages')}
          className="relative inline-flex items-center justify-center"
          style={capsule ? capBtn(false, dark) : {
            width: 38,
            height: 38,
            borderRadius: 999,
            border: `${c.buttonBorderW}px solid ${c.border}`,
            background: c.buttonBg,
            boxShadow: c.buttonShadow,
            color: c.ink,
            cursor: 'pointer',
          }}
        >
          {/* Na tmavom skle je zlata spravna; na papyrusovom kotuci je zlata na zlatom
              a obalka zanikne rovnako, ako zanikalo cele tlacidlo. `dark` (#5A3F12) je
              ten isty tint, akym sa kreslia ikonky na zlatych plochach. */}
          <BrandIcon name="envelope" size={capsule ? 24 : 16} tint={dark ? 'gold' : 'dark'} />
          {msgCount > 0 && capsule && (TEST_BUILD
            ? <span aria-hidden style={capBadge(false)}>{msgCount > 9 ? '9+' : msgCount}</span>
            : <span aria-hidden style={CAP_DOT} />)}
          {msgCount > 0 && !capsule && (
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 999,
                background: capsule ? SNIFFER_HEART : T.accentGold,
                color: capsule ? '#fff' : T.ink,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: capsule ? 10 : 9,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${capsule ? T.pageBg : c.badgeBorder}`,
                lineHeight: 1,
              }}
            >
              {msgCount > 9 ? '9+' : msgCount}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          disabled
          data-mg="msgs"
          aria-label={t('pack.notif.ariaMessages')}
          title={t('pack.notif.ariaMessages')}
          className="relative inline-flex items-center justify-center"
          style={{
            width: 38,
            height: 38,
            borderRadius: 999,
            border: `1px solid ${T.hairline}`,
            background: 'transparent',
            color: T.inkDim,
            opacity: 0.5,
            cursor: 'default',
          }}
        >
          <BrandIcon name="chat" size={16} tint="gold" />
          <span
            style={{
              position: 'absolute',
              bottom: -5,
              right: -3,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: T.inkDim,
              background: T.card,
              padding: '0px 4px',
              borderRadius: 8,
              border: `1px solid ${T.hairline}`,
              lineHeight: 1,
            }}
          >
            {t('pack.notif.soon')}
          </span>
        </button>
      )}

      {/* NOS — upozornenia, napravo od obálky na všetkých povrchoch (Matej 2026-07-26) */}
      <button
        type="button"
        onClick={() => { setWag((w) => w + 1); window.setTimeout(() => setOpen((p) => {
          const next = !p;
          // Otvorenie = prečítanie. Označujeme presne to, čo bolo v tej chvíli na zozname —
          // nie „všetko", inak by žiadosť, ktorá dorazí o sekundu neskôr, zhasla nevidená.
          if (next && alertsMod && freshAlerts.length) {
            alertsMod.markSeen(freshAlerts.map((x) => x.id));
            setSeenEpoch((e) => e + 1);
          }
          if (next && TEST_BUILD) { markOznamSeen(total); setOznamFresh(false); }
          return next;
        }), open ? 0 : 260); }}
        aria-label={t('pack.notif.ariaNotifications')}
        data-mg="notif"
        className="relative inline-flex items-center justify-center"
        style={capsule ? capBtn(open, dark) : {
          width: 38,
          height: 38,
          borderRadius: 999,
          border: `${c.buttonBorderW}px solid ${c.border}`,
          // Otvorený stav = stmavená TÁ ISTÁ výplň, nie iný materiál. Na papyruse to
          // robí zlatý tint nad gradientom (holé `rgba(31,26,14,0.05)` by pod sebou
          // nemalo nič, keďže bledý variant mal doteraz priesvitné pozadie).
          background: open
            ? (dark ? 'rgba(245,240,228,0.14)' : `linear-gradient(0deg, rgba(201,154,63,0.18), rgba(201,154,63,0.18)), ${T.panelGrad}`)
            : c.buttonBg,
          boxShadow: c.buttonShadow,
          color: c.ink,
          cursor: 'pointer',
        }}
      >
        <HandTail key={wag} size={capsule ? 24 : 17} className={wag ? 'ntf-wag' : undefined} />
        <style>{WAG_CSS}</style>
        {memberDot && capsule && (TEST_BUILD
          ? <span aria-hidden style={capBadge(false)}>{freshAlerts.length > 9 ? '9+' : freshAlerts.length}</span>
          : <span aria-hidden style={CAP_DOT} />)}
        {cyanDot && capsule && <span aria-hidden style={capBadge(true)}>1</span>}
        {bellCount > 0 && !capsule && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 999,
              background: capsule ? SNIFFER_HEART : T.accentGold,
              color: capsule ? '#fff' : T.ink,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: capsule ? 10 : 9,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1.5px solid ${capsule ? T.pageBg : c.badgeBorder}`,
              lineHeight: 1,
            }}
          >
            {bellCount > 9 ? '9+' : bellCount}
          </span>
        )}
      </button>

      {/* PANEL CEZ CELÚ STRANU (21. 10. 2026) — `NotifSheet.tsx`. Predtým tu bol malý priesvitný
          dropdown pod chvostom (Matej: „je priehľadný a nie čitateľný"). Riadky upozornení ostali
          tie isté, len stoja v papyrusovom skle pod blokom DOGYPT STATS. „Tep svorky" (prírastok
          dnes / za 30 dní / spolu) odišiel do bloku STATS. */}
      {open && createPortal(
        <NotifSheet ref={panelRef} onClose={closeSheet} hasReal={DEV_FULL && (alerts.length > 0 || unreadConvs.length > 0)}
          oznam={TEST_BUILD ? { grown } : undefined}>
          {DEV_FULL && alerts.length > 0 && (
            <>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: '0.26em',
                  textTransform: 'uppercase', color: T.inkDim, marginBottom: 8,
                }}
              >
                {t('pack.alerts.title')}
              </div>
              <ul className="flex flex-col gap-2 mb-3">
                {alerts.slice(0, 6).map((al) => al.kind === 'walk_invite' ? (
                  // POZVÁNKA „bol si so mnou" (15. 10. 2026) — rozhoduje sa TU, nie na výlete:
                  // výlet môže ešte čakať na schválenie a pozvaný by ho nevedel otvoriť.
                  <li key={al.id} className="flex items-start gap-2">
                    <HandTail size={14} style={{ flexShrink: 0, marginTop: 2, color: T.accentGold }} />
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, lineHeight: 1.35, color: T.inkStrong }}>
                        {t('pack.alerts.walkInvite', { who: al.who || t('pack.triplist.fallbackDogyptian') })}
                      </span>
                      <span style={{ display: 'block', fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.02em', textTransform: 'uppercase', color: T.accentGold, marginTop: 1 }}>
                        {al.tripName}
                      </span>
                      <span className="flex gap-2" style={{ marginTop: 8 }}>
                        {([true, false] as const).map((yes) => (
                          <button
                            key={String(yes)}
                            type="button"
                            disabled={!!answering}
                            onClick={async () => {
                              if (!al.inviteId || !alertsMod) return;
                              setAnswering(al.id);
                              const ok = await respondWalkInviteLazy(al.inviteId, yes);
                              setAnswering(null);
                              if (ok) setAlerts((prev) => prev.filter((x) => x.id !== al.id));
                            }}
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600,
                              padding: '4px 12px', borderRadius: 8, cursor: 'pointer',
                              ...(yes
                                ? { background: LAPIS.grad, color: '#fff', border: `1px solid ${LAPIS.edge}` }
                                : { background: 'none', color: T.inkDim, border: `1px solid ${T.hairline}` }),
                            }}
                          >
                            {t(yes ? 'pack.alerts.walkInviteYes' : 'pack.alerts.walkInviteNo')}
                          </button>
                        ))}
                      </span>
                    </span>
                  </li>
                ) : (
                  <li key={al.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        // Žiadosť sa vybavuje v zozname výletov (tam je meno aj tlačidlo PRIJAŤ),
                        // prijatie aj cudzie prejdenie patria na samotný výlet — tam človek vidí,
                        // s kým ide, a pri prejdení má rovno tlačidlo zapísať si ho aj za seba.
                        navigate(al.kind === 'trip_request' ? '/pack/map/triplist' : al.tripPath);
                      }}
                      className="flex items-start gap-2 w-full text-left"
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                    >
                      <HandTail size={14} style={{ flexShrink: 0, marginTop: 2, color: T.accentGold }} />
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            display: 'block', fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 14, lineHeight: 1.35, color: T.inkStrong,
                          }}
                        >
                          {al.kind.startsWith('wish_')
                            // Priania: miesto stojí v riadku pod vetou (zlaté), veta ho neopakuje.
                            ? t('pack.alerts.' + ({ wish_me_too: 'wishMeToo', wish_ask: 'wishAsk', wish_missed: 'wishMissed', wish_nudge: 'wishNudge' } as Record<string, string>)[al.kind], { who: al.who || t('pack.triplist.fallbackDogyptian') })
                            : al.kind.startsWith('event_')
                            // Podujatia: veta podľa druhu, pri „niekto sa pridal" s počtom.
                            ? (al.kind === 'event_rsvp'
                              ? t('pack.alerts.eventRsvp' + pluralKey(al.count), { count: al.count })
                              : t('pack.alerts.' + ({ event_changed: 'eventChanged', event_cancelled: 'eventCancelled', event_reminder: 'eventReminder', event_held_ask: 'eventHeldAsk' } as Record<string, string>)[al.kind]))
                            : al.kind === 'pawmate_joined'
                            ? t('pack.alerts.pawmateJoined', { who: al.who || t('pack.triplist.fallbackDogyptian') })
                            : al.kind === 'trip_request'
                            ? t('pack.alerts.request' + pluralKey(al.count), { count: al.count })
                            : al.kind === 'trip_walked'
                              // Pozvánka, nie hotový záznam — appka za človeka nič nezapisuje
                              // (viď packAlerts.ts, tretí druh). Počet ľudí, čo už výlet
                              // zapísali, sa ZÁMERNE nespomína: na rozhodnutí „zapíš si ho aj
                              // ty" nič nemení a jedna veta sa číta rýchlejšie než tri tvary.
                              ? t('pack.alerts.walked')
                              : t('pack.alerts.accepted')}
                        </span>
                        <span
                          style={{
                            display: 'block', fontFamily: "'Cinzel', serif", fontWeight: 700,
                            fontSize: 10, letterSpacing: '0.02em', textTransform: 'uppercase',
                            color: T.accentGold, marginTop: 1,
                          }}
                        >
                          {al.tripName}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
                          </>
          )}
          {DEV_FULL && unreadConvs.length > 0 && (
            <>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: '0.26em',
                  textTransform: 'uppercase', color: T.inkDim, marginBottom: 8,
                }}
              >
                Messages
              </div>
              <ul className="flex flex-col gap-2 mb-3">
                {unreadConvs.map((conv) => {
                  const isGroup = conv.kind === 'group';
                  const other = !isGroup ? conv.members.find((p) => p.id !== meId) : undefined;
                  const name = isGroup ? (conv.title ?? 'Pack group') : (other?.name ?? 'Dogyptian');
                  const last = conv.messages[conv.messages.length - 1];
                  return (
                    <li key={conv.id}>
                      <button
                        type="button"
                        onClick={() => { setOpen(false); emitOpenThread(conv.id); }}
                        className="flex items-start gap-2 w-full text-left"
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                      >
                        <span
                          aria-hidden
                          style={{
                            flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                            background: 'radial-gradient(circle at 35% 30%, #F5C73D, #E69E1A)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 10, color: T.ink,
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: T.inkStrong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {name}
                            </span>
                            <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: '50%', background: T.accentGold }} />
                          </span>
                          {conv.tag?.kind === 'trip' && conv.tag.label && (
                            <span style={{ display: 'block', fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.02em', textTransform: 'uppercase', color: T.accentGold, marginTop: 1 }}>
                              🥾 {conv.tag.label}
                            </span>
                          )}
                          {last && (
                            <span style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: T.inkDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {last.text}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
                          </>
          )}
        </NotifSheet>,
        document.body,
      )}
    </div>
  );
}

// ── AINUBIS VĽAVO HORE, SÁM — na každej šírke ─────────────────────────────────
// Matej 26. 9.: plávajúci AINUBIS musí byť všade, ale na mobile nesmie prekrývať obsah;
// poobede: „Ainubisa presuň na ľavú stranu hore nech tam je sám" (najprv len mobil),
// o hodinu: „pri homepage by som asi ainubisa dal hore vľavo aj na pc" — jedno miesto na
// každej šírke. Horný rad je sticky vrstva, takže koliesko v ňom nič nové nezakryje.
// Značka `has-hub-ainubis` na <body> skryje guľu LEN kým je koliesko namountované —
// na mape (bez horného radu) guľa ostáva vpravo dole. `visibility`, nie `display` —
// viď AinubisWidget.css.
// PANEL rastie zo spúšťača: na PC pod kolieskom, zarovnaný s ľavým okrajom stĺpca
// (PACK_COL.wide 880 / 2 − 24 px odsadenie = 416). Zvýšená špecificita (`.has-pack-nav`)
// prebíja pravidlo widgetu, ktoré panel centruje nad lištu. Ručne presunutý panel
// (inline `left/top` z ťahania) má prednosť — to je voľba človeka.
// Zavrtenie chvosta — krátke, do strán, okolo koreňa chvosta (ľavý dolný roh kresby).
export const WAG_CSS = `
.ntf-wag{transform-origin:30% 95%;animation:ntf-wag .6s cubic-bezier(.36,.07,.19,.97) both;}
@keyframes ntf-wag{0%{transform:rotate(0)}15%{transform:rotate(-18deg)}35%{transform:rotate(14deg)}55%{transform:rotate(-10deg)}75%{transform:rotate(6deg)}100%{transform:rotate(0)}}
@media (prefers-reduced-motion:reduce){.ntf-wag{animation:none;}}
`;

const HUB_AINUBIS_CSS = `
body.has-hub-ainubis .ainubis-launcher { visibility: hidden; }
/* Od 27. 9. 2026 stojí koliesko v spoločnom rade (PackTopRow) aj na obrazovkách BEZ spodnej
   lišty (SNIFFER, kvízy, príbeh) a so stĺpcom inej šírky. Poloha panela sa preto neráta
   z rovnice stĺpca, ale číta z kolieska samého (--hub-ai-x/y, píše ich HubAinubis).
   Dvojitá trieda = špecificita nad body.has-pack-nav .ainubis-panel aj nad pravidlami
   SNIFFERu (body:has(.bd-col) .ainubis-panel). */
@media (min-width: 768px) {
  body.has-hub-ainubis .ainubis-panel.ainubis-panel {
    top: var(--hub-ai-y, calc(env(safe-area-inset-top, 0px) + 78px));
    bottom: auto;
    left: var(--hub-ai-x, max(16px, calc(50% - 416px)));
    right: auto;
    height: min(560px, calc(100vh - var(--hub-ai-y, 78px) - 112px)); /* lišta ~96 + vôľa */
  }
}
@media (max-width: 767px) {
  body.has-hub-ainubis .ainubis-panel { bottom: var(--ainubis-dock-b, var(--pack-dock-b)); }
}`;

export function HubAinubis() {
  const [unread, setUnread] = useState(getAinubisUnread);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.body.classList.add('has-hub-ainubis');
    const off = onAinubisUnread(setUnread);
    // Panel rastie spod kolieska (PC). Rad je sticky, takže poloha sa mení len so šírkou okna.
    const root = document.documentElement.style;
    const place = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      root.setProperty('--hub-ai-x', `${Math.round(Math.min(r.left, window.innerWidth - 436))}px`);
      root.setProperty('--hub-ai-y', `${Math.round(r.bottom + 8)}px`);
    };
    place();
    window.addEventListener('resize', place);
    return () => {
      off(); window.removeEventListener('resize', place);
      document.body.classList.remove('has-hub-ainubis');
      root.removeProperty('--hub-ai-x'); root.removeProperty('--hub-ai-y');
    };
  }, []);
  return (
    <>
      <style>{HUB_AINUBIS_CSS}</style>
      <button
        type="button"
        ref={ref}
        onClick={() => openAinubis()}
        aria-label="AINUBIS"
        className="pk-hub-ainubis relative inline-flex items-center justify-center"
        style={{ ...CAPSULE, width: 40, height: 40, padding: 0, cursor: 'pointer' }}
      >
        <img
          src={ainubisFace}
          alt=""
          aria-hidden
          style={{ width: 32, height: 32, borderRadius: 999, border: `1.5px solid ${AINUBIS.edgeStrong}`, objectFit: 'cover', background: T.pageBg }}
        />
        {unread > 0 && (
          // Odznak AINUBISA ostáva jeho vlastný (tyrkysový, `.ainubis-badge` z AinubisWidget.css) —
          // červená zo SNIFFERu patrí len obálke a nosu (Matej 26. 9.: „tomu nechaj ako bola").
          <span className="ainubis-badge">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </>
  );
}
