import { useEffect, useState, type ReactNode } from 'react';
import { sizedUrl } from '@/services/cloudinaryService';
import { createPortal } from 'react-dom';
import { Loader2, Copy } from 'lucide-react';
import { BackButton } from './BackButton';
import { toast } from 'sonner';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, FONT_TITLE, FONT_UI, GOLD_BTN, PACK_SHADOW } from '@/components/pack/packTheme';
import { BonesCoin } from '@/components/pack/BonesCoin';
import { BONES } from '@/components/pack/bonesSkin';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
// Len pre ukážkovú líniu (`?netdemo=62`) — reálne psy z WALLu, aby simulácia
// vyzerala ako skutočný zoznam. Súbor je zoznam mien a názvov súborov, nie dáta
// s obrázkami; do bundlu pridá jednotky kB.
import { photos as GOD_PHOTOS } from '@/components/gods/godsData';
import { HandCheck } from '@/components/pack/HandIcons';

const T = PACK_THEME;
const S = PACK_SPACE;
const R = { ...PACK_R, btn: PACK_R.field };

// Rovnaký vzor ako `pages/PackDogs.tsx:1385` — `t(key)` vráti pri chýbajúcom
// preklade samotný kľúč, takže `v === key` znamená „ešte nepreložené, použi
// fallback". `vars` sa aplikujú aj na fallback (lokálny `fillVars`, keďže
// `interpolate()` z LanguageContext nie je exportovaný).
const fillVars = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;
type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

// ─────────────────────────────────────────────────────────────────────────
// „You are the marketing" — profil, blok 2. Prestavané 2026-08-12 podľa
// nákresu `plany/profil-bloky-navrh.html` (variant C „POSOL" + zlúčený
// vizuál C2+). Matej: „treba ho urobiť pútavejším … menej textu, vysvetliť
// obrázkom a dlhý text schovať za (i) ikonku."
//
// Poradie je zámerné: identita → moje čísla → mechanika obrázkom → akcia.
// Dlhý text žije v (i) paneli, nie na karte — veta sa číta raz, čísla stokrát.
//
// ⚠️ NIKDE netvrdíme, že reklamu nepoužívame (Matej: „nevyhlasovať že
// nepoužívame ADS (na začiatku asi budeme)"). Platená cesta v grafike je
// BLEDÁ A STATICKÁ, nie prečiarknutá — prečiarknutie je vyhlásenie. Rozdiel
// nesie kontrast života, nie zákaz, takže copy ostane pravdivé aj po zapnutí
// kampaní.
//
// BONES = affiliate mena. 10 BONES = €1. L1 +20 · L2 +10.
// Dáta: get_my_network() + get_or_create_my_affiliate().
// NOTE: Hekthor's Bowl (root-only €-counter) PARKED 2026-06-16 — data
//   (net.founder_points / is_root) ostávajú v odpovedi, UI ich nekreslí.
// ─────────────────────────────────────────────────────────────────────────

// Tlmená červená — rovnaký odtieň, aký už profil používa v `Badge({danger})`
// (`PackProfile.tsx:966`). Sýtejšia by na papyruse kričala ako chybová hláška.
const RED_INK = '#A04040';
const RED_EDGE = 'rgba(160,64,64,0.45)';

// Dlaždice BONES a LÍNIA (lapis od 12. 9.) zanikli 23. 10. 2026 — číslo BONES nesie tyrkysový
// hrdina, počet línie nadpis zoznamu (`bonesSkin.ts`).

const APP_ORIGIN = 'https://dogypt.com';
const BONES_PER_EUR = 10;
const eur = (bones: number) => (bones / BONES_PER_EUR).toFixed(2);
// Odmeny za pozvanie — L1/L2 čísla ostávajú konštanty v kóde (nemenia sa medzi
// jazykmi), do prekladu ide len okolitý text cez interpoláciu {l1}/{l2}.
const L1_BONES = 20;
const L2_BONES = 10;

interface Member {
  dog_name: string | null;
  owner_name: string | null;
  created_at: string;
  points: number;
  // `avatar` a `dog_no` RPC vracia od 21. 10. 2026 (migrácia 20261021_network_avatars.sql,
  // fotka psa = tá istá, čo je verejne na stene). `email` ostáva súkromný.
  // 🔴 PÔVODNE ICH RPC NEVRACALO. `get_my_network()` posielalo len štyri polia vyššie
  // (migrácia 20260609_affiliate_two_level.sql, „Email stays private"). Sú tu
  // kvôli ukážkovej línii nižšie a kvôli tomu, aby popup vedel, ako bude
  // vyzerať s plnými dátami. Na reálnych členoch ostanú `undefined` a popup
  // za ne kreslí pomlčku — NIE prázdno, aby bolo vidno, čo chýba.
  avatar?: string;
  email?: string;
  dog_no?: number;
}

// ── UKÁŽKOVÁ LÍNIA (Matej 2026-08-12: „skús tam dať mojich affiliate (62ludi)
// aby sme si nasimulovali ako to bude vyzerať"). Zapína sa VÝHRADNE v deve
// a výhradne parametrom `?netdemo=62` — na produkcii je `import.meta.env.DEV`
// false, takže sa nedá zapnúť ani omylom, ani ručne dopísaným parametrom.
// Mená a fotky sú reálne DOGYPT psy z `godsData` (tie isté, čo kreslí WALL),
// nie vymyslené — ukážka má vyzerať ako skutočná línia, inak sa z nej nedá
// posúdiť, či zoznam obstojí. E-maily sú zjavne fiktívne (`@priklad.sk`).
const DEMO_COUNT = 62;
// Pevná pečiatka, nie `Date.now()` — ukážka sa nesmie meniť medzi rendermi
// ani medzi dňami, inak sa dva screenshoty nedajú porovnať.
const DEMO_EPOCH = Date.parse('2026-08-12T12:00:00Z');
const DEMO_PHOTOS = GOD_PHOTOS;
const DEMO_OWNERS = [
  'Peter', 'Zuzana', 'Martin', 'Lucia', 'Tomáš', 'Katarína', 'Ján', 'Mária',
  'Michal', 'Eva', 'Marek', 'Jana', 'Andrej', 'Veronika', 'Lukáš', 'Simona',
  'Filip', 'Barbora', 'Adam', 'Nikola', 'Patrik', 'Kristína', 'Milan', 'Dominika',
];

function buildDemoMembers(): { level1: Member[]; level2: Member[] } {
  const all: Member[] = [];
  for (let i = 0; i < DEMO_COUNT; i += 1) {
    const p = DEMO_PHOTOS[i % DEMO_PHOTOS.length];
    const owner = DEMO_OWNERS[i % DEMO_OWNERS.length];
    // Deterministicky, nie náhodne — pri každom rendere musí vyjsť tá istá
    // línia, inak by sa zoznam pri každom prekreslení zamiešal.
    const daysAgo = 3 + i * 4;
    const d = new Date(DEMO_EPOCH - daysAgo * 86400000);
    all.push({
      dog_name: p.n,
      owner_name: owner,
      created_at: d.toISOString(),
      points: i % 3 === 0 ? L2_BONES : L1_BONES,
      avatar: `/dogs/${p.f}`,
      email: `${owner.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.${(p.n || '').toLowerCase()}@priklad.sk`,
      dog_no: DEMO_COUNT + 40 - i,
    });
  }
  // Rozdelenie 1/3 na druhú úroveň zodpovedá tomu, ako sieť reálne rastie —
  // priamych pozvaní býva viac než tých, čo prídu cez nich.
  return {
    level1: all.filter((m) => m.points === L1_BONES),
    level2: all.filter((m) => m.points === L2_BONES),
  };
}
const DEMO_NET = buildDemoMembers();
const DEMO_KEY = 'dogypt.netdemo';

// Zdroj pravdy o zapnutí ukážky: URL parameter má prednosť a zároveň voľbu
// uloží, bez parametra rozhoduje uložená hodnota. `?netdemo=0` (aj `off`,
// `false`) vypína. Volá sa počas renderu, takže žiadny efekt ani stav — pri
// prvom vykreslení už musí byť jasné, ktoré dáta karta ukazuje.
function demoOn(): boolean {
  try {
    const p = new URLSearchParams(window.location.search).get('netdemo');
    if (p != null) {
      const on = !['0', 'off', 'false', ''].includes(p.toLowerCase());
      if (on) localStorage.setItem(DEMO_KEY, '1');
      else localStorage.removeItem(DEMO_KEY);
      return on;
    }
    return localStorage.getItem(DEMO_KEY) === '1';
  } catch {
    return false;
  }
}
interface Network {
  level1: Member[];
  level2: Member[];
  level1_count: number;
  level2_count: number;
  is_root?: boolean;
  founder_points?: number;
}

