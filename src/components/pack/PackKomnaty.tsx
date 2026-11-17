import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { getConsent } from '@/lib/consent';
import { ukazMoment } from './moment/momentBus';
import { KOMNATY, ZNALEC, komnataFor, type Komnata, type KomnataId } from './wizSteps';
import { Spot, WIZ_CSS, ainubisFace, pushSeenToAccount, readSeenLocal, writeSeenLocal, wizOffLocal } from './PackWizard';
import { MAP_COACH_CSS } from './MapCoach';
import { AINUBIS } from './ainubisSkin';
import { FONT_UI, PACK_R, PACK_SPACE, PACK_TEXT } from './packTheme';
import type { PackDog } from './usePackIdentity';

// ════════════════════════════════════════════════════════════════════════════
// SYSTÉM KOMNÁT (17. 11. 2026) — nová prehliadka appky pod `KOMNATY_ON` (testovací kanál).
//
// Matej: *„úvodný ainubis wizard sa ukončí odznakom, ale bude vidno aj ďalšie odznaky a aj to navrhne:
// máš čas? ukážem ti každú komnatu teraz alebo až pri používaní?“* · *„pokiaľ človek nevyplní DOG ID,
// AINUBIS by sa mal sem-tam ohlásiť aj sám“* · *„skús to postaviť nech to vidím v test appke“*.
// Nákres, simulácia a mapa: `plany/nakresy/wizard-appka-2026-11-17/`.
//
// ČO KDE ŽIJE:
//   · register komnát a krokov = `wizSteps.ts` (KOMNATY) — nová komnata = riadok tam, nie zásah sem,
//   · výrez + bublina = `Spot` z `PackWizard.tsx` (jeden recept pre každé „AINUBIS na niečo ukazuje“),
//   · odznak = moment `wizard` (MomentHost), potom polica odznakov tu,
//   · stav = `wiz_seen` (localStorage + user_metadata): id krokov a `odz:<komnata>`. Žiadna nová tabuľka.
//   · kľúčik pri AINUBISovi v lište = `KomnataKluc` nižšie (PackLayout).
//
// PRAVIDLÁ (mapa komnát): max 5 výrezov · akcia naostro tam, kde prvok existuje · Preskočiť zavrie komnatu,
// ale nič neoznačí (kľúčik svieti ďalej) · videné kroky ostávajú = návrat pokračuje, kde prestal.
// PRIPOMIENKA DOG ID: deň 1 · 3 · 7, potom raz za týždeň, max 1× za deň, po 3 odmietnutiach ticho.
// 1. kolo len lokálne pri otvorení appky (localStorage), push nie.
// ════════════════════════════════════════════════════════════════════════════

const EV_START = 'dogypt:komnata';
const K_FIRST = 'dogypt_k_first';
const K_AUTO = 'dogypt_k_auto';
const K_REM = 'dogypt_k_rem';
/** Rozpracovaná komnata a polica prežijú prechod obrazovky: `PackLayout` (a s ním tento komponent)
 *  sa montuje na každej stránke nanovo, takže stav v pamäti by sa pri „Teraz“ stratil. */
const K_AKT = 'dogypt_k_akt';
const K_POLICA = 'dogypt_k_polica';
const ss = {
  get(k: string): string | null { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string | null) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch { /* */ } },
};
const RAM = '/icons/komnaty/ram.webp';
const ZAMOK = '/icons/sys/zamok.webp';
const KLUC = '/icons/sys/kluc.webp';
const KLUC_AINUBIS = '/icons/sys/kluc-ainubis.webp';
// Matej 17. 11.: *„tie dvere si predstavujem asi drevené a zatvorené so zámkom, otvorené a vnútri nich bude odznak“*.
const DVERE_ZAM = '/icons/sys/dvere-zamknute.webp';
/** Od tohto dňa beží nová prehliadka; starší účet dostane namiesto komnaty 0 „Čo je nové“. */
const KOMNATY_OD = '2026-11-18';
const K_NOVY = 'dogypt_k_novy';
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

/** Spusti komnatu (kľúčik, „Teraz“, pripomienka, nastavenia). */
export function startKomnata(id: KomnataId = 'uvod') {
  ss.set(K_AKT, id);
  window.dispatchEvent(new CustomEvent(EV_START, { detail: { id } }));
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
    [K_FIRST, K_AUTO, K_REM].forEach(ls.del);
    ls.set(K_NOVY, '1'); // tester chce vidieť cestu NOVÉHO člena, nie „Čo je nové“
    KOMNATY.forEach((k) => ls.del(`${K_AUTO}:${k.id}`));
  }
  window.dispatchEvent(new CustomEvent('dogypt:wizard'));
  if (start) startKomnata('uvod');
}

