import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PackSettings } from '@/components/pack/PackSettings';
import { PawmatesSection } from '@/components/pack/PawmatesSection';
import { usePackUser, type PackDogFull } from '@/hooks/usePackUser';
import { PACK_THEME, PACK_BOX, PACK_TEXT, PACK_SPACE, PACK_R, PF_FIELD_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { uploadAvatarPhoto, uploadCoverPhoto, sizedUrl } from '@/services/cloudinaryService';
import { useToast } from '@/hooks/use-toast';
import { useT, useLang } from '@/i18n/LanguageContext';
import { countryOptions, normalizeCountryValue, COUNTRY_OTHER } from '@/lib/countryOptions';
import { flagEmojiFromISO2, iso2ToISO3 } from '@/lib/countryGeo';
import { PAWMATE_LIVE } from '@/lib/packFlags';
import { appWebVersion } from '@/lib/appUpdate';
import { APP_PLATFORM } from '@/lib/isApp';
import {
  useProfile,
  saveHuman,
  saveDogAttrs,
  saveAvatarUrl,
  saveDisplayName,
  emptyDogAttrs,
  emptyDogCard,
  type DogCard,
  type HumanProfile,
  type TaxonomyOption,
  type RelationshipStatus,
  type PersonalityTag,
  type CentralProfile,
  type DogTemperamentTag,
  type DogTrailTag,
  RELATIONSHIP_OPTIONS,
  DIET_OPTIONS,
  SMOKE_OPTIONS,
  WORK_OPTIONS,
  PERSONALITY_OPTIONS,
  MAX_PERSONALITY,
  HIDEABLE_IDENTITY_FIELDS,
  isHidden,
  humanProfileCompletion,
  type ProfileFieldKey,
} from '@/components/pack/profile/packProfile';
import { HandCamera } from '@/components/pack/HandIcons';

const T = PACK_THEME;

// ── RIADKY PROFILU (21. 10. 2026) ── štítok vľavo · hodnota vpravo · tenká čiara, ako úprava
// profilu na Instagrame. Ovládače ostávajú `.pf-field` (pilulky, selecty), tu im padá rám aj výplň.
const ROWS_CSS = `
.pf-rows{display:flex;flex-direction:column;}
.pf-row{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.md}px;min-height:44px;border-bottom:1px solid ${T.hairline};color:inherit;}
.pf-rows > .pf-row:last-child,.pf-rows > :last-child > .pf-row{border-bottom:none;}
.pf-row-lbl{flex:0 0 auto;font-family:'Cinzel',serif;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};}
.pf-row.is-shown .pf-row-lbl{color:${LAPIS.edge};font-weight:700;}
.pf-row > :not(.pf-row-lbl){flex:1 1 auto;min-width:0;display:flex;justify-content:flex-end;}
.pf-row-txt{align-items:center;gap:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.body}px;color:${T.ink};}
.pf-rows .pf-field{background:none !important;border-color:transparent !important;box-shadow:none !important;text-align:right;text-align-last:right;font-size:${PACK_TEXT.body}px !important;padding-right:0 !important;}
.pf-rows .pf-field input{text-align:right;font-size:${PACK_TEXT.body}px !important;}
.pf-rows .pf-field:focus,.pf-rows .pf-field:focus-within{box-shadow:inset 0 -2px 0 ${LAPIS.edge} !important;}
.pf-rows .pf-field:not(.pf-selchip) > span[aria-hidden]{display:none;}
.pf-row--toggle .pf-row-lbl{text-align:left;}
.pf-rows .pf-field{justify-content:flex-end;}
.pf-rows .pf-field input{width:100% !important;}
/* Tri voľby sa vedľa štítku na mobile nezmestia — prepínač ide pod štítok cez celú šírku. */
.pf-row--toggle{flex-direction:column;align-items:stretch;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.md}px 0;}
.pf-row--toggle > .pf-toggle{justify-content:stretch;width:100%;}
.pf-row--toggle .pf-toggle__opt{flex:1 1 0;}
.pf-rows-ttl{display:flex;align-items:center;justify-content:space-between;margin-top:${PACK_SPACE.lg}px;font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};}
.pf-rows-ttl:first-child{margin-top:0;}
.pf-rows-ttl i{font-style:normal;letter-spacing:.02em;text-transform:none;}
`;

// ── UPRAVIŤ PROFIL PO RIADKOCH (profil JA v8, 23. 10. 2026) ─────────────────────────────
// Matej: *„vytvoríme inú stránku, kde všetko po riadkoch prepíšeme … ako je to aj na IG …
// nemusí to byť v D-bloku … musí to byť prehľadnejšie"* → nákres
// `plany/nakres-editprofile-bones-2026-10-23.html` → *„stavaj"*.
//
// KÔŠ 3 (úloha): hore ‹ + nadpis + DONE, bez spodnej lišty — preto bez `PackLayout`.
// Hlava = titulka a fotka (ťuk = zmeniť), pod ňou ZOZNAM RIADKOV. Ťuk na riadok otvorí
// JEDNO pole na celú obrazovku a ‹ / DONE vráti späť. Všetko sa ukladá samo (blur / ťuk),
// DONE nič neukladá — len zatvára.
// 🔴 Psy sa tu NEUPRAVUJÚ: riadok psa vedie do DOG ID (bio a povaha psa majú jeden zdroj).
// 🔴 BONES a línia tu UŽ NIE SÚ — odišli do šuplíka MISIA na profile (`BonesSheet`,
//    Matej 23. 10.: *„po kliknutí na bones by sa otvoril tiež popup so stats ohľadom misie"*).
//    Staré odkazy `/pack/profile/edit#network` sa preto vracajú na profil s otvoreným šuplíkom.
type EditField = 'name' | 'bio' | 'pills' | 'about' | 'account';

const EDIT_CSS = `
.pe-root{min-height:100dvh;background:${T.cardGrad};color:${T.inkStrong};font-family:${FONT_UI};}
.pe-top{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:44px 1fr 64px;align-items:center;
  height:52px;padding:env(safe-area-inset-top,0px) ${PACK_SPACE.lg}px 0;box-sizing:content-box;
  background:${T.card};border-bottom:1px solid ${T.hairline};}
.pe-top b{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.label}px;letter-spacing:.14em;text-transform:uppercase;text-align:center;}
.pe-back{width:36px;height:36px;display:grid;place-items:center;border:0;background:none;cursor:pointer;padding:0;}
.pe-done{justify-self:end;border:0;background:none;cursor:pointer;padding:${PACK_SPACE.sm}px 0;font-family:${FONT_TITLE};font-weight:700;
  font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;text-transform:uppercase;color:${LAPIS.edge};}
.pe-col{max-width:640px;margin:0 auto;padding:0 ${PACK_SPACE.lg}px ${PACK_SPACE.xxxl}px;}
.pe-head{position:relative;margin-top:${PACK_SPACE.lg}px;}
.pe-cover{display:block;width:100%;height:120px;border:0;padding:0;cursor:pointer;border-radius:${PACK_R.tile}px;
  background:${T.ink} center 35%/cover no-repeat;background-image:var(--pe-cover,none);position:relative;}
.pe-av{position:absolute;left:${PACK_SPACE.lg}px;top:64px;width:96px;height:96px;border-radius:${PACK_R.pill}px;padding:4px;border:0;cursor:pointer;
  background:conic-gradient(from 200deg,${LAPIS.edge},${LAPIS.deep},${T.cardEdge},#A3782B,${LAPIS.edge});}
.pe-av > span{display:grid;place-items:center;width:100%;height:100%;border-radius:${PACK_R.pill}px;overflow:hidden;background:${T.card};
  border:3px solid ${T.card};box-sizing:border-box;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;color:${T.inkDim};}
.pe-av img{width:100%;height:100%;object-fit:cover;object-position:50% 14%;}
.pe-cam{position:absolute;width:30px;height:30px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;
  background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};border:2px solid ${T.card};color:${LAPIS.ink};}
.pe-cover .pe-cam{right:${PACK_SPACE.sm}px;top:${PACK_SPACE.sm}px;}
.pe-av .pe-cam{right:-2px;bottom:-2px;}
/* Odkazy stoja vpravo od fotky: x = okraj fotky + priemer + okraj (mobil 16+96+16, PC 16+124+16). */
.pe-col{--pe-links-x:128px;}
.pe-links{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.md}px;align-items:center;min-height:40px;margin-top:${PACK_SPACE.sm}px;padding-left:var(--pe-links-x);}
.pe-links button{border:0;background:none;padding:0;cursor:pointer;font-size:${PACK_TEXT.label}px;font-weight:500;color:${LAPIS.edge};}
.pe-sec{font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};margin:${PACK_SPACE.xl}px 0 ${PACK_SPACE.xs}px;}
.pe-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:${PACK_SPACE.md}px;width:100%;min-height:48px;
  border:0;border-bottom:1px solid ${T.hairline};background:none;padding:0;cursor:pointer;text-align:left;color:inherit;font:inherit;}
.pe-row:hover{background:rgba(201,154,63,0.08);}
.pe-row > span{font-size:${PACK_TEXT.body}px;color:${T.inkStrong};white-space:nowrap;}
.pe-row > em{font-style:normal;font-size:${PACK_TEXT.label}px;color:${T.inkDim};text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pe-row > i{display:flex;transform:scaleX(-1);opacity:.55;}
.pe-row.dog{grid-template-columns:auto auto minmax(0,1fr) auto;}
.pe-row.dog > img,.pe-row.dog > .ph{width:36px;height:36px;border-radius:${PACK_R.pill}px;object-fit:cover;border:2px solid ${T.cardEdge};background:${T.card};}
.pe-row.dog b{font-family:'Cinzel Decorative','Cinzel',serif;font-weight:700;font-size:${PACK_TEXT.body}px;}
.pe-num{display:inline-flex;align-items:center;margin-left:${PACK_SPACE.xs}px;background:${LAPIS.grad};color:${LAPIS.ink};font-family:${FONT_TITLE};font-weight:700;
  font-size:${PACK_TEXT.micro}px;letter-spacing:.02em;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;border-radius:${PACK_R.pill}px;vertical-align:middle;line-height:1;}
.pe-hint{font-size:${PACK_TEXT.micro}px;color:${T.inkDim};margin:${PACK_SPACE.xs}px 0 0;line-height:1.4;}
.pe-field{padding-top:${PACK_SPACE.lg}px;}
.pe-lbl{display:block;font-weight:500;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkDim};margin:0 0 ${PACK_SPACE.sm}px;}
.pe-field .pf-field{font-size:${PACK_TEXT.body}px !important;}
.pe-ver{text-align:center;font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;color:${T.inkDim};margin-top:${PACK_SPACE.lg}px;}
@media (min-width:768px){
  .pe-cover{height:180px;}
  .pe-av{top:112px;width:124px;height:124px;}
  .pe-col{--pe-links-x:156px;}
}
`;

export default function PackProfile() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [nameDirty, setNameDirty] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [appVer, setAppVer] = useState('');
  useEffect(() => { appWebVersion().then(setAppVer).catch(() => {}); }, []);
  const { toast } = useToast();
  const { dogs } = usePackUser(session?.user?.id ?? null);
  const { profile } = useProfile();
  const human = profile?.human;
  const patchHuman = (p: Partial<HumanProfile>) => { saveHuman(p); };
  // `?welcome=1` (po platbe) = nastav si heslo → rovno účet, `PackSettings` to vie sám.
  const [field, setField] = useState<EditField | null>(searchParams.has('welcome') ? 'account' : null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setSessionChecked(true);
      const meta = (data.session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
      // DEV-ONLY: NOAUTH guest nemá session — fallback, aby sa stránka dala posúdiť (nikdy na produkcii).
      const devNoAuth = import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === '1';
      setAvatarUrl(meta.avatar_url || meta.avatar || (devNoAuth ? '/images/about-matej.png' : null));
      setFullName(meta.full_name || meta.name || (devNoAuth ? 'Matej Stacho' : ''));
    });
    return () => {
      mounted = false;
    };
  }, []);

  // ?edit=avatar (ťuk na fotku na profile) → hneď výber súboru.
  useEffect(() => {
    if (searchParams.get('edit') === 'avatar') {
      const timeoutId = setTimeout(() => fileInputRef.current?.click(), 200);
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams]);

  // Nové pole začína hore — zoznam mohol byť odrolovaný.
  useEffect(() => { window.scrollTo({ top: 0 }); }, [field]);

  // Staré odkazy: BONES a línia žijú v šuplíku na profile, nie tu.
  if (location.hash === '#network') return <Navigate to="/pack/profile#network" replace />;
  const noAuthDev = import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === '1';
  if (sessionChecked && !session && !noAuthDev) {
    return <Navigate to={`/login?return=${encodeURIComponent('/pack/profile/edit')}`} replace />;
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !session?.user) return;
    setUploading(true);
    try {
      const result = await uploadAvatarPhoto(file, session.user.id);
      const { error: upErr } = await supabase.auth.updateUser({
        data: { avatar_url: result.secureUrl },
      });
      if (upErr) throw new Error(upErr.message);
      // Aj do `pack_profiles` — do `user_metadata` CUDZIEHO účtu sa iný člen nedostane (2026-08-26).
      await saveAvatarUrl(result.secureUrl);
      setAvatarUrl(result.secureUrl);
      toast({ title: tx('pack.profile.toastPhotoUpdated', 'Photo updated') });
    } catch (err) {
      toast({
        title: tx('pack.profile.toastUploadFailed', 'Upload failed'),
        description: err instanceof Error ? err.message : tx('pack.profile.toastUnknownError', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // TITULKA = vlastné pole `human.coverPhoto`. 🔴 NIE `buddyPhoto` — to je fotka „spolu"
  // pre bránu SNIFFERA a zmena titulky by ju ticho prepísala.
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !session?.user) return;
    setCoverUploading(true);
    try {
      const result = await uploadCoverPhoto(file, session.user.id);
      await saveHuman({ coverPhoto: result.secureUrl }, { throwOnError: true });
      toast({ title: tx('pack.profile.toastPhotoUpdated', 'Photo updated') });
    } catch (err) {
      toast({
        title: tx('pack.profile.toastUploadFailed', 'Upload failed'),
        description: err instanceof Error ? err.message : tx('pack.profile.toastUnknownError', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!nameDirty || nameSaving) return;
    setNameSaving(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() || null },
      });
      if (upErr) throw new Error(upErr.message);
      // Aj do `pack_profiles` — inak by meno videl len jeho majiteľ (2026-08-26).
      await saveDisplayName(fullName);
      setNameDirty(false);
      toast({ title: tx('pack.profile.toastNameUpdated', 'Name updated') });
    } catch (err) {
      toast({
        title: tx('pack.profile.toastCouldNotSave', 'Could not save'),
        description: err instanceof Error ? err.message : tx('pack.profile.toastUnknownError', 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setNameSaving(false);
    }
  };

  const email = session?.user?.email ?? '—';
  // Meno z objednávky — východisko, keď si človek v profile žiadne nevypísal.
  const orderName = dogs.map((d) => d.owner_name?.trim()).find(Boolean) ?? '';
  const initial = (fullName?.[0] || orderName?.[0] || email?.[0] || 'D').toUpperCase();
  const shownName = (() => {
    if (human?.displayAs === 'nickname' && human.nickname?.trim()) return human.nickname.trim();
    if (human?.displayAs === 'packName' && human.packName?.trim()) return human.packName.trim();
    return fullName.trim() || orderName;
  })();
  const firstDog = dogs.find((d) => d.pack_number != null) ?? dogs[0] ?? null;
  const coverSrc = human?.coverPhoto || human?.buddyPhoto || firstDog?.cloudinary_main_url || null;
  const bio = human?.dogVoiceBio?.trim() || '';
  const pillEmoji = (human?.personality ?? [])
    .map((v) => PERSONALITY_OPTIONS.find((o) => o.value === v)?.emoji)
    .filter(Boolean) as string[];
  const pillCount = pillEmoji.length + (human?.customPersonality ? 1 : 0);
  const aboutFilled = [human?.age, human?.region, human?.relationship, human?.smoke, human?.diet, human?.work].filter((v) => v != null && v !== '').length;
  const add = tx('pack.edit.empty', 'Add');

  const TITLES: Record<EditField, string> = {
    name: tx('pack.profile.name', 'Name'),
    bio: tx('pack.edit.bio', 'Bio'),
    pills: tx('pack.profile.personality', 'Personality'),
    about: tx('pack.edit.aboutMe', 'About me'),
    account: tx('pack.edit.secAccount', 'Account & app'),
  };
  const back = () => (field ? setField(null) : navigate('/pack/profile'));
  const done = () => {
    if (field === 'name') handleSaveName();
    back();
  };

  const row = (label: string, value: React.ReactNode, onClick: () => void) => (
    <button type="button" className="pe-row" onClick={onClick}>
      <span>{label}</span>
      <em>{value}</em>
      <i aria-hidden><BrandIcon name="back" size={14} tint="dark" /></i>
    </button>
  );

  return (
    <div className="pe-root">
      <style>{PF_FIELD_CSS}</style>
      <style>{ROWS_CSS}</style>
      <style>{EDIT_CSS}</style>
      <header className="pe-top">
        <button type="button" className="pe-back" onClick={back} aria-label={tx('pack.edit.back', 'Back')}>
          <BrandIcon name="back" size={18} tint="dark" />
        </button>
        <b>{field ? TITLES[field] : tx('pack.me.editProfile', 'Edit profile')}</b>
        <button type="button" className="pe-done" onClick={done}>{tx('pack.edit.done', 'Done')}</button>
      </header>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
      <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />

      <div className="pe-col">
        {field === null && (
          <>
            {/* HLAVA — titulka a fotka, ťuk = zmeniť */}
            <div className="pe-head">
              <button
                type="button"
                className="pe-cover"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                aria-label={tx('pack.edit.changeCover', 'Change cover')}
                style={coverSrc ? ({ '--pe-cover': `url(${sizedUrl(coverSrc, 1200)})` } as React.CSSProperties) : undefined}
              >
                <span className="pe-cam">{coverUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandCamera size={15} />}</span>
              </button>
              <button
                type="button"
                className="pe-av"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label={tx('pack.profile.changeAvatarAria', 'Change avatar')}
              >
                <span>{avatarUrl ? <img src={sizedUrl(avatarUrl, 320)} alt="" /> : initial}</span>
                <span className="pe-cam">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandCamera size={15} />}</span>
              </button>
            </div>
            <div className="pe-links">
              <button type="button" onClick={() => fileInputRef.current?.click()}>{tx('pack.edit.changePhoto', 'Change photo')}</button>
              <button type="button" onClick={() => coverInputRef.current?.click()}>{tx('pack.edit.changeCover', 'Change cover')}</button>
            </div>

            <div className="pe-sec">{tx('pack.edit.secProfile', 'Profile')}</div>
            {row(TITLES.name, shownName || add, () => setField('name'))}
            {row(TITLES.bio, bio || add, () => setField('bio'))}
            {row(TITLES.pills, pillCount ? <>{pillEmoji.slice(0, 4).join(' ')}{pillCount > 4 ? ` +${pillCount - 4}` : ''}{!pillEmoji.length ? `${pillCount}` : ''}</> : add, () => setField('pills'))}

            {dogs.length > 0 && (
              <>
                <div className="pe-sec">{tx('pack.edit.secDogs', 'My dogs')}</div>
                {dogs.map((d) => (
                  <button key={d.id} type="button" className="pe-row dog" onClick={() => navigate(`/pack/dogs/${d.id}`)}>
                    {d.cloudinary_main_url ? <img src={sizedUrl(d.cloudinary_main_url, 120)} alt="" /> : <span className="ph" />}
                    <span>
                      <b>{d.dog_name}</b>
                      {d.pack_number != null && <span className="pe-num">#{d.pack_number}</span>}
                    </span>
                    <em>DOG ID</em>
                    <i aria-hidden><BrandIcon name="back" size={14} tint="dark" /></i>
                  </button>
                ))}
                <p className="pe-hint">{tx('pack.edit.dogHint', 'Bio and character of the dog live in DOG ID.')}</p>
              </>
            )}

            <div className="pe-sec">{TITLES.about}</div>
            {row(tx('pack.edit.aboutSub', 'Age, home, lifestyle'), aboutFilled ? `${aboutFilled} / 6` : add, () => setField('about'))}

            <div className="pe-sec">{TITLES.account}</div>
            {row(tx('pack.settings.account', 'Account'), email, () => setField('account'))}

            {/* PAWMATES — správa svorky z pohľadu človeka; `PAWMATE_LIVE` je dnes `false`. */}
            {PAWMATE_LIVE && <div style={{ marginTop: PACK_SPACE.xl }}><PawmatesSection /></div>}
          </>
        )}

        {field === 'name' && (
          <div className="pe-field pf-rows">
            <div className={`pf-row${(human?.displayAs ?? 'name') === 'name' ? ' is-shown' : ''}`}>
              <span className="pf-row-lbl">{tx('pack.profile.name', 'Name')}</span>
              <input
                type="text"
                value={fullName}
                autoFocus
                onChange={(e) => { setFullName(e.target.value); setNameDirty(true); }}
                onBlur={() => { handleSaveName(); }}
                /* Prázdne = platí meno z OBJEDNÁVKY (Matej 2026-08-26) — ukážeme ho ako predlohu. */
                placeholder={orderName || tx('pack.profile.namePlaceholder', 'Your name')}
                className="pf-field pf-field--flat"
                style={{ width: '100%', minWidth: 0, borderRadius: PACK_R.field, padding: '8px 12px', color: T.ink, fontFamily: FONT_UI }}
              />
            </div>
            <div className={`pf-row${human?.displayAs === 'nickname' ? ' is-shown' : ''}`}>
              <span className="pf-row-lbl">{tx('pack.profile.nickname', 'Nickname')}</span>
              <AutoSaveTextInput
                value={human?.nickname ?? ''}
                onSave={(v) => patchHuman({ nickname: v || undefined })}
                placeholder={tx('pack.profile.nicknamePlaceholder', 'Pack calls you')}
                align="left"
              />
            </div>
            <div className={`pf-row${human?.displayAs === 'packName' ? ' is-shown' : ''}`}>
              <span className="pf-row-lbl">{tx('pack.profile.packName', 'Pack name')}</span>
              <AutoSaveTextInput
                value={human?.packName ?? ''}
                onSave={(v) => patchHuman({ packName: v || undefined })}
                placeholder={tx('pack.profile.packNamePlaceholder', 'Your household')}
                align="left"
              />
            </div>
            <div className="pf-row pf-row--toggle">
              <span className="pf-row-lbl">{tx('pack.profile.showAs', 'Show as')}</span>
              <DisplayAsToggle value={human?.displayAs ?? 'name'} onChange={(v) => patchHuman({ displayAs: v })} />
            </div>
          </div>
        )}

        {field === 'bio' && (
          <div className="pe-field">
            <span className="pe-lbl">{tx('pack.profile.bioHeading', 'BIO: What my dog would probably say about me')}</span>
            <WordLimitTextarea
              value={human?.dogVoiceBio ?? ''}
              onSave={(v) => patchHuman({ dogVoiceBio: v })}
              placeholder={tx('pack.profile.bioPlaceholder', 'My human wakes up at 6 just to walk me. Slightly obsessed. Would recommend. — 🐾')}
              rows={9}
              white
            />
          </div>
        )}

        {field === 'pills' && (
          <div className="pe-field">
            <PersonalityConcentrate human={human} patchHuman={patchHuman} />
          </div>
        )}

        {field === 'about' && (
          <div className="pe-field pf-rows pf-rows--sec">
            <div className="pf-rows-ttl">
              <span>{tx('pack.profile.basics', 'The basics')}</span>
              <IdentityVisibilityEye profile={profile} patchHuman={patchHuman} />
            </div>
            <HideWrap hidden={isHidden(profile, 'age')}>
              <div className="pf-row">
                <span className="pf-row-lbl">{tx('pack.profile.agePlaceholder', 'Age')}</span>
                <MiniChipInput emoji="🎂" type="number" value={human?.age} placeholder="—" width={40}
                  onSave={(v) => patchHuman({ age: v === '' ? undefined : Number(v) })} />
              </div>
            </HideWrap>
            <div className="pf-row">
              <span className="pf-row-lbl">{tx('pack.profile.nationality', 'Nationality')}</span>
              <NationalitySelect value={human?.nationality ?? 'SK'} onChange={(v) => patchHuman({ nationality: v })} />
            </div>
            <HideWrap hidden={isHidden(profile, 'region')}>
              <div className="pf-row">
                <span className="pf-row-lbl">{tx('pack.profile.cityPlaceholder', 'City')}</span>
                <MiniChipInput emoji="📍" value={human?.region ?? ''} placeholder="—" width={150}
                  onSave={(v) => patchHuman({ region: v || undefined })} />
              </div>
            </HideWrap>
            <div className="pf-rows-ttl">
              <span>{tx('pack.profile.lifestyle', 'Lifestyle')}</span>
              <i>{tx('pack.profile.optional', 'Optional')}</i>
            </div>
            <div className="pf-row">
              <span className="pf-row-lbl">{tx('pack.profile.statusPlaceholder', 'Status')}</span>
              <StatusSelect value={human?.relationship} onChange={(v) => patchHuman({ relationship: v })} />
            </div>
            <div className="pf-row">
              <span className="pf-row-lbl">{tx('pack.profile.smokePlaceholder', 'Smoke')}</span>
              <LifestyleSelect emoji="" placeholder="—" options={SMOKE_OPTIONS} value={human?.smoke} onChange={(v) => patchHuman({ smoke: v })} />
            </div>
            <div className="pf-row">
              <span className="pf-row-lbl">{tx('pack.profile.dietPlaceholder', 'Diet')}</span>
              <LifestyleSelect emoji="" placeholder="—" options={DIET_OPTIONS} value={human?.diet} onChange={(v) => patchHuman({ diet: v })} />
            </div>
            <div className="pf-row">
              <span className="pf-row-lbl">{tx('pack.profile.workPlaceholder', 'Work')}</span>
              <LifestyleSelect emoji="" placeholder="—" options={WORK_OPTIONS} value={human?.work} onChange={(v) => patchHuman({ work: v })} />
            </div>
          </div>
        )}

        {field === 'account' && (
          <div className="pe-field">
            <PackSettings />
            {/* ČÍSLO VERZIE — LEN V APPKE (21. 10. 2026), rovnaké ako `version` v dogypt.com/app-update.json. */}
            {appVer && <div className="pe-ver">DOGYPT · {APP_PLATFORM} · {appVer}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// `MyGodsContent` (psia galéria — accordion editor BIO+tagov) ZMAZANÝ 2026-08-06
// spolu so sekciou „OH, MY DOG!" (viď komentár pri jej bývalom mieste vyššie).
// Komponent `DogGalleryAccordion` sám NEZANIKOL — read-only ho ďalej používa
// `PublicProfile.tsx` (`/pack/u/:id`). Editovanie psích polí patrí do kvízov v MY PACK.

// `Field`/`Badge` (Account info riadky) ZMAZANÉ 2026-08-12 — boli súkromné len pre karte
// „Account", ktorú nahradil zdieľaný `<PackSettings/>`. Rovnaké komponenty žijú tam.

// ─────────────────────────────────────────────────────────────────────────
// Koncentrát osobnosti + lifestyle — BLOK 2 rozpustený do BLOK 1 (ľavý
// stĺpec, pod bio) — zadanie-profil-koncentrat-2026-07-24. Nahrádza starý
// samostatný <ProfileEditor/> ("Topics & style" karta, Topics/vibe/off-the-
// leash/person-type/smoking/alcohol/looking-for pill groups + per-field
// visibility toggle). Read/write stále cez useProfile()/saveHuman() —
// žiadny priamy localStorage.
// ─────────────────────────────────────────────────────────────────────────

const MAX_WORDS = 150;
function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

// LANGUAGE_OPTIONS removed from BLOK 1 UI (zadanie-profil-blok1-rework-2026-07-24
// — `human.languages` data field stays, just no longer rendered here).

// Small sub-heading above a field/group.
function SubFieldLabel({ label }: { label: string }) {
  return (
    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkDim, display: 'block', marginBottom: 8 }}>
      {label}
    </span>
  );
}

// Reusable pill — selected = gold fill (T.accentGold) + dark text, unselected =
// T.bg + hairline border + inkDim text. Emoji prefix (font-native, per
// zadanie-profil-kompakt-emoji-2026-07-24) replaces the old <BrandIcon>; falls
// back to no prefix when an option has neither (never invents one). `disabled`
// = at MAX_PERSONALITY and not yet selected — dimmed, click is a no-op.
function ProfilePill<V extends string>({
  option,
  selected,
  disabled,
  onClick,
}: {
  option: TaxonomyOption<V>;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const t = useT();
  // Štítky o človeku v jeho rode (⚥ v slovníku) — profil je vlastný, rod berieme z neho.
  const rodG = useProfile().profile?.human?.gender ?? '';
  const tx = (key: string, fallback: string) => { const v = t(key, { rod: rodG }); return v === key ? fallback : v; };
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`pf-pill inline-flex items-center gap-1${selected ? ' is-selected' : ''}`}
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 10,
        fontWeight: selected ? 600 : 500,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {option.emoji ? <span aria-hidden>{option.emoji}</span> : null}
      {/* Hodnota pilulky ide cez konvenčný kľúč `pack.profileTag.<value>` — rovnaký vzor ako
          `pack.dogTag.<value>` (dogQuiz.ts:94). Taxonómia v `packProfile.ts` tak ostáva čisté
          dáta bez i18n poľa a `labelEN` slúži ako fallback, keď preklad chýba. */}
      {tx(`pack.profileTag.${option.value}`, option.labelEN)}
    </button>
  );
}

// Koncentrát osobnosti — 20 pills / 5 groups (Vibe/Active/Creative/Taste/
// Dogs), ONE shared max-10 limit + "{n}/10" counter (zadanie-profil-
// koncentrat-2026-07-24 ČASŤ B.2). Selected pills stay clickable (unselect
// always allowed); unselected pills disable once the cap is hit.
function PersonalityConcentrate({
  human,
  patchHuman,
  center = false,
  hideLabel = false,
}: {
  human: HumanProfile | undefined;
  patchHuman: (p: Partial<HumanProfile>) => void;
  center?: boolean;
  hideLabel?: boolean;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const selected = human?.personality ?? [];
  const custom = human?.customPersonality;
  const total = selected.length + (custom ? 1 : 0);
  const atMax = total >= MAX_PERSONALITY;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const toggle = (v: PersonalityTag) => {
    if (selected.includes(v)) {
      patchHuman({ personality: selected.filter((x) => x !== v) });
    } else if (!atMax) {
      patchHuman({ personality: [...selected, v] });
    }
  };

  const saveCustom = () => {
    const trimmed = draft.trim().slice(0, 24);
    patchHuman({ customPersonality: trimmed || undefined });
    setDraft('');
    setAdding(false);
  };

  return (
    <div>
      <div
        className={`flex items-center ${center ? 'justify-center' : 'justify-between'}`}
        style={{ marginBottom: 10, gap: center ? 8 : 0 }}
      >
        {!hideLabel && (
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkDim }}>
            {tx('pack.profile.personality', 'Personality')}
          </span>
        )}
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: atMax ? T.accentGold : T.inkFaint }}>
          {total}/{MAX_PERSONALITY}
        </span>
      </div>
      {/* Flat pool — no group sub-headings, tighter gaps (Matej 2026-07-24:
          „daj preč nadpisy … tie pils sú veľké a roztiahnuté"). Last: ONE
          user-written custom pill („pridať vlastný pill, len 1x"). */}
      <div className={`flex flex-wrap gap-1.5 ${center ? 'justify-center' : ''}`}>
        {PERSONALITY_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <ProfilePill
              key={opt.value}
              option={opt}
              selected={isSelected}
              disabled={!isSelected && atMax}
              onClick={() => toggle(opt.value)}
            />
          );
        })}

        {/* Custom pill — set = gold chip with ✕ to remove; unset = "+ Add your
            own" (only when there's room). One only. */}
        {custom ? (
          <button
            type="button"
            onClick={() => patchHuman({ customPersonality: undefined })}
            className="pf-pill is-selected inline-flex items-center gap-1"
            style={{
              borderRadius: 999,
              padding: '4px 8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span aria-hidden>✏️</span>
            {custom}
            <span aria-hidden style={{ opacity: 0.7 }}>✕</span>
          </button>
        ) : adding ? (
          <input
            // Vlastné slovo (vôdzka) klávesnica prepisovala na „vodičku“ — Alenka 14. 10. 2026.
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            value={draft}
            maxLength={24}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveCustom}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); saveCustom(); }
              if (e.key === 'Escape') { setDraft(''); setAdding(false); }
            }}
            placeholder={tx('pack.profile.customPersonalityPlaceholder', 'Your own…')}
            className="pf-field"
            style={{
              borderRadius: 999,
              padding: '4px 12px',
              width: 120,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10,
              color: T.ink,
            }}
          />
        ) : !atMax ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1"
            style={{
              background: 'transparent',
              border: `1px dashed ${T.border}`,
              borderRadius: 999,
              padding: '4px 8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 10,
              fontWeight: 500,
              color: T.inkFaint,
              cursor: 'pointer',
            }}
          >
            {tx('pack.profile.addOwnPersonality', '＋ Add your own')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// Compact lifestyle dropdown — same rounded-pill select chrome as
// Nationality/Status above (ČASŤ B.3). Generic over any TaxonomyOption union.
function LifestyleSelect<V extends string>({
  emoji,
  placeholder,
  options,
  value,
  onChange,
}: {
  emoji: string;
  placeholder: string;
  options: TaxonomyOption<V>[];
  value: V | undefined;
  onChange: (v: V | undefined) => void;
}) {
  const t = useT();
  // Štítky o človeku v jeho rode (⚥ v slovníku) — profil je vlastný, rod berieme z neho.
  const rodG = useProfile().profile?.human?.gender ?? '';
  const tx = (key: string, fallback: string) => { const v = t(key, { rod: rodG }); return v === key ? fallback : v; };
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? (e.target.value as V) : undefined)}
      className="pf-field pf-selpad"
      style={{
        borderRadius: 999,
        width: '100%',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: PACK_TEXT.label,
        color: value ? T.ink : T.inkFaint,
        cursor: 'pointer',
      }}
    >
      <option value="">{emoji ? `${emoji} ` : ''}{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.emoji ? `${opt.emoji} ` : ''}{tx(`pack.profileTag.${opt.value}`, opt.labelEN)}</option>
      ))}
    </select>
  );
}

