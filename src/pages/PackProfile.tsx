import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, ChevronRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PackNetwork } from '@/components/pack/PackNetwork';
import { PackSettings } from '@/components/pack/PackSettings';
import { usePackUser, type PackDogFull } from '@/hooks/usePackUser';
import { PACK_THEME, PACK_BOX, PF_FIELD_CSS, GLASS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { uploadExtraPhoto } from '@/services/cloudinaryService';
import { useToast } from '@/hooks/use-toast';
import { useT, useLang } from '@/i18n/LanguageContext';
import { countryOptions, normalizeCountryValue, COUNTRY_OTHER } from '@/lib/countryOptions';
import { DEV_FULL } from '@/lib/packFlags';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readLocalTrails, readWalkedIds, pluralKey, visibleLocalTrails } from '@/components/pack/tripShared';
import { profileLevelFor, readVotes } from '@/components/pack/packCommunity';
import {
  useProfile,
  saveHuman,
  saveDogAttrs,
  emptyDogAttrs,
  emptyDogCard,
  type DogCard,
  type HumanProfile,
  type TaxonomyOption,
  type RelationshipStatus,
  type PersonalityTag,
  type CentralProfile,
  type DogTemperamentTag,
  type DogTrailTag,
  RELATIONSHIP_OPTIONS,
  DIET_OPTIONS,
  SMOKE_OPTIONS,
  WORK_OPTIONS,
  PERSONALITY_OPTIONS,
  MAX_PERSONALITY,
  HIDEABLE_IDENTITY_FIELDS,
  isHidden,
  humanProfileCompletion,
  type ProfileFieldKey,
} from '@/components/pack/profile/packProfile';
import { useDogyptStore } from '@/store/dogyptStore';

const T = PACK_THEME;

// ── PAPYRUS PRIMITÍVY (lock 2026-07-26) ──────────────────────────────────────
// Matej: „dizajn bledých blokov sme si lockli na základe toho aký je v /entry"
// + „je to všetko moc na sebe — oddeliť okrajmi vizuálne ale aj rozdeliť
// logicky". Preto profil UŽ NIE JE jedna karta s dvoma stĺpcami (ten layout
// vyrábal prázdny pravý stĺpec, ktorý Matej zamietol 25.7.), ale stack
// samostatných papyrusových kariet s medzerami — každá = jedna téma.
function PapyrusCard({
  children,
  id,
  pad = 26,
}: {
  children: React.ReactNode;
  id?: string;
  pad?: number;
}) {
  return (
    <section
      id={id}
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        boxShadow: T.cardShadow,
        padding: pad,
        scrollMarginTop: 90,
      }}
    >
      {children}
    </section>
  );
}

/** Zlatá deliaca čiara vyblednutá do strán (`.religion-rule` z /entry). */
function GoldRule({ width = 54, my = 12 }: { width?: number | string; my?: number }) {
  return (
    <div
      aria-hidden
      style={{ width, height: 2, margin: `${my}px 0`, background: T.rule, border: 'none' }}
    />
  );
}