// Kam BONES pôjdu. Ústava IX.3 menuje presne tieto smery („on merch, on
// donations to shelters, and on further internal transactions"), takže sú
// kánon, nie nápad. Všetky štyri sú zatiaľ `soon` — prevody stoja na ledgeri,
// ktorý ešte nie je postavený (`plany/zadanie-bones-ledger.md`). Priznaný
// stav je lepší než tlačidlo, ktoré klikne do prázdna.
type SpendKey = 'grow' | 'help';
// `id` nesie i18n kľúč aj pre `merch`/`payments` (bez `key` — tie ostávajú `SOON`,
// nikdy neprejdú do `live` stavu). `name`/`sub` sú EN fallbacky, preklad ide cez `tx`.
const SPEND: { icon: string; id: string; name: string; sub: string; key?: SpendKey }[] = [
  { icon: 'world-grid', id: 'grow', name: 'Grow DOGYPT', sub: 'fund the movement', key: 'grow' },
  { icon: 'heartpaw', id: 'help', name: 'Help a dog', sub: 'shelters & rescue', key: 'help' },
  // MERCH a PAYMENTS ZMIZLI (nákres launchu 21. 9. 2026, §2 „zmizne") — boli trvalé
  // `SOON` bez termínu. Ústava IX.3 ich menuje, takže sa sem vrátia; i18n kľúče ostávajú.
  // Grow/Help sa na LIVE neukážu tiež: peňaženka sa otvára len pri `walletReady`
  // (probe na `transfer_bones`, ktorá na LIVE 21. 9. neexistuje).
];

// i18n kľúče pre potvrdzovaciu obrazovku (`SendStep`) — preklad sa vyhodnocuje
// tam, cez `tx`, lebo `SEND_COPY` je modulová konštanta bez prístupu k jazyku.
const SEND_COPY: Record<SpendKey, {
  eyebrowKey: string; eyebrowFallback: string;
  titleKey: string; titleFallback: string;
  ledeKey: string; ledeFallback: string;
}> = {
  grow: {
    eyebrowKey: 'pack.network.spend.grow.name', eyebrowFallback: 'Grow DOGYPT',
    titleKey: 'pack.network.send.grow.title', titleFallback: 'Send BONES to the movement',
    ledeKey: 'pack.network.send.grow.lede', ledeFallback: 'This funds what the pack builds next.',
  },
  help: {
    eyebrowKey: 'pack.network.spend.help.name', eyebrowFallback: 'Help a dog',
    titleKey: 'pack.network.send.help.title', titleFallback: 'Send BONES to a dog in need',
    ledeKey: 'pack.network.send.help.lede', ledeFallback: 'Goes straight to shelters and rescue.',
  },
};

// Prevedené BONES dávajú 2× devotion, ALE cap 1:1 — dary nikdy neprerastú to,
// čo máš odžité praxou (dashboard „Guardy — nekupiteľnosť", LOCKED v4).
// „Peniaze zdvojnásobia roky, nenahradia ich."
const DEV_PER_BONE = 2;

// Voľné miesta v reťazi ukazujú TVÁRE psov, nie prázdne prerušované bubliny
// (Matej 2026-08-12: „nie je ta prerusovana bublinka dosť vidieť = daj tam
// fotky psov nech človek ma lepšiu vizualizaciu"). Fotky žijú v `public/dogs/`
// (tie isté, z ktorých ťahá GodsGrid). Výber je podľa indexu, nie náhodný —
// pri každom rendere musí vyjsť tá istá tvár, inak by uzly blikali.
const PLACEHOLDER_DOGS = [
  '/dogs/baily.jpg',
  '/dogs/aldo.jpg',
  '/dogs/beky.jpg',
  '/dogs/barney.jpg',
  '/dogs/azor.jpg',
  '/dogs/bax.jpg',
];
const placeholderDog = (i: number) => PLACEHOLDER_DOGS[i % PLACEHOLDER_DOGS.length];

interface LedgerRow {
  created_at: string;
  amount: number;
  kind: string;
  purpose: string | null;
  devotion_granted: number;
  devotion_capped: boolean;
}

// `transfer_bones` / `get_my_bones_ledger` / `get_my_devotion_split` pribudli
// migráciou 20260812 a nie sú v generovaných typoch (`integrations/supabase/
// types.ts` sa negeneroval, aby sa neprepísali LIVE typy DEV schémou).
// Pretypovanie je lokálne a zámerné — pri ďalšej regenerácii typov zmizne.
type LooseRpc = (fn: string, args?: Record<string, unknown>) =>
  Promise<{ data: unknown; error: { message: string } | null }>;
const rpc = supabase.rpc.bind(supabase) as unknown as LooseRpc;

// Animácie sú pomalé a bez blikania — česť rastie ticho, žiadny gamifikačný
// tlak. `prefers-reduced-motion` ich vypína úplne.
const NET_CSS = `
@keyframes pknet-flow{from{background-position:0 0}to{background-position:46px 0}}
@keyframes pknet-halo{0%,100%{box-shadow:0 0 0 4px rgba(${BONES.lightRgb},.18)}50%{box-shadow:0 0 0 8px rgba(${BONES.lightRgb},.32)}}
@keyframes pknet-glow{0%,100%{box-shadow:0 0 0 rgba(22,48,122,0)}50%{box-shadow:${PACK_SHADOW.lift}}}
.pknet-track{background:linear-gradient(90deg,rgba(${BONES.rgb},.25) 0%,${BONES.light} 45%,rgba(${BONES.rgb},.25) 90%);
  background-size:46px 100%;animation:pknet-flow 2s linear infinite}
.pknet-me{animation:pknet-halo 3s ease-in-out infinite}
.pknet-pill{animation:pknet-glow 3s ease-in-out infinite}
.pknet-tile{transition:border-color .14s ease,transform .12s ease,box-shadow .12s ease}
@media (prefers-reduced-motion:reduce){
  .pknet-track,.pknet-me,.pknet-pill{animation:none}
}
/* ══ ŠUPLÍK BONES v2 — TYRKYS (Matej 23. 10. 2026: „farbou tejto sekcie bude tyrkys …
   konsolidácia, modernizácia, zatraktívnenie"). Poradie = poradie otázok človeka:
   1 koľko mám (HRDINA + misia) → 2 čo mám urobiť (ODKAZ) → 3 koho som priviedol (LÍNIA)
   → 4 ako to funguje (KROKY) → 5 prečo (zbalené). Farby z bonesSkin.ts, nie rukou. */
.pkb-hero{position:relative;overflow:hidden;padding:${S.lg}px;border-radius:${R.card}px;background:${BONES.heroGrad};color:${BONES.onDeep};
  box-shadow:${PACK_SHADOW.panel};}
.pkb-hero::before{content:'';position:absolute;right:-48px;top:-48px;width:180px;height:180px;border-radius:${R.pill}px;
  background:radial-gradient(circle, rgba(${BONES.lightRgb},.45), transparent 70%);pointer-events:none;}
.pkb-top{position:relative;display:flex;align-items:center;gap:${S.md}px;}
.pkb-top .tx{flex:1;min-width:0;}
.pkb-top small{display:block;font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${BONES.onDeepDim};}
.pkb-top b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:24px;line-height:1.1;color:${BONES.onDeep};}
.pkb-top b span{font-family:${FONT_UI};font-weight:500;font-size:12px;color:${BONES.onDeepDim};margin-left:${S.xs}px;}
.pkb-wal{flex:none;display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.sm}px ${S.md}px;border-radius:${R.pill}px;cursor:pointer;
  background:${BONES.grad};color:${BONES.ink};border:0;font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.02em;}
.pkb-mis{position:relative;margin-top:${S.lg}px;padding-top:${S.md}px;border-top:1px solid ${BONES.heroLine};}
.pkb-mis .r{display:flex;justify-content:space-between;align-items:baseline;gap:${S.sm}px;font-family:${FONT_UI};font-size:12px;color:${BONES.onDeepDim};}
.pkb-mis .r b{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${BONES.onDeep};}
.pkb-bar{height:8px;margin:${S.sm}px 0;border-radius:${R.pill}px;background:rgba(0,0,0,.28);overflow:hidden;}
.pkb-bar > i{display:block;height:100%;min-width:${S.sm}px;border-radius:${R.pill}px;background:${BONES.grad};}
.pkb-mis p{margin:0;font-family:${FONT_UI};font-size:12px;color:${BONES.onDeepDim};}
.pkb-cta{display:flex;align-items:center;justify-content:center;gap:${S.sm}px;width:100%;margin-top:${S.lg}px;padding:${S.md}px ${S.lg}px;border-radius:${R.btn}px;
  background:${LAPIS.grad};color:${LAPIS.ink};border:0;box-shadow:${LAPIS_BTN_SHADOW};cursor:pointer;
  font-family:${FONT_TITLE};font-weight:700;font-size:14px;letter-spacing:.14em;text-transform:uppercase;}
.pkb-cta:hover:not(:disabled){background:${LAPIS.gradHover};}
.pkb-cta:disabled{opacity:.5;cursor:default;}
.pkb-sec{margin-top:${S.xl}px;}
.pkb-h{display:flex;align-items:baseline;justify-content:space-between;gap:${S.sm}px;margin:0 0 ${S.sm}px;}
.pkb-h span{font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${BONES.deep};}
.pkb-h button{border:0;background:none;padding:0;cursor:pointer;font-family:${FONT_UI};font-weight:600;font-size:12px;color:${BONES.deep};text-decoration:underline;text-underline-offset:3px;}
.pkb-h b{font-family:${FONT_TITLE};font-weight:700;font-size:16px;color:${T.inkStrong};}
.pkb-sub{margin:-${S.xs}px 0 ${S.sm}px;font-family:${FONT_UI};font-size:12px;color:${T.inkWarm};}
.pkb-steps{display:flex;flex-direction:column;gap:${S.sm}px;margin:0;padding:0;list-style:none;}
.pkb-why{margin-top:${S.md}px;border-radius:${R.tile}px;background:${BONES.tint};border:1px solid ${BONES.edge};}
.pkb-why summary{display:flex;align-items:center;justify-content:space-between;gap:${S.sm}px;padding:${S.md}px ${S.lg}px;cursor:pointer;list-style:none;
  font-family:${FONT_UI};font-weight:600;font-size:12px;color:${BONES.deep};}
.pkb-why summary::-webkit-details-marker{display:none;}
.pkb-why summary i{font-style:normal;transition:transform .2s ease;}
.pkb-why[open] summary i{transform:rotate(180deg);}
.pkb-why div{padding:0 ${S.lg}px ${S.md}px;font-family:${FONT_UI};font-size:12px;line-height:1.55;color:${T.inkWarm};}
`;

