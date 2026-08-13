// Psia galéria — accordion (zbalené foto·meno·heroglyf → rozbalené BIO+tagy). Zdieľané medzi
// editorom (PackProfile.tsx §2, editable) a read-profilom (PublicProfile.tsx §3, read-only) —
// zadanie-profil-read-dog-2026-07-25. Chevron = lucide (rovnaký precedent ako existujúci
// open/close chevron v PackDogDetail.tsx — hand-drawn sada nemá chevron/arrow-down variant).
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import heroglyphFrame from '@/assets/heroglyph-frame.svg';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME } from '@/components/pack/packTheme';
import {
  DOG_TEMPERAMENT_TAGS,
  DOG_COMPAT_ROWS, DOG_SIZE_OPTIONS, DOG_ORIGIN_OPTIONS,
  DOG_FITNESS_OPTIONS, DOG_RANGE_OPTIONS, DOG_SKILL_OPTIONS, DOG_COMPAT_OPTIONS,
  DOG_ALONE_OPTIONS, DOG_FEEDING_OPTIONS, TRAFFIC_COLORS,
  DOG_DISLIKED_TYPE_SUGGESTIONS, DOG_TRIGGER_SUGGESTIONS, DOG_FEAR_SUGGESTIONS,
  DOG_JOY_SUGGESTIONS, DOG_QUIRK_SUGGESTIONS,
  dogCardCompletion, emptyDogCard,
  type DogCard, type DogProfileAttrs,
} from './packProfile';
import {
  SubSection, FieldGrid, SelectRow, DateRow, NeuterPills,
  ChipMulti, OpenQuestion,
} from './DogCardFields';

const T = PACK_THEME;
export const BIO_MAX = 200;
export const MAX_DOG_TEMPERAMENT = 5;

export interface DogGalleryEntry {
  id: string;
  name: string;
  photoUrl: string | null;
  packNumber: number | null;
  attrs: DogProfileAttrs;
  // Z `selections`. Zobrazovací blok „From the heroglyph" bol zrušený (Matej 2026-07-25),
  // ale `gender` sa ďalej používa — určuje farbu pills kastrácie (modrá pes / ružová fena).
  heroglyph?: { gender?: string | null; colour?: string | null; bloodline?: string | null };
  /** Pre-rendered heroglyf psa (`dogs.heroglyph_png_url`). Bez neho sa vykreslí
   *  prázdny rám — nikdy nie textová/unicode aproximácia. */
  heroglyphUrl?: string | null;
}

