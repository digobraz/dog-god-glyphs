// ============================================================================
// PRÍBEH NA VLASTNEJ ADRESE — `modal-as-route` (architektúra v0)
//
// Okno nad článkom, ktoré má VLASTNÚ URL: `/pack/map/:country/:slug/pribeh/:n`.
// Dá sa zdieľať aj indexovať, prežije obnovenie stránky a šípka späť vráti na
// článok. 🔴 NIE `#hash` — to by sa nedalo ani zdieľať, ani indexovať.
//
// 🗂️ KÔŠ 2 „POZERÁM SA" (lock §3): hore šípka späť, dole lišta, ktorá pri scrolle
// ustúpi. Vrstva nevzniká na novej route mimo článku práve preto — dedí jeho shell,
// takže sa nemá ako rozísť s ním. (Register `routa → kôš` ešte nie je v kóde; keď
// vznikne, táto adresa doň patrí do koša 2 spolu s článkom.)
//
// Obsah podľa nákresu `plany/nakres-odysea-zapisy-2026-09-22.html`, obrazovka 3.
// ⚠️ NADPIS PRÍBEHU TU NIE JE. Nákres ho kreslí („Posledný kopec"), ale zadanie ho
// nemá ani v obsahu obrazovky, ani medzi poliami písania (KROK 4) — príbeh má text,
// nie titulok. Keby ho Matej chcel, je to jedno pole a jeden riadok tu.
// ============================================================================
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import {
  PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, PACK_SHADOW,
  PACK_THEME, FONT_TITLE, FONT_UI,
} from '../packTheme';
import { LAPIS } from '../navGoldSkin';
import { HandPlus, HandForward, HandStar, HandLink, HandHeart } from '../HandIcons';
import { BackButton } from '../BackButton';
import type { TripStory } from '../story/storyData';
import { getConsent } from '@/lib/consent';

const T = PACK_THEME;
const DOG_NAME_FONT = "'Cinzel Decorative','Cinzel',serif";

/** YouTube id z bežných tvarov odkazu. Nič iné sa nevkladá — appka vie vykresliť
 *  náhľad len pre YouTube, hocijakú URL nie (rozhodnutie 6). */
