// ════════════════════════════════════════════════════════════════════════════
// AINUBIS · ROVINA CHAT — MAKETA (23. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Nákres `plany/nakres-vault-fasada-v5-2026-09-20.html`, rovina 2 (riadky
// 487–700 CSS, 1017–1056 markup). Matej 23. 9.: *„pri ainubisovi začať chat
// otvorí ai chat — kde je vidno aj história atď to tiež musíme postaviť len
// ako maketu"* a *„nakres uz sme robili vo v5"*.
//
// 🔴 ŽIVÝ CHAT SA NEDOTKOL. Panel `AinubisWidget` beží naostro (korpus
//    `ainubis_kb_*`, Edge Function `ainubis-chat`) a ostáva jediným skutočným
//    vstupom. Maketa žije za `import.meta.env.DEV` — v produkčnom builde sa
//    rovina CHAT chová presne ako doteraz a otvára widget.
//    [[feedback_rozostavanu_vec_stavaj_za_zamknute_dvere]]
//
// ČO MAKETA DOKAZUJE (a prečo nie je kópia Claude):
//   · pás histórie vľavo, nový rozhovor jedným klikom, rozhovory po dňoch
//   · ODPOVEĎ MÁ PÔVOD — `ODKIAĽ TO VIEM` nad mozgom vymenuje zvitky, z ktorých
//     odpoveď je. Claude má napravo prázdno; my tam máme dôkaz.
//   · JEDNA hlavná akcia odpovede: `ZAPÍSAŤ DO DOG ID`. Matej 20. 9.: „aplikovať
//     pre psa" a „uložiť do protokolu" boli DVE MENÁ PRE JEDNO; protokol = DOG ID
//     a to je locknuté názvoslovie.
//
// ⚠️ ŠÍRKA: lock `pack-dizajn-system.md` drží centrovaný obsah na 832 px, ale
//    výslovne z neho vyníma chat AINUBISA („jeho kostru Matej neschválil").
//    Vlákno má preto meranú šírku 760 (telo článku), nie 832 — inak by odpoveď
//    na 27" mala 1 400 px a čítala by sa ako tabuľka.
// ⚠️ ČÍSLA SÚ ZO STUPNÍC `PACK_*`. Nákres má 9px popisky a vlastné premenné;
//    mikropopisok je v appke 10 (`PACK_TEXT.micro`) — stráž `check:pack` meria.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import {
  PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import {
  DEMO_CHATS, DEMO_SCROLLS, DEMO_CONTEXT,
  type DemoChat, type DemoMessage, type DemoAnswer,
} from './vaultChatDemo';

/** Šírka pásu histórie na PC. Užší by neuniesol názov rozhovoru na jeden riadok. */
const RAIL_W = 260;
/** Šírka mozgu v rovine CHAT (nákres: 380). Mozog tu nie je hlavný, je dôkaz. */
const BRAIN_W = 380;
/** Meraná šírka vlákna — telo článku z locku, nie šírka obrazovky. */
const THREAD_W = 760;

