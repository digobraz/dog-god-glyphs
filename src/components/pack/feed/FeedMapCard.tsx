// PRIDANIE NA MAPU AKO PRÍSPEVOK — FEED 2 krok 4 (Matej 26. 10. 2026: *„každé pridanie do /map sa tu tiež dá ako
// príspevok na feed"*). Tri druhy: značka (`map_notes`), TRIPWISH (`wish_pins`) a podujatie (`event_editions`).
// 🔁 KOLO 4 (26. 10. neskoro): značky a TRIPWISH z feedu ODIŠLI — načítava sa len podujatie; vetvy kariet ostávajú.
//
// 🔴 ČÍTA SA LEN TO, ČO KLIENT SMIE: existujúce RPC `list_map_notes`, `list_wish_pins`, `list_event_editions`.
//    Všetky tri už vydávajú krstné meno, psa a jeho fotku autora (nie `user_id`) — žiadna migrácia.
//    Čo by potrebovalo server (komentáre pod značkou/prianím, ☆ uložiť, lajk TRIPWISHu a podujatia, hĺbkový odkaz
//    na konkrétnu značku na mape) je v zadaní `zadanie-feed2-dolad-2026-10-26.md` §Krok 4 → záverečná migračná session.
// Lajk značky je skutočný (`like_map_note`, „pomohlo mi to"); lajk prianí a podujatí drží len toto zariadenie.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang, useT } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, PACK_AVATAR } from '@/components/pack/packTheme';
import { HandPaw } from '@/components/pack/HandIcons';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { likeMapNote, type MapNote } from '@/components/pack/mapnotes/mapNotesData';
import { type WishPin } from '@/components/pack/mapnotes/wishData';
import { fetchEvents, type EventItem } from '@/components/pack/events/eventStore';
import { FONT_EMOJI, MARK_EMOJI, WISH_EMOJI, eventEmoji } from '@/components/pack/mapnotes/markEmoji';
import { EVENTS_LIVE } from '@/lib/packFlags';
import { sizedUrl } from '@/services/cloudinaryService';
import { agoLabel } from './feedData';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;

export type MapAdd =
  | { k: 'note'; id: string; at: number; n: MapNote }
  | { k: 'wish'; id: string; at: number; w: WishPin }
  | { k: 'event'; id: string; at: number; e: EventItem };

/** Najnovšie pridania na mapu (značky + TRIPWISH + podujatia), najnovšie prvé. Chyba = prázdno. */
export function useMapAdds(limit = 6): MapAdd[] {
  const [adds, setAdds] = useState<MapAdd[]>([]);
  useEffect(() => {
    let on = true;
    (async () => {
      // ZNAČKY (parkovisko, tip, voda…) a TRIPWISH do feedu NEJDÚ (Matej 26. 10. 2026, kolo 4: *„tripwish
      // parkovisko tip atď. by som do feedu nedával"*) — ostávajú na /map. Z pridaní na mapu ide len podujatie.
      const events = EVENTS_LIVE ? await fetchEvents(false).catch(() => [] as EventItem[]) : [];
      const out: MapAdd[] = events
        .map((e) => ({ k: 'event' as const, id: `e:${e.id}`, at: e.createdAt || 0, e }))
        .sort((a, b) => b.at - a.at).slice(0, limit);
      if (on) setAdds(out);
    })();
    return () => { on = false; };
  }, [limit]);
  return adds;
}

export const FEED_MAP_CSS = `
.pfm{overflow:hidden;}
.pfm-head{display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;}
.pfm-head .pk-medallion{width:${PACK_AVATAR.head}px;height:${PACK_AVATAR.head}px;font:600 ${TX.body}px/1 ${FONT_UI};color:${T.inkWarm};}
.pfm-who{min-width:0;flex:1;}
.pfm-who b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: meno */
.pfm-who small{font-size:${TX.label}px;color:${T.inkWarm};}
.pfm-body{display:flex;gap:${S.md}px;align-items:flex-start;padding:0 ${S.md}px ${S.md}px;}
.pfm-mark{flex:none;width:48px;height:48px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;background:${T.card};border:2px solid ${T.brandBlueLite};
  font-family:${FONT_EMOJI};font-size:${TX.h2}px;line-height:1;}
.pfm-tx{min-width:0;flex:1;}
.pfm-tx h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.body}px;line-height:1.3;color:${T.inkStrong};} /* písmo: nadpis */
.pfm-tx p{margin:${S.xs}px 0 0;font:400 ${TX.body}px/1.45 ${FONT_UI};color:${T.inkStrong};white-space:pre-line;overflow-wrap:anywhere;}
.pfm-tx small{display:block;margin-top:${S.xs}px;font:500 ${TX.label}px/1.3 ${FONT_UI};color:${T.inkWarm};}
.pfm-foot{display:flex;align-items:center;gap:${S.lg}px;padding:0 ${S.md}px ${S.md}px;}
.pfm-foot .lk{background:none;border:0;padding:0;cursor:pointer;color:${T.inkStrong};display:inline-flex;align-items:center;gap:${S.xs}px;font:600 ${TX.label}px/1 ${FONT_UI};transition:transform .12s ease;}
.pfm-foot .lk:active{transform:scale(.85);}
.pfm-foot .sp{flex:1;}
.pfm-go{border:1px solid ${LAPIS.deep};background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};border-radius:${PACK_R.field}px;cursor:pointer;
  padding:${S.sm}px ${S.md}px;font-family:${FONT_TITLE};font-weight:700;font-size:${TX.micro}px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;} /* písmo: cta */
`;

