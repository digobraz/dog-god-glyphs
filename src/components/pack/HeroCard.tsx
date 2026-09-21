import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
// Brandové hand-drawn ikonky namiesto lucide (audit 12.8., nasadené 13.8.). `X` ostáva
// lucide zámerne — systémový ovládač zavretia, brand glyf by tam pridal len šum.
import { HandHouseHeart, HandKey, HandLink, HandPaw, HandPencil, HandPlus } from './HandIcons';
import { INVITE_ANCHOR_ID } from './FounderInvite';
import { BrandIcon } from './BrandIcon';
import { GOLD_BLOCK_CSS, LAPIS, LAPIS_BTN_SHADOW } from './navGoldSkin';
import { BonesCoin } from './BonesCoin';
import { PACK_BOX, PACK_THEME, FONT_TITLE, FONT_UI, PF_FIELD_CSS, PILL_CSS, GOLD_BTN } from './packTheme';
import { saveHuman } from './profile/packProfile';
import { PackNotifications } from './PackNotifications';
import { WIZ } from './wizAnchors';
import { DEV_FULL, PAWMATE_LIVE } from '@/lib/packFlags';
import { devotionLevel } from '@/lib/devotion';
import { useDogyptStore } from '@/store/dogyptStore';
import { useLang, useT } from '@/i18n/LanguageContext';
import { skPossessive } from '@/lib/skPossessive';

const T = PACK_THEME;

const AVATAR_SIZE = 132;
/** Pes je vedľa majiteľa ZÁMERNE menší — homepage hovorí „toto si ty a toto je tvoja
 *  svorka", nie naopak. Detail psa má vlastný povrch (`/pack/dogs`). */
const DOG_SIZE = 100;
// Ring = náš brandový gradient `--brand-gradient` (egyptská modrá → čierna → zlatá;
// do 2026-06-15 bol fialový, odtiaľ staré „fialovo-zlatý" v komentároch)
const STORY_RING = 'var(--brand-gradient)';

/** Šírka, ktorú si v hornom rade berie „+" (krúžok 26 px + medzera). Odkrája sa z dosky
 *  PRED rovnicou pyramídy — viď komentár pri `planRow()` volaní. */
const PLUS_SIZE = 26;
const PLUS_RESERVE = PLUS_SIZE + 14;

// ── RÁM SVORKY (F0b, 12. 9. 2026) ────────────────────────────────────────────
// Matej: „dve fotky majitel/pes budu vo farebnom ramiku s možnosťou zvoliť meno
// svorky ako sa budu zobrazovať". Rám NIE JE farebný — R10 (zadanie
// `plany/zadanie-clenovia-svorky-2026-09-12.md`, §7b): hierarchiu kreslí HĹBKA,
// nie farba. Lapis, fialová aj tyrkysová sú v brande rozdané.
//
// 🔴 A NIE JE ANI ZLATÝ DBLOK (Matej 12. 9., prvý pokus vrátený: „nemože byť dblok
// v dbloku"). Zadanie počítalo s tým, že vonkajší zlatý rám je až SPOJENÁ svorka
// (vlna B) — lenže blok 1 zlatý rám UŽ MÁ od 11. 9. (`.pk-goldblock`), takže
// `goldFrameCSS()` vnútri neho je ten istý odliatok dvakrát nad sebou a hierarchia
// zmizne. Správna úroveň je **PODBLOK z matrice** (`PACK_BOX.subblock`) — presne to,
// čo brand definuje ako sekciu VNÚTRI karty: papyrusový gradient, 1px zlatý okraj,
// radius 12. Vlastné čísla sem nepíš, ber ich z matrice.
//
// ⚠️ Rám a menovka UBERAJÚ ŠÍRKU pyramíde. Nie je to problém: `rowRef` sedí VNÚTRI
// rámu, takže `planRow()` dostane už zúženú šírku a prepočíta sa sám — nič sa nemeria
// po tom, čo sa niečo nastavilo (tá istá pasca ako v psom bloku). Vodorovné odsadenie
// je preto na mobile menšie: pri 390 px je rovnica na hrane (majiteľ + pes + „+" =
// 280 px) a každý pixel, čo si rám vezme, chýba zámku „všetci psi viditeľní VŽDY".
const PACK_FRAME_CSS = `
.hc-packframe{padding:12px 8px 16px;}
@media(min-width:480px){.hc-packframe{padding:16px 16px 16px;}}
`;

// ── PYRAMÍDA SVORKY (Matej 2026-08-09, po klikacom nákrese) ──────────────────
// Rad avatarov NIE JE `flex-wrap` — ten sa pri 5+ psoch lámal náhodne. Rozloženie
// počíta `planRow()` ROVNICOU z počtu psov a šírky kontajnera; nič sa nemeria po
// vykreslení (tá istá pasca ako v psom bloku na `/pack/dogs`, viď CLAUDE.md lock 8. 8.).
//   · horný rad = majiteľ + MAX 2 psy vo veľkom — jedno pravidlo pre mobil aj desktop,
//     aby tvar pyramídy nezávisel od šírky okna (Matejov výber, alternatíva bola 3 na PC)
//   · zvyšok padá do max 3 spodných radov v menšom tieri, delených čo najrovnomernejšie
//     (širší rad hore): 12 psov → 6/5, 20 → 7/6/6
//   · „+" slot sa počíta DO delenia a je vždy posledný, inak visí sám na novom riadku
//   · pyramída sa rozširuje NADOL — spodný rad nikdy nemá menej slotov než horný (3 psy =
//     jeden hore, dvaja dolu). Tým sa rieši aj to, že spodný rad nesmie byť len osamotené „+"
//   · dvojica dolu sa NEZMENŠUJE (vznikne súmerná 2×2 mriežka, nie zmenšený zvyšok)
//   · všetci psi sú viditeľní VŽDY — žiadne „+3 more", žiadny scroll
const MAX_TOP_DOGS = 2;
const MOBILE_SCALE = 0.76;          // majiteľ 100 / pes 76 → majiteľ + 2 psy sa vojdú do 390 px
const MOBILE_INNER = 480;           // pod touto šírkou obsahu = mobilné veľkosti
const TIERS_DESKTOP = [84, 70, 60, 52, 46];
const TIERS_MOBILE = [64, 56, 50, 44, 38];

interface RowPlan {
  owner: number;
  big: number;
  gap: number;
  topDogs: number;
  plusInTop: boolean;
  /** počty slotov v spodných radoch, posledný slot posledného radu je „+" */
  rows: number[];
  rowSize: number;
}

/** `inner` = čistá šírka obsahu karty (bez paddingu).
 *  `plus` = či „+" ešte stojí V RADE. Od 12. 9. 2026 je to `false` — „+" sa presunul na
 *  menovkový riadok rámu (viď `PackNameRow`), takže z rovnice VYPADNE. Parameter tu ostáva,
 *  lebo je to jediná vec, ktorá o pyramíde rozhoduje zvonku, a bez neho by sa tá zmena
 *  musela zapísať do rovnice natvrdo. */
