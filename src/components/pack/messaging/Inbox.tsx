// Inbox overlay — zoznam konverzácií (DM + open groups). Design:
// plany/zadanie-profil-messaging-2026-07-23.md §4.3/§12.
//
// ── DRAK → BRIGHT, krok 2 (2026-09-02) ─────────────────────────────────────
// Do 1. 9. 2026 to bola tmavá glass plocha (`T.pageBg` + `onDark*` inkoust). Prezlečené
// do papyrusu podľa zadania `plany/zadanie-drak-bright-pokracovanie-FRESH-SESSION.md`,
// predloha šatu = `/pack/map` a `PackTriplist.tsx` z tej istej vlny.
//
// ⚠️ DVA ŠATY, JEDNA SADA PRAVIDIEL (2026-09-01). Matej: „správy daj možnosť aj prepnúť
//    do tmavej." Farby sú CSS premenné z `messaging/msgTheme.ts`; tento súbor nevie, ktorý
//    šat beží. Kto sem napíše konkrétnu farbu, napíše ju len pre jeden z nich — a v druhom
//    z toho bude nečitateľné miesto, nie chyba, ktorú niečo nahlási.
// ⚠️ PODKLAD SA TU NEPÍŠE — nesie ho trieda `.msg-skin` (papyrusová alebo čierna tapeta).
//    `<HieroglyphBg />` sa k nej NEVOLÁ: boli by dve tapety cez seba a navyše žije
//    v `PackLayout.tsx`, ktorý si Inbox lazy importuje — teda kruh.
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
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { MSG_SKIN_CSS, useMsgSkin } from './msgTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { getMe, listConversations, subscribe, type Conversation } from './packMessaging';
import { tripNames, tripNameSync } from './tripLabel';

const T = PACK_THEME;

// Brand lock: meno psa je VŽDY Cinzel Decorative, na každom povrchu.
// Meno človeka (keď účet psa nemá) ostáva Cinzel — Decorative je vyhradený psom.
const DOG_NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";
const HUMAN_NAME_FONT = "'Cinzel', serif";

