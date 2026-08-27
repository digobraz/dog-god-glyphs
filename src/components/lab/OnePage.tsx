// ════════════════════════════════════════════════════════════════════════════
// ONEPAGE — CELÝ WEB AKO JEDEN ZVISLÝ SCROLL (DEV ONLY)
// ────────────────────────────────────────────────────────────────────────────
// Matej 26. 8. 2026: *„skúsme nový koncept webu = onepage stránka — HOME globe ·
// scroll dolu pekná animácia úvodnej obrazovky RELIGION (krava a pes) nie slajd
// ale postupný fade in, premiový prechod, odchod planéty príchod kravy a psa ·
// scroll dolu video intro · scroll upravený horizontálny scroll vízia · scroll
// príbeh dogyptu (starwars) schovať za popup · dolu ešte raz cieľ a kroky k nemu,
// číslo počtu psíčkarov, CTA."*
//
// A k spodnej lište (to isté zadanie): *„WALL je predsa v úvodnom dolnom nave —
// preklik. Po scrolle ďalej zmizne kompas aj wall, ale objaví sa CTA stať sa
// Dogypťanom."* → stena NIE JE sekcia filmu, je to odbočka z prvej obrazovky.
//
// ⚠️ TOTO JE DUPLIKÁT, NIE NÁHRADA. `components/lab/LabShell.tsx` (vodorovný
//    swipe medzi sekciami) ostáva nedotknutý a funkčný na `/wall-lab` — Matej
//    26. 8.: *„zatiaľ nemaž existujúce stránky, iba zduplikuj do onepage."*
//    Preto sú tu druhýkrát aj štýly horného navu: obe cesty sa nikdy
//    nenamountujú naraz, takže globálne `.main-nav` nekoliduje.
//
// ⚠️ ROZDIEL OPROTI LabShell V JEDNEJ VETE: tam scrolluje panel (`.lsh-scroll`),
//    tu scrolluje OKNO. `VisionLab` aj `AboutLab` to majú ošetrené samy
//    (`closest('.lsh-scroll') ?? window`), takže tu bežia bez zmeny.
//
// ⚠️ Papyrusové odtiene ber z `@/lib/labTheme` — nepíš sem vlastné.
// ⚠️ CSS je JS template literal: spätný apostrof v komentári zhodí build a `tsc`
//    to nechytí. Po zásahu do štýlov vždy `npm run build`.
// ════════════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import LanguagePicker from '@/components/LanguagePicker';
import { HandHouseHeart } from '@/components/pack/HandIcons';
import { LAB } from '@/lib/labTheme';
import { LIVE_EDGE_BASE } from '@/lib/env';
import { Seo } from '@/components/Seo';
import { GodsGridLab } from '@/components/gods/GodsGridLab';
import ReligionLab from '@/pages/ReligionLab';
import VisionLab from '@/pages/VisionLab';
import AboutLab from '@/pages/AboutLab';
import { Footer } from '@/components/landing/Footer';
import {
  NAV_R,
  NAV_GOLD,
  NAV_FRAME_BG,
  NAV_FRAME_BLEND,
  NAV_FRAME_SHADOW,
  NAV_PLATE_BG,
  NAV_PLATE_BLEND,
  NAV_PLATE_SHADOW,
  NAV_PILL_SHADOW,
  NAV_GRAIN_SCREEN_CSS,
} from '@/components/pack/navGoldSkin';
import NavMedallion, { NAV_MEDALLION_CSS } from './NavMedallion';

// ── Poradie obrazov filmu je NA JEDNOM MIESTE ───────────────────────────────
// Nav aj sledovanie aktívnej sekcie čítajú TOTO pole. Video a vízia sú jedna
// položka zámerne: `VisionLab` nesie oboje (video hero + vodorovný pás WHAT IF),
// rozdeliť ich by znamenalo rozrezať hotový komponent na dva.
const SCENES: { id: string; navKey: string }[] = [
  { id: 'home', navKey: 'nav.home' },
  { id: 'religion', navKey: 'nav.religion' },
  { id: 'vision', navKey: 'nav.vision' },
  { id: 'about', navKey: 'nav.about' },
];

/**
 * DĹŽKA PRECHODU 1. → 2. OBRAZU, v obrazovkách scrollu.
 * ⚠️ Toto je JEDINÝ ladiaci gombík tempa. Celá výmena sa odohráva na JEDNEJ
 * obrazovke, ktorá sa nehýbe (Matej 26. 8. 2026: *„scroll z 1. sekcie smerom
 * dolu — planétka sa stráca do pozadia aj s textom, obrazovka sa nehýbe smerom
 * dolu, pri miznutí z bokov vyliezajú krava a pes, scroll sa odohráva na jednej
 * obrazovke, text v strede fade in."*). Preto tu nie je žiadny „záporný okraj"
 * ani druhá dráha: guľa aj náboženstvo stoja od začiatku NA TOM ISTOM MIESTE,
 * scroll len prehadzuje, ktorý z nich je vidieť.
 * Číslo sedí naraz vo výške prilepenej sekcie (.op-scene--pin) a vo všetkých
 * úsekoch choreografie nižšie — meň ho TU.
 */
// ⚠️ 26. 8. 2026 zvysene z 1 na 3 (Matej: *„planetka sa schovava postupne na
// viacero slajdov."*). Obrazovka sa pritom stale NEHYBE — prilepena ostava,
// len drahu prechodu prejdes na tri otocenia kolieska namiesto jedneho, takze
// odchod gule ma cas byt pohybom a nie striedom.
const PIN_VH = 3;

/**
 * ÚSEKY CHOREOGRAFIE — všetko v podiele dráhy prechodu (0 = začiatok, 1 = koniec).
 * Prekrývajú sa ZÁMERNE. Keby na seba nadväzovali, vznikli by tri po sebe idúce
 * animácie namiesto jednej výmeny: guľa preč → prázdny papyrus → zvieratá →
 * prázdny papyrus → text. Prekryv je to, čo z toho robí jeden pohyb.
 */
/**
 * TEXT A „ADD PHOTO" ODCHÁDZAJÚ HNEĎ (Matej 26. 8. 2026: *„v momente scrolu
 * zmizne blok add photo"*). Sú to jediné dve veci na prvej obrazovke, ktoré
 * niečo PÝTAJÚ — kým si človek zvolil scroll, odpovedal, takže nemajú čo robiť
 * v prechode. Guľa za nimi hasne pomaly a sama.
 */
const HERO_OUT: readonly [number, number] = [0, 0.12];
/**
 * SPODNÁ LIŠTA ODCHÁDZA S PRVOU OBRAZOVKOU (Matej 26. 8. 2026: *„pri scrole
 * z 1 sekcie nakoniec predsa len odstráň celkom spodný nav"*).
 * ⚠️ Ruší to skoršie rozhodnutie z toho istého dňa — lišta sa mala pri scrolle
 * prezliecť z nástrojov na chip JOIN US a ostať na obrazovke po celý film.
 * Preto je `ctaMode` vo filme vypnutý: chip by nabehol a o pár pixelov zhasol.
 * Trochu pomalšie než text a ADD PHOTO — tri veci zhasnuté naraz vyzerajú ako
 * výpadok, nie ako odchod.
 */
const DOCK_OUT: readonly [number, number] = [0, 0.18];
/** Guľa hasne — kúsok ťahu na začiatku patrí ešte jej. */
const PLANET_OUT: readonly [number, number] = [0.06, 0.60];
/**
 * Ako ďaleko guľa odletí (Matej: *„planéta sa vzďaľuje z pôvodnej veľkosti
 * na 10%"*). 0.90 ⇒ mierka 1 → 0.10. Ide po TEJ ISTEJ dráhe ako hasnutie,
 * takže posledné, čo z nej vidno, je malý bod v diaľke — nie zhasnutá guľa
 * v pôvodnej veľkosti (to vyzerá ako stmievač, nie ako odchod).
 */
const PLANET_RECEDE = 0.90;
/**
 * Krava a Hektor lezú z bokov — začínajú ešte kým guľa dohasína.
 * ⚠️ 26. 8. 2026 posunuté SKÔR (bolo [0.20, 0.90]). Matej poslal screenshot
 * gule zmenšenej asi na tri štvrtiny a napísal: *„pri približne takomto stave
 * už začnú vyliezať postavy a text."* Ten záber sedí zhruba na štvrtine dráhy;
 * pri starom nábehu tam boli zvieratá ešte celé za hranou obrazovky.
 */
const ANIMALS_IN: readonly [number, number] = [0.10, 0.74];
/** Text v strede nastupuje posledný, ale do toho istého záberu — nie až za ním. */
const TEXT_IN: readonly [number, number] = [0.24, 0.92];
/**
 * SVÄTOŽIARA HEKTORA — pointa výjavu (Matej 27. 8. 2026). Krava ju má od začiatku,
 * Hektorova sa rozsvieti až na konci argumentu.
 *
 * 🔴 VLASTNÝ VÝSEK, NIE PRAH NA `--op-txt`. Prahy textu platia len pre variant 1
 * (šesť blokov, --tx-at). Variant 2 sa píše po znakoch a jeho posledný znak
 * dobieha až na `--op-txt` ≈ 1, takže prah odvodený z blokov by v ňom halo
 * rozsvietil doprostred vety. Vlastný výsek je nezávislý od oboch variantov.
 *
 * 🔴 ZAČÍNA S CTA, NIE AŽ ZA NÍM (Matej 28. 8. 2026: *„v tomto momente, ešte keď
 * sa nenačíta CTA, by sa mala zobraziť aj svätožiara — lebo sa zobrazí neskôr
 * a takmer to človek nezachytí."*). Pôvodných [0.92, 1.0] bolo postavených na
 * úvahe, že halo je odmena za doscrollovanie a má doraziť presne na odpočívadlo
 * snapu. Lenže tým padlo do posledných ~200 px dráhy, kde už scroll dobieha
 * zotrvačnosťou — človek sa medzitým pozerá na CTA v strede, a svetlo nad psom
 * na kraji obrazovky mu prebehne mimo pohľadu. Teraz nabieha SÚBEŽNE s CTA
 * a dosvieti ešte pred koncom dráhy — je teda na obrazovke dosť dlho na to, aby
 * si ho niekto všimol, a na odpočívadle už len svieti.
 *
 * ⚠️ SPODNÁ HRANICA SA VIAŽE NA CTA, NIE NA KONIEC DRÁHY. Odmerané vo variante 1
 * (ten Matej používa): 4. blok — CTA — nabieha od `p` ≈ 0.648 a dopĺňa sa
 * na 0.821. Výsek 0.60–0.82 teda leží presne na ňom. Keby halo skĺzlo výrazne
 * nižšie, rozsvieti sa uprostred „YET." a prestane byť odpoveďou naň.
 */
const HALO_IN: readonly [number, number] = [0.60, 0.82];
/**
 * Kedy sa spodná lišta prezlečie z nástrojov na CTA chip.
 * Viazané na dráhu prechodu, nie na vlastný prah v pixeloch — je to výmena
 * obsahu JEDNEJ lišty, takže musí sadnúť presne do stredu odchodu gule.
 */
const CTA_AT = 0.34;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Mäkké konce — lineárny priebeh vyzerá ako stmievač, nie ako pohyb. */
const ease = (v: number) => v * v * (3 - 2 * v);
/** Výsek dráhy: mimo [a, b] vracia 0, resp. 1. */
const seg = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

