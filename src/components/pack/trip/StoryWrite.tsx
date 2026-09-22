// ============================================================================
// PÍSANIE PRÍBEHU (KROK 4) — vchod je „prešiel som", nie panel `+`
//
// Rozhodnutie 2: *„zápis z cesty ale nebude v `+` ponuke, nie je to tak častá vec,
// človek ju môže pridať priamo po prejdení odysey"*. `panel: false` v registri ostáva.
//
// 🗂️ KÔŠ 3 „ROBÍM ÚLOHU" (lock §3): žiadna spodná lišta, JEDNO gesto späť —
// tu × v rohu, nikdy × aj šípka naraz.
//
// 🔴 SÚKROMNÝ, KÝM HO NEZVEREJNÍŠ (rozhodnutie 3). Píše sa to unavený večer v stane;
// kým autor nepovie inak, nevidí to nikto. Východzia poloha prepínača je preto vľavo.
// ============================================================================
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import {
  PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD,
  PACK_THEME, PF_FIELD_CSS, FONT_TITLE, FONT_UI,
} from '../packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '../navGoldSkin';
import { HandTrash } from '../HandIcons';
import { BackButton } from '../BackButton';
import { MAX_PHOTOS, optimizePhoto } from '../addtrip/photoOptimize';
import { uploadTripStoryPhoto } from '@/services/cloudinaryService';
import { loadMyStory, loadStoryCount, saveStory } from '../story/storyData';

const T = PACK_THEME;

