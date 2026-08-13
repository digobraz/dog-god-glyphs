import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
// Brandové hand-drawn ikonky namiesto lucide (audit 12.8., nasadené 13.8.). `X` ostáva
// lucide zámerne — systémový ovládač zavretia, brand glyf by tam pridal len šum.
import { HandLink, HandPaw, HandPencil, HandPlus } from './HandIcons';
import { INVITE_ANCHOR_ID } from './FounderInvite';
import { BrandIcon } from './BrandIcon';
import { PACK_THEME, FONT_TITLE, FONT_UI, PILL_CSS } from './packTheme';
import { PackNotifications } from './PackNotifications';
import { DEV_FULL } from '@/lib/packFlags';
import { devotionLevel } from '@/lib/devotion';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

const AVATAR_SIZE = 132;
/** Pes je vedľa majiteľa ZÁMERNE menší — homepage hovorí „toto si ty a toto je tvoja
 *  svorka", nie naopak. Detail psa má vlastný povrch (`/pack/dogs`). */
const DOG_SIZE = 100;
// Ring = náš brandový gradient `--brand-gradient` (egyptská modrá → čierna → zlatá;
// do 2026-06-15 bol fialový, odtiaľ staré „fialovo-zlatý" v komentároch)
const STORY_RING = 'var(--brand-gradient)';

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

/** `inner` = čistá šírka obsahu karty (bez paddingu). */
function planRow(n: number, inner: number): RowPlan {
  const mobile = inner < MOBILE_INNER;
  const s = mobile ? MOBILE_SCALE : 1;
  const owner = Math.round(AVATAR_SIZE * s);
  const big = Math.round(DOG_SIZE * s);
  const gap = mobile ? 14 : 22;
  const fits = (count: number, size: number) => owner + count * (size + gap) <= inner;

  // Malá svorka → majiteľ + psy + „+" v jednom rade, spodný rad nevznikne
  if (n <= MAX_TOP_DOGS && fits(n + 1, big)) {
    return { owner, big, gap, topDogs: n, plusInTop: true, rows: [], rowSize: big };
  }

  let topDogs = Math.min(MAX_TOP_DOGS, n);
  // Spodný rad nesmie byť UŽŠÍ než horný — pyramída sa rozširuje NADOL (Matej 2026-08-09:
  // „ked su 3 psy tak jeden hore dvaja dolu"). Rieši to zároveň starší prípad, keď by v
  // spodnom rade zostalo osamotené „+" („aby v 2 riadku bol pes a plus nie len + samotné").
  // Horný rad má `topDogs + 1` slotov (majiteľ sa počíta), spodný `n - topDogs + 1` („+").
  while (topDogs > 0 && n - topDogs + 1 < topDogs + 1) topDogs -= 1;
  const items = n - topDogs + 1;                  // zvyšok psov + miesto pre „+"

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
}

type PopKey = 'pawtner' | 'level' | 'bones' | 'devotion';