export const INBOX_CSS = `
/* ⚠️ FARBY SÚ PREMENNÉ, NIE TOKENY. Definuje ich MSG_SKIN_CSS v msgTheme.ts a nesie ich
   trieda .msg-skin (+ .msg-skin--dark). Kto sem napíše konkrétnu farbu, napíše ju len pre
   jeden zo šatov a v druhom sa to prejaví ako nečitateľné miesto, nie ako chyba.

   ⚠️ .msg-inbox NESIE AJ .msg-skin, a tá má position:relative — prekryv ju musí prebiť.
   Preto je selektor DVOJTRIEDNY (0,2,0): prebije ju bez ohľadu na to, v akom poradí sa oba
   <style> bloky dostanú do dokumentu. Spoliehať sa tu na poradie by znamenalo, že prvý, kto
   tie dva tagy prehodí, pošle inbox do toku stránky.
   Pozadie ani tapetu tu nehľadaj — nesie ich .msg-skin. Dve nepriehľadné plochy nad sebou
   by tapetu prekryli (tá istá chyba padla na blogu 1. 9.). */
.msg-inbox.msg-skin{position:fixed;inset:0;z-index:1300;overflow-y:auto;display:flex;flex-direction:column;min-height:100dvh;}
/* Lepiaca hlavička MUSÍ byť nepriehľadná (riadky pod ňou podchádzajú), a tým pádom sa nesmie
   tváriť, že je to holá stránka: doska by na tapete vytvorila obdĺžnik iného odtieňa.
   Číta sa preto ako LIŠTA — vlastný povrch a zlatá spodná hrana. */
.msg-inbox-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 22px) 20px 16px;background:var(--msg-bar);border-bottom:1px solid var(--msg-bar-edge);box-shadow:var(--msg-bar-shadow);flex-shrink:0;}
.msg-inbox-title{font-family:${FONT_TITLE};font-weight:700;font-size:20px;color:var(--msg-title);}
.msg-inbox-acts{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.msg-x{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-btn-ink);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-x:hover{border-color:${T.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}
/* ⚠️ Doska sa MUSÍ držať obsahu, preto tu NIE JE flex:1 1 auto — s ním by sa pri troch
   vláknach roztiahla na celú výšku okna a bola z nej prázdna platňa.
   ⚠️ Rám berie 6 px z každej strany, tak vodorovný padding klesol o toľko isto (16 -> 10).
      Odstup od spodného navu je MARGIN, nie padding — inak by tých 100 px bolo vnútri dosky.
   ⚠️ Vzduch od okrajov okna nesie width:calc(100% - 32px), nie 100% (precedens .pta-shell). */
.msg-inbox-list{max-width:640px;width:calc(100% - 32px);margin:14px auto 100px;padding:14px 10px 16px;box-sizing:border-box;flex:0 0 auto;position:relative;z-index:2;}
/* ⚠️ Riadok je <div role="button">, NIE <button> — vnútri je vlastné tlačidlo (štítok výletu)
   a <button> v <button> je nevalidný HTML, ktorý prehliadač ticho rozbije. Preto tu musí
   ostať aj :focus-visible, klávesnica sa inak stratí.

   🔑 RIADOK JE SVETLÝ BLOK, NIE priesvitná dlaždica (Matej 1. 9. 2026: „jednotlivé bloky viac
   zvýraznené, sú teraz takmer neviditeľné"). Prvé kolo držalo úroveň 3 matrice doslova
   (tileBg = zlatá pri 6 %) a na pieskovcovej doske to bola zlatá na zlatej. Úroveň 3 je
   definovaná proti SVETLEJ karte; na doske jej podklad chýba. Riadok musí byť SVETLEJŠÍ než
   jeho kontajner, nie tmavší — a v tmavom šate to platí dvojnásobne (bledá plôška na čiernom). */
.msg-row{display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:var(--msg-block);color:var(--msg-block-ink);border:1px solid var(--msg-block-edge);border-radius:12px;padding:13px 15px;margin-bottom:10px;cursor:pointer;box-shadow:var(--msg-block-shadow);transition:border-color .15s,transform .15s,box-shadow .15s;font-family:inherit;}
.msg-row:last-child{margin-bottom:0;}
.msg-row:hover{transform:translateY(-1px);box-shadow:var(--msg-block-hover);}
.msg-row:focus-visible{outline:none;box-shadow:var(--msg-block-hover);}
/* Avatar bez fotky = zlatá PLOCHA, teda brandová rampa okolo #C99A3F — NIE gradient .btn-gold
   (#F5C73D->#E69E1A). Ten je locknutý pre TLAČIDLO, kde je malý a lesklý, takže sa číta ako
   svetlo; tá istá zmes na súvislej ploche je žltá a Matej si ju spája s AINUBISOM (lock 28. 8.).
   Rampa drží v oboch šatoch — je to identita psa, nie povrch stránky. */
.msg-avatar{flex-shrink:0;width:42px;height:42px;border-radius:50%;background:linear-gradient(140deg,#C99A3F,#A3782B);background-size:cover;background-position:center;border:1px solid rgba(179,130,45,0.55);box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-weight:600;font-size:16px;color:#FBF5E6;}
.msg-row-mid{flex:1;min-width:0;}
.msg-row-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;}
.msg-row-name{font-weight:700;font-size:13.5px;color:var(--msg-block-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* ⚠️ Riadok má v tmavom šate BLEDÝ podklad, takže jeho druhotné texty NEMÔŽU brať --msg-dim
   (ten je počítaný pre tmavé pozadie stránky). Tlmenie sa robí krytím TEJ ISTEJ farby
   inkoustu riadku — inak by v tmavom šate zmizli. */
.msg-row-pack{font-family:${FONT_UI};font-weight:400;font-size:11px;color:var(--msg-block-ink);opacity:.66;}
.msg-row-time{flex-shrink:0;font-size:10px;color:var(--msg-block-ink);opacity:.52;}
.msg-row-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:3px;}
.msg-row-preview{font-size:12px;color:var(--msg-block-ink);opacity:.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* Neprečítané = zlatá bodka s prstencom farby PODKLADU (ako odznak počtu správ
   v PackNotifications). Bez prstenca by na zlatkasto tónovanom riadku splynula.
   Nie je to lapis: lapis znamená „moja voľba / moja akcia", a neprečítaná správa
   nie je ani jedno — je to stav. */
.msg-dot{flex-shrink:0;width:9px;height:9px;border-radius:50%;background:${T.accentGold};box-shadow:0 0 0 2px #FBF5E6;}
.msg-tagchip{display:inline-flex;align-items:center;gap:4px;margin-top:7px;font-family:${FONT_TITLE};font-weight:700;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:rgba(201,154,63,0.20);border:1px solid rgba(179,130,45,0.55);color:#8A5F1E;white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-tagchip--click:hover{background:rgba(201,154,63,0.32);border-color:${T.cardEdge};}
.msg-empty{text-align:center;padding:40px 16px;color:var(--msg-dim);font-size:12.5px;font-style:italic;}
/* #55 — prázdny inbox je celá obrazovka s jednou vetou; bez akcie je to slepá ulička. */
.msg-emptybox{display:flex;flex-direction:column;align-items:center;gap:16px;padding:40px 16px;text-align:center;}
.msg-emptybox p{margin:0;color:var(--msg-block-ink);opacity:.72;font-size:12.5px;font-style:italic;line-height:1.5;max-width:320px;}
/* Jediné hlavné CTA na tejto obrazovke → farba MOJEJ bubliny (v svetlom šate lapis,
   v tmavom oranžovozlatá). Geometriu si berie od .btn-gold (radius 8, NIE pilulka) —
   zmena farby nie je povolenie na iný tvar. */
.msg-emptybtn{font-family:${FONT_TITLE};font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:11px 20px;border-radius:8px;border:1px solid var(--msg-mine-edge);background:var(--msg-mine);color:var(--msg-mine-ink);box-shadow:var(--msg-mine-shadow);cursor:pointer;}
.msg-emptybtn:hover{background:var(--msg-mine-hover);}

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

/**
 * Prepínač šatu. Ikonka je BRIGHT BUTTON SIGN z hand-drawn kitu — Matej 1. 9. 2026:
 * „myslel som toto z brandu." Zdroj `vstupy/vizualna-identita/Icons hand drawn/
 * bright-hand-drawn-button-sign-svgrepo-com.svg`, skopírovaný do `public/icons/pack/bright.svg`
 * verbatim (tak, ako sú tam ostatné).
 *
 * JEDNA ikonka pre oba stavy, nie dve. Je to znak JASU (kruh z polovice vyplnený, okolo
 * lúče) — hovorí „tu sa prepína svetlo", nie „práve je deň". Stav nesie tlačidlo: v tmavom
 * šate má značka zlatý odtieň, v svetlom inkoustový (`--msg-glyph`).
 *
 * ⚠️ Predtým tu stáli heroglyfové značky farby srsti (`COLOUR-DARK` = mesiac,
 *    `COLOUR-BRIGHT` = slnko). Fungovali, ale sú to znaky PSA — farba jeho srsti, nie
 *    ovládací prvok rozhrania. Matej ich preto vymenil za ikonku z kitu.
 */
export function SkinToggle({ skin, onToggle }: { skin: 'light' | 'dark'; onToggle: () => void }) {
  // Popisok hovorí, KAM sa prepne, nie kde práve stojím — tlačidlo je akcia, nie stav.
  // (Stav nesie odtieň značky: v tmavom šate zlatý, v svetlom inkoustový.)
  const t = useT();
  const label = skin === 'dark' ? t('pack.msg.skinToLight') : t('pack.msg.skinToDark');
  return (
    <button
      type="button"
      className="msg-skinbtn"
      onClick={onToggle}
      aria-pressed={skin === 'dark'}
      aria-label={label}
      title={label}
    >
      <BrandIcon name="bright" size={17} />
    </button>
  );
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
  const [skin, toggleSkin] = useMsgSkin();
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
    <div className={`msg-inbox msg-skin${skin === 'dark' ? ' msg-skin--dark' : ''}`}>
      {/* Tapetu nesie .msg-skin — <HieroglyphBg /> sa sem NEPRIDÁVA (bola by druhá vrstva). */}
      <style>{MSG_SKIN_CSS}</style>
      <style>{INBOX_CSS}</style>
      <div className="msg-inbox-head">
        <div className="msg-inbox-title">{t('pack.msg.inboxTitle')}</div>
        <div className="msg-inbox-acts">
          <SkinToggle skin={skin} onToggle={toggleSkin} />
          <button type="button" className="msg-x" onClick={onClose} aria-label={t('pack.msg.closeAriaLabel')}>×</button>
        </div>
      </div>
      <div className="msg-inbox-list msg-plate">
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