// `bare` = bez vlastnej karty — blok žije v šuplíku MISIA na profile (`BonesSheet`, 23. 10. 2026),
// ktorý papyrus a rám nesie sám. Karta v karte by bol druhý rám okolo toho istého.
export function PackNetwork({ avatarUrl, initial, bare = false, mission, onShare, shareLink }: {
  avatarUrl?: string | null;
  initial?: string;
  bare?: boolean;
  /** Pás MISIE v tyrkysovom hrdinovi — dodá ho šuplík (`BonesSheet`), ktorý má verejné čísla. */
  mission?: ReactNode;
  /** ZDIEĽAJ ODKAZ otvorí okno ZDIEĽAJ KARTU PSA (šuplík BONES, 23. 10. 2026) namiesto holého odkazu. */
  onShare?: () => void;
  /** Odkaz na stránku psa (`dogShareLink`) — jedna adresa s oknom ZDIEĽAJ KARTU PSA (Matej 23. 10.: „daj odkaz psa“). */
  shareLink?: string;
}) {
  const t = useT();
  const { lang } = useLang();
  const tx: Tx = (key, fallback, vars) => {
    const v = t(key, vars);
    return v === key ? fillVars(fallback, vars) : v;
  };
  const [net, setNet] = useState<Network | null>(null);
  const [bones, setBones] = useState<number | null>(null);
  const [code, setCode] = useState<string | null>(null);
  // Stav POZÝVACIEHO KÓDU zvlášť od zvyšku karty. Kód je jediná vec, bez ktorej je
  // druhý blok nefunkčný, a doteraz sa načítaval ako vedľajší produkt `reloadWallet()`
  // spolu s dvoma RPC, ktoré na LIVE ani neexistujú. Keď čokoľvek z toho zlyhalo,
  // tlačidlo ZDIEĽAŤ ODKAZ ostalo natrvalo bledé a stránka NEPOVEDALA prečo.
  const [codeState, setCodeState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<null | 'why' | 'bones'>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [split, setSplit] = useState<{ lived: number; given: number }>({ lived: 0, given: 0 });
  const [wallet, setWallet] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  // Probe, nie flag: `transfer_bones` / `get_my_bones_ledger` / `get_my_devotion_split`
  // pribudli migráciou 20260812, ktorá zatiaľ beží LEN na DEV projekte. Na LIVE tie RPC
  // ešte neexistujú, ale zostatok BONES sa ťahá z `get_or_create_my_affiliate`, ktorá
  // TAM JE — takže karta by inak ukázala reálny zostatok s peňaženkou, ktorá pri odoslaní
  // vždy zlyhá. `null` = ešte sa nevie (počas prvého načítania), `true`/`false` = výsledok
  // prvého `reloadWallet()`. Keď migrácia na LIVE prebehne, prvý ďalší reload uspeje a
  // peňaženka ožije sama — bez ďalšieho deploya frontendu.
  const [walletReady, setWalletReady] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.rpc('get_my_network').then((netRes) => {
      if (!mounted) return;
      if (netRes.error) console.error('get_my_network:', netRes.error.message);
      else setNet(netRes.data as unknown as Network);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Jediné miesto, ktoré volá `get_or_create_my_affiliate` — predtým ho volal aj
  // prvý efekt vyššie aj tento, dve siete pri každom mounte kvôli tomu istému číslu.
  const reloadWallet = async () => {
    const [led, spl, aff] = await Promise.all([
      rpc('get_my_bones_ledger', { p_limit: 50 }),
      rpc('get_my_devotion_split'),
      rpc('get_or_create_my_affiliate'),
    ]);
    // Nespoliehať sa na text hlášky (na DEV/LIVE môže znieť inak) — stačí, že RPC vôbec zlyhalo.
    setWalletReady(!led.error && !spl.error);
    if (!led.error && Array.isArray(led.data)) setLedger(led.data as LedgerRow[]);
    if (!spl.error && spl.data) setSplit(spl.data as { lived: number; given: number });
    // Kód sem UŽ NEPATRÍ — nastavuje ho `loadCode()`. Tu ostáva len zostatok, ktorý sa
    // po prevode musí prekresliť. Dva zapisovatelia jednej hodnoty = ťažko dohľadateľný stav.
    const affRow = (aff.data as { points?: number; code?: string }[] | null)?.[0];
    if (affRow) setBones(Number(affRow.points) || 0);
  };

  // Pozývací kód má VLASTNÉ volanie — nesmie padnúť s peňaženkou. `get_or_create_my_affiliate`
  // na LIVE existuje, `get_my_bones_ledger` / `get_my_devotion_split` (zatiaľ) nie.
  const loadCode = async () => {
    setCodeState('loading');
    const aff = await rpc('get_or_create_my_affiliate');
    const row = (aff.data as { points?: number; code?: string }[] | null)?.[0];
    if (aff.error || !row?.code) {
      setCodeState('failed');
      if (aff.error) console.error('get_or_create_my_affiliate:', aff.error);
      return;
    }
    setCode(row.code);
    setBones(Number(row.points) || 0);
    setCodeState('ready');
  };

  useEffect(() => {
    loadCode().catch(() => setCodeState('failed'));
    reloadWallet().catch(() => { /* kniha je doplnok — ticho, karta funguje aj bez nej */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ukážková línia prebije skutočné dáta LEN v deve. `?netdemo=62` ju zapne,
  // `?netdemo=0` vypne, a medzitým sa voľba pamätá v `localStorage` — inak
  // platí len pre tú jednu URL a v druhom otvorenom tabe je karta zase prázdna
  // (Matej ju dvakrát hľadal v tabe bez parametra). Vypnúť sa dá aj tlačidlom
  // v pásiku nad zoznamom, takže na to netreba pamätať URL.
  const demo = import.meta.env.DEV && demoOn() ? DEMO_NET : null;
  const l1 = demo?.level1 ?? net?.level1 ?? [];
  const l2 = demo?.level2 ?? net?.level2 ?? [];
  const lineCount = demo
    ? l1.length + l2.length
    : (net?.level1_count ?? l1.length) + (net?.level2_count ?? l2.length);
  // Zoznam v stĺpci ukazuje päť najnovších naprieč oboma úrovňami, zvyšok je
  // v popupe (Matej: „možno prvých 5 a potom odkaz na otvorenie popupu").
  // Zoraďuje sa podľa dátumu, nie podľa úrovne — človek hľadá „kto pribudol",
  // nie „kto je na ktorej úrovni"; úroveň nesie odznak na riadku.
  const recent = [...l1.map((m) => ({ m, lvl: 1 })), ...l2.map((m) => ({ m, lvl: 2 }))]
    .sort((a, b) => Date.parse(b.m.created_at) - Date.parse(a.m.created_at));
  // Náhľad tabuľky: POSLEDNÁ päťka vo vzostupnom poradí + prázdne sloty do troch riadkov.
  // `recent` je zoradený od najnovšieho, takže vzostupné poradie = otočiť a vziať chvost.
  // `firstNo` je poradové číslo prvého zobrazeného riadku v celej línii.
  const PREVIEW_ROWS = 5;
  const MIN_ROWS = 3;
  const ascending = [...recent].reverse();
  const shownRows = ascending.slice(-PREVIEW_ROWS);
  const firstNo = ascending.length - shownRows.length + 1;
  const emptySlots = Math.max(0, MIN_ROWS - shownRows.length);

  // V ukážke musí sedieť aj zostatok — inak by karta ukazovala 62 ľudí v línii
  // a pomlčku namiesto BONES, čo je stav, ktorý v realite nikdy nenastane.
  const shownBones = demo ? recent.reduce((s, r) => s + r.m.points, 0) : bones;
  const link = shareLink || (code ? `${APP_ORIGIN}/?ref=${code}` : '');
  const linkState = shareLink ? 'ready' : codeState;

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast(tx('pack.network.toast.copiedTitle', 'Link copied'), {
        description: tx('pack.network.toast.copiedDesc', 'Share it and grow your line.'),
      });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast(tx('pack.network.toast.copyFailTitle', 'Could not copy'), { description: link });
    }
  };

  // Jedno tlačidlo namiesto dvoch (Matej 2026-08-12: „všade si dal kopy referal
  // aj share link je to navyhnutné"). Nie je to to isté — `navigator.share`
  // otvorí systémové menu — ALE na desktope tá funkcia väčšinou chýba a padá
  // sem na kopírovanie, takže dve tlačidlá tam robili jednu vec. Link ostáva
  // viditeľný pod tlačidlom aj s vlastnou „copy" akciou.
  const handleShare = async () => {
    if (!link) return;
    const shareData = { title: 'DOGYPT', text: tx('pack.network.shareText', 'Join the pack. Become Dogyptian.'), url: link };
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* cancelled */
      }
    }
    handleCopy();
  };

  return (
    <section
      id="network"
      style={bare ? undefined : {
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: T.cardShadow,
      }}
    >
      <style>{NET_CSS}</style>

      {/* Ukážka MUSÍ byť označená — inak by sa 62 fiktívnych ľudí čítalo ako skutočná línia. */}
      {demo && (
        <div className="flex items-center justify-between" style={{
          gap: 10, marginBottom: 10, padding: '4px 8px', borderRadius: 8,
          background: 'rgba(160,64,64,0.10)', border: `1px dashed ${RED_EDGE}`,
          fontFamily: FONT_UI, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: RED_INK,
        }}>
          <span>Ukážka · {DEMO_COUNT} fiktívnych členov</span>
          <button type="button" onClick={() => { localStorage.removeItem(DEMO_KEY); window.location.search = ''; }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONT_UI, fontSize: 10,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: RED_INK, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Vypnúť
          </button>
        </div>
      )}

      {/* ① HRDINA — koľko mám. Číslo BONES je tu JEDNO (predtým v hlavičke šuplíka AJ v lapisovej
          dlaždici). Peňaženka = pilulka vpravo, kým jej RPC na projekte nie sú potvrdené, chýba. */}
      <div className="pkb-hero">
        <div className="pkb-top">
          <BonesCoin size="m" />
          <div className="tx">
            <small>{tx('pack.network.bonesLabel', 'Your BONES')}</small>
            <b>
              {shownBones == null ? '—' : shownBones.toLocaleString(intlLocale(lang))}
              <span>
                {shownBones != null && shownBones > 0
                  ? `≈ €${eur(shownBones)}`
                  : tx('pack.network.bonesRate', '{n} bones = €1', { n: BONES_PER_EUR })}
              </span>
            </b>
          </div>
          {walletReady === true && (
            <button type="button" className="pkb-wal" onClick={() => setWallet(true)}>
              {tx('pack.network.openWallet', 'Open wallet')} →
            </button>
          )}
        </div>
        {mission && <div className="pkb-mis">{mission}</div>}
      </div>

      {/* ② ODKAZ — hlavná akcia hneď pod stavom, nie na konci šuplíka. LAPIS ako každé hlavné CTA
          (Matej 23. 10.: tyrkys len pri BONES ako mene); tvar ostáva `.btn-gold` (r8). */}
      <button type="button" className="pkb-cta" onClick={onShare ?? handleShare} disabled={!onShare && !link}>
        <BrandIcon name="link" size={16} tint="gold" />
        {tx('pack.network.shareLink', 'Share your link')}
      </button>
      <div className="flex items-center justify-center gap-1.5" style={{ marginTop: 8, fontFamily: FONT_UI, fontSize: 12, color: T.inkFaint }}>
        {/* Tri bodky patria URL, nie vete — chybová veta sa v DE/PL/UA orezávala (audit 15. 10.). */}
        <span className={linkState === 'failed' ? undefined : 'truncate'} style={{ minWidth: 0, textAlign: 'center' }}>
          {linkState === 'loading'
            ? tx('pack.network.generatingLink', 'Generating your link…')
            : linkState === 'failed'
              ? tx('pack.network.linkFailed', 'Could not load your invite link.')
              : link.replace(/^https?:\/\//, '').replace(/\?.*$/, '')}
        </span>
        {linkState === 'failed' ? (
          <button type="button" onClick={() => { loadCode().catch(() => setCodeState('failed')); }} className="pf-hit shrink-0"
            style={{ background: 'none', border: `1px solid ${BONES.edge}`, borderRadius: 999, padding: '4px 8px', fontFamily: FONT_UI,
              fontWeight: 600, fontSize: 10, color: T.inkStrong, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {tx('pack.network.linkRetry', 'Try again')}
          </button>
        ) : (
          <button type="button" onClick={handleCopy} disabled={!link} aria-label={tx('pack.network.copyLinkAria', 'Copy invite link')}
            className="pf-hit inline-flex items-center shrink-0"
            style={{ background: 'none', border: 'none', color: T.inkWarm, cursor: link ? 'pointer' : 'default', padding: 4 }}>
            {copied ? <HandCheck size={14} /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* ③ LÍNIA — koho som priviedol. Číslo v nadpise, rozpad L1/L2 pod ním, „všetci" vpravo.
          Tabuľka stojí aj prázdna s poradovými číslami (Matej 12. 9.). E-mail tu nie je zámerne. */}
      <div className="pkb-sec">
        <div className="pkb-h">
          <span>{tx('pack.network.whoJoined', 'Who have you brought into DOGYPT?')}</span>
          {recent.length > 0
            ? <button type="button" onClick={() => setListOpen(true)}>{tx('pack.network.showAll', 'See all {n}', { n: recent.length })}</button>
            : <b>{loading && !demo ? '—' : String(lineCount)}</b>}
        </div>
        {lineCount > 0 && (
          <p className="pkb-sub">{tx('pack.network.lineSplit', '{l1} in first paw · {l2} in second', {
            l1: demo ? l1.length : net?.level1_count ?? l1.length,
            l2: demo ? l2.length : net?.level2_count ?? l2.length,
          })}</p>
        )}
        {loading && !demo ? (
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: T.inkFaint }} />
        ) : (
          <>
            <div className="flex flex-col" style={{ gap: 4 }}>
              {shownRows.map(({ m, lvl }, i) => (
                <MemberRow key={`${m.created_at}-${i}`} m={m} lvl={lvl} no={firstNo + i} />
              ))}
              {Array.from({ length: emptySlots }, (_, i) => (
                <EmptyRow key={`empty-${i}`} no={firstNo + shownRows.length + i} />
              ))}
            </div>
            {recent.length === 0 && (
              <span style={{ display: 'block', marginTop: 8, fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm }}>
                {tx('pack.network.emptyLine', 'No one yet — the first name here is the beginning of your line.')}
              </span>
            )}
          </>
        )}
      </div>

      {/* ④ AKO TO FUNGUJE — „WE NEED YOU!" + úvodná veta (Matejove texty) nad tromi krokmi. */}
      <div className="pkb-sec">
        <div className="pkb-h"><span>{tx('pack.network.eyebrow', 'DOGYPT grows because of you')}</span></div>
        <h3 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 20, color: T.inkStrong, margin: 0, letterSpacing: '0.02em' }}>
          {tx('pack.network.weNeedYou', 'WE NEED YOU!')}
        </h3>
        <p
          style={{ fontFamily: FONT_UI, fontSize: 14, lineHeight: 1.55, color: T.inkWarm, margin: '8px 0 12px' }}
          dangerouslySetInnerHTML={{
            __html: tx(
              'pack.network.intro',
              'A movement only grows when its members carry the message and bring new people in. '
                + 'So we’re asking you directly: <strong style="color:#2a1608;font-weight:600">invite the dog people you know</strong>. '
                + 'Here is exactly how it works.',
            ),
          }}
        />
        <ol className="pkb-steps">
          <Step n={1} icon="link" title={tx('pack.network.step1Title', 'Share your link')}>
            {tx('pack.network.step1Body', 'Send it to the friends of yours who’d back a good cause. That’s the whole ask.')}
          </Step>
          <Step n={2} icon="add-user" title={tx('pack.network.step2Title', 'They join — you get BONES')}>
            <span
              style={{ display: 'block', marginBottom: 10 }}
              dangerouslySetInnerHTML={{
                /* Text hovorí aj to, čo dostane TEN DRUHÝ (Matej 12. 9.). */
                __html: tx(
                  'pack.network.step2Body',
                  'If someone forges a <strong style="color:#2a1608;font-weight:600">Heroglyph</strong> through your link, '
                    + 'you get <strong style="color:#2a1608;font-weight:600">{l1} BONES</strong>. '
                    + 'If that member brings someone too, they get {l1} and <strong style="color:#2a1608;font-weight:600">you get {l2} more</strong>.',
                  { l1: L1_BONES, l2: L2_BONES },
                ),
              }}
            />
            <Chain l1={l1} l2={l2} avatarUrl={avatarUrl} initial={initial} loading={loading} />
          </Step>
          <Step n={3} icon="bone" title={tx('pack.network.step3Title', 'Spend them inside DOGYPT')}>
            {tx('pack.network.step3Body', '{n} BONES = €1. The money goes back into the mission — helping dogs, merch, and paying other members for what they make.', { n: BONES_PER_EUR })}
          </Step>
        </ol>

        {/* ⑤ PREČO TAKTO — Matejov text ostáva doslova, len je zbalený (bol to najväčší blok
            šuplíka a čítal sa ako varovanie: červená farba). */}
        <details className="pkb-why">
          <summary>{tx('pack.network.ads.header', 'Why this way?')}<i aria-hidden><BrandIcon name="back" size={12} tint="dim" style={{ transform: 'rotate(-90deg)' }} /></i></summary>
          <div dangerouslySetInnerHTML={{
            __html: tx(
              'pack.network.ads.body',
              'Paid ads are a very inefficient way to find new dog people — and a way to throw our money '
                + 'at big corporations. It works far better to reward the members of the movement directly for being active. '
                + 'There is one catch: <strong style="font-weight:600">it only really works if you go out and '
                + 'tell the people around you about us</strong> :)',
            ),
          }} />
        </details>
      </div>

      {wallet && (
        <WalletPanel
          balance={bones ?? 0}
          ledger={ledger}
          room={Math.max(0, split.lived - split.given)}
          lived={split.lived}
          onInfo={() => { setWallet(false); setInfo('bones'); }}
          onClose={() => setWallet(false)}
          onDone={reloadWallet}
        />
      )}

      {listOpen && <NetworkListPanel rows={recent} onClose={() => setListOpen(false)} />}

      {info && <InfoPanel variant={info} onClose={() => setInfo(null)} />}
    </section>
  );
}

// ── Peňaženka ──────────────────────────────────────────────────────────────
// Matej 2026-08-12: „malo by to byť skôr schované za klikom na BONES … ak klikne
// na stav bones zobrazí sa popup s možnosťou kam poslať a tento výber sa potvrdí
// otázkou a následne sa zapíše do Logu - história transakcií niekde pri tom."
// Dlaždice „kam poslať" tak už nevisia samostatne na spodku karty, ale sedia
// tam, kde má človek zostatok pred očami. Karta sa tým skrátila o tretinu.
function WalletPanel({
  balance,
  ledger,
  room,
  lived,
  onInfo,
  onClose,
  onDone,
}: {
  balance: number;
  ledger: LedgerRow[];
  room: number;
  lived: number;
  onInfo: () => void;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const t = useT();
  const { lang } = useLang();
  const tx: Tx = (key, fallback, vars) => {
    const v = t(key, vars);
    return v === key ? fillVars(fallback, vars) : v;
  };
  const [picked, setPicked] = useState<SpendKey | null>(null);
  const spent = ledger.filter((r) => r.kind !== 'opening');
  const noBonesYetHint = tx('pack.network.noBonesYetHint', 'No BONES yet — invite someone first.');

  return (
    // z-[70]: `.ainubis-launcher` sedí na z-index 60 (AinubisWidget.css) — peňaženka
    // aj (i) panel musia byť nad ním, inak faraón visí nad zatmaveným pozadím modalu.
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.62)' }} onClick={onClose} />
      <div
        className="absolute left-1/2 top-1/2 overflow-y-auto"
        style={{
          transform: 'translate(-50%,-50%)',
          width: 'min(440px, 93vw)',
          maxHeight: '88vh',
          background: T.panelGrad,
          border: `1.5px solid ${T.cardEdge}`,
          borderRadius: 14,
          padding: 24,
          boxShadow: T.panelShadow,
        }}
      >
        <div className="flex items-start" style={{ gap: 12 }}>
          {/* × → šípka späť vľavo (Matej 27. 9. 2026: „dávajme všade len šípky, nie krížiky"). */}
          <BackButton tone="pale" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          <div className="flex items-center" style={{ gap: 13, minWidth: 0 }}>
            <BonesCoin size="l" />
            <div style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 20, letterSpacing: '0.02em', lineHeight: 1.05, color: T.inkStrong }}>
                {balance.toLocaleString(intlLocale(lang))}
              </span>
              <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, marginTop: 3 }}>
                BONES · ≈ €{(balance / BONES_PER_EUR).toFixed(2)}
              </span>
              <button type="button" onClick={onInfo} style={{ background: 'none', border: 'none', padding: 0, marginTop: 4, fontFamily: FONT_UI, fontSize: 12, color: T.cardEdge, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
                {tx('pack.network.whatIsBones', 'What is BONES?')}
              </button>
            </div>
          </div>
        </div>

        <div aria-hidden style={{ height: 2, margin: '16px 0', background: T.rule }} />

        {picked ? (
          <SendStep
            kind={picked}
            balance={balance}
            room={room}
            lived={lived}
            onBack={() => setPicked(null)}
            onDone={async () => { await onDone(); setPicked(null); }}
          />
        ) : (
          <>
            <span style={{ display: 'block', fontFamily: FONT_TITLE, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.inkDim, marginBottom: 10 }}>
              {tx('pack.network.sendWhere', 'Send them where?')}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {SPEND.map((o) => {
                const live = !!o.key;
                const can = live && balance > 0;
                const name = tx(`pack.network.spend.${o.id}.name`, o.name);
                const sub = tx(`pack.network.spend.${o.id}.sub`, o.sub);
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={!can}
                    onClick={() => o.key && setPicked(o.key)}
                    title={live && !can ? noBonesYetHint : undefined}
                    className="pknet-tile relative flex flex-col items-start text-left"
                    style={{
                      gap: 4,
                      background: live ? 'rgba(201,154,63,0.12)' : 'rgba(31,26,14,0.03)',
                      border: live ? `1px solid ${T.cardEdge}` : '1px solid rgba(31,26,14,0.12)',
                      borderRadius: 8,
                      padding: '12px 12px',
                      // SOON (merch/payments) = trvale nedostupné → dimne sa celý rám.
                      // „No BONES yet" (grow/help pri nulovom zostatku) = dočasné → rám
                      // ostáva plný, stlmí sa len text (nižšie), nech nevyzerá ako
                      // zamknutá funkcia.
                      opacity: live ? 1 : 0.55,
                      cursor: can ? 'pointer' : 'default',
                    }}
                  >
                    <BrandIcon name={o.icon} size={18} tint={live ? 'gold' : 'dim'} style={{ marginBottom: 2 }} />
                    <span style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12, color: live && !can ? T.inkFaint : T.inkStrong }}>{name}</span>
                    <span style={{ fontFamily: FONT_UI, fontSize: 10, color: live ? (can ? T.inkWarm : T.inkFaint) : T.inkFaint }}>{sub}</span>
                    {!live && (
                      <span style={{ position: 'absolute', top: 9, right: 9, fontFamily: FONT_TITLE, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkFaint, border: '1px solid rgba(31,26,14,0.18)', borderRadius: 999, padding: '4px 4px' }}>
                        {tx('pack.network.soon', 'Soon')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hover-only `title` nič neukáže na mobile — dôvod je preto vidieť aj ako
                riadok textu, nie len ako tooltip. */}
            {balance === 0 && (
              <p style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, margin: '8px 0 0' }}>
                {noBonesYetHint}
              </p>
            )}

            {spent.length > 0 && (
              <>
                <div aria-hidden style={{ height: 2, margin: '16px 0 12px', background: T.rule }} />
                <span style={{ display: 'block', fontFamily: FONT_TITLE, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.inkDim, marginBottom: 8 }}>
                  {tx('pack.network.transactionLog', 'Transaction log')}
                </span>
                {spent.some((r) => r.devotion_capped) && (
                  <p style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, margin: '0 0 8px' }}>
                    {tx('pack.network.capHintLog', "Cap 1:1 — a gift can only match what you've already lived.")}
                  </p>
                )}
                {spent.map((r, i) => <LedgerRowView key={i} row={r} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Potvrdenie prevodu ─────────────────────────────────────────────────────
// Cap 1:1 sa ukazuje PRED potvrdením, nie až po ňom — človek musí vedieť, čo
// dostane, kým sa rozhoduje. Prevod sa NIKDY neodmietne kvôli capu: BONES
// prejdú vždy, capne sa len česť.
function SendStep({
  kind,
  balance,
  room,
  lived,
  onBack,
  onDone,
}: {
  kind: SpendKey;
  balance: number;
  room: number;
  lived: number;
  onBack: () => void;
  onDone: () => Promise<void>;
}) {
  const t = useT();
  const { lang } = useLang();
  const tx: Tx = (key, fallback, vars) => {
    const v = t(key, vars);
    return v === key ? fillVars(fallback, vars) : v;
  };
  const c = SEND_COPY[kind];
  const eyebrow = tx(c.eyebrowKey, c.eyebrowFallback);
  const title = tx(c.titleKey, c.titleFallback);
  const lede = tx(c.ledeKey, c.ledeFallback);
  const [amount, setAmount] = useState(Math.min(100, balance));
  const [busy, setBusy] = useState(false);
  // Kľúč vznikne RAZ pri otvorení panela a drží sa aj cez retry — vďaka nemu
  // druhý klik (alebo opakovanie po výpadku siete) nestrhne BONES dvakrát.
  const [idem] = useState(() =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const v = Math.max(0, Math.min(balance, Math.floor(amount) || 0));
  const wanted = v * DEV_PER_BONE;
  const granted = Math.min(wanted, room);
  const capped = wanted > room;

  const submit = async () => {
    if (v < 1 || busy) return;
    setBusy(true);
    const { data, error } = await rpc('transfer_bones', {
      p_amount: v,
      p_purpose: kind,
      p_idem_key: idem,
    });
    setBusy(false);
    if (error) {
      const msg = error.message.includes('insufficient_bones')
        ? tx('pack.network.toast.insufficientBones', "You don't have that many BONES.")
        : tx('pack.network.toast.transferFailed', 'Transfer failed. Nothing was taken.');
      toast(tx('pack.network.toast.sendFailTitle', 'Could not send'), { description: msg });
      return;
    }
    const res = data as { devotion?: number; capped?: boolean } | null;
    toast(tx('pack.network.toast.sentTitle', '{n} BONES sent', { n: v }), {
      description: res?.devotion
        ? tx('pack.network.toast.sentDescDevotion', '+{n} devotion{cap} — thank you.', {
            n: res.devotion,
            cap: res.capped ? tx('pack.network.toast.cappedSuffix', ' (capped)') : '',
          })
        : tx('pack.network.toast.sentDescPlain', 'Thank you. The honour waits for the days.'),
    });
    await onDone();
  };

  return (
    <div>
      <div>
        <span style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.cardEdge }}>
          {eyebrow}
        </span>
        <h4 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 20, color: T.inkStrong, margin: '6px 0 2px' }}>
          {title}
        </h4>
        <p style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, margin: 0 }}>{lede}</p>

        <div style={{ background: T.tileBg, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, marginTop: 14 }}>
          <div className="flex items-center" style={{ gap: 9 }}>
            <input
              type="number"
              min={1}
              max={balance}
              value={v}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="pf-field"
              style={{
                flex: 1,
                minWidth: 0,
                borderRadius: 8,
                padding: '8px 12px',
                fontFamily: FONT_TITLE,
                fontWeight: 700,
                fontSize: 20,
                color: T.ink,
              }}
            />
            <span style={{ fontFamily: FONT_UI, fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkWarm }}>
              {tx('pack.network.bonesUnit', 'bones')}
            </span>
          </div>

          <div className="flex" style={{ gap: 6, marginTop: 9 }}>
            {[25, 50, 100].filter((n) => n <= balance).map((n) => (
              <button key={n} type="button" onClick={() => setAmount(n)} style={quickBtn}>{n}</button>
            ))}
            <button type="button" onClick={() => setAmount(balance)} style={quickBtn}>
              {tx('pack.network.allBones', 'All {n}', { n: balance })}
            </button>
          </div>

          <div
            className="flex items-baseline justify-between"
            style={{ marginTop: 11, paddingTop: 8, borderTop: `1px solid ${T.hairline}`, fontFamily: FONT_UI, fontSize: 12, color: T.inkFaint }}
          >
            <span>≈ €<b style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 14, color: T.inkStrong }}>{(v / BONES_PER_EUR).toFixed(2)}</b></span>
            <span style={{ color: T.inkWarm }}>
              +<b style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 14, color: T.accentGold }}>{granted.toLocaleString(intlLocale(lang))}</b> {tx('pack.network.devotionWord', 'devotion')}
            </span>
          </div>
        </div>

        {capped && (
          <p
            style={{
              fontFamily: FONT_UI,
              fontSize: 12,
              lineHeight: 1.5,
              color: T.inkWarm,
              margin: '11px 0 0',
              background: 'rgba(31,26,14,0.05)',
              border: '1px dashed rgba(31,26,14,0.20)',
              borderRadius: 8,
              padding: '8px 12px',
            }}
            dangerouslySetInnerHTML={{
              __html: room > 0
                ? tx(
                    'pack.network.capped.room',
                    "Capped at <b style=\"color:#2a1608\">{room}</b> — a gift can only match what you've lived ({lived} devotion so far). The BONES still go through; the honour waits for the days.",
                    { room: room.toLocaleString(intlLocale(lang)), lived: lived.toLocaleString(intlLocale(lang)) },
                  )
                : tx(
                    'pack.network.capped.none',
                    "No devotion from this one — your gifts already match everything you've lived. The BONES still go through. <i>Money doubles the years, it never replaces them.</i>",
                  ),
            }}
          />
        )}

        <p
          style={{
            fontFamily: FONT_UI,
            fontSize: 12,
            lineHeight: 1.5,
            color: T.inkWarm,
            margin: '12px 0 0',
            background: 'rgba(201,154,63,0.10)',
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: '8px 12px',
          }}
        >
          {tx('pack.network.confirmSend', "Are you sure? Once sent, the BONES leave your balance — this can't be undone.")}
        </p>

        <div className="flex" style={{ gap: 8, marginTop: 14 }}>
          <button type="button" onClick={onBack} disabled={busy} style={{ ...ghostBtn, flex: 1 }}>
            {tx('pack.network.back', 'Back')}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={v < 1 || busy}
            className="inline-flex items-center justify-center gap-2"
            style={{
              flex: 1.4,
              background: GOLD_BTN.grad,
              border: `1px solid ${GOLD_BTN.edge}`,
              borderRadius: 8,
              color: T.ink,
              padding: '12px 16px',
              fontFamily: FONT_TITLE,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: v < 1 || busy ? 'default' : 'pointer',
              opacity: v < 1 || busy ? 0.55 : 1,
            }}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {tx('pack.network.yesSend', 'Yes, send')}
          </button>
        </div>
      </div>
    </div>
  );
}

const quickBtn: React.CSSProperties = {
  flex: '1 1 0',
  background: 'rgba(255,255,255,0.5)',
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  fontFamily: FONT_UI,
  fontSize: 12,
  color: T.inkWarm,
  padding: '4px 4px',
  cursor: 'pointer',
};

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  color: T.ink,
  padding: '12px 16px',
  fontFamily: FONT_TITLE,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

// ── Riadok knihy ───────────────────────────────────────────────────────────
// `opening` (migrovaný zostatok z affiliates.points) sa nekreslí — nie je to
// prevod, ktorý by človek urobil; filtruje ho volajúci.
function LedgerRowView({ row }: { row: LedgerRow }) {
  const t = useT();
  const { lang } = useLang();
  const tx: Tx = (key, fallback, vars) => {
    const v = t(key, vars);
    return v === key ? fillVars(fallback, vars) : v;
  };
  return (
    <div
      className="flex items-center flex-wrap"
      style={{
        gap: 10,
        background: T.tileBg,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        marginBottom: 6,
      }}
    >
      <span style={{ fontFamily: FONT_UI, fontSize: 10, color: T.inkFaint, whiteSpace: 'nowrap' }}>
        {new Date(row.created_at).toLocaleDateString(intlLocale(lang), { day: '2-digit', month: 'short' })}
      </span>
      <span className="flex-1 truncate" style={{ fontFamily: FONT_UI, fontSize: 12, color: T.ink, minWidth: 0 }}>
        {row.purpose === 'help'
          ? tx('pack.network.spend.help.name', 'Help a dog')
          : row.purpose === 'grow'
            ? tx('pack.network.spend.grow.name', 'Grow DOGYPT')
            : row.kind}
      </span>
      <span style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12, color: T.inkStrong, whiteSpace: 'nowrap' }}>
        {row.amount > 0 ? '+' : '\u2212'}{Math.abs(row.amount)}
      </span>
      <span
        style={{
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          fontSize: 12,
          color: row.devotion_granted > 0 ? T.accentGold : T.inkFaint,
          whiteSpace: 'nowrap',
        }}
        title={row.devotion_capped ? tx('pack.network.capHintRow', "Cap 1:1 \u2014 a gift matches what you've lived") : undefined}
      >
        +{row.devotion_granted} {tx('pack.network.devotionWord', 'devotion')}{row.devotion_capped ? ' \u00b7cap' : ''}
      </span>
    </div>
  );
}

