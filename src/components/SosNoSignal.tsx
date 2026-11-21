import { useEffect, useState } from 'react';
// SOS → „SI BEZ SIGNÁLU“ (21. 11. 2026; mimo components/pack ako ErrorBoundary: poistka s vlastnými hodnotami). Zobrazí ju `ErrorBoundary`, keď na SOS ceste zlyhá stiahnutie časti obrazovky (lazy chunk)
// a človek je offline: namiesto bielej stránky alebo chyby prehliadača 112 a to, čo ostalo dostupné (prvá pomoc, pohotovosť
// sa sťahujú vopred, `sosPrefetch.ts`). 🔴 Poistka: nesmie ťahať moduly, ktoré mohli spadnúť — žiadny slovník, žiadny `packTheme`;
// texty v troch jazykoch sú tu, hodnoty opísané z `PACK_THEME` a `LAPIS` (ako `ErrorBoundary`).
type Tx = { title: string; text: string; call: string; aid: string; vet: string; retry: string; upTitle: string; upText: string; reload: string };
const TEXT: Record<string, Tx> = {
  sk: { title: 'Si bez signálu', text: 'Táto časť potrebuje internet. Prvá pomoc a pohotovosť fungujú aj bez signálu, ak sa stihli stiahnuť vopred.', call: 'ZAVOLAŤ 112', aid: 'Prvá pomoc', vet: 'Veterinárna pohotovosť', retry: 'SKÚSIŤ ZNOVA', upTitle: 'Appka sa aktualizovala', upText: 'Táto časť sa nenačítala, lebo je dostupná nová verzia appky. Načítaj ju znova.', reload: 'NAČÍTAŤ ZNOVA' },
  cs: { title: 'Jsi bez signálu', text: 'Tato část potřebuje internet. První pomoc a pohotovost fungují i bez signálu, pokud se stihly stáhnout předem.', call: 'ZAVOLAT 112', aid: 'První pomoc', vet: 'Veterinární pohotovost', retry: 'ZKUSIT ZNOVU', upTitle: 'Appka se aktualizovala', upText: 'Tato část se nenačetla, protože je dostupná nová verze appky. Načti ji znovu.', reload: 'NAČÍST ZNOVU' },
  en: { title: 'You are offline', text: 'This part needs the internet. First aid and the emergency vet work without signal if they were preloaded.', call: 'CALL 112', aid: 'First aid', vet: 'Emergency vet', retry: 'TRY AGAIN', upTitle: 'The app was updated', upText: 'This part did not load because a new version of the app is available. Reload it.', reload: 'RELOAD' },
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

type Mode = 'check' | 'offline' | 'update';

/** Bez siete: `navigator.onLine === false` alebo zlyhá aj malá kontrolná požiadavka. So sieťou lazy časť naozaj chýba (stará záložka po nasadení). */
async function probe(): Promise<'offline' | 'update'> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  try {
    const ctl = new AbortController();
    const to = window.setTimeout(() => ctl.abort(), 4000);
    const r = await fetch(`/app-version.json?t=${Date.now()}`, { cache: 'no-store', signal: ctl.signal });
    window.clearTimeout(to);
    return r.ok || r.status === 404 ? 'update' : 'offline';
  } catch { return 'offline'; }
}

export function SosNoSignal({ onGo }: { onGo: (path: string) => void }) {
  const t = pick();
  const [mode, setMode] = useState<Mode>('check');
  useEffect(() => {
    let alive = true;
    void probe().then((m) => { if (alive) setMode(m); });
    // Po návrate siete sa obrazovka zotaví sama: overí sa spojenie a stránka sa načíta znova (zlyhaný lazy import sa inak nezopakuje).
    const back = () => { void probe().then((m) => { if (alive && m === 'update') window.location.reload(); }); };
    window.addEventListener('online', back);
    return () => { alive = false; window.removeEventListener('online', back); };
  }, []);
  const update = mode === 'update';
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
          {update ? t.upTitle : t.title}
        </h1>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#2a1608', fontSize: '14px', lineHeight: 1.45, margin: 0 }}>{update ? t.upText : t.text}</p>
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
          {update ? t.reload : t.retry}
        </button>
      </div>
    </div>
  );
}
