import { useState } from 'react';
import { PACK_THEME } from './packTheme';
import { BrandIcon } from './BrandIcon';
import { useT } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { shareCard, downloadCard } from '@/lib/useShareCard';

const T = PACK_THEME;

interface PackShareCardProps {
  dogName: string | null;
  shareCardUrl: string | null;
}

// SHARE CARD section — the pre-generated 1080x1080 social image (ShareCard.tsx /
// ShareRender.tsx batch) surfaced on /pack so the owner can grab it. share_card_url
// is null for older dogs whose card hasn't been backfilled yet — shows a
// "preparing" placeholder instead of broken buttons.
export function PackShareCard({ dogName, shareCardUrl }: PackShareCardProps) {
  const t = useT();
  const { toast } = useToast();
  const [busy, setBusy] = useState<'share' | 'download' | null>(null);
  const name = dogName || 'Dogyptian';

  const handleShare = async () => {
    if (!shareCardUrl || busy) return;
    setBusy('share');
    try {
      const result = await shareCard({
        imageUrl: shareCardUrl,
        dogName: name,
        shareText: t('sharecard.shareText', { name }),
      });
      track('share_clicked', { channel: result, type: 'sharecard', location: 'pack' });
      if (result === 'download') toast({ title: t('sharecard.saved') });
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
