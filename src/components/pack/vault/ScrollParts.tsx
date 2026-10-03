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
import { PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { AINUBIS, AI_GLASS, BRAIN_STATE } from '@/components/pack/ainubisSkin';
import { HandPaw, HandStar, HandPlus, HandForward, HandCheck, HandPencil, HandAlert } from '@/components/pack/HandIcons';

/** Kresba z kitu `/icons/pack/` cez masku (ten istý zápis ako v PackAinubis). */
const Ic = ({ ic }: { ic: string }) => (
  <i className="zv-ic" aria-hidden style={{ WebkitMaskImage: `url(/icons/pack/${ic}.svg)`, maskImage: `url(/icons/pack/${ic}.svg)` }} />
);
import { BackButton } from '@/components/pack/BackButton';
import {
  type DemoScroll, pickText, pickPod, sourceHref, fmtSec, scrollLang,
  markScroll, useScrollState, toggleSaved, useSaved, useTalk, addTalk,
} from './vaultScrollDemo';

// ── texty rozhrania: základ EN/SK/CZ ako obsah VAULTU ───────────────────────
const UI = {
  sk: {
    scroll: 'Zvitok', min: 'min', read: 'Prečítať znalosť', listen: 'Vypočuť podcast', pod: 'Podcast', src: 'Zdroje',
    sd: 'Dôkaz', sdName: ['', 'C · tradícia, skúsenosť, legenda', 'B · veda + výklad, alebo zatiaľ málo štúdií', 'A · zmerané, vedci sa zhodujú'],
    like: 'Páči sa', save: 'Uložiť', share: 'Zdieľať', talk: 'Diskusia', readDone: 'Prečítané',
    talkNone: 'Zatiaľ tu nikto nenapísal. Začni ty — otázka, skúsenosť, nesúhlas.', talkPh: 'Napíš do diskusie…', talkSend: 'Pridať', you: 'Ty',
    back: 'Späť', podWho: 'Matej sa pýta, AINUBIS odpovedá', added: 'Doplnené',
    addedNone: 'Zatiaľ nič nové. Keď pribudne poznatok, ktorý nie je v podcaste, zapíše sa sem s dátumom.',
    rel: 'Súvisí', contrib: 'Prispej', cAdd: 'Pridať znalosť', cEdit: 'Navrhnúť zmenu', cFlag: 'Nahlásiť chybu',
    done: 'Prečítané — zapíš do mozgu', doneSub: 'krúžok zozelenie a zrno v mozgu sa rozsvieti',
    doneOk: 'Zapísané do mozgu', copied: 'Odkaz skopírovaný',
  },
  cs: {
    scroll: 'Svitek', min: 'min', read: 'Přečíst znalost', listen: 'Poslechnout podcast', pod: 'Podcast', src: 'Zdroje',
    sd: 'Důkaz', sdName: ['', 'C · tradice, zkušenost, legenda', 'B · věda + výklad, nebo zatím málo studií', 'A · změřeno, vědci se shodují'],
    like: 'Líbí se', save: 'Uložit', share: 'Sdílet', talk: 'Diskuse', readDone: 'Přečteno',
    talkNone: 'Zatím tu nikdo nenapsal. Začni ty — otázka, zkušenost, nesouhlas.', talkPh: 'Napiš do diskuse…', talkSend: 'Přidat', you: 'Ty',
    back: 'Zpět', podWho: 'Matej se ptá, AINUBIS odpovídá', added: 'Doplněno',
    addedNone: 'Zatím nic nového. Když přibude poznatek, který není v podcastu, zapíše se sem s datem.',
    rel: 'Souvisí', contrib: 'Přispěj', cAdd: 'Přidat znalost', cEdit: 'Navrhnout změnu', cFlag: 'Nahlásit chybu',
    done: 'Přečteno — zapiš do mozku', doneSub: 'kroužek zezelená a zrno v mozku se rozsvítí',
    doneOk: 'Zapsáno do mozku', copied: 'Odkaz zkopírován',
  },
  en: {
    scroll: 'Scroll', min: 'min', read: 'Read the knowledge', listen: 'Listen to the podcast', pod: 'Podcast', src: 'Sources',
    sd: 'Evidence', sdName: ['', 'C · tradition, experience, legend', 'B · science + interpretation, or few studies yet', 'A · measured, scientists agree'],
    like: 'Like', save: 'Save', share: 'Share', talk: 'Discussion', readDone: 'Read',
    talkNone: 'Nobody has written here yet. Start — a question, an experience, a disagreement.', talkPh: 'Write to the discussion…', talkSend: 'Post', you: 'You',
    back: 'Back', podWho: 'Matej asks, AINUBIS answers', added: 'Added',
    addedNone: 'Nothing new yet. When a finding that is not in the podcast arrives, it is written here with a date.',
    rel: 'Related', contrib: 'Contribute', cAdd: 'Add knowledge', cEdit: 'Suggest a change', cFlag: 'Report a mistake',
    done: 'Read — write it into the brain', doneSub: 'the ring turns green and the grain lights up',
    doneOk: 'Written into the brain', copied: 'Link copied',
  },
};
export const scrollUI = (lang: string) => UI[scrollLang(lang) as keyof typeof UI];

/** Známka dôkazu ako v medicíne (úroveň dôkazov A/B/C), Matej 3. 10.: „možno ABC? stupnica?“ — sd 3/2/1 → A/B/C. */
const GRADE = ['', 'C', 'B', 'A'];
/** Ružová diskusie — NOVÁ farba mimo palety AINUBISA (Matej 3. 10.), kým ju nepotvrdí. */
const ZV_PINK = '#FF8AC8';

export const SCROLL_CSS = `
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
.zv-act[data-k="like"]{color:${AINUBIS.cyan};filter:drop-shadow(0 0 4px rgba(${AINUBIS.cyanRGB},0.7));}
.zv-act[data-k="save"]{color:${AINUBIS.ctaA};}
.zv-act[data-k="talk"]{color:${ZV_PINK};}
.zv-act[data-k="share"]{color:var(--zv-read);}
.zv-act.is-on{opacity:1;filter:drop-shadow(0 0 6px currentColor) drop-shadow(0 0 2px currentColor);}
.zv-act .zv-ic{margin-right:0;width:20px;height:20px;}
/* SILA DÔKAZU */
.zv-sd{position:relative;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex:0 0 auto;
  border-radius:${PACK_R.field}px;font:700 ${PACK_TEXT.lead}px ${FONT_TITLE};cursor:help;
  color:var(--zv-g);border:1px solid var(--zv-g);background:var(--zv-gt);}
.zv-sd[data-g="A"]{--zv-g:rgb(${BRAIN_STATE.read});--zv-gt:rgba(${BRAIN_STATE.read},0.14);}
.zv-sd[data-g="B"]{--zv-g:rgb(${BRAIN_STATE.seen});--zv-gt:rgba(${BRAIN_STATE.seen},0.14);}
.zv-sd[data-g="C"]{--zv-g:${AINUBIS.inkDim};--zv-gt:${AINUBIS.surface};}
.zv-sd .zv-tip{top:36px;left:0;}
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
.zv-wrap{max-width:832px;margin:0 auto;padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px calc(var(--pack-nav-h, 112px) + ${PACK_SPACE.xl}px);}
.zv-back{margin-bottom:${PACK_SPACE.md}px;}
.zv-top{display:grid;grid-template-columns:1fr;gap:${PACK_SPACE.lg}px;}
@media (min-width:768px){.zv-top{grid-template-columns:280px 1fr;}}
.zv-hero img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${PACK_R.tile}px;}
.zv-head{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:${PACK_SPACE.sm}px;min-width:0;}
.zv-meta{font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.cyan};padding-right:${PACK_SPACE.xl}px;}
.zv-h{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;line-height:1.2;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;overflow-wrap:anywhere;}
.zv-v{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.6;color:${AINUBIS.inkDim};}
.zv-pod{align-self:stretch;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;${AI_GLASS}}
.zv-pod small{display:block;margin-bottom:${PACK_SPACE.sm}px;font-size:${PACK_TEXT.label}px;color:${AINUBIS.inkDim};}
.zv-pod audio{display:block;width:100%;height:40px;}
.zv-body{margin-top:${PACK_SPACE.xl}px;max-width:760px;font-size:${PACK_TEXT.lead}px;line-height:1.75;}
.zv-body p{margin:0 0 ${PACK_SPACE.md}px;}
.zv-body ul{margin:0 0 ${PACK_SPACE.md}px;padding-left:${PACK_SPACE.lg}px;}
.zv-body li{margin-bottom:${PACK_SPACE.xs}px;}
.zv-box{margin-top:${PACK_SPACE.lg}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.card}px;${AI_GLASS}
  border-top:2px solid var(--zv-bx, ${AINUBIS.cyan});}
.zv-box .zv-sec{margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.lead}px;color:var(--zv-bx, ${AINUBIS.cyan});
  background:linear-gradient(90deg, var(--zv-bx, ${AINUBIS.cyan}) 0%, transparent 60%) left bottom / 100% 1px no-repeat;}
.zv-box--src{--zv-bx:${AINUBIS.ctaA};}
.zv-box--add{--zv-bx:${AINUBIS.aiInk};}
.zv-box--you{--zv-bx:rgb(${BRAIN_STATE.read});}
.zv-box--talk{--zv-bx:${AINUBIS.cyan};}
.zv-cmt{display:flex;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px 0;border-bottom:1px solid ${AINUBIS.edge};font-size:${PACK_TEXT.body}px;}
.zv-cmt p{margin:${PACK_SPACE.xs}px 0 0;color:${AINUBIS.inkDim};}
.zv-cmt small{color:${AINUBIS.inkFaint};font-size:${PACK_TEXT.micro}px;}
.zv-cav{width:28px;height:28px;flex:0 0 auto;border-radius:${PACK_R.pill}px;display:flex;align-items:center;justify-content:center;
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

export function EvidenceBadge({ sd, lang }: { sd: number; lang: string }) {
  const u = scrollUI(lang);
  if (!sd) return null;
  return (
    <span className="zv-sd" data-g={GRADE[sd]} tabIndex={0} aria-label={`${u.sd} ${u.sdName[sd]}`}>
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
  const talk = useTalk(id).length;
  const [liked, setLiked] = useState(false);
  return (
    <div className="zv-acts">
      <button type="button" data-k="like" className={`zv-act${liked ? ' is-on' : ''}`} onClick={() => setLiked(v => !v)} aria-label={u.like}><HandPaw size={20} /></button>
      <button type="button" data-k="save" className={`zv-act${saved ? ' is-on' : ''}`} onClick={() => toggleSaved(id)} aria-label={u.save}><HandStar size={20} /></button>
      <button type="button" data-k="talk" className="zv-act" onClick={onTalk} aria-label={u.talk}><Ic ic="chat" />{talk > 0 && talk}</button>
      <button type="button" data-k="share" className="zv-act" onClick={onShare} aria-label={u.share}><HandForward size={20} /></button>
    </div>
  );
}

/** Karta zvitku v zozname. Videné = karta aspoň 2 s z polovice na obrazovke. */
export function ScrollCard({ z, lang, onOpen, onShare }: {
  z: DemoScroll; lang: string;
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
    <article ref={ref} className="akv-zv">
      <div className="akv-zvimg">
        {z.img && <img src={z.img} alt="" loading="lazy" onClick={() => onOpen(z.id)} />}
        <ScrollActions id={z.id} lang={lang} onShare={() => onShare(z.id)} onTalk={() => onOpen(z.id, 'talk')} />
      </div>
      <div className="akv-zvt">
        <div className="zv-mid">
          <span className="akv-zvlbl">{u.scroll} {z.n} / {z.total} · {x.min} {u.min}</span>
          <div className="zv-hl"><h3 className="akv-zvn">{x.t}</h3><EvidenceBadge sd={z.sd} lang={lang} /></div>
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
function StoryBody({ d }: { d: string }) {
  const blocks = d.split(/\n\n+/);
  return (
    <>
      {blocks.map((b, i) => {
        if (b.startsWith('▸')) return <h3 key={i} className="zv-sec">{b.replace(/^▸\s*/, '')}</h3>;
        const lines = b.split('\n');
        const list = lines.filter(l => /^[–-]\s/.test(l));
        if (list.length) {
          const head = lines.filter(l => !/^[–-]\s/.test(l));
          return (
            <div key={i}>
              {head.length > 0 && <p>{head.join(' ')}</p>}
              <ul>{list.map((l, j) => <li key={j}>{l.replace(/^[–-]\s/, '')}</li>)}</ul>
            </div>
          );
        }
        return <p key={i}>{b}</p>;
      })}
    </>
  );
}

/** Článok zvitku — vrstva nad VAULTOM s vlastnou adresou. */
export function ScrollView({ z, all, lang, focus, onClose, onOpen, onUse, onShare }: {
  z: DemoScroll; all: DemoScroll[]; lang: string; focus?: string | null;
  onClose: () => void; onOpen: (id: string) => void; onUse: () => void; onShare: (id: string) => void;
}) {
  const u = scrollUI(lang);
  const x = pickText(z, lang);
  const pod = pickPod(z, lang);
  const s = useScrollState()[z.id] || 0;
  const talkList = useTalk(z.id);
  const [draft, setDraft] = useState('');
  const veil = useRef<HTMLDivElement>(null);
  const podRef = useRef<HTMLDivElement>(null);
  const srcRef = useRef<HTMLHeadingElement>(null);
  const talkRef = useRef<HTMLElement>(null);

  // Otvorenie článku = videné. Telo pod vrstvou nescrolluje (kôš 2, ako StoryView).
  useEffect(() => { markScroll(z.id, 1); }, [z.id]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => {
    veil.current?.scrollTo({ top: 0 });
    const el = focus === 'pod' ? podRef.current : focus === 'src' ? srcRef.current : focus === 'talk' ? talkRef.current : null;
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }, [z.id, focus]);

  const onTime = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const a = e.currentTarget;
    if (a.duration && a.currentTime / a.duration >= 0.9) markScroll(z.id, 2);
  };

  return (
    <div className="zv-veil" ref={veil} role="dialog" aria-modal="true" aria-label={x.t}>
      <div className="zv-wrap">
        <BackButton tone="pale" onClick={onClose} label={u.back} className="zv-back" />
        <div className="zv-top">
          <div className="zv-hero">
            {z.img && <img src={z.img} alt="" />}
            <ScrollActions id={z.id} lang={lang} onShare={() => onShare(z.id)} onTalk={() => talkRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
          </div>
          <div className="zv-head">
            <span className="zv-meta">{z.circle} · {u.scroll} {z.n}/{z.total} · {x.min} {u.min}</span>
            <div className="zv-hl" style={{ alignSelf: 'stretch' }}><h1 className="zv-h">{x.t}</h1><EvidenceBadge sd={z.sd} lang={lang} /></div>
            <span className="zv-rule" aria-hidden />
            {s === 2 && <span className="zv-badge"><HandCheck size={14} />{u.readDone}</span>}
            <p className="zv-v">{x.v}</p>
            {x.vz && <div className="zv-take">{x.vz}</div>}
            {pod && (
              <div className="zv-pod" ref={podRef}>
                <small><Ic ic="play" />{u.podWho} · {fmtSec(pod.sec)}</small>
                <audio controls preload="none" src={pod.src} onTimeUpdate={onTime} onEnded={() => markScroll(z.id, 2)} />
              </div>
            )}
          </div>
        </div>

        <div className="zv-body">
          <StoryBody d={x.d} />

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
          <div className="zv-rel">
            <button type="button" className="zv-chip zv-chip--dash" onClick={onUse}><HandPlus size={12} />{u.cAdd}</button>
            <button type="button" className="zv-chip zv-chip--dash" onClick={onUse}><HandPencil size={12} />{u.cEdit}</button>
            <button type="button" className="zv-chip zv-chip--dash" onClick={onUse}><HandAlert size={12} />{u.cFlag}</button>
          </div>
          </section>

          <button type="button" className={`zv-done${s === 2 ? ' is-done' : ''}`} onClick={() => markScroll(z.id, 2)}>
            <b>{s === 2 && <HandCheck size={12} />} {s === 2 ? u.doneOk : u.done}</b>
            {s !== 2 && <small>{u.doneSub}</small>}
          </button>

          {/* DISKUSIA — komentáre k celému článku, „ako také fórum" (Matej 3. 10.).
              ⚠️ DEV: drží ich len prehliadač; naostro patria do tabuliek VAULTU (BLOK 2). */}
          <section className="zv-box zv-box--talk" ref={talkRef}>
            <h3 className="zv-sec">{u.talk}{talkList.length > 0 && ` · ${talkList.length}`}</h3>
            {talkList.length === 0 && <div className="zv-add">{u.talkNone}</div>}
            {talkList.map((c, i) => (
              <div key={i} className="zv-cmt"><span className="zv-cav">{u.you.slice(0, 1)}</span>
                <div><b>{u.you}</b> <small>{new Date(c.at).toLocaleDateString(lang)}</small><p>{c.text}</p></div></div>
            ))}
            <form className="zv-cform" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { addTalk(z.id, draft.trim()); setDraft(''); } }}>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={u.talkPh} rows={2} />
              <button type="submit" className="zv-chip" disabled={!draft.trim()}>{u.talkSend}</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
