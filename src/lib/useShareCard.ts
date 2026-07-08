// Share Card download/share — plain async helpers for the /pack profile.
// Framework-light on purpose (no React state): callers own busy/toast/track.
//
// Why fetch→File instead of navigator.share({ url }): the Web Share API's
// url/text-only form can't attach an image on iOS/Android share sheets — you
// need a real File. share_card_url is a Cloudinary PNG (CORS-open), so we pull
// it client-side and hand the browser a File built from the blob.
//
// shareDog() is the current primary entry point (per-dog LINK whose OG image
// is the share card, so recipients land on a real page instead of a bare
// image file). shareCard() below is the older image-only path, kept in case
// something still imports it.

export type ShareCardResult = 'native' | 'download';
export type ShareDogResult = 'native' | 'copied';
export type ShareChannel = 'native' | 'facebook' | 'whatsapp' | 'copy' | 'download';

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

// ── per-dog LINK share (LOCKED format) ────────────────────────────────────
// https://dogypt.com/d/<pack>?ref=<pack>&utm_source=sharecard&utm_medium=<channel>
// The /d/:pack page carries the share-card OG image, so recipients get a real
// preview whichever platform they land from — not a raw PNG.
export function dogShareLink(pack: number, channel: ShareChannel | string): string {
  return `https://dogypt.com/d/${pack}?ref=${pack}&utm_source=sharecard&utm_medium=${channel}`;
}

// Primary "SHARE" button: link-first (image attached where the platform
// supports it). Returns which path actually happened so the caller can decide
// whether to toast ('copied' needs a toast; 'native' already showed a sheet).
export async function shareDog({
  pack,
  dogName,
  imageUrl,
  channel = 'native',
}: {
  pack: number;
  dogName: string;
  imageUrl: string;
  channel?: ShareChannel | string;
}): Promise<ShareDogResult> {
  const link = dogShareLink(pack, channel);
  const text = `${dogName} is one of the first 1,000,000 dogs of DOGYPT.`;
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };

  // Mobile + file support — attach the share card image alongside the link.
  try {
    if (typeof nav.canShare === 'function' && typeof navigator.share === 'function') {
      const file = await fetchAsFile(imageUrl, dogName);
      if (nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text, url: link });
        return 'native';
      }
    }
  } catch (err) {
    // AbortError = user dismissed the sheet — a completed interaction, not a failure.
    if (err instanceof DOMException && err.name === 'AbortError') return 'native';
    // Any other failure (fetch/File/share unsupported) falls through below.
  }

  // Mobile without file support — link + text only.
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text, url: link });
      return 'native';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'native';
      // fall through to clipboard copy below
    }
  }

  // Desktop (or share unsupported/failed) — copy the link; best-effort bundle
  // the image into the same clipboard write so a paste (e.g. into a DM) carries
  // both. If that combo isn't supported, fall back to a plain link copy.
  try {
    const ClipboardItemCtor = (window as typeof window & { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    if (ClipboardItemCtor && navigator.clipboard?.write) {
      const file = await fetchAsFile(imageUrl, dogName);
      const textBlob = new Blob([link], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItemCtor({ 'text/plain': textBlob, [file.type]: file }),
      ]);
      return 'copied';
    }
  } catch {
    // best-effort — falls through to the plain link copy below
  }
  await navigator.clipboard.writeText(link);
  return 'copied';
}

export function facebookShare(pack: number): void {
  window.open(
    'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(dogShareLink(pack, 'facebook')),
    '_blank',
    'noopener,width=640,height=640'
  );
}

export function whatsappShare(pack: number, dogName: string): void {
  window.open(
    'https://wa.me/?text=' + encodeURIComponent(dogName + ' — ' + dogShareLink(pack, 'whatsapp')),
    '_blank',
    'noopener'
  );
}

export function copyDogLink(pack: number): Promise<void> {
  return navigator.clipboard.writeText(dogShareLink(pack, 'copy'));
}
