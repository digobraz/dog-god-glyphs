import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, Camera, X, Plus } from 'lucide-react';
import dogyptLogo from '@/assets/dogypt-logo.png';
import hekthorImg from '@/assets/hekthor.png';

type Step = 'name' | 'photos';

export function ChatScreen() {
  const [step, setStep] = useState<Step>('name');
  const [dogName, setDogName] = useState('');
  const [input, setInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const botText = step === 'name'
    ? "Hi, I'm HEKTHOR.\nWhat's your dog's name?"
    : `HELLO, ${dogName}!\nSHOW ME YOUR MAJESTY`;

  const handleSendName = () => {
    if (!input.trim()) return;
    setDogName(input.trim().toUpperCase());
    setStep('photos');
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendName();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - photos.length;
    const selected = Array.from(files).slice(0, remaining);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, ev.target?.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="papyrus-bg flex flex-col h-[100dvh] overflow-hidden">
      {/* Logo */}
      <div className="flex-shrink-0 flex justify-center pt-4 pb-2">
        <img src={dogyptLogo} alt="DOGYPT" className="h-10 md:h-12 object-contain" />
      </div>

      {/* Main content — centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">

          {/* BLOCK 1: HEKTHOR + question */}
          <motion.div
            className="w-full rounded-2xl border border-border/40 p-6 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={hekthorImg}
              alt="HEKTHOR"
              className="w-56 h-56 md:w-64 md:h-64 object-contain"
            />

            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-foreground text-center text-xl md:text-2xl leading-relaxed whitespace-pre-line"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {botText}
              </motion.p>
            </AnimatePresence>

            {step === 'photos' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-sm text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Upload up to 5 photos
              </motion.p>
            )}
          </motion.div>

          {/* BLOCK 2: Answer area */}
          <AnimatePresence mode="wait">
            {step === 'name' ? (
              <motion.div
                key="name-input"
                className="w-full rounded-2xl border border-border/40 p-4 flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-border/30">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your dog's name..."
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base md:text-lg"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    autoFocus
                  />
                  <Button
                    onClick={handleSendName}
                    disabled={!input.trim()}
                    size="icon"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/80 h-9 w-9 flex-shrink-0 disabled:opacity-30"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="photo-upload"
                className="w-full rounded-2xl border border-border/40 p-4 flex flex-col gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {/* Photo grid */}
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const photo = photos[i];
                    return (
                      <div
                        key={i}
                        className="relative aspect-square rounded-xl border-2 border-dashed border-border/50 overflow-hidden flex items-center justify-center bg-card/50 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => {
                          if (!photo && photos.length < 5) fileInputRef.current?.click();
                        }}
                      >
                        {photo ? (
                          <>
                            <img src={photo} alt={`Dog photo ${i + 1}`} className="w-full h-full object-cover" />
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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Upload / Continue button */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photos.length >= 5}
                    variant="outline"
                    className="flex-1 rounded-full border-primary text-foreground hover:bg-primary hover:text-primary-foreground gap-2 disabled:opacity-30"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    <Camera className="h-4 w-4" />
                    Add Photos
                  </Button>
                  {photos.length > 0 && (
                    <Button
                      className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 gap-2"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      <Send className="h-4 w-4" />
                      Continue
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
