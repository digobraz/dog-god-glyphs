import { useEffect, useState } from 'react';
import { Mail, Globe2, BellOff, ShieldOff } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';

export default function PackProfile() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const email = session?.user?.email ?? '—';
  const userId = session?.user?.id ?? '—';

  return (
    <PackLayout title="Profile" subtitle="The Pack · Account">
      <div className="mx-auto max-w-xl">
        <div
          className="rounded-lg border border-[#C99A3F]/40 px-6 py-8 sm:px-8"
          style={{
            background:
              'linear-gradient(170deg,#f6edd8 0%,#f0e3c4 25%,#ecdbb8 55%,#f2e4c8 80%,#f6edd8 100%)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}
        >
          <Field icon={<Mail className="h-4 w-4" />} label="Email">
            <span className="font-spaceGrotesk text-sm text-[#0E0E0E]">{email}</span>
          </Field>

          <Field icon={<Globe2 className="h-4 w-4" />} label="Language">
            <div className="flex items-center gap-2">
              <span className="font-spaceGrotesk text-sm text-[#0E0E0E]">English</span>
              <span className="rounded-sm border border-[#C99A3F]/40 px-2 py-0.5 font-cinzel text-[9px] uppercase tracking-[0.28em] text-[#A07423]">
                Locked v0
              </span>
            </div>
          </Field>

          <Field icon={<BellOff className="h-4 w-4" />} label="Notifications">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="cursor-not-allowed rounded-sm border border-[#C99A3F]/30 bg-[#1a1510]/5 px-3 py-1.5 font-cinzel text-[10px] uppercase tracking-[0.28em] text-[#A07423]/70"
              title="Coming after launch"
            >
              Coming soon
            </button>
          </Field>

          <Field icon={<ShieldOff className="h-4 w-4" />} label="Delete account" last>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="cursor-not-allowed rounded-sm border border-[#A04040]/30 px-3 py-1.5 font-cinzel text-[10px] uppercase tracking-[0.28em] text-[#A04040]/70"
              title="GDPR delete — coming after launch"
            >
              Request deletion
            </button>
          </Field>
        </div>

        <p className="mt-6 text-center font-spaceGrotesk text-[11px] tracking-wide text-[#C9B380]/60">
          User ID: <span className="font-mono">{userId}</span>
        </p>
      </div>
    </PackLayout>
  );
}

function Field({
  icon,
  label,
  children,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 ${last ? '' : 'border-b border-[#C99A3F]/20'}`}
    >
      <div className="flex items-center gap-3 text-[#A07423]">
        <span className="text-[#A07423]/80">{icon}</span>
        <span className="font-cinzel text-[10px] uppercase tracking-[0.28em]">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
