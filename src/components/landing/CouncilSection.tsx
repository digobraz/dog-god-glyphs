import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';
import iconDogLover from '@/assets/icons/council-doglover.svg';
import iconDeveloper from '@/assets/icons/council-developer.svg';
import iconDogPro from '@/assets/icons/council-dogpro.svg';
import iconCreator from '@/assets/icons/council-creator.svg';
import iconMedia from '@/assets/icons/council-media.svg';
import iconInvestor from '@/assets/icons/council-investor.svg';
import iconCommunity from '@/assets/icons/council-community.svg';
import iconBusiness from '@/assets/icons/council-business.svg';

// label/desc = i18n kľúče (module-level dáta nemôžu volať t() — preloží sa pri renderi)
const ROLES = [
  { id: 'dog-lover', icon: iconDogLover },
  { id: 'developer', icon: iconDeveloper },
  { id: 'dog-pro',   icon: iconDogPro },
  { id: 'creator',   icon: iconCreator },
  { id: 'media',     icon: iconMedia },
  { id: 'investor',  icon: iconInvestor },
  { id: 'community', icon: iconCommunity },
  { id: 'business',  icon: iconBusiness },
];

export function CouncilSection() {
  const t = useT();
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !name.trim() || !email.trim() || !consent) return;
    setStatus('loading');
    const { error } = await supabase.from('contacts').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      message: message.trim() || null,
    });
    setStatus(error ? 'error' : 'done');
  };

  return (
    <section id="council" className="council-section" style={{ scrollMarginTop: 80 }}>
      <style>{`
        .council-section {
          background: #000;
          padding: clamp(72px, 14vh, 120px) 20px clamp(80px, 16vh, 140px);
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 2;
        }
        .council-inner {
          width: 100%; max-width: 1100px;
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(30px, 5vh, 52px); text-align: center;
        }
        /* ── Beige papyrus block (like /pack cards) — full width, image | form ── */
        .council-card {
          width: 100%;
          background: linear-gradient(165deg, #FFFBF2 0%, #F4E8CC 52%, #E7D8B8 100%);
          border: 1px solid rgba(31,26,14,0.16);
          border-radius: clamp(18px, 2vw, 28px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.55);
          padding: clamp(22px, 3vw, 46px);
          display: grid; grid-template-columns: 1fr; gap: clamp(22px, 4vh, 38px);
          align-items: center; text-align: center;
        }
        @media (min-width: 880px) {
          .council-card {
            grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
            gap: clamp(30px, 3.5vw, 56px); align-items: stretch; text-align: left;
          }
        }
        /* ── Left: pharaoh figure + headline under it ── */
        .council-figure {
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          gap: clamp(12px, 2.4vh, 22px);
        }
        .council-figure img {
          width: 100%; max-width: 420px; height: auto; display: block;
          filter: drop-shadow(0 14px 34px rgba(31,26,14,0.30));
        }
        @media (max-width: 879px) { .council-figure img { max-width: 300px; } }
        /* ── Right: form column ── */
        .council-content {
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          gap: clamp(20px, 3vh, 30px); min-width: 0;
        }
        .council-headline-wrap {
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(6px, 1.2vh, 12px);
        }
        .council-headline-wrap .council-logo {
          width: clamp(178px, 22vw, 267px); max-width: 267px; height: auto; display: block;
          filter: drop-shadow(0 2px 3px rgba(31,26,14,0.18));
        }
        .council-headline {
          font-family: 'Cinzel', serif; font-weight: 700; white-space: nowrap;
          /* padding-top = headroom pre diakritiku nad verzálkami (background-clip:text ju inak osekne) */
          padding-top: 0.15em;
          font-size: clamp(2.1rem, 4.6vw, 3.4rem); line-height: 1.05;
          letter-spacing: 0.02em; margin: 0;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(31,26,14,0.22));
        }
        .council-form-title {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0 0 -6px;
          font-size: clamp(1.4rem, 2.4vw, 1.85rem); letter-spacing: 0.02em; line-height: 1.1;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(31,26,14,0.18));
        }
        .council-sub {
          font-family: 'Space Grotesk', sans-serif; font-size: clamp(0.95rem, 1.3vw, 1.1rem);
          line-height: 1.65; color: rgba(31,26,14,0.66); margin: 0;
          max-width: 540px;
        }
        /* ── Role grid ── */
        .council-roles {
          width: 100%; display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 600px) { .council-roles { grid-template-columns: repeat(4, 1fr); } }
        .role-card {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; padding: clamp(11px, 1.6vw, 15px) 8px; min-height: 92px;
          background: linear-gradient(135deg, hsl(224 40% 18%), hsl(45 70% 28%));
          border: 1.5px solid rgba(201,154,63,0.25);
          border-radius: 12px; cursor: pointer;
          transition: filter .2s ease, box-shadow .2s ease, border-color .2s ease;
          user-select: none;
        }
        .role-card:hover {
          filter: brightness(1.18);
          border-color: rgba(201,154,63,0.55);
        }
        .role-card.selected {
          filter: brightness(1.14);
          border-color: #B98BE8;
          box-shadow: 0 0 0 2px rgba(46,95,208,0.95), 0 0 24px 5px rgba(46,95,208,0.70);
        }
        .role-icon {
          width: 30px; height: 30px; object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.80;
          transition: opacity .2s ease;
        }
        .role-card.selected .role-icon,
        .role-card:hover .role-icon { opacity: 1; }
        .role-label {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.62rem, 0.85vw, 0.74rem); letter-spacing: 0.05em;
          color: #FAF4EC; text-align: center; line-height: 1.25; margin: 0;
        }
        /* desc = hover overlay (no layout shift) */
        .role-desc {
          position: absolute; inset: 0; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          padding: 10px 12px; margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.64rem, 0.85vw, 0.74rem); line-height: 1.4;
          color: #FAF4EC; text-align: center;
          background: linear-gradient(135deg, rgba(36,24,54,0.97) 0%, rgba(58,42,18,0.97) 100%);
          opacity: 0; pointer-events: none;
          transition: opacity .2s ease;
        }
        .role-card:hover .role-desc { opacity: 1; }
        @media (hover: none) {
          /* touch: no hover → keep desc visible, smaller card text */
          .role-desc { position: static; inset: auto; background: none; opacity: 1;
            color: rgba(250,244,236,0.45); padding: 0; }
          .role-card { min-height: 0; }
        }
        /* ── Form ── */
        .council-form {
          width: 100%; display: flex; flex-direction: column; gap: 14px;
        }
        .council-input-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        @media (max-width: 599px) { .council-input-row { grid-template-columns: 1fr; } }
        .council-input {
          width: 100%; padding: 14px 18px;
          background: rgba(255,255,255,0.62); border: 1.5px solid rgba(31,26,14,0.18);
          border-radius: 8px; outline: none;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem;
          color: #1F1A0E; transition: border-color .2s ease, background .2s ease;
          box-sizing: border-box;
        }
        .council-input::placeholder { color: rgba(31,26,14,0.42); }
        .council-input:focus { border-color: rgba(201,154,63,0.75); background: rgba(255,255,255,0.85); }
        textarea.council-input { resize: vertical; min-height: 78px; }
        /* ── Consent checkbox (above submit) ── */
        .council-consent {
          display: flex; align-items: flex-start; gap: 10px;
          text-align: left; cursor: pointer; user-select: none;
        }
        .council-consent input {
          flex: 0 0 auto; appearance: none; -webkit-appearance: none;
          width: 18px; height: 18px; margin-top: 1px;
          border: 1.5px solid rgba(31,26,14,0.35); border-radius: 5px;
          background: rgba(255,255,255,0.62); cursor: pointer;
          transition: background .2s ease, border-color .2s ease;
          position: relative;
        }
        .council-consent input:checked {
          background: linear-gradient(135deg, #C99A3F 0%, #9A6E1F 100%);
          border-color: rgba(154,110,31,0.75);
        }
        .council-consent input:checked::after {
          content: ''; position: absolute; left: 5px; top: 1px;
          width: 5px; height: 10px; border: solid #FFF8EC;
          border-width: 0 2px 2px 0; transform: rotate(45deg);
        }
        .council-consent span {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.72rem, 0.95vw, 0.82rem); line-height: 1.45;
          color: rgba(31,26,14,0.62);
        }
        /* ── Submit (papyrus deep gold — matches card headline/title gradient) ── */
        .council-submit {
          align-self: center;
          padding: 14px 44px;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          border: 1px solid rgba(154,110,31,0.55);
          border-radius: 8px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.82rem, 1.1vw, 0.95rem); letter-spacing: 0.12em; text-transform: uppercase;
          color: #FFF8EC; white-space: nowrap;
          box-shadow: 0 8px 22px rgba(31,26,14,0.30), inset 0 1px 0 rgba(255,248,236,0.30);
          transition: transform 0.2s, box-shadow 0.22s, filter 0.22s;
        }
        .council-submit:hover:not(:disabled) { transform: scale(1.03); filter: brightness(1.08); box-shadow: 0 10px 28px rgba(31,26,14,0.38), inset 0 1px 0 rgba(255,248,236,0.30); }
        .council-submit:active:not(:disabled) { transform: scale(0.98); }
        .council-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; box-shadow: inset 0 1px 0 rgba(255,248,236,0.30); }
        /* ── Desktop: form fills the column so the textarea grows and the button
           drops to the bottom (its lower edge level with "NEEDS YOU." on the left).
           Button = full width of the textarea/form. ── */
        @media (min-width: 880px) {
          /* push the whole right block to the bottom — button stays level with
             "NEEDS YOU.", textarea shrinks, empty space lands at the TOP (top
             edge no longer aligned with the left column). */
          .council-content { justify-content: flex-end; }
          .council-form { flex: 0 0 auto; }
          textarea.council-input { flex: 0 0 auto; height: 92px; }
          .council-submit { align-self: stretch; width: 100%; }
        }
        /* ── Success ── */
        .council-success {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          padding: clamp(32px, 6vh, 56px) 20px;
        }
        .council-success-title {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(1.6rem, 3.5vw, 2.4rem); margin: 0;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .council-success-sub {
          font-family: 'Space Grotesk', sans-serif; font-size: 1rem;
          color: rgba(31,26,14,0.62); margin: 0;
        }
        .council-error {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem;
          color: rgba(255,120,100,0.85); text-align: center; margin: 0;
        }
      `}</style>

      <div className="council-inner">
        <div className="council-card">
        <div className="council-figure">
          <img src="/images/council-pharaoh.png" alt={t('about.council.imgAlt')} />
          <div className="council-headline-wrap">
            <img className="council-logo" src="/images/dogypt-logo-black-w.png" alt="DOGYPT" />
            <h2 className="council-headline">{t('about.council.headline')}</h2>
          </div>
        </div>

        <div className="council-content">
        <h3 className="council-form-title">{t('about.council.formTitle')}</h3>
        <p className="council-sub">
          {t('about.council.sub')}
        </p>

        {status === 'done' ? (
          <div className="council-success">
            <h3 className="council-success-title">{t('about.council.successTitle')}</h3>
            <p className="council-success-sub">{t('about.council.successSub')}</p>
          </div>
        ) : (
          <form className="council-form" onSubmit={submit} noValidate>
            {/* Role selector */}
            <div className="council-roles" role="group" aria-label={t('about.council.rolesAria')}>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`role-card${role === r.id ? ' selected' : ''}`}
                  onClick={() => setRole(r.id)}
                  aria-pressed={role === r.id}
                >
                  <img src={r.icon} alt="" className="role-icon" aria-hidden />
                  <p className="role-label">{t(`about.council.role.${r.id}.label`)}</p>
                  <p className="role-desc">{t(`about.council.role.${r.id}.desc`)}</p>
                </button>
              ))}
            </div>

            {/* Name + Email */}
            <div className="council-input-row">
              <input
                className="council-input"
                type="text"
                placeholder={t('about.council.fullName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
              <input
                className="council-input"
                type="email"
                placeholder={t('about.council.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Message */}
            <textarea
              className="council-input"
              placeholder={t('about.council.message')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {status === 'error' && (
              <p className="council-error">{t('about.council.error')}</p>
            )}

            <label className="council-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>{t('about.council.consent')}</span>
            </label>

            <button
              type="submit"
              className="council-submit"
              disabled={!role || !name.trim() || !email.trim() || !consent || status === 'loading'}
            >
              {status === 'loading' ? t('about.council.sending') : t('about.council.submit')}
            </button>
          </form>
        )}
        </div>
        </div>
      </div>
    </section>
  );
}