export function youtubeId(url: string | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

export const STORY_VIEW_CSS = `
/* Vrstva nad článkom. position:fixed + vlastný scroll — článok pod ňou ostáva
   tam, kde bol, takže návrat späť nepristane na vrchu stránky. */
.psv-veil{
  position:fixed; inset:0; z-index:120; overflow-y:auto;
  background:${T.pageBg};
  -webkit-overflow-scrolling:touch;
}
.psv-wrap{ max-width:760px; margin:0 auto; padding:0 0 ${PACK_SPACE.xxxl}px; }
.psv-hero{
  position:relative; width:100%; height:38vh; min-height:220px; max-height:380px;
  overflow:hidden; background:${T.tileBg};
}
.psv-hero > img{ width:100%; height:100%; object-fit:cover; display:block; }
.psv-back{
  position:absolute; top:calc(env(safe-area-inset-top,0px) + ${PACK_SPACE.lg}px);
  left:${PACK_SPACE.lg}px; z-index:3;
}
/* Telo príbehu = KARTA (PACK_BOX.card) vytiahnutá pod fotku. */
.psv-body{
  position:relative; z-index:2;
  margin:-${PACK_SPACE.xl}px ${PACK_SPACE.lg}px 0;
  padding:${PACK_SPACE.xl}px ${PACK_SPACE.lg}px;
  font-family:${FONT_UI}; color:${T.inkStrong};
}
.psv-when{
  font-family:${PACK_HEAD.section.fontFamily}; font-weight:${PACK_HEAD.section.fontWeight};
  font-size:${PACK_HEAD.section.fontSize}px; letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase; color:${T.inkWarm};
}
/* „ako prvý" je ZLATÉ — je to poloha v kronike, nie akcia (deliaca čiara brandu). */
.psv-first{ color:${T.cardEdge}; }
/* NADPIS PRÍBEHU — nákres ho kreslí medzi dátum a riadok s tvárou („Posledný kopec").
   Tvar je NADPIS KARTY z katalógu (PACK_HEAD.card), nie vlastný stupeň: nákres má
   15px/.06em, ale to je mierka kresby a .06em nie je žiadny z troch tvarov PACK_HEAD.
   ⚠️ Prázdny nadpis sa NEVYKRESLÍ vôbec — štyri staršie príbehy ho nemajú. */
.psv-title{
  font-family:${PACK_HEAD.card.fontFamily}; font-weight:${PACK_HEAD.card.fontWeight};
  font-size:${PACK_HEAD.card.fontSize}px; letter-spacing:${PACK_HEAD.card.letterSpacing};
  line-height:1.2; color:${T.inkStrong}; margin:${PACK_SPACE.sm}px 0 0;
}
.psv-who{
  display:flex; align-items:center; gap:${PACK_SPACE.sm}px;
  margin:${PACK_SPACE.md}px 0 ${PACK_SPACE.lg}px;
}
/* 🔴 TVÁR JE ČLOVEK, KĽUDNE AJ SO PSOM (Matej 22. 9.). Dva medailóny s miernym
   prekryvom — ten istý čítaný tvar ako blok JA + SVORKA na domove, len v malom.
   ⚠️ Fotka ČLOVEKA sedí v metadátach účtu, nie v dogs; vracia ju RPC. Keď ju
   človek nemá, ostane medailón s iniciálou — to nie je chyba, to je väčšina účtov. */
.psv-faces{ flex:0 0 auto; display:flex; align-items:center; }
.psv-faces > * + *{ margin-left:-${PACK_SPACE.sm}px; }
.psv-face{
  flex:0 0 auto; width:36px; height:36px; border-radius:${PACK_R.pill}px;
  display:flex; align-items:center; justify-content:center; overflow:hidden;
  background:${T.tileBg}; border:1.5px solid ${T.border};
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.body}px; color:${T.inkWarm};
}
/* Pes je DRUHÝ a menší: príbeh píše človek. Zlatý lem ho odlíši v prekryve. */
.psv-face--dog{ width:30px; height:30px; border-color:${T.cardEdge}; }
.psv-face > img{ width:100%; height:100%; object-fit:cover; display:block; }
.psv-name{ font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.lead}px; letter-spacing:0.02em; }
.psv-dog{ font-family:${DOG_NAME_FONT}; font-weight:700; }
.psv-sub{ font-size:${PACK_TEXT.label}px; color:${T.inkWarm}; }
.psv-text{ font-size:${PACK_TEXT.body}px; line-height:1.75; color:${T.inkDim}; white-space:pre-wrap; }
.psv-gal{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:${PACK_SPACE.sm}px; margin:${PACK_SPACE.lg}px 0; }
.psv-gal button{
  padding:0; border:1px solid ${T.border}; border-radius:${PACK_R.tile}px;
  overflow:hidden; background:${T.tileBg}; cursor:pointer; aspect-ratio:4/3;
}
.psv-gal img{ width:100%; height:100%; object-fit:cover; display:block; }
/* Odkaz autora = LAPIS riadok. Lapis, lebo je to VOĽBA AUTORA, nie nábytok appky. */
.psv-link{
  display:flex; align-items:center; gap:${PACK_SPACE.sm}px; width:100%;
  border:1px solid ${T.border}; border-left:3px solid ${LAPIS.edge};
  border-radius:${PACK_R.field}px; background:${T.tileBg};
  padding:${PACK_SPACE.md}px; margin-top:${PACK_SPACE.lg}px;
  font-family:${FONT_UI}; font-size:${PACK_TEXT.label}px; color:${LAPIS.edge};
  text-decoration:none; cursor:pointer;
}
.psv-link b{ font-family:${FONT_TITLE}; font-weight:700; letter-spacing:0.02em; }
.psv-link span{ margin-left:auto; }
/* VIDEO — 🔴 pred klikom sa z YouTube nenačíta NIČ, ani náhľadový obrázok.
   Preto je plocha kreslená nami (papyrusový pás), nie img.youtube.com. */
.psv-yt{
  margin-top:${PACK_SPACE.md}px; border:1px solid ${T.border};
  border-radius:${PACK_R.field}px; overflow:hidden; background:${T.tileBg};
}
.psv-yt-poster{
  width:100%; border:0; padding:0; cursor:pointer;
  height:150px; background:${T.tileBg};
  display:flex; align-items:center; justify-content:center;
}
.psv-yt-play{
  width:44px; height:32px; border-radius:${PACK_R.field}px;
  background:${LAPIS.grad}; color:${LAPIS.ink};
  display:flex; align-items:center; justify-content:center;
  box-shadow:${PACK_SHADOW.lift};
}
.psv-yt-cap{
  font-family:${FONT_UI}; font-weight:500; font-size:${PACK_TEXT.micro}px;
  letter-spacing:${PACK_HEAD.section.letterSpacing}; text-transform:uppercase;
  color:${T.inkWarm}; padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  border-top:1px solid ${T.hairline};
}
.psv-yt iframe{ display:block; width:100%; aspect-ratio:16/9; border:0; }
.psv-acts{
  display:flex; align-items:center; gap:${PACK_SPACE.lg}px;
  margin-top:${PACK_SPACE.lg}px; padding-top:${PACK_SPACE.md}px;
  border-top:1px solid ${T.hairline}; color:${T.inkWarm};
}
.psv-act{
  background:none; border:0; padding:0; cursor:pointer; line-height:1;
  display:inline-flex; align-items:center; gap:${PACK_SPACE.xs}px;
  font-family:${FONT_UI}; font-size:${PACK_TEXT.label}px; color:${T.inkWarm};
}
.psv-act--on{ color:${LAPIS.edge}; }
/* „Ďalší príbeh ›" — posun v kronike, nie odchod zo stránky. */
.psv-next{
  display:flex; align-items:center; justify-content:space-between; gap:${PACK_SPACE.sm}px;
  width:100%; margin-top:${PACK_SPACE.lg}px; cursor:pointer;
  background:none; border:0; padding:${PACK_SPACE.md}px 0 0;
  border-top:1px solid ${T.hairline};
  font-family:${PACK_HEAD.section.fontFamily}; font-weight:${PACK_HEAD.section.fontWeight};
  font-size:${PACK_HEAD.section.fontSize}px; letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase; color:${T.cardEdge};
}
.psv-next i{ font-style:normal; letter-spacing:0.02em; text-transform:none; color:${T.inkWarm}; }
`;

export interface StoryViewProps {
  story: TripStory;
  next: TripStory | null;
  locale: string;
  onClose: () => void;
  onNext: (s: TripStory) => void;
  onLike: () => void;
  onSave: () => void;
  onUse: () => void;
  onShare: () => void;
}

export function StoryView({ story, next, locale, onClose, onNext, onLike, onSave, onUse, onShare }: StoryViewProps) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const vid = youtubeId(story.attach.youtube);

  // Nový príbeh = nové video. Bez toho by po „ďalší príbeh" hral ten predchádzajúci.
  useEffect(() => { setPlaying(false); }, [story.id]);

  // Kôš 2: vrstva je nad stránkou, takže telo pod ňou nemá scrollovať.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const when = story.happenedAt
    ? new Date(story.happenedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const dogs = story.dogs.map((d) => d.name).filter(Boolean);

  /* 🔴 KLIK-NAČÍTA (rozhodnutie b). Bez súhlasu na VLOŽENÚ VRSTVU sa nič nevkladá —
     klik otvorí YouTube v novej karte. So súhlasom ide `youtube-nocookie`. */
  const playVideo = () => {
    if (getConsent()?.marketing) { setPlaying(true); return; }
    window.open(story.attach.youtube, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="psv-veil" role="dialog" aria-modal="true">
      <div className="psv-wrap">
        <div className="psv-hero">
          {story.photos[0] && <img src={story.photos[0]} alt="" />}
          <div className="psv-back"><BackButton tone="scrim" onClick={onClose} label={t('pack.trip.backToTrips')} /></div>
        </div>

        <div className="psv-body" style={{ ...PACK_BOX.card }}>
          {/* Poradie stoji LEN TU. Nakres ho ma dvakrat (v riadku datumu aj pod menom),
              ale „ako prvy" a „1. v kronike" su to iste slovo dvakrat pod sebou —
              pod menom ostava uz len PSIE CISLO, ktore hovori nieco ine. */}
          <div className="psv-when">
            {when ? `${t('pack.trip.stories.walked')} ${when}` : ''}
            {when ? ' · ' : ''}
            <b className="psv-first">
              {story.rank === 1 ? t('pack.trip.stories.first') : t('pack.trip.stories.nth', { n: story.rank })}
            </b>
          </div>

          {story.title && <h1 className="psv-title">{story.title}</h1>}

          <div className="psv-who">
            <span className="psv-faces">
              <span className="psv-face">
                {story.ownerPhoto
                  ? <img src={story.ownerPhoto} alt="" loading="lazy" />
                  : (story.ownerFirst || '?').slice(0, 1).toUpperCase()}
              </span>
              {story.dogs[0]?.photo && (
                <span className="psv-face psv-face--dog">
                  <img src={story.dogs[0].photo} alt="" loading="lazy" />
                </span>
              )}
            </span>
            <span>
              <span className="psv-name">
                {story.ownerFirst || '—'}
                {dogs.length > 0 && <> &amp; <span className="psv-dog">{dogs.join(' · ')}</span></>}
              </span>
              <br />
              {story.dogs[0] && <span className="psv-sub">{`#${story.dogs[0].n}`}</span>}
            </span>
          </div>

          <p className="psv-text">{story.body}</p>

          {story.photos.length > 1 && (
            <div className="psv-gal">
              {/* Kluc nesie INDEX, nie URL — tu istu fotku sa da do galerie nahrat dvakrat
                  a React by na dvoch rovnakych klucoch hlasil kolziu (zmerane 22. 9.). */}
              {story.photos.slice(1).map((src, i) => (
                <button key={`${i}-${src}`} type="button" onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}>
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {story.attach.link && (
            <a className="psv-link" href={story.attach.link} target="_blank" rel="noopener noreferrer">
              <HandLink size={14} />
              <b>{t('pack.trip.stories.authorLink')}</b>
              <span aria-hidden="true"><HandForward size={12} /></span>
            </a>
          )}

          {vid && (
            <div className="psv-yt">
              {playing ? (
                /* `youtube-nocookie` = žiadne sledovacie cookies pred prehratím. */
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1`}
                  title={t('pack.trip.stories.video')}
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <button type="button" className="psv-yt-poster" onClick={playVideo}
                    aria-label={t('pack.trip.stories.video')}>
                    <span className="psv-yt-play" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 1 L11 6 L2 11 Z" fill="currentColor" /></svg>
                    </span>
                  </button>
                  <div className="psv-yt-cap">{t('pack.trip.stories.video')} · youtube.com</div>
                </>
              )}
            </div>
          )}

          <div className="psv-acts">
            <button type="button" className={`psv-act${story.liked ? ' psv-act--on' : ''}`}
              onClick={onLike} aria-label={t('pack.trip.stories.act.like')}>
              <HandHeart size={15} on={story.liked} />{story.likes > 0 && <b>{story.likes}</b>}
            </button>
            <button type="button" className={`psv-act${story.saved ? ' psv-act--on' : ''}`}
              onClick={onSave} aria-label={t('pack.trip.stories.act.save')}><HandStar size={15} /></button>
            <button type="button" className="psv-act" onClick={onUse}
              aria-label={t('pack.trip.stories.act.use')}><HandPlus size={15} /></button>
            <button type="button" className="psv-act" onClick={onShare}
              aria-label={t('pack.trip.stories.act.share')}><HandForward size={15} /></button>
          </div>

          {next && (
            <button type="button" className="psv-next" onClick={() => onNext(next)}>
              <span>{t('pack.trip.stories.next')}</span>
              <i>{next.ownerFirst}{next.dogs[0] ? ` & ${next.dogs[0].name}` : ''} ›</i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
