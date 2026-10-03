import { useEffect, useState } from 'react';
// ⚠️ lucide, nie hand-drawn kit. Je to VEDOMÁ zhoda s /pack homepage: ten istý
// riadok života tam nesie tú istú iskru. Keď Sparkles dostane kresbu od Mateja,
// vymení sa na oboch miestach naraz, nie tu samostatne.
import { Sparkles } from 'lucide-react';
import { useT } from '@/i18n/LanguageContext';
import { dogPagePath } from '@/lib/dogSlug';
import { track } from '@/lib/analytics';
import { dogShareLink } from '@/lib/useShareCard';
import { ensureDogVisionFilter } from '@/lib/dogVision';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { HandShare } from '@/components/pack/HandIcons';

// ════════════════════════════════════════════════════════════════════════════
// KARTA PSA — JEDNA PRE PLANÉTU AJ STENU (3. 10. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 3. 10. nad hárkom `plany/nakres-karta-steny-2026-10-03/`: *„s návrhmi
// súhlasím"* — stena dostáva tú istú bledú kartu ako planéta, jeden komponent
// pre obe, a na nej tlačidlo POZVI.
//
// Komponent nesie OBSAH a MATERIÁL karty. KDE karta sadne (planéta: bok / stred
// s šípkami · stena: bok na PC / šuplík zdola na mobile) a ako veľká je, rieši
// hostiteľ — preto `.pp-panel` obal aj jeho polohu kreslí on.
//
// POZVI — čo sa zdieľa:
//  · člen → STRÁNKA PSA (`/dog/<meno>-<číslo>`). Náborový kánon z 12. 8. 2026
//    (`lib/refCapture.ts`): kto sa cez CTA na stránke psa pridá, pripíše sa
//    MAJITEĽOVI psa. Stránka má vlastnú OG kartu ⇒ v správe je náhľad s fotkou.
//  · hosť → jeho miesto na stene (`/?dog=<id>`). Stránku psa nemá (nemá číslo).
// Mobil = systémové zdieľanie telefónu, PC = skopírovať odkaz (hárok, bod 3).
// ════════════════════════════════════════════════════════════════════════════

export interface DogCardData {
  /** Kľúč na porovnanie „je to ten istý pes" (id člena / wall_id hosťa). */
  key: string;
  name: string;
  /** Poradové číslo člena; hosť ho nemá. */
  n: number | null;
  /** Id hosťa — cieľ odkazu `/?dog=` a žiadosti o odkaz na pokladňu. */
  wallId: string | null;
  /** Väčšia fotka — dlaždicových 160 px je v karte rozmazaných. */
  photo: string;
  heroglyph: string;
  message: string;
  birthDate: string | null;
  /** Pes bez člena (€0) — fotka v psej optike, bez DOG PAGE, hlavná akcia PRIDAJ SA. */
  guest?: boolean;
  /** Riadok pod odkazom (hosť / čaká na AINUBISA). */
  status?: string;
}

/**
 * Prežité dni z dátumu narodenia. Zámerne to isté, čo počíta stránka psa
 * (`computeAge().totalDays` v pages/DogShare.tsx) — dve rôzne čísla pre ten istý
 * údaj na dvoch povrchoch je chyba, ktorá sa nájde až keď si ich niekto porovná.
 */
export function dniZivota(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const dni = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  return dni >= 0 ? dni : null;
}

/** Kam POZVI vedie. `null` = nie je čo zdieľať (fixtúra bez čísla aj id).
 *  Člen ide cez `dogShareLink` — ten istý odkaz ako zdieľanie share karty
 *  (`?ref=<číslo>` + utm), len s vlastným `utm_medium`, nech sa dá odlíšiť. */
export function inviteUrl(d: DogCardData, where: 'planet' | 'wall'): string | null {
  if (!d.guest && d.n != null && d.name) return dogShareLink(d.n, `${where}-invite`, d.name);
  if (d.wallId) return `https://dogypt.com/?dog=${encodeURIComponent(d.wallId)}`;
  return null;
}

type Props = {
  dog: DogCardData;
  /** Povrch — len pre analytiku (`dog_invite`). */
  where: 'planet' | 'wall';
  /** Kam ide žiadosť hosťa o odkaz (zapisuje ⇒ nikdy natvrdo LIVE v deve). */
  edgeBase?: string;
  anonKey?: string;
};

