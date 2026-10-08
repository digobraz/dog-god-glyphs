// ════════════════════════════════════════════════════════════════════════════
// ZVITOK — karta v zozname + článok zvitku (3. 10. 2026, LEN DEV)
// ────────────────────────────────────────────────────────────────────────────
// Nákres: plany/nakres-zvitok-detail-2026-10-03-v2.html. Matej: „pozične aj obsahovo
// ok, dizajn doladíme na mieste".
//
// KARTA: krúžok stavu v rohu (biely obrys → plný oranžový → zelený ✓, vysvetlenie
// pri prejdení myšou) · obraz 3:4 a POD NÍM trojica akcií so slovami · meta, nadpis
// so známkou dôkazu A/B/C, „Vezmi si z toho" v bloku bez nadpisu, CTA PREČÍTAŤ ZNALOSŤ, podcast a zdroje.
// Veta pod nadpisom (`v`) a „Súvisí" sú len v článku — karta mala priveľa textu.
//
// ČLÁNOK = kôš 2 „POZERÁM SA" (lock architektura-pack §3), modal-as-route ako
// článok výletu (`StoryView`): vlastná adresa `/pack/ainubis/zvitok/:id`, šípka späť
// vľavo hore (krížik v /pack neexistuje, 27. 9.), lišta ostáva — vrstva stojí POD
// spodným navom (z 39 < 40).
//
// AKCIE (lock §4.2 má štvoricu): na zvitku sú len TRI — páči sa · uložiť (do Mojich znalostí,
// police Uložené) · zdieľať. ➕ POUŽIŤ Matej 3. 10. vyradil (*„budú len páči sa, uložiť a
// poslať/zdieľať“*) — pri vedomosti nemá plán, kam ísť. Otázka AINUBISOVI žije v bloku PRISPEJ.
// Akcia nikdy neodnesie preč.
//
// HOTOVO = prečítal (tlačidlo na konci) ALEBO dopočúval podcast (≥ 90 %).
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI, STAGE_CSS, PACK_COL_FIT, packColCSS } from '@/components/pack/packTheme';
import { AINUBIS, AI_GLASS, BRAIN_STATE, aiWorld } from '@/components/pack/ainubisSkin';
import { HandStar, HandPlus, HandForward, HandCheck, HandPencil, HandAlert, HandCamera, HandArrowLeft, HandHeart, HandTrash } from '@/components/pack/HandIcons';

/** Kresba z kitu `/icons/pack/` cez masku (ten istý zápis ako v PackAinubis). */
const Ic = ({ ic }: { ic: string }) => (
  <i className="zv-ic" aria-hidden style={{ WebkitMaskImage: `url(/icons/pack/${ic}.svg)`, maskImage: `url(/icons/pack/${ic}.svg)` }} />
);
import { BackButton } from '@/components/pack/BackButton';
import {
  type DemoScroll, pickText, pickPod, sourceHref, fmtSec, scrollLang,
  markScroll, useScrollState, toggleSaved, useSaved, useTalk, useTalkCount, addTalk, deleteTalk, toggleLiked, useLiked,
  toggleTalkLike, addProposal, shrinkPhoto, type ProposalKind, podLang, requestLang, useCounts, saveListen, useReads, logEvent,
} from './vaultScrolls';
import { VAULT_CIRCLES } from './circles';

/** Meno okruhu v jazyku člena — z `circles.ts` (zdroj mien), DB nesie len SK. CS zatiaľ padá na SK. */
export const circleName = (z: DemoScroll, lang: string) => {
  const c = VAULT_CIRCLES[z.world]?.[z.okruh - 1];
  return c ? (lang === 'sk' || lang === 'cs' ? c.sk : c.en) : z.circle;
};

// ── texty rozhrania: základ EN/SK/CZ ako obsah VAULTU ───────────────────────
const UI = {
  sk: {
    scroll: 'Zvitok', min: 'min', read: 'Prečítať znalosť', listen: 'Vypočuť podcast', pod: 'Podcast', src: 'Zdroje',
    sd: 'Dôkaz', sdName: ['', 'C · tradícia, skúsenosť, legenda', 'B · veda + výklad, alebo zatiaľ málo štúdií', 'A · zmerané, vedci sa zhodujú'],
    like: 'Páči sa', del: 'Zmazať', delAsk: 'Zmazať komentár?', delNo: 'Nechať', save: 'Uložiť', share: 'Zdieľať', talk: 'Diskusia', readDone: 'Prečítané',
    talkNone: 'Zatiaľ tu nikto nenapísal. Začni ty — otázka, skúsenosť, nesúhlas.', talkPh: 'Napíš do diskusie…', talkSend: 'Pridať', you: 'Ty',
    back: 'Späť', added: 'Doplnené',
    addedNone: 'Zatiaľ nič nové. Keď pribudne poznatok, ktorý nie je v podcaste, zapíše sa sem s dátumom.',
    rel: 'Súvisí', contrib: 'Prispej', cEdit: 'Navrhnúť zmenu', kinds: ['Pridať novú znalosť k téme', 'Nahlásiť chybné tvrdenie', 'Vlastný text'],
    propPh: 'Napíš, čo chýba alebo čo nesedí. Ak máš zdroj, pridaj odkaz.', propSend: 'Odoslať AINUBISOVI', propOk: 'Odoslané — AINUBIS to posúdi a overí zdroj.', photo: 'Fotka',
    done: 'Prečítané — zapíš do mozgu', doneSub: 'krúžok zozelenie a zrno v mozgu sa rozsvieti',
    doneOk: 'Zapísané do mozgu', copied: 'Odkaz skopírovaný',
    tr: 'Prepis', trHide: 'Skryť prepis', other: 'Iný jazyk', reqTitle: 'Podcast v tvojom jazyku',
    reqText: 'Základ je SK · EN · CZ. Iný jazyk vznikne, keď oň požiada prvý člen — potom ostane pre všetkých.',
    reqBtn: 'Požiadať', reqOk: 'Žiadosť zapísaná. Keď podcast vznikne, dáme ti vedieť.',
  },
  cs: {
    scroll: 'Svitek', min: 'min', read: 'Přečíst znalost', listen: 'Poslechnout podcast', pod: 'Podcast', src: 'Zdroje',
    sd: 'Důkaz', sdName: ['', 'C · tradice, zkušenost, legenda', 'B · věda + výklad, nebo zatím málo studií', 'A · změřeno, vědci se shodují'],
    like: 'Líbí se', del: 'Smazat', delAsk: 'Smazat komentář?', delNo: 'Nechat', save: 'Uložit', share: 'Sdílet', talk: 'Diskuse', readDone: 'Přečteno',
    talkNone: 'Zatím tu nikdo nenapsal. Začni ty — otázka, zkušenost, nesouhlas.', talkPh: 'Napiš do diskuse…', talkSend: 'Přidat', you: 'Ty',
    back: 'Zpět', added: 'Doplněno',
    addedNone: 'Zatím nic nového. Když přibude poznatek, který není v podcastu, zapíše se sem s datem.',
    rel: 'Souvisí', contrib: 'Přispěj', cEdit: 'Navrhnout změnu', kinds: ['Přidat novou znalost k tématu', 'Nahlásit chybné tvrzení', 'Vlastní text'],
    propPh: 'Napiš, co chybí nebo co nesedí. Pokud máš zdroj, přidej odkaz.', propSend: 'Odeslat AINUBISOVI', propOk: 'Odesláno — AINUBIS to posoudí a ověří zdroj.', photo: 'Fotka',
    done: 'Přečteno — zapiš do mozku', doneSub: 'kroužek zezelená a zrno v mozku se rozsvítí',
    doneOk: 'Zapsáno do mozku', copied: 'Odkaz zkopírován',
    tr: 'Přepis', trHide: 'Skrýt přepis', other: 'Jiný jazyk', reqTitle: 'Podcast ve tvém jazyce',
    reqText: 'Základ je SK · EN · CZ. Jiný jazyk vznikne, když o něj požádá první člen — pak zůstane pro všechny.',
    reqBtn: 'Požádat', reqOk: 'Žádost zapsána. Až podcast vznikne, dáme ti vědět.',
  },
  en: {
    scroll: 'Scroll', min: 'min', read: 'Read the knowledge', listen: 'Listen to the podcast', pod: 'Podcast', src: 'Sources',
    sd: 'Evidence', sdName: ['', 'C · tradition, experience, legend', 'B · science + interpretation, or few studies yet', 'A · measured, scientists agree'],
    like: 'Like', del: 'Delete', delAsk: 'Delete comment?', delNo: 'Keep', save: 'Save', share: 'Share', talk: 'Discussion', readDone: 'Read',
    talkNone: 'Nobody has written here yet. Start — a question, an experience, a disagreement.', talkPh: 'Write to the discussion…', talkSend: 'Post', you: 'You',
    back: 'Back', added: 'Added',
    addedNone: 'Nothing new yet. When a finding that is not in the podcast arrives, it is written here with a date.',
    rel: 'Related', contrib: 'Contribute', cEdit: 'Suggest a change', kinds: ['Add new knowledge to the topic', 'Report a wrong claim', 'Own text'],
    propPh: 'Write what is missing or wrong. If you have a source, add the link.', propSend: 'Send to AINUBIS', propOk: 'Sent — AINUBIS will review it and check the source.', photo: 'Photo',
    done: 'Read — write it into the brain', doneSub: 'the ring turns green and the grain lights up',
    doneOk: 'Written into the brain', copied: 'Link copied',
    tr: 'Transcript', trHide: 'Hide transcript', other: 'Other language', reqTitle: 'Podcast in your language',
    reqText: 'The base is SK · EN · CZ. Another language is made when the first member asks for it — then it stays for everyone.',
    reqBtn: 'Request', reqOk: 'Request saved. We will let you know when the podcast is ready.',
  },
};
export const scrollUI = (lang: string) => UI[scrollLang(lang) as keyof typeof UI];

