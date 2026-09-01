import React from 'react';
import { motion } from 'framer-motion';

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

/**
 * Tmavý web vs. svetlý (papyrusový) režim — jeden komponent, dva odliatky.
 *
 * ⚠️ Prečo prop a nie `*Lab` kópia ako inde: v `TestimonialsSection.tsx` leží
 *    355 riadkov CITÁTOV so zdrojmi a fotografmi a nad nimi pravidlo „to swap/add
 *    a quote you MUST have a working source URL". Kópia by tie dáta rozdvojila —
 *    opravený alebo stiahnutý citát by ostal na jednej stránke a na druhej nie.
 *    Preto sa kopíruje len VZHĽAD, a dáta ostávajú jediné.
 * ⚠️ Východisko je `dark` ⇒ ostrá `/about` sa NEMENÍ. Papyrus si musí vypýtať
 *    volajúci (dnes jediný: `AboutLab`).
 */
export type TestimonialVariant = 'dark' | 'papyrus';

const SKIN = {
  dark: {
    card: '#0a0a0a',
    cardBorder: '1px solid rgba(196,155,66,0.3)',
    cardShadow: '0 10px 30px -12px rgba(196,155,66,0.2)',
    quote: 'rgba(250,244,236,0.85)',
    name: '#A3782B',
    role: '#FAF4EC',
    avatar: '1.5px solid #C49B42',
  },
  papyrus: {
    // Papyrusová karta NA papyrusovej stránke sa od plochy odlíši rámom a tieňom,
    // nie výplňou — preto plný zlatý rám 1.5px, nie vyblednutý hairline.
    card: 'linear-gradient(160deg, #FDF8EC 0%, #F6E9CE 52%, #EEDDB4 100%)',
    cardBorder: '1.5px solid rgba(140,96,20,0.60)',
    cardShadow: '0 12px 36px rgba(110,71,16,0.26)',
    quote: 'rgba(35,22,8,0.86)',
    name: '#6E4A12',
    role: 'rgba(35,22,8,0.90)',
    avatar: '1.5px solid rgba(140,96,20,0.72)',
  },
} as const;

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
  variant?: TestimonialVariant;
}) => {
  const skin = SKIN[props.variant ?? 'dark'];
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="p-8 rounded-3xl max-w-xs w-full"
                key={i}
                style={{
                  background: skin.card,
                  border: skin.cardBorder,
                  boxShadow: skin.cardShadow,
                }}
              >
                <div
                  className="text-sm leading-relaxed"
                  style={{ color: skin.quote, fontFamily: "'Cormorant Garamond', serif" }}
                >
                  "{text}"
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover"
                    style={{ border: skin.avatar }}
                  />
                  <div className="flex flex-col">
                    <div
                      className="font-semibold tracking-tight leading-5 text-sm"
                      style={{ color: skin.name, fontFamily: "'Cinzel', serif" }}
                    >
                      {name}
                    </div>
                    <div
                      className="leading-5 opacity-70 tracking-tight text-xs"
                      style={{ color: skin.role }}
                    >
                      {role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};