// Pod-blok VNÚTRI papyrusovej karty — `.crit-tile` z /entry (zlatá výplň 6 %,
// zlatý okraj 35 %, radius 10). Matej 2026-07-26: „je to všetko moc na sebe —
// oddeliť okrajmi vizuálne ale aj rozdeliť logicky." Každý pod-blok = jedna
// otázka, ktorú profil kladie, takže okraj nie je dekorácia, ale hranica témy.
// `center` (Matej 2026-07-26: „všetko centrované v 1. bloku") — pri centrovaní
// label a hint NEMÔŽU zostať na opačných koncoch riadku (`justify-between`),
// inak label sedí vľavo a stred blku je prázdny. Preto sa zlepia do jedného
// centrovaného riadku a hint stráca `textAlign: right`.
function SubBlock({
  label,
  children,
  hint,
  center = false,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  center?: boolean;
}) {
  return (
    <div
      style={{
        // Úroveň 2 MATRICE (`PACK_BOX.subblock`) — tá istá DNA ako kroky 1–3 v druhom bloku.
        // Do 13. 8. tu bola plochá `tileBg` so slabým rámom a kroky mali papyrusový gradient
        // s plným zlatým rámom: dva bloky rovnakej úrovne, dva rôzne recepty
        // (Matej: „základ a životný štýl majú slabé okraje a potom dolu v druhom bloku sú
        // zas iné výraznejšie... vyzerá to neprofesionálne").
        ...PACK_BOX.subblock,
        // Matej 2026-07-26: „obidva bloky maju male okraje zhora a dola" —
        // 11/13px hore/dole zväčšené na 17/19px, bočný padding nedotknutý.
        padding: '17px 13px 19px',
      }}
    >
      <div
        className={`flex items-baseline ${center ? 'justify-center' : 'justify-between'}`}
        style={{ gap: center ? 7 : 10, marginBottom: 9 }}
      >
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: T.inkDim,
          }}
        >
          {label}
        </span>
        {hint && (
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10.5,
              color: T.inkFaint,
              textAlign: center ? 'center' : 'right',
            }}
          >
            {center ? `· ${hint.toLowerCase()}` : hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// Centrovaný stĺpec vnútri karty. Bez obmedzenej šírky by centrovanie dopadlo
// presne ako pri pills 25.7. — obsah plávajúci v prázdnej šírke karty. Preto
// centrovanie = úzka os, nie `text-align: center` na plnú šírku.
function Column({
  children,
  max = 520,
  mt,
}: {
  children: React.ReactNode;
  max?: number;
  mt?: number;
}) {
  return (
    <div style={{ maxWidth: max, margin: '0 auto', marginTop: mt, textAlign: 'center' }}>
      {children}
    </div>
  );
}

/** Malý eyebrow nadpis sekcie — Space Grotesk, zlatý, wide tracking. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.26em',
        textTransform: 'uppercase',
        color: T.cardEdge,
      }}
    >
      {children}
    </span>
  );
}

// Stav vyplnenia profilu — zlatý bar v hlavičke sekcie. Pri 100 % sa mení na
// potvrdenie, inak menuje PRVÉ chýbajúce pole (konkrétna výzva > „doplň profil").
function ProfileProgress({
  pct,
  filled,
  total,
  missing,
}: {
  pct: number;
  filled: number;
  total: number;
  missing: { labelEN: string }[];
}) {
  const done = pct === 100;
  return (
    <div style={{ minWidth: 0, width: '100%', maxWidth: 340, margin: '0 auto' }}>
      <div className="flex items-baseline justify-between" style={{ gap: 10, marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12,
            color: T.inkWarm,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {done ? 'Your scroll is complete.' : `Next: add your ${missing[0]?.labelEN.toLowerCase()}`}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            color: done ? T.growGreen : T.cardEdge,
            flexShrink: 0,
          }}
        >
          {filled}/{total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
        style={{
          height: 6,
          borderRadius: 999,
          background: 'rgba(201,154,63,0.16)',
          border: `1px solid ${T.hairline}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 999,
            background: done
              ? T.growGreen
              : 'linear-gradient(90deg, #E6B450 0%, #C99A3F 100%)',
            transition: 'width 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
    </div>
  );
}

// Krstné meno z `user_metadata`, fallback na local-part e-mailu — ŠTVRTÁ lokálna kópia
// (`Pack.tsx:89`, `PackMap.tsx`, `packCommunityUI.tsx:47`). Kopíruje sa zámerne: `usePackIdentity`
// meno neexponuje a všetky štyri povrchy musia z rovnakého vstupu dostať rovnaký reťazec, inak sa
// rozíde level (viď komentár pri `pilgrim` nižšie). Pri zmene meniť VŠETKY štyri.
function firstNameFrom(email: string, fullName?: string): string {
  if (fullName && fullName.trim()) return fullName.trim().split(' ')[0];
  if (!email) return 'Dogyptian';
  const local = email.split('@')[0] || '';
  const base = local.split('+')[0].replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
  if (!base) return 'Dogyptian';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export default function PackProfile() {
  // issue #34: člen s heroglyfom obchádza `/entry` (verejná conviction gate) a ide rovno do tvorby.
  // Reset flow storu, aby druhý pes nezdedil meno/dátum/tier prvého v tej istej SPA session.
  const resetFlow = useDogyptStore((s) => s.reset);
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [session, setSession] = useState<Session | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [nameDirty, setNameDirty] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { toast } = useToast();
  const { dogs, loading: dogsLoading } = usePackUser(session?.user?.id ?? null);
  // Central profile (bio/basics/pills) — read here for BLOK 1 (identity+bio card);
  // ProfileEditor below reads its own copy for BLOK 2 (merged pills card). Same
  // localStorage-backed store, kept in sync via useProfile()'s listener.
  const { profile } = useProfile();
  const human = profile?.human;
  const patchHuman = (p: Partial<HumanProfile>) => { saveHuman(p); };

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      const meta = (data.session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
      // DEV-ONLY: NOAUTH guest nemá session, takže avatar aj meno by boli prázdne
      // a stránka by sa v deve nedala vizuálne posúdiť (Matej 2026-07-26: „nech
      // vidíme preview"). Nikdy sa nedostane na produkciu (import.meta.env.DEV).
      // NECOMMITOVAŤ — revert pred pushom, spolu s dev seedom v usePackUser.ts.
      // Pozor: NIE `&& !data.session` — v deve často JE session (testovací účet)
      // s prázdnym full_name/avatar_url, takže fallback by sa nikdy nechytil a
      // avatar by ostal prázdny krúžok s iniciálou z e-mailu. Zrkadlí to
      // usePackUser.ts, ktorý psov preseeduje pri DEV_NOAUTH bez ohľadu na session.
      const devNoAuth = import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === '1';
      setAvatarUrl(meta.avatar_url || meta.avatar || (devNoAuth ? '/images/about-matej.png' : null));
      setFullName(meta.full_name || meta.name || (devNoAuth ? 'Matej Stacho' : ''));
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-open file picker when ?edit=avatar
  useEffect(() => {
    if (searchParams.get('edit') === 'avatar') {
      const timeoutId = setTimeout(() => fileInputRef.current?.click(), 200);
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams]);

  // Welcome deep-link (?welcome=1) invites password setup → handled inside <PackSettings/> itself.

  // Hash deep-link scroll — client-side nav does NOT auto-scroll to a hash like a full page
  // load does, so scroll it into view manually once the target section is on screen.
  // ⚠️ Jeden pokus nestačí: sekcie NAD cieľom (avatar, bio, chipy) sa dorenderujú až po ňom,
  // takže v čase scrollu leží cieľ pár desiatok px pod vrchom a stránka ostane stáť tam, kým sa
  // cieľ odsunie nižšie (Matej 2026-08-06 — „nejde mi otvoriť my pack", pôvodne pre `#my-gods`).
  // Preto scrollujeme opakovane, kým sa pozícia cieľa medzi dvoma meraniami neustáli. `instant`
  // je zámerne: CSS má `scroll-behavior: smooth`, a rozbehnutú smooth animáciu by každá ďalšia
  // korekcia aj tak zrušila.
  // ⚠️ `#my-gods` (psia sekcia) ZANIKLO 6.8.2026 spolu so sekciou „OH, MY DOG!" — jediný živý
  // cieľ je `#network` (blok BONES/sieť), homepage `/pack` naň posiela z pilulky „ZOBRAZIŤ
  // SIEŤ" (Matej 12.8.2026: zoznam siete má byť na JEDNOM mieste). Nové kotvy pridávaj do
  // `HASH_TARGETS`, nie novým efektom.
  useEffect(() => {
    const HASH_TARGETS = ['#network'];
    if (!HASH_TARGETS.includes(location.hash)) return;
    const targetId = location.hash.slice(1);
    let lastTop = -1;
    let tries = 0;
    let timer = 0;
    const tick = () => {
      const el = document.getElementById(targetId);
      // ⚠️ Cieľ ešte nemusí byť v DOM (blok sa dorenderuje po dátach) — vtedy sa NESMIE
      // vzdať, inak deep-link `#network` z homepage skončí na vrchu stránky (overené).
      if (!el) {
        if (++tries > 12) return;
        timer = window.setTimeout(tick, 100);
        return;
      }
      const top = Math.round(el.getBoundingClientRect().top + window.scrollY);
      el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
      if (top === lastTop || ++tries > 12) return; // ustálené, alebo strop ~1,3 s
      lastTop = top;
      timer = window.setTimeout(tick, 100);
    };
    timer = window.setTimeout(tick, 100);
    return () => clearTimeout(timer);
  }, [location.hash, dogsLoading]);

  const email = session?.user?.email ?? '—';

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !session?.user) return;
    setUploading(true);
    try {
      const result = await uploadExtraPhoto(file, `avatars/${session.user.id}`, 1);
      const { error: upErr } = await supabase.auth.updateUser({
        data: { avatar_url: result.secureUrl },
      });
      if (upErr) throw new Error(upErr.message);
      setAvatarUrl(result.secureUrl);
      toast({ title: tx('pack.profile.toastPhotoUpdated', 'Photo updated') });
    } catch (err) {
      toast({
        title: tx('pack.profile.toastUploadFailed', 'Upload failed'),
        description: err instanceof Error ? err.message : tx('pack.profile.toastUnknownError', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameDirty || nameSaving) return;
    setNameSaving(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() || null },
      });
      if (upErr) throw new Error(upErr.message);
      setNameDirty(false);
      toast({ title: tx('pack.profile.toastNameUpdated', 'Name updated') });
    } catch (err) {
      toast({
        title: tx('pack.profile.toastCouldNotSave', 'Could not save'),
        description: err instanceof Error ? err.message : tx('pack.profile.toastUnknownError', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setNameSaving(false);
    }
  };

  const initial = (fullName?.[0] || email?.[0] || 'D').toUpperCase();
  const hasAvatar = !!avatarUrl;

  // Stav vyplnenia — VYPNUTÝ (Matej 2026-07-26: „ten progres nemá zmysel - vypni ho").
  // `humanProfileCompletion()`/`ProfileProgress` zostávajú v kóde pre budúcu bránu
  // („100 % profil = smieš na výlet") — výpočet sa spúšťa až vtedy, keď sa bar vráti.

  // PÚTNIK riadok — hodnosť + level, tichý riadok pod hlavičkou (nie tripstats karta, tá
  // ostáva jediný zdroj pravdy na mape). Za `DEV_FULL` z rovnakého dôvodu ako `TripSpotlight`
  // na homepage (`Pack.tsx:269–273`): `/pack/map` ešte nie je pre členov, takže bez brány by
  // riadok linkoval do zamknutej routy. Výpočet je `profileLevelFor` — jediný zdroj pravdy
  // zdieľaný s hlavičkou mapy (packCommunity.ts:678), vlastný výpočet by dal iné číslo.
  const pilgrim = useMemo(() => {
    if (!DEV_FULL) return null;
    // Jedno čítanie localStorage, nie dve — `readLocalTrails()` parsuje JSON pri každom volaní.
    const localTrails = readLocalTrails();
    const allTrails: HeroTrail[] = [...visibleLocalTrails(localTrails), ...HERO_JOURNEYS, ...HERO_TRAILS];
    const walked = readWalkedIds();
    const walkedTrails = allTrails.filter((tr) => walked.has(tr.id));
    if (walkedTrails.length === 0) return null;
    const walkedKm = walkedTrails.reduce((sum, tr) => {
      const n = parseFloat(String(tr.km ?? '').replace(',', '.'));
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    const { level } = profileLevelFor({
      walkedTrails,
      localTrailIds: localTrails.map((tr) => tr.id),
      votes: readVotes(),
      email: session?.user?.email ?? '',
      // ⚠️ MUSÍ to byť `firstNameFrom`, nie `fullName.split(' ')[0]`. Pri prázdnom
      // `full_name` (bežný stav — user_metadata býva prázdne) by holý split vrátil `''`,
      // kým mapa aj homepage odvodia meno z e-mailu → `addedByMeIds` by tu spárovalo
      // menej výletov a profil by ukazoval NIŽŠÍ level než mapa. Presne ten rozchod
      // popisuje komentár v `packCommunity.ts:678`.
      ownerName: firstNameFrom(session?.user?.email ?? '', fullName),
    });
    return { level: level.level, count: walkedTrails.length, km: Math.round(walkedKm) };
  }, [session, fullName]);

  return (
    <PackLayout wide>
      <div className="flex flex-col gap-5">
        {/* Back to Home — bottom nav is hidden on LIVE, so profile needs its own way back */}
        <Link
          to="/pack"
          className="pf-tap inline-flex items-center gap-2"
          style={{
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.22em',
            fontSize: 11,
            textTransform: 'uppercase',
            color: T.inkDim,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft className="h-3 w-3" />
          {tx('pack.profile.back', 'Pack')}
        </Link>
        {/* `.pf-field`/`.pf-pill` — zdieľané s DogGallery.tsx/DogCardFields.tsx
            (psia karta), definícia žije v `packTheme.ts` (`PF_FIELD_CSS`),
            presne ako `GLASS_CSS`. Render raz na stránke. */}
        <style>{PF_FIELD_CSS}</style>
        {/* Sklo pre PÚTNIK riadok (`.pk-glass-onlight`). Rovnaké pravidlá ako inde v /packu —
            duplicitný <style> s tým istým obsahom je neškodný, chýbajúci by riadok zhodil
            na priehľadný obdĺžnik bez rámu. */}
        <style>{GLASS_CSS}</style>

        {/* SEKCIA 1+2 VRÁTENÉ SPÄŤ POD SEBA (Matej 2026-07-26, tretí pokus:
            „toto rozloženie je zlé vráť to... na 2 bloky pod sebou"). Vedľa
            seba (lg:grid-cols-[3fr_2fr]) vydržalo len jedno kolo — pôvodný
            komentár k tomuto pokusu je v git histórii, netreba ho tu naťahovať. */}
        {/* ── SEKCIA 1 — WHO YOU ARE (človek) ─────────────────────────────
            Nadnadpis „Who you are" je PREČ (Matej 2026-07-26: „zbytočne fill
            slova preč!") — bola to eyebrow bez informačnej hodnoty, karta je
            zjavne majiteľ len z obsahu. Hlavný hrdina profilu je pes („OH, MY
            DOG!" vpravo), majiteľ nepotrebuje vlastný label na to, aby to bolo
            jasné. Zrkadlí brand princíp: majiteľ je vnútri rámiku psa. */}
        <PapyrusCard>
          {/* Bar stavu vyplnenia je VYPNUTÝ (Matej 2026-07-26: „ten progres nemá
              zmysel - vypni ho"). Komponent `ProfileProgress` aj
              `humanProfileCompletion()` zostávajú v kóde — zapnutie = vrátiť
              tieto štyri props do hlavičky karty. */}
          {/* HLAVIČKA BLOKU 1 — FOTO vľavo | MENÁ vpravo (Matej 2026-07-29:
              „skonsolidovať prvú časť — fotku daj na ľavo a name, nickname na
              pravo aj na mobile"). Predtým bola os čisto vertikálna (foto NAD
              menami), čo z hlavičky robilo dve obrazovky na mobile. Zvyšok
              bloku (BIO → basics/lifestyle → what you're like) ostáva
              centrovaný — mení sa len táto hlavička. */}
          <Column max={640}>
          <div className="flex flex-row items-center" style={{ gap: 16 }}>
            {/* Avatar — vľavo, menší než v centrovanej verzii: vedľa neho teraz
                sedia polia, takže `clamp` má nižší strop aj nižšie dno (na
                390px mobile ostane ~94px a zvyšok riadku patrí menám).
                `aspectRatio` drží kruh bez druhej clamp hodnoty. */}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading}
              aria-label={tx('pack.profile.changeAvatarAria', 'Change avatar')}
              className="relative shrink-0 group"
              style={{
                width: 'clamp(88px, 24vw, 148px)',
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                // 1px šedý hairline z 88px krúžku sa pri 176px stratí a fotka
                // splynie s papyrusom. Zlatý ring + halo = ten istý jazyk ako
                // rám karty (brand lock), o vrstvu menší.
                border: hasAvatar ? `2px solid ${T.cardEdge}` : `2px dashed ${T.border}`,
                boxShadow: hasAvatar ? '0 0 0 5px rgba(201,154,63,0.14)' : 'none',
                background: hasAvatar
                  ? 'transparent'
                  : 'linear-gradient(135deg, #F0E3C4 0%, #F5EDD8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: uploading ? 'progress' : 'pointer',
                padding: 0,
              }}
            >
              {hasAvatar ? (
                <img
                  src={avatarUrl!}
                  alt={tx('pack.profile.avatarAlt', 'Avatar')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    // Škáluje s kruhom — fixných 58px pretieklo z 88px avatara.
                    fontSize: 'clamp(34px, 9vw, 58px)',
                    fontWeight: 700,
                    color: T.inkDim,
                  }}
                >
                  {initial}
                </span>
              )}
              <span
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(10,10,10,0.55)', color: T.card, borderRadius: '50%' }}
              >
                {uploading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Camera className="h-7 w-7" />}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />

            {/* MENÁ — vpravo od fotky, `flex-1 min-w-0` (bez `min-w-0` by grid
                s inputmi odmietol zmenšiť a vytlačil by riadok zo šírky karty).
                Na mobile Name/Nickname POD SEBOU: vedľa fotky ostane ~230px, čo
                by pri 2 stĺpcoch dalo ~105px na pole a placeholdery by sa
                orezali. Od `sm` (640px) sa vracajú vedľa seba — 2-col z
                zadanie-profil-shrink-2026-07-24 tak platí všade, kde sa vojde.
                Vonkajší `Column max={640}` drží rovnakú hranicu šírky ako
                basics+lifestyle nižšie (Matej 2026-07-26). */}
            {/* Popisok sedí VEDĽA poľa, nie nad ním (Matej 2026-08-12: „placeholder
                name a nick name budu vedla nie nad = zmensi sa text area ale bude
                stale dostatocne velky blok na vpisanie mena"). Tým padnú dva riadky
                výšky a obe polia sa vojdú pod seba aj vedľa fotky. Predtým stáli
                vedľa seba v `sm:grid-cols-2` a čítali sa ako dva rovnocenné údaje —
                hlavička pôsobila ako formulár. Text v poli je zarovnaný VĽAVO:
                pri popisku vľavo by centrovaný text plával medzi ním a okrajom. */}
            <div className="flex-1 min-w-0">
              <div className={`pf-inline${(human?.displayAs ?? 'name') === 'name' ? ' is-shown' : ''}`}>
                <span className="pf-inline-lbl">{tx('pack.profile.name', 'Name')}</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setNameDirty(true);
                  }}
                  onBlur={() => { handleSaveName(); }}
                  placeholder={tx('pack.profile.namePlaceholder', 'Your name')}
                  className="pf-field pf-field--flat"
                  style={{
                    width: '100%',
                    minWidth: 0,
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: T.ink,
                    fontFamily: FONT_UI,
                    fontSize: 13,
                    textAlign: 'left',
                  }}
                />
              </div>

              <div
                className={`pf-inline${human?.displayAs === 'nickname' ? ' is-shown' : ''}`}
                style={{ marginTop: 8 }}
              >
                <span className="pf-inline-lbl">{tx('pack.profile.nickname', 'Nickname')}</span>
                <AutoSaveTextInput
                  value={human?.nickname ?? ''}
                  onSave={(v) => patchHuman({ nickname: v || undefined })}
                  placeholder={tx('pack.profile.nicknamePlaceholder', 'Pack calls you')}
                  align="left"
                />
              </div>

              <div className="pf-inline pf-inline--toggle" style={{ marginTop: 12 }}>
                <span className="pf-inline-lbl">{tx('pack.profile.showAs', 'Show as')}</span>
                <DisplayAsToggle
                  value={human?.displayAs ?? 'name'}
                  onChange={(v) => patchHuman({ displayAs: v })}
                />
              </div>
            </div>
          </div>
          </Column>

          {/* PÚTNIK riadok — hodnosť + level, hneď pod hlavičkou a nad prvým GoldRule
              (zadanie-profil-uzavret-2026-08-12, bod 5). Za `DEV_FULL`, viď komentár
              pri výpočte `pilgrim` vyššie. Nula prejdených výletov = riadok sa vôbec
              nerenderuje (prázdna vitrína je horšia než žiadna). */}
          {pilgrim && (
            <Column max={640} mt={14}>
              <Link
                to="/pack/map/triplist?tab=stats"
                className="pk-glass-onlight pf-tap flex items-center justify-between"
                style={{
                  /* Matej 2026-08-13, druhé kolo: „skús dať ten blok pútnika v liquid
                     tmavom glasse... (štýl mapy)". Papyrusová verzia z prvého kola
                     vyzerala na papyrusovej karte „ako navyše" — rovnaká farba, rovnaký
                     rám, len ďalší riadok. Tmavé sklo hovorí, že to NIE JE súčasť profilu,
                     ale VSTUP do inej časti appky — a je to presne povrch, na ktorý ten
                     preklik vedie (`/pack/map/*` je celé tmavé sklo).
                     Recept žije v `pk-glass-onlight` (packTheme.ts) — nie tu. */
                  padding: '16px 18px',
                  textDecoration: 'none',
                }}
              >
                <span className="flex items-center flex-wrap" style={{ gap: 10, minWidth: 0 }}>
                  <span style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 16, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.onDark }}>
                    {t('pack.map.rankPilgrim')}
                  </span>
                  {/* Level = PLNÁ zlatá pilulka s holým číslom, rovnako ako v hlavičke mapy
                      (`.trp-level-num`, PackMap.tsx:757). Popisok „Lvl" tam Matej 3. 8. zrušil
                      („to LVL ma ruší") — rang vedľa povie, čo to číslo je. Ten istý údaj musí
                      mať naprieč appkou ten istý tvar, presne ako pilulka dní. */}
                  <span
                    style={{
                      fontFamily: FONT_TITLE,
                      fontWeight: 700,
                      fontSize: 15,
                      lineHeight: 1,
                      padding: '4px 12px 5px',
                      borderRadius: 999,
                      background: 'linear-gradient(135deg,#F5C73D,#E69E1A)',
                      color: '#1F1A0E',
                      boxShadow: '0 2px 8px rgba(245,199,61,0.28)',
                    }}
                  >
                    {pilgrim.level}
                  </span>
                  <span style={{ fontFamily: FONT_UI, fontSize: 13, color: T.onDarkDim }}>
                    {t('pack.map.mstats' + pluralKey(pilgrim.count), { n: pilgrim.count, km: String(pilgrim.km) })}
                  </span>
                </span>
                {/* Text pri šípke — bez neho riadok nepovie, kam vedie. */}
                <span className="flex items-center shrink-0" style={{ gap: 4 }}>
                  <span className="hidden sm:inline" style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accentGold }}>
                    {tx('pack.profile.pilgrimCta', 'Hiking profile')}
                  </span>
                  <ChevronRight className="h-5 w-5" style={{ color: T.accentGold }} />
                </span>
              </Link>
            </Column>
          )}

          {/* BIO — hneď pod menom (Matej 2026-07-26: „pod to bio, pod to basic a
              lifestyle"). Predtým bolo AŽ pod pills, čiže hook profilu čítal
              človek po vyplnenom formulári. Je to hlas psa o majiteľovi, takže
              centrovaný ho číta ako citát, nie ako tretí riadok formulára. */}
          <GoldRule width="100%" my={18} />
          <Column max={640}>
            {/* BIO heading — one bold, oversized line. It's the funny/unique hook
                of the profile, so it should pop (Matej 2026-07-24). */}
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, lineHeight: 1.2, color: T.inkStrong, marginBottom: 10 }}>
              {tx('pack.profile.bioHeading', 'BIO: What my dog would probably say about me')}
            </div>
            <WordLimitTextarea
              value={human?.dogVoiceBio ?? ''}
              onSave={(v) => patchHuman({ dogVoiceBio: v })}
              placeholder={tx('pack.profile.bioPlaceholder', 'My human wakes up at 6 just to walk me. Slightly obsessed. Would recommend. — 🐾')}
              rows={2}
              align="center"
              white
            />
          </Column>

          {/* identity pills — ONE row: gender (read-only) · age · status
              (relationship, single pill dropdown) · nationality (flag+abbr
              dropdown, default SVK) · city. Languages removed from UI (field
              kept in data, just not shown). Folds in what used to be "The
              basics" section (zadanie-profil-konsolidacia-2026-07-24); order +
              status/nationality collapsed to single dropdowns per
              zadanie-profil-shrink-2026-07-24. */}
          {/* Dva pod-bloky s okrajmi namiesto dvoch riadkov pills nalepených na
              seba. ZÁKLAD je povinná časť identity, LIFESTYLE je dobrovoľná —
              preto sú to dve témy, nie jeden zlepenec. Pills SÚ centrované
              (Matej 2026-07-26) — plávaniu v prázdnej šírke, ktoré to spôsobilo
              25.7., bráni `Column`, nie zarovnanie zľava. */}
          <GoldRule width="100%" my={18} />
          <Column max={640}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 10 }}>
          <SubBlock label={tx('pack.profile.basics', 'The basics')} center>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <HideWrap hidden={isHidden(profile, 'age')}>
                <MiniChipInput
                  emoji="🎂"
                  type="number"
                  value={human?.age}
                  placeholder={tx('pack.profile.agePlaceholder', 'Age')}
                  width={32}
                  onSave={(v) => patchHuman({ age: v === '' ? undefined : Number(v) })}
                />
              </HideWrap>
              <Link to="/pack/dogs" className="pf-tap inline-flex items-center" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <MiniChip>
                  <span aria-hidden>🐶</span>
                  <span style={{ color: dogs.length ? T.inkDim : T.inkFaint }}>
                    {dogs.length} {dogs.length === 1
                      ? tx('pack.profile.dogOne', 'dog')
                      : tx('pack.profile.dogMany', 'dogs')}
                  </span>
                </MiniChip>
              </Link>
              {/* Národnosť oko NEMÁ — vždy viditeľná (Matej 2026-07-25). */}
              <NationalitySelect
                value={human?.nationality ?? 'SK'}
                onChange={(v) => patchHuman({ nationality: v })}
              />
              <HideWrap hidden={isHidden(profile, 'region')}>
                {/* Matej 2026-07-26: „jaslovske bohunice nie su cele viditelne" —
                    76px zobrazí len ~9 znakov, dlhšie mestá (Jaslovské Bohunice,
                    18 znakov) sa orežú. 128px pokryje bežné SK mestá aj s
                    diakritikou bez toho, aby riadok pills prerástol na mobile. */}
                <MiniChipInput
                  emoji="📍"
                  value={human?.region ?? ''}
                  placeholder={tx('pack.profile.cityPlaceholder', 'City')}
                  width={128}
                  onSave={(v) => patchHuman({ region: v || undefined })}
                />
              </HideWrap>
              {/* Jedno oko na celý riadok — dropdown s výberom, čo skryť (Matej
                  2026-07-25: „nie oko pri každej"). Druhý riadok oko nemá: je
                  dobrovoľný, kto ho nechce ukázať, nevyplní ho. */}
              <IdentityVisibilityEye profile={profile} patchHuman={patchHuman} />
            </div>
          </SubBlock>
          <SubBlock label={tx('pack.profile.lifestyle', 'Lifestyle')} hint={tx('pack.profile.optional', 'Optional')} center>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <StatusSelect
                value={human?.relationship}
                onChange={(v) => patchHuman({ relationship: v })}
              />
              <LifestyleSelect
                emoji="🚬"
                placeholder={tx('pack.profile.smokePlaceholder', 'Smoke')}
                options={SMOKE_OPTIONS}
                value={human?.smoke}
                onChange={(v) => patchHuman({ smoke: v })}
              />
              <LifestyleSelect
                emoji="🥗"
                placeholder={tx('pack.profile.dietPlaceholder', 'Diet')}
                options={DIET_OPTIONS}
                value={human?.diet}
                onChange={(v) => patchHuman({ diet: v })}
              />
              <LifestyleSelect
                emoji="💼"
                placeholder={tx('pack.profile.workPlaceholder', 'Work')}
                options={WORK_OPTIONS}
                value={human?.work}
                onChange={(v) => patchHuman({ work: v })}
              />
            </div>
          </SubBlock>
          </div>
          </Column>

          {/* WHAT YOU'RE LIKE — vtiahnuté DO bloku 1 (Matej 2026-07-26: „a what
              you like všetko centrované v 1. bloku"). Bola to samostatná karta
              (SEKCIA 3) pod psami; teraz je celý človek — foto, meno, bio,
              základ, lifestyle, osobnosť — v jednej karte a psy sú ten druhý,
              samostatný hrdina. Vrátenie = vytiahnuť tieto tri riadky späť do
              vlastnej `<PapyrusCard>`. */}
          <GoldRule width="100%" my={18} />
          <Column max={640}>
            {/* `hideLabel` — vnútri PersonalityConcentrate je vlastný label
                „PERSONALITY". Kým to bola samostatná karta, čítal sa ako pod-
                nadpis; pod eyebrow „What you're like" je to to isté dvakrát. */}
            <div style={{ marginBottom: 12 }}>
              <Eyebrow>{tx('pack.profile.whatYoureLike', 'What you’re like')}</Eyebrow>
            </div>
            <PersonalityConcentrate human={human} patchHuman={patchHuman} center hideLabel />
          </Column>

        </PapyrusCard>

        {/* SEKCIA „OH, MY DOG!" (profily psov) ZRUŠENÁ 2026-08-06 — Matej: „týmto
            rozhodnutím vlastne v /profile rušíme 2. blok, kde boli predtým profily psov…
            zostane to len pre majiteľa." Profil je odteraz VÝHRADNE o majiteľovi
            (fotka, meno, účet, heslo, jazyk, notifikácie).

            Všetko psie sa presunulo: VSTUP → MY PACK (`/pack/dogs`, dlaždice kvízov),
            VÝSTUP → karta psa (`/pack/dogs/:id`, pet pas).
            ⚠️ Polia a taxonómie v `components/pack/profile/packProfile.ts` NEZANIKLI —
            len sa pýtajú inde. `DogGallery.tsx` / `DogCardFields.tsx` ostávajú v repe
            (používa ich read-profil `/pack/u/:id`), tu sa už nemountujú. */}

        {/* Bones + your network — split two-column block */}
        <PackNetwork avatarUrl={avatarUrl} initial={initial} />

        {/* Account info + password modal — vlastná karta ZMAZANÁ 2026-08-12 (bola duplikát
            `PackSettings`, ktorý robí presne to isté a je už plne preložený). */}
        <PackSettings />

        <div style={{ height: 24 }} />
      </div>
    </PackLayout>
  );
}

