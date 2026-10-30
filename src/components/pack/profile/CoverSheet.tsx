// TITULKA — ťuk na pozadie profilu (23. 10. 2026, Matej: *„na pozadie by sme mohli pri kliku
// vymeniť mať panel ako na ig = vidno fotky v našej galérii… vytvoriť album titulné foto a dať ich
// na rotáciu po dni = človek si tam pridá 20 fotiek a každý deň sa mu bude meniť… alebo nemusí"*).
//
// Tvar ako šuplík BONES: na mobile zdola s úchytom, od 768 px okno v strede; späť = šípka.
// Obsah: prepínač STRIEDAŤ PO DNI · mriežka albumu (ťuk = táto fotka stojí, ⨯ = vyhodiť z albumu)
// · prvá dlaždica PRIDAŤ (systémový výber fotiek, viac naraz).
// ⚠️ Polohu fotky (ťahanie hore/dole) nesie UPRAVIŤ PROFIL — tu sa len vyberá, ktorá.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSheetSwipe } from '@/components/pack/useSheetSwipe';
import { BackButton } from '@/components/pack/BackButton';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { HandTrash } from '@/components/pack/HandIcons';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, VEIL_CSS, PACK_SHADOW } from '@/components/pack/packTheme';
import { MODAL_MAX_H } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';
import { saveHuman, type HumanProfile } from '@/components/pack/profile/packProfile';
import { coverAlbumOf, coverOfDay } from '@/components/pack/profile/mePosts';
import { compressFile } from '@/lib/photoIntake';
import { uploadCoverPhoto, sizedUrl } from '@/services/cloudinaryService';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
/** Strop albumu — Matejových „20 fotiek" s rezervou. */
const MAX_ALBUM = 30;

const CSS = `
.cs-root.pk-veil{z-index:65;align-items:flex-end;padding:0;animation:cs-fade .3s ease both;}
.cs-sheet{position:relative;width:100%;max-height:${MODAL_MAX_H};display:flex;flex-direction:column;background:${T.cardGrad};color:${T.inkStrong};
  border-top:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;box-shadow:${T.panelShadow};font-family:${FONT_UI};
  animation:cs-up .38s cubic-bezier(.2,.8,.2,1) both;}
.cs-grab{flex:none;width:44px;height:4px;border-radius:${PACK_R.pill}px;background:${T.hairline};margin:${S.sm}px auto 0;}
.cs-head{flex:none;display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.lg}px ${S.md}px;}
.cs-head h2{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;}
.cs-body{overflow-y:auto;overscroll-behavior:contain;padding:0 ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);}
.cs-rot{display:flex;align-items:center;gap:${S.md}px;width:100%;padding:${S.md}px;margin-bottom:${S.md}px;border-radius:${PACK_R.tile}px;cursor:pointer;text-align:left;
  border:1px solid ${T.border};background:${T.card};color:${T.inkStrong};font-family:${FONT_UI};}
.cs-rot b{display:block;font-weight:600;font-size:${TX.body}px;}
.cs-rot small{display:block;font-size:${TX.label}px;color:${T.inkWarm};}
.cs-rot .sw{flex:none;margin-left:auto;width:44px;height:24px;border-radius:${PACK_R.pill}px;background:${T.hairline};position:relative;transition:background .2s ease;}
.cs-rot .sw::after{content:'';position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:${PACK_R.pill}px;background:#fff;box-shadow:${PACK_SHADOW.card};transition:transform .2s ease;}
.cs-rot.on .sw{background:${LAPIS.edge};}
.cs-rot.on .sw::after{transform:translateX(20px);}
.cs-rot:disabled{opacity:.5;cursor:default;}
.cs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;}
.cs-grid > *{position:relative;aspect-ratio:1;border-radius:${PACK_R.field}px;overflow:hidden;padding:0;border:0;cursor:pointer;background:${T.tileBg};}
.cs-grid img{width:100%;height:100%;object-fit:cover;display:block;}
.cs-add{display:flex !important;flex-direction:column;align-items:center;justify-content:center;gap:${S.xs}px;border:1.5px dashed ${T.cardEdge} !important;
  font-family:${FONT_UI};font-weight:600;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.cs-ph.on{box-shadow:inset 0 0 0 3px ${LAPIS.edge};}
.cs-ph .bd{position:absolute;left:${S.xs}px;top:${S.xs}px;padding:0 ${S.sm}px;border-radius:${PACK_R.pill}px;background:${LAPIS.grad};color:${LAPIS.ink};
  font-family:${FONT_UI};font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;}
.cs-ph .rm{position:absolute;right:${S.xs}px;top:${S.xs}px;width:24px;height:24px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;
  background:rgba(0,0,0,.6);color:#fff;font-size:${TX.body}px;line-height:1;}
.cs-note{margin:${S.md}px 0 0;font-size:${TX.label}px;color:${T.inkWarm};}
@media (min-width:768px){
  .cs-root.pk-veil{align-items:center;padding:${S.xl}px;}
  .cs-sheet{width:640px;max-height:86dvh;border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px;}
  .cs-grab{display:none;}
  .cs-head{padding-top:${S.lg}px;}
  .cs-body{padding:0 ${S.xl}px ${S.xl}px;}
  .cs-grid{grid-template-columns:repeat(4,1fr);}
}
@keyframes cs-up{from{transform:translateY(100%);}to{transform:none;}}
@keyframes cs-fade{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.cs-sheet,.cs-root.pk-veil{animation:none;}}
`;