/** Obsah `.pp-panel` — fotka s pečaťou · meno · život · heroglyf · odkaz · akcie. */
export function DogCardBody({ dog, where, edgeBase, anonKey }: Props) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => { if (dog.guest) ensureDogVisionFilter(); }, [dog.guest]);
  // Iný pes = iná karta: rozbalený formulár aj „skopírované" patrili predošlému.
  useEffect(() => { setCopied(false); setJoinOpen(false); setEmail(''); setSendState('idle'); }, [dog.key]);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  const url = inviteUrl(dog, where);
  const days = dniZivota(dog.birthDate);

  const invite = async () => {
    if (!url) return;
    const text = t('wall.inviteText', { name: dog.name });
    // Systémové zdieľanie LEN na dotykovom zariadení — na PC (aj Mac, kde
    // navigator.share existuje) hárok predpisuje skopírovanie odkazu.
    const touch = window.matchMedia?.('(pointer: coarse)').matches;
    let how: 'share' | 'copy' | 'cancel' = 'copy';
    if (touch && typeof navigator.share === 'function') {
      try { await navigator.share({ title: `${dog.name} · DOGYPT`, text, url }); how = 'share'; }
      catch { how = 'cancel'; }
    } else {
      try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); }
      catch { how = 'cancel'; }
    }
    track('dog_invite', { where, how, guest: !!dog.guest, ...(dog.n != null ? { pack_number: dog.n } : {}) });
  };

  const send = async () => {
    if (!dog.wallId || !edgeBase || !anonKey || !email.includes('@') || sendState !== 'idle') return;
    setSendState('sending');
    try {
      await fetch(`${edgeBase}/send-guest-mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({ kind: 'resend', dogId: dog.wallId, email: email.trim() }),
      });
    } catch { /* odpoveď nič neprezradí — veta je vždy rovnaká (wallSearch.tsx) */ }
    setSendState('sent');
  };

  const inviteBtn = url && (
    <button type="button" className={`pp-act ${dog.guest ? 'pp-act--out' : 'pp-act--cta'}`} onClick={invite}>
      <HandShare size={16} />
      {copied ? t('wall.inviteCopied') : t('wall.invite')}
    </button>
  );

  return (
    <>
      <div className="pp-photo-wrap">
        <img className={`pp-photo${dog.guest ? ' is-vision' : ''}`} src={dog.photo} alt="" draggable={false} />
        {/* Poradové číslo ako PEČAŤ na spodnej hrane fotky — tá istá dvojica
            fotka+číslo, akú človek pozná z dlaždice v stene. */}
        {dog.n != null && !dog.guest && <span className="pp-seal">#{dog.n}</span>}
      </div>
      <div className="pp-name">{dog.name}</div>
      {/* ŽIVOT PSA V JEDNOM RIADKU — `LifeLine` z /pack homepage. Bez dátumu
          narodenia sa riadok nezobrazí: vymyslené číslo by sa tvárilo ako údaj. */}
      {days !== null && (
        <div className="pp-life">
          <span className="pp-life-label">
            <Sparkles className="pp-life-spark" aria-hidden />
            {t('pack.dog.livingBestLife')}
          </span>
          <span className="pp-days">{t('dogPage.daysCount', { days: days.toLocaleString('en-US') })}</span>
        </div>
      )}
      <div className="pp-rule" />
      {dog.heroglyph && <img className="pp-glyph" src={dog.heroglyph} alt="" draggable={false} />}
      {dog.message && <p className="pp-msg">{dog.message}</p>}
      {dog.status && <p className="pp-status">{dog.status}</p>}

      {dog.guest && joinOpen ? (
        <div className="pp-join">
          {sendState === 'sent' ? (
            <p className="pp-sent">{t('wall.search.sent')}</p>
          ) : (
            <>
              <p className="pp-status">{t('wall.search.joinHint')}</p>
              <input
                className="pp-mail"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                value={email}
                placeholder={t('wall.search.emailPh')}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') send(); }}
              />
              <button type="button" className="pp-act pp-act--cta" disabled={!email.includes('@') || sendState !== 'idle'} onClick={send}>
                {t('wall.search.send')}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="pp-acts">
          {dog.guest ? (
            <>
              {inviteBtn}
              {dog.wallId && edgeBase && (
                <button type="button" className="pp-act pp-act--cta" onClick={() => setJoinOpen(true)}>
                  {t('wall.search.join')}
                </button>
              )}
            </>
          ) : (
            <>
              {dog.n != null && dog.name && (
                <a className="pp-act pp-act--out" href={dogPagePath(dog.name, dog.n)}>{t('wall.dogPage')}</a>
              )}
              {inviteBtn}
            </>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Obsah a materiál karty. Polohu, šírku a veľkosti podľa povrchu dopisuje
 * hostiteľ (`.planet-root .pp-*`, `.dc-wall .pp-*`).
 * ⚠️ Materiál je PODOBA „SVETLÁ" z planéty (vybratá 25. 8.: „karty daj svetlý") —
 *    slonovina svetlejšia než stena + zlaté halo. Ostatné podoby (karta, piesok,
 *    papyrus, noc) ostali v DogPlanetLab.tsx ako dielňa.
 */
export const DOG_CARD_CSS = `
.pp-panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 34px 38px 36px;
  border-radius: 16px;
}
.pp-svetla {
  color: #2a1608;
  background: linear-gradient(160deg, #FFFEFA 0%, #FFF9EC 52%, #FBF0D8 100%);
  border: 1.5px solid #C99A3F;
  box-shadow:
    0 0 0 5px rgba(201,154,63,0.16),
    0 28px 62px -18px rgba(70,46,12,0.55),
    inset 0 1px 0 #FFFFFF;
}
.pp-svetla .pp-rule { background: rgba(201,154,63,0.45); }

.pp-photo {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(201,154,63,0.85);
  box-shadow: 0 6px 18px -6px rgba(70,46,12,0.5);
}
.pp-photo.is-vision { filter: url(#dogypt-dog-vision); }
.pp-name {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.2;
}
.pp-rule {
  height: 1px;
  width: 100%;
  background: rgba(201,154,63,0.35);
  flex-shrink: 0;
}
/* HEROGLYF NA SVETLOM JE ČIERNY, nie zlatý so žiarou — brightness(0) drží alfa
   kanál, takže z bieleho glyfu spraví čistý atrament. */
.pp-glyph {
  width: 62%;
  max-width: 190px;
  height: auto;
  display: block;
  flex-shrink: 0;
  pointer-events: none;
  filter: brightness(0) drop-shadow(0 2px 8px rgba(80,55,15,0.18));
}
.pp-msg {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 300;
  font-size: 0.75rem;
  color: rgba(26,26,26,0.7);
  text-align: center;
  line-height: 1.6;
  font-style: italic;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 10;
  overflow: hidden;
}
.pp-status {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(42,22,8,0.62);
  text-align: center;
}

/* FOTKA S PEČAŤOU — nosič je inline-block, inak by sa roztiahol na šírku karty
   a „stred" by prestal byť stredom fotky. */
.pp-photo-wrap {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  line-height: 0;
}
.pp-seal {
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 0.86rem;
  line-height: 1.1;
  letter-spacing: 0.02em;
  /* LAPIS (Matej 28. 9. 2026) — to isté číslo ako odznak #1 na homepage. */
  color: ${LAPIS.ink};
  background: ${LAPIS.grad};
  border: 1.5px solid #FFF8E4;
  border-radius: 999px;
  padding: 3px 12px;
  white-space: nowrap;
  box-shadow: 0 4px 12px -3px rgba(70,46,12,0.6);
}

/* ŽIVOT PSA — jeden riadok, text VEDĽA pilulky; flex-wrap je poistka pre dlhé
   preklady. Pilulka dní = LAPIS naprieč appkou (lock 12. 9.). */
.pp-life {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 8px;
}
.pp-life-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8C6014;
}
.pp-life-spark { width: 13px; height: 13px; color: #C99A3F; flex-shrink: 0; }
.pp-days {
  padding: 4px 13px;
  border-radius: 999px;
  background: ${LAPIS.grad};
  color: ${LAPIS.ink};
  font-family: 'Cinzel', serif;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.1;
  white-space: nowrap;
  border: none;
  box-shadow: ${LAPIS_BTN_SHADOW};
}

/* ── AKCIE ──────────────────────────────────────────────────────────────
   Na bledom = LAPIS. Plná plocha len pre JEDNU akciu na karte (člen: POZVI ·
   hosť: PRIDAJ SA), druhá je obrys. Tvar = CTA 8 px, nie pilulka. */
.pp-acts {
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
  margin-top: 4px;
  flex-shrink: 0;
}
.pp-act {
  flex: 1 1 0;
  max-width: 200px;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: box-shadow 200ms ease, background 200ms ease;
}
.pp-act--out {
  color: ${LAPIS.edge};
  background: rgba(255,250,236,0.62);
  border: 1px solid ${LAPIS.edge};
}
.pp-act--out:hover { background: ${LAPIS.fill}; box-shadow: 0 0 12px ${LAPIS.halo}; }
.pp-act--cta {
  color: ${LAPIS.ink};
  background: ${LAPIS.grad};
  border: 1px solid ${LAPIS.edge};
  box-shadow: ${LAPIS_BTN_SHADOW};
}
.pp-act--cta:hover { background: ${LAPIS.gradHover}; }
.pp-act:disabled { opacity: 0.45; cursor: default; }

.pp-join { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
.pp-join .pp-act { max-width: none; width: 100%; }
.pp-mail {
  height: 44px; width: 100%; box-sizing: border-box; border-radius: 12px; padding: 0 12px;
  border: 1.5px solid ${LAPIS.edge}; background: #fff; color: rgba(0,0,0,0.82);
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; outline: none;
}
.pp-sent {
  margin: 0; padding: 8px 12px; border-radius: 12px;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.4; text-align: center;
  color: #2E5C3B; background: rgba(61,122,78,0.12); border: 1px solid rgba(61,122,78,0.4);
}
`;
