// PROFIL MIESTA `/pack/miesto/:id` — parkovisko, unikát (a ďalšie body z `map_notes`). Kôš 2 POZERÁM SA
// (lock architektura-pack §3: lišta ustúpi, hore šípka späť; register `wizSteps.ts`).
// Zadanie: `plany/zadanie-funkcie-1-0-stavba-2026-11-23.md` §Balík 1 · nákres `plany/nakresy/parkovisko-camping-2026-11-23/`.
//
// JEDNA karta pre všetky miesta (lock §4.2: objekt má jednu kartu), líši sa len horný štítok. Vzor = profil kliniky
// (`klinika/PackKlinika.tsx`): fotka, packy, postrehy, Navigovať, Ohodnotiť (šuplík zdola).
// Rozhodnutia (Matej 23. 11. 2026, 3. kolo): parkovisko má VŽDY modrý blok, žlté P = platené, červený karavan = vhodné
// na kemping; staré parkoviská bez ceny = modré P + v profile „Platí sa? Doplň"; hodnotí člen so psom, ktorý odklikne
// „Boli sme tu"; pod postrehmi ostáva „Platí ešte? / Už neplatí".
// Postreh = `place_posts` druh 'note' (`mapnotes/mapPlaceData.ts`) — žiadna nová tabuľka recenzií.
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { PackPopup } from '@/components/pack/PackPopup';
import { SysIcon } from '@/components/pack/SysIcon';
import { PawRating } from '@/components/pack/addtrip/PawRating';
import { ICON, RatingPaws } from '@/components/pack/tripShared';
import { SosStyles, useBack } from '@/components/pack/sos/sosShared';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { FONT_TITLE, FONT_UI, PACK_BOX, PACK_R, PACK_SPACE as S, PACK_TEXT, PACK_THEME as T, PF_FIELD_CSS } from '@/components/pack/packTheme';
import { navUrl, isAppleDevice, type NavApp } from '@/components/pack/tripNav';
import { B3_CSS } from '@/lib/papyrus3d';
import { useToast } from '@/hooks/use-toast';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { sizedUrl } from '@/services/cloudinaryService';
import { useMapNotes } from '@/components/pack/mapnotes/useMapNotes';
import { type MapNote } from '@/components/pack/mapnotes/mapNotesData';
import { noteStickerSrc, caravanStickerSrc } from '@/components/pack/mapnotes/mapStickers';
import {
  PLACE_BODY_MAX, deleteMapPlacePost, fillParkingPaid, rateMapPlace, reportMapPlacePost, useMapPlacePosts,
  type PlaceProfilePost,
} from '@/components/pack/mapnotes/mapPlaceData';
import { PLACE_FORM_CSS, PlaceCheck, PlacePhotoSlots, usePlacePhotos } from '@/components/pack/mapnotes/PlacePhotoSlots';
import { PLACE_MAX_PHOTOS } from '@/components/pack/mapnotes/mapPlaceData';

// Logá v `public/nav-apps/` — to isté poradie ako výber v SOS a v profile kliniky.
const NAV_APPS: { id: NavApp; name: string; logo: string | null }[] = [
  { id: 'google', name: 'Google Maps', logo: '/nav-apps/google.svg' },
  { id: 'waze', name: 'Waze', logo: '/nav-apps/waze.svg' },
  { id: 'mapy', name: 'Mapy.com', logo: '/nav-apps/mapy.svg' },
];

const errText = (e: unknown) => (e instanceof Error ? e.message : (e as { message?: string })?.message) ?? '';

