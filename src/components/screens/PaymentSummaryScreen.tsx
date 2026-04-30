import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDogyptStore } from '@/store/dogyptStore';
import { Button } from '@/components/ui/button';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

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

export function PaymentSummaryScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const selectedAmount = useDogyptStore((s) => s.selectedAmount);
  const setEmail = useDogyptStore((s) => s.setEmail);

  const total = selectedAmount;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setLocalEmail] = useState('');
  const [country, setCountry] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!country) return [];
    return COUNTRIES.filter((c) => c.toLowerCase().includes(country.toLowerCase())).slice(0, 6);
  }, [country]);

  const isValid = firstName.trim() && lastName.trim() && email.trim() && country.trim();

  const handleContinue = () => {
    if (!isValid) return;
    setEmail(email);
    navigate('/payment');
  };

  const inputClass =
    'w-full rounded-xl border-2 border-border/60 bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors';

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-14 object-contain" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 overflow-y-auto">
        <div className="w-full max-w-xl flex flex-col items-center gap-3 py-2">
          {/* 1. BLOCK - Order Summary */}
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
            <div className="rounded-[0.875rem] papyrus-bg p-4 md:p-5">
              <h2
                className="text-center text-sm md:text-base font-bold tracking-[0.2em] uppercase text-primary mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Order Summary
              </h2>

              <div className="flex flex-col gap-2">
                {/* Heroglyph row */}
                <div
                  className="flex justify-between items-center rounded-xl px-3 py-2"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--gold) / 0.08), hsl(var(--gold) / 0.15))' }}
                >
                  <div className="flex flex-col">
                    <span
                      className="text-xs tracking-widest uppercase text-foreground/50"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {dogName}'s
                    </span>
                    <span
                      className="text-lg md:text-xl font-bold tracking-[0.15em] uppercase text-primary"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      HEROGLYPH
                    </span>
                  </div>
                  <span
                    className="text-xl md:text-2xl font-bold text-primary"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    ${selectedAmount}
                  </span>
                </div>

                {/* Total */}
                <div
                  className="mt-1 rounded-xl px-3 py-2 flex justify-between items-center"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.25))',
                    borderTop: '2px solid hsl(var(--gold) / 0.3)',
                  }}
                >
                  <span
                    className="text-base md:text-lg font-bold tracking-[0.2em] uppercase text-primary"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-2xl md:text-3xl font-bold text-primary"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      textShadow: '0 0 20px hsl(var(--gold) / 0.3)',
                    }}
                  >
                    ${total}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. BLOCK - Contact & Delivery Details */}
          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <h2
              className="text-center text-sm md:text-base font-bold tracking-[0.2em] uppercase text-primary mb-3"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Your Details
            </h2>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setLocalEmail(e.target.value)}
                className={inputClass}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />

              {/* Country with autocomplete */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setShowCountries(true);
                  }}
                  onFocus={() => country && setShowCountries(true)}
                  onBlur={() => setTimeout(() => setShowCountries(false), 150)}
                  className={inputClass}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                {showCountries && filteredCountries.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border-2 border-border/40 bg-background shadow-lg max-h-40 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <button
                        key={c}
                        onMouseDown={() => {
                          setCountry(c);
                          setShowCountries(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Continue button */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <Button
              onClick={handleContinue}
              disabled={!isValid}
              className="w-full rounded-full py-6 text-lg font-bold tracking-wider hover:scale-105 transition-transform disabled:opacity-30"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                color: '#000',
                boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              CONTINUE TO PAYMENT
            </Button>
          </motion.div>

          {/* Back button */}
          <button
            onClick={() => navigate('/pay-wall')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-6"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
