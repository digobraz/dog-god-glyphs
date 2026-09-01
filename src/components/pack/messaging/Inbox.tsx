// Inbox overlay — zoznam konverzácií (DM + open groups). Design:
// plany/zadanie-profil-messaging-2026-07-23.md §4.3/§12.
//
// ── DRAK → BRIGHT, krok 2 (2026-09-02) ─────────────────────────────────────
// Do 1. 9. 2026 to bola tmavá glass plocha (`T.pageBg` + `onDark*` inkoust). Prezlečené
// do papyrusu podľa zadania `plany/zadanie-drak-bright-pokracovanie-FRESH-SESSION.md`,
// predloha šatu = `/pack/map` a `PackTriplist.tsx` z tej istej vlny.
//
// ⚠️ PODKLAD SA TU NEPÍŠE — nesie ho `.pk-paper` z `packTheme.ts` (papyrus + heroglyfová
//    tapeta preladená do zlata na piesku). `<HieroglyphBg />` sa k nemu NEVOLÁ, tá je tmavá
//    a boli by dve tapety cez seba. Kto sem píše novú farbu plochy, píše ju na zlé miesto.
//
// ⚠️ KRÍŽIK TU OSTÁVA, a nie je to porušenie locku z 28. 8. („bloky bez krížika"). Ten lock
//    hovorí o PLÁVAJÚCOM paneli, kde je odchod plocha okolo neho. Inbox je celoobrazovkový
//    prekryv — nemá „okolo", takže bez krížika by z neho nebolo kam ísť. (Esc tu zatiaľ
//    nepočúva nikto; nie je to súčasť prezliekania, ale stojí za samostatný beh.)
//
// ⚠️ TEXTY IDÚ CEZ `t()`. Pôvodná hlavička tu tvrdila „web texty = EN" a súbor mal 5 volaní
// `t()` na celý inbox — Slovák tak v slovenskom rozhraní čítal „No messages yet" a dátumy
// „Aug 9" (natvrdo `en-US`). Thread.tsx je preložený od začiatku; Inbox dorovnaný 2026-08-12.
import { useEffect, useState } from 'react';
import { PACK_THEME, PAPER_PAGE_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { PALE, LAPIS, LAPIS_BTN_SHADOW, goldFrameCSS } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { getMe, listConversations, subscribe, type Conversation } from './packMessaging';
import { tripNames, tripNameSync } from './tripLabel';

const T = PACK_THEME;
const P = PALE;

// Brand lock: meno psa je VŽDY Cinzel Decorative, na každom povrchu.
// Meno človeka (keď účet psa nemá) ostáva Cinzel — Decorative je vyhradený psom.
const DOG_NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const HUMAN_NAME_FONT = "'Cinzel', serif";

export const INBOX_CSS = `
/* ⚠️ .msg-inbox NESIE AJ .pk-paper, a tá má position:relative — prekryv ju musí prebiť.
   Preto je selektor DVOJTRIEDNY (0,2,0): prebije .pk-paper bez ohľadu na to, v akom poradí
   sa oba <style> bloky dostanú do dokumentu. Spoliehať sa tu na poradie by znamenalo, že
   prvý, kto tie dva <style> tagy prehodí, pošle inbox do toku stránky.
   Pozadie ani min-height tu NIE SÚ — nesie ich .pk-paper. Dve nepriehľadné plochy nad sebou
   by tapetu prekryli (tá istá chyba padla na blogu 1. 9.). */
.msg-inbox.pk-paper{position:fixed;inset:0;z-index:1300;overflow-y:auto;display:flex;flex-direction:column;}
/* Lepiaca hlavička MUSÍ byť nepriehľadná (riadky pod ňou podchádzajú), a tým pádom sa nesmie
   tváriť, že je to holá stránka: papyrusová doska by na tapete vytvorila obdĺžnik iného
   odtieňa. Číta sa preto ako LIŠTA — panelový gradient a zlatá spodná hrana, čo je na
   papyruse jazyk konštrukcie (rovnako ako .tl-sechead v PackTriplist). */
.msg-inbox-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 22px) 20px 16px;background:${T.panelGrad};border-bottom:1px solid ${P.border};box-shadow:0 2px 10px rgba(122,90,42,0.10);flex-shrink:0;}
/* Nadpis na papyruse ide do TMAVŠEJ zlatej (PALE.deep #8A5F1E). Brandová #C99A3F je na
   svetlom podklade len o kúsok tmavšia než sám papyrus a stráca sa. */
.msg-inbox-title{font-family:${FONT_TITLE};font-weight:700;font-size:20px;color:${P.deep};}
.msg-x{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:${P.soft};border:1px solid ${P.border};color:${P.ink};font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-x:hover{border-color:${T.cardEdge};color:${P.deep};background:#FFFDF6;}
/* ZOZNAM STOJÍ NA ZLATO-RÁMOVANEJ DOSKE, nie priamo na tapete.
   Riadok je úroveň 3, a tá je zámerne PRIESVITNÁ (tileBg = zlatá pri 6 %) — je stavaná
   na to, že leží v karte. Položený rovno na .pk-paper cez ňu presvitala heroglyfová
   kresba a text stál na kresbe, nie na papieri (odmerané na zábere 500 px pred opravou).
   Recept NEVYMÝŠĽAM: goldFrameCSS() BEZ parametrov, ten istý blok ako .tl-panel
   v PackTriplist, ľavý panel mapy aj dok — tvar berie z BLOCK (radius 14 / lem 6).
   ⚠️ Doska sa MUSÍ držať obsahu, preto tu NIE JE flex:1 1 auto — s ním by sa pri troch
      vláknach roztiahla na celú výšku okna a bola z nej prázdna platňa.
   ⚠️ Rám berie 6 px z každej strany, tak vodorovný padding klesol o toľko isto (16 -> 10),
      nech riadky stoja tam, kde stáli. Odstup od spodného navu je MARGIN, nie padding —
      inak by tých 100 px bolo vnútri dosky. */
.msg-inbox-list{max-width:640px;width:calc(100% - 32px);margin:14px auto 100px;padding:14px 10px 16px;box-sizing:border-box;flex:0 0 auto;position:relative;z-index:2;${goldFrameCSS()}}
/* ⚠️ Riadok je <div role="button">, NIE <button> — vnútri je vlastné tlačidlo
   (štítok výletu) a <button> v <button> je nevalidný HTML, ktorý prehliadač
   ticho rozbije. Preto tu musí ostať aj :focus-visible, klávesnica sa inak stratí.

   🔴 RIADOK JE SVETLÝ PAPYRUS, NIE tileBg (Matej 1. 9. 2026: „jednotlivé bloky viac
   zvýraznené, sú teraz takmer neviditeľné").
   Prvé kolo držalo úroveň 3 matrice doslova (tileBg · 1px border · r10) a bolo to zle:
   tileBg je ZLATÁ PRI 6 %, a odkedy riadky stoja na pieskovcovej doske, je to zlatá
   na zlatej — kontrast takmer nula. Úroveň 3 je definovaná proti cardGrad, teda proti
   SVETLEJ karte; na zlatej doske jej podklad chýba.
   Riadok preto berie výplň úrovne 2 (panelGrad) a PLNÝ zlatý rám — svetlý blok na
   tmavšej doske. Je to ten istý záver, ku ktorému Matej dotlačil bledý blok už trikrát
   („je to suche bez šťavy" · „je to také plané" · „majú slabé okraje"), len o poschodie
   nižšie. Radius ostáva bližšie k riadku (12, nie 16), nech to v zozname nie sú karty. */
.msg-row{display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:${T.panelGrad};border:1px solid ${T.cardEdge};border-radius:12px;padding:13px 15px;margin-bottom:10px;cursor:pointer;box-shadow:0 2px 6px rgba(122,90,42,0.16),inset 0 1px 0 rgba(255,255,255,0.45);transition:border-color .15s,transform .15s,box-shadow .15s;font-family:inherit;}
.msg-row:last-child{margin-bottom:0;}
.msg-row:hover{transform:translateY(-1px);box-shadow:0 0 0 3px rgba(201,154,63,0.28),0 3px 9px rgba(122,90,42,0.20);}
.msg-row:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(201,154,63,0.45),0 3px 9px rgba(122,90,42,0.20);}
/* Avatar bez fotky = zlatá PLOCHA, teda brandová rampa okolo #C99A3F — NIE gradient
   .btn-gold (#F5C73D→#E69E1A). Ten je locknutý pre TLAČIDLO, kde je malý a lesklý, takže sa
   číta ako svetlo; tá istá zmes na súvislej ploche je žltá a Matej si ju spája s AINUBISOM
   (lock 28. 8. 2026). Iniciála je preto svetlá, nie tmavá. */
.msg-avatar{flex-shrink:0;width:42px;height:42px;border-radius:50%;background:linear-gradient(140deg,#C99A3F,#A3782B);background-size:cover;background-position:center;border:1px solid ${P.border};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:16px;color:#FBF5E6;}
.msg-row-mid{flex:1;min-width:0;}
.msg-row-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;}
.msg-row-name{font-weight:700;font-size:13.5px;color:${P.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-row-pack{font-family:${FONT_UI};font-weight:400;font-size:11px;color:${P.dim};}
.msg-row-time{flex-shrink:0;font-size:10px;color:${P.faint};}
.msg-row-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:3px;}
.msg-row-preview{font-size:12px;color:${P.dim};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* Neprečítané = zlatá bodka s prstencom farby PODKLADU, presne ako odznak počtu správ
   v PackNotifications (T.accentGold + badgeBorder). Bez prstenca by zlatá bodka na
   zlatkasto tónovanom riadku splynula. Nie je to lapis: lapis znamená „moja voľba / moja
   akcia", a neprečítaná správa nie je ani jedno — je to stav. */
.msg-dot{flex-shrink:0;width:9px;height:9px;border-radius:50%;background:${T.accentGold};box-shadow:0 0 0 2px #FBF5E6;}
.msg-tagchip{display:inline-flex;align-items:center;gap:4px;margin-top:7px;font-family:${FONT_TITLE};font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:${P.hot};border:1px solid ${P.border};color:${P.deep};white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-tagchip--click:hover{background:rgba(201,154,63,0.32);border-color:${T.cardEdge};}
.msg-empty{text-align:center;padding:40px 16px;color:${P.dim};font-size:12.5px;font-style:italic;}
/* #55 — prázdny inbox je celá obrazovka s jednou vetou; bez akcie je to slepá ulička. */
.msg-emptybox{display:flex;flex-direction:column;align-items:center;gap:16px;padding:40px 16px;text-align:center;}
.msg-emptybox p{margin:0;color:${P.dim};font-size:12.5px;font-style:italic;line-height:1.5;max-width:320px;}
/* Jediné hlavné CTA na tejto obrazovke → LAPIS s plnou výplňou (brandový kánon 28. 8.).
   Geometriu si berie od .btn-gold (radius 8, NIE pilulka) — zmena farby nie je povolenie
   na iný tvar. Zlaté písmo na modrom nie je ozdoba: lapis + zlato je pôvodná egyptská dvojica. */
.msg-emptybtn{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:11px 20px;border-radius:8px;border:1px solid ${LAPIS.deep};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;}
.msg-emptybtn:hover{background:${LAPIS.gradHover};}
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
    <div className="msg-inbox pk-paper">
      {/* Tapeta je súčasť .pk-paper — <HieroglyphBg /> sa sem NEPRIDÁVA (je tmavá). */}
      <style>{PAPER_PAGE_CSS}</style>
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
