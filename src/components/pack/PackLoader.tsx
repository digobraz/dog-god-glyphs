// PRECHOD MEDZI STRÁNKAMI V APPKE (Matej 10. 11. 2026): *„na pozadí je vidno staré tmavé pozadie s heroglyfmi
// a slovo načítavam… pozadie daj kľudne tmavomodré a k tomu ikonku ainubisa a text prepočítavam"*.
// Jeden povrch pre `RouteFallback` aj pre `loading` vetvy obrazoviek, len pod `APP_NEW`; web ostáva, ako bol.
// Kľúč textu je `ainubis.*` zámerne: `pack.*` sa počas načítania obrazovky ešte len sťahuje a vyskočil by surový kľúč.
import { useT } from '@/i18n/LanguageContext';
import { APP_NEW } from '@/lib/packFlags';
import { AINUBIS } from './ainubisSkin';
import { FONT_UI, PACK_HEAD, PACK_R, PACK_TEXT } from './packTheme';

const AI_LOGO = '/icons/ainubis-pes.webp'; // ten istý súbor ako AI_LOGO v ainubis/3d/zaklad.ts, tam by sa do hlavného balíka ťahal celý šat 3D

// Ikonka musí byť v pamäti skôr, než ju prvý prechod ukáže.
if (APP_NEW) new Image().src = AI_LOGO;

export function PackLoader() {
  const t = useT();
  return (
    <div
      role="status"
      style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: AINUBIS.surface }}
    >
      <span style={{ width: 64, height: 64, borderRadius: PACK_R.pill, background: AINUBIS.faceBg, boxShadow: AINUBIS.faceRing, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <img src={AI_LOGO} alt="" style={{ height: '78%', width: 'auto' }} />
      </span>
      <span style={{ fontFamily: FONT_UI, fontWeight: 500, letterSpacing: PACK_HEAD.label.letterSpacing, fontSize: PACK_TEXT.label, color: AINUBIS.inkDim }}>
        {t('ainubis.recalculating')}
      </span>
    </div>
  );
}
