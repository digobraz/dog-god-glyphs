// TVORBA Z PROFILU — príspevok · story · album (23. 10. 2026, Matej: *„akčné tlačítko = pridať
// príspevok, story, album, zápisku — potrebujeme to postaviť na mobil ako to má aj ig"*).
//
// Kôš 3 (ROBÍM ÚLOHU): bez lišty, jedno gesto späť = šípka vľavo hore (krížik v `/pack` nie je).
// Na mobile celé okno, od 768 px okno v strede. Mountuje ho LIŠTA (`PackLayout`) cez `onOpenCompose`,
// takže sa otvorí z panelu `+` aj z `+` na fotke v profile a človek ostane tam, kde stál (§4.2).
//
// ⚠️ GALÉRIA TELEFÓNU: web ju vidieť nesmie — `<input type=file multiple>` otvorí systémový výber
//    fotiek (na iPhone tá istá mriežka ako vo Fotkách). Vlastná mriežka galérie ako na IG príde až
//    v natívnej appke (Capacitor plugin na knižnicu fotiek) — tento súbor sa vtedy zmení len vo výbere.
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BackButton } from '@/components/pack/BackButton';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { HandTrash } from '@/components/pack/HandIcons';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, PF_FIELD_CSS } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { usePackUser } from '@/hooks/usePackUser';
import { sizedUrl } from '@/services/cloudinaryService';
import { publish, type ComposeMode, type Visibility } from '@/components/pack/profile/mePosts';
import { PlaceField, type PostPlace } from '@/components/pack/profile/PlaceField';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
/** Najviac fotiek naraz — album ich znesie viac, story a príspevok sú krátke. */
const MAX: Record<ComposeMode, number> = { post: 10, moment: 10, album: 30 };

