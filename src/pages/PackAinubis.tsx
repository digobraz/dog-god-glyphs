// ════════════════════════════════════════════════════════════════════════════
// AINUBIS — `/pack/ainubis` = VAULT podľa nákresu v5 (2026-09-21)
// ────────────────────────────────────────────────────────────────────────────
// Zadanie `plany/zadanie-ainubis-vault-pristatie-2026-09-21.md`. Nahrádza kostru
// so siedmimi dlaždicami (commity `880f04d`, `33aa5e11`), na ktorú Matej nekývol:
// *„na ničom takom sme sa nedohodli"*. Dohodnuté bolo „AINUBIS pristáva na VAULTE"
// — a VAULT je nákres `plany/nakres-vault-fasada-v5-2026-09-20.html`, nie mriežka.
// Mriežka by sa v novembri zbúrala a ľudia by sa ju medzitým naučili (lock §0).
//
// ČO TU JE — tri osi z locku `architektura-pack.md` §1.3.1:
//   · HORE ROVINA   VAULT · CHAT · (NÁSTENKA čoskoro) — iný obsah
//   · DOLE POHĽAD   MOZOG ⇄ DOGSCROLL — ten istý obsah, iný pohľad (len mobil;
//                   na PC stoja vedľa seba 40 / 60 ako v nákrese a ako mapa + zoznam)
//   · MOZOG         plátno `components/pack/vault/brainEngine.ts` (recept JADRO)
//
// ⚠️ KÔŠ 1 — „SOM DOMA" (lock §3). AINUBIS je miesto chrbtice: lišta je vidno vždy,
//    šípka späť tu NIE JE. CHAT je kôš 3 a otvára ho `ainubisBus` ako doteraz —
//    na mobile je to celoobrazovkový panel, v ktorom lišta mizne.
// ⚠️ OBRAZOVKA JE CELÁ PLOCHA, nie stĺpec. Preto nestojí na `PackLayout` (ten dáva
//    stĺpec `PACK_COL`), ale skladá si shell sama — ten istý vzor ako `PackMap`:
//    `PackBottomNav` + `MessagingOverlayHost` ako súrodenci plochy.
// ⚠️ ŠAT JE AINUBISOV, NIE PAPYRUS. Do `PAPER_ROUTES` routa NEPATRÍ; farby sa
//    NEPÍŠU ručne, berú sa z `AINUBIS.*` (AI-PALUBA v katalógu blokov).
// ⚠️ SVETY SÚ ZAMKNUTÉ V MOZGU, NIE DLAŽDICE. Obsah zatiaľ neexistuje, takže mozog
//    ukazuje tvar, klik na svet vedie na jeho upútavku v DOGSCROLLE a stred (hlava
//    AINUBISA) otvára chat — jediné, čo dnes naozaj žije.
// ✅ ROZHODNUTÉ 22. 9. 2026 (Matej nad `plany/nakres-vault-zamok-2026-09-22.html`):
//    · „dajme B svieti celý svet" — `?zamok` zanikol, mozog svieti vždy,
//    · „správy a oznam by som dal úplne hore a pod to prepínač" + „riadok s ikonkou
//      mena ako máme v /map" → prvý riadok = `PackIdentityBar` s oznamom v strede,
//      druhý = roviny,
//    · „nazvať to dogscroll namiesto vault (vault je celá sekcia)" → prvá ROVINA sa
//      volá DOGSCROLL. Pilulka POHĽADU dole sa preto volá ZOZNAM (vzor mapy: MAPA ⇄
//      ZOZNAM) — dve veci s tým istým menom na jednej obrazovke by si konkurovali.
// 🚩 OTVORENÉ: chat ako rovina hore + stred mozgu ako vstup (postavené podľa odporúčania).
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from 'react';
import { PackBottomNav, MessagingOverlayHost } from '@/components/pack/PackLayout';
import { PackIdentityBar } from '@/components/pack/PackIdentityBar';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import {
  PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { openAinubis } from '@/lib/ainubisBus';
import { useT, useLang } from '@/i18n/LanguageContext';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { VAULT_CIRCLES } from '@/components/pack/vault/circles';
import { mountBrain, type BrainHandle } from '@/components/pack/vault/brainEngine';
import ainubisHead from '@/assets/ainubis-head.png';

/* ⚠️ JEDNA HRANICA — tá istá ako na mape (`PackMap`: ≤1023 = mobilný pohľad
   s pilulkou ZOZNAM). Dve čísla by znamenali šírku, kde má mapa pilulku a VAULT nie. */
const PC_MIN = 1024;
/* Rezerva pod mozgom: lišta + pilulka na mobile, len lišta na PC. Mozog sa centruje
   do plochy nad ňou (nákres: `vol = H - 110`, tam bez lišty). */
const BOTTOM_MOBILE = 160;
const BOTTOM_PC = 112;

const CSS = `
.akv-root{position:fixed;inset:0;overflow:hidden;background:${AINUBIS.surfaceBase};color:${AINUBIS.ink};
  font-family:${FONT_UI};--akv-panel:min(40vw,480px);}
/* Podsvietený displej, nie čierny obdĺžnik — dve mriežky ako v nákrese (.bg .mesh / .mesh8). */
.akv-bg{position:absolute;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(rgba(${AINUBIS.cyanRGB},0.10) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${AINUBIS.cyanRGB},0.10) 1px,transparent 1px);
  background-size:24px 24px,24px 24px,192px 192px,192px 192px;}
.akv-bg::after{content:'';position:absolute;inset:0;
  background:radial-gradient(60vw 60vw at 85% 10%,rgba(${AINUBIS.cyanRGB},0.14),transparent 62%),
             radial-gradient(55vw 55vw at 70% 105%,rgba(${AINUBIS.glowRGB},0.12),transparent 62%);}

/* ── MOZOG ─────────────────────────────────────────────────────────────── */
.akv-brain{position:absolute;inset:0;}
.akv-brain canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;}
.akv-tip{position:absolute;z-index:5;pointer-events:none;opacity:0;transition:opacity 120ms ease;
  transform:translate(-50%,calc(-100% - ${PACK_SPACE.md}px));max-width:260px;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;
  background:${AINUBIS.surface};border:1px solid ${AINUBIS.edgeStrong};box-shadow:${AINUBIS.panelShadow};
  font-size:${PACK_TEXT.label}px;line-height:1.4;color:${AINUBIS.inkDim};}
.akv-tip b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ink};}
.akv-tip u{display:block;text-decoration:none;margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing};text-transform:uppercase;color:${AINUBIS.ctaA};}

/* ── HORNÝ PÁS — ROVINY (vzor .trp-topbar: pás nad DOSTUPNOU šírkou) ────── */
.akv-top{position:absolute;z-index:6;top:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.md}px);
  left:${PACK_SPACE.md}px;right:${PACK_SPACE.md}px;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;
  pointer-events:none;}
.akv-top > *{pointer-events:auto;}
.akv-toprow{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
.akv-planes{flex:1 1 auto;min-width:0;display:flex;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.xs}px;
  border-radius:${PACK_R.pill}px;background:${AINUBIS.surface};border:1px solid ${AINUBIS.edge};
  box-shadow:${AINUBIS.panelShadow};}
.akv-plane{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:${PACK_SPACE.xs}px;
  padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;border:1px solid transparent;
  background:transparent;color:${AINUBIS.inkDim};cursor:pointer;white-space:nowrap;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;}
/* Výber je PRIESVITNÝ TINT, nie plná plocha — AINUBIS vyberá cyanom (ainubisSkin). */
.akv-plane[aria-current="page"]{color:${AINUBIS.ink};background:rgba(${AINUBIS.cyanRGB},0.16);
  border-color:${AINUBIS.edgeStrong};}
.akv-plane:disabled{cursor:default;color:${AINUBIS.inkFaint};}
.akv-plane em{font-style:normal;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing};color:${AINUBIS.inkFaint};}
.akv-when{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:0.02em;
  text-transform:uppercase;color:${AINUBIS.ctaA};background:${AINUBIS.surface};border:1px solid ${AINUBIS.ctaEdge};}
/* ⚠️ .02em, nie .22em: je to PILULKA, nie nadpis (lock dizajn-systému — tesné sledovanie
   patrí pilulkám). Pri .22em sa na 360 px vedľa správ nezmestila a zvonček vytiekol z okna.
   Mobil nesie KRÁTKE znenie (.akv-when-s) — medzi avatarom a zvončekom je ~150 px. */
.akv-when-s{display:none;}
@media (max-width:${PC_MIN - 1}px){
  .akv-when-l{display:none;} .akv-when-s{display:inline;}
  /* Správy a zvonček na 32 px ako v mobilnej hlavičke mapy (PackNotifications má
     rozmery v inline štýle, prebiť sa dá len !important — ten istý precedens). */
  .akv-top .pkid-right button{width:32px!important;height:32px!important;}
}

/* ── DOGSCROLL ─────────────────────────────────────────────────────────── */
.akv-scroll{position:absolute;inset:0;z-index:3;overflow-y:auto;overscroll-behavior:contain;
  background:${AINUBIS.surfaceBase};
  padding:var(--akv-top-h,112px) ${PACK_SPACE.lg}px ${BOTTOM_MOBILE + PACK_SPACE.xl}px;}
.akv-col{max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:${PACK_SPACE.lg}px;}
.akv-head{display:flex;align-items:center;gap:${PACK_SPACE.md}px;}
.akv-face{width:48px;height:48px;flex:0 0 auto;object-fit:cover;border-radius:${PACK_R.pill}px;
  background:${AINUBIS.faceBg};box-shadow:${AINUBIS.faceRing};}
.akv-flag{display:block;margin-bottom:${PACK_SPACE.xs}px;font-family:${FONT_UI};font-weight:500;
  font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.cyan};}
.akv-title{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.1;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ink};}
.akv-claim{margin:${PACK_SPACE.sm}px 0 0;font-size:${PACK_TEXT.body}px;color:${AINUBIS.inkDim};}
.akv-lead{margin:${PACK_SPACE.md}px 0 0;font-size:${PACK_TEXT.body}px;line-height:1.55;color:${AINUBIS.inkDim};}
/* UPÚTAVKA SVETA — tvar budúceho úvodu sveta (.wintro v nákrese), lock §4.1: jedna karta. */
.akv-world{position:relative;text-align:center;scroll-margin-top:var(--akv-top-h,112px);
  padding:${PACK_SPACE.xl}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.card}px;
  background:${AINUBIS.raised}, ${AINUBIS.surface};border:1px solid ${AINUBIS.edge};box-shadow:${AINUBIS.panelShadow};
  transition:border-color 300ms ease;}
.akv-world.is-flash{border-color:${AINUBIS.cyan};}
.akv-wlbl{font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.label.letterSpacing};text-transform:uppercase;color:${AINUBIS.cyan};}
/* IKONKA cez MASKU, nie filter — filter farbu hádá (feedback_filter_aproximuje_masku). */
.akv-wic{width:44px;height:44px;margin:${PACK_SPACE.md}px auto 0;background:${AINUBIS.ctaGrad};
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;
  -webkit-mask-size:contain;mask-size:contain;}
.akv-wname{margin:${PACK_SPACE.md}px 0 0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;line-height:1.2;
  letter-spacing:${PACK_HEAD.card.letterSpacing};text-transform:uppercase;color:${AINUBIS.ink};overflow-wrap:anywhere;}
.akv-wtease{margin:${PACK_SPACE.sm}px auto 0;max-width:40ch;font-size:${PACK_TEXT.body}px;line-height:1.55;color:${AINUBIS.inkDim};}
.akv-wsoon{display:inline-block;margin-top:${PACK_SPACE.lg}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;
  border-radius:${PACK_R.pill}px;font-size:${PACK_TEXT.micro}px;letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase;color:${AINUBIS.inkDim};border:1px solid ${AINUBIS.edge};}

/* ── POHĽAD DOLE — pilulka nad lištou (lock §1.3.1, geometria .trp-mactions) ──
   ⚠️ Číslo je OPÍSANÉ z PackMap.tsx, lebo register spodného pásu (nástenka r-pas)
   ešte neexistuje. Keď vznikne, táto pilulka ide doň ako prvá — nie ako ďalší
   nezávislý prilepený prvok.
   ⚠️ ŽIADNE spätné apostrofy v komentároch — sú vnútri template literálu CSS. */
.akv-mactions{position:absolute;z-index:7;left:50%;transform:translateX(-50%);
  bottom:calc(env(safe-area-inset-bottom,0px) + 87px + var(--pack-medal-rise, 0px) + 4px);}
/* Prepínač NIE JE výzva k akcii: pilulka 999 BEZ dosvitu (lock §1.3.1). */
.akv-mtoggle{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;cursor:pointer;white-space:nowrap;
  padding:${PACK_SPACE.md}px ${PACK_SPACE.xl}px;border-radius:${PACK_R.pill}px;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:${PACK_HEAD.card.letterSpacing};
  text-transform:uppercase;background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};border:1px solid ${AINUBIS.ctaEdge};}
.akv-mtoggle i{width:16px;height:16px;flex:0 0 auto;background:${AINUBIS.ctaInk};
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;
  -webkit-mask-size:contain;mask-size:contain;}

/* Mobil: pohľady sa striedajú, DOGSCROLL prekrýva mozog. */
.akv-root[data-view="brain"] .akv-scroll{display:none;}
/* Nad pásom kariet dostane horný pás podklad — inak cez medzeru medzi jeho riadkami
   presvitá text karty, ktorá pod ním odchádza (snímka 21. 9., 390 px). */
/* Od 22. 9. je hlavička dvojriadková a mozog svieti celý — podklad dostáva VŽDY,
   inak cez avatar a zvonček bežia vlákna a nápisy okruhov. */
.akv-top::before{content:'';position:absolute;z-index:-1;pointer-events:none;
  left:-${PACK_SPACE.xl}px;right:-${PACK_SPACE.xl}px;bottom:-${PACK_SPACE.lg}px;
  top:calc(-1 * (env(safe-area-inset-top,0px) + ${PACK_SPACE.xl}px));
  background:linear-gradient(180deg,${AINUBIS.bg} 72%,transparent);}
@media (max-width:${PC_MIN - 1}px){
  .akv-root[data-view="scroll"] .akv-top::before{content:'';position:absolute;z-index:-1;pointer-events:none;
    left:-${PACK_SPACE.md}px;right:-${PACK_SPACE.md}px;bottom:-${PACK_SPACE.md}px;
    top:calc(-1 * (env(safe-area-inset-top,0px) + ${PACK_SPACE.md}px));
    background:linear-gradient(180deg,${AINUBIS.bg} 78%,transparent);}
}

/* ── PC: 40 / 60 vedľa seba, pás len nad pravou plochou (nákres, rozhodnutie 2) ── */
@media (min-width:${PC_MIN}px){
  .akv-scroll,.akv-root[data-view="brain"] .akv-scroll{display:block;right:auto;width:var(--akv-panel);
    padding:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.xl}px) ${PACK_SPACE.xl}px ${BOTTOM_PC + PACK_SPACE.xl}px;
    border-right:1px solid ${AINUBIS.edge};}
  .akv-brain{left:var(--akv-panel);}
  .akv-top{left:calc(var(--akv-panel) + ${PACK_SPACE.xl}px);right:${PACK_SPACE.xl}px;top:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.xl}px);}
  .akv-planes{flex:0 1 480px;}
  .akv-mactions{display:none;}
  .akv-world{scroll-margin-top:${PACK_SPACE.xl}px;}
}
`;

type View = 'brain' | 'scroll';

export default function PackAinubis() {
  const t = useT();
  const tx = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };
  const id = usePackIdentity();
  const { lang } = useLang();
  const [view, setView] = useState<View>('brain');
  const [flash, setFlash] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const brain = useRef<BrainHandle | null>(null);
  const ready = !id.loading && !!id.session;

  const names = useMemo(
    () => VAULT_WORLDS.map((w) => tx(`pack.ainubis.world.${w.key}`, w.en)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );
  /* Plátno sa mountuje RAZ — jeho callbacky preto čítajú aktuálne mená a jazyk z refu. */
  /* Mená okruhov: SK pre slovenčinu, inak EN (návrh) — `vault/circles.ts`. */
  const circleName = (wi: number, oi: number) => {
    const c = VAULT_CIRCLES[VAULT_WORLDS[wi].key]?.[oi];
    return c ? (lang === 'sk' ? c.sk : c.en) : '';
  };
  const live = useRef({ names, tx, circleName });
  live.current = { names, tx, circleName };

  const openWorld = (wi: number) => {
    const key = VAULT_WORLDS[wi].key;
    setView('scroll');
    setFlash(key);
    /* Až po vykreslení: na mobile je DOGSCROLL do tejto chvíle `display:none`. */
    requestAnimationFrame(() => {
      document.getElementById(`akv-w-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    window.setTimeout(() => setFlash((f) => (f === key ? null : f)), 1400);
  };
  const openWorldRef = useRef(openWorld);
  openWorldRef.current = openWorld;

  // ── MOZOG — mount raz, keď je plátno v DOM ────────────────────────────────
  useEffect(() => {
    const cv = cvRef.current, tip = tipRef.current;
    if (!ready || !cv || !tip) return;
    const isPc = () => window.innerWidth >= PC_MIN;
    brain.current = mountBrain({
      canvas: cv,
      tip,
      worlds: VAULT_WORLDS,
      head: ainubisHead,
      isMobile: () => !isPc(),
      worldName: (wi) => live.current.names[wi],
      circleName: (wi, oi) => live.current.circleName(wi, oi),
      insets: () => ({
        top: (topRef.current?.getBoundingClientRect().bottom ?? 0) + PACK_SPACE.sm,
        /* Cookie lišta sa NEPRIPOČÍTAVA — od 22. 9. obsah prekrýva, neposúva. */
        bottom: isPc() ? BOTTOM_PC : BOTTOM_MOBILE,
      }),
      describe: (role, wi, oi) => {
        const { names: n, tx: x, circleName: cn } = live.current;
        if (role === 'root') return { title: 'AINUBIS', hint: x('pack.ainubis.ask', 'Ask AINUBIS') };
        /* Okruh má vlastné meno; zvitok zatiaľ nie (Matej: „ďalej už nie"). */
        return {
          title: role === 'o' ? (cn(wi, oi) || n[wi]) : n[wi],
          sub: role === 'o' ? `${n[wi]} · ${x('pack.ainubis.tip.circle', 'A chapter being written')}`
            : x('pack.ainubis.tip.scroll', 'A scroll being written'),
          hint: x('pack.ainubis.opening', 'Expected opening: November 2026'),
        };
      },
      onWorld: (wi) => openWorldRef.current(wi),
      onRoot: openAinubis,
    });
    const ro = new ResizeObserver(() => brain.current?.resize());
    ro.observe(cv);
    return () => { ro.disconnect(); brain.current?.destroy(); brain.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* Výška horného pásu ide von ako premenná — DOGSCROLL na mobile začína pod ním,
     nie pod odhadnutým číslom. */
  useEffect(() => {
    const top = topRef.current, root = rootRef.current;
    if (!ready || !top || !root) return;
    const pub = () => root.style.setProperty('--akv-top-h', `${Math.round(top.getBoundingClientRect().bottom) + PACK_SPACE.md}px`);
    pub();
    const ro = new ResizeObserver(pub);
    ro.observe(top);
    return () => ro.disconnect();
  }, [ready]);

  if (!ready) return <div className="akv-root" style={{ position: 'fixed', inset: 0, background: AINUBIS.surfaceBase }} />;

  const plane = (key: 'dogscroll' | 'chat' | 'wall', en: string) => tx(`pack.ainubis.plane.${key}`, en);
  const mask = (ic: string) => ({ WebkitMaskImage: `url(/icons/pack/${ic}.svg)`, maskImage: `url(/icons/pack/${ic}.svg)` });

  return (
    <div className="akv-root" ref={rootRef} data-view={view}>
      <style>{CSS}</style>
      <div className="akv-bg" aria-hidden />

      {/* ── MOZOG ─────────────────────────────────────────────────────────── */}
      <section className="akv-brain" aria-label={tx('pack.ainubis.view.brain', 'Brain')}>
        <canvas ref={cvRef} />
        <div className="akv-tip" ref={tipRef} role="status" />
        {/* ⚠️ Tlačidlá + − ⤾ z nákresu tu NIE SÚ: kit má len plus, mínus ani „späť na
            celok" nemá, a holý znak je brandový dlh (pole NOT IN THE BRAND). Priblíženie
            ide kolieskom a dvoma prstami, oddialenie na východisko mozog samo vycentruje.
            Kresby si treba vypýtať od Mateja. */}
      </section>

      {/* ── DOGSCROLL — dnes upútavky svetov, v novembri pás zvitkov ────────── */}
      <aside className="akv-scroll" aria-label={tx('pack.ainubis.view.list', 'List')}>
        <div className="akv-col">
          {/* BANNER „stavba pred očami" + November 2026 — presunutý z kostry, nezanikol. */}
          <header>
            <div className="akv-head">
              <img className="akv-face" src={ainubisHead} alt="" aria-hidden />
              <div>
                <span className="akv-flag">{tx('pack.ainubis.flag', 'Under construction — in plain sight')}</span>
                <h1 className="akv-title">{tx('pack.ainubis.dogscroll.title', 'Dogscrolling')}</h1>
              </div>
            </div>
            <p className="akv-claim">{tx('pack.ainubis.dogscroll.claim', 'Your dog will thank you for this scroll.')}</p>
            <p className="akv-lead">
              {tx(
                'pack.ainubis.lead',
                'AINUBIS is learning. Seven worlds of dog knowledge are being written right now, '
                + 'scroll by scroll. You’ll watch them open one by one.',
              )}
            </p>
          </header>

          {VAULT_WORLDS.map((w, i) => (
            <section
              key={w.key}
              id={`akv-w-${w.key}`}
              className={`akv-world${flash === w.key ? ' is-flash' : ''}`}
            >
              <div className="akv-wlbl">{tx('pack.ainubis.worldOf', 'World {n} of 7').replace('{n}', String(i + 1))}</div>
              <div className="akv-wic" aria-hidden style={mask(w.ic)} />
              <h2 className="akv-wname">{names[i]}</h2>
              <p className="akv-wtease">{tx(`pack.ainubis.tease.${w.key}`, w.tease)}</p>
              <span className="akv-wsoon">{tx('pack.ainubis.opening', 'Expected opening: November 2026')}</span>
            </section>
          ))}
        </div>
      </aside>

      {/* ── HORE: IDENTITA + OZNAM, POD TÝM ROVINA (Matej 22. 9.) ─────────────── */}
      <div className="akv-top" ref={topRef}>
        <PackIdentityBar
          id={id}
          middle={(
            <span className="akv-when">
              <span className="akv-when-l">{tx('pack.ainubis.opening', 'Expected opening: November 2026')}</span>
              <span className="akv-when-s">{tx('pack.ainubis.openingShort', 'Opens Nov 2026')}</span>
            </span>
          )}
        />
        <div className="akv-toprow">
          <nav className="akv-planes" aria-label="AINUBIS">
            <button type="button" className="akv-plane" aria-current="page">{plane('dogscroll', 'Dogscroll')}</button>
            {/* CHAT = kôš 3. Otvára sa tým istým kanálom ako doteraz (`ainubisBus`),
                takže beží presne ten chat, ktorý žije naostro. */}
            <button type="button" className="akv-plane" onClick={openAinubis}>{plane('chat', 'Chat')}</button>
            <button type="button" className="akv-plane" disabled>
              {plane('wall', 'Board')}<em>{tx('pack.ainubis.soon', 'soon')}</em>
            </button>
          </nav>
        </div>
      </div>

      {/* ── DOLE POHĽAD (len mobil) — ikonka aj text ukazujú CIEĽ, nie stav ──── */}
      <div className="akv-mactions">
        <button
          type="button"
          className="akv-mtoggle"
          onClick={() => setView((v) => (v === 'brain' ? 'scroll' : 'brain'))}
        >
          <i aria-hidden style={mask(view === 'brain' ? 'menu' : 'idea')} />
          {view === 'brain'
            ? tx('pack.ainubis.view.list', 'List')
            : tx('pack.ainubis.view.brain', 'Brain')}
        </button>
      </div>

      <PackBottomNav avatarUrl={id.avatarUrl} avatarInitial={id.avatarInitial} dogs={id.dogs} />
      <MessagingOverlayHost />
    </div>
  );
}