// ≤150-word textarea with a live counter — blocks further growth once over
// the limit (spec: „nad limit blokuj ďalší vstup"). Auto-saves on blur.
function WordLimitTextarea({
  value,
  onSave,
  placeholder,
  rows = 4,
  align = 'left',
  white = false,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  rows?: number;
  align?: 'left' | 'center';
  /** Matej 2026-07-26: „texta area daj biele" — textarea má byť SVETLEJŠIA než
   *  zlatý gradient ostatných `.pf-field` prvkov. Od 13. 8. je to najsvetlejší
   *  papyrusový tón `${T.card}`, nie čistá `#FFFFFF`: biela bola jediný taký prvok
   *  na celej stránke a porušovala lock bledého bloku (audit A2). Zámer ostáva,
   *  mení sa odtieň. Inline `background` prebije CSS triedu, takže `.pf-field`
   *  border/shadow/focus glow ostávajú. Ten istý tón nesie bio psa
   *  v `profile/DogGallery.tsx` — meniť oba naraz. */
  white?: boolean;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  const count = countWords(local);
  const over = count > MAX_WORDS;

  return (
    // IG-style: counter overlaid inside the textarea's bottom-right corner
    // (per Matej — no separate line below, consolidates space).
    <div style={{ position: 'relative' }}>
      <textarea
        value={local}
        onChange={(e) => {
          const next = e.target.value;
          if (countWords(next) > MAX_WORDS && next.length > local.length) return;
          setLocal(next);
        }}
        onBlur={() => { if (local !== value) onSave(local); }}
        placeholder={placeholder}
        rows={rows}
        className={`pf-field${white ? ' pf-field--flat' : ''}`}
        style={{
          width: '100%',
          // radius 8 = úroveň 4 MATRICE, rovnako ako MENO a PREZÝVKA nad ňou.
          // Textarea tu mala 10 a vedľajšie polia 8 — rozdiel, ktorý oko vidí a nevie pomenovať.
          borderRadius: 8,
          padding: '8px 12px 24px',
          minHeight: 48,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 12,
          lineHeight: 1.4,
          textAlign: align,
          resize: 'vertical',
          // farba prichádza z `.pf-field--flat` (packTheme.ts) — jedno miesto pre všetky tri polia
        }}
      />
      <span
        style={{
          position: 'absolute',
          right: 10,
          bottom: 8,
          pointerEvents: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: over ? '#A04040' : T.inkFaint,
        }}
      >
        {count}/{MAX_WORDS}
      </span>
    </div>
  );
}

// Mini pill chip — wraps gender (read-only) / age / region into a compact,
// single-line row instead of the old label-then-full-width-input stack
// (zadanie-profil-kompakt-emoji-2026-07-24).
// Skryté pole ostáva vo VLASTNOM profile plne editovateľné — len stlmené a s
// preškrtnutým okom, aby si na prvý pohľad videl, čo pack nevidí. Skrývanie sa
// deje až pri čítaní cudzím okom (PublicProfile), nie tu.
function HideWrap({ hidden, children }: { hidden: boolean; children: React.ReactNode }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  if (!hidden) return <>{children}</>;
  return (
    <span
      className="relative inline-flex items-center"
      title={tx('pack.profile.hiddenTooltip', 'Hidden from the pack — only you see this')}
      style={{ opacity: 0.45 }}
    >
      {children}
      <EyeOff className="h-3 w-3" style={{ color: T.inkFaint, marginLeft: 3 }} />
    </span>
  );
}

// D3 — jedno oko na identity riadok. Klik otvorí zoznam skrývateľných polí
// (vek · národnosť · mesto). Zapisuje do human.visibility: 'private' = skryté,
// vymazanie kľúča = späť na default. Počet psov v zozname nie je zámerne.
function IdentityVisibilityEye({
  profile,
  patchHuman,
}: {
  profile: CentralProfile | null;
  patchHuman: (p: Partial<HumanProfile>) => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [open, setOpen] = useState(false);
  const hiddenKeys = HIDEABLE_IDENTITY_FIELDS.filter((f) => isHidden(profile, f.key));
  const anyHidden = hiddenKeys.length > 0;

  const toggle = (key: ProfileFieldKey) => {
    const current = { ...(profile?.human.visibility ?? {}) };
    if (current[key] === 'private') delete current[key];
    else current[key] = 'private';
    patchHuman({ visibility: current });
  };

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={tx('pack.profile.identityVisibilityAria', 'Who sees these details')}
        aria-expanded={open}
        className="pf-hit inline-flex items-center gap-1"
        style={{
          background: anyHidden ? 'rgba(201,154,63,0.10)' : T.bg,
          border: `1px solid ${anyHidden ? '${T.border}' : T.hairline}`,
          borderRadius: 999,
          padding: '4px 8px',
          color: anyHidden ? T.accentGold : T.inkFaint,
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {anyHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {anyHidden && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
            {hiddenKeys.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop — klik mimo zatvára. Native <select>-y v riadku by inak
              ostali pod otvoreným panelom nedostupné. */}
          <span
            className="fixed inset-0"
            style={{ zIndex: 40 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="absolute"
            style={{
              zIndex: 41,
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 208,
              // Úroveň 4 MATRICE (`PACK_BOX.panel`). `T.card` je PLNÁ farba, nie gradient —
              // CLAUDE.md pred tým výslovne varuje a tu bola použitá ako pozadie panelu.
              ...PACK_BOX.panel,
              padding: 8,
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: T.inkFaint,
                display: 'block',
                marginBottom: 8,
              }}
            >
              {tx('pack.profile.hideFromPack', 'Hide from the pack')}
            </span>
            {HIDEABLE_IDENTITY_FIELDS.map((f) => {
              const off = isHidden(profile, f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggle(f.key)}
                  className="flex items-center gap-2 w-full"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12,
                    color: off ? T.inkFaint : T.ink,
                  }}
                >
                  <span aria-hidden>{f.emoji}</span>
                  <span className="flex-1" style={{ textDecoration: off ? 'line-through' : 'none' }}>
                    {/* Rovnaký text ako placeholder toho poľa v riadku identity — jeden údaj,
                        jedno slovo. `HIDEABLE_IDENTITY_FIELDS` má kľúče `age` / `region`. */}
                    {tx(f.key === 'region' ? 'pack.profile.cityPlaceholder' : 'pack.profile.agePlaceholder', f.labelEN)}
                  </span>
                  {off ? (
                    <EyeOff className="h-3.5 w-3.5" style={{ color: T.accentGold }} />
                  ) : (
                    <Eye className="h-3.5 w-3.5" style={{ color: T.inkFaint }} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </span>
  );
}

function MiniChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="pf-field inline-flex items-center gap-1"
      style={{
        borderRadius: 999,
        padding: '4px 8px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 10,
        color: T.ink,
      }}
    >
      {children}
    </span>
  );
}

// Editable variant — emoji prefix + borderless inline input inside a MiniChip.
function MiniChipInput({
  emoji,
  type = 'text',
  value,
  placeholder,
  width,
  onSave,
}: {
  emoji: string;
  type?: 'text' | 'number';
  value: string | number | undefined;
  placeholder?: string;
  width: number;
  onSave: (v: string) => void;
}) {
  const initial = value == null ? '' : String(value);
  const [local, setLocal] = useState(initial);
  useEffect(() => setLocal(initial), [initial]);
  return (
    <MiniChip>
      <span aria-hidden>{emoji}</span>
      <input
        type={type}
        min={type === 'number' ? 13 : undefined}
        max={type === 'number' ? 120 : undefined}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== initial) onSave(local); }}
        placeholder={placeholder}
        style={{
          width,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: 0,
          color: T.ink,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 10,
        }}
      />
    </MiniChip>
  );
}

// Nationality — flag + short-code pill dropdown (e.g. "🇸🇰 SVK", not the full
// country name — zadanie-profil-shrink-2026-07-24, was full labelEN). Native
// <select>, default 'SK'.
// VŠETKY krajiny sveta (Matej 2026-08-13: „vlajky tu nie su všetky"). Zoznam sa
// nepíše ručne — vlajka sa POČÍTA z ISO2 a názov dodá `Intl.DisplayNames` v aktívnom
// jazyku, viď `lib/countryOptions.ts`. Známe krajiny stoja hore vo vlastnej skupine,
// aby Slovák nescrolloval cez 230 položiek.
// ⚠️ Legacy hodnota `UK` sa zobrazí ako Spojené kráľovstvo, ale uloží sa `GB`.
function NationalitySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { frequent, rest } = countryOptions(lang);
  const isOther = value?.toUpperCase() === COUNTRY_OTHER;
  const iso2 = isOther ? null : normalizeCountryValue(value);
  const selected = isOther ? COUNTRY_OTHER : (iso2 ?? '');
  return (
    <span
      className="pf-field pf-selchip inline-flex items-center gap-1.5"
      style={{
        borderRadius: 999,
        padding: '4px 12px 4px 12px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 10,
        color: T.ink,
        cursor: 'pointer',
      }}
    >
      <span aria-hidden style={{ fontSize: 12, lineHeight: 1 }}>
        {iso2 ? flagEmojiFromISO2(iso2) : '\u{1F3F3}\uFE0F'}
      </span>
      <span style={{ fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
        {iso2 ? iso2ToISO3(iso2) : tx('pack.profile.countryOtherShort', 'N/A')}
      </span>
      <ChevronDown aria-hidden className="h-3 w-3 shrink-0" style={{ color: T.inkDim }} />
      {/* Natívny <select> leží priehľadný nad celým chipom — zoznam ostáva systémový
          (na mobile je to picker, ktorý človek pozná), viditeľný tvar je náš. */}
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        aria-label={tx('pack.profile.countryAria', 'Country')}
      >
        <optgroup label={tx('pack.profile.countryFrequent', 'Nearby')}>
          {frequent.map((o) => (
            <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
          ))}
        </optgroup>
        <optgroup label={tx('pack.profile.countryAll', 'All countries')}>
          {rest.map((o) => (
            <option key={o.value} value={o.value}>{o.flag} {o.label}</option>
          ))}
          <option value={COUNTRY_OTHER}>{'\u{1F3F3}\uFE0F'} {tx('pack.profile.countryOther', 'Other')}</option>
        </optgroup>
      </select>
    </span>
  );
}

// Status (relationship) — ONE pill dropdown instead of separate Single/Taken
// pills (zadanie-profil-shrink-2026-07-24). Empty value = placeholder/clear.
function StatusSelect({
  value,
  onChange,
}: {
  value: RelationshipStatus | undefined;
  onChange: (v: RelationshipStatus | undefined) => void;
}) {
  const t = useT();
  // Štítky o človeku v jeho rode (⚥ v slovníku) — profil je vlastný, rod berieme z neho.
  const rodG = useProfile().profile?.human?.gender ?? '';
  const tx = (key: string, fallback: string) => { const v = t(key, { rod: rodG }); return v === key ? fallback : v; };
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? (e.target.value as RelationshipStatus) : undefined)}
      className="pf-field pf-selpad"
      style={{
        borderRadius: 999,
        width: '100%',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: PACK_TEXT.label,
        color: value ? T.ink : T.inkFaint,
        cursor: 'pointer',
      }}
    >
      <option value="">—</option>
      {RELATIONSHIP_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.emoji} {tx(`pack.profileTag.${opt.value}`, opt.labelEN)}</option>
      ))}
    </select>
  );
}