export const STORY_WRITE_CSS = `
/* RECEPT POLA SA MUSI PRINIEST SO SEBOU. Trieda .pf-field je POLE z katalogu blokov,
   ale zije v packTheme.ts a na stranke ho nema kto vlozit — clanok vyletu
   PF_FIELD_CSS nerenderuje. Bez neho spadne textarea na tmavy shadcn podklad
   a na papyruse je z nej cierna diera s hnedym pismom (zmerane 22. 9. 2026). */
${PF_FIELD_CSS}
/* Kôš 3 — vrstva prekrýva aj spodnú lištu (tá je z-index 40), preto 140. */
.psw-veil{ position:fixed; inset:0; z-index:140; overflow-y:auto; background:${T.pageBg}; }
.psw-wrap{ max-width:640px; margin:0 auto; padding:${PACK_SPACE.lg}px ${PACK_SPACE.lg}px ${PACK_SPACE.xxxl}px; }
.psw-card{ padding:${PACK_SPACE.xl}px ${PACK_SPACE.lg}px; font-family:${FONT_UI}; color:${T.inkStrong}; }
.psw-head{ display:flex; align-items:center; justify-content:flex-start; gap:${PACK_SPACE.md}px; margin-bottom:${PACK_SPACE.lg}px; }
.psw-title{ font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.h2}px; letter-spacing:0.14em; text-transform:uppercase; }
/* JEDNO gesto späť (lock §3, kôš 3: šípka ALEBO ×, nikdy obe).
   Šípka, nie ×: panel sa otvára Z ČLÁNKU, je to zanorenie, nie plávajúce okno.
   A hlavne — znak krížika je HOLÝ TEXTOVÝ ZNAK, teda podľa brandu nález „mimo
   brandu"; stráž check:ikony ho 22. 9. zachytila a BackButton nesie kresbu z kitu. */
.psw-lbl{
  display:block; margin:${PACK_SPACE.lg}px 0 ${PACK_SPACE.sm}px;
  font-family:${PACK_HEAD.section.fontFamily}; font-weight:${PACK_HEAD.section.fontWeight};
  font-size:${PACK_HEAD.section.fontSize}px; letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase; color:${T.inkWarm};
}
/* Polia = POLE z katalógu (.pf-field). Recept nesie packTheme, tu je len rozmer. */
.psw-in, .psw-ta{
  width:100%; border-radius:${PACK_R.field}px; padding:${PACK_SPACE.md}px;
  font-family:${FONT_UI}; font-size:${PACK_TEXT.body}px; color:${T.inkStrong};
}
.psw-ta{ min-height:180px; line-height:1.65; resize:vertical; }
/* Matejov text nad odkazmi. Je to OTÁZKA autorovi, nie popisok poľa. */
.psw-ask{ margin:${PACK_SPACE.xl}px 0 ${PACK_SPACE.sm}px; font-size:${PACK_TEXT.body}px; line-height:1.55; color:${T.inkStrong}; }
.psw-ask i{ font-style:normal; color:${T.inkWarm}; }
/* Pravidlo (a) patrí K POLU, nie do podmienok — preto stojí hneď pod ním. */
.psw-rule{ margin:${PACK_SPACE.sm}px 0 0; font-size:${PACK_TEXT.label}px; line-height:1.45; color:${T.inkWarm}; }
.psw-photos{ display:grid; grid-template-columns:repeat(4,1fr); gap:${PACK_SPACE.sm}px; margin-top:${PACK_SPACE.sm}px; }
.psw-ph{ position:relative; aspect-ratio:1; border-radius:${PACK_R.field}px; overflow:hidden; border:1px solid ${T.border}; background:${T.tileBg}; }
.psw-ph img{ width:100%; height:100%; object-fit:cover; display:block; }
.psw-ph button{
  position:absolute; right:${PACK_SPACE.xs}px; top:${PACK_SPACE.xs}px;
  width:22px; height:22px; border-radius:${PACK_R.pill}px; cursor:pointer;
  background:${T.glass}; border:1px solid ${T.onDarkBorder}; color:${T.onDark};
  display:flex; align-items:center; justify-content:center; padding:0;
}
.psw-add{
  width:100%; margin-top:${PACK_SPACE.sm}px; cursor:pointer;
  border:1px dashed ${T.border}; border-radius:${PACK_R.field}px; background:none;
  padding:${PACK_SPACE.md}px; color:${T.inkWarm};
  font-family:${FONT_UI}; font-weight:500; font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing}; text-transform:uppercase;
}
/* Poradie PRED zverejnením — dôvod dopísať to dnes, nie o rok (rozhodnutie 7). */
.psw-rank{ margin:${PACK_SPACE.lg}px 0 0; font-size:${PACK_TEXT.label}px; color:${T.inkWarm}; }
.psw-rank b{ font-family:${FONT_TITLE}; font-weight:700; color:${T.cardEdge}; }
/* Prepínač viditeľnosti — VÝBER je priesvitný tint, nie plná plocha (brand). */
.psw-vis{ display:flex; gap:${PACK_SPACE.sm}px; margin-top:${PACK_SPACE.sm}px; }
.psw-vis button{
  flex:1; cursor:pointer; padding:${PACK_SPACE.md}px;
  border:1px solid ${T.border}; border-radius:${PACK_R.field}px; background:none;
  font-family:${FONT_UI}; font-size:${PACK_TEXT.label}px; color:${T.inkWarm};
}
.psw-vis button[aria-pressed="true"]{ background:${LAPIS.fill}; border-color:${LAPIS.edge}; color:${LAPIS.edge}; font-weight:600; }
/* Jediné CTA na povrchu ⇒ LAPIS, plná plocha (brand: na bledom podklade lapis). */
.psw-save{
  width:100%; margin-top:${PACK_SPACE.xl}px; cursor:pointer;
  border:0; border-radius:${PACK_R.field}px; padding:${PACK_SPACE.lg}px;
  background:${LAPIS.grad}; color:${LAPIS.ink}; box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.body}px;
  letter-spacing:0.14em; text-transform:uppercase;
}
.psw-save:disabled{ opacity:0.5; cursor:default; }
.psw-note{ margin-top:${PACK_SPACE.sm}px; font-size:${PACK_TEXT.label}px; color:${T.alertRed}; }
`;

export interface StoryWriteProps {
  slug: string;
  /** Dátum prejdenia z `trip_walked` — východisko, ktoré sa dá opraviť. */
  onClose: () => void;
  onSaved: () => void;
}

/** Data URL z `optimizePhoto` → Blob, aby fotka išla na Cloudinary a NIE do DB.
 *  🔴 base64 v `posts.photos` by znamenalo ~100 kB znakov na fotku v riadku. */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const r = await fetch(dataUrl);
  return r.blob();
}

