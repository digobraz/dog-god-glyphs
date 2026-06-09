import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon',
  'Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia',
  'Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador',
  'Estonia','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece',
  'Guatemala','Guinea','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia',
  'Lebanon','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malaysia','Maldives','Mali','Malta',
  'Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Macedonia','Norway','Oman','Pakistan',
  'Panama','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saudi Arabia','Senegal','Serbia','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea',
  'Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand','Tunisia',
  'Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

export function CheckoutScreen() {
  const navigate = useNavigate();
  const t = useT();
  const dogName = useDogyptStore((s) => s.dogName);
  const dogPhotoUrl = useDogyptStore((s) => s.dogPhotoUrl);
  const setSelectedAmount = useDogyptStore((s) => s.setSelectedAmount);
  const setEmail = useDogyptStore((s) => s.setEmail);
  const setSelection = useDogyptStore((s) => s.setSelection);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setLocalEmail] = useState('');
  const [country, setCountry] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!country) return [];
    return COUNTRIES.filter((c) => c.toLowerCase().includes(country.toLowerCase())).slice(0, 5);
  }, [country]);

  const isValid = firstName.trim() && lastName.trim() && email.trim() && country.trim();

  const handleContinue = () => {
    if (!isValid) return;
    setSelectedAmount(11);
    setEmail(email);
    // Persist country into selections so PaymentScreen's buildHeroglyphCode emits
    // the real ISO3 (pos 15) instead of falling back to 'XXX'. Without this the
    // country input was local-only and every purchased code lost its country.
    setSelection('country', country.trim());
    navigate('/payment');
  };

  const inputClass =
    'w-full rounded-xl border-2 border-border/60 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors';

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Logo */}
      <div className="flex-shrink-0 flex justify-center pt-[15px] pb-1 md:pt-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-9 md:h-12 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-xl flex flex-col items-center gap-1.5">
          {/* ORDER SUMMARY card */}
          <motion.div
            className="w-full rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)), hsl(var(--gold)))',
              padding: '2px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-[0.875rem] papyrus-bg p-2.5 md:p-4">
              <h2
                className="text-center text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-primary mb-2"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t('heroglyph.checkout.orderSummary')}
              </h2>

              {/* Dog photo + heroglyph preview */}
              <div className="flex flex-col items-center gap-2 py-2">
                {/* Raw dog photo */}
                {dogPhotoUrl && (
                  <div
                    className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
                    style={{
                      border: '3px solid hsl(var(--gold))',
                      boxShadow: '0 0 16px hsl(var(--gold) / 0.25)',
                    }}
                  >
                    <img src={dogPhotoUrl} alt={dogName || t('heroglyph.checkout.dogFallback')} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* Full heroglyph */}
                <div className="w-[130px]">
                  <HeroglyphFrame showOwner className="text-foreground" />
                </div>
                {dogName && (
                  <span
                    className="text-[22px] font-bold tracking-[0.15em] uppercase text-primary"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {dogName}
                  </span>
                )}
              </div>

              {/* Product line */}
              <div
                className="flex justify-between items-center rounded-xl px-3 py-2"
                style={{ background: 'linear-gradient(135deg, hsl(var(--gold) / 0.08), hsl(var(--gold) / 0.15))' }}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] tracking-widest uppercase text-foreground/50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {t('heroglyph.checkout.dogPossessive', { dogName: dogName || t('heroglyph.checkout.yourDogFallback') })}
                  </span>
                  <span className="text-base md:text-lg font-bold tracking-[0.15em] uppercase text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                    {t('heroglyph.checkout.heroglyph')}
                  </span>
                </div>
                <span className="text-lg md:text-xl font-bold text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                  €11
                </span>
              </div>

            </div>
          </motion.div>

          {/* YOUR DETAILS card */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-2.5 md:p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <h2
              className="text-center text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-primary mb-2"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {t('heroglyph.checkout.yourDetails')}
            </h2>

            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                <input type="text" placeholder={t('heroglyph.checkout.firstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
                <input type="text" placeholder={t('heroglyph.checkout.lastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
              </div>
              <input type="email" placeholder={t('heroglyph.checkout.email')} value={email} onChange={(e) => setLocalEmail(e.target.value)} className={inputClass} style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('heroglyph.checkout.country')}
                  value={country}
                  onChange={(e) => { setCountry(e.target.value); setShowCountries(true); }}
                  onFocus={() => country && setShowCountries(true)}
                  onBlur={() => setTimeout(() => setShowCountries(false), 150)}
                  className={inputClass}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
                {showCountries && filteredCountries.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border-2 border-border/40 bg-background shadow-lg max-h-32 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <button
                        key={c}
                        onMouseDown={() => { setCountry(c); setShowCountries(false); }}
                        className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-primary/10 transition-colors"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CTA inside card */}
            <div className="mt-2.5 px-1">
              <Button
                onClick={handleContinue}
                disabled={!isValid}
                className="w-full rounded-xl py-4 text-base font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-30"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                }}
              >
                {t('heroglyph.checkout.cta')}
              </Button>
            </div>

            {/* Disclaimer inside card */}
            <p className="text-primary/50 text-[10px] text-center leading-relaxed px-2 mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t('heroglyph.checkout.disclaimerPrefix')}<span className="text-primary font-bold uppercase">{t('heroglyph.checkout.disclaimerHighlight')}</span>{t('heroglyph.checkout.disclaimerSuffix')}
            </p>
          </motion.div>

          {/* Back link outside card */}
          <button
            onClick={() => navigate('/heroglyph/message')}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-3 w-3" /> {t('heroglyph.checkout.back')}
          </button>
        </div>
      </div>
    </div>
  );
}