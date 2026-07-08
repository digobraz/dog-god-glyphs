import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider-horizontal';
import { PageTopBar } from '@/components/PageTopBar';
import { useT, useLang } from '@/i18n/LanguageContext';
import dogyptTextLogo from '@/assets/dogypt-logo-gold.png';
import { Seo } from '@/components/Seo';

/* Web jazykový kód (useLang) → YouTube caption BCP-47 kód.
 * Tých 18 caption trackov je nahraných na INTRO videu; cez cc_lang_pref
 * sa správny zapne sám podľa jazyka stránky. Chýbajúci kód → EN fallback. */
const YT_CAPTION_LANG: Record<string, string> = {
  ara: 'ar', chn: 'zh-Hans', cs: 'cs', deu: 'de', en: 'en', esp: 'es',
  fra: 'fr', ind: 'hi', ita: 'it', jpn: 'ja', kor: 'ko', nld: 'nl',
  pol: 'pl', prt: 'pt', rus: 'ru', sk: 'sk', tur: 'tr', ukr: 'uk',
};

/* ── Vlastný titulkový overlay pre INTRO video ──
 * YouTube si polohu titulkov pozicuje sám (dole nad ovládaním) a bije sa
 * s vpáleným news-chyronom vo videu. Preto YT titulky VYPÍNAME
 * (cc_load_policy=0) a kreslíme vlastný overlay vyššie, nad chyronom.
 * Časovanie + preklady = tie isté VTT, čo sú nahrané na YT
 * (vystupy/youtube/subtitles/*.vtt → public/data/intro-captions.json). */
type IntroCue = { s: number; e: number; t: string };
let introCaptionsPromise: Promise<Record<string, IntroCue[]>> | null = null;
function loadIntroCaptions(): Promise<Record<string, IntroCue[]>> {
  if (!introCaptionsPromise) {
    introCaptionsPromise = fetch('/data/intro-captions.json').then((r) => r.json());
  }
  return introCaptionsPromise;
}

/* Načíta YouTube IFrame API raz; resolve keď je window.YT.Player pripravený. */
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeIframeApi(): Promise<void> {
  const w = window as unknown as { YT?: { Player?: unknown }; onYouTubeIframeAPIReady?: () => void };
  if (w.YT?.Player) return Promise.resolve();
  if (!ytApiPromise) {
    ytApiPromise = new Promise<void>((resolve) => {
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    });
  }
  return ytApiPromise;
}

type PillStatus = 'done' | 'progress' | 'future' | 'goal';
type PillData = { icon: string; label: string; tooltip: string; status: PillStatus };

/* ONE persistent <canvas> for the whole WHAT IF papyrus. The papyrus PNG is drawn
 * EVERY frame, pixel-identical → it never moves, fades or changes structure as you
 * scroll between beats. Only the figure changes: each beat's figure is a video on a
 * white background, drawn with globalCompositeOperation='multiply' (white ×papyrus =
 * papyrus → vanishes; black ink stays). Canvas multiply works in EVERY browser incl.
 * iOS Safari (mix-blend-mode on a <video> element does not). When the active beat
 * changes only the FIGURE cross-fades (the papyrus stays put). The papyrus PNG has a
 * transparent surround so the dark page shows around the rolled scroll — no box. */
function PapyrusStage({ papyrus, sheet, videos, active }: {
  papyrus: string;
  sheet: { x: number; y: number; w: number; h: number }; // fractions of the canvas
  videos: (string | null)[]; // figure video per beat (null = no figure yet)
  active: number; // current beat index (wfState)
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vidRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // Offscreen scratch canvas — Matej confirmed this state worked on iPhone ("super"
  // at session start, no white box). Video frame → scratch (source-over), then the
  // scratch canvas is multiplied onto the main canvas.
  const scratchRef = useRef<HTMLCanvasElement | null>(null);
  const fade = useRef({ from: active, to: active, t: 1 });
  const { x: sxF, y: syF, w: swF, h: shF } = sheet;
  // true = document viditeľný AND stage v (blízkosti) viewportu. Keď false, draw() rAF
  // slučka aj skryté videá sa pauznú (batéria) — bez toho by bežali navždy aj mimo obrazovky.
  const activeRef = useRef(true);
  const resumeDrawRef = useRef<() => void>(() => {});

  // Active beat changed → cross-fade the figure (papyrus untouched).
  useEffect(() => {
    const f = fade.current;
    if (active !== f.to) { f.from = f.to; f.to = active; f.t = 0; }
  }, [active]);

  // iOS won't start the videos from a mount-time .play() (stays paused at rs4) and the
  // canvas→canvas multiply only gets real frames from a PLAYING video → paused = empty
  // papyrus. Kick them on the first user gesture (any touch/scroll/tap), which iOS
  // accepts, and keep retrying any that fall back to paused.
  useEffect(() => {
    const playAll = () => {
      if (!activeRef.current) return; // stage skrytá/tab v pozadí — nebuď videá naspäť
      vidRefs.current.forEach((v) => v && v.paused && v.play().catch(() => {}));
    };
    playAll();
    const opts = { passive: true, capture: true } as AddEventListenerOptions;
    document.addEventListener('touchstart', playAll, opts);
    document.addEventListener('pointerdown', playAll, opts);
    document.addEventListener('scroll', playAll, opts);
    const iv = setInterval(playAll, 1000); // safety net: re-arm any paused video
    return () => {
      document.removeEventListener('touchstart', playAll, opts);
      document.removeEventListener('pointerdown', playAll, opts);
      document.removeEventListener('scroll', playAll, opts);
      clearInterval(iv);
    };
  }, [videos]);

  // Pauzni celú scénu keď je tab v pozadí (visibilitychange) alebo stage mimo viewportu
  // (IntersectionObserver na canvase — kanvas má rovnaký bounding box ako skryté videá
  // za ním). Pri návrate späť sa rAF slučka aj videá znova nakopnú.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let intersecting = true;
    let docVisible = !document.hidden;

    const applyActive = () => {
      const next = intersecting && docVisible;
      if (next === activeRef.current) return;
      activeRef.current = next;
      if (next) {
        resumeDrawRef.current();
        vidRefs.current.forEach((v) => v && v.paused && v.play().catch(() => {}));
      } else {
        vidRefs.current.forEach((v) => v && !v.paused && v.pause());
      }
    };

    const io = new IntersectionObserver((entries) => {
      intersecting = entries[0]?.isIntersecting ?? true;
      applyActive();
    }, { threshold: 0 });
    io.observe(canvas);

    const onVisibility = () => { docVisible = !document.hidden; applyActive(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let raf = 0, ready = false, lastTs = 0;
    const FADE_S = 0.4;
    const pap = new Image();
    pap.onload = () => { canvas.width = pap.naturalWidth; canvas.height = pap.naturalHeight; ready = true; };
    pap.src = papyrus;
    vidRefs.current.forEach((v) => v && v.play().catch(() => {}));

    const drawFig = (idx: number, alpha: number) => {
      const v = vidRefs.current[idx];
      if (!v || v.readyState < 2 || !v.videoWidth || alpha <= 0) return;
      const W = canvas.width, H = canvas.height;
      const sx = sxF * W, sy = syF * H, sw = swF * W, sh = shF * H;
      const s = Math.min(sw / v.videoWidth, sh / v.videoHeight);
      const dw = v.videoWidth * s, dh = v.videoHeight * s;
      let scratch = scratchRef.current;
      if (!scratch) { scratch = document.createElement('canvas'); scratchRef.current = scratch; }
      if (scratch.width !== v.videoWidth || scratch.height !== v.videoHeight) {
        scratch.width = v.videoWidth; scratch.height = v.videoHeight;
      }
      const sctx = scratch.getContext('2d');
      if (!sctx) return;
      sctx.globalCompositeOperation = 'source-over';
      sctx.clearRect(0, 0, scratch.width, scratch.height);
      sctx.drawImage(v, 0, 0);
      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(scratch, sx + (sw - dw) / 2, sy + (sh - dh) / 2, dw, dh);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    const draw = (ts: number) => {
      if (ready) {
        const f = fade.current;
        if (f.t < 1) { f.t = Math.min(1, f.t + (lastTs ? (ts - lastTs) / 1000 : 0) / FADE_S); }
        lastTs = ts;
        const W = canvas.width, H = canvas.height;
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(pap, 0, 0, W, H); // static papyrus — never changes
        if (f.from !== f.to && f.t < 1) drawFig(f.from, 1 - f.t); // outgoing figure
        drawFig(f.to, f.from !== f.to ? f.t : 1); // incoming / steady figure
      }
      // Stage skrytá (tab v pozadí / mimo viewportu) → slučku zastav namiesto donekonečna
      // kresliť neviditeľný canvas. resumeDrawRef (nižšie) ju znova nakopne pri návrate.
      raf = activeRef.current ? requestAnimationFrame(draw) : 0;
    };
    raf = requestAnimationFrame(draw);
    resumeDrawRef.current = () => {
      if (raf) return; // slučka už beží
      lastTs = 0; // vyhni sa skoku vo fade-e po dlhšej pauze
      raf = requestAnimationFrame(draw);
    };
    return () => {
      cancelAnimationFrame(raf);
      resumeDrawRef.current = () => {};
    };
  }, [papyrus, sxF, syF, swF, shF, videos]);

  return (
    <>
      <canvas ref={canvasRef} className="wf-scene-canvas" aria-hidden style={{ zIndex: 1 }} />
      {videos.map((v, i) =>
        v ? (
          /* iOS DEBUG-CONFIRMED: display:none → video stuck at readyState 1 (metadata
           * only), paused, never decodes → canvas gets no frame. iOS needs the video
           * RENDERED at real size + autoplay to decode/play. So: full-size, opacity 0,
           * BEHIND the canvas (zIndex 0 < canvas 1) → invisible to the eye, but iOS
           * decodes + plays it; the canvas samples its frames and composites. */
          <video key={i} ref={(el) => { vidRefs.current[i] = el; }} src={v}
                 muted loop playsInline autoPlay preload="auto" aria-hidden
                 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                          objectFit: 'contain', opacity: 0, zIndex: 0, pointerEvents: 'none' }} />
        ) : null
      )}
    </>
  );
}

