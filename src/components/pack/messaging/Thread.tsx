// Thread overlay — jedna konverzácia (DM alebo open group). Design:
// plany/zadanie-profil-messaging-2026-07-23.md §4.3/§12. Send box (Enter=send), auto-scroll dole,
// markRead pri mounte/otvorení. Nejoinnutá open group → "Join the pack" namiesto send boxu.
//
// ── DRAK → BRIGHT, krok 2 (2026-09-02) ─────────────────────────────────────
// Do 1. 9. 2026 tmavá plocha (`T.pageBg` + `onDark*` inkoust). Prezlečené do papyrusu podľa
// `plany/zadanie-drak-bright-pokracovanie-FRESH-SESSION.md`; predloha = `PackTriplist.tsx`.
//
// ⚠️ DVA ŠATY, JEDNA SADA PRAVIDIEL (2026-09-01). Matej: „správy daj možnosť aj prepnúť
//    do tmavej = to isté ale v čiernej s oranžovozlatou a bledou farbou bubliniek."
//    Farby sú CSS premenné z `msgTheme.ts`; tento súbor nevie, ktorý šat beží.
//    Podklad nesie trieda `.msg-skin`, nie tento súbor.
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
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { MSG_SKIN_CSS, useMsgSkin } from './msgTheme';
import { SkinToggle } from './Inbox';
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
const A = AINUBIS;

// Brand lock: meno psa je VŽDY Cinzel Decorative, na každom povrchu.
// Meno človeka (účet bez psa) ostáva Cinzel — Decorative je vyhradený psom.
const DOG_NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const HUMAN_NAME_FONT = "'Cinzel', serif";