/** Známka dôkazu ako v medicíne (úroveň dôkazov A/B/C), Matej 3. 10.: „možno ABC? stupnica?“ — sd 3/2/1 → A/B/C. */
const GRADE = ['', 'C', 'B', 'A'];
/** Ružová diskusie — NOVÁ farba mimo palety AINUBISA (Matej 3. 10.), kým ju nepotvrdí. */
const ZV_PINK = '#FF8AC8';

export const SCROLL_CSS = `
${STAGE_CSS}
:root{--zv-read:rgb(${BRAIN_STATE.read});}
/* KRÚŽOK STAVU — biely obrys · plný oranžový (videné) · zelený s ✓ (hotovo). Farby BRAIN_STATE. */
.zv-tip{position:absolute;z-index:5;width:240px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  background:${AINUBIS.surfaceBase};border:1px solid ${AINUBIS.edge};color:${AINUBIS.ink};text-align:left;
  font:400 ${PACK_TEXT.label}px/1.5 ${FONT_UI};letter-spacing:0;text-transform:none;pointer-events:none;
  opacity:0;transition:opacity 150ms ease;}
/* AKCIE — pod obrazom na PC aj mobile (Matej 3. 10.) */
.zv-acts{display:flex;align-items:center;justify-content:space-around;margin-top:${PACK_SPACE.sm}px;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;background:${AINUBIS.surface};border:1px solid ${AINUBIS.edge};}
/* AKCIE = JEDNA PILULKA cez celú šírku obrazu, ikonky ako na IG (Matej 3. 10.: „do jedného pilu… roztiahnuť po celej
   šírke obrázka… nefarbiť krúžky, iba ikonky"). Bez krúžkov a výplní — farbu nesie len ikonka; zapnutá = farebná. */
.zv-act{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:${PACK_SPACE.xs}px;
  min-width:44px;height:36px;padding:0 ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  background:none;border:0;color:${AINUBIS.ink};font:500 ${PACK_TEXT.label}px ${FONT_UI};transition:color 150ms ease;}
/* FARBY IKONIEK — Matej 3. 10.: „labka cyan neónová žiariaca, hviezdička žltá, komenty ružová, zdieľanie zelená“.
   ⚠️ RUŽOVÁ nie je v palete AINUBISA (nová, ZV_PINK) · ZELENÁ zdieľania je tá istá ako „prečítané“ (BRAIN_STATE.read)
   — flagnuté Matejovi, zatiaľ podľa neho. Zapnutá akcia = ikonka žiari (drop-shadow, nie box-shadow). */
.zv-act{opacity:.9;}
.zv-act:hover{opacity:1;}
.zv-act[data-k="like"]{color:${AINUBIS.cyan};filter:drop-shadow(0 0 2px rgba(${AINUBIS.cyanRGB},0.4));}
.zv-act[data-k="save"]{color:${AINUBIS.ctaA};}
.zv-act[data-k="talk"]{color:${ZV_PINK};}
.zv-act[data-k="share"]{color:var(--zv-read);}
/* Žiara len jemná (Matej 4. 10.: „nerob takú žiaru na ikonkách, packa je celá rozmazaná“). */
.zv-act.is-on{opacity:1;filter:drop-shadow(0 0 3px rgba(${AINUBIS.cyanRGB},0.35));}
.zv-act .zv-ic{margin-right:0;width:20px;height:20px;}
.zv-n{font:500 ${PACK_TEXT.label}px ${FONT_UI};color:${AINUBIS.ink};min-width:1ch;}
/* SILA DÔKAZU */
.zv-sd{position:relative;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex:0 0 auto;
  border-radius:${PACK_R.field}px;font:700 ${PACK_TEXT.lead}px ${FONT_TITLE};cursor:help;
  color:var(--zv-g);border:1px solid var(--zv-g);background:var(--zv-gt);}
.zv-sd[data-g="A"]{--zv-g:rgb(${BRAIN_STATE.read});--zv-gt:rgba(${BRAIN_STATE.read},0.14);}
.zv-sd[data-g="B"]{--zv-g:rgb(${BRAIN_STATE.seen});--zv-gt:rgba(${BRAIN_STATE.seen},0.14);}
.zv-sd[data-g="C"]{--zv-g:${AINUBIS.inkDim};--zv-gt:${AINUBIS.surface};}
.zv-sd .zv-tip{top:36px;left:0;}
.zv-sd--corner{position:absolute;top:0;right:0;z-index:3;width:44px;height:44px;font-size:${PACK_TEXT.h2}px;
  border-width:0 0 1px 1px;border-radius:0 ${PACK_R.card - 1}px 0 ${PACK_R.tile}px;}
/* Známka je NEPRIEHĽADNÁ (Matej 5. 10.: „nesmie byť priesvitná") — tint leží na plnom podklade. */
.zv-sd{background:linear-gradient(var(--zv-gt),var(--zv-gt)),${AINUBIS.surfaceBase};}
/* Na karte v zozname sedí v textovom bloku: mobil = roh pri nadpise, PC = roh karty. */
.akv-zvt{position:relative;align-self:stretch;}
.akv-zvt > .zv-sd--corner{border-width:1px;border-radius:${PACK_R.field}px;}
.zv-sd--corner .zv-tip{top:52px;left:auto;right:0;}
.zv-sd:hover .zv-tip,.zv-sd:focus-visible .zv-tip{opacity:1;}
.zv-read{align-self:stretch;display:flex;align-items:center;justify-content:center;gap:${PACK_SPACE.sm}px;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.field}px;background:${AINUBIS.surface};
  border:1px solid ${AINUBIS.edgeStrong};color:${AINUBIS.ink};font-family:${FONT_TITLE};font-weight:700;
  font-size:${PACK_TEXT.label}px;letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.zv-read:hover{border-color:${AINUBIS.cyan};}
/* HOTOVO = PLNÁ zelená s tmavým inkoustom (Matej: „treba viac zvýrazniť, teraz je to prehliadnuteľné“). */
.zv-read.is-done{background:var(--zv-read);border-color:var(--zv-read);color:#03140A;outline:3px solid rgba(${BRAIN_STATE.read},0.28);outline-offset:2px;}
.zv-badge{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  background:var(--zv-read);color:#03140A;font:700 ${PACK_TEXT.label}px ${FONT_TITLE};letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  outline:3px solid rgba(${BRAIN_STATE.read},0.28);outline-offset:2px;}
/* ČIARA POD NADPISOM — zlatá niť AINUBISA, ktorá doznie do tmy (Matej: „chýba vizuál… pod nadpisom línia"). */
.zv-rule{display:block;height:2px;width:100%;max-width:160px;border-radius:${PACK_R.pill}px;
  background:linear-gradient(90deg, ${AINUBIS.ctaA} 0%, ${AINUBIS.ctaB} 40%, transparent 100%);}
.zv-mid{align-self:stretch;display:flex;flex-direction:column;align-items:flex-start;gap:${PACK_SPACE.sm}px;}
.zv-mid > *{align-self:stretch;}
.zv-ctas{align-self:stretch;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.zv-ctas .akv-zvsec{flex:none;}
.zv-hl{display:flex;align-items:flex-start;gap:${PACK_SPACE.sm}px;}
.zv-hl > :first-child{flex:1 1 auto;min-width:0;}
/* „Vezmi si z toho" — blok bez nadpisu (Matej: „nechaj to v bloku"), menšie písmo. */
.zv-take{align-self:stretch;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  background:${AINUBIS.ctaTint};border-left:2px solid ${AINUBIS.ctaA};
  font-size:${PACK_TEXT.label}px;line-height:1.5;color:${AINUBIS.ink};font-style:italic;}
/* Kurzíva — Matej 3. 10.: „nech je to trošku zaujímavejšie“. ⚠️ Space Grotesk kurzívu nemá, prehliadač ju šikmí sám. */

/* ── ČLÁNOK ZVITKU (kôš 2) ── */
.zv-veil{position:fixed;inset:0;z-index:39;overflow-y:auto;-webkit-overflow-scrolling:touch;
  background:${AINUBIS.surfaceBase};color:${AINUBIS.ink};font-family:${FONT_UI};}
/* SCI-FI DOSKA (Matej 4. 10.: „pozadie nie len tmavé, ale blok z liquid skla a za tým jemné mriežky ako má AINUBIS,
   nech to vytvorí 3D efekt sci-fi informácií"). Mriežka = tá istá ako .akv-bg v PackAinubis; stojí FIXNE, sklo nad ňou
   scrolluje ⇒ hĺbka. Sklo = SKLENENÁ DOSKA .pk-stage (STAGE_CSS, katalóg) vo farbe AINUBISA cez --pk-stage;
   AI_GLASS nie — má plnú výplň a mriežku by zakryl. */
.zv-bg{position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(rgba(${AINUBIS.cyanRGB},0.10) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${AINUBIS.cyanRGB},0.10) 1px,transparent 1px);
  background-size:24px 24px,24px 24px,192px 192px,192px 192px;}
.zv-bg::after{content:'';position:absolute;inset:0;
  background:radial-gradient(60vw 60vw at 85% 10%,rgba(${AINUBIS.cyanRGB},0.14),transparent 62%),
             radial-gradient(55vw 55vw at 10% 95%,rgba(${AINUBIS.glowRGB},0.12),transparent 62%);}
/* ŠÍRKA = článok výletu (Matej 4. 10.: „detail zvitku by mal byť takej istej šírky ako je trip blog") —
   ten istý stĺpec PACK_COL_FIT + packColCSS ako .pta-shell, nie vlastných 880. */
.zv-wrap{position:relative;z-index:1;${PACK_COL_FIT}margin:${PACK_SPACE.lg}px auto calc(var(--pack-nav-h, 112px) + ${PACK_SPACE.xl}px);
  padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px ${PACK_SPACE.xl}px;box-shadow:${AINUBIS.panelShadow};
  --pk-stage:linear-gradient(180deg,rgba(${AINUBIS.cyanRGB},0.07) 0%,rgba(4,8,14,0.55) 22%,rgba(4,8,14,0.62) 100%);
  --pk-stage-edge:${AINUBIS.edge};}
${packColCSS('.zv-wrap')}
@media (max-width:767px){.zv-wrap{margin-top:${PACK_SPACE.md}px;margin-bottom:calc(var(--pack-nav-h, 112px) + ${PACK_SPACE.lg}px);padding:${PACK_SPACE.md}px;}}
@media (min-width:768px){.zv-wrap{padding:${PACK_SPACE.xl}px;}}
.zv-back{margin-bottom:${PACK_SPACE.md}px;}
.zv-top{display:grid;grid-template-columns:1fr;gap:${PACK_SPACE.lg}px;}
@media (min-width:768px){.zv-top{grid-template-columns:280px 1fr;}}
.zv-hero img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${PACK_R.tile}px;}
.zv-head{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:${PACK_SPACE.lg}px;min-width:0;
  padding:${PACK_SPACE.lg}px;border-radius:${PACK_R.card}px;${AI_GLASS}}
/* Pravá časť je JEDEN blok (Matej 4. 10.: „pravú časť vedľa obrázka dať do bloku a lepšie poukladať, teraz je to rozhádzané").
   Skupiny oddeľuje tenká čiara, podcast sedí na dne bloku. */
.zv-head > .zv-grp + .zv-grp{padding-top:${PACK_SPACE.lg}px;border-top:1px solid ${AINUBIS.edge};}
.zv-head > .zv-pod{margin-top:auto;}
/* miesto pre známku v rohu: meta aj nadpis nesmú vbehnúť pod ňu */
.zv-head .zv-meta,.zv-head .zv-h{padding-right:${PACK_SPACE.xxxl}px;}
.zv-grp{display:flex;flex-direction:column;align-items:flex-start;gap:${PACK_SPACE.md}px;}
/* PC: úvod sa rozloží po výške obrazu — nadpis hore, veta s blokom v strede, podcast dole
   (Matej 3. 10.: „úvod sa mi na PC nepáči, vyzerá to natlačené na sebe"). */
@media (min-width:768px){.zv-head{padding:${PACK_SPACE.xl}px;}}
.zv-meta{font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.cyan};padding-right:${PACK_SPACE.xl}px;}
.zv-h{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;line-height:1.2;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;overflow-wrap:anywhere;}
.zv-v{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.6;color:${AINUBIS.inkDim};}
/* PODCAST — cyan NEÓN (Matej 3. 10.: „podcast by som dal cyanom neónom tam, kde sa prehráva"). Žiara cez
   filter (box-shadow by zhodil check:pack); keď hrá, rozsvieti sa naplno. */
.zv-pod{align-self:stretch;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.card}px;background:${AINUBIS.raised};
  border:1px solid ${AINUBIS.cyan};filter:drop-shadow(0 0 6px rgba(${AINUBIS.cyanRGB},0.45));transition:filter 200ms ease;}
.zv-pod.is-play{filter:drop-shadow(0 0 14px rgba(${AINUBIS.cyanRGB},0.85));}
.zv-pod small{display:flex;align-items:center;gap:${PACK_SPACE.xs}px;margin-bottom:${PACK_SPACE.sm}px;
  font:700 ${PACK_TEXT.label}px ${FONT_TITLE};letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.cyan};}
/* hlavička podcastu: názov vľavo, jazyky vpravo (Matej 4. 10.: „pri tlačidle prehrať výber jazykov") */
.zv-pod small{justify-content:space-between;flex-wrap:wrap;}
.zv-pod small > span{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;}
/* Jazyk = rozbaľovač (Matej 4. 10.: „jazyk daj do dropdownu, podľa jazyka člena, posledná možnosť pridať iný jazyk, vedľa prepis"). */
.zv-ptools{flex:none;display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;}
.zv-plang{flex:none;cursor:pointer;padding:${PACK_SPACE.xs}px ${PACK_SPACE.xl}px ${PACK_SPACE.xs}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.pill}px;background:${AINUBIS.raised} no-repeat right ${PACK_SPACE.sm}px center / 10px 10px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M1 3l4 4 4-4' fill='none' stroke='%235BE0F0' stroke-width='1.6'/%3E%3C/svg%3E");
  border:1px solid ${AINUBIS.cyan};color:${AINUBIS.cyan};font:700 ${PACK_TEXT.label}px ${FONT_UI};letter-spacing:.02em;}
.zv-pdd{position:relative;display:inline-flex;}
.zv-pmenu{position:absolute;top:calc(100% + ${PACK_SPACE.xs}px);right:0;z-index:6;display:flex;flex-direction:column;min-width:160px;
  padding:${PACK_SPACE.xs}px;border-radius:${PACK_R.tile}px;background:${AINUBIS.surfaceBase};border:1px solid ${AINUBIS.edgeStrong};}
.zv-pmenu button{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;cursor:pointer;text-align:left;background:transparent;
  border:0;color:${AINUBIS.ink};font:500 ${PACK_TEXT.body}px ${FONT_UI};letter-spacing:0;text-transform:none;}
.zv-pmenu button:hover,.zv-pmenu button.is-on{background:${AINUBIS.raised};color:${AINUBIS.cyan};}
.zv-pmenu .zv-padd{margin-top:${PACK_SPACE.xs}px;border-top:1px solid ${AINUBIS.edge};border-radius:0 0 ${PACK_R.field}px ${PACK_R.field}px;color:${AINUBIS.inkDim};}
.zv-ptr{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;background:transparent;
  border:1px solid ${AINUBIS.edge};color:${AINUBIS.inkDim};font:500 ${PACK_TEXT.label}px ${FONT_UI};text-transform:none;letter-spacing:0;}
.zv-ptr.is-on{border-color:${AINUBIS.cyan};color:${AINUBIS.cyan};}
/* PREHRÁVAČ — vlastný, cyan neón s tmavým ovládaním (Matej 4. 10.: „sivý blok prehrávača… výplň cyanová/neónová,
   text a čísla tmavé ako pozadie“). Natívne ovládanie prehliadača sa farbiť nedá. */
.zv-player{display:flex;align-items:center;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  background:${AINUBIS.cyan};color:${AINUBIS.bgDeep};filter:drop-shadow(0 0 8px rgba(${AINUBIS.cyanRGB},0.55));}
.zv-pbtn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:${PACK_R.pill}px;
  cursor:pointer;background:${AINUBIS.bgDeep};color:${AINUBIS.cyan};border:0;padding:0;}
.zv-pbtn .zv-ic{margin:0 0 0 2px;width:16px;height:16px;}
.zv-pause{display:inline-flex;gap:4px;}
.zv-pause i{display:block;width:4px;height:14px;border-radius:${PACK_R.pill}px;background:currentColor;}
.zv-ptime{flex:none;font:600 ${PACK_TEXT.label}px ${FONT_UI};font-variant-numeric:tabular-nums;}
.zv-pbar{flex:1 1 auto;min-width:0;height:6px;margin:0;cursor:pointer;-webkit-appearance:none;appearance:none;border-radius:${PACK_R.pill}px;
  background:linear-gradient(90deg, ${AINUBIS.bgDeep} var(--p,0%), rgba(0,0,0,0.22) var(--p,0%));}
.zv-pbar::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:${PACK_R.pill}px;background:${AINUBIS.bgDeep};border:0;}
.zv-pbar::-moz-range-thumb{width:14px;height:14px;border-radius:${PACK_R.pill}px;background:${AINUBIS.bgDeep};border:0;}
/* GALÉRIA — klik na obraz otvorí väčší a so šípkami aj obrazy z článku (Matej 4. 10.). */
.zv-hero img{cursor:zoom-in;}
.zv-gal{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;gap:${PACK_SPACE.md}px;
  padding:${PACK_SPACE.xxxl}px ${PACK_SPACE.lg}px;background:rgba(1,5,10,0.94);}
.zv-gal img{display:block;max-width:min(100%, 640px);max-height:calc(100dvh - 140px);object-fit:contain;border-radius:${PACK_R.tile}px;}
.zv-gal figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.sm}px;max-height:100%;min-width:0;}
.zv-gal figcaption{font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkFaint};}
.zv-gnav{flex:none;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:${PACK_R.pill}px;cursor:pointer;
  background:${AINUBIS.raised};border:1px solid ${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}
.zv-gnav:disabled{opacity:.3;cursor:default;}
.zv-gback{position:absolute;top:${PACK_SPACE.lg}px;left:${PACK_SPACE.lg}px;}
@media (max-width:767px){.zv-gal{padding:${PACK_SPACE.xxxl}px ${PACK_SPACE.sm}px;}.zv-gnav{position:absolute;bottom:${PACK_SPACE.lg}px;}
  .zv-gnav--prev{left:calc(50% - 56px);}.zv-gnav--next{right:calc(50% - 56px);}}
.zv-tr{margin-top:${PACK_SPACE.md}px;max-height:360px;overflow-y:auto;padding-right:${PACK_SPACE.sm}px;
  font-size:${PACK_TEXT.body}px;line-height:1.6;color:${AINUBIS.inkDim};}
.zv-tr p{margin:0 0 ${PACK_SPACE.sm}px;}
.zv-tr b{display:inline-block;min-width:72px;font:700 ${PACK_TEXT.micro}px ${FONT_UI};letter-spacing:.02em;text-transform:uppercase;color:${AINUBIS.inkFaint};}
.zv-tr b.is-ai{color:${AINUBIS.ink};}
.zv-tr b.is-ai span{color:${AINUBIS.aiInk};}
.zv-req{margin-top:${PACK_SPACE.md}px;font-size:${PACK_TEXT.label}px;line-height:1.5;color:${AINUBIS.inkDim};}
.zv-req > div{display:flex;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.sm}px;}
.zv-req select{flex:1 1 auto;min-width:0;padding:${PACK_SPACE.sm}px;border-radius:${PACK_R.field}px;background:${AINUBIS.bgDeep};
  border:1px solid ${AINUBIS.edge};color:${AINUBIS.ink};font:500 ${PACK_TEXT.body}px ${FONT_UI};}
.zv-req button{flex:none;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.field}px;cursor:pointer;
  background:${AINUBIS.raised};border:1px solid ${AINUBIS.cyan};color:${AINUBIS.cyan};font:700 ${PACK_TEXT.label}px ${FONT_TITLE};
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.zv-req .zv-ok{margin-top:${PACK_SPACE.sm}px;}
/* ČLENITOSŤ PRÍBEHU (Matej 4. 10.: „chýba rozmanitosť odsekov, roky, odrážky… obrázky, ktoré sme nepoužili")
   — značky v príbehu d: ◷ ROK | text = časová os · » = zvýraznený fakt · ▣ B | popis = nepoužitý obraz. */
.zv-yr{color:${AINUBIS.ctaA};font-weight:600;}
.zv-tl{list-style:none;margin:${PACK_SPACE.xl}px 0;padding:0 0 0 ${PACK_SPACE.lg}px;border-left:2px solid ${AINUBIS.ctaEdge};}
.zv-tl li{position:relative;margin:0 0 ${PACK_SPACE.lg}px;}
.zv-tl li:last-child{margin-bottom:0;}
.zv-tl li::before{content:'';position:absolute;left:-${PACK_SPACE.lg + 6}px;top:4px;width:10px;height:10px;border-radius:${PACK_R.pill}px;background:${AINUBIS.ctaA};}
.zv-tl b{display:block;font:700 ${PACK_TEXT.label}px ${FONT_TITLE};letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ctaA};}
.zv-tl span{display:block;font-size:${PACK_TEXT.body}px;line-height:1.6;}
.zv-fact{margin:${PACK_SPACE.xl}px 0;padding:${PACK_SPACE.sm}px 0 ${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;border-left:2px solid ${AINUBIS.ctaA};
  font:600 ${PACK_TEXT.h2}px/1.45 ${FONT_UI};color:${AINUBIS.ink};}
.zv-fig{margin:${PACK_SPACE.xl}px auto;max-width:420px;}
.zv-fig img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.edge};}
.zv-fig figcaption{margin-top:${PACK_SPACE.sm}px;font-size:${PACK_TEXT.label}px;line-height:1.5;color:${AINUBIS.inkFaint};text-align:center;}
.zv-body{margin-top:${PACK_SPACE.xl}px;max-width:760px;font-size:${PACK_TEXT.lead}px;line-height:1.75;font-weight:300;color:${AINUBIS.inkDim};}
/* Tenší rez 300 (Matej 4. 10.: „písmo celého textu sa mi zdá dosť hrubé… nebolo by čitateľnejšie tenšie?"). Space Grotesk je načítaný 300–600. */
.zv-body b,.zv-body strong{font-weight:600;color:${AINUBIS.ink};}
.zv-body p{margin:0 0 ${PACK_SPACE.md}px;}
.zv-body ul{margin:0 0 ${PACK_SPACE.lg}px;padding-left:${PACK_SPACE.xl}px;list-style:disc;}
.zv-body ul li{margin-bottom:${PACK_SPACE.sm}px;}
.zv-body ul li::marker{color:${AINUBIS.ctaA};}
.zv-box{margin-top:${PACK_SPACE.lg}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.card}px;${AI_GLASS}
  border-top:2px solid var(--zv-bx, ${AINUBIS.cyan});}
.zv-box .zv-sec{margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.lead}px;color:var(--zv-bx, ${AINUBIS.cyan});
  background:linear-gradient(90deg, var(--zv-bx, ${AINUBIS.cyan}) 0%, transparent 60%) left bottom / 100% 1px no-repeat;}
.zv-box--src{--zv-bx:${AINUBIS.ctaA};}
.zv-box--add{--zv-bx:${AINUBIS.aiInk};}
.zv-box--you{--zv-bx:${AINUBIS.danger};filter:drop-shadow(0 0 10px ${AINUBIS.dangerEdge});}
/* NAVRHNÚŤ ZMENU — červené podsvietenie (Matej 3. 10.), po kliku tri druhy návrhu + text. */
.zv-prop{display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;cursor:pointer;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;
  border-radius:${PACK_R.field}px;background:${AINUBIS.dangerTint};border:1px solid ${AINUBIS.danger};color:${AINUBIS.danger};
  font:700 ${PACK_TEXT.label}px ${FONT_TITLE};letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.zv-prop.is-open{background:${AINUBIS.danger};color:${AINUBIS.ctaInk};}
.zv-kinds{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;margin:${PACK_SPACE.md}px 0;}
.zv-kind{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;background:transparent;
  border:1px solid ${AINUBIS.dangerEdge};color:${AINUBIS.ink};font:500 ${PACK_TEXT.label}px ${FONT_UI};}
.zv-kind.is-on{background:${AINUBIS.dangerTint};border-color:${AINUBIS.danger};color:${AINUBIS.danger};}
.zv-ok{margin-top:${PACK_SPACE.md}px;font-size:${PACK_TEXT.label}px;color:${AINUBIS.ok};}
/* komentár: labka s počtom + fotka */
.zv-cmt > div{flex:1 1 auto;min-width:0;}
.zv-cimg{display:block;max-width:100%;max-height:320px;margin-top:${PACK_SPACE.sm}px;border-radius:${PACK_R.tile}px;}
.zv-clike{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;margin-top:${PACK_SPACE.xs}px;padding:0;cursor:pointer;
  background:none;border:0;color:${AINUBIS.inkDim};font:500 ${PACK_TEXT.label}px ${FONT_UI};}
.zv-clike.is-on{color:${AINUBIS.cyan};}
.zv-cdel{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;padding:0;cursor:pointer;background:none;border:0;color:inherit;opacity:.7;font:500 ${PACK_TEXT.label}px ${FONT_UI};}
.zv-cdel.is-go{color:${AINUBIS.cyan};opacity:1;}
.zv-cdel-ask{display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;font:500 ${PACK_TEXT.label}px ${FONT_UI};}
.zv-clike .zv-ic{margin-right:0;width:16px;height:16px;}
.zv-crow{display:flex;align-items:center;justify-content:space-between;align-self:stretch;gap:${PACK_SPACE.sm}px;}
.zv-cpic{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;cursor:pointer;color:${AINUBIS.cyan};font:500 ${PACK_TEXT.label}px ${FONT_UI};}
.zv-cpic input{display:none;}
.zv-cprev{max-height:80px;border-radius:${PACK_R.field}px;}
.zv-box--talk{--zv-bx:${AINUBIS.cyan};}
.zv-cmt{display:flex;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px 0;border-bottom:1px solid ${AINUBIS.edge};font-size:${PACK_TEXT.body}px;}
.zv-cmt p{margin:${PACK_SPACE.xs}px 0 0;color:${AINUBIS.inkDim};}
.zv-cmt small{color:${AINUBIS.inkFaint};font-size:${PACK_TEXT.micro}px;}
.zv-cav{width:28px;height:28px;flex:0 0 auto;border-radius:${PACK_R.pill}
.zv-cav img{width:100%;height:100%;object-fit:cover;border-radius:inherit;}px;display:flex;align-items:center;justify-content:center;
  background:${AINUBIS.raised};border:1px solid ${AINUBIS.edge};font-size:${PACK_TEXT.label}px;}
.zv-cform{display:flex;flex-direction:column;align-items:flex-end;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.md}px;}
.zv-cform textarea{align-self:stretch;resize:vertical;min-height:64px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;
  background:${AINUBIS.surface};border:1px solid ${AINUBIS.edge};color:${AINUBIS.ink};font:400 ${PACK_TEXT.body}px ${FONT_UI};}
.zv-cform textarea:focus{outline:none;border-color:${AINUBIS.edgeStrong};}
.zv-chip:disabled{opacity:.5;cursor:default;}
/* NADPISY ČLÁNKU — Matej 3. 10.: „tie nadpisy modré sú malinké, nevýrazné… ľahko sa prehliadnu“.
   Tvar KARTY z PACK_HEAD (Cinzel 700/.14em), stupeň h2 20 px, svetlý inkoust + zlatá niť pod ním. */
.zv-sec{margin:${PACK_SPACE.xxl}px 0 ${PACK_SPACE.md}px;padding-bottom:${PACK_SPACE.sm}px;font-family:${FONT_TITLE};font-weight:700;
  font-size:${PACK_TEXT.h2}px;line-height:1.25;letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ink};
  background:linear-gradient(90deg, ${AINUBIS.ctaA} 0%, ${AINUBIS.ctaB} 25%, transparent 60%) left bottom / 100% 2px no-repeat;}
.zv-add{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-left:2px solid ${AINUBIS.cyan};border-radius:0 ${PACK_R.tile}px ${PACK_R.tile}px 0;
  background:${AINUBIS.raised};font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkDim};}
.zv-src{margin:0;padding-left:${PACK_SPACE.lg}px;font-size:${PACK_TEXT.label}px;line-height:1.55;color:${AINUBIS.inkDim};}
.zv-src li{margin-bottom:${PACK_SPACE.xs}px;}
.zv-src a{color:${AINUBIS.cyan};}
.zv-rel{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.zv-chip{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;cursor:pointer;
  background:transparent;border:1px solid ${AINUBIS.edge};color:${AINUBIS.cyan};font:500 ${PACK_TEXT.label}px ${FONT_UI};}
.zv-chip:hover{border-color:${AINUBIS.edgeStrong};}
.zv-chip--dash{border-style:dashed;}
/* ZAPÍŠ DO MOZGU — hlavné CTA článku (Matej 3. 10.: „výraznejšie a krajšie, nech je ho vidno“).
   Plná plocha AINUBISOVHO CTA; po zápise sa prefarbí na zelenú BRAIN_STATE.read = to, čo sa stane v mozgu. */
.zv-done{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.xs}px;width:100%;margin-top:${PACK_SPACE.xl}px;
  padding:${PACK_SPACE.lg}px ${PACK_SPACE.xl}px;cursor:pointer;text-align:center;border-radius:${PACK_R.card}px;
  background:${AINUBIS.ctaGrad};border:1px solid ${AINUBIS.ctaEdge};color:${AINUBIS.ctaInk};box-shadow:${AINUBIS.ctaShadow};
  transition:transform 150ms ease;}
.zv-done:hover{transform:translateY(-1px);background:${AINUBIS.ctaGradHover};}
.zv-done b{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;font:700 ${PACK_TEXT.lead}px ${FONT_TITLE};
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
.zv-done small{font-size:${PACK_TEXT.label}px;opacity:.8;}
.zv-done.is-done{background:var(--zv-read);border-color:var(--zv-read);color:#03140A;cursor:default;transform:none;}
.zv-ic{display:inline-block;width:14px;height:14px;vertical-align:-2px;margin-right:${PACK_SPACE.xs}px;background:currentColor;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain;}
.zv-chip svg{vertical-align:-2px;margin-right:${PACK_SPACE.xs}px;}
.zv-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--pack-nav-h, 112px) + ${PACK_SPACE.md}px);z-index:41;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;background:${AINUBIS.surfaceBase};
  border:1px solid ${AINUBIS.edge};font-size:${PACK_TEXT.label}px;color:${AINUBIS.ink};}
`;

