import { PawPrint } from 'lucide-react';
import { PackLayout } from '@/components/pack/PackLayout';

// Placeholder — obsah „Gods" sa dolaďuje v ďalšom kroku.
// Zámer (TBD s Matejom): zobrazenie tvojich psov ako bohov / pantheon.
export default function PackGods() {
  return (
    <PackLayout title="Gods" subtitle="The Pack · Pantheon">
      <div className="mx-auto max-w-xl">
        <div
          className="relative rounded-lg border border-[#C99A3F]/40 px-8 py-12 text-center"
          style={{
            background:
              'linear-gradient(170deg,#f6edd8 0%,#f0e3c4 25%,#ecdbb8 55%,#f2e4c8 80%,#f6edd8 100%)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#C99A3F]/40 bg-[#C99A3F]/10">
            <PawPrint className="h-7 w-7 text-[#A07423]" />
          </div>

          <p className="font-cinzel text-[10px] uppercase tracking-[0.42em] text-[#A07423]">
            ✦ Gods
          </p>
          <h1 className="mt-3 font-cinzel text-2xl font-semibold uppercase tracking-[0.18em] text-[#0E0E0E] [text-wrap:balance]">
            Your pantheon is being forged.
          </h1>

          <p className="mx-auto mt-5 max-w-md font-spaceGrotesk text-sm leading-relaxed text-[#1a1a1a] [text-wrap:pretty]">
            Every dog you bring into DOGYPT takes its place here — a wall of
            gods, each with its Heroglyph, lineage, and sacred record.
          </p>

          <p className="mt-10 font-cinzel text-[10px] uppercase tracking-[0.42em] text-[#A07423]">
            Coming soon
          </p>
        </div>
      </div>
    </PackLayout>
  );
}