// Full-width text input with the same on-blur autosave pattern as WordLimitTextarea
// / MiniChipInput — used for Nickname. Compact sizing (zadanie-profil-shrink-2026-07-24)
// matches the Name input it now sits next to.
function AutoSaveTextInput({
  value,
  onSave,
  placeholder,
  align = 'left',
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  align?: 'left' | 'center';
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { if (local !== value) onSave(local); }}
      placeholder={placeholder}
      className="pf-field pf-field--flat"
      style={{
        width: '100%',
        borderRadius: 8,
        padding: '8px 12px',
        color: T.ink,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 12,
        textAlign: align,
      }}
    />
  );
}

// "Show as: Name / Nickname" — 2-option segment, same visual language as
// VisibilityToggle (dark-fill selected pill inside a hairline pill track).
function DisplayAsToggle({
  value,
  onChange,
}: {
  value: 'name' | 'nickname' | 'packName';
  onChange: (v: 'name' | 'nickname' | 'packName') => void;
}) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  // NÁZOV SVORKY ako tretia voľba (Matej 21. 10. 2026: „pri zobraziť by som dal aj názov svorky").
  const opts: Array<{ key: 'name' | 'nickname' | 'packName'; label: string }> = [
    { key: 'name', label: tx('pack.profile.name', 'Name') },
    { key: 'nickname', label: tx('pack.profile.nickname', 'Nickname') },
    { key: 'packName', label: tx('pack.profile.packName', 'Pack name') },
  ];
  /* Matej 2026-08-13: „zobraziť meno/prezývky urob o trošku výraznejšie je to takmer
     neviditeľné a tá pils okolo tú nezarovnaj až po koniec textarea nad ňou".
     Vzhľad je CELÝ v `.pf-toggle` / `.pf-toggle__opt` (packTheme.ts) — inline štýl by
     na mobile prebil media query, ktorá prepínač zmenšuje, aby sa vošiel do karty.
     Modrá (`T.partHek`) tu bola do 12. 8., zrušená spolu so zvyškom modrej v bloku. */
  return (
    <div className="pf-toggle inline-flex items-center" style={{ borderRadius: 999, padding: 4, gap: 3 }}>
      {opts.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          aria-pressed={value === opt.key}
          className={`pf-toggle__opt${value === opt.key ? ' is-on' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}


