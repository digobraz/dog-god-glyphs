// Thread overlay — jedna konverzácia (DM alebo open group). Design:
// plany/zadanie-profil-messaging-2026-07-23.md §4.3/§12. Send box (Enter=send), auto-scroll dole,
// markRead pri mounte/otvorení. Nejoinnutá open group → "Join the pack" namiesto send boxu.
//
// ── SPRÁVY BEZ D-BLOKU (28. 10. 2026) ──────────────────────────────────────
// Matej: „na celú šírku ako to má Instagram, bledé pozadie bez heroglyfov." Vlákno stojí na
// plochom papyruse z `msgTheme.ts` (žiadna tapeta, žiadna sklenená doska), bubliny priamo
// na ňom, písací pás prilepený dole so safe-area; nad klávesnicou ho drží `visualViewport`.
//
// ⚠️ MOJA BUBLINA JE PLNÝ LAPIS (Matej 1. 9. 2026): bublina je OBSAH, v rozhovore musí byť
//    na prvý pohľad vidno, kto hovorí. Odosielacie tlačidlo má tú istú farbu — jedna rodina „ja".
//
// ⚠️ PANEL HLÁSENÍ NIE JE PAPYRUSOVÝ — je AINUBISOV (tmavá modrá, cyan, zlato-oranžové
//    CTA). Bezpečnosť má na starosti on, nie appka. Tokeny v `ainubisSkin.ts`.
import { sizedUrl } from '@/services/cloudinaryService';
import { trackPack } from '@/lib/packAnalytics';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, FONT_TITLE, FONT_UI, GOLD_BTN, PACK_COL_FIT, packColCSS, PACK_TOPROW } from '@/components/pack/packTheme';
import { MSG_SKIN_CSS } from './msgTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { AINUBIS_SHEET_CSS, AinubisWho } from '@/components/pack/ainubisSheet';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { BackButton } from '@/components/pack/BackButton';
import { tripNames, tripNameSync } from './tripLabel';
import {
  getConversation, getMe, joinGroup, markRead, reportContent, sendMessage, setPeerBlocked,
  subscribe, type Conversation, type ReportReason,
} from './packMessaging';
import { RightGate } from '@/components/pack/RightGate';
import { PALE } from '@/components/pack/navGoldSkin';

const T = PACK_THEME;
const A = AINUBIS;

// Brand lock: meno psa je VŽDY Cinzel Decorative, na každom povrchu.
// Meno človeka (účet bez psa) ostáva Cinzel — Decorative je vyhradený psom.
const DOG_NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const HUMAN_NAME_FONT = "'Cinzel', serif";

