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
  Heart,
  Sparkles,
  BookOpen,
  Stethoscope,
  Lock,
  PawPrint,
  ChevronDown,
  ListChecks,
  Images,
  BarChart3,
  Check,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME } from '@/components/pack/packTheme';
import { CertificateCard } from '@/components/CertificateCard';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { useToast } from '@/hooks/use-toast';
import { uploadExtraPhoto } from '@/services/cloudinaryService';
import { useDogyptStore } from '@/store/dogyptStore';

const T = PACK_THEME;
const EDGE_BASE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1';
const MESSAGE_MAX = 240;

// ---------------------------------------------------------------------------
// "Living my best life" — age since birth
// ---------------------------------------------------------------------------
interface DogAge {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  humanYears: number; // the golden "≈ N in human years" (×7)
}

function computeAge(
  selections: Record<string, string> | null,
  fallbackYear: number | null,
): DogAge | null {
  const y = parseInt(selections?.birthdayYear || '', 10) || fallbackYear || 0;
  if (!y || y < 1990) return null;
  const m = parseInt(selections?.birthdayMonth || '', 10) || 1;
  const d = parseInt(selections?.birthdayDay || '', 10) || 1;
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  if (birth > now) return null;

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86_400_000);
  const humanYears = Math.max(1, Math.round((totalDays / 365.25) * 7));
  return { years, months, days, totalDays, humanYears };
}

// ---------------------------------------------------------------------------
// Temperament — PLACEHOLDER values (predpriprav). Real per-dog data + an
// owner self-assessment editor land post-launch (DB columns: obedience_level,
// social_level, temperament_tags). For now the structure is wired with golden
// defaults so the block reads right; tweak per Matej before launch.
// ---------------------------------------------------------------------------
const OBEDIENCE_LABELS = ['Untamed', 'Spirited', 'Learning', 'Disciplined', 'Well-trained'];
const SOCIAL_LABELS = ['Lone wolf', 'Selective', 'Warming up', 'Friendly', 'Social butterfly'];

function levelLabel(labels: string[], pct: number): string {
  const i = Math.min(labels.length - 1, Math.max(0, Math.floor((pct / 100) * labels.length)));
  return labels[i];
}

interface Temperament {
  obedience: number; // 0–100
  social: number; // 0–100
  tags: string[];
}