export function CoverSheet({ uid, human, onClose }: {
  uid: string;
  human: HumanProfile | undefined;
  onClose: () => void;
}) {
  const sw = useSheetSwipe(onClose);
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { toast } = useToast();
  const [album, setAlbum] = useState<string[]>(() => coverAlbumOf(human));
  const [fixed, setFixed] = useState<string | null>(human?.coverPhoto ?? album[0] ?? null);
  const [rotate, setRotate] = useState(!!human?.coverRotate);
  const [busy, setBusy] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  // Každá zmena sa uloží hneď — šuplík nemá tlačidlo ULOŽIŤ (zavrieť = hotovo).
  const save = async (patch: Partial<HumanProfile>) => {
    try { await saveHuman(patch, { throwOnError: true }); }
    catch (err) {
      toast({ title: tx('pack.profile.toastUploadFailed', 'Upload failed'), description: err instanceof Error ? err.message : '', variant: 'destructive' });
    }
  };

  const add = async (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith('image/')).slice(0, MAX_ALBUM - album.length);
    if (!files.length) return;
    setBusy(files.length);
    const got: string[] = [];
    for (const f of files) {
      try {
        const { blob } = await compressFile(f);
        got.push((await uploadCoverPhoto(blob, uid)).secureUrl);
      } catch { /* jedna zlá fotka nezastaví ostatné */ }
      setBusy((b) => b - 1);
    }
    if (!got.length) {
      toast({ title: tx('pack.profile.toastUploadFailed', 'Upload failed'), variant: 'destructive' });
      return;
    }
    const next = [...album, ...got];
    setAlbum(next);
    // Prvá fotka do prázdneho albumu sa rovno stane titulkou — inak by sa nič nezmenilo.
    const first = !fixed ? got[0] : fixed;
    setFixed(first);
    await save({ coverAlbum: next, coverPhoto: first, ...(first !== human?.coverPhoto ? { coverY: 50 } : {}) });
  };

  const pick = async (u: string) => {
    setFixed(u);
    setRotate(false);
    // album ide vždy s ním — stará jediná titulka žije len v `coverPhoto` a výberom inej by vypadla.
    await save({ coverAlbum: album, coverPhoto: u, coverRotate: false, ...(u !== human?.coverPhoto ? { coverY: 50 } : {}) });
  };

  const drop = async (u: string) => {
    const next = album.filter((x) => x !== u);
    const nextFixed = fixed === u ? next[0] ?? null : fixed;
    setAlbum(next);
    setFixed(nextFixed);
    const stillRotate = rotate && next.length > 1;
    setRotate(stillRotate);
    // `coverPhoto: ''` = bez titulky (profil padne na fotku so psom), nie `undefined`, ktoré by sa neuložilo.
    await save({ coverAlbum: next, coverPhoto: nextFixed ?? '', coverRotate: stillRotate });
  };

  const toggleRotate = async () => {
    const on = !rotate;
    setRotate(on);
    await save({ coverAlbum: album, coverRotate: on });
  };

  const today = coverOfDay({ coverPhoto: fixed ?? undefined, coverAlbum: album, coverRotate: rotate });

  return createPortal(
    <div className="cs-root pk-veil pk-veil--modal" role="dialog" aria-modal="true" aria-label={tx('pack.cover.title', 'Cover photo')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{VEIL_CSS}</style>
      <style>{CSS}</style>
      <div className="cs-sheet" style={sw.sheetStyle}>
        <span className="cs-grab" aria-hidden {...sw.handle} />
        <div className="cs-head" {...sw.handle}>
          <h2>{tx('pack.cover.title', 'Cover photo')}</h2>
        </div>
        <div className="cs-body">
          <button type="button" className={`cs-rot${rotate ? ' on' : ''}`} onClick={toggleRotate} disabled={album.length < 2} aria-pressed={rotate}>
            <span>
              <b>{tx('pack.cover.rotate', 'A new cover every day')}</b>
              <small>{album.length < 2
                ? tx('pack.cover.rotateNeed', 'Add at least two photos to the album.')
                : tx('pack.cover.rotateHint', 'Your album takes turns, one photo a day.')}</small>
            </span>
            <span className="sw" aria-hidden />
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
          <div className="cs-grid">
            {album.length < MAX_ALBUM && (
              <button type="button" className="cs-add" onClick={() => fileRef.current?.click()} disabled={busy > 0}>
                <BrandIcon name={busy ? 'cycle' : 'plus'} size={22} tint="dark" />
                {busy ? `${busy}…` : tx('pack.cover.add', 'Add')}
              </button>
            )}
            {album.map((u) => (
              <button key={u} type="button" className={`cs-ph${!rotate && u === fixed ? ' on' : ''}`} onClick={() => pick(u)}>
                <img src={sizedUrl(u, 360)} alt="" loading="lazy" />
                {u === today && <span className="bd">{tx('pack.cover.today', 'Today')}</span>}
                <span className="rm" role="button" aria-label={tx('pack.compose.remove', 'Remove')}
                  onClick={(e) => { e.stopPropagation(); drop(u); }}><HandTrash size={13} /></span>
              </button>
            ))}
          </div>
          <p className="cs-note">{tx('pack.cover.pick', 'Tap a photo to keep it as your cover.')} {tx('pack.cover.note2', 'Drag the cover on the card to move it up or down.')}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