export function DogGalleryAccordion({
  dogs,
  editable,
  onSaveBio,
  onToggleTag,
  onSaveCard,
  addSlot,
  openId: controlledOpenId,
  onOpenChange,
  layout = 'rows',
}: {
  dogs: DogGalleryEntry[];
  editable: boolean;
  onSaveBio?: (dogId: string, bio: string) => void;
  onToggleTag?: (dogId: string, group: 'temperament' | 'trail', tag: string) => void;
  onSaveCard?: (dogId: string, patch: Partial<DogCard>) => void;
  addSlot?: React.ReactNode;
  openId?: string | null;             // voliteľné — ovládané zvonka (napr. deep-link na jedného psa)
  onOpenChange?: (id: string | null) => void;
  /**
   * 'rows'  = lišta foto·meno·#, obsah sa rozbalí VNÚTRI lišty (default, drží
   *           PublicProfile.tsx nedotknutý).
   * 'tiles' = mriežka štvorcových foto dlaždíc, obsah sa rozbalí POD mriežkou
   *           na plnú šírku (Matej 2026-07-26 dopoludnia, nahradené `open`).
   * 'open'  = žiadne rozbaľovanie: každý pes je otvorená karta, vľavo kruhová
   *           fotka + heroglyf, vpravo obsah. Používa /pack/profile — Matej
   *           2026-07-26: „aby karta kde sa píše bola otvorená = na ľavo foto
   *           na pravo obsah".
   */
  layout?: 'rows' | 'tiles' | 'open';
}) {
  const [localOpenId, setLocalOpenId] = useState<string | null>(null);
  const openId = controlledOpenId !== undefined ? controlledOpenId : localOpenId;
  const setOpenId = onOpenChange ?? setLocalOpenId;

  if (dogs.length === 0 && !addSlot) return null;

  // Riadok sa škáluje podľa počtu psov — 1-2 psy = veľký blok (vypĺňa stĺpec
  // po odstránení Stats & Badges), 3+ = kompaktný, aby zoznam nerástol donekonečna
  // (Matej 2026-07-25).
  const scale: RowScale = dogs.length >= 3 ? 'compact' : 'large';

  // Karta so zbaleným dropdownom — hlavička (foto + heroglyf) je vidno vždy,
  // zvyšok (bio, POVAHA, dropdowny) sa rozbalí až po kliku (Matej 2026-07-26:
  // „celý obsah schováme za dropdown = na karte bude foto a vedľa heroglyf,
  // po kliknutí sa obsah zobrazí uprataný"). `openId` sa tu používa rovnako
  // ako pri 'rows'/'tiles' — max jeden pes rozbalený naraz.
  if (layout === 'open') {
    return (
      <div className="flex flex-col" style={{ gap: 14 }}>
        {dogs.map((d) => (
          <DogOpenCard
            key={d.id}
            dog={d}
            open={openId === d.id}
            onToggleOpen={() => setOpenId(openId === d.id ? null : d.id)}
            editable={editable}
            onSaveBio={onSaveBio}
            onToggleTag={onToggleTag}
            onSaveCard={onSaveCard}
          />
        ))}
        {addSlot}
      </div>
    );
  }

  if (layout === 'tiles') {
    const openDog = dogs.find((d) => d.id === openId) ?? null;
    // Počet stĺpcov = počet dlaždíc (vrátane „Add a god"), max 4. Fixné 4 stĺpce
    // nechávali pri dvoch psoch prázdny stĺpec vpravo — presne ten prázdny priestor,
    // ktorý Matej na profile kritizoval. `auto-fill` zámerne NIE: pri jednom psovi
    // by sa fotka vytiahla na celú šírku karty.
    const tileCount = dogs.length + (addSlot ? 1 : 0);
    const cols = Math.min(Math.max(tileCount, 1), 4);
    return (
      <div>
        <style>{`
          .dg-tiles{display:grid;gap:12px;grid-template-columns:repeat(${cols},minmax(0,1fr));}
          @media (max-width:640px){.dg-tiles{grid-template-columns:repeat(${Math.min(cols, 2)},minmax(0,1fr));}}
        `}</style>
        <div className="dg-tiles">
          {dogs.map((d) => (
            <DogTile
              key={d.id}
              dog={d}
              open={openId === d.id}
              onToggleOpen={() => setOpenId(openId === d.id ? null : d.id)}
            />
          ))}
          {addSlot}
        </div>
        {openDog && (
          <div
            style={{
              marginTop: 14,
              padding: '16px 16px 18px',
              background: T.cardSoft,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
            }}
          >
            {/* Meno v hlavičke rozbaleného bloku — pri 4 dlaždiciach nie je inak
                jasné, ktorého psa práve editujem. */}
            <div className="flex items-center justify-between" style={{ gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: T.inkStrong,
                }}
              >
                {openDog.name}
              </span>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: '4px 10px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: T.inkDim,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
            <DogGalleryBody
              dog={openDog}
              editable={editable}
              onSaveBio={onSaveBio}
              onToggleTag={onToggleTag}
              onSaveCard={onSaveCard}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {dogs.map((d) => (
        <DogGalleryRow
          key={d.id}
          dog={d}
          scale={scale}
          open={openId === d.id}
          onToggleOpen={() => setOpenId(openId === d.id ? null : d.id)}
          editable={editable}
          onSaveBio={onSaveBio}
          onToggleTag={onToggleTag}
          onSaveCard={onSaveCard}
        />
      ))}
      {addSlot}
    </div>
  );
}

type RowScale = 'large' | 'compact';

const ROW_SCALE: Record<RowScale, { avatar: number; initial: number; name: number; num: number; pad: string }> = {
  large: { avatar: 64, initial: 22, name: 16, num: 12, pad: '14px 14px' },
  compact: { avatar: 44, initial: 16, name: 14, num: 11, pad: '10px 12px' },
};

function DogGalleryRow({
  dog, scale = 'large', open, onToggleOpen, editable, onSaveBio, onToggleTag, onSaveCard,
}: {
  dog: DogGalleryEntry;
  scale?: RowScale;
  open: boolean;
  onToggleOpen: () => void;
  editable: boolean;
  onSaveBio?: (dogId: string, bio: string) => void;
  onToggleTag?: (dogId: string, group: 'temperament' | 'trail', tag: string) => void;
  onSaveCard?: (dogId: string, patch: Partial<DogCard>) => void;
}) {
  const S = ROW_SCALE[scale];

  return (
    <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 14, background: open ? T.cardSoft : 'transparent' }}>
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        className="flex items-center w-full"
        style={{ gap: scale === 'large' ? 16 : 12, padding: S.pad, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span
          className="inline-flex items-center justify-center overflow-hidden shrink-0"
          style={{ width: S.avatar, height: S.avatar, borderRadius: '50%', background: T.bg, border: `2px solid ${T.accentGold}` }}
        >
          {dog.photoUrl ? (
            <img src={dog.photoUrl} alt={dog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: S.initial, fontWeight: 700, color: T.inkDim }}>
              {(dog.name?.[0] || '?').toUpperCase()}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          {/* Meno psa = Cinzel Decorative (Matej 2026-07-26: „mena psov su cinzel
              dekorative"). Bolo Space Grotesk 600 — odchýlka od konvencie, ktorú
              drží ShareCard/CertificateCard/PackTree/GodsGrid/PackDogDetail. */}
          <span className="block truncate" style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: S.name, fontWeight: 700, color: T.ink }}>
            {dog.name}
          </span>
          {dog.packNumber != null && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: S.num, color: T.inkFaint }}>
              #{dog.packNumber}
            </span>
          )}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0"
          style={{ color: T.inkDim, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {open && (
        <div style={{ padding: '0 14px 16px' }}>
          <DogGalleryBody
            dog={dog}
            editable={editable}
            onSaveBio={onSaveBio}
            onToggleTag={onToggleTag}
            onSaveCard={onSaveCard}
          />
        </div>
      )}
    </div>
  );
}

// ── KARTA PSA S DROPDOWNOM (layout='open') ───────────────────────────────────
// Matej 2026-07-26 (2. kolo): „celý obsah schováme za dropdown = na karte
// bude foto a vedľa heroglyf, po kliknutí sa obsah zobrazí uprataný". Hlavička
// (kruhová fotka + heroglyf vedľa seba) je JEDINÉ, čo je vidno zbalené — bio,
// POVAHA aj 3 dropdown sekcie idú do `DogGalleryBody` pod ňou, len keď `open`.
// Kruh drží predchádzajúce rozhodnutie (rovnaký tvar ako avatar majiteľa v
// bloku 1 — jeden jazyk pre „toto je bytosť").
// Matej 2026-07-26 (3. kolo): „zvačši foto o 20% vedľa fotky pojde MENO a
// vedla hero tak aby bol obsah na takmer celú stránku, na mobile bude len
// foto a hero" → poradie foto→meno→hero, foto 72→86px. Meno na mobile ZMIZNE
// (`hidden sm:block`).
// Matej 2026-07-26 (4. kolo, po živom screenshote — „to prečo je heroglyph
// na konci a číslo nie je v pills"): `flex-1` na MENE bola chyba — krátke
// meno ako „Hekthor" natiahlo prázdnotu MEDZI seba a heroglyf, takže
// heroglyph vyzeral odtrhnutý, nalepený na chevron. Foto+meno+heroglyf teraz
// sedia TESNE vedľa seba (prirodzený `gap`), `flex-1` spacer sa presunul AŽ
// ZA heroglyf (pred chevron) — ten naťahuje hlavičku na celú šírku bez toho,
// aby roztrhol meno od heroglyfu. Meno zväčšené 15→19px, nech vedľa 86px
// fotky vizuálne váži. `#packNumber` dostal zlatý pill (rovnaký jazyk ako
// počítadlo psov vedľa nadpisu „OH, MY DOG!"), nie holý mono text.
function DogOpenCard({
  dog, open, onToggleOpen, editable, onSaveBio, onToggleTag, onSaveCard,
}: {
  dog: DogGalleryEntry;
  open: boolean;
  onToggleOpen: () => void;
  editable: boolean;
  onSaveBio?: (dogId: string, bio: string) => void;
  onToggleTag?: (dogId: string, group: 'temperament' | 'trail', tag: string) => void;
  onSaveCard?: (dogId: string, patch: Partial<DogCard>) => void;
}) {
  return (
    <section
      style={{
        background: T.cardSoft,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
      }}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        /* `lg:gap-8` (32px) — Matej 2026-07-29: „NA PC zväčši priestor medzi
           fotkou a menom a menom a heroglyfom". Predtým `lg:gap-4` (16px),
           čo pri 86px fotke a 36px mene lepilo tri prvky na seba. Mobilný
           `gap-3` sa NEMENÍ — tam je heroglyf na vlastnom riadku a väčšia
           medzera by len ukrojila zo šírky. */
        className="flex items-center w-full gap-3 p-3 lg:gap-8 lg:p-4"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        {/* Foto — kruh, rovnaký jazyk ako avatar majiteľa v bloku 1. Na mobile
            56px, od `lg` 86px (= 72 + 20 % z 3. kola). Zmenšenie na mobile je
            ZÁMER, nie kompromis: uvoľnená šírka ide celá heroglyfu, ktorý má
            byť v riadku dominantný (Matej 11. kolo: „na mobile len foto a
            heroglyph"). Rozmery cez triedy, NIE inline — inline `width`
            prebíja Tailwind. */}
        <span
          className="inline-flex items-center justify-center overflow-hidden shrink-0 w-[65px] h-[65px] lg:w-[86px] lg:h-[86px]"
          style={{
            borderRadius: '50%',
            border: dog.photoUrl ? `2px solid ${T.cardEdge}` : `2px dashed ${T.border}`,
            boxShadow: dog.photoUrl ? '0 0 0 4px rgba(201,154,63,0.14)' : 'none',
            background: `linear-gradient(160deg, ${T.bgTop} 0%, ${T.bgBottom} 100%)`,
          }}
        >
          {dog.photoUrl ? (
            <img src={dog.photoUrl} alt={dog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span className="text-xl lg:text-3xl" style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: 'rgba(31,26,14,0.26)', lineHeight: 1 }}>
              {(dog.name?.[0] || '?').toUpperCase()}
            </span>
          )}
        </span>

        {/* Meno — TESNE vedľa fotky (žiadny `flex-1` — pozri komentár vyššie).
            Matej 2026-07-26 (6. kolo): „meno psa ešte zvačši, a pils daj až za
            heroglyf" → 36px, pill sa odsťahoval ZA heroglyf (nižšie).

            ⚠️ Pôvodné `hidden sm:block` (z 3. kola, Matej: „na mobile bude len
            foto a hero") ZRUŠENÉ v 10. kole — Matej: „??????" nad screenshotom
            z ~520px okna. To pravidlo platilo, kým bolo VŠETKO v jednom riadku
            a meno tam nemalo miesto. Odkedy heroglyf odišiel na vlastný riadok,
            je riadok 1 poloprázdny: fotka vľavo, ~250px prázdna plocha,
            chevron vpravo — karta vyzerala rozhádzaná. Meno tú prázdnotu
            vypĺňa, takže musí byť viditeľné na VŠETKÝCH šírkach.

            `clamp()` namiesto breakpointu — plynulá veľkosť bez skoku:
            390px→22px · 520px→26px · 720px+→36px. */}
        <span className="hidden lg:block min-w-0 shrink">
          <span
            className="block truncate"
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              fontWeight: 700,
              fontSize: 'clamp(22px, 5vw, 36px)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              color: T.inkStrong,
            }}
          >
            {dog.name}
          </span>
        </span>

        {/* Heroglyf — Pre-rendered PNG z DB; bez neho prázdny rám, nikdy
            textová/unicode aproximácia. Zdrojový asset je zlatý,
            `brightness(0)` ho vytmaví na čiernu siluetu a zachová alfa okraje
            (Matej: „musí byť vždy čierny ak je na papyruse").

            DESKTOP: tesne za menom (Matej: „vedla hero"), výškou riadený
            (`sm:h-16`), NIE odtrhnutý na druhom konci hlavičky.

            MOBILE (<640px): VLASTNÝ RIADOK na celú šírku karty (`basis-full
            w-full h-auto order-last` + `flex-wrap` na tlačidle). Matej 3× po
            sebe: „heroglyph zväčši na mobile" → „aký je heroglyph na mobile
            malý…prisposob aby to vyzeralo pekne" → „stale je maly! halo?".
            Dôvod, prečo px-šúľanie (36→40px) nestačilo: kým heroglyf sedel v
            JEDNOM riadku s fotkou, jeho šírka = karta(304) − foto(86) −
            gapy − chevron ≈ 160px, a pri pomere strán 3.9:1 to je STROP 40px
            výšky — matematika layoutu, nie zle zvolené číslo. Vlastný riadok
            mu dá plných ~284px šírky → 72px výška (+80 %).

            ⚠️ `max-h-[65px]` JE POVINNÝ, nie kozmetika (Matej: „tebe jebe? čo
            stváraš? toto je ok podla teba?" — screenshot z ~520px okna).
            Bez stropu rastie výška LINEÁRNE so šírkou okna až po breakpoint:
            390px→72 · 520px→105 · 639px→**135px** (vyšší než 86px fotka!) a
            pri 641px spadne na 64px. Testoval som len 390px a 1400px, celý
            pás medzi nimi nie — preto sa to prejavilo až u Mateja. Strop drží
            72px na celom páse a zmenšuje skok na breakpointe (72→64).
            `objectPosition:left` — nad 390px `max-height` letterboxuje obsah
            vnútri plnej šírky, bez toho by sa glyf centroval, kým fotka nad
            ním začína pri ľavom okraji. */}
        {dog.heroglyphUrl ? (
          <img
            src={dog.heroglyphUrl}
            alt={`${dog.name} heroglyph`}
            className="flex-1 min-w-0 h-auto max-h-[65px] lg:flex-none lg:w-auto lg:h-16 lg:max-h-none"
            style={{ objectFit: 'contain', objectPosition: 'left center', display: 'block', filter: 'brightness(0)' }}
          />
        ) : (
          <img
            src={heroglyphFrame}
            alt=""
            aria-hidden
            /* Rovnaký 72px strop ako reálny heroglyf — placeholder má iný
               pomer strán (~2.6:1), takže bez stropu by na plnej šírke
               vyrástol ešte vyššie (~109px pri 390px). */
            className="flex-1 min-w-0 h-auto max-h-[65px] lg:flex-none lg:w-auto lg:h-14 lg:max-h-none"
            style={{ objectFit: 'contain', objectPosition: 'left center', filter: 'brightness(0) opacity(0.3)' }}
          />
        )}

        {/* Pill s #packNumber — Matej 2026-07-26 (6. kolo): „pils daj až za
            heroglyf" (predtým bol vedľa mena). 12. kolo: „pridaj vedla neho
            z pravej strany pils s číslom" → viditeľný aj na mobile (predtým
            `hidden sm:`). V DOM stojí hneď za heroglyfom, takže „vpravo od
            neho" platí bez zmeny poradia. Na mobile kompaktný (10px font,
            tesnejší padding) — každý px šírky, ktorý si vezme, uberá
            heroglyfu, ktorý má `flex-1`. */}
        {dog.packNumber != null && (
          <span
            className="inline-flex items-center shrink-0 text-[10px] lg:text-xs px-2 py-0.5 lg:px-2.5"
            style={{
              borderRadius: 999,
              background: T.tileBg,
              border: `1px solid ${T.border}`,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: T.cardEdge,
            }}
          >
            #{dog.packNumber}
          </span>
        )}

        {/* Spacer — naťahuje hlavičku na takmer celú šírku karty BEZ toho, aby
            roztrhol meno od heroglyfu (tie sedia tesne vedľa seba vyššie).
            Na mobile chýba meno, tak tlačí chevron k pravému okraju rovnako. */}
        <span className="hidden lg:block lg:flex-1" />

        <ChevronDown
          className="h-4 w-4 sm:h-5 sm:w-5 shrink-0"
          style={{ color: T.inkDim, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {open && (
        <div style={{ padding: '0 16px 18px' }}>
          <DogGalleryBody
            dog={dog}
            editable={editable}
            onSaveBio={onSaveBio}
            onToggleTag={onToggleTag}
            onSaveCard={onSaveCard}
          />
        </div>
      )}
    </section>
  );
}

