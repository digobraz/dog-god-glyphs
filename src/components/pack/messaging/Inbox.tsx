// Inbox overlay — zoznam konverzácií (DM + open groups). Design:
// plany/zadanie-profil-messaging-2026-07-23.md §4.3/§12.
//
// ── SPRÁVY BEZ D-BLOKU (28. 10. 2026) ──────────────────────────────────────
// Matej: „urobme tú stránku bez D-bloku = na celú šírku ako to má Instagram, a použi bledé
// pozadie bez heroglyfov." Zoznam je rad riadkov cez celý stĺpec (PACK_COL_INNER), oddelených
// jemnou čiarou — ako IG Direct. Podklad = plochý papyrus z `msgTheme.ts` (žiadna tapeta).
// Tmavý šat a jeho prepínač zanikli.
//
// ⚠️ KRÍŽIK/ŠÍPKA: Inbox je celoobrazovkový prekryv, bez šípky späť by z neho nebolo kam ísť.
//    Hlavička je spoločný rad /pack (PACK_TOPROW) — zachovaná.
//
// ⚠️ TEXTY IDÚ CEZ `t()` (dátumy cez `intlLocale`, nie natvrdo en-US).
import { sizedUrl } from '@/services/cloudinaryService';
import { BUDDY_LIVE } from '@/lib/packFlags';
import { BackIcon, backCircleCSS, backHoverCSS } from '@/components/pack/BackButton';
import { useEffect, useState } from 'react';
import { PACK_THEME, FONT_TITLE, FONT_UI, PACK_COL_FIT, packColCSS, PACK_TOPROW } from '@/components/pack/packTheme';
import { MSG_SKIN_CSS } from './msgTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { getMe, listConversations, subscribe, type Conversation } from './packMessaging';
import { tripNames, tripNameSync } from './tripLabel';
import { PALE, LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { SNIFFER_HEART } from '@/components/pack/buddy/SnifferLogo';

const T = PACK_THEME;

// Brand lock: meno psa je VŽDY Cinzel Decorative, na každom povrchu.
// Meno človeka (keď účet psa nemá) ostáva Cinzel — Decorative je vyhradený psom.
const DOG_NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const HUMAN_NAME_FONT = "'Cinzel', serif";

export const INBOX_CSS = `
/* Farby sú premenné z MSG_SKIN_CSS (msgTheme.ts). Dvojtriedny selektor (0,2,0) prebije
   position:relative z .msg-skin bez ohľadu na poradie <style> blokov. Pozadie nesie .msg-skin. */
.msg-inbox.msg-skin{position:fixed;inset:0;z-index:1300;overflow-y:auto;display:flex;flex-direction:column;min-height:100dvh;}
/* Výška a poloha hlavičky = spoločný rad /pack (28. 10. 2026): rad od safe-area + PACK_TOPROW.top, výška PACK_TOPROW.h, obsah končí na PACK_TOPROW.content.
   Pás nesie povrch cez celé okno, obsah stojí v stĺpci (rovnica zhodná s .msg-thread-headinner). */
.msg-inbox-head{position:sticky;top:0;z-index:3;padding:calc(env(safe-area-inset-top,0px) + ${PACK_TOPROW.top}px) 0 ${PACK_TOPROW.content - PACK_TOPROW.top - PACK_TOPROW.h}px;background:var(--msg-bar);border-bottom:1px solid var(--msg-bar-edge);box-shadow:var(--msg-bar-shadow);flex-shrink:0;}
.msg-inbox-headinner{display:flex;align-items:center;justify-content:space-between;gap:12px;height:${PACK_TOPROW.h}px;${PACK_COL_FIT}margin:0 auto;}
.msg-inbox-title{flex:1 1 auto;min-width:0;font-family:${FONT_TITLE};font-weight:700;font-size:20px;color:var(--msg-title);} /* písmo: nadpis */
/* Zavrieť = šípka späť vľavo v bledom kruhu (Matej 27. 9. 2026: „dávajme všade len šípky, nie krížiky"). */
.msg-x{${backCircleCSS('pale')}}
.msg-x:hover{${backHoverCSS('pale')}}
/* ZOZNAM = bez karty, riadky cez celý stĺpec obsahu ako IG Direct. */
.msg-inbox-list{${PACK_COL_FIT}margin:0 auto;padding:0 0 calc(env(safe-area-inset-bottom,0px) + 24px);box-sizing:border-box;flex:1 0 auto;position:relative;z-index:2;}
/* ⚠️ Riadok je <div role="button">, NIE <button> — vnútri je vlastné tlačidlo (štítok výletu)
   a <button> v <button> je nevalidný HTML. Preto tu musí ostať aj :focus-visible. */
.msg-row{display:flex;align-items:center;gap:16px;width:100%;box-sizing:border-box;text-align:left;background:transparent;color:var(--msg-ink);border:0;border-bottom:1px solid var(--msg-sep);padding:12px 8px;cursor:pointer;transition:background .15s;font-family:inherit;-webkit-tap-highlight-color:transparent;}
.msg-row:last-child{border-bottom:0;}
.msg-row:hover,.msg-row:active{background:var(--msg-row-hot);}
.msg-row:focus-visible{outline:none;background:var(--msg-row-hot);}
/* Avatar bez fotky = zlatá PLOCHA, brandová rampa okolo #C99A3F — NIE gradient .btn-gold (ten je pre tlačidlo). */
.msg-avatar{flex-shrink:0;width:56px;height:56px;border-radius:50%;background:linear-gradient(140deg,${T.cardEdge},#A3782B);background-size:cover;background-position:center;border:1px solid ${PALE.border};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:20px;color:${T.card};}
.msg-row-mid{flex:1;min-width:0;}
.msg-row-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;}
.msg-row-name{font-weight:700;font-size:14px;color:var(--msg-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-row-pack{font-family:${FONT_UI};font-weight:400;font-size:10px;color:var(--msg-dim);}
.msg-row-time{flex-shrink:0;font-family:${FONT_UI};font-size:10px;color:var(--msg-dim);}
.msg-row-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px;}
/* Posledná správa = JEDEN riadok. Neprečítaná je tučnejšia a v plnom inkouste. */
.msg-row-preview{font-family:${FONT_UI};font-size:12px;font-weight:400;color:var(--msg-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-row.is-unread .msg-row-preview{font-weight:600;color:var(--msg-ink);}
.msg-row.is-unread .msg-row-time{font-weight:600;color:var(--msg-ink);}
/* Neprečítané = bodka. ČERVENÁ od člena (rovnako ako číslo na obálke), CYAN od zakladateľa/DOGYPTu
   (Matej 27. 10.). Farby sú tie isté ako badge v PackNotifications. */
.msg-dot{flex-shrink:0;width:10px;height:10px;border-radius:50%;background:${SNIFFER_HEART};}
.msg-dot.is-founder{background:${AINUBIS.cyan};}
.msg-tagchip{display:inline-flex;align-items:center;gap:4px;margin-top:8px;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 8px;border-radius:999px;background:var(--msg-chip);border:1px solid var(--msg-btn-edge);color:var(--msg-chip-ink);white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-avatar.is-sniffer{position:relative;}
.msg-origin{position:absolute;right:-4px;bottom:-4px;width:20px;height:20px;border-radius:50%;background:${T.card};border:1px solid ${T.cardEdge};padding:0;box-sizing:border-box;object-fit:contain;}
.msg-tagchip--click:hover{background:var(--msg-chip-hot);border-color:${T.cardEdge};}
/* PRÁZDNY STAV — bez bloku: ikonka, veta, nápoveda a jedno lapis CTA. */
.msg-emptybox{display:flex;flex-direction:column;align-items:center;gap:12px;padding:48px 16px;text-align:center;margin:auto;}
.msg-emptytitle{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:var(--msg-title);} /* písmo: nadpis */
.msg-emptysub{margin:0;font-family:${FONT_UI};font-size:12px;line-height:1.5;color:var(--msg-dim);max-width:320px;}
/* Jediné hlavné CTA → LAPIS (na bledom podklade). Geometria .btn-gold (radius 8, NIE pilulka). */
.msg-emptybtn{margin-top:12px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 24px;border-radius:8px;border:1px solid ${LAPIS.deep};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;} /* písmo: cta */
.msg-emptybtn:hover{background:${LAPIS.gradHover};}

/* Šírka stĺpca = domov /pack (PACK_COL, 21. 9. 2026) — od 640 px padding 24, nie 16. */
${packColCSS('.msg-inbox-headinner,.msg-inbox-list')}
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

export function Inbox({ onOpenThread, onClose, onOpenSniffer, onOpenTrip }: {
  onOpenThread: (convId: string) => void;
  onClose: () => void;
  /** #55 — prázdny inbox potrebuje jednu akciu: rozhovor začína na tripe, nie tu. */
  onOpenSniffer?: () => void;
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
    <div className="msg-inbox msg-skin">
            <style>{MSG_SKIN_CSS}</style>
      <style>{INBOX_CSS}</style>
      <div className="msg-inbox-head">
        <div className="msg-inbox-headinner">
          <button type="button" className="msg-x" onClick={onClose} aria-label={t('pack.msg.closeAriaLabel')}><BackIcon /></button>
          <div className="msg-inbox-title">{t('pack.msg.inboxTitle')}</div>
        </div>
      </div>
      <div className="msg-inbox-list">
        {convs.length === 0 ? (
          <div className="msg-emptybox">
            <BrandIcon name="chat" size={48} tint="gold" />
            <p className="msg-emptytitle">{t('pack.msg.emptyTitle')}</p>
            {/* Tlačidlo vedie do SNIFFERu — len kde SNIFFER beží (BUDDY_LIVE); inde by `/pack/sniffer`
                presmeroval na mapu, takže tam ostane len text bez SNIFFERu. */}
            <p className="msg-emptysub">{t(BUDDY_LIVE ? 'pack.msg.emptySub' : 'pack.msg.emptySubNoSniffer')}</p>
            {BUDDY_LIVE && onOpenSniffer && <button type="button" className="msg-emptybtn" onClick={onOpenSniffer}>{t('pack.msg.openSniffer')}</button>}
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
                className={`msg-row${unread ? ' is-unread' : ''}`}
                onClick={openThread}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openThread(); }
                }}
              >
                <span
                  className={`msg-avatar${conv.tag?.label === 'SNIFFER' ? ' is-sniffer' : ''}`}
                  style={!isGroup && other?.avatarUrl ? { backgroundImage: `url('${sizedUrl(other.avatarUrl, 160)}')` } : undefined}
                >
                  {(isGroup || !other?.avatarUrl) && initial}
                  {/* PÔVOD vlákna (Matej 26. 9.: „správy budú mať ikonky odkiaľ sa píše — či sniffer
                      alebo nie"). Výlet má vlastný štítok pod správou; SNIFFER nesie znak na avatare. */}
                  {conv.tag?.label === 'SNIFFER' && (
                    <img className="msg-origin" src="/icons/sniffer/sniffer-znak.svg" alt="SNIFFER" title="SNIFFER" />
                  )}
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
                    {unread && <span className={`msg-dot${conv.founder ? ' is-founder' : ''}`} aria-hidden />}
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
