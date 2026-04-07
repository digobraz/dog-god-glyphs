import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Instagram } from 'lucide-react';

export function AboutSection() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col justify-center py-24 md:py-32 snap-center"
      style={{ backgroundColor: '#FAF4EC' }}
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8 flex-1 flex flex-col justify-center">
        <motion.h2
          className="text-4xl md:text-5xl font-black text-center mb-8"
          style={{ fontFamily: "'Cinzel', serif", color: '#A3782B' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          ABOUT DOGYPT
        </motion.h2>

        <motion.p
          className="text-center text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12"
          style={{ color: 'rgba(0,0,0,0.6)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          DOGYPT is a global movement born from the belief that every dog deserves to be honored.
          Through unique HEROGLYPHS — sacred digital symbols — we celebrate the bond between humans
          and dogs, building the world's largest community of dog lovers united to help millions of dogs in need.
        </motion.p>

        {/* Video thumbnail */}
        <motion.div
          className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden cursor-pointer group mb-16"
          style={{ aspectRatio: '16/9', backgroundColor: '#000' }}
          onClick={() => setShowVideo(true)}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors z-10">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #A3782B, #C49B42)',
                boxShadow: '0 0 30px rgba(196,155,66,0.5)',
              }}
            >
              <Play className="w-8 h-8 text-black ml-1" fill="black" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/20 text-lg" style={{ fontFamily: "'Cinzel', serif" }}>
              VIDEO COMING SOON
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="border-t pt-8 mt-auto" style={{ borderColor: 'rgba(163,120,43,0.2)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm" style={{ color: 'rgba(0,0,0,0.4)' }}>© DOGYPT 2026. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="mailto:hello@dogypt.com" className="text-sm transition-opacity hover:opacity-70" style={{ color: 'rgba(0,0,0,0.4)' }}>
                hello@dogypt.com
              </a>
              <a href="https://instagram.com/dogypt" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70" style={{ color: 'rgba(0,0,0,0.4)' }}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://x.com/dogypt" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-70" style={{ color: 'rgba(0,0,0,0.4)' }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/90" onClick={() => setShowVideo(false)} />
            <motion.div
              className="relative z-10 w-full max-w-4xl"
              style={{ aspectRatio: '16/9' }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                <p className="text-white/30 text-xl" style={{ fontFamily: "'Cinzel', serif" }}>
                  YouTube Video Placeholder
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
