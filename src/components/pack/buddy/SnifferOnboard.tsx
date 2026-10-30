// SNIFFER — ONBOARDING ZOZNAMKY (30. 10. 2026). Nahrádza tri úvodné obrazovky a 10-položkovú bránu.
// Nákres plany/nakres-sniffer-onboarding-2026-10-30.html · pamäť project_dogypt_sniffer_onboarding_profil_2026-10-30.
// Matej: *„po kliku by nasledoval onboarding zoznamka a posledný krok by bol vyplniť profil … aby potom
// človek vedel ísť swajpovať"* → *„A a ok"*.
//
// Poradie: KOHO HĽADÁM → RAJÓN → FOTKY (min. 3) → TVOJA KARTA (= profil) → SNIFF ON → swipe.
// 🔴 Krok 4 je VARIANT A: chýbajúce polia PROFILU sa dopĺňajú TU, ale zapisujú sa do profilu
//    (`saveHuman` / `saveDogAttrs`) — žiadne nové miesto na údaje, žiadny skok do editora.
//    Kto má profil plný, uvidí len svoju kartu a SNIFF ON.
// 🔴 Brána (čo musí byť hotové) je stále `buddyGate.ts` + `buddy_gate_missing()` na serveri.
//    Minimum 3 fotiek je pravidlo ONBOARDINGU (klient); server chce `buddyPhoto` ako doteraz.
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PACK_BOX, PACK_SPACE } from '@/components/pack/packTheme';
import { useLang } from '@/i18n/LanguageContext';
import type { DogProfileAttrs, HumanProfile } from '@/components/pack/profile/packProfile';
import { emptyDogAttrs } from '@/components/pack/profile/packProfile';
import type { BuddySettings, BuddyStepKey } from './buddyGate';
import { SnifferPinEditor, SnifferCountryChip, defaultCountry } from './SnifferPin';
import { SnifferMyCard, SNIFFER_CARD_CSS } from './SnifferCard';
import { SNIFFER_PROFILE_CSS, PhotoSlots, KvRow, DogGateRows, type SnifferProfileDog } from './SnifferProfile';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;
export type OnbStep = 'who' | 'patch' | 'photos' | 'card';
export const ONB_STEPS: OnbStep[] = ['who', 'patch', 'photos', 'card'];
type Step = OnbStep;
const STEPS = ONB_STEPS;

/** Minimum fotiek v SNIFFERi (Matej 30. 10.: „v snifferi by bolo povinne pridať viacero fotiek"). */
export const SNIFFER_MIN_PHOTOS = 3;

/** Prvý nehotový krok — kto sa vráti v polovici, pokračuje tam, kde prestal. */
export function firstOnbStep(human: HumanProfile | undefined, missing: BuddyStepKey[]): OnbStep {
  const photos = human?.buddyPhotos?.length ? human.buddyPhotos : human?.buddyPhoto ? [human.buddyPhoto] : [];
  if (missing.includes('intents') || missing.includes('audience')) return 'who';
  if (!human?.pin) return 'patch';
  if (photos.length < SNIFFER_MIN_PHOTOS || !human?.buddyPhoto) return 'photos';
  return 'card';
}

/** Body profilu, ktoré dopĺňa krok „Tvoja karta". Zvyšok brány (zámery, komu, fotka) majú skoršie kroky. */
const PROFILE_KEYS: BuddyStepKey[] = ['name', 'age', 'gender', 'region'];
const DOG_KEYS: BuddyStepKey[] = ['temperament', 'fitness', 'compat'];

const CSS = `
.so-cardwrap{height:clamp(${PACK_SPACE.xxxl * 4}px, 38dvh, ${PACK_SPACE.xxxl * 7}px);flex:0 0 auto;}
.so-cardwrap .sn-stage{min-height:0;height:100%;}
.so-from{margin:0;text-align:center;}
`;

