// Odovzdanie súboru (PDF, obrázok) z appky aj z webu. Jediné miesto, odkiaľ PDF a leták idú von.
// V appke: súbor do dočasného priečinka a systémový hárok (Tlačiť, Uložiť do Súborov, poslať). Ide to natívne, takže
// to nezávisí od `navigator.share` vo WebView (Android ho nemusí mať) ani od toho, či po dlhom kreslení ešte platí ťuk.
// Starý natívny build plugin nemá: spadne to na Web Share a až potom vráti `false`.
// ⚠️ V súbore môže byť adresa a telefón. Ostáva len v dočasnom priečinku telefónu, nikam sa nenahráva.
import { IS_APP } from '@/lib/isApp';

const toBase64 = (blob: Blob) => new Promise<string>((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(String(fr.result).split(',')[1] ?? '');
  fr.onerror = () => rej(fr.error);
  fr.readAsDataURL(blob);
});

const isCancel = (e: unknown) => {
  const x = e as { name?: string; message?: string };
  return x?.name === 'AbortError' || /cancel/i.test(x?.message ?? '');
};

/** Vráti `false`, keď to zariadenie nevie odovzdať (appka bez pluginu aj bez Web Share). Zrušenie človekom je `true`. */
export async function shareFile(blob: Blob, name: string): Promise<boolean> {
  if (IS_APP) {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isPluginAvailable('Share') && Capacitor.isPluginAvailable('Filesystem')) {
      const [{ Filesystem, Directory }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
      const { uri } = await Filesystem.writeFile({ path: name, data: await toBase64(blob), directory: Directory.Cache });
      await Share.share({ title: name, files: [uri] }).catch((e) => { if (!isCancel(e)) throw e; });
      return true;
    }
    const file = new File([blob], name, { type: blob.type });
    if (!navigator.canShare?.({ files: [file] })) return false;
    await navigator.share({ files: [file], title: name }).catch((e) => { if (e?.name !== 'AbortError') throw e; });
    return true;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}