export const THREAD_CSS = `
/* ⚠️ FARBY SÚ PREMENNÉ z msgTheme.ts (.msg-skin / .msg-skin--dark). Konkrétna farba napísaná
   sem platí len pre jeden šat a v druhom z nej bude nečitateľné miesto.
   Dvojtriedny selektor (0,2,0) prebije position:relative z .msg-skin bez ohľadu na poradie
   <style> blokov. Pozadie ani tapetu tu nehľadaj — nesie ich .msg-skin. */
.msg-thread.msg-skin{position:fixed;inset:0;z-index:1300;display:flex;flex-direction:column;}
.msg-thread-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 22px) 20px 16px;background:var(--msg-bar);border-bottom:1px solid var(--msg-bar-edge);box-shadow:var(--msg-bar-shadow);flex-shrink:0;}
.msg-back{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-btn-ink);font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-back:hover{border-color:${T.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}
.msg-thread-headtxt{min-width:0;}
/* Meno v hlavičke je IDENTITA -> FONT_TITLE (pri psovi Decorative, to rieši inline štýl). */
.msg-thread-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:var(--msg-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-thread-sub{font-family:${FONT_UI};font-size:11px;color:var(--msg-dim);margin-top:2px;}
.msg-tagchip{display:inline-flex;align-items:center;gap:4px;margin-top:5px;font-family:${FONT_TITLE};font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:var(--msg-chip);border:1px solid var(--msg-btn-edge);color:var(--msg-chip-ink);white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-tagchip--click:hover{background:var(--msg-chip-hot);border-color:${T.cardEdge};}
.msg-thread-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:18px 16px;max-width:640px;width:100%;margin:0 auto;display:flex;flex-direction:column;position:relative;z-index:2;}
.msg-bubblewrap{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:11px;max-width:82%;}
.msg-bubblewrap.me{align-items:flex-end;align-self:flex-end;}
/* FOTKA TOHO, KTO PÍŠE, VEDĽA BUBLINY (Matej 1. 9. 2026: „vedľa bublinky by mala byť
   ikonka fotka"). Cudzia správa má fotku vľavo, moja vpravo — teda na tej strane, kde
   bublina aj stojí; zrkadlí to row-reverse, nie druhá sada pravidiel. */
.msg-bubblerow{display:flex;align-items:flex-end;gap:8px;min-width:0;}
.msg-bubblewrap.me .msg-bubblerow{flex-direction:row-reverse;}
/* Kruh je menší než v inboxe (28 vs 42) — tam je fotka predmetom riadku, tu sprevádza text. */
.msg-bubbleav{flex:0 0 auto;width:28px;height:28px;border-radius:50%;background:linear-gradient(140deg,#C99A3F,#A3782B);background-size:cover;background-position:center;border:1px solid rgba(179,130,45,0.55);box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:11px;color:#FBF5E6;}
/* Meno odosielateľa sedí nad BUBLINOU, nie nad fotkou — odsadenie = šírka kruhu + medzera. */
.msg-bubble-sender{font-family:${FONT_TITLE};font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--msg-dim);margin-bottom:3px;padding:0 3px 0 39px;}
/* BUBLINY — Matej 1. 9. 2026: „musia byť výraznejšie tie čo prídu od človeka aj odomňa,
   jedna z nich by mohla byť lapis."
   CUDZIA = svetlý blok s plným zlatým rámom a nadvihnutím (v tmavom šate BLEDÁ plôška
   na čiernom — v oboch prípadoch svetlá, len na inom podklade).
   MOJA = plná farba: v svetlom šate LAPIS so zlatým písmom, v tmavom ORANŽOVOZLATÁ
   s tmavým. Prvé kolo tu malo tint pri 14 %; Matej ho zrušil a má na to dôvod: bublina nie
   je tlačidlo ani výber, je to OBSAH, a v rozhovore musí byť na prvý pohľad vidno, kto hovorí.
   ⚠️ Plná farba tu preto NEZNAMENÁ „moja akcia" ale „môj hlas" — a keďže odosielacie tlačidlo
      má tú istú farbu, čítajú sa ako jedna rodina („ja"), nie ako dve súperiace hlavné veci. */
.msg-bubble{font-family:${FONT_UI};font-size:13px;line-height:1.5;padding:11px 15px;border-radius:16px;background:var(--msg-block);color:var(--msg-block-ink);border:1px solid var(--msg-block-edge);box-shadow:var(--msg-block-shadow);}
.msg-bubble.me{background:var(--msg-mine);color:var(--msg-mine-ink);border-color:var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);}
.msg-empty{text-align:center;padding:40px 16px;color:var(--msg-dim);font-size:12.5px;font-style:italic;}
.msg-senderr{flex-shrink:0;max-width:640px;width:100%;margin:0 auto;padding:0 16px 8px;box-sizing:border-box;font-family:${FONT_UI};font-size:11.5px;color:var(--msg-err);}
.msg-thread-send{flex-shrink:0;display:flex;gap:10px;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 14px);border-top:1px solid var(--msg-bar-edge);background:var(--msg-bar);max-width:640px;width:100%;margin:0 auto;box-sizing:border-box;position:relative;z-index:2;}
/* Písacie pole je v OBOCH šatoch plochá výplň bez gradientu; zaostrenie nesie farbu „mojej"
   strany, teda to isté, čo bublina a tlačidlo. */
.msg-thread-input{flex:1;background:var(--msg-field);border:1px solid var(--msg-btn-edge);border-radius:999px;padding:11px 16px;color:var(--msg-field-ink);font-family:${FONT_UI};font-size:13px;outline:0;}
.msg-thread-input::placeholder{color:var(--msg-faint);}
.msg-thread-input:focus{border-color:var(--msg-focus);box-shadow:0 0 0 3px var(--msg-focus-halo);}
/* ⚠️ IKONKA JE DOČASNE 'feather' (Matej 1. 9. 2026). Do vtedy tu stálo 'chat' — dve bubliny
   konverzácie, čo je NÁZOV povrchu, nie akcia odoslania. Hand-drawn kit plachtičku ani šípku
   nemá; brko je z neho jediné, čo o poslaní odkazu hovorí a nehovorí pritom nič iné
   (link = odkaz, walk = výlet). Matej dokreslí vlastnú — potom sa vymení TU.
   ⚠️ Filter ikonky sa mení so šatom: na lapise musí byť biela, na oranžovozlatej tmavá.
      Nesie to premenná --msg-icon, nie prop komponentu — inak by sa to muselo riešiť
      v JSX na dvoch miestach a rozišlo by sa. */
.msg-sendbtn{flex-shrink:0;width:42px;height:42px;border-radius:50%;background:var(--msg-mine);border:1px solid var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);cursor:pointer;display:flex;align-items:center;justify-content:center;}
.msg-sendbtn img{filter:var(--msg-icon) !important;}
.msg-sendbtn:hover:not(:disabled){background:var(--msg-mine-hover);}
/* ⚠️ Zoslabenie krytím na svetlom povrchu takmer nevidno. Vypnuté tlačidlo preto stráca
   FARBU, nie priehľadnosť — a v tmavom šate platí to isté opačne. */
.msg-sendbtn:disabled{background:var(--msg-off);border-color:var(--msg-btn-edge);box-shadow:none;cursor:default;}
.msg-sendbtn:disabled img{opacity:.55;}
.msg-thread-join{flex-shrink:0;padding:14px 16px calc(env(safe-area-inset-bottom,0px) + 16px);border-top:1px solid var(--msg-bar-edge);background:var(--msg-bar);max-width:640px;width:100%;margin:0 auto;box-sizing:border-box;position:relative;z-index:2;}
/* Geometria z .btn-gold (radius 8, NIE pilulka) — zmena farby nie je povolenie na iný tvar. */
.msg-joinbtn{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:14px;border-radius:8px;background:var(--msg-mine);color:var(--msg-mine-ink);border:1px solid var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);cursor:pointer;}
.msg-joinbtn:hover{background:var(--msg-mine-hover);}

/* ══ MODERÁCIA (#54) — TENTO PANEL JE AINUBISOV, NIE PAPYRUSOVÝ ══════════════
   Matej 1. 9. 2026: „Report ako aj ine nahlasenia či otazky o bezpečnosti ma na starosti
   AINUBIS = tento panel bude ainubis brand."
   Nie je to odchýlka od šatu, je to priradenie vlastníka: papyrus a lapis sú hlas DOGYPTU,
   toto je hlas stroja, ktorý bezpečnosť rieši. Tokeny z ainubisSkin.ts (jeden zdroj),
   predloha .mcoach-bubble v MapCoach.tsx — tú Matej výslovne pochválil.
   🔑 PRETO SA NEPREPÍNA SO ŠATOM. Je tmavý vždy, aj keď správy svietia nabielo — Ainubis
      má jednu podobu a prepínanie by z nej spravilo motív appky.
   ⚠️ CTA je jeho ZLATO-ORANŽOVÉ, nie lapis (28. 8.: „AINUBIS je výnimka! Je to jeho brand"). */
.msg-mod{margin-left:auto;flex-shrink:0;width:34px;height:34px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-dim);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-mod:hover{border-color:${T.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}
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
.msg-modsend:disabled{background:rgba(91,224,240,0.10);color:${A.inkFaint};border-color:${A.edge};box-shadow:none;cursor:default;}
.msg-modcancel{width:100%;margin-top:8px;background:none;border:0;color:${A.inkFaint};font-family:${FONT_UI};font-size:12.5px;padding:9px;cursor:pointer;}
.msg-modcancel:hover{color:${A.ink};}
.msg-blocked{flex-shrink:0;max-width:640px;width:100%;margin:0 auto;padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 16px);border-top:1px solid var(--msg-bar-edge);background:var(--msg-bar);box-sizing:border-box;text-align:center;position:relative;z-index:2;}
.msg-blockedtxt{font-family:${FONT_UI};font-size:12.5px;line-height:1.6;color:var(--msg-dim);}
.msg-unblock{margin-top:10px;font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:10px 20px;border-radius:8px;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-btn-ink);cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.msg-unblock:hover{border-color:${T.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}

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
  const [skin, toggleSkin] = useMsgSkin();
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
      <div className={`msg-thread msg-skin${skin === 'dark' ? ' msg-skin--dark' : ''}`}>
        <style>{MSG_SKIN_CSS}</style>
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
    <div className={`msg-thread msg-skin${skin === 'dark' ? ' msg-skin--dark' : ''}`}>
      {/* Tapetu nesie .msg-skin — <HieroglyphBg /> sa sem NEPRIDÁVA (bola by druhá vrstva). */}
      <style>{MSG_SKIN_CSS}</style>
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
        <div className="msg-inbox-acts" style={{ marginLeft: 'auto' }}>
          <SkinToggle skin={skin} onToggle={toggleSkin} />
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
          // Fotku nesie iba druhá strana (`other_photo` z DB); `getMe()` ju zatiaľ nemá,
          // takže moja bublina ukazuje iniciálu — nie je to chyba, len nedoplnený údaj.
          const who = mine ? (sender ?? me) : sender;
          const avatar = who?.avatarUrl;
          const initial = (who?.name ?? '?').charAt(0).toUpperCase();
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
              <div className="msg-bubblerow">
                <span
                  className="msg-bubbleav"
                  aria-hidden="true"
                  style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined}
                >
                  {!avatar && initial}
                </span>
                <div className={`msg-bubble${mine ? ' me' : ''}`}>{m.text}</div>
              </div>
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
          {modErr && <div className="msg-blockedtxt" role="alert" style={{ marginTop: 10, color: 'var(--msg-err)' }}>{modErr}</div>}
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
            <BrandIcon name="feather" size={17} tint="white" />
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
                <div className="msg-modtitle">{t('pack.msg.reportSentTitle')}</div>
                <div className="msg-modsub">
                  {t('pack.msg.reportSentBody')}
                </div>
                <div className="msg-modrow">
                  {/* Blokovanie tu NEMÁ vlastné kľúče — je to tá istá akcia ako vo vetve
                      `menu`, takže berie tú istú dvojicu. Dva kľúče pre jedno tlačidlo by
                      sa pri prvej úprave znenia rozišli. */}
                  <button type="button" className="msg-modbtn msg-modbtn--danger" disabled={modBusy} onClick={() => void handleBlock(true)}>
                    {modBusy ? t('pack.msg.blocking') : t('pack.msg.blockButton', { name: title })}
                  </button>
                </div>
                <button type="button" className="msg-modcancel" onClick={closeMod}>{t('pack.msg.done')}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
