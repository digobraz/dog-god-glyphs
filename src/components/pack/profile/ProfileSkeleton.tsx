// KOSTRA CUDZIEHO PROFILU (5. 11. 2026) — sivé bloky namiesto „NAČÍTAVAM…", kým príde člen.
// Kópia rozmerov z `meHead.tsx`: keď sa zmení hlavička, zmeň ju aj tu, inak obsah pri príchode poskočí.
import { PACK_R, PACK_SPACE, PACK_TOPROW, SKELETON_CSS } from '@/components/pack/packTheme';
import { COVER_H } from './meHead';

const S = PACK_SPACE;
const TOP = `(env(safe-area-inset-top, 0px) + ${PACK_TOPROW.content}px)`;
const CSS = `${SKELETON_CSS}
.pfs{margin:calc(-1 * ${TOP}) -${S.lg}px 0;padding-top:calc(${TOP});}
.pfs-cover{height:${COVER_H.m + 20}px;border-radius:0;-webkit-mask-image:linear-gradient(180deg,#000 42%,transparent 100%);mask-image:linear-gradient(180deg,#000 42%,transparent 100%);}
.pfs-body{padding:0 ${S.lg}px;}
.pfs-who{display:flex;align-items:flex-end;gap:${S.sm}px;margin-top:-109px;position:relative;}
.pfs-av{flex:none;width:120px;height:120px;border-radius:${PACK_R.pill}px;}
.pfs-name{width:50%;height:${S.xl}px;margin-bottom:${S.xxxl}px;}
.pfs-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:${S.md}px;margin-top:${S.xxl}px;}
.pfs-stat{height:${S.xxxl}px;}
.pfs-cta{height:${S.xxl + S.sm}px;margin-top:${S.md}px;border-radius:${PACK_R.field}px;}
@media (min-width:768px){.pfs-cover{height:${COVER_H.pc + 20}px;}}
`;

export function ProfileSkeleton() {
  return (
    <div className="pfs" aria-hidden>
      <style>{CSS}</style>
      <span className="pk-skel pfs-cover" />
      <div className="pfs-body">
        <div className="pfs-who">
          <span className="pk-skel pfs-av" />
          <span className="pk-skel pfs-name" />
        </div>
        <div className="pfs-stats">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="pk-skel pfs-stat" />)}</div>
        <span className="pk-skel pfs-cta" />
      </div>
    </div>
  );
}
