import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, X, Plus } from 'lucide-react';
import { PageTopBar } from '@/components/PageTopBar';
import hekthorImg from '@/assets/hekthor.png';

export function ChatScreen() {
  const [step, setStep] = useState(0);
  const [dogName, setDogName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSendName = () => {
    if (!nameInput.trim()) return;
    setDogName(nameInput.trim().toUpperCase());
    goNext();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - photos.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => prev.length >= 5 ? prev : [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (index: number) => setPhotos((prev) => prev.filter((_, i) => i !== index));

  // Step definitions
  const steps: { botText: string; subtitle?: string; content: React.ReactNode }[] = [
    {
      botText: "Hi, I'm HEKTHOR.\nWhat's your dog's name?",
      content: (
        <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-2 border border-border/30">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendName(); }}
            placeholder="Type your dog's name..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-lg"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            autoFocus
          />
          <Button
            onClick={handleSendName}
            disabled={!nameInput.trim()}
            size="icon"
            className="rounded-cta bg-primary text-primary-foreground hover:bg-primary/80 h-9 w-9 flex-shrink-0 disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      botText: `HELLO, ${dogName}!\nSHOW ME YOUR MAJESTY`,
      subtitle: 'Upload up to 5 photos',
      content: (
        <>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => {
              const photo = photos[i];
              return (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl border-2 border-dashed border-border/50 overflow-hidden flex items-center justify-center bg-card/50 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => { if (!photo && photos.length < 5) fileInputRef.current?.click(); }}
                >
                  {photo ? (
                    <>
                      <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                        className="absolute top-1 right-1 bg-foreground/70 text-background rounded-full p-0.5 hover:bg-foreground transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <Plus className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
              );
            })}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={photos.length >= 5}
              className="flex-1 rounded-xl h-10 font-bold tracking-wider disabled:opacity-30"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'transparent',
                border: '2px solid hsl(var(--gold) / 0.5)',
                color: 'hsl(var(--gold))',
              }}
            >
              Add Photos
            </Button>
            {photos.length > 0 && (
              <Button
                onClick={goNext}
                className="flex-1 rounded-xl h-10 font-bold tracking-wider hover:scale-[1.02] transition-transform"
                style={{
                  fontFamily: "'Cinzel', serif",
                  background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                  color: '#000',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
                }}
              >
                Continue
              </Button>
            )}
          </div>
        </>
      ),
    },
  ];

  const currentStep = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Header: back + logo */}
      <PageTopBar onBack={step > 0 ? goBack : undefined} />

      {/* Main content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">

          {/* BLOCK 1: HEKTHOR + question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`q-${step}`}
              className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-6 flex flex-col items-center gap-4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <img src={hekthorImg} alt="HEKTHOR" className="w-36 h-36 md:w-56 md:h-56 object-contain" />
              <p
                className="text-foreground text-center text-xl md:text-2xl leading-relaxed whitespace-pre-line"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {currentStep.botText}
              </p>
              {currentStep.subtitle && (
                <p className="text-muted-foreground text-sm text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {currentStep.subtitle}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* BLOCK 2: Answer area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`a-${step}`}
              className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 flex flex-col gap-4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              {currentStep.content}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
