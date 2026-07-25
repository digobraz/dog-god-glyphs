// Psia galéria — accordion (zbalené foto·meno·heroglyf → rozbalené BIO+tagy). Zdieľané medzi
// editorom (PackProfile.tsx §2, editable) a read-profilom (PublicProfile.tsx §3, read-only) —
// zadanie-profil-read-dog-2026-07-25. Chevron = lucide (rovnaký precedent ako existujúci
// open/close chevron v PackDogDetail.tsx — hand-drawn sada nemá chevron/arrow-down variant).
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
}: {
  dogs: DogGalleryEntry[];
  editable: boolean;
  onSaveBio?: (dogId: string, bio: string) => void;
  onToggleTag?: (dogId: string, group: 'temperament' | 'trail', tag: string) => void;
  onSaveCard?: (dogId: string, patch: Partial<DogCard>) => void;
  addSlot?: React.ReactNode;
  openId?: string | null;             // voliteľné — ovládané zvonka (napr. deep-link na jedného psa)
  onOpenChange?: (id: string | null) => void;
}) {
  const [localOpenId, setLocalOpenId] = useState<string | null>(null);
  const openId = controlledOpenId !== undefined ? controlledOpenId : localOpenId;
  const setOpenId = onOpenChange ?? setLocalOpenId;

  if (dogs.length === 0 && !addSlot) return null;

  // Riadok sa škáluje podľa počtu psov — 1-2 psy = veľký blok (vypĺňa stĺpec
  // po odstránení Stats & Badges), 3+ = kompaktný, aby zoznam nerástol donekonečna
  // (Matej 2026-07-25).
  const scale: RowScale = dogs.length >= 3 ? 'compact' : 'large';

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
          <span className="block truncate" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: S.name, fontWeight: 600, color: T.ink }}>
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

          <TagGroup
            label={t('pack.dogProfile.temperament')}
            options={DOG_TEMPERAMENT_TAGS as readonly string[]}
            selected={dog.attrs.tags.temperament}
            editable={editable}
            max={MAX_DOG_TEMPERAMENT}
            onToggle={(v) => onToggleTag?.(dog.id, 'temperament', v)}
          />

          {/* ── VRSTVA 1 — ZÁKLAD ── */}
          <SubSection
            title={t('pack.dogCard.basics')}
            filled={countFilled(card.sizeClass, card.neutered, card.origin)}
            total={3}
            defaultOpen
            editable={editable}
          >
            {/* Šírky podľa obsahu: veľkosť je len S/M/L/XL, kastrácia potrebuje dve
                pills v JEDNOM riadku, pôvod dostane zvyšok. */}
            <FieldGrid template="auto auto minmax(0, 1fr)">
              <SelectRow label={t('pack.dogCard.size')} value={card.sizeClass} options={DOG_SIZE_OPTIONS} editable={editable} onChange={(v) => set('sizeClass', v)} />
              <NeuterPills label={t('pack.dogCard.neutered')} value={card.neutered} sex={sex} editable={editable} onChange={(v) => set('neutered', v)} />
              <SelectRow label={t('pack.dogCard.origin')} value={card.origin} options={DOG_ORIGIN_OPTIONS} editable={editable} onChange={(v) => set('origin', v)} />
            </FieldGrid>
            {(isIntactFemale || card.origin) && (
              <div style={{ marginTop: 8 }}>
                <FieldGrid cols={3}>
                  {isIntactFemale && (
                    <DateRow label={t('pack.dogCard.heatLast')} value={card.heatLast} editable={editable} onChange={(v) => set('heatLast', v)} />
                  )}
                  {card.origin && (
                    <DateRow label={t('pack.dogCard.originSince')} value={card.originSince} editable={editable} onChange={(v) => set('originSince', v)} />
                  )}
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

        </div>
      )}
    </div>
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
        style={{
          width: '100%',
          background: T.bg,
          border: `1px solid ${T.hairline}`,
          borderRadius: 10,
          padding: '8px 12px 20px',
          minHeight: 48,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          lineHeight: 1.4,
          outline: 'none',
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
