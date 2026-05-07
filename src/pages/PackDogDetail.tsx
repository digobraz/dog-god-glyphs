import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Loader2, Mail, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { CertificateCard } from '@/components/CertificateCard';
import { useToast } from '@/hooks/use-toast';

const EDGE_BASE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1';

interface DogRow {
  id: string;
  user_id: string | null;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  cloudinary_extras: string[] | null;
  pdf_cert_url: string | null;
  pdf_vertical_url: string | null;
  pdf_horizontal_url: string | null;
  heroglyph_code: string | null;
  breed: string | null;
  country: string | null;
  birth_year: number | null;
  patron_svg: string | null;
  patron_svg2: string | null;
  created_at: string;
  /** Stripe ref / pack number / etc. — best-effort optional fields. */
  stripe_session_id?: string | null;
  pack_number?: number | null;
  owner_name?: string | null;
}

type Status = 'loading' | 'ready' | 'not-found' | 'error';

export default function PackDogDetail() {
  const { id } = useParams<{ id: string }>();
  const [dog, setDog] = useState<DogRow | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) {
        setStatus('not-found');
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Auth gate inside PackLayout will redirect — but bail out gracefully.
        return;
      }

      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              eq: (col: string, val: string) => {
                maybeSingle: () => Promise<{ data: DogRow | null; error: { message: string } | null }>;
              };
            };
          };
        };
      })
        .from('dogs')
        .select(
          'id, user_id, dog_name, cloudinary_main_url, cloudinary_extras, pdf_cert_url, pdf_vertical_url, pdf_horizontal_url, heroglyph_code, breed, country, birth_year, patron_svg, patron_svg2, created_at, stripe_session_id, pack_number, owner_name'
        )
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        setErrorMsg(error.message);
        setStatus('error');
        return;
      }
      if (!data) {
        setStatus('not-found');
        return;
      }
      setDog(data);
      setStatus('ready');
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const issuedDate = useMemo(() => {
    if (!dog?.created_at) return '';
    try {
      return new Date(dog.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  }, [dog]);

  const certNumber = useMemo(() => {
    if (dog?.pack_number) return `#${String(dog.pack_number).padStart(5, '0')}`;
    if (dog?.id) return `#${dog.id.slice(0, 8).toUpperCase()}`;
    return '#—';
  }, [dog]);

  const handleResend = async () => {
    if (!dog?.id || resending) return;
    setResending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`${EDGE_BASE}/send-certificate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ dogId: dog.id, force: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({
        title: 'Email re-sent',
        description: 'Check your inbox in a moment.',
      });
    } catch (err) {
      toast({
        title: 'Could not re-send email',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <PackLayout>
        <CenteredPaper>
          <div className="flex items-center justify-center gap-2" style={{ color: '#3a1f00' }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.28em', fontSize: 12, textTransform: 'uppercase' }}>
              Loading
            </span>
          </div>
        </CenteredPaper>
      </PackLayout>
    );
  }

  if (status === 'not-found') {
    return (
      <PackLayout>
        <CenteredPaper>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#1a0900',
              marginBottom: 8,
            }}
          >
            Heroglyph Not Found
          </h2>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#3a1f00', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            This heroglyph is either not yours or no longer exists.
          </p>
          <Link
            to="/pack"
            className="inline-flex items-center gap-2 rounded-md border border-[#7a4c08] px-4 py-2 text-[#1a0900] hover:bg-[hsl(var(--gold)/0.08)]"
            style={{
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.22em',
              fontSize: 12,
              textTransform: 'uppercase',
              fontWeight: 700,
              borderRadius: 8,
            }}
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Pack
          </Link>
        </CenteredPaper>
      </PackLayout>
    );
  }

  if (status === 'error' || !dog) {
    return (
      <PackLayout>
        <CenteredPaper>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#3a1f00' }}>
            Something went wrong while loading this heroglyph.
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#7a4c08', marginTop: 8 }}>
            {errorMsg}
          </p>
        </CenteredPaper>
      </PackLayout>
    );
  }

  const dogName = dog.dog_name || 'Unnamed';
  const ownerName = dog.owner_name || '';
  const heroglyphCode = dog.heroglyph_code || 'H-XX-XX-XX-XX-XX-XX-XX-XX-XX-XX-XX';

  return (
    <PackLayout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          to="/pack"
          className="inline-flex items-center gap-2 text-[hsl(var(--gold)/0.8)] hover:text-[hsl(var(--gold))]"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.22em', fontSize: 11, textTransform: 'uppercase' }}
        >
          <ArrowLeft className="h-3 w-3" />
          Pack
        </Link>
        <div
          className="text-[hsl(var(--gold)/0.7)]"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.06em' }}
          title={heroglyphCode}
        >
          {heroglyphCode}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
        {/* Certificate preview — scaled to fit */}
        <div className="flex justify-center">
          <div
            className="relative w-full max-w-[540px] aspect-[1080/1350] overflow-hidden rounded-md border border-[hsl(var(--gold)/0.4)]"
            style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: 'top left',
                width: 1080,
                height: 1350,
                transform: 'scale(0.5)',
              }}
              ref={(el) => {
                if (!el) return;
                // Responsive scale to fit the wrapper width
                const wrapper = el.parentElement;
                if (!wrapper) return;
                const apply = () => {
                  const w = wrapper.clientWidth;
                  const scale = w / 1080;
                  el.style.transform = `scale(${scale})`;
                };
                apply();
                // observe resizes
                const ro = new ResizeObserver(apply);
                ro.observe(wrapper);
              }}
            >
              <CertificateCard
                dogName={dogName}
                ownerName={ownerName}
                photoUrl={dog.cloudinary_main_url || undefined}
                heroglyphCode={heroglyphCode}
                certNumber={certNumber}
                issuedDate={issuedDate}
              />
            </div>
          </div>
        </div>

        {/* Action panel */}
        <aside className="flex flex-col gap-3">
          <div
            className="rounded-md border border-[hsl(var(--gold)/0.35)] bg-[hsl(var(--gold)/0.04)] p-4"
            style={{ borderRadius: 8 }}
          >
            <div
              className="text-[hsl(var(--gold)/0.7)] mb-2"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase' }}
            >
              Heroglyph Code
            </div>
            <div
              className="text-[hsl(var(--gold))] break-all"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '0.04em' }}
            >
              {heroglyphCode}
            </div>
          </div>

          <DownloadButton
            label="Download Certificate PDF"
            href={dog.pdf_cert_url}
            filename={`${dogName}-certificate.pdf`}
            primary
          />
          <DownloadButton
            label="Download Vertical"
            href={dog.pdf_vertical_url}
            filename={`${dogName}-vertical.pdf`}
          />
          <DownloadButton
            label="Download Horizontal"
            href={dog.pdf_horizontal_url}
            filename={`${dogName}-horizontal.pdf`}
          />

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[hsl(var(--gold)/0.3)] px-4 py-2 text-[hsl(var(--gold)/0.85)] hover:text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.06)] disabled:opacity-50 transition-colors"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              borderRadius: 8,
            }}
          >
            {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
            Re-send Email
          </button>

          <button
            type="button"
            disabled
            title="Coming soon"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[hsl(var(--gold)/0.2)] px-4 py-2 text-[hsl(var(--gold)/0.45)] cursor-not-allowed"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              borderRadius: 8,
            }}
          >
            <Share2 className="h-3 w-3" />
            Share — Coming Soon
          </button>
        </aside>
      </div>
    </PackLayout>
  );
}

function DownloadButton({
  label,
  href,
  filename,
  primary,
}: {
  label: string;
  href: string | null;
  filename: string;
  primary?: boolean;
}) {
  const enabled = !!href;
  const Icon = primary ? FileText : Download;

  const baseStyle = {
    fontFamily: "'Cinzel', serif",
    fontSize: 12,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    fontWeight: 700,
    borderRadius: 8,
  };

  if (!enabled) {
    return (
      <button
        type="button"
        disabled
        title="Generating… try again in a minute"
        className={
          'inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 cursor-not-allowed ' +
          (primary
            ? 'bg-[hsl(var(--gold)/0.2)] text-[hsl(var(--gold)/0.55)]'
            : 'border border-[hsl(var(--gold)/0.25)] text-[hsl(var(--gold)/0.45)]')
        }
        style={baseStyle}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        {label}
      </button>
    );
  }

  return (
    <a
      href={href}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
      className={
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 transition-colors ' +
        (primary
          ? 'bg-[hsl(var(--gold))] text-black hover:bg-[hsl(var(--gold-light))]'
          : 'border border-[hsl(var(--gold)/0.5)] text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.08)]')
      }
      style={baseStyle}
    >
      <Icon className="h-3 w-3" />
      {label}
    </a>
  );
}

function CenteredPaper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md">
      <div
        className="papyrus-bg rounded-md border border-[hsl(var(--gold)/0.5)] p-6 md:p-8 text-center"
        style={{ borderRadius: 8 }}
      >
        {children}
      </div>
    </div>
  );
}