// ── FOTO DLAŽDICA (layout='tiles') ───────────────────────────────────────────
// Matej 2026-07-26: „použi moje fotky z profilu hekthor nech vidíme preview" +
// „aktuálne je to pochmúrne bez emócie". Lišta s 64px krúžkom nechávala vpravo
// prázdnu plochu a pes vyzeral ako riadok formulára; dlaždica dáva fotke plochu
// a meno nesie zlatý cartouche pás (brand v3.2: radius 8, #C99A3F).
function DogTile({
  dog, open, onToggleOpen,
}: {
  dog: DogGalleryEntry;
  open: boolean;
  onToggleOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggleOpen}
      aria-expanded={open}
      className="relative block w-full overflow-hidden"
      style={{
        aspectRatio: '1 / 1',
        padding: 0,
        borderRadius: 12,
        border: `1.5px solid ${open ? T.accentGold : T.border}`,
        background: T.bg,
        cursor: 'pointer',
        boxShadow: open
          ? `0 0 0 3px rgba(201,154,63,0.22), 0 10px 26px rgba(0,0,0,0.28)`
          : '0 4px 14px rgba(0,0,0,0.18)',
        transition: 'box-shadow 180ms ease, border-color 180ms ease, transform 140ms ease',
      }}
    >
      {dog.photoUrl ? (
        <img
          src={dog.photoUrl}
          alt={dog.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        // Bez fotky = výzva, nie tichý placeholder. Iniciála ostáva, ale dostane
        // papyrusové pozadie a hint „add a photo", aby prázdna dlaždica niečo žiadala.
        <span
          className="absolute inset-0 flex flex-col items-center justify-center"
          // paddingBottom = výška cartouche pásu, inak doň „Add a photo" naráža.
          style={{ background: `linear-gradient(160deg, ${T.bgTop} 0%, ${T.bgBottom} 100%)`, gap: 6, paddingBottom: 46 }}
        >
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 46, fontWeight: 700, color: 'rgba(31,26,14,0.28)', lineHeight: 1 }}>
            {(dog.name?.[0] || '?').toUpperCase()}
          </span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.inkFaint }}>
            Add a photo
          </span>
        </span>
      )}

      {/* Cartouche pás — meno + poradové číslo. Gradient zdola nahor drží text
          čitateľný aj na svetlej fotke (Hekthor má za sebou presvetlenú trávu). */}
      <span
        className="absolute inset-x-0 bottom-0 flex items-end justify-between"
        style={{
          gap: 8,
          padding: '22px 10px 9px',
          background: 'linear-gradient(to top, rgba(20,14,4,0.88) 0%, rgba(20,14,4,0.55) 55%, transparent 100%)',
          textAlign: 'left',
        }}
      >
        <span className="min-w-0">
          <span
            className="block truncate"
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#FBF5E6',
            }}
          >
            {dog.name}
          </span>
          {dog.packNumber != null && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: T.accentGold }}>
              #{dog.packNumber}
            </span>
          )}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0"
          style={{ color: '#FBF5E6', opacity: 0.8, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </span>
    </button>
  );
}

