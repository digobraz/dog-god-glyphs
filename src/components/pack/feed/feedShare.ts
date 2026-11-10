// ZDIEĽANIE KAŽDEJ KARTY VO FEEDe (Matej 10. 11. 2026: „zdieľanie bude mať každý príspevok vo feede“).
// Jeden zdroj pre príspevok člena, výlet, citát, zvitok, príbeh aj podujatie z mapy.
// Poradie: fotka + text cez systémový hárok → `navigator.share` → skopírovaný text + toast.
// Text vždy nesie odkaz (verejná adresa, ak existuje, inak dogypt.com).
import { toast } from '@/hooks/use-toast';
import { shareFiles } from '@/lib/shareFile';
import { sizedUrl } from '@/services/cloudinaryService';

export const SHARE_HOME = 'https://dogypt.com';

type Tx = (key: string, fallback: string) => string;

/** `text` = popis, `url` = odkaz (predvolene dogypt.com), `photo` = Cloudinary adresa obrázka (nepovinná). */
export async function shareOut({ text, url, photo }: { text?: string; url?: string; photo?: string | null }, tx: Tx): Promise<void> {
  const body = `${text ? `${text}\n\n` : ''}DOGYPT · ${url ?? SHARE_HOME}`;
  try {
    if (photo) {
      const blob = await (await fetch(sizedUrl(photo, 1080))).blob();
      if (await shareFiles([{ blob, name: 'dogypt.jpg' }], body)) return;
    }
    if (typeof navigator.share === 'function') { await navigator.share({ text: body }); return; }
    await navigator.clipboard.writeText(body);
    toast({ title: tx('pack.feed.share.copied', 'Copied. Paste it wherever you like.') });
  } catch (e) {
    if ((e as { name?: string })?.name !== 'AbortError') toast({ title: tx('pack.feed.share.fail', 'Sharing did not work. Try again.') });
  }
}