/** Míľniky zo `plany/severka.md`. Roky zámerne nikde — severka nemá deadline. */
const MILESTONES = [
  { n: '1 000', title: 'The Founders', note: 'The first thousand. Slovakia carries the flame.' },
  { n: '10 000', title: 'The Pack', note: 'Merch, the pack tree, the first shelters helped.' },
  { n: '100 000', title: 'The Nation', note: 'A full-time mission. The app in every pocket.' },
  { n: '1 000 000', title: 'First Aid', note: 'Shelters funded by the pack, not by pity.' },
  { n: '∞', title: 'The Pantheon', note: 'Every dog on Earth carries a name that lasts.' },
];

export default function OnePage() {
  const t = useT();
  const [scene, setScene] = useState(0);
  const [past, setPast] = useState(false);       // je už guľa preč?
  const [storyOpen, setStoryOpen] = useState(false);
  // Otvorena STENA (mozaika zo spodnej listy). Nie je to sekcia filmu — je to
  // odbocka, ktora sa sprava ako samostatna stranka. Viac pri useEffect nizsie.
  const [wallOpen, setWallOpen] = useState(false);
  /** Choreografia filmu — drží sa v refe, aby sa dala vyvolať aj mimo scrollu. */
  const applyRef = useRef<() => void>(() => {});
  // Ktorý obraz hlási pozorovateľ stredu okna. Držané v refe, lebo rozhodnutie
  // patrí scroll handleru — viď komentár pri pozorovateľovi nižšie.
  const sceneRef = useRef(0);
  const [dogCount, setDogCount] = useState<number | null>(null);

  // ── PRECHOD 1. → 2. OBRAZU ───────────────────────────────────────────────
  // Jedna obrazovka, ktorá sa nehýbe.
  //
  // 🔴 ZAPISUJE SA DO KONKRÉTNYCH PRVKOV, NIE DO <html>. Prvá verzia sypala
  // sedem CSS premenných na documentElement — a keďže vlastné premenné sa DEDIA,
  // každý zápis prepočítal štýl CELÉHO dokumentu. Odmerané na tejto stránke
  // (2 661 prvkov): **10 ms na snímok**, teda cez celý 60 fps rozpočet ešte
  // predtým, než prehliadač čokoľvek nakreslí. Presne to Matej opísal ako
  // *„nefunguje to, seká to, nie je to plynulé"*.
  // Preto: čo sa mení každý snímok, ide priamo na prvok (opacity/transform sa
  // NEDEDIA), a premenná ostala len tam, kde nesie LOCKED hodnotu z cudzieho
  // súboru (mierky kravy a Hektora) — a aj tá sedí na .codex-bleed, ktorý má
  // dve deti, nie na koreni.
  // ⚠️ Zapisuje sa LEN PRI ZMENE. Bez toho sa opakovaným zápisom tej istej
  // hodnoty zbytočne invaliduje štýl aj vtedy, keď scroll stojí.
  useEffect(() => {
    const q = <T extends Element>(sel: string) => document.querySelector(sel) as T | null;
    /** Prvky filmu sa mountujú postupne — kým chýbajú, hľadá sa znova. */
    let n: {
      planetRoot?: HTMLElement | null; stage?: HTMLElement | null; pHero?: HTMLElement | null;
      wall?: HTMLElement | null; ab?: HTMLElement | null;
      bleed?: HTMLElement | null; overlay?: HTMLElement | null;
      planet?: HTMLElement | null; film?: HTMLElement | null;
      dock?: HTMLElement | null;
    } = {};
    const resolve = () => {
      n = {
        planet: q<HTMLElement>('.op-planet'),
        film: q<HTMLElement>('.op-film'),
        // Lišta NIE JE vnútri .op-planet — wall ju kreslí portálom do <body>
        // (viď prop portalDock), takže sa hľadá v celom dokumente.
        dock: q<HTMLElement>('.gods-dock-portal'),
        planetRoot: q<HTMLElement>('.op-planet .planet-root'),
        stage: q<HTMLElement>('.op-planet .planet-stage'),
        pHero: q<HTMLElement>('.op-planet .planet-hero'),
        wall: q<HTMLElement>('.op-planet [role="application"]'),
        ab: q<HTMLElement>('.op-planet .ab-switch'),
        bleed: q<HTMLElement>('#op-religion .codex-bleed'),
        overlay: q<HTMLElement>('#op-religion .codex-section[data-idx="0"] .codex-3-overlay'),
      };
    };
    resolve();

    const prev: Record<string, string> = {};
    /** Zápis len pri zmene — inak sa štýl invaliduje aj keď scroll stojí. */
    const put = (el: HTMLElement | null | undefined, key: string, prop: string, val: string) => {
      if (!el || prev[key] === val) return;
      prev[key] = val;
      if (prop.startsWith('--')) el.style.setProperty(prop, val);
      else (el.style as unknown as Record<string, string>)[prop] = val;
    };

    let raf = 0;
    let tries = 0;
    const apply = () => {
      raf = 0;
      if (!n.planetRoot || !n.bleed) { if (tries++ < 60) resolve(); }
      const vh = window.innerHeight;
      const span = Math.max(1, vh * PIN_VH);
      const p = clamp01(window.scrollY / span);

      // GUĽA: hasne a zároveň sa vzďaľuje. Vzdialenie sedí na .planet-stage
      // a .planet-hero (nie na celom obale), aby sa spodná lišta nezmenšovala
      // spolu s ňou — tá ostáva na obrazovke aj po odchode gule.
      const o = 1 - seg(p, PLANET_OUT[0], PLANET_OUT[1]);
      // Mierka ide po TEJ ISTEJ dráhe ako hasnutie — inak by guľa zmizla skôr,
      // než sa stihne vzdialiť, a z odletu by ostal stmievač.
      const sc = (1 - PLANET_RECEDE * seg(p, PLANET_OUT[0], PLANET_OUT[1])).toFixed(4);
      // Nadpis, podnadpis a ADD PHOTO odchádzajú vlastnou, oveľa kratšou dráhou.
      const ho = (1 - seg(p, HERO_OUT[0], HERO_OUT[1])).toFixed(3);
      // ⚠️ Planéta má vlastnú priehľadnosť aj v CSS (zavretá = 0). Keď je zavretá
      // — človek si prepol na stenu — inline zápis sa MUSÍ stiahnuť, inak by ju
      // natrvalo rozsvietil nad stenou.
      const planetOpen = !!n.planetRoot?.classList.contains('open');
      put(n.planetRoot, 'pr', 'opacity', planetOpen ? o.toFixed(3) : '');
      // ⚠️ ZAPISUJE SA NÁSOBIČ, NIE HOTOVÝ TRANSFORM. Priamy zápis transformu
      // na prvok prebije každé CSS pravidlo — vrátane toho, ktorým sa guľa
      // uhýba panelu s kartou psa (a na mobile aj jej vlastnej mierky 0.62,
      // ktorú by absolútny scale ticho prepísal na 1). Premenná sedí na JEDNOM
      // prvku s dvoma deťmi, nie na koreni dokumentu — to bola tá pôvodná
      // chyba za 9,84 ms na snímok, a tá sa sem nevracia.
      put(n.stage, 'st', '--op-sc', sc);
      put(n.pHero, 'ph', 'transform', `translate(-50%, -50%) scale(${sc})`);
      put(n.pHero, 'pho', 'opacity', ho);
      // Zhasnutý blok nesmie ostať klikateľný — ADD PHOTO je pod prstom aj
      // vtedy, keď ho nevidno, a otvoril by nahrávanie fotky uprostred filmu.
      put(n.pHero, 'phpe', 'pointerEvents', ho === '0.000' ? 'none' : '');
      // Spodná lišta odchádza s prvou obrazovkou a už sa nevracia.
      const doc = (1 - seg(p, DOCK_OUT[0], DOCK_OUT[1])).toFixed(3);
      put(n.dock, 'dk', 'opacity', doc);
      put(n.dock, 'dkv', 'visibility', doc === '0.000' ? 'hidden' : '');
      // STENA SA POČAS ODCHODU NESMIE VYNORIŤ: na prvej obrazovke ju nekryje nič
      // iné než nepriehľadné pozadie planéty, takže len čo to pozadie začne
      // presvitať, vyplávajú spod gule karty psov aj wallový stred. Keď si človek
      // stenu vyslovene otvoril, hasne normálne s guľou.
      put(n.wall, 'wl', 'opacity', planetOpen ? '0' : o.toFixed(3));
      put(n.ab, 'ab', 'opacity', o.toFixed(3));   // dev prepínač A/B patrí prvej obrazovke

      // KRAVA A HEKTOR: 1 = celkom za hranou obrazovky, 0 = LOCKED poloha
      // z ReligionLab. Premenná ostáva premennou zámerne — mierky (PC 1.14/1.08,
      // mobil 1.377/1.352) sú LOCKED a patria do CSS, nie do tohto súboru.
      put(n.bleed, 'in', '--op-in', (1 - seg(p, ANIMALS_IN[0], ANIMALS_IN[1])).toFixed(3));
      // TEXT V STREDE: nabieha posledný.
      put(n.overlay, 'tx', '--op-txt', seg(p, TEXT_IN[0], TEXT_IN[1]).toFixed(3));
      // SVÄTOŽIARA HEKTORA: úplne posledná — je to odmena za doscrollovanie.
      // Sedí na bleede (tam žijú obe zvieratá aj obe halá), nie na texte.
      put(n.bleed, 'hl', '--op-halo', seg(p, HALO_IN[0], HALO_IN[1]).toFixed(3));

      // KRAVA A HEKTOR: ODSUN A STLMENIE SÚ OD 28. 8. 2026 DVE RÔZNE UDALOSTI.
      // Matej: *„pri prechode na 3 slajd krava aj pes vybledne — oprav to,
      // nebude bledý, vyblednú až na 4 DOGMA."*
      // Obrazovky filmu: 0–(PIN_VH+1) prilepený výjav · +1 preambula · +2 kniha.
      //
      // ODSUN DO STRÁN ostáva na preambule (nezmenené). Nie je to kozmetika:
      // pri plnej sile a bez odsunu tmavý Hektor zožerie konce piatich riadkov
      // („KAŽDÉHO", „POSTAVENIE", „OSUD", „ÚSTAVU" — odskúšané a odfotené).
      // Zúžiť text nepomôže: pri 1440 px siaha psí ňufák po 878 px, čo je 158 px
      // od stredu — stĺpec by musel mať 316 px.
      const sideAt = span + vh;
      const side = clamp01((window.scrollY - (sideAt - vh * 0.45)) / (vh * 0.45));
      put(n.bleed, 'sd', '--op-side', side.toFixed(3));
      // STLMENIE sa presunulo o obrazovku ďalej — na knihu. Preambula je stále
      // výjav kravy a psa a rám z nich je tam ŽELANÝ; ustúpiť majú až ústave,
      // ktorá je hustá na obsah.
      const bookAt = span + vh * 2;
      const dim = clamp01((window.scrollY - (bookAt - vh * 0.45)) / (vh * 0.45));
      put(n.bleed, 'bl', '--op-bleed', (1 - dim * 0.74).toFixed(3));

      // Tieto tri sa menia DVAKRÁT za celý film, tak smú ostať premennými.
      const gone = o <= 0.002;
      put(n.planet, 'vis', '--op-vis', gone ? 'hidden' : 'visible');
      put(n.planet, 'pe', '--op-pe', gone ? 'none' : 'auto');
      put(n.planet, 'cv', '--op-cv', gone ? 'hidden' : 'visible');
      // Film leží nad guľou, takže kým guľa svieti, musí byť pre prst priehľadný.
      put(n.film, 'fpe', '--op-film-pe', o <= 0.02 ? 'auto' : 'none');

      setPast(p >= CTA_AT);
      // Kým beží prechod, v nave svieti HOME. Sekcia náboženstva začína na tom
      // istom mieste ako guľa, takže sama od seba by sa označila hneď na štarte.
      // ⚠️ Rozhoduje sa TU, nie v pozorovateľovi. Pozorovateľ hlási len ZMENY:
      // stred okna leží vnútri náboženstva už od nultého pixela, takže jeho
      // jediné hlásenie príde na štarte — a keby ho vtedy zahodil vlastný
      // strážca prechodu, druhé by neprišlo nikdy a nav by ostal na HOME cez
      // celý prvý obraz. Odskúšané: presne to sa aj stalo.
      setScene(p < 0.55 ? 0 : sceneRef.current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    applyRef.current = apply;
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Ktorý obraz práve beží (podsvietenie v nave) ─────────────────────────
  useEffect(() => {
    // HOME sa zámerne NEsleduje: náboženstvo začína na tom istom mieste ako
    // guľa (prekryv o jednu obrazovku), takže by observer označil druhý obraz
    // hneď na štarte. Prvý obraz preto priraďuje scroll handler vyššie.
    const nodes = SCENES.filter((s) => s.id !== 'home')
      .map((s) => document.getElementById('op-' + s.id))
      .filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    // 🔴 SLEDUJE SA PRIESEČNÍK SO STREDOM OBRAZOVKY, NIE PODIEL PLOCHY.
    // Pôvodných `threshold: 0.3` nemohlo pri dvoch zo štyroch položiek naskočiť
    // NIKDY: sekcie sú vo filme oveľa vyššie než okno, takže ich najväčší možný
    // podiel je vlastná výška v pomere k výške sekcie — pri náboženstve ~0,25,
    // pri vízii ~0,13. V nave preto svietilo len HOME (to priraďuje scroll
    // handler vyššie) a O NÁS (jediná sekcia nižšia než obrazovka); NÁBOŽENSTVO
    // a VÍZIA nesvietili ani raz za celý film. Odmerané, nie odhadnuté.
    // Záporný okraj −50 % zhora aj zdola zmenší pozorovanú oblasť na jedinú
    // čiaru v strede okna — „beží ten obraz, ktorý je práve v strede". Dve
    // susedné sekcie ju nemôžu pretínať naraz, takže hlásenie je jednoznačné
    // a nič sa pritom nemeria (žiadne čítanie rozloženia v snímku scrollu).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = SCENES.findIndex((s) => 'op-' + s.id === e.target.id);
            if (i < 0) continue;
            sceneRef.current = i;
            // Zápis rovno do stavu je tu len pre stojaci scroll (zmena výšky
            // obsahu pod prstom, ktorý sa nehýbe). Kým sa scrolluje, prepisuje
            // to handler vyššie — a ten pozná aj prechod.
            if (window.scrollY >= window.innerHeight * PIN_VH * 0.55) setScene(i);
          }
        }
      },
      { threshold: 0, rootMargin: '-50% 0px -50% 0px' }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // ── Počet psov — to isté číslo, aké kreslí stenu ─────────────────────────
  // Zámerne cez existujúci `get-grid-dogs`, nie cez nový počítací endpoint:
  // číslo pod CTA a počet kariet na stene sa nesmú rozísť.
  useEffect(() => {
    let alive = true;
    fetch(`${LIVE_EDGE_BASE}/get-grid-dogs`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: unknown[]) => { if (alive && Array.isArray(d)) setDogCount(d.length); })
      .catch(() => { /* číslo je ozdoba, nie podmienka — sekcia funguje aj bez neho */ });
    return () => { alive = false; };
  }, []);

  const goTo = useCallback((id: string) => {
    // Prvý obraz nemá vlastnú kotvu — je prilepený na celý film, takže
    // scrollIntoView by naň neskočil. Jeho miesto je začiatok stránky.
    if (id === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById('op-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ── STENA JE SAMOSTATNÁ STRÁNKA, NIE OBRAZ FILMU ────────────────────────
  // Matej 27. 8. 2026: *„ONEPAGE je homepage planéta — kliknutím na spodný nav
  // 4 štvorce (grid) otvorí wall, to je samostatná stránka a teda scrolovanie
  // dolu nemá pokračovať v one page."*
  //
  // Dve veci naraz, a ani jedna nestačí sama:
  //  1. SKOK NA ZAČIATOK. Priehľadnosť steny riadi scroll (`o` v choreografii
  //     vyššie) — presne preto, aby sa počas odchodu gule nevynorila spod nej.
  //     Keby sa stena otvorila v polovici prechodu, prišla by rovno stlmená.
  //  2. ZÁMOK SCROLLU. Bez neho sa pod otvorenou stenou dá odscrollovať celý
  //     film — a keďže stena je `position: fixed`, vyzerá to tak, že sa nehýbe
  //     nič, kým pod ňou v tichosti odbehne polovica stránky.
  //
  // Zamyká sa INLINE zápisom: `html body { overflow: visible }` v štýloch nižšie
  // odomyká to, čo si wall zamyká sám, a inline zápis prebije aj to pravidlo.
  // (Ten istý mechanizmus používa popup s príbehom hneď pod týmto.)
  useEffect(() => {
    if (!wallOpen) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [wallOpen]);

  // 🔴 PREPNUTIE GUĽA ⇄ STENA MUSÍ PREPOČÍTAŤ CHOREOGRAFIU (Matej 27. 8. 2026:
  // *„potrebujeme upraviť aj WALL, lebo teraz sa po kliku na dolnom wall ani
  // neotvorí"*).
  // Choreografia vyššie beží LEN na scroll a resize — a prepnutie na stenu nie je
  // ani jedno. Stena pritom svoju priehľadnosť dostáva práve odtiaľ: kým je
  // otvorená guľa, zapíše sa jej natvrdo 0, aby počas odchodu gule nevyplávala
  // spod nej. Po kliku na mozaiku sa teda stena SKUTOČNE otvorila (trieda open
  // zmizla, scroll sa zamkol), ale ostala na tej zapísanej nule — navonok
  // „neotvorí sa", hoci je celá na mieste. Prvý scroll ju rozsvietil.
  // ⚠️ Beží AŽ ZA skokom na začiatok vyššie — apply() číta window.scrollY, takže
  // v opačnom poradí by prepočítalo film na starej polohe.
  useEffect(() => { applyRef.current(); }, [wallOpen]);

  // Popup s príbehom drží scroll stránky na mieste — bez toho sa pod ním
  // odscrolluje film a po zavretí sa človek ocitne inde, než odkiaľ odišiel.
  useEffect(() => {
    if (!storyOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setStoryOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [storyOpen]);

  return (
    <div className="op-root">
      <Seo path="/onepage" title="DOGYPT" description="One page, one story: the planet, the question, the vision, the pack." />
      <style>{`
        /* ── PLÁTNO ───────────────────────────────────────────────────────
           Papyrus je JEDEN na celý film a je fixed. Sekcie si vlastný podklad
           nesú tiež (.lab-papyrus), ale ten je pod nimi identický — tento
           drží farbu v medzerách a pri prehnutí (overscroll) na iOS. */
        /* ⚠️ ODOMKNUTIE SCROLLU — bez tohto sa film nedá posunúť VÔBEC.
           Wall si v GodsGridLab nastavuje body { overflow: hidden }, lebo mriežku
           si posúva sám a scroll stránky by mu do toho liezol. V LabShell to
           nevadí (tam scrolluje panel .lsh-scroll, nie okno), ale tu scrolluje
           OKNO — a wall je namontovaný ako prvý obraz, takže zamkne celý film.
           Navonok to vyzerá presne ako mŕtva stránka: guľa sa vykreslí, nav
           funguje, a scroll nerobí nič.
           html body je (0,0,2) proti holému body (0,0,1) ⇒ prebije bez ohľadu
           na to, ktorý <style> blok sa vloží neskôr. Popup príbehu si scroll
           zamyká inline (document.body.style.overflow), a inline zápis prebije
           aj toto — takže zámok popupu ostáva funkčný. */
        html body { overflow: visible; }

        .op-root {
          position: relative;
          background: ${LAB.pageBg};
          /* KOĽKO OBRAZOVKY ZHORA ZABERÁ HORNÁ LIŠTA. Medailón vystupuje nad ňu
             (.nav-top top 30 − MEDAL.lift 28 = 2, priemer 100 ⇒ spodok 112 px),
             zvyšok je vzduch pod ním. Kto číta výšku lišty, číta TOTO — nie
             vlastné číslo. Mobil: top 34 − 28 = 6 ⇒ spodok 106. */
          --op-nav-h: 124px;
        }
        .op-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background: ${LAB.pageBackdrop};
          z-index: 0;
          pointer-events: none;
        }

        /* ── OBRAZ 1 ⇄ OBRAZ 2 NA JEDNEJ OBRAZOVKE ────────────────────────
           Matej 26. 8. 2026: *„obrazovka sa nehýbe smerom dolu, scroll sa
           odohráva na jednej obrazovke."*
           Guľa je preto prilepená na CELÝ film (rodičom sticky je .op-stage,
           nie krátka dráha) a náboženstvo si svoj prvý výjav prilepí tiež.
           Nič sa neposúva — scroll len prehadzuje priehľadnosť a polohu zvierat.
           ⚠️ Guľa MUSÍ ostať prilepená aj po tom, čo dohasne: nesie SPODNÚ
           LIŠTU, ktorá podľa zadania zostáva na obrazovke po celý čas scrollu.
           Preto sa nehasí .op-planet (to by zhaslo aj lištu), ale iba tie dve
           vrstvy wallu, ktoré nesú obraz.
           ⚠️ transform NIE JE ozdoba: robí z hero elementu containing block,
           takže position: fixed deti wallu (.gods-root { inset: 0 }, planéta,
           spodná lišta) sa kotvia NAŇ a nie na okno. */
        /* Guľa stojí na TOM ISTOM papyruse ako zvyšok filmu.
           Wall si nesie vlastný nepriehľadný podklad (plná farba + radiálny
           gradient v ::before). Ten hasne spolu s hero, takže na jeho spodnej
           hrane — presne na 100dvh — vznikne ostrá vodorovná hrana medzi dvoma
           rôzne svetlými papyrusmi, ktorá sa cez celý prechod plazí obrazovkou.
           Rovnaký dôvod, pre ktorý sú priehľadné aj sekcie filmu nižšie. */
        .op-planet .gods-root { background-color: transparent; }
        .op-planet .gods-root::before { display: none; }

        .op-stage { position: relative; }
        /* ⚠️ TRIEDA SA VOLÁ .op-planet, NIE .op-hero. AboutLab.tsx ma vlastnu
           globálnu .op-hero { position: absolute; inset: 0 } (úvod pred crawlom)
           a je namontovaný v tom istom filme, takže by nám ju prebil. Prejavilo
           sa to tak, že prilepenie NEFUNGOVALO VÔBEC a záporný okraj filmu
           vytiahol celú stránku o obrazovku nad hranu okna. */
        .op-planet {
          position: sticky;
          top: 0;
          height: 100dvh;
          overflow: hidden;
          transform: translateZ(0);
          /* 🔴 POD FILMOM, A JE TO PODMIENKA, NIE VOĽBA. Prilepený obal s
             transformom a fixed deťmi, ktorý leží NAD filmom (z-index 3),
             prinúti Chrome prestať kresliť všetko pod sebou: sekcie ostanú
             v DOM, na správnych súradniciach, klikateľné a s opacity 1 — a
             obrazovka je prázdny papyrus. Odskúšané: pri z-index 1 sa film
             vykreslí okamžite, bez jedinej ďalšej zmeny.
             Spodná lišta preto NEMÔŽE ostať vnútri — musí byť nad obsahom,
             takže ju wall vykresľuje portálom do <body> (prop portalDock). */
          z-index: 1;
          /* Prázdna doska cez celú obrazovku by inak zožrala kliky do filmu.
             Kým je guľa na obrazovke, nechávame ju živú (nič sa nemení oproti
             pôvodnému stavu); až keď dohasne, ostane klikateľná len lišta. */
          pointer-events: var(--op-pe, auto);
        }
        /* ── ČO HASNE A ČO OSTÁVA ─────────────────────────────────────────
           ⚠️ .gods-root NIE JE stena — je to OBAL CELÉHO WALLU a je v ňom aj
           spodná lišta, kalkulačka a planéta. Zhasnúť ho znamená zhasnúť aj
           lištu, ktorá má podľa zadania ostať po celý film (a vyzerá to ako
           mŕtva stránka: v DOM je všetko na svojom mieste a klikateľné, len to
           nikto nevidí). Hasnú preto výhradne vrstvy, ktoré nesú OBRAZ.
           Stena samotná nemá triedu — kreslí sa do [role="application"]. */
        /* ⚠️ PRIEHLADNOST A MIERKU GULE PISE JS PRIAMO DO PRVKOV, nie cez
           dedenu premennu. Dovod je v komentari pri useEffect: premenna na
           koreni prepocita styl celeho dokumentu — odmerane 10 ms na snimok.
           Tu ostava len to, co sa meni dvakrat za cely film. */
        .op-planet .gods-root > *:not(.gods-bottom-bar) {
          visibility: var(--op-vis, visible);
          /* Nielen skryt — PRESTAT KRESLIT. Gula je prilepena na cely film, takze
             bez tohto by kompozitor niesol stenu (71 kariet) aj globus (~1000
             dlazdic v 3D) po celej jeho dlzke. content-visibility: hidden je presne
             na to: obsah sa preskoci a pri navrate hore sa vrati bez prekreslenia
             od nuly (na rozdiel od display: none). */
          content-visibility: var(--op-cv, visible);
        }
        /* Planéta má vlastný 420 ms fade na prepínanie stena ⇄ guľa. Pri scrolle
           by z neho bolo oneskorenie — guľa by za prstom trielila. */
        .op-planet .planet-root { transition: opacity 120ms linear; }
        /* ── GUĽA MUSÍ BYŤ PRE PREHLIADAČ JEDEN HOTOVÝ OBRÁZOK ────────────
           Matej 26. 8. 2026: *„extrémne to seká… z planétky sa stane jeden
           obrázok? proste musí to byť plynulé."* Presne tak to aj funguje —
           len sa to nedosahuje odfotením, ale sľubom dopredu.
           will-change je ten sľub: prehliadač si guľu odloží ako samostatnú
           vrstvu, zrasteruje ju RAZ a zmenu mierky aj priehľadnosti potom robí
           grafická karta. Bez neho prekresľuje celý 3D strom pri každom novom
           scale — aby ostal ostrý — teda v každom snímku scrollu.
           ⚠️ Podmienkou je, že sa OBSAH vrstvy nemení: otáčanie preto počas
           scrollu stojí (scrollingRef v DogPlanetLab). Bez tej druhej
           polovice je toto pravidlo len spotrebovaná pamäť.
           ⚠️ Zapísané LEN pod .op-planet — mimo filmu (/wall-lab, stena)
           sa guľa netransformuje a trvalá vrstva by tam bola len réžia navyše. */
        .op-planet .planet-stage { will-change: transform, opacity; }
        .op-planet .planet-root { will-change: opacity; }
        .op-planet .planet-hero { will-change: transform, opacity; }
        /* Krava a Hektor prichádzajú posunom — nech ho tiež robí karta a nie
           prepočet rozloženia (Matej: *„krava a pes sa tiež načítavajú plynule"*). */
        .op-root.op-root .codex-bleed .codex-cow,
        .op-root.op-root .codex-bleed .codex-hektor { will-change: transform; }
        /* „Stráca sa DO POZADIA" — guľa aj text sa pritom vzdialia. Škáluje sa
           len obsah scény, nie .op-planet: v ňom visí aj spodná lišta, ktorá sa
           zmenšovať nesmie. */
        /* Mierku pise JS; tu treba vypnut len 620 ms prechod, ktory by pri
           scrolle sposobil, ze gula trieli za prstom. */
        .op-planet .planet-root.open .planet-stage { transition: none; }

        /* ── FILM ─────────────────────────────────────────────────────────
           Záporný okraj o presne jednu obrazovku vťahuje film NA guľu: prvý
           výjav náboženstva tak stojí od začiatku na tom istom mieste, len je
           neviditeľný. Bez neho by musel priplávať zdola — a práve to Matej
           zamietol („obrazovka sa nehýbe smerom dolu"). */
        .op-film {
          position: relative;
          z-index: 2;
          margin-top: -100dvh;
          /* Film leží NAD guľou od prvého pixela, takže by jej vzal prst:
             ťahanie planéty ani kliky na karty by sa k nej nedostali. Kým je
             guľa na obrazovke, film je pre prst priehľadný. */
          pointer-events: var(--op-film-pe, auto);
        }
        /* PAPYRUS JE VO FILME JEDEN — ten na .op-root, a je pod všetkým.
           Každá lab stránka si vlastný podklad nesie sama (.lab-papyrus plus
           jeho ::before) a ten ::before je position: fixed. Bez transformovaného
           predka sa fixed kotví na OKNO, takže podklad náboženstva sa roztiahol
           cez celú obrazovku a zakryl planétu — sekcia ležiaca o obrazovku nižšie
           prekryla tú, ktorá práve bežala. Vidieť bolo presne jeho gradient.
           Vypnutie oboch má aj druhý účel, ktorý je vlastne ten hlavný: sekcie
           sú tým PRIEHĽADNÉ, takže odchod planéty a príchod kravy sa naozaj
           prekrývajú. S nepriehľadným podkladom by planéta zmizla skokom pod
           doskou, nech by mala akúkoľvek priehľadnosť. */
        .op-film .lab-papyrus { background-color: transparent; }
        .op-film .lab-papyrus::before { display: none; }
        /* ⚠️ A TO ISTÉ PLATÍ PRE ZÁVOJ. Vízia aj Príbeh si kreslia vlastnú
           position: fixed vrstvu s LAB.pageVeil — každá 30 % bielej cez celé
           okno. Vo filme sú namontované obe naraz od začiatku, takže sa sčítali
           a bielili VŠETKO vrátane prvej obrazovky s guľou: čistá červená sa na
           nej vykreslila ako rgb(255,127,125). Presne toto Matej videl ako
           „logo aj CTA sú zahmlené a nevýrazné" — nebola to farba prvkov. */
        .op-film .lab-pageveil { display: none; }
        .op-scene { position: relative; }

        /* ── FILM SA POSÚVA PO STRÁNKACH (snap) ───────────────────────────
           Matej 27. 8. 2026: *„dlhý slajd neprejde z prvého na 4 ale snipne sa
           na druhom, druhý na 3 a podobne, aby to nezostávalo zaseknuté
           uprostred a malo to pocit prezentácie po stránkach."*

           🔴 proximity, NIE mandatory. Vo filme sú tri bloky vyššie než
           obrazovka (vodorovný pás WHAT IF vo vízii, časová os a recenzie
           v O NÁS, ústava). Pri mandatory prehliadač VŽDY odpočíva na
           najbližšom bode, takže ich stred sa stane nedosiahnuteľným — scroll
           z neho človeka stále vyhodí. proximity snapne len vtedy, keď ťah
           skončí blízko hrany, a uprostred dlhého bloku nechá čítať.

           🔴 scroll-snap-stop: always TU BOLO A JE PREČ (Matej 28. 8. 2026:
           *„nemám pocit že je to plynulé 1-2-2-3… malo by to byť smooth na jedno
           potiahnutie + prichytenie na viewport obrazovky, bez zbytočného
           zápasenia, ľahký snap nemusí byť agresívny — je to prezentácia, kto
           začne swajpovať nenarazí na odpor, skôr ho hodí ďalej než dozadu."*).
           Robilo presný opak toho, čo malo: značky v prechode stoja po jednej
           obrazovke, takže KAŽDÝ ťah kolieskom sa zastavil na tej najbližšej
           a odchod gule sa rozpadol na tri vynútené zastávky namiesto jedného
           plynulého pohybu. To je to „1-2-2-3". Bez neho ostáva proximity: ťah
           dobehne zotrvačnosťou a odpočinie na najbližšej značke — teda sa
           prichytí na obrazovku, ale nikoho po ceste nezastaví.
           ⚠️ Cena je vedomá: rýchly švih vie teraz prechod preletieť. Matej to
           v tom istom zadaní berie („kto začne swajpovať… skôr ho hodí ďalej").
           Kto scrolluje normálne, choreografiu vidí celú.

           ⚠️ Nie je to nový nápad v tomto súbore — VisionLab.tsx má ten istý
           recept (html scroll-snap-type: y proximity + .wf-pin) a je vo
           filme namontovaný, takže snap tu už bežal, len s jediným bodom.
           Opakuje sa tu ZÁMERNE: film nesmie závisieť na tom, či je vízia
           práve v strome.

           ⚠️ Iba desktop, rovnako ako vo VisionLab. Na mobile mení lišta
           prehliadača 100dvh počas scrollu — značky by sa pod prstom hýbali.

           ⚠️ .codex-flow .codex-section si snap vypína (ReligionLab ho v režime
           filmu ruší), preto sa sem zapisuje cez #op-religion — (1,2,0) prebije
           jeho (0,2,0) bez ohľadu na poradie vloženia štýlov. */
        .op-snaps { position: absolute; top: 0; left: 0; width: 1px; height: 0; pointer-events: none; }
        .op-snaps > span { position: absolute; left: 0; width: 1px; height: 1px; }
        @media (min-width: 768px) {
          html { scroll-snap-type: y proximity; }
          .op-snaps > span,
          .op-root #op-religion .codex-section[data-idx="1"],
          .op-root #op-religion .codex-section[data-idx="2"],
          .op-root #op-vision,
          .op-root #op-about,
          .op-root .op-timeline,
          .op-root #op-join {
            scroll-snap-align: start;
          }
          /* Podpis a pätička snap bod NEMAJÚ — koniec stránky nie je obraz
             a zastavenie na ňom by bránilo dojazdu na pätu. */
        }

        /* ── PRVÝ VÝJAV NÁBOŽENSTVA JE PRILEPENÝ ──────────────────────────
           Sekcia je o dĺžku prechodu vyššia než obrazovka a jej obsah v nej
           stojí. Tým vznikne dráha scrollu, počas ktorej sa NIČ neposúva —
           mení sa len to, čo je vidieť. Po jej konci sa výjav odlepí a odchádza
           hore úplne normálne, ako každý iný.
           align-items: flex-start je nutnosť: sekcia je flex a s pôvodným
           center by prilepený obsah začínal až v polovici jej výšky, takže by
           sa prilepil až v polovici prechodu. */
        .op-root #op-religion .codex-section[data-idx="0"] {
          min-height: calc(100dvh + ${PIN_VH * 100}dvh);
          align-items: flex-start;
        }
        .op-root #op-religion .codex-section[data-idx="0"] .codex-slider {
          position: sticky;
          top: 0;
          height: 100dvh;
          min-height: 100dvh;
        }

        /* ── PREAMBULA SA MUSÍ ZMESTIŤ POD LIŠTU ──────────────────────────
           Matej 28. 8. 2026 (screenshot zastavenej obrazovky): *„musíme to
           všetko zmenšiť a centrovať tak, aby sa to vošlo pod NAV BAR."*

           Príčina merateľná, nie odhadnutá: výjav je stavaný na 100dvh a
           centruje sa v CELEJ obrazovke, lenže horná lišta je fixed a siaha
           s medailónom po 112 px. Obsah preambuly meria pri 1512×704 spolu
           572 px a začína 100 px od vrchu sekcie — teda 12 px POD spodkom
           medailónu, čiže nadpis IN DOG lezie do lišty. Na Matejovom okne
           (~550 px na výšku) chýba ešte vyše 170 px a výjav sa zreže.

           Riešenie má dve polovice a obe sú nutné:
             1. sekcia si hore rezervuje výšku lišty (--op-nav-h) a centruje
                sa v tom, čo ostane — takže „stred" je stred VIDITEĽNEJ plochy,
                nie stred okna;
             2. písmo a rozostupy dostávajú strop vo vh, takže na nízkom okne
                klesnú samy. Bez druhej polovice by prvá len posunula rez nižšie.

           ⚠️ Scoped na film ZÁMERNE. .codex-headline a spol. majú v
           ReligionLab.tsx 🔒 LOCK PC HARD (2026-05-24) a samostatná
           /religion-lab hornú lištu nemá — problém je náš, tak aj oprava.
           Odmerané po zásahu (obsah / voľné miesto pod lištou): 1000×547
           167→491 px · 1000×450 158→405 · 1000×676 208→576 · 1512×704
           188→624. Všade centrované a s rezervou hore aj dole. */
        .op-root #op-religion .codex-section[data-idx="1"] {
          box-sizing: border-box;
          padding-top: var(--op-nav-h);
          padding-bottom: clamp(10px, 2.4vh, 28px);
          align-items: center;
        }
        /* .codex-flow .codex-slider ma min-height: 100dvh — vnútri sekcie
           s rezervou hore by to bola presne tá výška, ktorá sa nezmestí. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-slider {
          height: auto;
          min-height: 0;
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-slide {
          padding-top: 0;
          padding-bottom: 0;
        }
        /* Veľkosti sa NEPREPISUJÚ, len STROPUJÚ VÝŠKOU OKNA. Vnútri min() sedí
           presne pôvodná hodnota z ReligionLab.tsx — na vysokom okne teda platí
           doteraz odsúhlasený vzhľad a na nízkom klesne len o toľko, o koľko
           treba. Prepísať ich vlastnými číslami by znamenalo ladiť LOCKED
           typografiu nanovo, a to zadanie nepýta. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-headline {
          font-size: min(clamp(2.71rem, 6.5vw, 5.05rem), 9.3vh);
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-wrap {
          max-width: 720px;
          padding: min(clamp(26px, 3.6vh, 44px), 3.4vh) clamp(22px, 3.4vw, 44px);
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-text {
          font-size: min(clamp(1.09rem, 1.66vw, 1.47rem), 3.15vh);
          line-height: 1.5;
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-slide > * + * {
          margin-top: min(clamp(28px, 4.5vh, 48px), 3.6vh);
        }
        @media (max-width: 767px) {
          /* Mobil má vlastné (LOCKED) hodnoty a musí sa uviesť zvlášť: pravidlo
             vyššie nesie DESKTOPOVÝ clamp, takže bez tejto vetvy by nadpis na
             390 px spadol zo 44,8 px (2.8rem) na 25 px (6.5vw). */
          .op-root #op-religion .codex-section[data-idx="1"] .codex-headline {
            font-size: min(2.8rem, 9.3vh);
          }
          .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-text {
            font-size: min(14px, 3.15vh);
            line-height: 1.4;
          }
          .op-root #op-religion .codex-section[data-idx="1"] .codex-slide > * + * {
            margin-top: min(clamp(18px, 3vh, 28px), 3.6vh);
          }
        }

        /* ── ÚSTAVA: NADPIS POD KNIHOU, CHIP POD NADPISOM ─────────────────
           Matej 28. 8. 2026: *„musíme dať nadpis (biblia…) pod knihu a pod
           nadpis mini chip s infom o otvorení knihy."*

           Na samostatnej /religion-lab visí nadpis absolútne NAD knihou. Vo
           filme mu tam stojí horná lišta: odmerané 21–59 px od vrchu sekcie,
           teda celý pod medailónom (spodok 112 px) — nebolo ho vidieť vôbec.
           Poradie je preto obrátené: kniha → nadpis → chip, a celý stĺpec sa
           centruje POD lištou (--op-nav-h, ten istý zdroj ako preambula).

           Nadpis je v DOM-e vnútri .cb-wrap (prop belowBook), aby zdieľal
           sústavu s chipom — ten sa kotví cez --cb-h, ktoré žije práve tam.

           🔴 CHIP AJ NADPIS IDÚ DO TOKU. Na PC je .cb-hint absolútny s
           dopočítanou polohou od stredu knihy; s nadpisom medzi nimi by sa
           tá istá vzdialenosť musela počítať dvakrát a rozišla by sa pri
           prvej zmene písma. V toku ich drží poradie v DOM-e.
           ⚠️ Cena: keď sa kniha OTVORÍ, chip zmizne (nahradia ho šípky, tie
           absolútne ostávajú) a nadpis vyskočí o jeho výšku hore. Je to
           jednorazový posun v momente, keď sa aj tak mení celý výjav.

           ⚠️ scale(0.85) NEMENÍ miesto v layoute — kniha si drží box --cb-h,
           hoci vizuálne meria 0.85 z neho. Bez záporného okraja by pod ňou
           ostalo 7,5 % mŕtveho pásu na každej strane (pri 1440×704 to je 37 px)
           a nadpis by visel priďaleko. Preto margin-block. */
        .op-root #op-religion .codex-section[data-idx="2"] {
          box-sizing: border-box;
          padding-top: var(--op-nav-h);
          padding-bottom: clamp(8px, 2vh, 24px);
        }
        .op-root #op-religion .codex-section[data-idx="2"] .codex-slider,
        .op-root #op-religion .codex-section[data-idx="2"] .codex-slide {
          height: auto;
          min-height: 0;
        }
        .op-root #op-religion .codex-section[data-idx="2"] .cb-wrap {
          height: auto;
          gap: 0;
        }
        /* MIERKA KNIHY JE PREMENNÁ, NIE ČÍSLO. calcDims() v ConstitutionBook
           berie knihe 70 % výšky okna, čo pri pôvodnom scale 0.85 nenechá pod ňou
           miesto na nadpis a chip: pri 1000×547 preliezol stĺpec obrazovku
           o 19 px. Na nízkom okne preto kniha ustúpi — a záporný okraj sa počíta
           Z TEJ ISTEJ premennej, inak by pod knihou ostal mŕtvy pás
           ((1 − k) / 2 z --cb-h) presne vtedy, keď je miesta najmenej. */
        .op-root #op-religion .codex-section[data-idx="2"] .cb-wrap { --op-bookk: 0.85; }
        @media (max-height: 660px) {
          .op-root #op-religion .codex-section[data-idx="2"] .cb-wrap { --op-bookk: 0.74; }
        }
        @media (max-height: 520px) {
          .op-root #op-religion .codex-section[data-idx="2"] .cb-wrap { --op-bookk: 0.66; }
        }
        .op-root #op-religion .codex-section[data-idx="2"] .cb-stage {
          transform: scale(var(--op-bookk));
          margin-block: calc(var(--cb-h) * (var(--op-bookk) - 1) / 2);
        }
        .op-root #op-religion .codex-book-title--below {
          position: static;
          transform: none;
          margin-top: clamp(8px, 1.8vh, 16px);
          white-space: normal;
        }
        .op-root #op-religion .codex-section[data-idx="2"] .cb-hint {
          position: static;
          transform: none;
          margin-top: clamp(6px, 1.2vh, 12px);
        }

        /* ── KRAVA A HEKTOR: PRÍCHOD AJ ODCHOD JEDNOU ROVNICOU ────────────
           Matej: *„pri miznutí z bokov vyliezajú krava a pes"* — a k odchodu
           (26. 8. 2026): *„v momente ako nastupuje text in dog we trust majú
           ísť plynule od seba, ale seknú sa na stranu bez plynulého oddialenia."*

           Sú to DVA pohyby tej istej dvojice a pôvodne ich riadili dva rôzne
           mechanizmy, čo je práve ten sek:
             --op-in   1 = za hranou obrazovky, 0 = LOCKED poloha z ReligionLab
             --op-side 0 = na mieste, 1 = odsunuté o 25 % (odchod na preambulu)
           Obe počíta scroll, sčítavajú sa v jednom calc a idú plynulo.

           🔴 ZDVOJENÉ .op-root.op-root NIE JE PREKLEP — je to celá oprava.
           Pôvodné .op-root (0,3,0) malo v komentári napísané, že prebíja aj
           .codex-bleed:not(.active) .codex-cow. NEPREBÍJALO: tá má tiež (0,3,0)
           a ReligionLab sa vkladá NESKÔR, takže vyhrávala ona. Kým mal bleed
           triedu .active, nebolo to vidieť (:not nematchoval); v momente, keď
           ju na preambule stratil, prevzala riadenie ona — a keďže transition
           je tu vypnutá, zvieratá **skočili** na -25 % namiesto plynulého
           odchodu. Odmerané v CSSOM, nie odhadnuté.
           Dvojtriedny zápis (0,4,0) vyhrá bez ohľadu na poradie vloženia.

           ⚠️ transition MUSÍ ostať vypnutá — pôvodných 650 ms je pri scrolle
           oneskorenie a zvieratá by za prstom kĺzali. Plynulosť tu nerobí
           prechod, ale to, že hodnotu mení scroll v každom snímku. */
        .op-root.op-root .codex-bleed .codex-cow,
        .op-root.op-root .codex-bleed .codex-hektor { transition: none; }
        .op-root.op-root .codex-bleed .codex-cow {
          transform: translateX(calc(var(--op-in, 0) * -120% + var(--op-side, 0) * -25%)) scale(1.14);
        }
        .op-root.op-root .codex-bleed .codex-hektor {
          transform: translateX(calc(var(--op-in, 0) * 120% + var(--op-side, 0) * 25%)) scale(1.08);
        }
        /* Mobil má vlastné (tiež LOCKED) mierky — 1.377 / 1.352. Jedna spoločná
           hodnota by jednu z vetiev ticho prepísala. */
        @media (max-width: 767px) {
          .op-root.op-root .codex-bleed .codex-cow {
            transform: translateX(calc(var(--op-in, 0) * -120% + var(--op-side, 0) * -25%)) scale(1.377);
          }
          .op-root.op-root .codex-bleed .codex-hektor {
            transform: translateX(calc(var(--op-in, 0) * 120% + var(--op-side, 0) * 25%)) scale(1.352);
          }
        }

        /* ── SVÄTOŽIARA HEKTORA: VO FILME JU RIADI SCROLL, NIE ČASOVAČ ────
           Na samostatnej /religion-lab spúšťa halo časovač (--halo-delay
           v ReligionLab.tsx). Vo filme by sa bil so scrollom presne tak, ako
           sa bili časovače textu — preto sa tu vypína a hodnotu preberá
           --op-halo z výseku HALO_IN, teda AŽ ZA celým textom (oba varianty).

           🔴 ZDVOJENÉ .op-root.op-root z rovnakého dôvodu ako pri zvieratách
           vyššie: .codex-bleed.active .codex-halo-hektor má (0,3,0) a
           ReligionLab sa vkladá NESKÔR, takže pri zhode by vyhrala ona a halo
           by na konci filmu naskočilo s 2,7-sekundovým oneskorením.

           ⚠️ 320 ms zmäkčenie ostáva ZÁMERNE, hoci zvieratá ho mať nesmú.
           Tam bol prechod oneskorením za prstom; tu je to tá istá poistka,
           akú má text (220 ms linear) — proti šklbaniu pri rýchlom scrolle.
           Nábeh samotný robí dráha scrollu, nie tento prechod. */
        .op-root.op-root .codex-bleed .codex-halo-hektor {
          --halo: var(--op-halo, 0);
          transition: opacity 320ms linear;
          transition-delay: 0s;
        }
        .op-root.op-root .codex-bleed .codex-halo-hektor .codex-halo-scale {
          transition: transform 320ms linear;
          transition-delay: 0s;
        }

        /* ── TEXT V STREDE SA ODHAĽUJE PO RIADKOCH, PODĽA SCROLLU ─────────
           Matej: *„text v strede fade in."* → 27. 8. 2026: *„musíme nastaviť aj
           logiku zobrazenie nech je to zaujímavejšie = postupné odhaľovanie /
           čítanie textu."*
           Nie je to reveal stránky (ten je vo filme vypnutý, viď .codex-flow
           v ReligionLab.tsx) a NIE JE to ani časovaná animácia: odhaľovanie visí
           na TEJ ISTEJ premennej --op-txt, ktorou film riadi nábeh textu. Preto
           sa nemá s čím biť — človek si tempo čítania riadi scrollom sám a pri
           scrollovaní späť sa veta rovnako zloží.
           Každý riadok má vlastný prah --tx-at; od neho nabehne za ~0,29 dielika
           (1/3.4). Prahy kopírujú stavbu argumentu, nie rovnomerný stagger.
           Od 27. 8. 2026 sú bloky ŠTYRI (nový texting „YET.", predtým šesť):
             0.00  krava — A COW HAS 1.2 BILLION BELIEVERS
             0.20  pes — A DOG HAS NONE (pauza, prichádza druhá strana)
             0.44  YET. (najväčšia pauza — obrat má doraziť do ticha)
             0.64  CTA
           Svätožiara Hektora ostáva ÚPLNE POSLEDNÁ (HALO_IN 0.92–1.0): „YET."
           teda stojí na obrazovke, keď sa svetlo rozsvieti — slovo je sľub,
           svetlo jeho splnenie. Preto sa poradie nemá prehadzovať.
           ⚠️ Posledný prah + 0.29 musí ostať pod 1.0, inak sa CTA nedopočíta do
           plnej krycej hodnoty a ostane priesvitné aj na konci výjavu. */
        .op-root #op-religion .codex-section[data-idx="0"] .codex-3-overlay > * {
          opacity: clamp(0, calc((var(--op-txt, 1) - var(--tx-at, 0)) * 3.4), 1);
          transform: translateY(calc(
            (1 - clamp(0, calc((var(--op-txt, 1) - var(--tx-at, 0)) * 3.4), 1)) * 16px
          ));
        }
        /* Časovač zo standalone verzie sa tu MUSÍ vypnúť. ReligionLab dáva každému
           riadku transition-delay až 1900 ms — vo filme by to znamenalo, že text
           dobieha takmer dve sekundy po tom, čo ho scroll odkryl, a pri scrollovaní
           späť sa zasekne v polovici. Krátky prechod ostáva, aby rýchly scroll
           netrhal; tempo určuje --op-txt. */
        .op-root #op-religion .codex-section[data-idx="0"] .codex-3-overlay > * {
          transition: opacity 220ms linear, transform 220ms linear;
          transition-delay: 0s;
        }
        /* ── VARIANT 2: ODHAĽOVANIE JE PO ZNAKOCH, NIE PO BLOKOCH ─────────
           Prahy --tx-at nižšie platia pre variant 1 (šesť blokov pod sebou).
           Variant 2 je jeden odsek, ktorý sa PÍŠE — poradie nesie --i na
           každom znaku, takže blokové prahy sa tu musia vypnúť, inak by odsek
           najprv nabehol ako celok a až potom sa „písal".
           --n = počet znakov, dodáva ho React na kontajner; bez neho by CSS
           nevedelo, akou rýchlosťou má scroll znaky odkrývať. */
        .op-root #op-religion .codex-3-overlay.is-v2 > * {
          opacity: 1;
          transform: none;
        }
        .op-root #op-religion .v2-ch {
          animation: none;
          opacity: clamp(0, calc((var(--op-txt, 1) * var(--n, 120) - var(--i, 0)) * 0.5), 1);
        }
        .op-root #op-religion .codex-3-overlay > *:nth-child(1) { --tx-at: 0.00; }
        .op-root #op-religion .codex-3-overlay > *:nth-child(2) { --tx-at: 0.20; }
        .op-root #op-religion .codex-3-overlay > *:nth-child(3) { --tx-at: 0.44; }
        .op-root #op-religion .codex-3-overlay > *:nth-child(4) { --tx-at: 0.64; }

        /* CTA druhého obrazu sa VRÁTILO (Matej 27. 8. 2026 — zadanie textingu
           sekcie končí riadkom „We only need one million to change that." +
           [BECOME DOGYPTIAN]). Prebíja to jeho vlastné rozhodnutie z 26. 8.
           („cta v 2 sekcii tým pádom nebude, bude priamo v nave po celý čas
           scrolingu") — dôvodom je, že sekcia medzitým dostala otočný bod
           („AND NOT ONE OF THEM BOWS."), z ktorého má výzva priamo padať;
           bez tlačidla ten riadok vyznie do prázdna.
           ⚠️ Tlačidlo je tým pádom na obrazovke DVAKRÁT — tu aj v spodnej lište.
           Ak sa to má vrátiť späť, stačí obnoviť display:none na tomto
           pravidle; veta nad ním ostane a je samonosná. */
        .op-root .codex-cta-cluster { display: flex; }

        /* ── HORNÝ NAV ────────────────────────────────────────────────────
           Druhá kópia odliatku z LabShell (viď hlavička súboru). Skladba:
           RÁM (leštené zlato) → DOSKA (pieskovec) → ZRNO → OBSAH.
           Tokeny z navGoldSkin.ts, neopisuj ich. */
        /* 🔴 PÁS CEZ CELÚ ŠÍRKU, NIE left:50% + translateX(-50%), A JE TO
           JEDINÝ DÔVOD, PREČO BOL MEDAILÓN NA MOBILE MIMO STREDU (Matej 28. 8.
           2026: *„MOBIL AJ PC logo v nav bude presne v strede… aktuálne na PC je
           niečo iné ako na mobile"*).
           Fixovaný prvok s left:50% má k dispozícii len PRAVÚ POLOVICU okna
           (390 − 195 = 195 px). Lišta sa doňho nezmestí, takže sa zmrští na
           min-content — a v min-content sizingu dostane každý 1fr stĺpec svoju
           vlastnú min-content šírku, teda ľavý 80,6 px a pravý 90,9 px. Medailón
           v strednom stĺpci tým sadol 5,1 px vľavo od stredu lišty.
           Na PC bola tá istá lišta v poriadku len náhodou: dostupná šírka (720 px)
           tam prevýšila max-content, takže sa použilo max-content sizing, kde
           fr-algoritmus dá OBOM krajným stĺpcom rovnakú šírku.
           Pás cez celú šírku dá lište celé okno, takže max-content sizing platí
           na oboch — jeden mechanizmus, jeden výsledok.
           ⚠️ pointer-events: none je povinné: pás leží cez celú hornú hranu
           filmu a bez toho by chytal ťahy určené guli. */
        .nav-top {
          position: fixed;
          /* 30 px, nie 12: medailón vystupuje nad lištu (MEDAL.lift) a pri pôvodnom
             odsadení mu horný oblúk vyšiel za okraj okna a orezal sa. */
          top: 30px;
          left: 0;
          right: 0;
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          pointer-events: none;
        }
        .nav-top > * { pointer-events: auto; }
        .main-nav {
          position: relative;
          isolation: isolate;
          /* ⚠️ GRID, NIE FLEX — nutnosť, nie vkus: medailón je kotvený na stred
             LIŠTY, takže medzera preňho musí byť v strede. Pri flexe je stred lišty
             stredom medzery len vtedy, keď je pilulka rovnako široká ako login
             s jazykom; inak kruh sadne na pilulku (na mobile presne to robil).
             Krajné stĺpce 1fr sú preto rovnaké a stredný nesie medzeru. */
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 14px;
          white-space: nowrap;
          padding: ${NAV_R.rim + 5}px ${NAV_R.rim + 15}px;
          background: ${NAV_FRAME_BG};
          background-blend-mode: ${NAV_FRAME_BLEND};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          border-radius: ${NAV_R.frame}px;
          box-shadow: ${NAV_FRAME_SHADOW};
        }
        .main-nav::before {
          content: '';
          position: absolute;
          inset: ${NAV_R.rim}px;
          border-radius: ${NAV_R.plate}px;
          background: ${NAV_PLATE_BG};
          background-blend-mode: ${NAV_PLATE_BLEND};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PLATE_SHADOW};
          pointer-events: none;
          z-index: -1;
        }
        .main-nav::after {
          content: '';
          position: absolute;
          inset: ${NAV_R.rim}px;
          border-radius: ${NAV_R.plate}px;
          ${NAV_GRAIN_SCREEN_CSS}
          opacity: 0.28;
          pointer-events: none;
          z-index: -1;
        }
        .main-nav > * { position: relative; z-index: 1; }
        .main-nav-right { display: flex; align-items: center; gap: 14px; justify-self: end; }
        ${NAV_MEDALLION_CSS}
        /* ── PILULKA OBRAZU ───────────────────────────────────────────────
           Matej 27. 8. 2026: *„z lavej strany bude len jedna pils — HOME ale bude
           sa meniť pri slajdovaní podla toho čo bude na screene a z pravej strany
           bude login a jazyk"*. Lišta tým prestala byť menu a je UKAZOVATEĽ polohy.
           ⚠️ Šírku drží najdlhší názov, nie ten práve viditeľný: všetky ležia
           v jednej bunke gridu a neaktívne majú nulové krytie. Bez toho by sa lišta
           pri každom prepnutí obrazu zúžila či rozšírila a medailón by uhýbal do
           strany — a šírka by sa musela merať po vykreslení. */
        .main-nav .scene-pill {
          /* ⚠️ ŽIADNE width: max-content — a je to oprava, nie zjednodušenie.
             Pevná max-content šírka tu bola preto, že lišta stála na min-content
             (viď .nav-top vyššie) a stĺpec by pilulku stlačil na nulu. Odkedy
             lišta dostala celé okno, robí to isté pravidlo opačnú škodu: pri
             360 px sa lišta oprie o max-width, voľné miesto zmizne a stĺpce
             dostanú svoju min-content šírku — ľavý 115 px (celý najdlhší názov),
             pravý 76 px. Medailón tým sadol 17 px vpravo od stredu.
             Bez width je pilulka fit-content: berie min(prirodzená šírka, stĺpec),
             takže na širokom okne ukáže celý názov a na 360 px ustúpi (ellipsis
             na vnútornom <span>) — a stĺpce ostanú rovnaké, teda logo v strede.
             ⚠️ Podmienka platnosti: vnútorné spany musia mať min-width: 0 a
             orezanie textom, inak sa pilulka nezmestí nikam a vytlačí stĺpec. */
          justify-self: start;
          display: grid; align-items: center; justify-items: center;
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: 0.78rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: ${NAV_GOLD.ink};
          padding: 5px 14px; border-radius: 999px;
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          background: ${NAV_GOLD.activeFill};
          box-shadow: ${NAV_PILL_SHADOW};
          user-select: none;
          /* ⚠️ Bez tohto sa pilulka scvrkne na nulu: orezanie textom robí z jej
             min-content šírky 0 a flexbox ju v úzkej lište stlačí na doraz. */
          flex-shrink: 0;
        }
        .main-nav .scene-pill > span {
          grid-area: 1 / 1;
          transition: opacity 0.22s ease;
          /* Strop je nutnosť, nie ozdoba: pilulka drží šírku NAJDLHŠIEHO názvu a ten
             sa v 18 jazykoch líši (SK „Náboženstvo" je dvojnásobok EN „Religion").
             Bez orezania lišta na telefóne pretiekla a vlajka jazyka vyšla z obrazovky. */
          min-width: 0; width: 100%; text-align: center;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .main-nav .scene-pill > span[data-off='1'] { opacity: 0; }
        .main-nav-sep { display: inline-block; width: 1px; height: 12px; background: rgba(110,74,20,0.45); flex-shrink: 0; }
        .main-nav a, .main-nav button {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: ${NAV_GOLD.ink};
          text-decoration: none;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .main-nav a:hover, .main-nav button:hover { opacity: 0.55; }
        /* Rozmery majú VŠETKY položky, výplň len aktívna — inak sa lišta pri
           každom prepnutí obrazu rozšíri. */
        .main-nav button { position: relative; padding: 5px 12px; border: ${NAV_R.line}px solid transparent; border-radius: 999px; }
        .main-nav button.is-on {
          opacity: 1;
          background: ${NAV_GOLD.activeFill};
          border-color: ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
        }
        .main-nav button.is-on:hover { opacity: 1; }
        .main-nav .lang-trigger { color: ${NAV_GOLD.ink}; }
        .main-nav .lang-trigger__chev { color: rgba(42,22,8,0.55); }
        /* ⚠️ Dvojtriedny selektor je nutnosť: domček je <a> vnútri .main-nav,
           takže ho inak trafí pravidlo vyššie (background: none, border: none)
           a z kruhu ostane len tieň. */
        .main-nav .nav-login {
          width: 40px; height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          background: ${NAV_GOLD.activeFill};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
          color: ${NAV_GOLD.ink};
        }
        .main-nav .nav-login:hover { opacity: 0.75; }
        /* Mobilný jazykový chip je v DOM-e vždy, viditeľný len pod 768 px. */
        .main-nav .nav-lang-mobile { display: none; }
        @media (max-width: 768px) {
          /* Medailón sa na mobile NEZMENŠUJE: Matej ho ladil pri 110 px práve
             v mobilnom náhľade nákresu a lišta má na 390 px dosť miesta (267 z 390).
             Odsadenie ostáva 34 px — nižšia lišta znamená VÄČŠÍ presah kruhu. */
          .nav-top { top: 34px; }
          .op-root { --op-nav-h: 118px; }
          /* Jazyk ostáva aj na mobile — lišta má po prestavbe miesto (279 px z 390). */
          .main-nav { gap: 7px; padding: ${NAV_R.rim + 3}px ${NAV_R.rim + 7}px; }
          .main-nav-right { gap: 7px; }
          .main-nav a, .main-nav button { font-size: 0.64rem; letter-spacing: 0.04em; }
          .main-nav .scene-pill { font-size: 0.64rem; letter-spacing: 0.06em; padding: 4px 10px; max-width: 32vw; }
          .main-nav { max-width: calc(100vw - 16px); }
          .main-nav button { padding: 4px 8px; }
          .main-nav .nav-login { width: 32px; height: 32px; }

          /* ── JAZYK SA STAHOVAL ZO SPODNEJ LIŠTY HORE (Matej 28. 8. 2026) ────
             *„na mobile je v dolnej NAV chip s jazykmi a po kliknutí sa otvorí
             popup na tmavom pozadí = to je správne ALE presuňme tie jazyky na
             mobile hore do horného navu a tie jazyky čo sú teraz hore vymažme."*
             Presúva sa CELÝ chip aj s jeho správaním: podoba flow otvára modál
             so závojom, kým dropdown horného navu (nav) vešia panel pod pilulku
             a na 390 px by z okna vytiekol. Preto sa nemení variant, ale nosič. */
          .main-nav .nav-lang-desktop { display: none; }
          .main-nav .nav-lang-mobile {
            display: inline-flex; align-items: center; justify-content: center;
            height: 32px; padding: 0 9px;
            flex-shrink: 0;
            border-radius: 999px;
            background: ${NAV_GOLD.activeFill};
            border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
            box-shadow: ${NAV_PILL_SHADOW};
          }
          /* ⚠️ Trojtriedny selektor je nutnosť: .lang-picker--flow .lang-trigger
             má krémový atrament pre TMAVÉ pozadie a rovnakú špecificitu ako
             .main-nav .lang-trigger. O víťazovi by potom rozhodovalo poradie
             dvoch <style> blokov v <head>, teda poradie mountovania komponentov. */
          .main-nav .nav-lang-mobile .lang-picker--flow .lang-trigger {
            color: ${NAV_GOLD.ink}; padding: 0;
          }
          .main-nav .nav-lang-mobile .lang-picker--flow .lang-trigger__chev {
            color: rgba(42,22,8,0.55);
          }
          .main-nav .nav-lang-mobile .lang-picker--flow .lang-flag-stack {
            border-color: ${NAV_GOLD.edge};
          }
          /* Pôvodný chip v spodnej lište zaniká — je to PRESUN, nie kópia.
             Skryté je len na /onepage: .gods-dock-portal má výhradne táto
             stránka (prop portalDock), takže wall lab si svoj chip drží. */
          .gods-dock-portal .lang-btn-mobile { display: none; }
        }

        /* ── SPODNÁ LIŠTA ────────────────────────────────────────────────
           Matej 26. 8. 2026: *„dolný nav zostáva, ale namiesto dvoch ikoniek
           tam bude chip ako je v hornom menu s textom CTA JOIN US."*
           ⚠️ Preto tu NIE JE žiadne plávajúce tlačidlo. Predtým tu bolo (.op-cta)
           a bola to DRUHÁ lišta, ktorá nastúpila po tom, čo prvá zhasla. Dnes je
           lišta jedna jediná — tá z wallu — a vymieňa si len obsah; sama sa
           nikdy nestratí. Vzhľad chipu aj zbalenie ikoniek žijú v GodsGridLab
           (.gbb-cta), lebo tam žije aj lišta.
           ⚠️ Lišta je fixed VNÚTRI .op-planet (ten je transformovaný, teda je jej
           containing block). Preto guľa ostáva prilepená na celý film — keby
           sa odlepila, odniesla by lištu so sebou. */

        /* ── OBRAZ 4: PRÍBEH ──────────────────────────────────────────────
           Star Wars crawl ostáva presne taký, aký je (Matej 26. 8.: „zatiaľ
           nechaj tak ako je") — len sa presťahoval za tlačidlo. Vo filme by
           zabral tri obrazovky a rozbil by tempo tesne pred CTA. */
        .op-story {
          min-height: 78vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 90px 22px;
          text-align: center;
        }
        .op-eyebrow {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.68rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: ${LAB.goldSolid};
          margin: 0;
        }
        .op-h2 {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.7rem, 5vw, 3rem);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0;
          background: ${LAB.goldText};
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .op-lead {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.95rem, 2.1vw, 1.1rem);
          line-height: 1.62;
          color: ${LAB.inkBody};
          max-width: 46ch;
          margin: 0;
        }
        .op-ghost {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.76rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${LAB.goldInk};
          background: rgba(255,252,244,0.6);
          border: 1px solid ${LAB.edge};
          border-radius: 8px;
          padding: 12px 26px;
          cursor: pointer;
        }
        .op-ghost:hover { background: rgba(255,252,244,0.9); }

        /* Popup príbehu — vlastný scroll. Trieda .lsh-scroll NIE JE preklep:
           AboutLab si podľa nej hľadá, čo vlastne scrolluje
           (closest('.lsh-scroll') ?? window). Bez nej by crawl počítal svoje
           beaty voči oknu, ktoré sa pod otvoreným popupom nehýbe. */
        .op-storymodal { position: fixed; inset: 0; z-index: 120; background: ${LAB.pageBg}; }
        .op-storymodal::before { content: ''; position: absolute; inset: 0; background: ${LAB.pageBackdrop}; pointer-events: none; }
        .op-storymodal .lsh-scroll { z-index: 1; }
        .op-storymodal .lsh-scroll {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          position: relative;
          -webkit-overflow-scrolling: touch;
        }
        .op-storyclose {
          position: fixed;
          top: 14px;
          right: 14px;
          z-index: 130;
          width: 42px; height: 42px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: ${NAV_GOLD.activeFill};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
          color: ${NAV_GOLD.ink};
          font-size: 1.05rem;
          cursor: pointer;
        }

        /* ── OBRAZ 5: CIEĽ, KROKY, ČÍSLO, CTA ─────────────────────────────
           Posledný obraz je jediné miesto filmu, kde sa hovorí o vstupe. */
        .op-join { padding: 110px 22px 130px; display: flex; flex-direction: column; align-items: center; gap: 34px; text-align: center; }
        .op-count { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .op-count-n {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(3rem, 12vw, 6.5rem);
          line-height: 1;
          background: ${LAB.goldText};
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .op-count-l {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.72rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
        }
        /* Rad míľnikov = celá šírka, rovnaké diely. Na mobile stĺpec — päť
           krokov vedľa seba je pri 390 px nečitateľných päť slov pod sebou. */
        .op-steps { display: flex; gap: 12px; width: min(1040px, 100%); align-items: stretch; }
        .op-step {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 14px;
          text-align: left;
          background: linear-gradient(160deg, rgba(255,252,244,0.72), rgba(248,237,214,0.5));
          border: 1px solid ${LAB.edge};
          border-radius: 12px;
          box-shadow: ${LAB.shadow};
        }
        .op-step-n { font-family: 'Cinzel', serif; font-weight: 700; font-size: 1.02rem; color: ${LAB.goldInk}; letter-spacing: 0.02em; }
        .op-step-t {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${LAB.goldSolid};
        }
        .op-step-d { font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem; line-height: 1.5; color: ${LAB.inkSoft}; }
        @media (max-width: 860px) {
          .op-steps { flex-direction: column; }
          .op-join { padding: 80px 18px 120px; gap: 26px; }
        }

        /* ── CTA ────────────────────────────────────────────────────────────
           ⚠️ NÁJDENÉ 26. 8.: všetky tri zlaté CTA filmu sa kreslili ako HOLÝ
           ČIERNY TEXT. Trieda .btn-gold je v SpiralLanding.css zapísaná pod
           .dogypt-spiral-root, takže mimo spirály neplatí vôbec — a OnePage ju
           používal bez lokálnej kópie. Zavedený vzor projektu (PackDogs,
           TripSpotlight, AddTripPlan…) je presne toto: hodnoty 1:1, nie vlastný
           gradient. Lock ostáva locked, len tu má konečne kde platiť. */
        .op-root .btn-gold {
          display: inline-block;
          text-decoration: none;
          padding: 14px 32px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.30);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.22s, opacity 0.22s;
          box-shadow: 0 0 40px rgba(230, 158, 26, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          white-space: nowrap;
        }
        .op-root .btn-gold:hover {
          transform: scale(1.04);
          box-shadow: 0 0 56px rgba(230, 158, 26, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        .op-root .btn-gold:active { transform: scale(0.98); }

        /* ── PODPIS NAD PÄTIČKOU ─────────────────────────────────────────────
           ⚠️ Logo je ČIERNY súbor (dogypt-logo-black-i.png, 500 px), nie zlatý
           prehnaný cez filter: brightness(0). Zlatý dogypt-gold-logo.webp má
           260 px a 8,4 % pixelov s čiastočnou priehľadnosťou — po sčernení z nich
           vznikne sivá kaša a značka vyzerá rozmazane. Čierny súbor má 3,2 %,
           teda obyčajné vyhladenie okrajov, a nepotrebuje žiadny filter. */
        .op-sign {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 0 18px 64px;
          text-align: center;
        }
        /* ⚠️ Logo je OBRYSOVÁ kresba (DS·02) — pod ~120 px sa jej ťahy vyhladením
           stenčia do sivej a značka vyzerá vyblednuto. Podpis preto stojí väčší,
           než by sa na pätičku žiadalo. */
        .op-sign-logo { width: clamp(112px, 11vw, 152px); height: auto; }
        .op-sign-tag {
          margin: 0;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.72rem, 1.2vw, 0.84rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
        }
        .op-sign-tag b { color: ${LAB.goldInk}; font-weight: 700; }
      `}</style>

      {/* ── HORNÝ NAV — namontovaný RAZ, film pod ním beží ─────────────── */}
      <div className="nav-top">
        <nav className="main-nav" data-op-nav="1">
          {/* Ľavá strana = JEDEN ukazovateľ obrazu, nie menu. Všetky názvy sú
              v DOM-e naraz kvôli pevnej šírke (viď CSS), viditeľný je aktívny. */}
          <div className="scene-pill" aria-live="polite">
            {SCENES.map((s, i) => (
              <span key={s.id} data-off={i === scene ? undefined : '1'} aria-hidden={i === scene ? undefined : true}>
                {t(s.navKey)}
              </span>
            ))}
          </div>
          <span className="nav-medal-slot" aria-hidden="true">
            <NavMedallion onClick={() => goTo(SCENES[0].id)} />
          </span>
          {/* ⚠️ PORADIE V DOM-e JE MOBILNÉ: jazyk, potom login (Matej 28. 8. 2026:
              *„v hornom menu vymeňme jazyky a login — jazyky vlavo login vpravo
              na MOBILE"*). Na PC ostáva pôvodné poradie login → jazyk, lebo tam
              je viditeľný `.nav-lang-desktop`, ktorý stojí ZA loginom.
              Dve inštancie pickera nie sú duplikát z nedbanlivosti: mobil má
              podobu `flow` (modál s tmavým závojom, prenesená zo spodnej lišty),
              PC dropdown zavesený pod pilulku. Jedna inštancia by musela meniť
              variant podľa `matchMedia`, teda držať šírku okna v stave. */}
          <span className="main-nav-right">
            <span className="nav-lang-mobile"><LanguagePicker variant="flow" /></span>
            <a href="/login" className="nav-login" aria-label={t('nav.login')}>
              <HandHouseHeart size={20} />
            </a>
            <span className="nav-lang-desktop"><LanguagePicker /></span>
          </span>
        </nav>
      </div>

      {/* ── SCÉNA ────────────────────────────────────────────────────────
          Guľa je prilepená na CELÝ film — nesie spodnú lištu, ktorá podľa
          zadania ostáva na obrazovke po celý čas scrollu. Film je vtiahnutý
          o jednu obrazovku hore, takže prvý výjav náboženstva stojí od začiatku
          presne tam, kde stojí guľa. */}
      <div className="op-stage">
        {/* ── ZNAČKY SNAPU V PRECHODE ────────────────────────────────────
            Prechod 1. → 2. obrazu je JEDNA sekcia vysoká PIN_VH+1 obrazoviek,
            takže má JEDINÝ začiatok — snap bod na ňom a ďalší až na preambule
            by celú choreografiu preskočil jedným ťahom (presne to, čo Matej
            opísal ako „prejde z prvého na 4"). Tieto značky ju rozdelia na
            obrazovky: 0 = guľa, 1–2 = medzikroky odchodu, 3 = výjav v pokoji.
            Sú absolútne voči .op-stage, teda na presných násobkoch obrazovky —
            nič nemerajú a nič nekreslia. */}
        <div className="op-snaps" aria-hidden>
          {Array.from({ length: PIN_VH + 1 }, (_, i) => (
            <span key={i} style={{ top: `${i * 100}dvh` }} />
          ))}
        </div>

        <div className="op-planet" id="op-home">
          {/* ctaLabel sa vykresľuje vždy — chip sa z ničoho rozvinie až keď
              `ctaMode` naskočí. Bez toho by do lišty skokom vpadol. */}
          {/* `paused` zastaví rAF slučku glóbusu, keď je guľa preč. Nie je to
              úspora batérie: tá slučka číta 15× za sekundu dlaždicu pod kurzorom
              cez elementFromPoint nad ~1000 prvkami v 3D — a keďže je guľa
              prilepená na CELÝ film, bežala by pri každom scrolle až po pätu. */}
          <GodsGridLab embedded portalDock paused={past} onWallChange={setWallOpen} />
        </div>

        <div className="op-film">
        {/* ── OBRAZ 2 — OTÁZKA (krava a pes) ─────────────────────────────
            Príchod výjavu si stránka rieši sama: `.codex-section.in-view`
            odkrýva riadky s odstupmi 100/220/340/460 ms. Nemá zmysel k tomu
            pridávať druhú animáciu — bili by sa. */}
        <section className="op-scene" id="op-religion" aria-label={t('nav.religion')}>
          <ReligionLab embedded flow />
        </section>

        {/* ── OBRAZ 3 — VIDEO A VÍZIA ────────────────────────────────────
            Jeden komponent, dva výjavy: intro video a za ním vodorovný pás
            WHAT IF (pinned scrollytelling). */}
        <section className="op-scene" id="op-vision" aria-label={t('nav.vision')}>
          {/* `flow` vypína vstupný zámok pásu WHAT IF — ten vo filme scroll
              doslova vracia späť (odmerané 4000 → 3989 px). Viď prop v VisionLab. */}
          <VisionLab embedded flow />
        </section>

        {/* ── OBRAZ 4 — PRÍBEH ────────────────────────────────────────────
            Za popupom je LEN crawl (Matej: „príbeh v scrole schovať za popup").
            Všetko ostatné, čo stránka O NÁS nesie — časová os, RECENZIE, Council
            a outro — beží tu vo filme. Prvá verzia mala v popupe celý komponent,
            takže recenzie ani míľniky nebolo kde nájsť. */}
        <section className="op-scene op-story" id="op-about" aria-label={t('nav.about')}>
          <p className="op-eyebrow">{t('nav.about')}</p>
          <h2 className="op-h2">{t('about.crawl.faith')}</h2>
          <p className="op-lead">
            One dog off the street, forty-two days across a country, and a question that would not
            go away: what do we owe the animal that chose us first?
          </p>
          <button type="button" className="op-ghost" onClick={() => setStoryOpen(true)}>
            {t('about.crawl.episode')}
          </button>
        </section>

        <section className="op-scene op-timeline" aria-label={t('about.timeline.heading')}>
          <AboutLab embedded part="story" />
        </section>

        {/* ── OBRAZ 5 — CIEĽ, KROKY, ČÍSLO, CTA ──────────────────────────*/}
        <section className="op-scene op-join" id="op-join" aria-label="Join">
          <div>
            <p className="op-eyebrow">The north star</p>
            <h2 className="op-h2">One million Dogyptians</h2>
          </div>
          <p className="op-lead">
            No deadline, no countdown. The milestones are counted in dogs, not in years — and every
            one of them starts with a single heroglyph.
          </p>

          <div className="op-steps">
            {MILESTONES.map((m) => (
              <div className="op-step" key={m.title}>
                <span className="op-step-n">{m.n}</span>
                <span className="op-step-t">{m.title}</span>
                <span className="op-step-d">{m.note}</span>
              </div>
            ))}
          </div>

          <div className="op-count">
            <span className="op-count-n">{dogCount === null ? '—' : dogCount.toLocaleString('en-US')}</span>
            <span className="op-count-l">dogs already carry their sign</span>
          </div>

          <a href="/entry" className="btn-gold">{t('wall.hero.cta')}</a>
        </section>

        {/* ── PODPIS — LOGO + TAGLINE ────────────────────────────────────
            Matej 26. 8. 2026: *„Logo aj tagline preč — dáme to úplne dolu…
            myslím do pätičky webu."* Z prvej obrazovky (guľa) zmizli, aby tam
            ostala jediná veta a jediná akcia; sem sadli ako podpis filmu.
            ⚠️ Je to blok OnePagu, NIE zásah do `components/landing/Footer.tsx`
            — ten je ostrý a musí mať prázdny diff. */}
        <div className="op-sign">
          <img src="/images/dogypt-logo-black-i.png" alt="DOGYPT" className="op-sign-logo" />
          <p className="op-sign-tag">
            {t('wall.hero.taglineLead')} <b>{t('wall.hero.taglineGod')}</b>
          </p>
        </div>

        {/* Pätička (e-mail + siete) uzatvára film. Je tu, a nie vnútri AboutLabu,
            aby nesedela uprostred stránky pred blokom s CTA. */}
        <Footer />
        </div>
      </div>

      {/* ── PRÍBEH V POPUPE ─────────────────────────────────────────────*/}
      {storyOpen && (
        <div className="op-storymodal" role="dialog" aria-modal="true" aria-label={t('nav.about')}>
          <button type="button" className="op-storyclose" onClick={() => setStoryOpen(false)} aria-label={t('nav.aria.close')}>
            ✕
          </button>
          <div className="lsh-scroll">
            <AboutLab embedded part="crawl" />
          </div>
        </div>
      )}
    </div>
  );
}
