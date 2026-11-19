import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { getConsent } from '@/lib/consent';
import { ukazMoment, listeners } from './moment/momentBus';
import { MomentHost } from './moment/MomentHost';
import { KOMNATY, ZNALEC, komnataFor, komnataHotova, novePolozky, type Komnata, type KomnataId } from './wizSteps';
import { Spot, WIZ_CSS, ainubisFace, forgetShown, logWiz, pushSeenToAccount, readSeenLocal, writeSeenLocal, wizOffLocal, type WizAction } from './PackWizard';
import { MAP_COACH_CSS } from './MapCoach';
import { AINUBIS } from './ainubisSkin';
import { FONT_TITLE, FONT_UI, PACK_R, PACK_SPACE, PACK_TEXT, PROGRESS_CSS } from './packTheme';
import type { PackDog } from './usePackIdentity';

// ════════════════════════════════════════════════════════════════════════════
// SYSTÉM KOMNÁT (17. 11. 2026, v2 18. 11. 2026) — prehliadka appky pod `KOMNATY_ON` (testovací kanál).
//
// Matej: *„úvodný ainubis wizard sa ukončí odznakom, ale bude vidno aj ďalšie odznaky a aj to navrhne:
// máš čas? ukážem ti každú komnatu teraz alebo až pri používaní?“* · v2: *„OK všetko“* nad klikacím nákresom
// `plany/nakresy/wizard-v2-2026-11-18/` (texty tam: `texty.json`, finálne).
//
// v2 V KOSTRE:
//   · JEDNA PREHLIADKA PRE VŠETKÝCH — „Čo je nové“ pre starých členov zrušené, každý ide od komnaty 0.
//   · ŤUKACIE KROKY (`Krok.tuk`): bublina bez „Ďalej“, prst + vlna, krok postúpi len skutočným ťukom na cieľ.
//   · PREHĽAD KOMNÁT (`DvereKomnat`): dvere + Znalec s progresom, bez scrollu; ťuk na dvere = šuplík s checklistom
//     (`Komnata.uci`) a „↺ znova“ pri položke (spustí komnatu od jej kroku `uk`).
//   · NOVÁ VEC = nový riadok v registri (`kroky` + `uci` s poľom `since`) → dvere NOVÉ, kľúčik svieti len pre ňu.
//   · MERANIE: každá udalosť → `wizard_events` cez `logWiz`, screen `kom:<komnata>`, step_id = kľúč kroku
//     (shown · next · tap · skip · missing · done · replay · later). Zlyhanie zápisu prehliadku nezastaví.
//
// ČO KDE ŽIJE:
//   · register komnát a krokov = `wizSteps.ts` (KOMNATY) — nová komnata = riadok tam, nie zásah sem,
//   · výrez + bublina + prst = `Spot` z `PackWizard.tsx` (jeden recept pre každé „AINUBIS na niečo ukazuje“),
//   · odznak = moment `wizard` (MomentHost), potom prehľad dverí tu,
//   · stav = `wiz_seen` (localStorage + user_metadata): id krokov a `odz:<komnata>`. Žiadna nová tabuľka.
//   · kurzor rozbehnutej komnaty (`dogypt_k_pos`, `dogypt_k_rep`) v sessionStorage — PackLayout sa montuje na každej
//     stránke nanovo, takže stav v pamäti by sa pri ťuku, čo mení stránku, stratil.
//   · kľúčik pri AINUBISovi v lište = `KomnataKluc` nižšie (PackLayout); jeho význam vysvetľuje preslov v komnate 0.
//
// PRAVIDLÁ: Preskočiť zavrie komnatu, ale nič neoznačí (kľúčik svieti ďalej) · videné kroky ostávajú = návrat
// pokračuje, kde prestal · komnata sa dokončí len skutočným prejdením (kroky s chýbajúcou kotvou sa vynechajú).
// PRIPOMIENKA DOG ID: deň 1 · 3 · 7, potom raz za týždeň, max 1× za deň, po 3 odmietnutiach ticho.
// ════════════════════════════════════════════════════════════════════════════

const EV_START = 'dogypt:komnata';
const K_FIRST = 'dogypt_k_first';
const K_AUTO = 'dogypt_k_auto';
const K_REM = 'dogypt_k_rem';
/** Rozpracovaná komnata, jej kurzor a prehľad prežijú prechod obrazovky. */
const K_AKT = 'dogypt_k_akt';
const K_POS = 'dogypt_k_pos';
const K_REP = 'dogypt_k_rep';
/** Človek zvolil „Postupne“: komnata sa spustí sama, až keď sám otvorí jej sekciu (Matej 19. 11. 2026). */
const K_POSTUPNE = 'dogypt_k_postupne';
const K_POLICA = 'dogypt_k_polica';
/** Prehľad otvorený ručne (nie po komnate) — vlastná hodnota vedľa id komnaty. */
const PREHLAD = '*';
const ss = {
  get(k: string): string | null { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string | null) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch { /* */ } },
};
const RAM = '/icons/komnaty/ram.webp';
const ZAMOK = '/icons/sys/zamok.webp';
const KLUC = '/icons/sys/kluc.webp';
const KLUC_AINUBIS = '/icons/sys/kluc-ainubis.webp';
const FAJKA = '/icons/sys/fajka-zelena.webp';
// Matej 17. 11.: *„tie dvere si predstavujem asi drevené a zatvorené so zámkom, otvorené a vnútri nich bude odznak“*.
const DVERE_ZAM = '/icons/sys/dvere-zamknute.webp';
const K_DOGID = 'dogypt_k_dogid';
/** Iné okno (pravidlá, moment, list) je otvorené → prehliadka počká, okná idú po jednom. */
const cudzieOkno = () => [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].some((e) => !e.closest('.wzc, .wzc-welcome'));
const dogidPct = () => Number(ls.get(K_DOGID) ?? '0') || 0;

const dnes = () => new Date().toISOString().slice(0, 10);
const ls = {
  get(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* súkromné okno */ } },
  del(k: string) { try { localStorage.removeItem(k); } catch { /* */ } },
};

const scr = (id: string) => `kom:${id}`;
/** Je človek na stránke, kde krok žije? `/pack` presne, ostatné aj s podstránkou. */
const naOk = (na: string | undefined, p: string) => {
  if (!na) return true;
  const q = p.replace(/\/+$/, '') || '/';
  return na === '/pack' ? q === '/pack' : q === na || q.startsWith(`${na}/`);
};

