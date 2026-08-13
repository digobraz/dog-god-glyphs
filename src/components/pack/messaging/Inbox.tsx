// Inbox overlay — zoznam konverzácií (DM + open groups). Design:
// plany/zadanie-profil-messaging-2026-07-23.md §4.3/§12. Rovnaký vizuálny jazyk ako
// packCommunityUI.tsx (.comm-dash fullscreen vzor) — tmavé glass pozadie, papyrus/gold akcenty,
// Cinzel nadpisy, brand ikony (NIE lucide).
//
// ⚠️ TEXTY IDÚ CEZ `t()`. Pôvodná hlavička tu tvrdila „web texty = EN" a súbor mal 5 volaní
// `t()` na celý inbox — Slovák tak v slovenskom rozhraní čítal „No messages yet" a dátumy
// „Aug 9" (natvrdo `en-US`). Thread.tsx je preložený od začiatku; Inbox dorovnaný 2026-08-12.
import { useEffect, useState } from 'react';
import { PACK_THEME, FONT_UI } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { getMe, listConversations, subscribe, type Conversation } from './packMessaging';
import { tripNames, tripNameSync } from './tripLabel';

const T = PACK_THEME;
const GOLD = '#C99A3F';
const INK = '#1F1A0E';

// Brand lock: meno psa je VŽDY Cinzel Decorative, na každom povrchu.
// Meno človeka (keď účet psa nemá) ostáva Cinzel — Decorative je vyhradený psom.
const DOG_NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const HUMAN_NAME_FONT = "'Cinzel', serif";

export const INBOX_CSS = `
.msg-inbox{position:fixed;inset:0;z-index:1300;background:${T.pageBg};overflow-y:auto;display:flex;flex-direction:column;}
.msg-inbox-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 22px) 20px 16px;background:${T.pageBg};border-bottom:1px solid ${T.onDarkHair};flex-shrink:0;}
.msg-inbox-title{font-family:'Cinzel',serif;font-weight:700;font-size:20px;color:${GOLD};}
.msg-x{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:rgba(245,240,228,0.07);border:1px solid ${T.onDarkBorder};color:${T.onDark};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.msg-x:hover{border-color:${GOLD};color:${GOLD};}
.msg-inbox-list{max-width:640px;width:100%;margin:0 auto;padding:12px 16px 100px;flex:1 1 auto;}
/* ⚠️ Riadok je <div role="button">, NIE <button> — vnútri je vlastné tlačidlo
   (štítok výletu) a <button> v <button> je nevalidný HTML, ktorý prehliadač
   ticho rozbije. Preto tu musí ostať aj :focus-visible, klávesnica sa inak stratí. */
.msg-row{display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:${T.glass};border:1px solid ${T.onDarkBorder};border-radius:14px;padding:13px 15px;margin-bottom:9px;cursor:pointer;transition:border-color .15s;font-family:inherit;}
.msg-row:hover{border-color:${GOLD};}
.msg-row:focus-visible{outline:none;border-color:${GOLD};box-shadow:0 0 0 3px rgba(201,154,63,0.25);}
.msg-avatar{flex-shrink:0;width:42px;height:42px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:16px;color:${INK};}
.msg-row-mid{flex:1;min-width:0;}
.msg-row-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;}
.msg-row-name{font-weight:700;font-size:13.5px;color:${T.onDark};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-row-pack{font-family:${FONT_UI};font-weight:400;font-size:11px;color:${T.onDarkDim};}
.msg-row-time{flex-shrink:0;font-size:10px;color:${T.onDarkDim};}
.msg-row-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:3px;}
.msg-row-preview{font-size:12px;color:${T.onDarkDim};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-dot{flex-shrink:0;width:9px;height:9px;border-radius:50%;background:${GOLD};box-shadow:0 0 6px rgba(201,154,63,0.6);}
.msg-tagchip{display:inline-flex;align-items:center;gap:4px;margin-top:7px;font-family:'Cinzel',serif;font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:rgba(201,154,63,0.14);border:1px solid rgba(201,154,63,0.4);color:${GOLD};white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-tagchip--click:hover{background:rgba(201,154,63,0.24);}
.msg-empty{text-align:center;padding:40px 16px;color:${T.onDarkDim};font-size:12.5px;font-style:italic;}
/* #55 — prázdny inbox je celá čierna obrazovka s jednou vetou; bez akcie je to slepá ulička. */
.msg-emptybox{display:flex;flex-direction:column;align-items:center;gap:16px;padding:40px 16px;text-align:center;}
.msg-emptybox p{margin:0;color:${T.onDarkDim};font-size:12.5px;font-style:italic;line-height:1.5;max-width:320px;}
.msg-emptybtn{font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:11px 20px;border-radius:8px;border:1px solid rgba(250,244,236,0.30);background:linear-gradient(135deg,#F5C73D,#E69E1A);color:${INK};cursor:pointer;}
`;

// koľko % konverzácií, kde má "me" neprečítanú správu — rovnaká logika ako
// packMessaging.unreadCount(), len per-konverzácia (pre bodku v riadku).
function hasUnread(conv: Conversation, meId: string): boolean {
  if (!conv.memberIds.includes(meId)) return false;
  const readAt = conv.lastReadAt[meId] ?? '';
  return conv.messages.some((m) => m.senderId !== meId && m.createdAt > readAt);
}