const CSS = `
.mc-root{position:fixed;inset:0;z-index:1300;display:flex;align-items:stretch;justify-content:center;background:rgba(0,0,0,.62);animation:mc-fade .25s ease both;}
.mc-box{position:relative;width:100%;display:flex;flex-direction:column;background:${T.cardGrad};color:${T.inkStrong};font-family:${FONT_UI};animation:mc-up .32s cubic-bezier(.2,.8,.2,1) both;}
.mc-head{flex:none;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:${S.md}px;padding:calc(env(safe-area-inset-top,0px) + ${S.md}px) ${S.lg}px ${S.md}px;border-bottom:1px solid ${T.hairline};}
.mc-head h2{margin:0;text-align:center;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.lead}px;letter-spacing:.14em;text-transform:uppercase;}
.mc-go{border:1px solid ${LAPIS.deep};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};border-radius:${PACK_R.field}px;cursor:pointer;
  padding:${S.sm}px ${S.lg}px;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;}
.mc-go:disabled{opacity:.4;cursor:default;}
.mc-body{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:${S.lg}px ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.xl}px);display:flex;flex-direction:column;gap:${S.lg}px;}
.mc-body > *{flex:none;}
.mc-pick{display:grid;grid-template-columns:1fr 1fr;gap:${S.md}px;}
.mc-pick button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.sm}px;aspect-ratio:1;border-radius:${PACK_R.tile}px;cursor:pointer;
  border:1.5px dashed ${T.cardEdge};background:${T.tileBg};color:${T.inkStrong};font-family:${FONT_UI};font-weight:600;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;}
.mc-story{position:relative;align-self:center;width:min(100%,320px);aspect-ratio:9/16;border-radius:${PACK_R.card}px;overflow:hidden;background:${T.pageBg};box-shadow:${T.panelShadow};}
.mc-story img{width:100%;height:100%;object-fit:cover;display:block;}
.mc-story p{position:absolute;left:${S.lg}px;right:${S.lg}px;bottom:${S.xl}px;margin:0;text-align:center;font-family:${FONT_UI};font-weight:600;font-size:${TX.h2}px;line-height:1.3;color:#fff;
  text-shadow:0 1px 12px rgba(0,0,0,.7);white-space:pre-wrap;word-break:break-word;}
.mc-strip{display:flex;gap:${S.sm}px;overflow-x:auto;scrollbar-width:none;padding-bottom:${S.xs}px;}
.mc-strip::-webkit-scrollbar{display:none;}
.mc-th{position:relative;flex:none;width:88px;height:88px;border-radius:${PACK_R.tile}px;overflow:hidden;border:2px solid transparent;padding:0;cursor:pointer;background:${T.tileBg};}
.mc-th.on{border-color:${LAPIS.edge};}
.mc-th img{width:100%;height:100%;object-fit:cover;display:block;}
.mc-th .rm{position:absolute;right:${S.xs}px;top:${S.xs}px;width:24px;height:24px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;background:rgba(0,0,0,.6);color:#fff;font-size:${TX.body}px;line-height:1;}
.mc-th.add{display:grid;place-items:center;border:1.5px dashed ${T.cardEdge};}
.mc-lbl{margin:0 0 ${S.sm}px;font-family:${FONT_UI};font-weight:500;font-size:${TX.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.mc-dogs{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.mc-dog{display:inline-flex;align-items:center;gap:${S.sm}px;padding:${S.xs}px ${S.md}px ${S.xs}px ${S.xs}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1.5px solid ${T.border};background:${T.card};color:${T.inkStrong};font-family:${FONT_UI};font-weight:500;font-size:${TX.label}px;}
.mc-dog img,.mc-dog i{width:28px;height:28px;border-radius:${PACK_R.pill}px;object-fit:cover;display:block;background:${T.tileBg};}
.mc-dog.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.mc-vis{display:flex;gap:${S.sm}px;}
.mc-vis button{flex:1;padding:${S.sm}px ${S.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;border:1.5px solid ${T.border};background:${T.card};color:${T.inkStrong};
  font-family:${FONT_UI};font-weight:500;font-size:${TX.label}px;}
.mc-vis button.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
.mc-note{margin:${S.xs}px 0 0;font-size:${TX.label}px;color:${T.inkWarm};}
/* NÁHĽAD OREZU (FEED 2, Matej 26. 10.: „vysoká fotka sa oreže, ale autor vidí náhľad orezu pri pridávaní ako na IG").
   Rám má pomer, v akom fotku uvidí feed: široká ostáva, vysoká sa oreže na 4:5. */
.mc-crop{position:relative;align-self:center;width:min(100%,400px);overflow:hidden;border-radius:${PACK_R.tile}px;background:${T.pageBg};box-shadow:${T.panelShadow};}
.mc-crop img{width:100%;height:100%;object-fit:cover;display:block;}
/* OTÁZKA „Z VÝLETU / Z PRÍRODY?" — povinná, BEZ predvoľby (predklikané ≠ súhlas). */
.mc-ask{display:grid;grid-template-columns:1fr 1fr;gap:${S.md}px;}
.mc-ask button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.sm}px;padding:${S.lg}px ${S.md}px;border-radius:${PACK_R.tile}px;cursor:pointer;
  border:1.5px solid ${T.border};background:${T.card};color:${T.inkStrong};font-family:${FONT_UI};font-weight:600;font-size:${TX.body}px;}
.mc-ask button.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
@media (min-width:768px){
  .mc-root{align-items:center;padding:${S.xl}px;}
  .mc-box{width:640px;max-height:90dvh;border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.card}px;box-shadow:${T.panelShadow};}
  .mc-head{padding-top:${S.md}px;}
  .mc-body{padding:${S.xl}px;}
}
@keyframes mc-up{from{transform:translateY(24px);opacity:0;}to{transform:none;opacity:1;}}
@keyframes mc-fade{from{opacity:0;}to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.mc-root,.mc-box{animation:none;}}
`;

