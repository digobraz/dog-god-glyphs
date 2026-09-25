// SNIFFER (interne BUDDY / ASSNIF) — `/pack/sniffer`. Verejné meno od 24. 9. večer (Matej:
// „premenujem to na SNIFFER — podobá sa trochu na tinder“), predtým BUDDY / Parťáci. Krok 3: vstup, brána do 100 %, nastavenia.
// Zadanie: plany/zadanie-assnif-2026-09-24.md §3.1, §10 · nákres plany/nakres-buddy-urovne-2026-09-24.html
//   0a prvý vstup · 0b brána = 100 % · 0c fotka ty + pes · 0d zapnuté · 5b nastavenia (⚙)
// Balíček, HĽADAŤ a ZHODY sú krok 4 — tu sa na ne len pripravuje miesto.
//
// 🔴 KÔŠ 3, NIE KÔŠ 2 (Matej 24. 9., zadanie §10: „celé BUDDY bez spodného navu, ‹ späť").
//    Lock `architektura-pack.md` §8.1 z 21. 9. hovoril kôš 2 — novší pokyn prebíja, lock je
//    doplnený. Preto stránka NEMOUNTUJE `PackLayout` (ten by priniesol spodnú lištu).
// 🔴 BRÁNA SA DOPĹŇA TU, NIE ODKAZOM DO PROFILU (nákres 0b), ale zapisuje sa do TÝCH ISTÝCH
//    polí ako profil (`saveHuman` / `saveDogAttrs`). Definícia 100 % → `buddy/buddyGate.ts`.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';
import { usePackUser } from '@/hooks/usePackUser';
import { uploadExtraPhoto, withTransform } from '@/services/cloudinaryService';

/** Fotka z iPhonu prichádza ako HEIC a Chrome ju nevykreslí — `f_auto` ju Cloudinary prevedie. */
const photoUrl = (u?: string | null) => withTransform(u, 'c_limit,w_1200,f_auto,q_auto');
import { BackButton } from '@/components/pack/BackButton';
import { AinubisBubble } from '@/components/pack/ainubisSheet';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { FLOW_CARVE_CSS } from '@/components/screens/flowPaleSkin';
import { SnifferLogo, SNIFFER_LOGO_END_MS } from '@/components/pack/buddy/SnifferLogo';
import { SnifferHome } from '@/components/pack/buddy/SnifferHome';
import { SnifferProfile } from '@/components/pack/buddy/SnifferProfile';
import { SnifferMyCard, SNIFFER_CARD_CSS } from '@/components/pack/buddy/SnifferCard';
import { SnifferFullProfile } from '@/components/pack/buddy/SnifferFullProfile';
import type { SnifferCardData } from '@/components/pack/buddy/snifferDeck';
import { MessagingOverlayHost } from '@/components/pack/PackLayout';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PAGE_AIR,
  PACK_SHADOW, PACK_AVATAR, PACK_COL_INNER, PAPER_PAGE_CSS, PILL_CSS, PF_FIELD_CSS, PHOTO_CSS, PROGRESS_CSS, MEDALLION_CSS, VEIL_CSS, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import {
  useProfile, saveHuman, saveDogAttrs, saveDisplayName, emptyDogAttrs,
  DOG_TEMPERAMENT_TAGS, DOG_FITNESS_OPTIONS, DOG_COMPAT_OPTIONS, GENDER_OPTIONS, TRAFFIC_COLORS,
  type DogProfileAttrs, type Gender, type Intent, type TrafficLight,
} from '@/components/pack/profile/packProfile';
import { MAX_DOG_TEMPERAMENT } from '@/components/pack/profile/DogGallery';
import {
  BUDDY_STEPS, BUDDY_INTENTS, BUDDY_MIN_AGE, DEFAULT_BUDDY_SETTINGS,
  buddyGateMissing, pickBuddyDog, loadBuddySettings, saveBuddySettings,
  type BuddySettings, type BuddyStepKey,
} from '@/components/pack/buddy/buddyGate';

type View = 'splash' | 'intro' | 'gate' | 'done' | 'settings' | 'home';
type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

/** Vzdialenosť „komu sa ukážem" — nákres 2b/5b. `null` = bez obmedzenia. */
const RADIUS_STEPS: Array<number | null> = [10, 50, 150, null];
const PAUSE_DAYS = 7;

const STEP_EN: Record<BuddyStepKey, string> = {
  name: 'Name', age: 'Age', gender: 'Gender', region: 'Where you live',
  temperament: 'Temperament', fitness: 'Physical condition', compat: 'With other dogs',
  photo: 'Photo: you + your dog', intents: 'What I’m looking for', audience: 'Who sees me',
};

