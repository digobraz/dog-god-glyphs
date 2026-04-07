import { useEffect, useState } from 'react';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

export function Header() {
  const [isLight, setIsLight] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const lightSections = ['vision', 'about'];
    const allSections = ['hero', 'story', 'vision', 'about'];

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        let maxRatio = 0;
        let topSection = '';
        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            topSection = entry.target.id;
          }
        });
        if (topSection) {
          setIsLight(lightSections.includes(topSection));
          if (topSection !== 'hero') {
            setActiveSection(topSection);
          } else {
            setActiveSection('');
          }
        }
      },
      { threshold: [0, 0.1, 0.3, 0.5, 0.7], rootMargin: '-40% 0px -40% 0px' }
    );

    // Observe after a tick so DOM is ready
    const timer = setTimeout(() => {
      allSections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const textColor = isLight ? '#000000' : '#C49B42';
  const dividerColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(196,155,66,0.4)';
  const bgStyle = isLight
    ? { background: 'linear-gradient(to bottom, #F3EBDD 70%, transparent 100%)' }
    : { background: 'linear-gradient(to bottom, #000000 70%, transparent 100%)' };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex flex-col items-center pt-6 pb-12 transition-all duration-500 ${bgClass}`}
    >
      <img
        src={dogyptLogo}
        alt="DOGYPT"
        className="h-12 md:h-16 object-contain transition-all duration-500"
        style={{ filter: isLight ? 'brightness(0)' : 'none' }}
      />
      <nav className="flex items-center gap-0 mt-4">
        {['STORY', 'VISION', 'ABOUT'].map((item, i) => {
          const isActive = activeSection === item.toLowerCase();
          return (
            <div key={item} className="flex items-center">
              {i > 0 && (
                <span
                  className="mx-4 md:mx-6 h-4 w-px transition-colors duration-500"
                  style={{ backgroundColor: dividerColor }}
                />
              )}
              <a
                href={`#${item.toLowerCase()}`}
                className="text-xs md:text-sm tracking-[0.25em] uppercase transition-all duration-500 relative"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: textColor,
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {item}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-0 w-full h-px transition-colors duration-500"
                    style={{ backgroundColor: textColor }}
                  />
                )}
              </a>
            </div>
          );
        })}
      </nav>
    </header>
  );
}
