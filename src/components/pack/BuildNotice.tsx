import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Send, Check, Paperclip, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { uploadFeedbackPhoto } from '@/services/cloudinaryService';
import { PACK_THEME } from './packTheme';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

// Deliberate "alert" accent — DOGYPT brand has no red, so this terracotta
// reads as a status signal (work-in-progress), not a brand colour.
const BRICK = '#B5482F';

interface BuildNoticeProps {
  ownerName: string;
  email: string | null;
}

export function BuildNotice({ ownerName, email }: BuildNoticeProps) {
  const t = useT();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || status === 'loading') return;
    setStatus('loading');
    try {
      let photoUrl: string | null = null;
      if (file) photoUrl = (await uploadFeedbackPhoto(file)).secureUrl;
      const body = photoUrl ? `${message.trim()}\n\n[photo] ${photoUrl}` : message.trim();
      const { error } = await supabase.from('contacts').insert({
        name: ownerName || email || 'Pack member',
        email: email ?? '',
        role: 'feedback',
        message: body,
      });
      setStatus(error ? 'error' : 'done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      className="pack-card-hover"
      style={{
        background: `linear-gradient(180deg, #FFF6F1 0%, ${T.card} 58%)`,
        border: `1.5px solid rgba(181,72,47,0.30)`,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 10px 30px -6px rgba(181,72,47,0.18), 0 8px 28px rgba(10,10,10,0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes bn-pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.45;transform:scale(0.82);} }
        .bn-dot { animation: bn-pulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* WIP badge */}
      <span
        className="inline-flex items-center gap-1.5 self-start"
        style={{
          background: BRICK,
          borderRadius: 999,
          padding: '5px 12px',
          fontFamily: "'Cinzel', serif",
          fontSize: 9.5,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#FFF3EE',
          boxShadow: '0 4px 14px -4px rgba(181,72,47,0.6)',
        }}
      >
        <span
          className="bn-dot"
          style={{ width: 6, height: 6, borderRadius: 999, background: '#FFD9CC', display: 'inline-block' }}
        />
        {t('pack.build.badge')}
      </span>

      <h4
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 20,
          letterSpacing: '0.04em',
          fontWeight: 700,
          color: T.ink,
          margin: '14px 0 6px',
        }}
      >
        {t('pack.build.heading')}
      </h4>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 14,
          lineHeight: 1.55,
          color: 'rgba(10, 10, 10, 0.7)',
          margin: 0,
        }}
      >
        {t('pack.build.body')}
      </p>

      {/* actions — pinned to the bottom so the card lines up with its neighbours */}
      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        {status === 'done' ? (
          <div
            className="flex items-center gap-2"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13.5,
              color: T.ink,
              padding: '10px 0',
            }}
          >
            <Check className="h-4 w-4 shrink-0" style={{ color: BRICK }} />
            {t('pack.build.successMsg')}
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('pack.build.placeholder')}
              style={{
                width: '100%',
                minHeight: 84,
                resize: 'vertical',
                background: 'rgba(31,26,14,0.03)',
                border: `1px solid ${T.hairline}`,
                borderRadius: 10,
                padding: '10px 12px',
                outline: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                color: T.ink,
                boxSizing: 'border-box',
              }}
            />

            {/* Photo attachment — "proof" */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <div
                className="flex items-center gap-2"
                style={{
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 10,
                  padding: 6,
                  background: 'rgba(31,26,14,0.03)',
                }}
              >
                <img
                  src={preview}
                  alt={t('pack.build.attachmentPreviewAlt')}
                  style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                />
                <span
                  className="flex-1 truncate"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: T.inkDim }}
                >
                  {file?.name}
                </span>
                <button
                  type="button"
                  onClick={() => pickFile(null)}
                  aria-label={t('pack.build.removePhotoAriaLabel')}
                  className="inline-flex items-center justify-center shrink-0"
                  style={{ width: 26, height: 26, borderRadius: 999, border: `1px solid ${T.hairline}`, color: T.inkDim }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 self-start"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: T.inkDim,
                  padding: '2px 0',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                <Paperclip className="h-3.5 w-3.5" />
                {t('pack.build.attachPhoto')}
              </button>
            )}

            {status === 'error' && (
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: BRICK }}>
                {t('pack.build.errorMsg')}
              </span>
            )}
            <button
              type="submit"
              disabled={!message.trim() || status === 'loading'}
              className="inline-flex items-center justify-center gap-2 w-full"
              style={{
                background: BRICK,
                border: 'none',
                borderRadius: 10,
                color: '#FFF8F2',
                padding: '11px 16px',
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: message.trim() ? 'pointer' : 'default',
                opacity: message.trim() && status !== 'loading' ? 1 : 0.55,
              }}
            >
              <Send className="h-3.5 w-3.5" />
              {status === 'loading' ? (file ? t('pack.build.uploading') : t('pack.build.sending')) : t('pack.build.sendBtn')}
            </button>
          </form>
        )}

        {/* Council — links to the full role-based form on /about */}
        <Link
          to="/about#council"
          className="inline-flex items-center gap-1.5 mt-3"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12.5,
            color: T.inkDim,
            textDecoration: 'none',
          }}
        >
          {t('pack.build.councilPrompt')} <strong style={{ color: BRICK }}>{t('pack.build.councilCta')}</strong>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
