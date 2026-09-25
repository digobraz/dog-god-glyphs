// SNIFFER — „VÁŠ PROFIL" (ty a pes). Nahrádza zoznam „Tvoja karta" v bráne.
// Zadanie: plany/zadanie-sniffer-stavba-2026-09-26.md §2.2 · nákres obrazovka A (a E ho znovupoužije).
//
// Karty vo VODOROVNOM rade (spoločný `Scroller` vstupu, nie druhý rad):
//   1 Základ · 2 Bio a záľuby · 3 Pes (jedna karta na každého psa) · 4 Čo hľadám · + ďalší pes
// 🔴 ŽIADNE NOVÉ MIESTO NA ÚDAJE (CLAUDE.md „Identita"): človek píše do `pack_profiles.human`
//    (`saveHuman`), pes do `dog_profiles.attrs` (`saveDogAttrs`) — tie isté polia ako profil
//    a DOG ID. Čo doplníš tu, uvidíš tam.
// 📸 FOTKY: `human.buddyPhotos` = všetky v poradí karty; `human.buddyPhoto` = tá, na ktorej
//    ste SPOLU (zelený rám). Brána na serveri chce `buddyPhoto`, takže sa nemení.
// ⚠️ „Povely" z nákresu nemajú v profile pole — karta ukazuje Poslušnosť a Privolanie,
//    ktoré DOG ID už má. Nové pole nezakladám bez Mateja.
// ⚠️ Karta 4 (zámery + komu sa ukážem) v nákrese A nie je, ale bez nej sa SNIFFER nedá
//    zapnúť — brána ju chce. V nastaveniach (E) ostáva aj naďalej.
import { useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadExtraPhoto, withTransform } from '@/services/cloudinaryService';
import { Scroller, FLOW_SCROLL_CSS } from '@/components/screens/flowScroller';
import {
  PACK_THEME as T, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_AVATAR, FONT_TITLE, FONT_UI,
} from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import {
  saveHuman, saveDogAttrs, emptyDogAttrs,
  ACTIVITY_OPTIONS, SMOKE_OPTIONS, DOG_TEMPERAMENT_TAGS, DOG_FITNESS_OPTIONS, DOG_COMPAT_OPTIONS,
  DOG_ALONE_OPTIONS, DOG_SKILL_OPTIONS, DOG_JOY_SUGGESTIONS, DOG_DISLIKED_TYPE_SUGGESTIONS,
  type DogProfileAttrs, type HumanProfile, type ActivityTag, type Smoke,
} from '@/components/pack/profile/packProfile';
import { MAX_DOG_TEMPERAMENT } from '@/components/pack/profile/DogGallery';
import type { BuddyStepKey } from './buddyGate';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

export interface SnifferProfileDog {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  heroglyph_png_url?: string | null;
}

const MAX_PHOTOS = 6;
const thumb = (u?: string | null) => withTransform(u, 'c_fill,g_auto,w_300,h_400,f_auto,q_auto');

