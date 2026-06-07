import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Mail,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout, PACK_THEME } from '@/components/pack/PackLayout';
import { CertificateCard } from '@/components/CertificateCard';
import { useToast } from '@/hooks/use-toast';
import { uploadExtraPhoto } from '@/services/cloudinaryService';
import { useDogyptStore } from '@/store/dogyptStore';

const T = PACK_THEME;
const EDGE_BASE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1';
const MESSAGE_MAX = 240;

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
  selections: Record<string, string> | null;
  grid_message: string | null;
  created_at: string;
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
  const [regenerating, setRegenerating] = useState(false);
  const [packNumber, setPackNumber] = useState<number | null>(null);
  const { toast } = useToast();

  const [messageDraft, setMessageDraft] = useState('');
  const [messageSaving, setMessageSaving] = useState(false);
  const [messageDirty, setMessageDirty] = useState(false);

  const [extras, setExtras] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) {
        setStatus('not-found');
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
          'id, user_id, dog_name, cloudinary_main_url, cloudinary_extras, pdf_cert_url, pdf_vertical_url, pdf_horizontal_url, heroglyph_code, breed, country, birth_year, patron_svg, patron_svg2, selections, grid_message, created_at, stripe_session_id, owner_name',
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
      // Fallback for dogs bought before grid_message column was populated (message lived in selections.dogMessage).
      setMessageDraft(data.grid_message ?? data.selections?.dogMessage ?? '');
      setExtras(Array.isArray(data.cloudinary_extras) ? data.cloudinary_extras : []);
      setStatus('ready');

      if (data.stripe_session_id) {
        const { data: pm } = await (supabase as unknown as {
          from: (t: string) => {
            select: (cols: string) => {
              eq: (col: string, val: string) => {
                maybeSingle: () => Promise<{ data: { pack_number: number } | null }>;
              };
            };
          };
        })
          .from('pack_members')
          .select('pack_number')
          .eq('stripe_session_id', data.stripe_session_id)
          .maybeSingle();
        if (mounted && pm?.pack_number) setPackNumber(pm.pack_number);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Rehydrate global store so CertificateCard's HeroglyphFrame (reads selections/
  // ownerName/patronSvg from the store, not props) renders THIS dog's symbol.
  // Without this, a fresh magic-link login or a 2nd dog shows an empty/wrong
  // heroglyph on the on-page certificate. Mirrors WelcomeScreen rehydration.
  useEffect(() => {
    if (!dog) return;
    const s = useDogyptStore.getState();
    if (dog.dog_name) s.setDogName(dog.dog_name);
    if (dog.owner_name) s.setOwnerName(dog.owner_name);
    if (dog.cloudinary_main_url) s.setDogPhotoUrl(dog.cloudinary_main_url);
    if (dog.patron_svg) s.setPatronSvg(dog.patron_svg);
    if (dog.patron_svg2) s.setPatronSvg2(dog.patron_svg2);
    if (dog.selections) {
      Object.entries(dog.selections).forEach(([k, v]) => {
        if (typeof v === 'string') s.setSelection(k, v);
      });
    }
  }, [dog]);

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
    if (packNumber) return `#${String(packNumber).padStart(5, '0')}`;
    if (dog?.id) return `#${dog.id.slice(0, 8).toUpperCase()}`;
    return '#—';
  }, [dog, packNumber]);

  const handleSaveMessage = async () => {
    if (!dog?.id || messageSaving) return;
    setMessageSaving(true);
    try {
      const next = messageDraft.trim().slice(0, MESSAGE_MAX);
      const { error: upErr } = await (supabase as unknown as {
        from: (t: string) => {
          update: (vals: { grid_message: string | null }) => {
            eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
          };
        };
      })
        .from('dogs')
        .update({ grid_message: next || null })
        .eq('id', dog.id);
      if (upErr) throw new Error(upErr.message);
      setDog({ ...dog, grid_message: next || null });
      setMessageDirty(false);
      toast({ title: 'Message saved', description: 'Visible on your GRID card.' });
    } catch (err) {
      toast({
        title: 'Could not save',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setMessageSaving(false);
    }
  };

  const handleAddPhoto = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !dog?.id) return;
    setUploading(true);
    try {
      const sessionFolder = dog.stripe_session_id || dog.id;
      const result = await uploadExtraPhoto(file, sessionFolder, extras.length + 1);
      const next = [...extras, result.secureUrl];
      const { error: upErr } = await (supabase as unknown as {
        from: (t: string) => {
          update: (vals: { cloudinary_extras: string[] }) => {
            eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
          };
        };
      })
        .from('dogs')
        .update({ cloudinary_extras: next })
        .eq('id', dog.id);
      if (upErr) throw new Error(upErr.message);
      setExtras(next);
      toast({ title: 'Photo added' });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (url: string) => {
    if (!dog?.id) return;
    const next = extras.filter((u) => u !== url);
    try {
      const { error: upErr } = await (supabase as unknown as {
        from: (t: string) => {
          update: (vals: { cloudinary_extras: string[] }) => {
            eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
          };
        };
      })
        .from('dogs')
        .update({ cloudinary_extras: next })
        .eq('id', dog.id);
      if (upErr) throw new Error(upErr.message);
      setExtras(next);
    } catch (err) {
      toast({
        title: 'Could not remove',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerate = async () => {
    if (!dog?.id || regenerating) return;
    setRegenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      const res = await fetch(`${EDGE_BASE}/generate-pdfs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ dogId: dog.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      const urls = json?.urls || {};
      setDog({
        ...dog,
        pdf_cert_url: urls.cert ?? dog.pdf_cert_url,
        pdf_vertical_url: urls.vertical ?? dog.pdf_vertical_url,
        pdf_horizontal_url: urls.horizontal ?? dog.pdf_horizontal_url,
      });
      toast({ title: 'Certificate ready', description: 'Your PDFs have been generated.' });
    } catch (err) {
      toast({
        title: 'Could not generate PDFs',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setRegenerating(false);
    }
  };

  // Auto-generate PDFs on first view if any are missing. This is the reliable
  // server-side path: the buyer always reaches this page via the email magic
  // link, and the request is held by the browser (~30s) so there's no
  // background-task time limit. Covers the "closed the tab on /welcome" case.
  const autoGenFired = useRef(false);
  useEffect(() => {
    if (!dog || autoGenFired.current || regenerating) return;
    const missing = !dog.pdf_cert_url || !dog.pdf_vertical_url || !dog.pdf_horizontal_url;
    if (missing) {
      autoGenFired.current = true;
      void handleRegenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dog]);

  const handleResend = async () => {
    if (!dog?.id || resending) return;
    setResending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      const res = await fetch(`${EDGE_BASE}/send-certificate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ dogId: dog.id, force: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({ title: 'Email re-sent', description: 'Check your inbox in a moment.' });
    } catch (err) {
      toast({
        title: 'Could not re-send',
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
        <div className="flex items-center justify-center py-16" style={{ color: T.inkDim }}>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.28em', fontSize: 11 }}>
            LOADING
          </span>
        </div>
      </PackLayout>
    );
  }

  if (status === 'not-found') {
    return (
      <PackLayout>
        <NotFoundBox />
      </PackLayout>
    );
  }

  if (status === 'error' || !dog) {
    return (
      <PackLayout>
        <ErrorBox message={errorMsg} />
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
          className="inline-flex items-center gap-2"
          style={{
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.22em',
            fontSize: 11,
            textTransform: 'uppercase',
            color: T.inkDim,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft className="h-3 w-3" />
          Pack
        </Link>
        {packNumber && (
          <Link
            to={`/grid?focus=${packNumber}`}
            className="inline-flex items-center gap-1.5"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: T.ink,
              padding: '7px 12px',
              border: `1px solid ${T.border}`,
              borderRadius: 999,
              textDecoration: 'none',
            }}
          >
            View on Grid {certNumber}
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      <h1
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 32,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: T.ink,
        }}
      >
        {dogName}
      </h1>
      <div
        style={{
          marginTop: 4,
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: T.inkDim,
          marginBottom: 22,
        }}
      >
        {certNumber} · {issuedDate}
      </div>

      <div className="flex flex-col gap-5">
        {/* Certificate preview */}
        <section
          style={{
            background: T.card,
            borderRadius: 22,
            padding: 16,
            border: `1px solid ${T.hairline}`,
            boxShadow: '0 12px 36px rgba(10,10,10,0.06)',
          }}
        >
          <div
            className="relative w-full mx-auto overflow-hidden"
            style={{
              aspectRatio: '1080 / 1350',
              maxWidth: 480,
              borderRadius: 14,
              border: `1px solid ${T.hairline}`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: 'top left',
                width: 1080,
                height: 1350,
              }}
              ref={(el) => {
                if (!el) return;
                const wrapper = el.parentElement;
                if (!wrapper) return;
                const apply = () => {
                  const w = wrapper.clientWidth;
                  el.style.transform = `scale(${w / 1080})`;
                };
                apply();
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
        </section>

        {/* Grid message */}
        <section
          style={{
            background: T.card,
            border: `1px solid ${T.hairline}`,
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: T.inkDim,
              }}
            >
              Grid Message
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: T.inkDim,
              }}
            >
              {messageDraft.length}/{MESSAGE_MAX}
            </span>
          </div>
          <textarea
            value={messageDraft}
            onChange={(e) => {
              setMessageDraft(e.target.value.slice(0, MESSAGE_MAX));
              setMessageDirty(true);
            }}
            placeholder="A few words shown on your GRID card — a tribute, a memory, a hello to the pack."
            rows={3}
            style={{
              width: '100%',
              background: T.bg,
              border: `1px solid ${T.hairline}`,
              borderRadius: 12,
              padding: 14,
              color: T.ink,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <div className="mt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={handleSaveMessage}
              disabled={!messageDirty || messageSaving}
              className="inline-flex items-center gap-2"
              style={{
                background: messageDirty ? T.ink : 'transparent',
                color: messageDirty ? T.card : T.inkFaint,
                border: messageDirty ? 'none' : `1px solid ${T.hairline}`,
                padding: '11px 16px',
                borderRadius: 10,
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: messageDirty ? 'pointer' : 'default',
                opacity: messageSaving ? 0.6 : 1,
                transition: 'all 0.15s',
              }}
            >
              {messageSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {messageSaving ? 'Saving' : 'Save'}
            </button>
          </div>
        </section>

        {/* Photos */}
        <section
          style={{
            background: T.card,
            border: `1px solid ${T.hairline}`,
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: T.inkDim,
              }}
            >
              Photos
            </div>
            <button
              type="button"
              onClick={handleAddPhoto}
              disabled={uploading}
              className="inline-flex items-center gap-2"
              style={{
                background: T.ink,
                color: T.card,
                border: 'none',
                padding: '8px 14px',
                borderRadius: 999,
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                cursor: uploading ? 'progress' : 'pointer',
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {dog.cloudinary_main_url && (
              <PhotoTile url={dog.cloudinary_main_url} primary />
            )}
            {extras.map((u) => (
              <PhotoTile key={u} url={u} onRemove={() => handleRemovePhoto(u)} />
            ))}
            {extras.length === 0 && !dog.cloudinary_main_url && (
              <div
                className="col-span-3"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 13,
                  color: T.inkDim,
                  padding: 18,
                  border: `1px dashed ${T.border}`,
                  borderRadius: 12,
                  textAlign: 'center',
                }}
              >
                No photos yet.
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col gap-3">
          <DownloadButton
            label="Certificate PDF"
            href={dog.pdf_cert_url}
            filename={`${dogName}-certificate.pdf`}
            primary
          />
          <div className="grid grid-cols-2 gap-3">
            <DownloadButton
              label="Vertical"
              href={dog.pdf_vertical_url}
              filename={`${dogName}-vertical.pdf`}
            />
            <DownloadButton
              label="Horizontal"
              href={dog.pdf_horizontal_url}
              filename={`${dogName}-horizontal.pdf`}
            />
          </div>
          {(() => {
            const hasPdfs = !!(dog.pdf_cert_url && dog.pdf_vertical_url && dog.pdf_horizontal_url);
            return (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex items-center justify-center gap-2"
                style={{
                  background: hasPdfs ? 'transparent' : T.ink,
                  border: hasPdfs ? `1px solid ${T.border}` : 'none',
                  padding: '14px 14px',
                  borderRadius: 12,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: hasPdfs ? T.ink : T.card,
                  cursor: regenerating ? 'progress' : 'pointer',
                  opacity: regenerating ? 0.6 : 1,
                }}
              >
                {regenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {regenerating
                  ? 'Generating…'
                  : hasPdfs
                    ? 'Regenerate PDFs'
                    : 'Generate certificate PDFs'}
              </button>
            );
          })()}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center justify-center gap-2"
            style={{
              background: 'transparent',
              border: `1px solid ${T.border}`,
              padding: '14px 14px',
              borderRadius: 12,
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: T.ink,
              cursor: resending ? 'progress' : 'pointer',
              opacity: resending ? 0.6 : 1,
            }}
          >
            {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
            Re-send email
          </button>
        </section>

        <div style={{ height: 24 }} />
      </div>
    </PackLayout>
  );
}

function PhotoTile({ url, primary, onRemove }: { url: string; primary?: boolean; onRemove?: () => void }) {
  return (
    <div
      className="relative group"
      style={{
        aspectRatio: '1 / 1',
        background: T.bg,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${T.hairline}`,
      }}
    >
      <img src={url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {primary && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            padding: '3px 8px',
            background: 'rgba(255, 251, 242, 0.94)',
            color: T.ink,
            fontFamily: "'Cinzel', serif",
            fontSize: 8,
            letterSpacing: '0.22em',
            borderRadius: 4,
            fontWeight: 700,
          }}
        >
          MAIN
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 10, 10, 0.78)',
            color: T.card,
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
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

  const baseStyle: React.CSSProperties = {
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    fontWeight: 700,
    borderRadius: 12,
    padding: '14px 14px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };

  if (!enabled) {
    return (
      <button
        type="button"
        disabled
        title="Generating…"
        style={{
          ...baseStyle,
          background: primary ? T.hairline : 'transparent',
          border: primary ? 'none' : `1px solid ${T.hairline}`,
          color: T.inkFaint,
          cursor: 'not-allowed',
        }}
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
      style={{
        ...baseStyle,
        background: primary ? T.ink : 'transparent',
        border: primary ? 'none' : `1px solid ${T.border}`,
        color: primary ? T.card : T.ink,
        textDecoration: 'none',
      }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </a>
  );
}

function NotFoundBox() {
  return (
    <div
      style={{
        background: T.card,
        borderRadius: 20,
        padding: 28,
        maxWidth: 480,
        margin: '0 auto',
        border: `1px solid ${T.hairline}`,
      }}
    >
      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 22,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: T.ink,
          marginBottom: 10,
        }}
      >
        Not Found
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.inkDim, fontSize: 14, marginBottom: 20 }}>
        This heroglyph is either not yours or no longer exists.
      </p>
      <Link
        to="/pack"
        className="inline-flex items-center justify-center gap-2 w-full"
        style={{
          background: T.ink,
          color: T.card,
          padding: '12px 16px',
          borderRadius: 12,
          fontFamily: "'Cinzel', serif",
          letterSpacing: '0.22em',
          fontSize: 11,
          textTransform: 'uppercase',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Pack
      </Link>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ background: T.card, borderRadius: 16, padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.ink }}>
        Something went wrong while loading this heroglyph.
      </p>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.inkDim, marginTop: 6 }}>
        {message}
      </p>
    </div>
  );
}