export function SnifferOnboard({
  step, onStep, tx, uid, human, settings, onPatch, dogs, dogAttrsOf, buddyDogId, homeCountry, missing, heroGender,
  editor, summary, intentsEditor, audienceEditor, onEnable, busy, note, reloadKey, suggestPhotos,
}: {
  step: OnbStep;
  onStep: (s: OnbStep) => void;
  tx: Tx;
  uid: string | null;
  human: HumanProfile | undefined;
  settings: BuddySettings;
  onPatch: (p: Partial<BuddySettings>) => unknown;
  dogs: SnifferProfileDog[];
  dogAttrsOf: (id: string) => DogProfileAttrs | undefined;
  /** Pes, ktorého brána berie (`pickBuddyDog`) — jeho riadky sa dopĺňajú. */
  buddyDogId: string | null;
  homeCountry: string | null;
  missing: BuddyStepKey[];
  heroGender: string | null;
  editor: (k: BuddyStepKey) => ReactNode;
  summary: (k: BuddyStepKey) => string;
  intentsEditor: ReactNode;
  audienceEditor: (part: 'who' | 'dogs') => ReactNode;
  onEnable: () => void;
  busy: boolean;
  note?: ReactNode;
  reloadKey?: string;
  /** Fotky, ktoré už človek má v profile (fotka, titulka, psy). */
  suggestPhotos: string[];
}) {
  const navigate = useNavigate();
  const { lang } = useLang();
  const photos = human?.buddyPhotos?.length ? human.buddyPhotos : human?.buddyPhoto ? [human.buddyPhoto] : [];
  const photosOk = photos.length >= SNIFFER_MIN_PHOTOS && !!human?.buddyPhoto;
  const whoOk = !missing.includes('intents') && !missing.includes('audience');
  const profileMissing = PROFILE_KEYS.filter((k) => missing.includes(k) && !(k === 'gender' && heroGender));
  const dogMissing = DOG_KEYS.some((k) => missing.includes(k));
  const dog = dogs.find((d) => d.id === buddyDogId) ?? null;

  const [iso, setIso] = useState(() => defaultCountry(human?.pin, human?.nationality, lang, homeCountry));
  const idx = STEPS.indexOf(step);
  const go = onStep;

  const missCount = profileMissing.length + (dogMissing ? DOG_KEYS.filter((k) => missing.includes(k)).length : 0);
  const head = useMemo(() => ({
    who: [tx('pack.sniffer.onb.whoTitle', 'Who for?'), tx('pack.sniffer.onb.whoSub', 'Only SNIFFER sees this — never your profile.')],
    patch: [tx('pack.sniffer.profile.patchTitle', 'My patch'), tx('pack.sniffer.profile.patchSub', 'Where we spend most of our time')],
    photos: [tx('pack.sniffer.onb.photosTitle', 'Photos'), tx('pack.sniffer.onb.photosSub', 'At least {n} · on one you’re together with your dog', { n: SNIFFER_MIN_PHOTOS })],
    card: [tx('pack.sniffer.onb.cardTitle', 'Your card'), missCount
      ? tx('pack.sniffer.onb.cardMissing', 'Built from your profile · {n} missing', { n: missCount })
      : tx('pack.sniffer.onb.cardReady', 'Built from your profile · ready')],
  } as Record<Step, [string, string]>), [tx, missCount]);

  const cta: { label: string; disabled: boolean; onClick: () => void } =
    step === 'who' ? { label: tx('pack.buddy.next', 'Next'), disabled: !whoOk, onClick: () => go('patch') }
    : step === 'patch' ? { label: tx('pack.buddy.next', 'Next'), disabled: false, onClick: () => go('photos') }
    : step === 'photos' ? {
      label: photosOk ? tx('pack.buddy.next', 'Next') : `${photos.length} / ${SNIFFER_MIN_PHOTOS}`,
      disabled: !photosOk, onClick: () => go('card'),
    }
    : {
      label: missCount ? tx('pack.buddy.left', '{n} more to fill in', { n: missCount }) : tx('pack.sniffer.profile.enable', 'Switch SNIFFER on'),
      disabled: missCount > 0 || busy || !whoOk || !photosOk, onClick: onEnable,
    };

  return (
    <div className="sp-pager sp-pager--fit">
      <style>{SNIFFER_PROFILE_CSS}</style>
      <style>{SNIFFER_CARD_CSS}</style>
      <style>{CSS}</style>
      <div className="sp-dots">
        {STEPS.map((s, i) => (
          <button key={s} type="button" className={s === step ? 'is-on' : ''} aria-current={s === step}
            aria-label={`${i + 1} / ${STEPS.length}`} disabled={i > idx} onClick={() => go(s)} />
        ))}
      </div>
      <section key={step} className="sp-card" style={{ ...PACK_BOX.card }}>
        <div className="sp-head">
          <div>
            <h3 className="sp-title">{head[step][0]}</h3>
            <p className="sp-sub">{head[step][1]}</p>
          </div>
          {step === 'patch' && <SnifferCountryChip iso={iso} onPick={setIso} tx={tx} />}
        </div>

        <div className="sp-body">
          {step === 'who' && (
            <div className="sp-cols">
              <div>
                <span className="sp-sec">{tx('pack.sniffer.profile.seekWhat', 'What for')}</span>
                {intentsEditor}
              </div>
              <div>
                <span className="sp-sec">{tx('pack.sniffer.profile.seekShow', 'Who sees us')}</span>
                {audienceEditor('who')}
                {audienceEditor('dogs')}
              </div>
            </div>
          )}

          {step === 'patch' && (
            <>
              <SnifferPinEditor tx={tx} pin={human?.pin} iso={iso} radiusKm={settings.radius_km}
                onRadius={(km) => void onPatch({ radius_km: km })} />
              <p className="bd-note">{tx('pack.sniffer.pin.note2', 'Tap inside the country to drop your pin · others only see how far you are')}</p>
            </>
          )}

          {step === 'photos' && (
            <PhotoSlots uid={uid} photos={photos} together={human?.buddyPhoto ?? null} tx={tx} suggest={suggestPhotos} note={false} />
          )}

          {step === 'card' && (
            <>
              <div className="so-cardwrap"><SnifferMyCard tx={tx} reloadKey={reloadKey} /></div>
              {PROFILE_KEYS.filter((k) => profileMissing.includes(k)).map((k) => (
                <KvRow key={k} tx={tx} label={tx(`pack.buddy.step.${k}`, k)} value={summary(k)} todo>{editor(k)}</KvRow>
              ))}
              {dog && dogMissing && (
                <DogGateRows dog={dog} attrs={dogAttrsOf(dog.id) ?? emptyDogAttrs(dog.id)} tx={tx} onlyMissing />
              )}
              <p className="bd-note so-from">
                {tx('pack.sniffer.onb.editHint', 'Everything else lives in your profile.')}{' '}
                <button type="button" className="bd-link" onClick={() => navigate('/pack/profile/edit')}>
                  {tx('pack.sniffer.onb.editProfile', 'Edit profile')}
                </button>
              </p>
            </>
          )}
        </div>

        <div className="sp-foot">
          {step === 'card' && note}
          <button type="button" className="bd-cta" disabled={cta.disabled} onClick={cta.onClick}>{cta.label}</button>
        </div>
      </section>
    </div>
  );
}