const CSS = `
.bd-root{min-height:100dvh;display:flex;flex-direction:column;}
.bd-bar{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.sm}px;}
.bd-gear{justify-self:end;width:40px;height:40px;border-radius:${PACK_R.pill}px;border:1px solid ${T.border};
  background:${T.cardSoft};display:flex;align-items:center;justify-content:center;cursor:pointer;}
.bd-col{flex:1 1 auto;width:100%;max-width:640px;min-height:100dvh;margin:0 auto;padding:${PAGE_AIR.min}px ${PAGE_AIR.side}px ${PAGE_AIR.md}px;
  display:flex;flex-direction:column;gap:${PACK_SPACE.lg}px;}
/* SNIFFUJ = jedna obrazovka bez scrollu: stĺpec presne na výšku okna, balíček berie zvyšok. */
.bd-col--fit{height:100dvh;min-height:0;}
.bd-card{padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.bd-card--list{padding:${PACK_SPACE.sm}px 0;gap:0;}
.bd-card--list > .bd-eyebrow{padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;}
.bd-eyebrow{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.sm}px;font-family:${FONT_UI};font-weight:500;
  font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.bd-h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.bd-lead{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;line-height:1.55;color:${T.inkDim};}
.bd-head{display:flex;align-items:center;gap:${PACK_SPACE.lg}px;}
.bd-head > div:last-child{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.bd-count{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.bd-count b{font-weight:600;color:${T.inkStrong};}
/* riadok brány — zoznam v karte, deliace čiary namiesto samostatných dlaždíc */
.bd-item + .bd-item{border-top:1px solid ${T.hairline};}
.bd-row{display:flex;align-items:center;gap:${PACK_SPACE.md}px;width:100%;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;
  background:transparent;border:0;cursor:pointer;text-align:left;font-family:${FONT_UI};color:${T.inkStrong};}
.bd-row:hover{background:${T.tileBg};}
.bd-row__txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;}
.bd-row__txt b{font-weight:600;font-size:${PACK_TEXT.body}px;}
.bd-row__txt small{font-size:${PACK_TEXT.label}px;color:${T.inkDim};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bd-mark{position:relative;flex:0 0 auto;width:24px;height:24px;border-radius:${PACK_R.pill}px;display:flex;align-items:center;
  justify-content:center;font-size:${PACK_TEXT.label}px;font-weight:600;border:1px solid ${T.border};color:${T.inkWarm};background:${T.cardSoft};}
.bd-mark.is-done{background:${TRAFFIC_COLORS.green};border-color:${TRAFFIC_COLORS.green};}
/* fajka kreslená rámom, nie znakom fontu */
.bd-mark.is-done::after{content:'';width:6px;height:11px;margin-top:-3px;border-right:2px solid ${T.card};border-bottom:2px solid ${T.card};transform:rotate(45deg);}
.bd-todo{flex:0 0 auto;font-size:${PACK_TEXT.label}px;font-weight:600;padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${LAPIS.edge};${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.1)}}
.bd-chev{flex:0 0 auto;width:8px;height:8px;border-right:1.5px solid ${T.inkFaint};border-bottom:1.5px solid ${T.inkFaint};transform:rotate(-45deg);}
.bd-item.is-open .bd-chev{transform:rotate(45deg);}
.bd-edit{margin:0 ${PACK_SPACE.lg}px ${PACK_SPACE.lg}px;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:${T.tileBg};
  border:1px solid ${T.hairline};display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.bd-pills{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.bd-pills .pk-pill{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;}
.bd-pills .pk-pill.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.bd-field{width:100%;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.bd-inline{display:flex;gap:${PACK_SPACE.sm}px;align-items:center;}
.bd-inline .bd-field{flex:1 1 auto;min-width:0;}
.bd-note{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.bd-note--center{text-align:center;}
.bd-warn{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${PICK_INK.red};}
.bd-cta{width:100%;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.md}px ${PACK_SPACE.lg}px;border:1px solid ${LAPIS.deep};
  background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};font-family:${FONT_TITLE};font-weight:700;
  font-size:${PACK_TEXT.body}px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;}
.bd-cta:hover{background:${LAPIS.gradHover};}
.bd-cta:disabled{opacity:.45;cursor:default;}
.bd-cta--small{width:auto;align-self:flex-start;padding:${PACK_SPACE.sm}px ${PACK_SPACE.lg}px;font-size:${PACK_TEXT.label}px;}
.bd-ghost{width:100%;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.md}px;border:1px solid ${T.border};background:transparent;
  font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};cursor:pointer;}
/* tlačidlo drží dole, zoznam pod ním beží — bez vlastného pásu, aby nekreslilo obdĺžnik cez tapetu */
.bd-incta{width:100%;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.md}px;}
.bd-dock{position:sticky;bottom:${PAGE_AIR.min}px;z-index:4;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.bd-dock .bd-cta:disabled{opacity:1;background:${T.cardSoft};color:${T.inkWarm};border-color:${T.border};box-shadow:${PACK_SHADOW.panel};cursor:default;}
/* tri kroky úvodu */
.bd-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.bd-steps li{display:flex;gap:${PACK_SPACE.md}px;align-items:flex-start;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.bd-steps li small{display:block;font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.bd-steps li > span:last-child{padding-top:${PACK_SPACE.xs}px;}
.bd-steps b{font-weight:600;}
/* kotúč kroku — tri farby, tri významy: zlato = ty (konštrukcia), lapis = psy rozhodujú
   (voľba), zelená = zhoda (splnené). Farby sú brandové tokeny, nie nové odtiene. */
.bd-disc{position:relative;flex:0 0 auto;width:${PACK_AVATAR.md}px;height:${PACK_AVATAR.md}px;border-radius:${PACK_R.pill}px;
  display:flex;align-items:center;justify-content:center;box-shadow:${PACK_SHADOW.card};}
.bd-disc i{position:absolute;top:-${PACK_SPACE.xs}px;right:-${PACK_SPACE.xs}px;width:20px;height:20px;border-radius:${PACK_R.pill}px;
  display:flex;align-items:center;justify-content:center;font-style:normal;font-family:${FONT_UI};font-weight:600;
  font-size:${PACK_TEXT.micro}px;background:${T.card};color:${T.inkStrong};border:1px solid ${T.border};}
/* rajón veku — dva jazdce na jednej koľajnici */
.bd-range{position:relative;height:${PACK_SPACE.xl}px;}
.bd-range__rail,.bd-range__fill{position:absolute;top:50%;height:4px;margin-top:-2px;border-radius:${PACK_R.pill}px;}
.bd-range__rail{left:0;right:0;background:${T.hairline};}
.bd-range__fill{background:${LAPIS.edge};}
.bd-range input{position:absolute;inset:0;width:100%;margin:0;background:none;pointer-events:none;-webkit-appearance:none;appearance:none;}
.bd-range input::-webkit-slider-thumb{pointer-events:auto;-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:${PACK_R.pill}px;
  background:${LAPIS.grad};border:2px solid ${T.card};box-shadow:${PACK_SHADOW.card};cursor:grab;}
.bd-range input::-moz-range-thumb{pointer-events:auto;width:24px;height:24px;border-radius:${PACK_R.pill}px;
  background:${LAPIS.grad};border:2px solid ${T.card};box-shadow:${PACK_SHADOW.card};cursor:grab;}
.bd-range__val{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:.14em;color:${T.inkStrong};}
/* ÚVOD — erb s animovaným logom (SnifferLogo) a jedna veta. */
.bd-hero{padding:${PACK_SPACE.xl}px ${PACK_SPACE.lg}px;}
.bd-hero .bd-h2{font-size:${PACK_TEXT.h1}px;}
.bd-wordmark{margin:0;line-height:0;}
.bd-tagline{margin:0 auto;max-width:30ch;font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.lead}px;line-height:1.45;color:${T.inkStrong};}
.bd-reveal{opacity:0;transform:translateY(${PACK_SPACE.sm}px);transition:opacity .6s ease, transform .6s ease;}
.is-done .bd-reveal{opacity:1;transform:none;}
.is-done .bd-tagline{transition-delay:.55s;}
.bd-grow{width:100%;display:grid;grid-template-rows:0fr;transition:grid-template-rows .6s ease;}
.bd-grow > div{overflow:hidden;display:flex;flex-direction:column;align-items:center;text-align:center;gap:${PACK_SPACE.md}px;}
.is-done .bd-grow{grid-template-rows:1fr;}
.is-done .bd-wordmark{transition-delay:.25s;}
@media (prefers-reduced-motion: reduce){.bd-reveal{opacity:1;transform:none;transition:none;}.bd-grow{grid-template-rows:1fr;transition:none;}}
.bd-wordmark img{height:${PACK_SPACE.xxl + PACK_SPACE.md}px;width:auto;}
.bd-hero .bd-lead{font-family:${FONT_TITLE};font-size:${PACK_TEXT.lead}px;line-height:1.45;color:${T.inkStrong};max-width:28ch;margin:0 auto;}
.bd-hero .bd-lead--ui{font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkDim};}
/* JEDNA OBRAZOVKA BEZ SCROLLU — obsah sa centruje margin:auto na dieťati, NIE
   justify-content:center (pretečenie by sa rozdelilo na obe strany, lock PAGE_AIR). */
.bd-stage{flex:1 1 auto;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;min-height:0;}
.bd-stage__body{flex:1 1 auto;display:flex;flex-direction:column;}
.bd-stage__body > .bd-card{margin:auto 0;}
.bd-howcard{gap:${PACK_SPACE.lg}px;}
.bd-disc--xl{width:${PACK_AVATAR.lg + PACK_SPACE.xl}px;height:${PACK_AVATAR.lg + PACK_SPACE.xl}px;}
.bd-dots{display:flex;justify-content:center;gap:${PACK_SPACE.sm}px;}
.bd-dots span{width:8px;height:8px;border-radius:${PACK_R.pill}px;background:${T.hairline};}
.bd-dots span.is-on{background:${T.accentGold};}
/* nahratie fotky — malý náhľad vedľa tlačidla, nie fotka cez celú šírku */
.bd-upl{display:flex;align-items:center;gap:${PACK_SPACE.md}px;}
.bd-upl .pk-photo{flex:0 0 auto;width:${PACK_AVATAR.lg + PACK_SPACE.xl}px;aspect-ratio:1;}
.bd-upl > div:last-child{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.bd-center{align-items:center;text-align:center;}
/* Na PC široký stĺpec (832 px) — Váš profil tam ukáže viac kariet vedľa seba. */
@media (min-width:768px){ .bd-col--wide{max-width:${PACK_COL_INNER + 2 * PAGE_AIR.side}px;} }
/* NASTAVENIA — logo a veľký prepínač v jednej doske (nákres E). Zapnuté = LAPIS: je to moja voľba. */
.bd-sethead{flex-direction:row;align-items:center;justify-content:space-between;}
.bd-sethead__logo{height:${PACK_SPACE.xxxl}px;width:auto;}
.bd-sw{position:relative;flex:0 0 auto;width:${PACK_SPACE.xxxl + PACK_SPACE.xs}px;height:${PACK_SPACE.xl + PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${T.border};background:${T.hairline};cursor:pointer;padding:0;transition:background .2s ease;}
.bd-sw i{position:absolute;top:${PACK_SPACE.xs}px;left:${PACK_SPACE.xs}px;width:${PACK_SPACE.xl}px;height:${PACK_SPACE.xl}px;border-radius:${PACK_R.pill}px;
  background:${T.card};box-shadow:${PACK_SHADOW.card};transition:left .2s ease;}
.bd-sw.is-on{background:${LAPIS.grad};border-color:${LAPIS.deep};}
.bd-sw.is-on i{left:calc(100% - ${PACK_SPACE.xl + PACK_SPACE.xs}px);}
.bd-link{border:0;background:none;padding:0;cursor:pointer;font:inherit;color:${LAPIS.edge};text-decoration:underline;}
.bd-areas{max-width:440px;width:100%;}
.bd-photo--empty{display:flex;align-items:center;justify-content:center;text-align:center;padding:${PACK_SPACE.sm}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.bd-switch{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.md}px;font-family:${FONT_UI};
  font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
`;

