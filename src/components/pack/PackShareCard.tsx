import { useState } from 'react';
import { PACK_THEME } from './packTheme';
import { BrandIcon } from './BrandIcon';
import { useT } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { shareDog, downloadCard, facebookShare, whatsappShare, copyDogLink } from '@/lib/useShareCard';

const T = PACK_THEME;

interface PackShareCardProps {
  dogName: string | null;
  packNumber: number | null;
  shareCardUrl: string | null;
}

// SHARE CARD section — the pre-generated 1080x1080 social image (ShareCard.tsx /
// ShareRender.tsx batch) surfaced on /pack so the owner can grab it. share_card_url
// is null for older dogs whose card hasn't been backfilled yet — shows a
// "preparing" placeholder instead of broken buttons.
export function PackShareCard({ dogName, packNumber, shareCardUrl }: PackShareCardProps) {
  const t = useT();
  const { toast } = useToast();
  const [busy, setBusy] = useState<'share' | 'download' | null>(null);
  const name = dogName || 'Dogyptian';

  const handleShare = async () => {
    if (!shareCardUrl || !packNumber || busy) return;
    setBusy('share');
    try {
      const result = await shareDog({
        pack: packNumber,
        dogName: name,
        imageUrl: shareCardUrl,
        channel: 'native',
      });
      track('share_clicked', { channel: result, type: 'sharecard', location: 'pack' });
      if (result === 'copied') toast({ title: t('sharecard.linkCopied') });
    } catch (err) {
      toast({
        title: t('sharecard.saved'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  const handleFacebook = () => {
    if (!packNumber) return;
    facebookShare(packNumber, name);
    track('share_clicked', { channel: 'facebook', type: 'sharecard', location: 'pack' });
  };

  const handleWhatsapp = () => {
    if (!packNumber) return;
    whatsappShare(packNumber, name);
    track('share_clicked', { channel: 'whatsapp', type: 'sharecard', location: 'pack' });
  };

  const handleCopyLink = async () => {
    if (!packNumber) return;
    await copyDogLink(packNumber, name);
    track('share_clicked', { channel: 'copy', type: 'sharecard', location: 'pack' });
    toast({ title: t('sharecard.linkCopied') });
  };

  const handleDownload = async () => {
    if (!shareCardUrl || busy) return;
    setBusy('download');
    try {
      await downloadCard({ imageUrl: shareCardUrl, dogName: name });
      track('share_clicked', { channel: 'download', type: 'sharecard', location: 'pack' });
      toast({ title: t('sharecard.saved') });
    } catch (err) {
      toast({
        title: t('sharecard.saved'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section
      className="pack-card-hover w-full"
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 24,
        boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
        padding: '26px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <h3
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: T.ink,
          margin: 0,
          textAlign: 'center',
        }}
      >
        {t('sharecard.shareTitle', { name })}
      </h3>

      {shareCardUrl ? (
        <>
          <div
            style={{
              width: '100%',
              maxWidth: 320,
              borderRadius: 16,
              overflow: 'hidden',
              border: `1px solid ${T.border}`,
              background: '#000',
            }}
          >
            <img
              src={shareCardUrl}
              alt={t('sharecard.shareTitle', { name })}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-2.5" style={{ maxWidth: 320 }}>
            <button
              type="button"
              onClick={handleShare}
              disabled={busy !== null}
              className="flex-1 inline-flex items-center justify-center gap-2"
              style={{
                // .btn-gold (brand manuál v3.2 — LOCKED)
                background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                border: '1px solid rgba(250, 244, 236, 0.30)',
                borderRadius: 8,
                color: '#000',
                padding: '13px 16px',
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                boxShadow: '0 0 28px rgba(230, 158, 26, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                opacity: busy !== null ? 0.6 : 1,
                cursor: busy !== null ? 'default' : 'pointer',
              }}
            >
              <BrandIcon name="link" size={14} tint="dark" />
              {t('sharecard.shareButton')}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={busy !== null}
              className="flex-1 inline-flex items-center justify-center gap-2"
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                background: 'transparent',
                color: T.ink,
                padding: '13px 16px',
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                opacity: busy !== null ? 0.6 : 1,
                cursor: busy !== null ? 'default' : 'pointer',
              }}
            >
              <BrandIcon name="document" size={14} tint="dark" />
              {t('sharecard.download')}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleFacebook}
              aria-label={t('sharecard.facebook')}
              title={t('sharecard.facebook')}
              className="inline-flex items-center justify-center"
              style={{
                width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                background: T.cardSoft, border: `1.5px solid ${T.border}`, color: T.accentGold,
              }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                <path d="M13.5 21v-8.2h2.75l.41-3.2h-3.16V7.6c0-.93.26-1.56 1.59-1.56h1.7V3.18C15.98 3.12 15.06 3 13.98 3c-2.24 0-3.78 1.37-3.78 3.88v2.72H7.44v3.2h2.76V21h3.3z"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={handleWhatsapp}
              aria-label={t('sharecard.whatsapp')}
              title={t('sharecard.whatsapp')}
              className="inline-flex items-center justify-center"
              style={{
                width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                background: T.cardSoft, border: `1.5px solid ${T.border}`, color: T.accentGold,
              }}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/>
                <path d="M12.02 2C6.5 2 2.04 6.46 2.04 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.94 9.94 0 0 0 12.02 22C17.53 22 22 17.54 22 12S17.53 2 12.02 2zm0 18.1c-1.63 0-3.15-.45-4.45-1.23l-.32-.19-3.02.79.8-2.94-.21-.3A8.09 8.09 0 0 1 3.93 12c0-4.47 3.63-8.1 8.09-8.1 4.46 0 8.08 3.63 8.08 8.1 0 4.47-3.62 8.1-8.08 8.1z"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label={t('sharecard.copyLink')}
              title={t('sharecard.copyLink')}
              className="inline-flex items-center justify-center"
              style={{
                width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                background: T.cardSoft, border: `1.5px solid ${T.border}`, color: T.accentGold,
              }}
            >
              <BrandIcon name="link" size={14} tint="gold" />
            </button>
          </div>
        </>
      ) : (
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            color: T.inkDim,
            textAlign: 'center',
            margin: 0,
          }}
        >
          {t('sharecard.preparing')}
        </p>
      )}
    </section>
  );
}