function getTemperament(): Temperament {
  // TODO(matej): read from DB once the self-assessment editor exists.
  // Hektor's golden case: "well-trained, well-raised — asocial".
  return {
    obedience: 85,
    social: 15,
    tags: ['Well-trained', 'Well-raised', 'Asocial'],
  };
}

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
  const [showCert, setShowCert] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);
  // DAILY PRAYERS — the three acts of devotion from the Constitution (Part IV).
  // v1 placeholder: local state only, point values provisional. Will persist to a
  // `dog_activities` table (dog_id, type, date, note, photos[], dogs_present[]) and
  // roll up into the owner's stats post-launch.
  const [presenceDone, setPresenceDone] = useState(false);
  const [walkHours, setWalkHours] = useState<number | null>(null); // 0..5, 0 = under 1 h, null = untouched
  const [prayersSubmitted, setPrayersSubmitted] = useState(false); // locks the block once logged (placeholder)

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

  // Cert # = plain number, NO leading zeros (Matej lock 2026-06-07): "# 1" not "#00001".
  const certNumber = useMemo(() => {
    if (packNumber) return `#${packNumber}`;
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
  const age = computeAge(dog.selections, dog.birth_year);
  const temperament = getTemperament();

  // Daily-prayers header + provisional points (placeholder; rolls up to stats later).
  const todayLabel = new Date()
    .toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase();
  const walkPts = walkHours !== null ? walkPointsFor(walkHours) : 0;
  const todayPoints = (presenceDone ? 3 : 0) + walkPts + 5; // +5 = feeding (set placeholder)

  // Birthday for the STATS calendar markers (real birthday + 6 human-year birthdays).
  const sel = (dog.selections ?? {}) as Record<string, unknown>;
  const birthMonth = Number(sel.birthdayMonth) || null;
  const birthDay = Number(sel.birthdayDay) || null;

  return (
    <PackLayout wide>
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

      <div className="flex flex-col gap-5 md:gap-6">

        {/* ============================================================= */}
        {/* TOP ROW — 2 columns like /pack: Identity LEFT · Age RIGHT      */}
        {/* ============================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch">

          {/* — BLOCK 1: Identita + vek (kopíruje /pack handler blok, centrované) — */}
          <section
            className="relative flex flex-col items-center justify-center text-center"
            style={{
              background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
              border: `1px solid rgba(201, 154, 63, 0.30)`,
              borderRadius: 22,
              padding: '20px 20px',
              boxShadow: '0 16px 44px -22px rgba(20, 8, 40, 0.45)',
            }}
          >
            {/* # badge — ľavý horný roh */}
            <span
              className="absolute"
              style={{
                top: 14,
                left: 14,
                padding: '5px 12px',
                borderRadius: 999,
                background: 'rgba(201, 154, 63, 0.14)',
                border: '1px solid rgba(201, 154, 63, 0.50)',
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 13,
                fontWeight: 700,
                color: T.accentGold,
                lineHeight: 1,
              }}
            >
              {certNumber}
            </span>
            {/* Status — pravý horný roh */}
            <span
              className="absolute inline-flex items-center gap-1.5"
              style={{
                top: 14,
                right: 14,
                padding: '5px 11px',
                borderRadius: 999,
                background: T.growGreenSoft,
                border: `1px solid ${T.growGreen}`,
                fontFamily: "'Cinzel', serif",
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: T.growGreen,
              }}
            >
              <Heart className="h-3 w-3" />
              Alive
            </span>

            {/* Foto — kruh, zlatý prsteň */}
            <div
              style={{
                width: 125,
                height: 125,
                borderRadius: '50%',
                background: T.bg,
                overflow: 'hidden',
                border: `2px solid ${T.accentGold}`,
                boxShadow: '0 0 0 1px rgba(201, 154, 63, 0.45), 0 8px 24px rgba(201, 154, 63, 0.28)',
              }}
            >
              {dog.cloudinary_main_url ? (
                <img src={dog.cloudinary_main_url} alt={dogName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div
                  className="flex items-center justify-center h-full"
                  style={{ color: T.inkFaint, fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.2em' }}
                >
                  NO PHOTO
                </div>
              )}
            </div>

            {/* Meno */}
            <h1
              style={{
                fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
                fontSize: 28,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: T.ink,
                marginTop: 12,
                lineHeight: 1.05,
              }}
            >
              {dogName}
            </h1>

            {/* Heroglyf — čierny */}
            <div className="flex items-center justify-center w-full" style={{ marginTop: 12 }}>
              <HeroglyphFrame
                showOwner
                style={{ width: '100%', maxWidth: 300, height: 'auto', color: T.ink } as React.CSSProperties}
              />
            </div>

            {/* "Living my best life" — hlavný údaj = dni (badge, podčiarknuté); roky+ľudské roky v tooltipe (hover PC / tap mobile) */}
            {age ? (
              <div className="flex flex-col items-center" style={{ marginTop: 14 }}>
                <div
                  className="inline-flex items-center gap-1.5"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: T.inkDim,
                  }}
                >
                  <Sparkles className="h-3 w-3" style={{ color: T.accentGold }} />
                  Living my best life
                </div>
                <BestLifeBadge age={age} />
              </div>
            ) : (
              <div style={{ marginTop: 18, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: T.inkDim }}>
                Birthday unknown.
              </div>
            )}
          </section>

          {/* — BLOCK 2 (right): Daily Prayers — the three acts of devotion (Constitution, Part IV) — */}
          <section
            id="prayers"
            className="flex flex-col"
            style={{
              background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
              border: '1px solid rgba(201, 154, 63, 0.30)',
              borderRadius: 22,
              padding: '22px 20px',
              boxShadow: '0 16px 44px -22px rgba(20, 8, 40, 0.45)',
            }}
          >
            {/* Date eyebrow */}
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 9,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: T.accentGold,
                marginBottom: 8,
              }}
            >
              {todayLabel}
            </div>
            {/* Title */}
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 19,
                lineHeight: 1.2,
                fontWeight: 700,
                color: T.ink,
                marginBottom: 6,
              }}
            >
              What a wonderful time to be alive.
            </h2>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12,
                lineHeight: 1.5,
                color: T.inkDim,
                marginBottom: 16,
              }}
            >
              Today's prayers — small acts of devotion to {dogName}.
            </p>

            {/* Prayer checklist — 4 rows stacked, purple→gold gradient, big green check.
                Single-line rows of equal height; status/value sits next to the row. */}
            <div className="flex flex-col gap-2.5">
              {/* 1 — Prayer of Presence (tap to check) */}
              <PrayerRow
                checked={presenceDone}
                onToggle={() => setPresenceDone((v) => !v)}
                disabled={prayersSubmitted}
                title="Prayer of Presence"
                hint="10 minutes of full attention — play, train, just be. No phone. This is the Prayer of Presence."
                right={<span style={PTS_PILL}>+3</span>}
              />

              {/* 2 — Prayer of the Path (slider: < 1 h → all day, max 5 pts) */}
              <PrayerRow
                checked={walkHours !== null}
                disabled={prayersSubmitted}
                title="Prayer of the Path"
                hint="Drag from a short round to an all-day journey. Under an hour earns 0.5 — then 1 point per hour, up to 5."
                right={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={1}
                      value={walkHours ?? 0}
                      disabled={prayersSubmitted}
                      onChange={(e) => setWalkHours(Number(e.target.value))}
                      style={{ width: 80, accentColor: '#F5C73D', cursor: prayersSubmitted ? 'default' : 'pointer' }}
                    />
                    <span style={{ ...PTS_PILL, width: 96, textAlign: 'center', overflow: 'hidden' }}>
                      {walkHours !== null ? `${walkLabel(walkHours)} · +${walkPointsFor(walkHours)}` : 'to all day'}
                    </span>
                  </div>
                }
              />

              {/* 3 — Prayer of Care (placeholder: already set) */}
              <PrayerRow
                checked
                disabled={prayersSubmitted}
                title="Prayer of Care"
                hint="Fresh, real food is devotion — not ultra-processed kibble. Set your dog's diet for daily care points."
                right={<span style={PTS_PILL}>Fresh food · 5/day</span>}
              />

              {/* 4 — Open Ritual (dropdown, coming soon) */}
              <PrayerRow
                locked
                disabled={prayersSubmitted}
                title="Open Ritual"
                hint="Add your own acts of devotion — choose from more rituals or create a custom one."
                onRowClick={() =>
                  toast({
                    title: 'Coming soon',
                    description: 'More rituals — and your own custom ones — are on the way.',
                  })
                }
                right={
                  <span style={{ ...PTS_PILL, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    Choose <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                }
              />
            </div>

            {/* Today's devotion — summary badge + Submit; once submitted the block locks for the day */}
            <div className="flex flex-col items-center" style={{ marginTop: 18 }}>
              <div className="inline-flex items-center gap-2.5">
                <span
                  className="inline-flex items-center gap-2"
                  style={{
                    background: prayersSubmitted
                      ? 'linear-gradient(180deg, #34D27B 0%, #22A35E 100%)'
                      : 'linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%)',
                    color: prayersSubmitted ? '#06301c' : '#3d1f00',
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: '0.02em',
                    padding: '9px 20px',
                    borderRadius: 999,
                    boxShadow: '0 10px 24px -10px rgba(201, 154, 63, 0.7)',
                  }}
                >
                  {prayersSubmitted ? <Check className="h-4 w-4" strokeWidth={3} /> : <Sparkles className="h-4 w-4" />}
                  {prayersSubmitted ? `+${todayPoints} Devotion credited` : `${todayPoints} Devotion today`}
                </span>

                {!prayersSubmitted && (
                  <button
                    type="button"
                    onClick={() => setPrayersSubmitted(true)}
                    className="inline-flex items-center gap-1.5"
                    style={{
                      background: '#22C55E',
                      color: '#fff',
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: '0.04em',
                      padding: '9px 18px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      boxShadow: '0 10px 24px -10px rgba(34, 197, 94, 0.7)',
                    }}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                    Submit
                  </button>
                )}
              </div>
              <span
                style={{
                  marginTop: 7,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 10.5,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: T.inkFaint,
                }}
              >
                {prayersSubmitted ? 'Locked for today · resets tomorrow' : 'Adds to your stats'}
              </span>
            </div>
          </section>

        </div>

        {/* ============================================================= */}
        {/* SECTIONS NAV — 5 dlaždíc v jednom bloku, bez nadpisu (3. v poradí) */}
        {/* ============================================================= */}
        <section
          style={{
            background: T.card,
            border: `1px solid ${T.hairline}`,
            borderRadius: 20,
            padding: 18,
            boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
          }}
        >
          <div className="grid grid-cols-5 gap-2">
            <HubTile
              icon="paw"
              label="Profile"
              active
              open={profileOpen}
              onClick={() => setProfileOpen((v) => !v)}
            />
            <HubTile icon="ankh" label="Protocol" soon />
            <HubTile icon="vet" label="Records" soon />
            <HubTile icon="feather" label="Journal" soon />
            <HubTile
              icon="frame"
              label="Album"
              active
              open={albumOpen}
              onClick={() => setAlbumOpen((v) => !v)}
            />
          </div>
        </section>

        {/* ============================================================= */}
        {/* DOG PROFILE — accordion panel (cert+PDF · level · grid message) */}
        {/* Opens from the PROFILE nav tile above.                          */}
        {/* ============================================================= */}
        {profileOpen && (
          <section
            style={{
              background: T.card,
              border: `1px solid ${T.hairline}`,
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
            }}
          >
            {/* — Sacred Record: certificate + PDFs — */}
            <SectionHeading icon={<FileText className="h-3 w-3" />} label="The Sacred Record" />

            {/* Toggle — certificate hidden by default */}
            <button
              type="button"
              onClick={() => setShowCert((v) => !v)}
              className="inline-flex items-center justify-center gap-2 w-full"
              style={{
                background: 'transparent',
                border: `1px solid ${T.border}`,
                padding: '13px 14px',
                borderRadius: 12,
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: T.ink,
                cursor: 'pointer',
              }}
            >
              <FileText className="h-3 w-3" />
              {showCert ? 'Hide certificate' : 'View certificate'}
            </button>

            {/* Certificate preview (collapsible) */}
            {showCert && (
              <div
                className="relative w-full mx-auto overflow-hidden"
                style={{
                  marginTop: 16,
                  aspectRatio: '1080 / 1350',
                  maxWidth: 480,
                  borderRadius: 14,
                  border: `1px solid ${T.hairline}`,
                }}
              >
                <div
                  style={{ position: 'absolute', inset: 0, transformOrigin: 'top left', width: 1080, height: 1350 }}
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
            )}

            {/* Downloads */}
            <div className="flex flex-col gap-3" style={{ marginTop: 16 }}>
              <DownloadButton
                label="Certificate PDF"
                href={dog.pdf_cert_url}
                filename={`${dogName}-certificate.pdf`}
                primary
              />
              <div className="grid grid-cols-2 gap-3">
                <DownloadButton label="Vertical" href={dog.pdf_vertical_url} filename={`${dogName}-vertical.pdf`} />
                <DownloadButton label="Horizontal" href={dog.pdf_horizontal_url} filename={`${dogName}-horizontal.pdf`} />
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
                      padding: '13px 14px',
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
                    {regenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {regenerating ? 'Generating…' : hasPdfs ? 'Regenerate PDFs' : 'Generate certificate PDFs'}
                  </button>
                );
              })()}
            </div>

            {/* — Nature & Path: dog level — */}
            <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${T.hairline}` }}>
              <SectionHeading icon={<PawPrint className="h-3 w-3" />} label="Nature & Path" />
              <div className="flex flex-col gap-4">
                <LevelMeter
                  title="Obedience"
                  pct={temperament.obedience}
                  label={levelLabel(OBEDIENCE_LABELS, temperament.obedience)}
                />
                <LevelMeter
                  title="Socialisation"
                  pct={temperament.social}
                  label={levelLabel(SOCIAL_LABELS, temperament.social)}
                />
              </div>
              {temperament.tags.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
                  {temperament.tags.map((t) => (
                    <NatureChip key={t} label={t} />
                  ))}
                </div>
              )}
            </div>

            {/* — Grid Message — */}
            <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${T.hairline}` }}>
              <div className="flex items-center justify-between mb-3">
                <SectionHeading icon={<Heart className="h-3 w-3" />} label="Grid Message" inline />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.inkDim }}>
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
            </div>
          </section>
        )}

        {/* ALBUM — accordion (opens from the Album nav tile) */}
        {albumOpen && (
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
            <SectionHeading icon={<Images className="h-3 w-3" />} label="Photo Album" inline />
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
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {dog.cloudinary_main_url && <PhotoTile url={dog.cloudinary_main_url} primary />}
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
        )}

        {/* ============================================================= */}
        {/* STATS — year heatmap calendar (placeholder; post-launch + DB)   */}
        {/* ============================================================= */}
        <section
          id="stats"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: T.card,
            border: `1px solid rgba(201, 154, 63, 0.30)`,
            borderRadius: 22,
            padding: 24,
            boxShadow: '0 16px 44px -22px rgba(20, 8, 40, 0.45)',
          }}
        >
          {/* Faded preview — STATS not live yet */}
          <div aria-hidden style={{ opacity: 0.38, filter: 'grayscale(0.4)', pointerEvents: 'none', userSelect: 'none' }}>
          {/* Big heading */}
          <div className="flex items-center gap-2.5" style={{ marginBottom: 4 }}>
            <BarChart3 className="h-6 w-6" style={{ color: T.accentGold }} />
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: T.ink,
                lineHeight: 1.05,
              }}
            >
              STATS
            </h2>
          </div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12.5,
              color: T.inkDim,
              marginBottom: 18,
            }}
          >
            Every day you log glows — a living calendar of your devotion.
          </p>

          {/* 67 / 33 split: calendar (left) · legend (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
            <div className="lg:col-span-2">
              <StatsCalendar birthMonth={birthMonth} birthDay={birthDay} />
            </div>
            <div className="lg:col-span-1">
              <StatsLegend onAdd={() => undefined} />
            </div>
          </div>
          </div>

          {/* Coming soon overlay */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ padding: 16 }}>
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: T.accentGold,
                background: 'rgba(255, 251, 242, 0.72)',
                border: '1px solid rgba(201, 154, 63, 0.40)',
                backdropFilter: 'blur(1px)',
                padding: '12px 26px',
                borderRadius: 999,
                boxShadow: '0 10px 30px -10px rgba(20, 8, 40, 0.35)',
              }}
            >
              Coming soon
            </span>
          </div>
        </section>

        {/* Footer — re-send email */}
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

        <div style={{ height: 24 }} />
      </div>
    </PackLayout>
  );
}

