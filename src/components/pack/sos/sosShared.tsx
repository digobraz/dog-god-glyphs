// SOS — stratený pes: spoločné diely obrazoviek (hook textov, hook „moja strata“, CSS, škatuľky).
// Backend volá VÝHRADNE `lib/sos.ts`. Texty: `sosTexts.ts` (zdroj) → slovníky `pack.sos.*`.
//
// 🔴 ČERVENÁ JE LEN SOS (`PACK_THEME.sosRed*`, Matej 4. 11. 2026) · NAŠIEL SA = zelená SPLNENÉ (`growGreen`).
// 🔴 TELEFÓN MAJITEĽA sa nikdy nevykresľuje ihneď — len po ťuku cez `lostPhone` (alebo je to MOJA strata → `sosMine`).
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { supabase } from '@/integrations/supabase/client';
import { lostPublic, sosMineBySlug, type LostPublic, type SosMine } from '@/lib/sos';
import { canStepBack } from '@/lib/stepBack';
import { localizeBreed } from '@/lib/breedDisplay';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PAGE_AIR, PACK_TOPROW, PACK_TOPROW_PAD, PACK_SHADOW,
  PAPER_PAGE_CSS, PILL_CSS, PF_FIELD_CSS, PAPER_ROUTES_EXTRA, BRAND_GOLD_BTN,
} from '@/components/pack/packTheme';
import { FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { SOS_TEXTS, type SosKey } from './sosTexts';

// ── ŠAT: celý strom `/pack/sos` stojí na hladkom papyruse (kôš 2 aj 3) ────────────────────
export const SOS_PAPER = /^\/pack\/sos(\/|$)/;
if (!PAPER_ROUTES_EXTRA.some((r) => r.source === SOS_PAPER.source)) PAPER_ROUTES_EXTRA.push(SOS_PAPER);

export const sosPath = {
  new: '/pack/sos/new',
  page: (slug: string) => `/pack/sos/${slug}`,
  flyer: (slug: string) => `/pack/sos/${slug}/letak`,
  plan: (slug: string) => `/pack/sos/${slug}/plan`,
};

// ── TEXTY ─────────────────────────────────────────────────────────────────────────────────
const interpolate = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, n) => (n in vars ? String(vars[n]) : m)) : s;

export type SosT = (key: SosKey, vars?: Record<string, string | number>) => string;

/** Slovník prebíja; EN z `sosTexts.ts` je poistka, keď kus s textami appky ešte nedoletel. */
export function useSosT(dogGender?: string | null): SosT {
  const t = useT();
  const fem = dogGender === 'queen';
  return useCallback((key, vars) => {
    const f = `${key}.f`;
    const k = (fem && f in SOS_TEXTS ? f : key) as SosKey;
    const v = t(k, vars);
    return v !== k ? v : interpolate(SOS_TEXTS[k].en, vars);
  }, [t, fem]);
}

/** Čísla s tvarom podľa jazyka: 1 deň · 3 dni · 5 dní (sk, cs) / 1 day · 3 days (en). Slovo je v slovníku (`pack.sos.n.*`), tu je len výber tvaru. */
export function useSosCount() {
  const { lang } = useLang();
  const s = useSosT();
  const cat = useCallback((n: number): 'one' | 'few' | 'many' => {
    if (n === 1) return 'one';
    if (lang === 'sk' || lang === 'cs') return n >= 2 && n <= 4 ? 'few' : 'many';
    return 'many';
  }, [lang]);
  return useMemo(() => ({
    days: (n: number) => s(`pack.sos.n.days.${cat(n)}` as SosKey, { n }),
    /** „po 3 dňoch“ (lokál): 1 → „1 dni“, inak „dňoch“. */
    daysAfter: (n: number) => s(`pack.sos.n.daysAfter.${n === 1 ? 'one' : 'other'}` as SosKey, { n }),
    shares: (n: number) => s(`pack.sos.n.shares.${cat(n)}` as SosKey, { n }),
    alerted: (n: number) => s('pack.sos.n.alerted', { n }),
  }), [s, cat]);
}

