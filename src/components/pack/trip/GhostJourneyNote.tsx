// AINUBIS NA MAGISTRÁLE NA PREVZATIE (Matej 5. 10. 2026)
//
// „…pridaj info od ainubisa — že táto magistrála bola predvytvorená podľa oficiálnych dát
//  k trase — prešiel si ju? ak áno klikni a vyplň ju ako prvý (privlastni si ju)… človek
//  nemusí klikať trasu, lebo už je."
//
// Stojí v detaile výletu (PC panel v PackMap aj článok PackTripArticle), len kým je
// magistrála čiernobiela (`isGhostJourney`). Blok = AI-PALUBA z katalógu `PACK_BLOCKS` —
// hovorí AINUBIS, nie papyrus. Recept je ten istý ako `.cal-longev` v kalendári (hlava
// v kruhu, meno <span>AI</span>NUBIS); CTA je jeho zlato-oranžové, tvar 8 px ako každé CTA.
import ainubisFace from '@/assets/ainubis-head.webp';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { PACK_R, PACK_SHADOW, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';

const CSS = `
.gjn{display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px;border-radius:${PACK_R.card}px;
  padding:12px 16px;margin:12px 0;background:${AINUBIS.surface};border:1px solid ${AINUBIS.edge};
  box-shadow:${PACK_SHADOW.panel}}
.gjn-face{flex:0 0 auto;width:46px;height:46px;border-radius:50%;background:${AINUBIS.faceBg};
  box-shadow:${AINUBIS.faceRing};display:flex;align-items:center;justify-content:center;overflow:hidden}
.gjn-face img{height:82%;width:auto;display:block}
.gjn-txt{min-width:0;flex:1 1 220px;font-family:${FONT_UI};font-size:12px;line-height:1.55;color:${AINUBIS.inkDim};margin:0}
.gjn-ai{font-family:${FONT_TITLE};font-weight:700;letter-spacing:.02em;color:${AINUBIS.ink};white-space:nowrap}
.gjn-ai > span{color:${AINUBIS.aiInk};text-shadow:${AINUBIS.aiShadow}}
.gjn-cta{flex:0 0 auto;border:0;cursor:pointer;border-radius:${PACK_R.field}px;padding:8px 16px;
  background:${AINUBIS.ctaGrad};color:${AINUBIS.ctaInk};box-shadow:${AINUBIS.ctaShadow};
  font-family:${FONT_TITLE};font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
.gjn-cta:hover{background:${AINUBIS.ctaGradHover}}
`;

export function GhostJourneyNote({ onClaim }: { onClaim: () => void }) {
  const t = useT();
  return (
    <div className="gjn" role="note">
      <style>{CSS}</style>
      <span className="gjn-face" aria-hidden><img src={ainubisFace} alt="" /></span>
      <p className="gjn-txt">
        <span className="gjn-ai"><span>AI</span>NUBIS</span>{': '}
        {t('pack.trip.ghost.body')}
      </p>
      <button type="button" className="gjn-cta" onClick={onClaim}>{t('pack.trip.ghost.cta')}</button>
    </div>
  );
}