export function EvidenceBadge({ sd, lang, corner = false }: { sd: number; lang: string; corner?: boolean }) {
  const u = scrollUI(lang);
  if (!sd) return null;
  return (
    <span className={`zv-sd${corner ? ' zv-sd--corner' : ''}`} data-g={GRADE[sd]} tabIndex={0} aria-label={`${u.sd} ${u.sdName[sd]}`}>
      {GRADE[sd]}
      <span className="zv-tip" role="tooltip"><b>{u.sd} {u.sdName[sd]}</b><br />A · B · C — {u.sdName[3].slice(4)} → {u.sdName[1].slice(4)}</span>
    </span>
  );
}

export function ScrollActions({ id, lang, onShare, onTalk }: {
  id: string; lang: string; onShare: () => void; onTalk: () => void;
}) {
  const u = scrollUI(lang);
  const saved = useSaved().includes(id);
  const talk = useTalkCount(id);
  const liked = useLiked().includes(id);
  // Počet od všetkých členov (`vault_scroll_counts`); bez účtu (NOAUTH dev) len môj klik.
  const c = useCounts(id);
  const likes = c ? c.likes : (liked ? 1 : 0);
  const saves = c ? c.saves : (saved ? 1 : 0);
  const [sent, setSent] = useState(false);
  // ZAPNUTÁ AKCIA = VYPLNENÁ IKONKA (Matej 3. 10.: „vyplnia sa farbou, nie len obrys, ale aj vnútro —
  // pri komentoch len pravá bublina"). Labka = plná z kitu, hviezdička a šípka = vyplnený vonkajší
  // obrys tej istej kresby, bubliny = pravá vyplnená. Zdieľanie nie je prepínač — svieti chvíľu po kliku.
  // POČTY pri páči sa a uložení (Matej 3. 10.: „počty musia byť pri likeoch a uloženiach").
  return (
    <div className="zv-acts">
      <button type="button" data-k="like" className={`zv-act${liked ? ' is-on' : ''}`} onClick={() => toggleLiked(id)} aria-label={u.like}>
        <HandHeart size={20} on={liked} />{/* srdiečko, nie labka — lock §4.2 ❤️, labka = nav + RatingPaws (Matej 4. 10.: „dajme srdiečko“) */}<span className="zv-n">{likes}</span>
      </button>
      <button type="button" data-k="save" className={`zv-act${saved ? ' is-on' : ''}`} onClick={() => toggleSaved(id)} aria-label={u.save}><HandStar size={20} filled={saved} /><span className="zv-n">{saves}</span></button>
      <button type="button" data-k="talk" className={`zv-act${talk > 0 ? ' is-on' : ''}`} onClick={onTalk} aria-label={u.talk}>
        <Ic ic={talk > 0 ? 'chat-right-full' : 'chat'} /><span className="zv-n">{talk}</span>
      </button>
      <button type="button" data-k="share" className={`zv-act${sent ? ' is-on' : ''}`}
        onClick={() => { onShare(); setSent(true); window.setTimeout(() => setSent(false), 1500); }} aria-label={u.share}>
        <HandForward size={20} filled={sent} />
      </button>
    </div>
  );
}

