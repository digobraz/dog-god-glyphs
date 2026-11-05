// KOSTRA FEEDU (5. 11. 2026) — sivé bloky namiesto „NAČÍTAVAM…", kým príde obsah. Matej: „ig aj fb majú takú
// animáciu blokov… a zachvilku sa doplnia obsahom". Kópia rozmerov z `FeedTop.tsx` a `FeedTopics.tsx`:
// keď sa zmení karta, zmeň ju aj tu, inak obsah pri príchode poskočí. Recept = KOSTRA v `packTheme.ts`.
import { PACK_R, PACK_SPACE, SKELETON_CSS } from '@/components/pack/packTheme';

const S = PACK_SPACE;
const CSS = `${SKELETON_CSS}
.pks-row{display:flex;gap:${S.sm}px;overflow:hidden;margin:0 -${S.lg}px;padding:0 ${S.lg}px;}
.pks-label{width:136px;height:${S.md}px;margin:0 0 ${S.sm}px;}
.pks-dog{flex:none;width:104px;height:140px;border-radius:${PACK_R.tile}px;}
.pks-trip{flex:none;width:168px;height:182px;border-radius:${PACK_R.tile}px;}
.pks-topic{flex:none;width:72px;height:72px;border-radius:${PACK_R.pill}px;}
.pks-post{height:320px;border-radius:${PACK_R.card}px;}
.pks-page{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:${S.lg}px;padding:${S.lg}px;}
`;
const times = (n: number) => Array.from({ length: n }, (_, i) => i);

export function SkelDogs() {
  return <div className="pks-row" aria-hidden><style>{CSS}</style>{times(4).map((i) => <span key={i} className="pk-skel pks-dog" />)}</div>;
}
export function SkelTrips() {
  return (
    <section aria-hidden>
      <style>{CSS}</style>
      <div className="pk-skel pks-label" />
      <div className="pks-row">{times(3).map((i) => <span key={i} className="pk-skel pks-trip" />)}</div>
    </section>
  );
}
export function SkelPost() {
  return <div className="pk-skel pks-post" aria-hidden><style>{CSS}</style></div>;
}
/** Celá prvá obrazovka: pred prvým vykreslením FEEDu (prvé prihlásenie na zariadení, sťahovanie kódu). */
export function FeedSkeleton() {
  return (
    <div className="pks-page" aria-hidden>
      <style>{CSS}</style>
      <SkelTrips />
      <div className="pks-row">{times(4).map((i) => <span key={i} className="pk-skel pks-topic" />)}</div>
      <SkelPost />
    </div>
  );
}
