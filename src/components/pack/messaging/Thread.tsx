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
// ⚠️ MOJA BUBLINA JE PLNÝ LAPIS (Matej 1. 9. 2026). Prvé kolo tu malo tint pri 14 % podľa
//    pravidla „plná farebná plocha len pre hlavné CTA"; on ho pre bubliny zrušil: bublina
//    nie je tlačidlo ani výber, je to OBSAH, a v rozhovore musí byť na prvý pohľad vidno,
//    kto hovorí. Odosielacie tlačidlo je tiež lapisové ZÁMERNE — čítajú sa ako jedna
//    rodina („ja"), nie ako dve súperiace hlavné veci.
//
// ⚠️ PANEL HLÁSENÍ NIE JE PAPYRUSOVÝ — je AINUBISOV (tmavá modrá, cyan, zlato-oranžové
//    CTA). Bezpečnosť má na starosti on, nie appka. Tokeny v `ainubisSkin.ts`.
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PAPER_PAGE_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { PALE, LAPIS, LAPIS_BTN_SHADOW, PICK_INK } from '@/components/pack/navGoldSkin';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import ainubisFace from '@/assets/ainubis-head.png';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { BackButton } from '@/components/pack/BackButton';
import { tripNames, tripNameSync } from './tripLabel';
import {
  getConversation, getMe, joinGroup, markRead, reportContent, sendMessage, setPeerBlocked,
  subscribe, type Conversation, type ReportReason,
} from './packMessaging';

const T = PACK_THEME;
const P = PALE;
const A = AINUBIS;

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
/* BUBLINY — Matej 1. 9. 2026: „musia byť výraznejšie tie čo prídu od človeka aj odomňa,
   jedna z nich by mohla byť lapis."
   CUDZIA = svetlý papyrusový blok s PLNÝM zlatým rámom a nadvihnutím (rovnaká odpoveď ako
   pri riadkoch inboxu — plochá výplň so slabým vlasom je na tapete takmer neviditeľná).
   MOJA = PLNÝ LAPIS so zlatým písmom. Prvé kolo tu malo tint pri 14 % podľa pravidla
   „plná farebná plocha len pre hlavné CTA"; Matej ho pre bubliny zrušil a má na to dôvod:
   bublina nie je tlačidlo ani výber, je to OBSAH, a v rozhovore musí byť na prvý pohľad
   vidno, kto hovorí. Tint to nedokázal.
   ⚠️ Lapis tu preto NEZNAMENÁ „moja akcia" ale „môj hlas" — a keďže odosielacie tlačidlo je
   tiež lapisové, čítajú sa ako jedna rodina („ja"), nie ako dve súperiace hlavné veci. */
.msg-bubble{font-family:${FONT_UI};font-size:13px;line-height:1.5;padding:11px 15px;border-radius:16px;background:${T.panelGrad};color:${P.ink};border:1px solid ${T.cardEdge};box-shadow:0 2px 7px rgba(122,90,42,0.18),inset 0 1px 0 rgba(255,255,255,0.45);}
.msg-bubble.me{background:${LAPIS.grad};color:${LAPIS.ink};border-color:${LAPIS.deep};box-shadow:${LAPIS_BTN_SHADOW};}
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

/* ══ MODERÁCIA (#54) — TENTO PANEL JE AINUBISOV, NIE PAPYRUSOVÝ ══════════════
   Matej 1. 9. 2026: „Report ako aj iné nahlásenia či otázky o bezpečnosti má na starosti
   AINUBIS = tento panel bude ainubis brand."
   Nie je to odchýlka od bledého šatu, je to priradenie vlastníka: papyrus a lapis sú hlas
   DOGYPTU, toto je hlas stroja, ktorý bezpečnosť rieši. Tokeny z ainubisSkin.ts (jeden
   zdroj), predloha .mcoach-bubble v MapCoach.tsx — tú Matej výslovne pochválil.
   ⚠️ CTA je jeho ZLATO-ORANŽOVÉ, nie lapis. Priznaná výnimka z kánonu (28. 8.:
      „AINUBIS je výnimka! Je to jeho brand"). Kto to sem vráti na lapis, prepíše ho na appku. */
