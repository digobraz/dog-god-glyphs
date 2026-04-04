import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, X, Plus, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import dogyptLogo from '@/assets/dogypt-logo-round.png';
import hekthorImg from '@/assets/hekthor.png';

export function PhotoScreen() {
  const navigate = useNavigate();
  const dogName = useDogyptStore((s) => s.dogName);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-center relative pt-4 pb-2 px-4">
        <button onClick={() => navigate('/name')} className="absolute left-4 top-4 p-2 text-foreground/60 hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img src={dogyptLogo} alt="DOGYPT" className="h-16 md:h-20 object-contain rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          <motion.div
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-4" style={{ background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img src={hekthorImg} alt="HEKTHOR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
            <p className="text-white text-center text-xl md:text-2xl leading-relaxed whitespace-pre-line drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif" }}>
              SAY HELLO TO <span className="font-bold text-amber-300">{dogName || 'FRIEND'}</span>
              {'\n'}AND SHOW ME THEIR <span className="font-bold">MAJESTY!</span>
            </p>
            <p className="text-white/70 text-sm text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              Upload up to 5 photos
            </p>
          </motion.div>

          <motion.div
            className="w-full rounded-2xl border-2 border-border/40 papyrus-bg p-4 flex flex-col gap-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
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
                        <button onClick={(e) => { e.stopPropagation(); removePhoto(i); }} className="absolute top-1 right-1 bg-foreground/70 text-background rounded-full p-0.5 hover:bg-foreground transition-colors">
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
            <div className="flex flex-col gap-2">
              {photos.length === 0 ? (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-full py-6 text-lg font-bold tracking-wider hover:scale-105 transition-transform gap-2"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                    color: '#000',
                    boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <Camera className="h-4 w-4" />
                  ADD PHOTOS
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photos.length >= 5}
                    variant="outline"
                    className="flex-1 rounded-full py-5 font-bold tracking-wider border-primary text-foreground hover:bg-primary hover:text-primary-foreground gap-2 disabled:opacity-30"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    <Camera className="h-4 w-4" />
                    ADD MORE
                  </Button>
                  <Button
                    onClick={() => navigate('/breed')}
                    className="flex-1 rounded-full py-5 text-lg font-bold tracking-wider hover:scale-105 transition-transform gap-2"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
                      color: '#000',
                      boxShadow: '0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    NEXT →
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
