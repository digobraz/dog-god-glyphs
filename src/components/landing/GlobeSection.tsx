import { useEffect, useRef, useCallback } from 'react';
import createGlobe from 'cobe';
import { motion } from 'framer-motion';

interface PulseMarker {
  id: string;
  location: [number, number];
  delay: number;
}

// 120+ continent locations — every dot = a city with a stray dog problem
const MARKERS: PulseMarker[] = [
  // North America
  { id: 'm0',  location: [19.4, -99.1],   delay: 0.00 },
  { id: 'm1',  location: [40.7, -74.0],   delay: 0.17 },
  { id: 'm2',  location: [34.0, -118.2],  delay: 0.34 },
  { id: 'm3',  location: [41.8, -87.6],   delay: 0.51 },
  { id: 'm4',  location: [43.7, -79.4],   delay: 0.68 },
  { id: 'm5',  location: [45.5, -73.6],   delay: 0.85 },
  { id: 'm6',  location: [29.7, -95.4],   delay: 1.02 },
  { id: 'm7',  location: [33.4, -112.0],  delay: 1.19 },
  { id: 'm8',  location: [25.8, -80.2],   delay: 1.36 },
  { id: 'm9',  location: [20.9, -89.6],   delay: 1.53 },
  { id: 'm10', location: [14.6, -90.5],   delay: 1.70 },
  { id: 'm11', location: [10.0, -84.1],   delay: 1.87 },
  { id: 'm12', location: [47.6, -122.3],  delay: 0.09 },
  { id: 'm13', location: [39.9, -82.9],   delay: 0.26 },
  { id: 'm14', location: [32.7, -97.3],   delay: 0.43 },
  { id: 'm15', location: [30.3, -97.7],   delay: 0.60 },
  // South America
  { id: 'm16', location: [-23.5, -46.6],  delay: 0.77 },
  { id: 'm17', location: [-34.6, -58.4],  delay: 0.94 },
  { id: 'm18', location: [4.7,  -74.1],   delay: 1.11 },
  { id: 'm19', location: [-12.0, -77.0],  delay: 1.28 },
  { id: 'm20', location: [-33.4, -70.7],  delay: 1.45 },
  { id: 'm21', location: [-15.8, -47.9],  delay: 1.62 },
  { id: 'm22', location: [-3.1,  -60.0],  delay: 1.79 },
  { id: 'm23', location: [10.5,  -66.9],  delay: 1.96 },
  { id: 'm24', location: [-8.1,  -34.9],  delay: 0.13 },
  { id: 'm25', location: [-30.0, -51.2],  delay: 0.30 },
  { id: 'm26', location: [-16.5, -68.1],  delay: 0.47 },
  { id: 'm27', location: [-0.2,  -78.5],  delay: 0.64 },
  { id: 'm28', location: [-17.8, -63.1],  delay: 0.81 },
  // Europe
  { id: 'm29', location: [51.5, -0.1],    delay: 0.98 },
  { id: 'm30', location: [48.8,  2.3],    delay: 1.15 },
  { id: 'm31', location: [52.5, 13.4],    delay: 1.32 },
  { id: 'm32', location: [40.4, -3.7],    delay: 1.49 },
  { id: 'm33', location: [41.9, 12.5],    delay: 1.66 },
  { id: 'm34', location: [52.2, 21.0],    delay: 1.83 },
  { id: 'm35', location: [55.7, 37.6],    delay: 0.05 },
  { id: 'm36', location: [41.0, 28.9],    delay: 0.22 },
  { id: 'm37', location: [44.4, 26.1],    delay: 0.39 },
  { id: 'm38', location: [37.9, 23.7],    delay: 0.56 },
  { id: 'm39', location: [47.5, 19.0],    delay: 0.73 },
  { id: 'm40', location: [50.0, 14.4],    delay: 0.90 },
  { id: 'm41', location: [59.9, 30.3],    delay: 1.07 },
  { id: 'm42', location: [45.8, 15.9],    delay: 1.24 },
  { id: 'm43', location: [44.8, 20.5],    delay: 1.41 },
  { id: 'm44', location: [50.4, 30.5],    delay: 1.58 },
  { id: 'm45', location: [53.9, 27.6],    delay: 1.75 },
  { id: 'm46', location: [41.7, 44.8],    delay: 1.92 },
  { id: 'm47', location: [40.4, 49.9],    delay: 0.11 },
  { id: 'm48', location: [38.0, 23.7],    delay: 0.28 },
  { id: 'm49', location: [43.3, 17.8],    delay: 0.45 },
  { id: 'm50', location: [42.0, 21.4],    delay: 0.62 },
  { id: 'm51', location: [47.0, 28.9],    delay: 0.79 },
  { id: 'm52', location: [42.7, 23.3],    delay: 0.96 },
  // Russia / Central Asia
  { id: 'm53', location: [55.0, 73.4],    delay: 1.13 },
  { id: 'm54', location: [56.8, 60.6],    delay: 1.30 },
  { id: 'm55', location: [43.2, 76.9],    delay: 1.47 },
  { id: 'm56', location: [41.3, 69.3],    delay: 1.64 },
  { id: 'm57', location: [51.2, 58.7],    delay: 1.81 },
  { id: 'm58', location: [38.6, 72.8],    delay: 0.07 },
  // Asia
  { id: 'm59', location: [19.0, 72.8],    delay: 0.24 },
  { id: 'm60', location: [28.6, 77.2],    delay: 0.41 },
  { id: 'm61', location: [39.9, 116.4],   delay: 0.58 },
  { id: 'm62', location: [31.2, 121.5],   delay: 0.75 },
  { id: 'm63', location: [35.7, 139.7],   delay: 0.92 },
  { id: 'm64', location: [37.5, 127.0],   delay: 1.09 },
  { id: 'm65', location: [13.7, 100.5],   delay: 1.26 },
  { id: 'm66', location: [-6.2, 106.8],   delay: 1.43 },
  { id: 'm67', location: [14.5, 121.0],   delay: 1.60 },
  { id: 'm68', location: [24.8, 67.0],    delay: 1.77 },
  { id: 'm69', location: [17.4, 78.5],    delay: 1.94 },
  { id: 'm70', location: [22.3, 114.2],   delay: 0.15 },
  { id: 'm71', location: [1.3,  103.8],   delay: 0.32 },
  { id: 'm72', location: [3.1,  101.7],   delay: 0.49 },
  { id: 'm73', location: [10.8, 106.7],   delay: 0.66 },
  { id: 'm74', location: [16.9, 96.1],    delay: 0.83 },
  { id: 'm75', location: [35.7, 51.4],    delay: 1.00 },
  { id: 'm76', location: [24.7, 46.7],    delay: 1.17 },
  { id: 'm77', location: [33.3, 44.4],    delay: 1.34 },
  { id: 'm78', location: [33.5, 36.3],    delay: 1.51 },
  { id: 'm79', location: [25.0, 121.5],   delay: 1.68 },
  { id: 'm80', location: [23.1, 113.3],   delay: 1.85 },
  { id: 'm81', location: [11.1, 104.9],   delay: 0.03 },
  { id: 'm82', location: [17.9, 102.6],   delay: 0.20 },
  { id: 'm83', location: [27.7, 85.3],    delay: 0.37 },
  { id: 'm84', location: [33.7, 73.1],    delay: 0.54 },
  { id: 'm85', location: [15.3, 44.2],    delay: 0.71 },
  { id: 'm86', location: [25.2, 55.3],    delay: 0.88 },
  { id: 'm87', location: [12.4, 43.1],    delay: 1.05 },
  // Africa
  { id: 'm88', location: [30.0, 31.2],    delay: 1.22 },
  { id: 'm89', location: [6.4,  3.4],     delay: 1.39 },
  { id: 'm90', location: [-1.3, 36.8],    delay: 1.56 },
  { id: 'm91', location: [-26.2, 28.0],   delay: 1.73 },
  { id: 'm92', location: [33.6, -7.6],    delay: 1.90 },
  { id: 'm93', location: [9.0,  38.7],    delay: 0.08 },
  { id: 'm94', location: [-4.3, 15.3],    delay: 0.25 },
  { id: 'm95', location: [5.5,  -0.2],    delay: 0.42 },
  { id: 'm96', location: [-18.9, 47.5],   delay: 0.59 },
  { id: 'm97', location: [-33.9, 18.4],   delay: 0.76 },
  { id: 'm98', location: [36.8, 10.2],    delay: 0.93 },
  { id: 'm99', location: [12.4, -1.5],    delay: 1.10 },
  { id: 'm100',location: [7.0,  5.3],     delay: 1.27 },
  { id: 'm101',location: [4.0,  9.7],     delay: 1.44 },
  { id: 'm102',location: [15.5, 32.5],    delay: 1.61 },
  { id: 'm103',location: [14.0, -17.0],   delay: 1.78 },
  { id: 'm104',location: [9.5, -13.7],    delay: 1.95 },
  { id: 'm105',location: [12.3, -1.5],    delay: 0.18 },
  { id: 'm106',location: [-4.0, 39.7],    delay: 0.35 },
  { id: 'm107',location: [-25.9, 32.6],   delay: 0.52 },
  { id: 'm108',location: [5.3,  -4.0],    delay: 0.69 },
  { id: 'm109',location: [18.1, -15.9],   delay: 0.86 },
  { id: 'm110',location: [0.3,  6.7],     delay: 1.03 },
  { id: 'm111',location: [-11.7, 43.3],   delay: 1.20 },
  { id: 'm112',location: [2.0,  45.3],    delay: 1.37 },
  // Australia / Oceania
  { id: 'm113',location: [-33.8, 151.2],  delay: 1.54 },
  { id: 'm114',location: [-37.8, 144.9],  delay: 1.71 },
  { id: 'm115',location: [-27.5, 153.0],  delay: 1.88 },
  { id: 'm116',location: [-31.9, 115.9],  delay: 0.06 },
  { id: 'm117',location: [-36.8, 174.8],  delay: 0.23 },
  { id: 'm118',location: [-17.7, 168.3],  delay: 0.40 },
];