export const VAULT_CHAT_CSS = `
/* ── PÁS HISTÓRIE ──────────────────────────────────────────────────────────
   Z Claude si berieme pás vľavo, nový rozhovor jedným klikom, zoskupenie po
   dňoch a hľadanie v nich. Neberieme si prázdnu pravú plochu. */
.akc-rail{position:absolute;z-index:4;left:0;top:0;bottom:0;width:min(84vw,${RAIL_W}px);
  display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;
  background:${AINUBIS.surfaceBase};border-right:1px solid ${AINUBIS.edge};
  transform:translateX(-101%);transition:transform 180ms ease;}
.akv-root[data-rail="open"] .akc-rail{transform:none;}
.akc-railhd{padding:${PACK_SPACE.xl}px ${PACK_SPACE.md}px 0;
  display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
/* NOVÝ ROZHOVOR je jediné plné CTA v páse — AINUBISOVA zlato-oranžová, nie
   lapis: toto je jeho povrch a on má vlastný brand. */
.akc-new{width:100%;padding:${PACK_SPACE.md}px;border:0;border-radius:${PACK_R.field}px;cursor:pointer;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;line-height:1;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;
  background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};box-shadow:${AINUBIS.ctaShadow};}
.akc-new:hover{background:${AINUBIS.ctaGradHover};}
.akc-srch{margin:${PACK_SPACE.md}px ${PACK_SPACE.md}px 0;display:flex;align-items:center;
  gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};}
.akc-srch input{flex:1;min-width:0;border:0;background:none;outline:0;color:${AINUBIS.ink};
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;}
.akc-srch input::placeholder{color:${AINUBIS.inkFaint};}
.akc-list{min-height:0;overflow-y:auto;overscroll-behavior:contain;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;
  display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.akc-day{padding:${PACK_SPACE.md}px ${PACK_SPACE.sm}px ${PACK_SPACE.xs}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akc-item{display:block;width:100%;text-align:left;cursor:pointer;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid transparent;background:none;color:${AINUBIS.inkDim};}
.akc-item b{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;
  line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.akc-item em{font-style:normal;font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  color:${AINUBIS.inkFaint};}
.akc-item:hover{background:rgba(${AINUBIS.cyanRGB},0.08);}
/* VÝBER = PRIESVITNÝ TINT. Plná plocha patrí jedinému CTA (brand). */
.akc-item[aria-current="true"]{background:rgba(${AINUBIS.cyanRGB},0.14);
  border-color:${AINUBIS.edge};color:${AINUBIS.cyan};}
/* PÄTA PÁSU — identita a moje príspevky. Vo VAULTE to nesie horná lišta; v chate
   lišta na mobile mizne (kôš 3), takže postup musí byť tu. */
.akc-foot{border-top:1px solid ${AINUBIS.edge};padding:${PACK_SPACE.md}px;
  display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.akc-mine{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;width:100%;text-align:left;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.field}px;cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;
  border:1px dashed ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};color:${AINUBIS.inkDim};}
.akc-mine b{margin-left:auto;color:${AINUBIS.ctaA};font-weight:600;}
.akc-me{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;
  font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkFaint};}

/* ── VLÁKNO ────────────────────────────────────────────────────────────── */
.akc-thread{position:absolute;z-index:3;inset:0;display:grid;
  grid-template-rows:auto minmax(0,1fr) auto;background:${AINUBIS.surfaceBase};
  padding-top:var(--akv-top-h,112px);}
/* PÁS KONTEXTU — čo má AINUBIS pred sebou, keď odpovedá. Bez neho je to
   všeobecný chatbot; s ním je vidieť, že pozná Hektora. */
.akc-ctx{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;flex-wrap:wrap;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;border-bottom:1px solid ${AINUBIS.edge};
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akc-ctx b{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  font-weight:500;letter-spacing:0.02em;text-transform:none;font-size:${PACK_TEXT.label}px;
  color:${AINUBIS.ink};border:1px solid ${AINUBIS.edge};background:rgba(${AINUBIS.cyanRGB},0.08);}
.akc-railbtn{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;border:1px solid ${AINUBIS.edge};background:none;color:${AINUBIS.cyan};}
.akc-msgs{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:${PACK_SPACE.lg}px;}
/* ⚠️ VLÁKNO MÁ MERANÚ ŠÍRKU — stĺpec rastie s oknom, riadok odpovede nie. */
.akc-in{max-width:${THREAD_W}px;margin:0 auto;display:flex;flex-direction:column;gap:${PACK_SPACE.xl}px;}
.akc-me-msg{align-self:flex-end;max-width:82%;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;
  border-radius:${PACK_R.card}px;border-bottom-right-radius:${PACK_R.field}px;
  font-size:${PACK_TEXT.body}px;color:${AINUBIS.ink};
  background:rgba(${AINUBIS.cyanRGB},0.14);border:1px solid ${AINUBIS.edge};}
.akc-ai{align-self:stretch;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.akc-aihd{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.section.letterSpacing};color:${AINUBIS.inkFaint};}
.akc-aihd i{font-style:normal;color:${AINUBIS.aiInk};}
.akc-body{padding:${PACK_SPACE.lg}px;border-radius:${PACK_R.card}px;border-top-left-radius:${PACK_R.field}px;
  font-size:${PACK_TEXT.body}px;color:${AINUBIS.inkDim};
  background:${AINUBIS.raised};border:1px solid ${AINUBIS.edge};}
.akc-body p{margin:0 0 ${PACK_SPACE.md}px;}
.akc-body p:last-of-type{margin:0;}
.akc-body b{color:${AINUBIS.ink};font-weight:500;}
/* RADA — jedna vec, ktorú má človek urobiť. Zlatá, lebo je to výzva, nie fakt. */
.akc-advice{margin-top:${PACK_SPACE.md}px;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};
  font-size:${PACK_TEXT.body}px;color:${AINUBIS.ink};}
.akc-advice b{display:block;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;
  color:${AINUBIS.ctaA};margin-bottom:${PACK_SPACE.sm}px;}
/* ZDROJ — riadok pod odpoveďou. Klik rozsvieti zvitky v mozgu vpravo. */
.akc-srcrow{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;flex-wrap:wrap;
  margin-top:${PACK_SPACE.md}px;padding-top:${PACK_SPACE.md}px;border-top:1px solid ${AINUBIS.edge};
  font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akc-srcrow button{padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;line-height:1.2;
  letter-spacing:0.02em;text-transform:none;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.cyan};}
.akc-srcrow button:hover{background:rgba(${AINUBIS.cyanRGB},0.12);}
.akc-acts{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.akc-act{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.inkDim};}
.akc-act:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}
/* HLAVNÁ AKCIA ODPOVEDE — jediná plná v bloku (protokol = DOG ID, lock). */
.akc-act.is-main{border:0;background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};font-weight:600;}
.akc-act.is-main:hover{background:${AINUBIS.ctaGradHover};color:${AINUBIS.ctaInk};}

/* ── PÍSACIE POLE + „+" (prispievanie do mozgu) ───────────────────────── */
/* ⚠️ SPODNÁ LIŠTA TU OSTÁVA. Lock hovorí, že v rovine CHAT je to kôš 3 a lišta
   mizne — lenže AINUBIS je MIESTO chrbtice a lišta je v ňom vidno vždy. Kým sa
   to nerozhodne nad maketou, pole sa o lištu odsadí; inak si sadne pod ňu.
   Výšku lišty NEOPISUJEM — publikuje ju nav ako --pack-nav-h.
   (Spätné apostrofy v tomto komentári NIE SÚ: sme v template literáli a ukončili
    by ho — presne to, čo stráž check:css hľadá.) */
.akc-ask{position:relative;border-top:1px solid ${AINUBIS.edge};
  padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px
    calc(env(safe-area-inset-bottom,0px) + var(--pack-nav-h,64px) + ${PACK_SPACE.xl}px);}
.akc-askin{max-width:${THREAD_W}px;margin:0 auto;display:flex;gap:${PACK_SPACE.sm}px;align-items:flex-end;}
.akc-ask textarea{flex:1;min-width:0;resize:none;height:44px;padding:${PACK_SPACE.md}px;
  border-radius:${PACK_R.tile}px;border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};
  color:${AINUBIS.ink};font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;line-height:1.4;outline:0;}
.akc-ask textarea::placeholder{color:${AINUBIS.inkFaint};}
.akc-plus,.akc-send{width:44px;height:44px;flex:0 0 44px;border-radius:${PACK_R.tile}px;cursor:pointer;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.cyan};
  font-size:${PACK_TEXT.h2}px;line-height:1;}
.akc-plus:hover,.akc-send:hover{background:rgba(${AINUBIS.cyanRGB},0.12);}
.akc-ask[data-add="open"] .akc-plus{background:rgba(${AINUBIS.cyanRGB},0.18);border-color:${AINUBIS.edgeStrong};}
/* PONUKA PRISPIEVANIA sa otvára NAHOR — dole je lišta a pod ňou nič nie je. */
.akc-addmenu{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% - ${PACK_SPACE.sm}px);
  width:min(420px,calc(100% - ${2 * PACK_SPACE.lg}px));display:none;flex-direction:column;gap:${PACK_SPACE.xs}px;
  padding:${PACK_SPACE.sm}px;border-radius:${PACK_R.card}px;z-index:6;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.bgDeep};box-shadow:${AINUBIS.panelShadow};}
.akc-ask[data-add="open"] .akc-addmenu{display:flex;}
.akc-amlb{padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;font-family:${FONT_UI};font-weight:600;
  font-size:${PACK_TEXT.micro}px;line-height:1;letter-spacing:${PACK_HEAD.label.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.cyan};}
.akc-ami{display:flex;gap:${PACK_SPACE.md}px;align-items:flex-start;text-align:left;cursor:pointer;
  padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid transparent;background:none;color:${AINUBIS.inkDim};}
.akc-ami:hover{background:rgba(${AINUBIS.cyanRGB},0.08);border-color:${AINUBIS.edge};}
.akc-ami u{text-decoration:none;font-size:${PACK_TEXT.lead}px;line-height:1.2;}
.akc-ami b{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;
  line-height:1.3;color:${AINUBIS.ink};}
.akc-ami em{font-style:normal;font-size:${PACK_TEXT.micro}px;color:${AINUBIS.inkFaint};}

/* ── ODKIAĽ TO VIEM — panel nad mozgom ───────────────────────────────────
   Toto je dôvod, prečo mozog v chate ostáva na obrazovke: odpoveď má viditeľný
   pôvod a klik na zdroj vedie do VAULTU, nie do prázdna. */
.akc-src{position:absolute;z-index:5;left:${PACK_SPACE.md}px;right:${PACK_SPACE.md}px;
  bottom:calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.xxl}px);
  padding:${PACK_SPACE.md}px;border-radius:${PACK_R.card}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.bgDeep};box-shadow:${AINUBIS.panelShadow};}
.akc-src-lb{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;line-height:1;
  letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.cyan};}
.akc-osrc{display:flex;gap:${PACK_SPACE.sm}px;align-items:flex-start;width:100%;text-align:left;cursor:pointer;
  margin-top:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  border:1px solid ${AINUBIS.edge};background:${AINUBIS.raised};color:${AINUBIS.inkDim};}
.akc-osrc:hover{border-color:${AINUBIS.edgeStrong};color:${AINUBIS.cyan};}
.akc-osrc i{font-style:normal;color:${AINUBIS.ctaA};font-size:${PACK_TEXT.label}px;line-height:1.3;}
.akc-osrc b{display:block;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;
  line-height:1.3;color:${AINUBIS.ink};}
.akc-osrc em{font-style:normal;font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkFaint};}
.akc-onote{margin-top:${PACK_SPACE.sm}px;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.inkFaint};}

/* MOBIL: panel zdrojov sa NEKRESLÍ — mozog je pod vláknom neviditeľný, takže by
   panel visel nad chatom a tvrdil niečo o ploche, ktorú nevidno. Zdroje nesie
   riadok 'from' priamo pod odpoveďou. */
@media (max-width:1023px){
  .akc-src{display:none;}
}

/* ── PC: PÁS · VLÁKNO · MOZOG ─────────────────────────────────────────────
   Tu sa rozloženie líši od VAULTU (40/60): mozog je v chate DÔKAZ, nie hlavná
   plocha, tak sa zúži na ${BRAIN_W} px a miesto dostane vlákno. */
@media (min-width:1024px){
  .akv-root[data-plane="chat"] .akc-rail{transform:none;}
  .akv-root[data-plane="chat"] .akc-thread{left:${RAIL_W}px;right:${BRAIN_W}px;
    padding-top:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.xl}px);}
  .akv-root[data-plane="chat"] .akv-brain{left:auto;right:0;width:${BRAIN_W}px;
    border-left:1px solid ${AINUBIS.edge};}
  .akv-root[data-plane="chat"] .akc-railbtn{display:none;}
  /* Horný pás patrí mozgu; v chate by nad 380 px stĺpcom nemal kam. */
  .akv-root[data-plane="chat"] .akv-top{display:none;}
}
`;

