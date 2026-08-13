import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
// `Check` ostáva lucide — systémové potvrdenie, nie brandový prvok.
import { HandClipboard, HandStar } from './HandIcons';
import { BrandIcon } from './BrandIcon';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';
import { track } from '@/lib/analytics';
import { shareDog, downloadCard } from '@/lib/useShareCard';
import { dogPagePath } from '@/lib/dogSlug';
import { FONT_TITLE, FONT_UI, PILL_CSS } from './packTheme';

const APP_ORIGIN = 'https://dogypt.com';

// ─────────────────────────────────────────────────────────────────────────────
// ROZŠÍR SVORKU — posledný blok homepage `/pack`. Od 2026-08-12 je to JEDEN gradientový
// blok o dvoch poloviciach (Matej: „rozdel tento gradient blok na 2 časti… týmto krokom
// zlúčime blok 7-8 do jedného"):
//
//   ĽAVÁ  = share karta psa + zdieľanie (native / FB / WhatsApp / kópia / stiahnutie)
//           + odkaz na WALL. Toto je celý obsah bývalej sekcie `PackShareCard`.
//   PRAVÁ = AFFILIATE — RÝCHLY STAV: BONES, dve úrovne línie, čistý odkaz na psa
//           a preklik do profilu. Nič, čo treba čítať — homepage informuje a zdieľa.
//
// ČO ODIŠLO A PREČO (nemazať späť bez Mateja):
//   · FOTKA HEKTHORA nad nadpisom → Matej: „Zmaž foto hektora". Miesto zabrala share
//     karta vľavo, ktorá ukazuje TVOJHO psa — silnejší dôvod zdieľať než cudzí pes.
//   · Zadná strana karty „(?) TRANSPARENCY" (celoplošný flip) → rozpad €11 odišiel
//     CELÝ do `TransparentStats` v bloku nad týmto (Matej 12.8.: „ten rozpad 11 eur sa
//     hodí skôr do bloku nad týmto"). Pás 11 dielov aj poznámky (`noteKey`) tam žijú
//     pri POKLADNICI, teda pri číslach, ktoré ten pomer napĺňajú. Sem sa nevracia —
//     boli by to dva rozpady tej istej jedenástky na jednej stránke.
//   · PILULKA „(i) TVOJA LÍNIA" + jej explainer levelov → `/pack/profile#network`
//     (Matej 12.8.: „na homepage bude len rýchla info o stave a možnosti zdielať").
//     Vysvetlenie stojí pri dátach, ktoré vysvetľuje; dve miesta = dve pravdy.
//   · `PackShareCard.tsx` sa NEMAZAL — parkuje ako `PackTree`/`DailyPrayers`; keby sa
//     zdieľanie niekedy vrátilo ako samostatná sekcia, komponent je pripravený.
//
// ⚠️ `Pack.tsx` už `PackShareCard` NEMOUNTUJE. Keby sa vrátil, zdieľanie by bolo na
//    homepage dvakrát pod sebou.
// ⚠️ JEDNA hranica mobil/desktop = 721 px, rovnako ako `Gateways`/`TripSpotlight`.
// ─────────────────────────────────────────────────────────────────────────────

interface Affiliate {
  code: string;
  points: number;
  referral_count: number;
  // Two-level split — backend may not return these yet (prepared for the network map).
  referral_count_l1?: number;
  referral_count_l2?: number;
}

/** Kotva bloku „ŠÍR TO ĎALEJ" — z popupu BONES v `HeroCard` sa naň skroluje.
 *  JEDEN zdroj pravdy: id patrí tomuto bloku, nie stránke, ktorá ho mountuje. */
export const INVITE_ANCHOR_ID = 'pack-invite';

interface FounderInviteProps {
  /** Primárny pes majiteľa — jeho share karta stojí v ľavej polovici. */
  dogName: string | null;
  packNumber: number | null;
  /** `null` = karta sa ešte negeneruje (starší pes bez backfillu) → miesto tlačidiel hláška. */
  shareCardUrl: string | null;
}

