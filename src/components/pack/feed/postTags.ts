// ŠTÍTKY PRÍSPEVKU — FEED 2 krok 5 (Matej 26. 10. 2026: *„namiesto tej otázky či je to v prírode alebo nie dal by som
// pillsy korešpondujúce s tým čo máme v profile … príspevky by mali svoj filter v podobe takých vlastných # resp. pills"*).
//
// Osem pilulok, pod textom pri pridaní (vyber 1–2, voliteľné, BEZ predvoľby) a tie isté ako filter nad feedom.
// Ukladá sa do `posts.tags` ako `t:<kľúč>` — žiadna migrácia (lock architektura-pack §4.3: príspevok nemá typ, má štítky).
// „Výlety a príroda" preberá rolu starej otázky: príspevok s `t:trip` sa vo feede ukladá ako 🎯 TRIPWISH.
// Starý štítok `nature` (FEED 2, 26. 10. ráno) sa číta ako `t:trip`.
import { TAG_NATURE, type MePost } from '@/components/pack/profile/mePosts';

export const POST_TAG_PREFIX = 't:';
/** Najviac toľko pilulok na príspevok. */
export const POST_TAG_MAX = 2;

export interface PostTagDef {
  /** hodnota v `posts.tags` */
  tag: string;
  i18n: string;
  fallback: string;
  /** hand-drawn ikonka z `public/icons/pack/` — naklikal Matej 26. 10. 2026 (nákres `temy-ikony`, `vyber.json`) */
  icon: string;
  /** pigment, ktorým sa znak vyleje pri výbere (kolo 7, Matej 27. 10.: *„daj 1"*, hárok `temy-kamen/ziara.html`) */
  color: string;
}

export const POST_TAGS: PostTagDef[] = [
  { tag: 't:trip', i18n: 'pack.feed.tag.trip', fallback: 'Trips & nature', icon: 'pin', color: '#7A2FBF' },
  { tag: 't:fun', i18n: 'pack.feed.tag.fun', fallback: 'Fun & chill', icon: 'ball', color: '#D0711F' },
  { tag: 't:train', i18n: 'pack.feed.tag.train', fallback: 'Training & coach', icon: 'trophy-cup', color: '#1E44C0' },
  { tag: 't:tips', i18n: 'pack.feed.tag.tips', fallback: 'Tips & tricks', icon: 'puzzle', color: '#2F8A4E' },
  { tag: 't:health', i18n: 'pack.feed.tag.health', fallback: 'Health & food', icon: 'bow', color: '#7E9418' },
  { tag: 't:learn', i18n: 'pack.feed.tag.learn', fallback: 'Knowledge', icon: 'graduate', color: '#118A93' },
  { tag: 't:help', i18n: 'pack.feed.tag.help', fallback: 'Helping dogs', icon: 'hut', color: '#C23B2A' },
  { tag: 't:life', i18n: 'pack.feed.tag.life', fallback: 'Dog life', icon: 'dogsphinx', color: '#B02F7C' },
];

/** Témy príspevku; starý `nature` = `t:trip`. */
export function postTopics(p: Pick<MePost, 'tags'>): string[] {
  const out = p.tags.filter((x) => x.startsWith(POST_TAG_PREFIX));
  if (p.tags.includes(TAG_NATURE) && !out.includes('t:trip')) out.push('t:trip');
  return out;
}