const isMe = (m: DemoMessage): m is { me: string } => 'me' in m;

/**
 * Rovina CHAT — pás histórie + vlákno + písacie pole.
 * Zdroje poslednej odpovede hlási hore cez `onSources`, aby ich panel nad
 * mozgom mohol vykresliť `VaultChatSources`. Panel nie je vnútri vlákna
 * zámerne: patrí k mozgu, nie k odpovedi.
 */
export function VaultChat({ planes, onSources, onOpenScroll }: {
  /** Prepínač rovín z `PackAinubis` — v chate je ľavým blokom pás histórie. */
  planes?: React.ReactNode;
  onSources: (ids: number[]) => void;
  onOpenScroll?: (id: number) => void;
}) {
  const [chats, setChats] = useState<DemoChat[]>(DEMO_CHATS);
  const [cur, setCur] = useState(DEMO_CHATS[0].id);
  const [q, setQ] = useState('');
  const [add, setAdd] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === cur) ?? chats[0];

  /* Zdroje = zdroje POSLEDNEJ odpovede vo vlákne. Pri prázdnom (novom)
     rozhovore sa panel nad mozgom schová sám — nemá čo svietiť. */
  useEffect(() => {
    const last = [...chat.msgs].reverse().find((m) => !isMe(m)) as { ai: DemoAnswer } | undefined;
    onSources(last ? last.ai.sources : []);
    msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight });
  }, [chat, onSources]);

  const shown = useMemo(() => {
    const nq = q.trim().toLowerCase();
    return nq ? chats.filter((c) => c.title.toLowerCase().includes(nq)) : chats;
  }, [chats, q]);

  const newChat = () => {
    const c: DemoChat = { id: Date.now(), day: 'today', title: 'New conversation', msgs: [] };
    setChats((v) => [c, ...v]);
    setCur(c.id);
    document.querySelector<HTMLElement>('.akv-root')?.removeAttribute('data-rail');
  };

  return (
    <>
      <aside className="akc-rail" aria-label="Conversations">
        <div className="akc-railhd">
          {/* PREPÍNAČ ROVÍN. Na PC žije v ĽAVOM bloku (lock §1.3.1 je o mobile) —
              a ľavý blok je v chate tento pás. Bez neho niet cesty späť do VAULTU. */}
          {planes}
          <button type="button" className="akc-new" onClick={newChat}>+ New conversation</button>
        </div>
        <label className="akc-srch">
          <span aria-hidden>⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…" aria-label="Search conversations" />
        </label>
        <div className="akc-list">
          {shown.map((c, i) => (
            <div key={c.id}>
              {(i === 0 || shown[i - 1].day !== c.day) && <div className="akc-day">{c.day}</div>}
              <button type="button" className="akc-item" aria-current={c.id === cur}
                onClick={() => setCur(c.id)}>
                <b>{c.title}</b>
                <em>{c.msgs.length} messages</em>
              </button>
            </div>
          ))}
          {shown.length === 0 && <div className="akc-day">nothing found</div>}
        </div>
        <div className="akc-foot">
          {/* Prispievanie do mozgu má svoj stav — čaká na Mateja, nie na server. */}
          <button type="button" className="akc-mine">
            <span>my contributions</span><b>2 pending</b>
          </button>
          <div className="akc-me">DEVOTION 2 · 12 / 569 scrolls</div>
        </div>
      </aside>

      <section className="akc-thread" aria-label="Chat">
        <div className="akc-ctx">
          <button type="button" className="akc-railbtn"
            onClick={() => {
              const r = document.querySelector<HTMLElement>('.akv-root');
              if (r) r.dataset.rail = r.dataset.rail === 'open' ? '' : 'open';
            }}>☰ conversations</button>
          <span>knows about</span>
          <b>{DEMO_CONTEXT.dog}</b>
          <b>{DEMO_CONTEXT.dogId}</b>
          <b>{DEMO_CONTEXT.scrolls}</b>
        </div>

        <div className="akc-msgs" ref={msgsRef}>
          <div className="akc-in">
            {chat.msgs.map((m, i) => (isMe(m) ? (
              <div className="akc-me-msg" key={i}>{m.me}</div>
            ) : (
              <div className="akc-ai" key={i}>
                <div className="akc-aihd"><i>AI</i>NUBIS</div>
                <div className="akc-body">
                  {m.ai.paragraphs.map((p, j) => (
                    // Odseky sú NAŠE demo texty, nie vstup od človeka — jediná
                    // značka v nich je <b>. Keď sa maketa napojí na server,
                    // musí sa to nahradiť sanitizáciou alebo štruktúrou.
                    <p key={j} dangerouslySetInnerHTML={{ __html: p }} />
                  ))}
                  <div className="akc-advice"><b>do this</b>{m.ai.advice}</div>
                  <div className="akc-srcrow">
                    <span>from</span>
                    {m.ai.sources.map((s) => (
                      <button type="button" key={s} onClick={() => onOpenScroll?.(s)}>
                        {DEMO_SCROLLS[s].title}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="akc-acts">
                  {/* JEDNA hlavná akcia — protokol = DOG ID (locknuté názvoslovie). */}
                  <button type="button" className="akc-act is-main">Write into DOG ID</button>
                  <button type="button" className="akc-act"><u aria-hidden>🔖</u>Save</button>
                  <button type="button" className="akc-act"><u aria-hidden>↗</u>Share</button>
                </div>
              </div>
            )))}
            {chat.msgs.length === 0 && (
              <div className="akc-me" style={{ justifyContent: 'center', padding: PACK_SPACE.xxl }}>
                Ask anything about your dog — the answer will show where it comes from.
              </div>
            )}
          </div>
        </div>

        <div className="akc-ask" data-add={add ? 'open' : ''}>
          {/* PRISPIEVANIE DO MOZGU — `+` pri poli, nie schované v menu.
              AINUBIS predtriedi, schvaľuje Matej (nákres v5, rozhodnutie 20. 9.). */}
          <div className="akc-addmenu">
            <div className="akc-amlb">add to the brain</div>
            <button type="button" className="akc-ami"><u aria-hidden>📝</u>
              <span><b>Insight or experience</b><em>“I gave my dog x and he felt better”</em></span></button>
            <button type="button" className="akc-ami"><u aria-hidden>🔗</u>
              <span><b>Link</b><em>article, study, thread — AINUBIS reads and judges it</em></span></button>
            <button type="button" className="akc-ami"><u aria-hidden>📕</u>
              <span><b>Book</b><em>photograph the pages or upload a PDF</em></span></button>
            <button type="button" className="akc-ami"><u aria-hidden>🎥</u>
              <span><b>Video</b><em>lecture, breakdown, training demo</em></span></button>
          </div>
          <div className="akc-askin">
            <button type="button" className="akc-plus" aria-label="Add to the brain"
              onClick={() => setAdd((v) => !v)}>+</button>
            <textarea placeholder="Ask anything about your dog…" aria-label="Ask AINUBIS" />
            <button type="button" className="akc-send" aria-label="Send">↑</button>
          </div>
        </div>
      </section>
    </>
  );
}

/** ODKIAĽ TO VIEM — zoznam zvitkov nad mozgom. Prázdny zoznam = žiadny panel. */
export function VaultChatSources({ ids, onOpenScroll }: {
  ids: number[];
  onOpenScroll?: (id: number) => void;
}) {
  if (!ids.length) return null;
  return (
    <div className="akc-src">
      <div className="akc-src-lb">where this comes from</div>
      {ids.map((id) => {
        const s = DEMO_SCROLLS[id];
        return (
          <button type="button" className="akc-osrc" key={id} onClick={() => onOpenScroll?.(id)}>
            <i aria-hidden>🗝</i>
            <span><b>{s.title}</b><em>{s.circle}</em></span>
          </button>
        );
      })}
      <div className="akc-onote">the rest of the brain is dimmed</div>
    </div>
  );
}