// `MyGodsContent` (psia galéria — accordion editor BIO+tagov) ZMAZANÝ 2026-08-06
// spolu so sekciou „OH, MY DOG!" (viď komentár pri jej bývalom mieste vyššie).
// Komponent `DogGalleryAccordion` sám NEZANIKOL — read-only ho ďalej používa
// `PublicProfile.tsx` (`/pack/u/:id`). Editovanie psích polí patrí do kvízov v MY PACK.

// `Field`/`Badge` (Account info riadky) ZMAZANÉ 2026-08-12 — boli súkromné len pre karte
// „Account", ktorú nahradil zdieľaný `<PackSettings/>`. Rovnaké komponenty žijú tam.

// ─────────────────────────────────────────────────────────────────────────
// Koncentrát osobnosti + lifestyle — BLOK 2 rozpustený do BLOK 1 (ľavý
// stĺpec, pod bio) — zadanie-profil-koncentrat-2026-07-24. Nahrádza starý
// samostatný <ProfileEditor/> ("Topics & style" karta, Topics/vibe/off-the-
// leash/person-type/smoking/alcohol/looking-for pill groups + per-field
// visibility toggle). Read/write stále cez useProfile()/saveHuman() —
// žiadny priamy localStorage.
// ─────────────────────────────────────────────────────────────────────────

