import { useCallback, useEffect, useRef, useState } from 'react';
import { verseForDay } from '@/data/dailyQuotes';
import { useT, useLang } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { FONT_TITLE, FONT_UI } from './packTheme';

const GOLD = '#C99A3F';

// KÁNON JE ORIGINÁL (Matej 2026-08-13: „dajme každému anglický originál citátu a pri kliknutí
// naň sa zobrazí preklad — ktorý vedia členovia nahlásiť ako zlý… ale nech máme všade ok
// originál"). Dôvod nie je lenivosť pri preklade: osem citátov v roku stojí na slovnej hračke,
// ktorú slovenčina nemá (`bark` = kôra aj štekať, `four-letter word`, Nashov rým) — v origináli
// vtip žije, v preklade zomrie. Audit navyše ukázal 54 % chybovosť SK dávky, takže preklad
// nie je text, za ktorý by sme sa mali stavať ako za kánon.
//
// Odkrytie: HOVER na myši, ŤUKNUTIE na dotyku (Matej: „na mobile klik a na ps prejdenie myšou").
// Rozlišuje sa SCHOPNOSŤOU ukazovateľa, nie šírkou okna — šírka o myši nehovorí nič a breakpoint
// by sa musel držať zhodný v CSS aj v JS. Jeden zdroj pravdy: tento matchMedia.
const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