.msg-mod{margin-left:auto;flex-shrink:0;width:34px;height:34px;border-radius:50%;background:${P.soft};border:1px solid ${P.border};color:${P.dim};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-mod:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
/* Závoj je tmavší než pri papyrusovom paneli — pod svietiacim displejom musí byť noc,
   inak sa jeho dosvit nemá o čo oprieť. Odchod klikom mimo; krížik tu nie je (lock 28. 8.). */
.msg-modsheet{position:fixed;inset:0;z-index:1400;background:rgba(2,6,11,0.74);display:flex;align-items:flex-end;justify-content:center;}
.msg-modpanel{width:100%;max-width:460px;background:${A.surface};border:1px solid ${A.edgeStrong};border-bottom:0;border-radius:16px 16px 0 0;box-shadow:${A.panelShadow};padding:18px 20px calc(env(safe-area-inset-bottom,0px) + 20px);box-sizing:border-box;}
/* Hlava a meno hovoria, KTO to rieši — bez nich je to len tmavý panel bez majiteľa. */
.msg-modwho{display:flex;align-items:center;gap:11px;margin-bottom:13px;}
.msg-modface{flex:0 0 auto;width:38px;height:38px;object-fit:contain;border-radius:50%;background:${A.faceBg};box-shadow:${A.faceRing};}
.msg-modwho b{font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${A.ink};}
.msg-modtitle{font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${A.ink};}
.msg-modsub{font-family:${FONT_UI};font-size:12px;line-height:1.55;color:${A.inkDim};margin-top:6px;}
.msg-modrow{display:flex;flex-direction:column;gap:8px;margin-top:16px;}
/* Voľba dôvodu: vybraný svieti CYAN, nie lapisom — na jeho povrchu je lapis neviditeľný
   (tmavá modrá na tmavej modrej) a zároveň by to bol hlas appky v jeho paneli. */
.msg-modbtn{width:100%;text-align:left;font-family:${FONT_UI};font-size:13px;padding:12px 14px;border-radius:10px;background:${A.raised};border:1px solid ${A.edge};color:${A.inkDim};cursor:pointer;transition:border-color .15s,background .15s,color .15s;}
.msg-modbtn:hover{border-color:${A.edgeStrong};color:${A.ink};}
.msg-modbtn.on{border-color:${A.cyan};color:${A.ink};background:rgba(91,224,240,0.14);box-shadow:inset 0 0 0 1px rgba(91,224,240,0.45);}
.msg-modbtn--danger{color:${A.danger};}
.msg-modbtn--danger:hover{border-color:${A.danger};color:${A.danger};background:rgba(255,138,122,0.10);}
.msg-modnote{width:100%;box-sizing:border-box;margin-top:10px;min-height:74px;background:rgba(2,8,14,0.55);border:1px solid ${A.edge};border-radius:10px;padding:11px 13px;color:${A.ink};font-family:${FONT_UI};font-size:13px;outline:0;resize:vertical;}
.msg-modnote::placeholder{color:${A.inkFaint};}
.msg-modnote:focus{border-color:${A.cyan};box-shadow:0 0 0 3px rgba(91,224,240,0.20);}
.msg-modsend{width:100%;margin-top:12px;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:8px;background:${A.ctaGrad};color:${A.ctaInk};border:1px solid rgba(250,244,236,0.30);box-shadow:${A.ctaShadow};cursor:pointer;}
.msg-modsend:hover:not(:disabled){background:${A.ctaGradHover};}
/* Vypnuté stráca FARBU, nie priehľadnosť — to isté pravidlo ako na papyruse, len naopak:
   krytím by na tmavom povrchu splynulo s pozadím. */
.msg-modsend:disabled{background:rgba(91,224,240,0.10);color:${A.inkFaint};border-color:${A.edge};box-shadow:none;cursor:default;}
.msg-modcancel{width:100%;margin-top:8px;background:none;border:0;color:${A.inkFaint};font-family:${FONT_UI};font-size:12.5px;padding:9px;cursor:pointer;}
.msg-modcancel:hover{color:${A.ink};}
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
            {/* Kto to rieši. Bez hlavy je to len tmavý panel bez majiteľa. */}
            <div className="msg-modwho">
              <img className="msg-modface" src={ainubisFace} alt="" aria-hidden="true" />
              {/* Vlastné meno sa neprekladá (rovnako ako DOG ID), takže tu t() netreba.
                  Rolu už nesie nadpis panela pod tým — druhý riadok by ju len zopakoval,
                  a nový i18n kľúč by si vyžiadal en.ts, ktorý má rozrobený iná session. */}
              <b>AINUBIS</b>
            </div>
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
                {modErr && <div className="msg-modsub" role="alert" style={{ color: AINUBIS.danger }}>{modErr}</div>}
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
                {modErr && <div className="msg-modsub" role="alert" style={{ color: AINUBIS.danger }}>{modErr}</div>}
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