const MAX_WORDS = 150;
function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

// LANGUAGE_OPTIONS removed from BLOK 1 UI (zadanie-profil-blok1-rework-2026-07-24
// — `human.languages` data field stays, just no longer rendered here).

// Small sub-heading above a field/group.
function SubFieldLabel({ label }: { label: string }) {
  return (
    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: T.inkDim, display: 'block', marginBottom: 8 }}>
      {label}
    </span>
  );
}

// Reusable pill — selected = gold fill (T.accentGold) + dark text, unselected =
// T.bg + hairline border + inkDim text. Emoji prefix (font-native, per
// zadanie-profil-kompakt-emoji-2026-07-24) replaces the old <BrandIcon>; falls
// back to no prefix when an option has neither (never invents one). `disabled`
// = at MAX_PERSONALITY and not yet selected — dimmed, click is a no-op.
function ProfilePill<V extends string>({
  option,
  selected,
  disabled,
  onClick,
}: {
  option: TaxonomyOption<V>;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`pf-pill inline-flex items-center gap-1${selected ? ' is-selected' : ''}`}
      style={{
        borderRadius: 999,
        padding: '3px 9px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        fontWeight: selected ? 600 : 500,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {option.emoji ? <span aria-hidden>{option.emoji}</span> : null}
      {/* Hodnota pilulky ide cez konvenčný kľúč `pack.profileTag.<value>` — rovnaký vzor ako
          `pack.dogTag.<value>` (dogQuiz.ts:94). Taxonómia v `packProfile.ts` tak ostáva čisté
          dáta bez i18n poľa a `labelEN` slúži ako fallback, keď preklad chýba. */}
      {tx(`pack.profileTag.${option.value}`, option.labelEN)}
    </button>
  );
}

// Koncentrát osobnosti — 20 pills / 5 groups (Vibe/Active/Creative/Taste/
// Dogs), ONE shared max-10 limit + "{n}/10" counter (zadanie-profil-
// koncentrat-2026-07-24 ČASŤ B.2). Selected pills stay clickable (unselect
// always allowed); unselected pills disable once the cap is hit.
function PersonalityConcentrate({
  human,
  patchHuman,
  center = false,
  hideLabel = false,
}: {
  human: HumanProfile | undefined;
  patchHuman: (p: Partial<HumanProfile>) => void;
  center?: boolean;
  hideLabel?: boolean;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const selected = human?.personality ?? [];
  const custom = human?.customPersonality;
  const total = selected.length + (custom ? 1 : 0);
  const atMax = total >= MAX_PERSONALITY;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const toggle = (v: PersonalityTag) => {
    if (selected.includes(v)) {
      patchHuman({ personality: selected.filter((x) => x !== v) });
    } else if (!atMax) {
      patchHuman({ personality: [...selected, v] });
    }
  };

  const saveCustom = () => {
    const trimmed = draft.trim().slice(0, 24);
    patchHuman({ customPersonality: trimmed || undefined });
    setDraft('');
    setAdding(false);
  };

  return (
    <div>
      <div
        className={`flex items-center ${center ? 'justify-center' : 'justify-between'}`}
        style={{ marginBottom: 10, gap: center ? 8 : 0 }}
      >
        {!hideLabel && (
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: T.inkDim }}>
            {tx('pack.profile.personality', 'Personality')}
          </span>
        )}
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: atMax ? T.accentGold : T.inkFaint }}>
          {total}/{MAX_PERSONALITY}
        </span>
      </div>
      {/* Flat pool — no group sub-headings, tighter gaps (Matej 2026-07-24:
          „daj preč nadpisy … tie pils sú veľké a roztiahnuté"). Last: ONE
          user-written custom pill („pridať vlastný pill, len 1x"). */}
      <div className={`flex flex-wrap gap-1.5 ${center ? 'justify-center' : ''}`}>
        {PERSONALITY_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <ProfilePill
              key={opt.value}
              option={opt}
              selected={isSelected}
              disabled={!isSelected && atMax}
              onClick={() => toggle(opt.value)}
            />
          );
        })}

        {/* Custom pill — set = gold chip with ✕ to remove; unset = "+ Add your
            own" (only when there's room). One only. */}
        {custom ? (
          <button
            type="button"
            onClick={() => patchHuman({ customPersonality: undefined })}
            className="pf-pill is-selected inline-flex items-center gap-1"
            style={{
              borderRadius: 999,
              padding: '3px 9px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span aria-hidden>✏️</span>
            {custom}
            <span aria-hidden style={{ opacity: 0.7 }}>✕</span>
          </button>
        ) : adding ? (
          <input
            autoFocus
            value={draft}
            maxLength={24}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveCustom}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); saveCustom(); }
              if (e.key === 'Escape') { setDraft(''); setAdding(false); }
            }}
            placeholder={tx('pack.profile.customPersonalityPlaceholder', 'Your own…')}
            className="pf-field"
            style={{
              borderRadius: 999,
              padding: '3px 10px',
              width: 120,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              color: T.ink,
            }}
          />
        ) : !atMax ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1"
            style={{
              background: 'transparent',
              border: `1px dashed ${T.border}`,
              borderRadius: 999,
              padding: '3px 9px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: T.inkFaint,
              cursor: 'pointer',
            }}
          >
            {tx('pack.profile.addOwnPersonality', '＋ Add your own')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// Compact lifestyle dropdown — same rounded-pill select chrome as
// Nationality/Status above (ČASŤ B.3). Generic over any TaxonomyOption union.
function LifestyleSelect<V extends string>({
  emoji,
  placeholder,
  options,
  value,
  onChange,
}: {
  emoji: string;
  placeholder: string;
  options: TaxonomyOption<V>[];
  value: V | undefined;
  onChange: (v: V | undefined) => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? (e.target.value as V) : undefined)}
      className="pf-field"
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        color: value ? T.ink : T.inkFaint,
        cursor: 'pointer',
      }}
    >
      <option value="">{emoji} {placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.emoji ? `${opt.emoji} ` : ''}{tx(`pack.profileTag.${opt.value}`, opt.labelEN)}</option>
      ))}
    </select>
  );
}