// ⚠️ JS template literal — spätný apostrof v komentári ho ukončí (`npm run check:css`).
const CSS = `
.pl-root{--rp-fill:#A3782B;--rp-empty:#A3782B;--rp-empty-op:0.28;display:flex;flex-direction:column;gap:${S.lg}px;font-family:${FONT_UI};color:${T.inkStrong};}
.pl-sheet{--rp-fill:#A3782B;--rp-empty:#A3782B;--rp-empty-op:0.28;}
.pl-hero{position:relative;height:200px;border-radius:${PACK_R.card}px;overflow:hidden;background:${T.tileBg};display:grid;place-items:center;}
.pl-hero img.pl-photo{display:block;width:100%;height:100%;object-fit:cover;}
.pl-hero img.pl-stk{width:96px;height:96px;object-fit:contain;}
.pl-eb{margin:0;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.pl-name{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.15;letter-spacing:.02em;color:${T.inkStrong};overflow-wrap:anywhere;} /* písmo: meno */
.pl-sec{display:flex;flex-direction:column;gap:${S.sm}px;}
.pl-desc{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.5;color:${T.inkStrong};white-space:pre-line;overflow-wrap:anywhere;}
.pl-meta{margin:0;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.pl-tags{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.pl-tag{display:inline-flex;align-items:center;gap:${S.sm}px;min-height:32px;padding:${S.xs}px ${S.md}px ${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};background:${T.tileBg};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkStrong};}
.pl-tag img{width:24px;height:24px;object-fit:contain;display:block;}
.pl-rate{display:flex;align-items:center;flex-wrap:wrap;gap:${S.sm}px;font-size:${PACK_TEXT.body}px;font-weight:600;}
.pl-rate small{font-size:${PACK_TEXT.body}px;font-weight:400;color:${T.inkWarm};}
.pl-invite{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1.5px dashed ${T.cardEdge};}
.pl-invite b{display:block;font-size:${PACK_TEXT.body}px;font-weight:600;}
.pl-invite small{font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.pl-acts{display:grid;grid-template-columns:1fr 1fr;gap:${S.md}px;}
.pl-acts .pk-b3{width:100%;min-height:52px;padding:0 ${S.md}px;font-size:${PACK_TEXT.lead}px;text-align:center;}
.pl-nav{display:grid;grid-template-columns:repeat(3,1fr);gap:${S.sm}px;}
.pl-nav a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.xs}px;min-height:56px;padding:${S.sm}px;border-radius:${PACK_R.field}px;border:1.5px solid ${T.cardEdge};background:${T.tileBg};font-size:${PACK_TEXT.micro}px;font-weight:600;color:${T.inkStrong};text-align:center;text-decoration:none;}
.pl-nav img{width:24px;height:24px;display:block;}
.pl-box{display:flex;flex-direction:column;padding:${S.lg}px;}
.pl-post{display:grid;grid-template-columns:36px minmax(0,1fr);gap:${S.sm}px;padding:${S.md}px 0;border-top:1px solid ${T.hairline};}
.pl-post:first-child{border-top:0;padding-top:0;}
.pl-post:last-child{padding-bottom:0;}
.pl-av{width:36px;height:36px;border-radius:${PACK_R.pill}px;object-fit:cover;border:1.5px solid ${T.cardEdge};display:grid;place-items:center;background:${T.tileBg};}
.pl-who{display:flex;align-items:center;flex-wrap:wrap;gap:${S.sm}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.pl-who b{font-family:${FONT_TITLE};font-weight:700;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: meno */
.pl-num{font-weight:600;color:${LAPIS.edge};}
.pl-text{margin:${S.xs}px 0 0;font-size:${PACK_TEXT.body}px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere;}
.pl-ph{display:flex;flex-wrap:wrap;gap:${S.xs}px;margin-top:${S.sm}px;}
.pl-ph img{width:64px;height:64px;border-radius:${PACK_R.field}px;object-fit:cover;}
.pl-mine{border:1.5px solid ${LAPIS.edge};border-radius:${PACK_R.tile}px;padding:${S.md}px;}
.pl-link{all:unset;box-sizing:border-box;cursor:pointer;min-height:36px;display:inline-flex;align-items:center;font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkWarm};}
.pl-link:hover{text-decoration:underline;}
.pl-link--lapis{color:${LAPIS.edge};}
.pl-linkrow{display:flex;flex-wrap:wrap;gap:${S.lg}px;}
.pl-note{margin:${S.xs}px 0 0;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.pl-note--bad{color:${PICK_INK.red};}
.pl-empty{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.5;color:${T.inkWarm};}
.pl-valid{display:flex;align-items:center;flex-wrap:wrap;gap:${S.sm}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.pl-chip{display:inline-flex;align-items:center;gap:${S.xs}px;min-height:36px;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.hairline};background:${T.tileBg};cursor:pointer;
  font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkStrong};}
.pl-chip.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.pl-fill{display:flex;align-items:center;flex-wrap:wrap;gap:${S.sm}px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1.5px dashed ${T.cardEdge};font-size:${PACK_TEXT.body}px;font-weight:600;}
.pl-sheet-b{display:flex;flex-direction:column;gap:${S.lg}px;padding-top:${S.xs}px;}
.pl-sheet-b .pk-b3{width:100%;min-height:52px;padding:0 ${S.md}px;font-size:${PACK_TEXT.lead}px;}
.pl-paws{display:flex;justify-content:center;}
.pl-text-in{width:100%;min-height:88px;padding:${S.md}px;font-family:${FONT_UI};font-size:${PACK_TEXT.lead}px;line-height:1.5;color:${T.inkStrong};resize:vertical;}
.pl-ai{display:flex;align-items:center;gap:${S.sm}px;padding:${S.sm}px ${S.md}px;font-size:${PACK_TEXT.label}px;}
.pl-ai b span{color:${LAPIS.edge};}
@media (min-width:768px){
  .pl-hero{height:280px;}
}
`;

