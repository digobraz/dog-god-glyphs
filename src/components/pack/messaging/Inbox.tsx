// Inbox overlay — zoznam konverzácií (DM + open groups). Design:
// plany/zadanie-profil-messaging-2026-07-23.md §4.3/§12. Rovnaký vizuálny jazyk ako
// packCommunityUI.tsx (.comm-dash fullscreen vzor) — tmavé glass pozadie, papyrus/gold akcenty,
// Cinzel nadpisy, brand ikony (NIE lucide). Web texty = EN (rovnaká konvencia ako packCommunityUI).
import { useEffect, useState } from 'react';
import { PACK_THEME, FONT_UI } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { getMe, listConversations, subscribe, type Conversation } from './packMessaging';

const T = PACK_THEME;
const GOLD = '#C99A3F';
const INK = '#1F1A0E';

export const INBOX_CSS = `
.msg-inbox{position:fixed;inset:0;z-index:1300;background:${T.pageBg};overflow-y:auto;display:flex;flex-direction:column;}
.msg-inbox-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 22px) 20px 16px;background:${T.pageBg};border-bottom:1px solid ${T.onDarkHair};flex-shrink:0;}
.msg-inbox-title{font-family:'Cinzel',serif;font-weight:700;font-size:20px;color:${GOLD};}
.msg-x{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.msg-x:hover{border-color:${GOLD};color:${GOLD};}
.msg-inbox-list{max-width:640px;width:100%;margin:0 auto;padding:12px 16px 100px;flex:1 1 auto;}
.msg-row{display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:14px;padding:13px 15px;margin-bottom:9px;cursor:pointer;transition:border-color .15s;font-family:inherit;}
.msg-row:hover{border-color:${GOLD};}
.msg-avatar{flex-shrink:0;width:42px;height:42px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;font-size:16px;color:${INK};}
.msg-row-mid{flex:1;min-width:0;}
.msg-row-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;}
.msg-row-name{font-family:'Cinzel',serif;font-weight:700;font-size:13.5px;color:${T.onDark};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-row-pack{font-family:${FONT_UI};font-weight:400;font-size:11px;color:${T.onDarkDim};}
.msg-row-time{flex-shrink:0;font-size:10px;color:${T.onDarkDim};}
.msg-row-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:3px;}
.msg-row-preview{font-size:12px;color:${T.onDarkDim};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-dot{flex-shrink:0;width:9px;height:9px;border-radius:50%;background:${GOLD};box-shadow:0 0 6px rgba(201,154,63,0.6);}
.msg-tagchip{display:inline-flex;align-items:center;gap:4px;margin-top:7px;font-family:'Cinzel',serif;font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:rgba(201,154,63,0.14);border:1px solid rgba(201,154,63,0.4);color:${GOLD};white-space:nowrap;}
.msg-empty{text-align:center;padding:40px 16px;color:${T.onDarkDim};font-size:12.5px;font-style:italic;}
`;

// koľko % konverzácií, kde má "me" neprečítanú správu — rovnaká logika ako
// packMessaging.unreadCount(), len per-konverzácia (pre bodku v riadku).
function hasUnread(conv: Conversation, meId: string): boolean {
  if (!conv.memberIds.includes(meId)) return false;
  const readAt = conv.lastReadAt[meId] ?? '';
  return conv.messages.some((m) => m.senderId !== meId && m.createdAt > readAt);
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function Inbox({ onOpenThread, onClose }: { onOpenThread: (convId: string) => void; onClose: () => void }) {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const me = getMe();

  useEffect(() => {
    let alive = true;
    const load = () => { listConversations().then((cs) => { if (alive) setConvs(cs); }); };
    load();
    const unsub = subscribe(load);
    return () => { alive = false; unsub(); };
  }, []);

  return (
    <div className="msg-inbox">
      <style>{INBOX_CSS}</style>
      <div className="msg-inbox-head">
        <div className="msg-inbox-title">Messages</div>
        <button type="button" className="msg-x" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="msg-inbox-list">
        {convs.length === 0 ? (
          <div className="msg-empty">No messages yet. Start a conversation with a fellow Dogyptian from a trip page.</div>
        ) : (
          convs.map((conv) => {
            const isGroup = conv.kind === 'group';
            const other = !isGroup ? conv.members.find((p) => p.id !== me.id) : undefined;
            const last = conv.messages[conv.messages.length - 1];
            const unread = hasUnread(conv, me.id);
            const name = isGroup ? (conv.title ?? 'Pack group') : (other?.name ?? 'Dogyptian');
            const initial = name.charAt(0).toUpperCase();
            return (
              <button key={conv.id} type="button" className="msg-row" onClick={() => onOpenThread(conv.id)}>
                <span
                  className="msg-avatar"
                  style={!isGroup && other?.avatarUrl ? { backgroundImage: `url('${other.avatarUrl}')` } : undefined}
                >
                  {(isGroup || !other?.avatarUrl) && initial}
                </span>
                <span className="msg-row-mid">
                  <span className="msg-row-top">
                    <span className="msg-row-name">
                      {name}
                      {!isGroup && other?.packNumber ? <span className="msg-row-pack"> · Dogyptian #{other.packNumber}</span> : null}
                    </span>
                    {last && <span className="msg-row-time">{fmtTime(last.createdAt)}</span>}
                  </span>
                  <span className="msg-row-bottom">
                    <span className="msg-row-preview">
                      {isGroup ? `${conv.memberCount ?? conv.members.length} members · ` : ''}
                      {last ? last.text : 'No messages yet'}
                    </span>
                    {unread && <span className="msg-dot" aria-hidden />}
                  </span>
                  {conv.tag?.kind === 'trip' && conv.tag.label && (
                    <span className="msg-tagchip"><BrandIcon name="walk" size={10} tint="gold" /> {conv.tag.label}</span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