// ≤150-word textarea with a live counter — blocks further growth once over
// the limit (spec: „nad limit blokuj ďalší vstup"). Auto-saves on blur.
function WordLimitTextarea({
  value,
  onSave,
  placeholder,
  rows = 4,
  align = 'left',
  white = false,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  rows?: number;
  align?: 'left' | 'center';
  /** Matej 2026-07-26: „texta area daj biele" — textarea má byť SVETLEJŠIA než
   *  zlatý gradient ostatných `.pf-field` prvkov. Od 13. 8. je to najsvetlejší
   *  papyrusový tón `#FBF5E6`, nie čistá `#FFFFFF`: biela bola jediný taký prvok
   *  na celej stránke a porušovala lock bledého bloku (audit A2). Zámer ostáva,
   *  mení sa odtieň. Inline `background` prebije CSS triedu, takže `.pf-field`
   *  border/shadow/focus glow ostávajú. Ten istý tón nesie bio psa
   *  v `profile/DogGallery.tsx` — meniť oba naraz. */
  white?: boolean;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  const count = countWords(local);
  const over = count > MAX_WORDS;

  return (
    // IG-style: counter overlaid inside the textarea's bottom-right corner
    // (per Matej — no separate line below, consolidates space).
    <div style={{ position: 'relative' }}>
      <textarea
        value={local}
        onChange={(e) => {
          const next = e.target.value;
          if (countWords(next) > MAX_WORDS && next.length > local.length) return;
          setLocal(next);
        }}
        onBlur={() => { if (local !== value) onSave(local); }}
        placeholder={placeholder}
        rows={rows}
        className={`pf-field${white ? ' pf-field--flat' : ''}`}
        style={{
          width: '100%',
          // radius 8 = úroveň 4 MATRICE, rovnako ako MENO a PREZÝVKA nad ňou.
          // Textarea tu mala 10 a vedľajšie polia 8 — rozdiel, ktorý oko vidí a nevie pomenovať.
          borderRadius: 8,
          padding: '8px 12px 22px',
          minHeight: 48,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          lineHeight: 1.4,
          textAlign: align,
          resize: 'vertical',
          // farba prichádza z `.pf-field--flat` (packTheme.ts) — jedno miesto pre všetky tri polia
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: 10,
          bottom: 8,
          pointerEvents: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: over ? '#A04040' : T.inkFaint,
        }}
      >
        {count}/{MAX_WORDS}
      </span>
    </div>
  );
}

// Mini pill chip — wraps gender (read-only) / age / region into a compact,
// single-line row instead of the old label-then-full-width-input stack
// (zadanie-profil-kompakt-emoji-2026-07-24).
// Skryté pole ostáva vo VLASTNOM profile plne editovateľné — len stlmené a s
// preškrtnutým okom, aby si na prvý pohľad videl, čo pack nevidí. Skrývanie sa
// deje až pri čítaní cudzím okom (PublicProfile), nie tu.
function HideWrap({ hidden, children }: { hidden: boolean; children: React.ReactNode }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  if (!hidden) return <>{children}</>;
  return (
    <span
      className="relative inline-flex items-center"
      title={tx('pack.profile.hiddenTooltip', 'Hidden from the pack — only you see this')}
      style={{ opacity: 0.45 }}
    >
      {children}
      <EyeOff className="h-3 w-3" style={{ color: T.inkFaint, marginLeft: 3 }} />
    </span>
  );
}

// D3 — jedno oko na identity riadok. Klik otvorí zoznam skrývateľných polí
// (vek · národnosť · mesto). Zapisuje do human.visibility: 'private' = skryté,
// vymazanie kľúča = späť na default. Počet psov v zozname nie je zámerne.
function IdentityVisibilityEye({
  profile,
  patchHuman,
}: {
  profile: CentralProfile | null;
  patchHuman: (p: Partial<HumanProfile>) => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [open, setOpen] = useState(false);
  const hiddenKeys = HIDEABLE_IDENTITY_FIELDS.filter((f) => isHidden(profile, f.key));
  const anyHidden = hiddenKeys.length > 0;

  const toggle = (key: ProfileFieldKey) => {
    const current = { ...(profile?.human.visibility ?? {}) };
    if (current[key] === 'private') delete current[key];
    else current[key] = 'private';
    patchHuman({ visibility: current });
  };

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={tx('pack.profile.identityVisibilityAria', 'Who sees these details')}
        aria-expanded={open}
        className="pf-hit inline-flex items-center gap-1"
        style={{
          background: anyHidden ? 'rgba(201,154,63,0.10)' : T.bg,
          border: `1px solid ${anyHidden ? 'rgba(201,154,63,0.45)' : T.hairline}`,
          borderRadius: 999,
          padding: '4px 8px',
          color: anyHidden ? T.accentGold : T.inkFaint,
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {anyHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {anyHidden && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
            {hiddenKeys.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop — klik mimo zatvára. Native <select>-y v riadku by inak
              ostali pod otvoreným panelom nedostupné. */}
          <span
            className="fixed inset-0"
            style={{ zIndex: 40 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="absolute"
            style={{
              zIndex: 41,
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 208,
              // Úroveň 4 MATRICE (`PACK_BOX.panel`). `T.card` je PLNÁ farba, nie gradient —
              // CLAUDE.md pred tým výslovne varuje a tu bola použitá ako pozadie panelu.
              ...PACK_BOX.panel,
              padding: 10,
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: T.inkFaint,
                display: 'block',
                marginBottom: 8,
              }}
            >
              {tx('pack.profile.hideFromPack', 'Hide from the pack')}
            </span>
            {HIDEABLE_IDENTITY_FIELDS.map((f) => {
              const off = isHidden(profile, f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggle(f.key)}
                  className="flex items-center gap-2 w-full"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px 4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12.5,
                    color: off ? T.inkFaint : T.ink,
                  }}
                >
                  <span aria-hidden>{f.emoji}</span>
                  <span className="flex-1" style={{ textDecoration: off ? 'line-through' : 'none' }}>
                    {/* Rovnaký text ako placeholder toho poľa v riadku identity — jeden údaj,
                        jedno slovo. `HIDEABLE_IDENTITY_FIELDS` má kľúče `age` / `region`. */}
                    {tx(f.key === 'region' ? 'pack.profile.cityPlaceholder' : 'pack.profile.agePlaceholder', f.labelEN)}
                  </span>
                  {off ? (
                    <EyeOff className="h-3.5 w-3.5" style={{ color: T.accentGold }} />
                  ) : (
                    <Eye className="h-3.5 w-3.5" style={{ color: T.inkFaint }} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </span>
  );
}

function MiniChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="pf-field inline-flex items-center gap-1"
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        color: T.ink,
      }}
    >
      {children}
    </span>
  );
}

// Editable variant — emoji prefix + borderless inline input inside a MiniChip.
function MiniChipInput({
  emoji,
  type = 'text',
  value,
  placeholder,
  width,
  onSave,
}: {
  emoji: string;
  type?: 'text' | 'number';
  value: string | number | undefined;
  placeholder?: string;
  width: number;
  onSave: (v: string) => void;
}) {
  const initial = value == null ? '' : String(value);
  const [local, setLocal] = useState(initial);
  useEffect(() => setLocal(initial), [initial]);
  return (
    <MiniChip>
      <span aria-hidden>{emoji}</span>
      <input
        type={type}
        min={type === 'number' ? 13 : undefined}
        max={type === 'number' ? 120 : undefined}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== initial) onSave(local); }}
        placeholder={placeholder}
        style={{
          width,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: 0,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 11,
        }}
      />
    </MiniChip>
  );
}

// Nationality — flag + short-code pill dropdown (e.g. "🇸🇰 SVK", not the full
// country name — zadanie-profil-shrink-2026-07-24, was full labelEN). Native
// <select>, default 'SK'.
// VŠETKY krajiny sveta (Matej 2026-08-13: „vlajky tu nie su všetky"). Zoznam sa
// nepíše ručne — vlajka sa POČÍTA z ISO2 a názov dodá `Intl.DisplayNames` v aktívnom
// jazyku, viď `lib/countryOptions.ts`. Známe krajiny stoja hore vo vlastnej skupine,
// aby Slovák nescrolloval cez 230 položiek.
// ⚠️ Legacy hodnota `UK` sa zobrazí ako Spojené kráľovstvo, ale uloží sa `GB`.
function NationalitySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { frequent, rest } = countryOptions(lang);
  const selected = value?.toUpperCase() === COUNTRY_OTHER
    ? COUNTRY_OTHER
    : (normalizeCountryValue(value) ?? '');
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="pf-field"
      aria-label={tx('pack.profile.countryAria', 'Country')}
      style={{
        borderRadius: 999,
        padding: '4px 6px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        color: T.ink,
        cursor: 'pointer',
        maxWidth: 200,
      }}
    >
      <optgroup label={tx('pack.profile.countryFrequent', 'Nearby')}>
        {frequent.map((o) => (
          <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
        ))}
      </optgroup>
      <optgroup label={tx('pack.profile.countryAll', 'All countries')}>
        {rest.map((o) => (
          <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
        ))}
        <option value={COUNTRY_OTHER}>🏳️ {tx('pack.profile.countryOther', 'Other')}</option>
      </optgroup>
    </select>
  );
}

// Status (relationship) — ONE pill dropdown instead of separate Single/Taken
// pills (zadanie-profil-shrink-2026-07-24). Empty value = placeholder/clear.
function StatusSelect({
  value,
  onChange,
}: {
  value: RelationshipStatus | undefined;
  onChange: (v: RelationshipStatus | undefined) => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? (e.target.value as RelationshipStatus) : undefined)}
      className="pf-field"
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 11,
        color: value ? T.ink : T.inkFaint,
        cursor: 'pointer',
      }}
    >
      <option value="">{tx('pack.profile.statusPlaceholder', 'Status')}</option>
      {RELATIONSHIP_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.emoji} {tx(`pack.profileTag.${opt.value}`, opt.labelEN)}</option>
      ))}
    </select>
  );
}