const CSS = `
/* Rad roluje do strán, takže orezáva — bez rezervy by tieň kariet skončil ostrou hranou
   (svetlý obdĺžnik okolo radu). Rezerva dnu, záporný okraj von: rozloženie sa nepohne. */
.hf-srow.sp-hs{padding:${PACK_SPACE.xl}px ${PACK_SPACE.xs}px;margin:-${PACK_SPACE.xl}px -${PACK_SPACE.xs}px;}
.sp-hs{align-items:flex-start;gap:${PACK_SPACE.md}px;scroll-snap-type:x mandatory;}
.sp-card{flex:0 0 min(86%, 360px);scroll-snap-align:center;padding:${PACK_SPACE.lg}px;display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.sp-eb{min-height:${PACK_SPACE.xl}px;display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.sm}px;font-family:${FONT_UI};font-weight:500;
  font-size:${PACK_TEXT.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.sp-miss{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;color:${T.card};background:${T.alertRed};
  border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;}
.sp-ok{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;letter-spacing:.14em;color:${T.card};background:${T.growGreen};
  border-radius:${PACK_R.pill}px;padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px;}
.sp-kv{border-top:1px solid ${T.hairline};}
.sp-kv > button{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;width:100%;padding:${PACK_SPACE.sm}px 0;background:none;border:0;cursor:pointer;text-align:left;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkDim};}
.sp-kv > button > span{flex:1 1 auto;}
.sp-kv > button > b{font-weight:600;color:${T.inkStrong};text-align:right;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sp-kv > button > b.is-todo{color:${LAPIS.edge};}
.sp-kv .bd-edit{margin:0 0 ${PACK_SPACE.sm}px;}
.sp-static{display:flex;justify-content:space-between;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px 0;border-top:1px solid ${T.hairline};
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkDim};}
.sp-static b{font-weight:600;color:${T.inkStrong};}
.sp-slots{display:grid;grid-template-columns:repeat(3,1fr);gap:${PACK_SPACE.sm}px;}
.sp-slot{position:relative;aspect-ratio:3/4;border-radius:${PACK_R.tile}px;overflow:hidden;border:1px dashed ${T.border};background:${T.tileBg};
  display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.h2}px;color:${T.inkWarm};padding:0;}
.sp-slot img{width:100%;height:100%;object-fit:cover;display:block;}
.sp-slot.is-together{border:2px solid ${T.growGreen};}
.sp-slot__tag{position:absolute;left:${PACK_SPACE.xs}px;bottom:${PACK_SPACE.xs}px;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.micro}px;
  color:${T.card};background:${T.growGreen};border-radius:${PACK_R.pill}px;padding:0 ${PACK_SPACE.xs}px;}
.sp-photo-menu{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.sp-dogh{display:flex;align-items:center;gap:${PACK_SPACE.md}px;}
.sp-dogh img{width:${PACK_AVATAR.sm}px;height:${PACK_AVATAR.sm}px;border-radius:${PACK_R.tile}px;object-fit:cover;border:1px solid ${T.border};}
.sp-dogh img.sp-hg{object-fit:contain;background:${T.card};}
.sp-dogh b{font-family:'Cinzel Decorative','Cinzel',serif;font-weight:700;font-size:${PACK_TEXT.lead}px;color:${T.inkStrong};}
.sp-area{width:100%;min-height:96px;resize:vertical;border-radius:${PACK_R.field}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.sp-add{justify-content:center;align-items:center;text-align:center;}
.sp-add h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.sp-pills .pk-pill.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
`;