/** Karta zvitku v zozname. Videné = karta aspoň 2 s z polovice na obrazovke. */
export function ScrollCard({ z, lang, worldName, onOpen, onShare }: {
  z: DemoScroll; lang: string;
  /** Meno sveta z i18n — farbí sa `WORLD_TINT` (Matej 6. 10.: „z karty nie je jasné, aký je to svet“). */
  worldName?: string;
  onOpen: (id: string, focus?: 'pod' | 'src' | 'talk') => void; onShare: (id: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const s = useScrollState()[z.id] || 0;
  const x = pickText(z, lang);
  const pod = pickPod(z, lang);
  const u = scrollUI(lang);
  useEffect(() => {
    const el = ref.current;
    if (!el || s >= 1) return;
    let t = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(t);
      if (e.isIntersecting) t = window.setTimeout(() => markScroll(z.id, 1), 2000);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, [z.id, s]);
  return (
    <article ref={ref} className="akv-zv" data-zid={z.id} style={aiWorld(z.world)}>
      <div className="akv-zvimg">
        {z.img && <img src={z.img} alt="" loading="lazy" onClick={() => onOpen(z.id)} />}
        <ScrollActions id={z.id} lang={lang} onShare={() => onShare(z.id)} onTalk={() => onOpen(z.id, 'talk')} />
      </div>
      <div className="akv-zvt">
        {/* ZNÁMKA V ROHU TEXTOVÉHO BLOKU, NIE KARTY (Matej 5. 10. 2026: *„relevantnosť nesmie byť
            v tom rohu a priesvitná, mala by byť dolu, ako je nadpis, v hornom rohu vpravo"*).
            Na mobile je karta stĺpec, takže roh karty padol na obraz. Na PC je textový stĺpec
            vpravo a CSS ju posunie do rohu karty ako doteraz (Matej 3. 10.: „A daj úplne do rohu"). */}
        <EvidenceBadge sd={z.sd} lang={lang} corner />
        <div className="zv-mid">
          <span className="akv-zvlbl">{worldName && <><b className="akv-zvw" style={aiWorld(z.world)}>{worldName}</b> · </>}{u.scroll} {z.n} / {z.total} · {x.min} {u.min}</span>
          <h3 className="akv-zvn" style={{ paddingRight: PACK_SPACE.xxl }}>{x.t}</h3>
          <span className="zv-rule" aria-hidden />
        </div>
        {/* Tri skupiny rovnomerne po výške obrazu (Matej 3. 10.: „blok vyzerá prázdny, rozlož obsah,
            pridaj text nad blok, len dve CTA — zdroje budú v detaile“). */}
        <div className="zv-mid">
          <p className="akv-zvv">{x.v}</p>
          {x.vz && <div className="zv-take">{x.vz}</div>}
        </div>
        <div className="zv-ctas">
          {/* STAV JE V CTA (Matej 3. 10.: krúžok s ✓ „aplikovať priamo do CTA… zo začiatku sivé,
              po vypočutí/prečítaní sa označí farebne ako pri tripoch (prejdené)") — zelený tint. */}
          <button type="button" className={`zv-read${s === 2 ? ' is-done' : ''}`} onClick={() => onOpen(z.id)}>
            {s === 2 && <HandCheck size={14} />}{s === 2 ? u.readDone : u.read}
          </button>
          {pod && <button type="button" className="akv-zvsec" onClick={() => onOpen(z.id, 'pod')}><Ic ic="play" />{u.listen} · {fmtSec(pod.sec)}</button>}
        </div>
      </div>
    </article>
  );
}

/** Telo príbehu: „▸ " = medzinadpis, riadky „– " = zoznam. */
/** Roky v texte zlatou (Matej 4. 10.: „chýba… roky"). Len štvorciferné roky 1000–2099 — strany „s. 22" nie. */
function Years({ t }: { t: string }) {
  const parts = t.split(/(\b(?:1\d{3}|20\d{2})\b)/);
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} className="zv-yr">{p}</span> : p))}</>;
}