// Full-width text input with the same on-blur autosave pattern as WordLimitTextarea
// / MiniChipInput — used for Nickname. Compact sizing (zadanie-profil-shrink-2026-07-24)
// matches the Name input it now sits next to.
function AutoSaveTextInput({
  value,
  onSave,
  placeholder,
  align = 'left',
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  align?: 'left' | 'center';
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { if (local !== value) onSave(local); }}
      placeholder={placeholder}
      className="pf-field pf-field--flat"
      style={{
        width: '100%',
        borderRadius: 8,
        padding: '8px 12px',
        color: T.ink,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 13,
        textAlign: align,
      }}
    />
  );
}

// "Show as: Name / Nickname" — 2-option segment, same visual language as
// VisibilityToggle (dark-fill selected pill inside a hairline pill track).
function DisplayAsToggle({
  value,
  onChange,
}: {
  value: 'name' | 'nickname';
  onChange: (v: 'name' | 'nickname') => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const opts: Array<{ key: 'name' | 'nickname'; label: string }> = [
    { key: 'name', label: tx('pack.profile.name', 'Name') },
    { key: 'nickname', label: tx('pack.profile.nickname', 'Nickname') },
  ];
  /* Matej 2026-08-13: „zobraziť meno/prezývky urob o trošku výraznejšie je to takmer
     neviditeľné a tá pils okolo tú nezarovnaj až po koniec textarea nad ňou".
     Vzhľad je CELÝ v `.pf-toggle` / `.pf-toggle__opt` (packTheme.ts) — inline štýl by
     na mobile prebil media query, ktorá prepínač zmenšuje, aby sa vošiel do karty.
     Modrá (`T.partHek`) tu bola do 12. 8., zrušená spolu so zvyškom modrej v bloku. */
  return (
    <div className="pf-toggle inline-flex items-center" style={{ borderRadius: 999, padding: 3, gap: 3 }}>
      {opts.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          aria-pressed={value === opt.key}
          className={`pf-toggle__opt${value === opt.key ? ' is-on' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}