const hotova = (seen: Set<string>) => (k: Komnata) => k.kroky.every((x) => seen.has(x.id));

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

const K_CSS = `
.kmn-dvere{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:${PACK_SPACE.md}px ${PACK_SPACE.sm}px;width:320px;max-width:100%;margin:${PACK_SPACE.lg}px 0;max-height:52vh;overflow-y:auto;padding:${PACK_SPACE.sm}px ${PACK_SPACE.xs}px;}
.kmn-dv{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.xs}px;font:600 ${PACK_TEXT.micro}px ${FONT_UI};color:${AINUBIS.inkDim};text-transform:uppercase;letter-spacing:.02em;text-align:center;}
.kmn-portal{position:relative;width:72px;height:72px;}
.wzc-welcome .kmn-portal img.dv{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:none;}
/* PREJDENÁ komnata (Matej 17. 11.): tie isté dvere vyblednuté v pozadí, odznak VEĽKÝ v popredí so zlatou žiarou
   (farba GOLD_BTN.glow ako drop-shadow, aby kopírovala tvar odznaku). */
.wzc-welcome .kmn-dv.otv .kmn-portal img.dv{opacity:.35;}
.wzc-welcome .kmn-portal img.odz{position:absolute;left:6%;top:6%;width:88%;height:88%;object-fit:contain;filter:drop-shadow(0 0 10px rgba(230,158,26,.8));}
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
`;

// ─── KĽÚČIK PRI AINUBISOVI ───────────────────────────────────────────────────
// Svieti, keď obrazovka má nevidenú komnatu. Ťuk spustí tú komnatu (AINUBISov odkaz pod ním neotvorí).
export function KomnataKluc() {
  const { pathname } = useLocation();
  const t = useT();
  const [seen, setSeen] = useState<Set<string>>(readSeenLocal);
  useEffect(() => {
    const sync = () => setSeen(readSeenLocal());
    window.addEventListener('dogypt:wizard', sync);
    return () => window.removeEventListener('dogypt:wizard', sync);
  }, []);
  useEffect(() => setSeen(readSeenLocal()), [pathname]);
  const k = komnataFor(pathname, hotova(seen));
  if (!k) return null;
  return (
    <button
      type="button"
      className="kmn-kluc"
      aria-label={t('pack.wizard.k.kluc')}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); startKomnata(k.id); }}
    >
      <style>{K_CSS}</style>
      <OdzImg src={KLUC_AINUBIS} fallback={KLUC} alt="" />
    </button>
  );
}

// ─── DVERE KOMNÁT ────────────────────────────────────────────────────────────
// Matej 17. 11.: *„nebude to polica odznakov, ale ako keby dvere so zámkom — komnaty, tie môžu časom
// pribúdať“*. Počet je VŽDY z registra; mriežka unesie aj 12 dverí. Kresby dverí sú z továrne
// (`dvere-zamknute`); prejdená komnata = tie isté dvere vyblednuté + veľký žiariaci odznak. `dvere-otvorene` sa nevolá.
export function DvereKomnat({ seen }: { seen: Set<string> }) {
  const t = useT();
  const pct = dogidPct();
  const vsetky = KOMNATY.every((x) => seen.has(`odz:${x.id}`));
  return (
    <div className="kmn-dvere">
      {KOMNATY.map((x) => {
        const otv = seen.has(`odz:${x.id}`);
        const caka = x.id === 'pes' && !otv && hotova(seen)(x);
        return (
          <div key={x.id} className={`kmn-dv${otv ? ' otv' : ''}`}>
            <span className="kmn-portal">
              <OdzImg className="dv" src={DVERE_ZAM} fallback={ZAMOK} alt="" />
              {otv && <OdzImg className="odz" src={x.odznak.obrazok} fallback={fallbackFor(x.id)} alt="" />}
            </span>
            {t(`pack.wizard.k.kom.${x.id}`)}
            {caka && <b>{pct} %</b>}
          </div>
        );
      })}
      <div className={`kmn-dv${vsetky ? ' otv' : ''}`}>
        <span className="kmn-portal">
          <OdzImg className="dv" src={DVERE_ZAM} fallback={ZAMOK} alt="" />
          {vsetky && <OdzImg className="odz" src={ZNALEC.obrazok} fallback={RAM} alt="" />}
        </span>
        {t(ZNALEC.nazov)}
      </div>
    </div>
  );
}