export function FeedMapCard({ add, liked, likes = 0, onLike }: { add: MapAdd; liked: boolean; likes?: number; onLike: () => void }) {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const { lang } = useLang();
  const navigate = useNavigate();
  // Skutočný lajk značky (`like_map_note`) — optimisticky, ako ostatné akcie feedu.
  const [noteLike, setNoteLike] = useState(add.k === 'note' ? { on: add.n.myLike, n: add.n.likes } : { on: false, n: 0 });

  let first = ''; let dog = ''; let photo: string | null = null;
  let emoji = ''; let title = ''; let text = ''; let sub = '';
  if (add.k === 'note') {
    const n = add.n;
    first = n.authorFirst ?? ''; photo = n.authorPhoto;
    emoji = MARK_EMOJI[n.kind] ?? MARK_EMOJI.note;
    title = tx(`pack.mapNotes.kind.${n.kind}`, n.kind);
    text = n.body; sub = tx('pack.feed.map.note', 'Left a note on the map');
  } else if (add.k === 'wish') {
    const w = add.w;
    first = w.ownerFirst ?? ''; dog = w.dogName ?? ''; photo = w.dogPhoto;
    emoji = WISH_EMOJI;
    title = w.placeName; text = w.note ?? ''; sub = tx('pack.feed.map.wish', 'Pinned a TRIPWISH');
  } else {
    const e = add.e;
    first = e.authorName; dog = e.authorDog ?? ''; photo = e.photoUrl ?? null;
    emoji = eventEmoji(e.kind);
    title = e.title; text = e.description ?? '';
    const when = e.startsIso ? new Date(e.startsIso).toLocaleDateString(intlLocale(lang), { day: 'numeric', month: 'long' }) : '';
    sub = [tx('pack.feed.map.event', 'Added an event'), when, e.venueName].filter(Boolean).join(' · ');
  }
  const name = [first, dog].filter(Boolean).join(' · ') || tx('pack.feed.map.member', 'A member of the pack');
  const pressLike = () => {
    if (add.k !== 'note') { onLike(); return; }
    const on = !noteLike.on;
    setNoteLike((s) => ({ on, n: Math.max(0, s.n + (on ? 1 : -1)) }));
    void likeMapNote(add.n.id, on).catch(() => setNoteLike((s) => ({ on: !on, n: Math.max(0, s.n + (on ? -1 : 1)) })));
  };
  const isOn = add.k === 'note' ? noteLike.on : liked;

  return (
    <article className="pfm">
      <div className="pfm-head">
        <span className="pk-medallion">{photo ? <img src={sizedUrl(photo, 80)} alt="" /> : name.charAt(0).toUpperCase()}</span>
        <div className="pfm-who">
          <b>{name}</b>
          <small>{[sub, agoLabel(add.at, lang)].filter(Boolean).join(' · ')}</small>
        </div>
      </div>
      <div className="pfm-body">
        <span className="pfm-mark" aria-hidden>{emoji}</span>
        <div className="pfm-tx">
          <h3>{title}</h3>
          {text && <p>{text}</p>}
        </div>
      </div>
      <div className="pfm-foot">
        <button type="button" className="lk" onClick={pressLike} aria-pressed={isOn} aria-label={tx('pack.feed.act.like', 'Like')}>
          <HandPaw size={24} on={isOn} />{(add.k === 'note' ? noteLike.n : likes) > 0 && (add.k === 'note' ? noteLike.n : likes)}
        </button>
        <span className="sp" />
        <button type="button" className="pfm-go" onClick={() => navigate(add.k === 'event' ? `/pack/map?event=${add.e.id}` : '/pack/map')}>
          {tx('pack.feed.trip.onMap', 'Open on the map')}
        </button>
      </div>
    </article>
  );
}