// ============================================================================
// OBAL — nájde značku, kým sa hľadá, ukáže kostru
// ============================================================================
export default function PackPlace() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const onBack = useBack('/pack/map');
  const notes = useMapNotes(true);
  const note = useMemo(() => notes.memberNotes.find((n) => n.id === id), [notes.memberNotes, id]);
  return (
    <PackLayout onBack={onBack} backLabel={t('pack.placeProfile.back')}>
      <SosStyles />
      <style>{B3_CSS + CSS}</style>
      <div className="pl-root">
        {!note && notes.loading && <div className="pk-skel" style={{ height: 320, borderRadius: PACK_R.card }} aria-hidden />}
        {!note && !notes.loading && <p className="pl-empty">{t('pack.placeProfile.notFound')}</p>}
        {note && <PlaceBody note={note} reloadNotes={notes.reload} vote={notes.vote} remove={notes.remove} />}
      </div>
    </PackLayout>
  );
}

function PlaceBody({ note, reloadNotes, vote, remove }: {
  note: MapNote; reloadNotes: () => Promise<void> | void;
  vote: (id: string, valid: boolean | null) => Promise<void>; remove: (id: string) => Promise<void>;
}) {
  const t = useT();
  const { lang } = useLang();
  const loc = intlLocale(lang);
  const nav = useNavigate();
  const { toast } = useToast();
  const { posts, stats, reload } = useMapPlacePosts(note.id);
  const [sheet, setSheet] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const mine = posts.find((p) => p.isMine && (p.paws != null || p.body.trim() || p.photos.length));
  const others = posts.filter((p) => !p.isMine && (p.body.trim() || p.photos.length));
  const heroPhoto = posts.flatMap((p) => p.photos)[0] ?? null;
  const sticker = noteStickerSrc(note.kind, null, note.paid);
  const isParking = note.kind === 'parking';
  const avgTxt = (n: number) => n.toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const date = new Date(note.createdAt).toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' });
  const canVote = !note.isMine;

  const saved = () => { setSheet(false); reload(); toast({ description: t('pack.placeProfile.saved') }); };
  const fill = async (paid: boolean) => {
    setBusy(true);
    try { await fillParkingPaid(note.id, paid); await reloadNotes(); } catch { toast({ description: t('pack.placeProfile.error') }); } finally { setBusy(false); }
  };
  const doVote = async (valid: boolean) => {
    setBusy(true);
    try { await vote(note.id, note.myVote === valid ? null : valid); } catch { toast({ description: t('pack.placeProfile.error') }); } finally { setBusy(false); }
  };
  const del = async () => {
    setBusy(true);
    try { await remove(note.id); nav('/pack/map', { replace: true }); } catch { toast({ description: t('pack.placeProfile.error') }); setBusy(false); }
  };

  return (
    <>
      <div className="pl-hero">
        {heroPhoto
          ? <img className="pl-photo" src={sizedUrl(heroPhoto, 900)} alt="" decoding="async" />
          : sticker && <img className="pl-stk" src={sticker} alt="" draggable={false} />}
      </div>

      <div className="pl-sec">
        <h2 className="pl-eb">{t('pack.placeProfile.eyebrow')}</h2>
        <h1 className="pl-name">{t(`pack.mapNotes.kind.${note.kind}`)}</h1>
        {note.body && <p className="pl-desc">{note.body}</p>}
        <p className="pl-meta">{note.authorFirst ? `${t('pack.placeProfile.addedBy', { name: note.authorFirst })} · ` : ''}{date}</p>
        {isParking && (
          <div className="pl-tags">
            {note.paid != null && (
              <span className="pl-tag"><img src={sticker ?? ''} alt="" />{t(note.paid ? 'pack.mapNotes.parking.paid' : 'pack.mapNotes.parking.free')}</span>
            )}
            {note.overnight && (
              <span className="pl-tag"><img src={caravanStickerSrc()} alt="" />{t('pack.mapNotes.parking.overnight')}</span>
            )}
          </div>
        )}
        {isParking && note.paid == null && (
          <div className="pl-fill">
            <span>{t('pack.placeProfile.paidUnknown')}</span>
            <button type="button" className="pl-chip" disabled={busy} onClick={() => fill(true)}>{t('pack.placeProfile.yes')}</button>
            <button type="button" className="pl-chip" disabled={busy} onClick={() => fill(false)}>{t('pack.placeProfile.no')}</button>
          </div>
        )}
        {note.isStale && <p className="pl-note pl-note--bad">{t('pack.placeProfile.stale')}</p>}
      </div>

      {/* Packy Dogypťanov. Bez hodnotenia výzva, nikdy nula. */}
      {stats ? (
        <div className="pl-rate">
          <RatingPaws stars={stats.avg} size={18} gap={3} />
          <span>{avgTxt(stats.avg)}</span>
          <small>· {t('pack.placeProfile.rated', { count: stats.n.toLocaleString(loc) })}</small>
        </div>
      ) : (
        <button type="button" className="pl-invite" onClick={() => setSheet(true)}>
          <RatingPaws stars={0} size={16} gap={3} />
          <span><b>{t('pack.placeProfile.beenQ')}</b><small>{t('pack.placeProfile.beenSub')}</small></span>
        </button>
      )}

      <div className="pl-sec">
        <div className="pl-acts">
          <button type="button" className="pk-b3 pk-b3--lapis" aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)}>{t('pack.placeProfile.navBtn')}</button>
          <button type="button" className="pk-b3 pk-b3--paper" onClick={() => setSheet(true)}>{t('pack.placeProfile.rateBtn')}</button>
        </div>
        {navOpen && (
          <div className="pl-nav" role="group" aria-label={t('pack.placeProfile.navOpen')}>
            {[...NAV_APPS, ...(isAppleDevice() ? [{ id: 'apple' as NavApp, name: 'Apple Maps', logo: null }] : [])].map((a) => (
              <a key={a.id} href={navUrl(a.id, { lat: note.lat, lon: note.lon, parking: isParking })} target="_blank" rel="noopener noreferrer" onClick={() => setNavOpen(false)}>
                {a.logo ? <img src={a.logo} alt="" aria-hidden="true" /> : <SysIcon name="mapa" size={24} />}{a.name}
              </a>
            ))}
          </div>
        )}
      </div>

      <section className="pl-sec">
        <h2 className="pl-eb">{t('pack.placeProfile.posts')}</h2>
        <div className="pl-box" style={{ ...PACK_BOX.subblock }}>
          {mine && (
            <div className="pl-mine" style={{ marginBottom: others.length ? S.md : 0 }}>
              <p className="pl-note" style={{ marginTop: 0 }}>{t('pack.placeProfile.mine')}</p>
              <PostRow p={mine} loc={loc} onChanged={reload} />
              <div className="pl-linkrow">
                <button type="button" className="pl-link pl-link--lapis" onClick={() => setSheet(true)}>{t('pack.placeProfile.edit')}</button>
                <button type="button" className="pl-link" onClick={async () => { try { await deleteMapPlacePost(mine.id); reload(); } catch { toast({ description: t('pack.placeProfile.error') }); } }}>
                  {t('pack.placeProfile.delete')}
                </button>
              </div>
            </div>
          )}
          {others.length === 0 && !mine && <p className="pl-empty">{t('pack.placeProfile.noPosts')}</p>}
          {others.map((p) => <PostRow key={p.id} p={p} loc={loc} onChanged={reload} />)}
        </div>
      </section>

      {/* Dnešné „Platí ešte? / Už neplatí" ostáva pod postrehmi (2× už neplatí = značka zošedne). */}
      {canVote && (
        <div className="pl-valid">
          <span>{t('pack.placeProfile.stillValid')}</span>
          <button type="button" className={`pl-chip${note.myVote === true ? ' on' : ''}`} aria-pressed={note.myVote === true} disabled={busy} onClick={() => doVote(true)}>
            {t('pack.mapNotes.vote.valid')}{note.validVotes > 0 && <b>{note.validVotes}</b>}
          </button>
          <button type="button" className={`pl-chip${note.myVote === false ? ' on' : ''}`} aria-pressed={note.myVote === false} disabled={busy} onClick={() => doVote(false)}>
            {t('pack.mapNotes.vote.stale')}{note.staleVotes > 0 && <b>{note.staleVotes}</b>}
          </button>
        </div>
      )}
      {note.isMine && (
        <div className="pl-linkrow">
          <button type="button" className="pl-link" disabled={busy} onClick={del}>{t('pack.mapNotes.delete')}</button>
        </div>
      )}

      {sheet && <RateSheet noteId={note.id} mine={mine} onClose={() => setSheet(false)} onSaved={saved} />}
    </>
  );
}