/** Kde komnata začne: prvý nevidený krok (pokračuje, kde prestal); hotová komnata od začiatku (bez privítania). */
function kurzor(k: Komnata, seen: Set<string>, p: string, o: { uk?: string; kluc?: boolean }): { pos: number; rep: boolean } | null {
  if (o.uk) return { pos: Math.max(0, k.kroky.findIndex((x) => x.id === o.uk)), rep: true };
  const nove = novePolozky(k, seen);
  if (nove.length) return { pos: Math.max(0, k.kroky.findIndex((x) => x.id === nove[0].uk)), rep: true };
  let i = k.kroky.findIndex((x) => !seen.has(x.id));
  const rep = i < 0;
  if (rep) i = k.kroky[0].anchor === 'welcome' ? 1 : 0;
  // Kľúčik na stránke komnaty: nevoď človeka preč kvôli krokom „ťukni sem, aby si sa tu dostal“.
  // Kľúčik ani automatický štart NIKDY neprenesú človeka inam (Matej 19. 11. 2026: „otvorilo map a človek nerozumie,
  // na akej je obrazovke“): ak komnata tu nemá žiadny krok, nespustí sa vôbec.
  if (o.kluc && !naOk(k.kroky[i].na, p)) {
    const j = k.kroky.findIndex((x, n) => n > i && naOk(x.na, p));
    if (j < 0) return null;
    i = j;
  }
  return { pos: i, rep };
}

/** Spusti komnatu (kľúčik, „Teraz“, pripomienka, nastavenia, chat). `uk` = ↺ znova od kroku, `kluc` = z kľúčika. */
export function startKomnata(id: KomnataId = 'uvod', o: { uk?: string; kluc?: boolean } = {}) {
  const k = KOMNATY.find((x) => x.id === id);
  if (!k) return;
  const c = kurzor(k, readSeenLocal(), window.location.pathname, o);
  if (!c) return;
  ss.set(K_AKT, id); ss.set(K_POS, String(c.pos)); ss.set(K_REP, c.rep ? '1' : '0');
  ss.set(K_POLICA, null);
  if (o.uk) { forgetShown(scr(id)); logWiz(scr(id), o.uk, 'replay'); }
  window.dispatchEvent(new CustomEvent(EV_START, { detail: { id } }));
}

/** Prehľad komnát (dvere) naživo, mimo toku — zo „Prehliadka chrámu“ v JA. */
export function ukazPrehlad() {
  ss.set(K_POLICA, PREHLAD);
  window.dispatchEvent(new CustomEvent(EV_START, { detail: { id: PREHLAD } }));
}

/** Prehliadka znova od komnaty 0. `vsetko` (tlačidlo testera) zabudne aj odznaky a pripomienky,
 *  bežné „znova“ odznaky nechá. Staré prehliadky webu sa nedotkne. */
export function resetKomnaty(start = true, vsetko = false) {
  const s = readSeenLocal();
  const ids = new Set(KOMNATY.flatMap((k) => k.kroky.map((x) => x.id)));
  [...s].forEach((id) => { if (ids.has(id) || (vsetko && id.startsWith('odz:'))) s.delete(id); });
  writeSeenLocal(s);
  void pushSeenToAccount(s);
  if (vsetko) {
    [K_FIRST, K_AUTO, K_REM, K_POSTUPNE].forEach(ls.del);
    KOMNATY.forEach((k) => ls.del(`${K_AUTO}:${k.id}`));
  }
  window.dispatchEvent(new CustomEvent('dogypt:wizard'));
  if (start) { forgetShown(scr('uvod')); logWiz(scr('uvod'), 'k0.vitaj', 'replay'); startKomnata('uvod'); }
}

const hotova = komnataHotova;

/** Obrázok odznaku s náhradou: kým kresba nie je v `public/icons/sys`, ukáže kľúč alebo prázdny rám. */
function OdzImg({ src, alt, fallback, className }: { src: string; alt: string; fallback: string; className?: string }) {
  const [cur, setCur] = useState(src);
  useEffect(() => setCur(src), [src]);
  return <img className={className} src={cur} alt={alt} onError={() => { if (cur !== fallback) setCur(fallback); }} />;
}
const fallbackFor = (id: string) => (id === 'uvod' ? KLUC : RAM);

/** Over, či súbor existuje — MomentHost náhradu nepozná, tak mu podáme rovno tú, ktorá je. */
function obrazokOk(src: string): Promise<boolean> {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = src; });
}

/** Veľkosť dverí v prehľade: z výšky okna, aby sa celý prehľad zmestil BEZ SCROLLU (375×667 až 1477×724). */
const DVERE_D = 'clamp(36px, calc((100dvh - 440px) / 2.6), 64px)';

/** Žiara dverí v prehľade (Matej 18. 11. 2026, „OK všetko“): hotová = tichá zelená, novinka = pulzujúca žltá. Hodnoty sú jeho. */
const ZIARA = {
  hot: '0 0 0 2px rgba(61,122,78,.9),0 0 14px 2px rgba(61,170,90,.55)',
  novaOd: `0 0 0 2px ${AINUBIS.ctaA},0 0 10px 2px rgba(${AINUBIS.ctaRGB},.5)`,
  novaDo: `0 0 0 2px ${AINUBIS.ctaA},0 0 24px 8px rgba(${AINUBIS.ctaRGB},.85)`,
};