// ⚠️ Template literal — spätný apostrof v komentári vnútri zhodí build a tsc to nechytí.
const CSS = `
.fi-grid{ display:grid; grid-template-columns:1fr; gap:22px; }
.fi-right{ padding-top:22px; border-top:1px solid rgba(245,199,61,0.22); }
@media (min-width:721px){
  .fi-grid{ grid-template-columns:1fr 1fr; gap:28px; }
  .fi-right{ padding-top:0; border-top:0; padding-left:28px; border-left:1px solid rgba(245,199,61,0.22); }
  /* Obsah pravej polovice sa centruje ZVISLE voči karte psa vľavo (Matej 13.8.:
     „obsah z pravej strany gradient bloku centrovať"). Karta psa je vyššia než stĺpec
     s BONES, takže bez tohto visel obsah pri hornej hrane a pod ním ostávala diera.
     Vodorovné centrovanie rieši utility trieda items-center v JSX, toto je druhá os.
     Platí LEN v dvojstĺpcovom režime — pod 721 px sú bloky pod sebou a centrovať
     nie je voči čomu. */
  .fi-right{ justify-content:center; }
}
.fi-h{
  font-family:${FONT_TITLE}; font-weight:700; font-size:clamp(16px,3.2vw,19px); line-height:1.25;
  letter-spacing:0.06em; text-transform:uppercase; color:hsl(45 95% 92%); margin:0;
}
/* Rad tlačidiel = CELÁ šírka karty v ROVNAKÝCH dieloch. Nezalamuje sa ani na mobile:
   tri krátke slová sa do 300 px zmestia a zalomený rad by vyzeral ako tri rôzne akcie. */
.fi-row{ display:flex; gap:8px; width:100%; }
.fi-btn{
  flex:1 1 0; min-width:0;
  display:inline-flex; align-items:center; justify-content:center; gap:7px;
  padding:12px 6px; border-radius:8px; text-decoration:none; cursor:pointer;
  font-family:${FONT_TITLE}; font-size:10.5px; letter-spacing:0.1em; text-transform:uppercase;
  white-space:nowrap;
  transition:background .18s ease, border-color .18s ease;
}
/* .btn-gold (brand manuál v3.2 — LOCKED): gradient, radius 8, papyrusový okraj. */
.fi-btn-gold{
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30); color:#000; font-weight:700;
  box-shadow:0 0 28px rgba(230,158,26,0.34), inset 0 1px 0 rgba(255,255,255,0.3);
}
.fi-btn-ghost{
  background:transparent; border:1px solid rgba(245,199,61,0.45);
  color:hsl(45 95% 90%); font-weight:700;
}
.fi-btn-ghost:hover{ background:rgba(245,199,61,0.14); border-color:hsl(45 80% 60%); }
/* Pilulka „ZOBRAZIŤ SIEŤ" — jediná akcia pod tromi číslami; vedie do profilu. */
/* Pilulka = primitív .pk-pill v tmavej variante (packTheme.ts). Tu ostal len font —
   okraj, radius aj hover má spoločné s pilulkami na papyruse, aby homepage nemala dve
   rôzne pilulky vedľa seba. */
.fi-pill{
  font-family:${FONT_UI}; font-size:10.5px; font-weight:500;
  letter-spacing:0.08em; text-transform:uppercase; text-decoration:none;
}
`;