/** Príbeh `d`: ▸ sekcia · – odrážky · ◷ ROK | text (časová os) · \u00BB zvýraznený fakt · ▣ B | popis (nepoužitý obraz). */
function StoryBody({ d, imgs, onImg }: { d: string; imgs?: Record<string, string>; onImg?: (src: string) => void }) {
  const blocks = d.split(/\n\n+/);
  return (
    <>
      {blocks.map((b, i) => {
        if (b.startsWith('▸')) return <h3 key={i} className="zv-sec">{b.replace(/^▸\s*/, '')}</h3>;
        if (b.startsWith('\u00BB')) return <blockquote key={i} className="zv-fact"><Years t={b.replace(/^\u00BB\s*/, '')} /></blockquote>;
        if (b.startsWith('▣')) {
          const m = b.match(/^▣\s*([ABC])\s*\|?\s*(.*)$/s);
          const src = m && imgs?.[m[1]];
          return src ? <figure key={i} className="zv-fig"><img src={src} alt={m[2]} loading="lazy" onClick={() => onImg?.(src)} style={{ cursor: 'zoom-in' }} /><figcaption>{m[2]}</figcaption></figure> : null;
        }
        const lines = b.split('\n');
        const tl = lines.filter(l => l.startsWith('◷'));
        if (tl.length) {
          const head = lines.filter(l => !l.startsWith('◷'));
          return (
            <div key={i}>
              {head.length > 0 && <p><Years t={head.join(' ')} /></p>}
              <ol className="zv-tl">{tl.map((l, j) => {
                const [y, ...rest] = l.replace(/^◷\s*/, '').split('|');
                return <li key={j}><b>{y.trim()}</b><span>{rest.join('|').trim()}</span></li>;
              })}</ol>
            </div>
          );
        }
        const list = lines.filter(l => /^[–-]\s/.test(l));
        if (list.length) {
          const head = lines.filter(l => !/^[–-]\s/.test(l));
          return (
            <div key={i}>
              {head.length > 0 && <p><Years t={head.join(' ')} /></p>}
              <ul>{list.map((l, j) => <li key={j}><Years t={l.replace(/^[–-]\s/, '')} /></li>)}</ul>
            </div>
          );
        }
        return <p key={i}><Years t={b} /></p>;
      })}
    </>
  );
}

