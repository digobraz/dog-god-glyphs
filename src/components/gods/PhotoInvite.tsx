/**
 * VÝZVA „TVÁR TVOJHO PSA" (6. 10. 2026) — jeden popup nad stmaveným oknom (`FlowModal`).
 * Logika a odôvodnenie: `lib/photoInvite.ts`.
 *
 * PRIDAŤ FOTKU = lapis (bledý podklad karty), výber → `openPhotoConfirm` → `/heroglyph/name`.
 * „Pokračovať bez fotky" → `/heroglyph/name` (pokladňa ukáže iniciálu).
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { FlowModal, FLOW_PANEL_CSS } from '@/components/screens/flowPanel';
import { HandCamera } from '@/components/pack/HandIcons';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { PACK_R, PACK_SPACE, PACK_TEXT } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { openPhotoConfirm } from '@/components/gods/photoConfirm';
import { intakePhoto, finishPhotoChoice } from '@/lib/photoIntake';
import { track } from '@/lib/analytics';
import { OPEN_PHOTO_INVITE, pickFileWithCancel, photoInviteMounted, photoInviteUnmounted } from '@/lib/photoInvite';

export default function PhotoInvite() {
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const packRef = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef<Promise<string | null> | undefined>(undefined);
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    const on = (e: Event) => {
      packRef.current = (e as CustomEvent<{ packNumber?: number | null }>).detail?.packNumber ?? null;
      track('photo_invite_shown');
      setOpen(true);
    };
    window.addEventListener(OPEN_PHOTO_INVITE, on);
    const early = photoInviteMounted();
    if (early) on(new CustomEvent(OPEN_PHOTO_INVITE, { detail: early }));
    return () => { window.removeEventListener(OPEN_PHOTO_INVITE, on); photoInviteUnmounted(); };
  }, []);

  const pick = () => {
    const input = fileRef.current;
    if (input) pickFileWithCancel(input, () => { /* výzva ostáva otvorená */ });
  };

  const showConfirm = (url: string) => {
    const tt = tRef.current;
    openPhotoConfirm({
      photoUrl: url,
      packNumber: packRef.current,
      onContinue: (crop) => {
        track('cta_become_dogyptian_click', { location: 'photo_invite' });
        void finishPhotoChoice(crop, uploadingRef.current);
        navigate('/heroglyph/name');
      },
      onPickAnother: pick,
      onClose: () => track('photo_invite_confirm_dismissed'),
      copy: {
        eyebrow: tt('wall.photo.yoursWillBe'), lead: tt('wall.photo.lead'), cta: tt('wall.photo.cta'),
        another: tt('wall.photo.another'), zoom: tt('wall.photo.zoom'), later: tt('wall.photo.laterNote'),
      },
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const intake = intakePhoto(f);
    uploadingRef.current = intake.uploaded;
    setOpen(false);
    showConfirm(intake.previewUrl);
  };

  const skip = () => {
    track('photo_invite_skip');
    setOpen(false);
    navigate('/heroglyph/name');
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
      <style>{FLOW_PANEL_CSS}{INVITE_CSS}</style>
      <FlowModal open={open} className="pi-card" label={t('heroglyph.invite.title')} onClose={() => setOpen(false)}>
        <span className="pi-drop"><HandCamera size={36} /></span>
        <h2 className="pi-h">{t('heroglyph.invite.title')}</h2>
        <p className="pi-p">{t('heroglyph.invite.body')}</p>
        <button type="button" className="pi-cta" onClick={() => { track('photo_invite_add'); pick(); }}>
          {t('heroglyph.invite.add')}
        </button>
        <button type="button" className="pi-skip" onClick={skip}>{t('heroglyph.invite.skip')}</button>
      </FlowModal>
    </>
  );
}

const INVITE_CSS = `
.fm-card.pi-card { max-width: 360px; align-items: center; text-align: center; gap: ${PACK_SPACE.md}px; padding: ${PACK_SPACE.xl}px ${PACK_SPACE.lg}px; }
.pi-drop {
  width: 96px; height: 96px; border-radius: 50%; display: grid; place-items: center;
  border: 2px dashed rgba(201, 154, 63, 0.9); color: ${LAB.ink}; flex: 0 0 auto;
}
.pi-h {
  margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: ${PACK_TEXT.h2}px;
  letter-spacing: 0.14em; text-transform: uppercase; color: ${LAB.ink};
}
.pi-p { margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 400; font-size: ${PACK_TEXT.body}px; line-height: 1.5; color: ${LAB.inkSoft}; }
.pi-cta {
  width: 100%; height: 48px; border: none; border-radius: ${PACK_R.field}px; cursor: pointer;
  background: ${LAPIS.grad}; color: ${LAPIS.ink}; box-shadow: ${LAPIS_BTN_SHADOW};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${PACK_TEXT.body}px; letter-spacing: .08em; text-transform: uppercase;
  transition: background .18s, transform .18s;
}
.pi-cta:hover { background: ${LAPIS.gradHover}; transform: scale(1.02); }
.pi-skip {
  background: none; border: 0; padding: ${PACK_SPACE.sm}px; cursor: pointer; text-decoration: underline;
  font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: ${PACK_TEXT.label}px; color: ${LAB.inkSoft};
}
.pi-skip:hover { color: ${LAB.ink}; }
`;
