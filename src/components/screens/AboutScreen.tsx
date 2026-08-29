import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import { DateDropdowns } from '@/components/DateDropdowns';
import { COUNTRIES } from '@/lib/flowCountries';
import { countryFlag } from '@/lib/countryGeo';
import { useT } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';

// ── /heroglyph/about — papierovačky: odkiaľ pes je a odkedy tu je.
//
// Vzniklo 28. 8. 2026 rozdelením /heroglyph/name. Meno zostalo ľahkou otázkou,
// tieto dve polia sú jediná nudná karta vo flow — a vie to o sebe.
//
// Krajina → 15. segment kódu heroglyfu + vlajka na stene.
// Dátum narodenia → 16. segment (rok) + vek psa v /pack.
// Back: /heroglyph/why  ·  Continue: /heroglyph/breed
export function AboutScreen() {
  const navigate = useNavigate();
  // Bez mena psa je tento krok bezcenný: draft sa neuloží a texty ukazujú „tvojho psa“.
  // Po obnovení stránky je store prázdny, takže guard vráti človeka na začiatok flow.
  const flowOk = useFlowGuard();
  const t = useT();
  const setSelection = useDogyptStore((s) => s.setSelection);
  const selections = useDogyptStore((s) => s.selections);
  const dogName = useDogyptStore((s) => s.dogName);

  const today = new Date();
  const currentYear = today.getFullYear();

  const stored = {
    d: parseInt(selections.birthdayDay || '0'),
    m: parseInt(selections.birthdayMonth || '0'),
    y: parseInt(selections.birthdayYear || '0'),
  };
  const hasStored = stored.d && stored.m && stored.y;

  const [dogCountry, setDogCountry] = useState<string>(selections.country || '');
  const [day, setDay] = useState<number>(hasStored ? stored.d : 1);
  const [month, setMonth] = useState<number>(hasStored ? stored.m : 1);
  const [year, setYear] = useState<number>(hasStored ? stored.y : currentYear - 5);
  const [touched, setTouched] = useState<boolean>(!!hasStored);

  const canContinue = dogCountry !== '' && touched;

  const handleContinue = () => {
    if (!canContinue) return;
    setSelection('country', dogCountry);
    setSelection('birthdayDay', String(day).padStart(2, '0'));
    setSelection('birthdayMonth', String(month).padStart(2, '0'));
    setSelection('birthdayYear', String(year));
    navigate('/heroglyph/breed');
  };

  const displayName = dogName || t('heroglyph.flow.yourDogFallback');

  if (!flowOk) return null;

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar onBack={() => navigate('/heroglyph/why')} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 md:gap-4">

          {/* Otázka — brand gradient, rovnaký tvar ako ostatné kroky flow */}
          <motion.div
            className="w-full rounded-2xl p-4 md:p-5"
            style={{ background: 'var(--brand-gradient)' }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h2
              className="text-center text-lg md:text-xl font-bold leading-snug"
              style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
            >
              {t('heroglyph.flow.about.title', { dogName: displayName })}
            </h2>
            <p
              className="text-center text-xs md:text-sm mt-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(250,244,236,0.72)' }}
            >
              {t('heroglyph.flow.about.sub')}
            </p>
          </motion.div>

          {/* Polia — papyrus karta */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex flex-col gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <p
              className="text-xs md:text-sm uppercase tracking-widest text-muted-foreground text-center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {t('heroglyph.flow.name.dogCountry')}
            </p>

            {/* Krajina psa — na celú šírku, takže v zavretom poli je vlajka aj názov. */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={dogCountry}
                onChange={(e) => setDogCountry(e.target.value)}
                aria-label={t('heroglyph.flow.name.dogCountry')}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  width: '100%',
                  height: 48,
                  background: dogCountry ? 'hsl(var(--papyrus))' : 'hsl(var(--card))',
                  border: dogCountry ? '2px solid hsl(var(--gold))' : '2px solid hsl(var(--gold) / 0.5)',
                  borderRadius: 12,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  color: dogCountry ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.6)',
                  paddingLeft: 24,
                  paddingRight: 24,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">{t('heroglyph.flow.name.dogCountry')}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{countryFlag(c) || '🏳'} {c}</option>
                ))}
              </select>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  right: 10,
                  pointerEvents: 'none',
                  color: 'hsl(var(--gold))',
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >▾</span>
            </div>

            <p
              className="text-xs md:text-sm uppercase tracking-widest text-muted-foreground text-center mt-1"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {t('heroglyph.flow.name.birthday')}
            </p>
            <DateDropdowns
              day={day}
              month={month}
              year={year}
              minYear={currentYear - 25}
              maxYear={currentYear}
              maxDate={today}
              onChange={(d, m, y) => { setDay(d); setMonth(m); setYear(y); setTouched(true); }}
            />

            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full rounded-xl gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
              }}
            >
              {t('heroglyph.flow.name.continue')}
            </Button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