// ---------------------------------------------------------------------------
// StatsCalendar / StatsLegend — year heatmap (PLACEHOLDER, post-launch = dog_activities).
// Cells glow by activity: all-day = deep green, walk = green, short = amber,
// vet = blue, real birthday = purple, human-year "imaginary" birthday = pink;
// empty = neutral (no red "fail" — CLAUDE.md guilt ban). Year split into 7 bands
// = a dog's 7 human years (a reason for the long trips). Demo data deterministic.
// ---------------------------------------------------------------------------
// Tints black hand-drawn brand icons to brand gold-deep (per brand-icon spec).
const GOLD_FILTER =
  'brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%)';

const STAT_LEGEND = [
  { label: 'All-day', desc: 'A long trip into the wild', color: '#2E7D4F', icon: 'forest' },
  { label: 'Walk', desc: 'A proper daily walk', color: '#7FB04A', icon: 'paw' },
  { label: 'Short', desc: 'A quick round', color: '#E6B23A', icon: 'walk' },
  { label: 'Vet', desc: 'Health & check-ups', color: '#3B82C4', icon: 'vet' },
  { label: 'Birthday', desc: 'The real one', color: '#8B5CF6', icon: 'star' },
  { label: 'Human year', desc: '1 of his 7 — plan something', color: '#EC6FA6', icon: 'sun' },
];

