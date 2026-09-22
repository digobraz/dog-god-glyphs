// ============================================================================
// KRONIKA TRASY — rad príbehov pod popisom výletu
//
// 🔴 NIE JE TO DENNÍK PO DŇOCH. Prvé kolo návrhu kreslilo dvanásť zápisov JEDNÉHO
// človeka a Matej ho 22. 9. prepísal: *„ten kto ju prejde ako prvý, jeho príbeh
// bude zapísaný ako prvý"*. Pod trasou stojí PO JEDNOM PRÍBEHU OD KAŽDÉHO, kto ju
// prešiel, zoradené podľa toho, kto prešiel prvý.
//
// Rozhodnutie 4: **tri + „ukázať všetkých N"** — pod kronikou je ešte hodnotenie
// a komentáre, takže sedem blokov by ich odtlačilo pod okraj obrazovky.
//
// Zadanie: `plany/zadanie-odysea-pribehy-FRESH-SESSION.md` · nákres:
// `plany/nakres-odysea-zapisy-2026-09-22.html` · issue #61.
// ============================================================================
import { useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { PACK_SPACE, PACK_TEXT, PACK_HEAD, PACK_THEME, PACK_R, FONT_UI } from '../packTheme';
import { StoryCard, STORY_CARD_CSS } from './StoryCard';
import { toggleMark, type TripStory } from '../story/storyData';

const T = PACK_THEME;
const SHOWN = 3;

export const TRIP_STORIES_CSS = `
${STORY_CARD_CSS}
.pst-sec{ margin-top:${PACK_SPACE.xl}px; }
.pst-head{
  display:flex; align-items:center; justify-content:space-between; gap:${PACK_SPACE.sm}px;
  font-family:${PACK_HEAD.section.fontFamily}; font-weight:${PACK_HEAD.section.fontWeight};
  font-size:${PACK_HEAD.section.fontSize}px; letter-spacing:${PACK_HEAD.section.letterSpacing};
  text-transform:uppercase; color:${T.cardEdge};
  margin-bottom:${PACK_SPACE.md}px;
}
/* Pravá polovica hlavičky je VYSVETLENIE poradia, nie druhý nadpis — preto bez
   rozstrelenia a bez verzálok. */
.pst-head b{ font-weight:${PACK_HEAD.section.fontWeight}; }
.pst-head span{ letter-spacing:0.02em; text-transform:none; color:${T.inkWarm}; }
/* „Ukázať všetkých N" je ODHALENIE, nie CTA — preto čiarkovaný obrys a tlmený
   inkoust, nie lapisová plocha. Plná farba patrí jedinému CTA na povrchu. */
.pst-more{
  display:block; width:100%; text-align:center; cursor:pointer;
  border:1px dashed ${T.border}; border-radius:${PACK_R.pill}px;
  background:none; padding:${PACK_SPACE.sm}px;
  font-family:${FONT_UI}; font-weight:500; font-size:${PACK_TEXT.micro}px;
  letter-spacing:0.22em; text-transform:uppercase; color:${T.inkWarm};
  transition:border-color .12s ease, color .12s ease;
}
.pst-more:hover{ border-color:${T.cardEdge}; color:${T.inkStrong}; }
`;

export interface TripStoriesProps {
  stories: TripStory[];
  setStories: React.Dispatch<React.SetStateAction<TripStory[]>>;
  locale: string;
  onOpen: (story: TripStory) => void;
  /** ➕ „vezmi si tú trasu" — existujúci triplist, nie druhé úložisko. */
  onUse: () => void;
  onShare: (story: TripStory) => void;
}

export function TripStories({ stories, setStories, locale, onOpen, onUse, onShare }: TripStoriesProps) {
  const t = useT();
  const [all, setAll] = useState(false);

  // Prázdna kronika sa NEVYKRESLÍ ani ako nadpis — po trase, ktorú nikto nepopísal,
  // nemá ostať prázdna sekcia (rovnaký guard ako `MapNotesSection`).
  if (stories.length === 0) return null;

  const shown = all ? stories : stories.slice(0, SHOWN);

  // Optimisticky: značka sa prepne hneď, zápis dobehne. Akcia nesmie „čakať".
  const mark = (story: TripStory, kind: 'like' | 'save') => {
    const on = kind === 'like' ? !story.liked : !story.saved;
    setStories((prev) => prev.map((s) => (s.id !== story.id ? s : kind === 'like'
      ? { ...s, liked: on, likes: Math.max(0, s.likes + (on ? 1 : -1)) }
      : { ...s, saved: on })));
    toggleMark(story.id, kind, on).then((real) => {
      if (real === on) return;
      setStories((prev) => prev.map((s) => (s.id !== story.id ? s : kind === 'like'
        ? { ...s, liked: real, likes: Math.max(0, s.likes + (real ? 1 : -1) - (on ? 1 : -1)) }
        : { ...s, saved: real })));
    });
  };

  return (
    <section className="pst-sec">
      <div className="pst-head">
        <b>{t('pack.trip.stories.title')} · {stories.length}</b>
        <span>{t('pack.trip.stories.order')}</span>
      </div>

      {shown.map((s) => (
        <StoryCard
          key={s.id}
          story={s}
          locale={locale}
          onOpen={() => onOpen(s)}
          onLike={() => mark(s, 'like')}
          onSave={() => mark(s, 'save')}
          onUse={onUse}
          onShare={() => onShare(s)}
          labels={{
            walked: t('pack.trip.stories.walked'),
            like: t('pack.trip.stories.act.like'),
            save: t('pack.trip.stories.act.save'),
            use: t('pack.trip.stories.act.use'),
            share: t('pack.trip.stories.act.share'),
          }}
        />
      ))}

      {!all && stories.length > SHOWN && (
        <button type="button" className="pst-more" onClick={() => setAll(true)}>
          {t('pack.trip.stories.showAll', { n: stories.length })}
        </button>
      )}
    </section>
  );
}