export function FounderInvite({ dogName, packNumber, shareCardUrl }: FounderInviteProps) {
  const t = useT();
  const [aff, setAff] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<'share' | 'download' | null>(null);

  const name = dogName || 'Dogyptian';

  useEffect(() => {
    let mounted = true;
    supabase
      .rpc('get_or_create_my_affiliate')
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('get_or_create_my_affiliate failed:', error.message);
        } else if (data && data[0]) {
          setAff(data[0] as Affiliate);
        }
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // ⚠️ ČISTÝ ODKAZ = STRÁNKA PSA, nie `?ref=<kód>` (dogpage kánon, Matej 12.8.2026:
  // „dogpage by bola fajn referal stránka"). Každý člen má psa, takže holý affiliate
  // odkaz nemal komu slúžiť — a stránka s fotkou, menom a pozvánkou presvedčí viac
  // než kód v URL. Affiliate kód NEZANIKOL: ostáva identitou účtu, na ktorý sa
  // pripisujú BONES, a staré rozposlané `?ref=` odkazy fungujú ďalej.
  // ⚠️ Atribúcia NEVZNIKÁ otvorením stránky — až keď návštevník klikne na CTA
  // „Pridaj sa" (Matej 12.8.: „ľudia si len čítajú odkazy majiteľov"). Vtedy sa
  // uloží pack číslo a backend (`resolve_ref_code`) ho preloží na majiteľa.
  const link = packNumber ? `${APP_ORIGIN}${dogPagePath(dogName, packNumber)}` : '';

  // Two-level network counts. referral_count = direct (Level 1) until the backend
  // splits levels; Level 2 (their brings) stays 0 until the network map ships.
  const level1 = aff?.referral_count_l1 ?? aff?.referral_count ?? 0;
  const level2 = aff?.referral_count_l2 ?? 0;

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      track('referral_link_copied');
      toast(t('pack.invite.toastLinkCopied'), { description: t('pack.invite.toastLinkCopiedDesc') });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast(t('pack.invite.toastCouldNotCopy'), { description: link });
    }
  };

  // ── Zdieľanie SHARE KARTY psa (prebraté z `PackShareCard` bez zmeny logiky) ──
  // Zdieľa sa LINK na psa, ktorého OG obrázok je share karta — príjemca tak pristane
  // na stránke, nie na holom súbore s obrázkom.
  const handleCardShare = async () => {
    if (!shareCardUrl || !packNumber || busy) return;
    setBusy('share');
    try {
      const shareText = t('share.dogVoice', { dog: name.toUpperCase() });
      const result = await shareDog({
        pack: packNumber,
        dogName: name,
        imageUrl: shareCardUrl,
        channel: 'native',
        shareText,
      });
      track('share_clicked', { channel: result, type: 'sharecard', location: 'pack' });
      if (result === 'copied') toast(t('sharecard.linkCopied'));
    } catch (err) {
      // NIE `sharecard.saved` — to je hláška úspechu. Zlyhané zdieľanie hlásilo „Karta
      // uložená" a chybu dávalo len do popisku pod ňou (Matej 2026-08-12).
      toast(t('sharecard.failed'), { description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusy(null);
    }
  };

  const handleCardDownload = async () => {
    if (!shareCardUrl || busy) return;
    setBusy('download');
    try {
      await downloadCard({ imageUrl: shareCardUrl, dogName: name });
      track('share_clicked', { channel: 'download', type: 'sharecard', location: 'pack' });
      toast(t('sharecard.saved'));
    } catch (err) {
      toast(t('sharecard.failed'), { description: err instanceof Error ? err.message : undefined });
    } finally {
      setBusy(null);
    }
  };

  // WALL deep-link — `/?focus=N` zaostrí mriežku na psa #N (obsluhuje `GodsGrid.tsx`).
  // Bez čísla psa vedie odkaz na WALL bez zaostrenia, nie do prázdna.
  const wallHref = packNumber ? `/?focus=${packNumber}` : '/';

  return (
    <section
      id={INVITE_ANCHOR_ID}
      className="pack-card-hover w-full"
      style={{
        scrollMarginTop: 24,
        background: 'var(--brand-gradient)',
        // Hrúbka okraja = 1.5px ako každý iný blok homepage (Matej 12.8.: „hrúbky okrajov
        // nesedia"). Karta ostáva TMAVÁ — to je jeho rozhodnutie z toho istého dňa.
        border: '1.5px solid rgba(201,154,63,0.34)',
        borderRadius: 16,
        padding: '28px 24px',
        boxShadow: '0 24px 55px -28px rgba(31, 26, 14, 0.45)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{PILL_CSS}</style>
      <style>{CSS}</style>

      {/* soft glow top-right */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 88% 0%, rgba(245,199,61,0.30) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      <div className="fi-grid relative">
        {/* ── ĽAVÁ POLOVICA — share karta psa + zdieľanie + WALL ──────────────── */}
        <div className="flex flex-col items-center text-center gap-4">
          <h3 className="fi-h">{t('sharecard.shareTitle', { name })}</h3>

          {shareCardUrl ? (
            <div
              style={{
                width: '100%',
                maxWidth: 360,
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid rgba(245,199,61,0.32)',
                background: '#000',
                boxShadow: '0 18px 44px -22px rgba(0,0,0,0.8)',
              }}
            >
              <img
                src={shareCardUrl}
                alt={t('sharecard.shareTitle', { name })}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          ) : (
            <p
              style={{
                fontFamily: FONT_UI,
                fontSize: 13,
                color: 'hsl(45 40% 88% / 0.8)',
                margin: 0,
              }}
            >
              {t('sharecard.preparing')}
            </p>
          )}

          {/* TRI tlačidlá, rovnaké diely na šírku karty (Matej 12.8.: „ponechajme zdielať
              stiahnuť a wall = iba tri tlačítka"). Kolieska FB / WhatsApp / kópia odišli —
              robili to isté, čo systémové share menu, ktoré otvorí ZDIEĽAŤ.
              ⚠️ Rad stojí MIMO podmienky na share kartu: bez nej sa prvé dve stmavia, ale
              WALL ostáva funkčný — inak by pes bez vygenerovanej karty stratil aj mriežku. */}
          <div className="fi-row" style={{ maxWidth: 360 }}>
            <button
              type="button"
              onClick={handleCardShare}
              disabled={!shareCardUrl || busy !== null}
              className="fi-btn fi-btn-gold"
              style={{ opacity: !shareCardUrl || busy !== null ? 0.55 : 1 }}
            >
              <BrandIcon name="link" size={14} tint="dark" />
              {t('sharecard.shareButton')}
            </button>

            <button
              type="button"
              onClick={handleCardDownload}
              disabled={!shareCardUrl || busy !== null}
              className="fi-btn fi-btn-ghost"
              style={{ opacity: !shareCardUrl || busy !== null ? 0.55 : 1 }}
            >
              <BrandIcon name="document" size={14} tint="gold" />
              {t('sharecard.download')}
            </button>

            {/* Popis s číslom psa nesie title/aria — do tlačidla sa v rade troch nezmestí. */}
            <a
              className="fi-btn fi-btn-ghost"
              href={wallHref}
              title={t('pack.dog.viewOnWall', { certNumber: packNumber ? `#${packNumber}` : '' })}
              aria-label={t('pack.dog.viewOnWall', { certNumber: packNumber ? `#${packNumber}` : '' })}
            >
              <BrandIcon name="world-grid" size={14} tint="gold" />
              WALL
            </a>
          </div>
        </div>

        {/* ── PRAVÁ POLOVICA — AFFILIATE: rýchly stav + odkaz + preklik do profilu ── */}
        <div className="fi-right flex flex-col items-center text-center gap-4">
          <div>
            <h3 className="fi-h" style={{ marginBottom: 8 }}>{t('pack.invite.heading')}</h3>
            <p
              style={{
                fontFamily: FONT_UI,
                fontSize: 13,
                lineHeight: 1.55,
                color: 'hsl(45 40% 90% / 0.9)',
                margin: 0,
              }}
            >
              {t('pack.invite.bodyPart1')}{' '}
              {/* `<strong>` dedí weight 700, Space Grotesk je načítaný len 300–600 ⇒ prehliadač
                  tučnosť domýšľa (fake bold). Sémantika ostáva, váhu držíme na strope 600. */}
              <strong style={{ color: 'hsl(45 95% 88%)', fontWeight: 600 }}>BONES</strong>
              {t('pack.invite.bodyPart2')}
            </p>
          </div>

          {/* Network stats — Points · Level 1 · Level 2 (your whole tree) */}
          <div className="grid grid-cols-3 gap-2 w-full" style={{ maxWidth: 360 }}>
            <StatTile
              value={loading ? '—' : (aff?.points ?? 0).toLocaleString('en-US')}
              label="BONES"
              highlight
            />
            <StatTile value={loading ? '—' : String(level1)} label={t('pack.invite.statLevel1')} sub={t('pack.invite.statLevel1Sub')} />
            <StatTile value={loading ? '—' : String(level2)} label={t('pack.invite.statLevel2')} sub={t('pack.invite.statLevel2Sub')} />
          </div>

          {/* ZOBRAZIŤ SIEŤ = PREKLIK DO PROFILU, nie popup (Matej 12.8.2026: „premserovanie
              na /profil na 2 blok kde budeme centralizovať tieto info aby sme ich nemali na
              viacerých miestach… na homepage bude len rýchla info o stave a možnosti zdielať").
              Zoznam ľudí (meno, pes, dátum, BONES) aj vysvetlenie úrovní žijú v `PackNetwork`
              na `/pack/profile#network`. S tým odišla aj pilulka „(i) TVOJA LÍNIA" —
              vysvetľovač je tam, kde sú dáta. Sem sa nevracajú ani jedno. */}
          <Link
            to="/pack/profile#network"
            aria-label={t('pack.invite.ariaViewNetwork')}
            className="pk-pill pk-pill--dark pk-pill--tap fi-pill"
          >
            {/* PORT symbol (Matej 12.8.2026) — uzol vetviaci sa na tri, teda presne to, čo
                odkaz otvára. Zdroj: ručne kreslený set `vstupy/vizualna-identita/Icons hand
                drawn/port-hand-drawn-symbol-svgrepo-com.svg`, skopírovaný do
                `public/icons/pack/port.svg` — `BrandIcon` číta VÝHRADNE z tohto adresára
                a rieši aj zlaté tónovanie.
                ⚠️ NIE `nav-portal.svg` (glóbus s lupou) — to je ikona sekcie PORTÁL, iná vec. */}
            <BrandIcon name="port" size={15} tint="gold" />
            {t('pack.invite.viewNetwork')}
          </Link>

          {/* ── ČISTÝ ODKAZ — už len KOPÍROVAŤ, žiadne druhé zdieľanie ──────────
              Matej 12.8.: „na pravej strane je referal aj zdielat odkaz a to isté je
              aj naľavo… musíme konsolidovať". Tlačidlo „Zdieľaj svoj odkaz" tu robilo
              presne to, čo zlaté ZDIEĽAŤ vľavo, len bez psa. Ostal jeden riadok na
              vloženie odkazu tam, kde sa obrázok psa nehodí: IG bio, QR, podpis mailu.
              ⚠️ Je to odkaz na STRÁNKU PSA, nie `?ref=` — viď poznámka pri `link`. */}
          <div className="w-full" style={{ maxWidth: 360 }}>
            <div
              className="flex items-center gap-1"
              style={{
                background: 'rgba(0,0,0,0.28)',
                border: '1px solid rgba(245,199,61,0.32)',
                borderRadius: 10,
                padding: '4px 4px 4px 12px',
              }}
            >
              <span
                className="flex-1 truncate text-left"
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 12.5,
                  color: 'hsl(45 60% 92%)',
                  letterSpacing: '0.01em',
                }}
              >
                {link ? link.replace(/^https?:\/\//, '') : t('pack.invite.generatingLink')}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!link}
                aria-label={t('pack.invite.ariaCopyLink')}
                className="inline-flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(to right, hsl(45 92% 62%), hsl(45 96% 52%))',
                  border: 'none',
                  borderRadius: 8,
                  color: '#1F1A0E',
                  width: 38,
                  height: 34,
                  cursor: link ? 'pointer' : 'default',
                  opacity: link ? 1 : 0.5,
                  boxShadow: '0 6px 16px -8px rgba(0,0,0,0.6)',
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <HandClipboard size={16} />}
              </button>
            </div>
            <p
              style={{
                fontFamily: FONT_UI,
                fontSize: 10.5,
                lineHeight: 1.4,
                color: 'hsl(45 30% 84% / 0.6)',
                margin: '7px 0 0',
              }}
            >
              {t('pack.invite.cleanLinkNote')}
            </p>
          </div>

          <div
            className="inline-flex items-center gap-1.5"
            style={{
              fontFamily: FONT_UI,
              fontSize: 11,
              color: 'hsl(45 40% 88% / 0.7)',
            }}
          >
            <HandStar size={12} />
            {t('pack.invite.rewardsNote')}
          </div>
        </div>
      </div>

    </section>
  );
}

// Tri bloky = ČÍSLA, ktoré má člen vidieť ako prvé (Matej 12.8.: „tie tri bloky vedľa seba
// musia byť viac výrazné, počet bones a počet ľudí"). Predtým mali rovnakú váhu ako popiska
// pod nimi: 22px Cinzel na takmer neviditeľnom podklade. Teraz nesú zlatý rám, tmavšiu
// výplň a číslo je clamp(26–34) — popiska ostala malá zámerne, aby číslo dominovalo.
// ⚠️ Číslo = DÁTA → Space Grotesk, STROP váhy 600 (načítané sú len 300–600).
function StatTile({
  value,
  label,
  sub,
  highlight,
}: {
  value: string;
  label: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        background: highlight
          ? 'linear-gradient(180deg, rgba(245,199,61,0.26) 0%, rgba(245,199,61,0.08) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0.18) 100%)',
        border: `1px solid ${highlight ? 'rgba(245,199,61,0.62)' : 'rgba(245,199,61,0.34)'}`,
        borderRadius: 10,
        padding: '14px 6px 12px',
        boxShadow: highlight
          ? '0 10px 26px -16px rgba(245,199,61,0.75), inset 0 1px 0 rgba(255,246,226,0.22)'
          : 'inset 0 1px 0 rgba(255,246,226,0.12)',
      }}
    >
      <span
        style={{
          fontFamily: FONT_UI,
          fontSize: 'clamp(26px, 5.4vw, 34px)',
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: highlight ? 'hsl(45 96% 76%)' : 'hsl(45 92% 94%)',
          textShadow: highlight ? '0 2px 14px rgba(245,199,61,0.45)' : 'none',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: FONT_UI,
          fontSize: 9.5,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'hsl(45 40% 88% / 0.78)',
          marginTop: 5,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: FONT_UI,
            fontSize: 8.5,
            color: 'hsl(45 35% 86% / 0.5)',
            marginTop: 2,
            textAlign: 'center',
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
