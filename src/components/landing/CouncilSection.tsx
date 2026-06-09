import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import iconDogLover from '@/assets/icons/council-doglover.svg';
import iconDeveloper from '@/assets/icons/council-developer.svg';
import iconDogPro from '@/assets/icons/council-dogpro.svg';
import iconCreator from '@/assets/icons/council-creator.svg';
import iconMedia from '@/assets/icons/council-media.svg';
import iconInvestor from '@/assets/icons/council-investor.svg';
import iconCommunity from '@/assets/icons/council-community.svg';
import iconBusiness from '@/assets/icons/council-business.svg';

const ROLES = [
  { id: 'dog-lover', icon: iconDogLover,   label: 'Dog Lover & Tester',      desc: 'Early access & honest feedback' },
  { id: 'developer', icon: iconDeveloper,  label: 'Developer / Designer',     desc: 'Build features, craft visuals' },
  { id: 'dog-pro',   icon: iconDogPro,     label: 'Dog Professional',         desc: 'Vet, trainer, shelter, breeder' },
  { id: 'creator',   icon: iconCreator,    label: 'Creator',                  desc: 'Video, photo, art for the pack' },
  { id: 'media',     icon: iconMedia,      label: 'Media / Influencer',       desc: 'Audience & coverage' },
  { id: 'investor',  icon: iconInvestor,   label: 'Investor',                 desc: 'Fund specific missions & shelters' },
  { id: 'community', icon: iconCommunity,  label: 'Community Builder',        desc: 'Organise people locally' },
  { id: 'business',  icon: iconBusiness,   label: 'Business & Partnerships',  desc: 'Open doors — brands, shelters, deals' },
];

export function CouncilSection() {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !name.trim() || !email.trim()) return;
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
        .council-headline {
          font-family: 'Cinzel', serif; font-weight: 700; white-space: nowrap;
          font-size: clamp(2.1rem, 4.6vw, 3.4rem); line-height: 1.05;
          letter-spacing: 0.02em; margin: 0;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(31,26,14,0.22));
        }
        .council-sub {
          font-family: 'Inter', sans-serif; font-size: clamp(0.95rem, 1.3vw, 1.1rem);
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
          background: linear-gradient(135deg, hsl(270 40% 18%), hsl(45 70% 28%));
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
          box-shadow: 0 0 0 2px rgba(139,95,192,0.95), 0 0 24px 5px rgba(139,95,192,0.70);
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
          font-family: 'Inter', sans-serif;
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
          font-family: 'Inter', sans-serif; font-size: 0.95rem;
          color: #1F1A0E; transition: border-color .2s ease, background .2s ease;
          box-sizing: border-box;
        }
        .council-input::placeholder { color: rgba(31,26,14,0.42); }
        .council-input:focus { border-color: rgba(201,154,63,0.75); background: rgba(255,255,255,0.85); }
        textarea.council-input { resize: vertical; min-height: 100px; }
        /* ── Submit ── */
        .council-submit {
          align-self: center;
          padding: 14px 44px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1.5px solid rgba(250,244,236,0.30);
          border-radius: 8px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.82rem, 1.1vw, 0.95rem); letter-spacing: 0.14em; text-transform: uppercase;
          color: #000; transition: filter .2s ease, transform .15s ease;
        }
        .council-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .council-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }
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
          font-family: 'Inter', sans-serif; font-size: 1rem;
          color: rgba(31,26,14,0.62); margin: 0;
        }
        .council-error {
          font-family: 'Inter', sans-serif; font-size: 0.85rem;
          color: rgba(255,120,100,0.85); text-align: center; margin: 0;
        }
      `}</style>

      <div className="council-inner">
        <div className="council-card">
        <div className="council-figure">
          <img src="/images/council-pharaoh.png" alt="A pharaoh and Hekthor — Dogypt needs you" />
          <h2 className="council-headline">We Need You.</h2>
        </div>

        <div className="council-content">
        <p className="council-sub">
          DOGYPT is built by people who know what a dog means.
          If you have something to bring — a skill, a voice, a vision — this is where it belongs.
        </p>

        {status === 'done' ? (
          <div className="council-success">
            <h3 className="council-success-title">You're in the Council.</h3>
            <p className="council-success-sub">We'll reach out when the time is right.</p>
          </div>
        ) : (
          <form className="council-form" onSubmit={submit} noValidate>
            {/* Role selector */}
            <div className="council-roles" role="group" aria-label="Choose your role">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`role-card${role === r.id ? ' selected' : ''}`}
                  onClick={() => setRole(r.id)}
                  aria-pressed={role === r.id}
                >
                  <img src={r.icon} alt="" className="role-icon" aria-hidden />
                  <p className="role-label">{r.label}</p>
                  <p className="role-desc">{r.desc}</p>
                </button>
              ))}
            </div>

            {/* Name + Email */}
            <div className="council-input-row">
              <input
                className="council-input"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
              <input
                className="council-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Message */}
            <textarea
              className="council-input"
              placeholder="Tell us what you bring to the table… (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {status === 'error' && (
              <p className="council-error">Something went wrong. Try again.</p>
            )}

            <button
              type="submit"
              className="council-submit"
              disabled={!role || !name.trim() || !email.trim() || status === 'loading'}
            >
              {status === 'loading' ? 'Sending…' : 'Join the Council'}
            </button>
          </form>
        )}
        </div>
        </div>
      </div>
    </section>
  );
}