export function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animationId: number;
    let phi = 0.55;

    function init() {
      const width = canvas!.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas!, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0.55,
        theta: 0.2,
        dark: 1,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        baseColor: [0.5, 0.5, 0.5],
        markerColor: [0.9, 0.1, 0.1],
        glowColor: [0.05, 0.05, 0.05],
        markers: MARKERS.map((m) => ({ location: m.location, size: 0.025, id: m.id })),
      });

      function animate() {
        if (!isPausedRef.current) phi += 0.003;
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.18 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => { if (canvas) canvas.style.opacity = '1'; });
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, []);

  return (
    <section
      id="problem"
      style={{ backgroundColor: '#000' }}
      className="py-20 md:py-24 flex flex-col items-center overflow-hidden"
    >
      <style>{`
        @keyframes pulse-expand {
          0%   { transform: scaleX(0.3) scaleY(0.3); opacity: 0.9; }
          100% { transform: scaleX(1.8) scaleY(1.8); opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <motion.div
        className="text-center mb-10 md:mb-14 px-6"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
      >
        <span
          className="block text-[10px] md:text-xs tracking-[0.3em] uppercase mb-3"
          style={{ fontFamily: "'Cinzel', serif", color: '#C49B42', opacity: 0.65 }}
        >
          The scale of the problem
        </span>
        <h2
          className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight mb-4"
          style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
        >
          500 million dogs.
          <br />
          <span style={{ color: '#dd2020' }}>No name. No home.</span>
        </h2>
        <p
          className="text-sm md:text-base max-w-sm mx-auto"
          style={{ color: 'rgba(250,244,236,0.45)', lineHeight: 1.75 }}
        >
          Every red dot is a city where dogs are suffering.
          <br />
          The problem isn't invisible — it's everywhere.
        </p>
      </motion.div>

      {/* Globe container */}
      <motion.div
        className="relative aspect-square select-none"
        style={{ width: 'min(600px, 88vw)' }}
        initial={{ opacity: 0, scale: 0.88 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'grab',
            opacity: 0,
            transition: 'opacity 1.2s ease',
            borderRadius: '50%',
            touchAction: 'none',
          }}
        />

        {/* CSS Anchor-positioned pulse rings for each marker */}
        {MARKERS.map((m) => (
          <div
            key={m.id}
            style={{
              position: 'absolute',
              // @ts-expect-error CSS Anchor Positioning API
              positionAnchor: `--cobe-${m.id}`,
              bottom: 'anchor(center)',
              left: 'anchor(center)',
              translate: '-50% 50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 6px))`,
              transition: 'opacity 0.35s, filter 0.35s',
            }}
          >
            {/* Outer pulse ring */}
            <span style={{
              position: 'absolute', inset: 0,
              border: '1.5px solid #ee1515',
              borderRadius: '50%',
              opacity: 0,
              animation: `pulse-expand 2.2s ease-out infinite ${m.delay}s`,
            }} />
            {/* Inner pulse ring (offset) */}
            <span style={{
              position: 'absolute', inset: 0,
              border: '1.5px solid #ee1515',
              borderRadius: '50%',
              opacity: 0,
              animation: `pulse-expand 2.2s ease-out infinite ${m.delay + 0.55}s`,
            }} />
            {/* Center dot */}
            <span style={{
              width: 8,
              height: 8,
              background: '#ff1a1a',
              borderRadius: '50%',
              boxShadow: '0 0 0 2px #000, 0 0 0 3.5px #ee1515, 0 0 8px 2px rgba(238,21,21,0.5)',
            }} />
          </div>
        ))}
      </motion.div>

      {/* Caption */}
      <motion.p
        className="mt-6 text-center text-[10px] md:text-xs tracking-[0.2em] uppercase"
        style={{ fontFamily: "'Cinzel', serif", color: 'rgba(220,30,30,0.45)' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Drag to rotate · Each pulse = a city
      </motion.p>
    </section>
  );
}