// ── Krok návodu ────────────────────────────────────────────────────────────
function Step({
  n,
  icon,
  title,
  children,
}: {
  n: number;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li
      className="flex"
      style={{
        gap: 13,
        // Úroveň 2 MATRICE (`PACK_BOX.subblock`). Tento recept vznikol tu 12. 8.
        // („je to také plané") a 13. 8. sa stal kánonom pre všetky sekcie vnútri karty —
        // hodnoty preto nie sú opísané ručne, ale ťahané z matrice.
        ...PACK_BOX.subblock,
        border: `1px solid ${BONES.edge}`,
        padding: '12px 16px',
      }}
    >
      {/* Číslo nesie poradie, ikona tému — spolu povedia „krok 1 je o zdieľaní"
          skôr, než sa začne čítať. */}
      <span className="flex flex-col items-center shrink-0" style={{ gap: 7, width: 34 }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            /* TYRKYS (23. 10. 2026) — farba sekcie BONES; predtým lapis (12. 9.). */
            background: BONES.grad,
            color: BONES.ink,
            fontFamily: FONT_TITLE,
            fontWeight: 700,
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          {n}
        </span>
        <BrandIcon name={icon} size={16} tint="dim" />
      </span>

      <div style={{ minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontFamily: FONT_TITLE,
            fontWeight: 700,
            fontSize: 14,
            color: T.inkStrong,
            letterSpacing: '0.02em',
            marginBottom: 4,
          }}
        >
          {title}
        </span>
        <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 12, lineHeight: 1.55, color: T.inkWarm }}>
          {children}
        </span>
      </div>
    </li>
  );
}

