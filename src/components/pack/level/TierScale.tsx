// ─────────────────────────────────────────────────────────────────────────────
// ŠKÁLA PÁSIEM — deväť materiálov pod sebou, aktuálne zvýraznené.
//
// Toto je jediné miesto, kde sa človek dozvie, že farby vôbec niečo znamenajú. Bez neho je
// farebná pilulka len ozdoba. Matejov nápad 24. 8.: *„v tripstats po kliknutí na pils levelu
// ukázať v dropdowne to poradie a farby levelov"*.
//
// Zoznam sa zámerne NESKRACUJE na okolie aktuálneho pásma: časť hodnoty je vidieť, že cesta
// pokračuje ďalej, než kam človek dovidí.
// ─────────────────────────────────────────────────────────────────────────────

import { FONT_TITLE, FONT_UI, PACK_THEME as T } from '@/components/pack/packTheme';
import { PACK_TIERS, tierGradient, tierIndexOfLevel, tierRangeLabel } from '@/lib/packTiers';
import { useT } from '@/i18n/LanguageContext';

export interface TierScaleProps {
  /** aktuálny level človeka — riadok jeho pásma dostane rám a značku „tu si" */
  level: number;
  /** tmavý podklad (mapa, reveal) vs. papyrusová karta */
  onDark?: boolean;
}

export function TierScale({ level, onDark = true }: TierScaleProps) {
  const t = useT();
  const here = tierIndexOfLevel(level);
  const ink = onDark ? 'rgba(245,240,228,0.86)' : T.inkStrong;
  const dim = onDark ? 'rgba(245,240,228,0.5)' : T.inkWarm;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {PACK_TIERS.map((tier, i) => {
        const isHere = i === here;
        return (
          <div
            key={tier.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '3px 7px',
              borderRadius: 10,
              // aktuálne pásmo drží rám vo svojej farbe — nie zlatý, inak by zlaté pásmo
              // vyzeralo zvýraznené vždy a modré nikdy
              border: `1px solid ${isHere ? tier.a : 'transparent'}`,
              background: isHere
                ? (onDark ? 'rgba(245,240,228,0.07)' : 'rgba(201,154,63,0.10)')
                : 'transparent',
            }}
          >
            <span
              style={{
                flex: '0 0 auto',
                minWidth: 96,
                textAlign: 'center',
                padding: '4px 11px',
                borderRadius: 999,
                border: '1px solid rgba(250,244,236,0.30)',
                background: tierGradient(tier),
                color: tier.ink,
                fontFamily: FONT_TITLE,
                fontWeight: 700,
                fontSize: 10.5,
                letterSpacing: '.10em',
                textTransform: 'uppercase',
                // pásma, ktoré ešte nemá, sú tlmené — škála tým ukazuje postup, nie katalóg
                opacity: i <= here ? 1 : 0.55,
              }}
            >
              {t(`pack.tier.${tier.key}`)}
            </span>
            <span
              style={{
                flex: '1 1 auto',
                fontFamily: FONT_UI,
                fontSize: 11.5,
                letterSpacing: '.02em',
                color: isHere ? ink : dim,
              }}
            >
              {t('pack.tier.levelRange', { range: tierRangeLabel(tier) })}
            </span>
            {isHere && (
              <span
                style={{
                  flex: '0 0 auto',
                  fontFamily: FONT_UI,
                  fontWeight: 600,
                  fontSize: 9.5,
                  letterSpacing: '.16em',
                  textTransform: 'uppercase',
                  color: tier.a,
                }}
              >
                {t('pack.tier.youAreHere')}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