export function VerseOfTheDay() {
  const t = useT();
  const { lang } = useLang();
  // 365-day curated calendar — same quote all day, rotates at midnight, holiday-anchored.
  const verse = verseForDay(new Date(), lang);

  const [canHover, setCanHover] = useState(true);
  const [shown, setShown] = useState(false);
  const [reportState, setReportState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const dayRef = useRef(verse.key);

  useEffect(() => {
    const mq = window.matchMedia(HOVER_QUERY);
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Prekročenie polnoci vymení citát pod rukami — nahlásenie sa musí dať poslať znovu,
  // inak by „odoslané" z včerajšieho verša zamklo dnešný.
  useEffect(() => {
    if (dayRef.current !== verse.key) {
      dayRef.current = verse.key;
      setShown(false);
      setReportState('idle');
    }
  }, [verse.key]);

  const hasTranslation = Boolean(verse.translation);

  const report = useCallback(async () => {
    if (reportState === 'sending' || reportState === 'sent') return;
    setReportState('sending');
    // Priamy insert do `pack_reports` NEEXISTUJE — tabuľka nemá insert policy pre
    // `authenticated` zámerne (člen by si nastavil `status`/`target_user_id` sám).
    // Jediná cesta je RPC: gatuje na platiaceho člena a druhé odoslanie nezaloží duplikát.
    const { error } = await supabase.rpc('report_content', {
      p_kind: 'quote',
      p_ref: verse.key,
      p_reason: 'bad_translation',
      p_note: `${lang}: ${verse.translation ?? ''}`.slice(0, 500),
    });
    setReportState(error ? 'failed' : 'sent');
  }, [reportState, verse.key, verse.translation, lang]);

  if (!verse.original) return null;

  const toggle = () => setShown((p) => !p);

  return (
    <section
      aria-label={t('pack.verse.ariaLabel')}
      className="relative flex flex-col items-center text-center"
      style={{ padding: 'clamp(8px, 1.8vw, 18px) 16px' }}
      // Hover drží CELÚ sekciu, nielen text — inak by cesta myšou na odkaz „nesedí preklad?"
      // opustila hover oblasť a preklad by zmizol skôr, než sa naň dá kliknúť.
      onMouseEnter={canHover && hasTranslation ? () => setShown(true) : undefined}
      onMouseLeave={canHover && hasTranslation ? () => setShown(false) : undefined}
    >
      {/* eyebrow */}
      <span
        style={{
          fontFamily: FONT_TITLE,
          fontSize: 10,
          letterSpacing: '0.34em',
          textTransform: 'uppercase',
          color: GOLD,
          opacity: 0.9,
        }}
      >
        {t('pack.verse.eyebrow')}
      </span>

      {/* gold quotation glyph */}
      <span
        aria-hidden
        style={{
          fontFamily: FONT_TITLE,
          fontSize: 'clamp(30px, 5vw, 46px)',
          lineHeight: 0.6,
          color: GOLD,
          opacity: 0.5,
          margin: '6px 0 2px',
        }}
      >
        “
      </span>

      {/* the verse — vždy anglický originál */}
      <blockquote
        style={{
          margin: 0,
          maxWidth: 760,
          fontFamily: FONT_TITLE,
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 'clamp(20px, 3.4vw, 31px)',
          lineHeight: 1.4,
          letterSpacing: '0.01em',
          color: '#FAF4EC',
          textShadow: '0 2px 24px rgba(0,0,0,0.5)',
        }}
      >
        {verse.original}
      </blockquote>

      {/* attribution */}
      <div className="flex items-center gap-3" style={{ marginTop: 12 }}>
        <span aria-hidden style={{ width: 28, height: 1, background: GOLD, opacity: 0.55 }} />
        <span
          style={{
            fontFamily: FONT_UI,
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(250,244,236,0.62)',
          }}
        >
          {verse.author || t('pack.verse.unknownAuthor')}
        </span>
        <span aria-hidden style={{ width: 28, height: 1, background: GOLD, opacity: 0.55 }} />
      </div>

      {/* Preklad — len ak vôbec existuje. Pri EN a ďalších 15 jazykoch tu nie je NIČ:
          žiadny mŕtvy prepínač, ktorý by nemal čo ukázať. */}
      {hasTranslation && (
        <div style={{ marginTop: 14, maxWidth: 640, width: '100%' }}>
          {/* Skutočné tlačidlo, nie div s onClick — nesie prepínanie pre dotyk aj pre
              klávesnicu. Na myši je len nápoveda, samotné odkrytie robí hover na sekcii. */}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={shown}
            style={{
              fontFamily: FONT_UI,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: GOLD,
              opacity: shown ? 0.55 : 0.75,
              background: 'none',
              border: 'none',
              padding: '4px 6px',
              cursor: 'pointer',
              transition: 'opacity .18s ease',
            }}
          >
            {shown
              ? t('pack.verse.translationLabel')
              : canHover
                ? t('pack.verse.hoverForTranslation')
                : t('pack.verse.tapForTranslation')}
          </button>

          {/* Rezervovaná výška sa ZÁMERNE nerobí: na myši je odkrytie prchavé a prázdne
              miesto pod veršom by tam svietilo stále. Posun obsahu je tu menšie zlo. */}
          {shown && (
            <>
              <p
                style={{
                  margin: '6px 0 0',
                  fontFamily: FONT_UI,
                  fontSize: 'clamp(13px, 1.6vw, 15px)',
                  fontWeight: 400,
                  lineHeight: 1.55,
                  color: 'rgba(250,244,236,0.72)',
                }}
              >
                {verse.translation}
              </p>

              <button
                type="button"
                onClick={report}
                disabled={reportState === 'sending' || reportState === 'sent'}
                style={{
                  marginTop: 8,
                  fontFamily: FONT_UI,
                  fontSize: 11,
                  fontWeight: 500,
                  color: reportState === 'sent' ? GOLD : 'rgba(250,244,236,0.45)',
                  background: 'none',
                  border: 'none',
                  padding: '2px 4px',
                  textDecoration: reportState === 'sent' ? 'none' : 'underline',
                  textUnderlineOffset: 3,
                  cursor: reportState === 'sent' ? 'default' : 'pointer',
                }}
              >
                {reportState === 'sent'
                  ? t('pack.verse.reportSent')
                  : reportState === 'failed'
                    ? t('pack.verse.reportFailed')
                    : t('pack.verse.reportBad')}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