const K_CSS = `
${PROGRESS_CSS}
/* PREHĽAD KOMNÁT: 4 + 3 vycentrované, každé dvere štvrtina šírky (flex-wrap, nie grid s prázdnou bunkou). */
.kmn-dvere{display:flex;flex-wrap:wrap;justify-content:center;gap:${PACK_SPACE.sm}px 0;width:100%;margin:${PACK_SPACE.sm}px 0;}
.kmn-dv{flex:0 0 25%;display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.xs}px;cursor:pointer;position:relative;padding:0;border:0;background:none;
  font:600 ${PACK_TEXT.micro}px ${FONT_UI};color:${AINUBIS.inkDim};text-transform:uppercase;letter-spacing:.02em;text-align:center;}
.kmn-portal{position:relative;width:var(--kmn-d,${DVERE_D});height:var(--kmn-d,${DVERE_D});border-radius:${PACK_R.tile}px;}
.wzc-welcome .kmn-portal img.dv{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:none;}
/* PREJDENÁ komnata (Matej 17. 11.): tie isté dvere vyblednuté v pozadí, odznak VEĽKÝ v popredí so zlatou žiarou. */
.wzc-welcome .kmn-dv.otv .kmn-portal img.dv{opacity:.35;}
.wzc-welcome .kmn-portal img.odz{position:absolute;left:6%;top:6%;width:88%;height:88%;object-fit:contain;filter:drop-shadow(0 0 10px rgba(230,158,26,.8));}
/* Hotová = tichá zelená žiara; novinka = pulzujúca žltá + NOVÉ (Matej 18. 11.: zelená zámerne tichšia). */
.kmn-dv.hot .kmn-portal{box-shadow:${ZIARA.hot};}
.kmn-dv.nova .kmn-portal{animation:kmn-nova 1.6s ease-in-out infinite;}
@keyframes kmn-nova{0%,100%{box-shadow:${ZIARA.novaOd};}50%{box-shadow:${ZIARA.novaDo};}}
@media (prefers-reduced-motion:reduce){.kmn-dv.nova .kmn-portal{animation:none;}}
.kmn-nov{position:absolute;top:-${PACK_SPACE.xs}px;right:12%;background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};font:700 ${PACK_TEXT.micro}px ${FONT_UI};padding:1px ${PACK_SPACE.xs + 1}px;border-radius:${PACK_R.pill}px;letter-spacing:.02em;}
.kmn-dv b{font-weight:600;color:${AINUBIS.cyan};}
.kmn-pocet{font:600 ${PACK_TEXT.body}px ${FONT_UI};color:${AINUBIS.cyan};}
.kmn-q{margin:${PACK_SPACE.lg}px 0 ${PACK_SPACE.xl}px;font:400 ${PACK_TEXT.lead}px/1.5 ${FONT_UI};color:${AINUBIS.ink};}
.kmn-duo{display:flex;gap:${PACK_SPACE.md}px;align-items:center;justify-content:center;}
.wzc-welcome .kmn-duo img{width:88px;height:88px;border-radius:${PACK_R.pill}px;object-fit:cover;filter:none;border:2px solid ${AINUBIS.edgeStrong};}
.kmn-meno{margin-top:${PACK_SPACE.md}px;font:600 ${PACK_TEXT.lead}px ${FONT_UI};color:${AINUBIS.ink};}
.kmn-cis{display:inline-block;margin-top:${PACK_SPACE.sm}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${AINUBIS.edgeStrong};font:600 ${PACK_TEXT.body}px ${FONT_UI};color:${AINUBIS.cyan};}
.kmn-dar{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;justify-content:center;margin:0 0 ${PACK_SPACE.lg}px;font:400 ${PACK_TEXT.body}px ${FONT_UI};color:${AINUBIS.inkDim};}
.wzc-welcome .kmn-dar img{width:40px;height:40px;filter:none;}
.kmn-kluc{position:absolute;top:-${PACK_SPACE.xs}px;right:-${PACK_SPACE.sm}px;width:24px;height:24px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;padding:0;cursor:pointer;
  background:${AINUBIS.surfaceBase};border:1px solid ${AINUBIS.edgeStrong};animation:kmn-zhor 1.8s ease-in-out infinite;z-index:2;}
.kmn-kluc img{width:16px;height:16px;object-fit:contain;}
.wzc .mcoach-txt p b{display:inline;font:inherit;font-weight:600;letter-spacing:inherit;text-transform:none;margin:0;color:${AINUBIS.cyan};}
@keyframes kmn-zhor{0%,100%{transform:scale(1);opacity:.85;}50%{transform:scale(1.12);opacity:1;}}
/* PREHĽAD bez scrollu: tesnejší vzduch a texty, dvere ustupujú výške okna (--kmn-d). */
.wzc-welcome.kmn-ov{padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;overflow:hidden;}
.kmn-ov > div{max-width:340px;width:100%;}
.wzc-welcome.kmn-ov .wm{margin-top:0;font-size:${PACK_TEXT.lead}px;}
.wzc-welcome.kmn-ov h2{margin:${PACK_SPACE.sm}px 0;font-size:${PACK_TEXT.h2}px;}
.wzc-welcome.kmn-ov p{margin:0 0 ${PACK_SPACE.xs}px;font-size:${PACK_TEXT.label}px;line-height:1.4;}
.kmn-ov .kmn-tip{margin:0 0 ${PACK_SPACE.sm}px;}
@media (max-height:720px){.wzc-welcome.kmn-ov .wm{display:none;}}
/* Znalec chrámu = cieľ pod dverami s progresom. */
.kmn-goal{display:flex;align-items:center;gap:${PACK_SPACE.md}px;width:100%;box-sizing:border-box;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;border:1px solid ${AINUBIS.ctaEdge};border-radius:${PACK_R.tile}px;text-align:left;}
.wzc-welcome.kmn-ov .kmn-goal img{width:40px;height:40px;flex:none;filter:none;opacity:.5;}
.wzc-welcome.kmn-ov .kmn-goal.ok img{opacity:1;filter:drop-shadow(0 0 8px rgba(230,158,26,.8));}
.kmn-goal b{display:block;color:${AINUBIS.ctaA};font:700 ${PACK_TEXT.body}px ${FONT_UI};}
.kmn-goal small{display:block;color:${AINUBIS.inkDim};font:500 ${PACK_TEXT.label}px ${FONT_UI};}
.kmn-goal .pk-progress{margin-top:${PACK_SPACE.xs}px;background:${AINUBIS.edge};}
.kmn-row{display:flex;gap:${PACK_SPACE.md}px;width:100%;margin-top:${PACK_SPACE.sm}px;align-items:center;justify-content:center;}
.wzc-welcome .kmn-row .mcoach-ok{width:auto;flex:1;}
.wzc-welcome .kmn-row .mcoach-mute{margin-top:0;}
.kmn-nvt{margin:${PACK_SPACE.sm}px 0 0;color:${AINUBIS.ink};}
.kmn-nvt b{color:${AINUBIS.ctaA};}
/* ŠUPLÍK KOMNATY: checklist (hotové / ešte nie / NOVÉ) + ↺ znova. */
.kmn-veil{position:fixed;inset:0;z-index:1501;background:rgba(1,5,10,.55);}
.kmn-sheet{position:fixed;left:0;right:0;bottom:0;z-index:1502;box-sizing:border-box;max-height:88dvh;overflow-y:auto;background:${AINUBIS.surfaceBase};border-top:1.5px solid ${AINUBIS.edgeStrong};
  border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px calc(env(safe-area-inset-bottom,0px) + ${PACK_SPACE.xl}px);box-shadow:${AINUBIS.panelShadow};text-align:left;animation:wzc-in .3s ease;}
.kmn-grip{width:40px;height:4px;border-radius:${PACK_R.pill}px;background:${AINUBIS.edgeStrong};margin:0 auto ${PACK_SPACE.md}px;}
.kmn-sheet h4{display:flex;align-items:center;gap:${PACK_SPACE.md}px;margin:0 0 ${PACK_SPACE.md}px;font:700 ${PACK_TEXT.h2}px ${FONT_TITLE};color:${AINUBIS.ink};} /* písmo: nadpis */
.wzc-welcome.kmn-ov .kmn-sheet h4 img{width:52px;height:52px;object-fit:contain;}
.kmn-sheet h4 small{display:block;font:600 ${PACK_TEXT.micro}px ${FONT_UI};color:${AINUBIS.ctaA};letter-spacing:.22em;text-transform:uppercase;}
.kmn-chk{list-style:none;margin:0 0 ${PACK_SPACE.lg}px;padding:0;}
.kmn-chk li{display:flex;gap:${PACK_SPACE.sm}px;align-items:center;padding:${PACK_SPACE.sm}px 0;border-bottom:1px solid ${AINUBIS.edge};font:400 ${PACK_TEXT.body}px ${FONT_UI};color:${AINUBIS.ink};}
.kmn-chk li i{font-style:normal;width:22px;height:22px;flex:0 0 22px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;font:700 ${PACK_TEXT.label}px ${FONT_UI};}
.wzc-welcome.kmn-ov .kmn-chk li i img{width:16px;height:16px;object-fit:contain;}
.kmn-chk li.ok i{background:${AINUBIS.okTint};}
.kmn-chk li.no i{border:1px solid ${AINUBIS.edgeStrong};}
.kmn-chk li.new i{background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};}
.kmn-chk li.new{color:${AINUBIS.ctaA};font-weight:600;}
.kmn-chk li > span{flex:1;}
.kmn-chk li .kmn-nv{flex:none;padding:1px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;border:1px solid ${AINUBIS.ctaEdge};font:600 ${PACK_TEXT.micro}px ${FONT_UI};color:${AINUBIS.ctaA};}
.kmn-znova{flex:none;cursor:pointer;color:${AINUBIS.cyan};font:600 ${PACK_TEXT.micro}px ${FONT_UI};white-space:nowrap;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;border:1px solid ${AINUBIS.edge};border-radius:${PACK_R.pill}px;background:none;}
.kmn-sheet .kmn-row .mcoach-mute{flex:none;}
`;

