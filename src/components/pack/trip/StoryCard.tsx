// ============================================================================
// KARTA PRÍBEHU — JEDNA KRESBA NA VŠETKY MIESTA (lock `architektura-pack.md` §4.1)
//
// Lock: *„Objekt má JEDNU kartu, nech je kdekoľvek — výlet vyzerá rovnako vo feede,
// na mape, v tripliste, v správe aj v profile. To isté pes, človek, PRÍSPEVOK."*
// Preto je karta vlastný komponent a nie kus `PackTripArticle.tsx`: v článku je
// dnes, vo feede (12/2026), na profile a v správe bude tá istá.
//
// Vzhľad = `plany/nakres-odysea-zapisy-2026-09-22.html`, sekcia „Anatómia bloku":
// zlatý odznak poradia · fotka · dátum PREJDENIA · človek + pes · dva riadky
// úryvku · štvorica akcií · dve drobné lapisové značky, keď odkazy sú.
//
// 🔴 ŠTVORICA AKCIÍ HOVORÍ KITOM, NIE EMOJI (Matej 22. 9. 2026).
// Nákres aj lock §4.2 menujú akcie ako ❤️ 🔖 ➕ ↗ a mapové povrchy majú na emoji
// schválenú výnimku — ibaže na papyruse ich kreslí operačný systém: `↗️` je MODRÝ
// ŠTVOREC a `🔖` čmáranica, na každom zariadení iná. Matej po snímke vybral kit:
// `HandPlus` · `HandForward` · `HandStar` · `HandLink` — jeden inkoust, farba textu.
// 🔴 SRDCE V KITE NIE JE. `HeartTemp` nižšie je DOČASNÁ kresba a čaká na Matejovu;
// keď príde, pregeneruj ju do `HandIcons.tsx` a tento komponent zmaž.
// ============================================================================
import { PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PACK_HEAD, PACK_SHADOW, PACK_THEME, FONT_TITLE, FONT_UI } from '../packTheme';
import { LAPIS } from '../navGoldSkin';
import { HandPlus, HandForward, HandStar, HandLink } from '../HandIcons';
import type { TripStory } from '../story/storyData';

const T = PACK_THEME;

/** Meno psa = Cinzel Decorative na OFICIÁLNYCH povrchoch (brand lock).
 *  Príbeh z cesty je oficiálny povrch — je to kronika, nie bežná prevádzka. */
const DOG_NAME_FONT = "'Cinzel Decorative','Cinzel',serif";

export const STORY_CARD_CSS = `
/* Blok kroniky = PODBLOK (PACK_BOX.subblock, r12) — sekcia vnútri karty článku.
   Nie KARTA: tá je celý článok, a desať kariet pod sebou by z kroniky spravilo
   schodisko. Hodnoty sa berú z matrice, tu je len rozloženie. */
.pst-card{
  position:relative; display:flex; gap:${PACK_SPACE.sm}px;
  padding:${PACK_SPACE.sm}px;
  margin-bottom:${PACK_SPACE.sm}px;
  width:100%; text-align:left; cursor:pointer;
  font-family:${FONT_UI};
  transition:transform .12s ease;
}
.pst-card:hover{ transform:translateY(-1px); }
/* Poradie — TEN ISTÝ zlatý odznak, aký nesie fotka psa (.dogblk-num v PackDogs.tsx).
   Nie nová ozdoba: číslo psa a číslo v kronike sú tá istá vec — „koľkátym si".
   ⚠️ DVE HODNOTY SÚ INÉ A ZÁMERNE. Odznak psa leží NA FOTKE, preto má svetlý lem
   a tvrdý tieň — bez nich by na tmavom psovi splynul. Tu leží na papyrusovej doske,
   takže lem je zlatý token a výška je PACK_SHADOW.lift. Doslovné farby odtiaľ
   zmizli aj preto, že ich stráž check:pack meria (rám a tieň, od 15. 9. 2026). */
.pst-num{
  position:absolute; left:-${PACK_SPACE.sm}px; top:-${PACK_SPACE.sm}px; z-index:2;
  display:inline-flex; align-items:center; justify-content:center;
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.label}px;
  letter-spacing:0.02em; line-height:1; white-space:nowrap;
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.sm}px; border-radius:${PACK_R.pill}px;
  background:linear-gradient(180deg,#F5C73D,#E69E1A); color:#3d1f00;
  border:1px solid ${T.border};
  box-shadow:${PACK_SHADOW.lift};
}
/* Fotka = prvá z galérie príbehu. Keď nie je, ostane PRÁZDNY RÁM, nie skrytý blok
   (nákres, bod 2) — inak by sa bloky bez fotky opticky rozpadli z radu.
   ⚠️ Prázdny rám je naozaj PRÁZDNY: emoji fotoaparátu tu stálo do 22. 9. a na papyruse
   ho kreslil operačný systém, teda na každom zariadení inak. */
.pst-photo{
  flex:0 0 auto; width:56px; height:56px;
  border-radius:${PACK_R.field}px; overflow:hidden;
  background:${T.tileBg}; border:1px solid ${T.border};
  display:flex; align-items:center; justify-content:center;
  font-size:${PACK_TEXT.body}px; color:${T.inkFaint};
}
.pst-photo > img{ width:100%; height:100%; object-fit:cover; display:block; }
.pst-mid{ flex:1; min-width:0; }
/* Dátum = tichý eyebrow sekcie (PACK_HEAD.section). */
.pst-date{
  font-family:${PACK_HEAD.section.fontFamily}; font-weight:${PACK_HEAD.section.fontWeight};
  font-size:${PACK_HEAD.section.fontSize}px; letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase; color:${T.inkWarm};
  display:flex; align-items:center; gap:${PACK_SPACE.xs}px;
}
.pst-name{
  font-family:${FONT_TITLE}; font-weight:700; font-size:${PACK_TEXT.body}px;
  letter-spacing:0.02em; color:${T.inkStrong};
  margin:${PACK_SPACE.xs}px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.pst-dog{ font-family:${DOG_NAME_FONT}; font-weight:700; }
/* Úryvok = PRESNE dva riadky, orezané. Dlhý text je až vnútri príbehu. */
.pst-ex{
  font-size:${PACK_TEXT.label}px; line-height:1.4; color:${T.inkDim};
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
/* Štvorica akcií — 🔴 klik NIKDY neodnesie človeka preč (lock §4.2). */
.pst-acts{
  display:flex; align-items:center; gap:${PACK_SPACE.md}px;
  margin-top:${PACK_SPACE.sm}px;
  font-size:${PACK_TEXT.body}px; color:${T.inkWarm};
}
.pst-act{
  background:none; border:0; padding:0; cursor:pointer; line-height:1;
  display:inline-flex; align-items:center; gap:${PACK_SPACE.xs}px;
  font-family:${FONT_UI}; font-size:${PACK_TEXT.label}px; color:${T.inkWarm};
  transition:transform .12s ease;
}
.pst-act:hover{ transform:translateY(-1px); }
.pst-act--on{ color:${LAPIS.edge}; }
.pst-act b{ font-weight:600; font-size:${PACK_TEXT.label}px; }
/* Odkazy autora: v bloku len DVE DROBNÉ ZNAČKY, že tam sú — otvoria sa v príbehu.
   LAPIS, lebo je to VOĽBA AUTORA, nie nábytok appky (deliaca čiara brandu). */
.pst-marks{
  margin-left:auto; display:inline-flex; align-items:center; gap:${PACK_SPACE.xs}px;
  color:${LAPIS.edge}; font-size:${PACK_TEXT.label}px;
}
.pst-play{ display:block; }
`;

