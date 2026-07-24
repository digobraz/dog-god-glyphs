import { useEffect, useRef, useState } from 'react';
import { Bell, UserPlus } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { PACK_THEME } from './packTheme';
import { useT } from '@/i18n/LanguageContext';
import { DEV_FULL } from '@/lib/packFlags';
import { getMe, listConversations, unreadCount, subscribe as subscribeMessaging, type Conversation } from './messaging/packMessaging';
import { emitOpenInbox, emitOpenThread } from './messaging/openBridge';

const T = PACK_THEME;

// unread konverzácie pre dropdown položky — rovnaká logika ako Inbox.tsx (zámerne duplikovaná,
// UI komponenty na seba nenaväzujú, viď packMessaging.ts vzor).
function hasUnread(conv: Conversation, meId: string): boolean {
  if (!conv.memberIds.includes(meId)) return false;
  const readAt = conv.lastReadAt[meId] ?? '';
  return conv.messages.some((m) => m.senderId !== meId && m.createdAt > readAt);
}

interface PackNotificationsProps {
  last24h: number;
  last30d: number;
  total: number;
}

export function PackNotifications({ last24h, last30d, total }: PackNotificationsProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Messages — live len za DEV_FULL (§8.4 zadania: LIVE build sa nemení, ostáva "coming soon").
  const [msgCount, setMsgCount] = useState(() => (DEV_FULL ? unreadCount() : 0));
  const [unreadConvs, setUnreadConvs] = useState<Conversation[]>([]);
  useEffect(() => {
    if (!DEV_FULL) return;
    const me = getMe();
    const load = () => {
      setMsgCount(unreadCount());
      listConversations().then((cs) => setUnreadConvs(cs.filter((c) => hasUnread(c, me.id))));
    };
    load();
    return subscribeMessaging(load);
  }, []);

  // click-away close
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const items = [
    { iconNode: <UserPlus className="h-3.5 w-3.5 shrink-0" style={{ color: T.accentGold, marginTop: 2 }} />, text: last24h > 0 ? t(last24h === 1 ? 'pack.notif.newMemberToday' : 'pack.notif.newMembersToday', { count: last24h }) : t('pack.notif.noNewMembersToday') },
    { iconNode: <UserPlus className="h-3.5 w-3.5 shrink-0" style={{ color: T.accentGold, marginTop: 2 }} />, text: t('pack.notif.joinedLast30d', { count: last30d }) },
    { iconNode: <BrandIcon name="globe" size={14} tint="gold" className="shrink-0" style={{ marginTop: 2 }} />, text: t('pack.notif.totalWorldwide', { count: total.toLocaleString('en-US') }) },
  ];

  return (
    <div ref={wrapRef} className="absolute flex items-center gap-1.5" style={{ top: 16, right: 16, zIndex: 12 }}>
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
            border: `1px solid ${T.border}`,
            background: 'transparent',
            color: T.ink,
            cursor: 'pointer',
          }}
        >
          <BrandIcon name="chat" size={16} tint="gold" />
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
                border: `1.5px solid ${T.card}`,
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

      {/* Notifications bell */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label={t('pack.notif.ariaNotifications')}
        className="relative inline-flex items-center justify-center"
        style={{
          width: 38,
          height: 38,
          borderRadius: 999,
          border: `1px solid ${T.border}`,
          background: open ? 'rgba(31,26,14,0.05)' : 'transparent',
          color: T.ink,
          cursor: 'pointer',
        }}
      >
        <Bell className="h-4 w-4" />
        {last24h > 0 && (
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
              border: `1.5px solid ${T.card}`,
              lineHeight: 1,
            }}
          >
            {last24h > 9 ? '9+' : last24h}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 46,
            right: 0,
            width: DEV_FULL && unreadConvs.length > 0 ? 268 : 244,
            background: T.card,
            border: `1px solid ${T.hairline}`,
            borderRadius: 14,
            boxShadow: '0 18px 44px -12px rgba(10,10,10,0.28)',
            padding: 12,
            zIndex: 20,
          }}
        >
          {DEV_FULL && unreadConvs.length > 0 && (
            <>
              <div
                style={{
                  fontFamily: "'Cinzel', serif", fontSize: 9.5, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: T.inkDim, marginBottom: 8,
                }}
              >
                Messages
              </div>
              <ul className="flex flex-col gap-2 mb-3">
                {unreadConvs.map((conv) => {
                  const me = getMe();
                  const isGroup = conv.kind === 'group';
                  const other = !isGroup ? conv.members.find((p) => p.id !== me.id) : undefined;
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
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                            <span style={{ display: 'block', fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: T.inkDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {last.text}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div style={{ borderTop: `1px solid ${T.hairline}`, marginBottom: 10 }} />
            </>
          )}
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9.5,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: T.inkDim,
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
                    color: T.ink,
                  }}
                >
                  {it.text}
                </span>
              </li>
            ))}
          </ul>
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: `1px solid ${T.hairline}`,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              color: T.inkDim,
              textAlign: 'center',
            }}
          >
            {t('pack.notif.personalComingSoon')}
          </div>
        </div>
      )}
    </div>
  );
}