// ─── KĽÚČIK PRI AINUBISOVI ───────────────────────────────────────────────────
// Svieti, keď obrazovka má nevidenú komnatu alebo novinku v tej, čo človek už má. Ťuk spustí tú komnatu
// (AINUBISov odkaz pod ním neotvorí). Význam kľúčika vysvetľuje preslov v komnate 0 (`k0.preslov`).
export function KomnataKluc({ dole = false }: { dole?: boolean }) {
  const { pathname } = useLocation();
  const t = useT();
  // Hore pri AINUBISovi (`HubAinubis`) je hlavné miesto; dole v lište len na obrazovkách, kde horný rad nie je.
  const [horeJe, setHoreJe] = useState(() => document.body.classList.contains('has-hub-ainubis'));
  useEffect(() => {
    if (!dole) return undefined;
    const mo = new MutationObserver(() => setHoreJe(document.body.classList.contains('has-hub-ainubis')));
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    setHoreJe(document.body.classList.contains('has-hub-ainubis'));
    return () => mo.disconnect();
  }, [dole, pathname]);
  const [seen, setSeen] = useState<Set<string>>(readSeenLocal);
  useEffect(() => {
    const sync = () => setSeen(readSeenLocal());
    window.addEventListener('dogypt:wizard', sync);
    return () => window.removeEventListener('dogypt:wizard', sync);
  }, []);
  useEffect(() => setSeen(readSeenLocal()), [pathname]);
  const k = komnataFor(pathname, hotova(seen));
  if (!k || (dole && horeJe)) return null;
  return (
    <button
      type="button"
      className="kmn-kluc"
      aria-label={t('pack.wizard.k.kluc')}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); startKomnata(k.id, { kluc: true }); }}
    >
      <style>{K_CSS}</style>
      <OdzImg src={KLUC_AINUBIS} fallback={KLUC} alt="" />
    </button>
  );
}

// ─── DVERE KOMNÁT ────────────────────────────────────────────────────────────
// Matej 17. 11.: *„nebude to polica odznakov, ale ako keby dvere so zámkom — komnaty, tie môžu časom
// pribúdať“*. Počet je VŽDY z registra. Prejdená komnata = tie isté dvere vyblednuté + veľký žiariaci odznak
// + tichá zelená žiara; komnata s novinkou = pulzujúca žltá žiara + NOVÉ. Znalec chrámu NIE JE dvere,
// je to cieľ pod nimi (`ZnalecCiel`). `dvere-otvorene` sa nevolá.
export function DvereKomnat({ seen, onOpen }: { seen: Set<string>; onOpen?: (id: KomnataId) => void }) {
  const t = useT();
  const pct = dogidPct();
  return (
    <div className="kmn-dvere">
      {KOMNATY.map((x) => {
        const otv = seen.has(`odz:${x.id}`);
        const nova = novePolozky(x, seen).length > 0;
        const caka = x.id === 'pes' && !otv && hotova(seen)(x);
        return (
          <button key={x.id} type="button" className={`kmn-dv${otv ? ' otv hot' : ''}${nova ? ' nova' : ''}`} onClick={() => onOpen?.(x.id)}>
            <span className="kmn-portal">
              <OdzImg className="dv" src={DVERE_ZAM} fallback={ZAMOK} alt="" />
              {otv && <OdzImg className="odz" src={x.odznak.obrazok} fallback={fallbackFor(x.id)} alt="" />}
            </span>
            {nova && <span className="kmn-nov">{t('pack.wizard.k.nove')}</span>}
            {t(`pack.wizard.k.kom.${x.id}`)}
            {caka && <b>{pct} %</b>}
          </button>
        );
      })}
    </div>
  );
}