/** 🔴 DOČASNÉ SRDCE — v hand-drawn kite nie je a Matej si ho 22. 9. vypýtal na nakreslenie.
 *  Ťah je zámerne nesúmerný, aby sedel k ostatným kresbám; `on` ho vyplní.
 *  ⚠️ Nie je to brandová ikonka. Stráž `check:ikony` inline SVG NEVIDÍ, takže tento
 *  dlh nezasvieti sám — je zapísaný tu a v zadaní príbehov. */
function HeartTemp({ on, size = 14 }: { on: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.4C10.3 19 3.8 14.6 3.4 9.6 3.1 6.3 5.6 4 8.3 4.2c1.7.1 3 1.1 3.7 2.4.6-1.4 2-2.4 3.7-2.5 2.7-.2 5.2 2 5 5.3-.3 5-6.8 9.5-8.7 11z" />
    </svg>
  );
}

/** Náhľadový trojuholník videa. Inline SVG, nie znak `▶` — holý textový znak je
 *  podľa brandu nález „mimo brandu" a stráž `check:ikony` ho meria všade. */
function PlayMark() {
  return (
    <svg className="pst-play" width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
      <path d="M1.5 0.8 L8 4.5 L1.5 8.2 Z" fill="currentColor" />
    </svg>
  );
}

export interface StoryCardProps {
  story: TripStory;
  locale: string;
  /** Otvorí príbeh na jeho vlastnej adrese (modal-as-route). */
  onOpen: () => void;
  onLike: () => void;
  onSave: () => void;
  /** ➕ použiť — pri príbehu „vezmi si tú trasu", teda do triplistu. */
  onUse: () => void;
  onShare: () => void;
  labels: {
    walked: string; like: string; save: string; use: string; share: string;
  };
}

export function StoryCard({ story, locale, onOpen, onLike, onSave, onUse, onShare, labels }: StoryCardProps) {
  const dogs = story.dogs.map((d) => d.name).filter(Boolean);
  const when = story.happenedAt
    ? new Date(story.happenedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  // Akcia sa nesmie preliať do otvorenia príbehu — blok je sám tlačidlo.
  const act = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

  return (
    <div
      className="pst-card"
      style={{ ...PACK_BOX.subblock }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
    >
      <span className="pst-num">{story.rank}</span>
      <div className="pst-photo">
        {story.photos[0] ? <img src={story.photos[0]} alt="" loading="lazy" /> : null}
      </div>
      <div className="pst-mid">
        <div className="pst-date">{when ? `${labels.walked} ${when}` : labels.walked}</div>
        <div className="pst-name">
          {story.ownerFirst || '—'}
          {dogs.length > 0 && <> &amp; <span className="pst-dog">{dogs.join(' · ')}</span></>}
        </div>
        <div className="pst-ex">{story.body}</div>
        <div className="pst-acts">
          <button type="button" className={`pst-act${story.liked ? ' pst-act--on' : ''}`}
            onClick={act(onLike)} aria-label={labels.like}>
            <HeartTemp on={story.liked} />{story.likes > 0 && <b>{story.likes}</b>}
          </button>
          <button type="button" className={`pst-act${story.saved ? ' pst-act--on' : ''}`}
            onClick={act(onSave)} aria-label={labels.save}><HandStar size={14} /></button>
          <button type="button" className="pst-act" onClick={act(onUse)} aria-label={labels.use}>
            <HandPlus size={14} />
          </button>
          <button type="button" className="pst-act" onClick={act(onShare)} aria-label={labels.share}>
            <HandForward size={14} />
          </button>
          {(story.attach.link || story.attach.youtube) && (
            <span className="pst-marks" aria-hidden="true">
              {story.attach.link && <HandLink size={12} />}
              {story.attach.youtube && <PlayMark />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
