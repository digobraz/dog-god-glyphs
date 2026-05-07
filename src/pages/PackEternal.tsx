import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PackLayout } from '@/components/pack/PackLayout';

const LAUNCH_AT = new Date('2026-06-06T00:00:00Z').getTime();

function formatCountdown(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export default function PackEternal() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = LAUNCH_AT - now;
  const c = formatCountdown(remaining);
  const isLive = remaining <= 0;

  return (
    <PackLayout title="Eternal Dog" subtitle="The Pack · Coming">
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
            <Sparkles className="h-7 w-7 text-[#A07423]" />
          </div>

          <p className="font-cinzel text-[10px] uppercase tracking-[0.42em] text-[#A07423]">
            ✦ Eternal Dog
          </p>
          <h1 className="mt-3 font-cinzel text-2xl font-semibold uppercase tracking-[0.18em] text-[#0E0E0E] [text-wrap:balance]">
            {isLive ? 'Your protocol is here.' : 'Coming on the Day of HEKTHOR.'}
          </h1>

          <p className="mx-auto mt-5 max-w-md font-spaceGrotesk text-sm leading-relaxed text-[#1a1a1a] [text-wrap:pretty]">
            {isLive
              ? 'Your dog\'s eternal protocol has been forged. Open it from the menu — longevity, ritual, and lifelong belonging.'
              : 'A blueprint for your dog\'s longevity, ritual, and lifelong belonging. Built around the lineage your Heroglyph already carries.'}
          </p>

          {!isLive && (
            <div className="mt-8 flex justify-center gap-3 sm:gap-5">
              {[
                { label: 'Days', value: c.days },
                { label: 'Hours', value: c.hours },
                { label: 'Min', value: c.minutes },
                { label: 'Sec', value: c.seconds },
              ].map((unit) => (
                <div
                  key={unit.label}
                  className="flex w-16 flex-col items-center rounded-md border border-[#C99A3F]/30 bg-[#1a1510]/5 px-2 py-3 sm:w-20"
                >
                  <span className="font-cinzelDecorative text-2xl font-bold text-[#0E0E0E] tabular-nums sm:text-3xl">
                    {unit.value.toString().padStart(2, '0')}
                  </span>
                  <span className="mt-1 font-spaceGrotesk text-[9px] uppercase tracking-[0.32em] text-[#A07423]">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-10 font-cinzel text-[10px] uppercase tracking-[0.42em] text-[#A07423]">
            2026 · 06 · 06
          </p>
        </div>

        <p className="mt-6 text-center font-spaceGrotesk text-xs text-[#C9B380]/70 [text-wrap:pretty]">
          We'll email you when it opens. No marketing. Just the protocol.
        </p>
      </div>
    </PackLayout>
  );
}