/** „4. 11. 2026 o 15:40“ — dátum a čas v jazyku rozhrania. */
export function useWhen(): (iso: string | Date) => string {
  const { lang } = useLang();
  const s = useSosT();
  return useCallback((iso) => {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    const loc = intlLocale(lang);
    return s('pack.sos.when.at', {
      date: d.toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' }),
    });
  }, [lang, s]);
}

export function sosErrCode(e: unknown): string {
  const m = String((e as { message?: string } | null)?.message ?? '');
  const hit = /bad_phone|bad_coords|bad_time|bad_state|bad_url|rate_limited|no_access|not_authenticated/.exec(m);
  return hit ? hit[0] : 'error';
}

/** Plemeno v jazyku rozhrania (rovnaký slovník ako DOG ID: `breeds.json`, `Mixed` → Kríženec). */
export function useBreedLabel(): (breed: string | null | undefined) => string {
  const { lang } = useLang();
  return useCallback((b) => localizeBreed(b, lang), [lang]);
}

/** Farba srsti z `dogs.selections.dogColour` (`bright` · `dark` · `mix`) na slovo. */
export function colorWord(color: string | null | undefined, s: SosT): string | null {
  if (color === 'bright' || color === 'dark' || color === 'mix') return s(`pack.sos.breedColor.${color}` as SosKey);
  return color || null;
}

// ── MOJA STRATA ───────────────────────────────────────────────────────────────────────────
// Verejný detail (`lostPublic`) funguje bez prihlásenia. „Moja“ je strata, ku ktorej mám prístup:
// `sosMineBySlug` (migrácia 20261120) vráti plný riadok aj pre ukončenú / nájdenú stratu na čistom
// prehliadači, cudziemu a odhlásenému `null`. Žiadne zapamätané id v prehliadači.
export type SosLoad =
  | { state: 'loading' }
  | { state: 'missing' }
  | { state: 'error' }
  | { state: 'ready'; pub: LostPublic; mine: SosMine | null };

export function useSosLost(slug: string | undefined): SosLoad & { reload: () => void } {
  const [data, setData] = useState<SosLoad>({ state: 'loading' });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!slug) { setData({ state: 'missing' }); return; }
    let alive = true;
    (async () => {
      try {
        const pub = await lostPublic(slug);
        if (!alive) return;
        if (!pub) { setData({ state: 'missing' }); return; }
        let mine: SosMine | null = null;
        try { mine = await sosMineBySlug(slug); }
        catch {
          // Chyba ≠ „cudzí pes“: prihlásenému by sa majiteľ zhodil na cudzí pohľad (bez NAŠIEL SA, leták, plán).
          // Bez relácie je cudzí pohľad správny; s reláciou ide o chybu siete / servera ⇒ SKÚSIŤ ZNOVA.
          const { data: ses } = await supabase.auth.getSession();
          if (ses.session) { if (alive) setData({ state: 'error' }); return; }
        }
        if (alive) setData({ state: 'ready', pub, mine });
      } catch { if (alive) setData({ state: 'error' }); }
    })();
    return () => { alive = false; };
  }, [slug, tick]);
  return { ...data, reload };
}

/** Šípka späť = krok pred (lock 26. 10. 2026); bez predošlého kroku `fallback`. */
export function useBack(fallback: string): () => void {
  const navigate = useNavigate();
  return useCallback(() => { if (canStepBack()) navigate(-1); else navigate(fallback); }, [navigate, fallback]);
}

// ── CSS ───────────────────────────────────────────────────────────────────────────────────
const RED_GRAD = `linear-gradient(180deg, ${T.sosRed}, ${T.sosRedDark})`;
const GREEN_GRAD = `linear-gradient(180deg, #4A9160, ${T.growGreen})`;

