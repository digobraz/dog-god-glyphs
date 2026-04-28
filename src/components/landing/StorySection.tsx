export function StorySection() {
  const videoId = 'WDZQP7LuOBc';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0&iv_load_policy=3`;

  return (
    <section
      id="story"
      className="h-screen w-full bg-black flex flex-col items-center justify-center px-6 md:px-10 relative overflow-hidden"
    >
      {/* Caption above video */}
      <div className="flex flex-col items-center text-center mb-8 md:mb-10">
        <span
          className="text-xs md:text-sm tracking-[0.3em] uppercase mb-3"
          style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
        >
          29 PEOPLE SAY: IN DOG WE TRUST
        </span>
        <h2
          className="text-2xl md:text-4xl font-black tracking-wider"
          style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
        >
          BE NEXT!
        </h2>
      </div>

      {/* Video container */}
      <div
        className="w-full max-w-[1100px] aspect-video rounded-2xl overflow-hidden relative"
        style={{
          boxShadow:
            '0 0 80px rgba(196,155,66,0.18), 0 0 200px rgba(196,155,66,0.08), 0 20px 60px rgba(0,0,0,0.6)',
          border: '1px solid rgba(196,155,66,0.15)',
        }}
      >
        <iframe
          src={embedUrl}
          title="DOGYPT story"
          className="absolute inset-0 w-full h-full"
          frameBorder={0}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}