// Poradové číslo riadku — pevná šírka, aby čísla pod sebou stáli na jednej osi
// a prázdny slot bol presne taký široký ako naplnený.
function RowNo({ n, dim }: { n: number; dim?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        flex: '0 0 22px',
        textAlign: 'right',
        fontFamily: FONT_UI,
        fontWeight: 500,
        fontSize: 10,
        lineHeight: 1,
        color: dim ? T.inkFaint : T.inkWarm,
      }}
    >
      {n}
    </span>
  );
}

// Prázdny slot línie. Nie je to „placeholder" v zmysle nedokončenej obrazovky —
// je to viditeľné miesto, ktoré na niekoho čaká, a preto má číslo (Matej 2026-09-12:
// „aj keď prázdnu tabuľku s poradovým číslom, nie iba prázdne miesto").
// Prerušovaný rám a priehľadné pozadie ho odlíšia od naplneného riadku bez toho, aby
// zoznam vyzeral ako chyba načítania.
function EmptyRow({ no }: { no: number }) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 10,
        padding: '8px 8px',
        borderRadius: 8,
        background: BONES.tint,
        border: `1px dashed ${BONES.edge}`,
      }}
    >
      <RowNo n={no} dim />
      <span
        aria-hidden
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          flexShrink: 0,
          border: `1px dashed ${BONES.edge}`,
        }}
      />
      <span aria-hidden className="flex-1 min-w-0 flex flex-col" style={{ gap: 5 }}>
        <span style={{ display: 'block', width: '58%', height: 7, borderRadius: 8, background: 'rgba(122,90,42,0.13)' }} />
        <span style={{ display: 'block', width: '34%', height: 5, borderRadius: 8, background: 'rgba(122,90,42,0.09)' }} />
      </span>
      <span
        aria-hidden
        style={{
          fontFamily: FONT_UI,
          fontWeight: 600,
          fontSize: 10,
          color: T.inkFaint,
          border: `1px dashed ${BONES.edge}`,
          borderRadius: 999,
          padding: '4px 8px',
          whiteSpace: 'nowrap',
        }}
      >
        +{L1_BONES}
      </span>
    </div>
  );
}