const BIRTHDAY_PURPLE = '#8B5CF6';
const HUMAN_YEAR_PINK = '#EC6FA6';

function statDemoColor(i: number): string {
  if (i === 96 || i === 286) return '#3B82C4'; // vet visits (demo until real log)
  const v = (i * 37 + 13) % 19;
  if (v < 2) return '#2E7D4F';
  if (v < 6) return '#7FB04A';
  if (v < 9) return '#E6B23A';
  return 'rgba(31, 26, 14, 0.06)'; // rest day — neutral, never red
}

const STAT_MONTHS: [string, number][] = [
  ['Jan', 31], ['Feb', 28], ['Mar', 31], ['Apr', 30], ['May', 31], ['Jun', 30],
  ['Jul', 31], ['Aug', 31], ['Sep', 30], ['Oct', 31], ['Nov', 30], ['Dec', 31],
];

function StatsCalendar({ birthMonth, birthDay }: { birthMonth: number | null; birthDay: number | null }) {
  let offset = 0;
  const rows = STAT_MONTHS.map(([name, days]) => {
    const base = offset;
    offset += days;
    return { name, days, base };
  });
  const YEAR = offset; // 365

  // Real birthday + 6 human-year birthdays (year axis split into 7).
  let birthDoy: number | null = null;
  if (birthMonth && birthDay && birthMonth >= 1 && birthMonth <= 12) {
    birthDoy = rows[birthMonth - 1].base + (birthDay - 1);
  }
  const pinkSet = new Set<number>();
  if (birthDoy !== null) {
    for (let k = 1; k < 7; k++) pinkSet.add((birthDoy + Math.round((k * YEAR) / 7)) % YEAR);
  }

  const cellColor = (i: number): string => {
    if (i === birthDoy) return BIRTHDAY_PURPLE;
    if (pinkSet.has(i)) return HUMAN_YEAR_PINK;
    return statDemoColor(i);
  };

  return (
    <div className="flex flex-col" style={{ gap: 3 }}>
      {/* day numbers 1–31 header */}
      <div className="flex items-center" style={{ gap: 7, marginBottom: 2 }}>
        <span style={{ width: 28, flexShrink: 0 }} />
        <div className="flex" style={{ gap: 3, flex: 1, minWidth: 0 }}>
          {Array.from({ length: 31 }).map((_, d) => (
            <span
              key={d}
              style={{
                flex: '1 1 0',
                minWidth: 0,
                textAlign: 'center',
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 7,
                color: T.inkFaint,
              }}
            >
              {d + 1}
            </span>
          ))}
        </div>
      </div>

      {/* 12 month rows — flexible cells, fits without horizontal scroll */}
      {rows.map((m) => (
        <div key={m.name} className="flex items-center" style={{ gap: 7 }}>
          <span
            style={{
              width: 28,
              flexShrink: 0,
              fontFamily: "'Cinzel', serif",
              fontSize: 9,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.inkFaint,
            }}
          >
            {m.name}
          </span>
          <div className="flex" style={{ gap: 3, flex: 1, minWidth: 0 }}>
            {Array.from({ length: 31 }).map((_, d) => (
              <span
                key={d}
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  aspectRatio: '1 / 1',
                  borderRadius: 3,
                  background: d < m.days ? cellColor(m.base + d) : 'transparent',
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsLegend({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: T.inkDim,
          marginBottom: 2,
        }}
      >
        Legend
      </div>

      {STAT_LEGEND.map((l) => (
        <div key={l.label} className="flex items-center gap-2.5">
          <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, background: l.color }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, fontWeight: 700, color: T.ink, lineHeight: 1.1 }}>
              {l.label}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: T.inkFaint }}>{l.desc}</div>
          </div>
        </div>
      ))}

      {/* Add custom activity — coming soon */}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-3"
        style={{
          marginTop: 4,
          padding: '8px 8px',
          borderRadius: 11,
          border: `1.5px dashed ${T.border}`,
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          className="inline-flex items-center justify-center"
          style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, border: `1px dashed ${T.border}` }}
        >
          <img src="/icons/pack/plus.svg" alt="" style={{ width: 16, height: 16, filter: GOLD_FILTER }} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12.5, fontWeight: 700, color: T.ink, lineHeight: 1.1 }}>
            Add activity
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: T.inkFaint }}>
            Name, colour &amp; icon — coming soon
          </div>
        </div>
      </button>
    </div>
  );
}