const PILLARS: PillData[] = [
  {
    icon: '/icons/mission/ankh.svg',
    label: 'The Plan',
    tooltip:
      "Dogyptism is alive. The constitution written, the first doglovers gathering, the movement set in motion.",
    status: 'done',
  },
  {
    icon: '/icons/mission/pyramid.svg',
    label: 'One Million',
    tooltip:
      "One million doglovers, one million heroglyphs. The threshold where we stop being individuals and become unstoppable.",
    status: 'progress',
  },
  {
    icon: '/icons/mission/internet.svg',
    label: 'Digital Temple',
    tooltip:
      "One app, one sacred space, connecting every doglover, every dog, every act of kindness across the planet.",
    status: 'progress',
  },
  {
    icon: '/icons/mission/heartpaw.svg',
    label: 'The Mission',
    tooltip:
      "Not shelters but working solutions, fully backed by Dogypt. We fix the root, not the symptoms the system ignores.",
    status: 'future',
  },
  {
    icon: '/icons/mission/doghome.svg',
    label: 'Centers',
    tooltip:
      "Real Dogypt Centers on every continent. Shelters, sanctuaries and gathering places built by us, owned by us.",
    status: 'future',
  },
  {
    icon: '/icons/mission/chemical.svg',
    label: 'Research',
    tooltip:
      "Longevity research guided by Mother Nature, not the pharma machine. Helping every dog live longer, healthier.",
    status: 'future',
  },
  {
    icon: '/icons/mission/balance.svg',
    label: 'Goal',
    tooltip:
      "A home for every stray on Earth. The final vow of the pack: zero dogs left behind, every life returned.",
    status: 'goal',
  },
];

/* ===================================================================
   WHAT IF… pinned scrollytelling roadmap
   - dark page bg preserved; papyrus = scroll artefact only (left col)
   - papyrus colour = /religion .codex-paper tokens (warm gold papyrus)
   - illustrations = SCHEMATIC placeholders (real doodle Matej+Hektor TBD).
     Each beat supports an optional looping video (beat.video) that replaces
     the SVG when the animated asset exists — drop the file in /public/videos/.
   =================================================================== */
const WF_INK = '#5a3a0c'; // brown ink matching /religion papyrus text
const wfStroke = `stroke="${WF_INK}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
const wfHeroglyph = `<rect x="0" y="0" width="34" height="46" rx="4" ${wfStroke}/><path d="M17 9 l0 28 M9 22 l16 0" ${wfStroke}/>`;
const wfManDog = (extra = '') => `<svg viewBox="0 0 200 250" ${wfStroke}>
  <circle cx="66" cy="70" r="15"/>
  <path d="M66 85 L66 148 M66 100 L48 126 M66 100 L86 122"/>
  <path d="M66 148 L54 198 M66 148 L80 198"/>
  <path d="M118 160 q4 -32 28 -32 q22 0 24 26 l12 2"/>
  <path d="M118 160 l0 38 M130 160 l0 38 M158 152 l2 46 M170 154 l2 44"/>
  <path d="M144 130 l-6 -16 M164 132 l8 -14"/>
  ${extra}
</svg>`;

const WF_INTRO_SVG = `<svg viewBox="0 0 200 250" ${wfStroke}>
  <circle cx="74" cy="64" r="17"/>
  <path d="M74 81 L74 150"/>
  <path d="M74 100 L52 126"/>
  <path d="M74 100 L96 118 L86 86 L78 78"/>
  <path d="M74 150 L60 205 M74 150 L88 205"/>
  <path d="M120 205 q2 -40 30 -42 q24 -2 26 26"/>
  <path d="M150 163 q-10 -6 -8 -18 M168 168 q8 -8 4 -18"/>
  <path d="M120 205 l0 -2 M138 205 l0 -10 M176 196 l4 9"/>
  <path d="M150 163 q-14 8 -16 22"/>
  <path d="M146 150 L92 96" stroke-dasharray="3 6" stroke="${WF_INK}" opacity="0.5"/>
</svg>`;

const WF_ICONS: Record<string, string> = {
  ankh: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M12 11 L12 22 M7 16 L17 16"/></svg>',
  pyramid: '<svg viewBox="0 0 24 24"><path d="M12 3 L22 21 L2 21 Z M7 12 L17 12"/></svg>',
  heartpaw: '<svg viewBox="0 0 24 24"><path d="M12 21 C4 15 4 8 8 7 C10 6.5 12 8 12 10 C12 8 14 6.5 16 7 C20 8 20 15 12 21 Z"/></svg>',
  balance: '<svg viewBox="0 0 24 24"><path d="M12 3 L12 21 M5 21 L19 21 M5 7 L19 7 M5 7 L2 14 L8 14 Z M19 7 L16 14 L22 14 Z"/></svg>',
};

type Beat = {
  id: string; // i18n kľúč base: vision.beat.<id>.{tag,bigW,bigG,h}; intro lead = vision.intro.lead
  intro?: boolean;
  n?: string;
  mech?: string;
  icon?: string;
  svg: string;
  figure?: string; // transparent figure PNG drawn ONTO the realistic papyrus frame
  img?: string; // baked papyrus+scene PNG on black (full, replaces the papyrus frame)
  video?: string; // figure-on-white mp4 overlaid via mix-blend-mode:multiply onto papyrus-vision.webp (universal, no alpha)
};

const WF_BEATS: Beat[] = [
  {
    id: 'dream',
    intro: true,
    video: '/videos/vision-dream.mp4',
    figure: '/images/vision/figure-dream.png',
    svg: WF_INTRO_SVG,
  },
  {
    id: 'symbol',
    n: '01',
    icon: 'ankh',
    video: '/videos/vision-symbol.mp4',
    svg: wfManDog(`<g transform="translate(116,-6)">${wfHeroglyph}</g><path d="M124 22 q-8 -10 -16 -4" ${wfStroke}/>`),
  },
  {
    id: 'nation',
    n: '02',
    video: '/videos/vision-nation.mp4',
    icon: 'pyramid',
    svg: `<svg viewBox="0 0 200 250" ${wfStroke}>${Array.from({ length: 9 })
      .map((_, i) => {
        const x = 34 + (i % 3) * 52;
        const y = 50 + Math.floor(i / 3) * 62;
        return `<rect x="${x}" y="${y}" width="28" height="38" rx="3"/><path d="M${x + 14} ${y + 7} l0 24 M${x + 5} ${y + 17} l18 0"/>`;
      })
      .join('')}</svg>`,
  },
  {
    id: 'temple',
    n: '03',
    video: '/videos/vision-temple.mp4',
    icon: 'heartpaw',
    svg: `<svg viewBox="0 0 200 250" ${wfStroke}><path d="M40 200 l0 -70 l60 -42 l60 42 l0 70 Z"/><path d="M40 130 l60 -42 l60 42"/><rect x="86" y="150" width="28" height="50"/><circle cx="100" cy="58" r="18"/><path d="M100 49 l0 18 M91 58 l18 0"/></svg>`,
  },
  {
    id: 'centers',
    n: '04',
    video: '/videos/vision-centers.mp4',
    icon: 'balance',
    svg: `<svg viewBox="0 0 200 250" ${wfStroke}><ellipse cx="100" cy="158" rx="78" ry="28"/>${Array.from({ length: 6 })
      .map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const x = 100 + Math.cos(a) * 78;
        const y = 158 + Math.sin(a) * 28;
        return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="8"/>`;
      })
      .join('')}<path d="M100 46 l0 66 M72 64 l56 0 M72 64 l-10 24 l20 0 Z M128 64 l-10 24 l20 0 Z"/></svg>`,
  },
  {
    id: 'era',
    n: '05',
    video: '/videos/vision-era.mp4',
    icon: 'ankh',
    svg: `<svg viewBox="0 0 200 250" ${wfStroke}><g transform="translate(66,86) scale(2)">${wfHeroglyph}</g><path d="M40 60 q60 -40 120 0" stroke-dasharray="2 7" opacity="0.5" stroke="${WF_INK}"/></svg>`,
  },
];