// Jeden riadok línie. Ten istý komponent nesie zoznam v stĺpci aj v popupe —
// `full` len dokreslí e-mail a poradové číslo, ktoré sa do úzkeho stĺpca
// nezmestia. Dva odlišné riadky pre tú istú vec by sa rozišli pri prvej zmene.
// ⚠️ Meno PSA = Cinzel Decorative (brand lock), meno ČLOVEKA ostáva Cinzel/Grotesk.
function MemberRow({ m, lvl, full, no }: { m: Member; lvl: number; full?: boolean; no?: number }) {
  const t = useT();
  const { lang } = useLang();
  const tx: Tx = (key, fallback, vars) => {
    const v = t(key, vars);
    return v === key ? fillVars(fallback, vars) : v;
  };
  // Locale z appky, NIE z prehliadača — `undefined` tu dávalo Slovákovi s anglickým
  // systémom `8/9/2026` v slovenskom rozhraní (audit 12. 8., A1).
  const date = new Date(m.created_at).toLocaleDateString(intlLocale(lang), {
    day: 'numeric', month: 'numeric', year: 'numeric',
  });
  return (
    <div
      className="flex items-center"
      style={{
        gap: 10,
        padding: full ? '9px 12px' : '8px 10px',
        borderRadius: 8,
        background: T.tileBg,
        border: `1px solid ${T.border}`,
      }}
    >
      {/* Poradové číslo v línii — rovnaký stĺpec ako v prázdnom slote, aby sa pri
          dopĺňaní riadkov nič nepohlo. */}
      {no != null && <RowNo n={no} />}
      <Avatar src={m.avatar} name={m.dog_name} size={full ? 36 : 30} />

      <span className="flex-1 min-w-0">
        <span
          className="block truncate"
          style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontWeight: 700, fontSize: 12, color: T.inkStrong, lineHeight: 1.2 }}
        >
          {m.dog_name || '—'}
        </span>
        <span className="block truncate" style={{ fontFamily: FONT_UI, fontSize: 10, color: T.inkWarm, marginTop: 1 }}>
          {m.owner_name || '—'}
          {full && <> · {m.email || '—'}</>}
        </span>
      </span>

      {full && (
        <span style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12, color: T.inkDim, whiteSpace: 'nowrap' }}>
          {m.dog_no ? `#${m.dog_no}` : '—'}
        </span>
      )}

      {/* `inkWarm`, nie `inkFaint`: 0.42 alfa dávala na papyruse 2,5 : 1 (audit B3). */}
      <span style={{ fontFamily: FONT_UI, fontSize: 10, color: T.inkWarm, whiteSpace: 'nowrap' }}>
        {date}
      </span>

      {/* Úroveň nesie riadok, lebo zoznam je zoradený podľa dátumu, nie podľa nej.
          ⚠️ `L1`/`L2` je MLM slovník — v DB a v konštantách ostáva, človeku sa ukazuje
          PRVÝ / DRUHÝ KRUH (rozhodnutie 13. 8.). Rímska číslica drží poradie aj v 10 px. */}
      <span
        title={lvl === 1
          ? tx('pack.network.circle1', 'First paw — you brought them in')
          : tx('pack.network.circle2', 'Second paw — they were brought by your first paw')}
        style={{
          fontFamily: FONT_UI, fontWeight: 600, fontSize: 10,
          letterSpacing: '0.02em',
          color: lvl === 1 ? T.inkStrong : T.inkWarm,
          border: `1px solid ${lvl === 1 ? T.cardEdge : T.border}`,
          borderRadius: 999,
          padding: '0px 4px',
          whiteSpace: 'nowrap',
        }}
      >
        {lvl === 1 ? 'I' : 'II'}
      </span>

      <span
        className="inline-flex items-center"
        style={{
          fontFamily: FONT_UI,
          fontWeight: 600,
          fontSize: 10,
          // +BONES = mena ⇒ tyrkys sekcie (Matej 23. 10.: „tyrkys používame len v súvislosti s BONES s menou")
          color: BONES.ink,
          background: BONES.grad,
          borderRadius: 999,
          padding: '4px 8px',
          gap: 4,
          whiteSpace: 'nowrap',
        }}
      >
        +{m.points}
        <BrandIcon name="bone" size={9} tint="dark" />
      </span>
    </div>
  );
}

