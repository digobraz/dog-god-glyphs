import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDogyptStore } from '@/store/dogyptStore';
import { PageTopBar } from '@/components/PageTopBar';
import { DateDropdowns } from '@/components/DateDropdowns';
import introMedallionImg from '@/assets/intro-medallion.webp';
import legendIconUrl from '@/assets/legend-icon.svg';
import angelIconUrl from '@/assets/angel-icon.svg';
import { useT } from '@/i18n/LanguageContext';
import { track } from '@/lib/analytics';

const MIN_DEATH_YEAR = 1990;


// ── /heroglyph/intro — dedikačný predkrok (nepočítaný)
// Misijné intro (medailón + 2-col header + body2 rámik) + výber živý/mŕtvy psa.
// Route: /heroglyph/intro
// Back: /heroglyph (sales)  ·  Continue: /heroglyph/name
export function IntroScreen() {
  const navigate = useNavigate();
  const t = useT();
  const setLifeStatus = useDogyptStore((s) => s.setLifeStatus);
  const storedLifeStatus = useDogyptStore((s) => s.lifeStatus);
  const deathDate = useDogyptStore((s) => s.deathDate);
  const setDeathDate = useDogyptStore((s) => s.setDeathDate);

  // Default = alive (predvolene vybraté podľa spec)
  const [selected, setSelected] = useState<'alive' | 'deceased'>(
    storedLifeStatus ?? 'alive',
  );

  // flow_start — vstup do heroglyph flow. Fire-once guard proti re-renderu (nie proti re-mountu).
  const flowStartFired = useRef(false);
  useEffect(() => {
    if (flowStartFired.current) return;
    flowStartFired.current = true;
    track('flow_start');
  }, []);

  // Dátum úmrtia — voliteľný popup (mirror MemorialControl date krok), ale bez
  // DB zápisu: pes ešte neexistuje, dátum ide do store a zapíše sa až pri checkoute.
  const now = new Date();
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [d, setD] = useState(now.getDate());
  const [m, setM] = useState(now.getMonth() + 1);
  const [y, setY] = useState(now.getFullYear());

  const openDateModal = () => {
    const seed = deathDate ? new Date(deathDate) : new Date();
    setD(seed.getDate());
    setM(seed.getMonth() + 1);
    setY(seed.getFullYear());
    setDateModalOpen(true);
  };

  const saveDeathDate = () => {
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    setDeathDate(iso);
    setDateModalOpen(false);
  };

  const handleSelect = (v: 'alive' | 'deceased') => {
    setSelected(v);
    setLifeStatus(v);
    if (v === 'alive') setDeathDate(null);
  };

  const handleContinue = () => {
    setLifeStatus(selected);
    navigate('/heroglyph/name');
  };

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <PageTopBar onBack={() => navigate('/heroglyph')} />

      {/* justify-center vertikálne centruje na väčších obrazovkách;
          overflow-y-auto je záchrana pre extrémne malé zariadenia */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col gap-2.5 py-2">

          {/* Block 1 — brand modro-zlatý gradient (tmavý → svetlý text) */}
          <motion.div
            className="w-full rounded-2xl p-4 md:p-5 flex flex-col gap-2"
            style={{
              background: 'var(--brand-gradient)',
              border: '2px solid rgba(160,116,35,0.55)',
            }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Horný riadok — medailón vľavo, siahajúci na výšku pill + eyebrow + title
                stĺpca vpravo (items-stretch + h-full na fotke = zarovná presne po
                spodok title). Stĺpec justify-between rozťahuje 3 prvky na výšku fotky. */}
            {/* eyebrow + title — centrované navrch, full width */}
            <p
              className="text-center text-[10px] uppercase tracking-[0.22em] font-semibold"
              style={{ fontFamily: "'Cinzel', serif", color: '#E5C16E' }}
            >
              {t('intro.eyebrow')}
            </p>
            <h2
              className="text-center text-xl md:text-2xl font-bold leading-snug"
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#FAF4EC',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              {t('intro.title')}
            </h2>

            {/* dvojstĺpec — medailón vľavo, body text vpravo */}
            <div className="flex flex-row gap-3 items-center">
              <img
                src={introMedallionImg}
                alt="DOGYPT — Matej a pes"
                className="w-[110px] md:w-[125px] object-contain flex-shrink-0"
              />
              <p
                className="flex-1 min-w-0 text-xs md:text-sm leading-snug"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'rgba(250,244,236,0.92)',
                }}
              >
                {t('intro.body')}
              </p>
            </div>

            {/* body2 — rámik na tmavom: gold border, presvitavá výplň, krémový text */}
            <div
              style={{
                border: '1px solid rgba(229,193,110,0.4)',
                borderRadius: 8,
                padding: '8px 10px',
                background: 'rgba(255,250,240,0.10)',
              }}
            >
              <p
                className="text-[11px] md:text-xs leading-snug"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'rgba(250,244,236,0.85)',
                }}
              >
                {t('intro.body2')}
              </p>
            </div>
          </motion.div>

          {/* Block 2 — papyrus karta: otázka + voľby + Continue */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex flex-col gap-3"
            style={{ color: '#0E0E0E' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
          >
            <p
              className="text-center text-[11px] md:text-xs font-bold uppercase tracking-wider"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {t('intro.question')}
            </p>

            {/* Voľby — brand hand-drawn SVG ikonky, selected štýl z DogBloodlineScreen */}
            <div className="flex gap-2.5 w-full">
              {/* alive → Legend.svg */}
              <button
                onClick={() => handleSelect('alive')}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                  selected === 'alive'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img
                  src={legendIconUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-11 w-11 object-contain flex-shrink-0"
                  style={{ filter: 'brightness(0)' }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-wider leading-tight text-center"
                >
                  {t('intro.alive')}
                </span>
              </button>

              {/* deceased → Angel.svg — klik otvorí voliteľný date popup */}
              <button
                onClick={() => {
                  handleSelect('deceased');
                  openDateModal();
                }}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                  selected === 'deceased'
                    ? 'is-selected-purple'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                <img
                  src={angelIconUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-11 w-11 object-contain flex-shrink-0"
                  style={{ filter: 'brightness(0)' }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-wider leading-tight text-center"
                >
                  {t('intro.deceased')}
                </span>
              </button>
            </div>

            {/* Zvolený dátum úmrtia — malý caption, len keď je vyplnený (voliteľné) */}
            {selected === 'deceased' && deathDate && (
              <p
                className="text-center text-[10px] tracking-wide"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(14,14,14,0.6)' }}
              >
                {t('intro.deceasedDate.caption', {
                  date: new Date(deathDate).toLocaleDateString(),
                })}
              </p>
            )}

            {/* Continue — vždy aktívny, gold gradient ako ostatné flow kroky */}
            <Button
              onClick={handleContinue}
              className="w-full rounded-xl gap-2 h-9 md:h-10 font-bold tracking-wider hover:scale-[1.02] transition-transform"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
              }}
            >
              {t('intro.continue')}
            </Button>
          </motion.div>

        </div>
      </div>

      {/* Dátum úmrtia — voliteľný popup. Vizuálne 1:1 s NameModal (.name-modal-*
          v NameScreen.tsx) — rovnaký backdrop/karta/animácia/gold Save, len bez
          textového inputu (obsah = DateDropdowns). */}
      {dateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center px-4" style={{ zIndex: 2100 }}>
          <motion.div
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' } as React.CSSProperties}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.16 }}
            onClick={() => setDateModalOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full"
            style={{
              maxWidth: 520,
              background: 'linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)',
              border: '1.5px solid rgba(201,154,63,0.55)',
              borderRadius: 16,
              padding: '22px 16px 16px',
              boxShadow: '0 20px 64px rgba(0,0,0,0.65)',
            }}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.3, 1.1] }}
          >
            <button
              type="button"
              aria-label={t('nav.aria.close')}
              onClick={() => setDateModalOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 14,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: 'rgba(0,0,0,0.4)',
                lineHeight: 1,
                padding: 4,
              }}
            >
              ✕
            </button>
            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: '1rem',
                textAlign: 'center',
                color: 'hsl(var(--gold-dark))',
                margin: 0,
                padding: '0 20px 16px',
              }}
            >
              {t('intro.deceasedDate.title')}
            </h3>
            <div className="flex justify-center" style={{ marginBottom: 18 }}>
              <DateDropdowns
                day={d}
                month={m}
                year={y}
                minYear={MIN_DEATH_YEAR}
                maxYear={now.getFullYear()}
                maxDate={now}
                onChange={(nd, nm, ny) => { setD(nd); setM(nm); setY(ny); }}
              />
            </div>
            <button
              type="button"
              onClick={saveDeathDate}
              style={{
                width: '100%',
                height: 46,
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#000',
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
              }}
            >
              {t('pack.dog.memorial.save')}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