// ── Rozbalený obsah karty psa ────────────────────────────────────────────────
// Vytiahnuté z DogGalleryRow, pretože v tiles layoute sa NErenderuje vnútri
// lišty, ale POD mriežkou na plnú šírku (inak by sa 4 stĺpce zúžili na nič).
function DogGalleryBody({
  dog, editable, onSaveBio, onToggleTag, onSaveCard, showTemperament = true,
}: {
  dog: DogGalleryEntry;
  editable: boolean;
  onSaveBio?: (dogId: string, bio: string) => void;
  onToggleTag?: (dogId: string, group: 'temperament' | 'trail', tag: string) => void;
  onSaveCard?: (dogId: string, patch: Partial<DogCard>) => void;
  /** `layout='open'` vykresľuje POVAHA pills SAMOSTATNE v ľavom stĺpci (Matej
   *  2026-07-26: „pod tym povaha pils vedla zostane bio a dropdowny"), takže
   *  telo karty ich tu preskočí, aby sa nerenderovali dvakrát. */
  showTemperament?: boolean;
}) {
  const t = useT();
  const hg = dog.heroglyph;
  const card = dog.attrs.card ?? emptyDogCard();
  const set = <K extends keyof DogCard>(key: K, value: DogCard[K]) => onSaveCard?.(dog.id, { [key]: value } as Partial<DogCard>);
  const setCompat = (key: string, v: string | undefined) =>
    onSaveCard?.(dog.id, { compat: { ...card.compat, [key]: v } as DogCard['compat'] });

  const completion = dogCardCompletion(card);
  // Hárane — len nekastrovaná fena. Nekastrovaná fena v hárani ruší skupinový výlet,
  // preto je to pole, nie poznámka. Pohlavie čítame z heroglyph selections (read-only).
  const sex: 'male' | 'female' | null = /female|fena|suka/i.test(hg?.gender ?? '')
    ? 'female'
    : /male|pes|samec/i.test(hg?.gender ?? '') ? 'male' : null;
  const isIntactFemale = sex === 'female' && card.neutered === 'no';
  const countFilled = (...vals: unknown[]) =>
    vals.filter((v) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)).length;

  return (
        <>
          {editable ? (
            <BioTextarea value={dog.attrs.bio} onSave={(v) => onSaveBio?.(dog.id, v)} />
          ) : dog.attrs.bio ? (
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, lineHeight: 1.5, color: T.ink, margin: 0 }}>
              {dog.attrs.bio}
            </p>
          ) : (
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: T.inkFaint, fontStyle: 'italic', margin: 0 }}>
              {t('pack.publicProfile.noBio')}
            </p>
          )}

          {showTemperament && (
            <TagGroup
              label={t('pack.dogProfile.temperament')}
              options={DOG_TEMPERAMENT_TAGS as readonly string[]}
              selected={dog.attrs.tags.temperament}
              editable={editable}
              max={MAX_DOG_TEMPERAMENT}
              onToggle={(v) => onToggleTag?.(dog.id, 'temperament', v)}
            />
          )}

          {/* ── VRSTVA 1 — ZÁKLAD ── */}
          <SubSection
            title={t('pack.dogCard.basics')}
            filled={countFilled(card.sizeClass, card.neutered, card.origin)}
            total={3}
            defaultOpen
            editable={editable}
          >
            {/* Šírky podľa obsahu: veľkosť je len S/M/L/XL, kastrácia potrebuje dve
                pills v JEDNOM riadku. Pôvod + odkedy dátum si delia zvyšok riadku
                rovnako (Matej 2026-07-29: „ten veľký dropdown nedáva zmysel" —
                CAME FROM predtým hltal celú zvyšnú šírku samo, vyzeralo prázdno). */}
            <FieldGrid template={card.origin ? 'auto auto minmax(120px, 1fr) minmax(120px, 1fr)' : 'auto auto minmax(0, 1fr)'}>
              <SelectRow label={t('pack.dogCard.size')} value={card.sizeClass} options={DOG_SIZE_OPTIONS} editable={editable} onChange={(v) => set('sizeClass', v)} />
              <NeuterPills label={t('pack.dogCard.neutered')} value={card.neutered} sex={sex} editable={editable} onChange={(v) => set('neutered', v)} />
              <SelectRow label={t('pack.dogCard.origin')} value={card.origin} options={DOG_ORIGIN_OPTIONS} editable={editable} onChange={(v) => set('origin', v)} />
              {card.origin && (
                <DateRow label={t('pack.dogCard.originSince')} value={card.originSince} editable={editable} onChange={(v) => set('originSince', v)} />
              )}
            </FieldGrid>
            {isIntactFemale && (
              <div style={{ marginTop: 8 }}>
                <FieldGrid cols={3}>
                  <DateRow label={t('pack.dogCard.heatLast')} value={card.heatLast} editable={editable} onChange={(v) => set('heatLast', v)} />
                </FieldGrid>
              </div>
            )}
          </SubSection>

          {/* ── VRSTVA 2a — AKO FUNGUJE ── */}
          <SubSection
            title={t('pack.dogCard.howHeWorks')}
            filled={countFilled(card.fitness, card.range, card.obedience, card.recall, card.alone, card.feeding)}
            total={6}
            defaultOpen={!editable}
            editable={editable}
          >
            <FieldGrid>
              <SelectRow label={t('pack.dogCard.fitness')} value={card.fitness} options={DOG_FITNESS_OPTIONS} editable={editable} onChange={(v) => set('fitness', v)} />
              <SelectRow label={t('pack.dogCard.range')} value={card.range} options={DOG_RANGE_OPTIONS} editable={editable} onChange={(v) => set('range', v)} />
              <SelectRow label={t('pack.dogCard.obedience')} value={card.obedience} options={DOG_SKILL_OPTIONS} editable={editable} toneOf={(v) => TRAFFIC_COLORS[v]} onChange={(v) => set('obedience', v)} />
              <SelectRow label={t('pack.dogCard.recall')} value={card.recall} options={DOG_SKILL_OPTIONS} editable={editable} toneOf={(v) => TRAFFIC_COLORS[v]} onChange={(v) => set('recall', v)} />
              <SelectRow label={t('pack.dogCard.alone')} value={card.alone} options={DOG_ALONE_OPTIONS} editable={editable} onChange={(v) => set('alone', v)} />
            </FieldGrid>

            <div style={{ marginTop: 10 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkFaint, display: 'block', marginBottom: 6 }}>
                {t('pack.dogCard.feeding')}
              </span>
              <ChipMulti
                options={DOG_FEEDING_OPTIONS.map((o) => o.value)}
                selected={card.feeding ?? []}
                editable={editable}
                i18nPrefix="pack.dogCard.opt"
                onToggle={(v) => {
                  const cur = card.feeding ?? [];
                  set('feeding', (cur.includes(v as never) ? cur.filter((x) => x !== v) : [...cur, v]) as DogCard['feeding']);
                }}
              />
            </div>

          </SubSection>

          {/* ── VRSTVA 2b — S KÝM (semafor) ── */}
          <SubSection
            title={t('pack.dogCard.withWhom')}
            filled={countFilled(...DOG_COMPAT_ROWS.map((r) => card.compat[r.key]), card.dislikedTypes)}
            total={2}
            defaultOpen={!editable}
            editable={editable}
          >
            <FieldGrid>
              {DOG_COMPAT_ROWS.map((r) => {
                const key = `pack.dogCard.compat.${r.key}`;
                const translated = t(key);
                return (
                  <SelectRow
                    key={r.key}
                    label={translated === key ? r.labelEN : translated}
                    value={card.compat[r.key]}
                    options={DOG_COMPAT_OPTIONS}
                    editable={editable}
                    toneOf={(v) => TRAFFIC_COLORS[v]}
                    onChange={(v) => setCompat(r.key, v)}
                  />
                );
              })}
            </FieldGrid>
            <OpenQuestion
              question={t('pack.dogCard.dislikedTypes')}
              values={card.dislikedTypes}
              suggestions={DOG_DISLIKED_TYPE_SUGGESTIONS}
              i18nPrefix="pack.dogCard.type"
              editable={editable}
              placeholder={t('pack.dogCard.dislikedTypesPlaceholder')}
              tone="danger"
              onChange={(v) => set('dislikedTypes', v)}
            />
          </SubSection>

          {/* ── VRSTVA 2c — otvorené otázky ── */}
          <SubSection
            title={t('pack.dogCard.characterSection')}
            filled={countFilled(card.triggers, card.fears, card.joys, card.quirks)}
            total={4}
            defaultOpen={!editable}
            editable={editable}
          >
            <OpenQuestion
              question={t('pack.dogCard.triggers')}
              values={card.triggers}
              suggestions={DOG_TRIGGER_SUGGESTIONS}
              i18nPrefix="pack.dogCard.trigger"
              editable={editable}
              placeholder={t('pack.dogCard.triggersPlaceholder')}
              onChange={(v) => set('triggers', v)}
            />
            <OpenQuestion
              question={t('pack.dogCard.fears')}
              values={card.fears}
              suggestions={DOG_FEAR_SUGGESTIONS}
              i18nPrefix="pack.dogCard.fear"
              editable={editable}
              placeholder={t('pack.dogCard.fearsPlaceholder')}
              onChange={(v) => set('fears', v)}
            />
            <OpenQuestion
              question={t('pack.dogCard.joys')}
              values={card.joys}
              suggestions={DOG_JOY_SUGGESTIONS}
              i18nPrefix="pack.dogCard.joy"
              editable={editable}
              placeholder={t('pack.dogCard.joysPlaceholder')}
              onChange={(v) => set('joys', v)}
            />
            <OpenQuestion
              question={t('pack.dogCard.quirks')}
              values={card.quirks}
              suggestions={DOG_QUIRK_SUGGESTIONS}
              i18nPrefix="pack.dogCard.quirk"
              editable={editable}
              placeholder={t('pack.dogCard.quirksPlaceholder')}
              onChange={(v) => set('quirks', v)}
            />
          </SubSection>

          {editable && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.inkFaint, margin: '12px 0 0', textAlign: 'right' }}>
              {t('pack.dogCard.completion')
                .replace('{name}', dog.name)
                .replace('{pct}', String(completion.pct))}
            </p>
          )}
        </>
  );
}

