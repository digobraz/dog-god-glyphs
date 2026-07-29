// Thread overlay — jedna konverzácia (DM alebo open group). Design:
// plany/zadanie-profil-messaging-2026-07-23.md §4.3/§12. Bubliny (me vpravo gold-akcent / member
// vľavo papyrus), send box (Enter=send), auto-scroll dole, markRead pri mounte/otvorení. Nejoinnutá
// open group → "Join the pack" namiesto send boxu (§ zadanie bod 2 Thread). Web texty = EN.
import { useEffect, useRef, useState } from 'react';
import { PACK_THEME } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import {
  getConversation, getMe, joinGroup, markRead, sendMessage, subscribe, type Conversation,
} from './packMessaging';

const T = PACK_THEME;
const GOLD = '#C99A3F';
const INK = '#1F1A0E';

export const THREAD_CSS = `
.msg-thread{position:fixed;inset:0;z-index:1300;background:${T.pageBg};display:flex;flex-direction:column;}
.msg-thread-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 22px) 20px 16px;background:${T.pageBg};border-bottom:1px solid ${T.onDarkHair};flex-shrink:0;}
.msg-back{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.msg-back:hover{border-color:${GOLD};color:${GOLD};}
.msg-thread-headtxt{min-width:0;}
.msg-thread-title{font-family:'Cinzel',serif;font-weight:700;font-size:16px;color:${T.onDark};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-thread-sub{font-size:11px;color:${T.onDarkDim};margin-top:2px;}
.msg-tagchip{display:inline-flex;align-items:center;gap:4px;margin-top:5px;font-family:'Cinzel',serif;font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:rgba(201,154,63,0.14);border:1px solid rgba(201,154,63,0.4);color:${GOLD};white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;font-family:'Cinzel',serif;border:1px solid rgba(201,154,63,0.4);}
.msg-tagchip--click:hover{background:rgba(201,154,63,0.24);}
.msg-thread-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:18px 16px;max-width:640px;width:100%;margin:0 auto;display:flex;flex-direction:column;}
.msg-bubblewrap{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:11px;max-width:78%;}
.msg-bubblewrap.me{align-items:flex-end;align-self:flex-end;}
.msg-bubble-sender{font-family:'Cinzel',serif;font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;color:${T.onDarkDim};margin-bottom:3px;padding:0 3px;}
.msg-bubble{font-size:13px;line-height:1.5;padding:10px 14px;border-radius:16px;background:${T.card};color:${INK};border:1px solid rgba(201,154,63,0.25);}
.msg-bubble.me{background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border-color:rgba(250,244,236,0.3);}
.msg-empty{text-align:center;padding:40px 16px;color:${T.onDarkDim};font-size:12.5px;font-style:italic;}
.msg-thread-send{flex-shrink:0;display:flex;gap:10px;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 14px);border-top:1px solid ${T.onDarkHair};max-width:640px;width:100%;margin:0 auto;box-sizing:border-box;}
.msg-thread-input{flex:1;background:rgba(245,240,228,0.05);border:1px solid ${T.onDarkBorder};border-radius:999px;padding:11px 16px;color:${T.onDark};font-family:inherit;font-size:13px;outline:0;}
.msg-thread-input:focus{border-color:${GOLD};}
.msg-sendbtn{flex-shrink:0;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,0.3);cursor:pointer;display:flex;align-items:center;justify-content:center;}
.msg-sendbtn:disabled{opacity:.4;cursor:default;}
.msg-thread-join{flex-shrink:0;padding:14px 16px calc(env(safe-area-inset-bottom,0px) + 16px);border-top:1px solid ${T.onDarkHair};max-width:640px;width:100%;margin:0 auto;box-sizing:border-box;}
.msg-joinbtn{width:100%;font-family:'Cinzel',serif;font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:14px;border-radius:8px;background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};border:1px solid rgba(250,244,236,0.3);cursor:pointer;}
.msg-joinbtn:hover{filter:brightness(1.05);}
`;