function BestLifeBadge({ age }: { age: DogAge }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{ marginTop: 10 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Show age detail"
        style={{
          padding: '9px 22px',
          borderRadius: 999,
          background: 'linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%)',
          color: '#3d1f00',
          fontFamily: "'Cinzel', serif",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '0.02em',
          textDecoration: 'underline',
          textUnderlineOffset: 5,
          textDecorationThickness: 2,
          cursor: 'pointer',
          boxShadow: '0 8px 22px -6px rgba(201, 154, 63, 0.65)',
          lineHeight: 1.1,
        }}
      >
        {age.totalDays.toLocaleString('en-US')} days
      </button>
      {open && (
        <div
          className="absolute"
          style={{
            top: 'calc(100% + 9px)',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            padding: '9px 15px',
            borderRadius: 10,
            background: T.ink,
            color: T.card,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12.5,
            fontWeight: 500,
            boxShadow: '0 10px 28px rgba(10,10,10,0.28)',
            zIndex: 5,
          }}
        >
          {age.years}y {age.months}m {age.days}d&nbsp;·&nbsp;≈ {age.humanYears} human years
        </div>
      )}
    </div>
  );
}

function SectionHeading({ icon, label, inline }: { icon: React.ReactNode; label: string; inline?: boolean }) {
  return (
    <div
      className="inline-flex items-center gap-2"
      style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 10,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: T.inkDim,
        marginBottom: inline ? 0 : 16,
      }}
    >
      <span style={{ color: T.accentGold, display: 'inline-flex' }}>{icon}</span>
      {label}
    </div>
  );
}

