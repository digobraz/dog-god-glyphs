// Thread overlay — jedna konverzácia (DM alebo open group). Design:
// plany/zadanie-profil-messaging-2026-07-23.md §4.3/§12. Send box (Enter=send), auto-scroll dole,
// markRead pri mounte/otvorení. Nejoinnutá open group → "Join the pack" namiesto send boxu.
//
// ── DRAK → BRIGHT, krok 2 (2026-09-02) ─────────────────────────────────────
// Do 1. 9. 2026 tmavá plocha (`T.pageBg` + `onDark*` inkoust). Prezlečené do papyrusu podľa
// `plany/zadanie-drak-bright-pokracovanie-FRESH-SESSION.md`; predloha = `PackTriplist.tsx`.
//
// ⚠️ PODKLAD SA TU NEPÍŠE — nesie ho `.pk-paper` z `packTheme.ts`. `<HieroglyphBg />` sa
//    k nemu NEVOLÁ (je tmavá, boli by dve tapety cez seba).
//
// ⚠️ MOJA BUBLINA JE LAPISOVÝ TINT, NIE PLNÁ FARBA. Na tmavom ich odlišovala svetlosť; na
//    papyruse to nestačí, tak sa siahlo po farbe — ale plná farebná plocha je vyhradená
//    JEDINÉMU hlavnému CTA na obrazovke (tu odosielanie / JOIN). Recept je `pickTintCSS`,
//    nie tri opísané rgba čísla: čitateľnosť tintu nesie TMAVÝ inkoust a plný farebný rám,
//    nie krytie výplne (to je presne to, na čom padlo 26. 8. prvé kolo bledých chipov).
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PAPER_PAGE_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { PALE, LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { BackButton } from '@/components/pack/BackButton';
import { tripNames, tripNameSync } from './tripLabel';
import {
  getConversation, getMe, joinGroup, markRead, reportContent, sendMessage, setPeerBlocked,
  subscribe, type Conversation, type ReportReason,
} from './packMessaging';

const T = PACK_THEME;
const P = PALE;

// Brand lock: meno psa je VŽDY Cinzel Decorative, na každom povrchu.
// Meno človeka (účet bez psa) ostáva Cinzel — Decorative je vyhradený psom.
const DOG_NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const HUMAN_NAME_FONT = "'Cinzel', serif";

export const THREAD_CSS = `
/* ⚠️ Dvojtriedny selektor (0,2,0) prebije position:relative z .pk-paper bez ohľadu na poradie
   <style> blokov — to isté ako v Inbox.tsx. Pozadie ani min-height tu NIE SÚ, nesie ich .pk-paper. */
.msg-thread.pk-paper{position:fixed;inset:0;z-index:1300;display:flex;flex-direction:column;}
/* Lepiaca hlavička je LIŠTA (panelový gradient + zlatá spodná hrana), nie holá stránka —
   musí byť nepriehľadná, lebo pod ňou podchádzajú bubliny. */
.msg-thread-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 22px) 20px 16px;background:${T.panelGrad};border-bottom:1px solid ${P.border};box-shadow:0 2px 10px rgba(122,90,42,0.10);flex-shrink:0;}
.msg-back{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:${P.soft};border:1px solid ${P.border};color:${P.ink};font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-back:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
.msg-thread-headtxt{min-width:0;}
/* Meno v hlavičke je IDENTITA -> FONT_TITLE (pri psovi Decorative, to rieši inline štýl). */
.msg-thread-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${P.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-thread-sub{font-family:${FONT_UI};font-size:11px;color:${P.dim};margin-top:2px;}
.msg-tagchip{display:inline-flex;align-items:center;gap:4px;margin-top:5px;font-family:${FONT_TITLE};font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:${P.hot};border:1px solid ${P.border};color:${P.deep};white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-tagchip--click:hover{background:rgba(201,154,63,0.32);border-color:${T.cardEdge};}
.msg-thread-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:18px 16px;max-width:640px;width:100%;margin:0 auto;display:flex;flex-direction:column;position:relative;z-index:2;}
.msg-bubblewrap{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:11px;max-width:78%;}
.msg-bubblewrap.me{align-items:flex-end;align-self:flex-end;}
.msg-bubble-sender{font-family:${FONT_TITLE};font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;color:${P.dim};margin-bottom:3px;padding:0 3px;}
/* CUDZIA bublina = papyrusová doska (plochá výplň .pf-field--flat + zlatý vlas).
   MOJA = lapisový tint, teda tá istá doska podfarbená modrou — plnú modrú si drží tlačidlo. */
.msg-bubble{font-family:${FONT_UI};font-size:13px;line-height:1.5;padding:10px 14px;border-radius:16px;background:${P.field};color:${P.ink};border:1px solid ${P.border};}
.msg-bubble.me{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.14)}}
.msg-empty{text-align:center;padding:40px 16px;color:${P.dim};font-size:12.5px;font-style:italic;}
/* Chyby na papyruse idú do TMAVEJ červenej (PICK_INK.red). Svetlé #E0A0A0 z tmavého šatu
   by na piesku zmizlo — svetlý inkoust na svetlom je presne ten pád z 26. 8. */
.msg-senderr{flex-shrink:0;max-width:640px;width:100%;margin:0 auto;padding:0 16px 8px;box-sizing:border-box;font-family:${FONT_UI};font-size:11.5px;color:${PICK_INK.red};}
.msg-thread-send{flex-shrink:0;display:flex;gap:10px;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 14px);border-top:1px solid ${P.border};background:${T.panelGrad};max-width:640px;width:100%;margin:0 auto;box-sizing:border-box;position:relative;z-index:2;}
/* Písacie pole ostáva PAPYRUSOVÉ (.pf-field--flat) — čierna je na čítanie, nie na vypĺňanie.
   Zaostrenie je lapisové: „čo práve robím" je moja akcia, nie konštrukcia. */
.msg-thread-input{flex:1;background:${P.field};border:1px solid ${P.border};border-radius:999px;padding:11px 16px;color:${P.ink};font-family:${FONT_UI};font-size:13px;outline:0;}
.msg-thread-input::placeholder{color:${P.faint};}
.msg-thread-input:focus{border-color:${LAPIS.edge};box-shadow:0 0 0 3px ${LAPIS.halo};}
/* Jediné hlavné CTA v send boxe -> plný lapis. Ikonka je 'white', nie 'gold': brandová
   #C99A3F má na #16307A kontrast pod 3:1 a 16px kresba by sa v nej stratila. */
.msg-sendbtn{flex-shrink:0;width:42px;height:42px;border-radius:50%;background:${LAPIS.grad};border:1px solid ${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;display:flex;align-items:center;justify-content:center;}
.msg-sendbtn:hover:not(:disabled){background:${LAPIS.gradHover};}
/* ⚠️ Zoslabenie krytím na svetlom povrchu takmer nevidno (blednutie do skoro bielej).
   Vypnuté tlačidlo preto stráca FARBU, nie priehľadnosť. */
.msg-sendbtn:disabled{background:${P.hot};border-color:${P.border};box-shadow:none;cursor:default;}
.msg-sendbtn:disabled img{opacity:.55;}
.msg-thread-join{flex-shrink:0;padding:14px 16px calc(env(safe-area-inset-bottom,0px) + 16px);border-top:1px solid ${P.border};background:${T.panelGrad};max-width:640px;width:100%;margin:0 auto;box-sizing:border-box;position:relative;z-index:2;}
/* Geometria z .btn-gold (radius 8, NIE pilulka), výplň lapis — zmena farby nie je
   povolenie na iný tvar. */
.msg-joinbtn{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:14px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.msg-joinbtn:hover{background:${LAPIS.gradHover};}

/* ── moderácia (#54): nahlásiť / zablokovať ── */
.msg-mod{margin-left:auto;flex-shrink:0;width:34px;height:34px;border-radius:50%;background:${P.soft};border:1px solid ${P.border};color:${P.dim};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-mod:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
/* Závoj ostáva TMAVÝ aj na bledom šate — je to zatemnenie pozadia, nie povrch (precedens
   components/gods/photoConfirm.ts). Odchod je klikom mimo; krížik tu nie je zámerne (lock 28. 8.). */
.msg-modsheet{position:fixed;inset:0;z-index:1400;background:rgba(0,0,0,0.62);display:flex;align-items:flex-end;justify-content:center;}
/* ÚROVEŇ 4 MATRICE — PANEL (panelGrad · 1.5px cardEdge · panelShadow). Radius je spodný
   plát (16/16/0/0), lebo je to sheet zdola; to je tvar, nie iná úroveň. */
.msg-modpanel{width:100%;max-width:460px;background:${T.panelGrad};border:1.5px solid ${T.cardEdge};border-bottom:0;border-radius:16px 16px 0 0;box-shadow:${T.panelShadow};padding:20px 20px calc(env(safe-area-inset-bottom,0px) + 20px);box-sizing:border-box;}
.msg-modtitle{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${P.ink};}
.msg-modsub{font-family:${FONT_UI};font-size:12px;line-height:1.55;color:${P.dim};margin-top:6px;}
.msg-modrow{display:flex;flex-direction:column;gap:8px;margin-top:16px;}
/* Voľba dôvodu = RIADOK (úroveň 3), vybraný = lapisový tint, nie zlatý rám: výber je
   „moja voľba", a tá je na papyruse modrá. */
.msg-modbtn{width:100%;text-align:left;font-family:${FONT_UI};font-size:13px;padding:12px 14px;border-radius:10px;background:${T.tileBg};border:1px solid ${T.border};color:${P.ink};cursor:pointer;transition:border-color .15s,background .15s;}
.msg-modbtn:hover{border-color:${T.cardEdge};background:${P.hot};}
.msg-modbtn.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.msg-modbtn--danger{color:${PICK_INK.red};}
.msg-modbtn--danger:hover{border-color:${PICK_INK.red};background:rgba(142,42,32,0.08);}
.msg-modnote{width:100%;box-sizing:border-box;margin-top:10px;min-height:74px;background:${P.field};border:1px solid ${P.border};border-radius:10px;padding:11px 13px;color:${P.ink};font-family:${FONT_UI};font-size:13px;outline:0;resize:vertical;}
.msg-modnote::placeholder{color:${P.faint};}
.msg-modnote:focus{border-color:${LAPIS.edge};box-shadow:0 0 0 3px ${LAPIS.halo};}
.msg-modsend{width:100%;margin-top:12px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:8px;background:${LAPIS.grad};color:${LAPIS.ink};border:1px solid ${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.msg-modsend:hover:not(:disabled){background:${LAPIS.gradHover};}
.msg-modsend:disabled{background:${P.hot};color:${P.faint};border-color:${P.border};box-shadow:none;cursor:default;}
.msg-modcancel{width:100%;margin-top:8px;background:none;border:0;color:${P.dim};font-family:${FONT_UI};font-size:12.5px;padding:9px;cursor:pointer;}
.msg-modcancel:hover{color:${P.ink};}
.msg-blocked{flex-shrink:0;max-width:640px;width:100%;margin:0 auto;padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 16px);border-top:1px solid ${P.border};background:${T.panelGrad};box-sizing:border-box;text-align:center;position:relative;z-index:2;}
.msg-blockedtxt{font-family:${FONT_UI};font-size:12.5px;line-height:1.6;color:${P.dim};}
.msg-unblock{margin-top:10px;font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:10px 20px;border-radius:8px;background:${P.soft};border:1px solid ${P.border};color:${P.ink};cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.msg-unblock:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
`;

// Dôvody nahlásenia — label sa berie cez t() v komponente, mapa drží len kľúč (i18n fáza A).
const REPORT_REASONS: Array<{ id: ReportReason; labelKey: string }> = [
  { id: 'harassment', labelKey: 'pack.msg.reportReasonHarassment' },
  { id: 'spam', labelKey: 'pack.msg.reportReasonSpam' },
  { id: 'unsafe', labelKey: 'pack.msg.reportReasonUnsafe' },
  { id: 'not_dog_related', labelKey: 'pack.msg.reportReasonNotDogRelated' },
  { id: 'other', labelKey: 'pack.msg.reportReasonOther' },
];

export function Thread({ convId, onClose, onOpenTrip }: {
  convId: string;
  onClose: () => void;
  onOpenTrip?: (tripId: string) => void;
}) {
  const [conv, setConv] = useState<Conversation | null>(null);
  const [text, setText] = useState('');
  const [sendErr, setSendErr] = useState<string | null>(null);
  // moderácia (#54): 'menu' = voľby, 'report' = výber dôvodu, 'sent' = potvrdenie
  const [modView, setModView] = useState<null | 'menu' | 'report' | 'sent'>(null);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [modBusy, setModBusy] = useState(false);
  const [modErr, setModErr] = useState<string | null>(null);
  const me = getMe();
  const t = useT();
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

  // Názov výletu pre štítok. Dataset trás je veľký a sťahuje sa lazy — kým
  // dobehne, štítok ukazuje to, čo prišlo z DB (slug). `namesReady` len vynúti
  // prekreslenie; vlákno bez výletu dataset nesťahuje vôbec.
  const [namesReady, setNamesReady] = useState(false);
  useEffect(() => {
    if (namesReady || conv?.tag?.kind !== 'trip' || !conv.tag.id) return;
    let alive = true;
    tripNames().then(() => { if (alive) setNamesReady(true); });
    return () => { alive = false; };
  }, [conv?.tag?.kind, conv?.tag?.id, namesReady]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [conv?.messages.length]);

  if (!conv) {
    return (
      <div className="msg-thread pk-paper">
        <style>{PAPER_PAGE_CSS}</style>
        <style>{THREAD_CSS}</style>
        <div className="msg-thread-head">
          <BackButton tone="dark" onClick={onClose} label={t('pack.msg.backAriaLabel')} />
          <div className="msg-thread-headtxt"><div className="msg-thread-title">{t('pack.msg.loading')}</div></div>
        </div>
      </div>
    );
  }

  const isGroup = conv.kind === 'group';
  const iAmMember = conv.memberIds.includes(me.id);
  const other = !isGroup ? conv.members.find((p) => p.id !== me.id) : undefined;
  const title = isGroup ? (conv.title ?? t('pack.msg.fallbackGroupTitle')) : (other?.name ?? t('pack.msg.fallbackMemberName'));
  // Skupina má názov, nie meno psa → Cinzel. DM dostane Decorative len vtedy,
  // keď je meno naozaj psie (`isDogName` z packMessaging).
  const titleFont = !isGroup && other?.isDogName ? DOG_NAME_FONT : HUMAN_NAME_FONT;
  const memberCount = conv.memberCount ?? conv.members.length;

  const handleTagClick = () => {
    if (conv.tag?.kind === 'trip' && conv.tag.id) {
      if (onOpenTrip) onOpenTrip(conv.tag.id);
      // TODO: bez onOpenTrip (napr. keď je Thread otvorený mimo /pack/map) zatiaľ len
      // logujeme — skok na trip cez route/overlay príde s ďalším kolom (§4.3 zadania).
      else console.log('[Thread] TODO: jump to trip', conv.tag.id);
    }
  };

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    setSendErr(null);
    try {
      const updated = await sendMessage(convId, trimmed);
      setConv(updated); // okamžitý refresh — nespoliehať sa len na emitter (ten dobehne o chvíľu tiež)
    } catch {
      // DM ide od 2026-08-03 do DB a zápis môže byť odmietnutý (blok, offline,
      // vypadnutá session). Text vraciame do inputu — správa, ktorá neodišla,
      // sa nesmie stratiť ani tváriť ako odoslaná.
      setText(trimmed);
      setSendErr(t('pack.msg.sendFailed'));
    }
  };

  const handleJoin = async () => {
    const updated = await joinGroup(convId);
    setConv(updated); // okamžitý refresh — odomkne send box hneď, bez čakania na emitter
  };

  // ── moderácia (#54) ──
  const closeMod = () => { setModView(null); setReason(null); setReportNote(''); setModErr(null); };

  const handleBlock = async (blocked: boolean) => {
    setModBusy(true);
    setModErr(null);
    try {
      const state = await setPeerBlocked(convId, blocked);
      setConv((c) => (c ? { ...c, blocked: state } : c));
      closeMod();
    } catch {
      // Zámok, ktorý sa nezapísal, sa nesmie tváriť ako platný.
      setModErr(blocked ? t('pack.msg.blockFailed')
                        : t('pack.msg.unblockFailed'));
    } finally {
      setModBusy(false);
    }
  };

  const handleReport = async () => {
    if (!reason) return;
    setModBusy(true);
    setModErr(null);
    try {
      await reportContent('conversation', convId, reason, reportNote.trim() || undefined);
      setModView('sent');
    } catch {
      setModErr(t('pack.msg.reportFailed'));
    } finally {
      setModBusy(false);
    }
  };

  return (
    <div className="msg-thread pk-paper">
      {/* Tapeta je súčasť .pk-paper — <HieroglyphBg /> sa sem NEPRIDÁVA (je tmavá). */}
      <style>{PAPER_PAGE_CSS}</style>
      <style>{THREAD_CSS}</style>
      <div className="msg-thread-head">
        <BackButton tone="dark" onClick={onClose} label={t('pack.msg.backToInboxAriaLabel')} />
        <div className="msg-thread-headtxt">
          <div className="msg-thread-title" style={{ fontFamily: titleFont }}>{title}</div>
          {isGroup && (
            <div className="msg-thread-sub">
              {t(memberCount === 1 ? 'pack.msg.memberCountOne' : 'pack.msg.memberCountMany', { n: memberCount })}
            </div>
          )}
          {conv.tag?.kind === 'trip' && conv.tag.label && (
            <button type="button" className="msg-tagchip msg-tagchip--click" onClick={handleTagClick}>
              <BrandIcon name="walk" size={10} tint="gold" /> {tripNameSync(conv.tag.id, conv.tag.label)}
            </button>
          )}
        </div>
        {!isGroup && (
          <button
            type="button"
            className="msg-mod"
            onClick={() => setModView('menu')}
            aria-label={t('pack.msg.reportBlockAriaLabel')}
            title={t('pack.msg.reportBlockTitle')}
          >⋯</button>
        )}
      </div>

      <div className="msg-thread-body">
        {conv.messages.length === 0 && <div className="msg-empty">{t('pack.msg.emptyThread')}</div>}
        {conv.messages.map((m) => {
          const mine = m.senderId === me.id;
          const sender = conv.members.find((p) => p.id === m.senderId);
          return (
            <div key={m.id} className={`msg-bubblewrap${mine ? ' me' : ''}`}>
              {isGroup && !mine && (
                <div
                  className="msg-bubble-sender"
                  style={{ fontFamily: sender?.isDogName ? DOG_NAME_FONT : HUMAN_NAME_FONT }}
                >
                  {sender?.name ?? t('pack.msg.fallbackMemberName')}
                  {sender?.packNumber ? ` ${t('pack.msg.senderPackNumberSuffix', { n: sender.packNumber })}` : ''}
                </div>
              )}
              <div className={`msg-bubble${mine ? ' me' : ''}`}>{m.text}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {sendErr && <div className="msg-senderr" role="alert">{sendErr}</div>}

      {conv.blocked ? (
        <div className="msg-blocked">
          <div className="msg-blockedtxt">
            {t('pack.msg.blockedNotice', { name: title })}
          </div>
          <button type="button" className="msg-unblock" disabled={modBusy} onClick={() => void handleBlock(false)}>
            {modBusy ? t('pack.msg.working') : t('pack.msg.unblock')}
          </button>
          {modErr && <div className="msg-blockedtxt" role="alert" style={{ marginTop: 10, color: PICK_INK.red }}>{modErr}</div>}
        </div>
      ) : iAmMember ? (
        <div className="msg-thread-send">
          <input
            className="msg-thread-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void send(); } }}
            placeholder={t('pack.msg.messageInputPlaceholder')}
          />
          <button type="button" className="msg-sendbtn" onClick={() => void send()} disabled={!text.trim()} aria-label={t('pack.msg.sendMessageAriaLabel')}>
            <BrandIcon name="chat" size={16} tint="white" />
          </button>
        </div>
      ) : (
        <div className="msg-thread-join">
          <button type="button" className="msg-joinbtn" onClick={() => void handleJoin()}>
            {conv.tag?.kind === 'trip' ? t('pack.msg.joinTripPack') : t('pack.msg.joinPack')}
          </button>
        </div>
      )}

      {modView && (
        <div className="msg-modsheet" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeMod(); }}>
          <div className="msg-modpanel">
            {modView === 'menu' && (
              <>
                <div className="msg-modtitle">{title}</div>
                <div className="msg-modsub">
                  {t('pack.msg.modMenuExplain')}
                </div>
                <div className="msg-modrow">
                  <button type="button" className="msg-modbtn" onClick={() => setModView('report')}>
                    {t('pack.msg.reportConversation')}
                  </button>
                  <button type="button" className="msg-modbtn msg-modbtn--danger" disabled={modBusy} onClick={() => void handleBlock(true)}>
                    {modBusy ? t('pack.msg.blocking') : t('pack.msg.blockButton', { name: title })}
                  </button>
                </div>
                {modErr && <div className="msg-modsub" role="alert" style={{ color: PICK_INK.red }}>{modErr}</div>}
                <button type="button" className="msg-modcancel" onClick={closeMod}>{t('pack.msg.cancel')}</button>
              </>
            )}

            {modView === 'report' && (
              <>
                <div className="msg-modtitle">{t('pack.msg.reportReasonPrompt')}</div>
                <div className="msg-modrow">
                  {REPORT_REASONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`msg-modbtn${reason === r.id ? ' on' : ''}`}
                      onClick={() => setReason(r.id)}
                    >{t(r.labelKey)}</button>
                  ))}
                </div>
                <textarea
                  className="msg-modnote"
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder={t('pack.msg.reportNotePlaceholder')}
                />
                {modErr && <div className="msg-modsub" role="alert" style={{ color: PICK_INK.red }}>{modErr}</div>}
                <button type="button" className="msg-modsend" disabled={!reason || modBusy} onClick={() => void handleReport()}>
                  {modBusy ? t('pack.msg.sending') : t('pack.msg.sendReport')}
                </button>
                <button type="button" className="msg-modcancel" onClick={closeMod}>{t('pack.msg.cancel')}</button>
              </>
            )}

            {modView === 'sent' && (
              <>
                <div className="msg-modtitle">Report sent</div>
                <div className="msg-modsub">
                  Matej reads every report himself. If this person is bothering you, block them too —
                  that takes effect right away.
                </div>
                <div className="msg-modrow">
                  <button type="button" className="msg-modbtn msg-modbtn--danger" disabled={modBusy} onClick={() => void handleBlock(true)}>
                    {modBusy ? 'Blocking…' : `Block ${title}`}
                  </button>
                </div>
                <button type="button" className="msg-modcancel" onClick={closeMod}>Done</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
