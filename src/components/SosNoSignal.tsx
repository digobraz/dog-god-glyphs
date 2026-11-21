// SOS → „SI BEZ SIGNÁLU“ (21. 11. 2026; mimo components/pack ako ErrorBoundary: poistka s vlastnými hodnotami). Zobrazí ju `ErrorBoundary`, keď na SOS ceste zlyhá stiahnutie časti obrazovky (lazy chunk)
// a človek je offline: namiesto bielej stránky alebo chyby prehliadača 112 a to, čo ostalo dostupné (prvá pomoc, pohotovosť
// sa sťahujú vopred, `sosPrefetch.ts`). 🔴 Poistka: nesmie ťahať moduly, ktoré mohli spadnúť — žiadny slovník, žiadny `packTheme`;
// texty v troch jazykoch sú tu, hodnoty opísané z `PACK_THEME` a `LAPIS` (ako `ErrorBoundary`).
type Tx = { title: string; text: string; call: string; aid: string; vet: string; retry: string };
const TEXT: Record<string, Tx> = {
  sk: { title: 'Si bez signálu', text: 'Táto časť potrebuje internet. Prvá pomoc a pohotovosť fungujú aj bez signálu, ak sa stihli stiahnuť vopred.', call: 'ZAVOLAŤ 112', aid: 'Prvá pomoc', vet: 'Veterinárna pohotovosť', retry: 'SKÚSIŤ ZNOVA' },
  cs: { title: 'Jsi bez signálu', text: 'Tato část potřebuje internet. První pomoc a pohotovost fungují i bez signálu, pokud se stihly stáhnout předem.', call: 'ZAVOLAT 112', aid: 'První pomoc', vet: 'Veterinární pohotovost', retry: 'ZKUSIT ZNOVU' },
  en: { title: 'You are offline', text: 'This part needs the internet. First aid and the emergency vet work without signal if they were preloaded.', call: 'CALL 112', aid: 'First aid', vet: 'Emergency vet', retry: 'TRY AGAIN' },
};

function pick(): Tx {
  let l = '';
  try { l = localStorage.getItem('dogypt_lang') || ''; } catch { /* bez úložiska ide jazyk prehliadača */ }
  if (!l && typeof document !== 'undefined') l = document.documentElement.lang || '';
  if (!l && typeof navigator !== 'undefined') l = navigator.language || '';
  return TEXT[l.slice(0, 2).toLowerCase()] ?? TEXT.en;
}

const BTN = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: '56px', boxSizing: 'border-box',
  borderRadius: '8px', padding: '0 24px', fontSize: '16px', letterSpacing: '.14em', textDecoration: 'none', cursor: 'pointer', textAlign: 'center',
} as const;

export function SosNoSignal({ onGo }: { onGo: (path: string) => void }) {
  const t = pick();
  const go = (path: string) => (e: { preventDefault: () => void }) => { e.preventDefault(); onGo(path); };
  return (
    <div
      role="alert"
      style={{
        position: 'fixed', inset: 0, background: 'linear-gradient(180deg, #F2E5C7, #E5D5B3)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '16px', textAlign: 'center', zIndex: 9999, overflowY: 'auto',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#2a1608', fontSize: '24px', margin: 0, letterSpacing: '.14em', textTransform: 'uppercase' }}>{/* písmo: nadpis */}
          {t.title}
        </h1>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#2a1608', fontSize: '14px', lineHeight: 1.45, margin: 0 }}>{t.text}</p>
        <a href="tel:112" style={{ ...BTN, fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#FFFFFF', background: 'linear-gradient(180deg, #C8202F, #9E1522)', border: '1px solid #9E1522' }}>{/* písmo: cta */}
          {t.call}
        </a>
        <a href="/pack/sos/prva-pomoc" onClick={go('/pack/sos/prva-pomoc')} style={{ ...BTN, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: 0, fontSize: '16px', color: '#2a1608', background: 'transparent', border: '1px solid rgba(42,22,8,.35)' }}>
          {t.aid}
        </a>
        <a href="/pack/sos/pohotovost" onClick={go('/pack/sos/pohotovost')} style={{ ...BTN, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: 0, fontSize: '16px', color: '#2a1608', background: 'transparent', border: '1px solid rgba(42,22,8,.35)' }}>
          {t.vet}
        </a>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ ...BTN, fontFamily: "'Cinzel', serif", fontWeight: 700, color: '#EFD79A', background: 'linear-gradient(180deg,#16307A,#0A1A4A)', border: '1px solid #0A1A4A' }}
        >{/* písmo: cta */}
          {t.retry}
        </button>
      </div>
    </div>
  );
}