function planRow(n: number, inner: number, plus = true): RowPlan {
  const mobile = inner < MOBILE_INNER;
  const s = mobile ? MOBILE_SCALE : 1;
  const owner = Math.round(AVATAR_SIZE * s);
  const big = Math.round(DOG_SIZE * s);
  const gap = mobile ? 14 : 22;
  const P = plus ? 1 : 0;
  const fits = (count: number, size: number) => owner + count * (size + gap) <= inner;

  // Malá svorka → majiteľ + psy (+ „+") v jednom rade, spodný rad nevznikne
  if (n <= MAX_TOP_DOGS && fits(n + P, big)) {
    return { owner, big, gap, topDogs: n, plusInTop: plus, rows: [], rowSize: big };
  }

  let topDogs = Math.min(MAX_TOP_DOGS, n);
  // Spodný rad nesmie byť UŽŠÍ než horný — pyramída sa rozširuje NADOL (Matej 2026-08-09:
  // „ked su 3 psy tak jeden hore dvaja dolu"). Rieši to zároveň starší prípad, keď by v
  // spodnom rade zostalo osamotené „+" („aby v 2 riadku bol pes a plus nie len + samotné").
  // Horný rad má `topDogs + 1` slotov (majiteľ sa počíta), spodný `n - topDogs + 1` („+").
  while (topDogs > 0 && n - topDogs + P < topDogs + 1) topDogs -= 1;
  const items = n - topDogs + P;                  // zvyšok psov (+ miesto pre „+")

  // Bez „+" sa spodný rad nemusí otvoriť vôbec — všetci psi sú hore.
  if (items === 0) {
    return { owner, big, gap, topDogs, plusInTop: false, rows: [], rowSize: big };
  }

  if (items <= 2 && items * (big + gap) - gap <= inner) {
    return { owner, big, gap, topDogs, plusInTop: false, rows: [items], rowSize: big };
  }

  const tiers = mobile ? TIERS_MOBILE : TIERS_DESKTOP;
  let size = tiers[tiers.length - 1];
  let rows = 99;
  for (const tier of tiers) {
    const perRow = Math.max(2, Math.floor((inner + gap) / (tier + gap)));
    const r = Math.ceil(items / perRow);
    size = tier;
    rows = r;
    if (r <= 3) break;                            // fallback = najmenší tier
  }

  const base = Math.floor(items / rows);
  const extra = items % rows;
  const split = Array.from({ length: rows }, (_, i) => base + (i < extra ? 1 : 0));

  return { owner, big, gap: Math.max(12, Math.round(gap * 0.8)), topDogs, plusInTop: false, rows: split, rowSize: size };
}

// ─────────────────────────────────────────────────────────────────────────────
// HeroCard = JEDINÝ horný blok na /pack. READ-ONLY od 2026-08-06 (Matej: „na
// homepage musí byť viditeľný absolutny zaklad + linky na editáciu").
//
// KONSOLIDÁCIA 2026-08-08 (Matej: „ideme zjednodušiť, 1 blok nie dva v riadku"):
// fialový `PackTree` (blok „MY PACK") sa na homepage UŽ NEMOUNTUJE. Jeho obsah je
// tu ako rad avatarov: [majiteľ] [pes] [pes] … [+ prázdny slot].
//   · heroglyf, pilulka dní nažive, vlajka, status bodka → zostali v `/pack/dogs`,
//     na homepage sa opakovali. Homepage má byť rýchla, nie úplná.
//   · ADD DOG tlačidlo nahradil prázdny slot s „+" (rovnaký cieľ `/heroglyph/intro`
//     + rovnaký `reset()` flow storu — bez neho by druhý pes zdedil dáta prvého).
//   · „Add human member" (disabled coming-soon) odišlo bez náhrady.
//   · PackTree.tsx sa NEMAZAL — parkuje, presne ako DailyPrayers.
// ⚠️ Všetci psi musia byť viditeľní VŽDY — žiadne „+3 more", žiadny scroll. Rad UŽ
//    NEWRAPUJE: od 2026-08-09 je to pyramída počítaná `planRow()` (viď nižšie).
//
// Editácia fotky aj mena je v `/pack/profile` — jediný odchod odtiaľto je nenápadná
// ceruzka vpravo hore. ⚠️ Nevracať sem in-place upload skôr, než sa zavrie route
// `/pack/profile` v App.tsx; inak si člen fotku nezmení nikde.
//
// Badge (Pawtner · level · BONES) a devotion bar sú klikateľné a KAŽDÝ má popup —
// dovtedy to boli nevysvetlené ozdoby.
// ─────────────────────────────────────────────────────────────────────────────

/** Minimum, ktoré rad avatarov potrebuje. Celý DogRow z `Pack.tsx` sem netreba —
 *  dni nažive / health / breed sú na tomto povrchu zámerne nezobrazené. */
export interface HeroDog {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  pack_number?: number | null;
}

interface HeroCardProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  /** Faraón line-art placeholder podľa pohlavia majiteľa (selections.ownerGender) keď chýba reálna fotka */
  genderPlaceholder?: 'man' | 'woman' | null;
  /** DEVOTION — sakrálna mena ranku. Zbieranie zamknuté do launchu appky (2027). */
  devotion?: number;
  /** $BONE balance — dnes referral mena (affiliates.points). */
  bones?: number;
  /** Pack pulse pre notifikačný bell (top-right). Nezobrazí sa kým nedôjdu stats. */
  stats?: { last24h: number; last30d: number; total: number } | null;
  /** Svorka vedľa majiteľa. `null` = ešte sa načítava (rad sa nevykreslí, aby neblikol „+"). */
  dogs?: HeroDog[] | null;
  /** Meno svorky na ráme (`pack_profiles.human.packName`). Prázdne = krstné meno majiteľa. */
  packName?: string | null;
}

type PopKey = 'pawtner' | 'level' | 'bones' | 'devotion';

