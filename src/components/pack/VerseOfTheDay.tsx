import { useCallback, useEffect, useRef, useState } from 'react';
import { verseForDay } from '@/data/dailyQuotes';
import { useT, useLang } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { FONT_TITLE, FONT_UI, PACK_THEME, usePaperRoute } from './packTheme';
import { useLocation } from 'react-router-dom';

const GOLD = PACK_THEME.cardEdge;

// ── INKOUST PODĽA PODKLADU (2026-09-08) ──────────────────────────────────────
// Verš stojí na DVOCH povrchoch: na homepage `/pack` (od 8. 9. papyrus) a v
// `HeroLab`, ktorý ostáva tmavý. Farby preto nie sú natvrdo — komponent si
// podklad zistí sám cez `usePaperRoute`, teda z toho ISTÉHO zdroja, ktorý prepína
// shell v `PackLayout` a fallback v `App.tsx`. Prop od volajúceho by znamenal
// tretie miesto, kde sa dá zabudnúť, a prejavilo by sa to bielym textom na
// papyruse — teda neviditeľným veršom, nie chybou, ktorú niekto nahlási.
// Zlatá (GOLD) drží na oboch podkladoch, mení sa len inkoust a tieň.
const T = PACK_THEME;

// KÁNON JE ORIGINÁL (Matej 2026-08-13: „dajme každému anglický originál citátu a pri kliknutí
// naň sa zobrazí preklad — ktorý vedia členovia nahlásiť ako zlý… ale nech máme všade ok
// originál"). Dôvod nie je lenivosť pri preklade: osem citátov v roku stojí na slovnej hračke,
// ktorú slovenčina nemá (`bark` = kôra aj štekať, `four-letter word`, Nashov rým) — v origináli
// vtip žije, v preklade zomrie. Audit navyše ukázal 54 % chybovosť SK dávky, takže preklad
// nie je text, za ktorý by sme sa mali stavať ako za kánon.
//
// PREKLAD NATRVALO (Matej 2026-09-26, audit homepage: „verš po anglicky a malý preklad k tomu
// nie na dotyk myšou ale nastálo"). Odkrývanie (hover na myši / ťuk na dotyku z 13. 8.) zaniklo:
// na mobile ho nikto nenašiel a na PC blikal pod myšou. Originál ostáva hlavný, preklad je
// malý a tichý pod autorom — hierarchiu drží veľkosť, nie schovávanie.

export function VerseOfTheDay() {
  const paper = usePaperRoute(useLocation().pathname);
  const t = useT();
  const { lang } = useLang();
  // 365-day curated calendar — same quote all day, rotates at midnight, holiday-anchored.
  const verse = verseForDay(new Date(), lang);

  const [reportState, setReportState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const dayRef = useRef(verse.key);

  // Prekročenie polnoci vymení citát pod rukami — nahlásenie sa musí dať poslať znovu,
  // inak by „odoslané" z včerajšieho verša zamklo dnešný.
  useEffect(() => {
    if (dayRef.current !== verse.key) {
      dayRef.current = verse.key;
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

  return (
    <section
      aria-label={t('pack.verse.ariaLabel')}
      className="relative flex flex-col items-center text-center"
      style={{ padding: 'clamp(8px, 1.8vw, 16px) 16px' }}
    >
      {/* eyebrow */}
      <span
        style={{
          fontFamily: FONT_TITLE,
          fontSize: 10,
          letterSpacing: '0.26em',
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
          letterSpacing: '0.02em',
          color: paper ? T.inkStrong : T.card,
          textShadow: paper ? 'none' : '0 2px 24px rgba(0,0,0,0.5)',
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
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: paper ? T.inkWarm : 'rgba(250,244,236,0.62)',
          }}
        >
          {verse.author || t('pack.verse.unknownAuthor')}
        </span>
        <span aria-hidden style={{ width: 28, height: 1, background: GOLD, opacity: 0.55 }} />
      </div>

      {/* Preklad — len ak vôbec existuje. Pri EN a ďalších 15 jazykoch tu nie je NIČ. */}
      {hasTranslation && (
        <div style={{ marginTop: 12, maxWidth: 560, width: '100%' }}>
          <p
            lang={lang}
            style={{
              margin: 0,
              fontFamily: FONT_UI,
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.5,
              color: paper ? T.inkWarm : 'rgba(250,244,236,0.72)',
            }}
          >
            {verse.translation}
          </p>

          <button
            type="button"
            onClick={report}
            disabled={reportState === 'sending' || reportState === 'sent'}
            style={{
              marginTop: 4,
              fontFamily: FONT_UI,
              fontSize: 10,
              fontWeight: 500,
              color: reportState === 'sent' ? GOLD : (paper ? T.inkWarm : 'rgba(250,244,236,0.45)'),
              opacity: reportState === 'sent' ? 1 : 0.8,
              background: 'none',
              border: 'none',
              padding: 4,
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
        </div>
      )}
    </section>
  );
}