function Pills({ options, selected, onToggle }: {
  options: Array<{ value: string; label: string }>; selected: readonly string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="bd-pills sp-pills">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={selected.includes(o.value)}
          className={`pk-pill pk-pill--tap${selected.includes(o.value) ? ' is-on' : ''}`}
          onClick={() => onToggle(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

const toggle = <V extends string>(arr: readonly V[], v: V) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export function SnifferProfile({
  tx, uid, name, human, dogs, dogAttrsOf, heroGender, missing, gateEditor, gateSummary, onAddDog,
}: {
  tx: Tx;
  uid: string | null;
  name: string;
  human: HumanProfile | undefined;
  dogs: SnifferProfileDog[];
  dogAttrsOf: (id: string) => DogProfileAttrs | undefined;
  /** Pohlavie z heroglyfu — keď je, SNIFFER sa naň nepýta (Matej 25. 9.). */
  heroGender: string | null;
  missing: BuddyStepKey[];
  /** Editory bodov brány, ktoré žijú v `PackBuddy` (meno, vek, pohlavie, bydlisko, zámery, komu). */
  gateEditor: (k: BuddyStepKey) => ReactNode;
  gateSummary: (k: BuddyStepKey) => string;
  onAddDog?: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const navigate = useNavigate();

  /** Jeden riadok karty: popis · hodnota (alebo „Doplniť") · ťuk otvorí editor pod ním. */
  const row = (id: string, label: string, value: string, body: ReactNode, todo = false) => {
    const isOpen = open === id;
    return (
      <div key={id} className="sp-kv">
        <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : id)}>
          <span>{label}</span>
          <b className={todo ? 'is-todo' : ''}>{todo ? tx('pack.buddy.fill', 'Fill in') : value || '—'}</b>
        </button>
        {isOpen && <div className="bd-edit">{body}</div>}
      </div>
    );
  };
  const gateRow = (k: BuddyStepKey, label: string) =>
    row(k, label, gateSummary(k), gateEditor(k), missing.includes(k));

  const badge = (keys: BuddyStepKey[]) => {
    const n = keys.filter((k) => missing.includes(k)).length;
    return n > 0
      ? <span className="sp-miss">{tx('pack.sniffer.profile.missing', '{n} missing', { n })}</span>
      : <span className="sp-ok">{tx('pack.sniffer.profile.done', 'Done')}</span>;
  };

  const photos = (human?.buddyPhotos?.length ? human.buddyPhotos : human?.buddyPhoto ? [human.buddyPhoto] : []);
  const opt = (v?: string | null) => (v ? tx(`pack.dogCard.opt.${v}`, v) : '');

  return (
    <>
      <style>{FLOW_SCROLL_CSS}</style>
      <style>{CSS}</style>
      <Scroller rowClass="sp-hs" measureKey={String(dogs.length)} centerSel=".sp-card--none">
        {/* 1 · ZÁKLAD */}
        <section className="sp-card" style={{ ...PACK_BOX.card }}>
          <span className="sp-eb">1 · {tx('pack.sniffer.profile.basics', 'Basics')} {badge(['name', 'age', 'gender', 'region', 'photo'])}</span>
          {gateRow('name', tx('pack.buddy.step.name', 'Name'))}
          {gateRow('age', tx('pack.buddy.step.age', 'Age'))}
          {heroGender
            ? <div className="sp-static"><span>{tx('pack.buddy.step.gender', 'Gender')}</span><b>{gateSummary('gender')}</b></div>
            : gateRow('gender', tx('pack.buddy.step.gender', 'Gender'))}
          {gateRow('region', tx('pack.buddy.step.region', 'Where you live'))}
          <PhotoSlots uid={uid} photos={photos} together={human?.buddyPhoto ?? null} tx={tx} />
        </section>

        {/* 2 · BIO A ZÁĽUBY */}
        <section className="sp-card" style={{ ...PACK_BOX.card }}>
          <span className="sp-eb">2 · {tx('pack.sniffer.profile.bio', 'Bio & interests')}</span>
          {row('bio', tx('pack.sniffer.profile.aboutMe', 'About me'), human?.bio?.trim() ?? '', (
            <textarea className="pf-field sp-area" defaultValue={human?.bio ?? ''} maxLength={900}
              placeholder={tx('pack.sniffer.profile.bioPh', 'A couple of lines about you and your dog')}
              onBlur={(e) => void saveHuman({ bio: e.target.value.trim() || undefined })} />
          ))}
          {row('interests', tx('pack.sniffer.profile.interests', 'Interests'),
            (human?.interests ?? []).map((v) => tx(`pack.map.activityLabel.${v}`, ACTIVITY_OPTIONS.find((o) => o.value === v)?.labelEN ?? v)).join(', '), (
            <Pills
              options={ACTIVITY_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.map.activityLabel.${o.value}`, o.labelEN) }))}
              selected={human?.interests ?? []}
              onToggle={(v) => void saveHuman({ interests: toggle(human?.interests ?? [], v as ActivityTag) })}
            />
          ))}
          {row('smoke', tx('pack.sniffer.profile.smoke', 'Smoking'),
            human?.smoke ? tx(`pack.sniffer.profile.smoke.${human.smoke}`, human.smoke === 'yes' ? 'I smoke' : 'I don’t smoke') : '', (
            <Pills
              options={SMOKE_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.sniffer.profile.smoke.${o.value}`, o.value === 'yes' ? 'I smoke' : 'I don’t smoke') }))}
              selected={human?.smoke ? [human.smoke] : []}
              onToggle={(v) => void saveHuman({ smoke: v as Smoke })}
            />
          ))}
        </section>

        {/* 3 · PES — jedna karta na každého psa */}
        {dogs.map((d, n) => {
          const a = dogAttrsOf(d.id) ?? emptyDogAttrs(d.id);
          const setCard = (patch: Partial<DogProfileAttrs['card']>) => void saveDogAttrs(d.id, { card: { ...a.card, ...patch } });
          const temper = a.tags.temperament ?? [];
          const dogDone = temper.length > 0 && !!a.card.fitness && !!a.card.compat?.dogs_overall;
          return (
            <section key={d.id} className="sp-card" style={{ ...PACK_BOX.card }}>
              <span className="sp-eb">{3 + n} · {tx('pack.buddy.dog', 'Dog')}
                {dogDone
                  ? <span className="sp-ok">{tx('pack.sniffer.profile.done', 'Done')}</span>
                  : <span className="sp-miss">{tx('pack.sniffer.profile.dogTodo', 'Fill in 3')}</span>}
              </span>
              <div className="sp-dogh">
                {d.cloudinary_main_url && <img src={thumb(d.cloudinary_main_url)} alt="" />}
                {d.heroglyph_png_url && <img className="sp-hg" src={withTransform(d.heroglyph_png_url, 'c_limit,w_200,f_auto,q_auto')} alt="" />}
                <b>{d.dog_name}</b>
              </div>
              {row(`${d.id}-t`, tx('pack.buddy.step.temperament', 'Temperament'), temper.map((v) => tx(`pack.dogTag.${v}`, v)).join(', '), (
                <>
                  <Pills
                    options={DOG_TEMPERAMENT_TAGS.map((v) => ({ value: v, label: tx(`pack.dogTag.${v}`, v) }))}
                    selected={temper}
                    onToggle={(v) => {
                      const next = toggle(temper as string[], v);
                      if (next.length > MAX_DOG_TEMPERAMENT) return;
                      void saveDogAttrs(d.id, { tags: { ...a.tags, temperament: next as DogProfileAttrs['tags']['temperament'] } });
                    }}
                  />
                  <p className="bd-note">{tx('pack.buddy.maxTags', 'Up to {n}.', { n: MAX_DOG_TEMPERAMENT })}</p>
                </>
              ), temper.length === 0)}
              {row(`${d.id}-f`, tx('pack.dogCard.fitness', 'Physical condition'), opt(a.card.fitness), (
                <Pills
                  options={DOG_FITNESS_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.fitness ? [a.card.fitness] : []}
                  onToggle={(v) => setCard({ fitness: v as DogProfileAttrs['card']['fitness'] })}
                />
              ), !a.card.fitness)}
              {row(`${d.id}-c`, tx('pack.dogCard.compat.dogs_overall', 'With other dogs'), opt(a.card.compat?.dogs_overall), (
                <Pills
                  options={DOG_COMPAT_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.compat?.dogs_overall ? [a.card.compat.dogs_overall] : []}
                  onToggle={(v) => setCard({ compat: { ...a.card.compat, dogs_overall: v as never } })}
                />
              ), !a.card.compat?.dogs_overall)}
              {row(`${d.id}-j`, tx('pack.sniffer.profile.likes', 'Likes'), a.card.joys.map((v) => tx(`pack.dogCard.joy.${v}`, v)).join(', '), (
                <Pills
                  options={DOG_JOY_SUGGESTIONS.map((v) => ({ value: v, label: tx(`pack.dogCard.joy.${v}`, v) }))}
                  selected={a.card.joys}
                  onToggle={(v) => setCard({ joys: toggle(a.card.joys, v) })}
                />
              ))}
              {row(`${d.id}-d`, tx('pack.sniffer.profile.dislikes', 'Dislikes'), a.card.dislikedTypes.map((v) => tx(`pack.dogCard.type.${v}`, v)).join(', '), (
                <Pills
                  options={DOG_DISLIKED_TYPE_SUGGESTIONS.map((v) => ({ value: v, label: tx(`pack.dogCard.type.${v}`, v) }))}
                  selected={a.card.dislikedTypes}
                  onToggle={(v) => setCard({ dislikedTypes: toggle(a.card.dislikedTypes, v) })}
                />
              ))}
              {row(`${d.id}-a`, tx('pack.dogCard.alone', 'Alone at the lodging'), opt(a.card.alone), (
                <Pills
                  options={DOG_ALONE_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.alone ? [a.card.alone] : []}
                  onToggle={(v) => setCard({ alone: v as DogProfileAttrs['card']['alone'] })}
                />
              ))}
              {row(`${d.id}-o`, tx('pack.dogCard.obedience', 'Obedience'), opt(a.card.obedience), (
                <Pills
                  options={DOG_SKILL_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.obedience ? [a.card.obedience] : []}
                  onToggle={(v) => setCard({ obedience: v as DogProfileAttrs['card']['obedience'] })}
                />
              ))}
              {row(`${d.id}-r`, tx('pack.dogCard.recall', 'Recall'), opt(a.card.recall), (
                <Pills
                  options={DOG_SKILL_OPTIONS.map((o) => ({ value: o.value, label: tx(`pack.dogCard.opt.${o.value}`, o.labelEN) }))}
                  selected={a.card.recall ? [a.card.recall] : []}
                  onToggle={(v) => setCard({ recall: v as DogProfileAttrs['card']['recall'] })}
                />
              ))}
            </section>
          );
        })}

        {/* 4 · ČO HĽADÁM — bez nej sa SNIFFER nezapne (brána) */}
        <section className="sp-card" style={{ ...PACK_BOX.card }}>
          <span className="sp-eb">{3 + dogs.length} · {tx('pack.sniffer.profile.looking', 'What I’m looking for')} {badge(['intents', 'audience'])}</span>
          {gateRow('intents', tx('pack.buddy.step.intents', 'What I’m looking for'))}
          {gateRow('audience', tx('pack.buddy.step.audience', 'Who sees me'))}
        </section>

        {/* + ĎALŠÍ PES — pes do svorky vstupuje heroglyfom */}
        <section className="sp-card sp-add" style={{ ...PACK_BOX.card }}>
          <h3>+ {tx('pack.sniffer.profile.addDog', 'Another dog')}</h3>
          <p className="bd-note">{tx('pack.sniffer.profile.addDogNote', 'Every dog enters the pack with its own heroglyph.')}</p>
          <button type="button" className="bd-cta bd-cta--small" style={{ alignSelf: 'center' }}
            onClick={() => (onAddDog ? onAddDog() : navigate('/heroglyph'))}>
            {tx('pack.sniffer.profile.addDogCta', 'Add a dog')}
          </button>
        </section>
      </Scroller>
    </>
  );
}