/** Šírka výplne PROGRESU (recept `.pk-progress`) — rovnaký pomocník ako v `StatsDetail`. */
const fillW = (pct: number) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { display: 'block', width: w };
};

/** Znalec chrámu pod dverami: cieľ „n / t komnát“ s progresom. Cieľ rastie s počtom komnát v registri. */
function ZnalecCiel({ seen }: { seen: Set<string> }) {
  const t = useT();
  const n = KOMNATY.filter((x) => seen.has(`odz:${x.id}`)).length;
  const tt = KOMNATY.length;
  return (
    <div className={`kmn-goal${n === tt ? ' ok' : ''}`}>
      <OdzImg src={ZNALEC.obrazok} fallback={RAM} alt="" />
      <div style={{ flex: 1 }}>
        <b>{t(ZNALEC.nazov)}</b>
        <small>{t('pack.wizard.k.pocet', { n: String(n), t: String(tt) })} · {t('pack.wizard.k.znalecCiel')}</small>
        <div className="pk-progress"><div className="pk-progress__fill" style={fillW((n / tt) * 100)} /></div>
      </div>
    </div>
  );
}

/** Šuplík komnaty: čo ťa naučí (✓ hotové · prázdny krúžok · NOVÉ) a „↺ znova“ pri každej veci. */
function KomnataSheet({ k, seen, onClose, onStart }: { k: Komnata; seen: Set<string>; onClose: () => void; onStart: (o?: { uk?: string }) => void }) {
  const t = useT();
  const ok = seen.has(`odz:${k.id}`);
  const nove = novePolozky(k, seen);
  return (
    <>
      <div className="kmn-veil" onClick={onClose} />
      <div className="kmn-sheet" role="dialog" aria-modal="true">
        <div className="kmn-grip" />
        <h4>
          <OdzImg src={k.odznak.obrazok} fallback={fallbackFor(k.id)} alt="" />
          <span><small>{t(ok ? 'pack.wizard.k.odomknuta' : 'pack.wizard.k.zamknuta')}</small>{t(`pack.wizard.k.kom.${k.id}`)}</span>
        </h4>
        <ul className="kmn-chk">
          {k.uci.map((p) => {
            const nova = nove.some((n) => n.id === p.id);
            const hotove = ok || seen.has(p.uk);
            const c = nova ? 'new' : hotove ? 'ok' : 'no';
            return (
              <li key={p.id} className={c}>
                <i>{c === 'ok' ? <img src={FAJKA} alt="" /> : c === 'new' ? '!' : null}</i>
                <span>{t(`pack.wizard.k.uci.${k.id}.${p.id}`)}</span>
                {nova && <span className="kmn-nv">{t('pack.wizard.k.nove')}</span>}
                <button type="button" className="kmn-znova" onClick={() => onStart({ uk: p.uk })}>↺ {t('pack.wizard.k.znova')}</button>
              </li>
            );
          })}
        </ul>
        <div className="kmn-row">
          <button type="button" className="mcoach-mute" onClick={onClose}>{t('pack.wizard.k.zavriet')}</button>
          <button type="button" className="mcoach-ok" onClick={() => onStart()}>{t(nove.length ? 'pack.wizard.k.ukazNovinku' : 'pack.wizard.k.ukazKomnatu')}</button>
        </div>
      </div>
    </>
  );
}

// ─── PREHLIADKA PO KOMNATÁCH ─────────────────────────────────────────────────
/** Obálka: obrazovky bez hostiteľa momentov (mapa, rovina AINUBIS) by odznak nikdy neukázali — vtedy si ho montujeme sami. */
export function PackKomnaty(props: { dogs: PackDog[]; avatarUrl: string | null }) {
  const [vlastnyHost, setVlastnyHost] = useState(false);
  return (
    <>
      <PackKomnatyJadro {...props} potrebujeHosta={() => { if (!listeners.size) setVlastnyHost(true); }} />
      {vlastnyHost && <MomentHost />}
    </>
  );
}

