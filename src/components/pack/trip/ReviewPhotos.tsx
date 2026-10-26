// Fotky k recenzii výletu (testerka Daniela, 11. 10. 2026) — 1 až 3 kusy.
// Dva malé komponenty, aby sa do TripComments.tsx dotkol len tenký hunk:
//   <ReviewPhotoPicker> — výber + nahratie na Cloudinary (formulár recenzie)
//   <ReviewPhotoStrip>  — zobrazenie pod textom recenzie (klik = plná veľkosť)
// Fotka ide na Cloudinary (`trip-reviews/<slug>/`), do DB len URL (`trip_reviews.photos`).
import { useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_UI } from '@/components/pack/packTheme';
import { HandTrash } from '@/components/pack/HandIcons';
import { optimizePhoto, takeUploadBlob } from '@/components/pack/addtrip/photoOptimize';
import { uploadTripReviewPhoto, sizedUrl } from '@/services/cloudinaryService';

const T = PACK_THEME;
export const REVIEW_MAX_PHOTOS = 3;

const CSS = `
.rvp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.sm}px;}
.rvp-ph{position:relative;aspect-ratio:1;border-radius:${PACK_R.field}px;overflow:hidden;border:1px solid ${T.border};background:${T.tileBg};display:block;}
.rvp-ph img{width:100%;height:100%;object-fit:cover;display:block;}
.rvp-ph button{position:absolute;right:${PACK_SPACE.xs}px;top:${PACK_SPACE.xs}px;width:22px;height:22px;border-radius:${PACK_R.pill}px;cursor:pointer;background:${T.glass};border:1px solid ${T.onDarkBorder};color:${T.onDark};display:flex;align-items:center;justify-content:center;padding:0;}
.rvp-add{width:100%;margin-top:${PACK_SPACE.sm}px;cursor:pointer;border:1px dashed ${T.border};border-radius:${PACK_R.field}px;background:none;padding:${PACK_SPACE.md}px;color:${T.inkWarm};font-family:${FONT_UI};font-weight:500;font-size:${PACK_TEXT.label}px;}
.rvp-add:disabled{opacity:.5;cursor:default;}
.rvp-note{margin-top:${PACK_SPACE.xs}px;font-size:${PACK_TEXT.label}px;color:#B25640;}
.rvp-strip{display:flex;gap:${PACK_SPACE.sm}px;margin-top:${PACK_SPACE.sm}px;}
.rvp-strip .rvp-ph{width:72px;aspect-ratio:1;}
`;

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

export function ReviewPhotoPicker({ slug, photos, onChange }: {
  slug: string; photos: string[]; onChange: (next: string[]) => void;
}) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const add = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    const room = REVIEW_MAX_PHOTOS - photos.length;
    if (room <= 0 || picked.length === 0) return;
    setBusy(true); setNote(null);
    try {
      const stamp = Date.now();
      const out: string[] = [];
      for (const [i, f] of picked.slice(0, room).entries()) {
        const small = await optimizePhoto(f);
        if (!small) continue;
        const up = await uploadTripReviewPhoto(takeUploadBlob(small) ?? await dataUrlToBlob(small), slug, `${stamp}-${i}`);
        out.push(up.secureUrl);
      }
      if (out.length) onChange([...photos, ...out].slice(0, REVIEW_MAX_PHOTOS));
    } catch {
      setNote(t('pack.trip.cm.photoFail'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <style>{CSS}</style>
      {photos.length > 0 && (
        <div className="rvp-grid">
          {photos.map((src, i) => (
            <div className="rvp-ph" key={`${i}-${src}`}>
              <img src={sizedUrl(src, 300)} alt="" loading="lazy" decoding="async" />
              <button type="button" aria-label={t('pack.trip.cm.photoDrop')}
                onClick={() => onChange(photos.filter((_, x) => x !== i))}><HandTrash size={11} /></button>
            </div>
          ))}
        </div>
      )}
      {photos.length < REVIEW_MAX_PHOTOS && (
        <>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={add} />
          <button type="button" className="rvp-add" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? '…' : t('pack.trip.cm.photoAdd')}
          </button>
        </>
      )}
      {note && <div className="rvp-note">{note}</div>}
    </div>
  );
}

export function ReviewPhotoStrip({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) return null;
  return (
    <div className="rvp-strip">
      <style>{CSS}</style>
      {photos.slice(0, REVIEW_MAX_PHOTOS).map((src, i) => (
        <a className="rvp-ph" key={`${i}-${src}`} href={src} target="_blank" rel="noopener noreferrer"
           onClick={(e) => e.stopPropagation()}>
          <img src={sizedUrl(src, 200)} alt="" loading="lazy" decoding="async" />
        </a>
      ))}
    </div>
  );
}
