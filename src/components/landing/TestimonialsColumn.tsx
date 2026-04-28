import React from 'react';
import { motion } from 'framer-motion';

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
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
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(196,155,66,0.3)',
                  boxShadow: '0 10px 30px -12px rgba(196,155,66,0.2)',
                }}
              >
                <div
                  className="text-sm leading-relaxed"
                  style={{ color: 'rgba(250,244,236,0.85)', fontFamily: "'Cormorant Garamond', serif" }}
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
                    style={{ border: '1.5px solid #C49B42' }}
                  />
                  <div className="flex flex-col">
                    <div
                      className="font-semibold tracking-tight leading-5 text-sm"
                      style={{ color: '#A3782B', fontFamily: "'Cinzel', serif" }}
                    >
                      {name}
                    </div>
                    <div
                      className="leading-5 opacity-70 tracking-tight text-xs"
                      style={{ color: '#FAF4EC' }}
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