function PackKomnatyJadro({ dogs, avatarUrl, potrebujeHosta }: { dogs: PackDog[]; avatarUrl: string | null; potrebujeHosta: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const [seen, setSeen] = useState<Set<string>>(readSeenLocal);
  const [akt, setAktRaw] = useState<KomnataId | null>(() => ss.get(K_AKT) as KomnataId | null);
  const setAkt = useCallback((id: KomnataId | null) => { ss.set(K_AKT, id); setAktRaw(id); }, []);
  const [pos, setPosRaw] = useState<number>(() => Number(ss.get(K_POS) ?? '0') || 0);
  const setPos = useCallback((n: number) => { ss.set(K_POS, String(n)); setPosRaw(n); }, []);
  const [rep, setRepRaw] = useState<boolean>(() => ss.get(K_REP) === '1');
  const [polica, setPolicaRaw] = useState<string | null>(() => ss.get(K_POLICA));
  const setPolica = useCallback((id: string | null) => { ss.set(K_POLICA, id); setPolicaRaw(id); }, []);
  const [sheet, setSheet] = useState<KomnataId | null>(null);
  const [pripomienka, setPripomienka] = useState(false);
  const [off, setOff] = useState(wizOffLocal);
  const [ukazKluc, setUkazKluc] = useState(false);
  const [volno, setVolno] = useState(false);
  const [pct, setPct] = useState(dogidPct);
  // Okná po jednom: kým je otvorené iné (pravidlá, moment, list), prehliadka čaká.
  useEffect(() => {
    const iv = setInterval(() => setVolno(!cudzieOkno()), 500);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    const on = (e: Event) => setPct(Number((e as CustomEvent<number>).detail) || 0);
    window.addEventListener('dogypt:dogid-pct', on);
    return () => window.removeEventListener('dogypt:dogid-pct', on);
  }, []);
  const [ja, setJa] = useState<{ meno: string; cislo: number | null; pes: string; foto: string | null }>({ meno: '', cislo: null, pes: '', foto: null });
  const done = useMemo(() => hotova(seen), [seen]);
  const pes = dogs[0];

  // Stav z účtu sa prileje k lokálnemu (iné zariadenie); `wiz_off` = roboty bez automatickej prehliadky.
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user?.user_metadata;
      if (meta?.wiz_off === true) setOff(true);
      if (!Array.isArray(meta?.wiz_seen)) return;
      setSeen((cur) => { const m = new Set(cur); (meta.wiz_seen as string[]).forEach((id) => m.add(id)); writeSeenLocal(m); return m; });
    });
    const sync = () => setSeen(readSeenLocal());
    window.addEventListener('dogypt:wizard', sync);
    return () => window.removeEventListener('dogypt:wizard', sync);
  }, []);

  // Meno majiteľa, pes a jeho číslo pre privítanie. Vlastný dotaz, lebo identita lišty berie len
  // zaplatených psov a hosť (zadarmo od 14. 11.) by v nej nemal nič. Číslo patrí psovi, človek ho nesie.
  useEffect(() => {
    void supabase.auth.getSession().then(({ data: s }) => {
      const uid = s.session?.user?.id;
      if (!uid) return;
      void supabase.from('dogs').select('dog_name, owner_name, pack_number, cloudinary_main_url')
        .eq('user_id', uid).in('payment_status', ['paid', 'guest'])
        .order('pack_number', { ascending: true, nullsFirst: false }).limit(1).maybeSingle()
        .then(({ data }) => {
          if (data) setJa({ meno: data.owner_name ?? '', cislo: data.pack_number ?? null, pes: data.dog_name ?? '', foto: data.cloudinary_main_url ?? null });
        });
    });
  }, []);

  const [consentDone, setConsentDone] = useState(() => !!getConsent());
  useEffect(() => {
    if (consentDone) return;
    const iv = setInterval(() => { if (getConsent()) { setConsentDone(true); clearInterval(iv); } }, 400);
    return () => clearInterval(iv);
  }, [consentDone]);

  // Zápis HNEĎ do localStorage (nie až v updateri stavu): ťuk môže otvoriť inú stránku a komponent
  // sa odmontuje skôr, než by React stav dopočítal — videné by sa stratilo.
  const mark = useCallback((ids: string[]) => {
    const m = readSeenLocal();
    ids.forEach((id) => m.add(id));
    writeSeenLocal(m);
    void pushSeenToAccount(m);
    setSeen(new Set(m));
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('dogypt:wizard')), 0);
  }, []);

  // Spustenie zvonka (kľúčik, Teraz, pripomienka, nastavenia, chat). Kurzor už zapísal `startKomnata`; chat
  // posiela `detail: id` ako reťazec, ostatní `{ id }`. Id `*` = len prehľad dverí.
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<string | { id?: string }>).detail;
      const id = (typeof d === 'string' ? d : d?.id) ?? 'uvod';
      if (id === PREHLAD) { setSheet(null); setPolicaRaw(ss.get(K_POLICA)); return; }
      const k = KOMNATY.find((x) => x.id === id);
      if (!k) return;
      // Chat (a každý, kto nevolal `startKomnata`) nemá kurzor zapísaný → dopočítaj.
      if (ss.get(K_AKT) !== id) startKomnata(k.id, { kluc: true });
      setPolica(null); setPripomienka(false); setSheet(null);
      if (!ls.get(K_FIRST)) ls.set(K_FIRST, dnes());
      setPosRaw(Number(ss.get(K_POS) ?? '0') || 0);
      setRepRaw(ss.get(K_REP) === '1');
      setAktRaw(id as KomnataId);
    };
    window.addEventListener(EV_START, on);
    return () => window.removeEventListener(EV_START, on);
  }, [setPolica]);

  // Komnata 0 sa zjaví sama pri prvom vstupe na FEED (raz za deň, kým ju človek neprejde). Pre všetkých rovnako.
  const k0 = KOMNATY[0];
  useEffect(() => {
    if (off || !consentDone || !volno || akt || polica || pathname !== '/pack' || done(k0)) return;
    if (ls.get(K_AUTO) === dnes()) return;
    ls.set(K_AUTO, dnes());
    startKomnata('uvod');
  }, [off, consentDone, volno, akt, polica, pathname, done, k0]);

  // Obrazovka bez lišty (SNIFFER): komnata sa spustí sama pri prvej návšteve, raz za deň — od kroku tejto obrazovky.
  useEffect(() => {
    if (off || !consentDone || !volno || akt || polica) return;
    const kb = KOMNATY.find((x) => x.bezListy && !done(x) && x.routes.includes(pathname));
    if (!kb || ls.get(`${K_AUTO}:${kb.id}`) === dnes()) return;
    ls.set(`${K_AUTO}:${kb.id}`, dnes());
    startKomnata(kb.id, { kluc: true });
  }, [off, consentDone, volno, akt, polica, pathname, done]);

  // „POSTUPNE“ (Matej 19. 11. 2026): komnata sekcie sa spustí, až keď človek sám otvorí jej obrazovku (ťukne na planétku →
  // /map → začne prehliadka mapy). Feed (`/pack`) sa nepočíta — tam komnaty volá kľúčik. Raz za deň na komnatu.
  useEffect(() => {
    if (off || !consentDone || !volno || akt || polica || !ls.get(K_POSTUPNE) || !done(k0)) return undefined;
    const kp = komnataFor(pathname, done);
    if (!kp || kp.routes.includes('/pack') || ls.get(`${K_AUTO}:${kp.id}`) === dnes()) return undefined;
    const t0 = window.setTimeout(() => {
      ls.set(`${K_AUTO}:${kp.id}`, dnes());
      startKomnata(kp.id, { kluc: true });
    }, 700);
    return () => window.clearTimeout(t0);
  }, [off, consentDone, volno, akt, polica, pathname, done, k0]);

  // Pripomienka DOG ID: deň 1 · 3 · 7, potom týždenne, max 1× za deň, po 3 odmietnutiach ticho.
  const kPes = KOMNATY[1];
  useEffect(() => {
    if (off || !consentDone || !volno || akt || polica || pathname !== '/pack' || (done(kPes) && pct >= 100) || !done(k0)) return;
    const first = ls.get(K_FIRST);
    if (!first) return;
    let rem: { last?: string; ign?: number } = {};
    try { rem = JSON.parse(ls.get(K_REM) || '{}'); } catch { /* */ }
    if (rem.last === dnes() || (rem.ign ?? 0) >= 3) return;
    const den = Math.floor((Date.parse(dnes()) - Date.parse(first)) / 864e5);
    const due = den === 1 || den === 3 || den === 7 || (den > 7 && (den - 7) % 7 === 0);
    if (!due) return;
    ls.set(K_REM, JSON.stringify({ ...rem, last: dnes() }));
    setPripomienka(true);
  }, [off, consentDone, volno, akt, polica, pathname, done, kPes, k0, pct]);

  const k = akt ? KOMNATY.find((x) => x.id === akt) ?? null : null;
  const krok = k?.kroky[pos];
  // Kurzor mimo komnaty (rozbitý stav) → zavrieť.
  useEffect(() => { if (k && !krok) setAkt(null); }, [k, krok, setAkt]);

  // Krok žije na inej stránke → zaveď človeka tam. Spot sa vykreslí až na správnej stránke (celý čas na hľadanie kotvy).
  useEffect(() => {
    if (!krok || naOk(krok.na, pathname)) return undefined;
    const t0 = window.setTimeout(() => { if (krok.na && !naOk(krok.na, pathRef.current)) navigate(krok.na); }, 350);
    return () => window.clearTimeout(t0);
  }, [krok, pathname, navigate]);

  // Komnata hotová → odznak (moment), potom prehľad dverí. Všetkých sedem → Znalec chrámu.
  const odmena = useCallback(async (kom: Komnata, seenNow: Set<string>) => {
    if (seenNow.has(`odz:${kom.id}`) || readSeenLocal().has(`odz:${kom.id}`)) return;
    mark([`odz:${kom.id}`]);
    potrebujeHosta();
    const src = (await obrazokOk(kom.odznak.obrazok)) ? kom.odznak.obrazok : fallbackFor(kom.id);
    const vsetky = KOMNATY.every((x) => x.id === kom.id || seenNow.has(`odz:${x.id}`));
    ukazMoment({
      id: 'wizard', obrazok: src, dvere: DVERE_ZAM, eyebrow: t('pack.wizard.k.eyebrow'), nadpis: t(kom.odznak.nazov), podnadpis: t('pack.wizard.k.badgeSub'),
      hotovo: () => {
        if (!vsetky) { setPolica(kom.id); return; }
        void obrazokOk(ZNALEC.obrazok).then((ok) => ukazMoment({
          id: 'wizard', obrazok: ok ? ZNALEC.obrazok : RAM, nadpis: t(ZNALEC.nazov), podnadpis: t('pack.wizard.k.znalecSub'),
          hotovo: () => setPolica(kom.id),
        }));
      },
    });
  }, [mark, t, setPolica, potrebujeHosta]);

  // Hotová komnata bez odznaku → odznak. Až o chvíľu: ťuk práve otvára inú stránku a moment by zhasol s ňou;
  // keď sa komponent medzitým odmontuje, odznak príde na najbližšej obrazovke s lištou.
  useEffect(() => {
    if (akt || polica) return undefined;
    // STRÁŽCA PSA až pri 100 % DOG ID (Matej 17. 11.); dovtedy dvere ukazujú postup.
    const dlh = KOMNATY.find((x) => done(x) && !seen.has(`odz:${x.id}`) && (x.id !== 'pes' || pct >= 100));
    if (!dlh) return undefined;
    const t0 = window.setTimeout(() => void odmena(dlh, seen), 700);
    return () => window.clearTimeout(t0);
  }, [akt, polica, done, seen, odmena, pct]);

  const klikni = (sel?: string) => { if (sel) (document.querySelector(sel) as HTMLElement | null)?.click(); };

  /** Komnata skončila. `prejdena` = posledný krok bol naozaj prejdený (nie len vynechaný pre chýbajúcu kotvu):
   *  vtedy sa komnata označí za dokončenú a ide odznak. Pri opakovaní sa vrátime do prehľadu. */
  const koniec = useCallback((kom: Komnata, prejdena: boolean) => {
    setAkt(null);
    if (!prejdena) { if (rep) setPolica(PREHLAD); return; }
    if (rep) { setPolica(PREHLAD); return; }
    logWiz(scr(kom.id), kom.odznak.id, 'done');
    mark(kom.kroky.map((x) => x.id));
  }, [rep, mark, setAkt, setPolica]);

  /** Ďalší krok od `od`: vo vlastnom behu preskočí už videné (pokračuje, kde prestal), pri opakovaní nie. */
  const dalsi = useCallback((kom: Komnata, od: number, prejdena: boolean, seenNow: Set<string>) => {
    let i = od;
    while (i < kom.kroky.length && !rep && seenNow.has(kom.kroky[i].id)) i++;
    if (i >= kom.kroky.length) koniec(kom, prejdena); else setPos(i);
  }, [rep, koniec, setPos]);

  const prejdi = useCallback((action: WizAction = 'next') => {
    if (!k || !krok) return;
    logWiz(scr(k.id), krok.id, action === 'tap' ? 'tap' : 'next');
    mark([krok.id]);
    // `po` až po ťuknutí na cieľ nechceme prepísať: pri ťukacom kroku `po` nikdy nie je.
    klikni(krok.po);
    dalsi(k, pos + 1, true, readSeenLocal());
  }, [k, krok, pos, mark, dalsi]);

  const preskoc = useCallback(() => {
    if (k && krok) logWiz(scr(k.id), krok.id, 'skip');
    klikni(krok?.po);
    setAkt(null);
    if (rep) setPolica(PREHLAD);
  }, [k, krok, rep, setAkt, setPolica]);

  const chyba = useCallback(() => {
    if (!k || !krok) return;
    logWiz(scr(k.id), krok.id, 'missing');
    dalsi(k, pos + 1, false, readSeenLocal());
  }, [k, krok, pos, dalsi]);

  // Krok s `klik` najprv otvorí, o čom hovorí (záložka, panel); výrez sa hľadá až potom.
  const [pripraveny, setPripraveny] = useState<string | null>(null);
  useEffect(() => {
    if (!krok) { setPripraveny(null); return undefined; }
    if (!krok.klik) { setPripraveny(krok.id); return undefined; }
    const t0 = window.setTimeout(() => { klikni(krok.klik); setPripraveny(krok.id); }, 300);
    return () => window.clearTimeout(t0);
  }, [krok]);

  const portal = (node: JSX.Element) => createPortal(<>{node}<style>{MAP_COACH_CSS}{WIZ_CSS}{K_CSS}</style></>, document.body);

  // „Šuplík → Ukáž komnatu / ↺ znova“: zatvor šuplík a prehľad, spusti komnatu.
  const spustZoSuplika = (id: KomnataId, o?: { uk?: string }) => { setSheet(null); startKomnata(id, o); };

  // ── PREHĽAD KOMNÁT (dvere) — po odznaku aj ručne z JA ──
  if (polica) {
    const poUvode = polica === 'uvod' && !done(kPes);
    const nk = KOMNATY.find((x) => novePolozky(x, seen).length > 0);
    const sk = sheet ? KOMNATY.find((x) => x.id === sheet) ?? null : null;
    return portal(
      <div className="wzc-welcome kmn-ov" role="dialog" aria-modal="true">
        <div>
          <div className="wm"><span>AI</span>NUBIS</div>
          <h2>{t('pack.wizard.k.prehlad.title')}</h2>
          <p>{t('pack.wizard.k.prehlad.body')}</p>
          <DvereKomnat seen={seen} onOpen={setSheet} />
          <p className="kmn-tip">{t('pack.wizard.k.prehlad.tip')}</p>
          <ZnalecCiel seen={seen} />
          {nk && <p className="kmn-nvt" dangerouslySetInnerHTML={{ __html: t('pack.wizard.k.novinka', { komnata: `<b>${t(`pack.wizard.k.kom.${nk.id}`)}</b>` }) }} />}
          {poUvode ? (
            <>
              <p className="kmn-q" style={{ margin: `${PACK_SPACE.sm}px 0 0`, fontSize: PACK_TEXT.label }}>{t('pack.wizard.k.otazka')}</p>
              <div className="kmn-row">
                <button type="button" className="mcoach-ok" onClick={() => { startKomnata('pes'); }}>{t('pack.wizard.k.teraz')}</button>
                <button type="button" className="mcoach-mute" onClick={() => { logWiz(scr('uvod'), 'polica', 'later'); ls.set(K_POSTUPNE, dnes()); setPolica(null); }}>{t('pack.wizard.k.postupne')}</button>
              </div>
            </>
          ) : (
            <div className="kmn-row"><button type="button" className="mcoach-ok" onClick={() => setPolica(null)}>{t('pack.wizard.k.zavriet')}</button></div>
          )}
        </div>
        {sk && <KomnataSheet k={sk} seen={seen} onClose={() => setSheet(null)} onStart={(o) => spustZoSuplika(sk.id, o)} />}
      </div>,
    );
  }

  // ── „POSTUPNE“: ukáž kľúčik, ktorý bude odteraz volať ──
  if (ukazKluc && !akt) {
    return (
      <>
        <style>{K_CSS}</style>
        <Spot
          key="k.kluc"
          step={{ id: 'k.kluc', anchor: '.kmn-kluc' }}
          body={t('pack.wizard.k.klucHint')}
          dots={null}
          okLabel={t('pack.wizard.k.rozumiem')}
          onNext={() => setUkazKluc(false)}
          onSkip={() => setUkazKluc(false)}
          onShown={() => undefined}
          onMissing={() => setUkazKluc(false)}
        />
      </>
    );
  }

  // ── PRIPOMIENKA DOG ID ──
  if (pripomienka && !akt) {
    const nie = () => {
      logWiz(scr('pes'), 'pripomienka', 'later');
      try { const r = JSON.parse(ls.get(K_REM) || '{}'); ls.set(K_REM, JSON.stringify({ ...r, ign: (r.ign ?? 0) + 1 })); } catch { /* */ }
      setPripomienka(false);
    };
    return portal(
      <div className="wzc-welcome" role="dialog" aria-modal="true">
        <div>
          <img src={ainubisFace} alt="" aria-hidden="true" />
          <div className="wm"><span>AI</span>NUBIS</div>
          <p className="kmn-q">{t('pack.wizard.k.pripomienka', { name: ja.meno || t('pack.wizard.k.clovek') })}</p>
          <button type="button" className="mcoach-ok" onClick={() => { setPripomienka(false); startKomnata('pes'); }}>{t('pack.wizard.k.podme')}</button>
          <button type="button" className="mcoach-mute" onClick={nie}>{t('pack.wizard.k0.neskor')}</button>
        </div>
      </div>,
    );
  }

  if (!k || !krok || !consentDone) return null;

  // ── KOMNATA 0, privítanie na celú obrazovku ──
  if (krok.anchor === 'welcome') {
    logWiz(scr(k.id), krok.id, 'shown');
    return portal(
      <div className="wzc-welcome" role="dialog" aria-modal="true">
        <div>
          <div className="kmn-duo">
            {avatarUrl && <img src={avatarUrl} alt="" />}
            <img src={ja.foto || pes?.cloudinary_main_url || ainubisFace} alt="" />
          </div>
          <div className="kmn-meno">{[ja.meno, ja.pes || pes?.dog_name].filter(Boolean).join(' · ')}</div>
          {ja.cislo != null && <span className="kmn-cis">#{ja.cislo} / 1 000 000</span>}
          <h2>{t('pack.wizard.k0.title')}</h2>
          <p>{t(krok.text)}</p>
          <div className="kmn-dar"><OdzImg src={k0.odznak.obrazok} fallback={KLUC} alt="" />{t('pack.wizard.k0.dar')}</div>
          <button type="button" className="mcoach-ok" onClick={() => prejdi('next')}>{t('pack.wizard.k0.ano')}</button>
          <button type="button" className="mcoach-mute" onClick={() => { logWiz(scr(k.id), krok.id, 'later'); setAkt(null); }}>{t('pack.wizard.k0.neskor')}</button>
        </div>
      </div>,
    );
  }

  // Krok žije na inej stránke: kým tam človek nie je, drží sa tma (bez blikania a bez zásahu do appky).
  if (!naOk(krok.na, pathname)) return createPortal(<><div className="wzc"><div className="wzc-dim" /></div><style>{WIZ_CSS}</style></>, document.body);

  if (pripraveny !== krok.id) return null;
  const spots = k.kroky.filter((x) => x.anchor !== 'welcome');
  const at = spots.findIndex((x) => x.id === krok.id);
  return (
    <>
    <style>{K_CSS}</style>
    <Spot
      key={krok.id}
      step={krok}
      body={t(krok.text, { dog: ja.pes || pes?.dog_name || '' })}
      dots={spots.length > 1 ? { n: spots.length, at } : null}
      okLabel={at === spots.length - 1 ? t('pack.wizard.k.hotovo') : undefined}
      tuk={krok.tuk}
      onNext={prejdi}
      onSkip={preskoc}
      onShown={() => logWiz(scr(k.id), krok.id, 'shown')}
      onMissing={chyba}
    />
    </>
  );
}