function LevelMeter({ title, pct, label }: { title: string; pct: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 7 }}>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: T.ink,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: T.accentGold,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ width: '100%', height: 8, borderRadius: 999, background: T.bg, overflow: 'hidden', border: `1px solid ${T.hairline}` }}>
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #E69E1A 0%, #F5C73D 100%)',
          }}
        />
      </div>
    </div>
  );
}

function NatureChip({ label }: { label: string }) {
  return (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        background: 'rgba(201, 154, 63, 0.10)',
        border: `1px solid rgba(201, 154, 63, 0.35)`,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 12,
        fontWeight: 500,
        color: T.ink,
      }}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// WALK points — the Prayer of the Path. Under an hour = 0.5; then 1 pt/hour,
// capped at 5 (an all-day trip). Slider steps in whole hours (0 = under 1 h).
// Provisional placeholders (roll up to stats).
// ---------------------------------------------------------------------------
function walkPointsFor(h: number): number {
  return h <= 0 ? 0.5 : Math.min(5, h);
}
function walkLabel(h: number): string {
  if (h <= 0) return '< 1 h';
  if (h >= 5) return 'all day';
  return `${h} h`;
}

// Purple→gold gradient — matches FounderInvite (brand milestone card).
const PRAYER_GRADIENT = 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))';
// Points pill — light text on the gradient row.
const PTS_PILL: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  fontSize: 11,
  fontWeight: 700,
  color: '#FAF4EC',
  background: 'rgba(0,0,0,0.22)',
  borderRadius: 999,
  padding: '3px 9px',
  whiteSpace: 'nowrap',
};