export const THREAD_CSS = `
/* ⚠️ FARBY SÚ PREMENNÉ z msgTheme.ts (.msg-skin). Konkrétna farba napísaná
   sem platí len pre jeden šat a v druhom z nej bude nečitateľné miesto.
   Dvojtriedny selektor (0,2,0) prebije position:relative z .msg-skin bez ohľadu na poradie
   <style> blokov. Pozadie ani tapetu tu nehľadaj — nesie ich .msg-skin. */
.msg-thread.msg-skin{position:fixed;inset:0;z-index:1300;display:flex;flex-direction:column;}
/* Pás nesie POZADIE cez celé okno, stĺpec vnútri nesie OBSAH — a jeho šírka je tá istá,
   akú má telo správ (.msg-thread-body) aj písací panel (.msg-thread-send). */
/* Výška a poloha hlavičky = spoločný rad /pack (28. 10. 2026), rovnako ako .msg-inbox-head. */
.msg-thread-head{position:sticky;top:0;z-index:3;padding:calc(env(safe-area-inset-top,0px) + ${PACK_TOPROW.top}px) 0 ${PACK_TOPROW.content - PACK_TOPROW.top - PACK_TOPROW.h}px;background:var(--msg-bar);border-bottom:1px solid var(--msg-bar-edge);box-shadow:var(--msg-bar-shadow);flex-shrink:0;}
.msg-thread-headinner{display:flex;align-items:center;gap:12px;min-height:${PACK_TOPROW.h}px;${PACK_COL_FIT}margin:0 auto;}
.msg-back{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-btn-ink);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-back:hover{border-color:${T.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}
/* flex:1 + min-width:0 — bez toho dlhý štítok výletu na mobile podlezie ovládania vpravo. */
.msg-thread-headtxt{flex:1 1 auto;min-width:0;}
/* Meno v hlavičke je IDENTITA -> FONT_TITLE (pri psovi Decorative, to rieši inline štýl). */
.msg-thread-title{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:var(--msg-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-thread-sub{font-family:${FONT_UI};font-size:10px;color:var(--msg-dim);margin-top:2px;}
/* max-width + ellipsis: štítok je jeden riadok (nowrap), takže sa musí dať orezať. */
.msg-tagchip{max-width:100%;overflow:hidden;text-overflow:ellipsis;display:inline-flex;align-items:center;gap:4px;margin-top:5px;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 8px;border-radius:999px;background:var(--msg-chip);border:1px solid var(--msg-btn-edge);color:var(--msg-chip-ink);white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-tagchip--click:hover{background:var(--msg-chip-hot);border-color:${T.cardEdge};}
/* Telo vlákna: bubliny priamo na plochom papyruse, bez dosky. Stĺpec = šírka hlavičky aj písacieho pásu. */
.msg-thread-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:16px 0;${PACK_COL_FIT}margin:0 auto;display:flex;flex-direction:column;position:relative;z-index:2;}
.msg-bubblewrap{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:11px;max-width:82%;}
.msg-bubblewrap.me{align-items:flex-end;align-self:flex-end;}
/* FOTKA TOHO, KTO PÍŠE, VEDĽA BUBLINY (Matej 1. 9. 2026: „vedľa bublinky by mala byť
   ikonka fotka"). Cudzia správa má fotku vľavo, moja vpravo — teda na tej strane, kde
   bublina aj stojí; zrkadlí to row-reverse, nie druhá sada pravidiel. */
.msg-bubblerow{display:flex;align-items:flex-end;gap:8px;min-width:0;}
.msg-bubblewrap.me .msg-bubblerow{flex-direction:row-reverse;}
/* Kruh je menší než v inboxe (28 vs 42) — tam je fotka predmetom riadku, tu sprevádza text. */
.msg-bubbleav{flex:0 0 auto;width:28px;height:28px;border-radius:50%;background:linear-gradient(140deg,${T.cardEdge},#A3782B);background-size:cover;background-position:center;border:1px solid ${PALE.border};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:10px;color:${T.card};}
/* Meno odosielateľa sedí nad BUBLINOU, nie nad fotkou — odsadenie = šírka kruhu + medzera. */
.msg-bubble-sender{font-family:${FONT_TITLE};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:var(--msg-dim);margin-bottom:3px;padding:0 4px 0 39px;}
/* BUBLINY — Matej 1. 9. 2026: „musia byť výraznejšie tie čo prídu od človeka aj odomňa,
   jedna z nich by mohla byť lapis."
   CUDZIA = svetlý blok s plným zlatým rámom a nadvihnutím (v tmavom šate BLEDÁ plôška
   na čiernom — v oboch prípadoch svetlá, len na inom podklade).
   MOJA = plná farba: v svetlom šate LAPIS so zlatým písmom, v tmavom ORANŽOVOZLATÁ
   s tmavým. Prvé kolo tu malo tint pri 14 %; Matej ho zrušil a má na to dôvod: bublina nie
   je tlačidlo ani výber, je to OBSAH, a v rozhovore musí byť na prvý pohľad vidno, kto hovorí.
   ⚠️ Plná farba tu preto NEZNAMENÁ „moja akcia" ale „môj hlas" — a keďže odosielacie tlačidlo
      má tú istú farbu, čítajú sa ako jedna rodina („ja"), nie ako dve súperiace hlavné veci. */
.msg-bubble{font-family:${FONT_UI};font-size:12px;line-height:1.5;padding:12px 16px;border-radius:16px;background:var(--msg-block);color:var(--msg-block-ink);border:1px solid var(--msg-block-edge);box-shadow:var(--msg-block-shadow);}
.msg-bubble.me{background:var(--msg-mine);color:var(--msg-mine-ink);border-color:var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);}
.msg-empty{text-align:center;padding:32px 16px;color:var(--msg-dim);font-size:12px;font-style:italic;}
.msg-senderr{flex-shrink:0;${PACK_COL_FIT}margin:0 auto;padding:0 0 8px;box-sizing:border-box;font-family:${FONT_UI};font-size:12px;color:var(--msg-err);}
/* ── PÍSANIE SPRÁVY = PÁS PRILEPENÝ DOLE (28. 10. 2026, ako IG) ─────────────────────
   Pás cez celé okno (jemná horná čiara), pole v stĺpci. Safe-area sa PRIPOČÍTAVA k medzere;
   keď je hore klávesnica (.is-kb), sedí pás tesne nad ňou a safe-area odpadá (tá je pod klávesnicou). */
.msg-thread-dock{flex-shrink:0;border-top:1px solid var(--msg-sep);background:var(--msg-page);padding:8px 0 calc(env(safe-area-inset-bottom,0px) + 8px);position:relative;z-index:2;}
.msg-thread.is-kb .msg-thread-dock{padding-bottom:8px;}
.msg-thread-send{display:flex;gap:8px;align-items:center;${PACK_COL_FIT}margin:0 auto;box-sizing:border-box;}
/* Písacie pole je plochá výplň bez gradientu; zaostrenie nesie farbu „mojej"
   strany, teda to isté, čo bublina a tlačidlo. */
.msg-thread-input{flex:1;background:var(--msg-field);border:1px solid var(--msg-btn-edge);border-radius:999px;padding:12px 16px;color:var(--msg-field-ink);font-family:${FONT_UI};font-size:16px;outline:0;}
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
/* Pridanie sa do svorky stojí na TOM ISTOM mieste ako písacie pole, takže nesie ten istý
   tvar — inak by sa spodok obrazovky menil podľa toho, či som členom. */
.msg-thread-join{${PACK_COL_FIT}margin:0 auto;box-sizing:border-box;}
/* Geometria z .btn-gold (radius 8, NIE pilulka) — zmena farby nie je povolenie na iný tvar. */
.msg-joinbtn{width:100%;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:var(--msg-mine);color:var(--msg-mine-ink);border:1px solid var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);cursor:pointer;}
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
/* Obe ovládania hlavičky v jednom bloku pri pravom okraji (Matej 15. 9. 2026). */
.msg-thread-acts{margin-left:auto;flex-shrink:0;display:flex;align-items:center;gap:8px;}
.msg-mod{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-dim);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-mod:hover{border-color:${T.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}
/* ── PANEL AINUBISA: MOBIL DOLE, PC V STREDE (Matej 15. 9. 2026) ─────────────────────
   „ten blok dajme do stredu na PC a na spodný okraj na mobile."
   Dovtedy bol align-items:flex-end bez rozlíšenia, takže aj na 1900 px monitore visel
   panel na spodnej hrane okna — na mobile je to správny tvar (palec ho dosiahne),
   na PC je to odrezaný pás pri hrane. Rozhoduje CSS, render je jeden. */
${AINUBIS_SHEET_CSS}
.msg-blocked{flex-shrink:0;${PACK_COL_FIT}margin:0 auto;padding:16px 0 calc(env(safe-area-inset-bottom,0px) + 16px);border-top:1px solid var(--msg-bar-edge);background:var(--msg-bar);box-sizing:border-box;text-align:center;position:relative;z-index:2;}
.msg-blockedtxt{font-family:${FONT_UI};font-size:12px;line-height:1.6;color:var(--msg-dim);}
.msg-unblock{margin-top:10px;font-family:${FONT_UI};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:8px 16px;border-radius:8px;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-btn-ink);cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.msg-unblock:hover{border-color:${T.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}

/* Šírka stĺpca = domov /pack (PACK_COL, 21. 9. 2026) — od 640 px padding 24, nie 16. */
${packColCSS('.msg-thread-headinner,.msg-thread-body,.msg-thread-send,.msg-thread-join,.msg-senderr,.msg-blocked')}
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
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  // KLÁVESNICA (appka-ram.md): prekryv je position:fixed, takže ho mobilná klávesnica prekryje spolu
  // s písacím poľom. visualViewport povie, koľko okna klávesnica zožrala; prekryv o to skrátime
  // (bottom), takže pás zostane tesne nad ňou. Bez klávesnice je 0 a rozhoduje čisté CSS.
  const [kb, setKb] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const upd = () => {
      const h = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      setKb(h > 80 ? h : 0);
    };
    upd();
    vv.addEventListener('resize', upd);
    vv.addEventListener('scroll', upd);
    return () => { vv.removeEventListener('resize', upd); vv.removeEventListener('scroll', upd); };
  }, []);
  const rootStyle: React.CSSProperties | undefined = kb ? { bottom: kb } : undefined;

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
      <div className={`msg-thread msg-skin${kb ? ' is-kb' : ''}`} style={rootStyle}>
        <style>{MSG_SKIN_CSS}</style>
        <style>{THREAD_CSS}</style>
        <div className="msg-thread-head">
         <div className="msg-thread-headinner">
          <BackButton tone="pale" onClick={onClose} label={t('pack.msg.backAriaLabel')} />
          <div className="msg-thread-headtxt"><div className="msg-thread-title">{t('pack.msg.loading')}</div></div>
         </div>
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
      // Bez `onOpenTrip` (vlákno otvorené mimo /pack/map) to do 21. 9. 2026 len logovalo —
      // mŕtve tlačidlo z nákresu launchu. Route `/pack/map/:slug` matchuje podľa slugu,
      // krajinu netreba. Vlákno sa zavrie, inak by článok ostal pod ním.
      else { onClose(); navigate(`/pack/map/${conv.tag.id}`); }
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
      // Meranie až PO úspešnom zápise: odmietnutá správa (blok, offline) sa vracia do inputu,
      // takže „odoslaná" by tu inak znamenalo „pokúsil sa".
      trackPack('pack_message_sent');
    } catch (e) {
      // DM ide od 2026-08-03 do DB a zápis môže byť odmietnutý (blok, offline,
      // vypadnutá session). Text vraciame do inputu — správa, ktorá neodišla,
      // sa nesmie stratiť ani tváriť ako odoslaná.
      setText(trimmed);
      // Zrušená zhoda SNIFFERu zavrie vlákno (`closed_at`, RLS odmietne zápis) —
      // „skontroluj pripojenie" by tu klamalo (audit 26. 9. 2026).
      const closed = conv?.tag?.label === 'SNIFFER' && /row-level security/i.test(e instanceof Error ? e.message : '');
      setSendErr(t(closed ? 'pack.msg.matchClosed' : 'pack.msg.sendFailed'));
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
    <div className={`msg-thread msg-skin${kb ? ' is-kb' : ''}`} style={rootStyle}>
      <style>{MSG_SKIN_CSS}</style>
      <style>{THREAD_CSS}</style>
      {/* ⚠️ HLAVIČKA MÁ VNÚTORNÝ STĹPEC (Matej 15. 9. 2026): „chcem aby dolná šírka obsahu —
          panel kde sa píše — bola totožná aj hore v headri = meno / prepínač / nahlásenie
          musia byť viac v strede nie na kraji." Pás pozadia ide ďalej cez celé okno (inak by
          pod ním presvitala tapeta a hlavička by prestala byť hlavičkou); v stĺpci je len
          OBSAH, a jeho šírka je tá istá, akú má telo správ aj písací panel. */}
      <div className="msg-thread-head">
       <div className="msg-thread-headinner">
        {/* ⚠️ TÓN SA RIADI ŠATOM (Matej 15. 9. 2026: „nevidím šípku do zadu"). Natvrdo tu
            stál `dark`, teda takmer biela ikonka v priesvitnom kruhu — na papyrusovej
            hlavičke neviditeľná. Povrch má dva šaty, takže návrat ich musí mať tiež. */}
        <BackButton tone="pale" onClick={onClose} label={t('pack.msg.backToInboxAriaLabel')} />
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
        {/* ⚠️ PREPÍNAČ ŠATU PATRÍ VPRAVO HORE, NIE DO STREDU (Matej 15. 9. 2026:
            „prepínač farbnosti daj na pravú stranu hore nie do stredu"). Dovtedy mal
            vlastný obal s marginLeft:auto a ⋯ za ním svoje — medzi nimi ostala diera
            a slniečko skončilo opticky v strede lišty. Obe ovládania sú odteraz v JEDNOM
            bloku úplne vpravo; poradie je slniečko → ⋯, aby sa ⋯ držalo rohu. */}
        <div className="msg-thread-acts">
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
       </div>
      </div>

      <div className="msg-thread-body">
        {conv.messages.length === 0 && <div className="msg-empty">{t('pack.msg.emptyThread')}</div>}
        {conv.messages.map((m) => {
          const mine = m.senderId === me.id;
          const sender = conv.members.find((p) => p.id === m.senderId);
          // Od 15. 9. 2026 má fotku aj MOJA strana (`getMe()` si ju doťahuje z `dogs`,
          // rovnaký údaj ako `other_photo` u protistrany). Pri mojej správe preto
          // rozhoduje `me` — v `conv.members` môžem figurovať bez fotky a ten záznam
          // by ju prebil. Iniciála ostáva ako záloha, kým sa fotka nenačíta.
          const who = mine ? (sender ?? me) : sender;
          const avatar = mine ? (me.avatarUrl ?? sender?.avatarUrl) : who?.avatarUrl;
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
                  style={avatar ? { backgroundImage: `url('${sizedUrl(avatar, 160)}')` } : undefined}
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
        <div className="msg-thread-dock"><div className="msg-thread-send">
          {/* Písanie v mene svorky = právo `social` (§5). Gate je na OBOCH prvkoch:
              pole nesie `readOnly` (klávesnicu `pointer-events` nezastaví), tlačidlo
              vysvetlenie. */}
          <RightGate right="social">
          <input
            className="msg-thread-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void send(); } }}
            placeholder={t('pack.msg.messageInputPlaceholder')}
          />
          </RightGate>
          <RightGate right="social">
          <button type="button" className="msg-sendbtn" onClick={() => void send()} disabled={!text.trim()} aria-label={t('pack.msg.sendMessageAriaLabel')}>
            <BrandIcon name="feather" size={17} tint="white" />
          </button>
          </RightGate>
        </div></div>
      ) : (
        <div className="msg-thread-dock"><div className="msg-thread-join">
          <button type="button" className="msg-joinbtn" onClick={() => void handleJoin()}>
            {conv.tag?.kind === 'trip' ? t('pack.msg.joinTripPack') : t('pack.msg.joinPack')}
          </button>
        </div></div>
      )}

      {modView && (
        <div className="msg-modsheet" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeMod(); }}>
          <div className="msg-modpanel">
            {/* Kto to rieši. Bez hlavy je to len tmavý panel bez majiteľa. */}
            {/* Kto to rieši — hlava + meno z ainubisSheet.tsx (jeden zdroj). */}
            <AinubisWho />
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
