// Share Card download/share — plain async helpers for the /pack profile.
// Framework-light on purpose (no React state): callers own busy/toast/track.
//
// Why fetch→File instead of navigator.share({ url }): the Web Share API's
// url/text-only form can't attach an image on iOS/Android share sheets — you
// need a real File. share_card_url is a Cloudinary PNG (CORS-open), so we pull
// it client-side and hand the browser a File built from the blob.

export type ShareCardResult = 'native' | 'download';

function safeFileName(dogName: string): string {
  const base = (dogName || 'dog')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `dogypt-${base || 'dog'}.png`;
}

async function fetchAsFile(imageUrl: string, dogName: string): Promise<File> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`share card fetch failed: ${res.status}`);
  const blob = await res.blob();
  return new File([blob], safeFileName(dogName), { type: blob.type || 'image/png' });
}

export async function downloadCard({ imageUrl, dogName }: { imageUrl: string; dogName: string }): Promise<void> {
  const file = await fetchAsFile(imageUrl, dogName);
  const objectUrl = URL.createObjectURL(file);
  try {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function shareCard({
  imageUrl,
  dogName,
  shareText,
}: {
  imageUrl: string;
  dogName: string;
  shareText: string;
}): Promise<ShareCardResult> {
  try {
    const file = await fetchAsFile(imageUrl, dogName);
    const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
    const canShareFile = typeof nav.canShare === 'function' && nav.canShare({ files: [file] });
    if (canShareFile && typeof navigator.share === 'function') {
      await navigator.share({ files: [file], text: shareText, url: 'https://dogypt.com' });
      return 'native';
    }
  } catch (err) {
    // AbortError = user dismissed the native share sheet — that's a completed
    // interaction, not a failure, so don't fall through to a forced download.
    if (err instanceof DOMException && err.name === 'AbortError') return 'native';
    // Any other failure (fetch/File/share unsupported) falls through below.
  }
  await downloadCard({ imageUrl, dogName });
  return 'download';
}