export function HeroCard({ name, email, avatarUrl, genderPlaceholder = null, devotion = 100, bones = 0, stats = null, dogs = null, packName = null }: HeroCardProps) {
  const t = useT();
  const { lang } = useLang();
  const [pop, setPop] = useState<PopKey | null>(null);
  // „+" už nevedie priamo do heroglyf flow — otvára popup, ktorý sa pýta ČO sa pridáva
  // (Matej 12. 9. 2026: „tlačítko + otvorí popup"). Vlastný stav, nie ďalší `PopKey`:
  // `HeroPopup` je vysvetľovač pilulky (eyebrow + text), toto je rázcestie s dverami.
  const [addOpen, setAddOpen] = useState(false);
  // Dvere PAWMATE vedú do `/pack/profile#pawmates` (B6b) — nie do modálu nad kartou.
  const nav = useNavigate();

  const displayName = name;
  const initial = displayName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'D';
  // Meno svorky z profilu. Prázdne = padá na `pack.pack.defaultName` („Svorka <meno>") —
  // menovka na ráme stojí VŽDY (Matej 12. 9. 2026). Podrobnosti pri `PackNameRow`.
  const packLabel = (packName || '').trim();
  // Prázdna svorka = človek bez psa. Vtedy je „pridať psa" HLAVNÁ akcia a 26px krúžok
  // v menovkovom riadku ju neunesie — nabehne plné CTA a malý „+" sa vypne. Dva „+"
  // v jednom ráme sú dve odpovede na tú istú otázku. ⚠️ `dogs === null` je NAČÍTAVANIE,
  // nie prázdno — vtedy sa nesmie bliknúť ani CTA, ani „+".
  const emptyPack = dogs !== null && dogs.length === 0;
  const hasAvatar = !!avatarUrl;
  const placeholderSrc = genderPlaceholder ? `/images/avatars/pharaoh-${genderPlaceholder}.png` : null;

  // Kam vedie „EDIT DOGS" — hub je za DEV_FULL, bez neho DOG ID prvého psa. Viď komentár
  // pri pilulke nižšie.
  const dogsHref = DEV_FULL
    ? '/pack/dogs'
    : dogs && dogs.length > 0
      ? `/pack/dogs/${dogs[0].id}`
      : null;

  // DEVOTION úroveň počítaná z bodov → poháňa LEVEL badge (žiadny hardcode „Pharaoh" pre všetkých).
  const lv = devotionLevel(devotion);

  // Jediný VSTUP do rovnice pyramídy = šírka obsahu karty. Wrapper je `w-full` blok,
  // takže jeho šírka NEZÁVISÍ od toho, čo doň rovnica vloží — inak by ResizeObserver
  // krúžil dokola. Nič iné sa nemeria.
  const rowRef = useRef<HTMLDivElement>(null);
  const [innerW, setInnerW] = useState(0);
  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const read = () => setInnerW(el.clientWidth);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pack = dogs ?? [];
  // `dogs === null` = ešte sa načítava → majiteľ sám, žiadny „+" (nesmie bliknúť).
  // ⚠️ ŠÍRKA „+" SA ODKRÁJA PRED ROVNICOU, nie po nej. Rovnica dostane užšiu dosku a
  // preskupí rady sama — nič sa nemeria po tom, čo sa niečo nastavilo (tá istá pasca ako
  // v psom bloku). `plus` parameter rovnice ostáva `false`: „+" nie je slot veľkosti psa,
  // je to 26 px krúžok, takže by ho počítala priveľký.
  const plusReserve = pack.length > 0 ? PLUS_RESERVE : 0;
  const plan = planRow(pack.length, Math.max(120, innerW - plusReserve), false);
  let cursor = plan.topDogs;
  const bottomRows = plan.rows.map((count) => {
    const slice = pack.slice(cursor, cursor + count);
    cursor += slice.length;
    return slice;
  });

  return (
    <section
      className="pack-card-hover pk-goldblock h-full"
      /* ZLATÝ RÁM ako spodný nav (Matej 11. 9. 2026, „ano daj to len pri 1. bloku
         a komunite"). Výplň, rám, polomer aj tieň nesie trieda `.pk-goldblock`
         (`GOLD_BLOCK_CSS` → `goldFrameCSS()`); inline ostáva LEN to, čo trieda
         nerieši. Vrátiť sem `background`/`border`/`borderRadius`/`boxShadow` znamená
         rám prebiť a zrušiť. */
      style={{
        padding: '24px 24px 24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{GOLD_BLOCK_CSS + PACK_FRAME_CSS}</style>
      {/* corner ornament */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Notifikácie + správy (coming soon) — vpravo hore. DEV_FULL: presunuté do globálneho
          top-right hubu (PackTopRight, D4 nav rework 2026-07-24) — tu by bol duplikát. LIVE:
          zostáva presne ako predtým (bez zmeny). */}
      {stats && !DEV_FULL && (
        <PackNotifications last24h={stats.last24h} last30d={stats.last30d} total={stats.total} />
      )}

      {/* Odchody na editáciu — DVE nenápadné pilulky, NIE veľké zlaté CTA (Matej
          2026-08-06: „CTA uprav profil pri človeku je zbytočne veľké"). */}
      {/* 🔴 JEDEN RAD NA KAŽDEJ ŠÍRKE + SKRÁTENÉ MENOVKY (Matej 12. 9. 2026: „stale su
          tlačítka cez okra vnutorneho ramu… ten rám zúž alebo tie tlačítka daj vedľa seba
          alebo zkrat nazvy"). Tým padol stĺpec z 8. 8. 2026.
          PREČO RAD: kolízia je VERTIKÁLNA, nie vodorovná. Pilulka je ~24 px vysoká, stojí
          na `top:14` ⇒ prvá končí na 38, druhá v stĺpci (gap 8) až na 70 — a rám svorky
          začína na ~60 (22 px padding karty + 20 px eyebrow + 18 px medzera). Jeden rad
          končí na 38, teda 22 px nad rámom. Zúženie rámu by nepomohlo: musel by ustúpiť
          ~180 px z každej strany, aby sa pilulkám vyhol, a to je pol pyramídy.
          PREČO AJ KRATŠIE MENOVKY: dva PLNÉ názvy vedľa seba majú ~330 px a pri užšom okne
          prejdú cez centrovaný eyebrow „VITAJ SPÄŤ!" — presne to, čo 12. 8. poslalo texty
          na mobile dolu. „PROFIL" + „PSY" majú ~175 px, čo sa zmestí aj pri 640 px.
          ⚠️ `aria-label` a `title` NESÚ PLNÉ znenie — skratka je vizuálna, nie významová.
          ⚠️ Popisok na mobile (<640 px) NEVRÁTIŤ (overené meraním 2026-08-12): aj skrátený
          rad tam ide cez eyebrow, ktorý má na 360 px len ~150 px voľna.
          ⚠️ EDIT DOGS má DVA ciele zámerne: hub `/pack/dogs` je v `App.tsx` za `DEV_FULL`
          a bez flagu redirectuje späť na `/pack` — bežný člen by klikal do slepej ulice.
          Bez flagu preto mieri na DOG ID prvého psa (`/pack/dogs/:id`), ktoré je živé pre
          všetkých. Žiadny pes = pilulka sa nevykreslí, nie je čo upravovať.
          Keď je v rohu bell od notifikácií, rad sa posunie vedľa neho, nie pod. */}
      <div
        className="absolute inline-flex items-center gap-2"
        style={{ top: 14, right: stats && !DEV_FULL ? 60 : 14, zIndex: 3 }}
      >
        <Link
          to="/pack/profile"
          className="pk-pill pk-pill--tap hc-edit"
          aria-label={t('pack.hero.editProfile')}
          title={t('pack.hero.editProfile')}
        >
          <HandPencil size={12} className="shrink-0" />
          <span className="hidden sm:inline">{t('pack.hero.editProfileShort')}</span>
        </Link>
        {dogsHref && (
          <Link
            to={dogsHref}
            className="pk-pill pk-pill--tap hc-edit"
            aria-label={t('pack.hero.editDogs')}
            title={t('pack.hero.editDogs')}
          >
            <HandPaw size={12} className="shrink-0" />
            <span className="hidden sm:inline">{t('pack.hero.editDogsShort')}</span>
          </Link>
        )}
      </div>

      <div className="flex flex-col items-center text-center flex-1 justify-center relative">
        <div
          style={{
            fontFamily: FONT_TITLE,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: T.inkStrong,
            marginBottom: 18,
          }}
        >
          {t('pack.hero.welcomeBack')}
        </div>

        {/* ── PYRAMÍDA: [majiteľ + max 2 psy] / spodné rady / „+" ────────────────
            `items-start` + fotka centrovaná v boxe výšky najväčšieho prvku radu =
            kruhy sedia na spoločnej osi a VŠETKY menovky radu začínajú na rovnakej y,
            aj keď je pes menší. Zarovnanie zhora by menovky psov vytiahlo nad meno
            majiteľa. Rozdelenie do radov počíta `planRow()` — viď komentár hore. */}
        {/* `WIZ.dogsRow` — sem svieti druhý krok prehliadky (AInubis: „poď so mnou do
            svorky"). Kotva sedí na RADE, nie na celej karte: prvý krok už zvýrazňuje
            celý blok, dva rovnaké spotlighty za sebou by nič nepovedali. */}
        {/* RÁM SVORKY — obopína [majiteľ + psy]. Podrobnosti pri `PackNameRow`. */}
        <div className="w-full hc-packframe" style={PACK_BOX.subblock}>
          {/* Menovka stojí VŽDY (aj pri prázdnej svorke) — „+" len keď je koho pridať vedľa;
              bez psa ho nesie plné CTA pod čiarou. `dogs === null` = načítavanie, vtedy
              nesmie bliknúť ani jedno. */}
          {/* Východisko menovky = „MATEJOVA SVORKA" (Matej 12. 9. 2026: „a text je matejova
              svorka... nie matej svorka"). SK potrebuje PRIVLASTŇOVACÍ TVAR mena, preto sa
              do kľúča posiela už ohnuté slovo (`skPossessive`) a reťazec je „{owner} svorka";
              EN si vystačí s holým menom a „{owner}'s pack". Ostatné jazyky padajú na EN.
              Odhad tvaru sa NIKAM NEUKLADÁ — kto si ho neuzná, prepíše menovku ceruzkou. */}
          <PackNameRow
            label={packLabel}
            fallback={t('pack.pack.defaultName', {
              owner: lang === 'sk' ? skPossessive(displayName, genderPlaceholder) : displayName,
            })}
          />
        <div ref={rowRef} id={WIZ.dogsRow} className="w-full">
          {innerW > 0 && (
            <>
              <div className="flex items-start justify-center" style={{ gap: plan.gap }}>
                <OwnerSlot
                  size={plan.owner}
                  name={displayName}
                  initial={initial}
                  avatarUrl={avatarUrl}
                  placeholderSrc={placeholderSrc}
                />
                {pack.slice(0, plan.topDogs).map((d) => (
                  <DogSlot key={d.id} dog={d} size={plan.big} boxH={plan.owner} gap={plan.gap} />
                ))}
                {/* „+" STOJÍ V RADE ZA PSAMI (Matej 12. 9. 2026: „to plusko daj vedla toho
                    psa take male ako je teraz… matej hektor a +"). Nie je to návrat slotu
                    z 11. 9.: ten mal šírku psa (~90 px) a pri 360 px lámal rad na dva.
                    Tento má 26 px — tú istú veľkosť, akú mal v menovkovom riadku — a jeho
                    šírku si rovnica ODKROJILA DOPREDU (`PLUS_RESERVE`), takže sa
                    neprepočítava po vykreslení. */}
                {!emptyPack && <AddSlot boxH={plan.owner} onAdd={() => setAddOpen(true)} />}
              </div>

              {dogs &&
                bottomRows.map((row, r) => (
                  <div
                    key={r}
                    className="flex items-start justify-center"
                    style={{ gap: plan.gap, marginTop: Math.round(plan.rowSize * 0.3) }}
                  >
                    {row.map((d) => (
                      <DogSlot key={d.id} dog={d} size={plan.rowSize} boxH={plan.rowSize} gap={plan.gap} />
                    ))}
                  </div>
                ))}
            </>
          )}
        </div>
          {emptyPack && <EmptyPackCta onAdd={() => setAddOpen(true)} />}
        </div>

        {/* Badge riadok — STATUS (Pawtner) + BONES. Každý = tlačidlo s popupom.
            grid-cols-2 = dva totožné stĺpce; každý badge w-full + centrovaný = rovnaká veľkosť.
            maxWidth: blok je po zlúčení na celú šírku stránky — bez stropu by sa pilulky
            roztiahli na 900+ px a rad by prestal pôsobiť ako skupina. Strop klesol z 620 na
            440 spolu s tretou pilulkou (11. 9. 2026), inak by dve pilulky držali šírku troch. */}
        <div className="mt-7 grid grid-cols-2 gap-2 w-full" style={{ maxWidth: 440 }}>
          {/* STATUS */}
          <button
            type="button"
            onClick={() => setPop('pawtner')}
            className="pk-pill pk-pill--tap w-full"
          >
            <span
              aria-hidden
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                flexShrink: 0,
                background: T.accentGold ?? 'hsl(40 55% 50%)',
                boxShadow: '0 0 6px rgba(201, 154, 63, 0.6)',
              }}
            />
            <span style={{ fontFamily: FONT_TITLE, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              Pawtner
            </span>
          </button>

          {/* ⚠️ PILULKA RANGU (Nováčik) ZRUŠENÁ 2026-09-11 — Matej: „myslím si že toto môžme
              vypustiť a komunikovať to budeme až ked otvoríme apku aby ludia nemali pocit že
              je to nedokončené alebo teraz o niečo prichádzajú ked to nefunguje."
              Merala DEVOTION (`lib/devotion.ts`), ktorá je pre všetkých zamrznutá na 100 —
              teda rebríček, po ktorom sa zatiaľ nedá stúpať. Vlastný popup to priznával
              („Začne rátať s appkou"), čo je presne ten pocit nedokončenosti.
              🔴 NEPLIESŤ SI S LEVELOM NA `/map`: ten stojí na `lib/tripPoints.ts` (PÚTNIK +
              číslo), ráta sa z reálnych km a výletov a ŽIJE — ostáva, kde je. Dva rebríčky
              vedľa seba boli aj dôvod, prečo bol člen tu „Nováčik" a na mape „Pútnik 16".
              Kľúče `pack.ladder.*`, `pack.hero.popLevel*` a `DevotionPanel.tsx` NEMAZAŤ —
              pilulka sa vráti s appkou. */}

          {/* BONES — minca + kostička */}
          <button
            type="button"
            onClick={() => setPop('bones')}
            className="pk-pill pk-pill--tap w-full"
            aria-label={`${bones} BONES`}
          >
            <span
              aria-hidden
              style={{
                width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
                background: 'radial-gradient(circle at 35% 30%, #F7DD92 0%, #C99A3F 68%, #9A742B 100%)',
                border: '1px solid rgba(120,90,30,0.7)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.55), 0 1px 3px rgba(0,0,0,0.2)',
              }}
            >
              <BrandIcon name="bone" size={9} tint="dark" />
            </span>
            {/* Číslo = DÁTA → Space Grotesk (typo lock: Cinzel = identita, Grotesk = čísla).
                ⚠️ Váha STROP 600 — Grotesk je načítaný len v 300–600, 700 by bol fake bold. */}
            <span style={{ fontFamily: FONT_UI, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em' }}>
              {bones.toLocaleString('en-US')}
            </span>
          </button>
        </div>

        {/* ⚠️ DEVOTION BAR ZRUŠENÝ 2026-08-12 (Matej: „zruš len progres bar, a uprav texting
            po kliku na rank používateľa"). Meral zbieranie, ktoré sa zapne až s mobilnou
            appkou — ostal po ňom zámok a číslo, teda merateľ merajúci prázdno. Vysvetlenie
            sa presunulo do popupu po kliku na pilulku RANGU (`pack.hero.popLevel*`).
            Pilulka rangu ani placeholder faraóna sa NERUŠIA — Matej ich nechal.
            ⚠️ Zostal tu len `<style>` blok — trieda `.hc-edit` ju používajú prvky VYŠŠIE
            v karte, preto sa nesmie odstrániť s barom. `.hc-badge` zanikla 12.8.2026:
            tri pilulky rangu/statusu/BONES prešli na primitív `.pk-pill` (`packTheme.ts`). Popup `devotion`
            (`PopKey`) tým stratil spúšťač a
            kľúče `pack.hero.popDevotion*` / `devotionToNext` / `devotionMaxReached` /
            `ariaDevotionBar` osireli — NEMAZAŤ, bar sa vráti s appkou. */}
        <style>{PILL_CSS}</style>
        <style>{`
            /* Odchody na editáciu = TÁ ISTÁ pilulka ako rang/BONES nižšie (primitív
               .pk-pill), len s UI fontom — dovtedy to bola tretia varianta pilulky
               na jednej karte (priehľadná so slabým zlatým okrajom).
               POZOR: toto je JS template literal, spätný apostrof v komentári ho ukončí. */
            .hc-edit{
              font-family: ${FONT_UI}; font-weight: 500;
              font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
              text-decoration: none;
            }
        `}</style>

      </div>

      {pop && <HeroPopup which={pop} bones={bones} level={t('pack.ladder.' + lv.key)} levelIndex={lv.index} onClose={() => setPop(null)} />}
      {addOpen && (
        <AddPopup
          onClose={() => setAddOpen(false)}
          // DVERE PAWMATE VEDÚ DO PROFILU, NIE DO PANELA (B6b, Matej 13. 9. 2026:
          // *„tieto nastavenia musia byť v profile — tam bude PAWMATES s možnosťou
          // pridať/ubrať psa"*). Jedna správa pawmatov, jedno miesto; panel by bol
          // druhý vstup do tej istej veci s iným rozsahom (jeden pes vs. celá svorka).
          // ⚠️ `PawmatePanel` NEZANIKÁ — `/pack/join/:token` a jeho formulár žijú ďalej.
          onPawmate={PAWMATE_LIVE && dogs && dogs.length > 0 ? () => { setAddOpen(false); nav('/pack/profile#pawmates'); } : null}
        />
      )}
    </section>
  );
}

// ── Slot majiteľa ────────────────────────────────────────────────────────────
// Avatar — ring z `--brand-gradient` (modrá→čierna→zlatá). Read-only: klik už neotvára file picker.
// Veľkosť ide z rovnice (mobil zmenšuje), typografia sa škáluje s ňou, aby pomer
// meno : kruh ostal rovnaký na každej šírke.
function OwnerSlot({
  size, name, initial, avatarUrl, placeholderSrc,
}: { size: number; name: string; initial: string; avatarUrl: string | null; placeholderSrc: string | null }) {
  const hasAvatar = !!avatarUrl;
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* pulsing purple glow behind */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            animation: 'pack-breathe 3.8s ease-in-out infinite',
            // Halo = dvojica z brandového gradientu (egyptská modrá + zlatá). Do 12.8.2026
            // tu svietila fialová (124,58,237) z palety, ktorú brand opustil 15.6.2026 —
            // na modro-zlatom ringu to bola tretia farba.
            boxShadow: '0 0 26px 2px rgba(16, 52, 166, 0.30), 0 0 18px 2px rgba(201, 154, 63, 0.22)',
          }}
        />
        {/* gradient ring */}
        <div
          className="relative rounded-full"
          style={{ width: size, height: size, padding: 4, background: STORY_RING }}
        >
          {/* gap ring (papyrus) */}
          <div className="rounded-full h-full w-full" style={{ padding: 3, background: T.card }}>
            <div
              className="relative block h-full w-full"
              style={{
                borderRadius: '50%',
                background: hasAvatar ? 'transparent' : `linear-gradient(135deg, ${T.cardSoft} 0%, ${T.bgTop} 100%)`,
                overflow: 'hidden',
              }}
            >
              {hasAvatar ? (
                <img src={avatarUrl!} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : placeholderSrc ? (
                <span className="flex items-center justify-center h-full w-full" style={{ padding: Math.round(size * 0.15) }}>
                  <img src={placeholderSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </span>
              ) : (
                <span
                  className="flex items-center justify-center h-full w-full"
                  style={{ fontFamily: FONT_TITLE, fontSize: Math.round(size * 0.41), fontWeight: 700, color: T.inkDim }}
                >
                  {initial}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full"
        style={{
          fontFamily: FONT_TITLE,
          fontSize: Math.round(size * 0.152),
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: T.ink,
          lineHeight: 1.15,
          marginTop: 12,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
    </div>
  );
}

// ── Slot psa v rade ──────────────────────────────────────────────────────────
// Fotka + meno + `#poradové číslo`. Nič viac: heroglyf, dni nažive, vlajka a health
// bodka žijú v `/pack/dogs` — na homepage sa opakovali (Matej 2026-08-08:
// „chceme to skonsolidovať tak aby sa veci neopakovali").
// Veľkosť je PARAMETER (rovnica), nie konštanta — v spodných radoch je pes menší.
function DogSlot({ dog, size, boxH, gap }: { dog: HeroDog; size: number; boxH: number; gap: number }) {
  const t = useT();
  const name = (dog.dog_name || 'Unnamed').toUpperCase();

  return (
    <Link
      to={`/pack/dogs/${dog.id}`}
      className="flex flex-col items-center"
      style={{ width: size, textDecoration: 'none' }}
      title={name}
    >
      {/* Box výšky najväčšieho prvku radu — menšia fotka sa v ňom centruje, takže
          menovky celého radu začínajú na jednej y. */}
      <div className="flex items-center justify-center" style={{ height: boxH }}>
        {/* Relatívny obal MIMO kruhu s `overflow:hidden` — pilulka s číslom sadá na
            spodný okraj fotky a vnútri kruhu by sa orezala. */}
        <div className="relative" style={{ width: size, height: size }}>
          <div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: T.bg,
              overflow: 'hidden',
              border: `2px solid ${T.accentGold}`,
              boxShadow: '0 0 0 1px rgba(201, 154, 63, 0.45), 0 8px 24px rgba(201, 154, 63, 0.24)',
            }}
          >
            {dog.cloudinary_main_url ? (
              <img
                src={dog.cloudinary_main_url}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="flex items-center justify-center h-full"
                style={{ color: T.inkFaint, fontFamily: FONT_TITLE, fontSize: Math.max(7, Math.round(size * 0.09)), letterSpacing: '0.22em' }}
              >
                {t('pack.tree.noPhoto')}
              </div>
            )}
          </div>
          {/* Poradové číslo NA KRUHU (Matej 2026-08-09) — nekradne výšku menovky, takže
              pri 12+ psoch rady nenarastú, a ostáva čitateľné aj pri 46 px ikonke.
              Vizuál = locknutá pilulka dní (gradient #F5C73D→#E69E1A, ink #3d1f00, Cinzel
              700); svetlý hairline je JEDINÝ rozdiel — pilulka tu leží na fotke a bez neho
              splynie s tmavým psom. */}
          {dog.pack_number ? (
            <span
              style={{
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_TITLE,
                fontWeight: 700,
                fontSize: Math.max(8, Math.round(size * 0.115)),
                letterSpacing: '0.02em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                padding: `${Math.max(3, Math.round(size * 0.035))}px ${Math.max(6, Math.round(size * 0.072))}px`,
                borderRadius: 999,
                background: 'linear-gradient(180deg, #F5C73D, #E69E1A)',
                color: '#3d1f00',
                border: '1px solid rgba(250, 244, 236, 0.55)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
              }}
            >
              #{dog.pack_number}
            </span>
          ) : null}
        </div>
      </div>

      <div
        style={{
          // Menovka smie mierne presiahnuť kruh (mená sú dlhšie než fotka), ale nikdy
          // nie do medzery vedľa — inak by sa v spodných radoch mená dotýkali.
          width: size + Math.max(0, Math.min(18, gap - 6)),
          fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
          fontSize: Math.max(8, Math.round(size * 0.145)),
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: T.ink,
          lineHeight: 1.15,
          textAlign: 'center',
          marginTop: 12,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
    </Link>
  );
}

// ── „+" V RADE — pridať člena, vedľa posledného psa ──────────────────────────────
// Matej 12. 9. 2026: „to plusko daj vedla toho psa take male ako je teraz… matej hektor a +".
// Veľkosť ostáva 26 px (`PLUS_SIZE`) — teda tá, akú mal krúžok v menovkovom riadku, nie
// veľkosť psieho slotu. Preto sa nevracia problém z 11. 9., kvôli ktorému „+" z radu odišiel:
// slot šírky psa (~90 px) lámal pri 360 px rad na dva.
// ⚠️ Krúžok sa centruje v boxe výšky najväčšieho prvku radu (`boxH`), presne ako menšia
// psia fotka v `DogSlot` — inak by visel pri hornej hrane a rad by mal dve osi.
// ⚠️ Lapis, nie zlato — pridanie je MOJA AKCIA, nie nábytok (brand lock 28. 8.). Výplň
// ostáva papyrusová: tmavý tint nad pieskom zošedne.
function AddSlot({ boxH, onAdd }: { boxH: number; onAdd: () => void }) {
  const t = useT();
  return (
    <div className="flex items-center justify-center" style={{ height: boxH, width: PLUS_SIZE }}>
      <button
        type="button"
        onClick={onAdd}
        aria-label={t('pack.tree.addDog')}
        title={t('pack.tree.addDog')}
        className="flex items-center justify-center shrink-0"
        style={{
          width: PLUS_SIZE,
          height: PLUS_SIZE,
          borderRadius: '50%',
          border: `2px dashed ${LAPIS.edge}`,
          background: T.tileBg,
          color: LAPIS.edge,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <HandPlus size={13} />
      </button>
    </div>
  );
}

// ── MENOVKOVÝ RIADOK RÁMU — meno svorky + ceruzka, centrované ────────────────────
// (Matej 12. 9. 2026: „hore nad čiaru bude vždy Matejś pack (prve meno a pack) s ceruzkou
// na premenovanie")
//
// 🔒 „+" TU UŽ NIE JE — stojí V RADE za psami (`AddSlot`, Matejov pokyn z toho istého dňa:
// „to plusko daj vedla toho psa take male ako je teraz"). Riadok teda nesie len MENO a
// PREMENOVANIE; kto hľadá pridávanie člena, nech ide do `AddSlot` vyššie.
// Historický kontext, ktorý platí ďalej: „+" patrí VLASTNEJ svorke — Matej „frajerkina
// strana nemusí mať + lebo ja si neviem pridať psa k jej... ale iba sebe", zo zadania
// „ak ktokolvek prida psa prida sa najprv do svojej svorky 1. typu". Dôsledok pre VLNU B:
// „+" nedostane ani frajerkin rám, ani vonkajší spoločný.
//
// ⚠️ MENOVKA STOJÍ VŽDY — prázdne pole padá na „Svorka <krstné meno>" (`pack.pack.defaultName`).
// Tým padlo ranné rozhodnutie „prázdne pole = žiadna menovka": bez mena nie je čo premenovať
// a ceruzka by visela pri prázdnom mieste. Pôvodná obava (meno majiteľa zopakované nad jeho
// avatarom sa čítalo ako preklep) je vyriešená slovom SVORKA pred ním — je to názov domácnosti,
// nie druhýkrát to isté.
// ⚠️ DVE TLAČIDLÁ = DVE VECI. „+" v rade pridáva ČLENA (rázcestie pes / pawmate / pawtner),
// ceruzka pri menovke PREMENUJE. Dovtedy premenovanie viselo ako tretie dvere pod „+" a jedno
// tlačidlo tak odpovedalo na dve rôzne otázky.
function PackNameRow({ label, fallback }: { label: string; fallback: string }) {
  const t = useT();
  // Premenovanie sa deje NA MIESTE — riadok sa zmení na pole, žiadny ďalší popup.
  // Dovtedy to bývali dvere „SVORKA" v rázcestí pod „+"; Matej 12. 9. 2026 to rozdelil:
  // „hore nad čiaru bude vždy Matejś pack … s ceruzkou na premenovanie", takže „+" znamená
  // PRIDAŤ ČLENA a ceruzka PREMENOVAŤ. Jedno tlačidlo pre dve rôzne veci bol ten zmätok.
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const [saving, setSaving] = useState(false);

  // Jediný zdroj pravdy je `pack_profiles.human.packName` — to isté API, aké volá pole
  // v `/pack/profile`. `saveHuman` ohlási zmenu (`emitChange`), takže `useProfile()`
  // v `Pack.tsx` prekreslí menovku bez reloadu.
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await saveHuman({ packName: draft.trim() || undefined });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => { setDraft(label); setEditing(true); };

  return (
    <>
      {editing ? (
        <form onSubmit={save} className="flex items-center" style={{ gap: 8 }}>
          <style>{PF_FIELD_CSS}</style>
          {/* `.pf-field--flat` = plochá papyrusová výplň — ten istý primitív, na akom
              stojí pole mena svorky v `/pack/profile`. Zaostrenie svieti lapisom. */}
          <input
            className="pf-field pf-field--flat"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setEditing(false); } }}
            placeholder={fallback}
            aria-label={t('pack.profile.packName')}
            maxLength={40}
            style={{
              flex: 1, minWidth: 0, borderRadius: 8, padding: '8px 12px',
              color: T.ink, fontFamily: FONT_UI, fontSize: 13,
            }}
          />
          {/* Jediné plné lapisové CTA v riadku. Geometriu berie z locku `.btn-gold`
              (radius 8, NIE pilulka) — lapis mení výplň, nie tvar. */}
          <button
            type="submit"
            disabled={saving}
            style={{
              flexShrink: 0, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
              background: LAPIS.grad, border: `1px solid ${GOLD_BTN.edge}`,
              color: LAPIS.ink, boxShadow: LAPIS_BTN_SHADOW,
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 10,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {t('pack.add.packSave')}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-center" style={{ gap: 8 }}>
          {/* Meno svorky + ceruzka ako JEDNA centrovaná skupina. ⚠️ Menovka stojí VŽDY
              (Matej 12. 9.: „hore nad čiaru bude vždy Matejś pack"), takže prázdne pole
              padá na `fallback` = „Svorka <krstné meno>". Tým padlo ranné rozhodnutie
              „prázdne pole = žiadna menovka": vtedy rám bez mena nemal čo premenovať. */}
          <div className="flex items-center justify-center" style={{ minWidth: 0, gap: 6 }}>
            <span
              style={{
                minWidth: 0,
                fontFamily: FONT_TITLE,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: T.inkStrong,
                lineHeight: 1.25,
                /* Dlhé meno sa nezalomí na tri riadky — ukrojí sa. Rám má na mobile ~270 px
                   a menovka nie je nadpis stránky. */
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {label || fallback}
            </span>
            <button
              type="button"
              onClick={openEdit}
              aria-label={t('pack.pack.rename')}
              title={t('pack.pack.rename')}
              className="flex items-center justify-center shrink-0"
              style={{
                width: 22, height: 22, borderRadius: '50%',
                border: 0, background: 'none', color: T.inkWarm,
                cursor: 'pointer', padding: 0,
              }}
            >
              <HandPencil size={12} />
            </button>
          </div>

        </div>
      )}
      {/* Deliaca čiara = `T.rule` (zlatá, vyblednutá do strán) — NIE šedý hairline. */}
      <div aria-hidden style={{ height: 2, background: T.rule, margin: '8px auto 14px', maxWidth: 280 }} />
    </>
  );
}

// ── PRÁZDNA SVORKA — „pridať psa" je tu HLAVNÁ akcia, nie krúžok v riadku ─────────
// Bez psa je blok 1 len tvár majiteľa a jedna vec, ktorú má urobiť. Malý „+" z menovkového
// riadku sa vtedy VYPÍNA (viď `emptyPack` vyššie) — dva „+" v jednom ráme sú dve odpovede
// na tú istú otázku.
function EmptyPackCta({ onAdd }: { onAdd: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex flex-col items-center"
      /* `margin:'0 auto'` — tlačidlo je blokové dieťa rámu, takže bez toho by sedelo vľavo;
         `<Link>` pred ním bol inline a centroval sa sám. */
      style={{ gap: 10, paddingTop: 16, background: 'none', border: 0, cursor: 'pointer', margin: '0 auto' }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: `2px dashed ${LAPIS.edge}`,
          background: T.tileBg,
          color: LAPIS.edge,
        }}
      >
        <HandPlus size={28} />
      </div>
      {/* Menovka je „PRIDAŤ" (`pack.tree.addDog`), nie „Pridať psa" — Matejov pokyn
          z 12. 9.; kľúč je zdieľaný s menovkovým riadkom, aby sa dve miesta nerozišli. */}
      <div
        style={{
          fontFamily: FONT_TITLE,
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: LAPIS.edge,
        }}
      >
        {t('pack.tree.addDog')}
      </div>
    </button>
  );
}

// ── Popup — PREKRYJE CELÝ 1. BLOK, nie malý modál v strede obrazovky ──────────
// Matej 12.8.2026: *„sa info otvoria priamo v 1. bloku ako teraz ALE cez celý blok, nie ako
// malý popup v bloku — vyzerá to zle; celý blok sa zmení na popup."*
// Preto `position:absolute; inset:0` vnútri `<section>` karty (tá má `position:relative`
// + `overflow:hidden`, takže sa overlay sám oreže na radius 16) a papyrusový `T.panelGrad`.
// ⚠️ TOTO NIE JE prípad na `createPortal` — tam ide modál, ktorý má prekryť STRÁNKU
// (rozpad €11 vo `FounderInvite`, viď [[feedback_fixed_inside_transformed_parent]]). Tu je
// zámerom prekryť práve tento blok, takže `absolute` je správne a `fixed` by bolo chybou.
// ⚠️ Text má strop šírky (`maxWidth`) — blok je na celú šírku stránky a riadky cez 900 px
// sa nečítajú. Overlay je `overflow:auto`, aby sa dlhší text v nízkom bloku dal doskrolovať.
function HeroPopup({
  which, bones, level, levelIndex, onClose,
}: { which: PopKey; bones: number; level: string; levelIndex: number; onClose: () => void }) {
  const t = useT();

  const COPY: Record<PopKey, { eyebrow: string; title: string; body: string[]; stamp?: string }> = {
    pawtner: {
      eyebrow: t('pack.hero.popStatusEyebrow'),
      title: 'Pawtner',
      body: [t('pack.hero.popPawtner1'), t('pack.hero.popPawtner2')],
    },
    // Od 12.8.2026 je toto JEDINÉ miesto, kde sa oddanosť vysvetľuje — devotion bar
    // s vlastným popupom z karty odišiel. Preto tu pribudla aj pečiatka „začne rátať
    // s appkou": bez nej by rebríček vyzeral ako niečo, čo beží už dnes.
    level: {
      eyebrow: t('pack.hero.popLevelEyebrow'),
      title: t('pack.hero.popLevelTitle', { name: level, index: levelIndex }),
      body: [t('pack.hero.popLevel1'), t('pack.hero.popLevel2')],
      stamp: t('pack.hero.popLevelStamp'),
    },
    bones: {
      eyebrow: t('pack.hero.popBonesEyebrow'),
      title: `BONES · ${bones.toLocaleString('en-US')}`,
      body: [t('pack.hero.popBones1'), t('pack.hero.popBones2')],
    },
    devotion: {
      eyebrow: t('pack.hero.popDevotionEyebrow'),
      title: t('pack.hero.popDevotionTitle'),
      body: [t('pack.hero.popDevotion1'), t('pack.hero.popDevotion2')],
      stamp: t('pack.hero.popDevotionStamp'),
    },
  };
  const c = COPY[which];

  // BONES sa dnes dajú získať JEDINE privedením ďalšieho člena — popup to hovorí, ale bez
  // odkazu bola veta bez akcie. Tlačidlo zavrie popup a doskroluje na blok „ŠÍR TO ĎALEJ"
  // (`FounderInvite`), kde odkaz reálne žije — druhá kópia odkazu by bola druhý zdroj pravdy.
  // Keď blok na stránke nie je (dielňa `/pack/_herolab`), klik popup len zavrie.
  const goToInvite = () => {
    onClose();
    requestAnimationFrame(() => {
      document.getElementById(INVITE_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <div
      role="dialog"
      onClick={onClose}
      style={{
        // Prekrýva PRESNE tento blok. zIndex 20 = nad ornamentmi aj pilulkami editácie (zIndex 3).
        position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 24px', overflowY: 'auto',
        background: T.panelGrad,
      }}
    >
      {/* Krížik sedí v ROHU BLOKU (nie panela s textom) — je to zatvorenie celého prekrytia. */}
      <button
        type="button"
        onClick={onClose}
        aria-label={t('pack.hero.popClose')}
        style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 0, cursor: 'pointer', color: T.inkFaint, lineHeight: 1 }}
      >
        <X className="h-5 w-5" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          // Žiadny rám ani tieň — rám má už samotný blok. Panel je len text v strede bloku.
          // `textAlign:center` = blok je centrovaná kompozícia (welcome / pyramída / pilulky);
          // vľavo zarovnaný stĺpec textu v širokom poli vyzeral ako odseknutý kus obsahu.
          // Pečiatka aj CTA sú inline prvky → centrovanie zdedia, netreba im vlastný flex.
          position: 'relative', width: '100%', maxWidth: 520, color: T.ink, textAlign: 'center',
        }}
      >
        <span style={{ fontFamily: FONT_UI, fontWeight: 500, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.cardEdge }}>
          {c.eyebrow}
        </span>
        <h3 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 17, letterSpacing: '0.02em', textTransform: 'uppercase', color: T.inkStrong, margin: '8px 0 10px' }}>
          {c.title}
        </h3>
        {c.body.map((line, i) => (
          <p key={i} style={{ fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.65, color: T.inkWarm, margin: '0 0 10px' }}>
            {line}
          </p>
        ))}
        {c.stamp && (
          <span style={{
            display: 'inline-block', marginTop: 6, padding: '4px 12px', borderRadius: 999,
            border: '1px dashed rgba(179,130,45,0.6)', color: T.inkWarm,
            fontFamily: FONT_UI, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            {c.stamp}
          </span>
        )}

        {which === 'bones' && (
          <button
            type="button"
            onClick={goToInvite}
            style={{
              // LAPIS = hlavné CTA na BLEDOM podklade (brandový kánon 28. 8. 2026). Overlay
              // stojí na `T.panelGrad`, teda na papyruse — zlatý gradient tu 12. 9. 2026
              // zamietol Matej („cta pozvi priatela oranžová — zmeň"). GEOMETRIU si ďalej
              // berie z locku `.btn-gold` (radius 8, NIE pilulka); mení sa len výplň.
              display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8,
              padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
              background: LAPIS.grad,
              border: `1px solid ${GOLD_BTN.edge}`, color: LAPIS.ink,
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 11.5,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              boxShadow: LAPIS_BTN_SHADOW,
            }}
          >
            <HandLink size={16} />
            {t('pack.hero.popBonesCta')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── „+" → RÁZCESTIE: ČO PRIDÁVAM (12. 9. 2026) ───────────────────────────────
// Matej: „po kliknutí na + budú 3 možnosti — pes (tvorba heroglyfu), pawmate (volba
// prístupu, emailu a pozvánka), pawtner (další pawtner so psom = partner so psom ak sa
// pár dá dokopy)". Zadanie `plany/zadanie-plus-popup-2026-09-12.md`.
//
// TVAR JE PREVZATÝ Z `HeroPopup` VYŠŠIE, nie vymyslený nanovo — `absolute; inset:0`
// vnútri `<section>` karty (tá má `position:relative` + `overflow:hidden`, takže sa
// prekrytie samo oreže na radius bloku). `createPortal` sem NEPATRÍ: zámerom je prekryť
// TENTO blok, nie stránku (portál je pre modál cez stránku — precedens `FounderInvite`).
//
// ⚠️ BEZ KRÍŽIKA. `HeroPopup` ho má, ale je z 12. 8.; lock „nedávajme tie krížiky na
// bloky" je z 28. 8. a je novší. Von sa ide klikom mimo alebo Esc.
//
// 🔒 DVOJE DVERE SÚ ZAMKNUTÉ ZÁMERNE — Matej 12. 9. 2026: „pripravme to do tejto fázy
// pričom sa bude dať pridať len pes a ostatné dve budú zatial neprístupné (to pustíme až
// ked to vyladíme)". Je to jeho rozhodnutie s flagom pred sebou: inak platí, že mŕtve
// tlačidlo je to, čo BEH 2 odstraňuje. Dôvod, prečo sa nedajú pustiť dnes:
//   · PAWMATE — potrebuje zoznam práv (R4, čaká Matejovo slovo) + tabuľky
//     `dog_humans` / `dog_invites` (F1). Pozvanie ďalšieho ČLOVEKA k tomu istému psovi
//     dnes v kóde NEEXISTUJE (`co_owner`, `dog_members`, `invite_member` = 0 výskytov).
//   · PAWTNER — spojenie dvoch svoriek (F2), teda vlna B.
// Zamknuté dvere NEMAJÚ `onClick` ani `href` — sú `aria-disabled` a nesú pilulku ČOSKORO,
// aby bolo na prvý pohľad jasné, že sa nerozbijú, ale ešte nie sú.
//
// ⚠️ PREMENOVANIE SVORKY TU UŽ NIE JE. Bývalo štvrtými dverami („SVORKA"); presunulo sa
// na ceruzku pri menovke rámu, kde aj patrí — „+" je o PRIDANÍ ČLENA.
// Kľúče `pack.add.pack` / `packSub` NEMAZAŤ, `packSave` číta pole pri ceruzke.
//
// FARBA: nadpis = zlato/inkoust (konštrukcia), dlaždice ostávajú PAPYRUSOVÉ
// (`PACK_BOX.row`). Lapis nesie len ikonku — tri rovnaké plné plochy sú zoznam, nie tri
// hlavné CTA, a plná farba patrí najviac jednej veci na obrazovke.
const DOOR: CSSProperties = {
  ...PACK_BOX.row,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: '12px 16px',
  textAlign: 'left',
  cursor: 'pointer',
  textDecoration: 'none',
};

/** Zamknuté dvere — ten istý tvar, len bez akcie. Kurzor `default`, žiadny hover;
 *  krytie 0.62 je najviac, čo ešte drží text čitateľný a zároveň povie „toto nie je
 *  na klik". Ikonka stráca lapis (nie je to moja akcia) a ide do tichého inkoustu. */
const DOOR_LOCKED: CSSProperties = {
  ...DOOR,
  cursor: 'default',
  opacity: 0.62,
};

/** Tvár dverí — kruh s hand-drawn ikonkou + menovka a jednoriadkové vysvetlenie.
 *  Ikonky sú z brandového setu (`HandIcons`), lucide je povolený len na funkčné chrome. */
function DoorFace({ icon, label, sub, locked = false, soon }: { icon: ReactNode; label: string; sub: string; locked?: boolean; soon?: string }) {
  return (
    <>
      <span
        aria-hidden
        className="flex items-center justify-center shrink-0"
        style={{
          width: 34, height: 34, borderRadius: '50%',
          border: `1.5px solid ${locked ? T.border : LAPIS.edge}`,
          background: T.tileBg,
          color: locked ? T.inkWarm : LAPIS.edge,
        }}
      >
        {icon}
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span className="flex items-center" style={{ gap: 7, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkStrong,
          }}>
            {label}
          </span>
          {/* Pilulka ČOSKORO = ten istý primitív `.pk-pill` ako pilulky v karte, nie
              štvrtá varianta štítku. Neinteraktívna, preto smie stáť pri texte. */}
          {soon && (
            <span className="pk-pill" style={{
              fontFamily: FONT_UI, fontWeight: 500, fontSize: 8.5,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              padding: '4px 8px',
            }}>
              {soon}
            </span>
          )}
        </span>
        {/* Vysvetlenie = DÁTA/popis → Space Grotesk (typo lock: Cinzel = identita). */}
        <span style={{
          display: 'block', fontFamily: FONT_UI, fontSize: 11.5, lineHeight: 1.4,
          color: T.inkWarm, marginTop: 2,
        }}>
          {sub}
        </span>
      </span>
    </>
  );
}

function AddPopup({ onClose, onPawmate }: {
  onClose: () => void;
  /** `null` = dvere ostávajú zamknuté (vlajka vypnutá alebo človek nemá psa). */
  onPawmate: (() => void) | null;
}) {
  const t = useT();
  // ⚠️ RESET STORU SA NESMIE VYNECHAŤ — bez neho zdedí druhý pes dáta prvého.
  const resetFlow = useDogyptStore((s) => s.reset);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const soon = t('pack.add.soon');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('pack.add.title')}
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 24px', overflowY: 'auto',
        background: T.panelGrad,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: 360 }}
      >
        <h3 style={{
          fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 15, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: T.inkStrong, textAlign: 'center', margin: '0 0 14px',
        }}>
          {t('pack.add.title')}
        </h3>

        <div className="flex flex-col" style={{ gap: 10 }}>
          {/* DVERE PES — heroglyf flow. JEDINÉ ŽIVÉ. Reset storu je na `onClick`, nie na
              cieľovej obrazovke: tá o tom, odkiaľ sa prišlo, nič nevie. */}
          <Link to="/heroglyph/photo" onClick={resetFlow} style={DOOR}>
            <DoorFace icon={<HandPaw size={18} />} label={t('pack.add.dog')} sub={t('pack.add.dogSub')} />
          </Link>

          {/* DVERE PAWMATE — ďalší ČLOVEK vo svorke (prístup + pozvánka mailom).
              Od B6b vedú do sekcie PAWMATES v `/pack/profile` (Matej 13. 9. 2026:
              *„tieto nastavenia musia byť v profile"*), nie do modálu nad kartou.
              Edge funkcie `invite-pawmate` + `accept-pawmate` (B4) stoja za ňou ďalej.
              ZÁMOK DRŽÍ JEDINE `PAWMATE_LIVE` — odomkne ho beh B8 po teste na dvoch
              telefónoch (F7), nie zásah tu.
              ⚠️ Bez psa ostávajú zamknuté aj pri zapnutej vlajke: prístup sa dáva
              K PSOVI, takže by sekcia nemala ku komu pustiť. */}
          {onPawmate ? (
            <button type="button" style={DOOR} onClick={onPawmate}>
              <DoorFace icon={<HandKey size={18} />} label={t('pack.add.pawmate')} sub={t('pack.add.pawmateSub')} />
            </button>
          ) : (
            <div style={DOOR_LOCKED} aria-disabled="true">
              <DoorFace
                icon={<HandKey size={18} />}
                label={t('pack.add.pawmate')}
                sub={t('pack.add.pawmateSub')}
                locked
                soon={soon}
              />
            </div>
          )}

          {/* DVERE PAWTNER — partner s VLASTNÝM psom, dve svorky sa spoja. Zamknuté: F2,
              teda vlna B. `HandHouseHeart` = dve domácnosti dokopy, nie tretia labka.
              ⚠️ Nákres launchu 21. 9. ich dal do „zmizne" a na pár hodín zmizli; Matej
              v ten istý večer: *„mal by tam byť aj 3 možnosť nie? pridať druhú svorku /
              spojiť sa s druhou svorkou… obidve aj pawmate aj pawtner možnosť budú coming
              soon"*. Novší pokyn platí — Pawmate aj Pawtner stoja ako ČOSKORO. */}
          <div style={DOOR_LOCKED} aria-disabled="true">
            <DoorFace
              icon={<HandHouseHeart size={18} />}
              label={t('pack.add.pawtner')}
              sub={t('pack.add.pawtnerSub')}
              locked
              soon={soon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