export function MeCompose({ mode, onClose }: { mode: ComposeMode; onClose: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { toast } = useToast();
  const { session } = usePackIdentity();
  const uid = session?.user?.id ?? null;
  const { dogs } = usePackUser(uid);

  const [files, setFiles] = useState<File[]>([]);
  const [cur, setCur] = useState(0);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [dogIds, setDogIds] = useState<string[]>([]);
  const [place, setPlace] = useState<PostPlace | null>(null);
  // MINIFLOW PRÍSPEVKU (Matej 25. 10. 2026: *„pri pridávaní príspevku taký miniflow — vybrať možnosť foto,
  // viac foto, a ak klikne lokalitu, vie vybrať pin z mapy"*): krok 1 = fotky, krok 2 = text, lokalita, psy, kto vidí.
  // Story a album ostávajú na jednej obrazovke (oba sú dnes vypnuté).
  const [step, setStep] = useState<1 | 2>(1);
  const flow = mode === 'post';
  // Story aj príspevok idú svorke (členom) — kto chce len pre seba, prepne. RLS pustí cudzím
  // len `public` a len zaplateným členom, takže „svorka" nie je verejný web.
  const [vis, setVis] = useState<Visibility>('public');
  // Z výletu / z prírody? `null` = neodpovedal — príspevok sa vtedy neodošle (áno ⇒ vo feede 🎯 TRIPWISH).
  const [nature, setNature] = useState<boolean | null>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const galRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose, busy]);

  const addFiles = (list: FileList | null) => {
    const picked = Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));
    if (!picked.length) return;
    setFiles((prev) => [...prev, ...picked].slice(0, MAX[mode]));
  };
  const remove = (i: number) => {
    setFiles((prev) => prev.filter((_, k) => k !== i));
    setCur((c) => Math.max(0, c >= i ? c - 1 : c));
  };
  const toggleDog = (id: string) => setDogIds((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  const heading = mode === 'moment' ? tx('pack.compose.newStory', 'New story')
    : mode === 'album' ? tx('pack.compose.newAlbum', 'New album')
      : tx('pack.compose.newPost', 'New post');
  const ready = files.length > 0 && !!uid && (mode !== 'album' || title.trim().length > 0) && (mode !== 'post' || nature !== null);

  const share = async () => {
    if (!ready || !uid || busy) return;
    setBusy(true);
    try {
      await publish({ uid, mode, files, body, title, dogIds, visibility: vis, place: mode === 'post' ? place : null, nature: mode === 'post' && nature === true });
      toast({ title: mode === 'moment' ? tx('pack.compose.storyDone', 'Your story is live for 24 hours') : tx('pack.compose.done', 'Shared') });
      onClose();
    } catch (err) {
      toast({
        title: tx('pack.profile.toastUploadFailed', 'Upload failed'),
        description: err instanceof Error ? err.message : tx('pack.profile.toastUnknownError', 'Unknown error'),
        variant: 'destructive',
      });
      setBusy(false);
    }
  };

  const inputs = (
    <>
      <input ref={galRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
    </>
  );

  return createPortal(
    <div className="mc-root" role="dialog" aria-modal="true" aria-label={heading}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <style>{PF_FIELD_CSS}</style>
      <style>{CSS}</style>
      <div className="mc-box">
        <div className="mc-head">
          <BackButton tone="pale" onClick={() => { if (busy) return; if (flow && step === 2) setStep(1); else onClose(); }}
            label={flow && step === 2 ? tx('pack.compose.back', 'Back') : tx('pack.network.close', 'Close')} />
          <h2>{heading}</h2>
          {flow && step === 1 ? (
            <button type="button" className="mc-go" disabled={files.length === 0} onClick={() => setStep(2)}>
              {tx('pack.compose.next', 'Next')}
            </button>
          ) : (
            <button type="button" className="mc-go" disabled={!ready || busy} onClick={share}>
              {busy ? tx('pack.compose.sharing', 'Sharing…') : tx('pack.compose.share', 'Share')}
            </button>
          )}
        </div>
        <div className="mc-body">
          {inputs}
          {flow && step === 2 ? (
            <div className="mc-strip">
              {urls.map((u) => <span key={u} className="mc-th"><img src={u} alt="" /></span>)}
            </div>
          ) : files.length === 0 ? (
            <div className="mc-pick">
              <button type="button" onClick={() => galRef.current?.click()}>
                <BrandIcon name="frame" size={32} tint="dark" />{tx('pack.compose.gallery', 'Gallery')}
              </button>
              <button type="button" onClick={() => camRef.current?.click()}>
                <BrandIcon name="camera" size={32} tint="dark" />{tx('pack.compose.camera', 'Camera')}
              </button>
            </div>
          ) : (
            <>
              {mode === 'post' && (
                <div className="mc-crop" style={{ aspectRatio: String(ratio ? Math.min(Math.max(ratio, 4 / 5), 2) : 4 / 5) }}>
                  <img src={urls[cur] ?? urls[0]} alt="" onLoad={(e) => { const im = e.currentTarget; if (im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight); }} />
                </div>
              )}
              {mode === 'post' && <p className="mc-note" style={{ textAlign: 'center', marginTop: 0 }}>{tx('pack.compose.cropNote', 'This is how the pack will see it.')}</p>}
              {mode === 'moment' && (
                <div className="mc-story">
                  <img src={urls[cur] ?? urls[0]} alt="" />
                  {body.trim() && <p>{body}</p>}
                </div>
              )}
              <div className="mc-strip">
                {urls.map((u, i) => (
                  <button key={u} type="button" className={`mc-th${mode !== 'album' && i === cur ? ' on' : ''}`} onClick={() => { setCur(i); setRatio(null); }}>
                    <img src={u} alt="" />
                    <span className="rm" role="button" aria-label={tx('pack.compose.remove', 'Remove')}
                      onClick={(e) => { e.stopPropagation(); remove(i); }}><HandTrash size={13} /></span>
                  </button>
                ))}
                {files.length < MAX[mode] && (
                  <button type="button" className="mc-th add" onClick={() => galRef.current?.click()} aria-label={tx('pack.compose.addMore', 'Add photos')}>
                    <BrandIcon name="plus" size={22} tint="dark" />
                  </button>
                )}
              </div>
              {mode === 'moment' && files.length > 1 && (
                <p className="mc-note">{tx('pack.compose.storyMany', 'Each photo becomes its own story frame.')}</p>
              )}
            </>
          )}

          {(!flow || step === 2) && <>
          {mode === 'album' && (
            <input className="pf-field" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)}
              placeholder={tx('pack.compose.albumTitle', 'Album name — e.g. Summer by the lake')} />
          )}
          <textarea className="pf-field" rows={mode === 'moment' ? 2 : 4} value={body} maxLength={mode === 'moment' ? 140 : 2200}
            onChange={(e) => setBody(e.target.value)}
            placeholder={mode === 'moment' ? tx('pack.compose.storyText', 'A line on the photo (optional)')
              : mode === 'album' ? tx('pack.compose.albumText', 'What is this album about? (optional)')
                : tx('pack.compose.postText', 'Write something about it…')} />

          {mode === 'post' && (
            <div>
              <p className="mc-lbl">{tx('pack.compose.natureQ', 'Is the photo from a trip or from nature?')}</p>
              <div className="mc-ask" role="radiogroup">
                <button type="button" role="radio" aria-checked={nature === true} className={nature === true ? 'on' : ''} onClick={() => setNature(true)}>
                  <BrandIcon name="mountain" size={32} tint="dark" />{tx('pack.compose.yes', 'Yes')}
                </button>
                <button type="button" role="radio" aria-checked={nature === false} className={nature === false ? 'on' : ''} onClick={() => setNature(false)}>
                  <BrandIcon name="house-heart" size={32} tint="dark" />{tx('pack.compose.no', 'No')}
                </button>
              </div>
              {nature === null && <p className="mc-note">{tx('pack.compose.natureNote', 'Pick one — the post won’t go out without it.')}</p>}
            </div>
          )}

          {mode === 'post' && <PlaceField value={place} onChange={setPlace} />}

          {dogs.length > 0 && (
            <div>
              <p className="mc-lbl">{tx('pack.compose.with', 'With')}</p>
              <div className="mc-dogs">
                {dogs.map((d) => (
                  <button key={d.id} type="button" className={`mc-dog${dogIds.includes(d.id) ? ' on' : ''}`} onClick={() => toggleDog(d.id)} aria-pressed={dogIds.includes(d.id)}>
                    {d.cloudinary_main_url ? <img src={sizedUrl(d.cloudinary_main_url, 80)} alt="" /> : <i />}
                    {d.dog_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mc-lbl">{tx('pack.compose.privacy', 'Privacy')}</p>
            <div className="mc-vis">
              <button type="button" className={vis === 'public' ? 'on' : ''} onClick={() => setVis('public')}>{tx('pack.compose.visAll', 'Everyone')}</button>
              <button type="button" className={vis === 'private' ? 'on' : ''} onClick={() => setVis('private')}>{tx('pack.compose.visMe', 'Only me')}</button>
            </div>
          </div>
          </>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
