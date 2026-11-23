// POLIA ZÁPISU MIESTA — fotky (max 3, kontrola AINUBISOM) a zaškrtávacie políčko.
// Spoločné pre formulár značky (`AddMapNotePanel`) a hodnotenie v profile miesta (`PackPlace`), aby sa nerozišli.
// Fotka ide ako postreh zakladateľa (`rate_map_place`), nie ako stĺpec značky — žiadna druhá cesta k fotkám.
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SysIcon } from '@/components/pack/SysIcon';
import { ICON } from '@/components/pack/tripShared';
import { uploadPlaceFile } from '@/components/geo/placePosts';
import { FONT_UI, PACK_R, PACK_SPACE as S, PACK_TEXT } from '@/components/pack/packTheme';
import { PALE, LAPIS } from '@/components/pack/navGoldSkin';
import { DEV_NOAUTH } from './devMockNotes';
import { PLACE_MAX_PHOTOS } from './mapPlaceData';

export type PhotoSlot = { preview: string; url: string | null; busy: boolean };

/** Fotky miesta: nahrávajú sa hneď po výbere (ako pri hodnotení kliniky), zlyhaná odpadne. */
export function usePlacePhotos(initial: string[] = []) {
  const [photos, setPhotos] = useState<PhotoSlot[]>(() => initial.map((u) => ({ preview: u, url: u, busy: false })));
  const [error, setError] = useState(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => { if (p.preview.startsWith('blob:')) URL.revokeObjectURL(p.preview); }), []);

  const add = async (list: FileList | null) => {
    if (!list?.length) return;
    // Kópia hneď: FileList je živý a `value = ''` ho vyprázdni počas await (PlaceSheet, 31. 10. 2026).
    const files = Array.from(list);
    setError(false);
    let uid: string | undefined;
    if (!DEV_NOAUTH) {
      const { data } = await supabase.auth.getUser();
      uid = data.user?.id;
      if (!uid) { setError(true); return; }
    }
    for (const f of files.slice(0, PLACE_MAX_PHOTOS - photosRef.current.length)) {
      const preview = URL.createObjectURL(f);
      // V deve bez prihlásenia sa nenahráva nikam: blob adresa nahrádza Cloudinary.
      if (!uid) { setPhotos((prev) => [...prev, { preview, url: preview, busy: false }]); continue; }
      setPhotos((prev) => [...prev, { preview, url: null, busy: true }]);
      uploadPlaceFile(f, uid)
        .then((url) => setPhotos((prev) => prev.map((p) => (p.preview === preview ? { ...p, url, busy: false } : p))))
        .catch(() => { setPhotos((prev) => prev.filter((p) => p.preview !== preview)); setError(true); });
    }
  };
  const remove = (preview: string) => setPhotos((prev) => prev.filter((q) => q.preview !== preview));
  return {
    photos, add, remove, error,
    busy: photos.some((p) => p.busy),
    urls: photos.filter((p) => p.url).map((p) => p.url as string),
  };
}

export function PlacePhotoSlots({ ph, addLabel, removeLabel }: { ph: ReturnType<typeof usePlacePhotos>; addLabel: string; removeLabel: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="ppx-slots">
      {ph.photos.map((p) => (
        <div key={p.preview} className="ppx-slot" style={{ backgroundImage: `url(${p.preview})` }}>
          {p.busy && <span className="ppx-busy" />}
          <button type="button" className="ppx-x" aria-label={removeLabel} onClick={() => ph.remove(p.preview)}>
            <img src={ICON('cross')} alt="" aria-hidden style={{ width: 12, height: 12, filter: 'invert(1)' }} />
          </button>
        </div>
      ))}
      {ph.photos.length < PLACE_MAX_PHOTOS && (
        <button type="button" className="ppx-slot ppx-slot--add" aria-label={addLabel} onClick={() => fileRef.current?.click()}>
          <SysIcon name="foto" size={28} />
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { void ph.add(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

/** Zaškrtávacie políčko (kemping, „Stojí za zmienku?", „Boli sme tu"). Stav nesie `aria-checked`. */
export function PlaceCheck({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button type="button" className={`ppx-check${on ? ' on' : ''}`} role="checkbox" aria-checked={on} onClick={() => onChange(!on)}>
      <i aria-hidden>{on && <SysIcon name="fajka" size={14} />}</i>
      <span>{label}{sub && <small>{sub}</small>}</span>
    </button>
  );
}

// ⚠️ JS template literal — spätný apostrof v komentári ho ukončí (`npm run check:css`).
export const PLACE_FORM_CSS = `
.ppx-q{display:flex;align-items:center;gap:${S.sm}px;margin:${S.sm}px 0 ${S.xs}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;color:${PALE.ink};}
.ppx-req{display:inline-flex;align-items:center;min-height:16px;padding:0 ${S.sm}px;border-radius:${PACK_R.pill}px;background:${LAPIS.grad};color:${LAPIS.ink};font-size:${PACK_TEXT.micro}px;font-weight:600;}
.ppx-check{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:${S.sm}px;width:100%;min-height:36px;padding:${S.sm}px ${S.md}px;border-radius:${PACK_R.field}px;border:1px solid ${PALE.border};background:${PALE.soft};font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;font-weight:600;color:${PALE.ink};}
.ppx-check span{display:flex;flex-direction:column;min-width:0;}
.ppx-check small{font-size:${PACK_TEXT.label}px;font-weight:400;color:${PALE.dim};}
.ppx-check i{flex:none;width:22px;height:22px;border-radius:${PACK_R.field}px;border:2px solid ${PALE.ink};display:grid;place-items:center;font-style:normal;background:${PALE.field};}
.ppx-check.on{border-color:${LAPIS.edge};}
.ppx-slots{display:flex;gap:${S.sm}px;margin-top:${S.xs}px;}
.ppx-slot{position:relative;width:56px;height:56px;border-radius:${PACK_R.field}px;background:center/cover no-repeat;border:1px solid ${PALE.border};flex:none;}
.ppx-slot--add{border:1.5px dashed ${PALE.border};background:${PALE.soft};display:grid;place-items:center;cursor:pointer;padding:0;}
.ppx-x{position:absolute;right:${S.xs}px;top:${S.xs}px;width:20px;height:20px;border-radius:${PACK_R.pill}px;border:0;background:rgba(10,8,4,0.6);display:grid;place-items:center;cursor:pointer;padding:0;}
.ppx-busy{position:absolute;inset:0;border-radius:inherit;background:rgba(255,253,247,0.55);}
.ppx-note{margin:${S.xs}px 0 0;font-family:${FONT_UI};font-size:${PACK_TEXT.micro}px;line-height:1.35;color:${PALE.dim};}
html.papyrus3d .ppx-q{font-size:${PACK_TEXT.body}px;color:var(--p3d-ink);}
html.papyrus3d .ppx-check{min-height:48px;border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);color:var(--p3d-ink);}
html.papyrus3d .ppx-check small{color:color-mix(in srgb,var(--p3d-ink) 62%,var(--p3d-paper));}
html.papyrus3d .ppx-check i{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper);}
html.papyrus3d .ppx-check.on{background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));}
html.papyrus3d .ppx-slot{border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.tile}px;}
html.papyrus3d .ppx-slot--add{background:var(--p3d-paper-hi);}
html.papyrus3d .ppx-note{color:color-mix(in srgb,var(--p3d-ink) 62%,var(--p3d-paper));}
`;