/** Auto-prečítané: koniec textu musí byť vo výreze aspoň END_HOLD_MS a článok otvorený aspoň OPEN_MIN_MS. */
const END_HOLD_MS = 1500;
const OPEN_MIN_MS = 6000;

/** Jazyky na žiadosť — natívne mená (Matej 3. 10.: ďalší jazyk vznikne až na žiadosť člena). */
const REQ_LANGS: [string, string][] = [
  ['de', 'Deutsch'], ['es', 'Español'], ['fr', 'Français'], ['it', 'Italiano'], ['pl', 'Polski'], ['pt', 'Português'],
  ['nl', 'Nederlands'], ['uk', 'Українська'], ['ru', 'Русский'], ['tr', 'Türkçe'], ['id', 'Bahasa Indonesia'],
  ['ja', '日本語'], ['ko', '한국어'], ['zh', '中文'], ['ar', 'العربية'],
];
const POD_TAG: Record<string, string> = { sk: 'SK', en: 'EN', cs: 'CZ' };

/** PODCAST — prehrávač s výberom jazyka, prepisom a žiadosťou o nový jazyk (Matej 4. 10.). */
function PodcastBox({ z, lang, onDone, boxRef, autoPlay, onEnd }: {
  z: DemoScroll; lang: string; onDone: () => void; boxRef: React.RefObject<HTMLDivElement>;
  /** POČÚVAJ ZA SEBOU (8. 10. 2026) — podcast sa spustí sám a po dohraní pustí ďalší zvitok. */
  autoPlay?: boolean; onEnd?: () => void;
}) {
  const u = scrollUI(lang);
  const [want, setWant] = useState<string | undefined>();
  const pl = podLang(z, lang, want);
  const pod = pl ? z.pod[pl] : null;
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState<'' | 'tr' | 'req'>('');
  const [req, setReq] = useState(REQ_LANGS[0][0]);
  const [reqSent, setReqSent] = useState(false);
  const [menu, setMenu] = useState(false);
  const [t, setT] = useState(0);
  const audio = useRef<HTMLAudioElement>(null);
  const lastSave = useRef(0);
  useEffect(() => { setT(0); lastSave.current = 0; }, [pl]);
  // POKRAČUJ — rozpočúvaný podcast začne tam, kde človek skončil (nie pri dopočúvanom).
  const row = useReads()[z.id];
  const resumeAt = row && !row.listened_at ? row.listen_sec : 0;
  // DENNÍK počúvania: jedna udalosť `listen` za ucelený úsek (play → pauza/koniec/zatvorenie),
  // s počtom odohraných sekúnd — nie každá sekunda. Úseky < 3 s (omylom kliknuté) sa nezapíšu.
  const playedFrom = useRef<number | null>(null);
  const langRef = useRef(pl);
  langRef.current = pl;
  const flushListen = () => {
    if (playedFrom.current == null) return;
    const sec = Math.round((Date.now() - playedFrom.current) / 1000);
    playedFrom.current = null;
    if (sec >= 3) logEvent(z.id, 'listen', { sec, lang: langRef.current, at: Math.round(audio.current?.currentTime || 0) });
  };
  const flushRef = useRef(flushListen);
  flushRef.current = flushListen;
  useEffect(() => () => flushRef.current(), []);
  useEffect(() => { flushRef.current(); }, [pl]);
  if (!pod || !pl) return null;
  // Kam došiel — do postupu najviac raz za 15 s (+ pri pauze a konci), nie pri každom ticku.
  const keep = (sec: number, force = false) => {
    if (!force && sec - lastSave.current < 15) return;
    lastSave.current = sec;
    saveListen(z.id, sec, pl);
  };
  const onTime = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const a = e.currentTarget;
    keep(a.currentTime);
    if (a.duration && a.currentTime / a.duration >= 0.9) onDone();
  };
  return (
    <div className={`zv-pod${playing ? ' is-play' : ''}`} ref={boxRef}>
      <small>
        <span><Ic ic="play" />{u.pod} · {fmtSec(pod.sec)}</span>
        <span className="zv-ptools">
          <span className="zv-pdd">
            <button type="button" className="zv-plang" aria-haspopup="listbox" aria-expanded={menu}
              onClick={() => setMenu(!menu)}>{POD_TAG[pl]}</button>
            {menu && (
              <span className="zv-pmenu" role="listbox" aria-label={u.other}>
                {['sk', 'en', 'cs'].filter((l) => z.pod[l]).map((l) => (
                  <button key={l} type="button" role="option" aria-selected={l === pl} className={l === pl ? 'is-on' : ''}
                    onClick={() => { setWant(l); setPlaying(false); setMenu(false); if (open === 'req') setOpen(''); }}>{POD_TAG[l]}</button>
                ))}
                <button type="button" className="zv-padd" onClick={() => { setOpen('req'); setMenu(false); }}>+ {u.other}</button>
              </span>
            )}
          </span>
          {!!pod.tr?.length && (
            <button type="button" className={`zv-ptr${open === 'tr' ? ' is-on' : ''}`} aria-pressed={open === 'tr'}
              onClick={() => setOpen(open === 'tr' ? '' : 'tr')}>{u.tr}</button>
          )}
        </span>
      </small>
      <audio key={pod.src} ref={audio} preload="metadata" src={pod.src}
        onLoadedMetadata={(e) => { const a = e.currentTarget; if (resumeAt > 5 && resumeAt < a.duration * 0.9) { a.currentTime = resumeAt; setT(resumeAt); lastSave.current = resumeAt; } if (autoPlay) void a.play().catch(() => undefined); }}
        onTimeUpdate={(e) => { onTime(e); setT(e.currentTarget.currentTime); }}
        onPlay={() => { setPlaying(true); playedFrom.current = Date.now(); }} onPause={(e) => { setPlaying(false); flushListen(); keep(e.currentTarget.currentTime, true); }}
        onEnded={(e) => { setPlaying(false); flushListen(); keep(e.currentTarget.currentTime, true); onDone(); onEnd?.(); }} />
      <div className="zv-player">
        <button type="button" className="zv-pbtn" aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => { const a = audio.current; if (!a) return; if (a.paused) void a.play(); else a.pause(); }}>
          {playing ? <span className="zv-pause" aria-hidden><i /><i /></span> : <Ic ic="play" />}
        </button>
        <span className="zv-ptime">{fmtSec(Math.floor(t))} / {fmtSec(pod.sec)}</span>
        <input type="range" className="zv-pbar" min={0} max={pod.sec} step={1} value={Math.floor(t)} aria-label={u.pod}
          style={{ ['--p' as string]: `${pod.sec ? (t / pod.sec) * 100 : 0}%` }}
          onChange={(e) => { const a = audio.current; const v = Number(e.target.value); if (a) a.currentTime = v; setT(v); }} />
      </div>
      {open === 'tr' && (
        <div className="zv-tr">
          {pod.tr!.map((r, i) => (
            <p key={i}>
              {r.s === 'A' ? <b className="is-ai"><span>AI</span>NUBIS</b> : <b>Matej</b>} {r.t}
            </p>
          ))}
        </div>
      )}
      {open === 'req' && (
        <div className="zv-req">
          <b>{u.reqTitle}</b> — {u.reqText}
          {reqSent ? <div className="zv-ok">{u.reqOk}</div> : (
            <div>
              <select value={req} onChange={(e) => setReq(e.target.value)} aria-label={u.other}>
                {REQ_LANGS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
              </select>
              <button type="button" onClick={() => { requestLang(z.id, req); setReqSent(true); }}>{u.reqBtn}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Obrazy článku v poradí: hlavný + nepoužité varianty tak, ako stoja v príbehu (`▣ B | popis`). */
function galleryOf(z: DemoScroll, d: string): { src: string; cap: string }[] {
  const out = z.img ? [{ src: z.img, cap: '' }] : [];
  for (const m of d.matchAll(/^▣\s*([ABC])\s*\|?\s*(.*)$/gm)) {
    const src = z.imgs?.[m[1]];
    if (src && !out.some((o) => o.src === src)) out.push({ src, cap: m[2] });
  }
  return out;
}

/** GALÉRIA — väčší obraz + šípky (klávesy ← → Esc, na mobile potiahnutie). */
function Gallery({ list, start, label, onClose }: { list: { src: string; cap: string }[]; start: number; label: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const x0 = useRef<number | null>(null);
  const go = (k: number) => setI((v) => Math.min(list.length - 1, Math.max(0, v + k)));
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });
  const it = list[i];
  // portál do body: článok (.zv-veil, z 39) je vlastný kontext vrstiev — vnútri by galériu prekryla lišta
  return createPortal(
    <div className="zv-gal" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (x0.current === null) return; const dx = e.changedTouches[0].clientX - x0.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); x0.current = null; }}>
      <BackButton tone="ainubis" onClick={onClose} label={label} className="zv-gback" />
      {list.length > 1 && <button type="button" className="zv-gnav zv-gnav--prev" disabled={i === 0} onClick={() => go(-1)} aria-label="Prev"><HandArrowLeft size={20} /></button>}
      <figure>
        <img src={it.src} alt={it.cap} />
        <figcaption>{i + 1} / {list.length}{it.cap ? ` · ${it.cap}` : ''}</figcaption>
      </figure>
      {list.length > 1 && <button type="button" className="zv-gnav zv-gnav--next" disabled={i === list.length - 1} onClick={() => go(1)} aria-label="Next"><HandArrowLeft size={20} style={{ transform: 'scaleX(-1)' }} /></button>}
    </div>
,
    document.body,
  );
}

/** Článok zvitku — vrstva nad VAULTOM s vlastnou adresou. */
export function ScrollView({ z, all, lang, focus, onClose, onOpen, onUse, onShare, queue, onNext }: {
  z: DemoScroll; all: DemoScroll[]; lang: string; focus?: string | null;
  onClose: () => void; onOpen: (id: string) => void; onUse: () => void; onShare: (id: string) => void;
  /** POČÚVAJ ZA SEBOU — podcast hrá sám a po konci otvorí ďalší (`onNext`). */
  queue?: boolean; onNext?: () => void;
}) {
  const u = scrollUI(lang);
  const x = pickText(z, lang);
  const s = useScrollState()[z.id] || 0;
  const talkList = useTalk(z.id);
  const [draft, setDraft] = useState('');
  const [pic, setPic] = useState('');
  const [sending, setSending] = useState(false);
  const [delAsk, setDelAsk] = useState<number | null>(null);
  const [propOpen, setPropOpen] = useState(false);
  const [kind, setKind] = useState<ProposalKind>('add');
  const [prop, setProp] = useState('');
  const [propSent, setPropSent] = useState(false);
  const veil = useRef<HTMLDivElement>(null);
  const podRef = useRef<HTMLDivElement>(null);
  const srcRef = useRef<HTMLHeadingElement>(null);
  const talkRef = useRef<HTMLElement>(null);
  const [gal, setGal] = useState<number | null>(null);
  const gallery = galleryOf(z, x.d);

  // Otvorenie článku = videné. Telo pod vrstvou nescrolluje (kôš 2, ako StoryView).
  useEffect(() => { markScroll(z.id, 1); logEvent(z.id, 'open'); }, [z.id]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  // PREČÍTANÉ AUTOMATICKY (8. 10. 2026): koniec TEXTU zvitku (nie stránky) je vo výreze a článok je
  // otvorený aspoň OPEN_MIN_MS — krátke bliknutie / rýchle preskrolovanie sa nezapíše. Tlačidlo ostáva.
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = endRef.current;
    if (!el || s === 2) return;
    const opened = Date.now();
    let t = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(t);
      if (e.isIntersecting) {
        t = window.setTimeout(() => markScroll(z.id, 2, 'read', 'auto'), Math.max(END_HOLD_MS, OPEN_MIN_MS - (Date.now() - opened)));
      }
    }, { root: veil.current, threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(t); };
  }, [z.id, s]);
  useEffect(() => {
    veil.current?.scrollTo({ top: 0 });
    const el = focus === 'pod' ? podRef.current : focus === 'src' ? srcRef.current : focus === 'talk' ? talkRef.current : null;
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }, [z.id, focus]);

  return (
    <div className="zv-veil" ref={veil} role="dialog" aria-modal="true" aria-label={x.t}>
      <div className="zv-bg" aria-hidden />
      {gal !== null && gallery.length > 0 && <Gallery list={gallery} start={gal} label={u.back} onClose={() => setGal(null)} />}
      <div className="zv-wrap pk-stage">
        <BackButton tone="ainubis" onClick={onClose} label={u.back} className="zv-back" />
        <div className="zv-top">
          <div className="zv-hero">
            {z.img && <img src={z.img} alt="" onClick={() => setGal(0)} />}
            <ScrollActions id={z.id} lang={lang} onShare={() => onShare(z.id)} onTalk={() => talkRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
          </div>
          <div className="zv-head">
            {/* Známka v rohu bloku ako na karte (Matej 4. 10.: „v detaile dať známku na kraj ako pri náhľade“). */}
            <EvidenceBadge sd={z.sd} lang={lang} corner />
            <div className="zv-grp">
              <span className="zv-meta">{circleName(z, lang)} · {u.scroll} {z.n}/{z.total} · {x.min} {u.min}</span>
              <h1 className="zv-h">{x.t}</h1>
              <span className="zv-rule" aria-hidden />
              {s === 2 && <span className="zv-badge"><HandCheck size={14} />{u.readDone}</span>}
            </div>
            <div className="zv-grp">
              <p className="zv-v">{x.v}</p>
              {x.vz && <div className="zv-take" style={{ alignSelf: 'stretch' }}>{x.vz}</div>}
            </div>
            <PodcastBox z={z} lang={lang} boxRef={podRef} onDone={() => markScroll(z.id, 2, 'listen')}
              autoPlay={queue} onEnd={queue ? onNext : undefined} />
          </div>
        </div>

        <div className="zv-body">
          <StoryBody d={x.d} imgs={z.imgs} onImg={(src) => setGal(Math.max(0, gallery.findIndex((g) => g.src === src)))} />
          <div ref={endRef} aria-hidden style={{ height: 1 }} />

          <section className="zv-box zv-box--add">
          <h3 className="zv-sec">{u.added}</h3>
          {z.doplnene.length
            ? z.doplnene.map((a, i) => <div key={i} className="zv-add"><b>{a.date}</b> · {a.text}</div>)
            : <div className="zv-add">{u.addedNone}</div>}
          </section>

          {z.zdroje.length > 0 && <section className="zv-box zv-box--src">
            <h3 className="zv-sec" ref={srcRef}>{u.src} · {z.zdroje.length}</h3>
            <ol className="zv-src">
              {z.zdroje.map((r, i) => {
                const href = sourceHref(r);
                return (
                  <li key={i}>
                    <b>{r.a}</b> ({r.r}) · {r.t} · <i>{r.j}</i>
                    {href && <> · <a href={href} target="_blank" rel="noopener noreferrer">{r.doi ? 'doi' : 'link'}</a></>}
                  </li>
                );
              })}
            </ol>
          </section>}

          {z.rel.length > 0 && <section className="zv-box">
            <h3 className="zv-sec">{u.rel}</h3>
            <div className="zv-rel">
              {z.rel.map(id => {
                const r = all.find(a => a.id === id);
                return r ? <button key={id} type="button" className="zv-chip" onClick={() => onOpen(id)}>{pickText(r, lang).t} ›</button> : null;
              })}
            </div>
          </section>}

          <section className="zv-box zv-box--you">
          <h3 className="zv-sec">{u.contrib}</h3>
          {/* Z troch tlačidiel jedno (Matej 3. 10.): NAVRHNÚŤ ZMENU → druh návrhu + text → AINUBIS posúdi. */}
          <button type="button" className={`zv-prop${propOpen ? ' is-open' : ''}`} onClick={() => { setPropOpen(v => !v); setPropSent(false); }}>
            <HandPencil size={14} />{u.cEdit}
          </button>
          {propOpen && !propSent && (
            <form className="zv-cform" onSubmit={(e) => { e.preventDefault(); if (prop.trim()) { addProposal(z.id, kind, prop.trim()); setProp(''); setPropSent(true); } }}>
              <div className="zv-kinds" style={{ alignSelf: 'stretch' }}>
                {(['add', 'wrong', 'own'] as ProposalKind[]).map((k, i) => (
                  <button key={k} type="button" className={`zv-kind${kind === k ? ' is-on' : ''}`} onClick={() => setKind(k)}>
                    {k === 'add' ? <HandPlus size={12} /> : k === 'wrong' ? <HandAlert size={12} /> : <HandPencil size={12} />} {u.kinds[i]}
                  </button>
                ))}
              </div>
              <textarea value={prop} onChange={(e) => setProp(e.target.value)} placeholder={u.propPh} rows={3} />
              <button type="submit" className="zv-chip" disabled={!prop.trim()}>{u.propSend}</button>
            </form>
          )}
          {propSent && <div className="zv-ok">{u.propOk}</div>}
          </section>

          <button type="button" className={`zv-done${s === 2 ? ' is-done' : ''}`} onClick={() => markScroll(z.id, 2)}>
            <b>{s === 2 && <HandCheck size={12} />} {s === 2 ? u.doneOk : u.done}</b>
            {s !== 2 && <small>{u.doneSub}</small>}
          </button>

          {/* DISKUSIA — komentáre k celému článku, „ako také fórum" (Matej 3. 10.).
              Od 6. 10. 2026 v DB: príspevok v `posts` so ŠTÍTKOM `vault` (lock /pack §4.3),
              vidia ho všetci členovia — `vaultScrolls.ts` § diskusia. */}
          <section className="zv-box zv-box--talk" ref={talkRef}>
            <h3 className="zv-sec">{u.talk}{talkList.length > 0 && ` · ${talkList.length}`}</h3>
            {talkList.length === 0 && <div className="zv-add">{u.talkNone}</div>}
            {talkList.map((c, i) => (
              <div key={c.id ?? i} className="zv-cmt">
                {/* Autor z DB (`list_vault_talk`) — meno z profilu, inak z psa; bez účtu „Ty". */}
                <span className="zv-cav">{c.avatar ? <img src={c.avatar} alt="" /> : (c.mine === false ? c.author || '?' : u.you).slice(0, 1)}</span>
                <div><b>{c.mine === false ? c.author || '—' : u.you}</b> <small>{new Date(c.at).toLocaleDateString(lang)}</small>{c.text && <p>{c.text}</p>}
                  {c.img && <img className="zv-cimg" src={c.img} alt="" />}
                  {/* Lajk komentára s počtom od všetkých (`post_marks`). */}
                  <div className="zv-crow">
                    <button type="button" className={`zv-clike${c.liked ? ' is-on' : ''}`} onClick={() => toggleTalkLike(z.id, i)} aria-label={u.like}>
                      <HandHeart size={16} on={!!c.liked} />{c.likes ?? (c.liked ? 1 : 0)}
                    </button>
                    {/* Mazanie VLASTNÉHO komentára (Matej 6. 10.: „musí to fungovať"). Dva kroky
                        priamo v riadku — systémové okno `confirm()` by zablokovalo appku. */}
                    {c.mine !== false && (delAsk === i ? (
                      <span className="zv-cdel-ask">{u.delAsk}
                        <button type="button" className="zv-cdel is-go" onClick={() => { setDelAsk(null); void deleteTalk(z.id, i); }}>{u.del}</button>
                        <button type="button" className="zv-cdel" onClick={() => setDelAsk(null)}>{u.delNo}</button>
                      </span>
                    ) : (
                      <button type="button" className="zv-cdel" onClick={() => setDelAsk(i)} aria-label={u.del}><HandTrash size={16} /></button>
                    ))}
                  </div>
                </div></div>
            ))}
            <form className="zv-cform" onSubmit={(e) => {
              e.preventDefault();
              if (sending || (!draft.trim() && !pic)) return;
              setSending(true);
              // Text sa zmaže až keď DB zápis prešiel — inak by sa pri chybe stratil.
              void addTalk(z.id, draft.trim(), pic || undefined).then((ok) => { if (ok) { setDraft(''); setPic(''); } setSending(false); });
            }}>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={u.talkPh} rows={2} />
              {pic && <img className="zv-cprev" src={pic} alt="" />}
              <div className="zv-crow">
                <label className="zv-cpic"><HandCamera size={16} />{u.photo}
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) shrinkPhoto(f).then(setPic).catch(() => undefined); e.target.value = ''; }} />
                </label>
                <button type="submit" className="zv-chip" disabled={sending || (!draft.trim() && !pic)}>{u.talkSend}</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