export function Thread({ convId, onClose, onOpenTrip }: {
  convId: string;
  onClose: () => void;
  onOpenTrip?: (tripId: string) => void;
}) {
  const [conv, setConv] = useState<Conversation | null>(null);
  const [text, setText] = useState('');
  const me = getMe();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      getConversation(convId).then((c) => {
        if (!alive) return;
        setConv(c ?? null);
      });
    };
    load();
    // predplatné na packMessaging emitter — kým je Thread otvorený, musí reagovať na
    // send/join/auto-reply mutácie, nielen na mount (§ oprava 2026-07-23: Thread predtým
    // konverzáciu načítal len raz, takže po joine/odoslaní správy zostal zamrznutý na starom stave).
    const unsub = subscribe(load);
    return () => { alive = false; unsub(); };
  }, [convId]);

  // markRead pri otvorení + zakaždým keď pribudne správa (rozsvieti unread → hneď zhasne, keď
  // je thread otvorený — presne akceptačné kritérium §8.1 "po otvorení sa unread vynuluje").
  useEffect(() => {
    if (conv) void markRead(convId);
  }, [convId, conv?.messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [conv?.messages.length]);

  if (!conv) {
    return (
      <div className="msg-thread">
        <style>{THREAD_CSS}</style>
        <div className="msg-thread-head">
          <button type="button" className="msg-back" onClick={onClose} aria-label="Back">←</button>
          <div className="msg-thread-headtxt"><div className="msg-thread-title">Loading…</div></div>
        </div>
      </div>
    );
  }

  const isGroup = conv.kind === 'group';
  const iAmMember = conv.memberIds.includes(me.id);
  const other = !isGroup ? conv.members.find((p) => p.id !== me.id) : undefined;
  const title = isGroup ? (conv.title ?? 'Pack group') : (other?.name ?? 'Dogyptian');

  const handleTagClick = () => {
    if (conv.tag?.kind === 'trip' && conv.tag.id) {
      if (onOpenTrip) onOpenTrip(conv.tag.id);
      // TODO: bez onOpenTrip (napr. keď je Thread otvorený mimo /pack/map) zatiaľ len
      // logujeme — skok na trip cez route/overlay príde s ďalším kolom (§4.3 zadania).
      else console.log('[Thread] TODO: jump to trip', conv.tag.id);
    }
  };

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    const updated = await sendMessage(convId, t);
    setConv(updated); // okamžitý refresh — nespoliehať sa len na emitter (ten dobehne o chvíľu tiež)
  };

  const handleJoin = async () => {
    const updated = await joinGroup(convId);
    setConv(updated); // okamžitý refresh — odomkne send box hneď, bez čakania na emitter
  };

  return (
    <div className="msg-thread">
      <style>{THREAD_CSS}</style>
      <div className="msg-thread-head">
        <button type="button" className="msg-back" onClick={onClose} aria-label="Back to inbox">←</button>
        <div className="msg-thread-headtxt">
          <div className="msg-thread-title">{title}</div>
          {isGroup && <div className="msg-thread-sub">{conv.memberCount ?? conv.members.length} members</div>}
          {conv.tag?.kind === 'trip' && conv.tag.label && (
            <button type="button" className="msg-tagchip msg-tagchip--click" onClick={handleTagClick}>
              <BrandIcon name="walk" size={10} tint="gold" /> {conv.tag.label}
            </button>
          )}
        </div>
      </div>

      <div className="msg-thread-body">
        {conv.messages.length === 0 && <div className="msg-empty">No messages yet. Say hi 🐾</div>}
        {conv.messages.map((m) => {
          const mine = m.senderId === me.id;
          const sender = conv.members.find((p) => p.id === m.senderId);
          return (
            <div key={m.id} className={`msg-bubblewrap${mine ? ' me' : ''}`}>
              {isGroup && !mine && (
                <div className="msg-bubble-sender">{sender?.name ?? 'Dogyptian'}{sender?.packNumber ? ` · #${sender.packNumber}` : ''}</div>
              )}
              <div className={`msg-bubble${mine ? ' me' : ''}`}>{m.text}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {iAmMember ? (
        <div className="msg-thread-send">
          <input
            className="msg-thread-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void send(); } }}
            placeholder="Write a message…"
          />
          <button type="button" className="msg-sendbtn" onClick={() => void send()} disabled={!text.trim()} aria-label="Send message">
            <BrandIcon name="chat" size={16} tint="dark" />
          </button>
        </div>
      ) : (
        <div className="msg-thread-join">
          <button type="button" className="msg-joinbtn" onClick={() => void handleJoin()}>
            {conv.tag?.kind === 'trip' ? 'Join the pack on this trip' : 'Join this pack'}
          </button>
        </div>
      )}
    </div>
  );
}