function fmtTime(iso: string, locale: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function Inbox({ onOpenThread, onClose, onBrowseTrips, onOpenTrip }: {
  onOpenThread: (convId: string) => void;
  onClose: () => void;
  /** #55 — prázdny inbox potrebuje jednu akciu: rozhovor začína na tripe, nie tu. */
  onBrowseTrips?: () => void;
  /** klik na štítok výletu nad konverzáciou; bez neho ostáva štítok needitovateľný popis */
  onOpenTrip?: (tripId: string) => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const locale = intlLocale(lang);
  const [convs, setConvs] = useState<Conversation[]>([]);
  // Dataset trás sa sťahuje lazy (je veľký) — kým dobehne, štítok ukazuje to,
  // čo prišlo z DB (slug). `namesReady` len vynúti prekreslenie, keď dobehne.
  const [namesReady, setNamesReady] = useState(false);
  const me = getMe();

  useEffect(() => {
    let alive = true;
    const load = () => { listConversations().then((cs) => { if (alive) setConvs(cs); }); };
    load();
    const unsub = subscribe(load);
    return () => { alive = false; unsub(); };
  }, []);

  // Datating názvov ťaháme len keď je nad čím — inbox bez trip konverzácie
  // nemá dôvod stiahnuť megabajt trás.
  useEffect(() => {
    if (namesReady || !convs.some((c) => c.tag?.kind === 'trip' && c.tag.id)) return;
    let alive = true;
    tripNames().then(() => { if (alive) setNamesReady(true); });
    return () => { alive = false; };
  }, [convs, namesReady]);

  return (
    <div className="msg-inbox">
      <style>{INBOX_CSS}</style>
      <div className="msg-inbox-head">
        <div className="msg-inbox-title">{t('pack.msg.inboxTitle')}</div>
        <button type="button" className="msg-x" onClick={onClose} aria-label={t('pack.msg.closeAriaLabel')}>×</button>
      </div>
      <div className="msg-inbox-list">
        {convs.length === 0 ? (
          <div className="msg-emptybox">
            <p>{t('pack.msg.inboxEmpty')}</p>
            {onBrowseTrips && <button type="button" className="msg-emptybtn" onClick={onBrowseTrips}>{t('pack.msg.findTrip')}</button>}
          </div>
        ) : (
          convs.map((conv) => {
            const isGroup = conv.kind === 'group';
            const other = !isGroup ? conv.members.find((p) => p.id !== me.id) : undefined;
            const last = conv.messages[conv.messages.length - 1];
            const unread = hasUnread(conv, me.id);
            const name = isGroup ? (conv.title ?? t('pack.msg.fallbackGroupTitle')) : (other?.name ?? t('pack.msg.fallbackMemberName'));
            const initial = name.charAt(0).toUpperCase();
            // Skupina má názov, nie meno psa → Cinzel. DM dostane Decorative len
            // vtedy, keď je meno naozaj psie (`isDogName` z packMessaging).
            const nameFont = !isGroup && other?.isDogName ? DOG_NAME_FONT : HUMAN_NAME_FONT;
            const memberCount = conv.memberCount ?? conv.members.length;
            const tripId = conv.tag?.kind === 'trip' ? conv.tag.id : undefined;
            const tripLabel = conv.tag?.kind === 'trip' && conv.tag.label
              ? tripNameSync(tripId, conv.tag.label)
              : undefined;
            const openThread = () => onOpenThread(conv.id);
            return (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                className="msg-row"
                onClick={openThread}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openThread(); }
                }}
              >
                <span
                  className="msg-avatar"
                  style={!isGroup && other?.avatarUrl ? { backgroundImage: `url('${other.avatarUrl}')` } : undefined}
                >
                  {(isGroup || !other?.avatarUrl) && initial}
                </span>
                <span className="msg-row-mid">
                  <span className="msg-row-top">
                    <span className="msg-row-name" style={{ fontFamily: nameFont }}>
                      {name}
                      {!isGroup && other?.packNumber ? <span className="msg-row-pack"> {t('pack.msg.packNumberSuffix', { n: other.packNumber })}</span> : null}
                    </span>
                    {last && <span className="msg-row-time">{fmtTime(last.createdAt, locale)}</span>}
                  </span>
                  <span className="msg-row-bottom">
                    <span className="msg-row-preview">
                      {isGroup ? `${t(memberCount === 1 ? 'pack.msg.memberCountOne' : 'pack.msg.memberCountMany', { n: memberCount })} · ` : ''}
                      {last ? last.text : t('pack.msg.noMessagesYet')}
                    </span>
                    {unread && <span className="msg-dot" aria-hidden />}
                  </span>
                  {tripLabel && (
                    onOpenTrip && tripId ? (
                      <button
                        type="button"
                        className="msg-tagchip msg-tagchip--click"
                        // bez zastavenia by klik prebublal na riadok a otvoril vlákno
                        onClick={(e) => { e.stopPropagation(); onOpenTrip(tripId); }}
                      >
                        <BrandIcon name="walk" size={10} tint="gold" /> {tripLabel}
                      </button>
                    ) : (
                      <span className="msg-tagchip"><BrandIcon name="walk" size={10} tint="gold" /> {tripLabel}</span>
                    )
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
