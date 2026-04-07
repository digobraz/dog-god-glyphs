import dogyptLogo from '@/assets/dogypt-logo-gold.png';

export function Header() {
  return (
    <header className="w-full bg-black py-6 md:py-8">
      <div className="flex flex-col items-center gap-4">
        <img src={dogyptLogo} alt="DOGYPT" className="h-12 md:h-16 object-contain" />
        <nav className="flex gap-8">
          {['STORY', 'VISION', 'ABOUT'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs md:text-sm tracking-[0.25em] uppercase transition-colors hover:text-primary"
              style={{ fontFamily: "'Cinzel', serif", color: 'hsl(39 55% 51%)' }}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