// Fotka psa v zozname. Bez fotky (reálne dáta ju dnes nemajú) = zlatý kotúč
// s prvým písmenom, nie prázdny štvorec — chýbajúci obrázok nesmie vyzerať
// ako rozbitý riadok.
function Avatar({ src, name, size }: { src?: string; name?: string | null; size: number }) {
  const [failed, setFailed] = useState(false);
  const letter = (name || '?').trim().charAt(0).toUpperCase();
  if (!src || failed) {
    return (
      <span
        aria-hidden
        className="inline-flex items-center justify-center shrink-0"
        style={{
          width: size, height: size, borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(201,154,63,0.30), rgba(201,154,63,0.12))',
          border: `1px solid ${T.border}`,
          fontFamily: FONT_TITLE, fontWeight: 700, fontSize: size * 0.42, color: T.inkWarm,
        }}
      >
        {letter}
      </span>
    );
  }
  return (
    <img
      src={sizedUrl(src, size * 3)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0"
      style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        border: `1px solid ${T.cardEdge}`,
      }}
    />
  );
}

// Popup s celou líniou (Matej 2026-08-12: „odkaz na otvorenie popupu - kde bude
// zoznam-foto, meno email, poradove číslo dátum"). Pri 62 riadkoch je to jediné
// miesto, kde sa dá zoznam prehľadať — v stĺpci profilu by zabral celú stránku.
function NetworkListPanel({ rows, onClose }: {
  rows: { m: Member; lvl: number }[]; onClose: () => void;
}) {
  const t = useT();
  const tx: Tx = (key, fallback, vars) => {
    const v = t(key, vars);
    return v === key ? fillVars(fallback, vars) : v;
  };
  const total = rows.reduce((s, r) => s + r.m.points, 0);
  // 🔴 createPortal do `document.body` je POVINNÝ, nie štýl. Karty v `/pack`
  // majú na predkoch `will-change: transform`, a ten robí z predka containing
  // block pre `position: fixed` — bez portálu sa panel uväzní vnútri karty
  // (overené: otvoril sa oseknutý, s hlavičkou nad horným okrajom obrazovky).
  return createPortal(
    // z-[70]: nad `.ainubis-launcher` (z-index 60), rovnako ako ostatné panely.
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose} />
      <div
        className="absolute left-1/2 top-1/2 flex flex-col"
        style={{
          transform: 'translate(-50%,-50%)',
          width: 'min(720px, 92vw)',
          maxHeight: '86vh',
          background: T.panelGrad,
          border: `1.5px solid ${T.cardEdge}`,
          borderRadius: 14,
          padding: 16,
          boxShadow: T.panelShadow,
        }}
      >
        <div className="flex items-start shrink-0" style={{ gap: 12, marginBottom: 12 }}>
          {/* × → šípka späť vľavo (Matej 27. 9. 2026: „dávajme všade len šípky, nie krížiky"). */}
          <BackButton tone="pale" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                display: 'block', fontFamily: FONT_TITLE, fontSize: 10,
                letterSpacing: '0.26em', textTransform: 'uppercase', color: T.inkDim,
              }}
            >
              {tx('pack.network.whoJoined', 'Who joined through you')}
            </span>
            <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, marginTop: 4 }}>
              {tx('pack.network.listSummary', '{n} people · {b} BONES earned', { n: rows.length, b: total })}
            </span>
          </div>
        </div>

        <div className="flex flex-col overflow-y-auto" style={{ gap: 5, minHeight: 0 }}>
          {rows.map(({ m, lvl }, i) => (
            <MemberRow key={`${m.created_at}-${i}`} m={m} lvl={lvl} full />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Reťaz pod krokom 2 ─────────────────────────────────────────────────────
// Vodorovná, kompaktná, s tvojím skutočným avatarom na začiatku. Prázdny stav
// nič neskrýva — uzly sú prerušované duchovia so „your first invite", takže
// vyzerá ako nevyplnený rodokmeň, nie ako chyba.
function Chain({
  l1,
  l2,
  avatarUrl,
  initial,
  loading,
}: {
  l1: Member[];
  l2: Member[];
  avatarUrl?: string | null;
  initial?: string;
  loading: boolean;
}) {
  const t = useT();
  const tx: Tx = (key, fallback, vars) => {
    const v = t(key, vars);
    return v === key ? fillVars(fallback, vars) : v;
  };
  const solo = l1.length === 0;
  return (
    <span className="flex items-center flex-wrap" style={{ gap: 8 }}>
      <span className="flex flex-col items-center" style={{ gap: 5 }}>
        <Node me avatarUrl={avatarUrl} initial={initial} />
        <Lab>{tx('pack.network.chainYou', 'you')}</Lab>
      </span>

      {/* Spojka a uzol, ku ktorému patrí, sú JEDNA skupina (audit C3): predtým sa
          reťaz lámala po jednotlivých prvkoch a pilulka `+10` končila osamote na
          konci riadku bez uzla. Zalamuje sa teda medzi skupinami, nie vnútri nich. */}
      <span className="flex items-center" style={{ gap: 8 }}>
      <Link20 pill={`+${L1_BONES}`} />

      <span className="flex flex-col items-center" style={{ gap: 5 }}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: T.inkFaint }} />
        ) : (
          <span className="flex" style={{ gap: 5 }}>
            {solo
              ? [0, 1].map((i) => <Node key={i} sm ghost seed={i} />)
              : l1.slice(0, 3).map((m, i) => <Node key={i} sm member={m} />)}
            {l1.length > 3 && <Node sm label={`+${l1.length - 3}`} />}
          </span>
        )}
        <Lab>
          {solo
            ? tx('pack.network.chainFirstInvite', 'your first invite')
            : tx('pack.network.chainJoined', '{n} joined', { n: l1.length })}
        </Lab>
      </span>
      </span>

      <span className="flex items-center" style={{ gap: 8 }}>
      <Link20 pill={`+${L2_BONES}`} small />

      <span className="flex flex-col items-center" style={{ gap: 5 }}>
        <span className="flex" style={{ gap: 4 }}>
          {l2.length > 0
            ? l2.slice(0, 4).map((m, i) => <Node key={i} xs member={m} />)
            : [0, 1, 2].map((i) => <Node key={i} xs ghost faint seed={i + 2} />)}
        </span>
        <Lab dim>{tx('pack.network.chainWhoever', 'whoever they bring')}</Lab>
      </span>
      </span>
    </span>
  );
}

