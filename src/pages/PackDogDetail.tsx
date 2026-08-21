import { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { Link, useParams } from 'react-router-dom';
import { PackDogWizard } from '@/components/pack/PackWizard';
import {
  ArrowLeft,
  Download,
  Loader2,
  Mail,
  ExternalLink,
  Save,
  Trash2,
  RefreshCw,
  Sparkles,
  BookOpen,
  Lock,
  ChevronDown,
  Images,
  Check,
  Camera,
  Syringe,
  Shield,
  ShieldPlus,
  Bone,
  Bug,
  Mic,
  X,
} from 'lucide-react';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { DogPassport, type FixedRow } from '@/components/pack/DogPassport';
import { WillPanel } from '@/components/pack/WillPanel';
import { PACK_THEME, PILL_CSS } from '@/components/pack/packTheme';
import { CertificateCard } from '@/components/CertificateCard';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { MemorialControl } from '@/components/pack/MemorialControl';
import { useToast } from '@/hooks/use-toast';
import { uploadExtraPhoto } from '@/services/cloudinaryService';
import { useDogyptStore } from '@/store/dogyptStore';
import { flagUrl, countryISO2, flagEmojiFromISO2 } from '@/lib/countryGeo';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';
import { DEV_FULL } from '@/lib/packFlags';
// Vek psa žije v lib/dogAge.ts — tú istú matematiku potrebuje aj svorka na `/pack`.
import { computeAge, type DogAge } from '@/lib/dogAge';
import { HEALTH_KEYS, HEALTH_COLORS, healthLabelKey, type HealthKey } from '@/lib/dogHealth';

const T = PACK_THEME;
const MESSAGE_MAX = 150;

// ── DOG ID — vzhľad dokladu (2026-08-12) ────────────────────────────────────
// Ladí sa TÝMTO blokom, nie inline štýlmi v JSX: layout má dve vetvy (PC / mobil)
// a inline styly by druhú vetvu nevedeli obslúžiť.
// Rovnica namiesto merania: meno rastie cez clamp(), fotka a QR majú pevné
// rozmery, stredný stĺpec je minmax(0,1fr) — nič sa po vykreslení nedomeriava.
// ⚠️ Toto je JS template literal — spätný apostrof v komentári zhodí build.
// ⚠️ Breakpoint 720/721 px je to isté číslo ako v psom bloku na /pack/dogs.
const DOGID_CSS = `
@keyframes did-in{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.did-card{position:relative;animation:did-in .32s cubic-bezier(.16,1,.3,1) both;}
/* dvojitý rám — doklady majú vnútornú linku, nie jednu hranu */
.did-card::before{content:'';position:absolute;inset:7px;border:1px solid rgba(201,154,63,.20);border-radius:11px;pointer-events:none;}
.did-idzone{position:relative;}

/* CENTROVANÁ OS — vzor je certifikát: všetko na jednej osi, zhora nadol. */
.did-stack{display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:4px;}
/* HLAVIČKA DOKLADU (Matej 13.8.2026: „úplne hore bude v pils len DOG ID ako názov
   dokumentu. číslo psa bude v pils pred slovenskou vlajkou.") — názov dokumentu je
   PILULKA z matrice (.pk-pill v packTheme.ts), nie holý eyebrow text; poradové číslo
   sa presunulo dolu do čipového radu. Tie dve pilulky preto nesmú vyzerať inak než
   pilulky na homepage a v profile — DNA nesie .pk-pill, tu je len typografia a
   rozostupy. */
.did-head{display:flex;flex-direction:column;align-items:center;margin-bottom:16px;}
.did-idpill{font-family:'Cinzel',serif;font-weight:700;font-size:11px;letter-spacing:.28em;text-transform:uppercase;padding:6px 18px;}
/* Poradové číslo = ČÍSLO ⇒ Space Grotesk 600 (strop načítanej váhy), nie Cinzel —
   pravidlo pilulky z packTheme.ts: názov Cinzel, číslo Grotesk. */
/* Výška 30px je spoločná pre všetky TRI čipy v rade (číslo · vlajka · zdravie) —
   inak je jeden o 6 px vyšší a rad vyzerá nedbalo. Preto pevná výška, nie padding. */
.did-numpill{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:12.5px;letter-spacing:.02em;height:30px;padding:0 13px;}

/* fotka = KRUH so zlatým prsteňom (ako na certifikáte a na GRIDE) */
.did-photoframe{position:relative;display:block;width:136px;height:136px;border-radius:50%;overflow:hidden;padding:0;background:${T.bg};border:2px solid ${T.accentGold};box-shadow:0 0 0 1px rgba(201,154,63,.45),0 10px 26px rgba(201,154,63,.24);}

.did-main{margin-top:14px;width:100%;}
.did-name{font-family:'Cinzel Decorative','Cinzel',serif;font-weight:700;font-size:clamp(24px,4.4vw,34px);line-height:1.05;letter-spacing:.03em;text-transform:uppercase;color:${T.ink};overflow-wrap:anywhere;}
.did-chips{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:9px;margin-top:12px;}
.did-health{width:150px;flex:0 0 auto;}

.did-glyph{width:100%;max-width:360px;margin-top:16px;}
.did-meta{margin-top:14px;width:100%;}

/* zlatá vyblednutá čiara medzi identitou a údajmi */
.did-rule{height:2px;margin:20px 0 4px;background:${T.rule};opacity:.9;}

/* späť = holá šípka v STREDE nad blokom (rovnaký tvar ako .tl-back v TRIPSTATS) */
.did-backrow{display:flex;justify-content:center;margin-bottom:16px;}
.did-back{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:rgba(0,0,0,0.42);border:1px solid ${T.onDarkBorder};color:${T.onDark};cursor:pointer;transition:border-color .15s,color .15s;}
.did-back:hover{border-color:${T.accentGold};color:${T.accentGold};}

@media (max-width:720px){
  .did-photoframe{width:112px;height:112px;}
}
`;

// "labrador retriever" → "Labrador Retriever"
function capWords(s: string): string {
  return s
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Zdravotné štíty (parazity/očkovanie/imunita/kĺby) ZANIKLI 13.8.2026. Mali stavy
// `active/due/off` natvrdo — teda vymyslený údaj na dokumente, ktorý má byť
// vysvedčením. Navyše sa `HEALTH_SHIELDS` vyrobili a NIKDE nevykreslili, takže to bol
// mŕtvy kód. Skutočné dátumy sú v `dog_events` (`health.vaxRabies` a spol.) a doklad
// ich už ukazuje v bloku OČKOVANIA — vrátane pečiatky, kedy boli naposledy zapísané.
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
  life_status?: string | null;   // FIX9: 'alive' | 'deceased'
  death_date?: string | null;    // FIX9: yyyy-mm-dd, keď deceased
  patron_svg: string | null;
  patron_svg2: string | null;
  selections: Record<string, string> | null;
  grid_message: string | null;
  created_at: string;
  stripe_session_id?: string | null;
  pack_number?: number | null;
  owner_name?: string | null;
  weight_kg?: number | null;
  health_status?: string | null;
  allergies?: string | null;
  conditions?: string | null;
  medication?: string | null;
  diet?: string | null;
}

type Status = 'loading' | 'ready' | 'not-found' | 'error';

// Country flag circle with an offline fallback. The flagcdn image is preferred
// (crisp, matches the GRID), but if it fails to load — third-party host, in-app
// browser, blocked CDN — we draw the flag emoji in the same circle instead of
// leaving the browser's broken-image glyph behind.
function FlagCircle({ src, iso2, label }: { src: string; iso2: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const base: React.CSSProperties = {
    // 30px = spoločná výška čipového radu (číslo · vlajka · zdravie).
    width: 30,
    height: 30,
    borderRadius: '50%',
    justifySelf: 'center',
    border: '1.5px solid rgba(201, 154, 63, 0.55)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    background: '#1a1a1a',
  };

  if (failed) {
    const emoji = flagEmojiFromISO2(iso2);
    return (
      <span
        title={label}
        aria-label={label}
        role="img"
        style={{
          ...base,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          lineHeight: 1,
          overflow: 'hidden',
        }}
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={label}
      title={label}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ ...base, objectFit: 'cover' }}
    />
  );
}

export default function PackDogDetail() {
  const t = useT();
  // Fallback pre kľúče, ktoré ešte nie sú v i18n — inak by na karte svietil holý kľúč.
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };
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
  const [wallOpen, setWallOpen] = useState(false);
  // Závet — panel nad dokladom. Otvára ho ✎ pri bloku ZÁVET, jeho červené pomlčky
  // aj tlačidlo v zdieľacom rade; všetky tri vedú na to isté miesto.
  const [willOpen, setWillOpen] = useState(false);
  const [memorialOpen, setMemorialOpen] = useState(false);
  const [memorialStep, setMemorialStep] = useState<'confirm' | 'date'>('confirm');
  // SECTIONS NAV — jedna otvorená dlaždica naraz (Health/Training/Journal). accordion.
  const [openTile, setOpenTile] = useState<null | 'health' | 'training' | 'journal'>(null);
  const toggleTile = (t: 'health' | 'training' | 'journal') =>
    setOpenTile((cur) => (cur === t ? null : t));

  // Profile panel ref — po otvorení smooth-scroll naň (najmä mobile, kde je pod Prayers).

  // Hlavné foto (avatar) — zmena updatuje cloudinary_main_url; grid/cert re-bake = coming soon.
  const mainPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingMain, setUploadingMain] = useState(false);

  // HEALTH STATUS — meniteľný badge; persists to DB via healthStatus field.
  const [healthStatus, setHealthStatus] = useState<HealthKey>('healthy');
  const [healthOpen, setHealthOpen] = useState(false);
  // Weight — editable inline, saves to DB via weightKgDb.
  const [weightEditing, setWeightEditing] = useState(false);
  const [weightDraft, setWeightDraft] = useState('');
  // DAILY PRAYERS — the three acts of devotion from the Constitution (Part IV).
  const [presenceDone, setPresenceDone] = useState(false);
  const [walkHours, setWalkHours] = useState<number | null>(null); // 0..5, 0 = under 1 h, null = untouched
  const [prayersSubmitted, setPrayersSubmitted] = useState(false); // locks the block once logged
  const [prayerLockedPoints, setPrayerLockedPoints] = useState<number | null>(null); // points credited when locked
  const [showPrayerConfirm, setShowPrayerConfirm] = useState(false);
  // HEALTH — editable fields from DB
  const [weightKgDb, setWeightKgDb] = useState<string>('');
  const [allergiesDb, setAllergiesDb] = useState<string>('');
  const [conditionsDb, setConditionsDb] = useState<string>('');
  const [medicationDb, setMedicationDb] = useState<string>('');
  const [dietDb, setDietDb] = useState<string>('');
  const [healthSaving, setHealthSaving] = useState(false);

  // Log today's prayer → grant-devotion (idempotent: one credit per dog per day).
  const confirmAndSubmitPrayers = async () => {
    setShowPrayerConfirm(false);
    const pts = (presenceDone ? 3 : 0) + (walkHours !== null ? walkPointsFor(walkHours) : 0);
    setPrayersSubmitted(true); // optimistic lock
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${EDGE_BASE}/grant-devotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ kind: 'prayer', dog_id: id, presence: presenceDone, walk_hours: walkHours }),
      });
      if (res.ok) {
        const j = await res.json();
        setPrayerLockedPoints(j.points ?? pts);
        if (typeof j.total === 'number') {
          window.dispatchEvent(new CustomEvent('dogypt:devotion', { detail: { total: j.total } }));
        }
      } else {
        // Revert optimistic lock on failure
        setPrayersSubmitted(false);
        toast({ title: t('pack.dog.toastCouldntLog'), variant: 'destructive' });
      }
    } catch {
      // Revert optimistic lock on network error
      setPrayersSubmitted(false);
      toast({ title: t('pack.dog.toastCouldntLog'), variant: 'destructive' });
    }
  };

  // Save one or more health fields to DB.
  const saveHealthFields = async (fields: Partial<Record<'weight_kg' | 'allergies' | 'conditions' | 'medication' | 'diet' | 'health_status', string | number | null>>) => {
    if (!dog?.id) return;
    setHealthSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: upErr } = await (supabase as unknown as {
        from: (t: string) => {
          update: (vals: Record<string, unknown>) => {
            eq: (col: string, val: string) => {
              eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
            };
          };
        };
      })
        .from('dogs')
        .update(fields)
        .eq('id', dog.id)
        .eq('user_id', user.id);
      if (upErr) throw new Error(upErr.message);
      toast({ title: t('pack.dog.toastSaved') });
    } catch (err) {
      toast({
        title: t('pack.dog.toastCouldNotSave'),
        description: err instanceof Error ? err.message : t('pack.dog.toastUnknownError'),
        variant: 'destructive',
      });
    } finally {
      setHealthSaving(false);
    }
  };

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
          'id, user_id, dog_name, cloudinary_main_url, cloudinary_extras, pdf_cert_url, pdf_vertical_url, pdf_horizontal_url, heroglyph_code, breed, country, birth_year, life_status, death_date, patron_svg, patron_svg2, selections, grid_message, created_at, stripe_session_id, pack_number, owner_name, weight_kg, health_status, allergies, conditions, medication, diet',
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
      // Populate health fields from DB
      if (mounted) {
        setWeightKgDb(data.weight_kg != null ? String(data.weight_kg) : '');
        setAllergiesDb(data.allergies ?? '');
        setConditionsDb(data.conditions ?? '');
        setMedicationDb(data.medication ?? '');
        setDietDb(data.diet ?? '');
        // Pre-fill healthStatus from DB if set
        if (data.health_status) {
          const validKeys: HealthKey[] = HEALTH_KEYS;
          if (validKeys.includes(data.health_status as HealthKey)) {
            setHealthStatus(data.health_status as HealthKey);
          }
        }
      }
      setStatus('ready');

      // Check if today's prayer is already logged (lock the block if so).
      const todayUTC = new Date().toISOString().slice(0, 10);
      const idemKey = `prayer:${id}:${todayUTC}`;
      const { data: existingPrayer } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              maybeSingle: () => Promise<{ data: { points?: number } | null }>;
            };
          };
        };
      })
        .from('devotion_events')
        .select('points')
        .eq('idem_key', idemKey)
        .maybeSingle();
      if (mounted && existingPrayer) {
        setPrayersSubmitted(true);
        setPrayerLockedPoints(existingPrayer.points ?? null);
      }

      // pack_number is stored directly on dogs row (set by seal_pack_number at payment).
      if (mounted && data.pack_number != null) setPackNumber(data.pack_number);
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

  // Ten istý dátum v jazyku používateľa — pre tooltip „V Dogypte od…". `issuedDate`
  // vyššie ostáva en-GB zámerne: ide na CERTIFIKÁT, a ten je anglický dokument.
  const issuedDateLocal = useMemo(() => {
    if (!dog?.created_at) return '';
    try {
      return new Date(dog.created_at).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: upErr } = await (supabase as unknown as {
        from: (t: string) => {
          update: (vals: { grid_message: string | null }) => {
            eq: (col: string, val: string) => {
              eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
            };
          };
        };
      })
        .from('dogs')
        .update({ grid_message: next || null })
        .eq('id', dog.id)
        .eq('user_id', user.id);
      if (upErr) throw new Error(upErr.message);
      setDog({ ...dog, grid_message: next || null });
      setMessageDirty(false);
      setWallOpen(false);
      toast({ title: t('pack.dog.toastMessageSaved'), description: t('pack.dog.toastMessageSavedDesc') });
    } catch (err) {
      toast({
        title: t('pack.dog.toastCouldNotSave'),
        description: err instanceof Error ? err.message : t('pack.dog.toastUnknownError'),
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: upErr } = await (supabase as unknown as {
        from: (t: string) => {
          update: (vals: { cloudinary_extras: string[] }) => {
            eq: (col: string, val: string) => {
              eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
            };
          };
        };
      })
        .from('dogs')
        .update({ cloudinary_extras: next })
        .eq('id', dog.id)
        .eq('user_id', user.id);
      if (upErr) throw new Error(upErr.message);
      setExtras(next);
      toast({ title: t('pack.dog.toastPhotoAdded') });
    } catch (err) {
      toast({
        title: t('pack.dog.toastUploadFailed'),
        description: err instanceof Error ? err.message : t('pack.dog.toastUnknownError'),
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: upErr } = await (supabase as unknown as {
        from: (t: string) => {
          update: (vals: { cloudinary_extras: string[] }) => {
            eq: (col: string, val: string) => {
              eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
            };
          };
        };
      })
        .from('dogs')
        .update({ cloudinary_extras: next })
        .eq('id', dog.id)
        .eq('user_id', user.id);
      if (upErr) throw new Error(upErr.message);
      setExtras(next);
    } catch (err) {
      toast({
        title: t('pack.dog.toastCouldNotRemove'),
        description: err instanceof Error ? err.message : t('pack.dog.toastUnknownError'),
        variant: 'destructive',
      });
    }
  };

  const handleChangeMainPhoto = () => mainPhotoInputRef.current?.click();

  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !dog?.id) return;
    setUploadingMain(true);
    try {
      const sessionFolder = dog.stripe_session_id || dog.id;
      const result = await uploadExtraPhoto(file, sessionFolder, 0);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: upErr } = await (supabase as unknown as {
        from: (t: string) => {
          update: (vals: { cloudinary_main_url: string }) => {
            eq: (col: string, val: string) => {
              eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
            };
          };
        };
      })
        .from('dogs')
        .update({ cloudinary_main_url: result.secureUrl })
        .eq('id', dog.id)
        .eq('user_id', user.id);
      if (upErr) throw new Error(upErr.message);
      setDog({ ...dog, cloudinary_main_url: result.secureUrl });
      useDogyptStore.getState().setDogPhotoUrl(result.secureUrl);
      toast({ title: t('pack.dog.toastPhotoUpdated'), description: t('pack.dog.toastPhotoUpdatedDesc') });
      // The photo is baked into the certificate PDF and the share card, and /dog
      // renders the share card as its image + og:image. Without this the swap
      // would only change the avatar in /pack while the whole outside world kept
      // seeing the old dog. generate-pdfs re-bakes both, server-side.
      void handleRegenerate();
    } catch (err) {
      toast({
        title: t('pack.dog.toastUploadFailed'),
        description: err instanceof Error ? err.message : t('pack.dog.toastUnknownError'),
        variant: 'destructive',
      });
    } finally {
      setUploadingMain(false);
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
      // Functional update: a photo swap calls this straight after its own
      // setDog, so `dog` in this closure is still the pre-swap row — spreading
      // it would put the old photo back on screen.
      setDog((prev) => (prev ? {
        ...prev,
        pdf_cert_url: urls.cert ?? prev.pdf_cert_url,
        pdf_vertical_url: urls.vertical ?? prev.pdf_vertical_url,
        pdf_horizontal_url: urls.horizontal ?? prev.pdf_horizontal_url,
      } : prev));
      toast({ title: t('pack.dog.toastCertReady'), description: t('pack.dog.toastCertReadyDesc') });
    } catch (err) {
      toast({
        title: t('pack.dog.toastCouldNotGenerate'),
        description: err instanceof Error ? err.message : t('pack.dog.toastUnknownError'),
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
      // resend-magic-link generates a fresh link server-side and emails it to the
      // buyer on file (rate-limited 5/h per dog). The previous send-certificate
      // call ({dogId, force}) was a silent no-op — that function ignores payloads
      // without an email field and its email path is internal-only since v22.
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      const res = await fetch(`${EDGE_BASE}/resend-magic-link`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ dogId: dog.id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({ title: t('pack.dog.toastEmailResent'), description: t('pack.dog.toastEmailResentDesc') });
    } catch (err) {
      toast({
        title: t('pack.dog.toastCouldNotResend'),
        description: err instanceof Error ? err.message : t('pack.dog.toastUnknownError'),
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
            {t('pack.dog.loading')}
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

  const dogName = dog.dog_name || t('pack.dog.unnamed');
  const ownerName = dog.owner_name || '';
  const heroglyphCode = dog.heroglyph_code || 'H-XX-XX-XX-XX-XX-XX-XX-XX-XX-XX-XX';
  // FIX9 Memorial: deceased pes → vek zamrzne ku dňu úmrtia (frozen "Lived his best
  // life · N days"), a druhé, živé počítadlo ráta dni v anjelskej podobe (death → dnes).
  const isDeceased = dog.life_status === 'deceased';
  const deathDate = dog.death_date ? new Date(dog.death_date) : null;
  // Deceased bez zapísaného dátumu úmrtia (majiteľ ešte nedoplnil) — asOf by bez tejto
  // poistky spadol na `undefined` = počíta sa k dnešku a "Lived his best life" počítadlo
  // by majiteľovi rástlo deň čo deň, akoby pes stále žil. Radšej vek vôbec nezobraziť.
  const awaitingDeathDate = isDeceased && !deathDate;
  const age = awaitingDeathDate
    ? null
    : computeAge(dog.selections, dog.birth_year, isDeceased && deathDate ? deathDate : undefined);
  const angelDays = deathDate
    ? Math.max(0, Math.floor((Date.now() - deathDate.getTime()) / 86_400_000))
    : null;
  const deathDateLabel = deathDate
    ? deathDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const WALK_LEVELS = getWalkLevels(t);

  // Daily-prayers header + provisional points (placeholder; rolls up to stats later).
  const todayLabel = new Date()
    .toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase();
  const walkPts = walkHours !== null ? walkPointsFor(walkHours) : 0;
  const todayPoints = (presenceDone ? 3 : 0) + walkPts;

  // Birthday for the STATS calendar markers (real birthday + 6 human-year birthdays).
  const sel = (dog.selections ?? {}) as Record<string, unknown>;
  const birthMonth = Number(sel.birthdayMonth) || null;
  const birthDay = Number(sel.birthdayDay) || null;
  const birthYear = Number(sel.birthdayYear) || dog.birth_year || null;

  // PLEMENO · NARODENIE · POHLAVIE (13.8.2026). Tieto tri sa dovtedy vypočítali a NIKDE
  // sa nevykreslili — `breed` aj `birthDateLabel` boli mŕtve premenné po zrušenom
  // zdravotnom prehľade. Doklad psa bez nich neobstojí: veterinár sa pýta práve na ne.
  // Nejdú cez kvíz, sedia v `dogs`/`selections` od kúpy heroglyfu (plemeno je zapečené
  // v samotnom glyfe) — preto sa na doklad posielajú ako read-only `FixedRow`.
  const breed = (dog.breed || (typeof sel.breed === 'string' ? sel.breed : '') || '').trim();
  const birthDateLabel =
    birthYear && birthMonth && birthDay
      ? new Date(birthYear, birthMonth - 1, birthDay).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : birthYear
        ? String(birthYear)
        : null;

  // Pronouns — derived from dog gender (king=he / queen=she); neutral they/their
  // when unknown. dogGender values: 'king' | 'queen' (see heroglyphSymbols).
  const dogGender = typeof sel.dogGender === 'string' ? sel.dogGender : '';
  const P =
    dogGender === 'queen'
      ? { subj: 'she', poss: 'her' }
      : dogGender === 'king'
        ? { subj: 'he', poss: 'his' }
        : { subj: 'they', poss: 'their' };
  const Poss = P.poss.charAt(0).toUpperCase() + P.poss.slice(1); // sentence-start

  // Vlajka — rovnaká ako na GRIDE (flagcdn ISO2 krúžok), default SK.
  const origin = dog.country || (typeof sel.country === 'string' ? sel.country : '');
  const flagIso = countryISO2(origin) || 'sk';
  // w160 (nie w40) — 28px krúžok na retine potrebuje 2–3× hustotu, inak rozmazané.
  const dogFlagUrl = flagUrl(flagIso, 160);

  // Read-only riadky navrch IDENTITY. `null` = údaj chýba → doklad ukáže TLMENÚ pomlčku,
  // nie červenú: červená znamená „doplň to", a tieto sa doplniť nedajú (heroglyph dáta).
  const fixedIdentityRows: Record<string, FixedRow[]> = {
    identity: [
      { i18n: 'pack.dog.rowBreed', labelEN: 'Breed', value: breed ? capWords(breed) : null },
      { i18n: 'pack.dog.rowBorn', labelEN: 'Born', value: birthDateLabel },
      {
        i18n: 'pack.dog.rowSex',
        labelEN: 'Sex',
        value: dogGender === 'queen'
          ? tx('pack.dog.sexFemale', 'Female')
          : dogGender === 'king'
            ? tx('pack.dog.sexMale', 'Male')
            : null,
      },
    ],
  };

  return (
    <PackLayout wide>
      {/* PackDogWizard vypnutý úplne (Matej, 2026-08-03) — NIE DEV gate, lebo tento
          render beží aj mimo DEV-only vetvy (na rozdiel od PackWizard v Pack.tsx:276) a
          členovia z okna 17.–22.6.2026 môžu mať v localStorage `dogypt_wz==='2'`, čo by
          ho spustilo aj v produkcii. Sľuboval krok "Prayer of Presence" a spotlight na
          #prayers — obe sú na LIVE zamknuté/neexistujúce. Kód nechaný nedotknutý pre
          prípadný návrat: odkomentuj, až keď bude Prayer of Presence flow reálne live. */}
      {/* <PackDogWizard /> */}
      {/* Späť do MY PACK — jediná vec, ktorá v tomto riadku zostala (Matej 6.8.:
          „pri kliknutí na psa by mala byť hore šípka dozadu na /dogs nie? dáva mi to
          celkom zmysel"). Mieri na `/pack/dogs`, nie na `/pack`: k psovi sa chodí z hubu.
          12.8.2026: z textového odkazu vľavo sa stala HOLÁ ŠÍPKA V STREDE NAD BLOKOM —
          rovnaký tvar ako `.tl-back` v PackTriplist (TRIPSTATS), aby mal `/pack` jeden
          spôsob návratu. Kruh má vlastné tmavé pozadie, lebo leží MIMO bledej karty.
          ZMAZANÉ 6.8.: odkaz „POZRI NA WALL #<n>" (Matej: „daj to celkom preč mne to tam
          nedáva zmysel"). */}
      <div className="did-backrow">
        <Link to="/pack/dogs" className="did-back" aria-label={t('pack.tree.title')}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-5 md:gap-6">

        {/* DOG ID — JEDNA KARTA (Matej 2026-08-12: „bude to len jedna karta, 1 blok
            podobajúci sa na ID"). Predtým to boli DVA bloky pod sebou: identita
            (fotka v strede) + pas (DogPassport s vlastným rámom). Doklad má jeden
            rám, jednu hlavičku a jedno sériové číslo — preto sa zlúčili a fotka
            išla DOĽAVA, ako na občianskom. Poradie čítania: kto (foto) → meno a
            stav → heroglyf → QR → údaje. */}
        <div className="grid grid-cols-1 gap-5 md:gap-6 items-stretch">

          <section
            className="did-card"
            style={{
              background: T.cardGrad,
              border: `1.5px solid ${T.cardEdge}`,
              borderRadius: 16,
              padding: '18px 20px 22px',
              boxShadow: T.cardShadow,
            }}
          >
            {/* Pilulky doklade sú TIE ISTÉ ako na homepage/profile — DNA je v matrici,
                nie tu. PILL_CSS musí stáť PRED DOGID_CSS, aby ho typografia pilulky
                nižšie prebila (rovnaká špecificita, rozhoduje poradie). */}
            <style>{PILL_CSS}</style>
            <style>{DOGID_CSS}</style>

            {/* Identitná zóna je vlastný `relative` obal — dokumentový panel
                (profileOpen) sa prekrýva LEN cez ňu. Keby ostal na `<section>`,
                po zlúčení s pasom by prekryl celý dokument (aj 1500 px údajov). */}
            <div className="did-idzone">

            {/* FRONT — identity (always rendered; defines the block height) */}
            <div className="did-front">

            {/* — Ikony v rohoch (Lost · Dokumenty) — */}
            <div className="absolute flex items-center gap-2" style={{ top: 4, left: 4, zIndex: 4 }}>
              {/* FIX9: deceased pes sa nestráca — schovaj "Report lost dog" ikonu. */}
              {!isDeceased && (
                <IconBtn
                  icon={<BrandIcon name="alert" size={16} tint="danger" />}
                  label={t('pack.dog.lostDogTooltip')}
                  tooltipSide="right"
                  soon
                  danger
                />
              )}
            </div>
            <div className="absolute flex items-center gap-2" style={{ top: 4, right: 4, zIndex: 4 }}>
              <IconBtn
                icon={<BrandIcon name="document" size={16} tint="gold" />}
                label={t('pack.dog.profileDocumentsTooltip')}
                active={profileOpen}
                onClick={() => setProfileOpen((v) => !v)}
              />
            </div>

            {/* CENTROVANÁ OS ako na certifikáte (Matej 12.8.: „skúsme to teda predsa
                len centrovať podobne ako je to na certifikáte"). Fotka je KRUH —
                obdĺžnikový pokus bol chyba, ktorú si nikto neobjednal. */}
            <div className="did-stack">

            <div className="did-head">
              <span className="pk-pill did-idpill">{tx('pack.dog.idTitle', 'DOG ID')}</span>
            </div>

            {/* Foto — kruh, zlatý prsteň; hover (PC) / tap (mobile) = zmena, ako avatar majiteľa */}
            <button
              type="button"
              onClick={handleChangeMainPhoto}
              disabled={uploadingMain}
              aria-label={t('pack.dog.ariaChangePhoto')}
              className="did-photoframe group"
              style={{ cursor: uploadingMain ? 'progress' : 'pointer' }}
            >
              {dog.cloudinary_main_url ? (
                <img src={dog.cloudinary_main_url} alt={dogName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <div
                  className="flex items-center justify-center h-full"
                  style={{ color: T.inkFaint, fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.2em' }}
                >
                  {t('pack.dog.noPhoto')}
                </div>
              )}
              <span
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(10,10,10,0.55)', color: T.card, borderRadius: '50%' }}
              >
                {uploadingMain ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              </span>
            </button>
            <input
              ref={mainPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleMainPhotoChange}
              style={{ display: 'none' }}
            />

            {/* Meno + pulzujúca „alive" bodka vľavo (FIX9: deceased → statický anjelský znak, žiadny pulz) */}
            <div className="did-main">
              <div className="flex items-center justify-center" style={{ gap: 10 }}>
                {isDeceased ? <AngelDot /> : <AliveDot />}
                <h1 className="did-name">{dogName}</h1>
              </div>

              {/* Čipy: číslo · vlajka (krúžok ako na GRIDE) · Health.
                  Vlajka — bez badge rámu. Emoji fallback: flagcdn je cudzí CDN a nie
                  je dostupný všade (Gmail in-app browser, 2026-07-26 → namiesto
                  vlajky sa kreslil iOS „?"). Bez fallbacku ostane po zlyhaní tmavý
                  štvorec s otáznikom, čo vyzerá ako rozbitá stránka. */}
              <div className="did-chips">
                {/* Poradové číslo psa — pilulka PRED vlajkou (Matej 13.8.2026). Hore
                    v hlavičke ostáva len názov dokumentu. Dátum vstupu do DOGYPTU visí
                    na tejto pilulke ako tooltip: číslo aj dátum odpovedajú na to isté
                    („odkedy je pes v Dogypte"), takže patria k sebe, nie pod nadpis. */}
                <NumberPill number={certNumber} since={issuedDateLocal} />
                <FlagCircle
                  src={dogFlagUrl}
                  iso2={flagIso}
                  label={origin || t('pack.dog.defaultCountry')}
                />
                {/* Health — FIX9: deceased pes = needitovateľný memoriálny čip, žiadny dropdown.
                    Obal s pevnou šírkou je nutný: HealthBadge má vnútri `w-full` (dedičstvo po
                    starom rade, kde bol v grid stĺpci `1fr`) a bez obalu by v čipovom rade
                    roztiahol zelený pruh cez celý stredný stĺpec. */}
                <div className="did-health">
                {isDeceased ? <InLovingMemoryBadge /> : (
                  <HealthBadge
                    status={healthStatus}
                    open={healthOpen}
                    onToggle={() => setHealthOpen((v) => !v)}
                    onSelect={(k) => {
                      setHealthStatus(k);
                      setHealthOpen(false);
                      void saveHealthFields({ health_status: k });
                    }}
                  />
                )}
                </div>
              </div>
            </div>

            {/* Heroglyf — čierny, na šírku stredného stĺpca */}
            <div className="did-glyph">
              <HeroglyphFrame
                showOwner
                style={{ width: '100%', maxWidth: '100%', height: 'auto', color: T.ink } as React.CSSProperties}
              />
            </div>

            {/* QR ODLOŽENÉ 12.8.2026 (Matej: „zatial to dajme bez QR"). Zámer aj cieľová
                URL sú popísané v pamäti `project_dogypt_dogid_karta_2026-08-12` — mierilo
                to na verejnú `/dog/<slug>?ref=<pack>`, ktorá existuje a sama zbiera
                referral. Dep `qrcode.react` ostáva v package.json pre návrat. */}

            {/* "Living my best life" — hlavný údaj = dni (badge, podčiarknuté); roky+ľudské roky v tooltipe (hover PC / tap mobile).
                FIX9: deceased pes → zmrazené "Lived his best life" + živé "In angel form" počítadlo. */}
            <div className="did-meta">
            {isDeceased ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                  {age && (
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                      <span
                        className="inline-flex items-center gap-1.5"
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim }}
                      >
                        <Sparkles className="h-3 w-3" style={{ color: T.accentGold }} />
                        {t('pack.dog.livedBestLife', { poss: P.poss })}
                      </span>
                      <BestLifeBadge age={age} />
                    </div>
                  )}
                  {angelDays !== null && (
                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                      <span
                        className="inline-flex items-center gap-1.5"
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim }}
                      >
                        🕊 {t('pack.dog.inAngelForm')}
                      </span>
                      <AngelBadge days={angelDays} sinceLabel={deathDateLabel} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                {age ? (
                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim }}
                    >
                      <Sparkles className="h-3 w-3" style={{ color: T.accentGold }} />
                      {t('pack.dog.livingBestLife')}
                    </span>
                    <BestLifeBadge age={age} />
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: T.inkDim }}>
                    {t('pack.dog.birthdayUnknown')}
                  </div>
                )}
              </div>
            )}
            </div>
            {/* /did-meta */}

            </div>
            {/* /did-stack */}

            </div>
            {/* /did-front */}

            {/* BACK — documents + Wall word; absolute overlay = block keeps its height */}
            {profileOpen && (
            <div
              className="flex flex-col text-left"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 6,
                background: T.cardGrad,
                borderRadius: 16,
                padding: 18,
                overflowY: 'visible',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <SectionHeading icon={<BrandIcon name="document" size={12} tint="gold" />} label={t('pack.dog.profileDocuments')} inline />
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  aria-label={t('pack.dog.ariaBackToProfile')}
                  className="inline-flex items-center justify-center"
                  style={{ width: 28, height: 28, borderRadius: 10, background: T.tileBg, border: `1px solid ${T.border}`, color: T.ink, cursor: 'pointer' }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Documents — first (header above already says it) */}
              <div className="flex flex-col gap-2">
                <DownloadButton label={t('pack.dog.docCertificate')} href={dog.pdf_cert_url} filename={`${dogName}-certificate.pdf`} primary />
                <div className="grid grid-cols-2 gap-2">
                  <DownloadButton label={t('pack.dog.docVertical')} href={dog.pdf_vertical_url} filename={`${dogName}-vertical.pdf`} />
                  <DownloadButton label={t('pack.dog.docHorizontal')} href={dog.pdf_horizontal_url} filename={`${dogName}-horizontal.pdf`} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCert((v) => !v)}
                className="inline-flex items-center justify-center gap-2 w-full"
                style={{
                  marginTop: 8,
                  background: 'rgba(201, 154, 63, 0.07)',
                  border: '1px solid rgba(201, 154, 63, 0.30)',
                  padding: '8px 12px',
                  borderRadius: 10,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 9.5,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: T.ink,
                  cursor: 'pointer',
                }}
              >
                <BrandIcon name="document" size={12} tint="gold" />
                {showCert ? t('pack.dog.hideCertificate') : t('pack.dog.viewCertificate')}
                <ChevronDown
                  className="h-3.5 w-3.5"
                  style={{ color: T.accentGold, transform: showCert ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
              </button>
              {showCert && (
                <div
                  className="relative w-full mx-auto overflow-hidden"
                  style={{ marginTop: 12, aspectRatio: '1080 / 1527', maxWidth: 230, borderRadius: 12, border: `1px solid ${T.hairline}` }}
                >
                  <div
                    style={{ position: 'absolute', inset: 0, transformOrigin: 'top left', width: 1080, height: 1527 }}
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
              {(() => {
                const hasPdfs = !!(dog.pdf_cert_url && dog.pdf_vertical_url && dog.pdf_horizontal_url);
                return (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="inline-flex items-center justify-center gap-2 w-full"
                    style={{
                      marginTop: 8,
                      background: 'transparent',
                      border: 'none',
                      fontFamily: "'Cinzel', serif",
                      fontSize: 8.5,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: hasPdfs ? T.inkFaint : T.accentGold,
                      cursor: regenerating ? 'progress' : 'pointer',
                      opacity: regenerating ? 0.6 : 1,
                    }}
                  >
                    {regenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {regenerating ? t('pack.dog.generating') : hasPdfs ? t('pack.dog.regeneratePdfs') : t('pack.dog.generatePdfs')}
                  </button>
                );
              })()}

              {/* A word on the Wall — trigger opens a popup so the panel never scrolls */}
              <button
                type="button"
                onClick={() => setWallOpen(true)}
                className="inline-flex items-center justify-center gap-2 w-full"
                style={{
                  marginTop: 14,
                  background: 'rgba(201, 154, 63, 0.07)',
                  border: '1px solid rgba(201, 154, 63, 0.30)',
                  padding: '8px 12px',
                  borderRadius: 10,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 9.5,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: T.ink,
                  cursor: 'pointer',
                }}
              >
                <BrandIcon name="heartpaw" size={12} tint="gold" />
                {t('pack.dog.wordOnWall')}
              </button>

              {/* Memorial — decisive, clearly actionable, last in the panel. Never on the
                  front of a living dog's card (FIX9 polish); lives here behind a hairline divider. */}
              <div style={{ marginTop: 10, paddingTop: 12, borderTop: `1px solid ${T.hairline}` }}>
                <button
                  type="button"
                  onClick={() => {
                    setMemorialStep(isDeceased ? 'date' : 'confirm');
                    setMemorialOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 w-full"
                  style={{
                    background: T.ink,
                    color: T.card,
                    border: 'none',
                    padding: '9px 14px',
                    borderRadius: 10,
                    fontFamily: "'Cinzel', serif",
                    fontSize: 9.5,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  🕊{' '}
                  {isDeceased
                    ? awaitingDeathDate
                      ? t('pack.dog.memorial.addDate', { name: dogName })
                      : t('pack.dog.memorial.editDate')
                    : t('pack.dog.memorial.markLink')}
                </button>
              </div>
            </div>
            )}
            </div>
            {/* /did-idzone */}

            {/* ÚDAJE — ten istý doklad, druhá polovica. `bare` = DogPassport
                nekreslí vlastný rám; rám je jeden, tento. Zlatá vyblednutá čiara
                (T.rule) je predpísaný oddeľovač vnútri bledej karty. */}
            {DEV_FULL && (
              <>
                <div className="did-rule" />
                <DogPassport
                  dogId={dog.id}
                  bare
                  fixedRows={fixedIdentityRows}
                  onEditPanel={(p) => { if (p === 'will') setWillOpen(true); }}
                />
              </>
            )}
          </section>

          {/* ZÁVET — panel nad dokladom. Otvára ho ✎ pri bloku ZÁVET, jeho červené
              pomlčky aj tlačidlo v zdieľacom rade. */}
          {willOpen && (
            <WillPanel dogId={dog.id} dogName={dogName} onClose={() => setWillOpen(false)} />
          )}

          {/* Wall word popup — writing/saving the Wall message off the card, so the
              back panel stays short and never scrolls (Matej 2026-07-07). */}
          {wallOpen && (
            <div
              className="fixed inset-0 flex items-center justify-center"
              style={{ zIndex: 50, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
              onClick={() => setWallOpen(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: T.panelGrad,
                  border: `1.5px solid ${T.cardEdge}`,
                  borderRadius: 14,
                  padding: '24px 22px',
                  maxWidth: 360,
                  width: '90vw',
                  boxShadow: T.panelShadow,
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <SectionHeading icon={<BrandIcon name="heartpaw" size={12} tint="gold" />} label={t('pack.dog.wordOnWall')} inline />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: T.inkDim }}>
                    {messageDraft.length}/{MESSAGE_MAX}
                  </span>
                </div>
                <textarea
                  value={messageDraft}
                  onChange={(e) => {
                    setMessageDraft(e.target.value.slice(0, MESSAGE_MAX));
                    setMessageDirty(true);
                  }}
                  placeholder={isDeceased ? t('pack.dog.wallPlaceholderMemorial', { poss: P.poss }) : t('pack.dog.wallPlaceholder')}
                  rows={5}
                  autoFocus
                  style={{
                    minHeight: 110,
                    width: '100%',
                    background: T.bg,
                    border: `1px solid ${T.hairline}`,
                    borderRadius: 10,
                    padding: 11,
                    color: T.ink,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 13,
                    lineHeight: 1.45,
                    resize: 'none',
                    outline: 'none',
                  }}
                />
                <div className="mt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setWallOpen(false)}
                    disabled={messageSaving}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 10,
                      background: 'transparent',
                      border: `1px solid ${T.hairline}`,
                      color: T.inkDim,
                      fontFamily: "'Cinzel', serif",
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      cursor: messageSaving ? 'default' : 'pointer',
                    }}
                  >
                    {t('pack.dog.memorial.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMessage}
                    disabled={!messageDirty || messageSaving}
                    className="inline-flex items-center gap-2"
                    style={{
                      background: messageDirty ? T.ink : 'transparent',
                      color: messageDirty ? T.card : T.inkFaint,
                      border: messageDirty ? 'none' : `1px solid ${T.hairline}`,
                      padding: '9px 18px',
                      borderRadius: 10,
                      fontFamily: "'Cinzel', serif",
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      cursor: messageDirty ? 'pointer' : 'default',
                      opacity: messageSaving ? 0.6 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {messageSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    {messageSaving ? t('pack.dog.saving') : t('pack.dog.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <MemorialControl
            dogId={dog.id}
            dogName={dogName}
            isDeceased={isDeceased}
            deathDate={dog.death_date ?? null}
            birthYear={dog.birth_year}
            poss={P.poss}
            open={memorialOpen}
            initialStep={memorialStep}
            onClose={() => setMemorialOpen(false)}
            onSaved={(iso) => setDog((prev) => (prev ? { ...prev, life_status: 'deceased', death_date: iso } : prev))}
          />

          {/* MODLITBOVÝ PANEL ODIŠIEL 2026-08-06 (zadanie-mypack-petpas §2/12 a §7):
              denný rituál patrí na homepage `/pack`, karta psa je odteraz PET PAS = VÝSTUP.
              Kód sa NEZMAZAL — žije 1:1 v `components/pack/DailyPrayers.tsx` a mountuje sa
              v `Pack.tsx`. Sem sa má raz vrátiť len VÝSLEDOK (streak), nie ovládanie. */}

        </div>


        {/* HUB DLAŽDICE (Zdravie / Výcvik / Denník) A ICH TRI PANELY ODIŠLI 2026-08-06
            (zadanie-mypack-petpas §7). Boli to VSTUPNÉ formuláre na stránke, ktorá je výstup —
            presne tá zmes, ktorá pri viacerých psoch prestala fungovať („bohatá stránka psa…
            lebo som nemyslel na to, že pri viacerých psoch by to bola smrť", Matej 6.8.).
            Vstup je teraz v MY PACK (`/pack/dogs`) ako dlaždice kvízov; tu sa už len číta. */}

        {/* ⚠️ ZA `DEV_FULL` (2026-08-06): táto routa `/pack/dogs/:id` NIE JE gatovaná — chodí sem
            každý platiaci člen. Pas ale plnia kvízy v `/pack/dogs`, a tie za flagom SÚ. Bez tejto
            podmienky by člen dostal prázdnu kartu „Nothing filled in yet" so štyrmi vypnutými
            share tlačidlami a nemal by ako ju naplniť — horšie než keby tam nebola.
            Odstrániť SPOLU s odomknutím hubu, nie skôr.
            12.8.2026: pas sa presunul DOVNÚTRA karty vyššie (jedna karta = jedno ID),
            gate ostal na tom istom mieste v strome, len o pár riadkov vyššie. */}

        {/* ČLENSKÁ VETVA — tri „čoskoro" dlaždice, presne ako pred 6.8.2026.
            Sú tu preto, že pas o riadok vyššie je za flagom: bez nich by členovi na
            `/pack/dogs/:id` zostal len blok identity a stránka by sa skončila — dostal by
            ODOBRATIE (zmizli mu dlaždice) bez PRIDANIA (pas nevidí). Panely pod nimi sa
            NEVRACAJÚ, vstup je natrvalo v MY PACK; toto je len sľub, že tie tri veci existujú.
            Modlitbová coming-soon karta sa zámerne NEVRACIA — tá funkcia je zrušená
            („zatial celkom preč"), a sľubovať zrušené je horšie než nesľubovať nič.
            ZMAZAŤ celý tento blok pri odomknutí hubu členom. */}
        {!DEV_FULL && (
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <HubTile icon="heartpaw" label={t('pack.dog.tileHealth')} sub={t('pack.dog.tileHealthSub')} soon />
            <HubTile icon="trophy" label={t('pack.dog.tileTraining')} sub={t('pack.dog.tileTrainingSub')} soon />
            <HubTile icon="feather" label={t('pack.dog.tileJournal')} sub={t('pack.dog.tileJournalSub')} soon />
          </div>
        )}


        {/* ŠTATISTIKY (ročný kalendár) PRESUNUTÉ 6.8.2026 do MY PACK (`/pack/dogs`) ako
            posledný blok — Matej: „premiestni STATS do /DOGS ako posledné (coming soon)".
            Kalendár je o rytme MAJITEĽA, nie o údajoch psa; na pet pase nemal čo robiť.
            Komponent: `components/pack/DogStats.tsx`. */}

        {/* TLAČIDLO „ODOSLAŤ E-MAIL ZNOVA" ZMAZANÉ 6.8.2026 (Matej: „daj to celkom preč
            mne to tam nedáva zmysel"). Volalo `resend-magic-link` — poslalo kupujúcemu
            nový prihlasovací odkaz. Je to vec ÚČTU, nie psa: kto je prihlásený a číta
            túto stránku, prihlasovací odkaz už nepotrebuje. Ak sa raz vráti, patrí do
            `/pack/profile` k účtu. Handler `handleResend` ostáva v súbore nevyužitý.
            Bonus dôvod: tlačidlo malo `color: T.ink` (papyrusová čierna) na TMAVOM
            pozadí stránky, takže bolo aj tak fakticky neviditeľné. */}

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

function getStatLegend(t: ReturnType<typeof useT>) {
  return [
    { label: t('pack.dog.legendTrip'), desc: t('pack.dog.legendTripDesc'), color: '#2E7D4F', icon: 'forest' },
    { label: t('pack.dog.legendWalk'), desc: t('pack.dog.legendWalkDesc'), color: '#7FB04A', icon: 'paw' },
    { label: t('pack.dog.legendStroll'), desc: t('pack.dog.legendStrollDesc'), color: '#E6B23A', icon: 'walk' },
    { label: t('pack.dog.legendVet'), desc: t('pack.dog.legendVetDesc'), color: '#3B82C4', icon: 'vet' },
    { label: t('pack.dog.legendBirthday'), desc: t('pack.dog.legendBirthdayDesc'), color: '#8B5CF6', icon: 'star' },
    { label: t('pack.dog.legendHumanYear'), desc: t('pack.dog.legendHumanYearDesc'), color: '#EC6FA6', icon: 'sun' },
  ];
}

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

function getStatMonths(t: ReturnType<typeof useT>): [string, number][] {
  return [
    [t('pack.dog.monthJan'), 31], [t('pack.dog.monthFeb'), 28], [t('pack.dog.monthMar'), 31],
    [t('pack.dog.monthApr'), 30], [t('pack.dog.monthMay'), 31], [t('pack.dog.monthJun'), 30],
    [t('pack.dog.monthJul'), 31], [t('pack.dog.monthAug'), 31], [t('pack.dog.monthSep'), 30],
    [t('pack.dog.monthOct'), 31], [t('pack.dog.monthNov'), 30], [t('pack.dog.monthDec'), 31],
  ];
}

function StatsCalendar({ birthMonth, birthDay }: { birthMonth: number | null; birthDay: number | null }) {
  const t = useT();
  const STAT_MONTHS = getStatMonths(t);
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
  const t = useT();
  const STAT_LEGEND = getStatLegend(t);
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
        {t('pack.dog.legend')}
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
            {t('pack.dog.addActivity')}
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: T.inkFaint }}>
            {t('pack.dog.addActivityDesc')}
          </div>
        </div>
      </button>
    </div>
  );
}

// Poradové číslo + „v Dogypte od" v tooltipe (Matej 13.8.2026: „odkedy je pes v dogypte
// nebude viditeľné pod DOG ID nadpisom, ale pri prechode myšou na pils s číslom #").
// Tooltip má rovnakú mechaniku ako BestLifeBadge: hover na PC, tap na mobile — bez tapu
// by bol údaj na telefóne nedostupný.
function NumberPill({ number, since }: { number: string; since: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  if (!since) return <span className="pk-pill did-numpill">{number}</span>;
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="pk-pill pk-pill--tap did-numpill"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('pack.dog.inDogyptSince', { date: since })}
      >
        {number}
      </button>
      {open && (
        <span
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
            zIndex: 6,
          }}
        >
          {t('pack.dog.inDogyptSince', { date: since })}
        </span>
      )}
    </span>
  );
}

function BestLifeBadge({ age }: { age: DogAge }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex flex-col items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('pack.dog.ariaShowAgeDetail')}
        style={{
          padding: '5px 14px',
          borderRadius: 999,
          background: 'linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%)',
          color: '#3d1f00',
          fontFamily: "'Cinzel', serif",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.02em',
          cursor: 'pointer',
          boxShadow: '0 6px 16px -6px rgba(201, 154, 63, 0.6)',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
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
          {t('pack.dog.ageDetail', { years: String(age.years), months: String(age.months), days: String(age.days), humanYears: String(age.humanYears) })}
        </div>
      )}
    </div>
  );
}

// FIX9: živé počítadlo dní v anjelskej podobe (death → dnes). Strieborné, ráta ďalej.
function AngelBadge({ days, sinceLabel }: { days: number; sinceLabel: string | null }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex flex-col items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('pack.dog.inAngelForm')}
        style={{
          padding: '5px 14px',
          borderRadius: 999,
          background: 'linear-gradient(180deg, #F4F6FB 0%, #D9DEE8 100%)',
          color: '#3a4256',
          fontFamily: "'Cinzel', serif",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.02em',
          cursor: 'pointer',
          boxShadow: '0 6px 16px -6px rgba(120, 130, 150, 0.55)',
          border: '1px solid rgba(180,190,210,0.6)',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
        }}
      >
        {days.toLocaleString('en-US')} days
      </button>
      {open && sinceLabel && (
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
          {t('pack.dog.angelSince', { date: sinceLabel })}
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

// EditableHealthText — single-line text field that shows value (or placeholder) and
// enters edit mode on click; saves on blur or Enter.
function EditableHealthText({ value, placeholder, onSave }: { value: string; placeholder: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  // Sync when parent updates
  if (!editing && draft !== value) setDraft(value);
  return editing ? (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { setEditing(false); onSave(draft.trim()); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { setEditing(false); onSave(draft.trim()); }
        if (e.key === 'Escape') { setEditing(false); setDraft(value); }
      }}
      style={{
        width: '100%',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        color: T.ink,
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        padding: '2px 6px',
      }}
    />
  ) : (
    <button
      type="button"
      onClick={() => { setDraft(value); setEditing(true); }}
      className="inline-flex items-center gap-1.5 group"
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
    >
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: value ? T.ink : T.inkFaint }}>
        {value || placeholder}
      </span>
      <BrandIcon name="pencil" size={12} tint="gold" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// EditableCriticalChip — vet-critical field (allergies/conditions/medication) with inline edit.
function EditableCriticalChip({ lucide, label, value, placeholder, onSave }: { lucide: React.ReactNode; label: string; value: string; placeholder: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (!editing && draft !== value) setDraft(value);
  return (
    <div
      className="flex items-start gap-2.5"
      style={{ padding: '10px 12px', borderRadius: 10, background: T.tileBg, border: `1px solid ${T.border}` }}
    >
      <span style={{ color: T.accentGold, display: 'inline-flex', paddingTop: 2 }}>{lucide}</span>
      <div className="flex flex-col" style={{ gap: 1, minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 8.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: T.inkFaint,
          }}
        >
          {label}
        </span>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => { setEditing(false); onSave(draft.trim()); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { setEditing(false); onSave(draft.trim()); }
              if (e.key === 'Escape') { setEditing(false); setDraft(value); }
            }}
            style={{
              width: '100%',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12,
              color: T.ink,
              background: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: 5,
              padding: '2px 5px',
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => { setDraft(value); setEditing(true); }}
            className="inline-flex items-center gap-1 group"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: value ? T.inkDim : T.inkFaint }}>
              {value || placeholder}
            </span>
            <BrandIcon name="pencil" size={10} tint="gold" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
    </div>
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
// Walk picker buttons — h-value 0..5 (0 = under an hour, 5 = all-day). Same on
// every screen size, no slider.
function getWalkLevels(t: ReturnType<typeof useT>): { h: number; label: string }[] {
  return [
    { h: 0, label: t('pack.dog.walkLevelUnder1h') },
    { h: 1, label: t('pack.dog.walkLevel1h') },
    { h: 2, label: t('pack.dog.walkLevel2h') },
    { h: 3, label: t('pack.dog.walkLevel3h') },
    { h: 4, label: t('pack.dog.walkLevel4h') },
    { h: 5, label: t('pack.dog.walkLevelDay') },
  ];
}

// Purple→gold gradient — matches FounderInvite (brand milestone card).
const PRAYER_GRADIENT = 'var(--brand-gradient)';
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
  faded,
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
  faded?: boolean;
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
          opacity: disabled ? 0.82 : faded ? 0.55 : 1,
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

// ---------------------------------------------------------------------------
// HEALTH STATUS — meniteľný badge (v1 placeholder, neodosiela sa). Vízia cez
// vysvetlivku: liečitelia + AI outreach = severka fáza „1M+ First Aid".
// ---------------------------------------------------------------------------
// Kľúče + farby žijú v lib/dogHealth.ts — tie isté potrebuje svorka na `/pack`.
function getHealthOptions(t: ReturnType<typeof useT>): { key: HealthKey; label: string; color: string }[] {
  return HEALTH_KEYS.map((key) => ({ key, label: t(healthLabelKey(key)), color: HEALTH_COLORS[key] }));
}

function HealthBadge({
  status,
  open,
  onToggle,
  onSelect,
}: {
  status: HealthKey;
  open: boolean;
  onToggle: () => void;
  onSelect: (k: HealthKey) => void;
}) {
  const t = useT();
  const HEALTH_OPTIONS = getHealthOptions(t);
  const current = HEALTH_OPTIONS.find((o) => o.key === status) ?? HEALTH_OPTIONS[0];
  const isHealthy = status === 'healthy';
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-center gap-1.5"
        style={{
          height: 30,
          padding: '0 10px',
          borderRadius: 999,
          background: `${current.color}1F`,
          // 1.5px = tá istá hrúbka ako .pk-pill vedľa (číslo, vlajka). Pilulka mení
          // len výplň a farbu, nie hrúbku okraja — inak rad vyzerá nedbalo.
          border: `1.5px solid ${current.color}`,
          fontFamily: "'Cinzel', serif",
          fontSize: 9,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: current.color,
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {isHealthy ? <BrandIcon name="heart" size={12} tint="good" /> : <BrandIcon name="alert" size={12} tint="danger" />}
        {current.label}
        <ChevronDown
          className="h-3 w-3 shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {open && (
        <div
          className="absolute"
          style={{
            top: 'calc(100% + 8px)',
            right: 0,
            width: 250,
            zIndex: 20,
            background: T.panelGrad,
            border: `1.5px solid ${T.cardEdge}`,
            borderRadius: 14,
            padding: 12,
            boxShadow: T.panelShadow,
          }}
        >
          <div className="flex flex-col gap-1.5">
            {HEALTH_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => onSelect(o.key)}
                className="flex items-center gap-2.5 w-full"
                style={{
                  padding: '8px 10px',
                  borderRadius: 9,
                  background: o.key === status ? `${o.color}14` : 'transparent',
                  border: o.key === status ? `1px solid ${o.color}66` : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: o.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: T.ink }}>
                  {o.label}
                </span>
                {o.key === status && <Check className="h-3.5 w-3.5" style={{ marginLeft: 'auto', color: o.color }} />}
              </button>
            ))}
          </div>
          {/* Vízia — vysvetlivka (pozvánka, nie funkčné) */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.hairline}` }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, lineHeight: 1.5, color: T.inkDim }}>
              {t('pack.dog.healthVision')}
            </p>
            <span
              style={{
                display: 'inline-block',
                marginTop: 6,
                fontFamily: "'Cinzel', serif",
                fontSize: 8,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: T.inkFaint,
              }}
            >
              {t('pack.dog.visionNotLive')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// FIX9: static memorial chip — replaces HealthBadge (+ its dropdown) for a deceased
// dog. Same grid slot as HealthBadge, but needitovateľné; palette matches AngelBadge.
function InLovingMemoryBadge() {
  const t = useT();
  return (
    <div
      className="flex w-full items-center justify-center gap-1.5"
      style={{
        height: 30,
        padding: '0 10px',
        borderRadius: 999,
        background: 'linear-gradient(180deg, #F4F6FB 0%, #D9DEE8 100%)',
        border: '1.5px solid rgba(180,190,210,0.6)',
        fontFamily: "'Cinzel', serif",
        fontSize: 9,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontWeight: 700,
        color: '#3a4256',
        lineHeight: 1,
      }}
    >
      <span aria-hidden style={{ fontSize: 11, lineHeight: 1 }}>🕊</span>
      {t('pack.dog.inLovingMemory')}
    </div>
  );
}

// Pulzujúca svietiaca zelená bodka vľavo od mena = pes žije. Hover → odkaz.
function AliveDot() {
  const t = useT();
  const [hover, setHover] = useState(false);
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <style>{`@keyframes alive-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55), 0 0 7px 2px rgba(34,197,94,0.55); }
        50% { box-shadow: 0 0 0 5px rgba(34,197,94,0), 0 0 13px 4px rgba(34,197,94,0.85); }
      }`}</style>
      <span
        aria-label={t('pack.dog.ariaStillAlive')}
        style={{
          width: 11,
          height: 11,
          borderRadius: '50%',
          flexShrink: 0,
          background: 'radial-gradient(circle at 35% 30%, #7EF0AC 0%, #22C55E 70%)',
          animation: 'alive-pulse 2.4s ease-in-out infinite',
        }}
      />
      {hover && (
        <span
          className="absolute"
          style={{
            bottom: 'calc(100% + 9px)',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            zIndex: 8,
            background: T.ink,
            color: T.card,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            padding: '7px 12px',
            borderRadius: 9,
            boxShadow: '0 8px 24px rgba(10,10,10,0.28)',
          }}
        >
          {t('pack.dog.stillAliveTooltip')}
        </span>
      )}
    </span>
  );
}

// FIX9: static silver dove — replaces AliveDot for a deceased dog. Same size/position,
// no pulse (pulse = "alive"); palette matches AngelBadge.
function AngelDot() {
  const t = useT();
  const [hover, setHover] = useState(false);
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        role="img"
        aria-label={t('pack.dog.ariaInAngelForm')}
        style={{
          width: 11,
          height: 11,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          lineHeight: 1,
          background: 'radial-gradient(circle at 35% 30%, #F4F6FB 0%, #D9DEE8 70%)',
          boxShadow: '0 0 0 1px rgba(180,190,210,0.6)',
        }}
      >
        🕊
      </span>
      {hover && (
        <span
          className="absolute"
          style={{
            bottom: 'calc(100% + 9px)',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            zIndex: 8,
            background: T.ink,
            color: T.card,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            padding: '7px 12px',
            borderRadius: 9,
            boxShadow: '0 8px 24px rgba(10,10,10,0.28)',
          }}
        >
          {t('pack.dog.angelFormTooltip')}
        </span>
      )}
    </span>
  );
}

// Ikonové tlačítko v rohu bloku 1 (Document / Passport / Lost) + tooltip vľavo.
function IconBtn({
  icon,
  label,
  active,
  soon,
  danger,
  tooltipSide = 'left',
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  soon?: boolean;
  danger?: boolean;
  tooltipSide?: 'left' | 'right';
  onClick?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const clickable = !soon && !!onClick;
  // Farebné rozlíšenie: klikateľné = zlaté plné · soon = vyblednuté (svetlé, nízka opacita).
  let bg: string;
  let border: string;
  let iconColor: string;
  let op = 1;
  if (soon) {
    op = 0.5;
    if (danger) {
      bg = 'rgba(192, 57, 43, 0.05)';
      border = 'rgba(192, 57, 43, 0.22)';
      iconColor = '#C0392B';
    } else {
      bg = 'rgba(201, 154, 63, 0.04)';
      border = T.hairline;
      iconColor = T.inkFaint;
    }
  } else {
    bg = active ? 'rgba(201, 154, 63, 0.22)' : 'rgba(201, 154, 63, 0.12)';
    border = active ? 'rgba(201, 154, 63, 0.65)' : 'rgba(201, 154, 63, 0.50)';
    iconColor = T.accentGold;
  }
  return (
    <div className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button
        type="button"
        onClick={() => (clickable ? onClick?.() : setHover((v) => !v))}
        aria-label={label}
        className="inline-flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          background: bg,
          border: `1px solid ${border}`,
          color: iconColor,
          cursor: clickable ? 'pointer' : 'help',
          opacity: op,
          transition: 'all 0.15s',
        }}
      >
        {icon}
      </button>
      {hover && (
        <span
          className="absolute"
          style={{
            top: '50%',
            ...(tooltipSide === 'right'
              ? { left: 'calc(100% + 8px)' }
              : { right: 'calc(100% + 8px)' }),
            transform: 'translateY(-50%)',
            width: 184,
            zIndex: 20,
            background: T.ink,
            color: T.card,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10.5,
            lineHeight: 1.4,
            padding: '8px 10px',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
            textAlign: 'left',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TilePanel — accordion panel opened from a HubTile (Health/Training).
// Papyrus card with a gold halo icon + title + tagline, then children.
// ---------------------------------------------------------------------------
function TilePanel({
  icon,
  title,
  tagline,
  children,
}: {
  icon: string;
  title: string;
  tagline: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        padding: 22,
        boxShadow: T.cardShadow,
      }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: 18 }}>
        <span
          className="inline-flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'rgba(201, 154, 63, 0.10)',
            border: '1px solid rgba(201, 154, 63, 0.34)',
          }}
        >
          <img src={`/icons/pack/${icon}.svg`} alt="" style={{ width: 24, height: 24, filter: GOLD_FILTER }} />
        </span>
        <div className="flex flex-col" style={{ gap: 3 }}>
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: T.ink,
              lineHeight: 1,
            }}
          >
            {title}
          </h3>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: T.inkDim }}>
            {tagline}
          </span>
        </div>
      </div>
      <div className="flex flex-col" style={{ gap: 14 }}>{children}</div>
    </section>
  );
}

// PreviewRow — one feature line inside a TilePanel. `live` = active green dot,
// otherwise a "soon" chip (never red — CLAUDE.md guilt ban).
function PreviewRow({
  lucide,
  label,
  desc,
  live,
}: {
  lucide: React.ReactNode;
  label: string;
  desc: string;
  live?: boolean;
}) {
  const t = useT();
  return (
    <div
      className="flex items-start gap-3"
      style={{
        padding: '13px 15px',
        borderRadius: 14,
        background: live ? 'rgba(61, 122, 78, 0.07)' : T.cardSoft,
        border: `1px solid ${live ? 'rgba(61, 122, 78, 0.28)' : T.hairline}`,
      }}
    >
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: 'rgba(201, 154, 63, 0.10)',
          color: T.accentGold,
        }}
      >
        {lucide}
      </span>
      <div className="flex flex-col" style={{ gap: 2, minWidth: 0 }}>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.ink,
            }}
          >
            {label}
          </span>
          {live ? (
            <span
              className="inline-flex items-center gap-1"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 8,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: T.growGreen,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.growGreen }} />
              {t('pack.dog.statusLive')}
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1"
              style={{
                padding: '2px 7px',
                borderRadius: 999,
                background: T.tileBg,
                fontFamily: "'Cinzel', serif",
                fontSize: 8,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: T.inkFaint,
              }}
            >
              <Lock className="h-2.5 w-2.5" />
              {t('pack.dog.soon')}
            </span>
          )}
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, color: T.inkDim, lineHeight: 1.35 }}>
          {desc}
        </span>
      </div>
    </div>
  );
}

// VisionCallout — note tying a tile to the bigger mission. tone gold (default)
// or purple (Hektor accent) so it stands out against a gold card above it.
function VisionCallout({ title, body, tone = 'gold' }: { title: string; body: string; tone?: 'gold' | 'purple' }) {
  const purple = tone === 'purple';
  const accent = purple ? T.partHek : T.accentGold;
  return (
    <div
      style={{
        marginTop: 4,
        padding: '14px 16px',
        borderRadius: 14,
        background: purple ? 'rgba(46, 95, 208, 0.10)' : 'rgba(201, 154, 63, 0.07)',
        border: `1px solid ${purple ? 'rgba(46, 95, 208, 0.34)' : 'rgba(201, 154, 63, 0.26)'}`,
      }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: 5 }}>
        <Sparkles className="h-3.5 w-3.5" style={{ color: accent }} />
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: T.ink,
          }}
        >
          {title}
        </span>
      </div>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: T.inkDim, lineHeight: 1.45 }}>
        {body}
      </span>
    </div>
  );
}

// OverviewFact — one labelled fact in the Health overview. `live` = green value,
// `soon` = muted value + tiny lock; `hint` = small secondary value.
function OverviewFact({
  label,
  value,
  hint,
  live,
  soon,
}: {
  label: string;
  value: string;
  hint?: string;
  live?: boolean;
  soon?: boolean;
}) {
  return (
    <div className="flex flex-col" style={{ gap: 2, minWidth: 0 }}>
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 8.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: T.inkFaint,
        }}
      >
        {label}
      </span>
      <span className="inline-flex items-center gap-1.5" style={{ minWidth: 0 }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: live ? T.growGreen : soon ? T.inkFaint : T.ink,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </span>
        {live && <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.growGreen, flexShrink: 0 }} />}
        {soon && <Lock className="h-2.5 w-2.5 shrink-0" style={{ color: T.inkFaint }} />}
        {hint && (
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: T.inkDim }}>· {hint}</span>
        )}
      </span>
    </div>
  );
}

// CriticalChip — the vital lines a vet reads first (allergies / conditions / meds).
function CriticalChip({ lucide, label, value }: { lucide: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="flex items-center gap-2.5"
      style={{ padding: '10px 12px', borderRadius: 10, background: T.tileBg, border: `1px solid ${T.border}` }}
    >
      <span style={{ color: T.accentGold, display: 'inline-flex' }}>{lucide}</span>
      <div className="flex flex-col" style={{ gap: 1, minWidth: 0 }}>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 8.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: T.inkFaint,
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: T.inkDim }}>{value}</span>
      </div>
    </div>
  );
}

// TestChip — a test entry with a "Make test" CTA pill (coming soon).
function TestChip({
  lucide,
  label,
  sub,
  cta = 'Make test',
  onClick,
}: {
  lucide: React.ReactNode;
  label: string;
  sub: string;
  cta?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 text-left"
      style={{
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(46, 95, 208, 0.09)',
        border: '1px solid rgba(46, 95, 208, 0.30)',
        cursor: 'pointer',
      }}
    >
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(46, 95, 208, 0.14)', color: T.partHek }}
      >
        {lucide}
      </span>
      <div className="flex flex-col" style={{ gap: 2, minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: T.ink,
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: T.inkDim, lineHeight: 1.3 }}>
          {sub}
        </span>
      </div>
      <span
        className="inline-flex items-center gap-1.5 shrink-0"
        style={{
          padding: '7px 11px',
          borderRadius: 999,
          background: 'rgba(46, 95, 208, 0.16)',
          border: '1px solid rgba(46, 95, 208, 0.42)',
          fontFamily: "'Cinzel', serif",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: T.partHek,
        }}
      >
        <Lock className="h-2.5 w-2.5" />
        {cta}
      </span>
    </button>
  );
}

// SubCard — a bigger coming-soon block (Vet centre / Food protocol).
function SubCard({ lucide, title, desc }: { lucide: React.ReactNode; title: string; desc: string }) {
  const t = useT();
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: '16px 16px',
        borderRadius: 16,
        background: T.cardGrad,
        // Papyrus lock: okraj je konštantný 1.5px cardEdge, hover teraz nesie tieň
        // (predtým rozdiel v alfa okraja, ktorý lock zjednotil).
        border: `1.5px solid ${T.cardEdge}`,
        boxShadow: hover ? T.cardShadow : T.panelShadow,
        transition: 'box-shadow 0.2s',
      }}
    >
      <span
        className="absolute inline-flex items-center gap-1"
        style={{
          top: 12,
          right: 12,
          padding: '3px 8px',
          borderRadius: 999,
          background: T.tileBg,
          fontFamily: "'Cinzel', serif",
          fontSize: 8,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: T.inkFaint,
        }}
      >
        <Lock className="h-2.5 w-2.5" />
        {t('pack.dog.soon')}
      </span>
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(201, 154, 63, 0.10)',
          border: '1px solid rgba(201, 154, 63, 0.30)',
          color: T.accentGold,
          marginBottom: 10,
        }}
      >
        {lucide}
      </span>
      <h4
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: T.ink,
          marginBottom: 5,
        }}
      >
        {title}
      </h4>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: T.inkDim, lineHeight: 1.4 }}>
        {desc}
      </span>
    </div>
  );
}

// LIVE coming-soon karta na mieste Daily Prayers (Block 2). DEV_FULL = plný blok.
function PrayersComingSoon({ dogName }: { dogName: string }) {
  const t = useT();
  return (
    <section
      className="flex flex-col items-center justify-center text-center"
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        padding: '32px 24px',
        boxShadow: T.cardShadow,
        gap: 14,
      }}
    >
      <span
        className="inline-flex items-center justify-center"
        style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(201,154,63,0.08)', border: '1px solid rgba(201,154,63,0.28)' }}
      >
        <Lock className="h-6 w-6" style={{ color: T.accentGold }} />
      </span>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 19, fontWeight: 700, color: T.ink, lineHeight: 1.2 }}>
        {t('pack.dog.dailyPrayers')}
      </h2>
      <span
        className="inline-flex items-center gap-1.5"
        style={{
          padding: '4px 12px',
          borderRadius: 999,
          background: T.tileBg,
          fontFamily: "'Cinzel', serif",
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: T.inkDim,
        }}
      >
        <Lock className="h-2.5 w-2.5" />
        {t('pack.dog.comingSoon')}
      </span>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, lineHeight: 1.5, color: T.inkDim, maxWidth: 280 }}>
        {t('pack.dog.prayersComingSoonDesc', { dogName })}
      </p>
    </section>
  );
}

function HubTile({
  icon,
  label,
  sub,
  active,
  open,
  soon,
  onClick,
}: {
  icon: string;
  label: string;
  sub?: string;
  active?: boolean;
  open?: boolean;
  soon?: boolean;
  onClick?: () => void;
}) {
  const t = useT();
  const clickable = !!active && !soon;
  const [hover, setHover] = useState(false);
  const lift = clickable && hover;
  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative flex flex-col items-center justify-center text-center"
      style={{
        padding: '28px 14px',
        borderRadius: 16,
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        // lift (hover na klikateľnej karte) = lockovaný cardShadow + zlatý glow navrch;
        // pokoj = lockovaný cardShadow.
        boxShadow: lift
          ? `0 24px 50px -18px rgba(201, 154, 63, 0.5), ${T.cardShadow}`
          : T.cardShadow,
        gap: 13,
        minHeight: 158,
        width: '100%',
        cursor: clickable ? 'pointer' : 'default',
        transform: lift ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}
    >
      {soon && (
        <span
          className="absolute inline-flex items-center gap-1"
          style={{
            top: 11,
            right: 11,
            padding: '3px 8px',
            borderRadius: 999,
            background: T.tileBg,
            fontFamily: "'Cinzel', serif",
            fontSize: 8,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: T.inkFaint,
          }}
        >
          <Lock className="h-2.5 w-2.5" />
          {t('pack.dog.soon')}
        </span>
      )}
      {active && (
        <ChevronDown
          className="absolute h-4 w-4"
          style={{
            top: 12,
            right: 12,
            color: T.accentGold,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      )}

      {/* Ikona v zlatom kruhovom halo */}
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          flexShrink: 0,
          background: active ? 'rgba(201, 154, 63, 0.12)' : 'rgba(201, 154, 63, 0.05)',
          border: `1px solid rgba(201, 154, 63, ${active ? 0.42 : 0.2})`,
          boxShadow: lift ? '0 0 0 6px rgba(201, 154, 63, 0.10)' : 'none',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <img
          src={`/icons/pack/${icon}.svg`}
          alt=""
          style={{ width: 36, height: 36, filter: GOLD_FILTER, opacity: active ? 1 : 0.45 }}
        />
      </span>

      {/* Label + teaser */}
      <div className="flex flex-col items-center" style={{ gap: 4 }}>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 15,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: active ? T.ink : T.inkDim,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        {sub && (
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10.5,
              letterSpacing: '0.02em',
              color: active ? T.inkDim : T.inkFaint,
              lineHeight: 1.2,
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </button>
  );
}

function PhotoTile({ url, primary, onRemove }: { url: string; primary?: boolean; onRemove?: () => void }) {
  const t = useT();
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
          {t('pack.dog.mainBadge')}
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('pack.dog.ariaRemovePhoto')}
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
  const t = useT();
  const enabled = !!href;

  // PRIMARY — zlatý card: ikona v kruhu + eyebrow/„Certificate" + PDF ↓
  if (primary) {
    const style: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '13px 15px',
      borderRadius: 14,
      textDecoration: 'none',
      background: enabled ? 'linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%)' : 'rgba(201,154,63,0.12)',
      color: enabled ? '#3d1f00' : T.inkFaint,
      boxShadow: enabled ? '0 10px 24px -12px rgba(201,154,63,0.75)' : 'none',
      cursor: enabled ? 'pointer' : 'not-allowed',
    };
    const inner = (
      <>
        {enabled
          ? <BrandIcon name="dogposter" size={30} tint="dark" style={{ flexShrink: 0 }} />
          : <Loader2 className="h-5 w-5 animate-spin" style={{ flexShrink: 0, color: '#3d1f00' }} />
        }
        <span className="flex flex-col" style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7, lineHeight: 1 }}>
            {t('pack.dog.certOfficialRecord')}
          </span>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.25 }}>
            {t('pack.dog.docCertificate')}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
          {enabled ? 'PDF' : '…'}
          <Download className="h-4 w-4" />
        </span>
      </>
    );
    return enabled ? (
      <a href={href!} download={filename} target="_blank" rel="noopener noreferrer" style={style}>{inner}</a>
    ) : (
      <div style={style} title={t('pack.dog.generating')}>{inner}</div>
    );
  }

  // SECONDARY — zlato-tónovaný mini card (Vertical / Horizontal)
  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    width: '100%',
    padding: '11px 10px',
    borderRadius: 10,
    textDecoration: 'none',
    background: T.tileBg,
    border: `1px solid ${enabled ? 'rgba(201,154,63,0.32)' : T.hairline}`,
    color: enabled ? T.ink : T.inkFaint,
    fontFamily: "'Cinzel', serif",
    fontSize: 10,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontWeight: 700,
    cursor: enabled ? 'pointer' : 'not-allowed',
  };
  const inner = (
    <>
      {enabled ? <Download className="h-3.5 w-3.5" style={{ color: T.accentGold }} /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {label}
    </>
  );
  return enabled ? (
    <a href={href!} download={filename} target="_blank" rel="noopener noreferrer" style={style}>{inner}</a>
  ) : (
    <div style={style} title="Generating…">{inner}</div>
  );
}

function NotFoundBox() {
  const t = useT();
  return (
    <div
      style={{
        background: T.cardGrad,
        borderRadius: 16,
        padding: 28,
        maxWidth: 480,
        margin: '0 auto',
        border: `1.5px solid ${T.cardEdge}`,
        boxShadow: T.cardShadow,
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
        {t('pack.dog.notFound')}
      </h2>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.inkDim, fontSize: 14, marginBottom: 20 }}>
        {t('pack.dog.notFoundDesc')}
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
        {t('pack.dog.backToPack')}
      </Link>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  const t = useT();
  return (
    <div style={{ background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, boxShadow: T.cardShadow, borderRadius: 16, padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.ink }}>
        {t('pack.dog.errorLoading')}
      </p>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.inkDim, marginTop: 6 }}>
        {message}
      </p>
    </div>
  );
}