/** Fotky karty: až 6, jedna označená „spolu" (zelený rám) = `buddyPhoto` pre bránu.
 *  Nákres A: „aspoň na jednej ste spolu (zelený rám)". */
function PhotoSlots({ uid, photos, together, tx }: { uid: string | null; photos: string[]; together: string | null; tx: Tx }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pick, setPick] = useState<string | null>(null);

  const write = (next: string[], nextTogether: string | null) =>
    void saveHuman({ buddyPhotos: next, buddyPhoto: nextTogether ?? undefined });

  return (
    <div className="sp-kv" style={{ paddingTop: PACK_SPACE.sm, display: 'flex', flexDirection: 'column', gap: PACK_SPACE.sm }}>
      <span className="bd-note">{tx('pack.sniffer.profile.photosNote', 'Photos — on at least one of them you’re together (green frame).')}</span>
      <div className="sp-slots">
        {photos.map((u) => (
          <button key={u} type="button" className={`sp-slot${u === together ? ' is-together' : ''}`} onClick={() => setPick(pick === u ? null : u)}>
            <img src={thumb(u)} alt="" />
            {u === together && <span className="sp-slot__tag">{tx('pack.sniffer.profile.together', 'together')}</span>}
          </button>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button type="button" className="sp-slot" disabled={busy || !uid} onClick={() => input.current?.click()}
            aria-label={tx('pack.buddy.photoPick', 'Choose photo')}>{busy ? '…' : '+'}</button>
        )}
      </div>
      {pick && (
        <div className="sp-photo-menu">
          {pick !== together && (
            <button type="button" className="pk-pill pk-pill--tap" onClick={() => { write(photos, pick); setPick(null); }}>
              {tx('pack.sniffer.profile.markTogether', 'We’re together on this one')}
            </button>
          )}
          {photos.indexOf(pick) > 0 && (
            <button type="button" className="pk-pill pk-pill--tap" onClick={() => {
              write([pick, ...photos.filter((x) => x !== pick)], together); setPick(null);
            }}>{tx('pack.sniffer.profile.first', 'Make it first')}</button>
          )}
          <button type="button" className="pk-pill pk-pill--tap" onClick={() => {
            const next = photos.filter((x) => x !== pick);
            write(next, pick === together ? null : together);
            setPick(null);
          }}>{tx('pack.sniffer.profile.remove', 'Remove')}</button>
        </div>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f || !uid) return;
        setBusy(true);
        setErr(null);
        try {
          // Názov z času, nie z poradia: po odstránení fotky by poradie trafilo existujúci súbor.
          const r = await uploadExtraPhoto(f, `buddy/${uid}`, Date.now());
          // Prvá fotka je predvolene tá „spolu" — brána ju chce a kto nahrá jednu, myslí ňou tú.
          write([...photos, r.secureUrl], together ?? r.secureUrl);
        } catch (x) {
          setErr(x instanceof Error ? x.message : String(x));
        } finally {
          setBusy(false);
          e.target.value = '';
        }
      }} />
      {err && <p className="bd-warn">{err}</p>}
    </div>
  );
}