// ── POSTREH ────────────────────────────────────────────────────────────────
function PostRow({ p, loc, onChanged }: { p: PlaceProfilePost; loc: string; onChanged: () => void }) {
  const t = useT();
  const [reported, setReported] = useState(false);
  const [err, setErr] = useState(false);
  const date = new Date(p.createdAt).toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' });
  const report = async () => {
    try { await reportMapPlacePost(p.id, 'other'); setReported(true); onChanged(); } catch { setErr(true); }
  };
  return (
    <article className="pl-post">
      {p.avatarUrl ? <img className="pl-av" src={p.avatarUrl} alt="" loading="lazy" /> : <span className="pl-av" aria-hidden><img src={ICON('paw')} alt="" style={{ width: 18, height: 18 }} /></span>}
      <div style={{ minWidth: 0 }}>
        <div className="pl-who">
          <b>{p.authorFirst || '?'}</b>
          {p.packNumber != null && <span className="pl-num">#{p.packNumber}</span>}
          {p.paws != null && <RatingPaws stars={p.paws} size={12} gap={2} />}
          <span style={{ marginLeft: 'auto' }}>{date}</span>
        </div>
        {p.body && <p className="pl-text">{p.body}</p>}
        {p.photos.length > 0 && <div className="pl-ph">{p.photos.map((u) => <img key={u} src={sizedUrl(u, 160)} alt="" loading="lazy" />)}</div>}
        {p.isMine && p.review === 'pending' && <p className="pl-note">{t('pack.placeProfile.pending')}</p>}
        <div className="pl-linkrow">
          {!p.isMine && !reported && <button type="button" className="pl-link" onClick={report}>⚑ {t('pack.placeProfile.report')}</button>}
          {!p.isMine && reported && <span className="pl-note">{t('pack.placeProfile.reported')}</span>}
        </div>
        {err && <p className="pl-note pl-note--bad">{t('pack.placeProfile.error')}</p>}
      </div>
    </article>
  );
}

// ── ŠUPLÍK: AKO SA TI TU PÁČILO? ───────────────────────────────────────────
function RateSheet({ noteId, mine, onClose, onSaved }: { noteId: string; mine?: PlaceProfilePost; onClose: () => void; onSaved: () => void }) {
  const t = useT();
  const [paws, setPaws] = useState(mine?.paws ?? 0);
  const [been, setBeen] = useState(!!mine); // kto už hodnotil, „Boli sme tu" už raz odklikol
  const [body, setBody] = useState(mine?.body ?? '');
  const ph = usePlacePhotos(mine?.photos ?? []);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (saving || ph.busy) return;
    if (paws < 1) { setErr(t('pack.placeProfile.needPaws')); return; }
    if (!been) { setErr(t('pack.placeProfile.needBeen')); return; }
    setSaving(true); setErr(null);
    try {
      await rateMapPlace({ noteId, paws, body: body.trim().slice(0, PLACE_BODY_MAX), photos: ph.urls.slice(0, PLACE_MAX_PHOTOS) });
      onSaved();
    } catch (e) {
      const m = errText(e);
      setErr(m.includes('not_member') ? t('pack.placeProfile.needDog') : m.includes('not_been_there') ? t('pack.placeProfile.needBeen') : t('pack.placeProfile.error'));
      setSaving(false);
    }
  };

  return (
    <PackPopup title={t('pack.placeProfile.sheet')} onClose={onClose} className="pl-sheet">
      <style>{PF_FIELD_CSS}</style>
      <style>{PLACE_FORM_CSS}</style>
      <div className="pl-sheet-b">
        <div className="pl-paws"><PawRating value={paws} onChange={(n) => { setPaws(n); setErr(null); }} size={36} /></div>
        <PlaceCheck on={been} onChange={(v) => { setBeen(v); setErr(null); }} label={t('pack.placeProfile.been')} />
        <div className="pl-sec">
          <h3 className="pl-eb">{t('pack.placeProfile.note')} {t('pack.placeProfile.optional')}</h3>
          <textarea className="pf-field pl-text-in" rows={3} maxLength={PLACE_BODY_MAX} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="pl-sec">
          <h3 className="pl-eb">{t('pack.placeProfile.photo')}</h3>
          <PlacePhotoSlots ph={ph} addLabel={t('pack.placeProfile.photoAdd')} removeLabel={t('pack.placeProfile.photoRemove')} />
        </div>
        <div className="pl-ai" style={{ ...PACK_BOX.subblock }}>
          <SysIcon name="ainubis" size={28} />
          <span>{t('pack.placeProfile.reviewBy')} <b><span>AI</span>NUBIS</b>.</span>
        </div>
        {err && <p className="pl-note pl-note--bad" role="alert">{err}</p>}
        <button type="button" className="pk-b3 pk-b3--lapis" disabled={saving || ph.busy} onClick={submit}>{t('pack.placeProfile.save')}</button>
      </div>
    </PackPopup>
  );
}