export function HeroCard({ name, email, avatarUrl, genderPlaceholder = null, devotion = 100, bones = 0, stats = null, dogs = null }: HeroCardProps) {
  const t = useT();
  const [pop, setPop] = useState<PopKey | null>(null);

  const displayName = name;
  const initial = displayName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'D';
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
  const topTier = lv.key === 'pharaoh' || lv.key === 'demigod';

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
  const plan = planRow(pack.length, innerW);
  let cursor = plan.topDogs;
  const bottomRows = plan.rows.map((count) => {
    const slice = pack.slice(cursor, cursor + count);
    cursor += slice.length;
    return slice;
  });

  return (
    <section
      className="pack-card-hover h-full"
      style={{
        background: T.cardGrad,
        borderRadius: 16,
        padding: '22px 20px 20px',
        border: `1.5px solid ${T.cardEdge}`,
        boxShadow: T.cardShadow,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
          2026-08-06: „CTA uprav profil pri človeku je zbytočne veľké"). Keď je v rohu
          bell od notifikácií, posunú sa vedľa neho, nie pod.
          ⚠️ EDIT DOGS má DVA ciele zámerne: hub `/pack/dogs` je v `App.tsx` za `DEV_FULL`
          a bez flagu redirectuje späť na `/pack` — bežný člen by klikal do slepej ulice.
          Bez flagu preto mieri na DOG ID prvého psa (`/pack/dogs/:id`), ktoré je živé pre
          všetkých. Žiadny pes = pilulka sa nevykreslí, nie je čo upravovať. */}
      {/* Mobil = vedľa seba (sú to len ikonky, stĺpec by kradol výšku). Desktop = pod
          sebou (Matej 2026-08-08) — `sm:` je ten istý breakpoint, na ktorom pilulkám
          pribudnú texty. `items-stretch` v stĺpci ich zrovná na šírku tej širšej;
          bez neho by mali každá inú a pravý okraj by sa rozstrapkal. */}
      <div
        className="absolute inline-flex items-center gap-2 sm:flex-col sm:items-stretch"
        style={{ top: 14, right: stats && !DEV_FULL ? 60 : 14, zIndex: 3 }}
      >
        {/* ⚠️ Popisok na mobile NEVRÁTIŤ (overené meraním 2026-08-12): s textom má rad
            275 px a prejde priamo cez centrovaný eyebrow „VITAJ SPÄŤ" — na 360, 390 aj 430.
            Matej: „ak je tam miesto ok ale by sa ničoho nedotýkali ani nezavadzali" → miesto
            nie je. Namiesto toho aspoň `aria-label` + `title`, aby ikonka nebola nemá pre
            čítačku a dala sa podržať pre popis. Skutočná oprava = presunúť pilulky inam. */}
        <Link
          to="/pack/profile"
          className="pk-pill pk-pill--tap hc-edit"
          aria-label={t('pack.hero.editProfile')}
          title={t('pack.hero.editProfile')}
        >
          <HandPencil size={12} className="shrink-0" />
          <span className="hidden sm:inline">{t('pack.hero.editProfile')}</span>
        </Link>
        {dogsHref && (
          <Link
            to={dogsHref}
            className="pk-pill pk-pill--tap hc-edit"
            aria-label={t('pack.hero.editDogs')}
            title={t('pack.hero.editDogs')}
          >
            <HandPaw size={12} className="shrink-0" />
            <span className="hidden sm:inline">{t('pack.hero.editDogs')}</span>
          </Link>
        )}
      </div>

      <div className="flex flex-col items-center text-center flex-1 justify-center relative">
        <div
          style={{
            fontFamily: FONT_TITLE,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: '0.12em',
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
        <div ref={rowRef} className="w-full">
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
                {dogs && plan.plusInTop && <AddDogSlot size={plan.big} boxH={plan.owner} gap={plan.gap} />}
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
                    {/* „+" je vždy posledný slot posledného radu — je zarátaný do delenia */}
                    {r === bottomRows.length - 1 && (
                      <AddDogSlot size={plan.rowSize} boxH={plan.rowSize} gap={plan.gap} />
                    )}
                  </div>
                ))}
            </>
          )}
        </div>

        {/* Badge riadok — STATUS (Pawtner) + LEVEL + BONES. Každý = tlačidlo s popupom.
            grid-cols-3 = tri totožné stĺpce; každý badge w-full + centrovaný = rovnaká veľkosť.
            maxWidth: blok je po zlúčení na celú šírku stránky — bez stropu by sa tri pilulky
            roztiahli na 900+ px a rad by prestal pôsobiť ako skupina. */}
        <div className="mt-7 grid grid-cols-3 gap-2 w-full" style={{ maxWidth: 620 }}>
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
            <span style={{ fontFamily: FONT_TITLE, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Pawtner
            </span>
          </button>

          {/* LEVEL — počítaný z DEVOTION (nie natvrdo). Top tier (Pharaoh/Demigod) = zlatá
              varianta pilulky (`.pk-pill--gold`) + trofej; nižšie úrovne = neutrálna pilulka. */}
          <button
            type="button"
            onClick={() => setPop('level')}
            className={`pk-pill pk-pill--tap w-full${topTier ? ' pk-pill--gold' : ''}`}
          >
            {topTier && <BrandIcon name="trophy" size={12} tint="gold" className="shrink-0" />}
            <span style={{ fontFamily: FONT_TITLE, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              {t('pack.ladder.' + lv.key)}
            </span>
          </button>

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
                style={{ color: T.inkFaint, fontFamily: FONT_TITLE, fontSize: Math.max(7, Math.round(size * 0.09)), letterSpacing: '0.18em' }}
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

// Prázdny slot „+" = pridať ďalšieho psa. Nahradil zlaté ADD DOG tlačidlo z PackTree.
// issue #34: kto už má heroglyf, NEmá prechádzať `/entry` (to je conviction gate pre
// ľudí zvonku) — ide rovno do tvorby. `reset()` je súčasť fixu, nie navyše: store
// nepersistuje buyer dáta, ale v tej istej SPA session v ňom visí prvý pes → druhý by
// mal predvyplnené meno a dátum.
function AddDogSlot({ size, boxH, gap }: { size: number; boxH: number; gap: number }) {
  const t = useT();
  const resetFlow = useDogyptStore((s) => s.reset);
  return (
    <Link
      to="/heroglyph/intro"
      onClick={resetFlow}
      className="flex flex-col items-center group"
      style={{ width: size, textDecoration: 'none' }}
    >
      <div className="flex items-center justify-center" style={{ height: boxH }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: `2px dashed ${T.border}`,
            background: T.tileBg,
            color: T.accentGold,
            transition: 'border-color .18s ease, background .18s ease',
          }}
        >
          <HandPlus size={Math.round(size * 0.32)} />
        </div>
      </div>
      <div
        style={{
          width: size + Math.max(0, Math.min(18, gap - 6)),
          fontFamily: FONT_TITLE,
          fontSize: Math.max(8, Math.round(size * 0.1)),
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.inkDim,
          lineHeight: 1.2,
          textAlign: 'center',
          marginTop: 12,
        }}
      >
        {t('pack.tree.addDog')}
      </div>
    </Link>
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
        padding: '26px 24px', overflowY: 'auto',
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
        <h3 style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 17, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.inkStrong, margin: '8px 0 10px' }}>
          {c.title}
        </h3>
        {c.body.map((line, i) => (
          <p key={i} style={{ fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.65, color: T.inkWarm, margin: '0 0 10px' }}>
            {line}
          </p>
        ))}
        {c.stamp && (
          <span style={{
            display: 'inline-block', marginTop: 6, padding: '5px 12px', borderRadius: 999,
            border: '1px dashed rgba(179,130,45,0.6)', color: T.inkWarm,
            fontFamily: FONT_UI, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {c.stamp}
          </span>
        )}

        {which === 'bones' && (
          <button
            type="button"
            onClick={goToInvite}
            style={{
              // .btn-gold (brand manuál v3.2 — LOCKED): gradient 135°, radius 8, papyrusový okraj.
              display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8,
              padding: '11px 18px', borderRadius: 8, cursor: 'pointer',
              background: 'linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%)',
              border: '1px solid rgba(250,244,236,0.30)', color: '#000',
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 11.5,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              boxShadow: '0 0 24px rgba(230,158,26,0.28), inset 0 1px 0 rgba(255,255,255,0.3)',
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
