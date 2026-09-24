// BUDDY (SK Parťáci, interne ASSNIF) — `/pack/buddy`. Krok 3: vstup, brána do 100 %, nastavenia.
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
import { uploadExtraPhoto } from '@/services/cloudinaryService';
import { BackButton } from '@/components/pack/BackButton';
import { AinubisBubble } from '@/components/pack/ainubisSheet';
import { BrandIcon } from '@/components/pack/BrandIcon';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PAGE_AIR,
  PAPER_PAGE_CSS, PILL_CSS, PF_FIELD_CSS, PHOTO_CSS, PROGRESS_CSS, FONT_TITLE, FONT_UI,
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

type View = 'intro' | 'gate' | 'done' | 'settings' | 'home';
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
.bd-top{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:48px 1fr 48px;align-items:center;
  padding:${PAGE_AIR.min}px ${PAGE_AIR.side}px ${PACK_SPACE.sm}px;}
.bd-top h1{margin:0;text-align:center;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;
  letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.bd-gear{justify-self:end;width:40px;height:40px;border-radius:${PACK_R.pill}px;border:1px solid ${T.border};
  background:${T.tileBg};display:flex;align-items:center;justify-content:center;cursor:pointer;}
.bd-col{width:100%;max-width:640px;margin:0 auto;padding:0 ${PAGE_AIR.side}px ${PAGE_AIR.md}px;
  display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;}
.bd-group{display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.bd-eyebrow{font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;
  text-transform:uppercase;color:${T.inkWarm};}
.bd-row{display:flex;align-items:center;gap:${PACK_SPACE.md}px;width:100%;padding:${PACK_SPACE.md}px;
  background:transparent;border:0;cursor:pointer;text-align:left;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.bd-row b{font-weight:600;}
.bd-row small{display:block;font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.bd-row > span:last-child{flex:1 1 auto;min-width:0;}
.bd-mark{flex:0 0 auto;width:24px;height:24px;border-radius:${PACK_R.pill}px;display:flex;align-items:center;
  justify-content:center;font-size:${PACK_TEXT.label}px;font-weight:600;border:1px solid ${T.border};color:${T.inkWarm};}
.bd-mark.is-done{${pickTintCSS(TRAFFIC_COLORS.green, PICK_INK.green, 0.16)}}
.bd-edit{padding:0 ${PACK_SPACE.md}px ${PACK_SPACE.md}px;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
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
.bd-hero{display:flex;flex-direction:column;align-items:center;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.xl}px ${PACK_SPACE.lg}px;text-align:center;}
.bd-hero h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;letter-spacing:.14em;
  text-transform:uppercase;color:${T.inkStrong};}
.bd-sub{padding:${PACK_SPACE.md}px;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;}
.bd-photo{width:100%;aspect-ratio:4/3;}
.bd-photo--empty{display:flex;align-items:center;justify-content:center;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.bd-tabs{display:flex;gap:${PACK_SPACE.xs}px;padding:${PACK_SPACE.xs}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.border};}
.bd-tabs span{flex:1 1 0;text-align:center;padding:${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;font-family:${FONT_UI};
  font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkFaint};}
.bd-tabs span.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
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
  const [open, setOpen] = useState<BuddyStepKey | null>(null);
  const [serverMissing, setServerMissing] = useState<BuddyStepKey[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [dogPick, setDogPick] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const { profile } = useProfile();
  const { dogs, loading: dogsLoading } = usePackUser(session?.user?.id ?? null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    loadBuddySettings().then(setSettings);
  }, []);

  // Prvé otvorenie: zapnutý ide rovno dnu, ostatní cez úvod (0a).
  useEffect(() => {
    if (settings && view === null) setView(settings.enabled ? 'home' : 'intro');
  }, [settings, view]);

  const meta = (session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
  const orderName = dogs.map((d) => d.owner_name?.trim()).find(Boolean) ?? '';
  const name = (meta.full_name ?? '').trim() || orderName;

  const human = profile?.human;
  const dog = useMemo(() => {
    const chosen = dogPick ? dogs.find((d) => d.id === dogPick) : null;
    return chosen ?? pickBuddyDog(dogs, (id) => profile?.dogs[id]);
  }, [dogs, dogPick, profile]);
  const dogAttrs: DogProfileAttrs | undefined = dog ? (profile?.dogs[dog.id] ?? emptyDogAttrs(dog.id)) : undefined;

  const s = settings ?? DEFAULT_BUDDY_SETTINGS;
  const missing = buddyGateMissing({ name, human, dogAttrs, hasDog: !!dog, settings: s });
  const doneCount = BUDDY_STEPS.length - missing.length;
  // Šírka výplne receptu `.pk-progress` (PROGRESS_CSS) — pruh nekreslíme, len mu dávame číslo.
  const gateFill = `${Math.round((doneCount / BUDDY_STEPS.length) * 100)}%`;
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
    : view === 'gate' && missing.length
      ? tx('pack.buddy.gateTitle', '{n} of {total} missing', { n: missing.length, total: BUDDY_STEPS.length })
      : tx('pack.buddy.title', 'Buddies');

  const back = () => {
    if (view === 'settings') setView(s.enabled ? 'home' : 'gate');
    else if (view === 'gate') setView('intro');
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
      gearLabel={tx('pack.buddy.settings', 'Settings')}>
      {view === 'intro' && (
        <>
          <AinubisBubble>
            {tx('pack.buddy.intro', 'Buddies are people your dog goes out with. Until you switch it on, you see nobody — and nobody sees you.')}
          </AinubisBubble>
          <button type="button" className="bd-cta" onClick={() => setView('gate')}>
            {tx('pack.buddy.introCta', 'I want buddies')}
          </button>
          <p className="bd-note bd-note--center">{tx('pack.buddy.introOff', 'Off by default')}</p>
        </>
      )}

      {view === 'gate' && (
        <>
          <div className="pk-progress" aria-hidden>
            <div className={`pk-progress__fill${missing.length ? ' pk-progress__fill--low' : ' pk-progress__fill--done'}`}
              style={{ width: gateFill }} />
          </div>
          <p className="bd-note">{tx('pack.buddy.gateNote', 'Everything you fill in here goes to your profile and your dog’s DOG ID — nothing twice.')}</p>

          {(['human', 'dog', 'buddy'] as const).map((group) => (
            <div key={group} className="bd-group">
              <span className="bd-eyebrow">
                {group === 'dog'
                  ? (dog?.dog_name ?? tx('pack.buddy.dog', 'Dog'))
                  : tx(`pack.buddy.group.${group}`, group === 'human' ? 'You' : 'Buddies')}
              </span>
              {group === 'dog' && dogs.length > 1 && (
                <Pills
                  options={dogs.map((d) => ({ value: d.id, label: d.dog_name ?? '—' }))}
                  selected={dog ? [dog.id] : []}
                  onToggle={(v) => setDogPick(v)}
                />
              )}
              {BUDDY_STEPS.filter((st) => st.group === group).map((st) => {
                const i = BUDDY_STEPS.findIndex((x) => x.key === st.key);
                const done = !missing.includes(st.key);
                const isOpen = open === st.key;
                return (
                  <div key={st.key} style={{ ...PACK_BOX.row }}>
                    <button type="button" className="bd-row" aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : st.key)}>
                      <span className={`bd-mark${done ? ' is-done' : ''}`} aria-hidden>
                        {done ? <BrandIcon name="paw-solid" size={PACK_SPACE.md} tint="good" /> : i + 1}
                      </span>
                      <span>
                        <b>{stepLabel(st.key)}</b>
                        <small>{summary(st.key)}</small>
                      </span>
                    </button>
                    {isOpen && <div className="bd-edit">{editor(st.key)}</div>}
                  </div>
                );
              })}
            </div>
          ))}

          {serverMissing && serverMissing.length > 0 && (
            <p className="bd-warn">
              {tx('pack.buddy.serverMissing', 'Still missing: {list}', { list: serverMissing.map(stepLabel).join(', ') })}
            </p>
          )}
          <button type="button" className="bd-cta" disabled={missing.length > 0 || busy} onClick={enable}>
            {tx('pack.buddy.enable', 'Switch on')}
          </button>
        </>
      )}

      {view === 'done' && (
        <div className="bd-hero" style={{ ...PACK_BOX.card }}>
          <h2>{tx('pack.buddy.doneTitle', 'You’re in the buddy pack')}</h2>
          <p className="bd-note">{tx('pack.buddy.doneNote', 'Your card shows only to people who meet your conditions — and you theirs.')}</p>
          <button type="button" className="bd-cta" onClick={() => setView('home')}>{tx('pack.buddy.showMe', 'Show me them')}</button>
        </div>
      )}

      {view === 'home' && (
        <>
          <div className="bd-tabs" role="tablist">
            <span className="is-on">{tx('pack.buddy.tab.deck', 'Deck')}</span>
            <span>{tx('pack.buddy.tab.search', 'Search')}</span>
            <span>{tx('pack.buddy.tab.matches', 'Matches')}</span>
          </div>
          <AinubisBubble>
            {tx('pack.buddy.deckSoon', 'The deck is being built. You’re switched on, so the moment it opens, people who fit will see you.')}
          </AinubisBubble>
          {paused && (
            <p className="bd-note">{tx('pack.buddy.pausedUntil', 'Paused until {d}', { d: new Date(s.paused_until!).toLocaleDateString() })}</p>
          )}
        </>
      )}

      {view === 'settings' && (
        <>
          <section className="bd-sub" style={{ ...PACK_BOX.subblock }}>
            <span className="bd-eyebrow">{tx('pack.buddy.inBuddy', 'I’m in Buddies')}</span>
            {s.enabled ? (
              <>
                <p className="bd-note">
                  {paused
                    ? tx('pack.buddy.pausedUntil', 'Paused until {d}', { d: new Date(s.paused_until!).toLocaleDateString() })
                    : tx('pack.buddy.on', 'On')}
                </p>
                <div className="bd-pills">
                  <button type="button" className="pk-pill pk-pill--tap" onClick={() => void patchSettings({
                    paused_until: paused ? null : new Date(Date.now() + PAUSE_DAYS * 864e5).toISOString(),
                  })}>{paused ? tx('pack.buddy.unpause', 'End pause') : tx('pack.buddy.pause', 'Pause {n} days', { n: PAUSE_DAYS })}</button>
                  <button type="button" className="pk-pill pk-pill--tap" onClick={async () => {
                    await patchSettings({ enabled: false, paused_until: null });
                    setView('intro');
                  }}>{tx('pack.buddy.off', 'Switch off')}</button>
                </div>
              </>
            ) : (
              <button type="button" className="bd-cta bd-cta--small" onClick={() => setView('gate')}>
                {tx('pack.buddy.gateGo', 'Fill in and switch on')}
              </button>
            )}
          </section>
          <section className="bd-sub" style={{ ...PACK_BOX.subblock }}>
            <span className="bd-eyebrow">{stepLabel('intents')}</span>
            <IntentsEditor selected={human?.intents ?? []} tx={tx} />
          </section>
          <section className="bd-sub" style={{ ...PACK_BOX.subblock }}>
            <span className="bd-eyebrow">{stepLabel('audience')}</span>
            <AudienceEditor s={s} onPatch={patchSettings} tx={tx} />
          </section>
          <section className="bd-sub" style={{ ...PACK_BOX.subblock }}>
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

function Shell({ title, onBack, backLabel, onGear, gearLabel, children }: {
  title: string; onBack: () => void; backLabel: string; onGear?: () => void; gearLabel?: string; children?: ReactNode;
}) {
  return (
    <div className="pk-paper bd-root">
      <style>{PAPER_PAGE_CSS}</style>
      <style>{PILL_CSS}</style>
      <style>{PF_FIELD_CSS}</style>
      <style>{PHOTO_CSS}</style>
      <style>{PROGRESS_CSS}</style>
      <style>{CSS}</style>
      <header className="bd-top">
        <BackButton tone="pale" onClick={onBack} label={backLabel} />
        <h1>{title}</h1>
        {onGear ? (
          <button type="button" className="bd-gear" onClick={onGear} aria-label={gearLabel}>
            <BrandIcon name="sliders" size={PACK_SPACE.lg} tint="dark" />
          </button>
        ) : <span />}
      </header>
      <main className="bd-col">{children}</main>
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
        options={GENDER_OPTIONS.filter((o) => o.value !== 'undisclosed')
          .map((o) => ({ value: o.value, label: tx(`pack.buddy.showTo.${o.value}`, o.labelEN) }))}
        selected={g}
        onToggle={(v) => void onPatch({ show_to_genders: g.includes(v as Gender) ? g.filter((x) => x !== v) : [...g, v as Gender] })}
      />
      <div className="bd-inline">
        <span className="bd-note">{tx('pack.buddy.age', 'Age')}</span>
        <input className="pf-field bd-field" type="number" min={18} max={99} defaultValue={s.age_min}
          onBlur={(e) => void onPatch({ age_min: Math.max(18, Math.min(Number(e.target.value) || 18, s.age_max)) })} />
        <span className="bd-note">–</span>
        <input className="pf-field bd-field" type="number" min={18} max={99} defaultValue={s.age_max}
          onBlur={(e) => void onPatch({ age_max: Math.min(99, Math.max(Number(e.target.value) || 99, s.age_min)) })} />
      </div>
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

/** 0c — fotka človeka A psa. Kontrola AINUBISOM („vidím človeka aj psa") je krok 5 zadania. */
function PhotoEditor({ url, uid, tx }: { url?: string; uid: string | null; tx: Tx }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <div className={`pk-photo bd-photo${url ? '' : ' bd-photo--empty'}`}>
        {url ? <img src={url} alt="" /> : tx('pack.buddy.photoEmpty', 'You and your dog in one photo')}
      </div>
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
    </>
  );
}