// ─── PREHLIADKA PO KOMNATÁCH ─────────────────────────────────────────────────
export function PackKomnaty({ dogs, avatarUrl }: { dogs: PackDog[]; avatarUrl: string | null }) {
  const t = useT();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [seen, setSeen] = useState<Set<string>>(readSeenLocal);
  const [akt, setAktRaw] = useState<KomnataId | null>(() => ss.get(K_AKT) as KomnataId | null);
  const setAkt = useCallback((id: KomnataId | null) => { ss.set(K_AKT, id); setAktRaw(id); }, []);
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [polica, setPolicaRaw] = useState<KomnataId | null>(() => ss.get(K_POLICA) as KomnataId | null);
  const setPolica = useCallback((id: KomnataId | null) => { ss.set(K_POLICA, id); setPolicaRaw(id); }, []);
  const [pripomienka, setPripomienka] = useState(false);
  const [off, setOff] = useState(wizOffLocal);
  const [stary, setStary] = useState<boolean | null>(null);
  const [novinky, setNovinky] = useState(false);
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
      // Starý člen = účet spred prehliadky alebo už videl starú prehliadku. Tester po resete ide cestou nového.
      const created = data.session?.user?.created_at ?? '';
      const videlStaru = Array.isArray(meta?.wiz_seen) && (meta.wiz_seen as string[]).some((id) => id.startsWith('home.'));
      setStary(ls.get(K_NOVY) === '1' ? false : (!!created && created.slice(0, 10) < KOMNATY_OD) || videlStaru);
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

  // Zápis HNEĎ do localStorage (nie až v updateri stavu): naostro ťuk otvorí inú stránku a komponent
  // sa odmontuje skôr, než by React stav dopočítal — videné by sa stratilo.
  const mark = useCallback((ids: string[]) => {
    const m = readSeenLocal();
    ids.forEach((id) => m.add(id));
    writeSeenLocal(m);
    void pushSeenToAccount(m);
    setSeen(new Set(m));
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('dogypt:wizard')), 0);
  }, []);

  // Spustenie zvonka (kľúčik, Teraz, pripomienka, nastavenia).
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<{ id: KomnataId }>).detail?.id ?? 'uvod';
      const k = KOMNATY.find((x) => x.id === id);
      if (!k) return;
      setPolica(null); setPripomienka(false); setMissing(new Set());
      if (!ls.get(K_FIRST)) ls.set(K_FIRST, dnes());
      setAkt(id);
      if (pathname !== k.start && !k.routes.some((r) => r === pathname)) navigate(k.start);
    };
    window.addEventListener(EV_START, on);
    return () => window.removeEventListener(EV_START, on);
  }, [navigate, pathname, setAkt, setPolica]);

  // Komnata 0 sa zjaví sama pri prvom vstupe na FEED (raz za deň, kým ju človek neprejde).
  const k0 = KOMNATY[0];
  useEffect(() => {
    if (off || !consentDone || !volno || stary === null || akt || polica || novinky || pathname !== '/pack' || done(k0)) return;
    if (ls.get(K_AUTO) === dnes()) return;
    ls.set(K_AUTO, dnes());
    if (!ls.get(K_FIRST)) ls.set(K_FIRST, dnes());
    if (stary) setNovinky(true); else setAkt('uvod');
  }, [off, consentDone, volno, stary, akt, polica, novinky, pathname, done, k0, setAkt]);

  // Obrazovka bez lišty (SNIFFER): komnata sa spustí sama pri prvej návšteve, raz za deň.
  useEffect(() => {
    if (off || !consentDone || !volno || akt || polica) return;
    const kb = KOMNATY.find((x) => x.bezListy && !done(x) && x.routes.includes(pathname));
    if (!kb || ls.get(`${K_AUTO}:${kb.id}`) === dnes()) return;
    ls.set(`${K_AUTO}:${kb.id}`, dnes());
    setAkt(kb.id);
  }, [off, consentDone, volno, akt, polica, pathname, done, setAkt]);

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

  // Človek odišiel z miesta komnaty (napr. naostro ťuk otvoril DOG ID) → komnata sa zavrie, videné ostáva.
  const k = akt ? KOMNATY.find((x) => x.id === akt) ?? null : null;
  useEffect(() => {
    if (!k) return undefined;
    const tu = pathname === k.start || k.routes.some((r) => (r.endsWith('/*') ? pathname.startsWith(r.slice(0, -2)) : r === pathname));
    if (tu) return undefined;
    const t0 = window.setTimeout(() => setAkt(null), 1500);
    return () => window.clearTimeout(t0);
  }, [k, pathname, setAkt]);
  useEffect(() => { setMissing(new Set()); }, [pathname]);

  // Komnata hotová → odznak (moment), potom polica. Všetkých sedem → Znalec chrámu.
  const odmena = useCallback(async (kom: Komnata, seenNow: Set<string>) => {
    if (seenNow.has(`odz:${kom.id}`) || readSeenLocal().has(`odz:${kom.id}`)) return;
    mark([`odz:${kom.id}`]);
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
  }, [mark, t, setPolica]);

  // Hotová komnata bez odznaku → odznak. Až o chvíľu: naostro ťuk práve otvára inú stránku a moment by
  // zhasol s ňou; keď sa komponent medzitým odmontuje, odznak príde na najbližšej obrazovke s lištou.
  useEffect(() => {
    if (akt || polica) return undefined;
    // STRÁŽCA PSA až pri 100 % DOG ID (Matej 17. 11.); dovtedy dvere ukazujú postup.
    const dlh = KOMNATY.find((x) => done(x) && !seen.has(`odz:${x.id}`) && (x.id !== 'pes' || pct >= 100));
    if (!dlh) return undefined;
    const t0 = window.setTimeout(() => void odmena(dlh, seen), 700);
    return () => window.clearTimeout(t0);
  }, [akt, polica, done, seen, odmena, pct]);

  const krok = k?.kroky.find((x) => !seen.has(x.id) && !missing.has(x.id));
  // Komnata dobehla (alebo jej chýbajú kotvy) → zavrieť; odznak dá efekt „dlh“ vyššie.
  useEffect(() => { if (k && !krok) setAkt(null); }, [k, krok, setAkt]);

  const klikni = (sel?: string) => { if (sel) (document.querySelector(sel) as HTMLElement | null)?.click(); };
  const next = useCallback(() => {
    if (!krok) return;
    mark([krok.id]);
    klikni(krok.po);
  }, [krok, mark]);
  // Krok s `klik` najprv otvorí, o čom hovorí (menu, záložka, panel); výrez sa hľadá až potom.
  const [pripraveny, setPripraveny] = useState<string | null>(null);
  useEffect(() => {
    if (!krok) { setPripraveny(null); return undefined; }
    if (!krok.klik) { setPripraveny(krok.id); return undefined; }
    const t0 = window.setTimeout(() => { klikni(krok.klik); setPripraveny(krok.id); }, 300);
    return () => window.clearTimeout(t0);
  }, [krok]);
  const zavri = useCallback(() => { klikni(krok?.po); setAkt(null); }, [setAkt, krok]);

  const pocet = KOMNATY.filter((x) => seen.has(`odz:${x.id}`)).length;
  const portal = (node: JSX.Element) => createPortal(<>{node}<style>{MAP_COACH_CSS}{WIZ_CSS}{K_CSS}</style></>, document.body);

  // ── POLICA ODZNAKOV po odznaku ──
  if (polica) {
    const poUvode = polica === 'uvod' && !done(kPes);
    return portal(
      <div className="wzc-welcome" role="dialog" aria-modal="true">
        <div>
          <div className="wm"><span>AI</span>NUBIS</div>
          <h2>{t('pack.wizard.k.polica')}</h2>
          <DvereKomnat seen={seen} />
          <div className="kmn-pocet">{t('pack.wizard.k.pocet', { n: String(pocet), t: String(KOMNATY.length) })}</div>
          {poUvode ? (
            <>
              <p className="kmn-q">{t('pack.wizard.k.otazka')}</p>
              <button type="button" className="mcoach-ok" onClick={() => { setPolica(null); startKomnata('pes'); }}>{t('pack.wizard.k.teraz')}</button>
              <button type="button" className="mcoach-mute" onClick={() => { setPolica(null); setUkazKluc(true); }}>{t('pack.wizard.k.postupne')}</button>
            </>
          ) : (
            <button type="button" className="mcoach-ok" style={{ marginTop: PACK_SPACE.xl }} onClick={() => setPolica(null)}>{t('pack.wizard.k.dalej')}</button>
          )}
        </div>
      </div>,
    );
  }

  // ── ČO JE NOVÉ (starý člen) — namiesto komnaty 0; za ňu dostane ÚVODNÝ KĽÚČ ──
  if (novinky) {
    return portal(
      <div className="wzc-welcome" role="dialog" aria-modal="true">
        <div>
          <img src={ainubisFace} alt="" aria-hidden="true" />
          <div className="wm"><span>AI</span>NUBIS</div>
          <h2>{t('pack.wizard.k.novinky.title')}</h2>
          <p>{t('pack.wizard.k.novinky.body')}</p>
          <DvereKomnat seen={seen} />
          <button type="button" className="mcoach-ok" onClick={() => { setNovinky(false); mark(k0.kroky.map((x) => x.id)); }}>{t('pack.wizard.k.novinky.ok')}</button>
        </div>
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
          <button type="button" className="mcoach-ok" onClick={next}>{t('pack.wizard.k0.ano')}</button>
          <button type="button" className="mcoach-mute" onClick={zavri}>{t('pack.wizard.k0.neskor')}</button>
        </div>
      </div>,
    );
  }

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
      naostro={krok.naostro}
      onNext={next}
      onSkip={zavri}
      onShown={() => undefined}
      onMissing={() => setMissing((m) => new Set(m).add(krok.id))}
    />
    </>
  );
}