export const SOS_CSS = `
.sos-col{flex:1 1 auto;width:100%;max-width:640px;min-height:100dvh;margin:0 auto;padding:${PACK_TOPROW_PAD} ${PAGE_AIR.side}px ${PAGE_AIR.md}px;
  display:flex;flex-direction:column;gap:${PACK_SPACE.lg}px;font-family:${FONT_UI};color:${T.inkStrong};}
.sos-col > .pk-toprow{margin-bottom:${PACK_TOPROW.content - PACK_TOPROW.top - PACK_TOPROW.h - PACK_SPACE.lg}px;}
.sos-root{min-height:100dvh;display:flex;flex-direction:column;}
.sos-stack{display:flex;flex-direction:column;gap:${PACK_SPACE.lg}px;font-family:${FONT_UI};color:${T.inkStrong};}
.sos-card{padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.sos-eyebrow{margin:0;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.sos-h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};} /* písmo: nadpis */
.sos-p{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.45;color:${T.inkDim};}
.sos-small{font-size:${PACK_TEXT.label}px;color:${T.inkWarm};line-height:1.4;}
.sos-err{margin:0;font-size:${PACK_TEXT.label}px;color:${T.sosRed};font-weight:500;}
.sos-dogname{font-family:'Cinzel Decorative','Cinzel',serif;font-weight:700;font-size:24px;text-align:center;color:${T.inkStrong};line-height:1.15;margin:0;} /* písmo: meno */
.sos-dogsub{text-align:center;font-size:${PACK_TEXT.body}px;color:${T.inkWarm};margin:0;}
/* ČERVENÝ BLOK / ZELENÝ BLOK */
.sos-band{background:${RED_GRAD};color:#fff;border-radius:${PACK_R.tile}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;}
.sos-band--found{background:${GREEN_GRAD};}
.sos-band--ended{background:${T.inkWarm};}
.sos-band b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;letter-spacing:.14em;text-transform:uppercase;} /* písmo: nadpis */
.sos-band small{display:block;font-size:${PACK_TEXT.body}px;opacity:.95;margin-top:${PACK_SPACE.xs}px;}
.sos-motto{margin:0;text-align:center;font-size:${PACK_TEXT.lead}px;font-weight:600;color:${T.sosRed};}
.sos-photo{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:${PACK_R.card}px;display:block;background:${T.tileBg};border:1.5px solid ${T.cardEdge};}
.sos-photo--none{display:flex;align-items:center;justify-content:center;}
/* CTA — tvar btn-gold: radius 8, NIE pilulka. Lapis na bledom, červené len SOS, zelené = splnené. */
.sos-cta{display:flex;align-items:center;justify-content:center;gap:${PACK_SPACE.sm}px;width:100%;min-height:56px;padding:0 ${PACK_SPACE.lg}px;
  border-radius:${PACK_R.field}px;font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:.14em;text-transform:uppercase;text-align:center;
  text-decoration:none;cursor:pointer;border:1px solid ${LAPIS.edge};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_TITLE};} /* písmo: cta */
.sos-cta:hover{background:${LAPIS.gradHover};}
.sos-cta:active{transform:scale(.98);}
.sos-cta[disabled]{opacity:.45;cursor:default;}
.sos-cta--red{background:${RED_GRAD};border-color:${T.sosRedDark};color:#fff;box-shadow:${LAPIS_BTN_SHADOW};}
.sos-cta--red:hover{background:linear-gradient(180deg, ${T.sosRed}, ${T.sosRed});}
.sos-cta--green{background:${GREEN_GRAD};border-color:#265636;color:#fff;box-shadow:${LAPIS_BTN_SHADOW};}
.sos-cta--green:hover{background:linear-gradient(180deg, ${T.growGreen}, ${T.growGreen});}
.sos-cta--gold{background:${BRAND_GOLD_BTN.grad};border-color:${BRAND_GOLD_BTN.edge};color:${BRAND_GOLD_BTN.ink};box-shadow:none;}
.sos-cta--tint{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.sos-cta--tint:hover{background:rgba(22,48,122,.24);}
.sos-cta--ghost{background:transparent;color:${T.inkStrong};border:1.5px solid ${T.cardEdge};box-shadow:none;}
.sos-cta--ghost:hover{background:${T.tileBg};}
.sos-cta--sm{min-height:44px;font-size:${PACK_TEXT.label}px;}
.sos-two{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;}
/* POLE */
.sos-field{display:block;}
.sos-field > span{display:block;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};margin-bottom:${PACK_SPACE.xs}px;}
.sos-field .pf-field{width:100%;min-height:48px;padding:0 ${PACK_SPACE.md}px;font-family:${FONT_UI};font-size:${PACK_TEXT.lead}px;color:${T.inkStrong};box-sizing:border-box;}
.sos-field textarea.pf-field{padding:${PACK_SPACE.md}px;resize:none;line-height:1.4;min-height:96px;}
.sos-field .pf-field.is-bad{border-color:${T.sosRed};}
/* RIADOK / FAKT */
.sos-row{display:flex;align-items:center;gap:${PACK_SPACE.md}px;width:100%;min-height:64px;padding:${PACK_SPACE.md}px;text-align:left;font-family:${FONT_UI};color:${T.inkStrong};cursor:pointer;box-sizing:border-box;text-decoration:none;}
.sos-row .grow{flex:1;min-width:0;}
.sos-row b{display:block;font-weight:600;font-size:${PACK_TEXT.lead}px;}
.sos-row small{display:block;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.sos-fact{display:flex;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px 0;border-top:1px solid ${T.hairline};font-size:${PACK_TEXT.body}px;}
.sos-fact:first-child{border-top:0;}
.sos-fact small{flex:0 0 112px;color:${T.inkWarm};font-size:${PACK_TEXT.label}px;padding-top:${PACK_SPACE.xs}px;}
.sos-chips{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.sos-pill{display:inline-flex;align-items:center;min-height:32px;padding:0 ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.border};background:${T.tileBg};font-size:${PACK_TEXT.label}px;color:${T.inkStrong};}
/* výber: priesvitný lapis tint */
.sos-pick{border:1.5px solid ${T.border};background:${T.tileBg};cursor:pointer;font-family:${FONT_UI};color:${T.inkStrong};}
.sos-nums{display:grid;grid-template-columns:1fr 1fr;gap:${PACK_SPACE.sm}px;}
.sos-num{display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.md}px;}
.sos-num b{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.h1}px;line-height:1;color:${T.inkStrong};}
.sos-num small{font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};}
.sos-opts{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.sos-opt{display:flex;align-items:center;justify-content:center;width:100%;min-height:56px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;border-radius:${PACK_R.field}px;
  font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.lead}px;text-align:center;cursor:pointer;}
.sos-opt--alive{background:${GREEN_GRAD};border:1px solid ${T.growGreen};color:#fff;box-shadow:${LAPIS_BTN_SHADOW};}
.sos-opt--calm{background:${T.tileBg};border:1.5px solid ${T.cardEdge};color:${T.inkStrong};}
.sos-opt--none{background:transparent;border:0;color:${T.inkWarm};min-height:44px;font-size:${PACK_TEXT.body}px;}
.sos-opt[disabled]{opacity:.45;cursor:default;}
.sos-diaryrow{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.md}px;}
.sos-diaryrow .grow{flex:1;min-width:0;}
.sos-diaryrow b{display:block;font-weight:600;font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.sos-diaryrow small{display:block;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.sos-pick.is-on{background:${LAPIS.fill};border-color:${LAPIS.edge};box-shadow:inset 0 0 0 1px ${LAPIS.halo};}
`;

export const SOS_STYLES = [PAPER_PAGE_CSS, PILL_CSS, PF_FIELD_CSS, SOS_CSS];

export function SosStyles() {
  return <>{SOS_STYLES.map((c, i) => <style key={i}>{c}</style>)}</>;
}

/** KARTA = PACK_BOX.card (r16, zlatý rám). */
export function SosCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`sos-card ${className}`} style={{ ...PACK_BOX.card }}>{children}</section>;
}

/** RIADOK = PACK_BOX.row (r12). */
export const rowStyle = { ...PACK_BOX.row } as const;
export const subStyle = { ...PACK_BOX.subblock } as const;
export const cardShadow = PACK_SHADOW.card;