// PrayerRow — one act of devotion as a checklist row on the purple→gold card.
// Big green check on the left (tap via onToggle, or driven by `checked`);
// `locked` shows a lock instead. Hover reveals the Constitution description.
function PrayerRow({
  checked,
  onToggle,
  onRowClick,
  locked,
  disabled,
  eyebrow,
  title,
  sub,
  hint,
  right,
}: {
  checked?: boolean;
  onToggle?: () => void;
  onRowClick?: () => void;
  locked?: boolean;
  disabled?: boolean;
  eyebrow?: string;
  title: string;
  sub?: string;
  hint: string;
  right?: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const rowClickable = !!onRowClick && !disabled;
  const checkClickable = !!onToggle && !disabled;
  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        onClick={rowClickable ? onRowClick : undefined}
        className="flex items-center gap-3"
        style={{
          background: PRAYER_GRADIENT,
          borderRadius: 14,
          padding: '0 14px',
          minHeight: 58,
          boxShadow: '0 10px 28px -16px rgba(40, 16, 70, 0.6)',
          cursor: rowClickable ? 'pointer' : 'default',
          opacity: disabled ? 0.82 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {/* Big check — left */}
        <button
          type="button"
          onClick={
            checkClickable
              ? (e) => {
                  e.stopPropagation();
                  onToggle!();
                }
              : undefined
          }
          disabled={!checkClickable}
          className="inline-flex items-center justify-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            flexShrink: 0,
            background: checked ? '#22C55E' : 'rgba(255,255,255,0.10)',
            border: checked ? 'none' : '2px solid rgba(250,244,236,0.55)',
            color: checked ? '#fff' : 'rgba(250,244,236,0.7)',
            cursor: checkClickable ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
        >
          {checked ? <Check className="h-4 w-4" strokeWidth={3} /> : locked ? <Lock className="h-3.5 w-3.5" /> : null}
        </button>

        {/* Text — middle */}
        <div className="flex-1" style={{ minWidth: 0 }}>
          {eyebrow && (
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 8,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(245, 222, 170, 0.92)',
              }}
            >
              {eyebrow}
            </div>
          )}
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: '#FAF4EC', lineHeight: 1.15 }}>
            {title}
          </div>
          {sub && (
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: 'rgba(250,244,236,0.72)', marginTop: 1 }}>
              {sub}
            </div>
          )}
        </div>

        {/* Right — points / slider / dropdown */}
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>

      {/* Hover tooltip — the Constitution description */}
      {hover && (
        <span
          className="absolute"
          style={{
            left: 8,
            right: 8,
            bottom: 'calc(100% + 6px)',
            zIndex: 6,
            background: T.ink,
            color: T.card,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10.5,
            lineHeight: 1.4,
            padding: '8px 10px',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

function HubTile({
  icon,
  label,
  active,
  open,
  soon,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  open?: boolean;
  soon?: boolean;
  onClick?: () => void;
}) {
  const clickable = !!active && !soon;
  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      className="relative flex flex-col items-center justify-center text-center"
      style={{
        padding: '18px 10px',
        borderRadius: 14,
        background: active ? 'rgba(201, 154, 63, 0.10)' : T.bg,
        border: active ? '1px solid rgba(201, 154, 63, 0.45)' : `1px dashed ${T.border}`,
        gap: 9,
        minHeight: 100,
        width: '100%',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.15s',
      }}
    >
      {soon && (
        <span
          className="absolute inline-flex items-center gap-1"
          style={{
            top: 7,
            right: 7,
            padding: '2px 6px',
            borderRadius: 999,
            background: 'rgba(31, 26, 14, 0.06)',
            fontFamily: "'Cinzel', serif",
            fontSize: 7,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: T.inkFaint,
          }}
        >
          <Lock className="h-2.5 w-2.5" />
          Soon
        </span>
      )}
      {active && (
        <ChevronDown
          className="absolute h-3.5 w-3.5"
          style={{
            top: 9,
            right: 9,
            color: T.accentGold,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      )}
      <img
        src={`/icons/pack/${icon}.svg`}
        alt=""
        style={{ width: 28, height: 28, filter: GOLD_FILTER, opacity: active ? 1 : 0.4 }}
      />
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          letterSpacing: '0.08em',
          color: active ? T.ink : T.inkDim,
          fontWeight: active ? 700 : 400,
        }}
      >
        {label}
      </span>
    </button>
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
