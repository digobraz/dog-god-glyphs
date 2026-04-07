import dogyptLogo from '@/assets/dogypt-logo-gold.png';

export function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-50 flex flex-col items-center pt-6 bg-gradient-to-b from-black/80 to-transparent pb-12">
      <img src={dogyptLogo} alt="DOGYPT" className="h-12 md:h-16 object-contain" />
      <nav className="flex items-center gap-0 mt-4">
        {['STORY', 'VISION', 'ABOUT'].map((item, i) => (
          <div key={item} className="flex items-center">
            {i > 0 && (
              <span
                className="mx-4 md:mx-6 h-4 w-px"
                style={{ backgroundColor: 'rgba(196,155,66,0.4)' }}
              />
            )}
            <a
              href={`#${item.toLowerCase()}`}
              className="text-xs md:text-sm tracking-[0.25em] uppercase transition-colors hover:opacity-70"
              style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
            >
              {item}
            </a>
          </div>
        ))}
      </nav>
    </header>
  );
}