// Chip multi-select — `editable` toggles click/no-click (read-profil = display only, selected
// only). Empty selection in read mode renders nothing (no empty group header).
function TagGroup({ label, options, selected, editable, max, onToggle }: {
  label: string;
  options: readonly string[];
  selected: string[];
  editable: boolean;
  max?: number;
  onToggle: (value: string) => void;
}) {
  if (!editable && selected.length === 0) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <span className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkFaint }}>
          {label}
        </span>
        {editable && max != null && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: selected.length >= max ? T.accentGold : T.inkFaint }}>
            {selected.length}/{max}
          </span>
        )}
      </span>
      <ChipMulti
        options={options}
        selected={selected}
        editable={editable}
        i18nPrefix="pack.dogTag"
        max={max}
        onToggle={onToggle}
      />
    </div>
  );
}

// ≤200-CHARACTER bio textarea — same visual language as WordLimitTextarea (PackProfile.tsx)
// but character-counted per spec (§1: „max 200 znakov"), not word-counted. Auto-saves on blur.
function BioTextarea({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const t = useT();
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  const over = local.length > BIO_MAX;

  return (
    <div style={{ position: 'relative', marginTop: 2 }}>
      <textarea
        value={local}
        onChange={(e) => {
          const next = e.target.value;
          if (next.length > BIO_MAX && next.length > local.length) return;
          setLocal(next);
        }}
        onBlur={() => { if (local !== value) onSave(local.trim()); }}
        placeholder={t('pack.dogProfile.bioPlaceholder')}
        rows={2}
        className="pf-field"
        style={{
          width: '100%',
          // Svetlejšia než zlatý gradient — rovnaké pravidlo ako bio v bloku 1
          // (Matej 2026-07-26: „texta area daj biele"). Od 13. 8. papyrusový
          // `#FBF5E6` namiesto čistej bielej, viď `WordLimitTextarea`
          // v `PackProfile.tsx`. `.pf-field` okraj/focus glow ostávajú.
          background: '#FBF5E6',
          borderRadius: 10,
          padding: '8px 12px 20px',
          minHeight: 48,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          lineHeight: 1.4,
          resize: 'vertical',
        }}
      />
      <span
        style={{
          position: 'absolute', right: 10, bottom: 6, pointerEvents: 'none',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: over ? '#A04040' : T.inkFaint,
        }}
      >
        {local.length}/{BIO_MAX}
      </span>
    </div>
  );
}