export function StoryWrite({ slug, onClose, onSaved }: StoryWriteProps) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [link, setLink] = useState('');
  const [youtube, setYoutube] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [happenedAt, setHappenedAt] = useState<string | null>(null);
  const [others, setOthers] = useState(0);
  /* Uz zverejneny pribeh = v kronike SOM, takze „budes N-ty" by klamalo. */
  const [alreadyIn, setAlreadyIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Otvor sa s tým, čo už je napísané — prepísanie nesmie znamenať zmazanie.
  useEffect(() => {
    let alive = true;
    loadMyStory(slug).then((mine) => {
      if (!alive || !mine) return;
      setBody(mine.body); setPhotos(mine.photos); setLink(mine.link);
      setYoutube(mine.youtube); setIsPublic(mine.isPublic); setHappenedAt(mine.happenedAt);
      setAlreadyIn(mine.isPublic);
    });
    loadStoryCount(slug).then((c) => { if (alive) setOthers(c); });
    return () => { alive = false; };
  }, [slug]);

  const addPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0 || picked.length === 0) return;
    setBusy(true);
    try {
      const stamp = Date.now();
      const out: string[] = [];
      for (const [i, f] of picked.slice(0, room).entries()) {
        const small = await optimizePhoto(f);
        if (!small) continue;
        const up = await uploadTripStoryPhoto(await dataUrlToBlob(small), slug, `${stamp}-${i}`);
        out.push(up.secureUrl);
      }
      if (out.length) setPhotos((p) => [...p, ...out].slice(0, MAX_PHOTOS));
    } catch {
      setNote(t('pack.trip.stories.write.photoFail'));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true); setNote('');
    const r = await saveStory(slug, { body: body.trim(), photos, link: link.trim(), youtube: youtube.trim(), isPublic, happenedAt });
    setBusy(false);
    if (!r.ok) { setNote(r.error ?? t('pack.trip.stories.write.failed')); return; }
    onSaved();
  };

  return (
    <div className="psw-veil" role="dialog" aria-modal="true">
      <div className="psw-wrap">
        <div className="psw-card" style={{ ...PACK_BOX.card }}>
          <div className="psw-head">
            <BackButton tone="pale" onClick={onClose} label={t('pack.trip.stories.write.close')} />
            <span className="psw-title">{t('pack.trip.stories.write.title')}</span>
          </div>

          <label className="psw-lbl" htmlFor="psw-body">{t('pack.trip.stories.write.body')}</label>
          <textarea id="psw-body" className="psw-ta pf-field" value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('pack.trip.stories.write.bodyHint')} />

          <span className="psw-lbl">{t('pack.trip.stories.write.photos')}</span>
          {photos.length > 0 && (
            <div className="psw-photos">
              {photos.map((src, i) => (
                <div className="psw-ph" key={`${i}-${src}`}>
                  <img src={src} alt="" />
                  <button type="button" onClick={() => setPhotos((p) => p.filter((_, x) => x !== i))}
                    aria-label={t('pack.trip.stories.write.photoDrop')}><HandTrash size={11} /></button>
                </div>
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
          <button type="button" className="psw-add" disabled={busy} onClick={() => fileRef.current?.click()}>
            {t('pack.trip.stories.write.photoAdd')}
          </button>

          {/* 🔴 TEXT JE MATEJOV DOSLOVA (22. 9.). Dve polia, nie jedno univerzálne:
              YouTube vie appka vykresliť ako náhľad, hocijakú URL nie. */}
          <p className="psw-ask">
            {t('pack.trip.stories.write.ask')}<br />
            <i>{t('pack.trip.stories.write.askKinds')}</i><br />
            {t('pack.trip.stories.write.askPaste')}
          </p>
          <input className="psw-in pf-field" value={link} inputMode="url"
            onChange={(e) => setLink(e.target.value)} placeholder={t('pack.trip.stories.write.link')} />
          <p className="psw-rule">{t('pack.trip.stories.write.rule')}</p>
          <input className="psw-in pf-field" value={youtube} inputMode="url"
            style={{ marginTop: PACK_SPACE.sm }}
            onChange={(e) => setYoutube(e.target.value)} placeholder={t('pack.trip.stories.write.youtube')} />

          {/* Poradie vidno UŽ TERAZ, aj kým je príbeh súkromný — to je dôvod dopísať
              to dnes (rozhodnutie 7). ⚠️ Kto už zverejnený príbeh MÁ, ten v kronike
              stojí; jemu by „budeš N-tý" klamalo, tak riadok nedostane. */}
          {!alreadyIn && (
            <p className="psw-rank">
              {t('pack.trip.stories.write.rankPre')} <b>{others + 1}.</b> {t('pack.trip.stories.write.rankPost')}
            </p>
          )}

          <span className="psw-lbl">{t('pack.trip.stories.write.visibility')}</span>
          <div className="psw-vis">
            <button type="button" aria-pressed={!isPublic} onClick={() => setIsPublic(false)}>
              {t('pack.trip.stories.write.private')}
            </button>
            <button type="button" aria-pressed={isPublic} onClick={() => setIsPublic(true)}>
              {t('pack.trip.stories.write.publish')}
            </button>
          </div>

          <button type="button" className="psw-save" disabled={busy || body.trim().length === 0} onClick={save}>
            {t('pack.trip.stories.write.save')}
          </button>
          {note && <p className="psw-note">{note}</p>}
        </div>
      </div>
    </div>
  );
}
