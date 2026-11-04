// KÔŠ 3 — ROBÍM ÚLOHU: obal obrazoviek SOS bez spodnej lišty. Zvlášť od `sosShared`, aby verejná `/lost/:slug`
// nemusela ťahať `PackTopRow` a `PackLayout`.
import type { ReactNode } from 'react';
import { PackTopRow } from '@/components/pack/PackTopRow';
import { MessagingOverlayHost } from '@/components/pack/PackLayout';
import { SosStyles } from './sosShared';

/**
 * KÔŠ 3 — ROBÍM ÚLOHU: bez spodnej lišty, hore AINUBIS + šípka späť, vpravo NIČ (žiadne správy, upozornenia, SOS).
 * Stavba ako SNIFFER (`PackBuddy.tsx` Shell): stránka nemountuje `PackLayout`.
 */
export function SosTaskShell({ onBack, backLabel, children }: { onBack: () => void; backLabel: string; children: ReactNode }) {
  return (
    <div className="pk-paper pk-plain sos-root">
      <SosStyles />
      <main className="sos-col">
        <PackTopRow onBack={onBack} backLabel={backLabel} task />
        {children}
      </main>
      <MessagingOverlayHost />
    </div>
  );
}
