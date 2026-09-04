import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { HandNose } from './HandIcons';
import { PACK_THEME } from './packTheme';
import { pluralKey } from '@/lib/plural';
import { useT } from '@/i18n/LanguageContext';
import { DEV_FULL } from '@/lib/packFlags';
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
}

export function PackNotifications({ last24h, last30d, total, dark = false, className, layout = 'overlay' }: PackNotificationsProps) {
  const inline = layout === 'inline';
  const t = useT();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Dropdown is portaled to <body> (fixed, viewport-anchored) — ancestors like
  // .trp-status-row use backdrop-filter, which creates its own stacking context and
  // traps any in-place z-index inside it, so a later sibling (search/filter row) always
  // painted over this panel regardless of zIndex (recurring bug class, see
  // BreedPatronScreen's dropRect for the same fix pattern).
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; right: number } | null>(null);
  // Color tokens — light (original, on papyrus card) vs dark (global chrome, on pageBg).
  // Dark variant's trigger buttons get a T.glass backing (not transparent) — this hub also
  // mounts on PackMap's full-bleed light map (not just the black hieroglyph bg), so a
  // transparent pale-on-pale button would vanish there; same blurred glass chip language as
  // the bottom nav / PackMap's own map controls.
  const c = dark
    ? { border: T.onDarkBorder, ink: T.onDark, inkDim: T.onDarkDim, hairline: T.onDarkHair, panelBg: T.glass, badgeBorder: T.pageBg, buttonBg: T.glass }
    : { border: T.border, ink: T.ink, inkDim: T.inkDim, hairline: T.hairline, panelBg: T.card, badgeBorder: T.card, buttonBg: 'transparent' };

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

  // Anchor the portaled panel to the trigger's viewport position; recompute on
  // resize/scroll so it tracks the bell button instead of drifting.
  useEffect(() => {
    if (!open) { setPanelPos(null); return; }
    const compute = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPanelPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [open]);

  // Degrade gracefully — global mount (dark) only has last24h/total at hand (from
  // usePackIdentity, already fetched by the parent page), no last30d breakdown; skip
  // whichever stat wasn't passed in rather than showing a bogus 0.
  const items = [
    ...(last24h != null ? [{ iconNode: <UserPlus className="h-3.5 w-3.5 shrink-0" style={{ color: T.accentGold, marginTop: 2 }} />, text: last24h > 0 ? t(last24h === 1 ? 'pack.notif.newMemberToday' : 'pack.notif.newMembersToday', { count: last24h }) : t('pack.notif.noNewMembersToday') }] : []),
    ...(last30d != null ? [{ iconNode: <UserPlus className="h-3.5 w-3.5 shrink-0" style={{ color: T.accentGold, marginTop: 2 }} />, text: t('pack.notif.joinedLast30d', { count: last30d }) }] : []),
    ...(total != null ? [{ iconNode: <BrandIcon name="globe" size={14} tint="gold" className="shrink-0" style={{ marginTop: 2 }} />, text: t('pack.notif.totalWorldwide', { count: total.toLocaleString('en-US') }) }] : []),
  ];
  // Odznak NOSA = neprečítané upozornenia + dnešný prírastok svorky. Správy sa sem
  // ZÁMERNE nepočítajú — má ich obálka vedľa a dve rovnaké čísla vedľa seba nič nehovoria.
  const bellCount = (last24h ?? 0) + freshAlerts.length;

  return (
    <div
      ref={wrapRef}
      className={`${inline ? 'relative w-full justify-end' : dark ? 'fixed' : 'absolute'} flex items-center gap-1.5${className ? ` ${className}` : ''}`}
      style={inline ? { zIndex: 12 } : { top: 16, right: 16, zIndex: dark ? 45 : 12 }}
    >
      {/* Messages — LIVE za DEV_FULL (opens Inbox overlay); LIVE build (bez DEV_FULL) ostáva
          presne ako predtým, "coming soon" disabled (§8.4 zadania — bez regresie). */}
      {DEV_FULL ? (
        <button
          type="button"
          onClick={() => emitOpenInbox()}
          aria-label="Messages"
          title="Messages"
          className="relative inline-flex items-center justify-center"
          style={{
            width: 38,
            height: 38,
            borderRadius: 999,
            border: `1px solid ${c.border}`,
            background: c.buttonBg,
            backdropFilter: dark ? 'blur(14px)' : undefined,
            WebkitBackdropFilter: dark ? 'blur(14px)' : undefined,
            boxShadow: dark ? '0 4px 14px rgba(0,0,0,0.4)' : undefined,
            color: c.ink,
            cursor: 'pointer',
          }}
        >
          <BrandIcon name="envelope" size={16} tint="gold" />
          {msgCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 999,
                background: T.accentGold,
                color: '#1F1A0E',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 9,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${c.badgeBorder}`,
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
              fontSize: 7,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.inkDim,
              background: T.card,
              padding: '1px 3px',
              borderRadius: 4,
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
        onClick={() => setOpen((p) => {
          const next = !p;
          // Otvorenie = prečítanie. Označujeme presne to, čo bolo v tej chvíli na zozname —
          // nie „všetko", inak by žiadosť, ktorá dorazí o sekundu neskôr, zhasla nevidená.
          if (next && alertsMod && freshAlerts.length) {
            alertsMod.markSeen(freshAlerts.map((x) => x.id));
            setSeenEpoch((e) => e + 1);
          }
          return next;
        })}
        aria-label={t('pack.notif.ariaNotifications')}
        className="relative inline-flex items-center justify-center"
        style={{
          width: 38,
          height: 38,
          borderRadius: 999,
          border: `1px solid ${c.border}`,
          background: open ? (dark ? 'rgba(245,240,228,0.14)' : 'rgba(31,26,14,0.05)') : c.buttonBg,
          backdropFilter: dark ? 'blur(14px)' : undefined,
          WebkitBackdropFilter: dark ? 'blur(14px)' : undefined,
          boxShadow: dark ? '0 4px 14px rgba(0,0,0,0.4)' : undefined,
          color: c.ink,
          cursor: 'pointer',
        }}
      >
        <HandNose size={17} />
        {bellCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 999,
              background: T.accentGold,
              color: '#1F1A0E',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1.5px solid ${c.badgeBorder}`,
              lineHeight: 1,
            }}
          >
            {bellCount > 9 ? '9+' : bellCount}
          </span>
        )}
      </button>

      {/* Dropdown — portaled to <body>, fixed + viewport-anchored (see panelPos effect
          above). Do NOT go back to position:absolute inside wrapRef: any ancestor here
          (e.g. .trp-status-row) uses backdrop-filter, which creates its own stacking
          context and silently traps the panel behind later siblings no matter its zIndex. */}
      {open && panelPos && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: panelPos.top,
            right: panelPos.right,
            width: DEV_FULL && unreadConvs.length > 0 ? 268 : 244,
            background: c.panelBg,
            border: `1px solid ${dark ? c.border : c.hairline}`,
            borderRadius: 14,
            boxShadow: '0 18px 44px -12px rgba(10,10,10,0.28)',
            padding: 12,
            zIndex: 2100,
            backdropFilter: dark ? 'blur(14px)' : undefined,
            WebkitBackdropFilter: dark ? 'blur(14px)' : undefined,
          }}
        >
          {DEV_FULL && alerts.length > 0 && (
            <>
              <div
                style={{
                  fontFamily: "'Cinzel', serif", fontSize: 9.5, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: c.inkDim, marginBottom: 8,
                }}
              >
                {t('pack.alerts.title')}
              </div>
              <ul className="flex flex-col gap-2 mb-3">
                {alerts.slice(0, 6).map((al) => (
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
                      <HandNose size={14} style={{ flexShrink: 0, marginTop: 2, color: T.accentGold }} />
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            display: 'block', fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 12, lineHeight: 1.35, color: c.ink,
                          }}
                        >
                          {al.kind === 'trip_request'
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
                            fontSize: 8.5, letterSpacing: '0.04em', textTransform: 'uppercase',
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
              <div style={{ borderTop: `1px solid ${c.hairline}`, marginBottom: 10 }} />
            </>
          )}
          {DEV_FULL && unreadConvs.length > 0 && (
            <>
              <div
                style={{
                  fontFamily: "'Cinzel', serif", fontSize: 9.5, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: c.inkDim, marginBottom: 8,
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
                            fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 10, color: '#1F1A0E',
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, fontWeight: 700, color: c.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {name}
                            </span>
                            <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: '50%', background: T.accentGold }} />
                          </span>
                          {conv.tag?.kind === 'trip' && conv.tag.label && (
                            <span style={{ display: 'block', fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 8, letterSpacing: '0.04em', textTransform: 'uppercase', color: T.accentGold, marginTop: 1 }}>
                              🥾 {conv.tag.label}
                            </span>
                          )}
                          {last && (
                            <span style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: c.inkDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {last.text}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div style={{ borderTop: `1px solid ${c.hairline}`, marginBottom: 10 }} />
            </>
          )}
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9.5,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: c.inkDim,
              marginBottom: 10,
            }}
          >
            {t('pack.notif.dropdownTitle')}
          </div>
          <ul className="flex flex-col gap-2.5">
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-2.5">
                {it.iconNode}
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12.5,
                    lineHeight: 1.4,
                    color: c.ink,
                  }}
                >
                  {it.text}
                </span>
              </li>
            ))}
          </ul>
          {/* „Osobné upozornenia už čoskoro" — pätička z čias, keď NOS hlásil len prírastok
              svorky. Odkedy vie o žiadostiach a prijatiach (26. 8. 2026), by nad vlastným
              zoznamom osobných upozornení tvrdila, že ešte neexistujú. Ostáva len pre toho,
              kto žiadne nemá — tam je to stále pravda o zvyšku. */}
          {!(DEV_FULL && alerts.length > 0) && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: `1px solid ${c.hairline}`,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 11,
                color: c.inkDim,
                textAlign: 'center',
              }}
            >
              {t('pack.notif.personalComingSoon')}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