// Spojka medzi uzlami — zlatá pilulka na vodorovnej stonke. Rovnaký vizuál ako
// DAYS_PILL (PackTree): vertikálny gradient, tmavý text, Cinzel 700 bez uppercase.
function Link20({ pill, small }: { pill: string; small?: boolean }) {
  return (
    <span className="flex flex-col items-center shrink-0" style={{ gap: 3, minWidth: 46 }}>
      <span
        className="pknet-pill"
        style={{
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          fontSize: small ? 10 : 11,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          /* TYRKYS spolu s číslami krokov (23. 10. 2026, predtým lapis 12. 9.). */
          color: BONES.ink,
          background: BONES.grad,
          borderRadius: 999,
          padding: '4px 8px',
        }}
      >
        {pill}
      </span>
      <span
        aria-hidden
        className="pknet-track"
        style={{ width: '100%', height: 2, borderRadius: 2, opacity: small ? 0.6 : 1 }}
      />
    </span>
  );
}

function Lab({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <span
      style={{
        fontFamily: FONT_UI,
        fontWeight: 500,
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: T.inkFaint,
        marginTop: 6,
        opacity: dim ? 0.75 : 1,
      }}
    >
      {children}
    </span>
  );
}

function Node({
  me,
  sm,
  xs,
  ghost,
  faint,
  member,
  label,
  avatarUrl,
  initial,
  seed = 0,
}: {
  me?: boolean;
  sm?: boolean;
  xs?: boolean;
  ghost?: boolean;
  faint?: boolean;
  member?: Member;
  label?: string;
  avatarUrl?: string | null;
  initial?: string;
  seed?: number;
}) {
  // Uzly sú väčšie, odkedy nesú fotky — pes na 22px nebol rozoznateľný.
  const size = me ? 48 : sm ? 36 : xs ? 28 : 36;
  const text =
    label ??
    (member ? (member.owner_name?.[0] || member.dog_name?.[0] || '?').toUpperCase() : ghost ? '·' : initial || 'D');
  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: FONT_TITLE,
    fontWeight: 700,
    fontSize: me ? 15 : xs ? 10 : 12,
    color: T.inkWarm,
    background: xs ? 'rgba(201,154,63,0.10)' : 'rgba(201,154,63,0.18)',
    border: `1.5px solid ${xs ? 'rgba(201,154,63,0.28)' : T.border}`,
  };
  if (ghost) {
    // Prerušovaný zlatý ring drží čitateľnú informáciu „toto miesto je voľné",
    // fotka pod ním dodáva, o čo ide. Jemné stlmenie ju odlíši od reálneho
    // člena, ale nechá ju vidieť — čisté `opacity: .3` bolo neviditeľné.
    base.background = 'transparent';
    base.border = `1.5px dashed ${faint ? PACK_THEME.border : PACK_THEME.border}`;
    base.color = 'rgba(201,154,63,0.5)';
    base.opacity = faint ? 0.8 : 0.92;
  }
  if (me) {
    base.border = `2px solid ${T.cardEdge}`;
    base.background = 'linear-gradient(135deg, #F0E3C4, #F5EDD8)';
    base.color = T.inkFaint;
  }
  return (
    <span className={me ? 'pknet-me' : undefined} style={base} title={member?.dog_name ?? undefined}>
      {me && avatarUrl ? (
        <img src={sizedUrl(avatarUrl, 320)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : member?.avatar ? (
        // Uzol s fotkou psa. Dnes ju má len ukážková línia — `get_my_network()`
        // fotku nevracia, takže na reálnych členoch padá na iniciálu nižšie.
        <img src={sizedUrl(member.avatar, 160)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : ghost ? (
        <img
          src={placeholderDog(seed)}
          alt=""
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.4) contrast(0.95)' }}
        />
      ) : (
        text
      )}
    </span>
  );
}

// Hlavné číslo karty. Zlatá výplň + 2px rám + tieň, číslo v Cinzel na 40px —
// jediné číslice takej veľkosti v profile, takže sa nedajú prehliadnuť.
// `Coin()` ZANIKOL 12. 9. 2026 — minca má odteraz jediný zdroj: `BonesCoin.tsx`.
// Bledý variant (`onGold`) padol ešte skôr, spolu s plnou zlatou dlaždicou, pre ktorú
// vznikol. Volajúci si berú veľkosť menom (`m` = dlaždica, `l` = peňaženka), nie číslom.

// Dlhý text — klikateľný panel, NIE `title` tooltip: na mobile hover neexistuje.
// Kľúče a EN fallbacky (žiadna JSX) — preklad + interpolácia {l1}/{l2}/{n} sa
// vyhodnocuje v `InfoPanel`, ktoré má prístup k `tx`.
const INFO = {
  why: {
    capKey: 'pack.network.info.why.cap', capFallback: 'Why we ask you',
    bodyKey: 'pack.network.info.why.body',
    bodyFallback:
      'A movement this size can’t be bought — no budget reaches a stranger the way one Dogyptian '
      + 'reaches a friend. So the pack puts the reward where the reach is: with you. When someone joins '
      + 'through your link you get <b>{l1} BONES</b>; when they bring someone, you get <b>{l2}</b> more. '
      + 'Every Dogyptian who spreads the word is not a salesperson — they are a missionary, and we honour that work.',
  },
  bones: {
    capKey: 'pack.network.info.bones.cap', capFallback: 'What is BONES?',
    bodyKey: 'pack.network.info.bones.body',
    bodyFallback:
      'BONES is DOGYPT’s internal currency — a playful name for a real thing. A dog pays in bones; '
      + 'so do we. You <b>earn</b> them by bringing dog lovers into the pack and by moving the movement '
      + 'forward, and you <b>spend</b> them inside DOGYPT: backing shelter collections, claiming merch, and '
      + 'later paying other Dogyptians for what they make. <b>{n} BONES = €1.</b>',
  },
} as const;

function InfoPanel({ variant, onClose }: { variant: 'why' | 'bones'; onClose: () => void }) {
  const t = useT();
  const tx: Tx = (key, fallback, vars) => {
    const v = t(key, vars);
    return v === key ? fillVars(fallback, vars) : v;
  };
  const c = INFO[variant];
  const cap = tx(c.capKey, c.capFallback);
  const body = variant === 'why'
    ? tx(c.bodyKey, c.bodyFallback, { l1: L1_BONES, l2: L2_BONES })
    : tx(c.bodyKey, c.bodyFallback, { n: BONES_PER_EUR });
  return (
    // z-[70]: rovnaký dôvod ako vo `WalletPanel` — nad `.ainubis-launcher` (z-index 60).
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose} />
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: 'translate(-50%,-50%)',
          width: 'min(420px, 90vw)',
          background: T.panelGrad,
          border: `1.5px solid ${T.cardEdge}`,
          borderRadius: 14,
          padding: 24,
          boxShadow: T.panelShadow,
        }}
      >
        <div className="flex items-start" style={{ gap: 12, marginBottom: 10 }}>
          {/* × → šípka späť vľavo (Matej 27. 9. 2026: „dávajme všade len šípky, nie krížiky"). */}
          <BackButton tone="pale" onClick={onClose} label={tx('pack.network.close', 'Close')} />
          <span
            style={{
              fontFamily: FONT_TITLE,
              fontSize: 10,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: T.inkDim,
            }}
          >
            {cap}
          </span>
        </div>
        <p
          style={{ fontFamily: FONT_UI, fontSize: 12, lineHeight: 1.6, color: T.inkDim, margin: 0 }}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </div>
  );
}
