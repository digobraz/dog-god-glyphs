// KÔŠ 3 — ROBÍM ÚLOHU: obal obrazoviek SOS bez spodnej lišty. Zvlášť od `sosShared`, aby verejná `/lost/:slug`
// nemusela ťahať `PackTopRow` a `PackLayout`.
import { useEffect, type ReactNode } from 'react';
import { PackTopRow } from '@/components/pack/PackTopRow';
import { MessagingOverlayHost } from '@/components/pack/PackLayout';
import { SosStyles } from './sosShared';
import { prefetchSosOffline } from './sosPrefetch';

/**
 * KÔŠ 3 — ROBÍM ÚLOHU: bez spodnej lišty, hore AINUBIS + šípka späť, vpravo NIČ (žiadne správy, upozornenia, SOS).
 * Stavba ako SNIFFER (`PackBuddy.tsx` Shell): stránka nemountuje `PackLayout`.
 */
/** Obrázok, ktorý sa nenačítal (bez signálu), sa skryje: ostane text kroku, žiadna rozbitá ikona. `error` nebubliňuje, preto capture. */
const hideBrokenImg = (e: { target: EventTarget }) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement)) return;
  // Obrázok s popiskom (`.aid-media`, `figure`) sa zbalí celý, aby krok plynulo pokračoval textom; holá ikonka len zmizne.
  const box = img.closest<HTMLElement>('.aid-media, figure');
  if (!box) { img.style.visibility = 'hidden'; return; }
  box.style.display = 'none';
  const wrap = box.parentElement;
  if (wrap?.classList.contains('aid-fotky') && [...wrap.children].every((c) => (c as HTMLElement).style.display === 'none')) wrap.style.display = 'none';
};

export function SosTaskShell({ onBack, backLabel, wide, children }: { onBack: () => void; backLabel: string; wide?: boolean; children: ReactNode }) {
  // Kto otvoril SOS obrazovku priamo (odkaz, push), nemal šancu cez `SosButton`: aj odtiaľ sa v pokoji stiahne prvá pomoc a pohotovosť na offline.
  useEffect(() => { prefetchSosOffline(); }, []);
  return (
    <div className="pk-paper pk-plain sos-root">
      <SosStyles />
      <main className={`sos-col${wide ? ' sos-col--wide' : ''}`} onErrorCapture={hideBrokenImg}>
        <PackTopRow onBack={onBack} backLabel={backLabel} task />
        {children}
      </main>
      <MessagingOverlayHost />
    </div>
  );
}