// Figure video per beat (null = no figure yet) — fed to the single persistent PapyrusStage.
const WF_VIDEOS: (string | null)[] = WF_BEATS.map((b) => b.video ?? null);

export default function Vision() {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const ytCaptionLang = YT_CAPTION_LANG[lang] ?? 'en';
  const [activePill, setActivePill] = useState<number | null>(null);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [captionText, setCaptionText] = useState<string>('');
  const ytPlayerRef = useRef<{ getCurrentTime?: () => number; destroy?: () => void; unloadModule?: (m: string) => void } | null>(null);
  const introCuesRef = useRef<IntroCue[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Vlastné titulky INTRO videa: vyber cues pre aktuálny jazyk ──
  useEffect(() => {
    if (!videoPlaying) return;
    let cancelled = false;
    loadIntroCaptions()
      .then((data) => {
        if (cancelled) return;
        introCuesRef.current = data[ytCaptionLang] ?? data.en ?? [];
      })
      .catch(() => { introCuesRef.current = []; });
    return () => { cancelled = true; };
  }, [videoPlaying, ytCaptionLang]);

  // ── Napoj YT prehrávač, poll času → riadi náš overlay ──
  useEffect(() => {
    if (!videoPlaying) { setCaptionText(''); return; }
    let poll: number | undefined;
    let cancelled = false;
    loadYouTubeIframeApi().then(() => {
      if (cancelled) return;
      const YT = (window as unknown as { YT: { Player: new (id: string, opts: unknown) => typeof ytPlayerRef.current } }).YT;
      const killNativeCaptions = () => {
        const p = ytPlayerRef.current;
        try { p?.unloadModule?.('captions'); p?.unloadModule?.('cc'); } catch { /* noop */ }
      };
      ytPlayerRef.current = new YT.Player('yt-intro-frame', {
        events: {
          onReady: () => {
            killNativeCaptions();
            poll = window.setInterval(() => {
              const p = ytPlayerRef.current;
              if (!p?.getCurrentTime) return;
              const now = p.getCurrentTime();
              const cue = introCuesRef.current.find((c) => now >= c.s && now < c.e);
              setCaptionText(cue ? cue.t : '');
            }, 200);
          },
          // YT načíta caption modul až s prehrávaním → zhasni ho aj pri PLAYING
          onStateChange: (e: { data: number }) => { if (e.data === 1) killNativeCaptions(); },
        },
      });
    });
    return () => {
      cancelled = true;
      if (poll) window.clearInterval(poll);
      try { ytPlayerRef.current?.destroy?.(); } catch { /* iframe už odmontovaný */ }
      ytPlayerRef.current = null;
      setCaptionText('');
    };
  }, [videoPlaying]);

  // ── WHAT IF pinned scrollytelling: scroll progress → active beat ──
  const wfPinRef = useRef<HTMLElement>(null);
  const finaleRef = useRef<HTMLElement>(null); // 3rd floor (CTA) — auto-snap target
  const [wfState, setWfState] = useState<number>(0);
  const [wfProgress, setWfProgress] = useState<number>(0);
  const [wfEntered, setWfEntered] = useState<boolean>(false); // arms the slide1→slide2 entrance

  useEffect(() => {
    const pin = wfPinRef.current;
    if (!pin) return;
    let ticking = false;
    // Controlled hero → papyrus entry: when the section first reaches the top of
    // the viewport (coming down from the hero), we hard-lock to beat 1 and briefly
    // swallow any residual fling momentum so a strong scroll can't blast straight
    // through beats 2-4. The lock releases after a short hold (deliberate scroll
    // then advances beat-by-beat) or immediately if the user pulls back up.
    let prevRectTop = pin.getBoundingClientRect().top;
    let entryLocked = false;
    let lockReleaseAt = 0;
    let lastScrollY = window.scrollY;
    let scrollDir = 1; // 1 = down, -1 = up
    // Auto-glide between the 3 "floors" (hero · papyrus · CTA finale): never rest
    // half-way. On scroll-end inside a transition, smoothly commit to a floor once
    // it's been entered by ≥25% in the scroll direction (proximity snap alone allowed
    // a mid-rest). The pin's inner 6-beat region is NEVER snapped — it scrolls freely.
    const COMMIT = 0.25; // commit threshold: 25% into the transition → stick
    let snapping = false;
    const tryAutoGlide = () => {
      if (snapping || entryLocked) return;
      if (!window.matchMedia('(min-width: 768px)').matches) return; // desktop only (matches CSS snap)
      const finale = finaleRef.current;
      const vh = window.innerHeight;
      const y = window.scrollY;
      const pinTop = y + pin.getBoundingClientRect().top; // scrollY where papyrus aligns to top
      const finaleTop = finale ? y + finale.getBoundingClientRect().top : Infinity;
      const beatEnd = finaleTop - vh; // scrollY where the last beat sits fully (pin about to release)
      const down = scrollDir > 0;
      let target: number | null = null;

      if (y < pinTop - 4) {
        // ── floor 1 ↔ 2: hero ↔ papyrus ──
        const prog = pinTop > 0 ? y / pinTop : 0; // 0 = hero top, 1 = papyrus engaged
        target = down ? (prog >= COMMIT ? pinTop : 0) : (prog <= 1 - COMMIT ? 0 : pinTop);
      } else if (y > beatEnd + 4) {
        // ── floor 2 ↔ 3: papyrus (last beat) ↔ finale ──
        const prog = Math.max(0, Math.min(1, (y - beatEnd) / vh)); // 0 = last beat, 1 = finale
        target = down ? (prog >= COMMIT ? finaleTop : beatEnd) : (prog <= 1 - COMMIT ? beatEnd : finaleTop);
      } else {
        return; // inside the 6-beat free-scroll region → no snapping
      }

      if (target == null || Math.abs(target - y) < 6) return;
      snapping = true;
      window.scrollTo({ top: target, behavior: 'smooth' });
      window.setTimeout(() => { snapping = false; }, 680);
    };
    let snapEndTimer = 0;
    const onScrollEnd = () => {
      window.clearTimeout(snapEndTimer);
      snapEndTimer = window.setTimeout(tryAutoGlide, 120);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const rectTop = pin.getBoundingClientRect().top;
        if (window.scrollY !== lastScrollY) {
          scrollDir = window.scrollY > lastScrollY ? 1 : -1;
          lastScrollY = window.scrollY;
        }
        const total = pin.offsetHeight - vh;
        const pinTopAbs = window.scrollY + rectTop; // absolute scrollY where beat 1 aligns to top

        // Engage the lock the moment the pin top crosses the viewport top going down.
        if (!entryLocked && prevRectTop > 0 && rectTop <= 0) {
          entryLocked = true;
          lockReleaseAt = performance.now() + 500;
        }
        if (entryLocked) {
          if (rectTop > 2) {
            entryLocked = false; // user pulled back toward the hero → let go
          } else {
            if (rectTop < -0.5) window.scrollTo(0, pinTopAbs); // clamp any overshoot to beat 1
            setWfProgress(0);
            setWfState(0);
            setWfEntered(true);
            if (performance.now() >= lockReleaseAt) entryLocked = false;
            prevRectTop = rectTop;
            ticking = false;
            return;
          }
        }

        const p = total > 0 ? Math.max(0, Math.min(1, -rectTop / total)) : 0;
        setWfProgress(p);
        setWfState(Math.max(0, Math.min(WF_BEATS.length - 1, Math.floor(p * WF_BEATS.length))));
        // Arm the entrance (papyrus unroll + first beat draw-in) as the section
        // crosses into pin range. Hysteresis so it disarms above and replays on re-entry.
        setWfEntered((prev) => {
          if (!prev && rectTop < vh * 0.3) return true;
          if (prev && rectTop > vh * 0.55) return false;
          return prev;
        });
        prevRectTop = rectTop;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScrollEnd, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScrollEnd);
      window.clearTimeout(snapEndTimer);
    };
  }, []);

  return (
    <div className="dark-bg vision-root flex flex-col min-h-[100dvh] relative">
      <Seo
        path="/vision"
        title="The Vision — A World Where No Dog Is Forgotten | DOGYPT"
        description="Uniting dog lovers under one philosophy to help dogs in need. This is the vision of DOGYPT, the movement where Dog is God."
      />
      {/* Mild radial overlay — fixed so it stays put when scroll-snap moves sections */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.5) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Mobile only: extra 25% dark layer on page bg (image stays in original colors — z-index higher) */}
      <div
        className="md:hidden"
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <style>{`
        /* Page scrollovateľný (min-h + overflow-y-auto) → .dark-bg::before (absolute, cover)
         * by sa inak roztiahol na celú výšku scrollu a zväčšil heroglyf pozadie.
         * Fix = fixed na viewport (rovnaký pattern ako .about-root). Scoped na .vision-root. */
        .vision-root.dark-bg::before {
          position: fixed;
          /* inset:0 by ukotvil spodok pozadia na spodok viewportu → keď sa na mobile
           * pri scrolle (hero → papyrus) schová adresný riadok, viewport sa zväčší a
           * background-size:cover prepočíta = heroglyf mierne zazoomuje („pozadie sa
           * o trochu zmení"). Ukotvenie na 100lvh (veľký viewport) drží výšku boxu
           * konštantnú bez ohľadu na toolbar → pozadie nehybné. */
          inset: 0 0 auto 0;
          height: 100lvh;
        }

        /* ── 2-col layout (mobile: flex column with reordered items via display:contents) ── */
        .mission-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(14px, 2.4vh, 22px);
          width: 100%;
          max-width: 1120px;
          text-align: center;
        }
        @media (max-width: 767px) {
          .mission-grid { gap: clamp(18px, 3vh, 30px); }
        }

        /* Mobile-only headline — match /religion .codex-headline mobile size (IN DOG WE TRUST) for cross-page consistency */
        @media (max-width: 767px) {
          .headline-main {
            font-size: 2.8rem !important;
            letter-spacing: 0.03em !important;
            line-height: 1.04 !important;
          }
          .headline-sub {
            font-size: 1.5rem !important;
            letter-spacing: 0.06em !important;
            margin-top: 10px !important;
            white-space: nowrap !important;
          }
        }
        @media (min-width: 768px) {
          .mission-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
            gap: clamp(28px, 4.5vw, 64px);
            align-items: stretch;
            text-align: left;
          }
        }

        /* Body paragraph */
        .mission-para {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.85rem, 1.15vw, 0.98rem);
          font-weight: 400;
          color: rgba(250,244,236,0.78);
          line-height: 1.65;
          letter-spacing: 0.005em;
          margin: 0;
          max-width: 480px;
        }
        @media (max-width: 767px) {
          .mission-para {
            font-size: clamp(15px, 4.4vw, 19px);
            line-height: 1.5;
            max-width: 92%;
            color: rgba(250,244,236,0.92);
            text-align: center;
            text-wrap: balance;
          }
        }

        /* Left column: middle group centered, CTA pinned to bottom (aligns with image bottom edge) */
        .mission-left {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 2.8vh, 28px);
        }
        @media (min-width: 768px) {
          .mission-left {
            gap: clamp(18px, 2.8vh, 26px);
            padding-top: 2px;
            justify-content: flex-start;
          }
        }
        .mission-left-middle {
          display: flex;
          flex-direction: column;
          gap: clamp(18px, 3.2vh, 34px);
        }
        .mission-bottom {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        @media (max-width: 767px) {
          .mission-bottom { align-items: center; }
        }

        /* ── MOBILE: 2 "podlažia" – snap scroll, každá sekcia = jeden viewport ── */
        .m-screen {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (max-width: 767px) {
          .topbar-wrap {
            position: sticky;
            top: 0;
            z-index: 50;
            background: #000;
            flex-shrink: 0;
          }
          .mission-grid { gap: 0; max-width: none; }
          .m-screen {
            padding: 0 5vw;
          }
          .m-screen-a {
            justify-content: flex-start;
            padding-top: clamp(24px, 5vh, 48px);
            padding-bottom: clamp(40px, 8vh, 70px);
            gap: clamp(16px, 2.8vh, 24px);
          }
          .m-screen-b {
            justify-content: flex-start;
            padding-top: clamp(10px, 3vh, 28px);
            padding-bottom: clamp(48px, 10vh, 90px);
            gap: clamp(22px, 3.6vh, 32px);
          }
        }
        @media (min-width: 768px) {
          .m-screen { display: contents; }
          /* Sticky top bar across the whole page (incl. the WHAT IF pin section,
           * which is itself sticky). z-index above wf-sticky/progress; soft fade so
           * the dark heroglyph page isn't hard-masked behind the logo + nav. */
          .topbar-wrap {
            position: sticky; top: 0; z-index: 60;
            background: linear-gradient(180deg, rgba(0,0,0,0.94) 58%, rgba(0,0,0,0));
            padding-bottom: 14px;
          }
        }

        /* Desktop: 3 groups in left column with space-between — top group / CTA centered / pills bottom */
        @media (min-width: 768px) {
          .mission-left { justify-content: space-between; }
          .mission-bottom { align-self: flex-start; }
        }
        .mission-subline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.6rem, 0.85vw, 0.72rem);
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(250,244,236,0.42);
          margin: 0;
        }

        /* ── PILLARS (ROADMAP) ── */
        .mission-pillars {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: clamp(4px, 0.55vw, 7px);
          justify-content: flex-start;
        }
        @media (max-width: 767px) {
          .mission-pillars {
            justify-content: center;
            gap: 9px;
            max-width: 92%;
          }
        }
        .mission-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.55rem, 0.85vw, 0.68rem);
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #FAF3E1;
          background: rgba(250, 243, 225, 0.10);
          border: 1px solid rgba(250, 243, 225, 0.55);
          border-radius: 999px;
          padding: 4px 10px;
          white-space: nowrap;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }
        .mission-pill:hover {
          background: rgba(250, 243, 225, 0.20);
          border-color: rgba(250, 243, 225, 0.95);
          transform: translateY(-1px);
        }
        @media (max-width: 767px) {
          .mission-pill {
            font-size: 11px;
            letter-spacing: 0.14em;
            padding: 5px 11px;
            gap: 6px;
            border-radius: 999px;
          }
        }
        .mission-pill-icon {
          width: 13px;
          height: 13px;
          object-fit: contain;
          filter: brightness(0) saturate(100%) invert(96%) sepia(7%)
                  saturate(382%) hue-rotate(355deg) brightness(101%) contrast(96%);
          opacity: 0.85;
        }
        @media (max-width: 767px) {
          .mission-pill-icon { width: 12px; height: 12px; }
          .pill-status-dot { width: 6px; height: 6px; }
        }

        /* Status dot — done (green) / progress (orange pulsing) / future (red) */
        .pill-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .pill-status-dot.done {
          background: #4ADE80;
          box-shadow: 0 0 6px rgba(74, 222, 128, 0.65);
        }
        .pill-status-dot.progress {
          background: #F59E0B;
          box-shadow: 0 0 7px rgba(245, 158, 11, 0.75);
          animation: dotPulse 1.4s ease-in-out infinite;
        }
        .pill-status-dot.future {
          background: #EF4444;
          box-shadow: 0 0 5px rgba(239, 68, 68, 0.45);
          opacity: 0.75;
        }
        .pill-status-dot.goal {
          background: #2E5FD0;
          box-shadow: 0 0 7px rgba(46, 95, 208, 0.75);
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 7px rgba(245, 158, 11, 0.85); }
          50%      { opacity: 0.55; transform: scale(0.78); box-shadow: 0 0 4px rgba(245, 158, 11, 0.45); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pill-status-dot.progress { animation: none; }
        }

        /* Force row break after The App (pill #3) so The Mission starts row 2 */
        .pill-row-break {
          flex-basis: 100%;
          height: 0;
        }
        .pill-row-break-mobile { display: none; }
        .pill-row-break-desktop { display: block; }
        @media (max-width: 767px) {
          .pill-row-break-mobile { display: none; }
          .pill-row-break-desktop { display: none; }
        }

        /* Roadmap connector — papyrus "···" inline */
        .pill-connector {
          display: inline-flex;
          align-items: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.55rem, 0.85vw, 0.7rem);
          color: rgba(250, 244, 236, 0.30);
          letter-spacing: 0.22em;
          padding: 0 2px;
          user-select: none;
          pointer-events: none;
        }

        /* Desktop: per-pill floating tooltip (papyrus + downward arrow) */
        .pill-tooltip-float {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          width: clamp(220px, 22vw, 280px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 10px;
          padding: 9px 13px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          line-height: 1.45;
          letter-spacing: 0.005em;
          text-transform: none;
          color: #1a0a05;
          white-space: normal;
          text-align: left;
          z-index: 20;
          pointer-events: none;
          box-shadow:
            0 6px 24px rgba(0, 0, 0, 0.55),
            0 0 0 3px rgba(201, 154, 63, 0.18);
          animation: tooltipFloatFade 0.18s ease-out;
        }
        .pill-tooltip-float::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-top-color: #C99A3F;
        }

        /* Mobile: shared block below pills, papyrus styling (matches /heroglyph) */
        .pill-tooltip {
          width: 100%;
          max-width: 360px;
          margin: 4px auto 0;
          padding: 10px 14px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 10px;
          box-shadow:
            0 6px 24px rgba(0, 0, 0, 0.55),
            0 0 0 3px rgba(201, 154, 63, 0.18);
          text-align: left;
          animation: tooltipFade 0.18s ease-out;
        }
        .pill-tooltip-label {
          font-family: 'Cinzel', serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #1a0a05;
          line-height: 1.25;
        }
        .pill-tooltip-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.005em;
          line-height: 1.45;
          color: #4a3010;
          margin-top: 4px;
        }
        @media (max-width: 767px) {
          .pill-tooltip {
            position: absolute;
            top: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            width: max-content;
            max-width: min(360px, 86vw);
            padding: 11px 14px;
            margin: 0;
            z-index: 30;
            cursor: pointer;
          }
          .pill-tooltip-label { font-size: 12px; letter-spacing: 0.10em; }
          .pill-tooltip-text  { font-size: 12px; line-height: 1.45; }
        }
        /* Desktop floating: preserve translateX(-50%) centering during fade */
        @keyframes tooltipFloatFade {
          from { opacity: 0; transform: translate(-50%, -4px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        /* Mobile shared block: opacity-only (no transform on block) */
        @keyframes tooltipFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Active pill state */
        .mission-pill.is-active {
          background: rgba(201, 154, 63, 0.22);
          border-color: rgba(201, 154, 63, 0.95);
        }

        /* ── SQUARE COMPARISON ── */
        .square-frame {
          position: relative;
          width: 100%;
          max-width: min(62vh, 560px);
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 0 72px rgba(201,154,63,0.22),
            0 0 0 1px rgba(250,244,236,0.10) inset;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .square-frame {
            max-width: 76vw;
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* ── MOBILE: pulsing scroll arrow under headline (section A only) ── */
        .scroll-arrow {
          display: none;
        }
        @media (max-width: 767px) {
          .scroll-arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-top: clamp(6px, 1.4vh, 14px);
            animation: scrollArrowPulse 1.8s ease-in-out infinite;
          }
          .scroll-arrow svg {
            filter: drop-shadow(0 0 6px rgba(255,255,255,0.35));
          }
        }
        @keyframes scrollArrowPulse {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50%      { transform: translateY(7px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-arrow { animation: none; opacity: 0.9; }
        }
        .square-label {
          position: absolute;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.78rem);
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          z-index: 4;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85);
        }
        .square-label.today {
          top: 14px;
          left: 14px;
          color: rgba(250,244,236,0.72);
        }
        .square-label.dogypt {
          bottom: 14px;
          right: 14px;
          color: #F5C73D;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85), 0 0 14px rgba(245,199,61,0.45);
        }

        /* ── CTA — same DNA as /heroglyph ── */
        .mission-cta {
          padding: clamp(11px, 1.7vh, 15px) clamp(28px, 4.4vw, 44px);
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.84rem, 1.2vw, 0.98rem);
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow:
            0 0 24px rgba(255, 200, 90, 0.65),
            0 0 60px rgba(230, 158, 26, 0.50),
            0 0 110px rgba(230, 158, 26, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
          transition: transform 0.2s, box-shadow 0.25s;
          animation: missionCtaPulse 3.2s ease-in-out infinite;
          align-self: flex-start;
        }
        @media (max-width: 767px) {
          .mission-cta {
            align-self: center;
            padding: 13px 34px;
            font-size: 0.95rem;
            letter-spacing: 0.14em;
            margin: clamp(18px, 3.5vh, 30px) 0;
          }
          .mission-pillars { margin-bottom: 0; }
        }
        .mission-cta:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            0 0 150px rgba(230, 158, 26, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .mission-cta:active { transform: scale(0.98); }
        @keyframes missionCtaPulse {
          0%, 100% {
            box-shadow:
              0 0 24px rgba(255, 200, 90, 0.55),
              0 0 60px rgba(230, 158, 26, 0.42),
              0 0 110px rgba(230, 158, 26, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
          }
          50% {
            box-shadow:
              0 0 34px rgba(255, 215, 110, 0.85),
              0 0 84px rgba(230, 158, 26, 0.62),
              0 0 140px rgba(230, 158, 26, 0.38),
              inset 0 1px 0 rgba(255, 255, 255, 0.55);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mission-cta { animation: none; }
        }

        /* ── Eyebrow / overline ── */
        .eyebrow {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.74rem);
          letter-spacing: 0.36em;
          color: rgba(250,244,236,0.45);
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .eyebrow::before {
          content: '';
          height: 1px;
          width: clamp(20px, 3vw, 32px);
          background: rgba(201,154,63,0.45);
        }

        /* ── INTRO VIDEO HERO (top section) ── */
        .vision-video-hero {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(18px, 3vh, 30px);
          padding: clamp(28px, 6vh, 60px) 5vw clamp(36px, 7vh, 72px);
          min-height: calc(100dvh - 72px);
          text-align: center;
        }
        @media (max-width: 767px) {
          /* Fill the band between the sticky top-bar (~89px) and the viewport bottom,
           * then centre the whole hero block within it. */
          .vision-video-hero {
            min-height: calc(100svh - 89px);
            justify-content: center;
            padding-top: clamp(12px, 2vh, 20px);
            padding-bottom: clamp(12px, 2vh, 20px);
            gap: clamp(18px, 3vh, 30px);
          }
          .video-hero-title { font-size: clamp(2.9rem, 12vw, 3.5rem) !important; }
        }
        /* Desktop: sticky topbar (~72px) sits in-flow above the hero, so centering
         * within (100dvh − 72px) pushes the optical centre ~36px below the true
         * viewport centre → looks low under the fading topbar. Bias content up via
         * a heavier bottom padding so it sits at the real viewport centre. */
        @media (min-width: 768px) {
          .vision-video-hero {
            padding-top: clamp(14px, 2vh, 26px);
            padding-bottom: clamp(84px, 11vh, 130px);
          }
        }
        .video-hero-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          letter-spacing: 0.03em;
          line-height: 1;
          margin: 0;
          text-transform: uppercase;
        }
        .video-embed-frame {
          position: relative;
          width: min(680px, 100%);
          aspect-ratio: 16 / 9;
          border-radius: 14px;
          overflow: hidden;
          background: #000;
          box-shadow:
            0 0 90px 12px rgba(201,154,63,0.40),
            0 0 180px 30px rgba(201,154,63,0.22),
            0 0 0 1px rgba(250,244,236,0.16) inset;
          transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.45s ease;
        }
        /* Po kliku na "Watch ..." → náhľad sa zväčší + spustí prehrávanie */
        .video-embed-frame.is-playing {
          width: min(980px, 100%);
          box-shadow:
            0 0 120px 16px rgba(201,154,63,0.48),
            0 0 220px 40px rgba(201,154,63,0.26),
            0 0 0 1px rgba(250,244,236,0.18) inset;
        }
        .video-embed-frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        /* Vlastný titulkový overlay — posadený NAD vpálený news-chyron videa
           (YT vlastné titulky sú vypnuté cez cc_load_policy=0). */
        .intro-caption {
          position: absolute;
          left: 50%;
          bottom: 19%;
          transform: translateX(-50%);
          width: min(92%, 600px);
          text-align: center;
          pointer-events: none;
          z-index: 3;
        }
        .intro-caption span {
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
          background: rgba(0, 0, 0, 0.62);
          color: #fff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-weight: 600;
          font-size: clamp(0.78rem, 1.9vw, 1.02rem);
          line-height: 1.5;
          letter-spacing: 0.004em;
          padding: 0.1em 0.4em;
          border-radius: 5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
        }
        /* Clean facade poster — no YouTube chrome until played */
        .video-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: #000;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }
        .video-poster img,
        .video-bg-loop {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* Dark overlay so the looping bg video doesn't glare */
        .video-poster::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1;
          pointer-events: none;
        }
        .video-play-btn {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(64px, 9vw, 84px);
          height: clamp(64px, 9vw, 84px);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(2px);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .video-play-btn svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 10px rgba(201, 154, 63, 0.55));
        }
        .video-poster:hover .video-play-btn {
          transform: scale(1.08);
          background: rgba(0, 0, 0, 0.45);
        }
        .video-poster:active .video-play-btn { transform: scale(0.97); }
        .video-hero-caption {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.64rem, 0.98vw, 0.82rem);
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(250,244,236,0.66);
          margin: 0;
          padding: 4px 2px;
          background: none;
          border: 0;
          cursor: pointer;
          display: inline-block;
          text-decoration: underline;
          text-decoration-color: rgba(201,154,63,0.70);
          text-decoration-thickness: 1px;
          text-underline-offset: 0.34em;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.2s ease, text-decoration-color 0.2s ease;
        }
        .video-hero-caption::before {
          content: '\\25B6';
          font-size: 0.7em;
          color: #C99A3F;
          margin-right: 9px;
          display: inline-block;
        }
        .video-hero-caption:hover {
          color: #F5C73D;
          text-decoration-color: #F5C73D;
        }
        .video-hero-caption:hover::before { color: #F5C73D; }

        /* Content area below the video — own viewport band on desktop */
        .vision-content-area { width: 100%; }
        @media (min-width: 768px) {
          .vision-content-area {
            min-height: 100dvh;
            padding-top: 40px;
            padding-bottom: 60px;
          }
        }

        /* ===== WHAT IF… pinned scrollytelling roadmap ===== */
        .wf-pin { position: relative; } /* tall: height = beats*100vh (inline) */

        /* Scroll-snap (desktop): the hand-off from the video hero (slide 1) to the
         * WHAT IF section (slide 2) snaps — you can't rest between them, the second
         * screen is pulled in and fixes. snap-stop:always forces a stop at wf-pin's
         * start (= pin engages). Inside the 600vh pin there are no further snap points,
         * so the beats scroll freely. Style only lives while /vision is mounted. */
        @media (min-width: 768px) {
          html { scroll-snap-type: y proximity; }
          /* NB: NO snap-align on the hero — it would snap the page down by the topbar
           * height on load and hide the menu. Only the WHAT IF section is a snap point. */
          .wf-pin { scroll-snap-align: start; scroll-snap-stop: always; }
        }
        .wf-sticky {
          position: sticky; top: 0; height: 100vh; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .wf-hint {
          position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
          font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 0.24em;
          text-transform: uppercase; color: rgba(250,244,236,0.32); z-index: 4;
        }
        .wf-grid {
          flex: 1; display: grid; grid-template-columns: 2.1fr 1fr;
          align-items: center; align-content: center; gap: clamp(18px, 3vw, 44px);
          max-width: 1480px; width: 100%; margin: 0 auto;
          /* top clears the sticky header, bottom clears the progress bar → the auto-height
           * row centres in the band between them instead of pinning to the top */
          padding: 84px clamp(20px, 5vw, 56px) 64px;
        }

        /* LEFT — papyrus scroll (rolled ends; colours from /religion .codex-paper) */
        .wf-scroll-col { display: flex; align-items: center; justify-content: center; }
        /* Big papyrus area — each beat is a self-contained baked papyrus+scene image
         * (square, on black) OR a fallback realistic-papyrus PNG + doodle. */
        .wf-papyrus {
          /* ╔═══ LOCKED 2026-06-03 (Matej OK: "toto je tá správna poloha") ═══╗
           * Poloha + rozmer papyrusu na PC pre VŠETKY beaty (zdieľaný kontajner).
           * NEMENIŤ bez výslovného OK:
           *   height: 68vh · width: calc(68vh * 815/892) · top: 25px · flex-shrink: 0
           *   (+ .wf-grid: align-content:center, padding 84px/64px)
           * Height-driven + EXPLICIT calc width (NIE aspect-ratio+auto — flexbox by
           * zrútil šírku). Papyrus PNG je orezaný natesno (815×892).
           * ╚════════════════════════════════════════════════════════════════╝ */
          position: relative; flex-shrink: 0; top: 25px;
          height: 68vh; width: calc(68vh * 815 / 892); max-width: 100%;
          margin: 0 auto;
        }
        .wf-illus {
          position: absolute; inset: 0; opacity: 0;
          transform: scale(0.97) translateY(8px);
          transition: opacity .5s ease, transform .5s ease;
        }
        /* Baked papyrus+scene image (or video) fills the whole area */
        .wf-scene-full { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
        /* Canvas beat: papyrus PNG + figure-on-white multiplied (see PapyrusStage).
         * Container aspect == papyrus aspect → canvas fills edge-to-edge, transparent
         * surround lets the dark page show around the rolled scroll (no box). */
        .wf-scene-canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
        /* Fallback: realistic papyrus frame + doodle inset to the writable sheet body */
        .wf-scroll-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1; }
        .wf-sheet-inner {
          position: absolute; z-index: 2;
          /* inset to the writable sheet of papyrus-scroll.webp (measured) + extra margin
           * so the figure sits in the middle, clear of the rolls and curled side edges */
          top: 22%; bottom: 24%; left: 29%; right: 29%;
          display: flex; align-items: center; justify-content: center;
        }
        .wf-fig { width: 100%; height: 100%; object-fit: contain; }
        .wf-illus.on { opacity: 1; transform: scale(1) translateY(0); }
        .wf-illus .wf-art { width: 100%; height: 100%; }
        .wf-illus .wf-art svg { width: 100%; height: 100%; }

        /* Ink self-draw: line-art strokes draw themselves when the beat activates.
         * Fixed dasharray (doodles are small) → each stroke reveals from 0; sub-strokes
         * stagger via nth-child so the drawing builds piece by piece. Re-runs each beat
         * because the .on class toggles on/off as wfState changes. */
        .wf-illus .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) {
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
        }
        .wf-illus.on .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) {
          animation: wfInkDraw 0.8s cubic-bezier(0.55, 0, 0.45, 1) forwards;
        }
        .wf-illus.on .wf-art svg > *:nth-child(1)  { animation-delay: 0.10s; }
        .wf-illus.on .wf-art svg > *:nth-child(2)  { animation-delay: 0.18s; }
        .wf-illus.on .wf-art svg > *:nth-child(3)  { animation-delay: 0.26s; }
        .wf-illus.on .wf-art svg > *:nth-child(4)  { animation-delay: 0.33s; }
        .wf-illus.on .wf-art svg > *:nth-child(5)  { animation-delay: 0.40s; }
        .wf-illus.on .wf-art svg > *:nth-child(6)  { animation-delay: 0.46s; }
        .wf-illus.on .wf-art svg > *:nth-child(7)  { animation-delay: 0.52s; }
        .wf-illus.on .wf-art svg > *:nth-child(8)  { animation-delay: 0.58s; }
        .wf-illus.on .wf-art svg > *:nth-child(9)  { animation-delay: 0.63s; }
        .wf-illus.on .wf-art svg > *:nth-child(n+10) { animation-delay: 0.68s; }
        @keyframes wfInkDraw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .wf-illus .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) {
            stroke-dashoffset: 0;
            animation: none;
          }
        }
        .wf-note {
          position: absolute; bottom: 8px; left: 0; right: 0; text-align: center; z-index: 3;
          font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(90,58,12,0.4);
        }

        /* RIGHT — dark text column */
        .wf-text { position: relative; min-height: 360px; }
        /* Desktop: pull the text column left toward the (locked) papyrus — kills the
         * dead space between the centred scroll and the copy. Papyrus is NOT moved. */
        @media (min-width: 768px) {
          .wf-text { margin-left: clamp(-220px, -9vw, -90px); }
        }
        .wf-block {
          position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center;
          opacity: 0; transition: opacity .4s ease;
          pointer-events: none;
        }
        .wf-block.on { opacity: 1; pointer-events: auto; }
        /* Gradual text reveal — each line rises in sequence when the beat activates.
         * Motion lives on the children (block fades only) so lines cascade one by one;
         * re-runs each beat via the .on toggle. */
        .wf-block.on > * { animation: wfRise .55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .wf-block.on > *:nth-child(1) { animation-delay: 0.08s; }
        .wf-block.on > *:nth-child(2) { animation-delay: 0.20s; }
        .wf-block.on > *:nth-child(3) { animation-delay: 0.32s; }
        .wf-block.on > *:nth-child(4) { animation-delay: 0.44s; }
        .wf-block.on > *:nth-child(5) { animation-delay: 0.56s; }
        @keyframes wfRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .wf-block.on > * { animation: none; }
        }

        /* ── SLIDE 1 → SLIDE 2 entrance (armed by JS .wf-armed when section enters pin range) ──
         * Papyrus unrolls top→bottom, the first beat's ink + text reveal as the entry
         * (held until armed so they don't play off-screen at mount), WHAT IF title blurs in. */
        .wf-sticky:not(.wf-armed) .wf-papyrus { clip-path: inset(0 0 100% 0); opacity: 0; }
        .wf-sticky.wf-armed .wf-papyrus { animation: wfUnroll 1s cubic-bezier(0.72, 0, 0.24, 1) both; }
        @keyframes wfUnroll {
          0%   { clip-path: inset(0 0 100% 0); opacity: 0; transform: translateY(-16px); }
          30%  { opacity: 1; }
          100% { clip-path: inset(0 0 0 0);    opacity: 1; transform: translateY(0); }
        }
        .wf-sticky:not(.wf-armed) .wf-illus.on .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) { animation: none; }
        .wf-sticky:not(.wf-armed) .wf-block.on > * { animation: none; opacity: 0; }
        .wf-sticky.wf-armed .wf-intro.on .wf-big {
          animation: wfTitleReveal 1.1s cubic-bezier(0.2, 1, 0.3, 1) 0.12s both;
        }
        @keyframes wfTitleReveal {
          from { opacity: 0; transform: translateY(26px) scale(0.93);
                 filter: drop-shadow(0 0 18px rgba(245,199,61,0.34)) blur(9px); letter-spacing: 0.24em; }
          to   { opacity: 1; transform: none;
                 filter: drop-shadow(0 0 18px rgba(245,199,61,0.34)) blur(0); letter-spacing: 0.04em; }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-sticky.wf-armed .wf-papyrus,
          .wf-sticky.wf-armed .wf-intro.on .wf-big { animation: none; }
          .wf-sticky:not(.wf-armed) .wf-papyrus { clip-path: none; opacity: 1; }
          .wf-sticky:not(.wf-armed) .wf-block.on > * { opacity: 1; }
        }
        /* Unified headline + lead typography for ALL beats (taken from slide 1) */
        .wf-block .wf-big {
          font-family: 'Cinzel', serif; font-weight: 700;
          /* smaller than before so long SK words (STREDISKÁ, DIGITÁLNY…) don't overflow;
             line-height 1.08 leaves headroom so uppercase carons (Č/Š/É) aren't clipped
             by the background-clip:text line box */
          font-size: clamp(2.6rem, 6.2vw, 4.8rem); line-height: 1.08; letter-spacing: 0.04em;
          white-space: nowrap; /* 2-line white/gold headline, no wrap → max 2 lines */
        }
        .wf-big-w { color: #FAF4EC; }
        .wf-big-g {
          background: linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 0 18px rgba(245,199,61,0.34));
        }
        .wf-block .wf-lead {
          margin-top: 24px; font-style: normal; color: rgba(250,244,236,0.72);
          font-size: clamp(1.05rem, 2.4vw, 1.35rem); line-height: 1.55; max-width: 34ch;
        }
        /* highlighted key words in the story */
        .wf-lead .wf-hl {
          font-style: italic; font-weight: 600; color: #F5C73D;
        }
        .wf-block .wf-num { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.3em; color: rgba(250,244,236,0.5); margin-bottom: 10px; }
        .wf-block .wf-anchor { font-family: 'Cinzel', serif; font-weight: 700; color: #C99A3F; font-size: clamp(1.8rem, 4.6vw, 3rem); line-height: 1; margin-bottom: 14px; letter-spacing: 0.05em; }
        .wf-block h3 { font-family: 'Cinzel', serif; font-weight: 600; font-size: clamp(1.15rem, 2.6vw, 1.7rem); line-height: 1.25; color: #FAF4EC; margin-bottom: 14px; max-width: 24ch; text-wrap: balance; }
        .wf-block p { font-size: clamp(0.95rem, 2vw, 1.1rem); line-height: 1.6; color: rgba(250,244,236,0.74); max-width: 40ch; margin-bottom: 20px; text-wrap: balance; }
        .wf-mech { display: flex; align-items: center; gap: 11px; padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(201,154,63,0.4); background: rgba(201,154,63,0.10); max-width: 40ch; }
        .wf-mech-ic { flex: 0 0 26px; width: 26px; height: 26px; }
        .wf-mech-ic svg { width: 100%; height: 100%; stroke: #C99A3F; fill: none; stroke-width: 1.6; }
        .wf-mech-txt { font-family: 'Cinzel', serif; font-size: clamp(.8rem, 1.7vw, .95rem); letter-spacing: 0.04em; color: #FAF4EC; font-weight: 600; }

        /* BOTTOM — progress indicator */
        .wf-progress { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 clamp(20px, 5vw, 60px) 26px; max-width: 1240px; margin: 0 auto; z-index: 4; }
        .wf-track { position: relative; height: 3px; background: rgba(250,244,236,0.14); border-radius: 3px; }
        .wf-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: 3px; background: linear-gradient(90deg, rgba(230,158,26,0) 0%, #E69E1A 55%, #F5C73D 100%); }
        /* Comet head — glowing tip at the leading edge of the progress fill. The bar
         * gradient (transparent → gold) reads as the trailing tail. */
        .wf-fill::after {
          content: '';
          position: absolute;
          right: -3px;
          top: 50%;
          transform: translateY(-50%);
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: radial-gradient(circle, #FFF6DC 0%, #F5C73D 55%, rgba(245,199,61,0) 100%);
          box-shadow:
            0 0 7px 2px rgba(245,199,61,0.95),
            0 0 16px 5px rgba(245,199,61,0.65),
            0 0 30px 9px rgba(230,158,26,0.40);
          animation: wfCometPulse 1.6s ease-in-out infinite;
        }
        @keyframes wfCometPulse {
          0%, 100% { transform: translateY(-50%) scale(1); box-shadow: 0 0 7px 2px rgba(245,199,61,0.95), 0 0 16px 5px rgba(245,199,61,0.65), 0 0 30px 9px rgba(230,158,26,0.40); }
          50% { transform: translateY(-50%) scale(1.18); box-shadow: 0 0 10px 3px rgba(245,199,61,1), 0 0 22px 7px rgba(245,199,61,0.75), 0 0 40px 13px rgba(230,158,26,0.50); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-fill::after { animation: none; }
        }
        .wf-steps { display: flex; justify-content: space-between; margin-top: 14px; }
        .wf-step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(250,244,236,0.32); transition: color .3s; }
        .wf-step .wf-knob { display: none; } /* dots removed — comet head carries the progress now */
        .wf-step.done { color: rgba(250,244,236,0.6); }
        .wf-step.active { color: #F5C73D; }

        @media (max-width: 767px) {
          /* DETERMINISTIC top offset (NOT centered): centering pushed the block above
           * the sticky top-bar on short phones (gap went negative). Fixed padding-top =
           * top-bar (~89px) + comfortable gap → papyrus always sits clear of the logo,
           * identical on every viewport height. */
          .wf-grid { grid-template-columns: 1fr; gap: 16px; padding: 120px 20px 40px; align-content: start; }
          .wf-scroll-col { order: -1; }
          .wf-papyrus { height: 54.14vh; width: calc(54.14vh * 815 / 892); max-width: 86%; } /* +10% +15% +7% */
          .wf-text { min-height: 250px; margin-top: 155px; } /* push headline+body below papyrus */
          /* Mobile typography: JOIN white+gold on ONE line (hide <br>, nbsp between) but allow
           * NATURAL wrap (white-space: normal) → short headings stay 1 line, long ones (FUNKČNÉ
           * STREDISKÁ) wrap to 2 at the space. Bigger font than desktop-scaled so it reads well.
           * line-height 1.08 = headroom for uppercase carons (Č/Š/É). */
          .wf-block .wf-big { font-size: clamp(2.1rem, 10vw, 2.9rem); line-height: 1.08; white-space: normal; }
          .wf-block .wf-big br { display: none; }
          .wf-block .wf-big-w::after { content: ' '; } /* breakable space → long heading wraps here */
          .wf-block .wf-lead { font-size: 0.95rem; margin-top: 18px; }
          .wf-steps { display: none; } /* mobile: labels were hidden + dots removed → empty row, drop it (comet bar carries progress) */
          .wf-progress { bottom: 30px; } /* lift the comet status bar up */
        }
        /* Short phones (SE-class): shrink papyrus + lift the top offset so the longest
         * beat's body never spills past the progress bar. */
        @media (max-width: 767px) and (max-height: 740px) {
          .wf-grid { padding-top: 96px; }
          .wf-papyrus { height: 37.45vh; width: calc(37.45vh * 815 / 892); } /* +10% +7% */
          .wf-text { margin-top: 20px; } /* short phones: keep the longest beat clear of the progress bar */
        }
      `}</style>

      <div className="topbar-wrap">
        <PageTopBar withNav />
      </div>

      {/* ── Intro video hero ── */}
      <section className="vision-video-hero" style={{ zIndex: 2 }}>
        <h1 className="video-hero-title">
          <span
            style={{
              background:
                'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter:
                'drop-shadow(0 0 22px rgba(245,199,61,0.42)) drop-shadow(0 0 7px rgba(230,158,26,0.5))',
            }}
          >
            {t('vision.hero.title')}
          </span>
        </h1>
        {!videoPlaying && (
          <button
            type="button"
            className="video-hero-caption"
            onClick={() => setVideoPlaying(true)}
          >
            {t('vision.hero.watch')}
          </button>
        )}
        <div className={`video-embed-frame${videoPlaying ? ' is-playing' : ''}`}>
          {videoPlaying ? (
            <>
              <iframe
                id="yt-intro-frame"
                src={`https://www.youtube-nocookie.com/embed/TwSl_aOwbaY?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white&cc_load_policy=0&enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                title={t('vision.hero.videoTitle')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              {captionText && (
                <div className="intro-caption" aria-hidden>
                  <span>{captionText}</span>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              className="video-poster"
              onClick={() => setVideoPlaying(true)}
              aria-label={t('vision.hero.playLabel')}
            >
              <video
                className="video-bg-loop"
                src="/videos/vision-intro-montage.mp4"
                poster="/images/mission/intro-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              />
              <span className="video-play-btn" aria-hidden>
                <svg viewBox="0 0 72 72" width="72" height="72">
                  <circle cx="36" cy="36" r="34" fill="none" stroke="#C99A3F" strokeWidth="2.5" />
                  <path d="M29 25 L51 36 L29 47 Z" fill="none" stroke="#C99A3F" strokeWidth="2.5" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ── WHAT IF… pinned scrollytelling roadmap ── */}
      <section
        className="wf-pin"
        ref={wfPinRef}
        style={{ height: `${WF_BEATS.length * 100}vh`, zIndex: 2 }}
      >
        <div className={`wf-sticky${wfEntered ? ' wf-armed' : ''}`}>
          <div className="wf-grid">
            {/* LEFT: papyrus scroll — ONE persistent canvas (papyrus fixed, only the
                figure video swaps per beat; see PapyrusStage). */}
            <div className="wf-scroll-col">
              <div className="wf-papyrus">
                <PapyrusStage
                  papyrus="/images/vision/papyrus-vision.webp"
                  sheet={{ x: 0.10, y: 0.15, w: 0.80, h: 0.71 }}
                  videos={WF_VIDEOS}
                  active={wfState}
                />
              </div>
            </div>

            {/* RIGHT: dark text column */}
            <div className="wf-text">
              {WF_BEATS.map((b, i) => (
                <div
                  key={b.id}
                  className={`wf-block${b.intro ? ' wf-intro' : ''}${wfState === i ? ' on' : ''}`}
                  aria-hidden={wfState !== i}
                >
                  <div className="wf-big">
                    <span className="wf-big-w">{t(`vision.beat.${b.id}.bigW`)}</span>
                    <br />
                    <span className="wf-big-g">{t(`vision.beat.${b.id}.bigG`)}</span>
                  </div>
                  {b.intro ? (
                    <div
                      className="wf-lead"
                      dangerouslySetInnerHTML={{ __html: t('vision.intro.lead') }}
                    />
                  ) : (
                    <div
                      className="wf-lead"
                      dangerouslySetInnerHTML={{ __html: t(`vision.beat.${b.id}.h`) }}
                    />
                  )}
                  {b.mech && (
                    <div className="wf-mech">
                      <span
                        className="wf-mech-ic"
                        dangerouslySetInnerHTML={{ __html: WF_ICONS[b.icon ?? 'ankh'] }}
                      />
                      <span className="wf-mech-txt">→ {b.mech}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* bottom progress indicator (zľava → doprava) */}
          <div className="wf-progress">
            <div className="wf-track">
              <div className="wf-fill" style={{ width: `${(wfProgress * 100).toFixed(1)}%` }} />
            </div>
            <div className="wf-steps">
              {WF_BEATS.map((b, i) => (
                <div
                  key={b.id}
                  className={`wf-step${wfState === i ? ' active' : ''}${i < wfState ? ' done' : ''}`}
                >
                  <span className="wf-knob" />
                  <span className="wf-step-label">{t(`vision.beat.${b.id}.tag`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — WHAT IF (bookends the WHAT IF papyrus story above) */}
      <section
        ref={finaleRef}
        className="vision-finale flex flex-col items-center justify-center text-center px-6"
        style={{ zIndex: 2, minHeight: 'calc(100dvh - 72px)', gap: 'clamp(20px, 4vh, 38px)' }}
      >
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: 'clamp(2.6rem, 8vw, 6rem)',
            letterSpacing: '0.04em',
            lineHeight: 1.12,
            paddingTop: '0.06em',
            margin: 0,
            textTransform: 'uppercase',
            background:
              'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter:
              'drop-shadow(0 0 26px rgba(245,199,61,0.40)) drop-shadow(0 0 8px rgba(230,158,26,0.5))',
          }}
        >
          {t('vision.finale.title')}
        </h2>
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 500,
            fontSize: 'clamp(1.2rem, 3vw, 2.1rem)',
            lineHeight: 1.4,
            color: 'rgba(250,244,236,0.92)',
            maxWidth: '22ch',
            margin: 0,
          }}
          dangerouslySetInnerHTML={{ __html: t('vision.finale.lead') }}
        />
        {/* button + tagline as one group so the tagline sits a tight 7px under the
            button (the section's larger flex gap stays above the button) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
          <button
            onClick={() => navigate('/heroglyph')}
            className="mission-cta"
            style={{ alignSelf: 'center', margin: 0 }}
          >
            {t('vision.finale.cta')}
          </button>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.9vw, 1.2rem)',
              fontStyle: 'italic',
              color: 'rgba(250,244,236,0.62)',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            {t('vision.finale.tagline')}
          </p>
        </div>
      </section>

    </div>
  );
}