export default function PackBuddy() {
  const t = useT();
  const tx: Tx = (key, fallback, vars) => {
    const v = t(key, vars);
    if (v !== key) return v;
    return vars ? fallback.replace(/\{(\w+)\}/g, (m, n) => (n in vars ? String(vars[n]) : m)) : fallback;
  };
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [settings, setSettings] = useState<BuddySettings | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [myFull, setMyFull] = useState<SnifferCardData | null>(null);
  const [introStep, setIntroStep] = useState(1);
  const [logoDone, setLogoDone] = useState(false);
  const [serverMissing, setServerMissing] = useState<BuddyStepKey[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const { profile } = useProfile();
  const { dogs, avatarUrl, ownerGender, loading: dogsLoading } = usePackUser(session?.user?.id ?? null);
  // POHLAVIE JE Z HEROGLYFU (Matej 25. 9.: „pohlavie je predsa z heroglyfu"). Malý rámik
  // majiteľa ho nesie od platby, takže sa na neho SNIFFER nepýta druhýkrát — zapíše ho do
  // `human.gender`, odkiaľ ho číta brána na serveri. Kto heroglyf bez pohlavia nemá,
  // krok uvidí ako doteraz.
  const heroGender: Gender | null = HERO_GENDER[(ownerGender ?? '').toLowerCase()] ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    loadBuddySettings().then(setSettings);
  }, []);

  // Prvé otvorenie: zapnutý ide rovno dnu, ostatní cez úvod (0a).
  useEffect(() => {
    // LOGO PRI KAŽDOM OTVORENÍ (Matej 25. 9.: „táto obrazovka bude vždy pri otvorení sniffera,
    // akurát prvý krát je vypĺňanie profilu, ale potom už len nabehne logo a po logu sa zobrazia
    // ľudia na swajpe").
    if (settings && view === null) setView('splash');
  }, [settings, view]);

  const meta = (session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
  const orderName = dogs.map((d) => d.owner_name?.trim()).find(Boolean) ?? '';
  const name = (meta.full_name ?? '').trim() || orderName;

  const human = profile?.human;
  const dog = useMemo(() => pickBuddyDog(dogs, (id) => profile?.dogs[id]), [dogs, profile]);
  const dogAttrs: DogProfileAttrs | undefined = dog ? (profile?.dogs[dog.id] ?? emptyDogAttrs(dog.id)) : undefined;

  useEffect(() => {
    if (heroGender && profile && !profile.human.gender) void saveHuman({ gender: heroGender });
  }, [heroGender, profile]);

  const s = settings ?? DEFAULT_BUDDY_SETTINGS;
  const steps = BUDDY_STEPS.filter((st) => st.key !== 'gender' || !heroGender);
  const missing = buddyGateMissing({ name, human, dogAttrs, hasDog: !!dog, settings: s })
    .filter((k) => steps.some((st) => st.key === k));
  const doneCount = steps.length - missing.length;
  // Šírka výplne receptu `.pk-progress` (PROGRESS_CSS) — pruh nekreslíme, len mu dávame číslo.
  const gateFill = `${Math.round((doneCount / steps.length) * 100)}%`;
  const paused = !!s.paused_until && new Date(s.paused_until) > new Date();

  const patchSettings = async (patch: Partial<BuddySettings>) => {
    setSettings((cur) => ({ ...(cur ?? DEFAULT_BUDDY_SETTINGS), ...patch }));
    const r = await saveBuddySettings(patch);
    if ('missing' in r && r.missing.length) setServerMissing(r.missing);
    return r;
  };

  const saveDog = (patch: Partial<DogProfileAttrs>) => {
    if (dog) void saveDogAttrs(dog.id, patch);
  };
  const setCard = (patch: Partial<DogProfileAttrs['card']>) => {
    if (dogAttrs) saveDog({ card: { ...dogAttrs.card, ...patch } });
  };

  const enable = async () => {
    setBusy(true);
    setServerMissing(null);
    const r = await patchSettings({ enabled: true, paused_until: null });
    setBusy(false);
    if (r.ok) setView('done');
    else setSettings((cur) => ({ ...(cur ?? DEFAULT_BUDDY_SETTINGS), enabled: false }));
  };

  const stepLabel = (k: BuddyStepKey) => tx(`pack.buddy.step.${k}`, STEP_EN[k]);

  const title = view === 'settings'
    ? tx('pack.buddy.settings', 'Settings')
    : tx('pack.buddy.title', 'Buddies');

  const afterSplash = () => setView(s.enabled ? 'home' : introSeen() ? 'gate' : 'intro');
  // Kto je v SNIFFERi, ide po logu sám rovno na swipe; nový človek pokračuje tlačidlom.
  useEffect(() => {
    if (view !== 'splash' || !s.enabled) return;
    const id = window.setTimeout(afterSplash, SNIFFER_LOGO_END_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- časovač beží od otvorenia, nie od prekreslenia
  }, [view, s.enabled]);

  const back = () => {
    if (view === 'settings') setView(s.enabled ? 'home' : 'gate');
    else if (view === 'gate' && !introSeen()) { setIntroStep(3); setView('intro'); }
    else if (view === 'intro' && introStep > 1) setIntroStep(introStep - 1);
    else navigate('/pack/map');
  };

  // ── editory jedného bodu — tie isté polia ako profil ──────────────────────
  const editor = (k: BuddyStepKey): ReactNode => {
    switch (k) {
      case 'name':
        return (
          <div className="bd-inline">
            <input className="pf-field bd-field" value={nameDraft ?? name}
              placeholder={tx('pack.buddy.namePh', 'First name')}
              onChange={(e) => setNameDraft(e.target.value)} />
            <button type="button" className="bd-cta bd-cta--small" disabled={!(nameDraft ?? '').trim()}
              onClick={async () => {
                // Tá istá dvojica zápisov ako `/pack/profile` (`handleSaveName`).
                const v = (nameDraft ?? '').trim();
                await supabase.auth.updateUser({ data: { full_name: v } });
                await saveDisplayName(v);
                const { data } = await supabase.auth.getSession();
                setSession(data.session);
                setNameDraft(null);
              }}>{tx('pack.buddy.save', 'Save')}</button>
          </div>
        );
      case 'age':
        return (
          <>
            <input className="pf-field bd-field" type="number" inputMode="numeric" min={1} max={120}
              defaultValue={human?.age ?? ''} placeholder={tx('pack.profile.agePlaceholder', 'Age')}
              onBlur={(e) => void saveHuman({ age: e.target.value === '' ? undefined : Number(e.target.value) })} />
            {typeof human?.age === 'number' && human.age < BUDDY_MIN_AGE && (
              <p className="bd-warn">{tx('pack.buddy.under18', 'Buddies is for people aged {n} and over.', { n: BUDDY_MIN_AGE })}</p>
            )}
          </>
        );
      case 'gender':
        return (
          <Pills
            options={GENDER_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.buddy.gender.${o.value}`, o.labelEN) }))}
            selected={human?.gender ? [human.gender] : []}
            onToggle={(v) => void saveHuman({ gender: v as Gender })}
          />
        );
      case 'region':
        return (
          <input className="pf-field bd-field" defaultValue={human?.region ?? ''}
            placeholder={tx('pack.profile.cityPlaceholder', 'City')}
            onBlur={(e) => void saveHuman({ region: e.target.value.trim() || undefined })} />
        );
      case 'temperament': {
        const sel = dogAttrs?.tags.temperament ?? [];
        return (
          <>
            <Pills
              options={DOG_TEMPERAMENT_TAGS.map((v) => ({ value: v, label: tx(`pack.dogTag.${v}`, v) }))}
              selected={sel}
              onToggle={(v) => {
                if (!dogAttrs) return;
                const next = sel.includes(v as never) ? sel.filter((x) => x !== v) : [...sel, v];
                if (next.length > MAX_DOG_TEMPERAMENT) return;
                saveDog({ tags: { ...dogAttrs.tags, temperament: next as DogProfileAttrs['tags']['temperament'] } });
              }}
            />
            <p className="bd-note">{tx('pack.buddy.maxTags', 'Up to {n}.', { n: MAX_DOG_TEMPERAMENT })}</p>
          </>
        );
      }
      case 'fitness':
        return (
          <Pills
            options={DOG_FITNESS_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
            selected={dogAttrs?.card.fitness ? [dogAttrs.card.fitness] : []}
            onToggle={(v) => setCard({ fitness: v as DogProfileAttrs['card']['fitness'] })}
          />
        );
      case 'compat':
        return (
          <Pills
            options={DOG_COMPAT_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
            selected={dogAttrs?.card.compat.dogs_overall ? [dogAttrs.card.compat.dogs_overall] : []}
            onToggle={(v) => setCard({ compat: { ...dogAttrs?.card.compat, dogs_overall: v as TrafficLight } })}
          />
        );
      case 'photo':
        return <PhotoEditor url={human?.buddyPhoto} uid={session?.user.id ?? null} tx={tx} />;
      case 'intents':
        return <IntentsEditor selected={human?.intents ?? []} tx={tx} />;
      case 'audience':
        return <AudienceEditor s={s} onPatch={patchSettings} tx={tx} />;
    }
  };

  const summary = (k: BuddyStepKey): string => {
    const opt = (v?: string) => (v ? tx(`pack.dogCard.opt.${v}`, v) : '—');
    switch (k) {
      case 'name': return name || '—';
      case 'age': return human?.age ? String(human.age) : '—';
      case 'gender': return human?.gender ? tx(`pack.buddy.gender.${human.gender}`, human.gender) : '—';
      case 'region': return human?.region || '—';
      case 'temperament': return (dogAttrs?.tags.temperament ?? []).map((v) => tx(`pack.dogTag.${v}`, v)).join(', ') || '—';
      case 'fitness': return opt(dogAttrs?.card.fitness);
      case 'compat': return opt(dogAttrs?.card.compat.dogs_overall);
      case 'photo': return human?.buddyPhoto ? tx('pack.buddy.photoOk', 'Uploaded') : '—';
      case 'intents': return (human?.intents ?? []).filter((i) => i !== 'community')
        .map((i) => tx(`pack.buddy.intent.${i}`, i)).join(', ') || '—';
      case 'audience': return s.show_to_genders.length
        ? `${s.show_to_genders.map((g) => tx(`pack.buddy.showTo.${g}`, g)).join(', ')} · ${s.age_min}–${s.age_max}`
        : '—';
    }
  };

  if (!view || (dogsLoading && !dogs.length)) {
    return <Shell title={tx('pack.buddy.title', 'Buddies')} onBack={back} backLabel={tx('pack.buddy.back', 'Back')} />;
  }

  return (
    <Shell title={title} onBack={back} backLabel={tx('pack.buddy.back', 'Back')}
      onGear={view !== 'settings' ? () => setView('settings') : undefined}
      gearLabel={tx('pack.buddy.settings', 'Settings')} wide={view === 'gate' || view === 'settings'} fit={view === 'home' || view === 'done'}>
      {view === 'splash' && (
        <div className="bd-stage" onClick={() => { if (s.enabled) afterSplash(); }}>
          <div className="bd-stage__body">
            <div className={`bd-card bd-center bd-hero hf-carved${logoDone ? ' is-done' : ''}`} style={{ ...PACK_BOX.card }}>
              <span className="hf-carved-rim" aria-hidden />
              <SnifferLogo size={PACK_AVATAR.lg * 3 + PACK_SPACE.xl} onDone={() => setLogoDone(true)} />
              {/* Nápis a veta až KEĎ STOJÍ SRDCE (Matej 25. 9.: „až po tom, čo nabehne srdce, až
                  vtedy príde text, a tagline bude groteskom"). Počas animácie je logo v STREDE
                  a text ho až potom plynulo vytlačí nahor („logo centruj na stred pri animácii
                  a potom ho hore vytlačí text") — `.bd-grow` rastie z nulovej výšky. */}
              <div className="bd-grow">
                <div>
                  <h2 className="bd-wordmark bd-reveal">
                    <img src="/icons/sniffer/sniffer-napis.svg" alt={tx('pack.buddy.title', 'SNIFFER')} />
                  </h2>
                  <p className="bd-tagline bd-reveal">{tx('pack.buddy.intro', 'Find buddies to sniff out the world with.')}</p>
                  {/* CTA V BLOKU pod textom, nie mimo (Matej 25. 9.: „to CTA daj do bloku pod text"). */}
                  {!s.enabled && (
                    <div className="bd-incta bd-reveal">
                      <button type="button" className="bd-cta" onClick={afterSplash}>{tx('pack.buddy.next', 'Next')}</button>
                      <p className="bd-note bd-note--center">{tx('pack.buddy.introOff', 'Off by default')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'intro' && (
        /* ONBOARDING (Matej 25. 9.): „najskôr len jeden blok LOGO a tagline, až po kliknutí
           ďalej by sa zobrazil postup… kroky v kartách, aby nebol potrebný scrolling".
           Štyri obrazovky, každá sa zmestí bez scrollu: 0 logo · 1–3 jeden krok na kartu.
           Len PRVÝ raz — potom sa ide rovno do brány (`INTRO_SEEN`). */
        <div className="bd-stage">
          <div className="bd-stage__body">
            {(() => {
              const n = String(introStep) as '1' | '2' | '3';
              return (
                <div key={n} className="bd-card bd-center bd-hero bd-howcard hf-carved" style={{ ...PACK_BOX.card }}>
                  <span className="hf-carved-rim" aria-hidden />
                  <span className="bd-eyebrow">{tx('pack.buddy.howTitle', 'How it works')} · {n}/3</span>
                  <span className="bd-disc bd-disc--xl" style={{ background: HOW_STYLE[n].bg }} aria-hidden>
                    <BrandIcon name={HOW_STYLE[n].icon} size={PACK_AVATAR.md} tint="white" />
                  </span>
                  <h2 className="bd-h2">{tx(`pack.buddy.how${n}`, HOW_EN[n][0])}</h2>
                  <p className="bd-lead bd-lead--ui">{tx(`pack.buddy.how${n}Sub`, HOW_EN[n][1])}</p>
                  {/* CTA v bloku pod textom — ten istý vzor ako úvod s logom. */}
                  <div className="bd-incta">
                    {n !== '3' ? (
                      <button type="button" className="bd-cta" onClick={() => setIntroStep(introStep + 1)}>
                        {tx('pack.buddy.next', 'Next')}
                      </button>
                    ) : (
                      <button type="button" className="bd-cta" onClick={() => { markIntroSeen(); setView('gate'); }}>
                        {tx('pack.buddy.introCta', 'I want buddies')}
                      </button>
                    )}
                    <p className="bd-note bd-note--center">{tx('pack.buddy.introOff', 'Off by default')}</p>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="bd-dots" aria-hidden>
            {[1, 2, 3].map((i) => <span key={i} className={i === introStep ? 'is-on' : ''} />)}
          </div>
        </div>
      )}

      {view === 'gate' && (
        <>
          {/* VÁŠ PROFIL (zadanie-sniffer-stavba §2.2, nákres A) — ty a pes v kartách do strán.
              Zapisuje sa do tých istých polí ako profil a DOG ID; definícia 100 % → buddyGate.ts. */}
          <div className="bd-center" style={{ display: 'flex', flexDirection: 'column', gap: PACK_SPACE.xs }}>
            <h2 className="bd-h2">{tx('pack.sniffer.profile.title', 'Your profile')}</h2>
            <p className="bd-note">{tx('pack.sniffer.profile.sub', 'you and your dog · swipe sideways')}</p>
            <span className="bd-count"><b>{doneCount}</b> / {steps.length} {tx('pack.buddy.done', 'done')}</span>
            <div className="pk-progress" aria-hidden>
              <div className={`pk-progress__fill${missing.length ? ' pk-progress__fill--low' : ' pk-progress__fill--done'}`}
                style={{ width: gateFill }} />
            </div>
          </div>
          <SnifferProfile
            tx={tx}
            uid={session?.user.id ?? null}
            name={name}
            human={human}
            dogs={dogs}
            dogAttrsOf={(id) => profile?.dogs[id]}
            heroGender={heroGender}
            missing={missing}
            gateEditor={editor}
            gateSummary={summary}
          />
          <div className="bd-dock">
            {serverMissing && serverMissing.length > 0 && (
              <p className="bd-warn">
                {tx('pack.buddy.serverMissing', 'Still missing: {list}', { list: serverMissing.map(stepLabel).join(', ') })}
              </p>
            )}
            <button type="button" className="bd-cta" disabled={missing.length > 0 || busy} onClick={enable}>
              {missing.length > 0
                ? tx('pack.buddy.left', '{n} more to fill in', { n: missing.length })
                : tx('pack.sniffer.profile.enable', 'Switch SNIFFER on')}
            </button>
          </div>
        </>
      )}

      {view === 'done' && (
        <>
          {/* TAKTO ŤA VIDIA (§2.3, nákres B) — jedna obrazovka: nadpis, karta, tlačidlo. */}
          <div className="bd-center" style={{ display: 'flex', flexDirection: 'column', gap: PACK_SPACE.xs }}>
            <h2 className="bd-h2">{tx('pack.buddy.doneTitle', 'You’re in the buddy pack')}</h2>
            <p className="bd-note">{tx('pack.sniffer.seenHint', 'This is how others see you · tap right = next photo')}</p>
          </div>
          <style>{SNIFFER_CARD_CSS}</style>
          <SnifferMyCard tx={tx} reloadKey={profile?.updatedAt} onOpenFull={setMyFull} />
          {/* Celý profil — presne ten, ktorý uvidia ostatní (kolo 2 §6.2). */}
          {myFull && (
            <div className="pk-veil pk-veil--modal" onClick={() => setMyFull(null)}>
              <style>{VEIL_CSS}</style>
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                <SnifferFullProfile card={myFull} tx={tx} />
              </div>
            </div>
          )}
          <div className="bd-dock">
            <button type="button" className="bd-cta" onClick={() => setView('home')}>{tx('pack.buddy.showMe', 'Show me them')}</button>
          </div>
        </>
      )}

      {view === 'home' && (
        <>
          {paused && (
            <p className="bd-note bd-note--center">{tx('pack.buddy.pausedUntil', 'Paused until {d}', { d: new Date(s.paused_until!).toLocaleDateString() })}</p>
          )}
          {/* SNIFFUJ · HĽADAŤ · ZHODY (zadanie-sniffer-stavba §2.1). „Takto ťa vidia" sa
              presunulo do nastavení a za zapnutie (§2.3) — domov je balíček. */}
          <SnifferHome tx={tx} me={{ photo: human?.buddyPhoto ?? avatarUrl ?? null, name, dogName: dog?.dog_name ?? null }} />
        </>
      )}

      {view === 'settings' && (
        <>
          {/* NASTAVENIA (zadanie-sniffer-stavba §2.4, nákres E): hore logo + veľký prepínač,
              pod ním Váš profil v tých istých kartách ako brána, Môj rajón a upozornenia.
              Zámery a „komu sa ukážem" sú v karte 4 Vášho profilu — druhýkrát na tej istej
              obrazovke nie sú. */}
          <section className="bd-card bd-sethead" style={{ ...PACK_BOX.card }}>
            <img className="bd-sethead__logo" src="/icons/sniffer/sniffer-logo.svg" alt="SNIFFER" />
            <button type="button" role="switch" aria-checked={s.enabled && !paused} disabled={busy}
              aria-label={tx('pack.buddy.inBuddy', 'I’m in SNIFFER')}
              className={`bd-sw${s.enabled && !paused ? ' is-on' : ''}`}
              onClick={async () => {
                if (s.enabled) { await patchSettings({ enabled: false, paused_until: null }); return; }
                if (missing.length > 0) { setView('gate'); return; }
                await enable();
              }}><i /></button>
          </section>
          <p className="bd-note bd-note--center">
            {!s.enabled
              ? tx('pack.buddy.offNote', 'Off — nobody sees you')
              : paused
                ? tx('pack.buddy.pausedUntil', 'Paused until {d}', { d: new Date(s.paused_until!).toLocaleDateString() })
                : tx('pack.buddy.on', 'On')}
            {s.enabled && (
              <>
                {' · '}
                <button type="button" className="bd-link" onClick={() => void patchSettings({
                  paused_until: paused ? null : new Date(Date.now() + PAUSE_DAYS * 864e5).toISOString(),
                })}>{paused ? tx('pack.buddy.unpause', 'End pause') : tx('pack.buddy.pause', 'Pause {n} days', { n: PAUSE_DAYS })}</button>
              </>
            )}
          </p>

          <span className="bd-eyebrow">{tx('pack.sniffer.profile.title', 'Your profile')}</span>
          <SnifferProfile
            tx={tx}
            uid={session?.user.id ?? null}
            name={name}
            human={human}
            dogs={dogs}
            dogAttrsOf={(id) => profile?.dogs[id]}
            heroGender={heroGender}
            missing={missing}
            gateEditor={editor}
            gateSummary={summary}
          />

          {/* MÔJ RAJÓN (pin) je od kola 2 karta 3 vo Vašom profile vyššie, poradie ako celý profil. */}
          {/* ĽUDIA V OKOLÍ — východisko NIE (Matej 25. 9.). */}
          <section className="bd-card bd-areas" style={{ ...PACK_BOX.card }}>
            <label className="bd-switch">
              <span style={{ display: 'flex', flexDirection: 'column', gap: PACK_SPACE.xs }}>
                <b>{tx('pack.sniffer.nearby.toggle', 'Show me in People nearby')}</b>
                <small className="bd-note">{tx('pack.sniffer.nearby.hint', 'Everyone with SNIFFER around your pin can see you')}</small>
              </span>
              <input type="checkbox" checked={s.show_nearby} onChange={(e) => void patchSettings({ show_nearby: e.target.checked })} />
            </label>
          </section>

          <section className="bd-card" style={{ ...PACK_BOX.card }}>
            <span className="bd-eyebrow">{tx('pack.buddy.notify', 'Notifications')}</span>
            <label className="bd-switch">{tx('pack.buddy.notifyMatch', 'New match')}
              <input type="checkbox" checked={s.notify_match} onChange={(e) => void patchSettings({ notify_match: e.target.checked })} />
            </label>
            <label className="bd-switch">{tx('pack.buddy.notifyMail', 'Also by e-mail')}
              <input type="checkbox" checked={s.notify_mail} onChange={(e) => void patchSettings({ notify_mail: e.target.checked })} />
            </label>
          </section>
        </>
      )}
    </Shell>
  );
}

/** Onboarding len prvý raz (Matej 25. 9.: „toto by bolo asi len prvý krát"). Pohodlie
 *  jedného prehliadača — keď sa stratí, človek uvidí úvod znova a nič sa nerozbije. */
const INTRO_SEEN = 'dogypt_sniffer_intro';
function introSeen(): boolean { try { return localStorage.getItem(INTRO_SEEN) === '1'; } catch { return false; } }
function markIntroSeen() { try { localStorage.setItem(INTRO_SEEN, '1'); } catch { /* bez úložiska ostane úvod */ } }

/** Farba a kresba troch krokov úvodu (Matej 25. 9.: „zatraktívniť kroky farebne"). */
const HOW_STYLE: Record<'1' | '2' | '3', { bg: string; icon: string }> = {
  '1': { bg: T.accentGold, icon: 'badge' },
  '2': { bg: LAPIS.edge, icon: 'paw' },
  '3': { bg: T.growGreen, icon: 'nose' },
};

/** Heroglyf píše pohlavie majiteľa ako `man`/`woman` (starší zápis `male`/`female`). */
const HERO_GENDER: Record<string, Gender> = { man: 'male', male: 'male', woman: 'female', female: 'female' };

const HOW_EN: Record<'1' | '2' | '3', [string, string]> = {
  '1': ['Fill in your buddy card', 'You, your dog, what you’re looking for. All from your profile.'],
  '2': ['The dogs decide first', 'You only see people whose dogs get along with yours.'],
  '3': ['You catch each other’s scent', 'A match is just a notice. Writing is up to you.'],
};

function Shell({ title, onBack, backLabel, onGear, gearLabel, wide, fit, children }: {
  title: string; onBack: () => void; backLabel: string; onGear?: () => void; gearLabel?: string; wide?: boolean; fit?: boolean; children?: ReactNode;
}) {
  return (
    <div className="pk-paper bd-root">
      <style>{PAPER_PAGE_CSS}</style>
      <style>{PILL_CSS}</style>
      <style>{PF_FIELD_CSS}</style>
      <style>{PHOTO_CSS}</style>
      <style>{PROGRESS_CSS}</style>
      <style>{MEDALLION_CSS}</style>
      <style>{FLOW_CARVE_CSS}</style>
      <style>{CSS}</style>
      {/* HLAVIČKA BEZ NADPISU (Matej 25. 9.: „bez horného headru, šípku a nastavenia na
          okraje obsahu panela, nie úplne na kraj obrazovky"). Lišta preto stojí VNÚTRI
          stĺpca a jej kraje sú kraje kariet. Meno obrazovky nesie karta pod ňou. */}
      <main className={`bd-col${wide ? ' bd-col--wide' : ''}${fit ? ' bd-col--fit' : ''}`} aria-label={title}>
        <div className="bd-bar">
          <BackButton tone="pale" onClick={onBack} label={backLabel} />
          {onGear && (
            <button type="button" className="bd-gear" onClick={onGear} aria-label={gearLabel}>
              <BrandIcon name="sliders" size={PACK_SPACE.lg} tint="dark" />
            </button>
          )}
        </div>
        {children}
      </main>
      {/* Vlákno po zhode — stránka nemountuje PackLayout (kôš 3), tak si hostiteľa správ nesie sama. */}
      <MessagingOverlayHost />
    </div>
  );
}

function Pills({ options, selected, onToggle }: {
  options: Array<{ value: string; label: string }>; selected: readonly string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="bd-pills">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={selected.includes(o.value)}
          className={`pk-pill pk-pill--tap${selected.includes(o.value) ? ' is-on' : ''}`}
          onClick={() => onToggle(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

function IntentsEditor({ selected, tx }: { selected: Intent[]; tx: Tx }) {
  return (
    <Pills
      options={BUDDY_INTENTS.map((o) => ({ value: o.value, label: tx(`pack.buddy.intent.${o.value}`, o.labelEN) }))}
      selected={selected}
      onToggle={(v) => {
        const next = selected.includes(v as Intent) ? selected.filter((x) => x !== v) : [...selected, v as Intent];
        void saveHuman({ intents: next });
      }}
    />
  );
}

function AudienceEditor({ s, onPatch, tx }: {
  s: BuddySettings; onPatch: (p: Partial<BuddySettings>) => Promise<unknown>; tx: Tx;
}) {
  const g = s.show_to_genders;
  return (
    <>
      <Pills
        // Len muži a ženy (Matej 25. 9.: „komu sa ukážem iba mužom/ženám, ostatným nie").
        options={GENDER_OPTIONS.filter((o) => o.value === 'male' || o.value === 'female')
          .map((o) => ({ value: o.value, label: tx(`pack.buddy.showTo.${o.value}`, o.labelEN) }))}
        selected={g}
        onToggle={(v) => void onPatch({ show_to_genders: g.includes(v as Gender) ? g.filter((x) => x !== v) : [...g, v as Gender] })}
      />
      <AgeRange min={s.age_min} max={s.age_max} label={tx('pack.buddy.age', 'Age')}
        onCommit={(age_min, age_max) => void onPatch({ age_min, age_max })} />
      <Pills
        options={RADIUS_STEPS.map((r) => ({
          value: String(r),
          label: r === null ? tx('pack.buddy.anywhere', 'Anywhere') : tx('pack.buddy.km', 'up to {n} km', { n: r }),
        }))}
        selected={[String(s.radius_km)]}
        onToggle={(v) => void onPatch({ radius_km: v === 'null' ? null : Number(v) })}
      />
      <label className="bd-switch">{tx('pack.buddy.dogCompatOnly', 'Only dogs that get along with mine')}
        <input type="checkbox" checked={s.dog_compat_only} onChange={(e) => void onPatch({ dog_compat_only: e.target.checked })} />
      </label>
    </>
  );
}

/** Vek na posuvníku (Matej 25. 9.: „vek bude na slider"). Dva jazdce na jednej koľajnici;
 *  zapisuje sa až po pustení, nie pri každom pixeli ťahu. */
function AgeRange({ min, max, label, onCommit }: {
  min: number; max: number; label: string; onCommit: (min: number, max: number) => void;
}) {
  const LO = 18;
  const HI = 99;
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  useEffect(() => { setLo(min); setHi(max); }, [min, max]);
  const pct = (v: number) => `${((v - LO) / (HI - LO)) * 100}%`;
  const commit = () => { if (lo !== min || hi !== max) onCommit(lo, hi); };
  return (
    <>
      <div className="bd-switch">
        <span>{label}</span>
        <span className="bd-range__val">{lo}–{hi}</span>
      </div>
      <div className="bd-range" onPointerUp={commit} onKeyUp={commit} onTouchEnd={commit}>
        <span className="bd-range__rail" />
        <span className="bd-range__fill" style={{ left: pct(lo), right: `calc(100% - ${pct(hi)})` }} />
        <input type="range" min={LO} max={HI} value={lo} aria-label={`${label} min`}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))} />
        <input type="range" min={LO} max={HI} value={hi} aria-label={`${label} max`}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))} />
      </div>
    </>
  );
}

/** 0c — fotka človeka A psa. Kontrola AINUBISOM („vidím človeka aj psa") je krok 5 zadania. */
function PhotoEditor({ url, uid, tx }: { url?: string; uid: string | null; tx: Tx }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="bd-upl">
      {/* Malý štvorcový náhľad (Matej 25. 9.: „nahratie foto musí byť menšie, nie obrovské"). */}
      <div className={`pk-photo${url ? '' : ' bd-photo--empty'}`}>
        {url ? <img src={photoUrl(url)} alt="" /> : '+'}
      </div>
      <div>
      <p className="bd-note">{tx('pack.buddy.photoNote', 'Both of you have to be in it.')}</p>
      <input ref={input} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f || !uid) return;
        setBusy(true);
        setErr(null);
        try {
          // Ten istý tvar cesty ako avatar v `/pack/profile` (`avatars/<uid>`).
          const r = await uploadExtraPhoto(f, `buddy/${uid}`, 1);
          await saveHuman({ buddyPhoto: r.secureUrl });
        } catch (x) {
          setErr(x instanceof Error ? x.message : String(x));
        } finally {
          setBusy(false);
          e.target.value = '';
        }
      }} />
      <button type="button" className="bd-cta bd-cta--small" disabled={busy || !uid} onClick={() => input.current?.click()}>
        {busy ? '…' : url ? tx('pack.buddy.photoChange', 'Change photo') : tx('pack.buddy.photoPick', 'Choose photo')}
      </button>
      {err && <p className="bd-warn">{err}</p>}
      </div>
    </div>
  );
}
